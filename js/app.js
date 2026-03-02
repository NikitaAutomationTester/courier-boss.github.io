// ========== ГЛАВНЫЙ ФАЙЛ ИНИЦИАЛИЗАЦИИ ==========

document.addEventListener("DOMContentLoaded", async function () {
  console.log("📱 DOM загружен");

  // Сначала загружаем все HTML страницы
  await loadPages();

  // Загружаем сохранённые данные пользователя
  console.log("🔄 Начинаем загрузку данных пользователя...");
  await loadAllUserData();

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

  // Показываем информацию о пользователе (для отладки)
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

  // ========== НАЗНАЧАЕМ ОБРАБОТЧИКИ ==========

  if (myRouteBtn) {
    myRouteBtn.addEventListener("click", showRoutePage);
  }

  if (createReportBtn) {
    createReportBtn.addEventListener("click", showReportPage);
  }

  if (myReportsBtn) {
    myReportsBtn.addEventListener("click", showReportsListPage);
  }

  if (financeBtn) {
    financeBtn.addEventListener("click", showFinancePage);
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

  console.log("✅ Инициализация завершена");
});
