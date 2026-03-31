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
  let pendingDeleteReportId = null;
  let adminViewingReportId = null;
  /** Откуда открыли детали: список админа или «Мои отчёты» курьера */
  let reportsListContext = "admin";
  let currentCourierFilterDateFrom = "";
  let currentCourierFilterDateTo = "";

  // Элементы DOM
  const mainScreen = document.getElementById("main-screen");
  const deliveriesScreen = document.getElementById("deliveries-screen");
  const accessDeniedScreen = document.getElementById("access-denied-screen");
  const loadingScreen = document.getElementById("loading-screen");
  const authScreen = document.getElementById("auth-screen");
  const adminScreen = document.getElementById("admin-screen");
  const courierMenuScreen = document.getElementById("courier-menu-screen");
  const courierReportsListScreen = document.getElementById(
    "courier-reports-list-screen",
  );
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
    if (courierMenuScreen) courierMenuScreen.style.display = "none";
    const reportsListScreen = document.getElementById("reports-list-screen");
    const reportDetailScreen = document.getElementById("report-detail-screen");
    const detailsScreen = document.getElementById("details-screen");
    if (reportsListScreen) reportsListScreen.style.display = "none";
    if (reportDetailScreen) reportDetailScreen.style.display = "none";
    if (detailsScreen) detailsScreen.style.display = "none";
    if (courierReportsListScreen) courierReportsListScreen.style.cssText = "display: none;";
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
    if (courierMenuScreen) courierMenuScreen.style.display = "none";
    if (authError) authError.style.display = "none";
    const reportsListScreen = document.getElementById("reports-list-screen");
    const reportDetailScreen = document.getElementById("report-detail-screen");
    const detailsScreen = document.getElementById("details-screen");
    if (reportsListScreen) reportsListScreen.style.display = "none";
    if (reportDetailScreen) reportDetailScreen.style.display = "none";
    if (detailsScreen) detailsScreen.style.display = "none";
    if (courierReportsListScreen) courierReportsListScreen.style.cssText = "display: none;";
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
    if (courierMenuScreen) courierMenuScreen.style.display = "none";
    const reportsListScreen = document.getElementById("reports-list-screen");
    const reportDetailScreen = document.getElementById("report-detail-screen");
    const detailsScreen = document.getElementById("details-screen");
    if (reportsListScreen) reportsListScreen.style.display = "none";
    if (reportDetailScreen) reportDetailScreen.style.display = "none";
    if (detailsScreen) detailsScreen.style.display = "none";
    if (courierReportsListScreen) courierReportsListScreen.style.cssText = "display: none;";
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
    if (courierReportsListScreen) courierReportsListScreen.style.cssText = "display: none;";

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
      if (courierMenuScreen) courierMenuScreen.style.display = "none";
    } else {
      // Курьер — главное меню (как панель администратора)
      if (adminScreen) adminScreen.style.display = "none";
      showCourierMenuScreen();
      console.log("courierMenuScreen показан");
    }

    if (deliveriesScreen) deliveriesScreen.style.display = "none";
    if (accessDeniedScreen) accessDeniedScreen.style.display = "none";

    console.log("=== showMainInterface END ===");
  }

  function showCourierMenuScreen() {
    if (courierMenuScreen) {
      courierMenuScreen.style.cssText = `
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        position: relative !important;
        z-index: 1 !important;
      `;
    }
    if (mainScreen) mainScreen.style.display = "none";
    if (deliveriesScreen) deliveriesScreen.style.display = "none";
    if (courierReportsListScreen) courierReportsListScreen.style.cssText = "display: none;";
    closeCourierFiltersSheet();
    currentScreen = "courier-menu";
  }

  function showCourierCreateReport() {
    if (courierMenuScreen) courierMenuScreen.style.cssText = "display: none;";
    if (mainScreen) {
      mainScreen.style.cssText = `
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        position: relative !important;
        z-index: 1 !important;
      `;
    }
    currentScreen = "main";
    updateTotalSalary();
  }

  function backToCourierMenu() {
    if (currentUserRole === "admin") return;
    showCourierMenuScreen();
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
    /** Поля клиники: id, name, city, address, courier_salary, cost_for_laboratory, laboratory */
    const mockClinics = [
      {
        id: 1,
        name: 'Хороший доктор"',
        city: "Ростов-на-Дону",
        address: "ул. Немировича-Данченко, 76",
        courier_salary: 200,
        cost_for_laboratory: 300,
        laboratory: "Ситилаб",
      },
      {
        id: 2,
        name: "РГУПС",
        city: "Ростов-на-Дону",
        address: "ул. Ларина, 2",
        courier_salary: 150,
        cost_for_laboratory: 300,
        laboratory: "Инвитро",
      },
      {
        id: 3,
        name: 'ИП Агапов"',
        city: "Ростов-на-Дону",
        address: "пр. Ленина, 251",
        courier_salary: 200,
        cost_for_laboratory: 300,
        laboratory: "Ситилаб",
      },
      {
        id: 4,
        name: "Мать и Дитя",
        city: "Ростов-на-Дону",
        address: "пр. Ленина, 145",
        courier_salary: 150,
        cost_for_laboratory: 300,
        laboratory: "Инвитро",
      },
      {
        id: 5,
        name: "МСЧ Роствертол",
        city: "Ростов-на-Дону",
        address: "ул. Новаторов, 5",
        courier_salary: 150,
        cost_for_laboratory: 300,
        laboratory: "Диалаб",
      },
      {
        id: 6,
        name: "Ситилаб",
        city: "Ростов-на-Дону",
        address: "пр-т. Нагибина, 49",
        courier_salary: 200,
        cost_for_laboratory: 300,
        laboratory: "Ситилаб",
      },
      {
        id: 7,
        name: "Умная Клиника",
        city: "Ростов-на-Дону",
        address: "ул. Башкирская, 4",
        courier_salary: 200,
        cost_for_laboratory: 300,
        laboratory: "Гемотест",
      },
      {
        id: 8,
        name: "Гемотест",
        city: "Ростов-на-Дону",
        address: "пр. Нагибина, 21/2",
        courier_salary: 200,
        cost_for_laboratory: 300,
        laboratory: "Гемотест",
      },
      {
        id: 9,
        name: "Гемотест",
        city: "Ростов-на-Дону",
        address: "пр. Будённовский, 96",
        courier_salary: 200,
        cost_for_laboratory: 300,
        laboratory: "Гемотест",
      },
      {
        id: 10,
        name: "Здоровые руки",
        city: "Ростов-на-Дону",
        address: "ул. Юфимцева, 10/1",
        courier_salary: 200,
        cost_for_laboratory: 300,
        laboratory: "Гемотест",
      },

      {
        id: 11,
        name: "Медина",
        city: "Ростов-на-Дону",
        address: "п. Халтуринский, 206В",
        courier_salary: 200,
        cost_for_laboratory: 300,
        laboratory: "Гемотест",
      },

      {
        id: 12,
        name: "Гемотест",
        city: "Ростов-на-Дону",
        address: "ул. Пушкинская, 81",
        courier_salary: 200,
        cost_for_laboratory: 300,
        laboratory: "Гемотест",
      },

      {
        id: 13,
        name: "Клиника профессора Буштыревой",
        city: "Ростов-на-Дону",
        address: "п. Соборный, 58",
        courier_salary: 200,
        cost_for_laboratory: 300,
        laboratory: "Ситилаб",
      },
      {
        id: 14,
        name: "Гемотест",
        city: "Ростов-на-Дону",
        address: "пр. Ворошиловский, 64/257",
        courier_salary: 200,
        cost_for_laboratory: 300,
        laboratory: "Гемотест",
      },
      {
        id: 15,
        name: "Привелегия",
        city: "Ростов-на-Дону",
        address: "пр. Тельмана, 110",
        courier_salary: 200,
        cost_for_laboratory: 300,
        laboratory: "Ситилаб",
      },
      {
        id: 16,
        name: "Южный Ветер",
        city: "Ростов-на-Дону",
        address: "ул. Восточная, 13/113",
        courier_salary: 200,
        cost_for_laboratory: 300,
        laboratory: "Гемотест",
      },
      {
        id: 17,
        name: "Medical Home",
        city: "Ростов-на-Дону",
        address: "ул. Пушкинская, 225",
        courier_salary: 200,
        cost_for_laboratory: 300,
        laboratory: "Ситилаб",
      },
      {
        id: 18,
        name: "СтатисМед",
        city: "Ростов-на-Дону",
        address: "ул. Пушкинская, 243",
        courier_salary: 200,
        cost_for_laboratory: 300,
        laboratory: "Ситилаб",
      },
      {
        id: 19,
        name: "Биорайз",
        city: "Ростов-на-Дону",
        address: "ул. Чехова, 51",
        courier_salary: 200,
        cost_for_laboratory: 300,
        laboratory: "Ситилаб",
      },
      {
        id: 20,
        name: "ДонЗдрав",
        city: "Ростов-на-Дону",
        address: "п. Университетский, 115",
        courier_salary: 200,
        cost_for_laboratory: 300,
        laboratory: "Ситилаб",
      },
      {
        id: 21,
        name: "Ситилаб",
        city: "Ростов-на-Дону",
        address: "ул. Пушкинская, 135/33",
        courier_salary: 200,
        cost_for_laboratory: 300,
        laboratory: "Ситилаб",
      },
      {
        id: 22,
        name: "Лонга Вита",
        city: "Ростов-на-Дону",
        address: "ул. Соколова, 13",
        courier_salary: 200,
        cost_for_laboratory: 300,
        laboratory: "Ситилаб",
      },
    ];
    console.log("loadClinicsForUser вернул", mockClinics.length, "клиник");
    return mockClinics;
  }

  function clinicCourierPay(clinic) {
    return clinic?.courier_salary ?? clinic?.salary ?? 0;
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
      clinicDiv.dataset.city = clinic.city ?? "";
      clinicDiv.dataset.streetAddress = clinic.address ?? "";
      clinicDiv.dataset.costForLaboratory = String(
        clinic.cost_for_laboratory ?? 0,
      );
      clinicDiv.dataset.laboratory = clinic.laboratory ?? "";

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
      const cityPart = (clinic.city || "").trim();
      const streetPart = (clinic.address || "").trim();
      addressSpan.textContent = [cityPart, streetPart]
        .filter(Boolean)
        .join(", ");

      const pay = clinicCourierPay(clinic);
      const salarySpan = document.createElement("span");
      salarySpan.className = "clinic-salary";
      const salaryValue = document.createElement("span");
      salaryValue.className = "clinic-salary-value";
      salaryValue.dataset.salary = String(pay);
      salaryValue.style.display = "none";
      salarySpan.textContent = `${pay.toLocaleString("ru-RU")} ₽`;

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
        const salaryValueSpan = item.querySelector(".clinic-salary-value");
        const pay = salaryValueSpan
          ? parseInt(salaryValueSpan.dataset.salary, 10)
          : 0;
        const city = item.dataset.city || "";
        const street = item.dataset.streetAddress || "";
        const lab = parseInt(item.dataset.costForLaboratory || "0", 10) || 0;
        const laboratory = item.dataset.laboratory || "";
        selectedClinics.push({
          id: item.dataset.id,
          name: nameSpan ? nameSpan.textContent : "",
          city,
          address: street,
          courier_salary: pay,
          cost_for_laboratory: lab,
          laboratory,
        });
        totalSalary += pay;
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
    const fromDisplay = document.getElementById(
      "filter-date-from-sheet-display",
    );
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

  // ========== «МОИ ОТЧЁТЫ» (курьер) ==========

  function syncCourierSheetDateDisplays() {
    const fromInput = document.getElementById("courier-filter-date-from-sheet");
    const toInput = document.getElementById("courier-filter-date-to-sheet");
    const fromDisplay = document.getElementById(
      "courier-filter-date-from-sheet-display",
    );
    const toDisplay = document.getElementById(
      "courier-filter-date-to-sheet-display",
    );

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

  function syncCourierFilterDateInputsFromState() {
    const dateFromInput = document.getElementById("courier-filter-date-from");
    const dateToInput = document.getElementById("courier-filter-date-to");
    if (dateFromInput) dateFromInput.value = currentCourierFilterDateFrom || "";
    if (dateToInput) dateToInput.value = currentCourierFilterDateTo || "";
  }

  function syncCourierSheetInputsFromState() {
    const dateFromInput = document.getElementById("courier-filter-date-from-sheet");
    const dateToInput = document.getElementById("courier-filter-date-to-sheet");
    if (dateFromInput) dateFromInput.value = currentCourierFilterDateFrom || "";
    if (dateToInput) dateToInput.value = currentCourierFilterDateTo || "";
    syncCourierSheetDateDisplays();
  }

  function syncAllCourierFilterInputsFromState() {
    syncCourierFilterDateInputsFromState();
    syncCourierSheetInputsFromState();
  }

  function countActiveCourierFilters() {
    let n = 0;
    if (currentCourierFilterDateFrom) n += 1;
    if (currentCourierFilterDateTo) n += 1;
    return n;
  }

  function updateCourierFilterBadge() {
    const badge = document.getElementById("courier-filter-active-badge");
    if (!badge) return;
    const n = countActiveCourierFilters();
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

  function openCourierFiltersSheet() {
    syncCourierSheetInputsFromState();
    const sheet = document.getElementById("courier-filters-sheet");
    const openBtn = document.getElementById("courier-filter-open-sheet-btn");
    if (sheet) {
      sheet.classList.add("filters-sheet--open");
      sheet.setAttribute("aria-hidden", "false");
    }
    if (openBtn) openBtn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }

  function closeCourierFiltersSheet() {
    const sheet = document.getElementById("courier-filters-sheet");
    const openBtn = document.getElementById("courier-filter-open-sheet-btn");
    if (sheet) {
      sheet.classList.remove("filters-sheet--open");
      sheet.setAttribute("aria-hidden", "true");
    }
    if (openBtn) openBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  function applyCourierFiltersFromSheet() {
    const dateFromInput = document.getElementById("courier-filter-date-from-sheet");
    const dateToInput = document.getElementById("courier-filter-date-to-sheet");
    if (dateFromInput) currentCourierFilterDateFrom = dateFromInput.value || "";
    if (dateToInput) currentCourierFilterDateTo = dateToInput.value || "";
    syncCourierFilterDateInputsFromState();
    scheduleCourierFilterDateInputsSync();
    applyCourierFiltersAndDisplay();
    closeCourierFiltersSheet();
  }

  function scheduleCourierFilterDateInputsSync() {
    syncCourierFilterDateInputsFromState();
    requestAnimationFrame(syncCourierFilterDateInputsFromState);
    setTimeout(syncCourierFilterDateInputsFromState, 0);
    setTimeout(syncCourierFilterDateInputsFromState, 150);
  }

  function resetCourierFilters() {
    currentCourierFilterDateFrom = "";
    currentCourierFilterDateTo = "";
    syncAllCourierFilterInputsFromState();
    scheduleCourierFilterDateInputsSync();
    applyCourierFiltersAndDisplay();
  }

  function applyCourierFiltersAndDisplay() {
    let filteredReports = allReports.filter(
      (report) => String(report.userId) === String(currentUserId),
    );

    if (currentCourierFilterDateFrom) {
      filteredReports = filteredReports.filter(
        (report) => report.date >= currentCourierFilterDateFrom,
      );
    }
    if (currentCourierFilterDateTo) {
      filteredReports = filteredReports.filter(
        (report) => report.date <= currentCourierFilterDateTo,
      );
    }

    displayCourierReportsList(filteredReports);
    updateCourierFilterBadge();
  }

  function displayCourierReportsList(reports) {
    const container = document.getElementById("courier-reports-list-container");
    if (!container) return;

    if (reports.length === 0) {
      container.innerHTML =
        '<div class="empty-deliveries">Нет отчётов по выбранным фильтрам</div>';
      return;
    }

    container.innerHTML = "";
    reports.forEach((report) => {
      const reportDiv = document.createElement("div");
      reportDiv.className = "report-item report-item--compact";
      reportDiv.dataset.id = report.id;

      const dateEl = document.createElement("div");
      dateEl.className = "report-item-date";
      dateEl.textContent = report.formattedDate || report.date;

      reportDiv.appendChild(dateEl);
      reportDiv.addEventListener("click", () => showReportDetail(report));
      container.appendChild(reportDiv);
    });
  }

  function showCourierReportsListScreen() {
    reportsListContext = "courier";
    if (courierMenuScreen) courierMenuScreen.style.cssText = "display: none;";
    if (mainScreen) mainScreen.style.display = "none";
    if (deliveriesScreen) deliveriesScreen.style.display = "none";
    if (adminScreen) adminScreen.style.display = "none";
    const reportsListScreen = document.getElementById("reports-list-screen");
    if (reportsListScreen) reportsListScreen.style.display = "none";
    const reportDetailScreen = document.getElementById("report-detail-screen");
    if (reportDetailScreen) reportDetailScreen.style.display = "none";
    const detailsScreen = document.getElementById("details-screen");
    if (detailsScreen) detailsScreen.style.display = "none";

    if (courierReportsListScreen) {
      courierReportsListScreen.style.cssText = `
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        position: relative !important;
        z-index: 1 !important;
      `;
    }

    loadAllReports();
    syncAllCourierFilterInputsFromState();
    scheduleCourierFilterDateInputsSync();
    applyCourierFiltersAndDisplay();
    currentScreen = "courier-reports";
  }

  function backToCourierMenuFromReports() {
    closeCourierFiltersSheet();
    if (courierReportsListScreen) courierReportsListScreen.style.cssText = "display: none;";
    showCourierMenuScreen();
  }

  function updateCourierFilterDateFrom() {
    const el = document.getElementById("courier-filter-date-from");
    if (el) {
      currentCourierFilterDateFrom = el.value || "";
      applyCourierFiltersAndDisplay();
    }
  }

  function updateCourierFilterDateTo() {
    const el = document.getElementById("courier-filter-date-to");
    if (el) {
      currentCourierFilterDateTo = el.value || "";
      applyCourierFiltersAndDisplay();
    }
  }

  // Показываем экран списка отчётов
  function showReportsListScreen() {
    console.log("showReportsListScreen вызван");
    reportsListContext = "admin";

    // Скрываем админ-панель
    if (adminScreen) adminScreen.style.display = "none";
    const detailsScreen = document.getElementById("details-screen");
    if (detailsScreen) detailsScreen.style.display = "none";
    if (courierReportsListScreen) courierReportsListScreen.style.cssText = "display: none;";

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

  function openDeleteReportModal(report) {
    if (!report) return;
    if (currentUserRole === "courier") {
      if (String(report.userId) !== String(currentUserId)) return;
    } else if (currentUserRole !== "admin") {
      return;
    }
    pendingDeleteReportId = report.id;
    const summary = document.getElementById("delete-report-modal-summary");
    if (summary) {
      const courier = report.userName || report.userPhone || "Курьер";
      summary.textContent =
        currentUserRole === "courier"
          ? `${report.formattedDate || report.date}`
          : `${report.formattedDate || report.date} · ${courier}`;
    }
    const hint = document.getElementById("delete-report-modal-hint");
    if (hint) {
      hint.textContent =
        currentUserRole === "courier"
          ? "Отчёт удалится у всех, включая админа. Отменить удаление будет нельзя."
          : "Отчёт удалится у всех, включая курьера. Отменить удаление будет нельзя.";
    }
    const bd = document.getElementById("delete-report-modal-backdrop");
    if (bd) bd.hidden = false;
  }

  function closeDeleteReportModal() {
    const bd = document.getElementById("delete-report-modal-backdrop");
    if (bd) bd.hidden = true;
    pendingDeleteReportId = null;
  }

  function confirmDeleteReport() {
    const id = pendingDeleteReportId;
    if (!id) {
      closeDeleteReportModal();
      return;
    }

    const reportToDelete = allReports.find((r) => String(r.id) === String(id));
    let allowed = false;
    if (currentUserRole === "admin") allowed = true;
    else if (
      currentUserRole === "courier" &&
      reportToDelete &&
      String(reportToDelete.userId) === String(currentUserId)
    ) {
      allowed = true;
    }
    if (!allowed) {
      closeDeleteReportModal();
      return;
    }

    const detailScreen = document.getElementById("report-detail-screen");
    const onDetail =
      detailScreen &&
      window.getComputedStyle(detailScreen).display !== "none" &&
      adminViewingReportId != null &&
      String(adminViewingReportId) === String(id);

    const list = JSON.parse(localStorage.getItem("reports") || "[]");
    const filtered = list.filter((r) => String(r.id) !== String(id));
    localStorage.setItem("reports", JSON.stringify(filtered));
    allReports = filtered;
    allReports.sort((a, b) => new Date(b.date) - new Date(a.date));

    closeDeleteReportModal();

    if (onDetail) {
      adminViewingReportId = null;
      if (detailScreen) detailScreen.style.display = "none";
      const reportsListScreen = document.getElementById("reports-list-screen");
      if (reportsListContext === "courier") {
        if (reportsListScreen) reportsListScreen.style.display = "none";
        if (courierReportsListScreen) {
          courierReportsListScreen.style.cssText = `
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            position: relative !important;
            z-index: 1 !important;
          `;
        }
      } else {
        if (courierReportsListScreen) courierReportsListScreen.style.cssText = "display: none;";
        if (reportsListScreen) reportsListScreen.style.display = "block";
      }
      closeFiltersSheet();
      closeCourierFiltersSheet();
    }

    populateCourierFilter();
    applyFiltersAndDisplay();
    if (reportsListContext === "courier") {
      applyCourierFiltersAndDisplay();
    }
    showSuccess("Отчёт удалён");
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

      const dateEl = document.createElement("div");
      dateEl.className = "report-item-date";
      dateEl.textContent = report.formattedDate || report.date;
      const courierEl = document.createElement("div");
      courierEl.className = "report-item-courier";
      courierEl.textContent = report.userName || report.userPhone || "Курьер";

      reportDiv.appendChild(dateEl);
      reportDiv.appendChild(courierEl);
      reportDiv.addEventListener("click", () => showReportDetail(report));
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
    adminViewingReportId = report.id;
    closeFiltersSheet();

    const reportsListScreen = document.getElementById("reports-list-screen");
    if (reportsListScreen) reportsListScreen.style.display = "none";
    if (courierReportsListScreen) courierReportsListScreen.style.cssText = "display: none;";

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
        const pay = clinicCourierPay(clinic);
        const city = (clinic.city || "").trim();
        const street = (clinic.address || "").trim();
        const addrShown = [city, street].filter(Boolean).join(", ") || street;
        clinicsHTML += `
          <div class="clinic-compact-item">
            <div class="clinic-compact-info">
              <div class="clinic-compact-name">${clinic.name}</div>
              <div class="clinic-compact-address">${addrShown}</div>
            </div>
            <div class="clinic-compact-salary-badge">${pay.toLocaleString("ru-RU")} ₽</div>
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

    const canDeleteReport =
      currentUserRole === "admin" ||
      (currentUserRole === "courier" &&
        report &&
        String(report.userId) === String(currentUserId));

    const adminDeleteBlock = canDeleteReport
      ? `<div class="report-detail-delete-wrap">
        <button type="button" class="report-detail-delete-btn" id="report-detail-delete-btn">
          Удалить отчёт
        </button>
      </div>`
      : "";

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
        <span class="total-salary-amount">${(report.totalSalary ?? 0).toLocaleString("ru-RU")} ₽</span>
      </div>
      ${adminDeleteBlock}
    `;

    if (canDeleteReport) {
      const delDetailBtn = document.getElementById("report-detail-delete-btn");
      if (delDetailBtn) {
        delDetailBtn.addEventListener("click", () =>
          openDeleteReportModal(report),
        );
      }
    }
  }

  // Возврат к списку отчётов
  function backToReportsList() {
    console.log("backToReportsList вызван");
    adminViewingReportId = null;

    const reportDetailScreen = document.getElementById("report-detail-screen");
    if (reportDetailScreen) reportDetailScreen.style.display = "none";

    if (reportsListContext === "courier") {
      showCourierReportsListScreen();
    } else {
      showReportsListScreen();
    }
  }

  // Возврат к админ-панели
  function backToAdminPanel() {
    console.log("backToAdminPanel вызван");
    closeFiltersSheet();
    closeCourierFiltersSheet();

    const reportsListScreen = document.getElementById("reports-list-screen");
    const detailsScreen = document.getElementById("details-screen");
    if (reportsListScreen) reportsListScreen.style.display = "none";
    if (detailsScreen) detailsScreen.style.display = "none";
    if (courierReportsListScreen) courierReportsListScreen.style.cssText = "display: none;";

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
    const explicitCity = (clinic?.city || "").trim();
    if (explicitCity) {
      const street = (clinic?.address || "").trim();
      return {
        clinicName,
        city: explicitCity,
        address: street || "Не указан",
      };
    }
    const parsed = splitCityAndAddress(clinic?.address);
    return {
      clinicName,
      city: parsed.city,
      address: parsed.address || (clinic?.address || "").trim(),
    };
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

  /**
   * Ширина столбцов xlsx (SheetJS !cols / wch) по содержимому строк.
   * dayColumnStartIndex — с какого индекса идут узкие колонки дней (1–31).
   */
  function buildXlsxSheetColumnWidths(matrix, dayColumnStartIndex) {
    if (!matrix.length) return [];
    const colCount = matrix.reduce((m, row) => Math.max(m, row.length), 0);
    const cols = [];
    for (let c = 0; c < colCount; c++) {
      let maxLen = 1;
      for (let r = 0; r < matrix.length; r++) {
        const cell = matrix[r][c];
        if (cell == null || cell === "") continue;
        const L = String(cell).length;
        if (L > maxLen) maxLen = L;
      }
      const isDayCol =
        typeof dayColumnStartIndex === "number" && c >= dayColumnStartIndex;
      let wch;
      if (isDayCol) {
        wch = Math.min(Math.max(maxLen + 1, 4), 8);
      } else {
        wch = Math.min(Math.ceil(maxLen * 1.15) + 2, 55);
        wch = Math.max(wch, 10);
      }
      cols.push({ wch });
    }
    return cols;
  }

  function syncDetailsMonthUIsFromHidden() {
    const hidden = document.getElementById("details-month");
    const v = hidden?.value || "";
    if (v.length === 7) {
      const [year, month] = v.split("-");
      const monthPart = document.getElementById("details-month-part");
      const yearPart = document.getElementById("details-year-part");
      if (monthPart) monthPart.value = month;
      if (yearPart) yearPart.value = year;
    }
  }

  function applyDetailsDesktopPickToHidden() {
    const monthPart = document.getElementById("details-month-part");
    const yearPart = document.getElementById("details-year-part");
    const hidden = document.getElementById("details-month");
    if (!monthPart || !yearPart || !hidden) return;
    if (!monthPart.value || !yearPart.value) {
      hidden.value = "";
      return;
    }
    hidden.value = `${yearPart.value}-${monthPart.value}`;
  }

  function populateDetailsMonthDesktopSelects() {
    const monthPart = document.getElementById("details-month-part");
    const yearPart = document.getElementById("details-year-part");
    if (monthPart && monthPart.options.length === 0) {
      const months = [
        ["01", "Январь"],
        ["02", "Февраль"],
        ["03", "Март"],
        ["04", "Апрель"],
        ["05", "Май"],
        ["06", "Июнь"],
        ["07", "Июль"],
        ["08", "Август"],
        ["09", "Сентябрь"],
        ["10", "Октябрь"],
        ["11", "Ноябрь"],
        ["12", "Декабрь"],
      ];
      months.forEach(([val, label]) => {
        const o = document.createElement("option");
        o.value = val;
        o.textContent = label;
        monthPart.appendChild(o);
      });
    }
    if (yearPart && yearPart.options.length === 0) {
      const currentY = new Date().getFullYear();
      for (let y = currentY - 6; y <= currentY + 2; y += 1) {
        const o = document.createElement("option");
        o.value = String(y);
        o.textContent = String(y);
        yearPart.appendChild(o);
      }
    }
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
    if (courierReportsListScreen) courierReportsListScreen.style.cssText = "display: none;";
    if (reportDetailScreen) reportDetailScreen.style.display = "none";
    const detailsMonthHidden = document.getElementById("details-month");
    if (detailsMonthHidden && !detailsMonthHidden.value) {
      const now = new Date();
      detailsMonthHidden.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    }
    hideDetailsInlineError();
    syncDetailsMonthUIsFromHidden();
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
        typeof report?.date === "string" &&
        report.date.startsWith(`${monthValue}-`),
    );

    const clinicsCounter = new Map();
    monthReports.forEach((report) => {
      if (!Array.isArray(report?.clinics)) return;
      const courierName =
        (report.userName || report.userPhone || "Курьер").trim() || "Курьер";
      report.clinics.forEach((clinic) => {
        const normalized = normalizeClinicExportData(clinic);
        const laboratory = String(clinic?.laboratory ?? "").trim();
        const costRaw = clinic?.cost_for_laboratory;
        const costForLaboratory = Number.isFinite(Number(costRaw))
          ? Number(costRaw)
          : 0;
        const key = [
          courierName.toLowerCase(),
          laboratory.toLowerCase(),
          normalized.clinicName.toLowerCase(),
          normalized.city.toLowerCase(),
          normalized.address.toLowerCase(),
          String(costForLaboratory),
        ].join("|");
        if (!clinicsCounter.has(key)) {
          clinicsCounter.set(key, {
            courierName,
            laboratory,
            clinicName: normalized.clinicName,
            city: normalized.city,
            address: normalized.address,
            costForLaboratory,
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
    const rows = [
      [
        "Курьер",
        "Лаборатория",
        "Наименование МЦ",
        "Город",
        "Адрес",
        "Количество",
        "Стоимость",
        "Итого",
        ...dayHeaders,
      ],
    ];

    Array.from(clinicsCounter.values())
      .sort((a, b) => {
        const byCourier = a.courierName.localeCompare(b.courierName, "ru");
        if (byCourier !== 0) return byCourier;
        const byLab = a.laboratory.localeCompare(b.laboratory, "ru");
        if (byLab !== 0) return byLab;
        return a.clinicName.localeCompare(b.clinicName, "ru");
      })
      .forEach((item) => {
        const dayCells = Array.from({ length: 31 }, (_, index) =>
          item.dayMarks.has(index + 1) ? "+" : "",
        );
        const qty = item.visits;
        const unitCost = item.costForLaboratory;
        const lineTotal = qty * unitCost;
        rows.push([
          item.courierName,
          item.laboratory,
          item.clinicName,
          item.city,
          item.address,
          qty,
          unitCost,
          lineTotal,
          ...dayCells,
        ]);
      });

    try {
      if (window.XLSX) {
        const workbook = window.XLSX.utils.book_new();
        const worksheet = window.XLSX.utils.aoa_to_sheet(rows);
        const dayColStart =
          rows[0] && rows[0].length > 31 ? rows[0].length - 31 : 8;
        worksheet["!cols"] = buildXlsxSheetColumnWidths(rows, dayColStart);
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
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";"),
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

  const deleteReportBackdrop = document.getElementById(
    "delete-report-modal-backdrop",
  );
  const deleteReportCancel = document.getElementById(
    "delete-report-modal-cancel",
  );
  const deleteReportConfirm = document.getElementById(
    "delete-report-modal-confirm",
  );
  if (deleteReportCancel)
    deleteReportCancel.addEventListener("click", closeDeleteReportModal);
  if (deleteReportConfirm)
    deleteReportConfirm.addEventListener("click", confirmDeleteReport);
  if (deleteReportBackdrop) {
    deleteReportBackdrop.addEventListener("click", (e) => {
      if (e.target === deleteReportBackdrop) closeDeleteReportModal();
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

  const courierCreateReportBtn = document.getElementById(
    "courier-create-report-btn",
  );
  const courierMyReportsBtn = document.getElementById("courier-my-reports-btn");
  const backToCourierMenuBtn = document.getElementById(
    "back-to-courier-menu-btn",
  );
  if (courierCreateReportBtn) {
    courierCreateReportBtn.addEventListener("click", () => {
      showCourierCreateReport();
    });
  }
  if (courierMyReportsBtn) {
    courierMyReportsBtn.addEventListener("click", () => {
      showCourierReportsListScreen();
    });
  }
  const backToCourierMenuFromReportsBtn = document.getElementById(
    "back-to-courier-menu-from-reports-btn",
  );
  if (backToCourierMenuFromReportsBtn) {
    backToCourierMenuFromReportsBtn.addEventListener(
      "click",
      backToCourierMenuFromReports,
    );
  }
  if (backToCourierMenuBtn) {
    backToCourierMenuBtn.addEventListener("click", backToCourierMenu);
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
  const detailsMonthHidden = document.getElementById("details-month");
  const detailsMonthPart = document.getElementById("details-month-part");
  const detailsYearPart = document.getElementById("details-year-part");

  populateDetailsMonthDesktopSelects();

  if (detailsExportBtn) {
    detailsExportBtn.addEventListener("click", exportDetailsToExcel);
  }
  if (detailsMonthPart && detailsYearPart) {
    const onMonthYearChange = () => {
      applyDetailsDesktopPickToHidden();
      syncDetailsMonthUIsFromHidden();
      hideDetailsInlineError();
    };
    detailsMonthPart.addEventListener("change", onMonthYearChange);
    detailsYearPart.addEventListener("change", onMonthYearChange);
  }
  if (detailsMonthHidden && !detailsMonthHidden.value) {
    const now = new Date();
    detailsMonthHidden.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }
  syncDetailsMonthUIsFromHidden();

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
  const filterMobileResetBtn = document.getElementById(
    "filter-mobile-reset-btn",
  );
  const filtersSheetBackdrop = document.getElementById(
    "filters-sheet-backdrop",
  );
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

  const courierFilterDateFrom = document.getElementById("courier-filter-date-from");
  const courierFilterDateTo = document.getElementById("courier-filter-date-to");
  const courierFilterResetBtn = document.getElementById("courier-filter-reset-btn");
  const courierFilterOpenSheetBtn = document.getElementById(
    "courier-filter-open-sheet-btn",
  );
  const courierFilterMobileResetBtn = document.getElementById(
    "courier-filter-mobile-reset-btn",
  );
  const courierFiltersSheetBackdrop = document.getElementById(
    "courier-filters-sheet-backdrop",
  );
  const courierFiltersSheetApply = document.getElementById(
    "courier-filters-sheet-apply",
  );
  const courierFiltersSheetReset = document.getElementById(
    "courier-filters-sheet-reset",
  );
  const courierFilterDateFromSheet = document.getElementById(
    "courier-filter-date-from-sheet",
  );
  const courierFilterDateToSheet = document.getElementById(
    "courier-filter-date-to-sheet",
  );

  if (courierFilterOpenSheetBtn) {
    courierFilterOpenSheetBtn.addEventListener("click", openCourierFiltersSheet);
  }
  if (courierFilterMobileResetBtn) {
    courierFilterMobileResetBtn.addEventListener("click", () => {
      resetCourierFilters();
      closeCourierFiltersSheet();
    });
  }
  if (courierFiltersSheetBackdrop) {
    courierFiltersSheetBackdrop.addEventListener("click", closeCourierFiltersSheet);
  }
  if (courierFiltersSheetApply) {
    courierFiltersSheetApply.addEventListener("click", applyCourierFiltersFromSheet);
  }
  if (courierFiltersSheetReset) {
    courierFiltersSheetReset.addEventListener("click", () => {
      resetCourierFilters();
      closeCourierFiltersSheet();
    });
  }
  if (courierFilterDateFrom) {
    courierFilterDateFrom.addEventListener("change", updateCourierFilterDateFrom);
  }
  if (courierFilterDateTo) {
    courierFilterDateTo.addEventListener("change", updateCourierFilterDateTo);
  }
  if (courierFilterResetBtn) {
    courierFilterResetBtn.addEventListener("click", resetCourierFilters);
  }
  if (courierFilterDateFromSheet) {
    courierFilterDateFromSheet.addEventListener("change", syncCourierSheetDateDisplays);
    courierFilterDateFromSheet.addEventListener("input", syncCourierSheetDateDisplays);
  }
  if (courierFilterDateToSheet) {
    courierFilterDateToSheet.addEventListener("change", syncCourierSheetDateDisplays);
    courierFilterDateToSheet.addEventListener("input", syncCourierSheetDateDisplays);
  }
  syncCourierSheetDateDisplays();

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const delBd = document.getElementById("delete-report-modal-backdrop");
    if (delBd && !delBd.hidden) {
      e.preventDefault();
      closeDeleteReportModal();
      return;
    }
    const courierSheet = document.getElementById("courier-filters-sheet");
    if (courierSheet && courierSheet.classList.contains("filters-sheet--open")) {
      e.preventDefault();
      closeCourierFiltersSheet();
      return;
    }
    const sheet = document.getElementById("filters-sheet");
    if (sheet && sheet.classList.contains("filters-sheet--open")) {
      e.preventDefault();
      closeFiltersSheet();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 640) {
      closeFiltersSheet();
      closeCourierFiltersSheet();
    }
  });
});
