package com.ai.assistance.fbx

import java.io.File

/**
 * Stub class for FbxInspector.
 * This is a placeholder to allow compilation without the actual FBX native library.
 * The real implementation is in the :fbx module.
 */
object FbxInspector {
    /**
     * Inspect an FBX file and return model information.
     * @param file The FBX file to inspect
     * @return FbxModelInfo or null if inspection fails
     */
    fun inspect(file: File): FbxModelInfo? = null

    /**
     * Inspect an FBX file from path and return model information.
     * @param path The path to the FBX file
     * @return FbxModelInfo or null if inspection fails
     */
    fun inspect(path: String): FbxModelInfo? = null
}
