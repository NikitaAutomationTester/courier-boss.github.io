// ========== УПРАВЛЕНИЕ МАРШРУТОМ ==========

let draggedItem = null;
let draggedIndex = -1;
let touchStartY = 0;
let isDragging = false;
let dragClone = null;
let initialY = 0;
let currentY = 0;

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
    // Для десктопа (мышь)
    card.setAttribute("draggable", "true");
    card.addEventListener("dragstart", handleDragStart);
    card.addEventListener("dragend", handleDragEnd);
    card.addEventListener("dragover", handleDragOver);
    card.addEventListener("drop", handleDrop);

    // Для мобильных (touch)
    card.addEventListener("touchstart", handleTouchStart, { passive: false });
    card.addEventListener("touchmove", handleTouchMove, { passive: false });
    card.addEventListener("touchend", handleTouchEnd);
    card.addEventListener("touchcancel", handleTouchCancel);

    // Отключаем стандартное поведение
    card.addEventListener("dragenter", (e) => e.preventDefault());
    card.addEventListener("dragleave", (e) => e.preventDefault());
  });
}

// ===== ДЕСКТОП (DRAG & DROP) =====
function handleDragStart(e) {
  draggedItem = this;
  draggedIndex = parseInt(this.getAttribute("data-order"));
  this.classList.add("dragging");
  e.dataTransfer.setData("text/plain", this.getAttribute("data-center-id"));
  e.dataTransfer.effectAllowed = "move";
  console.log("🚀 Десктоп: начало перетаскивания");
}

function handleDragEnd(e) {
  this.classList.remove("dragging");

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
    `🔄 Десктоп: перемещен с ${draggedIndex + 1} на ${targetIndex + 1}`,
  );
}

// ===== МОБИЛЬНЫЕ (TOUCH) =====
function handleTouchStart(e) {
  e.preventDefault();

  const touch = e.touches[0];
  draggedItem = this;
  draggedIndex = parseInt(this.getAttribute("data-order"));
  touchStartY = touch.clientY;
  initialY = touch.clientY;
  isDragging = true;

  // Создаем клон элемента
  dragClone = this.cloneNode(true);
  dragClone.classList.add("dragging-clone");
  dragClone.style.position = "fixed";
  dragClone.style.left = touch.clientX + "px";
  dragClone.style.top = touch.clientY + "px";
  dragClone.style.width = this.offsetWidth + "px";
  dragClone.style.transform = "translate(-50%, -50%)";
  dragClone.style.zIndex = "1000";
  dragClone.style.opacity = "0.9";
  dragClone.style.pointerEvents = "none";

  document.body.appendChild(dragClone);

  // Подсвечиваем исходный элемент
  this.classList.add("dragging-source");

  console.log("📱 Мобильное: начало перетаскивания");
}

function handleTouchMove(e) {
  if (!isDragging || !dragClone) return;
  e.preventDefault();

  const touch = e.touches[0];
  currentY = touch.clientY;

  // Обновляем позицию клона
  dragClone.style.left = touch.clientX + "px";
  dragClone.style.top = touch.clientY + "px";

  // Находим элемент под пальцем
  const elementsAtTouch = document.elementsFromPoint(
    touch.clientX,
    touch.clientY,
  );
  const targetCard = elementsAtTouch.find(
    (el) => el.classList.contains("center-card") && el !== draggedItem,
  );

  // Убираем подсветку со всех
  document.querySelectorAll(".center-card").forEach((card) => {
    card.classList.remove("drop-target");
  });

  // Подсвечиваем цель
  if (targetCard) {
    targetCard.classList.add("drop-target");
  }
}

function handleTouchEnd(e) {
  if (!isDragging || !dragClone) return;
  e.preventDefault();

  const touch = e.changedTouches[0];

  // Удаляем клон
  if (dragClone && dragClone.parentNode) {
    dragClone.parentNode.removeChild(dragClone);
    dragClone = null;
  }

  // Убираем подсветку
  document.querySelectorAll(".center-card").forEach((card) => {
    card.classList.remove("drop-target", "dragging-source");
  });

  // Находим цель
  const elementsAtTouch = document.elementsFromPoint(
    touch.clientX,
    touch.clientY,
  );
  const targetCard = elementsAtTouch.find(
    (el) => el.classList.contains("center-card") && el !== draggedItem,
  );

  if (targetCard && draggedItem) {
    const targetIndex = parseInt(targetCard.getAttribute("data-order"));
    const cards = [...document.querySelectorAll(".center-card")];

    if (draggedIndex !== targetIndex) {
      if (draggedIndex < targetIndex) {
        targetCard.parentNode.insertBefore(draggedItem, targetCard.nextSibling);
      } else {
        targetCard.parentNode.insertBefore(draggedItem, targetCard);
      }

      updateOrderNumbers();
      console.log(
        `📱 Мобильное: перемещен с ${draggedIndex + 1} на ${targetIndex + 1}`,
      );
    }
  }

  // Сбрасываем состояние
  isDragging = false;
  draggedItem = null;
  draggedIndex = -1;

  // Сохраняем новый порядок
  updateRouteOrder();
}

function handleTouchCancel(e) {
  if (dragClone && dragClone.parentNode) {
    dragClone.parentNode.removeChild(dragClone);
    dragClone = null;
  }

  document.querySelectorAll(".center-card").forEach((card) => {
    card.classList.remove("drop-target", "dragging-source");
  });

  isDragging = false;
  draggedItem = null;
  draggedIndex = -1;
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
  if (tg) {
    tg.showPopup({
      title: "Маршрут обновлен",
      message: "Новый порядок точек сохранен",
      buttons: [{ type: "ok" }],
    });
  } else {
    alert("Маршрут обновлен");
  }
}
