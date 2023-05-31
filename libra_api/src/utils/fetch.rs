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

const GPT: &'static str = "You are a sophisticated AI, built to formulate precise keywords for book search queries. Your job is to devise keywords deeply connected to the user's interest, with a focus on educational material. Construct each keyword alongside pertinent ones and directly related mathematical concepts when relevant. Each keyword should be followed by its English translation. For example, if a user is interested in 'Quantum Physics', your keywords might be '양자 물리, Quantum Physics, 양자역학, Quantum Mechanics'. Remember to always include the main keyword. Now, generate keywords for the user's query.";
const RATE: &'static str = "As an AI, I'll evaluate how closely your study query matches a book's content, considering its depth, specificity, and direct relation. Provide your query and book title, and I'll score its relevance from 1 to 10 - with 1 being minimally relevant and 10 highly relevant. Your output MUST be a 'rating number' only, without any extra text.";

lazy_static! {
    static ref HTTP_CLIENT: reqwest::Client = reqwest::Client::builder()
        .timeout(Duration::from_secs(180))
        .connect_timeout(Duration::from_secs(180))
        .build()
        .unwrap();
}

pub async fn generate_query(
    interest: &str,
    openai_client: &async_openai::Client,
) -> Result<Vec<String>, anyhow::Error> {
    println!("Starting...");
    let request = CreateChatCompletionRequestArgs::default()
    .max_tokens(150_u16)
    .model("gpt-4")
    .messages([
        ChatCompletionRequestMessageArgs::default()
        .role(Role::System)
        // .content("You are an AI trained to generate search queries for book titles based on user prompts. Your goal is to return a list of unique keywords that are highly relevant to the user's interest but cover a wide range of material within the topic, specifically focusing on higher education level material. Make sure each keyword is relevant to the topic of interest by combining the topic keyword with other relevant keywords, including relevant mathematical concepts when appropriate. For example, if the user inputs 'Want to learn psychology from scratch', return a comma-separated string of keywords like 'Psychology, Psychology Basics, Psychology Core Concepts, Understanding Psychology, Introduction to Psychology'. For a topic like 'Artificial Intelligence Basics', include keywords such as 'Linear Algebra, Probability, Statistics, Calculus'. Must contain at least the core keyword, in there it was Psychology (심리학)")
        .content(GPT)
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
    println!("Loaded...");

    let query_text = response.choices[0].message.content.clone();
    let queries: Vec<String> = query_text
        .split(", ")
        .map(|s| s.trim().to_string())
        .collect();
    Ok(queries)
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
    let response = HTTP_CLIENT.get(&url).send().await?.json::<Value>().await?;
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
            let is_rentable = matches!(is_charged, Some(false));
            rent_status.entry(location_name).or_insert(is_rentable);
        }
    }
    Ok(rent_status)
}
