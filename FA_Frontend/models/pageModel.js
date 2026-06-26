const pages = {
  home: {
    heading: "RedFlag",
    tagline: "Your AI-powered scam detection companion.",
    description:
      "An AI-powered anti-scam portal that helps users check suspicious messages, review screenshots, and get practical scam guidance."
  },
  checker: {
    heading: "Message Checker",
    description:
      "Paste a suspicious message and send it to the connected Botpress chatbot for scam risk analysis."
  },
  upload: {
    heading: "Screenshot Upload",
    description:
      "Upload a screenshot of a suspicious message or website, extract the text, and send it to Botpress for scam risk analysis."
  },
  chatbot: {
    heading: "Scam Training Simulator",
    description:
      "Practise identifying scam warning signs in safe, realistic scenarios."
  },
  about: {
    heading: "About AI",
    description:
      "RedFlag combines practical web tools with modern AI concepts for scam education and safer decision-making."
  }
};

const chatbotQuestions = [
  "Is this message asking for my bank details a scam?",
  "What should I do if I clicked a suspicious link?",
  "How do I recognize a job scam?",
  "Can you explain phishing in simple terms?"
];

exports.getPage = (key) => pages[key];
exports.getChatbotQuestions = () => chatbotQuestions;
