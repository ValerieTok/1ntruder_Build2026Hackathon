const alertsGrid = document.getElementById("alertsGrid");
const searchInput = document.getElementById("searchInput");
const categorySelect = document.getElementById("categorySelect");
const sortSelect = document.getElementById("sortSelect");
const detailModal = document.getElementById("alertDetailModal");
const detailBody = document.getElementById("alertDetailBody");
const detailClose = document.querySelector(".alert-detail-close");
const rawAlerts = window.__ALERTS_DATA__ || [];

const riskOrder = { High: 0, Medium: 1, Low: 2 };

function createAlertCard(alert) {
  const card = document.createElement("article");
  card.className = "alert-card-modern";
  card.dataset.category = alert.category;
  card.dataset.risk = alert.risk;
  card.dataset.title = alert.title;
  card.dataset.description = alert.description;
  card.dataset.id = alert.id;

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

function renderDetailModal(alert) {
  const detailHtml = `
    <img src="${alert.image}" alt="${alert.title}" class="alert-detail-image">
    <div class="alert-detail-header">
      <div>
        <h2 class="alert-detail-title">${alert.title}</h2>
        <div class="alert-detail-meta">
          <span>Reported: ${alert.reportedDate}</span>
          <span class="alert-risk-badge ${alert.risk.toLowerCase()}">${alert.risk} Risk</span>
          <span class="alert-category-badge">${alert.category}</span>
        </div>
      </div>
    </div>
    <div class="alert-detail-section">
      <p>${alert.description}</p>
    </div>
    <div class="alert-detail-section">
      <h3>Warning Signs</h3>
      <ul>
        ${alert.warningSigns.map((sign) => `<li>${sign}</li>`).join("")}
      </ul>
    </div>
    <div class="alert-detail-section">
      <h3>Recommended Actions</h3>
      <ul>
        ${alert.recommendedActions.map((action) => `<li>${action}</li>`).join("")}
      </ul>
    </div>
  `;

  detailBody.innerHTML = detailHtml;
  detailModal.style.display = "flex";
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
      const text = [alert.title, alert.category, alert.description, ...alert.warningSigns, ...alert.recommendedActions].join(" ").toLowerCase();
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

  filterAlerts();
}
