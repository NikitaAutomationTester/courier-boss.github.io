// ========== ДАННЫЕ КУРЬЕРОВ И МАРШРУТОВ ==========

// База данных медицинских центров (ВСЕ текущие точки)
const medicalCentersDB = {
  // 101: ВК Специалист
  101: {
    id: 101,
    name: "ВК Специалист",
    address: "Ростов-на-Дону, Гагринская, 2А",
    timeWindow: "11:20",
    schedule: "по вызову",
    lab: "Инвитро",
    salary: 200,
  },
  // 102: МедПрофи (Чалтырь, Восточная)
  102: {
    id: 102,
    name: "МедПрофи",
    address: "Чалтырь, ул. Восточная, 9Б",
    timeWindow: "11:40",
    schedule: "пн-сб",
    lab: "Ситилаб и Инвитро",
    salary: 140,
  },
  // 103: МедПрофи (Чалтырь, 6-я линия)
  103: {
    id: 103,
    name: "МедПрофи",
    address: "Чалтырь, ул. 6-я линия, 104-в",
    timeWindow: "11:50",
    schedule: "пн-сб",
    lab: "Ситилаб и Инвитро",
    salary: 140,
  },
  // 104: ЦВМ
  104: {
    id: 104,
    name: "ЦВМ",
    address: "Ростов-на-Дону, Таганрогская 106Б",
    timeWindow: "12:10",
    schedule: "по вызову",
    lab: "Инвитро",
    salary: 200,
  },
  // 105: Инвитро МО
  105: {
    id: 105,
    name: "Инвитро МО",
    address: "Ростов-на-Дону, ул. Таганрогская, 143",
    timeWindow: "12:20",
    schedule: "пн-сб",
    lab: "Инвитро",
    salary: 200,
  },
  // 106: Суворовский
  106: {
    id: 106,
    name: "Суворовский",
    address: "Ростов-на-Дону, ул. Вавилова, 124/6",
    timeWindow: "12:40",
    schedule: "пн-сб",
    lab: "Ситилаб и Инвитро",
    salary: 140,
  },
  // 107: МЦ Коломакиных
  107: {
    id: 107,
    name: "МЦ Коломакиных",
    address: "Ростов-на-Дону, ул. Петренко, д. 26 а",
    timeWindow: "12:50",
    schedule: "пн-сб",
    lab: "Ситилаб",
    salary: 140,
  },
  // 108: Авеню
  108: {
    id: 108,
    name: "Авеню",
    address: "Ростов-на-Дону, пер. 10-й Лазоревый. д.57/46",
    timeWindow: "13:00",
    schedule: "пн-сб",
    lab: "КДЛ",
    salary: 200,
  },
  // 109: Плюс
  109: {
    id: 109,
    name: "Плюс",
    address: "Ростов-на-Дону, ул. Королёва, 10А",
    timeWindow: "13:10",
    schedule: "по вызову",
    lab: "Ситилаб",
    salary: 140,
  },
  // 110: Ситилаб (Вятская)
  110: {
    id: 110,
    name: "Ситилаб",
    address: "Ростов-на-Дону, ул. Вятская, 45А",
    timeWindow: "13:20",
    schedule: "пн-сб",
    lab: "Ситилаб",
    salary: 140,
  },
  // 111: Гемотест (Вятская)
  111: {
    id: 111,
    name: "Гемотест",
    address: "Ростов-на-Дону, ул. Вятская, д. 43",
    timeWindow: "13:30",
    schedule: "пн-сб",
    lab: "Гемотест",
    salary: 200,
  },
  // 112: Чистый путь
  112: {
    id: 112,
    name: "Чистый путь",
    address: "Ростов-на-Дону, ул. Штахановского, д.10/5",
    timeWindow: "13:40",
    schedule: "по вызову",
    lab: "Ситилаб",
    salary: 140,
  },
  // 113: Доктор у дома
  113: {
    id: 113,
    name: "Доктор у дома",
    address: "Ростов-на-Дону, ул. Лелюшенко д.13/1 (офис 73)",
    timeWindow: "13:50",
    schedule: "пн-сб",
    lab: "Ситилаб",
    salary: 140,
  },
  // 114: Умная клиника
  114: {
    id: 114,
    name: "Умная клиника",
    address: "Ростов-на-Дону, ул. Орбитальная 25",
    timeWindow: "14:00",
    schedule: "по вызову",
    lab: "Ситилаб",
    salary: 140,
  },
  // 115: Гемотест (Космонавтов)
  115: {
    id: 115,
    name: "Гемотест",
    address: "Ростов-на-Дону, ул. Космонавтов, д. 35",
    timeWindow: "14:10",
    schedule: "пн-сб",
    lab: "Гемотест",
    salary: 200,
  },
  // 116: Виват
  116: {
    id: 116,
    name: "Виват",
    address: "Ростов-на-Дону, б. Комарова, 28В",
    timeWindow: "14:10-14:15",
    schedule: "по вызову",
    lab: "Ситилаб",
    salary: 140,
  },
  // 117: Гемотест (Волкова)
  117: {
    id: 117,
    name: "Гемотест",
    address: "Ростов-на-Дону, ул. Волкова, д. 8",
    timeWindow: "14:10-14:20",
    schedule: "пн-сб",
    lab: "Гемотест",
    salary: 200,
  },
  // 118: Ситилаб (Добровольского)
  118: {
    id: 118,
    name: "Ситилаб",
    address: "Ростов-на-Дону, ул. Добровольского, 2/1",
    timeWindow: "14:15-14:25",
    schedule: "по вызову",
    lab: "Ситилаб",
    salary: 140,
  },
  // 119: Гемотест (Королева)
  119: {
    id: 119,
    name: "Гемотест",
    address: "Ростов-на-Дону, ул. Королева, д. 1/5",
    timeWindow: "14:15-14:30",
    schedule: "пн-сб",
    lab: "Гемотест",
    salary: 200,
  },
  // 120: Инвитро (Таганрогская)
  120: {
    id: 120,
    name: "Инвитро",
    address: "Ростов-на-Дону, ул. Таганрогская, 143",
    timeWindow: "14:40",
    schedule: "",
    lab: "Инвитро",
    salary: 200,
  },
  // 121: КДЛ ЛАБ (Максима Горького)
  121: {
    id: 121,
    name: "КДЛ ЛАБ",
    address: "Ростов-на-Дону, ул. Максима Горького",
    timeWindow: "16:20-16:50",
    schedule: "",
    lab: "КДЛ",
    salary: 200,
  },
  // 122: ГЕМОТЕСТ ЛАБ (Портовая)
  122: {
    id: 122,
    name: "ГЕМОТЕСТ ЛАБ",
    address: "Ростов-на-Дону, ул. Портовая, 104",
    timeWindow: "17:00-17:20",
    schedule: "",
    lab: "Гемотест",
    salary: 200,
  },
};

// База данных курьеров (привязка точек к конкретному курьеру)
const couriersDB = {
  // Ваш ID - все текущие точки
  964768734: {
    id: 964768734,
    name: "Иван Петров",
    phone: "+7 (999) 123-45-67",
    routeOrder: [
      101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115,
      116, 117, 118, 119, 120, 121, 122,
    ], // ВСЕ текущие точки
  },
};

// ========== ДАННЫЕ ПО ФИНАНСАМ ==========
const financeDB = {};

// ========== ХРАНИЛИЩЕ ДЕТАЛЕЙ ОТЧЁТОВ ==========
const reportDetailsDB = {};

// ========== ФУНКЦИИ ДЛЯ РАБОТЫ С ДАННЫМИ ==========

// Функция для получения ID пользователя
function getUserId() {
  try {
    if (tg?.initDataUnsafe?.user?.id) {
      return tg.initDataUnsafe.user.id;
    }
  } catch (e) {
    console.log("Ошибка получения Telegram ID:", e);
  }
  return 964768734; // ваш ID для тестирования
}

// Получить маршрут текущего курьера
function getCurrentCourierRoute() {
  const userId = getUserId();
  const courier = couriersDB[userId];

  if (!courier) {
    console.log(`❌ Курьер с ID ${userId} не найден, создаем пустой маршрут`);
    // Для нового курьера создаем пустой массив
    couriersDB[userId] = {
      id: userId,
      name: "Новый курьер",
      phone: "",
      routeOrder: [],
    };
    return [];
  }

  console.log(
    `✅ Загружен маршрут для курьера ${userId}, точек:`,
    courier.routeOrder.length,
  );
  return courier.routeOrder;
}

// Получить точки маршрута для отображения
function getCurrentRoutePoints() {
  const routeOrder = getCurrentCourierRoute();

  const points = routeOrder
    .map((centerId) => medicalCentersDB[centerId])
    .filter((center) => center !== undefined);

  console.log(`📍 Загружено ${points.length} точек маршрута`);
  return points;
}

// Сохранить новый порядок маршрута
async function saveRouteOrder(newOrder) {
  const userId = getUserId();
  const key = `route_${userId}`;

  if (!couriersDB[userId]) {
    couriersDB[userId] = {
      id: userId,
      routeOrder: newOrder,
    };
  } else {
    couriersDB[userId].routeOrder = newOrder;
  }

  console.log(`💾 Сохраняем маршрут для пользователя ${userId}:`, newOrder);
  await saveToCloud(key, newOrder);
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

// Делаем функцию глобальной
window.saveFinanceData = saveFinanceData;

// ===== ДОБАВЬТЕ ЭТУ ФУНКЦИЮ =====
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

// Делаем функцию глобальной
window.saveReport = saveReport;
// ==============================
// ==============================

// Загрузить сохраненный маршрут из CloudStorage
async function loadRouteOrder() {
  const userId = getUserId();
  const key = `route_${userId}`;

  const savedOrder = await loadFromCloud(key);

  if (savedOrder && Array.isArray(savedOrder) && savedOrder.length > 0) {
    console.log(`✅ Загружен сохраненный маршрут для ${userId}:`, savedOrder);

    if (!couriersDB[userId]) {
      couriersDB[userId] = {
        id: userId,
        routeOrder: savedOrder,
      };
    } else {
      couriersDB[userId].routeOrder = savedOrder;
    }
    return true;
  }

  console.log(`📭 Сохраненный маршрут для ${userId} не найден`);
  return false;
}

// Функция для получения финансов текущего курьера
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

// Загрузить все данные пользователя при старте
async function loadAllUserData() {
  const userId = getUserId();
  console.log(`🔄 Загрузка всех данных для пользователя ${userId}`);

  // Загружаем финансы
  const financeKey = `finance_${userId}`;
  const financeData = await loadFromCloud(financeKey);
  if (financeData) {
    financeDB[userId] = financeData;
  } else {
    financeDB[userId] = {
      currentDebt: 0,
      transactions: [],
    };
  }

  // Загружаем отчёты
  const reports = [];
  const cloud = tg?.CloudStorage;

  if (cloud) {
    const keys = await new Promise((resolve) => {
      cloud.getKeys((err, keys) => resolve(keys || []));
    });

    const reportKeys = keys.filter((key) =>
      key.startsWith(`report_${userId}_`),
    );

    for (const key of reportKeys) {
      const data = await loadFromCloud(key);
      if (data) {
        reports.push(data);
      }
    }

    reports.sort((a, b) => new Date(b.date) - new Date(a.date));
    reportDetailsDB[userId] = reports;
  }

  console.log(
    `✅ Загружено ${reports.length} отчётов для пользователя ${userId}`,
  );
}

// Получить текущего пользователя Telegram
function getCurrentTelegramUser() {
  return tg?.initDataUnsafe?.user;
}

// ========== ПОЛЬЗОВАТЕЛЬСКИЕ МЕДИЦИНСКИЕ ЦЕНТРЫ ==========

// Хранилище пользовательских МЦ (в памяти)
const userCustomCentersDB = {};

// Генерация уникального ID для пользовательского МЦ (начинаем с 1000)
let nextCustomId = 1000;

function generateCustomId() {
  nextCustomId++;
  return nextCustomId;
}

// Сохранить пользовательский МЦ
async function saveCustomCenter(centerData) {
  const userId = getUserId();
  const newId = generateCustomId();

  // Создаём объект точки
  const newCenter = {
    id: newId,
    name: centerData.name,
    address: centerData.address,
    timeWindow: centerData.timeWindow,
    schedule: centerData.schedule,
    lab: centerData.lab,
    salary: centerData.salary,
    createdBy: userId,
    createdAt: new Date().toISOString().split("T")[0],
    isCustom: true,
  };

  // Сохраняем в память
  if (!userCustomCentersDB[userId]) {
    userCustomCentersDB[userId] = {};
  }
  userCustomCentersDB[userId][newId] = newCenter;

  // Сохраняем в CloudStorage
  const key = `custom_center_${userId}_${newId}`;
  await saveToCloud(key, newCenter);

  // Сохраняем список пользовательских ID
  await saveCustomCentersList(userId);

  console.log(`✅ Создан новый пользовательский МЦ с ID: ${newId}`, newCenter);
  return newId;
}

// Сохранить список ID пользовательских МЦ
async function saveCustomCentersList(userId) {
  const customIds = Object.keys(userCustomCentersDB[userId] || {}).map(Number);
  const key = `custom_centers_list_${userId}`;
  await saveToCloud(key, customIds);
  console.log(
    `💾 Сохранён список пользовательских МЦ для ${userId}:`,
    customIds,
  );
}

// Загрузить пользовательские МЦ из CloudStorage
async function loadUserCustomCenters(userId) {
  const key = `custom_centers_list_${userId}`;
  const customIds = (await loadFromCloud(key)) || [];

  if (!userCustomCentersDB[userId]) {
    userCustomCentersDB[userId] = {};
  }

  // Загружаем каждый пользовательский МЦ
  for (const id of customIds) {
    const centerKey = `custom_center_${userId}_${id}`;
    const center = await loadFromCloud(centerKey);
    if (center) {
      userCustomCentersDB[userId][id] = center;
    }
  }

  console.log(
    `📦 Загружено ${Object.keys(userCustomCentersDB[userId]).length} пользовательских МЦ`,
  );
}

// Получить точку (основную или пользовательскую)
function getCenterById(centerId) {
  // Сначала ищем в основной базе
  if (medicalCentersDB[centerId]) {
    return medicalCentersDB[centerId];
  }

  // Потом в пользовательской
  const userId = getUserId();
  if (userCustomCentersDB[userId] && userCustomCentersDB[userId][centerId]) {
    return userCustomCentersDB[userId][centerId];
  }

  return null;
}

// Обновляем функцию getCurrentRoutePoints для поддержки пользовательских МЦ
function getCurrentRoutePoints() {
  const routeOrder = getCurrentCourierRoute();
  const userId = getUserId();

  const points = routeOrder
    .map((centerId) => {
      // Сначала ищем в основной базе
      if (medicalCentersDB[centerId]) {
        return medicalCentersDB[centerId];
      }
      // Потом в пользовательской
      if (
        userCustomCentersDB[userId] &&
        userCustomCentersDB[userId][centerId]
      ) {
        return userCustomCentersDB[userId][centerId];
      }
      return undefined;
    })
    .filter((center) => center !== undefined);

  console.log(
    `📍 Загружено ${points.length} точек маршрута (включая пользовательские)`,
  );
  return points;
}

// Добавить МЦ в начало маршрута
async function addCenterToRouteStart(centerId) {
  const userId = getUserId();
  const currentRoute = getCurrentCourierRoute();

  // Добавляем новый ID в начало
  const newRoute = [centerId, ...currentRoute];

  // Сохраняем новый порядок
  if (!couriersDB[userId]) {
    couriersDB[userId] = { id: userId, routeOrder: newRoute };
  } else {
    couriersDB[userId].routeOrder = newRoute;
  }

  await saveRouteOrder(newRoute);
  console.log(`➕ МЦ ${centerId} добавлен в начало маршрута`);
  return newRoute;
}

// Обновляем функцию loadAllUserData для загрузки пользовательских МЦ
async function loadAllUserData() {
  const userId = getUserId();
  console.log(`🔄 Загрузка всех данных для пользователя ${userId}`);

  // Загружаем финансы
  const financeKey = `finance_${userId}`;
  const financeData = await loadFromCloud(financeKey);
  if (financeData) {
    financeDB[userId] = financeData;
  } else {
    financeDB[userId] = {
      currentDebt: 0,
      transactions: [],
    };
  }

  // Загружаем отчёты
  const reports = [];
  const cloud = tg?.CloudStorage;

  if (cloud) {
    const keys = await new Promise((resolve) => {
      cloud.getKeys((err, keys) => resolve(keys || []));
    });

    const reportKeys = keys.filter((key) =>
      key.startsWith(`report_${userId}_`),
    );

    for (const key of reportKeys) {
      const data = await loadFromCloud(key);
      if (data) {
        reports.push(data);
      }
    }

    reports.sort((a, b) => new Date(b.date) - new Date(a.date));
    reportDetailsDB[userId] = reports;
  }

  // Загружаем пользовательские МЦ
  await loadUserCustomCenters(userId);

  console.log(
    `✅ Загружено ${reports.length} отчётов для пользователя ${userId}`,
  );
}
