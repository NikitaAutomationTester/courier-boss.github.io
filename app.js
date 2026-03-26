// Функция, которая будет вызвана, когда приложение полностью загрузится
document.addEventListener("DOMContentLoaded", () => {
  // 1. Инициализация интерфейса MAX
  if (window.WebApp) {
    window.WebApp.ready();
    window.WebApp.expand();
  }

  // 2. Получаем данные о пользователе (курьере)
  let currentUserId = null;
  let currentUserClinics = [];

  if (
    window.WebApp &&
    window.WebApp.initDataUnsafe &&
    window.WebApp.initDataUnsafe.user
  ) {
    currentUserId = window.WebApp.initDataUnsafe.user.id;
    console.log("ID пользователя:", currentUserId);
  } else {
    currentUserId = "test_courier_123";
    console.log("Тестовый режим. ID пользователя:", currentUserId);
  }

  // 3. Функция для загрузки списка клиник, привязанных к курьеру
  function loadClinicsForUser(userId) {
    console.log(`Загружаем клиники для курьера: ${userId}`);

    // --- ЗАГЛУШКА С ТЕСТОВЫМИ ДАННЫМИ ---
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

  // 4. Функция для проверки, можно ли активировать кнопку
  function checkFormValidity() {
    const dateInput = document.getElementById("report-date");
    const saveButton = document.getElementById("save-report-btn");
    const selectedDate = dateInput ? dateInput.value : "";

    // Проверяем, выбрана ли дата
    const isDateSelected = selectedDate !== "";

    // Проверяем, выбрана ли хотя бы одна клиника
    const clinicItems = document.querySelectorAll(".clinic-item");
    let isAnyClinicSelected = false;
    clinicItems.forEach((item) => {
      const checkbox = item.querySelector(".clinic-checkbox");
      if (checkbox && checkbox.checked) {
        isAnyClinicSelected = true;
      }
    });

    // Кнопка активна только если выбрана дата И хотя бы одна клиника
    const isValid = isDateSelected && isAnyClinicSelected;

    if (saveButton) {
      saveButton.disabled = !isValid;
    }

    return isValid;
  }

  // 5. Функция для пересчёта общей зарплаты
  function updateTotalSalary() {
    const clinicItems = document.querySelectorAll(".clinic-item");
    let total = 0;

    clinicItems.forEach((item) => {
      const checkbox = item.querySelector(".clinic-checkbox");
      if (checkbox && checkbox.checked) {
        const salarySpan = item.querySelector(".clinic-salary-value");
        if (salarySpan) {
          const salary = parseInt(salarySpan.dataset.salary) || 0;
          total += salary;
        }
      }
    });

    const totalSalaryElement = document.getElementById("total-salary");
    if (totalSalaryElement) {
      totalSalaryElement.textContent = total.toLocaleString("ru-RU") + " ₽";
    }

    // После пересчёта зарплаты проверяем валидность формы
    checkFormValidity();

    return total;
  }

  // 6. Отображаем список клиник на странице
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
      checkbox.id = `clinic_${clinic.id}`;

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
        if (checkbox.checked) {
          clinicDiv.classList.add("selected");
        } else {
          clinicDiv.classList.remove("selected");
        }
        updateTotalSalary();
      };

      clinicDiv.addEventListener("click", (e) => {
        if (e.target !== checkbox) {
          checkbox.checked = !checkbox.checked;
        }
        updateSelection();
      });

      checkbox.addEventListener("change", () => {
        updateSelection();
      });

      clinicsContainer.appendChild(clinicDiv);
    });

    updateTotalSalary();
  }

  // 7. Функция для отправки отчета
  async function saveReport() {
    const dateInput = document.getElementById("report-date");
    const selectedDate = dateInput.value;

    if (!selectedDate) {
      alert("Пожалуйста, выберите дату");
      return;
    }

    const selectedClinics = [];
    const clinicItems = document.querySelectorAll(".clinic-item");
    let totalSalary = 0;

    clinicItems.forEach((item) => {
      const checkbox = item.querySelector(".clinic-checkbox");
      if (checkbox && checkbox.checked) {
        const nameSpan = item.querySelector(".clinic-name");
        const addressSpan = item.querySelector(".clinic-address");
        const salaryValueSpan = item.querySelector(".clinic-salary-value");
        const clinicId = item.dataset.id;
        const salary = salaryValueSpan
          ? parseInt(salaryValueSpan.dataset.salary)
          : 0;

        selectedClinics.push({
          id: clinicId,
          name: nameSpan ? nameSpan.textContent : "",
          address: addressSpan ? addressSpan.textContent : "",
          salary: salary,
        });

        totalSalary += salary;
      }
    });

    if (selectedClinics.length === 0) {
      alert("Пожалуйста, выберите хотя бы одну клинику");
      return;
    }

    const report = {
      userId: currentUserId,
      date: selectedDate,
      clinics: selectedClinics,
      totalSalary: totalSalary,
      timestamp: new Date().toISOString(),
    };

    console.log("Отправлен отчет:", report);

    let message = `Отчёт за ${selectedDate}\n`;
    message += `Итого: ${totalSalary.toLocaleString("ru-RU")} ₽\n\n`;
    message += `Посещено клиник: ${selectedClinics.length}\n\n`;
    message += `Список:\n`;
    selectedClinics.forEach((clinic) => {
      message += `• ${clinic.name}\n  ${clinic.address}\n  ${clinic.salary.toLocaleString("ru-RU")} ₽\n\n`;
    });
    alert(message);
  }

  // 8. Загружаем данные для текущего пользователя и отображаем их
  const userClinics = loadClinicsForUser(currentUserId);
  displayClinics(userClinics);

  // 9. Назначаем обработчики
  const saveButton = document.getElementById("save-report-btn");
  if (saveButton) {
    saveButton.addEventListener("click", saveReport);
  }

  // 10. Обработчик изменения даты
  const dateInput = document.getElementById("report-date");
  if (dateInput) {
    // НЕ устанавливаем дату по умолчанию — оставляем пустым
    dateInput.value = "";

    // При изменении даты проверяем валидность формы
    dateInput.addEventListener("change", () => {
      checkFormValidity();
    });
  }

  // 11. Инициализируем состояние кнопки (изначально неактивна)
  checkFormValidity();
});
