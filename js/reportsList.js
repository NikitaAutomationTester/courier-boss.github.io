// ========== ФУНКЦИИ ДЛЯ МОИХ ОТЧЁТОВ ==========

// Хранилище отправленных отчётов
let sentReports = [];
let filteredReports = [];

// Переменные для фильтрации
let currentFilter = "all";
let dateFrom = null;
let dateTo = null;

function initFilters() {
  const filterTabs = document.querySelectorAll(".filter-tab[data-filter]");
  const showPeriodBtn = document.getElementById("showPeriodBtn");
  const periodPanel = document.getElementById("periodPanel");
  const applyBtn = document.getElementById("applyPeriod");
  const dateFromInput = document.getElementById("dateFrom");
  const dateToInput = document.getElementById("dateTo");

  if (!filterTabs.length) return;

  // Функция снятия выделения со всех табов
  function deactivateAllTabs() {
    filterTabs.forEach((t) => t.classList.remove("active"));
    if (showPeriodBtn) showPeriodBtn.classList.remove("active");
  }

  // Обработчики для табов (За неделю, За месяц, Все)
  filterTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // Снимаем выделение со всех
      deactivateAllTabs();
      // Выделяем текущий таб
      tab.classList.add("active");

      currentFilter = tab.dataset.filter;
      dateFrom = null;
      dateTo = null;

      // Скрываем панель периода и очищаем поля
      if (periodPanel) periodPanel.style.display = "none";
      if (dateFromInput) dateFromInput.value = "";
      if (dateToInput) dateToInput.value = "";

      applyFilter();
    });
  });

  // Обработчик для кнопки "За период"
  if (showPeriodBtn) {
    showPeriodBtn.addEventListener("click", () => {
      const isVisible = periodPanel.style.display === "block";

      // Переключаем панель
      periodPanel.style.display = isVisible ? "none" : "block";

      if (!isVisible) {
        // Снимаем выделение со всех табов
        deactivateAllTabs();
        // Выделяем кнопку "За период"
        showPeriodBtn.classList.add("active");
        currentFilter = "period";
      } else {
        // Если панель скрыта, снимаем выделение с "За период"
        showPeriodBtn.classList.remove("active");
        // Возвращаем фильтр на "Все"
        currentFilter = "all";
        filterTabs.forEach((t) => {
          if (t.dataset.filter === "all") t.classList.add("active");
        });
        applyFilter();
      }
    });
  }

  // Применить период
  if (applyBtn) {
    applyBtn.addEventListener("click", () => {
      if (dateFromInput.value && dateToInput.value) {
        dateFrom = new Date(dateFromInput.value);
        dateTo = new Date(dateToInput.value);
        dateTo.setHours(23, 59, 59); // Включаем конечную дату полностью

        // Снимаем выделение со всех табов
        deactivateAllTabs();
        // Выделяем кнопку "За период"
        showPeriodBtn.classList.add("active");
        currentFilter = "period";

        applyFilter();
      } else {
        alert("Выберите начальную и конечную дату");
      }
    });
  }
}

function applyFilter() {
  if (!sentReports || sentReports.length === 0) {
    renderReportsList([]);
    return;
  }

  let filtered = [...sentReports];
  const today = new Date();

  switch (currentFilter) {
    case "week":
      const weekAgo = new Date();
      weekAgo.setDate(today.getDate() - 7);
      filtered = sentReports.filter(
        (report) => new Date(report.date) >= weekAgo,
      );
      break;

    case "month":
      const monthAgo = new Date();
      monthAgo.setMonth(today.getMonth() - 1);
      filtered = sentReports.filter(
        (report) => new Date(report.date) >= monthAgo,
      );
      break;

    case "period":
      if (dateFrom && dateTo) {
        filtered = sentReports.filter((report) => {
          const reportDate = new Date(report.date);
          return reportDate >= dateFrom && reportDate <= dateTo;
        });
      }
      break;

    case "all":
    default:
      // все отчёты
      break;
  }

  renderReportsList(filtered);
}

function loadReportsListData() {
  const userId = getUserId();
  console.log("🔄 Загрузка отчётов для пользователя:", userId);

  if (reportDetailsDB[userId]) {
    sentReports = reportDetailsDB[userId];
    console.log("✅ Загружено отчётов:", sentReports.length);
  } else {
    sentReports = [];
  }

  // Сбрасываем фильтры
  currentFilter = "all";
  dateFrom = null;
  dateTo = null;

  // Обновляем UI фильтров
  const filterTabs = document.querySelectorAll(".filter-tab[data-filter]");
  filterTabs.forEach((tab) => {
    if (tab.dataset.filter === "all") {
      tab.classList.add("active");
    } else {
      tab.classList.remove("active");
    }
  });

  const showPeriodBtn = document.getElementById("showPeriodBtn");
  if (showPeriodBtn) showPeriodBtn.classList.remove("active");

  const periodPanel = document.getElementById("periodPanel");
  if (periodPanel) periodPanel.style.display = "none";

  const dateFromInput = document.getElementById("dateFrom");
  const dateToInput = document.getElementById("dateTo");
  if (dateFromInput) dateFromInput.value = "";
  if (dateToInput) dateToInput.value = "";

  applyFilter();
}

function renderReportsList(reports) {
  if (!reportsList) return;

  if (!reports || reports.length === 0) {
    reportsList.innerHTML =
      '<div class="empty-list-message">Нет отчётов за выбранный период</div>';
    return;
  }

  reportsList.innerHTML = "";

  // Сортируем по дате (от новых к старым)
  const sortedReports = [...reports].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );

  sortedReports.forEach((report) => {
    const item = document.createElement("div");
    item.className = "report-item";

    const [year, month, day] = report.date.split("-");
    const formattedDate = `${day}.${month}.${year}`;

    item.innerHTML = `
      <div class="report-icon">📄</div>
      <div class="report-info">
        <div class="report-title">Отчёт</div>
        <div class="report-date">${formattedDate}</div>
      </div>
    `;

    item.addEventListener("click", () => showReportDetail(report));
    reportsList.appendChild(item);
  });
}

function showReportsListPage() {
  console.log("📱 Открываем страницу списка отчётов");

  // Скрываем все другие страницы
  if (mainMenu) mainMenu.style.display = "none";
  if (routePage) routePage.style.display = "none";
  if (reportPage) reportPage.style.display = "none";
  if (financePage) financePage.style.display = "none";
  if (historyPage) historyPage.style.display = "none";
  if (reportDetailPage) reportDetailPage.style.display = "none";

  const footer = document.getElementById("mainFooter");
  if (footer) footer.style.display = "none";

  if (reportsListPage) {
    reportsListPage.style.display = "block";

    // Инициализируем фильтры при первом открытии
    if (!window.filtersInitialized) {
      initFilters();
      window.filtersInitialized = true;
    }
  }

  if (typeof dataLoaded !== "undefined" && dataLoaded) {
    loadReportsListData();
  } else {
    if (reportsList) {
      reportsList.innerHTML =
        '<div class="empty-list-message">⏳ Загрузка отчётов...</div>';
    }
  }
}

function showReportDetail(report) {
  console.log("📄 Открываем детальный отчёт:", report);

  if (reportsListPage) reportsListPage.style.display = "none";
  if (reportDetailPage) reportDetailPage.style.display = "block";

  const [year, month, day] = report.date.split("-");
  const formattedDate = `${day}.${month}.${year}`;

  if (reportDetailTitle) {
    reportDetailTitle.textContent = `Отчёт за ${formattedDate}`;
  }

  renderReportDetailPoints(report.points, report.total);
}

function renderReportDetailPoints(points, totalAmount) {
  if (!reportDetailPoints) return;

  reportDetailPoints.innerHTML = "";

  if (!points || points.length === 0) {
    reportDetailPoints.innerHTML =
      '<div class="report-point-card">Нет данных о точках</div>';
    return;
  }

  points.forEach((point) => {
    const card = document.createElement("div");
    card.className = "report-point-card";

    card.innerHTML = `
      <div class="report-point-header">
        <span class="report-point-check">✓</span>
        <span class="report-point-name">${point.name}</span>
        <span class="report-point-salary">+${point.salary}₽</span>
      </div>
      <div class="report-point-details">
        <div>📍 ${point.address}</div>
        <div>🔬 ${point.lab}</div>
      </div>
    `;

    reportDetailPoints.appendChild(card);
  });

  if (reportDetailTotal) {
    reportDetailTotal.textContent = totalAmount + "₽";
  }
}
