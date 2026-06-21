// NativeBridge 初始化和 HTML 端调用封装

// 声明全局 NativeBridge 接口
declare global {
  interface Window {
    NativeBridge: {
      // 作品
      getNovelWorks(): string;
      createWork(title: string, genre: string, description: string): string;
      updateWork(workJson: string): boolean;
      deleteWork(workId: string): boolean;

      // 章节
      getChapters(workId: string): string;
      createChapter(workId: string, title: string, order: number): string;
      getChapterContent(chapterId: string): string;
      saveChapterContent(chapterId: string, content: string, wordCount: number): boolean;
      deleteChapter(chapterId: string): boolean;
      reorderChapters(workId: string, chapterIdsJson: string): boolean;

      // 资料
      getCharacters(workId: string): string;
      createCharacter(workId: string, name: string, role: string): string;
      updateCharacter(characterJson: string): boolean;
      deleteCharacter(characterId: string): boolean;

      getSettings(workId: string): string;
      createSetting(workId: string, name: string, content: string): string;
      updateSetting(settingJson: string): boolean;
      deleteSetting(settingId: string): boolean;

      getLocations(workId: string): string;
      createLocation(workId: string, name: string, description: string): string;
      updateLocation(locationJson: string): boolean;
      deleteLocation(locationId: string): boolean;

      getFactions(workId: string): string;
      createFaction(workId: string, name: string, leader: string): string;
      updateFaction(factionJson: string): boolean;
      deleteFaction(factionId: string): boolean;

      getItems(workId: string): string;
      createItem(workId: string, name: string, description: string): string;
      updateItem(itemJson: string): boolean;
      deleteItem(itemId: string): boolean;

      getPlotHooks(workId: string): string;
      createPlotHook(workId: string, content: string): string;
      updatePlotHook(hookJson: string): boolean;
      deletePlotHook(hookId: string): boolean;

      getReferences(workId: string): string;
      createReference(workId: string, title: string, content: string): string;
      updateReference(referenceJson: string): boolean;
      deleteReference(referenceId: string): boolean;

      getTodos(workId: string): string;
      createTodo(workId: string, content: string, priority: number): string;
      updateTodo(todoJson: string): boolean;
      deleteTodo(todoId: string): boolean;

      // 关系图
      getCharacterRelationships(workId: string): string;
      createCharacterRelationship(workId: string, sourceId: string, targetId: string, relationType: string): string;
      updateCharacterRelationship(relationshipJson: string): boolean;
      deleteCharacterRelationship(relationshipId: string): boolean;

      getNovelEvents(workId: string): string;
      createNovelEvent(workId: string, title: string, description: string): string;
      updateNovelEvent(eventJson: string): boolean;
      deleteNovelEvent(eventId: string): boolean;

      getEventParticipants(eventId: string): string;
      addEventParticipant(eventId: string, characterId: string, role: string): boolean;
      removeEventParticipant(eventId: string, characterId: string): boolean;

      // 番茄
      getTomatoPresets(): string;
      getTomatoPresetById(presetId: string): string;

      // 统计
      getWritingStats(workId: string): string;
    };
  }
}

// 封装调用方法，提供 Promise 接口
export const NovelBridge = {
  // 作品
  async getNovelWorks(): Promise<any[]> {
    const result = window.NativeBridge.getNovelWorks();
    return JSON.parse(result);
  },

  async createWork(title: string, genre: string = "", description: string = ""): Promise<string> {
    return window.NativeBridge.createWork(title, genre, description);
  },

  async updateWork(work: any): Promise<boolean> {
    return window.NativeBridge.updateWork(JSON.stringify(work));
  },

  async deleteWork(workId: string): Promise<boolean> {
    return window.NativeBridge.deleteWork(workId);
  },

  // 章节
  async getChapters(workId: string): Promise<any[]> {
    const result = window.NativeBridge.getChapters(workId);
    return JSON.parse(result);
  },

  async createChapter(workId: string, title: string, order: number = 0): Promise<string> {
    return window.NativeBridge.createChapter(workId, title, order);
  },

  async getChapterContent(chapterId: string): Promise<string> {
    return window.NativeBridge.getChapterContent(chapterId);
  },

  async saveChapterContent(chapterId: string, content: string, wordCount: number): Promise<boolean> {
    return window.NativeBridge.saveChapterContent(chapterId, content, wordCount);
  },

  async deleteChapter(chapterId: string): Promise<boolean> {
    return window.NativeBridge.deleteChapter(chapterId);
  },

  // 资料
  async getCharacters(workId: string): Promise<any[]> {
    const result = window.NativeBridge.getCharacters(workId);
    return JSON.parse(result);
  },

  async createCharacter(workId: string, name: string, role: string = ""): Promise<string> {
    return window.NativeBridge.createCharacter(workId, name, role);
  },

  async updateCharacter(character: any): Promise<boolean> {
    return window.NativeBridge.updateCharacter(JSON.stringify(character));
  },

  async deleteCharacter(characterId: string): Promise<boolean> {
    return window.NativeBridge.deleteCharacter(characterId);
  },

  // 统计
  async getWritingStats(workId: string): Promise<any> {
    const result = window.NativeBridge.getWritingStats(workId);
    return JSON.parse(result);
  }
};
