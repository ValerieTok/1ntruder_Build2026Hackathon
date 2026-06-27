const features = [
  {
    title: "Scam training simulator",
    description: "Chat through realistic scam scenarios and build confidence spotting common tactics.",
    link: "/chatbot",
    icon: "simulator",
    tone: "coral",
    action: "Start training"
  },
  {
    title: "Scam detector",
    description: "Paste a message, email, listing, link, or screenshot to get a clear risk assessment.",
    link: "/checker",
    icon: "detector",
    tone: "orange",
    action: "Check now"
  },
  {
    title: "Recovery guide",
    description: "Get practical, step-by-step guidance when you think you have been scammed.",
    link: "/chatbot?mode=recovery",
    icon: "recovery",
    tone: "green",
    action: "Get help"
  },
  {
    title: "Scam Alerts",
    description: "Stay updated with the latest scam trends and receive timely warnings about emerging threats.",
    link: "/alerts",
    icon: "alerts",
    tone: "red",
    action: "View Alerts"
  }
];

exports.getFeatures = () => features;
