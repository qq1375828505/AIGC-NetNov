"use strict";
// NativeBridge 初始化和 HTML 端调用封装
Object.defineProperty(exports, "__esModule", { value: true });
exports.NovelBridge = void 0;
// 封装调用方法，提供 Promise 接口
exports.NovelBridge = {
    // 作品
    async getNovelWorks() {
        const result = window.NativeBridge.getNovelWorks();
        return JSON.parse(result);
    },
    async createWork(title, genre = "", description = "") {
        return window.NativeBridge.createWork(title, genre, description);
    },
    async updateWork(work) {
        return window.NativeBridge.updateWork(JSON.stringify(work));
    },
    async deleteWork(workId) {
        return window.NativeBridge.deleteWork(workId);
    },
    // 章节
    async getChapters(workId) {
        const result = window.NativeBridge.getChapters(workId);
        return JSON.parse(result);
    },
    async createChapter(workId, title, order = 0) {
        return window.NativeBridge.createChapter(workId, title, order);
    },
    async getChapterContent(chapterId) {
        return window.NativeBridge.getChapterContent(chapterId);
    },
    async saveChapterContent(chapterId, content, wordCount) {
        return window.NativeBridge.saveChapterContent(chapterId, content, wordCount);
    },
    async deleteChapter(chapterId) {
        return window.NativeBridge.deleteChapter(chapterId);
    },
    // 资料
    async getCharacters(workId) {
        const result = window.NativeBridge.getCharacters(workId);
        return JSON.parse(result);
    },
    async createCharacter(workId, name, role = "") {
        return window.NativeBridge.createCharacter(workId, name, role);
    },
    async updateCharacter(character) {
        return window.NativeBridge.updateCharacter(JSON.stringify(character));
    },
    async deleteCharacter(characterId) {
        return window.NativeBridge.deleteCharacter(characterId);
    },
    // 统计
    async getWritingStats(workId) {
        const result = window.NativeBridge.getWritingStats(workId);
        return JSON.parse(result);
    }
};
