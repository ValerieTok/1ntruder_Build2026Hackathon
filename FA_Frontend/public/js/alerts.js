const alertsGrid = document.getElementById("alertsGrid");
const searchInput = document.getElementById("searchInput");
const categorySelect = document.getElementById("categorySelect");
const sortSelect = document.getElementById("sortSelect");
const detailModal = document.getElementById("alertDetailModal");
const detailBody = document.getElementById("alertDetailBody");
const detailClose = document.querySelector(".alert-detail-close");
let rawAlerts = [];
const fallbackAlerts = window.__ALERTS_DATA__ || [];

const riskOrder = { High: 0, Medium: 1, Low: 2 };

function createAlertCard(alert) {
  const card = document.createElement("article");
  card.className = "alert-card-modern";
  card.dataset.category = alert.category;
  card.dataset.risk = alert.risk;
  card.dataset.title = alert.title;
  card.dataset.description = alert.description;
  card.dataset.id = alert.id;
  card.dataset.slug = alert.slug || alert.id;

  const imageHtml = `<div class="alert-card-image"><img src="${alert.image}" alt="${alert.title}" loading="lazy"></div>`;

  const badgesHtml = `
    <div class="alert-card-badges">
      <span class="alert-category-badge">${alert.category}</span>
      <span class="alert-risk-badge ${alert.risk.toLowerCase()}">${alert.risk} Risk</span>
    </div>
  `;

  const contentHtml = `
    <div class="alert-card-content">
      ${badgesHtml}
      <h2 class="alert-card-title">${alert.title}</h2>
      <p class="alert-card-date">Reported: ${alert.reportedDate}</p>
      <button class="alert-read-more" data-alert-id="${alert.id}" type="button">Read More <span aria-hidden="true">→</span></button>
    </div>
  `;

  card.innerHTML = imageHtml + contentHtml;
  return card;
}

function showDetailLoading() {
  detailBody.innerHTML = `
    <div class="alert-detail-loading">
      <span class="loading-spinner" aria-hidden="true"></span>
      <span>Loading alert details...</span>
    </div>
  `;
  detailModal.style.display = "flex";
}

async function renderDetailModal(alert) {
  const alertSlug = alert.slug || alert.id;
  let detailAlert = alert;

  showDetailLoading();

  try {
    const response = await fetch(`/api/scam-alerts/${encodeURIComponent(alertSlug)}`);
    if (response.ok) {
      detailAlert = await response.json();
    } else {
      console.warn(`Detail API returned ${response.status}, using local alert data.`);
    }
  } catch (error) {
    console.warn('Could not fetch alert detail from API:', error.message);
  }

  const detailHtml = `
    <img src="${detailAlert.image}" alt="${detailAlert.title}" class="alert-detail-image">
    <div class="alert-detail-header">
      <div>
        <h2 class="alert-detail-title">${detailAlert.title}</h2>
        <div class="alert-detail-meta">
          <span>Reported: ${detailAlert.reportedDate}</span>
          <span class="alert-risk-badge ${detailAlert.risk.toLowerCase()}">${detailAlert.risk} Risk</span>
          <span class="alert-category-badge">${detailAlert.category}</span>
        </div>
      </div>
    </div>
    <div class="alert-detail-section">
      <p>${detailAlert.description}</p>
    </div>
    <div class="alert-detail-section">
      <h3>Warning Signs</h3>
      <ul>
        ${ (Array.isArray(detailAlert.warningSigns) ? detailAlert.warningSigns : []).map((sign) => `<li>${sign}</li>`).join("") }
      </ul>
    </div>
    <div class="alert-detail-section">
      <h3>Recommended Actions</h3>
      <ul>
        ${ (Array.isArray(detailAlert.recommendedActions) ? detailAlert.recommendedActions : []).map((action) => `<li>${action}</li>`).join("") }
      </ul>
    </div>
  `;

  detailBody.innerHTML = detailHtml;
}

function closeDetailModal() {
  detailModal.style.display = "none";
}

function filterAlerts() {
  const query = searchInput.value.trim().toLowerCase();
  const category = categorySelect.value;
  const sortBy = sortSelect.value;

  const filtered = rawAlerts
    .filter((alert) => {
      const warningSigns = Array.isArray(alert.warningSigns) ? alert.warningSigns : [];
      const recommendedActions = Array.isArray(alert.recommendedActions) ? alert.recommendedActions : [];
      const text = [alert.title, alert.category, alert.description, ...warningSigns, ...recommendedActions].join(" ").toLowerCase();
      const matchesSearch = !query || text.includes(query);
      const matchesCategory = !category || alert.category === category;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "risk") {
        return riskOrder[a.risk] - riskOrder[b.risk];
      }
      return a.reportedDate === b.reportedDate ? 0 : a.reportedDate === "Today" ? -1 : b.reportedDate === "Today" ? 1 : 0;
    });

  alertsGrid.innerHTML = "";
  if (filtered.length === 0) {
    const emptyState = document.createElement("div");
    emptyState.style.gridColumn = "1 / -1";
    emptyState.style.textAlign = "center";
    emptyState.style.padding = "40px 20px";
    emptyState.style.color = "#52606d";
    emptyState.textContent = "No alerts found. Adjust your search or filters.";
    alertsGrid.appendChild(emptyState);
    return;
  }

  filtered.forEach((alert) => {
    const card = createAlertCard(alert);
    const readMoreBtn = card.querySelector(".alert-read-more");
    readMoreBtn.addEventListener("click", () => renderDetailModal(alert));
    alertsGrid.appendChild(card);
  });
}

async function loadAlerts() {
  try {
    const response = await fetch('/api/scam-alerts');
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    const payload = await response.json();
    rawAlerts = Array.isArray(payload.alerts) ? payload.alerts : [];
  } catch (error) {
    console.warn('Could not fetch /api/scam-alerts, falling back to inline data:', error.message);
    rawAlerts = fallbackAlerts;
  }

  filterAlerts();
}

if (alertsGrid && searchInput && categorySelect && sortSelect) {
  searchInput.addEventListener("input", filterAlerts);
  categorySelect.addEventListener("change", filterAlerts);
  sortSelect.addEventListener("change", filterAlerts);

  if (detailClose) {
    detailClose.addEventListener("click", closeDetailModal);
  }

  if (detailModal) {
    detailModal.addEventListener("click", (e) => {
      if (e.target === detailModal) {
        closeDetailModal();
      }
    });
  }

  loadAlerts();
}
