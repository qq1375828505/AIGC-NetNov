// 我的作品页面 - 实现作品列表和管理

import type { ComposeDslContext, ComposeNode } from "../../../../types/compose-dsl";

export default function WorksPage(ctx: ComposeDslContext): ComposeNode {
  const { UI } = ctx;
  const colors = ctx.MaterialTheme.colorScheme;

  const [works, setWorks] = ctx.useState("works", []);
  const [loading, setLoading] = ctx.useState("loading", true);
  const [showCreateDialog, setShowCreateDialog] = ctx.useState("showCreateDialog", false);
  const [newTitle, setNewTitle] = ctx.useState("newTitle", "");
  const [newGenre, setNewGenre] = ctx.useState("newGenre", "");
  const [showDeleteDialog, setShowDeleteDialog] = ctx.useState("showDeleteDialog", false);
  const [deleteTargetId, setDeleteTargetId] = ctx.useState("deleteTargetId", "");
  const [deleteTargetTitle, setDeleteTargetTitle] = ctx.useState("deleteTargetTitle", "");

  // 加载作品列表
  async function loadWorks() {
    setLoading(true);
    try {
      const result = await Tools.callNative("getNovelWorks", []);
      setWorks(JSON.parse(result));
    } catch (error) {
      console.error("[NovelIDE] [ERROR] 加载作品失败:", error);
    } finally {
      setLoading(false);
    }
  }

  // 创建作品
  async function createWork() {
    const title = newTitle.trim();
    if (!title) return;
    try {
      await Tools.callNative("createWork", [title, newGenre || "", ""]);
      setShowCreateDialog(false);
      setNewTitle("");
      setNewGenre("");
      await loadWorks();
    } catch (error) {
      console.error("[NovelIDE] [ERROR] 创建作品失败:", error);
    }
  }

  // 显示删除确认对话框
  function confirmDeleteWork(workId: string, workTitle: string) {
    setDeleteTargetId(workId);
    setDeleteTargetTitle(workTitle || "未命名作品");
    setShowDeleteDialog(true);
  }

  // 执行删除作品
  async function executeDeleteWork() {
    if (!deleteTargetId) return;
    setShowDeleteDialog(false);
    try {
      await Tools.callNative("deleteWork", [deleteTargetId]);
      setDeleteTargetId("");
      setDeleteTargetTitle("");
      await loadWorks();
    } catch (error) {
      console.error("[NovelIDE] [ERROR] 删除作品失败:", error);
    }
  }

  // 进入编辑器
  function openEditor(workId: string) {
    // 导航到编辑器页面
    ctx.navigate(`toolpkg:com.operit.novelide:ui:novel_editor?workId=${workId}`);
  }

  // 初始化加载
  ctx.useEffect(() => {
    loadWorks();
  }, []);

  // 创建对话框
  const createDialog = showCreateDialog
    ? UI.Dialog({
        onDismiss: () => setShowCreateDialog(false),
        title: "创建新作品",
        content: UI.Column({ spacing: 16, paddingHorizontal: 16 }, [
          UI.TextField({
            value: newTitle,
            onValueChange: setNewTitle,
            label: "作品标题",
            placeholder: "请输入作品标题"
          }),
          UI.TextField({
            value: newGenre,
            onValueChange: setNewGenre,
            label: "作品类型",
            placeholder: "如：都市、玄幻、悬疑"
          })
        ]),
        confirmButton: UI.Button({ onClick: createWork }, "创建"),
        dismissButton: UI.Button({ onClick: () => setShowCreateDialog(false) }, "取消")
      })
    : null;

  // 作品卡片
  function workCard(work: any) {
    return UI.Card({
      modifier: UI.Modifier.padding(8).clickable(() => openEditor(work.id)),
      content: UI.Row({
        fillMaxWidth: true,
        padding: 16,
        spacing: 12
      }, [
        // 封面占位
        UI.Box({
          width: 60,
          height: 80,
          background: colors.primaryContainer,
          cornerRadius: 8,
          contentAlignment: "center"
        }, UI.Icon({ name: "book", size: 32, tint: colors.primary })),

        // 作品信息
        UI.Column({
          weight: 1,
          spacing: 4
        }, [
          UI.Text({ text: work.title, style: "titleMedium", maxLines: 1 }),
          UI.Text({ text: work.genre || "未分类", style: "bodySmall", color: colors.onSurfaceVariant }),
          UI.Text({ text: `${work.chapterCount || 0} 章 · ${work.currentWordCount || 0} 字`, style: "bodySmall" })
        ]),

        // 删除按钮
        UI.IconButton({
          icon: "delete",
          onClick: () => confirmDeleteWork(work.id, work.title),
          tint: colors.error
        })
      ])
    });
  }

  // 主内容
  const content = loading
    ? UI.Box({ fillMaxSize: true, contentAlignment: "center" }, UI.CircularProgressIndicator())
    : works.length === 0
      ? UI.Box({ fillMaxSize: true, contentAlignment: "center" }, [
          UI.Icon({ name: "book", size: 64, tint: colors.onSurfaceVariant }),
          UI.Text({ text: "还没有作品", style: "bodyLarge", color: colors.onSurfaceVariant }),
          UI.Button({ onClick: () => setShowCreateDialog(true) }, "创建第一部作品")
        ])
      : UI.LazyColumn({
          fillMaxSize: true,
          contentPadding: 16,
          verticalArrangement: 8
        }, works.map(work => workCard(work)));

  return UI.Box({ fillMaxSize: true }, [
    // 顶部栏
    UI.TopAppBar({
      title: "我的作品",
      actions: [
        UI.IconButton({
          icon: "add",
          onClick: () => setShowCreateDialog(true)
        })
      ]
    }),

    // 内容区
    content,

    // 创建对话框
    createDialog,

    // 删除确认对话框
    showDeleteDialog
      ? UI.Dialog({
          onDismiss: () => setShowDeleteDialog(false),
          title: "确认删除",
          content: UI.Column({ spacing: 16, paddingHorizontal: 16 }, [
            UI.Text({
              text: `确定要删除作品「${deleteTargetTitle}」吗？`,
              style: "bodyLarge"
            }),
            UI.Text({
              text: "此操作不可撤销，所有章节和资料将被永久删除。",
              style: "bodySmall",
              color: colors.error
            })
          ]),
          confirmButton: UI.Button(
            { onClick: executeDeleteWork, background: colors.error },
            "删除"
          ),
          dismissButton: UI.Button(
            { onClick: () => setShowDeleteDialog(false) },
            "取消"
          )
        })
      : null
  ]);
}
