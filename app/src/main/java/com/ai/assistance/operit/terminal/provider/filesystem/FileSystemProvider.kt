package com.ai.assistance.operit.terminal.provider.filesystem

/**
 * 文件系统操作结果
 */
data class FsResult(
    val success: Boolean,
    val message: String = ""
)

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
     * 检查路径是否是文件
     */
    fun isFile(path: String): Boolean

    /**
     * 列出目录内容
     */
    fun listDirectory(path: String): List<FileInfo>?

    /**
     * 读取文件内容
     */
    fun readFile(path: String): String?

    /**
     * 读取文件样本（前N字节）
     */
    fun readFileSample(path: String, maxBytes: Int): String?

    /**
     * 读取文件二进制内容
     */
    fun readFileBytes(path: String): ByteArray?

    /**
     * 读取带大小限制的文件
     */
    fun readFileWithLimit(path: String, maxBytes: Int): String?

    /**
     * 获取文件行数
     */
    fun getLineCount(path: String): Int

    /**
     * 读取文件指定行范围
     */
    fun readFileLines(path: String, startLine: Int, endLine: Int): String?

    /**
     * 获取文件大小
     */
    fun getFileSize(path: String): Long

    /**
     * 写入文件内容
     */
    fun writeFile(path: String, content: String): Boolean

    /**
     * 写入文件内容（带追加参数，返回带消息的结果）
     */
    fun writeFile(path: String, content: String, append: Boolean): FsResult

    /**
     * 写入二进制文件
     */
    fun writeFileBytes(path: String, bytes: ByteArray): FsResult

    /**
     * 删除文件或目录
     */
    fun deleteFile(path: String): Boolean

    /**
     * 删除文件或目录（带递归参数）
     */
    fun delete(path: String, recursive: Boolean): FsResult

    /**
     * 移动文件或目录
     */
    fun move(sourcePath: String, destPath: String): FsResult

    /**
     * 复制文件或目录
     */
    fun copy(sourcePath: String, destPath: String, recursive: Boolean): FsResult

    /**
     * 创建目录
     */
    fun createDirectory(path: String): Boolean

    /**
     * 创建目录（带创建父目录参数）
     */
    fun createDirectory(path: String, createParents: Boolean): FsResult

    /**
     * 删除目录
     */
    fun deleteDirectory(path: String): Boolean

    /**
     * 获取文件信息
     */
    fun getFileInfo(path: String): FileInfo?

    /**
     * 查找文件
     */
    fun findFiles(basePath: String, pattern: String, maxDepth: Int, caseInsensitive: Boolean): List<String>

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
