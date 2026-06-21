var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  registerToolPkg: () => registerToolPkg
});
module.exports = __toCommonJS(main_exports);

// src/ui/novel_works.ui.ts
function Screen(ctx) {
  const { UI } = ctx;
  return UI.Box(
    { fillMaxSize: true },
    UI.WebView({
      key: "novel_works_webview",
      fillMaxSize: true,
      url: "file:///android_asset/packages/novelide/resources/webapp/\u7F51\u6587\u5199\u4F5C.html#works",
      javaScriptEnabled: true,
      domStorageEnabled: true,
      allowFileAccess: true,
      allowContentAccess: true,
      supportZoom: true,
      useWideViewPort: true,
      loadWithOverviewMode: true
    })
  );
}

// src/ui/novel_editor.ui.ts
function Screen2(ctx) {
  var _a, _b;
  const { UI } = ctx;
  const params = (_a = ctx.routeParams) != null ? _a : {};
  const workId = (_b = params.workId) != null ? _b : "";
  return UI.Box(
    { fillMaxSize: true },
    UI.WebView({
      key: `novel_editor_webview_${workId}`,
      fillMaxSize: true,
      url: `file:///android_asset/packages/novelide/resources/webapp/\u7F51\u6587\u5199\u4F5C.html#editor?workId=${workId}`,
      javaScriptEnabled: true,
      domStorageEnabled: true,
      allowFileAccess: true,
      allowContentAccess: true,
      supportZoom: true,
      useWideViewPort: true,
      loadWithOverviewMode: true
    })
  );
}

// src/ui/novel_materials.ui.ts
function Screen3(ctx) {
  var _a, _b;
  const { UI } = ctx;
  const params = (_a = ctx.routeParams) != null ? _a : {};
  const workId = (_b = params.workId) != null ? _b : "";
  return UI.Box(
    { fillMaxSize: true },
    UI.WebView({
      key: `novel_materials_webview_${workId}`,
      fillMaxSize: true,
      url: `file:///android_asset/packages/novelide/resources/webapp/\u7F51\u6587\u5199\u4F5C.html#materials?workId=${workId}`,
      javaScriptEnabled: true,
      domStorageEnabled: true,
      allowFileAccess: true,
      allowContentAccess: true,
      supportZoom: true,
      useWideViewPort: true,
      loadWithOverviewMode: true
    })
  );
}

// src/ui/novel_outline.ui.ts
function Screen4(ctx) {
  var _a, _b;
  const { UI } = ctx;
  const params = (_a = ctx.routeParams) != null ? _a : {};
  const workId = (_b = params.workId) != null ? _b : "";
  return UI.Box(
    { fillMaxSize: true },
    UI.WebView({
      key: `novel_outline_webview_${workId}`,
      fillMaxSize: true,
      url: `file:///android_asset/packages/novelide/resources/webapp/\u7F51\u6587\u5199\u4F5C.html#outline?workId=${workId}`,
      javaScriptEnabled: true,
      domStorageEnabled: true,
      allowFileAccess: true,
      allowContentAccess: true,
      supportZoom: true,
      useWideViewPort: true,
      loadWithOverviewMode: true
    })
  );
}

// src/ui/novel_stats.ui.ts
function Screen5(ctx) {
  const { UI } = ctx;
  return UI.Box(
    { fillMaxSize: true },
    UI.WebView({
      key: "novel_stats_webview",
      fillMaxSize: true,
      url: "file:///android_asset/packages/novelide/resources/webapp/\u7F51\u6587\u5199\u4F5C.html#stats",
      javaScriptEnabled: true,
      domStorageEnabled: true,
      allowFileAccess: true,
      allowContentAccess: true,
      supportZoom: true,
      useWideViewPort: true,
      loadWithOverviewMode: true
    })
  );
}

// src/ui/novel_tools.ui.ts
function Screen6(ctx) {
  const { UI } = ctx;
  return UI.Box(
    { fillMaxSize: true },
    UI.WebView({
      key: "novel_tools_webview",
      fillMaxSize: true,
      url: "file:///android_asset/packages/novelide/resources/webapp/\u5DE5\u5177\u7BB1.html",
      javaScriptEnabled: true,
      domStorageEnabled: true,
      allowFileAccess: true,
      allowContentAccess: true,
      supportZoom: true,
      useWideViewPort: true,
      loadWithOverviewMode: true
    })
  );
}

// src/ui/novel_workspace.ui.ts
function Screen7(ctx) {
  const { UI } = ctx;
  return UI.Box(
    { fillMaxSize: true },
    UI.WebView({
      key: "novel_workspace_webview",
      fillMaxSize: true,
      url: "file:///android_asset/packages/novelide/resources/webapp/\u5B8C\u6574\u7248.html#workspace",
      javaScriptEnabled: true,
      domStorageEnabled: true,
      allowFileAccess: true,
      allowContentAccess: true,
      supportZoom: true,
      useWideViewPort: true,
      loadWithOverviewMode: true
    })
  );
}

// src/packages/novel_works.ts
function registerTools() {
  Tools.register("novelide:create_work", {
    description: "\u521B\u5EFA\u65B0\u7684\u5C0F\u8BF4\u4F5C\u54C1",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "\u4F5C\u54C1\u6807\u9898" },
        genre: { type: "string", description: "\u4F5C\u54C1\u7C7B\u578B\uFF08\u5982\uFF1A\u90FD\u5E02\u3001\u7384\u5E7B\u3001\u60AC\u7591\uFF09" },
        description: { type: "string", description: "\u4F5C\u54C1\u7B80\u4ECB" }
      },
      required: ["title"]
    },
    execute: async (params) => {
      const { title, genre = "", description = "" } = params;
      const result = await Tools.callNative("createWork", [title, genre, description]);
      return { success: true, workId: result };
    }
  });
  Tools.register("novelide:list_works", {
    description: "\u83B7\u53D6\u6240\u6709\u5C0F\u8BF4\u4F5C\u54C1\u5217\u8868",
    parameters: { type: "object", properties: {} },
    execute: async () => {
      const result = await Tools.callNative("getNovelWorks", []);
      return { success: true, works: JSON.parse(result) };
    }
  });
  Tools.register("novelide:get_work", {
    description: "\u83B7\u53D6\u6307\u5B9A\u4F5C\u54C1\u7684\u8BE6\u7EC6\u4FE1\u606F",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "\u4F5C\u54C1ID" }
      },
      required: ["workId"]
    },
    execute: async (params) => {
      const { workId } = params;
      return { success: true, work: {} };
    }
  });
  Tools.register("novelide:update_work", {
    description: "\u66F4\u65B0\u4F5C\u54C1\u4FE1\u606F",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "\u4F5C\u54C1ID" },
        title: { type: "string", description: "\u65B0\u6807\u9898" },
        genre: { type: "string", description: "\u65B0\u7C7B\u578B" },
        description: { type: "string", description: "\u65B0\u7B80\u4ECB" }
      },
      required: ["workId"]
    },
    execute: async (params) => {
      const _a = params, { workId } = _a, updates = __objRest(_a, ["workId"]);
      const result = await Tools.callNative("updateWork", [JSON.stringify(__spreadValues({ id: workId }, updates))]);
      return { success: true };
    }
  });
  Tools.register("novelide:delete_work", {
    description: "\u5220\u9664\u6307\u5B9A\u4F5C\u54C1",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "\u4F5C\u54C1ID" }
      },
      required: ["workId"]
    },
    execute: async (params) => {
      const { workId } = params;
      const result = await Tools.callNative("deleteWork", [workId]);
      return { success: true };
    }
  });
}

// src/packages/novel_chapters.ts
function registerTools2() {
  Tools.register("novelide:create_chapter", {
    description: "\u4E3A\u6307\u5B9A\u4F5C\u54C1\u521B\u5EFA\u65B0\u7AE0\u8282",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "\u4F5C\u54C1ID" },
        title: { type: "string", description: "\u7AE0\u8282\u6807\u9898" },
        order: { type: "number", description: "\u7AE0\u8282\u6392\u5E8F\uFF08\u53EF\u9009\uFF09" }
      },
      required: ["workId", "title"]
    },
    execute: async (params) => {
      const { workId, title, order = 0 } = params;
      const result = await Tools.callNative("createChapter", [workId, title, order]);
      return { success: true, chapterId: result };
    }
  });
  Tools.register("novelide:list_chapters", {
    description: "\u83B7\u53D6\u6307\u5B9A\u4F5C\u54C1\u7684\u6240\u6709\u7AE0\u8282",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "\u4F5C\u54C1ID" }
      },
      required: ["workId"]
    },
    execute: async (params) => {
      const { workId } = params;
      const result = await Tools.callNative("getChapters", [workId]);
      return { success: true, chapters: JSON.parse(result) };
    }
  });
  Tools.register("novelide:get_chapter", {
    description: "\u83B7\u53D6\u6307\u5B9A\u7AE0\u8282\u7684\u5185\u5BB9",
    parameters: {
      type: "object",
      properties: {
        chapterId: { type: "string", description: "\u7AE0\u8282ID" }
      },
      required: ["chapterId"]
    },
    execute: async (params) => {
      const { chapterId } = params;
      const result = await Tools.callNative("getChapterContent", [chapterId]);
      return { success: true, content: result };
    }
  });
  Tools.register("novelide:save_chapter", {
    description: "\u4FDD\u5B58\u7AE0\u8282\u5185\u5BB9",
    parameters: {
      type: "object",
      properties: {
        chapterId: { type: "string", description: "\u7AE0\u8282ID" },
        content: { type: "string", description: "\u7AE0\u8282\u5185\u5BB9" },
        wordCount: { type: "number", description: "\u5B57\u6570" }
      },
      required: ["chapterId", "content"]
    },
    execute: async (params) => {
      const { chapterId, content, wordCount = 0 } = params;
      const result = await Tools.callNative("saveChapterContent", [chapterId, content, wordCount]);
      return { success: true };
    }
  });
  Tools.register("novelide:delete_chapter", {
    description: "\u5220\u9664\u6307\u5B9A\u7AE0\u8282",
    parameters: {
      type: "object",
      properties: {
        chapterId: { type: "string", description: "\u7AE0\u8282ID" }
      },
      required: ["chapterId"]
    },
    execute: async (params) => {
      const { chapterId } = params;
      const result = await Tools.callNative("deleteChapter", [chapterId]);
      return { success: true };
    }
  });
  Tools.register("novelide:reorder_chapters", {
    description: "\u91CD\u65B0\u6392\u5E8F\u7AE0\u8282",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "\u4F5C\u54C1ID" },
        chapterIds: { type: "array", items: { type: "string" }, description: "\u7AE0\u8282ID\u5217\u8868\uFF08\u6309\u65B0\u987A\u5E8F\uFF09" }
      },
      required: ["workId", "chapterIds"]
    },
    execute: async (params) => {
      const { workId, chapterIds } = params;
      const result = await Tools.callNative("reorderChapters", [workId, JSON.stringify(chapterIds)]);
      return { success: true };
    }
  });
}

// src/packages/novel_materials.ts
function registerTools3() {
  Tools.register("novelide:create_character", {
    description: "\u521B\u5EFA\u89D2\u8272",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "\u4F5C\u54C1ID" },
        name: { type: "string", description: "\u89D2\u8272\u59D3\u540D" },
        gender: { type: "string", description: "\u6027\u522B" },
        age: { type: "string", description: "\u5E74\u9F84" },
        appearance: { type: "string", description: "\u5916\u8C8C\u63CF\u8FF0" },
        personality: { type: "string", description: "\u6027\u683C\u7279\u5F81" },
        background: { type: "string", description: "\u80CC\u666F\u6545\u4E8B" },
        notes: { type: "string", description: "\u5907\u6CE8" }
      },
      required: ["workId", "name"]
    },
    execute: async (params) => {
      const { workId, name, gender, age, appearance, personality, background, notes } = params;
      const role = [gender, age, personality, background].filter(Boolean).join(" | ") || notes || "";
      const result = await Tools.callNative("createCharacter", [workId, name, role]);
      return { success: true, characterId: result };
    }
  });
  Tools.register("novelide:update_character", {
    description: "\u66F4\u65B0\u89D2\u8272\u4FE1\u606F",
    parameters: {
      type: "object",
      properties: {
        characterId: { type: "string", description: "\u89D2\u8272ID" },
        name: { type: "string", description: "\u89D2\u8272\u59D3\u540D" },
        gender: { type: "string", description: "\u6027\u522B" },
        age: { type: "string", description: "\u5E74\u9F84" },
        appearance: { type: "string", description: "\u5916\u8C8C\u63CF\u8FF0" },
        personality: { type: "string", description: "\u6027\u683C\u7279\u5F81" },
        background: { type: "string", description: "\u80CC\u666F\u6545\u4E8B" },
        notes: { type: "string", description: "\u5907\u6CE8" }
      },
      required: ["characterId"]
    },
    execute: async (params) => {
      const result = await Tools.callNative("updateCharacter", [JSON.stringify(params)]);
      return { success: true };
    }
  });
  Tools.register("novelide:delete_character", {
    description: "\u5220\u9664\u6307\u5B9A\u89D2\u8272",
    parameters: {
      type: "object",
      properties: {
        characterId: { type: "string", description: "\u89D2\u8272ID" }
      },
      required: ["characterId"]
    },
    execute: async (params) => {
      const result = await Tools.callNative("deleteCharacter", [params.characterId]);
      return { success: true };
    }
  });
  Tools.register("novelide:list_characters", {
    description: "\u83B7\u53D6\u6307\u5B9A\u4F5C\u54C1\u7684\u6240\u6709\u89D2\u8272\u5217\u8868",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "\u4F5C\u54C1ID" }
      },
      required: ["workId"]
    },
    execute: async (params) => {
      const result = await Tools.callNative("getCharacters", [params.workId]);
      return { success: true, characters: JSON.parse(result) };
    }
  });
  Tools.register("novelide:get_character", {
    description: "\u83B7\u53D6\u6307\u5B9A\u89D2\u8272\u7684\u8BE6\u7EC6\u4FE1\u606F",
    parameters: {
      type: "object",
      properties: {
        characterId: { type: "string", description: "\u89D2\u8272ID" }
      },
      required: ["characterId"]
    },
    execute: async (params) => {
      const result = await Tools.callNative("getCharacterDetail", [params.characterId]);
      return { success: true, character: JSON.parse(result) };
    }
  });
  Tools.register("novelide:create_setting", {
    description: "\u521B\u5EFA\u4E16\u754C\u89C2\u8BBE\u5B9A",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "\u4F5C\u54C1ID" },
        name: { type: "string", description: "\u8BBE\u5B9A\u540D\u79F0" },
        category: { type: "string", description: "\u8BBE\u5B9A\u5206\u7C7B\uFF08\u5982\uFF1A\u529B\u91CF\u4F53\u7CFB\u3001\u793E\u4F1A\u5236\u5EA6\u3001\u9B54\u6CD5\u4F53\u7CFB\uFF09" },
        content: { type: "string", description: "\u8BBE\u5B9A\u5185\u5BB9" },
        notes: { type: "string", description: "\u5907\u6CE8" }
      },
      required: ["workId", "name", "content"]
    },
    execute: async (params) => {
      const { workId, name, content } = params;
      const result = await Tools.callNative("createSetting", [workId, name, content]);
      return { success: true, settingId: result };
    }
  });
  Tools.register("novelide:update_setting", {
    description: "\u66F4\u65B0\u4E16\u754C\u89C2\u8BBE\u5B9A",
    parameters: {
      type: "object",
      properties: {
        settingId: { type: "string", description: "\u8BBE\u5B9AID" },
        name: { type: "string", description: "\u8BBE\u5B9A\u540D\u79F0" },
        category: { type: "string", description: "\u8BBE\u5B9A\u5206\u7C7B" },
        content: { type: "string", description: "\u8BBE\u5B9A\u5185\u5BB9" },
        notes: { type: "string", description: "\u5907\u6CE8" }
      },
      required: ["settingId"]
    },
    execute: async (params) => {
      const result = await Tools.callNative("updateSetting", [JSON.stringify(params)]);
      return { success: true };
    }
  });
  Tools.register("novelide:delete_setting", {
    description: "\u5220\u9664\u6307\u5B9A\u8BBE\u5B9A",
    parameters: {
      type: "object",
      properties: {
        settingId: { type: "string", description: "\u8BBE\u5B9AID" }
      },
      required: ["settingId"]
    },
    execute: async (params) => {
      const result = await Tools.callNative("deleteSetting", [params.settingId]);
      return { success: true };
    }
  });
  Tools.register("novelide:list_settings", {
    description: "\u83B7\u53D6\u6307\u5B9A\u4F5C\u54C1\u7684\u6240\u6709\u8BBE\u5B9A\u5217\u8868",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "\u4F5C\u54C1ID" }
      },
      required: ["workId"]
    },
    execute: async (params) => {
      const result = await Tools.callNative("getSettings", [params.workId]);
      return { success: true, settings: JSON.parse(result) };
    }
  });
  Tools.register("novelide:get_setting", {
    description: "\u83B7\u53D6\u6307\u5B9A\u8BBE\u5B9A\u7684\u8BE6\u7EC6\u4FE1\u606F",
    parameters: {
      type: "object",
      properties: {
        settingId: { type: "string", description: "\u8BBE\u5B9AID" }
      },
      required: ["settingId"]
    },
    execute: async (params) => {
      const result = await Tools.callNative("getSettingDetail", [params.settingId]);
      return { success: true, setting: JSON.parse(result) };
    }
  });
  Tools.register("novelide:create_location", {
    description: "\u521B\u5EFA\u5730\u70B9",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "\u4F5C\u54C1ID" },
        name: { type: "string", description: "\u5730\u70B9\u540D\u79F0" },
        type: { type: "string", description: "\u5730\u70B9\u7C7B\u578B\uFF08\u5982\uFF1A\u57CE\u5E02\u3001\u5C71\u8109\u3001\u5BAB\u6BBF\uFF09" },
        description: { type: "string", description: "\u5730\u70B9\u63CF\u8FF0" },
        notes: { type: "string", description: "\u5907\u6CE8" }
      },
      required: ["workId", "name"]
    },
    execute: async (params) => {
      const { workId, name, description } = params;
      const result = await Tools.callNative("createLocation", [workId, name, description || ""]);
      return { success: true, locationId: result };
    }
  });
  Tools.register("novelide:update_location", {
    description: "\u66F4\u65B0\u5730\u70B9\u4FE1\u606F",
    parameters: {
      type: "object",
      properties: {
        locationId: { type: "string", description: "\u5730\u70B9ID" },
        name: { type: "string", description: "\u5730\u70B9\u540D\u79F0" },
        type: { type: "string", description: "\u5730\u70B9\u7C7B\u578B" },
        description: { type: "string", description: "\u5730\u70B9\u63CF\u8FF0" },
        notes: { type: "string", description: "\u5907\u6CE8" }
      },
      required: ["locationId"]
    },
    execute: async (params) => {
      const result = await Tools.callNative("updateLocation", [JSON.stringify(params)]);
      return { success: true };
    }
  });
  Tools.register("novelide:delete_location", {
    description: "\u5220\u9664\u6307\u5B9A\u5730\u70B9",
    parameters: {
      type: "object",
      properties: {
        locationId: { type: "string", description: "\u5730\u70B9ID" }
      },
      required: ["locationId"]
    },
    execute: async (params) => {
      const result = await Tools.callNative("deleteLocation", [params.locationId]);
      return { success: true };
    }
  });
  Tools.register("novelide:list_locations", {
    description: "\u83B7\u53D6\u6307\u5B9A\u4F5C\u54C1\u7684\u6240\u6709\u5730\u70B9\u5217\u8868",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "\u4F5C\u54C1ID" }
      },
      required: ["workId"]
    },
    execute: async (params) => {
      const result = await Tools.callNative("getLocations", [params.workId]);
      return { success: true, locations: JSON.parse(result) };
    }
  });
  Tools.register("novelide:get_location", {
    description: "\u83B7\u53D6\u6307\u5B9A\u5730\u70B9\u7684\u8BE6\u7EC6\u4FE1\u606F",
    parameters: {
      type: "object",
      properties: {
        locationId: { type: "string", description: "\u5730\u70B9ID" }
      },
      required: ["locationId"]
    },
    execute: async (params) => {
      const result = await Tools.callNative("getLocationDetail", [params.locationId]);
      return { success: true, location: JSON.parse(result) };
    }
  });
  Tools.register("novelide:create_faction", {
    description: "\u521B\u5EFA\u52BF\u529B",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "\u4F5C\u54C1ID" },
        name: { type: "string", description: "\u52BF\u529B\u540D\u79F0" },
        type: { type: "string", description: "\u52BF\u529B\u7C7B\u578B\uFF08\u5982\uFF1A\u95E8\u6D3E\u3001\u56FD\u5BB6\u3001\u7EC4\u7EC7\uFF09" },
        description: { type: "string", description: "\u52BF\u529B\u63CF\u8FF0" },
        notes: { type: "string", description: "\u5907\u6CE8" }
      },
      required: ["workId", "name"]
    },
    execute: async (params) => {
      const { workId, name, description } = params;
      const result = await Tools.callNative("createFaction", [workId, name, description || ""]);
      return { success: true, factionId: result };
    }
  });
  Tools.register("novelide:update_faction", {
    description: "\u66F4\u65B0\u52BF\u529B\u4FE1\u606F",
    parameters: {
      type: "object",
      properties: {
        factionId: { type: "string", description: "\u52BF\u529BID" },
        name: { type: "string", description: "\u52BF\u529B\u540D\u79F0" },
        type: { type: "string", description: "\u52BF\u529B\u7C7B\u578B" },
        description: { type: "string", description: "\u52BF\u529B\u63CF\u8FF0" },
        notes: { type: "string", description: "\u5907\u6CE8" }
      },
      required: ["factionId"]
    },
    execute: async (params) => {
      const result = await Tools.callNative("updateFaction", [JSON.stringify(params)]);
      return { success: true };
    }
  });
  Tools.register("novelide:delete_faction", {
    description: "\u5220\u9664\u6307\u5B9A\u52BF\u529B",
    parameters: {
      type: "object",
      properties: {
        factionId: { type: "string", description: "\u52BF\u529BID" }
      },
      required: ["factionId"]
    },
    execute: async (params) => {
      const result = await Tools.callNative("deleteFaction", [params.factionId]);
      return { success: true };
    }
  });
  Tools.register("novelide:list_factions", {
    description: "\u83B7\u53D6\u6307\u5B9A\u4F5C\u54C1\u7684\u6240\u6709\u52BF\u529B\u5217\u8868",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "\u4F5C\u54C1ID" }
      },
      required: ["workId"]
    },
    execute: async (params) => {
      const result = await Tools.callNative("getFactions", [params.workId]);
      return { success: true, factions: JSON.parse(result) };
    }
  });
  Tools.register("novelide:get_faction", {
    description: "\u83B7\u53D6\u6307\u5B9A\u52BF\u529B\u7684\u8BE6\u7EC6\u4FE1\u606F",
    parameters: {
      type: "object",
      properties: {
        factionId: { type: "string", description: "\u52BF\u529BID" }
      },
      required: ["factionId"]
    },
    execute: async (params) => {
      const result = await Tools.callNative("getFactionDetail", [params.factionId]);
      return { success: true, faction: JSON.parse(result) };
    }
  });
  Tools.register("novelide:create_item", {
    description: "\u521B\u5EFA\u9053\u5177",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "\u4F5C\u54C1ID" },
        name: { type: "string", description: "\u9053\u5177\u540D\u79F0" },
        type: { type: "string", description: "\u9053\u5177\u7C7B\u578B\uFF08\u5982\uFF1A\u6B66\u5668\u3001\u6CD5\u5B9D\u3001\u836F\u54C1\uFF09" },
        description: { type: "string", description: "\u9053\u5177\u63CF\u8FF0" },
        notes: { type: "string", description: "\u5907\u6CE8" }
      },
      required: ["workId", "name"]
    },
    execute: async (params) => {
      const { workId, name, description } = params;
      const result = await Tools.callNative("createItem", [workId, name, description || ""]);
      return { success: true, itemId: result };
    }
  });
  Tools.register("novelide:update_item", {
    description: "\u66F4\u65B0\u9053\u5177\u4FE1\u606F",
    parameters: {
      type: "object",
      properties: {
        itemId: { type: "string", description: "\u9053\u5177ID" },
        name: { type: "string", description: "\u9053\u5177\u540D\u79F0" },
        type: { type: "string", description: "\u9053\u5177\u7C7B\u578B" },
        description: { type: "string", description: "\u9053\u5177\u63CF\u8FF0" },
        notes: { type: "string", description: "\u5907\u6CE8" }
      },
      required: ["itemId"]
    },
    execute: async (params) => {
      const result = await Tools.callNative("updateItem", [JSON.stringify(params)]);
      return { success: true };
    }
  });
  Tools.register("novelide:delete_item", {
    description: "\u5220\u9664\u6307\u5B9A\u9053\u5177",
    parameters: {
      type: "object",
      properties: {
        itemId: { type: "string", description: "\u9053\u5177ID" }
      },
      required: ["itemId"]
    },
    execute: async (params) => {
      const result = await Tools.callNative("deleteItem", [params.itemId]);
      return { success: true };
    }
  });
  Tools.register("novelide:list_items", {
    description: "\u83B7\u53D6\u6307\u5B9A\u4F5C\u54C1\u7684\u6240\u6709\u9053\u5177\u5217\u8868",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "\u4F5C\u54C1ID" }
      },
      required: ["workId"]
    },
    execute: async (params) => {
      const result = await Tools.callNative("getItems", [params.workId]);
      return { success: true, items: JSON.parse(result) };
    }
  });
  Tools.register("novelide:get_item", {
    description: "\u83B7\u53D6\u6307\u5B9A\u9053\u5177\u7684\u8BE6\u7EC6\u4FE1\u606F",
    parameters: {
      type: "object",
      properties: {
        itemId: { type: "string", description: "\u9053\u5177ID" }
      },
      required: ["itemId"]
    },
    execute: async (params) => {
      const result = await Tools.callNative("getItemDetail", [params.itemId]);
      return { success: true, item: JSON.parse(result) };
    }
  });
  Tools.register("novelide:create_hook", {
    description: "\u521B\u5EFA\u4F0F\u7B14",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "\u4F5C\u54C1ID" },
        title: { type: "string", description: "\u4F0F\u7B14\u6807\u9898" },
        content: { type: "string", description: "\u4F0F\u7B14\u5185\u5BB9" },
        plantChapter: { type: "string", description: "\u57CB\u8BBE\u7AE0\u8282" },
        resolveChapter: { type: "string", description: "\u56DE\u6536\u7AE0\u8282" },
        status: { type: "string", description: "\u72B6\u6001\uFF08\u5982\uFF1A\u5DF2\u57CB\u8BBE\u3001\u5DF2\u56DE\u6536\u3001\u5DF2\u5E9F\u5F03\uFF09" },
        notes: { type: "string", description: "\u5907\u6CE8" }
      },
      required: ["workId", "title", "content"]
    },
    execute: async (params) => {
      const { workId, title, content } = params;
      const hookContent = title ? `${title}
${content}` : content;
      const result = await Tools.callNative("createPlotHook", [workId, hookContent]);
      return { success: true, hookId: result };
    }
  });
  Tools.register("novelide:update_hook", {
    description: "\u66F4\u65B0\u4F0F\u7B14\u4FE1\u606F",
    parameters: {
      type: "object",
      properties: {
        hookId: { type: "string", description: "\u4F0F\u7B14ID" },
        title: { type: "string", description: "\u4F0F\u7B14\u6807\u9898" },
        content: { type: "string", description: "\u4F0F\u7B14\u5185\u5BB9" },
        plantChapter: { type: "string", description: "\u57CB\u8BBE\u7AE0\u8282" },
        resolveChapter: { type: "string", description: "\u56DE\u6536\u7AE0\u8282" },
        status: { type: "string", description: "\u72B6\u6001" },
        notes: { type: "string", description: "\u5907\u6CE8" }
      },
      required: ["hookId"]
    },
    execute: async (params) => {
      const result = await Tools.callNative("updatePlotHook", [JSON.stringify(params)]);
      return { success: true };
    }
  });
  Tools.register("novelide:delete_hook", {
    description: "\u5220\u9664\u6307\u5B9A\u4F0F\u7B14",
    parameters: {
      type: "object",
      properties: {
        hookId: { type: "string", description: "\u4F0F\u7B14ID" }
      },
      required: ["hookId"]
    },
    execute: async (params) => {
      const result = await Tools.callNative("deletePlotHook", [params.hookId]);
      return { success: true };
    }
  });
  Tools.register("novelide:list_hooks", {
    description: "\u83B7\u53D6\u6307\u5B9A\u4F5C\u54C1\u7684\u6240\u6709\u4F0F\u7B14\u5217\u8868",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "\u4F5C\u54C1ID" }
      },
      required: ["workId"]
    },
    execute: async (params) => {
      const result = await Tools.callNative("getPlotHooks", [params.workId]);
      return { success: true, hooks: JSON.parse(result) };
    }
  });
  Tools.register("novelide:get_hook", {
    description: "\u83B7\u53D6\u6307\u5B9A\u4F0F\u7B14\u7684\u8BE6\u7EC6\u4FE1\u606F",
    parameters: {
      type: "object",
      properties: {
        hookId: { type: "string", description: "\u4F0F\u7B14ID" }
      },
      required: ["hookId"]
    },
    execute: async (params) => {
      const result = await Tools.callNative("getHookDetail", [params.hookId]);
      return { success: true, hook: JSON.parse(result) };
    }
  });
  Tools.register("novelide:create_reference", {
    description: "\u521B\u5EFA\u53C2\u8003\u8D44\u6599",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "\u4F5C\u54C1ID" },
        title: { type: "string", description: "\u8D44\u6599\u6807\u9898" },
        type: { type: "string", description: "\u8D44\u6599\u7C7B\u578B\uFF08\u5982\uFF1A\u56FE\u7247\u3001\u94FE\u63A5\u3001\u6587\u6863\u3001\u7B14\u8BB0\uFF09" },
        content: { type: "string", description: "\u8D44\u6599\u5185\u5BB9" },
        url: { type: "string", description: "\u5916\u90E8\u94FE\u63A5\uFF08\u53EF\u9009\uFF09" },
        notes: { type: "string", description: "\u5907\u6CE8" }
      },
      required: ["workId", "title", "content"]
    },
    execute: async (params) => {
      const { workId, title, content } = params;
      const result = await Tools.callNative("createReference", [workId, title, content]);
      return { success: true, referenceId: result };
    }
  });
  Tools.register("novelide:update_reference", {
    description: "\u66F4\u65B0\u53C2\u8003\u8D44\u6599",
    parameters: {
      type: "object",
      properties: {
        referenceId: { type: "string", description: "\u8D44\u6599ID" },
        title: { type: "string", description: "\u8D44\u6599\u6807\u9898" },
        type: { type: "string", description: "\u8D44\u6599\u7C7B\u578B" },
        content: { type: "string", description: "\u8D44\u6599\u5185\u5BB9" },
        url: { type: "string", description: "\u5916\u90E8\u94FE\u63A5" },
        notes: { type: "string", description: "\u5907\u6CE8" }
      },
      required: ["referenceId"]
    },
    execute: async (params) => {
      const result = await Tools.callNative("updateReference", [JSON.stringify(params)]);
      return { success: true };
    }
  });
  Tools.register("novelide:delete_reference", {
    description: "\u5220\u9664\u6307\u5B9A\u53C2\u8003\u8D44\u6599",
    parameters: {
      type: "object",
      properties: {
        referenceId: { type: "string", description: "\u8D44\u6599ID" }
      },
      required: ["referenceId"]
    },
    execute: async (params) => {
      const result = await Tools.callNative("deleteReference", [params.referenceId]);
      return { success: true };
    }
  });
  Tools.register("novelide:list_references", {
    description: "\u83B7\u53D6\u6307\u5B9A\u4F5C\u54C1\u7684\u6240\u6709\u53C2\u8003\u8D44\u6599\u5217\u8868",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "\u4F5C\u54C1ID" }
      },
      required: ["workId"]
    },
    execute: async (params) => {
      const result = await Tools.callNative("getReferences", [params.workId]);
      return { success: true, references: JSON.parse(result) };
    }
  });
  Tools.register("novelide:get_reference", {
    description: "\u83B7\u53D6\u6307\u5B9A\u53C2\u8003\u8D44\u6599\u7684\u8BE6\u7EC6\u4FE1\u606F",
    parameters: {
      type: "object",
      properties: {
        referenceId: { type: "string", description: "\u8D44\u6599ID" }
      },
      required: ["referenceId"]
    },
    execute: async (params) => {
      const result = await Tools.callNative("getReferenceDetail", [params.referenceId]);
      return { success: true, reference: JSON.parse(result) };
    }
  });
  Tools.register("novelide:create_todo", {
    description: "\u521B\u5EFA\u5199\u4F5C\u5F85\u529E",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "\u4F5C\u54C1ID" },
        title: { type: "string", description: "\u5F85\u529E\u6807\u9898" },
        content: { type: "string", description: "\u5F85\u529E\u5185\u5BB9" },
        priority: { type: "string", description: "\u4F18\u5148\u7EA7\uFF08\u5982\uFF1A\u9AD8\u3001\u4E2D\u3001\u4F4E\uFF09" }
      },
      required: ["workId", "title"]
    },
    execute: async (params) => {
      const { workId, title, priority } = params;
      const priorityNum = priority === "high" || priority === "\u9AD8" ? 2 : priority === "medium" || priority === "\u4E2D" ? 1 : 0;
      const result = await Tools.callNative("createTodo", [workId, title, priorityNum]);
      return { success: true, todoId: result };
    }
  });
  Tools.register("novelide:update_todo", {
    description: "\u66F4\u65B0\u5199\u4F5C\u5F85\u529E",
    parameters: {
      type: "object",
      properties: {
        todoId: { type: "string", description: "\u5F85\u529EID" },
        title: { type: "string", description: "\u5F85\u529E\u6807\u9898" },
        content: { type: "string", description: "\u5F85\u529E\u5185\u5BB9" },
        priority: { type: "string", description: "\u4F18\u5148\u7EA7" },
        completed: { type: "boolean", description: "\u662F\u5426\u5DF2\u5B8C\u6210" }
      },
      required: ["todoId"]
    },
    execute: async (params) => {
      const result = await Tools.callNative("updateTodo", [JSON.stringify(params)]);
      return { success: true };
    }
  });
  Tools.register("novelide:delete_todo", {
    description: "\u5220\u9664\u6307\u5B9A\u5199\u4F5C\u5F85\u529E",
    parameters: {
      type: "object",
      properties: {
        todoId: { type: "string", description: "\u5F85\u529EID" }
      },
      required: ["todoId"]
    },
    execute: async (params) => {
      const result = await Tools.callNative("deleteTodo", [params.todoId]);
      return { success: true };
    }
  });
  Tools.register("novelide:list_todos", {
    description: "\u83B7\u53D6\u6307\u5B9A\u4F5C\u54C1\u7684\u6240\u6709\u5199\u4F5C\u5F85\u529E\u5217\u8868",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "\u4F5C\u54C1ID" }
      },
      required: ["workId"]
    },
    execute: async (params) => {
      const result = await Tools.callNative("getTodos", [params.workId]);
      return { success: true, todos: JSON.parse(result) };
    }
  });
}

// src/packages/novel_ai_tools.ts
function registerTools4() {
  Tools.register("novelide:continue_writing", {
    description: "AI \u7EED\u5199\uFF0C\u6839\u636E\u524D\u6587\u5185\u5BB9\u81EA\u52A8\u7EED\u5199\u540E\u7EED\u60C5\u8282",
    parameters: {
      type: "object",
      properties: {
        content: { type: "string", description: "\u524D\u6587\u5185\u5BB9" },
        workId: { type: "string", description: "\u4F5C\u54C1ID" }
      },
      required: ["content"]
    },
    execute: async (params) => {
      const { content, workId } = params;
      const result = await Tools.Chat({
        messages: [{ role: "user", content: `\u8BF7\u7EED\u5199\u4EE5\u4E0B\u5185\u5BB9\uFF1A
${content}` }],
        systemPrompt: "\u4F60\u662F\u4E00\u4E2A\u7F51\u6587\u5199\u4F5C\u52A9\u624B\uFF0C\u8BF7\u6839\u636E\u524D\u6587\u5185\u5BB9\u7EED\u5199\uFF0C\u4FDD\u6301\u98CE\u683C\u4E00\u81F4\uFF0C\u60C5\u8282\u8FDE\u8D2F\uFF0C\u7EED\u5199\u7EA6500\u5B57\u3002"
      });
      return { success: true, text: result };
    }
  });
  Tools.register("novelide:polish_text", {
    description: "AI \u6587\u672C\u7CBE\u4FEE\uFF0C\u4F18\u5316\u8BED\u53E5\u8868\u8FBE\u3001\u6DA6\u8272\u6587\u7B14",
    parameters: {
      type: "object",
      properties: {
        content: { type: "string", description: "\u9700\u8981\u7CBE\u4FEE\u7684\u6587\u672C\u5185\u5BB9" },
        workId: { type: "string", description: "\u4F5C\u54C1ID" }
      },
      required: ["content"]
    },
    execute: async (params) => {
      const { content, workId } = params;
      const result = await Tools.Chat({
        messages: [{ role: "user", content: `\u8BF7\u7CBE\u4FEE\u4EE5\u4E0B\u6587\u672C\uFF0C\u4F18\u5316\u8BED\u53E5\u8868\u8FBE\uFF0C\u63D0\u5347\u6587\u7B14\u8D28\u91CF\uFF0C\u4FDD\u6301\u539F\u610F\u4E0D\u53D8\uFF1A
${content}` }],
        systemPrompt: "\u4F60\u662F\u4E00\u4E2A\u4E13\u4E1A\u7684\u6587\u5B66\u7F16\u8F91\uFF0C\u8BF7\u5BF9\u6587\u672C\u8FDB\u884C\u7CBE\u4FEE\u6DA6\u8272\uFF0C\u4F18\u5316\u63AA\u8F9E\u3001\u8282\u594F\u548C\u8868\u8FBE\u529B\uFF0C\u4FDD\u6301\u539F\u6587\u7684\u6838\u5FC3\u610F\u601D\u548C\u98CE\u683C\u3002"
      });
      return { success: true, text: result };
    }
  });
  Tools.register("novelide:expand_text", {
    description: "AI \u6269\u5199\uFF0C\u5C06\u7B80\u77ED\u5185\u5BB9\u6269\u5C55\u4E3A\u66F4\u8BE6\u7EC6\u7684\u63CF\u5199",
    parameters: {
      type: "object",
      properties: {
        content: { type: "string", description: "\u9700\u8981\u6269\u5199\u7684\u6587\u672C\u5185\u5BB9" },
        workId: { type: "string", description: "\u4F5C\u54C1ID" }
      },
      required: ["content"]
    },
    execute: async (params) => {
      const { content, workId } = params;
      const result = await Tools.Chat({
        messages: [{ role: "user", content: `\u8BF7\u5C06\u4EE5\u4E0B\u5185\u5BB9\u8FDB\u884C\u6269\u5199\uFF0C\u589E\u52A0\u7EC6\u8282\u63CF\u5199\u3001\u5FC3\u7406\u6D3B\u52A8\u3001\u73AF\u5883\u6E32\u67D3\uFF0C\u4F7F\u5185\u5BB9\u66F4\u52A0\u4E30\u5BCC\u9971\u6EE1\uFF1A
${content}` }],
        systemPrompt: "\u4F60\u662F\u4E00\u4E2A\u7F51\u6587\u5199\u4F5C\u52A9\u624B\uFF0C\u8BF7\u5BF9\u6587\u672C\u8FDB\u884C\u6269\u5199\uFF0C\u6DFB\u52A0\u751F\u52A8\u7684\u7EC6\u8282\u63CF\u5199\u3001\u4EBA\u7269\u5FC3\u7406\u3001\u73AF\u5883\u6C1B\u56F4\u7B49\uFF0C\u4F7F\u5185\u5BB9\u66F4\u52A0\u4E30\u6EE1\u6709\u5C42\u6B21\u3002"
      });
      return { success: true, text: result };
    }
  });
  Tools.register("novelide:deai_flavor", {
    description: "\u53BB\u9664 AI \u75D5\u8FF9\uFF0C\u8BA9\u6587\u672C\u66F4\u81EA\u7136\u3001\u66F4\u6709\u4EBA\u5473",
    parameters: {
      type: "object",
      properties: {
        content: { type: "string", description: "\u9700\u8981\u53BB AI \u5473\u7684\u6587\u672C\u5185\u5BB9" },
        workId: { type: "string", description: "\u4F5C\u54C1ID" }
      },
      required: ["content"]
    },
    execute: async (params) => {
      const { content, workId } = params;
      const result = await Tools.Chat({
        messages: [{ role: "user", content: `\u8BF7\u6539\u5199\u4EE5\u4E0B\u6587\u672C\uFF0C\u53BB\u9664AI\u751F\u6210\u7684\u75D5\u8FF9\uFF0C\u8BA9\u8BED\u8A00\u66F4\u81EA\u7136\u3001\u66F4\u53E3\u8BED\u5316\u3001\u66F4\u6709\u4EBA\u5473\uFF1A
${content}` }],
        systemPrompt: "\u4F60\u662F\u4E00\u4E2A\u8D44\u6DF1\u7F51\u6587\u4F5C\u8005\uFF0C\u8BF7\u6539\u5199\u6587\u672C\u4F7F\u5176\u8BFB\u8D77\u6765\u50CF\u771F\u4EBA\u5199\u7684\uFF0C\u907F\u514DAI\u5E38\u89C1\u7684\u5957\u8DEF\u5316\u8868\u8FBE\u3001\u8FC7\u5EA6\u4FEE\u9970\u548C\u751F\u786C\u8F6C\u6298\uFF0C\u4F7F\u7528\u66F4\u81EA\u7136\u7684\u53E3\u8BED\u5316\u8868\u8FBE\u3002"
      });
      return { success: true, text: result };
    }
  });
  Tools.register("novelide:check_pleasure", {
    description: "\u68C0\u67E5\u6587\u672C\u4E2D\u7684\u723D\u70B9\u8BBE\u8BA1\uFF0C\u5206\u6790\u8282\u594F\u548C\u8BFB\u8005\u4F53\u9A8C",
    parameters: {
      type: "object",
      properties: {
        content: { type: "string", description: "\u9700\u8981\u68C0\u67E5\u7684\u6587\u672C\u5185\u5BB9" },
        workId: { type: "string", description: "\u4F5C\u54C1ID" }
      },
      required: ["content"]
    },
    execute: async (params) => {
      const { content, workId } = params;
      const result = await Tools.Chat({
        messages: [{ role: "user", content: `\u8BF7\u5206\u6790\u4EE5\u4E0B\u7F51\u6587\u5185\u5BB9\u7684\u723D\u70B9\u8BBE\u8BA1\uFF0C\u5305\u62EC\uFF1A
1. \u662F\u5426\u6709\u660E\u663E\u7684\u723D\u70B9\u548C\u9AD8\u6F6E
2. \u8282\u594F\u662F\u5426\u5408\u7406
3. \u8BFB\u8005\u7684\u60C5\u7EEA\u5F15\u5BFC\u662F\u5426\u5230\u4F4D
4. \u6539\u8FDB\u5EFA\u8BAE

\u5185\u5BB9\uFF1A
${content}` }],
        systemPrompt: "\u4F60\u662F\u4E00\u4E2A\u7F51\u6587\u7F16\u8F91\u4E13\u5BB6\uFF0C\u64C5\u957F\u5206\u6790\u7F51\u6587\u7684\u723D\u70B9\u8BBE\u8BA1\u3001\u8282\u594F\u628A\u63A7\u548C\u8BFB\u8005\u4F53\u9A8C\u3002\u8BF7\u4ECE\u4E13\u4E1A\u89D2\u5EA6\u7ED9\u51FA\u5206\u6790\u548C\u6539\u8FDB\u5EFA\u8BAE\u3002"
      });
      return { success: true, text: result };
    }
  });
  Tools.register("novelide:detect_water", {
    description: "\u68C0\u6D4B\u6587\u672C\u4E2D\u7684\u6C34\u6587\u5185\u5BB9\uFF0C\u8BC6\u522B\u5197\u4F59\u548C\u65E0\u6548\u63CF\u5199",
    parameters: {
      type: "object",
      properties: {
        content: { type: "string", description: "\u9700\u8981\u68C0\u6D4B\u7684\u6587\u672C\u5185\u5BB9" },
        workId: { type: "string", description: "\u4F5C\u54C1ID" }
      },
      required: ["content"]
    },
    execute: async (params) => {
      const { content, workId } = params;
      const result = await Tools.Chat({
        messages: [{ role: "user", content: `\u8BF7\u68C0\u6D4B\u4EE5\u4E0B\u6587\u672C\u4E2D\u7684\u6C34\u6587\u5185\u5BB9\uFF0C\u6807\u8BB0\u51FA\uFF1A
1. \u5197\u4F59\u91CD\u590D\u7684\u63CF\u5199
2. \u65E0\u6548\u7684\u8FC7\u6E21\u6BB5\u843D
3. \u4E0E\u4E3B\u7EBF\u65E0\u5173\u7684\u5E9F\u8BDD
4. \u6CE8\u6C34\u5ACC\u7591\u7684\u6BB5\u843D
5. \u6574\u4F53\u6C34\u6587\u6BD4\u4F8B\u8BC4\u4F30

\u5185\u5BB9\uFF1A
${content}` }],
        systemPrompt: "\u4F60\u662F\u4E00\u4E2A\u4E25\u683C\u7684\u7F51\u6587\u8D28\u68C0\u7F16\u8F91\uFF0C\u64C5\u957F\u8BC6\u522B\u6C34\u6587\u3001\u6CE8\u6C34\u5185\u5BB9\u3002\u8BF7\u9010\u6BB5\u5206\u6790\uFF0C\u6807\u8BB0\u51FA\u5197\u4F59\u548C\u65E0\u6548\u5185\u5BB9\uFF0C\u5E76\u7ED9\u51FA\u7CBE\u7B80\u5EFA\u8BAE\u3002"
      });
      return { success: true, text: result };
    }
  });
  Tools.register("novelide:generate_title", {
    description: "AI \u751F\u6210\u7206\u6B3E\u6807\u9898\uFF0C\u6839\u636E\u5185\u5BB9\u751F\u6210\u5438\u5F15\u8BFB\u8005\u7684\u6807\u9898",
    parameters: {
      type: "object",
      properties: {
        content: { type: "string", description: "\u7AE0\u8282\u6216\u4F5C\u54C1\u7684\u5185\u5BB9\u6458\u8981" },
        genre: { type: "string", description: "\u4F5C\u54C1\u7C7B\u578B\uFF08\u5982\uFF1A\u90FD\u5E02\u3001\u7384\u5E7B\u3001\u60AC\u7591\uFF09" },
        workId: { type: "string", description: "\u4F5C\u54C1ID" }
      },
      required: ["content"]
    },
    execute: async (params) => {
      const { content, genre = "", workId } = params;
      const genreHint = genre ? `\uFF0C\u4F5C\u54C1\u7C7B\u578B\u4E3A\u300C${genre}\u300D` : "";
      const result = await Tools.Chat({
        messages: [{ role: "user", content: `\u8BF7\u6839\u636E\u4EE5\u4E0B\u5185\u5BB9\u751F\u62105\u4E2A\u7206\u6B3E\u6807\u9898${genreHint}\uFF0C\u8981\u6C42\u5438\u5F15\u773C\u7403\u3001\u5F15\u53D1\u597D\u5947\u5FC3\u3001\u9002\u5408\u7F51\u6587\u5E73\u53F0\uFF1A
${content}` }],
        systemPrompt: "\u4F60\u662F\u4E00\u4E2A\u7F51\u6587\u6807\u9898\u7B56\u5212\u4E13\u5BB6\uFF0C\u64C5\u957F\u521B\u4F5C\u5438\u5F15\u8BFB\u8005\u70B9\u51FB\u7684\u7206\u6B3E\u6807\u9898\u3002\u8BF7\u751F\u6210\u6709\u51B2\u51FB\u529B\u3001\u60AC\u5FF5\u611F\u548C\u5438\u5F15\u529B\u7684\u6807\u9898\u3002"
      });
      return { success: true, text: result };
    }
  });
}

// src/packages/novel_io.ts
function registerTools5() {
  Tools.register("novelide:import_file", {
    description: "\u5BFC\u5165\u6587\u4EF6\uFF08\u652F\u6301 TXT/Markdown/JSON \u683C\u5F0F\uFF09",
    parameters: {
      type: "object",
      properties: {
        uri: { type: "string", description: "\u6587\u4EF6URI" },
        fileName: { type: "string", description: "\u6587\u4EF6\u540D" },
        workId: { type: "string", description: "\u76EE\u6807\u4F5C\u54C1ID\uFF08\u53EF\u9009\uFF09" }
      },
      required: ["uri", "fileName"]
    },
    execute: async (params) => {
      const { uri, fileName, workId } = params;
      const result = await Tools.callNative("importFile", [uri, fileName, workId || ""]);
      return { success: true, result: JSON.parse(result) };
    }
  });
  Tools.register("novelide:export_work_txt", {
    description: "\u5C06\u4F5C\u54C1\u5BFC\u51FA\u4E3A TXT \u683C\u5F0F",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "\u4F5C\u54C1ID" }
      },
      required: ["workId"]
    },
    execute: async (params) => {
      const { workId } = params;
      const result = await Tools.callNative("exportWorkTxt", [workId]);
      return { success: true, result: JSON.parse(result) };
    }
  });
  Tools.register("novelide:export_work_md", {
    description: "\u5C06\u4F5C\u54C1\u5BFC\u51FA\u4E3A Markdown \u683C\u5F0F",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "\u4F5C\u54C1ID" }
      },
      required: ["workId"]
    },
    execute: async (params) => {
      const { workId } = params;
      const result = await Tools.callNative("exportWorkMd", [workId]);
      return { success: true, result: JSON.parse(result) };
    }
  });
  Tools.register("novelide:export_work_json", {
    description: "\u5C06\u4F5C\u54C1\u5BFC\u51FA\u4E3A JSON \u683C\u5F0F",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "\u4F5C\u54C1ID" }
      },
      required: ["workId"]
    },
    execute: async (params) => {
      const { workId } = params;
      const result = await Tools.callNative("exportWorkJson", [workId]);
      return { success: true, result: JSON.parse(result) };
    }
  });
}

// src/packages/novel_stats.ts
function registerTools6() {
  Tools.register("novelide:get_writing_stats", {
    description: "\u83B7\u53D6\u5199\u4F5C\u7EDF\u8BA1\uFF08\u603B\u5B57\u6570\u3001\u4ECA\u65E5\u5B57\u6570\u3001\u8FDE\u7EED\u5929\u6570\u3001\u76EE\u6807\u5B8C\u6210\u5EA6\uFF09",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "\u4F5C\u54C1ID" }
      }
    },
    execute: async (params) => {
      const { workId } = params;
      const result = await Tools.callNative("getWritingStats", [workId || ""]);
      return { success: true, stats: JSON.parse(result) };
    }
  });
  Tools.register("novelide:get_chapter_stats", {
    description: "\u83B7\u53D6\u6307\u5B9A\u4F5C\u54C1\u7684\u7AE0\u8282\u7EDF\u8BA1\u4FE1\u606F",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "\u4F5C\u54C1ID" }
      },
      required: ["workId"]
    },
    execute: async (params) => {
      const { workId } = params;
      const result = await Tools.callNative("getChapterStats", [workId]);
      return { success: true, stats: JSON.parse(result) };
    }
  });
  Tools.register("novelide:get_daily_stats", {
    description: "\u83B7\u53D6\u6BCF\u65E5\u5199\u4F5C\u7EDF\u8BA1\u6570\u636E",
    parameters: {
      type: "object",
      properties: {
        workId: { type: "string", description: "\u4F5C\u54C1ID" },
        days: { type: "number", description: "\u67E5\u8BE2\u5929\u6570\uFF08\u9ED8\u8BA430\u5929\uFF09" }
      }
    },
    execute: async (params) => {
      const { workId = "", days = 30 } = params;
      const result = await Tools.callNative("getDailyStats", [workId, days]);
      return { success: true, stats: JSON.parse(result) };
    }
  });
}

// src/packages/novel_agents.ts
var AGENT_CONFIGS = {
  outline: {
    id: "outline",
    name: "\u5927\u7EB2\u751F\u6210\u5668",
    description: "\u751F\u6210\u7ED3\u6784\u6E05\u6670\u7684\u5927\u7EB2",
    systemPrompt: `\u4F60\u662F\u4E00\u4E2A\u4E13\u4E1A\u7684\u5927\u7EB2\u751F\u6210\u52A9\u624B\u3002\u8BF7\u6839\u636E\u7528\u6237\u63D0\u4F9B\u7684\u521B\u610F\u751F\u6210\u8BE6\u7EC6\u7684\u5C0F\u8BF4\u5927\u7EB2\u3002

\u5927\u7EB2\u5E94\u5305\u542B\uFF1A
1. \u6838\u5FC3\u8BBE\u5B9A\uFF08\u4E16\u754C\u89C2\u3001\u4E3B\u89D2\u3001\u91D1\u624B\u6307\uFF09
2. \u4E3B\u7EBF\u5267\u60C5\uFF08\u8D77\u627F\u8F6C\u5408\uFF09
3. \u4E3B\u8981\u914D\u89D2\u8BBE\u5B9A
4. \u5173\u952E\u8F6C\u6298\u70B9
5. \u723D\u70B9\u8BBE\u8BA1

\u8BF7\u4EE5\u7ED3\u6784\u5316\u7684\u683C\u5F0F\u8F93\u51FA\u3002`
  },
  character: {
    id: "character",
    name: "\u89D2\u8272\u8BBE\u8BA1\u5E08",
    description: "\u751F\u6210\u8BE6\u7EC6\u7684\u89D2\u8272\u8BBE\u5B9A\u5361",
    systemPrompt: `\u4F60\u662F\u4E00\u4E2A\u4E13\u4E1A\u7684\u89D2\u8272\u8BBE\u8BA1\u5E08\u3002\u8BF7\u6839\u636E\u7528\u6237\u63D0\u4F9B\u7684\u4FE1\u606F\u751F\u6210\u8BE6\u7EC6\u7684\u89D2\u8272\u8BBE\u5B9A\u5361\u3002

\u89D2\u8272\u5361\u5E94\u5305\u542B\uFF1A
1. \u57FA\u672C\u4FE1\u606F\uFF08\u59D3\u540D\u3001\u5E74\u9F84\u3001\u6027\u522B\u3001\u5916\u8C8C\uFF09
2. \u6027\u683C\u7279\u70B9\uFF08\u4F18\u70B9\u3001\u7F3A\u70B9\u3001\u53E3\u5934\u7985\uFF09
3. \u80CC\u666F\u6545\u4E8B
4. \u80FD\u529B/\u6280\u80FD
5. \u4EBA\u9645\u5173\u7CFB
6. \u6210\u957F\u5F27\u7EBF

\u8BF7\u4EE5 JSON \u683C\u5F0F\u8F93\u51FA\u3002`
  },
  pleasure: {
    id: "pleasure",
    name: "\u723D\u70B9\u68C0\u67E5\u5668",
    description: "\u5206\u6790\u723D\u70B9\u5BC6\u5EA6\u548C\u8282\u594F",
    systemPrompt: `\u4F60\u662F\u4E00\u4E2A\u7F51\u6587\u723D\u70B9\u5206\u6790\u4E13\u5BB6\u3002\u8BF7\u5206\u6790\u7528\u6237\u63D0\u4F9B\u7684\u6587\u672C\u7684\u723D\u70B9\u5206\u5E03\u3002

\u5206\u6790\u7EF4\u5EA6\uFF1A
1. \u723D\u70B9\u7C7B\u578B\uFF08\u6253\u8138/\u9006\u88AD/\u63ED\u79D8/\u5347\u7EA7\u7B49\uFF09
2. \u723D\u70B9\u5F3A\u5EA6\uFF081-5 \u5206\uFF09
3. \u723D\u70B9\u5BC6\u5EA6\uFF08\u6BCF\u5343\u5B57\u723D\u70B9\u6570\uFF09
4. \u8282\u594F\u628A\u63A7
5. \u6539\u8FDB\u5EFA\u8BAE

\u8BF7\u4EE5 JSON \u683C\u5F0F\u8F93\u51FA\u5206\u6790\u7ED3\u679C\u3002`
  },
  water: {
    id: "water",
    name: "\u6C34\u6587\u68C0\u6D4B\u5668",
    description: "\u68C0\u6D4B\u51D1\u5B57\u6570/\u91CD\u590D\u5185\u5BB9",
    systemPrompt: `\u4F60\u662F\u4E00\u4E2A\u7F51\u6587\u8D28\u91CF\u68C0\u6D4B\u4E13\u5BB6\u3002\u8BF7\u68C0\u6D4B\u7528\u6237\u63D0\u4F9B\u7684\u6587\u672C\u662F\u5426\u5B58\u5728"\u6C34\u6587"\u95EE\u9898\u3002

\u68C0\u6D4B\u7EF4\u5EA6\uFF1A
1. \u91CD\u590D\u5570\u55E6\u7684\u8868\u8FBE
2. \u65E0\u610F\u4E49\u7684\u586B\u5145\u8BCD
3. \u62D6\u6C93\u7684\u60C5\u8282
4. \u7F3A\u4E4F\u4FE1\u606F\u91CF\u7684\u6BB5\u843D
5. \u603B\u4F53\u8D28\u91CF\u8BC4\u5206

\u8BF7\u4EE5 JSON \u683C\u5F0F\u8F93\u51FA\u68C0\u6D4B\u7ED3\u679C\u548C\u4FEE\u6539\u5EFA\u8BAE\u3002`
  },
  title: {
    id: "title",
    name: "\u7206\u6B3E\u6807\u9898\u5668",
    description: "\u751F\u6210\u6709\u60AC\u5FF5\u611F\u7684\u6807\u9898",
    systemPrompt: `\u4F60\u662F\u4E00\u4E2A\u7206\u6B3E\u6807\u9898\u751F\u6210\u4E13\u5BB6\u3002\u8BF7\u6839\u636E\u7528\u6237\u63D0\u4F9B\u7684\u5185\u5BB9\u751F\u6210\u5438\u5F15\u4EBA\u7684\u6807\u9898\u3002

\u8981\u6C42\uFF1A
1. \u6709\u60AC\u5FF5\u611F
2. \u7B26\u5408\u7F51\u6587\u98CE\u683C
3. \u7A81\u51FA\u6838\u5FC3\u5356\u70B9
4. 10-20 \u5B57\u4EE5\u5185

\u8BF7\u751F\u6210 5 \u4E2A\u5907\u9009\u6807\u9898\uFF0C\u5E76\u8BF4\u660E\u6BCF\u4E2A\u6807\u9898\u7684\u5356\u70B9\u3002`
  },
  deai: {
    id: "deai",
    name: "\u53BBAI\u5473\u5904\u7406\u5668",
    description: "\u6D88\u9664AI\u673A\u68B0\u611F",
    systemPrompt: `\u4F60\u662F\u4E00\u4E2A\u6587\u672C\u6539\u5199\u4E13\u5BB6\u3002\u8BF7\u5BF9\u7528\u6237\u63D0\u4F9B\u7684\u6587\u672C\u8FDB\u884C\u6539\u5199\uFF0C\u53BB\u9664 AI \u751F\u6210\u7684\u75D5\u8FF9\u3002

\u6539\u5199\u8981\u6C42\uFF1A
1. \u4F7F\u7528\u66F4\u81EA\u7136\u7684\u8868\u8FBE
2. \u589E\u52A0\u53E3\u8BED\u5316\u8868\u8FBE
3. \u907F\u514D\u8FC7\u4E8E\u5DE5\u6574\u7684\u53E5\u5F0F
4. \u52A0\u5165\u4E2A\u6027\u5316\u8868\u8FBE
5. \u4FDD\u6301\u539F\u610F\u4E0D\u53D8

\u8BF7\u76F4\u63A5\u8F93\u51FA\u6539\u5199\u540E\u7684\u6587\u672C\u3002`
  },
  polish: {
    id: "polish",
    name: "\u6587\u672C\u7CBE\u4FEE\u5668",
    description: "8\u7EF4\u5EA6\u7CBE\u4FEE\u6587\u672C",
    systemPrompt: `\u4F60\u662F\u4E00\u4E2A\u4E13\u4E1A\u7684\u6587\u672C\u7CBE\u4FEE\u4E13\u5BB6\u3002\u8BF7\u4ECE\u4EE5\u4E0B 8 \u4E2A\u7EF4\u5EA6\u5BF9\u7528\u6237\u63D0\u4F9B\u7684\u6587\u672C\u8FDB\u884C\u7CBE\u4FEE\uFF1A

1. \u8BED\u8A00\u6D41\u7545\u5EA6
2. \u903B\u8F91\u8FDE\u8D2F\u6027
3. \u7EC6\u8282\u4E30\u5BCC\u5EA6
4. \u60C5\u611F\u8868\u8FBE\u529B
5. \u573A\u666F\u753B\u9762\u611F
6. \u4EBA\u7269\u5851\u9020
7. \u8282\u594F\u628A\u63A7
8. \u6587\u5B66\u6027

\u8BF7\u8F93\u51FA\u7CBE\u4FEE\u540E\u7684\u6587\u672C\uFF0C\u5E76\u8BF4\u660E\u4E3B\u8981\u4FEE\u6539\u70B9\u3002`
  }
};
var NovelAgentDispatcher = class {
  /**
   * 调用子 Agent
   */
  static async dispatch(agentId, task, context) {
    const agent = AGENT_CONFIGS[agentId];
    if (!agent) {
      throw new Error(`\u672A\u77E5\u7684 Agent: ${agentId}`);
    }
    let fullPrompt = task;
    if (context == null ? void 0 : context.workTitle) {
      fullPrompt = `\u4F5C\u54C1\uFF1A${context.workTitle}
${fullPrompt}`;
    }
    if (context == null ? void 0 : context.chapterTitle) {
      fullPrompt = `\u7AE0\u8282\uFF1A${context.chapterTitle}
${fullPrompt}`;
    }
    const result = await Tools.Chat({
      messages: [{ role: "user", content: fullPrompt }],
      systemPrompt: agent.systemPrompt
    });
    return result;
  }
  /**
   * 获取所有 Agent 列表
   */
  static getAgents() {
    return Object.values(AGENT_CONFIGS).map((agent) => ({
      id: agent.id,
      name: agent.name,
      description: agent.description
    }));
  }
};
function registerTools7() {
  Tools.register("novelide:dispatch_subagent", {
    description: "\u8C03\u7528\u5B50 Agent \u5904\u7406\u4EFB\u52A1",
    parameters: {
      type: "object",
      properties: {
        agentId: {
          type: "string",
          description: "Agent ID\uFF08outline/character/pleasure/water/title/deai/polish\uFF09"
        },
        task: { type: "string", description: "\u4EFB\u52A1\u63CF\u8FF0" },
        workId: { type: "string", description: "\u4F5C\u54C1ID\uFF08\u53EF\u9009\uFF09" }
      },
      required: ["agentId", "task"]
    },
    execute: async (params) => {
      const { agentId, task, workId } = params;
      const context = {};
      if (workId) {
        try {
          const works = JSON.parse(await Tools.callNative("getNovelWorks", []));
          const work = works.find((w) => w.id === workId);
          if (work) {
            context.workTitle = work.title;
          }
        } catch (e) {
        }
      }
      const result = await NovelAgentDispatcher.dispatch(agentId, task, context);
      return { success: true, result };
    }
  });
  Tools.register("novelide:review_chapter", {
    description: "AI \u5BA1\u6838\u7AE0\u8282\u8D28\u91CF",
    parameters: {
      type: "object",
      properties: {
        chapterId: { type: "string", description: "\u7AE0\u8282ID" },
        workId: { type: "string", description: "\u4F5C\u54C1ID" }
      },
      required: ["chapterId"]
    },
    execute: async (params) => {
      const { chapterId, workId } = params;
      const content = await Tools.callNative("getChapterContent", [chapterId]);
      const [pleasureResult, waterResult, polishResult] = await Promise.all([
        NovelAgentDispatcher.dispatch("pleasure", content),
        NovelAgentDispatcher.dispatch("water", content),
        NovelAgentDispatcher.dispatch("polish", content)
      ]);
      return {
        success: true,
        review: {
          pleasure: JSON.parse(pleasureResult),
          water: JSON.parse(waterResult),
          polish: polishResult
        }
      };
    }
  });
}

// src/main.ts
var NOVEL_BASE_ROUTE = "toolpkg:com.operit.novelide:ui";
function registerToolPkg() {
  ToolPkg.registerNavigationEntry({
    id: "novel_works_sidebar",
    route: `${NOVEL_BASE_ROUTE}:novel_works`,
    surface: "main_sidebar_plugins",
    title: { zh: "\u6211\u7684\u4F5C\u54C1", en: "My Works" },
    icon: Icons.Book,
    order: 120
  });
  ToolPkg.registerNavigationEntry({
    id: "novel_editor_sidebar",
    route: `${NOVEL_BASE_ROUTE}:novel_editor`,
    surface: "main_sidebar_plugins",
    title: { zh: "\u5199\u4F5C\u7F16\u8F91\u5668", en: "Novel Editor" },
    icon: Icons.Edit,
    order: 130
  });
  ToolPkg.registerNavigationEntry({
    id: "novel_materials_sidebar",
    route: `${NOVEL_BASE_ROUTE}:novel_materials`,
    surface: "main_sidebar_plugins",
    title: { zh: "\u8D44\u6599\u7BA1\u7406", en: "Materials" },
    icon: Icons.FolderSpecial,
    order: 140
  });
  ToolPkg.registerNavigationEntry({
    id: "novel_outline_sidebar",
    route: `${NOVEL_BASE_ROUTE}:novel_outline`,
    surface: "main_sidebar_plugins",
    title: { zh: "\u5927\u7EB2\u7BA1\u7406", en: "Outline" },
    icon: Icons.List,
    order: 150
  });
  ToolPkg.registerNavigationEntry({
    id: "novel_stats_sidebar",
    route: `${NOVEL_BASE_ROUTE}:novel_stats`,
    surface: "main_sidebar_plugins",
    title: { zh: "\u5199\u4F5C\u7EDF\u8BA1", en: "Statistics" },
    icon: Icons.BarChart,
    order: 160
  });
  ToolPkg.registerNavigationEntry({
    id: "novel_tools_sidebar",
    route: `${NOVEL_BASE_ROUTE}:novel_tools`,
    surface: "main_sidebar_plugins",
    title: { zh: "\u5199\u4F5C\u5DE5\u5177", en: "Tools" },
    icon: Icons.AutoFixHigh,
    order: 170
  });
  ToolPkg.registerNavigationEntry({
    id: "novel_workspace_sidebar",
    route: `${NOVEL_BASE_ROUTE}:novel_workspace`,
    surface: "main_sidebar_plugins",
    title: { zh: "\u5DE5\u4F5C\u533A", en: "Workspace" },
    icon: Icons.Workspaces,
    order: 180
  });
  ToolPkg.registerUiRoute({
    id: "novel_works",
    route: `${NOVEL_BASE_ROUTE}:novel_works`,
    runtime: "compose_dsl",
    screen: Screen,
    params: {},
    title: { zh: "\u6211\u7684\u4F5C\u54C1", en: "My Works" }
  });
  ToolPkg.registerUiRoute({
    id: "novel_editor",
    route: `${NOVEL_BASE_ROUTE}:novel_editor`,
    runtime: "compose_dsl",
    screen: Screen2,
    params: { workId: "string" },
    title: { zh: "\u5199\u4F5C\u7F16\u8F91\u5668", en: "Novel Editor" }
  });
  ToolPkg.registerUiRoute({
    id: "novel_materials",
    route: `${NOVEL_BASE_ROUTE}:novel_materials`,
    runtime: "compose_dsl",
    screen: Screen3,
    params: { workId: "string" },
    title: { zh: "\u8D44\u6599\u7BA1\u7406", en: "Materials" }
  });
  ToolPkg.registerUiRoute({
    id: "novel_outline",
    route: `${NOVEL_BASE_ROUTE}:novel_outline`,
    runtime: "compose_dsl",
    screen: Screen4,
    params: { workId: "string" },
    title: { zh: "\u5927\u7EB2\u7BA1\u7406", en: "Outline" }
  });
  ToolPkg.registerUiRoute({
    id: "novel_stats",
    route: `${NOVEL_BASE_ROUTE}:novel_stats`,
    runtime: "compose_dsl",
    screen: Screen5,
    params: {},
    title: { zh: "\u5199\u4F5C\u7EDF\u8BA1", en: "Statistics" }
  });
  ToolPkg.registerUiRoute({
    id: "novel_tools",
    route: `${NOVEL_BASE_ROUTE}:novel_tools`,
    runtime: "compose_dsl",
    screen: Screen6,
    params: {},
    title: { zh: "\u5199\u4F5C\u5DE5\u5177", en: "Tools" }
  });
  ToolPkg.registerUiRoute({
    id: "novel_workspace",
    route: `${NOVEL_BASE_ROUTE}:novel_workspace`,
    runtime: "compose_dsl",
    screen: Screen7,
    params: {},
    title: { zh: "\u5DE5\u4F5C\u533A", en: "Workspace" }
  });
  registerTools();
  registerTools2();
  registerTools3();
  registerTools4();
  registerTools5();
  registerTools6();
  registerTools7();
  return true;
}
