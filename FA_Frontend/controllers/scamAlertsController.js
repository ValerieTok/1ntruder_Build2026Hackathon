const alertsModel = require("../models/alertsModel");
const alertsService = require("../services/alertsService");

exports.getAlertsApi = async (req, res) => {
  const alerts = await alertsService.getAlerts();
  res.json({ alerts });
};

exports.getAlertApi = async (req, res) => {
  const alert = await alertsService.getAlertBySlug(req.params.slug);
  if (!alert) {
    return res.status(404).json({ error: "Alert not found" });
  }
  res.json(alert);
};

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

function normalizeArticle(article) {
  if (!article) {
    return null;
  }

  return {
    ...article,
    articleHeadline: article.articleHeadline || article.title,
    readTime: article.readTime || '3 min read',
    views: typeof article.views === 'number' ? article.views : 0,
    author: article.author || 'RedFlag Security Team',
    articleContent: {
      overview: article.articleContent?.overview || [article.description || 'No overview available.'],
      howItWorks: article.articleContent?.howItWorks || [],
      steps: article.articleContent?.steps || [],
      warningSigns: article.articleContent?.warningSigns || article.warningSigns || [],
      protectionTips: article.articleContent?.protectionTips || [],
      whatToDo: article.articleContent?.whatToDo || [],
      resources: article.articleContent?.resources || []
    }
  };
}

exports.showAlertArticle = async (req, res) => {
  const article = await alertsService.getAlertBySlug(req.params.slug);

  if (!article) {
    return res.status(404).render("layout", {
      title: "Alert Not Found",
      currentPage: "alerts",
      body: "pages/not-found"
    });
  }

  const normalizedArticle = normalizeArticle(article);
  const alerts = await alertsService.getAlerts();
  const relatedAlerts = alerts.filter((entry) => entry.id !== normalizedArticle.id).slice(0, 4);

  res.render("layout", {
    title: normalizedArticle.title,
    currentPage: "alerts",
    article: normalizedArticle,
    relatedAlerts,
    body: "pages/alert-article"
  });
};
