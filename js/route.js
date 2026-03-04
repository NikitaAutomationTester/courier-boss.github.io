// ========== УПРАВЛЕНИЕ МАРШРУТОМ С DRAG-AND-DROP ==========

let draggedItem = null;
let draggedIndex = -1;

async function loadRouteData() {
  // Сначала пробуем загрузить сохраненный маршрут
  await loadRouteOrder();

  // Получаем точки для отображения
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

  // Включаем drag-and-drop
  enableDragAndDrop();
}

function createCenterCard(center, orderNumber) {
  const card = document.createElement("div");
  card.className = "center-card";
  card.setAttribute("draggable", "true");
  card.setAttribute("data-center-id", center.id);
  card.setAttribute("data-order", orderNumber - 1);

  // Добавляем иконку для перетаскивания
  const dragIcon = document.createElement("span");
  dragIcon.className = "drag-icon";
  dragIcon.innerHTML = "⋮⋮";
  dragIcon.style.marginRight = "8px";
  dragIcon.style.opacity = "0.5";
  dragIcon.style.fontSize = "18px";
  dragIcon.style.cursor = "grab";

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

  // Добавляем прозрачность при перетаскивании
  this.style.opacity = "0.5";
}

function handleDragEnd(e) {
  this.classList.remove("dragging");
  this.style.opacity = "1";

  if (draggedItem) {
    updateRouteOrder();
  }

  draggedItem = null;
  draggedIndex = -1;
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
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
  console.log(
    `🔄 Элемент перемещен с ${draggedIndex + 1} на ${targetIndex + 1}`,
  );
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

async function updateRouteOrder() {
  const cards = document.querySelectorAll(".center-card");
  const newOrder = [];

  cards.forEach((card) => {
    const centerId = parseInt(card.getAttribute("data-center-id"));
    newOrder.push(centerId);
  });

  console.log("💾 Сохраняем новый порядок маршрута:", newOrder);

  // Сохраняем в памяти
  const userId = getUserId();
  if (!couriersDB[userId]) {
    couriersDB[userId] = { id: userId, routeOrder: newOrder };
  } else {
    couriersDB[userId].routeOrder = newOrder;
  }

  // Сохраняем в CloudStorage
  await saveRouteOrder(newOrder);

  // Показываем уведомление
  tg.showPopup({
    title: "Маршрут обновлен",
    message: "Новый порядок точек сохранен",
    buttons: [{ type: "ok" }],
  });
}
