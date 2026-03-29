document.addEventListener("DOMContentLoaded", () => {
  if (window.WebApp) {
    window.WebApp.ready();
    window.WebApp.expand();
  }

  let currentUserId = null;
  let extraDeliveries = [];
  let currentScreen = "main";
  let currentUser = null;
  let currentUserRole = null;
  let isAuthorized = false;

  // Переменные для фильтров
  let currentFilterCourier = "all";
  let currentFilterDateFrom = "";
  let currentFilterDateTo = "";
  let allReports = [];

  // Элементы DOM
  const mainScreen = document.getElementById("main-screen");
  const deliveriesScreen = document.getElementById("deliveries-screen");
  const accessDeniedScreen = document.getElementById("access-denied-screen");
  const loadingScreen = document.getElementById("loading-screen");
  const authScreen = document.getElementById("auth-screen");
  const adminScreen = document.getElementById("admin-screen");
  const adminReportsBtn = document.getElementById("admin-reports-btn");
  const adminDetailsBtn = document.getElementById("admin-details-btn");
  const authPhone = document.getElementById("auth-phone");
  const authLoginBtn = document.getElementById("auth-login-btn");
  const authError = document.getElementById("auth-error");

  console.log("=== ИНИЦИАЛИЗАЦИЯ ===");
  console.log("mainScreen найден:", !!mainScreen);
  console.log("authScreen найден:", !!authScreen);
  console.log("adminScreen найден:", !!adminScreen);
  console.log("deliveriesScreen найден:", !!deliveriesScreen);

  // Показываем экран загрузки
  function showLoading() {
    console.log("showLoading вызван");
    if (loadingScreen) loadingScreen.style.display = "flex";
    if (mainScreen) mainScreen.style.display = "none";
    if (deliveriesScreen) deliveriesScreen.style.display = "none";
    if (accessDeniedScreen) accessDeniedScreen.style.display = "none";
    if (authScreen) authScreen.style.display = "none";
    if (adminScreen) adminScreen.style.display = "none";
    const reportsListScreen = document.getElementById("reports-list-screen");
    const reportDetailScreen = document.getElementById("report-detail-screen");
    const detailsScreen = document.getElementById("details-screen");
    if (reportsListScreen) reportsListScreen.style.display = "none";
    if (reportDetailScreen) reportDetailScreen.style.display = "none";
    if (detailsScreen) detailsScreen.style.display = "none";
  }

  // Скрываем экран загрузки
  function hideLoading() {
    console.log("hideLoading вызван");
    if (loadingScreen) loadingScreen.style.display = "none";
  }

  // Показываем экран авторизации
  function showAuthScreen() {
    console.log("showAuthScreen вызван");
    hideLoading();

    if (authScreen) {
      authScreen.style.cssText = `
        display: flex !important;
        visibility: visible !important;
        opacity: 1 !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        z-index: 100 !important;
        background-color: var(--max-bg-color, #ffffff) !important;
      `;
      console.log("authScreen принудительно показан");
    }
    if (mainScreen) mainScreen.style.display = "none";
    if (deliveriesScreen) deliveriesScreen.style.display = "none";
    if (accessDeniedScreen) accessDeniedScreen.style.display = "none";
    if (adminScreen) adminScreen.style.display = "none";
    if (authError) authError.style.display = "none";
    const reportsListScreen = document.getElementById("reports-list-screen");
    const reportDetailScreen = document.getElementById("report-detail-screen");
    const detailsScreen = document.getElementById("details-screen");
    if (reportsListScreen) reportsListScreen.style.display = "none";
    if (reportDetailScreen) reportDetailScreen.style.display = "none";
    if (detailsScreen) detailsScreen.style.display = "none";
  }

  // Показываем экран отказа в доступе
  function showAccessDenied(
    message = "У вас нет прав для использования этого приложения",
  ) {
    console.log("showAccessDenied вызван:", message);
    hideLoading();
    const deniedMessage = document.getElementById("access-denied-message");
    if (deniedMessage) deniedMessage.textContent = message;
    if (authScreen) authScreen.style.display = "none";
    if (mainScreen) mainScreen.style.display = "none";
    if (deliveriesScreen) deliveriesScreen.style.display = "none";
    if (accessDeniedScreen) accessDeniedScreen.style.display = "block";
    if (adminScreen) adminScreen.style.display = "none";
    const reportsListScreen = document.getElementById("reports-list-screen");
    const reportDetailScreen = document.getElementById("report-detail-screen");
    const detailsScreen = document.getElementById("details-screen");
    if (reportsListScreen) reportsListScreen.style.display = "none";
    if (reportDetailScreen) reportDetailScreen.style.display = "none";
    if (detailsScreen) detailsScreen.style.display = "none";
  }

  // Показываем основной интерфейс (в зависимости от роли)
  function showMainInterface() {
    console.log("=== showMainInterface START ===");
    console.log("currentUserRole:", currentUserRole);

    hideLoading();

    // ПРИНУДИТЕЛЬНО скрываем экран авторизации
    if (authScreen) {
      authScreen.style.cssText = `
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        position: absolute !important;
        top: -9999px !important;
        left: -9999px !important;
        z-index: -1 !important;
        pointer-events: none !important;
      `;
      console.log("authScreen принудительно скрыт");
    }

    // Скрываем экраны администратора
    const reportsListScreen = document.getElementById("reports-list-screen");
    const reportDetailScreen = document.getElementById("report-detail-screen");
    const detailsScreen = document.getElementById("details-screen");
    if (reportsListScreen) reportsListScreen.style.display = "none";
    if (reportDetailScreen) reportDetailScreen.style.display = "none";
    if (detailsScreen) detailsScreen.style.display = "none";

    // Показываем нужный экран в зависимости от роли
    if (currentUserRole === "admin") {
      // Администратор — показываем админ-панель
      if (adminScreen) {
        adminScreen.style.cssText = `
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          position: relative !important;
          z-index: 1 !important;
        `;
        console.log("adminScreen показан");
      }
      if (mainScreen) mainScreen.style.display = "none";
    } else {
      // Курьер — показываем главный экран
      if (mainScreen) {
        mainScreen.style.cssText = `
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          position: relative !important;
          z-index: 1 !important;
        `;
        console.log("mainScreen показан");
      }
      if (adminScreen) adminScreen.style.display = "none";
    }

    if (deliveriesScreen) deliveriesScreen.style.display = "none";
    if (accessDeniedScreen) accessDeniedScreen.style.display = "none";

    console.log("=== showMainInterface END ===");
  }

  // Показываем ошибку на экране авторизации
  function showAuthError(message) {
    console.log("showAuthError вызван:", message);
    if (authError) {
      authError.textContent = message;
      authError.style.display = "block";
      setTimeout(() => {
        if (authError) authError.style.display = "none";
      }, 3000);
    }
  }

  function login() {
    console.log("=== login START ===");
    const rawPhone = authPhone ? authPhone.value.trim() : "";
    console.log("rawPhone:", rawPhone);

    if (!rawPhone) {
      console.log("Номер пустой");
      showAuthError("Введите номер телефона");
      return;
    }

    const fullPhone = "+7" + rawPhone.replace(/[^\d]/g, "");
    console.log("1. Проверка номера:", fullPhone);

    if (window.isUserAllowed && window.isUserAllowed(fullPhone)) {
      console.log("2. Номер найден в базе");
      const user = window.getUserByPhone(fullPhone);
      console.log("user из getUserByPhone:", user);
      if (user) {
        console.log("3. Пользователь получен:", user);
        currentUser = user;
        currentUserId = user.id;
        currentUserRole = user.role;
        isAuthorized = true;

        sessionStorage.setItem("authorizedUserId", user.id);
        sessionStorage.setItem("authorizedUserPhone", fullPhone);
        sessionStorage.setItem("authorizedUserName", user.name);
        sessionStorage.setItem("authorizedUserRole", user.role);

        console.log("4. Сохранили в sessionStorage, роль:", user.role);
        console.log("5. Вызываем initMainApp()");
        initMainApp();
        console.log("6. Вызываем showMainInterface()");
        showMainInterface();
        console.log("7. После showMainInterface");
        console.log("=== login SUCCESS END ===");
        return;
      } else {
        console.log("3.5. getUserByPhone вернул null");
      }
    } else {
      console.log("2. Номер НЕ найден в базе");
    }

    console.log("8. Показываем ошибку");
    showAuthError("Номер телефона не верный");
    console.log("=== login FAIL END ===");
  }

  // Проверяем сохранённую сессию
  function checkSavedSession() {
    console.log("checkSavedSession вызван");
    const savedUserId = sessionStorage.getItem("authorizedUserId");
    const savedUserPhone = sessionStorage.getItem("authorizedUserPhone");
    const savedUserName = sessionStorage.getItem("authorizedUserName");
    const savedUserRole = sessionStorage.getItem("authorizedUserRole");
    console.log("savedUserId:", savedUserId);
    console.log("savedUserPhone:", savedUserPhone);
    console.log("savedUserRole:", savedUserRole);

    if (savedUserId && savedUserPhone && savedUserName) {
      console.log("Сохранённые данные найдены");
      if (window.isUserAllowed && window.isUserAllowed(savedUserPhone)) {
        currentUser = {
          id: savedUserId,
          phone: savedUserPhone,
          name: savedUserName,
          role: savedUserRole,
        };
        currentUserId = savedUserId;
        currentUserRole = savedUserRole;
        isAuthorized = true;

        console.log("Восстановлена сессия для:", currentUser);
        console.log("Вызываем initMainApp из checkSavedSession");
        initMainApp();
        console.log("Вызываем showMainInterface из checkSavedSession");
        showMainInterface();
        return true;
      } else {
        console.log("Сохранённая сессия невалидна, очищаем");
        sessionStorage.removeItem("authorizedUserId");
        sessionStorage.removeItem("authorizedUserPhone");
        sessionStorage.removeItem("authorizedUserName");
        sessionStorage.removeItem("authorizedUserRole");
      }
    } else {
      console.log("Сохранённых данных нет");
    }
    return false;
  }

  // ========== УНИВЕРСАЛЬНАЯ ФУНКЦИЯ ДЛЯ СООБЩЕНИЙ ==========
  function showMessage(message, isError = false) {
    try {
      if (window.WebApp && typeof window.WebApp.showPopup === "function") {
        window.WebApp.showPopup({
          title: isError ? "Ошибка" : "Успешно",
          message: message,
          buttons: [{ type: "ok", text: "OK" }],
        });
        return;
      }
    } catch (e) {
      console.error("showPopup error:", e);
    }
    alert(message);
  }

  function showSuccess(message) {
    showMessage(message, false);
  }

  function showError(message) {
    showMessage(message, true);
  }

  // ========== ОСНОВНЫЕ ФУНКЦИИ ПРИЛОЖЕНИЯ ==========

  function loadClinicsForUser(userId) {
    console.log("loadClinicsForUser вызван, userId:", userId);
    const mockClinics = [
      {
        id: 1,
        name: 'Медицинский центр "Здоровье"',
        address: "ул. Ленина, 15, офис 301",
        salary: 500,
      },
      {
        id: 2,
        name: 'Клиника "Семейный доктор"',
        address: "пр. Мира, 42, этаж 2",
        salary: 750,
      },
      {
        id: 3,
        name: 'Диагностический центр "МРТ-Эксперт"',
        address: "ул. Гагарина, 7, корпус Б",
        salary: 1200,
      },
      {
        id: 4,
        name: "Женская консультация №5",
        address: "бульвар Строителей, 23",
        salary: 600,
      },
      {
        id: 5,
        name: 'Стоматология "Улыбка"',
        address: "ул. Советская, 10",
        salary: 450,
      },
      {
        id: 6,
        name: 'Клиника "Медси" на Ленина',
        address: "ул. Ленина, 55",
        salary: 950,
      },
      {
        id: 7,
        name: 'Лаборатория "Гемотест" Центральная',
        address: "ул. Центральная, 8",
        salary: 800,
      },
      {
        id: 8,
        name: 'Медицинский центр "Промед"',
        address: "ул. Промышленная, 12",
        salary: 680,
      },
      {
        id: 9,
        name: 'Клиника "Скандинавия"',
        address: "пр. Победы, 34",
        salary: 1100,
      },
      {
        id: 10,
        name: 'Центр репродукции "Эмбрио"',
        address: "ул. Садовая, 7",
        salary: 890,
      },
    ];
    console.log("loadClinicsForUser вернул", mockClinics.length, "клиник");
    return mockClinics;
  }

  function checkFormValidity() {
    const dateInput = document.getElementById("report-date");
    const saveButton = document.getElementById("save-report-btn");
    const selectedDate = dateInput ? dateInput.value : "";
    const isDateSelected = selectedDate !== "";

    const clinicItems = document.querySelectorAll(".clinic-item");
    let isAnyClinicSelected = false;
    clinicItems.forEach((item) => {
      const checkbox = item.querySelector(".clinic-checkbox");
      if (checkbox && checkbox.checked) isAnyClinicSelected = true;
    });

    const isValid =
      isDateSelected && (isAnyClinicSelected || extraDeliveries.length > 0);
    if (saveButton) saveButton.disabled = !isValid;
    return isValid;
  }

  function updateTotalSalary() {
    const clinicItems = document.querySelectorAll(".clinic-item");
    let total = 0;
    clinicItems.forEach((item) => {
      const checkbox = item.querySelector(".clinic-checkbox");
      if (checkbox && checkbox.checked) {
        const salarySpan = item.querySelector(".clinic-salary-value");
        if (salarySpan) total += parseInt(salarySpan.dataset.salary) || 0;
      }
    });

    total += extraDeliveries.reduce((sum, d) => sum + (d.salary || 0), 0);

    const totalSalaryElement = document.getElementById("total-salary");
    if (totalSalaryElement)
      totalSalaryElement.textContent = total.toLocaleString("ru-RU") + " ₽";
    checkFormValidity();
    return total;
  }

  function displayClinics(clinics) {
    console.log("displayClinics вызван, клиник:", clinics.length);
    const clinicsContainer = document.getElementById("clinics-list");
    if (!clinicsContainer) {
      console.log("clinics-container не найден");
      return;
    }
    if (clinics.length === 0) {
      clinicsContainer.innerHTML =
        '<div class="loading">Нет привязанных клиник</div>';
      return;
    }
    clinicsContainer.innerHTML = "";
    clinics.forEach((clinic) => {
      const clinicDiv = document.createElement("div");
      clinicDiv.className = "clinic-item";
      clinicDiv.dataset.id = clinic.id;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "clinic-checkbox";
      checkbox.value = clinic.id;

      const infoDiv = document.createElement("div");
      infoDiv.className = "clinic-info";

      const nameSpan = document.createElement("span");
      nameSpan.className = "clinic-name";
      nameSpan.textContent = clinic.name;

      const addressSpan = document.createElement("span");
      addressSpan.className = "clinic-address";
      addressSpan.textContent = clinic.address;

      const salarySpan = document.createElement("span");
      salarySpan.className = "clinic-salary";
      const salaryValue = document.createElement("span");
      salaryValue.className = "clinic-salary-value";
      salaryValue.dataset.salary = clinic.salary;
      salaryValue.style.display = "none";
      salarySpan.textContent = `${clinic.salary.toLocaleString("ru-RU")} ₽`;

      infoDiv.appendChild(nameSpan);
      infoDiv.appendChild(addressSpan);
      infoDiv.appendChild(salarySpan);
      infoDiv.appendChild(salaryValue);

      clinicDiv.appendChild(checkbox);
      clinicDiv.appendChild(infoDiv);

      const updateSelection = () => {
        if (checkbox.checked) clinicDiv.classList.add("selected");
        else clinicDiv.classList.remove("selected");
        updateTotalSalary();
      };

      clinicDiv.addEventListener("click", (e) => {
        if (e.target !== checkbox) checkbox.checked = !checkbox.checked;
        updateSelection();
      });
      checkbox.addEventListener("change", updateSelection);

      clinicsContainer.appendChild(clinicDiv);
    });
    updateTotalSalary();
    console.log("displayClinics завершён");
  }

  async function saveReport() {
    const dateInput = document.getElementById("report-date");
    const selectedDate = dateInput.value;
    if (!selectedDate) {
      showError("Пожалуйста, выберите дату");
      return;
    }

    const [year, month, day] = selectedDate.split("-");
    const formattedDate = `${day}.${month}.${year}`;

    const selectedClinics = [];
    const clinicItems = document.querySelectorAll(".clinic-item");
    let totalSalary = 0;
    clinicItems.forEach((item) => {
      const checkbox = item.querySelector(".clinic-checkbox");
      if (checkbox && checkbox.checked) {
        const nameSpan = item.querySelector(".clinic-name");
        const addressSpan = item.querySelector(".clinic-address");
        const salaryValueSpan = item.querySelector(".clinic-salary-value");
        const salary = salaryValueSpan
          ? parseInt(salaryValueSpan.dataset.salary)
          : 0;
        selectedClinics.push({
          id: item.dataset.id,
          name: nameSpan.textContent,
          address: addressSpan.textContent,
          salary: salary,
        });
        totalSalary += salary;
      }
    });

    const hasExtraDeliveries = extraDeliveries.length > 0;

    if (selectedClinics.length === 0 && !hasExtraDeliveries) {
      showError("Выберите клиники или добавьте доставку");
      return;
    }

    totalSalary += extraDeliveries.reduce((sum, d) => sum + (d.salary || 0), 0);

    const report = {
      id: Date.now().toString(),
      userId: currentUserId,
      userName: currentUser ? currentUser.name : null,
      userPhone: currentUser ? currentUser.phone : null,
      date: selectedDate,
      formattedDate: formattedDate,
      clinics: selectedClinics,
      totalSalary,
      extraDeliveries: [...extraDeliveries],
      timestamp: new Date().toISOString(),
    };

    console.log("Отправлен отчет:", report);

    // Сохраняем отчёт в localStorage
    const savedReports = JSON.parse(localStorage.getItem("reports") || "[]");
    savedReports.push(report);
    localStorage.setItem("reports", JSON.stringify(savedReports));
    console.log(
      "Отчёт сохранён в localStorage, всего отчётов:",
      savedReports.length,
    );

    showSuccess("Отчёт успешно отправлен");
  }

  // Функции для дополнительных доставок
  function updateDeliveriesList() {
    const container = document.getElementById("deliveries-list-container");
    const emptyDiv = document.getElementById("empty-deliveries");
    const extraCountSpan = document.getElementById("extra-count");

    if (extraCountSpan) extraCountSpan.textContent = extraDeliveries.length;
    if (!container) return;

    if (extraDeliveries.length === 0) {
      if (emptyDiv) emptyDiv.style.display = "block";
      const cards = container.querySelectorAll(".delivery-card");
      cards.forEach((card) => card.remove());
    } else {
      if (emptyDiv) emptyDiv.style.display = "none";
      const cards = container.querySelectorAll(".delivery-card");
      cards.forEach((card) => card.remove());

      extraDeliveries.forEach((delivery, index) => {
        const card = document.createElement("div");
        card.className = "delivery-card";
        const cardContent = document.createElement("div");
        cardContent.style.display = "flex";
        cardContent.style.alignItems = "flex-start";
        cardContent.style.width = "100%";

        const numberBadge = document.createElement("div");
        numberBadge.className = "delivery-number";
        numberBadge.textContent = index + 1;

        const infoDiv = document.createElement("div");
        infoDiv.className = "delivery-info";
        let infoHTML = "";

        if (delivery.receiveAddress) {
          infoHTML += `<div class="delivery-card-row"><span class="delivery-card-label">Откуда:</span> ${delivery.receiveAddress}</div>`;
        }
        infoHTML += `<div class="delivery-card-row"><span class="delivery-card-label">Куда:</span> ${delivery.deliveryAddress}</div>`;
        if (delivery.comment) {
          infoHTML += `<div class="delivery-card-row"><span class="delivery-card-label">Комментарий:</span> ${delivery.comment}</div>`;
        }
        infoHTML += `<div class="delivery-card-salary">${delivery.salary.toLocaleString("ru-RU")} ₽</div>`;

        infoDiv.innerHTML = infoHTML;
        cardContent.appendChild(numberBadge);
        cardContent.appendChild(infoDiv);
        card.appendChild(cardContent);
        container.appendChild(card);
      });
    }
  }

  function showDeliveriesScreen() {
    if (mainScreen) mainScreen.style.display = "none";
    if (deliveriesScreen) deliveriesScreen.style.display = "block";
    currentScreen = "deliveries";
    updateDeliveriesList();
  }

  function showMainScreen() {
    if (mainScreen) mainScreen.style.display = "block";
    if (deliveriesScreen) deliveriesScreen.style.display = "none";
    currentScreen = "main";
    updateTotalSalary();
  }

  function initMainApp() {
    console.log("=== initMainApp START ===");
    console.log("currentUserId:", currentUserId);
    console.log("currentUser:", currentUser);
    console.log("currentUserRole:", currentUserRole);

    // Для курьеров загружаем клиники
    if (currentUserRole !== "admin") {
      const userClinics = loadClinicsForUser(currentUserId);
      console.log("Клиники загружены, количество:", userClinics.length);
      displayClinics(userClinics);
      console.log("displayClinics выполнен");
    }

    const saveButton = document.getElementById("save-report-btn");
    if (saveButton) {
      saveButton.removeEventListener("click", saveReport);
      saveButton.addEventListener("click", saveReport);
      console.log("saveButton обработчик добавлен");
    } else {
      console.log("saveButton не найден!");
    }

    const extraDeliveriesBtn = document.getElementById("extra-deliveries-btn");
    if (extraDeliveriesBtn) {
      extraDeliveriesBtn.addEventListener("click", showDeliveriesScreen);
      console.log("extraDeliveriesBtn обработчик добавлен");
    }

    const backToMainBtn = document.getElementById("back-to-main-btn");
    if (backToMainBtn) backToMainBtn.addEventListener("click", showMainScreen);

    const addDeliveryFromListBtn = document.getElementById(
      "add-delivery-from-list-btn",
    );
    if (addDeliveryFromListBtn) {
      addDeliveryFromListBtn.removeEventListener(
        "click",
        openExtraDeliveryModal,
      );
      addDeliveryFromListBtn.addEventListener("click", openExtraDeliveryModal);
      console.log("addDeliveryFromListBtn обработчик добавлен");
    }

    checkFormValidity();
    console.log("=== initMainApp END ===");
  }

  // ========== ФУНКЦИИ ДЛЯ АДМИНИСТРАТОРА ==========

  function formatIsoDateToRu(isoDate) {
    if (!isoDate) return "";
    const [year, month, day] = isoDate.split("-");
    return `${day}.${month}.${year}`;
  }

  function syncSheetDateDisplays() {
    const fromInput = document.getElementById("filter-date-from-sheet");
    const toInput = document.getElementById("filter-date-to-sheet");
    const fromDisplay = document.getElementById("filter-date-from-sheet-display");
    const toDisplay = document.getElementById("filter-date-to-sheet-display");

    if (fromDisplay) {
      fromDisplay.textContent = fromInput?.value
        ? formatIsoDateToRu(fromInput.value)
        : "ДД.ММ.ГГГГ";
    }
    if (toDisplay) {
      toDisplay.textContent = toInput?.value
        ? formatIsoDateToRu(toInput.value)
        : "ДД.ММ.ГГГГ";
    }
  }

  /** Поля даты в DOM всегда совпадают с состоянием (иначе десктопный WebView МАКС может подставить «сегодня» при пустом фильтре). */
  function syncFilterDateInputsFromState() {
    const dateFromInput = document.getElementById("filter-date-from");
    const dateToInput = document.getElementById("filter-date-to");
    if (dateFromInput) dateFromInput.value = currentFilterDateFrom || "";
    if (dateToInput) dateToInput.value = currentFilterDateTo || "";
  }

  function syncDesktopFiltersFromState() {
    const filterSelect = document.getElementById("filter-courier");
    if (filterSelect) filterSelect.value = currentFilterCourier;
    syncFilterDateInputsFromState();
  }

  function syncSheetInputsFromState() {
    const filterSelect = document.getElementById("filter-courier-sheet");
    const dateFromInput = document.getElementById("filter-date-from-sheet");
    const dateToInput = document.getElementById("filter-date-to-sheet");
    if (filterSelect) filterSelect.value = currentFilterCourier;
    if (dateFromInput) dateFromInput.value = currentFilterDateFrom || "";
    if (dateToInput) dateToInput.value = currentFilterDateTo || "";
    syncSheetDateDisplays();
  }

  function syncAllFilterInputsFromState() {
    syncDesktopFiltersFromState();
    syncSheetInputsFromState();
  }

  function countActiveFilters() {
    let n = 0;
    if (currentFilterCourier !== "all") n += 1;
    if (currentFilterDateFrom) n += 1;
    if (currentFilterDateTo) n += 1;
    return n;
  }

  function updateFilterBadge() {
    const badge = document.getElementById("filter-active-badge");
    if (!badge) return;
    const n = countActiveFilters();
    if (n > 0) {
      badge.textContent = String(n);
      badge.hidden = false;
      badge.setAttribute("aria-label", `Активных условий: ${n}`);
    } else {
      badge.textContent = "";
      badge.hidden = true;
      badge.removeAttribute("aria-label");
    }
  }

  function openFiltersSheet() {
    syncSheetInputsFromState();
    const sheet = document.getElementById("filters-sheet");
    const openBtn = document.getElementById("filter-open-sheet-btn");
    if (sheet) {
      sheet.classList.add("filters-sheet--open");
      sheet.setAttribute("aria-hidden", "false");
    }
    if (openBtn) openBtn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }

  function closeFiltersSheet() {
    const sheet = document.getElementById("filters-sheet");
    const openBtn = document.getElementById("filter-open-sheet-btn");
    if (sheet) {
      sheet.classList.remove("filters-sheet--open");
      sheet.setAttribute("aria-hidden", "true");
    }
    if (openBtn) openBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  function applyFiltersFromSheet() {
    const filterSelect = document.getElementById("filter-courier-sheet");
    const dateFromInput = document.getElementById("filter-date-from-sheet");
    const dateToInput = document.getElementById("filter-date-to-sheet");
    if (filterSelect) currentFilterCourier = filterSelect.value;
    if (dateFromInput) currentFilterDateFrom = dateFromInput.value || "";
    if (dateToInput) currentFilterDateTo = dateToInput.value || "";
    syncDesktopFiltersFromState();
    scheduleFilterDateInputsSync();
    applyFiltersAndDisplay();
    closeFiltersSheet();
  }

  function scheduleFilterDateInputsSync() {
    syncFilterDateInputsFromState();
    requestAnimationFrame(syncFilterDateInputsFromState);
    setTimeout(syncFilterDateInputsFromState, 0);
    setTimeout(syncFilterDateInputsFromState, 150);
  }

  // Показываем экран списка отчётов
  function showReportsListScreen() {
    console.log("showReportsListScreen вызван");

    // Скрываем админ-панель
    if (adminScreen) adminScreen.style.display = "none";
    const detailsScreen = document.getElementById("details-screen");
    if (detailsScreen) detailsScreen.style.display = "none";

    // Показываем экран списка отчётов
    const reportsListScreen = document.getElementById("reports-list-screen");
    if (reportsListScreen) reportsListScreen.style.display = "block";

    // Загружаем все отчёты
    loadAllReports();

    // Заполняем фильтр курьеров
    populateCourierFilter();

    scheduleFilterDateInputsSync();
  }

  // Загружаем все отчёты из localStorage
  function loadAllReports() {
    allReports = JSON.parse(localStorage.getItem("reports") || "[]");
    console.log("Загружено отчётов:", allReports.length);

    // Сортируем по дате (новые сверху)
    allReports.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Применяем фильтры и отображаем
    applyFiltersAndDisplay();
  }

  // Заполняем выпадающий список курьеров (десктоп и шторка)
  function populateCourierFilter() {
    const filterSelect = document.getElementById("filter-courier");
    const filterSelectSheet = document.getElementById("filter-courier-sheet");
    if (!filterSelect && !filterSelectSheet) return;

    // Получаем уникальных курьеров из отчётов
    const couriersMap = new Map();
    allReports.forEach((report) => {
      const courierName = report.userName || report.userPhone || "Курьер";
      const courierId = report.userId;
      if (!couriersMap.has(courierId)) {
        couriersMap.set(courierId, courierName);
      }
    });

    // Сортируем курьеров по имени
    const couriers = Array.from(couriersMap.entries()).sort((a, b) =>
      a[1].localeCompare(b[1]),
    );

    // Строим опции
    let options = '<option value="all">Все курьеры</option>';
    couriers.forEach(([id, name]) => {
      options += `<option value="${id}">${name}</option>`;
    });

    if (filterSelect) filterSelect.innerHTML = options;
    if (filterSelectSheet) filterSelectSheet.innerHTML = options;

    // Восстанавливаем выбранное значение после обновления
    if (currentFilterCourier !== "all") {
      if (filterSelect) filterSelect.value = currentFilterCourier;
      if (filterSelectSheet) filterSelectSheet.value = currentFilterCourier;
    }
  }

  // Применяем фильтры и отображаем отчёты
  function applyFiltersAndDisplay() {
    let filteredReports = [...allReports];

    // Фильтр по курьеру
    if (currentFilterCourier !== "all") {
      filteredReports = filteredReports.filter(
        (report) => report.userId === currentFilterCourier,
      );
    }

    // Фильтр по дате "от"
    if (currentFilterDateFrom) {
      filteredReports = filteredReports.filter(
        (report) => report.date >= currentFilterDateFrom,
      );
    }

    // Фильтр по дате "до"
    if (currentFilterDateTo) {
      filteredReports = filteredReports.filter(
        (report) => report.date <= currentFilterDateTo,
      );
    }

    displayReportsList(filteredReports);
    updateFilterBadge();
  }

  // Отображаем список отчётов
  function displayReportsList(reports) {
    const container = document.getElementById("reports-list-container");
    if (!container) return;

    if (reports.length === 0) {
      container.innerHTML =
        '<div class="empty-deliveries">Нет отчётов по выбранным фильтрам</div>';
      return;
    }

    container.innerHTML = "";
    reports.forEach((report) => {
      const reportDiv = document.createElement("div");
      reportDiv.className = "report-item";
      reportDiv.dataset.id = report.id;

      reportDiv.innerHTML = `
        <div class="report-item-date">${report.formattedDate || report.date}</div>
        <div class="report-item-courier">${report.userName || report.userPhone || "Курьер"}</div>
      `;

      reportDiv.addEventListener("click", () => {
        showReportDetail(report);
      });

      container.appendChild(reportDiv);
    });
  }

  // Обновляем фильтр по курьеру
  function updateFilterCourier() {
    const filterSelect = document.getElementById("filter-courier");
    if (filterSelect) {
      currentFilterCourier = filterSelect.value;
      applyFiltersAndDisplay();
    }
  }

  // Обновляем фильтр по дате "от"
  function updateFilterDateFrom() {
    const dateFromInput = document.getElementById("filter-date-from");
    if (dateFromInput) {
      currentFilterDateFrom = dateFromInput.value;
      applyFiltersAndDisplay();
    }
  }

  // Обновляем фильтр по дате "до"
  function updateFilterDateTo() {
    const dateToInput = document.getElementById("filter-date-to");
    if (dateToInput) {
      currentFilterDateTo = dateToInput.value;
      applyFiltersAndDisplay();
    }
  }

  // Сброс всех фильтров
  function resetFilters() {
    currentFilterCourier = "all";
    currentFilterDateFrom = "";
    currentFilterDateTo = "";
    syncAllFilterInputsFromState();
    scheduleFilterDateInputsSync();
    applyFiltersAndDisplay();
  }

  // Показываем детальный просмотр отчёта
  function showReportDetail(report) {
    console.log("showReportDetail вызван для отчёта:", report.id);
    closeFiltersSheet();

    const reportsListScreen = document.getElementById("reports-list-screen");
    if (reportsListScreen) reportsListScreen.style.display = "none";

    const reportDetailScreen = document.getElementById("report-detail-screen");
    if (reportDetailScreen) reportDetailScreen.style.display = "block";

    displayReportDetail(report);
  }

  // Отображаем детали отчёта (обновлённая версия с одной строкой зарплаты)
  function displayReportDetail(report) {
    const container = document.getElementById("report-detail-container");
    if (!container) return;

    // Формируем HTML для клиник (компактная версия с плашкой зарплаты)
    let clinicsHTML = "";
    if (report.clinics && report.clinics.length > 0) {
      clinicsHTML =
        '<div class="detail-section"><div class="detail-section-title">Посещённые клиники <span class="clinics-count">(' +
        report.clinics.length +
        ")</span></div>";
      clinicsHTML += '<div class="clinics-compact-list">';
      report.clinics.forEach((clinic) => {
        clinicsHTML += `
          <div class="clinic-compact-item">
            <div class="clinic-compact-info">
              <div class="clinic-compact-name">${clinic.name}</div>
              <div class="clinic-compact-address">${clinic.address}</div>
            </div>
            <div class="clinic-compact-salary-badge">${clinic.salary.toLocaleString("ru-RU")} ₽</div>
          </div>
        `;
      });
      clinicsHTML += "</div></div>";
    } else {
      clinicsHTML =
        '<div class="detail-section"><div class="detail-section-title">Посещённые клиники</div><div class="empty-deliveries">Нет посещённых клиник</div></div>';
    }

    // Формируем HTML для дополнительных доставок
    let extraDeliveriesHTML = "";
    if (report.extraDeliveries && report.extraDeliveries.length > 0) {
      extraDeliveriesHTML =
        '<div class="detail-section"><div class="detail-section-title">Дополнительные доставки <span class="deliveries-count">(' +
        report.extraDeliveries.length +
        ")</span></div>";
      report.extraDeliveries.forEach((delivery, idx) => {
        extraDeliveriesHTML += `
          <div class="delivery-card">
            <div style="display: flex; align-items: flex-start; width: 100%;">
              <div class="delivery-number">${idx + 1}</div>
              <div class="delivery-info">
                ${delivery.receiveAddress ? `<div class="delivery-card-row"><span class="delivery-card-label">Откуда:</span> ${delivery.receiveAddress}</div>` : ""}
                <div class="delivery-card-row"><span class="delivery-card-label">Куда:</span> ${delivery.deliveryAddress}</div>
                ${delivery.comment ? `<div class="delivery-card-row"><span class="delivery-card-label">Комментарий:</span> ${delivery.comment}</div>` : ""}
                <div class="delivery-card-salary">${delivery.salary.toLocaleString("ru-RU")} ₽</div>
              </div>
            </div>
          </div>
        `;
      });
      extraDeliveriesHTML += "</div>";
    }

    container.innerHTML = `
      <div class="detail-section">
        <div class="detail-section-title">Основная информация</div>
        <div class="detail-info-row">
          <div class="detail-info-label">Дата отчёта</div>
          <div class="detail-info-value">${report.formattedDate || report.date}</div>
        </div>
        <div class="detail-info-row">
          <div class="detail-info-label">Курьер</div>
          <div class="detail-info-value">${report.userName || report.userPhone || "Курьер"}</div>
        </div>
      </div>
      
      ${clinicsHTML}
      ${extraDeliveriesHTML}
      
      <div class="total-salary-row">
        <span class="total-salary-label">Итого зп за день:</span>
        <span class="total-salary-amount">${report.totalSalary.toLocaleString("ru-RU")} ₽</span>
      </div>
    `;
  }

  // Возврат к списку отчётов
  function backToReportsList() {
    console.log("backToReportsList вызван");

    const reportDetailScreen = document.getElementById("report-detail-screen");
    if (reportDetailScreen) reportDetailScreen.style.display = "none";

    showReportsListScreen();
  }

  // Возврат к админ-панели
  function backToAdminPanel() {
    console.log("backToAdminPanel вызван");
    closeFiltersSheet();

    const reportsListScreen = document.getElementById("reports-list-screen");
    const detailsScreen = document.getElementById("details-screen");
    if (reportsListScreen) reportsListScreen.style.display = "none";
    if (detailsScreen) detailsScreen.style.display = "none";

    if (adminScreen) adminScreen.style.display = "block";
  }

  function splitCityAndAddress(rawAddress) {
    const addressText = (rawAddress || "").trim();
    if (!addressText) {
      return { city: "Не указан", address: "" };
    }
    const parts = addressText
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    if (parts.length > 1) {
      const firstPart = parts[0];
      if (/^(г\.?|город|пгт\.?|пос\.?|с\.?|д\.?)/i.test(firstPart)) {
        return {
          city: firstPart,
          address: parts.slice(1).join(", "),
        };
      }
    }
    return { city: "Не указан", address: addressText };
  }

  function normalizeClinicExportData(clinic) {
    const clinicName = (clinic?.name || "").trim() || "Без названия";
    const parsed = splitCityAndAddress(clinic?.address);
    const city = (clinic?.city || "").trim() || parsed.city;
    const address = parsed.address || (clinic?.address || "").trim();
    return { clinicName, city, address };
  }

  function triggerFileDownload(blob, fileName) {
    const file = new File([blob], fileName, { type: blob.type });
    if (
      navigator.share &&
      navigator.canShare &&
      navigator.canShare({ files: [file] })
    ) {
      return navigator.share({ files: [file], title: fileName });
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 3000);
    return Promise.resolve();
  }

  function formatIsoMonthToRu(isoMonth) {
    if (!isoMonth || !isoMonth.includes("-")) return "";
    const [year, month] = isoMonth.split("-");
    return `${month}.${year}`;
  }

  function syncDetailsMonthDisplay() {
    const monthInput = document.getElementById("details-month");
    const monthDisplay = document.getElementById("details-month-display");
    if (!monthDisplay) return;
    monthDisplay.textContent =
      monthInput?.value && monthInput.value.length === 7
        ? formatIsoMonthToRu(monthInput.value)
        : "ММ.ГГГГ";
  }

  function showDetailsInlineError(message) {
    const detailsError = document.getElementById("details-error");
    if (!detailsError) return;
    detailsError.textContent = message;
    detailsError.style.display = "block";
  }

  function hideDetailsInlineError() {
    const detailsError = document.getElementById("details-error");
    if (!detailsError) return;
    detailsError.textContent = "";
    detailsError.style.display = "none";
  }

  function showDetailsScreen() {
    if (adminScreen) adminScreen.style.display = "none";
    const detailsScreen = document.getElementById("details-screen");
    const reportsListScreen = document.getElementById("reports-list-screen");
    const reportDetailScreen = document.getElementById("report-detail-screen");
    if (reportsListScreen) reportsListScreen.style.display = "none";
    if (reportDetailScreen) reportDetailScreen.style.display = "none";
    const detailsMonthInput = document.getElementById("details-month");
    if (detailsMonthInput && !detailsMonthInput.value) {
      const now = new Date();
      detailsMonthInput.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    }
    hideDetailsInlineError();
    syncDetailsMonthDisplay();
    if (detailsScreen) detailsScreen.style.display = "block";
  }

  function exportDetailsToExcel() {
    hideDetailsInlineError();
    const detailsMonthInput = document.getElementById("details-month");
    const monthValue = detailsMonthInput ? detailsMonthInput.value : "";
    if (!monthValue) {
      showDetailsInlineError("Выберите месяц и год");
      return;
    }
    const reports = JSON.parse(localStorage.getItem("reports") || "[]");
    const monthReports = reports.filter(
      (report) =>
        typeof report?.date === "string" && report.date.startsWith(`${monthValue}-`),
    );

    const clinicsCounter = new Map();
    monthReports.forEach((report) => {
      if (!Array.isArray(report?.clinics)) return;
      const courierName =
        (report.userName || report.userPhone || "Курьер").trim() || "Курьер";
      report.clinics.forEach((clinic) => {
        const normalized = normalizeClinicExportData(clinic);
        const key = [
          courierName.toLowerCase(),
          normalized.clinicName.toLowerCase(),
          normalized.city.toLowerCase(),
          normalized.address.toLowerCase(),
        ].join("|");
        if (!clinicsCounter.has(key)) {
          clinicsCounter.set(key, {
            courierName,
            clinicName: normalized.clinicName,
            city: normalized.city,
            address: normalized.address,
            visits: 0,
            dayMarks: new Set(),
          });
        }
        const clinicStat = clinicsCounter.get(key);
        clinicStat.visits += 1;
        const day = Number(String(report.date).slice(8, 10));
        if (day >= 1 && day <= 31) {
          clinicStat.dayMarks.add(day);
        }
      });
    });

    if (clinicsCounter.size === 0) {
      showDetailsInlineError("Нет отчётов за выбранный период");
      return;
    }

    const dayHeaders = Array.from({ length: 31 }, (_, i) => String(i + 1));
    const rows = [[
      "Курьер",
      "Наименование МЦ",
      "Город",
      "Адрес отправления",
      "Количество посещений",
      ...dayHeaders,
    ]];

    Array.from(clinicsCounter.values())
      .sort((a, b) => {
        const byCourier = a.courierName.localeCompare(b.courierName, "ru");
        if (byCourier !== 0) return byCourier;
        return a.clinicName.localeCompare(b.clinicName, "ru");
      })
      .forEach((item) => {
        const dayCells = Array.from({ length: 31 }, (_, index) =>
          item.dayMarks.has(index + 1) ? "+" : "",
        );
        rows.push([
          item.courierName,
          item.clinicName,
          item.city,
          item.address,
          item.visits,
          ...dayCells,
        ]);
      });

    try {
      if (window.XLSX) {
        const workbook = window.XLSX.utils.book_new();
        const worksheet = window.XLSX.utils.aoa_to_sheet(rows);
        window.XLSX.utils.book_append_sheet(workbook, worksheet, "Детализация");
        const xlsxBuffer = window.XLSX.write(workbook, {
          bookType: "xlsx",
          type: "array",
        });
        const xlsxBlob = new Blob([xlsxBuffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        triggerFileDownload(xlsxBlob, `detalizaciya-${monthValue}.xlsx`)
          .then(() => showSuccess("Файл Excel выгружен"))
          .catch(() => showError("Не удалось сохранить файл"));
        return;
      }

      const csv = rows
        .map((row) =>
          row
            .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
            .join(";"),
        )
        .join("\n");
      const csvBlob = new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8;",
      });
      triggerFileDownload(csvBlob, `detalizaciya-${monthValue}.csv`)
        .then(() =>
          showSuccess(
            "Excel-библиотека недоступна. Сохранён CSV, его можно открыть в Excel.",
          ),
        )
        .catch(() => showError("Не удалось сохранить файл"));
    } catch (e) {
      console.error("exportDetailsToExcel error:", e);
      showError("Ошибка при формировании файла");
    }
  }

  // Модальное окно
  const modalBackdrop = document.getElementById(
    "extra-delivery-modal-backdrop",
  );
  const modalCloseBtn = document.getElementById("extra-delivery-modal-close");
  const modalAddBtn = document.getElementById("extra-delivery-modal-add");

  const extraModalReceiveEl = document.getElementById("extra-modal-receive");
  const extraModalDeliverEl = document.getElementById("extra-modal-deliver");
  const extraModalCommentEl = document.getElementById("extra-modal-comment");
  const extraModalSalaryEl = document.getElementById("extra-modal-salary");

  function updateExtraModalAddButtonState() {
    if (!modalAddBtn) return;
    const deliveryAddress = extraModalDeliverEl
      ? extraModalDeliverEl.value.trim()
      : "";
    const salaryText = extraModalSalaryEl
      ? extraModalSalaryEl.value.trim()
      : "";
    const isSalaryValid = /^\d+$/.test(salaryText);
    const canAdd = !!deliveryAddress && isSalaryValid;
    modalAddBtn.disabled = !canAdd;
  }

  function openExtraDeliveryModal() {
    if (!modalBackdrop) return;
    setModalValues({
      receiveAddress: "",
      deliveryAddress: "",
      comment: "",
      salary: null,
    });
    updateExtraModalAddButtonState();
    modalBackdrop.hidden = false;
  }

  function closeExtraDeliveryModal() {
    if (!modalBackdrop) return;
    modalBackdrop.hidden = true;
  }

  function setModalValues(values) {
    if (extraModalReceiveEl)
      extraModalReceiveEl.value = values.receiveAddress || "";
    if (extraModalDeliverEl)
      extraModalDeliverEl.value = values.deliveryAddress || "";
    if (extraModalCommentEl) extraModalCommentEl.value = values.comment || "";
    if (extraModalSalaryEl)
      extraModalSalaryEl.value =
        values.salary != null ? String(values.salary) : "";
    updateExtraModalAddButtonState();
  }

  function addExtraDeliveryFromModal() {
    const receiveAddress = extraModalReceiveEl
      ? extraModalReceiveEl.value.trim()
      : "";
    const deliveryAddress = extraModalDeliverEl
      ? extraModalDeliverEl.value.trim()
      : "";
    const comment = extraModalCommentEl ? extraModalCommentEl.value.trim() : "";
    const salaryText = extraModalSalaryEl
      ? extraModalSalaryEl.value.trim()
      : "";
    const isSalaryValid = /^\d+$/.test(salaryText);

    if (!deliveryAddress) {
      showError("Укажите адрес доставки груза");
      return;
    }
    if (!isSalaryValid) {
      showError("Укажите зарплату целым числом");
      return;
    }

    const salary = parseInt(salaryText, 10);
    extraDeliveries.push({ receiveAddress, deliveryAddress, comment, salary });

    setModalValues({
      receiveAddress: "",
      deliveryAddress: "",
      comment: "",
      salary: null,
    });
    closeExtraDeliveryModal();

    updateDeliveriesList();
    updateTotalSalary();
    checkFormValidity();
  }

  // Обработчики модального окна
  if (modalCloseBtn)
    modalCloseBtn.addEventListener("click", closeExtraDeliveryModal);
  if (modalAddBtn)
    modalAddBtn.addEventListener("click", addExtraDeliveryFromModal);
  if (extraModalDeliverEl) {
    extraModalDeliverEl.addEventListener(
      "input",
      updateExtraModalAddButtonState,
    );
    extraModalDeliverEl.addEventListener(
      "change",
      updateExtraModalAddButtonState,
    );
  }
  if (extraModalSalaryEl) {
    extraModalSalaryEl.addEventListener(
      "input",
      updateExtraModalAddButtonState,
    );
    extraModalSalaryEl.addEventListener(
      "change",
      updateExtraModalAddButtonState,
    );
  }
  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", (e) => {
      if (e.target === modalBackdrop) closeExtraDeliveryModal();
    });
  }

  // Настройка поля даты
  const dateInput = document.getElementById("report-date");
  const dateDisplay = document.getElementById("report-date-display");
  if (dateInput) {
    const formatIsoDateToRu = (isoDate) => {
      if (!isoDate) return "";
      const [year, month, day] = isoDate.split("-");
      return `${day}.${month}.${year}`;
    };
    const syncDateDisplay = () => {
      if (dateDisplay)
        dateDisplay.textContent = formatIsoDateToRu(dateInput.value);
    };
    dateInput.value = "";
    syncDateDisplay();
    dateInput.addEventListener("change", () => {
      syncDateDisplay();
      checkFormValidity();
    });
    dateInput.addEventListener("input", () => {
      syncDateDisplay();
      checkFormValidity();
    });

    const dateQuickButtons = document.querySelectorAll(".date-quick-btn");
    const setDateByOffsetDays = (offsetDays) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() + offsetDays);
      dateInput.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      syncDateDisplay();
      checkFormValidity();
    };
    dateQuickButtons.forEach((btn) => {
      btn.addEventListener("click", () =>
        setDateByOffsetDays(parseInt(btn.dataset.offset || "0", 10)),
      );
    });
  }

  // ========== ЗАПУСК ПРИЛОЖЕНИЯ ==========

  console.log("=== ЗАПУСК ПРИЛОЖЕНИЯ ===");
  console.log("Проверяем сохранённую сессию...");

  // Проверяем сохранённую сессию
  if (checkSavedSession()) {
    console.log("Сессия восстановлена, главный экран должен быть показан");
  } else {
    console.log("Сессии нет, показываем экран авторизации");
    showAuthScreen();
  }

  // Обработчик кнопки авторизации
  if (authLoginBtn) {
    authLoginBtn.addEventListener("click", login);
    console.log("authLoginBtn обработчик добавлен");
  } else {
    console.log("authLoginBtn не найден!");
  }

  // Обработка нажатия Enter в поле телефона
  if (authPhone) {
    authPhone.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        login();
      }
    });
    console.log("authPhone обработчик Enter добавлен");
  } else {
    console.log("authPhone не найден!");
  }

  // Обработчик кнопки "Отчёты курьеров" (для администратора)
  if (adminReportsBtn) {
    adminReportsBtn.addEventListener("click", () => {
      console.log("Кнопка 'Отчёты курьеров' нажата");
      showReportsListScreen();
    });
    console.log("adminReportsBtn обработчик добавлен");
  }
  if (adminDetailsBtn) {
    adminDetailsBtn.addEventListener("click", () => {
      console.log("Кнопка 'Детализация' нажата");
      showDetailsScreen();
    });
    console.log("adminDetailsBtn обработчик добавлен");
  }

  // Обработчики навигации для экранов администратора
  const backToAdminBtn = document.getElementById("back-to-admin-btn");
  if (backToAdminBtn) {
    backToAdminBtn.addEventListener("click", backToAdminPanel);
    console.log("backToAdminBtn обработчик добавлен");
  }

  const backToReportsListBtn = document.getElementById(
    "back-to-reports-list-btn",
  );
  const backToAdminFromDetailsBtn = document.getElementById(
    "back-to-admin-from-details-btn",
  );
  if (backToReportsListBtn) {
    backToReportsListBtn.addEventListener("click", backToReportsList);
    console.log("backToReportsListBtn обработчик добавлен");
  }
  if (backToAdminFromDetailsBtn) {
    backToAdminFromDetailsBtn.addEventListener("click", backToAdminPanel);
    console.log("backToAdminFromDetailsBtn обработчик добавлен");
  }

  const detailsExportBtn = document.getElementById("details-export-btn");
  const detailsMonthInput = document.getElementById("details-month");
  if (detailsExportBtn) {
    detailsExportBtn.addEventListener("click", exportDetailsToExcel);
  }
  if (detailsMonthInput) {
    detailsMonthInput.addEventListener("change", syncDetailsMonthDisplay);
    detailsMonthInput.addEventListener("input", syncDetailsMonthDisplay);
    detailsMonthInput.addEventListener("change", hideDetailsInlineError);
    detailsMonthInput.addEventListener("input", hideDetailsInlineError);
  }
  syncDetailsMonthDisplay();

  // Обработчики фильтров
  const filterCourier = document.getElementById("filter-courier");
  const filterDateFrom = document.getElementById("filter-date-from");
  const filterDateTo = document.getElementById("filter-date-to");
  const filterResetBtn = document.getElementById("filter-reset-btn");

  if (filterCourier) {
    filterCourier.addEventListener("change", updateFilterCourier);
  }
  if (filterDateFrom) {
    filterDateFrom.addEventListener("change", updateFilterDateFrom);
  }
  if (filterDateTo) {
    filterDateTo.addEventListener("change", updateFilterDateTo);
  }
  if (filterResetBtn) {
    filterResetBtn.addEventListener("click", resetFilters);
  }

  // Мобильная шторка фильтров
  const filterOpenSheetBtn = document.getElementById("filter-open-sheet-btn");
  const filterMobileResetBtn = document.getElementById("filter-mobile-reset-btn");
  const filtersSheetBackdrop = document.getElementById("filters-sheet-backdrop");
  const filtersSheetApply = document.getElementById("filters-sheet-apply");
  const filtersSheetReset = document.getElementById("filters-sheet-reset");
  const filterDateFromSheet = document.getElementById("filter-date-from-sheet");
  const filterDateToSheet = document.getElementById("filter-date-to-sheet");

  if (filterOpenSheetBtn) {
    filterOpenSheetBtn.addEventListener("click", openFiltersSheet);
  }
  if (filterMobileResetBtn) {
    filterMobileResetBtn.addEventListener("click", () => {
      resetFilters();
      closeFiltersSheet();
    });
  }
  if (filtersSheetBackdrop) {
    filtersSheetBackdrop.addEventListener("click", closeFiltersSheet);
  }
  if (filtersSheetApply) {
    filtersSheetApply.addEventListener("click", applyFiltersFromSheet);
  }
  if (filtersSheetReset) {
    filtersSheetReset.addEventListener("click", () => {
      resetFilters();
      closeFiltersSheet();
    });
  }
  if (filterDateFromSheet) {
    filterDateFromSheet.addEventListener("change", syncSheetDateDisplays);
    filterDateFromSheet.addEventListener("input", syncSheetDateDisplays);
  }
  if (filterDateToSheet) {
    filterDateToSheet.addEventListener("change", syncSheetDateDisplays);
    filterDateToSheet.addEventListener("input", syncSheetDateDisplays);
  }
  syncSheetDateDisplays();

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const sheet = document.getElementById("filters-sheet");
    if (sheet && sheet.classList.contains("filters-sheet--open")) {
      e.preventDefault();
      closeFiltersSheet();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 640) closeFiltersSheet();
  });
});
