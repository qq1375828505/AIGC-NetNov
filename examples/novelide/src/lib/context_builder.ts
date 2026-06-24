/**
 * 上下文管理器 - 组装章节上下文供AI使用
 * 从 NativeBridge 获取作品、章节、角色、设定、大纲等数据，
 * 拼装为统一的 ChapterContext，再格式化为 AI prompt 文本。
 */

export interface ChapterContext {
  workTitle: string;
  volumeName: string;
  chapterTitle: string;
  chapterContent: string;
  previousChapters: string[];
  characterProfiles: any[];
  settingProfiles: any[];
  outlineNodes: any[];
}

export class ContextBuilder {
  private workId: string;

  constructor(workId: string) {
    this.workId = workId;
  }

  async buildChapterContext(chapterId: string): Promise<ChapterContext> {
    const ctx: ChapterContext = {
      workTitle: "",
      volumeName: "",
      chapterTitle: "",
      chapterContent: "",
      previousChapters: [],
      characterProfiles: [],
      settingProfiles: [],
      outlineNodes: [],
    };

    try {
      const worksRaw = await Tools.callNative("getNovelWorks", []);
      const works = JSON.parse(worksRaw);
      const work = works.find((w: any) => w.id === this.workId);
      if (work) {
        ctx.workTitle = work.title || "";
      }
    } catch (e) {
      console.warn("[ContextBuilder] 获取作品信息失败:", e);
    }

    try {
      const chapterRaw = await Tools.callNative("getChapterContent", [chapterId]);
      if (chapterRaw) {
        const chapter = JSON.parse(chapterRaw);
        ctx.chapterTitle = chapter.title || "";
        ctx.chapterContent = chapter.content || "";
        ctx.volumeName = chapter.volumeName || "";
      }
    } catch (e) {
      console.warn("[ContextBuilder] 获取章节内容失败:", e);
    }

    try {
      const prevRaw = await Tools.callNative("getPreviousChapters", [chapterId, 3]);
      if (prevRaw) {
        const prevChapters = JSON.parse(prevRaw);
        ctx.previousChapters = prevChapters.map((ch: any) => ch.content || "");
      }
    } catch (e) {
      console.warn("[ContextBuilder] 获取前文章节失败:", e);
    }

    try {
      const charsRaw = await Tools.callNative("getCharacterProfiles", [this.workId]);
      if (charsRaw) {
        ctx.characterProfiles = JSON.parse(charsRaw);
      }
    } catch (e) {
      console.warn("[ContextBuilder] 获取角色设定失败:", e);
    }

    try {
      const settingsRaw = await Tools.callNative("getSettingProfiles", [this.workId]);
      if (settingsRaw) {
        ctx.settingProfiles = JSON.parse(settingsRaw);
      }
    } catch (e) {
      console.warn("[ContextBuilder] 获取场景设定失败:", e);
    }

    try {
      const outlineRaw = await Tools.callNative("getOutlineNodes", [this.workId]);
      if (outlineRaw) {
        ctx.outlineNodes = JSON.parse(outlineRaw);
      }
    } catch (e) {
      console.warn("[ContextBuilder] 获取大纲节点失败:", e);
    }

    return ctx;
  }

  formatForAI(context: ChapterContext): string {
    let prompt = `作品：${context.workTitle}\n`;
    prompt += `卷：${context.volumeName}\n`;
    prompt += `章节：${context.chapterTitle}\n\n`;

    if (context.previousChapters.length > 0) {
      prompt += `前文内容：\n${context.previousChapters.join("\n---\n")}\n\n`;
    }

    if (context.characterProfiles.length > 0) {
      prompt += `角色设定：\n`;
      context.characterProfiles.forEach((c: any) => {
        prompt += `- ${c.name}: ${c.description}\n`;
      });
      prompt += "\n";
    }

    if (context.settingProfiles.length > 0) {
      prompt += `场景设定：\n`;
      context.settingProfiles.forEach((s: any) => {
        prompt += `- ${s.name}: ${s.description}\n`;
      });
      prompt += "\n";
    }

    if (context.outlineNodes.length > 0) {
      prompt += `大纲要点：\n`;
      context.outlineNodes.forEach((n: any) => {
        prompt += `- ${n.title || n.content}\n`;
      });
      prompt += "\n";
    }

    prompt += `当前章节内容：\n${context.chapterContent}`;

    return prompt;
  }
}
