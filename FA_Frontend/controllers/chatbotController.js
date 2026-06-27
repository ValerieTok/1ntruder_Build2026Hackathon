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
  const mode = req.query.mode === "recovery" ? "recovery" : "training";
  const page = mode === "recovery" ? pageModel.getPage("recovery") : pageModel.getPage("chatbot");

  res.render("layout", {
    title: page.heading,
    currentPage: "chatbot",
    page,
    questions: pageModel.getChatbotQuestions(),
    botpress: getBotpressConfig(),
    chatbotMode: mode,
    body: "pages/chatbot"
  });
};
