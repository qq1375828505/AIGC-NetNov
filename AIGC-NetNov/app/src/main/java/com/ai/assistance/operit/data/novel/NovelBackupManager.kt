package com.ai.assistance.operit.data.novel

import android.content.Context
import android.net.Uri
import com.ai.assistance.novelide.data.model.novel.*
import com.ai.assistance.novelide.data.repository.novel.NovelRepository
import com.google.gson.Gson
import com.google.gson.GsonBuilder
import kotlinx.coroutines.flow.first
import java.io.File
import java.io.InputStream
import java.io.OutputStream
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.zip.ZipEntry
import java.util.zip.ZipInputStream
import java.util.zip.ZipOutputStream

/**
 * 小说作品备份恢复管理器
 * 支持单个作品备份和完整数据备份
 */
class NovelBackupManager(
    private val context: Context,
    private val repository: NovelRepository
) {

    private val gson: Gson = GsonBuilder().setPrettyPrinting().create()
    private val dateFormatter = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault())

    /**
     * 备份结果
     */
    data class BackupResult(
        val success: Boolean,
        val message: String,
        val backupPath: String? = null
    )

    /**
     * 恢复结果
     */
    data class RestoreResult(
        val success: Boolean,
        val message: String,
        val restoredWorkCount: Int = 0,
        val restoredChapterCount: Int = 0
    )

    /**
     * 备份单个作品
     * @param workId 作品ID
     * @param outputStream 输出流
     */
    suspend fun backupWork(workId: String, outputStream: OutputStream): BackupResult {
        return try {
            // 获取作品数据
            val work = repository.getWorkById(workId)
                ?: return BackupResult(false, "作品不存在")

            // 获取相关数据
            val chapters = repository.getChaptersByWorkId(workId).first()
            val characters = repository.getCharactersByWorkId(workId).first()
            val settings = repository.getSettingsByWorkId(workId).first()
            val locations = repository.getLocationsByWorkId(workId).first()
            val factions = repository.getFactionsByWorkId(workId).first()
            val items = repository.getItemsByWorkId(workId).first()
            val plotHooks = repository.getPlotHooksByWorkId(workId).first()
            val references = repository.getReferencesByWorkId(workId).first()
            val todos = repository.getTodosByWorkId(workId).first()
            val relationships = repository.getCharacterRelationshipsByWorkId(workId).first()
            val events = repository.getNovelEventsByWorkId(workId).first()
            val volumes = repository.getVolumesByWorkId(workId).first()
            val customFolders = repository.getCustomMaterialFoldersByWorkId(workId).first()
            val settingReminders = repository.getSettingRemindersByWorkId(workId).first()

            // 构建备份数据
            val backupData = mapOf(
                "version" to "1.0",
                "backupTime" to System.currentTimeMillis(),
                "work" to work,
                "chapters" to chapters,
                "characters" to characters,
                "settings" to settings,
                "locations" to locations,
                "factions" to factions,
                "items" to items,
                "plotHooks" to plotHooks,
                "references" to references,
                "todos" to todos,
                "relationships" to relationships,
                "events" to events,
                "volumes" to volumes,
                "customFolders" to customFolders,
                "settingReminders" to settingReminders
            )

            // 写入 JSON
            val json = gson.toJson(backupData)
            outputStream.write(json.toByteArray(Charsets.UTF_8))

            BackupResult(true, "备份成功")
        } catch (e: Exception) {
            BackupResult(false, "备份失败: ${e.message}")
        }
    }

    /**
     * 备份所有作品（完整备份）
     * @param outputStream 输出流
     */
    suspend fun backupAll(outputStream: OutputStream): BackupResult {
        return try {
            val works = repository.getAllWorks().first()
            val allData = mutableListOf<Map<String, Any>>()

            for (work in works) {
                val chapters = repository.getChaptersByWorkId(work.id).first()
                val characters = repository.getCharactersByWorkId(work.id).first()
                val settings = repository.getSettingsByWorkId(work.id).first()
                val locations = repository.getLocationsByWorkId(work.id).first()
                val factions = repository.getFactionsByWorkId(work.id).first()
                val items = repository.getItemsByWorkId(work.id).first()
                val plotHooks = repository.getPlotHooksByWorkId(work.id).first()
                val references = repository.getReferencesByWorkId(work.id).first()
                val todos = repository.getTodosByWorkId(work.id).first()
                val relationships = repository.getCharacterRelationshipsByWorkId(work.id).first()
                val events = repository.getNovelEventsByWorkId(work.id).first()
                val volumes = repository.getVolumesByWorkId(work.id).first()
                val customFolders = repository.getCustomMaterialFoldersByWorkId(work.id).first()
                val settingReminders = repository.getSettingRemindersByWorkId(work.id).first()

                val workData = mapOf(
                    "work" to work,
                    "chapters" to chapters,
                    "characters" to characters,
                    "settings" to settings,
                    "locations" to locations,
                    "factions" to factions,
                    "items" to items,
                    "plotHooks" to plotHooks,
                    "references" to references,
                    "todos" to todos,
                    "relationships" to relationships,
                    "events" to events,
                    "volumes" to volumes,
                    "customFolders" to customFolders,
                    "settingReminders" to settingReminders
                )
                allData.add(workData)
            }

            val backupData = mapOf(
                "version" to "1.0",
                "backupTime" to System.currentTimeMillis(),
                "type" to "full",
                "works" to allData
            )

            val json = gson.toJson(backupData)
            outputStream.write(json.toByteArray(Charsets.UTF_8))

            BackupResult(true, "完整备份成功，共 ${works.size} 部作品")
        } catch (e: Exception) {
            BackupResult(false, "完整备份失败: ${e.message}")
        }
    }

    /**
     * 从输入流恢复作品
     * @param inputStream 输入流
     * @param mergeMode 合并模式：true=合并到现有作品，false=创建新作品
     */
    suspend fun restore(inputStream: InputStream, mergeMode: Boolean = false): RestoreResult {
        return try {
            val content = inputStream.bufferedReader(Charsets.UTF_8).use { it.readText() }
            val type = object : com.google.gson.reflect.TypeToken<Map<String, Any>>() {}.type
            val data: Map<String, Any> = gson.fromJson(content, type)

            val backupType = data["type"] as? String

            if (backupType == "full") {
                restoreFullBackup(data, mergeMode)
            } else {
                restoreSingleWork(data, mergeMode)
            }
        } catch (e: Exception) {
            RestoreResult(false, "恢复失败: ${e.message}")
        }
    }

    /**
     * 恢复单个作品备份
     */
    private suspend fun restoreSingleWork(data: Map<String, Any>, mergeMode: Boolean): RestoreResult {
        var restoredWorkCount = 0
        var restoredChapterCount = 0

        @Suppress("UNCHECKED_CAST")
        val workMap = data["work"] as? Map<String, Any> ?: return RestoreResult(false, "备份数据格式错误")
        val workJson = gson.toJson(workMap)
        val work = gson.fromJson(workJson, NovelWork::class.java)

        // 确定作品ID
        val workId = if (mergeMode) {
            // 合并模式：使用现有作品ID或创建新ID
            val existingWork = repository.getWorkById(work.id)
            if (existingWork != null) work.id else {
                val newWork = work.copy(id = java.util.UUID.randomUUID().toString())
                repository.insertWork(newWork)
                restoredWorkCount++
                newWork.id
            }
        } else {
            // 创建新作品
            val newWork = work.copy(id = java.util.UUID.randomUUID().toString())
            repository.insertWork(newWork)
            restoredWorkCount++
            newWork.id
        }

        // 恢复章节
        @Suppress("UNCHECKED_CAST")
        val chaptersList = data["chapters"] as? List<*> ?: emptyList<Any>()
        for (chapterData in chaptersList) {
            val chapterJson = gson.toJson(chapterData)
            val chapter = gson.fromJson(chapterJson, Chapter::class.java)
            val newChapter = chapter.copy(
                id = java.util.UUID.randomUUID().toString(),
                workId = workId
            )
            repository.insertChapter(newChapter)
            restoredChapterCount++
        }

        // 恢复角色
        @Suppress("UNCHECKED_CAST")
        val charactersList = data["characters"] as? List<*> ?: emptyList<Any>()
        for (characterData in charactersList) {
            val characterJson = gson.toJson(characterData)
            val character = gson.fromJson(characterJson, NovelCharacter::class.java)
            val newCharacter = character.copy(
                id = java.util.UUID.randomUUID().toString(),
                workId = workId
            )
            repository.insertCharacter(newCharacter)
        }

        // 恢复设定
        @Suppress("UNCHECKED_CAST")
        val settingsList = data["settings"] as? List<*> ?: emptyList<Any>()
        for (settingData in settingsList) {
            val settingJson = gson.toJson(settingData)
            val setting = gson.fromJson(settingJson, NovelSetting::class.java)
            val newSetting = setting.copy(
                id = java.util.UUID.randomUUID().toString(),
                workId = workId
            )
            repository.insertSetting(newSetting)
        }

        // 恢复地点
        @Suppress("UNCHECKED_CAST")
        val locationsList = data["locations"] as? List<*> ?: emptyList<Any>()
        for (locationData in locationsList) {
            val locationJson = gson.toJson(locationData)
            val location = gson.fromJson(locationJson, NovelLocation::class.java)
            val newLocation = location.copy(
                id = java.util.UUID.randomUUID().toString(),
                workId = workId
            )
            repository.insertLocation(newLocation)
        }

        // 恢复势力
        @Suppress("UNCHECKED_CAST")
        val factionsList = data["factions"] as? List<*> ?: emptyList<Any>()
        for (factionData in factionsList) {
            val factionJson = gson.toJson(factionData)
            val faction = gson.fromJson(factionJson, NovelFaction::class.java)
            val newFaction = faction.copy(
                id = java.util.UUID.randomUUID().toString(),
                workId = workId
            )
            repository.insertFaction(newFaction)
        }

        // 恢复道具
        @Suppress("UNCHECKED_CAST")
        val itemsList = data["items"] as? List<*> ?: emptyList<Any>()
        for (itemData in itemsList) {
            val itemJson = gson.toJson(itemData)
            val item = gson.fromJson(itemJson, NovelItem::class.java)
            val newItem = item.copy(
                id = java.util.UUID.randomUUID().toString(),
                workId = workId
            )
            repository.insertItem(newItem)
        }

        // 恢复伏笔
        @Suppress("UNCHECKED_CAST")
        val plotHooksList = data["plotHooks"] as? List<*> ?: emptyList<Any>()
        for (hookData in plotHooksList) {
            val hookJson = gson.toJson(hookData)
            val hook = gson.fromJson(hookJson, PlotHook::class.java)
            val newHook = hook.copy(
                id = java.util.UUID.randomUUID().toString(),
                workId = workId
            )
            repository.insertPlotHook(newHook)
        }

        // 恢复参考资料
        @Suppress("UNCHECKED_CAST")
        val referencesList = data["references"] as? List<*> ?: emptyList<Any>()
        for (referenceData in referencesList) {
            val referenceJson = gson.toJson(referenceData)
            val reference = gson.fromJson(referenceJson, ReferenceMaterial::class.java)
            val newReference = reference.copy(
                id = java.util.UUID.randomUUID().toString(),
                workId = workId
            )
            repository.insertReference(newReference)
        }

        // 恢复写作待办
        @Suppress("UNCHECKED_CAST")
        val todosList = data["todos"] as? List<*> ?: emptyList<Any>()
        for (todoData in todosList) {
            val todoJson = gson.toJson(todoData)
            val todo = gson.fromJson(todoJson, WritingTodo::class.java)
            val newTodo = todo.copy(
                id = java.util.UUID.randomUUID().toString(),
                workId = workId
            )
            repository.insertTodo(newTodo)
        }

        return RestoreResult(
            success = true,
            message = "恢复成功",
            restoredWorkCount = restoredWorkCount,
            restoredChapterCount = restoredChapterCount
        )
    }

    /**
     * 恢复完整备份
     */
    private suspend fun restoreFullBackup(data: Map<String, Any>, mergeMode: Boolean): RestoreResult {
        var restoredWorkCount = 0
        var restoredChapterCount = 0

        @Suppress("UNCHECKED_CAST")
        val worksList = data["works"] as? List<*> ?: return RestoreResult(false, "备份数据格式错误")

        for (workData in worksList) {
            @Suppress("UNCHECKED_CAST")
            val workMap = workData as? Map<String, Any> ?: continue
            val result = restoreSingleWork(workMap, mergeMode)
            if (result.success) {
                restoredWorkCount += result.restoredWorkCount
                restoredChapterCount += result.restoredChapterCount
            }
        }

        return RestoreResult(
            success = true,
            message = "完整恢复成功",
            restoredWorkCount = restoredWorkCount,
            restoredChapterCount = restoredChapterCount
        )
    }

    /**
     * 生成备份文件名
     */
    fun generateBackupFileName(workTitle: String? = null): String {
        val timestamp = dateFormatter.format(Date())
        return if (workTitle != null) {
            "novel_backup_${workTitle}_$timestamp.json"
        } else {
            "novel_backup_all_$timestamp.json"
        }
    }
}
