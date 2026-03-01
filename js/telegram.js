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
    },
  };
}

// Глобальный объект Telegram
const tg = window.Telegram.WebApp;

// Инициализация
tg.ready();
tg.expand();

console.log("Telegram инициализирован в режиме разработки");
