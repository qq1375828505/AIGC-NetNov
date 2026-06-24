# 编辑器 WebView 实现

> **状态：❌ 未实施** | 统一决策见 `Operit网文写作改造计划.md` 4.2 / 4.3 节
> - 编辑器资源应复制到 **ToolPkg `resources/editor/`** 下，而不是 `app/src/main/assets/editor/`。
> - 在 Screen 中通过 WebView 加载 `file:///android_asset/packages/novelide/resources/editor/editor.html`。
> - HTML 编辑器通过 `NativeBridge` 与 Room 数据库交互，不再直接写文件系统。
> - 仍需要创建 `NovelEditorWebView` / `EditorContainer` 作为 WebView 容器，但主要实现是 ToolPkg + HTML。

## 资源文件复制

从 novelIDE 复制编辑器资源到 Operit：

```bash
cp -r novelIDE_src/assets/editor/* Operit-main/app/src/main/assets/editor/
```

## NovelEditorWebView.kt

```kotlin
@SuppressLint("SetJavaScriptEnabled")
class NovelEditorWebView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null
) : WebView(context, attrs) {
    
    init {
        settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            allowFileAccess = true
        }
        addJavascriptInterface(EditorBridge(), "AndroidBridge")
        loadUrl("file:///android_asset/editor/editor.html")
    }
    
    fun setContent(html: String) {
        evaluateJavascript("setEditorContent('${escapeJs(html)}')", null)
    }
    
    fun getContent(callback: (String) -> Unit) {
        evaluateJavascript("getEditorContent()") { result ->
            callback(result.removeSurrounding("\""))
        }
    }
    
    fun getWordCount(callback: (Int) -> Unit) {
        evaluateJavascript("getWordCount()") { result ->
            callback(result.replace("\"", "").toIntOrNull() ?: 0)
        }
    }
    
    fun toggleRichMode(enable: Boolean) {
        evaluateJavascript("setRichMode($enable)", null)
    }
    
    inner class EditorBridge {
        @JavascriptInterface
        fun onContentChanged(content: String) { /* 回调 */ }
        
        @JavascriptInterface
        fun onWordCountChanged(count: Int) { /* 回调 */ }
    }
    
    private fun escapeJs(text: String): String {
        return text.replace("\\", "\\\\")
            .replace("'", "\\'")
            .replace("\n", "\\n")
    }
}
```

## 双编辑器切换容器

```kotlin
class EditorContainer @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null
) : FrameLayout(context, attrs) {
    
    private val plainEditor: EditText
    private val richEditor: NovelEditorView
    private var isRichMode = false
    
    init {
        plainEditor = EditText(context).apply { visibility = VISIBLE }
        richEditor = NovelEditorView(context).apply { visibility = GONE }
        
        addView(plainEditor, LayoutParams(MATCH_PARENT, MATCH_PARENT))
        addView(richEditor, LayoutParams(MATCH_PARENT, MATCH_PARENT))
    }
    
    fun toggleMode() {
        if (isRichMode) {
            richEditor.getContent { html ->
                plainEditor.setText(htmlToPlain(html))
                richEditor.visibility = GONE
                plainEditor.visibility = VISIBLE
            }
        } else {
            val html = plainToHtml(plainEditor.text.toString())
            richEditor.setContent(html)
            plainEditor.visibility = GONE
            richEditor.visibility = VISIBLE
        }
        isRichMode = !isRichMode
    }
    
    fun getContent(): String {
        return if (isRichMode) {
            // 需要同步获取
            plainEditor.text.toString()
        } else {
            plainEditor.text.toString()
        }
    }
}
```