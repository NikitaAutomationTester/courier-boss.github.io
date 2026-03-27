document.addEventListener("DOMContentLoaded", () => {
  if (window.WebApp) {
    window.WebApp.ready();
    window.WebApp.expand();
  }

  let currentUserId = null;
  let extraDeliveries = [];
  let currentScreen = "main";
  let currentUser = null;
  let isAuthorized = false;

  // Элементы DOM
  const mainScreen = document.getElementById("main-screen");
  const deliveriesScreen = document.getElementById("deliveries-screen");
  const accessDeniedScreen = document.getElementById("access-denied-screen");
  const loadingScreen = document.getElementById("loading-screen");
  const authScreen = document.getElementById("auth-screen");
  const authPhone = document.getElementById("auth-phone");
  const authLoginBtn = document.getElementById("auth-login-btn");
  const authError = document.getElementById("auth-error");

  // Показываем экран загрузки
  function showLoading() {
    if (loadingScreen) loadingScreen.style.display = "flex";
    if (mainScreen) mainScreen.style.display = "none";
    if (deliveriesScreen) deliveriesScreen.style.display = "none";
    if (accessDeniedScreen) accessDeniedScreen.style.display = "none";
    if (authScreen) authScreen.style.display = "none";
  }

  // Скрываем экран загрузки
  function hideLoading() {
    if (loadingScreen) loadingScreen.style.display = "none";
  }

  // Показываем экран авторизации
  function showAuthScreen() {
    hideLoading();
    if (authScreen) authScreen.style.display = "block";
    if (mainScreen) mainScreen.style.display = "none";
    if (deliveriesScreen) deliveriesScreen.style.display = "none";
    if (accessDeniedScreen) accessDeniedScreen.style.display = "none";
    if (authError) authError.style.display = "none";
  }

  // Показываем экран отказа в доступе
  function showAccessDenied(
    message = "У вас нет прав для использования этого приложения",
  ) {
    hideLoading();
    const deniedMessage = document.getElementById("access-denied-message");
    if (deniedMessage) deniedMessage.textContent = message;
    if (authScreen) authScreen.style.display = "none";
    if (mainScreen) mainScreen.style.display = "none";
    if (deliveriesScreen) deliveriesScreen.style.display = "none";
    if (accessDeniedScreen) accessDeniedScreen.style.display = "block";
  }

  // Показываем основной интерфейс
  function showMainInterface() {
    hideLoading();
    if (authScreen) authScreen.style.display = "none";
    if (mainScreen) mainScreen.style.display = "block";
    if (deliveriesScreen) deliveriesScreen.style.display = "none";
    if (accessDeniedScreen) accessDeniedScreen.style.display = "none";
  }

  // Показываем ошибку на экране авторизации
  function showAuthError(message) {
    if (authError) {
      authError.textContent = message;
      authError.style.display = "block";
      setTimeout(() => {
        if (authError) authError.style.display = "none";
      }, 3000);
    }
  }

  function login() {
    // Получаем номер без +7 (только цифры)
    const rawPhone = authPhone ? authPhone.value.trim() : "";

    if (!rawPhone) {
      showAuthError("Введите номер телефона");
      return;
    }

    // Формируем полный номер с +7
    const fullPhone = "+7" + rawPhone.replace(/[^\d]/g, "");

    console.log("Проверка номера:", fullPhone);

    // Проверяем номер в базе
    if (window.isUserAllowed && window.isUserAllowed(fullPhone)) {
      const user = window.getUserByPhone(fullPhone);
      if (user) {
        currentUser = user;
        currentUserId = user.id;
        isAuthorized = true;

        sessionStorage.setItem("authorizedUserId", user.id);
        sessionStorage.setItem("authorizedUserPhone", fullPhone);
        sessionStorage.setItem("authorizedUserName", user.name);

        console.log("Авторизация успешна:", user);
        initMainApp();
        showMainInterface();
        return;
      }
    }

    // Если пользователь не найден
    showAuthError("Номер телефона не верный");
  }

  // ========== УНИВЕРСАЛЬНАЯ ФУНКЦИЯ ДЛЯ СООБЩЕНИЙ ==========
  function showMessage(message, isError = false) {
    if (window.WebApp && typeof window.WebApp.showPopup === "function") {
      window.WebApp.showPopup({
        title: isError ? "Ошибка" : "Успешно",
        message: message,
        buttons: [{ type: "ok", text: "OK" }],
      });
    } else {
      alert(message);
    }
  }

  function showSuccess(message) {
    showMessage(message, false);
  }

  function showError(message) {
    showMessage(message, true);
  }

  // ========== ОСНОВНЫЕ ФУНКЦИИ ПРИЛОЖЕНИЯ ==========

  function loadClinicsForUser(userId) {
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
    const clinicsContainer = document.getElementById("clinics-list");
    if (!clinicsContainer) return;
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
    const userClinics = loadClinicsForUser(currentUserId);
    displayClinics(userClinics);

    const saveButton = document.getElementById("save-report-btn");
    if (saveButton) {
      saveButton.removeEventListener("click", saveReport);
      saveButton.addEventListener("click", saveReport);
    }

    const extraDeliveriesBtn = document.getElementById("extra-deliveries-btn");
    if (extraDeliveriesBtn)
      extraDeliveriesBtn.addEventListener("click", showDeliveriesScreen);

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
    }

    checkFormValidity();
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

  // Запуск приложения
  showLoading();

  if (!checkSavedSession()) {
    // Если нет сохранённой сессии, показываем экран авторизации
    hideLoading();
    showAuthScreen();
  }

  // Обработчик кнопки авторизации
  if (authLoginBtn) {
    authLoginBtn.addEventListener("click", login);
  }

  // Обработка нажатия Enter в поле телефона
  if (authPhone) {
    authPhone.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        login();
      }
    });
  }
});
