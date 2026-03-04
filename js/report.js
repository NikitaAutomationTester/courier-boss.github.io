// ========== ФУНКЦИИ ДЛЯ ОТЧЁТА ==========

let selectedPoints = new Set();

// Валидация поля даты
function validateDateInput() {
  if (reportDateInput) {
    reportDateInput.classList.remove("error", "valid");

    if (!reportDateInput.value) {
      reportDateInput.classList.add("error");
      console.log("Дата не выбрана - добавляем класс error");
    } else {
      reportDateInput.classList.add("valid");
      console.log("Дата выбрана - добавляем класс valid");
    }
  }
}

function loadReportData() {
  // Используем ту же функцию, что и в маршруте - получаем точки с данными
  const points = getCurrentRoutePoints();
  console.log("📋 Отчёт загружен, точек в маршруте:", points.length);

  selectedPoints.clear();
  renderReportCentersList(points);
  updateTotalSalary();
  updateSubmitButtonState();
}

function renderReportCentersList(centers) {
  if (!reportCentersList) return;
  reportCentersList.innerHTML = "";

  centers.forEach((center, index) => {
    const card = createReportCard(center, index + 1);
    reportCentersList.appendChild(card);
  });
}

function createReportCard(center, orderNumber) {
  const card = document.createElement("div");
  card.className = "report-card";
  card.setAttribute("data-center-id", center.id);

  const isSelected = selectedPoints.has(center.id);
  if (isSelected) {
    card.classList.add("selected");
  }

  card.innerHTML = `
        <div class="report-header-card">
            <div class="checkbox-wrapper">
                <input type="checkbox" class="point-checkbox" data-id="${center.id}" ${isSelected ? "checked" : ""}>
            </div>
            <span class="order-number">${orderNumber}</span>
            <div class="name-time-wrapper">
                <span class="center-name" title="${center.name}">${center.name}</span>
                <span class="center-time">${center.timeWindow}</span>
            </div>
            <span class="salary-badge">+${center.salary}₽</span>
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

  const checkbox = card.querySelector(".point-checkbox");

  card.addEventListener("click", function () {
    checkbox.checked = !checkbox.checked;
    const event = new Event("change", { bubbles: true });
    checkbox.dispatchEvent(event);

    this.style.transition = "background-color 0.1s";
    this.style.backgroundColor = "rgba(76, 175, 80, 0.3)";
    setTimeout(() => {
      this.style.backgroundColor = "";
      if (checkbox.checked) {
        this.classList.add("selected");
      } else {
        this.classList.remove("selected");
      }
    }, 100);
  });

  checkbox.addEventListener("change", function (e) {
    const centerId = parseInt(this.dataset.id);
    const isChecked = this.checked;

    if (isChecked) {
      selectedPoints.add(centerId);
      card.classList.add("selected");
    } else {
      selectedPoints.delete(centerId);
      card.classList.remove("selected");
    }

    updateTotalSalary();
    updateSubmitButtonState();

    console.log("Выбрано точек:", selectedPoints.size);
  });

  return card;
}

function updateTotalSalary() {
  let total = 0;

  selectedPoints.forEach((centerId) => {
    const center = medicalCentersDB[centerId];
    if (center) {
      total += center.salary;
    }
  });

  if (totalSalarySpan) {
    totalSalarySpan.textContent = total + "₽";
  }

  return total;
}

function updateSubmitButtonState() {
  if (submitReportBtn) {
    submitReportBtn.disabled = selectedPoints.size === 0;
  }
}

async function submitReport() {
  if (!reportDateInput || !reportDateInput.value) {
    reportDateInput.classList.remove("valid");
    reportDateInput.classList.add("error");

    tg.showPopup({
      title: "Ошибка",
      message: "Пожалуйста, выберите дату отчёта",
      buttons: [{ type: "ok" }],
    });
    return;
  }

  reportDateInput.classList.remove("error");
  reportDateInput.classList.add("valid");

  if (selectedPoints.size === 0) {
    tg.showPopup({
      title: "Ошибка",
      message: "Выберите хотя бы одну точку",
      buttons: [{ type: "ok" }],
    });
    return;
  }

  const dateValue = reportDateInput.value;
  const [year, month, day] = dateValue.split("-");
  const formattedDate = `${day}.${month}.${year}`;

  // Собираем данные о выбранных точках
  const selectedPointsData = [];
  let reportTotal = 0;

  selectedPoints.forEach((centerId) => {
    const center = medicalCentersDB[centerId];
    if (center) {
      selectedPointsData.push({
        id: center.id,
        name: center.name,
        address: center.address,
        timeWindow: center.timeWindow,
        schedule: center.schedule,
        lab: center.lab,
        salary: center.salary,
      });
      reportTotal += center.salary;
    }
  });

  // Обновляем финансы
  const finance = getCurrentFinance();
  finance.currentDebt += reportTotal;
  finance.transactions.unshift({
    type: "report",
    amount: reportTotal,
    date: dateValue,
    description: `Отчёт`,
  });

  // Сохраняем финансы в CloudStorage
  await saveFinanceData();

  // Создаём объект отчёта
  const reportData = {
    date: dateValue,
    formattedDate: formattedDate,
    points: selectedPointsData,
    total: reportTotal,
  };

  // Сохраняем отчёт в CloudStorage
  await saveReport(dateValue, reportData);

  // Добавляем в локальное хранилище
  const userId = tg.initDataUnsafe?.user?.id || CURRENT_COURIER_ID;
  if (!reportDetailsDB[userId]) {
    reportDetailsDB[userId] = [];
  }
  reportDetailsDB[userId].unshift(reportData);

  const fullReportData = {
    courierId: userId,
    date: dateValue,
    formattedDate: formattedDate,
    points: selectedPointsData,
    total: reportTotal,
  };

  console.log("Отправка отчёта:", fullReportData);

  tg.showPopup({
    title: "Отчёт отправлен",
    message: `Отчёт за ${formattedDate}\nТочек: ${selectedPoints.size}\nСумма: ${reportTotal}₽`,
    buttons: [{ type: "ok" }],
  });

  selectedPoints.clear();
  loadReportData();
}
