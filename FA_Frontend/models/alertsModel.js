const alerts = [
  {
    id: "alert-1",
    title: "Fake Bank SMS",
    reportedDate: "Today",
    risk: "High",
    category: "Banking",
    description: "Scammers impersonate DBS and ask users to click a fake login link.",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=450&fit=crop",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500&h=280&fit=crop",
    warningSigns: [
      "Urgent payment request",
      "Suspicious link",
      "Unknown sender"
    ],
    recommendedActions: [
      "Do not click the link",
      "Verify with the official DBS app",
      "Report the message"
    ]
  },
  {
    id: "alert-2",
    title: "Recruitment Fee Job Scam",
    reportedDate: "Yesterday",
    risk: "Medium",
    category: "Job",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=450&fit=crop",
    description: "Fake recruiters ask for upfront fees before offering a job interview.",
    warningSigns: [
      "Fee requested before interview",
      "Unsolicited offer",
      "Non-corporate email address"
    ],
    recommendedActions: [
      "Do not pay any fee",
      "Confirm company details",
      "Use official job portals"
    ]
  },
  {
    id: "alert-3",
    title: "Crypto Investment Pitch",
    reportedDate: "2 days ago",
    risk: "High",
    image: "https://images.unsplash.com/photo-1621761191319-c6fb62b63ef5?w=800&h=450&fit=crop",
    category: "Investment",
    description: "A social media ad promises quick crypto returns and asks users to fund a wallet.",
    warningSigns: [
      "Guaranteed returns",
      "Unknown wallet address",
      "Pressure to act fast"
    ],
    recommendedActions: [
      "Research before investing",
      "Avoid unknown crypto wallets",
      "Report the post to the platform"
    ]
  },
  {
    id: "alert-4",
    title: "Romance Scam Offer",
    reportedDate: "3 days ago",
    risk: "High",
    image: "https://images.unsplash.com/photo-1516534775068-bb57ce47b2d5?w=800&h=450&fit=crop",
    category: "Romance",
    description: "A new match asks for money to cover an emergency or travel expenses.",
    warningSigns: [
      "Requests for money",
      "Stories of sudden trouble",
      "Refusal to video chat"
    ],
    recommendedActions: [
      "Never send money",
      "Verify identity through trusted channels",
      "Report the profile"
    ]
  },
  {
    id: "alert-5",
    title: "Fake Parcel Delivery Alert",
    reportedDate: "4 days ago",
    image: "https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?w=800&h=450&fit=crop",
    risk: "Medium",
    category: "Delivery",
    description: "An SMS claims there is a package issue and directs recipients to a fraudulent tracking link.",
    warningSigns: [
      "Unexpected delivery notice",
      "Link to unknown tracker",
      "Sense of urgency"
    ],
    recommendedActions: [
      "Check delivery status with the carrier",
      "Do not tap suspicious links",
      "Delete the message"
    ]
  },
  {
    id: "alert-6",
    title: "Bank App Login Scam",
    reportedDate: "5 days ago",
    image: "https://images.unsplash.com/photo-1563986768609-322510e8f26b?w=800&h=450&fit=crop",
    risk: "High",
    category: "Phishing",
    description: "A fake bank login page is shared through a message asking for credentials.",
    warningSigns: [
      "Login request via SMS",
      "Unfamiliar URL",
      "Grammar errors"
    ],
    recommendedActions: [
      "Enter credentials only on the official app",
      "Call your bank directly",
      "Report the phishing attempt"
    ]
  },
  {
    id: "alert-7",
    title: "Social Media Giveaway Scam",
    image: "https://images.unsplash.com/photo-1611262588024-d12430b98920?w=800&h=450&fit=crop",
    reportedDate: "6 days ago",
    risk: "Low",
    category: "Social Media",
    description: "A post promises prizes for sharing personal information and following a fake account.",
    warningSigns: [
      "Too-good-to-be-true reward",
      "Requests for personal data",
      "Unknown contest organizer"
    ],
    recommendedActions: [
      "Avoid sharing data",
      "Verify the giveaway source",
      "Report the suspicious post"
    ]
  },
  {
    id: "alert-8",
    title: "Rental Deposit Scam",
    image: "https://images.unsplash.com/photo-1560448204-e02f7cbb8f0c?w=800&h=450&fit=crop",
    reportedDate: "Last week",
    risk: "Medium",
    category: "Others",
    description: "A fake landlord asks for a deposit before showing the property.",
    warningSigns: [
      "Payment before viewing",
      "Pressure to act quickly",
      "No official lease documents"
    ],
    recommendedActions: [
      "Inspect the property first",
      "Use verified rental platforms",
      "Never pay in cash to strangers"
    ]
  }
];

const categories = [
  "Phishing",
  "Job",
  "Investment",
  "Romance",
  "Delivery",
  "Banking",
  "Social Media",
  "Others"
];

const trends = [
  "Fake QR payment scams",
  "AI voice impersonation scams",
  "WhatsApp recruitment scams",
  "Fake parcel delivery messages"
];

const safetyTips = [
  "Never share OTPs",
  "Verify suspicious messages",
  "Avoid clicking unknown links",
  "Contact organisations through official channels"
];

function getSummaryStats() {
  const todayCount = alerts.filter((item) => item.reportedDate.toLowerCase().includes("today")).length;
  const highRiskCount = alerts.filter((item) => item.risk === "High").length;
  const activeScams = alerts.length;
  const weeklyCount = alerts.filter((item) => !item.reportedDate.toLowerCase().includes("last week")).length;

  return {
    today: todayCount,
    active: activeScams,
    highRisk: highRiskCount,
    weekly: weeklyCount
  };
}

exports.getAlerts = () => alerts;
exports.getCategories = () => categories;
exports.getTrends = () => trends;
exports.getSafetyTips = () => safetyTips;
exports.getSummaryStats = getSummaryStats;
