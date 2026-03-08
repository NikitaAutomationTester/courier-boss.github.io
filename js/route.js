// ========== УПРАВЛЕНИЕ МАРШРУТОМ С РЕЖИМОМ РЕДАКТИРОВАНИЯ ==========

let isEditMode = false;
let currentRoutePoints = [];

async function loadRouteData() {
  console.log("🔄 loadRouteData: начало загрузки");

  // Сначала пробуем загрузить сохраненный маршрут
  await loadRouteOrder();

  // Получаем точки для отображения
  currentRoutePoints = getCurrentRoutePoints();
  console.log("📍 Маршрут загружен, точек:", currentRoutePoints.length);

  if (currentRoutePoints.length === 0) {
    console.warn("⚠️ Нет точек для отображения!");
    // Показываем сообщение об ошибке
    if (centersList) {
      centersList.innerHTML =
        '<div class="empty-list-message">Нет точек маршрута</div>';
    }
    return;
  }

  renderCentersList(currentRoutePoints);

  // Сбрасываем режим редактирования
  isEditMode = false;
  updateEditButtonState();
}

function renderCentersList(centers) {
  if (!centersList) {
    console.error("❌ centersList не найден");
    return;
  }

  centersList.innerHTML = "";

  centers.forEach((center, index) => {
    const card = createCenterCard(center, index + 1);
    centersList.appendChild(card);
  });

  console.log(`✅ Отрендерено ${centers.length} карточек`);
}

function createCenterCard(center, orderNumber) {
  if (!center) {
    console.error("❌ center is undefined");
    return document.createElement("div");
  }

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
        <span class="center-name" title="${center.name || ""}">${center.name || "Без названия"}</span>
        <span class="center-time">${center.timeWindow || ""}</span>
      </div>
    </div>
    
    <div class="center-details">
      <div class="detail-row">
        <span class="detail-icon">📍</span>
        <span class="detail-text" title="${center.address || ""}">${center.address || "Адрес не указан"}</span>
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

// ===== ФУНКЦИИ ДЛЯ МЕНЮ С ТРЕМЯ ТОЧКАМИ =====
function initRouteMenu() {
  const menuBtn = document.getElementById("routeMenuBtn");
  const dropdown = document.getElementById("routeDropdown");
  const editOrderBtn = document.getElementById("editOrderBtn");
  const addMCPointBtn = document.getElementById("addMCPointBtn");

  if (!menuBtn || !dropdown) return;

  // Обработчик для открытия/закрытия меню
  menuBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    const isVisible = dropdown.style.display === "block";
    dropdown.style.display = isVisible ? "none" : "block";
  });

  // Закрытие меню при клике вне его
  document.addEventListener("click", function (e) {
    if (!menuBtn.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = "none";
    }
  });

  // Обработчик для "Изменить порядок"
  if (editOrderBtn) {
    editOrderBtn.addEventListener("click", function () {
      dropdown.style.display = "none";
      // Вызываем существующую функцию переключения режима редактирования
      if (typeof window.toggleEditMode === "function") {
        window.toggleEditMode();
      } else {
        console.error("Функция toggleEditMode не найдена");
      }
    });
  }

  // Обработчик для "Добавить МЦ"
  if (addMCPointBtn) {
    addMCPointBtn.addEventListener("click", function () {
      dropdown.style.display = "none";
      // Пока просто показываем сообщение
      if (tg) {
        tg.showPopup({
          title: "Добавление МЦ",
          message:
            "Функция добавления медицинского центра будет реализована позже",
          buttons: [{ type: "ok" }],
        });
      } else {
        alert("Функция добавления МЦ будет реализована позже");
      }
    });
  }
}

// Глобальная функция для переключения режима редактирования
window.toggleEditMode = function () {
  console.log("🔄 Переключение режима редактирования");
  isEditMode = !isEditMode;

  const cards = document.querySelectorAll(".center-card");
  const controls = document.querySelectorAll(".card-controls");
  const editBtn = document.getElementById("editRouteBtn");

  // Если есть отдельная кнопка "Изменить", обновляем её
  if (editBtn) {
    if (isEditMode) {
      editBtn.textContent = "Сохранить";
      editBtn.classList.add("active");
    } else {
      editBtn.textContent = "Изменить";
      editBtn.classList.remove("active");
    }
  }

  if (isEditMode) {
    console.log("✅ Включаем режим редактирования");
    // Включаем режим редактирования
    controls.forEach((control) => {
      control.style.display = "flex";
    });
  } else {
    console.log("✅ Выключаем режим редактирования");
    // Выключаем режим редактирования
    controls.forEach((control) => {
      control.style.display = "none";
    });

    // Сохраняем изменения при выходе из режима
    saveRouteChanges();
  }
};

function updateEditButtonState() {
  // Эта функция больше не нужна, но оставим для совместимости
  const editBtn = document.getElementById("editRouteBtn");
  if (editBtn) {
    editBtn.textContent = isEditMode ? "Сохранить" : "Изменить";
    if (isEditMode) {
      editBtn.classList.add("active");
    } else {
      editBtn.classList.remove("active");
    }
  }
}

// Инициализация страницы маршрута
function initRoutePage() {
  console.log("🔄 Инициализация страницы маршрута");

  // Инициализируем меню с тремя точками
  initRouteMenu();

  const editBtn = document.getElementById("editRouteBtn");
  if (editBtn) {
    const newBtn = editBtn.cloneNode(true);
    editBtn.parentNode.replaceChild(newBtn, editBtn);
    newBtn.addEventListener("click", window.toggleEditMode);
    console.log('✅ Обработчик кнопки "Изменить" назначен');
  } else {
    console.log(
      'ℹ️ Кнопка "Изменить" не найдена (используется меню с тремя точками)',
    );
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
