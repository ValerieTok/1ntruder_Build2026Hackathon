import type { Alert } from "./types";

interface AlertCardProps {
  alert: Alert;
}

export function AlertCard({ alert }: AlertCardProps) {
  return (
    <article className="alert-card">
      <div className="alert-card-header">
        <div>
          <h2 className="alert-title">{alert.title}</h2>
          <p className="alert-metadata">Reported: {alert.reportedDate}</p>
        </div>
        <span className={`status-badge ${alert.risk.toLowerCase()}`}>{alert.risk} Risk</span>
      </div>
      <div className="alert-category">{alert.category}</div>
      <div className="alert-copy">
        <p>{alert.description}</p>
      </div>
      <div className="alert-lists">
        <div>
          <strong>Warning Signs:</strong>
          <ul>
            {alert.warningSigns.map((sign) => (
              <li key={sign}>{sign}</li>
            ))}
          </ul>
        </div>
        <div>
          <strong>Recommended Actions:</strong>
          <ul>
            {alert.recommendedActions.map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="alert-actions">
        <button type="button" className="alert-button">
          Read More
        </button>
      </div>
    </article>
  );
}
