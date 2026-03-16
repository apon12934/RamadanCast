<p align="center">
  <img src="public/logo/RmadanCast.svg" alt="RamadanCast Logo" width="80" />
</p>

<h1 align="center">RamadanCast 🌙</h1>

<p align="center">
  <strong>A beautiful, real-time Sehri & Iftar countdown timer with AI voice announcements — built for Dhaka, Bangladesh.</strong>
</p>

<p align="center">
  <a href="https://ramadancast.netlify.app">🔗 Live App</a> •
  <a href="#features">✨ Features</a> •
  <a href="#tech-stack">🛠 Tech Stack</a> •
  <a href="#getting-started">🚀 Getting Started</a>
</p>

---

## What is RamadanCast?

RamadanCast is a Progressive Web App (PWA) that provides accurate, real-time Sehri (pre-dawn meal) and Iftar (fast-breaking) countdown timers for Dhaka, Bangladesh. It fetches live prayer times from the [Aladhan API](https://aladhan.com/prayer-times-api), applies precise **Islamic Foundation Bangladesh (IFB)** timing corrections, and announces remaining time with AI-generated voice alerts in both **English** and **বাংলা (Bangla)**.

It works year-round — not just during Ramadan.

---

## Features

| Feature | Description |
|---|---|
| ⏱️ **Always-on Countdown** | Perpetually running timer — auto-switches from Sehri → Iftar → next Sehri with no midnight wait |
| 🔄 **Phase Toggle** | Instantly swap between Sehri and Iftar views with a single tap on the full card |
| 🗣️ **AI Voice Alerts** | Minute-by-minute announcements via Google Cloud TTS — says "1 hour 20 minutes" when ≥ 60 min |
| 🔇 **Voice Off by Default** | Audio is off until the user turns it on, respecting browser autoplay policies |
| 🌐 **Bilingual UI** | Full English ↔ বাংলা toggle with native fonts; labels, dates, and voice all switch |
| 🕌 **IFB Accurate** | Tuned to match the Islamic Foundation Bangladesh's official Sehri/Iftar times (Fajr −1 min, Maghrib +2 min) |
| 🌗 **Islamic Day Awareness** | Hijri date advances at Maghrib (not midnight) — correct per Islamic timekeeping |
| 🎨 **Dynamic Themes** | Deep purple night theme (Sehri) ↔ warm sunset theme (Iftar) with smooth transitions |
| 📱 **Installable PWA** | Install as a native app on Android, iOS, and Desktop |
| 📊 **Progress Bar** | 24-hour window: 0% at start of countdown, 100% at event time |
| 🔋 **Low-end Optimised** | DOM writes skipped when screen is off; display cache prevents redundant repaints |
| 📲 **Screen-wake Recovery** | Immediately re-announces current time the moment the screen turns back on |

---

## Tech Stack

- **Frontend:** Vanilla JavaScript, HTML5, [Tailwind CSS 3](https://tailwindcss.com/)
- **Build Tool:** [Vite 4](https://vitejs.dev/)
- **Fonts:** [Google Fonts](https://fonts.google.com/) — Inter, Outfit, Anek Bangla
- **API:** [Aladhan Prayer Times API](https://aladhan.com/prayer-times-api)
- **Voice (primary):** Google Cloud Text-to-Speech (`en-US-Journey-O` / `bn-IN-Wavenet-A`)
- **Voice (fallback):** Google Translate TTS (proxied via Netlify Functions)
- **Hosting:** [Netlify](https://netlify.com/) with serverless functions
- **PWA:** Service Worker + Web App Manifest

---

## Project Structure

```
RamadanCast/
├── index.html              # Main app shell (single-page)
├── src/
│   ├── main.js             # Core app logic (API, countdown, voice, themes)
│   └── style.css           # Tailwind + custom CSS (glassmorphism, animations)
├── public/
│   ├── manifest.json       # PWA manifest with icon definitions
│   ├── sw.js               # Service Worker for offline caching
│   └── logo/               # App logos (SVG, PNG icons)
├── netlify/
│   └── functions/
│       └── tts.mjs         # Serverless proxy for Google TTS fallback
├── netlify.toml            # Netlify build & redirect config
├── vite.config.js          # Vite build configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration
└── package.json
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v16+
- npm

### Installation

```bash
# Clone the repo
git clone https://github.com/apon12934/RamadanCast.git
cd RamadanCast

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will be running at `http://localhost:3000`.

### Build for Production

```bash
npm run build
npm run preview   # Preview the production build locally
```

---

## API Configuration

RamadanCast fetches prayer times from the Aladhan API with these parameters:

| Parameter | Value | Reason |
|---|---|---|
| `city` | Dhaka | Target city |
| `country` | Bangladesh | Target country |
| `method` | 1 (Karachi) | Closest calculation method to IFB for South Asia |
| `tune` | `0,-1,0,0,0,2,2,0,0` | IFB offset: Fajr −1 min (Sehri end), Maghrib +2 min (Iftar start) |

The Hijri date is adjusted by **−1 day** to align with Bangladesh's local moon sighting observations, and advances at **Maghrib** (not midnight) to honour the Islamic definition of a new day.

---

## Deployment

The app is deployed on **Netlify** with:

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Serverless function:** `/api/tts` → proxied through `netlify/functions/tts.mjs` as a fallback when the Google Cloud TTS API is unavailable

---

## Credits

- Built with 💜 by [Alamin Islam Apon](https://github.com/apon12934)
- Prayer times powered by [Aladhan API](https://aladhan.com/)
- Voice announcements via Google Cloud Text-to-Speech

---

<p align="center">
  <sub>রমজান মোবারক! 🌙</sub>
</p>
