// 导入导出页面 - 支持 TXT/Markdown/JSON 格式的导入导出及备份恢复

import type { ComposeDslContext, ComposeNode } from "../../../../types/compose-dsl";

export default function IOPage(ctx: ComposeDslContext): ComposeNode {
  const { UI } = ctx;
  const colors = ctx.MaterialTheme.colorScheme;

  const [importing, setImporting] = ctx.useState("importing", false);
  const [exporting, setExporting] = ctx.useState("exporting", false);
  const [backing, setBacking] = ctx.useState("backing", false);
  const [restoring, setRestoring] = ctx.useState("restoring", false);
  const [message, setMessage] = ctx.useState("message", "");
  const [selectedFormat, setSelectedFormat] = ctx.useState("selectedFormat", "txt");

  function showMessage(msg: string) {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  }

  // 导入文件
  async function importFile() {
    setImporting(true);
    try {
      // 注意：实际使用时需要从文件选择器获取 uri 和 fileName
      // 这里暂时使用空字符串作为占位符
      const result = await window.NativeBridge.importFile("", "", "");
      if (result) {
        showMessage("导入成功");
      }
    } catch (error) {
      console.error("导入失败:", error);
      showMessage("导入失败: " + (error as Error).message);
    } finally {
      setImporting(false);
    }
  }

  // 导出文件
  async function exportFile() {
    setExporting(true);
    try {
      let result;
      switch (selectedFormat) {
        case "txt":
          result = await window.NativeBridge.exportWorkTxt("");
          break;
        case "md":
          result = await window.NativeBridge.exportWorkMd("");
          break;
        case "json":
          result = await window.NativeBridge.exportWorkJson("");
          break;
        default:
          result = await window.NativeBridge.exportWorkTxt("");
      }
      if (result) {
        showMessage("导出成功");
      }
    } catch (error) {
      console.error("导出失败:", error);
      showMessage("导出失败: " + (error as Error).message);
    } finally {
      setExporting(false);
    }
  }

  // 备份数据（暂用 JSON 导出代替）
  async function backupData() {
    setBacking(true);
    try {
      const result = await window.NativeBridge.exportWorkJson("");
      if (result) {
        showMessage("备份成功");
      }
    } catch (error) {
      console.error("备份失败:", error);
      showMessage("备份失败: " + (error as Error).message);
    } finally {
      setBacking(false);
    }
  }

  // 恢复数据（暂用导入代替）
  async function restoreData() {
    setRestoring(true);
    try {
      // 注意：实际使用时需要从文件选择器获取 uri 和 fileName
      // 这里暂时使用空字符串作为占位符
      const result = await window.NativeBridge.importFile("", "", "");
      if (result) {
        showMessage("恢复成功");
      }
    } catch (error) {
      console.error("恢复失败:", error);
      showMessage("恢复失败: " + (error as Error).message);
    } finally {
      setRestoring(false);
    }
  }

  // 格式选项卡片
  function formatCard(format: string, title: string, subtitle: string, icon: string) {
    const isSelected = selectedFormat === format;
    return UI.Card({
      modifier: UI.Modifier
        .padding(4)
        .clickable(() => setSelectedFormat(format)),
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
      isSelected
        ? UI.Icon({ name: "check_circle", size: 20, tint: colors.primary })
        : null
    ]));
  }

  // 操作按钮
  function actionButton(
    label: string,
    icon: string,
    onClick: () => void,
    loading: boolean,
    color?: string
  ) {
    return UI.Button({
      onClick,
      enabled: !loading,
      modifier: UI.Modifier.fillMaxWidth().padding(vertical: 4),
      background: color || colors.primary
    }, loading ? `${label}中...` : `${icon === "upload" ? "↑" : icon === "download" ? "↓" : icon === "backup" ? "↗" : "↙"} ${label}`);
  }

  return UI.Box({ fillMaxSize: true }, [
    UI.TopAppBar({ title: "导入导出" }),

    UI.LazyColumn({
      fillMaxSize: true,
      contentPadding: 16,
      verticalArrangement: 8
    }, [
      // 提示消息
      message
        ? UI.Card({
            background: colors.tertiaryContainer,
            modifier: UI.Modifier.padding(bottom: 8)
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
          ]))
        : null,

      // 格式选择
      UI.Text({ text: "选择格式", style: "titleMedium", modifier: UI.Modifier.padding(vertical: 8) }),
      formatCard("txt", "TXT 纯文本", "通用文本格式，兼容性最好", "description"),
      formatCard("md", "Markdown", "支持标题、加粗等格式标记", "text_format"),
      formatCard("json", "JSON", "保留完整结构化数据", "data_object"),

      // 导入导出操作
      UI.Text({ text: "导入导出", style: "titleMedium", modifier: UI.Modifier.padding(top: 16, bottom: 8) }),
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
            actionButton("导入文件", "upload", importFile, importing, colors.primary)
          ]),
          UI.Box({ weight: 1 }, [
            actionButton("导出文件", "download", exportFile, exporting, colors.secondary)
          ])
        ])
      ])),

      // 备份恢复
      UI.Text({ text: "备份与恢复", style: "titleMedium", modifier: UI.Modifier.padding(top: 16, bottom: 8) }),
      UI.Card({
        modifier: UI.Modifier.padding(4)
      }, UI.Column({
        padding: 16,
        spacing: 8
      }, [
        UI.Text({
          text: "备份将保存所有作品数据，恢复将从备份文件中还原",
          style: "bodySmall",
          color: colors.onSurfaceVariant
        }),
        UI.Row({
          fillMaxWidth: true,
          spacing: 8
        }, [
          UI.Box({ weight: 1 }, [
            actionButton("备份数据", "backup", backupData, backing, colors.tertiary)
          ]),
          UI.Box({ weight: 1 }, [
            actionButton("恢复数据", "restore", restoreData, restoring, colors.error)
          ])
        ])
      ]))
    ])
  ]);
}
