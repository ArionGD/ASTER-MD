// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::path::Path;
use serde::{Deserialize, Serialize};
use tauri::Window;

#[derive(Serialize, Deserialize, Debug)]
struct MarkdownFile {
    name: String,
    path: String,
    relative_path: String,
}

#[tauri::command]
fn read_file_content(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| format!("Failed to read file '{}': {}", path, e))
}

#[tauri::command]
fn save_file_content(path: String, content: String) -> Result<(), String> {
    fs::write(&path, content).map_err(|e| format!("Failed to save file '{}': {}", path, e))
}

#[tauri::command]
fn minimize_window(window: Window) -> Result<(), String> {
    window.minimize().map_err(|e| e.to_string())
}

#[tauri::command]
fn toggle_maximize_window(window: Window) -> Result<(), String> {
    let is_maximized = window.is_maximized().map_err(|e| e.to_string())?;
    if is_maximized {
        window.unmaximize().map_err(|e| e.to_string())?;
    } else {
        window.maximize().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn close_window(window: Window) -> Result<(), String> {
    window.close().map_err(|e| e.to_string())
}

#[tauri::command]
fn set_always_on_top(window: Window, always_on_top: bool) -> Result<(), String> {
    window.set_always_on_top(always_on_top).map_err(|e| e.to_string())
}

#[tauri::command]
fn list_markdown_files(folder_path: String) -> Result<Vec<MarkdownFile>, String> {
    let root = Path::new(&folder_path);
    if !root.exists() || !root.is_dir() {
        return Err(format!("Invalid folder path: {}", folder_path));
    }

    let mut results = Vec::new();
    let mut dirs_to_visit = vec![root.to_path_buf()];

    while let Some(current_dir) = dirs_to_visit.pop() {
        if let Ok(entries) = fs::read_dir(&current_dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.is_dir() {
                    if let Some(name) = path.file_name().and_then(|n| n.to_str()) {
                        if !name.starts_with('.') && name != "node_modules" && name != "target" && name != "dist" {
                            dirs_to_visit.push(path);
                        }
                    }
                } else if path.is_file() {
                    if let Some(ext) = path.extension().and_then(|e| e.to_str()) {
                        let ext_lower = ext.to_lowercase();
                        if ext_lower == "md" || ext_lower == "markdown" || ext_lower == "mdown" {
                            let name = path.file_name().and_then(|n| n.to_str()).unwrap_or("").to_string();
                            let full_path = path.to_string_lossy().to_string();
                            let relative_path = path
                                .strip_prefix(root)
                                .map(|p| p.to_string_lossy().to_string())
                                .unwrap_or_else(|_| name.clone());

                            results.push(MarkdownFile {
                                name,
                                path: full_path,
                                relative_path,
                            });
                        }
                    }
                }
            }
        }
    }

    results.sort_by(|a, b| a.relative_path.to_lowercase().cmp(&b.relative_path.to_lowercase()));
    Ok(results)
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            read_file_content,
            save_file_content,
            list_markdown_files,
            minimize_window,
            toggle_maximize_window,
            close_window,
            set_always_on_top
        ])
        .setup(|_app| {
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
