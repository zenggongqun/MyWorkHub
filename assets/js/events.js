"use strict";

function bindEvents() {
  if (els.searchForm) {
    els.searchForm.addEventListener("submit", onSearchSubmit);
  }

  if (els.engineTabs) {
    els.engineTabs.addEventListener("click", onEngineTabsClick);
  }

  if (els.openEngineModal) {
    els.openEngineModal.addEventListener("click", fillEngineModal);
  }

  if (els.engineAddBtn) {
    els.engineAddBtn.addEventListener("click", onEngineAdd);
  }

  if (els.engineOpenCustomFormBtn && els.engineCustomPanel) {
    els.engineOpenCustomFormBtn.addEventListener("click", () => {
      els.engineCustomPanel.hidden = !els.engineCustomPanel.hidden;
    });
  }

  if (els.engineSelectAllBtn) {
    els.engineSelectAllBtn.addEventListener("click", () => toggleAllPresetEngines(true));
  }

  if (els.engineSelectNoneBtn) {
    els.engineSelectNoneBtn.addEventListener("click", () => toggleAllPresetEngines(false));
  }

  if (els.engineCustomAddBtn) {
    els.engineCustomAddBtn.addEventListener("click", onEngineCustomAdd);
  }

  if (els.enginePresetList) {
    els.enginePresetList.addEventListener("change", onEnginePresetCheckChange);
  }

  if (els.enginePresetList) {
    els.enginePresetList.addEventListener("dragstart", onEnginePresetDragStart);
    els.enginePresetList.addEventListener("dragover", onEnginePresetDragOver);
    els.enginePresetList.addEventListener("drop", onEnginePresetDrop);
    els.enginePresetList.addEventListener("dragend", onEnginePresetDragEnd);
  }

  if (els.modeBrowse) {
    els.modeBrowse.addEventListener("change", onModeChange);
  }
  if (els.modeManage) {
    els.modeManage.addEventListener("change", onModeChange);
  }

  if (els.cats) {
    els.cats.addEventListener("click", (event) => {
      const editBtn = event.target.closest("[data-action='edit-category'][data-cat-id]");
      if (editBtn) {
        event.preventDefault();
        const catId = editBtn.getAttribute("data-cat-id");
        if (!catId) return;
        state.ui.editingCategoryId = catId;
        window.location.hash = "#modal-category";
        return;
      }

      const node = event.target.closest(".cat[data-cat-id]");
      if (!node) return;
      event.preventDefault();
      const catId = node.getAttribute("data-cat-id");
      if (!catId) return;

      if (catId === state.db.activeCategoryId) return;
      state.db.activeCategoryId = catId;
      saveDb();
      renderAll();
    });

    els.cats.addEventListener("dragstart", onCategoryDragStart);
    els.cats.addEventListener("dragover", onCategoryDragOver);
    els.cats.addEventListener("drop", onCategoryDrop);
    els.cats.addEventListener("dragend", onCategoryDragEnd);
  }

  if (els.grid) {
    els.grid.addEventListener("click", (event) => {
      const actionNode = event.target.closest("[data-action][data-link-id]");
      if (actionNode) {
        const linkId = actionNode.getAttribute("data-link-id");
        if (!linkId) return;
        const action = actionNode.getAttribute("data-action");
        if (action === "edit-link") {
          state.ui.editingLinkId = linkId;
        }
        if (action === "delete-link") {
          state.ui.deletingLinkId = linkId;
        }
        return;
      }

      if (event.target.closest("a.stretched")) {
        return;
      }

      const card = event.target.closest(".linkcard[data-link-id]");
      if (!card) return;
      event.preventDefault();
      if (isManageMode()) return;
      const linkId = card.getAttribute("data-link-id");
      const link = getLinkById(linkId);
      if (link) {
        openExternal(link.url);
      }
    });

    els.grid.addEventListener("dragstart", onGridDragStart);
    els.grid.addEventListener("dragover", onGridDragOver);
    els.grid.addEventListener("drop", onGridDrop);
    els.grid.addEventListener("dragend", onGridDragEnd);
  }

  if (els.openLinkModal) {
    els.openLinkModal.addEventListener("click", () => {
      state.ui.editingLinkId = null;
    });
  }

  if (els.openCategoryManage) {
    els.openCategoryManage.addEventListener("click", () => {
      state.ui.editingCategoryId = null;
    });
  }

  if (els.openCategoryDelete) {
    els.openCategoryDelete.addEventListener("click", (event) => {
      if (state.db.activeCategoryId === ALL_CATEGORY_ID) {
        event.preventDefault();
        toast("提示", "请先选择具体分类再删除。", true);
        return;
      }
      if (state.db.categories.length <= 1) {
        event.preventDefault();
        toast("提示", "至少保留一个分类。");
        return;
      }
      state.ui.deletingCategoryId = state.db.activeCategoryId;
      fillCategoryDeleteDialog();
    });
  }

  if (els.linkSaveBtn) {
    els.linkSaveBtn.addEventListener("click", onLinkSave);
  }

  if (els.linkDeleteConfirmBtn) {
    els.linkDeleteConfirmBtn.addEventListener("click", onLinkDeleteConfirm);
  }

  if (els.categoryConfirmBtn) {
    els.categoryConfirmBtn.addEventListener("click", onCategoryConfirm);
  }

  if (els.categoryColorPalette && els.categoryColorSelect) {
    els.categoryColorPalette.addEventListener("click", (event) => {
      const swatch = event.target.closest(".color-swatch[data-color]");
      if (!swatch) return;
      const color = swatch.getAttribute("data-color");
      if (!COLOR_TOKENS.has(color)) return;
      els.categoryColorSelect.value = color;
      syncColorPalette(color);
    });
  }

  if (els.categoryDeleteConfirmBtn) {
    els.categoryDeleteConfirmBtn.addEventListener("click", onCategoryDeleteConfirm);
  }

  if (els.dataExportBtn) {
    els.dataExportBtn.addEventListener("click", onDataExport);
  }

  if (els.dataExportDirectBtn) {
    els.dataExportDirectBtn.addEventListener("click", onDataExport);
  }

  if (els.dataImportApplyBtn) {
    els.dataImportApplyBtn.addEventListener("click", onDataImportApply);
  }

  if (els.planPanel) {
    els.planPanel.addEventListener("click", onPlanPanelClick);
  }

  if (els.todoQuickForm) {
    els.todoQuickForm.addEventListener("submit", onTodoQuickSubmit);
  }

  if (els.todoQuickPriority) {
    els.todoQuickPriority.addEventListener("change", syncPrioritySelectStyles);
  }

  if (els.todoGroups) {
    els.todoGroups.addEventListener("click", onTodoGroupsClick);
    els.todoGroups.addEventListener("change", onTodoGroupsChange);
  }

  if (els.todoPrioritySelect) {
    els.todoPrioritySelect.addEventListener("change", syncPrioritySelectStyles);
  }

  if (els.todoSaveBtn) {
    els.todoSaveBtn.addEventListener("click", onTodoSave);
  }

  if (els.todoDeleteConfirmBtn) {
    els.todoDeleteConfirmBtn.addEventListener("click", onTodoDeleteConfirm);
  }

  if (els.holidayAddBtn) {
    els.holidayAddBtn.addEventListener("click", onHolidayAdd);
  }

  if (els.holidayList) {
    els.holidayList.addEventListener("click", onHolidayListClick);
  }
}

function onModeChange() {
  const mode = els.modeManage && els.modeManage.checked ? "manage" : "browse";
  state.db.settings.ui.mode = mode;
  saveDb();
}

async function onSearchSubmit(event) {
  event.preventDefault();
  const q = els.queryInput ? els.queryInput.value.trim() : "";
  const engineId = getActiveEngineId();
  const engine = getEngineById(engineId);
  if (!engine) {
    toast("提示", "请先添加搜索引擎。", true);
    window.location.hash = "#modal-engine";
    return;
  }
  const url = buildSearchUrl(engine, q);

  if (q && shouldCopyQueryForEngine(engine)) {
    const copied = await copyToClipboard(q);
    if (copied) {
      toast("已复制", `已复制关键词，前往「${engineLabel(engine)}」后按 Ctrl+V 粘贴即可。`);
    } else {
      toast("提示", `即将打开「${engineLabel(engine)}」，请手动复制关键词：${q}`);
    }
    window.setTimeout(() => {
      openExternal(url);
    }, 700);
    return;
  }

  openExternal(url);
  toast("已打开", q ? `在 ${engineLabel(engine)} 搜索：${q}` : `已打开 ${engineLabel(engine)} 首页`);
}

function buildSearchUrl(engine, query) {
  const q = encodeURIComponent(query);
  const template = safeString(engine.searchUrl);
  const homeUrl = safeString(engine.homeUrl);
  if (query) {
    if (template.includes("{q}")) {
      return template.replace(/\{q\}/g, q);
    }
    return template.includes("?") ? `${template}&q=${q}` : `${template}?q=${q}`;
  }
  if (homeUrl) return homeUrl;
  if (template.includes("{q}")) return template.replace(/\{q\}/g, "");
  return template;
}

function onEngineTabsClick(event) {
  const tab = event.target.closest(".tab[data-engine-id]");
  if (!tab || !els.engineTabs) return;
  const id = tab.getAttribute("data-engine-id");
  if (!id) return;
  state.db.settings.activeEngineId = id;
  saveDb();
  renderHeader();
}

function onEngineAdd(event) {
  event.preventDefault();
  applyPresetEngineSelection();
}

function onEngineCustomAdd(event) {
  event.preventDefault();
  const name = safeString(els.engineNameInput && els.engineNameInput.value);
  const searchUrl = safeString(els.engineSearchInput && els.engineSearchInput.value);
  const homeUrl = safeString(els.engineHomeInput && els.engineHomeInput.value);
  if (!name || !searchUrl) {
    toast("校验失败", "请填写名称和搜索 URL 模板。", true);
    return;
  }
  if (!isLikelyUrlTemplate(searchUrl)) {
    toast("校验失败", "搜索 URL 模板必须是 http(s) 地址。", true);
    return;
  }
  if (homeUrl && !isValidHttpUrl(homeUrl)) {
    toast("校验失败", "主页 URL 必须是 http(s) 地址。", true);
    return;
  }
  const now = Date.now();
  const id = uid("eng");
  state.db.settings.engines.push({
    id,
    name,
    searchUrl,
    homeUrl,
    order: nextOrder(state.db.settings.engines),
    createdAt: now,
    updatedAt: now,
  });
  if (!state.db.settings.activeEngineId) {
    state.db.settings.activeEngineId = id;
  }
  saveDb();
  fillEngineModal();
  renderHeader();
  toast("已新增", `搜索引擎「${name}」已添加。`);
}

function toggleAllPresetEngines(checked) {
  if (!els.enginePresetList) return;
  const boxes = Array.from(els.enginePresetList.querySelectorAll("input[data-engine-preset-id]"));
  boxes.forEach((box) => {
    box.checked = checked;
  });
  onEnginePresetCheckChange();
}

function onEnginePresetCheckChange() {
  if (!els.enginePresetList) return;
  const selectedIds = new Set(
    Array.from(els.enginePresetList.querySelectorAll("input[data-engine-preset-id]:checked"))
      .map((node) => safeString(node.getAttribute("data-engine-preset-id")))
      .filter(Boolean)
  );
  renderEnginePresetList(selectedIds);
}

function applyPresetEngineSelection() {
  if (!els.enginePresetList) return;
  const orderedNodes = Array.from(els.enginePresetList.querySelectorAll(".engine-preset-item[data-engine-preset-id]"));
  const orderedIds = orderedNodes.map((node) => safeString(node.getAttribute("data-engine-preset-id"))).filter(Boolean);
  const checkedIds = new Set(
    orderedNodes
      .filter((node) => {
        const cb = node.querySelector("input[data-engine-preset-id]");
        return cb && cb.checked;
      })
      .map((node) => safeString(node.getAttribute("data-engine-preset-id")))
      .filter(Boolean)
  );
  const now = Date.now();
  const byId = new Map(COMMON_ENGINES.map((engine) => [engine.id, engine]));
  const selected = orderedIds
    .map((id) => byId.get(id))
    .filter(Boolean)
    .filter((engine) => checkedIds.has(engine.id))
    .map((engine, index) => ({
      id: engine.id,
      name: engine.name,
      searchUrl: engine.searchUrl,
      homeUrl: engine.homeUrl,
      order: (index + 1) * 10,
      createdAt: now,
      updatedAt: now,
    }));

  const customs = sortedEngines().filter((engine) => !COMMON_ENGINES.some((item) => item.id === engine.id));
  const merged = [...selected];
  customs.forEach((engine) => {
    merged.push({ ...engine, order: (merged.length + 1) * 10, updatedAt: now });
  });

  state.db.settings.engines = merged;
  state.db.settings.enginePresetOrder = normalizeEnginePresetOrder(orderedIds);
  if (!merged.some((item) => item.id === state.db.settings.activeEngineId)) {
    state.db.settings.activeEngineId = (merged[0] && merged[0].id) || "";
  }
  saveDb();
  renderHeader();
  renderEnginePresetList();
  toast("已保存", "默认引擎选择已更新。");
  closeHashModal();
}

function onEnginePresetDragStart(event) {
  const item = event.target.closest(".engine-preset-item[data-engine-preset-id]");
  if (!item) return;
  const id = item.getAttribute("data-engine-preset-id");
  if (!id) return;
  state.ui.draggingPresetEngineId = id;
  item.classList.add("dragging");
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", id);
  }
}

function onEnginePresetDragOver(event) {
  if (!state.ui.draggingPresetEngineId || !els.enginePresetList) return;
  const dragging = els.enginePresetList.querySelector(`.engine-preset-item[data-engine-preset-id="${CSS.escape(state.ui.draggingPresetEngineId)}"]`);
  const target = event.target.closest(".engine-preset-item[data-engine-preset-id]");
  if (!dragging || !target || dragging === target) return;
  event.preventDefault();
  const rect = target.getBoundingClientRect();
  const before = event.clientY < rect.top + rect.height / 2;
  const ref = before ? target : target.nextElementSibling;
  if (ref !== dragging) {
    target.parentElement.insertBefore(dragging, ref);
  }
}

function onEnginePresetDrop(event) {
  if (!state.ui.draggingPresetEngineId) return;
  event.preventDefault();
}

function onEnginePresetDragEnd(_event) {
  if (!els.enginePresetList) return;
  const dragging = els.enginePresetList.querySelector(".engine-preset-item.dragging");
  if (dragging) dragging.classList.remove("dragging");
  const orderedIds = Array.from(els.enginePresetList.querySelectorAll(".engine-preset-item[data-engine-preset-id]"))
    .map((node) => safeString(node.getAttribute("data-engine-preset-id")))
    .filter(Boolean);
  state.ui.draggingPresetEngineId = null;
  state.db.settings.enginePresetOrder = normalizeEnginePresetOrder(orderedIds);
  saveDb();
}

function onLinkSave(event) {
  event.preventDefault();
  const title = safeString(els.linkTitleInput && els.linkTitleInput.value);
  const url = safeString(els.linkUrlInput && els.linkUrlInput.value);
  const note = safeString(els.linkNoteInput && els.linkNoteInput.value);
  const categoryId = safeString(els.linkCategorySelect && els.linkCategorySelect.value) || state.db.activeCategoryId;

  if (!title) {
    toast("校验失败", "请输入链接名称。", true);
    return;
  }
  if (!isValidHttpUrl(url)) {
    toast("校验失败", "请输入完整的 http(s) 链接。", true);
    return;
  }

  const now = Date.now();
  const existing = state.ui.editingLinkId ? getLinkById(state.ui.editingLinkId) : null;
  const category = getCategoryById(categoryId);

  if (existing) {
    existing.title = title;
    existing.url = url;
    existing.note = note;
    existing.categoryId = categoryId;
    existing.updatedAt = now;
  } else {
    const order = nextOrderForLinks(categoryId);
    state.db.links.push({
      id: uid("link"),
      categoryId,
      title,
      url,
      note,
      order,
      createdAt: now,
      updatedAt: now,
    });
  }

  state.db.activeCategoryId = categoryId;
  state.ui.editingLinkId = null;
  saveDb();
  renderAll();
  closeHashModal();
  if (existing) {
    toast("已更新链接", `「${title}」已同步到${category ? `「${category.name}」` : "当前分类"}。`, false);
  } else {
    toast("已添加链接", `「${title}」已加入${category ? `「${category.name}」` : "当前分类"}，现在可以直接打开了。`, false);
  }
}

function onLinkDeleteConfirm(event) {
  event.preventDefault();
  const id = state.ui.deletingLinkId;
  if (!id) {
    toast("提示", "未找到要删除的链接。", true);
    return;
  }
  const idx = state.db.links.findIndex((item) => item.id === id);
  if (idx < 0) {
    toast("提示", "链接已不存在。", true);
    closeHashModal();
    return;
  }
  const removed = state.db.links[idx];
  const category = getCategoryById(removed.categoryId);
  state.db.links.splice(idx, 1);
  state.ui.deletingLinkId = null;
  saveDb();
  renderAll();
  closeHashModal();
  toast("已删除链接", `「${removed.title}」已从${category ? `「${category.name}」` : "当前分类"}移除。`);
}

function onCategoryConfirm(event) {
  event.preventDefault();
  const name = safeString(els.categoryNameInput && els.categoryNameInput.value);
  const colorToken = safeString(els.categoryColorSelect && els.categoryColorSelect.value);
  const editingId = state.ui.editingCategoryId;
  const editingCategory = editingId ? getCategoryById(editingId) : null;

  if (!name) {
    toast("校验失败", "请输入分类名称。", true);
    return;
  }

  const exists = state.db.categories.some((cat) => cat.name === name && cat.id !== editingId);
  if (exists) {
    toast("校验失败", "分类名称已存在。", true);
    return;
  }

  const now = Date.now();
  if (editingId && !editingCategory) {
    toast("失败", "当前分类不存在。", true);
    return;
  }

  if (editingCategory) {
    editingCategory.name = name;
    editingCategory.colorToken = COLOR_TOKENS.has(colorToken) ? colorToken : editingCategory.colorToken;
    editingCategory.updatedAt = now;
    toast("已保存", "分类已更新。");
  } else {
    const id = uid("cat");
    state.db.categories.push({
      id,
      name,
      order: nextOrder(state.db.categories),
      colorToken: COLOR_TOKENS.has(colorToken) ? colorToken : "slate",
      createdAt: now,
      updatedAt: now,
    });
    state.db.activeCategoryId = id;
    toast("已新增", `分类「${name}」已创建。`);
  }

  state.ui.editingCategoryId = null;
  saveDb();
  renderAll();
  closeHashModal();
}

function onCategoryDeleteConfirm(event) {
  event.preventDefault();
  if (state.db.categories.length <= 1) {
    toast("提示", "至少保留一个分类。", true);
    return;
  }

  const targetId = state.ui.deletingCategoryId || state.db.activeCategoryId;
  const cat = getCategoryById(targetId);
  if (!cat) {
    toast("提示", "分类不存在。", true);
    closeHashModal();
    return;
  }

  const affected = state.db.links.filter((item) => item.categoryId === targetId).length;
  state.db.links = state.db.links.filter((item) => item.categoryId !== targetId);
  state.db.categories = state.db.categories.filter((item) => item.id !== targetId);
  state.db.activeCategoryId = state.db.categories[0].id;
  state.ui.deletingCategoryId = null;

  saveDb();
  renderAll();
  closeHashModal();
  toast("已删除分类", `「${cat.name}」已移除，同时清理了 ${affected} 条关联链接。`);
}

async function onDataExport(event) {
  if (event) event.preventDefault();
  const json = JSON.stringify(state.db, null, 2);
  const date = new Date();
  const fileName = `workhub-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}.json`;

  if (window.isSecureContext && typeof window.showSaveFilePicker === "function") {
    try {
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: fileName,
        types: [
          {
            description: "JSON Files",
            accept: { "application/json": [".json"] },
          },
        ],
      });
      const writable = await fileHandle.createWritable();
      await writable.write(json);
      await writable.close();
      toast("已导出", `已保存 ${fileName}`);
      return;
    } catch (error) {
      if (error && error.name === "AbortError") {
        return;
      }
    }
  }

  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  toast("已导出", `下载 ${fileName}`);
}

async function onDataImportApply(event) {
  event.preventDefault();
  const strategy = safeString(els.importStrategy && els.importStrategy.value) || "overwrite";
  if (strategy !== "overwrite") {
    toast("提示", "首版仅支持覆盖导入。", true);
    return;
  }

  const file = els.importInput && els.importInput.files && els.importInput.files[0];
  if (!file) {
    toast("导入失败", "请先选择 JSON 文件。", true);
    return;
  }

  let text = "";
  try {
    text = await file.text();
  } catch (_error) {
    toast("导入失败", "读取文件失败。", true);
    return;
  }

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (_error) {
    toast("导入失败", "JSON 解析失败。", true);
    return;
  }

  const normalized = validateAndNormalize(parsed);
  if (!normalized.categories.length) {
    toast("导入失败", "数据结构不合法。", true);
    return;
  }

  state.db = normalized;
  saveDb();
  renderAll();
  closeHashModal();
  toast("导入成功", "已覆盖本地数据。", false);
}

function onPlanPanelClick(event) {
  const actionBtn = event.target.closest("[data-action^='cal-']");
  if (actionBtn) {
    const action = actionBtn.getAttribute("data-action");
    const current = parseYm(state.db.plan.calendarMonth) || new Date();
    if (action === "cal-prev") {
      state.db.plan.calendarMonth = formatYm(new Date(current.getFullYear(), current.getMonth() - 1, 1));
    }
    if (action === "cal-next") {
      state.db.plan.calendarMonth = formatYm(new Date(current.getFullYear(), current.getMonth() + 1, 1));
    }
    if (action === "cal-today") {
      const today = new Date();
      state.db.plan.selectedDate = formatYmd(today);
      state.db.plan.calendarMonth = formatYm(today);
    }
    saveDb();
    renderPlanPanel();
    return;
  }

  const viewBtn = event.target.closest("button[data-action='todo-view-week'], button[data-action='todo-view-month']");
  if (viewBtn) {
    const action = viewBtn.getAttribute("data-action");
    state.db.plan.todoView = action === "todo-view-month" ? "month" : "week";
    saveDb();
    renderPlanPanel();
    return;
  }

  const sceneBtn = event.target.closest("button[data-action='todo-scene-filter']");
  if (sceneBtn) {
    const scene = safeString(sceneBtn.getAttribute("data-scene"));
    state.db.plan.sceneFilter = state.db.plan.sceneFilter === scene ? "" : scene;
    saveDb();
    renderPlanPanel();
    return;
  }

  const dayBtn = event.target.closest(".calday[data-date]");
  if (!dayBtn) return;
  const date = safeString(dayBtn.getAttribute("data-date"));
  if (!parseYmd(date)) return;
  state.db.plan.selectedDate = date;
  state.db.plan.calendarMonth = date.slice(0, 7);
  saveDb();
  renderPlanPanel();
}

function onTodoQuickSubmit(event) {
  event.preventDefault();
  const title = safeString(els.todoQuickTitle && els.todoQuickTitle.value);
  if (!title) {
    toast("提示", "请输入待办标题。", true);
    return;
  }
  const now = Date.now();

  const selectedDate = parseYmd(safeString(els.todoQuickDate && els.todoQuickDate.value))
    || parseYmd(state.db.plan.selectedDate)
    || new Date();
  const date = formatYmd(selectedDate);
  const priority = ["high", "medium", "low"].includes(safeString(els.todoQuickPriority && els.todoQuickPriority.value))
    ? safeString(els.todoQuickPriority && els.todoQuickPriority.value)
    : "medium";
  state.db.plan.todos.push({
    id: uid("todo"),
    title,
    date,
    priority,
    scene: "work",
    done: false,
    order: nextOrder(state.db.plan.todos),
    createdAt: now,
    updatedAt: now,
  });
  if (els.todoQuickTitle) els.todoQuickTitle.value = "";
  if (els.todoQuickDate) els.todoQuickDate.value = "";
  state.db.plan.selectedDate = date;
  state.db.plan.calendarMonth = date.slice(0, 7);
  saveDb();
  renderPlanPanel();
  toast("已新增", "新的行动项已经放进清单。", false);
}

function onTodoGroupsClick(event) {
  const dateNode = event.target.closest("[data-action='select-todo-date'][data-date]");
  if (dateNode) {
    const date = safeString(dateNode.getAttribute("data-date"));
    if (!parseYmd(date)) return;
    state.db.plan.selectedDate = date;
    state.db.plan.calendarMonth = date.slice(0, 7);
    saveDb();
    renderPlanPanel();
    return;
  }
  const actionNode = event.target.closest("[data-action][data-todo-id]");
  if (!actionNode) return;
  const todoId = actionNode.getAttribute("data-todo-id");
  if (!todoId) return;
  const action = actionNode.getAttribute("data-action");
  if (action === "edit-todo") {
    state.ui.editingTodoId = todoId;
  }
  if (action === "delete-todo") {
    state.ui.deletingTodoId = todoId;
  }
}

function onTodoGroupsChange(event) {
  const cb = event.target.closest("input[data-action='toggle-todo'][data-todo-id]");
  if (!cb) return;
  const todoId = cb.getAttribute("data-todo-id");
  const todo = getTodoById(todoId);
  if (!todo) return;
  const previous = { ...todo };
  todo.done = Boolean(cb.checked);
  todo.updatedAt = Date.now();
  state.ui.lastCompletedTodo = todo.done ? previous : null;
  saveDb();
  renderPlanPanel();
  if (todo.done) {
    toast("已完成", "太棒了，又完成一件事。", false, {
      label: "撤销",
      onClick: () => {
        const target = getTodoById(previous.id);
        if (!target) return;
        target.done = false;
        target.updatedAt = Date.now();
        saveDb();
        renderPlanPanel();
        toast("已撤销", "任务已回到进行中。", false);
      },
    });
    return;
  }
  toast("已更新", "任务已恢复为进行中。", false);
}

function onTodoSave(event) {
  event.preventDefault();
  const title = safeString(els.todoTitleInput && els.todoTitleInput.value);
  const date = parseYmd(safeString(els.todoDateInput && els.todoDateInput.value)) ? safeString(els.todoDateInput && els.todoDateInput.value) : "";
  const priority = ["high", "medium", "low"].includes(safeString(els.todoPrioritySelect && els.todoPrioritySelect.value))
    ? safeString(els.todoPrioritySelect && els.todoPrioritySelect.value)
    : "medium";
  const scene = ["work", "life", "study", "other"].includes(safeString(els.todoSceneSelect && els.todoSceneSelect.value))
    ? safeString(els.todoSceneSelect && els.todoSceneSelect.value)
    : "other";
  if (!title) {
    toast("校验失败", "请输入待办标题。", true);
    return;
  }
  const now = Date.now();
  const editing = state.ui.editingTodoId ? getTodoById(state.ui.editingTodoId) : null;
  if (editing) {
    editing.title = title;
    editing.date = date;
    editing.priority = priority;
    editing.scene = scene;
    editing.updatedAt = now;
  } else {
    state.db.plan.todos.push({
      id: uid("todo"),
      title,
      date,
      priority,
      scene,
      done: false,
      order: nextOrder(state.db.plan.todos),
      createdAt: now,
      updatedAt: now,
    });
  }
  state.ui.editingTodoId = null;
  saveDb();
  renderPlanPanel();
  closeHashModal();
  toast("已保存", "任务已经更新到行动清单。", false);
}

function onTodoDeleteConfirm(event) {
  event.preventDefault();
  const id = state.ui.deletingTodoId;
  if (!id) return;
  const idx = state.db.plan.todos.findIndex((item) => item.id === id);
  if (idx < 0) {
    closeHashModal();
    return;
  }
  const removed = state.db.plan.todos[idx];
  state.db.plan.todos.splice(idx, 1);
  state.ui.deletingTodoId = null;
  state.ui.deletingTodoScope = "week";
  saveDb();
  renderPlanPanel();
  closeHashModal();
  toast("已删除待办", `「${removed.title}」已从行动清单移除。`);
}

function onHolidayAdd(event) {
  event.preventDefault();
  const name = safeString(els.holidayNameInput && els.holidayNameInput.value);
  const startDate = safeString(els.holidayStartInput && els.holidayStartInput.value);
  const endDate = safeString(els.holidayEndInput && els.holidayEndInput.value);
  if (!name || !parseYmd(startDate) || !parseYmd(endDate)) {
    toast("校验失败", "请填写完整假日信息。", true);
    return;
  }
  if (startDate > endDate) {
    toast("校验失败", "结束日期不能早于开始日期。", true);
    return;
  }
  const now = Date.now();
  state.db.plan.holidays.push({
    id: uid("holiday"),
    name,
    startDate,
    endDate,
    order: nextOrder(state.db.plan.holidays),
    createdAt: now,
    updatedAt: now,
  });
  markHolidayManual();
  saveDb();
  renderPlanPanel();
  fillHolidayModal();
  toast("已新增", `已添加假日：${name}`);
}

function onHolidayListClick(event) {
  const node = event.target.closest("[data-action='delete-holiday'][data-holiday-id]");
  if (!node) return;
  const holidayId = node.getAttribute("data-holiday-id");
  if (!holidayId) return;
  const idx = state.db.plan.holidays.findIndex((item) => item.id === holidayId);
  if (idx < 0) return;
  const removed = state.db.plan.holidays[idx];
  state.db.plan.holidays.splice(idx, 1);
  markHolidayManual();
  saveDb();
  renderPlanPanel();
  renderHolidayList();
  toast("已删除假日", `「${removed.name}」假期安排已移除。`);
}
