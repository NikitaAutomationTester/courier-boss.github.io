// ========== ФУНКЦИИ ДЛЯ МОИХ ОТЧЁТОВ ==========

// Хранилище отправленных отчётов (будет обновляться при загрузке)
let sentReports = [];

function loadReportsListData() {
  const userId = getUserId(); // Получаем реальный ID пользователя
  console.log(
    "🔄 loadReportsListData: Загрузка отчётов для пользователя:",
    userId,
  );

  // Берём отчёты из памяти для этого пользователя
  if (reportDetailsDB[userId]) {
    sentReports = reportDetailsDB[userId];
    console.log("✅ Загружено отчётов из памяти:", sentReports.length);
  } else {
    sentReports = [];
    console.log("⚠️ Отчёты не найдены в памяти для пользователя", userId);
  }

  renderReportsList();
}

function renderReportsList() {
  if (!reportsList) {
    console.log("❌ reportsList не найден в DOM");
    return;
  }

  if (sentReports.length === 0) {
    reportsList.innerHTML =
      '<div class="report-item" style="justify-content: center;">Нет отправленных отчётов</div>';
    console.log("📭 Список отчётов пуст");
    return;
  }

  reportsList.innerHTML = "";

  // Сортируем отчёты по дате (от новых к старым)
  const sortedReports = [...sentReports].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );

  console.log(`📊 Рендерим ${sortedReports.length} отчётов`);

  sortedReports.forEach((report) => {
    const item = document.createElement("div");
    item.className = "report-item";

    const [year, month, day] = report.date.split("-");
    const formattedDate = `${day}.${month}.${year}`;

    item.innerHTML = `
      <div class="report-icon">📄</div>
      <div class="report-info">
        <div class="report-title">Отчёт за ${formattedDate}</div>
        <div class="report-date">${formattedDate}</div>
      </div>
    `;

    // Добавляем обработчик клика для открытия детального отчёта
    item.addEventListener("click", function () {
      showReportDetail(report);
    });

    reportsList.appendChild(item);
  });

  console.log("✅ Список отчётов отрендерен");
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

  // Скрываем футер
  const footer = document.getElementById("mainFooter");
  if (footer) footer.style.display = "none";

  // ПОКАЗЫВАЕМ страницу списка отчётов
  if (reportsListPage) {
    reportsListPage.style.display = "block";
    console.log("✅ Страница reportsListPage открыта");
  } else {
    console.log("❌ reportsListPage не найден в DOM");
  }

  // Проверяем, загружены ли данные
  if (typeof dataLoaded !== "undefined" && dataLoaded) {
    // Данные уже загружены — показываем сразу
    console.log("📊 Данные уже загружены, показываем отчёты");
    loadReportsListData();
  } else {
    // Данные ещё грузятся — показываем заглушку
    if (reportsList) {
      reportsList.innerHTML =
        '<div class="report-item" style="justify-content: center;">⏳ Загрузка отчётов...</div>';
    }
    console.log("⏳ Данные ещё загружаются, показываем заглушку");
  }
}

function showReportDetail(report) {
  console.log("📄 Открываем детальный отчёт:", report);

  if (reportsListPage) reportsListPage.style.display = "none";
  if (reportDetailPage) reportDetailPage.style.display = "block";

  // Форматируем дату для заголовка
  const [year, month, day] = report.date.split("-");
  const formattedDate = `${day}.${month}.${year}`;

  if (reportDetailTitle) {
    reportDetailTitle.textContent = `Отчёт за ${formattedDate}`;
  }

  // Отображаем реальные точки из отчёта
  renderReportDetailPoints(report.points, report.total);
}

function renderReportDetailPoints(points, totalAmount) {
  if (!reportDetailPoints) {
    console.log("❌ reportDetailPoints не найден");
    return;
  }

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
