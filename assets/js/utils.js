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
  const locked = !state.ui.fileSync.handle;
  const holidays = [...state.db.plan.holidays].sort((a, b) => a.startDate.localeCompare(b.startDate));
  if (!holidays.length) {
    const msg = state.ui.holidayAutoStatus === "loading"
      ? "正在自动获取假日数据..."
      : "暂时没有假日数据，可手动添加一条。";
    els.holidayList.innerHTML = `<div class="todo-empty">${msg}</div>`;
    return;
  }
  els.holidayList.innerHTML = holidays.map((holiday) => `
    <article class="holiday-row">
      <div class="holiday-row-main">
        <div class="dot" aria-hidden="true"></div>
        <div class="holiday-row-name">${escHtml(holiday.name)}</div>
        <div class="holiday-row-date">${escHtml(holiday.startDate)} - ${escHtml(holiday.endDate)}</div>
      </div>
      <button type="button" class="toolbtn sm ghost danger holiday-row-delete ${locked ? "is-disabled" : ""}" data-action="delete-holiday" data-holiday-id="${escAttr(holiday.id)}" title="${escAttr(locked ? "请先绑定同步文件后再删除假日" : `删除假日 ${holiday.name}`)}" aria-label="删除假日 ${escAttr(holiday.name)}" ${locked ? 'disabled aria-disabled="true"' : ""}>
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
    saveDb({ showPrompt: false });
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
    return { label: "稍后安排", tone: "later", title: "未指定日期", detail: "未指定截止日期" };
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
      detail: `待办截止：已逾期 ${overdueDays} 天`,
    };
  }
  if (diffDays === 0) {
    return {
      label: `${mmdd} 今天`,
      tone: "today",
      title: `${formatDateTitle(dateText)}，今天到期`,
      detail: "待办截止：今天到期",
    };
  }
  return {
    label: `${mmdd} ${diffDays}天`,
    tone: diffDays <= 7 ? "future-near" : "future-far",
    title: `${formatDateTitle(dateText)}，距离今天还有 ${diffDays} 天`,
    detail: `待办截止：还有 ${diffDays} 天`,
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

function supportsLocalFileSync() {
  return typeof window.showOpenFilePicker === "function" || typeof window.showSaveFilePicker === "function";
}

function fileSyncIdleMessage() {
  return "未绑定同步文件。请先绑定本地 JSON 文件，后续改动才会直接写入文件。";
}

function snapshotDb(db) {
  const source = db || state.db || defaultDb();
  return JSON.stringify(source);
}

function updateFileSyncSnapshot(db) {
  state.ui.fileSync.snapshot = snapshotDb(db);
}

function restoreDbFromSnapshot() {
  const raw = safeString(state.ui.fileSync.snapshot).trim();
  if (!raw) {
    state.db = validateAndNormalize(defaultDb());
    updateFileSyncSnapshot(state.db);
    return;
  }
  try {
    state.db = validateAndNormalize(JSON.parse(raw));
  } catch (_error) {
    state.db = validateAndNormalize(defaultDb());
    updateFileSyncSnapshot(state.db);
  }
}

function openDataSyncModal() {
  window.location.hash = "#modal-data-sync";
}

function requireBoundFile(actionLabel) {
  const label = safeString(actionLabel) || "保存改动";
  if (state.ui.fileSync.handle) return true;
  toast("请先绑定同步文件", `${label}前请先绑定本地 JSON 文件。`, true, {
    label: "去绑定",
    onClick: openDataSyncModal,
  });
  return false;
}

function hydrateFileSyncMeta() {
  const sync = state.ui.fileSync;
  const supported = supportsLocalFileSync();
  let parsed = null;
  const raw = safeReadStorage(FILE_SYNC_META_KEY);
  if (raw) {
    try {
      parsed = JSON.parse(raw);
    } catch (_error) {
      parsed = null;
    }
  }
  sync.supported = supported;
  sync.enabled = !!(parsed && parsed.enabled);
  sync.fileName = safeString(parsed && parsed.fileName);
  const lastSyncedAt = Number(parsed && parsed.lastSyncedAt);
  sync.lastSyncedAt = Number.isFinite(lastSyncedAt) ? lastSyncedAt : 0;
  sync.status = supported ? (sync.enabled ? "idle" : "idle") : "unsupported";
  sync.message = supported
    ? (sync.enabled && sync.fileName ? `正在恢复本地同步文件：${sync.fileName}` : fileSyncIdleMessage())
    : "当前环境不支持自动同步，请继续使用导入/导出备份。";
}

function persistFileSyncMeta() {
  try {
    localStorage.setItem(FILE_SYNC_META_KEY, JSON.stringify({
      enabled: !!state.ui.fileSync.enabled,
      fileName: safeString(state.ui.fileSync.fileName),
      lastSyncedAt: Number(state.ui.fileSync.lastSyncedAt) || 0,
    }));
  } catch (_error) {
    // ignore metadata persistence failures; main app storage already handles read-only mode separately
  }
}

function setFileSyncState(patch, options) {
  const next = patch && typeof patch === "object" ? patch : {};
  const settings = options && typeof options === "object" ? options : {};
  Object.assign(state.ui.fileSync, next);
  if (settings.persist !== false) {
    persistFileSyncMeta();
  }
  if (settings.render !== false && typeof renderDataSyncStatus === "function") {
    renderDataSyncStatus();
  }
}

function formatFileSyncTime(timestamp) {
  if (!Number.isFinite(Number(timestamp)) || Number(timestamp) <= 0) return "尚未同步";
  const diff = Date.now() - Number(timestamp);
  if (diff < 60000) return "刚刚";
  if (diff < 3600000) return `${Math.max(1, Math.round(diff / 60000))} 分钟前`;
  if (diff < 86400000) return `${Math.max(1, Math.round(diff / 3600000))} 小时前`;
  return new Date(Number(timestamp)).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function openFileSyncDb() {
  if (!window.indexedDB) return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(FILE_SYNC_DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(FILE_SYNC_STORE_NAME)) {
          db.createObjectStore(FILE_SYNC_STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch (_error) {
      resolve(null);
    }
  });
}

async function saveStoredFileHandle(handle) {
  const db = await openFileSyncDb();
  if (!db) return false;
  return new Promise((resolve) => {
    const tx = db.transaction(FILE_SYNC_STORE_NAME, "readwrite");
    tx.objectStore(FILE_SYNC_STORE_NAME).put(handle, FILE_SYNC_HANDLE_KEY);
    tx.oncomplete = () => {
      db.close();
      resolve(true);
    };
    tx.onerror = () => {
      db.close();
      resolve(false);
    };
  });
}

async function loadStoredFileHandle() {
  const db = await openFileSyncDb();
  if (!db) return null;
  return new Promise((resolve) => {
    const tx = db.transaction(FILE_SYNC_STORE_NAME, "readonly");
    const request = tx.objectStore(FILE_SYNC_STORE_NAME).get(FILE_SYNC_HANDLE_KEY);
    request.onsuccess = () => {
      db.close();
      resolve(request.result || null);
    };
    request.onerror = () => {
      db.close();
      resolve(null);
    };
  });
}

async function clearStoredFileHandle() {
  const db = await openFileSyncDb();
  if (!db) return false;
  return new Promise((resolve) => {
    const tx = db.transaction(FILE_SYNC_STORE_NAME, "readwrite");
    tx.objectStore(FILE_SYNC_STORE_NAME).delete(FILE_SYNC_HANDLE_KEY);
    tx.oncomplete = () => {
      db.close();
      resolve(true);
    };
    tx.onerror = () => {
      db.close();
      resolve(false);
    };
  });
}

async function ensureFileSyncPermission(handle, interactive) {
  return ensureFileHandlePermission(handle, interactive, "readwrite");
}

async function ensureFileHandlePermission(handle, interactive, mode) {
  if (!handle) return false;
  try {
    if (typeof handle.queryPermission === "function") {
      const current = await handle.queryPermission({ mode });
      if (current === "granted") return true;
      if (!interactive) return false;
    }
    if (interactive && typeof handle.requestPermission === "function") {
      const next = await handle.requestPermission({ mode });
      return next === "granted";
    }
    return interactive;
  } catch (_error) {
    return false;
  }
}

async function readTextFromFileHandle(handle, interactive) {
  if (!handle) return null;
  const allowed = await ensureFileHandlePermission(handle, interactive, "read");
  if (!allowed) return null;
  try {
    const file = await handle.getFile();
    return await file.text();
  } catch (_error) {
    return null;
  }
}

async function loadDbFromBoundFile(options) {
  const settings = options && typeof options === "object" ? options : {};
  const interactive = !!settings.interactive;
  const showSuccess = !!settings.showSuccess;
  const closeAfterSuccess = !!settings.closeAfterSuccess;
  const sync = state.ui.fileSync;
  if (!sync.handle) {
    if (interactive) {
      toast("未绑定文件", "请先绑定本地 JSON 文件。", true);
    }
    return false;
  }

  const fileName = sync.fileName || sync.handle.name || FILE_SYNC_SUGGESTED_NAME;
  setFileSyncState({
    enabled: true,
    fileName,
    status: "syncing",
    message: `正在读取 ${fileName}...`,
  });

  const text = await readTextFromFileHandle(sync.handle, interactive);
  if (text === null) {
    setFileSyncState({
      enabled: true,
      fileName,
      status: interactive ? "error" : "permission",
      message: interactive
        ? `读取 ${fileName} 失败，请检查权限后重试。`
        : `已绑定 ${fileName}，需要重新授权后才能读取文件。`,
    });
    if (interactive) {
      toast("读取失败", "无法读取本地同步文件，请检查权限。", true);
    }
    return false;
  }

  const normalizedText = typeof text === "string" ? text.replace(/^\uFEFF/, "").trim() : "";
  if (!normalizedText) {
    setFileSyncState({
      enabled: true,
      fileName,
      status: "idle",
      message: `已绑定 ${fileName}，文件为空，可先从浏览器写入。`,
    });
    if (interactive) {
      toast("文件为空", `已绑定 ${fileName}，可点击“浏览器 -> 本地文件”初始化数据。`, true);
    }
    return false;
  }

  let parsed = null;
  try {
    parsed = JSON.parse(normalizedText);
  } catch (_error) {
    setFileSyncState({
      enabled: true,
      fileName,
      status: "error",
      message: `${fileName} 不是合法的 JSON 文件。`,
    });
    if (interactive) {
      toast("同步失败", "本地文件不是合法的 JSON。", true);
    }
    return false;
  }

  const normalized = validateAndNormalize(parsed);
  state.db = normalized;
  updateFileSyncSnapshot(normalized);
  setFileSyncState({
    enabled: true,
    fileName,
    status: "success",
    message: `已绑定 ${fileName}，当前浏览器数据已与文件一致。`,
  });
  renderAll();
  if (closeAfterSuccess) {
    closeHashModal();
  }
  if (showSuccess) {
    toast("已从本地同步", `已读取 ${fileName}`);
  }
  return true;
}

async function chooseLocalFileHandle() {
  const pickerOptions = {
    excludeAcceptAllOption: false,
    multiple: false,
    types: [
      {
        description: "JSON Files",
        accept: { "application/json": [".json"] },
      },
    ],
  };

  if (typeof window.showOpenFilePicker === "function") {
    const handles = await window.showOpenFilePicker(pickerOptions);
    return Array.isArray(handles) ? handles[0] || null : null;
  }

  if (typeof window.showSaveFilePicker === "function") {
    return window.showSaveFilePicker({
      suggestedName: state.ui.fileSync.fileName || FILE_SYNC_SUGGESTED_NAME,
      types: pickerOptions.types,
    });
  }

  return null;
}

async function writeDbToBoundFile(options) {
  const settings = options && typeof options === "object" ? options : {};
  const interactive = !!settings.interactive;
  const showSuccess = !!settings.showSuccess;
  const sync = state.ui.fileSync;
  if (!sync.supported || !sync.handle) {
    if (interactive) toast("未绑定文件", "请先绑定本地 JSON 文件。", true);
    return false;
  }

  const fileName = sync.fileName || sync.handle.name || FILE_SYNC_SUGGESTED_NAME;
  const allowed = await ensureFileSyncPermission(sync.handle, interactive);
  if (!allowed) {
    setFileSyncState({
      status: "permission",
      message: `已绑定 ${fileName}，需要重新授权后才能继续同步。`,
    });
    if (interactive) {
      toast("需要授权", "请允许写入本地文件后再同步。", true);
    }
    return false;
  }

  setFileSyncState({
    enabled: true,
    fileName,
    status: "syncing",
    message: `正在同步到 ${fileName}...`,
  });

  try {
    const writable = await sync.handle.createWritable();
    await writable.write(JSON.stringify(state.db, null, 2));
    await writable.close();
    const now = Date.now();
    setFileSyncState({
      enabled: true,
      fileName,
      lastSyncedAt: now,
      status: "success",
      message: `已绑定 ${fileName}，上次同步：${formatFileSyncTime(now)}`,
    });
    updateFileSyncSnapshot(state.db);
    if (showSuccess) {
      toast("已同步", `已写入 ${fileName}`);
    }
    return true;
  } catch (_error) {
    setFileSyncState({
      enabled: true,
      fileName,
      status: "error",
      message: `同步失败，请检查 ${fileName} 的写入权限后重试。`,
    });
    if (interactive) {
      toast("同步失败", "写入本地文件失败，请重新绑定或检查权限。", true);
    }
    return false;
  }
}

function queueFileSync(options) {
  const run = () => writeDbToBoundFile(options);
  state.ui.fileSync.writeChain = Promise.resolve(state.ui.fileSync.writeChain).then(run, run);
  return state.ui.fileSync.writeChain;
}

function scheduleAutoFileSync() {
  const sync = state.ui.fileSync;
  if (!sync.supported || !sync.enabled || !sync.handle) return;
  void queueFileSync({ interactive: false, showSuccess: false });
}

async function bindLocalFileSync() {
  if (!supportsLocalFileSync()) {
    setFileSyncState({
      supported: false,
      status: "unsupported",
      message: "当前环境不支持文件同步，请改用支持文件选择器的浏览器。",
    });
    toast("当前环境不支持", "当前浏览器不支持绑定本地文件。", true);
    return false;
  }

  try {
    const handle = await chooseLocalFileHandle();
    if (!handle) return false;
    await saveStoredFileHandle(handle);
    const fileName = safeString(handle.name) || FILE_SYNC_SUGGESTED_NAME;
    setFileSyncState({
      supported: true,
      enabled: true,
      handle,
      fileName,
    });
    const text = await readTextFromFileHandle(handle, true);
    if (text === null) {
      setFileSyncState({
        enabled: true,
        handle,
        fileName,
        status: "error",
        message: `已绑定 ${fileName}，但暂时无法读取文件。`,
      });
      toast("绑定失败", `无法读取 ${fileName}。`, true);
      return false;
    }

    const normalizedText = typeof text === "string" ? text.replace(/^\uFEFF/, "").trim() : "";
    if (!normalizedText) {
      return queueFileSync({ interactive: true, showSuccess: true });
    }

    try {
      state.db = validateAndNormalize(JSON.parse(normalizedText));
      updateFileSyncSnapshot(state.db);
      setFileSyncState({
        enabled: true,
        handle,
        fileName,
        status: "success",
        message: `已绑定 ${fileName}，当前浏览器数据已与文件一致。`,
      });
      renderAll();
      toast("绑定成功", `已读取 ${fileName}`);
      return true;
    } catch (_error) {
      setFileSyncState({
        enabled: true,
        handle,
        fileName,
        status: "error",
        message: `${fileName} 不是合法的 JSON 文件，请先修复后再同步。`,
      });
      toast("文件内容无效", `已绑定 ${fileName}，但文件内容不是合法 JSON。`, true);
      return false;
    }
  } catch (error) {
    if (error && error.name === "AbortError") return false;
    toast("绑定失败", "无法绑定本地文件，请稍后重试。", true);
    return false;
  }
}

async function restoreFileSyncHandle() {
  const sync = state.ui.fileSync;
  if (!sync.supported) {
    renderDataSyncStatus();
    return;
  }
  if (!sync.enabled) {
    renderDataSyncStatus();
    return;
  }
  const handle = await loadStoredFileHandle();
  if (!handle) {
    setFileSyncState({
      enabled: false,
      handle: null,
      status: "idle",
      message: fileSyncIdleMessage(),
      fileName: "",
      lastSyncedAt: 0,
    });
    return;
  }
  const fileName = sync.fileName || safeString(handle.name) || FILE_SYNC_SUGGESTED_NAME;
  const allowed = await ensureFileHandlePermission(handle, false, "readwrite");
  setFileSyncState({
    enabled: true,
    handle,
    fileName,
    status: allowed ? "success" : "permission",
    message: allowed
      ? `已绑定 ${fileName}，正在从文件恢复数据。`
      : `已绑定 ${fileName}，点击同步面板中的操作按钮后可重新授权。`,
  });
  if (allowed) {
    await loadDbFromBoundFile({ interactive: false, showSuccess: false });
  }
}

async function disableLocalFileSync() {
  await clearStoredFileHandle();
  state.db = validateAndNormalize(defaultDb());
  updateFileSyncSnapshot(state.db);
  setFileSyncState({
    enabled: false,
    handle: null,
    fileName: "",
    lastSyncedAt: 0,
    status: "idle",
      message: fileSyncIdleMessage(),
    });
  renderAll();
}

function saveDb(options) {
  const settings = options && typeof options === "object" ? options : {};
  if (state.ui.readOnly) return false;
  if (!state.ui.fileSync.handle) {
    restoreDbFromSnapshot();
    if (settings.showPrompt !== false) {
      toast("请先绑定同步文件", "当前已停用浏览器缓存，绑定文件后才能保存改动。", true, {
        label: "去绑定",
        onClick: openDataSyncModal,
      });
    }
    return false;
  }
  if (!settings.skipFileSync) {
    scheduleAutoFileSync();
  }
  return true;
}

function safeReadStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch (_error) {
    return null;
  }
}

function clearLegacyDbCache() {
  try {
    localStorage.removeItem("workhub.db");
  } catch (_error) {
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
  const tone = isError ? "error" : (action ? "action" : "success");
  els.toast.dataset.tone = tone;
  els.toastTitle.textContent = title || "提示";
  if (els.toastText) {
    els.toastText.textContent = message || title;
  }
  if (els.toastBadge) {
    els.toastBadge.textContent = isError ? "!" : (action ? "↺" : "✓");
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
  els.toast.style.opacity = isError ? "1" : "0.98";
  els.toast.setAttribute("aria-hidden", "false");
  if (state.ui.toastTimer) {
    window.clearTimeout(state.ui.toastTimer);
  }
  state.ui.toastTimer = window.setTimeout(() => {
    if (els.toastActionBtn) {
      els.toastActionBtn.hidden = true;
      els.toastActionBtn.onclick = null;
    }
    els.toast.style.display = "none";
    els.toast.setAttribute("aria-hidden", "true");
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
