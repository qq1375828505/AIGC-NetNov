// 资料管理页面 - 8 类资料的增删改查

import type { ComposeDslContext, ComposeNode } from "../../../../types/compose-dsl";

interface MaterialCategory {
  key: string;
  label: string;
  icon: string;
  bridgeGet: string;
  bridgeCreate: string;
  bridgeUpdate: string;
  bridgeDelete: string;
  fields: { key: string; label: string; multiline?: boolean }[];
}

const CATEGORIES: MaterialCategory[] = [
  {
    key: "characters",
    label: "角色",
    icon: "person",
    bridgeGet: "getCharacters",
    bridgeCreate: "createCharacter",
    bridgeUpdate: "updateCharacter",
    bridgeDelete: "deleteCharacter",
    fields: [
      { key: "name", label: "姓名" },
      { key: "gender", label: "性别" },
      { key: "age", label: "年龄" },
      { key: "appearance", label: "外貌", multiline: true },
      { key: "personality", label: "性格", multiline: true },
      { key: "background", label: "背景故事", multiline: true },
    ],
  },
  {
    key: "settings",
    label: "设定",
    icon: "settings",
    bridgeGet: "getSettings",
    bridgeCreate: "createSetting",
    bridgeUpdate: "updateSetting",
    bridgeDelete: "deleteSetting",
    fields: [
      { key: "name", label: "设定名称" },
      { key: "category", label: "分类" },
      { key: "description", label: "描述", multiline: true },
    ],
  },
  {
    key: "locations",
    label: "地点",
    icon: "place",
    bridgeGet: "getLocations",
    bridgeCreate: "createLocation",
    bridgeUpdate: "updateLocation",
    bridgeDelete: "deleteLocation",
    fields: [
      { key: "name", label: "地点名称" },
      { key: "type", label: "类型" },
      { key: "description", label: "描述", multiline: true },
    ],
  },
  {
    key: "factions",
    label: "势力",
    icon: "group",
    bridgeGet: "getFactions",
    bridgeCreate: "createFaction",
    bridgeUpdate: "updateFaction",
    bridgeDelete: "deleteFaction",
    fields: [
      { key: "name", label: "势力名称" },
      { key: "leader", label: "首领" },
      { key: "description", label: "描述", multiline: true },
    ],
  },
  {
    key: "items",
    label: "道具",
    icon: "inventory_2",
    bridgeGet: "getItems",
    bridgeCreate: "createItem",
    bridgeUpdate: "updateItem",
    bridgeDelete: "deleteItem",
    fields: [
      { key: "name", label: "道具名称" },
      { key: "type", label: "类型" },
      { key: "description", label: "描述", multiline: true },
    ],
  },
  {
    key: "plot_hooks",
    label: "伏笔",
    icon: "extension",
    bridgeGet: "getPlotHooks",
    bridgeCreate: "createPlotHook",
    bridgeUpdate: "updatePlotHook",
    bridgeDelete: "deletePlotHook",
    fields: [
      { key: "title", label: "伏笔标题" },
      { key: "status", label: "状态" },
      { key: "planted", label: "埋设章节" },
      { key: "resolved", label: "回收章节" },
      { key: "description", label: "描述", multiline: true },
    ],
  },
  {
    key: "references",
    label: "参考资料",
    icon: "menu_book",
    bridgeGet: "getReferences",
    bridgeCreate: "createReference",
    bridgeUpdate: "updateReference",
    bridgeDelete: "deleteReference",
    fields: [
      { key: "title", label: "标题" },
      { key: "source", label: "来源" },
      { key: "url", label: "链接" },
      { key: "notes", label: "备注", multiline: true },
    ],
  },
  {
    key: "todos",
    label: "写作待办",
    icon: "checklist",
    bridgeGet: "getTodos",
    bridgeCreate: "createTodo",
    bridgeUpdate: "updateTodo",
    bridgeDelete: "deleteTodo",
    fields: [
      { key: "title", label: "待办内容" },
      { key: "priority", label: "优先级" },
      { key: "status", label: "状态" },
      { key: "notes", label: "备注", multiline: true },
    ],
  },
];

export default function MaterialsPage(ctx: ComposeDslContext): ComposeNode {
  const { UI } = ctx;
  const colors = ctx.MaterialTheme.colorScheme;
  const params = ctx.routeParams ?? {};
  const workId = params.workId ?? "";

  const [activeTab, setActiveTab] = ctx.useState("activeTab", 0);
  const [items, setItems] = ctx.useState<any[]>("items", []);
  const [loading, setLoading] = ctx.useState("loading", false);
  const [editingItem, setEditingItem] = ctx.useState<any>("editingItem", null);
  const [showForm, setShowForm] = ctx.useState("showForm", false);
  const [formFields, setFormFields] = ctx.useState<Record<string, string>>("formFields", {});
  const [searchQuery, setSearchQuery] = ctx.useState("searchQuery", "");

  const category = CATEGORIES[activeTab];

  // 过滤后的列表
  const filteredItems = searchQuery.trim()
    ? items.filter((item: any) => {
        const query = searchQuery.toLowerCase();
        const name = (item.name || item.title || "").toLowerCase();
        const desc = (item.description || item.notes || item.background || "").toLowerCase();
        return name.includes(query) || desc.includes(query);
      })
    : items;

  async function loadItems() {
    setLoading(true);
    try {
      const result = await (window.NativeBridge as any)[category.bridgeGet](workId);
      setItems(JSON.parse(result));
    } catch (error) {
      console.error(`加载${category.label}失败:`, error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function saveItem() {
    try {
      if (editingItem) {
        // 编辑模式：调用 update 方法
        const payload = { id: editingItem.id, ...formFields };
        await (window.NativeBridge as any)[category.bridgeUpdate](JSON.stringify(payload));
      } else {
        // 新增模式：调用 create 方法（根据类别传递不同参数）
        const payload = { ...formFields };
        switch (category.key) {
          case "characters":
            await (window.NativeBridge as any).createCharacter(workId, payload.name || "", payload.role || "");
            break;
          case "settings":
            await (window.NativeBridge as any).createSetting(workId, payload.name || "", payload.description || "");
            break;
          case "locations":
            await (window.NativeBridge as any).createLocation(workId, payload.name || "", payload.description || "");
            break;
          case "factions":
            await (window.NativeBridge as any).createFaction(workId, payload.name || "", payload.leader || "");
            break;
          case "items":
            await (window.NativeBridge as any).createItem(workId, payload.name || "", payload.description || "");
            break;
          case "plot_hooks":
            await (window.NativeBridge as any).createPlotHook(workId, payload.description || "");
            break;
          case "references":
            await (window.NativeBridge as any).createReference(workId, payload.title || "", payload.notes || "");
            break;
          case "todos":
            await (window.NativeBridge as any).createTodo(workId, payload.title || "", parseInt(payload.priority || "0"));
            break;
          default:
            // 默认使用 JSON 字符串方式
            await (window.NativeBridge as any)[category.bridgeCreate](workId, JSON.stringify(payload));
        }
      }
      setShowForm(false);
      setEditingItem(null);
      setFormFields({});
      await loadItems();
    } catch (error) {
      console.error(`保存${category.label}失败:`, error);
    }
  }

  async function deleteItem(itemId: string) {
    try {
      await (window.NativeBridge as any)[category.bridgeDelete](itemId);
      await loadItems();
    } catch (error) {
      console.error(`删除${category.label}失败:`, error);
    }
  }

  function startCreate() {
    const fields: Record<string, string> = {};
    category.fields.forEach((f) => (fields[f.key] = ""));
    setFormFields(fields);
    setEditingItem(null);
    setShowForm(true);
  }

  function startEdit(item: any) {
    const fields: Record<string, string> = {};
    category.fields.forEach((f) => (fields[f.key] = item[f.key] || ""));
    setFormFields(fields);
    setEditingItem(item);
    setShowForm(true);
  }

  function switchTab(index: number) {
    setActiveTab(index);
    setShowForm(false);
    setEditingItem(null);
    setFormFields({});
  }

  ctx.useEffect(() => {
    loadItems();
  }, [activeTab]);

  // 左侧分类 Tab 列表
  const tabBar = UI.Box(
    {
      width: 120,
      fillMaxHeight: true,
      background: colors.surfaceVariant,
    },
    [
      UI.TopAppBar({ title: "资料分类" }),
      UI.LazyColumn({ fillMaxSize: true, contentPadding: 4 }, [
        ...CATEGORIES.map((cat, index) =>
          UI.Card(
            {
              modifier: UI.Modifier.padding(4).clickable(() => switchTab(index)),
              background: activeTab === index ? colors.primaryContainer : colors.surface,
            },
            UI.Row({ padding: 10, fillMaxWidth: true, spacing: 8 }, [
              UI.Icon({
                name: cat.icon,
                size: 20,
                tint: activeTab === index ? colors.primary : colors.onSurfaceVariant,
              }),
              UI.Text({
                text: cat.label,
                style: "bodyMedium",
                color: activeTab === index ? colors.primary : colors.onSurfaceVariant,
              }),
            ])
          )
        ),
      ]),
    ]
  );

  // 右侧列表
  const listView = UI.Column({ fillMaxSize: true }, [
    UI.TopAppBar({
      title: category.label,
      actions: [UI.IconButton({ icon: "add", onClick: startCreate })],
    }),
    // 搜索框
    UI.TextField({
      value: searchQuery,
      onValueChange: setSearchQuery,
      label: "搜索",
      placeholder: `搜索${category.label}...`,
      fillMaxWidth: true,
      leadingIcon: "search",
      modifier: UI.Modifier.padding({ horizontal: 8, vertical: 4 })
    }),
    loading
      ? UI.Box({ fillMaxSize: true, contentAlignment: "center" }, UI.CircularProgressIndicator())
      : filteredItems.length === 0
        ? UI.Box({ fillMaxSize: true, contentAlignment: "center" }, [
            UI.Icon({ name: category.icon, size: 64, tint: colors.onSurfaceVariant }),
            UI.Text({
              text: searchQuery ? "未找到匹配项" : `暂无${category.label}数据`,
              style: "bodyLarge",
              color: colors.onSurfaceVariant,
            }),
          ])
        : UI.LazyColumn({ fillMaxSize: true, contentPadding: 8 }, [
            ...filteredItems.map((item: any) =>
              UI.Card({
                modifier: UI.Modifier.padding(4),
                content: UI.Row({
                  fillMaxWidth: true,
                  padding: 12,
                  spacing: 12,
                }, [
                  UI.Column({ weight: 1 }, [
                    UI.Text({
                      text: item.name || item.title || "未命名",
                      style: "titleSmall",
                      maxLines: 1,
                    }),
                    UI.Text({
                      text: item.description || item.notes || item.background || "",
                      style: "bodySmall",
                      color: colors.onSurfaceVariant,
                      maxLines: 2,
                    }),
                  ]),
                  UI.IconButton({
                    icon: "edit",
                    onClick: () => startEdit(item),
                  }),
                  UI.IconButton({
                    icon: "delete",
                    onClick: () => deleteItem(item.id),
                    tint: colors.error,
                  }),
                ]),
              })
            ),
          ]),
  ]);

  // 新增/编辑表单
  const formView = showForm
    ? UI.Box(
        {
          width: 320,
          fillMaxHeight: true,
          background: colors.surface,
        },
        [
          UI.TopAppBar({
            title: editingItem ? `编辑${category.label}` : `新增${category.label}`,
            actions: [UI.IconButton({ icon: "close", onClick: () => setShowForm(false) })],
          }),
          UI.LazyColumn({ fillMaxSize: true, contentPadding: 12, spacing: 12 }, [
            ...category.fields.map((field) =>
              UI.TextField({
                value: formFields[field.key] || "",
                onValueChange: (v: string) => setFormFields({ ...formFields, [field.key]: v }),
                label: field.label,
                multiline: field.multiline || false,
                fillMaxWidth: true,
              })
            ),
            UI.Row({ fillMaxWidth: true, spacing: 8, padding: 12 }, [
              UI.Button({ onClick: saveItem }, editingItem ? "保存" : "创建"),
              UI.Button(
                { onClick: () => setShowForm(false), variant: "outlined" },
                "取消"
              ),
            ]),
          ]),
        ]
      )
    : null;

  // 主布局
  return UI.Box({ fillMaxSize: true }, [
    UI.Row({ fillMaxSize: true }, [
      tabBar,
      UI.Box({ weight: 1, fillMaxHeight: true }, [listView]),
      formView,
    ]),
  ]);
}
