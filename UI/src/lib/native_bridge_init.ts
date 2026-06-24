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

      // 卷管理
      getVolumes(workId: string): string;
      createVolume(workId: string, name: string, sortOrder: number): string;
      updateVolume(volumeJson: string): boolean;
      deleteVolume(volumeId: string): boolean;

      // 自定义资料夹
      getCustomFolders(workId: string): string;
      createCustomFolder(workId: string, name: string, icon: string): string;
      updateCustomFolder(folderJson: string): boolean;
      deleteCustomFolder(folderId: string): boolean;

      // 自定义资料条目
      getCustomItems(workId: string): string;
      getItemsByFolder(folderId: string): string;
      createCustomItem(itemJson: string): string;
      updateCustomItem(itemJson: string): boolean;
      deleteCustomItem(itemId: string): boolean;

      // 写作技能
      getWritingSkills(workId: string): string;
      createWritingSkill(skillJson: string): string;
      updateWritingSkill(skillJson: string): boolean;
      deleteWritingSkill(skillId: string): boolean;

      // 设定提醒
      getSettingReminders(workId: string): string;
      createSettingReminder(reminderJson: string): string;
      updateSettingReminder(reminderJson: string): boolean;
      deleteSettingReminder(reminderId: string): boolean;

      // 导入导出
      importFile(uri: string, fileName: string, workId: string): string;
      exportWorkTxt(workId: string): string;
      exportWorkMd(workId: string): string;
      exportWorkJson(workId: string): string;
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

  // 设定
  async getSettings(workId: string): Promise<any[]> {
    const result = window.NativeBridge.getSettings(workId);
    return JSON.parse(result);
  },

  async createSetting(workId: string, name: string, content: string): Promise<string> {
    return window.NativeBridge.createSetting(workId, name, content);
  },

  async updateSetting(setting: any): Promise<boolean> {
    return window.NativeBridge.updateSetting(JSON.stringify(setting));
  },

  async deleteSetting(settingId: string): Promise<boolean> {
    return window.NativeBridge.deleteSetting(settingId);
  },

  // 地点
  async getLocations(workId: string): Promise<any[]> {
    const result = window.NativeBridge.getLocations(workId);
    return JSON.parse(result);
  },

  async createLocation(workId: string, name: string, description: string): Promise<string> {
    return window.NativeBridge.createLocation(workId, name, description);
  },

  async updateLocation(location: any): Promise<boolean> {
    return window.NativeBridge.updateLocation(JSON.stringify(location));
  },

  async deleteLocation(locationId: string): Promise<boolean> {
    return window.NativeBridge.deleteLocation(locationId);
  },

  // 势力
  async getFactions(workId: string): Promise<any[]> {
    const result = window.NativeBridge.getFactions(workId);
    return JSON.parse(result);
  },

  async createFaction(workId: string, name: string, leader: string): Promise<string> {
    return window.NativeBridge.createFaction(workId, name, leader);
  },

  async updateFaction(faction: any): Promise<boolean> {
    return window.NativeBridge.updateFaction(JSON.stringify(faction));
  },

  async deleteFaction(factionId: string): Promise<boolean> {
    return window.NativeBridge.deleteFaction(factionId);
  },

  // 道具
  async getItems(workId: string): Promise<any[]> {
    const result = window.NativeBridge.getItems(workId);
    return JSON.parse(result);
  },

  async createItem(workId: string, name: string, description: string): Promise<string> {
    return window.NativeBridge.createItem(workId, name, description);
  },

  async updateItem(item: any): Promise<boolean> {
    return window.NativeBridge.updateItem(JSON.stringify(item));
  },

  async deleteItem(itemId: string): Promise<boolean> {
    return window.NativeBridge.deleteItem(itemId);
  },

  // 伏笔
  async getPlotHooks(workId: string): Promise<any[]> {
    const result = window.NativeBridge.getPlotHooks(workId);
    return JSON.parse(result);
  },

  async createPlotHook(workId: string, content: string): Promise<string> {
    return window.NativeBridge.createPlotHook(workId, content);
  },

  async updatePlotHook(hook: any): Promise<boolean> {
    return window.NativeBridge.updatePlotHook(JSON.stringify(hook));
  },

  async deletePlotHook(hookId: string): Promise<boolean> {
    return window.NativeBridge.deletePlotHook(hookId);
  },

  // 参考资料
  async getReferences(workId: string): Promise<any[]> {
    const result = window.NativeBridge.getReferences(workId);
    return JSON.parse(result);
  },

  async createReference(workId: string, title: string, content: string): Promise<string> {
    return window.NativeBridge.createReference(workId, title, content);
  },

  async updateReference(reference: any): Promise<boolean> {
    return window.NativeBridge.updateReference(JSON.stringify(reference));
  },

  async deleteReference(referenceId: string): Promise<boolean> {
    return window.NativeBridge.deleteReference(referenceId);
  },

  // 写作待办
  async getTodos(workId: string): Promise<any[]> {
    const result = window.NativeBridge.getTodos(workId);
    return JSON.parse(result);
  },

  async createTodo(workId: string, content: string, priority: number): Promise<string> {
    return window.NativeBridge.createTodo(workId, content, priority);
  },

  async updateTodo(todo: any): Promise<boolean> {
    return window.NativeBridge.updateTodo(JSON.stringify(todo));
  },

  async deleteTodo(todoId: string): Promise<boolean> {
    return window.NativeBridge.deleteTodo(todoId);
  },

  // 关系图
  async getCharacterRelationships(workId: string): Promise<any[]> {
    const result = window.NativeBridge.getCharacterRelationships(workId);
    return JSON.parse(result);
  },

  async createCharacterRelationship(workId: string, sourceId: string, targetId: string, relationType: string): Promise<string> {
    return window.NativeBridge.createCharacterRelationship(workId, sourceId, targetId, relationType);
  },

  async updateCharacterRelationship(relationship: any): Promise<boolean> {
    return window.NativeBridge.updateCharacterRelationship(JSON.stringify(relationship));
  },

  async deleteCharacterRelationship(relationshipId: string): Promise<boolean> {
    return window.NativeBridge.deleteCharacterRelationship(relationshipId);
  },

  // 事件
  async getNovelEvents(workId: string): Promise<any[]> {
    const result = window.NativeBridge.getNovelEvents(workId);
    return JSON.parse(result);
  },

  async createNovelEvent(workId: string, title: string, description: string): Promise<string> {
    return window.NativeBridge.createNovelEvent(workId, title, description);
  },

  async updateNovelEvent(event: any): Promise<boolean> {
    return window.NativeBridge.updateNovelEvent(JSON.stringify(event));
  },

  async deleteNovelEvent(eventId: string): Promise<boolean> {
    return window.NativeBridge.deleteNovelEvent(eventId);
  },

  // 事件参与者
  async getEventParticipants(eventId: string): Promise<any[]> {
    const result = window.NativeBridge.getEventParticipants(eventId);
    return JSON.parse(result);
  },

  async addEventParticipant(eventId: string, characterId: string, role: string): Promise<boolean> {
    return window.NativeBridge.addEventParticipant(eventId, characterId, role);
  },

  async removeEventParticipant(eventId: string, characterId: string): Promise<boolean> {
    return window.NativeBridge.removeEventParticipant(eventId, characterId);
  },

  // 番茄预设
  async getTomatoPresets(): Promise<any[]> {
    const result = window.NativeBridge.getTomatoPresets();
    return JSON.parse(result);
  },

  async getTomatoPresetById(presetId: string): Promise<any> {
    const result = window.NativeBridge.getTomatoPresetById(presetId);
    return JSON.parse(result);
  },

  // 统计
  async getWritingStats(workId: string): Promise<any> {
    const result = window.NativeBridge.getWritingStats(workId);
    return JSON.parse(result);
  },

  // 卷管理
  async getVolumes(workId: string): Promise<any[]> {
    const result = window.NativeBridge.getVolumes(workId);
    return JSON.parse(result);
  },

  async createVolume(workId: string, name: string, sortOrder: number = 0): Promise<string> {
    return window.NativeBridge.createVolume(workId, name, sortOrder);
  },

  async updateVolume(volume: any): Promise<boolean> {
    return window.NativeBridge.updateVolume(JSON.stringify(volume));
  },

  async deleteVolume(volumeId: string): Promise<boolean> {
    return window.NativeBridge.deleteVolume(volumeId);
  },

  // 自定义资料夹
  async getCustomFolders(workId: string): Promise<any[]> {
    const result = window.NativeBridge.getCustomFolders(workId);
    return JSON.parse(result);
  },

  async createCustomFolder(workId: string, name: string, icon: string): Promise<string> {
    return window.NativeBridge.createCustomFolder(workId, name, icon);
  },

  async updateCustomFolder(folder: any): Promise<boolean> {
    return window.NativeBridge.updateCustomFolder(JSON.stringify(folder));
  },

  async deleteCustomFolder(folderId: string): Promise<boolean> {
    return window.NativeBridge.deleteCustomFolder(folderId);
  },

  // 自定义资料条目
  async getCustomItems(workId: string): Promise<any[]> {
    const result = window.NativeBridge.getCustomItems(workId);
    return JSON.parse(result);
  },

  async getItemsByFolder(folderId: string): Promise<any[]> {
    const result = window.NativeBridge.getItemsByFolder(folderId);
    return JSON.parse(result);
  },

  async createCustomItem(itemJson: string): Promise<string> {
    return window.NativeBridge.createCustomItem(itemJson);
  },

  async updateCustomItem(item: any): Promise<boolean> {
    return window.NativeBridge.updateCustomItem(JSON.stringify(item));
  },

  async deleteCustomItem(itemId: string): Promise<boolean> {
    return window.NativeBridge.deleteCustomItem(itemId);
  },

  // 写作技能
  async getWritingSkills(workId: string): Promise<any[]> {
    const result = window.NativeBridge.getWritingSkills(workId);
    return JSON.parse(result);
  },

  async createWritingSkill(skillJson: string): Promise<string> {
    return window.NativeBridge.createWritingSkill(skillJson);
  },

  async updateWritingSkill(skill: any): Promise<boolean> {
    return window.NativeBridge.updateWritingSkill(JSON.stringify(skill));
  },

  async deleteWritingSkill(skillId: string): Promise<boolean> {
    return window.NativeBridge.deleteWritingSkill(skillId);
  },

  // 设定提醒
  async getSettingReminders(workId: string): Promise<any[]> {
    const result = window.NativeBridge.getSettingReminders(workId);
    return JSON.parse(result);
  },

  async createSettingReminder(reminderJson: string): Promise<string> {
    return window.NativeBridge.createSettingReminder(reminderJson);
  },

  async updateSettingReminder(reminder: any): Promise<boolean> {
    return window.NativeBridge.updateSettingReminder(JSON.stringify(reminder));
  },

  async deleteSettingReminder(reminderId: string): Promise<boolean> {
    return window.NativeBridge.deleteSettingReminder(reminderId);
  },

  // 导入导出
  async importFile(uri: string, fileName: string, workId: string): Promise<any> {
    const result = window.NativeBridge.importFile(uri, fileName, workId);
    return JSON.parse(result);
  },

  async exportWorkTxt(workId: string): Promise<any> {
    const result = window.NativeBridge.exportWorkTxt(workId);
    return JSON.parse(result);
  },

  async exportWorkMd(workId: string): Promise<any> {
    const result = window.NativeBridge.exportWorkMd(workId);
    return JSON.parse(result);
  },

  async exportWorkJson(workId: string): Promise<any> {
    const result = window.NativeBridge.exportWorkJson(workId);
    return JSON.parse(result);
  },
};
