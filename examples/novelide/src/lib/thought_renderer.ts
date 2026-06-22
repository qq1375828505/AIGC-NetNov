// 思维链渲染器 - 解析和渲染 AI 的思考过程

/**
 * 思维内容提取结果
 */
export interface ThinkingContent {
  /** 主要内容（移除了思考标签） */
  mainContent: string;
  /** 思考内容（思考标签内的内容） */
  thinkingContent: string;
  /** 是否包含思考内容 */
  hasThinking: boolean;
}

/**
 * 思维链渲染器
 * 用于解析 AI 响应中的思考标签，并提供渲染支持
 */
export class ThoughtRenderer {
  /**
   * 提取思维内容
   * @param content 包含思考标签的 AI 响应
   * @returns 提取结果
   */
  static extractThinkingContent(content: string): ThinkingContent {
    // 匹配 <think> 和 <thinking> 标签
    const thinkPattern = /<(?:think|thinking)>([\s\S]*?)<\/(?:think|thinking)>/g;
    
    // 收集所有思考标签内的内容
    const thinkingParts: string[] = [];
    let match;
    
    while ((match = thinkPattern.exec(content)) !== null) {
      thinkingParts.push(match[1].trim());
    }
    
    // 移除思考标签，保留主要内容
    const mainContent = content
      .replace(/<(?:think|thinking)>[\s\S]*?<\/(?:think|thinking)>/g, '')
      .replace(/<search>[\s\S]*?<\/search>/g, '')
      .trim();
    
    const thinkingContent = thinkingParts.join('\n');
    
    return {
      mainContent,
      thinkingContent,
      hasThinking: thinkingParts.length > 0
    };
  }
  
  /**
   * 检测是否正在思考（未闭合的标签）
   * @param content 当前内容
   * @returns 是否正在思考
   */
  static isThinkingInProgress(content: string): boolean {
    // 检查是否有未闭合的思考标签
    const openThinkCount = (content.match(/<(?:think|thinking)>/g) || []).length;
    const closeThinkCount = (content.match(/<\/(?:think|thinking)>/g) || []).length;
    
    return openThinkCount > closeThinkCount;
  }
  
  /**
   * 获取思考状态文本
   * @param content 当前内容
   * @returns 状态描述
   */
  static getThinkingStatus(content: string): string {
    if (this.isThinkingInProgress(content)) {
      return '思考中...';
    }
    
    const { hasThinking } = this.extractThinkingContent(content);
    if (hasThinking) {
      return '思考完成';
    }
    
    return '';
  }
  
  /**
   * 渲染思考内容为 HTML（用于 Web 端显示）
   * @param thinkingContent 思考内容
   * @param expanded 是否展开
   * @returns HTML 字符串
   */
  static renderThinkingHtml(thinkingContent: string, expanded: boolean = false): string {
    if (!thinkingContent.trim()) {
      return '';
    }
    
    const contentId = `thinking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return `
      <div class="thinking-container" style="margin: 8px 0; border-left: 3px solid #888; padding-left: 12px;">
        <div class="thinking-header" 
             style="cursor: pointer; color: #888; font-size: 14px; user-select: none;"
             onclick="const el = document.getElementById('${contentId}'); el.style.display = el.style.display === 'none' ? 'block' : 'none';">
          <span>${expanded ? '▼' : '▶'} 思考过程</span>
        </div>
        <div id="${contentId}" class="thinking-content" 
             style="display: ${expanded ? 'block' : 'none'}; color: #666; font-size: 13px; margin-top: 8px; white-space: pre-wrap;">
          ${this.escapeHtml(thinkingContent)}
        </div>
      </div>
    `;
  }
  
  /**
   * HTML 转义
   * @param text 原始文本
   * @returns 转义后的文本
   */
  private static escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
  
  /**
   * 渲染完整消息（包含思考过程和主要内容）
   * @param content 完整的 AI 响应
   * @param showThinking 是否显示思考过程
   * @param thinkingExpanded 思考过程是否默认展开
   * @returns 渲染后的 HTML
   */
  static renderFullMessage(
    content: string,
    showThinking: boolean = true,
    thinkingExpanded: boolean = false
  ): string {
    const { mainContent, thinkingContent, hasThinking } = this.extractThinkingContent(content);
    
    let html = '';
    
    // 渲染思考过程
    if (showThinking && hasThinking) {
      html += this.renderThinkingHtml(thinkingContent, thinkingExpanded);
    }
    
    // 渲染主要内容（转义HTML防止XSS）
    html += `<div class="message-content">${this.escapeHtml(mainContent)}</div>`;
    
    return html;
  }
}