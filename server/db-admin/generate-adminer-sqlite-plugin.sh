#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

echo "Этот пароль вводится во второй форме Adminer (после серого окна Nginx)."
echo "Его НЕТ у файла SQLite — Adminer просто требует любой «секрет» в форме."
echo "Удобно указать тот же пароль, что и для Nginx (шаг с .htpasswd)."
echo

read -r -s -p "Пароль для формы Adminer: " P1
echo
read -r -s -p "Повторите: " P2
echo
if [[ "$P1" != "$P2" ]]; then
  echo "Пароли не совпадают." >&2
  exit 1
fi
if [[ -z "$P1" ]]; then
  echo "Пароль не может быть пустым — иначе SQLite в Adminer не откроется." >&2
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "Docker не запущен или нет прав. Запустите Docker и повторите." >&2
  exit 1
fi

echo "Считаю bcrypt-хеш (образ adminer:4, один раз подтянется с Docker Hub)…"
HASH="$(docker run --rm -e ADMINER_PW="$P1" adminer:4 php -r 'echo password_hash(getenv("ADMINER_PW") ?: "", PASSWORD_DEFAULT);')"

mkdir -p plugins-enabled
OUT="plugins-enabled/001-login-password-less.php"

# Хеш bcrypt не содержит одинарных кавычек — безопасно для PHP в одинарных кавычках
cat >"$OUT" <<EOF
<?php
require_once dirname(__DIR__) . '/plugins/login-password-less.php';

return new AdminerLoginPasswordLess(
    '$HASH'
);
EOF

echo "Готово: $OUT"
echo "Перезапустите Adminer: docker compose up -d --force-recreate adminer"
