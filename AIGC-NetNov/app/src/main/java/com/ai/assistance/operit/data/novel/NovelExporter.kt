package com.ai.assistance.operit.data.novel

import android.content.Context
import android.net.Uri
import com.ai.assistance.novelide.data.model.novel.*
import com.google.gson.Gson
import com.google.gson.GsonBuilder
import java.io.File
import java.io.OutputStream

/**
 * 小说作品导出器
 * 支持 TXT、Markdown、JSON 三种格式
 */
class NovelExporter(private val context: Context) {

    private val gson: Gson = GsonBuilder().setPrettyPrinting().create()

    /**
     * 导出格式枚举
     */
    enum class ExportFormat {
        TXT, MARKDOWN, JSON
    }

    /**
     * 导出结果
     */
    data class ExportResult(
        val success: Boolean,
        val message: String,
        val filePath: String? = null
    )

    /**
     * 导出作品为指定格式
     * @param work 作品数据
     * @param chapters 章节列表
     * @param characters 角色列表
     * @param settings 设定列表
     * @param locations 地点列表
     * @param format 导出格式
     * @param outputStream 输出流
     */
    suspend fun export(
        work: NovelWork,
        chapters: List<Chapter>,
        characters: List<NovelCharacter>,
        settings: List<NovelSetting>,
        locations: List<NovelLocation>,
        format: ExportFormat,
        outputStream: OutputStream
    ): ExportResult {
        return try {
            when (format) {
                ExportFormat.TXT -> exportToTxt(work, chapters, characters, settings, locations, outputStream)
                ExportFormat.MARKDOWN -> exportToMarkdown(work, chapters, characters, settings, locations, outputStream)
                ExportFormat.JSON -> exportToJson(work, chapters, characters, settings, locations, outputStream)
            }
            ExportResult(true, "导出成功", null)
        } catch (e: Exception) {
            ExportResult(false, "导出失败: ${e.message}")
        }
    }

    /**
     * 导出为 TXT 格式
     */
    private fun exportToTxt(
        work: NovelWork,
        chapters: List<Chapter>,
        characters: List<NovelCharacter>,
        settings: List<NovelSetting>,
        locations: List<NovelLocation>,
        outputStream: OutputStream
    ) {
        val sb = StringBuilder()

        // 标题
        sb.appendLine("=".repeat(60))
        sb.appendLine(work.title.center(60))
        sb.appendLine("=".repeat(60))
        sb.appendLine()

        // 作品信息
        sb.appendLine("类型：${work.genre.ifEmpty { "未设置" }}")
        sb.appendLine("状态：${formatStatus(work.status)}")
        sb.appendLine("简介：${work.description.ifEmpty { "暂无简介" }}")
        sb.appendLine("字数：${work.currentWordCount}")
        sb.appendLine("章数：${chapters.size}")
        sb.appendLine()
        sb.appendLine("-".repeat(60))
        sb.appendLine()

        // 角色信息
        if (characters.isNotEmpty()) {
            sb.appendLine("【角色列表】")
            sb.appendLine()
            for (character in characters) {
                sb.appendLine("姓名：${character.name}")
                sb.appendLine("角色：${character.role.ifEmpty { "未设置" }}")
                if (character.appearance.isNotEmpty()) {
                    sb.appendLine("外貌：${character.appearance}")
                }
                if (character.personality.isNotEmpty()) {
                    sb.appendLine("性格：${character.personality}")
                }
                if (character.background.isNotEmpty()) {
                    sb.appendLine("背景：${character.background}")
                }
                sb.appendLine()
            }
            sb.appendLine("-".repeat(60))
            sb.appendLine()
        }

        // 设定信息
        if (settings.isNotEmpty()) {
            sb.appendLine("【设定列表】")
            sb.appendLine()
            for (setting in settings) {
                sb.appendLine("${setting.name}：")
                sb.appendLine(setting.content)
                sb.appendLine()
            }
            sb.appendLine("-".repeat(60))
            sb.appendLine()
        }

        // 地点信息
        if (locations.isNotEmpty()) {
            sb.appendLine("【地点列表】")
            sb.appendLine()
            for (location in locations) {
                sb.appendLine("${location.name}：")
                sb.appendLine(location.description)
                sb.appendLine()
            }
            sb.appendLine("-".repeat(60))
            sb.appendLine()
        }

        // 章节内容
        sb.appendLine("【正文】")
        sb.appendLine()
        for ((index, chapter) in chapters.withIndex()) {
            sb.appendLine("第${index + 1}章 ${chapter.title}")
            sb.appendLine()
            if (chapter.content.isNotEmpty()) {
                sb.appendLine(chapter.content)
            } else {
                sb.appendLine("（本章暂无内容）")
            }
            sb.appendLine()
            sb.appendLine("-".repeat(40))
            sb.appendLine()
        }

        outputStream.write(sb.toString().toByteArray(Charsets.UTF_8))
    }

    /**
     * 导出为 Markdown 格式
     */
    private fun exportToMarkdown(
        work: NovelWork,
        chapters: List<Chapter>,
        characters: List<NovelCharacter>,
        settings: List<NovelSetting>,
        locations: List<NovelLocation>,
        outputStream: OutputStream
    ) {
        val sb = StringBuilder()

        // YAML Front Matter
        sb.appendLine("---")
        sb.appendLine("title: ${work.title}")
        sb.appendLine("genre: ${work.genre}")
        sb.appendLine("status: ${work.status}")
        sb.appendLine("word_count: ${work.currentWordCount}")
        sb.appendLine("chapter_count: ${chapters.size}")
        sb.appendLine("---")
        sb.appendLine()

        // 标题
        sb.appendLine("# ${work.title}")
        sb.appendLine()

        // 作品信息
        sb.appendLine("## 作品信息")
        sb.appendLine()
        sb.appendLine("- **类型**：${work.genre.ifEmpty { "未设置" }}")
        sb.appendLine("- **状态**：${formatStatus(work.status)}")
        sb.appendLine("- **字数**：${work.currentWordCount}")
        sb.appendLine("- **章数**：${chapters.size}")
        sb.appendLine()
        if (work.description.isNotEmpty()) {
            sb.appendLine("**简介**：${work.description}")
            sb.appendLine()
        }
        sb.appendLine("---")
        sb.appendLine()

        // 角色信息
        if (characters.isNotEmpty()) {
            sb.appendLine("## 角色列表")
            sb.appendLine()
            sb.appendLine("| 姓名 | 角色 | 性格 |")
            sb.appendLine("|------|------|------|")
            for (character in characters) {
                sb.appendLine("| ${character.name} | ${character.role.ifEmpty { "未设置" }} | ${character.personality.ifEmpty { "-" }} |")
            }
            sb.appendLine()

            // 角色详情
            for (character in characters) {
                sb.appendLine("### ${character.name}")
                sb.appendLine()
                if (character.appearance.isNotEmpty()) {
                    sb.appendLine("**外貌**：${character.appearance}")
                    sb.appendLine()
                }
                if (character.background.isNotEmpty()) {
                    sb.appendLine("**背景**：${character.background}")
                    sb.appendLine()
                }
            }
            sb.appendLine("---")
            sb.appendLine()
        }

        // 设定信息
        if (settings.isNotEmpty()) {
            sb.appendLine("## 设定列表")
            sb.appendLine()
            for (setting in settings) {
                sb.appendLine("### ${setting.name}")
                sb.appendLine()
                sb.appendLine(setting.content)
                sb.appendLine()
            }
            sb.appendLine("---")
            sb.appendLine()
        }

        // 地点信息
        if (locations.isNotEmpty()) {
            sb.appendLine("## 地点列表")
            sb.appendLine()
            for (location in locations) {
                sb.appendLine("### ${location.name}")
                sb.appendLine()
                sb.appendLine(location.description)
                sb.appendLine()
            }
            sb.appendLine("---")
            sb.appendLine()
        }

        // 章节内容
        sb.appendLine("## 正文")
        sb.appendLine()
        for ((index, chapter) in chapters.withIndex()) {
            sb.appendLine("### 第${index + 1}章 ${chapter.title}")
            sb.appendLine()
            if (chapter.content.isNotEmpty()) {
                sb.appendLine(chapter.content)
            } else {
                sb.appendLine("*（本章暂无内容）*")
            }
            sb.appendLine()
            sb.appendLine("---")
            sb.appendLine()
        }

        outputStream.write(sb.toString().toByteArray(Charsets.UTF_8))
    }

    /**
     * 导出为 JSON 格式
     */
    private fun exportToJson(
        work: NovelWork,
        chapters: List<Chapter>,
        characters: List<NovelCharacter>,
        settings: List<NovelSetting>,
        locations: List<NovelLocation>,
        outputStream: OutputStream
    ) {
        val exportData = mapOf(
            "version" to "1.0",
            "exportTime" to System.currentTimeMillis(),
            "work" to work,
            "chapters" to chapters,
            "characters" to characters,
            "settings" to settings,
            "locations" to locations
        )

        val json = gson.toJson(exportData)
        outputStream.write(json.toByteArray(Charsets.UTF_8))
    }

    /**
     * 格式化作品状态
     */
    private fun formatStatus(status: String): String {
        return when (status) {
            "ongoing" -> "连载中"
            "completed" -> "已完成"
            "paused" -> "暂停中"
            else -> status
        }
    }

    /**
     * 字符串居中
     */
    private fun String.center(width: Int): String {
        if (this.length >= width) return this
        val padding = width - this.length
        val leftPad = padding / 2
        val rightPad = padding - leftPad
        return " ".repeat(leftPad) + this + " ".repeat(rightPad)
    }
}
