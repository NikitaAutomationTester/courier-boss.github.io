document.addEventListener("DOMContentLoaded", () => {
  if (window.WebApp) {
    window.WebApp.ready();
    window.WebApp.expand();
  }

  let currentUserId = null;
  let extraDeliveries = [];
  let currentScreen = "main"; // 'main' или 'deliveries'

  if (
    window.WebApp &&
    window.WebApp.initDataUnsafe &&
    window.WebApp.initDataUnsafe.user
  ) {
    currentUserId = window.WebApp.initDataUnsafe.user.id;
  } else {
    currentUserId = "test_courier_123";
  }

  function loadClinicsForUser(userId) {
    const mockClinics = {
      test_courier_123: [
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
      ],
      real_courier_456: [
        {
          id: 10,
          name: 'Лаборатория "Гемотест"',
          address: "ул. Пушкина, 8",
          salary: 800,
        },
        {
          id: 11,
          name: 'Клиника "Медси"',
          address: "пр. Ленина, 55",
          salary: 950,
        },
      ],
    };
    return mockClinics[userId] || [];
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
    if (!selectedDate) return alert("Пожалуйста, выберите дату");

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
      return alert("Выберите клиники или добавьте доставку");
    }

    totalSalary += extraDeliveries.reduce((sum, d) => sum + (d.salary || 0), 0);

    const report = {
      userId: currentUserId,
      date: selectedDate,
      formattedDate: formattedDate,
      clinics: selectedClinics,
      totalSalary,
      extraDeliveries: [...extraDeliveries],
      timestamp: new Date().toISOString(),
    };

    let message = `Отчёт за ${formattedDate}\nИтого: ${totalSalary.toLocaleString("ru-RU")} ₽\n\nПосещено клиник: ${selectedClinics.length}\n`;

    if (selectedClinics.length > 0) {
      message += `\nСписок:\n`;
    }
    selectedClinics.forEach((clinic) => {
      message += `• ${clinic.name}\n  ${clinic.address}\n  ${clinic.salary.toLocaleString("ru-RU")} ₽\n\n`;
    });

    if (extraDeliveries.length > 0) {
      message += `\nДополнительные доставки:\n`;
      extraDeliveries.forEach((d, idx) => {
        message += `#${idx + 1}\n`;
        if (d.receiveAddress)
          message += `Получение груза: ${d.receiveAddress}\n`;
        message += `Доставка груза: ${d.deliveryAddress}\n`;
        if (d.comment) message += `Комментарий: ${d.comment}\n`;
        message += `Зарплата: ${d.salary.toLocaleString("ru-RU")} ₽\n\n`;
      });
    }
    alert(message);
  }

  // Функции для работы с экраном дополнительных доставок
  function updateDeliveriesList() {
    const container = document.getElementById("deliveries-list-container");
    const emptyDiv = document.getElementById("empty-deliveries");
    const extraCountSpan = document.getElementById("extra-count");

    if (extraCountSpan) {
      extraCountSpan.textContent = extraDeliveries.length;
    }

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
          infoHTML += `<div class="delivery-card-row">
            <span class="delivery-card-label">Откуда:</span> ${delivery.receiveAddress}
          </div>`;
        }

        infoHTML += `<div class="delivery-card-row">
          <span class="delivery-card-label">Куда:</span> ${delivery.deliveryAddress}
        </div>`;

        if (delivery.comment) {
          infoHTML += `<div class="delivery-card-row">
            <span class="delivery-card-label">Комментарий:</span> ${delivery.comment}
          </div>`;
        }

        infoHTML += `<div class="delivery-card-salary">
          ${delivery.salary.toLocaleString("ru-RU")} ₽
        </div>`;

        infoDiv.innerHTML = infoHTML;

        cardContent.appendChild(numberBadge);
        cardContent.appendChild(infoDiv);
        card.appendChild(cardContent);
        container.appendChild(card);
      });
    }
  }

  function showDeliveriesScreen() {
    const mainScreen = document.getElementById("main-screen");
    const deliveriesScreen = document.getElementById("deliveries-screen");

    if (mainScreen) mainScreen.style.display = "none";
    if (deliveriesScreen) deliveriesScreen.style.display = "block";

    currentScreen = "deliveries";
    updateDeliveriesList();
  }

  function showMainScreen() {
    const mainScreen = document.getElementById("main-screen");
    const deliveriesScreen = document.getElementById("deliveries-screen");

    if (mainScreen) mainScreen.style.display = "block";
    if (deliveriesScreen) deliveriesScreen.style.display = "none";

    currentScreen = "main";
    updateTotalSalary();
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
      alert("Укажите адрес доставки груза");
      return;
    }
    if (!isSalaryValid) {
      alert("Укажите зарплату целым числом");
      return;
    }

    const salary = parseInt(salaryText, 10);

    extraDeliveries.push({
      receiveAddress,
      deliveryAddress,
      comment,
      salary,
    });

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
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", closeExtraDeliveryModal);
  }
  if (modalAddBtn) {
    modalAddBtn.addEventListener("click", addExtraDeliveryFromModal);
  }

  if (extraModalDeliverEl) {
    extraModalDeliverEl.addEventListener("input", () => {
      updateExtraModalAddButtonState();
    });
    extraModalDeliverEl.addEventListener("change", () => {
      updateExtraModalAddButtonState();
    });
  }

  if (extraModalSalaryEl) {
    extraModalSalaryEl.addEventListener("input", () => {
      updateExtraModalAddButtonState();
    });
    extraModalSalaryEl.addEventListener("change", () => {
      updateExtraModalAddButtonState();
    });
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", (e) => {
      if (e.target === modalBackdrop) closeExtraDeliveryModal();
    });
  }

  // Инициализация главного экрана
  const userClinics = loadClinicsForUser(currentUserId);
  displayClinics(userClinics);

  const saveButton = document.getElementById("save-report-btn");
  if (saveButton) saveButton.addEventListener("click", saveReport);

  const dateInput = document.getElementById("report-date");
  const dateDisplay = document.getElementById("report-date-display");
  if (dateInput) {
    const formatIsoDateToRu = (isoDate) => {
      if (!isoDate) return "";
      const [year, month, day] = isoDate.split("-");
      if (!year || !month || !day) return "";
      return `${day}.${month}.${year}`;
    };

    const syncDateDisplay = () => {
      if (!dateDisplay) return;
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

      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");

      dateInput.value = `${yyyy}-${mm}-${dd}`;
      syncDateDisplay();
      checkFormValidity();
    };

    dateQuickButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const offset = parseInt(btn.dataset.offset || "0", 10);
        setDateByOffsetDays(offset);
      });
    });
  }

  // Кнопки переключения экранов
  const extraDeliveriesBtn = document.getElementById("extra-deliveries-btn");
  if (extraDeliveriesBtn) {
    extraDeliveriesBtn.addEventListener("click", showDeliveriesScreen);
  }

  const backToMainBtn = document.getElementById("back-to-main-btn");
  if (backToMainBtn) {
    backToMainBtn.addEventListener("click", showMainScreen);
  }

  const addDeliveryFromListBtn = document.getElementById(
    "add-delivery-from-list-btn",
  );
  if (addDeliveryFromListBtn) {
    addDeliveryFromListBtn.addEventListener("click", () => {
      openExtraDeliveryModal();
    });
  }

  checkFormValidity();
});
