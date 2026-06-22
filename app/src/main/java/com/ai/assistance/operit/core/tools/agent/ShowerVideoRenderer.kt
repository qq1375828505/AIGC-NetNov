package com.ai.assistance.operit.core.tools.agent

import android.view.Surface

/**
 * Simple H.264 decoder that renders the Shower video stream onto a Surface.
 *
 * This decoder assumes that the first two binary frames received from the Shower server
 * are the codec configuration buffers (csd-0 and csd-1), followed by regular access units.
 *
 * This app-level object is a thin facade over the shared implementation in the
 * `:showerclient` module.
 */
object ShowerVideoRenderer {

    // 裁剪模块：showerclient 模块不可用，提供空实现
    fun attach(surface: Surface, videoWidth: Int, videoHeight: Int) {
        // 空实现
    }

    fun detach() {
        // 空实现
    }

    fun onFrame(data: ByteArray) {
        // 空实现
    }

    suspend fun captureCurrentFramePng(): ByteArray? {
        // 裁剪模块：返回空
        return null
    }
}
