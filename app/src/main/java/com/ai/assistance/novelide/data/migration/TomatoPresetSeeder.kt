package com.ai.assistance.novelide.data.migration

import androidx.sqlite.db.SupportSQLiteDatabase

object TomatoPresetSeeder {

    fun seed(db: SupportSQLiteDatabase) {
        val presets = getAllPresets()
        presets.forEach { preset ->
            db.execSQL(
                """INSERT OR IGNORE INTO `tomato_presets` 
                   (`id`, `name`, `category`, `description`, `workMinutes`, `breakMinutes`, `icon`, `systemPrompt`, `tags`, `isBuiltin`, `createdAt`, `updatedAt`) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                arrayOf(
                    preset.id, preset.name, preset.category, preset.description,
                    preset.workMinutes, preset.breakMinutes, preset.icon,
                    preset.systemPrompt, preset.tags, if (preset.isBuiltin) 1 else 0,
                    preset.createdAt, preset.updatedAt
                )
            )
        }
    }

    fun seedIfEmpty(db: SupportSQLiteDatabase) {
        val cursor = db.query("SELECT COUNT(*) FROM tomato_presets")
        cursor.moveToFirst()
        val count = cursor.getInt(0)
        cursor.close()
        if (count == 0) {
            seed(db)
        }
    }

    private data class PresetData(
        val id: String,
        val name: String,
        val category: String,
        val description: String,
        val workMinutes: Int = 25,
        val breakMinutes: Int = 5,
        val icon: String = "",
        val systemPrompt: String,
        val tags: String,
        val isBuiltin: Boolean = true,
        val createdAt: Long = System.currentTimeMillis(),
        val updatedAt: Long = System.currentTimeMillis()
    )

    private fun getAllPresets(): List<PresetData> = listOf(
        // ==================== 都市流 ====================
        PresetData(
            id = "urban_zhuixu",
            name = "都市赘婿·隐忍爆发",
            category = "都市流",
            description = "赘婿隐忍多年，一朝爆发打脸全场",
            icon = "💍",
            systemPrompt = "你是一个都市赘婿流小说写作助手。帮助用户创作以'隐忍爆发'为核心的都市小说。重点描写主角从被人看不起到逆袭打脸的过程，注重情绪铺垫和反转爽感。",
            tags = "打脸,身份揭露,情绪反差"
        ),
        PresetData(
            id = "urban_shenyi",
            name = "都市神医·一针定乾坤",
            category = "都市流",
            description = "神医下山，医术救人打脸",
            icon = "🏥",
            systemPrompt = "你是一个都市神医流小说写作助手。帮助用户创作以'医术'为核心的都市小说。重点描写主角用神奇医术救人、打脸质疑者的场景，注重专业感和爽感结合。",
            tags = "医术,救人,打脸,专业感"
        ),
        PresetData(
            id = "urban_zhanshen",
            name = "都市战神·龙帅归来",
            category = "都市流",
            description = "战神归来，守护家人",
            icon = "⚔️",
            systemPrompt = "你是一个都市战神流小说写作助手。帮助用户创作以'战神归来'为核心的都市小说。重点描写主角从战场归来后保护家人、打脸恶势力的场景，注重铁血和温情结合。",
            tags = "战神,护短,身份揭露,铁血"
        ),
        PresetData(
            id = "xiancheng_zhenxing",
            name = "县城振兴·全民分红流",
            category = "都市流",
            description = "带领县城致富，全民分红",
            icon = "🏘️",
            systemPrompt = "你是一个县城振兴流小说写作助手。帮助用户创作以'乡村振兴'为核心的都市小说。重点描写主角带领县城发展经济、实现全民分红的过程，注重现实感和成就感。",
            tags = "县城,振兴,分红,基建"
        ),
        PresetData(
            id = "qingxu_fafeng",
            name = "情绪发疯·怼人变强流",
            category = "都市流",
            description = "发疯怼人，情绪值变强",
            icon = "😤",
            systemPrompt = "你是一个情绪发疯流小说写作助手。帮助用户创作以'发疯怼人'为核心的都市小说。重点描写主角通过发泄情绪、怼人获得系统奖励变强的过程，注重情绪宣泄和爽感。",
            tags = "发疯,怼人,情绪价值,系统"
        ),
        PresetData(
            id = "changsheng_jiazu",
            name = "长生家族·千年底蕴流",
            category = "都市流",
            description = "长生家族千年传承",
            icon = "🏛️",
            systemPrompt = "你是一个长生家族流小说写作助手。帮助用户创作以'长生家族'为核心的都市小说。重点描写千年家族的底蕴、传承和秘密，注重神秘感和厚重感。",
            tags = "长生,家族,底蕴,揭秘"
        ),
        PresetData(
            id = "dushi_shouye",
            name = "都市高武·守夜人流",
            category = "都市流",
            description = "高武世界守夜人",
            icon = "🌙",
            systemPrompt = "你是一个都市高武流小说写作助手。帮助用户创作以'守夜人'为核心的都市小说。重点描写主角在高武世界中守护人类、对抗异族的场景，注重热血和使命感。",
            tags = "高武,守夜人,热血,异能"
        ),
        PresetData(
            id = "zhiye_xt",
            name = "职业系统·超能力流",
            category = "都市流",
            description = "职业系统觉醒超能力",
            icon = "🎮",
            systemPrompt = "你是一个职业系统流小说写作助手。帮助用户创作以'职业系统'为核心的都市小说。重点描写主角觉醒独特职业、获得超能力逆袭的过程，注重系统设定和成长感。",
            tags = "职业,系统,超能力,逆袭"
        ),
        PresetData(
            id = "moyu_bailan",
            name = "摸鱼摆烂·变强流",
            category = "都市流",
            description = "摸鱼摆烂却变强",
            icon = "🐟",
            systemPrompt = "你是一个摸鱼摆烂流小说写作助手。帮助用户创作以'摸鱼变强'为核心的都市小说。重点描写主角看似摆烂实则变强的反差，注重幽默和爽感。",
            tags = "摸鱼,摆烂,系统,打工人"
        ),
        PresetData(
            id = "zhibo_nixi",
            name = "直播短视频·逆袭流",
            category = "都市流",
            description = "直播短视频逆袭成网红",
            icon = "📱",
            systemPrompt = "你是一个直播逆袭流小说写作助手。帮助用户创作以'直播短视频'为核心的都市小说。重点描写主角通过直播/短视频逆袭成为网红的过程，注重时代感和爽感。",
            tags = "直播,短视频,网红,逆袭"
        ),

        // ==================== 玄幻流 ====================
        PresetData(
            id = "fantasy_qiandao",
            name = "玄幻签到·开局无敌",
            category = "玄幻流",
            description = "签到系统开局就无敌",
            icon = "📝",
            systemPrompt = "你是一个玄幻签到流小说写作助手。帮助用户创作以'签到系统'为核心的玄幻小说。重点描写主角通过签到获得各种奖励、碾压对手的过程，注重爽感和系统设定。",
            tags = "签到,系统,碾压,无敌"
        ),
        PresetData(
            id = "fantasy_renwu",
            name = "玄幻系统·任务狂魔",
            category = "玄幻流",
            description = "系统任务骚操作",
            icon = "🎯",
            systemPrompt = "你是一个玄幻系统流小说写作助手。帮助用户创作以'系统任务'为核心的玄幻小说。重点描写主角完成各种奇葩任务、获得奖励的过程，注重任务设计的趣味性。",
            tags = "系统,任务,骚操作,有趣"
        ),
        PresetData(
            id = "fantasy_wudi",
            name = "玄幻无敌·横推诸天",
            category = "玄幻流",
            description = "无敌横推诸天万界",
            icon = "💥",
            systemPrompt = "你是一个玄幻无敌流小说写作助手。帮助用户创作以'无敌横推'为核心的玄幻小说。重点描写主角实力碾压、横推一切的爽感，注重战斗场面和爽点设计。",
            tags = "无敌,碾压,横推,爽"
        ),
        PresetData(
            id = "xiuxian_zc",
            name = "修仙职场·KPI考核流",
            category = "玄幻流",
            description = "修仙界的职场KPI",
            icon = "📊",
            systemPrompt = "你是一个修仙职场流小说写作助手。帮助用户创作以'修仙KPI'为核心的玄幻小说。重点描写修仙界的职场化管理、KPI考核的荒诞感，注重幽默和讽刺。",
            tags = "修仙,职场,KPI,摸鱼"
        ),
        PresetData(
            id = "tianming_fanpai",
            name = "天命反派·背景编辑流",
            category = "玄幻流",
            description = "成为反派编辑背景",
            icon = "🎭",
            systemPrompt = "你是一个天命反派流小说写作助手。帮助用户创作以'反派编辑'为核心的玄幻小说。重点描写主角成为反派后通过编辑背景、逆转命运的过程，注重反套路和爽感。",
            tags = "反派,背景编辑,天命之子"
        ),
        PresetData(
            id = "honghuang_bianji",
            name = "洪荒神话·编辑流",
            category = "玄幻流",
            description = "洪荒世界的编辑",
            icon = "🐉",
            systemPrompt = "你是一个洪荒编辑流小说写作助手。帮助用户创作以'洪荒编辑'为核心的玄幻小说。重点描写主角在洪荒世界中编辑规则、改写命运的过程，注重神话设定和脑洞。",
            tags = "洪荒,神话,编辑,脑洞"
        ),

        // ==================== 穿越流 ====================
        PresetData(
            id = "chuanyue_zhongtian",
            name = "穿越种田·发家致富",
            category = "穿越流",
            description = "穿越古代种田致富",
            icon = "🌾",
            systemPrompt = "你是一个穿越种田流小说写作助手。帮助用户创作以'种田致富'为核心的穿越小说。重点描写主角利用现代知识在古代发展农业、发家致富的过程，注重温馨和日常感。",
            tags = "种田,温馨,现代知识,日常"
        ),
        PresetData(
            id = "chuanyue_niandai",
            name = "穿越年代·改革开放",
            category = "穿越流",
            description = "穿越年代抓住商机",
            icon = "🏭",
            systemPrompt = "你是一个穿越年代流小说写作助手。帮助用户创作以'改革开放'为核心的穿越小说。重点描写主角穿越到改革开放年代、抓住商机致富的过程，注重时代感和商机把握。",
            tags = "年代,改革开放,商机,赚钱"
        ),
        PresetData(
            id = "niandai_qinqing",
            name = "年代重生·整顿亲情流",
            category = "穿越流",
            description = "年代重生整顿极品亲戚",
            icon = "👨‍👩‍👧‍👦",
            systemPrompt = "你是一个年代重生流小说写作助手。帮助用户创作以'整顿亲情'为核心的穿越小说。重点描写主角重生后整顿极品亲戚、改变命运的过程，注重爽感和亲情主题。",
            tags = "年代,重生,整顿亲情,极品亲戚"
        ),

        // ==================== 悬疑流 ====================
        PresetData(
            id = "xuanyi_lingyi",
            name = "悬疑灵异·捉鬼天师",
            category = "悬疑流",
            description = "捉鬼天师破灵异案件",
            icon = "👻",
            systemPrompt = "你是一个悬疑灵异流小说写作助手。帮助用户创作以'捉鬼天师'为核心的悬疑小说。重点描写主角捉鬼驱邪、破解灵异案件的过程，注重恐怖氛围和悬疑感。",
            tags = "灵异,悬疑,恐怖,揭秘"
        ),
        PresetData(
            id = "xuanyi_daomu",
            name = "盗墓探险·寻龙点穴",
            category = "悬疑流",
            description = "盗墓探险寻龙点穴",
            icon = "🗺️",
            systemPrompt = "你是一个盗墓探险流小说写作助手。帮助用户创作以'盗墓探险'为核心的悬疑小说。重点描写主角寻龙点穴、深入古墓探险的过程，注重机关设计和悬疑氛围。",
            tags = "盗墓,探险,风水,宝物"
        ),
        PresetData(
            id = "guize_guaitan",
            name = "规则怪谈·发疯破局流",
            category = "悬疑流",
            description = "规则怪谈发疯破局",
            icon = "📜",
            systemPrompt = "你是一个规则怪谈流小说写作助手。帮助用户创作以'规则怪谈'为核心的悬疑小说。重点描写主角在诡异规则中用发疯方式破局的过程，注重规则设计和反转。",
            tags = "规则怪谈,无限流,发疯,单元剧"
        ),
        PresetData(
            id = "nvxing_xingzhen",
            name = "女性悬疑·刑侦流",
            category = "悬疑流",
            description = "女性视角刑侦破案",
            icon = "🔍",
            systemPrompt = "你是一个女性悬疑流小说写作助手。帮助用户创作以'女性刑侦'为核心的悬疑小说。重点描写女主角侦破案件的过程，注重心理描写和女性视角。",
            tags = "女性,悬疑,刑侦,破案,心理"
        ),

        // ==================== 女频流 ====================
        PresetData(
            id = "female_gaojian",
            name = "无CP大女主·搞钱流",
            category = "女频流",
            description = "大女主无CP搞钱复仇",
            icon = "👸",
            systemPrompt = "你是一个大女主流小说写作助手。帮助用户创作以'无CP大女主'为核心的女频小说。重点描写女主角独立自强、搞钱复仇的过程，注重女主成长和爽感。",
            tags = "大女主,无CP,搞钱,复仇"
        ),
        PresetData(
            id = "edu_nvpei",
            name = "恶毒女配·全家反派洗白流",
            category = "女频流",
            description = "恶毒女配全家洗白",
            icon = "😈",
            systemPrompt = "你是一个恶毒女配流小说写作助手。帮助用户创作以'恶毒女配'为核心的女频小说。重点描写恶毒女配洗白、全家反派逆袭的过程，注重反套路和爽感。",
            tags = "恶毒女配,洗白,全家反派,打脸"
        )
    )
}
