// ЭМУЛЯЦИЯ TELEGRAM ДЛЯ РАЗРАБОТКИ В БРАУЗЕРЕ

// Создаем эмуляцию Telegram WebApp, если её нет
if (!window.Telegram) {
  console.log("Создаем эмуляцию Telegram WebApp для разработки");

  window.Telegram = {
    WebApp: {
      // Основные свойства
      version: "6.9",
      platform: "web",
      colorScheme: "light",
      themeParams: {
        bg_color: "#ffffff",
        text_color: "#000000",
        hint_color: "#999999",
        link_color: "#2481cc",
        button_color: "#40a7e3",
        button_text_color: "#ffffff",
      },

      // Методы
      ready: function () {
        console.log("Telegram WebApp готов (эмуляция)");
      },

      expand: function () {
        console.log("Расширяем приложение (эмуляция)");
      },

      close: function () {
        console.log("Закрываем приложение (эмуляция)");
        alert("Приложение закрыто (в реальном Telegram закроется)");
      },

      showAlert: function (message) {
        console.log("showAlert вызван с сообщением:", message);
        alert("Telegram Alert: " + message);
      },

      showPopup: function (params) {
        console.log("showPopup вызван с параметрами:", params);
        alert(
          "Telegram Popup: " + (params.message || params.title || "Сообщение"),
        );
      },

      // Главная кнопка
      MainButton: {
        text: "Закрыть",
        color: "#40a7e3",
        textColor: "#ffffff",
        isVisible: false,

        setText: function (text) {
          this.text = text;
          console.log("MainButton текст установлен:", text);
        },

        onClick: function (callback) {
          console.log("MainButton обработчик назначен");
          this.callback = callback;
        },

        show: function () {
          this.isVisible = true;
          console.log("MainButton показан");
        },

        hide: function () {
          this.isVisible = false;
          console.log("MainButton скрыт");
        },
      },

      // Метод для отправки данных
      sendData: function (data) {
        console.log("Отправка данных в Telegram:", data);
        alert("Данные отправлены (в консоли)");
      },

      // CloudStorage (эмуляция для разработки)
      CloudStorage: {
        _storage: {},

        setItem: function (key, value, callback) {
          console.log(
            `CloudStorage.setItem: ${key} = ${value.substring(0, 50)}...`,
          );
          this._storage[key] = value;
          if (callback) callback(false);
        },

        getItem: function (key, callback) {
          console.log(`CloudStorage.getItem: ${key}`);
          const value = this._storage[key] || null;
          if (callback) callback(false, value);
        },

        removeItem: function (key, callback) {
          console.log(`CloudStorage.removeItem: ${key}`);
          delete this._storage[key];
          if (callback) callback(false);
        },

        getKeys: function (callback) {
          console.log("CloudStorage.getKeys");
          const keys = Object.keys(this._storage);
          if (callback) callback(false, keys);
        },
      },
    },
  };
}

// Глобальный объект Telegram
const tg = window.Telegram.WebApp;

// Инициализация
tg.ready();
tg.expand();

console.log("Telegram инициализирован в режиме разработки");

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ РАБОТЫ C CLOUDSTORAGE ==========

// Функция для безопасного вызова CloudStorage методов
function callCloudStorage(method, params, callback) {
  if (!tg || !tg.CloudStorage) {
    console.warn("CloudStorage недоступен (используется эмуляция)");
    if (callback) callback({ error: "CloudStorage not available" }, null);
    return;
  }

  // Вызываем метод CloudStorage
  if (method === "setItem") {
    tg.CloudStorage.setItem(params.key, params.value, callback);
  } else if (method === "getItem") {
    tg.CloudStorage.getItem(params.key, callback);
  } else if (method === "removeItem") {
    tg.CloudStorage.removeItem(params.key, callback);
  } else if (method === "getKeys") {
    tg.CloudStorage.getKeys(callback);
  }
}

// Сохранить данные в CloudStorage
function saveToCloud(key, data) {
  return new Promise((resolve, reject) => {
    try {
      const jsonData = JSON.stringify(data);
      callCloudStorage("setItem", { key, value: jsonData }, (error) => {
        if (error) {
          console.error(`Ошибка сохранения ${key}:`, error);
          reject(error);
        } else {
          console.log(`Данные ${key} сохранены`);
          resolve();
        }
      });
    } catch (e) {
      console.error("Ошибка при сериализации данных:", e);
      reject(e);
    }
  });
}

// Загрузить данные из CloudStorage
function loadFromCloud(key) {
  return new Promise((resolve) => {
    callCloudStorage("getItem", { key }, (error, value) => {
      if (error || !value) {
        console.log(`Данные ${key} не найдены или ошибка загрузки`);
        resolve(null);
      } else {
        try {
          const data = JSON.parse(value);
          console.log(`Данные ${key} загружены`);
          resolve(data);
        } catch (e) {
          console.error(`Ошибка парсинга ${key}:`, e);
          resolve(null);
        }
      }
    });
  });
}
