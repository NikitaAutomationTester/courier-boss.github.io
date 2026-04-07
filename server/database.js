"use strict";

const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const dbPath = path.join(__dirname, "data", "bbex.db");

function openDb() {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      phone TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS clinics (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      city TEXT,
      address TEXT,
      courier_salary INTEGER DEFAULT 0,
      cost_for_laboratory INTEGER DEFAULT 0,
      laboratory TEXT
    );
    CREATE TABLE IF NOT EXISTS courier_clinics (
      courier_id TEXT NOT NULL,
      clinic_id INTEGER NOT NULL,
      PRIMARY KEY (courier_id, clinic_id),
      FOREIGN KEY (courier_id) REFERENCES users(id),
      FOREIGN KEY (clinic_id) REFERENCES clinics(id)
    );
    CREATE TABLE IF NOT EXISTS routes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS route_clinics (
      route_id INTEGER NOT NULL,
      clinic_id INTEGER NOT NULL,
      PRIMARY KEY (route_id, clinic_id),
      FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
      FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS courier_routes (
      courier_id TEXT NOT NULL,
      route_id INTEGER NOT NULL,
      PRIMARY KEY (courier_id, route_id),
      FOREIGN KEY (courier_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      user_name TEXT,
      user_phone TEXT,
      report_date TEXT NOT NULL,
      formatted_date TEXT,
      total_salary INTEGER NOT NULL,
      payload_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(user_id, report_date),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS payouts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      amount INTEGER NOT NULL,
      payout_date TEXT,
      formatted_date TEXT,
      note TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  const userCount = db.prepare("SELECT COUNT(*) AS c FROM users").get().c;
  if (userCount === 0) {
    db.prepare(
      "INSERT INTO users (id, phone, name, role) VALUES (?,?,?,?)",
    ).run("courier_001", "+79054963954", "Никита Шматко", "courier");
    db.prepare(
      "INSERT INTO users (id, phone, name, role) VALUES (?,?,?,?)",
    ).run("courier_002", "+79614624066", "Иван Петров", "admin");
  }

  const clinicCount = db.prepare("SELECT COUNT(*) AS c FROM clinics").get().c;
  if (clinicCount === 0) {
    const seed = JSON.parse(
      fs.readFileSync(path.join(__dirname, "seed-clinics.json"), "utf8"),
    );
    const ins = db.prepare(
      `INSERT INTO clinics (id, name, city, address, courier_salary, cost_for_laboratory, laboratory)
       VALUES (@id,@name,@city,@address,@courier_salary,@cost_for_laboratory,@laboratory)`,
    );
    const link = db.prepare(
      "INSERT OR IGNORE INTO courier_clinics (courier_id, clinic_id) VALUES (?,?)",
    );
    for (const row of seed) {
      ins.run(row);
      link.run("courier_001", row.id);
    }
  }

  migrateLegacyCourierClinicsToRoutes(db);
  ensureReportsRouteIdColumn(db);

  return db;
}

/** Однократно: старая связка courier_clinics → по маршруту на курьера с тем же набором клиник */
function migrateLegacyCourierClinicsToRoutes(database) {
  const routesCount = database.prepare("SELECT COUNT(*) AS c FROM routes").get().c;
  const legacyCount = database
    .prepare("SELECT COUNT(*) AS c FROM courier_clinics")
    .get().c;
  if (routesCount > 0 || legacyCount === 0) return;

  const couriers = database
    .prepare("SELECT DISTINCT courier_id FROM courier_clinics")
    .all();
  const insRoute = database.prepare("INSERT INTO routes (name) VALUES (?)");
  const insRC = database.prepare(
    "INSERT OR IGNORE INTO route_clinics (route_id, clinic_id) VALUES (?,?)",
  );
  const insCR = database.prepare(
    "INSERT OR IGNORE INTO courier_routes (courier_id, route_id) VALUES (?,?)",
  );
  const tx = database.transaction(() => {
    for (const { courier_id } of couriers) {
      const u = database
        .prepare("SELECT name FROM users WHERE id = ?")
        .get(courier_id);
      const label = u
        ? `Маршрут (${u.name})`
        : `Маршрут ${courier_id}`;
      const { lastInsertRowid: routeId } = insRoute.run(label);
      const clinics = database
        .prepare(
          "SELECT clinic_id FROM courier_clinics WHERE courier_id = ?",
        )
        .all(courier_id);
      for (const { clinic_id } of clinics) {
        insRC.run(routeId, clinic_id);
      }
      insCR.run(courier_id, routeId);
    }
  });
  tx();
}

function ensureReportsRouteIdColumn(database) {
  const cols = database.prepare("PRAGMA table_info(reports)").all();
  if (cols.some((c) => c.name === "route_id")) return;
  database.exec("ALTER TABLE reports ADD COLUMN route_id INTEGER");
}

module.exports = { openDb, dbPath };
