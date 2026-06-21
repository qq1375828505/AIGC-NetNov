package com.ai.assistance.novelide.bridge

import android.webkit.JavascriptInterface
import com.ai.assistance.novelide.data.model.novel.*
import com.ai.assistance.novelide.data.repository.novel.NovelRepository
import com.google.gson.Gson
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import java.util.UUID

/**
 * 网文写作 NativeBridge
 * 提供给 HTML 前端调用的 JavaScript 接口
 *
 * 所有写操作使用 runBlocking(Dispatchers.IO) 同步执行，
 * 返回统一 JSON 格式：成功 {"success": true, "id": "xxx"} 或 {"success": true}，
 * 失败 {"success": false, "error": "错误信息"}
 */
class NovelNativeBridge(
    private val repository: NovelRepository,
    private val scope: CoroutineScope
) {

    private val gson = Gson()

    // ==================== 作品 ====================

    @JavascriptInterface
    fun getNovelWorks(): String {
        return runBlocking(Dispatchers.IO) {
            try {
                val works = repository.getAllWorks().first()
                gson.toJson(works)
            } catch (e: Exception) {
                e.printStackTrace()
                "[]"
            }
        }
    }

    @JavascriptInterface
    fun createWork(title: String, genre: String, description: String): String {
        return runBlocking(Dispatchers.IO) {
            try {
                val work = NovelWork(
                    id = UUID.randomUUID().toString(),
                    title = title,
                    genre = genre,
                    description = description
                )
                repository.insertWork(work)
                gson.toJson(mapOf("success" to true, "id" to work.id))
            } catch (e: Exception) {
                e.printStackTrace()
                gson.toJson(mapOf("success" to false, "error" to e.message))
            }
        }
    }

    @JavascriptInterface
    fun updateWork(workJson: String): String {
        return runBlocking(Dispatchers.IO) {
            try {
                val work = gson.fromJson(workJson, NovelWork::class.java)
                repository.updateWork(work)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                gson.toJson(mapOf("success" to false, "error" to e.message))
            }
        }
    }

    @JavascriptInterface
    fun deleteWork(workId: String): String {
        return runBlocking(Dispatchers.IO) {
            try {
                repository.deleteWork(workId)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                gson.toJson(mapOf("success" to false, "error" to e.message))
            }
        }
    }

    // ==================== 章节 ====================

    @JavascriptInterface
    fun getChapters(workId: String): String {
        return runBlocking(Dispatchers.IO) {
            try {
                val chapters = repository.getChaptersByWorkId(workId).first()
                gson.toJson(chapters)
            } catch (e: Exception) {
                e.printStackTrace()
                "[]"
            }
        }
    }

    @JavascriptInterface
    fun createChapter(workId: String, title: String, order: Int): String {
        return runBlocking(Dispatchers.IO) {
            try {
                val chapter = Chapter(
                    id = UUID.randomUUID().toString(),
                    workId = workId,
                    title = title,
                    sortOrder = order
                )
                repository.insertChapter(chapter)
                gson.toJson(mapOf("success" to true, "id" to chapter.id))
            } catch (e: Exception) {
                e.printStackTrace()
                gson.toJson(mapOf("success" to false, "error" to e.message))
            }
        }
    }

    @JavascriptInterface
    fun getChapterContent(chapterId: String): String {
        return runBlocking(Dispatchers.IO) {
            try {
                val chapter = repository.getChapterById(chapterId)
                chapter?.content ?: ""
            } catch (e: Exception) {
                e.printStackTrace()
                ""
            }
        }
    }

    @JavascriptInterface
    fun saveChapterContent(chapterId: String, content: String, wordCount: Int): String {
        return runBlocking(Dispatchers.IO) {
            try {
                repository.updateChapterContent(chapterId, content, wordCount)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                gson.toJson(mapOf("success" to false, "error" to e.message))
            }
        }
    }

    @JavascriptInterface
    fun deleteChapter(chapterId: String): String {
        return runBlocking(Dispatchers.IO) {
            try {
                repository.deleteChapter(chapterId)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                gson.toJson(mapOf("success" to false, "error" to e.message))
            }
        }
    }

    @JavascriptInterface
    fun reorderChapters(workId: String, chapterIdsJson: String): String {
        return runBlocking(Dispatchers.IO) {
            try {
                val chapterIds = gson.fromJson(chapterIdsJson, Array<String>::class.java).toList()
                chapterIds.forEachIndexed { index, chapterId ->
                    val chapter = repository.getChapterById(chapterId)
                    if (chapter != null) {
                        repository.updateChapter(chapter.copy(sortOrder = index))
                    }
                }
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                gson.toJson(mapOf("success" to false, "error" to e.message))
            }
        }
    }

    // ==================== 资料 ====================

    @JavascriptInterface
    fun getCharacters(workId: String): String {
        return runBlocking(Dispatchers.IO) {
            try {
                val characters = repository.getCharactersByWorkId(workId).first()
                gson.toJson(characters)
            } catch (e: Exception) {
                e.printStackTrace()
                "[]"
            }
        }
    }

    @JavascriptInterface
    fun createCharacter(workId: String, name: String, role: String): String {
        return runBlocking(Dispatchers.IO) {
            try {
                val character = NovelCharacter(
                    id = UUID.randomUUID().toString(),
                    workId = workId,
                    name = name,
                    role = role
                )
                repository.insertCharacter(character)
                gson.toJson(mapOf("success" to true, "id" to character.id))
            } catch (e: Exception) {
                e.printStackTrace()
                gson.toJson(mapOf("success" to false, "error" to e.message))
            }
        }
    }

    @JavascriptInterface
    fun updateCharacter(characterJson: String): String {
        return runBlocking(Dispatchers.IO) {
            try {
                val character = gson.fromJson(characterJson, NovelCharacter::class.java)
                repository.updateCharacter(character)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                gson.toJson(mapOf("success" to false, "error" to e.message))
            }
        }
    }

    @JavascriptInterface
    fun deleteCharacter(characterId: String): String {
        return runBlocking(Dispatchers.IO) {
            try {
                repository.deleteCharacter(characterId)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                gson.toJson(mapOf("success" to false, "error" to e.message))
            }
        }
    }

    // ==================== 设定 ====================

    @JavascriptInterface
    fun getSettings(workId: String): String {
        return runBlocking(Dispatchers.IO) {
            try {
                val settings = repository.getSettingsByWorkId(workId).first()
                gson.toJson(settings)
            } catch (e: Exception) {
                e.printStackTrace()
                "[]"
            }
        }
    }

    @JavascriptInterface
    fun createSetting(workId: String, name: String, content: String): String {
        return runBlocking(Dispatchers.IO) {
            try {
                val setting = NovelSetting(
                    id = UUID.randomUUID().toString(),
                    workId = workId,
                    name = name,
                    content = content
                )
                repository.insertSetting(setting)
                gson.toJson(mapOf("success" to true, "id" to setting.id))
            } catch (e: Exception) {
                e.printStackTrace()
                gson.toJson(mapOf("success" to false, "error" to e.message))
            }
        }
    }

    @JavascriptInterface
    fun updateSetting(settingJson: String): String {
        return runBlocking(Dispatchers.IO) {
            try {
                val setting = gson.fromJson(settingJson, NovelSetting::class.java)
                repository.updateSetting(setting)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                gson.toJson(mapOf("success" to false, "error" to e.message))
            }
        }
    }

    @JavascriptInterface
    fun deleteSetting(settingId: String): String {
        return runBlocking(Dispatchers.IO) {
            try {
                repository.deleteSetting(settingId)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                gson.toJson(mapOf("success" to false, "error" to e.message))
            }
        }
    }

    // ==================== 地点 ====================

    @JavascriptInterface
    fun getLocations(workId: String): String {
        return runBlocking(Dispatchers.IO) {
            try {
                val locations = repository.getLocationsByWorkId(workId).first()
                gson.toJson(locations)
            } catch (e: Exception) {
                e.printStackTrace()
                "[]"
            }
        }
    }

    @JavascriptInterface
    fun createLocation(workId: String, name: String, description: String): String {
        return runBlocking(Dispatchers.IO) {
            try {
                val location = NovelLocation(
                    id = UUID.randomUUID().toString(),
                    workId = workId,
                    name = name,
                    description = description
                )
                repository.insertLocation(location)
                gson.toJson(mapOf("success" to true, "id" to location.id))
            } catch (e: Exception) {
                e.printStackTrace()
                gson.toJson(mapOf("success" to false, "error" to e.message))
            }
        }
    }

    @JavascriptInterface
    fun updateLocation(locationJson: String): String {
        return runBlocking(Dispatchers.IO) {
            try {
                val location = gson.fromJson(locationJson, NovelLocation::class.java)
                repository.updateLocation(location)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                gson.toJson(mapOf("success" to false, "error" to e.message))
            }
        }
    }

    @JavascriptInterface
    fun deleteLocation(locationId: String): String {
        return runBlocking(Dispatchers.IO) {
            try {
                repository.deleteLocation(locationId)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                gson.toJson(mapOf("success" to false, "error" to e.message))
            }
        }
    }

    // ==================== 势力 ====================

    @JavascriptInterface
    fun getFactions(workId: String): String {
        return runBlocking(Dispatchers.IO) {
            try {
                val factions = repository.getFactionsByWorkId(workId).first()
                gson.toJson(factions)
            } catch (e: Exception) {
                e.printStackTrace()
                "[]"
            }
        }
    }

    @JavascriptInterface
    fun createFaction(workId: String, name: String, leader: String): String {
        return runBlocking(Dispatchers.IO) {
            try {
                val faction = NovelFaction(
                    id = UUID.randomUUID().toString(),
                    workId = workId,
                    name = name,
                    leader = leader
                )
                repository.insertFaction(faction)
                gson.toJson(mapOf("success" to true, "id" to faction.id))
            } catch (e: Exception) {
                e.printStackTrace()
                gson.toJson(mapOf("success" to false, "error" to e.message))
            }
        }
    }

    @JavascriptInterface
    fun updateFaction(factionJson: String): String {
        return runBlocking(Dispatchers.IO) {
            try {
                val faction = gson.fromJson(factionJson, NovelFaction::class.java)
                repository.updateFaction(faction)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                gson.toJson(mapOf("success" to false, "error" to e.message))
            }
        }
    }

    @JavascriptInterface
    fun deleteFaction(factionId: String): String {
        return runBlocking(Dispatchers.IO) {
            try {
                repository.deleteFaction(factionId)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                gson.toJson(mapOf("success" to false, "error" to e.message))
            }
        }
    }

    // ==================== 道具 ====================

    @JavascriptInterface
    fun getItems(workId: String): String {
        return runBlocking(Dispatchers.IO) {
            try {
                val items = repository.getItemsByWorkId(workId).first()
                gson.toJson(items)
            } catch (e: Exception) {
                e.printStackTrace()
                "[]"
            }
        }
    }

    @JavascriptInterface
    fun createItem(workId: String, name: String, description: String): String {
        return runBlocking(Dispatchers.IO) {
            try {
                val item = NovelItem(
                    id = UUID.randomUUID().toString(),
                    workId = workId,
                    name = name,
                    description = description
                )
                repository.insertItem(item)
                gson.toJson(mapOf("success" to true, "id" to item.id))
            } catch (e: Exception) {
                e.printStackTrace()
                gson.toJson(mapOf("success" to false, "error" to e.message))
            }
        }
    }

    @JavascriptInterface
    fun updateItem(itemJson: String): String {
        return runBlocking(Dispatchers.IO) {
            try {
                val item = gson.fromJson(itemJson, NovelItem::class.java)
                repository.updateItem(item)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                gson.toJson(mapOf("success" to false, "error" to e.message))
            }
        }
    }

    @JavascriptInterface
    fun deleteItem(itemId: String): String {
        return runBlocking(Dispatchers.IO) {
            try {
                repository.deleteItem(itemId)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                gson.toJson(mapOf("success" to false, "error" to e.message))
            }
        }
    }

    // ==================== 伏笔 ====================

    @JavascriptInterface
    fun getPlotHooks(workId: String): String {
        return runBlocking(Dispatchers.IO) {
            try {
                val hooks = repository.getPlotHooksByWorkId(workId).first()
                gson.toJson(hooks)
            } catch (e: Exception) {
                e.printStackTrace()
                "[]"
            }
        }
    }

    @JavascriptInterface
    fun createPlotHook(workId: String, content: String): String {
        return runBlocking(Dispatchers.IO) {
            try {
                val hook = PlotHook(
                    id = UUID.randomUUID().toString(),
                    workId = workId,
                    content = content
                )
                repository.insertPlotHook(hook)
                gson.toJson(mapOf("success" to true, "id" to hook.id))
            } catch (e: Exception) {
                e.printStackTrace()
                gson.toJson(mapOf("success" to false, "error" to e.message))
            }
        }
    }

    @JavascriptInterface
    fun updatePlotHook(hookJson: String): String {
        return runBlocking(Dispatchers.IO) {
            try {
                val hook = gson.fromJson(hookJson, PlotHook::class.java)
                repository.updatePlotHook(hook)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                gson.toJson(mapOf("success" to false, "error" to e.message))
            }
        }
    }

    @JavascriptInterface
    fun deletePlotHook(hookId: String): String {
        return runBlocking(Dispatchers.IO) {
            try {
                repository.deletePlotHook(hookId)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                gson.toJson(mapOf("success" to false, "error" to e.message))
            }
        }
    }

    // ==================== 参考资料 ====================

    @JavascriptInterface
    fun getReferences(workId: String): String {
        return runBlocking(Dispatchers.IO) {
            try {
                val refs = repository.getReferencesByWorkId(workId).first()
                gson.toJson(refs)
            } catch (e: Exception) {
                e.printStackTrace()
                "[]"
            }
        }
    }

    @JavascriptInterface
    fun createReference(workId: String, title: String, content: String): String {
        return runBlocking(Dispatchers.IO) {
            try {
                val reference = ReferenceMaterial(
                    id = UUID.randomUUID().toString(),
                    workId = workId,
                    title = title,
                    content = content
                )
                repository.insertReference(reference)
                gson.toJson(mapOf("success" to true, "id" to reference.id))
            } catch (e: Exception) {
                e.printStackTrace()
                gson.toJson(mapOf("success" to false, "error" to e.message))
            }
        }
    }

    @JavascriptInterface
    fun updateReference(referenceJson: String): String {
        return runBlocking(Dispatchers.IO) {
            try {
                val reference = gson.fromJson(referenceJson, ReferenceMaterial::class.java)
                repository.updateReference(reference)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                gson.toJson(mapOf("success" to false, "error" to e.message))
            }
        }
    }

    @JavascriptInterface
    fun deleteReference(referenceId: String): String {
        return runBlocking(Dispatchers.IO) {
            try {
                repository.deleteReference(referenceId)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                gson.toJson(mapOf("success" to false, "error" to e.message))
            }
        }
    }

    // ==================== 写作待办 ====================

    @JavascriptInterface
    fun getTodos(workId: String): String {
        return runBlocking(Dispatchers.IO) {
            try {
                val todos = repository.getTodosByWorkId(workId).first()
                gson.toJson(todos)
            } catch (e: Exception) {
                e.printStackTrace()
                "[]"
            }
        }
    }

    @JavascriptInterface
    fun createTodo(workId: String, content: String, priority: Int): String {
        return runBlocking(Dispatchers.IO) {
            try {
                val todo = WritingTodo(
                    id = UUID.randomUUID().toString(),
                    workId = workId,
                    content = content,
                    priority = priority
                )
                repository.insertTodo(todo)
                gson.toJson(mapOf("success" to true, "id" to todo.id))
            } catch (e: Exception) {
                e.printStackTrace()
                gson.toJson(mapOf("success" to false, "error" to e.message))
            }
        }
    }

    @JavascriptInterface
    fun updateTodo(todoJson: String): String {
        return runBlocking(Dispatchers.IO) {
            try {
                val todo = gson.fromJson(todoJson, WritingTodo::class.java)
                repository.updateTodo(todo)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                gson.toJson(mapOf("success" to false, "error" to e.message))
            }
        }
    }

    @JavascriptInterface
    fun deleteTodo(todoId: String): String {
        return runBlocking(Dispatchers.IO) {
            try {
                repository.deleteTodo(todoId)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                gson.toJson(mapOf("success" to false, "error" to e.message))
            }
        }
    }

    // ==================== 角色关系 ====================

    @JavascriptInterface
    fun getCharacterRelationships(workId: String): String {
        return runBlocking(Dispatchers.IO) {
            try {
                val rels = repository.getCharacterRelationshipsByWorkId(workId).first()
                gson.toJson(rels)
            } catch (e: Exception) {
                e.printStackTrace()
                "[]"
            }
        }
    }

    @JavascriptInterface
    fun createCharacterRelationship(workId: String, sourceId: String, targetId: String, relationType: String): String {
        return runBlocking(Dispatchers.IO) {
            try {
                val relationship = CharacterRelationship(
                    id = UUID.randomUUID().toString(),
                    workId = workId,
                    sourceCharacterId = sourceId,
                    targetCharacterId = targetId,
                    relationType = relationType
                )
                repository.insertCharacterRelationship(relationship)
                gson.toJson(mapOf("success" to true, "id" to relationship.id))
            } catch (e: Exception) {
                e.printStackTrace()
                gson.toJson(mapOf("success" to false, "error" to e.message))
            }
        }
    }

    @JavascriptInterface
    fun updateCharacterRelationship(relationshipJson: String): String {
        return runBlocking(Dispatchers.IO) {
            try {
                val relationship = gson.fromJson(relationshipJson, CharacterRelationship::class.java)
                repository.updateCharacterRelationship(relationship)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                gson.toJson(mapOf("success" to false, "error" to e.message))
            }
        }
    }

    @JavascriptInterface
    fun deleteCharacterRelationship(relationshipId: String): String {
        return runBlocking(Dispatchers.IO) {
            try {
                repository.deleteCharacterRelationship(relationshipId)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                gson.toJson(mapOf("success" to false, "error" to e.message))
            }
        }
    }

    // ==================== 事件 ====================

    @JavascriptInterface
    fun getNovelEvents(workId: String): String {
        return runBlocking(Dispatchers.IO) {
            try {
                val events = repository.getNovelEventsByWorkId(workId).first()
                gson.toJson(events)
            } catch (e: Exception) {
                e.printStackTrace()
                "[]"
            }
        }
    }

    @JavascriptInterface
    fun createNovelEvent(workId: String, title: String, description: String): String {
        return runBlocking(Dispatchers.IO) {
            try {
                val event = NovelEvent(
                    id = UUID.randomUUID().toString(),
                    workId = workId,
                    title = title,
                    description = description
                )
                repository.insertNovelEvent(event)
                gson.toJson(mapOf("success" to true, "id" to event.id))
            } catch (e: Exception) {
                e.printStackTrace()
                gson.toJson(mapOf("success" to false, "error" to e.message))
            }
        }
    }

    @JavascriptInterface
    fun updateNovelEvent(eventJson: String): String {
        return runBlocking(Dispatchers.IO) {
            try {
                val event = gson.fromJson(eventJson, NovelEvent::class.java)
                repository.updateNovelEvent(event)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                gson.toJson(mapOf("success" to false, "error" to e.message))
            }
        }
    }

    @JavascriptInterface
    fun deleteNovelEvent(eventId: String): String {
        return runBlocking(Dispatchers.IO) {
            try {
                repository.deleteNovelEvent(eventId)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                gson.toJson(mapOf("success" to false, "error" to e.message))
            }
        }
    }

    // ==================== 事件参与者 ====================

    @JavascriptInterface
    fun getEventParticipants(eventId: String): String {
        return runBlocking(Dispatchers.IO) {
            try {
                val participants = repository.getNovelEventParticipantsByEventId(eventId).first()
                gson.toJson(participants)
            } catch (e: Exception) {
                e.printStackTrace()
                "[]"
            }
        }
    }

    @JavascriptInterface
    fun addEventParticipant(eventId: String, characterId: String, role: String): String {
        return runBlocking(Dispatchers.IO) {
            try {
                val participant = NovelEventParticipant(
                    id = UUID.randomUUID().toString(),
                    eventId = eventId,
                    characterId = characterId,
                    role = role
                )
                repository.insertNovelEventParticipant(participant)
                gson.toJson(mapOf("success" to true, "id" to participant.id))
            } catch (e: Exception) {
                e.printStackTrace()
                gson.toJson(mapOf("success" to false, "error" to e.message))
            }
        }
    }

    @JavascriptInterface
    fun removeEventParticipant(eventId: String, characterId: String): String {
        return runBlocking(Dispatchers.IO) {
            try {
                repository.deleteNovelEventParticipant(eventId, characterId)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                gson.toJson(mapOf("success" to false, "error" to e.message))
            }
        }
    }

    // ==================== 番茄预设 ====================

    @JavascriptInterface
    fun getTomatoPresets(): String {
        return runBlocking(Dispatchers.IO) {
            try {
                val presets = repository.getAllTomatoPresets().first()
                gson.toJson(presets)
            } catch (e: Exception) {
                e.printStackTrace()
                "[]"
            }
        }
    }

    @JavascriptInterface
    fun getTomatoPresetById(presetId: String): String {
        return runBlocking(Dispatchers.IO) {
            try {
                val preset = repository.getTomatoPresetById(presetId)
                if (preset != null) gson.toJson(preset) else "{}"
            } catch (e: Exception) {
                e.printStackTrace()
                "{}"
            }
        }
    }

    // ==================== 写作统计 ====================

    @JavascriptInterface
    fun getWritingStats(workId: String): String {
        return runBlocking(Dispatchers.IO) {
            try {
                val chapters = repository.getChaptersByWorkId(workId).first()
                val totalWords = chapters.sumOf { it.wordCount }
                val totalChapters = chapters.size
                val stats = mapOf(
                    "totalWords" to totalWords,
                    "totalChapters" to totalChapters,
                    "workId" to workId
                )
                gson.toJson(stats)
            } catch (e: Exception) {
                e.printStackTrace()
                "{}"
            }
        }
    }
}
