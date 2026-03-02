// ========== ДАННЫЕ КУРЬЕРОВ И МАРШРУТОВ ==========

// База данных курьеров (в реальности будет на сервере)
const couriersDB = {
  // Курьер с ID = 1
  1: {
    id: 1,
    name: "Иван Петров",
    phone: "+7 (999) 123-45-67",
    // Маршрут этого курьера - массив ID медцентров в нужном порядке
    routeOrder: [
      101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115,
      116, 117, 118, 119, 120, 121, 122,
    ],
  },
};

// База данных медицинских центров (РЕАЛЬНЫЕ ДАННЫЕ С ЗАРПЛАТАМИ)
const medicalCentersDB = {
  // 101: ВК Специалист
  101: {
    id: 101,
    name: "ВК Специалист",
    address: "г. Ростов-на-Дону, Гагринская, 2А",
    timeWindow: "11:20",
    schedule: "по вызову",
    lab: "Инвитро",
    salary: 200,
  },
  // 102: МедПрофи (Чалтырь, Восточная)
  102: {
    id: 102,
    name: "МедПрофи",
    address: "с. Чалтырь, ул. Восточная, 9Б",
    timeWindow: "11:40",
    schedule: "пн-сб",
    lab: "Ситилаб и Инвитро",
    salary: 140,
  },
  // 103: МедПрофи (Чалтырь, 6-я линия)
  103: {
    id: 103,
    name: "МедПрофи",
    address: "с. Чалтырь, ул. 6-я линия, 104-в",
    timeWindow: "11:50",
    schedule: "пн-сб",
    lab: "Ситилаб и Инвитро",
    salary: 140,
  },
  // 104: ЦВМ
  104: {
    id: 104,
    name: "ЦВМ",
    address: "г. Ростов-на-Дону, Таганрогская 106Б",
    timeWindow: "12:10",
    schedule: "по вызову",
    lab: "Инвитро",
    salary: 200,
  },
  // 105: Инвитро МО
  105: {
    id: 105,
    name: "Инвитро МО",
    address: "г. Ростов-на-Дону, ул. Таганрогская, 143",
    timeWindow: "12:20",
    schedule: "пн-сб",
    lab: "Инвитро",
    salary: 200,
  },
  // 106: Суворовский
  106: {
    id: 106,
    name: "Суворовский",
    address: "г. Ростов-на-Дону, ул. Вавилова, 124/6",
    timeWindow: "12:40",
    schedule: "пн-сб",
    lab: "Ситилаб и Инвитро",
    salary: 140,
  },
  // 107: МЦ Коломакиных
  107: {
    id: 107,
    name: "МЦ Коломакиных",
    address: "г. Ростов-на-Дону, ул. Петренко, д. 26 а",
    timeWindow: "12:50",
    schedule: "пн-сб",
    lab: "Ситилаб",
    salary: 140,
  },
  // 108: Авеню
  108: {
    id: 108,
    name: "Авеню",
    address: "г. Ростов-на-Дону, пер. 10-й Лазоревый. д.57/46",
    timeWindow: "13:00",
    schedule: "пн-сб",
    lab: "КДЛ",
    salary: 200,
  },
  // 109: Плюс
  109: {
    id: 109,
    name: "Плюс",
    address: "г. Ростов-на-Дону, ул. Королёва, 10А",
    timeWindow: "13:10",
    schedule: "по вызову",
    lab: "Ситилаб",
    salary: 140,
  },
  // 110: Ситилаб (Вятская)
  110: {
    id: 110,
    name: "Ситилаб",
    address: "г. Ростов-на-Дону, ул. Вятская, 45А",
    timeWindow: "13:20",
    schedule: "пн-сб",
    lab: "Ситилаб",
    salary: 140,
  },
  // 111: Гемотест (Вятская)
  111: {
    id: 111,
    name: "Гемотест",
    address: "г. Ростов-на-Дону, ул. Вятская, д. 43",
    timeWindow: "13:30",
    schedule: "пн-сб",
    lab: "Гемотест",
    salary: 200,
  },
  // 112: Чистый путь
  112: {
    id: 112,
    name: "Чистый путь",
    address: "г. Ростов-на-Дону, ул. Штахановского, д.10/5",
    timeWindow: "13:40",
    schedule: "по вызову",
    lab: "Ситилаб",
    salary: 140,
  },
  // 113: Доктор у дома
  113: {
    id: 113,
    name: "Доктор у дома",
    address: "г. Ростов-на-Дону, ул. Лелюшенко д.13/1 (офис 73)",
    timeWindow: "13:50",
    schedule: "пн-сб",
    lab: "Ситилаб",
    salary: 140,
  },
  // 114: Умная клиника
  114: {
    id: 114,
    name: "Умная клиника",
    address: "г. Ростов-на-Дону, ул. Орбитальная 25",
    timeWindow: "14:00",
    schedule: "по вызову",
    lab: "Ситилаб",
    salary: 140,
  },
  // 115: Гемотест (Космонавтов)
  115: {
    id: 115,
    name: "Гемотест",
    address: "г. Ростов-на-Дону, ул. Космонавтов, д. 35",
    timeWindow: "14:10",
    schedule: "пн-сб",
    lab: "Гемотест",
    salary: 200,
  },
  // 116: Виват
  116: {
    id: 116,
    name: "Виват",
    address: "г. Ростов-на-Дону, б. Комарова, 28В",
    timeWindow: "14:10-14:15",
    schedule: "по вызову",
    lab: "Ситилаб",
    salary: 140,
  },
  // 117: Гемотест (Волкова)
  117: {
    id: 117,
    name: "Гемотест",
    address: "г. Ростов-на-Дону, ул. Волкова, д. 8",
    timeWindow: "14:10-14:20",
    schedule: "пн-сб",
    lab: "Гемотест",
    salary: 200,
  },
  // 118: Ситилаб (Добровольского)
  118: {
    id: 118,
    name: "Ситилаб",
    address: "г. Ростов-на-Дону, ул. Добровольского, 2/1",
    timeWindow: "14:15-14:25",
    schedule: "по вызову",
    lab: "Ситилаб",
    salary: 140,
  },
  // 119: Гемотест (Королева)
  119: {
    id: 119,
    name: "Гемотест",
    address: "г. Ростов-на-Дону, ул. Королева, д. 1/5",
    timeWindow: "14:15-14:30",
    schedule: "пн-сб",
    lab: "Гемотест",
    salary: 200,
  },
  // 120: Инвитро (Таганрогская)
  120: {
    id: 120,
    name: "Инвитро",
    address: "г. Ростов-на-Дону, ул. Таганрогская, 143",
    timeWindow: "14:40",
    schedule: "",
    lab: "Инвитро",
    salary: 200,
  },
  // 121: КДЛ ЛАБ (Максима Горького)
  121: {
    id: 121,
    name: "КДЛ ЛАБ",
    address: "г. Ростов-на-Дону, ул. Максима Горького",
    timeWindow: "16:20-16:50",
    schedule: "",
    lab: "КДЛ",
    salary: 200,
  },
  // 122: ГЕМОТЕСТ ЛАБ (Портовая)
  122: {
    id: 122,
    name: "ГЕМОТЕСТ ЛАБ",
    address: "г. Ростов-на-Дону, ул. Портовая, 104",
    timeWindow: "17:00-17:20",
    schedule: "",
    lab: "Гемотест",
    salary: 200,
  },
};

// ========== ДАННЫЕ ПО ФИНАНСАМ ==========
const financeDB = {
  // Для курьера с ID = 1 (заглушка, будет заменяться при загрузке)
  1: {
    currentDebt: 0,
    transactions: [],
  },
};

// ========== ХРАНИЛИЩЕ ДЕТАЛЕЙ ОТЧЁТОВ ==========
const reportDetailsDB = {
  // Для курьера с ID = 1 (заглушка, будет заменяться при загрузке)
  1: [],
};

// ========== ТЕКУЩИЙ КУРЬЕР (ЗАГЛУШКА) ==========
const CURRENT_COURIER_ID = 1;

// ========== ФУНКЦИИ ДЛЯ РАБОТЫ С ДАННЫМИ ==========

// Функция для получения ID пользователя
function getUserId() {
  try {
    return tg?.initDataUnsafe?.user?.id || CURRENT_COURIER_ID;
  } catch (e) {
    console.warn("Ошибка получения ID пользователя:", e);
    return CURRENT_COURIER_ID;
  }
}

// Сохранить данные в CloudStorage
async function saveToCloud(key, data) {
  const cloud = tg?.CloudStorage;
  if (!cloud) {
    console.warn(`⚠️ CloudStorage недоступен, данные ${key} не сохранены`);
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    try {
      const jsonData = JSON.stringify(data);
      cloud.setItem(key, jsonData, (error) => {
        if (error) {
          console.error(`❌ Ошибка сохранения ${key}:`, error);
          reject(error);
        } else {
          console.log(`✅ Данные ${key} сохранены в CloudStorage`);
          resolve();
        }
      });
    } catch (e) {
      console.error("❌ Ошибка при сериализации данных:", e);
      reject(e);
    }
  });
}

// Загрузить данные из CloudStorage
async function loadFromCloud(key) {
  const cloud = tg?.CloudStorage;
  if (!cloud) {
    console.warn(`⚠️ CloudStorage недоступен`);
    return null;
  }

  return new Promise((resolve) => {
    cloud.getItem(key, (error, value) => {
      if (error) {
        console.log(`⚠️ Ошибка загрузки ${key}:`, error);
        resolve(null);
      } else if (!value) {
        console.log(`📭 Данные ${key} не найдены`);
        resolve(null);
      } else {
        try {
          const data = JSON.parse(value);
          console.log(`✅ Данные ${key} загружены:`, data);
          resolve(data);
        } catch (e) {
          console.error(`❌ Ошибка парсинга ${key}:`, e);
          resolve(null);
        }
      }
    });
  });
}

// Сохранить финансы текущего пользователя
async function saveFinanceData() {
  const userId = getUserId();
  const key = `finance_${userId}`;
  const finance = getCurrentFinance();
  console.log(
    `💾 Сохраняем финансы для пользователя ${userId} по ключу ${key}`,
  );
  await saveToCloud(key, finance);
}

// Сохранить отчёт
async function saveReport(reportDate, reportData) {
  const userId = getUserId();
  const key = `report_${userId}_${reportDate}`;
  console.log(
    `💾 Сохраняем отчёт для пользователя ${userId} по ключу: ${key}`,
    reportData,
  );
  await saveToCloud(key, reportData);
}

// Загрузить все отчёты пользователя
async function loadAllReports() {
  const userId = getUserId();
  console.log(`🔄 Загрузка отчётов для пользователя ID: ${userId}`);

  const reports = [];

  return new Promise((resolve) => {
    const cloud = tg?.CloudStorage;
    if (!cloud) {
      console.warn("⚠️ CloudStorage недоступен");
      resolve([]);
      return;
    }

    cloud.getKeys(async (error, keys) => {
      if (error) {
        console.error("❌ Ошибка получения ключей:", error);
        resolve([]);
        return;
      }

      if (!keys || keys.length === 0) {
        console.log("📭 Нет сохранённых ключей");
        resolve([]);
        return;
      }

      console.log("🔑 Найденные ключи:", keys);

      // Фильтруем ключи, относящиеся к отчётам этого пользователя
      const reportKeys = keys.filter((key) =>
        key.startsWith(`report_${userId}_`),
      );
      console.log("📋 Ключи отчётов:", reportKeys);

      // Загружаем каждый отчёт
      for (const key of reportKeys) {
        console.log(`📤 Загрузка отчёта по ключу: ${key}`);
        const data = await loadFromCloud(key);
        if (data) {
          console.log(`✅ Отчёт загружен:`, data);
          reports.push(data);
        }
      }

      // Сортируем по дате (от новых к старым)
      reports.sort((a, b) => new Date(b.date) - new Date(a.date));

      // Сохраняем в reportDetailsDB
      reportDetailsDB[userId] = reports;

      console.log(`📊 Загружено ${reports.length} отчётов`);
      resolve(reports);
    });
  });
}

// Загрузить все данные пользователя при старте
async function loadAllUserData() {
  console.log("🔄 ===== ЗАПУСК loadAllUserData =====");

  const userId = getUserId();
  console.log("👤 Загрузка данных для пользователя:", userId);

  // Загружаем финансы
  const financeKey = `finance_${userId}`;
  console.log(`💰 Пытаемся загрузить финансы по ключу: ${financeKey}`);

  const financeData = await loadFromCloud(financeKey);
  if (financeData) {
    console.log("✅ Финансы загружены:", financeData);
    financeDB[userId] = financeData;
  } else {
    console.log("⚠️ Финансы не найдены, создаём пустые");
    if (!financeDB[userId]) {
      financeDB[userId] = {
        currentDebt: 0,
        transactions: [],
      };
    }
  }

  // Загружаем отчёты
  console.log("📁 Загружаем отчёты...");
  await loadAllReports();

  console.log("✅ ===== loadAllUserData ЗАВЕРШЕНА =====");
  console.log("📊 Итоговый reportDetailsDB:", JSON.stringify(reportDetailsDB));
  console.log("💰 Итоговый financeDB:", JSON.stringify(financeDB));
}

// Получить текущего пользователя Telegram
function getCurrentTelegramUser() {
  return tg?.initDataUnsafe?.user;
}

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========

function getCurrentCourierRoute() {
  const courier = couriersDB[CURRENT_COURIER_ID];
  if (!courier) {
    console.error("❌ Курьер не найден");
    return [];
  }
  const route = courier.routeOrder
    .map((centerId) => medicalCentersDB[centerId])
    .filter((center) => center);
  return route;
}

function getCurrentFinance() {
  const userId = getUserId();
  if (!financeDB[userId]) {
    financeDB[userId] = {
      currentDebt: 0,
      transactions: [],
    };
  }
  return financeDB[userId];
}
