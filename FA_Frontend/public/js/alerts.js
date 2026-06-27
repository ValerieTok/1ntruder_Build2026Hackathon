const alertsGrid = document.getElementById("alertsGrid");
const searchInput = document.getElementById("searchInput");
const categorySelect = document.getElementById("categorySelect");
const sortSelect = document.getElementById("sortSelect");
const rawAlerts = window.__ALERTS_DATA__ || [];

const riskOrder = { High: 0, Medium: 1, Low: 2 };

function createAlertCard(alert) {
  const card = document.createElement("article");
  card.className = "alert-card";
  card.dataset.category = alert.category;
  card.dataset.risk = alert.risk;
  card.dataset.title = alert.title;
  card.dataset.description = alert.description;

  const header = document.createElement("div");
  header.className = "alert-card-header";
  header.innerHTML = `
    <div>
      <h2 class="alert-title">${alert.title}</h2>
      <p class="alert-metadata"><span>Reported: ${alert.reportedDate}</span></p>
    </div>
    <span class="status-badge ${alert.risk.toLowerCase()}">${alert.risk} Risk</span>
  `;

  const category = document.createElement("div");
  category.className = "alert-category";
  category.textContent = alert.category;

  const copy = document.createElement("div");
  copy.className = "alert-copy";
  copy.innerHTML = `<p>${alert.description}</p>`;

  const lists = document.createElement("div");
  lists.className = "alert-lists";
  lists.innerHTML = `
    <div>
      <strong>Warning Signs:</strong>
      <ul>${alert.warningSigns.map((sign) => `<li>${sign}</li>`).join("")}</ul>
    </div>
    <div>
      <strong>Recommended Actions:</strong>
      <ul>${alert.recommendedActions.map((action) => `<li>${action}</li>`).join("")}</ul>
    </div>
  `;

  const actions = document.createElement("div");
  actions.className = "alert-actions";
  actions.innerHTML = `<a class="alert-button" href="#">Read More</a>`;

  card.append(header, category, copy, lists, actions);
  return card;
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
    emptyState.textContent = "No alerts found. Adjust the filters or search keywords to try again.";
    emptyState.style.color = "#52606d";
    alertsGrid.appendChild(emptyState);
    return;
  }

  filtered.forEach((alert) => alertsGrid.appendChild(createAlertCard(alert)));
}

if (alertsGrid && searchInput && categorySelect && sortSelect) {
  searchInput.addEventListener("input", filterAlerts);
  categorySelect.addEventListener("change", filterAlerts);
  sortSelect.addEventListener("change", filterAlerts);
  filterAlerts();
}
