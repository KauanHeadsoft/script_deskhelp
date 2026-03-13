// ==UserScript==
// @name         Headsoft Suporte Modern UI
// @namespace    headsoft.suporte.modern
// @version      2.17.00
// @description  Bootstrap do Headsoft Suporte Modern UI
// @author       Codex
// @match        https://suporte.headsoft.com.br/*
// @match        http://suporte.headsoft.com.br/*
// @homepageURL  https://github.com/KauanHeadsoft/script_deskhelp
// @updateURL    https://raw.githubusercontent.com/KauanHeadsoft/script_deskhelp/main/.user.js
// @downloadURL  https://raw.githubusercontent.com/KauanHeadsoft/script_deskhelp/main/.user.js
// @run-at       document-start
// @grant        none
// ==/UserScript==

(() => {
  const SCRIPT_VERSION_FALLBACK = "2.17.00";
  const SCRIPT_VERSION =
    String(
      (typeof GM_info !== "undefined" && GM_info?.script?.version) || SCRIPT_VERSION_FALLBACK
    ).trim() || SCRIPT_VERSION_FALLBACK;
  const API_NAME = "HSHeadsoftBootstrap";
  const MODULES = Object.freeze([
    {
      key: "user1",
      id: "hs2025-user1-remote-loader",
      url: "https://raw.githubusercontent.com/KauanHeadsoft/script_deskhelp/main/.user.core.js",
      readyGlobal: "HSHeadsoftUser1",
      version: "2.17.00",
    },
    {
      key: "user2",
      id: "hs2025-user2-remote-loader",
      url: "https://raw.githubusercontent.com/KauanHeadsoft/script_deskhelp/main/.user2.js",
      readyGlobal: "HSHeadsoftUser2",
      version: "3.01.02",
    },
  ]);

  function buildVersionedUrl(module, extra = "") {
    const params = new URLSearchParams();
    params.set("bootstrapVersion", SCRIPT_VERSION);
    params.set("moduleVersion", String(module?.version || SCRIPT_VERSION));
    if (extra) params.set("r", extra);
    return `${module.url}?${params.toString()}`;
  }

  function isModuleReady(module) {
    try {
      const api = window?.[module?.readyGlobal];
      return !!(api && typeof api === "object");
    } catch {
      return false;
    }
  }

  function injectModule(module, options = {}) {
    if (!module?.url || !module?.id) return false;
    const forceReload = options.forceReload === true;
    if (isModuleReady(module) && !forceReload) return true;

    let script = document.getElementById(module.id);
    if (script && !forceReload) return false;
    if (script) script.remove();

    script = document.createElement("script");
    script.id = module.id;
    script.async = false;
    script.src = buildVersionedUrl(module, forceReload ? String(Date.now()) : "cached");
    (document.head || document.documentElement || document.body)?.appendChild(script);
    return false;
  }

  function loadAllModules(options = {}) {
    MODULES.forEach((module) => injectModule(module, options));
  }

  const api = window[API_NAME] || {};
  api.version = SCRIPT_VERSION;
  api.modules = MODULES.map(({ key, url, readyGlobal, version }) => ({ key, url, readyGlobal, version }));
  api.loadRemoteModule = (key, options = {}) => {
    const module = MODULES.find((item) => item.key === key);
    if (!module) return false;
    return injectModule(module, options);
  };
  api.loadAllRemoteModules = loadAllModules;
  api.getBootstrapVersionInfo = () => ({
    version: SCRIPT_VERSION,
    source: ".user.js",
    modules: api.modules,
  });
  window[API_NAME] = api;

  loadAllModules();
})();
