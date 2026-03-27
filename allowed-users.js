// База данных курьеров
const USERS_DB = [
  {
    id: "courier_001",
    phone: "+79054963954",
    name: "Никита Шматко",
  },
  {
    id: "courier_002",
    phone: "+79123456789",
    name: "Иван Петров",
  },
  {
    id: "courier_003",
    phone: "+79201234567",
    name: "Дмитрий Сидоров",
  },
];

// Проверка пользователя по номеру телефона
function checkAuthByPhone(phone) {
  // Очищаем номер от лишних символов для сравнения
  const cleanPhone = phone.replace(/[^\d+]/g, "");
  return (
    USERS_DB.find((user) => {
      const cleanUserPhone = user.phone.replace(/[^\d+]/g, "");
      return cleanUserPhone === cleanPhone;
    }) || null
  );
}

// Функция для получения пользователя по номеру
function getUserByPhone(phone) {
  return checkAuthByPhone(phone);
}

// Функция проверки, есть ли пользователь
function isUserAllowed(phone) {
  return checkAuthByPhone(phone) !== null;
}
