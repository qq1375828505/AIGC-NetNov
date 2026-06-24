// 写作编辑器页面 - 实现章节编辑和自动保存

import type { ComposeDslContext, ComposeNode } from "../../../../types/compose-dsl";

export default function EditorPage(ctx: ComposeDslContext): ComposeNode {
  const { UI } = ctx;
  const colors = ctx.MaterialTheme.colorScheme;
  const params = ctx.routeParams ?? {};
  const workId = params.workId ?? "";

  const [chapters, setChapters] = ctx.useState("chapters", []);
  const [currentChapter, setCurrentChapter] = ctx.useState("currentChapter", null);
  const [content, setContent] = ctx.useState("content", "");
  const [wordCount, setWordCount] = ctx.useState("wordCount", 0);
  const [saving, setSaving] = ctx.useState("saving", false);
  const [showChapterList, setShowChapterList] = ctx.useState("showChapterList", true);
  const [saveTimer, setSaveTimer] = ctx.useState("saveTimer", null);
  const [contentCache, setContentCache] = ctx.useState<Record<string, string>>("contentCache", {});

  // 加载章节列表
  async function loadChapters() {
    try {
      const result = await Tools.callNative("getChapters", [workId]);
      setChapters(JSON.parse(result));
    } catch (error) {
      console.error("[NovelIDE] [ERROR] 加载章节失败:", error);
    }
  }

  // 加载章节内容（带缓存）
  async function loadChapterContent(chapterId: string) {
    // 先检查缓存
    if (contentCache[chapterId]) {
      const cached = contentCache[chapterId];
      setContent(cached);
      setWordCount(cached.length);
      return;
    }

    try {
      const result = await Tools.callNative("getChapterContent", [chapterId]);
      setContent(result);
      setWordCount(result.length);
      // 更新缓存
      setContentCache({ ...contentCache, [chapterId]: result });
    } catch (error) {
      console.error("[NovelIDE] [ERROR] 加载章节内容失败:", error);
    }
  }

  // 选择章节
  function selectChapter(chapter: any) {
    // 清除旧的自动保存定时器，防止切换章节时保存错误内容
    if (saveTimer) {
      clearTimeout(saveTimer);
      setSaveTimer(null);
    }
    
    setCurrentChapter(chapter);
    loadChapterContent(chapter.id);
    setShowChapterList(false);
  }

  // 自动保存（防抖 3 秒）
  function autoSave(newContent: string) {
    setContent(newContent);
    setWordCount(newContent.length);

    // 清除之前的定时器
    if (saveTimer) {
      clearTimeout(saveTimer);
    }

    const timer = setTimeout(async () => {
      if (currentChapter) {
        setSaving(true);
        try {
          await Tools.callNative("saveChapterContent", [
            currentChapter.id,
            newContent,
            newContent.length
          ]);
          // 更新缓存
          setContentCache({ ...contentCache, [currentChapter.id]: newContent });
        } catch (error) {
          console.error("[NovelIDE] [ERROR] 保存失败:", error);
        } finally {
          setSaving(false);
        }
      }
    }, 3000);
    setSaveTimer(timer);
  }

  // 创建新章节
  async function createChapter() {
    const title = `第 ${chapters.length + 1} 章`;
    try {
      await Tools.callNative("createChapter", [workId, title, chapters.length]);
      await loadChapters();
    } catch (error) {
      console.error("[NovelIDE] [ERROR] 创建章节失败:", error);
    }
  }

  // 初始化
  ctx.useEffect(() => {
    loadChapters();
  }, []);

  // 章节列表面板
  const chapterListPanel = UI.Box({
    width: 280,
    fillMaxHeight: true,
    background: colors.surfaceVariant
  }, [
    UI.TopAppBar({
      title: "章节列表",
      actions: [
        UI.IconButton({ icon: "add", onClick: createChapter, contentDescription: "创建新章节" })
      ]
    }),
    UI.LazyColumn({
      fillMaxSize: true,
      contentPadding: 8
    }, chapters.map((chapter: any) =>
      UI.Card({
        modifier: UI.Modifier
          .padding(4)
          .clickable(() => selectChapter(chapter)),
        background: currentChapter?.id === chapter.id ? colors.primaryContainer : colors.surface
      }, UI.Row({ padding: 12, fillMaxWidth: true }, [
        UI.Column({ weight: 1 }, [
          UI.Text({ text: chapter.title, style: "bodyMedium", maxLines: 1 }),
          UI.Text({ text: `${chapter.wordCount || 0} 字`, style: "bodySmall", color: colors.onSurfaceVariant })
        ])
      ]))
    ))
  ]);

  // 编辑器区域
  const editorArea = UI.Column({ fillMaxSize: true }, [
    // 工具栏
    UI.Row({
      fillMaxWidth: true,
      padding: 8,
      background: colors.surface,
      horizontalArrangement: "space-between"
    }, [
      UI.Row({ spacing: 8 }, [
        UI.IconButton({
          icon: "menu",
          onClick: () => setShowChapterList(!showChapterList),
          contentDescription: showChapterList ? "隐藏章节列表" : "显示章节列表"
        }),
        UI.Text({
          text: currentChapter?.title || "选择章节",
          style: "titleMedium"
        })
      ]),
      UI.Row({ spacing: 8 }, [
        saving
          ? UI.Text({ text: "保存中...", style: "bodySmall", color: colors.onSurfaceVariant })
          : UI.Text({ text: `${wordCount} 字`, style: "bodySmall", color: colors.onSurfaceVariant }),
        UI.IconButton({ icon: "save", onClick: () => autoSave(content), contentDescription: "保存章节内容" })
      ])
    ]),

    // 编辑器
    currentChapter
      ? UI.WebView({
          key: `editor_${currentChapter.id}`,
          fillMaxSize: true,
          url: `file:///android_asset/packages/novelide/resources/webapp/editor.html?chapterId=${encodeURIComponent(currentChapter.id)}`,
          javaScriptEnabled: true,
          domStorageEnabled: true,
          allowFileAccess: false
        })
      : UI.Box({
          fillMaxSize: true,
          contentAlignment: "center"
        }, [
          UI.Icon({ name: "edit", size: 64, tint: colors.onSurfaceVariant, contentDescription: "编辑器图标" }),
          UI.Text({ text: "选择一个章节开始写作", style: "bodyLarge", color: colors.onSurfaceVariant })
        ])
  ]);

  // 主布局
  return UI.Box({ fillMaxSize: true }, [
    UI.Row({ fillMaxSize: true }, [
      showChapterList ? chapterListPanel : null,
      editorArea
    ])
  ]);
}
