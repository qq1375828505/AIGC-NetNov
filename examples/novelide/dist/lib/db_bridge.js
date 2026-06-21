"use strict";
// NativeBridge 数据库桥接封装
Object.defineProperty(exports, "__esModule", { value: true });
exports.NovelDBBridge = void 0;
class NovelDBBridge {
    /**
     * 调用 NativeBridge 方法
     */
    static async callNative(method, args) {
        return new Promise((resolve, reject) => {
            try {
                // @ts-ignore
                const result = window.NativeBridge[method](...args);
                resolve(result);
            }
            catch (error) {
                reject(error);
            }
        });
    }
    // ==================== 作品 ====================
    static async getNovelWorks() {
        const result = await this.callNative("getNovelWorks", []);
        return JSON.parse(result);
    }
    static async createWork(title, genre = "", description = "") {
        return await this.callNative("createWork", [title, genre, description]);
    }
    static async updateWork(work) {
        return await this.callNative("updateWork", [JSON.stringify(work)]);
    }
    static async deleteWork(workId) {
        return await this.callNative("deleteWork", [workId]);
    }
    // ==================== 章节 ====================
    static async getChapters(workId) {
        const result = await this.callNative("getChapters", [workId]);
        return JSON.parse(result);
    }
    static async createChapter(workId, title, order = 0) {
        return await this.callNative("createChapter", [workId, title, order]);
    }
    static async getChapterContent(chapterId) {
        return await this.callNative("getChapterContent", [chapterId]);
    }
    static async saveChapterContent(chapterId, content, wordCount) {
        return await this.callNative("saveChapterContent", [chapterId, content, wordCount]);
    }
    static async deleteChapter(chapterId) {
        return await this.callNative("deleteChapter", [chapterId]);
    }
    static async reorderChapters(workId, chapterIds) {
        return await this.callNative("reorderChapters", [workId, JSON.stringify(chapterIds)]);
    }
    // ==================== 资料 ====================
    static async getCharacters(workId) {
        const result = await this.callNative("getCharacters", [workId]);
        return JSON.parse(result);
    }
    static async createCharacter(workId, name, role = "") {
        return await this.callNative("createCharacter", [workId, name, role]);
    }
    static async updateCharacter(character) {
        return await this.callNative("updateCharacter", [JSON.stringify(character)]);
    }
    static async deleteCharacter(characterId) {
        return await this.callNative("deleteCharacter", [characterId]);
    }
}
exports.NovelDBBridge = NovelDBBridge;
