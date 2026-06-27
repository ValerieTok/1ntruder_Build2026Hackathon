export interface Alert {
  id: string;
  slug?: string;
  title: string;
  articleHeadline?: string;
  reportedDate: string;
  readTime?: string;
  views?: number;
  author?: string;
  risk: "High" | "Medium" | "Low";
  category: string;
  description: string;
  image: string;
  warningSigns: string[];
  recommendedActions: string[];
  articleContent?: {
    overview: string[];
    howItWorks: string[];
    steps: string[];
    warningSigns: string[];
    protectionTips: string[];
    whatToDo: string[];
    resources: Array<{ label: string; url: string }>;
  };
}
