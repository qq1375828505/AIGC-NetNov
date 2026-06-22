package com.ai.assistance.operit.terminal.provider.filesystem

/**
 * 文件系统提供者接口
 * 用于抽象不同环境下的文件系统操作（本地、SSH等）
 */
interface FileSystemProvider {
    /**
     * 检查路径是否存在
     */
    fun exists(path: String): Boolean

    /**
     * 检查路径是否是目录
     */
    fun isDirectory(path: String): Boolean

    /**
     * 列出目录内容
     */
    fun listDirectory(path: String): List<FileInfo>?

    /**
     * 读取文件内容
     */
    fun readFile(path: String): String?

    /**
     * 写入文件内容
     */
    fun writeFile(path: String, content: String): Boolean

    /**
     * 删除文件
     */
    fun deleteFile(path: String): Boolean

    /**
     * 创建目录
     */
    fun createDirectory(path: String): Boolean

    /**
     * 删除目录
     */
    fun deleteDirectory(path: String): Boolean

    /**
     * 获取文件信息
     */
    fun getFileInfo(path: String): FileInfo?

    /**
     * 文件信息数据类
     */
    data class FileInfo(
        val name: String,
        val path: String,
        val isDirectory: Boolean,
        val size: Long = 0,
        val permissions: String = "",
        val lastModified: Long = 0
    )
}
