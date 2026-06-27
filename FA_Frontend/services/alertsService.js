const alertsModel = require('../models/alertsModel');

async function getAlerts() {
  const fallbackAlerts = alertsModel.getAlerts();

  if (process.env.ALERTS_API_URL) {
    try {
      const response = await fetch(process.env.ALERTS_API_URL);
      if (!response.ok) {
        throw new Error(`Alerts API error: ${response.status}`);
      }
      const payload = await response.json();
      if (Array.isArray(payload)) {
        return payload;
      }
      if (payload && Array.isArray(payload.alerts)) {
        return payload.alerts;
      }
    } catch (error) {
      console.warn('Falling back to local alerts data:', error.message);
    }
  }

  return fallbackAlerts;
}

async function getAlertBySlug(slug) {
  const alerts = await getAlerts();
  return alerts.find((alert) => alert.slug === slug) || null;
}

module.exports = {
  getAlerts,
  getAlertBySlug
};
