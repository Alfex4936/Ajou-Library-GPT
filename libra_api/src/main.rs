use actix_cors::Cors;
use actix_files as fs;
use actix_web::{middleware, web, App, HttpServer};
use dotenv::dotenv;
use libra_api::{routes::recommend, SERVER};
use std::env;
use std::time::Duration;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    // Load the server address from an environment variable
    let server_address = env::var("SERVER_ADDRESS").unwrap_or_else(|_| String::from(SERVER));

    // Start the HTTP server
    HttpServer::new(move || {
        // Set up CORS with a maximum age of 3600 seconds, allowing only GET and POST methods
        let cors = Cors::permissive();

        App::new()
            .wrap(cors)
            .wrap(middleware::Logger::default()) // Use the default logger for request/response logs
            .wrap(middleware::Compress::default()) // compress responses
            .wrap(
                middleware::DefaultHeaders::new()
                    .add((
                        "Strict-Transport-Security",
                        "max-age=31536000; includeSubDomains",
                    ))
                    .add(("X-Content-Type-Options", "nosniff"))
                    .add(("X-Frame-Options", "SAMEORIGIN")),
            )
            .service(
                // Mount the notice routes under the "/recommend" path
                web::scope("/api/recommend").configure(recommend::init_recommender),
            )
            .service(fs::Files::new("/", "./google-clone/build").index_file("index.html"))
    })
    .keep_alive(Duration::from_secs(600)) // Keep the connection alive for seconds
    .bind(server_address)? // Bind to the server address specified in the rustserver module
    .run() // Start the HTTP server
    .await
}
