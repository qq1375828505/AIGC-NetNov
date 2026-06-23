// Skill 管理页面 - 25个番茄网文风格Skill的管理界面

import type { ComposeDslContext, ComposeNode } from "../../../../types/compose-dsl";

export default function SkillsPage(ctx: ComposeDslContext): ComposeNode {
  const { UI } = ctx;
  const colors = ctx.MaterialTheme.colorScheme;

  const [skills, setSkills] = ctx.useState("skills", []);
  const [categories, setCategories] = ctx.useState("categories", []);
  const [selectedCategory, setSelectedCategory] = ctx.useState("selectedCategory", "all");
  const [selectedSkill, setSelectedSkill] = ctx.useState("selectedSkill", null);
  const [searchQuery, setSearchQuery] = ctx.useState("searchQuery", "");
  const [activeSkill, setActiveSkill] = ctx.useState("activeSkill", null);

  // 加载 Skill 列表
  async function loadSkills() {
    try {
      const result = await Tools.callNative("getAllSkills", []);
      const list = typeof result === "string" ? JSON.parse(result) : result;
      setSkills(Array.isArray(list) ? list : []);

      // 提取分类
      const cats = [...new Set(list.map((s: any) => s.category))];
      setCategories(cats);
    } catch (error) {
      console.error("加载 Skill 失败:", error);
    }
  }

  // 从后端同步
  async function syncFromBackend() {
    try {
      await Tools.callNative("syncSkillsFromBackend", []);
      await loadSkills();
    } catch (error) {
      console.error("同步 Skill 失败:", error);
    }
  }

  // 应用 Skill
  async function applySkill(skillId: string) {
    try {
      const result = await Tools.callNative("applySkill", [skillId, {}]);
      const parsed = typeof result === "string" ? JSON.parse(result) : result;
      setActiveSkill(parsed.skill);
    } catch (error) {
      console.error("应用 Skill 失败:", error);
    }
  }

  // 搜索 Skill
  async function searchSkills() {
    if (!searchQuery.trim()) {
      await loadSkills();
      return;
    }
    try {
      const result = await Tools.callNative("searchSkills", [searchQuery]);
      const list = typeof result === "string" ? JSON.parse(result) : result;
      setSkills(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("搜索 Skill 失败:", error);
    }
  }

  // 初始化
  ctx.useEffect(() => {
    loadSkills();
  }, []);

  // 搜索变化时自动搜索
  ctx.useEffect(() => {
    const timer = setTimeout(() => {
      searchSkills();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 过滤 Skill
  const filteredSkills = selectedCategory === "all" 
    ? skills 
    : skills.filter((s: any) => s.category === selectedCategory);

  // 顶部栏
  const topBar = UI.TopAppBar({
    title: "番茄风格 Skill",
    actions: [
      UI.IconButton({
        icon: "sync",
        onClick: syncFromBackend,
        contentDescription: "从后端同步Skill"
      }),
      UI.IconButton({
        icon: "refresh",
        onClick: loadSkills,
        contentDescription: "刷新Skill列表"
      })
    ]
  });

  // 搜索栏
  const searchBar = UI.TextField({
    value: searchQuery,
    onValueChange: setSearchQuery,
    label: "搜索 Skill",
    placeholder: "输入名称、描述或标签搜索...",
    fillMaxWidth: true,
    leadingIcon: "search",
    modifier: UI.Modifier.paddingHorizontal(16)
  });

  // 分类选择器
  const categorySelector = UI.LazyRow({
    horizontalArrangement: 8,
    paddingHorizontal: 16
  }, [
    UI.Chip({
      label: "全部",
      selected: selectedCategory === "all",
      onClick: () => setSelectedCategory("all")
    }),
    ...categories.map(cat =>
      UI.Chip({
        label: cat,
        selected: selectedCategory === cat,
        onClick: () => setSelectedCategory(cat)
      })
    )
  ]);

  // 当前激活的 Skill
  const activeSkillBanner = activeSkill ? UI.Card({
    modifier: UI.Modifier.padding(16).fillMaxWidth(),
    background: colors.primaryContainer
  }, UI.Row({
    fillMaxWidth: true,
    padding: 16,
    spacing: 12,
    verticalAlignment: "center"
  }, [
    UI.Text({
      text: activeSkill.icon || "📝",
      style: "headlineMedium"
    }),
    UI.Column({
      weight: 1
    }, [
      UI.Text({
        text: `当前激活: ${activeSkill.name}`,
        style: "titleSmall",
        color: colors.onPrimaryContainer
      }),
      UI.Text({
        text: activeSkill.category,
        style: "bodySmall",
        color: colors.onPrimaryContainer
      })
    ]),
    UI.Button({
      onClick: () => {
        setActiveSkill(null);
        Tools.callNative("clearActiveSkill", []);
      },
      variant: "text",
      compact: true
    }, "清除")
  ])) : null;

  // Skill 卡片网格
  const skillCards = UI.Column({
    fillMaxWidth: true,
    spacing: 8,
    paddingHorizontal: 16
  }, [
    UI.Text({
      text: `${filteredSkills.length} 个 Skill`,
      style: "bodySmall",
      color: colors.onSurfaceVariant,
      modifier: UI.Modifier.paddingBottom(4)
    }),
    ...filteredSkills.map((skill: any) =>
      UI.Card({
        modifier: UI.Modifier
          .fillMaxWidth()
          .clickable(() => {
            setSelectedSkill(skill);
            applySkill(skill.id);
          })
          .padding(4),
        background: selectedSkill?.id === skill.id ? colors.secondaryContainer : colors.surface
      }, UI.Row({
        fillMaxWidth: true,
        padding: 16,
        spacing: 16,
        verticalAlignment: "center"
      }, [
        UI.Text({
          text: skill.icon || "📝",
          style: "headlineMedium"
        }),
        UI.Column({
          weight: 1
        }, [
          UI.Text({
            text: skill.name,
            style: "titleSmall",
            color: selectedSkill?.id === skill.id ? colors.onSecondaryContainer : colors.onSurface
          }),
          UI.Text({
            text: skill.description,
            style: "bodySmall",
            color: selectedSkill?.id === skill.id ? colors.onSecondaryContainer : colors.onSurfaceVariant,
            maxLines: 2
          }),
          UI.Row({
            spacing: 4,
            modifier: UI.Modifier.paddingTop(4)
          }, skill.tags?.slice(0, 3).map((tag: string) =>
            UI.Chip({
              label: tag,
              compact: true,
              variant: "outlined"
            })
          ) || [])
        ]),
        UI.Column({
          horizontalAlignment: "end",
          spacing: 4
        }, [
          UI.Text({
            text: `${skill.workMinutes || 25}分钟`,
            style: "bodySmall",
            color: colors.onSurfaceVariant
          }),
          UI.Text({
            text: skill.category,
            style: "labelSmall",
            color: colors.primary
          })
        ])
      ]))
    )
  ]);

  // Skill 详情（当有选中时显示）
  const skillDetail = selectedSkill ? UI.Card({
    modifier: UI.Modifier.padding(16).fillMaxWidth(),
    background: colors.surfaceVariant
  }, UI.Column({
    fillMaxWidth: true,
    padding: 16,
    spacing: 12
  }, [
    UI.Row({
      fillMaxWidth: true,
      spacing: 12,
      verticalAlignment: "center"
    }, [
      UI.Text({
        text: selectedSkill.icon || "📝",
        style: "headlineLarge"
      }),
      UI.Column({
        weight: 1
      }, [
        UI.Text({
          text: selectedSkill.name,
          style: "titleMedium"
        }),
        UI.Text({
          text: selectedSkill.category,
          style: "bodySmall",
          color: colors.primary
        })
      ])
    ]),
    UI.Text({
      text: selectedSkill.description,
      style: "bodyMedium"
    }),
    UI.Text({
      text: "系统提示词预览:",
      style: "labelMedium",
      color: colors.onSurfaceVariant
    }),
    UI.Text({
      text: selectedSkill.systemPrompt?.substring(0, 200) + (selectedSkill.systemPrompt?.length > 200 ? "..." : ""),
      style: "bodySmall",
      color: colors.onSurfaceVariant
    }),
    UI.Row({
      spacing: 8
    }, [
      UI.Button({
        onClick: () => applySkill(selectedSkill.id),
        modifier: UI.Modifier.weight(1)
      }, "应用此 Skill"),
      UI.Button({
        onClick: () => setSelectedSkill(null),
        variant: "outlined",
        modifier: UI.Modifier.weight(1)
      }, "关闭详情")
    ])
  ])) : null;

  // 主布局
  return UI.Box({ fillMaxSize: true }, [
    topBar,
    UI.LazyColumn({
      fillMaxSize: true,
      contentPadding: 16,
      verticalArrangement: 12
    }, [
      searchBar,
      categorySelector,
      activeSkillBanner,
      skillDetail,
      skillCards
    ].filter(Boolean))
  ]);
}
