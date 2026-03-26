"use strict";

const STORAGE_KEY = "workhub.db";
const EXPORT_FILE_PREFIX = "workhub-data";
const DB_VERSION = 2;
const HOLIDAY_API_BASE = "https://timor.tech/api/holiday/year";
const HOLIDAY_CACHE_PREFIX = "workhub.holidays.cache.v1.";
const HOLIDAY_CACHE_TTL_MS = 86400000 * 90;
const HOLIDAY_MANUAL_KEY = "workhub.holidays.manual.v1";
const ALL_CATEGORY_ID = "all";
const COLOR_TOKENS = new Set(["mint", "sky", "aqua", "coral", "lemon", "lilac", "slate"]);
const COMMON_ENGINES = [
  { id: "eng-google", name: "Google", searchUrl: "https://www.google.com/search?q={q}", homeUrl: "https://www.google.com/" },
  { id: "eng-baidu", name: "百度", searchUrl: "https://www.baidu.com/s?wd={q}", homeUrl: "https://www.baidu.com/" },
  { id: "eng-bing", name: "Bing", searchUrl: "https://www.bing.com/search?q={q}", homeUrl: "https://www.bing.com/" },
  { id: "eng-duckduckgo", name: "DuckDuckGo", searchUrl: "https://duckduckgo.com/?q={q}", homeUrl: "https://duckduckgo.com/" },
  { id: "eng-brave", name: "Brave", searchUrl: "https://search.brave.com/search?q={q}", homeUrl: "https://search.brave.com/" },
  { id: "eng-yahoo", name: "Yahoo", searchUrl: "https://search.yahoo.com/search?p={q}", homeUrl: "https://search.yahoo.com/" },
  { id: "eng-yandex", name: "Yandex", searchUrl: "https://yandex.com/search/?text={q}", homeUrl: "https://yandex.com/" },
  { id: "eng-sogou", name: "搜狗", searchUrl: "https://www.sogou.com/web?query={q}", homeUrl: "https://www.sogou.com/" },
  { id: "eng-360", name: "360 搜索", searchUrl: "https://www.so.com/s?q={q}", homeUrl: "https://www.so.com/" },
  { id: "eng-sm", name: "神马", searchUrl: "https://m.sm.cn/s?q={q}", homeUrl: "https://m.sm.cn/" },

  { id: "eng-deepseek", name: "DeepSeek", searchUrl: "https://www.deepseek.com/search?q={q}", homeUrl: "https://www.deepseek.com/" },
  { id: "eng-glm", name: "GLM", searchUrl: "https://chatglm.cn/?q={q}", homeUrl: "https://chatglm.cn/" },
  { id: "eng-doubao", name: "豆包", searchUrl: "https://www.doubao.com/?q={q}", homeUrl: "https://www.doubao.com/" },
  { id: "eng-openai", name: "OpenAI", searchUrl: "https://chat.openai.com/?q={q}", homeUrl: "https://chat.openai.com/" },
  { id: "eng-chatgpt", name: "ChatGPT", searchUrl: "https://chatgpt.com/?q={q}", homeUrl: "https://chatgpt.com/" },
  { id: "eng-claude", name: "Claude", searchUrl: "https://claude.ai/new?q={q}", homeUrl: "https://claude.ai/" },
  { id: "eng-gemini", name: "Gemini", searchUrl: "https://gemini.google.com/?q={q}", homeUrl: "https://gemini.google.com/" },
  { id: "eng-perplexity", name: "Perplexity", searchUrl: "https://www.perplexity.ai/search?q={q}", homeUrl: "https://www.perplexity.ai/" },
  { id: "eng-kimi", name: "Kimi", searchUrl: "https://kimi.moonshot.cn/?q={q}", homeUrl: "https://kimi.moonshot.cn/" },
  { id: "eng-poe", name: "Poe", searchUrl: "https://poe.com/search?q={q}", homeUrl: "https://poe.com/" },
  { id: "eng-tongyi", name: "通义千问", searchUrl: "https://tongyi.aliyun.com/qianwen/?q={q}", homeUrl: "https://tongyi.aliyun.com/" },
  { id: "eng-yuanbao", name: "腾讯元宝", searchUrl: "https://yuanbao.tencent.com/chat?q={q}", homeUrl: "https://yuanbao.tencent.com/" },
  { id: "eng-wenxin", name: "文心一言", searchUrl: "https://yiyan.baidu.com/", homeUrl: "https://yiyan.baidu.com/" },
  { id: "eng-grok", name: "Grok", searchUrl: "https://grok.com/?q={q}", homeUrl: "https://grok.com/" },
  { id: "eng-copilot", name: "Copilot", searchUrl: "https://copilot.microsoft.com/?q={q}", homeUrl: "https://copilot.microsoft.com/" },
  { id: "eng-lechat", name: "Le Chat", searchUrl: "https://chat.mistral.ai/chat?q={q}", homeUrl: "https://chat.mistral.ai/" },
  { id: "eng-github", name: "GitHub", searchUrl: "https://github.com/search?q={q}", homeUrl: "https://github.com/" },
  { id: "eng-stackoverflow", name: "Stack Overflow", searchUrl: "https://stackoverflow.com/search?q={q}", homeUrl: "https://stackoverflow.com/" },
];
const DEFAULT_ENGINE_IDS = new Set(["eng-google", "eng-bing", "eng-baidu"]);
const COPY_QUERY_ENGINE_IDS = new Set([
  "eng-doubao",
  "eng-openai",
  "eng-chatgpt",
  "eng-claude",
  "eng-gemini",
  "eng-kimi",
  "eng-poe",
  "eng-tongyi",
  "eng-yuanbao",
  "eng-wenxin",
  "eng-grok",
  "eng-copilot",
  "eng-lechat",
]);
const WEEKDAY_MOTTOS = {
  1: [
    { id: "mon-1", emoji: "☕", text: "周一先别上强度，拿一件小事热热机。" },
    { id: "mon-2", emoji: "🛠️", text: "今天先修最小那口锅，士气会自己回来。" },
    { id: "mon-3", emoji: "🚶", text: "别急着飞，周一先迈出去那一步就赢了。" },
  ],
  2: [
    { id: "tue-1", emoji: "🚀", text: "周二适合推进度，别让待办继续装忙。" },
    { id: "tue-2", emoji: "🧹", text: "挑个小坑先填上，后面的路会顺眼很多。" },
    { id: "tue-3", emoji: "🎯", text: "今天很适合狠狠干掉一个烦人的小目标。" },
  ],
  3: [
    { id: "wed-1", emoji: "📈", text: "周三别演静止画面，把进度条往前推一点。" },
    { id: "wed-2", emoji: "🧩", text: "卡住也没事，先拼上最容易的那一块。" },
    { id: "wed-3", emoji: "⚙️", text: "系统运行到周中，记得顺手拧紧一颗螺丝。" },
  ],
  4: [
    { id: "thu-1", emoji: "💡", text: "周四灵感别只路过，顺手把它落成一小步。" },
    { id: "thu-2", emoji: "🔧", text: "再补一刀细节，这周就更像成品了。" },
    { id: "thu-3", emoji: "📎", text: "今天适合把零散线头，一个个夹回正轨。" },
  ],
  5: [
    { id: "fri-1", emoji: "🎉", text: "周五先收尾，别把锅打包送给下周一。" },
    { id: "fri-2", emoji: "🧺", text: "能今天关掉的事，就别留着周末惦记。" },
    { id: "fri-3", emoji: "✅", text: "本周最后冲一小段，周末会更像奖励。" },
  ],
  6: [
    { id: "sat-1", emoji: "🌿", text: "周六慢一点，先把脑袋里的标签页关几页。" },
    { id: "sat-2", emoji: "🪴", text: "今天适合轻整理，任务和心情一起除除草。" },
    { id: "sat-3", emoji: "🧘", text: "别全清空也行，先理顺一件事就很体面。" },
  ],
  7: [
    { id: "sun-1", emoji: "🌞", text: "周日轻轻预热，给下周的自己留点台阶。" },
    { id: "sun-2", emoji: "🗂️", text: "先排个小队形，明天就不会一开场就乱。" },
    { id: "sun-3", emoji: "🍵", text: "今天不求满分，给下周备好第一口气就行。" },
  ],
};

const state = {
  db: null,
  ui: {
    editingLinkId: null,
    deletingLinkId: null,
    editingCategoryId: null,
    deletingCategoryId: null,
    editingTodoId: null,
    editingTodoScope: "week", // week | month
    deletingTodoId: null,
    deletingTodoScope: "week", // week | month
    deletingHolidayId: null,
    draggingPresetEngineId: null,
    draggingLinkId: null,
    draggingContainer: null,
    draggingCategoryId: null,
    dragDirty: false,
    categoryDragDirty: false,
    readOnly: false,
    pageLoaded: false,
    toastTimer: null,
    holidayAutoStatus: "idle", // idle | loading | ok | error | manual
    lastCompletedTodo: null,
    toastActionHandler: null,
  },
};

const els = {
  searchForm: document.querySelector("form.search"),
  queryInput: document.getElementById("q"),
  mottoText: document.getElementById("motto-text"),
  mottoEmoji: document.getElementById("motto-emoji"),
  cats: document.querySelector(".catpanel .cats"),
  linkTitle: document.querySelector(".linkpanel .title"),
  grid: document.querySelector(".linkpanel .grid"),
  planPanel: document.querySelector(".planpanel"),
  modeBrowse: document.getElementById("mode-browse"),
  modeManage: document.getElementById("mode-manage"),
  engineTabs: document.getElementById("engine-tabs"),
  searchBtnIco: document.getElementById("search-btn-ico"),
  openEngineModal: document.getElementById("open-engine-modal"),
  engineNameInput: document.getElementById("en-name"),
  engineSearchInput: document.getElementById("en-search"),
  engineHomeInput: document.getElementById("en-home"),
  engineOpenCustomFormBtn: document.getElementById("engine-open-custom-form"),
  engineSelectAllBtn: document.getElementById("engine-select-all-btn"),
  engineSelectNoneBtn: document.getElementById("engine-select-none-btn"),
  engineCustomPanel: document.getElementById("engine-custom-panel"),
  enginePresetList: document.getElementById("engine-preset-list"),
  engineAddBtn: document.getElementById("engine-add-btn"),
  engineCustomAddBtn: document.getElementById("engine-custom-add-btn"),
  openLinkModal: document.getElementById("open-link-modal"),
  openCategoryManage: document.getElementById("open-category-manage"),
  openCategoryDelete: document.getElementById("open-category-delete"),
  categoryModalTitle: document.getElementById("category-modal-title"),
  linkModalTitle: document.getElementById("link-modal-title"),
  linkTitleInput: document.getElementById("lt"),
  linkUrlInput: document.getElementById("lu"),
  linkCategorySelect: document.getElementById("lc"),
  linkNoteInput: document.getElementById("ln"),
  linkSaveBtn: document.getElementById("link-save-btn"),
  categoryNameInput: document.getElementById("cn"),
  categoryColorSelect: document.getElementById("cc"),
  categoryColorPalette: document.getElementById("cc-palette"),
  categoryConfirmBtn: document.getElementById("category-confirm-btn"),
  dangerCategoryName: document.getElementById("danger-category-name"),
  dangerCategoryCount: document.getElementById("danger-category-count"),
  categoryDeleteConfirmBtn: document.getElementById("category-delete-confirm-btn"),
  dangerLinkName: document.getElementById("danger-link-name"),
  linkDeleteConfirmBtn: document.getElementById("link-delete-confirm-btn"),
  openDataSyncModal: document.getElementById("open-data-sync-modal"),
  dataStatus: document.getElementById("data-status"),
  dataImportBtn: document.getElementById("data-import-btn"),
  dataExportBtn: document.getElementById("data-export-btn"),
  dataImportInput: document.getElementById("data-import-input"),
  weekendCountdown: document.getElementById("weekend-countdown"),
  holidayCountdown: document.getElementById("holiday-countdown"),
  calendarMonthTitle: document.getElementById("calendar-month-title"),
  calendarGrid: document.getElementById("calendar-grid"),
  todoWeekLabel: document.getElementById("todo-week-label"),
  todoViewWeekBtn: document.getElementById("todo-view-week-btn"),
  todoViewMonthBtn: document.getElementById("todo-view-month-btn"),
  todoGroups: document.getElementById("todo-groups"),
  todoQuickForm: document.getElementById("todo-quick-form"),
  todoQuickTitle: document.getElementById("todo-quick-title"),
  todoQuickDate: document.getElementById("todo-quick-date"),
  todoQuickPriority: document.getElementById("todo-quick-priority"),
  todoModalTitle: document.getElementById("todo-modal-title"),
  todoTitleInput: document.getElementById("tt"),
  todoDateInput: document.getElementById("tdt"),
  todoPrioritySelect: document.getElementById("tp"),
  todoSceneSelect: document.getElementById("ts"),
  todoSaveBtn: document.getElementById("todo-save-btn"),
  dangerTodoName: document.getElementById("danger-todo-name"),
  todoDeleteConfirmBtn: document.getElementById("todo-delete-confirm-btn"),
  holidayNameInput: document.getElementById("hn"),
  holidayStartInput: document.getElementById("hs"),
  holidayEndInput: document.getElementById("he"),
  holidayList: document.getElementById("holiday-list"),
  holidayAddBtn: document.getElementById("holiday-add-btn"),
  toast: document.querySelector(".toast"),
  toastBadge: document.querySelector(".toast .badge"),
  toastTitle: document.querySelector(".toast .msg strong"),
  toastText: document.querySelector(".toast .msg div span"),
  toastActionBtn: document.querySelector(".toast-action"),
};


function init() {
  state.db = loadDb();
  bindEvents();
  renderAll();
  ensureAutoHolidays();
  syncColorPalette((els.categoryColorSelect && els.categoryColorSelect.value) || "sky");
  syncModalWithHash();
  window.addEventListener("hashchange", syncModalWithHash);
  window.addEventListener("load", () => {
    state.ui.pageLoaded = true;
    renderEngineIcons();
    hydrateLinkIcons();
    renderDataStatus();
  });
}
