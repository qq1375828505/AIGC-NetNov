package com.ai.assistance.fbx

import android.content.Context
import android.opengl.GLSurfaceView

/**
 * Stub class for FbxGlSurfaceView.
 * This is a placeholder to allow compilation without the actual FBX native library.
 * The real implementation is in the :fbx module.
 */
class FbxGlSurfaceView(context: Context) : GLSurfaceView(context) {

    fun setOnRenderErrorListener(listener: ((String) -> Unit)?) {
        // Stub: no-op
    }

    fun setOnAnimationsDiscoveredListener(listener: ((List<String>, Map<String, Long>) -> Unit)?) {
        // Stub: no-op
    }

    fun setModelPath(modelPath: String) {
        // Stub: no-op
    }

    fun setAnimationState(animationName: String?, isLooping: Boolean, playbackNonce: Long = 0) {
        // Stub: no-op
    }

    fun setCameraPose(pitch: Float, yaw: Float, distanceScale: Float, targetHeight: Float) {
        // Stub: no-op
    }

    override fun onResume() {
        super.onResume()
    }

    override fun onPause() {
        super.onPause()
    }
}
