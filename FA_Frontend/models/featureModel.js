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
    title: "Link checker",
    description: "Check suspicious links before clicking and understand the risks behind them.",
    link: "/checker",
    icon: "link",
    tone: "blue",
    action: "Check link"
  },
  {
    title: "Recovery guide",
    description: "Get practical, step-by-step guidance when you think you have been scammed.",
    link: "/chatbot",
    icon: "recovery",
    tone: "green",
    action: "Get help"
  }
];

exports.getFeatures = () => features;
