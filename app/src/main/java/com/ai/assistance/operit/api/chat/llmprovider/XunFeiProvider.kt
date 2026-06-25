package com.ai.assistance.operit.api.chat.llmprovider

import com.ai.assistance.operit.data.model.ApiProviderType
import okhttp3.OkHttpClient
import okhttp3.Request

/**
 * 科大讯飞 (xf-yun) `astron-code-latest` 专用 Provider。
 *
 * 该服务的 chat completions 端点（`https://maas-coding-api.cn-huabei-1.xf-yun.com/v2/chat/completions`）
 * 在请求/响应格式上与 OpenAI Chat Completions 兼容，唯一差异是鉴权方式：
 *
 *  - 使用 HTTP Basic Auth：`Authorization: Basic base64(id:secret)`
 *  - 用户的 API Key 字段填写 `id:secret` 格式
 *
 * 因此本 Provider 直接继承 [OpenAIProvider]，仅覆写鉴权头注入逻辑。
 */
class XunFeiProvider(
    apiEndpoint: String,
    apiKeyProvider: ApiKeyProvider,
    modelName: String,
    client: OkHttpClient,
    customHeaders: Map<String, String> = emptyMap(),
    providerType: ApiProviderType = ApiProviderType.XUNFEI,
    supportsVision: Boolean = false,
    supportsAudio: Boolean = false,
    supportsVideo: Boolean = false,
    enableToolCall: Boolean = false
) : OpenAIProvider(
    apiEndpoint = apiEndpoint,
    apiKeyProvider = apiKeyProvider,
    modelName = modelName,
    client = client,
    customHeaders = customHeaders,
    providerType = providerType,
    supportsVision = supportsVision,
    supportsAudio = supportsAudio,
    supportsVideo = supportsVideo,
    enableToolCall = enableToolCall
) {

    override fun applyAuthenticationHeaders(
        builder: Request.Builder,
        currentApiKey: String
    ) {
        val credentials = currentApiKey.trim()
        if (credentials.isEmpty()) return
        val encoded = android.util.Base64.encodeToString(
            credentials.toByteArray(Charsets.UTF_8),
            android.util.Base64.NO_WRAP
        )
        builder.addHeader("Authorization", "Basic $encoded")
    }
}
