extern crate actix_http;
extern crate actix_rt;
extern crate actix_web;

#[macro_use]
extern crate serde_derive;
// #[macro_use]
extern crate serde_json;

pub mod routes;
pub mod utils;

mod db;
// pub use db::connect;

pub const SERVER: &str = "0.0.0.0:8800";
pub const REDIRECT_URI: &str = env!("REDIRECT_URI");
pub const REDIRECT_URI_DEV: &str = env!("REDIRECT_URI_DEV");
pub const KAKAO_REST_KEY: &str = env!("KAKAO_REST_KEY");
