// 大纲管理页面 - 精简原生实现（慵懒模式）
// 只实现核心功能：节点增删改查、层级结构

import type { ComposeDslContext, ComposeNode } from "../../../../types/compose-dsl";

interface OutlineNode {
  id: string;
  workId: string;
  title: string;
  content: string;
  parentId: string | null;
  sortOrder: number;
  level: number;
  chapterId?: string | null;
  chapterTitle?: string;
  createdAt: number;
  updatedAt: number;
}

interface Chapter {
  id: string;
  title: string;
  sortOrder: number;
}

export default function OutlinePage(ctx: ComposeDslContext): ComposeNode {
  const { UI } = ctx;
  const colors = ctx.MaterialTheme.colorScheme;
  const params = ctx.routeParams ?? {};
  const workId = params.workId ?? "";

  const [nodes, setNodes] = ctx.useState("nodes", []);
  const [chapters, setChapters] = ctx.useState("chapters", []);
  const [selectedNode, setSelectedNode] = ctx.useState("selectedNode", null);
  const [isEditing, setIsEditing] = ctx.useState("isEditing", false);
  const [editTitle, setEditTitle] = ctx.useState("editTitle", "");
  const [editContent, setEditContent] = ctx.useState("editContent", "");
  const [editChapterId, setEditChapterId] = ctx.useState("editChapterId", "");
  const [parentId, setParentId] = ctx.useState("parentId", null);
  const [showAddDialog, setShowAddDialog] = ctx.useState("showAddDialog", false);

  // 加载大纲节点
  async function loadNodes() {
    try {
      const result = await Tools.callNative("getOutlineNodes", [workId]);
      const list = typeof result === "string" ? JSON.parse(result) : result;
      setNodes(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("加载大纲失败:", error);
    }
  }

  // 加载章节列表
  async function loadChapters() {
    try {
      const result = await Tools.callNative("getChapters", [workId]);
      const list = typeof result === "string" ? JSON.parse(result) : result;
      setChapters(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("加载章节失败:", error);
    }
  }

  // 创建节点
  async function createNode(title: string, content: string, parent: string | null) {
    try {
      await Tools.callNative("createOutlineNode", [workId, title, content, parent || ""]);
      await loadNodes();
      setShowAddDialog(false);
    } catch (error) {
      console.error("创建节点失败:", error);
    }
  }

  // 更新节点（支持章节关联）
  async function updateNode(nodeId: string, title: string, content: string, chapterId?: string) {
    try {
      await Tools.callNative("updateOutlineNodeEx", [nodeId, title, content, chapterId || ""]);
      await loadNodes();
      setIsEditing(false);
      setSelectedNode(null);
    } catch (error) {
      console.error("更新节点失败:", error);
    }
  }

  // 拖拽排序节点
  async function moveNode(nodeId: string, newParentId: string | null, newSortOrder: number) {
    try {
      await Tools.callNative("reorderOutlineNode", [nodeId, newParentId || "", newSortOrder]);
      await loadNodes();
    } catch (error) {
      console.error("移动节点失败:", error);
    }
  }

  // 展开/折叠状态
  const [expandedNodes, setExpandedNodes] = ctx.useState("expandedNodes", new Set<string>());

  function toggleExpand(nodeId: string) {
    const newSet = new Set(expandedNodes);
    if (newSet.has(nodeId)) {
      newSet.delete(nodeId);
    } else {
      newSet.add(nodeId);
    }
    setExpandedNodes(newSet);
  }

  // 删除节点
  async function deleteNode(nodeId: string) {
    try {
      await Tools.callNative("deleteOutlineNode", [nodeId]);
      await loadNodes();
      setSelectedNode(null);
    } catch (error) {
      console.error("删除节点失败:", error);
    }
  }

  // 初始化
  ctx.useEffect(() => {
    loadNodes();
    loadChapters();
  }, []);

  // 顶部栏
  const topBar = UI.TopAppBar({
    title: "大纲管理",
    actions: [
      UI.IconButton({
        icon: "add",
        onClick: () => {
          setParentId(null);
          setEditTitle("");
          setEditContent("");
          setShowAddDialog(true);
        }
      }),
      UI.IconButton({
        icon: "refresh",
        onClick: loadNodes
      })
    ]
  });

  // 节点列表（树形结构，支持展开折叠）
  function renderNodeList() {
    const rootNodes = nodes.filter((n: OutlineNode) => !n.parentId);
    
    function renderNode(node: OutlineNode, level: number = 0) {
      const children = nodes.filter((n: OutlineNode) => n.parentId === node.id);
      const isSelected = selectedNode?.id === node.id;
      const isExpanded = expandedNodes.has(node.id);
      const hasChildren = children.length > 0;
      
      // 查找关联章节
      const linkedChapter = node.chapterId 
        ? chapters.find((ch: Chapter) => ch.id === node.chapterId)
        : null;
      
      return UI.Column({
        key: node.id,
        modifier: UI.Modifier.paddingLeft(level * 16)
      }, [
        UI.Card({
          modifier: UI.Modifier
            .fillMaxWidth()
            .clickable(() => {
              setSelectedNode(node);
              setEditTitle(node.title);
              setEditContent(node.content);
              setEditChapterId(node.chapterId || "");
              setIsEditing(false);
            })
            .padding(4),
          background: isSelected ? colors.primaryContainer : colors.surface
        }, UI.Row({
          fillMaxWidth: true,
          padding: 12,
          spacing: 8,
          verticalAlignment: "center"
        }, [
          // 展开/折叠按钮
          hasChildren ? UI.IconButton({
            icon: isExpanded ? "expand_more" : "chevron_right",
            onClick: () => toggleExpand(node.id),
            compact: true,
            tint: colors.onSurfaceVariant
          }) : UI.Box({ width: 24 }),
          UI.Icon({
            icon: hasChildren ? (isExpanded ? "folder_open" : "folder") : "description",
            tint: isSelected ? colors.primary : colors.onSurfaceVariant
          }),
          UI.Column({
            weight: 1
          }, [
            UI.Text({
              text: node.title,
              style: "titleSmall",
              color: isSelected ? colors.onPrimaryContainer : colors.onSurface,
              maxLines: 1
            }),
            linkedChapter ? UI.Text({
              text: `🔗 ${linkedChapter.title}`,
              style: "labelSmall",
              color: colors.primary,
              maxLines: 1
            }) : null,
            node.content ? UI.Text({
              text: node.content.substring(0, 40) + (node.content.length > 40 ? "..." : ""),
              style: "bodySmall",
              color: colors.onSurfaceVariant,
              maxLines: 1
            }) : null
          ].filter(Boolean)),
          UI.IconButton({
            icon: "add",
            onClick: (e) => {
              e.stopPropagation();
              setParentId(node.id);
              setEditTitle("");
              setEditContent("");
              setShowAddDialog(true);
            },
            compact: true
          })
        ])),
        // 递归渲染子节点（仅在展开时）
        ...(isExpanded || !hasChildren ? children.map(child => renderNode(child, level + 1)) : [])
      ]);
    }

    return UI.LazyColumn({
      fillMaxWidth: true,
      contentPadding: 8
    }, rootNodes.map(node => renderNode(node)));
  }

  // 节点详情/编辑面板
  function renderDetailPanel() {
    if (!selectedNode) {
      return UI.Box({
        fillMaxSize: true,
        contentAlignment: "center"
      }, [
        UI.Text({
          text: "选择一个节点查看详情",
          style: "bodyLarge",
          color: colors.onSurfaceVariant
        })
      ]);
    }

    if (isEditing) {
      return UI.Column({
        fillMaxWidth: true,
        padding: 16,
        spacing: 12
      }, [
        UI.Text({
          text: "编辑节点",
          style: "titleMedium"
        }),
        UI.TextField({
          value: editTitle,
          onValueChange: setEditTitle,
          label: "标题",
          fillMaxWidth: true
        }),
        UI.TextField({
          value: editContent,
          onValueChange: setEditContent,
          label: "内容",
          fillMaxWidth: true,
          minLines: 5,
          maxLines: 10,
          multiline: true
        }),
        UI.Dropdown({
          label: "关联章节",
          value: editChapterId,
          onValueChange: setEditChapterId,
          options: [
            { value: "", label: "无关联" },
            ...chapters.map((ch: Chapter) => ({ value: ch.id, label: ch.title }))
          ],
          fillMaxWidth: true
        }),
        UI.Row({
          spacing: 8,
          horizontalArrangement: "end"
        }, [
          UI.Button({
            onClick: () => setIsEditing(false),
            variant: "outlined"
          }, "取消"),
          UI.Button({
            onClick: () => updateNode(selectedNode.id, editTitle, editContent, editChapterId)
          }, "保存")
        ])
      ]);
    }

    // 查找关联章节
    const linkedChapter = selectedNode.chapterId 
      ? chapters.find((ch: Chapter) => ch.id === selectedNode.chapterId)
      : null;

    return UI.Column({
      fillMaxWidth: true,
      padding: 16,
      spacing: 12
    }, [
      UI.Row({
        fillMaxWidth: true,
        horizontalArrangement: "space-between",
        verticalAlignment: "center"
      }, [
        UI.Text({
          text: selectedNode.title,
          style: "titleMedium"
        }),
        UI.Row({
          spacing: 4
        }, [
          UI.IconButton({
            icon: "edit",
            onClick: () => {
              setEditChapterId(selectedNode.chapterId || "");
              setIsEditing(true);
            }
          }),
          UI.IconButton({
            icon: "delete",
            onClick: () => deleteNode(selectedNode.id)
          })
        ])
      ]),
      // 章节关联标签（可点击跳转）
      linkedChapter ? UI.Row({
        spacing: 8,
        verticalAlignment: "center"
      }, [
        UI.Chip({
          label: `关联章节: ${linkedChapter.title}`,
          icon: "link",
          variant: "outlined"
        }),
        UI.IconButton({
          icon: "open_in_new",
          onClick: () => {
            // 跳转到章节编辑器
            try {
              Tools.callNative("navigateToChapter", [linkedChapter.id]);
            } catch (e) {
              console.log("跳转章节:", linkedChapter.id);
            }
          },
          tooltip: "打开章节",
          compact: true
        })
      ]) : null,
      UI.Text({
        text: selectedNode.content || "暂无内容",
        style: "bodyMedium",
        color: colors.onSurfaceVariant
      }),
      UI.Text({
        text: `创建时间: ${new Date(selectedNode.createdAt).toLocaleString()}`,
        style: "bodySmall",
        color: colors.onSurfaceVariant
      })
    ].filter(Boolean));
  }

  // 添加节点对话框
  function renderAddDialog() {
    if (!showAddDialog) return null;

    return UI.Box({
      fillMaxSize: true,
      background: "rgba(0,0,0,0.5)",
      contentAlignment: "center"
    }, [
      UI.Card({
        modifier: UI.Modifier.padding(32).fillMaxWidth()
      }, UI.Column({
        padding: 16,
        spacing: 12
      }, [
        UI.Text({
          text: parentId ? "添加子节点" : "添加根节点",
          style: "titleMedium"
        }),
        UI.TextField({
          value: editTitle,
          onValueChange: setEditTitle,
          label: "标题",
          fillMaxWidth: true
        }),
        UI.TextField({
          value: editContent,
          onValueChange: setEditContent,
          label: "内容（可选）",
          fillMaxWidth: true,
          minLines: 3,
          multiline: true
        }),
        UI.Dropdown({
          label: "关联章节（可选）",
          value: editChapterId,
          onValueChange: setEditChapterId,
          options: [
            { value: "", label: "无关联" },
            ...chapters.map((ch: Chapter) => ({ value: ch.id, label: ch.title }))
          ],
          fillMaxWidth: true
        }),
        UI.Row({
          spacing: 8,
          horizontalArrangement: "end"
        }, [
          UI.Button({
            onClick: () => setShowAddDialog(false),
            variant: "outlined"
          }, "取消"),
          UI.Button({
            onClick: () => createNode(editTitle, editContent, parentId),
            enabled: editTitle.trim().length > 0
          }, "创建")
        ])
      ]))
    ]);
  }

  // 主布局
  return UI.Box({ fillMaxSize: true }, [
    topBar,
    UI.Row({
      fillMaxSize: true,
      modifier: UI.Modifier.padding(topBar ? 56 : 0)
    }, [
      // 左侧节点列表
      UI.Box({
        fillMaxHeight: true,
        width: 280,
        background: colors.surfaceVariant
      }, renderNodeList()),
      // 右侧详情面板
      UI.Box({
        fillMaxSize: true,
        weight: 1
      }, renderDetailPanel())
    ]),
    renderAddDialog()
  ]);
}
