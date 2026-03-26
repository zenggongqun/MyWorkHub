"use strict";

function syncModalWithHash() {
  if (window.location.hash === "#modal-link") {
    fillLinkModal();
    return;
  }
  if (window.location.hash === "#modal-delete") {
    fillLinkDeleteDialog();
    return;
  }
  if (window.location.hash === "#modal-category") {
    fillCategoryModal();
    return;
  }
  if (window.location.hash === "#modal-category-danger") {
    fillCategoryDeleteDialog();
    return;
  }
  if (window.location.hash === "#modal-todo") {
    fillTodoModal();
    return;
  }
  if (window.location.hash === "#modal-todo-delete") {
    fillTodoDeleteDialog();
    return;
  }
  if (window.location.hash === "#modal-holidays") {
    fillHolidayModal();
    return;
  }
  if (window.location.hash === "#modal-engine") {
    fillEngineModal();
    return;
  }
  if (window.location.hash === "#modal-data-sync") {
    renderDataStatus();
  }
}

function fillLinkModal() {
  const locked = isPersistenceLocked();
  renderCategoryOptions();
  const defaultCategoryId = state.db.activeCategoryId === ALL_CATEGORY_ID
    ? ((sortedCategories()[0] && sortedCategories()[0].id) || "")
    : state.db.activeCategoryId;
  const editing = state.ui.editingLinkId ? getLinkById(state.ui.editingLinkId) : null;
  if (editing) {
    if (els.linkModalTitle) els.linkModalTitle.textContent = "编辑链接";
    if (els.linkTitleInput) els.linkTitleInput.value = editing.title;
    if (els.linkUrlInput) els.linkUrlInput.value = editing.url;
    if (els.linkNoteInput) els.linkNoteInput.value = editing.note || "";
    if (els.linkCategorySelect) els.linkCategorySelect.value = editing.categoryId;
  } else {
    if (els.linkModalTitle) els.linkModalTitle.textContent = "新增链接";
    if (els.linkTitleInput) els.linkTitleInput.value = "";
    if (els.linkUrlInput) els.linkUrlInput.value = "";
    if (els.linkNoteInput) els.linkNoteInput.value = "";
    if (els.linkCategorySelect) els.linkCategorySelect.value = defaultCategoryId;
  }
  if (els.linkTitleInput) els.linkTitleInput.disabled = locked;
  if (els.linkUrlInput) els.linkUrlInput.disabled = locked;
  if (els.linkNoteInput) els.linkNoteInput.disabled = locked;
  if (els.linkCategorySelect) els.linkCategorySelect.disabled = locked;
  setControlDisabled(els.linkSaveBtn, locked, "请先绑定同步文件后再保存链接");
}

function fillCategoryModal() {
  const locked = isPersistenceLocked();
  const editing = state.ui.editingCategoryId ? getCategoryById(state.ui.editingCategoryId) : null;
  const active = getCategoryById(state.db.activeCategoryId);
  const source = editing || active;
  if (els.categoryNameInput) {
    els.categoryNameInput.value = editing ? editing.name : "";
  }
  if (els.categoryColorSelect) {
    const nextColor = source ? source.colorToken : "sky";
    els.categoryColorSelect.value = nextColor;
    syncColorPalette(nextColor);
  }
  if (els.categoryModalTitle) {
    els.categoryModalTitle.textContent = editing ? "编辑分类" : "新增分类";
  }
  if (els.categoryConfirmBtn) {
    els.categoryConfirmBtn.textContent = editing ? "保存修改" : "确认";
    els.categoryConfirmBtn.title = editing ? "保存分类修改" : "确认新增分类";
  }
  if (els.categoryNameInput) els.categoryNameInput.disabled = locked;
  if (els.categoryColorSelect) els.categoryColorSelect.disabled = locked;
  if (els.categoryColorPalette) {
    els.categoryColorPalette.querySelectorAll(".color-swatch[data-color]").forEach((chip) => {
      chip.disabled = locked;
      chip.classList.toggle("is-disabled", locked);
    });
  }
  setControlDisabled(els.categoryConfirmBtn, locked, "请先绑定同步文件后再保存分类");
}

function syncColorPalette(selectedColor) {
  if (!els.categoryColorPalette) return;
  const chips = els.categoryColorPalette.querySelectorAll(".color-swatch[data-color]");
  chips.forEach((chip) => {
    const color = chip.getAttribute("data-color");
    const isActive = color === selectedColor;
    chip.setAttribute("aria-checked", isActive ? "true" : "false");
  });
}

function fillCategoryDeleteDialog() {
  const targetId = state.ui.deletingCategoryId || state.db.activeCategoryId;
  const cat = getCategoryById(targetId);
  if (!cat) return;
  const affected = state.db.links.filter((item) => item.categoryId === targetId).length;
  if (els.dangerCategoryName) els.dangerCategoryName.textContent = cat.name;
  if (els.dangerCategoryCount) els.dangerCategoryCount.textContent = String(affected);
  setControlDisabled(els.categoryDeleteConfirmBtn, isPersistenceLocked(), "请先绑定同步文件后再删除分类");
}

function fillLinkDeleteDialog() {
  const link = state.ui.deletingLinkId ? getLinkById(state.ui.deletingLinkId) : null;
  if (!link) return;
  if (els.dangerLinkName) {
    els.dangerLinkName.textContent = link.title;
  }
  setControlDisabled(els.linkDeleteConfirmBtn, isPersistenceLocked(), "请先绑定同步文件后再删除链接");
}

function fillTodoModal() {
  const locked = isPersistenceLocked();
  const editing = state.ui.editingTodoId ? getTodoById(state.ui.editingTodoId) : null;

  if (editing) {
    if (els.todoModalTitle) els.todoModalTitle.textContent = "编辑待办";
    if (els.todoTitleInput) els.todoTitleInput.value = editing.title;
    if (els.todoDateInput) els.todoDateInput.value = editing.date || "";
    if (els.todoPrioritySelect) els.todoPrioritySelect.value = editing.priority || "medium";
    if (els.todoSceneSelect) els.todoSceneSelect.value = editing.scene || "other";
    if (els.todoSaveBtn) els.todoSaveBtn.title = "保存待办修改";
    syncPrioritySelectStyles();
    if (els.todoTitleInput) els.todoTitleInput.disabled = locked;
    if (els.todoDateInput) els.todoDateInput.disabled = locked;
    if (els.todoPrioritySelect) els.todoPrioritySelect.disabled = locked;
    if (els.todoSceneSelect) els.todoSceneSelect.disabled = locked;
    setControlDisabled(els.todoSaveBtn, locked, "请先绑定同步文件后再保存待办");
    return;
  }

  if (els.todoModalTitle) els.todoModalTitle.textContent = "新增待办";
  if (els.todoTitleInput) els.todoTitleInput.value = "";
  if (els.todoDateInput) els.todoDateInput.value = safeString(els.todoQuickDate && els.todoQuickDate.value) || safeString(state.db.plan.selectedDate);
  if (els.todoPrioritySelect) els.todoPrioritySelect.value = safeString(els.todoQuickPriority && els.todoQuickPriority.value) || "medium";
  if (els.todoSceneSelect) els.todoSceneSelect.value = "work";
  if (els.todoSaveBtn) els.todoSaveBtn.title = "保存待办内容";
  syncPrioritySelectStyles();
  if (els.todoTitleInput) els.todoTitleInput.disabled = locked;
  if (els.todoDateInput) els.todoDateInput.disabled = locked;
  if (els.todoPrioritySelect) els.todoPrioritySelect.disabled = locked;
  if (els.todoSceneSelect) els.todoSceneSelect.disabled = locked;
  setControlDisabled(els.todoSaveBtn, locked, "请先绑定同步文件后再保存待办");
}

function fillTodoDeleteDialog() {
  const todo = state.ui.deletingTodoId ? getTodoById(state.ui.deletingTodoId) : null;
  if (!todo) return;
  if (els.dangerTodoName) els.dangerTodoName.textContent = todo.title;
  setControlDisabled(els.todoDeleteConfirmBtn, isPersistenceLocked(), "请先绑定同步文件后再删除待办");
}

function fillHolidayModal() {
  const locked = isPersistenceLocked();
  if (els.holidayNameInput) els.holidayNameInput.value = "";
  if (els.holidayStartInput) els.holidayStartInput.value = "";
  if (els.holidayEndInput) els.holidayEndInput.value = "";
  if (els.holidayNameInput) els.holidayNameInput.disabled = locked;
  if (els.holidayStartInput) els.holidayStartInput.disabled = locked;
  if (els.holidayEndInput) els.holidayEndInput.disabled = locked;
  setControlDisabled(els.holidayAddBtn, locked, "请先绑定同步文件后再管理假日");
  renderHolidayList();
}

function fillEngineModal() {
  const locked = isPersistenceLocked();
  if (els.engineNameInput) els.engineNameInput.value = "";
  if (els.engineSearchInput) els.engineSearchInput.value = "";
  if (els.engineHomeInput) els.engineHomeInput.value = "";
  if (els.engineNameInput) els.engineNameInput.disabled = locked;
  if (els.engineSearchInput) els.engineSearchInput.disabled = locked;
  if (els.engineHomeInput) els.engineHomeInput.disabled = locked;
  if (els.engineCustomPanel) {
    els.engineCustomPanel.hidden = true;
  }
  setControlDisabled(els.engineOpenCustomFormBtn, locked, "请先绑定同步文件后再管理搜索引擎");
  setControlDisabled(els.engineSelectAllBtn, locked, "请先绑定同步文件后再管理搜索引擎");
  setControlDisabled(els.engineSelectNoneBtn, locked, "请先绑定同步文件后再管理搜索引擎");
  setControlDisabled(els.engineAddBtn, locked, "请先绑定同步文件后再保存搜索引擎");
  setControlDisabled(els.engineCustomAddBtn, locked, "请先绑定同步文件后再新增搜索引擎");
  renderEnginePresetList();
}

function renderEnginePresetList(overrideSelectedIds) {
  if (!els.enginePresetList) return;
  const locked = isPersistenceLocked();
  const activeIds = overrideSelectedIds instanceof Set
    ? overrideSelectedIds
    : new Set((state.db.settings.engines || []).map((item) => item.id));
  const order = normalizeEnginePresetOrder(state.db.settings.enginePresetOrder);
  const byId = new Map(COMMON_ENGINES.map((item) => [item.id, item]));
  const ordered = order.map((id) => byId.get(id)).filter(Boolean);
  const selected = ordered.filter((item) => activeIds.has(item.id));
  const unselected = ordered.filter((item) => !activeIds.has(item.id));
  const list = [...selected, ...unselected];
  els.enginePresetList.innerHTML = `<div class="engine-preset-grid">${list.map((engine) => `
    <label class="engine-preset-item ${locked ? "is-disabled" : ""}" draggable="${locked ? "false" : "true"}" data-engine-preset-id="${escAttr(engine.id)}">
      <div class="engine-option">
        <input type="checkbox" class="todo-cb" data-engine-preset-id="${escAttr(engine.id)}" ${activeIds.has(engine.id) ? "checked" : ""} ${locked ? 'disabled aria-disabled="true"' : ""} />
        <img class="fav" src="${escAttr(iconPlaceholder())}" data-engine-option-id="${escAttr(engine.id)}" alt="" decoding="async" referrerpolicy="no-referrer" />
        <div class="engine-option-name">${escHtml(engine.name)}</div>
      </div>
    </label>
  `).join("")}</div>`;

  const optionIcons = Array.from(els.enginePresetList.querySelectorAll("img[data-engine-option-id]"));
  optionIcons.forEach((img) => {
    const id = safeString(img.getAttribute("data-engine-option-id"));
    const engine = COMMON_ENGINES.find((item) => item.id === id) || null;
    img.src = engineFallbackIcon(engine && engine.name);
    if (state.ui.pageLoaded && engine) {
      loadIconMaybe(img, engineIconUrl(engine));
    }
  });
}

function renderCategoryOptions() {
  if (!els.linkCategorySelect) return;
  const options = sortedCategories().map(
    (cat) => `<option value="${escAttr(cat.id)}">${escHtml(cat.name)}</option>`
  );
  els.linkCategorySelect.innerHTML = options.join("");
}

function renderAll() {
  renderMotto();
  renderHeader();
  renderCategories();
  renderLinks();
  renderPlanPanel();
  renderDataStatus();
}

function isPersistenceLocked() {
  return false;
}

function setControlDisabled(node, disabled, disabledTitle) {
  if (!node) return;
  const nextDisabled = !!disabled;
  if (node.dataset.defaultTitle === undefined) {
    node.dataset.defaultTitle = node.getAttribute("title") || "";
  }
  if ("disabled" in node) {
    node.disabled = nextDisabled;
  }
  node.classList.toggle("is-disabled", nextDisabled);
  node.setAttribute("aria-disabled", nextDisabled ? "true" : "false");
  node.tabIndex = nextDisabled ? -1 : 0;
  const title = nextDisabled ? (disabledTitle || node.dataset.defaultTitle || "") : (node.dataset.defaultTitle || "");
  if (title) {
    node.setAttribute("title", title);
  } else {
    node.removeAttribute("title");
  }
}

function renderMotto() {
  if (!els.mottoText) return;
  const today = new Date();
  const motto = pickDailyMotto(today);
  els.mottoText.textContent = motto.text;
  if (els.mottoEmoji) {
    els.mottoEmoji.textContent = motto.emoji;
  }
}

function renderHeader() {
  const locked = isPersistenceLocked();
  if (els.modeManage && els.modeBrowse) {
    const mode = state.db.settings.ui.mode === "manage" ? "manage" : "browse";
    els.modeManage.checked = mode === "manage";
    els.modeBrowse.checked = mode !== "manage";
    els.modeManage.disabled = locked;
    els.modeBrowse.disabled = locked;
  }

  renderEngineTabs();
  renderEngineIcons();

  if (els.queryInput) {
    const activeEngine = getEngineById(getActiveEngineId());
    els.queryInput.placeholder = shouldCopyQueryForEngine(activeEngine)
      ? `输入关键词...（${engineLabel(activeEngine)}暂不支持直接带入关键词，点击搜索后会自动复制，请打开后粘贴到${engineLabel(activeEngine)}输入框）`
      : "输入关键词...（回车或点搜索）";
  }

  const currentCategory = getCategoryById(state.db.activeCategoryId);
  if (els.linkTitle) {
    els.linkTitle.textContent = currentCategory
      ? `${currentCategory.name} · 常用链接`
      : "全部 · 常用链接";
  }

  setControlDisabled(document.getElementById("open-engine-modal"), locked, "请先绑定同步文件后再管理搜索引擎");
  setControlDisabled(els.openLinkModal, locked, "请先绑定同步文件后再新增链接");
  setControlDisabled(els.openCategoryManage, locked, "请先绑定同步文件后再管理分类");
  setControlDisabled(els.openCategoryDelete, locked, "请先绑定同步文件后再删除分类");
  setControlDisabled(document.getElementById("open-holidays-modal-hero"), locked, "请先绑定同步文件后再管理假日");
}

function renderEngineTabs() {
  if (!els.engineTabs) return;
  const engines = sortedEngines();
  const activeId = getActiveEngineId();
  const addBtnHtml = `
    <a id="open-engine-modal" class="iconbtn sm addbtn" href="#modal-engine" title="管理引擎">
      <span class="sr">管理引擎</span>
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 5v14" stroke="#14120d" stroke-width="1.8" stroke-linecap="round" />
        <path d="M5 12h14" stroke="#14120d" stroke-width="1.8" stroke-linecap="round" />
      </svg>
    </a>
  `;
  if (!engines.length) {
    els.engineTabs.innerHTML = `<span class="engine-manage-empty">暂无搜索引擎，请点击右侧 + 添加。</span>${addBtnHtml}`;
    return;
  }
  els.engineTabs.innerHTML = engines.map((engine) => `
    <div class="tab" role="button" tabindex="0" data-engine-id="${escAttr(engine.id)}" aria-current="${engine.id === activeId ? "true" : "false"}">
      <span class="ico" aria-hidden="true">
        <img class="fav engine-fav" data-engine-id="${escAttr(engine.id)}" src="${escAttr(iconPlaceholder())}" alt="" decoding="async" referrerpolicy="no-referrer" />
      </span>
      <span class="nm">${escHtml(engine.name)}</span>
    </div>
  `).join("") + addBtnHtml;
}

function renderCategories() {
  if (!els.cats) return;
  const locked = isPersistenceLocked();
  const counts = new Map();
  state.db.links.forEach((link) => {
    counts.set(link.categoryId, (counts.get(link.categoryId) || 0) + 1);
  });

  const totalCount = state.db.links.length;
  const allMode = state.db.activeCategoryId === ALL_CATEGORY_ID;
  const allActive = allMode;
  const allItemHtml = `
    <div class="cat" data-cat-id="${ALL_CATEGORY_ID}" data-color="aqua" aria-current="${allActive ? "true" : "false"}">
      <button type="button" class="cat-main ${locked ? "is-disabled" : ""}" data-cat-id="${ALL_CATEGORY_ID}" aria-label="切换到全部分类" ${locked ? 'disabled aria-disabled="true" title="请先绑定同步文件后再切换分类"' : ""}>
        <div class="cat-label">
          <div class="name">
            <strong>全部</strong>
          </div>
        </div>
        <div class="cat-tail">
          <span class="count">${totalCount}</span>
        </div>
      </button>
    </div>
  `;

  const html = [allItemHtml, ...sortedCategories()
    .map((cat) => {
      const active = cat.id === state.db.activeCategoryId;
      const count = counts.get(cat.id) || 0;
      return `
        <div class="cat" data-cat-id="${escAttr(cat.id)}" data-color="${escAttr(cat.colorToken)}" draggable="${locked ? "false" : "true"}" aria-current="${active ? "true" : "false"}">
          <button type="button" class="cat-main ${locked ? "is-disabled" : ""}" data-cat-id="${escAttr(cat.id)}" aria-label="切换到分类 ${escAttr(cat.name)}" ${locked ? 'disabled aria-disabled="true" title="请先绑定同步文件后再切换分类"' : ""}>
            <div class="cat-label">
              <div class="name">
                <strong>${escHtml(cat.name)}</strong>
              </div>
            </div>
            <div class="cat-tail">
              <span class="count has-edit">${count}</span>
            </div>
          </button>
          <a class="cat-edit ${locked ? "is-disabled" : ""}" href="#modal-category" title="${locked ? "请先绑定同步文件后再编辑分类" : "编辑分类"}" aria-label="编辑分类" data-action="edit-category" data-cat-id="${escAttr(cat.id)}" ${locked ? 'aria-disabled="true" tabindex="-1"' : ""}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 19.2h3.2L18 9.4l-3.2-3.2L5 16v3.2Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
              <path d="M13.8 6.2 17 9.4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
            </svg>
          </a>
        </div>
      `;
    })
  ]
    .join("");

  els.cats.innerHTML = html;
}

function renderLinks() {
  if (!els.grid) return;
  const categoryId = state.db.activeCategoryId;
  const categories = sortedCategories();
  const categoryOrder = new Map(categories.map((cat) => [cat.id, cat.order]));
  const links = state.db.links
    .filter((link) => categoryId === ALL_CATEGORY_ID || link.categoryId === categoryId)
    .sort((a, b) => {
      const catDelta = (categoryOrder.get(a.categoryId) || 0) - (categoryOrder.get(b.categoryId) || 0);
      if (catDelta !== 0) return catDelta;
      return a.order - b.order;
    });

  if (categoryId === ALL_CATEGORY_ID) {
    const grouped = new Map();
    categories.forEach((cat) => grouped.set(cat.id, []));
    links.forEach((link) => {
      if (!grouped.has(link.categoryId)) return;
      grouped.get(link.categoryId).push(link);
    });

    const groupedHtml = categories
      .map((cat) => {
        const catLinks = grouped.get(cat.id) || [];
        const cardsHtml = catLinks.map((link) => renderLinkCard(link)).join("");
        const emptyHtml = !cardsHtml && isManageMode()
          ? '<div class="all-group-empty">拖到这里可移动到该分类</div>'
          : "";
        return `
          <section class="all-group" id="${escAttr(anchorIdForCategory(cat.id))}" data-category-id="${escAttr(cat.id)}">
            <h3 class="all-group-title" style="--group-cat: var(--cat-${escAttr(cat.colorToken)});">${escHtml(cat.name)}</h3>
            <div class="all-group-links" data-category-id="${escAttr(cat.id)}">${cardsHtml}${emptyHtml}</div>
          </section>
        `;
      })
      .join("");

    els.grid.classList.add("all-mode");
    els.grid.classList.remove("site-grouped");
    els.grid.innerHTML = groupedHtml;
    if (state.ui.pageLoaded) hydrateLinkIcons();
    return;
  }

  const grouped = new Map();
  links.forEach((link) => {
    const siteKey = siteKeyFromUrl(link.url) || "其他";
    if (!grouped.has(siteKey)) grouped.set(siteKey, []);
    grouped.get(siteKey).push(link);
  });

  const repeatedGroups = [];
  const singleLinks = [];
  Array.from(grouped.entries()).forEach(([siteKey, hostLinks]) => {
    if (hostLinks.length > 1) {
      repeatedGroups.push([siteKey, hostLinks]);
    } else {
      singleLinks.push(hostLinks[0]);
    }
  });

  const repeatedHtml = repeatedGroups.map(([siteKey, hostLinks]) => {
    const cards = hostLinks.map((link) => renderLinkCard(link)).join("");
    return `
      <section class="site-group">
        <h4 class="site-group-title">同站点分组：<strong>${escHtml(siteKey)}</strong> · ${hostLinks.length} 条</h4>
        <div class="site-group-links">${cards}</div>
      </section>
    `;
  }).join("");

  const singleHtml = singleLinks.length
    ? `<section class="site-group"><div class="site-group-links">${singleLinks.map((link) => renderLinkCard(link)).join("")}</div></section>`
    : "";

  const html = singleHtml + repeatedHtml;

  els.grid.classList.remove("all-mode");
  els.grid.classList.add("site-grouped");
  els.grid.innerHTML = html;
  if (state.ui.pageLoaded) hydrateLinkIcons();
}

function renderPlanPanel() {
  renderCountdown();
  renderCalendar();
  renderTodos();
  const locked = isPersistenceLocked();
  Array.from(document.querySelectorAll("[data-action='cal-prev'], [data-action='cal-next'], [data-action='cal-today'], [data-action='todo-view-week'], [data-action='todo-view-month'], [data-action='todo-scene-filter']"))
    .forEach((node) => setControlDisabled(node, locked, "请先绑定同步文件后再修改待办视图"));
  if (els.todoQuickTitle) els.todoQuickTitle.disabled = locked;
  if (els.todoQuickDate) els.todoQuickDate.disabled = locked;
  if (els.todoQuickPriority) els.todoQuickPriority.disabled = locked;
  setControlDisabled(document.querySelector("#todo-quick-form .todoquick-submit"), locked, "请先绑定同步文件后再新增待办");
}

function renderEngineIcons() {
  const activeEngine = getEngineById(getActiveEngineId());
  if (els.searchBtnIco) {
    els.searchBtnIco.src = engineFallbackIcon(activeEngine && activeEngine.name);
    if (state.ui.pageLoaded && activeEngine) {
      loadIconMaybe(els.searchBtnIco, engineIconUrl(activeEngine));
    }
  }

  const favs = Array.from(document.querySelectorAll(".engine-fav[data-engine-id]"));
  favs.forEach((img) => {
    const id = safeString(img.getAttribute("data-engine-id"));
    const engine = getEngineById(id);
    img.src = engineFallbackIcon(engine && engine.name);
    if (state.ui.pageLoaded) {
      loadIconMaybe(img, engineIconUrl(engine));
    }
  });
}

function renderCountdown() {
  if (!els.weekendCountdown || !els.holidayCountdown) return;
  const now = new Date();
  const weekend = nextSaturdayStart(now);
  els.weekendCountdown.textContent = formatCountdown(weekend, now, "周末开始啦，记得喘口气");

  const holiday = getNearestHoliday(now);
  if (!holiday) {
    if (state.ui.holidayAutoStatus === "loading") {
      els.holidayCountdown.textContent = "正在自动获取...";
      return;
    }
    if (state.ui.holidayAutoStatus === "error") {
      els.holidayCountdown.textContent = "自动获取失败，可点击右上角手动添加";
      return;
    }
    if (state.ui.holidayAutoStatus === "manual") {
      els.holidayCountdown.textContent = "尚未设置假日，可点击右上角手动添加";
      return;
    }
    els.holidayCountdown.textContent = "正在准备假日数据...";
    return;
  }

  if (holiday.inHoliday) {
    els.holidayCountdown.textContent = `今天在放假：${holiday.name}`;
    return;
  }

  els.holidayCountdown.textContent = `${holiday.name} 还有 ${holiday.days} 天`;
}

function markHolidayManual() {
  try {
    localStorage.setItem(HOLIDAY_MANUAL_KEY, "1");
  } catch (_error) {
  }
  state.ui.holidayAutoStatus = "manual";
}

function isHolidayManual() {
  return safeReadStorage(HOLIDAY_MANUAL_KEY) === "1";
}

async function ensureAutoHolidays() {
  if (!state.db || !state.db.plan) return;
  if (isHolidayManual()) {
    state.ui.holidayAutoStatus = "manual";
    return;
  }

  state.ui.holidayAutoStatus = "loading";
  renderPlanPanel();
  const now = Date.now();
  const year = new Date().getFullYear();
  const years = [year, year + 1];
  try {
    const holidays = [];
    const workdays = [];
    for (let i = 0; i < years.length; i += 1) {
      const y = years[i];
      const schedule = await loadOrFetchHolidaysForYear(y);
      holidays.push(...schedule.holidays);
      workdays.push(...schedule.workdays);
    }
    const normalized = holidays
      .map((holiday, index) => normalizeHoliday({
        id: holiday.id || uid("holiday"),
        name: holiday.name,
        startDate: holiday.startDate,
        endDate: holiday.endDate,
        order: Number.isFinite(Number(holiday.order)) ? Number(holiday.order) : (index + 1) * 10,
        createdAt: holiday.createdAt || now,
        updatedAt: holiday.updatedAt || now,
      }, index, now))
      .filter(Boolean)
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
    state.db.plan.holidays = normalized;
    state.db.plan.workdays = [...new Set(workdays.map((item) => safeString(item)).filter((item) => Boolean(parseYmd(item))))].sort();
    saveDb({ showPrompt: false, interactiveFileSync: false });
    state.ui.holidayAutoStatus = normalized.length ? "ok" : "error";
    renderPlanPanel();
  } catch (_error) {
    state.ui.holidayAutoStatus = "error";
    renderPlanPanel();
  }
}

async function loadOrFetchHolidaysForYear(year) {
  const cacheKey = `${HOLIDAY_CACHE_PREFIX}cn.${year}`;
  const cached = safeReadStorage(cacheKey);
  if (cached) {
    try {
      const payload = JSON.parse(cached);
      if (payload
        && payload.data
        && Array.isArray(payload.data.holidays)
        && Array.isArray(payload.data.workdays)
        && Number.isFinite(Number(payload.fetchedAt))
        && (Date.now() - Number(payload.fetchedAt)) < HOLIDAY_CACHE_TTL_MS) {
        return payload.data;
      }
    } catch (_error) {
    }
  }

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 8000);
  try {
    const url = `${HOLIDAY_API_BASE}/${year}`;
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`http_${res.status}`);
    const data = await res.json();
    const schedule = timorToSchedule(data, nowFromYear(year));
    try {
      localStorage.setItem(cacheKey, JSON.stringify({ fetchedAt: Date.now(), data: schedule }));
    } catch (_error) {
    }
    return schedule;
  } finally {
    window.clearTimeout(timer);
  }
}

function timorToSchedule(payload, now) {
  const items = payload && payload.holiday && typeof payload.holiday === "object"
    ? Object.values(payload.holiday)
    : [];
  const holidayDates = items
    .filter((item) => item && item.holiday === true && parseYmd(safeString(item.date)))
    .map((item) => ({ date: safeString(item.date), label: holidayTargetLabel(item) }))
    .sort((a, b) => a.date.localeCompare(b.date));
  const workdays = items
    .filter((item) => item && item.holiday === false && parseYmd(safeString(item.date)))
    .map((item) => safeString(item.date))
    .sort();

  const holidays = [];
  let current = null;
  holidayDates.forEach((item) => {
    if (!current) {
      current = { name: item.label, startDate: item.date, endDate: item.date };
      return;
    }
    if (isNextYmd(current.endDate, item.date)) {
      current.endDate = item.date;
      if (!current.name && item.label) current.name = item.label;
      return;
    }
    holidays.push(current);
    current = { name: item.label, startDate: item.date, endDate: item.date };
  });
  if (current) holidays.push(current);

  return {
    holidays: holidays.map((item, index) => ({
      id: uid("holiday"),
      name: item.name,
      startDate: item.startDate,
      endDate: item.endDate,
      order: (index + 1) * 10,
      createdAt: now,
      updatedAt: now,
    })),
    workdays,
  };
}

function holidayTargetLabel(item) {
  const target = safeString(item && item.target);
  const name = safeString(item && item.name);
  return target || name || "假期";
}

function nowFromYear(year) {
  return new Date(year, 0, 1).getTime();
}

function isNextYmd(prevYmd, nextYmd) {
  const prev = parseYmd(prevYmd);
  const next = parseYmd(nextYmd);
  if (!prev || !next) return false;
  return (next.getTime() - prev.getTime()) === 86400000;
}

function renderCalendar() {
  if (!els.calendarGrid || !els.calendarMonthTitle) return;
  const locked = isPersistenceLocked();
  const selected = parseYmd(state.db.plan.selectedDate);
  const monthDate = parseYm(state.db.plan.calendarMonth) || new Date();
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  els.calendarMonthTitle.textContent = `${year}年${String(month + 1).padStart(2, "0")}月`;

  const first = new Date(year, month, 1);
  const firstOffset = (weekdayMon(first) + 6) % 7;
  const start = new Date(year, month, 1 - firstOffset);
  const selectedYmd = selected ? formatYmd(selected) : "";
  const todayYmd = formatYmd(new Date());
  const markers = buildCalendarMarkers();

  const headers = ["一", "二", "三", "四", "五", "六", "日"].map(
    (d) => `<div class="caldow" role="columnheader">${d}</div>`
  );
  const days = [];
  for (let i = 0; i < 42; i += 1) {
    const current = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const key = formatYmd(current);
    const classes = ["calday"];
    if (current.getMonth() !== month) classes.push("muted");
    if (selectedYmd && key === selectedYmd) classes.push("selected");
    if (key === todayYmd) classes.push("today");
    const marker = markers.get(key) || null;
    const dot = marker && marker.tone ? `<span class="dot ${marker.tone}" aria-hidden="true"></span>` : "";
    const holiday = marker && marker.restLabel
      ? `<span class="holiday-flag ${marker.restKind === "weekend" ? "weekend" : "holiday"}" aria-hidden="true" title="${escAttr(marker.holidayName || "周末休息")}">${escHtml(marker.restLabel)}</span>`
      : "";
    days.push(`<button type="button" class="${classes.join(" ")} ${locked ? "is-disabled" : ""}" data-date="${key}" role="gridcell" title="${escAttr(locked ? "请先绑定同步文件后再切换日期" : buildCalendarDayTitle(key, marker))}" ${locked ? 'disabled aria-disabled="true"' : ""}><span class="calday-num">${current.getDate()}</span>${dot}${holiday}</button>`);
  }
  els.calendarGrid.innerHTML = headers.concat(days).join("");
}

function renderTodos() {
  if (!els.todoGroups) return;
  const locked = isPersistenceLocked();
  const view = state.db.plan && state.db.plan.todoView === "month" ? "month" : "week";

  if (els.todoViewWeekBtn) els.todoViewWeekBtn.setAttribute("aria-selected", view === "week" ? "true" : "false");
  if (els.todoViewMonthBtn) els.todoViewMonthBtn.setAttribute("aria-selected", view === "month" ? "true" : "false");
  setControlDisabled(els.todoViewWeekBtn, locked, "请先绑定同步文件后再切换待办视图");
  setControlDisabled(els.todoViewMonthBtn, locked, "请先绑定同步文件后再切换待办视图");
  syncPrioritySelectStyles();

  const selected = parseYmd(state.db.plan.selectedDate);
  const selectedYmd = selected ? formatYmd(selected) : "";
  const today = new Date();
  const todayYmd = formatYmd(today);
  if (els.todoQuickTitle) {
    els.todoQuickTitle.placeholder = view === "month" ? "写下这月要推进的一件事..." : "写下下一件要推进的小事...";
  }
  if (els.todoQuickDate && document.activeElement !== els.todoQuickDate) {
    els.todoQuickDate.value = selectedYmd || "";
  }
  const calendarMonth = /^\d{4}-\d{2}$/.test(safeString(state.db.plan.calendarMonth))
    ? safeString(state.db.plan.calendarMonth)
    : formatYm(today);

  const allTodos = (state.db.plan.todos || [])
    .map((todo) => ({ ...todo, date: todoDateKey(todo) || "" }))
    .filter((todo) => !todo.archived)
    .sort((a, b) => a.order - b.order);

  if (view === "month") {
    els.todoWeekLabel.textContent = `${calendarMonth} 月`;
  } else {
    const weekBase = selected || today;
    const weekStart = startOfWeekMon(weekBase);
    els.todoWeekLabel.textContent = `${formatYmd(weekStart)} 周`;
  }

  const activeTodos = sortTodosByTimeline(allTodos.filter((todo) => !todo.done));
  const completedTodos = sortTodosByTimeline(allTodos.filter((todo) => todo.done)).reverse();
  const archivedTodos = sortTodosByTimeline((state.db.plan.todos || [])
    .filter((todo) => todo && todo.archived)
    .map((todo) => ({ ...todo, date: todoDateKey(todo) || "" }))).reverse();

  if (!activeTodos.length && !completedTodos.length && !archivedTodos.length) {
    els.todoGroups.innerHTML = '<div class="todo-empty">今天还没有行动项，先记下一件最想推进的小事。</div>';
    return;
  }

  const activeHtml = activeTodos.length
    ? `<div class="todo-list">${activeTodos.map((todo, index) => renderTodoItem(todo, index)).join("")}</div>`
    : '<div class="todo-empty">当前没有待推进事项。</div>';
  const completedHtml = completedTodos.length
    ? `
      <details class="todo-completed">
        <summary>已完成 ${completedTodos.length} 项</summary>
        <div class="todo-completed-actions">
          <button type="button" class="todo-archive-btn ${locked ? "is-disabled" : ""}" data-action="archive-completed-todos" title="${escAttr(locked ? "请先绑定同步文件后再归档已完成待办" : "归档全部已完成待办")}" ${locked ? 'disabled aria-disabled="true"' : ""}>归档全部</button>
        </div>
        <div class="todo-list">${completedTodos.map((todo, index) => renderTodoItem(todo, index + activeTodos.length)).join("")}</div>
      </details>
    `
    : "";
  const archivedHtml = archivedTodos.length
    ? `
      <details class="todo-completed todo-archived">
        <summary>已归档 ${archivedTodos.length} 项</summary>
        <div class="todo-list">${archivedTodos.map((todo, index) => renderTodoItem(todo, index + activeTodos.length + completedTodos.length, { readOnly: true, archivedView: true })).join("")}</div>
      </details>
    `
    : "";

  els.todoGroups.innerHTML = activeHtml + completedHtml + archivedHtml;
}

function renderTodoItem(todo, index, options) {
  const settings = options && typeof options === "object" ? options : {};
  const locked = isPersistenceLocked();
  const readOnly = !!settings.readOnly;
  const archivedView = !!settings.archivedView;
  const delay = Math.min(index * 28, 180);
  const dateBadge = todo.date ? formatTodoDateBadge(todo.date) : { label: "稍后安排", tone: "later", title: "未指定日期" };
  const dateMeta = todo.date
    ? `<button type="button" class="todo-date-link ${locked || readOnly ? "is-disabled" : ""}" data-tone="${escAttr(dateBadge.tone)}" ${readOnly ? "" : `data-action="select-todo-date" data-date="${escAttr(todo.date)}"`} title="${escAttr(readOnly ? dateBadge.title : (locked ? "请先绑定同步文件后再切换待办日期" : dateBadge.title))}" ${locked || readOnly ? 'disabled aria-disabled="true"' : ""}>${escHtml(dateBadge.label)}</button>`
    : `<span class="todo-date-link" data-tone="${escAttr(dateBadge.tone)}">${escHtml(dateBadge.label)}</span>`;
  const archivedMeta = archivedView && todo.archivedAt
    ? `<span class="todo-archived-at">归档于 ${escHtml(formatFileSyncTime(todo.archivedAt))}</span>`
    : "";
  const actionsHtml = readOnly
    ? ""
    : `
      <div class="todo-item-actions">
        <a class="iconbtn sm ghost todo-actbtn ${locked ? "is-disabled" : ""}" href="#modal-todo" title="${locked ? "请先绑定同步文件后再编辑待办" : "编辑待办"}" aria-label="编辑待办" data-action="edit-todo" data-todo-id="${escAttr(todo.id)}" ${locked ? 'aria-disabled="true" tabindex="-1"' : ""}>
          <span class="sr">编辑</span>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 20h4l11-11-4-4L4 16v4Z" stroke="#0c1b1d" stroke-width="1.8" stroke-linejoin="round" />
            <path d="M13 6l4 4" stroke="#0c1b1d" stroke-width="1.8" stroke-linecap="round" />
          </svg>
        </a>
        <a class="iconbtn sm ghost todo-actbtn danger ${locked ? "is-disabled" : ""}" href="#modal-todo-delete" title="${locked ? "请先绑定同步文件后再删除待办" : "删除待办"}" aria-label="删除待办" data-action="delete-todo" data-todo-id="${escAttr(todo.id)}" ${locked ? 'aria-disabled="true" tabindex="-1"' : ""}>
          <span class="sr">删除</span>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6.5 8h11" stroke="#0c1b1d" stroke-width="1.8" stroke-linecap="round" />
            <path d="M9.2 8v11" stroke="#0c1b1d" stroke-width="1.8" stroke-linecap="round" />
            <path d="M14.8 8v11" stroke="#0c1b1d" stroke-width="1.8" stroke-linecap="round" />
            <path d="M8.5 6.2h7" stroke="#0c1b1d" stroke-width="1.8" stroke-linecap="round" />
          </svg>
        </a>
      </div>
    `;
  return `
    <article class="todo-item ${todo.done ? "done" : ""} ${archivedView ? "archived-view" : ""}" data-todo-id="${escAttr(todo.id)}" style="animation-delay:${delay}ms;">
      ${readOnly ? '<span class="todo-cb todo-cb-static" aria-hidden="true"></span>' : `<input class="todo-cb" type="checkbox" data-action="toggle-todo" data-todo-id="${escAttr(todo.id)}" ${todo.done ? "checked" : ""} ${locked ? 'disabled aria-disabled="true"' : ""} />`}
      <div class="todo-main">
        <div class="todo-title-row">
          <div class="todo-t" title="${escAttr(todo.title)}">${escHtml(todo.title)}</div>
        </div>
        <div class="todo-meta">
          <span class="todo-priority-chip" data-priority="${escAttr(todo.priority || "medium")}">${escHtml(priorityLabel(todo.priority))}</span>
          ${dateMeta}
          ${archivedMeta}
        </div>
      </div>
      ${actionsHtml}
    </article>
  `;
}

function sortTodosByTimeline(items) {
  return [...items].sort((a, b) => {
    const dateA = todoDateKey(a) || "9999-12-31";
    const dateB = todoDateKey(b) || "9999-12-31";
    if (dateA !== dateB) return dateA.localeCompare(dateB);
    const createdA = Number.isFinite(Number(a.createdAt)) ? Number(a.createdAt) : 0;
    const createdB = Number.isFinite(Number(b.createdAt)) ? Number(b.createdAt) : 0;
    if (createdA !== createdB) return createdA - createdB;
    return (a.order || 0) - (b.order || 0);
  });
}

function syncPrioritySelectStyles() {
  const sync = (node) => {
    if (!node) return;
    const value = ["high", "medium", "low"].includes(safeString(node.value)) ? safeString(node.value) : "medium";
    node.setAttribute("data-priority", value);
  };
  sync(els.todoQuickPriority);
  sync(els.todoPrioritySelect);
}

function buildCalendarMarkers() {
  const markers = new Map();
  const buckets = new Map();
  const holidays = Array.isArray(state.db.plan && state.db.plan.holidays)
    ? state.db.plan.holidays
    : [];

  holidays.forEach((holiday) => {
    const dates = enumerateDateRange(holiday.startDate, holiday.endDate);
    dates.forEach((key) => {
      const current = markers.get(key) || { tone: "", holidayName: "", restLabel: "", restKind: "" };
      current.holidayName = safeString(holiday.name);
      current.restLabel = "休";
      current.restKind = "holiday";
      markers.set(key, current);
    });
  });

  (state.db.plan.todos || []).forEach((todo) => {
    const key = todoDateKey(todo);
    if (!key || todo.done) return;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(todo);
  });
  buckets.forEach((items, key) => {
    const tones = items.map((item) => formatTodoDateBadge(key).tone);
    const current = markers.get(key) || { tone: "", holidayName: "", restLabel: "", restKind: "" };
    current.tone = pickMostUrgentTone(tones);
    markers.set(key, current);
  });

  const monthDate = parseYm(state.db.plan && state.db.plan.calendarMonth) || new Date();
  const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const firstOffset = (weekdayMon(first) + 6) % 7;
  const start = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1 - firstOffset);
  for (let i = 0; i < 42; i += 1) {
    const currentDate = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const key = formatYmd(currentDate);
    if (!isWeekendRestDay(currentDate, key)) continue;
    const current = markers.get(key) || { tone: "", holidayName: "", restLabel: "", restKind: "" };
    if (!current.restLabel) {
      current.restLabel = "休";
      current.restKind = "weekend";
    }
    markers.set(key, current);
  }

  return markers;
}

function buildCalendarDayTitle(dateKey, marker) {
  const parts = [formatDateTitle(dateKey)];
  if (marker && marker.holidayName) parts.push(`假期：${marker.holidayName}`);
  if (marker && marker.restKind === "weekend") parts.push("休息日：周末");
  if (marker && marker.tone) {
    const badge = formatTodoDateBadge(dateKey);
    if (badge && badge.detail) parts.push(badge.detail);
  }
  return parts.join(" | ");
}

function isWeekendRestDay(date, dateKey) {
  const day = date.getDay();
  if (day !== 0 && day !== 6) return false;
  const workdays = Array.isArray(state.db.plan && state.db.plan.workdays) ? state.db.plan.workdays : [];
  return !workdays.includes(dateKey);
}

function enumerateDateRange(startDate, endDate) {
  const start = parseYmd(startDate);
  const end = parseYmd(endDate);
  if (!start || !end || start > end) return [];
  const dates = [];
  for (let current = new Date(start); current <= end; current = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 1)) {
    dates.push(formatYmd(current));
  }
  return dates;
}

function pickMostUrgentTone(tones) {
  const rank = {
    "overdue-severe": 0,
    overdue: 1,
    today: 2,
    "future-near": 3,
    "future-far": 4,
    later: 5,
  };
  return [...tones].sort((a, b) => (rank[a] ?? 99) - (rank[b] ?? 99))[0] || "future-far";
}

function priorityLabel(priority) {
  if (priority === "high") return "高";
  if (priority === "low") return "低";
  return "中";
}

function renderLinkCard(link) {
  const locked = isPersistenceLocked();
  const iconUrls = resolveIconCandidates(link.url);
  const iconFallback = siteIconFallback(link.url, link.title);
  const secondaryText = link.note ? link.note : link.url;
  const draggable = !locked && isManageMode() ? "true" : "false";
  return `
    <article class="card linkcard" role="listitem" data-link-id="${escAttr(link.id)}" data-category-id="${escAttr(link.categoryId)}" draggable="${draggable}" title="${escAttr(`${link.title} — ${link.url}`)}">
      <div class="t">
        <div>
          <div class="brandline">
            <img class="site-ico" src="${escAttr(iconFallback)}" data-icon-urls="${escAttr(iconUrls.join("\n"))}" data-icon-fallback="${escAttr(iconFallback)}" alt="" decoding="async" loading="lazy" referrerpolicy="no-referrer" />
            <h3><a class="stretched" href="${escAttr(link.url)}" target="_blank" rel="noreferrer noopener">${escHtml(link.title)}</a></h3>
          </div>
          <div class="u">${escHtml(secondaryText)}</div>
        </div>
        <div class="acts" aria-label="管理操作">
          <a class="toolbtn sm ${locked ? "is-disabled" : ""}" href="#modal-link" title="${locked ? "请先绑定同步文件后再编辑链接" : "编辑链接"}" aria-label="编辑链接" data-action="edit-link" data-link-id="${escAttr(link.id)}" ${locked ? 'aria-disabled="true" tabindex="-1"' : ""}>
            <span class="sr">编辑</span>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 20h4l11-11-4-4L4 16v4Z" stroke="#0c1b1d" stroke-width="1.8" stroke-linejoin="round" />
              <path d="M13 6l4 4" stroke="#0c1b1d" stroke-width="1.8" stroke-linecap="round" />
            </svg>
          </a>
          <a class="toolbtn sm ghost danger ${locked ? "is-disabled" : ""}" href="#modal-delete" title="${locked ? "请先绑定同步文件后再删除链接" : "删除链接"}" aria-label="删除链接" data-action="delete-link" data-link-id="${escAttr(link.id)}" ${locked ? 'aria-disabled="true" tabindex="-1"' : ""}>
            <span class="sr">删除</span>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6.5 8h11" stroke="#0c1b1d" stroke-width="1.8" stroke-linecap="round" />
              <path d="M9.2 8v11" stroke="#0c1b1d" stroke-width="1.8" stroke-linecap="round" />
              <path d="M14.8 8v11" stroke="#0c1b1d" stroke-width="1.8" stroke-linecap="round" />
              <path d="M8.5 6.2h7" stroke="#0c1b1d" stroke-width="1.8" stroke-linecap="round" />
            </svg>
          </a>
        </div>
      </div>
    </article>
  `;
}

function anchorIdForCategory(catId) {
  return `links-cat-${catId}`;
}

function onGridDragStart(event) {
  if (!isManageMode()) return;
  const card = event.target.closest(".linkcard[data-link-id]");
  if (!card) return;
  const linkId = card.getAttribute("data-link-id");
  if (!linkId) return;
  state.ui.draggingLinkId = linkId;
  state.ui.draggingContainer = card.parentElement;
  state.ui.dragDirty = false;
  state.ui.dragAllMode = state.db.activeCategoryId === ALL_CATEGORY_ID;
  card.classList.add("dragging");
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", linkId);
  }
}

function onGridDragOver(event) {
  if (!state.ui.draggingLinkId) return;
  const sourceCard = getCardElementById(state.ui.draggingLinkId);
  if (!sourceCard) return;
  const targetCard = event.target.closest(".linkcard[data-link-id]");
  const activeCategoryId = state.db.activeCategoryId;

  if (targetCard) {
    if (targetCard === sourceCard) return;
    if (activeCategoryId !== ALL_CATEGORY_ID) {
      if (targetCard.parentElement !== sourceCard.parentElement) return;
      if (targetCard.getAttribute("data-category-id") !== sourceCard.getAttribute("data-category-id")) return;
    }
    event.preventDefault();
    const rect = targetCard.getBoundingClientRect();
    const insertBefore = event.clientY < rect.top + rect.height / 2;
    const ref = insertBefore ? targetCard : targetCard.nextElementSibling;
    if (ref !== sourceCard) {
      targetCard.parentElement.insertBefore(sourceCard, ref);
      state.ui.dragDirty = true;
    }
    const categoryId = targetCard.parentElement && targetCard.parentElement.getAttribute("data-category-id");
    setGridDropTarget(categoryId);
    return;
  }

  const container = event.target.closest(".all-group-links, .site-group-links, .grid");
  if (!container) return;
  if (activeCategoryId !== ALL_CATEGORY_ID && container !== sourceCard.parentElement) return;
  event.preventDefault();
  const emptyHint = container.querySelector(".all-group-empty");
  if (emptyHint) {
    container.insertBefore(sourceCard, emptyHint);
  } else {
    container.appendChild(sourceCard);
  }
  setGridDropTarget(container.getAttribute("data-category-id"));
  state.ui.dragDirty = true;
}

function onGridDrop(event) {
  if (!state.ui.draggingLinkId) return;
  event.preventDefault();
  clearGridDropTargets();
}

function onGridDragEnd(_event) {
  const draggingId = state.ui.draggingLinkId;
  const draggingContainer = state.ui.draggingContainer;
  const shouldPersist = state.ui.dragDirty;
  const dragAllMode = Boolean(state.ui.dragAllMode);

  const card = draggingId ? getCardElementById(draggingId) : null;
  if (card) {
    card.classList.remove("dragging");
  }

  clearGridDropTargets();

  state.ui.draggingLinkId = null;
  state.ui.draggingContainer = null;
  state.ui.dragDirty = false;
  state.ui.dragAllMode = false;

  if (!shouldPersist || !draggingContainer) return;
  if (dragAllMode && state.db.activeCategoryId === ALL_CATEGORY_ID) {
    persistAllModeLinkOrder();
    return;
  }
  persistOrderFromContainer(draggingContainer);
}

function persistOrderFromContainer(container) {
  const cards = Array.from(container.querySelectorAll(".linkcard[data-link-id]"));
  if (!cards.length) return;
  const now = Date.now();
  cards.forEach((card, index) => {
    const linkId = card.getAttribute("data-link-id");
    const link = getLinkById(linkId);
    if (!link) return;
    link.order = (index + 1) * 10;
    link.updatedAt = now;
  });
  saveDb();
  renderAll();
  toast("已排序", "链接顺序已更新。");
}

function persistAllModeLinkOrder() {
  if (!els.grid) return;
  const groups = Array.from(els.grid.querySelectorAll(".all-group[data-category-id]"));
  if (!groups.length) return;
  const now = Date.now();
  groups.forEach((group) => {
    const categoryId = safeString(group.getAttribute("data-category-id"));
    const cards = Array.from(group.querySelectorAll(".all-group-links .linkcard[data-link-id]"));
    cards.forEach((card, index) => {
      const linkId = safeString(card.getAttribute("data-link-id"));
      const link = getLinkById(linkId);
      if (!link) return;
      link.categoryId = categoryId;
      link.order = (index + 1) * 10;
      link.updatedAt = now;
      card.setAttribute("data-category-id", categoryId);
    });
  });
  saveDb();
  renderAll();
  toast("已排序", "链接分类和顺序已更新。");
}

function clearGridDropTargets() {
  if (!els.grid) return;
  els.grid.querySelectorAll(".drop-target").forEach((node) => node.classList.remove("drop-target"));
}

function setGridDropTarget(categoryId) {
  if (!els.grid || !categoryId) return;
  clearGridDropTargets();
  const target = els.grid.querySelector(`.all-group-links[data-category-id="${CSS.escape(categoryId)}"]`);
  if (target) target.classList.add("drop-target");
}

function getCardElementById(linkId) {
  if (!els.grid || !linkId) return null;
  return Array.from(els.grid.querySelectorAll(".linkcard[data-link-id]"))
    .find((node) => node.getAttribute("data-link-id") === linkId) || null;
}

function onCategoryDragStart(event) {
  const cat = event.target.closest(".cat[data-cat-id][draggable='true']");
  if (!cat) return;
  const catId = cat.getAttribute("data-cat-id");
  if (!catId || catId === ALL_CATEGORY_ID) return;
  state.ui.draggingCategoryId = catId;
  state.ui.categoryDragDirty = false;
  cat.classList.add("dragging");
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", catId);
  }
}

function onCategoryDragOver(event) {
  const draggingId = state.ui.draggingCategoryId;
  if (!draggingId || !els.cats) return;
  const source = els.cats.querySelector(`.cat[data-cat-id="${CSS.escape(draggingId)}"]`);
  const target = event.target.closest(".cat[data-cat-id][draggable='true']");
  if (!source || !target || source === target) return;
  const targetId = target.getAttribute("data-cat-id");
  if (!targetId || targetId === ALL_CATEGORY_ID) return;
  event.preventDefault();
  const rect = target.getBoundingClientRect();
  const before = event.clientY < rect.top + rect.height / 2;
  const ref = before ? target : target.nextElementSibling;
  if (ref !== source) {
    target.parentElement.insertBefore(source, ref);
    state.ui.categoryDragDirty = true;
  }
}

function onCategoryDrop(event) {
  if (!state.ui.draggingCategoryId) return;
  event.preventDefault();
}

function onCategoryDragEnd(_event) {
  if (!els.cats) return;
  const draggingId = state.ui.draggingCategoryId;
  const dirty = state.ui.categoryDragDirty;
  const node = draggingId
    ? els.cats.querySelector(`.cat[data-cat-id="${CSS.escape(draggingId)}"]`)
    : null;
  if (node) node.classList.remove("dragging");
  state.ui.draggingCategoryId = null;
  state.ui.categoryDragDirty = false;
  if (!dirty) return;

  const ids = Array.from(els.cats.querySelectorAll(".cat[data-cat-id][draggable='true']"))
    .map((item) => safeString(item.getAttribute("data-cat-id")))
    .filter((id) => id && id !== ALL_CATEGORY_ID);
  const now = Date.now();
  ids.forEach((id, index) => {
    const cat = getCategoryById(id);
    if (!cat) return;
    cat.order = (index + 1) * 10;
    cat.updatedAt = now;
  });
  saveDb();
  renderAll();
  toast("已排序", "分类顺序已更新。");
}
