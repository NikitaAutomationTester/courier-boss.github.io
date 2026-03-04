// ========== УПРАВЛЕНИЕ МАРШРУТОМ ==========

let draggedItem = null;
let draggedIndex = -1;
let isDragging = false;
let dragClone = null;
let scrollInterval = null;
let lastMoveY = 0;
let hasChanged = false; // Флаг, был ли перемещен элемент

const SCROLL_ZONE_HEIGHT = 50; // Высота зоны прокрутки в пикселях
const SCROLL_SPEED = 10; // Скорость прокрутки

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
      <span class="drag-handle">≡</span>
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
    const handle = card.querySelector(".drag-handle");

    // Для десктопа (мышь) - перетаскивание только за handle
    handle.addEventListener("mousedown", startDrag);
    card.addEventListener("dragover", handleDragOver);
    card.addEventListener("drop", handleDrop);

    // Для мобильных (touch) - перетаскивание только за handle
    handle.addEventListener("touchstart", startTouchDrag, { passive: false });

    // Отключаем стандартное перетаскивание всей карточки
    card.setAttribute("draggable", "false");
  });
}

function startDrag(e) {
  e.preventDefault();

  // Находим карточку
  draggedItem = e.target.closest(".center-card");
  if (!draggedItem) return;

  draggedIndex = parseInt(draggedItem.getAttribute("data-order"));
  hasChanged = false;

  // Создаем клон
  dragClone = draggedItem.cloneNode(true);
  dragClone.classList.add("dragging-clone");
  dragClone.style.position = "fixed";
  dragClone.style.left = e.clientX + "px";
  dragClone.style.top = e.clientY + "px";
  dragClone.style.width = draggedItem.offsetWidth + "px";
  dragClone.style.transform = "translate(-50%, -50%)";
  dragClone.style.zIndex = "1000";
  dragClone.style.opacity = "0.9";
  dragClone.style.pointerEvents = "none";

  document.body.appendChild(dragClone);

  draggedItem.classList.add("dragging-source");
  isDragging = true;

  // Добавляем обработчики движения мыши
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", endDrag);
}

function startTouchDrag(e) {
  e.preventDefault();

  const touch = e.touches[0];

  // Находим карточку
  draggedItem = e.target.closest(".center-card");
  if (!draggedItem) return;

  draggedIndex = parseInt(draggedItem.getAttribute("data-order"));
  hasChanged = false;

  // Создаем клон
  dragClone = draggedItem.cloneNode(true);
  dragClone.classList.add("dragging-clone");
  dragClone.style.position = "fixed";
  dragClone.style.left = touch.clientX + "px";
  dragClone.style.top = touch.clientY + "px";
  dragClone.style.width = draggedItem.offsetWidth + "px";
  dragClone.style.transform = "translate(-50%, -50%)";
  dragClone.style.zIndex = "1000";
  dragClone.style.opacity = "0.9";
  dragClone.style.pointerEvents = "none";

  document.body.appendChild(dragClone);

  draggedItem.classList.add("dragging-source");
  isDragging = true;

  // Добавляем обработчики касания
  document.addEventListener("touchmove", handleTouchMove, { passive: false });
  document.addEventListener("touchend", endTouchDrag);
  document.addEventListener("touchcancel", cancelTouchDrag);
}

function handleMouseMove(e) {
  if (!isDragging || !dragClone) return;
  e.preventDefault();

  updateDragPosition(e.clientX, e.clientY);
  checkAutoScroll(e.clientY);
}

function handleTouchMove(e) {
  if (!isDragging || !dragClone) return;
  e.preventDefault();

  const touch = e.touches[0];
  updateDragPosition(touch.clientX, touch.clientY);
  checkAutoScroll(touch.clientY);
}

function updateDragPosition(x, y) {
  if (!dragClone) return;

  // Обновляем позицию клона
  dragClone.style.left = x + "px";
  dragClone.style.top = y + "px";

  // Находим элемент под курсором/пальцем
  const elementsAtPoint = document.elementsFromPoint(x, y);
  const targetCard = elementsAtPoint.find(
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

  lastMoveY = y;
}

function checkAutoScroll(y) {
  const container = document.querySelector(".medical-centers-list");
  if (!container) return;

  const containerRect = container.getBoundingClientRect();

  // Проверяем, находится ли курсор в верхней или нижней зоне прокрутки
  if (y < containerRect.top + SCROLL_ZONE_HEIGHT) {
    // Прокрутка вверх
    startScrolling(-SCROLL_SPEED);
  } else if (y > containerRect.bottom - SCROLL_ZONE_HEIGHT) {
    // Прокрутка вниз
    startScrolling(SCROLL_SPEED);
  } else {
    stopScrolling();
  }
}

function startScrolling(direction) {
  if (scrollInterval) return;

  scrollInterval = setInterval(() => {
    const container = document.querySelector(".medical-centers-list");
    if (!container) return;

    container.scrollTop += direction;

    // Обновляем позицию цели после прокрутки
    if (dragClone) {
      const elementsAtPoint = document.elementsFromPoint(
        parseFloat(dragClone.style.left),
        parseFloat(dragClone.style.top),
      );
      const targetCard = elementsAtPoint.find(
        (el) => el.classList.contains("center-card") && el !== draggedItem,
      );

      document.querySelectorAll(".center-card").forEach((card) => {
        card.classList.remove("drop-target");
      });

      if (targetCard) {
        targetCard.classList.add("drop-target");
      }
    }
  }, 16); // ~60fps
}

function stopScrolling() {
  if (scrollInterval) {
    clearInterval(scrollInterval);
    scrollInterval = null;
  }
}

function endDrag(e) {
  e.preventDefault();

  // Убираем клон
  if (dragClone && dragClone.parentNode) {
    dragClone.parentNode.removeChild(dragClone);
    dragClone = null;
  }

  // Убираем подсветку
  document.querySelectorAll(".center-card").forEach((card) => {
    card.classList.remove("drop-target", "dragging-source");
  });

  // Находим цель
  const elementsAtPoint = document.elementsFromPoint(e.clientX, e.clientY);
  const targetCard = elementsAtPoint.find(
    (el) => el.classList.contains("center-card") && el !== draggedItem,
  );

  if (targetCard && draggedItem && hasChanged === false) {
    const targetIndex = parseInt(targetCard.getAttribute("data-order"));

    if (draggedIndex !== targetIndex) {
      const cards = [...document.querySelectorAll(".center-card")];

      if (draggedIndex < targetIndex) {
        targetCard.parentNode.insertBefore(draggedItem, targetCard.nextSibling);
      } else {
        targetCard.parentNode.insertBefore(draggedItem, targetCard);
      }

      updateOrderNumbers();
      hasChanged = true;
    }
  }

  // Останавливаем прокрутку
  stopScrolling();

  // Сбрасываем состояние
  isDragging = false;

  // Если были изменения, сохраняем
  if (hasChanged) {
    updateRouteOrder(false); // false = не показывать уведомление
  }

  // Убираем обработчики
  document.removeEventListener("mousemove", handleMouseMove);
  document.removeEventListener("mouseup", endDrag);

  draggedItem = null;
  draggedIndex = -1;
}

function endTouchDrag(e) {
  e.preventDefault();

  const touch = e.changedTouches[0];

  // Убираем клон
  if (dragClone && dragClone.parentNode) {
    dragClone.parentNode.removeChild(dragClone);
    dragClone = null;
  }

  // Убираем подсветку
  document.querySelectorAll(".center-card").forEach((card) => {
    card.classList.remove("drop-target", "dragging-source");
  });

  // Находим цель
  const elementsAtPoint = document.elementsFromPoint(
    touch.clientX,
    touch.clientY,
  );
  const targetCard = elementsAtPoint.find(
    (el) => el.classList.contains("center-card") && el !== draggedItem,
  );

  if (targetCard && draggedItem && hasChanged === false) {
    const targetIndex = parseInt(targetCard.getAttribute("data-order"));

    if (draggedIndex !== targetIndex) {
      const cards = [...document.querySelectorAll(".center-card")];

      if (draggedIndex < targetIndex) {
        targetCard.parentNode.insertBefore(draggedItem, targetCard.nextSibling);
      } else {
        targetCard.parentNode.insertBefore(draggedItem, targetCard);
      }

      updateOrderNumbers();
      hasChanged = true;
    }
  }

  // Останавливаем прокрутку
  stopScrolling();

  // Сбрасываем состояние
  isDragging = false;

  // Если были изменения, сохраняем
  if (hasChanged) {
    updateRouteOrder(false); // false = не показывать уведомление
  }

  // Убираем обработчики
  document.removeEventListener("touchmove", handleTouchMove);
  document.removeEventListener("touchend", endTouchDrag);
  document.removeEventListener("touchcancel", cancelTouchDrag);

  draggedItem = null;
  draggedIndex = -1;
}

function cancelTouchDrag(e) {
  e.preventDefault();

  // Убираем клон
  if (dragClone && dragClone.parentNode) {
    dragClone.parentNode.removeChild(dragClone);
    dragClone = null;
  }

  // Убираем подсветку
  document.querySelectorAll(".center-card").forEach((card) => {
    card.classList.remove("drop-target", "dragging-source");
  });

  // Останавливаем прокрутку
  stopScrolling();

  // Сбрасываем состояние
  isDragging = false;

  // Убираем обработчики
  document.removeEventListener("touchmove", handleTouchMove);
  document.removeEventListener("touchend", endTouchDrag);
  document.removeEventListener("touchcancel", cancelTouchDrag);

  draggedItem = null;
  draggedIndex = -1;
}

function handleDragOver(e) {
  e.preventDefault();
}

function handleDrop(e) {
  e.preventDefault();
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

  // Сохраняем в памяти
  const userId = getUserId();
  if (!couriersDB[userId]) {
    couriersDB[userId] = { id: userId, routeOrder: newOrder };
  } else {
    couriersDB[userId].routeOrder = newOrder;
  }

  // Сохраняем в CloudStorage
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
