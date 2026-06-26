const pageModel = require("../models/pageModel");
function getBotpressConfig() {
  return {
    botId: process.env.BOTPRESS_BOT_ID || "",
    botName: "RedFlag",
    webchatInjectUrl: process.env.BOTPRESS_WEBCHAT_INJECT_URL || "",
    webchatConfigUrl: process.env.BOTPRESS_WEBCHAT_CONFIG_URL || ""
  };
}

exports.showChatbot = (req, res) => {
  res.render("layout", {
    title: "Scam Training Simulator",
    currentPage: "chatbot",
    page: pageModel.getPage("chatbot"),
    questions: pageModel.getChatbotQuestions(),
    botpress: getBotpressConfig(),
    body: "pages/chatbot"
  });
};
