# 09e UI层

> **状态：✅ HTML+NativeBridge 方案** | 统一决策见 `Operit网文写作改造计划.md` 4.3 / 5.3 节
> - **UI 采用 HTML+NativeBridge 方案**，不直接编写 Compose 页面。
> - HTML 设计稿位于 `D:\工作区\项目\UI\`，经整理后放入 ToolPkg 的 `resources/webapp/` 目录。
> - HTML 通过 `window.NativeBridge`（即 `NB`）调用原生后端 API 获取/保存数据。
> - 本文档是**分步实现指南**，描述如何将 HTML 设计稿从空壳变为可用页面。

---

## 步骤 1：整理 HTML 资源到 ToolPkg

将 `D:\工作区\项目\UI\` 中的 HTML 设计稿整理到 ToolPkg 的资源目录中。

### 目标目录结构

```
packages/novelide/
  src/
    main.ts              ← ToolPkg 入口（步骤 2）
    native-bridge.ts     ← NativeBridge 类型声明（步骤 3）
  resources/
    webapp/
      网文写作.html       ← 作品列表、编辑器、资料管理、大纲、统计
      工具箱.html         ← 写作工具
      完整版.html         ← 工作区
      css/
        style.css
      js/
        app.js           ← 主逻辑（步骤 4 重写）
        bridge.js        ← NativeBridge 调用封装
      assets/
        icons/
```

### 操作

1. 复制 HTML 文件到 `resources/webapp/`。
2. 确保 HTML 中的相对路径引用正确（CSS、JS、图片）。
3. 删除或注释掉 HTML 中的 mock 数据和 `alert()` 调用。

---

## 步骤 2：在 ToolPkg main.ts 中注册 UI 路由和导航入口

文件路径：`packages/novelide/src/main.ts`

```typescript
import { Icons } from "@operit/toolpkg";

export function registerToolPkg(): boolean {

  // ---- 注册 7 个侧边栏入口 ----

  const entries = [
    { id: "novel_works_sidebar",     route: "toolpkg:com.operit.novelide:ui:novel_works",     title: { zh: "我的作品", en: "My Works" },     icon: Icons.Book,          order: 120 },
    { id: "novel_editor_sidebar",    route: "toolpkg:com.operit.novelide:ui:novel_editor",    title: { zh: "写作编辑器", en: "Novel Editor" }, icon: Icons.Edit,          order: 130 },
    { id: "novel_materials_sidebar", route: "toolpkg:com.operit.novelide:ui:novel_materials", title: { zh: "资料管理", en: "Materials" },     icon: Icons.FolderSpecial, order: 140 },
    { id: "novel_outline_sidebar",   route: "toolpkg:com.operit.novelide:ui:novel_outline",   title: { zh: "大纲管理", en: "Outline" },       icon: Icons.List,          order: 150 },
    { id: "novel_stats_sidebar",     route: "toolpkg:com.operit.novelide:ui:novel_stats",     title: { zh: "写作统计", en: "Statistics" },    icon: Icons.BarChart,      order: 160 },
    { id: "novel_tools_sidebar",     route: "toolpkg:com.operit.novelide:ui:novel_tools",     title: { zh: "写作工具", en: "Tools" },         icon: Icons.AutoFixHigh,   order: 170 },
    { id: "novel_workspace_sidebar", route: "toolpkg:com.operit.novelide:ui:novel_workspace", title: { zh: "工作区", en: "Workspace" },       icon: Icons.Workspaces,    order: 180 },
  ];

  for (const entry of entries) {
    ToolPkg.registerNavigationEntry({
      ...entry,
      surface: "main_sidebar_plugins",
    });
  }

  // ---- 注册 7 个 UI 路由（HTML 页面） ----

  ToolPkg.registerUiRoute({
    id: "novel_works",
    route: "toolpkg:com.operit.novelide:ui:novel_works",
    runtime: "web",
    screen: "resources/webapp/网文写作.html#works",
    params: {},
    title: { zh: "我的作品", en: "My Works" },
  });

  ToolPkg.registerUiRoute({
    id: "novel_editor",
    route: "toolpkg:com.operit.novelide:ui:novel_editor",
    runtime: "web",
    screen: "resources/webapp/网文写作.html#editor",
    params: { workId: "string" },
    title: { zh: "写作编辑器", en: "Novel Editor" },
  });

  ToolPkg.registerUiRoute({
    id: "novel_materials",
    route: "toolpkg:com.operit.novelide:ui:novel_materials",
    runtime: "web",
    screen: "resources/webapp/网文写作.html#materials",
    params: { workId: "string" },
    title: { zh: "资料管理", en: "Materials" },
  });

  ToolPkg.registerUiRoute({
    id: "novel_outline",
    route: "toolpkg:com.operit.novelide:ui:novel_outline",
    runtime: "web",
    screen: "resources/webapp/网文写作.html#outline",
    params: { workId: "string" },
    title: { zh: "大纲管理", en: "Outline" },
  });

  ToolPkg.registerUiRoute({
    id: "novel_stats",
    route: "toolpkg:com.operit.novelide:ui:novel_stats",
    runtime: "web",
    screen: "resources/webapp/网文写作.html#stats",
    params: {},
    title: { zh: "写作统计", en: "Statistics" },
  });

  ToolPkg.registerUiRoute({
    id: "novel_tools",
    route: "toolpkg:com.operit.novelide:ui:novel_tools",
    runtime: "web",
    screen: "resources/webapp/工具箱.html",
    params: {},
    title: { zh: "写作工具", en: "Tools" },
  });

  ToolPkg.registerUiRoute({
    id: "novel_workspace",
    route: "toolpkg:com.operit.novelide:ui:novel_workspace",
    runtime: "web",
    screen: "resources/webapp/完整版.html#workspace",
    params: {},
    title: { zh: "工作区", en: "Workspace" },
  });

  return true;
}
```

---

## 步骤 3：实现 NativeBridge 网文 API

需要在原生层（Kotlin）为 WebView 注入 `@JavascriptInterface` 方法，供 HTML 中的 JS 调用。

### 3.1 定义 Bridge 接口

文件路径：`app/src/main/java/com/ai/assistance/operit/ui/novel/bridge/NovelNativeBridge.kt`

```kotlin
package com.ai.assistance.operit.ui.novel.bridge

import android.webkit.JavascriptInterface
import com.ai.assistance.operit.data.repository.novel.NovelRepository
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

/**
 * 网文写作模块的 NativeBridge，注入到 WebView 中供 HTML/JS 调用。
 * JS 端通过 window.NativeBridge.xxx() 调用。
 */
class NovelNativeBridge(
    private val novelRepository: NovelRepository
) {

    // ====== 作品管理 ======

    @JavascriptInterface
    fun getNovelWorks(): String {
        val works = novelRepository.getAllWorksSync()
        return Json.encodeToString(works)
    }

    @JavascriptInterface
    fun getNovelWork(workId: String): String {
        val work = novelRepository.getWork(workId)
        return Json.encodeToString(work)
    }

    @JavascriptInterface
    fun createNovelWork(title: String, genre: String): String {
        val work = novelRepository.createWork(title, genre)
        return Json.encodeToString(work)
    }

    @JavascriptInterface
    fun deleteNovelWork(workId: String): Boolean {
        novelRepository.deleteWork(workId)
        return true
    }

    @JavascriptInterface
    fun updateNovelWork(workId: String, jsonData: String): Boolean {
        novelRepository.updateWork(workId, jsonData)
        return true
    }

    // ====== 章节管理 ======

    @JavascriptInterface
    fun getChapterList(workId: String): String {
        val chapters = novelRepository.getChaptersSync(workId)
        return Json.encodeToString(chapters)
    }

    @JavascriptInterface
    fun getChapterContent(chapterId: String): String {
        return novelRepository.getChapterContent(chapterId) ?: ""
    }

    @JavascriptInterface
    fun saveChapterContent(chapterId: String, content: String, wordCount: Int): Boolean {
        novelRepository.saveChapterContent(chapterId, content, wordCount)
        return true
    }

    @JavascriptInterface
    fun addChapter(workId: String, title: String): String {
        val chapterId = novelRepository.createChapter(workId, title)
        return chapterId
    }

    @JavascriptInterface
    fun deleteChapter(chapterId: String): Boolean {
        novelRepository.deleteChapter(chapterId)
        return true
    }

    // ====== 资料管理 ======

    @JavascriptInterface
    fun getMaterials(workId: String, category: String): String {
        val materials = novelRepository.getMaterialsSync(workId, category)
        return Json.encodeToString(materials)
    }

    @JavascriptInterface
    fun saveMaterial(workId: String, category: String, id: String, jsonData: String): Boolean {
        novelRepository.saveMaterial(workId, category, id, jsonData)
        return true
    }

    @JavascriptInterface
    fun deleteMaterial(category: String, id: String): Boolean {
        novelRepository.deleteMaterial(category, id)
        return true
    }

    // ====== 大纲管理 ======

    @JavascriptInterface
    fun getOutline(workId: String): String {
        return novelRepository.getOutline(workId) ?: ""
    }

    @JavascriptInterface
    fun saveOutline(workId: String, content: String): Boolean {
        novelRepository.saveOutline(workId, content)
        return true
    }

    // ====== 统计 ======

    @JavascriptInterface
    fun getWritingStats(): String {
        val works = novelRepository.getAllWorksSync()
        val stats = mapOf(
            "totalWorks" to works.size,
            "totalWords" to works.sumOf { it.currentWordCount },
            "works" to works.map { mapOf("id" to it.id, "title" to it.title, "wordCount" to it.currentWordCount) }
        )
        return Json.encodeToString(stats)
    }

    // ====== 工作区 ======

    @JavascriptInterface
    fun exportWork(workId: String): String {
        return novelRepository.exportWork(workId)
    }

    @JavascriptInterface
    fun importWork(filePath: String): String {
        val work = novelRepository.importWork(filePath)
        return Json.encodeToString(work)
    }

    @JavascriptInterface
    fun backupWorkspace(): String {
        return novelRepository.backupWorkspace()
    }
}
```

### 3.2 注入到 WebView

在 ToolPkg 加载 HTML 页面时，将 Bridge 注入 WebView：

```kotlin
// 在 WebView 初始化时
webView.addJavascriptInterface(
    NovelNativeBridge(novelRepository),
    "NativeBridge"   // JS 端通过 window.NativeBridge 访问
)
```

---

## 步骤 4：重写 HTML 中的 JS

将 HTML 中的 `alert()`、空壳函数、mock 数据替换为真实的 NativeBridge 调用。

### 4.1 bridge.js — NativeBridge 调用封装

文件路径：`resources/webapp/js/bridge.js`

```javascript
/**
 * NativeBridge 调用封装层
 * 统一处理异步调用、错误处理、JSON 解析
 */
const NB = window.NativeBridge;

const NovelBridge = {

    // ---- 作品 ----

    async getWorks() {
        const raw = NB.getNovelWorks();
        return JSON.parse(raw);
    },

    async getWork(workId) {
        const raw = NB.getNovelWork(workId);
        return JSON.parse(raw);
    },

    async createWork(title, genre) {
        const raw = NB.createNovelWork(title, genre);
        return JSON.parse(raw);
    },

    async deleteWork(workId) {
        return NB.deleteNovelWork(workId);
    },

    async updateWork(workId, data) {
        return NB.updateNovelWork(workId, JSON.stringify(data));
    },

    // ---- 章节 ----

    async getChapters(workId) {
        const raw = NB.getChapterList(workId);
        return JSON.parse(raw);
    },

    async getChapterContent(chapterId) {
        return NB.getChapterContent(chapterId);
    },

    async saveChapter(chapterId, content, wordCount) {
        return NB.saveChapterContent(chapterId, content, wordCount);
    },

    async addChapter(workId, title) {
        return NB.addChapter(workId, title);
    },

    async deleteChapter(chapterId) {
        return NB.deleteChapter(chapterId);
    },

    // ---- 资料 ----

    async getMaterials(workId, category) {
        const raw = NB.getMaterials(workId, category);
        return JSON.parse(raw);
    },

    async saveMaterial(workId, category, id, data) {
        return NB.saveMaterial(workId, category, id, JSON.stringify(data));
    },

    async deleteMaterial(category, id) {
        return NB.deleteMaterial(category, id);
    },

    // ---- 大纲 ----

    async getOutline(workId) {
        return NB.getOutline(workId);
    },

    async saveOutline(workId, content) {
        return NB.saveOutline(workId, content);
    },

    // ---- 统计 ----

    async getStats() {
        const raw = NB.getWritingStats();
        return JSON.parse(raw);
    },

    // ---- 工作区 ----

    async exportWork(workId) {
        return NB.exportWork(workId);
    },

    async importWork(filePath) {
        const raw = NB.importWork(filePath);
        return JSON.parse(raw);
    },

    async backup() {
        return NB.backupWorkspace();
    },
};
```

### 4.2 app.js — 页面逻辑示例（作品列表）

```javascript
/**
 * 作品列表页面逻辑
 */

let worksList = [];

// 加载作品列表
async function loadWorks() {
    try {
        worksList = await NovelBridge.getWorks();
        renderWorksList(worksList);
    } catch (e) {
        console.error("加载作品失败:", e);
        showToast("加载失败: " + e.message);
    }
}

// 渲染作品列表
function renderWorksList(works) {
    const container = document.getElementById("works-container");
    if (!works || works.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📖</div>
                <h3>暂无作品</h3>
                <p>点击下方按钮创建你的第一部作品</p>
                <button class="btn btn-primary" onclick="showCreateDialog()">创建作品</button>
            </div>`;
        return;
    }

    container.innerHTML = works.map(work => `
        <div class="work-card" onclick="openWork('${work.id}')">
            <div class="work-title">${escapeHtml(work.title)}</div>
            <div class="work-genre">${escapeHtml(work.genre || '未分类')}</div>
            <div class="work-stats">
                <span class="word-count">${work.currentWordCount || 0} 字</span>
                <span class="status-badge status-${work.status}">${statusText(work.status)}</span>
            </div>
        </div>
    `).join("");
}

// 创建作品
async function createWork() {
    const title = document.getElementById("new-title").value.trim();
    const genre = document.getElementById("new-genre").value.trim();
    if (!title) { showToast("请输入作品标题"); return; }

    try {
        const work = await NovelBridge.createWork(title, genre);
        showToast("创建成功");
        closeCreateDialog();
        window.location.hash = `editor?workId=${work.id}`;
    } catch (e) {
        showToast("创建失败: " + e.message);
    }
}

// 打开作品（跳转编辑器）
function openWork(workId) {
    window.location.hash = `editor?workId=${workId}`;
}

// 删除作品
async function deleteWork(workId) {
    if (!confirm("确定删除此作品？此操作不可恢复。")) return;
    try {
        await NovelBridge.deleteWork(workId);
        showToast("已删除");
        loadWorks();
    } catch (e) {
        showToast("删除失败: " + e.message);
    }
}

// 页面初始化
document.addEventListener("DOMContentLoaded", () => {
    loadWorks();
});
```

---

## 步骤 5：页面间跳转

HTML 页面之间的跳转通过 `window.location.hash` 实现，无需原生层参与。

### 跳转规则

| 从 | 到 | 跳转方式 |
|----|----|---------|
| 作品列表 | 编辑器 | `window.location.hash = "editor?workId=xxx"` |
| 编辑器 | 资料管理 | `window.location.hash = "materials?workId=xxx"` |
| 编辑器 | 大纲管理 | `window.location.hash = "outline?workId=xxx"` |
| 任意页面 | 作品列表 | `window.location.hash = "works"` |
| 任意页面 | 写作统计 | `window.location.hash = "stats"` |
| 任意页面 | 写作工具 | 跳转到 `工具箱.html` |
| 任意页面 | 工作区 | 跳转到 `完整版.html#workspace` |

### 跨页面跳转（不同 HTML 文件）

```javascript
function goToTools() {
    window.location.href = "工具箱.html";
}

function goToWorkspace() {
    window.location.href = "完整版.html#workspace";
}
```

---

## 步骤 6：验证

### 验证清单

| 验证项 | 预期结果 |
|--------|---------|
| 安装 ToolPkg 后侧边栏出现 7 个入口 | "我的作品"~"工作区"均显示在"插件"分组下 |
| 点击"我的作品" | 显示作品列表页面（HTML），无 crash |
| 点击"创建作品" | NativeBridge.createNovelWork 被调用，作品出现在列表 |
| 点击作品卡片 | 跳转到编辑器页面，加载章节内容 |
| 编辑器中修改内容后保存 | NativeBridge.saveChapterContent 被调用，内容持久化 |
| 切换到资料管理 | 显示 8 个分类（角色/设定/地点等），可增删资料 |
| 切换到大纲管理 | 显示大纲文本，可编辑保存 |
| 写作统计页面 | 显示作品数、总字数等统计数据 |
| 写作工具页面 | 显示 7 个工具卡片 |
| 工作区页面 | 显示文件树和导入/导出/备份按钮 |
| 页面间跳转 | hash 变化触发正确页面切换，无白屏 |
| Android 返回键 | 逐层返回，最终回到作品列表 |

### 调试方法

1. Chrome 中打开 `chrome://inspect`，连接设备后可 inspect WebView。
2. Console 中直接调用 `NativeBridge.getNovelWorks()` 验证 Bridge 是否注入成功。
3. Logcat 中查看 `WebView` 和 `NovelNativeBridge` 相关日志。
