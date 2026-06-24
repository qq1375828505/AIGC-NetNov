// 上下文构建器 - 为 AI 调用构建作品上下文

/**
 * 作品上下文
 */
export interface WorkContext {
  /** 纯文本上下文（用于 prompt 拼接） */
  text: string;
  /** 作品标题 */
  title?: string;
  /** 作品类型 */
  genre?: string;
  /** 作品描述 */
  description?: string;
}

/**
 * 章节上下文
 */
export interface ChapterContext extends WorkContext {
  /** 章节标题 */
  chapterTitle?: string;
  /** 章节内容 */
  chapterContent?: string;
  /** 章节序号 */
  chapterOrder?: number;
}

/**
 * 构建作品上下文
 * @param workId 作品 ID
 * @returns 作品上下文
 */
export async function buildWorkContext(workId?: string): Promise<WorkContext> {
  if (!workId) {
    return { text: "" };
  }

  try {
    const worksRaw = await Tools.callNative("getNovelWorks", []);
    const works = JSON.parse(worksRaw);
    const work = works.find((w: any) => w.id === workId);
    if (!work) {
      return { text: "" };
    }

    const parts: string[] = [];
    parts.push(`作品：${work.title}`);
    if (work.genre) parts.push(`类型：${work.genre}`);
    if (work.description) parts.push(`简介：${work.description}`);

    return {
      text: parts.join("\n"),
      title: work.title,
      genre: work.genre,
      description: work.description,
    };
  } catch (e) {
    console.warn("[NovelIDE] [WARN] 获取作品上下文失败:", e);
    return { text: "" };
  }
}

/**
 * 构建章节上下文
 * @param chapterId 章节 ID
 * @param workId 作品 ID（可选，用于附加作品信息）
 * @returns 章节上下文
 */
export async function buildChapterContext(
  chapterId: string,
  workId?: string
): Promise<ChapterContext> {
  const workCtx = await buildWorkContext(workId);

  try {
    const content = await Tools.callNative("getChapterContent", [chapterId]);
    const chaptersRaw = await Tools.callNative("getChapters", [workId || ""]);
    const chapters = JSON.parse(chaptersRaw);
    const chapter = chapters.find((c: any) => c.id === chapterId);

    const parts: string[] = workCtx.text ? [workCtx.text] : [];
    if (chapter?.title) parts.push(`章节：${chapter.title}`);

    return {
      ...workCtx,
      text: parts.join("\n"),
      chapterTitle: chapter?.title,
      chapterContent: typeof content === "string" ? content : JSON.stringify(content),
      chapterOrder: chapter?.order,
    };
  } catch (e) {
    console.warn("[NovelIDE] [WARN] 获取章节上下文失败:", e);
    return workCtx;
  }
}

/**
 * 构建角色上下文
 * @param workId 作品 ID
 * @param characterId 角色 ID（可选）
 * @returns 角色描述文本
 */
export async function buildCharacterContext(
  workId: string,
  characterId?: string
): Promise<string> {
  try {
    const charactersRaw = await Tools.callNative("getCharacters", [workId]);
    const characters = JSON.parse(charactersRaw);

    if (characterId) {
      const char = characters.find((c: any) => c.id === characterId);
      if (char) {
        return `角色：${char.name}（${char.role || "未指定"}）`;
      }
    }

    if (characters.length > 0) {
      const names = characters.map((c: any) => `${c.name}(${c.role || "?"})`).join("、");
      return `主要角色：${names}`;
    }
  } catch (e) {
    console.warn("[NovelIDE] [WARN] 获取角色上下文失败:", e);
  }

  return "";
}
