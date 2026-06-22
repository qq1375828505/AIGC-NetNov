// Skill 管理器 - 管理25个番茄网文风格Skill
// 同步自后端数据库 TomatoPresetSeeder.kt 的25个预设数据

/**
 * Skill 配置
 */
export interface SkillConfig {
  /** Skill ID */
  id: string;
  /** Skill 名称 */
  name: string;
  /** 所属分类 */
  category: string;
  /** 描述 */
  description: string;
  /** 图标 */
  icon: string;
  /** 系统提示词 */
  systemPrompt: string;
  /** 标签 */
  tags: string[];
  /** 工作时长（分钟）- 对应 TomatoPresetSeeder 的 workMinutes */
  workMinutes: number;
  /** 休息时长（分钟）- 对应 TomatoPresetSeeder 的 breakMinutes */
  breakMinutes: number;
  /** 是否内置预设 */
  isBuiltin: boolean;
  /** 创建时间 */
  createdAt: number;
  /** 更新时间 */
  updatedAt: number;
}

/**
 * Skill 应用上下文
 */
export interface SkillContext {
  /** 原始内容 */
  content: string;
  /** 作品标题 */
  workTitle?: string;
  /** 章节标题 */
  chapterTitle?: string;
  /** 额外参数 */
  params?: Record<string, any>;
}

/**
 * Skill 应用结果
 */
export interface SkillResult {
  /** 是否成功 */
  success: boolean;
  /** 结果内容 */
  result?: string;
  /** 使用的 Skill ID */
  skillId?: string;
  /** 错误信息 */
  error?: string;
}

// 25个番茄网文风格预设 Skill（对应 TomatoPresetSeeder.kt 的25个预设）
const TOMATO_SKILLS: SkillConfig[] = [
  // ==================== 都市流 (10个) ====================
  {
    id: "urban_zhuixu",
    name: "都市赘婿·隐忍爆发",
    category: "都市流",
    description: "赘婿隐忍多年，一朝爆发打脸全场",
    icon: "💍",
    systemPrompt: "你是一个都市赘婿流小说写作助手。帮助用户创作以'隐忍爆发'为核心的都市小说。重点描写主角从被人看不起到逆袭打脸的过程，注重情绪铺垫和反转爽感。",
    tags: ["打脸", "身份揭露", "情绪反差"],
    workMinutes: 25,
    breakMinutes: 5,
    isBuiltin: true,
    createdAt: 0,
    updatedAt: 0
  },
  {
    id: "urban_shenyi",
    name: "都市神医·一针定乾坤",
    category: "都市流",
    description: "神医下山，医术救人打脸",
    icon: "🏥",
    systemPrompt: "你是一个都市神医流小说写作助手。帮助用户创作以'医术'为核心的都市小说。重点描写主角用神奇医术救人、打脸质疑者的场景，注重专业感和爽感结合。",
    tags: ["医术", "救人", "打脸", "专业感"],
    workMinutes: 25,
    breakMinutes: 5,
    isBuiltin: true,
    createdAt: 0,
    updatedAt: 0
  },
  {
    id: "urban_zhanshen",
    name: "都市战神·龙帅归来",
    category: "都市流",
    description: "战神归来，守护家人",
    icon: "⚔️",
    systemPrompt: "你是一个都市战神流小说写作助手。帮助用户创作以'战神归来'为核心的都市小说。重点描写主角从战场归来后保护家人、打脸恶势力的场景，注重铁血和温情结合。",
    tags: ["战神", "护短", "身份揭露", "铁血"],
    workMinutes: 25,
    breakMinutes: 5,
    isBuiltin: true,
    createdAt: 0,
    updatedAt: 0
  },
  {
    id: "xiancheng_zhenxing",
    name: "县城振兴·全民分红流",
    category: "都市流",
    description: "带领县城致富，全民分红",
    icon: "🏘️",
    systemPrompt: "你是一个县城振兴流小说写作助手。帮助用户创作以'乡村振兴'为核心的都市小说。重点描写主角带领县城发展经济、实现全民分红的过程，注重现实感和成就感。",
    tags: ["县城", "振兴", "分红", "基建"],
    workMinutes: 25,
    breakMinutes: 5,
    isBuiltin: true,
    createdAt: 0,
    updatedAt: 0
  },
  {
    id: "qingxu_fafeng",
    name: "情绪发疯·怼人变强流",
    category: "都市流",
    description: "发疯怼人，情绪值变强",
    icon: "😤",
    systemPrompt: "你是一个情绪发疯流小说写作助手。帮助用户创作以'发疯怼人'为核心的都市小说。重点描写主角通过发泄情绪、怼人获得系统奖励变强的过程，注重情绪宣泄和爽感。",
    tags: ["发疯", "怼人", "情绪价值", "系统"],
    workMinutes: 25,
    breakMinutes: 5,
    isBuiltin: true,
    createdAt: 0,
    updatedAt: 0
  },
  {
    id: "changsheng_jiazu",
    name: "长生家族·千年底蕴流",
    category: "都市流",
    description: "长生家族千年传承",
    icon: "🏛️",
    systemPrompt: "你是一个长生家族流小说写作助手。帮助用户创作以'长生家族'为核心的都市小说。重点描写千年家族的底蕴、传承和秘密，注重神秘感和厚重感。",
    tags: ["长生", "家族", "底蕴", "揭秘"],
    workMinutes: 25,
    breakMinutes: 5,
    isBuiltin: true,
    createdAt: 0,
    updatedAt: 0
  },
  {
    id: "dushi_shouye",
    name: "都市高武·守夜人流",
    category: "都市流",
    description: "高武世界守夜人",
    icon: "🌙",
    systemPrompt: "你是一个都市高武流小说写作助手。帮助用户创作以'守夜人'为核心的都市小说。重点描写主角在高武世界中守护人类、对抗异族的场景，注重热血和使命感。",
    tags: ["高武", "守夜人", "热血", "异能"],
    workMinutes: 25,
    breakMinutes: 5,
    isBuiltin: true,
    createdAt: 0,
    updatedAt: 0
  },
  {
    id: "zhiye_xt",
    name: "职业系统·超能力流",
    category: "都市流",
    description: "职业系统觉醒超能力",
    icon: "🎮",
    systemPrompt: "你是一个职业系统流小说写作助手。帮助用户创作以'职业系统'为核心的都市小说。重点描写主角觉醒独特职业、获得超能力逆袭的过程，注重系统设定和成长感。",
    tags: ["职业", "系统", "超能力", "逆袭"],
    workMinutes: 25,
    breakMinutes: 5,
    isBuiltin: true,
    createdAt: 0,
    updatedAt: 0
  },
  {
    id: "moyu_bailan",
    name: "摸鱼摆烂·变强流",
    category: "都市流",
    description: "摸鱼摆烂却变强",
    icon: "🐟",
    systemPrompt: "你是一个摸鱼摆烂流小说写作助手。帮助用户创作以'摸鱼变强'为核心的都市小说。重点描写主角看似摆烂实则变强的反差，注重幽默和爽感。",
    tags: ["摸鱼", "摆烂", "系统", "打工人"],
    workMinutes: 25,
    breakMinutes: 5,
    isBuiltin: true,
    createdAt: 0,
    updatedAt: 0
  },
  {
    id: "zhibo_nixi",
    name: "直播短视频·逆袭流",
    category: "都市流",
    description: "直播短视频逆袭成网红",
    icon: "📱",
    systemPrompt: "你是一个直播逆袭流小说写作助手。帮助用户创作以'直播短视频'为核心的都市小说。重点描写主角通过直播/短视频逆袭成为网红的过程，注重时代感和爽感。",
    tags: ["直播", "短视频", "网红", "逆袭"],
    workMinutes: 25,
    breakMinutes: 5,
    isBuiltin: true,
    createdAt: 0,
    updatedAt: 0
  },

  // ==================== 玄幻流 (6个) ====================
  {
    id: "fantasy_qiandao",
    name: "玄幻签到·开局无敌",
    category: "玄幻流",
    description: "签到系统开局就无敌",
    icon: "📝",
    systemPrompt: "你是一个玄幻签到流小说写作助手。帮助用户创作以'签到系统'为核心的玄幻小说。重点描写主角通过签到获得各种奖励、碾压对手的过程，注重爽感和系统设定。",
    tags: ["签到", "系统", "碾压", "无敌"],
    workMinutes: 25,
    breakMinutes: 5,
    isBuiltin: true,
    createdAt: 0,
    updatedAt: 0
  },
  {
    id: "fantasy_renwu",
    name: "玄幻系统·任务狂魔",
    category: "玄幻流",
    description: "系统任务骚操作",
    icon: "🎯",
    systemPrompt: "你是一个玄幻系统流小说写作助手。帮助用户创作以'系统任务'为核心的玄幻小说。重点描写主角完成各种奇葩任务、获得奖励的过程，注重任务设计的趣味性。",
    tags: ["系统", "任务", "骚操作", "有趣"],
    workMinutes: 25,
    breakMinutes: 5,
    isBuiltin: true,
    createdAt: 0,
    updatedAt: 0
  },
  {
    id: "fantasy_wudi",
    name: "玄幻无敌·横推诸天",
    category: "玄幻流",
    description: "无敌横推诸天万界",
    icon: "💥",
    systemPrompt: "你是一个玄幻无敌流小说写作助手。帮助用户创作以'无敌横推'为核心的玄幻小说。重点描写主角实力碾压、横推一切的爽感，注重战斗场面和爽点设计。",
    tags: ["无敌", "碾压", "横推", "爽"],
    workMinutes: 25,
    breakMinutes: 5,
    isBuiltin: true,
    createdAt: 0,
    updatedAt: 0
  },
  {
    id: "xiuxian_zc",
    name: "修仙职场·KPI考核流",
    category: "玄幻流",
    description: "修仙界的职场KPI",
    icon: "📊",
    systemPrompt: "你是一个修仙职场流小说写作助手。帮助用户创作以'修仙KPI'为核心的玄幻小说。重点描写修仙界的职场化管理、KPI考核的荒诞感，注重幽默和讽刺。",
    tags: ["修仙", "职场", "KPI", "摸鱼"],
    workMinutes: 25,
    breakMinutes: 5,
    isBuiltin: true,
    createdAt: 0,
    updatedAt: 0
  },
  {
    id: "tianming_fanpai",
    name: "天命反派·背景编辑流",
    category: "玄幻流",
    description: "成为反派编辑背景",
    icon: "🎭",
    systemPrompt: "你是一个天命反派流小说写作助手。帮助用户创作以'反派编辑'为核心的玄幻小说。重点描写主角成为反派后通过编辑背景、逆转命运的过程，注重反套路和爽感。",
    tags: ["反派", "背景编辑", "天命之子"],
    workMinutes: 25,
    breakMinutes: 5,
    isBuiltin: true,
    createdAt: 0,
    updatedAt: 0
  },
  {
    id: "honghuang_bianji",
    name: "洪荒神话·编辑流",
    category: "玄幻流",
    description: "洪荒世界的编辑",
    icon: "🐉",
    systemPrompt: "你是一个洪荒编辑流小说写作助手。帮助用户创作以'洪荒编辑'为核心的玄幻小说。重点描写主角在洪荒世界中编辑规则、改写命运的过程，注重神话设定和脑洞。",
    tags: ["洪荒", "神话", "编辑", "脑洞"],
    workMinutes: 25,
    breakMinutes: 5,
    isBuiltin: true,
    createdAt: 0,
    updatedAt: 0
  },

  // ==================== 穿越流 (3个) ====================
  {
    id: "chuanyue_zhongtian",
    name: "穿越种田·发家致富",
    category: "穿越流",
    description: "穿越古代种田致富",
    icon: "🌾",
    systemPrompt: "你是一个穿越种田流小说写作助手。帮助用户创作以'种田致富'为核心的穿越小说。重点描写主角利用现代知识在古代发展农业、发家致富的过程，注重温馨和日常感。",
    tags: ["种田", "温馨", "现代知识", "日常"],
    workMinutes: 25,
    breakMinutes: 5,
    isBuiltin: true,
    createdAt: 0,
    updatedAt: 0
  },
  {
    id: "chuanyue_niandai",
    name: "穿越年代·改革开放",
    category: "穿越流",
    description: "穿越年代抓住商机",
    icon: "🏭",
    systemPrompt: "你是一个穿越年代流小说写作助手。帮助用户创作以'改革开放'为核心的穿越小说。重点描写主角穿越到改革开放年代、抓住商机致富的过程，注重时代感和商机把握。",
    tags: ["年代", "改革开放", "商机", "赚钱"],
    workMinutes: 25,
    breakMinutes: 5,
    isBuiltin: true,
    createdAt: 0,
    updatedAt: 0
  },
  {
    id: "niandai_qinqing",
    name: "年代重生·整顿亲情流",
    category: "穿越流",
    description: "年代重生整顿极品亲戚",
    icon: "👨‍👩‍👧‍👦",
    systemPrompt: "你是一个年代重生流小说写作助手。帮助用户创作以'整顿亲情'为核心的穿越小说。重点描写主角重生后整顿极品亲戚、改变命运的过程，注重爽感和亲情主题。",
    tags: ["年代", "重生", "整顿亲情", "极品亲戚"],
    workMinutes: 25,
    breakMinutes: 5,
    isBuiltin: true,
    createdAt: 0,
    updatedAt: 0
  },

  // ==================== 悬疑流 (4个) ====================
  {
    id: "xuanyi_lingyi",
    name: "悬疑灵异·捉鬼天师",
    category: "悬疑流",
    description: "捉鬼天师破灵异案件",
    icon: "👻",
    systemPrompt: "你是一个悬疑灵异流小说写作助手。帮助用户创作以'捉鬼天师'为核心的悬疑小说。重点描写主角捉鬼驱邪、破解灵异案件的过程，注重恐怖氛围和悬疑感。",
    tags: ["灵异", "悬疑", "恐怖", "揭秘"],
    workMinutes: 25,
    breakMinutes: 5,
    isBuiltin: true,
    createdAt: 0,
    updatedAt: 0
  },
  {
    id: "xuanyi_daomu",
    name: "盗墓探险·寻龙点穴",
    category: "悬疑流",
    description: "盗墓探险寻龙点穴",
    icon: "🗺️",
    systemPrompt: "你是一个盗墓探险流小说写作助手。帮助用户创作以'盗墓探险'为核心的悬疑小说。重点描写主角寻龙点穴、深入古墓探险的过程，注重机关设计和悬疑氛围。",
    tags: ["盗墓", "探险", "风水", "宝物"],
    workMinutes: 25,
    breakMinutes: 5,
    isBuiltin: true,
    createdAt: 0,
    updatedAt: 0
  },
  {
    id: "guize_guaitan",
    name: "规则怪谈·发疯破局流",
    category: "悬疑流",
    description: "规则怪谈发疯破局",
    icon: "📜",
    systemPrompt: "你是一个规则怪谈流小说写作助手。帮助用户创作以'规则怪谈'为核心的悬疑小说。重点描写主角在诡异规则中用发疯方式破局的过程，注重规则设计和反转。",
    tags: ["规则怪谈", "无限流", "发疯", "单元剧"],
    workMinutes: 25,
    breakMinutes: 5,
    isBuiltin: true,
    createdAt: 0,
    updatedAt: 0
  },
  {
    id: "nvxing_xingzhen",
    name: "女性悬疑·刑侦流",
    category: "悬疑流",
    description: "女性视角刑侦破案",
    icon: "🔍",
    systemPrompt: "你是一个女性悬疑流小说写作助手。帮助用户创作以'女性刑侦'为核心的悬疑小说。重点描写女主角侦破案件的过程，注重心理描写和女性视角。",
    tags: ["女性", "悬疑", "刑侦", "破案", "心理"],
    workMinutes: 25,
    breakMinutes: 5,
    isBuiltin: true,
    createdAt: 0,
    updatedAt: 0
  },

  // ==================== 女频流 (2个) ====================
  {
    id: "female_gaojian",
    name: "无CP大女主·搞钱流",
    category: "女频流",
    description: "大女主无CP搞钱复仇",
    icon: "👸",
    systemPrompt: "你是一个大女主流小说写作助手。帮助用户创作以'无CP大女主'为核心的女频小说。重点描写女主角独立自强、搞钱复仇的过程，注重女主成长和爽感。",
    tags: ["大女主", "无CP", "搞钱", "复仇"],
    workMinutes: 25,
    breakMinutes: 5,
    isBuiltin: true,
    createdAt: 0,
    updatedAt: 0
  },
  {
    id: "edu_nvpei",
    name: "恶毒女配·全家反派洗白流",
    category: "女频流",
    description: "恶毒女配全家洗白",
    icon: "😈",
    systemPrompt: "你是一个恶毒女配流小说写作助手。帮助用户创作以'恶毒女配'为核心的女频小说。重点描写恶毒女配洗白、全家反派逆袭的过程，注重反套路和爽感。",
    tags: ["恶毒女配", "洗白", "全家反派", "打脸"],
    workMinutes: 25,
    breakMinutes: 5,
    isBuiltin: true,
    createdAt: 0,
    updatedAt: 0
  }
];

/**
 * Skill 管理器
 * 管理25个番茄网文风格Skill
 */
export class SkillManager {
  private skills: Map<string, SkillConfig> = new Map();
  private activeSkillId: string | null = null;

  constructor() {
    // 初始化所有 Skill
    TOMATO_SKILLS.forEach(skill => {
      this.skills.set(skill.id, skill);
    });
  }

  /**
   * 获取所有可用 Skill 列表
   */
  getAllSkills(): SkillConfig[] {
    return Array.from(this.skills.values());
  }

  /**
   * 按分类获取 Skill 列表
   * @param category 分类名称
   */
  getSkillsByCategory(category: string): SkillConfig[] {
    return Array.from(this.skills.values()).filter(s => s.category === category);
  }

  /**
   * 获取所有分类
   */
  getCategories(): string[] {
    const categories = new Set<string>();
    this.skills.forEach(s => categories.add(s.category));
    return Array.from(categories);
  }

  /**
   * 根据 ID 获取 Skill 配置
   * @param skillId Skill ID
   */
  getSkill(skillId: string): SkillConfig | undefined {
    return this.skills.get(skillId);
  }

  /**
   * 搜索 Skill（按名称、描述、标签）
   * @param query 搜索关键词
   */
  searchSkills(query: string): SkillConfig[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.skills.values()).filter(skill => {
      return (
        skill.name.toLowerCase().includes(lowerQuery) ||
        skill.description.toLowerCase().includes(lowerQuery) ||
        skill.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    });
  }

  /**
   * 应用 Skill - 返回系统提示词
   * @param skillId Skill ID
   * @param context 应用上下文
   * @returns 构建好的系统提示词和 Skill 配置
   */
  applySkill(skillId: string, context: SkillContext): { systemPrompt: string; skill: SkillConfig } | null {
    const skill = this.skills.get(skillId);
    if (!skill) {
      return null;
    }

    this.activeSkillId = skillId;

    // 构建增强的系统提示词
    let enhancedPrompt = skill.systemPrompt;

    if (context.workTitle) {
      enhancedPrompt += `\n\n当前作品：${context.workTitle}`;
    }
    if (context.chapterTitle) {
      enhancedPrompt += `\n当前章节：${context.chapterTitle}`;
    }
    if (context.content) {
      enhancedPrompt += `\n\n用户输入内容：\n${context.content}`;
    }

    return { systemPrompt: enhancedPrompt, skill };
  }

  /**
   * 获取当前激活的 Skill
   */
  getActiveSkill(): SkillConfig | null {
    if (!this.activeSkillId) return null;
    return this.skills.get(this.activeSkillId) || null;
  }

  /**
   * 清除激活的 Skill
   */
  clearActiveSkill(): void {
    this.activeSkillId = null;
  }

  /**
   * 从后端同步 Skill 列表
   * 通过 NativeBridge 获取数据库中的番茄预设（对应 TomatoPresetSeeder.kt 的25个预设）
   */
  async syncFromBackend(): Promise<void> {
    try {
      const presetsJson = await Tools.callNative("getTomatoPresets", []);
      const presets = JSON.parse(presetsJson);

      if (Array.isArray(presets)) {
        presets.forEach((preset: any) => {
          const existingSkill = this.skills.get(preset.id);
          if (existingSkill) {
            // 更新所有字段（对应 TomatoPresetSeeder 的完整字段）
            existingSkill.name = preset.name || existingSkill.name;
            existingSkill.category = preset.category || existingSkill.category;
            existingSkill.description = preset.description || existingSkill.description;
            existingSkill.icon = preset.icon || existingSkill.icon;
            existingSkill.systemPrompt = preset.systemPrompt || existingSkill.systemPrompt;
            existingSkill.workMinutes = preset.workMinutes ?? existingSkill.workMinutes;
            existingSkill.breakMinutes = preset.breakMinutes ?? existingSkill.breakMinutes;
            existingSkill.isBuiltin = preset.isBuiltin ?? existingSkill.isBuiltin;
            existingSkill.updatedAt = Date.now();
            // 更新标签
            if (preset.tags) {
              existingSkill.tags = typeof preset.tags === 'string' 
                ? preset.tags.split(",").map((t: string) => t.trim())
                : preset.tags;
            }
          } else {
            // 添加新 Skill（完整字段映射）
            this.skills.set(preset.id, {
              id: preset.id,
              name: preset.name,
              category: preset.category,
              description: preset.description || "",
              icon: preset.icon || "📝",
              systemPrompt: preset.systemPrompt || "",
              tags: preset.tags 
                ? (typeof preset.tags === 'string' ? preset.tags.split(",").map((t: string) => t.trim()) : preset.tags)
                : [],
              workMinutes: preset.workMinutes ?? 25,
              breakMinutes: preset.breakMinutes ?? 5,
              isBuiltin: preset.isBuiltin ?? true,
              createdAt: preset.createdAt ?? Date.now(),
              updatedAt: preset.updatedAt ?? Date.now()
            });
          }
        });
        console.log(`[NovelIDE] [INFO] 从后端同步了 ${presets.length} 个番茄预设 Skill`);
      }
    } catch (error) {
      console.error("[NovelIDE] [ERROR] 从后端同步 Skill 失败:", error);
    }
  }

  /**
   * 获取 Skill 的番茄钟配置
   * @param skillId Skill ID
   * @returns 番茄钟配置（工作/休息时长）
   */
  getPomodoroConfig(skillId: string): { workMinutes: number; breakMinutes: number } | null {
    const skill = this.skills.get(skillId);
    if (!skill) return null;
    return {
      workMinutes: skill.workMinutes,
      breakMinutes: skill.breakMinutes
    };
  }
}

// 全局 Skill 管理器实例
let globalSkillManager: SkillManager | null = null;

/**
 * 获取全局 Skill 管理器
 */
export function getSkillManager(): SkillManager {
  if (!globalSkillManager) {
    globalSkillManager = new SkillManager();
  }
  return globalSkillManager;
}
