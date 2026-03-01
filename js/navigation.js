// ========== УПРАВЛЕНИЕ СТРАНИЦАМИ ==========

// Глобальные ссылки на элементы страниц
let mainMenu, routePage, reportPage, financePage, historyPage, reportsListPage, reportDetailPage;
let pageContainer;
let backButton, backFromReport, backFromFinance, backFromHistory, backFromReportsList, backFromReportDetail;
let centersList, reportCentersList, totalSalarySpan, submitReportBtn, reportDateInput;
let currentDebtSpan, viewHistoryBtn, historyTransactionsList;
let reportsList, reportDetailTitle, reportDetailPoints, reportDetailTotal;

// Функция для загрузки HTML страниц
async function loadPages() {
  pageContainer = document.getElementById('pageContainer');
  
  // Загружаем все страницы параллельно
  const pages = [
    fetch('pages/route.html').then(r => r.text()),
    fetch('pages/create-report.html').then(r => r.text()),
    fetch('pages/finance.html').then(r => r.text()),
    fetch('pages/history.html').then(r => r.text()),
    fetch('pages/reports-list.html').then(r => r.text()),
    fetch('pages/report-detail.html').then(r => r.text())
  ];
  
  const [routeHtml, reportHtml, financeHtml, historyHtml, reportsListHtml, reportDetailHtml] = await Promise.all(pages);
  
  // Вставляем все страницы в контейнер
  pageContainer.innerHTML = routeHtml + reportHtml + financeHtml + historyHtml + reportsListHtml + reportDetailHtml;
  
  // После загрузки получаем ссылки на DOM элементы
  getDomElements();
}

// Функция для получения всех ссылок на DOM-элементы
function getDomElements() {
  mainMenu = document.querySelector("main");
  routePage = document.getElementById("routePage");
  reportPage = document.getElementById("reportPage");
  financePage = document.getElementById("financePage");
  historyPage = document.getElementById("historyPage");
  reportsListPage = document.getElementById("reportsListPage");
  reportDetailPage = document.getElementById("reportDetailPage");
  
  backButton = document.getElementById("backFromRoute");
  backFromReport = document.getElementById("backFromReport");
  backFromFinance = document.getElementById("backFromFinance");
  backFromHistory = document.getElementById("backFromHistory");
  backFromReportsList = document.getElementById("backFromReportsList");
  backFromReportDetail = document.getElementById("backFromReportDetail");
  
  centersList = document.getElementById("medicalCentersList");
  reportCentersList = document.getElementById("reportCentersList");
  totalSalarySpan = document.getElementById("totalSalary");
  submitReportBtn = document.getElementById("submitReport");
  reportDateInput = document.getElementById("reportDate");

  // Элементы для финансов
  currentDebtSpan = document.getElementById("currentDebt");
  viewHistoryBtn = document.getElementById("viewHistoryBtn");
  historyTransactionsList = document.getElementById("historyTransactionsList");

  // Элементы для списка отчётов
  reportsList = document.getElementById("reportsList");
  reportDetailTitle = document.getElementById("reportDetailTitle");
  reportDetailPoints = document.getElementById("reportDetailPoints");
  reportDetailTotal = document.getElementById("reportDetailTotal");
}

// Функции навигации (без изменений)
function showRoutePage() {
  console.log("Открываем страницу маршрута");

  if (mainMenu) mainMenu.style.display = "none";
  if (reportPage) reportPage.style.display = "none";
  if (financePage) financePage.style.display = "none";
  if (historyPage) historyPage.style.display = "none";
  if (reportsListPage) reportsListPage.style.display = "none";
  if (reportDetailPage) reportDetailPage.style.display = "none";
  const footer = document.getElementById("mainFooter");
  if (footer) footer.style.display = "none";
  if (routePage) routePage.style.display = "block";

  if (typeof loadRouteData === 'function') loadRouteData();
}

function showReportPage() {
  console.log("Открываем страницу создания отчёта");

  if (mainMenu) mainMenu.style.display = "none";
  if (routePage) routePage.style.display = "none";
  if (financePage) financePage.style.display = "none";
  if (historyPage) historyPage.style.display = "none";
  if (reportsListPage) reportsListPage.style.display = "none";
  if (reportDetailPage) reportDetailPage.style.display = "none";
  const footer = document.getElementById("mainFooter");
  if (footer) footer.style.display = "none";
  if (reportPage) reportPage.style.display = "block";

  if (reportDateInput) {
    reportDateInput.value = "";
    reportDateInput.classList.remove('valid', 'error');
    reportDateInput.classList.add('error');
  }

  if (typeof loadReportData === 'function') loadReportData();
}

function showFinancePage() {
  console.log("Открываем страницу финансов");

  if (mainMenu) mainMenu.style.display = "none";
  if (routePage) routePage.style.display = "none";
  if (reportPage) reportPage.style.display = "none";
  if (historyPage) historyPage.style.display = "none";
  if (reportsListPage) reportsListPage.style.display = "none";
  if (reportDetailPage) reportDetailPage.style.display = "none";
  const footer = document.getElementById("mainFooter");
  if (footer) footer.style.display = "none";
  if (financePage) financePage.style.display = "block";

  if (typeof loadFinanceData === 'function') loadFinanceData();
}

function showHistoryPage() {
  console.log("Открываем страницу истории операций");

  if (financePage) financePage.style.display = "none";
  if (reportsListPage) reportsListPage.style.display = "none";
  if (reportDetailPage) reportDetailPage.style.display = "none";
  if (historyPage) historyPage.style.display = "block";

  if (typeof loadHistoryData === 'function') loadHistoryData();
}

function showReportsListPage() {
  console.log("Открываем страницу списка отчётов");

  if (mainMenu) mainMenu.style.display = "none";
  if (routePage) routePage.style.display = "none";
  if (reportPage) reportPage.style.display = "none";
  if (financePage) financePage.style.display = "none";
  if (historyPage) historyPage.style.display = "none";
  if (reportDetailPage) reportDetailPage.style.display = "none";
  const footer = document.getElementById("mainFooter");
  if (footer) footer.style.display = "none";
  if (reportsListPage) reportsListPage.style.display = "block";

  if (typeof loadReportsListData === 'function') loadReportsListData();
}

function showMainMenu() {
  console.log("Возврат в главное меню");

  if (mainMenu) mainMenu.style.display = "block";
  if (routePage) routePage.style.display = "none";
  if (reportPage) reportPage.style.display = "none";
  if (financePage) financePage.style.display = "none";
  if (historyPage) historyPage.style.display = "none";
  if (reportsListPage) reportsListPage.style.display = "none";
  if (reportDetailPage) reportDetailPage.style.display = "none";
  const footer = document.getElementById("mainFooter");
  if (footer) footer.style.display = "block";
}