# InstaFlow Pro - Autonomous Instagram Growth & Automation Platform

InstaFlow Pro is a full-stack, enterprise-grade Instagram automation web application engineered to scale audience growth, schedule multi-media content (Reels, Carousels, Stories, Feed), and convert post engagement into high-intent leads using ManyChat-style automated comment-to-DM conversational funnels.

---

## 🚀 Key Features

1. **ManyChat-Style Comment-to-DM Engine:**
   - Detects trigger keywords (`BOOK`, `PRICE`, `GUIDE`, `SCALE`, custom keywords).
   - Generates dynamic public comment replies with rotation and Spintax support (`{Hey|Hi|Hello} @{{username}}`).
   - Dispatches direct messages with interactive action links & buttons.
   - Captures contacts into the built-in Leads CRM.

2. **Visual Content & Post Scheduler:**
   - Queue Reels, Carousels, and Feed posts.
   - Built-in **AI Viral Caption & Hashtag Assistant** tailored by niche (Tech, Marketing, Fitness, Creator).
   - Real-time mobile feed preview on an interactive Instagram phone mockup.
   - Instant "Publish Now" or background cron scheduler.

3. **Anti-Ban Safety Guard & Rate Limiter:**
   - Enforces realistic human typing jitter (4s - 25s randomized delay).
   - Safe Mode guardrails: hourly DM limits (e.g., 35 DMs/hr) and comment reply thresholds to prevent Instagram action blocks.
   - Warmup Mode for newly created accounts.

4. **Live Interactive Test Bench / Simulator:**
   - Test any automation flow directly in the browser with live visual feedback.
   - Simulates user comments and displays the rendered Instagram DM inbox in real-time.

5. **Audience & Leads CRM:**
   - Tracks captured leads, source trigger, timestamp, and status.
   - One-click export to CSV and JSON.

6. **Dual-Mode Operation:**
   - **Simulation Mode:** Complete high-fidelity simulation engine for rapid testing with zero API keys required.
   - **Meta Graph API Production Mode:** Direct integration with Meta's official Instagram Graph API (`/media`, `/media_publish`, `/replies`, `/messages`) and Webhook listener (`/api/webhook`).

---

## 🛠️ Architecture

```
brave-mendel/
├── server.js               # Express server, REST API, SSE real-time event pipeline
├── src/
│   ├── database.js         # Persistent JSON store with atomic file writes & seeds
│   ├── automationEngine.js # Rules processor, Spintax resolver, anti-ban jitter & CRM tracker
│   ├── scheduler.js        # Background publisher and interval task daemon
│   └── instagramService.js # Meta Graph API client & high-fidelity simulation engine
├── public/
│   ├── index.html          # Modern glassmorphism SPA dashboard
│   ├── app.js              # State manager, SSE subscriber, and interactive simulator
│   ├── style.css           # Instagram gradient styling, dark mode theme, mobile frame
│   └── favicon.svg         # Instagram-inspired gradient brand icon
└── package.json            # Node.js dependencies (express, cors, multer)
```

---

## 💻 Running the Platform

To start the server:

```bash
node server.js
```

Or run via npm:

```bash
npm start
```

The application binds to `http://127.0.0.1:3000` (safe dev port compliant with AGY Android guidelines).

---

## 🔌 API Endpoints Reference

### State & Management
- `GET /api/state` - Fetch full application state (accounts, rules, scheduled posts, leads, logs).
- `POST /api/account/switch` - Switch active Instagram profile.
- `PUT /api/account/settings` - Update rate limits, Safe Mode, and Meta API keys.

### Automations & Funnels
- `POST /api/rules` - Create a new automation rule.
- `PUT /api/rules/:id` - Edit rule parameters.
- `POST /api/rules/:id/toggle` - Toggle rule active / paused.
- `DELETE /api/rules/:id` - Delete rule.

### Content & Scheduler
- `POST /api/posts` - Schedule a new Reel, Carousel, or Feed post.
- `POST /api/posts/:id/publish-now` - Force instant publication.
- `DELETE /api/posts/:id` - Remove post from queue.
- `POST /api/ai/generate-content` - AI viral caption & hashtag generator.

### Simulation & Webhooks
- `POST /api/simulate/comment` - Execute simulated user comment through the automation pipeline.
- `GET /api/events` - Server-Sent Events (SSE) live event stream.
- `GET /api/webhook` - Meta Webhook challenge verification.
- `POST /api/webhook` - Real-time incoming Instagram webhook event processor.
- `GET /api/leads/export?format=csv|json` - Export captured contacts.
