// ========== УПРАВЛЕНИЕ МАРШРУТОМ ==========

function loadRouteData() {
  const route = getCurrentCourierRoute();
  console.log("Маршрут загружен, точек:", route.length);
  renderCentersList(route);
}

function renderCentersList(centers) {
  if (!centersList) return;
  centersList.innerHTML = "";

  centers.forEach((center, index) => {
    const card = createCenterCard(center, index + 1);
    centersList.appendChild(card);
  });
}

function createCenterCard(center, orderNumber) {
  const card = document.createElement("div");
  card.className = "center-card";
  card.setAttribute("data-center-id", center.id);
  card.setAttribute("data-order", orderNumber - 1);

  card.innerHTML = `
        <div class="center-header">
            <span class="order-number">${orderNumber}</span>
            <div class="name-time-wrapper">
                <span class="center-name" title="${center.name}">${center.name}</span>
                <span class="center-time">${center.timeWindow}</span>
            </div>
        </div>
        
        <div class="center-details">
            <div class="detail-row">
                <span class="detail-icon">📍</span>
                <span class="detail-text" title="${center.address}">${center.address}</span>
            </div>
            
            <div class="compact-row">
                ${
                  center.schedule
                    ? `
                <span class="compact-item">
                    <span class="detail-icon">📅</span>
                    <span class="detail-text">${center.schedule}</span>
                </span>
                <span class="separator">•</span>
                `
                    : ""
                }
                <span class="compact-item">
                    <span class="detail-icon">🔬</span>
                    <span class="detail-text">${center.lab || "Не указана"}</span>
                </span>
            </div>
        </div>
    `;

  return card;
}
