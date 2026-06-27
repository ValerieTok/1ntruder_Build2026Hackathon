const alertsModel = require("../models/alertsModel");
const alertsService = require("../services/alertsService");

exports.showAlerts = async (req, res) => {
  const alerts = await alertsService.getAlerts();
  const categories = alertsModel.getCategories();
  const trends = alertsModel.getTrends();
  const safetyTips = alertsModel.getSafetyTips();
  const stats = alertsModel.getSummaryStats(alerts);

  res.render("layout", {
    title: "Scam Alerts",
    currentPage: "alerts",
    page: {
      heading: "Latest Scam Alerts",
      description: "Stay informed about newly reported scams and learn how to protect yourself."
    },
    alerts,
    categories,
    trends,
    safetyTips,
    stats,
    body: "pages/alerts"
  });
};

exports.showAlertArticle = async (req, res) => {
  const alerts = await alertsService.getAlerts();
  const article = alerts.find((entry) => entry.slug === req.params.slug);

  if (!article) {
    return res.status(404).render("layout", {
      title: "Alert Not Found",
      currentPage: "alerts",
      body: "pages/not-found"
    });
  }

  const relatedAlerts = alerts.filter((entry) => entry.id !== article.id).slice(0, 4);

  res.render("layout", {
    title: article.title,
    currentPage: "alerts",
    article,
    relatedAlerts,
    body: "pages/alert-article"
  });
};
