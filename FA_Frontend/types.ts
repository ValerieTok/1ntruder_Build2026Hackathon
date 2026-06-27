export interface Alert {
  id: string;
  title: string;
  reportedDate: string;
  risk: "High" | "Medium" | "Low";
  category: string;
  description: string;
  warningSigns: string[];
  recommendedActions: string[];
}
