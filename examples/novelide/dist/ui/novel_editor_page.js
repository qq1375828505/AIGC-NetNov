"use strict";
// 写作编辑器页面 - 实现章节编辑和自动保存
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = EditorPage;
function EditorPage(ctx) {
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
    let saveTimer = null;
    // 加载章节列表
    async function loadChapters() {
        try {
            const result = await window.NativeBridge.getChapters(workId);
            setChapters(JSON.parse(result));
        }
        catch (error) {
            console.error("加载章节失败:", error);
        }
    }
    // 加载章节内容
    async function loadChapterContent(chapterId) {
        try {
            const result = await window.NativeBridge.getChapterContent(chapterId);
            setContent(result);
            setWordCount(result.length);
        }
        catch (error) {
            console.error("加载章节内容失败:", error);
        }
    }
    // 选择章节
    function selectChapter(chapter) {
        setCurrentChapter(chapter);
        loadChapterContent(chapter.id);
        setShowChapterList(false);
    }
    // 自动保存（防抖 3 秒）
    function autoSave(newContent) {
        setContent(newContent);
        setWordCount(newContent.length);
        if (saveTimer) {
            clearTimeout(saveTimer);
        }
        saveTimer = setTimeout(async () => {
            if (currentChapter) {
                setSaving(true);
                try {
                    await window.NativeBridge.saveChapterContent(currentChapter.id, newContent, newContent.length);
                }
                catch (error) {
                    console.error("保存失败:", error);
                }
                finally {
                    setSaving(false);
                }
            }
        }, 3000);
    }
    // 创建新章节
    async function createChapter() {
        const title = `第 ${chapters.length + 1} 章`;
        try {
            await window.NativeBridge.createChapter(workId, title, chapters.length);
            await loadChapters();
        }
        catch (error) {
            console.error("创建章节失败:", error);
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
                UI.IconButton({ icon: "add", onClick: createChapter })
            ]
        }),
        UI.LazyColumn({
            fillMaxSize: true,
            contentPadding: 8
        }, chapters.map((chapter) => UI.Card({
            modifier: UI.Modifier
                .padding(4)
                .clickable(() => selectChapter(chapter)),
            background: currentChapter?.id === chapter.id ? colors.primaryContainer : colors.surface
        }, UI.Row({ padding: 12, fillMaxWidth: true }, [
            UI.Column({ weight: 1 }, [
                UI.Text({ text: chapter.title, style: "bodyMedium", maxLines: 1 }),
                UI.Text({ text: `${chapter.wordCount || 0} 字`, style: "bodySmall", color: colors.onSurfaceVariant })
            ])
        ]))))
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
                    onClick: () => setShowChapterList(!showChapterList)
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
                UI.IconButton({ icon: "save", onClick: () => autoSave(content) })
            ])
        ]),
        // 编辑器
        currentChapter
            ? UI.WebView({
                key: `editor_${currentChapter.id}`,
                fillMaxSize: true,
                url: `file:///android_asset/packages/novelide/resources/webapp/editor.html?chapterId=${currentChapter.id}`,
                javaScriptEnabled: true,
                domStorageEnabled: true,
                allowFileAccess: true
            })
            : UI.Box({
                fillMaxSize: true,
                contentAlignment: "center"
            }, [
                UI.Icon({ name: "edit", size: 64, tint: colors.onSurfaceVariant }),
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
