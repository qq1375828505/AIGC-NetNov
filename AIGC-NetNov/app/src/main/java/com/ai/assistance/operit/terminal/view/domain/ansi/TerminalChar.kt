package com.ai.assistance.operit.terminal.view.domain.ansi

/**
 * 终端字符类
 * 表示终端中的一个字符
 */
data class TerminalChar(
    val char: Char = ' ',
    val foreground: Int = 0,
    val background: Int = 0,
    val bold: Boolean = false,
    val italic: Boolean = false,
    val underline: Boolean = false
)