const alertsGrid = document.getElementById("alertsGrid");
const searchInput = document.getElementById("searchInput");
const categorySelect = document.getElementById("categorySelect");
const sortSelect = document.getElementById("sortSelect");

let rawAlerts = window.__ALERTS_DATA__ || [];
const riskOrder = { High: 0, Medium: 1, Low: 2 };

function createAlertCard(alert) {
  const slug = alert.slug || alert.id;
  const card = document.createElement("article");

  card.className = "alert-card-modern";
  card.dataset.category = alert.category;
  card.dataset.risk = alert.risk;
  card.dataset.title = alert.title;
  card.dataset.description = alert.description;
  card.dataset.id = alert.id;
  card.dataset.slug = slug;

  card.innerHTML = `
    <a class="alert-card-link" href="/alerts/${encodeURIComponent(slug)}">
      <div class="alert-card-image">
        <img
          src="${alert.image}"
          alt="${alert.title}"
          loading="lazy"
          onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?auto=format&fit=crop&w=900&q=80';"
        >
      </div>

      <div class="alert-card-content">
        <div class="alert-card-badges">
          <span class="alert-category-badge">${alert.category}</span>
          <span class="alert-risk-badge ${alert.risk.toLowerCase()}">${alert.risk} Risk</span>
        </div>

        <h2 class="alert-card-title">${alert.title}</h2>
        <p class="alert-card-date">Reported: ${alert.reportedDate}</p>

        <span class="alert-read-more">
          Read More <span aria-hidden="true">→</span>
        </span>
      </div>
    </a>
  `;

  return card;
}

function filterAlerts() {
  const query = searchInput.value.trim().toLowerCase();
  const category = categorySelect.value;
  const sortBy = sortSelect.value;

  const filtered = rawAlerts
    .filter((alert) => {
      const warningSigns = Array.isArray(alert.warningSigns) ? alert.warningSigns : [];
      const recommendedActions = Array.isArray(alert.recommendedActions) ? alert.recommendedActions : [];

      const text = [
        alert.title,
        alert.category,
        alert.description,
        ...warningSigns,
        ...recommendedActions
      ]
        .join(" ")
        .toLowerCase();

      return (!query || text.includes(query)) && (!category || alert.category === category);
    })
    .sort((a, b) => {
      if (sortBy === "risk") {
        return riskOrder[a.risk] - riskOrder[b.risk];
      }

      if (a.reportedDate === "Today") return -1;
      if (b.reportedDate === "Today") return 1;
      return 0;
    });

  alertsGrid.innerHTML = "";

  if (filtered.length === 0) {
    const emptyState = document.createElement("div");
    emptyState.className = "alerts-empty-state";
    emptyState.textContent = "No alerts found. Adjust your search or filters.";
    alertsGrid.appendChild(emptyState);
    return;
  }

  filtered.forEach((alert) => {
    alertsGrid.appendChild(createAlertCard(alert));
  });
}

async function loadAlerts() {
  try {
    const response = await fetch("/api/scam-alerts");

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const payload = await response.json();
    rawAlerts = Array.isArray(payload.alerts) ? payload.alerts : rawAlerts;
  } catch (error) {
    console.warn("Could not fetch /api/scam-alerts. Using inline alerts:", error.message);
  }

  filterAlerts();
}

if (alertsGrid && searchInput && categorySelect && sortSelect) {
  searchInput.addEventListener("input", filterAlerts);
  categorySelect.addEventListener("change", filterAlerts);
  sortSelect.addEventListener("change", filterAlerts);
  loadAlerts();
}