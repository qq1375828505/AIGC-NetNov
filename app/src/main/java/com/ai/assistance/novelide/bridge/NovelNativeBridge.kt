package com.ai.assistance.novelide.bridge

import android.webkit.JavascriptInterface
import com.ai.assistance.novelide.data.model.novel.*
import com.ai.assistance.novelide.data.repository.novel.NovelRepository
import com.google.gson.Gson
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.util.UUID

/**
 * 网文写作 NativeBridge
 * 提供给 HTML 前端调用的 JavaScript 接口
 */
class NovelNativeBridge(
    private val repository: NovelRepository,
    private val scope: CoroutineScope
) {

    private val gson = Gson()

    // ==================== 作品 ====================

    @JavascriptInterface
    fun getNovelWorks(): String {
        // 返回 JSON 格式的作品列表
        // 实际实现需要从 Room 查询
        return "[]"
    }

    @JavascriptInterface
    fun createWork(title: String, genre: String, description: String): String {
        val work = NovelWork(
            id = UUID.randomUUID().toString(),
            title = title,
            genre = genre,
            description = description
        )
        scope.launch(Dispatchers.IO) {
            repository.insertWork(work)
        }
        return work.id
    }

    @JavascriptInterface
    fun updateWork(workJson: String): Boolean {
        val work = gson.fromJson(workJson, NovelWork::class.java)
        scope.launch(Dispatchers.IO) {
            repository.updateWork(work)
        }
        return true
    }

    @JavascriptInterface
    fun deleteWork(workId: String): Boolean {
        scope.launch(Dispatchers.IO) {
            repository.deleteWork(workId)
        }
        return true
    }

    // ==================== 章节 ====================

    @JavascriptInterface
    fun getChapters(workId: String): String {
        // 返回 JSON 格式的章节列表
        return "[]"
    }

    @JavascriptInterface
    fun createChapter(workId: String, title: String, order: Int): String {
        val chapter = Chapter(
            id = UUID.randomUUID().toString(),
            workId = workId,
            title = title,
            sortOrder = order
        )
        scope.launch(Dispatchers.IO) {
            repository.insertChapter(chapter)
        }
        return chapter.id
    }

    @JavascriptInterface
    fun getChapterContent(chapterId: String): String {
        // 返回章节内容
        return ""
    }

    @JavascriptInterface
    fun saveChapterContent(chapterId: String, content: String, wordCount: Int): Boolean {
        scope.launch(Dispatchers.IO) {
            repository.updateChapterContent(chapterId, content, wordCount)
        }
        return true
    }

    @JavascriptInterface
    fun deleteChapter(chapterId: String): Boolean {
        scope.launch(Dispatchers.IO) {
            repository.deleteChapter(chapterId)
        }
        return true
    }

    @JavascriptInterface
    fun reorderChapters(workId: String, chapterIdsJson: String): Boolean {
        // 解析 chapterIdsJson 并更新排序
        return true
    }

    // ==================== 资料 ====================

    @JavascriptInterface
    fun getCharacters(workId: String): String {
        return "[]"
    }

    @JavascriptInterface
    fun createCharacter(workId: String, name: String, role: String): String {
        val character = NovelCharacter(
            id = UUID.randomUUID().toString(),
            workId = workId,
            name = name,
            role = role
        )
        scope.launch(Dispatchers.IO) {
            repository.insertCharacter(character)
        }
        return character.id
    }

    @JavascriptInterface
    fun updateCharacter(characterJson: String): Boolean {
        val character = gson.fromJson(characterJson, NovelCharacter::class.java)
        scope.launch(Dispatchers.IO) {
            repository.updateCharacter(character)
        }
        return true
    }

    @JavascriptInterface
    fun deleteCharacter(characterId: String): Boolean {
        scope.launch(Dispatchers.IO) {
            repository.deleteCharacter(characterId)
        }
        return true
    }

    // ==================== 设定 ====================

    @JavascriptInterface
    fun getSettings(workId: String): String {
        return "[]"
    }

    @JavascriptInterface
    fun createSetting(workId: String, name: String, content: String): String {
        val setting = NovelSetting(
            id = UUID.randomUUID().toString(),
            workId = workId,
            name = name,
            content = content
        )
        scope.launch(Dispatchers.IO) {
            repository.insertSetting(setting)
        }
        return setting.id
    }

    @JavascriptInterface
    fun updateSetting(settingJson: String): Boolean {
        val setting = gson.fromJson(settingJson, NovelSetting::class.java)
        scope.launch(Dispatchers.IO) {
            repository.updateSetting(setting)
        }
        return true
    }

    @JavascriptInterface
    fun deleteSetting(settingId: String): Boolean {
        scope.launch(Dispatchers.IO) {
            repository.deleteSetting(settingId)
        }
        return true
    }

    // ==================== 地点 ====================

    @JavascriptInterface
    fun getLocations(workId: String): String {
        return "[]"
    }

    @JavascriptInterface
    fun createLocation(workId: String, name: String, description: String): String {
        val location = NovelLocation(
            id = UUID.randomUUID().toString(),
            workId = workId,
            name = name,
            description = description
        )
        scope.launch(Dispatchers.IO) {
            repository.insertLocation(location)
        }
        return location.id
    }

    @JavascriptInterface
    fun updateLocation(locationJson: String): Boolean {
        val location = gson.fromJson(locationJson, NovelLocation::class.java)
        scope.launch(Dispatchers.IO) {
            repository.updateLocation(location)
        }
        return true
    }

    @JavascriptInterface
    fun deleteLocation(locationId: String): Boolean {
        scope.launch(Dispatchers.IO) {
            repository.deleteLocation(locationId)
        }
        return true
    }

    // ==================== 势力 ====================

    @JavascriptInterface
    fun getFactions(workId: String): String {
        return "[]"
    }

    @JavascriptInterface
    fun createFaction(workId: String, name: String, leader: String): String {
        val faction = NovelFaction(
            id = UUID.randomUUID().toString(),
            workId = workId,
            name = name,
            leader = leader
        )
        scope.launch(Dispatchers.IO) {
            repository.insertFaction(faction)
        }
        return faction.id
    }

    @JavascriptInterface
    fun updateFaction(factionJson: String): Boolean {
        val faction = gson.fromJson(factionJson, NovelFaction::class.java)
        scope.launch(Dispatchers.IO) {
            repository.updateFaction(faction)
        }
        return true
    }

    @JavascriptInterface
    fun deleteFaction(factionId: String): Boolean {
        scope.launch(Dispatchers.IO) {
            repository.deleteFaction(factionId)
        }
        return true
    }

    // ==================== 道具 ====================

    @JavascriptInterface
    fun getItems(workId: String): String {
        return "[]"
    }

    @JavascriptInterface
    fun createItem(workId: String, name: String, description: String): String {
        val item = NovelItem(
            id = UUID.randomUUID().toString(),
            workId = workId,
            name = name,
            description = description
        )
        scope.launch(Dispatchers.IO) {
            repository.insertItem(item)
        }
        return item.id
    }

    @JavascriptInterface
    fun updateItem(itemJson: String): Boolean {
        val item = gson.fromJson(itemJson, NovelItem::class.java)
        scope.launch(Dispatchers.IO) {
            repository.updateItem(item)
        }
        return true
    }

    @JavascriptInterface
    fun deleteItem(itemId: String): Boolean {
        scope.launch(Dispatchers.IO) {
            repository.deleteItem(itemId)
        }
        return true
    }

    // ==================== 伏笔 ====================

    @JavascriptInterface
    fun getPlotHooks(workId: String): String {
        return "[]"
    }

    @JavascriptInterface
    fun createPlotHook(workId: String, content: String): String {
        val hook = PlotHook(
            id = UUID.randomUUID().toString(),
            workId = workId,
            content = content
        )
        scope.launch(Dispatchers.IO) {
            repository.insertPlotHook(hook)
        }
        return hook.id
    }

    @JavascriptInterface
    fun updatePlotHook(hookJson: String): Boolean {
        val hook = gson.fromJson(hookJson, PlotHook::class.java)
        scope.launch(Dispatchers.IO) {
            repository.updatePlotHook(hook)
        }
        return true
    }

    @JavascriptInterface
    fun deletePlotHook(hookId: String): Boolean {
        scope.launch(Dispatchers.IO) {
            repository.deletePlotHook(hookId)
        }
        return true
    }

    // ==================== 参考资料 ====================

    @JavascriptInterface
    fun getReferences(workId: String): String {
        return "[]"
    }

    @JavascriptInterface
    fun createReference(workId: String, title: String, content: String): String {
        val reference = ReferenceMaterial(
            id = UUID.randomUUID().toString(),
            workId = workId,
            title = title,
            content = content
        )
        scope.launch(Dispatchers.IO) {
            repository.insertReference(reference)
        }
        return reference.id
    }

    @JavascriptInterface
    fun updateReference(referenceJson: String): Boolean {
        val reference = gson.fromJson(referenceJson, ReferenceMaterial::class.java)
        scope.launch(Dispatchers.IO) {
            repository.updateReference(reference)
        }
        return true
    }

    @JavascriptInterface
    fun deleteReference(referenceId: String): Boolean {
        scope.launch(Dispatchers.IO) {
            repository.deleteReference(referenceId)
        }
        return true
    }

    // ==================== 写作待办 ====================

    @JavascriptInterface
    fun getTodos(workId: String): String {
        return "[]"
    }

    @JavascriptInterface
    fun createTodo(workId: String, content: String, priority: Int): String {
        val todo = WritingTodo(
            id = UUID.randomUUID().toString(),
            workId = workId,
            content = content,
            priority = priority
        )
        scope.launch(Dispatchers.IO) {
            repository.insertTodo(todo)
        }
        return todo.id
    }

    @JavascriptInterface
    fun updateTodo(todoJson: String): Boolean {
        val todo = gson.fromJson(todoJson, WritingTodo::class.java)
        scope.launch(Dispatchers.IO) {
            repository.updateTodo(todo)
        }
        return true
    }

    @JavascriptInterface
    fun deleteTodo(todoId: String): Boolean {
        scope.launch(Dispatchers.IO) {
            repository.deleteTodo(todoId)
        }
        return true
    }

    // ==================== 角色关系 ====================

    @JavascriptInterface
    fun getCharacterRelationships(workId: String): String {
        return "[]"
    }

    @JavascriptInterface
    fun createCharacterRelationship(workId: String, sourceId: String, targetId: String, relationType: String): String {
        val relationship = CharacterRelationship(
            id = UUID.randomUUID().toString(),
            workId = workId,
            sourceCharacterId = sourceId,
            targetCharacterId = targetId,
            relationType = relationType
        )
        scope.launch(Dispatchers.IO) {
            repository.insertCharacterRelationship(relationship)
        }
        return relationship.id
    }

    @JavascriptInterface
    fun updateCharacterRelationship(relationshipJson: String): Boolean {
        val relationship = gson.fromJson(relationshipJson, CharacterRelationship::class.java)
        scope.launch(Dispatchers.IO) {
            repository.updateCharacterRelationship(relationship)
        }
        return true
    }

    @JavascriptInterface
    fun deleteCharacterRelationship(relationshipId: String): Boolean {
        scope.launch(Dispatchers.IO) {
            repository.deleteCharacterRelationship(relationshipId)
        }
        return true
    }

    // ==================== 事件 ====================

    @JavascriptInterface
    fun getNovelEvents(workId: String): String {
        return "[]"
    }

    @JavascriptInterface
    fun createNovelEvent(workId: String, title: String, description: String): String {
        val event = NovelEvent(
            id = UUID.randomUUID().toString(),
            workId = workId,
            title = title,
            description = description
        )
        scope.launch(Dispatchers.IO) {
            repository.insertNovelEvent(event)
        }
        return event.id
    }

    @JavascriptInterface
    fun updateNovelEvent(eventJson: String): Boolean {
        val event = gson.fromJson(eventJson, NovelEvent::class.java)
        scope.launch(Dispatchers.IO) {
            repository.updateNovelEvent(event)
        }
        return true
    }

    @JavascriptInterface
    fun deleteNovelEvent(eventId: String): Boolean {
        scope.launch(Dispatchers.IO) {
            repository.deleteNovelEvent(eventId)
        }
        return true
    }

    // ==================== 事件参与者 ====================

    @JavascriptInterface
    fun getEventParticipants(eventId: String): String {
        return "[]"
    }

    @JavascriptInterface
    fun addEventParticipant(eventId: String, characterId: String, role: String): Boolean {
        val participant = NovelEventParticipant(
            id = UUID.randomUUID().toString(),
            eventId = eventId,
            characterId = characterId,
            role = role
        )
        scope.launch(Dispatchers.IO) {
            repository.insertNovelEventParticipant(participant)
        }
        return true
    }

    @JavascriptInterface
    fun removeEventParticipant(eventId: String, characterId: String): Boolean {
        scope.launch(Dispatchers.IO) {
            repository.deleteNovelEventParticipant(eventId, characterId)
        }
        return true
    }

    // ==================== 番茄预设 ====================

    @JavascriptInterface
    fun getTomatoPresets(): String {
        return "[]"
    }

    @JavascriptInterface
    fun getTomatoPresetById(presetId: String): String {
        return "{}"
    }

    // ==================== 写作统计 ====================

    @JavascriptInterface
    fun getWritingStats(workId: String): String {
        // 返回 JSON 格式的统计数据
        return "{}"
    }
}
