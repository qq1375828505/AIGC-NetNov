package com.ai.assistance.mmd

import android.content.Context
import android.opengl.GLSurfaceView

/**
 * Stub class for MmdGlSurfaceView.
 * This is a placeholder to allow compilation without the actual MMD native library.
 * The real implementation is in the :mmd module.
 */
class MmdGlSurfaceView(context: Context) : GLSurfaceView(context) {

    fun setOnRenderErrorListener(listener: ((String) -> Unit)?) {
        // Stub: no-op
    }

    fun setModelPath(modelPath: String) {
        // Stub: no-op
    }

    fun setAnimationState(animationName: String?, isLooping: Boolean) {
        // Stub: no-op
    }

    fun setModelRotation(rotationX: Float, rotationY: Float, rotationZ: Float) {
        // Stub: no-op
    }

    fun setCameraDistanceScale(distanceScale: Float) {
        // Stub: no-op
    }

    fun setCameraTargetHeight(targetHeight: Float) {
        // Stub: no-op
    }

    override fun onResume() {
        super.onResume()
    }

    override fun onPause() {
        super.onPause()
    }
}
