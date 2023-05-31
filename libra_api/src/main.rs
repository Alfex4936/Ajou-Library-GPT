use actix_cors::Cors;
use actix_web::{middleware, web, App, HttpServer};
use libra_api::{routes::recommend, SERVER};
use std::time::Duration;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Start the HTTP server
    HttpServer::new(move || {
        // Set up CORS with a maximum age of 3600 seconds, allowing only GET and POST methods
        let cors = Cors::default()
            .max_age(3600)
            .allowed_methods(vec!["GET", "POST"]);

        App::new()
            .wrap(cors)
            .wrap(middleware::Logger::default()) // Use the default logger for request/response logs
            .service(
                // Mount the notice routes under the "/recommend" path
                web::scope("/api/recommend").configure(recommend::init_recommender),
            )
    })
    .keep_alive(Duration::from_secs(600)) // Keep the connection alive for seconds
    .bind(SERVER)? // Bind to the server address specified in the rustserver module
    .run() // Start the HTTP server
    .await
}
