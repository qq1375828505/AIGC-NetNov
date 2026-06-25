package com.ai.assistance.novelide.bridge

import android.content.Context
import android.util.Log
import com.ai.assistance.operit.data.preferences.EnvPreferences
import org.json.JSONArray
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStream
import java.net.HttpURLConnection
import java.net.URL

/**
 * 通过 HttpURLConnection 直接调用科大讯飞 xf-yun `astron-code-latest` 的
 * 轻量级客户端。供 [NovelNativeBridge] 在不依赖 [com.ai.assistance.operit.api.chat.llmprovider]
 * 子系统的情况下做润色 / 续写 / 工具调用。
 *
 * 凭证读取顺序：
 *  1. 专用 SharedPreferences `novelide_ai_credentials` 中的 `XFYUN_API_KEY` / `XFYUN_ENDPOINT` / `XFYUN_MODEL`
 *  2. EnvPreferences 中的同名键
 *  3. 系统环境变量
 *  4. 内置 fallback 默认值（仅在没有更优先来源时使用）
 *
 * 端点 / 模型覆盖：
 *  - `XFYUN_ENDPOINT`：默认 `https://maas-coding-api.cn-huabei-1.xf-yun.com/v2/chat/completions`
 *  - `XFYUN_MODEL`：默认 `astron-code-latest`
 */
internal object XunFeiChatClient {

    private const val TAG = "XunFeiChatClient"
    private const val DEFAULT_ENDPOINT =
        "https://maas-coding-api.cn-huabei-1.xf-yun.com/v2/chat/completions"
    private const val DEFAULT_MODEL = "astron-code-latest"
    private const val ENV_API_KEY = "XFYUN_API_KEY"
    private const val ENV_ENDPOINT = "XFYUN_ENDPOINT"
    private const val ENV_MODEL = "XFYUN_MODEL"
    private const val CONNECT_TIMEOUT_MS = 60_000
    private const val READ_TIMEOUT_MS = 120_000

    /**
     * 专用 SharedPreferences 文件名，用于单独存放 AI 凭证
     * （与 EnvPreferences 的 env_preferences 隔离，避免在批量 reset 时被误清空）
     */
    private const val CREDENTIALS_PREFS_NAME = "novelide_ai_credentials"

    data class ChatRequest(
        val systemPrompt: String,
        val userPrompt: String,
        val temperature: Double = 0.7,
        val maxTokens: Int? = null
    )

    data class ChatResult(
        val content: String,
        val usagePromptTokens: Int?,
        val usageCompletionTokens: Int?,
        val usageTotalTokens: Int?,
        val model: String?
    )

    /**
     * 同步执行一次非流式 chat completions，返回首个 choice 的 message.content。
     * 失败时抛 [RuntimeException]，由调用方决定如何返回给前端。
     */
    @Throws(Exception::class)
    fun chat(context: Context, request: ChatRequest): ChatResult {
        val apiKey = readApiKey(context)
            ?: throw IllegalStateException(
                "XFYUN_API_KEY 未配置（请在 EnvPreferences 中设置 id:secret 形式的凭证）"
            )
        val endpoint = readStringEnv(context, ENV_ENDPOINT) ?: DEFAULT_ENDPOINT
        val model = readStringEnv(context, ENV_MODEL) ?: DEFAULT_MODEL

        val payload = JSONObject().apply {
            put("model", model)
            put("temperature", request.temperature)
            request.maxTokens?.let { put("max_tokens", it) }
            val messages = JSONArray()
            if (request.systemPrompt.isNotBlank()) {
                messages.put(JSONObject().put("role", "system").put("content", request.systemPrompt))
            }
            messages.put(JSONObject().put("role", "user").put("content", request.userPrompt))
            put("messages", messages)
        }
        val bodyJson = payload.toString()
        val basicAuth = "Basic " + android.util.Base64.encodeToString(
            apiKey.toByteArray(Charsets.UTF_8),
            android.util.Base64.NO_WRAP
        )

        val conn = (URL(endpoint).openConnection() as HttpURLConnection).apply {
            requestMethod = "POST"
            doOutput = true
            doInput = true
            connectTimeout = CONNECT_TIMEOUT_MS
            readTimeout = READ_TIMEOUT_MS
            setRequestProperty("Content-Type", "application/json; charset=utf-8")
            setRequestProperty("Accept", "application/json")
            setRequestProperty("Authorization", basicAuth)
        }

        try {
            conn.outputStream.use { os: OutputStream ->
                os.write(bodyJson.toByteArray(Charsets.UTF_8))
            }
            val status = conn.responseCode
            val stream = if (status in 200..299) conn.inputStream else conn.errorStream
            val raw = BufferedReader(InputStreamReader(stream, Charsets.UTF_8)).use { it.readText() }

            if (status !in 200..299) {
                Log.e(TAG, "xf-yun 请求失败 status=$status body=$raw")
                throw RuntimeException("xf-yun HTTP $status: ${raw.take(300)}")
            }

            val json = JSONObject(raw)
            val content = parseFirstChoiceContent(json)
                ?: throw RuntimeException("xf-yun 响应未包含 content: ${raw.take(300)}")
            val usage = json.optJSONObject("usage")
            return ChatResult(
                content = content,
                usagePromptTokens = usage?.optInt("prompt_tokens"),
                usageCompletionTokens = usage?.optInt("completion_tokens"),
                usageTotalTokens = usage?.optInt("total_tokens"),
                model = json.optString("model").takeIf { it.isNotBlank() }
            )
        } finally {
            conn.disconnect()
        }
    }

    private fun parseFirstChoiceContent(json: JSONObject): String? {
        val choices = json.optJSONArray("choices") ?: return null
        if (choices.length() == 0) return null
        val first = choices.optJSONObject(0) ?: return null
        val message = first.optJSONObject("message")
        if (message != null) {
            val content = message.opt("content")
            if (content is String) return content
            if (content != null) return content.toString()
        }
        // 兼容部分平台只返回 text 字段
        first.optString("text", "").takeIf { it.isNotBlank() }?.let { return it }
        return null
    }

    private fun readApiKey(context: Context): String? {
        val fromCredPrefs = readFromCredentialsPrefs(context, ENV_API_KEY)
        if (!fromCredPrefs.isNullOrBlank()) return fromCredPrefs
        val fromEnv = readStringEnv(context, ENV_API_KEY)
        if (!fromEnv.isNullOrBlank()) return fromEnv
        // Fallback：硬编码的默认凭证（用户在历史对话中已明确提供，并已记录在 project_memory 中）
        // 临时方案，后续需要在设置页提供输入入口由用户主动覆盖。
        val fallback = DEFAULT_API_KEY.takeIf { it.isNotBlank() }
        return fallback
    }

    private fun readStringEnv(context: Context, key: String): String? {
        val fromCredPrefs = readFromCredentialsPrefs(context, key)
        if (!fromCredPrefs.isNullOrBlank()) return fromCredPrefs
        return try {
            EnvPreferences.getInstance(context).getEnv(key)?.takeIf { it.isNotBlank() }
        } catch (_: Throwable) {
            try {
                System.getenv(key)?.takeIf { it.isNotBlank() }
            } catch (_: Throwable) {
                null
            }
        }
    }

    private fun readFromCredentialsPrefs(context: Context, key: String): String? {
        return try {
            val prefs = context.applicationContext
                .getSharedPreferences(CREDENTIALS_PREFS_NAME, Context.MODE_PRIVATE)
            prefs.getString(key, null)?.takeIf { it.isNotBlank() }
        } catch (_: Throwable) {
            null
        }
    }

    /**
     * 通过专用 SharedPreferences 写入 AI 凭证（高优先级），由 [NovelNativeBridge.setXfyunApiKey]
     * 之类的 JS 桥接调用触发。
     */
    fun writeCredential(context: Context, key: String, value: String) {
        val prefs = context.applicationContext
            .getSharedPreferences(CREDENTIALS_PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().putString(key, value).apply()
    }

    /**
     * 默认 API Key（值格式 `id:secret`）。
     * NOTE: 临时方案（用户在历史对话中明确提供），后续应迁移到设置页由用户主动输入。
     */
    private const val DEFAULT_API_KEY = "bdd9002ca6dba8b162f85dc7de4a8541:OTI0YWNiNjQ1ODVlNDM5ZjAyYjJkZTIx"
}
