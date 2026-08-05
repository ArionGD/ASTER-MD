# ⚡ ASTER MD — High-Performance Native Markdown Viewer & Knowledge Hub

<p align="center">
  <b>Ultra-Fast, Offline-Native Desktop Markdown Engine</b><br>
  Built with <b>Tauri v2 + Rust + React 18 + TypeScript + Modern CSS</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Tauri-v2.0-blue?style=for-the-badge&logo=tauri" alt="Tauri">
  <img src="https://img.shields.io/badge/Rust-2021-orange?style=for-the-badge&logo=rust" alt="Rust">
  <img src="https://img.shields.io/badge/React-18.3-cyan?style=for-the-badge&logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License">
</p>

---

## ✨ Features at a Glance

* 📂 **Folder Explorer & ToC Outline**: Recursive workspace Markdown file scanner with fast interactive outline navigation.
* 📊 **Mermaid.js Diagram Rendering**: Native support for flowcharts, sequence diagrams, mindmaps, Gantt charts, and state diagrams (` ```mermaid `).
* 🧮 **LaTeX Math Equations**: Inline `$E=mc^2$` and display `$$\sum_{i=1}^n i$$` mathematical rendering via KaTeX.
* 🕸️ **2D Interactive Knowledge Graph**: Visualize bi-directional `[[WikiLinks]]` across your workspace markdown files.
* 🖥️ **Markdown Slide Presentations (`F5`)**: Present your markdown files as full-screen slide decks (delimited by `---`).
* 🔍 **Fuzzy Quick-Open Palette (`Ctrl + P` / `Ctrl + K`)**: Instantly search and jump to any markdown file across subdirectories.
* 🎯 **In-Document Search Engine (`Ctrl + F`)**: Real-time DOM text matching, match counters, highlights, and smooth scroll navigation.
* 💾 **Local Cache State Persistence**: Automatically preserves your theme (Dark/Light), accent colors (Cyan, Emerald, Violet, Amber, Rose), fonts, recent files, and working session across app restarts.
* 🎨 **Cosmic Theme Customization**: Dynamic HSL theme accent colors, monospaced code blocks, and custom typography (Inter, Roboto, Outfit, JetBrains Mono, Fira Code).
* 🛡️ **Error-Resilient & Secure**: Sandboxed React Error Boundaries preventing UI white-screens.

---

## ⚡ Performance Benchmarks

| Metric | ASTER MD (Tauri v2 + Rust) | Electron-Based Editors |
| :--- | :---: | :---: |
| **Executable Size** | **~3.8 MB** | ~150 MB+ |
| **RAM Footprint** | **< 30 MB** | ~350 MB+ |
| **Cold Startup Time** | **< 200 ms** | ~2.5 seconds |
| **Data Privacy** | **100% Offline Local Filesystem** | Cloud Dependent |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     ASTER MD FRONTEND ENGINE                    │
│   React 18 / TypeScript + Dynamic HSL Accent Styling System     │
│   - GFM Markdown Parser         - Mermaid.js Chart Engine       │
│   - KaTeX Math Parser           - 2D Knowledge Graph (Graphology)│
│   - Local Cache Persistence     - Full-Screen Slide Deck        │
└────────────────────────────────┬────────────────────────────────┘
                                 │ Inter-Process Communication (IPC)
┌────────────────────────────────▼────────────────────────────────┐
│                     TAURI 2.0 (RUST BACKEND)                    │
│  - Native Window Control Handlers - File System Reader & Writer │
│  - Recursive Folder Scanner       - Ultra-Low RAM Footprint     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Building & Running Locally

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ & npm
- [Rust](https://www.rust-lang.org/) v1.75+ & Cargo

### Installation
```bash
# Clone the repository
git clone https://github.com/ArionGD/ASTER-MD.git
cd ASTER-MD

# Install dependencies
npm install

# Run in Development Mode
npx tauri dev

# Build Production Installer Executable
npx tauri build
```

---

## 📄 License & Author

Distributed under the **MIT License**. Created with ❤️ by **Aditya Raj Pandey (ArionGD)**.
