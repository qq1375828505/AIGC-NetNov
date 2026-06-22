package com.ai.assistance.mmd

/**
 * Stub class for MmdNative.
 * This is a placeholder to allow compilation without the actual MMD native library.
 * The real implementation is in the :mmd module.
 */
object MmdNative {
    @JvmStatic
    fun nativeCreate(modelPath: String): Long = 0L

    @JvmStatic
    fun nativeDestroy(ptr: Long) {
        // Stub: no-op
    }

    @JvmStatic
    fun nativeLoadAnimation(ptr: Long, animationPath: String): Boolean = false

    @JvmStatic
    fun nativeSetAnimation(ptr: Long, animationName: String?, isLooping: Boolean) {
        // Stub: no-op
    }

    @JvmStatic
    fun nativeSetModelRotation(ptr: Long, rotationX: Float, rotationY: Float, rotationZ: Float) {
        // Stub: no-op
    }

    @JvmStatic
    fun nativeSetCameraDistanceScale(ptr: Long, distanceScale: Float) {
        // Stub: no-op
    }

    @JvmStatic
    fun nativeSetCameraTargetHeight(ptr: Long, targetHeight: Float) {
        // Stub: no-op
    }

    @JvmStatic
    fun nativeOnSurfaceCreated(ptr: Long) {
        // Stub: no-op
    }

    @JvmStatic
    fun nativeOnSurfaceChanged(ptr: Long, width: Int, height: Int) {
        // Stub: no-op
    }

    @JvmStatic
    fun nativeOnDrawFrame(ptr: Long) {
        // Stub: no-op
    }

    @JvmStatic
    fun nativeGetAnimationNames(ptr: Long): List<String> = emptyList()

    @JvmStatic
    fun nativeGetAnimationDuration(ptr: Long, animationName: String): Long = 0L
}
