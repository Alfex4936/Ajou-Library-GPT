use std::collections::HashMap;
use std::env;
use std::error::Error;
use std::io;
use std::io::Write;

use async_openai::{
    types::{
        ChatCompletionRequestMessageArgs, CreateChatCompletionRequestArgs,
        CreateEmbeddingRequestArgs, Role,
    },
    Client,
};
use dotenv::dotenv;
use futures::future::join_all;
use futures::stream::StreamExt;

use reqwest::Client as ReqwestClient;
use serde_json::Value;

// use ndarray::{Array1, Array2, Axis};
// use ndarray_linalg::Norm;

// fn cosine_similarity(x: &Array2<f32>, y: &Array2<f32>) -> Array2<f32> {
//     let x_normalized = x.map_axis(Axis(1), |v| v.div(v.norm()));
//     let y_normalized = y.map_axis(Axis(1), |v| v.div(v.norm()));
//     let dot_product = x_normalized.dot(&y_normalized.t());
//     dot_product
// }

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    dotenv().ok();
    let api_key = env::var("API_KEY").expect("API_KEY not set");

    let openai_client = Client::new().with_api_key(api_key.clone());
    let reqwest_client = ReqwestClient::new();

    print!("도서관 검색: ");
    io::stdout().flush().unwrap(); // Make sure the prompt is printed before waiting for input

    let mut interest = String::new();
    io::stdin()
        .read_line(&mut interest)
        .expect("Failed to read line");

    interest = interest.trim().to_string(); // Remove trailing newline character

    print!("GPT-4: thinking...");
    io::stdout().flush().unwrap(); // Flush the output

    let queries = generate_query(interest.clone(), &openai_client).await?;
    println!("\rGPT-4가 생성한 쿼리: {:?}", queries);

    let mut book_embeddings = HashMap::new();
    let mut book_id_to_data = HashMap::new();

    let fetch_book_tasks: Vec<_> = queries
        .iter()
        .map(|keyword| fetch_books_with_embeddings(keyword, &reqwest_client, &openai_client))
        .collect();

    let all_books_results = join_all(fetch_book_tasks).await;

    for books_with_embeddings in all_books_results {
        for (book, book_embedding) in books_with_embeddings? {
            let book_id = format!("book_id_{}", book["id"].to_string());
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

    let student_embedding = fetch_embedding(interest, &openai_client).await?;
    let recommended_books =
        recommend_books(student_embedding, book_embeddings, book_id_to_data, 5, 0.6);

    for (book_id, book_info) in recommended_books {
        let book_id_num = book_id.split('_').last().unwrap();
        let rent_status = get_rent_status_and_locations(book_id_num, &reqwest_client).await?;
        let rentable_locations: Vec<&str> = rent_status
            .iter()
            .filter_map(|(k, v)| if *v { Some(k.as_str()) } else { None })
            .collect();

        if rentable_locations.is_empty() {
            println!("{}: {} (현재 대여 불가)", book_id, book_info);
        } else {
            let locations_str = rentable_locations.join(", ");
            println!("{}: {} (대여 위치: {})", book_id, book_info, locations_str);
        }
    }

    println!("\nPress Enter to exit...");
    io::stdin().read_line(&mut String::new()).unwrap();

    Ok(())
}

async fn generate_query(
    interest: String,
    openai_client: &Client,
) -> Result<Vec<String>, Box<dyn Error>> {
    let request = CreateChatCompletionRequestArgs::default()
        .max_tokens(150 as u16)
        .model("gpt-4")
        .messages([
            ChatCompletionRequestMessageArgs::default()
                .role(Role::System)
                .content("You are an AI trained to generate search queries for book titles based on user prompts. Your goal is to return a list of unique keywords that are highly relevant to the user's interest but cover a wide range of material within the topic, specifically focusing on higher education level material. Make sure each keyword is relevant to the topic of interest by combining the topic keyword with other relevant keywords, including relevant mathematical concepts when appropriate. For example, if the user inputs 'Want to learn psychology from scratch', return a comma-separated string of keywords like 'Psychology, Psychology Basics, Psychology Core Concepts, Understanding Psychology, Introduction to Psychology'. For a topic like 'Artificial Intelligence Basics', include keywords such as 'Linear Algebra, Probability, Statistics, Calculus'. Must contain at least the core keyword, in there it was Psychology (심리학)")
                .build()?,
            ChatCompletionRequestMessageArgs::default()
                .role(Role::User)
                .content(&format!(
                    "Generate a bilingual search query (Korean and English) for the following interest: {}",
                    interest
                ))
                .build()?,
        ])
        .build()?;

    let response = openai_client.chat().create(request).await?;

    let query_text = response.choices[0].message.content.clone();
    let queries: Vec<String> = query_text.split(", ").map(|s| s.to_string()).collect();
    Ok(queries)
}

async fn fetch_books_with_embeddings(
    keyword: &str,
    reqwest_client: &ReqwestClient,
    openai_client: &Client,
) -> Result<Vec<(Value, Vec<f32>)>, Box<dyn Error>> {
    let books: Vec<Value> = fetch_books(keyword, reqwest_client).await?;
    let mut book_embedding_futures = futures::stream::FuturesUnordered::new();

    for book in &books {
        let book_info = format!(
            "{} by {}, published by {}",
            book["titleStatement"], book["author"], book["publication"]
        );
        let book_info_clone = book_info.clone();
        let openai_client = openai_client.clone();
        book_embedding_futures.push(async move {
            let book_embedding = fetch_embedding(book_info_clone, &openai_client).await?;
            Ok((book.clone(), book_embedding))
        });
    }

    let mut books_with_embeddings: Vec<(Value, Vec<f32>)> = Vec::new();
    while let Some(result) = book_embedding_futures.next().await {
        match result {
            Ok((book, book_embedding)) => books_with_embeddings.push((book, book_embedding)),
            Err(e) => return Err(e),
        }
    }

    Ok(books_with_embeddings)
}

async fn fetch_embedding(text: String, openai_client: &Client) -> Result<Vec<f32>, Box<dyn Error>> {
    let request = CreateEmbeddingRequestArgs::default()
        .model("text-embedding-ada-002")
        .input([text])
        .build()?;

    let response = openai_client.embeddings().create(request).await?;
    let embedding = response.data[0].embedding.clone();
    Ok(embedding)
}

fn recommend_books(
    student_embedding: Vec<f32>,
    book_embeddings: HashMap<String, Vec<f32>>,
    book_id_to_data: HashMap<String, String>,
    top_k: usize,
    threshold: f32,
) -> HashMap<String, String> {
    let mut similarities = book_embeddings
        .iter()
        .map(|(book_id, book_embedding)| {
            let similarity = cosine_similarity(&student_embedding, book_embedding);
            (similarity, book_id)
        })
        .collect::<Vec<_>>();

    similarities.sort_unstable_by(|a, b| a.0.partial_cmp(&b.0).unwrap().reverse());

    let mut recommended_books = HashMap::new();
    for i in 0..top_k {
        if similarities[i].0 >= threshold {
            let book_id = similarities[i].1;
            recommended_books.insert(
                book_id.clone(),
                book_id_to_data.get(book_id).unwrap().clone(),
            );
        }
    }
    recommended_books
}

fn cosine_similarity(a: &[f32], b: &[f32]) -> f32 {
    let dot_product: f32 = a.iter().zip(b.iter()).map(|(x, y)| x * y).sum();
    let norm_a: f32 = a.iter().map(|x| x.powi(2)).sum::<f32>().sqrt();
    let norm_b: f32 = b.iter().map(|x| x.powi(2)).sum::<f32>().sqrt();
    dot_product / (norm_a * norm_b)
}

async fn fetch_books(
    keyword: &str,
    reqwest_client: &ReqwestClient,
) -> Result<Vec<Value>, Box<dyn Error>> {
    let url = format!("https://library.ajou.ac.kr/pyxis-api/1/collections/1/search?all=1|k|a|{}&facet=false&max=10", keyword);
    let response = reqwest_client
        .get(&url)
        .send()
        .await?
        .json::<Value>()
        .await?;
    let books = response["data"]["list"].as_array().unwrap().clone();
    Ok(books)
}

async fn get_rent_status_and_locations(
    book_id: &str,
    reqwest_client: &ReqwestClient,
) -> Result<HashMap<String, bool>, Box<dyn Error>> {
    let url = format!(
        "https://library.ajou.ac.kr/pyxis-api/1/biblios/{}/items",
        book_id
    );
    let response = reqwest_client
        .get(&url)
        .send()
        .await?
        .json::<Value>()
        .await?;
    let items = &response["data"];
    let mut rent_status = HashMap::new();
    for (_key, item_list) in items.as_object().unwrap() {
        for item in item_list.as_array().unwrap() {
            let location_name = item["location"]["name"].as_str().unwrap().to_string();
            let circulation_state = item.get("circulationState");
            let is_charged = match circulation_state {
                Some(cs) => cs.get("isCharged").and_then(Value::as_bool),
                None => None,
            };
            let is_rentable = match is_charged {
                Some(false) => true,
                _ => false,
            };
            rent_status.entry(location_name).or_insert(is_rentable);
        }
    }
    Ok(rent_status)
}
