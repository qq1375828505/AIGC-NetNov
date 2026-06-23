// 写作统计页面 - 增强版：Chart.js风格图表、数据格式修复、更多统计维度

import type { ComposeDslContext, ComposeNode } from "../../../../types/compose-dsl";

export default function StatsPage(ctx: ComposeDslContext): ComposeNode {
  const { UI } = ctx;
  const colors = ctx.MaterialTheme.colorScheme;
  const params = ctx.routeParams ?? {};
  const workId = params.workId ?? "";

  const [stats, setStats] = ctx.useState("stats", {
    totalWords: 0,
    todayWords: 0,
    recentWords7d: 0,
    continuousDays: 0,
    dailyGoal: 2000,
    dailyHistory: [] as { date: string; words: number }[],
    totalChapters: 0,
    avgChapterWords: 0,
    statusCounts: {} as Record<string, number>,
    longestChapter: null as { title: string; wordCount: number } | null,
    shortestChapter: null as { title: string; wordCount: number } | null
  });
  const [loading, setLoading] = ctx.useState("loading", true);
  const [selectedPeriod, setSelectedPeriod] = ctx.useState("selectedPeriod", "7d");

  async function loadStats() {
    setLoading(true);
    try {
      const result = await Tools.callNative("getWritingStats", [workId]);
      const data = typeof result === "string" ? JSON.parse(result) : result;
      
      // 转换 dailyStats map 为 dailyHistory array
      const dailyStatsMap = data.dailyStats || {};
      const dailyHistory = Object.entries(dailyStatsMap)
        .map(([date, words]) => ({ date, words: Number(words) }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // 计算今日字数（从 dailyStats 中获取今天的）
      const today = new Date().toISOString().slice(0, 10);
      const todayWords = dailyStatsMap[today] || 0;

      // 计算连续写作天数
      let continuousDays = 0;
      const sortedDates = Object.keys(dailyStatsMap).sort().reverse();
      const now = new Date();
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
        totalWords: data.totalWords ?? 0,
        todayWords,
        recentWords7d: data.recentWords7d ?? 0,
        continuousDays,
        dailyGoal: data.dailyGoal ?? 2000,
        dailyHistory,
        totalChapters: data.totalChapters ?? 0,
        avgChapterWords: data.avgChapterWords ?? 0,
        statusCounts: data.statusCounts ?? {},
        longestChapter: data.longestChapter ?? null,
        shortestChapter: data.shortestChapter ?? null
      });
    } catch (error) {
      console.error("加载统计数据失败:", error);
    } finally {
      setLoading(false);
    }
  }

  ctx.useEffect(() => {
    loadStats();
  }, []);

  const goalProgress = stats.dailyGoal > 0
    ? Math.min(stats.todayWords / stats.dailyGoal, 1)
    : 0;
  const goalPercent = Math.round(goalProgress * 100);

  // 统计卡片（增强版，带图标背景）
  function statCard(icon: string, label: string, value: string, tint: string, subtitle?: string) {
    return UI.Card({
      modifier: UI.Modifier.padding(4).weight(1),
      background: colors.surfaceVariant
    }, UI.Column({
      padding: 16,
      spacing: 8,
      contentAlignment: "center"
    }, [
      UI.Icon({ name: icon, size: 28, tint, contentDescription: `${label}图标` }),
      UI.Text({ text: value, style: "headlineMedium", color: tint }),
      UI.Text({ text: label, style: "bodySmall", color: colors.onSurfaceVariant }),
      subtitle ? UI.Text({ text: subtitle, style: "labelSmall", color: colors.outline }) : null
    ].filter(Boolean)));
  }

  // 目标进度条（增强版，带动画效果）
  function goalProgressBar() {
    return UI.Card({
      modifier: UI.Modifier.padding(12, 8).fillMaxWidth()
    }, UI.Column({ padding: 16, spacing: 12 }, [
      UI.Row({ fillMaxWidth: true, horizontalArrangement: "space-between" }, [
        UI.Text({ text: "今日目标", style: "titleMedium" }),
        UI.Text({ text: `${stats.todayWords.toLocaleString()} / ${stats.dailyGoal.toLocaleString()} 字`, style: "bodyMedium", color: colors.onSurfaceVariant })
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
          text: goalPercent >= 100 ? "已完成今日目标!" : `已完成 ${goalPercent}%`,
          style: "bodySmall",
          color: goalPercent >= 100 ? colors.tertiary : colors.onSurfaceVariant
        }),
        UI.Text({
          text: `还剩 ${Math.max(0, stats.dailyGoal - stats.todayWords).toLocaleString()} 字`,
          style: "bodySmall",
          color: colors.outline
        })
      ])
    ]));
  }

  // Chart.js 风格柱状图
  function dailyChart() {
    const periodDays = selectedPeriod === "7d" ? 7 : selectedPeriod === "14d" ? 14 : 30;
    const history = stats.dailyHistory.slice(-periodDays);
    
    if (history.length === 0) {
      return UI.Card({
        modifier: UI.Modifier.padding(12, 8).fillMaxWidth()
      }, UI.Column({ padding: 16, spacing: 8 }, [
        UI.Text({ text: "每日字数", style: "titleMedium" }),
        UI.Box({ fillMaxWidth: true, height: 200, contentAlignment: "center" }, [
          UI.Text({ text: "暂无写作记录", style: "bodyMedium", color: colors.onSurfaceVariant })
        ])
      ]));
    }

    const maxWords = Math.max(...history.map(d => d.words), 1);
    const totalWords = history.reduce((sum, d) => sum + d.words, 0);
    const avgWords = Math.round(totalWords / history.length);

    return UI.Card({
      modifier: UI.Modifier.padding(12, 8).fillMaxWidth()
    }, UI.Column({ padding: 16, spacing: 12 }, [
      // 图表标题和周期选择
      UI.Row({ fillMaxWidth: true, horizontalArrangement: "space-between", verticalAlignment: "center" }, [
        UI.Text({ text: "每日字数", style: "titleMedium" }),
        UI.Row({ spacing: 4 }, [
          UI.Button({
            onClick: () => setSelectedPeriod("7d"),
            variant: selectedPeriod === "7d" ? "filled" : "text",
            compact: true
          }, "7天"),
          UI.Button({
            onClick: () => setSelectedPeriod("14d"),
            variant: selectedPeriod === "14d" ? "filled" : "text",
            compact: true
          }, "14天"),
          UI.Button({
            onClick: () => setSelectedPeriod("30d"),
            variant: selectedPeriod === "30d" ? "filled" : "text",
            compact: true
          }, "30天")
        ])
      ]),
      
      // 统计摘要
      UI.Row({ fillMaxWidth: true, horizontalArrangement: "space-around" }, [
        UI.Column({ horizontalAlignment: "center" }, [
          UI.Text({ text: totalWords.toLocaleString(), style: "titleSmall", color: colors.primary }),
          UI.Text({ text: "总字数", style: "labelSmall", color: colors.outline })
        ]),
        UI.Column({ horizontalAlignment: "center" }, [
          UI.Text({ text: avgWords.toLocaleString(), style: "titleSmall", color: colors.secondary }),
          UI.Text({ text: "日均", style: "labelSmall", color: colors.outline })
        ]),
        UI.Column({ horizontalAlignment: "center" }, [
          UI.Text({ text: Math.max(...history.map(d => d.words)).toLocaleString(), style: "titleSmall", color: colors.tertiary }),
          UI.Text({ text: "最高", style: "labelSmall", color: colors.outline })
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
          modifier: UI.Modifier.padding({left: 40})
        }, history.map((day) => {
          const ratio = day.words / maxWords;
          const barHeight = Math.max(ratio * 160, 2);
          const isToday = day.date === new Date().toISOString().slice(0, 10);
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
              background: isToday ? colors.primary : (isHigh ? colors.tertiaryContainer : colors.primaryContainer),
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

  // 章节状态分布图
  function chapterStatusChart() {
    const statusEntries = Object.entries(stats.statusCounts);
    if (statusEntries.length === 0) return null;

    const statusLabels: Record<string, string> = {
      "draft": "草稿",
      "writing": "写作中",
      "completed": "已完成",
      "revising": "修订中",
      "published": "已发布"
    };

    const statusColors: Record<string, string> = {
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
      UI.Text({ text: "章节状态分布", style: "titleMedium" }),
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
      }, statusEntries.map(([status, count]) => 
        UI.Column({ horizontalAlignment: "center" }, [
          UI.Text({ text: `${count}`, style: "labelLarge", color: statusColors[status] || colors.outline }),
          UI.Text({ text: statusLabels[status] || status, style: "labelSmall", color: colors.outline })
        ])
      ))
    ]));
  }

  // 写作效率指标
  function efficiencyMetrics() {
    const avgPerDay = stats.dailyHistory.length > 0 
      ? Math.round(stats.dailyHistory.reduce((sum, d) => sum + d.words, 0) / stats.dailyHistory.length)
      : 0;
    
    const daysWithWriting = stats.dailyHistory.filter(d => d.words > 0).length;
    const writingRate = stats.dailyHistory.length > 0 
      ? Math.round((daysWithWriting / stats.dailyHistory.length) * 100)
      : 0;

    return UI.Card({
      modifier: UI.Modifier.padding(12, 8).fillMaxWidth()
    }, UI.Column({ padding: 16, spacing: 12 }, [
      UI.Text({ text: "写作效率", style: "titleMedium" }),
      UI.Row({ fillMaxWidth: true, horizontalArrangement: "space-around" }, [
        UI.Column({ horizontalAlignment: "center" }, [
          UI.Text({ text: `${avgPerDay.toLocaleString()}`, style: "headlineSmall", color: colors.primary }),
          UI.Text({ text: "日均字数", style: "bodySmall", color: colors.outline })
        ]),
        UI.Column({ horizontalAlignment: "center" }, [
          UI.Text({ text: `${writingRate}%`, style: "headlineSmall", color: colors.secondary }),
          UI.Text({ text: "写作频率", style: "bodySmall", color: colors.outline })
        ]),
        UI.Column({ horizontalAlignment: "center" }, [
          UI.Text({ text: `${stats.continuousDays}`, style: "headlineSmall", color: colors.error }),
          UI.Text({ text: "连续天数", style: "bodySmall", color: colors.outline })
        ])
      ])
    ]));
  }

  // 主内容
  const content = loading
    ? UI.Box({ fillMaxSize: true, contentAlignment: "center" }, [
        UI.CircularProgressIndicator(),
        UI.Text({ text: "加载统计数据...", style: "bodySmall", color: colors.onSurfaceVariant })
      ])
    : UI.LazyColumn({
        fillMaxSize: true,
        contentPadding: 12,
        verticalArrangement: 8
      }, [
        // 顶部统计卡片行
        UI.Row({ fillMaxWidth: true, horizontalArrangement: 4 }, [
          statCard("edit_note", "总字数", stats.totalWords.toLocaleString(), colors.primary),
          statCard("today", "今日字数", stats.todayWords.toLocaleString(), colors.secondary)
        ]),
        UI.Row({ fillMaxWidth: true, horizontalArrangement: 4 }, [
          statCard("local_fire_department", "连续天数", `${stats.continuousDays} 天`, colors.error),
          statCard("emoji_events", "完成度", `${goalPercent}%`, colors.tertiary)
        ]),

        // 章节统计卡片
        UI.Row({ fillMaxWidth: true, horizontalArrangement: 4 }, [
          statCard("menu_book", "章节数", `${stats.totalChapters}`, colors.primary),
          statCard("analytics", "平均字数", stats.avgChapterWords.toLocaleString(), colors.secondary)
        ]),

        // 近7天字数
        UI.Row({ fillMaxWidth: true, horizontalArrangement: 4 }, [
          statCard("trending_up", "近7天", stats.recentWords7d.toLocaleString(), colors.tertiary, "字")
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
          UI.Text({ text: "最长章节", style: "labelMedium", color: colors.onSurfaceVariant }),
          UI.Text({ text: stats.longestChapter.title, style: "titleSmall" }),
          UI.Text({ text: `${stats.longestChapter.wordCount.toLocaleString()} 字`, style: "bodyMedium", color: colors.primary })
        ])) : null,

        stats.shortestChapter ? UI.Card({
          modifier: UI.Modifier.padding(12, 8).fillMaxWidth(),
          background: colors.surfaceVariant
        }, UI.Column({ padding: 16, spacing: 8 }, [
          UI.Text({ text: "最短章节", style: "labelMedium", color: colors.onSurfaceVariant }),
          UI.Text({ text: stats.shortestChapter.title, style: "titleSmall" }),
          UI.Text({ text: `${stats.shortestChapter.wordCount.toLocaleString()} 字`, style: "bodyMedium", color: colors.secondary })
        ])) : null,

        // 每日字数图表
        dailyChart()
      ].filter(Boolean));

  return UI.Box({ fillMaxSize: true }, [
    UI.TopAppBar({ 
      title: "写作统计",
      actions: [
        UI.IconButton({
          icon: "refresh",
          onClick: loadStats,
          contentDescription: "刷新统计数据"
        })
      ]
    }),
    content
  ]);
}
