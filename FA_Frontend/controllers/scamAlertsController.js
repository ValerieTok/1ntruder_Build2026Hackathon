const alertsModel = require("../models/alertsModel");
const alertsService = require("../services/alertsService");

function slugify(text = "") {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeArticle(article) {
  if (!article) return null;

  const slug = article.slug || slugify(article.title || article.id);

  return {
    ...article,
    id: article.id || slug,
    slug,
    articleHeadline: article.articleHeadline || article.title,
    readTime: article.readTime || "3 min read",
    author: article.author || "RedFlag Research Team",
    image:
      article.image ||
      "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?auto=format&fit=crop&w=1200&q=80",
    articleContent: {
      overview: article.articleContent?.overview || [article.description || "No overview available."],
      howItWorks: article.articleContent?.howItWorks || [],
      steps: article.articleContent?.steps || [],
      warningSigns: article.articleContent?.warningSigns || article.warningSigns || [],
      protectionTips: article.articleContent?.protectionTips || article.recommendedActions || [],
      whatToDo: article.articleContent?.whatToDo || article.recommendedActions || [],
      resources: article.articleContent?.resources || []
    }
  };
}

exports.getAlertsApi = async (req, res) => {
  const alerts = await alertsService.getAlerts();
  res.json({ alerts: alerts.map(normalizeArticle) });
};

exports.getAlertApi = async (req, res) => {
  const alert = normalizeArticle(await alertsService.getAlertBySlug(req.params.slug));

  if (!alert) {
    return res.status(404).json({ error: "Alert not found" });
  }

  res.json(alert);
};

exports.showAlerts = async (req, res) => {
  const alerts = (await alertsService.getAlerts()).map(normalizeArticle);
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
  const alerts = (await alertsService.getAlerts()).map(normalizeArticle);
  const article = alerts.find((item) => item.slug === req.params.slug || item.id === req.params.slug);

  if (!article) {
    return res.status(404).render("layout", {
      title: "Alert Not Found",
      currentPage: "alerts",
      page: {
        heading: "Alert not found",
        description: "This scam alert could not be found."
      },
      body: "pages/not-found"
    });
  }

  const relatedAlerts = alerts
    .filter((entry) => entry.id !== article.id)
    .slice(0, 4);

  res.render("layout", {
    title: article.articleHeadline,
    currentPage: "alerts",
    article,
    relatedAlerts,
    body: "pages/alert-article"
  });
};