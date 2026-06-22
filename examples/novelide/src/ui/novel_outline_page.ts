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
  createdAt: number;
  updatedAt: number;
}

export default function OutlinePage(ctx: ComposeDslContext): ComposeNode {
  const { UI } = ctx;
  const colors = ctx.MaterialTheme.colorScheme;
  const params = ctx.routeParams ?? {};
  const workId = params.workId ?? "";

  const [nodes, setNodes] = ctx.useState("nodes", []);
  const [selectedNode, setSelectedNode] = ctx.useState("selectedNode", null);
  const [isEditing, setIsEditing] = ctx.useState("isEditing", false);
  const [editTitle, setEditTitle] = ctx.useState("editTitle", "");
  const [editContent, setEditContent] = ctx.useState("editContent", "");
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

  // 更新节点
  async function updateNode(nodeId: string, title: string, content: string) {
    try {
      await Tools.callNative("updateOutlineNode", [nodeId, title, content]);
      await loadNodes();
      setIsEditing(false);
      setSelectedNode(null);
    } catch (error) {
      console.error("更新节点失败:", error);
    }
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

  // 节点列表（树形结构）
  function renderNodeList() {
    const rootNodes = nodes.filter((n: OutlineNode) => !n.parentId);
    
    function renderNode(node: OutlineNode, level: number = 0) {
      const children = nodes.filter((n: OutlineNode) => n.parentId === node.id);
      const isSelected = selectedNode?.id === node.id;
      
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
              setIsEditing(false);
            })
            .padding(4),
          background: isSelected ? colors.primaryContainer : colors.surface
        }, UI.Row({
          fillMaxWidth: true,
          padding: 12,
          spacing: 12,
          verticalAlignment: "center"
        }, [
          UI.Icon({
            icon: children.length > 0 ? "folder" : "description",
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
            node.content ? UI.Text({
              text: node.content.substring(0, 50) + (node.content.length > 50 ? "..." : ""),
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
        ...children.map(child => renderNode(child, level + 1))
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
        UI.Row({
          spacing: 8,
          horizontalArrangement: "end"
        }, [
          UI.Button({
            onClick: () => setIsEditing(false),
            variant: "outlined"
          }, "取消"),
          UI.Button({
            onClick: () => updateNode(selectedNode.id, editTitle, editContent)
          }, "保存")
        ])
      ]);
    }

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
            onClick: () => setIsEditing(true)
          }),
          UI.IconButton({
            icon: "delete",
            onClick: () => deleteNode(selectedNode.id)
          })
        ])
      ]),
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
    ]);
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
