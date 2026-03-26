"use strict";

function defaultDb() {
  const now = Date.now();
  const categories = [
    { id: "cat-dev", name: "开发", order: 10, colorToken: "sky", createdAt: now, updatedAt: now },
    { id: "cat-ai", name: "AI 工具", order: 20, colorToken: "mint", createdAt: now, updatedAt: now },
    { id: "cat-collab", name: "协作", order: 30, colorToken: "lilac", createdAt: now, updatedAt: now },
    { id: "cat-ops", name: "运营", order: 40, colorToken: "coral", createdAt: now, updatedAt: now },
  ];
  const links = [
    { id: uid("link"), categoryId: "cat-dev", title: "GitHub", url: "https://github.com/", note: "", order: 10, createdAt: now, updatedAt: now },
    { id: uid("link"), categoryId: "cat-dev", title: "Google", url: "https://www.google.com/", note: "", order: 20, createdAt: now, updatedAt: now },
    { id: uid("link"), categoryId: "cat-dev", title: "百度", url: "https://www.baidu.com/", note: "", order: 30, createdAt: now, updatedAt: now },
    { id: uid("link"), categoryId: "cat-dev", title: "DeepSeek", url: "https://www.deepseek.com/", note: "", order: 40, createdAt: now, updatedAt: now },
    { id: uid("link"), categoryId: "cat-dev", title: "GLM", url: "https://chatglm.cn/", note: "", order: 50, createdAt: now, updatedAt: now },
    { id: uid("link"), categoryId: "cat-dev", title: "豆包", url: "https://www.doubao.com/", note: "", order: 60, createdAt: now, updatedAt: now },
    { id: uid("link"), categoryId: "cat-dev", title: "Trending", url: "https://github.com/trending", note: "", order: 70, createdAt: now, updatedAt: now },
    { id: uid("link"), categoryId: "cat-dev", title: "DeepSeek Docs", url: "https://api-docs.deepseek.com/", note: "", order: 80, createdAt: now, updatedAt: now },
    { id: uid("link"), categoryId: "cat-ai", title: "OpenAI", url: "https://platform.openai.com/", note: "", order: 10, createdAt: now, updatedAt: now },
    { id: uid("link"), categoryId: "cat-ai", title: "Claude", url: "https://claude.ai/", note: "", order: 20, createdAt: now, updatedAt: now },
    { id: uid("link"), categoryId: "cat-ai", title: "Kimi", url: "https://kimi.moonshot.cn/", note: "", order: 30, createdAt: now, updatedAt: now },
    { id: uid("link"), categoryId: "cat-ai", title: "通义千问", url: "https://tongyi.aliyun.com/", note: "", order: 40, createdAt: now, updatedAt: now },
    { id: uid("link"), categoryId: "cat-ai", title: "Poe", url: "https://poe.com/", note: "", order: 50, createdAt: now, updatedAt: now },
    { id: uid("link"), categoryId: "cat-ai", title: "Perplexity", url: "https://www.perplexity.ai/", note: "", order: 60, createdAt: now, updatedAt: now },
    { id: uid("link"), categoryId: "cat-collab", title: "飞书", url: "https://www.feishu.cn/", note: "", order: 10, createdAt: now, updatedAt: now },
    { id: uid("link"), categoryId: "cat-collab", title: "钉钉", url: "https://www.dingtalk.com/", note: "", order: 20, createdAt: now, updatedAt: now },
    { id: uid("link"), categoryId: "cat-collab", title: "腾讯文档", url: "https://docs.qq.com/", note: "", order: 30, createdAt: now, updatedAt: now },
    { id: uid("link"), categoryId: "cat-collab", title: "Notion", url: "https://www.notion.so/", note: "", order: 40, createdAt: now, updatedAt: now },
    { id: uid("link"), categoryId: "cat-ops", title: "Google Analytics", url: "https://analytics.google.com/", note: "", order: 10, createdAt: now, updatedAt: now },
    { id: uid("link"), categoryId: "cat-ops", title: "Search Console", url: "https://search.google.com/search-console/", note: "", order: 20, createdAt: now, updatedAt: now },
    { id: uid("link"), categoryId: "cat-ops", title: "百度统计", url: "https://tongji.baidu.com/", note: "", order: 30, createdAt: now, updatedAt: now },
  ];
  return {
    version: DB_VERSION,
    settings: {
      activeEngineId: "eng-google",
      engines: presetEngines(now),
      enginePresetOrder: COMMON_ENGINES.map((item) => item.id),
      ui: { mode: "browse" },
      motto: { mode: "daily", lastDate: "", quoteId: "" },
    },
    categories,
    links,
    activeCategoryId: "cat-dev",
    plan: {
      weekStart: "mon",
      selectedDate: "",
      calendarMonth: formatYm(new Date(now)),
      todoView: "week",
      sceneFilter: "",
      todos: [],
      workdays: [],
      holidays: [
        { id: uid("holiday"), name: "清明节", startDate: "2026-04-04", endDate: "2026-04-06", createdAt: now, updatedAt: now },
        { id: uid("holiday"), name: "劳动节", startDate: "2026-05-01", endDate: "2026-05-05", createdAt: now, updatedAt: now },
      ],
    },
  };
}

function loadDb() {
  const fallback = validateAndNormalize(defaultDb());
  const raw = safeReadStorage(STORAGE_KEY);
  if (!raw) return fallback;
  try {
    return validateAndNormalize(JSON.parse(raw));
  } catch (_error) {
    return fallback;
  }
}

function validateAndNormalize(input) {
  const fallback = defaultDb();
  if (!input || typeof input !== "object") return fallback;

  const source = {
    version: Number(input.version) || DB_VERSION,
    settings: input.settings || {},
    categories: Array.isArray(input.categories) ? input.categories : [],
    links: Array.isArray(input.links) ? input.links : [],
    activeCategoryId: input.activeCategoryId,
    plan: input.plan || {},
  };

  const now = Date.now();
  const categories = source.categories
    .map((cat, index) => normalizeCategory(cat, index, now))
    .filter(Boolean);

  if (!categories.length) {
    return fallback;
  }

  const categoryIds = new Set(categories.map((cat) => cat.id));
  const links = source.links
    .map((link, index) => normalizeLink(link, index, now))
    .filter(Boolean)
    .map((link) => {
      if (!categoryIds.has(link.categoryId)) {
        return { ...link, categoryId: categories[0].id };
      }
      return link;
    });

  const engines = (Array.isArray(source.settings.engines) ? source.settings.engines : [])
    .map((item, index) => normalizeEngine(item, index, now))
    .filter(Boolean);
  const normalizedEngines = engines.length ? engines : presetEngines(now);
  const normalizedPresetOrder = normalizeEnginePresetOrder(source.settings.enginePresetOrder);
  const activeEngineId = safeString(source.settings.activeEngineId);
  const normalizedActiveEngineId = normalizedEngines.some((item) => item.id === activeEngineId)
    ? activeEngineId
    : ((normalizedEngines[0] && normalizedEngines[0].id) || "");
  const mode = source.settings.ui && source.settings.ui.mode === "manage" ? "manage" : "browse";
  const motto = source.settings.motto && typeof source.settings.motto === "object" ? source.settings.motto : {};
  const activeCategoryId = source.activeCategoryId === ALL_CATEGORY_ID || categoryIds.has(source.activeCategoryId)
    ? source.activeCategoryId
    : categories[0].id;

  const plan = normalizePlan(source.plan, now);

  return {
    version: DB_VERSION,
    settings: {
      activeEngineId: normalizedActiveEngineId,
      engines: normalizedEngines,
      enginePresetOrder: normalizedPresetOrder,
      ui: { mode },
      motto: {
        mode: "daily",
        lastDate: typeof motto.lastDate === "string" ? motto.lastDate : "",
        quoteId: typeof motto.quoteId === "string" ? motto.quoteId : "",
      },
    },
    categories: categories.sort((a, b) => a.order - b.order),
    links: links.sort((a, b) => a.order - b.order),
    activeCategoryId,
    plan,
  };
}

function normalizeEngine(engine, index, now) {
  if (!engine || typeof engine !== "object") return null;
  const name = safeString(engine.name);
  const searchUrl = safeString(engine.searchUrl);
  const homeUrl = safeString(engine.homeUrl);
  if (!name || !searchUrl) return null;
  const id = safeString(engine.id) || uid("eng");
  const createdAt = Number.isFinite(Number(engine.createdAt)) ? Number(engine.createdAt) : now;
  const updatedAt = Number.isFinite(Number(engine.updatedAt)) ? Number(engine.updatedAt) : now;
  const order = Number.isFinite(Number(engine.order)) ? Number(engine.order) : (index + 1) * 10;
  return { id, name, searchUrl, homeUrl, order, createdAt, updatedAt };
}

function normalizeEnginePresetOrder(input) {
  const ids = Array.isArray(input) ? input.map((item) => safeString(item)).filter(Boolean) : [];
  const known = COMMON_ENGINES.map((item) => item.id);
  const set = new Set();
  const result = [];
  ids.forEach((id) => {
    if (!known.includes(id) || set.has(id)) return;
    set.add(id);
    result.push(id);
  });
  known.forEach((id) => {
    if (set.has(id)) return;
    result.push(id);
  });
  return result;
}

function presetEngines(now) {
  return COMMON_ENGINES
    .filter((engine) => DEFAULT_ENGINE_IDS.has(engine.id))
    .map((engine, index) => ({
    id: engine.id,
    name: engine.name,
    searchUrl: engine.searchUrl,
    homeUrl: engine.homeUrl,
    order: (index + 1) * 10,
    createdAt: now,
    updatedAt: now,
    }));
}

function normalizePlan(input, now) {
  const source = input && typeof input === "object" ? input : {};
  const selectedDate = parseYmd(safeString(source.selectedDate)) ? safeString(source.selectedDate) : "";
  const calendarMonth = /^\d{4}-\d{2}$/.test(safeString(source.calendarMonth)) ? safeString(source.calendarMonth) : formatYm(new Date(now));
  const weekStart = "mon";
  const todoView = safeString(source.todoView) === "month" ? "month" : "week";
  const sceneFilter = ["", "work", "life", "study", "other"].includes(safeString(source.sceneFilter))
    ? safeString(source.sceneFilter)
    : "";
  const todos = (Array.isArray(source.todos) ? source.todos : [])
    .map((todo, index) => normalizeTodo(todo, index, now))
    .filter(Boolean);

  const legacyMonthTodos = (Array.isArray(source.monthTodos) ? source.monthTodos : [])
    .map((todo, index) => normalizeMonthTodo(todo, index, now))
    .filter(Boolean)
    .map((todo, index) => normalizeTodo({
      id: todo.id,
      title: todo.title,
      date: lastDayOfMonthYmd(todo.monthKey),
      priority: "medium",
      scene: "other",
      done: todo.done,
      order: Number.isFinite(Number(todo.order)) ? Number(todo.order) : (index + 1) * 10,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt,
    }, index, now));

  const mergedTodos = [...todos, ...legacyMonthTodos]
    .sort((a, b) => a.order - b.order);
  const holidays = (Array.isArray(source.holidays) ? source.holidays : [])
    .map((holiday, index) => normalizeHoliday(holiday, index, now))
    .filter(Boolean)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  const workdays = [...new Set((Array.isArray(source.workdays) ? source.workdays : [])
    .map((item) => safeString(item))
    .filter((item) => Boolean(parseYmd(item))))].sort();
  return {
    weekStart,
    selectedDate,
    calendarMonth,
    todoView,
    sceneFilter,
    todos: mergedTodos,
    workdays,
    holidays,
  };
}

function normalizeTodo(todo, index, now) {
  if (!todo || typeof todo !== "object") return null;
  const title = safeString(todo.title);
  if (!title) return null;
  let date = parseYmd(safeString(todo.date)) ? safeString(todo.date) : "";
  if (!date) {
    const monthKey = /^\d{4}-\d{2}$/.test(safeString(todo.monthKey)) ? safeString(todo.monthKey) : "";
    if (monthKey) {
      date = lastDayOfMonthYmd(monthKey);
    } else {
      const dayRaw = safeString(todo.day);
      const dayNum = Number(dayRaw);
      const weekKey = /^\d{4}-W\d{2}$/.test(safeString(todo.weekKey)) ? safeString(todo.weekKey) : "";
      if (weekKey && Number.isInteger(dayNum) && dayNum >= 1 && dayNum <= 7) {
        date = dateFromWeekKeyAndDay(weekKey, dayNum);
      }
    }
  }
  const order = Number.isFinite(Number(todo.order)) ? Number(todo.order) : (index + 1) * 10;
  const priority = ["high", "medium", "low"].includes(safeString(todo.priority)) ? safeString(todo.priority) : "medium";
  const scene = ["work", "life", "study", "other"].includes(safeString(todo.scene)) ? safeString(todo.scene) : "other";
  const done = Boolean(todo.done);
  const archived = done && Boolean(todo.archived);
  const archivedAt = archived && Number.isFinite(Number(todo.archivedAt)) ? Number(todo.archivedAt) : 0;
  return {
    id: safeString(todo.id) || uid("todo"),
    title,
    date,
    priority,
    scene,
    done,
    archived,
    archivedAt,
    order,
    createdAt: Number.isFinite(Number(todo.createdAt)) ? Number(todo.createdAt) : now,
    updatedAt: Number.isFinite(Number(todo.updatedAt)) ? Number(todo.updatedAt) : now,
  };
}

function normalizeMonthTodo(todo, index, now) {
  if (!todo || typeof todo !== "object") return null;
  const title = safeString(todo.title);
  if (!title) return null;
  const monthKey = safeString(todo.monthKey);
  if (!/^\d{4}-\d{2}$/.test(monthKey)) return null;
  const order = Number.isFinite(Number(todo.order)) ? Number(todo.order) : (index + 1) * 10;
  return {
    id: safeString(todo.id) || uid("mtodo"),
    title,
    monthKey,
    done: Boolean(todo.done),
    order,
    createdAt: Number.isFinite(Number(todo.createdAt)) ? Number(todo.createdAt) : now,
    updatedAt: Number.isFinite(Number(todo.updatedAt)) ? Number(todo.updatedAt) : now,
  };
}

function endOfWeekMon(date) {
  const ws = startOfWeekMon(date);
  return new Date(ws.getFullYear(), ws.getMonth(), ws.getDate() + 6);
}

function lastDayOfMonthYmd(monthKey) {
  const base = parseYm(monthKey);
  if (!base) return "";
  const last = new Date(base.getFullYear(), base.getMonth() + 1, 0);
  return formatYmd(last);
}

function normalizeHoliday(holiday, index, now) {
  if (!holiday || typeof holiday !== "object") return null;
  const name = safeString(holiday.name);
  const startDate = safeString(holiday.startDate);
  const endDate = safeString(holiday.endDate);
  if (!name || !parseYmd(startDate) || !parseYmd(endDate) || startDate > endDate) return null;
  return {
    id: safeString(holiday.id) || uid("holiday"),
    name,
    startDate,
    endDate,
    createdAt: Number.isFinite(Number(holiday.createdAt)) ? Number(holiday.createdAt) : now,
    updatedAt: Number.isFinite(Number(holiday.updatedAt)) ? Number(holiday.updatedAt) : now,
    order: Number.isFinite(Number(holiday.order)) ? Number(holiday.order) : (index + 1) * 10,
  };
}

function normalizeCategory(cat, index, now) {
  if (!cat || typeof cat !== "object") return null;
  const id = safeString(cat.id) || uid("cat");
  const name = safeString(cat.name) || `分类 ${index + 1}`;
  const colorToken = COLOR_TOKENS.has(cat.colorToken) ? cat.colorToken : "slate";
  const order = Number.isFinite(Number(cat.order)) ? Number(cat.order) : (index + 1) * 10;
  return {
    id,
    name,
    order,
    colorToken,
    createdAt: Number.isFinite(Number(cat.createdAt)) ? Number(cat.createdAt) : now,
    updatedAt: Number.isFinite(Number(cat.updatedAt)) ? Number(cat.updatedAt) : now,
  };
}

function normalizeLink(link, index, now) {
  if (!link || typeof link !== "object") return null;
  const id = safeString(link.id) || uid("link");
  const title = safeString(link.title) || "未命名链接";
  const url = safeString(link.url);
  if (!isValidHttpUrl(url)) return null;
  const order = Number.isFinite(Number(link.order)) ? Number(link.order) : (index + 1) * 10;
  return {
    id,
    categoryId: safeString(link.categoryId) || "",
    title,
    url,
    note: safeString(link.note),
    order,
    createdAt: Number.isFinite(Number(link.createdAt)) ? Number(link.createdAt) : now,
    updatedAt: Number.isFinite(Number(link.updatedAt)) ? Number(link.updatedAt) : now,
  };
}
