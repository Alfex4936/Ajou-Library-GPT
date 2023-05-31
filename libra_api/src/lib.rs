extern crate actix_http;
extern crate actix_rt;
extern crate actix_web;

#[macro_use]
extern crate serde_derive;
// #[macro_use]
extern crate serde_json;

pub mod routes;
pub mod utils;

pub const SERVER: &str = "0.0.0.0:8800";
