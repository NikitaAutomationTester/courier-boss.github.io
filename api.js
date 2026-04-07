/**
 * HTTP API (тот же origin, cookie-сессия).
 * Если фронт на другом домене: BBExApi.setBase("https://88.218.63.85")
 */
(function (global) {
  let apiBase = "";

  function setBase(url) {
    apiBase = (url || "").replace(/\/$/, "");
  }

  async function apiJson(path, options = {}) {
    const url = apiBase + path;
    const res = await fetch(url, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });
    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { raw: text };
    }
    if (!res.ok) {
      const msg =
        (data && (data.error || data.message)) ||
        res.statusText ||
        "Ошибка запроса";
      const err = new Error(msg);
      err.status = res.status;
      err.body = data;
      throw err;
    }
    return data;
  }

  global.BBExApi = {
    setBase,
    login(phone) {
      return apiJson("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ phone }),
      });
    },
    logout() {
      return apiJson("/api/auth/logout", { method: "POST" });
    },
    me() {
      return apiJson("/api/auth/me");
    },
    getClinics(routeId) {
      const path =
        routeId != null && routeId !== ""
          ? "/api/clinics?routeId=" + encodeURIComponent(routeId)
          : "/api/clinics";
      return apiJson(path);
    },
    getRoutes() {
      return apiJson("/api/routes");
    },
    getReports() {
      return apiJson("/api/reports");
    },
    createReport(body) {
      return apiJson("/api/reports", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    deleteReport(id) {
      return apiJson("/api/reports/" + encodeURIComponent(id), {
        method: "DELETE",
      });
    },
    getFinance() {
      return apiJson("/api/finance");
    },
  };
})(typeof window !== "undefined" ? window : globalThis);
