document.addEventListener("DOMContentLoaded", () => {
  if (window.WebApp) {
    window.WebApp.ready();
    window.WebApp.expand();
  }

  let currentUserId = null;

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

    const isValid = isDateSelected && isAnyClinicSelected;
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

    if (selectedClinics.length === 0)
      return alert("Выберите хотя бы одну клинику");

    const report = {
      userId: currentUserId,
      date: selectedDate,
      formattedDate: formattedDate,
      clinics: selectedClinics,
      totalSalary,
      timestamp: new Date().toISOString(),
    };

    let message = `Отчёт за ${formattedDate}\nИтого: ${totalSalary.toLocaleString("ru-RU")} ₽\n\nПосещено клиник: ${selectedClinics.length}\n\nСписок:\n`;
    selectedClinics.forEach((clinic) => {
      message += `• ${clinic.name}\n  ${clinic.address}\n  ${clinic.salary.toLocaleString("ru-RU")} ₽\n\n`;
    });
    alert(message);
  }

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

    // iOS иногда обновляет значение без "change" в момент тапа
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

      // Формат для native <input type="date">
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

  checkFormValidity();
});
