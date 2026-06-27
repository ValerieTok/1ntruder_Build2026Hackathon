import type { Alert } from "./types";

interface AlertCardProps {
  alert: Alert;
  onReadMore: (alert: Alert) => void;
}

export function AlertCard({ alert, onReadMore }: AlertCardProps) {
  return (
    <article className="alert-card-modern">
      <div className="alert-card-image">
        <img src={alert.image} alt={alert.title} loading="lazy" />
      </div>
      <div className="alert-card-content">
        <div className="alert-card-badges">
          <span className="alert-category-badge">{alert.category}</span>
          <span className={`alert-risk-badge ${alert.risk.toLowerCase()}`}>{alert.risk} Risk</span>
        </div>
        <h2 className="alert-card-title">{alert.title}</h2>
        <p className="alert-card-date">Reported: {alert.reportedDate}</p>
        <button className="alert-read-more" type="button" onClick={() => onReadMore(alert)}>
          Read More <span aria-hidden="true">→</span>
        </button>
      </div>
    </article>
  );
}
