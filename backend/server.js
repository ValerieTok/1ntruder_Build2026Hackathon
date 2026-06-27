const express = require('express');
const path = require('path');
const fs = require('fs/promises');

const app = express();
const PORT = process.env.PORT || 5000;
const dataPath = path.join(__dirname, 'data', 'scamAlerts.json');

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

async function loadAlerts() {
  try {
    const raw = await fs.readFile(dataPath, 'utf-8');
    const payload = JSON.parse(raw);
    return Array.isArray(payload) ? payload : payload.alerts || [];
  } catch (error) {
    console.error('Unable to load scam alerts data:', error.message);
    return [];
  }
}

app.get('/', (req, res) => {
  res.json({ status: 'Scam Alerts backend is running' });
});

app.get('/api/scam-alerts', async (req, res) => {
  const alerts = await loadAlerts();
  res.json({ alerts });
});

app.get('/api/scam-alerts/:slug', async (req, res) => {
  const alerts = await loadAlerts();
  const article = alerts.find((item) => item.slug === req.params.slug || item.id === req.params.slug);

  if (!article) {
    return res.status(404).json({ error: 'Alert not found' });
  }

  res.json(article);
});

app.listen(PORT, () => {
  console.log(`Scam Alerts backend running at http://localhost:${PORT}`);
});
