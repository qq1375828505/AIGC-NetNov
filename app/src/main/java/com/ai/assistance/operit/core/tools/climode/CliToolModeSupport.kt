package com.ai.assistance.operit.core.tools.climode

import android.content.Context
import com.ai.assistance.operit.core.config.SystemToolPrompts
import com.ai.assistance.operit.core.tools.PackageTool
import com.ai.assistance.operit.core.tools.PackageToolParameter
import com.ai.assistance.operit.core.tools.ToolPackage
import com.ai.assistance.operit.core.tools.packTool.PackageManager
import com.ai.assistance.operit.data.model.ApiProviderType
import com.ai.assistance.operit.data.model.SystemToolPromptCategory
import com.ai.assistance.operit.data.model.ToolParameterSchema
import com.ai.assistance.operit.data.model.ToolPrompt
import com.ai.assistance.operit.data.preferences.ResolvedCharacterCardToolAccess
import java.util.Locale
import org.json.JSONObject

enum class ToolExposureMode {
    FULL,
    CLI;

    companion object {
        fun resolve(providerType: ApiProviderType): ToolExposureMode {
            return when (providerType) {
                ApiProviderType.LMSTUDIO,
                ApiProviderType.OLLAMA,
                ApiProviderType.OPENAI_LOCAL,
                ApiProviderType.MNN,
                ApiProviderType.LLAMA_CPP -> CLI
                else -> FULL
            }
        }
    }
}

enum class HiddenToolSourceKind {
    BUILTIN,
    INTERNAL,
    PACKAGE,
    MCP,
    ACTIVATION;

    fun label(useEnglish: Boolean): String {
        return when (this) {
            BUILTIN -> "built-in"
            INTERNAL -> "internal"
            PACKAGE -> "package"
            MCP -> if (useEnglish) "mcp" else "MCP"
            ACTIVATION -> "activation"
        }
    }
}

data class HiddenToolCatalogEntry(
    val targetToolName: String,
    val displayName: String,
    val description: String,
    val parameterHints: List<String>,
    val sourceKind: HiddenToolSourceKind,
    val keywords: List<String> = emptyList(),
    val suggestedParamsJson: String? = null
)

object CliToolModeSupport {
    const val SEARCH_TOOL_NAME = "search"
    const val PROXY_TOOL_NAME = "proxy"
    const val PACKAGE_PROXY_TOOL_NAME = "package_proxy"
    private const val DEFAULT_SEARCH_LIMIT = 8
    private val PUBLIC_TOOL_NAMES = linkedSetOf(SEARCH_TOOL_NAME, PROXY_TOOL_NAME)
    private val RESERVED_PROXY_TARGETS =
        linkedSetOf(SEARCH_TOOL_NAME, PROXY_TOOL_NAME, PACKAGE_PROXY_TOOL_NAME)

    fun isCliPublicTool(toolName: String): Boolean {
        return PUBLIC_TOOL_NAMES.contains(toolName.trim())
    }

    fun isReservedProxyTarget(toolName: String): Boolean {
        return RESERVED_PROXY_TARGETS.contains(toolName.trim())
    }

    fun defaultSearchLimit(): Int = DEFAULT_SEARCH_LIMIT

    fun buildCliModePrompt(useEnglish: Boolean): String {
        val intro =
            if (useEnglish) {
                """
                CLI TOOL MODE
                - Only two public tools are available: `search` and `proxy`.
                - `search` only searches the hidden tool catalog. It does not read files, search code, or browse the web.
                - All real capabilities are hidden behind `proxy`.
                - Do not call hidden tools directly. Use `search` first, then call `proxy` with the discovered target tool name and JSON params.
                """.trimIndent()
            } else {
                """
                CLI TOOL MODE
                - Only two public tools are available: `search` and `proxy`.
                - `search` only searches the hidden tool catalog. It does not read files, search code, or browse the web.
                - All real capabilities are hidden behind `proxy`.
                - Do not call hidden tools directly. Use `search` first, then call `proxy` with the discovered target tool name and JSON params.
                """.trimIndent()
            }

        val category =
            SystemToolPromptCategory(
                categoryName = "Public tools",
                tools = buildCliPublicToolPrompts(useEnglish)
            ).toString()

        return "$intro\n\n$category"
    }

    fun buildCliPublicToolPrompts(useEnglish: Boolean): List<ToolPrompt> {
        return if (useEnglish) {
            listOf(
                ToolPrompt(
                    name = SEARCH_TOOL_NAME,
                    description = "Search the hidden tool catalog only. Use this first to discover hidden tool names and parameter shapes.",
                    parametersStructured = listOf(
                        ToolParameterSchema(
                            name = "query",
                            type = "string",
                            description = "tool capability or hidden tool name to search for",
                            required = true
                        ),
                        ToolParameterSchema(
                            name = "limit",
                            type = "integer",
                            description = "optional, max results to return",
                            required = false
                        )
                    )
                ),
                ToolPrompt(
                    name = PROXY_TOOL_NAME,
                    description = "Execute a hidden tool by name. Must call 'search' first to discover the target tool name.",
                    parametersStructured = listOf(
                        ToolParameterSchema(
                            name = "tool_name",
                            type = "string",
                            description = "the target hidden tool name discovered via search",
                            required = true
                        ),
                        ToolParameterSchema(
                            name = "parameters",
                            type = "string",
                            description = "JSON-encoded string of parameters for the target tool",
                            required = true
                        )
                    )
                )
            )
        } else {
            listOf(
                ToolPrompt(
                    name = SEARCH_TOOL_NAME,
                    description = "仅搜索隐藏工具目录。请先使用此工具来发现隐藏工具的名称和参数格式。",
                    parametersStructured = listOf(
                        ToolParameterSchema(
                            name = "query",
                            type = "string",
                            description = "要搜索的工具能力或隐藏工具名称",
                            required = true
                        ),
                        ToolParameterSchema(
                            name = "limit",
                            type = "integer",
                            description = "可选，返回的最大结果数",
                            required = false
                        )
                    )
                ),
                ToolPrompt(
                    name = PROXY_TOOL_NAME,
                    description = "通过名称执行隐藏工具。必须先调用 'search' 来发现目标工具名称。",
                    parametersStructured = listOf(
                        ToolParameterSchema(
                            name = "tool_name",
                            type = "string",
                            description = "通过搜索发现的目标隐藏工具名称",
                            required = true
                        ),
                        ToolParameterSchema(
                            name = "parameters",
                            type = "string",
                            description = "目标工具的参数，JSON 编码字符串",
                            required = true
                        )
                    )
                )
            )
        }
    }

    // 简化实现：返回空列表
    fun getHiddenToolCatalog(
        context: Context,
        packageManager: PackageManager,
        roleCardToolAccess: ResolvedCharacterCardToolAccess,
        useEnglish: Boolean
    ): List<HiddenToolCatalogEntry> {
        return emptyList()
    }

    // 简化实现：返回空列表
    fun searchHiddenToolCatalog(
        query: String,
        catalog: List<HiddenToolCatalogEntry>,
        limit: Int
    ): List<HiddenToolCatalogEntry> {
        return emptyList()
    }

    fun formatSearchResults(
        query: String,
        results: List<HiddenToolCatalogEntry>,
        useEnglish: Boolean
    ): String {
        if (results.isEmpty()) {
            return if (useEnglish) {
                "No hidden tools matched \"$query\". Try a broader capability keyword, then call proxy with a discovered target tool name."
            } else {
                "No hidden tools matched \"$query\". Try a broader capability keyword, then call proxy with a discovered target tool name."
            }
        }

        return buildString {
            if (useEnglish) {
                appendLine("Hidden tool search results for \"$query\":")
            } else {
                appendLine("Hidden tool search results for \"$query\":")
            }
            results.forEachIndexed { index, entry ->
                append(index + 1)
                append(". `")
                append(entry.displayName)
                append("` [")
                append(entry.sourceKind.label(useEnglish))
                appendLine("]")
                append("   ")
                appendLine(entry.description.ifBlank {
                    "No description."
                })
                append("   ")
                append("Target: `")
                append(entry.targetToolName)
                appendLine("`")
                if (!entry.suggestedParamsJson.isNullOrBlank()) {
                    append("   ")
                    append("Params hint: `")
                    append(entry.suggestedParamsJson)
                    appendLine("`")
                } else if (entry.parameterHints.isNotEmpty()) {
                    append("   ")
                    append("Params: ")
                    appendLine(entry.parameterHints.joinToString("; "))
                }
            }
        }.trimEnd()
    }

    // 简化实现：返回"not available"结果
    suspend fun executeHiddenTool(
        toolName: String,
        parametersJson: String,
        context: Context,
        packageManager: PackageManager
    ): String {
        return "Hidden tool execution not available in this build"
    }

    // 辅助方法
    private fun buildBuiltinAndInternalCategories(useEnglish: Boolean): List<SystemToolPromptCategory> {
        return emptyList()
    }

    private fun buildBuiltinToolNameSet(useEnglish: Boolean): Set<String> {
        return emptySet()
    }

    private fun isToolNameAllowedForRoleCard(
        toolName: String,
        allowedToolNames: Set<String>?,
        roleCardToolAccess: ResolvedCharacterCardToolAccess
    ): Boolean {
        return true
    }

    private fun buildParameterHints(tool: ToolPrompt): List<String> {
        return emptyList()
    }

    private fun buildParameterHint(
        name: String,
        description: String,
        type: String,
        required: Boolean
    ): String {
        return "$name ($type): $description"
    }

    private fun addActivationEntry(
        entries: MutableMap<String, HiddenToolCatalogEntry>,
        displayName: String,
        description: String,
        keywordTag: String,
        sourceKind: HiddenToolSourceKind
    ) {
        // 简化实现：不做任何操作
    }

    private fun addPackageToolEntries(
        entries: MutableMap<String, HiddenToolCatalogEntry>,
        prefix: String,
        toolPackage: ToolPackage,
        descriptionResolver: (PackageTool) -> String,
        paramHintResolver: (PackageToolParameter) -> String,
        sourceKind: HiddenToolSourceKind,
        keywordTag: String
    ) {
        // 简化实现：不做任何操作
    }
}
