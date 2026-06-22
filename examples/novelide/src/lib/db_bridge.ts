// NativeBridge 数据库桥接封装

export class NovelDBBridge {
  /**
   * 调用 NativeBridge 方法（统一通过 Tools.callNative）
   */
  static async callNative(method: string, args: any[]): Promise<any> {
    return Tools.callNative(method, args);
  }

  // ==================== 作品 ====================

  static async getNovelWorks(): Promise<any[]> {
    const result = await this.callNative("getNovelWorks", []);
    return JSON.parse(result);
  }

  static async createWork(title: string, genre: string = "", description: string = ""): Promise<string> {
    return await this.callNative("createWork", [title, genre, description]);
  }

  static async updateWork(work: any): Promise<boolean> {
    return await this.callNative("updateWork", [JSON.stringify(work)]);
  }

  static async deleteWork(workId: string): Promise<boolean> {
    return await this.callNative("deleteWork", [workId]);
  }

  // ==================== 章节 ====================

  static async getChapters(workId: string): Promise<any[]> {
    const result = await this.callNative("getChapters", [workId]);
    return JSON.parse(result);
  }

  static async createChapter(workId: string, title: string, order: number = 0): Promise<string> {
    return await this.callNative("createChapter", [workId, title, order]);
  }

  static async getChapterContent(chapterId: string): Promise<string> {
    return await this.callNative("getChapterContent", [chapterId]);
  }

  static async saveChapterContent(chapterId: string, content: string, wordCount: number): Promise<boolean> {
    return await this.callNative("saveChapterContent", [chapterId, content, wordCount]);
  }

  static async deleteChapter(chapterId: string): Promise<boolean> {
    return await this.callNative("deleteChapter", [chapterId]);
  }

  static async reorderChapters(workId: string, chapterIds: string[]): Promise<boolean> {
    return await this.callNative("reorderChapters", [workId, JSON.stringify(chapterIds)]);
  }

  // ==================== 资料 ====================

  static async getCharacters(workId: string): Promise<any[]> {
    const result = await this.callNative("getCharacters", [workId]);
    return JSON.parse(result);
  }

  static async createCharacter(workId: string, name: string, role: string = ""): Promise<string> {
    return await this.callNative("createCharacter", [workId, name, role]);
  }

  static async updateCharacter(character: any): Promise<boolean> {
    return await this.callNative("updateCharacter", [JSON.stringify(character)]);
  }

  static async deleteCharacter(characterId: string): Promise<boolean> {
    return await this.callNative("deleteCharacter", [characterId]);
  }

  // ... 其他资料类型类似
}
