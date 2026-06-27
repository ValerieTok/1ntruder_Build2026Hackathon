const pageModel = require("../models/pageModel");
const openaiService = require("../services/openaiService");

function renderCheckerPage(res, options = {}) {
  res.render("layout", {
    title: "Message Checker",
    currentPage: "checker",
    page: pageModel.getPage("checker"),
    submittedMessage: options.submittedMessage || "",
    submittedLink: options.submittedLink || "",
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
  const inputType = ["text", "link", "image"].includes(req.body.inputType) ? req.body.inputType : "text";
  const submittedMessage = inputType === "text" ? (req.body.message || "").trim() : "";
  const submittedLink = inputType === "link" ? (req.body.link || "").trim() : "";
  const submittedContext = (req.body.context || "").trim();
  const instruction = (req.body.instruction || "").trim();
  const imageFile = inputType === "image" ? req.file : null;
  const uploadedImage = imageFile ? `/uploads/${imageFile.filename}` : null;

  if (!submittedMessage && !submittedLink && !imageFile) {
    renderCheckerPage(res, {
      submittedContext,
      errorMessage: "Paste text, paste a link, or upload an image before analysing."
    });
    return;
  }

  try {
    const analysis = await openaiService.analyzeSubmission({
      instruction,
      message: submittedMessage,
      link: submittedLink,
      context: submittedContext,
      imagePath: imageFile?.path,
      imageMimeType: imageFile?.mimetype
    });

    renderCheckerPage(res, {
      submittedMessage,
      submittedLink,
      submittedContext,
      uploadedImage,
      analysis
    });
  } catch (error) {
    console.error("Content analysis failed:", error.message);

    renderCheckerPage(res, {
      submittedMessage,
      submittedLink,
      submittedContext,
      uploadedImage,
      errorMessage: openaiService.getFriendlyOpenAIError(error)
    });
  }
};
