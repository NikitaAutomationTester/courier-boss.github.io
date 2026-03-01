// ========== ФУНКЦИИ ДЛЯ МОИХ ОТЧЁТОВ ==========

// Хранилище отправленных отчётов
let sentReports = [];

function loadReportsListData() {
  // Загружаем детали отчётов из хранилища
  if (reportDetailsDB[CURRENT_COURIER_ID]) {
    sentReports = reportDetailsDB[CURRENT_COURIER_ID];
  } else {
    sentReports = [];
  }
  console.log("Загружено отчётов:", sentReports.length);
  renderReportsList();
}

function renderReportsList() {
  if (!reportsList) return;

  if (sentReports.length === 0) {
    reportsList.innerHTML =
      '<div class="report-item" style="justify-content: center;">Нет отправленных отчётов</div>';
    return;
  }

  reportsList.innerHTML = "";

  // Сортируем отчёты по дате (от новых к старым)
  const sortedReports = [...sentReports].sort(
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
        <div class="report-title">Отчёт за ${formattedDate}</div>
        <div class="report-date">${formattedDate}</div>
      </div>
    `;

    // Добавляем обработчик клика
    item.addEventListener("click", function () {
      showReportDetail(report);
    });

    reportsList.appendChild(item);
  });
}

function showReportDetail(report) {
  console.log("Открываем детальный отчёт:", report);

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
  if (!reportDetailPoints) return;

  reportDetailPoints.innerHTML = "";

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
