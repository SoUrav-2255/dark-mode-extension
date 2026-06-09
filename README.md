# 🌙 Dark Mode Toggle — Browser Extension

A lightweight Chrome extension that instantly switches any website to dark mode, with per-site control and adjustable brightness & contrast.

---

## ✨ Features

- **One-click dark mode** — works on any website instantly
- **Per-site control** — enable or disable dark mode for individual sites
- **Global toggle** — apply dark mode everywhere with a single switch
- **Brightness slider** — fine-tune screen brightness (50%–150%)
- **Contrast slider** — adjust contrast to your liking
- **Persistent settings** — your preferences are saved across sessions
- **Lightweight** — no tracking, no analytics, no bloat

---

## 📦 Installation (Manual)

Since this extension isn't on the Chrome Web Store, you'll need to load it manually:

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer Mode** (toggle in the top-right corner)
4. Click **"Load unpacked"**
5. Select the `dark-mode-extension` folder
6. The 🌙 icon will appear in your toolbar — you're good to go!

> Works on Chrome, Edge, Brave, and any Chromium-based browser.

---

## 🚀 How to Use

| Action | How |
|---|---|
| Toggle dark mode on current site | Click 🌙 icon → flip **This Site** switch |
| Enable dark mode on all sites | Click 🌙 icon → flip **Global Dark Mode** switch |
| Adjust brightness / contrast | Use the sliders in the popup |
| Reset brightness & contrast | Click **Reset Filters** |
| Enable dark mode everywhere at once | Click **Enable All Sites** |

---

## 🗂 Project Structure

```
dark-mode-extension/
├── manifest.json      # Extension config (Manifest V3)
├── content.js         # Injects dark mode CSS into pages
├── background.js      # Service worker for tab management
├── popup.html         # Extension popup UI
├── popup.js           # Popup logic and controls
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## 🛠 Built With

- **Manifest V3** — latest Chrome extension standard
- **Chrome Storage API** — saves your settings per site
- **CSS injection** — rewrites page styles in real time, no page reload needed

---

## 🤝 Contributing

Got an idea or found a bug? Feel free to open an issue or submit a pull request. All contributions are welcome!

---

## 📄 License

MIT License — free to use, modify, and distribute.
