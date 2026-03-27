// База данных курьеров (теперь проверяем по телефону)
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
];

// Проверка по номеру телефона
function checkAuthByPhone(phone) {
  return USERS_DB.find((user) => user.phone === phone) || null;
}
