// Список разрешённых пользователей (курьеров)
// В дальнейшем можно будет заменить на загрузку с сервера
const ALLOWED_USERS = [
  {
    phone: "+79054963954",
    name: "Никита Шматко",
    id: "courier_001",
  },
  {
    phone: "+79987654321",
    name: "Алексей Сидоров",
    id: "courier_002",
  },
  {
    phone: "+79201234567",
    name: "Дмитрий Иванов",
    id: "courier_003",
  },
  // Добавляйте новых курьеров сюда
];

// Функция проверки пользователя по номеру телефона
function isUserAllowed(phoneNumber) {
  if (!phoneNumber) return false;
  return ALLOWED_USERS.some((user) => user.phone === phoneNumber);
}

// Функция получения данных пользователя по номеру телефона
function getUserByPhone(phoneNumber) {
  if (!phoneNumber) return null;
  return ALLOWED_USERS.find((user) => user.phone === phoneNumber) || null;
}
