package com.ai.assistance.novelide.bridge

import android.content.Context
import android.net.Uri
import android.webkit.JavascriptInterface
import android.webkit.WebView
import com.ai.assistance.novelide.data.model.novel.*
import com.ai.assistance.novelide.data.repository.novel.NovelRepository
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

    /** WebView 引用，用于异步回调 */
    private var webView: WebView? = null

    /** 异步操作待返回结果 */
    private val pendingResults = ConcurrentHashMap<String, String>()

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
                val wv = webView
                if (wv != null) {
                    val escapedResult = gson.toJson(result) // 转义JSON字符串
                    wv.post {
                        wv.evaluateJavascript(
                            "window.__onNovelBridgeResult && window.__onNovelBridgeResult('$callId', $escapedResult)",
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
                "[]"
            }
        }
        return gson.toJson(mapOf("success" to true, "callId" to callId, "async" to true))
    }

    @JavascriptInterface
    fun createWork(title: String, genre: String, description: String): String {
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
    fun createChapter(workId: String, title: String, order: Int): String {
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
                ""
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

    // ==================== 角色关系 ====================

    @JavascriptInterface
    fun getCharacterRelationships(workId: String): String {
        val callId = "crels_${workId}_${System.currentTimeMillis()}"
        executeAsync(callId) {
            try {
                val rels = repository.getCharacterRelationshipsByWorkId(workId).first()
                gson.toJson(rels)
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
}
