// NativeBridge 初始化和 HTML 端调用封装

// 声明全局 NativeBridge 接口
declare global {
  interface Window {
    NativeBridge: {
      // 作品
      getNovelWorks(): string;
      createWork(title: string, genre: string, description: string): string;
      updateWork(workJson: string): string;
      deleteWork(workId: string): string;

      // 章节
      getChapters(workId: string): string;
      createChapter(workId: string, title: string, order: number): string;
      getChapterContent(chapterId: string): string;
      saveChapterContent(chapterId: string, content: string, wordCount: number): string;
      deleteChapter(chapterId: string): string;
      reorderChapters(workId: string, chapterIdsJson: string): string;

      // 资料
      getCharacters(workId: string): string;
      createCharacter(workId: string, name: string, role: string): string;
      updateCharacter(characterJson: string): string;
      deleteCharacter(characterId: string): string;

      getSettings(workId: string): string;
      createSetting(workId: string, name: string, content: string): string;
      updateSetting(settingJson: string): string;
      deleteSetting(settingId: string): string;

      getLocations(workId: string): string;
      createLocation(workId: string, name: string, description: string): string;
      updateLocation(locationJson: string): string;
      deleteLocation(locationId: string): string;

      getFactions(workId: string): string;
      createFaction(workId: string, name: string, leader: string): string;
      updateFaction(factionJson: string): string;
      deleteFaction(factionId: string): string;

      getItems(workId: string): string;
      createItem(workId: string, name: string, description: string): string;
      updateItem(itemJson: string): string;
      deleteItem(itemId: string): string;

      getPlotHooks(workId: string): string;
      createPlotHook(workId: string, content: string): string;
      updatePlotHook(hookJson: string): string;
      deletePlotHook(hookId: string): string;

      getReferences(workId: string): string;
      createReference(workId: string, title: string, content: string): string;
      updateReference(referenceJson: string): string;
      deleteReference(referenceId: string): string;

      getTodos(workId: string): string;
      createTodo(workId: string, content: string, priority: number): string;
      updateTodo(todoJson: string): string;
      deleteTodo(todoId: string): string;

      // 关系图
      getCharacterRelationships(workId: string): string;
      createCharacterRelationship(workId: string, sourceId: string, targetId: string, relationType: string): string;
      updateCharacterRelationship(relationshipJson: string): string;
      deleteCharacterRelationship(relationshipId: string): string;

      getNovelEvents(workId: string): string;
      createNovelEvent(workId: string, title: string, description: string): string;
      updateNovelEvent(eventJson: string): string;
      deleteNovelEvent(eventId: string): string;

      getEventParticipants(eventId: string): string;
      addEventParticipant(eventId: string, characterId: string, role: string): string;
      removeEventParticipant(eventId: string, characterId: string): string;

      // 番茄
      getTomatoPresets(): string;
      getTomatoPresetById(presetId: string): string;

      // 统计
      getWritingStats(workId: string): string;

      // 卷管理
      getVolumes(workId: string): string;
      createVolume(workId: string, name: string, sortOrder: number): string;
      updateVolume(volumeJson: string): string;
      deleteVolume(volumeId: string): string;

      // 自定义资料夹
      getCustomFolders(workId: string): string;
      createCustomFolder(workId: string, name: string, icon: string): string;
      updateCustomFolder(folderJson: string): string;
      deleteCustomFolder(folderId: string): string;

      // 自定义资料条目
      getCustomItems(workId: string): string;
      getItemsByFolder(folderId: string): string;
      createCustomItem(itemJson: string): string;
      updateCustomItem(itemJson: string): string;
      deleteCustomItem(itemId: string): string;

      // 写作技能
      getWritingSkills(workId: string): string;
      createWritingSkill(skillJson: string): string;
      updateWritingSkill(skillJson: string): string;
      deleteWritingSkill(skillId: string): string;

      // 设定提醒
      getSettingReminders(workId: string): string;
      createSettingReminder(reminderJson: string): string;
      updateSettingReminder(reminderJson: string): string;
      deleteSettingReminder(reminderId: string): string;

      // 导入导出
      importFile(uri: string, fileName: string, workId: string): string;
      exportWorkTxt(workId: string): string;
      exportWorkMd(workId: string): string;
      exportWorkJson(workId: string): string;

      // 大纲（扩展）
      updateOutlineNodeEx(nodeId: string, title: string, content: string, chapterId: string): string;
      reorderOutlineNode(nodeId: string, newParentId: string, newSortOrder: number): string;

      // 番茄（扩展）
      recordTomatoComplete(workId: string, presetName: string, durationMinutes: number): string;

      // 资料详情方法
      getCharacterDetail(characterId: string): string;
      getSettingDetail(settingId: string): string;
      getLocationDetail(locationId: string): string;
      getFactionDetail(factionId: string): string;
      getItemDetail(itemId: string): string;
      getHookDetail(hookId: string): string;
      getReferenceDetail(referenceId: string): string;

      // 统计扩展
      getChapterStats(workId: string): string;
      getDailyStats(workId: string, days: number): string;

      // 作品详情
      getWork(workId: string): string;

      // 章节导航
      navigateToChapter(chapterId: string): void;
      getPendingNavigation(): string;

      // 大纲节点
      getOutlineNodes(workId: string): string;
      createOutlineNode(workId: string, title: string, content: string, parentId: string): string;
      updateOutlineNode(nodeId: string, title: string, content: string): string;
      deleteOutlineNode(nodeId: string): string;

      // Agent
      getAvailableAgents(): string;
      createAgentSession(agentId: string): string;
      sendAgentTask(agentId: string, task: string): string;
      getAgentResult(agentId: string): string;

      // 技能
      getAvailableSkills(): string;
      applySkill(skillId: string): string;

      // 异步操作
      getAsyncResult(callId: string): string;
    };
  }
}

/** 解析 NativeBridge 返回的 JSON 字符串，提取 success 字段 */
function parseSuccess(result: string): boolean {
  try {
    const parsed = JSON.parse(result);
    return parsed?.success === true;
  } catch {
    return !!result;
  }
}

// 异步回调处理
const asyncCallbacks = new Map<string, { resolve: (value: any) => void; reject: (reason?: any) => void }>();

// 注册全局回调处理函数（Kotlin 通过 evaluateJavascript 调用）
(window as any).__onNovelBridgeResult = function(callId: string, result: string) {
  const callback = asyncCallbacks.get(callId);
  if (callback) {
    asyncCallbacks.delete(callId);
    try {
      const parsed = typeof result === "string" ? JSON.parse(result) : result;
      callback.resolve(parsed);
    } catch {
      callback.resolve(result);
    }
  }
};

/** 等待异步操作完成，支持回调和轮询两种模式 */
async function waitForAsyncResult(callId: string, timeoutMs: number = 30000): Promise<any> {
  return new Promise((resolve, reject) => {
    // 注册回调
    asyncCallbacks.set(callId, { resolve, reject });

    // 设置超时
    const timer = setTimeout(() => {
      asyncCallbacks.delete(callId);
      reject(new Error("异步操作超时"));
    }, timeoutMs);

    // 同时启动轮询作为后备方案
    const pollInterval = setInterval(() => {
      try {
        const result = window.NativeBridge.getAsyncResult(callId);
        if (result) {
          clearInterval(pollInterval);
          clearTimeout(timer);
          asyncCallbacks.delete(callId);
          try {
            resolve(JSON.parse(result));
          } catch {
            resolve(result);
          }
        }
      } catch {
        // 忽略轮询错误
      }
    }, 200);

    // 清理：当回调被触发时停止轮询
    const originalResolve = resolve;
    const wrappedResolve = (value: any) => {
      clearInterval(pollInterval);
      clearTimeout(timer);
      originalResolve(value);
    };
    asyncCallbacks.set(callId, { resolve: wrappedResolve, reject });
  });
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
    const result = window.NativeBridge.updateWork(JSON.stringify(work));
    return parseSuccess(result);
  },

  async deleteWork(workId: string): Promise<boolean> {
    const result = window.NativeBridge.deleteWork(workId);
    return parseSuccess(result);
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
    const result = window.NativeBridge.saveChapterContent(chapterId, content, wordCount);
    return parseSuccess(result);
  },

  async deleteChapter(chapterId: string): Promise<boolean> {
    const result = window.NativeBridge.deleteChapter(chapterId);
    return parseSuccess(result);
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
    const result = window.NativeBridge.updateCharacter(JSON.stringify(character));
    return parseSuccess(result);
  },

  async deleteCharacter(characterId: string): Promise<boolean> {
    const result = window.NativeBridge.deleteCharacter(characterId);
    return parseSuccess(result);
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
    const result = window.NativeBridge.updateSetting(JSON.stringify(setting));
    return parseSuccess(result);
  },

  async deleteSetting(settingId: string): Promise<boolean> {
    const result = window.NativeBridge.deleteSetting(settingId);
    return parseSuccess(result);
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
    const result = window.NativeBridge.updateLocation(JSON.stringify(location));
    return parseSuccess(result);
  },

  async deleteLocation(locationId: string): Promise<boolean> {
    const result = window.NativeBridge.deleteLocation(locationId);
    return parseSuccess(result);
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
    const result = window.NativeBridge.updateFaction(JSON.stringify(faction));
    return parseSuccess(result);
  },

  async deleteFaction(factionId: string): Promise<boolean> {
    const result = window.NativeBridge.deleteFaction(factionId);
    return parseSuccess(result);
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
    const result = window.NativeBridge.updateItem(JSON.stringify(item));
    return parseSuccess(result);
  },

  async deleteItem(itemId: string): Promise<boolean> {
    const result = window.NativeBridge.deleteItem(itemId);
    return parseSuccess(result);
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
    const result = window.NativeBridge.updatePlotHook(JSON.stringify(hook));
    return parseSuccess(result);
  },

  async deletePlotHook(hookId: string): Promise<boolean> {
    const result = window.NativeBridge.deletePlotHook(hookId);
    return parseSuccess(result);
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
    const result = window.NativeBridge.updateReference(JSON.stringify(reference));
    return parseSuccess(result);
  },

  async deleteReference(referenceId: string): Promise<boolean> {
    const result = window.NativeBridge.deleteReference(referenceId);
    return parseSuccess(result);
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
    const result = window.NativeBridge.updateTodo(JSON.stringify(todo));
    return parseSuccess(result);
  },

  async deleteTodo(todoId: string): Promise<boolean> {
    const result = window.NativeBridge.deleteTodo(todoId);
    return parseSuccess(result);
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
    const result = window.NativeBridge.updateCharacterRelationship(JSON.stringify(relationship));
    return parseSuccess(result);
  },

  async deleteCharacterRelationship(relationshipId: string): Promise<boolean> {
    const result = window.NativeBridge.deleteCharacterRelationship(relationshipId);
    return parseSuccess(result);
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
    const result = window.NativeBridge.updateNovelEvent(JSON.stringify(event));
    return parseSuccess(result);
  },

  async deleteNovelEvent(eventId: string): Promise<boolean> {
    const result = window.NativeBridge.deleteNovelEvent(eventId);
    return parseSuccess(result);
  },

  // 事件参与者
  async getEventParticipants(eventId: string): Promise<any[]> {
    const result = window.NativeBridge.getEventParticipants(eventId);
    return JSON.parse(result);
  },

  async addEventParticipant(eventId: string, characterId: string, role: string): Promise<boolean> {
    const result = window.NativeBridge.addEventParticipant(eventId, characterId, role);
    return parseSuccess(result);
  },

  async removeEventParticipant(eventId: string, characterId: string): Promise<boolean> {
    const result = window.NativeBridge.removeEventParticipant(eventId, characterId);
    return parseSuccess(result);
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
    const result = window.NativeBridge.updateVolume(JSON.stringify(volume));
    return parseSuccess(result);
  },

  async deleteVolume(volumeId: string): Promise<boolean> {
    const result = window.NativeBridge.deleteVolume(volumeId);
    return parseSuccess(result);
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
    const result = window.NativeBridge.updateCustomFolder(JSON.stringify(folder));
    return parseSuccess(result);
  },

  async deleteCustomFolder(folderId: string): Promise<boolean> {
    const result = window.NativeBridge.deleteCustomFolder(folderId);
    return parseSuccess(result);
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
    const result = window.NativeBridge.updateCustomItem(JSON.stringify(item));
    return parseSuccess(result);
  },

  async deleteCustomItem(itemId: string): Promise<boolean> {
    const result = window.NativeBridge.deleteCustomItem(itemId);
    return parseSuccess(result);
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
    const result = window.NativeBridge.updateWritingSkill(JSON.stringify(skill));
    return parseSuccess(result);
  },

  async deleteWritingSkill(skillId: string): Promise<boolean> {
    const result = window.NativeBridge.deleteWritingSkill(skillId);
    return parseSuccess(result);
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
    const result = window.NativeBridge.updateSettingReminder(JSON.stringify(reminder));
    return parseSuccess(result);
  },

  async deleteSettingReminder(reminderId: string): Promise<boolean> {
    const result = window.NativeBridge.deleteSettingReminder(reminderId);
    return parseSuccess(result);
  },

  // 导入导出（异步操作，通过回调返回结果）
  async importFile(uri: string, fileName: string, workId: string): Promise<any> {
    const result = window.NativeBridge.importFile(uri, fileName, workId);
    const parsed = JSON.parse(result);
    if (parsed.async && parsed.callId) {
      return waitForAsyncResult(parsed.callId, 60000); // 导入可能较慢，60秒超时
    }
    return parsed;
  },

  async exportWorkTxt(workId: string): Promise<any> {
    const result = window.NativeBridge.exportWorkTxt(workId);
    const parsed = JSON.parse(result);
    if (parsed.async && parsed.callId) {
      return waitForAsyncResult(parsed.callId, 30000);
    }
    return parsed;
  },

  async exportWorkMd(workId: string): Promise<any> {
    const result = window.NativeBridge.exportWorkMd(workId);
    const parsed = JSON.parse(result);
    if (parsed.async && parsed.callId) {
      return waitForAsyncResult(parsed.callId, 30000);
    }
    return parsed;
  },

  async exportWorkJson(workId: string): Promise<any> {
    const result = window.NativeBridge.exportWorkJson(workId);
    const parsed = JSON.parse(result);
    if (parsed.async && parsed.callId) {
      return waitForAsyncResult(parsed.callId, 30000);
    }
    return parsed;
  },

  // 大纲扩展
  async updateOutlineNodeEx(nodeId: string, title: string, content: string, chapterId: string): Promise<any> {
    const result = window.NativeBridge.updateOutlineNodeEx(nodeId, title, content, chapterId);
    return JSON.parse(result);
  },

  async reorderOutlineNode(nodeId: string, newParentId: string, newSortOrder: number): Promise<any> {
    const result = window.NativeBridge.reorderOutlineNode(nodeId, newParentId, newSortOrder);
    return JSON.parse(result);
  },

  // 番茄扩展
  async recordTomatoComplete(workId: string, presetName: string, durationMinutes: number): Promise<any> {
    const result = window.NativeBridge.recordTomatoComplete(workId, presetName, durationMinutes);
    return JSON.parse(result);
  },

  // 资料详情方法
  async getCharacterDetail(characterId: string): Promise<any> {
    const result = window.NativeBridge.getCharacterDetail(characterId);
    return JSON.parse(result);
  },

  async getSettingDetail(settingId: string): Promise<any> {
    const result = window.NativeBridge.getSettingDetail(settingId);
    return JSON.parse(result);
  },

  async getLocationDetail(locationId: string): Promise<any> {
    const result = window.NativeBridge.getLocationDetail(locationId);
    return JSON.parse(result);
  },

  async getFactionDetail(factionId: string): Promise<any> {
    const result = window.NativeBridge.getFactionDetail(factionId);
    return JSON.parse(result);
  },

  async getItemDetail(itemId: string): Promise<any> {
    const result = window.NativeBridge.getItemDetail(itemId);
    return JSON.parse(result);
  },

  async getHookDetail(hookId: string): Promise<any> {
    const result = window.NativeBridge.getHookDetail(hookId);
    return JSON.parse(result);
  },

  async getReferenceDetail(referenceId: string): Promise<any> {
    const result = window.NativeBridge.getReferenceDetail(referenceId);
    return JSON.parse(result);
  },

  // 统计扩展
  async getChapterStats(workId: string): Promise<any> {
    const result = window.NativeBridge.getChapterStats(workId);
    return JSON.parse(result);
  },

  async getDailyStats(workId: string, days: number = 30): Promise<any> {
    const result = window.NativeBridge.getDailyStats(workId, days);
    return JSON.parse(result);
  },

  // 作品详情
  async getWork(workId: string): Promise<any> {
    const result = window.NativeBridge.getWork(workId);
    return JSON.parse(result);
  },

  // 大纲节点
  async getOutlineNodes(workId: string): Promise<any[]> {
    const result = window.NativeBridge.getOutlineNodes(workId);
    return JSON.parse(result);
  },

  async createOutlineNode(workId: string, title: string, content: string, parentId: string): Promise<string> {
    return window.NativeBridge.createOutlineNode(workId, title, content, parentId);
  },

  async updateOutlineNode(nodeId: string, title: string, content: string): Promise<boolean> {
    const result = window.NativeBridge.updateOutlineNode(nodeId, title, content);
    return parseSuccess(result);
  },

  async deleteOutlineNode(nodeId: string): Promise<boolean> {
    const result = window.NativeBridge.deleteOutlineNode(nodeId);
    return parseSuccess(result);
  },

  // Agent
  async getAvailableAgents(): Promise<any[]> {
    const result = window.NativeBridge.getAvailableAgents();
    return JSON.parse(result);
  },

  async createAgentSession(agentId: string): Promise<string> {
    const result = window.NativeBridge.createAgentSession(agentId);
    return JSON.parse(result);
  },

  async sendAgentTask(agentId: string, task: string): Promise<any> {
    const result = window.NativeBridge.sendAgentTask(agentId, task);
    return JSON.parse(result);
  },

  async getAgentResult(agentId: string): Promise<any> {
    const result = window.NativeBridge.getAgentResult(agentId);
    return JSON.parse(result);
  },

  // 技能
  async getAvailableSkills(): Promise<any[]> {
    const result = window.NativeBridge.getAvailableSkills();
    return JSON.parse(result);
  },

  async applySkill(skillId: string): Promise<any> {
    const result = window.NativeBridge.applySkill(skillId);
    return JSON.parse(result);
  },
};

/**
 * UI 桥接层 - HTML 端 JavaScript 调用封装
 * 在 HTML 中通过 window.NovelUI 调用
 */
(window as any).NovelUI = {
  // ==================== 作品 ====================
  async getWorks() {
    const result = window.NativeBridge.getNovelWorks();
    return JSON.parse(result);
  },

  async createWork(title: string, genre: string = '', description: string = '') {
    return window.NativeBridge.createWork(title, genre, description);
  },

  async deleteWork(workId: string) {
    return window.NativeBridge.deleteWork(workId);
  },

  // ==================== 章节 ====================
  async getChapters(workId: string) {
    const result = window.NativeBridge.getChapters(workId);
    return JSON.parse(result);
  },

  async createChapter(workId: string, title: string) {
    return window.NativeBridge.createChapter(workId, title, 0);
  },

  async getChapterContent(chapterId: string) {
    return window.NativeBridge.getChapterContent(chapterId);
  },

  async saveChapter(chapterId: string, content: string) {
    return window.NativeBridge.saveChapterContent(chapterId, content, content.length);
  },

  async deleteChapter(chapterId: string) {
    return window.NativeBridge.deleteChapter(chapterId);
  },

  // ==================== 资料 ====================
  async getCharacters(workId: string) {
    const result = window.NativeBridge.getCharacters(workId);
    return JSON.parse(result);
  },

  async createCharacter(workId: string, name: string, role: string) {
    return window.NativeBridge.createCharacter(workId, name, role);
  },

  async deleteCharacter(characterId: string) {
    return window.NativeBridge.deleteCharacter(characterId);
  },

  async getSettings(workId: string) {
    const result = window.NativeBridge.getSettings(workId);
    return JSON.parse(result);
  },

  async getLocations(workId: string) {
    const result = window.NativeBridge.getLocations(workId);
    return JSON.parse(result);
  },

  async getFactions(workId: string) {
    const result = window.NativeBridge.getFactions(workId);
    return JSON.parse(result);
  },

  async getItems(workId: string) {
    const result = window.NativeBridge.getItems(workId);
    return JSON.parse(result);
  },

  async getPlotHooks(workId: string) {
    const result = window.NativeBridge.getPlotHooks(workId);
    return JSON.parse(result);
  },

  async getReferences(workId: string) {
    const result = window.NativeBridge.getReferences(workId);
    return JSON.parse(result);
  },

  async getTodos(workId: string) {
    const result = window.NativeBridge.getTodos(workId);
    return JSON.parse(result);
  },

  // ==================== 关系图 ====================
  async getRelationships(workId: string) {
    const result = window.NativeBridge.getCharacterRelationships(workId);
    return JSON.parse(result);
  },

  async getEvents(workId: string) {
    const result = window.NativeBridge.getNovelEvents(workId);
    return JSON.parse(result);
  },

  // ==================== 番茄 ====================
  async getTomatoPresets() {
    const result = window.NativeBridge.getTomatoPresets();
    return JSON.parse(result);
  },

  // ==================== 统计 ====================
  async getStats(workId: string) {
    const result = window.NativeBridge.getWritingStats(workId);
    return JSON.parse(result);
  },

  // ==================== 工具 ====================
  async showToast(message: string, duration: string = 'short') {
    // 调用原生 Toast
    if ((window.NativeBridge as any).showToast) {
      (window.NativeBridge as any).showToast(message, duration);
    }
  },

  async navigate(route: string) {
    // 调用原生导航
    if ((window.NativeBridge as any).navigate) {
      (window.NativeBridge as any).navigate(route);
    }
  }
};

/**
 * 自动保存工具
 */
(window as any).AutoSave = {
  timer: null as ReturnType<typeof setTimeout> | null,
  
  start(chapterId: string, content: string, delay: number = 3000) {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(async () => {
      await window.NativeBridge.saveChapterContent(chapterId, content, content.length);
      this.timer = null;
    }, delay);
  },
  
  cancel() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
};

console.log('NovelUI bridge initialized');
