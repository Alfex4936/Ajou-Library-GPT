use std::{collections::HashMap, time::Duration};

use async_openai::{
    types::{
        ChatCompletionRequestMessageArgs, CreateChatCompletionRequestArgs,
        CreateEmbeddingRequestArgs, Role,
    },
    Client,
};
use futures::TryFutureExt;
use futures::TryStreamExt;

use lazy_static::lazy_static;
use serde_json::Value;

use cached::proc_macro::cached;
use cached::SizedCache;

const PRE_USER: &str = "What should I study about computer science";
const PRE_ASSISTANT: &str =
    "알고리즘, Algorithm, 자료구조, Data Structure, 운영체제, Operating System, 네트워크, Network";
const GPT: &str = "You're Ajou Libra, an AI specialized in crafting precise keywords for book searches. Your mission is to produce keywords closely aligned with the user's educational interests, and also associated with related subjects or relevant mathematical concepts. Each keyword must be followed immediately by its English translation, structured as 'A in Korean, A in English'. The main keyword must always be included. The end result should be a seamless string of keywords derived from the user's input. For example, 'Quantum Physics' might lead to '양자 물리, Quantum Physics, 양자역학, Quantum Mechanics'. Your task now is to generate ONLY keywords, each matched with their English translation, all presented in a single continuous string.";
// const RATE: &str = "As an AI, I'll evaluate how closely your study query matches a book's content, considering its depth, specificity, and direct relation. Provide your query and book title, and I'll score its relevance from 1 to 10 - with 1 being minimally relevant and 10 highly relevant. Your output MUST be a 'rating number' only, without any extra text.";

lazy_static! {
    static ref HTTP_CLIENT: reqwest::Client = reqwest::Client::builder()
        .timeout(Duration::from_secs(180))
        .connect_timeout(Duration::from_secs(180))
        .build()
        .unwrap();
}

#[cached(
    type = "SizedCache<String, Vec<String>>",
    create = "{ SizedCache::with_size(100) }",
    convert = r#"{ format!("{}_{}", model.to_lowercase(), interest.to_lowercase()) }"#
)]
pub async fn generate_query(
    interest: &str,
    model: &str,
    openai_client: &async_openai::Client,
) -> Vec<String> {
    println!("Starting... {model}");
    let request = CreateChatCompletionRequestArgs::default()
        .max_tokens(150_u16)
        .model(model)
        .messages([
            ChatCompletionRequestMessageArgs::default()
                .role(Role::System)
                // .content("You are an AI trained to generate search queries for book titles based on user prompts. Your goal is to return a list of unique keywords that are highly relevant to the user's interest but cover a wide range of material within the topic, specifically focusing on higher education level material. Make sure each keyword is relevant to the topic of interest by combining the topic keyword with other relevant keywords, including relevant mathematical concepts when appropriate. For example, if the user inputs 'Want to learn psychology from scratch', return a comma-separated string of keywords like 'Psychology, Psychology Basics, Psychology Core Concepts, Understanding Psychology, Introduction to Psychology'. For a topic like 'Artificial Intelligence Basics', include keywords such as 'Linear Algebra, Probability, Statistics, Calculus'. Must contain at least the core keyword, in there it was Psychology (심리학)")
                .content(GPT)
                .build()
                .unwrap(),
            ChatCompletionRequestMessageArgs::default()
                .role(Role::User)
                .content(PRE_USER)
                .build()
                .unwrap(),
            ChatCompletionRequestMessageArgs::default()
                .role(Role::Assistant)
                .content(PRE_ASSISTANT)
                .build()
                .unwrap(),
            ChatCompletionRequestMessageArgs::default()
                .role(Role::User)
                .content(interest)
                .build()
                .unwrap(),
        ])
        .build()
        .unwrap();

    let response = match openai_client.chat().create(request).await {
        Ok(response) => response,
        Err(_) => return vec![],
    };
    println!("Loaded...");

    let query_text: String = response.choices[0].message.content.clone();

    let mut queries: Vec<String> = query_text
        .split(", ")
        .map(|s: &str| s.trim().to_string())
        .collect();

    if let Some(last) = queries.last_mut() {
        *last = last.trim_end_matches('.').to_string();
    }

    // println!("Queries: {:#?}", queries);

    queries
}

pub async fn fetch_books_with_embeddings(
    keyword: &str,
    openai_client: &Client,
) -> Result<Vec<(Value, Vec<f32>)>, anyhow::Error> {
    let books: Vec<Value> = fetch_books(keyword).await?;
    let book_embedding_futures = futures::stream::FuturesUnordered::new();

    for book in &books {
        let book_info = format!(
            "{} by {}, published by {}",
            book["titleStatement"], book["author"], book["publication"]
        );
        let book_info_clone = book_info.clone();
        // let openai_client = openai_client.clone();
        book_embedding_futures.push(
            fetch_embedding(book_info_clone, openai_client)
                .map_ok(move |book_embedding| (book.clone(), book_embedding)),
        );
    }

    let books_with_embeddings: Vec<(Value, Vec<f32>)> =
        book_embedding_futures.try_collect().await?;

    Ok(books_with_embeddings)
}

pub async fn fetch_riss_with_embeddings(
    keyword: &str,
    openai_client: &Client,
) -> Result<Vec<(Value, Vec<f32>)>, anyhow::Error> {
    let riss: Vec<Value> = fetch_riss(keyword).await?;
    let riss_embedding_futures = futures::stream::FuturesUnordered::new();

    for book in &riss {
        let book_info = format!(
            "{} by {}, published by {}",
            book["title"], book["author"], book["publisher"]
        );
        let book_info_clone = book_info.clone();
        riss_embedding_futures.push(
            fetch_embedding(book_info_clone, openai_client)
                .map_ok(move |book_embedding| (book.clone(), book_embedding)),
        );
    }

    let riss_with_embeddings: Vec<(Value, Vec<f32>)> = riss_embedding_futures.try_collect().await?;

    Ok(riss_with_embeddings)
}

pub async fn fetch_embedding(
    text: String,
    openai_client: &Client,
) -> Result<Vec<f32>, anyhow::Error> {
    let request = CreateEmbeddingRequestArgs::default()
        .model("text-embedding-ada-002")
        .input([text])
        .build()?;

    let response = openai_client.embeddings().create(request).await?;
    let embedding = response.data[0].embedding.clone();
    Ok(embedding)
}

pub fn recommend_books(
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
    for sim in similarities.iter().take(top_k) {
        if sim.0 >= threshold {
            let book_id = sim.1;
            recommended_books.insert(
                book_id.clone(),
                book_id_to_data.get(book_id).unwrap().clone(),
            );
        }
    }
    recommended_books
}

pub fn cosine_similarity(a: &[f32], b: &[f32]) -> f32 {
    let dot_product: f32 = a.iter().zip(b.iter()).map(|(x, y)| x * y).sum();
    let norm_a: f32 = a.iter().map(|x| x.powi(2)).sum::<f32>().sqrt();
    let norm_b: f32 = b.iter().map(|x| x.powi(2)).sum::<f32>().sqrt();
    dot_product / (norm_a * norm_b)
}

pub async fn fetch_books(keyword: &str) -> Result<Vec<Value>, anyhow::Error> {
    let url = format!("https://library.ajou.ac.kr/pyxis-api/1/collections/1/search?all=1|k|a|{}&facet=false&max=15", keyword);
    let response = HTTP_CLIENT.get(&url).send().await?.json::<Value>().await?;

    if response["code"] == "success.noRecord" {
        Ok(vec![])
    } else {
        let books = response["data"]["list"].as_array().unwrap().clone();
        Ok(books)
    }
}

pub async fn fetch_riss(keyword: &str) -> Result<Vec<Value>, anyhow::Error> {
    let url = format!(
        "https://library.ajou.ac.kr/pyxis-api/mashup-riss/T/{}?max=15",
        keyword
    );
    let response = HTTP_CLIENT.get(&url).send().await?.json::<Value>().await?;

    if response["code"] == "success.noRecord" {
        Ok(vec![])
    } else {
        let books = response["data"]["list"].as_array().unwrap().clone();
        Ok(books)
    }
}

pub async fn get_rent_status_and_locations(
    book_id: &str,
) -> Result<HashMap<String, bool>, anyhow::Error> {
    let url = format!(
        "https://library.ajou.ac.kr/pyxis-api/1/biblios/{}/items",
        book_id
    );
    // println!("{}", url);
    let response = match HTTP_CLIENT.get(&url).send().await {
        Ok(resp) => match resp.json::<Value>().await {
            Ok(json) => json,
            Err(_) => return Err(anyhow::Error::msg("Failed to parse JSON response")),
        },
        Err(_) => return Err(anyhow::Error::msg("HTTP request failed")),
    };

    let items = &response["data"];
    let mut rent_status = HashMap::new();
    for (_key, item_list) in items.as_object().unwrap() {
        for item in item_list.as_array().unwrap() {
            let location_name = match item["location"]["name"].as_str() {
                Some(name) => name.to_string(),
                None => return Err(anyhow::Error::msg("Failed to get location name")),
            };

            let circulation_state = item.get("circulationState");
            let is_charged = match circulation_state {
                Some(cs) => cs.get("isCharged").and_then(Value::as_bool),
                None => None,
            };
            let is_rentable = matches!(is_charged, Some(false));
            rent_status.entry(location_name).or_insert(is_rentable);
        }
    }
    Ok(rent_status)
}
