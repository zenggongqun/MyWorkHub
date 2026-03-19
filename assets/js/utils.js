"use strict";

function isManageMode() {
  return state.db && state.db.settings && state.db.settings.ui && state.db.settings.ui.mode === "manage";
}

function resolveIconCandidates(url) {
  try {
    const parsed = new URL(url);
    const host = safeString(parsed.hostname);
    if (!host) return ["assets/icons/chrome.png"];
    const origin = `${parsed.protocol}//${host}${parsed.port ? `:${parsed.port}` : ""}`;
    return [
      `${origin}/favicon.ico`,
      `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`,
    ];
  } catch (_error) {
    return ["assets/icons/chrome.png"];
  }
}

function hostFromUrl(url) {
  try {
    const parsed = new URL(url);
    return safeString(parsed.hostname).toLowerCase().replace(/^www\./, "");
  } catch (_error) {
    const text = safeString(url).toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "");
    const host = text.split("/")[0];
    return host || "";
  }
}

function siteKeyFromUrl(url) {
  const host = hostFromUrl(url);
  if (!host) return "";
  const parts = host.split(".").filter(Boolean);
  if (parts.length <= 2) return host;
  const suffix2 = parts.slice(-2).join(".");
  const suffix3 = parts.slice(-3).join(".");
  const cnSuffixes = new Set(["com.cn", "net.cn", "org.cn", "gov.cn", "edu.cn"]);
  if (cnSuffixes.has(suffix2) && parts.length >= 3) {
    return suffix3;
  }
  return suffix2;
}

function engineLabel(engine) {
  if (!engine) return "搜索引擎";
  return safeString(engine.name) || "搜索引擎";
}

function shouldCopyQueryForEngine(engine) {
  if (!engine) return false;
  const id = safeString(engine.id);
  return COPY_QUERY_ENGINE_IDS.has(id);
}

async function copyToClipboard(text) {
  const value = safeString(text);
  if (!value) return false;

  try {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "0";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    const ok = document.execCommand("copy");
    textarea.remove();
    return Boolean(ok);
  } catch (_error) {
    return false;
  }
}

function getActiveEngineId() {
  return safeString(state.db && state.db.settings && state.db.settings.activeEngineId);
}

function getEngineById(id) {
  if (!id || !state.db || !state.db.settings || !Array.isArray(state.db.settings.engines)) return null;
  return state.db.settings.engines.find((item) => item.id === id) || null;
}

function sortedEngines() {
  const list = state.db && state.db.settings && Array.isArray(state.db.settings.engines)
    ? state.db.settings.engines
    : [];
  return [...list].sort((a, b) => a.order - b.order);
}

function nextOrder(items) {
  let max = 0;
  items.forEach((item) => {
    max = Math.max(max, Number(item.order) || 0);
  });
  return max + 10;
}

function nextOrderForLinks(categoryId) {
  let max = 0;
  state.db.links.forEach((item) => {
    if (item.categoryId === categoryId) {
      max = Math.max(max, Number(item.order) || 0);
    }
  });
  return max + 10;
}

function sortedCategories() {
  return [...state.db.categories].sort((a, b) => a.order - b.order);
}

function getCategoryById(id) {
  return state.db.categories.find((item) => item.id === id) || null;
}

function getLinkById(id) {
  return state.db.links.find((item) => item.id === id) || null;
}

function getTodoById(id) {
  return state.db.plan.todos.find((item) => item.id === id) || null;
}

function renderHolidayList() {
  if (!els.holidayList) return;
  const holidays = [...state.db.plan.holidays].sort((a, b) => a.startDate.localeCompare(b.startDate));
  if (!holidays.length) {
    const msg = state.ui.holidayAutoStatus === "loading"
      ? "正在自动获取假日数据..."
      : "暂时没有假日数据，可手动添加一条。";
    els.holidayList.innerHTML = `<div class="todo-empty">${msg}</div>`;
    return;
  }
  els.holidayList.innerHTML = holidays.map((holiday) => `
    <article class="todo-item">
      <div class="dot" aria-hidden="true"></div>
      <div class="todo-t">${escHtml(holiday.name)} · ${escHtml(holiday.startDate)} - ${escHtml(holiday.endDate)}</div>
      <button type="button" class="toolbtn sm ghost danger" data-action="delete-holiday" data-holiday-id="${escAttr(holiday.id)}" title="删除">
        <span class="sr">删除</span>
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6.5 8h11" stroke="#0c1b1d" stroke-width="1.8" stroke-linecap="round" />
          <path d="M9.2 8v11" stroke="#0c1b1d" stroke-width="1.8" stroke-linecap="round" />
          <path d="M14.8 8v11" stroke="#0c1b1d" stroke-width="1.8" stroke-linecap="round" />
          <path d="M8.5 6.2h7" stroke="#0c1b1d" stroke-width="1.8" stroke-linecap="round" />
        </svg>
      </button>
    </article>
  `).join("");
}

function normalizeDayValue(value) {
  const v = safeString(value);
  const n = Number(v);
  return Number.isInteger(n) && n >= 1 && n <= 7 ? String(n) : "";
}

function formatYmd(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatYm(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function parseYm(text) {
  if (!/^\d{4}-\d{2}$/.test(text)) return null;
  const [y, m] = text.split("-").map(Number);
  if (m < 1 || m > 12) return null;
  return new Date(y, m - 1, 1);
}

function parseYmd(text) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return null;
  const [y, m, d] = text.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  return date;
}

function weekdayMon(date) {
  const day = date.getDay();
  return day === 0 ? 7 : day;
}

function hashText(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function pickDailyMotto(date) {
  const day = weekdayMon(date);
  const pool = Array.isArray(WEEKDAY_MOTTOS[day]) && WEEKDAY_MOTTOS[day].length
    ? WEEKDAY_MOTTOS[day]
    : WEEKDAY_MOTTOS[1];
  const todayKey = formatYmd(date);
  const stored = state.db && state.db.settings && state.db.settings.motto
    ? state.db.settings.motto
    : null;
  const storedId = stored ? safeString(stored.quoteId) : "";
  if (stored && stored.lastDate === todayKey && storedId) {
    const existing = pool.find((item) => item.id === storedId);
    if (existing) return existing;
  }

  const index = hashText(`${todayKey}:${day}`) % pool.length;
  const selected = pool[index] || pool[0];
  if (stored && (stored.lastDate !== todayKey || stored.quoteId !== selected.id)) {
    stored.lastDate = todayKey;
    stored.quoteId = selected.id;
    saveDb();
  }
  return selected;
}

function startOfWeekMon(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const offset = weekdayMon(d) - 1;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - offset);
}

function weekKeyForDate(date) {
  const ws = startOfWeekMon(date);
  const year = ws.getFullYear();
  const first = startOfWeekMon(new Date(year, 0, 1));
  const diff = Math.floor((ws - first) / 86400000);
  const week = Math.floor(diff / 7) + 1;
  return `${year}-W${String(week).padStart(2, "0")}`;
}

function dateFromWeekKeyAndDay(weekKey, day) {
  const m = /^([0-9]{4})-W([0-9]{2})$/.exec(safeString(weekKey));
  const dayNum = Number(day);
  if (!m || !Number.isInteger(dayNum) || dayNum < 1 || dayNum > 7) return "";
  const year = Number(m[1]);
  const week = Number(m[2]);
  const firstWeek = startOfWeekMon(new Date(year, 0, 1));
  const target = new Date(firstWeek.getFullYear(), firstWeek.getMonth(), firstWeek.getDate() + (week - 1) * 7 + dayNum - 1);
  return formatYmd(target);
}

function todoDateKey(todo) {
  const direct = safeString(todo && todo.date);
  return parseYmd(direct) ? direct : "";
}

function formatDateTitle(dateText) {
  const d = parseYmd(dateText);
  if (!d) return "未指定日期";
  const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  return `${dateText} ${weekdays[d.getDay()]}`;
}

function formatTodoDateBadge(dateText) {
  const d = parseYmd(dateText);
  if (!d) {
    return { label: "稍后安排", tone: "later", title: "未指定日期" };
  }
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const targetStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((targetStart.getTime() - todayStart.getTime()) / 86400000);
  const mmdd = `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays);
    return {
      label: `${mmdd} 逾${overdueDays}天`,
      tone: overdueDays >= 7 ? "overdue-severe" : "overdue",
      title: `${formatDateTitle(dateText)}，已逾期 ${overdueDays} 天`,
    };
  }
  if (diffDays === 0) {
    return {
      label: `${mmdd} 今`,
      tone: "today",
      title: `${formatDateTitle(dateText)}，今天到期`,
    };
  }
  return {
    label: `${mmdd} ${diffDays}天`,
    tone: diffDays <= 7 ? "future-near" : "future-far",
    title: `${formatDateTitle(dateText)}，距离今天还有 ${diffDays} 天`,
  };
}

function engineIconUrl(engine) {
  if (!engine) return [];
  const target = safeString(engine.homeUrl) || safeString(engine.searchUrl);
  if (!target) return [];
  return resolveIconCandidates(target);
}

function engineFallbackIcon(name) {
  const text = safeString(name).slice(0, 1) || "·";
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#eef3f6"/><text x="32" y="40" font-size="28" text-anchor="middle" fill="#223236" font-family="Segoe UI, PingFang SC, Microsoft YaHei">${text}</text></svg>`)}`;
}

function siteIconFallback(url, title) {
  const label = siteKeyFromUrl(url) || hostFromUrl(url) || safeString(title);
  return engineFallbackIcon(label);
}

function hydrateLinkIcons() {
  if (!els.grid) return;
  const nodes = Array.from(els.grid.querySelectorAll(".site-ico[data-icon-urls]"));
  nodes.forEach((img) => {
    const urls = safeString(img.getAttribute("data-icon-urls"))
      .split("\n")
      .map((item) => safeString(item))
      .filter(Boolean);
    if (!urls.length) return;
    img.src = safeString(img.getAttribute("data-icon-fallback")) || iconPlaceholder();
    loadIconMaybe(img, urls);
  });
}

function loadIconMaybe(img, urls, index = 0) {
  if (!img || !Array.isArray(urls) || !urls.length || index >= urls.length) return;
  const url = safeString(urls[index]);
  if (!url) {
    loadIconMaybe(img, urls, index + 1);
    return;
  }
  const cacheKey = urls.join("|");
  if (index === 0) {
    if (img.dataset.loadedIcon === cacheKey) return;
    img.dataset.loadedIcon = cacheKey;
  }
  const probe = new Image();
  let done = false;
  const timer = window.setTimeout(() => {
    done = true;
    loadIconMaybe(img, urls, index + 1);
  }, 1200);
  probe.onload = () => {
    if (done) return;
    done = true;
    window.clearTimeout(timer);
    img.src = url;
  };
  probe.onerror = () => {
    if (done) return;
    done = true;
    window.clearTimeout(timer);
    loadIconMaybe(img, urls, index + 1);
  };
  probe.src = url;
}

function iconPlaceholder() {
  return "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
}

function nextSaturdayStart(now) {
  const day = now.getDay();
  const delta = (6 - day + 7) % 7;
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + delta, 0, 0, 0, 0);
  if (target <= now) {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() + delta + 7, 0, 0, 0, 0);
  }
  return target;
}

function formatCountdown(target, now, doneText) {
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return doneText;
  const days = Math.ceil(diff / 86400000);
  return `还有 ${days} 天`;
}

function getNearestHoliday(now) {
  const today = formatYmd(now);
  const holidays = [...state.db.plan.holidays].sort((a, b) => a.startDate.localeCompare(b.startDate));
  if (!holidays.length) return null;

  const inHoliday = holidays.find((h) => h.startDate <= today && h.endDate >= today);
  if (inHoliday) {
    return { inHoliday: true, name: inHoliday.name, days: 0 };
  }

  const next = holidays.find((h) => h.startDate >= today);
  if (!next) return null;
  const target = parseYmd(next.startDate);
  if (!target) return null;
  const days = Math.ceil((target.getTime() - new Date(formatYmd(now)).getTime()) / 86400000);
  return { inHoliday: false, name: next.name, days };
}

function saveDb() {
  if (state.ui.readOnly) return false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.db));
    return true;
  } catch (_error) {
    state.ui.readOnly = true;
    toast("存储不可用", "本地存储写入失败，已进入只读模式。", true);
    return false;
  }
}

function safeReadStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch (_error) {
    return null;
  }
}

function closeHashModal() {
  if (!window.location.hash) return;
  window.location.hash = "";
}

function openExternal(url) {
  window.open(url, "_blank", "noopener,noreferrer");
}

function toast(title, message, isError, action) {
  if (!els.toast || !els.toastTitle) return;
  els.toastTitle.textContent = title || "提示";
  if (els.toastText) {
    els.toastText.textContent = message || title;
  }
  if (els.toastActionBtn) {
    els.toastActionBtn.hidden = !(action && typeof action.onClick === "function");
    els.toastActionBtn.textContent = action && action.label ? action.label : "撤销";
    els.toastActionBtn.onclick = action && typeof action.onClick === "function"
      ? () => {
        const fn = action.onClick;
        els.toastActionBtn.hidden = true;
        els.toast.style.display = "none";
        fn();
      }
      : null;
  }
  els.toast.style.display = "flex";
  els.toast.style.opacity = isError ? "0.98" : "0.92";
  if (state.ui.toastTimer) {
    window.clearTimeout(state.ui.toastTimer);
  }
  state.ui.toastTimer = window.setTimeout(() => {
    if (els.toastActionBtn) {
      els.toastActionBtn.hidden = true;
      els.toastActionBtn.onclick = null;
    }
    els.toast.style.display = "none";
  }, action ? 4200 : 2200);
}

function isValidHttpUrl(value) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_error) {
    return false;
  }
}

function isLikelyUrlTemplate(value) {
  if (!value) return false;
  const sample = value.includes("{q}") ? value.replace(/\{q\}/g, "test") : value;
  return isValidHttpUrl(sample);
}

function uid(prefix) {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return `${prefix}-${window.crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function safeString(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function escHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escAttr(value) {
  return escHtml(value);
}

function hashCode(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
