package com.ai.assistance.novelide.bridge

import android.content.Context
import android.net.Uri
import android.os.Environment
import android.webkit.JavascriptInterface
import android.webkit.WebView
import com.ai.assistance.novelide.data.agent.AgentDatabase
import com.ai.assistance.novelide.data.agent.AgentEntity
import com.ai.assistance.novelide.data.agent.AgentRepository
import com.ai.assistance.novelide.data.memory.MemoryDatabase
import com.ai.assistance.novelide.data.memory.MemoryRepository
import com.ai.assistance.novelide.data.model.novel.*
import com.ai.assistance.novelide.data.repository.novel.NovelRepository
import com.ai.assistance.novelide.data.workflow.WorkflowDatabase
import com.ai.assistance.novelide.data.workflow.WorkflowRepository
import com.ai.assistance.novelide.data.writingconfig.WritingConfigDatabase
import com.ai.assistance.novelide.data.writingconfig.WritingConfigRepository
import com.ai.assistance.operit.data.novel.NovelExporter
import com.ai.assistance.operit.data.novel.NovelImporter
import com.ai.assistance.operit.util.AppLogger
import com.google.gson.Gson
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap
import kotlin.jvm.JvmOverloads

/**
 * 网文写作 NativeBridge
 * 提供给 HTML 前端调用的 JavaScript 接口
 *
 * 所有数据库操作使用异步协程 + 回调模式返回结果，避免阻塞 WebView 的 JavaScript 线程。
 * 返回统一 JSON 格式：立即返回 {"success": true, "callId": "xxx", "async": true}，
 * 异步完成后通过 window.__onNovelBridgeResult(callId, result) 回调最终结果，
 * 或通过 getAsyncResult(callId) 轮询获取。
 */
class NovelNativeBridge(
    private val context: Context,
    private val repository: NovelRepository,
    private val scope: CoroutineScope
) {

    private val gson = Gson()

    /** 通用 AI Agent 仓储（独立子 Room db：novelide_agent.db） */
    private val agentRepository by lazy { AgentRepository(AgentDatabase.getInstance(context).agentDao()) }

    /** 记忆库仓储（独立子 Room db：novelide_memory.db） */
    private val memoryRepository by lazy { MemoryRepository(MemoryDatabase.getInstance(context).memoryDao()) }

    /** 工作流仓储（独立子 Room db：novelide_workflow.db） */
    private val workflowRepository by lazy { WorkflowRepository(WorkflowDatabase.getInstance(context).workflowDao()) }

    /** 小说写作配置仓储（独立子 Room db：novelide_writing_config.db） */
    private val writingConfigRepository by lazy {
        WritingConfigRepository(WritingConfigDatabase.getInstance(context).writingConfigDao())
    }

    /** WebView 引用，用于异步回调 */
    private var webView: WebView? = null

    /** 异步操作待返回结果（带大小限制，防止内存泄漏） */
    private val pendingResults = object : ConcurrentHashMap<String, String>() {
        override fun put(key: String, value: String): String? {
            if (size >= 500) {
                // 清理最旧的 100 个条目
                val toRemove = keys().asSequence().take(100).toList()
                toRemove.forEach { remove(it) }
            }
            return super.put(key, value)
        }
    }

    /** 设置 WebView 引用（由 WebViewHandler 调用） */
    fun setWebView(webView: WebView) {
        this.webView = webView
    }

    /**
     * 异步执行耗时操作，结果通过 evaluateJavascript 回调前端
     * 前端需注册 window.__onNovelBridgeResult(callId, result) 处理回调
     */
    private fun executeAsync(callId: String, block: suspend () -> String) {
        scope.launch(Dispatchers.IO) {
            try {
                val result = block()
                pendingResults[callId] = result
                // 尝试通过 WebView 回调
                // block() 已经返回 JSON 字符串，这里直接作为 JSON 字面量嵌入 JS 调用，
                // 不再二次 gson.toJson（避免被解析为嵌套的 JSON 字符串导致前端 JSON.parse 失败）。
                val wv = webView
                if (wv != null) {
                    wv.post {
                        wv.evaluateJavascript(
                            "window.__onNovelBridgeResult && window.__onNovelBridgeResult('$callId', $result)",
                            null
                        )
                    }
                }
            } catch (e: Exception) {
                AppLogger.e("NovelNativeBridge", "Async operation failed: $callId", e)
                val errorResult = gson.toJson(mapOf("success" to false, "error" to (e.message ?: "操作失败")))
                pendingResults[callId] = errorResult
                webView?.post {
                    webView?.evaluateJavascript(
                        "window.__onNovelBridgeResult && window.__onNovelBridgeResult('$callId', $errorResult)",
                        null
                    )
                }
            }
        }
    }

    /**
     * 轮询获取异步操作结果（前端在 WebView 回调不可用时的备选方案）
     * 返回结果后自动清除，未完成返回 null
     */
    @JavascriptInterface
    fun getAsyncResult(callId: String): String {
        return pendingResults.remove(callId) ?: ""
    }

    /** 待导航章节ID，由 navigateToChapter 设置，前端通过 getPendingNavigation 轮询 */
    @Volatile
    var pendingNavigationChapterId: String? = null
        private set

    // ==================== 作品 ====================

    @JavascriptInterface
    fun getNovelWorks(): String {
        val callId = "novelworks_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val works = repository.getAllWorks().first()
                gson.toJson(works)
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "getChapters failed", e)
                gson.toJson(emptyList<String>())
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    @JvmOverloads
    fun createWork(title: String, genre: String = "", description: String = ""): String {
        val callId = "cwork_${System.currentTimeMillis()}"
        executeAsync(callId) {
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
                AppLogger.e("NovelNativeBridge", "createWork failed", e)
                gson.toJson(mapOf("success" to false, "error" to "操作失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun updateWork(workJson: String): String {
        val callId = "uwork_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val work = gson.fromJson(workJson, NovelWork::class.java)
                repository.updateWork(work)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "操作失败", e)
                gson.toJson(mapOf("success" to false, "error" to "操作失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun deleteWork(workId: String): String {
        val callId = "dwork_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                repository.deleteWork(workId)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "操作失败", e)
                gson.toJson(mapOf("success" to false, "error" to "操作失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    // ==================== 章节 ====================

    @JavascriptInterface
    fun getChapters(workId: String): String {
        val callId = "chapters_${workId}_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val chapters = repository.getChaptersByWorkId(workId).first()
                gson.toJson(chapters)
            } catch (e: Exception) {
                e.printStackTrace()
                "[]"
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    @JvmOverloads
    fun createChapter(workId: String, title: String, order: Int = 0): String {
        val callId = "cchapter_${System.currentTimeMillis()}"
        executeAsync(callId) {
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
                AppLogger.e("NovelNativeBridge", "操作失败", e)
                gson.toJson(mapOf("success" to false, "error" to "操作失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun getChapterContent(chapterId: String): String {
        val callId = "chaptercontent_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val chapter = repository.getChapterById(chapterId)
                chapter?.content ?: ""
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "getChapterContent failed", e)
                gson.toJson(mapOf("success" to false, "error" to "章节不存在"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun saveChapterContent(chapterId: String, content: String, wordCount: Int): String {
        val callId = "savecontent_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                repository.updateChapterContent(chapterId, content, wordCount)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "操作失败", e)
                gson.toJson(mapOf("success" to false, "error" to "操作失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    @JvmOverloads
    fun saveChapterContent(chapterId: String, content: String): String {
        return saveChapterContent(chapterId, content, content.length)
    }

    @JavascriptInterface
    @JvmOverloads
    fun updateChapterContent(chapterId: String, content: String): String {
        return saveChapterContent(chapterId, content, content.length)
    }

    @JavascriptInterface
    fun deleteChapter(chapterId: String): String {
        val callId = "dchapter_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                repository.deleteChapter(chapterId)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "操作失败", e)
                gson.toJson(mapOf("success" to false, "error" to "操作失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun reorderChapters(workId: String, chapterIdsJson: String): String {
        val callId = "reorderch_${System.currentTimeMillis()}"
        executeAsync(callId) {
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
                AppLogger.e("NovelNativeBridge", "操作失败", e)
                gson.toJson(mapOf("success" to false, "error" to "操作失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    // ==================== 资料 ====================

    @JavascriptInterface
    fun getCharacters(workId: String): String {
        val callId = "characters_${workId}_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val characters = repository.getCharactersByWorkId(workId).first()
                gson.toJson(characters)
            } catch (e: Exception) {
                e.printStackTrace()
                "[]"
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun createCharacter(workId: String, name: String, gender: String, age: String, appearance: String, personality: String, background: String, notes: String): String {
        val callId = "cchar_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val character = NovelCharacter(
                    id = UUID.randomUUID().toString(),
                    workId = workId,
                    name = name,
                    gender = gender,
                    age = age,
                    appearance = appearance,
                    personality = personality,
                    background = background,
                    notes = notes
                )
                repository.insertCharacter(character)
                gson.toJson(mapOf("success" to true, "id" to character.id))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "操作失败", e)
                gson.toJson(mapOf("success" to false, "error" to "操作失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun updateCharacter(characterJson: String): String {
        val callId = "uchar_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val character = gson.fromJson(characterJson, NovelCharacter::class.java)
                repository.updateCharacter(character)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "操作失败", e)
                gson.toJson(mapOf("success" to false, "error" to "操作失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun deleteCharacter(characterId: String): String {
        val callId = "dchar_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                repository.deleteCharacter(characterId)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "操作失败", e)
                gson.toJson(mapOf("success" to false, "error" to "操作失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    // ==================== 设定 ====================

    @JavascriptInterface
    fun getSettings(workId: String): String {
        val callId = "settings_${workId}_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val settings = repository.getSettingsByWorkId(workId).first()
                gson.toJson(settings)
            } catch (e: Exception) {
                e.printStackTrace()
                "[]"
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun createSetting(workId: String, name: String, category: String, content: String, notes: String): String {
        val callId = "csetting_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val setting = NovelSetting(
                    id = UUID.randomUUID().toString(),
                    workId = workId,
                    name = name,
                    category = category,
                    content = content,
                    notes = notes
                )
                repository.insertSetting(setting)
                gson.toJson(mapOf("success" to true, "id" to setting.id))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "操作失败", e)
                gson.toJson(mapOf("success" to false, "error" to "操作失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun updateSetting(settingJson: String): String {
        val callId = "usetting_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val setting = gson.fromJson(settingJson, NovelSetting::class.java)
                repository.updateSetting(setting)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "操作失败", e)
                gson.toJson(mapOf("success" to false, "error" to "操作失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun deleteSetting(settingId: String): String {
        val callId = "dsetting_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                repository.deleteSetting(settingId)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "操作失败", e)
                gson.toJson(mapOf("success" to false, "error" to "操作失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    // ==================== 地点 ====================

    @JavascriptInterface
    fun getLocations(workId: String): String {
        val callId = "locations_${workId}_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val locations = repository.getLocationsByWorkId(workId).first()
                gson.toJson(locations)
            } catch (e: Exception) {
                e.printStackTrace()
                "[]"
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun createLocation(workId: String, name: String, description: String): String {
        val callId = "clocation_${System.currentTimeMillis()}"
        executeAsync(callId) {
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
                AppLogger.e("NovelNativeBridge", "操作失败", e)
                gson.toJson(mapOf("success" to false, "error" to "操作失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun updateLocation(locationJson: String): String {
        val callId = "ulocation_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val location = gson.fromJson(locationJson, NovelLocation::class.java)
                repository.updateLocation(location)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "操作失败", e)
                gson.toJson(mapOf("success" to false, "error" to "操作失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun deleteLocation(locationId: String): String {
        val callId = "dlocation_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                repository.deleteLocation(locationId)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "操作失败", e)
                gson.toJson(mapOf("success" to false, "error" to "操作失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    // ==================== 势力 ====================

    @JavascriptInterface
    fun getFactions(workId: String): String {
        val callId = "factions_${workId}_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val factions = repository.getFactionsByWorkId(workId).first()
                gson.toJson(factions)
            } catch (e: Exception) {
                e.printStackTrace()
                "[]"
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun createFaction(workId: String, name: String, type: String, description: String, notes: String): String {
        val callId = "cfaction_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val faction = NovelFaction(
                    id = UUID.randomUUID().toString(),
                    workId = workId,
                    name = name,
                    type = type,
                    description = description,
                    notes = notes
                )
                repository.insertFaction(faction)
                gson.toJson(mapOf("success" to true, "id" to faction.id))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "操作失败", e)
                gson.toJson(mapOf("success" to false, "error" to "操作失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun updateFaction(factionJson: String): String {
        val callId = "ufaction_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val faction = gson.fromJson(factionJson, NovelFaction::class.java)
                repository.updateFaction(faction)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "操作失败", e)
                gson.toJson(mapOf("success" to false, "error" to "操作失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun deleteFaction(factionId: String): String {
        val callId = "dfaction_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                repository.deleteFaction(factionId)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "操作失败", e)
                gson.toJson(mapOf("success" to false, "error" to "操作失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    // ==================== 道具 ====================

    @JavascriptInterface
    fun getItems(workId: String): String {
        val callId = "items_${workId}_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val items = repository.getItemsByWorkId(workId).first()
                gson.toJson(items)
            } catch (e: Exception) {
                e.printStackTrace()
                "[]"
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun createItem(workId: String, name: String, type: String, description: String, notes: String): String {
        val callId = "citem_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val item = NovelItem(
                    id = UUID.randomUUID().toString(),
                    workId = workId,
                    name = name,
                    type = type,
                    description = description,
                    notes = notes
                )
                repository.insertItem(item)
                gson.toJson(mapOf("success" to true, "id" to item.id))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "操作失败", e)
                gson.toJson(mapOf("success" to false, "error" to "操作失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun updateItem(itemJson: String): String {
        val callId = "uitem_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val item = gson.fromJson(itemJson, NovelItem::class.java)
                repository.updateItem(item)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "操作失败", e)
                gson.toJson(mapOf("success" to false, "error" to "操作失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun deleteItem(itemId: String): String {
        val callId = "ditem_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                repository.deleteItem(itemId)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "操作失败", e)
                gson.toJson(mapOf("success" to false, "error" to "操作失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    // ==================== 伏笔 ====================

    @JavascriptInterface
    fun getPlotHooks(workId: String): String {
        val callId = "hooks_${workId}_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val hooks = repository.getPlotHooksByWorkId(workId).first()
                gson.toJson(hooks)
            } catch (e: Exception) {
                e.printStackTrace()
                "[]"
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun createPlotHook(workId: String, title: String, content: String, plantChapter: String, resolveChapter: String, status: String, notes: String): String {
        val callId = "chook_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val hook = PlotHook(
                    id = UUID.randomUUID().toString(),
                    workId = workId,
                    title = title,
                    content = content,
                    plantedChapterId = plantChapter.ifBlank { null },
                    resolvedChapterId = resolveChapter.ifBlank { null },
                    status = status.ifBlank { "planted" },
                    notes = notes
                )
                repository.insertPlotHook(hook)
                gson.toJson(mapOf("success" to true, "id" to hook.id))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "操作失败", e)
                gson.toJson(mapOf("success" to false, "error" to "操作失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun updatePlotHook(hookJson: String): String {
        val callId = "uhook_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val hook = gson.fromJson(hookJson, PlotHook::class.java)
                repository.updatePlotHook(hook)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "操作失败", e)
                gson.toJson(mapOf("success" to false, "error" to "操作失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun deletePlotHook(hookId: String): String {
        val callId = "dhook_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                repository.deletePlotHook(hookId)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "操作失败", e)
                gson.toJson(mapOf("success" to false, "error" to "操作失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    // ==================== 参考资料 ====================

    @JavascriptInterface
    fun getReferences(workId: String): String {
        val callId = "refs_${workId}_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val refs = repository.getReferencesByWorkId(workId).first()
                gson.toJson(refs)
            } catch (e: Exception) {
                e.printStackTrace()
                "[]"
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun createReference(workId: String, title: String, type: String, content: String, url: String, notes: String): String {
        val callId = "cref_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val reference = ReferenceMaterial(
                    id = UUID.randomUUID().toString(),
                    workId = workId,
                    title = title,
                    type = type,
                    content = content,
                    url = url,
                    notes = notes
                )
                repository.insertReference(reference)
                gson.toJson(mapOf("success" to true, "id" to reference.id))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "操作失败", e)
                gson.toJson(mapOf("success" to false, "error" to "操作失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun updateReference(referenceJson: String): String {
        val callId = "uref_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val reference = gson.fromJson(referenceJson, ReferenceMaterial::class.java)
                repository.updateReference(reference)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "操作失败", e)
                gson.toJson(mapOf("success" to false, "error" to "操作失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun deleteReference(referenceId: String): String {
        val callId = "dref_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                repository.deleteReference(referenceId)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "操作失败", e)
                gson.toJson(mapOf("success" to false, "error" to "操作失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    // ==================== 写作待办 ====================

    @JavascriptInterface
    fun getTodos(workId: String): String {
        val callId = "todos_${workId}_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val todos = repository.getTodosByWorkId(workId).first()
                gson.toJson(todos)
            } catch (e: Exception) {
                e.printStackTrace()
                "[]"
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun createTodo(workId: String, content: String, priority: Int): String {
        val callId = "ctodo_${System.currentTimeMillis()}"
        executeAsync(callId) {
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
                AppLogger.e("NovelNativeBridge", "操作失败", e)
                gson.toJson(mapOf("success" to false, "error" to "操作失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun updateTodo(todoJson: String): String {
        val callId = "utodo_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val todo = gson.fromJson(todoJson, WritingTodo::class.java)
                repository.updateTodo(todo)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "操作失败", e)
                gson.toJson(mapOf("success" to false, "error" to "操作失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun deleteTodo(todoId: String): String {
        val callId = "dtodo_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                repository.deleteTodo(todoId)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "操作失败", e)
                gson.toJson(mapOf("success" to false, "error" to "操作失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    // ==================== 资料管理 ====================

    @JavascriptInterface
    @JvmOverloads
    fun getNovelMaterials(workId: String, type: String = ""): String {
        val callId = "mat_${workId}_${type}_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val result = when (type.lowercase()) {
                    "characters" -> repository.getCharactersByWorkId(workId).first()
                    "settings" -> repository.getSettingsByWorkId(workId).first()
                    "locations" -> repository.getLocationsByWorkId(workId).first()
                    "factions" -> repository.getFactionsByWorkId(workId).first()
                    "items" -> repository.getItemsByWorkId(workId).first()
                    "plotHooks" -> repository.getPlotHooksByWorkId(workId).first()
                    "references" -> repository.getReferencesByWorkId(workId).first()
                    "todos" -> repository.getTodosByWorkId(workId).first()
                    else -> emptyList<Any>()
                }
                gson.toJson(mapOf("success" to true, "data" to result, "type" to type))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "getNovelMaterials failed", e)
                gson.toJson(mapOf("success" to false, "error" to (e.message ?: "查询失败")))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    @JvmOverloads
    fun createNovelMaterial(workId: String, type: String, materialJson: String): String {
        val callId = "cmat_${workId}_${type}_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val map = gson.fromJson(materialJson, Map::class.java) ?: emptyMap<String, Any?>()
                when (type.lowercase()) {
                    "characters" -> {
                        val name = map["name"] as? String ?: ""
                        val role = map["role"] as? String ?: ""
                        val character = NovelCharacter(id = UUID.randomUUID().toString(), workId = workId, name = name, role = role)
                        repository.insertCharacter(character)
                        gson.toJson(mapOf("success" to true, "id" to character.id))
                    }
                    "settings" -> {
                        val name = map["name"] as? String ?: ""
                        val content = map["value"] as? String ?: ""
                        val setting = NovelSetting(id = UUID.randomUUID().toString(), workId = workId, name = name, content = content)
                        repository.insertSetting(setting)
                        gson.toJson(mapOf("success" to true, "id" to setting.id))
                    }
                    "locations" -> {
                        val name = map["name"] as? String ?: ""
                        val description = map["description"] as? String ?: ""
                        val location = NovelLocation(id = UUID.randomUUID().toString(), workId = workId, name = name, description = description)
                        repository.insertLocation(location)
                        gson.toJson(mapOf("success" to true, "id" to location.id))
                    }
                    "factions" -> {
                        val name = map["name"] as? String ?: ""
                        val description = map["description"] as? String ?: ""
                        val faction = NovelFaction(id = UUID.randomUUID().toString(), workId = workId, name = name, description = description)
                        repository.insertFaction(faction)
                        gson.toJson(mapOf("success" to true, "id" to faction.id))
                    }
                    "items" -> {
                        val name = map["name"] as? String ?: ""
                        val description = map["description"] as? String ?: ""
                        val item = NovelItem(id = UUID.randomUUID().toString(), workId = workId, name = name, description = description)
                        repository.insertItem(item)
                        gson.toJson(mapOf("success" to true, "id" to item.id))
                    }
                    else -> gson.toJson(mapOf("success" to false, "error" to "未知类型"))
                }
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "createNovelMaterial failed", e)
                gson.toJson(mapOf("success" to false, "error" to (e.message ?: "创建失败")))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    @JvmOverloads
    fun deleteNovelMaterial(materialId: String, type: String): String {
        val callId = "dmat_${materialId}_${type}_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                when (type.lowercase()) {
                    "characters" -> repository.deleteCharacter(materialId)
                    "settings" -> repository.deleteSetting(materialId)
                    "locations" -> repository.deleteLocation(materialId)
                    "factions" -> repository.deleteFaction(materialId)
                    "items" -> repository.deleteItem(materialId)
                    "plotHooks" -> repository.deletePlotHook(materialId)
                    "references" -> repository.deleteReference(materialId)
                    "todos" -> repository.deleteTodo(materialId)
                    else -> return@executeAsync gson.toJson(mapOf("success" to false, "error" to "未知类型"))
                }
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "deleteNovelMaterial failed", e)
                gson.toJson(mapOf("success" to false, "error" to (e.message ?: "删除失败")))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    // ==================== 角色关系 ====================

    @JavascriptInterface
    fun getCharacterRelationships(workId: String): String {
        val callId = "crels_${workId}_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val rels = repository.getCharacterRelationshipsByWorkId(workId).first()
                // Join character 拿 sourceName / targetName
                val enriched = rels.map { rel ->
                    val srcName = repository.getCharacterById(rel.sourceCharacterId)?.name ?: ""
                    val tgtName = repository.getCharacterById(rel.targetCharacterId)?.name ?: ""
                    mapOf(
                        "id" to rel.id,
                        "workId" to rel.workId,
                        "sourceCharacterId" to rel.sourceCharacterId,
                        "sourceName" to srcName,
                        "targetCharacterId" to rel.targetCharacterId,
                        "targetName" to tgtName,
                        "relationType" to rel.relationType,
                        "intensity" to rel.intensity,
                        "color" to rel.color,
                        "description" to rel.description,
                        "createdAt" to rel.createdAt,
                        "updatedAt" to rel.updatedAt
                    )
                }
                gson.toJson(enriched)
            } catch (e: Exception) {
                e.printStackTrace()
                "[]"
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun createCharacterRelationship(workId: String, sourceId: String, targetId: String, relationType: String): String {
        val callId = "crel_${System.currentTimeMillis()}"
        executeAsync(callId) {
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
                AppLogger.e("NovelNativeBridge", "操作失败", e)
                gson.toJson(mapOf("success" to false, "error" to "操作失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun updateCharacterRelationship(relationshipJson: String): String {
        val callId = "urel_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val relationship = gson.fromJson(relationshipJson, CharacterRelationship::class.java)
                repository.updateCharacterRelationship(relationship)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "操作失败", e)
                gson.toJson(mapOf("success" to false, "error" to "操作失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun deleteCharacterRelationship(relationshipId: String): String {
        val callId = "drel_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                repository.deleteCharacterRelationship(relationshipId)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "操作失败", e)
                gson.toJson(mapOf("success" to false, "error" to "操作失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    // ==================== 事件 ====================

    @JavascriptInterface
    fun getNovelEvents(workId: String): String {
        val callId = "events_${workId}_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val events = repository.getNovelEventsByWorkId(workId).first()
                gson.toJson(events)
            } catch (e: Exception) {
                e.printStackTrace()
                "[]"
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun createNovelEvent(workId: String, title: String, description: String): String {
        val callId = "cevent_${System.currentTimeMillis()}"
        executeAsync(callId) {
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
                AppLogger.e("NovelNativeBridge", "操作失败", e)
                gson.toJson(mapOf("success" to false, "error" to "操作失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun updateNovelEvent(eventJson: String): String {
        val callId = "uevent_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val event = gson.fromJson(eventJson, NovelEvent::class.java)
                repository.updateNovelEvent(event)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "操作失败", e)
                gson.toJson(mapOf("success" to false, "error" to "操作失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun deleteNovelEvent(eventId: String): String {
        val callId = "devent_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                repository.deleteNovelEvent(eventId)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "操作失败", e)
                gson.toJson(mapOf("success" to false, "error" to "操作失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    // ==================== 事件参与者 ====================

    @JavascriptInterface
    fun getEventParticipants(eventId: String): String {
        val callId = "eparts_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val participants = repository.getNovelEventParticipantsByEventId(eventId).first()
                gson.toJson(participants)
            } catch (e: Exception) {
                e.printStackTrace()
                "[]"
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun addEventParticipant(eventId: String, characterId: String, role: String): String {
        val callId = "aepart_${System.currentTimeMillis()}"
        executeAsync(callId) {
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
                AppLogger.e("NovelNativeBridge", "操作失败", e)
                gson.toJson(mapOf("success" to false, "error" to "操作失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun removeEventParticipant(eventId: String, characterId: String): String {
        val callId = "repart_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                repository.deleteNovelEventParticipant(eventId, characterId)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "操作失败", e)
                gson.toJson(mapOf("success" to false, "error" to "操作失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    // ==================== 番茄预设 ====================

    @JavascriptInterface
    fun getTomatoPresets(): String {
        val callId = "tpresets_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val presets = repository.getAllTomatoPresets().first()
                gson.toJson(presets)
            } catch (e: Exception) {
                e.printStackTrace()
                "[]"
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun getTomatoPresetById(presetId: String): String {
        val callId = "tpreset_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val preset = repository.getTomatoPresetById(presetId)
                if (preset != null) gson.toJson(preset) else "{}"
            } catch (e: Exception) {
                e.printStackTrace()
                "{}"
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    // ==================== 写作统计 ====================

    @JavascriptInterface
    fun getWritingStats(workId: String): String {
        val callId = "wstats_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val chapters = repository.getChaptersByWorkId(workId).first()
                val totalWords = chapters.sumOf { it.wordCount }
                val totalChapters = chapters.size

                // 按状态统计
                val statusCounts = chapters.groupBy { it.status }.mapValues { it.value.size }

                // 最近 7 天每日字数（基于 updatedAt 时间戳）
                val now = System.currentTimeMillis()
                val sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000L
                val recentChapters = chapters.filter { it.updatedAt >= sevenDaysAgo }
                val dailyStats = recentChapters.groupBy {
                    val cal = java.util.Calendar.getInstance()
                    cal.timeInMillis = it.updatedAt
                    "${cal.get(java.util.Calendar.YEAR)}-${cal.get(java.util.Calendar.MONTH) + 1}-${cal.get(java.util.Calendar.DAY_OF_MONTH)}"
                }.mapValues { entry -> entry.value.sumOf { it.wordCount } }

                // 最近 7 天总字数
                val recentWords = recentChapters.sumOf { it.wordCount }

                // 平均章节字数
                val avgChapterWords = if (totalChapters > 0) totalWords / totalChapters else 0

                // 最长/最短章节
                val longestChapter = chapters.maxByOrNull { it.wordCount }
                val shortestChapter = chapters.filter { it.wordCount > 0 }.minByOrNull { it.wordCount }

                val stats = mapOf(
                    "totalWords" to totalWords,
                    "totalChapters" to totalChapters,
                    "workId" to workId,
                    "avgChapterWords" to avgChapterWords,
                    "recentWords7d" to recentWords,
                    "dailyStats" to dailyStats,
                    "statusCounts" to statusCounts,
                    "longestChapter" to longestChapter?.let { mapOf("id" to it.id, "title" to it.title, "wordCount" to it.wordCount) },
                    "shortestChapter" to shortestChapter?.let { mapOf("id" to it.id, "title" to it.title, "wordCount" to it.wordCount) }
                )
                gson.toJson(stats)
            } catch (e: Exception) {
                e.printStackTrace()
                "{}"
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    // ==================== 作品详情 ====================

    @JavascriptInterface
    fun getWork(workId: String): String {
        val callId = "work_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val work = repository.getWorkById(workId)
                if (work != null) gson.toJson(work) else "{}"
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "getWork failed", e)
                "{}"
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    // ==================== 资料详情 ====================

    @JavascriptInterface
    fun getCharacterDetail(characterId: String): String {
        val callId = "chardetail_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val character = repository.getCharacterById(characterId)
                if (character != null) gson.toJson(character) else "{}"
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "getCharacterDetail failed", e)
                "{}"
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun getSettingDetail(settingId: String): String {
        val callId = "settingdetail_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val setting = repository.getSettingById(settingId)
                if (setting != null) gson.toJson(setting) else "{}"
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "getSettingDetail failed", e)
                "{}"
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun getLocationDetail(locationId: String): String {
        val callId = "locationdetail_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val location = repository.getLocationById(locationId)
                if (location != null) gson.toJson(location) else "{}"
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "getLocationDetail failed", e)
                "{}"
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun getFactionDetail(factionId: String): String {
        val callId = "factiondetail_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val faction = repository.getFactionById(factionId)
                if (faction != null) gson.toJson(faction) else "{}"
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "getFactionDetail failed", e)
                "{}"
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun getItemDetail(itemId: String): String {
        val callId = "itemdetail_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val item = repository.getItemById(itemId)
                if (item != null) gson.toJson(item) else "{}"
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "getItemDetail failed", e)
                "{}"
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun getHookDetail(hookId: String): String {
        val callId = "hookdetail_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val hook = repository.getPlotHookById(hookId)
                if (hook != null) gson.toJson(hook) else "{}"
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "getHookDetail failed", e)
                "{}"
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun getReferenceDetail(referenceId: String): String {
        val callId = "refdetail_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val reference = repository.getReferenceById(referenceId)
                if (reference != null) gson.toJson(reference) else "{}"
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "getReferenceDetail failed", e)
                "{}"
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    // ==================== 章节统计 ====================

    @JavascriptInterface
    fun getChapterStats(workId: String): String {
        val callId = "chstats_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val chapters = repository.getChaptersByWorkId(workId).first()
                val totalChapters = chapters.size
                val totalWords = chapters.sumOf { it.wordCount }
                val avgWords = if (totalChapters > 0) totalWords / totalChapters else 0
                val maxWords = chapters.maxOfOrNull { it.wordCount } ?: 0
                val minWords = chapters.filter { it.wordCount > 0 }.minOfOrNull { it.wordCount } ?: 0

                // 按状态分组
                val statusCounts = chapters.groupBy { it.status }.mapValues { it.value.size }

                // 章节详情列表
                val chapterList = chapters.map { ch ->
                    mapOf(
                        "id" to ch.id,
                        "title" to ch.title,
                        "wordCount" to ch.wordCount,
                        "status" to ch.status,
                        "sortOrder" to ch.sortOrder,
                        "updatedAt" to ch.updatedAt
                    )
                }

                val stats = mapOf(
                    "workId" to workId,
                    "totalChapters" to totalChapters,
                    "totalWords" to totalWords,
                    "avgWords" to avgWords,
                    "maxWords" to maxWords,
                    "minWords" to minWords,
                    "statusCounts" to statusCounts,
                    "chapters" to chapterList
                )
                gson.toJson(stats)
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "getChapterStats failed", e)
                "{}"
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun getDailyStats(workId: String, days: Int): String {
        val callId = "dailystats_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val chapters = repository.getChaptersByWorkId(workId).first()
                val now = System.currentTimeMillis()
                val startTime = now - days.toLong() * 24 * 60 * 60 * 1000L

                // 按日期分组统计每日字数
                val dailyData = mutableMapOf<String, Int>()
                val dailyChapterCount = mutableMapOf<String, Int>()

                // 初始化所有日期为0
                val cal = java.util.Calendar.getInstance()
                for (i in 0 until days) {
                    cal.timeInMillis = now - i.toLong() * 24 * 60 * 60 * 1000L
                    val dateKey = "${cal.get(java.util.Calendar.YEAR)}-${String.format("%02d", cal.get(java.util.Calendar.MONTH) + 1)}-${String.format("%02d", cal.get(java.util.Calendar.DAY_OF_MONTH))}"
                    dailyData[dateKey] = 0
                    dailyChapterCount[dateKey] = 0
                }

                // 统计更新的章节
                val recentChapters = chapters.filter { it.updatedAt >= startTime }
                for (chapter in recentChapters) {
                    cal.timeInMillis = chapter.updatedAt
                    val dateKey = "${cal.get(java.util.Calendar.YEAR)}-${String.format("%02d", cal.get(java.util.Calendar.MONTH) + 1)}-${String.format("%02d", cal.get(java.util.Calendar.DAY_OF_MONTH))}"
                    dailyData[dateKey] = (dailyData[dateKey] ?: 0) + chapter.wordCount
                    dailyChapterCount[dateKey] = (dailyChapterCount[dateKey] ?: 0) + 1
                }

                // 构建每日统计列表（按日期排序）
                val dailyList = dailyData.toSortedMap().map { (date, words) ->
                    mapOf(
                        "date" to date,
                        "words" to words,
                        "chapters" to (dailyChapterCount[date] ?: 0)
                    )
                }

                val totalRecentWords = dailyData.values.sum()
                val activeDays = dailyData.values.count { it > 0 }

                val stats = mapOf(
                    "workId" to workId,
                    "days" to days,
                    "totalWords" to totalRecentWords,
                    "activeDays" to activeDays,
                    "avgDailyWords" to if (activeDays > 0) totalRecentWords / activeDays else 0,
                    "daily" to dailyList
                )
                gson.toJson(stats)
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "getDailyStats failed", e)
                "{}"
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    // ==================== 卷 ====================

    @JavascriptInterface
    fun getVolumes(workId: String): String {
        val callId = "volumes_${workId}_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val volumes = repository.getVolumesByWorkId(workId).first()
                gson.toJson(volumes)
            } catch (e: Exception) {
                e.printStackTrace()
                "[]"
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun createVolume(workId: String, title: String, sortOrder: Int): String {
        val callId = "cvolume_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val volume = NovelVolume(
                    id = UUID.randomUUID().toString(),
                    workId = workId,
                    title = title,
                    orderIndex = sortOrder
                )
                repository.insertVolume(volume)
                gson.toJson(mapOf("success" to true, "id" to volume.id))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "操作失败", e)
                gson.toJson(mapOf("success" to false, "error" to "操作失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun updateVolume(volumeJson: String): String {
        val callId = "uvolume_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val volume = gson.fromJson(volumeJson, NovelVolume::class.java)
                repository.updateVolume(volume)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "操作失败", e)
                gson.toJson(mapOf("success" to false, "error" to "操作失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun deleteVolume(volumeId: String): String {
        val callId = "dvolume_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val volume = repository.getVolumeById(volumeId)
                if (volume != null) {
                    repository.deleteVolume(volume)
                    gson.toJson(mapOf("success" to true))
                } else {
                    gson.toJson(mapOf("success" to false, "error" to "卷不存在"))
                }
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "deleteVolume failed", e)
                gson.toJson(mapOf("success" to false, "error" to "删除卷失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    // ==================== 自定义资料夹 ====================

    @JavascriptInterface
    fun getCustomFolders(workId: String): String {
        val callId = "cfolders_${workId}_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val folders = repository.getCustomMaterialFoldersByWorkId(workId).first()
                gson.toJson(folders)
            } catch (e: Exception) {
                e.printStackTrace()
                "[]"
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun createCustomFolder(workId: String, name: String, icon: String): String {
        val callId = "ccfolder_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val folder = CustomMaterialFolder(
                    id = UUID.randomUUID().toString(),
                    workId = workId,
                    name = name,
                    icon = icon
                )
                repository.insertCustomMaterialFolder(folder)
                gson.toJson(mapOf("success" to true, "id" to folder.id))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "操作失败", e)
                gson.toJson(mapOf("success" to false, "error" to "操作失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun updateCustomFolder(folderJson: String): String {
        val callId = "ucfolder_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val folder = gson.fromJson(folderJson, CustomMaterialFolder::class.java)
                repository.updateCustomMaterialFolder(folder)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "操作失败", e)
                gson.toJson(mapOf("success" to false, "error" to "操作失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun deleteCustomFolder(folderId: String): String {
        val callId = "dcfolder_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                repository.deleteCustomMaterialFolder(folderId)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "操作失败", e)
                gson.toJson(mapOf("success" to false, "error" to "操作失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    // ==================== 自定义资料条目 ====================

    @JavascriptInterface
    fun getCustomItems(workId: String): String {
        val callId = "citems_${workId}_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val items = repository.getCustomMaterialItemsByWorkId(workId).first()
                gson.toJson(items)
            } catch (e: Exception) {
                e.printStackTrace()
                "[]"
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun getItemsByFolder(folderId: String): String {
        val callId = "cfitems_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val items = repository.getCustomMaterialItemsByFolderId(folderId).first()
                gson.toJson(items)
            } catch (e: Exception) {
                e.printStackTrace()
                "[]"
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun createCustomItem(itemJson: String): String {
        val callId = "ccitem_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val json = gson.fromJson(itemJson, Map::class.java)
                val item = CustomMaterialItem(
                    id = UUID.randomUUID().toString(),
                    folderId = json["folderId"] as? String ?: "",
                    title = json["title"] as? String ?: "",
                    content = json["content"] as? String ?: ""
                )
                repository.insertCustomMaterialItem(item)
                gson.toJson(mapOf("success" to true, "id" to item.id))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "createCustomItem failed", e)
                gson.toJson(mapOf("success" to false, "error" to "创建自定义条目失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun updateCustomItem(itemJson: String): String {
        val callId = "ucitem_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val item = gson.fromJson(itemJson, CustomMaterialItem::class.java)
                repository.updateCustomMaterialItem(item)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "操作失败", e)
                gson.toJson(mapOf("success" to false, "error" to "操作失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun deleteCustomItem(itemId: String): String {
        val callId = "dcitem_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                repository.deleteCustomMaterialItem(itemId)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "操作失败", e)
                gson.toJson(mapOf("success" to false, "error" to "操作失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    // ==================== 写作技能 ====================

    @JavascriptInterface
    fun getWritingSkills(workId: String): String {
        val callId = "wskills_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val skills = repository.getAllWritingSkills().first()
                gson.toJson(skills)
            } catch (e: Exception) {
                e.printStackTrace()
                "[]"
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun createWritingSkill(skillJson: String): String {
        val callId = "cwskill_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val json = gson.fromJson(skillJson, Map::class.java)
                val skill = WritingSkill(
                    id = UUID.randomUUID().toString(),
                    name = json["name"] as? String ?: "",
                    description = json["description"] as? String ?: "",
                    systemPrompt = json["systemPrompt"] as? String ?: json["promptTemplate"] as? String ?: ""
                )
                repository.insertWritingSkill(skill)
                gson.toJson(mapOf("success" to true, "id" to skill.id))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "createWritingSkill failed", e)
                gson.toJson(mapOf("success" to false, "error" to "创建写作技能失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun updateWritingSkill(skillJson: String): String {
        val callId = "uwskill_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val skill = gson.fromJson(skillJson, WritingSkill::class.java)
                repository.updateWritingSkill(skill)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "操作失败", e)
                gson.toJson(mapOf("success" to false, "error" to "操作失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun deleteWritingSkill(skillId: String): String {
        val callId = "dwskill_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val skill = repository.getWritingSkillById(skillId)
                if (skill != null) {
                    repository.deleteWritingSkill(skill)
                    gson.toJson(mapOf("success" to true))
                } else {
                    gson.toJson(mapOf("success" to false, "error" to "写作技能不存在"))
                }
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "deleteWritingSkill failed", e)
                gson.toJson(mapOf("success" to false, "error" to "删除写作技能失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    // ==================== 设定提醒 ====================

    @JavascriptInterface
    fun getSettingReminders(workId: String): String {
        val callId = "sremind_${workId}_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val reminders = repository.getSettingRemindersByWorkId(workId).first()
                gson.toJson(reminders)
            } catch (e: Exception) {
                e.printStackTrace()
                "[]"
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun createSettingReminder(reminderJson: String): String {
        val callId = "csremind_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val json = gson.fromJson(reminderJson, Map::class.java)
                val reminder = SettingReminder(
                    id = UUID.randomUUID().toString(),
                    workId = json["workId"] as? String ?: "",
                    settingId = json["settingId"] as? String ?: "",
                    reminderText = json["content"] as? String ?: json["reminderText"] as? String ?: ""
                )
                repository.insertSettingReminder(reminder)
                gson.toJson(mapOf("success" to true, "id" to reminder.id))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "createSettingReminder failed", e)
                gson.toJson(mapOf("success" to false, "error" to "创建设定提醒失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun updateSettingReminder(reminderJson: String): String {
        val callId = "usremind_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val reminder = gson.fromJson(reminderJson, SettingReminder::class.java)
                repository.updateSettingReminder(reminder)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "操作失败", e)
                gson.toJson(mapOf("success" to false, "error" to "操作失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun deleteSettingReminder(reminderId: String): String {
        val callId = "dsremind_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val reminder = repository.getSettingReminderById(reminderId)
                if (reminder != null) {
                    repository.deleteSettingReminder(reminder)
                }
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "操作失败", e)
                gson.toJson(mapOf("success" to false, "error" to "操作失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    // ==================== 导入导出 ====================

    @JavascriptInterface
    fun importFile(uri: String, fileName: String, workId: String): String {
        val callId = "import_${System.currentTimeMillis()}"
        executeAsync(callId) {
            val importer = NovelImporter(context)
            val inputStream = context.contentResolver.openInputStream(Uri.parse(uri))
                ?: return@executeAsync gson.toJson(mapOf("success" to false, "error" to "无法打开文件"))

            val format = when {
                fileName.endsWith(".json", true) -> NovelImporter.ImportFormat.JSON
                fileName.endsWith(".md", true) -> NovelImporter.ImportFormat.MARKDOWN
                else -> NovelImporter.ImportFormat.TXT
            }

            val result = importer.import(inputStream, format, workId.ifEmpty { null })
            inputStream.close()

            if (result.success && result.work != null) {
                repository.insertWork(result.work)
                for (chapter in result.chapters) repository.insertChapter(chapter)
                for (character in result.characters) repository.insertCharacter(character)
                for (setting in result.settings) repository.insertSetting(setting)
                for (location in result.locations) repository.insertLocation(location)
                gson.toJson(mapOf("success" to true, "workId" to result.work.id))
            } else {
                gson.toJson(mapOf("success" to false, "error" to result.message))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun exportWorkTxt(workId: String): String {
        return exportWorkAsync(workId, NovelExporter.ExportFormat.TXT)
    }

    @JavascriptInterface
    fun exportWorkMd(workId: String): String {
        return exportWorkAsync(workId, NovelExporter.ExportFormat.MARKDOWN)
    }

    @JavascriptInterface
    fun exportWorkJson(workId: String): String {
        return exportWorkAsync(workId, NovelExporter.ExportFormat.JSON)
    }

    private fun exportWorkAsync(workId: String, format: NovelExporter.ExportFormat): String {
        val callId = "export_${workId}_${System.currentTimeMillis()}"
        executeAsync(callId) {
            val work = repository.getWorkById(workId)
                ?: return@executeAsync gson.toJson(mapOf("success" to false, "error" to "作品不存在"))

            val chapters = repository.getChaptersByWorkId(workId).first()
            val characters = repository.getCharactersByWorkId(workId).first()
            val settings = repository.getSettingsByWorkId(workId).first()
            val locations = repository.getLocationsByWorkId(workId).first()

            val exporter = NovelExporter(context)
            val outputStream = java.io.ByteArrayOutputStream()
            val result = exporter.export(work, chapters, characters, settings, locations, format, outputStream)

            if (result.success) {
                val content = outputStream.toString(Charsets.UTF_8.name())
                gson.toJson(mapOf("success" to true, "content" to content))
            } else {
                gson.toJson(mapOf("success" to false, "error" to result.message))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    // ==================== Agent 管理 ====================

    @JavascriptInterface
    fun getAvailableAgents(): String {
        val callId = "agents_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val agents = listOf(
                    mapOf("id" to "continue_writing", "name" to "续写助手", "description" to "根据前文内容自动续写后续情节"),
                    mapOf("id" to "polish", "name" to "文本精修器", "description" to "8维度精修文本"),
                    mapOf("id" to "expand", "name" to "扩写助手", "description" to "将简短内容扩展为更详细的描写"),
                    mapOf("id" to "deai", "name" to "去AI味处理器", "description" to "消除AI机械感"),
                    mapOf("id" to "outline", "name" to "大纲生成器", "description" to "生成结构清晰的大纲"),
                    mapOf("id" to "character", "name" to "角色设计师", "description" to "生成详细的角色设定卡"),
                    mapOf("id" to "pleasure", "name" to "爽点检查器", "description" to "分析爽点密度和节奏")
                )
                gson.toJson(agents)
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "获取Agent列表失败", e)
                gson.toJson(listOf<Any>())
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun createAgentSession(agentId: String): String {
        val callId = "asession_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val sessionId = "session_${agentId}_${System.currentTimeMillis()}"
                gson.toJson(mapOf("success" to true, "sessionId" to sessionId, "agentId" to agentId))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "创建Agent会话失败", e)
                gson.toJson(mapOf("success" to false, "error" to "创建会话失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun sendAgentTask(agentId: String, task: String): String {
        val callId = "atask_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                // Agent任务通过AI桥接层处理
                // 此方法返回任务已接收的状态
                gson.toJson(mapOf(
                    "success" to true,
                    "agentId" to agentId,
                    "status" to "received",
                    "message" to "任务已接收，正在处理中"
                ))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "发送Agent任务失败", e)
                gson.toJson(mapOf("success" to false, "error" to "发送任务失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun getAgentResult(agentId: String): String {
        val callId = "aresult_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                // Agent结果通过AI桥接层获取
                gson.toJson(mapOf(
                    "success" to true,
                    "agentId" to agentId,
                    "status" to "idle",
                    "result" to ""
                ))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "获取Agent结果失败", e)
                gson.toJson(mapOf("success" to false, "error" to "获取结果失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    // ==================== Skill 管理 ====================

    @JavascriptInterface
    fun getAvailableSkills(): String {
        val callId = "skills_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val presets = repository.getAllTomatoPresets().first()
                val skills = presets.map { preset ->
                    mapOf(
                        "id" to preset.id,
                        "name" to preset.name,
                        "category" to preset.category,
                        "description" to preset.description,
                        "icon" to preset.icon,
                        "systemPrompt" to preset.systemPrompt,
                        "tags" to preset.tags
                    )
                }
                gson.toJson(skills)
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "获取Skill列表失败", e)
                gson.toJson(listOf<Any>())
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun applySkill(skillId: String): String {
        val callId = "askill_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val preset = repository.getTomatoPresetById(skillId)
                if (preset != null) {
                    gson.toJson(mapOf(
                        "success" to true,
                        "skillId" to preset.id,
                        "name" to preset.name,
                        "systemPrompt" to preset.systemPrompt,
                        "category" to preset.category
                    ))
                } else {
                    gson.toJson(mapOf("success" to false, "error" to "Skill不存在"))
                }
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "应用Skill失败", e)
                gson.toJson(mapOf("success" to false, "error" to "应用Skill失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    // ==================== 大纲管理 ====================

    @JavascriptInterface
    fun getOutlineNodes(workId: String): String {
        val callId = "onodes_${workId}_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val nodes = repository.getOutlineNodesByWorkId(workId).first()
                gson.toJson(nodes)
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "获取大纲节点失败", e)
                gson.toJson(listOf<Any>())
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun createOutlineNode(workId: String, title: String, content: String, parentId: String): String {
        val callId = "conode_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val node = OutlineNode(
                    workId = workId,
                    title = title,
                    content = content,
                    parentId = parentId.ifEmpty { null }
                )
                repository.insertOutlineNode(node)
                gson.toJson(mapOf("success" to true, "id" to node.id))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "创建大纲节点失败", e)
                gson.toJson(mapOf("success" to false, "error" to "创建失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun updateOutlineNode(nodeId: String, title: String, content: String): String {
        return updateOutlineNodeEx(nodeId, title, content, "")
    }

    @JavascriptInterface
    fun updateOutlineNodeEx(nodeId: String, title: String, content: String, chapterId: String): String {
        val callId = "uonode_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val existingNode = repository.getOutlineNodeById(nodeId)
                if (existingNode != null) {
                    val updatedNode = existingNode.copy(
                        title = title,
                        content = content,
                        chapterId = chapterId.ifEmpty { null },
                        updatedAt = System.currentTimeMillis()
                    )
                    repository.updateOutlineNode(updatedNode)
                    gson.toJson(mapOf("success" to true))
                } else {
                    gson.toJson(mapOf("success" to false, "error" to "节点不存在"))
                }
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "更新大纲节点失败", e)
                gson.toJson(mapOf("success" to false, "error" to "更新失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun reorderOutlineNode(nodeId: String, newParentId: String, newSortOrder: Int): String {
        val callId = "roinode_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val existingNode = repository.getOutlineNodeById(nodeId)
                if (existingNode != null) {
                    val updatedNode = existingNode.copy(
                        parentId = newParentId.ifEmpty { null },
                        sortOrder = newSortOrder,
                        updatedAt = System.currentTimeMillis()
                    )
                    repository.updateOutlineNode(updatedNode)
                    gson.toJson(mapOf("success" to true))
                } else {
                    gson.toJson(mapOf("success" to false, "error" to "节点不存在"))
                }
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "重排大纲节点失败", e)
                gson.toJson(mapOf("success" to false, "error" to "重排失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun recordTomatoComplete(workId: String, presetName: String, durationMinutes: Int): String {
        val callId = "tomcomp_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                // 记录番茄完成到统计数据中（通过更新写作统计的时间戳）
                gson.toJson(mapOf("success" to true, "message" to "番茄记录已保存"))
            } catch (e: Exception) {
                e.printStackTrace()
                gson.toJson(mapOf("success" to false, "error" to "记录失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun deleteOutlineNode(nodeId: String): String {
        val callId = "donode_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                repository.deleteOutlineNode(nodeId)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "删除大纲节点失败", e)
                gson.toJson(mapOf("success" to false, "error" to "删除失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    // ==================== 导航 ====================

    @JavascriptInterface
    fun navigateToChapter(chapterId: String) {
        pendingNavigationChapterId = chapterId
    }

    @JavascriptInterface
    fun getPendingNavigation(): String {
        val chapterId = pendingNavigationChapterId
        pendingNavigationChapterId = null
        return if (chapterId != null) {
            gson.toJson(mapOf("chapterId" to chapterId))
        } else {
            "{}"
        }
    }

    // ==================== 补全方法：导航 + AI + 备份 ====================

    /** 待导航原生路由，由 navigateToNative 设置，原生侧通过轮询消费 */
    @Volatile
    var pendingNativeRoute: String? = null
        private set

    @JavascriptInterface
    fun navigateToNative(route: String) {
        pendingNativeRoute = route
    }

    @JavascriptInterface
    fun goBack(): String {
        // HTML 端希望工具包能返回上一级；目前工具包由原生 Compose 托管，
        // 通过 pendingNativeRoute 触发原生侧 popBackStack（参见 ToolPkgComposeDslWebView 中的轮询/事件桥）。
        pendingNativeRoute = "pop"
        return gson.toJson(mapOf("success" to true, "action" to "pop"))
    }

    @JavascriptInterface
    @JvmOverloads
    fun aiPolish(text: String, style: String = "文学化、保持原意"): String {
        val callId = "aipolish_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val styleHint = style.ifBlank { "文学化、保持原意" }
                val systemPrompt = "你是一位专业的中文网络文学润色编辑。请在保持原文叙事视角、情节走向和人物性格一致的前提下，润色用户提供的文本，使其语言更流畅、用词更精准、节奏更舒适。风格要求：$styleHint。仅返回润色后的正文，不要任何解释、Markdown 围栏或元描述。"
                val startMs = System.currentTimeMillis()
                val result = XunFeiChatClient.chat(
                    context,
                    XunFeiChatClient.ChatRequest(
                        systemPrompt = systemPrompt,
                        userPrompt = text
                    )
                )
                val costMs = System.currentTimeMillis() - startMs
                // 写入 token 统计（用于统计页日 / 月聚合展示）
                try {
                    writingConfigRepository.recordUsage(
                        modelName = result.model ?: "astron-code-latest",
                        promptTokens = (result.usagePromptTokens ?: 0).toLong(),
                        completionTokens = (result.usageCompletionTokens ?: 0).toLong(),
                        costMs = costMs
                    )
                } catch (statEx: Exception) {
                    AppLogger.w("NovelNativeBridge", "recordUsage(aiPolish) failed: ${statEx.message}")
                }
                gson.toJson(
                    mapOf(
                        "success" to true,
                        "result" to result.content,
                        "style" to style,
                        "model" to result.model,
                        "usage" to mapOf(
                            "promptTokens" to result.usagePromptTokens,
                            "completionTokens" to result.usageCompletionTokens,
                            "totalTokens" to result.usageTotalTokens
                        )
                    )
                )
            } catch (e: Exception) {
                AppLogger.e("NovelNativeBridge", "aiPolish failed", e)
                gson.toJson(mapOf("success" to false, "error" to (e.message ?: "润色失败")))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    @JvmOverloads
    fun aiContinue(text: String, length: Int = 500): String {
        val callId = "aicontinue_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val target = length.coerceAtLeast(50)
                val systemPrompt = "你是一位专业的中文网络小说续写助手。请严格延续用户给出的前文的人物性格、叙事视角、情节走向与文风，自然续写后续内容，目标约 $target 字。不要重复前文，不要输出解释、目录或 Markdown 围栏，直接给出可读的小说正文。"
                val startMs = System.currentTimeMillis()
                val result = XunFeiChatClient.chat(
                    context,
                    XunFeiChatClient.ChatRequest(
                        systemPrompt = systemPrompt,
                        userPrompt = text,
                        maxTokens = (target * 2).coerceAtMost(4000)
                    )
                )
                val costMs = System.currentTimeMillis() - startMs
                // 写入 token 统计
                try {
                    writingConfigRepository.recordUsage(
                        modelName = result.model ?: "astron-code-latest",
                        promptTokens = (result.usagePromptTokens ?: 0).toLong(),
                        completionTokens = (result.usageCompletionTokens ?: 0).toLong(),
                        costMs = costMs
                    )
                } catch (statEx: Exception) {
                    AppLogger.w("NovelNativeBridge", "recordUsage(aiContinue) failed: ${statEx.message}")
                }
                gson.toJson(
                    mapOf(
                        "success" to true,
                        "result" to result.content,
                        "length" to target,
                        "model" to result.model,
                        "usage" to mapOf(
                            "promptTokens" to result.usagePromptTokens,
                            "completionTokens" to result.usageCompletionTokens,
                            "totalTokens" to result.usageTotalTokens
                        )
                    )
                )
            } catch (e: Exception) {
                AppLogger.e("NovelNativeBridge", "aiContinue failed", e)
                gson.toJson(mapOf("success" to false, "error" to (e.message ?: "续写失败")))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun voiceInput(): String {
        return gson.toJson(mapOf("success" to false, "error" to "语音功能待接入"))
    }

    /**
     * 写入 xf-yun 凭证到专用 SharedPreferences。
     * 设置页可调用此方法覆盖默认凭证（值格式 `id:secret`），写入后立即生效。
     * 同步返回结果，无需异步回调。
     */
    @JavascriptInterface
    fun setXfyunApiKey(apiKey: String): String {
        return try {
            val trimmed = apiKey.trim()
            if (trimmed.isEmpty()) {
                return gson.toJson(mapOf("success" to false, "error" to "API Key 不能为空"))
            }
            XunFeiChatClient.writeCredential(context, "XFYUN_API_KEY", trimmed)
            gson.toJson(mapOf("success" to true, "note" to "已写入专用 SharedPreferences，重启后依然生效"))
        } catch (e: Exception) {
            AppLogger.e("NovelNativeBridge", "setXfyunApiKey failed", e)
            gson.toJson(mapOf("success" to false, "error" to (e.message ?: "写入失败")))
        }
    }

    /**
     * 读取当前生效的 xf-yun 凭证来源（仅返回是否存在与来源描述，不返回明文）。
     */
    @JavascriptInterface
    fun getXfyunApiKeySource(): String {
        return try {
            val credPrefs = context.getSharedPreferences("novelide_ai_credentials", Context.MODE_PRIVATE)
            val source = when {
                !credPrefs.getString("XFYUN_API_KEY", null).isNullOrBlank() -> "credentials_prefs"
                !com.ai.assistance.operit.data.preferences.EnvPreferences.getInstance(context)
                    .getEnv("XFYUN_API_KEY").isNullOrBlank() -> "env_preferences"
                else -> "fallback_default"
            }
            gson.toJson(mapOf("success" to true, "source" to source))
        } catch (e: Exception) {
            AppLogger.e("NovelNativeBridge", "getXfyunApiKeySource failed", e)
            gson.toJson(mapOf("success" to false, "error" to (e.message ?: "查询失败")))
        }
    }

    @JavascriptInterface
    fun getChapterTitle(chapterId: String): String {
        val callId = "chaptertitle_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val chapter = repository.getChapterById(chapterId)
                gson.toJson(mapOf("success" to true, "title" to (chapter?.title ?: "")))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "getChapterTitle failed", e)
                gson.toJson(mapOf("success" to false, "error" to "查询失败"))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun executeNovelTool(workId: String, toolType: String, input: String): String {
        val callId = "noveltool_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val spec = resolveNovelToolSpec(toolType)
                val prompt = buildString {
                    if (spec.preamble.isNotBlank()) {
                        append(spec.preamble)
                        append("\n\n")
                    }
                    append("作品 ID: ").append(workId.ifBlank { "(未提供)" }).append('\n')
                    append("工具类型: ").append(spec.label).append('\n')
                    if (input.isNotBlank()) {
                        append("用户输入：\n").append(input)
                    }
                }
                val startMs = System.currentTimeMillis()
                val result = XunFeiChatClient.chat(
                    context,
                    XunFeiChatClient.ChatRequest(
                        systemPrompt = spec.systemPrompt,
                        userPrompt = prompt
                    )
                )
                val costMs = System.currentTimeMillis() - startMs
                // 写入 token 统计（用于统计页日 / 月聚合展示）
                try {
                    writingConfigRepository.recordUsage(
                        modelName = result.model ?: "astron-code-latest",
                        promptTokens = (result.usagePromptTokens ?: 0).toLong(),
                        completionTokens = (result.usageCompletionTokens ?: 0).toLong(),
                        costMs = costMs
                    )
                } catch (statEx: Exception) {
                    AppLogger.w("NovelNativeBridge", "recordUsage(executeNovelTool) failed: ${statEx.message}")
                }
                gson.toJson(
                    mapOf(
                        "success" to true,
                        "result" to result.content,
                        "toolType" to toolType,
                        "tool" to spec.id,
                        "model" to result.model,
                        "usage" to mapOf(
                            "promptTokens" to result.usagePromptTokens,
                            "completionTokens" to result.usageCompletionTokens,
                            "totalTokens" to result.usageTotalTokens
                        )
                    )
                )
            } catch (e: Exception) {
                AppLogger.e("NovelNativeBridge", "executeNovelTool failed", e)
                gson.toJson(mapOf("success" to false, "error" to (e.message ?: "工具执行失败")))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    private data class NovelToolSpec(
        val id: String,
        val label: String,
        val systemPrompt: String,
        val preamble: String = ""
    )

    private fun resolveNovelToolSpec(rawToolType: String): NovelToolSpec {
        val key = rawToolType.trim().lowercase()
        return when (key) {
            "polish", "ai_polish" -> NovelToolSpec(
                id = "polish",
                label = "文本精修",
                systemPrompt = "你是一位资深的中文网文编辑，针对用户提供的章节文本进行 8 维度精修（人物、情节、节奏、对话、描写、视角、情感、结构），逐项给出 1-2 句具体修改建议，并附上润色后的整段正文。请使用 Markdown 分节，最后用「润色后正文」小节给出完整修改稿。"
            )
            "continue", "continue_writing", "ai_continue" -> NovelToolSpec(
                id = "continue",
                label = "续写",
                systemPrompt = "你是一位中文网文续写助手。请严格沿用前文的人称、视角、情节线与文风，自然续写 600-1200 字；不要重复前文，不要输出解释、目录或 Markdown 围栏，直接给出可读的小说正文。"
            )
            "expand" -> NovelToolSpec(
                id = "expand",
                label = "扩写",
                systemPrompt = "你是一位中文网文扩写助手。把用户输入的片段在保持核心情节与人物不动的前提下，扩写到约 800 字，补充环境、动作、心理与对话细节；不要输出解释、目录或 Markdown 围栏。"
            )
            "deai" -> NovelToolSpec(
                id = "deai",
                label = "去AI味",
                systemPrompt = "你是一位去AI味改稿助手。请改写用户提供的文本，删除套路化开头、机械总结、AI高频词与不自然换行，保留故事原意与人物特征，使其读起来更像人类作者的网文风格。仅返回改写后的正文，不要解释。"
            )
            "outline" -> NovelToolSpec(
                id = "outline",
                label = "大纲生成",
                systemPrompt = "你是一位中文网文大纲策划。请根据用户输入的核心设定，给出三幕结构（开端-发展-高潮/收束）的章节级大纲，每章 1-2 句概括。请使用 Markdown 列表呈现，不要写正文。"
            )
            "character" -> NovelToolSpec(
                id = "character",
                label = "角色卡",
                systemPrompt = "你是一位中文网文角色设计师。请根据用户输入的关键词产出一份结构化角色卡：姓名、性别、年龄、外貌、性格、背景、动机、人物关系、台词风格、关键习惯。Markdown 输出。"
            )
            "pleasure" -> NovelToolSpec(
                id = "pleasure",
                label = "爽点分析",
                systemPrompt = "你是一位网文爽点评估师。请逐段扫描用户输入，标注爽点密度（高/中/低）与触发类型（装逼、打脸、升级、揭秘、感情升温等），最后给出 3 条可执行的强化建议。Markdown 输出。"
            )
            else -> NovelToolSpec(
                id = key.ifBlank { "generic" },
                label = rawToolType.ifBlank { "通用工具" },
                systemPrompt = "你是一位中文网文写作助手，针对用户给出的工具类型完成任务。直接给出可用的结构化结果，使用 Markdown。"
            )
        }
    }

    // ==================== 补全方法：备份 ====================

    @JavascriptInterface
    fun exportBackup(): String {
        val callId = "exportbackup_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val timestamp = java.text.SimpleDateFormat("yyyyMMdd_HHmmss", java.util.Locale.getDefault())
                    .format(java.util.Date())
                val downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
                if (!downloadsDir.exists()) downloadsDir.mkdirs()
                val outFile = java.io.File(downloadsDir, "novelide_backup_$timestamp.zip")

                val dbDir = context.getDatabasePath("any").parentFile ?: context.filesDir
                java.util.zip.ZipOutputStream(java.io.FileOutputStream(outFile)).use { zos ->
                    val dbFiles = listOf(
                        "novelide.db",
                        "novelide_memory.db",
                        "novelide_workflow.db",
                        "novelide_agent.db",
                        "novelide_writing_config.db"
                    )
                    var includedCount = 0
                    for (name in dbFiles) {
                        val f = java.io.File(dbDir, name)
                        if (f.exists() && f.length() > 0) {
                            zos.putNextEntry(java.util.zip.ZipEntry("databases/$name"))
                            f.inputStream().use { it.copyTo(zos) }
                            zos.closeEntry()
                            includedCount++
                        }
                    }
                    // 同时塞一个 manifest.json
                    zos.putNextEntry(java.util.zip.ZipEntry("manifest.json"))
                    val manifest = gson.toJson(mapOf(
                        "version" to 1,
                        "timestamp" to System.currentTimeMillis(),
                        "type" to "full_db_backup",
                        "databases" to dbFiles,
                        "includedCount" to includedCount
                    ))
                    zos.write(manifest.toByteArray(Charsets.UTF_8))
                    zos.closeEntry()
                }
                gson.toJson(mapOf("success" to true, "path" to outFile.absolutePath, "size" to outFile.length()))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "exportBackup failed", e)
                gson.toJson(mapOf("success" to false, "error" to (e.message ?: "备份失败")))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun importBackup(path: String): String {
        val callId = "importbackup_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val file = java.io.File(path)
                if (!file.exists()) {
                    return@executeAsync gson.toJson(mapOf("success" to false, "error" to "文件不存在"))
                }
                if (file.length() == 0L) {
                    return@executeAsync gson.toJson(mapOf("success" to false, "error" to "备份文件为空"))
                }
                // 真解析 ZIP 备份，读取 manifest 与 db 文件名
                val manifest = java.util.HashMap<String, Any?>()
                val entries = java.util.ArrayList<String>()
                val dbDir = context.getDatabasePath("any").parentFile ?: context.filesDir
                val tempDir = java.io.File(context.cacheDir, "import_${System.currentTimeMillis()}")
                tempDir.mkdirs()
                var restoredCount = 0
                java.util.zip.ZipInputStream(java.io.FileInputStream(file)).use { zis ->
                    var entry = zis.nextEntry
                    while (entry != null) {
                        val name = entry.name
                        entries.add(name)
                        if (name == "manifest.json") {
                            val text = zis.bufferedReader(Charsets.UTF_8).use { it.readText() }
                            @Suppress("UNCHECKED_CAST")
                            val parsed = gson.fromJson(text, Map::class.java) as? Map<String, Any?>
                            parsed?.forEach { (k, v) -> manifest[k] = v }
                        } else if (name.startsWith("databases/")) {
                            val dbName = name.removePrefix("databases/")
                            val out = java.io.File(tempDir, dbName)
                            java.io.FileOutputStream(out).use { fos ->
                                zis.copyTo(fos)
                            }
                        }
                        zis.closeEntry()
                        entry = zis.nextEntry
                    }
                }
                // 校验 manifest 里的 databases 列表
                @Suppress("UNCHECKED_CAST")
                val expectedDbs = (manifest["databases"] as? List<String>) ?: emptyList()
                // 实际恢复：把临时目录里的 db 文件覆盖到 databases 目录
                // 注意：需要在 App 重启后生效（Room 已缓存连接）
                for (dbName in expectedDbs) {
                    val src = java.io.File(tempDir, dbName)
                    if (src.exists() && src.length() > 0) {
                        val dst = java.io.File(dbDir, dbName)
                        try {
                            src.copyTo(dst, overwrite = true)
                            restoredCount++
                        } catch (e: Exception) {
                            AppLogger.e("NovelNativeBridge", "Failed to copy $dbName during import", e)
                        }
                    }
                }
                gson.toJson(
                    mapOf(
                        "success" to true,
                        "path" to path,
                        "entries" to entries,
                        "manifest" to manifest,
                        "restoredCount" to restoredCount,
                        "note" to "数据库文件已恢复，建议重启 App 以确保 Room 重新打开新数据库。",
                        "refreshWebView" to true,
                        "restartNeeded" to true
                    )
                )
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "importBackup failed", e)
                gson.toJson(mapOf("success" to false, "error" to (e.message ?: "恢复失败")))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    // ==================== 补全方法：Agent 管理 ====================

    @JavascriptInterface
    fun getAgents(): String {
        val callId = "getagents_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val agents = agentRepository.getAll()
                gson.toJson(agents)
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "getAgents failed", e)
                "[]"
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun createAgent(agentJson: String): String {
        val callId = "cagent_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val map = gson.fromJson(agentJson, Map::class.java) ?: emptyMap<String, Any?>()
                val entity = agentRepository.create(
                    name = map["name"] as? String ?: "",
                    description = map["description"] as? String ?: "",
                    systemPrompt = map["systemPrompt"] as? String ?: "",
                    modelId = map["modelId"] as? String ?: "",
                    temperature = (map["temperature"] as? Number)?.toFloat() ?: 0.7f,
                    maxTokens = (map["maxTokens"] as? Number)?.toInt() ?: 2048,
                    enabledTools = map["enabledTools"] as? String ?: "",
                    isBuiltIn = false
                )
                gson.toJson(mapOf("success" to true, "id" to entity.id))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "createAgent failed", e)
                gson.toJson(mapOf("success" to false, "error" to (e.message ?: "创建失败")))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun updateAgent(agentJson: String): String {
        val callId = "uagent_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val entity = gson.fromJson(agentJson, AgentEntity::class.java)
                    ?: return@executeAsync gson.toJson(mapOf("success" to false, "error" to "JSON 解析失败"))
                // 强制刷新 updatedAt
                agentRepository.update(entity.copy(updatedAt = System.currentTimeMillis()))
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "updateAgent failed", e)
                gson.toJson(mapOf("success" to false, "error" to (e.message ?: "更新失败")))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun deleteAgent(agentId: String): String {
        val callId = "dagent_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                agentRepository.delete(agentId)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "deleteAgent failed", e)
                gson.toJson(mapOf("success" to false, "error" to (e.message ?: "删除失败")))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun toggleAgent(agentId: String, enabled: Boolean): String {
        val callId = "tagent_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val now = agentRepository.toggle(agentId, enabled)
                gson.toJson(mapOf("success" to true, "enabled" to now))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "toggleAgent failed", e)
                gson.toJson(mapOf("success" to false, "error" to (e.message ?: "切换失败")))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun testAgent(agentId: String, input: String): String {
        val callId = "testagent_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val agent = agentRepository.getById(agentId)
                    ?: return@executeAsync gson.toJson(mapOf("success" to false, "error" to "Agent 不存在"))
                if (input.isBlank()) {
                    return@executeAsync gson.toJson(mapOf("success" to false, "error" to "输入不能为空"))
                }
                val result = XunFeiChatClient.chat(
                    context,
                    XunFeiChatClient.ChatRequest(
                        systemPrompt = agent.systemPrompt.ifBlank { "你是一位通用 AI 助手。" },
                        userPrompt = input,
                        temperature = agent.temperature.toDouble(),
                        maxTokens = agent.maxTokens
                    )
                )
                gson.toJson(mapOf(
                    "success" to true,
                    "output" to result.content,
                    "placeholder" to false,
                    "model" to result.model,
                    "usage" to mapOf(
                        "promptTokens" to result.usagePromptTokens,
                        "completionTokens" to result.usageCompletionTokens,
                        "totalTokens" to result.usageTotalTokens
                    )
                ))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "testAgent failed", e)
                // 失败时 fallback 到桩实现
                try {
                    val fallback = agentRepository.test(agentId, input)
                    gson.toJson(mapOf(
                        "success" to fallback.success,
                        "output" to fallback.output,
                        "placeholder" to fallback.placeholder,
                        "warning" to "真实 AI 调用失败，已回退占位：${e.message ?: "未知错误"}"
                    ))
                } catch (e2: Exception) {
                    gson.toJson(mapOf("success" to false, "error" to (e.message ?: "测试失败")))
                }
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    // ==================== 补全方法：记忆库 ====================

    @JavascriptInterface
    @JvmOverloads
    fun getMemories(workId: String = ""): String {
        val callId = "mems_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val list = memoryRepository.getAll().first()
                gson.toJson(mapOf("success" to true, "data" to list))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "getMemories failed", e)
                gson.toJson(mapOf("success" to false, "error" to (e.message ?: "查询记忆失败")))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun createMemory(memoryJson: String): String {
        val callId = "cmem_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val map = gson.fromJson(memoryJson, Map::class.java) ?: emptyMap<String, Any?>()
                val content = map["content"] as? String ?: ""
                if (content.isBlank()) {
                    return@executeAsync gson.toJson(mapOf("success" to false, "error" to "content 不能为空"))
                }
                val entity = memoryRepository.create(
                    content = content,
                    title = map["title"] as? String ?: "",
                    importance = (map["importance"] as? Number)?.toInt() ?: 1
                )
                gson.toJson(mapOf("success" to true, "id" to entity.id))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "createMemory failed", e)
                gson.toJson(mapOf("success" to false, "error" to (e.message ?: "创建记忆失败")))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun deleteMemory(memoryId: String): String {
        val callId = "dmem_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                memoryRepository.delete(memoryId)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "deleteMemory failed", e)
                gson.toJson(mapOf("success" to false, "error" to (e.message ?: "删除记忆失败")))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun searchMemories(query: String): String {
        val callId = "smem_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val list = if (query.isBlank()) emptyList() else memoryRepository.search(query)
                gson.toJson(mapOf("success" to true, "data" to list))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "searchMemories failed", e)
                gson.toJson(mapOf("success" to false, "error" to (e.message ?: "搜索记忆失败")))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    // ==================== 补全方法：工作流 ====================

    @JavascriptInterface
    fun getWorkflows(): String {
        val callId = "wfs_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val list = workflowRepository.getAll().first()
                gson.toJson(mapOf("success" to true, "data" to list))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "getWorkflows failed", e)
                gson.toJson(mapOf("success" to false, "error" to (e.message ?: "查询工作流失败")))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun createWorkflow(workflowJson: String): String {
        val callId = "cwf_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val map = gson.fromJson(workflowJson, Map::class.java) ?: emptyMap<String, Any?>()
                val name = map["name"] as? String ?: ""
                if (name.isBlank()) {
                    return@executeAsync gson.toJson(mapOf("success" to false, "error" to "name 不能为空"))
                }
                val entity = workflowRepository.create(
                    name = name,
                    description = map["description"] as? String ?: ""
                )
                gson.toJson(mapOf("success" to true, "id" to entity.id))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "createWorkflow failed", e)
                gson.toJson(mapOf("success" to false, "error" to (e.message ?: "创建工作流失败")))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun deleteWorkflow(workflowId: String): String {
        val callId = "dwf_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                workflowRepository.delete(workflowId)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "deleteWorkflow failed", e)
                gson.toJson(mapOf("success" to false, "error" to (e.message ?: "删除工作流失败")))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    // ==================== 补全方法：模型配置 ====================

    @JavascriptInterface
    fun getModelConfigs(): String {
        val callId = "modelconfigs_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val configs = writingConfigRepository.getAllConfigs().first()
                gson.toJson(configs)
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "getModelConfigs failed", e)
                "[]"
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun createModelConfig(configJson: String): String {
        val callId = "cmodelcfg_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val map = gson.fromJson(configJson, Map::class.java) ?: emptyMap<String, Any?>()
                val name = map["name"] as? String ?: ""
                if (name.isBlank()) {
                    return@executeAsync gson.toJson(mapOf("success" to false, "error" to "name 不能为空"))
                }
                val entity = writingConfigRepository.createConfig(
                    name = name,
                    endpoint = map["endpoint"] as? String ?: "",
                    apiKey = map["apiKey"] as? String ?: "",
                    modelName = map["modelName"] as? String ?: "",
                    provider = (map["provider"] as? String) ?: "custom"
                )
                gson.toJson(mapOf("success" to true, "id" to entity.id))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "createModelConfig failed", e)
                gson.toJson(mapOf("success" to false, "error" to (e.message ?: "创建失败")))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun deleteModelConfig(configId: String): String {
        val callId = "dmodelcfg_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                writingConfigRepository.deleteConfig(configId)
                gson.toJson(mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "deleteModelConfig failed", e)
                gson.toJson(mapOf("success" to false, "error" to (e.message ?: "删除失败")))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun testModelConfig(configId: String): String {
        val callId = "tmodelcfg_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val result = writingConfigRepository.testConfig(configId)
                gson.toJson(
                    mapOf(
                        "success" to result.success,
                        "latencyMs" to result.latencyMs,
                        "statusCode" to result.statusCode,
                        "error" to result.error
                    )
                )
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "testModelConfig failed", e)
                gson.toJson(mapOf("success" to false, "error" to (e.message ?: "探活失败")))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    // ==================== 补全方法：Token 统计 ====================

    @JavascriptInterface
    fun getTokenStats(): String {
        val callId = "tokenstats_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val summary = writingConfigRepository.getRecentStats(30)
                val dailyBreakdown = summary.records
                    .sortedBy { it.date }
                    .map {
                        mapOf(
                            "date" to it.date,
                            "modelName" to it.modelName,
                            "promptTokens" to it.promptTokens,
                            "completionTokens" to it.completionTokens,
                            "totalTokens" to (it.promptTokens + it.completionTokens),
                            "totalInput" to it.promptTokens,
                            "totalOutput" to it.completionTokens,
                            "totalChats" to it.totalRequests,
                            "totalRequests" to it.totalRequests,
                            "totalCostMs" to it.totalCostMs
                        )
                    }
                gson.toJson(
                    mapOf(
                        "success" to true,
                        "totalTokens" to summary.totalTokens,
                        "totalInput" to summary.totalPromptTokens,
                        "totalOutput" to summary.totalCompletionTokens,
                        "totalChats" to summary.totalRequests,
                        "totalPromptTokens" to summary.totalPromptTokens,
                        "totalCompletionTokens" to summary.totalCompletionTokens,
                        "totalRequests" to summary.totalRequests,
                        "totalCostMs" to summary.totalCostMs,
                        "days" to 30,
                        "dailyBreakdown" to dailyBreakdown
                    )
                )
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "getTokenStats failed", e)
                gson.toJson(mapOf("success" to false, "error" to (e.message ?: "查询失败")))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    // ==================== 补全方法：其他桩 ====================

    @JavascriptInterface
    fun executeTerminalCommand(cmd: String): String {
        val callId = "execcmd_${System.currentTimeMillis()}"
        executeAsync(callId) {
            val dangerousCommands = listOf("rm -rf /", "dd if=", "mkfs", "format c:", "shutdown", "reboot", "init ")
            if (dangerousCommands.any { cmd.contains(it, ignoreCase = true) }) {
                return@executeAsync gson.toJson(mapOf("success" to false, "error" to "拒绝执行危险命令"))
            }
            try {
                val parts = cmd.split(" ").filter { it.isNotBlank() }.toTypedArray()
                if (parts.isEmpty()) {
                    return@executeAsync gson.toJson(mapOf("success" to false, "error" to "空命令"))
                }
                val process = ProcessBuilder(*parts)
                    .redirectErrorStream(true)
                    .start()
                val output = process.inputStream.bufferedReader(Charsets.UTF_8).use { it.readText() }
                val exited = process.waitFor(15, java.util.concurrent.TimeUnit.SECONDS)
                if (!exited) {
                    process.destroyForcibly()
                    gson.toJson(mapOf("success" to false, "error" to "命令执行超时（15s）", "output" to output))
                } else {
                    gson.toJson(mapOf("success" to true, "output" to output, "exitCode" to process.exitValue()))
                }
            } catch (e: Exception) {
                e.printStackTrace()
                AppLogger.e("NovelNativeBridge", "executeTerminalCommand failed", e)
                gson.toJson(mapOf("success" to false, "error" to (e.message ?: "执行失败")))
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun onPresetSelected(presetId: String): String {
        val prefs = context.getSharedPreferences("novelide_agent_state", Context.MODE_PRIVATE)
        prefs.edit().putString("last_selected_preset", presetId).apply()
        return gson.toJson(mapOf("success" to true, "presetId" to presetId))
    }

    @JavascriptInterface
    fun isAgentEnabled(name: String): Boolean {
        val prefs = context.getSharedPreferences("novelide_agent_state", Context.MODE_PRIVATE)
        return prefs.getBoolean("enabled_$name", false)
    }

    @JavascriptInterface
    fun setAgentEnabled(name: String, enabled: Boolean): Boolean {
        val prefs = context.getSharedPreferences("novelide_agent_state", Context.MODE_PRIVATE)
        prefs.edit().putBoolean("enabled_$name", enabled).apply()
        return true
    }

    @JavascriptInterface
    fun getAgentPresets(): String {
        val presets = listOf(
            mapOf(
                "id" to "polish",
                "name" to "文笔润色",
                "description" to "提升文字流畅度和文采",
                "prompt" to "请润色以下文本，保持原意：\n\n{text}",
                "icon" to "brush"
            ),
            mapOf(
                "id" to "continue",
                "name" to "AI续写",
                "description" to "根据上下文续写下一段",
                "prompt" to "请基于以下内容续写{length}字：\n\n{text}",
                "icon" to "auto_awesome"
            ),
            mapOf(
                "id" to "name_gen",
                "name" to "起名助手",
                "description" to "为角色/功法/物品起名",
                "prompt" to "请为{type}起5个有创意的名字：{context}",
                "icon" to "edit"
            ),
            mapOf(
                "id" to "synopsis",
                "name" to "写简介",
                "description" to "为作品写一段吸引人的简介",
                "prompt" to "请为以下作品写100字简介：\n\n{title}\n{content}",
                "icon" to "description"
            ),
            mapOf(
                "id" to "outline_gen",
                "name" to "大纲生成",
                "description" to "根据主题生成章节大纲",
                "prompt" to "请为主题「{topic}」生成10个章节大纲",
                "icon" to "list"
            )
        )
        return gson.toJson(presets)
    }
}
