// ========== ФУНКЦИИ ДЛЯ ФИНАНСОВ ==========

function loadFinanceData() {
  const finance = getCurrentFinance();
  console.log("💰 Загрузка финансовых данных:", finance);

  // Обновляем текущий долг
  if (currentDebtSpan) {
    currentDebtSpan.textContent = finance.currentDebt.toLocaleString() + " ₽";
  }
}

function loadHistoryData() {
  const finance = getCurrentFinance();
  renderFullTransactionsList(finance.transactions);
}

function renderFullTransactionsList(transactions) {
  if (!historyTransactionsList) return;

  if (transactions.length === 0) {
    historyTransactionsList.innerHTML =
      '<div class="transaction-item">Нет операций</div>';
    return;
  }

  historyTransactionsList.innerHTML = "";

  // Берем только последние 20 операций
  const last20Transactions = transactions.slice(0, 20);

  last20Transactions.forEach((trans) => {
    const item = document.createElement("div");
    item.className = "transaction-item";

    const [year, month, day] = trans.date.split("-");
    const formattedDate = `${day}.${month}.${year}`;

    const amountClass = trans.amount > 0 ? "positive" : "negative";
    const amountSign = trans.amount > 0 ? "+" : "";
    const amountText = amountSign + trans.amount.toLocaleString() + " ₽";

    // Формируем описание в зависимости от типа операции
    let descriptionText = "";
    if (trans.type === "report") {
      descriptionText = "Отчёт";
    } else if (trans.type === "payment") {
      descriptionText = "Выплата";
    } else {
      descriptionText = trans.description;
    }

    item.innerHTML = `
      <div class="transaction-info">
        <div class="transaction-desc">${descriptionText}</div>
        <div class="transaction-date">${formattedDate}</div>
      </div>
      <div class="transaction-amount ${amountClass}">${amountText}</div>
    `;

    historyTransactionsList.appendChild(item);
  });

  // Если операций больше 20, показываем сообщение
  if (transactions.length > 20) {
    const infoItem = document.createElement("div");
    infoItem.className = "transaction-item";
    infoItem.style.justifyContent = "center";
    infoItem.style.backgroundColor = "transparent";
    infoItem.style.border = "none";
    infoItem.style.color = "var(--tg-theme-hint-color, #999)";
    infoItem.style.fontSize = "12px";
    infoItem.innerHTML = "Показаны последние 20 операций";
    historyTransactionsList.appendChild(infoItem);
  }
}

function showFinancePage() {
  console.log("💰 Открываем страницу финансов");

  if (mainMenu) mainMenu.style.display = "none";
  if (routePage) routePage.style.display = "none";
  if (reportPage) reportPage.style.display = "none";
  if (historyPage) historyPage.style.display = "none";
  if (reportsListPage) reportsListPage.style.display = "none";
  if (reportDetailPage) reportDetailPage.style.display = "none";

  const footer = document.getElementById("mainFooter");
  if (footer) footer.style.display = "none";

  if (financePage) {
    financePage.style.display = "block";
    console.log("✅ Страница финансов открыта");
  }

  // Проверяем, загружены ли данные
  if (typeof dataLoaded !== "undefined" && dataLoaded) {
    // Данные уже загружены — показываем сразу
    console.log("💰 Данные уже загружены, показываем финансы");
    loadFinanceData();
  } else {
    // Данные ещё грузятся — показываем заглушку
    if (currentDebtSpan) {
      currentDebtSpan.textContent = "⏳ загрузка...";
    }
    console.log("⏳ Данные ещё загружаются, показываем заглушку");
  }
}
