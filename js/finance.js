// ========== ФУНКЦИИ ДЛЯ ФИНАНСОВ ==========

function loadFinanceData() {
  const finance = getCurrentFinance();

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
