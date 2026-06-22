// 工具函数 - 统一错误处理、输入验证、日志、缓存

const LOG_PREFIX = "[NovelIDE]";

/** 日志工具 */
export const Logger = {
  info(message: string, ...args: any[]) {
    console.log(`${LOG_PREFIX} [INFO] ${message}`, ...args);
  },
  warn(message: string, ...args: any[]) {
    console.warn(`${LOG_PREFIX} [WARN] ${message}`, ...args);
  },
  error(message: string, error?: any) {
    console.error(`${LOG_PREFIX} [ERROR] ${message}`, error ?? "");
  },
};

// ==================== JSON 缓存机制 ====================

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  hits: number;
}

/** JSON 解析缓存 - 减少重复解析开销 */
class JsonCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly maxSize: number;
  private readonly ttlMs: number;

  constructor(maxSize: number = 100, ttlMs: number = 30000) {
    this.maxSize = maxSize;
    this.ttlMs = ttlMs;
  }

  /** 获取缓存的解析结果 */
  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    // 检查是否过期
    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.cache.delete(key);
      return undefined;
    }

    entry.hits++;
    return entry.value as T;
  }

  /** 设置缓存 */
  set<T>(key: string, value: T): void {
    // 如果缓存已满，删除最少使用的条目
    if (this.cache.size >= this.maxSize) {
      this.evictLeastUsed();
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      hits: 1,
    });
  }

  /** 清除过期缓存 */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttlMs) {
        this.cache.delete(key);
      }
    }
  }

  /** 清除所有缓存 */
  clear(): void {
    this.cache.clear();
  }

  /** 获取缓存大小 */
  get size(): number {
    return this.cache.size;
  }

  /** 驱逐最少使用的条目 */
  private evictLeastUsed(): void {
    let minHits = Infinity;
    let minKey = "";

    for (const [key, entry] of this.cache.entries()) {
      if (entry.hits < minHits) {
        minHits = entry.hits;
        minKey = key;
      }
    }

    if (minKey) {
      this.cache.delete(minKey);
    }
  }
}

// 全局 JSON 缓存实例（30秒TTL，最多100条）
const jsonCache = new JsonCache(100, 30000);

/** 生成缓存键 */
function cacheKey(methodName: string, args: any[]): string {
  return `${methodName}:${JSON.stringify(args)}`;
}

/** 安全的 JSON.parse，带缓存 */
export function safeJsonParse<T = any>(text: string, useCache: boolean = false, key?: string): T | null {
  // 如果启用缓存且有键，尝试从缓存获取
  if (useCache && key) {
    const cached = jsonCache.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }
  }

  try {
    const parsed = JSON.parse(text) as T;

    // 如果启用缓存，存入缓存
    if (useCache && key) {
      jsonCache.set(key, parsed);
    }

    return parsed;
  } catch (e) {
    Logger.error("JSON 解析失败", e);
    return null;
  }
}

/** 安全调用 NativeBridge，统一 try-catch 和日志 */
export async function safeNativeCall<T = any>(
  methodName: string,
  args: any[],
  parser?: (raw: string) => T
): Promise<T> {
  try {
    const result = await Tools.callNative(methodName, args);
    if (parser) {
      return parser(result);
    }
    return result as unknown as T;
  } catch (error) {
    Logger.error(`NativeBridge.${methodName} 调用失败`, error);
    throw error;
  }
}

/** 安全调用 NativeBridge 并返回 JSON 对象（带缓存） */
export async function safeNativeJsonCall<T = any>(
  methodName: string,
  args: any[],
  useCache: boolean = false
): Promise<T> {
  const key = useCache ? cacheKey(methodName, args) : undefined;

  return safeNativeCall<T>(methodName, args, (raw: string) => {
    const parsed = safeJsonParse<T>(raw, useCache, key);
    if (parsed === null) {
      Logger.warn(`${methodName} 返回了无效 JSON，返回空对象`);
      return (Array.isArray(raw) ? [] : {}) as T;
    }
    return parsed;
  });
}

/** 安全调用 NativeBridge，返回布尔值 */
export async function safeNativeBoolCall(
  methodName: string,
  args: any[]
): Promise<boolean> {
  try {
    const result = await Tools.callNative(methodName, args);
    // Kotlin bridge returns JSON string like {"success": true} or {"success": false, "error": "..."}
    if (typeof result === "string") {
      const parsed = safeJsonParse<{ success?: boolean }>(result);
      if (parsed && typeof parsed.success === "boolean") {
        return parsed.success;
      }
      // Fallback: non-empty string is truthy
      return !!result;
    }
    return !!result;
  } catch (error) {
    Logger.error(`NativeBridge.${methodName} 调用失败`, error);
    throw error;
  }
}

/** 验证字符串参数不为空 */
export function requireString(value: any, name: string): string {
  if (value === undefined || value === null || (typeof value === "string" && !value.trim())) {
    throw new Error(`参数 "${name}" 不能为空`);
  }
  return String(value).trim();
}

/** 可选字符串参数，默认空字符串 */
export function optionalString(value: any, defaultValue: string = ""): string {
  if (value === undefined || value === null) return defaultValue;
  return String(value);
}

/** 清除 JSON 缓存（用于数据变更后） */
export function clearJsonCache(): void {
  jsonCache.clear();
  Logger.info("JSON 缓存已清除");
}

/** 获取缓存统计信息 */
export function getCacheStats(): { size: number; maxSize: number; ttlMs: number } {
  return {
    size: jsonCache.size,
    maxSize: 100,
    ttlMs: 30000,
  };
}
