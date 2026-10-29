# MANTHAN 2026 | Autonomous Trading Console

Autonomous Quantitative Trading Execution Console and Voice Telemetry Gateway built for MANTHAN 2026 (`group-mn2612`).

## Project Structure

```
mathan/
├── fronted/                 # React 19 + Tailwind CSS + Vite Frontend
│   ├── src/
│   │   ├── components/      # UI components (Waterfall, Short Shield, Tax Ledger, Voice, etc.)
│   │   ├── utils/           # Formatting utilities (Indian numbering system)
│   │   ├── App.jsx          # Main trading console dashboard
│   │   ├── main.jsx         # React root
│   │   └── index.css        # Tailwind styling & tokens
│   ├── index.html           # HTML entry point (IBM Plex Sans & JetBrains Mono)
│   ├── package.json         # Frontend dependencies & scripts
│   └── vite.config.js       # Vite configuration
│
└── backend/                 # FastAPI Voice Gateway Backend
    ├── main.py              # FastAPI server proxying Gnani AI Vachana TTS
    ├── requirements.txt     # Python backend dependencies
    └── .env                 # Environment variables & API keys
```

## Quick Start

### 1. Run the Frontend (React + Vite)
```bash
cd fronted
npm install
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your browser.

### 2. Run the Backend (FastAPI + Gnani AI)
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation and Swagger UI will be available at [http://localhost:8000/docs](http://localhost:8000/docs).
