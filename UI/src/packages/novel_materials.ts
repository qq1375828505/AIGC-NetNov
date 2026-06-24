// 小说资料管理工具

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
      const result = await Tools.callNative("createCharacter", [JSON.stringify(params)]);
      return { success: true, characterId: result };
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
      const result = await Tools.callNative("updateCharacter", [JSON.stringify(params)]);
      return { success: true };
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
      const result = await Tools.callNative("deleteCharacter", [params.characterId]);
      return { success: true };
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
      const result = await Tools.callNative("getCharacters", [params.workId]);
      return { success: true, characters: JSON.parse(result) };
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
      const result = await Tools.callNative("getCharacterDetail", [params.characterId]);
      return { success: true, character: JSON.parse(result) };
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
      const result = await Tools.callNative("createSetting", [JSON.stringify(params)]);
      return { success: true, settingId: result };
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
      const result = await Tools.callNative("updateSetting", [JSON.stringify(params)]);
      return { success: true };
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
      const result = await Tools.callNative("deleteSetting", [params.settingId]);
      return { success: true };
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
      const result = await Tools.callNative("getSettings", [params.workId]);
      return { success: true, settings: JSON.parse(result) };
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
      const result = await Tools.callNative("getSettingDetail", [params.settingId]);
      return { success: true, setting: JSON.parse(result) };
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
      const result = await Tools.callNative("createLocation", [JSON.stringify(params)]);
      return { success: true, locationId: result };
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
      const result = await Tools.callNative("updateLocation", [JSON.stringify(params)]);
      return { success: true };
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
      const result = await Tools.callNative("deleteLocation", [params.locationId]);
      return { success: true };
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
      const result = await Tools.callNative("getLocations", [params.workId]);
      return { success: true, locations: JSON.parse(result) };
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
      const result = await Tools.callNative("getLocationDetail", [params.locationId]);
      return { success: true, location: JSON.parse(result) };
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
      const result = await Tools.callNative("createFaction", [JSON.stringify(params)]);
      return { success: true, factionId: result };
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
      const result = await Tools.callNative("updateFaction", [JSON.stringify(params)]);
      return { success: true };
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
      const result = await Tools.callNative("deleteFaction", [params.factionId]);
      return { success: true };
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
      const result = await Tools.callNative("getFactions", [params.workId]);
      return { success: true, factions: JSON.parse(result) };
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
      const result = await Tools.callNative("getFactionDetail", [params.factionId]);
      return { success: true, faction: JSON.parse(result) };
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
      const result = await Tools.callNative("createItem", [JSON.stringify(params)]);
      return { success: true, itemId: result };
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
      const result = await Tools.callNative("updateItem", [JSON.stringify(params)]);
      return { success: true };
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
      const result = await Tools.callNative("deleteItem", [params.itemId]);
      return { success: true };
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
      const result = await Tools.callNative("getItems", [params.workId]);
      return { success: true, items: JSON.parse(result) };
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
      const result = await Tools.callNative("getItemDetail", [params.itemId]);
      return { success: true, item: JSON.parse(result) };
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
      const result = await Tools.callNative("createHook", [JSON.stringify(params)]);
      return { success: true, hookId: result };
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
      const result = await Tools.callNative("updateHook", [JSON.stringify(params)]);
      return { success: true };
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
      const result = await Tools.callNative("deleteHook", [params.hookId]);
      return { success: true };
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
      const result = await Tools.callNative("getHooks", [params.workId]);
      return { success: true, hooks: JSON.parse(result) };
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
      const result = await Tools.callNative("getHookDetail", [params.hookId]);
      return { success: true, hook: JSON.parse(result) };
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
      const result = await Tools.callNative("createReference", [JSON.stringify(params)]);
      return { success: true, referenceId: result };
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
      const result = await Tools.callNative("updateReference", [JSON.stringify(params)]);
      return { success: true };
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
      const result = await Tools.callNative("deleteReference", [params.referenceId]);
      return { success: true };
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
      const result = await Tools.callNative("getReferences", [params.workId]);
      return { success: true, references: JSON.parse(result) };
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
      const result = await Tools.callNative("getReferenceDetail", [params.referenceId]);
      return { success: true, reference: JSON.parse(result) };
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
      const result = await Tools.callNative("createTodo", [JSON.stringify(params)]);
      return { success: true, todoId: result };
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
      const result = await Tools.callNative("updateTodo", [JSON.stringify(params)]);
      return { success: true };
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
      const result = await Tools.callNative("deleteTodo", [params.todoId]);
      return { success: true };
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
      const result = await Tools.callNative("getTodos", [params.workId]);
      return { success: true, todos: JSON.parse(result) };
    }
  });
}
