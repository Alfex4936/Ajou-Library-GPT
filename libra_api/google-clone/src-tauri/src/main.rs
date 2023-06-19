#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::{CustomMenuItem, Menu, MenuItem, Submenu};

fn main() {
    let context = tauri::generate_context!();

    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let clear = CustomMenuItem::new("clear".to_string(), "Clear history");
    let submenu = Submenu::new("Help", Menu::new().add_item(quit).add_item(clear));

    let menu = Menu::new().add_submenu(submenu);

    tauri::Builder::default()
        .menu(menu)
        .on_menu_event(|event| match event.menu_item_id() {
            "clear" => {
                event.window().emit("menu-event", "clear-event").unwrap();
            }
            "quit" => {
                std::process::exit(0);
            }
            _ => {}
        })
        .run(context)
        .expect("error while running tauri application");
}
