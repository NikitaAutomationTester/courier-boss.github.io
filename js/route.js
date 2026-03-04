// ========== УПРАВЛЕНИЕ МАРШРУТОМ ==========

let draggedItem = null;
let draggedIndex = -1;
let isDragging = false;
let scrollInterval = null;
let hasChanged = false;

const SCROLL_ZONE_HEIGHT = 50;
const SCROLL_SPEED = 10;

async function loadRouteData() {
  await loadRouteOrder();
  const points = getCurrentRoutePoints();
  console.log("📍 Маршрут загружен, точек:", points.length);
  renderCentersList(points);
}

function renderCentersList(centers) {
  if (!centersList) return;
  centersList.innerHTML = "";

  centers.forEach((center, index) => {
    const card = createCenterCard(center, index + 1);
    centersList.appendChild(card);
  });

  enableDragAndDrop();
}

function createCenterCard(center, orderNumber) {
  const card = document.createElement("div");
  card.className = "center-card";
  card.setAttribute("draggable", "true");
  card.setAttribute("data-center-id", center.id);
  card.setAttribute("data-order", orderNumber - 1);

  card.innerHTML = `
    <div class="center-header">
      <span class="order-number">${orderNumber}</span>
      <div class="name-time-wrapper">
        <span class="center-name" title="${center.name}">${center.name}</span>
        <span class="center-time">${center.timeWindow}</span>
      </div>
      <span class="drag-handle">⋮⋮</span>
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

function enableDragAndDrop() {
  const cards = document.querySelectorAll(".center-card");

  cards.forEach((card) => {
    card.addEventListener("dragstart", handleDragStart);
    card.addEventListener("dragend", handleDragEnd);
    card.addEventListener("dragover", handleDragOver);
    card.addEventListener("drop", handleDrop);

    card.addEventListener("dragenter", (e) => e.preventDefault());
    card.addEventListener("dragleave", (e) => e.preventDefault());
  });
}

function handleDragStart(e) {
  draggedItem = this;
  draggedIndex = parseInt(this.getAttribute("data-order"));
  this.classList.add("dragging");
  e.dataTransfer.setData("text/plain", this.getAttribute("data-center-id"));
  e.dataTransfer.effectAllowed = "move";
  hasChanged = false;

  console.log("🚀 Начало перетаскивания, индекс:", draggedIndex);
}

function handleDragEnd(e) {
  this.classList.remove("dragging");

  if (draggedItem && hasChanged) {
    console.log("🏁 Конец перетаскивания с изменениями");
    updateRouteOrder(false);
  }

  stopScrolling();
  draggedItem = null;
  draggedIndex = -1;
  isDragging = false;
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";

  // Автоматическая прокрутка при приближении к краю
  const container = document.querySelector(".medical-centers-list");
  if (container) {
    const rect = container.getBoundingClientRect();
    const mouseY = e.clientY;

    if (mouseY < rect.top + SCROLL_ZONE_HEIGHT) {
      startScrolling(-SCROLL_SPEED);
    } else if (mouseY > rect.bottom - SCROLL_ZONE_HEIGHT) {
      startScrolling(SCROLL_SPEED);
    } else {
      stopScrolling();
    }
  }
}

function handleDrop(e) {
  e.preventDefault();

  const targetCard = this;
  const targetIndex = parseInt(targetCard.getAttribute("data-order"));

  if (draggedIndex === targetIndex) return;

  const cards = [...document.querySelectorAll(".center-card")];

  if (draggedIndex < targetIndex) {
    targetCard.parentNode.insertBefore(draggedItem, targetCard.nextSibling);
  } else {
    targetCard.parentNode.insertBefore(draggedItem, targetCard);
  }

  updateOrderNumbers();
  hasChanged = true;

  console.log(
    `🔄 Элемент перемещен с ${draggedIndex + 1} на ${targetIndex + 1}`,
  );
}

function startScrolling(direction) {
  if (scrollInterval) return;

  scrollInterval = setInterval(() => {
    const container = document.querySelector(".medical-centers-list");
    if (container) {
      container.scrollTop += direction;
    }
  }, 16);
}

function stopScrolling() {
  if (scrollInterval) {
    clearInterval(scrollInterval);
    scrollInterval = null;
  }
}

function updateOrderNumbers() {
  const cards = document.querySelectorAll(".center-card");

  cards.forEach((card, index) => {
    card.setAttribute("data-order", index);
    const orderSpan = card.querySelector(".order-number");
    if (orderSpan) {
      orderSpan.textContent = index + 1;
    }
  });
}

async function updateRouteOrder(showNotification = false) {
  const cards = document.querySelectorAll(".center-card");
  const newOrder = [];

  cards.forEach((card) => {
    const centerId = parseInt(card.getAttribute("data-center-id"));
    newOrder.push(centerId);
  });

  console.log("💾 Сохраняем новый порядок маршрута:", newOrder);

  const userId = getUserId();
  if (!couriersDB[userId]) {
    couriersDB[userId] = { id: userId, routeOrder: newOrder };
  } else {
    couriersDB[userId].routeOrder = newOrder;
  }

  await saveRouteOrder(newOrder);

  // Показываем уведомление только если нужно
  if (showNotification && tg) {
    tg.showPopup({
      title: "Маршрут обновлен",
      message: "Новый порядок точек сохранен",
      buttons: [{ type: "ok" }],
    });
  }
}
