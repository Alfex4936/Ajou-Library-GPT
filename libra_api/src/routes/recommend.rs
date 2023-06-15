use std::collections::HashMap;

use actix_web::{
    post,
    web::{self, Json},
    HttpResponse, Responder,
};
use futures::select;
use futures::stream::FuturesUnordered;
use futures::stream::StreamExt;
use serde_json::json;

use crate::utils::fetch::*;

#[derive(Deserialize)]
struct RecommendInfo {
    api: String,
    interest: String,
    k: u8,
    model: String,
}

#[derive(Serialize)]
struct Query {
    query: String,
}

#[derive(Serialize)]
struct RecommendedBook {
    book_id: String,
    details: String,
    rent_place: String,
    rentable: bool,
}

#[derive(Serialize)]
struct RecommendedRISS {
    id: String,
    details: String,
}

#[post("/book")]
async fn recommend_book(info: Json<RecommendInfo>) -> impl Responder {
    let k = info.k;
    let interest = (*info.interest).trim();
    let model = (*info.model).trim();
    let openai_client = async_openai::Client::new().with_api_key(&info.api);
    let queries = generate_query(interest, model, &openai_client).await;
    if queries.is_empty() {
        return HttpResponse::BadRequest().json(json!({
            "queries": Vec::<String>::new(),
            "books": Vec::<String>::new(),
            "riss": Vec::<String>::new(),
        }));
    }

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

    // let recommended_books: Vec<RecommendedBook> = recommended_books
    //     .into_iter()
    //     .map(|(book_id, details)| RecommendedBook { book_id, details })
    //     .collect();

    let recommended_books: Vec<RecommendedBook> = futures::stream::iter(recommended_books)
        .then(|(book_id, details)| async move {
            // Extract the book_id_num for use in get_rent_status_and_locations
            let book_id_num = book_id.split('_').last().unwrap();

            // Use get_rent_status_and_locations to get rent_status
            let rent_status = get_rent_status_and_locations(book_id_num).await.unwrap();

            // Calculate rentable_locations
            let rentable_locations: Vec<&str> = rent_status
                .iter()
                .filter_map(|(k, v)| if *v { Some(k.as_str()) } else { None })
                .collect();

            // Create the rent_status and rent_place variables
            let rentable = !rentable_locations.is_empty();
            let rent_place = rentable_locations.join(", ");

            // Return the constructed RecommendedBook
            RecommendedBook {
                book_id,
                details,
                rent_place,
                rentable,
            }
        })
        .collect::<Vec<RecommendedBook>>()
        .await;

    HttpResponse::Ok().json(json!({
        "queries": queries,
        "recommendation": recommended_books,
    }))
}

#[post("/riss")]
async fn recommend_riss(info: Json<RecommendInfo>) -> impl Responder {
    let k = info.k;
    let interest = (*info.interest).trim();
    let model = (*info.model).trim();
    let openai_client = async_openai::Client::new().with_api_key(&info.api);
    let queries = generate_query(interest, model, &openai_client).await;
    if queries.is_empty() {
        return HttpResponse::BadRequest().json(json!({
            "queries": Vec::<String>::new(),
            "books": Vec::<String>::new(),
            "riss": Vec::<String>::new(),
        }));
    }

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
        .map(|(id, details)| RecommendedRISS { id, details })
        .collect();

    HttpResponse::Ok().json(json!({
        "queries": queries,
        "recommendation": recommended_riss,
    }))
}

#[post("/all")]
async fn recommend_all(info: Json<RecommendInfo>) -> impl Responder {
    let k = info.k;
    let interest = (*info.interest).trim();

    let model = (*info.model).trim();
    let openai_client = async_openai::Client::new().with_api_key(&info.api);
    let queries: Vec<String> = generate_query(interest, model, &openai_client).await;

    if queries.is_empty() {
        return HttpResponse::BadRequest().json(json!({
            "queries": Vec::<String>::new(),
            "books": Vec::<String>::new(),
            "riss": Vec::<String>::new(),
        }));
    }
    let queries_clone = queries.clone();

    let mut book_embeddings = HashMap::new();
    let mut book_id_to_data = HashMap::new();

    let mut riss_embeddings = HashMap::new();
    let mut riss_id_to_data = HashMap::new();

    let mut fetch_book_tasks = FuturesUnordered::new();
    let mut fetch_riss_tasks = FuturesUnordered::new();

    for keyword in &queries {
        fetch_riss_tasks.push(fetch_riss_with_embeddings(keyword, &openai_client));

        fetch_book_tasks.push(fetch_books_with_embeddings(keyword, &openai_client));
    }

    loop {
        select! {
            books_with_embeddings = fetch_book_tasks.select_next_some() => {
                let books_with_embeddings = books_with_embeddings.unwrap();
                for (book, book_embedding) in books_with_embeddings {
                    let book_id = format!("book_id_{}", book["id"]);
                    book_embeddings.insert(book_id.clone(), book_embedding);
                    book_id_to_data.insert(
                        book_id.clone(),
                        format!(
                            "{} by {}, published by {}",
                            book["titleStatement"], book["author"], book["publication"]
                        ),
                    );
                    // println!("{:#?}", book);
                }
            }
            riss_with_embeddings = fetch_riss_tasks.select_next_some() => {
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
            complete => {
                if fetch_book_tasks.is_empty() && fetch_riss_tasks.is_empty() {
                    break;
                }
            }
        }
    }

    let student_embedding = match fetch_embedding(interest.to_string(), &openai_client).await {
        Ok(embedding) => embedding,
        Err(e) => {
            return HttpResponse::InternalServerError().json(json!({
                "error": format!("Failed to fetch student embedding: {}", e),
            }))
        }
    };

    let recommended_books = recommend_books(
        student_embedding.clone(),
        book_embeddings,
        book_id_to_data,
        k.into(),
        0.8,
    );

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

    let recommended_books: Vec<RecommendedBook> = futures::stream::iter(recommended_books)
        .then(|(book_id, details)| async move {
            let book_id_num = book_id.split('_').last().unwrap();
            let rent_status = get_rent_status_and_locations(book_id_num)
                .await
                .map_err(|e| format!("Failed to get rent status: {}", e))?;

            let rentable_locations: Vec<&str> = rent_status
                .iter()
                .filter_map(|(k, v)| if *v { Some(k.as_str()) } else { None })
                .collect();

            let rentable = !rentable_locations.is_empty();
            let rent_place = rentable_locations.join(", ");
            Ok::<_, String>(RecommendedBook {
                book_id,
                details,
                rent_place,
                rentable,
            })
        })
        .filter_map(|res| async move {
            match res {
                Ok(book) => Some(book),
                Err(e) => {
                    eprintln!("Error: {}", e); // Log the error
                    None
                }
            }
        })
        .collect::<Vec<RecommendedBook>>()
        .await;

    let recommended_riss: Vec<RecommendedRISS> = recommended_riss
        .into_iter()
        .map(|(id, details)| RecommendedRISS { id, details })
        .collect();

    HttpResponse::Ok().json(json!({
        "queries": queries,
        "books": recommended_books,
        "riss": recommended_riss,
    }))
}

pub fn init_recommender(cfg: &mut web::ServiceConfig) {
    cfg.service(recommend_all);
    cfg.service(recommend_book);
    cfg.service(recommend_riss);
}
