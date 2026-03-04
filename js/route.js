// ========== УПРАВЛЕНИЕ МАРШРУТОМ С РЕЖИМОМ РЕДАКТИРОВАНИЯ ==========

let isEditMode = false;
let currentRoutePoints = [];

async function loadRouteData() {
  // Сначала пробуем загрузить сохраненный маршрут
  await loadRouteOrder();

  // Получаем точки для отображения
  currentRoutePoints = getCurrentRoutePoints();
  console.log("📍 Маршрут загружен, точек:", currentRoutePoints.length);
  renderCentersList(currentRoutePoints);

  // Сбрасываем режим редактирования
  isEditMode = false;
  updateEditButtonState();
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

  // Основное содержимое карточки
  const content = document.createElement("div");
  content.className = "card-content";
  content.innerHTML = `
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

  // Создаем кнопки управления (скрыты по умолчанию)
  const controls = document.createElement("div");
  controls.className = "card-controls";
  controls.style.display = "none";

  const upBtn = document.createElement("button");
  upBtn.className = "move-btn up-btn";
  upBtn.innerHTML = "↑";
  upBtn.setAttribute("aria-label", "Переместить вверх");

  const downBtn = document.createElement("button");
  downBtn.className = "move-btn down-btn";
  downBtn.innerHTML = "↓";
  downBtn.setAttribute("aria-label", "Переместить вниз");

  controls.appendChild(upBtn);
  controls.appendChild(downBtn);

  card.appendChild(content);
  card.appendChild(controls);

  // Добавляем обработчики для кнопок
  upBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    moveCard(card, "up");
  });

  downBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    moveCard(card, "down");
  });

  return card;
}

function moveCard(card, direction) {
  const cards = [...document.querySelectorAll(".center-card")];
  const currentIndex = cards.indexOf(card);

  if (direction === "up" && currentIndex > 0) {
    // Меняем местами с предыдущей карточкой
    cards[currentIndex - 1].parentNode.insertBefore(
      card,
      cards[currentIndex - 1],
    );
  } else if (direction === "down" && currentIndex < cards.length - 1) {
    // Меняем местами со следующей карточкой
    cards[currentIndex + 1].parentNode.insertBefore(
      cards[currentIndex + 1],
      card,
    );
  } else {
    return; // Нельзя переместить дальше
  }

  // Обновляем номера порядка
  updateOrderNumbers();

  // Показываем подсказку о возможности сохранить
  showSaveHint();
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

function showSaveHint() {
  // Показываем подсказку, что изменения не сохранены
  const saveHint = document.getElementById("saveHint");
  if (!saveHint) {
    const hint = document.createElement("div");
    hint.id = "saveHint";
    hint.className = "save-hint";
    hint.innerHTML =
      'Есть несохраненные изменения <button id="saveChangesBtn">Сохранить</button>';
    document.querySelector(".route-header").after(hint);

    document
      .getElementById("saveChangesBtn")
      .addEventListener("click", saveRouteChanges);
  }
}

async function saveRouteChanges() {
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

  // Убираем подсказку
  const saveHint = document.getElementById("saveHint");
  if (saveHint) saveHint.remove();

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

// Глобальная функция для переключения режима редактирования
window.toggleEditMode = function () {
  console.log("🔄 Переключение режима редактирования");
  isEditMode = !isEditMode;

  const cards = document.querySelectorAll(".center-card");
  const controls = document.querySelectorAll(".card-controls");
  const editBtn = document.getElementById("editRouteBtn");

  if (!editBtn) {
    console.error("❌ Кнопка редактирования не найдена");
    return;
  }

  if (isEditMode) {
    console.log("✅ Включаем режим редактирования");
    // Включаем режим редактирования
    controls.forEach((control) => {
      control.style.display = "flex";
    });
    editBtn.textContent = "Готово";
    editBtn.classList.add("active");
  } else {
    console.log("✅ Выключаем режим редактирования");
    // Выключаем режим редактирования
    controls.forEach((control) => {
      control.style.display = "none";
    });
    editBtn.textContent = "Править";
    editBtn.classList.remove("active");

    // Проверяем, есть ли несохраненные изменения
    const saveHint = document.getElementById("saveHint");
    if (saveHint) {
      // Спрашиваем, хочет ли пользователь сохранить
      if (confirm("У вас есть несохраненные изменения. Сохранить?")) {
        saveRouteChanges();
      } else {
        // Отменяем изменения - перезагружаем маршрут
        loadRouteData();
      }
    }
  }
};

function updateEditButtonState() {
  const editBtn = document.getElementById("editRouteBtn");
  if (editBtn) {
    editBtn.textContent = "Править";
    editBtn.classList.remove("active");
  }
}

// Инициализация обработчика кнопки
function initRoutePage() {
  console.log("🔄 Инициализация страницы маршрута");
  const editBtn = document.getElementById("editRouteBtn");
  if (editBtn) {
    // Удаляем старый обработчик через replace с новым
    const newBtn = editBtn.cloneNode(true);
    editBtn.parentNode.replaceChild(newBtn, editBtn);

    // Добавляем обработчик на новую кнопку
    newBtn.addEventListener("click", window.toggleEditMode);
    console.log('✅ Обработчик кнопки "Править" назначен');
  } else {
    console.error('❌ Кнопка "Править" не найдена в DOM');
  }
}

// Делаем функцию глобальной
window.initRoutePage = initRoutePage;

// Вызываем инициализацию после загрузки страницы
document.addEventListener("DOMContentLoaded", function () {
  // Ждем немного, чтобы страница точно загрузилась
  setTimeout(() => {
    if (
      document.getElementById("routePage") &&
      document.getElementById("routePage").style.display === "block"
    ) {
      initRoutePage();
    }
  }, 500);
});
