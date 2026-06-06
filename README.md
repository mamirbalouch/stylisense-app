# Stylisense AI Stylist

An AI-powered personal styling app. Users describe what they need in natural language — the system builds their style profile, generates outfit recommendations via Claude, finds live products via Perplexity, and supports virtual try-on via FASHN.

---

## Architecture Overview

This is an **npm monorepo** with two workspaces:

```
stylisense-app/
├── client/              React 19 + Vite 6 (frontend)
├── server/              Node.js + Express 4 (backend API)
├── data/products.json   Static product catalog
├── package.json         Root workspace config + shared scripts
└── server/.env          API keys and server config
```

### Frontend — `client/`

| Detail | Value |
|---|---|
| Stack | React 19, Vite 6, Lucide icons |
| Entry point | `client/src/main.jsx` |
| Dev URL | `http://localhost:5173` |

All UI lives in a single file (`main.jsx`) with no routing. Key components:

- **App** — root, manages chat state and profile
- **AiOutfitCard** — displays a Claude-generated outfit with items, color swatches, and shop links
- **AiResultsSection** — renders the 3 AI outfits + "Ask Your Stylist" Q&A box
- **ProfilePanel** — live sidebar showing the extracted style profile
- **SearchPanel** — tabbed panel for Perplexity product search and trend research
- **ProductCard** — catalog match card with affiliate link

In dev, Vite proxies all `/api/*` calls to `localhost:4000`.

---

### Backend — `server/`

| Detail | Value |
|---|---|
| Stack | Node.js (ESM), Express 4, Zod, dotenv |
| Entry point | `server/src/index.js` |
| Dev URL | `http://localhost:4000` |

#### API Routes

| Method | Route | Description | AI Provider |
|---|---|---|---|
| `GET` | `/health` | Service health + feature flags | — |
| `GET` | `/api/products` | Static catalog from `data/products.json` | — |
| `POST` | `/api/style-chat` | Conversational profile builder | Rule-based (`styleEngine.js`) |
| `POST` | `/api/style` | Generate 3 outfit recommendations | **Claude Sonnet** |
| `POST` | `/api/ask` | Follow-up stylist Q&A | **Claude Haiku** (auto-routed) |
| `POST` | `/api/search` | Live product search | **Perplexity Sonar** |
| `POST` | `/api/research` | Trend or brand research | **Perplexity Sonar Pro** |
| `POST` | `/api/tryon` | Virtual try-on | **FASHN tryon-v1.6** |
| `GET` | `/api/router` | AI job config + cost estimates | — |

#### Key Backend Files

```
server/src/
├── index.js          Express app, all route handlers, request validation (Zod)
├── styleEngine.js    Rule-based conversational engine — no AI key required
└── lib/
    ├── ai-router.js  Maps job types to models/providers, cost estimator
    ├── anthropic.js  Anthropic SDK client
    ├── perplexity.js Perplexity API wrapper (search, trend, brand)
    └── fashn.js      FASHN virtual try-on wrapper
```

#### AI Router

`lib/ai-router.js` maps named jobs to specific models so the rest of the code never hardcodes model names:

| Job | Provider | Model |
|---|---|---|
| `outfit_generation` | Anthropic | claude-sonnet-4-6 |
| `followup_question` | Anthropic | claude-haiku-4-5 |
| `product_lookup` | Perplexity | sonar |
| `trend_research` | Perplexity | sonar-pro |
| `brand_research` | Perplexity | sonar |
| `virtual_tryon` | FASHN | tryon-v1.6 |

---

## Data Flow

```
User types in chat
       │
       ▼
POST /api/style-chat  →  styleEngine.js (rule-based)
       │                  builds style profile incrementally
       │  profile complete
       ▼
POST /api/style       →  Claude Sonnet  →  3 outfit recommendations (JSON)
POST /api/search      →  Perplexity Sonar  →  live product results
POST /api/ask         →  Claude Haiku   →  follow-up styling answer
```

---

## Environment Variables

All keys live in `server/.env`:

```env
ANTHROPIC_API_KEY=    # Required for outfit generation + follow-up Q&A
PERPLEXITY_API_KEY=   # Required for product search + trend/brand research
FASHN_API_KEY=        # Optional — leave empty to show "Coming Soon"

PORT=4000
CLIENT_ORIGIN=http://localhost:5173
```

Get keys from:
- Anthropic: https://console.anthropic.com
- Perplexity: https://perplexity.ai/settings/api
- FASHN: https://fashn.ai/dashboard

The app runs without any keys — `styleEngine.js` handles the conversational flow entirely rule-based. AI features activate only when their respective key is present.

---

## Running Locally

```bash
# 1. Install all dependencies (first time only)
npm run install:all

# 2. Start both frontend + backend together
npm run dev
# → Frontend: http://localhost:5173
# → Backend:  http://localhost:4000
```

Or run them separately:

```bash
# Server only
cd server && npm run dev

# Client only
cd client && npm run dev
```

Production build:

```bash
npm run build    # builds client into client/dist/
npm start        # runs server on port 4000
```

---

## Test Prompts

Try these in the chat:

```
I need an elegant modest 3-piece suit for Eid under 15000 in pastel colors.
I need something simple for office under 10000.
I want a formal wedding outfit, dark color, modest fit.
I need casual daily wear, comfortable and affordable.
```

---

## Adding Products to the Catalog

Edit `data/products.json`. Each entry:

```json
{
  "id": "unique-id",
  "title": "Product title",
  "brand": "Brand name",
  "price": 9990,
  "currency": "PKR",
  "image": "https://image-url",
  "affiliateUrl": "https://store.com/product?affiliate_id=stylisense",
  "category": "3-piece suit",
  "gender": "female",
  "colors": ["pastel", "pink"],
  "styleTags": ["elegant", "modest"],
  "occasionTags": ["eid", "semi formal"],
  "fitTags": ["regular", "modest"],
  "seasonTags": ["summer"],
  "description": "Short product description"
}
```

---

## Deployment

- **Frontend** → Vercel / Netlify / VPS
- **Backend** → VPS / Render / Railway
- **Subdomain** → `app.stylisense.com`
- **Reverse proxy** → `/` to frontend, `/api` to backend (port 4000)
