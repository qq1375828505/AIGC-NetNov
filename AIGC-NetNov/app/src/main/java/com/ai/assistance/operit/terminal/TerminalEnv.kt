package com.ai.assistance.operit.terminal

import androidx.compose.runtime.Composable
import androidx.compose.runtime.State
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember

data class TerminalEnv(
    val isReady: Boolean = false,
    val showSetup: Boolean = false,
    val errorMessage: String? = null
)

@Composable
fun rememberTerminalEnv(
    terminalManager: TerminalManager,
    forceShowSetup: Boolean = false
): State<TerminalEnv> {
    val terminalState = terminalManager.terminalState.collectAsState()
    return remember(forceShowSetup, terminalState.value) {
        mutableStateOf(
            TerminalEnv(
                isReady = !forceShowSetup,
                showSetup = forceShowSetup,
                errorMessage = null
            )
        )
    }
}
