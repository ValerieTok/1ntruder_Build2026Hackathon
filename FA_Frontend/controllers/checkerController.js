const pageModel = require("../models/pageModel");
const botpressService = require("../services/botpressService");
const geminiService = require("../services/geminiService");

function renderCheckerPage(res, options = {}) {
  res.render("layout", {
    title: "Message Checker",
    currentPage: "checker",
    page: pageModel.getPage("checker"),
    submittedMessage: options.submittedMessage || "",
    submittedContext: options.submittedContext || "",
    uploadedImage: options.uploadedImage || null,
    analysis: options.analysis || null,
    errorMessage: options.errorMessage || null,
    body: "pages/checker"
  });
}

exports.showChecker = (req, res) => {
  renderCheckerPage(res);
};

exports.showCheckerError = (res, errorMessage) => {
  renderCheckerPage(res, { errorMessage });
};

exports.analyzeContent = async (req, res) => {
  const submittedMessage = (req.body.message || "").trim();
  const submittedContext = (req.body.context || "").trim();
  const uploadedImage = req.file ? `/uploads/${req.file.filename}` : null;

  if (!submittedMessage && !req.file) {
    renderCheckerPage(res, {
      errorMessage: "Paste some text or a link, upload an image, or provide both."
    });
    return;
  }

  try {
    const extractedText = req.file
      ? await geminiService.extractTextFromImage(req.file.path, req.file.mimetype)
      : "";
    const contentToAnalyze = [submittedMessage, extractedText, submittedContext].filter(Boolean).join("\n\n");

    if (!contentToAnalyze) {
      renderCheckerPage(res, {
        uploadedImage,
        submittedContext,
        errorMessage: "No readable text was found in the uploaded image."
      });
      return;
    }

    const analysis = await botpressService.analyzeMessage(contentToAnalyze);

    renderCheckerPage(res, {
      submittedMessage,
      submittedContext,
      uploadedImage,
      analysis
    });
  } catch (error) {
    console.error("Content analysis failed:", error.message);

    renderCheckerPage(res, {
      submittedMessage,
      submittedContext,
      uploadedImage,
      errorMessage: botpressService.getFriendlyBotpressError(error)
    });
  }
};
