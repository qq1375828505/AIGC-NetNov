"use strict";
// 写作统计页面 - 展示字数统计、写作天数、目标完成度和每日字数图表
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = StatsPage;
function StatsPage(ctx) {
    const { UI } = ctx;
    const colors = ctx.MaterialTheme.colorScheme;
    const params = ctx.routeParams ?? {};
    const workId = params.workId ?? "";
    const [stats, setStats] = ctx.useState("stats", {
        totalWords: 0,
        todayWords: 0,
        continuousDays: 0,
        dailyGoal: 2000,
        dailyHistory: []
    });
    const [loading, setLoading] = ctx.useState("loading", true);
    async function loadStats() {
        setLoading(true);
        try {
            const result = await window.NativeBridge.getWritingStats(workId);
            const data = typeof result === "string" ? JSON.parse(result) : result;
            setStats({
                totalWords: data.totalWords ?? 0,
                todayWords: data.todayWords ?? 0,
                continuousDays: data.continuousDays ?? 0,
                dailyGoal: data.dailyGoal ?? 2000,
                dailyHistory: data.dailyHistory ?? []
            });
        }
        catch (error) {
            console.error("加载统计数据失败:", error);
        }
        finally {
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
    // 统计卡片
    function statCard(icon, label, value, tint) {
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
            UI.Text({ text: label, style: "bodySmall", color: colors.onSurfaceVariant })
        ]));
    }
    // 目标进度条
    function goalProgressBar() {
        return UI.Card({
            modifier: UI.Modifier.padding(12, 8).fillMaxWidth()
        }, UI.Column({ padding: 16, spacing: 12 }, [
            UI.Row({ fillMaxWidth: true, horizontalArrangement: "space-between" }, [
                UI.Text({ text: "今日目标", style: "titleMedium" }),
                UI.Text({ text: `${stats.todayWords} / ${stats.dailyGoal} 字`, style: "bodyMedium", color: colors.onSurfaceVariant })
            ]),
            UI.LinearProgressIndicator({
                progress: goalProgress,
                color: goalPercent >= 100 ? colors.tertiary : colors.primary,
                trackColor: colors.surfaceVariant,
                modifier: UI.Modifier.fillMaxWidth().height(8)
            }),
            UI.Text({
                text: goalPercent >= 100 ? "已完成今日目标!" : `已完成 ${goalPercent}%`,
                style: "bodySmall",
                color: goalPercent >= 100 ? colors.tertiary : colors.onSurfaceVariant
            })
        ]));
    }
    // 每日字数柱状图（简化版，使用 Box 模拟）
    function dailyChart() {
        const history = stats.dailyHistory.slice(-14); // 最近 14 天
        if (history.length === 0) {
            return UI.Card({
                modifier: UI.Modifier.padding(12, 8).fillMaxWidth()
            }, UI.Column({ padding: 16, spacing: 8 }, [
                UI.Text({ text: "每日字数", style: "titleMedium" }),
                UI.Box({ fillMaxWidth: true, height: 180, contentAlignment: "center" }, [
                    UI.Text({ text: "暂无写作记录", style: "bodyMedium", color: colors.onSurfaceVariant })
                ])
            ]));
        }
        const maxWords = Math.max(...history.map(d => d.words), 1);
        const bars = history.map((day) => {
            const ratio = day.words / maxWords;
            const barHeight = Math.max(ratio * 140, 2);
            const isToday = day.date === new Date().toISOString().slice(0, 10);
            return UI.Column({
                weight: 1,
                spacing: 4,
                contentAlignment: "bottom"
            }, [
                UI.Text({
                    text: day.words > 0 ? `${day.words}` : "",
                    style: "labelSmall",
                    color: colors.onSurfaceVariant,
                    maxLines: 1
                }),
                UI.Box({
                    fillMaxWidth: true,
                    height: barHeight,
                    background: isToday ? colors.primary : colors.primaryContainer,
                    cornerRadius: 4,
                    margin: { horizontal: 2 }
                }),
                UI.Text({
                    text: day.date.slice(5),
                    style: "labelSmall",
                    color: colors.onSurfaceVariant,
                    maxLines: 1
                })
            ]);
        });
        return UI.Card({
            modifier: UI.Modifier.padding(12, 8).fillMaxWidth()
        }, UI.Column({ padding: 16, spacing: 12 }, [
            UI.Text({ text: "每日字数（近 14 天）", style: "titleMedium" }),
            UI.Row({
                fillMaxWidth: true,
                height: 180,
                horizontalArrangement: "space-between",
                contentAlignment: "bottom"
            }, bars)
        ]));
    }
    // 主内容
    const content = loading
        ? UI.Box({ fillMaxSize: true, contentAlignment: "center" }, UI.CircularProgressIndicator())
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
            // 目标进度
            goalProgressBar(),
            // 每日字数图表
            dailyChart()
        ]);
    return UI.Box({ fillMaxSize: true }, [
        UI.TopAppBar({ title: "写作统计" }),
        content
    ]);
}
