import type { Alert } from "./types";
import { AlertCard } from "./AlertCard";
import { alerts } from "./alerts";

export function ScamAlerts() {
  const categories = ["Phishing", "Job", "Investment", "Romance", "Delivery", "Banking", "Social Media", "Others"];

  return (
    <main className="scam-alerts-page">
      <section className="scam-alerts-hero">
        <p className="section-label">Scam alerts</p>
        <h1>Latest Scam Alerts</h1>
        <p>Stay informed about newly reported scams and learn how to protect yourself.</p>
      </section>

      <section className="scam-alerts-controls">
        <article className="form-card">
          <form>
            <div className="two-column">
              <label htmlFor="searchInput">Search</label>
              <input id="searchInput" type="search" placeholder="Search scam title, category, or warning signs" />

              <label htmlFor="categorySelect">Filter by scam category</label>
              <select id="categorySelect">
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <label htmlFor="sortSelect">Sort by</label>
              <select id="sortSelect">
                <option value="recent">Most Recent</option>
                <option value="risk">Highest Risk</option>
              </select>
            </div>
          </form>
        </article>
      </section>

      <section className="scam-alerts-stats">
        <article className="stat-card">
          <strong>{alerts.filter((item) => item.reportedDate.toLowerCase().includes("today")).length}</strong>
          <span>Today's Alerts</span>
        </article>
        <article className="stat-card">
          <strong>{alerts.length}</strong>
          <span>Active Scams</span>
        </article>
        <article className="stat-card">
          <strong>{alerts.filter((item) => item.risk === "High").length}</strong>
          <span>High Risk Alerts</span>
        </article>
        <article className="stat-card">
          <strong>
            {alerts.filter((item) => !item.reportedDate.toLowerCase().includes("last week")).length}
          </strong>
          <span>Reported This Week</span>
        </article>
      </section>

      <section className="alert-grid">
        {alerts.map((alert) => (
          <AlertCard key={alert.id} alert={alert} />
        ))}
      </section>

      <div className="scam-alerts-lower">
        <section className="trends-panel">
          <h3>Latest Scam Trends</h3>
          <ul className="trend-list">
            <li>Fake QR payment scams</li>
            <li>AI voice impersonation scams</li>
            <li>WhatsApp recruitment scams</li>
            <li>Fake parcel delivery messages</li>
          </ul>
        </section>

        <section className="tips-panel">
          <h3>Safety Tips</h3>
          <ul className="tips-list">
            <li><span>✓</span> Never share OTPs</li>
            <li><span>✓</span> Verify suspicious messages</li>
            <li><span>✓</span> Avoid clicking unknown links</li>
            <li><span>✓</span> Contact organisations through official channels</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
