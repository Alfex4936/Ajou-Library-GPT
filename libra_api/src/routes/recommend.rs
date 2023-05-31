use std::collections::HashMap;

use actix_web::{
    post,
    web::{self, Json},
    HttpResponse, Responder,
};
use futures::stream::FuturesUnordered;
use futures::stream::StreamExt;
use serde_json::json;

use crate::utils::fetch::*;

#[derive(Deserialize)]
struct RecommendInfo {
    api: String,
    interest: String,
    k: u8,
}

#[derive(Serialize)]
struct Query {
    query: String,
}

#[derive(Serialize)]
struct RecommendedBook {
    book_id: String,
    details: String,
}

#[derive(Serialize)]
struct RecommendedRISS {
    title: String,
    publisher: String,
}

#[post("/book")]
async fn recommend_book(info: Json<RecommendInfo>) -> impl Responder {
    let k = info.k;
    let interest = (*info.interest).trim();
    let openai_client = async_openai::Client::new().with_api_key(&info.api);
    let queries = generate_query(interest, &openai_client).await;
    let queries_clone = queries.clone();

    let mut book_embeddings = HashMap::new();
    let mut book_id_to_data = HashMap::new();

    let mut fetch_book_futures = FuturesUnordered::new();

    for keyword in &queries {
        fetch_book_futures.push(fetch_books_with_embeddings(keyword, &openai_client));
    }

    while let Some(books_with_embeddings) = fetch_book_futures.next().await {
        let books_with_embeddings = books_with_embeddings.unwrap();
        for (book, book_embedding) in books_with_embeddings {
            let book_id = format!("book_id_{}", book["id"]);
            let title_statement = book["titleStatement"]
                .as_str()
                .unwrap_or("No title")
                .replace('"', "");
            let author = book["author"]
                .as_str()
                .unwrap_or("No author")
                .replace('"', "");
            let publication = book["publication"]
                .as_str()
                .unwrap_or("No publication")
                .replace('"', "");

            book_id_to_data.insert(
                book_id.clone(),
                format!(
                    "{} by {}, published by {}",
                    title_statement, author, publication
                ),
            );

            book_embeddings.insert(book_id.clone(), book_embedding);
            book_id_to_data.insert(
                book_id.clone(),
                format!(
                    "{} by {}, published by {}",
                    book["titleStatement"], book["author"], book["publication"]
                ),
            );
        }
    }

    let student_embedding = fetch_embedding(interest.to_string(), &openai_client)
        .await
        .unwrap();

    let recommended_books = recommend_books(
        student_embedding,
        book_embeddings,
        book_id_to_data,
        k.into(),
        0.8,
    );

    let queries: Vec<Query> = queries_clone
        .into_iter()
        .map(|q| Query { query: q })
        .collect();

    let recommended_books: Vec<RecommendedBook> = recommended_books
        .into_iter()
        .map(|(book_id, details)| RecommendedBook { book_id, details })
        .collect();

    HttpResponse::Ok().json(json!({
        "queries": queries,
        "recommendation": recommended_books,
    }))
}

#[post("/riss")]
async fn recommend_riss(info: Json<RecommendInfo>) -> impl Responder {
    let k = info.k;
    let interest = (*info.interest).trim();
    let openai_client = async_openai::Client::new().with_api_key(&info.api);
    let queries = generate_query(interest, &openai_client).await;
    let queries_clone = queries.clone();

    let mut riss_embeddings = HashMap::new();
    let mut riss_id_to_data = HashMap::new();

    let mut fetch_riss_futures = FuturesUnordered::new();

    for keyword in &queries {
        fetch_riss_futures.push(fetch_riss_with_embeddings(keyword, &openai_client));
    }

    while let Some(riss_with_embeddings) = fetch_riss_futures.next().await {
        let riss_with_embeddings = riss_with_embeddings.unwrap();
        for (riss, riss_embedding) in riss_with_embeddings {
            let riss_id = format!("riss_id_{}", riss["controlNo"]);
            riss_embeddings.insert(riss_id.clone(), riss_embedding);
            riss_id_to_data.insert(
                riss_id.clone(),
                format!(
                    "{} by {}, published by {}",
                    riss["title"], riss["author"], riss["publisher"]
                ),
            );
        }
    }

    let student_embedding = fetch_embedding(interest.to_string(), &openai_client)
        .await
        .unwrap();

    let recommended_riss = recommend_books(
        student_embedding,
        riss_embeddings,
        riss_id_to_data,
        k.into(),
        0.8,
    );

    let queries: Vec<Query> = queries_clone
        .into_iter()
        .map(|q| Query { query: q })
        .collect();

    let recommended_riss: Vec<RecommendedRISS> = recommended_riss
        .into_iter()
        .map(|(title, publisher)| RecommendedRISS { title, publisher })
        .collect();

    HttpResponse::Ok().json(json!({
        "queries": queries,
        "recommendation": recommended_riss,
    }))
}

pub fn init_recommender(cfg: &mut web::ServiceConfig) {
    cfg.service(recommend_book);
    cfg.service(recommend_riss);
}
