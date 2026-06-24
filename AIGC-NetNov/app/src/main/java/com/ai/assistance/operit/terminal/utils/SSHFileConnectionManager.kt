package com.ai.assistance.operit.terminal.utils

import android.content.Context
import com.ai.assistance.operit.terminal.provider.filesystem.FileSystemProvider

/**
 * SSH文件连接管理器
 * 管理SSH文件系统连接
 */
class SSHFileConnectionManager private constructor(private val context: Context) {
    
    companion object {
        @Volatile
        private var INSTANCE: SSHFileConnectionManager? = null
        
        fun getInstance(context: Context): SSHFileConnectionManager {
            return INSTANCE ?: synchronized(this) {
                val instance = SSHFileConnectionManager(context.applicationContext)
                INSTANCE = instance
                instance
            }
        }
    }
    
    /**
     * 获取文件系统提供者
     * @return FileSystemProvider? 如果SSH已连接则返回提供者，否则返回null
     */
    fun getFileSystemProvider(): FileSystemProvider? {
        // 桩实现：返回null表示SSH未连接
        return null
    }
    
    /**
     * 检查SSH是否已登录
     * @return Boolean 是否已登录
     */
    fun isLoggedIn(): Boolean {
        return false
    }
    
    /**
     * 获取SSH连接状态
     * @return String 状态描述
     */
    fun getConnectionStatus(): String {
        return "未连接"
    }
}