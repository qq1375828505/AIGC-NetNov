// 番茄钟页面 - 专注写作计时器

import type { ComposeDslContext, ComposeNode } from "../../../../types/compose-dsl";

export default function TomatoPage(ctx: ComposeDslContext): ComposeNode {
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

  // 加载预设列表
  async function loadPresets() {
    try {
      const result = await window.NativeBridge.getTomatoPresets();
      const list = JSON.parse(result);
      setPresets(list);
    } catch (error) {
      console.error("加载番茄预设失败:", error);
    }
  }

  // 格式化时间 MM:SS
  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  // 计算进度百分比
  function getProgress(): number {
    if (totalSeconds === 0) return 0;
    return (totalSeconds - remainingSeconds) / totalSeconds;
  }

  // 选择预设
  function selectPreset(index: number) {
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

  // 开始/暂停
  function toggleTimer() {
    if (isRunning) {
      // 暂停
      if (timerRef) {
        clearInterval(timerRef);
        setTimerRef(null);
      }
      setIsRunning(false);
    } else {
      // 开始
      if (remainingSeconds <= 0) return;
      const ref = setInterval(() => {
        setRemainingSeconds((prev: number) => {
          if (prev <= 1) {
            clearInterval(ref);
            setIsRunning(false);
            setTimerRef(null);
            onTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setTimerRef(ref);
      setIsRunning(true);
    }
  }

  // 计时完成
  function onTimerComplete() {
    if (isWorkPhase) {
      // 工作阶段结束，进入休息
      const newCount = tomatoCount + 1;
      setTomatoCount(newCount);
      setTodayCount(todayCount + 1);
      setIsWorkPhase(false);
      setTotalSeconds(REST_MINUTES * 60);
      setRemainingSeconds(REST_MINUTES * 60);
    } else {
      // 休息阶段结束，回到工作
      setIsWorkPhase(true);
      const preset = presets[selectedPreset];
      const minutes = preset?.minutes || WORK_MINUTES;
      setTotalSeconds(minutes * 60);
      setRemainingSeconds(minutes * 60);
    }
  }

  // 重置
  function resetTimer() {
    if (timerRef) {
      clearInterval(timerRef);
      setTimerRef(null);
    }
    setIsRunning(false);
    setIsWorkPhase(true);
    const preset = presets[selectedPreset];
    const minutes = preset?.minutes || WORK_MINUTES;
    setTotalSeconds(minutes * 60);
    setRemainingSeconds(minutes * 60);
  }

  // 初始化
  ctx.useEffect(() => {
    loadPresets();
    return () => {
      if (timerRef) clearInterval(timerRef);
    };
  }, []);

  // 进度条颜色
  const progressColor = isWorkPhase ? colors.primary : colors.tertiary;
  const phaseLabel = isWorkPhase ? "专注写作" : "休息一下";

  // 顶部栏
  const topBar = UI.TopAppBar({
    title: "番茄钟",
    actions: [
      UI.IconButton({
        icon: "refresh",
        onClick: resetTimer
      })
    ]
  });

  // 计时器显示区域
  const timerArea = UI.Box({
    fillMaxWidth: true,
    padding: 32,
    contentAlignment: "center"
  }, [
    UI.Column({
      horizontalAlignment: "center",
      spacing: 16
    }, [
      // 阶段标签
      UI.Text({
        text: phaseLabel,
        style: "titleMedium",
        color: progressColor
      }),

      // 倒计时圆环
      UI.Box({
        width: 200,
        height: 200,
        contentAlignment: "center"
      }, [
        UI.CircularProgressIndicator({
          progress: getProgress(),
          size: 200,
          color: progressColor,
          trackColor: colors.surfaceVariant,
          strokeWidth: 8
        }),
        UI.Column({
          horizontalAlignment: "center",
          spacing: 4
        }, [
          UI.Text({
            text: formatTime(remainingSeconds),
            style: "displaySmall",
            color: colors.onSurface
          }),
          UI.Text({
            text: `总计 ${formatTime(totalSeconds)}`,
            style: "bodySmall",
            color: colors.onSurfaceVariant
          })
        ])
      ]),

      // 控制按钮
      UI.Row({
        spacing: 16,
        horizontalArrangement: "center"
      }, [
        UI.Button({
          onClick: resetTimer,
          variant: "outlined"
        }, "重置"),
        UI.Button({
          onClick: toggleTimer,
          enabled: remainingSeconds > 0,
          modifier: UI.Modifier.paddingHorizontal(16)
        }, isRunning ? "暂停" : "开始"),
      ])
    ])
  ]);

  // 番茄计数统计
  const statsArea = UI.Card({
    modifier: UI.Modifier.padding(16).fillMaxWidth(),
    background: colors.surfaceVariant
  }, UI.Row({
    fillMaxWidth: true,
    padding: 16,
    horizontalArrangement: "space-around"
  }, [
    UI.Column({ horizontalAlignment: "center" }, [
      UI.Text({
        text: `${todayCount}`,
        style: "headlineMedium",
        color: colors.primary
      }),
      UI.Text({
        text: "今日番茄",
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
        text: "本次番茄",
        style: "bodySmall",
        color: colors.onSurfaceVariant
      })
    ]),
    UI.Column({ horizontalAlignment: "center" }, [
      UI.Text({
        text: `${Math.floor((tomatoCount * WORK_MINUTES) / 60)}h${(tomatoCount * WORK_MINUTES) % 60}m`,
        style: "headlineMedium",
        color: colors.secondary
      }),
      UI.Text({
        text: "累计专注",
        style: "bodySmall",
        color: colors.onSurfaceVariant
      })
    ])
  ]));

  // 预设选择区域
  const presetsArea = UI.Column({
    fillMaxWidth: true,
    paddingHorizontal: 16,
    spacing: 8
  }, [
    UI.Text({
      text: "番茄预设",
      style: "titleSmall",
      color: colors.onSurface,
      modifier: UI.Modifier.paddingBottom(4)
    }),
    UI.LazyRow({
      horizontalArrangement: 8
    }, presets.map((preset: any, index: number) =>
      UI.Card({
        modifier: UI.Modifier
          .clickable(() => selectPreset(index))
          .padding(4),
        background: index === selectedPreset ? colors.primaryContainer : colors.surface
      }, UI.Column({
        padding: 12,
        horizontalAlignment: "center",
        spacing: 4
      }, [
        UI.Text({
          text: preset.name || `${preset.minutes || 25}分钟`,
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

  // 主布局
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
    ])
  ]);
}
