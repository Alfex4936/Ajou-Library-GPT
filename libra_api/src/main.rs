use actix_cors::Cors;
use actix_http::header;
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

    // Initialize the MongoDB connection
    // let data = web::Data::new(libra_api::connect::init_mongo().await);

    // Start the HTTP server
    HttpServer::new(move || {
        // let cors = Cors::permissive();
        let cors = Cors::default()
            .allow_any_origin()
            .allowed_methods(vec!["GET", "POST"])
            .allowed_headers(vec![header::AUTHORIZATION, header::ACCEPT])
            .allowed_header(header::CONTENT_TYPE)
            .max_age(3600)
            .supports_credentials(); // allows cookies to be submitted across sites.

        App::new()
            // .app_data(data.clone()) // clone the MongoDB connection data for each HTTP request
            .wrap(cors)
            .wrap(middleware::Logger::default()) // Use the default logger for request/response logs
            .wrap(middleware::Compress::default()) // compress responses
            // .wrap(
            //     middleware::DefaultHeaders::new()
            //         .add((
            //             "Strict-Transport-Security",
            //             "max-age=31536000; includeSubDomains",
            //         ))
            //         .add(("X-Content-Type-Options", "nosniff"))
            //         .add(("X-Frame-Options", "SAMEORIGIN")),
            // )
            .service(
                // Mount the notice routes under the "/recommend" path
                web::scope("/api/recommend").configure(recommend::init_recommender),
            )
            // .service(
                // Mount the login routes under the "/kakao" path
            //     web::scope("/api/kakao").configure(login::init_kakao),
            // )
        // .service(fs::Files::new("/", "./google-clone/build").index_file("index.html"))
    })
    .keep_alive(Duration::from_secs(600)) // Keep the connection alive for seconds
    .bind(server_address)? // Bind to the server address specified in the rustserver module
    .run() // Start the HTTP server
    .await
}
