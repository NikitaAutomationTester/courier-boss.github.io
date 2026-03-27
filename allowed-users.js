// База данных курьеров
const USERS_DB = [
  {
    id: "courier_001",
    phone: "+79054963954",
    name: "Никита Шматко",
    role: "courier",
  },
  {
    id: "courier_002",
    phone: "+79614624066",
    name: "Иван Петров",
    role: "admin",
  },
];

// Проверка пользователя по номеру телефона (возвращает объект или null)
function checkAuthByPhone(phone) {
  const cleanPhone = phone.replace(/[^\d+]/g, "");
  const user = USERS_DB.find((user) => {
    const cleanUserPhone = user.phone.replace(/[^\d+]/g, "");
    return cleanUserPhone === cleanPhone;
  });
  return user || null;
}

// Функция для получения пользователя по номеру
function getUserByPhone(phone) {
  return checkAuthByPhone(phone);
}

// Функция проверки, есть ли пользователь
function isUserAllowed(phone) {
  return checkAuthByPhone(phone) !== null;
}
