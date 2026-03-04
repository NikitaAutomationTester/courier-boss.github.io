// ========== ГЛАВНЫЙ ФАЙЛ ИНИЦИАЛИЗАЦИИ ==========

// Глобальный флаг загрузки данных
let dataLoaded = false;

document.addEventListener("DOMContentLoaded", async function () {
  console.log("📱 DOM загружен");

  // Сначала загружаем все HTML страницы
  await loadPages();

  // Получаем кнопки меню
  const createReportBtn = document.getElementById("createReport");
  const myReportsBtn = document.getElementById("myReports");
  const myRouteBtn = document.getElementById("myRoute");
  const financeBtn = document.getElementById("financeBtn");

  console.log("🔍 Кнопки найдены:", {
    createReport: !!createReportBtn,
    myReports: !!myReportsBtn,
    myRoute: !!myRouteBtn,
    financeBtn: !!financeBtn,
  });

  // ========== НАЗНАЧАЕМ ОБРАБОТЧИКИ ==========

  if (myRouteBtn) {
    myRouteBtn.addEventListener("click", showRoutePage);
    console.log("✅ Обработчик для myRouteBtn назначен");
  }

  if (createReportBtn) {
    createReportBtn.addEventListener("click", showReportPage);
    console.log("✅ Обработчик для createReportBtn назначен");
  }

  if (myReportsBtn) {
    myReportsBtn.addEventListener("click", showReportsListPage);
    console.log("✅ Обработчик для myReportsBtn назначен");
  }

  if (financeBtn) {
    financeBtn.addEventListener("click", showFinancePage);
    console.log("✅ Обработчик для financeBtn назначен");
  }

  if (backButton) {
    backButton.addEventListener("click", showMainMenu);
  }

  if (backFromReport) {
    backFromReport.addEventListener("click", showMainMenu);
  }

  if (backFromFinance) {
    backFromFinance.addEventListener("click", showMainMenu);
  }

  if (backFromHistory) {
    backFromHistory.addEventListener("click", function () {
      if (historyPage) historyPage.style.display = "none";
      if (financePage) financePage.style.display = "block";
    });
  }

  if (backFromReportsList) {
    backFromReportsList.addEventListener("click", showMainMenu);
  }

  if (backFromReportDetail) {
    backFromReportDetail.addEventListener("click", function () {
      if (reportDetailPage) reportDetailPage.style.display = "none";
      if (reportsListPage) reportsListPage.style.display = "block";
    });
  }

  if (submitReportBtn) {
    submitReportBtn.addEventListener("click", submitReport);
  }

  if (viewHistoryBtn) {
    viewHistoryBtn.addEventListener("click", showHistoryPage);
  }

  // Показываем информацию о пользователе
  const user = getCurrentTelegramUser();
  if (user) {
    console.log(
      `👤 Пользователь: ${user.first_name} ${user.last_name || ""} (ID: ${user.id})`,
    );
  } else {
    console.log("👤 Пользователь не определён (используется тестовый режим)");
  }

  // Настраиваем главную кнопку Telegram
  if (tg) {
    tg.MainButton.setText("Закрыть");
    tg.MainButton.onClick(function () {
      tg.close();
    });
  }

  // Настраиваем валидацию даты
  if (reportDateInput) {
    reportDateInput.addEventListener("change", validateDateInput);
    reportDateInput.addEventListener("input", validateDateInput);
  }

  // Загружаем все данные пользователя
  setTimeout(async () => {
    console.log("🔄 Начинаем загрузку данных пользователя...");

    // Загружаем маршрут
    await loadRouteOrder();

    // Загружаем финансы и отчёты
    await loadAllUserData();

    dataLoaded = true;
    console.log("✅ Загрузка всех данных завершена");

    // Если открыта страница маршрута, обновим её
    if (routePage && routePage.style.display === "block") {
      loadRouteData();
    }

    // Если открыта страница финансов, обновим её
    if (financePage && financePage.style.display === "block") {
      loadFinanceData();
    }

    // Если открыта страница списка отчётов, обновим её
    if (reportsListPage && reportsListPage.style.display === "block") {
      loadReportsListData();
    }
  }, 500);

  console.log("✅ Инициализация завершена");
});
