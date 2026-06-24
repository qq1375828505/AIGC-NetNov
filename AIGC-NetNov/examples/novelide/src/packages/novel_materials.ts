// 小说资料管理工具

import { Logger, safeNativeCall, safeNativeJsonCall, safeNativeBoolCall, requireString, clearJsonCache } from "./novel_utils";

export function registerTools() {
  // ==================== 角色管理 ====================

  Tools.register("novelide:create_character", {
    description: "创建角色",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "作品ID" },
        name: { type: "string", description: "角色姓名" },
        gender: { type: "string", description: "性别" },
        age: { type: "string", description: "年龄" },
        appearance: { type: "string", description: "外貌描述" },
        personality: { type: "string", description: "性格特征" },
        background: { type: "string", description: "背景故事" },
        notes: { type: "string", description: "备注" }
      },
      required: ["workId", "name"]
    },
    execute: async (params: any) => {
      const workId = requireString(params.workId, "workId");
      const name = requireString(params.name, "name");
      const { gender, age, personality, background, notes } = params;
      try {
        const role = [gender, age, personality, background].filter(Boolean).join(" | ") || notes || "";
        const result = await safeNativeCall<string>("createCharacter", [workId, name, role]);
        Logger.info(`创建角色成功: ${name} (${result})`);
        return { success: true, characterId: result };
      } catch (error) {
        Logger.error("创建角色失败", error);
        return { success: false, error: (error as Error).message || "创建角色失败" };
      }
    }
  });

  Tools.register("novelide:update_character", {
    description: "更新角色信息",
    parameters: {
      type: "object",
      properties: {
        characterId: { type: "string", description: "角色ID" },
        name: { type: "string", description: "角色姓名" },
        gender: { type: "string", description: "性别" },
        age: { type: "string", description: "年龄" },
        appearance: { type: "string", description: "外貌描述" },
        personality: { type: "string", description: "性格特征" },
        background: { type: "string", description: "背景故事" },
        notes: { type: "string", description: "备注" }
      },
      required: ["characterId"]
    },
    execute: async (params: any) => {
      const characterId = requireString(params.characterId, "characterId");
      try {
        const result = await safeNativeBoolCall("updateCharacter", [JSON.stringify(params)]);
        Logger.info(`更新角色成功: ${characterId}`);
        return { success: true };
      } catch (error) {
        Logger.error("更新角色失败", error);
        return { success: false, error: (error as Error).message || "更新角色失败" };
      }
    }
  });

  Tools.register("novelide:delete_character", {
    description: "删除指定角色",
    parameters: {
      type: "object",
      properties: {
        characterId: { type: "string", description: "角色ID" }
      },
      required: ["characterId"]
    },
    execute: async (params: any) => {
      const characterId = requireString(params.characterId, "characterId");
      try {
        const result = await safeNativeBoolCall("deleteCharacter", [characterId]);
        Logger.info(`删除角色成功: ${characterId}`);
        return { success: true };
      } catch (error) {
        Logger.error("删除角色失败", error);
        return { success: false, error: (error as Error).message || "删除角色失败" };
      }
    }
  });

  Tools.register("novelide:list_characters", {
    description: "获取指定作品的所有角色列表",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "作品ID" }
      },
      required: ["workId"]
    },
    execute: async (params: any) => {
      const workId = requireString(params.workId, "workId");
      try {
        const characters = await safeNativeJsonCall<any[]>("getCharacters", [workId]);
        return { success: true, characters };
      } catch (error) {
        Logger.error("获取角色列表失败", error);
        return { success: false, error: (error as Error).message || "获取角色列表失败", characters: [] };
      }
    }
  });

  Tools.register("novelide:get_character", {
    description: "获取指定角色的详细信息",
    parameters: {
      type: "object",
      properties: {
        characterId: { type: "string", description: "角色ID" }
      },
      required: ["characterId"]
    },
    execute: async (params: any) => {
      const characterId = requireString(params.characterId, "characterId");
      try {
        const character = await safeNativeJsonCall<any>("getCharacterDetail", [characterId]);
        Logger.info(`获取角色详情成功: ${characterId}`);
        return { success: true, character };
      } catch (error) {
        Logger.error("获取角色详情失败", error);
        return { success: false, error: (error as Error).message || "获取角色详情失败" };
      }
    }
  });

  // ==================== 设定管理 ====================

  Tools.register("novelide:create_setting", {
    description: "创建世界观设定",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "作品ID" },
        name: { type: "string", description: "设定名称" },
        category: { type: "string", description: "设定分类（如：力量体系、社会制度、魔法体系）" },
        content: { type: "string", description: "设定内容" },
        notes: { type: "string", description: "备注" }
      },
      required: ["workId", "name", "content"]
    },
    execute: async (params: any) => {
      const workId = requireString(params.workId, "workId");
      const name = requireString(params.name, "name");
      const content = requireString(params.content, "content");
      try {
        const result = await safeNativeCall<string>("createSetting", [workId, name, content]);
        Logger.info(`创建设定成功: ${name} (${result})`);
        return { success: true, settingId: result };
      } catch (error) {
        Logger.error("创建设定失败", error);
        return { success: false, error: (error as Error).message || "创建设定失败" };
      }
    }
  });

  Tools.register("novelide:update_setting", {
    description: "更新世界观设定",
    parameters: {
      type: "object",
      properties: {
        settingId: { type: "string", description: "设定ID" },
        name: { type: "string", description: "设定名称" },
        category: { type: "string", description: "设定分类" },
        content: { type: "string", description: "设定内容" },
        notes: { type: "string", description: "备注" }
      },
      required: ["settingId"]
    },
    execute: async (params: any) => {
      const settingId = requireString(params.settingId, "settingId");
      try {
        const result = await safeNativeBoolCall("updateSetting", [JSON.stringify(params)]);
        Logger.info(`更新设定成功: ${settingId}`);
        return { success: true };
      } catch (error) {
        Logger.error("更新设定失败", error);
        return { success: false, error: (error as Error).message || "更新设定失败" };
      }
    }
  });

  Tools.register("novelide:delete_setting", {
    description: "删除指定设定",
    parameters: {
      type: "object",
      properties: {
        settingId: { type: "string", description: "设定ID" }
      },
      required: ["settingId"]
    },
    execute: async (params: any) => {
      const settingId = requireString(params.settingId, "settingId");
      try {
        const result = await safeNativeBoolCall("deleteSetting", [settingId]);
        Logger.info(`删除设定成功: ${settingId}`);
        return { success: true };
      } catch (error) {
        Logger.error("删除设定失败", error);
        return { success: false, error: (error as Error).message || "删除设定失败" };
      }
    }
  });

  Tools.register("novelide:list_settings", {
    description: "获取指定作品的所有设定列表",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "作品ID" }
      },
      required: ["workId"]
    },
    execute: async (params: any) => {
      const workId = requireString(params.workId, "workId");
      try {
        const settings = await safeNativeJsonCall<any[]>("getSettings", [workId]);
        return { success: true, settings };
      } catch (error) {
        Logger.error("获取设定列表失败", error);
        return { success: false, error: (error as Error).message || "获取设定列表失败", settings: [] };
      }
    }
  });

  Tools.register("novelide:get_setting", {
    description: "获取指定设定的详细信息",
    parameters: {
      type: "object",
      properties: {
        settingId: { type: "string", description: "设定ID" }
      },
      required: ["settingId"]
    },
    execute: async (params: any) => {
      const settingId = requireString(params.settingId, "settingId");
      try {
        const setting = await safeNativeJsonCall<any>("getSettingDetail", [settingId]);
        Logger.info(`获取设定详情成功: ${settingId}`);
        return { success: true, setting };
      } catch (error) {
        Logger.error("获取设定详情失败", error);
        return { success: false, error: (error as Error).message || "获取设定详情失败" };
      }
    }
  });

  // ==================== 地点管理 ====================

  Tools.register("novelide:create_location", {
    description: "创建地点",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "作品ID" },
        name: { type: "string", description: "地点名称" },
        type: { type: "string", description: "地点类型（如：城市、山脉、宫殿）" },
        description: { type: "string", description: "地点描述" },
        notes: { type: "string", description: "备注" }
      },
      required: ["workId", "name"]
    },
    execute: async (params: any) => {
      const workId = requireString(params.workId, "workId");
      const name = requireString(params.name, "name");
      const { description = "" } = params;
      try {
        const result = await safeNativeCall<string>("createLocation", [workId, name, description]);
        Logger.info(`创建地点成功: ${name} (${result})`);
        return { success: true, locationId: result };
      } catch (error) {
        Logger.error("创建地点失败", error);
        return { success: false, error: (error as Error).message || "创建地点失败" };
      }
    }
  });

  Tools.register("novelide:update_location", {
    description: "更新地点信息",
    parameters: {
      type: "object",
      properties: {
        locationId: { type: "string", description: "地点ID" },
        name: { type: "string", description: "地点名称" },
        type: { type: "string", description: "地点类型" },
        description: { type: "string", description: "地点描述" },
        notes: { type: "string", description: "备注" }
      },
      required: ["locationId"]
    },
    execute: async (params: any) => {
      const locationId = requireString(params.locationId, "locationId");
      try {
        const result = await safeNativeBoolCall("updateLocation", [JSON.stringify(params)]);
        Logger.info(`更新地点成功: ${locationId}`);
        return { success: true };
      } catch (error) {
        Logger.error("更新地点失败", error);
        return { success: false, error: (error as Error).message || "更新地点失败" };
      }
    }
  });

  Tools.register("novelide:delete_location", {
    description: "删除指定地点",
    parameters: {
      type: "object",
      properties: {
        locationId: { type: "string", description: "地点ID" }
      },
      required: ["locationId"]
    },
    execute: async (params: any) => {
      const locationId = requireString(params.locationId, "locationId");
      try {
        const result = await safeNativeBoolCall("deleteLocation", [locationId]);
        Logger.info(`删除地点成功: ${locationId}`);
        return { success: true };
      } catch (error) {
        Logger.error("删除地点失败", error);
        return { success: false, error: (error as Error).message || "删除地点失败" };
      }
    }
  });

  Tools.register("novelide:list_locations", {
    description: "获取指定作品的所有地点列表",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "作品ID" }
      },
      required: ["workId"]
    },
    execute: async (params: any) => {
      const workId = requireString(params.workId, "workId");
      try {
        const locations = await safeNativeJsonCall<any[]>("getLocations", [workId]);
        return { success: true, locations };
      } catch (error) {
        Logger.error("获取地点列表失败", error);
        return { success: false, error: (error as Error).message || "获取地点列表失败", locations: [] };
      }
    }
  });

  Tools.register("novelide:get_location", {
    description: "获取指定地点的详细信息",
    parameters: {
      type: "object",
      properties: {
        locationId: { type: "string", description: "地点ID" }
      },
      required: ["locationId"]
    },
    execute: async (params: any) => {
      const locationId = requireString(params.locationId, "locationId");
      try {
        const location = await safeNativeJsonCall<any>("getLocationDetail", [locationId]);
        Logger.info(`获取地点详情成功: ${locationId}`);
        return { success: true, location };
      } catch (error) {
        Logger.error("获取地点详情失败", error);
        return { success: false, error: (error as Error).message || "获取地点详情失败" };
      }
    }
  });

  // ==================== 势力管理 ====================

  Tools.register("novelide:create_faction", {
    description: "创建势力",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "作品ID" },
        name: { type: "string", description: "势力名称" },
        type: { type: "string", description: "势力类型（如：门派、国家、组织）" },
        description: { type: "string", description: "势力描述" },
        notes: { type: "string", description: "备注" }
      },
      required: ["workId", "name"]
    },
    execute: async (params: any) => {
      const workId = requireString(params.workId, "workId");
      const name = requireString(params.name, "name");
      const { description = "" } = params;
      try {
        const result = await safeNativeCall<string>("createFaction", [workId, name, description]);
        Logger.info(`创建势力成功: ${name} (${result})`);
        return { success: true, factionId: result };
      } catch (error) {
        Logger.error("创建势力失败", error);
        return { success: false, error: (error as Error).message || "创建势力失败" };
      }
    }
  });

  Tools.register("novelide:update_faction", {
    description: "更新势力信息",
    parameters: {
      type: "object",
      properties: {
        factionId: { type: "string", description: "势力ID" },
        name: { type: "string", description: "势力名称" },
        type: { type: "string", description: "势力类型" },
        description: { type: "string", description: "势力描述" },
        notes: { type: "string", description: "备注" }
      },
      required: ["factionId"]
    },
    execute: async (params: any) => {
      const factionId = requireString(params.factionId, "factionId");
      try {
        const result = await safeNativeBoolCall("updateFaction", [JSON.stringify(params)]);
        Logger.info(`更新势力成功: ${factionId}`);
        return { success: true };
      } catch (error) {
        Logger.error("更新势力失败", error);
        return { success: false, error: (error as Error).message || "更新势力失败" };
      }
    }
  });

  Tools.register("novelide:delete_faction", {
    description: "删除指定势力",
    parameters: {
      type: "object",
      properties: {
        factionId: { type: "string", description: "势力ID" }
      },
      required: ["factionId"]
    },
    execute: async (params: any) => {
      const factionId = requireString(params.factionId, "factionId");
      try {
        const result = await safeNativeBoolCall("deleteFaction", [factionId]);
        Logger.info(`删除势力成功: ${factionId}`);
        return { success: true };
      } catch (error) {
        Logger.error("删除势力失败", error);
        return { success: false, error: (error as Error).message || "删除势力失败" };
      }
    }
  });

  Tools.register("novelide:list_factions", {
    description: "获取指定作品的所有势力列表",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "作品ID" }
      },
      required: ["workId"]
    },
    execute: async (params: any) => {
      const workId = requireString(params.workId, "workId");
      try {
        const factions = await safeNativeJsonCall<any[]>("getFactions", [workId]);
        return { success: true, factions };
      } catch (error) {
        Logger.error("获取势力列表失败", error);
        return { success: false, error: (error as Error).message || "获取势力列表失败", factions: [] };
      }
    }
  });

  Tools.register("novelide:get_faction", {
    description: "获取指定势力的详细信息",
    parameters: {
      type: "object",
      properties: {
        factionId: { type: "string", description: "势力ID" }
      },
      required: ["factionId"]
    },
    execute: async (params: any) => {
      const factionId = requireString(params.factionId, "factionId");
      try {
        const faction = await safeNativeJsonCall<any>("getFactionDetail", [factionId]);
        Logger.info(`获取势力详情成功: ${factionId}`);
        return { success: true, faction };
      } catch (error) {
        Logger.error("获取势力详情失败", error);
        return { success: false, error: (error as Error).message || "获取势力详情失败" };
      }
    }
  });

  // ==================== 道具管理 ====================

  Tools.register("novelide:create_item", {
    description: "创建道具",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "作品ID" },
        name: { type: "string", description: "道具名称" },
        type: { type: "string", description: "道具类型（如：武器、法宝、药品）" },
        description: { type: "string", description: "道具描述" },
        notes: { type: "string", description: "备注" }
      },
      required: ["workId", "name"]
    },
    execute: async (params: any) => {
      const workId = requireString(params.workId, "workId");
      const name = requireString(params.name, "name");
      const { description = "" } = params;
      try {
        const result = await safeNativeCall<string>("createItem", [workId, name, description]);
        Logger.info(`创建道具成功: ${name} (${result})`);
        return { success: true, itemId: result };
      } catch (error) {
        Logger.error("创建道具失败", error);
        return { success: false, error: (error as Error).message || "创建道具失败" };
      }
    }
  });

  Tools.register("novelide:update_item", {
    description: "更新道具信息",
    parameters: {
      type: "object",
      properties: {
        itemId: { type: "string", description: "道具ID" },
        name: { type: "string", description: "道具名称" },
        type: { type: "string", description: "道具类型" },
        description: { type: "string", description: "道具描述" },
        notes: { type: "string", description: "备注" }
      },
      required: ["itemId"]
    },
    execute: async (params: any) => {
      const itemId = requireString(params.itemId, "itemId");
      try {
        const result = await safeNativeBoolCall("updateItem", [JSON.stringify(params)]);
        Logger.info(`更新道具成功: ${itemId}`);
        return { success: true };
      } catch (error) {
        Logger.error("更新道具失败", error);
        return { success: false, error: (error as Error).message || "更新道具失败" };
      }
    }
  });

  Tools.register("novelide:delete_item", {
    description: "删除指定道具",
    parameters: {
      type: "object",
      properties: {
        itemId: { type: "string", description: "道具ID" }
      },
      required: ["itemId"]
    },
    execute: async (params: any) => {
      const itemId = requireString(params.itemId, "itemId");
      try {
        const result = await safeNativeBoolCall("deleteItem", [itemId]);
        Logger.info(`删除道具成功: ${itemId}`);
        return { success: true };
      } catch (error) {
        Logger.error("删除道具失败", error);
        return { success: false, error: (error as Error).message || "删除道具失败" };
      }
    }
  });

  Tools.register("novelide:list_items", {
    description: "获取指定作品的所有道具列表",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "作品ID" }
      },
      required: ["workId"]
    },
    execute: async (params: any) => {
      const workId = requireString(params.workId, "workId");
      try {
        const items = await safeNativeJsonCall<any[]>("getItems", [workId]);
        return { success: true, items };
      } catch (error) {
        Logger.error("获取道具列表失败", error);
        return { success: false, error: (error as Error).message || "获取道具列表失败", items: [] };
      }
    }
  });

  Tools.register("novelide:get_item", {
    description: "获取指定道具的详细信息",
    parameters: {
      type: "object",
      properties: {
        itemId: { type: "string", description: "道具ID" }
      },
      required: ["itemId"]
    },
    execute: async (params: any) => {
      const itemId = requireString(params.itemId, "itemId");
      try {
        const item = await safeNativeJsonCall<any>("getItemDetail", [itemId]);
        Logger.info(`获取道具详情成功: ${itemId}`);
        return { success: true, item };
      } catch (error) {
        Logger.error("获取道具详情失败", error);
        return { success: false, error: (error as Error).message || "获取道具详情失败" };
      }
    }
  });

  // ==================== 伏笔管理 ====================

  Tools.register("novelide:create_hook", {
    description: "创建伏笔",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "作品ID" },
        title: { type: "string", description: "伏笔标题" },
        content: { type: "string", description: "伏笔内容" },
        plantChapter: { type: "string", description: "埋设章节" },
        resolveChapter: { type: "string", description: "回收章节" },
        status: { type: "string", description: "状态（如：已埋设、已回收、已废弃）" },
        notes: { type: "string", description: "备注" }
      },
      required: ["workId", "title", "content"]
    },
    execute: async (params: any) => {
      const workId = requireString(params.workId, "workId");
      const title = requireString(params.title, "title");
      const content = requireString(params.content, "content");
      try {
        const hookContent = title ? `${title}\n${content}` : content;
        const result = await safeNativeCall<string>("createPlotHook", [workId, hookContent]);
        Logger.info(`创建伏笔成功: ${title} (${result})`);
        return { success: true, hookId: result };
      } catch (error) {
        Logger.error("创建伏笔失败", error);
        return { success: false, error: (error as Error).message || "创建伏笔失败" };
      }
    }
  });

  Tools.register("novelide:update_hook", {
    description: "更新伏笔信息",
    parameters: {
      type: "object",
      properties: {
        hookId: { type: "string", description: "伏笔ID" },
        title: { type: "string", description: "伏笔标题" },
        content: { type: "string", description: "伏笔内容" },
        plantChapter: { type: "string", description: "埋设章节" },
        resolveChapter: { type: "string", description: "回收章节" },
        status: { type: "string", description: "状态" },
        notes: { type: "string", description: "备注" }
      },
      required: ["hookId"]
    },
    execute: async (params: any) => {
      const hookId = requireString(params.hookId, "hookId");
      try {
        const result = await safeNativeBoolCall("updatePlotHook", [JSON.stringify(params)]);
        Logger.info(`更新伏笔成功: ${hookId}`);
        return { success: true };
      } catch (error) {
        Logger.error("更新伏笔失败", error);
        return { success: false, error: (error as Error).message || "更新伏笔失败" };
      }
    }
  });

  Tools.register("novelide:delete_hook", {
    description: "删除指定伏笔",
    parameters: {
      type: "object",
      properties: {
        hookId: { type: "string", description: "伏笔ID" }
      },
      required: ["hookId"]
    },
    execute: async (params: any) => {
      const hookId = requireString(params.hookId, "hookId");
      try {
        const result = await safeNativeBoolCall("deletePlotHook", [hookId]);
        Logger.info(`删除伏笔成功: ${hookId}`);
        return { success: true };
      } catch (error) {
        Logger.error("删除伏笔失败", error);
        return { success: false, error: (error as Error).message || "删除伏笔失败" };
      }
    }
  });

  Tools.register("novelide:list_hooks", {
    description: "获取指定作品的所有伏笔列表",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "作品ID" }
      },
      required: ["workId"]
    },
    execute: async (params: any) => {
      const workId = requireString(params.workId, "workId");
      try {
        const hooks = await safeNativeJsonCall<any[]>("getPlotHooks", [workId]);
        return { success: true, hooks };
      } catch (error) {
        Logger.error("获取伏笔列表失败", error);
        return { success: false, error: (error as Error).message || "获取伏笔列表失败", hooks: [] };
      }
    }
  });

  Tools.register("novelide:get_hook", {
    description: "获取指定伏笔的详细信息",
    parameters: {
      type: "object",
      properties: {
        hookId: { type: "string", description: "伏笔ID" }
      },
      required: ["hookId"]
    },
    execute: async (params: any) => {
      const hookId = requireString(params.hookId, "hookId");
      try {
        const hook = await safeNativeJsonCall<any>("getHookDetail", [hookId]);
        Logger.info(`获取伏笔详情成功: ${hookId}`);
        return { success: true, hook };
      } catch (error) {
        Logger.error("获取伏笔详情失败", error);
        return { success: false, error: (error as Error).message || "获取伏笔详情失败" };
      }
    }
  });

  // ==================== 参考资料 ====================

  Tools.register("novelide:create_reference", {
    description: "创建参考资料",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "作品ID" },
        title: { type: "string", description: "资料标题" },
        type: { type: "string", description: "资料类型（如：图片、链接、文档、笔记）" },
        content: { type: "string", description: "资料内容" },
        url: { type: "string", description: "外部链接（可选）" },
        notes: { type: "string", description: "备注" }
      },
      required: ["workId", "title", "content"]
    },
    execute: async (params: any) => {
      const workId = requireString(params.workId, "workId");
      const title = requireString(params.title, "title");
      const content = requireString(params.content, "content");
      try {
        const result = await safeNativeCall<string>("createReference", [workId, title, content]);
        Logger.info(`创建参考资料成功: ${title} (${result})`);
        return { success: true, referenceId: result };
      } catch (error) {
        Logger.error("创建参考资料失败", error);
        return { success: false, error: (error as Error).message || "创建参考资料失败" };
      }
    }
  });

  Tools.register("novelide:update_reference", {
    description: "更新参考资料",
    parameters: {
      type: "object",
      properties: {
        referenceId: { type: "string", description: "资料ID" },
        title: { type: "string", description: "资料标题" },
        type: { type: "string", description: "资料类型" },
        content: { type: "string", description: "资料内容" },
        url: { type: "string", description: "外部链接" },
        notes: { type: "string", description: "备注" }
      },
      required: ["referenceId"]
    },
    execute: async (params: any) => {
      const referenceId = requireString(params.referenceId, "referenceId");
      try {
        const result = await safeNativeBoolCall("updateReference", [JSON.stringify(params)]);
        Logger.info(`更新参考资料成功: ${referenceId}`);
        return { success: true };
      } catch (error) {
        Logger.error("更新参考资料失败", error);
        return { success: false, error: (error as Error).message || "更新参考资料失败" };
      }
    }
  });

  Tools.register("novelide:delete_reference", {
    description: "删除指定参考资料",
    parameters: {
      type: "object",
      properties: {
        referenceId: { type: "string", description: "资料ID" }
      },
      required: ["referenceId"]
    },
    execute: async (params: any) => {
      const referenceId = requireString(params.referenceId, "referenceId");
      try {
        const result = await safeNativeBoolCall("deleteReference", [referenceId]);
        Logger.info(`删除参考资料成功: ${referenceId}`);
        return { success: true };
      } catch (error) {
        Logger.error("删除参考资料失败", error);
        return { success: false, error: (error as Error).message || "删除参考资料失败" };
      }
    }
  });

  Tools.register("novelide:list_references", {
    description: "获取指定作品的所有参考资料列表",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "作品ID" }
      },
      required: ["workId"]
    },
    execute: async (params: any) => {
      const workId = requireString(params.workId, "workId");
      try {
        const references = await safeNativeJsonCall<any[]>("getReferences", [workId]);
        return { success: true, references };
      } catch (error) {
        Logger.error("获取参考资料列表失败", error);
        return { success: false, error: (error as Error).message || "获取参考资料列表失败", references: [] };
      }
    }
  });

  Tools.register("novelide:get_reference", {
    description: "获取指定参考资料的详细信息",
    parameters: {
      type: "object",
      properties: {
        referenceId: { type: "string", description: "资料ID" }
      },
      required: ["referenceId"]
    },
    execute: async (params: any) => {
      const referenceId = requireString(params.referenceId, "referenceId");
      try {
        const reference = await safeNativeJsonCall<any>("getReferenceDetail", [referenceId]);
        Logger.info(`获取参考资料详情成功: ${referenceId}`);
        return { success: true, reference };
      } catch (error) {
        Logger.error("获取参考资料详情失败", error);
        return { success: false, error: (error as Error).message || "获取参考资料详情失败" };
      }
    }
  });

  // ==================== 写作待办 ====================

  Tools.register("novelide:create_todo", {
    description: "创建写作待办",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "作品ID" },
        title: { type: "string", description: "待办标题" },
        content: { type: "string", description: "待办内容" },
        priority: { type: "string", description: "优先级（如：高、中、低）" }
      },
      required: ["workId", "title"]
    },
    execute: async (params: any) => {
      const workId = requireString(params.workId, "workId");
      const title = requireString(params.title, "title");
      const { priority } = params;
      try {
        const priorityNum = priority === "high" || priority === "高" ? 2 : priority === "medium" || priority === "中" ? 1 : 0;
        const result = await safeNativeCall<string>("createTodo", [workId, title, priorityNum]);
        Logger.info(`创建待办成功: ${title} (${result})`);
        return { success: true, todoId: result };
      } catch (error) {
        Logger.error("创建待办失败", error);
        return { success: false, error: (error as Error).message || "创建待办失败" };
      }
    }
  });

  Tools.register("novelide:update_todo", {
    description: "更新写作待办",
    parameters: {
      type: "object",
      properties: {
        todoId: { type: "string", description: "待办ID" },
        title: { type: "string", description: "待办标题" },
        content: { type: "string", description: "待办内容" },
        priority: { type: "string", description: "优先级" },
        completed: { type: "boolean", description: "是否已完成" }
      },
      required: ["todoId"]
    },
    execute: async (params: any) => {
      const todoId = requireString(params.todoId, "todoId");
      try {
        const result = await safeNativeBoolCall("updateTodo", [JSON.stringify(params)]);
        Logger.info(`更新待办成功: ${todoId}`);
        return { success: true };
      } catch (error) {
        Logger.error("更新待办失败", error);
        return { success: false, error: (error as Error).message || "更新待办失败" };
      }
    }
  });

  Tools.register("novelide:delete_todo", {
    description: "删除指定写作待办",
    parameters: {
      type: "object",
      properties: {
        todoId: { type: "string", description: "待办ID" }
      },
      required: ["todoId"]
    },
    execute: async (params: any) => {
      const todoId = requireString(params.todoId, "todoId");
      try {
        const result = await safeNativeBoolCall("deleteTodo", [todoId]);
        Logger.info(`删除待办成功: ${todoId}`);
        return { success: true };
      } catch (error) {
        Logger.error("删除待办失败", error);
        return { success: false, error: (error as Error).message || "删除待办失败" };
      }
    }
  });

  Tools.register("novelide:list_todos", {
    description: "获取指定作品的所有写作待办列表",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "作品ID" }
      },
      required: ["workId"]
    },
    execute: async (params: any) => {
      const workId = requireString(params.workId, "workId");
      try {
        const todos = await safeNativeJsonCall<any[]>("getTodos", [workId]);
        return { success: true, todos };
      } catch (error) {
        Logger.error("获取待办列表失败", error);
        return { success: false, error: (error as Error).message || "获取待办列表失败", todos: [] };
      }
    }
  });
}
