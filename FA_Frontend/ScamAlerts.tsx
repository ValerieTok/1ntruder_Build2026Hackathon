import { useState } from "react";
import type { Alert } from "./types";
import { AlertCard } from "./AlertCard";
import { ScamAlertDetail } from "./ScamAlertDetail";
import { alerts } from "./alerts";

export function ScamAlerts() {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "risk">("recent");

  const categories = ["Phishing", "Job", "Investment", "Romance", "Delivery", "Banking", "Social Media", "Others"];
  const riskOrder = { High: 0, Medium: 1, Low: 2 };

  const filteredAlerts = alerts
    .filter((alert) => {
      const searchText = [alert.title, alert.category, alert.description, ...alert.warningSigns, ...alert.recommendedActions]
        .join(" ")
        .toLowerCase();
      const matchesSearch = !searchQuery || searchText.includes(searchQuery.toLowerCase());
      const matchesCategory = !categoryFilter || alert.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "risk") {
        return riskOrder[a.risk] - riskOrder[b.risk];
      }
      return a.reportedDate === b.reportedDate ? 0 : a.reportedDate === "Today" ? -1 : b.reportedDate === "Today" ? 1 : 0;
    });

  const stats = {
    today: alerts.filter((item) => item.reportedDate.toLowerCase().includes("today")).length,
    active: alerts.length,
    highRisk: alerts.filter((item) => item.risk === "High").length,
    weekly: alerts.filter((item) => !item.reportedDate.toLowerCase().includes("last week")).length
  };

  return (
    <main className="scam-alerts-page">
      <section className="scam-alerts-hero">
        <p className="section-label">Scam alerts</p>
        <h1>Latest Scam Alerts</h1>
        <p>Stay informed about newly reported scams and learn how to protect yourself.</p>
      </section>

      <section className="scam-alerts-stats">
        <article className="stat-card">
          <strong>{stats.today}</strong>
          <span>Today's Alerts</span>
        </article>
        <article className="stat-card">
          <strong>{stats.active}</strong>\n          <span>Active Scams</span>
        </article>
        <article className="stat-card">
          <strong>{stats.highRisk}</strong>
          <span>High Risk Alerts</span>
        </article>
        <article className="stat-card">
          <strong>{stats.weekly}</strong>
          <span>Reported This Week</span>
        </article>
      </section>

      <section className="scam-alerts-controls">
        <form>
          <div className="alerts-search-row">
            <div className="alerts-search-input">
              <label htmlFor="searchInput" style={{ display: "none" }}>
                Search
              </label>
              <input
                id="searchInput"
                type="search"
                placeholder="Search scams..."
                autoComplete="off"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="alerts-filters">
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} aria-label="Filter by scam category">
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as "recent" | "risk")} aria-label="Sort alerts">
                <option value="recent">Most Recent</option>
                <option value="risk">Highest Risk</option>
              </select>
            </div>
          </div>
        </form>
      </section>

      <section className="alert-grid">
        {filteredAlerts.length === 0 ? (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px 20px", color: "#52606d" }}>
            No alerts found. Adjust your search or filters.
          </div>
        ) : (
          filteredAlerts.map((alert) => <AlertCard key={alert.id} alert={alert} onReadMore={setSelectedAlert} />)
        )}
      </section>

      <ScamAlertDetail alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
    </main>
  );
}
