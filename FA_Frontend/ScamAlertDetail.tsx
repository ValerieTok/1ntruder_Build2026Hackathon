import type { Alert } from "./types";

interface ScamAlertDetailProps {
  alert: Alert | null;
  onClose: () => void;
}

export function ScamAlertDetail({ alert, onClose }: ScamAlertDetailProps) {
  if (!alert) return null;

  return (
    <div className="alert-detail-modal" onClick={(e) => e.target === event?.currentTarget && onClose()} style={{ display: alert ? "flex" : "none" }}>
      <div className="alert-detail-content">
        <button className="alert-detail-close" onClick={onClose} aria-label="Close detail view">
          ×
        </button>
        <img src={alert.image} alt={alert.title} className="alert-detail-image" />
        <div className="alert-detail-body">
          <div className="alert-detail-header">
            <div>
              <h2 className="alert-detail-title">{alert.title}</h2>
              <div className="alert-detail-meta">
                <span>Reported: {alert.reportedDate}</span>
                <span className={`alert-risk-badge ${alert.risk.toLowerCase()}`}>{alert.risk} Risk</span>
                <span className="alert-category-badge">{alert.category}</span>
              </div>
            </div>
          </div>
          <div className="alert-detail-section">
            <p>{alert.description}</p>
          </div>
          <div className="alert-detail-section">
            <h3>Warning Signs</h3>
            <ul>
              {alert.warningSigns.map((sign) => (
                <li key={sign}>{sign}</li>
              ))}
            </ul>
          </div>
          <div className="alert-detail-section">
            <h3>Recommended Actions</h3>
            <ul>
              {alert.recommendedActions.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
