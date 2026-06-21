/**
 * 写作编辑器 - editor.js
 * 提供富文本编辑、字数统计、自动保存、AI辅助等功能
 * 通过 window.NativeBridge 与原生层通信
 */
(function () {
  "use strict";

  // ===== DOM 引用 =====
  const editor = document.getElementById("editor");
  const chapterTitle = document.getElementById("chapter-title");
  const wordCountEl = document.getElementById("word-count");
  const saveStatusEl = document.getElementById("save-status");
  const cursorPosEl = document.getElementById("cursor-pos");
  const loadingOverlay = document.getElementById("loading-overlay");

  // ===== 状态 =====
  let chapterId = null;
  let workId = null;
  let saveTimer = null;
  let lastSavedContent = "";
  let isDirty = false;
  const SAVE_DELAY = 3000; // 自动保存延迟 3 秒

  // ===== NativeBridge 兼容层 =====
  const NativeBridge = window.NativeBridge || {
    getChapterContent: async (id) => {
      console.warn("[Editor] NativeBridge.getChapterContent 不可用，使用模拟数据");
      return "<p>这是一个模拟章节内容。</p><p>NateiveBridge 尚未连接。</p>";
    },
    saveChapterContent: async (id, content, wordCount) => {
      console.warn("[Editor] NativeBridge.saveChapterContent 不可用，仅本地保存");
    },
    getChapterTitle: async (id) => "未命名章节",
    aiPolish: async (text) => text,
    aiContinue: async (text) => "",
    voiceInput: async () => "",
  };

  // ===== 初始化 =====
  function init() {
    // 从 URL 参数获取章节 ID
    const params = new URLSearchParams(window.location.search);
    chapterId = params.get("chapterId") || null;
    workId = params.get("workId") || null;

    // 初始化编辑器
    document.execCommand("defaultParagraphSeparator", false, "p");

    // 绑定事件
    bindToolbarEvents();
    bindEditorEvents();
    bindKeyboardShortcuts();

    // 加载章节内容
    if (chapterId) {
      loadChapter(chapterId);
    } else {
      editor.innerHTML = "<p>请选择或创建一个章节开始写作。</p>";
      updateWordCount();
    }
  }

  // ===== 加载章节 =====
  async function loadChapter(id) {
    showLoading(true);
    try {
      const content = await NativeBridge.getChapterContent(id);
      editor.innerHTML = content || "<p><br></p>";
      lastSavedContent = editor.innerHTML;

      // 尝试获取标题
      if (NativeBridge.getChapterTitle) {
        const title = await NativeBridge.getChapterTitle(id);
        chapterTitle.textContent = title || "未命名章节";
      } else {
        chapterTitle.textContent = `章节 ${id}`;
      }
    } catch (err) {
      console.error("[Editor] 加载章节失败:", err);
      editor.innerHTML = "<p>加载失败，请重试。</p>";
      setSaveStatus("error", "加载失败");
    } finally {
      showLoading(false);
      updateWordCount();
    }
  }

  // ===== 保存 =====
  async function save() {
    if (!chapterId) return;
    const content = editor.innerHTML;
    const text = editor.innerText || "";
    const wc = countWords(text);

    setSaveStatus("saving", "保存中...");
    try {
      await NativeBridge.saveChapterContent(chapterId, content, wc);
      lastSavedContent = content;
      isDirty = false;
      setSaveStatus("saved", "已保存");
      // 2 秒后恢复
      setTimeout(() => {
        if (!isDirty) setSaveStatus("", "就绪");
      }, 2000);
    } catch (err) {
      console.error("[Editor] 保存失败:", err);
      setSaveStatus("error", "保存失败");
    }
  }

  function scheduleAutoSave() {
    isDirty = true;
    setSaveStatus("saving", "待保存...");
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => save(), SAVE_DELAY);
  }

  // ===== 字数统计 =====
  function countWords(text) {
    if (!text) return 0;
    // 移除空白字符后统计
    const cleaned = text.replace(/[\s\n\r]/g, "");
    return cleaned.length;
  }

  function updateWordCount() {
    const text = editor.innerText || "";
    const wc = countWords(text);
    wordCountEl.textContent = formatWordCount(wc) + " 字";
  }

  function formatWordCount(n) {
    if (n >= 10000) return (n / 10000).toFixed(1) + "万";
    if (n >= 1000) return n.toLocaleString();
    return String(n);
  }

  // ===== 光标位置 =====
  function updateCursorPosition() {
    const sel = window.getSelection();
    if (!sel.rangeCount) return;

    const range = sel.getRangeAt(0);
    const text = editor.innerText || "";
    const preRange = document.createRange();
    preRange.selectNodeContents(editor);
    preRange.setEnd(range.startContainer, range.startOffset);
    const offset = preRange.toString().length;

    // 计算行和列
    const lines = text.substring(0, offset).split("\n");
    const line = lines.length;
    const col = lines[lines.length - 1].length + 1;
    cursorPosEl.textContent = `行 ${line} · 列 ${col}`;
  }

  // ===== 格式化命令 =====
  function execFormat(command, value) {
    document.execCommand(command, false, value || null);
    editor.focus();
    scheduleAutoSave();
  }

  function applyIndent() {
    const sel = window.getSelection();
    if (!sel.rangeCount) return;

    const block = sel.anchorNode.nodeType === 1
      ? sel.anchorNode
      : sel.anchorNode.parentElement;

    if (block && block.tagName === "P") {
      const current = block.style.textIndent;
      block.style.textIndent = current === "2em" ? "0" : "2em";
    }
    editor.focus();
    scheduleAutoSave();
  }

  function clearFormatting() {
    document.execCommand("removeFormat", false, null);
    editor.focus();
    scheduleAutoSave();
  }

  // ===== 工具栏事件 =====
  function bindToolbarEvents() {
    document.getElementById("btn-bold").addEventListener("click", () => execFormat("bold"));
    document.getElementById("btn-italic").addEventListener("click", () => execFormat("italic"));
    document.getElementById("btn-underline").addEventListener("click", () => execFormat("underline"));
    document.getElementById("btn-strike").addEventListener("click", () => execFormat("strikeThrough"));
    document.getElementById("btn-indent").addEventListener("click", applyIndent);
    document.getElementById("btn-clear").addEventListener("click", clearFormatting);
    document.getElementById("btn-undo").addEventListener("click", () => execFormat("undo"));
    document.getElementById("btn-redo").addEventListener("click", () => execFormat("redo"));
    document.getElementById("btn-save").addEventListener("click", () => save());

    document.getElementById("btn-back").addEventListener("click", () => {
      if (window.NativeBridge && window.NativeBridge.goBack) {
        window.NativeBridge.goBack();
      } else {
        window.history.back();
      }
    });

    // AI 功能按钮
    document.getElementById("btn-ai-polish").addEventListener("click", handleAiPolish);
    document.getElementById("btn-ai-continue").addEventListener("click", handleAiContinue);
    document.getElementById("btn-voice").addEventListener("click", handleVoiceInput);
  }

  // ===== 编辑器事件 =====
  function bindEditorEvents() {
    editor.addEventListener("input", () => {
      updateWordCount();
      scheduleAutoSave();
    });

    editor.addEventListener("keyup", updateCursorPosition);
    editor.addEventListener("mouseup", updateCursorPosition);

    // 粘贴时清理格式
    editor.addEventListener("paste", (e) => {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData("text/plain");
      document.execCommand("insertText", false, text);
    });

    // 聚焦时更新状态
    editor.addEventListener("focus", () => {
      updateCursorPosition();
      updateToolbarState();
    });
  }

  // ===== 键盘快捷键 =====
  function bindKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
      const mod = e.ctrlKey || e.metaKey;

      if (mod && e.key === "s") {
        e.preventDefault();
        save();
      } else if (mod && e.key === "b") {
        e.preventDefault();
        execFormat("bold");
      } else if (mod && e.key === "i") {
        e.preventDefault();
        execFormat("italic");
      } else if (mod && e.key === "u") {
        e.preventDefault();
        execFormat("underline");
      }
    });
  }

  // ===== 工具栏状态更新 =====
  function updateToolbarState() {
    const commands = {
      "btn-bold": "bold",
      "btn-italic": "italic",
      "btn-underline": "underline",
      "btn-strike": "strikeThrough",
    };

    for (const [btnId, cmd] of Object.entries(commands)) {
      const btn = document.getElementById(btnId);
      if (document.queryCommandState(cmd)) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    }
  }

  // ===== AI 功能 =====
  async function handleAiPolish() {
    const sel = window.getSelection();
    const text = sel.toString() || editor.innerText;
    if (!text.trim()) return;

    showLoading(true);
    try {
      const polished = await NativeBridge.aiPolish(text);
      if (polished && polished !== text) {
        if (sel.toString()) {
          document.execCommand("insertText", false, polished);
        } else {
          editor.innerHTML = polished;
        }
        scheduleAutoSave();
      }
    } catch (err) {
      console.error("[Editor] AI润色失败:", err);
    } finally {
      showLoading(false);
    }
  }

  async function handleAiContinue() {
    const text = editor.innerText || "";
    showLoading(true);
    try {
      const continuation = await NativeBridge.aiContinue(text);
      if (continuation) {
        // 将光标移到末尾并插入内容
        const range = document.createRange();
        range.selectNodeContents(editor);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        document.execCommand("insertText", false, "\n" + continuation);
        scheduleAutoSave();
      }
    } catch (err) {
      console.error("[Editor] AI续写失败:", err);
    } finally {
      showLoading(false);
    }
  }

  async function handleVoiceInput() {
    try {
      const text = await NativeBridge.voiceInput();
      if (text) {
        document.execCommand("insertText", false, text);
        scheduleAutoSave();
      }
    } catch (err) {
      console.error("[Editor] 语音输入失败:", err);
    }
  }

  // ===== UI 辅助 =====
  function setSaveStatus(type, text) {
    saveStatusEl.textContent = text;
    saveStatusEl.className = type || "";
  }

  function showLoading(show) {
    if (show) {
      loadingOverlay.classList.remove("hidden");
    } else {
      loadingOverlay.classList.add("hidden");
    }
  }

  // ===== 对外暴露 API（供原生层调用）=====
  window.EditorAPI = {
    /** 加载指定章节 */
    loadChapter: loadChapter,

    /** 获取当前编辑器 HTML 内容 */
    getContent: () => editor.innerHTML,

    /** 设置编辑器 HTML 内容 */
    setContent: (html) => {
      editor.innerHTML = html;
      updateWordCount();
    },

    /** 获取纯文本内容 */
    getText: () => editor.innerText,

    /** 获取字数 */
    getWordCount: () => countWords(editor.innerText || ""),

    /** 手动触发保存 */
    save: save,

    /** 设置章节标题 */
    setTitle: (title) => { chapterTitle.textContent = title; },

    /** 聚焦编辑器 */
    focus: () => editor.focus(),

    /** 设置可编辑状态 */
    setEditable: (editable) => {
      editor.contentEditable = editable ? "true" : "false";
    },

    /** 在光标处插入文本 */
    insertText: (text) => {
      editor.focus();
      document.execCommand("insertText", false, text);
      scheduleAutoSave();
    },

    /** 追加文本到末尾 */
    appendText: (text) => {
      editor.focus();
      const range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      document.execCommand("insertText", false, text);
      scheduleAutoSave();
    },
  };

  // ===== 启动 =====
  document.addEventListener("DOMContentLoaded", init);
  if (document.readyState !== "loading") init();
})();
