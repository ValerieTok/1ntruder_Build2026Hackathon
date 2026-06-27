const alertsModel = require("../models/alertsModel");

exports.showAlerts = (req, res) => {
  const alerts = alertsModel.getAlerts();
  const categories = alertsModel.getCategories();
  const trends = alertsModel.getTrends();
  const safetyTips = alertsModel.getSafetyTips();
  const stats = alertsModel.getSummaryStats();

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
