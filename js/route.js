// ========== УПРАВЛЕНИЕ МАРШРУТОМ С DRAG-AND-DROP (поддержка мобильных) ==========

let draggedItem = null;
let draggedIndex = -1;
let touchStartY = 0;
let touchStartX = 0;
let isDragging = false;
let dragImage = null;

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

  // Включаем drag-and-drop для всех устройств
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
    card.addEventListener("dragstart", handleDragStart);
    card.addEventListener("dragend", handleDragEnd);
    card.addEventListener("dragover", handleDragOver);
    card.addEventListener("drop", handleDrop);

    // Для мобильных устройств (touch)
    card.addEventListener("touchstart", handleTouchStart, { passive: false });
    card.addEventListener("touchmove", handleTouchMove, { passive: false });
    card.addEventListener("touchend", handleTouchEnd);
    card.addEventListener("touchcancel", handleTouchCancel);

    // Предотвращаем стандартное поведение
    card.addEventListener("dragenter", (e) => e.preventDefault());
    card.addEventListener("dragleave", (e) => e.preventDefault());
  });
}

// ===== ОБРАБОТЧИКИ ДЛЯ МЫШИ (ДЕСКТОП) =====
function handleDragStart(e) {
  draggedItem = this;
  draggedIndex = parseInt(this.getAttribute("data-order"));
  this.classList.add("dragging");
  e.dataTransfer.setData("text/plain", this.getAttribute("data-center-id"));
  e.dataTransfer.effectAllowed = "move";
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

// ===== ОБРАБОТЧИКИ ДЛЯ TOUCH (МОБИЛЬНЫЕ) =====
function handleTouchStart(e) {
  e.preventDefault();

  const touch = e.touches[0];
  touchStartY = touch.clientY;
  touchStartX = touch.clientX;

  draggedItem = this;
  draggedIndex = parseInt(this.getAttribute("data-order"));

  // Создаем клон элемента для перетаскивания
  dragImage = this.cloneNode(true);
  dragImage.classList.add("dragging-clone");
  dragImage.style.position = "fixed";
  dragImage.style.left = touch.clientX + "px";
  dragImage.style.top = touch.clientY + "px";
  dragImage.style.width = this.offsetWidth + "px";
  dragImage.style.opacity = "0.8";
  dragImage.style.transform = "translate(-50%, -50%)";
  dragImage.style.pointerEvents = "none";
  dragImage.style.zIndex = "1000";

  document.body.appendChild(dragImage);

  this.classList.add("dragging-source");
  isDragging = true;
}

function handleTouchMove(e) {
  if (!isDragging || !dragImage || !draggedItem) return;

  e.preventDefault();

  const touch = e.touches[0];

  // Обновляем позицию клона
  dragImage.style.left = touch.clientX + "px";
  dragImage.style.top = touch.clientY + "px";

  // Находим элемент, над которым сейчас touch
  const elementsAtTouch = document.elementsFromPoint(
    touch.clientX,
    touch.clientY,
  );
  const targetCard = elementsAtTouch.find(
    (el) => el.classList.contains("center-card") && el !== draggedItem,
  );

  if (targetCard) {
    const targetIndex = parseInt(targetCard.getAttribute("data-order"));
    const cards = [...document.querySelectorAll(".center-card")];

    // Визуально подсвечиваем место вставки
    cards.forEach((card) => card.classList.remove("drop-target"));
    targetCard.classList.add("drop-target");
  }
}

function handleTouchEnd(e) {
  if (!isDragging || !draggedItem) return;

  e.preventDefault();

  // Удаляем клон
  if (dragImage && dragImage.parentNode) {
    dragImage.parentNode.removeChild(dragImage);
    dragImage = null;
  }

  // Находим конечную позицию
  const touch = e.changedTouches[0];
  const elementsAtTouch = document.elementsFromPoint(
    touch.clientX,
    touch.clientY,
  );
  const targetCard = elementsAtTouch.find(
    (el) => el.classList.contains("center-card") && el !== draggedItem,
  );

  if (targetCard) {
    const targetIndex = parseInt(targetCard.getAttribute("data-order"));
    const cards = [...document.querySelectorAll(".center-card")];

    // Убираем подсветку
    cards.forEach((card) => card.classList.remove("drop-target"));

    if (draggedIndex !== targetIndex) {
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
  }

  draggedItem.classList.remove("dragging-source");
  isDragging = false;
  draggedItem = null;
  draggedIndex = -1;

  // Сохраняем новый порядок
  updateRouteOrder();
}

function handleTouchCancel(e) {
  if (dragImage && dragImage.parentNode) {
    dragImage.parentNode.removeChild(dragImage);
    dragImage = null;
  }

  if (draggedItem) {
    draggedItem.classList.remove("dragging-source");
  }

  const cards = [...document.querySelectorAll(".center-card")];
  cards.forEach((card) => card.classList.remove("drop-target"));

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
  tg.showPopup({
    title: "Маршрут обновлен",
    message: "Новый порядок точек сохранен",
    buttons: [{ type: "ok" }],
  });
}
