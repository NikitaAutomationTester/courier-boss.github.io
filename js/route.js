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
    cards[currentIndex - 1].parentNode.insertBefore(
      card,
      cards[currentIndex - 1],
    );
  } else if (direction === "down" && currentIndex < cards.length - 1) {
    cards[currentIndex + 1].parentNode.insertBefore(
      cards[currentIndex + 1],
      card,
    );
  } else {
    return;
  }

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

  const userId = getUserId();
  if (!couriersDB[userId]) {
    couriersDB[userId] = { id: userId, routeOrder: newOrder };
  } else {
    couriersDB[userId].routeOrder = newOrder;
  }

  await saveRouteOrder(newOrder);

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
let menuInitialized = false;

function initRouteMenu() {
  if (menuInitialized) return;

  const menuBtn = document.getElementById("routeMenuBtn");
  const dropdown = document.getElementById("routeDropdown");
  const editOrderBtn = document.getElementById("editOrderBtn");
  const addMCPointBtn = document.getElementById("addMCPointBtn");

  if (!menuBtn || !dropdown) return;

  console.log("🔄 Инициализация меню маршрута");

  const newMenuBtn = menuBtn.cloneNode(true);
  menuBtn.parentNode.replaceChild(newMenuBtn, menuBtn);

  const newDropdown = document.getElementById("routeDropdown");
  const newEditBtn = document.getElementById("editOrderBtn");
  const newAddBtn = document.getElementById("addMCPointBtn");

  // Обработчик для открытия/закрытия меню
  newMenuBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    e.preventDefault();

    const isVisible = newDropdown.style.display === "block";
    console.log("📱 Меню: клик, сейчас видимость:", isVisible);
    newDropdown.style.display = isVisible ? "none" : "block";
  });

  // Закрытие меню при клике вне его
  document.addEventListener("click", function closeMenu(e) {
    if (!newMenuBtn.contains(e.target) && !newDropdown.contains(e.target)) {
      if (newDropdown.style.display === "block") {
        newDropdown.style.display = "none";
      }
    }
  });

  // Обработчик для "Изменить порядок"
  if (newEditBtn) {
    newEditBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      e.preventDefault();
      console.log("📱 Выбрано: Изменить порядок");
      newDropdown.style.display = "none";

      // Включаем режим редактирования
      enableEditMode();
    });
  }

  // Обработчик для "Добавить МЦ"
  if (newAddBtn) {
    newAddBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      e.preventDefault();
      console.log("📱 Выбрано: Добавить МЦ");
      newDropdown.style.display = "none";

      // Запускаем процесс добавления нового МЦ
      startAddCenterWizard();
    });
  }

  menuInitialized = true;
  console.log("✅ Меню маршрута инициализировано");
}

// Функция для включения режима редактирования
function enableEditMode() {
  console.log("✅ Включаем режим редактирования");
  isEditMode = true;

  // Показываем кнопки управления
  const controls = document.querySelectorAll(".card-controls");
  controls.forEach((control) => {
    control.style.display = "flex";
  });

  // Меняем ⋮ на кнопку "Готово"
  const menuContainer = document.querySelector(".menu-container");
  if (menuContainer) {
    menuContainer.innerHTML =
      '<button class="done-button" id="doneEditBtn">Готово</button>';

    const doneBtn = document.getElementById("doneEditBtn");
    doneBtn.addEventListener("click", function () {
      disableEditMode();
    });
  }
}

// Функция для выключения режима редактирования
function disableEditMode() {
  console.log("✅ Выключаем режим редактирования");
  isEditMode = false;

  // Скрываем кнопки управления
  const controls = document.querySelectorAll(".card-controls");
  controls.forEach((control) => {
    control.style.display = "none";
  });

  // Возвращаем ⋮ с меню
  const menuContainer = document.querySelector(".menu-container");
  if (menuContainer) {
    menuContainer.innerHTML = `
      <button class="menu-dots" id="routeMenuBtn">⋮</button>
      <div class="dropdown-menu" id="routeDropdown" style="display: none;">
        <button class="dropdown-item" id="editOrderBtn">Изменить порядок</button>
        <button class="dropdown-item" id="addMCPointBtn">Добавить МЦ</button>
      </div>
    `;

    // Переинициализируем меню
    menuInitialized = false;
    initRouteMenu();
  }

  // Сохраняем изменения
  saveRouteChanges();
}

// ===== ФУНКЦИИ ДЛЯ ДОБАВЛЕНИЯ НОВОГО МЦ =====
let newCenterData = {};

function startAddCenterWizard() {
  console.log("🔄 Начало добавления нового МЦ");
  newCenterData = {};
  askCenterName();
}

function askCenterName() {
  tg.showPopup(
    {
      title: "Добавление МЦ (1/6)",
      message: "Введите название клиники:",
      buttons: [
        { type: "ok", text: "Далее" },
        { type: "cancel", text: "Отмена" },
      ],
    },
    (buttonId) => {
      if (buttonId === "ok") {
        // Используем стандартный prompt как временное решение
        const name = prompt("Введите название клиники:");
        if (name && name.trim()) {
          newCenterData.name = name.trim();
          askCenterAddress();
        } else {
          tg.showPopup(
            {
              title: "Ошибка",
              message: "Название не может быть пустым",
              buttons: [{ type: "ok", text: "Повторить" }],
            },
            () => askCenterName(),
          );
        }
      }
    },
  );
}

function askCenterAddress() {
  const address = prompt("Введите адрес клиники:");
  if (address && address.trim()) {
    newCenterData.address = address.trim();
    askCenterTimeWindow();
  } else {
    tg.showPopup(
      {
        title: "Ошибка",
        message: "Адрес не может быть пустым",
        buttons: [{ type: "ok", text: "Повторить" }],
      },
      () => askCenterAddress(),
    );
  }
}

function askCenterTimeWindow() {
  const time = prompt("Введите время забора (например, 15:30-16:00):");
  if (time && time.trim()) {
    newCenterData.timeWindow = time.trim();
    askCenterSchedule();
  } else {
    tg.showPopup(
      {
        title: "Ошибка",
        message: "Время не может быть пустым",
        buttons: [{ type: "ok", text: "Повторить" }],
      },
      () => askCenterTimeWindow(),
    );
  }
}

function askCenterSchedule() {
  const schedule = prompt("Введите график работы (например, пн-сб):");
  if (schedule && schedule.trim()) {
    newCenterData.schedule = schedule.trim();
    askCenterLab();
  } else {
    tg.showPopup(
      {
        title: "Ошибка",
        message: "График не может быть пустым",
        buttons: [{ type: "ok", text: "Повторить" }],
      },
      () => askCenterSchedule(),
    );
  }
}

function askCenterLab() {
  const lab = prompt("Введите лабораторию:");
  if (lab && lab.trim()) {
    newCenterData.lab = lab.trim();
    askCenterSalary();
  } else {
    tg.showPopup(
      {
        title: "Ошибка",
        message: "Лаборатория не может быть пустой",
        buttons: [{ type: "ok", text: "Повторить" }],
      },
      () => askCenterLab(),
    );
  }
}

function askCenterSalary() {
  const salary = prompt("Введите зарплату за точку (только число):");
  if (salary && salary.trim() && !isNaN(salary) && Number(salary) > 0) {
    newCenterData.salary = Number(salary);
    confirmAddCenter();
  } else {
    tg.showPopup(
      {
        title: "Ошибка",
        message: "Введите корректное число (больше 0)",
        buttons: [{ type: "ok", text: "Повторить" }],
      },
      () => askCenterSalary(),
    );
  }
}

async function confirmAddCenter() {
  // Показываем сводку
  const summary = `
📋 **Проверьте данные:**

🏥 Название: ${newCenterData.name}
📍 Адрес: ${newCenterData.address}
⏰ Время: ${newCenterData.timeWindow}
📅 График: ${newCenterData.schedule}
🔬 Лаборатория: ${newCenterData.lab}
💰 Зарплата: ${newCenterData.salary}₽

Всё верно?
  `;

  tg.showPopup(
    {
      title: "Подтверждение",
      message: summary,
      buttons: [
        { type: "ok", text: "✅ Добавить" },
        { type: "cancel", text: "❌ Отмена" },
      ],
    },
    async (buttonId) => {
      if (buttonId === "ok") {
        await saveNewCenter();
      }
    },
  );
}

async function saveNewCenter() {
  try {
    // Показываем загрузку
    tg.showPopup({
      title: "Сохранение",
      message: "Добавляем медицинский центр...",
      buttons: [],
    });

    // Сохраняем новый МЦ
    const newId = await saveCustomCenter(newCenterData);

    // Добавляем в начало маршрута
    await addCenterToRouteStart(newId);

    // Обновляем интерфейс
    await loadRouteData();

    // Показываем успех
    tg.showPopup({
      title: "Готово!",
      message: `Медицинский центр добавлен в начало маршрута`,
      buttons: [{ type: "ok", text: "OK" }],
    });
  } catch (error) {
    console.error("❌ Ошибка при добавлении МЦ:", error);
    tg.showPopup({
      title: "Ошибка",
      message: "Не удалось добавить медицинский центр",
      buttons: [{ type: "ok", text: "OK" }],
    });
  }
}

// Глобальная функция для совместимости
window.toggleEditMode = enableEditMode;

// Инициализация страницы маршрута
function initRoutePage() {
  console.log("🔄 Инициализация страницы маршрута");

  // Инициализируем меню с тремя точками
  initRouteMenu();

  // Сбрасываем режим редактирования при загрузке
  isEditMode = false;
  const controls = document.querySelectorAll(".card-controls");
  controls.forEach((control) => {
    control.style.display = "none";
  });

  console.log("✅ Страница маршрута инициализирована");
}

window.initRoutePage = initRoutePage;

// Вызываем инициализацию после загрузки страницы
document.addEventListener("DOMContentLoaded", function () {
  setTimeout(() => {
    if (
      document.getElementById("routePage") &&
      document.getElementById("routePage").style.display === "block"
    ) {
      initRoutePage();
    }
  }, 500);
});
