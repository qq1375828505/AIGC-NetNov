// UI 桥接层 - HTML 端 JavaScript 调用封装

/**
 * 网文写作 UI 桥接
 * 在 HTML 中通过 window.NovelUI 调用
 */
window.NovelUI = {
  // ==================== 作品 ====================
  async getWorks() {
    const result = await window.NativeBridge.getNovelWorks();
    return JSON.parse(result);
  },

  async createWork(title, genre = '', description = '') {
    return await window.NativeBridge.createWork(title, genre, description);
  },

  async deleteWork(workId) {
    return await window.NativeBridge.deleteWork(workId);
  },

  // ==================== 章节 ====================
  async getChapters(workId) {
    const result = await window.NativeBridge.getChapters(workId);
    return JSON.parse(result);
  },

  async createChapter(workId, title) {
    return await window.NativeBridge.createChapter(workId, title, 0);
  },

  async getChapterContent(chapterId) {
    return await window.NativeBridge.getChapterContent(chapterId);
  },

  async saveChapter(chapterId, content) {
    return await window.NativeBridge.saveChapterContent(chapterId, content, content.length);
  },

  async deleteChapter(chapterId) {
    return await window.NativeBridge.deleteChapter(chapterId);
  },

  // ==================== 资料 ====================
  async getCharacters(workId) {
    const result = await window.NativeBridge.getCharacters(workId);
    return JSON.parse(result);
  },

  async createCharacter(workId, name, role) {
    return await window.NativeBridge.createCharacter(workId, name, role);
  },

  async deleteCharacter(characterId) {
    return await window.NativeBridge.deleteCharacter(characterId);
  },

  async getSettings(workId) {
    const result = await window.NativeBridge.getSettings(workId);
    return JSON.parse(result);
  },

  async getLocations(workId) {
    const result = await window.NativeBridge.getLocations(workId);
    return JSON.parse(result);
  },

  async getFactions(workId) {
    const result = await window.NativeBridge.getFactions(workId);
    return JSON.parse(result);
  },

  async getItems(workId) {
    const result = await window.NativeBridge.getItems(workId);
    return JSON.parse(result);
  },

  async getPlotHooks(workId) {
    const result = await window.NativeBridge.getPlotHooks(workId);
    return JSON.parse(result);
  },

  async getReferences(workId) {
    const result = await window.NativeBridge.getReferences(workId);
    return JSON.parse(result);
  },

  async getTodos(workId) {
    const result = await window.NativeBridge.getTodos(workId);
    return JSON.parse(result);
  },

  // ==================== 关系图 ====================
  async getRelationships(workId) {
    const result = await window.NativeBridge.getCharacterRelationships(workId);
    return JSON.parse(result);
  },

  async getEvents(workId) {
    const result = await window.NativeBridge.getNovelEvents(workId);
    return JSON.parse(result);
  },

  // ==================== 番茄 ====================
  async getTomatoPresets() {
    const result = await window.NativeBridge.getTomatoPresets();
    return JSON.parse(result);
  },

  // ==================== 统计 ====================
  async getStats(workId) {
    const result = await window.NativeBridge.getWritingStats(workId);
    return JSON.parse(result);
  },

  // ==================== 工具 ====================
  async showToast(message, duration = 'short') {
    // 调用原生 Toast
    if (window.NativeBridge.showToast) {
      window.NativeBridge.showToast(message, duration);
    }
  },

  async navigate(route) {
    // 调用原生导航
    if (window.NativeBridge.navigate) {
      window.NativeBridge.navigate(route);
    }
  }
};

// 自动保存工具
window.AutoSave = {
  timer: null,
  
  start(chapterId, content, delay = 3000) {
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
