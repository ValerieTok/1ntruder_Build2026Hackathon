# Scam Alerts Backend

This backend provides a simple API for scam alerts and a scraper that collects public scam advisory data.

## Setup

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Run the backend API:
   ```bash
   npm start
   ```

3. Scrape new alert data:
   ```bash
   npm run scrape
   ```

## API Endpoints

- `GET /api/scam-alerts` — returns a JSON object with the current alerts.
- `GET /api/scam-alerts/:slug` — returns a single alert by slug.

## Frontend Integration

Set `ALERTS_API_URL` in `FA_Frontend/.env` or `.env.example`:

```env
ALERTS_API_URL=http://localhost:5000/api/scam-alerts
```

The frontend service will fetch from that endpoint and fall back to local sample data if the backend is unavailable.
