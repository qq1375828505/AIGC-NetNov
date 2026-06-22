package com.ai.assistance.operit.data.novel

import android.content.Context
import android.net.Uri
import com.ai.assistance.novelide.data.model.novel.*
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import java.io.InputStream
import java.util.UUID

/**
 * 小说作品导入器
 * 支持 TXT、Markdown、JSON 三种格式
 */
class NovelImporter(private val context: Context) {

    private val gson = Gson()

    /**
     * 导入格式枚举
     */
    enum class ImportFormat {
        TXT, MARKDOWN, JSON
    }

    /**
     * 导入结果
     */
    data class ImportResult(
        val success: Boolean,
        val message: String,
        val work: NovelWork? = null,
        val chapters: List<Chapter> = emptyList(),
        val characters: List<NovelCharacter> = emptyList(),
        val settings: List<NovelSetting> = emptyList(),
        val locations: List<NovelLocation> = emptyList()
    )

    /**
     * 从输入流导入作品
     * @param inputStream 输入流
     * @param format 导入格式
     * @param targetWorkId 目标作品ID（可选，为空则创建新作品）
     */
    suspend fun import(
        inputStream: InputStream,
        format: ImportFormat,
        targetWorkId: String? = null
    ): ImportResult {
        return try {
            val content = inputStream.bufferedReader(Charsets.UTF_8).use { it.readText() }

            when (format) {
                ImportFormat.TXT -> importFromTxt(content, targetWorkId)
                ImportFormat.MARKDOWN -> importFromMarkdown(content, targetWorkId)
                ImportFormat.JSON -> importFromJson(content, targetWorkId)
            }
        } catch (e: Exception) {
            ImportResult(false, "导入失败: ${e.message}")
        }
    }

    /**
     * 从 TXT 格式导入
     */
    private fun importFromTxt(content: String, targetWorkId: String?): ImportResult {
        val lines = content.lines()
        val title = extractTitleFromTxt(lines) ?: "未命名作品"

        // 创建作品
        val work = NovelWork(
            id = targetWorkId ?: UUID.randomUUID().toString(),
            title = title,
            genre = extractGenreFromTxt(lines),
            description = extractDescriptionFromTxt(lines)
        )

        // 提取章节
        val chapters = extractChaptersFromTxt(lines, work.id)

        // 提取角色
        val characters = extractCharactersFromTxt(lines, work.id)

        // 提取设定
        val settings = extractSettingsFromTxt(lines, work.id)

        // 提取地点
        val locations = extractLocationsFromTxt(lines, work.id)

        return ImportResult(
            success = true,
            message = "导入成功",
            work = work,
            chapters = chapters,
            characters = characters,
            settings = settings,
            locations = locations
        )
    }

    /**
     * 从 Markdown 格式导入
     */
    private fun importFromMarkdown(content: String, targetWorkId: String?): ImportResult {
        val lines = content.lines()

        // 提取 YAML Front Matter
        val frontMatter = extractFrontMatter(lines)
        val title = frontMatter["title"] ?: extractTitleFromMarkdown(lines) ?: "未命名作品"

        // 创建作品
        val work = NovelWork(
            id = targetWorkId ?: UUID.randomUUID().toString(),
            title = title,
            genre = frontMatter["genre"] ?: "",
            description = extractDescriptionFromMarkdown(lines),
            status = frontMatter["status"] ?: "ongoing"
        )

        // 提取章节
        val chapters = extractChaptersFromMarkdown(lines, work.id)

        // 提取角色
        val characters = extractCharactersFromMarkdown(lines, work.id)

        // 提取设定
        val settings = extractSettingsFromMarkdown(lines, work.id)

        // 提取地点
        val locations = extractLocationsFromMarkdown(lines, work.id)

        return ImportResult(
            success = true,
            message = "导入成功",
            work = work,
            chapters = chapters,
            characters = characters,
            settings = settings,
            locations = locations
        )
    }

    /**
     * 从 JSON 格式导入
     */
    private fun importFromJson(content: String, targetWorkId: String?): ImportResult {
        val type = object : TypeToken<Map<String, Any>>() {}.type
        val data: Map<String, Any> = gson.fromJson(content, type)

        // 提取作品数据
        val workMap = data["work"] as? Map<*, *>
        val work = if (workMap != null) {
            val workJson = gson.toJson(workMap)
            val originalWork = gson.fromJson(workJson, NovelWork::class.java)
            if (targetWorkId != null) {
                originalWork.copy(id = targetWorkId)
            } else {
                originalWork
            }
        } else {
            NovelWork(
                id = targetWorkId ?: UUID.randomUUID().toString(),
                title = "未命名作品"
            )
        }

        // 提取章节
        val chaptersList = data["chapters"] as? List<*>
        val chapters = chaptersList?.map { chapterMap ->
            val chapterJson = gson.toJson(chapterMap)
            val chapter = gson.fromJson(chapterJson, Chapter::class.java)
            if (targetWorkId != null) {
                chapter.copy(id = UUID.randomUUID().toString(), workId = work.id)
            } else {
                chapter.copy(workId = work.id)
            }
        } ?: emptyList()

        // 提取角色
        val charactersList = data["characters"] as? List<*>
        val characters = charactersList?.map { characterMap ->
            val characterJson = gson.toJson(characterMap)
            val character = gson.fromJson(characterJson, NovelCharacter::class.java)
            if (targetWorkId != null) {
                character.copy(id = UUID.randomUUID().toString(), workId = work.id)
            } else {
                character.copy(workId = work.id)
            }
        } ?: emptyList()

        // 提取设定
        val settingsList = data["settings"] as? List<*>
        val settings = settingsList?.map { settingMap ->
            val settingJson = gson.toJson(settingMap)
            val setting = gson.fromJson(settingJson, NovelSetting::class.java)
            if (targetWorkId != null) {
                setting.copy(id = UUID.randomUUID().toString(), workId = work.id)
            } else {
                setting.copy(workId = work.id)
            }
        } ?: emptyList()

        // 提取地点
        val locationsList = data["locations"] as? List<*>
        val locations = locationsList?.map { locationMap ->
            val locationJson = gson.toJson(locationMap)
            val location = gson.fromJson(locationJson, NovelLocation::class.java)
            if (targetWorkId != null) {
                location.copy(id = UUID.randomUUID().toString(), workId = work.id)
            } else {
                location.copy(workId = work.id)
            }
        } ?: emptyList()

        return ImportResult(
            success = true,
            message = "导入成功",
            work = work,
            chapters = chapters,
            characters = characters,
            settings = settings,
            locations = locations
        )
    }

    // ==================== TXT 格式解析辅助方法 ====================

    private fun extractTitleFromTxt(lines: List<String>): String? {
        // 查找等号分隔符之间的标题
        for (i in lines.indices) {
            if (lines[i].trim() == "=".repeat(60) && i + 1 < lines.size) {
                return lines[i + 1].trim()
            }
        }
        return null
    }

    private fun extractGenreFromTxt(lines: List<String>): String {
        for (line in lines) {
            if (line.startsWith("类型：")) {
                return line.removePrefix("类型：").trim()
            }
        }
        return ""
    }

    private fun extractDescriptionFromTxt(lines: List<String>): String {
        for (line in lines) {
            if (line.startsWith("简介：")) {
                return line.removePrefix("简介：").trim()
            }
        }
        return ""
    }

    private fun extractChaptersFromTxt(lines: List<String>, workId: String): List<Chapter> {
        val chapters = mutableListOf<Chapter>()
        var currentChapter: Chapter? = null
        var contentBuilder = StringBuilder()
        var sortOrder = 0

        for (line in lines) {
            val chapterMatch = Regex("^第(\\d+)章\\s+(.+)").find(line.trim())
            if (chapterMatch != null) {
                // 保存上一章
                if (currentChapter != null) {
                    chapters.add(currentChapter.copy(content = contentBuilder.toString().trim()))
                    sortOrder++
                }
                // 创建新章节
                currentChapter = Chapter(
                    id = UUID.randomUUID().toString(),
                    workId = workId,
                    title = chapterMatch.groupValues[2],
                    sortOrder = sortOrder
                )
                contentBuilder = StringBuilder()
            } else if (currentChapter != null && line.trim() != "-".repeat(40)) {
                contentBuilder.appendLine(line)
            }
        }

        // 保存最后一章
        if (currentChapter != null) {
            chapters.add(currentChapter.copy(content = contentBuilder.toString().trim()))
        }

        return chapters
    }

    private fun extractCharactersFromTxt(lines: List<String>, workId: String): List<NovelCharacter> {
        val characters = mutableListOf<NovelCharacter>()
        var inCharacterSection = false
        var currentCharacter: NovelCharacter? = null

        for (line in lines) {
            val trimmed = line.trim()
            if (trimmed == "【角色列表】") {
                inCharacterSection = true
                continue
            }
            if (trimmed.startsWith("【") && inCharacterSection) {
                inCharacterSection = false
                if (currentCharacter != null) {
                    characters.add(currentCharacter)
                    currentCharacter = null
                }
                continue
            }

            if (inCharacterSection) {
                if (trimmed.startsWith("姓名：")) {
                    if (currentCharacter != null) {
                        characters.add(currentCharacter)
                    }
                    currentCharacter = NovelCharacter(
                        id = UUID.randomUUID().toString(),
                        workId = workId,
                        name = trimmed.removePrefix("姓名：").trim()
                    )
                } else if (currentCharacter != null) {
                    when {
                        trimmed.startsWith("角色：") -> {
                            currentCharacter = currentCharacter.copy(role = trimmed.removePrefix("角色：").trim())
                        }
                        trimmed.startsWith("外貌：") -> {
                            currentCharacter = currentCharacter.copy(appearance = trimmed.removePrefix("外貌：").trim())
                        }
                        trimmed.startsWith("性格：") -> {
                            currentCharacter = currentCharacter.copy(personality = trimmed.removePrefix("性格：").trim())
                        }
                        trimmed.startsWith("背景：") -> {
                            currentCharacter = currentCharacter.copy(background = trimmed.removePrefix("背景：").trim())
                        }
                    }
                }
            }
        }

        if (currentCharacter != null) {
            characters.add(currentCharacter)
        }

        return characters
    }

    private fun extractSettingsFromTxt(lines: List<String>, workId: String): List<NovelSetting> {
        val settings = mutableListOf<NovelSetting>()
        var inSettingSection = false
        var currentSetting: NovelSetting? = null
        var contentBuilder = StringBuilder()

        for (line in lines) {
            val trimmed = line.trim()
            if (trimmed == "【设定列表】") {
                inSettingSection = true
                continue
            }
            if (trimmed.startsWith("【") && inSettingSection) {
                inSettingSection = false
                if (currentSetting != null) {
                    settings.add(currentSetting.copy(content = contentBuilder.toString().trim()))
                    contentBuilder = StringBuilder()
                    currentSetting = null
                }
                continue
            }

            if (inSettingSection) {
                if (trimmed.endsWith("：") && !trimmed.startsWith(" ")) {
                    if (currentSetting != null) {
                        settings.add(currentSetting.copy(content = contentBuilder.toString().trim()))
                        contentBuilder = StringBuilder()
                    }
                    currentSetting = NovelSetting(
                        id = UUID.randomUUID().toString(),
                        workId = workId,
                        name = trimmed.removeSuffix("：").trim()
                    )
                } else if (currentSetting != null && trimmed.isNotEmpty()) {
                    contentBuilder.appendLine(trimmed)
                }
            }
        }

        if (currentSetting != null) {
            settings.add(currentSetting.copy(content = contentBuilder.toString().trim()))
        }

        return settings
    }

    private fun extractLocationsFromTxt(lines: List<String>, workId: String): List<NovelLocation> {
        val locations = mutableListOf<NovelLocation>()
        var inLocationSection = false
        var currentLocation: NovelLocation? = null
        var contentBuilder = StringBuilder()

        for (line in lines) {
            val trimmed = line.trim()
            if (trimmed == "【地点列表】") {
                inLocationSection = true
                continue
            }
            if (trimmed.startsWith("【") && inLocationSection) {
                inLocationSection = false
                if (currentLocation != null) {
                    locations.add(currentLocation.copy(description = contentBuilder.toString().trim()))
                    contentBuilder = StringBuilder()
                    currentLocation = null
                }
                continue
            }

            if (inLocationSection) {
                if (trimmed.endsWith("：") && !trimmed.startsWith(" ")) {
                    if (currentLocation != null) {
                        locations.add(currentLocation.copy(description = contentBuilder.toString().trim()))
                        contentBuilder = StringBuilder()
                    }
                    currentLocation = NovelLocation(
                        id = UUID.randomUUID().toString(),
                        workId = workId,
                        name = trimmed.removeSuffix("：").trim()
                    )
                } else if (currentLocation != null && trimmed.isNotEmpty()) {
                    contentBuilder.appendLine(trimmed)
                }
            }
        }

        if (currentLocation != null) {
            locations.add(currentLocation.copy(description = contentBuilder.toString().trim()))
        }

        return locations
    }

    // ==================== Markdown 格式解析辅助方法 ====================

    private fun extractFrontMatter(lines: List<String>): Map<String, String> {
        val result = mutableMapOf<String, String>()
        var inFrontMatter = false

        for (line in lines) {
            val trimmed = line.trim()
            if (trimmed == "---") {
                if (inFrontMatter) break
                inFrontMatter = true
                continue
            }
            if (inFrontMatter) {
                val colonIndex = trimmed.indexOf(':')
                if (colonIndex > 0) {
                    val key = trimmed.substring(0, colonIndex).trim()
                    val value = trimmed.substring(colonIndex + 1).trim()
                    result[key] = value
                }
            }
        }

        return result
    }

    private fun extractTitleFromMarkdown(lines: List<String>): String? {
        for (line in lines) {
            if (line.trim().startsWith("# ")) {
                return line.trim().removePrefix("# ").trim()
            }
        }
        return null
    }

    private fun extractDescriptionFromMarkdown(lines: List<String>): String {
        for (line in lines) {
            if (line.trim().startsWith("**简介**：")) {
                return line.trim().removePrefix("**简介**：").trim()
            }
        }
        return ""
    }

    private fun extractChaptersFromMarkdown(lines: List<String>, workId: String): List<Chapter> {
        val chapters = mutableListOf<Chapter>()
        var currentChapter: Chapter? = null
        var contentBuilder = StringBuilder()
        var sortOrder = 0

        for (line in lines) {
            val chapterMatch = Regex("^###\\s+第(\\d+)章\\s+(.+)").find(line.trim())
            if (chapterMatch != null) {
                // 保存上一章
                if (currentChapter != null) {
                    chapters.add(currentChapter.copy(content = contentBuilder.toString().trim()))
                    sortOrder++
                }
                // 创建新章节
                currentChapter = Chapter(
                    id = UUID.randomUUID().toString(),
                    workId = workId,
                    title = chapterMatch.groupValues[2],
                    sortOrder = sortOrder
                )
                contentBuilder = StringBuilder()
            } else if (currentChapter != null && line.trim() != "---") {
                contentBuilder.appendLine(line)
            }
        }

        // 保存最后一章
        if (currentChapter != null) {
            chapters.add(currentChapter.copy(content = contentBuilder.toString().trim()))
        }

        return chapters
    }

    private fun extractCharactersFromMarkdown(lines: List<String>, workId: String): List<NovelCharacter> {
        val characters = mutableListOf<NovelCharacter>()
        var inCharacterSection = false
        var currentCharacter: NovelCharacter? = null

        for (line in lines) {
            val trimmed = line.trim()
            if (trimmed == "## 角色列表") {
                inCharacterSection = true
                continue
            }
            if (trimmed.startsWith("## ") && inCharacterSection) {
                inCharacterSection = false
                continue
            }

            if (inCharacterSection) {
                // 解析表格行
                if (trimmed.startsWith("|") && !trimmed.contains("---")) {
                    val parts = trimmed.split("|").map { it.trim() }.filter { it.isNotEmpty() }
                    if (parts.size >= 2 && parts[0] != "姓名") {
                        characters.add(
                            NovelCharacter(
                                id = UUID.randomUUID().toString(),
                                workId = workId,
                                name = parts[0],
                                role = if (parts.size > 1) parts[1] else "",
                                personality = if (parts.size > 2) parts[2] else ""
                            )
                        )
                    }
                }
            }

            // 解析角色详情
            if (trimmed.startsWith("### ") && !trimmed.contains("第")) {
                val charName = trimmed.removePrefix("### ").trim()
                if (characters.none { it.name == charName }) {
                    currentCharacter = NovelCharacter(
                        id = UUID.randomUUID().toString(),
                        workId = workId,
                        name = charName
                    )
                    characters.add(currentCharacter)
                } else {
                    currentCharacter = characters.find { it.name == charName }
                }
            } else if (currentCharacter != null) {
                when {
                    trimmed.startsWith("**外貌**：") -> {
                        val idx = characters.indexOf(currentCharacter)
                        if (idx >= 0) {
                            characters[idx] = currentCharacter.copy(appearance = trimmed.removePrefix("**外貌**：").trim())
                            currentCharacter = characters[idx]
                        }
                    }
                    trimmed.startsWith("**背景**：") -> {
                        val idx = characters.indexOf(currentCharacter)
                        if (idx >= 0) {
                            characters[idx] = currentCharacter.copy(background = trimmed.removePrefix("**背景**：").trim())
                            currentCharacter = characters[idx]
                        }
                    }
                }
            }
        }

        return characters
    }

    private fun extractSettingsFromMarkdown(lines: List<String>, workId: String): List<NovelSetting> {
        val settings = mutableListOf<NovelSetting>()
        var inSettingSection = false
        var currentSetting: NovelSetting? = null
        var contentBuilder = StringBuilder()

        for (line in lines) {
            val trimmed = line.trim()
            if (trimmed == "## 设定列表") {
                inSettingSection = true
                continue
            }
            if (trimmed.startsWith("## ") && inSettingSection) {
                inSettingSection = false
                if (currentSetting != null) {
                    settings.add(currentSetting.copy(content = contentBuilder.toString().trim()))
                    contentBuilder = StringBuilder()
                    currentSetting = null
                }
                continue
            }

            if (inSettingSection) {
                if (trimmed.startsWith("### ")) {
                    if (currentSetting != null) {
                        settings.add(currentSetting.copy(content = contentBuilder.toString().trim()))
                        contentBuilder = StringBuilder()
                    }
                    currentSetting = NovelSetting(
                        id = UUID.randomUUID().toString(),
                        workId = workId,
                        name = trimmed.removePrefix("### ").trim()
                    )
                } else if (currentSetting != null && trimmed.isNotEmpty() && trimmed != "---") {
                    contentBuilder.appendLine(trimmed)
                }
            }
        }

        if (currentSetting != null) {
            settings.add(currentSetting.copy(content = contentBuilder.toString().trim()))
        }

        return settings
    }

    private fun extractLocationsFromMarkdown(lines: List<String>, workId: String): List<NovelLocation> {
        val locations = mutableListOf<NovelLocation>()
        var inLocationSection = false
        var currentLocation: NovelLocation? = null
        var contentBuilder = StringBuilder()

        for (line in lines) {
            val trimmed = line.trim()
            if (trimmed == "## 地点列表") {
                inLocationSection = true
                continue
            }
            if (trimmed.startsWith("## ") && inLocationSection) {
                inLocationSection = false
                if (currentLocation != null) {
                    locations.add(currentLocation.copy(description = contentBuilder.toString().trim()))
                    contentBuilder = StringBuilder()
                    currentLocation = null
                }
                continue
            }

            if (inLocationSection) {
                if (trimmed.startsWith("### ")) {
                    if (currentLocation != null) {
                        locations.add(currentLocation.copy(description = contentBuilder.toString().trim()))
                        contentBuilder = StringBuilder()
                    }
                    currentLocation = NovelLocation(
                        id = UUID.randomUUID().toString(),
                        workId = workId,
                        name = trimmed.removePrefix("### ").trim()
                    )
                } else if (currentLocation != null && trimmed.isNotEmpty() && trimmed != "---") {
                    contentBuilder.appendLine(trimmed)
                }
            }
        }

        if (currentLocation != null) {
            locations.add(currentLocation.copy(description = contentBuilder.toString().trim()))
        }

        return locations
    }
}
