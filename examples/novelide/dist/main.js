var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  registerToolPkg: () => registerToolPkg
});
module.exports = __toCommonJS(main_exports);

// src/ui/novel_works.ui.ts
function Screen(ctx) {
  const { UI } = ctx;
  return UI.Box(
    { fillMaxSize: true },
    UI.WebView({
      key: "novel_works_webview",
      fillMaxSize: true,
      url: "file:///android_asset/packages/novelide/resources/webapp/\u7F51\u6587\u5199\u4F5C.html#works",
      javaScriptEnabled: true,
      domStorageEnabled: true,
      allowFileAccess: true,
      allowContentAccess: true,
      supportZoom: true,
      useWideViewPort: true,
      loadWithOverviewMode: true
    })
  );
}

// src/ui/novel_editor.ui.ts
function Screen2(ctx) {
  var _a, _b;
  const { UI } = ctx;
  const params = (_a = ctx.routeParams) != null ? _a : {};
  const workId = (_b = params.workId) != null ? _b : "";
  return UI.Box(
    { fillMaxSize: true },
    UI.WebView({
      key: `novel_editor_webview_${workId}`,
      fillMaxSize: true,
      url: `file:///android_asset/packages/novelide/resources/webapp/\u7F51\u6587\u5199\u4F5C.html#editor?workId=${workId}`,
      javaScriptEnabled: true,
      domStorageEnabled: true,
      allowFileAccess: true,
      allowContentAccess: true,
      supportZoom: true,
      useWideViewPort: true,
      loadWithOverviewMode: true
    })
  );
}

// src/ui/novel_materials.ui.ts
function Screen3(ctx) {
  var _a, _b;
  const { UI } = ctx;
  const params = (_a = ctx.routeParams) != null ? _a : {};
  const workId = (_b = params.workId) != null ? _b : "";
  return UI.Box(
    { fillMaxSize: true },
    UI.WebView({
      key: `novel_materials_webview_${workId}`,
      fillMaxSize: true,
      url: `file:///android_asset/packages/novelide/resources/webapp/\u7F51\u6587\u5199\u4F5C.html#materials?workId=${workId}`,
      javaScriptEnabled: true,
      domStorageEnabled: true,
      allowFileAccess: true,
      allowContentAccess: true,
      supportZoom: true,
      useWideViewPort: true,
      loadWithOverviewMode: true
    })
  );
}

// src/ui/novel_outline_page.ts
function OutlinePage(ctx) {
  var _a, _b;
  const { UI } = ctx;
  const colors = ctx.MaterialTheme.colorScheme;
  const params = (_a = ctx.routeParams) != null ? _a : {};
  const workId = (_b = params.workId) != null ? _b : "";
  const [nodes, setNodes] = ctx.useState("nodes", []);
  const [chapters, setChapters] = ctx.useState("chapters", []);
  const [selectedNode, setSelectedNode] = ctx.useState("selectedNode", null);
  const [isEditing, setIsEditing] = ctx.useState("isEditing", false);
  const [editTitle, setEditTitle] = ctx.useState("editTitle", "");
  const [editContent, setEditContent] = ctx.useState("editContent", "");
  const [editChapterId, setEditChapterId] = ctx.useState("editChapterId", "");
  const [parentId, setParentId] = ctx.useState("parentId", null);
  const [showAddDialog, setShowAddDialog] = ctx.useState("showAddDialog", false);
  async function loadNodes() {
    try {
      const result = await Tools.callNative("getOutlineNodes", [workId]);
      const list = typeof result === "string" ? JSON.parse(result) : result;
      setNodes(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("\u52A0\u8F7D\u5927\u7EB2\u5931\u8D25:", error);
    }
  }
  async function loadChapters() {
    try {
      const result = await Tools.callNative("getChapters", [workId]);
      const list = typeof result === "string" ? JSON.parse(result) : result;
      setChapters(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("\u52A0\u8F7D\u7AE0\u8282\u5931\u8D25:", error);
    }
  }
  async function createNode(title, content, parent) {
    try {
      await Tools.callNative("createOutlineNode", [workId, title, content, parent || ""]);
      await loadNodes();
      setShowAddDialog(false);
    } catch (error) {
      console.error("\u521B\u5EFA\u8282\u70B9\u5931\u8D25:", error);
    }
  }
  async function updateNode(nodeId, title, content, chapterId) {
    try {
      await Tools.callNative("updateOutlineNodeEx", [nodeId, title, content, chapterId || ""]);
      await loadNodes();
      setIsEditing(false);
      setSelectedNode(null);
    } catch (error) {
      console.error("\u66F4\u65B0\u8282\u70B9\u5931\u8D25:", error);
    }
  }
  async function moveNode(nodeId, newParentId, newSortOrder) {
    try {
      await Tools.callNative("reorderOutlineNode", [nodeId, newParentId || "", newSortOrder]);
      await loadNodes();
    } catch (error) {
      console.error("\u79FB\u52A8\u8282\u70B9\u5931\u8D25:", error);
    }
  }
  const [expandedNodes, setExpandedNodes] = ctx.useState("expandedNodes", /* @__PURE__ */ new Set());
  function toggleExpand(nodeId) {
    const newSet = new Set(expandedNodes);
    if (newSet.has(nodeId)) {
      newSet.delete(nodeId);
    } else {
      newSet.add(nodeId);
    }
    setExpandedNodes(newSet);
  }
  async function deleteNode(nodeId) {
    try {
      await Tools.callNative("deleteOutlineNode", [nodeId]);
      await loadNodes();
      setSelectedNode(null);
    } catch (error) {
      console.error("\u5220\u9664\u8282\u70B9\u5931\u8D25:", error);
    }
  }
  ctx.useEffect(() => {
    loadNodes();
    loadChapters();
  }, []);
  const topBar = UI.TopAppBar({
    title: "\u5927\u7EB2\u7BA1\u7406",
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
  function renderNodeList() {
    const rootNodes = nodes.filter((n) => !n.parentId);
    function renderNode(node, level = 0) {
      const children = nodes.filter((n) => n.parentId === node.id);
      const isSelected = (selectedNode == null ? void 0 : selectedNode.id) === node.id;
      const isExpanded = expandedNodes.has(node.id);
      const hasChildren = children.length > 0;
      const linkedChapter = node.chapterId ? chapters.find((ch) => ch.id === node.chapterId) : null;
      return UI.Column({
        key: node.id,
        modifier: UI.Modifier.paddingLeft(level * 16)
      }, [
        UI.Card({
          modifier: UI.Modifier.fillMaxWidth().clickable(() => {
            setSelectedNode(node);
            setEditTitle(node.title);
            setEditContent(node.content);
            setEditChapterId(node.chapterId || "");
            setIsEditing(false);
          }).padding(4),
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
            icon: hasChildren ? isExpanded ? "folder_open" : "folder" : "description",
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
              text: `\u{1F517} ${linkedChapter.title}`,
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
        ...isExpanded || !hasChildren ? children.map((child) => renderNode(child, level + 1)) : []
      ]);
    }
    return UI.LazyColumn({
      fillMaxWidth: true,
      contentPadding: 8
    }, rootNodes.map((node) => renderNode(node)));
  }
  function renderDetailPanel() {
    if (!selectedNode) {
      return UI.Box({
        fillMaxSize: true,
        contentAlignment: "center"
      }, [
        UI.Text({
          text: "\u9009\u62E9\u4E00\u4E2A\u8282\u70B9\u67E5\u770B\u8BE6\u60C5",
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
          text: "\u7F16\u8F91\u8282\u70B9",
          style: "titleMedium"
        }),
        UI.TextField({
          value: editTitle,
          onValueChange: setEditTitle,
          label: "\u6807\u9898",
          fillMaxWidth: true
        }),
        UI.TextField({
          value: editContent,
          onValueChange: setEditContent,
          label: "\u5185\u5BB9",
          fillMaxWidth: true,
          minLines: 5,
          maxLines: 10,
          multiline: true
        }),
        UI.Dropdown({
          label: "\u5173\u8054\u7AE0\u8282",
          value: editChapterId,
          onValueChange: setEditChapterId,
          options: [
            { value: "", label: "\u65E0\u5173\u8054" },
            ...chapters.map((ch) => ({ value: ch.id, label: ch.title }))
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
          }, "\u53D6\u6D88"),
          UI.Button({
            onClick: () => updateNode(selectedNode.id, editTitle, editContent, editChapterId)
          }, "\u4FDD\u5B58")
        ])
      ]);
    }
    const linkedChapter = selectedNode.chapterId ? chapters.find((ch) => ch.id === selectedNode.chapterId) : null;
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
          label: `\u5173\u8054\u7AE0\u8282: ${linkedChapter.title}`,
          icon: "link",
          variant: "outlined"
        }),
        UI.IconButton({
          icon: "open_in_new",
          onClick: () => {
            try {
              Tools.callNative("navigateToChapter", [linkedChapter.id]);
            } catch (e) {
              console.log("\u8DF3\u8F6C\u7AE0\u8282:", linkedChapter.id);
            }
          },
          tooltip: "\u6253\u5F00\u7AE0\u8282",
          compact: true
        })
      ]) : null,
      UI.Text({
        text: selectedNode.content || "\u6682\u65E0\u5185\u5BB9",
        style: "bodyMedium",
        color: colors.onSurfaceVariant
      }),
      UI.Text({
        text: `\u521B\u5EFA\u65F6\u95F4: ${new Date(selectedNode.createdAt).toLocaleString()}`,
        style: "bodySmall",
        color: colors.onSurfaceVariant
      })
    ].filter(Boolean));
  }
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
          text: parentId ? "\u6DFB\u52A0\u5B50\u8282\u70B9" : "\u6DFB\u52A0\u6839\u8282\u70B9",
          style: "titleMedium"
        }),
        UI.TextField({
          value: editTitle,
          onValueChange: setEditTitle,
          label: "\u6807\u9898",
          fillMaxWidth: true
        }),
        UI.TextField({
          value: editContent,
          onValueChange: setEditContent,
          label: "\u5185\u5BB9\uFF08\u53EF\u9009\uFF09",
          fillMaxWidth: true,
          minLines: 3,
          multiline: true
        }),
        UI.Dropdown({
          label: "\u5173\u8054\u7AE0\u8282\uFF08\u53EF\u9009\uFF09",
          value: editChapterId,
          onValueChange: setEditChapterId,
          options: [
            { value: "", label: "\u65E0\u5173\u8054" },
            ...chapters.map((ch) => ({ value: ch.id, label: ch.title }))
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
          }, "\u53D6\u6D88"),
          UI.Button({
            onClick: () => createNode(editTitle, editContent, parentId),
            enabled: editTitle.trim().length > 0
          }, "\u521B\u5EFA")
        ])
      ]))
    ]);
  }
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

// src/ui/novel_outline.ui.ts
function Screen4(ctx) {
  var _a;
  const { UI } = ctx;
  const params = (_a = ctx.routeParams) != null ? _a : {};
  return OutlinePage(ctx);
}

// src/ui/novel_stats_page.ts
function StatsPage(ctx) {
  var _a, _b;
  const { UI } = ctx;
  const colors = ctx.MaterialTheme.colorScheme;
  const params = (_a = ctx.routeParams) != null ? _a : {};
  const workId = (_b = params.workId) != null ? _b : "";
  const [stats, setStats] = ctx.useState("stats", {
    totalWords: 0,
    todayWords: 0,
    recentWords7d: 0,
    continuousDays: 0,
    dailyGoal: 2e3,
    dailyHistory: [],
    totalChapters: 0,
    avgChapterWords: 0,
    statusCounts: {},
    longestChapter: null,
    shortestChapter: null
  });
  const [loading, setLoading] = ctx.useState("loading", true);
  const [selectedPeriod, setSelectedPeriod] = ctx.useState("selectedPeriod", "7d");
  async function loadStats() {
    var _a2, _b2, _c, _d, _e, _f, _g, _h;
    setLoading(true);
    try {
      const result = await Tools.callNative("getWritingStats", [workId]);
      const data = typeof result === "string" ? JSON.parse(result) : result;
      const dailyStatsMap = data.dailyStats || {};
      const dailyHistory = Object.entries(dailyStatsMap).map(([date, words]) => ({ date, words: Number(words) })).sort((a, b) => a.date.localeCompare(b.date));
      const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
      const todayWords = dailyStatsMap[today] || 0;
      let continuousDays = 0;
      const sortedDates = Object.keys(dailyStatsMap).sort().reverse();
      const now = /* @__PURE__ */ new Date();
      for (let i = 0; i < sortedDates.length; i++) {
        const expectedDate = new Date(now);
        expectedDate.setDate(expectedDate.getDate() - i);
        const expectedStr = expectedDate.toISOString().slice(0, 10);
        if (sortedDates[i] === expectedStr && dailyStatsMap[sortedDates[i]] > 0) {
          continuousDays++;
        } else {
          break;
        }
      }
      setStats({
        totalWords: (_a2 = data.totalWords) != null ? _a2 : 0,
        todayWords,
        recentWords7d: (_b2 = data.recentWords7d) != null ? _b2 : 0,
        continuousDays,
        dailyGoal: (_c = data.dailyGoal) != null ? _c : 2e3,
        dailyHistory,
        totalChapters: (_d = data.totalChapters) != null ? _d : 0,
        avgChapterWords: (_e = data.avgChapterWords) != null ? _e : 0,
        statusCounts: (_f = data.statusCounts) != null ? _f : {},
        longestChapter: (_g = data.longestChapter) != null ? _g : null,
        shortestChapter: (_h = data.shortestChapter) != null ? _h : null
      });
    } catch (error) {
      console.error("\u52A0\u8F7D\u7EDF\u8BA1\u6570\u636E\u5931\u8D25:", error);
    } finally {
      setLoading(false);
    }
  }
  ctx.useEffect(() => {
    loadStats();
  }, []);
  const goalProgress = stats.dailyGoal > 0 ? Math.min(stats.todayWords / stats.dailyGoal, 1) : 0;
  const goalPercent = Math.round(goalProgress * 100);
  function statCard(icon, label, value, tint, subtitle) {
    return UI.Card({
      modifier: UI.Modifier.padding(4).weight(1),
      background: colors.surfaceVariant
    }, UI.Column({
      padding: 16,
      spacing: 8,
      contentAlignment: "center"
    }, [
      UI.Icon({ name: icon, size: 28, tint }),
      UI.Text({ text: value, style: "headlineMedium", color: tint }),
      UI.Text({ text: label, style: "bodySmall", color: colors.onSurfaceVariant }),
      subtitle ? UI.Text({ text: subtitle, style: "labelSmall", color: colors.outline }) : null
    ].filter(Boolean)));
  }
  function goalProgressBar() {
    return UI.Card({
      modifier: UI.Modifier.padding(12, 8).fillMaxWidth()
    }, UI.Column({ padding: 16, spacing: 12 }, [
      UI.Row({ fillMaxWidth: true, horizontalArrangement: "space-between" }, [
        UI.Text({ text: "\u4ECA\u65E5\u76EE\u6807", style: "titleMedium" }),
        UI.Text({ text: `${stats.todayWords.toLocaleString()} / ${stats.dailyGoal.toLocaleString()} \u5B57`, style: "bodyMedium", color: colors.onSurfaceVariant })
      ]),
      UI.Box({
        fillMaxWidth: true,
        height: 12,
        background: colors.surfaceVariant,
        cornerRadius: 6
      }, [
        UI.Box({
          width: `${goalPercent}%`,
          height: 12,
          background: goalPercent >= 100 ? colors.tertiary : colors.primary,
          cornerRadius: 6
        })
      ]),
      UI.Row({ fillMaxWidth: true, horizontalArrangement: "space-between" }, [
        UI.Text({
          text: goalPercent >= 100 ? "\u5DF2\u5B8C\u6210\u4ECA\u65E5\u76EE\u6807!" : `\u5DF2\u5B8C\u6210 ${goalPercent}%`,
          style: "bodySmall",
          color: goalPercent >= 100 ? colors.tertiary : colors.onSurfaceVariant
        }),
        UI.Text({
          text: `\u8FD8\u5269 ${Math.max(0, stats.dailyGoal - stats.todayWords).toLocaleString()} \u5B57`,
          style: "bodySmall",
          color: colors.outline
        })
      ])
    ]));
  }
  function dailyChart() {
    const periodDays = selectedPeriod === "7d" ? 7 : selectedPeriod === "14d" ? 14 : 30;
    const history = stats.dailyHistory.slice(-periodDays);
    if (history.length === 0) {
      return UI.Card({
        modifier: UI.Modifier.padding(12, 8).fillMaxWidth()
      }, UI.Column({ padding: 16, spacing: 8 }, [
        UI.Text({ text: "\u6BCF\u65E5\u5B57\u6570", style: "titleMedium" }),
        UI.Box({ fillMaxWidth: true, height: 200, contentAlignment: "center" }, [
          UI.Text({ text: "\u6682\u65E0\u5199\u4F5C\u8BB0\u5F55", style: "bodyMedium", color: colors.onSurfaceVariant })
        ])
      ]));
    }
    const maxWords = Math.max(...history.map((d) => d.words), 1);
    const totalWords = history.reduce((sum, d) => sum + d.words, 0);
    const avgWords = Math.round(totalWords / history.length);
    return UI.Card({
      modifier: UI.Modifier.padding(12, 8).fillMaxWidth()
    }, UI.Column({ padding: 16, spacing: 12 }, [
      // 图表标题和周期选择
      UI.Row({ fillMaxWidth: true, horizontalArrangement: "space-between", verticalAlignment: "center" }, [
        UI.Text({ text: "\u6BCF\u65E5\u5B57\u6570", style: "titleMedium" }),
        UI.Row({ spacing: 4 }, [
          UI.Button({
            onClick: () => setSelectedPeriod("7d"),
            variant: selectedPeriod === "7d" ? "filled" : "text",
            compact: true
          }, "7\u5929"),
          UI.Button({
            onClick: () => setSelectedPeriod("14d"),
            variant: selectedPeriod === "14d" ? "filled" : "text",
            compact: true
          }, "14\u5929"),
          UI.Button({
            onClick: () => setSelectedPeriod("30d"),
            variant: selectedPeriod === "30d" ? "filled" : "text",
            compact: true
          }, "30\u5929")
        ])
      ]),
      // 统计摘要
      UI.Row({ fillMaxWidth: true, horizontalArrangement: "space-around" }, [
        UI.Column({ horizontalAlignment: "center" }, [
          UI.Text({ text: totalWords.toLocaleString(), style: "titleSmall", color: colors.primary }),
          UI.Text({ text: "\u603B\u5B57\u6570", style: "labelSmall", color: colors.outline })
        ]),
        UI.Column({ horizontalAlignment: "center" }, [
          UI.Text({ text: avgWords.toLocaleString(), style: "titleSmall", color: colors.secondary }),
          UI.Text({ text: "\u65E5\u5747", style: "labelSmall", color: colors.outline })
        ]),
        UI.Column({ horizontalAlignment: "center" }, [
          UI.Text({ text: Math.max(...history.map((d) => d.words)).toLocaleString(), style: "titleSmall", color: colors.tertiary }),
          UI.Text({ text: "\u6700\u9AD8", style: "labelSmall", color: colors.outline })
        ])
      ]),
      // 柱状图区域
      UI.Box({
        fillMaxWidth: true,
        height: 200,
        padding: { top: 20, bottom: 30 }
      }, [
        // Y轴参考线
        UI.Column({
          fillMaxSize: true,
          horizontalAlignment: "end"
        }, [
          UI.Text({ text: maxWords.toLocaleString(), style: "labelSmall", color: colors.outline }),
          UI.Box({ fillMaxWidth: true, weight: 1 }),
          UI.Text({ text: Math.round(maxWords / 2).toLocaleString(), style: "labelSmall", color: colors.outline }),
          UI.Box({ fillMaxWidth: true, weight: 1 }),
          UI.Text({ text: "0", style: "labelSmall", color: colors.outline })
        ]),
        // 柱状图
        UI.Row({
          fillMaxSize: true,
          horizontalArrangement: "space-between",
          contentAlignment: "bottom",
          modifier: UI.Modifier.padding({ left: 40 })
        }, history.map((day) => {
          const ratio = day.words / maxWords;
          const barHeight = Math.max(ratio * 160, 2);
          const isToday = day.date === (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
          const isHigh = day.words > avgWords * 1.2;
          return UI.Column({
            weight: 1,
            spacing: 4,
            contentAlignment: "bottom"
          }, [
            UI.Text({
              text: day.words > 0 ? `${day.words}` : "",
              style: "labelSmall",
              color: isHigh ? colors.tertiary : colors.onSurfaceVariant,
              maxLines: 1
            }),
            UI.Box({
              fillMaxWidth: true,
              height: barHeight,
              background: isToday ? colors.primary : isHigh ? colors.tertiaryContainer : colors.primaryContainer,
              cornerRadius: 4,
              margin: { horizontal: 2 }
            }),
            UI.Text({
              text: day.date.slice(5),
              style: "labelSmall",
              color: isToday ? colors.primary : colors.onSurfaceVariant,
              maxLines: 1
            })
          ]);
        }))
      ])
    ]));
  }
  function chapterStatusChart() {
    const statusEntries = Object.entries(stats.statusCounts);
    if (statusEntries.length === 0) return null;
    const statusLabels = {
      "draft": "\u8349\u7A3F",
      "writing": "\u5199\u4F5C\u4E2D",
      "completed": "\u5DF2\u5B8C\u6210",
      "revising": "\u4FEE\u8BA2\u4E2D",
      "published": "\u5DF2\u53D1\u5E03"
    };
    const statusColors = {
      "draft": colors.outline,
      "writing": colors.primary,
      "completed": colors.tertiary,
      "revising": colors.secondary,
      "published": colors.error
    };
    const total = statusEntries.reduce((sum, [_, count]) => sum + count, 0);
    return UI.Card({
      modifier: UI.Modifier.padding(12, 8).fillMaxWidth()
    }, UI.Column({ padding: 16, spacing: 12 }, [
      UI.Text({ text: "\u7AE0\u8282\u72B6\u6001\u5206\u5E03", style: "titleMedium" }),
      UI.Row({
        fillMaxWidth: true,
        height: 24,
        spacing: 2
      }, statusEntries.map(([status, count]) => {
        const ratio = count / total;
        return UI.Box({
          weight: ratio,
          fillMaxHeight: true,
          background: statusColors[status] || colors.outline,
          cornerRadius: 4
        });
      })),
      UI.Row({
        fillMaxWidth: true,
        horizontalArrangement: "space-around"
      }, statusEntries.map(
        ([status, count]) => UI.Column({ horizontalAlignment: "center" }, [
          UI.Text({ text: `${count}`, style: "labelLarge", color: statusColors[status] || colors.outline }),
          UI.Text({ text: statusLabels[status] || status, style: "labelSmall", color: colors.outline })
        ])
      ))
    ]));
  }
  function efficiencyMetrics() {
    const avgPerDay = stats.dailyHistory.length > 0 ? Math.round(stats.dailyHistory.reduce((sum, d) => sum + d.words, 0) / stats.dailyHistory.length) : 0;
    const daysWithWriting = stats.dailyHistory.filter((d) => d.words > 0).length;
    const writingRate = stats.dailyHistory.length > 0 ? Math.round(daysWithWriting / stats.dailyHistory.length * 100) : 0;
    return UI.Card({
      modifier: UI.Modifier.padding(12, 8).fillMaxWidth()
    }, UI.Column({ padding: 16, spacing: 12 }, [
      UI.Text({ text: "\u5199\u4F5C\u6548\u7387", style: "titleMedium" }),
      UI.Row({ fillMaxWidth: true, horizontalArrangement: "space-around" }, [
        UI.Column({ horizontalAlignment: "center" }, [
          UI.Text({ text: `${avgPerDay.toLocaleString()}`, style: "headlineSmall", color: colors.primary }),
          UI.Text({ text: "\u65E5\u5747\u5B57\u6570", style: "bodySmall", color: colors.outline })
        ]),
        UI.Column({ horizontalAlignment: "center" }, [
          UI.Text({ text: `${writingRate}%`, style: "headlineSmall", color: colors.secondary }),
          UI.Text({ text: "\u5199\u4F5C\u9891\u7387", style: "bodySmall", color: colors.outline })
        ]),
        UI.Column({ horizontalAlignment: "center" }, [
          UI.Text({ text: `${stats.continuousDays}`, style: "headlineSmall", color: colors.error }),
          UI.Text({ text: "\u8FDE\u7EED\u5929\u6570", style: "bodySmall", color: colors.outline })
        ])
      ])
    ]));
  }
  const content = loading ? UI.Box({ fillMaxSize: true, contentAlignment: "center" }, UI.CircularProgressIndicator()) : UI.LazyColumn({
    fillMaxSize: true,
    contentPadding: 12,
    verticalArrangement: 8
  }, [
    // 顶部统计卡片行
    UI.Row({ fillMaxWidth: true, horizontalArrangement: 4 }, [
      statCard("edit_note", "\u603B\u5B57\u6570", stats.totalWords.toLocaleString(), colors.primary),
      statCard("today", "\u4ECA\u65E5\u5B57\u6570", stats.todayWords.toLocaleString(), colors.secondary)
    ]),
    UI.Row({ fillMaxWidth: true, horizontalArrangement: 4 }, [
      statCard("local_fire_department", "\u8FDE\u7EED\u5929\u6570", `${stats.continuousDays} \u5929`, colors.error),
      statCard("emoji_events", "\u5B8C\u6210\u5EA6", `${goalPercent}%`, colors.tertiary)
    ]),
    // 章节统计卡片
    UI.Row({ fillMaxWidth: true, horizontalArrangement: 4 }, [
      statCard("menu_book", "\u7AE0\u8282\u6570", `${stats.totalChapters}`, colors.primary),
      statCard("analytics", "\u5E73\u5747\u5B57\u6570", stats.avgChapterWords.toLocaleString(), colors.secondary)
    ]),
    // 近7天字数
    UI.Row({ fillMaxWidth: true, horizontalArrangement: 4 }, [
      statCard("trending_up", "\u8FD17\u5929", stats.recentWords7d.toLocaleString(), colors.tertiary, "\u5B57")
    ]),
    // 目标进度
    goalProgressBar(),
    // 写作效率
    efficiencyMetrics(),
    // 章节状态分布
    chapterStatusChart(),
    // 最长/最短章节
    stats.longestChapter ? UI.Card({
      modifier: UI.Modifier.padding(12, 8).fillMaxWidth(),
      background: colors.surfaceVariant
    }, UI.Column({ padding: 16, spacing: 8 }, [
      UI.Text({ text: "\u6700\u957F\u7AE0\u8282", style: "labelMedium", color: colors.onSurfaceVariant }),
      UI.Text({ text: stats.longestChapter.title, style: "titleSmall" }),
      UI.Text({ text: `${stats.longestChapter.wordCount.toLocaleString()} \u5B57`, style: "bodyMedium", color: colors.primary })
    ])) : null,
    stats.shortestChapter ? UI.Card({
      modifier: UI.Modifier.padding(12, 8).fillMaxWidth(),
      background: colors.surfaceVariant
    }, UI.Column({ padding: 16, spacing: 8 }, [
      UI.Text({ text: "\u6700\u77ED\u7AE0\u8282", style: "labelMedium", color: colors.onSurfaceVariant }),
      UI.Text({ text: stats.shortestChapter.title, style: "titleSmall" }),
      UI.Text({ text: `${stats.shortestChapter.wordCount.toLocaleString()} \u5B57`, style: "bodyMedium", color: colors.secondary })
    ])) : null,
    // 每日字数图表
    dailyChart()
  ].filter(Boolean));
  return UI.Box({ fillMaxSize: true }, [
    UI.TopAppBar({
      title: "\u5199\u4F5C\u7EDF\u8BA1",
      actions: [
        UI.IconButton({
          icon: "refresh",
          onClick: loadStats
        })
      ]
    }),
    content
  ]);
}

// src/ui/novel_stats.ui.ts
function Screen5(ctx) {
  var _a;
  const { UI } = ctx;
  const params = (_a = ctx.routeParams) != null ? _a : {};
  return StatsPage(ctx);
}

// src/ui/novel_tools.ui.ts
function Screen6(ctx) {
  const { UI } = ctx;
  return UI.Box(
    { fillMaxSize: true },
    UI.WebView({
      key: "novel_tools_webview",
      fillMaxSize: true,
      url: "file:///android_asset/packages/novelide/resources/webapp/\u5DE5\u5177\u7BB1.html",
      javaScriptEnabled: true,
      domStorageEnabled: true,
      allowFileAccess: true,
      allowContentAccess: true,
      supportZoom: true,
      useWideViewPort: true,
      loadWithOverviewMode: true
    })
  );
}

// src/ui/novel_workspace.ui.ts
function Screen7(ctx) {
  const { UI } = ctx;
  return UI.Box(
    { fillMaxSize: true },
    UI.WebView({
      key: "novel_workspace_webview",
      fillMaxSize: true,
      url: "file:///android_asset/packages/novelide/resources/webapp/\u5B8C\u6574\u7248.html#workspace",
      javaScriptEnabled: true,
      domStorageEnabled: true,
      allowFileAccess: true,
      allowContentAccess: true,
      supportZoom: true,
      useWideViewPort: true,
      loadWithOverviewMode: true
    })
  );
}

// src/ui/novel_io_page.ts
function IOPage(ctx, workId) {
  const { UI } = ctx;
  const colors = ctx.MaterialTheme.colorScheme;
  const [importing, setImporting] = ctx.useState("importing", false);
  const [exporting, setExporting] = ctx.useState("exporting", false);
  const [backing, setBacking] = ctx.useState("backing", false);
  const [restoring, setRestoring] = ctx.useState("restoring", false);
  const [message, setMessage] = ctx.useState("message", "");
  const [selectedFormat, setSelectedFormat] = ctx.useState("selectedFormat", "txt");
  const [showImportDialog, setShowImportDialog] = ctx.useState("showImportDialog", false);
  const [importUri, setImportUri] = ctx.useState("importUri", "");
  const [importFileName, setImportFileName] = ctx.useState("importFileName", "");
  function showMessage(msg) {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3e3);
  }
  async function importFile() {
    setShowImportDialog(true);
  }
  async function confirmImportFile() {
    if (!importUri.trim() || !importFileName.trim()) {
      showMessage("\u8BF7\u8F93\u5165\u6587\u4EF6\u8DEF\u5F84\u548C\u6587\u4EF6\u540D");
      return;
    }
    setShowImportDialog(false);
    setImporting(true);
    try {
      const result = await Tools.callNative("importFile", [importUri, importFileName, workId]);
      if (result) {
        showMessage("\u5BFC\u5165\u6210\u529F");
      }
    } catch (error) {
      console.error("[NovelIDE] [ERROR] \u5BFC\u5165\u5931\u8D25:", error);
      showMessage("\u5BFC\u5165\u5931\u8D25: " + error.message);
    } finally {
      setImporting(false);
      setImportUri("");
      setImportFileName("");
    }
  }
  async function exportFile() {
    setExporting(true);
    try {
      let result;
      switch (selectedFormat) {
        case "txt":
          result = await Tools.callNative("exportWorkTxt", [workId]);
          break;
        case "md":
          result = await Tools.callNative("exportWorkMd", [workId]);
          break;
        case "json":
          result = await Tools.callNative("exportWorkJson", [workId]);
          break;
        default:
          result = await Tools.callNative("exportWorkTxt", [workId]);
      }
      if (result) {
        showMessage("\u5BFC\u51FA\u6210\u529F");
      }
    } catch (error) {
      console.error("[NovelIDE] [ERROR] \u5BFC\u51FA\u5931\u8D25:", error);
      showMessage("\u5BFC\u51FA\u5931\u8D25: " + error.message);
    } finally {
      setExporting(false);
    }
  }
  async function backupData() {
    setBacking(true);
    try {
      const result = await Tools.callNative("exportWorkJson", [workId]);
      if (result) {
        showMessage("\u5907\u4EFD\u6210\u529F");
      }
    } catch (error) {
      console.error("[NovelIDE] [ERROR] \u5907\u4EFD\u5931\u8D25:", error);
      showMessage("\u5907\u4EFD\u5931\u8D25: " + error.message);
    } finally {
      setBacking(false);
    }
  }
  async function restoreData() {
    setShowImportDialog(true);
  }
  async function confirmRestoreData() {
    if (!importUri.trim() || !importFileName.trim()) {
      showMessage("\u8BF7\u8F93\u5165\u5907\u4EFD\u6587\u4EF6\u8DEF\u5F84\u548C\u6587\u4EF6\u540D");
      return;
    }
    setShowImportDialog(false);
    setRestoring(true);
    try {
      const result = await Tools.callNative("importFile", [importUri, importFileName, workId]);
      if (result) {
        showMessage("\u6062\u590D\u6210\u529F");
      }
    } catch (error) {
      console.error("[NovelIDE] [ERROR] \u6062\u590D\u5931\u8D25:", error);
      showMessage("\u6062\u590D\u5931\u8D25: " + error.message);
    } finally {
      setRestoring(false);
      setImportUri("");
      setImportFileName("");
    }
  }
  function formatCard(format, title, subtitle, icon) {
    const isSelected = selectedFormat === format;
    return UI.Card({
      modifier: UI.Modifier.padding(4).clickable(() => setSelectedFormat(format)),
      background: isSelected ? colors.primaryContainer : colors.surface
    }, UI.Row({
      padding: 16,
      fillMaxWidth: true,
      spacing: 12,
      verticalAlignment: "center"
    }, [
      UI.Icon({
        name: icon,
        size: 24,
        tint: isSelected ? colors.primary : colors.onSurfaceVariant
      }),
      UI.Column({ weight: 1 }, [
        UI.Text({
          text: title,
          style: "titleSmall",
          color: isSelected ? colors.onPrimaryContainer : colors.onSurface
        }),
        UI.Text({
          text: subtitle,
          style: "bodySmall",
          color: colors.onSurfaceVariant
        })
      ]),
      isSelected ? UI.Icon({ name: "check_circle", size: 20, tint: colors.primary }) : null
    ]));
  }
  function actionButton(label, icon, onClick, loading, color) {
    return UI.Button({
      onClick,
      enabled: !loading,
      modifier: UI.Modifier.fillMaxWidth().padding({ vertical: 4 }),
      background: color || colors.primary
    }, loading ? `${label}\u4E2D...` : `${icon === "upload" ? "\u2191" : icon === "download" ? "\u2193" : icon === "backup" ? "\u2197" : "\u2199"} ${label}`);
  }
  return UI.Box({ fillMaxSize: true }, [
    UI.TopAppBar({ title: "\u5BFC\u5165\u5BFC\u51FA" }),
    UI.LazyColumn({
      fillMaxSize: true,
      contentPadding: 16,
      verticalArrangement: 8
    }, [
      // 提示消息
      message ? UI.Card({
        background: colors.tertiaryContainer,
        modifier: UI.Modifier.padding({ bottom: 8 })
      }, UI.Row({
        padding: 12,
        fillMaxWidth: true,
        spacing: 8,
        verticalAlignment: "center"
      }, [
        UI.Icon({ name: "info", size: 18, tint: colors.onTertiaryContainer }),
        UI.Text({
          text: message,
          style: "bodyMedium",
          color: colors.onTertiaryContainer
        })
      ])) : null,
      // 格式选择
      UI.Text({ text: "\u9009\u62E9\u683C\u5F0F", style: "titleMedium", modifier: UI.Modifier.padding({ vertical: 8 }) }),
      formatCard("txt", "TXT \u7EAF\u6587\u672C", "\u901A\u7528\u6587\u672C\u683C\u5F0F\uFF0C\u517C\u5BB9\u6027\u6700\u597D", "description"),
      formatCard("md", "Markdown", "\u652F\u6301\u6807\u9898\u3001\u52A0\u7C97\u7B49\u683C\u5F0F\u6807\u8BB0", "text_format"),
      formatCard("json", "JSON", "\u4FDD\u7559\u5B8C\u6574\u7ED3\u6784\u5316\u6570\u636E", "data_object"),
      // 导入导出操作
      UI.Text({ text: "\u5BFC\u5165\u5BFC\u51FA", style: "titleMedium", modifier: UI.Modifier.padding({ top: 16, bottom: 8 }) }),
      UI.Card({
        modifier: UI.Modifier.padding(4)
      }, UI.Column({
        padding: 16,
        spacing: 8
      }, [
        UI.Row({
          fillMaxWidth: true,
          spacing: 8
        }, [
          UI.Box({ weight: 1 }, [
            actionButton("\u5BFC\u5165\u6587\u4EF6", "upload", importFile, importing, colors.primary)
          ]),
          UI.Box({ weight: 1 }, [
            actionButton("\u5BFC\u51FA\u6587\u4EF6", "download", exportFile, exporting, colors.secondary)
          ])
        ])
      ])),
      // 备份恢复
      UI.Text({ text: "\u5907\u4EFD\u4E0E\u6062\u590D", style: "titleMedium", modifier: UI.Modifier.padding({ top: 16, bottom: 8 }) }),
      UI.Card({
        modifier: UI.Modifier.padding(4)
      }, UI.Column({
        padding: 16,
        spacing: 8
      }, [
        UI.Text({
          text: "\u5907\u4EFD\u5C06\u4FDD\u5B58\u6240\u6709\u4F5C\u54C1\u6570\u636E\uFF0C\u6062\u590D\u5C06\u4ECE\u5907\u4EFD\u6587\u4EF6\u4E2D\u8FD8\u539F",
          style: "bodySmall",
          color: colors.onSurfaceVariant
        }),
        UI.Row({
          fillMaxWidth: true,
          spacing: 8
        }, [
          UI.Box({ weight: 1 }, [
            actionButton("\u5907\u4EFD\u6570\u636E", "backup", backupData, backing, colors.tertiary)
          ]),
          UI.Box({ weight: 1 }, [
            actionButton("\u6062\u590D\u6570\u636E", "restore", restoreData, restoring, colors.error)
          ])
        ])
      ]))
    ]),
    // 导入文件对话框
    showImportDialog ? UI.AlertDialog(
      { onDismissRequest: () => setShowImportDialog(false) },
      UI.Card({
        modifier: UI.Modifier.fillMaxWidth().padding(16)
      }, UI.Column({
        padding: 24,
        spacing: 16
      }, [
        UI.Text({
          text: "\u5BFC\u5165\u6587\u4EF6",
          style: "headlineSmall",
          color: colors.onSurface
        }),
        UI.Text({
          text: "\u8BF7\u8F93\u5165\u6587\u4EF6\u7684URI\u8DEF\u5F84\u548C\u6587\u4EF6\u540D",
          style: "bodyMedium",
          color: colors.onSurfaceVariant
        }),
        UI.TextField(
          {
            value: importUri,
            onValueChange: setImportUri,
            label: "\u6587\u4EF6\u8DEF\u5F84 (URI)",
            placeholder: "\u4F8B\u5982: content://...",
            modifier: UI.Modifier.fillMaxWidth()
          },
          {}
        ),
        UI.TextField(
          {
            value: importFileName,
            onValueChange: setImportFileName,
            label: "\u6587\u4EF6\u540D",
            placeholder: "\u4F8B\u5982: novel.txt",
            modifier: UI.Modifier.fillMaxWidth()
          },
          {}
        ),
        UI.Row({
          fillMaxWidth: true,
          horizontalArrangement: "end",
          spacing: 8
        }, [
          UI.TextButton(
            { onClick: () => setShowImportDialog(false) },
            "\u53D6\u6D88"
          ),
          UI.Button(
            { onClick: confirmImportFile },
            "\u786E\u8BA4\u5BFC\u5165"
          )
        ])
      ]))
    ) : null
  ]);
}

// src/ui/novel_io.ui.ts
function Screen8(ctx) {
  var _a, _b;
  const { UI } = ctx;
  const params = (_a = ctx.routeParams) != null ? _a : {};
  const workId = (_b = params.workId) != null ? _b : "";
  return IOPage(ctx, workId);
}

// src/ui/novel_relationship_page.ts
function RelationshipPage(ctx) {
  var _a, _b;
  const { UI } = ctx;
  const colors = ctx.MaterialTheme.colorScheme;
  const params = (_a = ctx.routeParams) != null ? _a : {};
  const workId = (_b = params.workId) != null ? _b : "";
  const [showToolbar, setShowToolbar] = ctx.useState("showToolbar", true);
  const [filterType, setFilterType] = ctx.useState("filterType", "all");
  const [searchQuery, setSearchQuery] = ctx.useState("searchQuery", "");
  const [showAddRelation, setShowAddRelation] = ctx.useState("showAddRelation", false);
  const [newRelation, setNewRelation] = ctx.useState("newRelation", { from: "", to: "", type: "" });
  function sendMessageToWebView(message) {
    var _a2;
    (_a2 = ctx.evalJavascript) == null ? void 0 : _a2.call(ctx, "relationship_webview", message);
  }
  function sendBridgeCommand(action, data = {}) {
    const cmd = JSON.stringify(__spreadValues({ action }, data));
    sendMessageToWebView(`handleBridgeCommand('${cmd.replace(/'/g, "\\'")}')`);
  }
  function exportAs(format) {
    sendBridgeCommand("exportNetwork", { format });
  }
  function filterByType(type) {
    setFilterType(type);
    sendBridgeCommand("filterByType", { type });
  }
  function searchCharacter(query) {
    setSearchQuery(query);
    sendBridgeCommand("searchCharacter", { query });
  }
  function resetView() {
    sendBridgeCommand("resetView");
    setFilterType("all");
    setSearchQuery("");
  }
  function addRelation() {
    if (!newRelation.from || !newRelation.to) return;
    sendBridgeCommand("addRelation", {
      from: newRelation.from,
      to: newRelation.to,
      type: newRelation.type || "\u672A\u77E5"
    });
    setNewRelation({ from: "", to: "", type: "" });
    setShowAddRelation(false);
  }
  const toolbar = UI.Row({
    fillMaxWidth: true,
    padding: 8,
    background: colors.surface,
    horizontalArrangement: "space-between"
  }, [
    UI.Row({ spacing: 8 }, [
      UI.Text({ text: "\u89D2\u8272\u5173\u7CFB\u56FE", style: "titleMedium" }),
      UI.IconButton({
        icon: "refresh",
        onClick: () => sendBridgeCommand("refreshData"),
        tooltip: "\u5237\u65B0\u6570\u636E"
      }),
      UI.IconButton({
        icon: "center_focus_strong",
        onClick: resetView,
        tooltip: "\u91CD\u7F6E\u89C6\u56FE"
      }),
      UI.IconButton({
        icon: "add_circle",
        onClick: () => setShowAddRelation(!showAddRelation),
        tooltip: "\u6DFB\u52A0\u5173\u7CFB"
      })
    ]),
    UI.Row({ spacing: 8 }, [
      UI.IconButton({
        icon: "image",
        onClick: () => exportAs("png"),
        tooltip: "\u5BFC\u51FA PNG"
      }),
      UI.IconButton({
        icon: "description",
        onClick: () => exportAs("svg"),
        tooltip: "\u5BFC\u51FA SVG"
      }),
      UI.IconButton({
        icon: showToolbar ? "visibility-off" : "visibility",
        onClick: () => {
          setShowToolbar(!showToolbar);
          sendBridgeCommand("toggleGraphToolbar", { visible: !showToolbar });
        },
        tooltip: showToolbar ? "\u9690\u85CF\u56FE\u5DE5\u5177\u680F" : "\u663E\u793A\u56FE\u5DE5\u5177\u680F"
      })
    ])
  ]);
  const filterBar = UI.Row({
    fillMaxWidth: true,
    padding: { horizontal: 8, vertical: 4 },
    spacing: 8,
    verticalAlignment: "center"
  }, [
    UI.TextField({
      value: searchQuery,
      onValueChange: searchCharacter,
      label: "\u641C\u7D22\u89D2\u8272",
      fillMaxWidth: true,
      leadingIcon: "search",
      modifier: UI.Modifier.weight(1)
    }),
    UI.Dropdown({
      label: "\u5173\u7CFB\u7C7B\u578B",
      value: filterType,
      onValueChange: filterByType,
      options: [
        { value: "all", label: "\u5168\u90E8" },
        { value: "\u5BB6\u65CF", label: "\u5BB6\u65CF" },
        { value: "\u53CB\u60C5", label: "\u53CB\u60C5" },
        { value: "\u654C\u5BF9", label: "\u654C\u5BF9" },
        { value: "\u7231\u60C5", label: "\u7231\u60C5" },
        { value: "\u5E08\u5F92", label: "\u5E08\u5F92" },
        { value: "\u4E3B\u4EC6", label: "\u4E3B\u4EC6" },
        { value: "\u540C\u95E8", label: "\u540C\u95E8" }
      ],
      width: 120
    })
  ]);
  function renderAddRelationDialog() {
    if (!showAddRelation) return null;
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
        UI.Text({ text: "\u6DFB\u52A0\u65B0\u5173\u7CFB", style: "titleMedium" }),
        UI.TextField({
          value: newRelation.from,
          onValueChange: (v) => setNewRelation(__spreadProps(__spreadValues({}, newRelation), { from: v })),
          label: "\u6E90\u5934\u89D2\u8272",
          fillMaxWidth: true
        }),
        UI.TextField({
          value: newRelation.to,
          onValueChange: (v) => setNewRelation(__spreadProps(__spreadValues({}, newRelation), { to: v })),
          label: "\u76EE\u6807\u89D2\u8272",
          fillMaxWidth: true
        }),
        UI.TextField({
          value: newRelation.type,
          onValueChange: (v) => setNewRelation(__spreadProps(__spreadValues({}, newRelation), { type: v })),
          label: "\u5173\u7CFB\u7C7B\u578B",
          fillMaxWidth: true
        }),
        UI.Row({
          spacing: 8,
          horizontalArrangement: "end"
        }, [
          UI.Button({
            onClick: () => setShowAddRelation(false),
            variant: "outlined"
          }, "\u53D6\u6D88"),
          UI.Button({
            onClick: addRelation,
            enabled: newRelation.from.trim().length > 0 && newRelation.to.trim().length > 0
          }, "\u6DFB\u52A0")
        ])
      ]))
    ]);
  }
  const helpTip = UI.Card({
    modifier: UI.Modifier.padding(8).fillMaxWidth(),
    background: colors.surfaceVariant
  }, UI.Row({
    padding: 12,
    spacing: 8,
    verticalAlignment: "center"
  }, [
    UI.Icon({ name: "info", size: 16, tint: colors.primary }),
    UI.Text({
      text: "\u53CC\u51FB\u8282\u70B9\u53EF\u7F16\u8F91\u89D2\u8272\u4FE1\u606F | \u62D6\u62FD\u79FB\u52A8\u8282\u70B9 | \u6EDA\u8F6E\u7F29\u653E | \u53F3\u952E\u5E73\u79FB",
      style: "bodySmall",
      color: colors.onSurfaceVariant
    })
  ]));
  const webView = UI.WebView({
    key: "relationship_webview",
    fillMaxSize: true,
    url: `file:///android_asset/packages/novelide/resources/webapp/\u89D2\u8272\u5173\u7CFB\u56FE.html?workId=${workId}`,
    javaScriptEnabled: true,
    domStorageEnabled: true,
    allowFileAccess: true,
    allowContentAccess: true,
    supportZoom: true,
    useWideViewPort: true,
    loadWithOverviewMode: true
  });
  return UI.Column({ fillMaxSize: true }, [
    toolbar,
    filterBar,
    helpTip,
    UI.Box({ fillMaxSize: true, weight: 1 }, webView),
    renderAddRelationDialog()
  ]);
}

// src/ui/novel_relationship.ui.ts
function Screen9(ctx) {
  var _a, _b;
  const { UI } = ctx;
  const params = (_a = ctx.routeParams) != null ? _a : {};
  const workId = (_b = params.workId) != null ? _b : "";
  return RelationshipPage(ctx);
}

// src/ui/novel_tomato_page.ts
function TomatoPage(ctx) {
  const { UI } = ctx;
  const colors = ctx.MaterialTheme.colorScheme;
  const WORK_MINUTES = 25;
  const REST_MINUTES = 5;
  const [presets, setPresets] = ctx.useState("presets", []);
  const [selectedPreset, setSelectedPreset] = ctx.useState("selectedPreset", 0);
  const [totalSeconds, setTotalSeconds] = ctx.useState("totalSeconds", WORK_MINUTES * 60);
  const [remainingSeconds, setRemainingSeconds] = ctx.useState("remainingSeconds", WORK_MINUTES * 60);
  const [isRunning, setIsRunning] = ctx.useState("isRunning", false);
  const [isWorkPhase, setIsWorkPhase] = ctx.useState("isWorkPhase", true);
  const [tomatoCount, setTomatoCount] = ctx.useState("tomatoCount", 0);
  const [todayCount, setTodayCount] = ctx.useState("todayCount", 0);
  const [timerRef, setTimerRef] = ctx.useState("timerRef", null);
  const [pulseAnimation, setPulseAnimation] = ctx.useState("pulseAnimation", false);
  const [showCompleteDialog, setShowCompleteDialog] = ctx.useState("showCompleteDialog", false);
  const [lastCompletedPreset, setLastCompletedPreset] = ctx.useState("lastCompletedPreset", "");
  const [soundEnabled, setSoundEnabled] = ctx.useState("soundEnabled", true);
  const [totalFocusMinutes, setTotalFocusMinutes] = ctx.useState("totalFocusMinutes", 0);
  async function loadPresets() {
    try {
      const result = await Tools.callNative("getTomatoPresets", []);
      const list = typeof result === "string" ? JSON.parse(result) : result;
      setPresets(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("\u52A0\u8F7D\u756A\u8304\u9884\u8BBE\u5931\u8D25:", error);
    }
  }
  function playNotificationSound(type) {
    if (!soundEnabled) return;
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      switch (type) {
        case "work":
          oscillator.frequency.value = 800;
          oscillator.type = "sine";
          break;
        case "rest":
          oscillator.frequency.value = 400;
          oscillator.type = "sine";
          break;
        case "warning":
          oscillator.frequency.value = 600;
          oscillator.type = "square";
          break;
      }
      gainNode.gain.value = 0.3;
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
      }, type === "warning" ? 200 : 500);
    } catch (e) {
      console.log("\u97F3\u9891\u64AD\u653E\u5931\u8D25:", e);
    }
  }
  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  function getProgress() {
    if (totalSeconds === 0) return 0;
    return (totalSeconds - remainingSeconds) / totalSeconds;
  }
  function selectPreset(index) {
    if (isRunning) return;
    setSelectedPreset(index);
    const preset = presets[index];
    if (preset) {
      const minutes = preset.minutes || WORK_MINUTES;
      setTotalSeconds(minutes * 60);
      setRemainingSeconds(minutes * 60);
      setIsWorkPhase(true);
    }
  }
  function toggleTimer() {
    if (isRunning) {
      if (timerRef) {
        clearInterval(timerRef);
        setTimerRef(null);
      }
      setIsRunning(false);
      setPulseAnimation(false);
    } else {
      if (remainingSeconds <= 0) return;
      const ref = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(ref);
            setIsRunning(false);
            setTimerRef(null);
            setPulseAnimation(false);
            onTimerComplete();
            return 0;
          }
          if (prev <= 11 && prev > 1) {
            playNotificationSound("warning");
            setPulseAnimation(true);
          }
          return prev - 1;
        });
      }, 1e3);
      setTimerRef(ref);
      setIsRunning(true);
    }
  }
  function onTimerComplete() {
    if (isWorkPhase) {
      const preset = presets[selectedPreset];
      const presetName = (preset == null ? void 0 : preset.name) || `${WORK_MINUTES}\u5206\u949F`;
      const duration = (preset == null ? void 0 : preset.minutes) || WORK_MINUTES;
      const newCount = tomatoCount + 1;
      setTomatoCount(newCount);
      setTodayCount(todayCount + 1);
      setTotalFocusMinutes((prev) => prev + duration);
      setLastCompletedPreset(presetName);
      playNotificationSound("work");
      try {
        Tools.callNative("recordTomatoComplete", ["", presetName, duration]);
      } catch (e) {
        console.log("\u8BB0\u5F55\u756A\u8304\u5931\u8D25:", e);
      }
      setShowCompleteDialog(true);
      setIsWorkPhase(false);
      setTotalSeconds(REST_MINUTES * 60);
      setRemainingSeconds(REST_MINUTES * 60);
    } else {
      playNotificationSound("rest");
      setIsWorkPhase(true);
      const preset = presets[selectedPreset];
      const minutes = (preset == null ? void 0 : preset.minutes) || WORK_MINUTES;
      setTotalSeconds(minutes * 60);
      setRemainingSeconds(minutes * 60);
    }
  }
  function resetTimer() {
    if (timerRef) {
      clearInterval(timerRef);
      setTimerRef(null);
    }
    setIsRunning(false);
    setIsWorkPhase(true);
    setPulseAnimation(false);
    const preset = presets[selectedPreset];
    const minutes = (preset == null ? void 0 : preset.minutes) || WORK_MINUTES;
    setTotalSeconds(minutes * 60);
    setRemainingSeconds(minutes * 60);
  }
  function skipPhase() {
    if (timerRef) {
      clearInterval(timerRef);
      setTimerRef(null);
    }
    setIsRunning(false);
    setPulseAnimation(false);
    if (isWorkPhase) {
      setIsWorkPhase(false);
      setTotalSeconds(REST_MINUTES * 60);
      setRemainingSeconds(REST_MINUTES * 60);
    } else {
      setIsWorkPhase(true);
      const preset = presets[selectedPreset];
      const minutes = (preset == null ? void 0 : preset.minutes) || WORK_MINUTES;
      setTotalSeconds(minutes * 60);
      setRemainingSeconds(minutes * 60);
    }
  }
  ctx.useEffect(() => {
    loadPresets();
    return () => {
      if (timerRef) clearInterval(timerRef);
    };
  }, []);
  const progressColor = isWorkPhase ? colors.primary : colors.tertiary;
  const phaseLabel = isWorkPhase ? "\u4E13\u6CE8\u5199\u4F5C" : "\u4F11\u606F\u4E00\u4E0B";
  const phaseIcon = isWorkPhase ? "edit_note" : "self_improvement";
  const topBar = UI.TopAppBar({
    title: "\u756A\u8304\u949F",
    actions: [
      UI.IconButton({
        icon: soundEnabled ? "volume_up" : "volume_off",
        onClick: () => setSoundEnabled(!soundEnabled),
        tooltip: soundEnabled ? "\u5173\u95ED\u58F0\u97F3" : "\u5F00\u542F\u58F0\u97F3"
      }),
      UI.IconButton({
        icon: "refresh",
        onClick: resetTimer,
        tooltip: "\u91CD\u7F6E"
      })
    ]
  });
  function renderCompleteDialog() {
    if (!showCompleteDialog) return null;
    return UI.Box({
      fillMaxSize: true,
      background: "rgba(0,0,0,0.6)",
      contentAlignment: "center"
    }, [
      UI.Card({
        modifier: UI.Modifier.padding(32).fillMaxWidth()
      }, UI.Column({
        padding: 24,
        spacing: 16,
        contentAlignment: "center"
      }, [
        UI.Icon({ name: "celebration", size: 48, tint: colors.tertiary }),
        UI.Text({ text: "\u756A\u8304\u5B8C\u6210!", style: "headlineSmall", color: colors.tertiary }),
        UI.Text({ text: `\u5B8C\u6210\u4E86\u4E00\u4E2A ${lastCompletedPreset} \u7684\u4E13\u6CE8`, style: "bodyMedium", color: colors.onSurfaceVariant }),
        UI.Text({ text: `\u4ECA\u65E5\u5DF2\u5B8C\u6210 ${todayCount} \u4E2A\u756A\u8304`, style: "bodySmall", color: colors.outline }),
        UI.Button({
          onClick: () => setShowCompleteDialog(false),
          modifier: UI.Modifier.fillMaxWidth()
        }, "\u7EE7\u7EED\u52AA\u529B")
      ]))
    ]);
  }
  const timerArea = UI.Box({
    fillMaxWidth: true,
    padding: 32,
    contentAlignment: "center"
  }, [
    UI.Column({
      horizontalAlignment: "center",
      spacing: 16
    }, [
      // 阶段标签（带动画）
      UI.Row({
        spacing: 8,
        verticalAlignment: "center"
      }, [
        UI.Icon({ name: phaseIcon, size: 20, tint: progressColor }),
        UI.Text({
          text: phaseLabel,
          style: "titleMedium",
          color: progressColor
        })
      ]),
      // 倒计时圆环（增强动画效果）
      UI.Box({
        width: 240,
        height: 240,
        contentAlignment: "center",
        modifier: UI.Modifier.background(
          pulseAnimation ? `${progressColor}15` : "transparent",
          120
        ).animateContentSize()
      }, [
        // 外圈光晕效果
        UI.Box({
          width: 220,
          height: 220,
          contentAlignment: "center",
          modifier: UI.Modifier.background(
            isRunning ? `${progressColor}08` : "transparent",
            110
          )
        }, [
          UI.CircularProgressIndicator({
            progress: getProgress(),
            size: 200,
            color: progressColor,
            trackColor: colors.surfaceVariant,
            strokeWidth: 12
          }),
          UI.Column({
            horizontalAlignment: "center",
            spacing: 4
          }, [
            UI.Text({
              text: formatTime(remainingSeconds),
              style: "displayLarge",
              color: colors.onSurface,
              modifier: UI.Modifier.animateContentSize()
            }),
            UI.Text({
              text: `\u603B\u8BA1 ${formatTime(totalSeconds)}`,
              style: "bodySmall",
              color: colors.onSurfaceVariant
            })
          ])
        ])
      ]),
      // 倒计时警告（最后10秒，带脉冲动画）
      isRunning && remainingSeconds <= 10 && remainingSeconds > 0 ? UI.Row({
        spacing: 8,
        verticalAlignment: "center",
        modifier: UI.Modifier.animatePulse()
      }, [
        UI.Icon({ name: "warning", size: 16, tint: colors.error }),
        UI.Text({
          text: `${remainingSeconds} \u79D2\u540E\u5B8C\u6210`,
          style: "labelLarge",
          color: colors.error
        })
      ]) : null,
      // 控制按钮组
      UI.Row({
        spacing: 12,
        horizontalArrangement: "center"
      }, [
        UI.Button({
          onClick: resetTimer,
          variant: "outlined",
          modifier: UI.Modifier.weight(1)
        }, "\u91CD\u7F6E"),
        UI.Button({
          onClick: toggleTimer,
          enabled: remainingSeconds > 0,
          modifier: UI.Modifier.weight(2).animateScale(isRunning ? 1.02 : 1)
        }, isRunning ? "\u6682\u505C" : "\u5F00\u59CB"),
        UI.Button({
          onClick: skipPhase,
          variant: "outlined",
          modifier: UI.Modifier.weight(1)
        }, "\u8DF3\u8FC7")
      ])
    ].filter(Boolean))
  ]);
  const statsArea = UI.Card({
    modifier: UI.Modifier.padding(16).fillMaxWidth(),
    background: colors.surfaceVariant
  }, UI.Column({ padding: 16, spacing: 12 }, [
    UI.Text({ text: "\u4ECA\u65E5\u7EDF\u8BA1", style: "titleSmall", color: colors.onSurface }),
    UI.Row({
      fillMaxWidth: true,
      horizontalArrangement: "space-around"
    }, [
      UI.Column({ horizontalAlignment: "center" }, [
        UI.Text({
          text: `${todayCount}`,
          style: "headlineMedium",
          color: colors.primary
        }),
        UI.Text({
          text: "\u4ECA\u65E5\u756A\u8304",
          style: "bodySmall",
          color: colors.onSurfaceVariant
        })
      ]),
      UI.Column({ horizontalAlignment: "center" }, [
        UI.Text({
          text: `${tomatoCount}`,
          style: "headlineMedium",
          color: colors.tertiary
        }),
        UI.Text({
          text: "\u672C\u6B21\u756A\u8304",
          style: "bodySmall",
          color: colors.onSurfaceVariant
        })
      ]),
      UI.Column({ horizontalAlignment: "center" }, [
        UI.Text({
          text: `${Math.floor(totalFocusMinutes / 60)}h${totalFocusMinutes % 60}m`,
          style: "headlineMedium",
          color: colors.secondary
        }),
        UI.Text({
          text: "\u7D2F\u8BA1\u4E13\u6CE8",
          style: "bodySmall",
          color: colors.onSurfaceVariant
        })
      ])
    ])
  ]));
  const presetsArea = UI.Column({
    fillMaxWidth: true,
    paddingHorizontal: 16,
    spacing: 8
  }, [
    UI.Text({
      text: "\u756A\u8304\u9884\u8BBE",
      style: "titleSmall",
      color: colors.onSurface,
      modifier: UI.Modifier.paddingBottom(4)
    }),
    UI.LazyRow({
      horizontalArrangement: 8
    }, presets.map(
      (preset, index) => UI.Card({
        modifier: UI.Modifier.clickable(() => selectPreset(index)).padding(4),
        background: index === selectedPreset ? colors.primaryContainer : colors.surface
      }, UI.Column({
        padding: 12,
        horizontalAlignment: "center",
        spacing: 4
      }, [
        UI.Text({
          text: preset.name || `${preset.minutes || 25}\u5206\u949F`,
          style: "labelLarge",
          color: index === selectedPreset ? colors.onPrimaryContainer : colors.onSurface,
          maxLines: 1
        }),
        UI.Text({
          text: `${preset.minutes || 25} min`,
          style: "bodySmall",
          color: index === selectedPreset ? colors.onPrimaryContainer : colors.onSurfaceVariant
        })
      ]))
    ))
  ]);
  return UI.Box({ fillMaxSize: true }, [
    topBar,
    UI.LazyColumn({
      fillMaxSize: true,
      contentPadding: 16,
      verticalArrangement: 16
    }, [
      timerArea,
      statsArea,
      presetsArea
    ]),
    renderCompleteDialog()
  ]);
}

// src/ui/novel_tomato.ui.ts
function Screen10(ctx) {
  var _a, _b;
  const { UI } = ctx;
  const params = (_a = ctx.routeParams) != null ? _a : {};
  const workId = (_b = params.workId) != null ? _b : "";
  return TomatoPage(ctx);
}

// src/ui/novel_agents_page.ts
function AgentsPage(ctx) {
  var _a;
  const { UI } = ctx;
  const colors = ctx.MaterialTheme.colorScheme;
  const [agents, setAgents] = ctx.useState("agents", []);
  const [sessions, setSessions] = ctx.useState("sessions", []);
  const [selectedAgent, setSelectedAgent] = ctx.useState("selectedAgent", null);
  const [taskInput, setTaskInput] = ctx.useState("taskInput", "");
  const [isProcessing, setIsProcessing] = ctx.useState("isProcessing", false);
  const [lastResult, setLastResult] = ctx.useState("lastResult", null);
  const AGENT_LIST = [
    { id: "continue_writing", name: "\u7EED\u5199\u52A9\u624B", description: "\u6839\u636E\u524D\u6587\u5185\u5BB9\u81EA\u52A8\u7EED\u5199\u540E\u7EED\u60C5\u8282", icon: "\u270D\uFE0F" },
    { id: "polish", name: "\u6587\u672C\u7CBE\u4FEE\u5668", description: "8\u7EF4\u5EA6\u7CBE\u4FEE\u6587\u672C", icon: "\u2728" },
    { id: "expand", name: "\u6269\u5199\u52A9\u624B", description: "\u5C06\u7B80\u77ED\u5185\u5BB9\u6269\u5C55\u4E3A\u66F4\u8BE6\u7EC6\u7684\u63CF\u5199", icon: "\u{1F4DD}" },
    { id: "deai", name: "\u53BBAI\u5473\u5904\u7406\u5668", description: "\u6D88\u9664AI\u673A\u68B0\u611F", icon: "\u{1F916}" },
    { id: "outline", name: "\u5927\u7EB2\u751F\u6210\u5668", description: "\u751F\u6210\u7ED3\u6784\u6E05\u6670\u7684\u5927\u7EB2", icon: "\u{1F4CB}" },
    { id: "character", name: "\u89D2\u8272\u8BBE\u8BA1\u5E08", description: "\u751F\u6210\u8BE6\u7EC6\u7684\u89D2\u8272\u8BBE\u5B9A\u5361", icon: "\u{1F464}" },
    { id: "pleasure", name: "\u723D\u70B9\u68C0\u67E5\u5668", description: "\u5206\u6790\u723D\u70B9\u5BC6\u5EA6\u548C\u8282\u594F", icon: "\u{1F3AF}" }
  ];
  async function sendTask() {
    if (!selectedAgent || !taskInput.trim()) return;
    setIsProcessing(true);
    setLastResult(null);
    try {
      const result = await Tools.callNative("dispatchAgentTask", [
        selectedAgent,
        taskInput,
        {}
      ]);
      const parsed = typeof result === "string" ? JSON.parse(result) : result;
      setLastResult(parsed);
      loadSessions();
    } catch (error) {
      setLastResult({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setIsProcessing(false);
    }
  }
  async function loadSessions() {
    try {
      const result = await Tools.callNative("getAgentSessions", []);
      const list = typeof result === "string" ? JSON.parse(result) : result;
      setSessions(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("\u52A0\u8F7D\u4F1A\u8BDD\u5931\u8D25:", error);
    }
  }
  ctx.useEffect(() => {
    setAgents(AGENT_LIST);
    loadSessions();
  }, []);
  const topBar = UI.TopAppBar({
    title: "AI Agent \u7BA1\u7406",
    actions: [
      UI.IconButton({
        icon: "refresh",
        onClick: loadSessions
      })
    ]
  });
  const agentCards = UI.Column({
    fillMaxWidth: true,
    spacing: 8,
    paddingHorizontal: 16
  }, [
    UI.Text({
      text: "\u53EF\u7528 Agent\uFF087\u4E2A\uFF09",
      style: "titleMedium",
      color: colors.onSurface,
      modifier: UI.Modifier.paddingVertical(8)
    }),
    ...AGENT_LIST.map(
      (agent) => UI.Card({
        modifier: UI.Modifier.fillMaxWidth().clickable(() => setSelectedAgent(agent.id)).padding(4),
        background: selectedAgent === agent.id ? colors.primaryContainer : colors.surface
      }, UI.Row({
        fillMaxWidth: true,
        padding: 16,
        spacing: 16,
        verticalAlignment: "center"
      }, [
        UI.Text({
          text: agent.icon,
          style: "headlineMedium"
        }),
        UI.Column({
          weight: 1
        }, [
          UI.Text({
            text: agent.name,
            style: "titleSmall",
            color: selectedAgent === agent.id ? colors.onPrimaryContainer : colors.onSurface
          }),
          UI.Text({
            text: agent.description,
            style: "bodySmall",
            color: selectedAgent === agent.id ? colors.onPrimaryContainer : colors.onSurfaceVariant,
            maxLines: 2
          })
        ]),
        selectedAgent === agent.id ? UI.Icon({
          icon: "check_circle",
          tint: colors.primary
        }) : null
      ].filter(Boolean)))
    )
  ]);
  const taskArea = UI.Card({
    modifier: UI.Modifier.padding(16).fillMaxWidth(),
    background: colors.surfaceVariant
  }, UI.Column({
    fillMaxWidth: true,
    padding: 16,
    spacing: 12
  }, [
    UI.Text({
      text: selectedAgent ? `\u4EFB\u52A1\u7ED9: ${((_a = AGENT_LIST.find((a) => a.id === selectedAgent)) == null ? void 0 : _a.name) || selectedAgent}` : "\u8BF7\u5148\u9009\u62E9\u4E00\u4E2A Agent",
      style: "titleSmall",
      color: colors.onSurfaceVariant
    }),
    UI.TextField({
      value: taskInput,
      onValueChange: setTaskInput,
      label: "\u8F93\u5165\u4EFB\u52A1\u63CF\u8FF0",
      placeholder: "\u4F8B\u5982\uFF1A\u5E2E\u6211\u7EED\u5199\u8FD9\u6BB5\u6587\u5B57...",
      fillMaxWidth: true,
      minLines: 3,
      maxLines: 5,
      enabled: !!selectedAgent
    }),
    UI.Button({
      onClick: sendTask,
      enabled: !!selectedAgent && taskInput.trim().length > 0 && !isProcessing,
      fillMaxWidth: true
    }, isProcessing ? "\u5904\u7406\u4E2D..." : "\u53D1\u9001\u4EFB\u52A1")
  ]));
  const resultArea = lastResult ? UI.Card({
    modifier: UI.Modifier.padding(16).fillMaxWidth(),
    background: lastResult.success ? colors.tertiaryContainer : colors.errorContainer
  }, UI.Column({
    fillMaxWidth: true,
    padding: 16,
    spacing: 8
  }, [
    UI.Text({
      text: lastResult.success ? "\u6267\u884C\u7ED3\u679C" : "\u6267\u884C\u5931\u8D25",
      style: "titleSmall",
      color: lastResult.success ? colors.onTertiaryContainer : colors.onErrorContainer
    }),
    UI.Text({
      text: lastResult.success ? lastResult.result || "\u65E0\u7ED3\u679C" : lastResult.error || "\u672A\u77E5\u9519\u8BEF",
      style: "bodyMedium",
      color: lastResult.success ? colors.onTertiaryContainer : colors.onErrorContainer
    }),
    lastResult.duration ? UI.Text({
      text: `\u8017\u65F6: ${lastResult.duration}ms`,
      style: "bodySmall",
      color: colors.onSurfaceVariant
    }) : null
  ].filter(Boolean))) : null;
  const sessionsArea = sessions.length > 0 ? UI.Column({
    fillMaxWidth: true,
    paddingHorizontal: 16,
    spacing: 8
  }, [
    UI.Text({
      text: `\u6D3B\u8DC3\u4F1A\u8BDD (${sessions.length})`,
      style: "titleSmall",
      color: colors.onSurface,
      modifier: UI.Modifier.paddingVertical(8)
    }),
    ...sessions.slice(0, 5).map(
      (session) => UI.Card({
        modifier: UI.Modifier.fillMaxWidth().padding(4),
        background: colors.surface
      }, UI.Row({
        fillMaxWidth: true,
        padding: 12,
        spacing: 12,
        verticalAlignment: "center"
      }, [
        UI.Box({
          width: 8,
          height: 8,
          background: session.status === "busy" ? colors.error : session.status === "error" ? colors.error : colors.primary,
          cornerRadius: 4
        }),
        UI.Column({
          weight: 1
        }, [
          UI.Text({
            text: `Agent: ${session.agentId}`,
            style: "bodyMedium"
          }),
          UI.Text({
            text: `\u72B6\u6001: ${session.status}`,
            style: "bodySmall",
            color: colors.onSurfaceVariant
          })
        ])
      ]))
    )
  ]) : null;
  return UI.Box({ fillMaxSize: true }, [
    topBar,
    UI.LazyColumn({
      fillMaxSize: true,
      contentPadding: 16,
      verticalArrangement: 12
    }, [
      agentCards,
      taskArea,
      resultArea,
      sessionsArea
    ].filter(Boolean))
  ]);
}

// src/ui/novel_agents.ui.ts
function Screen11(ctx) {
  var _a;
  const { UI } = ctx;
  const params = (_a = ctx.routeParams) != null ? _a : {};
  return AgentsPage(ctx);
}

// src/ui/novel_skills_page.ts
function SkillsPage(ctx) {
  var _a, _b;
  const { UI } = ctx;
  const colors = ctx.MaterialTheme.colorScheme;
  const [skills, setSkills] = ctx.useState("skills", []);
  const [categories, setCategories] = ctx.useState("categories", []);
  const [selectedCategory, setSelectedCategory] = ctx.useState("selectedCategory", "all");
  const [selectedSkill, setSelectedSkill] = ctx.useState("selectedSkill", null);
  const [searchQuery, setSearchQuery] = ctx.useState("searchQuery", "");
  const [activeSkill, setActiveSkill] = ctx.useState("activeSkill", null);
  async function loadSkills() {
    try {
      const result = await Tools.callNative("getAllSkills", []);
      const list = typeof result === "string" ? JSON.parse(result) : result;
      setSkills(Array.isArray(list) ? list : []);
      const cats = [...new Set(list.map((s) => s.category))];
      setCategories(cats);
    } catch (error) {
      console.error("\u52A0\u8F7D Skill \u5931\u8D25:", error);
    }
  }
  async function syncFromBackend() {
    try {
      await Tools.callNative("syncSkillsFromBackend", []);
      await loadSkills();
    } catch (error) {
      console.error("\u540C\u6B65 Skill \u5931\u8D25:", error);
    }
  }
  async function applySkill(skillId) {
    try {
      const result = await Tools.callNative("applySkill", [skillId, {}]);
      const parsed = typeof result === "string" ? JSON.parse(result) : result;
      setActiveSkill(parsed.skill);
    } catch (error) {
      console.error("\u5E94\u7528 Skill \u5931\u8D25:", error);
    }
  }
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
      console.error("\u641C\u7D22 Skill \u5931\u8D25:", error);
    }
  }
  ctx.useEffect(() => {
    loadSkills();
  }, []);
  ctx.useEffect(() => {
    const timer = setTimeout(() => {
      searchSkills();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);
  const filteredSkills = selectedCategory === "all" ? skills : skills.filter((s) => s.category === selectedCategory);
  const topBar = UI.TopAppBar({
    title: "\u756A\u8304\u98CE\u683C Skill",
    actions: [
      UI.IconButton({
        icon: "sync",
        onClick: syncFromBackend
      }),
      UI.IconButton({
        icon: "refresh",
        onClick: loadSkills
      })
    ]
  });
  const searchBar = UI.TextField({
    value: searchQuery,
    onValueChange: setSearchQuery,
    label: "\u641C\u7D22 Skill",
    placeholder: "\u8F93\u5165\u540D\u79F0\u3001\u63CF\u8FF0\u6216\u6807\u7B7E\u641C\u7D22...",
    fillMaxWidth: true,
    leadingIcon: "search",
    modifier: UI.Modifier.paddingHorizontal(16)
  });
  const categorySelector = UI.LazyRow({
    horizontalArrangement: 8,
    paddingHorizontal: 16
  }, [
    UI.Chip({
      label: "\u5168\u90E8",
      selected: selectedCategory === "all",
      onClick: () => setSelectedCategory("all")
    }),
    ...categories.map(
      (cat) => UI.Chip({
        label: cat,
        selected: selectedCategory === cat,
        onClick: () => setSelectedCategory(cat)
      })
    )
  ]);
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
      text: activeSkill.icon || "\u{1F4DD}",
      style: "headlineMedium"
    }),
    UI.Column({
      weight: 1
    }, [
      UI.Text({
        text: `\u5F53\u524D\u6FC0\u6D3B: ${activeSkill.name}`,
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
    }, "\u6E05\u9664")
  ])) : null;
  const skillCards = UI.Column({
    fillMaxWidth: true,
    spacing: 8,
    paddingHorizontal: 16
  }, [
    UI.Text({
      text: `${filteredSkills.length} \u4E2A Skill`,
      style: "bodySmall",
      color: colors.onSurfaceVariant,
      modifier: UI.Modifier.paddingBottom(4)
    }),
    ...filteredSkills.map(
      (skill) => {
        var _a2;
        return UI.Card({
          modifier: UI.Modifier.fillMaxWidth().clickable(() => {
            setSelectedSkill(skill);
            applySkill(skill.id);
          }).padding(4),
          background: (selectedSkill == null ? void 0 : selectedSkill.id) === skill.id ? colors.secondaryContainer : colors.surface
        }, UI.Row({
          fillMaxWidth: true,
          padding: 16,
          spacing: 16,
          verticalAlignment: "center"
        }, [
          UI.Text({
            text: skill.icon || "\u{1F4DD}",
            style: "headlineMedium"
          }),
          UI.Column({
            weight: 1
          }, [
            UI.Text({
              text: skill.name,
              style: "titleSmall",
              color: (selectedSkill == null ? void 0 : selectedSkill.id) === skill.id ? colors.onSecondaryContainer : colors.onSurface
            }),
            UI.Text({
              text: skill.description,
              style: "bodySmall",
              color: (selectedSkill == null ? void 0 : selectedSkill.id) === skill.id ? colors.onSecondaryContainer : colors.onSurfaceVariant,
              maxLines: 2
            }),
            UI.Row({
              spacing: 4,
              modifier: UI.Modifier.paddingTop(4)
            }, ((_a2 = skill.tags) == null ? void 0 : _a2.slice(0, 3).map(
              (tag) => UI.Chip({
                label: tag,
                compact: true,
                variant: "outlined"
              })
            )) || [])
          ]),
          UI.Column({
            horizontalAlignment: "end",
            spacing: 4
          }, [
            UI.Text({
              text: `${skill.workMinutes || 25}\u5206\u949F`,
              style: "bodySmall",
              color: colors.onSurfaceVariant
            }),
            UI.Text({
              text: skill.category,
              style: "labelSmall",
              color: colors.primary
            })
          ])
        ]));
      }
    )
  ]);
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
        text: selectedSkill.icon || "\u{1F4DD}",
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
      text: "\u7CFB\u7EDF\u63D0\u793A\u8BCD\u9884\u89C8:",
      style: "labelMedium",
      color: colors.onSurfaceVariant
    }),
    UI.Text({
      text: ((_a = selectedSkill.systemPrompt) == null ? void 0 : _a.substring(0, 200)) + (((_b = selectedSkill.systemPrompt) == null ? void 0 : _b.length) > 200 ? "..." : ""),
      style: "bodySmall",
      color: colors.onSurfaceVariant
    }),
    UI.Row({
      spacing: 8
    }, [
      UI.Button({
        onClick: () => applySkill(selectedSkill.id),
        modifier: UI.Modifier.weight(1)
      }, "\u5E94\u7528\u6B64 Skill"),
      UI.Button({
        onClick: () => setSelectedSkill(null),
        variant: "outlined",
        modifier: UI.Modifier.weight(1)
      }, "\u5173\u95ED\u8BE6\u60C5")
    ])
  ])) : null;
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

// src/ui/novel_skills.ui.ts
function Screen12(ctx) {
  var _a;
  const { UI } = ctx;
  const params = (_a = ctx.routeParams) != null ? _a : {};
  return SkillsPage(ctx);
}

// src/packages/novel_utils.ts
var LOG_PREFIX = "[NovelIDE]";
var Logger = {
  info(message, ...args) {
    console.log(`${LOG_PREFIX} [INFO] ${message}`, ...args);
  },
  warn(message, ...args) {
    console.warn(`${LOG_PREFIX} [WARN] ${message}`, ...args);
  },
  error(message, error) {
    console.error(`${LOG_PREFIX} [ERROR] ${message}`, error != null ? error : "");
  }
};
var JsonCache = class {
  constructor(maxSize = 100, ttlMs = 3e4) {
    this.cache = /* @__PURE__ */ new Map();
    this.maxSize = maxSize;
    this.ttlMs = ttlMs;
  }
  /** 获取缓存的解析结果 */
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return void 0;
    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.cache.delete(key);
      return void 0;
    }
    entry.hits++;
    return entry.value;
  }
  /** 设置缓存 */
  set(key, value) {
    if (this.cache.size >= this.maxSize) {
      this.evictLeastUsed();
    }
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      hits: 1
    });
  }
  /** 清除过期缓存 */
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttlMs) {
        this.cache.delete(key);
      }
    }
  }
  /** 清除所有缓存 */
  clear() {
    this.cache.clear();
  }
  /** 获取缓存大小 */
  get size() {
    return this.cache.size;
  }
  /** 驱逐最少使用的条目 */
  evictLeastUsed() {
    let minHits = Infinity;
    let minKey = "";
    for (const [key, entry] of this.cache.entries()) {
      if (entry.hits < minHits) {
        minHits = entry.hits;
        minKey = key;
      }
    }
    if (minKey) {
      this.cache.delete(minKey);
    }
  }
};
var jsonCache = new JsonCache(100, 3e4);
function cacheKey(methodName, args) {
  return `${methodName}:${JSON.stringify(args)}`;
}
function safeJsonParse(text, useCache = false, key) {
  if (useCache && key) {
    const cached = jsonCache.get(key);
    if (cached !== void 0) {
      return cached;
    }
  }
  try {
    const parsed = JSON.parse(text);
    if (useCache && key) {
      jsonCache.set(key, parsed);
    }
    return parsed;
  } catch (e) {
    Logger.error("JSON \u89E3\u6790\u5931\u8D25", e);
    return null;
  }
}
async function safeNativeCall(methodName, args, parser) {
  try {
    const result = await Tools.callNative(methodName, args);
    if (parser) {
      return parser(result);
    }
    return result;
  } catch (error) {
    Logger.error(`NativeBridge.${methodName} \u8C03\u7528\u5931\u8D25`, error);
    throw error;
  }
}
async function safeNativeJsonCall(methodName, args, useCache = false) {
  const key = useCache ? cacheKey(methodName, args) : void 0;
  return safeNativeCall(methodName, args, (raw) => {
    const parsed = safeJsonParse(raw, useCache, key);
    if (parsed === null) {
      Logger.warn(`${methodName} \u8FD4\u56DE\u4E86\u65E0\u6548 JSON\uFF0C\u8FD4\u56DE\u7A7A\u5BF9\u8C61`);
      return Array.isArray(raw) ? [] : {};
    }
    return parsed;
  });
}
async function safeNativeBoolCall(methodName, args) {
  try {
    const result = await Tools.callNative(methodName, args);
    if (typeof result === "string") {
      const parsed = safeJsonParse(result);
      if (parsed && typeof parsed.success === "boolean") {
        return parsed.success;
      }
      return !!result;
    }
    return !!result;
  } catch (error) {
    Logger.error(`NativeBridge.${methodName} \u8C03\u7528\u5931\u8D25`, error);
    throw error;
  }
}
function requireString(value, name) {
  if (value === void 0 || value === null || typeof value === "string" && !value.trim()) {
    throw new Error(`\u53C2\u6570 "${name}" \u4E0D\u80FD\u4E3A\u7A7A`);
  }
  return String(value).trim();
}
function clearJsonCache() {
  jsonCache.clear();
  Logger.info("JSON \u7F13\u5B58\u5DF2\u6E05\u9664");
}

// src/packages/novel_works.ts
function registerTools() {
  Tools.register("novelide:create_work", {
    description: "\u521B\u5EFA\u65B0\u7684\u5C0F\u8BF4\u4F5C\u54C1",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "\u4F5C\u54C1\u6807\u9898" },
        genre: { type: "string", description: "\u4F5C\u54C1\u7C7B\u578B\uFF08\u5982\uFF1A\u90FD\u5E02\u3001\u7384\u5E7B\u3001\u60AC\u7591\uFF09" },
        description: { type: "string", description: "\u4F5C\u54C1\u7B80\u4ECB" }
      },
      required: ["title"]
    },
    execute: async (params) => {
      const title = requireString(params.title, "title");
      const { genre = "", description = "" } = params;
      try {
        const result = await safeNativeCall("createWork", [title, genre, description]);
        clearJsonCache();
        Logger.info(`\u521B\u5EFA\u4F5C\u54C1\u6210\u529F: ${result}`);
        return { success: true, workId: result };
      } catch (error) {
        Logger.error("\u521B\u5EFA\u4F5C\u54C1\u5931\u8D25", error);
        return { success: false, error: error.message || "\u521B\u5EFA\u4F5C\u54C1\u5931\u8D25" };
      }
    }
  });
  Tools.register("novelide:list_works", {
    description: "\u83B7\u53D6\u6240\u6709\u5C0F\u8BF4\u4F5C\u54C1\u5217\u8868",
    parameters: { type: "object", properties: {} },
    execute: async () => {
      try {
        const works = await safeNativeJsonCall("getNovelWorks", [], true);
        return { success: true, works };
      } catch (error) {
        Logger.error("\u83B7\u53D6\u4F5C\u54C1\u5217\u8868\u5931\u8D25", error);
        return { success: false, error: error.message || "\u83B7\u53D6\u4F5C\u54C1\u5217\u8868\u5931\u8D25", works: [] };
      }
    }
  });
  Tools.register("novelide:get_work", {
    description: "\u83B7\u53D6\u6307\u5B9A\u4F5C\u54C1\u7684\u8BE6\u7EC6\u4FE1\u606F",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "\u4F5C\u54C1ID" }
      },
      required: ["workId"]
    },
    execute: async (params) => {
      const workId = requireString(params.workId, "workId");
      try {
        const works = await safeNativeJsonCall("getNovelWorks", []);
        const work = works.find((w) => w.id === workId);
        if (!work) {
          Logger.warn(`\u4F5C\u54C1\u4E0D\u5B58\u5728: ${workId}`);
          return { success: false, error: "\u4F5C\u54C1\u4E0D\u5B58\u5728" };
        }
        Logger.info(`\u83B7\u53D6\u4F5C\u54C1\u8BE6\u60C5\u6210\u529F: ${workId}`);
        return { success: true, work };
      } catch (error) {
        Logger.error("\u83B7\u53D6\u4F5C\u54C1\u8BE6\u60C5\u5931\u8D25", error);
        return { success: false, error: error.message || "\u83B7\u53D6\u4F5C\u54C1\u8BE6\u60C5\u5931\u8D25" };
      }
    }
  });
  Tools.register("novelide:update_work", {
    description: "\u66F4\u65B0\u4F5C\u54C1\u4FE1\u606F",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "\u4F5C\u54C1ID" },
        title: { type: "string", description: "\u65B0\u6807\u9898" },
        genre: { type: "string", description: "\u65B0\u7C7B\u578B" },
        description: { type: "string", description: "\u65B0\u7B80\u4ECB" }
      },
      required: ["workId"]
    },
    execute: async (params) => {
      const workId = requireString(params.workId, "workId");
      try {
        const _a = params, { workId: _ } = _a, updates = __objRest(_a, ["workId"]);
        const result = await safeNativeBoolCall("updateWork", [JSON.stringify(__spreadValues({ id: workId }, updates))]);
        clearJsonCache();
        Logger.info(`\u66F4\u65B0\u4F5C\u54C1\u6210\u529F: ${workId}`);
        return { success: true };
      } catch (error) {
        Logger.error("\u66F4\u65B0\u4F5C\u54C1\u5931\u8D25", error);
        return { success: false, error: error.message || "\u66F4\u65B0\u4F5C\u54C1\u5931\u8D25" };
      }
    }
  });
  Tools.register("novelide:delete_work", {
    description: "\u5220\u9664\u6307\u5B9A\u4F5C\u54C1",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "\u4F5C\u54C1ID" }
      },
      required: ["workId"]
    },
    execute: async (params) => {
      const workId = requireString(params.workId, "workId");
      try {
        const result = await safeNativeBoolCall("deleteWork", [workId]);
        clearJsonCache();
        Logger.info(`\u5220\u9664\u4F5C\u54C1\u6210\u529F: ${workId}`);
        return { success: true };
      } catch (error) {
        Logger.error("\u5220\u9664\u4F5C\u54C1\u5931\u8D25", error);
        return { success: false, error: error.message || "\u5220\u9664\u4F5C\u54C1\u5931\u8D25" };
      }
    }
  });
}

// src/packages/novel_chapters.ts
function registerTools2() {
  Tools.register("novelide:create_chapter", {
    description: "\u4E3A\u6307\u5B9A\u4F5C\u54C1\u521B\u5EFA\u65B0\u7AE0\u8282",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "\u4F5C\u54C1ID" },
        title: { type: "string", description: "\u7AE0\u8282\u6807\u9898" },
        order: { type: "number", description: "\u7AE0\u8282\u6392\u5E8F\uFF08\u53EF\u9009\uFF09" }
      },
      required: ["workId", "title"]
    },
    execute: async (params) => {
      const workId = requireString(params.workId, "workId");
      const title = requireString(params.title, "title");
      const { order = 0 } = params;
      try {
        const result = await safeNativeCall("createChapter", [workId, title, order]);
        Logger.info(`\u521B\u5EFA\u7AE0\u8282\u6210\u529F: ${result}`);
        return { success: true, chapterId: result };
      } catch (error) {
        Logger.error("\u521B\u5EFA\u7AE0\u8282\u5931\u8D25", error);
        return { success: false, error: error.message || "\u521B\u5EFA\u7AE0\u8282\u5931\u8D25" };
      }
    }
  });
  Tools.register("novelide:list_chapters", {
    description: "\u83B7\u53D6\u6307\u5B9A\u4F5C\u54C1\u7684\u6240\u6709\u7AE0\u8282",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "\u4F5C\u54C1ID" }
      },
      required: ["workId"]
    },
    execute: async (params) => {
      const workId = requireString(params.workId, "workId");
      try {
        const chapters = await safeNativeJsonCall("getChapters", [workId]);
        return { success: true, chapters };
      } catch (error) {
        Logger.error("\u83B7\u53D6\u7AE0\u8282\u5217\u8868\u5931\u8D25", error);
        return { success: false, error: error.message || "\u83B7\u53D6\u7AE0\u8282\u5217\u8868\u5931\u8D25", chapters: [] };
      }
    }
  });
  Tools.register("novelide:get_chapter", {
    description: "\u83B7\u53D6\u6307\u5B9A\u7AE0\u8282\u7684\u5185\u5BB9",
    parameters: {
      type: "object",
      properties: {
        chapterId: { type: "string", description: "\u7AE0\u8282ID" }
      },
      required: ["chapterId"]
    },
    execute: async (params) => {
      const chapterId = requireString(params.chapterId, "chapterId");
      try {
        const result = await safeNativeCall("getChapterContent", [chapterId]);
        return { success: true, content: result };
      } catch (error) {
        Logger.error("\u83B7\u53D6\u7AE0\u8282\u5185\u5BB9\u5931\u8D25", error);
        return { success: false, error: error.message || "\u83B7\u53D6\u7AE0\u8282\u5185\u5BB9\u5931\u8D25" };
      }
    }
  });
  Tools.register("novelide:save_chapter", {
    description: "\u4FDD\u5B58\u7AE0\u8282\u5185\u5BB9",
    parameters: {
      type: "object",
      properties: {
        chapterId: { type: "string", description: "\u7AE0\u8282ID" },
        content: { type: "string", description: "\u7AE0\u8282\u5185\u5BB9" },
        wordCount: { type: "number", description: "\u5B57\u6570" }
      },
      required: ["chapterId", "content"]
    },
    execute: async (params) => {
      const chapterId = requireString(params.chapterId, "chapterId");
      const { content = "", wordCount = 0 } = params;
      try {
        const result = await safeNativeBoolCall("saveChapterContent", [chapterId, content, wordCount]);
        Logger.info(`\u4FDD\u5B58\u7AE0\u8282\u6210\u529F: ${chapterId}`);
        return { success: true };
      } catch (error) {
        Logger.error("\u4FDD\u5B58\u7AE0\u8282\u5931\u8D25", error);
        return { success: false, error: error.message || "\u4FDD\u5B58\u7AE0\u8282\u5931\u8D25" };
      }
    }
  });
  Tools.register("novelide:delete_chapter", {
    description: "\u5220\u9664\u6307\u5B9A\u7AE0\u8282",
    parameters: {
      type: "object",
      properties: {
        chapterId: { type: "string", description: "\u7AE0\u8282ID" }
      },
      required: ["chapterId"]
    },
    execute: async (params) => {
      const chapterId = requireString(params.chapterId, "chapterId");
      try {
        const result = await safeNativeBoolCall("deleteChapter", [chapterId]);
        Logger.info(`\u5220\u9664\u7AE0\u8282\u6210\u529F: ${chapterId}`);
        return { success: true };
      } catch (error) {
        Logger.error("\u5220\u9664\u7AE0\u8282\u5931\u8D25", error);
        return { success: false, error: error.message || "\u5220\u9664\u7AE0\u8282\u5931\u8D25" };
      }
    }
  });
  Tools.register("novelide:reorder_chapters", {
    description: "\u91CD\u65B0\u6392\u5E8F\u7AE0\u8282",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "\u4F5C\u54C1ID" },
        chapterIds: { type: "array", items: { type: "string" }, description: "\u7AE0\u8282ID\u5217\u8868\uFF08\u6309\u65B0\u987A\u5E8F\uFF09" }
      },
      required: ["workId", "chapterIds"]
    },
    execute: async (params) => {
      const workId = requireString(params.workId, "workId");
      const { chapterIds } = params;
      if (!Array.isArray(chapterIds) || chapterIds.length === 0) {
        return { success: false, error: "\u7AE0\u8282ID\u5217\u8868\u4E0D\u80FD\u4E3A\u7A7A" };
      }
      try {
        const result = await safeNativeBoolCall("reorderChapters", [workId, JSON.stringify(chapterIds)]);
        Logger.info(`\u7AE0\u8282\u6392\u5E8F\u6210\u529F: ${workId}`);
        return { success: true };
      } catch (error) {
        Logger.error("\u7AE0\u8282\u6392\u5E8F\u5931\u8D25", error);
        return { success: false, error: error.message || "\u7AE0\u8282\u6392\u5E8F\u5931\u8D25" };
      }
    }
  });
}

// src/packages/novel_materials.ts
function registerTools3() {
  Tools.register("novelide:create_character", {
    description: "\u521B\u5EFA\u89D2\u8272",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "\u4F5C\u54C1ID" },
        name: { type: "string", description: "\u89D2\u8272\u59D3\u540D" },
        gender: { type: "string", description: "\u6027\u522B" },
        age: { type: "string", description: "\u5E74\u9F84" },
        appearance: { type: "string", description: "\u5916\u8C8C\u63CF\u8FF0" },
        personality: { type: "string", description: "\u6027\u683C\u7279\u5F81" },
        background: { type: "string", description: "\u80CC\u666F\u6545\u4E8B" },
        notes: { type: "string", description: "\u5907\u6CE8" }
      },
      required: ["workId", "name"]
    },
    execute: async (params) => {
      const workId = requireString(params.workId, "workId");
      const name = requireString(params.name, "name");
      const { gender, age, personality, background, notes } = params;
      try {
        const role = [gender, age, personality, background].filter(Boolean).join(" | ") || notes || "";
        const result = await safeNativeCall("createCharacter", [workId, name, role]);
        Logger.info(`\u521B\u5EFA\u89D2\u8272\u6210\u529F: ${name} (${result})`);
        return { success: true, characterId: result };
      } catch (error) {
        Logger.error("\u521B\u5EFA\u89D2\u8272\u5931\u8D25", error);
        return { success: false, error: error.message || "\u521B\u5EFA\u89D2\u8272\u5931\u8D25" };
      }
    }
  });
  Tools.register("novelide:update_character", {
    description: "\u66F4\u65B0\u89D2\u8272\u4FE1\u606F",
    parameters: {
      type: "object",
      properties: {
        characterId: { type: "string", description: "\u89D2\u8272ID" },
        name: { type: "string", description: "\u89D2\u8272\u59D3\u540D" },
        gender: { type: "string", description: "\u6027\u522B" },
        age: { type: "string", description: "\u5E74\u9F84" },
        appearance: { type: "string", description: "\u5916\u8C8C\u63CF\u8FF0" },
        personality: { type: "string", description: "\u6027\u683C\u7279\u5F81" },
        background: { type: "string", description: "\u80CC\u666F\u6545\u4E8B" },
        notes: { type: "string", description: "\u5907\u6CE8" }
      },
      required: ["characterId"]
    },
    execute: async (params) => {
      const characterId = requireString(params.characterId, "characterId");
      try {
        const result = await safeNativeBoolCall("updateCharacter", [JSON.stringify(params)]);
        Logger.info(`\u66F4\u65B0\u89D2\u8272\u6210\u529F: ${characterId}`);
        return { success: true };
      } catch (error) {
        Logger.error("\u66F4\u65B0\u89D2\u8272\u5931\u8D25", error);
        return { success: false, error: error.message || "\u66F4\u65B0\u89D2\u8272\u5931\u8D25" };
      }
    }
  });
  Tools.register("novelide:delete_character", {
    description: "\u5220\u9664\u6307\u5B9A\u89D2\u8272",
    parameters: {
      type: "object",
      properties: {
        characterId: { type: "string", description: "\u89D2\u8272ID" }
      },
      required: ["characterId"]
    },
    execute: async (params) => {
      const characterId = requireString(params.characterId, "characterId");
      try {
        const result = await safeNativeBoolCall("deleteCharacter", [characterId]);
        Logger.info(`\u5220\u9664\u89D2\u8272\u6210\u529F: ${characterId}`);
        return { success: true };
      } catch (error) {
        Logger.error("\u5220\u9664\u89D2\u8272\u5931\u8D25", error);
        return { success: false, error: error.message || "\u5220\u9664\u89D2\u8272\u5931\u8D25" };
      }
    }
  });
  Tools.register("novelide:list_characters", {
    description: "\u83B7\u53D6\u6307\u5B9A\u4F5C\u54C1\u7684\u6240\u6709\u89D2\u8272\u5217\u8868",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "\u4F5C\u54C1ID" }
      },
      required: ["workId"]
    },
    execute: async (params) => {
      const workId = requireString(params.workId, "workId");
      try {
        const characters = await safeNativeJsonCall("getCharacters", [workId]);
        return { success: true, characters };
      } catch (error) {
        Logger.error("\u83B7\u53D6\u89D2\u8272\u5217\u8868\u5931\u8D25", error);
        return { success: false, error: error.message || "\u83B7\u53D6\u89D2\u8272\u5217\u8868\u5931\u8D25", characters: [] };
      }
    }
  });
  Tools.register("novelide:get_character", {
    description: "\u83B7\u53D6\u6307\u5B9A\u89D2\u8272\u7684\u8BE6\u7EC6\u4FE1\u606F",
    parameters: {
      type: "object",
      properties: {
        characterId: { type: "string", description: "\u89D2\u8272ID" }
      },
      required: ["characterId"]
    },
    execute: async (params) => {
      const characterId = requireString(params.characterId, "characterId");
      try {
        const character = await safeNativeJsonCall("getCharacterDetail", [characterId]);
        Logger.info(`\u83B7\u53D6\u89D2\u8272\u8BE6\u60C5\u6210\u529F: ${characterId}`);
        return { success: true, character };
      } catch (error) {
        Logger.error("\u83B7\u53D6\u89D2\u8272\u8BE6\u60C5\u5931\u8D25", error);
        return { success: false, error: error.message || "\u83B7\u53D6\u89D2\u8272\u8BE6\u60C5\u5931\u8D25" };
      }
    }
  });
  Tools.register("novelide:create_setting", {
    description: "\u521B\u5EFA\u4E16\u754C\u89C2\u8BBE\u5B9A",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "\u4F5C\u54C1ID" },
        name: { type: "string", description: "\u8BBE\u5B9A\u540D\u79F0" },
        category: { type: "string", description: "\u8BBE\u5B9A\u5206\u7C7B\uFF08\u5982\uFF1A\u529B\u91CF\u4F53\u7CFB\u3001\u793E\u4F1A\u5236\u5EA6\u3001\u9B54\u6CD5\u4F53\u7CFB\uFF09" },
        content: { type: "string", description: "\u8BBE\u5B9A\u5185\u5BB9" },
        notes: { type: "string", description: "\u5907\u6CE8" }
      },
      required: ["workId", "name", "content"]
    },
    execute: async (params) => {
      const workId = requireString(params.workId, "workId");
      const name = requireString(params.name, "name");
      const content = requireString(params.content, "content");
      try {
        const result = await safeNativeCall("createSetting", [workId, name, content]);
        Logger.info(`\u521B\u5EFA\u8BBE\u5B9A\u6210\u529F: ${name} (${result})`);
        return { success: true, settingId: result };
      } catch (error) {
        Logger.error("\u521B\u5EFA\u8BBE\u5B9A\u5931\u8D25", error);
        return { success: false, error: error.message || "\u521B\u5EFA\u8BBE\u5B9A\u5931\u8D25" };
      }
    }
  });
  Tools.register("novelide:update_setting", {
    description: "\u66F4\u65B0\u4E16\u754C\u89C2\u8BBE\u5B9A",
    parameters: {
      type: "object",
      properties: {
        settingId: { type: "string", description: "\u8BBE\u5B9AID" },
        name: { type: "string", description: "\u8BBE\u5B9A\u540D\u79F0" },
        category: { type: "string", description: "\u8BBE\u5B9A\u5206\u7C7B" },
        content: { type: "string", description: "\u8BBE\u5B9A\u5185\u5BB9" },
        notes: { type: "string", description: "\u5907\u6CE8" }
      },
      required: ["settingId"]
    },
    execute: async (params) => {
      const settingId = requireString(params.settingId, "settingId");
      try {
        const result = await safeNativeBoolCall("updateSetting", [JSON.stringify(params)]);
        Logger.info(`\u66F4\u65B0\u8BBE\u5B9A\u6210\u529F: ${settingId}`);
        return { success: true };
      } catch (error) {
        Logger.error("\u66F4\u65B0\u8BBE\u5B9A\u5931\u8D25", error);
        return { success: false, error: error.message || "\u66F4\u65B0\u8BBE\u5B9A\u5931\u8D25" };
      }
    }
  });
  Tools.register("novelide:delete_setting", {
    description: "\u5220\u9664\u6307\u5B9A\u8BBE\u5B9A",
    parameters: {
      type: "object",
      properties: {
        settingId: { type: "string", description: "\u8BBE\u5B9AID" }
      },
      required: ["settingId"]
    },
    execute: async (params) => {
      const settingId = requireString(params.settingId, "settingId");
      try {
        const result = await safeNativeBoolCall("deleteSetting", [settingId]);
        Logger.info(`\u5220\u9664\u8BBE\u5B9A\u6210\u529F: ${settingId}`);
        return { success: true };
      } catch (error) {
        Logger.error("\u5220\u9664\u8BBE\u5B9A\u5931\u8D25", error);
        return { success: false, error: error.message || "\u5220\u9664\u8BBE\u5B9A\u5931\u8D25" };
      }
    }
  });
  Tools.register("novelide:list_settings", {
    description: "\u83B7\u53D6\u6307\u5B9A\u4F5C\u54C1\u7684\u6240\u6709\u8BBE\u5B9A\u5217\u8868",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "\u4F5C\u54C1ID" }
      },
      required: ["workId"]
    },
    execute: async (params) => {
      const workId = requireString(params.workId, "workId");
      try {
        const settings = await safeNativeJsonCall("getSettings", [workId]);
        return { success: true, settings };
      } catch (error) {
        Logger.error("\u83B7\u53D6\u8BBE\u5B9A\u5217\u8868\u5931\u8D25", error);
        return { success: false, error: error.message || "\u83B7\u53D6\u8BBE\u5B9A\u5217\u8868\u5931\u8D25", settings: [] };
      }
    }
  });
  Tools.register("novelide:get_setting", {
    description: "\u83B7\u53D6\u6307\u5B9A\u8BBE\u5B9A\u7684\u8BE6\u7EC6\u4FE1\u606F",
    parameters: {
      type: "object",
      properties: {
        settingId: { type: "string", description: "\u8BBE\u5B9AID" }
      },
      required: ["settingId"]
    },
    execute: async (params) => {
      const settingId = requireString(params.settingId, "settingId");
      try {
        const setting = await safeNativeJsonCall("getSettingDetail", [settingId]);
        Logger.info(`\u83B7\u53D6\u8BBE\u5B9A\u8BE6\u60C5\u6210\u529F: ${settingId}`);
        return { success: true, setting };
      } catch (error) {
        Logger.error("\u83B7\u53D6\u8BBE\u5B9A\u8BE6\u60C5\u5931\u8D25", error);
        return { success: false, error: error.message || "\u83B7\u53D6\u8BBE\u5B9A\u8BE6\u60C5\u5931\u8D25" };
      }
    }
  });
  Tools.register("novelide:create_location", {
    description: "\u521B\u5EFA\u5730\u70B9",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "\u4F5C\u54C1ID" },
        name: { type: "string", description: "\u5730\u70B9\u540D\u79F0" },
        type: { type: "string", description: "\u5730\u70B9\u7C7B\u578B\uFF08\u5982\uFF1A\u57CE\u5E02\u3001\u5C71\u8109\u3001\u5BAB\u6BBF\uFF09" },
        description: { type: "string", description: "\u5730\u70B9\u63CF\u8FF0" },
        notes: { type: "string", description: "\u5907\u6CE8" }
      },
      required: ["workId", "name"]
    },
    execute: async (params) => {
      const workId = requireString(params.workId, "workId");
      const name = requireString(params.name, "name");
      const { description = "" } = params;
      try {
        const result = await safeNativeCall("createLocation", [workId, name, description]);
        Logger.info(`\u521B\u5EFA\u5730\u70B9\u6210\u529F: ${name} (${result})`);
        return { success: true, locationId: result };
      } catch (error) {
        Logger.error("\u521B\u5EFA\u5730\u70B9\u5931\u8D25", error);
        return { success: false, error: error.message || "\u521B\u5EFA\u5730\u70B9\u5931\u8D25" };
      }
    }
  });
  Tools.register("novelide:update_location", {
    description: "\u66F4\u65B0\u5730\u70B9\u4FE1\u606F",
    parameters: {
      type: "object",
      properties: {
        locationId: { type: "string", description: "\u5730\u70B9ID" },
        name: { type: "string", description: "\u5730\u70B9\u540D\u79F0" },
        type: { type: "string", description: "\u5730\u70B9\u7C7B\u578B" },
        description: { type: "string", description: "\u5730\u70B9\u63CF\u8FF0" },
        notes: { type: "string", description: "\u5907\u6CE8" }
      },
      required: ["locationId"]
    },
    execute: async (params) => {
      const locationId = requireString(params.locationId, "locationId");
      try {
        const result = await safeNativeBoolCall("updateLocation", [JSON.stringify(params)]);
        Logger.info(`\u66F4\u65B0\u5730\u70B9\u6210\u529F: ${locationId}`);
        return { success: true };
      } catch (error) {
        Logger.error("\u66F4\u65B0\u5730\u70B9\u5931\u8D25", error);
        return { success: false, error: error.message || "\u66F4\u65B0\u5730\u70B9\u5931\u8D25" };
      }
    }
  });
  Tools.register("novelide:delete_location", {
    description: "\u5220\u9664\u6307\u5B9A\u5730\u70B9",
    parameters: {
      type: "object",
      properties: {
        locationId: { type: "string", description: "\u5730\u70B9ID" }
      },
      required: ["locationId"]
    },
    execute: async (params) => {
      const locationId = requireString(params.locationId, "locationId");
      try {
        const result = await safeNativeBoolCall("deleteLocation", [locationId]);
        Logger.info(`\u5220\u9664\u5730\u70B9\u6210\u529F: ${locationId}`);
        return { success: true };
      } catch (error) {
        Logger.error("\u5220\u9664\u5730\u70B9\u5931\u8D25", error);
        return { success: false, error: error.message || "\u5220\u9664\u5730\u70B9\u5931\u8D25" };
      }
    }
  });
  Tools.register("novelide:list_locations", {
    description: "\u83B7\u53D6\u6307\u5B9A\u4F5C\u54C1\u7684\u6240\u6709\u5730\u70B9\u5217\u8868",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "\u4F5C\u54C1ID" }
      },
      required: ["workId"]
    },
    execute: async (params) => {
      const workId = requireString(params.workId, "workId");
      try {
        const locations = await safeNativeJsonCall("getLocations", [workId]);
        return { success: true, locations };
      } catch (error) {
        Logger.error("\u83B7\u53D6\u5730\u70B9\u5217\u8868\u5931\u8D25", error);
        return { success: false, error: error.message || "\u83B7\u53D6\u5730\u70B9\u5217\u8868\u5931\u8D25", locations: [] };
      }
    }
  });
  Tools.register("novelide:get_location", {
    description: "\u83B7\u53D6\u6307\u5B9A\u5730\u70B9\u7684\u8BE6\u7EC6\u4FE1\u606F",
    parameters: {
      type: "object",
      properties: {
        locationId: { type: "string", description: "\u5730\u70B9ID" }
      },
      required: ["locationId"]
    },
    execute: async (params) => {
      const locationId = requireString(params.locationId, "locationId");
      try {
        const location = await safeNativeJsonCall("getLocationDetail", [locationId]);
        Logger.info(`\u83B7\u53D6\u5730\u70B9\u8BE6\u60C5\u6210\u529F: ${locationId}`);
        return { success: true, location };
      } catch (error) {
        Logger.error("\u83B7\u53D6\u5730\u70B9\u8BE6\u60C5\u5931\u8D25", error);
        return { success: false, error: error.message || "\u83B7\u53D6\u5730\u70B9\u8BE6\u60C5\u5931\u8D25" };
      }
    }
  });
  Tools.register("novelide:create_faction", {
    description: "\u521B\u5EFA\u52BF\u529B",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "\u4F5C\u54C1ID" },
        name: { type: "string", description: "\u52BF\u529B\u540D\u79F0" },
        type: { type: "string", description: "\u52BF\u529B\u7C7B\u578B\uFF08\u5982\uFF1A\u95E8\u6D3E\u3001\u56FD\u5BB6\u3001\u7EC4\u7EC7\uFF09" },
        description: { type: "string", description: "\u52BF\u529B\u63CF\u8FF0" },
        notes: { type: "string", description: "\u5907\u6CE8" }
      },
      required: ["workId", "name"]
    },
    execute: async (params) => {
      const workId = requireString(params.workId, "workId");
      const name = requireString(params.name, "name");
      const { description = "" } = params;
      try {
        const result = await safeNativeCall("createFaction", [workId, name, description]);
        Logger.info(`\u521B\u5EFA\u52BF\u529B\u6210\u529F: ${name} (${result})`);
        return { success: true, factionId: result };
      } catch (error) {
        Logger.error("\u521B\u5EFA\u52BF\u529B\u5931\u8D25", error);
        return { success: false, error: error.message || "\u521B\u5EFA\u52BF\u529B\u5931\u8D25" };
      }
    }
  });
  Tools.register("novelide:update_faction", {
    description: "\u66F4\u65B0\u52BF\u529B\u4FE1\u606F",
    parameters: {
      type: "object",
      properties: {
        factionId: { type: "string", description: "\u52BF\u529BID" },
        name: { type: "string", description: "\u52BF\u529B\u540D\u79F0" },
        type: { type: "string", description: "\u52BF\u529B\u7C7B\u578B" },
        description: { type: "string", description: "\u52BF\u529B\u63CF\u8FF0" },
        notes: { type: "string", description: "\u5907\u6CE8" }
      },
      required: ["factionId"]
    },
    execute: async (params) => {
      const factionId = requireString(params.factionId, "factionId");
      try {
        const result = await safeNativeBoolCall("updateFaction", [JSON.stringify(params)]);
        Logger.info(`\u66F4\u65B0\u52BF\u529B\u6210\u529F: ${factionId}`);
        return { success: true };
      } catch (error) {
        Logger.error("\u66F4\u65B0\u52BF\u529B\u5931\u8D25", error);
        return { success: false, error: error.message || "\u66F4\u65B0\u52BF\u529B\u5931\u8D25" };
      }
    }
  });
  Tools.register("novelide:delete_faction", {
    description: "\u5220\u9664\u6307\u5B9A\u52BF\u529B",
    parameters: {
      type: "object",
      properties: {
        factionId: { type: "string", description: "\u52BF\u529BID" }
      },
      required: ["factionId"]
    },
    execute: async (params) => {
      const factionId = requireString(params.factionId, "factionId");
      try {
        const result = await safeNativeBoolCall("deleteFaction", [factionId]);
        Logger.info(`\u5220\u9664\u52BF\u529B\u6210\u529F: ${factionId}`);
        return { success: true };
      } catch (error) {
        Logger.error("\u5220\u9664\u52BF\u529B\u5931\u8D25", error);
        return { success: false, error: error.message || "\u5220\u9664\u52BF\u529B\u5931\u8D25" };
      }
    }
  });
  Tools.register("novelide:list_factions", {
    description: "\u83B7\u53D6\u6307\u5B9A\u4F5C\u54C1\u7684\u6240\u6709\u52BF\u529B\u5217\u8868",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "\u4F5C\u54C1ID" }
      },
      required: ["workId"]
    },
    execute: async (params) => {
      const workId = requireString(params.workId, "workId");
      try {
        const factions = await safeNativeJsonCall("getFactions", [workId]);
        return { success: true, factions };
      } catch (error) {
        Logger.error("\u83B7\u53D6\u52BF\u529B\u5217\u8868\u5931\u8D25", error);
        return { success: false, error: error.message || "\u83B7\u53D6\u52BF\u529B\u5217\u8868\u5931\u8D25", factions: [] };
      }
    }
  });
  Tools.register("novelide:get_faction", {
    description: "\u83B7\u53D6\u6307\u5B9A\u52BF\u529B\u7684\u8BE6\u7EC6\u4FE1\u606F",
    parameters: {
      type: "object",
      properties: {
        factionId: { type: "string", description: "\u52BF\u529BID" }
      },
      required: ["factionId"]
    },
    execute: async (params) => {
      const factionId = requireString(params.factionId, "factionId");
      try {
        const faction = await safeNativeJsonCall("getFactionDetail", [factionId]);
        Logger.info(`\u83B7\u53D6\u52BF\u529B\u8BE6\u60C5\u6210\u529F: ${factionId}`);
        return { success: true, faction };
      } catch (error) {
        Logger.error("\u83B7\u53D6\u52BF\u529B\u8BE6\u60C5\u5931\u8D25", error);
        return { success: false, error: error.message || "\u83B7\u53D6\u52BF\u529B\u8BE6\u60C5\u5931\u8D25" };
      }
    }
  });
  Tools.register("novelide:create_item", {
    description: "\u521B\u5EFA\u9053\u5177",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "\u4F5C\u54C1ID" },
        name: { type: "string", description: "\u9053\u5177\u540D\u79F0" },
        type: { type: "string", description: "\u9053\u5177\u7C7B\u578B\uFF08\u5982\uFF1A\u6B66\u5668\u3001\u6CD5\u5B9D\u3001\u836F\u54C1\uFF09" },
        description: { type: "string", description: "\u9053\u5177\u63CF\u8FF0" },
        notes: { type: "string", description: "\u5907\u6CE8" }
      },
      required: ["workId", "name"]
    },
    execute: async (params) => {
      const workId = requireString(params.workId, "workId");
      const name = requireString(params.name, "name");
      const { description = "" } = params;
      try {
        const result = await safeNativeCall("createItem", [workId, name, description]);
        Logger.info(`\u521B\u5EFA\u9053\u5177\u6210\u529F: ${name} (${result})`);
        return { success: true, itemId: result };
      } catch (error) {
        Logger.error("\u521B\u5EFA\u9053\u5177\u5931\u8D25", error);
        return { success: false, error: error.message || "\u521B\u5EFA\u9053\u5177\u5931\u8D25" };
      }
    }
  });
  Tools.register("novelide:update_item", {
    description: "\u66F4\u65B0\u9053\u5177\u4FE1\u606F",
    parameters: {
      type: "object",
      properties: {
        itemId: { type: "string", description: "\u9053\u5177ID" },
        name: { type: "string", description: "\u9053\u5177\u540D\u79F0" },
        type: { type: "string", description: "\u9053\u5177\u7C7B\u578B" },
        description: { type: "string", description: "\u9053\u5177\u63CF\u8FF0" },
        notes: { type: "string", description: "\u5907\u6CE8" }
      },
      required: ["itemId"]
    },
    execute: async (params) => {
      const itemId = requireString(params.itemId, "itemId");
      try {
        const result = await safeNativeBoolCall("updateItem", [JSON.stringify(params)]);
        Logger.info(`\u66F4\u65B0\u9053\u5177\u6210\u529F: ${itemId}`);
        return { success: true };
      } catch (error) {
        Logger.error("\u66F4\u65B0\u9053\u5177\u5931\u8D25", error);
        return { success: false, error: error.message || "\u66F4\u65B0\u9053\u5177\u5931\u8D25" };
      }
    }
  });
  Tools.register("novelide:delete_item", {
    description: "\u5220\u9664\u6307\u5B9A\u9053\u5177",
    parameters: {
      type: "object",
      properties: {
        itemId: { type: "string", description: "\u9053\u5177ID" }
      },
      required: ["itemId"]
    },
    execute: async (params) => {
      const itemId = requireString(params.itemId, "itemId");
      try {
        const result = await safeNativeBoolCall("deleteItem", [itemId]);
        Logger.info(`\u5220\u9664\u9053\u5177\u6210\u529F: ${itemId}`);
        return { success: true };
      } catch (error) {
        Logger.error("\u5220\u9664\u9053\u5177\u5931\u8D25", error);
        return { success: false, error: error.message || "\u5220\u9664\u9053\u5177\u5931\u8D25" };
      }
    }
  });
  Tools.register("novelide:list_items", {
    description: "\u83B7\u53D6\u6307\u5B9A\u4F5C\u54C1\u7684\u6240\u6709\u9053\u5177\u5217\u8868",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "\u4F5C\u54C1ID" }
      },
      required: ["workId"]
    },
    execute: async (params) => {
      const workId = requireString(params.workId, "workId");
      try {
        const items = await safeNativeJsonCall("getItems", [workId]);
        return { success: true, items };
      } catch (error) {
        Logger.error("\u83B7\u53D6\u9053\u5177\u5217\u8868\u5931\u8D25", error);
        return { success: false, error: error.message || "\u83B7\u53D6\u9053\u5177\u5217\u8868\u5931\u8D25", items: [] };
      }
    }
  });
  Tools.register("novelide:get_item", {
    description: "\u83B7\u53D6\u6307\u5B9A\u9053\u5177\u7684\u8BE6\u7EC6\u4FE1\u606F",
    parameters: {
      type: "object",
      properties: {
        itemId: { type: "string", description: "\u9053\u5177ID" }
      },
      required: ["itemId"]
    },
    execute: async (params) => {
      const itemId = requireString(params.itemId, "itemId");
      try {
        const item = await safeNativeJsonCall("getItemDetail", [itemId]);
        Logger.info(`\u83B7\u53D6\u9053\u5177\u8BE6\u60C5\u6210\u529F: ${itemId}`);
        return { success: true, item };
      } catch (error) {
        Logger.error("\u83B7\u53D6\u9053\u5177\u8BE6\u60C5\u5931\u8D25", error);
        return { success: false, error: error.message || "\u83B7\u53D6\u9053\u5177\u8BE6\u60C5\u5931\u8D25" };
      }
    }
  });
  Tools.register("novelide:create_hook", {
    description: "\u521B\u5EFA\u4F0F\u7B14",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "\u4F5C\u54C1ID" },
        title: { type: "string", description: "\u4F0F\u7B14\u6807\u9898" },
        content: { type: "string", description: "\u4F0F\u7B14\u5185\u5BB9" },
        plantChapter: { type: "string", description: "\u57CB\u8BBE\u7AE0\u8282" },
        resolveChapter: { type: "string", description: "\u56DE\u6536\u7AE0\u8282" },
        status: { type: "string", description: "\u72B6\u6001\uFF08\u5982\uFF1A\u5DF2\u57CB\u8BBE\u3001\u5DF2\u56DE\u6536\u3001\u5DF2\u5E9F\u5F03\uFF09" },
        notes: { type: "string", description: "\u5907\u6CE8" }
      },
      required: ["workId", "title", "content"]
    },
    execute: async (params) => {
      const workId = requireString(params.workId, "workId");
      const title = requireString(params.title, "title");
      const content = requireString(params.content, "content");
      try {
        const hookContent = title ? `${title}
${content}` : content;
        const result = await safeNativeCall("createPlotHook", [workId, hookContent]);
        Logger.info(`\u521B\u5EFA\u4F0F\u7B14\u6210\u529F: ${title} (${result})`);
        return { success: true, hookId: result };
      } catch (error) {
        Logger.error("\u521B\u5EFA\u4F0F\u7B14\u5931\u8D25", error);
        return { success: false, error: error.message || "\u521B\u5EFA\u4F0F\u7B14\u5931\u8D25" };
      }
    }
  });
  Tools.register("novelide:update_hook", {
    description: "\u66F4\u65B0\u4F0F\u7B14\u4FE1\u606F",
    parameters: {
      type: "object",
      properties: {
        hookId: { type: "string", description: "\u4F0F\u7B14ID" },
        title: { type: "string", description: "\u4F0F\u7B14\u6807\u9898" },
        content: { type: "string", description: "\u4F0F\u7B14\u5185\u5BB9" },
        plantChapter: { type: "string", description: "\u57CB\u8BBE\u7AE0\u8282" },
        resolveChapter: { type: "string", description: "\u56DE\u6536\u7AE0\u8282" },
        status: { type: "string", description: "\u72B6\u6001" },
        notes: { type: "string", description: "\u5907\u6CE8" }
      },
      required: ["hookId"]
    },
    execute: async (params) => {
      const hookId = requireString(params.hookId, "hookId");
      try {
        const result = await safeNativeBoolCall("updatePlotHook", [JSON.stringify(params)]);
        Logger.info(`\u66F4\u65B0\u4F0F\u7B14\u6210\u529F: ${hookId}`);
        return { success: true };
      } catch (error) {
        Logger.error("\u66F4\u65B0\u4F0F\u7B14\u5931\u8D25", error);
        return { success: false, error: error.message || "\u66F4\u65B0\u4F0F\u7B14\u5931\u8D25" };
      }
    }
  });
  Tools.register("novelide:delete_hook", {
    description: "\u5220\u9664\u6307\u5B9A\u4F0F\u7B14",
    parameters: {
      type: "object",
      properties: {
        hookId: { type: "string", description: "\u4F0F\u7B14ID" }
      },
      required: ["hookId"]
    },
    execute: async (params) => {
      const hookId = requireString(params.hookId, "hookId");
      try {
        const result = await safeNativeBoolCall("deletePlotHook", [hookId]);
        Logger.info(`\u5220\u9664\u4F0F\u7B14\u6210\u529F: ${hookId}`);
        return { success: true };
      } catch (error) {
        Logger.error("\u5220\u9664\u4F0F\u7B14\u5931\u8D25", error);
        return { success: false, error: error.message || "\u5220\u9664\u4F0F\u7B14\u5931\u8D25" };
      }
    }
  });
  Tools.register("novelide:list_hooks", {
    description: "\u83B7\u53D6\u6307\u5B9A\u4F5C\u54C1\u7684\u6240\u6709\u4F0F\u7B14\u5217\u8868",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "\u4F5C\u54C1ID" }
      },
      required: ["workId"]
    },
    execute: async (params) => {
      const workId = requireString(params.workId, "workId");
      try {
        const hooks = await safeNativeJsonCall("getPlotHooks", [workId]);
        return { success: true, hooks };
      } catch (error) {
        Logger.error("\u83B7\u53D6\u4F0F\u7B14\u5217\u8868\u5931\u8D25", error);
        return { success: false, error: error.message || "\u83B7\u53D6\u4F0F\u7B14\u5217\u8868\u5931\u8D25", hooks: [] };
      }
    }
  });
  Tools.register("novelide:get_hook", {
    description: "\u83B7\u53D6\u6307\u5B9A\u4F0F\u7B14\u7684\u8BE6\u7EC6\u4FE1\u606F",
    parameters: {
      type: "object",
      properties: {
        hookId: { type: "string", description: "\u4F0F\u7B14ID" }
      },
      required: ["hookId"]
    },
    execute: async (params) => {
      const hookId = requireString(params.hookId, "hookId");
      try {
        const hook = await safeNativeJsonCall("getHookDetail", [hookId]);
        Logger.info(`\u83B7\u53D6\u4F0F\u7B14\u8BE6\u60C5\u6210\u529F: ${hookId}`);
        return { success: true, hook };
      } catch (error) {
        Logger.error("\u83B7\u53D6\u4F0F\u7B14\u8BE6\u60C5\u5931\u8D25", error);
        return { success: false, error: error.message || "\u83B7\u53D6\u4F0F\u7B14\u8BE6\u60C5\u5931\u8D25" };
      }
    }
  });
  Tools.register("novelide:create_reference", {
    description: "\u521B\u5EFA\u53C2\u8003\u8D44\u6599",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "\u4F5C\u54C1ID" },
        title: { type: "string", description: "\u8D44\u6599\u6807\u9898" },
        type: { type: "string", description: "\u8D44\u6599\u7C7B\u578B\uFF08\u5982\uFF1A\u56FE\u7247\u3001\u94FE\u63A5\u3001\u6587\u6863\u3001\u7B14\u8BB0\uFF09" },
        content: { type: "string", description: "\u8D44\u6599\u5185\u5BB9" },
        url: { type: "string", description: "\u5916\u90E8\u94FE\u63A5\uFF08\u53EF\u9009\uFF09" },
        notes: { type: "string", description: "\u5907\u6CE8" }
      },
      required: ["workId", "title", "content"]
    },
    execute: async (params) => {
      const workId = requireString(params.workId, "workId");
      const title = requireString(params.title, "title");
      const content = requireString(params.content, "content");
      try {
        const result = await safeNativeCall("createReference", [workId, title, content]);
        Logger.info(`\u521B\u5EFA\u53C2\u8003\u8D44\u6599\u6210\u529F: ${title} (${result})`);
        return { success: true, referenceId: result };
      } catch (error) {
        Logger.error("\u521B\u5EFA\u53C2\u8003\u8D44\u6599\u5931\u8D25", error);
        return { success: false, error: error.message || "\u521B\u5EFA\u53C2\u8003\u8D44\u6599\u5931\u8D25" };
      }
    }
  });
  Tools.register("novelide:update_reference", {
    description: "\u66F4\u65B0\u53C2\u8003\u8D44\u6599",
    parameters: {
      type: "object",
      properties: {
        referenceId: { type: "string", description: "\u8D44\u6599ID" },
        title: { type: "string", description: "\u8D44\u6599\u6807\u9898" },
        type: { type: "string", description: "\u8D44\u6599\u7C7B\u578B" },
        content: { type: "string", description: "\u8D44\u6599\u5185\u5BB9" },
        url: { type: "string", description: "\u5916\u90E8\u94FE\u63A5" },
        notes: { type: "string", description: "\u5907\u6CE8" }
      },
      required: ["referenceId"]
    },
    execute: async (params) => {
      const referenceId = requireString(params.referenceId, "referenceId");
      try {
        const result = await safeNativeBoolCall("updateReference", [JSON.stringify(params)]);
        Logger.info(`\u66F4\u65B0\u53C2\u8003\u8D44\u6599\u6210\u529F: ${referenceId}`);
        return { success: true };
      } catch (error) {
        Logger.error("\u66F4\u65B0\u53C2\u8003\u8D44\u6599\u5931\u8D25", error);
        return { success: false, error: error.message || "\u66F4\u65B0\u53C2\u8003\u8D44\u6599\u5931\u8D25" };
      }
    }
  });
  Tools.register("novelide:delete_reference", {
    description: "\u5220\u9664\u6307\u5B9A\u53C2\u8003\u8D44\u6599",
    parameters: {
      type: "object",
      properties: {
        referenceId: { type: "string", description: "\u8D44\u6599ID" }
      },
      required: ["referenceId"]
    },
    execute: async (params) => {
      const referenceId = requireString(params.referenceId, "referenceId");
      try {
        const result = await safeNativeBoolCall("deleteReference", [referenceId]);
        Logger.info(`\u5220\u9664\u53C2\u8003\u8D44\u6599\u6210\u529F: ${referenceId}`);
        return { success: true };
      } catch (error) {
        Logger.error("\u5220\u9664\u53C2\u8003\u8D44\u6599\u5931\u8D25", error);
        return { success: false, error: error.message || "\u5220\u9664\u53C2\u8003\u8D44\u6599\u5931\u8D25" };
      }
    }
  });
  Tools.register("novelide:list_references", {
    description: "\u83B7\u53D6\u6307\u5B9A\u4F5C\u54C1\u7684\u6240\u6709\u53C2\u8003\u8D44\u6599\u5217\u8868",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "\u4F5C\u54C1ID" }
      },
      required: ["workId"]
    },
    execute: async (params) => {
      const workId = requireString(params.workId, "workId");
      try {
        const references = await safeNativeJsonCall("getReferences", [workId]);
        return { success: true, references };
      } catch (error) {
        Logger.error("\u83B7\u53D6\u53C2\u8003\u8D44\u6599\u5217\u8868\u5931\u8D25", error);
        return { success: false, error: error.message || "\u83B7\u53D6\u53C2\u8003\u8D44\u6599\u5217\u8868\u5931\u8D25", references: [] };
      }
    }
  });
  Tools.register("novelide:get_reference", {
    description: "\u83B7\u53D6\u6307\u5B9A\u53C2\u8003\u8D44\u6599\u7684\u8BE6\u7EC6\u4FE1\u606F",
    parameters: {
      type: "object",
      properties: {
        referenceId: { type: "string", description: "\u8D44\u6599ID" }
      },
      required: ["referenceId"]
    },
    execute: async (params) => {
      const referenceId = requireString(params.referenceId, "referenceId");
      try {
        const reference = await safeNativeJsonCall("getReferenceDetail", [referenceId]);
        Logger.info(`\u83B7\u53D6\u53C2\u8003\u8D44\u6599\u8BE6\u60C5\u6210\u529F: ${referenceId}`);
        return { success: true, reference };
      } catch (error) {
        Logger.error("\u83B7\u53D6\u53C2\u8003\u8D44\u6599\u8BE6\u60C5\u5931\u8D25", error);
        return { success: false, error: error.message || "\u83B7\u53D6\u53C2\u8003\u8D44\u6599\u8BE6\u60C5\u5931\u8D25" };
      }
    }
  });
  Tools.register("novelide:create_todo", {
    description: "\u521B\u5EFA\u5199\u4F5C\u5F85\u529E",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "\u4F5C\u54C1ID" },
        title: { type: "string", description: "\u5F85\u529E\u6807\u9898" },
        content: { type: "string", description: "\u5F85\u529E\u5185\u5BB9" },
        priority: { type: "string", description: "\u4F18\u5148\u7EA7\uFF08\u5982\uFF1A\u9AD8\u3001\u4E2D\u3001\u4F4E\uFF09" }
      },
      required: ["workId", "title"]
    },
    execute: async (params) => {
      const workId = requireString(params.workId, "workId");
      const title = requireString(params.title, "title");
      const { priority } = params;
      try {
        const priorityNum = priority === "high" || priority === "\u9AD8" ? 2 : priority === "medium" || priority === "\u4E2D" ? 1 : 0;
        const result = await safeNativeCall("createTodo", [workId, title, priorityNum]);
        Logger.info(`\u521B\u5EFA\u5F85\u529E\u6210\u529F: ${title} (${result})`);
        return { success: true, todoId: result };
      } catch (error) {
        Logger.error("\u521B\u5EFA\u5F85\u529E\u5931\u8D25", error);
        return { success: false, error: error.message || "\u521B\u5EFA\u5F85\u529E\u5931\u8D25" };
      }
    }
  });
  Tools.register("novelide:update_todo", {
    description: "\u66F4\u65B0\u5199\u4F5C\u5F85\u529E",
    parameters: {
      type: "object",
      properties: {
        todoId: { type: "string", description: "\u5F85\u529EID" },
        title: { type: "string", description: "\u5F85\u529E\u6807\u9898" },
        content: { type: "string", description: "\u5F85\u529E\u5185\u5BB9" },
        priority: { type: "string", description: "\u4F18\u5148\u7EA7" },
        completed: { type: "boolean", description: "\u662F\u5426\u5DF2\u5B8C\u6210" }
      },
      required: ["todoId"]
    },
    execute: async (params) => {
      const todoId = requireString(params.todoId, "todoId");
      try {
        const result = await safeNativeBoolCall("updateTodo", [JSON.stringify(params)]);
        Logger.info(`\u66F4\u65B0\u5F85\u529E\u6210\u529F: ${todoId}`);
        return { success: true };
      } catch (error) {
        Logger.error("\u66F4\u65B0\u5F85\u529E\u5931\u8D25", error);
        return { success: false, error: error.message || "\u66F4\u65B0\u5F85\u529E\u5931\u8D25" };
      }
    }
  });
  Tools.register("novelide:delete_todo", {
    description: "\u5220\u9664\u6307\u5B9A\u5199\u4F5C\u5F85\u529E",
    parameters: {
      type: "object",
      properties: {
        todoId: { type: "string", description: "\u5F85\u529EID" }
      },
      required: ["todoId"]
    },
    execute: async (params) => {
      const todoId = requireString(params.todoId, "todoId");
      try {
        const result = await safeNativeBoolCall("deleteTodo", [todoId]);
        Logger.info(`\u5220\u9664\u5F85\u529E\u6210\u529F: ${todoId}`);
        return { success: true };
      } catch (error) {
        Logger.error("\u5220\u9664\u5F85\u529E\u5931\u8D25", error);
        return { success: false, error: error.message || "\u5220\u9664\u5F85\u529E\u5931\u8D25" };
      }
    }
  });
  Tools.register("novelide:list_todos", {
    description: "\u83B7\u53D6\u6307\u5B9A\u4F5C\u54C1\u7684\u6240\u6709\u5199\u4F5C\u5F85\u529E\u5217\u8868",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "\u4F5C\u54C1ID" }
      },
      required: ["workId"]
    },
    execute: async (params) => {
      const workId = requireString(params.workId, "workId");
      try {
        const todos = await safeNativeJsonCall("getTodos", [workId]);
        return { success: true, todos };
      } catch (error) {
        Logger.error("\u83B7\u53D6\u5F85\u529E\u5217\u8868\u5931\u8D25", error);
        return { success: false, error: error.message || "\u83B7\u53D6\u5F85\u529E\u5217\u8868\u5931\u8D25", todos: [] };
      }
    }
  });
}

// src/packages/novel_ai_tools.ts
function registerTools4() {
  Tools.register("novelide:continue_writing", {
    description: "AI \u7EED\u5199\uFF0C\u6839\u636E\u524D\u6587\u5185\u5BB9\u81EA\u52A8\u7EED\u5199\u540E\u7EED\u60C5\u8282",
    parameters: {
      type: "object",
      properties: {
        content: { type: "string", description: "\u524D\u6587\u5185\u5BB9" },
        workId: { type: "string", description: "\u4F5C\u54C1ID" }
      },
      required: ["content"]
    },
    execute: async (params) => {
      const content = requireString(params.content, "content");
      try {
        const result = await Tools.Chat({
          messages: [{ role: "user", content: `\u8BF7\u7EED\u5199\u4EE5\u4E0B\u5185\u5BB9\uFF1A
${content}` }],
          systemPrompt: "\u4F60\u662F\u4E00\u4E2A\u7F51\u6587\u5199\u4F5C\u52A9\u624B\uFF0C\u8BF7\u6839\u636E\u524D\u6587\u5185\u5BB9\u7EED\u5199\uFF0C\u4FDD\u6301\u98CE\u683C\u4E00\u81F4\uFF0C\u60C5\u8282\u8FDE\u8D2F\uFF0C\u7EED\u5199\u7EA6500\u5B57\u3002"
        });
        if (!result) {
          throw new Error("AI \u7EED\u5199\u8FD4\u56DE\u4E86\u7A7A\u7ED3\u679C");
        }
        Logger.info("AI \u7EED\u5199\u5B8C\u6210");
        return { success: true, text: result };
      } catch (error) {
        Logger.error("AI \u7EED\u5199\u5931\u8D25", error);
        return { success: false, error: error.message || "AI \u7EED\u5199\u5931\u8D25" };
      }
    }
  });
  Tools.register("novelide:polish_text", {
    description: "AI \u6587\u672C\u7CBE\u4FEE\uFF0C\u4F18\u5316\u8BED\u53E5\u8868\u8FBE\u3001\u6DA6\u8272\u6587\u7B14",
    parameters: {
      type: "object",
      properties: {
        content: { type: "string", description: "\u9700\u8981\u7CBE\u4FEE\u7684\u6587\u672C\u5185\u5BB9" },
        workId: { type: "string", description: "\u4F5C\u54C1ID" }
      },
      required: ["content"]
    },
    execute: async (params) => {
      const content = requireString(params.content, "content");
      try {
        const result = await Tools.Chat({
          messages: [{ role: "user", content: `\u8BF7\u7CBE\u4FEE\u4EE5\u4E0B\u6587\u672C\uFF0C\u4F18\u5316\u8BED\u53E5\u8868\u8FBE\uFF0C\u63D0\u5347\u6587\u7B14\u8D28\u91CF\uFF0C\u4FDD\u6301\u539F\u610F\u4E0D\u53D8\uFF1A
${content}` }],
          systemPrompt: "\u4F60\u662F\u4E00\u4E2A\u4E13\u4E1A\u7684\u6587\u5B66\u7F16\u8F91\uFF0C\u8BF7\u5BF9\u6587\u672C\u8FDB\u884C\u7CBE\u4FEE\u6DA6\u8272\uFF0C\u4F18\u5316\u63AA\u8F9E\u3001\u8282\u594F\u548C\u8868\u8FBE\u529B\uFF0C\u4FDD\u6301\u539F\u6587\u7684\u6838\u5FC3\u610F\u601D\u548C\u98CE\u683C\u3002"
        });
        if (!result) {
          throw new Error("AI \u7CBE\u4FEE\u8FD4\u56DE\u4E86\u7A7A\u7ED3\u679C");
        }
        Logger.info("AI \u7CBE\u4FEE\u5B8C\u6210");
        return { success: true, text: result };
      } catch (error) {
        Logger.error("AI \u7CBE\u4FEE\u5931\u8D25", error);
        return { success: false, error: error.message || "AI \u7CBE\u4FEE\u5931\u8D25" };
      }
    }
  });
  Tools.register("novelide:expand_text", {
    description: "AI \u6269\u5199\uFF0C\u5C06\u7B80\u77ED\u5185\u5BB9\u6269\u5C55\u4E3A\u66F4\u8BE6\u7EC6\u7684\u63CF\u5199",
    parameters: {
      type: "object",
      properties: {
        content: { type: "string", description: "\u9700\u8981\u6269\u5199\u7684\u6587\u672C\u5185\u5BB9" },
        workId: { type: "string", description: "\u4F5C\u54C1ID" }
      },
      required: ["content"]
    },
    execute: async (params) => {
      const content = requireString(params.content, "content");
      try {
        const result = await Tools.Chat({
          messages: [{ role: "user", content: `\u8BF7\u5C06\u4EE5\u4E0B\u5185\u5BB9\u8FDB\u884C\u6269\u5199\uFF0C\u589E\u52A0\u7EC6\u8282\u63CF\u5199\u3001\u5FC3\u7406\u6D3B\u52A8\u3001\u73AF\u5883\u6E32\u67D3\uFF0C\u4F7F\u5185\u5BB9\u66F4\u52A0\u4E30\u5BCC\u9971\u6EE1\uFF1A
${content}` }],
          systemPrompt: "\u4F60\u662F\u4E00\u4E2A\u7F51\u6587\u5199\u4F5C\u52A9\u624B\uFF0C\u8BF7\u5BF9\u6587\u672C\u8FDB\u884C\u6269\u5199\uFF0C\u6DFB\u52A0\u751F\u52A8\u7684\u7EC6\u8282\u63CF\u5199\u3001\u4EBA\u7269\u5FC3\u7406\u3001\u73AF\u5883\u6C1B\u56F4\u7B49\uFF0C\u4F7F\u5185\u5BB9\u66F4\u52A0\u4E30\u6EE1\u6709\u5C42\u6B21\u3002"
        });
        if (!result) {
          throw new Error("AI \u6269\u5199\u8FD4\u56DE\u4E86\u7A7A\u7ED3\u679C");
        }
        Logger.info("AI \u6269\u5199\u5B8C\u6210");
        return { success: true, text: result };
      } catch (error) {
        Logger.error("AI \u6269\u5199\u5931\u8D25", error);
        return { success: false, error: error.message || "AI \u6269\u5199\u5931\u8D25" };
      }
    }
  });
  Tools.register("novelide:deai_flavor", {
    description: "\u53BB\u9664 AI \u75D5\u8FF9\uFF0C\u8BA9\u6587\u672C\u66F4\u81EA\u7136\u3001\u66F4\u6709\u4EBA\u5473",
    parameters: {
      type: "object",
      properties: {
        content: { type: "string", description: "\u9700\u8981\u53BB AI \u5473\u7684\u6587\u672C\u5185\u5BB9" },
        workId: { type: "string", description: "\u4F5C\u54C1ID" }
      },
      required: ["content"]
    },
    execute: async (params) => {
      const content = requireString(params.content, "content");
      try {
        const result = await Tools.Chat({
          messages: [{ role: "user", content: `\u8BF7\u6539\u5199\u4EE5\u4E0B\u6587\u672C\uFF0C\u53BB\u9664AI\u751F\u6210\u7684\u75D5\u8FF9\uFF0C\u8BA9\u8BED\u8A00\u66F4\u81EA\u7136\u3001\u66F4\u53E3\u8BED\u5316\u3001\u66F4\u6709\u4EBA\u5473\uFF1A
${content}` }],
          systemPrompt: "\u4F60\u662F\u4E00\u4E2A\u8D44\u6DF1\u7F51\u6587\u4F5C\u8005\uFF0C\u8BF7\u6539\u5199\u6587\u672C\u4F7F\u5176\u8BFB\u8D77\u6765\u50CF\u771F\u4EBA\u5199\u7684\uFF0C\u907F\u514DAI\u5E38\u89C1\u7684\u5957\u8DEF\u5316\u8868\u8FBE\u3001\u8FC7\u5EA6\u4FEE\u9970\u548C\u751F\u786C\u8F6C\u6298\uFF0C\u4F7F\u7528\u66F4\u81EA\u7136\u7684\u53E3\u8BED\u5316\u8868\u8FBE\u3002"
        });
        if (!result) {
          throw new Error("AI \u53BB\u5473\u8FD4\u56DE\u4E86\u7A7A\u7ED3\u679C");
        }
        Logger.info("AI \u53BB\u5473\u5B8C\u6210");
        return { success: true, text: result };
      } catch (error) {
        Logger.error("AI \u53BB\u5473\u5931\u8D25", error);
        return { success: false, error: error.message || "AI \u53BB\u5473\u5931\u8D25" };
      }
    }
  });
  Tools.register("novelide:check_pleasure", {
    description: "\u68C0\u67E5\u6587\u672C\u4E2D\u7684\u723D\u70B9\u8BBE\u8BA1\uFF0C\u5206\u6790\u8282\u594F\u548C\u8BFB\u8005\u4F53\u9A8C",
    parameters: {
      type: "object",
      properties: {
        content: { type: "string", description: "\u9700\u8981\u68C0\u67E5\u7684\u6587\u672C\u5185\u5BB9" },
        workId: { type: "string", description: "\u4F5C\u54C1ID" }
      },
      required: ["content"]
    },
    execute: async (params) => {
      const content = requireString(params.content, "content");
      try {
        const result = await Tools.Chat({
          messages: [{ role: "user", content: `\u8BF7\u5206\u6790\u4EE5\u4E0B\u7F51\u6587\u5185\u5BB9\u7684\u723D\u70B9\u8BBE\u8BA1\uFF0C\u5305\u62EC\uFF1A
1. \u662F\u5426\u6709\u660E\u663E\u7684\u723D\u70B9\u548C\u9AD8\u6F6E
2. \u8282\u594F\u662F\u5426\u5408\u7406
3. \u8BFB\u8005\u7684\u60C5\u7EEA\u5F15\u5BFC\u662F\u5426\u5230\u4F4D
4. \u6539\u8FDB\u5EFA\u8BAE

\u5185\u5BB9\uFF1A
${content}` }],
          systemPrompt: "\u4F60\u662F\u4E00\u4E2A\u7F51\u6587\u7F16\u8F91\u4E13\u5BB6\uFF0C\u64C5\u957F\u5206\u6790\u7F51\u6587\u7684\u723D\u70B9\u8BBE\u8BA1\u3001\u8282\u594F\u628A\u63A7\u548C\u8BFB\u8005\u4F53\u9A8C\u3002\u8BF7\u4ECE\u4E13\u4E1A\u89D2\u5EA6\u7ED9\u51FA\u5206\u6790\u548C\u6539\u8FDB\u5EFA\u8BAE\u3002"
        });
        if (!result) {
          throw new Error("AI \u723D\u70B9\u68C0\u67E5\u8FD4\u56DE\u4E86\u7A7A\u7ED3\u679C");
        }
        Logger.info("AI \u723D\u70B9\u68C0\u67E5\u5B8C\u6210");
        return { success: true, text: result };
      } catch (error) {
        Logger.error("AI \u723D\u70B9\u68C0\u67E5\u5931\u8D25", error);
        return { success: false, error: error.message || "AI \u723D\u70B9\u68C0\u67E5\u5931\u8D25" };
      }
    }
  });
  Tools.register("novelide:detect_water", {
    description: "\u68C0\u6D4B\u6587\u672C\u4E2D\u7684\u6C34\u6587\u5185\u5BB9\uFF0C\u8BC6\u522B\u5197\u4F59\u548C\u65E0\u6548\u63CF\u5199",
    parameters: {
      type: "object",
      properties: {
        content: { type: "string", description: "\u9700\u8981\u68C0\u6D4B\u7684\u6587\u672C\u5185\u5BB9" },
        workId: { type: "string", description: "\u4F5C\u54C1ID" }
      },
      required: ["content"]
    },
    execute: async (params) => {
      const content = requireString(params.content, "content");
      try {
        const result = await Tools.Chat({
          messages: [{ role: "user", content: `\u8BF7\u68C0\u6D4B\u4EE5\u4E0B\u6587\u672C\u4E2D\u7684\u6C34\u6587\u5185\u5BB9\uFF0C\u6807\u8BB0\u51FA\uFF1A
1. \u5197\u4F59\u91CD\u590D\u7684\u63CF\u5199
2. \u65E0\u6548\u7684\u8FC7\u6E21\u6BB5\u843D
3. \u4E0E\u4E3B\u7EBF\u65E0\u5173\u7684\u5E9F\u8BDD
4. \u6CE8\u6C34\u5ACC\u7591\u7684\u6BB5\u843D
5. \u6574\u4F53\u6C34\u6587\u6BD4\u4F8B\u8BC4\u4F30

\u5185\u5BB9\uFF1A
${content}` }],
          systemPrompt: "\u4F60\u662F\u4E00\u4E2A\u4E25\u683C\u7684\u7F51\u6587\u8D28\u68C0\u7F16\u8F91\uFF0C\u64C5\u957F\u8BC6\u522B\u6C34\u6587\u3001\u6CE8\u6C34\u5185\u5BB9\u3002\u8BF7\u9010\u6BB5\u5206\u6790\uFF0C\u6807\u8BB0\u51FA\u5197\u4F59\u548C\u65E0\u6548\u5185\u5BB9\uFF0C\u5E76\u7ED9\u51FA\u7CBE\u7B80\u5EFA\u8BAE\u3002"
        });
        if (!result) {
          throw new Error("AI \u6C34\u6587\u68C0\u6D4B\u8FD4\u56DE\u4E86\u7A7A\u7ED3\u679C");
        }
        Logger.info("AI \u6C34\u6587\u68C0\u6D4B\u5B8C\u6210");
        return { success: true, text: result };
      } catch (error) {
        Logger.error("AI \u6C34\u6587\u68C0\u6D4B\u5931\u8D25", error);
        return { success: false, error: error.message || "AI \u6C34\u6587\u68C0\u6D4B\u5931\u8D25" };
      }
    }
  });
  Tools.register("novelide:generate_title", {
    description: "AI \u751F\u6210\u7206\u6B3E\u6807\u9898\uFF0C\u6839\u636E\u5185\u5BB9\u751F\u6210\u5438\u5F15\u8BFB\u8005\u7684\u6807\u9898",
    parameters: {
      type: "object",
      properties: {
        content: { type: "string", description: "\u7AE0\u8282\u6216\u4F5C\u54C1\u7684\u5185\u5BB9\u6458\u8981" },
        genre: { type: "string", description: "\u4F5C\u54C1\u7C7B\u578B\uFF08\u5982\uFF1A\u90FD\u5E02\u3001\u7384\u5E7B\u3001\u60AC\u7591\uFF09" },
        workId: { type: "string", description: "\u4F5C\u54C1ID" }
      },
      required: ["content"]
    },
    execute: async (params) => {
      const content = requireString(params.content, "content");
      const { genre = "" } = params;
      try {
        const genreHint = genre ? `\uFF0C\u4F5C\u54C1\u7C7B\u578B\u4E3A\u300C${genre}\u300D` : "";
        const result = await Tools.Chat({
          messages: [{ role: "user", content: `\u8BF7\u6839\u636E\u4EE5\u4E0B\u5185\u5BB9\u751F\u62105\u4E2A\u7206\u6B3E\u6807\u9898${genreHint}\uFF0C\u8981\u6C42\u5438\u5F15\u773C\u7403\u3001\u5F15\u53D1\u597D\u5947\u5FC3\u3001\u9002\u5408\u7F51\u6587\u5E73\u53F0\uFF1A
${content}` }],
          systemPrompt: "\u4F60\u662F\u4E00\u4E2A\u7F51\u6587\u6807\u9898\u7B56\u5212\u4E13\u5BB6\uFF0C\u64C5\u957F\u521B\u4F5C\u5438\u5F15\u8BFB\u8005\u70B9\u51FB\u7684\u7206\u6B3E\u6807\u9898\u3002\u8BF7\u751F\u6210\u6709\u51B2\u51FB\u529B\u3001\u60AC\u5FF5\u611F\u548C\u5438\u5F15\u529B\u7684\u6807\u9898\u3002"
        });
        if (!result) {
          throw new Error("AI \u6807\u9898\u751F\u6210\u8FD4\u56DE\u4E86\u7A7A\u7ED3\u679C");
        }
        Logger.info("AI \u6807\u9898\u751F\u6210\u5B8C\u6210");
        return { success: true, text: result };
      } catch (error) {
        Logger.error("AI \u6807\u9898\u751F\u6210\u5931\u8D25", error);
        return { success: false, error: error.message || "AI \u6807\u9898\u751F\u6210\u5931\u8D25" };
      }
    }
  });
}

// src/packages/novel_io.ts
function registerTools5() {
  Tools.register("novelide:import_file", {
    description: "\u5BFC\u5165\u6587\u4EF6\uFF08\u652F\u6301 TXT/Markdown/JSON \u683C\u5F0F\uFF09",
    parameters: {
      type: "object",
      properties: {
        uri: { type: "string", description: "\u6587\u4EF6URI" },
        fileName: { type: "string", description: "\u6587\u4EF6\u540D" },
        workId: { type: "string", description: "\u76EE\u6807\u4F5C\u54C1ID\uFF08\u53EF\u9009\uFF09" }
      },
      required: ["uri", "fileName"]
    },
    execute: async (params) => {
      const uri = requireString(params.uri, "uri");
      const fileName = requireString(params.fileName, "fileName");
      const { workId = "" } = params;
      try {
        const result = await safeNativeJsonCall("importFile", [uri, fileName, workId]);
        Logger.info(`\u5BFC\u5165\u6587\u4EF6\u6210\u529F: ${fileName}`);
        return { success: true, result };
      } catch (error) {
        Logger.error("\u5BFC\u5165\u6587\u4EF6\u5931\u8D25", error);
        return { success: false, error: error.message || "\u5BFC\u5165\u6587\u4EF6\u5931\u8D25" };
      }
    }
  });
  Tools.register("novelide:export_work_txt", {
    description: "\u5C06\u4F5C\u54C1\u5BFC\u51FA\u4E3A TXT \u683C\u5F0F",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "\u4F5C\u54C1ID" }
      },
      required: ["workId"]
    },
    execute: async (params) => {
      const workId = requireString(params.workId, "workId");
      try {
        const result = await safeNativeJsonCall("exportWorkTxt", [workId]);
        Logger.info(`\u5BFC\u51FA TXT \u6210\u529F: ${workId}`);
        return { success: true, result };
      } catch (error) {
        Logger.error("\u5BFC\u51FA TXT \u5931\u8D25", error);
        return { success: false, error: error.message || "\u5BFC\u51FA TXT \u5931\u8D25" };
      }
    }
  });
  Tools.register("novelide:export_work_md", {
    description: "\u5C06\u4F5C\u54C1\u5BFC\u51FA\u4E3A Markdown \u683C\u5F0F",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "\u4F5C\u54C1ID" }
      },
      required: ["workId"]
    },
    execute: async (params) => {
      const workId = requireString(params.workId, "workId");
      try {
        const result = await safeNativeJsonCall("exportWorkMd", [workId]);
        Logger.info(`\u5BFC\u51FA Markdown \u6210\u529F: ${workId}`);
        return { success: true, result };
      } catch (error) {
        Logger.error("\u5BFC\u51FA Markdown \u5931\u8D25", error);
        return { success: false, error: error.message || "\u5BFC\u51FA Markdown \u5931\u8D25" };
      }
    }
  });
  Tools.register("novelide:export_work_json", {
    description: "\u5C06\u4F5C\u54C1\u5BFC\u51FA\u4E3A JSON \u683C\u5F0F",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "\u4F5C\u54C1ID" }
      },
      required: ["workId"]
    },
    execute: async (params) => {
      const workId = requireString(params.workId, "workId");
      try {
        const result = await safeNativeJsonCall("exportWorkJson", [workId]);
        Logger.info(`\u5BFC\u51FA JSON \u6210\u529F: ${workId}`);
        return { success: true, result };
      } catch (error) {
        Logger.error("\u5BFC\u51FA JSON \u5931\u8D25", error);
        return { success: false, error: error.message || "\u5BFC\u51FA JSON \u5931\u8D25" };
      }
    }
  });
}

// src/packages/novel_stats.ts
function registerTools6() {
  Tools.register("novelide:get_writing_stats", {
    description: "\u83B7\u53D6\u5199\u4F5C\u7EDF\u8BA1\uFF08\u603B\u5B57\u6570\u3001\u4ECA\u65E5\u5B57\u6570\u3001\u8FDE\u7EED\u5929\u6570\u3001\u76EE\u6807\u5B8C\u6210\u5EA6\uFF09",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "\u4F5C\u54C1ID" }
      },
      required: ["workId"]
    },
    execute: async (params) => {
      const workId = requireString(params.workId, "workId");
      try {
        const stats = await safeNativeJsonCall("getWritingStats", [workId]);
        return { success: true, stats };
      } catch (error) {
        Logger.error("\u83B7\u53D6\u5199\u4F5C\u7EDF\u8BA1\u5931\u8D25", error);
        return { success: false, error: error.message || "\u83B7\u53D6\u5199\u4F5C\u7EDF\u8BA1\u5931\u8D25", stats: {} };
      }
    }
  });
  Tools.register("novelide:get_chapter_stats", {
    description: "\u83B7\u53D6\u6307\u5B9A\u4F5C\u54C1\u7684\u7AE0\u8282\u7EDF\u8BA1\u4FE1\u606F",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "\u4F5C\u54C1ID" }
      },
      required: ["workId"]
    },
    execute: async (params) => {
      const workId = requireString(params.workId, "workId");
      try {
        const stats = await safeNativeJsonCall("getChapterStats", [workId]);
        return { success: true, stats };
      } catch (error) {
        Logger.error("\u83B7\u53D6\u7AE0\u8282\u7EDF\u8BA1\u5931\u8D25", error);
        return { success: false, error: error.message || "\u83B7\u53D6\u7AE0\u8282\u7EDF\u8BA1\u5931\u8D25", stats: {} };
      }
    }
  });
  Tools.register("novelide:get_daily_stats", {
    description: "\u83B7\u53D6\u6BCF\u65E5\u5199\u4F5C\u7EDF\u8BA1\u6570\u636E",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "\u4F5C\u54C1ID" },
        days: { type: "number", description: "\u67E5\u8BE2\u5929\u6570\uFF08\u9ED8\u8BA430\u5929\uFF09" }
      },
      required: ["workId"]
    },
    execute: async (params) => {
      const workId = requireString(params.workId, "workId");
      const { days = 30 } = params;
      try {
        const stats = await safeNativeJsonCall("getDailyStats", [workId, days]);
        return { success: true, stats };
      } catch (error) {
        Logger.error("\u83B7\u53D6\u6BCF\u65E5\u7EDF\u8BA1\u5931\u8D25", error);
        return { success: false, error: error.message || "\u83B7\u53D6\u6BCF\u65E5\u7EDF\u8BA1\u5931\u8D25", stats: {} };
      }
    }
  });
}

// src/packages/novel_agents.ts
var AGENT_CONFIGS = {
  outline: {
    id: "outline",
    name: "\u5927\u7EB2\u751F\u6210\u5668",
    description: "\u751F\u6210\u7ED3\u6784\u6E05\u6670\u7684\u5927\u7EB2",
    systemPrompt: `\u4F60\u662F\u4E00\u4E2A\u4E13\u4E1A\u7684\u5927\u7EB2\u751F\u6210\u52A9\u624B\u3002\u8BF7\u6839\u636E\u7528\u6237\u63D0\u4F9B\u7684\u521B\u610F\u751F\u6210\u8BE6\u7EC6\u7684\u5C0F\u8BF4\u5927\u7EB2\u3002

\u5927\u7EB2\u5E94\u5305\u542B\uFF1A
1. \u6838\u5FC3\u8BBE\u5B9A\uFF08\u4E16\u754C\u89C2\u3001\u4E3B\u89D2\u3001\u91D1\u624B\u6307\uFF09
2. \u4E3B\u7EBF\u5267\u60C5\uFF08\u8D77\u627F\u8F6C\u5408\uFF09
3. \u4E3B\u8981\u914D\u89D2\u8BBE\u5B9A
4. \u5173\u952E\u8F6C\u6298\u70B9
5. \u723D\u70B9\u8BBE\u8BA1

\u8BF7\u4EE5\u7ED3\u6784\u5316\u7684\u683C\u5F0F\u8F93\u51FA\u3002`
  },
  character: {
    id: "character",
    name: "\u89D2\u8272\u8BBE\u8BA1\u5E08",
    description: "\u751F\u6210\u8BE6\u7EC6\u7684\u89D2\u8272\u8BBE\u5B9A\u5361",
    systemPrompt: `\u4F60\u662F\u4E00\u4E2A\u4E13\u4E1A\u7684\u89D2\u8272\u8BBE\u8BA1\u5E08\u3002\u8BF7\u6839\u636E\u7528\u6237\u63D0\u4F9B\u7684\u4FE1\u606F\u751F\u6210\u8BE6\u7EC6\u7684\u89D2\u8272\u8BBE\u5B9A\u5361\u3002

\u89D2\u8272\u5361\u5E94\u5305\u542B\uFF1A
1. \u57FA\u672C\u4FE1\u606F\uFF08\u59D3\u540D\u3001\u5E74\u9F84\u3001\u6027\u522B\u3001\u5916\u8C8C\uFF09
2. \u6027\u683C\u7279\u70B9\uFF08\u4F18\u70B9\u3001\u7F3A\u70B9\u3001\u53E3\u5934\u7985\uFF09
3. \u80CC\u666F\u6545\u4E8B
4. \u80FD\u529B/\u6280\u80FD
5. \u4EBA\u9645\u5173\u7CFB
6. \u6210\u957F\u5F27\u7EBF

\u8BF7\u4EE5 JSON \u683C\u5F0F\u8F93\u51FA\u3002`
  },
  pleasure: {
    id: "pleasure",
    name: "\u723D\u70B9\u68C0\u67E5\u5668",
    description: "\u5206\u6790\u723D\u70B9\u5BC6\u5EA6\u548C\u8282\u594F",
    systemPrompt: `\u4F60\u662F\u4E00\u4E2A\u7F51\u6587\u723D\u70B9\u5206\u6790\u4E13\u5BB6\u3002\u8BF7\u5206\u6790\u7528\u6237\u63D0\u4F9B\u7684\u6587\u672C\u7684\u723D\u70B9\u5206\u5E03\u3002

\u5206\u6790\u7EF4\u5EA6\uFF1A
1. \u723D\u70B9\u7C7B\u578B\uFF08\u6253\u8138/\u9006\u88AD/\u63ED\u79D8/\u5347\u7EA7\u7B49\uFF09
2. \u723D\u70B9\u5F3A\u5EA6\uFF081-5 \u5206\uFF09
3. \u723D\u70B9\u5BC6\u5EA6\uFF08\u6BCF\u5343\u5B57\u723D\u70B9\u6570\uFF09
4. \u8282\u594F\u628A\u63A7
5. \u6539\u8FDB\u5EFA\u8BAE

\u8BF7\u4EE5 JSON \u683C\u5F0F\u8F93\u51FA\u5206\u6790\u7ED3\u679C\u3002`
  },
  water: {
    id: "water",
    name: "\u6C34\u6587\u68C0\u6D4B\u5668",
    description: "\u68C0\u6D4B\u51D1\u5B57\u6570/\u91CD\u590D\u5185\u5BB9",
    systemPrompt: `\u4F60\u662F\u4E00\u4E2A\u7F51\u6587\u8D28\u91CF\u68C0\u6D4B\u4E13\u5BB6\u3002\u8BF7\u68C0\u6D4B\u7528\u6237\u63D0\u4F9B\u7684\u6587\u672C\u662F\u5426\u5B58\u5728"\u6C34\u6587"\u95EE\u9898\u3002

\u68C0\u6D4B\u7EF4\u5EA6\uFF1A
1. \u91CD\u590D\u5570\u55E6\u7684\u8868\u8FBE
2. \u65E0\u610F\u4E49\u7684\u586B\u5145\u8BCD
3. \u62D6\u6C93\u7684\u60C5\u8282
4. \u7F3A\u4E4F\u4FE1\u606F\u91CF\u7684\u6BB5\u843D
5. \u603B\u4F53\u8D28\u91CF\u8BC4\u5206

\u8BF7\u4EE5 JSON \u683C\u5F0F\u8F93\u51FA\u68C0\u6D4B\u7ED3\u679C\u548C\u4FEE\u6539\u5EFA\u8BAE\u3002`
  },
  title: {
    id: "title",
    name: "\u7206\u6B3E\u6807\u9898\u5668",
    description: "\u751F\u6210\u6709\u60AC\u5FF5\u611F\u7684\u6807\u9898",
    systemPrompt: `\u4F60\u662F\u4E00\u4E2A\u7206\u6B3E\u6807\u9898\u751F\u6210\u4E13\u5BB6\u3002\u8BF7\u6839\u636E\u7528\u6237\u63D0\u4F9B\u7684\u5185\u5BB9\u751F\u6210\u5438\u5F15\u4EBA\u7684\u6807\u9898\u3002

\u8981\u6C42\uFF1A
1. \u6709\u60AC\u5FF5\u611F
2. \u7B26\u5408\u7F51\u6587\u98CE\u683C
3. \u7A81\u51FA\u6838\u5FC3\u5356\u70B9
4. 10-20 \u5B57\u4EE5\u5185

\u8BF7\u751F\u6210 5 \u4E2A\u5907\u9009\u6807\u9898\uFF0C\u5E76\u8BF4\u660E\u6BCF\u4E2A\u6807\u9898\u7684\u5356\u70B9\u3002`
  },
  deai: {
    id: "deai",
    name: "\u53BBAI\u5473\u5904\u7406\u5668",
    description: "\u6D88\u9664AI\u673A\u68B0\u611F",
    systemPrompt: `\u4F60\u662F\u4E00\u4E2A\u6587\u672C\u6539\u5199\u4E13\u5BB6\u3002\u8BF7\u5BF9\u7528\u6237\u63D0\u4F9B\u7684\u6587\u672C\u8FDB\u884C\u6539\u5199\uFF0C\u53BB\u9664 AI \u751F\u6210\u7684\u75D5\u8FF9\u3002

\u6539\u5199\u8981\u6C42\uFF1A
1. \u4F7F\u7528\u66F4\u81EA\u7136\u7684\u8868\u8FBE
2. \u589E\u52A0\u53E3\u8BED\u5316\u8868\u8FBE
3. \u907F\u514D\u8FC7\u4E8E\u5DE5\u6574\u7684\u53E5\u5F0F
4. \u52A0\u5165\u4E2A\u6027\u5316\u8868\u8FBE
5. \u4FDD\u6301\u539F\u610F\u4E0D\u53D8

\u8BF7\u76F4\u63A5\u8F93\u51FA\u6539\u5199\u540E\u7684\u6587\u672C\u3002`
  },
  polish: {
    id: "polish",
    name: "\u6587\u672C\u7CBE\u4FEE\u5668",
    description: "8\u7EF4\u5EA6\u7CBE\u4FEE\u6587\u672C",
    systemPrompt: `\u4F60\u662F\u4E00\u4E2A\u4E13\u4E1A\u7684\u6587\u672C\u7CBE\u4FEE\u4E13\u5BB6\u3002\u8BF7\u4ECE\u4EE5\u4E0B 8 \u4E2A\u7EF4\u5EA6\u5BF9\u7528\u6237\u63D0\u4F9B\u7684\u6587\u672C\u8FDB\u884C\u7CBE\u4FEE\uFF1A

1. \u8BED\u8A00\u6D41\u7545\u5EA6
2. \u903B\u8F91\u8FDE\u8D2F\u6027
3. \u7EC6\u8282\u4E30\u5BCC\u5EA6
4. \u60C5\u611F\u8868\u8FBE\u529B
5. \u573A\u666F\u753B\u9762\u611F
6. \u4EBA\u7269\u5851\u9020
7. \u8282\u594F\u628A\u63A7
8. \u6587\u5B66\u6027

\u8BF7\u8F93\u51FA\u7CBE\u4FEE\u540E\u7684\u6587\u672C\uFF0C\u5E76\u8BF4\u660E\u4E3B\u8981\u4FEE\u6539\u70B9\u3002`
  }
};
var NovelAgentDispatcher = class {
  /**
   * 调用子 Agent
   */
  static async dispatch(agentId, task, context) {
    const agent = AGENT_CONFIGS[agentId];
    if (!agent) {
      throw new Error(`\u672A\u77E5\u7684 Agent: ${agentId}`);
    }
    let fullPrompt = task;
    if (context == null ? void 0 : context.workTitle) {
      fullPrompt = `\u4F5C\u54C1\uFF1A${context.workTitle}
${fullPrompt}`;
    }
    if (context == null ? void 0 : context.chapterTitle) {
      fullPrompt = `\u7AE0\u8282\uFF1A${context.chapterTitle}
${fullPrompt}`;
    }
    try {
      const result = await Tools.Chat({
        messages: [{ role: "user", content: fullPrompt }],
        systemPrompt: agent.systemPrompt
      });
      if (!result) {
        throw new Error(`Agent ${agentId} \u8FD4\u56DE\u4E86\u7A7A\u7ED3\u679C`);
      }
      return result;
    } catch (error) {
      Logger.error(`Agent ${agentId} \u8C03\u7528\u5931\u8D25`, error);
      throw error;
    }
  }
  /**
   * 获取所有 Agent 列表
   */
  static getAgents() {
    return Object.values(AGENT_CONFIGS).map((agent) => ({
      id: agent.id,
      name: agent.name,
      description: agent.description
    }));
  }
};
function registerTools7() {
  Tools.register("novelide:dispatch_subagent", {
    description: "\u8C03\u7528\u5B50 Agent \u5904\u7406\u4EFB\u52A1",
    parameters: {
      type: "object",
      properties: {
        agentId: {
          type: "string",
          description: "Agent ID\uFF08outline/character/pleasure/water/title/deai/polish\uFF09"
        },
        task: { type: "string", description: "\u4EFB\u52A1\u63CF\u8FF0" },
        workId: { type: "string", description: "\u4F5C\u54C1ID\uFF08\u53EF\u9009\uFF09" }
      },
      required: ["agentId", "task"]
    },
    execute: async (params) => {
      const { agentId, task, workId } = params;
      const context = {};
      if (workId) {
        try {
          const works = await safeNativeJsonCall("getNovelWorks", []);
          const work = works.find((w) => w.id === workId);
          if (work) {
            context.workTitle = work.title;
          }
        } catch (e) {
          Logger.warn("\u83B7\u53D6\u4F5C\u54C1\u4E0A\u4E0B\u6587\u5931\u8D25", e);
        }
      }
      try {
        const result = await NovelAgentDispatcher.dispatch(agentId, task, context);
        Logger.info(`Agent ${agentId} \u8C03\u5EA6\u6210\u529F`);
        return { success: true, result };
      } catch (error) {
        Logger.error(`Agent ${agentId} \u8C03\u5EA6\u5931\u8D25`, error);
        return { success: false, error: error.message || "Agent \u8C03\u5EA6\u5931\u8D25" };
      }
    }
  });
  Tools.register("novelide:review_chapter", {
    description: "AI \u5BA1\u6838\u7AE0\u8282\u8D28\u91CF",
    parameters: {
      type: "object",
      properties: {
        chapterId: { type: "string", description: "\u7AE0\u8282ID" },
        workId: { type: "string", description: "\u4F5C\u54C1ID" }
      },
      required: ["chapterId"]
    },
    execute: async (params) => {
      var _a, _b;
      const { chapterId, workId } = params;
      try {
        const content = await Tools.callNative("getChapterContent", [chapterId]);
        const [pleasureResult, waterResult, polishResult] = await Promise.all([
          NovelAgentDispatcher.dispatch("pleasure", content),
          NovelAgentDispatcher.dispatch("water", content),
          NovelAgentDispatcher.dispatch("polish", content)
        ]);
        return {
          success: true,
          review: {
            pleasure: (_a = safeJsonParse(pleasureResult)) != null ? _a : { raw: pleasureResult },
            water: (_b = safeJsonParse(waterResult)) != null ? _b : { raw: waterResult },
            polish: polishResult
          }
        };
      } catch (error) {
        Logger.error("\u7AE0\u8282\u5BA1\u6838\u5931\u8D25", error);
        return { success: false, error: error.message || "\u7AE0\u8282\u5BA1\u6838\u5931\u8D25" };
      }
    }
  });
}

// src/main.ts
var NOVEL_BASE_ROUTE = "toolpkg:com.operit.novelide:ui";
function registerToolPkg() {
  ToolPkg.registerNavigationEntry({
    id: "novel_works_sidebar",
    route: `${NOVEL_BASE_ROUTE}:novel_works`,
    surface: "main_sidebar_plugins",
    title: { zh: "\u6211\u7684\u4F5C\u54C1", en: "My Works" },
    icon: Icons.Book,
    order: 120
  });
  ToolPkg.registerNavigationEntry({
    id: "novel_editor_sidebar",
    route: `${NOVEL_BASE_ROUTE}:novel_editor`,
    surface: "main_sidebar_plugins",
    title: { zh: "\u5199\u4F5C\u7F16\u8F91\u5668", en: "Novel Editor" },
    icon: Icons.Edit,
    order: 130
  });
  ToolPkg.registerNavigationEntry({
    id: "novel_materials_sidebar",
    route: `${NOVEL_BASE_ROUTE}:novel_materials`,
    surface: "main_sidebar_plugins",
    title: { zh: "\u8D44\u6599\u7BA1\u7406", en: "Materials" },
    icon: Icons.FolderSpecial,
    order: 140
  });
  ToolPkg.registerNavigationEntry({
    id: "novel_outline_sidebar",
    route: `${NOVEL_BASE_ROUTE}:novel_outline`,
    surface: "main_sidebar_plugins",
    title: { zh: "\u5927\u7EB2\u7BA1\u7406", en: "Outline" },
    icon: Icons.List,
    order: 150
  });
  ToolPkg.registerNavigationEntry({
    id: "novel_stats_sidebar",
    route: `${NOVEL_BASE_ROUTE}:novel_stats`,
    surface: "main_sidebar_plugins",
    title: { zh: "\u5199\u4F5C\u7EDF\u8BA1", en: "Statistics" },
    icon: Icons.BarChart,
    order: 160
  });
  ToolPkg.registerNavigationEntry({
    id: "novel_tools_sidebar",
    route: `${NOVEL_BASE_ROUTE}:novel_tools`,
    surface: "main_sidebar_plugins",
    title: { zh: "\u5199\u4F5C\u5DE5\u5177", en: "Tools" },
    icon: Icons.AutoFixHigh,
    order: 170
  });
  ToolPkg.registerNavigationEntry({
    id: "novel_workspace_sidebar",
    route: `${NOVEL_BASE_ROUTE}:novel_workspace`,
    surface: "main_sidebar_plugins",
    title: { zh: "\u5DE5\u4F5C\u533A", en: "Workspace" },
    icon: Icons.Workspaces,
    order: 180
  });
  ToolPkg.registerNavigationEntry({
    id: "novel_io_sidebar",
    route: `${NOVEL_BASE_ROUTE}:novel_io`,
    surface: "main_sidebar_plugins",
    title: { zh: "\u5BFC\u5165\u5BFC\u51FA", en: "Import/Export" },
    icon: Icons.ImportExport,
    order: 190
  });
  ToolPkg.registerNavigationEntry({
    id: "novel_relationship_sidebar",
    route: `${NOVEL_BASE_ROUTE}:novel_relationship`,
    surface: "main_sidebar_plugins",
    title: { zh: "\u89D2\u8272\u5173\u7CFB\u56FE", en: "Relationships" },
    icon: Icons.AccountTree,
    order: 200
  });
  ToolPkg.registerNavigationEntry({
    id: "novel_tomato_sidebar",
    route: `${NOVEL_BASE_ROUTE}:novel_tomato`,
    surface: "main_sidebar_plugins",
    title: { zh: "\u756A\u8304\u949F", en: "Pomodoro" },
    icon: Icons.Timer,
    order: 210
  });
  ToolPkg.registerNavigationEntry({
    id: "novel_agents_sidebar",
    route: `${NOVEL_BASE_ROUTE}:novel_agents`,
    surface: "main_sidebar_plugins",
    title: { zh: "AI Agent", en: "AI Agents" },
    icon: Icons.SmartToy,
    order: 220
  });
  ToolPkg.registerNavigationEntry({
    id: "novel_skills_sidebar",
    route: `${NOVEL_BASE_ROUTE}:novel_skills`,
    surface: "main_sidebar_plugins",
    title: { zh: "\u98CE\u683C Skill", en: "Style Skills" },
    icon: Icons.AutoAwesome,
    order: 230
  });
  ToolPkg.registerUiRoute({
    id: "novel_works",
    route: `${NOVEL_BASE_ROUTE}:novel_works`,
    runtime: "compose_dsl",
    screen: Screen,
    params: {},
    title: { zh: "\u6211\u7684\u4F5C\u54C1", en: "My Works" }
  });
  ToolPkg.registerUiRoute({
    id: "novel_editor",
    route: `${NOVEL_BASE_ROUTE}:novel_editor`,
    runtime: "compose_dsl",
    screen: Screen2,
    params: { workId: "string" },
    title: { zh: "\u5199\u4F5C\u7F16\u8F91\u5668", en: "Novel Editor" }
  });
  ToolPkg.registerUiRoute({
    id: "novel_materials",
    route: `${NOVEL_BASE_ROUTE}:novel_materials`,
    runtime: "compose_dsl",
    screen: Screen3,
    params: { workId: "string" },
    title: { zh: "\u8D44\u6599\u7BA1\u7406", en: "Materials" }
  });
  ToolPkg.registerUiRoute({
    id: "novel_outline",
    route: `${NOVEL_BASE_ROUTE}:novel_outline`,
    runtime: "compose_dsl",
    screen: Screen4,
    params: { workId: "string" },
    title: { zh: "\u5927\u7EB2\u7BA1\u7406", en: "Outline" }
  });
  ToolPkg.registerUiRoute({
    id: "novel_stats",
    route: `${NOVEL_BASE_ROUTE}:novel_stats`,
    runtime: "compose_dsl",
    screen: Screen5,
    params: {},
    title: { zh: "\u5199\u4F5C\u7EDF\u8BA1", en: "Statistics" }
  });
  ToolPkg.registerUiRoute({
    id: "novel_tools",
    route: `${NOVEL_BASE_ROUTE}:novel_tools`,
    runtime: "compose_dsl",
    screen: Screen6,
    params: {},
    title: { zh: "\u5199\u4F5C\u5DE5\u5177", en: "Tools" }
  });
  ToolPkg.registerUiRoute({
    id: "novel_workspace",
    route: `${NOVEL_BASE_ROUTE}:novel_workspace`,
    runtime: "compose_dsl",
    screen: Screen7,
    params: {},
    title: { zh: "\u5DE5\u4F5C\u533A", en: "Workspace" }
  });
  ToolPkg.registerUiRoute({
    id: "novel_io",
    route: `${NOVEL_BASE_ROUTE}:novel_io`,
    runtime: "compose_dsl",
    screen: Screen8,
    params: { workId: "string" },
    title: { zh: "\u5BFC\u5165\u5BFC\u51FA", en: "Import/Export" }
  });
  ToolPkg.registerUiRoute({
    id: "novel_relationship",
    route: `${NOVEL_BASE_ROUTE}:novel_relationship`,
    runtime: "compose_dsl",
    screen: Screen9,
    params: { workId: "string" },
    title: { zh: "\u89D2\u8272\u5173\u7CFB\u56FE", en: "Relationships" }
  });
  ToolPkg.registerUiRoute({
    id: "novel_tomato",
    route: `${NOVEL_BASE_ROUTE}:novel_tomato`,
    runtime: "compose_dsl",
    screen: Screen10,
    params: {},
    title: { zh: "\u756A\u8304\u949F", en: "Pomodoro" }
  });
  ToolPkg.registerUiRoute({
    id: "novel_agents",
    route: `${NOVEL_BASE_ROUTE}:novel_agents`,
    runtime: "compose_dsl",
    screen: Screen11,
    params: {},
    title: { zh: "AI Agent", en: "AI Agents" }
  });
  ToolPkg.registerUiRoute({
    id: "novel_skills",
    route: `${NOVEL_BASE_ROUTE}:novel_skills`,
    runtime: "compose_dsl",
    screen: Screen12,
    params: {},
    title: { zh: "\u98CE\u683C Skill", en: "Style Skills" }
  });
  registerTools();
  registerTools2();
  registerTools3();
  registerTools4();
  registerTools5();
  registerTools6();
  registerTools7();
  return true;
}
