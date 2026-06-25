package com.ai.assistance.novelide.data.writingconfig

import kotlinx.coroutines.flow.Flow
import okhttp3.OkHttpClient
import okhttp3.Request
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.UUID
import java.util.concurrent.TimeUnit

/**
 * 小说写作配置仓库
 *
 * 封装 NovelWritingConfigDao，并提供业务级方法：
 *  - createConfig：构造并入库一个新配置
 *  - testConfig：用 OkHttp 探活 endpoint（5s 超时）
 *  - getRecentStats：取最近 N 天统计 + 汇总（totalTokens / totalCost）
 */
class WritingConfigRepository(
    private val dao: NovelWritingConfigDao
) {

    private val httpClient: OkHttpClient = OkHttpClient.Builder()
        .connectTimeout(5, TimeUnit.SECONDS)
        .readTimeout(5, TimeUnit.SECONDS)
        .writeTimeout(5, TimeUnit.SECONDS)
        .build()

    // ==================== ModelConfig ====================

    fun getAllConfigs(): Flow<List<NovelModelConfigEntity>> = dao.getAllConfigs()

    suspend fun getConfigById(id: String): NovelModelConfigEntity? = dao.getConfigById(id)

    /**
     * 创建一条新的 ModelConfig，立即入库并返回。
     */
    suspend fun createConfig(
        name: String,
        endpoint: String,
        apiKey: String,
        modelName: String,
        provider: String
    ): NovelModelConfigEntity {
        val now = System.currentTimeMillis()
        val entity = NovelModelConfigEntity(
            id = UUID.randomUUID().toString(),
            name = name,
            provider = provider,
            endpoint = endpoint,
            apiKey = apiKey,
            modelName = modelName,
            createdAt = now,
            updatedAt = now
        )
        dao.insertConfig(entity)
        return entity
    }

    /**
     * 通用 upsert，方便外部（比如回填更新已存在的 config）直接写入。
     */
    suspend fun upsertConfig(entity: NovelModelConfigEntity) {
        val touched = entity.copy(updatedAt = System.currentTimeMillis())
        dao.insertConfig(touched)
    }

    suspend fun deleteConfig(id: String) {
        dao.deleteConfig(id)
    }

    // ==================== TestConfig ====================

    /**
     * 探活结果：success 标志、延迟 ms、可选错误信息。
     */
    data class TestResult(
        val success: Boolean,
        val latencyMs: Long,
        val statusCode: Int,
        val error: String?
    )

    /**
     * 用 OkHttp 对 endpoint 发起一次 GET 请求，5 秒超时。
     * 只要返回 2xx/3xx/4xx 都算"端点可达"，5xx/网络错误才算失败。
     */
    suspend fun testConfig(id: String): TestResult {
        val config = dao.getConfigById(id)
            ?: return TestResult(false, 0, -1, "配置不存在")
        val endpoint = config.endpoint.trim()
        if (endpoint.isEmpty()) {
            return TestResult(false, 0, -1, "endpoint 为空")
        }

        val start = System.currentTimeMillis()
        return try {
            val request = Request.Builder()
                .url(endpoint)
                .header("Authorization", "Bearer ${config.apiKey}")
                .get()
                .build()
            httpClient.newCall(request).execute().use { response ->
                val latency = System.currentTimeMillis() - start
                val code = response.code
                val ok = code in 200..499
                TestResult(
                    success = ok,
                    latencyMs = latency,
                    statusCode = code,
                    error = if (ok) null else "HTTP $code"
                )
            }
        } catch (e: Exception) {
            TestResult(
                success = false,
                latencyMs = System.currentTimeMillis() - start,
                statusCode = -1,
                error = e.message ?: e.javaClass.simpleName
            )
        }
    }

    // ==================== TokenStats ====================

    data class StatsSummary(
        val totalPromptTokens: Long,
        val totalCompletionTokens: Long,
        val totalTokens: Long,
        val totalRequests: Int,
        val totalCostMs: Long,
        val records: List<NovelTokenStatEntity>
    )

    /**
     * 取最近 days 天的统计并汇总。
     * DAO 内部固定取 30 条；本方法在外层按日期二次过滤 days 范围。
     */
    suspend fun getRecentStats(days: Int = 30): StatsSummary {
        val all = dao.getRecentStats()
        val cutoff = days.coerceAtLeast(1)
        val filtered = all.filter { it.date.isNotBlank() }.take(cutoff)
        val totalPrompt = filtered.sumOf { it.promptTokens }
        val totalCompletion = filtered.sumOf { it.completionTokens }
        val totalRequests = filtered.sumOf { it.totalRequests }
        val totalCost = filtered.sumOf { it.totalCostMs }
        return StatsSummary(
            totalPromptTokens = totalPrompt,
            totalCompletionTokens = totalCompletion,
            totalTokens = totalPrompt + totalCompletion,
            totalRequests = totalRequests,
            totalCostMs = totalCost,
            records = filtered
        )
    }

    /**
     * 累加写入一条日统计（按 date + modelName upsert）。
     */
    suspend fun recordUsage(
        modelName: String,
        promptTokens: Long,
        completionTokens: Long,
        costMs: Long,
        workId: String = ""
    ) {
        val date = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date())
        val existing = dao.getStatsByModel(modelName).firstOrNull { it.date == date }
        val merged = if (existing != null) {
            existing.copy(
                workId = if (workId.isNotBlank()) workId else existing.workId,
                promptTokens = existing.promptTokens + promptTokens,
                completionTokens = existing.completionTokens + completionTokens,
                totalRequests = existing.totalRequests + 1,
                totalCostMs = existing.totalCostMs + costMs
            )
        } else {
            NovelTokenStatEntity(
                date = date,
                modelName = modelName,
                workId = workId,
                promptTokens = promptTokens,
                completionTokens = completionTokens,
                totalRequests = 1,
                totalCostMs = costMs
            )
        }
        dao.upsertStat(merged)
    }
}
