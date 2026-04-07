"use strict";

require("dotenv").config();

const path = require("path");
const fs = require("fs");
const express = require("express");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { openDb } = require("./database");

const COOKIE_NAME = "bbex_token";
const JWT_SECRET =
  process.env.JWT_SECRET || "dev-only-change-JWT_SECRET-in-production";
const PORT = Number(process.env.PORT) || 3000;

if (!process.env.JWT_SECRET && process.env.NODE_ENV === "production") {
  console.warn(
    "BBEx: задайте JWT_SECRET в окружении (см. server/.env.example)",
  );
}

const db = openDb();
const app = express();

app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

function normalizePhone(input) {
  if (!input) return "";
  const digits = String(input).replace(/\D/g, "");
  if (digits.length === 10) return "+7" + digits;
  if (digits.length === 11 && digits.startsWith("8")) return "+7" + digits.slice(1);
  if (digits.length === 11 && digits.startsWith("7")) return "+" + digits;
  return String(input).replace(/[^\d+]/g, "").startsWith("+")
    ? "+" + digits
    : "+7" + digits;
}

function reportFromRow(row) {
  let payload = {};
  try {
    payload = JSON.parse(row.payload_json);
  } catch (_) {}
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    userPhone: row.user_phone,
    date: row.report_date,
    formattedDate: row.formatted_date,
    totalSalary: row.total_salary,
    clinics: payload.clinics || [],
    extraDeliveries: payload.extraDeliveries || [],
    timestamp: row.created_at,
    routeId: row.route_id != null ? row.route_id : null,
  };
}

function clinicIdsAllowedForCourier(courierId) {
  const hasManagedRoutes = db
    .prepare("SELECT 1 FROM courier_routes WHERE courier_id = ? LIMIT 1")
    .get(courierId);
  const fromRoutes = db
    .prepare(
      `SELECT DISTINCT rc.clinic_id AS id
       FROM route_clinics rc
       INNER JOIN courier_routes cr ON cr.route_id = rc.route_id
       WHERE cr.courier_id = ?`,
    )
    .all(courierId)
    .map((r) => r.id);
  if (fromRoutes.length > 0) return new Set(fromRoutes);
  if (hasManagedRoutes) return new Set();
  const legacy = db
    .prepare(
      "SELECT clinic_id AS id FROM courier_clinics WHERE courier_id = ?",
    )
    .all(courierId)
    .map((r) => r.id);
  return new Set(legacy);
}

function clinicIdsForRoute(routeId) {
  return new Set(
    db
      .prepare("SELECT clinic_id AS id FROM route_clinics WHERE route_id = ?")
      .all(routeId)
      .map((r) => r.id),
  );
}

function courierOwnsRoute(courierId, routeId) {
  return !!db
    .prepare(
      "SELECT 1 FROM courier_routes WHERE courier_id = ? AND route_id = ?",
    )
    .get(courierId, routeId);
}

function mapClinicRow(r) {
  return {
    id: r.id,
    name: r.name,
    city: r.city || "",
    address: r.address || "",
    courier_salary: r.courier_salary,
    cost_for_laboratory: r.cost_for_laboratory,
    laboratory: r.laboratory || "",
  };
}

function buildFinanceForUser(userId) {
  const reports = db
    .prepare("SELECT * FROM reports WHERE user_id = ?")
    .all(userId);
  let accrualsTotal = 0;
  const accrualOps = [];
  for (const row of reports) {
    const amt = Number(row.total_salary) || 0;
    accrualsTotal += amt;
    const r = reportFromRow(row);
    const dateLabel = r.formattedDate || r.date || "—";
    accrualOps.push({
      kind: "accrual",
      amount: amt,
      sortDate: r.date || "",
      sortTime: new Date(r.timestamp || row.created_at).getTime(),
      subtitle: `Отчёт за ${dateLabel}`,
      label: "Начисление",
    });
  }

  const payoutRows = db
    .prepare("SELECT * FROM payouts WHERE user_id = ?")
    .all(userId);
  const payoutOps = payoutRows.map((p) => ({
    kind: "payout",
    amount: Math.abs(Number(p.amount) || 0),
    sortDate: p.payout_date || "",
    sortTime: new Date(p.created_at).getTime(),
    subtitle:
      p.note ||
      (p.formatted_date ? `Выплата за ${p.formatted_date}` : "Выплата"),
    label: "Выплата",
  }));
  const payoutsTotal = payoutOps.reduce((s, p) => s + p.amount, 0);
  const operations = [...accrualOps, ...payoutOps].sort((a, b) => {
    if (a.sortDate !== b.sortDate) return b.sortDate.localeCompare(a.sortDate);
    return b.sortTime - a.sortTime;
  });
  return {
    accrualsTotal,
    payoutsTotal,
    debt: accrualsTotal - payoutsTotal,
    operations,
  };
}

function requireAuth(req, res, next) {
  const token = req.cookies[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: "Не авторизован" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Сессия недействительна" });
  }
}

app.post("/api/auth/login", (req, res) => {
  const phone = normalizePhone(req.body.phone);
  const user = db.prepare("SELECT * FROM users WHERE phone = ?").get(phone);
  if (!user) {
    return res.status(401).json({ error: "Номер телефона не верный" });
  }
  const token = jwt.sign(
    {
      sub: user.id,
      role: user.role,
      phone: user.phone,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: "30d" },
  );
  // Secure-куки только по HTTPS. На http://IP оставьте COOKIE_SECURE не заданным.
  // Когда настроите HTTPS (домен + сертификат): COOKIE_SECURE=1
  const secure = process.env.COOKIE_SECURE === "1";
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: "/",
  });
  res.json({
    user: {
      id: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role,
    },
  });
});

app.post("/api/auth/logout", (_req, res) => {
  res.clearCookie(COOKIE_NAME, {
    path: "/",
    sameSite: "lax",
    secure: process.env.COOKIE_SECURE === "1",
  });
  res.json({ ok: true });
});

app.get("/api/auth/me", requireAuth, (req, res) => {
  const user = db
    .prepare("SELECT id, phone, name, role FROM users WHERE id = ?")
    .get(req.user.sub);
  if (!user) return res.status(401).json({ error: "Пользователь не найден" });
  res.json({ user });
});

app.get("/api/clinics", requireAuth, (req, res) => {
  if (req.user.role !== "courier") {
    return res.json([]);
  }
  const courierId = req.user.sub;
  const routeIdRaw = req.query.routeId ?? req.query.route_id;
  const routeId =
    routeIdRaw != null && routeIdRaw !== ""
      ? parseInt(String(routeIdRaw), 10)
      : null;
  const routeIdOk =
    routeId != null && Number.isFinite(routeId) && routeId > 0 ? routeId : null;

  let rows;
  if (routeIdOk != null) {
    if (!courierOwnsRoute(courierId, routeIdOk)) {
      return res.status(403).json({ error: "Маршрут не найден или не ваш" });
    }
    rows = db
      .prepare(
        `SELECT DISTINCT c.id, c.name, c.city, c.address, c.courier_salary, c.cost_for_laboratory, c.laboratory
         FROM clinics c
         INNER JOIN route_clinics rc ON rc.clinic_id = c.id
         WHERE rc.route_id = ?
         ORDER BY c.name`,
      )
      .all(routeIdOk);
  } else {
    rows = db
      .prepare(
        `SELECT DISTINCT c.id, c.name, c.city, c.address, c.courier_salary, c.cost_for_laboratory, c.laboratory
         FROM clinics c
         INNER JOIN route_clinics rc ON rc.clinic_id = c.id
         INNER JOIN courier_routes cr ON cr.route_id = rc.route_id
         WHERE cr.courier_id = ?
         ORDER BY c.name`,
      )
      .all(courierId);
    const hasCourierRoutes = db
      .prepare("SELECT 1 FROM courier_routes WHERE courier_id = ? LIMIT 1")
      .get(courierId);
    if (rows.length === 0 && !hasCourierRoutes) {
      rows = db
        .prepare(
          `SELECT c.id, c.name, c.city, c.address, c.courier_salary, c.cost_for_laboratory, c.laboratory
           FROM clinics c
           INNER JOIN courier_clinics cc ON cc.clinic_id = c.id
           WHERE cc.courier_id = ?
           ORDER BY c.name`,
        )
        .all(courierId);
    }
  }
  res.json(rows.map(mapClinicRow));
});

app.get("/api/routes", requireAuth, (req, res) => {
  if (req.user.role !== "courier") {
    return res.json([]);
  }
  const rows = db
    .prepare(
      `SELECT r.id, r.name
       FROM routes r
       INNER JOIN courier_routes cr ON cr.route_id = r.id
       WHERE cr.courier_id = ?
       ORDER BY r.name`,
    )
    .all(req.user.sub);
  res.json(rows.map((r) => ({ id: r.id, name: r.name })));
});

app.get("/api/reports", requireAuth, (req, res) => {
  let rows;
  if (req.user.role === "admin") {
    rows = db
      .prepare(
        "SELECT * FROM reports ORDER BY report_date DESC, created_at DESC",
      )
      .all();
  } else {
    rows = db
      .prepare(
        "SELECT * FROM reports WHERE user_id = ? ORDER BY report_date DESC, created_at DESC",
      )
      .all(req.user.sub);
  }
  res.json(rows.map(reportFromRow));
});

app.post("/api/reports", requireAuth, (req, res) => {
  if (req.user.role !== "courier") {
    return res.status(403).json({ error: "Только курьер может создавать отчёты" });
  }
  const {
    date,
    formattedDate,
    clinics,
    totalSalary,
    extraDeliveries,
    routeId: bodyRouteId,
  } = req.body;
  if (!date || typeof totalSalary !== "number") {
    return res.status(400).json({ error: "Некорректные данные отчёта" });
  }
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.sub);
  if (!user) return res.status(401).json({ error: "Пользователь не найден" });

  const clinicList = Array.isArray(clinics) ? clinics : [];
  let routeIdSql = null;
  if (bodyRouteId != null && bodyRouteId !== "") {
    const rid = parseInt(String(bodyRouteId), 10);
    if (!Number.isFinite(rid) || rid <= 0) {
      return res.status(400).json({ error: "Некорректный маршрут" });
    }
    if (!courierOwnsRoute(user.id, rid)) {
      return res.status(400).json({ error: "Маршрут не найден или не ваш" });
    }
    const allowedForRoute = clinicIdsForRoute(rid);
    for (const cl of clinicList) {
      const cid = Number(cl && cl.id);
      if (!Number.isFinite(cid) || !allowedForRoute.has(cid)) {
        return res.status(400).json({
          error: "В отчёт можно добавить только клиники выбранного маршрута",
        });
      }
    }
    routeIdSql = rid;
  } else {
    const allowed = clinicIdsAllowedForCourier(user.id);
    for (const cl of clinicList) {
      const cid = Number(cl && cl.id);
      if (!Number.isFinite(cid) || !allowed.has(cid)) {
        return res.status(400).json({
          error: "В отчёт можно добавить только свои клиники",
        });
      }
    }
  }

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const createdAt = new Date().toISOString();
  const payload = {
    clinics: clinicList,
    extraDeliveries: Array.isArray(extraDeliveries) ? extraDeliveries : [],
  };

  try {
    db.prepare(
      `INSERT INTO reports (id, user_id, user_name, user_phone, report_date, formatted_date, total_salary, payload_json, created_at, route_id)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
    ).run(
      id,
      user.id,
      user.name,
      user.phone,
      date,
      formattedDate || date,
      totalSalary,
      JSON.stringify(payload),
      createdAt,
      routeIdSql,
    );
  } catch (e) {
    if (String(e.message).includes("UNIQUE")) {
      return res.status(409).json({ error: "Отчёт за эту дату уже создан" });
    }
    console.error(e);
    return res.status(500).json({ error: "Не удалось сохранить отчёт" });
  }

  const row = db.prepare("SELECT * FROM reports WHERE id = ?").get(id);
  res.status(201).json(reportFromRow(row));
});

app.delete("/api/reports/:id", requireAuth, (req, res) => {
  const row = db.prepare("SELECT * FROM reports WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Отчёт не найден" });
  if (req.user.role !== "admin" && row.user_id !== req.user.sub) {
    return res.status(403).json({ error: "Нет доступа" });
  }
  db.prepare("DELETE FROM reports WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

app.get("/api/finance", requireAuth, (req, res) => {
  if (req.user.role !== "courier") {
    return res.status(403).json({ error: "Доступно только курьеру" });
  }
  res.json(buildFinanceForUser(req.user.sub));
});

const publicRoot = path.join(__dirname, "..");
if (!fs.existsSync(path.join(publicRoot, "index.html"))) {
  console.warn("BBEx: не найден index.html в", publicRoot);
}

app.use(express.static(publicRoot));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`BBEx сервер: http://0.0.0.0:${PORT} (статика + /api)`);
});
