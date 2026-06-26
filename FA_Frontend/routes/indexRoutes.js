const express = require("express");
const homeController = require("../controllers/homeController");
const checkerController = require("../controllers/checkerController");
const uploadController = require("../controllers/uploadController");
const chatbotController = require("../controllers/chatbotController");
const aboutController = require("../controllers/aboutController");
const upload = require("../middleware/imageUpload");

const router = express.Router();

// Routes only connect URLs to controller methods.
router.get("/", homeController.showHome);
router.get("/checker", checkerController.showChecker);
router.post("/checker", (req, res) => {
  upload.single("screenshot")(req, res, (error) => {
    if (error) {
      checkerController.showCheckerError(res, error.message);
      return;
    }

    checkerController.analyzeContent(req, res);
  });
});
router.get("/upload", uploadController.showUpload);
router.get("/chatbot", chatbotController.showChatbot);
router.get("/about", aboutController.showAbout);

module.exports = router;
