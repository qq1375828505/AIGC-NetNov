// 番茄钟页面 - 增强版：声音提醒、脉冲动画、计时记录

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
  const [pulseAnimation, setPulseAnimation] = ctx.useState("pulseAnimation", false);
  const [showCompleteDialog, setShowCompleteDialog] = ctx.useState("showCompleteDialog", false);
  const [lastCompletedPreset, setLastCompletedPreset] = ctx.useState("lastCompletedPreset", "");
  const [soundEnabled, setSoundEnabled] = ctx.useState("soundEnabled", true);
  const [totalFocusMinutes, setTotalFocusMinutes] = ctx.useState("totalFocusMinutes", 0);

  // 加载预设列表
  async function loadPresets() {
    try {
      const result = await Tools.callNative("getTomatoPresets", []);
      const list = typeof result === "string" ? JSON.parse(result) : result;
      setPresets(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("加载番茄预设失败:", error);
    }
  }

  // 播放提示音
  function playNotificationSound(type: "work" | "rest" | "warning") {
    if (!soundEnabled) return;
    try {
      // 使用 Web Audio API 生成提示音
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // 根据类型设置不同的音调
      switch (type) {
        case "work":
          oscillator.frequency.value = 800; // 高音
          oscillator.type = "sine";
          break;
        case "rest":
          oscillator.frequency.value = 400; // 低音
          oscillator.type = "sine";
          break;
        case "warning":
          oscillator.frequency.value = 600; // 中音
          oscillator.type = "square";
          break;
      }
      
      gainNode.gain.value = 0.3;
      oscillator.start();
      
      // 播放时长
      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
      }, type === "warning" ? 200 : 500);
    } catch (e) {
      console.log("音频播放失败:", e);
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
      setPulseAnimation(false);
    } else {
      // 开始
      if (remainingSeconds <= 0) return;
      const ref = setInterval(() => {
        setRemainingSeconds((prev: number) => {
          if (prev <= 1) {
            clearInterval(ref);
            setIsRunning(false);
            setTimerRef(null);
            setPulseAnimation(false);
            onTimerComplete();
            return 0;
          }
          // 最后10秒警告音
          if (prev <= 11 && prev > 1) {
            playNotificationSound("warning");
            setPulseAnimation(true);
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
      // 工作阶段结束
      const preset = presets[selectedPreset];
      const presetName = preset?.name || `${WORK_MINUTES}分钟`;
      const duration = preset?.minutes || WORK_MINUTES;
      
      const newCount = tomatoCount + 1;
      setTomatoCount(newCount);
      setTodayCount(todayCount + 1);
      setTotalFocusMinutes(prev => prev + duration);
      setLastCompletedPreset(presetName);
      
      // 播放工作完成音
      playNotificationSound("work");
      
      // 记录番茄完成
      try {
        Tools.callNative("recordTomatoComplete", ["", presetName, duration]);
      } catch (e) {
        console.log("记录番茄失败:", e);
      }
      
      // 显示完成对话框
      setShowCompleteDialog(true);
      
      // 进入休息阶段
      setIsWorkPhase(false);
      setTotalSeconds(REST_MINUTES * 60);
      setRemainingSeconds(REST_MINUTES * 60);
    } else {
      // 休息阶段结束
      playNotificationSound("rest");
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
    setPulseAnimation(false);
    const preset = presets[selectedPreset];
    const minutes = preset?.minutes || WORK_MINUTES;
    setTotalSeconds(minutes * 60);
    setRemainingSeconds(minutes * 60);
  }

  // 跳过当前阶段
  function skipPhase() {
    if (timerRef) {
      clearInterval(timerRef);
      setTimerRef(null);
    }
    setIsRunning(false);
    setPulseAnimation(false);
    
    if (isWorkPhase) {
      // 跳过工作，进入休息
      setIsWorkPhase(false);
      setTotalSeconds(REST_MINUTES * 60);
      setRemainingSeconds(REST_MINUTES * 60);
    } else {
      // 跳过休息，进入工作
      setIsWorkPhase(true);
      const preset = presets[selectedPreset];
      const minutes = preset?.minutes || WORK_MINUTES;
      setTotalSeconds(minutes * 60);
      setRemainingSeconds(minutes * 60);
    }
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
  const phaseIcon = isWorkPhase ? "edit_note" : "self_improvement";

  // 顶部栏
  const topBar = UI.TopAppBar({
    title: "番茄钟",
    actions: [
      UI.IconButton({
        icon: soundEnabled ? "volume_up" : "volume_off",
        onClick: () => setSoundEnabled(!soundEnabled),
        tooltip: soundEnabled ? "关闭声音" : "开启声音"
      }),
      UI.IconButton({
        icon: "refresh",
        onClick: resetTimer,
        tooltip: "重置"
      })
    ]
  });

  // 完成对话框
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
        UI.Text({ text: "番茄完成!", style: "headlineSmall", color: colors.tertiary }),
        UI.Text({ text: `完成了一个 ${lastCompletedPreset} 的专注`, style: "bodyMedium", color: colors.onSurfaceVariant }),
        UI.Text({ text: `今日已完成 ${todayCount} 个番茄`, style: "bodySmall", color: colors.outline }),
        UI.Button({
          onClick: () => setShowCompleteDialog(false),
          modifier: UI.Modifier.fillMaxWidth()
        }, "继续努力")
      ]))
    ]);
  }

  // 计时器显示区域（增强版动画）
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
        modifier: UI.Modifier
          .background(
            pulseAnimation 
              ? `${progressColor}15` 
              : "transparent",
            120
          )
          .animateContentSize()
      }, [
        // 外圈光晕效果
        UI.Box({
          width: 220,
          height: 220,
          contentAlignment: "center",
          modifier: UI.Modifier
            .background(
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
              text: `总计 ${formatTime(totalSeconds)}`,
              style: "bodySmall",
              color: colors.onSurfaceVariant
            })
          ])
        ])
      ]),

      // 倒计时警告（最后10秒，带脉冲动画）
      isRunning && remainingSeconds <= 10 && remainingSeconds > 0
        ? UI.Row({
            spacing: 8,
            verticalAlignment: "center",
            modifier: UI.Modifier.animatePulse()
          }, [
            UI.Icon({ name: "warning", size: 16, tint: colors.error }),
            UI.Text({
              text: `${remainingSeconds} 秒后完成`,
              style: "labelLarge",
              color: colors.error
            })
          ])
        : null,

      // 控制按钮组
      UI.Row({
        spacing: 12,
        horizontalArrangement: "center"
      }, [
        UI.Button({
          onClick: resetTimer,
          variant: "outlined",
          modifier: UI.Modifier.weight(1)
        }, "重置"),
        UI.Button({
          onClick: toggleTimer,
          enabled: remainingSeconds > 0,
          modifier: UI.Modifier
            .weight(2)
            .animateScale(isRunning ? 1.02 : 1.0)
        }, isRunning ? "暂停" : "开始"),
        UI.Button({
          onClick: skipPhase,
          variant: "outlined",
          modifier: UI.Modifier.weight(1)
        }, "跳过")
      ])
    ].filter(Boolean))
  ]);

  // 番茄计数统计（增强版）
  const statsArea = UI.Card({
    modifier: UI.Modifier.padding(16).fillMaxWidth(),
    background: colors.surfaceVariant
  }, UI.Column({ padding: 16, spacing: 12 }, [
    UI.Text({ text: "今日统计", style: "titleSmall", color: colors.onSurface }),
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
          text: `${Math.floor(totalFocusMinutes / 60)}h${totalFocusMinutes % 60}m`,
          style: "headlineMedium",
          color: colors.secondary
        }),
        UI.Text({
          text: "累计专注",
          style: "bodySmall",
          color: colors.onSurfaceVariant
        })
      ])
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
    ]),
    renderCompleteDialog()
  ]);
}
