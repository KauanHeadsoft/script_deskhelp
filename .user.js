// ==UserScript==
// @name         Headsoft Suporte Modern UI
// @namespace    headsoft.suporte.modern
// @version      2.15.94
// @description  Modernizacao visual + tema + filtros + contadores + atalhos de atendimento
// @author       Codex
// @match        https://suporte.headsoft.com.br/*
// @match        http://suporte.headsoft.com.br/*
// @homepageURL  https://github.com/KauanHeadsoft/script_deskhelp
// @updateURL    https://raw.githubusercontent.com/KauanHeadsoft/script_deskhelp/main/.user.js
// @downloadURL  https://raw.githubusercontent.com/KauanHeadsoft/script_deskhelp/main/.user.js
// @run-at       document-start
// @grant        none
// ==/UserScript==

// HeadSoft UI â€” tema, logo, filtros, cores, zebrado, contadores,
// abrir em nova guia (clique do meio) e 1o atendimento no clique da logo
// Regras de manutencao do projeto:
// - Arquivos oficiais: .user.js (principal) e updates-log.json.
// - Sempre que atualizar o .user.js, atualizar o updates-log.json com as informacoes da mudanca.
// - Toda atualizacao/alteracao deve incrementar @version para todos receberem o update.
// - A distribuicao atual e em arquivo unico, entao toda mudanca funcional deve sair no .user.js.

(() => {
  const BTN_ID = "hs2025-theme-btn";
  const LS_KEY = "hs2025-theme";
  const STYLE_ID = "hs2025-style";
  const BADGE_ID = "hsx-modern-badge";
  const NEW_LOGO =
    "https://headsoft.com.br/wp-content/uploads/2023/10/logo-PhotoRoom-1.png-PhotoRoom-1-1-768x768.png";

  const SITUACAO_RX = /situac|situa[cÃ§][aÃ£]o/i;
  const NOVA_RX = /^ *nova\b/i;
  const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
  const FREE_AI_API_URL = "https://text.pollinations.ai/openai";
  const OPENAI_API_KEY_LS = "hs2025-openai-api-key";
  const AI_MODE_LS = "hs2025-ai-mode";
  const AI_MODE_FREE_GEMINI = "free_gemini";
  const AI_MODE_PAID_OPENAI = "paid_openai";
  const AUTO_CONCLUIR_KEY = "hs2025-auto-concluir-pending";
  const AUTO_CONCLUIR_TRIES_KEY = "hs2025-auto-concluir-tries";
  const LOGIN_REMEMBER_KEY = "hs2025-login-remember";
  const REQ_OPEN_DEBUG_LS_KEY = "hs2025-req-open-debug";
  const REQ_OPEN_DEBUG_QUERY = "hsdebugopen";
  const REQ_POPUP_PREVIEW_QUERY_KEY = "hs_preview_popup";
  const TEXT_PREVIEW_BRIDGE_QUERY_KEY = "hs_text_preview";
  const TEXT_PREVIEW_BRIDGE_ID_QUERY_KEY = "hs_text_preview_id";
  const TEXT_PREVIEW_BRIDGE_STORAGE_KEY_PREFIX = "hs2025-text-preview-bridge:";
  const TEXT_PREVIEW_BRIDGE_STORAGE_TTL_MS = 2 * 60 * 1000;
  const REQ_OPEN_LOG_LIMIT = 320;
  const PREVIEW_ONLY_MODE_DEFAULT = true;
  const PREVIEW_ONLY_MODE_LS_KEY = "hs2025-preview-only-mode";
  const CONSULTA_PRO_LAYOUT_DEFAULT = false;
  const CONSULTA_PRO_LAYOUT_LS_KEY = "hs2025-consulta-pro-layout";
  const ATTACH_IMAGE_PREVIEW_DEFAULT = true;
  const ATTACH_IMAGE_PREVIEW_LS_KEY = "hs2025-attach-image-preview";
  const ATTACH_TEXT_PREVIEW_DEFAULT = true;
  const ATTACH_TEXT_PREVIEW_LS_KEY = "hs2025-attach-text-preview";
  const DASHBOARD_EM_SERVICO_SECTION_DEFAULT = true;
  const DASHBOARD_EM_SERVICO_SECTION_LS_KEY = "hs2025-dashboard-em-servico-section";
  const USERS_PAGE_FILTERS_LS_KEY = "hs2025-users-page-filters-v1";
  const ACOMP_TEXTAREA_SIZE_LS_KEY = "hs2025-acomp-textarea-size";
  const HIDE_SUGGESTION_FILTER_DEFAULT = true;
  const HIDE_SUGGESTION_FILTER_LS_KEY = "hs2025-hide-suggestion-filter";
  const APPEARANCE_SETTINGS_LS_KEY = "hs2025-appearance-settings";
  const APPEARANCE_SETTINGS_LIGHT_LS_KEY = "hs2025-appearance-settings-light";
  const APPEARANCE_SETTINGS_DARK_LS_KEY = "hs2025-appearance-settings-dark";
  const SITUACAO_COLORS_LIGHT_LS_KEY = "hs2025-situacao-colors-light";
  const SITUACAO_COLORS_DARK_LS_KEY = "hs2025-situacao-colors-dark";
  const SITUACAO_COLOR_LOG_PREFIX = "[HeadsoftHelper][situacao-colors]";
  const USER2_SETTINGS_API_GLOBAL = "HSHeadsoftUser2";
  const APPEARANCE_WALLPAPER_OPACITY_DEFAULT = 0.06;
  const APPEARANCE_WALLPAPER_OPACITY_MIN = 0;
  const APPEARANCE_WALLPAPER_OPACITY_MAX = 0.18;
  const APPEARANCE_BORDER_RADIUS_DEFAULT = 9;
  const APPEARANCE_BORDER_RADIUS_MIN = 0;
  const APPEARANCE_BORDER_RADIUS_MAX = 18;
  const APPEARANCE_BORDER_WIDTH_DEFAULT = 1;
  const APPEARANCE_BORDER_WIDTH_MIN = 1;
  const APPEARANCE_BORDER_WIDTH_MAX = 4;
  const APPEARANCE_DASHBOARD_GRID_WIDTH_MIN = 920;
  const APPEARANCE_DASHBOARD_GRID_WIDTH_MAX = 2600;
  const APPEARANCE_GRID_TONE_DEFAULT = "soft";
  const APPEARANCE_GRID_TONE_OPTIONS = Object.freeze(["soft", "balanced", "contrast"]);
  const APPEARANCE_GRID_DENSITY_DEFAULT = "comfortable";
  const APPEARANCE_GRID_DENSITY_OPTIONS = Object.freeze(["compact", "comfortable", "airy"]);
  const APPEARANCE_GRID_HOVER_DEFAULT = "soft";
  const APPEARANCE_GRID_HOVER_OPTIONS = Object.freeze(["off", "soft", "focus"]);
  const EARLY_THEME_STYLE_ID = "hs2025-early-theme-style";
  const APPEARANCE_DEFAULTS = Object.freeze({
    fontFamily: "default",
    wallpaperUrl: "",
    wallpaperOpacity: APPEARANCE_WALLPAPER_OPACITY_DEFAULT,
    bgColor: "",
    textColor: "",
    accentColor: "",
    borderShape: "rounded",
    borderRadius: APPEARANCE_BORDER_RADIUS_DEFAULT,
    borderWidth: APPEARANCE_BORDER_WIDTH_DEFAULT,
    dashboardGridWidth: 0,
    dashboardGridTone: APPEARANCE_GRID_TONE_DEFAULT,
    dashboardGridDensity: APPEARANCE_GRID_DENSITY_DEFAULT,
    dashboardGridHover: APPEARANCE_GRID_HOVER_DEFAULT,
  });
  const APPEARANCE_FONT_MAP = Object.freeze({
    default: "'Segoe UI', Tahoma, sans-serif",
    segoe: "'Segoe UI', Tahoma, sans-serif",
    trebuchet: "'Trebuchet MS', 'Segoe UI', sans-serif",
    verdana: "Verdana, 'Segoe UI', sans-serif",
    georgia: "Georgia, 'Times New Roman', serif",
    lucida: "'Lucida Sans Unicode', 'Lucida Grande', sans-serif",
    monospace: "'Consolas', 'Courier New', monospace",
  });
  const SCRIPT_VERSION_FALLBACK = "2.15.94";
  const SCRIPT_VERSION =
    String(
      (typeof GM_info !== "undefined" && GM_info?.script?.version) || SCRIPT_VERSION_FALLBACK
    ).trim() || SCRIPT_VERSION_FALLBACK;
  const UPDATES_LOG_REMOTE_URL =
    "https://raw.githubusercontent.com/KauanHeadsoft/script_deskhelp/main/updates-log.json";
  const UPDATES_LOG_CACHE_JSON_LS_KEY = "hs2025-updates-log-json";
  const UPDATES_LOG_CACHE_AT_LS_KEY = "hs2025-updates-log-at";
  const UPDATES_LOG_CACHE_MS = 3 * 60 * 1000;
  const UPDATE_LOG_HISTORY_LS_KEY = "hs2025-updates-history";
  const UPDATE_LOG_RULES = Object.freeze([
    "Regra 1: nunca remover entradas antigas do campo de atualizacoes.",
    "Regra 2: toda nova versao deve adicionar uma entrada no RECENT_UPDATES.",
    "Regra 3: manter notas objetivas do que mudou em cada versao.",
    "Regra 4: para correcao obrigatoria, preencher type='bugfix' e mandatory=true.",
    "Regra 5: a distribuicao atual e em arquivo unico; toda mudanca funcional precisa sair em nova versao do .user.js.",
  ]);
  const THEME_LABEL_WHEN_DARK = "Modo Claro";
  const THEME_LABEL_WHEN_LIGHT = "Modo Escuro";
  const SCRIPT_REPO_URL = "https://github.com/KauanHeadsoft/script_deskhelp";
  // Sempre revalida no carregamento da pagina para avisar atualizacoes rapidamente.
  const UPDATE_CHECK_INTERVAL_MS = 0;
  const UPDATE_CHECK_LAST_AT_LS_KEY = "hs2025-update-last-check-at";
  const UPDATE_CHECK_REMOTE_VERSION_LS_KEY = "hs2025-update-remote-version";
  const UPDATE_CHECK_REMOTE_URL_LS_KEY = "hs2025-update-remote-url";
  const UPDATE_CHECK_HAS_UPDATE_LS_KEY = "hs2025-update-has-update";
  const UPDATE_CHECK_MANDATORY_LS_KEY = "hs2025-update-mandatory";
  const UPDATE_CHECK_MANDATORY_VERSION_LS_KEY = "hs2025-update-mandatory-version";
  const UPDATE_CHECK_MANDATORY_REASON_LS_KEY = "hs2025-update-mandatory-reason";
  const UPDATE_INSTALL_BRIDGE_BASE_URL = "https://www.tampermonkey.net/script_installation.php#url=";
  const MANUAL_UPDATE_SOURCE_URL = "https://raw.githubusercontent.com/KauanHeadsoft/script_deskhelp/main/.user.js";
  const MANUAL_UPDATE_GITHUB_RAW_URL = "https://github.com/KauanHeadsoft/script_deskhelp/raw/main/.user.js";
  const MANUAL_UPDATE_GITHUB_FILE_URL = "https://github.com/KauanHeadsoft/script_deskhelp/blob/main/.user.js";
  const VERSION_CATALOG_CACHE_LS_KEY = "hs2025-version-catalog-json";
  const VERSION_CATALOG_CACHE_AT_LS_KEY = "hs2025-version-catalog-at";
  const VERSION_CATALOG_CACHE_MS = 6 * 60 * 60 * 1000;
  const VERSION_CATALOG_MAX_ITEMS = 12;
  const LATEST_COMMIT_META_CACHE_JSON_LS_KEY = "hs2025-latest-commit-meta-json";
  const LATEST_COMMIT_META_CACHE_AT_LS_KEY = "hs2025-latest-commit-meta-at";
  const LATEST_COMMIT_META_CACHE_MS = 20 * 60 * 1000;
  const LATEST_MAIN_COMMIT_API_URL = "https://api.github.com/repos/KauanHeadsoft/script_deskhelp/commits/main";
  const VERSION_CATALOG_COMMITS_API_URL =
    "https://api.github.com/repos/KauanHeadsoft/script_deskhelp/commits?path=.user.js&per_page=35";
  const UPDATE_SCRIPT_CANDIDATE_URLS = Object.freeze([
    MANUAL_UPDATE_SOURCE_URL,
    "https://raw.githubusercontent.com/KauanHeadsoft/script_deskhelp/refs/heads/main/.user.js",
    "https://raw.githubusercontent.com/KauanHeadsoft/script_deskhelp/master/.user.js",
    "https://raw.githubusercontent.com/KauanHeadsoft/script_deskhelp/refs/heads/master/.user.js",
    "https://cdn.jsdelivr.net/gh/KauanHeadsoft/script_deskhelp@main/.user.js",
  ]);
  const AJAX_REFRESH_INTERVAL_MS = 18000;
  const AJAX_REFRESH_TOAST_COOLDOWN_MS = 7000;
  const ROW_ALERT_BLINK_MS = 12000;
  const ROW_ALERT_TTL_MS = 45 * 60 * 1000;
  const ROW_ALERT_PERSIST_LS_KEY = "hs2025-row-alert-persist-v1";
  const ROW_ALERT_PERSIST_TTL_MS = 15 * 24 * 60 * 60 * 1000;
  const ROW_ALERT_PERSIST_MAX_ITEMS = 700;
  const SAFE_RUN_MUTATION_DEBOUNCE_MS = 480;
  const FEATURE_FLAGS = Object.freeze({
    ENABLE_AI_ASSIST: true,
    ENABLE_POPUP_VIEWER: true,
    ENABLE_AUTO_CONCLUIR: true,
    ENABLE_AJAX_REFRESH: true,
    ENABLE_DEBUG_SELF_CHECK: false,
  });
  /**
   * Objetivo: Aplica tema/base visual o mais cedo possivel para reduzir "flash" do layout legado.
   *
   * Contexto: executado no bootstrap (document-start) antes da injecao do CSS completo.
   * Parametros: nenhum.
   * Retorno: void.
   */
  function bootstrapEarlyThemePaint() {
    const html = document.documentElement;
    if (!(html instanceof HTMLElement)) return;

    const clamp = (value, min, max) => {
      const n = Number(value);
      if (!Number.isFinite(n)) return min;
      return Math.min(max, Math.max(min, n));
    };
    const normalizeHex = (value, fallback = "") => {
      const raw = String(value || "").trim();
      const short = raw.match(/^#([0-9a-f]{3})$/i);
      if (short) {
        const [r, g, b] = short[1].split("");
        return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
      }
      const full = raw.match(/^#([0-9a-f]{6})$/i);
      if (full) return `#${full[1]}`.toUpperCase();
      return String(fallback || "").trim();
    };
    const sanitizeWallpaper = (value) => {
      const raw = String(value || "").trim();
      if (!raw) return "";
      try {
        const u = new URL(raw, location.href);
        return /^https?:$/i.test(u.protocol) ? u.toString() : "";
      } catch {
        return "";
      }
    };

    let mode = "dark";
    try {
      const stored = String(localStorage.getItem(LS_KEY) || "").trim().toLowerCase();
      if (stored === "light" || stored === "dark") mode = stored;
      else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) mode = "dark";
      else mode = "light";
    } catch {
      mode =
        window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    }
    html.setAttribute("data-hs-theme", mode);
    let popupPreviewMode = false;
    try {
      const rawPreviewMode = String(new URLSearchParams(location.search).get(REQ_POPUP_PREVIEW_QUERY_KEY) || "")
        .trim()
        .toLowerCase();
      popupPreviewMode = rawPreviewMode === "1" || rawPreviewMode === "true" || rawPreviewMode === "yes";
    } catch {}
    if (popupPreviewMode) html.setAttribute("data-hs-popup-preview", "1");
    else html.removeAttribute("data-hs-popup-preview");

    const defaults =
      mode === "light"
        ? { bg: "#FFFFFF", fg: "#0F172A", accent: "#1F5FB4" }
        : { bg: "#0E141D", fg: "#DCE6F2", accent: "#3A6FAE" };

    let appearance = null;
    try {
      const scopedKey = mode === "light" ? APPEARANCE_SETTINGS_LIGHT_LS_KEY : APPEARANCE_SETTINGS_DARK_LS_KEY;
      const scopedRaw = String(localStorage.getItem(scopedKey) || "").trim();
      const legacyRaw = String(localStorage.getItem(APPEARANCE_SETTINGS_LS_KEY) || "").trim();
      const raw = scopedRaw || legacyRaw;
      if (raw) appearance = normalizeAppearanceSettings(JSON.parse(raw));
    } catch {
      appearance = null;
    }

    const fontKey = String(appearance?.fontFamily || APPEARANCE_DEFAULTS.fontFamily)
      .trim()
      .toLowerCase();
    const fontCss = APPEARANCE_FONT_MAP[fontKey] || APPEARANCE_FONT_MAP.default;
    const bg = normalizeHex(appearance?.bgColor, defaults.bg) || defaults.bg;
    const fg = normalizeHex(appearance?.textColor, defaults.fg) || defaults.fg;
    const accent = normalizeHex(appearance?.accentColor, defaults.accent) || defaults.accent;
    const panel = mixHexColors(bg, fg, mode === "light" ? 0.04 : 0.08);
    const panel2 = mixHexColors(bg, fg, mode === "light" ? 0.08 : 0.13);
    const border = mixHexColors(bg, fg, mode === "light" ? 0.18 : 0.24);
    const chipBg = mixHexColors(panel2, bg, mode === "light" ? 0.54 : 0.38);
    const neutral = mixHexColors(fg, bg, mode === "light" ? 0.06 : 0.09);
    const link = mixHexColors(accent, fg, mode === "light" ? 0.2 : 0.38);
    const linkHover = mixHexColors(accent, fg, mode === "light" ? 0.34 : 0.56);
    const gridAppearance = buildDashboardGridAppearanceTokens({
      ...(appearance || {}),
      mode,
      bg,
      fg,
      accent,
      panel,
      panel2,
    });
    const wallpaperUrl = sanitizeWallpaper(appearance?.wallpaperUrl || "");
    const wallpaperOpacityRaw = Number(appearance?.wallpaperOpacity);
    const wallpaperOpacity = Number.isFinite(wallpaperOpacityRaw)
      ? clamp(
          wallpaperOpacityRaw,
          APPEARANCE_WALLPAPER_OPACITY_MIN,
          APPEARANCE_WALLPAPER_OPACITY_MAX
        )
      : APPEARANCE_WALLPAPER_OPACITY_DEFAULT;
    const overlayAlpha = clamp(1 - wallpaperOpacity, 0.82, 1);

    const borderShape = String(appearance?.borderShape || "rounded").trim().toLowerCase() === "square" ? "square" : "rounded";
    const borderRadiusBase =
      borderShape === "square"
        ? 0
        : Math.round(
            clamp(
              Number.isFinite(Number(appearance?.borderRadius))
                ? Number(appearance?.borderRadius)
                : APPEARANCE_BORDER_RADIUS_DEFAULT,
              APPEARANCE_BORDER_RADIUS_MIN,
              APPEARANCE_BORDER_RADIUS_MAX
            )
          );
    const borderWidth = Math.round(
      clamp(
        Number.isFinite(Number(appearance?.borderWidth))
          ? Number(appearance?.borderWidth)
          : APPEARANCE_BORDER_WIDTH_DEFAULT,
        APPEARANCE_BORDER_WIDTH_MIN,
        APPEARANCE_BORDER_WIDTH_MAX
      )
    );
    const gridWidthRaw = Number(appearance?.dashboardGridWidth);
    const dashboardGridWidth =
      Number.isFinite(gridWidthRaw) && gridWidthRaw >= APPEARANCE_DASHBOARD_GRID_WIDTH_MIN
        ? Math.round(clamp(gridWidthRaw, APPEARANCE_DASHBOARD_GRID_WIDTH_MIN, APPEARANCE_DASHBOARD_GRID_WIDTH_MAX))
        : 0;

    html.style.setProperty("--bg", bg);
    html.setAttribute("data-hs-corner", borderShape === "square" ? "square" : "rounded");
    html.style.setProperty("--fg", fg);
    html.style.setProperty("--panel", panel);
    html.style.setProperty("--panel2", panel2);
    html.style.setProperty("--border", border);
    html.style.setProperty("--chip-bg", chipBg);
    html.style.setProperty("--neutral", neutral);
    html.style.setProperty("--accent", accent);
    html.style.setProperty("--link", link);
    html.style.setProperty("--link-hover", linkHover);
    html.style.setProperty("--hs-body-font", fontCss);
    html.style.setProperty(
      "--hs-wallpaper-image",
      wallpaperUrl ? `url("${String(wallpaperUrl).replace(/[\\"]/g, "\\$&")}")` : "none"
    );
    html.style.setProperty("--hs-wallpaper-overlay", `rgba(${parseInt(bg.slice(1, 3), 16)},${parseInt(bg.slice(3, 5), 16)},${parseInt(bg.slice(5, 7), 16)},${overlayAlpha.toFixed(3)})`);
    html.style.setProperty("--hs-border-width", `${Math.max(1, borderWidth)}px`);
    html.style.setProperty("--hs-radius-control", `${Math.max(0, borderRadiusBase)}px`);
    html.style.setProperty("--hs-radius-card", `${Math.max(0, Math.round(borderRadiusBase * 1.35))}px`);
    html.style.setProperty("--hs-radius-table", `${Math.max(0, Math.round(borderRadiusBase * 1.7))}px`);
    html.setAttribute("data-hs-table-hover", gridAppearance.hover);
    html.style.setProperty("--row1", gridAppearance.row1);
    html.style.setProperty("--row2", gridAppearance.row2);
    html.style.setProperty("--hs-table-row1", gridAppearance.row1);
    html.style.setProperty("--hs-table-row2", gridAppearance.row2);
    html.style.setProperty("--hs-table-surface", gridAppearance.tableSurface);
    html.style.setProperty("--hs-table-border", gridAppearance.tableBorder);
    html.style.setProperty("--hs-table-head-bg", gridAppearance.headBg);
    html.style.setProperty("--hs-table-head-fg", gridAppearance.headFg);
    html.style.setProperty("--hs-table-head-border", gridAppearance.headBorder);
    html.style.setProperty("--hs-table-body-border", gridAppearance.bodyBorder);
    html.style.setProperty("--hs-table-hover-bg", gridAppearance.hoverBg);
    html.style.setProperty("--hs-table-shadow", gridAppearance.shadow);
    html.style.setProperty("--hs-table-head-py", gridAppearance.headPy);
    html.style.setProperty("--hs-table-head-px", gridAppearance.headPx);
    html.style.setProperty("--hs-table-cell-py", gridAppearance.cellPy);
    html.style.setProperty("--hs-table-cell-px", gridAppearance.cellPx);
    html.style.setProperty("--hs-table-font-size", gridAppearance.fontSize);
    html.style.setProperty("--hs-table-line-height", gridAppearance.lineHeight);
    html.style.setProperty(
      "--hs-dashboard-grid-user-width",
      dashboardGridWidth > 0 ? `${dashboardGridWidth}px` : "auto"
    );

    let earlyStyle = document.getElementById(EARLY_THEME_STYLE_ID);
    if (!(earlyStyle instanceof HTMLStyleElement)) {
      earlyStyle = document.createElement("style");
      earlyStyle.id = EARLY_THEME_STYLE_ID;
      (document.head || document.documentElement).appendChild(earlyStyle);
    }
    earlyStyle.textContent = `
      html,body{
        background-color:var(--bg)!important;
        color:var(--fg)!important;
        font-family:var(--hs-body-font)!important;
      }
      body{
        background-image:
          linear-gradient(var(--hs-wallpaper-overlay), var(--hs-wallpaper-overlay)),
          var(--hs-wallpaper-image)!important;
        background-size:cover!important;
        background-position:center center!important;
        background-attachment:fixed!important;
      }
      html[data-hs-popup-preview="1"] #cabecalho,
      html[data-hs-popup-preview="1"] #cabecalho_logo,
      html[data-hs-popup-preview="1"] #cabecalho_menu{
        display:none!important;
      }
      html[data-hs-popup-preview="1"] #conteudo{
        padding-top:8px!important;
      }
    `;
  }
  bootstrapEarlyThemePaint();

  const T_PRIMEIRO_ATENDIMENTO = `Prezado(a),
Informamos que sua solicitacao foi recebida por nossa equipe de suporte e esta sendo analisada com atencao. Caso surjam duvidas ou necessitemos de informacoes adicionais, entraremos em contato antes de prosseguir com o atendimento.
Agradecemos seu contato e em breve retornaremos com uma resposta.
Atenciosamente,
Equipe de Suporte.`;
  const T_ENVIAR_SERVICO = "Em servico.";
  const RECENT_UPDATES = Object.freeze([
    {
      date: "2026-03-13",
      version: "2.15.94",
      type: "routine",
      mandatory: false,
      notes: [
        "visualizar_usuario.php recebeu ajuste direto no cabecalho para reservar espaco fixo do botao de tema na lateral direita.",
        "Botao Modo Claro/Modo Escuro agora fica ancorado em posicao segura nessa tela, sem recortar nem disputar layout com o bloco do usuario logado.",
        "Correcao foi mantida isolada ao cabecalho da tela de usuario para nao reabrir os problemas do formulario repaginado.",
      ],
    },
    {
      date: "2026-03-13",
      version: "2.15.93",
      type: "routine",
      mandatory: false,
      notes: [
        "Cabecalho interno recebeu alinhamento mais estavel para a faixa da direita, evitando conflito visual entre usuario logado e o botao Modo Claro/Modo Escuro.",
        "Botao de tema agora se comporta como item normal do menu superior, com espacamento, altura e fluxo mais previsiveis nas telas internas.",
        "Ajuste corrige especialmente a sobreposicao percebida na visualizar_usuario.php sem mexer na logica dos campos ou das acoes.",
      ],
    },
    {
      date: "2026-03-13",
      version: "2.15.92",
      type: "routine",
      mandatory: false,
      notes: [
        "visualizar_usuario.php foi repaginada sobre uma camada nova, escondendo a tabela legada que ainda gerava faixas quebradas e colunas desalinhadas.",
        "Campos do usuario agora sao montados em grid proprio com cards, labels consistentes, checkboxes com estado legivel e acoes reorganizadas sem depender do HTML antigo.",
        "Ajuste deixa a tela muito mais estavel em desktop e mobile, inclusive nos blocos de senha e nos botoes secundarios.",
      ],
    },
    {
      date: "2026-03-13",
      version: "2.15.91",
      type: "routine",
      mandatory: false,
      notes: [
        "consulta_usuario.php agora restaura automaticamente a empresa e a busca digitada, reaplicando o filtro salvo ao voltar para a pagina.",
        "Persistencia dos filtros da consulta de usuarios foi reforcada com gravacao em mudancas e na saida da tela, mantendo o contexto do usuario no navegador.",
        "visualizar_usuario.php ganhou organizacao em cards compactos, linhas melhor alinhadas e responsividade real para telas menores sem elementos gigantes.",
      ],
    },
    {
      date: "2026-03-13",
      version: "2.15.90",
      type: "routine",
      mandatory: false,
      notes: [
        "Grade da consulta/dashboard recebeu refinamento visual discreto, com cabecalho mais suave, hover leve e leitura mais confortavel.",
        "Links e textos legados da tabela passaram a herdar a paleta da linha, reduzindo o excesso de vermelho e deixando a UI mais profissional.",
        "Modal de Aparencia ganhou novos controles para estilo da grade, densidade das linhas e intensidade do hover, salvos por tema.",
      ],
    },
    {
      date: "2026-03-13",
      version: "2.15.89",
      type: "routine",
      mandatory: false,
      notes: [
        "Correcao precisa no bloco de flags do dashboard para respeitar a estrutura legada input + label + quebra de linha.",
        "Filtro 'Exibir Em servico' passou a usar o mesmo formato visual e de markup dos demais checkboxes do formulario.",
        "Ajuste remove a organizacao em flex da celula de flags, evitando separar checkbox e label em linhas diferentes.",
      ],
    },
    {
      date: "2026-03-13",
      version: "2.15.88",
      type: "routine",
      mandatory: false,
      notes: [
        "Bloco de flags do dashboard foi reorganizado para alinhar melhor os checkboxes no filtro principal.",
        "Filtro 'Exibir Em servico' agora segue o mesmo empilhamento, espacamento e alinhamento visual dos demais flags.",
        "Ajuste foi mantido apenas na apresentacao do formulario, sem alterar a logica dos filtros nem do grid.",
      ],
    },
    {
      date: "2026-03-13",
      version: "2.15.87",
      type: "routine",
      mandatory: false,
      notes: [
        "Limpeza conservadora removeu constantes e helpers legados sem referencia no fluxo atual do site.",
        "Residuos do badge antigo da logo e persistencias de update sem leitura efetiva foram retirados do arquivo principal.",
        "Credenciais/chaves Gemini nao utilizadas deixaram de existir no script, mantendo apenas os modos de IA realmente ativos.",
      ],
    },
    {
      date: "2026-03-12",
      version: "2.15.86",
      type: "routine",
      mandatory: false,
      notes: [
        "Codigo do modulo user2 foi incorporado diretamente no arquivo principal (.user.js), eliminando dependencia externa.",
        "Diretiva @require do metadata foi removida para operar em arquivo unico e evitar falhas de carregamento do modulo.",
        "Hub de configuracoes, teste de notificacao e APIs auxiliares agora rodam localmente dentro do proprio user.js.",
      ],
    },
    {
      date: "2026-03-12",
      version: "2.15.85",
      type: "routine",
      mandatory: false,
      notes: [
        "Teste de notificacao do user2 foi reforcado com fallback visual direto (canto inferior direito) para confirmar clique mesmo em ambientes restritos.",
        "Animacao de entrada do card agora possui acionamento redundante (requestAnimationFrame + fallback temporal) para evitar sumico silencioso.",
        "API do user2 passou a expor showPlainNotificationFallback para diagnostico rapido de renderizacao.",
      ],
    },
    {
      date: "2026-03-12",
      version: "2.15.84",
      type: "routine",
      mandatory: false,
      notes: [
        "Modulo user2 ganhou notificacao visual de atualizacao de chamado com animacao de subida (canto inferior direito).",
        "Modal de Configuracoes agora exibe botao 'Teste notificacao' para validar rapidamente se o user2.js esta ativo.",
        "API do user2 passou a expor showChamadoUpdateNotification/runSettingsNotificationTest para testes diretos.",
      ],
    },
    {
      date: "2026-03-12",
      version: "2.15.83",
      type: "routine",
      mandatory: false,
      notes: [
        "Pintura por situacao foi movida para o modulo auxiliar (.user2.js), iniciando a divisao do script principal.",
        "Cor de fundo da situacao agora aplica inline em todos os TDs da linha para prevalecer sobre CSS legado/hover.",
        "Deteccao e pintura de situacao passaram a usar API compartilhada do user2 para manter comportamento consistente.",
      ],
    },
    {
      date: "2026-03-12",
      version: "2.15.82",
      type: "routine",
      mandatory: false,
      notes: [
        "Cores por situacao agora aplicam o campo de fundo na linha inteira da grade (todos os TDs), mantendo badge e texto sincronizados.",
        "Aplicacao de cor por situacao ganhou fallback sem variaveis CSS para navegadores mais restritos, reduzindo diferencas de renderizacao.",
        "Leitura da coluna Situacao foi reforcada com limpeza de badges auxiliares e normalizacao resiliente para reconhecer mais cenarios.",
      ],
    },
    {
      date: "2026-03-12",
      version: "2.15.81",
      type: "routine",
      mandatory: false,
      notes: [
        "Layout dos filtros do dashboard foi realinhado para manter os blocos superiores e checkboxes organizados.",
        "A celula de checkboxes nao recebe mais forca de layout flex do topo (Responsavel/Cliente), evitando desalinhamento.",
        "Regra de versionamento consolidada: toda mudanca no .user2.js exige incremento de versao no .user.js.",
      ],
    },
    {
      date: "2026-03-12",
      version: "2.15.80",
      type: "routine",
      mandatory: false,
      notes: [
        "Correcao de posicionamento do checkbox 'Exibir Em servico' no dashboard: agora ele ancora junto do grupo correto de filtros.",
        "Insercao do toggle ficou resiliente para nao cair na celula flex do topo (campo Interno/Todos), evitando desalinhamento visual.",
        "Refino de CSS no bloco extra do filtro para manter quebra de linha consistente no formulario legado.",
      ],
    },
    {
      date: "2026-03-12",
      version: "2.15.79",
      type: "routine",
      mandatory: false,
      notes: [
        "Configuracoes agora abrem em modal organizado por guias e subguias, com visual mais limpo para operacao diaria.",
        "Nova aba de Situacoes permite personalizar cor de texto e badges por status (qualquer situacao encontrada na grade).",
        "Preferencias de cor por situacao ficam salvas por tema no navegador e sao reaplicadas automaticamente com log no console.",
        "Script principal (.user.js) passou a carregar modulo auxiliar (.user2.js) via @require para manter evolucao mais organizada.",
      ],
    },
    {
      date: "2026-03-12",
      version: "2.15.78",
      type: "routine",
      mandatory: false,
      notes: [
        "Modal automatico de atualizacao agora abre somente para releases de correcao obrigatoria (bugfix/security).",
        "Atualizacoes rotineiras deixaram de abrir popup automatico ao recarregar a pagina; usuario decide quando atualizar manualmente.",
        "Fluxo de alerta obrigatorio foi mantido sem mudancas para garantir aplicacao imediata de correcoes criticas.",
      ],
    },
    {
      date: "2026-03-12",
      version: "2.15.77",
      type: "bugfix",
      mandatory: true,
      notes: [
        "Bridge TXT/SQL ficou mais resiliente: a aba do anexo agora aguarda o texto renderizar e so retorna erro apos janela de tentativa, evitando falha precoce.",
        "Canal alternativo por localStorage foi adicionado para devolver conteudo ao modal quando window.opener estiver indisponivel na nova guia.",
        "Preview textual no modal agora recebe o conteudo do link aberto com maior estabilidade para copia de texto em anexos .txt/.sql.",
      ],
    },
    {
      date: "2026-03-12",
      version: "2.15.76",
      type: "bugfix",
      mandatory: true,
      notes: [
        "Bridge TXT/SQL ajustado para abrir nova guia sem noopener/noreferrer, mantendo window.opener e permitindo retorno do conteudo ao modal via postMessage.",
        "Correcao destrava o fluxo em que a aba era aberta, mas o modal nao recebia texto por bloqueio do canal de comunicacao.",
      ],
    },
    {
      date: "2026-03-12",
      version: "2.15.75",
      type: "bugfix",
      mandatory: true,
      notes: [
        "Fluxo TXT/SQL passou a abrir nova guia do anexo e capturar o texto pelo proprio contexto da pagina do arquivo, retornando conteudo para o modal principal.",
        "Canal bridge por postMessage foi adicionado com id temporario para sincronizar aba do anexo e modal da tela de requisicao.",
        "Quando a captura via nova guia falhar, preview tenta fallback local (fetch/iframe) antes de exibir erro final.",
      ],
    },
    {
      date: "2026-03-12",
      version: "2.15.74",
      type: "bugfix",
      mandatory: true,
      notes: [
        "Preview TXT/SQL agora normaliza URL do anexo para o mesmo protocolo/origem da pagina quando o host e igual, reduzindo falhas por CORS em links absolutos https/http.",
        "Fetch e fallback por iframe passaram a usar essa URL normalizada antes da leitura do conteudo.",
        "Correcao focada em anexos que abrem em nova guia mas falhavam no modal por contexto de origem misto.",
      ],
    },
    {
      date: "2026-03-12",
      version: "2.15.73",
      type: "bugfix",
      mandatory: true,
      notes: [
        "Blindagem extra no fluxo TXT/SQL: window.open legado para o mesmo anexo e bloqueado por alguns segundos durante a abertura do modal.",
        "Correcao evita corrida entre handlers da pagina e preview interno que causava modal abrir/fechar com nova guia em seguida.",
        "Fluxo de preview textual segue priorizando modal e copia de link/texto sem navegacao forcada.",
      ],
    },
    {
      date: "2026-03-12",
      version: "2.15.72",
      type: "bugfix",
      mandatory: true,
      notes: [
        "Correcao imediata no preview TXT/SQL: fallback nao fecha mais o modal nem abre nova guia automaticamente quando a leitura interna falhar.",
        "Leitura textual de anexo agora aceita payload com bytes nulos (caso comum de UTF-16), evitando falso erro de conteudo binario.",
        "Mensagem de erro no modal passou a orientar copiar link/manualmente sem interromper a tela.",
      ],
    },
    {
      date: "2026-03-12",
      version: "2.15.71",
      type: "bugfix",
      mandatory: false,
      notes: [
        "Anexos TXT/SQL recebidos no chamado agora priorizam abertura no modal-editor, inclusive quando o link legado nao expõe extensao no href.",
        "Deteccao de nome do anexo textual foi reforcada pelo contexto da linha para capturar casos em que o nome aparece somente no texto da tela.",
        "Modal textual ganhou acao dedicada de 'Copiar link' e campo readonly com a URL do anexo para facilitar consulta e compartilhamento.",
      ],
    },
    {
      date: "2026-03-12",
      version: "2.15.70",
      type: "routine",
      mandatory: false,
      notes: [
        "Dashboard ganhou novo filtro 'Exibir Em servico' no bloco principal para ligar/desligar a secao sem mexer nos outros filtros.",
        "Deteccao de status agora separa corretamente 'Servico aprovado' de 'Aprovado para servico', evitando destaque indevido.",
        "Linhas em situacao 'Servico aprovado' passaram a receber destaque branco chamativo para reforcar chamados pendentes de conclusao.",
        "Na acao Concluir, o formulario agora exibe alerta visual para revisar consumo/minutos antes do envio, sem popup de confirmacao.",
        "Preview de anexos TXT/SQL foi reforcado com fallback adicional para abrir no modal-editor e manter o conteudo copiavel em mais cenarios.",
      ],
    },
    {
      date: "2026-03-12",
      version: "2.15.69",
      type: "routine",
      mandatory: false,
      notes: [
        "Painel profissional da consulta foi reformulado com foco operacional: KPIs clicaveis para filtros rapidos e acao direta nos chamados.",
        "Novo card 'Chamados em foco' prioriza itens criticos (sem responsavel, parados, aguardando retorno/info) com abertura em 1 clique.",
        "Card 'Fila mais antiga' agora e totalmente interativo, com linha clicavel e botao Abrir para agilizar atendimento.",
        "Calculos do painel passaram a considerar chamados unicos por numero, reduzindo risco de contagem duplicada na grade.",
      ],
    },
    {
      date: "2026-03-12",
      version: "2.15.68",
      type: "bugfix",
      mandatory: false,
      notes: [
        "Preview de imagem no modal agora libera pan completo apos zoom, sem prender as bordas laterais/superiores.",
        "Zoom por botoes e atalhos passa a respeitar o ultimo ponto do cursor dentro da imagem, em vez de forcar sempre o centro.",
        "Roda do mouse no modal foi ajustada para zoom continuo no ponto do cursor (Shift+wheel mantem rolagem nativa do container).",
      ],
    },
    {
      date: "2026-03-11",
      version: "2.15.67",
      type: "routine",
      mandatory: false,
      notes: [
        "Painel profissional da consulta agora integra com o ciclo de refresh AJAX da grade, exibindo status de carregamento em tempo real.",
        "Novo card de sincronismo mostra ultimo sync, proxima atualizacao e contagem de novos/alterados no ultimo ciclo.",
        "Distribuicao de situacoes ganhou filtro rapido clicavel (por status) para focar operacao sem recarregar a pagina.",
        "Painel passa a se atualizar imediatamente apos refresh automatico e mantem filtros ativos entre ciclos de carregamento.",
      ],
    },
    {
      date: "2026-03-11",
      version: "2.15.66",
      type: "routine",
      mandatory: false,
      notes: [
        "Consulta de requisicoes ganhou modo profissional opcional com painel lateral de operacao (KPIs, fila mais antiga e distribuicao de situacoes).",
        "Nova preferencia no menu Configuracoes: 'Painel consulta ON/OFF', desativada por padrao e salva no navegador (localStorage).",
        "Linhas com situacao 'Servico aprovado' agora ficam em azul para destacar chamados que faltam concluir.",
        "Ajuste de largura da grade considera automaticamente a coluna principal quando o painel lateral estiver ativo, evitando quebra de layout.",
      ],
    },
    {
      date: "2026-03-10",
      version: "2.15.64",
      type: "routine",
      mandatory: false,
      notes: [
        "Campo de Acompanhamento (textarea.acomp_descricao) agora salva automaticamente a altura definida pelo usuario.",
        "Ao abrir qualquer novo chamado, o formulario reaplica a ultima altura utilizada no textarea para manter consistencia.",
        "Persistencia usa localStorage (chave hs2025-acomp-textarea-size) com bind idempotente para nao duplicar eventos no reload parcial.",
      ],
    },
    {
      date: "2026-03-10",
      version: "2.15.63",
      type: "routine",
      mandatory: false,
      notes: [
        "Modal de preview de imagem ganhou zoom profissional com indicador de escala e botoes dedicados (+, -, 100%).",
        "Navegacao da imagem ampliada agora permite arrastar para mover e duplo clique para alternar rapido entre 100% e zoom ampliado.",
        "Atalhos de teclado (+, -, 0) e suporte a roda do mouse foram adicionados para facilitar inspeccao de detalhes no anexo.",
      ],
    },
    {
      date: "2026-03-10",
      version: "2.15.62",
      type: "bugfix",
      mandatory: false,
      notes: [
        "Rollback do fluxo de update para o modelo manual/original com botao 'Codigo update' e copia de codigo.",
        "Removido o botao de atualizacao rapida para evitar falsos fluxos de instalacao e preservar estabilidade.",
        "Correcao obrigatoria continua com alerta e modal forcado quando houver release marcada como mandatory/bugfix.",
      ],
    },
    {
      date: "2026-03-10",
      version: "2.15.61",
      type: "bugfix",
      mandatory: false,
      notes: [
        "Fluxo de atualizacao foi ajustado para abrir direto o .user.js raw, sem usar a pagina intermediaria do tampermonkey.net.",
        "Quando o link vier no formato bridge, o script extrai automaticamente a URL real do .user.js antes de iniciar a atualizacao.",
      ],
    },
    {
      date: "2026-03-10",
      version: "2.15.60",
      type: "routine",
      mandatory: false,
      notes: [
        "Notificacao do botao Configuracoes agora aparece somente quando existe update real disponivel.",
        "Removido gatilho de aviso continuo por novidades internas para evitar ponto vermelho permanente.",
      ],
    },
    {
      date: "2026-03-10",
      version: "2.15.59",
      type: "routine",
      mandatory: false,
      notes: [
        "Novo botao 'Atualizar script' no menu de Configuracoes para fluxo de update em 1 clique.",
        "Atualizacao agora pede confirmacao explicita e abre no mesmo separador (sem abrir nova guia).",
        "Acoes de instalar update passaram a exibir confirmacao padrao antes de iniciar a instalacao no Tampermonkey.",
      ],
    },
    {
      date: "2026-03-10",
      version: "2.15.57",
      type: "routine",
      mandatory: false,
      notes: [
        "Preview de requisicao em popup agora abre com modo dedicado, sem renderizar o cabecalho interno duplicado.",
        "Visualizar requisicao recebeu deteccao de contexto do popup para ocultar #cabecalho/#cabecalho_logo/#cabecalho_menu apenas nesse fluxo.",
        "Espacamento superior da tela de preview foi ajustado para aproveitar melhor a altura util dentro do iframe.",
      ],
    },
    {
      date: "2026-03-10",
      version: "2.15.56",
      type: "routine",
      mandatory: false,
      notes: [
        "Campo de versao/commit saiu do cabecalho e foi movido para o menu de Configuracoes (sessao Script), com abertura direta do commit.",
        "Aparencia visual ganhou novos controles persistentes por tema: formato da borda (arredondada/quadrada), espessura da borda e largura da grade.",
        "Grade do dashboard agora pode ser redimensionada arrastando as laterais (estilo janela), com salvamento automatico da largura no navegador.",
        "Aplicacao de tema foi antecipada no bootstrap para reduzir atraso visual entre tema nativo e tema do script ao recarregar/abrir preview.",
        "Anexos .txt e .sql (locais e recebidos) agora abrem em preview estilo editor, com fonte mono e botao de copiar conteudo.",
      ],
    },
    {
      date: "2026-03-10",
      version: "2.15.55",
      type: "bugfix",
      mandatory: true,
      notes: [
        "Correcao urgente na Aparencia visual: tema claro e tema escuro agora salvam configuracoes em chaves separadas.",
        "Ao trocar de tema, cada modo passa a carregar seu proprio conjunto de fonte/cores/papel de fundo sem misturar estados.",
        "Migracao segura incluida: configuracao antiga unica e movida automaticamente para o tema ativo, preservando o visual atual.",
      ],
    },
    {
      date: "2026-03-09",
      version: "2.15.54",
      type: "bugfix",
      mandatory: true,
      notes: [
        "Sistema de update agora diferencia release rotineira de correcao de erro (type/mandatory).",
        "Quando houver correcao obrigatoria pendente, o script abre automaticamente o modal de codigo de update.",
        "Modal obrigatorio ganhou bloqueio de fechamento por Escape/backdrop para reforcar instalacao imediata.",
      ],
    },
    {
      date: "2026-03-09",
      version: "2.15.53",
      type: "bugfix",
      mandatory: true,
      notes: [
        "Correcao critica no bloco de anexos: selecao voltou a aceitar varios arquivos sem truncar para apenas 1.",
        "Fluxo de preview local passou a refletir a quantidade real de arquivos selecionados no campo.",
        "Antes do envio, anexos com mesmo nome sao consolidados para garantir que todos os arquivos selecionados sigam no chamado.",
      ],
    },
    {
      date: "2026-03-09",
      version: "2.15.52",
      notes: [
        "Menu de Configuracoes passou a usar popover em portal no body, eliminando cortes/sumico por overflow do cabecalho.",
        "Popover agora calcula posicao pelo botao do header e reposiciona em resize/scroll para manter leitura limpa.",
        "Visual opaco do painel foi reforcado para evitar mistura com textos da tela ao fundo.",
      ],
    },
    {
      date: "2026-03-09",
      version: "2.15.51",
      notes: [
        "Preview PNG/JPG remoto agora abre no modal via iframe interno (mesma experiencia de nova guia, sem sair da tela).",
        "Menu de Configuracoes foi movido para o cabecalho no dashboard e ganhou painel opaco com backdrop para leitura limpa.",
        "Visual do menu foi refinado para estilo mais nativo/profissional, com transicao suave e hierarquia mais clara.",
      ],
    },
    {
      date: "2026-03-09",
      version: "2.15.50",
      notes: [
        "Preview PNG/JPG de anexo remoto (anexo.php) agora tenta carregar via fetch autenticado da sessao antes de renderizar no modal.",
        "Deteccao de imagem foi ampliada para URLs com nome do arquivo em querystring (ex.: ?name=arquivo.png).",
        "Menu de Configuracoes recebeu refinamento visual com abertura mais nativa, painel opaco e transicao suave.",
      ],
    },
    {
      date: "2026-03-09",
      version: "2.15.49",
      notes: [
        "Preview PNG/JPG passou a funcionar tambem nos anexos ja recebidos da requisicao, respeitando o toggle dedicado.",
        "Modal de atualizacoes ganhou z-index acima do cabecalho para evitar sobreposicao visual.",
        "Menu de Configuracoes foi reorganizado (sem blur) e recebeu painel de Aparencia para fonte, cores e papel de fundo suave.",
      ],
    },
    {
      date: "2026-03-09",
      version: "2.15.48",
      notes: [
        "Configuracoes ganharam toggle para ocultar/exibir o filtro 'Sugestao de melhoria' no dashboard.",
        "Preferencia do toggle e salva no navegador (localStorage), independente do GitHub.",
        "Aplicacao do filtro foi ajustada para reexibir a linha quando o toggle for desativado.",
      ],
    },
    {
      date: "2026-03-09",
      version: "2.15.47",
      notes: [
        "Menu de Configuracoes agora aplica fundo com desfoque ao abrir, melhorando foco visual.",
        "Clique no fundo desfocado fecha o menu de Configuracoes com comportamento consistente.",
        "Camadas (z-index) do menu foram ajustadas para manter boa leitura acima do backdrop.",
      ],
    },
    {
      date: "2026-03-09",
      version: "2.15.46",
      notes: [
        "Anexos recebidos no chamado voltaram a abrir em nova guia, sem forcar modal de preview.",
        "Preview em modal dos anexos locais agora permite apenas arquivos PNG/JPG e ganhou toggle dedicado.",
        "Barra de acoes do dashboard foi reorganizada em menu de Configuracoes (engrenagem) com indicador de notificacao.",
      ],
    },
    {
      date: "2026-03-06",
      version: "2.15.45",
      notes: [
        "Cabecalho original (#cabecalho) recebeu prioridade de camada para permanecer acima da grade no scroll.",
        "Badge da versao no header foi redesenhado com visual premium e passou a exibir ultimo commit (SHA curto e data).",
        "Dados do ultimo commit agora usam cache local e atualizacao assicrona para manter fluidez da tela.",
      ],
    },
    {
      date: "2026-03-06",
      version: "2.15.44",
      notes: [
        "Correcao do header sticky da grade: topo restaurado para 0 para evitar cabecalho no meio da tabela ao rolar.",
        "Ajuste de camada do thead sticky para manter leitura correta da grade sem quebrar a ordem visual das linhas.",
      ],
    },
    {
      date: "2026-03-06",
      version: "2.15.43",
      notes: [
        "Atualizacao manual agora escolhe a maior versao encontrada entre todas as fontes remotas, evitando retornar codigo antigo.",
        "Verificacao de update passou a salvar a URL real da fonte que trouxe a versao detectada.",
        "Fluxo de buscar codigo remoto foi reforcado com candidato por SHA do commit mais recente da branch main.",
      ],
    },
    {
      date: "2026-03-06",
      version: "2.15.42",
      notes: [
        "Regras de manutencao adicionadas no cabecalho: .user.js e updates-log.json como arquivos oficiais do projeto.",
        "Padrao documentado: toda mudanca no .user.js deve atualizar o updates-log.json.",
        "Padrao documentado: toda alteracao deve incrementar a versao para liberar update aos usuarios.",
      ],
    },
    {
      date: "2026-03-06",
      version: "2.15.41",
      notes: [
        "Modal de atualizacao manual agora revalida o fallback direto no GitHub ao abrir o bloco de codigo.",
        "Texto de status da atualizacao manual permanece fixo e troca somente o numero da versao remota.",
        "Versao local passou a usar GM_info.script.version automaticamente (com fallback).",
      ],
    },
    {
      date: "2026-03-06",
      version: "2.15.40",
      notes: [
        "Rollback dos ajustes de menu/sticky do dashboard para restaurar o comportamento anterior ao rolar.",
        "Mantido preview de anexos em miniaturas quadradas clicaveis.",
        "Mantida exibicao da versao ao lado da logo no cabecalho.",
      ],
    },
    {
      date: "2026-03-06",
      version: "2.15.39",
      notes: [
        "Preview de anexos ajustado para miniaturas quadradas clicaveis.",
        "Cabecalho sticky da grade do dashboard agora respeita offset do menu e evita sobreposicao.",
        "Correcao de espaco em branco intermitente entre menu e filtros (Responsavel/Cliente).",
        "Versao do script exibida ao lado da logo do cabecalho.",
      ],
    },
    {
      date: "2026-03-06",
      version: "2.15.38",
      notes: [
        "Correcao de sincronismo de versao interna para o botao 'Nova versao' sumir apos atualizar.",
        "Historico de atualizacoes agora abre em modal e prioriza dados do updates-log.json.",
        "Preview de imagens em anexos ganhou clique para ampliar no modal.",
        "Texto de envio para orcamento padronizado com saudacao por horario e assinatura do usuario logado.",
      ],
    },
    {
      date: "2026-03-06",
      version: "2.15.36",
      notes: [
        "Correcao do update pelo GitHub com cache-buster e URL canonical main.",
        "Botao de versoes removido do dashboard.",
        "Texto de orcamento atualizado com saudacao e assinatura do tecnico logado.",
        "Preview de anexos reforcado para funcionar em mais cenarios.",
      ],
    },
    {
      date: "2026-03-06",
      version: "2.15.35",
      notes: [
        "Atualizacao manual ganhou modal com botoes de copiar codigo, copiar link, baixar .user.js e abrir GitHub.",
        "Removido alert longo sem acao pratica; fluxo agora e mais direto para o usuario final.",
      ],
    },
    {
      date: "2026-03-06",
      version: "2.15.34",
      notes: [
        "Novo fluxo manual: botao para abrir/copiar codigo e colar no editor do Tampermonkey.",
        "Piscar de chamados agora acontece uma unica vez por chamado e fica salvo no navegador.",
        "Otimizacao de performance: menos reprocessamento completo apos mutacoes e refresh AJAX.",
      ],
    },
    {
      date: "2026-03-06",
      version: "2.15.33",
      notes: [
        "Padrao de @updateURL/@downloadURL alterado para raw/refs/heads/main (menos atraso de cache que raw/main).",
        "Lista de fontes de update prioriza refs/heads/main para melhorar deteccao automatica.",
      ],
    },
    {
      date: "2026-03-06",
      version: "2.15.32",
      notes: [
        "Fluxo de atualizar agora abre direto o arquivo .user.js para o Tampermonkey capturar sem depender da ponte.",
        "Mantido fallback para ponte tampermonkey.net apenas quando a URL nao for .user.js.",
      ],
    },
    {
      date: "2026-03-06",
      version: "2.15.31",
      notes: [
        "Deteccao de update agora compara todas as fontes e escolhe a maior versao remota.",
        "Retorno do update/download padrao para raw/main para reduzir atraso de CDN no metadata check.",
      ],
    },
    {
      date: "2026-03-06",
      version: "2.15.30",
      notes: [
        "Troca de update/download para jsDelivr (@main) para evitar cache antigo do raw/main.",
        "Melhora da confiabilidade na deteccao e instalacao de novas versoes.",
      ],
    },
    {
      date: "2026-03-06",
      version: "2.15.29",
      notes: [
        "Notificacao global de update em qualquer pagina (nao depende do dashboard).",
        "Fluxo de aviso reforcado para facilitar atualizacao manual imediata.",
      ],
    },
    {
      date: "2026-03-06",
      version: "2.15.28",
      notes: [
        "Republicacao da versao mais recente no main para restaurar deteccao de update.",
        "Mantido popup automatico de update e ponte de instalacao via Tampermonkey.",
      ],
    },
    {
      date: "2026-03-06",
      version: "2.15.27",
      notes: [
        "Verificacao de update agora consulta commit SHA mais recente da API do GitHub.",
        "Reduce atraso de alerta causado por cache do raw/main.",
      ],
    },
    {
      date: "2026-03-06",
      version: "2.15.26",
      notes: [
        "Popup automatico (uma vez por versao remota) quando houver update disponivel.",
        "Fluxo de abrir atualizacao com ponte do Tampermonkey para reduzir bloqueio do navegador.",
      ],
    },
    {
      date: "2026-03-06",
      version: "2.15.25",
      notes: [
        "Regras append-only no historico de atualizacoes.",
        "Painel de atualizacoes agora usa historico protegido e persistente.",
      ],
    },
    {
      date: "2026-03-06",
      version: "2.15.24",
      notes: [
        "Correcao do botao de tema (Modo Claro/Modo Escuro) sem caracteres quebrados.",
        "Botao 'Versoes' para escolher e abrir versoes antigas/novas do script.",
        "Checagem de atualizacao em todo carregamento da pagina.",
      ],
    },
    {
      date: "2026-03-06",
      version: "2.15.23",
      notes: [
        "Verificacao de atualizacao via GitHub (automatica e manual).",
        "Botao de alerta discreto/chamativo quando houver nova versao.",
      ],
    },
    {
      date: "2026-03-06",
      version: "2.15.22",
      notes: [
        "Novo botao 'Atualizacoes' ao lado do preview para mostrar historico recente.",
      ],
    },
    {
      date: "2026-03-06",
      version: "2.15.21",
      notes: [
        "Novo botao 'Enviar para orcamento' com validacao dos campos de minutos consumo.",
        "Novo toggle de Preview ON/OFF ao lado dos filtros.",
      ],
    },
    {
      date: "2026-03-03",
      version: "2.15.20",
      notes: [
        "Ajustes gerais de estabilidade e visual.",
      ],
    },
  ]);
  const T_CHAMADO_EXPIRADO =
    "Chamado cancelado devido a falta de retorno do usuario a mais de 5 dias. Caso seja necessario, devera ser aberto um novo chamado e informado como referencia esse chamado em questao.";
  const T_APROVACAO_INTERNA =
    "Chamado com aprovacao interna devido a falta de retorno do usuario a mais de 5 dias. Caso seja necessario, devera ser aberto um novo chamado e informado como referencia esse chamado em questao.";
  const T_CONCLUIR_CHAMADO = `Chamado finalizado.
Atenciosamente.`;
  let hsScriptUpdateCheckPromise = null;
  let hsScriptUpdateLastResult = null;
  let hsMandatoryUpdatePromptVersion = "";
  let hsUpdateHistoryValidated = false;
  let hsUpdateHistoryValidatedList = [];
  let hsLatestCommitMeta = null;
  let hsLatestCommitMetaPromise = null;

  /*
   * ============================================================================
   * DOCUMENTACAO TECNICA - HEADSOFT SUPORTE MODERN UI (v2.15.14)
   * ============================================================================
   * Objetivo:
   * - Modernizar a interface do suporte Headsoft mantendo compatibilidade com
   *   o HTML legado e sem depender de alteracoes server-side.
   *
   * Escopo funcional:
   * - Tema dark/light com persistencia em localStorage.
   * - Reestilizacao de Login, Home, Dashboard, Visualizar Requisicao,
   *   Consulta de Usuarios e Visualizar Usuario.
   * - Atalhos de atendimento com preenchimento automatico de texto/acao.
   * - Assistente de melhoria de texto com IA (modo gratis e modo pago).
   * - Montagem automatica da resposta de acompanhamento:
   *   saudacao por horario + nome solicitante + texto corrigido + assinatura.
   * - Pop-up de visualizacao de requisicao (Ctrl/Cmd+clique).
   * - Acoes de produtividade em grade (clique na linha, clique na logo,
   *   primeiro atendimento direto no dashboard/consulta).
   *
   * Persistencia local (browser storage):
   * - localStorage:
   *   - hs2025-theme
   *   - hs2025-appearance-settings-light
   *   - hs2025-appearance-settings-dark
   *   - hs2025-appearance-settings (legado para migracao automatica)
   *   - hs2025-preview-only-mode
   *   - hs2025-consulta-pro-layout
   *   - hs2025-attach-image-preview
   *   - hs2025-attach-text-preview
   *   - hs2025-acomp-textarea-size
   *   - hs2025-hide-suggestion-filter
   *   - hs2025-openai-api-key
   *   - hs2025-ai-mode
   *   - hs2025-req-open-debug (diagnostico de abertura duplicada)
   * - sessionStorage:
   *   - hs2025-auto-concluir-pending
   *   - hs2025-auto-concluir-tries
   *
   * Integracoes externas:
   * - OpenAI: https://api.openai.com/v1/chat/completions
   * - Pollinations (modo gratis): https://text.pollinations.ai/openai
   * - Backend legado para 1o atendimento: db_update_requisicao.php
   *
   * Feature flags operacionais (const FEATURE_FLAGS):
   * - ENABLE_AI_ASSIST: ativa/desativa botao "Melhorar texto".
   * - ENABLE_POPUP_VIEWER: ativa/desativa popup Ctrl/Cmd+clique.
   * - ENABLE_AUTO_CONCLUIR: ativa/desativa auto-conclusao pos-acao.
   * - ENABLE_DEBUG_SELF_CHECK: habilita diagnostico de seletores no console.
   *
   * Changelog interno:
   * - 2026-03-02 (2.15.14): padronizacao ampla de documentacao em linha.
   * - 2026-03-02 (2.15.14+): matriz de rastreabilidade, protocolo de alteracao,
   *   feature flags e rotina opcional de self-check para manutencao segura.
   * - 2026-03-02 (2.15.14++): compactacao visual dos filtros principais do
   *   dashboard (Responsavel/Cliente) com menor largura/altura e alinhamento.
   * - 2026-03-02 (2.15.14+++): ajuste fino dos filtros do dashboard para manter
   *   seletor/icone acoplado ao campo e remover espacamento lateral excedente.
   * - 2026-03-02 (2.15.14++++): aproximacao adicional dos campos aos rotulos
   *   no dashboard e nova reducao de espessura/largura dos controles.
   * - 2026-03-02 (2.15.14+++++): ajuste individual da coluna "Cliente" para
   *   igualar distancia visual do rotulo e reducao adicional da altura dos
   *   campos do dashboard.
   * - 2026-03-02 (2.15.14++++++): aproximacao final do campo "Cliente" para
   *   a barra de referencia visual e afinamento extra da altura dos campos.
   * - 2026-03-02 (2.15.14+++++++): equalizacao do espacamento do campo
   *   "Cliente" para espelhar a distancia visual usada em "Responsavel".
   * - 2026-03-02 (2.15.14++++++++): remocao de offsets exclusivos de
   *   "Cliente" para espelhar integralmente a mesma regra de distancia de
   *   "Responsavel" no dashboard.
   * - 2026-03-02 (2.15.14+++++++++): ajuste fino do rotulo "Cliente"
   *   (largura + alinhamento) para manter distancia visual equivalente ao
   *   par "Responsavel" sem aproximar em excesso.
   * - 2026-03-02 (2.15.14++++++++++): reforco de contraste no hover dos
   *   acompanhamentos especiais no tema escuro para evitar texto "apagado".
   * - 2026-03-02 (2.15.14+++++++++++): padronizacao do dashboard em estado
   *   vazio (sem requisicoes), mantendo layout e largura do filtro sem grade.
   * - 2026-03-02 (2.15.14++++++++++++): reducao do destaque visual do estado
   *   vazio ("Nenhuma requisicao.") para manter proporcao com o dashboard.
   * - 2026-03-02 (2.15.14+++++++++++++): reposicionamento do filtro "Cliente"
   *   para iniciar imediatamente apos "Responsavel" no topo do dashboard.
   * - 2026-03-02 (2.15.14++++++++++++++): equalizacao fina da distancia
   *   visual do rotulo/campo "Cliente" para espelhar "Responsavel".
   * - 2026-03-02 (2.15.14+++++++++++++++): reducao da largura util das celulas
   *   de filtro (Responsavel/Cliente) para eliminar folga entre os blocos e
   *   manter o inicio de "Cliente" no mesmo padrao de distancia visual.
   * - 2026-03-02 (2.15.14++++++++++++++++): alinhamento do botao "Marcar
   *   concluido" para ancorar na borda direita do topo da requisicao.
   * - 2026-03-02 (2.15.14+++++++++++++++++): correÃ§Ã£o de artefato visual nos
   *   cantos arredondados da barra de categorias na tela de requisicao.
   * - 2026-03-02 (2.15.14++++++++++++++++++): neutralizacao completa dos raios
   *   nas celulas de canto da barra de categorias (incluindo base) para
   *   remover saliencia residual nas laterais.
   * - 2026-03-02 (2.15.14+++++++++++++++++++): remocao da sobreposicao entre
   *   borda externa e bordas das celulas da barra de categorias para eliminar
   *   artefato lateral no arredondamento.
   * - 2026-03-02 (2.15.14++++++++++++++++++++): padronizacao das bordas no
   *   tema claro da tela de requisicao para manter todas com a mesma cor de
   *   referencia visual.
   * - 2026-03-02 (2.15.14+++++++++++++++++++++): restauracao do contorno
   *   cinza-claro no bloco "Novo acompanhamento" (borda externa e interna)
   *   para neutralizar heranca escura do HTML legado.
   * - 2026-03-02 (2.15.14++++++++++++++++++++++): extensao do contorno
   *   cinza-claro para os blocos superiores da requisicao (Titulo, Descricao,
   *   Detalhes e Acompanhamentos), cobrindo wrappers legados fora de tabela.
   * - 2026-03-02 (2.15.14+++++++++++++++++++++++): padronizacao das bordas
   *   cinza-claro na grade do dashboard (contorno externo e divisorias),
   *   removendo contorno escuro residual na consulta de requisicoes.
   * - 2026-03-02 (2.15.14++++++++++++++++++++++++): novo filtro opcional
   *   "Exibir novas requisiÃ§Ãµes" no dashboard, com quadro proprio acima de
   *   "Aguardando seu retorno" exibido somente quando houver situacao "Nova".
   * - 2026-03-02 (2.15.14+++++++++++++++++++++++++): robustez do filtro
   *   "Exibir novas requisiÃ§Ãµes" (ancoragem resiliente no bloco de filtros)
   *   e criterio estrito da situacao "Nova" para o quadro dedicado.
   * - 2026-03-02 (2.15.14++++++++++++++++++++++++++): correcao de renderizacao
   *   do checkbox "Exibir novas requisiÃ§Ãµes" (deduplicacao defensiva por ID e
   *   reconstrucao garantida do markup do toggle em DOM legado dinamico).
   * - 2026-03-02 (2.15.14+++++++++++++++++++++++++++): quadro de "Novas
   *   requisiÃ§Ãµes" com totalizador e acao em lote de "1o atendimento",
   *   mantendo o filtro "sem responsavel" independente (sem auto-marcacao).
   * - 2026-03-02 (2.15.14++++++++++++++++++++++++++++): robustez extra para
   *   "Novas requisiÃ§Ãµes" sem depender de "Exibir requisiÃ§Ãµes sem responsÃ¡vel":
   *   fallback remoto com mÃºltiplos formatos de parÃ¢metro e parser abrangente
   *   em qualquer tabela sortable, com retry temporizado.
   * - 2026-03-03 (2.15.14+++++++++++++++++++++++++++++): estabilizacao do
   *   quadro de "Novas requisiÃ§Ãµes" sem exigir o checkbox "sem responsÃ¡vel",
   *   com parser remoto em todos os tbody e render idempotente para evitar
   *   recriacao continua da secao (corrigindo retorno involuntario ao topo).
   * - 2026-03-03 (2.15.14++++++++++++++++++++++++++++++): padronizacao visual
   *   da "Consulta de usuarios" com barra de filtros refinada, grade em card
   *   com colunas semanticas e ajuste dinamico de topo para manter simetria
   *   com dashboard/requisicao.
   * - 2026-03-03 (2.15.14+++++++++++++++++++++++++++++++): refinamento final
   *   da tela "Visualizar usuario" com shell central, espacamento superior
   *   dinamico e alinhamento visual de formulario/acoes com o padrao geral.
   * - 2026-03-03 (2.15.14++++++++++++++++++++++++++++++++): ajuste de paleta
   *   na "Visualizar usuario" para neutralizar azul legado em "Nova senha"
   *   (tema claro) e padronizar botoes secundarios (excluir/desbloqueio).
   * - 2026-03-03 (2.15.14+++++++++++++++++++++++++++++++++): correcao final
   *   da tela "Visualizar usuario" com neutralizacao total do azul legado na
   *   tabela de senha (claro/escuro) e bloco secundario de acoes alinhado.
   * - 2026-03-03 (2.15.14++++++++++++++++++++++++++++++++++): blindagem
   *   adicional da tabela de senha contra estilos inline legados (inclusive
   *   primeira linha "Nova senha") e ajuste de largura dos botoes secundarios.
   * - 2026-03-03 (2.15.14+++++++++++++++++++++++++++++++++++): remocao do
   *   traco azul residual na tabela de senha via neutralizacao de bordas
   *   inline legadas (tr/tbody/table) no tema claro e escuro.
   * - 2026-03-03 (2.15.14++++++++++++++++++++++++++++++++++++): ajuste final
   *   da tela de usuario (alinhamento do rotulo "Nova senha" + normalizacao
   *   visual de Empresa/Tipo) e blindagem anti-duplicacao ao abrir abas da
   *   lista de requisicoes; cabecalho unificado nas paginas internas.
   * - 2026-03-03 (2.15.14+++++++++++++++++++++++++++++++++++++): deduplicacao
   *   global de abertura por numero na lista de requisicoes para impedir
   *   abertura dupla de guias no mesmo clique (inclusive em listeners
   *   sobrepostos no DOM legado).
   * - 2026-03-03 (2.15.14++++++++++++++++++++++++++++++++++++++): reforco de
   *   deduplicacao entre contextos (dataset compartilhado no <html>) para
   *   bloquear abertura dupla mesmo com mais de uma instancia do userscript
   *   ativa apos liberacao de pop-ups no navegador.
   * - 2026-03-03 (2.15.14+++++++++++++++++++++++++++++++++++++++): guard
   *   global de window.open para descartar abertura duplicada da mesma
   *   requisicao em curto intervalo, cobrindo handlers legados externos.
   * - 2026-03-03 (2.15.14++++++++++++++++++++++++++++++++++++++++): trilha
   *   de diagnostico da abertura de requisicoes (eventos, deduplicacao e
   *   window.open), com dump rapido no console para identificar a origem
   *   exata da segunda abertura.
   * - 2026-03-03 (2.15.14+++++++++++++++++++++++++++++++++++++++++): ajuste
   *   de abertura em nova guia para remover fallback por <a>.click() quando
   *   window.open retorna sem handle, evitando duplicidade em sandbox de
   *   userscript que abre a guia mesmo retornando null.
   * - 2026-03-03 (2.15.14++++++++++++++++++++++++++++++++++++++++++): reforco
   *   do fetch remoto de "Novas requisiÃ§Ãµes" para forcar "sem responsavel"
   *   com variacoes de parametro/valor e tentativas sem filtro de
   *   responsavel, permitindo exibir "Novas" sem marcar o checkbox manual.
   * - 2026-03-03 (2.15.14+++++++++++++++++++++++++++++++++++++++++++): trilha
   *   de diagnostico do fetch de "Novas" + fallback GET/POST e retry imediato
   *   ao marcar "Exibir novas requisiÃ§Ãµes", reduzindo dependencia do estado
   *   visual "sem responsavel" no filtro principal.
   * - 2026-03-03 (2.15.14++++++++++++++++++++++++++++++++++++++++++++): ajuste
   *   de deteccao de "Novas requisiÃ§Ãµes" para aceitar marcadores legados
   *   (classe req_nv e variacoes de texto), evitando falso-zero no parser
   *   remoto quando a situacao nao vem exatamente como "Nova".
   * - 2026-03-03 (2.15.14+++++++++++++++++++++++++++++++++++++++++++++): ajuste
   *   de precisao no filtro de "Novas": remocao do fallback por classe req_nv
   *   (que causava falso-positivo e migrava linhas indevidas de "Aguardando")
   *   mantendo deteccao estrita por texto da coluna Situacao.
   * - 2026-03-03 (2.15.14++++++++++++++++++++++++++++++++++++++++++++++): nova
   *   rodada de compatibilidade no fetch remoto de "Novas", incluindo
   *   variacoes de responsavel com 0/-1 para backends que ignoram vazio.
   * - 2026-03-03 (2.15.14+++++++++++++++++++++++++++++++++++++++++++++++): ajuste
   *   de resiliencia para "Exibir novas requisiÃ§Ãµes": descoberta dinamica do
   *   checkbox "sem responsavel", URL alvo via action do formulario e fallback
   *   legado seguro por req_nv apenas quando a coluna Situacao estiver vazia.
   * - 2026-03-03 (2.15.14++++++++++++++++++++++++++++++++++++++++++++++++): ajuste
   *   de acoplamento entre "sem responsavel" e "Exibir novas requisiÃ§Ãµes":
   *   ao marcar "sem responsavel", ativa automaticamente o quadro de Novas;
   *   se "Novas" estiver ativo e sem resultados, aplica "sem responsavel" e
   *   reenvia filtros para evitar "Nova" ficar visivel no "Aguardando".
   * - 2026-03-03 (2.15.14+++++++++++++++++++++++++++++++++++++++++++++++++): ajuste
   *   de desacoplamento dos filtros: removida qualquer auto-marcacao de
   *   "Exibir sem responsavel" e de "Exibir novas requisiÃ§Ãµes"; o quadro de
   *   Novas volta a funcionar sem alterar o estado visual dos filtros.
   * - 2026-03-03 (2.15.14++++++++++++++++++++++++++++++++++++++++++++++++++): ajuste
   *   de compatibilidade no fetch remoto de Novas: envio de sinalizadores de
   *   submit/filtro (inclusive x/y de botoes imagem) para backends que so
   *   aplicam o filtro quando reconhecem acao explicita de consulta.
   * - 2026-03-03 (2.15.14+++++++++++++++++++++++++++++++++++++++++++++++++++): ajuste
   *   de descoberta do campo "Responsavel" no formulario de filtros (por
   *   rotulo/controle), para variar responsavel em branco/0/-1 no fetch
   *   remoto sem depender de nomes fixos de parametro no backend legado.
   * - 2026-03-03 (2.15.14++++++++++++++++++++++++++++++++++++++++++++++++++++): reforco
   *   de compatibilidade para "sem responsavel" no fetch remoto: deteccao de
   *   campos ocultos/legados por id+name+label e preenchimento de variantes
   *   hidden associadas, sem alterar o estado visual dos checkboxes locais.
   * - 2026-03-03 (2.15.14+++++++++++++++++++++++++++++++++++++++++++++++++++++): ajuste
   *   de escopo da secao "Novas requisiÃ§Ãµes": passa a considerar situacoes
   *   iniciadas por "Nova"/"Novas" (ex.: "Novas informaÃ§Ãµes") somente no
   *   recorte da secao, mantendo regra estrita de "Nova" nos fluxos de
   *   1o atendimento automatico.
   * - 2026-03-03 (2.15.14++++++++++++++++++++++++++++++++++++++++++++++++++++++): reforco
   *   de submitters no fetch remoto de Novas: envia sinais de submit
   *   reconhecidos e, no fallback, qualquer submitter nomeado do formulario
   *   para backends que ignoram filtros sem marcador explicito de consulta.
   * - 2026-03-03 (2.15.14+++++++++++++++++++++++++++++++++++++++++++++++++++++++): ajuste
   *   de consistencia no cache remoto de Novas: chave passa a incluir
   *   snapshot do formulario visivel e refresh periodico em background para
   *   evitar reaproveitamento prolongado de recorte antigo (ex.: total 5).
   * - 2026-03-03 (2.15.14++++++++++++++++++++++++++++++++++++++++++++++++++++++++): ajuste
   *   de criterio da secao "Novas requisiÃ§Ãµes": recorte voltou a ser estrito
   *   para situacao iniciada por "Nova", sem incluir "Novas informaÃ§Ãµes".
   * - 2026-03-03 (2.15.14+++++++++++++++++++++++++++++++++++++++++++++++++++++++++): ajuste
   *   funcional da secao "Novas requisiÃ§Ãµes" para considerar situacoes
   *   iniciadas por "Nova"/"Novas" no recorte visual, mantendo fluxo de
   *   1o atendimento estrito apenas para situacao "Nova".
   * - 2026-03-03 (2.15.14++++++++++++++++++++++++++++++++++++++++++++++++++++++++++): revisao
   *   de regra por validacao funcional: secao "Novas requisiÃ§Ãµes" voltou a
   *   considerar somente situacao "Nova" (nao inclui "Novas informaÃ§Ãµes").
   * - 2026-03-03 (2.15.14+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++): fallback
   *   backend "por tras" para Novas sem marcar visualmente "sem responsavel":
   *   snapshot temporario do formulario com checkbox forcado em memoria para
   *   capturar campos ocultos/legados exigidos no request remoto.
   * Mapa rapido de modulos (ordem geral):
   * 1) CSS global injetado via template literal.
   * 2) Utilitarios base (normalizacao, tema, cabecalho, filtros).
   * 3) Personalizacoes por pagina (login/home/dashboard/request/users/user-form).
   * 4) Regras de dashboard (chips, SLA externo, colunas, 1o atendimento).
   * 5) Utilitarios de requisicao (datas, campos, nomes, texto, formulario).
   * 6) IA e quick actions (gratis/pago, split button, fluxo de envio).
   * 7) Toast, popup, envio de 1o atendimento e navegacao por clique.
   * 8) Diagnostico de abertura (trace + dump + toggle em runtime).
   * 9) Orquestracao resiliente (safeRun + MutationObserver + resize hooks).
   *
   * Matriz de rastreabilidade (pagina -> funcoes principais):
   * - Login:
   *   - styleLoginPage
   *   - ensureThemeBtn
   * - Home:
   *   - styleHomePage
   *   - adjustHomeTopOffset
   * - Dashboard:
   *   - styleDashboardPage
   *   - markServiceRows
   *   - signalExternalReturnSlaRules
   *   - ensureCountBadges
   *   - normalizeDashboardTableWidths
   *   - ensureDashboardEmptyState
   * - Consulta de requisicoes:
   *   - ensureConsultaPrimeiroAtendimentoButtons
   *   - bindRowAndLogoClicks
   * - Visualizar requisicao:
   *   - styleRequestPage
   *   - alignRequestHeaderActions
   *   - layoutRequestCalendarAndConsumption
   *   - ensureRequestQuickActions
   *   - runAutoConcluirIfPending
   *   - openReqPopup / closeReqPopup
   * - Consulta de usuarios:
   *   - enhanceUsersPage
   *   - adjustUsersTopOffset
   * - Visualizar usuario:
   *   - styleUserFormPage
   *   - adjustUserFormTopOffset
   *
   * Mapa de dependencias (alto nivel):
   * - safeRun -> funcoes de estilo, regras de negocio, binds e layout.
   * - ensureRequestQuickActions -> findRequestActionElements, setTextAndSend,
   *   improveWithOpenAI/improveWithGeminiFree, buildGptReplyText.
   * - bindRowAndLogoClicks -> extractNumero, openNewTab, openReqPopup,
   *   enviarPrimeiroAtendimento.
   * - signalExternalReturnSlaRules -> parsePtBrDateTime + hasElapsedDays.
   *
   * Guia de localizacao rapida:
   * - Cada bloco principal comeca com comentario "SECTION: ...".
   * - Cada funcao possui JSDoc padrao imediatamente acima:
   *   Objetivo, Contexto, Parametros, Retorno, Efeitos colaterais.
   * - Para localizar funcionalidade, busque por:
   *   - nome da funcao (ex.: ensureRequestQuickActions)
   *   - secao (ex.: SECTION: IA E CREDENCIAIS)
   *   - pagina alvo (ex.: visualizar_requisicao.php)
   *
   * Protocolo recomendado para futuras alteracoes:
   * - Informar: pagina alvo + funcao alvo + comportamento atual + comportamento desejado.
   * - Evitar pedidos vagos como "arruma layout"; preferir "ajustar botao X na funcao Y".
   * - Ao adicionar nova regra, manter o padrao:
   *   1) Comentario de secao
   *   2) JSDoc da funcao
   *   3) Guard rails de idempotencia (dataset/validacoes)
   *   4) Fallback para DOM legado quando aplicavel
   * - Para rollout incremental, preferir controlar via FEATURE_FLAGS.
   *
   * Politica obrigatoria de documentacao (padrao deste arquivo):
   * - Toda alteracao funcional deve atualizar a documentacao no mesmo ajuste.
   * - Sempre documentar o que mudou, onde mudou e impacto esperado.
   * - Nao criar logica nova sem JSDoc imediatamente acima da funcao alterada/criada.
   * - Se houver mudanca de fluxo, atualizar este cabecalho tecnico.
   *
   * Observacao de manutencao:
   * - Este script roda em DOM legado dinamico; por isso, varias rotinas sao
   *   idempotentes e executadas repetidamente com guard rails de dataset.
   * - Mudancas de UI devem preservar seletores legados e fallbacks existentes.
   * ============================================================================
   */
  /* --------------------------- SECTION: CSS GLOBAL --------------------------- */
  const CSS = `
  :root{
    --bg:#0e141d; --fg:#dce6f2;
    --panel:#121a26; --panel2:#182231; --border:#2f3f52;
    --ok:#22c55e; --bad:#ef4444; --neutral:#e6edf3;
    --chip-bg:#0f1826; --chip-dot:#22c55e;
    --row1:#121b29; --row2:#172334;
    --accent:#3a6fae;
    --link:#8db8ee; --link-hover:#b8d3f3;
    --hs-table-row1:#121b29;
    --hs-table-row2:#162131;
    --hs-table-surface:#131c29;
    --hs-table-border:#33475c;
    --hs-table-head-bg:#162536;
    --hs-table-head-fg:#dce6f2;
    --hs-table-head-border:#39516a;
    --hs-table-body-border:#304459;
    --hs-table-hover-bg:#1a293b;
    --hs-table-shadow:0 8px 18px rgba(0,0,0,.14);
    --hs-table-head-py:8.5px;
    --hs-table-head-px:11px;
    --hs-table-cell-py:9px;
    --hs-table-cell-px:11px;
    --hs-table-font-size:13px;
    --hs-table-line-height:1.56;
    --hs-body-font:'Segoe UI', Tahoma, sans-serif;
    --hs-wallpaper-image:none;
    --hs-wallpaper-overlay:rgba(14,20,29,.96);
    --hs-border-width:1px;
    --hs-radius-control:8px;
    --hs-radius-card:12px;
    --hs-radius-table:14px;
    --hs-dashboard-grid-user-width:auto;
  }
  html[data-hs-theme="light"]{
    --bg:#ffffff; --fg:#0f172a;
    --panel:#f8fafc; --panel2:#eef2f7; --border:#d0d7de;
    --ok:#16a34a; --bad:#dc2626; --neutral:#0f172a;
    --chip-bg:#f1f5f9; --chip-dot:#16a34a;
    --row1:#ffffff; --row2:#f6f8fa;
    --accent:#1f5fb4;
    --link:#0b57d0; --link-hover:#0842a0;
    --hs-table-row1:#ffffff;
    --hs-table-row2:#f6f9fd;
    --hs-table-surface:#fbfdff;
    --hs-table-border:#d7e3f1;
    --hs-table-head-bg:#edf3fb;
    --hs-table-head-fg:#16385d;
    --hs-table-head-border:#d2dfee;
    --hs-table-body-border:#dde6f2;
    --hs-table-hover-bg:#eef5ff;
    --hs-table-shadow:0 8px 18px rgba(20,45,90,.06);
    --hs-wallpaper-overlay:rgba(255,255,255,.95);
  }
  html[data-hs-corner="square"] :is(
    input,
    select,
    textarea,
    button,
    form[name="filtros"],
    table.sortable,
    .hs-update-modal-card,
    .hs-image-viewer-card,
    .hs-text-viewer-card,
    .hs-attach-thumb,
    .hs-settings-menu-popover,
    .hs-settings-version-card
  ){
    border-radius:0!important;
  }

  html,body{
    background-color:var(--bg)!important;
    color:var(--fg)!important;
    font-family:var(--hs-body-font)!important;
  }
  body{
    background-image:
      linear-gradient(var(--hs-wallpaper-overlay), var(--hs-wallpaper-overlay)),
      var(--hs-wallpaper-image)!important;
    background-size:cover!important;
    background-position:center center!important;
    background-attachment:fixed!important;
  }

  #${BADGE_ID}{
    position:fixed; right:14px; bottom:14px; z-index:999999;
    background:var(--accent); color:#fff; border-radius:999px;
    padding:6px 10px; font:700 11px/1 Manrope,Segoe UI,sans-serif;
    box-shadow:0 8px 22px rgba(0,0,0,.35); pointer-events:none;
  }

  form[name="filtros"], #conteudo>table[width="100%"]{
    background:var(--panel)!important; border-bottom:var(--hs-border-width) solid var(--border)!important;
  }
  select, input, textarea, button{
    background:var(--panel2)!important; border:var(--hs-border-width) solid var(--border)!important; color:var(--fg)!important;
    border-radius:var(--hs-radius-control)!important; padding:3px 6px!important;
  }
  a, h1,h2,h3,strong,b{ color:var(--fg)!important; }

  table.sortable{
    border-collapse:separate!important;
    border-spacing:0!important;
    width:100%!important;
    background:var(--hs-table-surface)!important;
  }
  table.sortable thead th{
    background:var(--hs-table-head-bg)!important;
    color:var(--hs-table-head-fg)!important;
    border-bottom:var(--hs-border-width) solid var(--hs-table-head-border)!important;
    padding:var(--hs-table-head-py) var(--hs-table-head-px)!important;
  }
  table.sortable tbody td{
    border-bottom:var(--hs-border-width) solid var(--hs-table-body-border)!important;
    padding:var(--hs-table-cell-py) var(--hs-table-cell-px)!important;
    color:var(--neutral)!important;
    overflow-wrap:anywhere;
  }
  table.sortable tbody tr:nth-child(odd) td{ background:var(--hs-table-row1)!important; }
  table.sortable tbody tr:nth-child(even) td{ background:var(--hs-table-row2)!important; }
  table.sortable tbody tr[data-hs-sit-row-bg] > td{
    background:var(--hs-sit-row-bg)!important;
    background-color:var(--hs-sit-row-bg)!important;
  }

  /* Tabelas internas da tela de visualizacao (nao sortable) */
  html[data-hs-theme="dark"] body:not(.hs-dashboard-page) #conteudo table:not(.sortable){
    background:var(--panel)!important;
    border:1px solid var(--border)!important;
  }
  html[data-hs-theme="dark"] body:not(.hs-dashboard-page) #conteudo table:not(.sortable) td,
  html[data-hs-theme="dark"] body:not(.hs-dashboard-page) #conteudo table:not(.sortable) th{
    background:var(--panel)!important;
    color:var(--fg)!important;
    border:1px solid var(--border)!important;
  }
  html[data-hs-theme="dark"] body:not(.hs-dashboard-page) #conteudo table:not(.sortable) tr:nth-child(even) td{
    background:#111a27!important;
  }
  html[data-hs-theme="dark"] body:not(.hs-dashboard-page) #conteudo table:not(.sortable) tr:nth-child(odd) td{
    background:#0f1620!important;
  }

  /* Mantem cabecalhos de destaque em azul */
  html[data-hs-theme="dark"] body:not(.hs-dashboard-page) #conteudo table:not(.sortable) th,
  html[data-hs-theme="dark"] body:not(.hs-dashboard-page) #conteudo table:not(.sortable) td[bgcolor="#003366"],
  html[data-hs-theme="dark"] body:not(.hs-dashboard-page) #conteudo table:not(.sortable) td[style*="003366"]{
    background:#002a52!important;
    color:#eaf2ff!important;
    font-weight:700!important;
  }

  /* Campos e placeholders */
  html[data-hs-theme="dark"] input::placeholder,
  html[data-hs-theme="dark"] textarea::placeholder{
    color:#93a4bd!important;
    opacity:1!important;
  }
  html[data-hs-theme="dark"] option{
    background:#0f1620!important;
    color:#e6edf3!important;
  }

  /* Calendario / datepicker legado */
  html[data-hs-theme="dark"] .calendar,
  html[data-hs-theme="dark"] .calendario,
  html[data-hs-theme="dark"] #calendar,
  html[data-hs-theme="dark"] [id*="calend"],
  html[data-hs-theme="dark"] [class*="calend"]{
    background:#0f1620!important;
    color:#e6edf3!important;
    border-color:var(--border)!important;
  }
  html[data-hs-theme="dark"] .calendar table td,
  html[data-hs-theme="dark"] .calendar table th,
  html[data-hs-theme="dark"] [class*="calend"] td,
  html[data-hs-theme="dark"] [class*="calend"] th{
    background:#0f1620!important;
    color:#e6edf3!important;
    border-color:var(--border)!important;
  }
  html[data-hs-theme="dark"] .calendar .today,
  html[data-hs-theme="dark"] .calendar .active,
  html[data-hs-theme="dark"] [class*="calend"] .today,
  html[data-hs-theme="dark"] [class*="calend"] .active{
    background:#1f5fb4!important;
    color:#fff!important;
  }

  /* Dia selecionado com contraste alto */
  html[data-hs-theme="dark"] .calendar td.selected,
  html[data-hs-theme="dark"] .calendar td[selected],
  html[data-hs-theme="dark"] .calendar td.sel,
  html[data-hs-theme="dark"] .calendar td.current,
  html[data-hs-theme="dark"] .calendar td.hoje,
  html[data-hs-theme="dark"] .calendar td[style*="background"],
  html[data-hs-theme="dark"] [class*="calend"] td.selected,
  html[data-hs-theme="dark"] [class*="calend"] td[selected],
  html[data-hs-theme="dark"] [class*="calend"] td.sel,
  html[data-hs-theme="dark"] [class*="calend"] td.current,
  html[data-hs-theme="dark"] [class*="calend"] td.hoje{
    background:#ffffff!important;
    color:#0b1320!important;
    font-weight:800!important;
    outline:2px solid #ffffff!important;
    box-shadow:0 0 0 2px rgba(255,255,255,.38) inset!important;
    border-color:#ffffff!important;
    border-radius:6px!important;
  }

  html[data-hs-theme="dark"] .calendar td.selected a,
  html[data-hs-theme="dark"] .calendar td[selected] a,
  html[data-hs-theme="dark"] .calendar td.sel a,
  html[data-hs-theme="dark"] .calendar td.current a,
  html[data-hs-theme="dark"] [class*="calend"] td.selected a,
  html[data-hs-theme="dark"] [class*="calend"] td[selected] a,
  html[data-hs-theme="dark"] [class*="calend"] td.sel a,
  html[data-hs-theme="dark"] [class*="calend"] td.current a{
    color:#0b1320!important;
    font-weight:800!important;
  }

  html[data-hs-theme="light"] .calendar td.selected,
  html[data-hs-theme="light"] .calendar td[selected],
  html[data-hs-theme="light"] .calendar td.sel,
  html[data-hs-theme="light"] .calendar td.current,
  html[data-hs-theme="light"] .calendar td.hoje,
  html[data-hs-theme="light"] .calendar td[style*="background"],
  html[data-hs-theme="light"] [class*="calend"] td.selected,
  html[data-hs-theme="light"] [class*="calend"] td[selected],
  html[data-hs-theme="light"] [class*="calend"] td.sel,
  html[data-hs-theme="light"] [class*="calend"] td.current,
  html[data-hs-theme="light"] [class*="calend"] td.hoje{
    background:#000000!important;
    color:#ffffff!important;
    font-weight:800!important;
    outline:2px solid #000000!important;
    box-shadow:0 0 0 2px rgba(0,0,0,.28) inset!important;
    border-color:#000000!important;
    border-radius:6px!important;
  }

  html[data-hs-theme="light"] .calendar td.selected a,
  html[data-hs-theme="light"] .calendar td[selected] a,
  html[data-hs-theme="light"] .calendar td.sel a,
  html[data-hs-theme="light"] .calendar td.current a,
  html[data-hs-theme="light"] [class*="calend"] td.selected a,
  html[data-hs-theme="light"] [class*="calend"] td[selected] a,
  html[data-hs-theme="light"] [class*="calend"] td.sel a,
  html[data-hs-theme="light"] [class*="calend"] td.current a{
    color:#ffffff!important;
    font-weight:800!important;
  }

  /* Fallback universal: classe aplicada via JS ao dia escolhido */
  html[data-hs-theme="dark"] .hs-cal-selected{
    background:#ffffff!important;
    color:#0b1320!important;
    border:2px solid #ffffff!important;
    box-shadow:0 0 0 2px rgba(255,255,255,.38)!important;
    font-weight:900!important;
    border-radius:6px!important;
  }
  html[data-hs-theme="dark"] .hs-cal-selected *{
    color:#0b1320!important;
    font-weight:900!important;
  }
  html[data-hs-theme="light"] .hs-cal-selected{
    background:#000000!important;
    color:#ffffff!important;
    border:2px solid #000000!important;
    box-shadow:0 0 0 2px rgba(0,0,0,.28)!important;
    font-weight:900!important;
    border-radius:6px!important;
  }
  html[data-hs-theme="light"] .hs-cal-selected *{
    color:#ffffff!important;
    font-weight:900!important;
  }

  tr.req_at td, tr.req_at td *{ color:var(--bad)!important; font-weight:700!important; }
  tr.hs-em100:not(.req_at) td, tr.hs-em100:not(.req_at) td *{ color:var(--bad)!important; font-weight:700!important; }
  tr.req_nv:not(.req_at):not(.hs-em100) td,
  tr.req_nv:not(.req_at):not(.hs-em100) td *,
  tr.req_sr:not(.req_at):not(.hs-em100) td,
  tr.req_sr:not(.req_at):not(.hs-em100) td *{ color:var(--ok)!important; font-weight:700!important; }
  tr.hs-em:not(.req_at):not(.hs-em100) td,
  tr.hs-em:not(.req_at):not(.hs-em100) td *{ color:var(--neutral)!important; font-weight:600!important; }
  tr.hs-servico-aprovado:not(.req_at) td,
  tr.hs-servico-aprovado:not(.req_at) td *{
    color:#ffffff!important;
    font-weight:800!important;
    text-shadow:0 0 1px rgba(0,0,0,.88), 0 0 8px rgba(255,255,255,.62)!important;
  }

  #cabecalho_menu #${BTN_ID}{
    display:inline-flex; align-items:center; gap:6px;
    margin-left:8px; padding:2px 8px; border-radius:14px;
    border:1px solid var(--border); background:var(--panel2); color:var(--fg); cursor:pointer;
    font-weight:600;
  }
  #cabecalho_menu #${BTN_ID}:hover{ filter:brightness(1.1); }

  #cabecalho_logo img{ height:56px!important; width:auto!important; object-fit:contain!important; }

  .hs-chip{
    margin-left:8px; display:inline-flex; align-items:center; gap:6px;
    padding:2px 8px; border-radius:999px; background:var(--chip-bg); border:1px solid var(--border);
    color:var(--fg); font-weight:700; font-size:12px;
  }
  .hs-chip .lbl{ opacity:.92; font-weight:700; }
  .hs-chip .dot{ width:8px; height:8px; border-radius:50%; background:var(--chip-dot); display:inline-block; }
  .hs-chip.hs-chip-total .dot{ background:#60a5fa; }
  .hs-chip.hs-chip-red .dot{ background:var(--bad); }
  .hs-chip.hs-chip-green .dot{ background:var(--ok); }

  .hs-toast-wrap{
    position:fixed; right:14px; bottom:44px; z-index:999999;
    display:flex; flex-direction:column; gap:8px; pointer-events:none;
  }
  .hs-toast{
    min-width:240px; max-width:360px; padding:10px 12px; border-radius:10px;
    background:var(--panel2); border:1px solid var(--border); color:var(--fg);
    box-shadow:0 6px 22px rgba(0,0,0,.35); pointer-events:auto;
    display:flex; align-items:center; gap:10px; font-size:13px;
  }
  .hs-toast .dot{ width:9px;height:9px;border-radius:50%; background:#888; }
  .hs-toast.info .dot{ background:#60a5fa; }
  .hs-toast.ok .dot{ background:#22c55e; }
  .hs-toast.err .dot{ background:#ef4444; }
  .hs-toast.soft .dot{ background:#38bdf8; }

  .hs-update-modal{
    position:fixed;
    inset:0;
    z-index:1000032;
    display:none;
  }
  .hs-update-modal.open{ display:block; }
  .hs-update-modal-backdrop{
    position:absolute;
    inset:0;
    background:rgba(2,8,18,.64);
  }
  .hs-update-modal-card{
    position:absolute;
    width:min(860px, 94vw);
    max-height:90vh;
    top:5vh;
    left:50%;
    transform:translateX(-50%);
    display:flex;
    flex-direction:column;
    border-radius:var(--hs-radius-card);
    overflow:hidden;
    background:var(--panel);
    border:1px solid var(--border);
    box-shadow:0 20px 58px rgba(0,0,0,.45);
  }
  .hs-update-modal-head{
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:12px;
    padding:10px 12px;
    background:var(--panel2);
    border-bottom:1px solid var(--border);
    color:var(--fg);
    font-weight:800;
  }
  .hs-update-modal-head button{
    min-height:26px!important;
    height:26px!important;
    padding:2px 10px!important;
    border-radius:var(--hs-radius-control)!important;
    cursor:pointer;
  }
  .hs-update-modal .hs-force-hide{
    display:none!important;
  }
  .hs-update-modal.hs-update-modal-mandatory .hs-update-modal-card{
    border:2px solid #b91c1c!important;
    box-shadow:0 24px 64px rgba(127, 29, 29, .45)!important;
  }
  .hs-update-modal.hs-update-modal-mandatory .hs-update-modal-head{
    background:linear-gradient(180deg, #7f1d1d, #450a0a)!important;
    color:#fff4f4!important;
    border-bottom-color:#991b1b!important;
  }
  .hs-update-modal.hs-update-modal-mandatory .hs-update-modal-status{
    color:#ffd7d7!important;
    font-weight:800!important;
  }
  .hs-update-modal.hs-update-modal-mandatory .hs-update-modal-actions button.is-main{
    background:linear-gradient(180deg, #ef4444, #b91c1c)!important;
    border-color:#7f1d1d!important;
    color:#fff7f7!important;
  }
  .hs-update-modal-body{
    padding:12px;
    overflow:auto;
    color:var(--fg);
    display:flex;
    flex-direction:column;
    gap:10px;
  }
  .hs-update-modal-status{
    font-size:12px;
    line-height:1.35;
    opacity:.95;
    margin:0;
  }
  .hs-update-modal-url-wrap{
    display:flex;
    gap:8px;
    align-items:center;
  }
  .hs-update-modal-url{
    flex:1 1 auto;
    min-width:0;
    border:1px solid var(--border);
    border-radius:var(--hs-radius-control);
    background:rgba(15,23,42,.28);
    color:var(--fg);
    padding:8px 10px;
    font-size:12px;
    line-height:1.3;
    white-space:nowrap;
    overflow:auto;
  }
  .hs-update-modal-actions{
    display:flex;
    flex-wrap:wrap;
    gap:8px;
  }
  .hs-update-modal-actions button{
    min-height:28px!important;
    border-radius:var(--hs-radius-control)!important;
    padding:4px 10px!important;
    font-size:11px!important;
    font-weight:700!important;
    cursor:pointer;
  }
  .hs-update-modal-actions button.is-main{
    background:linear-gradient(180deg, #ffe9a8, #f6d36a)!important;
    border-color:#e5bf4f!important;
    color:#1f2b18!important;
  }
  .hs-update-modal-code details{
    border:1px solid var(--border);
    border-radius:var(--hs-radius-card);
    background:rgba(15,23,42,.18);
    padding:8px;
  }
  .hs-update-modal-code summary{
    cursor:pointer;
    font-weight:700;
    font-size:12px;
  }
  .hs-update-modal-code-tools{
    margin-top:8px;
    display:flex;
    justify-content:flex-end;
    gap:8px;
  }
  .hs-update-modal-code-tools button{
    min-height:24px!important;
    border-radius:var(--hs-radius-control)!important;
    padding:2px 9px!important;
    font-size:10px!important;
    font-weight:700!important;
    cursor:pointer;
  }
  .hs-update-modal-code textarea{
    width:100%;
    min-height:260px;
    margin-top:8px;
    border:1px solid var(--border);
    border-radius:var(--hs-radius-control);
    background:rgba(2,6,14,.62);
    color:#f8fbff;
    font-size:11px;
    line-height:1.35;
    padding:8px;
    resize:vertical;
  }
  @media (max-width:760px){
    .hs-update-modal-card{
      width:min(96vw, 96vw);
      top:2vh;
      max-height:95vh;
    }
    .hs-update-modal-url-wrap{
      flex-direction:column;
      align-items:stretch;
    }
  }
  .hs-updates-log-modal .hs-update-modal-card{
    width:min(940px, 96vw);
  }
  .hs-updates-log-meta{
    font-size:12px;
    line-height:1.35;
    opacity:.96;
  }
  .hs-updates-log-rules{
    margin:0;
    padding-left:18px;
    display:flex;
    flex-direction:column;
    gap:4px;
    font-size:12px;
    line-height:1.3;
  }
  .hs-updates-log-list{
    display:flex;
    flex-direction:column;
    gap:10px;
  }
  .hs-updates-log-item{
    border:1px solid var(--border);
    border-radius:var(--hs-radius-card);
    background:rgba(15,23,42,.18);
    padding:9px 10px;
    color:var(--fg);
  }
  .hs-updates-log-item.is-highlight{
    border-color:#d6b54f;
    box-shadow:0 0 0 1px rgba(214,181,79,.34) inset;
    background:linear-gradient(180deg, rgba(214,181,79,.12), rgba(15,23,42,.18));
  }
  .hs-updates-log-item-head{
    display:flex;
    flex-wrap:wrap;
    align-items:center;
    gap:8px;
    font-size:12px;
    line-height:1.3;
    font-weight:800;
  }
  .hs-updates-log-item-head .date{
    opacity:.82;
    font-weight:600;
  }
  .hs-updates-log-item ul{
    margin:7px 0 0;
    padding-left:18px;
    display:flex;
    flex-direction:column;
    gap:3px;
    font-size:12px;
    line-height:1.3;
  }
  .hs-updates-log-empty{
    font-size:12px;
    line-height:1.35;
    opacity:.9;
  }
  .hs-updates-log-footer{
    font-size:11px;
    line-height:1.3;
    opacity:.75;
  }
  .hs-image-viewer{
    position:fixed;
    inset:0;
    z-index:1000034;
    display:none;
  }
  .hs-image-viewer.open{ display:block; }
  .hs-image-viewer-backdrop{
    position:absolute;
    inset:0;
    background:rgba(2,8,18,.72);
  }
  .hs-image-viewer-card{
    position:absolute;
    top:4vh;
    left:50%;
    transform:translateX(-50%);
    width:min(var(--hs-image-viewer-card-width, 980px), 96vw);
    max-height:92vh;
    display:flex;
    flex-direction:column;
    border-radius:var(--hs-radius-card);
    overflow:hidden;
    background:var(--panel);
    border:1px solid var(--border);
    box-shadow:0 20px 58px rgba(0,0,0,.45);
  }
  .hs-image-viewer-head{
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:10px;
    padding:8px 10px;
    background:var(--panel2);
    border-bottom:1px solid var(--border);
    color:var(--fg);
    font-size:12px;
    font-weight:800;
  }
  .hs-image-viewer-actions{
    display:inline-flex;
    align-items:center;
    justify-content:flex-end;
    gap:6px;
    flex-wrap:wrap;
  }
  .hs-image-viewer-zoom{
    min-width:52px;
    text-align:center;
    font-size:11px;
    font-weight:700;
    opacity:.9;
    font-variant-numeric:tabular-nums;
  }
  .hs-image-viewer-head button{
    min-height:25px!important;
    height:25px!important;
    border-radius:var(--hs-radius-control)!important;
    padding:2px 10px!important;
    cursor:pointer;
    font-size:11px!important;
    font-weight:800!important;
  }
  .hs-image-viewer-body{
    display:flex;
    flex-direction:column;
    justify-content:center;
    align-items:center;
    padding:10px;
    overflow:auto;
    min-height:80px;
    max-height:var(--hs-image-viewer-body-max-height, calc(92vh - 42px));
    gap:10px;
    overscroll-behavior:contain;
  }
  .hs-image-viewer-body.zoomed{
    cursor:grab;
    justify-content:flex-start;
    align-items:flex-start;
  }
  .hs-image-viewer-body.dragging{ cursor:grabbing; }
  .hs-image-viewer-state{
    margin:0;
    font-size:12px;
    line-height:1.35;
    color:var(--fg);
    opacity:.88;
    display:none;
  }
  .hs-image-viewer-body img{
    max-width:none;
    max-height:none;
    width:auto;
    height:auto;
    flex:0 0 auto;
    object-fit:contain;
    border-radius:var(--hs-radius-control);
    border:1px solid var(--border);
    background:rgba(2,8,18,.45);
    user-select:none;
    -webkit-user-drag:none;
    cursor:inherit;
  }
  .hs-text-viewer{
    position:fixed;
    inset:0;
    z-index:1000035;
    display:none;
  }
  .hs-text-viewer.open{ display:block; }
  .hs-text-viewer-backdrop{
    position:absolute;
    inset:0;
    background:rgba(2,8,18,.74);
  }
  .hs-text-viewer-card{
    position:absolute;
    top:4vh;
    left:50%;
    transform:translateX(-50%);
    width:min(1120px, 97vw);
    max-height:92vh;
    display:flex;
    flex-direction:column;
    border-radius:var(--hs-radius-card);
    overflow:hidden;
    background:#0f1724;
    border:1px solid #2d4056;
    box-shadow:0 20px 58px rgba(0,0,0,.5);
  }
  .hs-text-viewer-head{
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:10px;
    padding:8px 10px;
    background:#162638;
    border-bottom:1px solid #2b3f56;
    color:#dce8f8;
    font-size:12px;
    font-weight:800;
  }
  .hs-text-viewer-actions{
    display:inline-flex;
    align-items:center;
    gap:6px;
  }
  .hs-text-viewer-actions button{
    min-height:25px!important;
    height:25px!important;
    border-radius:var(--hs-radius-control)!important;
    padding:2px 10px!important;
    cursor:pointer;
    font-size:11px!important;
    font-weight:800!important;
  }
  .hs-text-viewer-link-wrap{
    margin:0 0 8px;
    display:flex;
    align-items:center;
    gap:8px;
  }
  .hs-text-viewer-link{
    width:100%;
    min-height:30px;
    border-radius:var(--hs-radius-control);
    border:1px solid #2c415a;
    background:#0e1828;
    color:#cfe0f5;
    font-size:12px;
    line-height:1.3;
    padding:6px 9px;
    font-family:'Segoe UI',Tahoma,sans-serif;
  }
  .hs-text-viewer-link::selection{
    background:rgba(56,189,248,.28);
  }
  .hs-text-viewer-body{
    padding:10px;
    overflow:auto;
    min-height:180px;
    max-height:calc(92vh - 44px);
    background:#0b1320;
  }
  .hs-text-viewer-state{
    margin:0 0 8px;
    font-size:12px;
    line-height:1.35;
    color:#c9daef;
    opacity:.9;
    display:none;
  }
  .hs-text-viewer-code{
    margin:0;
    border-radius:var(--hs-radius-control);
    border:1px solid #2c415a;
    background:#101a29;
    color:#d8e6f7;
    padding:12px;
    font-family:Consolas, "Cascadia Mono", "Courier New", monospace;
    font-size:12px;
    line-height:1.48;
    white-space:pre;
    overflow:auto;
    min-height:56vh;
  }
  @media (max-width:760px){
    .hs-image-viewer-card{
      top:2vh;
      max-height:96vh;
      width:min(98vw, 98vw);
    }
    .hs-image-viewer-head{
      align-items:flex-start;
      flex-direction:column;
    }
    .hs-image-viewer-actions{
      width:100%;
    }
    .hs-image-viewer-body{
      max-height:calc(96vh - 42px);
      padding:8px;
    }
    .hs-text-viewer-card{
      top:2vh;
      max-height:96vh;
      width:min(98vw, 98vw);
    }
    .hs-text-viewer-body{
      max-height:calc(96vh - 42px);
      padding:8px;
    }
  }

  @keyframes hsRowAlertBlinkNew{
    0%,100%{ box-shadow: inset 0 0 0 999px rgba(56,189,248,0); }
    50%{ box-shadow: inset 0 0 0 999px rgba(56,189,248,.23); }
  }
  @keyframes hsRowAlertBlinkChanged{
    0%,100%{ box-shadow: inset 0 0 0 999px rgba(245,158,11,0); }
    50%{ box-shadow: inset 0 0 0 999px rgba(245,158,11,.20); }
  }
  table.sortable tbody tr.hs-row-blink-new td{
    animation:hsRowAlertBlinkNew .95s ease-in-out 1 both;
  }
  table.sortable tbody tr.hs-row-blink-changed td{
    animation:hsRowAlertBlinkChanged .95s ease-in-out 1 both;
  }
  table.sortable tbody tr.hs-row-alert td:first-child{
    position:relative!important;
  }
  .hs-row-state-dot{
    position:absolute!important;
    top:6px!important;
    right:6px!important;
    width:8px!important;
    height:8px!important;
    border-radius:50%!important;
    pointer-events:none!important;
    box-shadow:0 0 0 2px rgba(9,14,22,.85), 0 0 8px rgba(0,0,0,.24)!important;
  }
  .hs-row-state-dot.is-new{
    background:#38bdf8!important;
  }
  .hs-row-state-dot.is-changed{
    background:#f59e0b!important;
  }

  .hs-req-pop{
    position:fixed; inset:0; z-index:1000001; display:none;
  }
  .hs-req-pop.open{ display:block; }
  .hs-req-pop-backdrop{
    position:absolute; inset:0; background:rgba(2,8,18,.62);
  }
  .hs-req-pop-card{
    position:absolute; inset:3.5vh 2.5vw;
    display:flex; flex-direction:column;
    background:var(--panel); border:1px solid var(--border);
    border-radius:14px; overflow:hidden;
    box-shadow:0 22px 60px rgba(0,0,0,.45);
  }
  .hs-req-pop-head{
    height:42px; display:flex; align-items:center; justify-content:space-between;
    padding:0 12px; background:var(--panel2); border-bottom:1px solid var(--border);
    color:var(--fg); font-weight:800;
  }
  .hs-req-pop-close{
    min-height:26px!important; height:26px!important; padding:2px 10px!important;
    border-radius:8px!important; cursor:pointer;
  }
  .hs-req-pop-frame{
    flex:1 1 auto; width:100%; border:0; background:#fff;
  }
  html[data-hs-theme="dark"] .hs-req-pop-frame{
    background:#0f1620;
  }

  /* Login: visual moderno (light/dark consistentes) */
  body.hs-login-page{
    min-height:100vh!important;
  }
  body.hs-login-page #${BADGE_ID}{
    display:none!important;
  }
  body.hs-login-page #${BTN_ID}{
    display:inline-flex!important;
    visibility:visible!important;
    opacity:1!important;
    position:fixed!important;
    top:10px!important;
    right:12px!important;
    left:auto!important;
    z-index:1000002!important;
    min-height:30px!important;
    padding:4px 10px!important;
    margin:0!important;
    border-radius:8px!important;
    font-weight:800!important;
  }
  html[data-hs-theme="dark"] body.hs-login-page #${BTN_ID}{
    background:linear-gradient(180deg, #1f2a3c, #1a2433)!important;
    color:#eef5ff!important;
    border:1px solid #425a79!important;
  }
  html[data-hs-theme="light"] body.hs-login-page #${BTN_ID}{
    background:linear-gradient(180deg, #ffffff, #edf3fb)!important;
    color:#17395f!important;
    border:1px solid #b8cde6!important;
  }

  html[data-hs-theme="dark"] body.hs-login-page{
    background:
      radial-gradient(900px 420px at 50% -120px, #12315f 0%, #050b15 62%),
      linear-gradient(180deg, #030813 0%, #040a14 100%) !important;
  }
  html[data-hs-theme="light"] body.hs-login-page{
    background:
      radial-gradient(960px 450px at 50% -130px, #dbe9fb 0%, #eef4fc 48%, #f8fbff 100%),
      linear-gradient(180deg, #f3f8ff 0%, #ffffff 100%) !important;
  }

  body.hs-login-page .hs-login-card{
    width:min(480px, 94vw)!important;
    margin:96px auto 0!important;
    border-radius:16px!important;
    overflow:hidden!important;
    animation:hs-login-in .35s ease-out both;
  }
  body.hs-login-page .hs-login-card > h1:first-child{
    margin:0!important;
    padding:16px 18px!important;
    text-align:center!important;
    font-size:28px!important;
    font-weight:800!important;
    background:linear-gradient(120deg, #0a3a72, #0f4f9c)!important;
    border-bottom:1px solid #2d5f9f!important;
    color:#f2f7ff!important;
    text-shadow:0 1px 0 rgba(0,0,0,.25)!important;
  }
  body.hs-login-page .hs-login-card > form{
    padding:12px 18px 18px!important;
  }
  body.hs-login-page .hs-login-card > form > p{
    margin:0 0 12px!important;
  }
  body.hs-login-page .hs-login-card > form > p:last-child{
    margin-bottom:0!important;
    text-align:center!important;
  }
  html[data-hs-theme="dark"] body.hs-login-page .hs-login-card{
    background:linear-gradient(180deg, #0e1725 0%, #0c1421 100%)!important;
    border:1px solid #32445d!important;
    box-shadow:0 24px 56px rgba(0,0,0,.52)!important;
    color:#e6edf3!important;
  }
  html[data-hs-theme="light"] body.hs-login-page .hs-login-card{
    background:linear-gradient(180deg, #ffffff 0%, #f6f9ff 100%)!important;
    border:1px solid #cfdeef!important;
    box-shadow:0 20px 44px rgba(26, 56, 98, .18)!important;
    color:#17395f!important;
  }

  html[data-hs-theme="dark"] body.hs-login-page .hs-login-card > tbody > tr:first-child td,
  html[data-hs-theme="dark"] body.hs-login-page .hs-login-card > tr:first-child td,
  html[data-hs-theme="light"] body.hs-login-page .hs-login-card > tbody > tr:first-child td,
  html[data-hs-theme="light"] body.hs-login-page .hs-login-card > tr:first-child td{
    background:linear-gradient(120deg, #0a3a72, #0f4f9c)!important;
    border-bottom:1px solid #2d5f9f!important;
    color:#f2f7ff!important;
    font-weight:800!important;
    text-align:center!important;
    padding:16px 18px!important;
    font-size:28px!important;
  }
  body.hs-login-page .hs-login-card > tbody > tr:first-child td *,
  body.hs-login-page .hs-login-card > tr:first-child td *{
    color:inherit!important;
  }
  body.hs-login-page .hs-login-card .hs-login-title-cell,
  body.hs-login-page .hs-login-card .hs-login-title-cell *{
    color:#f2f7ff!important;
    text-shadow:0 1px 0 rgba(0,0,0,.25)!important;
  }
  body.hs-login-page .hs-login-card h1.hs-login-title-cell{
    color:#f2f7ff!important;
    text-shadow:0 1px 0 rgba(0,0,0,.25)!important;
  }
  body.hs-login-page .hs-login-card tr:first-child :is(td,th){
    color:#f2f7ff!important;
  }
  body.hs-login-page .hs-login-card tr:first-child :is(font,b,strong,span,div,a,p){
    color:#f2f7ff!important;
    text-shadow:0 1px 0 rgba(0,0,0,.25)!important;
  }
  body.hs-login-page .hs-login-card tr:not(:first-child) td{
    padding:12px 18px!important;
  }

  html[data-hs-theme="dark"] body.hs-login-page td,
  html[data-hs-theme="dark"] body.hs-login-page th,
  html[data-hs-theme="dark"] body.hs-login-page div{
    background:transparent!important;
    color:#e6edf3!important;
    border-color:#31465e!important;
  }
  html[data-hs-theme="light"] body.hs-login-page td,
  html[data-hs-theme="light"] body.hs-login-page th,
  html[data-hs-theme="light"] body.hs-login-page div{
    background:transparent!important;
    color:#17395f!important;
    border-color:#cddced!important;
  }

  html[data-hs-theme="dark"] body.hs-login-page input:not([type="submit"]):not([type="button"]):not([type="checkbox"]):not([type="radio"]){
    background:#121c2b!important;
    color:#f8fbff!important;
    border:1px solid #3a4e69!important;
  }
  html[data-hs-theme="light"] body.hs-login-page input:not([type="submit"]):not([type="button"]):not([type="checkbox"]):not([type="radio"]){
    background:#f4f7fc!important;
    color:#0f2f58!important;
    border:1px solid #bfd1e8!important;
  }
  body.hs-login-page input:not([type="submit"]):not([type="button"]):not([type="checkbox"]):not([type="radio"]){
    border-radius:10px!important;
    min-height:46px!important;
    padding:11px 13px!important;
    font-size:16px!important;
    width:100%!important;
    box-sizing:border-box!important;
    appearance:none!important;
  }
  html[data-hs-theme="dark"] body.hs-login-page input:not([type="submit"]):not([type="button"]):not([type="checkbox"]):not([type="radio"]):focus{
    border-color:#4f95ef!important;
    box-shadow:0 0 0 3px rgba(79,149,239,.24)!important;
    outline:none!important;
  }
  html[data-hs-theme="light"] body.hs-login-page input:not([type="submit"]):not([type="button"]):not([type="checkbox"]):not([type="radio"]):focus{
    border-color:#4787d8!important;
    box-shadow:0 0 0 3px rgba(71,135,216,.2)!important;
    outline:none!important;
  }
  html[data-hs-theme="dark"] body.hs-login-page input:not([type="submit"]):not([type="button"]):not([type="checkbox"]):not([type="radio"]):-webkit-autofill{
    -webkit-box-shadow:0 0 0 1000px #121c2b inset!important;
    -webkit-text-fill-color:#f8fbff!important;
  }
  html[data-hs-theme="light"] body.hs-login-page input:not([type="submit"]):not([type="button"]):not([type="checkbox"]):not([type="radio"]):-webkit-autofill{
    -webkit-box-shadow:0 0 0 1000px #f4f7fc inset!important;
    -webkit-text-fill-color:#0f2f58!important;
  }

  body.hs-login-page input[type="submit"],
  body.hs-login-page input[type="button"],
  body.hs-login-page button:not(#${BTN_ID}),
  body.hs-login-page .btn{
    background:linear-gradient(120deg, #1f5fb4, #2d78d6)!important;
    color:#fff!important;
    border:1px solid #3f8be2!important;
    border-radius:10px!important;
    min-height:34px!important;
    padding:6px 16px!important;
    font-weight:800!important;
    width:auto!important;
    min-width:110px!important;
    max-width:160px!important;
    display:block!important;
    align-items:center!important;
    justify-content:center!important;
    margin-left:auto!important;
    margin-right:auto!important;
    cursor:pointer!important;
  }
  body.hs-login-page input[type="submit"]:hover,
  body.hs-login-page input[type="button"]:hover,
  body.hs-login-page button:not(#${BTN_ID}):hover,
  body.hs-login-page .btn:hover{
    filter:brightness(1.08)!important;
  }
  @keyframes hs-login-in{
    from{opacity:0; transform:translateY(10px) scale(.985);}
    to{opacity:1; transform:translateY(0) scale(1);}
  }

  /* Home: layout simetrico moderno */
  html[data-hs-theme="dark"] body.hs-home-page #conteudo{
    max-width:1180px!important;
    margin:0 auto!important;
    padding:calc(var(--hs-home-top-offset, 20px) + 20px) 16px 28px!important;
    box-sizing:border-box!important;
  }
  html[data-hs-theme="dark"] body.hs-home-page .hs-home-card{
    width:min(980px, 100%)!important;
    margin:0 auto!important;
    border:1px solid #243548!important;
    border-radius:16px!important;
    overflow:hidden!important;
    background:linear-gradient(180deg, #0d1726 0%, #0c1522 100%)!important;
    box-shadow:0 12px 28px rgba(0,0,0,.3)!important;
    table-layout:fixed!important;
    border-collapse:separate!important;
    border-spacing:0!important;
  }
  html[data-hs-theme="dark"] body.hs-home-page .hs-home-card tr{
    height:118px!important;
  }
  html[data-hs-theme="dark"] body.hs-home-page .hs-home-card tr:first-child{
    display:none!important;
  }
  html[data-hs-theme="dark"] body.hs-home-page .hs-home-card td{
    border-color:#243244!important;
    background:transparent!important;
    vertical-align:middle!important;
    padding:14px 18px!important;
  }
  html[data-hs-theme="dark"] body.hs-home-page .hs-home-card td:first-child{
    width:112px!important;
    text-align:center!important;
    padding:12px 10px!important;
    background:rgba(17,28,43,.55)!important;
  }
  html[data-hs-theme="dark"] body.hs-home-page .hs-home-card img{
    width:64px!important;
    height:64px!important;
    object-fit:contain!important;
    filter:drop-shadow(0 4px 10px rgba(0,0,0,.3));
  }
  html[data-hs-theme="dark"] body.hs-home-page .hs-home-card a{
    color:#f3f8ff!important;
    text-decoration:none!important;
    font-size:15px!important;
    font-weight:700!important;
    line-height:1.35!important;
    display:inline-block!important;
    margin-bottom:6px!important;
  }
  html[data-hs-theme="dark"] body.hs-home-page .hs-home-card a:hover{
    color:#7db2ff!important;
  }
  html[data-hs-theme="dark"] body.hs-home-page .hs-home-card td{
    font-size:15px!important;
    line-height:1.45!important;
    color:#cfddf2!important;
  }
  html[data-hs-theme="dark"] body.hs-home-page .hs-home-card tr:not(:first-child) b,
  html[data-hs-theme="dark"] body.hs-home-page .hs-home-card tr:not(:first-child) strong{
    color:#f2f7ff!important;
    font-size:22px!important;
    line-height:1.25!important;
    display:block!important;
    margin-bottom:8px!important;
  }
  html[data-hs-theme="dark"] body.hs-home-page .hs-home-card tr:not(:first-child):hover td{
    background:rgba(32,53,82,.26)!important;
  }
  html[data-hs-theme="dark"] body.hs-home-page #${BADGE_ID}{
    bottom:18px!important;
    right:18px!important;
  }

  html[data-hs-theme="light"] body.hs-home-page #conteudo{
    max-width:1180px!important;
    margin:0 auto!important;
    padding:calc(var(--hs-home-top-offset, 20px) + 20px) 16px 28px!important;
    box-sizing:border-box!important;
  }
  html[data-hs-theme="light"] body.hs-home-page .hs-home-card{
    width:min(980px, 100%)!important;
    margin:0 auto!important;
    border:1px solid #d4dfef!important;
    border-radius:16px!important;
    overflow:hidden!important;
    background:linear-gradient(180deg, #ffffff 0%, #f6f9ff 100%)!important;
    box-shadow:0 10px 26px rgba(20,45,90,.12)!important;
    table-layout:fixed!important;
    border-collapse:separate!important;
    border-spacing:0!important;
  }
  html[data-hs-theme="light"] body.hs-home-page .hs-home-card tr{
    height:118px!important;
  }
  html[data-hs-theme="light"] body.hs-home-page .hs-home-card tr:first-child{
    display:none!important;
  }
  html[data-hs-theme="light"] body.hs-home-page .hs-home-card td{
    border-color:#d8e3f2!important;
    background:transparent!important;
    vertical-align:middle!important;
    padding:14px 18px!important;
    color:#1e3554!important;
    font-size:15px!important;
    line-height:1.45!important;
  }
  html[data-hs-theme="light"] body.hs-home-page .hs-home-card td:first-child{
    width:112px!important;
    text-align:center!important;
    padding:12px 10px!important;
    background:rgba(229,238,250,.7)!important;
  }
  html[data-hs-theme="light"] body.hs-home-page .hs-home-card img{
    width:64px!important;
    height:64px!important;
    object-fit:contain!important;
    filter:drop-shadow(0 3px 8px rgba(25,59,105,.18));
  }
  html[data-hs-theme="light"] body.hs-home-page .hs-home-card a{
    color:#17375f!important;
    text-decoration:none!important;
    font-size:15px!important;
    font-weight:700!important;
    line-height:1.35!important;
    display:inline-block!important;
    margin-bottom:6px!important;
  }
  html[data-hs-theme="light"] body.hs-home-page .hs-home-card a:hover{
    color:#0d58b0!important;
  }
  html[data-hs-theme="light"] body.hs-home-page .hs-home-card tr:not(:first-child) b,
  html[data-hs-theme="light"] body.hs-home-page .hs-home-card tr:not(:first-child) strong{
    color:#0f2f58!important;
    font-size:22px!important;
    line-height:1.25!important;
    display:block!important;
    margin-bottom:8px!important;
  }
  html[data-hs-theme="light"] body.hs-home-page .hs-home-card tr:not(:first-child):hover td{
    background:rgba(219,232,249,.46)!important;
  }
  html[data-hs-theme="light"] body.hs-home-page #${BADGE_ID}{
    bottom:18px!important;
    right:18px!important;
  }

  /* Requisicao: visual 2026, simetrico e padronizado */
  body.hs-request-page #conteudo{
    max-width:1280px!important;
    margin:0 auto!important;
    padding:calc(var(--hs-request-top-offset, 72px) + 8px) 10px 20px!important;
    box-sizing:border-box!important;
  }
  body.hs-request-page.hs-request-popup-preview{
    --hs-request-top-offset:0px;
  }
  body.hs-request-page.hs-request-popup-preview #cabecalho,
  body.hs-request-page.hs-request-popup-preview #cabecalho_logo,
  body.hs-request-page.hs-request-popup-preview #cabecalho_menu{
    display:none!important;
  }
  body.hs-request-page #interno{
    max-width:920px!important;
    margin:0 auto!important;
  }
  body.hs-request-page #interno > *{
    max-width:920px!important;
    margin-left:auto!important;
    margin-right:auto!important;
  }
  body.hs-request-page #interno > table,
  body.hs-request-page #interno > div > table,
  body.hs-request-page #interno > form > table{
    width:100%!important;
    margin:0 0 8px 0!important;
    border-collapse:separate!important;
    border-spacing:0!important;
    border-radius:12px!important;
    overflow:hidden!important;
  }
  body.hs-request-page #interno table:not(.sortable){
    border-collapse:separate!important;
    border-spacing:0!important;
    border-radius:12px!important;
    overflow:hidden!important;
  }
  body.hs-request-page #interno table:not(.sortable) > :is(thead,tbody,tfoot) > tr:first-child > :first-child,
  body.hs-request-page #interno table:not(.sortable) > tr:first-child > :first-child{
    border-top-left-radius:12px!important;
  }
  body.hs-request-page #interno table:not(.sortable) > :is(thead,tbody,tfoot) > tr:first-child > :last-child,
  body.hs-request-page #interno table:not(.sortable) > tr:first-child > :last-child{
    border-top-right-radius:12px!important;
  }
  body.hs-request-page #interno table:not(.sortable) > :is(thead,tbody,tfoot) > tr:last-child > :first-child,
  body.hs-request-page #interno table:not(.sortable) > tr:last-child > :first-child{
    border-bottom-left-radius:12px!important;
  }
  body.hs-request-page #interno table:not(.sortable) > :is(thead,tbody,tfoot) > tr:last-child > :last-child,
  body.hs-request-page #interno table:not(.sortable) > tr:last-child > :last-child{
    border-bottom-right-radius:12px!important;
  }
  body.hs-request-page #interno table:not(.sortable) td,
  body.hs-request-page #interno table:not(.sortable) th{
    padding:5px 8px!important;
    font-size:12px!important;
    line-height:1.3!important;
    vertical-align:top!important;
  }
  body.hs-request-page #interno table:not(.sortable) th{
    font-weight:700!important;
    white-space:nowrap!important;
  }
  body.hs-request-page #interno input[type="text"],
  body.hs-request-page #interno input[type="number"],
  body.hs-request-page #interno input[type="date"],
  body.hs-request-page #interno input[type="time"],
  body.hs-request-page #interno textarea,
  body.hs-request-page #interno select{
    min-height:30px!important;
    border-radius:9px!important;
    font-size:12px!important;
    padding:4px 8px!important;
    line-height:1.2!important;
  }
  body.hs-request-page #interno textarea{
    min-height:76px!important;
    padding:7px 9px!important;
    resize:vertical!important;
  }
  body.hs-request-page #interno #Novo_Acompanhamento textarea.acomp_descricao,
  body.hs-request-page #interno #acompanhamento_form textarea{
    width:100%!important;
    max-width:100%!important;
    box-sizing:border-box!important;
    display:block!important;
    margin:0!important;
  }
  body.hs-request-page #interno #Novo_Acompanhamento :is(select, input[type="text"], input[type="number"], input[type="date"], input[type="time"]),
  body.hs-request-page #interno .novo_consumo_interno :is(select, input[type="text"], input[type="number"], input[type="date"], input[type="time"]){
    min-height:24px!important;
    height:24px!important;
    border-width:var(--hs-border-width)!important;
    border-radius:8px!important;
    padding:2px 7px!important;
    font-size:10px!important;
    line-height:1!important;
    box-sizing:border-box!important;
  }
  body.hs-request-page #interno .novo_consumo_interno textarea{
    min-height:56px!important;
    height:56px!important;
    border-width:var(--hs-border-width)!important;
    border-radius:8px!important;
    padding:6px 8px!important;
    font-size:10px!important;
    line-height:1.1!important;
    box-sizing:border-box!important;
    resize:vertical!important;
  }
  body.hs-request-page #interno #Novo_Acompanhamento :is(input, select, textarea):focus,
  body.hs-request-page #interno .novo_consumo_interno :is(input, select, textarea):focus{
    outline:none!important;
    box-shadow:none!important;
  }
  body.hs-request-page #interno .hs-attach-preview{
    display:flex!important;
    flex-wrap:wrap!important;
    align-items:flex-start!important;
    gap:8px!important;
    width:100%!important;
    margin-top:6px!important;
  }
  body.hs-request-page #interno .hs-attach-thumb{
    border:var(--hs-border-width) solid var(--border)!important;
    border-radius:var(--hs-radius-control)!important;
    background:var(--panel)!important;
    margin:0!important;
    padding:0!important;
    width:72px!important;
    min-width:72px!important;
    max-width:72px!important;
    height:72px!important;
    flex:0 0 72px!important;
    overflow:hidden!important;
    display:block!important;
    position:relative!important;
    cursor:zoom-in!important;
  }
  body.hs-request-page #interno .hs-attach-thumb img{
    width:100%!important;
    height:100%!important;
    object-fit:cover!important;
    border-radius:0!important;
    display:block!important;
    cursor:zoom-in!important;
  }
  body.hs-request-page #interno .hs-attach-thumb figcaption{
    display:none!important;
  }
  body.hs-request-page #interno input[type="button"],
  body.hs-request-page #interno input[type="submit"],
  body.hs-request-page #interno button{
    min-height:22px!important;
    height:auto!important;
    border-radius:8px!important;
    padding:2px 7px!important;
    font-size:10px!important;
    line-height:1!important;
    font-weight:700!important;
    width:auto!important;
    max-width:100%!important;
    white-space:nowrap!important;
    display:inline-flex!important;
    align-items:center!important;
    justify-content:center!important;
    box-shadow:none!important;
  }
  body.hs-request-page #interno .hs-quick-actions{
    margin-top:0!important;
    display:flex!important;
    flex-wrap:wrap!important;
    gap:6px!important;
    align-items:center!important;
    justify-content:flex-end!important;
    width:auto!important;
    box-sizing:border-box!important;
    margin-left:auto!important;
    flex:0 0 auto!important;
  }
  body.hs-request-page #interno .hs-quick-actions .hs-qa-btn{
    min-height:24px!important;
    border-radius:8px!important;
    padding:2px 9px!important;
    font-size:10px!important;
    font-weight:700!important;
    line-height:1!important;
    cursor:pointer!important;
  }
  body.hs-request-page #interno .hs-quick-actions .hs-qa-btn[disabled]{
    opacity:.58!important;
    cursor:not-allowed!important;
  }
  body.hs-request-page #interno .hs-quick-actions .hs-qa-ai-wrap{
    position:relative!important;
    display:inline-flex!important;
    align-items:stretch!important;
  }
  body.hs-request-page #interno .hs-quick-actions .hs-qa-ai-wrap .hs-qa-btn{
    padding-right:26px!important;
  }
  body.hs-request-page #interno .hs-quick-actions .hs-qa-ai-wrap::before{
    content:""!important;
    position:absolute!important;
    right:21px!important;
    top:4px!important;
    bottom:4px!important;
    width:1px!important;
    background:rgba(0,0,0,.18)!important;
    pointer-events:none!important;
    z-index:2!important;
  }
  body.hs-request-page #interno .hs-quick-actions .hs-qa-ai-wrap::after{
    content:"\\25BE"!important;
    position:absolute!important;
    right:7px!important;
    top:50%!important;
    transform:translateY(-54%)!important;
    font-size:9px!important;
    color:#244f75!important;
    pointer-events:none!important;
    z-index:2!important;
  }
  body.hs-request-page #interno .hs-quick-actions .hs-qa-ai-wrap .hs-qa-mode{
    position:absolute!important;
    top:0!important;
    right:0!important;
    bottom:0!important;
    width:22px!important;
    min-height:24px!important;
    height:24px!important;
    border:0!important;
    margin:0!important;
    padding:0!important;
    opacity:0!important;
    appearance:none!important;
    -webkit-appearance:none!important;
    background:transparent!important;
    cursor:pointer!important;
    z-index:3!important;
  }
  body.hs-request-page #interno .hs-qa-host{
    width:100%!important;
    display:flex!important;
    align-items:center!important;
    justify-content:flex-start!important;
    flex-wrap:wrap!important;
    gap:8px!important;
    box-sizing:border-box!important;
  }
  body.hs-request-page #interno .hs-qa-host > br{
    display:none!important;
  }
  body.hs-request-page #interno .hs-concluir-consumo-alert{
    display:none;
    width:100%;
    margin-top:6px;
    padding:7px 10px;
    border-radius:8px;
    border:1px solid #f2cf62;
    background:linear-gradient(180deg, rgba(255,232,158,.26), rgba(255,204,92,.14));
    color:#fff3bf;
    font-size:11px;
    font-weight:800;
    line-height:1.35;
    box-shadow:0 0 0 1px rgba(242,207,98,.2) inset;
  }
  body.hs-request-page #interno .hs-concluir-consumo-alert strong{
    color:#ffffff!important;
  }
  body.hs-request-page #interno .hs-concluir-consumo-alert.is-visible{
    display:block!important;
  }
  body.hs-request-page #interno .hs-concluir-consumo-alert.is-pulse{
    animation:hs-concluir-consumo-pulse .84s ease;
  }
  @keyframes hs-concluir-consumo-pulse{
    0%{ transform:translateY(0); box-shadow:0 0 0 1px rgba(242,207,98,.2) inset; }
    35%{ transform:translateY(-1px); box-shadow:0 0 0 1px rgba(255,238,176,.42) inset, 0 0 16px rgba(255,228,138,.22); }
    100%{ transform:translateY(0); box-shadow:0 0 0 1px rgba(242,207,98,.2) inset; }
  }
  @media (max-width:980px){
    body.hs-request-page #interno .hs-qa-host{
      flex-wrap:wrap!important;
    }
    body.hs-request-page #interno .hs-quick-actions{
      margin-left:0!important;
      width:100%!important;
      justify-content:flex-start!important;
    }
  }
  body.hs-request-page #interno .hs-horas-consumo{
    width:118px!important;
    min-width:118px!important;
    min-height:24px!important;
    height:24px!important;
    border-radius:8px!important;
    padding:2px 7px!important;
    font-size:10px!important;
    line-height:1!important;
    box-sizing:border-box!important;
  }
  body.hs-dashboard-page table.sortable .hs-first-att-wrap{
    margin-top:4px!important;
  }
  body.hs-dashboard-page table.sortable .hs-first-att-btn{
    min-height:20px!important;
    height:20px!important;
    border-radius:999px!important;
    padding:1px 8px!important;
    font-size:10px!important;
    font-weight:800!important;
    line-height:1!important;
    cursor:pointer!important;
    white-space:nowrap!important;
  }
  body.hs-dashboard-page table.sortable .hs-first-att-btn[disabled]{
    opacity:.7!important;
    cursor:wait!important;
  }
  html[data-hs-theme="dark"] body.hs-dashboard-page table.sortable .hs-first-att-btn{
    background:linear-gradient(180deg, #1b4d82, #1f5fb4)!important;
    border:1px solid #4f79b1!important;
    color:#eaf3ff!important;
  }
  html[data-hs-theme="light"] body.hs-dashboard-page table.sortable .hs-first-att-btn{
    background:linear-gradient(180deg, #eef5ff, #dbe9fa)!important;
    border:1px solid #b8cde5!important;
    color:#16395f!important;
  }
  body.hs-request-page #interno .hs-req-topbar{
    width:100%!important;
    max-width:100%!important;
    display:flex!important;
    align-items:center!important;
    gap:10px!important;
    box-sizing:border-box!important;
  }
  body.hs-request-page #interno .hs-req-title{
    display:inline-block!important;
    flex:1 1 auto!important;
    min-width:0!important;
    font-weight:800!important;
    letter-spacing:.01em!important;
  }
  body.hs-request-page #interno .hs-req-header-actions{
    margin-left:auto!important;
    display:inline-flex!important;
    align-items:center!important;
    gap:6px!important;
  }
  body.hs-request-page #interno .hs-req-concluir-btn,
  body.hs-request-page #interno .hs-req-main-action{
    min-width:96px!important;
  }
  body.hs-request-page #interno .requisicao_top{
    display:grid!important;
    grid-template-columns:minmax(0, 1fr) auto!important;
    align-items:center!important;
    gap:10px!important;
    box-sizing:border-box!important;
    position:relative!important;
    padding:0!important;
  }
  body.hs-request-page #interno .requisicao_top > h1{
    margin:6px 0!important;
    padding:0!important;
    min-width:0!important;
    text-align:left!important;
    justify-self:start!important;
    text-indent:0!important;
  }
  body.hs-request-page #interno .requisicao_top .marcacao_concluido{
    justify-self:end!important;
    display:block!important;
    width:auto!important;
    position:static!important;
    float:none!important;
    left:auto!important;
    right:auto!important;
    top:auto!important;
    bottom:auto!important;
    transform:none!important;
    margin:0!important;
    padding:0!important;
    text-align:right!important;
  }
  body.hs-request-page #interno .requisicao_top .marcacao_concluido input[type="button"]{
    min-width:118px!important;
    display:inline-flex!important;
    position:static!important;
    float:none!important;
    left:auto!important;
    right:auto!important;
    top:auto!important;
    bottom:auto!important;
    transform:none!important;
    margin:0!important;
    margin-left:auto!important;
    margin-right:0!important;
  }
  body.hs-request-page #interno .requisicao_top .marcacao_verificado,
  body.hs-request-page #interno .requisicao_top .navegacao{
    display:none!important;
  }
  body.hs-request-page #interno .categorias,
  body.hs-request-page #interno .descricao_acompanhamento,
  body.hs-request-page #interno .detalhes,
  body.hs-request-page #interno .acompanhamentos{
    width:100%!important;
    max-width:100%!important;
    box-sizing:border-box!important;
  }
  body.hs-request-page #interno .categorias table,
  body.hs-request-page #interno .descricao_acompanhamento > div,
  body.hs-request-page #interno .detalhes .tabelas_vertical,
  body.hs-request-page #interno .detalhes .tabelas_vertical > table,
  body.hs-request-page #interno .acompanhamentos .tabelas_vertical,
  body.hs-request-page #interno .acompanhamentos .tabelas_vertical > table{
    width:100%!important;
    max-width:100%!important;
    margin:0!important;
    box-sizing:border-box!important;
  }
  body.hs-request-page #interno .descricao_acompanhamento > div{
    border-radius:12px!important;
    overflow:hidden!important;
  }
  body.hs-request-page #interno .descricao_acompanhamento :is(input[type="text"], textarea){
    border-radius:10px!important;
    overflow:hidden!important;
  }
  body.hs-request-page #interno .acompanhamentos .tabelas_vertical,
  body.hs-request-page #interno .acompanhamentos .tabelas_vertical > table,
  body.hs-request-page #interno .acompanhamentos table{
    border-radius:12px!important;
    overflow:hidden!important;
    border-collapse:separate!important;
    border-spacing:0!important;
  }
  body.hs-request-page #interno .acompanhamentos table > :is(thead,tbody,tfoot) > tr:first-child > :first-child,
  body.hs-request-page #interno .acompanhamentos table > tr:first-child > :first-child{
    border-top-left-radius:12px!important;
  }
  body.hs-request-page #interno .acompanhamentos table > :is(thead,tbody,tfoot) > tr:first-child > :last-child,
  body.hs-request-page #interno .acompanhamentos table > tr:first-child > :last-child{
    border-top-right-radius:12px!important;
  }
  body.hs-request-page #interno .acompanhamentos table > :is(thead,tbody,tfoot) > tr:last-child > :first-child,
  body.hs-request-page #interno .acompanhamentos table > tr:last-child > :first-child{
    border-bottom-left-radius:12px!important;
  }
  body.hs-request-page #interno .acompanhamentos table > :is(thead,tbody,tfoot) > tr:last-child > :last-child,
  body.hs-request-page #interno .acompanhamentos table > tr:last-child > :last-child{
    border-bottom-right-radius:12px!important;
  }
  body.hs-request-page #interno .acompanhamentos table tr.hs-acomp-special td.hs-acomp-special-cell,
  body.hs-request-page #interno .acompanhamentos table tr.hs-acomp-special td.hs-acomp-special-content{
    background:rgba(219, 234, 254, .48)!important;
    border-color:#bfd5f0!important;
  }
  body.hs-request-page #interno .acompanhamentos table tr.hs-acomp-internal td.hs-acomp-internal-cell,
  body.hs-request-page #interno .acompanhamentos table tr.hs-acomp-internal td.hs-acomp-internal-content{
    background:rgba(248, 113, 113, .22)!important;
    border-color:#efb1b1!important;
  }
  /* Neutraliza hover legado nas linhas de acompanhamentos */
  html[data-hs-theme="light"] body.hs-request-page #interno .acompanhamentos table tr:not(.hs-acomp-special):not(.hs-acomp-internal):hover > td{
    background:#ffffff!important;
    border-color:#d8e3f2!important;
  }
  body.hs-request-page #interno .acompanhamentos table tr.hs-acomp-special:hover td.hs-acomp-special-cell,
  body.hs-request-page #interno .acompanhamentos table tr.hs-acomp-special:hover td.hs-acomp-special-content{
    background:rgba(219, 234, 254, .48)!important;
    border-color:#bfd5f0!important;
  }
  body.hs-request-page #interno .acompanhamentos table tr.hs-acomp-internal:hover td.hs-acomp-internal-cell,
  body.hs-request-page #interno .acompanhamentos table tr.hs-acomp-internal:hover td.hs-acomp-internal-content{
    background:rgba(248, 113, 113, .22)!important;
    border-color:#efb1b1!important;
  }
  html[data-hs-theme="dark"] body.hs-request-page #interno .acompanhamentos table tr.hs-acomp-special td.hs-acomp-special-cell,
  html[data-hs-theme="dark"] body.hs-request-page #interno .acompanhamentos table tr.hs-acomp-special td.hs-acomp-special-content{
    background:rgba(128, 177, 236, .34)!important;
    border-top-color:#6f9dce!important;
    border-bottom-color:#6f9dce!important;
    border-left-color:transparent!important;
    border-right-color:transparent!important;
    box-shadow:none!important;
  }
  html[data-hs-theme="dark"] body.hs-request-page #interno .acompanhamentos table tr.hs-acomp-special > td.hs-acomp-special-cell:first-child,
  html[data-hs-theme="dark"] body.hs-request-page #interno .acompanhamentos table tr.hs-acomp-special > td.hs-acomp-special-content:first-child{
    border-left-color:#6f9dce!important;
  }
  html[data-hs-theme="dark"] body.hs-request-page #interno .acompanhamentos table tr.hs-acomp-special > td.hs-acomp-special-cell:last-child,
  html[data-hs-theme="dark"] body.hs-request-page #interno .acompanhamentos table tr.hs-acomp-special > td.hs-acomp-special-content:last-child{
    border-right-color:#6f9dce!important;
  }
  html[data-hs-theme="dark"] body.hs-request-page #interno .acompanhamentos table tr.hs-acomp-internal td.hs-acomp-internal-cell,
  html[data-hs-theme="dark"] body.hs-request-page #interno .acompanhamentos table tr.hs-acomp-internal td.hs-acomp-internal-content{
    background:rgba(239, 68, 68, .28)!important;
    border-top-color:#a35760!important;
    border-bottom-color:#a35760!important;
    border-left-color:transparent!important;
    border-right-color:transparent!important;
    box-shadow:none!important;
  }
  html[data-hs-theme="dark"] body.hs-request-page #interno .acompanhamentos table tr.hs-acomp-internal > td.hs-acomp-internal-cell:first-child,
  html[data-hs-theme="dark"] body.hs-request-page #interno .acompanhamentos table tr.hs-acomp-internal > td.hs-acomp-internal-content:first-child{
    border-left-color:#a35760!important;
  }
  html[data-hs-theme="dark"] body.hs-request-page #interno .acompanhamentos table tr.hs-acomp-internal > td.hs-acomp-internal-cell:last-child,
  html[data-hs-theme="dark"] body.hs-request-page #interno .acompanhamentos table tr.hs-acomp-internal > td.hs-acomp-internal-content:last-child{
    border-right-color:#a35760!important;
  }
  html[data-hs-theme="dark"] body.hs-request-page #interno .acompanhamentos table tr:not(.hs-acomp-special):not(.hs-acomp-internal):hover > td{
    background:#0f1b2b!important;
    border-color:#28394f!important;
  }
  html[data-hs-theme="dark"] body.hs-request-page #interno .acompanhamentos table tr.hs-acomp-special:hover td.hs-acomp-special-cell,
  html[data-hs-theme="dark"] body.hs-request-page #interno .acompanhamentos table tr.hs-acomp-special:hover td.hs-acomp-special-content{
    background:rgba(128, 177, 236, .34)!important;
    border-top-color:#6f9dce!important;
    border-bottom-color:#6f9dce!important;
    border-left-color:transparent!important;
    border-right-color:transparent!important;
  }
  html[data-hs-theme="dark"] body.hs-request-page #interno .acompanhamentos table tr.hs-acomp-special:hover > td.hs-acomp-special-cell:first-child,
  html[data-hs-theme="dark"] body.hs-request-page #interno .acompanhamentos table tr.hs-acomp-special:hover > td.hs-acomp-special-content:first-child{
    border-left-color:#6f9dce!important;
  }
  html[data-hs-theme="dark"] body.hs-request-page #interno .acompanhamentos table tr.hs-acomp-special:hover > td.hs-acomp-special-cell:last-child,
  html[data-hs-theme="dark"] body.hs-request-page #interno .acompanhamentos table tr.hs-acomp-special:hover > td.hs-acomp-special-content:last-child{
    border-right-color:#6f9dce!important;
  }
  html[data-hs-theme="dark"] body.hs-request-page #interno .acompanhamentos table tr.hs-acomp-internal:hover td.hs-acomp-internal-cell,
  html[data-hs-theme="dark"] body.hs-request-page #interno .acompanhamentos table tr.hs-acomp-internal:hover td.hs-acomp-internal-content{
    background:rgba(239, 68, 68, .28)!important;
    border-top-color:#a35760!important;
    border-bottom-color:#a35760!important;
    border-left-color:transparent!important;
    border-right-color:transparent!important;
  }
  html[data-hs-theme="dark"] body.hs-request-page #interno .acompanhamentos table tr.hs-acomp-internal:hover > td.hs-acomp-internal-cell:first-child,
  html[data-hs-theme="dark"] body.hs-request-page #interno .acompanhamentos table tr.hs-acomp-internal:hover > td.hs-acomp-internal-content:first-child{
    border-left-color:#a35760!important;
  }
  html[data-hs-theme="dark"] body.hs-request-page #interno .acompanhamentos table tr.hs-acomp-internal:hover > td.hs-acomp-internal-cell:last-child,
  html[data-hs-theme="dark"] body.hs-request-page #interno .acompanhamentos table tr.hs-acomp-internal:hover > td.hs-acomp-internal-content:last-child{
    border-right-color:#a35760!important;
  }
  /* Blindagem total de hover para acompanhamentos (evita "acender" linha) */
  body.hs-request-page #interno table.hs-acomp-table tr,
  body.hs-request-page #interno table.hs-acomp-table tr > td,
  body.hs-request-page #interno table.hs-acomp-table tr > td *{
    opacity:1!important;
    filter:none!important;
    text-shadow:none!important;
    transition:none!important;
  }
  html[data-hs-theme="light"] body.hs-request-page #interno table.hs-acomp-table tr:not(.hs-acomp-special):not(.hs-acomp-internal):hover > td{
    background:#ffffff!important;
    color:#1f3d62!important;
    border-color:#d8e3f2!important;
  }
  html[data-hs-theme="dark"] body.hs-request-page #interno table.hs-acomp-table tr:not(.hs-acomp-special):not(.hs-acomp-internal):hover > td{
    background:#0f1b2b!important;
    color:#d5e2f4!important;
    border-color:#28394f!important;
  }
  body.hs-request-page #interno table.hs-acomp-table tr:not(.hs-acomp-special):not(.hs-acomp-internal):hover > td *{
    color:inherit!important;
    opacity:1!important;
    filter:none!important;
    text-shadow:none!important;
  }
  html[data-hs-theme="light"] body.hs-request-page #interno table.hs-acomp-table tr.hs-acomp-special:hover td.hs-acomp-special-cell,
  html[data-hs-theme="light"] body.hs-request-page #interno table.hs-acomp-table tr.hs-acomp-special:hover td.hs-acomp-special-content{
    background:rgba(219, 234, 254, .48)!important;
    color:#1f3d62!important;
    border-color:#bfd5f0!important;
  }
  html[data-hs-theme="light"] body.hs-request-page #interno table.hs-acomp-table tr.hs-acomp-internal:hover td.hs-acomp-internal-cell,
  html[data-hs-theme="light"] body.hs-request-page #interno table.hs-acomp-table tr.hs-acomp-internal:hover td.hs-acomp-internal-content{
    background:rgba(248, 113, 113, .22)!important;
    color:#7a1111!important;
    border-color:#efb1b1!important;
  }
  html[data-hs-theme="dark"] body.hs-request-page #interno table.hs-acomp-table tr.hs-acomp-special:hover td.hs-acomp-special-cell,
  html[data-hs-theme="dark"] body.hs-request-page #interno table.hs-acomp-table tr.hs-acomp-special:hover td.hs-acomp-special-content{
    background:rgba(128, 177, 236, .34)!important;
    color:#e6edf3!important;
    border-top-color:#6f9dce!important;
    border-bottom-color:#6f9dce!important;
    border-left-color:transparent!important;
    border-right-color:transparent!important;
  }
  html[data-hs-theme="dark"] body.hs-request-page #interno table.hs-acomp-table tr.hs-acomp-special:hover > td.hs-acomp-special-cell:first-child,
  html[data-hs-theme="dark"] body.hs-request-page #interno table.hs-acomp-table tr.hs-acomp-special:hover > td.hs-acomp-special-content:first-child{
    border-left-color:#6f9dce!important;
  }
  html[data-hs-theme="dark"] body.hs-request-page #interno table.hs-acomp-table tr.hs-acomp-special:hover > td.hs-acomp-special-cell:last-child,
  html[data-hs-theme="dark"] body.hs-request-page #interno table.hs-acomp-table tr.hs-acomp-special:hover > td.hs-acomp-special-content:last-child{
    border-right-color:#6f9dce!important;
  }
  html[data-hs-theme="dark"] body.hs-request-page #interno table.hs-acomp-table tr.hs-acomp-internal:hover td.hs-acomp-internal-cell,
  html[data-hs-theme="dark"] body.hs-request-page #interno table.hs-acomp-table tr.hs-acomp-internal:hover td.hs-acomp-internal-content{
    background:rgba(239, 68, 68, .28)!important;
    color:#ffdede!important;
    border-top-color:#a35760!important;
    border-bottom-color:#a35760!important;
    border-left-color:transparent!important;
    border-right-color:transparent!important;
  }
  html[data-hs-theme="dark"] body.hs-request-page #interno table.hs-acomp-table tr.hs-acomp-internal:hover > td.hs-acomp-internal-cell:first-child,
  html[data-hs-theme="dark"] body.hs-request-page #interno table.hs-acomp-table tr.hs-acomp-internal:hover > td.hs-acomp-internal-content:first-child{
    border-left-color:#a35760!important;
  }
  html[data-hs-theme="dark"] body.hs-request-page #interno table.hs-acomp-table tr.hs-acomp-internal:hover > td.hs-acomp-internal-cell:last-child,
  html[data-hs-theme="dark"] body.hs-request-page #interno table.hs-acomp-table tr.hs-acomp-internal:hover > td.hs-acomp-internal-content:last-child{
    border-right-color:#a35760!important;
  }
  /* Reforco de contraste no hover (dark): evita linha "lavada" em acompanhamentos especiais */
  html[data-hs-theme="dark"] body.hs-request-page #interno .acompanhamentos table tr.hs-acomp-special:hover,
  html[data-hs-theme="dark"] body.hs-request-page #interno table.hs-acomp-table tr.hs-acomp-special:hover,
  html[data-hs-theme="dark"] body.hs-request-page #interno .acompanhamentos table tr.acompanhamento_interno.hs-acomp-special:hover,
  html[data-hs-theme="dark"] body.hs-request-page #interno .acompanhamentos table tr.hs-acomp-internal:hover,
  html[data-hs-theme="dark"] body.hs-request-page #interno table.hs-acomp-table tr.hs-acomp-internal:hover,
  html[data-hs-theme="dark"] body.hs-request-page #interno .acompanhamentos table tr.acompanhamento_interno.hs-acomp-internal:hover{
    opacity:1!important;
    filter:none!important;
    text-shadow:none!important;
  }
  html[data-hs-theme="dark"] body.hs-request-page #interno .acompanhamentos table tr.hs-acomp-special:hover > td,
  html[data-hs-theme="dark"] body.hs-request-page #interno table.hs-acomp-table tr.hs-acomp-special:hover > td,
  html[data-hs-theme="dark"] body.hs-request-page #interno .acompanhamentos table tr.acompanhamento_interno.hs-acomp-special:hover > td{
    background:rgba(59, 94, 140, .62)!important;
    color:#eaf2ff!important;
    opacity:1!important;
    filter:none!important;
    text-shadow:none!important;
  }
  html[data-hs-theme="dark"] body.hs-request-page #interno .acompanhamentos table tr.hs-acomp-special:hover > td *,
  html[data-hs-theme="dark"] body.hs-request-page #interno table.hs-acomp-table tr.hs-acomp-special:hover > td *,
  html[data-hs-theme="dark"] body.hs-request-page #interno .acompanhamentos table tr.acompanhamento_interno.hs-acomp-special:hover > td *{
    color:#eaf2ff!important;
    opacity:1!important;
    filter:none!important;
    text-shadow:none!important;
  }
  html[data-hs-theme="dark"] body.hs-request-page #interno .acompanhamentos table tr.hs-acomp-internal:hover > td,
  html[data-hs-theme="dark"] body.hs-request-page #interno table.hs-acomp-table tr.hs-acomp-internal:hover > td,
  html[data-hs-theme="dark"] body.hs-request-page #interno .acompanhamentos table tr.acompanhamento_interno.hs-acomp-internal:hover > td{
    background:rgba(139, 54, 68, .60)!important;
    color:#ffdede!important;
    opacity:1!important;
    filter:none!important;
    text-shadow:none!important;
  }
  html[data-hs-theme="dark"] body.hs-request-page #interno .acompanhamentos table tr.hs-acomp-internal:hover > td *,
  html[data-hs-theme="dark"] body.hs-request-page #interno table.hs-acomp-table tr.hs-acomp-internal:hover > td *,
  html[data-hs-theme="dark"] body.hs-request-page #interno .acompanhamentos table tr.acompanhamento_interno.hs-acomp-internal:hover > td *{
    color:#ffdede!important;
    opacity:1!important;
    filter:none!important;
    text-shadow:none!important;
  }
  body.hs-request-page #interno table.hs-acomp-table tr.hs-acomp-special:hover td.hs-acomp-special-cell *,
  body.hs-request-page #interno table.hs-acomp-table tr.hs-acomp-special:hover td.hs-acomp-special-content *,
  body.hs-request-page #interno table.hs-acomp-table tr.hs-acomp-internal:hover td.hs-acomp-internal-cell *,
  body.hs-request-page #interno table.hs-acomp-table tr.hs-acomp-internal:hover td.hs-acomp-internal-content *{
    color:inherit!important;
    opacity:1!important;
    filter:none!important;
    text-shadow:none!important;
  }
  body.hs-request-page #interno .categorias table{
    table-layout:fixed!important;
    border-radius:12px!important;
    overflow:hidden!important;
    border-collapse:separate!important;
    border-spacing:0!important;
    isolation:isolate!important;
    clip-path:inset(0 round 12px)!important;
    -webkit-clip-path:inset(0 round 12px)!important;
  }
  body.hs-request-page #interno .categorias table td,
  body.hs-request-page #interno .categorias table th{
    background-clip:padding-box!important;
  }
  /* Evita sobreposicao de raio da celula com raio do container (elimina "dente" nos cantos) */
  body.hs-request-page #interno .categorias table > :is(thead,tbody,tfoot) > tr:first-child > :first-child,
  body.hs-request-page #interno .categorias table > tr:first-child > :first-child,
  body.hs-request-page #interno .categorias table > :is(thead,tbody,tfoot) > tr:first-child > :last-child,
  body.hs-request-page #interno .categorias table > tr:first-child > :last-child{
    border-top-left-radius:0!important;
    border-top-right-radius:0!important;
    border-bottom-left-radius:0!important;
    border-bottom-right-radius:0!important;
  }
  body.hs-request-page #interno h1,
  body.hs-request-page #interno h2,
  body.hs-request-page #interno h3{
    margin:6px 0 6px!important;
    line-height:1.2!important;
  }
  body.hs-request-page #interno h2,
  body.hs-request-page #interno h3{
    font-size:20px!important;
  }
  body.hs-request-page #interno .calendar table{
    font-size:12px!important;
  }
  body.hs-request-page #interno .hs-cal-consumo-wrap{
    width:100%!important;
    display:grid!important;
    grid-template-columns:minmax(0, 1fr) 206px!important;
    gap:8px!important;
    align-items:start!important;
  }
  body.hs-request-page #interno .hs-cal-slot{
    min-width:0!important;
  }
  body.hs-request-page #interno .hs-cal-consumo-side{
    border:1px solid var(--border)!important;
    border-radius:10px!important;
    background:var(--panel2)!important;
    padding:6px!important;
    box-sizing:border-box!important;
  }
  body.hs-request-page #interno .hs-cal-consumo-side .hs-cal-consumo-title{
    display:block!important;
    font-size:10px!important;
    font-weight:800!important;
    margin:0 0 6px 0!important;
    line-height:1.1!important;
  }
  body.hs-request-page #interno .hs-cal-consumo-controls{
    display:flex!important;
    flex-direction:column!important;
    gap:6px!important;
  }
  body.hs-request-page #interno .hs-cal-consumo-controls :is(input, select){
    width:100%!important;
    min-width:0!important;
    min-height:24px!important;
    height:24px!important;
    padding:2px 7px!important;
    font-size:10px!important;
    line-height:1!important;
    box-sizing:border-box!important;
  }
  body.hs-request-page #interno .hs-cal-slot :is(.calendar, .calendario, #calendar, [id*="calend"], [class*="calend"]){
    width:100%!important;
    max-width:100%!important;
  }
  body.hs-request-page #interno .hs-cal-slot :is(.calendar, .calendario, #calendar, [id*="calend"], [class*="calend"]) table{
    font-size:10px!important;
    line-height:1.05!important;
  }
  body.hs-request-page #interno .hs-cal-slot :is(.calendar, .calendario, #calendar, [id*="calend"], [class*="calend"]) :is(td, th){
    padding:2px 4px!important;
  }
  @media (max-width:980px){
    body.hs-request-page #interno .hs-cal-consumo-wrap{
      grid-template-columns:1fr!important;
    }
  }
  body.hs-request-page #interno a{
    color:var(--link)!important;
    text-decoration:underline!important;
    text-underline-offset:2px!important;
    font-weight:700!important;
  }
  body.hs-request-page #interno a:hover{
    color:var(--link)!important;
    text-decoration:underline!important;
  }
  body.hs-request-page #interno .acompanhamentos,
  body.hs-request-page #interno #consulta_consumos,
  body.hs-request-page #interno .novo_consumo_interno,
  body.hs-request-page #interno #consumos_internos{
    box-sizing:border-box!important;
  }
  body.hs-request-page #interno #Novo_Acompanhamento,
  body.hs-request-page #interno #acompanhamento_form,
  body.hs-request-page #interno #consulta_consumos .tabelas_vertical,
  body.hs-request-page #interno .novo_consumo_interno .tabelas_vertical,
  body.hs-request-page #interno #consumos_internos .tabelas_vertical{
    width:100%!important;
    max-width:100%!important;
  }
  body.hs-request-page #interno #Novo_Acompanhamento table,
  body.hs-request-page #interno #acompanhamento_form table,
  body.hs-request-page #interno #consulta_consumos table,
  body.hs-request-page #interno .novo_consumo_interno table,
  body.hs-request-page #interno #consumos_internos table{
    width:100%!important;
    margin:0!important;
  }
  body.hs-request-page #interno #Novo_Acompanhamento #IdAcao_Requisicao{
    display:block!important;
    margin:0!important;
    position:static!important;
  }
  body.hs-request-page #interno #Novo_Acompanhamento #observacao_acao{
    display:block!important;
    position:static!important;
    float:none!important;
    clear:both!important;
    margin:10px 0 0!important;
    padding:0!important;
    line-height:1.25!important;
    text-align:left!important;
    white-space:normal!important;
  }

  html[data-hs-theme="dark"] body.hs-request-page #interno > table,
  html[data-hs-theme="dark"] body.hs-request-page #interno > div > table,
  html[data-hs-theme="dark"] body.hs-request-page #interno > form > table{
    background:linear-gradient(180deg, #151f2d, #131b28)!important;
    border:1px solid #324459!important;
    box-shadow:0 6px 14px rgba(0,0,0,.2)!important;
  }
  html[data-hs-theme="dark"] body.hs-request-page #interno table:not(.sortable) td,
  html[data-hs-theme="dark"] body.hs-request-page #interno table:not(.sortable) th{
    background:#162231!important;
    border:1px solid #33475d!important;
    color:#d4dfec!important;
  }
  html[data-hs-theme="dark"] body.hs-request-page #interno table:not(.sortable) th{
    background:#1b2f46!important;
    color:#dce8f8!important;
  }
  html[data-hs-theme="dark"] body.hs-request-page #interno input[type="text"],
  html[data-hs-theme="dark"] body.hs-request-page #interno input[type="number"],
  html[data-hs-theme="dark"] body.hs-request-page #interno input[type="date"],
  html[data-hs-theme="dark"] body.hs-request-page #interno input[type="time"],
  html[data-hs-theme="dark"] body.hs-request-page #interno textarea,
  html[data-hs-theme="dark"] body.hs-request-page #interno select{
    background:#182433!important;
    border:1px solid #3f5369!important;
    color:#e9f1fb!important;
  }
  html[data-hs-theme="dark"] body.hs-request-page #interno input[type="button"],
  html[data-hs-theme="dark"] body.hs-request-page #interno input[type="submit"],
  html[data-hs-theme="dark"] body.hs-request-page #interno button{
    background:linear-gradient(180deg, #26374d, #223347)!important;
    border:1px solid #4c627a!important;
    color:#e3edf9!important;
  }
  html[data-hs-theme="dark"] body.hs-request-page #interno input[type="button"]:hover,
  html[data-hs-theme="dark"] body.hs-request-page #interno input[type="submit"]:hover,
  html[data-hs-theme="dark"] body.hs-request-page #interno button:hover{
    background:linear-gradient(180deg, #2c4058, #29405a)!important;
  }
  html[data-hs-theme="dark"] body.hs-request-page #interno .calendar table td,
  html[data-hs-theme="dark"] body.hs-request-page #interno [class*="calend"] td{
    padding:4px 6px!important;
  }

  html[data-hs-theme="light"] body.hs-request-page #interno > table,
  html[data-hs-theme="light"] body.hs-request-page #interno > div > table,
  html[data-hs-theme="light"] body.hs-request-page #interno > form > table{
    background:linear-gradient(180deg, #ffffff, #f5f8fd)!important;
    border:1px solid #d8e3f2!important;
    box-shadow:0 6px 14px rgba(20,45,90,.08)!important;
  }
  html[data-hs-theme="light"] body.hs-request-page #interno table:not(.sortable) td,
  html[data-hs-theme="light"] body.hs-request-page #interno table:not(.sortable) th{
    background:#ffffff!important;
    border:1px solid #d8e3f2!important;
    color:#1f3d62!important;
  }
  /* Garante contorno cinza-claro no bloco "Novo acompanhamento" e correlatos */
  html[data-hs-theme="light"] body.hs-request-page #interno{
    --hs-request-light-border:#d8e3f2;
  }
  html[data-hs-theme="light"] body.hs-request-page #interno :is(
    #Novo_Acompanhamento,
    #acompanhamento_form,
    #consulta_consumos,
    .novo_consumo_interno,
    #consumos_internos,
    .acompanhamentos
  ) table:not(.sortable){
    border:1px solid var(--hs-request-light-border)!important;
    border-color:var(--hs-request-light-border)!important;
  }
  html[data-hs-theme="light"] body.hs-request-page #interno :is(
    #Novo_Acompanhamento,
    #acompanhamento_form,
    #consulta_consumos,
    .novo_consumo_interno,
    #consumos_internos,
    .acompanhamentos
  ) table:not(.sortable) > :is(thead,tbody,tfoot) > tr > :is(td,th){
    border-color:var(--hs-request-light-border)!important;
  }
  /* Estende o cinza-claro para os wrappers do topo (fora de table:not(.sortable)) */
  html[data-hs-theme="light"] body.hs-request-page #interno :is(
    .descricao_acompanhamento > div,
    .detalhes .tabelas_vertical,
    .detalhes .tabelas_vertical > table,
    .acompanhamentos .tabelas_vertical,
    .acompanhamentos .tabelas_vertical > table,
    .acompanhamentos > table,
    .descricao_acompanhamento :is(input[type="text"], textarea)
  ){
    border-color:var(--hs-request-light-border)!important;
  }
  html[data-hs-theme="light"] body.hs-request-page #interno table:not(.sortable) th{
    background:#ecf3fd!important;
    color:#17395f!important;
  }
  html[data-hs-theme="light"] body.hs-request-page #interno input[type="text"],
  html[data-hs-theme="light"] body.hs-request-page #interno input[type="number"],
  html[data-hs-theme="light"] body.hs-request-page #interno input[type="date"],
  html[data-hs-theme="light"] body.hs-request-page #interno input[type="time"],
  html[data-hs-theme="light"] body.hs-request-page #interno textarea,
  html[data-hs-theme="light"] body.hs-request-page #interno select{
    background:#f4f7fc!important;
    border:1px solid #d8e3f2!important;
    color:#14385f!important;
  }
  html[data-hs-theme="light"] body.hs-request-page #interno input[type="button"],
  html[data-hs-theme="light"] body.hs-request-page #interno input[type="submit"],
  html[data-hs-theme="light"] body.hs-request-page #interno button{
    background:linear-gradient(180deg, #edf3fb, #e1eaf6)!important;
    border:1px solid #d8e3f2!important;
    color:#264668!important;
  }
  html[data-hs-theme="light"] body.hs-request-page #interno .hs-cal-consumo-side{
    border-color:#d8e3f2!important;
  }
  html[data-hs-theme="light"] body.hs-request-page #interno input[type="button"]:hover,
  html[data-hs-theme="light"] body.hs-request-page #interno input[type="submit"]:hover,
  html[data-hs-theme="light"] body.hs-request-page #interno button:hover{
    background:linear-gradient(180deg, #e3edf9, #d7e4f2)!important;
  }

  /* Usuarios: layout padronizado com dashboard/request */
  body.hs-users-page #conteudo{
    --hs-users-control-w:236px;
    max-width:1520px!important;
    margin:0 auto!important;
    padding:calc(var(--hs-users-top-offset, 72px) + 10px) 10px 22px!important;
    box-sizing:border-box!important;
  }
  body.hs-users-page .hs-users-toolbar{
    display:flex!important;
    flex-wrap:wrap!important;
    align-items:flex-end!important;
    gap:12px!important;
    margin:0 0 10px!important;
    padding:10px 12px!important;
    border:1px solid var(--border)!important;
    border-radius:14px!important;
    background:var(--panel)!important;
    box-shadow:0 8px 20px rgba(0,0,0,.14)!important;
  }
  body.hs-users-page .hs-users-filters{
    display:flex!important;
    flex-wrap:wrap!important;
    align-items:flex-end!important;
    gap:10px!important;
    flex:1 1 auto!important;
    min-width:0!important;
  }
  body.hs-users-page .hs-users-field{
    display:flex!important;
    flex-direction:column!important;
    gap:4px!important;
    width:var(--hs-users-control-w)!important;
    min-width:var(--hs-users-control-w)!important;
    max-width:var(--hs-users-control-w)!important;
  }
  body.hs-users-page .hs-users-search{
    width:var(--hs-users-control-w)!important;
    min-width:var(--hs-users-control-w)!important;
  }
  body.hs-users-page .hs-users-field > span{
    font-size:11px!important;
    font-weight:800!important;
    letter-spacing:.02em!important;
    opacity:.94!important;
    padding-left:2px!important;
  }
  body.hs-users-page .hs-users-field select,
  body.hs-users-page .hs-users-field input{
    width:100%!important;
    min-height:32px!important;
    height:32px!important;
    font-size:13px!important;
    padding:5px 10px!important;
    border-radius:10px!important;
    box-sizing:border-box!important;
  }
  body.hs-users-page .hs-users-actions{
    margin-left:auto!important;
    display:flex!important;
    align-items:flex-end!important;
    gap:8px!important;
  }
  body.hs-users-page .hs-users-novo-btn{
    width:188px!important;
    min-width:188px!important;
    min-height:32px!important;
    height:32px!important;
    padding:4px 14px!important;
    border-radius:10px!important;
    font-weight:800!important;
    letter-spacing:.01em!important;
    text-decoration:none!important;
    display:inline-flex!important;
    align-items:center!important;
    justify-content:center!important;
    box-sizing:border-box!important;
    cursor:pointer!important;
    white-space:nowrap!important;
  }
  body.hs-users-page .hs-users-grid-wrap{
    width:100%!important;
    border:1px solid var(--border)!important;
    border-radius:14px!important;
    overflow:hidden!important;
    box-shadow:0 8px 20px rgba(0,0,0,.14)!important;
    background:var(--panel)!important;
  }
  body.hs-users-page .hs-users-grid-wrap table{
    width:100%!important;
    margin:0!important;
    border-collapse:separate!important;
    border-spacing:0!important;
  }
  body.hs-users-page .hs-users-grid-wrap thead th,
  body.hs-users-page .hs-users-grid-wrap tr:first-child > th{
    font-size:13px!important;
    font-weight:800!important;
    line-height:1.2!important;
    padding:8px 10px!important;
    text-align:left!important;
  }
  body.hs-users-page .hs-users-grid-wrap tbody td{
    font-size:13px!important;
    line-height:1.35!important;
    padding:7px 10px!important;
    vertical-align:middle!important;
    white-space:normal!important;
    overflow-wrap:anywhere!important;
  }
  body.hs-users-page .hs-users-grid-wrap td.hs-users-col-notif,
  body.hs-users-page .hs-users-grid-wrap td.hs-users-col-ativo,
  body.hs-users-page .hs-users-grid-wrap th.hs-users-col-notif,
  body.hs-users-page .hs-users-grid-wrap th.hs-users-col-ativo{
    text-align:center!important;
    white-space:nowrap!important;
  }
  body.hs-users-page .hs-users-grid-wrap td.hs-users-col-email{
    font-variant-ligatures:none!important;
  }
  body.hs-users-page .hs-users-grid-wrap td.hs-users-col-tipo{
    white-space:nowrap!important;
  }
  html[data-hs-theme="dark"] body.hs-users-page .hs-users-toolbar{
    background:linear-gradient(180deg, #0f1827, #0d1622)!important;
    border:1px solid #2a3a50!important;
  }
  html[data-hs-theme="dark"] body.hs-users-page .hs-users-grid-wrap{
    background:linear-gradient(180deg, #0e1827, #0c1624)!important;
    border:1px solid #2a3a50!important;
  }
  html[data-hs-theme="dark"] body.hs-users-page .hs-users-grid-wrap thead th,
  html[data-hs-theme="dark"] body.hs-users-page .hs-users-grid-wrap tr:first-child > th{
    background:#132338!important;
    color:#e8f0ff!important;
    border-bottom:1px solid #2c3f56!important;
  }
  html[data-hs-theme="dark"] body.hs-users-page .hs-users-grid-wrap tbody td{
    border-bottom:1px solid #28394f!important;
    color:#dce9fb!important;
  }
  html[data-hs-theme="dark"] body.hs-users-page .hs-users-grid-wrap tbody tr:nth-child(odd) td{
    background:#0f1b2b!important;
  }
  html[data-hs-theme="dark"] body.hs-users-page .hs-users-grid-wrap tbody tr:nth-child(even) td{
    background:#111f31!important;
  }
  html[data-hs-theme="dark"] body.hs-users-page .hs-users-grid-wrap tbody tr:hover td{
    background:#17293f!important;
  }
  html[data-hs-theme="dark"] body.hs-users-page .hs-users-novo-btn{
    background:linear-gradient(180deg, #1b4d82, #1f5fb4)!important;
    border:1px solid #4f79b1!important;
    color:#eaf3ff!important;
  }
  html[data-hs-theme="light"] body.hs-users-page .hs-users-toolbar{
    background:linear-gradient(180deg, #ffffff, #f5f8fd)!important;
    border:1px solid #d4e0ee!important;
  }
  html[data-hs-theme="light"] body.hs-users-page .hs-users-grid-wrap{
    background:linear-gradient(180deg, #ffffff, #f7faff)!important;
    border:1px solid #d8e3f2!important;
  }
  html[data-hs-theme="light"] body.hs-users-page .hs-users-grid-wrap thead th,
  html[data-hs-theme="light"] body.hs-users-page .hs-users-grid-wrap tr:first-child > th{
    background:#eaf2fd!important;
    color:#17395f!important;
    border-bottom:1px solid #d0deef!important;
  }
  html[data-hs-theme="light"] body.hs-users-page .hs-users-grid-wrap tbody td{
    border-bottom:1px solid #d8e3f2!important;
    color:#1f3d62!important;
  }
  html[data-hs-theme="light"] body.hs-users-page .hs-users-grid-wrap tbody tr:nth-child(odd) td{
    background:#ffffff!important;
  }
  html[data-hs-theme="light"] body.hs-users-page .hs-users-grid-wrap tbody tr:nth-child(even) td{
    background:#f7faff!important;
  }
  html[data-hs-theme="light"] body.hs-users-page .hs-users-grid-wrap tbody tr:hover td{
    background:#eef5ff!important;
  }
  html[data-hs-theme="light"] body.hs-users-page .hs-users-novo-btn{
    background:linear-gradient(180deg, #edf3fb, #e1eaf6)!important;
    border:1px solid #bccce0!important;
    color:#264668!important;
  }
  @media (max-width:1000px){
    body.hs-users-page .hs-users-actions{
      margin-left:0!important;
      width:100%!important;
      justify-content:flex-start!important;
    }
    body.hs-users-page .hs-users-novo-btn{
      width:min(100%, 220px)!important;
      min-width:0!important;
    }
  }
  body.hs-users-page .hs-users-grid-wrap{
    overflow:auto!important;
    -webkit-overflow-scrolling:touch!important;
  }
  body.hs-users-page .hs-users-grid-wrap thead th,
  body.hs-users-page .hs-users-grid-wrap tr:first-child > th{
    position:sticky!important;
    top:0!important;
    z-index:2!important;
  }
  @media (max-width:860px){
    body.hs-users-page #conteudo{
      padding:calc(var(--hs-users-top-offset, 72px) + 8px) 8px 18px!important;
    }
    body.hs-users-page .hs-users-toolbar{
      gap:10px!important;
      padding:10px!important;
    }
    body.hs-users-page .hs-users-filters{
      width:100%!important;
      gap:8px!important;
    }
    body.hs-users-page .hs-users-field,
    body.hs-users-page .hs-users-search{
      width:100%!important;
      min-width:0!important;
      max-width:none!important;
    }
    body.hs-users-page .hs-users-actions{
      width:100%!important;
      justify-content:stretch!important;
    }
    body.hs-users-page .hs-users-novo-btn{
      width:100%!important;
      min-width:0!important;
      max-width:none!important;
    }
    body.hs-users-page .hs-users-grid-wrap table{
      min-width:820px!important;
    }
  }

  /* Cabecalho unificado (todas as paginas internas) */
  body:not(.hs-login-page) #cabecalho{
    background:linear-gradient(180deg, #3f5f86 0%, #21365a 100%)!important;
    z-index:1000010!important;
    isolation:isolate!important;
  }
  body:not(.hs-login-page) #cabecalho :is(table,tr,td,th,div,span,font,b,strong,a){
    background:transparent!important;
    background-image:none!important;
  }
  body:not(.hs-login-page) #cabecalho :is([bgcolor],[style*="background"]):not(input):not(select):not(textarea):not(button):not(img){
    background:transparent!important;
    background-image:none!important;
  }
  body:not(.hs-login-page) #cabecalho_logo{
    background:transparent!important;
    position:relative!important;
    z-index:1000011!important;
  }
  body:not(.hs-login-page) #cabecalho_menu{
    background:#1f2948!important;
    border-top:1px solid rgba(255,255,255,.08)!important;
    position:relative!important;
    z-index:1000011!important;
    display:flex!important;
    align-items:center!important;
    justify-content:flex-end!important;
    flex-wrap:wrap!important;
    gap:8px 10px!important;
    min-height:40px!important;
    padding:6px 10px!important;
    box-sizing:border-box!important;
  }
  body:not(.hs-login-page) #cabecalho_menu > *{
    flex:0 0 auto!important;
    margin:0!important;
    max-width:100%!important;
  }
  body:not(.hs-login-page) #cabecalho_menu > table{
    width:auto!important;
    margin-left:auto!important;
  }
  body:not(.hs-login-page) #cabecalho_menu,
  body:not(.hs-login-page) #cabecalho_menu *{
    color:#eaf2ff!important;
  }
  body:not(.hs-login-page) #cabecalho_menu #${BTN_ID}{
    background:linear-gradient(180deg, #ffffff, #edf3fb)!important;
    color:#17395f!important;
    border:1px solid #bccce0!important;
    margin-left:0!important;
    align-self:center!important;
    flex:0 0 auto!important;
    position:relative!important;
    top:auto!important;
    right:auto!important;
    white-space:nowrap!important;
  }
  body:not(.hs-login-page) #cabecalho_menu :is(input,select,textarea){
    background:linear-gradient(180deg, #f8fbff, #e9eff8)!important;
    color:#1f3f67!important;
    border:1px solid #aabdd6!important;
  }

  /* Visualizar usuario: layout limpo e simetrico */
  body.hs-user-form-page #cabecalho{
    background:linear-gradient(180deg, #3f5f86 0%, #21365a 100%)!important;
  }
  body.hs-user-form-page #cabecalho :is(table,tr,td,th,div,span,font,b,strong,a){
    background:transparent!important;
    background-image:none!important;
  }
  body.hs-user-form-page #cabecalho :is([bgcolor],[style*="background"]):not(input):not(select):not(textarea):not(button):not(img){
    background:transparent!important;
    background-image:none!important;
  }
  body.hs-user-form-page #cabecalho_logo{
    background:transparent!important;
  }
  body.hs-user-form-page #cabecalho_menu{
    background:#1f2948!important;
    border-top:1px solid rgba(255,255,255,.08)!important;
    justify-content:flex-end!important;
    padding-right:150px!important;
  }
  body.hs-user-form-page #cabecalho_menu,
  body.hs-user-form-page #cabecalho_menu *{
    color:#eaf2ff!important;
  }
  body.hs-user-form-page #cabecalho_menu #${BTN_ID}{
    background:linear-gradient(180deg, #ffffff, #edf3fb)!important;
    color:#17395f!important;
    border:1px solid #bccce0!important;
    position:fixed!important;
    top:10px!important;
    right:12px!important;
    z-index:1000013!important;
    margin:0!important;
    min-height:30px!important;
    padding:4px 12px!important;
    box-shadow:0 8px 18px rgba(0,0,0,.22)!important;
  }
  body.hs-user-form-page #cabecalho_menu > table{
    margin-right:0!important;
  }
  body.hs-user-form-page #cabecalho_menu :is(input,select,textarea){
    background:linear-gradient(180deg, #f8fbff, #e9eff8)!important;
    color:#1f3f67!important;
    border:1px solid #aabdd6!important;
  }
  body.hs-user-form-page #cabecalho .hs-hide-on-user-form{
    display:none!important;
  }
  body.hs-user-form-page #conteudo{
    max-width:1180px!important;
    margin:0 auto!important;
    padding:calc(var(--hs-user-form-top-offset, 72px) + 10px) 12px 28px!important;
    box-sizing:border-box!important;
  }
  body.hs-user-form-page .hs-user-form-shell{
    width:min(920px, 100%)!important;
    margin:0 auto!important;
    padding:14px 16px 18px!important;
    border-radius:18px!important;
    box-sizing:border-box!important;
  }
  body.hs-user-form-page #conteudo form{
    width:100%!important;
    max-width:860px!important;
    margin:0 auto!important;
    display:flex!important;
    flex-direction:column!important;
    gap:12px!important;
  }
  body.hs-user-form-page .hs-user-section-title{
    width:100%!important;
    max-width:760px!important;
    margin:0 auto 2px!important;
    font-size:29px!important;
    line-height:1.2!important;
    font-weight:900!important;
    letter-spacing:.01em!important;
    color:var(--fg)!important;
    display:block!important;
  }
  body.hs-user-form-page #conteudo form table:not(.sortable){
    width:100%!important;
    max-width:760px!important;
    margin:0 auto!important;
    border-collapse:separate!important;
    border-spacing:0!important;
    border-radius:14px!important;
    overflow:hidden!important;
    table-layout:fixed!important;
  }
  body.hs-user-form-page #conteudo form table:not(.sortable) td,
  body.hs-user-form-page #conteudo form table:not(.sortable) th{
    padding:8px 10px!important;
    font-size:13px!important;
    line-height:1.25!important;
    vertical-align:middle!important;
  }
  body.hs-user-form-page #conteudo form table:not(.sortable) tr > td:first-child,
  body.hs-user-form-page #conteudo form table:not(.sortable) tr > th:first-child{
    width:36%!important;
    font-weight:800!important;
    white-space:nowrap!important;
  }
  body.hs-user-form-page #conteudo form table:not(.sortable) tr > td:last-child{
    width:64%!important;
  }
  body.hs-user-form-page #conteudo form .hs-user-info-table tr.hs-user-row-select td.hs-user-select-cell{
    width:64%!important;
    padding-right:10px!important;
    box-sizing:border-box!important;
    overflow:hidden!important;
  }
  body.hs-user-form-page #conteudo form .hs-user-info-table tr.hs-user-row-select td.hs-user-select-cell > *{
    width:100%!important;
    max-width:none!important;
    box-sizing:border-box!important;
  }
  body.hs-user-form-page #conteudo form .hs-user-info-table tr.hs-user-row-select td.hs-user-select-cell table{
    width:100%!important;
    max-width:none!important;
    table-layout:fixed!important;
  }
  body.hs-user-form-page #conteudo form .hs-user-info-table tr.hs-user-row-select td.hs-user-select-cell :is(table,thead,tbody,tfoot,tr,td,th){
    border:0!important;
    box-shadow:none!important;
    background:transparent!important;
    background-image:none!important;
  }
  body.hs-user-form-page #conteudo form .hs-user-info-table tr.hs-user-row-select td.hs-user-select-cell :is(td,th){
    width:auto!important;
    padding:0!important;
  }
  body.hs-user-form-page #conteudo form .hs-user-info-table tr.hs-user-row-select td.hs-user-select-cell select{
    width:100%!important;
    min-width:100%!important;
    max-width:none!important;
    height:36px!important;
    min-height:36px!important;
    margin:0!important;
    box-sizing:border-box!important;
    display:block!important;
  }
  body.hs-user-form-page #conteudo form .hs-user-pass-table tr > :is(td,th):first-child{
    text-align:left!important;
    font-weight:800!important;
    white-space:nowrap!important;
    padding-left:10px!important;
  }
  body.hs-user-form-page #conteudo form .hs-user-pass-table tr > :is(td,th):first-child *{
    text-align:left!important;
  }
  body.hs-user-form-page #conteudo form input[type="text"],
  body.hs-user-form-page #conteudo form input[type="email"],
  body.hs-user-form-page #conteudo form input[type="password"],
  body.hs-user-form-page #conteudo form select{
    width:100%!important;
    min-height:38px!important;
    height:38px!important;
    border-radius:10px!important;
    font-size:14px!important;
    padding:7px 10px!important;
    box-sizing:border-box!important;
  }
  body.hs-user-form-page #conteudo form input[type="checkbox"]{
    width:16px!important;
    height:16px!important;
    min-height:16px!important;
    vertical-align:middle!important;
  }
  body.hs-user-form-page #conteudo form .hs-user-pass-table{
    max-width:760px!important;
  }
  body.hs-user-form-page #conteudo form .hs-user-actions{
    width:100%!important;
    max-width:760px!important;
    margin:6px auto 0!important;
    display:flex!important;
    flex-wrap:wrap!important;
    align-items:center!important;
    justify-content:flex-end!important;
    gap:10px!important;
  }
  body.hs-user-form-page #conteudo form .hs-user-actions-secondary{
    width:100%!important;
    max-width:760px!important;
    margin:2px auto 0!important;
    display:flex!important;
    flex-wrap:wrap!important;
    align-items:center!important;
    justify-content:center!important;
    gap:10px!important;
  }
  body.hs-user-form-page #conteudo form .hs-user-action-btn{
    min-width:148px!important;
    min-height:38px!important;
    height:38px!important;
    padding:6px 16px!important;
    border-radius:10px!important;
    font-size:13px!important;
    font-weight:800!important;
    line-height:1!important;
    display:inline-flex!important;
    align-items:center!important;
    justify-content:center!important;
    text-decoration:none!important;
    cursor:pointer!important;
    box-sizing:border-box!important;
  }
  body.hs-user-form-page #conteudo form .hs-user-legacy-action-btn{
    min-width:220px!important;
    min-height:38px!important;
    height:38px!important;
    max-width:100%!important;
    padding:6px 16px!important;
    border-radius:10px!important;
    font-size:13px!important;
    font-weight:800!important;
    line-height:1!important;
    display:inline-flex!important;
    align-items:center!important;
    justify-content:center!important;
    text-decoration:none!important;
    cursor:pointer!important;
    box-sizing:border-box!important;
    white-space:nowrap!important;
  }
  html[data-hs-theme="dark"] body.hs-user-form-page #conteudo form table:not(.sortable){
    background:linear-gradient(180deg, #0f1827, #0d1622)!important;
    border:1px solid #2a3950!important;
    box-shadow:0 8px 18px rgba(0,0,0,.2)!important;
  }
  html[data-hs-theme="dark"] body.hs-user-form-page .hs-user-form-shell{
    background:linear-gradient(180deg, rgba(14,24,39,.96), rgba(11,20,32,.94))!important;
    border:1px solid #2a3b51!important;
    box-shadow:0 14px 30px rgba(0,0,0,.28)!important;
  }
  html[data-hs-theme="dark"] body.hs-user-form-page #conteudo form table:not(.sortable) td,
  html[data-hs-theme="dark"] body.hs-user-form-page #conteudo form table:not(.sortable) th{
    background:#0f1b2b!important;
    color:#dce9fb!important;
    border:1px solid #2b3c52!important;
  }
  html[data-hs-theme="dark"] body.hs-user-form-page #conteudo form table:not(.sortable) tr > td:first-child,
  html[data-hs-theme="dark"] body.hs-user-form-page #conteudo form table:not(.sortable) tr > th:first-child{
    background:#162a42!important;
    color:#eaf2ff!important;
  }
  html[data-hs-theme="dark"] body.hs-user-form-page #conteudo form .hs-user-pass-table :is(td,th){
    background:#0f1b2b!important;
    color:#dce9fb!important;
    border-color:#2b3c52!important;
    background-image:none!important;
  }
  html[data-hs-theme="dark"] body.hs-user-form-page #conteudo form .hs-user-pass-table :is(table,thead,tbody,tfoot,tr){
    border-color:#2b3c52!important;
    background-image:none!important;
    box-shadow:none!important;
  }
  html[data-hs-theme="dark"] body.hs-user-form-page #conteudo form .hs-user-pass-table :is(tr,td,th)[bgcolor],
  html[data-hs-theme="dark"] body.hs-user-form-page #conteudo form .hs-user-pass-table :is(tr,td,th)[style*="003366"],
  html[data-hs-theme="dark"] body.hs-user-form-page #conteudo form .hs-user-pass-table :is(tr,td,th)[style*="#003366"]{
    background:#0f1b2b!important;
    color:#dce9fb!important;
    border-color:#2b3c52!important;
    background-image:none!important;
  }
  html[data-hs-theme="dark"] body.hs-user-form-page #conteudo form .hs-user-pass-table tr > :is(td,th):first-child{
    background:#162a42!important;
    color:#eaf2ff!important;
  }
  html[data-hs-theme="dark"] body.hs-user-form-page #conteudo form .hs-user-action-btn{
    background:linear-gradient(120deg, #1f5fb4, #2d78d6)!important;
    color:#ffffff!important;
    border:1px solid #3f88dd!important;
  }
  html[data-hs-theme="dark"] body.hs-user-form-page #conteudo form .hs-user-legacy-action-btn{
    background:linear-gradient(180deg, #1d2a3c, #233347)!important;
    color:#dce9fb!important;
    border:1px solid #425b78!important;
  }
  html[data-hs-theme="dark"] body.hs-user-form-page #conteudo form .hs-user-action-btn:hover{
    filter:brightness(1.08)!important;
  }
  html[data-hs-theme="dark"] body.hs-user-form-page #conteudo form .hs-user-legacy-action-btn:hover{
    background:linear-gradient(180deg, #22354c, #29405c)!important;
  }
  html[data-hs-theme="light"] body.hs-user-form-page #conteudo form table:not(.sortable){
    background:linear-gradient(180deg, #ffffff, #f5f8fd)!important;
    border:1px solid #d5e0ef!important;
    box-shadow:0 8px 16px rgba(20,45,90,.08)!important;
  }
  html[data-hs-theme="light"] body.hs-user-form-page .hs-user-form-shell{
    background:linear-gradient(180deg, #ffffff, #f6f9ff)!important;
    border:1px solid #d4e0ee!important;
    box-shadow:0 12px 26px rgba(20,45,90,.1)!important;
  }
  html[data-hs-theme="light"] body.hs-user-form-page #conteudo form table:not(.sortable) td,
  html[data-hs-theme="light"] body.hs-user-form-page #conteudo form table:not(.sortable) th{
    background:#ffffff!important;
    color:#1f3d62!important;
    border:1px solid #d8e3f2!important;
  }
  html[data-hs-theme="light"] body.hs-user-form-page #conteudo form table:not(.sortable) tr > td:first-child,
  html[data-hs-theme="light"] body.hs-user-form-page #conteudo form table:not(.sortable) tr > th:first-child{
    background:#ecf3fd!important;
    color:#17395f!important;
  }
  html[data-hs-theme="light"] body.hs-user-form-page #conteudo form .hs-user-pass-table :is(td,th){
    background:#ffffff!important;
    color:#1f3d62!important;
    border-color:#d8e3f2!important;
    background-image:none!important;
  }
  html[data-hs-theme="light"] body.hs-user-form-page #conteudo form .hs-user-pass-table :is(table,thead,tbody,tfoot,tr){
    border-color:#d8e3f2!important;
    background-image:none!important;
    box-shadow:none!important;
  }
  html[data-hs-theme="light"] body.hs-user-form-page #conteudo form .hs-user-pass-table :is(tr,td,th)[bgcolor],
  html[data-hs-theme="light"] body.hs-user-form-page #conteudo form .hs-user-pass-table :is(tr,td,th)[style*="003366"],
  html[data-hs-theme="light"] body.hs-user-form-page #conteudo form .hs-user-pass-table :is(tr,td,th)[style*="#003366"]{
    background:#ffffff!important;
    color:#1f3d62!important;
    border-color:#d8e3f2!important;
    background-image:none!important;
  }
  html[data-hs-theme="light"] body.hs-user-form-page #conteudo form .hs-user-pass-table tr > :is(td,th):first-child{
    background:#ecf3fd!important;
    color:#17395f!important;
  }
  html[data-hs-theme="light"] body.hs-user-form-page #conteudo form table:not(.sortable) tr > :is(td,th):first-child *{
    background:transparent!important;
    color:inherit!important;
  }
  html[data-hs-theme="light"] body.hs-user-form-page #conteudo form .hs-user-action-btn{
    background:linear-gradient(180deg, #edf3fb, #e1eaf6)!important;
    color:#264668!important;
    border:1px solid #bccce0!important;
  }
  html[data-hs-theme="light"] body.hs-user-form-page #conteudo form .hs-user-legacy-action-btn{
    background:linear-gradient(180deg, #f8fbff, #eaf1f9)!important;
    color:#264668!important;
    border:1px solid #bccce0!important;
  }
  html[data-hs-theme="light"] body.hs-user-form-page #conteudo form .hs-user-action-btn:hover{
    background:linear-gradient(180deg, #e3edf9, #d7e4f2)!important;
  }
  html[data-hs-theme="light"] body.hs-user-form-page #conteudo form .hs-user-legacy-action-btn:hover{
    background:linear-gradient(180deg, #e3edf9, #d7e4f2)!important;
  }
  @media (max-width:900px){
    body.hs-user-form-page .hs-user-form-shell{
      width:100%!important;
      padding:12px!important;
      border-radius:14px!important;
    }
    body.hs-user-form-page .hs-user-section-title,
    body.hs-user-form-page #conteudo form table:not(.sortable),
    body.hs-user-form-page #conteudo form .hs-user-pass-table,
    body.hs-user-form-page #conteudo form .hs-user-actions{
      max-width:100%!important;
    }
    body.hs-user-form-page #conteudo form table:not(.sortable) tr > td:first-child,
    body.hs-user-form-page #conteudo form table:not(.sortable) tr > th:first-child{
      width:42%!important;
    }
    body.hs-user-form-page #conteudo form table:not(.sortable) tr > td:last-child{
      width:58%!important;
    }
    body.hs-user-form-page #conteudo form .hs-user-info-table tr.hs-user-row-select td.hs-user-select-cell{
      width:58%!important;
    }
    body.hs-user-form-page #conteudo form .hs-user-actions{
      justify-content:stretch!important;
    }
    body.hs-user-form-page #conteudo form .hs-user-actions-secondary{
      justify-content:stretch!important;
    }
    body.hs-user-form-page #conteudo form .hs-user-action-btn{
      flex:1 1 200px!important;
      width:auto!important;
    }
    body.hs-user-form-page #conteudo form .hs-user-legacy-action-btn{
      flex:1 1 200px!important;
      width:auto!important;
    }
  }
  body.hs-user-form-page #conteudo{
    max-width:1280px!important;
    padding:calc(var(--hs-user-form-top-offset, 72px) + 10px) clamp(10px, 2vw, 18px) 24px!important;
  }
  body.hs-user-form-page .hs-user-form-shell{
    width:min(1080px, 100%)!important;
    padding:clamp(10px, 2vw, 18px)!important;
    border-radius:20px!important;
  }
  body.hs-user-form-page #conteudo form{
    max-width:none!important;
    gap:14px!important;
  }
  body.hs-user-form-page #conteudo form > br,
  body.hs-user-form-page #conteudo form .hs-user-legacy-title-source{
    display:none!important;
  }
  body.hs-user-form-page #conteudo form .hs-user-section-card{
    width:100%!important;
    max-width:none!important;
    margin:0!important;
    border-radius:18px!important;
    overflow:hidden!important;
    border:1px solid var(--border)!important;
    background:var(--panel)!important;
    box-shadow:0 14px 28px rgba(0,0,0,.14)!important;
  }
  body.hs-user-form-page #conteudo form .hs-user-section-card-body{
    padding:0 18px 18px!important;
  }
  body.hs-user-form-page #conteudo form .hs-user-section-card .hs-user-section-title{
    width:100%!important;
    max-width:none!important;
    margin:0!important;
    padding:18px 18px 12px!important;
    font-size:clamp(18px, 2vw, 24px)!important;
    line-height:1.25!important;
  }
  body.hs-user-form-page #conteudo form .hs-user-section-card :is(.hs-user-info-table, .hs-user-pass-table){
    width:100%!important;
    max-width:none!important;
    margin:0!important;
    table-layout:fixed!important;
    background:transparent!important;
    border:0!important;
    box-shadow:none!important;
  }
  body.hs-user-form-page #conteudo form .hs-user-main-table > tbody > tr,
  body.hs-user-form-page #conteudo form .hs-user-main-table > tr{
    display:grid!important;
    grid-template-columns:minmax(170px, 230px) minmax(0, 1fr)!important;
    align-items:center!important;
    gap:0!important;
  }
  body.hs-user-form-page #conteudo form .hs-user-main-table > tbody > tr > :is(td,th),
  body.hs-user-form-page #conteudo form .hs-user-main-table > tr > :is(td,th){
    width:auto!important;
    min-width:0!important;
    padding:11px 14px!important;
    border:0!important;
    box-shadow:none!important;
  }
  body.hs-user-form-page #conteudo form .hs-user-main-table > tbody > tr > .hs-user-form-label-cell,
  body.hs-user-form-page #conteudo form .hs-user-main-table > tr > .hs-user-form-label-cell{
    font-size:12px!important;
    line-height:1.35!important;
    letter-spacing:.01em!important;
    border-radius:12px 0 0 12px!important;
  }
  body.hs-user-form-page #conteudo form .hs-user-main-table > tbody > tr > .hs-user-form-value-cell,
  body.hs-user-form-page #conteudo form .hs-user-main-table > tr > .hs-user-form-value-cell{
    border-radius:0 12px 12px 0!important;
    padding-left:16px!important;
  }
  body.hs-user-form-page #conteudo form .hs-user-main-table > tbody > tr.hs-user-row-full > :is(td,th):first-child,
  body.hs-user-form-page #conteudo form .hs-user-main-table > tr.hs-user-row-full > :is(td,th):first-child{
    grid-column:1 / -1!important;
    border-radius:12px!important;
  }
  body.hs-user-form-page #conteudo form .hs-user-main-table > tbody > tr.hs-user-row-checkbox > .hs-user-form-value-cell,
  body.hs-user-form-page #conteudo form .hs-user-main-table > tr.hs-user-row-checkbox > .hs-user-form-value-cell{
    display:flex!important;
    align-items:center!important;
    gap:10px!important;
    min-height:44px!important;
  }
  body.hs-user-form-page #conteudo form .hs-user-main-table > tbody > tr.hs-user-row-select > .hs-user-form-value-cell,
  body.hs-user-form-page #conteudo form .hs-user-main-table > tr.hs-user-row-select > .hs-user-form-value-cell{
    overflow:hidden!important;
  }
  body.hs-user-form-page #conteudo form :is(.hs-user-info-table, .hs-user-pass-table)
    :is(input[type="text"], input[type="email"], input[type="password"], select){
    min-height:34px!important;
    height:34px!important;
    font-size:13px!important;
    padding:6px 10px!important;
  }
  body.hs-user-form-page #conteudo form input[type="checkbox"]{
    width:15px!important;
    height:15px!important;
    min-height:15px!important;
  }
  body.hs-user-form-page #conteudo form .hs-user-actions,
  body.hs-user-form-page #conteudo form .hs-user-actions-secondary{
    max-width:none!important;
    width:100%!important;
    margin:0!important;
    justify-content:flex-start!important;
  }
  body.hs-user-form-page #conteudo form .hs-user-action-btn{
    min-width:138px!important;
    min-height:36px!important;
    height:36px!important;
    padding:6px 14px!important;
  }
  body.hs-user-form-page #conteudo form .hs-user-legacy-action-btn{
    min-width:190px!important;
    min-height:36px!important;
    height:36px!important;
    padding:6px 14px!important;
  }
  html[data-hs-theme="dark"] body.hs-user-form-page #conteudo form .hs-user-section-card{
    background:linear-gradient(180deg, rgba(14,24,39,.98), rgba(11,20,32,.96))!important;
    border-color:#2a3b51!important;
    box-shadow:0 16px 30px rgba(0,0,0,.28)!important;
  }
  html[data-hs-theme="dark"] body.hs-user-form-page #conteudo form .hs-user-main-table > tbody > tr:not(:last-child) > :is(td,th),
  html[data-hs-theme="dark"] body.hs-user-form-page #conteudo form .hs-user-main-table > tr:not(:last-child) > :is(td,th){
    box-shadow:inset 0 -1px 0 #2b3c52!important;
  }
  html[data-hs-theme="dark"] body.hs-user-form-page #conteudo form .hs-user-main-table > tbody > tr > .hs-user-form-label-cell,
  html[data-hs-theme="dark"] body.hs-user-form-page #conteudo form .hs-user-main-table > tr > .hs-user-form-label-cell{
    background:#162a42!important;
    color:#eaf2ff!important;
  }
  html[data-hs-theme="dark"] body.hs-user-form-page #conteudo form .hs-user-main-table > tbody > tr > .hs-user-form-value-cell,
  html[data-hs-theme="dark"] body.hs-user-form-page #conteudo form .hs-user-main-table > tr > .hs-user-form-value-cell{
    background:#0f1b2b!important;
    color:#dce9fb!important;
  }
  html[data-hs-theme="light"] body.hs-user-form-page #conteudo form .hs-user-section-card{
    background:linear-gradient(180deg, #ffffff, #f6f9ff)!important;
    border-color:#d4e0ee!important;
    box-shadow:0 12px 24px rgba(20,45,90,.1)!important;
  }
  html[data-hs-theme="light"] body.hs-user-form-page #conteudo form .hs-user-main-table > tbody > tr:not(:last-child) > :is(td,th),
  html[data-hs-theme="light"] body.hs-user-form-page #conteudo form .hs-user-main-table > tr:not(:last-child) > :is(td,th){
    box-shadow:inset 0 -1px 0 #d8e3f2!important;
  }
  html[data-hs-theme="light"] body.hs-user-form-page #conteudo form .hs-user-main-table > tbody > tr > .hs-user-form-label-cell,
  html[data-hs-theme="light"] body.hs-user-form-page #conteudo form .hs-user-main-table > tr > .hs-user-form-label-cell{
    background:#ecf3fd!important;
    color:#17395f!important;
  }
  html[data-hs-theme="light"] body.hs-user-form-page #conteudo form .hs-user-main-table > tbody > tr > .hs-user-form-value-cell,
  html[data-hs-theme="light"] body.hs-user-form-page #conteudo form .hs-user-main-table > tr > .hs-user-form-value-cell{
    background:#ffffff!important;
    color:#1f3d62!important;
  }
  @media (max-width:880px){
    body.hs-user-form-page #conteudo{
      padding:calc(var(--hs-user-form-top-offset, 72px) + 8px) 9px 18px!important;
    }
    body.hs-user-form-page .hs-user-form-shell{
      padding:10px!important;
      border-radius:16px!important;
    }
    body.hs-user-form-page #conteudo form .hs-user-section-card{
      border-radius:16px!important;
    }
    body.hs-user-form-page #conteudo form .hs-user-section-card-body{
      padding:0 12px 12px!important;
    }
    body.hs-user-form-page #conteudo form .hs-user-section-card .hs-user-section-title{
      padding:14px 12px 10px!important;
      font-size:18px!important;
    }
    body.hs-user-form-page #conteudo form .hs-user-main-table > tbody > tr,
    body.hs-user-form-page #conteudo form .hs-user-main-table > tr{
      grid-template-columns:1fr!important;
    }
    body.hs-user-form-page #conteudo form .hs-user-main-table > tbody > tr > .hs-user-form-label-cell,
    body.hs-user-form-page #conteudo form .hs-user-main-table > tr > .hs-user-form-label-cell{
      border-radius:12px 12px 0 0!important;
      padding-bottom:6px!important;
    }
    body.hs-user-form-page #conteudo form .hs-user-main-table > tbody > tr > .hs-user-form-value-cell,
    body.hs-user-form-page #conteudo form .hs-user-main-table > tr > .hs-user-form-value-cell{
      border-radius:0 0 12px 12px!important;
      padding-top:0!important;
      padding-left:14px!important;
    }
    body.hs-user-form-page #conteudo form .hs-user-actions,
    body.hs-user-form-page #conteudo form .hs-user-actions-secondary{
      justify-content:stretch!important;
      gap:8px!important;
    }
    body.hs-user-form-page #conteudo form .hs-user-action-btn,
    body.hs-user-form-page #conteudo form .hs-user-legacy-action-btn{
      width:100%!important;
      min-width:0!important;
      flex:1 1 100%!important;
    }
  }
  body.hs-user-form-page #conteudo form .hs-user-v2-hidden{
    display:none!important;
  }
  body.hs-user-form-page #conteudo form #hs-user-layout-v2{
    width:100%!important;
    display:grid!important;
    gap:16px!important;
  }
  body.hs-user-form-page #conteudo form .hs-user-page-title{
    margin:0!important;
    font-size:clamp(20px, 2.4vw, 28px)!important;
    line-height:1.2!important;
    font-weight:900!important;
    letter-spacing:.01em!important;
  }
  body.hs-user-form-page #conteudo form .hs-user-v2-card{
    width:100%!important;
    border:1px solid var(--border)!important;
    border-radius:18px!important;
    overflow:hidden!important;
    background:var(--panel)!important;
    box-shadow:0 14px 28px rgba(0,0,0,.14)!important;
  }
  body.hs-user-form-page #conteudo form .hs-user-v2-card-head{
    padding:18px 18px 10px!important;
    font-size:clamp(18px, 2vw, 24px)!important;
    line-height:1.2!important;
    font-weight:900!important;
  }
  body.hs-user-form-page #conteudo form .hs-user-v2-card-body{
    padding:0 18px 18px!important;
  }
  body.hs-user-form-page #conteudo form .hs-user-v2-grid{
    display:grid!important;
    gap:12px!important;
  }
  body.hs-user-form-page #conteudo form .hs-user-v2-row{
    display:grid!important;
    grid-template-columns:minmax(170px, 220px) minmax(0, 1fr)!important;
    gap:12px!important;
    align-items:stretch!important;
  }
  body.hs-user-form-page #conteudo form .hs-user-v2-label,
  body.hs-user-form-page #conteudo form .hs-user-v2-value{
    min-width:0!important;
    border-radius:14px!important;
    padding:12px 14px!important;
    box-sizing:border-box!important;
  }
  body.hs-user-form-page #conteudo form .hs-user-v2-label{
    font-size:12px!important;
    line-height:1.35!important;
    font-weight:800!important;
    display:flex!important;
    align-items:center!important;
  }
  body.hs-user-form-page #conteudo form .hs-user-v2-value{
    display:flex!important;
    align-items:center!important;
    gap:10px!important;
    flex-wrap:wrap!important;
  }
  body.hs-user-form-page #conteudo form .hs-user-v2-row.is-checkbox .hs-user-v2-value{
    min-height:48px!important;
  }
  body.hs-user-form-page #conteudo form .hs-user-v2-value > :is(input[type="text"], input[type="email"], input[type="password"], select, textarea){
    width:100%!important;
    min-width:0!important;
    margin:0!important;
  }
  body.hs-user-form-page #conteudo form .hs-user-v2-text{
    font-size:13px!important;
    line-height:1.45!important;
  }
  body.hs-user-form-page #conteudo form .hs-user-checkbox-state{
    display:inline-flex!important;
    align-items:center!important;
    min-height:26px!important;
    padding:4px 10px!important;
    border-radius:999px!important;
    font-size:11px!important;
    font-weight:800!important;
    line-height:1!important;
    white-space:nowrap!important;
  }
  body.hs-user-form-page #conteudo form .hs-user-v2-actions{
    display:grid!important;
    gap:10px!important;
  }
  body.hs-user-form-page #conteudo form .hs-user-v2-actions .hs-user-actions,
  body.hs-user-form-page #conteudo form .hs-user-v2-actions .hs-user-actions-secondary{
    width:100%!important;
    max-width:none!important;
    margin:0!important;
    display:flex!important;
    flex-wrap:wrap!important;
    gap:10px!important;
    justify-content:flex-start!important;
  }
  html[data-hs-theme="dark"] body.hs-user-form-page #conteudo form .hs-user-v2-card{
    background:linear-gradient(180deg, rgba(14,24,39,.98), rgba(11,20,32,.96))!important;
    border-color:#2a3b51!important;
    box-shadow:0 16px 30px rgba(0,0,0,.28)!important;
  }
  html[data-hs-theme="dark"] body.hs-user-form-page #conteudo form .hs-user-v2-label{
    background:#162a42!important;
    color:#eaf2ff!important;
  }
  html[data-hs-theme="dark"] body.hs-user-form-page #conteudo form .hs-user-v2-value{
    background:#0f1b2b!important;
    color:#dce9fb!important;
    box-shadow:inset 0 0 0 1px #2b3c52!important;
  }
  html[data-hs-theme="dark"] body.hs-user-form-page #conteudo form .hs-user-checkbox-state{
    background:rgba(61, 130, 246, .15)!important;
    color:#dce9fb!important;
    border:1px solid #466489!important;
  }
  html[data-hs-theme="dark"] body.hs-user-form-page #conteudo form .hs-user-checkbox-state.is-on{
    background:rgba(52, 211, 153, .18)!important;
    color:#d7ffee!important;
    border-color:#3a9070!important;
  }
  html[data-hs-theme="light"] body.hs-user-form-page #conteudo form .hs-user-v2-card{
    background:linear-gradient(180deg, #ffffff, #f6f9ff)!important;
    border-color:#d4e0ee!important;
    box-shadow:0 12px 24px rgba(20,45,90,.1)!important;
  }
  html[data-hs-theme="light"] body.hs-user-form-page #conteudo form .hs-user-v2-label{
    background:#ecf3fd!important;
    color:#17395f!important;
  }
  html[data-hs-theme="light"] body.hs-user-form-page #conteudo form .hs-user-v2-value{
    background:#ffffff!important;
    color:#1f3d62!important;
    box-shadow:inset 0 0 0 1px #d8e3f2!important;
  }
  html[data-hs-theme="light"] body.hs-user-form-page #conteudo form .hs-user-checkbox-state{
    background:#eef5ff!important;
    color:#23476f!important;
    border:1px solid #c7d8ec!important;
  }
  html[data-hs-theme="light"] body.hs-user-form-page #conteudo form .hs-user-checkbox-state.is-on{
    background:#e7f8ef!important;
    color:#246444!important;
    border-color:#b9dfc8!important;
  }
  @media (max-width:880px){
    body.hs-user-form-page #cabecalho_menu{
      padding-right:132px!important;
    }
    body.hs-user-form-page #cabecalho_menu #${BTN_ID}{
      top:8px!important;
      right:8px!important;
      min-height:28px!important;
      padding:3px 10px!important;
      font-size:12px!important;
    }
    body.hs-user-form-page #conteudo form #hs-user-layout-v2{
      gap:12px!important;
    }
    body.hs-user-form-page #conteudo form .hs-user-v2-card{
      border-radius:16px!important;
    }
    body.hs-user-form-page #conteudo form .hs-user-v2-card-head{
      padding:14px 12px 10px!important;
      font-size:18px!important;
    }
    body.hs-user-form-page #conteudo form .hs-user-v2-card-body{
      padding:0 12px 12px!important;
    }
    body.hs-user-form-page #conteudo form .hs-user-v2-row{
      grid-template-columns:1fr!important;
      gap:8px!important;
    }
    body.hs-user-form-page #conteudo form .hs-user-v2-label,
    body.hs-user-form-page #conteudo form .hs-user-v2-value{
      padding:11px 12px!important;
    }
    body.hs-user-form-page #conteudo form .hs-user-v2-actions .hs-user-action-btn,
    body.hs-user-form-page #conteudo form .hs-user-v2-actions .hs-user-legacy-action-btn{
      width:100%!important;
      min-width:0!important;
      flex:1 1 100%!important;
    }
  }

  /* Dashboard: moderno, alinhado e padronizado */
  body.hs-dashboard-page #conteudo{
    max-width:1680px!important;
    margin:0 auto!important;
    padding:calc(var(--hs-dashboard-top-offset, 72px) + 10px) 14px 22px!important;
    box-sizing:border-box!important;
  }
  body.hs-dashboard-page #cabecalho_logo img{
    height:56px!important;
    width:auto!important;
  }
  body.hs-dashboard-page.hs-consulta-page.hs-consulta-pro-enabled #conteudo{
    max-width:1960px!important;
  }
  body.hs-dashboard-page.hs-consulta-page #hs-consulta-shell{
    display:grid!important;
    grid-template-columns:minmax(0, 1fr) minmax(286px, 332px)!important;
    gap:14px!important;
    align-items:start!important;
  }
  body.hs-dashboard-page.hs-consulta-page #hs-consulta-main{
    min-width:0!important;
  }
  body.hs-dashboard-page.hs-consulta-page #hs-consulta-side{
    position:sticky!important;
    top:calc(var(--hs-dashboard-top-offset, 72px) + 8px)!important;
    align-self:start!important;
    display:flex!important;
    flex-direction:column!important;
    gap:10px!important;
    min-width:0!important;
  }
  body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-side-card{
    border-radius:12px!important;
    border:1px solid #355173!important;
    box-shadow:0 10px 22px rgba(0,0,0,.2)!important;
    padding:11px!important;
    display:flex!important;
    flex-direction:column!important;
    gap:9px!important;
  }
  body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-side-card h3{
    margin:0!important;
    font-size:13px!important;
    line-height:1.2!important;
    font-weight:900!important;
  }
  body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-side-meta{
    margin:0!important;
    font-size:11px!important;
    line-height:1.3!important;
    opacity:.86!important;
  }
  body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-kpi-grid{
    display:grid!important;
    grid-template-columns:repeat(2, minmax(0, 1fr))!important;
    gap:8px!important;
  }
  body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-kpi{
    border-radius:10px!important;
    padding:8px 8px 7px!important;
    border:1px solid transparent!important;
    background:rgba(13,34,57,.48)!important;
    display:flex!important;
    flex-direction:column!important;
    gap:3px!important;
    min-width:0!important;
  }
  body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-kpi.is-clickable{
    cursor:pointer!important;
    transition:transform .14s ease, border-color .14s ease, filter .14s ease!important;
  }
  body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-kpi.is-clickable:hover{
    transform:translateY(-1px)!important;
    border-color:rgba(128,174,222,.6)!important;
    filter:brightness(1.04)!important;
  }
  body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-kpi.is-clickable:focus-visible{
    outline:2px solid rgba(140,193,247,.78)!important;
    outline-offset:1px!important;
  }
  body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-kpi .kpi-label{
    font-size:10px!important;
    font-weight:700!important;
    letter-spacing:.01em!important;
    opacity:.86!important;
  }
  body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-kpi .kpi-value{
    font-size:16px!important;
    font-weight:900!important;
    line-height:1!important;
    letter-spacing:.01em!important;
  }
  body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-kpi.is-approved{
    border-color:rgba(66,142,220,.55)!important;
    background:rgba(26,73,118,.36)!important;
  }
  body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-kpi.is-danger{
    border-color:rgba(206,98,98,.5)!important;
    background:rgba(98,34,34,.36)!important;
  }
  body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-kpi.is-warning{
    border-color:rgba(213,171,81,.54)!important;
    background:rgba(90,66,20,.38)!important;
  }
  body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-kpi.is-new{
    border-color:rgba(89,164,112,.52)!important;
    background:rgba(36,81,44,.34)!important;
  }
  body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-list{
    margin:0!important;
    padding:0!important;
    list-style:none!important;
    display:flex!important;
    flex-direction:column!important;
    gap:7px!important;
  }
  body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-list li{
    margin:0!important;
    padding:7px 8px!important;
    border-radius:9px!important;
    border:1px solid rgba(124,164,205,.26)!important;
    background:rgba(14,32,53,.36)!important;
    font-size:11px!important;
    line-height:1.32!important;
  }
  body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-list li.hs-consulta-ticket-item{
    cursor:pointer!important;
    transition:border-color .14s ease, background-color .14s ease, transform .14s ease!important;
  }
  body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-list li.hs-consulta-ticket-item:hover{
    border-color:rgba(136,184,235,.5)!important;
    background:rgba(20,42,68,.46)!important;
    transform:translateY(-1px)!important;
  }
  body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-list li.hs-consulta-ticket-item:focus-visible{
    outline:2px solid rgba(140,193,247,.82)!important;
    outline-offset:1px!important;
  }
  body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-list li .hs-main{
    display:flex!important;
    align-items:center!important;
    justify-content:space-between!important;
    gap:8px!important;
    font-weight:800!important;
  }
  body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-list li .hs-ticket-num{
    font-weight:900!important;
    letter-spacing:.01em!important;
  }
  body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-list li .hs-ticket-main-right{
    display:inline-flex!important;
    align-items:center!important;
    gap:7px!important;
    flex:0 0 auto!important;
  }
  body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-list li .hs-ticket-open{
    min-height:22px!important;
    height:22px!important;
    border-radius:6px!important;
    border:1px solid #5f82ab!important;
    background:linear-gradient(180deg, #2d5279, #25496d)!important;
    color:#dcecff!important;
    font-size:10px!important;
    font-weight:800!important;
    padding:2px 7px!important;
    cursor:pointer!important;
  }
  body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-list li .hs-ticket-open:hover{
    border-color:#83acd7!important;
    filter:brightness(1.05)!important;
  }
  body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-list li .hs-tag-row{
    display:flex!important;
    flex-wrap:wrap!important;
    gap:5px!important;
    margin-top:4px!important;
  }
  body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-list li .hs-tag{
    display:inline-flex!important;
    align-items:center!important;
    border-radius:999px!important;
    border:1px solid rgba(121,165,211,.45)!important;
    background:rgba(26,62,98,.45)!important;
    color:#d9eaff!important;
    font-size:10px!important;
    font-weight:800!important;
    line-height:1!important;
    padding:2px 7px!important;
  }
  body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-list li .hs-tag.is-warning{
    border-color:rgba(214,175,90,.58)!important;
    background:rgba(112,84,26,.45)!important;
  }
  body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-list li .hs-tag.is-danger{
    border-color:rgba(209,108,108,.6)!important;
    background:rgba(112,44,44,.44)!important;
  }
  body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-list li .hs-tag.is-approved{
    border-color:rgba(96,152,216,.64)!important;
    background:rgba(36,82,130,.42)!important;
  }
  body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-list li .hs-tag.is-new{
    border-color:rgba(108,174,126,.58)!important;
    background:rgba(40,90,52,.44)!important;
  }
  body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-list li .hs-sub{
    margin-top:3px!important;
    opacity:.86!important;
  }
  body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-list a{
    color:inherit!important;
    text-decoration:none!important;
  }
  body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-list a:hover{
    text-decoration:underline!important;
  }
  body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-empty{
    margin:0!important;
    font-size:11px!important;
    opacity:.8!important;
  }
  body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-actions{
    display:flex!important;
    flex-wrap:wrap!important;
    gap:7px!important;
    margin-top:2px!important;
  }
  body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-action-btn{
    border-radius:8px!important;
    border:1px solid #4f7097!important;
    background:linear-gradient(180deg, #254666, #1f3e5e)!important;
    color:#dbeafe!important;
    font-size:11px!important;
    font-weight:800!important;
    min-height:29px!important;
    padding:5px 10px!important;
    cursor:pointer!important;
  }
  body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-action-btn[disabled]{
    opacity:.72!important;
    cursor:wait!important;
  }
  body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-sync-list{
    margin:0!important;
    padding:0!important;
    list-style:none!important;
    display:flex!important;
    flex-direction:column!important;
    gap:6px!important;
  }
  body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-sync-item{
    display:flex!important;
    align-items:center!important;
    justify-content:space-between!important;
    gap:9px!important;
    font-size:11px!important;
    line-height:1.3!important;
  }
  body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-sync-item .lbl{
    opacity:.82!important;
    font-weight:700!important;
  }
  body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-sync-item .val{
    font-weight:800!important;
    text-align:right!important;
  }
  body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-sync-status{
    display:inline-flex!important;
    align-items:center!important;
    gap:6px!important;
    font-size:11px!important;
    font-weight:800!important;
  }
  body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-sync-status .dot{
    width:8px!important;
    height:8px!important;
    border-radius:50%!important;
    background:#6fb8ff!important;
    box-shadow:0 0 0 3px rgba(111,184,255,.2)!important;
    flex:0 0 auto!important;
  }
  body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-sync-status.is-loading .dot{
    background:#f7d171!important;
    box-shadow:0 0 0 3px rgba(247,209,113,.24)!important;
    animation:hs-consulta-loading-pulse 1.2s ease-in-out infinite!important;
  }
  body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-sync-status.is-error .dot{
    background:#f08a8a!important;
    box-shadow:0 0 0 3px rgba(240,138,138,.24)!important;
  }
  @keyframes hs-consulta-loading-pulse{
    0%{ transform:scale(1); }
    50%{ transform:scale(1.2); }
    100%{ transform:scale(1); }
  }
  body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-status-filter-btn{
    width:100%!important;
    border-radius:8px!important;
    border:1px solid #4a678a!important;
    background:linear-gradient(180deg, #1d3856, #183250)!important;
    color:#deebfb!important;
    min-height:30px!important;
    padding:5px 8px!important;
    display:flex!important;
    align-items:center!important;
    justify-content:space-between!important;
    gap:8px!important;
    cursor:pointer!important;
    text-align:left!important;
    font-size:11px!important;
    font-weight:800!important;
  }
  body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-status-filter-btn:hover{
    border-color:#6889b1!important;
    filter:brightness(1.04)!important;
  }
  body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-status-filter-btn.is-active{
    border-color:#7fb4e6!important;
    background:linear-gradient(180deg, #29537d, #214869)!important;
    box-shadow:0 0 0 1px rgba(127,180,230,.36)!important;
  }
  body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-status-filter-btn .hs-label{
    min-width:0!important;
    overflow:hidden!important;
    text-overflow:ellipsis!important;
    white-space:nowrap!important;
  }
  body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-status-filter-btn .hs-count{
    flex:0 0 auto!important;
  }
  html[data-hs-theme="dark"] body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-side-card{
    background:linear-gradient(180deg, #11263e, #0f2238)!important;
    border-color:#385679!important;
    color:#deebfb!important;
  }
  html[data-hs-theme="light"] body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-side-card{
    background:linear-gradient(180deg, #ffffff, #f4f8fd)!important;
    border-color:#ccdcee!important;
    box-shadow:0 8px 18px rgba(21,56,102,.1)!important;
    color:#1d3d63!important;
  }
  html[data-hs-theme="light"] body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-kpi{
    background:#f8fbff!important;
    border-color:#d9e6f3!important;
  }
  html[data-hs-theme="light"] body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-kpi.is-approved{
    border-color:#8fb7df!important;
    background:#ecf5ff!important;
  }
  html[data-hs-theme="light"] body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-kpi.is-danger{
    border-color:#e4b4b4!important;
    background:#fff0f0!important;
  }
  html[data-hs-theme="light"] body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-kpi.is-warning{
    border-color:#e5ce9b!important;
    background:#fff8ea!important;
  }
  html[data-hs-theme="light"] body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-kpi.is-new{
    border-color:#aad1b6!important;
    background:#eefaf1!important;
  }
  html[data-hs-theme="light"] body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-list li{
    border-color:#d9e6f3!important;
    background:#f8fbff!important;
  }
  html[data-hs-theme="light"] body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-list li.hs-consulta-ticket-item:hover{
    border-color:#bad0e7!important;
    background:#eff6ff!important;
  }
  html[data-hs-theme="light"] body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-action-btn{
    border-color:#bcd0e4!important;
    background:linear-gradient(180deg, #edf4fc, #dfeaf8)!important;
    color:#23496f!important;
  }
  html[data-hs-theme="light"] body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-status-filter-btn{
    border-color:#c2d6ea!important;
    background:linear-gradient(180deg, #f2f8ff, #e7f1fc)!important;
    color:#254a70!important;
  }
  html[data-hs-theme="light"] body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-status-filter-btn.is-active{
    border-color:#8fb7df!important;
    background:linear-gradient(180deg, #eaf3ff, #dcecff)!important;
    box-shadow:0 0 0 1px rgba(77,127,182,.2)!important;
  }
  html[data-hs-theme="light"] body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-list li .hs-ticket-open{
    border-color:#b7cfe8!important;
    background:linear-gradient(180deg, #edf5ff, #dceaf9)!important;
    color:#20476d!important;
  }
  html[data-hs-theme="light"] body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-list li .hs-tag{
    border-color:#bdd4eb!important;
    background:#eaf3ff!important;
    color:#214a70!important;
  }
  html[data-hs-theme="light"] body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-list li .hs-tag.is-warning{
    border-color:#e5cf9f!important;
    background:#fff6e6!important;
    color:#75531f!important;
  }
  html[data-hs-theme="light"] body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-list li .hs-tag.is-danger{
    border-color:#e3b8b8!important;
    background:#fff0f0!important;
    color:#7c3535!important;
  }
  html[data-hs-theme="light"] body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-list li .hs-tag.is-approved{
    border-color:#a9c8e7!important;
    background:#edf5ff!important;
    color:#295a89!important;
  }
  html[data-hs-theme="light"] body.hs-dashboard-page.hs-consulta-page #hs-consulta-side .hs-consulta-list li .hs-tag.is-new{
    border-color:#b4d8c0!important;
    background:#edf9f0!important;
    color:#2c6f3e!important;
  }
  body.hs-dashboard-page form[name="filtros"]{
    border-radius:14px!important;
    padding:10px!important;
    margin:0 0 10px 0!important;
    box-shadow:0 6px 18px rgba(0,0,0,.14)!important;
  }
  body.hs-dashboard-page form[name="filtros"] table{
    width:auto!important;
    max-width:100%!important;
    border-collapse:separate!important;
    border-spacing:4px 8px!important;
  }
  body.hs-dashboard-page form[name="filtros"] th{
    font-size:13px!important;
    font-weight:800!important;
    white-space:nowrap!important;
    padding:0 2px!important;
    text-align:left!important;
    vertical-align:middle!important;
  }
  body.hs-dashboard-page form[name="filtros"] td{
    padding:0 2px!important;
    vertical-align:middle!important;
  }
  body.hs-dashboard-page form[name="filtros"] th:nth-child(1){
    width:auto!important;
    text-align:left!important;
    padding-right:2px!important;
  }
  body.hs-dashboard-page form[name="filtros"] th:nth-child(3){
    width:auto!important;
    text-align:left!important;
    padding-left:0!important;
    padding-right:2px!important;
  }
  body.hs-dashboard-page form[name="filtros"] td:nth-child(2),
  body.hs-dashboard-page form[name="filtros"] td:nth-child(4){
    width:244px!important;
    min-width:244px!important;
    max-width:244px!important;
    white-space:nowrap!important;
  }
  body.hs-dashboard-page form[name="filtros"] td:nth-child(2):has(select, input[type="text"]),
  body.hs-dashboard-page form[name="filtros"] td:nth-child(4):has(select, input[type="text"]){
    display:flex!important;
    align-items:center!important;
    gap:3px!important;
    justify-content:flex-start!important;
  }
  body.hs-dashboard-page form[name="filtros"] select,
  body.hs-dashboard-page form[name="filtros"] input[type="text"]{
    width:236px!important;
    min-width:236px!important;
    max-width:236px!important;
    flex:0 0 236px!important;
    height:22px!important;
    min-height:22px!important;
    padding:0 8px!important;
    border-radius:6px!important;
    font-size:11px!important;
    line-height:1.15!important;
    box-sizing:border-box!important;
  }
  body.hs-dashboard-page form[name="filtros"] input[type="checkbox"]{
    transform:translateY(1px)!important;
    margin-right:6px!important;
  }
  body.hs-dashboard-page form[name="filtros"] td label{
    display:inline-flex!important;
    align-items:center!important;
    gap:6px!important;
    margin:2px 0!important;
  }
  body.hs-dashboard-page form[name="filtros"] td label input[type="checkbox"]{
    margin:0!important;
    transform:none!important;
  }
  body.hs-dashboard-page form[name="filtros"] td:has(.hs-dashboard-extra-toggle-wrap){
    white-space:normal!important;
    vertical-align:top!important;
  }
  body.hs-dashboard-page form[name="filtros"] .hs-dashboard-extra-toggle-wrap{
    display:block!important;
    width:100%!important;
    margin:2px 0 0 0!important;
    clear:none!important;
    float:none!important;
    flex:none!important;
    min-width:0!important;
  }
  body.hs-dashboard-page form[name="filtros"] .hs-dashboard-extra-toggle{
    display:inline!important;
    color:inherit!important;
    font-size:inherit!important;
    font-weight:inherit!important;
    line-height:inherit!important;
    cursor:pointer!important;
    margin:0!important;
    vertical-align:middle!important;
  }
  body.hs-dashboard-page form[name="filtros"] .hs-dashboard-extra-toggle-wrap input[type="checkbox"]{
    margin:0 6px 0 0!important;
    transform:translateY(1px)!important;
    vertical-align:middle!important;
  }
  body.hs-dashboard-page form[name="filtros"] td :is(img, input[type="image"]){
    float:none!important;
    position:static!important;
    margin:0!important;
    vertical-align:middle!important;
    flex:0 0 auto!important;
  }
  body.hs-dashboard-page form[name="filtros"] .hs-preview-mode-wrap{
    display:none!important;
  }
  body.hs-dashboard-page #cabecalho_menu #hs-dashboard-settings-wrap{
    margin-left:10px!important;
    display:inline-flex!important;
    align-items:center!important;
    position:relative!important;
    vertical-align:middle!important;
    z-index:1000030!important;
  }
  body.hs-dashboard-page #cabecalho_menu #hs-dashboard-settings-wrap.open{
    z-index:1000031!important;
  }
  body.hs-dashboard-page .hs-settings-backdrop{
    position:fixed!important;
    inset:0!important;
    z-index:1000029!important;
    background:rgba(4,11,20,.44)!important;
    opacity:0!important;
    visibility:hidden!important;
    pointer-events:none!important;
    transition:opacity .12s ease, visibility .12s ease!important;
  }
  body.hs-dashboard-page .hs-settings-backdrop.open{
    opacity:1!important;
    visibility:visible!important;
    pointer-events:auto!important;
  }
  body.hs-dashboard-page #cabecalho_menu #hs-dashboard-settings-wrap .hs-settings-toggle{
    min-height:31px!important;
    height:31px!important;
    border-radius:7px!important;
    padding:4px 12px!important;
    font-size:12px!important;
    font-weight:800!important;
    line-height:1!important;
    cursor:pointer!important;
    display:inline-flex!important;
    align-items:center!important;
    gap:8px!important;
    position:relative!important;
    color:#dbe8f9!important;
    border:1px solid #446388!important;
    background:linear-gradient(180deg, #1f3654, #18314d)!important;
    box-shadow:inset 0 1px 0 rgba(255,255,255,.08), 0 8px 16px rgba(0,0,0,.2)!important;
  }
  body.hs-dashboard-page #cabecalho_menu #hs-dashboard-settings-wrap .hs-settings-toggle:hover{
    border-color:#5e7ea7!important;
    background:linear-gradient(180deg, #274264, #203a5a)!important;
  }
  body.hs-dashboard-page #cabecalho_menu #hs-dashboard-settings-wrap .hs-settings-toggle .hs-settings-gear{
    font-size:14px!important;
    line-height:1!important;
  }
  body.hs-dashboard-page #cabecalho_menu #hs-dashboard-settings-wrap .hs-settings-toggle .hs-settings-label{
    white-space:nowrap!important;
    letter-spacing:.02em!important;
  }
  body.hs-dashboard-page #cabecalho_menu #hs-dashboard-settings-wrap .hs-settings-notice-dot{
    width:9px!important;
    height:9px!important;
    border-radius:50%!important;
    background:#ff5f56!important;
    box-shadow:0 0 0 1px rgba(255,95,86,.45), 0 0 0 4px rgba(255,95,86,.18)!important;
    display:none!important;
  }
  body.hs-dashboard-page #cabecalho_menu #hs-dashboard-settings-wrap .hs-settings-toggle.has-notification .hs-settings-notice-dot{
    display:inline-block!important;
    animation:hs-settings-dot-pulse 1.6s ease-in-out infinite!important;
  }
  @keyframes hs-settings-dot-pulse{
    0%{ transform:scale(1); box-shadow:0 0 0 1px rgba(255,95,86,.45), 0 0 0 4px rgba(255,95,86,.18); }
    50%{ transform:scale(1.12); box-shadow:0 0 0 1px rgba(255,95,86,.6), 0 0 0 7px rgba(255,95,86,.2); }
    100%{ transform:scale(1); box-shadow:0 0 0 1px rgba(255,95,86,.45), 0 0 0 4px rgba(255,95,86,.18); }
  }
  body.hs-dashboard-page #cabecalho_menu #hs-dashboard-settings-wrap .hs-settings-menu{
    position:absolute!important;
    top:calc(100% + 10px)!important;
    right:0!important;
    z-index:1000031!important;
    width:min(360px, 94vw)!important;
    border-radius:12px!important;
    border:1px solid #3f5f84!important;
    background:#10243c!important;
    box-shadow:0 20px 38px rgba(0,0,0,.34)!important;
    padding:11px!important;
    display:flex!important;
    flex-direction:column!important;
    gap:9px!important;
    opacity:0!important;
    visibility:hidden!important;
    pointer-events:none!important;
    transform:translateY(-6px) scale(.985)!important;
    transform-origin:top right!important;
    transition:opacity .14s ease, transform .14s ease, visibility .14s ease!important;
  }
  body.hs-dashboard-page #cabecalho_menu #hs-dashboard-settings-wrap .hs-settings-menu::before{
    content:""!important;
    position:absolute!important;
    top:-8px!important;
    right:28px!important;
    width:14px!important;
    height:14px!important;
    transform:rotate(45deg)!important;
    background:#10243c!important;
    border-left:1px solid #3f5f84!important;
    border-top:1px solid #3f5f84!important;
  }
  body.hs-dashboard-page #cabecalho_menu #hs-dashboard-settings-wrap.open .hs-settings-menu{
    opacity:1!important;
    visibility:visible!important;
    pointer-events:auto!important;
    transform:translateY(0) scale(1)!important;
  }
  body.hs-dashboard-page #cabecalho_menu #hs-dashboard-settings-wrap .hs-settings-menu-title{
    margin:0 1px 3px!important;
    padding:0 2px!important;
    font-size:12px!important;
    font-weight:800!important;
    letter-spacing:.04em!important;
    text-transform:uppercase!important;
    opacity:.84!important;
  }
  body.hs-dashboard-page #cabecalho_menu #hs-dashboard-settings-wrap .hs-settings-divider{
    height:1px!important;
    background:linear-gradient(90deg, rgba(141,184,238,.03), rgba(141,184,238,.3), rgba(141,184,238,.03))!important;
  }
  body.hs-dashboard-page #cabecalho_menu #hs-dashboard-settings-wrap .hs-settings-group{
    display:flex!important;
    flex-direction:column!important;
    gap:7px!important;
  }
  body.hs-dashboard-page #cabecalho_menu #hs-dashboard-settings-wrap .hs-settings-group-title{
    margin:0 2px!important;
    font-size:10px!important;
    font-weight:800!important;
    letter-spacing:.05em!important;
    text-transform:uppercase!important;
    opacity:.63!important;
  }
  body.hs-dashboard-page #cabecalho_menu #hs-dashboard-settings-wrap .hs-preview-mode-btn{
    min-height:31px!important;
    height:31px!important;
    border-radius:8px!important;
    padding:0 11px!important;
    font-size:12px!important;
    font-weight:700!important;
    line-height:1!important;
    cursor:pointer!important;
    width:100%!important;
    text-align:left!important;
    color:#d8e6f7!important;
    background:linear-gradient(180deg, #1a2e47, #14263d)!important;
    border:1px solid #3e5878!important;
    transition:background-color .12s ease, border-color .12s ease, box-shadow .12s ease!important;
    box-shadow:inset 0 1px 0 rgba(255,255,255,.06)!important;
  }
  body.hs-dashboard-page #cabecalho_menu #hs-dashboard-settings-wrap .hs-preview-mode-btn:hover{
    border-color:#5f7ea4!important;
    background:linear-gradient(180deg, #213854, #1a2f49)!important;
    box-shadow:0 0 0 1px rgba(95,126,164,.24)!important;
  }
  body.hs-dashboard-page #cabecalho_menu #hs-dashboard-settings-wrap .hs-settings-menu .hs-preview-mode-btn{
    justify-content:flex-start!important;
  }
  body.hs-dashboard-page #cabecalho_menu #hs-dashboard-settings-wrap .hs-update-available-btn{
    color:#1f2b18!important;
    border-color:#e5bf4f!important;
    background:linear-gradient(180deg, #ffe9a8, #f6d36a)!important;
    box-shadow:0 0 0 1px rgba(166,118,0,.24), 0 2px 8px rgba(166,118,0,.2)!important;
    animation:hs-update-pulse 1.9s ease-in-out infinite!important;
  }
  @keyframes hs-update-pulse{
    0%{ box-shadow:0 0 0 1px rgba(166,118,0,.24), 0 2px 8px rgba(166,118,0,.2); }
    50%{ box-shadow:0 0 0 1px rgba(166,118,0,.42), 0 4px 12px rgba(166,118,0,.34); }
    100%{ box-shadow:0 0 0 1px rgba(166,118,0,.24), 0 2px 8px rgba(166,118,0,.2); }
  }
  body.hs-dashboard-page .hs-settings-menu-popover{
    position:fixed!important;
    z-index:1000031!important;
    border-radius:12px!important;
    border:1px solid #3f5f84!important;
    background:#10243c!important;
    box-shadow:0 20px 38px rgba(0,0,0,.34)!important;
    padding:11px!important;
    display:flex!important;
    flex-direction:column!important;
    gap:9px!important;
    opacity:0!important;
    visibility:hidden!important;
    pointer-events:none!important;
    transform:translateY(-6px) scale(.985)!important;
    transform-origin:top right!important;
    transition:opacity .14s ease, transform .14s ease, visibility .14s ease!important;
  }
  body.hs-dashboard-page .hs-settings-menu-popover.open{
    opacity:1!important;
    visibility:visible!important;
    pointer-events:auto!important;
    transform:translateY(0) scale(1)!important;
  }
  body.hs-dashboard-page .hs-settings-menu-popover::before{
    content:""!important;
    position:absolute!important;
    top:-8px!important;
    right:var(--hs-settings-arrow-right, 24px)!important;
    width:14px!important;
    height:14px!important;
    transform:rotate(45deg)!important;
    background:#10243c!important;
    border-left:1px solid #3f5f84!important;
    border-top:1px solid #3f5f84!important;
  }
  body.hs-dashboard-page .hs-settings-menu-popover[data-hs-arrow="up"]::before{
    top:auto!important;
    bottom:-8px!important;
    transform:rotate(225deg)!important;
  }
  body.hs-dashboard-page .hs-settings-menu-popover .hs-settings-menu-title{
    margin:0 1px 3px!important;
    padding:0 2px!important;
    font-size:12px!important;
    font-weight:800!important;
    letter-spacing:.04em!important;
    text-transform:uppercase!important;
    opacity:.84!important;
  }
  body.hs-dashboard-page .hs-settings-menu-popover .hs-settings-divider{
    height:1px!important;
    background:linear-gradient(90deg, rgba(141,184,238,.03), rgba(141,184,238,.3), rgba(141,184,238,.03))!important;
  }
  body.hs-dashboard-page .hs-settings-menu-popover .hs-settings-group{
    display:flex!important;
    flex-direction:column!important;
    gap:7px!important;
  }
  body.hs-dashboard-page .hs-settings-menu-popover .hs-settings-group-title{
    margin:0 2px!important;
    font-size:10px!important;
    font-weight:800!important;
    letter-spacing:.05em!important;
    text-transform:uppercase!important;
    opacity:.63!important;
  }
  body.hs-dashboard-page .hs-settings-menu-popover .hs-preview-mode-btn{
    min-height:31px!important;
    height:31px!important;
    border-radius:8px!important;
    padding:0 11px!important;
    font-size:12px!important;
    font-weight:700!important;
    line-height:1!important;
    cursor:pointer!important;
    width:100%!important;
    text-align:left!important;
    color:#d8e6f7!important;
    background:linear-gradient(180deg, #1a2e47, #14263d)!important;
    border:1px solid #3e5878!important;
    transition:background-color .12s ease, border-color .12s ease, box-shadow .12s ease!important;
    box-shadow:inset 0 1px 0 rgba(255,255,255,.06)!important;
  }
  body.hs-dashboard-page .hs-settings-menu-popover .hs-preview-mode-btn:hover{
    border-color:#5f7ea4!important;
    background:linear-gradient(180deg, #213854, #1a2f49)!important;
    box-shadow:0 0 0 1px rgba(95,126,164,.24)!important;
  }
  body.hs-dashboard-page .hs-settings-menu-popover .hs-update-available-btn{
    color:#1f2b18!important;
    border-color:#e5bf4f!important;
    background:linear-gradient(180deg, #ffe9a8, #f6d36a)!important;
    box-shadow:0 0 0 1px rgba(166,118,0,.24), 0 2px 8px rgba(166,118,0,.2)!important;
    animation:hs-update-pulse 1.9s ease-in-out infinite!important;
  }
  .hs-appearance-modal .hs-update-modal-card{
    width:min(940px, 96vw);
  }
  .hs-appearance-grid{
    display:grid;
    grid-template-columns:repeat(3, minmax(0, 1fr));
    gap:10px;
  }
  .hs-appearance-field{
    display:flex;
    flex-direction:column;
    gap:6px;
  }
  .hs-appearance-field > span{
    font-size:11px;
    font-weight:700;
    opacity:.88;
  }
  .hs-appearance-field :is(input,select){
    min-height:34px!important;
    height:34px!important;
    border-radius:var(--hs-radius-control)!important;
    padding:4px 10px!important;
    font-size:12px!important;
  }
  .hs-appearance-field input[type="color"]{
    padding:3px!important;
    cursor:pointer;
  }
  .hs-appearance-range-row{
    display:flex;
    align-items:center;
    gap:10px;
  }
  .hs-appearance-range-row input[type="range"]{
    flex:1 1 auto;
    min-height:32px!important;
    height:32px!important;
    padding:0!important;
  }
  .hs-appearance-range-row output{
    min-width:42px;
    text-align:right;
    font-size:12px;
    font-weight:700;
    opacity:.9;
  }
  .hs-appearance-hint{
    margin:0;
    font-size:11px;
    line-height:1.35;
    opacity:.8;
  }
  .hs-appearance-subgrid{
    display:grid;
    grid-template-columns:repeat(3, minmax(0, 1fr));
    gap:10px;
  }
  .hs-appearance-inline{
    display:flex;
    align-items:center;
    gap:8px;
  }
  .hs-appearance-inline > output{
    min-width:44px;
    text-align:right;
    font-size:12px;
    font-weight:700;
    opacity:.92;
  }
  .hs-appearance-section{
    display:flex;
    flex-direction:column;
    gap:10px;
    padding:12px;
    border:1px solid rgba(106,141,186,.24);
    border-radius:var(--hs-radius-card);
    background:linear-gradient(180deg, rgba(17,30,46,.34), rgba(17,30,46,.16));
  }
  .hs-appearance-section-head{
    display:flex;
    flex-direction:column;
    gap:3px;
  }
  .hs-appearance-section-head > strong{
    font-size:12px;
    font-weight:800;
    letter-spacing:.01em;
  }
  .hs-appearance-section-head > span{
    font-size:11px;
    line-height:1.4;
    opacity:.82;
  }
  html[data-hs-theme="light"] .hs-appearance-section{
    border-color:rgba(135,167,205,.3);
    background:linear-gradient(180deg, rgba(244,248,253,.92), rgba(255,255,255,.88));
  }
  .hs-settings-version-card{
    display:flex!important;
    align-items:center!important;
    justify-content:space-between!important;
    gap:8px!important;
    min-height:33px!important;
    height:33px!important;
    padding:6px 9px!important;
    border-radius:10px!important;
    border:1px solid #3e5878!important;
    background:linear-gradient(180deg, #1a2f49, #15273f)!important;
    color:#dbe8f9!important;
    cursor:pointer!important;
    user-select:none!important;
    text-align:left!important;
  }
  .hs-settings-version-card:hover{
    border-color:#6283ad!important;
    filter:brightness(1.04)!important;
  }
  .hs-settings-version-card .hs-main{
    font-size:12px!important;
    font-weight:900!important;
    letter-spacing:.02em!important;
  }
  .hs-settings-version-card .hs-meta{
    font-size:11px!important;
    font-weight:700!important;
    font-family:Consolas, "Courier New", monospace!important;
    opacity:.9!important;
  }
  @media (max-width:880px){
    .hs-appearance-grid{
      grid-template-columns:repeat(2, minmax(0, 1fr));
    }
    .hs-appearance-subgrid{
      grid-template-columns:1fr;
    }
  }
  @media (max-width:640px){
    .hs-appearance-grid{
      grid-template-columns:1fr;
    }
  }
  @media (max-width:1200px){
    body.hs-dashboard-page form[name="filtros"] td:nth-child(2),
    body.hs-dashboard-page form[name="filtros"] td:nth-child(4){
      width:auto!important;
      min-width:0!important;
      max-width:100%!important;
      display:block!important;
    }
    body.hs-dashboard-page form[name="filtros"] select,
    body.hs-dashboard-page form[name="filtros"] input[type="text"]{
      width:min(100%, 236px)!important;
      min-width:0!important;
      max-width:100%!important;
      flex:none!important;
    }
  }
  @media (max-width:1280px){
    body.hs-dashboard-page.hs-consulta-page #hs-consulta-shell{
      grid-template-columns:1fr!important;
    }
    body.hs-dashboard-page.hs-consulta-page #hs-consulta-side{
      position:relative!important;
      top:auto!important;
      order:2!important;
    }
  }
  body.hs-dashboard-page h1,
  body.hs-dashboard-page h2,
  body.hs-dashboard-page h3{
    margin:8px 0 8px!important;
    font-size:20px!important;
    line-height:1.25!important;
    letter-spacing:.01em!important;
  }
  body.hs-dashboard-page .hs-chip{
    transform:translateY(-1px)!important;
  }
  body.hs-dashboard-page .hs-dashboard-empty{
    width:min(1320px, 100%)!important;
    margin:10px auto 0!important;
    padding:8px 12px!important;
    border-radius:var(--hs-radius-card)!important;
    font-size:18px!important;
    font-weight:700!important;
    line-height:1.2!important;
    box-sizing:border-box!important;
  }
  body.hs-dashboard-page table.sortable{
    border:var(--hs-border-width) solid var(--hs-table-border)!important;
    border-radius:var(--hs-radius-table)!important;
    overflow:hidden!important;
    box-shadow:var(--hs-table-shadow)!important;
    background:var(--hs-table-surface)!important;
    margin-bottom:12px!important;
  }
  body.hs-dashboard-page table.sortable thead th:first-child{ border-top-left-radius:var(--hs-radius-table)!important; }
  body.hs-dashboard-page table.sortable thead th:last-child{ border-top-right-radius:var(--hs-radius-table)!important; }
  body.hs-dashboard-page table.sortable tbody tr:last-child td:first-child{ border-bottom-left-radius:var(--hs-radius-table)!important; }
  body.hs-dashboard-page table.sortable tbody tr:last-child td:last-child{ border-bottom-right-radius:var(--hs-radius-table)!important; }
  body.hs-dashboard-page table.sortable thead th{
    font-size:var(--hs-table-font-size)!important;
    font-weight:800!important;
    padding:var(--hs-table-head-py) var(--hs-table-head-px)!important;
    position:sticky!important;
    top:0!important;
    z-index:2!important;
    background:var(--hs-table-head-bg)!important;
    color:var(--hs-table-head-fg)!important;
    border-bottom:var(--hs-border-width) solid var(--hs-table-head-border)!important;
  }
  body.hs-dashboard-page table.sortable tbody td{
    font-size:var(--hs-table-font-size)!important;
    line-height:var(--hs-table-line-height)!important;
    padding:var(--hs-table-cell-py) var(--hs-table-cell-px)!important;
    vertical-align:top!important;
    white-space:normal!important;
    overflow-wrap:normal!important;
    word-break:normal!important;
    border-bottom:var(--hs-border-width) solid var(--hs-table-body-border)!important;
  }
  body.hs-dashboard-page table.sortable tbody tr{
    transition:background-color .16s ease!important;
  }
  body.hs-dashboard-page table.sortable tbody td.hs-col-titulo{
    overflow-wrap:anywhere!important;
    word-break:break-word!important;
  }
  body.hs-dashboard-page table.sortable tbody td font{
    color:inherit!important;
  }
  body.hs-dashboard-page table.sortable tbody td a{
    color:inherit!important;
    text-decoration:none!important;
  }
  body.hs-dashboard-page table.sortable tbody td a:hover{
    color:var(--link-hover)!important;
    text-decoration:underline!important;
  }
  body.hs-dashboard-page table.sortable thead th.hs-col-situacao,
  body.hs-dashboard-page table.sortable tbody td.hs-col-situacao{
    white-space:normal!important;
    overflow-wrap:normal!important;
    word-break:normal!important;
    hyphens:none!important;
  }
  html[data-hs-table-hover="off"] body.hs-dashboard-page table.sortable tbody tr:not([data-hs-sit-row-bg]):nth-child(odd):hover td{
    background:var(--hs-table-row1)!important;
  }
  html[data-hs-table-hover="off"] body.hs-dashboard-page table.sortable tbody tr:not([data-hs-sit-row-bg]):nth-child(even):hover td{
    background:var(--hs-table-row2)!important;
  }
  html:not([data-hs-table-hover="off"]) body.hs-dashboard-page table.sortable tbody tr:not([data-hs-sit-row-bg]):hover td{
    background:var(--hs-table-hover-bg)!important;
  }
  html[data-hs-theme="dark"] body.hs-dashboard-page #conteudo .filtros form[name="filtros"]{
    background:linear-gradient(180deg, #141e2c, #111a27)!important;
    border:1px solid #324459!important;
    border-bottom:0!important;
  }
  html[data-hs-theme="dark"] body.hs-dashboard-page #conteudo .filtros form[name="filtros"] table{
    width:auto!important;
    max-width:100%!important;
    border-collapse:separate!important;
    border-spacing:4px 8px!important;
    border:0!important;
    outline:0!important;
    box-shadow:none!important;
    background:transparent!important;
    background-image:none!important;
  }
  html[data-hs-theme="dark"] body.hs-dashboard-page #conteudo .filtros form[name="filtros"] :is(thead, tbody, tfoot, tr, th, td){
    border:0!important;
    outline:0!important;
    box-shadow:none!important;
    background:transparent!important;
    background-image:none!important;
  }
  html[data-hs-theme="dark"] body.hs-dashboard-page #conteudo .filtros form[name="filtros"] :is(th, td, div, span, label, p, b, strong, font){
    background:transparent!important;
    border:0!important;
    outline:0!important;
    box-shadow:none!important;
  }
  html[data-hs-theme="dark"] body.hs-dashboard-page #conteudo .filtros form[name="filtros"] :not(input):not(select):not(textarea):not(button)[bgcolor],
  html[data-hs-theme="dark"] body.hs-dashboard-page #conteudo .filtros form[name="filtros"] :not(input):not(select):not(textarea):not(button)[style*="003366"],
  html[data-hs-theme="dark"] body.hs-dashboard-page #conteudo .filtros form[name="filtros"] :not(input):not(select):not(textarea):not(button)[style*="#003366"],
  html[data-hs-theme="dark"] body.hs-dashboard-page #conteudo .filtros form[name="filtros"] :not(input):not(select):not(textarea):not(button)[style*="border"]{
    background:transparent!important;
    border:0!important;
    outline:0!important;
    box-shadow:none!important;
    background-image:none!important;
  }
  html[data-hs-theme="dark"] body.hs-dashboard-page #conteudo .filtros form[name="filtros"] hr{
    display:none!important;
    border:0!important;
  }
  html[data-hs-theme="dark"] body.hs-dashboard-page #conteudo .filtros form[name="filtros"] th{
    color:#d8e6fb!important;
    background:transparent!important;
  }
  html[data-hs-theme="dark"] body.hs-dashboard-page #conteudo .filtros form[name="filtros"] td{
    color:#cfdcf0!important;
    background:transparent!important;
  }
  html[data-hs-theme="light"] body.hs-dashboard-page form[name="filtros"]{
    background:linear-gradient(180deg, #ffffff, #f5f8fd)!important;
    border:1px solid #d5e0ef!important;
  }
  html[data-hs-theme="light"] body.hs-dashboard-page form[name="filtros"] th{
    color:#244162!important;
  }
  html[data-hs-theme="light"] body.hs-dashboard-page form[name="filtros"] td{
    color:#294565!important;
  }
  html[data-hs-theme="dark"] body.hs-dashboard-page .hs-dashboard-empty{
    background:linear-gradient(180deg, #0d1725, #0b1420)!important;
    border:1px solid #2b3b50!important;
    color:#e6efff!important;
    box-shadow:0 8px 18px rgba(0,0,0,.26)!important;
  }
  html[data-hs-theme="light"] body.hs-dashboard-page .hs-dashboard-empty{
    background:linear-gradient(180deg, #ffffff, #f5f8fd)!important;
    border:1px solid #d5e0ef!important;
    color:#16365b!important;
    box-shadow:0 8px 16px rgba(20,45,90,.08)!important;
  }
  body.hs-dashboard-page table.sortable .hs-situacao-sinal{
    display:inline-flex!important;
    align-items:center!important;
    margin-left:6px!important;
    padding:1px 6px!important;
    border-radius:999px!important;
    font-size:10px!important;
    font-weight:800!important;
    line-height:1.15!important;
    white-space:nowrap!important;
    vertical-align:middle!important;
  }
  html[data-hs-theme="dark"] body.hs-dashboard-page table.sortable .hs-situacao-sinal.aprov-int{
    background:#2c3e1f!important;
    color:#c8f2a8!important;
    border:1px solid #5f8f3b!important;
  }
  html[data-hs-theme="light"] body.hs-dashboard-page table.sortable .hs-situacao-sinal.aprov-int{
    background:#eaf7dd!important;
    color:#2f5e19!important;
    border:1px solid #9bc578!important;
  }
  html[data-hs-theme="dark"] body.hs-dashboard-page table.sortable .hs-situacao-sinal.ch-exp{
    background:#4b2323!important;
    color:#ffd2d2!important;
    border:1px solid #b36565!important;
  }
  html[data-hs-theme="light"] body.hs-dashboard-page table.sortable .hs-situacao-sinal.ch-exp{
    background:#fde8e8!important;
    color:#8a1f1f!important;
    border:1px solid #e3a2a2!important;
  }
  body.hs-dashboard-page .hs-ext-sla-summary{
    display:inline-flex!important;
    align-items:center!important;
    gap:6px!important;
    margin-left:10px!important;
    vertical-align:middle!important;
  }
  body.hs-dashboard-page .hs-ext-sla-summary .hs-ext-sla-chip{
    display:inline-flex!important;
    align-items:center!important;
    padding:2px 7px!important;
    border-radius:999px!important;
    font-size:11px!important;
    font-weight:800!important;
    line-height:1.15!important;
    white-space:nowrap!important;
  }
  html[data-hs-theme="dark"] body.hs-dashboard-page .hs-ext-sla-summary .hs-ext-sla-chip.aprov-int{
    background:#2c3e1f!important;
    color:#c8f2a8!important;
    border:1px solid #5f8f3b!important;
  }
  html[data-hs-theme="light"] body.hs-dashboard-page .hs-ext-sla-summary .hs-ext-sla-chip.aprov-int{
    background:#eaf7dd!important;
    color:#2f5e19!important;
    border:1px solid #9bc578!important;
  }
  html[data-hs-theme="dark"] body.hs-dashboard-page .hs-ext-sla-summary .hs-ext-sla-chip.ch-exp{
    background:#4b2323!important;
    color:#ffd2d2!important;
    border:1px solid #b36565!important;
  }
  html[data-hs-theme="light"] body.hs-dashboard-page .hs-ext-sla-summary .hs-ext-sla-chip.ch-exp{
    background:#fde8e8!important;
    color:#8a1f1f!important;
    border:1px solid #e3a2a2!important;
  }
  `;

  /* ------------------------ SECTION: CORE UTILITARIOS ------------------------ */
  /**
   * Objetivo: Normalizar strings para comparacoes robustas em DOM legado.
   *
   * Regras aplicadas:
   * - lowercase
   * - remocao de acentos
   * - preservacao de caracteres nao acentuados para buscas por token
   */
  const norm = (s) => {
    const raw = String(s || "").toLowerCase();
    try {
      return raw.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    } catch {
      return raw;
    }
  };
  /**
   * Objetivo: Informa se o diagnostico de abertura duplicada esta ativo.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: boolean.
   * Efeitos colaterais: leitura opcional de localStorage/querystring.
   */
  function isReqOpenDebugEnabled() {
    try {
      const qs = new URLSearchParams(location.search || "");
      const raw = norm(qs.get(REQ_OPEN_DEBUG_QUERY) || "").trim();
      if (raw === "1" || raw === "true" || raw === "on") return true;
    } catch {}

    try {
      return localStorage.getItem(REQ_OPEN_DEBUG_LS_KEY) === "1";
    } catch {
      return false;
    }
  }
  /**
   * Objetivo: Persiste preferencia do diagnostico de abertura duplicada.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros:
   * - enabled: entrada usada por esta rotina.
   * Retorno: void.
   * Efeitos colaterais: grava valor em localStorage quando disponivel.
   */
  function setReqOpenDebugEnabled(enabled) {
    try {
      localStorage.setItem(REQ_OPEN_DEBUG_LS_KEY, enabled ? "1" : "0");
    } catch {}
  }
  /**
   * Objetivo: Le preferencia de abertura em preview (popup) na grade.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: boolean.
   * Efeitos colaterais: leitura opcional de localStorage.
   */
  function isPreviewOnlyModeEnabled() {
    try {
      const raw = String(localStorage.getItem(PREVIEW_ONLY_MODE_LS_KEY) || "").trim().toLowerCase();
      if (raw === "1" || raw === "true" || raw === "on") return true;
      if (raw === "0" || raw === "false" || raw === "off") return false;
    } catch {}
    return PREVIEW_ONLY_MODE_DEFAULT;
  }
  /**
   * Objetivo: Persiste preferencia de abertura em preview (popup) na grade.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros:
   * - enabled: entrada usada por esta rotina.
   * Retorno: void.
   * Efeitos colaterais: grava valor em localStorage quando disponivel.
   */
  function setPreviewOnlyModeEnabled(enabled) {
    try {
      localStorage.setItem(PREVIEW_ONLY_MODE_LS_KEY, enabled ? "1" : "0");
    } catch {}
  }
  /**
   * Objetivo: Le preferencia do painel profissional lateral da consulta.
   *
   * Contexto: layout opcional da tela consulta_requisicao.php.
   * Parametros: nenhum.
   * Retorno: boolean.
   * Efeitos colaterais: leitura opcional de localStorage.
   */
  function isConsultaProLayoutEnabled() {
    try {
      const raw = String(localStorage.getItem(CONSULTA_PRO_LAYOUT_LS_KEY) || "").trim().toLowerCase();
      if (raw === "1" || raw === "true" || raw === "on") return true;
      if (raw === "0" || raw === "false" || raw === "off") return false;
    } catch {}
    return CONSULTA_PRO_LAYOUT_DEFAULT;
  }
  /**
   * Objetivo: Persiste preferencia do painel profissional lateral da consulta.
   *
   * Contexto: acionado pelo menu de configuracoes.
   * Parametros:
   * - enabled: entrada usada por esta rotina.
   * Retorno: void.
   * Efeitos colaterais: grava valor em localStorage quando disponivel.
   */
  function setConsultaProLayoutEnabled(enabled) {
    try {
      localStorage.setItem(CONSULTA_PRO_LAYOUT_LS_KEY, enabled ? "1" : "0");
    } catch {}
  }
  /**
   * Objetivo: Le preferencia de preview de anexos (modal local PNG/JPG).
   *
   * Contexto: usado nas miniaturas do novo acompanhamento.
   * Parametros: nenhum.
   * Retorno: boolean.
   * Efeitos colaterais: leitura opcional de localStorage.
   */
  function isAttachmentImagePreviewEnabled() {
    try {
      const raw = String(localStorage.getItem(ATTACH_IMAGE_PREVIEW_LS_KEY) || "").trim().toLowerCase();
      if (raw === "1" || raw === "true" || raw === "on") return true;
      if (raw === "0" || raw === "false" || raw === "off") return false;
    } catch {}
    return ATTACH_IMAGE_PREVIEW_DEFAULT;
  }
  /**
   * Objetivo: Persiste preferencia do preview de anexos (modal local PNG/JPG).
   *
   * Contexto: acionado pelo menu de configuracoes.
   * Parametros:
   * - enabled: entrada usada por esta rotina.
   * Retorno: void.
   * Efeitos colaterais: grava valor em localStorage quando disponivel.
   */
  function setAttachmentImagePreviewEnabled(enabled) {
    try {
      localStorage.setItem(ATTACH_IMAGE_PREVIEW_LS_KEY, enabled ? "1" : "0");
    } catch {}
  }
  /**
   * Objetivo: Le preferencia de preview de anexos TXT/SQL (modal textual).
   *
   * Contexto: usado ao clicar em anexos de texto na tela da requisicao.
   * Parametros: nenhum.
   * Retorno: boolean.
   * Efeitos colaterais: leitura opcional de localStorage.
   */
  function isAttachmentTextPreviewEnabled() {
    try {
      const raw = String(localStorage.getItem(ATTACH_TEXT_PREVIEW_LS_KEY) || "").trim().toLowerCase();
      if (raw === "1" || raw === "true" || raw === "on") return true;
      if (raw === "0" || raw === "false" || raw === "off") return false;
    } catch {}
    return ATTACH_TEXT_PREVIEW_DEFAULT;
  }
  /**
   * Objetivo: Persiste preferencia do preview de anexos TXT/SQL.
   *
   * Contexto: acionado pelo menu de configuracoes.
   * Parametros:
   * - enabled: entrada usada por esta rotina.
   * Retorno: void.
   * Efeitos colaterais: grava valor em localStorage quando disponivel.
   */
  function setAttachmentTextPreviewEnabled(enabled) {
    try {
      localStorage.setItem(ATTACH_TEXT_PREVIEW_LS_KEY, enabled ? "1" : "0");
    } catch {}
  }
  /**
   * Objetivo: Le preferencia para ocultar linha "Sugestao de melhoria" nos filtros.
   *
   * Contexto: acionado na tela de dashboard e no menu de configuracoes.
   * Parametros: nenhum.
   * Retorno: boolean.
   * Efeitos colaterais: leitura opcional de localStorage.
   */
  function isHideSuggestionFilterEnabled() {
    try {
      const raw = String(localStorage.getItem(HIDE_SUGGESTION_FILTER_LS_KEY) || "").trim().toLowerCase();
      if (raw === "1" || raw === "true" || raw === "on") return true;
      if (raw === "0" || raw === "false" || raw === "off") return false;
    } catch {}
    return HIDE_SUGGESTION_FILTER_DEFAULT;
  }
  /**
   * Objetivo: Persiste preferencia para ocultar linha "Sugestao de melhoria" nos filtros.
   *
   * Contexto: acionado pelo menu de configuracoes.
   * Parametros:
   * - enabled: entrada usada por esta rotina.
   * Retorno: void.
   * Efeitos colaterais: grava valor em localStorage quando disponivel.
   */
  function setHideSuggestionFilterEnabled(enabled) {
    try {
      localStorage.setItem(HIDE_SUGGESTION_FILTER_LS_KEY, enabled ? "1" : "0");
    } catch {}
  }
  /**
   * Objetivo: Le preferencia de exibicao da secao "Em servico" no dashboard.
   *
   * Contexto: controla checkbox adicional no bloco principal de filtros.
   * Parametros: nenhum.
   * Retorno: boolean.
   */
  function isDashboardEmServicoSectionEnabled() {
    try {
      const raw = String(localStorage.getItem(DASHBOARD_EM_SERVICO_SECTION_LS_KEY) || "").trim().toLowerCase();
      if (raw === "1" || raw === "true" || raw === "on") return true;
      if (raw === "0" || raw === "false" || raw === "off") return false;
    } catch {}
    return DASHBOARD_EM_SERVICO_SECTION_DEFAULT;
  }
  /**
   * Objetivo: Persiste preferencia de exibicao da secao "Em servico".
   *
   * Contexto: acionado pelo novo checkbox no formulario de filtros.
   * Parametros:
   * - enabled: estado desejado da secao.
   * Retorno: void.
   */
  function setDashboardEmServicoSectionEnabled(enabled) {
    try {
      localStorage.setItem(DASHBOARD_EM_SERVICO_SECTION_LS_KEY, enabled ? "1" : "0");
    } catch {}
  }
  /**
   * Objetivo: Normaliza o cache persistido dos filtros da consulta de usuarios.
   *
   * Contexto: garante leitura/escrita robusta da toolbar customizada em consulta_usuario.php.
   * Parametros:
   * - value: payload bruto vindo do storage.
   * Retorno: objeto padronizado.
   */
  function normalizeUsersPageFilterCache(value) {
    const raw = value && typeof value === "object" ? value : {};
    const company = norm(raw.company || "").trim();
    const query = String(raw.query || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 220);
    const savedAt = Math.max(0, Math.round(Number(raw.savedAt) || 0));
    return { company, query, savedAt };
  }
  /**
   * Objetivo: Le cache persistido dos filtros da consulta de usuarios.
   *
   * Contexto: usado ao reabrir consulta_usuario.php para restaurar o ultimo contexto do usuario.
   * Parametros: nenhum.
   * Retorno: objeto padronizado com empresa e texto.
   */
  function readUsersPageFilterCache() {
    try {
      return normalizeUsersPageFilterCache(JSON.parse(localStorage.getItem(USERS_PAGE_FILTERS_LS_KEY) || "null"));
    } catch {
      return normalizeUsersPageFilterCache(null);
    }
  }
  /**
   * Objetivo: Persiste filtros da consulta de usuarios no navegador.
   *
   * Contexto: chamado durante digitacao/troca de empresa e no fechamento da pagina.
   * Parametros:
   * - value: estado desejado da toolbar.
   * Retorno: objeto normalizado salvo/local.
   */
  function writeUsersPageFilterCache(value) {
    const normalized = normalizeUsersPageFilterCache({
      ...(value && typeof value === "object" ? value : {}),
      savedAt: Date.now(),
    });
    try {
      localStorage.setItem(USERS_PAGE_FILTERS_LS_KEY, JSON.stringify(normalized));
    } catch {}
    return normalized;
  }
  /**
   * Objetivo: Normaliza altura do textarea de acompanhamento em faixa segura.
   *
   * Contexto: usada para persistir/reaplicar resize manual entre chamados.
   * Parametros:
   * - value: altura candidata em pixels.
   * - textarea: textarea opcional para respeitar min-height efetivo.
   * Retorno: number.
   */
  function normalizeAcompanhamentoTextareaHeight(value, textarea = null) {
    const raw = Number(value);
    let minHeight = 76;
    if (textarea instanceof HTMLTextAreaElement) {
      const cssMin = parseFloat(String(window.getComputedStyle(textarea).minHeight || ""));
      if (Number.isFinite(cssMin) && cssMin > 0) minHeight = Math.max(minHeight, Math.round(cssMin));
    }
    const viewportMax = Math.max(minHeight, Math.floor(window.innerHeight * 0.88));
    if (!Number.isFinite(raw)) return minHeight;
    return Math.min(viewportMax, Math.max(minHeight, Math.round(raw)));
  }
  /**
   * Objetivo: Le tamanho salvo do textarea de acompanhamento.
   *
   * Contexto: aplicado ao montar o formulario de acompanhamento em qualquer chamado.
   * Parametros: nenhum.
   * Retorno: objeto com altura, quando disponivel.
   */
  function readAcompanhamentoTextareaSize() {
    try {
      const raw = String(localStorage.getItem(ACOMP_TEXTAREA_SIZE_LS_KEY) || "").trim();
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const height = normalizeAcompanhamentoTextareaHeight(parsed?.height);
      if (!Number.isFinite(height) || height <= 0) return null;
      return { height };
    } catch {
      return null;
    }
  }
  /**
   * Objetivo: Persiste tamanho do textarea de acompanhamento para reuso global.
   *
   * Contexto: disparado ao redimensionar manualmente o campo Acompanhamento.
   * Parametros:
   * - payload: objeto com altura em pixels.
   * Retorno: void.
   */
  function setAcompanhamentoTextareaSize(payload) {
    const height = normalizeAcompanhamentoTextareaHeight(payload?.height);
    if (!Number.isFinite(height) || height <= 0) return;
    try {
      localStorage.setItem(
        ACOMP_TEXTAREA_SIZE_LS_KEY,
        JSON.stringify({
          height,
          updatedAt: Date.now(),
        })
      );
    } catch {}
  }
  /**
   * Objetivo: Limita numero em faixa segura.
   *
   * Contexto: utilitario de normalizacao para controles de aparencia.
   * Parametros:
   * - value: entrada usada por esta rotina.
   * - min: entrada usada por esta rotina.
   * - max: entrada usada por esta rotina.
   * Retorno: number.
   */
  function clampNumber(value, min, max) {
    const n = Number(value);
    if (!Number.isFinite(n)) return min;
    return Math.min(max, Math.max(min, n));
  }
  /**
   * Objetivo: Normaliza cor hexadecimal para formato #RRGGBB.
   *
   * Contexto: usado em configuracoes de aparencia.
   * Parametros:
   * - value: entrada usada por esta rotina.
   * Retorno: string.
   */
  function normalizeHexColor(value) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    const short = raw.match(/^#([0-9a-f]{3})$/i);
    if (short) {
      const [r, g, b] = short[1].split("");
      return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
    }
    const full = raw.match(/^#([0-9a-f]{6})$/i);
    if (!full) return "";
    return `#${full[1]}`.toUpperCase();
  }
  /**
   * Objetivo: Converte hexadecimal #RRGGBB para RGB numerico.
   *
   * Contexto: base para mistura e overlay de cores.
   * Parametros:
   * - hex: entrada usada por esta rotina.
   * Retorno: Array<number>.
   */
  function hexToRgb(hex) {
    const normalized = normalizeHexColor(hex);
    if (!normalized) return [0, 0, 0];
    const clean = normalized.slice(1);
    return [
      parseInt(clean.slice(0, 2), 16),
      parseInt(clean.slice(2, 4), 16),
      parseInt(clean.slice(4, 6), 16),
    ];
  }
  /**
   * Objetivo: Converte RGB numerico para hexadecimal #RRGGBB.
   *
   * Contexto: usado ao derivar cores do tema personalizado.
   * Parametros:
   * - r: entrada usada por esta rotina.
   * - g: entrada usada por esta rotina.
   * - b: entrada usada por esta rotina.
   * Retorno: string.
   */
  function rgbToHex(r, g, b) {
    const toHex = (n) => clampNumber(n, 0, 255).toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  }
  /**
   * Objetivo: Mistura duas cores hexadecimais por proporcao.
   *
   * Contexto: gera variacoes de painel/borda/linhas de forma consistente.
   * Parametros:
   * - a: entrada usada por esta rotina.
   * - b: entrada usada por esta rotina.
   * - ratio: entrada usada por esta rotina.
   * Retorno: string.
   */
  function mixHexColors(a, b, ratio) {
    const [ar, ag, ab] = hexToRgb(a);
    const [br, bg, bb] = hexToRgb(b);
    const k = clampNumber(ratio, 0, 1);
    return rgbToHex(
      Math.round(ar + (br - ar) * k),
      Math.round(ag + (bg - ag) * k),
      Math.round(ab + (bb - ab) * k)
    );
  }
  /**
   * Objetivo: Sanitiza URL de papel de fundo permitindo apenas http/https.
   *
   * Contexto: evita payloads invalidados na configuracao visual.
   * Parametros:
   * - value: entrada usada por esta rotina.
   * Retorno: string.
   */
  function sanitizeWallpaperUrl(value) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    try {
      const u = new URL(raw, location.href);
      if (!/^https?:$/i.test(u.protocol)) return "";
      return u.toString();
    } catch {
      return "";
    }
  }
  /**
   * Objetivo: Normaliza preset de estilo visual da grade.
   *
   * Contexto: usado para validar preferencia salva no navegador.
   * Parametros:
   * - value: entrada usada por esta rotina.
   * Retorno: string.
   */
  function normalizeAppearanceGridTone(value = "") {
    const raw = String(value || "").trim().toLowerCase();
    return APPEARANCE_GRID_TONE_OPTIONS.includes(raw) ? raw : APPEARANCE_GRID_TONE_DEFAULT;
  }
  /**
   * Objetivo: Normaliza preset de densidade da grade.
   *
   * Contexto: controla espacamento e altura percebida das linhas.
   * Parametros:
   * - value: entrada usada por esta rotina.
   * Retorno: string.
   */
  function normalizeAppearanceGridDensity(value = "") {
    const raw = String(value || "").trim().toLowerCase();
    return APPEARANCE_GRID_DENSITY_OPTIONS.includes(raw) ? raw : APPEARANCE_GRID_DENSITY_DEFAULT;
  }
  /**
   * Objetivo: Normaliza preset de hover da grade.
   *
   * Contexto: permite desligar ou reforcar o destaque das linhas ao passar o mouse.
   * Parametros:
   * - value: entrada usada por esta rotina.
   * Retorno: string.
   */
  function normalizeAppearanceGridHover(value = "") {
    const raw = String(value || "").trim().toLowerCase();
    return APPEARANCE_GRID_HOVER_OPTIONS.includes(raw) ? raw : APPEARANCE_GRID_HOVER_DEFAULT;
  }
  /**
   * Objetivo: Gera tokens visuais da grade principal a partir do tema e preferencias.
   *
   * Contexto: centraliza os ajustes finos do dashboard/consulta para manter o visual discreto e consistente.
   * Parametros:
   * - raw: entrada usada por esta rotina.
   * Retorno: object.
   */
  function buildDashboardGridAppearanceTokens(raw = null) {
    const source = raw && typeof raw === "object" ? raw : {};
    const mode = resolveAppearanceThemeMode(source.mode || "");
    const isLight = mode === "light";
    const defaults = isLight
      ? { bg: "#FFFFFF", fg: "#0F172A", accent: "#1F5FB4" }
      : { bg: "#0E141D", fg: "#DCE6F2", accent: "#3A6FAE" };
    const bg = normalizeHexColor(source.bg || defaults.bg) || defaults.bg;
    const fg = normalizeHexColor(source.fg || defaults.fg) || defaults.fg;
    const accent = normalizeHexColor(source.accent || defaults.accent) || defaults.accent;
    const panel = normalizeHexColor(source.panel || mixHexColors(bg, fg, isLight ? 0.04 : 0.08))
      || mixHexColors(bg, fg, isLight ? 0.04 : 0.08);
    const panel2 = normalizeHexColor(source.panel2 || mixHexColors(bg, fg, isLight ? 0.08 : 0.13))
      || mixHexColors(bg, fg, isLight ? 0.08 : 0.13);
    const tone = normalizeAppearanceGridTone(source.dashboardGridTone);
    const density = normalizeAppearanceGridDensity(source.dashboardGridDensity);
    const hover = normalizeAppearanceGridHover(source.dashboardGridHover);

    const densityPresets = {
      compact: {
        headPy: 8,
        headPx: 10,
        cellPy: 7,
        cellPx: 10,
        fontSize: 12,
        lineHeight: 1.46,
      },
      comfortable: {
        headPy: 8.5,
        headPx: 11,
        cellPy: 9,
        cellPx: 11,
        fontSize: 13,
        lineHeight: 1.56,
      },
      airy: {
        headPy: 10,
        headPx: 12,
        cellPy: 11,
        cellPx: 12,
        fontSize: 13,
        lineHeight: 1.68,
      },
    };
    const tonePresets = {
      soft: {
        row1Mix: isLight ? 0.6 : 0.62,
        row2Mix: isLight ? 0.78 : 0.46,
        headAccentMix: isLight ? 0.08 : 0.13,
        headToBg: isLight ? 0.38 : 0.2,
        borderToFg: isLight ? 0.06 : 0.04,
        bodyBorderToBg: isLight ? 0.18 : 0.12,
        shadow: isLight ? "0 8px 18px rgba(20,45,90,.06)" : "0 8px 18px rgba(0,0,0,.14)",
      },
      balanced: {
        row1Mix: isLight ? 0.52 : 0.56,
        row2Mix: isLight ? 0.68 : 0.38,
        headAccentMix: isLight ? 0.12 : 0.18,
        headToBg: isLight ? 0.28 : 0.14,
        borderToFg: isLight ? 0.08 : 0.06,
        bodyBorderToBg: isLight ? 0.22 : 0.16,
        shadow: isLight ? "0 10px 20px rgba(20,45,90,.08)" : "0 10px 22px rgba(0,0,0,.18)",
      },
      contrast: {
        row1Mix: isLight ? 0.44 : 0.5,
        row2Mix: isLight ? 0.58 : 0.3,
        headAccentMix: isLight ? 0.16 : 0.22,
        headToBg: isLight ? 0.18 : 0.1,
        borderToFg: isLight ? 0.1 : 0.08,
        bodyBorderToBg: isLight ? 0.26 : 0.2,
        shadow: isLight ? "0 12px 24px rgba(20,45,90,.1)" : "0 12px 24px rgba(0,0,0,.22)",
      },
    };
    const densityCfg = densityPresets[density] || densityPresets[APPEARANCE_GRID_DENSITY_DEFAULT];
    const toneCfg = tonePresets[tone] || tonePresets[APPEARANCE_GRID_TONE_DEFAULT];
    const row1 = mixHexColors(panel, bg, toneCfg.row1Mix);
    const row2 = mixHexColors(panel2, bg, toneCfg.row2Mix);
    const tableSurface = mixHexColors(panel, panel2, 0.24);
    const tableBorder = mixHexColors(mixHexColors(panel2, fg, toneCfg.borderToFg), bg, isLight ? 0.14 : 0.08);
    const headBase = mixHexColors(panel2, accent, toneCfg.headAccentMix);
    const headBg = mixHexColors(headBase, bg, toneCfg.headToBg);
    const headFg = mixHexColors(fg, accent, isLight ? 0.08 : 0.04);
    const headBorder = mixHexColors(headBg, fg, isLight ? 0.18 : 0.28);
    const bodyBorder = mixHexColors(tableBorder, bg, toneCfg.bodyBorderToBg);
    const hoverRatio = hover === "focus" ? (isLight ? 0.16 : 0.22) : isLight ? 0.09 : 0.15;
    const hoverBg = mixHexColors(row2, accent, hoverRatio);

    return {
      tone,
      density,
      hover,
      row1,
      row2,
      tableSurface,
      tableBorder,
      headBg,
      headFg,
      headBorder,
      bodyBorder,
      hoverBg,
      shadow: toneCfg.shadow,
      headPy: `${densityCfg.headPy}px`,
      headPx: `${densityCfg.headPx}px`,
      cellPy: `${densityCfg.cellPy}px`,
      cellPx: `${densityCfg.cellPx}px`,
      fontSize: `${densityCfg.fontSize}px`,
      lineHeight: String(densityCfg.lineHeight),
    };
  }
  /**
   * Objetivo: Normaliza objeto de configuracoes de aparencia.
   *
   * Contexto: aplicado no carregamento/salvamento da preferencia local.
   * Parametros:
   * - raw: entrada usada por esta rotina.
   * Retorno: object.
   */
  function normalizeAppearanceSettings(raw = null) {
    const source = raw && typeof raw === "object" ? raw : {};
    const fontRaw = String(source.fontFamily || APPEARANCE_DEFAULTS.fontFamily)
      .trim()
      .toLowerCase();
    const fontFamily = APPEARANCE_FONT_MAP[fontRaw] ? fontRaw : APPEARANCE_DEFAULTS.fontFamily;
    const borderShapeRaw = String(source.borderShape || APPEARANCE_DEFAULTS.borderShape)
      .trim()
      .toLowerCase();
    const borderShape = borderShapeRaw === "square" ? "square" : "rounded";
    const wallpaperUrl = sanitizeWallpaperUrl(source.wallpaperUrl || "");
    const opacityRaw = Number(source.wallpaperOpacity);
    const wallpaperOpacity = clampNumber(
      Number.isFinite(opacityRaw) ? opacityRaw : APPEARANCE_WALLPAPER_OPACITY_DEFAULT,
      APPEARANCE_WALLPAPER_OPACITY_MIN,
      APPEARANCE_WALLPAPER_OPACITY_MAX
    );
    const borderRadiusRaw = Number(source.borderRadius);
    const borderRadius = Math.round(
      clampNumber(
        Number.isFinite(borderRadiusRaw) ? borderRadiusRaw : APPEARANCE_BORDER_RADIUS_DEFAULT,
        APPEARANCE_BORDER_RADIUS_MIN,
        APPEARANCE_BORDER_RADIUS_MAX
      )
    );
    const borderWidthRaw = Number(source.borderWidth);
    const borderWidth = Math.round(
      clampNumber(
        Number.isFinite(borderWidthRaw) ? borderWidthRaw : APPEARANCE_BORDER_WIDTH_DEFAULT,
        APPEARANCE_BORDER_WIDTH_MIN,
        APPEARANCE_BORDER_WIDTH_MAX
      )
    );
    const dashboardGridWidthRaw = Number(source.dashboardGridWidth);
    const dashboardGridWidth =
      Number.isFinite(dashboardGridWidthRaw) && dashboardGridWidthRaw >= APPEARANCE_DASHBOARD_GRID_WIDTH_MIN
        ? Math.round(
            clampNumber(
              dashboardGridWidthRaw,
              APPEARANCE_DASHBOARD_GRID_WIDTH_MIN,
              APPEARANCE_DASHBOARD_GRID_WIDTH_MAX
            )
          )
        : 0;
    return {
      fontFamily,
      wallpaperUrl,
      wallpaperOpacity,
      bgColor: normalizeHexColor(source.bgColor || ""),
      textColor: normalizeHexColor(source.textColor || ""),
      accentColor: normalizeHexColor(source.accentColor || ""),
      borderShape,
      borderRadius,
      borderWidth,
      dashboardGridWidth,
      dashboardGridTone: normalizeAppearanceGridTone(source.dashboardGridTone),
      dashboardGridDensity: normalizeAppearanceGridDensity(source.dashboardGridDensity),
      dashboardGridHover: normalizeAppearanceGridHover(source.dashboardGridHover),
    };
  }
  /**
   * Objetivo: Resolve modo de tema valido (light/dark) para operacoes de aparencia.
   *
   * Contexto: garante leitura/escrita segregada por tema ativo.
   * Parametros:
   * - mode: entrada usada por esta rotina.
   * Retorno: string.
   */
  function resolveAppearanceThemeMode(mode = "") {
    const raw = String(mode || "").trim().toLowerCase();
    if (raw === "light" || raw === "dark") return raw;
    const attr = String(document.documentElement?.getAttribute("data-hs-theme") || "").trim().toLowerCase();
    if (attr === "light" || attr === "dark") return attr;
    return getTheme() === "light" ? "light" : "dark";
  }
  /**
   * Objetivo: Retorna chave de localStorage da aparencia para o tema informado.
   *
   * Contexto: centraliza o mapeamento light/dark para persistencia separada.
   * Parametros:
   * - mode: entrada usada por esta rotina.
   * Retorno: string.
   */
  function getAppearanceSettingsStorageKey(mode = "") {
    return resolveAppearanceThemeMode(mode) === "light"
      ? APPEARANCE_SETTINGS_LIGHT_LS_KEY
      : APPEARANCE_SETTINGS_DARK_LS_KEY;
  }
  /**
   * Objetivo: Migra chave legada unica de aparencia para o tema ativo.
   *
   * Contexto: evita perder configuracao antiga ao introduzir persistencia por tema.
   * Parametros:
   * - mode: entrada usada por esta rotina.
   * Retorno: object|null.
   * Efeitos colaterais: leitura/escrita opcional em localStorage.
   */
  function migrateLegacyAppearanceSettings(mode = "") {
    try {
      const legacyRaw = String(localStorage.getItem(APPEARANCE_SETTINGS_LS_KEY) || "").trim();
      if (!legacyRaw) return null;
      const hasLight = String(localStorage.getItem(APPEARANCE_SETTINGS_LIGHT_LS_KEY) || "").trim();
      const hasDark = String(localStorage.getItem(APPEARANCE_SETTINGS_DARK_LS_KEY) || "").trim();
      if (hasLight || hasDark) return null;

      const parsed = JSON.parse(legacyRaw);
      const normalized = normalizeAppearanceSettings(parsed);
      const key = getAppearanceSettingsStorageKey(mode);
      localStorage.setItem(key, JSON.stringify(normalized));
      return normalized;
    } catch {
      return null;
    }
  }
  /**
   * Objetivo: Le preferencias de aparencia no localStorage.
   *
   * Contexto: aplicado durante bootstrap e abertura do modal visual.
   * Parametros:
   * - mode: entrada usada por esta rotina.
   * Retorno: object.
   * Efeitos colaterais: leitura opcional de localStorage.
   */
  function readAppearanceSettings(mode = "") {
    const scopedMode = resolveAppearanceThemeMode(mode);
    try {
      const key = getAppearanceSettingsStorageKey(scopedMode);
      const raw = String(localStorage.getItem(key) || "").trim();
      if (!raw) {
        const migrated = migrateLegacyAppearanceSettings(scopedMode);
        if (migrated) return migrated;
        return { ...APPEARANCE_DEFAULTS };
      }
      const parsed = JSON.parse(raw);
      return normalizeAppearanceSettings(parsed);
    } catch {
      return { ...APPEARANCE_DEFAULTS };
    }
  }
  /**
   * Objetivo: Persiste preferencias de aparencia no localStorage.
   *
   * Contexto: acionado pelos controles do modal de aparencia.
   * Parametros:
   * - value: entrada usada por esta rotina.
   * - mode: entrada usada por esta rotina.
   * Retorno: object.
   * Efeitos colaterais: escrita opcional em localStorage.
   */
  function writeAppearanceSettings(value, mode = "") {
    const normalized = normalizeAppearanceSettings(value);
    const scopedMode = resolveAppearanceThemeMode(mode);
    try {
      localStorage.setItem(getAppearanceSettingsStorageKey(scopedMode), JSON.stringify(normalized));
    } catch {}
    return normalized;
  }
  /**
   * Objetivo: Recupera API opcional do modulo embutido de configuracoes.
   *
   * Contexto: usado para abrir configuracoes por guias/subguias quando disponivel.
   * Parametros: nenhum.
   * Retorno: object|null.
   */
  function getUser2SettingsApi() {
    try {
      const api = window?.[USER2_SETTINGS_API_GLOBAL];
      if (api && typeof api.openSettingsHub === "function") return api;
    } catch {}
    return null;
  }
  /**
   * Objetivo: Normaliza chave de situacao para persistencia robusta.
   *
   * Contexto: remove variacoes de caixa/acento/espacos nas preferencias de cor.
   * Parametros:
   * - value: texto bruto da situacao.
   * Retorno: string.
   */
  function normalizeSituacaoColorKey(value) {
    return norm(String(value || "").replace(/\s+/g, " ").trim());
  }
  /**
   * Objetivo: Sanitiza rotulo de situacao mantendo leitura amigavel.
   *
   * Contexto: exibicao no modal de configuracoes por guias.
   * Parametros:
   * - value: texto bruto.
   * Retorno: string.
   */
  function sanitizeSituacaoColorLabel(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }
  /**
   * Objetivo: Retorna chave de storage de cores por situacao no tema atual.
   *
   * Contexto: persistencia separada entre modo claro e escuro.
   * Parametros:
   * - mode: tema opcional.
   * Retorno: string.
   */
  function getSituacaoColorStorageKey(mode = "") {
    return resolveAppearanceThemeMode(mode) === "light"
      ? SITUACAO_COLORS_LIGHT_LS_KEY
      : SITUACAO_COLORS_DARK_LS_KEY;
  }
  /**
   * Objetivo: Normaliza entrada de cor por situacao para formato seguro.
   *
   * Contexto: valida payloads vindos do storage e do modal.
   * Parametros:
   * - entry: registro bruto.
   * - keyHint: fallback de chave.
   * Retorno: object|null.
   */
  function normalizeSituacaoColorEntry(entry, keyHint = "") {
    const source = entry && typeof entry === "object" ? entry : {};
    const label = sanitizeSituacaoColorLabel(source.label || source.name || keyHint);
    const key = normalizeSituacaoColorKey(source.key || label || keyHint);
    if (!key) return null;
    return {
      key,
      label: label || key,
      textColor: normalizeHexColor(source.textColor || source.color || ""),
      badgeBgColor: normalizeHexColor(source.badgeBgColor || source.badgeColor || source.backgroundColor || ""),
      badgeTextColor: normalizeHexColor(source.badgeTextColor || source.badgeText || ""),
    };
  }
  /**
   * Objetivo: Normaliza mapa de cores por situacao para estrutura persistivel.
   *
   * Contexto: aceita objeto ou lista.
   * Parametros:
   * - rawMap: payload bruto.
   * Retorno: object.
   */
  function normalizeSituacaoColorMap(rawMap = null) {
    const output = {};
    if (!rawMap || typeof rawMap !== "object") return output;
    const list = Array.isArray(rawMap)
      ? rawMap
      : Object.entries(rawMap).map(([key, value]) => ({ ...(value || {}), key }));
    list.forEach((item) => {
      const normalized = normalizeSituacaoColorEntry(item, item?.key || "");
      if (!normalized) return;
      if (!normalized.textColor && !normalized.badgeBgColor && !normalized.badgeTextColor) return;
      output[normalized.key] = normalized;
    });
    return output;
  }
  /**
   * Objetivo: Le preferencias de cor por situacao no tema atual.
   *
   * Contexto: usado no dashboard e no modal de configuracoes.
   * Parametros:
   * - mode: tema opcional.
   * Retorno: object.
   */
  function readSituacaoColorSettings(mode = "") {
    const scopedMode = resolveAppearanceThemeMode(mode);
    try {
      const raw = String(localStorage.getItem(getSituacaoColorStorageKey(scopedMode)) || "").trim();
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return normalizeSituacaoColorMap(parsed);
    } catch {
      return {};
    }
  }
  /**
   * Objetivo: Persiste preferencias de cor por situacao no tema atual.
   *
   * Contexto: acionado ao salvar ajustes do modal.
   * Parametros:
   * - value: mapa/lista de cores.
   * - mode: tema opcional.
   * Retorno: object.
   */
  function writeSituacaoColorSettings(value, mode = "") {
    const scopedMode = resolveAppearanceThemeMode(mode);
    const normalized = normalizeSituacaoColorMap(value);
    try {
      localStorage.setItem(getSituacaoColorStorageKey(scopedMode), JSON.stringify(normalized));
    } catch {}
    return normalized;
  }
  /**
   * Objetivo: Coleta situacoes visiveis no DOM para montar lista configuravel.
   *
   * Contexto: permite usuario ajustar qualquer situacao encontrada na grade.
   * Parametros: nenhum.
   * Retorno: Array<object>.
   */
  function collectVisibleSituacaoLabels() {
    const map = new Map();
    const upsert = (labelRaw) => {
      const label = sanitizeSituacaoColorLabel(labelRaw);
      const key = normalizeSituacaoColorKey(label);
      if (!key) return;
      if (!map.has(key)) map.set(key, label || key);
    };

    document.querySelectorAll("table.sortable").forEach((table) => {
      const headerRow = table.tHead?.rows?.[0] || Array.from(table.rows || []).find((tr) => tr.querySelector("th"));
      if (!(headerRow instanceof HTMLTableRowElement)) return;
      const headers = Array.from(headerRow.cells || []).map((c) => norm(c.textContent || ""));
      const idxSituacao = headers.findIndex((h) => SITUACAO_RX.test(h));
      if (idxSituacao < 0) return;
      const bodyRows = Array.from(table.tBodies || []).flatMap((tbody) => Array.from(tbody.rows || []));
      (bodyRows.length ? bodyRows : Array.from(table.rows || [])).forEach((tr) => {
        if (!(tr instanceof HTMLTableRowElement)) return;
        if (tr.querySelector("th")) return;
        const td = tr.cells[idxSituacao];
        if (!(td instanceof HTMLTableCellElement)) return;
        upsert(getSituacaoCellText(td));
      });
    });

    document.querySelectorAll(".hs-situacao-sinal, .hs-ext-sla-chip").forEach((el) => {
      const label = String(el.dataset.hsSituacaoLabel || el.textContent || "");
      upsert(label);
    });

    return Array.from(map.entries())
      .map(([key, label]) => ({ key, label }))
      .sort((a, b) => String(a.label || "").localeCompare(String(b.label || ""), "pt-BR"));
  }
  /**
   * Objetivo: Monta lista consolidada de situacoes para o modal de configuracoes.
   *
   * Contexto: combina itens visiveis e itens ja salvos no navegador.
   * Parametros:
   * - mode: tema opcional.
   * Retorno: Array<object>.
   */
  function getSituacaoColorEntriesForSettings(mode = "") {
    const scopedMode = resolveAppearanceThemeMode(mode);
    const saved = readSituacaoColorSettings(scopedMode);
    const visible = collectVisibleSituacaoLabels();
    const map = new Map();

    visible.forEach((item) => {
      const key = normalizeSituacaoColorKey(item?.key || item?.label || "");
      if (!key) return;
      const fromSaved = saved[key] || {};
      map.set(key, {
        key,
        label: sanitizeSituacaoColorLabel(item?.label || fromSaved.label || key),
        textColor: normalizeHexColor(fromSaved.textColor || ""),
        badgeBgColor: normalizeHexColor(fromSaved.badgeBgColor || ""),
        badgeTextColor: normalizeHexColor(fromSaved.badgeTextColor || ""),
      });
    });

    Object.entries(saved).forEach(([key, value]) => {
      const normalized = normalizeSituacaoColorEntry({ ...(value || {}), key }, key);
      if (!normalized) return;
      if (map.has(normalized.key)) return;
      map.set(normalized.key, normalized);
    });

    return Array.from(map.values()).sort((a, b) =>
      String(a.label || "").localeCompare(String(b.label || ""), "pt-BR")
    );
  }
  /**
   * Objetivo: Atualiza um campo de cor de uma situacao especifica.
   *
   * Contexto: usado pelo modal de configuracoes por guias/subguias.
   * Parametros:
   * - keyRaw: chave/label da situacao.
   * - fieldRaw: campo alvo (textColor, badgeBgColor, badgeTextColor).
   * - valueRaw: cor hexadecimal ou vazio para limpar.
   * - mode: tema opcional.
   * Retorno: object|null.
   */
  function setSituacaoColorFieldForKey(keyRaw, fieldRaw, valueRaw, mode = "") {
    const scopedMode = resolveAppearanceThemeMode(mode);
    const key = normalizeSituacaoColorKey(keyRaw);
    if (!key) return null;
    const field = String(fieldRaw || "").trim();
    if (!["textColor", "badgeBgColor", "badgeTextColor"].includes(field)) return null;

    const current = readSituacaoColorSettings(scopedMode);
    const base = normalizeSituacaoColorEntry(current[key] || { key, label: key }, key) || {
      key,
      label: key,
      textColor: "",
      badgeBgColor: "",
      badgeTextColor: "",
    };
    const next = {
      ...base,
      [field]: normalizeHexColor(valueRaw || ""),
    };
    if (!next.textColor && !next.badgeBgColor && !next.badgeTextColor) {
      delete current[key];
    } else {
      current[key] = next;
    }
    const persisted = writeSituacaoColorSettings(current, scopedMode);
    console.info(
      `${SITUACAO_COLOR_LOG_PREFIX} tema=${scopedMode} situacao="${next.label}" campo=${field} valor="${
        next[field] || "limpo"
      }"`
    );
    applySituacaoColorCustomization(scopedMode);
    return persisted[key] || null;
  }
  /**
   * Objetivo: Remove configuracao de cor de uma situacao especifica.
   *
   * Contexto: botao "limpar" por linha no modal de situacoes.
   * Parametros:
   * - keyRaw: chave/label da situacao.
   * - mode: tema opcional.
   * Retorno: boolean.
   */
  function resetSituacaoColorForKey(keyRaw, mode = "") {
    const scopedMode = resolveAppearanceThemeMode(mode);
    const key = normalizeSituacaoColorKey(keyRaw);
    if (!key) return false;
    const current = readSituacaoColorSettings(scopedMode);
    if (!current[key]) return false;
    const label = sanitizeSituacaoColorLabel(current[key]?.label || key);
    delete current[key];
    writeSituacaoColorSettings(current, scopedMode);
    console.info(`${SITUACAO_COLOR_LOG_PREFIX} tema=${scopedMode} situacao="${label}" reset=1`);
    applySituacaoColorCustomization(scopedMode);
    return true;
  }
  /**
   * Objetivo: Remove todas as configuracoes de cor por situacao do tema atual.
   *
   * Contexto: acao global de restauracao no modal.
   * Parametros:
   * - mode: tema opcional.
   * Retorno: void.
   */
  function resetAllSituacaoColorSettings(mode = "") {
    const scopedMode = resolveAppearanceThemeMode(mode);
    writeSituacaoColorSettings({}, scopedMode);
    console.info(`${SITUACAO_COLOR_LOG_PREFIX} tema=${scopedMode} reset-geral=1`);
    applySituacaoColorCustomization(scopedMode);
  }
  /**
   * Objetivo: Aplica customizacao visual de situacoes nas grades e chips.
   *
   * Contexto: executado apos safeRun, troca de tema e alteracoes no modal.
   * Parametros:
   * - mode: tema opcional.
   * Retorno: void.
   */
  function applySituacaoColorCustomization(mode = "") {
    const scopedMode = resolveAppearanceThemeMode(mode);
    const configured = readSituacaoColorSettings(scopedMode);
    const borderMixerColor = scopedMode === "light" ? "#0F172A" : "#DCE6F2";
    const user2Api = getUser2SettingsApi();
    const extractSituacaoTextFromCell =
      user2Api && typeof user2Api.extractSituacaoTextFromCell === "function"
        ? user2Api.extractSituacaoTextFromCell
        : (td) => getSituacaoCellText(td);

    const applyCellTextColor = (td, entry) => {
      if (!(td instanceof HTMLTableCellElement)) return;
      if (user2Api && typeof user2Api.applySituacaoTextPaint === "function") {
        user2Api.applySituacaoTextPaint(td, entry?.textColor || "");
        return;
      }
      td.style.removeProperty("color");
      const sitNode =
        td.querySelector(".Situacao") ||
        td.querySelector(".situacao") ||
        td.querySelector("[class*='Situacao']") ||
        td.querySelector("[class*='situacao']");
      if (sitNode instanceof HTMLElement) sitNode.style.removeProperty("color");
      const target = sitNode || td;
      if (!(target instanceof HTMLElement)) return;
      if (entry?.textColor) target.style.setProperty("color", entry.textColor, "important");
    };
    const applyRowBackgroundColor = (tr, colorRaw) => {
      if (!(tr instanceof HTMLTableRowElement)) return;
      if (user2Api && typeof user2Api.applySituacaoRowPaint === "function") {
        user2Api.applySituacaoRowPaint(tr, colorRaw || "");
        return;
      }
      delete tr.dataset.hsSitRowBg;
      tr.style.removeProperty("--hs-sit-row-bg");
      Array.from(tr.cells || []).forEach((cell) => {
        if (!(cell instanceof HTMLTableCellElement)) return;
        if (cell.dataset.hsSitRowPainted !== "1") return;
        cell.style.removeProperty("background");
        cell.style.removeProperty("background-color");
        delete cell.dataset.hsSitRowPainted;
      });
      const color = normalizeHexColor(colorRaw || "");
      if (!color) return;
      tr.dataset.hsSitRowBg = color;
      tr.style.setProperty("--hs-sit-row-bg", color);
      Array.from(tr.cells || []).forEach((cell) => {
        if (!(cell instanceof HTMLTableCellElement)) return;
        cell.style.setProperty("background", color, "important");
        cell.style.setProperty("background-color", color, "important");
        cell.dataset.hsSitRowPainted = "1";
      });
    };
    const applyBadgeColors = (el, entry) => {
      if (!(el instanceof HTMLElement)) return;
      const badgeBorderColor = entry?.badgeBgColor
        ? mixHexColors(entry.badgeBgColor, borderMixerColor, scopedMode === "light" ? 0.34 : 0.52)
        : "";
      if (user2Api && typeof user2Api.applySituacaoBadgePaint === "function") {
        user2Api.applySituacaoBadgePaint(el, {
          badgeBgColor: entry?.badgeBgColor || "",
          badgeTextColor: entry?.badgeTextColor || "",
          textColor: entry?.textColor || "",
          badgeBorderColor,
        });
        return;
      }
      el.style.removeProperty("background");
      el.style.removeProperty("color");
      el.style.removeProperty("border-color");
      if (!entry) return;
      if (entry.badgeBgColor) {
        el.style.setProperty("background", entry.badgeBgColor, "important");
        el.style.setProperty("border-color", badgeBorderColor, "important");
      }
      const textColor = entry.badgeTextColor || entry.textColor || "";
      if (textColor) el.style.setProperty("color", textColor, "important");
    };

    document.querySelectorAll("table.sortable").forEach((table) => {
      const headerRow = table.tHead?.rows?.[0] || Array.from(table.rows || []).find((tr) => tr.querySelector("th"));
      if (!(headerRow instanceof HTMLTableRowElement)) return;
      const headers = Array.from(headerRow.cells || []).map((c) => norm(c.textContent || ""));
      const idxSituacao = headers.findIndex((h) => SITUACAO_RX.test(h));
      if (idxSituacao < 0) return;

      const bodyRows = Array.from(table.tBodies || []).flatMap((tbody) => Array.from(tbody.rows || []));
      (bodyRows.length ? bodyRows : Array.from(table.rows || [])).forEach((tr) => {
        if (!(tr instanceof HTMLTableRowElement)) return;
        if (tr.querySelector("th")) return;
        const td = tr.cells[idxSituacao];
        if (!(td instanceof HTMLTableCellElement)) return;
        const statusText = sanitizeSituacaoColorLabel(extractSituacaoTextFromCell(td));
        const key = normalizeSituacaoColorKey(statusText);
        const entry = key ? configured[key] || null : null;
        if (key) {
          tr.dataset.hsSituacaoKey = key;
          tr.dataset.hsSituacaoLabel = statusText;
          td.dataset.hsSituacaoKey = key;
          td.dataset.hsSituacaoLabel = statusText;
        } else {
          delete tr.dataset.hsSituacaoKey;
          delete tr.dataset.hsSituacaoLabel;
          delete td.dataset.hsSituacaoKey;
          delete td.dataset.hsSituacaoLabel;
        }
        applyCellTextColor(td, entry);
        applyRowBackgroundColor(tr, entry?.badgeBgColor || "");
      });
    });

    document.querySelectorAll(".hs-situacao-sinal, .hs-ext-sla-chip").forEach((el) => {
      const label = sanitizeSituacaoColorLabel(el.dataset.hsSituacaoLabel || el.textContent || "");
      const key = normalizeSituacaoColorKey(label);
      if (key) {
        el.dataset.hsSituacaoKey = key;
        if (!el.dataset.hsSituacaoLabel) el.dataset.hsSituacaoLabel = label;
      } else {
        delete el.dataset.hsSituacaoKey;
      }
      applyBadgeColors(el, key ? configured[key] || null : null);
    });
  }
  /**
   * Objetivo: Aplica variaveis visuais de fonte/cor/papel de fundo no documento.
   *
   * Contexto: executado apos trocar tema e ao salvar configuracao de aparencia.
   * Parametros: nenhum.
   * Retorno: object.
   */
  function applyAppearanceSettings() {
    const html = document.documentElement;
    if (!(html instanceof HTMLElement)) return { ...APPEARANCE_DEFAULTS };
    const mode = html.getAttribute("data-hs-theme") === "light" ? "light" : "dark";
    const settings = readAppearanceSettings(mode);
    const defaults =
      mode === "light"
        ? { bg: "#FFFFFF", fg: "#0F172A", accent: "#1F5FB4" }
        : { bg: "#0E141D", fg: "#DCE6F2", accent: "#3A6FAE" };
    const bg = normalizeHexColor(settings.bgColor) || defaults.bg;
    const fg = normalizeHexColor(settings.textColor) || defaults.fg;
    const accent = normalizeHexColor(settings.accentColor) || defaults.accent;
    const panel = mixHexColors(bg, fg, mode === "light" ? 0.04 : 0.08);
    const panel2 = mixHexColors(bg, fg, mode === "light" ? 0.08 : 0.13);
    const border = mixHexColors(bg, fg, mode === "light" ? 0.18 : 0.24);
    const chipBg = mixHexColors(panel2, bg, mode === "light" ? 0.54 : 0.38);
    const neutral = mixHexColors(fg, bg, mode === "light" ? 0.06 : 0.09);
    const link = mixHexColors(accent, fg, mode === "light" ? 0.2 : 0.38);
    const linkHover = mixHexColors(accent, fg, mode === "light" ? 0.34 : 0.56);
    const gridAppearance = buildDashboardGridAppearanceTokens({
      ...settings,
      mode,
      bg,
      fg,
      accent,
      panel,
      panel2,
    });
    const [r, g, b] = hexToRgb(bg);
    const wallpaperOpacity = clampNumber(
      settings.wallpaperOpacity,
      APPEARANCE_WALLPAPER_OPACITY_MIN,
      APPEARANCE_WALLPAPER_OPACITY_MAX
    );
    const overlayAlpha = clampNumber(1 - wallpaperOpacity, 0.82, 1);
    const wallpaperOverlay = `rgba(${r},${g},${b},${overlayAlpha.toFixed(3)})`;
    const wallpaperCss = settings.wallpaperUrl
      ? `url("${String(settings.wallpaperUrl).replace(/[\\"]/g, "\\$&")}")`
      : "none";
    const fontCss = APPEARANCE_FONT_MAP[settings.fontFamily] || APPEARANCE_FONT_MAP.default;
    const borderShape = String(settings.borderShape || APPEARANCE_DEFAULTS.borderShape)
      .trim()
      .toLowerCase();
    const borderRadiusBase =
      borderShape === "square"
        ? 0
        : Math.round(
            clampNumber(
              Number(settings.borderRadius),
              APPEARANCE_BORDER_RADIUS_MIN,
              APPEARANCE_BORDER_RADIUS_MAX
            )
          );
    const borderWidth = Math.round(
      clampNumber(
        Number(settings.borderWidth),
        APPEARANCE_BORDER_WIDTH_MIN,
        APPEARANCE_BORDER_WIDTH_MAX
      )
    );
    const dashboardGridWidthRaw = Number(settings.dashboardGridWidth);
    const dashboardGridWidth =
      Number.isFinite(dashboardGridWidthRaw) &&
      dashboardGridWidthRaw >= APPEARANCE_DASHBOARD_GRID_WIDTH_MIN
        ? Math.round(
            clampNumber(
              dashboardGridWidthRaw,
              APPEARANCE_DASHBOARD_GRID_WIDTH_MIN,
              APPEARANCE_DASHBOARD_GRID_WIDTH_MAX
            )
          )
        : 0;

    html.style.setProperty("--bg", bg);
    html.setAttribute("data-hs-corner", borderShape === "square" ? "square" : "rounded");
    html.style.setProperty("--fg", fg);
    html.style.setProperty("--panel", panel);
    html.style.setProperty("--panel2", panel2);
    html.style.setProperty("--border", border);
    html.style.setProperty("--row1", gridAppearance.row1);
    html.style.setProperty("--row2", gridAppearance.row2);
    html.style.setProperty("--hs-table-row1", gridAppearance.row1);
    html.style.setProperty("--hs-table-row2", gridAppearance.row2);
    html.style.setProperty("--hs-table-surface", gridAppearance.tableSurface);
    html.style.setProperty("--hs-table-border", gridAppearance.tableBorder);
    html.style.setProperty("--hs-table-head-bg", gridAppearance.headBg);
    html.style.setProperty("--hs-table-head-fg", gridAppearance.headFg);
    html.style.setProperty("--hs-table-head-border", gridAppearance.headBorder);
    html.style.setProperty("--hs-table-body-border", gridAppearance.bodyBorder);
    html.style.setProperty("--hs-table-hover-bg", gridAppearance.hoverBg);
    html.style.setProperty("--hs-table-shadow", gridAppearance.shadow);
    html.style.setProperty("--hs-table-head-py", gridAppearance.headPy);
    html.style.setProperty("--hs-table-head-px", gridAppearance.headPx);
    html.style.setProperty("--hs-table-cell-py", gridAppearance.cellPy);
    html.style.setProperty("--hs-table-cell-px", gridAppearance.cellPx);
    html.style.setProperty("--hs-table-font-size", gridAppearance.fontSize);
    html.style.setProperty("--hs-table-line-height", gridAppearance.lineHeight);
    html.style.setProperty("--chip-bg", chipBg);
    html.style.setProperty("--neutral", neutral);
    html.style.setProperty("--accent", accent);
    html.style.setProperty("--link", link);
    html.style.setProperty("--link-hover", linkHover);
    html.setAttribute("data-hs-table-hover", gridAppearance.hover);
    html.style.setProperty("--hs-body-font", fontCss);
    html.style.setProperty("--hs-wallpaper-image", wallpaperCss);
    html.style.setProperty("--hs-wallpaper-overlay", wallpaperOverlay);
    html.style.setProperty("--hs-border-width", `${Math.max(1, borderWidth)}px`);
    html.style.setProperty("--hs-radius-control", `${Math.max(0, borderRadiusBase)}px`);
    html.style.setProperty("--hs-radius-card", `${Math.max(0, Math.round(borderRadiusBase * 1.35))}px`);
    html.style.setProperty("--hs-radius-table", `${Math.max(0, Math.round(borderRadiusBase * 1.7))}px`);
    html.style.setProperty(
      "--hs-dashboard-grid-user-width",
      dashboardGridWidth > 0 ? `${dashboardGridWidth}px` : "auto"
    );
    return settings;
  }
  /**
   * Objetivo: Le largura persistida da grade do dashboard para o tema atual.
   *
   * Contexto: usado na normalizacao de largura e no resize pelas bordas.
   * Parametros:
   * - mode: entrada usada por esta rotina.
   * Retorno: number (0 quando auto).
   */
  function getStoredDashboardGridWidth(mode = "") {
    const settings = readAppearanceSettings(mode);
    const raw = Number(settings.dashboardGridWidth);
    if (!Number.isFinite(raw) || raw < APPEARANCE_DASHBOARD_GRID_WIDTH_MIN) return 0;
    return Math.round(
      clampNumber(raw, APPEARANCE_DASHBOARD_GRID_WIDTH_MIN, APPEARANCE_DASHBOARD_GRID_WIDTH_MAX)
    );
  }
  /**
   * Objetivo: Persiste largura da grade do dashboard no escopo do tema atual.
   *
   * Contexto: chamado ao arrastar bordas da grade e no modal de aparencia.
   * Parametros:
   * - value: entrada usada por esta rotina.
   * - mode: entrada usada por esta rotina.
   * Retorno: number.
   */
  function setStoredDashboardGridWidth(value, mode = "") {
    const scopedMode = resolveAppearanceThemeMode(mode);
    const base = readAppearanceSettings(scopedMode);
    const raw = Number(value);
    const next =
      Number.isFinite(raw) && raw >= APPEARANCE_DASHBOARD_GRID_WIDTH_MIN
        ? Math.round(
            clampNumber(raw, APPEARANCE_DASHBOARD_GRID_WIDTH_MIN, APPEARANCE_DASHBOARD_GRID_WIDTH_MAX)
          )
        : 0;
    writeAppearanceSettings({ ...base, dashboardGridWidth: next }, scopedMode);
    return next;
  }
  /**
   * Objetivo: Valida se arquivo/URL e elegivel para modal (somente PNG/JPG).
   *
   * Contexto: restringe preview modal dos anexos para formatos suportados.
   * Parametros:
   * - source: URL/data URL do arquivo.
   * - fileName: nome opcional.
   * - fileType: MIME opcional.
   * Retorno: boolean.
   * Efeitos colaterais: nenhum.
   */
  function isPngOrJpgPreviewCandidate(source, fileName = "", fileType = "") {
    const mime = String(fileType || "").trim().toLowerCase();
    if (/^image\/(?:png|jpeg|jpg)$/.test(mime)) return true;

    const name = String(fileName || "").trim().toLowerCase();
    if (/\.(png|jpe?g)$/.test(name)) return true;

    const src = String(source || "").trim().toLowerCase();
    if (!src) return false;
    if (/^data:image\/(?:png|jpeg|jpg)(?:;|,)/.test(src)) return true;
    if (/\.(png|jpe?g)(?:[?#].*)?$/.test(src)) return true;
    try {
      const url = new URL(String(source || ""), location.href);
      const queryNames = ["name", "filename", "file", "arquivo", "anexo"];
      for (const key of queryNames) {
        const value = String(url.searchParams.get(key) || "").trim().toLowerCase();
        if (/\.(png|jpe?g)$/.test(value)) return true;
      }
    } catch {}
    return false;
  }
  /**
   * Objetivo: Valida se anexo de texto (TXT/SQL) e elegivel para preview interno.
   *
   * Contexto: usado para anexos recebidos e anexos locais selecionados.
   * Parametros:
   * - source: URL/data URL opcional.
   * - fileName: nome opcional.
   * - fileType: MIME opcional.
   * Retorno: boolean.
   */
  function isTextOrSqlPreviewCandidate(source, fileName = "", fileType = "") {
    const mime = String(fileType || "").trim().toLowerCase();
    if (/^(text\/plain|application\/sql|text\/sql|application\/x-sql)$/i.test(mime)) return true;

    const textExtRx = /\.(txt|sql|log|csv|json|xml|md|ini)$/i;
    const decodeMaybe = (value) => {
      const raw = String(value || "").trim();
      if (!raw) return "";
      try {
        return decodeURIComponent(raw);
      } catch {
        return raw;
      }
    };

    const name = String(fileName || "").trim().toLowerCase();
    if (textExtRx.test(name)) return true;

    const src = String(source || "").trim().toLowerCase();
    if (!src) return false;
    if (/^data:text\/plain(?:;|,)/.test(src)) return true;
    if (textExtRx.test(src)) return true;
    try {
      const url = new URL(String(source || ""), location.href);
      if (textExtRx.test(String(url.pathname || "").toLowerCase())) return true;
      const queryNames = ["name", "filename", "file", "arquivo", "anexo", "nome", "titulo"];
      for (const key of queryNames) {
        const value = decodeMaybe(url.searchParams.get(key));
        if (textExtRx.test(String(value || "").toLowerCase())) return true;
      }
    } catch {}
    return false;
  }
  /**
   * Objetivo: Informa se modal local de anexo pode ser usado para o arquivo.
   *
   * Contexto: combina toggle do usuario com filtro PNG/JPG.
   * Parametros:
   * - source: URL/data URL do arquivo.
   * - fileName: nome opcional.
   * - fileType: MIME opcional.
   * Retorno: boolean.
   * Efeitos colaterais: leitura opcional de localStorage.
   */
  function isAttachmentModalPreviewAllowed(source, fileName = "", fileType = "") {
    if (!isAttachmentImagePreviewEnabled()) return false;
    return isPngOrJpgPreviewCandidate(source, fileName, fileType);
  }
  /**
   * Objetivo: Informa se preview textual de anexo pode ser usado para o arquivo.
   *
   * Contexto: combina toggle do usuario com filtro TXT/SQL.
   * Parametros:
   * - source: URL/data URL do arquivo.
   * - fileName: nome opcional.
   * - fileType: MIME opcional.
   * Retorno: boolean.
   * Efeitos colaterais: leitura opcional de localStorage.
   */
  function isAttachmentTextModalPreviewAllowed(source, fileName = "", fileType = "") {
    const candidate = isTextOrSqlPreviewCandidate(source, fileName, fileType);
    if (!candidate) return false;
    if (isAttachmentTextPreviewEnabled()) return true;
    const rawSource = String(source || "").trim();
    return /(?:^|\/)anexo(?:\.php)?(?:[?#]|$)/i.test(rawSource) || /[?&](?:guid|anexo|id_anexo)=/i.test(rawSource);
  }
  /**
   * Objetivo: Normaliza lista de historico de atualizacoes.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros:
   * - rawList: entrada usada por esta rotina.
   * Retorno: Array<object>.
   * Efeitos colaterais: nenhum.
   */
  function normalizeUpdatesLogList(rawList) {
    return (Array.isArray(rawList) ? rawList : [])
      .map((entry) => normalizeUpdateHistoryEntry(entry))
      .filter(Boolean);
  }
  /**
   * Objetivo: Le cache local do historico remoto de atualizacoes.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: object.
   * Efeitos colaterais: leitura de localStorage.
   */
  function readUpdatesLogCache() {
    try {
      const at = parseInt(localStorage.getItem(UPDATES_LOG_CACHE_AT_LS_KEY) || "0", 10);
      const raw = String(localStorage.getItem(UPDATES_LOG_CACHE_JSON_LS_KEY) || "").trim();
      if (!raw) return { at: 0, list: [] };
      const parsed = JSON.parse(raw);
      return { at: Number.isFinite(at) ? at : 0, list: normalizeUpdatesLogList(parsed) };
    } catch {
      return { at: 0, list: [] };
    }
  }
  /**
   * Objetivo: Persiste cache local do historico remoto de atualizacoes.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros:
   * - list: entrada usada por esta rotina.
   * Retorno: void.
   * Efeitos colaterais: escrita em localStorage.
   */
  function writeUpdatesLogCache(list) {
    const normalized = normalizeUpdatesLogList(list);
    if (!normalized.length) return;
    try {
      localStorage.setItem(UPDATES_LOG_CACHE_AT_LS_KEY, String(Date.now()));
      localStorage.setItem(UPDATES_LOG_CACHE_JSON_LS_KEY, JSON.stringify(normalized));
    } catch {}
  }
  /**
   * Objetivo: Busca historico remoto de atualizacoes com fallback local/cache.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros:
   * - forceRefresh: entrada usada por esta rotina.
   * Retorno: Promise<object>.
   * Efeitos colaterais: chamadas de rede e cache local.
   */
  async function fetchUpdatesLog(forceRefresh = true) {
    const cached = readUpdatesLogCache();
    const now = Date.now();
    if (
      !forceRefresh &&
      cached.at > 0 &&
      now - cached.at < UPDATES_LOG_CACHE_MS &&
      Array.isArray(cached.list) &&
      cached.list.length
    ) {
      return { list: cached.list, source: "cache" };
    }

    try {
      const response = await fetch(UPDATES_LOG_REMOTE_URL, {
        method: "GET",
        cache: "no-store",
        mode: "cors",
        credentials: "omit",
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const parsed = await response.json();
      const normalized = normalizeUpdatesLogList(parsed);
      if (!normalized.length) throw new Error("Arquivo remoto de atualizacoes vazio.");
      writeUpdatesLogCache(normalized);
      return { list: normalized, source: "remote" };
    } catch {
      if (cached.list.length) return { list: cached.list, source: "cache-fallback" };
      return { list: normalizeUpdatesLogList(RECENT_UPDATES), source: "local-fallback" };
    }
  }
  /**
   * Objetivo: Normaliza classificacao de release para um conjunto padrao.
   *
   * Contexto: usado para diferenciar release rotineira de correcao obrigatoria.
   * Parametros:
   * - value: classificacao bruta vinda do historico.
   * Retorno: string.
   */
  function normalizeUpdateKindTag(value) {
    const raw = norm(String(value || ""));
    if (!raw) return "";
    if (/(security|seguranca|vulnerab|cve)/.test(raw)) return "security";
    if (/(bug|fix|hotfix|correc|erro|critical|critica|incidente)/.test(raw)) return "bugfix";
    if (/(feature|melhoria|routine|rotina|ui|refactor|perf|manutencao|maintenance|ajuste)/.test(raw)) {
      return "routine";
    }
    return "";
  }
  /**
   * Objetivo: Converte entradas boolean-like em boolean.
   *
   * Contexto: aceita true/false, 1/0 e strings usuais.
   * Parametros:
   * - value: entrada usada por esta rotina.
   * Retorno: boolean.
   */
  function parseBooleanLike(value) {
    if (value === true || value === false) return !!value;
    const raw = norm(String(value || ""));
    if (!raw) return false;
    return /^(1|true|sim|yes|obrigatorio|obrigatoria|mandatory)$/i.test(raw);
  }
  /**
   * Objetivo: Detecta palavras-chave de atualizacao obrigatoria dentro das notas.
   *
   * Contexto: fallback para historicos antigos sem campo "mandatory".
   * Parametros:
   * - notes: array de textos da release.
   * Retorno: boolean.
   */
  function hasMandatoryUpdateKeywords(notes) {
    const text = norm((Array.isArray(notes) ? notes : []).map((n) => String(n || "")).join(" "));
    if (!text) return false;
    return /(obrigatori|correcao\s+critica|erro\s+grave|erro\s+grotesco|bug\s+critic|hotfix|falha\s+critica)/.test(text);
  }
  /**
   * Objetivo: Define se uma entrada de release deve ser tratada como obrigatoria.
   *
   * Contexto: regra pedida para releases de correcao de erro.
   * Parametros:
   * - entry: item do historico de atualizacoes.
   * Retorno: boolean.
   */
  function isMandatoryUpdateEntry(entry) {
    if (!entry || typeof entry !== "object") return false;
    if (parseBooleanLike(entry.mandatory)) return true;
    const kind = normalizeUpdateKindTag(entry.kind || entry.type || entry.updateType || entry.category || "");
    if (kind === "bugfix" || kind === "security") return true;
    if (hasMandatoryUpdateKeywords(entry.notes)) return true;
    return false;
  }
  /**
   * Objetivo: Localiza release obrigatoria dentro do intervalo local->remoto.
   *
   * Contexto: usado para sinalizar/forcar fluxo de update obrigatorio.
   * Parametros:
   * - list: historico de atualizacoes.
   * - remoteVersion: versao remota detectada.
   * - localVersion: versao local atual.
   * Retorno: object|null.
   */
  function findMandatoryPendingUpdate(list, remoteVersion, localVersion = SCRIPT_VERSION) {
    const remote = String(remoteVersion || "").trim();
    const local = String(localVersion || SCRIPT_VERSION).trim();
    if (!remote) return null;
    if (compareVersionTexts(remote, local) <= 0) return null;

    const ordered = (Array.isArray(list) ? list : [])
      .map((entry) => normalizeUpdateHistoryEntry(entry))
      .filter(Boolean)
      .sort((a, b) => compareVersionTexts(String(b.version || ""), String(a.version || "")));
    for (const entry of ordered) {
      const version = String(entry?.version || "").trim();
      if (!version) continue;
      if (compareVersionTexts(version, local) <= 0) continue;
      if (compareVersionTexts(version, remote) > 0) continue;
      if (isMandatoryUpdateEntry(entry)) return entry;
    }
    return null;
  }
  /**
   * Objetivo: Monta justificativa curta da obrigatoriedade de update.
   *
   * Contexto: exibido nos modais/toasts de atualizacao obrigatoria.
   * Parametros:
   * - entry: release marcada como obrigatoria.
   * Retorno: string.
   */
  function buildMandatoryUpdateReason(entry) {
    const notes = Array.isArray(entry?.notes) ? entry.notes : [];
    const highlighted =
      notes.find((note) =>
        /(obrigatori|correcao|erro|bug|hotfix|critic|falha)/i.test(String(note || ""))
      ) || notes[0];
    return String(highlighted || "Correcao de erro obrigatoria para estabilidade do sistema.").trim();
  }
  /**
   * Objetivo: Normaliza item do historico de atualizacoes para formato consistente.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros:
   * - entry: entrada usada por esta rotina.
   * Retorno: object|null.
   * Efeitos colaterais: nenhum.
   */
  function normalizeUpdateHistoryEntry(entry) {
    if (!entry || typeof entry !== "object") return null;
    const version = String(entry.version || "").trim();
    const date = String(entry.date || "").trim();
    const kind = normalizeUpdateKindTag(entry.kind || entry.type || entry.updateType || entry.category || "");
    const notesRaw = Array.isArray(entry.notes) ? entry.notes : [];
    const notes = Array.from(
      new Set(
        notesRaw
          .map((n) => String(n || "").trim())
          .filter(Boolean)
      )
    );
    const mandatory = isMandatoryUpdateEntry({ ...entry, notes, kind });
    if (!version && !date && !notes.length && !kind) return null;
    return { version, date, notes, kind, mandatory };
  }
  /**
   * Objetivo: Mescla historicos no modo append-only (nunca remove entradas existentes).
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros:
   * - oldList: entrada usada por esta rotina.
   * - newList: entrada usada por esta rotina.
   * Retorno: Array<object>.
   * Efeitos colaterais: nenhum.
   */
  function mergeUpdateHistoryAppendOnly(oldList = [], newList = []) {
    const map = new Map();
    const upsert = (entry) => {
      const normalized = normalizeUpdateHistoryEntry(entry);
      if (!normalized) return;
      const key =
        normalized.version
          ? `v:${normalized.version}`
          : `d:${normalized.date}|n:${normalized.notes.join("||")}`;
      const current = map.get(key);
      if (!current) {
        map.set(key, normalized);
        return;
      }
      const mergedNotes = Array.from(new Set([...(current.notes || []), ...(normalized.notes || [])]));
      const mergedMandatory = !!current.mandatory || !!normalized.mandatory;
      const mergedKind =
        normalizeUpdateKindTag(current.kind) ||
        normalizeUpdateKindTag(normalized.kind) ||
        (mergedMandatory ? "bugfix" : "");
      map.set(key, {
        version: current.version || normalized.version,
        date: current.date || normalized.date,
        notes: mergedNotes,
        kind: mergedKind,
        mandatory: mergedMandatory,
      });
    };

    (Array.isArray(oldList) ? oldList : []).forEach(upsert);
    (Array.isArray(newList) ? newList : []).forEach(upsert);

    return Array.from(map.values()).sort((a, b) => {
      const byVersion = compareVersionTexts(String(b.version || ""), String(a.version || ""));
      if (byVersion !== 0) return byVersion;
      return String(b.date || "").localeCompare(String(a.date || ""));
    });
  }
  /**
   * Objetivo: Le historico append-only de atualizacoes do storage local.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: Array<object>.
   * Efeitos colaterais: leitura de localStorage.
   */
  function readUpdateHistoryFromStorage() {
    try {
      const raw = String(localStorage.getItem(UPDATE_LOG_HISTORY_LS_KEY) || "").trim();
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((x) => normalizeUpdateHistoryEntry(x)).filter(Boolean);
    } catch {
      return [];
    }
  }
  /**
   * Objetivo: Persiste historico append-only de atualizacoes.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros:
   * - list: entrada usada por esta rotina.
   * Retorno: void.
   * Efeitos colaterais: escrita em localStorage.
   */
  function writeUpdateHistoryToStorage(list) {
    try {
      localStorage.setItem(UPDATE_LOG_HISTORY_LS_KEY, JSON.stringify(Array.isArray(list) ? list : []));
    } catch {}
  }
  /**
   * Objetivo: Sincroniza RECENT_UPDATES com historico persistido sem apagar entradas antigas.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: Array<object>.
   * Efeitos colaterais: leitura/escrita em localStorage.
   */
  function getAppendOnlyUpdateHistory() {
    const persisted = readUpdateHistoryFromStorage();
    const merged = mergeUpdateHistoryAppendOnly(persisted, RECENT_UPDATES);

    // Garante que a versao atual sempre apareca no painel de atualizacoes.
    if (!merged.some((entry) => String(entry.version || "").trim() === SCRIPT_VERSION)) {
      merged.unshift({
        version: SCRIPT_VERSION,
        date: new Date().toISOString().slice(0, 10),
        notes: ["Atualizacao registrada automaticamente nesta versao."],
        kind: "routine",
        mandatory: false,
      });
    }

    writeUpdateHistoryToStorage(merged);
    return merged;
  }
  /**
   * Objetivo: Valida e reforca regras do campo de atualizacoes no runtime.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: Array<object>.
   * Efeitos colaterais: warnings no console quando regras nao forem atendidas.
   */
  function enforceUpdateHistoryRules(forceRefresh = false) {
    if (!forceRefresh && hsUpdateHistoryValidated && Array.isArray(hsUpdateHistoryValidatedList)) {
      return hsUpdateHistoryValidatedList;
    }
    const list = getAppendOnlyUpdateHistory();
    const current = list.find((entry) => String(entry.version || "").trim() === SCRIPT_VERSION);
    if (!current || !Array.isArray(current.notes) || current.notes.length === 0) {
      console.warn("[HeadsoftHelper][updates] Regra violada: adicione notas para a versao atual no RECENT_UPDATES.");
    }
    hsUpdateHistoryValidated = true;
    hsUpdateHistoryValidatedList = Array.isArray(list) ? list : [];
    return list;
  }
  /**
   * Objetivo: Fecha modal do historico de atualizacoes.
   *
   * Contexto: reutilizado por backdrop, botao fechar e tecla ESC.
   * Parametros: nenhum.
   * Retorno: void.
   */
  function closeUpdatesLogModal() {
    if (!hsUpdatesLogModal) hsUpdatesLogModal = document.getElementById("hs-updates-log-modal");
    if (!(hsUpdatesLogModal instanceof HTMLElement)) return;
    hsUpdatesLogModal.classList.remove("open");
  }
  /**
   * Objetivo: Cria modal de historico de atualizacoes.
   *
   * Contexto: substitui alert nativo por UI consistente.
   * Parametros: nenhum.
   * Retorno: HTMLElement|null.
   */
  function ensureUpdatesLogModal() {
    if (hsUpdatesLogModal && hsUpdatesLogModal.isConnected) return hsUpdatesLogModal;
    let modal = document.getElementById("hs-updates-log-modal");
    if (!(modal instanceof HTMLElement)) {
      modal = document.createElement("div");
      modal.id = "hs-updates-log-modal";
      modal.className = "hs-update-modal hs-updates-log-modal";
      modal.innerHTML = `
        <div class="hs-update-modal-backdrop"></div>
        <section class="hs-update-modal-card" role="dialog" aria-modal="true" aria-label="Historico de atualizacoes">
          <header class="hs-update-modal-head">
            <span>Historico de Atualizacoes</span>
            <button type="button" data-action="close">Fechar</button>
          </header>
          <div class="hs-update-modal-body">
            <p class="hs-updates-log-meta"></p>
            <ul class="hs-updates-log-rules"></ul>
            <div class="hs-updates-log-list"></div>
            <p class="hs-updates-log-footer"></p>
            <div class="hs-update-modal-actions">
              <button type="button" class="is-main" data-action="install" style="display:none;">Atualizar agora</button>
              <button type="button" data-action="refresh">Recarregar lista</button>
              <button type="button" data-action="close-bottom">Fechar</button>
            </div>
          </div>
        </section>
      `;
      document.body.appendChild(modal);
    }
    hsUpdatesLogModal = modal;
    if (modal.dataset.hsBound === "1") return modal;
    modal.dataset.hsBound = "1";

    modal.querySelector(".hs-update-modal-backdrop")?.addEventListener("click", closeUpdatesLogModal);
    modal.querySelector('[data-action="close"]')?.addEventListener("click", closeUpdatesLogModal);
    modal.querySelector('[data-action="close-bottom"]')?.addEventListener("click", closeUpdatesLogModal);
    modal.addEventListener("click", (ev) => {
      const btn = ev.target instanceof HTMLElement ? ev.target.closest("button[data-action]") : null;
      if (!(btn instanceof HTMLButtonElement)) return;
      const action = String(btn.dataset.action || "").trim();
      const payload = hsUpdatesLogPayload || {};
      if (action === "refresh") {
        if (btn.dataset.hsBusy === "1") return;
        btn.dataset.hsBusy = "1";
        const oldLabel = btn.textContent;
        btn.textContent = "Atualizando...";
        showRecentUpdatesDialog({
          forceRefresh: true,
          remoteVersion: String(payload.remoteVersion || ""),
          remoteUrl: String(payload.remoteUrl || ""),
          highlightVersion: String(payload.highlightVersion || ""),
          checkedAt: Number(payload.checkedAt || Date.now()),
          mandatoryUpdate: payload.mandatoryUpdate ? true : false,
          mandatoryVersion: String(payload.mandatoryVersion || ""),
          mandatoryReason: String(payload.mandatoryReason || ""),
        })
          .catch(() => toast("Nao foi possivel recarregar o historico agora.", "err", 2800))
          .finally(() => {
            btn.textContent = oldLabel || "Recarregar lista";
            delete btn.dataset.hsBusy;
          });
        return;
      }
      if (action === "install") {
        openScriptUpdatePage(String(payload.remoteUrl || ""));
      }
    });
    return modal;
  }
  /**
   * Objetivo: Renderiza conteudo do modal de historico de atualizacoes.
   *
   * Contexto: alimentado por updates-log.json remoto com fallback local.
   * Parametros:
   * - payload: dados consolidados para UI.
   * Retorno: void.
   */
  function renderUpdatesLogModal(payload) {
    const modal = ensureUpdatesLogModal();
    if (!(modal instanceof HTMLElement)) return;
    const list = Array.isArray(payload?.list) ? payload.list : [];
    const source = String(payload?.source || "").trim();
    const sourceLabelByKey = {
      remote: "updates-log.json (remoto)",
      cache: "cache local",
      "cache-fallback": "cache local (fallback)",
      "local-fallback": "RECENT_UPDATES local (fallback)",
    };
    const sourceLabel = sourceLabelByKey[source] || "fonte local";
    const remoteVersion = String(payload?.remoteVersion || "").trim();
    const remoteUrl = String(payload?.remoteUrl || "").trim();
    const hasUpdate = compareVersionTexts(remoteVersion, SCRIPT_VERSION) > 0;
    const checkedAt = Number(payload?.checkedAt || Date.now());
    const highlightVersion = String(payload?.highlightVersion || "").trim();
    const mandatoryFromPayload = parseBooleanLike(payload?.mandatoryUpdate);
    const mandatoryEntry =
      findMandatoryPendingUpdate(list, remoteVersion, SCRIPT_VERSION) ||
      (mandatoryFromPayload
        ? {
            version: String(payload?.mandatoryVersion || remoteVersion).trim(),
            notes: [String(payload?.mandatoryReason || "").trim()].filter(Boolean),
            mandatory: true,
            kind: "bugfix",
          }
        : null);
    const mandatoryUpdate = !!mandatoryEntry;
    const mandatoryVersion = String(
      payload?.mandatoryVersion || mandatoryEntry?.version || remoteVersion || ""
    ).trim();
    const mandatoryReason = mandatoryUpdate
      ? String(payload?.mandatoryReason || buildMandatoryUpdateReason(mandatoryEntry)).trim()
      : "";
    const metaEl = modal.querySelector(".hs-updates-log-meta");
    const rulesEl = modal.querySelector(".hs-updates-log-rules");
    const listEl = modal.querySelector(".hs-updates-log-list");
    const footerEl = modal.querySelector(".hs-updates-log-footer");
    const installBtn = modal.querySelector('button[data-action="install"]');

    if (metaEl instanceof HTMLElement) {
      let headline = `Versao atual: v${SCRIPT_VERSION}.`;
      if (hasUpdate && mandatoryUpdate) {
        headline = `ATUALIZACAO OBRIGATORIA: v${remoteVersion} (atual: v${SCRIPT_VERSION}).`;
      } else if (hasUpdate) {
        headline = `Nova versao v${remoteVersion} disponivel (atual: v${SCRIPT_VERSION}).`;
      }
      if (hasUpdate && mandatoryUpdate && mandatoryReason) {
        headline = `${headline} Motivo: ${mandatoryReason}`;
      }
      metaEl.textContent = `${headline} Fonte: ${sourceLabel}.`;
    }
    if (rulesEl instanceof HTMLElement) {
      rulesEl.innerHTML = "";
      UPDATE_LOG_RULES.forEach((rule) => {
        const li = document.createElement("li");
        li.textContent = rule;
        rulesEl.appendChild(li);
      });
    }
    if (listEl instanceof HTMLElement) {
      listEl.innerHTML = "";
      if (!list.length) {
        const empty = document.createElement("p");
        empty.className = "hs-updates-log-empty";
        empty.textContent = "Nenhuma atualizacao registrada ate o momento.";
        listEl.appendChild(empty);
      } else {
        list.slice(0, 60).forEach((item) => {
          const article = document.createElement("article");
          article.className = "hs-updates-log-item";
          const version = String(item?.version || "").trim();
          const itemMandatory = isMandatoryUpdateEntry(item);
          if (highlightVersion && version === highlightVersion) article.classList.add("is-highlight");
          if (itemMandatory) article.classList.add("is-highlight");

          const head = document.createElement("header");
          head.className = "hs-updates-log-item-head";
          const versionEl = document.createElement("span");
          versionEl.className = "version";
          versionEl.textContent = version ? `v${version}${itemMandatory ? " (obrigatoria)" : ""}` : "v?";
          const dateEl = document.createElement("span");
          dateEl.className = "date";
          dateEl.textContent = String(item?.date || "").trim() || "sem data";
          head.appendChild(versionEl);
          head.appendChild(dateEl);
          article.appendChild(head);

          const notes = Array.isArray(item?.notes) ? item.notes : [];
          if (notes.length) {
            const ul = document.createElement("ul");
            notes.forEach((note) => {
              const li = document.createElement("li");
              li.textContent = String(note || "").trim();
              ul.appendChild(li);
            });
            article.appendChild(ul);
          }
          listEl.appendChild(article);
        });
      }
    }
    if (footerEl instanceof HTMLElement) {
      footerEl.textContent = `Ultima leitura: ${new Date(checkedAt).toLocaleString("pt-BR")}.`;
    }
    if (installBtn instanceof HTMLButtonElement) {
      const canInstall = hasUpdate;
      installBtn.style.display = canInstall ? "inline-flex" : "none";
      installBtn.textContent = canInstall
        ? mandatoryUpdate
          ? `Atualizar obrigatorio v${remoteVersion}`
          : `Atualizar para v${remoteVersion}`
        : "Atualizar agora";
      installBtn.disabled = !canInstall;
      installBtn.title = canInstall
        ? mandatoryUpdate
          ? "Atualizacao obrigatoria de correcao de erro"
          : "Abrir instalacao da nova versao"
        : "";
    }

    hsUpdatesLogPayload = {
      list,
      source,
      remoteVersion,
      remoteUrl,
      hasUpdate,
      mandatoryUpdate,
      mandatoryVersion,
      mandatoryReason,
      highlightVersion,
      checkedAt,
    };
    modal.classList.add("open");
  }
  /**
   * Objetivo: Exibe historico de atualizacoes em modal.
   *
   * Contexto: usa updates-log.json remoto e fallback local.
   * Parametros:
   * - options: entradas de controle para refresh e destaque de versao.
   * Retorno: Promise<void>.
   */
  async function showRecentUpdatesDialog(options = {}) {
    const opts = options && typeof options === "object" ? options : {};
    const forceRefresh = opts.forceRefresh !== false;
    const localUpdates = enforceUpdateHistoryRules(true);
    const remotePayload = await fetchUpdatesLog(forceRefresh);
    const remoteUpdates = normalizeUpdatesLogList(remotePayload?.list || []);
    const merged = mergeUpdateHistoryAppendOnly(localUpdates, remoteUpdates);
    writeUpdateHistoryToStorage(merged);

    const remoteSorted = mergeUpdateHistoryAppendOnly([], remoteUpdates);
    const displayList = remoteSorted.length ? remoteSorted : merged;
    const remoteVersion =
      String(opts.remoteVersion || "").trim() ||
      String(hsScriptUpdateLastResult?.remoteVersion || "").trim();
    const remoteUrl =
      String(opts.remoteUrl || "").trim() ||
      String(hsScriptUpdateLastResult?.remoteUrl || "").trim() ||
      String(MANUAL_UPDATE_SOURCE_URL || "").trim();
    const highlightVersion = String(opts.highlightVersion || remoteVersion || "").trim();
    const checkedAt = Number(opts.checkedAt || Date.now());
    const mandatoryFromOptions = parseBooleanLike(opts.mandatoryUpdate);
    const pendingMandatoryEntry =
      findMandatoryPendingUpdate(displayList, remoteVersion, SCRIPT_VERSION) ||
      (mandatoryFromOptions
        ? {
            version: String(opts.mandatoryVersion || remoteVersion).trim(),
            notes: [String(opts.mandatoryReason || "").trim()].filter(Boolean),
            mandatory: true,
            kind: "bugfix",
          }
        : null);
    const mandatoryUpdate = !!pendingMandatoryEntry;
    const mandatoryVersion = String(
      opts.mandatoryVersion || pendingMandatoryEntry?.version || remoteVersion || ""
    ).trim();
    const mandatoryReason = mandatoryUpdate
      ? String(opts.mandatoryReason || buildMandatoryUpdateReason(pendingMandatoryEntry)).trim()
      : "";

    renderUpdatesLogModal({
      list: displayList,
      source: String(remotePayload?.source || (remoteUpdates.length ? "remote" : "local-fallback")),
      remoteVersion,
      remoteUrl,
      mandatoryUpdate,
      mandatoryVersion,
      mandatoryReason,
      highlightVersion,
      checkedAt,
    });
  }
  /**
   * Objetivo: Fecha modal de aparencia visual.
   *
   * Contexto: acionado por backdrop, botao fechar e Escape.
   * Parametros: nenhum.
   * Retorno: void.
   */
  function closeAppearanceModal() {
    if (!hsAppearanceModal) hsAppearanceModal = document.getElementById("hs-appearance-modal");
    if (!(hsAppearanceModal instanceof HTMLElement)) return;
    hsAppearanceModal.classList.remove("open");
  }
  /**
   * Objetivo: Atualiza texto percentual da intensidade do papel de fundo.
   *
   * Contexto: usado no modal de aparencia.
   * Parametros:
   * - modal: entrada usada por esta rotina.
   * Retorno: void.
   */
  function refreshAppearanceOpacityLabel(modal) {
    if (!(modal instanceof HTMLElement)) return;
    const range = modal.querySelector("#hs-appearance-wallpaper-opacity");
    const out = modal.querySelector("#hs-appearance-wallpaper-opacity-out");
    if (!(range instanceof HTMLInputElement) || !(out instanceof HTMLOutputElement)) return;
    const pct = clampNumber(Number(range.value || "0"), 0, 18);
    out.value = `${Math.round(pct)}%`;
  }
  /**
   * Objetivo: Atualiza labels dinamic as de controles num modal de aparencia.
   *
   * Contexto: exibicao imediata de percentual/tamanho enquanto usuario ajusta.
   * Parametros:
   * - modal: entrada usada por esta rotina.
   * Retorno: boolean (true quando iniciou a navegacao; false quando cancelado/erro).
   */
  function refreshAppearanceLiveLabels(modal) {
    if (!(modal instanceof HTMLElement)) return;
    refreshAppearanceOpacityLabel(modal);
    const borderRadius = modal.querySelector("#hs-appearance-border-radius");
    const borderRadiusOut = modal.querySelector("#hs-appearance-border-radius-out");
    if (borderRadius instanceof HTMLInputElement && borderRadiusOut instanceof HTMLOutputElement) {
      const px = Math.round(
        clampNumber(
          Number(borderRadius.value || APPEARANCE_BORDER_RADIUS_DEFAULT),
          APPEARANCE_BORDER_RADIUS_MIN,
          APPEARANCE_BORDER_RADIUS_MAX
        )
      );
      borderRadiusOut.value = `${px}px`;
    }
    const borderWidth = modal.querySelector("#hs-appearance-border-width");
    const borderWidthOut = modal.querySelector("#hs-appearance-border-width-out");
    if (borderWidth instanceof HTMLInputElement && borderWidthOut instanceof HTMLOutputElement) {
      const px = Math.round(
        clampNumber(
          Number(borderWidth.value || APPEARANCE_BORDER_WIDTH_DEFAULT),
          APPEARANCE_BORDER_WIDTH_MIN,
          APPEARANCE_BORDER_WIDTH_MAX
        )
      );
      borderWidthOut.value = `${px}px`;
    }
    const gridWidth = modal.querySelector("#hs-appearance-grid-width");
    const gridWidthOut = modal.querySelector("#hs-appearance-grid-width-out");
    if (gridWidth instanceof HTMLInputElement && gridWidthOut instanceof HTMLOutputElement) {
      const valueRaw = Number(gridWidth.value || "0");
      const value =
        Number.isFinite(valueRaw) && valueRaw >= APPEARANCE_DASHBOARD_GRID_WIDTH_MIN
          ? Math.round(
              clampNumber(
                valueRaw,
                APPEARANCE_DASHBOARD_GRID_WIDTH_MIN,
                APPEARANCE_DASHBOARD_GRID_WIDTH_MAX
              )
            )
          : 0;
      gridWidthOut.value = value > 0 ? `${value}px` : "Auto";
    }
  }
  /**
   * Objetivo: Preenche campos do modal de aparencia com estado atual.
   *
   * Contexto: executado ao abrir o modal.
   * Parametros:
   * - modal: entrada usada por esta rotina.
   * - data: entrada usada por esta rotina.
   * Retorno: void.
   */
  function fillAppearanceModalFields(modal, data) {
    if (!(modal instanceof HTMLElement)) return;
    const settings = normalizeAppearanceSettings(data);
    const font = modal.querySelector("#hs-appearance-font");
    const bg = modal.querySelector("#hs-appearance-bg");
    const text = modal.querySelector("#hs-appearance-text");
    const accent = modal.querySelector("#hs-appearance-accent");
    const wallpaper = modal.querySelector("#hs-appearance-wallpaper-url");
    const opacity = modal.querySelector("#hs-appearance-wallpaper-opacity");
    const borderShape = modal.querySelector("#hs-appearance-border-shape");
    const borderRadius = modal.querySelector("#hs-appearance-border-radius");
    const borderWidth = modal.querySelector("#hs-appearance-border-width");
    const gridWidth = modal.querySelector("#hs-appearance-grid-width");
    const gridTone = modal.querySelector("#hs-appearance-grid-tone");
    const gridDensity = modal.querySelector("#hs-appearance-grid-density");
    const gridHover = modal.querySelector("#hs-appearance-grid-hover");
    if (font instanceof HTMLSelectElement) font.value = settings.fontFamily || APPEARANCE_DEFAULTS.fontFamily;
    if (bg instanceof HTMLInputElement)
      bg.value = normalizeHexColor(settings.bgColor) || (getTheme() === "light" ? "#FFFFFF" : "#0E141D");
    if (text instanceof HTMLInputElement)
      text.value = normalizeHexColor(settings.textColor) || (getTheme() === "light" ? "#0F172A" : "#DCE6F2");
    if (accent instanceof HTMLInputElement)
      accent.value = normalizeHexColor(settings.accentColor) || (getTheme() === "light" ? "#1F5FB4" : "#3A6FAE");
    if (wallpaper instanceof HTMLInputElement) wallpaper.value = String(settings.wallpaperUrl || "");
    if (opacity instanceof HTMLInputElement) {
      const pct = Math.round(
        clampNumber(
          Number(settings.wallpaperOpacity),
          APPEARANCE_WALLPAPER_OPACITY_MIN,
          APPEARANCE_WALLPAPER_OPACITY_MAX
        ) * 100
      );
      opacity.value = String(pct);
    }
    if (borderShape instanceof HTMLSelectElement) borderShape.value = settings.borderShape || APPEARANCE_DEFAULTS.borderShape;
    if (borderRadius instanceof HTMLInputElement) borderRadius.value = String(Math.round(settings.borderRadius || APPEARANCE_BORDER_RADIUS_DEFAULT));
    if (borderWidth instanceof HTMLInputElement) borderWidth.value = String(Math.round(settings.borderWidth || APPEARANCE_BORDER_WIDTH_DEFAULT));
    if (gridTone instanceof HTMLSelectElement)
      gridTone.value = normalizeAppearanceGridTone(settings.dashboardGridTone);
    if (gridDensity instanceof HTMLSelectElement)
      gridDensity.value = normalizeAppearanceGridDensity(settings.dashboardGridDensity);
    if (gridHover instanceof HTMLSelectElement)
      gridHover.value = normalizeAppearanceGridHover(settings.dashboardGridHover);
    if (gridWidth instanceof HTMLInputElement) {
      const widthValue = Number(settings.dashboardGridWidth);
      gridWidth.value =
        Number.isFinite(widthValue) && widthValue >= APPEARANCE_DASHBOARD_GRID_WIDTH_MIN
          ? String(Math.round(widthValue))
          : "0";
    }
    refreshAppearanceLiveLabels(modal);
  }
  /**
   * Objetivo: Coleta e valida dados do formulario de aparencia.
   *
   * Contexto: chamado ao aplicar configuracao visual no modal.
   * Parametros:
   * - modal: entrada usada por esta rotina.
   * Retorno: object|null.
   */
  function collectAppearanceModalSettings(modal) {
    if (!(modal instanceof HTMLElement)) return null;
    const mode = resolveAppearanceThemeMode();
    const base = readAppearanceSettings(mode);
    const font = modal.querySelector("#hs-appearance-font");
    const bg = modal.querySelector("#hs-appearance-bg");
    const text = modal.querySelector("#hs-appearance-text");
    const accent = modal.querySelector("#hs-appearance-accent");
    const wallpaper = modal.querySelector("#hs-appearance-wallpaper-url");
    const opacity = modal.querySelector("#hs-appearance-wallpaper-opacity");
    const borderShape = modal.querySelector("#hs-appearance-border-shape");
    const borderRadius = modal.querySelector("#hs-appearance-border-radius");
    const borderWidth = modal.querySelector("#hs-appearance-border-width");
    const gridWidth = modal.querySelector("#hs-appearance-grid-width");
    const gridTone = modal.querySelector("#hs-appearance-grid-tone");
    const gridDensity = modal.querySelector("#hs-appearance-grid-density");
    const gridHover = modal.querySelector("#hs-appearance-grid-hover");

    const wallpaperInputRaw = wallpaper instanceof HTMLInputElement ? String(wallpaper.value || "").trim() : "";
    const wallpaperUrl = sanitizeWallpaperUrl(wallpaperInputRaw);
    if (wallpaperInputRaw && !wallpaperUrl) {
      toast("Papel de fundo: use URL valida iniciando com http:// ou https://.", "err", 3400);
      return null;
    }

    return normalizeAppearanceSettings({
      ...base,
      fontFamily:
        font instanceof HTMLSelectElement
          ? String(font.value || APPEARANCE_DEFAULTS.fontFamily).trim().toLowerCase()
          : base.fontFamily,
      bgColor: bg instanceof HTMLInputElement ? String(bg.value || "") : base.bgColor,
      textColor: text instanceof HTMLInputElement ? String(text.value || "") : base.textColor,
      accentColor: accent instanceof HTMLInputElement ? String(accent.value || "") : base.accentColor,
      wallpaperUrl,
      wallpaperOpacity:
        opacity instanceof HTMLInputElement
          ? clampNumber(Number(opacity.value || "0") / 100, APPEARANCE_WALLPAPER_OPACITY_MIN, APPEARANCE_WALLPAPER_OPACITY_MAX)
          : base.wallpaperOpacity,
      borderShape:
        borderShape instanceof HTMLSelectElement
          ? String(borderShape.value || APPEARANCE_DEFAULTS.borderShape).trim().toLowerCase()
          : base.borderShape,
      borderRadius:
        borderRadius instanceof HTMLInputElement
          ? Math.round(
              clampNumber(
                Number(borderRadius.value || APPEARANCE_BORDER_RADIUS_DEFAULT),
                APPEARANCE_BORDER_RADIUS_MIN,
                APPEARANCE_BORDER_RADIUS_MAX
              )
            )
          : base.borderRadius,
      borderWidth:
        borderWidth instanceof HTMLInputElement
          ? Math.round(
              clampNumber(
                Number(borderWidth.value || APPEARANCE_BORDER_WIDTH_DEFAULT),
                APPEARANCE_BORDER_WIDTH_MIN,
                APPEARANCE_BORDER_WIDTH_MAX
              )
            )
          : base.borderWidth,
      dashboardGridWidth:
        gridWidth instanceof HTMLInputElement
          ? (() => {
              const raw = Number(gridWidth.value || "0");
              if (!Number.isFinite(raw) || raw < APPEARANCE_DASHBOARD_GRID_WIDTH_MIN) return 0;
              return Math.round(
                clampNumber(
                  raw,
                  APPEARANCE_DASHBOARD_GRID_WIDTH_MIN,
                  APPEARANCE_DASHBOARD_GRID_WIDTH_MAX
                )
              );
            })()
          : base.dashboardGridWidth,
      dashboardGridTone:
        gridTone instanceof HTMLSelectElement
          ? normalizeAppearanceGridTone(gridTone.value)
          : base.dashboardGridTone,
      dashboardGridDensity:
        gridDensity instanceof HTMLSelectElement
          ? normalizeAppearanceGridDensity(gridDensity.value)
          : base.dashboardGridDensity,
      dashboardGridHover:
        gridHover instanceof HTMLSelectElement
          ? normalizeAppearanceGridHover(gridHover.value)
          : base.dashboardGridHover,
    });
  }
  /**
   * Objetivo: Garante modal de configuracao visual (fonte, cores e papel de fundo).
   *
   * Contexto: aberto a partir do menu de configuracoes do dashboard.
   * Parametros: nenhum.
   * Retorno: HTMLElement|null.
   */
  function ensureAppearanceModal() {
    if (hsAppearanceModal && hsAppearanceModal.isConnected) return hsAppearanceModal;
    let modal = document.getElementById("hs-appearance-modal");
    if (!(modal instanceof HTMLElement)) {
      const fontOptions = [
        { value: "default", label: "Padrao (Segoe UI)" },
        { value: "segoe", label: "Segoe UI" },
        { value: "trebuchet", label: "Trebuchet MS" },
        { value: "verdana", label: "Verdana" },
        { value: "lucida", label: "Lucida Sans" },
        { value: "georgia", label: "Georgia" },
        { value: "monospace", label: "Consolas (mono)" },
      ];
      modal = document.createElement("div");
      modal.id = "hs-appearance-modal";
      modal.className = "hs-update-modal hs-appearance-modal";
      modal.innerHTML = `
        <div class="hs-update-modal-backdrop"></div>
        <section class="hs-update-modal-card" role="dialog" aria-modal="true" aria-label="Aparencia da pagina">
          <header class="hs-update-modal-head">
            <span>Aparencia da Pagina</span>
            <button type="button" data-action="close">Fechar</button>
          </header>
          <div class="hs-update-modal-body">
            <p class="hs-update-modal-status">
              Personalize fonte, cores, bordas e grade. As preferencias ficam salvas por tema neste navegador.
            </p>
            <div class="hs-appearance-grid">
              <label class="hs-appearance-field">
                <span>Fonte principal</span>
                <select id="hs-appearance-font">
                  ${fontOptions.map((item) => `<option value="${item.value}">${item.label}</option>`).join("")}
                </select>
              </label>
              <label class="hs-appearance-field">
                <span>Cor de fundo</span>
                <input id="hs-appearance-bg" type="color" />
              </label>
              <label class="hs-appearance-field">
                <span>Cor do texto</span>
                <input id="hs-appearance-text" type="color" />
              </label>
              <label class="hs-appearance-field">
                <span>Cor de destaque</span>
                <input id="hs-appearance-accent" type="color" />
              </label>
              <label class="hs-appearance-field" style="grid-column:span 2;">
                <span>Papel de fundo (URL)</span>
                <input
                  id="hs-appearance-wallpaper-url"
                  type="text"
                  placeholder="https://..."
                  autocomplete="off"
                  spellcheck="false"
                />
              </label>
            </div>
            <div class="hs-appearance-subgrid">
              <label class="hs-appearance-field">
                <span>Formato da borda</span>
                <select id="hs-appearance-border-shape">
                  <option value="rounded">Arredondada</option>
                  <option value="square">Quadrada</option>
                </select>
              </label>
              <label class="hs-appearance-field">
                <span>Arredondamento</span>
                <div class="hs-appearance-inline">
                  <input id="hs-appearance-border-radius" type="range" min="0" max="18" step="1" value="9" />
                  <output id="hs-appearance-border-radius-out">9px</output>
                </div>
              </label>
              <label class="hs-appearance-field">
                <span>Espessura da borda</span>
                <div class="hs-appearance-inline">
                  <input id="hs-appearance-border-width" type="range" min="1" max="4" step="1" value="1" />
                  <output id="hs-appearance-border-width-out">1px</output>
                </div>
              </label>
            </div>
            <section class="hs-appearance-section">
              <div class="hs-appearance-section-head">
                <strong>Grade de consultas</strong>
                <span>Refino leve para dashboard e consulta de requisicoes, mantendo a estrutura atual.</span>
              </div>
              <div class="hs-appearance-subgrid">
                <label class="hs-appearance-field">
                  <span>Estilo da grade</span>
                  <select id="hs-appearance-grid-tone">
                    <option value="soft">Discreta</option>
                    <option value="balanced">Profissional</option>
                    <option value="contrast">Classica</option>
                  </select>
                </label>
                <label class="hs-appearance-field">
                  <span>Densidade das linhas</span>
                  <select id="hs-appearance-grid-density">
                    <option value="comfortable">Confortavel</option>
                    <option value="compact">Compacta</option>
                    <option value="airy">Respirada</option>
                  </select>
                </label>
                <label class="hs-appearance-field">
                  <span>Hover da linha</span>
                  <select id="hs-appearance-grid-hover">
                    <option value="soft">Suave</option>
                    <option value="focus">Destaque</option>
                    <option value="off">Desligado</option>
                  </select>
                </label>
              </div>
            </section>
            <div class="hs-appearance-range-row">
              <span>Intensidade do papel de fundo</span>
              <input id="hs-appearance-wallpaper-opacity" type="range" min="0" max="18" step="1" value="6" />
              <output id="hs-appearance-wallpaper-opacity-out">6%</output>
            </div>
            <div class="hs-appearance-range-row">
              <span>Largura da grade (chamados)</span>
              <input id="hs-appearance-grid-width" type="range" min="0" max="${APPEARANCE_DASHBOARD_GRID_WIDTH_MAX}" step="10" value="0" />
              <output id="hs-appearance-grid-width-out">Auto</output>
            </div>
            <p class="hs-appearance-hint">
              Dica: voce tambem pode redimensionar a grade arrastando as bordas esquerda/direita no dashboard.
            </p>
            <div class="hs-update-modal-actions">
              <button type="button" class="is-main" data-action="apply">Aplicar</button>
              <button type="button" data-action="remove-wallpaper">Remover papel</button>
              <button type="button" data-action="reset">Restaurar padrao</button>
            </div>
          </div>
        </section>
      `;
      document.body.appendChild(modal);
    }
    hsAppearanceModal = modal;
    if (modal.dataset.hsBound === "1") return modal;
    modal.dataset.hsBound = "1";
    modal.querySelector(".hs-update-modal-backdrop")?.addEventListener("click", closeAppearanceModal);
    modal.querySelector('[data-action="close"]')?.addEventListener("click", closeAppearanceModal);
    [
      "#hs-appearance-wallpaper-opacity",
      "#hs-appearance-border-radius",
      "#hs-appearance-border-width",
      "#hs-appearance-grid-width",
      "#hs-appearance-border-shape",
    ].forEach((selector) => {
      modal.querySelector(selector)?.addEventListener("input", () => refreshAppearanceLiveLabels(modal));
      modal.querySelector(selector)?.addEventListener("change", () => refreshAppearanceLiveLabels(modal));
    });
    modal.addEventListener("click", (ev) => {
      const btn = ev.target instanceof HTMLElement ? ev.target.closest("button[data-action]") : null;
      if (!(btn instanceof HTMLButtonElement)) return;
      const action = String(btn.dataset.action || "").trim();
      if (!action) return;
      if (action === "apply") {
        const payload = collectAppearanceModalSettings(modal);
        if (!payload) return;
        writeAppearanceSettings(payload, resolveAppearanceThemeMode());
        applyAppearanceSettings();
        normalizeDashboardTableWidths();
        fillAppearanceModalFields(modal, payload);
        toast("Aparencia aplicada com sucesso.", "ok", 2400);
        return;
      }
      if (action === "remove-wallpaper") {
        const payload = collectAppearanceModalSettings(modal);
        if (!payload) return;
        payload.wallpaperUrl = "";
        writeAppearanceSettings(payload, resolveAppearanceThemeMode());
        applyAppearanceSettings();
        normalizeDashboardTableWidths();
        fillAppearanceModalFields(modal, payload);
        toast("Papel de fundo removido.", "ok", 2200);
        return;
      }
      if (action === "reset") {
        writeAppearanceSettings(APPEARANCE_DEFAULTS, resolveAppearanceThemeMode());
        const fresh = applyAppearanceSettings();
        normalizeDashboardTableWidths();
        fillAppearanceModalFields(modal, fresh);
        toast("Aparencia restaurada para o padrao.", "ok", 2400);
      }
    });
    return modal;
  }
  /**
   * Objetivo: Abre modal de aparencia com valores atuais.
   *
   * Contexto: acionado pelo menu de configuracoes.
   * Parametros: nenhum.
   * Retorno: void.
   */
  function openAppearanceModal() {
    const modal = ensureAppearanceModal();
    if (!(modal instanceof HTMLElement)) return;
    fillAppearanceModalFields(modal, readAppearanceSettings(resolveAppearanceThemeMode()));
    modal.classList.add("open");
  }
  /**
   * Objetivo: Compara versoes no formato numerico separado por ponto.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros:
   * - a: entrada usada por esta rotina.
   * - b: entrada usada por esta rotina.
   * Retorno: number (1 quando a>b, -1 quando a<b, 0 quando iguais).
   * Efeitos colaterais: nenhum.
   */
  function compareVersionTexts(a, b) {
    const pa = String(a || "").match(/\d+/g) || [];
    const pb = String(b || "").match(/\d+/g) || [];
    const len = Math.max(pa.length, pb.length);
    for (let i = 0; i < len; i += 1) {
      const na = parseInt(pa[i] || "0", 10) || 0;
      const nb = parseInt(pb[i] || "0", 10) || 0;
      if (na > nb) return 1;
      if (na < nb) return -1;
    }
    return 0;
  }
  /**
   * Objetivo: Extrai versao de texto de userscript.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros:
   * - content: entrada usada por esta rotina.
   * Retorno: string.
   * Efeitos colaterais: nenhum.
   */
  function extractScriptVersionFromText(content) {
    const match = String(content || "").match(/^[ \t]*\/\/\s*@version\s+([^\s]+)\s*$/im);
    return String(match?.[1] || "").trim();
  }
  /**
   * Objetivo: Formata data/hora curta para exibicao no badge de commit.
   *
   * Contexto: usado no cabecalho para mostrar ultimo commit do projeto.
   * Parametros:
   * - value: data ISO.
   * Retorno: string.
   */
  function formatShortDateTime(value) {
    const d = new Date(value);
    if (!Number.isFinite(d.getTime())) return "";
    const p = (n) => String(n).padStart(2, "0");
    return `${p(d.getDate())}/${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}`;
  }
  /**
   * Objetivo: Normaliza metadados do ultimo commit para uso no header.
   *
   * Contexto: garante payload consistente entre cache local e resposta da API.
   * Parametros:
   * - source: objeto parcial.
   * Retorno: {sha,shaShort,date,dateShort,url,message,fetchedAt}|null.
   */
  function normalizeLatestCommitMeta(source) {
    const sha = String(source?.sha || "").trim();
    const date = String(source?.date || "").trim();
    const url = String(source?.url || "").trim();
    const message = String(source?.message || "").trim();
    const fetchedAt = Number(source?.fetchedAt || Date.now());
    if (!sha) return null;
    const shaShort = sha.slice(0, 7);
    const dateShort = formatShortDateTime(date);
    return { sha, shaShort, date, dateShort, url, message, fetchedAt };
  }
  /**
   * Objetivo: Le cache local do ultimo commit do repositorio.
   *
   * Contexto: evita bater na API do GitHub a cada mutacao de DOM.
   * Parametros: nenhum.
   * Retorno: object|null.
   */
  function readCachedLatestCommitMeta() {
    try {
      const at = Number(localStorage.getItem(LATEST_COMMIT_META_CACHE_AT_LS_KEY) || "0");
      if (!Number.isFinite(at) || at <= 0) return null;
      const raw = String(localStorage.getItem(LATEST_COMMIT_META_CACHE_JSON_LS_KEY) || "").trim();
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const normalized = normalizeLatestCommitMeta({ ...parsed, fetchedAt: at });
      if (!normalized) return null;
      return normalized;
    } catch {
      return null;
    }
  }
  /**
   * Objetivo: Persiste metadados do ultimo commit em cache local.
   *
   * Contexto: utilizado por fetchLatestMainCommitMeta e fixLogo.
   * Parametros:
   * - meta: objeto normalizado.
   * Retorno: object|null.
   */
  function persistLatestCommitMeta(meta) {
    const normalized = normalizeLatestCommitMeta(meta);
    if (!normalized) return null;
    hsLatestCommitMeta = normalized;
    try {
      localStorage.setItem(
        LATEST_COMMIT_META_CACHE_JSON_LS_KEY,
        JSON.stringify({
          sha: normalized.sha,
          date: normalized.date,
          url: normalized.url,
          message: normalized.message,
        })
      );
      localStorage.setItem(LATEST_COMMIT_META_CACHE_AT_LS_KEY, String(normalized.fetchedAt));
    } catch {}
    return normalized;
  }
  /**
   * Objetivo: Busca o ultimo commit da branch main com cache local.
   *
   * Contexto: alimenta o badge profissional de versao no cabecalho.
   * Parametros:
   * - force: quando true ignora janela de cache e refaz a consulta.
   * Retorno: Promise<object|null>.
   */
  async function fetchLatestMainCommitMeta(force = false) {
    const now = Date.now();
    if (!force && hsLatestCommitMeta?.fetchedAt && now - hsLatestCommitMeta.fetchedAt < LATEST_COMMIT_META_CACHE_MS) {
      return hsLatestCommitMeta;
    }
    if (!force) {
      const cached = readCachedLatestCommitMeta();
      if (cached?.fetchedAt && now - cached.fetchedAt < LATEST_COMMIT_META_CACHE_MS) {
        hsLatestCommitMeta = cached;
        return cached;
      }
    }
    if (hsLatestCommitMetaPromise) return hsLatestCommitMetaPromise;

    hsLatestCommitMetaPromise = (async () => {
      try {
        const resp = await fetch(LATEST_MAIN_COMMIT_API_URL, {
          method: "GET",
          cache: "no-store",
          mode: "cors",
          credentials: "omit",
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json().catch(() => ({}));
        const meta = normalizeLatestCommitMeta({
          sha: String(data?.sha || "").trim(),
          date: String(data?.commit?.author?.date || data?.commit?.committer?.date || "").trim(),
          url: String(data?.html_url || "").trim(),
          message: String(data?.commit?.message || "").trim().split("\n")[0],
          fetchedAt: Date.now(),
        });
        if (!meta) throw new Error("Commit sem SHA valido.");
        return persistLatestCommitMeta(meta);
      } catch {
        const fallback = hsLatestCommitMeta || readCachedLatestCommitMeta();
        if (fallback) {
          hsLatestCommitMeta = fallback;
          return fallback;
        }
        return null;
      }
    })();

    try {
      return await hsLatestCommitMetaPromise;
    } finally {
      hsLatestCommitMetaPromise = null;
    }
  }
  /**
   * Objetivo: Le ultimo resultado de verificacao de atualizacao em cache local.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: object|null.
   * Efeitos colaterais: leitura de localStorage.
   */
  function readCachedUpdateCheckResult() {
    try {
      const checkedAt = parseInt(localStorage.getItem(UPDATE_CHECK_LAST_AT_LS_KEY) || "0", 10);
      if (!Number.isFinite(checkedAt) || checkedAt <= 0) return null;
      const remoteVersion = String(localStorage.getItem(UPDATE_CHECK_REMOTE_VERSION_LS_KEY) || "").trim();
      const remoteUrl = String(localStorage.getItem(UPDATE_CHECK_REMOTE_URL_LS_KEY) || "").trim();
      const hasUpdateComputed = remoteVersion ? compareVersionTexts(remoteVersion, SCRIPT_VERSION) > 0 : false;
      const hasUpdate = hasUpdateComputed;
      const mandatoryStored = parseBooleanLike(localStorage.getItem(UPDATE_CHECK_MANDATORY_LS_KEY));
      const mandatoryVersion = String(localStorage.getItem(UPDATE_CHECK_MANDATORY_VERSION_LS_KEY) || "").trim();
      const mandatoryReason = String(localStorage.getItem(UPDATE_CHECK_MANDATORY_REASON_LS_KEY) || "").trim();
      const mandatoryUpdate = hasUpdate && mandatoryStored;
      return {
        ok: true,
        checkedAt,
        remoteVersion,
        remoteUrl,
        hasUpdate,
        mandatoryUpdate,
        mandatoryVersion: mandatoryUpdate ? mandatoryVersion || remoteVersion : "",
        mandatoryReason: mandatoryUpdate ? mandatoryReason : "",
      };
    } catch {
      return null;
    }
  }
  /**
   * Objetivo: Persiste resultado da verificacao de atualizacao no cache local.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros:
   * - result: entrada usada por esta rotina.
   * Retorno: object.
   * Efeitos colaterais: escrita em localStorage.
   */
  function persistUpdateCheckResult(result) {
    const remoteVersion = String(result?.remoteVersion || "").trim();
    const hasUpdateComputed = remoteVersion ? compareVersionTexts(remoteVersion, SCRIPT_VERSION) > 0 : false;
    const mandatoryUpdate = hasUpdateComputed && (parseBooleanLike(result?.mandatoryUpdate) || parseBooleanLike(result?.mandatory));
    const mandatoryVersion = mandatoryUpdate
      ? String(result?.mandatoryVersion || remoteVersion).trim() || remoteVersion
      : "";
    const mandatoryReason = mandatoryUpdate ? String(result?.mandatoryReason || "").trim() : "";
    const next = {
      ok: !!result?.ok,
      checkedAt: Number(result?.checkedAt || Date.now()),
      remoteVersion,
      remoteUrl: String(result?.remoteUrl || "").trim(),
      hasUpdate: hasUpdateComputed,
      mandatoryUpdate,
      mandatoryVersion,
      mandatoryReason,
      error: String(result?.error || "").trim(),
    };
    hsScriptUpdateLastResult = next;
    try {
      localStorage.setItem(UPDATE_CHECK_LAST_AT_LS_KEY, String(next.checkedAt));
      localStorage.setItem(UPDATE_CHECK_REMOTE_VERSION_LS_KEY, next.remoteVersion);
      localStorage.setItem(UPDATE_CHECK_REMOTE_URL_LS_KEY, next.remoteUrl);
      localStorage.setItem(UPDATE_CHECK_HAS_UPDATE_LS_KEY, next.hasUpdate ? "1" : "0");
      localStorage.setItem(UPDATE_CHECK_MANDATORY_LS_KEY, next.mandatoryUpdate ? "1" : "0");
      localStorage.setItem(UPDATE_CHECK_MANDATORY_VERSION_LS_KEY, next.mandatoryVersion || "");
      localStorage.setItem(UPDATE_CHECK_MANDATORY_REASON_LS_KEY, next.mandatoryReason || "");
    } catch {}
    return next;
  }
  /**
   * Objetivo: Verifica no GitHub se existe versao mais recente do userscript.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros:
   * - force: entrada usada por esta rotina.
   * Retorno: Promise<object>.
   * Efeitos colaterais: leitura/escrita de cache local e chamadas de rede.
   */
  async function checkScriptUpdateAvailability(force = false) {
    const now = Date.now();
    const cached = hsScriptUpdateLastResult || readCachedUpdateCheckResult();
    if (!force && cached?.checkedAt && now - cached.checkedAt < UPDATE_CHECK_INTERVAL_MS) {
      hsScriptUpdateLastResult = cached;
      return cached;
    }
    if (hsScriptUpdateCheckPromise) return hsScriptUpdateCheckPromise;

    hsScriptUpdateCheckPromise = (async () => {
      let lastError = "";
      const urlsToTry = [];
      try {
        const latestCommitResponse = await fetch(LATEST_MAIN_COMMIT_API_URL, {
          method: "GET",
          cache: "no-store",
          mode: "cors",
          credentials: "omit",
        });
        if (latestCommitResponse.ok) {
          const latestCommit = await latestCommitResponse.json().catch(() => ({}));
          const sha = String(latestCommit?.sha || "").trim();
          if (sha) {
            urlsToTry.push(`https://raw.githubusercontent.com/KauanHeadsoft/script_deskhelp/${sha}/.user.js`);
          }
        }
      } catch (err) {
        lastError = String(err?.message || err || "");
      }
      UPDATE_SCRIPT_CANDIDATE_URLS.forEach((url) => {
        const u = String(url || "").trim();
        if (!u) return;
        if (!urlsToTry.includes(u)) urlsToTry.push(u);
      });
      if (!urlsToTry.includes(MANUAL_UPDATE_SOURCE_URL)) urlsToTry.push(MANUAL_UPDATE_SOURCE_URL);

      let bestRemote = null;
      for (const url of urlsToTry) {
        try {
          const fetchUrl = buildNoCacheUserscriptUrl(url);
          const response = await fetch(fetchUrl || url, {
            method: "GET",
            cache: "no-store",
            mode: "cors",
            credentials: "omit",
          });
          if (!response.ok) {
            lastError = `HTTP ${response.status} em ${url}`;
            continue;
          }
          const content = await response.text();
          const remoteVersion = extractScriptVersionFromText(content);
          if (!remoteVersion) {
            lastError = `Versao nao encontrada em ${url}`;
            continue;
          }
          if (!bestRemote || compareVersionTexts(remoteVersion, bestRemote.remoteVersion) > 0) {
            bestRemote = { remoteVersion, remoteUrl: String(url || "").trim() || MANUAL_UPDATE_SOURCE_URL };
          }
        } catch (err) {
          lastError = String(err?.message || err || "");
        }
      }

      if (bestRemote) {
        const hasUpdate = compareVersionTexts(bestRemote.remoteVersion, SCRIPT_VERSION) > 0;
        let mandatoryUpdate = false;
        let mandatoryVersion = "";
        let mandatoryReason = "";
        if (hasUpdate) {
          try {
            const logPayload = await fetchUpdatesLog(false);
            const logList = normalizeUpdatesLogList(logPayload?.list || []);
            const mandatoryEntry = findMandatoryPendingUpdate(logList, bestRemote.remoteVersion, SCRIPT_VERSION);
            if (mandatoryEntry) {
              mandatoryUpdate = true;
              mandatoryVersion = String(mandatoryEntry.version || bestRemote.remoteVersion).trim() || bestRemote.remoteVersion;
              mandatoryReason = buildMandatoryUpdateReason(mandatoryEntry);
            }
          } catch (_err) {}
        }
        return persistUpdateCheckResult({
          ok: true,
          checkedAt: Date.now(),
          remoteVersion: bestRemote.remoteVersion,
          remoteUrl: bestRemote.remoteUrl,
          hasUpdate,
          mandatoryUpdate,
          mandatoryVersion,
          mandatoryReason,
        });
      }

      if (cached?.remoteVersion) {
        return persistUpdateCheckResult({
          ...cached,
          ok: false,
          checkedAt: Date.now(),
          error: lastError || "Nao foi possivel verificar atualizacoes agora.",
        });
      }

      return persistUpdateCheckResult({
        ok: false,
        checkedAt: Date.now(),
        remoteVersion: "",
        remoteUrl: SCRIPT_REPO_URL,
        hasUpdate: false,
        error: lastError || "Nao foi possivel verificar atualizacoes agora.",
      });
    })();

    try {
      return await hsScriptUpdateCheckPromise;
    } finally {
      hsScriptUpdateCheckPromise = null;
    }
  }
  /**
   * Objetivo: Abre pagina de atualizacao do script.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros:
   * - preferredUrl: entrada usada por esta rotina.
   * Retorno: void.
   * Efeitos colaterais: abre nova aba no navegador.
   */
  function openScriptUpdatePage(preferredUrl = "") {
    const cached = hsScriptUpdateLastResult || readCachedUpdateCheckResult();
    const target =
      String(preferredUrl || "").trim() ||
      String(cached?.remoteUrl || "").trim() ||
      String(MANUAL_UPDATE_SOURCE_URL || "").trim() ||
      SCRIPT_REPO_URL;
    const safeTarget = String(target || "").trim();
    const isUserscript = /\.user\.js(?:[?#].*)?$/i.test(safeTarget);
    if (isUserscript) {
      const directUrl = buildNoCacheUserscriptUrl(safeTarget);
      window.open(directUrl, "_blank", "noopener");
      return;
    }
    const bridged = safeTarget ? `${UPDATE_INSTALL_BRIDGE_BASE_URL}${encodeURIComponent(safeTarget)}` : "";
    window.open(bridged || safeTarget || SCRIPT_REPO_URL, "_blank", "noopener");
  }
  /**
   * Objetivo: Adiciona cache-buster na URL do userscript para evitar leitura antiga.
   *
   * Contexto: Utilizado nos fluxos de atualizar/abrir codigo manual.
   * Parametros:
   * - url: URL base do userscript.
   * Retorno: string.
   * Efeitos colaterais: nenhum.
   */
  function buildNoCacheUserscriptUrl(url) {
    const raw = String(url || "").trim();
    if (!raw) return "";
    try {
      const u = new URL(raw, location.href);
      u.searchParams.set("hs_update", String(Date.now()));
      return u.toString();
    } catch {
      return raw;
    }
  }
  /**
   * Objetivo: Busca o codigo mais recente do userscript para atualizacao manual.
   *
   * Contexto: Base do botao de copiar codigo para colar no Tampermonkey.
   * Parametros: nenhum.
   * Retorno: Promise<{url:string, content:string, version:string}>.
   * Efeitos colaterais: chamadas de rede.
   */
  async function fetchLatestUserscriptSource() {
    const candidates = [];
    const pushCandidate = (value) => {
      const next = String(value || "").trim();
      if (!next) return;
      if (!candidates.includes(next)) candidates.push(next);
    };
    pushCandidate(MANUAL_UPDATE_SOURCE_URL);
    try {
      const latestCommitResponse = await fetch(LATEST_MAIN_COMMIT_API_URL, {
        method: "GET",
        cache: "no-store",
        mode: "cors",
        credentials: "omit",
      });
      if (latestCommitResponse.ok) {
        const latestCommit = await latestCommitResponse.json().catch(() => ({}));
        const sha = String(latestCommit?.sha || "").trim();
        if (sha) pushCandidate(`https://raw.githubusercontent.com/KauanHeadsoft/script_deskhelp/${sha}/.user.js`);
      }
    } catch {}
    try {
      const check = await checkScriptUpdateAvailability(true);
      const checkedUrl = String(check?.remoteUrl || "").trim();
      if (checkedUrl) pushCandidate(checkedUrl);
    } catch {}
    UPDATE_SCRIPT_CANDIDATE_URLS.forEach((u) => {
      const item = String(u || "").trim();
      if (item) pushCandidate(item);
    });

    const tried = new Set();
    let firstValid = null;
    let bestByVersion = null;
    for (const baseUrl of candidates) {
      const clean = String(baseUrl || "").trim();
      if (!clean || tried.has(clean)) continue;
      tried.add(clean);

      const fetchUrl = buildNoCacheUserscriptUrl(clean);
      try {
        const resp = await fetch(fetchUrl, {
          method: "GET",
          cache: "no-store",
          mode: "cors",
          credentials: "omit",
        });
        if (!resp.ok) continue;
        const content = await resp.text();
        if (!/==UserScript==/i.test(content)) continue;
        const version = String(extractScriptVersionFromText(content) || "").trim();
        const payload = { url: clean, content, version };
        if (!firstValid) firstValid = payload;
        if (!version) continue;
        if (!bestByVersion || !bestByVersion.version || compareVersionTexts(version, bestByVersion.version) > 0) {
          bestByVersion = payload;
        }
      } catch {}
    }
    if (bestByVersion) return bestByVersion;
    if (firstValid) return firstValid;
    throw new Error("Nao foi possivel carregar o codigo remoto do script.");
  }
  /**
   * Objetivo: Copia texto para clipboard com fallback para execCommand.
   *
   * Contexto: Utilizado no modal de atualizacao manual.
   * Parametros:
   * - text: conteudo a copiar.
   * Retorno: Promise<boolean>.
   * Efeitos colaterais: acesso ao clipboard.
   */
  async function copyTextToClipboard(text) {
    const raw = String(text || "");
    if (!raw) return false;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(raw);
        return true;
      }
    } catch {}
    try {
      const ta = document.createElement("textarea");
      ta.value = raw;
      ta.setAttribute("readonly", "readonly");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      ta.style.top = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      ta.setSelectionRange(0, ta.value.length);
      const ok = !!document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
  /**
   * Objetivo: Gera nome de arquivo seguro para download local do userscript.
   *
   * Contexto: usado no botao "Baixar .user.js".
   * Parametros:
   * - version: versao remota detectada.
   * Retorno: string.
   */
  function buildUserscriptDownloadFileName(version) {
    const v = String(version || "latest").trim().replace(/[^\w.-]+/g, "_");
    return `headsoft-suporte-modern-ui-v${v}.user.js`;
  }
  /**
   * Objetivo: Baixa o userscript remoto como arquivo local.
   *
   * Contexto: fallback simples quando instalacao direta falhar.
   * Parametros:
   * - source: objeto retornado por fetchLatestUserscriptSource.
   * Retorno: boolean.
   * Efeitos colaterais: dispara download no navegador.
   */
  function downloadUserscriptSource(source) {
    const content = String(source?.content || "");
    if (!content) return false;
    try {
      const blob = new Blob([content], { type: "application/javascript;charset=utf-8" });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = buildUserscriptDownloadFileName(source?.version);
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
      return true;
    } catch {
      return false;
    }
  }
  /**
   * Objetivo: Normaliza payload remoto do userscript para o modal manual.
   *
   * Contexto: garante URL, conteudo e versao sincronizados com o codigo remoto.
   * Parametros:
   * - source: payload parcial.
   * Retorno: {url:string, content:string, version:string}.
   */
  function normalizeManualUpdateSource(source) {
    const url = String(source?.url || MANUAL_UPDATE_SOURCE_URL).trim() || MANUAL_UPDATE_SOURCE_URL;
    const content = String(source?.content || "");
    const versionRaw = String(source?.version || "").trim();
    const version = versionRaw || extractScriptVersionFromText(content);
    return { url, content, version: String(version || "").trim() };
  }
  /**
   * Objetivo: Monta texto de status do modal manual com versao dinamica.
   *
   * Contexto: evita escrita manual de versao em toda release.
   * Parametros:
   * - version: versao remota detectada.
   * - options: flags de obrigatoriedade da atualizacao.
   * Retorno: string.
   */
  function buildManualUpdateStatusText(version, options = {}) {
    const v = String(version || "").trim().replace(/^v/i, "");
    const resolvedVersion = v ? `v${v}` : "v?";
    const mandatory = parseBooleanLike(options?.mandatory);
    const reason = String(options?.mandatoryReason || "").trim();
    if (mandatory) {
      const reasonText = reason || "Correcao de erro obrigatoria para evitar falhas no chamado.";
      return `ATUALIZACAO OBRIGATORIA detectada (${resolvedVersion}). ${reasonText} Atualize agora em \"Instalar direto\".`;
    }
    return `Versao remota detectada: ${resolvedVersion} Codigo ja foi copiado para a area de transferencia. Se instalar direto falhar, use: Baixar .user.js ou Mostrar codigo.`;
  }
  /**
   * Objetivo: Fecha modal de atualizacao manual.
   *
   * Contexto: reutilizado por backdrop, botao fechar e tecla ESC.
   * Parametros:
   * - force: quando true ignora trava de obrigatoriedade.
   * Retorno: void.
   */
  function closeManualUpdateModal(force = false) {
    if (!hsManualUpdateModal) hsManualUpdateModal = document.getElementById("hs-update-modal");
    if (!(hsManualUpdateModal instanceof HTMLElement)) return;
    const mandatoryLock = hsManualUpdateModal.dataset.hsMandatory === "1";
    if (!force && mandatoryLock) {
      toast("Atualizacao obrigatoria pendente. Instale a correcao para liberar.", "err", 3200);
      return;
    }
    hsManualUpdateModal.classList.remove("open");
  }
  /**
   * Objetivo: Cria modal de atualizacao manual com acoes de copiar/baixar/abrir.
   *
   * Contexto: evita alert longo e melhora UX do fluxo manual.
   * Parametros: nenhum.
   * Retorno: HTMLElement|null.
   * Efeitos colaterais: injeta DOM e binds de evento idempotentes.
   */
  function ensureManualUpdateModal() {
    if (hsManualUpdateModal && hsManualUpdateModal.isConnected) return hsManualUpdateModal;
    let modal = document.getElementById("hs-update-modal");
    if (!(modal instanceof HTMLElement)) {
      modal = document.createElement("div");
      modal.id = "hs-update-modal";
      modal.className = "hs-update-modal";
      modal.innerHTML = `
        <div class="hs-update-modal-backdrop"></div>
        <section class="hs-update-modal-card" role="dialog" aria-modal="true" aria-label="Atualizacao manual do script">
          <header class="hs-update-modal-head">
            <span>Atualizacao Manual do Script</span>
            <button type="button" data-action="close">Fechar</button>
          </header>
          <div class="hs-update-modal-body">
            <p class="hs-update-modal-status"></p>
            <div class="hs-update-modal-url-wrap">
              <input type="text" class="hs-update-modal-url" readonly />
              <button type="button" data-action="copy-link">Copiar link</button>
            </div>
            <div class="hs-update-modal-actions">
              <button type="button" class="is-main" data-action="copy-code">Copiar codigo</button>
              <button type="button" data-action="download">Baixar .user.js</button>
              <button type="button" data-action="install">Instalar direto</button>
              <button type="button" data-action="open-raw">Abrir raw</button>
              <button type="button" data-action="open-github">Abrir GitHub</button>
            </div>
            <div class="hs-update-modal-code">
              <details class="hs-update-modal-code-details">
                <summary>Mostrar codigo (fallback manual)</summary>
                <div class="hs-update-modal-code-tools">
                  <button type="button" data-action="select-all-code">Selecionar tudo (Ctrl+A)</button>
                </div>
                <textarea class="hs-update-modal-code-text" readonly></textarea>
              </details>
            </div>
          </div>
        </section>
      `;
      document.body.appendChild(modal);
    }
    hsManualUpdateModal = modal;
    if (modal.dataset.hsBound === "1") return modal;
    modal.dataset.hsBound = "1";

    modal.querySelector(".hs-update-modal-backdrop")?.addEventListener("click", closeManualUpdateModal);
    modal.querySelector('[data-action="close"]')?.addEventListener("click", closeManualUpdateModal);
    modal.addEventListener("click", async (ev) => {
      const btn = ev.target instanceof HTMLElement ? ev.target.closest("button[data-action]") : null;
      if (!(btn instanceof HTMLButtonElement)) return;
      const action = String(btn.dataset.action || "").trim();
      const payload = hsManualUpdatePayload || {};
      const scriptUrl = String(payload.url || MANUAL_UPDATE_SOURCE_URL).trim();
      const noCacheUrl = buildNoCacheUserscriptUrl(scriptUrl || MANUAL_UPDATE_SOURCE_URL);

      if (action === "select-all-code") {
        const detailsEl = modal.querySelector(".hs-update-modal-code-details");
        const codeTa = modal.querySelector(".hs-update-modal-code-text");
        if (detailsEl instanceof HTMLDetailsElement) detailsEl.open = true;
        if (codeTa instanceof HTMLTextAreaElement) {
          if (!codeTa.value) codeTa.value = String(payload.content || "");
          codeTa.focus();
          codeTa.select();
          codeTa.setSelectionRange(0, codeTa.value.length);
        }
        return;
      }
      if (action === "copy-code") {
        const ok = await copyTextToClipboard(String(payload.content || ""));
        if (ok) {
          hsManualUpdatePayload = { ...payload, copied: true };
          const statusEl = modal.querySelector(".hs-update-modal-status");
          if (statusEl instanceof HTMLElement) {
            statusEl.textContent = buildManualUpdateStatusText(
              String(hsManualUpdatePayload.version || ""),
              hsManualUpdatePayload
            );
          }
        }
        toast(ok ? "Codigo copiado." : "Falha ao copiar codigo.", ok ? "ok" : "err", 2600);
        return;
      }
      if (action === "copy-link") {
        const link = String(scriptUrl || MANUAL_UPDATE_SOURCE_URL).trim();
        const ok = await copyTextToClipboard(link);
        toast(ok ? "Link copiado." : "Falha ao copiar link.", ok ? "ok" : "err", 2400);
        return;
      }
      if (action === "download") {
        const ok = downloadUserscriptSource(payload);
        if (ok) toast("Download iniciado.", "ok", 2200);
        else {
          toast("Nao foi possivel baixar agora; abrindo raw.", "info", 2600);
          window.open(noCacheUrl || MANUAL_UPDATE_GITHUB_RAW_URL, "_blank", "noopener");
        }
        return;
      }
      if (action === "install") {
        openScriptUpdatePage(scriptUrl || MANUAL_UPDATE_SOURCE_URL);
        return;
      }
      if (action === "open-raw") {
        window.open(noCacheUrl || MANUAL_UPDATE_GITHUB_RAW_URL, "_blank", "noopener");
        return;
      }
      if (action === "open-github") {
        window.open(MANUAL_UPDATE_GITHUB_FILE_URL, "_blank", "noopener");
      }
    });

    const details = modal.querySelector(".hs-update-modal-code-details");
    const ta = modal.querySelector(".hs-update-modal-code-text");
    if (details instanceof HTMLDetailsElement && ta instanceof HTMLTextAreaElement) {
      details.addEventListener("toggle", async () => {
        if (!details.open) return;
        if (details.dataset.loading === "1") return;
        if (details.dataset.loaded === "1") return;
        details.dataset.loading = "1";
        ta.value = String(hsManualUpdatePayload?.content || "").trim() || "Carregando codigo remoto do GitHub...";
        try {
          const fresh = normalizeManualUpdateSource(await fetchLatestUserscriptSource());
          if (fresh.content) {
            hsManualUpdatePayload = {
              ...(hsManualUpdatePayload || {}),
              ...fresh,
            };
            ta.value = String(fresh.content || "");
            const urlInput = modal.querySelector(".hs-update-modal-url");
            if (urlInput instanceof HTMLInputElement) {
              urlInput.value = String(fresh.url || MANUAL_UPDATE_SOURCE_URL).trim() || MANUAL_UPDATE_SOURCE_URL;
            }
            const statusEl = modal.querySelector(".hs-update-modal-status");
            if (statusEl instanceof HTMLElement) {
              statusEl.textContent = buildManualUpdateStatusText(
                String(hsManualUpdatePayload.version || ""),
                hsManualUpdatePayload
              );
            }
          }
        } catch {
          ta.value = String(hsManualUpdatePayload?.content || "");
        } finally {
          details.dataset.loaded = "1";
          delete details.dataset.loading;
        }
      });
      ta.addEventListener(
        "keydown",
        (ev) => {
          if ((ev.ctrlKey || ev.metaKey) && String(ev.key || "").toLowerCase() === "a") {
            ev.preventDefault();
            ta.select();
            ta.setSelectionRange(0, ta.value.length);
          }
        },
        true
      );
    }

    if (document.documentElement.dataset.hsUpdateModalEscBound !== "1") {
      document.documentElement.dataset.hsUpdateModalEscBound = "1";
      document.addEventListener(
        "keydown",
        (ev) => {
          if (ev.key !== "Escape") return;
          closeManualUpdateModal();
          closeUpdatesLogModal();
          closeImagePreviewModal();
        },
        true
      );
    }
    return modal;
  }
  /**
   * Objetivo: Preenche e exibe modal de atualizacao manual.
   *
   * Contexto: mostra opcoes praticas para atualizar sem depender de prompt/alert.
   * Parametros:
   * - source: objeto do userscript remoto.
   * - copied: informa se copia automatica inicial funcionou.
   * - options: define se o fluxo e obrigatorio e qual motivo exibir.
   * Retorno: void.
   */
  function showManualUpdateModal(source, copied = false, options = {}) {
    const modal = ensureManualUpdateModal();
    if (!(modal instanceof HTMLElement)) return;
    const normalized = normalizeManualUpdateSource(source);
    const mandatory = parseBooleanLike(options?.mandatory);
    const mandatoryReason = String(options?.mandatoryReason || "").trim();
    const mandatoryVersion = String(options?.mandatoryVersion || normalized.version || "").trim();
    hsManualUpdatePayload = {
      ...normalized,
      copied: !!copied,
      mandatory,
      mandatoryReason,
      mandatoryVersion,
    };

    const statusEl = modal.querySelector(".hs-update-modal-status");
    const urlInput = modal.querySelector(".hs-update-modal-url");
    const details = modal.querySelector(".hs-update-modal-code-details");
    const ta = modal.querySelector(".hs-update-modal-code-text");
    modal.dataset.hsMandatory = mandatory ? "1" : "0";
    modal.classList.toggle("hs-update-modal-mandatory", mandatory);
    modal
      .querySelectorAll('[data-action="close"]')
      .forEach((btn) => btn.classList.toggle("hs-force-hide", mandatory));
    if (statusEl instanceof HTMLElement) {
      statusEl.textContent = buildManualUpdateStatusText(
        String(hsManualUpdatePayload.version || ""),
        hsManualUpdatePayload
      );
    }
    if (urlInput instanceof HTMLInputElement) {
      urlInput.value = String(hsManualUpdatePayload.url || MANUAL_UPDATE_SOURCE_URL).trim() || MANUAL_UPDATE_SOURCE_URL;
    }
    if (details instanceof HTMLDetailsElement) {
      details.open = false;
      details.dataset.loaded = "0";
      delete details.dataset.loading;
    }
    if (ta instanceof HTMLTextAreaElement) ta.value = "";

    modal.classList.add("open");
  }
  /**
   * Objetivo: Facilita atualizacao manual (modal com copiar/baixar/abrir).
   *
   * Contexto: Fluxo alternativo quando o install automatico do Tampermonkey falha.
   * Parametros:
   * - options: metadados de obrigatoriedade para o modal.
   * Retorno: Promise<void>.
   * Efeitos colaterais: chamadas de rede, clipboard, download e abertura de nova aba.
   */
  async function openManualUpdateGuide(options = {}) {
    const source = await fetchLatestUserscriptSource();
    const copied = await copyTextToClipboard(String(source.content || ""));
    showManualUpdateModal(source, copied, options);
  }
  /**
   * Objetivo: Le ultima versao remota ja notificada em popup.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: string.
   * Efeitos colaterais: leitura de localStorage.
   */
  function isMandatoryUpdateResult(result) {
    const hasUpdate = !!result?.hasUpdate && !!String(result?.remoteVersion || "").trim();
    if (!hasUpdate) return false;
    if (parseBooleanLike(result?.mandatoryUpdate)) return true;
    const reason = norm(String(result?.mandatoryReason || ""));
    if (!reason) return false;
    return /(obrigatori|correcao|erro|bug|hotfix|critic|falha)/.test(reason);
  }
  /**
   * Objetivo: Dispara fluxo de atualizacao obrigatoria (modal + codigo imediato).
   *
   * Contexto: aplicado quando release de correcao obrigatoria estiver pendente.
   * Parametros:
   * - result: payload do checker de atualizacao.
   * Retorno: void.
   */
  function showMandatoryUpdatePrompt(result) {
    const remoteVersion = String(result?.remoteVersion || "").trim();
    if (!remoteVersion) return;
    if (hsMandatoryUpdatePromptVersion === remoteVersion) return;
    hsMandatoryUpdatePromptVersion = remoteVersion;

    const mandatoryVersion = String(result?.mandatoryVersion || remoteVersion).trim() || remoteVersion;
    const mandatoryReason = String(result?.mandatoryReason || "").trim();
    setTimeout(() => {
      showRecentUpdatesDialog({
        forceRefresh: true,
        remoteVersion,
        remoteUrl: String(result?.remoteUrl || ""),
        highlightVersion: mandatoryVersion,
        checkedAt: Number(result?.checkedAt || Date.now()),
        mandatoryUpdate: true,
        mandatoryVersion,
        mandatoryReason,
      }).catch(() => {});

      openManualUpdateGuide({
        mandatory: true,
        mandatoryVersion,
        mandatoryReason:
          mandatoryReason || "Correcao de erro obrigatoria para evitar falhas no envio/atendimento.",
      }).catch(() => {
        toast(
          `Atualizacao obrigatoria v${remoteVersion} detectada. Abrindo pagina de instalacao...`,
          "err",
          4200
        );
        openScriptUpdatePage(String(result?.remoteUrl || ""));
      });
    }, 120);
  }
  /**
   * Objetivo: Dispara popup automatico apenas para update obrigatorio de correcao.
   *
   * Contexto: releases rotineiras nao devem abrir modal automaticamente.
   * Parametros:
   * - result: entrada usada por esta rotina.
   * Retorno: void.
   * Efeitos colaterais: abre modal forcado somente em correcao obrigatoria.
   */
  function showUpdatePopupOnce(result) {
    const hasUpdate = !!result?.hasUpdate && !!String(result?.remoteVersion || "").trim();
    if (!hasUpdate) return;
    const remoteVersion = String(result.remoteVersion || "").trim();
    if (!remoteVersion) return;
    if (!isMandatoryUpdateResult(result)) return;
    showMandatoryUpdatePrompt(result);
  }
  /**
   * Objetivo: Dispara verificacao global e alerta automatico so para correcao obrigatoria.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: void.
   * Efeitos colaterais: consulta remota e popup apenas em update obrigatorio.
   */
  function ensureGlobalUpdateNotification() {
    const root = document.documentElement;
    if (!(root instanceof HTMLElement)) return;
    if (root.dataset.hsGlobalUpdateCheckStarted === "1") return;
    root.dataset.hsGlobalUpdateCheckStarted = "1";

    checkScriptUpdateAvailability(false)
      .then((result) => showUpdatePopupOnce(result))
      .catch(() => {});
  }
  /**
   * Objetivo: Le cache local do catalogo de versoes.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: object.
   * Efeitos colaterais: leitura de localStorage.
   */
  function readVersionCatalogCache() {
    try {
      const at = parseInt(localStorage.getItem(VERSION_CATALOG_CACHE_AT_LS_KEY) || "0", 10);
      const raw = String(localStorage.getItem(VERSION_CATALOG_CACHE_LS_KEY) || "").trim();
      const list = JSON.parse(raw);
      if (!Array.isArray(list)) return { at: 0, list: [] };
      return { at: Number.isFinite(at) ? at : 0, list };
    } catch {
      return { at: 0, list: [] };
    }
  }
  /**
   * Objetivo: Persiste cache local do catalogo de versoes.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros:
   * - list: entrada usada por esta rotina.
   * Retorno: void.
   * Efeitos colaterais: escrita em localStorage.
   */
  function persistVersionCatalogCache(list) {
    try {
      localStorage.setItem(VERSION_CATALOG_CACHE_AT_LS_KEY, String(Date.now()));
      localStorage.setItem(VERSION_CATALOG_CACHE_LS_KEY, JSON.stringify(Array.isArray(list) ? list : []));
    } catch {}
  }
  /**
   * Objetivo: Busca catalogo de versoes do script a partir do historico no GitHub.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros:
   * - forceRefresh: entrada usada por esta rotina.
   * Retorno: Promise<Array>.
   * Efeitos colaterais: chamadas de rede e cache local.
   */
  async function fetchScriptVersionCatalog(forceRefresh = false) {
    const cached = readVersionCatalogCache();
    const now = Date.now();
    if (
      !forceRefresh &&
      cached.at > 0 &&
      now - cached.at < VERSION_CATALOG_CACHE_MS &&
      Array.isArray(cached.list) &&
      cached.list.length
    ) {
      return cached.list;
    }

    const found = [];
    const seenVersions = new Set();
    const addEntry = (entry) => {
      const version = String(entry?.version || "").trim();
      if (!version || seenVersions.has(version)) return;
      seenVersions.add(version);
      found.push({
        version,
        date: String(entry?.date || "").trim(),
        url: String(entry?.url || "").trim(),
        commitUrl: String(entry?.commitUrl || "").trim(),
        source: String(entry?.source || "unknown").trim(),
      });
    };

    addEntry({
      version: SCRIPT_VERSION,
      date: new Date().toISOString(),
      url: String(MANUAL_UPDATE_SOURCE_URL || "").trim(),
      source: "current",
    });

    try {
      const commitsResponse = await fetch(VERSION_CATALOG_COMMITS_API_URL, {
        method: "GET",
        cache: "no-store",
        mode: "cors",
        credentials: "omit",
      });
      if (!commitsResponse.ok) throw new Error(`HTTP ${commitsResponse.status}`);

      const commits = await commitsResponse.json();
      if (!Array.isArray(commits)) throw new Error("Resposta invalida do catalogo de commits.");

      for (const item of commits) {
        if (found.length >= VERSION_CATALOG_MAX_ITEMS) break;
        const sha = String(item?.sha || "").trim();
        if (!sha) continue;
        const rawUrl = `https://raw.githubusercontent.com/KauanHeadsoft/script_deskhelp/${sha}/.user.js`;
        try {
          const fileResponse = await fetch(rawUrl, {
            method: "GET",
            cache: "no-store",
            mode: "cors",
            credentials: "omit",
          });
          if (!fileResponse.ok) continue;
          const text = await fileResponse.text();
          const version = extractScriptVersionFromText(text);
          if (!version) continue;
          addEntry({
            version,
            date: item?.commit?.author?.date || item?.commit?.committer?.date || "",
            url: rawUrl,
            commitUrl: String(item?.html_url || "").trim(),
            source: "commit",
          });
        } catch {}
      }
    } catch {}

    const sorted = found
      .filter((x) => x && x.version)
      .sort((a, b) => compareVersionTexts(String(b.version || ""), String(a.version || "")));

    if (!sorted.length) {
      if (Array.isArray(cached.list) && cached.list.length) return cached.list;
      return [
        {
          version: SCRIPT_VERSION,
          date: "",
          url: String(MANUAL_UPDATE_SOURCE_URL || "").trim(),
          commitUrl: "",
          source: "fallback",
        },
      ];
    }

    persistVersionCatalogCache(sorted);
    return sorted;
  }
  /**
   * Objetivo: Exibe seletor simples para abrir uma versao especifica do script.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros:
   * - forceRefresh: entrada usada por esta rotina.
   * Retorno: Promise<void>.
   * Efeitos colaterais: prompt/alert no navegador e abertura de nova aba.
   */
  async function showScriptVersionsPicker(forceRefresh = false) {
    const list = await fetchScriptVersionCatalog(forceRefresh);
    if (!Array.isArray(list) || !list.length) {
      window.alert("Nao foi possivel carregar o catalogo de versoes agora.");
      return;
    }

    const lines = [
      `Versoes disponiveis (atual: v${SCRIPT_VERSION})`,
      "",
    ];
    list.forEach((item, idx) => {
      const version = String(item?.version || "").trim() || "?";
      const date = String(item?.date || "").trim().slice(0, 10);
      const mark = version === SCRIPT_VERSION ? " (atual)" : "";
      const dateLabel = date ? ` - ${date}` : "";
      lines.push(`${idx + 1}) v${version}${mark}${dateLabel}`);
    });
    lines.push("");
    lines.push("Digite o numero da versao para abrir/instalar.");

    const picked = window.prompt(lines.join("\n"), "1");
    if (picked === null) return;
    const n = parseInt(String(picked || "").trim(), 10);
    if (!Number.isFinite(n) || n < 1 || n > list.length) {
      toast("Numero de versao invalido.", "err", 2800);
      return;
    }
    const selected = list[n - 1];
    const targetUrl = String(selected?.url || "").trim();
    if (!targetUrl) {
      toast("URL da versao selecionada indisponivel.", "err", 3200);
      return;
    }
    openScriptUpdatePage(targetUrl);
  }
  /**
   * Objetivo: Garante helpers globais de diagnostico para abertura de requisicoes.
   *
   * Contexto: Disponibiliza API de log/dump/toggle no console para investigacao.
   * Parametros: nenhum.
   * Retorno: void.
   * Efeitos colaterais: cria funcoes globais idempotentes e atalhos de teclado.
   */
  function ensureReqOpenDebugTools() {
    const root = document.documentElement;
    if (root?.dataset?.hsReqOpenDebugTools === "1") return;
    if (root?.dataset) root.dataset.hsReqOpenDebugTools = "1";

    const ensureBuffer = () => {
      let list = window.__hsReqOpenLog;
      if (!Array.isArray(list)) {
        list = [];
        window.__hsReqOpenLog = list;
      }
      return list;
    };
    const captureStack = () => {
      try {
        return String(new Error().stack || "")
          .split("\n")
          .slice(2, 8)
          .map((line) => line.trim())
          .join(" | ");
      } catch {
        return "";
      }
    };

    if (typeof window.__hsReqOpenTrace !== "function") {
      window.__hsReqOpenTrace = function hsReqOpenTrace(eventName, payload = {}) {
        const force = !!payload.force;
        if (!force && !isReqOpenDebugEnabled()) return;

        const now = Date.now();
        const entry = {
          at: new Date(now).toISOString(),
          ms: now,
          page: String(location.pathname || ""),
          event: String(eventName || ""),
          ...payload,
          stack: captureStack(),
        };
        delete entry.force;

        const buffer = ensureBuffer();
        buffer.push(entry);
        const extra = buffer.length - REQ_OPEN_LOG_LIMIT;
        if (extra > 0) buffer.splice(0, extra);
      };
    }

    if (typeof window.__hsReqOpenDump !== "function") {
      window.__hsReqOpenDump = function hsReqOpenDump(limit = 120) {
        const max = Math.max(1, Number(limit) || 120);
        const buffer = ensureBuffer();
        const rows = buffer.slice(-max);
        if (console && typeof console.table === "function") console.table(rows);
        else console.log(rows);
        return rows;
      };
    }

    if (typeof window.__hsReqOpenClearLog !== "function") {
      window.__hsReqOpenClearLog = function hsReqOpenClearLog() {
        const buffer = ensureBuffer();
        buffer.length = 0;
        return true;
      };
    }

    if (typeof window.__hsReqOpenToggle !== "function") {
      window.__hsReqOpenToggle = function hsReqOpenToggle(forceEnabled) {
        const next =
          typeof forceEnabled === "boolean" ? forceEnabled : !isReqOpenDebugEnabled();
        setReqOpenDebugEnabled(next);
        window.__hsReqOpenTrace?.("debug.toggle", { enabled: next, force: true });
        console.info(
          `[HeadsoftHelper][req-open] Diagnostico ${next ? "ativado" : "desativado"}.`
        );
        return next;
      };
    }

    if (root?.dataset?.hsReqOpenDebugKeys !== "1") {
      document.addEventListener(
        "keydown",
        (ev) => {
          if (!ev.ctrlKey || !ev.shiftKey) return;
          if (ev.key.toLowerCase() === "l") {
            ev.preventDefault();
            window.__hsReqOpenDump?.(200);
          } else if (ev.key.toLowerCase() === "d") {
            ev.preventDefault();
            window.__hsReqOpenToggle?.();
          }
        },
        true
      );
      if (root?.dataset) root.dataset.hsReqOpenDebugKeys = "1";
    }
  }
  /**
   * Objetivo: Registra evento de diagnostico da abertura de requisicoes.
   *
   * Contexto: Atalho local para emitir trilha estruturada sem acoplar ao console.
   * Parametros:
   * - eventName: entrada usada por esta rotina.
   * - payload: entrada usada por esta rotina.
   * Retorno: void.
   * Efeitos colaterais: armazena evento no buffer global quando diagnostico ativo.
   */
  function traceReqOpen(eventName, payload = {}) {
    try {
      if (typeof window.__hsReqOpenTrace === "function") {
        window.__hsReqOpenTrace(eventName, payload);
      }
    } catch {}
  }
  /**
   * Objetivo: Instala guard global para evitar window.open duplicado da mesma requisiÃ§Ã£o.
   *
   * Contexto: Protege contra mÃºltiplos handlers concorrentes (userscript/legado).
   * Parametros: nenhum.
   * Retorno: void.
   * Efeitos colaterais: sobrescreve window.open de forma idempotente.
   */
  function ensureWindowOpenDedupGuard() {
    ensureReqOpenDebugTools();
    const root = document.documentElement;
    if (root?.dataset?.hsWindowOpenGuard === "1") return;

    const alreadyWrapped = typeof window.__hsOriginalWindowOpen === "function";
    if (alreadyWrapped) {
      if (root?.dataset) root.dataset.hsWindowOpenGuard = "1";
      traceReqOpen("window.open.guard.alreadyWrapped", { force: true });
      return;
    }

    const originalOpen = window.open.bind(window);
    window.__hsOriginalWindowOpen = originalOpen;

    const DUP_MS = 1400;
    window.open = function guardedWindowOpen(url, target, features) {
      let isReqOpen = false;
      let reqNumero = "";
      const urlTxt = String(url || "");
      const targetTxt = String(target || "");
      const tgt = targetTxt.toLowerCase();
      const canDedup = tgt !== "_self";
      traceReqOpen("window.open.call", {
        url: urlTxt,
        target: targetTxt,
        canDedup,
      });

      try {
        const abs = new URL(urlTxt, location.href);
        const isAttachmentOpen =
          abs.origin === location.origin &&
          (/\/anexo(?:\.php)?$/i.test(abs.pathname) ||
            abs.searchParams.has("guid") ||
            abs.searchParams.has("anexo") ||
            abs.searchParams.has("id_anexo"));
        const bridgeFlagRaw = String(abs.searchParams.get(TEXT_PREVIEW_BRIDGE_QUERY_KEY) || "")
          .trim()
          .toLowerCase();
        const isTextBridgeOpen = bridgeFlagRaw === "1" || bridgeFlagRaw === "true" || bridgeFlagRaw === "yes";
        if (canDedup && isAttachmentOpen && !isTextBridgeOpen) {
          const now = Date.now();
          const guardUntil = Number(root?.dataset?.hsTextPreviewGuardUntil || 0);
          if (Number.isFinite(guardUntil) && now <= guardUntil) {
            const guardUrl = String(root?.dataset?.hsTextPreviewGuardUrl || "").trim();
            const guardGuid = String(root?.dataset?.hsTextPreviewGuardGuid || "")
              .trim()
              .toLowerCase();
            const absUrl = abs.toString();
            const absGuid = String(
              abs.searchParams.get("guid") ||
                abs.searchParams.get("anexo") ||
                abs.searchParams.get("id_anexo") ||
                ""
            )
              .trim()
              .toLowerCase();
            const sameUrl = !!guardUrl && absUrl === guardUrl;
            const sameGuid = !!guardGuid && !!absGuid && guardGuid === absGuid;
            if (sameUrl || sameGuid) {
              traceReqOpen("window.open.blocked.textPreview", {
                target: targetTxt,
                url: absUrl,
                reason: sameGuid ? "same-guid" : "same-url",
                guardUntil,
              });
              return null;
            }
          }
        }

        isReqOpen = abs.origin === location.origin && /\/visualizar_requisicao\.php$/i.test(abs.pathname);
        reqNumero = String(abs.searchParams.get("numero") || "").trim();

        if (canDedup && isReqOpen && reqNumero) {
          const now = Date.now();
          const lastNum = String(root?.dataset?.hsLastWinOpenNum || "").trim();
          const lastAt = Number(root?.dataset?.hsLastWinOpenAt || 0);
          const delta = Number.isFinite(lastAt) ? now - lastAt : -1;
          const duplicated = lastNum === reqNumero && Number.isFinite(lastAt) && delta < DUP_MS;
          if (duplicated) {
            traceReqOpen("window.open.blocked", {
              numero: reqNumero,
              target: targetTxt,
              deltaMs: delta,
              windowMs: DUP_MS,
              url: abs.toString(),
            });
            return null;
          }

          if (root?.dataset) {
            root.dataset.hsLastWinOpenNum = reqNumero;
            root.dataset.hsLastWinOpenAt = String(now);
          }
        }
      } catch (err) {
        traceReqOpen("window.open.parse.error", {
          url: urlTxt,
          target: targetTxt,
          error: String(err?.message || err || "erro-desconhecido"),
        });
      }

      const opened = originalOpen(url, target, features);
      traceReqOpen("window.open.forward", {
        url: urlTxt,
        target: targetTxt,
        numero: reqNumero,
        isReqOpen,
        opened: !!opened,
      });
      return opened;
    };

    if (root?.dataset) root.dataset.hsWindowOpenGuard = "1";
    traceReqOpen("window.open.guard.installed", { force: true });
  }
  /**
   * Objetivo: Injeta (ou atualiza) o CSS principal do userscript no documento atual.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: void.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function injectStyle() {
    let s = document.getElementById(STYLE_ID);
    if (!s) {
      s = document.createElement("style");
      s.id = STYLE_ID;
      (document.head || document.documentElement).appendChild(s);
    }
    s.textContent = CSS;
  }
  /**
   * Objetivo: Recupera o tema ativo com fallback para preferencia do sistema.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: valor calculado.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function getTheme() {
    try {
      const t = localStorage.getItem(LS_KEY);
      if (t === "dark" || t === "light") return t;
    } catch {}
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  /**
   * Objetivo: Aplica o tema no DOM e persiste a escolha no localStorage.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros:
   * - t: entrada usada por esta rotina.
   * Retorno: valor utilitario.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function applyTheme(t) {
    const mode = t === "light" ? "light" : "dark";
    if (document.documentElement.getAttribute("data-hs-theme") !== mode) {
      document.documentElement.setAttribute("data-hs-theme", mode);
    }
    try {
      if (localStorage.getItem(LS_KEY) !== mode) localStorage.setItem(LS_KEY, mode);
    } catch {}
    applyAppearanceSettings();
    applySituacaoColorCustomization(mode);
    if (document.body?.classList?.contains("hs-dashboard-page")) {
      normalizeDashboardTableWidths();
    }
    const btn = document.getElementById(BTN_ID);
    if (btn) btn.textContent = mode === "dark" ? THEME_LABEL_WHEN_DARK : THEME_LABEL_WHEN_LIGHT;
  }
  /**
   * Objetivo: Garante o botao de tema no local correto (cabecalho/login).
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: void.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function ensureThemeBtn() {
    let btn = document.getElementById(BTN_ID);
    if (!btn) {
      btn = document.createElement("button");
      btn.id = BTN_ID;
      btn.type = "button";
      btn.onclick = () => applyTheme(getTheme() === "dark" ? "light" : "dark");
    }
    const isLoginLike = !!document.querySelector('input[type="password"]') && !document.querySelector("#conteudo table.sortable");
    const menu = document.getElementById("cabecalho_menu");
    const targetParent = isLoginLike ? (document.body || document.documentElement) : menu;
    if (targetParent && btn.parentElement !== targetParent) targetParent.appendChild(btn);

    if (isLoginLike) {
      btn.style.setProperty("position", "fixed", "important");
      btn.style.setProperty("top", "10px", "important");
      btn.style.setProperty("right", "12px", "important");
      btn.style.setProperty("left", "auto", "important");
      btn.style.setProperty("z-index", "1000002", "important");
      btn.style.setProperty("margin", "0", "important");
      btn.style.setProperty("width", "auto", "important");
      btn.style.setProperty("min-width", "0", "important");
      btn.style.setProperty("display", "inline-flex", "important");
      btn.style.setProperty("align-items", "center", "important");
      btn.style.setProperty("justify-content", "center", "important");
      btn.style.setProperty("white-space", "nowrap", "important");
    } else {
      ["position", "top", "right", "left", "z-index", "margin", "width", "min-width", "display", "align-items", "justify-content", "white-space"].forEach((prop) =>
        btn.style.removeProperty(prop)
      );
    }

    if (btn) btn.textContent = getTheme() === "dark" ? THEME_LABEL_WHEN_DARK : THEME_LABEL_WHEN_LIGHT;
  }
  /**
   * Objetivo: Remove badge legado para evitar ruido visual.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: void.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function ensureBadge() {
    const b = document.getElementById(BADGE_ID);
    if (b) b.remove();
  }
  /**
   * Objetivo: Substitui a logo do cabecalho pela URL padrao do projeto.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: valor utilitario.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function fixLogo() {
    const wrap = document.getElementById("cabecalho_logo");
    if (!wrap) return;
    const img = wrap.querySelector("img");
    if (img) img.src = NEW_LOGO;
  }
  /**
   * Objetivo: Configura navegaÃ§Ã£o da logo conforme contexto da pÃ¡gina.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: void.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function bindHeaderLogoNavigation() {
    const wrap = document.getElementById("cabecalho_logo");
    if (!wrap) return;

    const getTargetHref = () => {
      const path = String(location.pathname || "").toLowerCase();
      if (/visualizar_requisicao\.php/.test(path)) return `${location.origin}/consulta_requisicao.php`;
      if (/consulta_requisicao\.php/.test(path)) return `${location.origin}/dashboard.php`;
      return null;
    };

    const targetHref = getTargetHref();
    const anchor = wrap.querySelector("a[href]") || wrap.closest("a[href]");
    if (anchor && targetHref) anchor.setAttribute("href", targetHref);

    if (wrap.dataset.hsLogoNavBound === "1") return;
    wrap.dataset.hsLogoNavBound = "1";

    wrap.addEventListener(
      "click",
      (ev) => {
        if (ev.button !== 0) return;
        const href = getTargetHref();
        if (!href) return;

        ev.preventDefault();
        ev.stopPropagation();
        ev.stopImmediatePropagation();
        window.location.href = href;
      },
      true
    );
  }
  /**
   * Objetivo: Oculta filtros e linhas nÃ£o priorizados nas telas de listagem.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: void.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function hideSomeFilters() {
    const frm = document.querySelector('form[name="filtros"]');
    if (!frm) return;
    const keepTop = ["responsavel", "responsÃ¡vel", "cliente"];
    const hideTop = ["situacao", "situaÃ§Ã£o", "categoria", "agrupamento", "concluido", "concluÃ­do", "ans", "setor"];
    const hideRows = ["ordenar por percentual", "paralisado/stand by"];
    const suggestionRows = ["sugestao de melhoria", "sugestÃ£o de melhoria"];
    const hideSuggestionRow = isHideSuggestionFilterEnabled();

    // Esconde pares TH/TD dos filtros riscados
    frm.querySelectorAll("th").forEach((th) => {
      const label = norm(th.textContent || "");
      const td = th.nextElementSibling;

      const mustKeep = keepTop.some((k) => label.startsWith(k));
      const mustHide = hideTop.some((k) => label.startsWith(k));

      if (mustKeep) {
        th.style.display = "";
        if (td && td.tagName === "TD") td.style.display = "";
        return;
      }

      if (mustHide) {
        th.style.display = "none";
        if (td && td.tagName === "TD") td.style.display = "none";
      }
    });

    // Esconde linhas de opÃ§Ãµes riscadas
    frm.querySelectorAll("tr").forEach((tr) => {
      const t = norm(tr.textContent || "");
      const mustHide =
        hideRows.some((k) => t.includes(k)) || (hideSuggestionRow && suggestionRows.some((k) => t.includes(k)));
      if (mustHide) {
        tr.style.display = "none";
        tr.dataset.hsScriptHiddenRow = "1";
      } else if (tr.dataset.hsScriptHiddenRow === "1") {
        tr.style.display = "";
        delete tr.dataset.hsScriptHiddenRow;
      }
    });
  }
  /**
   * Objetivo: Esconde aÃ§Ãµes legadas no topo de visualizar requisiÃ§Ã£o.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: void.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function hideVisualizarActions() {
    if (!/visualizar_requisicao\.php/i.test(location.pathname)) return;

    const top = document.querySelector("#interno .requisicao_top");
    if (!top) return;

    top.querySelectorAll(".marcacao_verificado, .navegacao").forEach((el) => {
      el.style.display = "none";
    });
    top.querySelectorAll(".navegacao input, .navegacao button, .navegacao a").forEach((el) => {
      el.style.display = "none";
    });
  }
  /**
   * Objetivo: Realinha tÃ­tulo e aÃ§Ã£o principal no topo da requisiÃ§Ã£o.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: void.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function alignRequestHeaderActions() {
    if (!/visualizar_requisicao\.php/i.test(location.pathname)) return;
    const interno = document.getElementById("interno");
    if (!interno) return;

    const top = interno.querySelector(".requisicao_top");
    if (!top) return;

    const concluirWrap = top.querySelector(".marcacao_concluido");
    const concluirBtn = concluirWrap?.querySelector("input[type='button'], button, a");
    if (!concluirWrap || !concluirBtn) return;

    const verificadoWrap = top.querySelector(".marcacao_verificado");
    const navegacaoWrap = top.querySelector(".navegacao");
    if (verificadoWrap) verificadoWrap.style.display = "none";
    if (navegacaoWrap) navegacaoWrap.style.display = "none";

    top.querySelectorAll(".navegacao input, .navegacao button, .navegacao a").forEach((el) => {
      el.style.display = "none";
    });
    top.querySelectorAll(".marcacao_verificado input, .marcacao_verificado button, .marcacao_verificado a").forEach(
      (el) => {
        el.style.display = "none";
      }
    );

    concluirWrap.style.display = "";
    concluirBtn.style.display = "";
    concluirBtn.classList.add("hs-req-main-action", "hs-req-concluir-btn");
    concluirWrap.style.setProperty("position", "static", "important");
    concluirWrap.style.setProperty("float", "none", "important");
    concluirWrap.style.setProperty("left", "auto", "important");
    concluirWrap.style.setProperty("right", "auto", "important");
    concluirWrap.style.setProperty("top", "auto", "important");
    concluirWrap.style.setProperty("bottom", "auto", "important");
    concluirWrap.style.setProperty("transform", "none", "important");
    concluirWrap.style.setProperty("justify-self", "end", "important");
    concluirWrap.style.setProperty("display", "block", "important");
    concluirWrap.style.setProperty("text-align", "right", "important");
    concluirWrap.style.setProperty("padding", "0", "important");
    concluirWrap.style.setProperty("width", "auto", "important");
    concluirWrap.style.setProperty("margin-left", "0", "important");
    concluirBtn.style.setProperty("margin-left", "auto", "important");
    concluirBtn.style.setProperty("margin-right", "0", "important");
    top.style.setProperty("display", "grid", "important");
    top.style.setProperty("grid-template-columns", "minmax(0, 1fr) auto", "important");
    top.style.setProperty("align-items", "center", "important");
    top.style.setProperty("position", "relative", "important");
    top.style.setProperty("padding", "0", "important");

    const title = top.querySelector("h1");
    if (title) {
      title.style.setProperty("margin", "6px 0", "important");
      title.style.setProperty("padding", "0", "important");
      title.style.setProperty("min-width", "0", "important");
      title.style.setProperty("text-align", "left", "important");
      title.style.setProperty("justify-self", "start", "important");
      title.style.setProperty("text-indent", "0", "important");
    }

    // Mantem o topo com a mesma largura da tabela de categorias para
    // alinhar o botao ao lado direito (acima de "Complexo").
    const catTable = interno.querySelector(".categorias table");
    if (catTable) {
      const w = Math.round(catTable.getBoundingClientRect().width);
      if (w > 200) {
        top.style.setProperty("width", `${w}px`, "important");
        top.style.setProperty("max-width", `${w}px`, "important");
        top.style.setProperty("margin-left", "auto", "important");
        top.style.setProperty("margin-right", "auto", "important");
      }

      // Alinha topo com as 3 colunas da tabela (titulo nas 2 primeiras,
      // botao ancorado na borda direita da coluna "Complexo").
      const ths = Array.from(catTable.querySelectorAll("th"));
      if (ths.length >= 3) {
        const w1 = Math.round(ths[0].getBoundingClientRect().width);
        const w2 = Math.round(ths[1].getBoundingClientRect().width);
        const w3 = Math.round(ths[2].getBoundingClientRect().width);
        if (w1 > 30 && w2 > 30 && w3 > 30) {
          top.style.setProperty("grid-template-columns", `${w1}px ${w2}px ${w3}px`, "important");
          top.style.setProperty("column-gap", "0", "important");
          if (title) {
            title.style.setProperty("grid-column", "1 / span 2", "important");
            title.style.setProperty("justify-self", "start", "important");
            title.style.setProperty("text-align", "left", "important");
            title.style.setProperty("padding", "0", "important");
            title.style.setProperty("text-indent", "0", "important");
          }
          concluirWrap.style.setProperty("grid-column", "3", "important");
          concluirWrap.style.setProperty("justify-self", "end", "important");
          concluirWrap.style.setProperty("display", "block", "important");
          concluirWrap.style.setProperty("text-align", "right", "important");
          concluirWrap.style.setProperty("padding", "0", "important");
          concluirWrap.style.setProperty("width", "auto", "important");
          concluirBtn.style.setProperty("margin", "0", "important");
          concluirBtn.style.setProperty("margin-left", "auto", "important");
          concluirBtn.style.setProperty("margin-right", "0", "important");
        }
      }

      // Se o topo ficar mais a direita, desloca os blocos abaixo para alinhar.
      const rowsBelow = new Set();
      const contentHost = top.parentElement;
      if (contentHost) {
        Array.from(contentHost.children).forEach((el) => {
          if (el !== top) rowsBelow.add(el);
        });
      }
      const formHost = top.closest("form") || interno;
      formHost
        .querySelectorAll(".acompanhamentos, #consulta_consumos, .novo_consumo_interno, #consumos_internos")
        .forEach((el) => rowsBelow.add(el));

      Array.from(rowsBelow).forEach((el) => {
        el.style.setProperty("margin-left", "0", "important");
        el.style.removeProperty("max-width");
      });

      const leftTop = Math.round(top.getBoundingClientRect().left);
      const leftCat = Math.round(catTable.getBoundingClientRect().left);
      const shift = Math.max(0, leftTop - leftCat);
      if (shift > 1) {
        Array.from(rowsBelow).forEach((el) => {
          el.style.setProperty("margin-left", `${shift}px`, "important");
          el.style.setProperty("max-width", `calc(100% - ${shift}px)`, "important");
        });
      }
    }

    if (top.lastElementChild !== concluirWrap) {
      top.appendChild(concluirWrap);
    }
  }
  /**
   * Objetivo: Oculta colunas especÃ­ficas de grids conforme regra funcional.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: void.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function hideRequestedGridColumns() {
    const shouldHide = [
      /(^| )categoria( |$)/,
      /subcategoria/,
      /data.*proxima.*acao/,
      /proxima.*acao.*%|%.*proxima.*acao/,
      /previsao.*primeiro.*atend/,
      /previsao.*resposta/,
      /urgenc/,
    ];

    const isModuleGrid = (headerTexts) =>
      headerTexts.some((h) => /solicitante|titulo|situac|responsavel|consumo/.test(h));

    const tables = Array.from(document.querySelectorAll("table"));
    for (const table of tables) {
      const headerRow =
        table.tHead?.rows?.[0] ||
        Array.from(table.querySelectorAll("tr")).find((tr) => tr.querySelector("th"));
      if (!headerRow) continue;

      const headerCells = Array.from(headerRow.cells);
      if (!headerCells.length) continue;

      const headerTexts = headerCells.map((c) => norm((c.textContent || "").replace(/\s+/g, " ").trim()));
      if (!isModuleGrid(headerTexts)) continue;

      const hideIdx = [];
      headerTexts.forEach((txt, idx) => {
        if (shouldHide.some((rx) => rx.test(txt))) hideIdx.push(idx);
      });
      if (!hideIdx.length) continue;

      const idxSet = new Set(hideIdx);
      for (const row of Array.from(table.rows)) {
        Array.from(row.cells).forEach((cell, idx) => {
          if (idxSet.has(idx)) cell.style.display = "none";
        });
      }
    }
  }
  /**
   * Objetivo: Aplica destaque em acompanhamentos com regra de responsÃ¡vel/usuÃ¡rio.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: valor utilitario.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function highlightAcompanhamentosResponsavelEspecial() {
    if (!/visualizar_requisicao\.php/i.test(location.pathname)) return;

    const targetUsers = ["luiz pancaldi", "flauvi klock"];
    const normalizeName = (txt) => norm(txt).replace(/\s+/g, " ").trim();

    const getResponsavelAtual = () => {
      const rows = Array.from(document.querySelectorAll("#interno table:not(.sortable) tr"));
      for (const tr of rows) {
        const cells = Array.from(tr.cells || []);
        if (cells.length < 2) continue;
        const label = normalizeName(cells[0].textContent || "");
        if (!label || label.startsWith("responsabilizador")) continue;
        if (!label.startsWith("responsavel")) continue;
        return normalizeName(cells[1].textContent || "");
      }
      return "";
    };

    const findAcompanhamentoTable = () => {
      const tables = Array.from(document.querySelectorAll("#interno .acompanhamentos table, #interno table"));
      for (const table of tables) {
        const headerRow =
          table.tHead?.rows?.[0] ||
          Array.from(table.rows || []).find((tr) => Array.from(tr.cells || []).some((c) => /^th$/i.test(c.tagName)));
        if (!headerRow) continue;

        const headers = Array.from(headerRow.cells || []).map((c) => normalizeName(c.textContent || ""));
        const idxData = headers.findIndex((h) => h.startsWith("data"));
        const idxUsuario = headers.findIndex((h) => h.startsWith("usuario"));
        const idxAcao = headers.findIndex((h) => h.startsWith("acao"));
        const idxDescricao = headers.findIndex((h) => h.startsWith("descricao"));
        if (idxData >= 0 && idxUsuario >= 0 && idxAcao >= 0 && idxDescricao >= 0) {
          return { table, headerRow, idxUsuario, idxAcao, idxDescricao, highlightIdx: [idxData, idxUsuario, idxAcao] };
        }
      }
      return null;
    };

    const info = findAcompanhamentoTable();
    if (!info) return;
    const { table, headerRow, idxUsuario, idxAcao, idxDescricao, highlightIdx } = info;

    const rows = Array.from(table.rows || []).filter((tr) => {
      if (tr === headerRow) return false;
      if (tr.closest("thead")) return false;
      return Array.from(tr.cells || []).some((c) => /^td$/i.test(c.tagName));
    });

    rows.forEach((tr) => {
      tr.classList.remove("hs-acomp-special");
      tr.classList.remove("hs-acomp-internal");
      Array.from(tr.cells || []).forEach((td) => {
        td.classList.remove(
          "hs-acomp-special-cell",
          "hs-acomp-special-content",
          "hs-acomp-internal-cell",
          "hs-acomp-internal-content"
        );
      });
    });

    const responsavel = getResponsavelAtual();
    const responsavelEhAlvo = targetUsers.some((n) => responsavel.includes(n));
    const allowBlueHighlight = !responsavelEhAlvo;

    rows.forEach((tr) => {
      const cells = Array.from(tr.cells || []);
      const acao = normalizeName(cells[idxAcao]?.textContent || "");
      if (/\binstrucao\s+interna\b/.test(acao)) {
        tr.classList.add("hs-acomp-internal");
        highlightIdx.forEach((idx) => {
          const td = cells[idx];
          if (td) td.classList.add("hs-acomp-internal-cell");
        });
        const tdDescricao = cells[idxDescricao];
        if (tdDescricao) tdDescricao.classList.add("hs-acomp-internal-content");
        return;
      }

      if (!allowBlueHighlight) return;

      const usuario = normalizeName(cells[idxUsuario]?.textContent || "");
      if (!usuario) return;
      if (!targetUsers.some((n) => usuario.includes(n))) return;
      if (/^(?:1|1o|1Âº|1Â°)\s*atendimento\b/.test(acao)) return;

      tr.classList.add("hs-acomp-special");
      highlightIdx.forEach((idx) => {
        const td = cells[idx];
        if (td) td.classList.add("hs-acomp-special-cell");
      });
      const tdDescricao = cells[idxDescricao];
      if (tdDescricao) tdDescricao.classList.add("hs-acomp-special-content");
    });
  }
  /**
   * Objetivo: Neutraliza efeitos de hover herdados da interface legada.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: valor utilitario.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function disableAcompanhamentosHoverEffects() {
    if (!/visualizar_requisicao\.php/i.test(location.pathname)) return;

    const clearHoverAttrs = (el) => {
      if (!el || el.dataset.hsHoverOff === "1") return;
      el.dataset.hsHoverOff = "1";

      el.removeAttribute("onmouseover");
      el.removeAttribute("onmouseout");
      el.removeAttribute("onmouseenter");
      el.removeAttribute("onmouseleave");
      el.removeAttribute("onmousemove");

      el.onmouseover = null;
      el.onmouseout = null;
      el.onmouseenter = null;
      el.onmouseleave = null;
      el.onmousemove = null;
    };

    const clearHoverInlineStyle = (el) => {
      if (!(el instanceof HTMLElement)) return;
      el.style.removeProperty("opacity");
      el.style.removeProperty("filter");
      el.style.removeProperty("text-shadow");
      el.style.removeProperty("transition");
    };

    const tables = document.querySelectorAll("#interno .acompanhamentos table, #interno table");
    tables.forEach((table) => {
      const headerRow =
        table.tHead?.rows?.[0] ||
        Array.from(table.rows || []).find((tr) => Array.from(tr.cells || []).some((c) => /^th$/i.test(c.tagName)));
      if (!headerRow) return;

      const headers = Array.from(headerRow.cells || []).map((c) => norm(c.textContent || ""));
      const hasAcompanhamentoShape =
        headers.some((h) => h.startsWith("data")) &&
        headers.some((h) => h.startsWith("usuario")) &&
        headers.some((h) => h.startsWith("acao")) &&
        headers.some((h) => h.startsWith("descricao"));
      if (!hasAcompanhamentoShape) return;

      table.classList.add("hs-acomp-table");
      table.dataset.hsAcompTable = "1";

      table.querySelectorAll("*").forEach((el) => {
        clearHoverAttrs(el);
        clearHoverInlineStyle(el);
      });

      clearHoverInlineStyle(table);
    });
  }

  let hsNoHoverEventsBound = false;
  /**
   * Objetivo: Bloqueia eventos de hover para manter leitura estÃ¡vel da tabela.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: void.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function bindNoHoverAcompanhamentosEvents() {
    if (hsNoHoverEventsBound) return;
    if (!/visualizar_requisicao\.php/i.test(location.pathname)) return;
    hsNoHoverEventsBound = true;

    const blockHover = (ev) => {
      const target = ev.target instanceof Element ? ev.target : null;
      if (!target) return;
      if (!target.closest("#interno table.hs-acomp-table")) return;
      ev.stopPropagation();
      ev.stopImmediatePropagation();
    };

    const hoverEvents = [
      "mouseover",
      "mouseout",
      "mouseenter",
      "mouseleave",
      "mousemove",
      "pointerover",
      "pointerout",
      "pointerenter",
      "pointerleave",
    ];

    hoverEvents.forEach((type) => {
      document.addEventListener(type, blockHover, true);
      window.addEventListener(type, blockHover, true);
    });
  }

  /* ---------------------- SECTION: LAYOUT POR PAGINA ------------------------- */
  /**
   * Objetivo: Aplica layout moderno e padronizado Ã  tela de login.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: void.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function styleLoginPage() {
    const hasPassword = document.querySelector('input[type="password"]');
    const hasMainContent = document.querySelector("#conteudo table.sortable");
    if (!hasPassword || hasMainContent) return;
    document.body.classList.add("hs-login-page");
    ensureThemeBtn();

    const card =
      hasPassword.closest("table") ||
      hasPassword.closest(".login") ||
      document.querySelector("#interno .login, #conteudo .login");
    if (!card) return;

    card.classList.add("hs-login-card");
    card.querySelectorAll(".hs-login-title-cell").forEach((el) => el.classList.remove("hs-login-title-cell"));

    const titleRx = /informar\s+login\s+de\s+acesso/i;
    const titleNodes = Array.from(card.querySelectorAll("h1,h2,h3,td,th,div,span,font,b,strong,p,a")).filter((el) =>
      titleRx.test(norm(el.textContent || ""))
    );
    const titleCells = new Set();
    const titleBlocks = new Set();

    titleNodes.forEach((node) => {
      if (!(node instanceof HTMLElement)) return;
      node.classList.add("hs-login-title-cell");
      node.style.setProperty("color", "#f2f7ff", "important");
      node.style.setProperty("text-shadow", "0 1px 0 rgba(0,0,0,.25)", "important");

      const cell = node.closest("td,th");
      if (cell instanceof HTMLElement) titleCells.add(cell);
      const block = node.closest("h1,h2,h3,div,p,span");
      if (block instanceof HTMLElement && card.contains(block)) titleBlocks.add(block);
    });

    if (!titleCells.size && card instanceof HTMLTableElement) {
      Array.from(card.querySelectorAll("tr:first-child td, tr:first-child th")).forEach((cell) => titleCells.add(cell));
    }
    if (!titleBlocks.size && !(card instanceof HTMLTableElement)) {
      const heading = card.querySelector("h1,h2,h3");
      if (heading instanceof HTMLElement) titleBlocks.add(heading);
    }

    titleCells.forEach((cell) => {
      if (!(cell instanceof HTMLElement)) return;
      cell.classList.add("hs-login-title-cell");
      cell.style.setProperty("color", "#f2f7ff", "important");
      cell.style.setProperty("background", "linear-gradient(120deg, #0a3a72, #0f4f9c)", "important");
      cell.style.setProperty("border-bottom", "1px solid #2d5f9f", "important");
      cell.style.setProperty("text-align", "center", "important");
      cell.querySelectorAll("*").forEach((el) => {
        if (!(el instanceof HTMLElement)) return;
        el.classList.add("hs-login-title-cell");
        el.style.setProperty("color", "#f2f7ff", "important");
        el.style.setProperty("text-shadow", "0 1px 0 rgba(0,0,0,.25)", "important");
      });
    });

    titleBlocks.forEach((block) => {
      if (!(block instanceof HTMLElement)) return;
      block.classList.add("hs-login-title-cell");
      block.style.setProperty("color", "#f2f7ff", "important");
      block.style.setProperty("text-shadow", "0 1px 0 rgba(0,0,0,.25)", "important");
      if (/^h[1-3]$/i.test(block.tagName)) {
        block.style.setProperty("background", "linear-gradient(120deg, #0a3a72, #0f4f9c)", "important");
        block.style.setProperty("border-bottom", "1px solid #2d5f9f", "important");
        block.style.setProperty("text-align", "center", "important");
        block.style.setProperty("margin", "0", "important");
        block.style.setProperty("padding", "16px 18px", "important");
      }
    });

    const loginBtn = card.querySelector("input[type='submit'], input[type='button'], button:not(#" + BTN_ID + ")");
    if (loginBtn instanceof HTMLElement) {
      loginBtn.style.setProperty("display", "block", "important");
      loginBtn.style.setProperty("margin-left", "auto", "important");
      loginBtn.style.setProperty("margin-right", "auto", "important");
      const btnCell = loginBtn.closest("td,th,p,div");
      if (btnCell instanceof HTMLElement) btnCell.style.setProperty("text-align", "center", "important");
    }
  }
  /**
   * Objetivo: Garante botao para alternar preview (popup) na grade.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: void.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function ensureDashboardPreviewModeToggle() {
    if (!document.body.classList.contains("hs-dashboard-page")) return;
    const filtrosForm = document.querySelector("#conteudo .filtros form[name='filtros'], form[name='filtros']");
    if (!(filtrosForm instanceof HTMLFormElement)) return;
    const headerMenu = document.getElementById("cabecalho_menu");
    const hostParent = headerMenu instanceof HTMLElement ? headerMenu : filtrosForm;

    let host = hostParent.querySelector("#hs-dashboard-settings-wrap");
    if (!(host instanceof HTMLElement)) {
      host = document.createElement("div");
      host.id = "hs-dashboard-settings-wrap";
      host.className = "hs-preview-mode-wrap";
      hostParent.appendChild(host);
    } else if (host.parentElement !== hostParent) {
      hostParent.appendChild(host);
    }
    document.querySelectorAll("form[name='filtros'] .hs-preview-mode-wrap").forEach((el) => {
      if (el !== host) el.remove();
    });
    host.querySelector("#hs-versions-btn")?.remove();
    host.querySelectorAll(".hs-settings-menu").forEach((el) => el.remove());

    let backdrop = document.getElementById("hs-settings-backdrop");
    if (!(backdrop instanceof HTMLElement)) {
      backdrop = document.createElement("div");
      backdrop.id = "hs-settings-backdrop";
      backdrop.className = "hs-settings-backdrop";
      backdrop.setAttribute("aria-hidden", "true");
      document.body.appendChild(backdrop);
    } else if (!backdrop.isConnected) {
      document.body.appendChild(backdrop);
    }

    let settingsBtn = host.querySelector("#hs-settings-menu-btn");
    if (!(settingsBtn instanceof HTMLButtonElement)) {
      settingsBtn = document.createElement("button");
      settingsBtn.type = "button";
      settingsBtn.id = "hs-settings-menu-btn";
      settingsBtn.className = "hs-settings-toggle";
      settingsBtn.innerHTML = `
        <span class="hs-settings-gear" aria-hidden="true">⚙</span>
        <span class="hs-settings-label">Configuracoes</span>
        <span class="hs-settings-notice-dot" aria-hidden="true"></span>
      `;
      host.appendChild(settingsBtn);
    }

    let menu = document.getElementById("hs-settings-menu-popover");
    if (!(menu instanceof HTMLElement)) {
      menu = document.createElement("div");
      menu.id = "hs-settings-menu-popover";
      menu.className = "hs-settings-menu hs-settings-menu-popover";
      document.body.appendChild(menu);
    } else if (!menu.isConnected) {
      document.body.appendChild(menu);
    }
    const positionMenu = () => {
      if (!(menu instanceof HTMLElement) || !(settingsBtn instanceof HTMLButtonElement)) return;
      const pad = 8;
      const rect = settingsBtn.getBoundingClientRect();
      const menuRect = menu.getBoundingClientRect();
      const width = Math.max(280, Math.min(380, Math.round(menuRect.width || 340)));
      let left = Math.round(rect.right - width);
      left = Math.max(pad, Math.min(left, window.innerWidth - width - pad));

      let top = Math.round(rect.bottom + 10);
      const desiredBottom = top + Math.round(menuRect.height || 420) + pad;
      if (desiredBottom > window.innerHeight) {
        top = Math.round(rect.top - (menuRect.height || 420) - 10);
      }
      top = Math.max(pad, Math.min(top, window.innerHeight - Math.round(menuRect.height || 420) - pad));

      menu.style.setProperty("left", `${left}px`, "important");
      menu.style.setProperty("top", `${top}px`, "important");
      menu.style.setProperty("width", `${width}px`, "important");
      menu.style.setProperty("max-height", `${Math.max(220, window.innerHeight - pad * 2)}px`, "important");
      menu.style.setProperty("overflow", "auto", "important");
      const arrowRight = Math.max(18, Math.min(width - 24, Math.round(rect.right - left - 18)));
      menu.style.setProperty("--hs-settings-arrow-right", `${arrowRight}px`);
      menu.dataset.hsArrow = top < rect.top ? "up" : "down";
    };
    let menuTitle = menu.querySelector(".hs-settings-menu-title");
    if (!(menuTitle instanceof HTMLElement)) {
      menuTitle = document.createElement("p");
      menuTitle.className = "hs-settings-menu-title";
      menuTitle.textContent = "Configuracoes";
      menu.appendChild(menuTitle);
    }
    const ensureMenuDivider = () => {
      let divider = menu.querySelector(".hs-settings-divider");
      if (!(divider instanceof HTMLElement)) {
        divider = document.createElement("div");
        divider.className = "hs-settings-divider";
        menu.appendChild(divider);
      }
      return divider;
    };
    const ensureMenuGroup = (id, title) => {
      let group = menu.querySelector(`.hs-settings-group[data-group="${id}"]`);
      if (!(group instanceof HTMLElement)) {
        group = document.createElement("div");
        group.className = "hs-settings-group";
        group.dataset.group = id;
        const titleEl = document.createElement("p");
        titleEl.className = "hs-settings-group-title";
        titleEl.textContent = title;
        group.appendChild(titleEl);
        menu.appendChild(group);
      } else {
        const titleEl = group.querySelector(".hs-settings-group-title");
        if (titleEl instanceof HTMLElement) titleEl.textContent = title;
      }
      return group;
    };

    const visualGroup = ensureMenuGroup("visual", "Visualizacao");
    const styleGroup = ensureMenuGroup("style", "Aparencia");
    ensureMenuDivider();
    const scriptGroup = ensureMenuGroup("script", "Script");
    ensureMenuDivider();
    const updateGroup = ensureMenuGroup("update", "Atualizacao");

    const ensureMenuButton = (id, parent = menu) => {
      let button = menu.querySelector(`#${id}`);
      if (!(button instanceof HTMLInputElement)) {
        button = document.createElement("input");
        button.type = "button";
        button.id = id;
        button.className = "hs-preview-mode-btn";
        parent.appendChild(button);
      } else if (button.parentElement !== parent) {
        parent.appendChild(button);
      }
      return button;
    };
    const ensureMenuCard = (id, parent = menu) => {
      let card = menu.querySelector(`#${id}`);
      if (!(card instanceof HTMLElement)) {
        card = document.createElement("button");
        card.type = "button";
        card.id = id;
        card.className = "hs-settings-version-card";
        parent.appendChild(card);
      } else if (card.parentElement !== parent) {
        parent.appendChild(card);
      }
      return card;
    };

    const gridPreviewBtn = ensureMenuButton("hs-preview-mode-toggle", visualGroup);
    const consultaLayoutBtn = ensureMenuButton("hs-consulta-layout-toggle", visualGroup);
    const attachPreviewBtn = ensureMenuButton("hs-attach-preview-toggle", visualGroup);
    const attachTextPreviewBtn = ensureMenuButton("hs-attach-text-preview-toggle", visualGroup);
    const suggestionFilterBtn = ensureMenuButton("hs-suggestion-filter-toggle", visualGroup);
    const appearanceBtn = ensureMenuButton("hs-appearance-toggle", styleGroup);
    const versionCard = ensureMenuCard("hs-settings-version-card", scriptGroup);
    const updatesBtn = ensureMenuButton("hs-updates-log-btn", updateGroup);
    const checkBtn = ensureMenuButton("hs-update-check-btn", updateGroup);
    const manualBtn = ensureMenuButton("hs-update-manual-btn", updateGroup);
    const alertBtn = ensureMenuButton("hs-update-available-btn", updateGroup);
    alertBtn.classList.add("hs-update-available-btn");

    const setMenuOpen = (open) => {
      host.classList.toggle("open", !!open);
      menu.classList.toggle("open", !!open);
      settingsBtn.setAttribute("aria-expanded", open ? "true" : "false");
      if (backdrop instanceof HTMLElement) {
        backdrop.classList.toggle("open", !!open);
        backdrop.setAttribute("aria-hidden", open ? "false" : "true");
      }
      if (open) {
        positionMenu();
        window.requestAnimationFrame(positionMenu);
      }
    };
    const buildSettingsHubModel = () => {
      syncGridPreviewLabel();
      syncConsultaLayoutLabel();
      syncAttachmentPreviewLabel();
      syncTextAttachmentPreviewLabel();
      syncSuggestionFilterLabel();

      const isVisibleControl = (el) => {
        if (!(el instanceof HTMLElement)) return false;
        const inlineDisplay = String(el.style.display || "").trim().toLowerCase();
        if (inlineDisplay === "none") return false;
        if (el.hidden) return false;
        return true;
      };
      const toControl = (id, source, description = "", tone = "") => ({
        id,
        source,
        description,
        tone,
        hidden: !isVisibleControl(source),
      });

      const controlsVisualGrade = [
        toControl(
          "preview-grid",
          gridPreviewBtn,
          "Define se a grade abre chamado em popup interno ou em nova guia."
        ),
        toControl(
          "consulta-layout",
          consultaLayoutBtn,
          "Ativa o painel profissional da consulta com KPIs e filtros rapidos."
        ),
        toControl(
          "sugestao-filter",
          suggestionFilterBtn,
          "Oculta/exibe o filtro 'Sugestao de melhoria' no dashboard."
        ),
      ].filter((item) => !item.hidden);

      const controlsVisualAnexos = [
        toControl("preview-image", attachPreviewBtn, "Preview em modal para anexos de imagem."),
        toControl("preview-text", attachTextPreviewBtn, "Preview textual para anexos TXT/SQL."),
      ].filter((item) => !item.hidden);

      const controlsAparencia = [
        toControl(
          "appearance-main",
          appearanceBtn,
          "Abre os controles de fonte, tema, bordas e refinamento da grade salvos por tema."
        ),
      ].filter((item) => !item.hidden);

      const controlsAtualizacao = [
        toControl("update-alert", alertBtn, "Notificacao de nova versao/correcao obrigatoria.", "warn"),
        toControl("update-check", checkBtn, "Consulta versao remota no GitHub."),
        toControl("update-manual", manualBtn, "Abre codigo remoto para update manual."),
        toControl("update-log", updatesBtn, "Exibe historico completo de atualizacoes."),
      ].filter((item) => !item.hidden);

      const controlsScript = [
        toControl("script-version", versionCard, "Versao atual e commit principal.", "card"),
      ].filter((item) => !item.hidden);

      return {
        title: "Configuracoes",
        subtitle: "Painel organizado por guias e subguias para ajustes rapidos.",
        tabs: [
          {
            id: "visualizacao",
            label: "Visualizacao",
            subtabs: [
              {
                id: "grade",
                label: "Grade",
                description: "Comportamento da grade principal e filtros de operacao.",
                controls: controlsVisualGrade,
              },
              {
                id: "anexos",
                label: "Anexos",
                description: "Comportamento de preview para arquivos de imagem e texto.",
                controls: controlsVisualAnexos,
              },
            ],
          },
          {
            id: "aparencia",
            label: "Aparencia",
            subtabs: [
              {
                id: "tema",
                label: "Tema e Layout",
                description: "Fonte, cores gerais e dimensoes visuais do dashboard.",
                controls: controlsAparencia,
              },
            ],
          },
          {
            id: "situacoes",
            label: "Situacoes",
            subtabs: [
              {
                id: "cores",
                label: "Cores por situacao",
                description:
                  "Personalize cor da linha inteira, texto e badges para qualquer situacao detectada na tela.",
                statusColors: true,
                controls: [],
              },
            ],
          },
          {
            id: "atualizacao",
            label: "Atualizacao",
            subtabs: [
              {
                id: "fluxo",
                label: "Fluxo de update",
                description: "Acompanhe novas versoes e execute atualizacao manual quando desejar.",
                controls: controlsAtualizacao,
              },
            ],
          },
          {
            id: "script",
            label: "Script",
            subtabs: [
              {
                id: "versao",
                label: "Versao",
                description: "Informacoes tecnicas da versao instalada.",
                controls: controlsScript,
              },
            ],
          },
        ],
        statusColors: {
          theme: resolveAppearanceThemeMode(),
          entries: getSituacaoColorEntriesForSettings(resolveAppearanceThemeMode()),
          onCreate: (payload = {}) => {
            const label = sanitizeSituacaoColorLabel(payload.label || "");
            if (!label) return;
            const key = normalizeSituacaoColorKey(label);
            const scopedMode = resolveAppearanceThemeMode();
            const defaultTextColor = scopedMode === "light" ? "#1F3D62" : "#DCE6F2";
            setSituacaoColorFieldForKey(key, "textColor", defaultTextColor, scopedMode);
            toast(`Situacao '${label}' adicionada para personalizacao.`, "ok", 2200);
          },
          onChange: (payload = {}) => {
            const key = String(payload.key || "").trim();
            const field = String(payload.field || "").trim();
            const value = String(payload.value || "").trim();
            setSituacaoColorFieldForKey(key, field, value, resolveAppearanceThemeMode());
          },
          onResetEntry: (payload = {}) => {
            const key = String(payload.key || "").trim();
            if (!key) return;
            if (resetSituacaoColorForKey(key, resolveAppearanceThemeMode())) {
              const label = sanitizeSituacaoColorLabel(payload.label || key);
              toast(`Cores da situacao '${label}' restauradas.`, "ok", 2200);
            }
          },
          onResetAll: () => {
            resetAllSituacaoColorSettings(resolveAppearanceThemeMode());
            toast("Todas as cores de situacao foram restauradas.", "ok", 2200);
          },
          onRefresh: () => getSituacaoColorEntriesForSettings(resolveAppearanceThemeMode()),
        },
      };
    };
    const openSettingsHubModal = () => {
      const api = getUser2SettingsApi();
      if (!api || typeof api.openSettingsHub !== "function") return false;
      try {
        api.openSettingsHub({
          id: "hs-settings-hub-main",
          buildModel: buildSettingsHubModel,
        });
        return true;
      } catch (err) {
        console.warn("[HeadsoftHelper] Falha ao abrir modal de configuracoes em guias:", err);
        return false;
      }
    };
    if (host.dataset.hsSettingsBind !== "1") {
      host.dataset.hsSettingsBind = "1";
      settingsBtn.addEventListener("click", (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        if (openSettingsHubModal()) {
          setMenuOpen(false);
          return;
        }
        setMenuOpen(!host.classList.contains("open"));
      });
      document.addEventListener(
        "click",
        (ev) => {
          const target = ev.target instanceof Node ? ev.target : null;
          if (target && (host.contains(target) || menu.contains(target))) return;
          setMenuOpen(false);
        },
        true
      );
      document.addEventListener("keydown", (ev) => {
        if (String(ev.key || "").toLowerCase() !== "escape") return;
        closeAppearanceModal();
        setMenuOpen(false);
      });
      window.addEventListener("resize", () => {
        if (host.classList.contains("open")) positionMenu();
      });
      window.addEventListener(
        "scroll",
        () => {
          if (host.classList.contains("open")) positionMenu();
        },
        true
      );
    }
    settingsBtn.title = "Abrir configuracoes do script";
    if (backdrop instanceof HTMLElement && backdrop.dataset.hsBackdropBind !== "1") {
      backdrop.dataset.hsBackdropBind = "1";
      backdrop.addEventListener(
        "click",
        (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          setMenuOpen(false);
        },
        true
      );
    }
    const renderSettingsVersionCard = (commitMeta = null) => {
      if (!(versionCard instanceof HTMLButtonElement)) return;
      const metaShort = String(commitMeta?.shaShort || "").trim();
      const dateShort = String(commitMeta?.dateShort || "").trim();
      const metaText = metaShort ? `#${metaShort}${dateShort ? ` ${dateShort}` : ""}` : "commit ...";
      versionCard.innerHTML = `<span class="hs-main">v${SCRIPT_VERSION}</span><span class="hs-meta">${metaText}</span>`;
      versionCard.title = metaShort
        ? commitMeta?.message
          ? `Versao ${SCRIPT_VERSION}\nCommit ${metaShort} (${dateShort || "sem data"})\n${commitMeta.message}`
          : `Versao ${SCRIPT_VERSION}\nCommit ${metaShort} (${dateShort || "sem data"})`
        : `Versao ${SCRIPT_VERSION}\nBuscando ultimo commit...`;
      versionCard.dataset.hsCommitUrl = String(commitMeta?.url || "").trim();
      versionCard.style.setProperty("cursor", versionCard.dataset.hsCommitUrl ? "pointer" : "default", "important");
    };
    renderSettingsVersionCard(hsLatestCommitMeta || readCachedLatestCommitMeta());
    if (versionCard instanceof HTMLButtonElement && versionCard.dataset.hsCardBound !== "1") {
      versionCard.dataset.hsCardBound = "1";
      versionCard.addEventListener("click", (ev) => {
        const commitUrl = String(versionCard.dataset.hsCommitUrl || "").trim();
        if (!commitUrl) return;
        ev.preventDefault();
        ev.stopPropagation();
        window.open(commitUrl, "_blank", "noopener");
      });
    }
    if (versionCard instanceof HTMLButtonElement && versionCard.dataset.hsCommitLoadStarted !== "1") {
      versionCard.dataset.hsCommitLoadStarted = "1";
      fetchLatestMainCommitMeta(false).then((meta) => {
        if (!meta) return;
        renderSettingsVersionCard(meta);
      });
    }

    const syncGridPreviewLabel = () => {
      const enabled = isPreviewOnlyModeEnabled();
      gridPreviewBtn.value = enabled ? "Preview chamados ON" : "Preview chamados OFF";
      gridPreviewBtn.title = enabled
        ? "Modo preview ativo: clique abre em popup."
        : "Modo preview desativado: clique abre em nova guia.";
    };
    const syncConsultaLayoutLabel = () => {
      const isConsultaPage = /consulta_requisicao\.php/i.test(location.pathname);
      consultaLayoutBtn.style.setProperty("display", isConsultaPage ? "block" : "none", "important");
      if (!isConsultaPage) return;
      const enabled = isConsultaProLayoutEnabled();
      consultaLayoutBtn.value = enabled ? "Painel consulta ON" : "Painel consulta OFF";
      consultaLayoutBtn.title = enabled
        ? "Painel lateral profissional ativo na consulta de requisicoes."
        : "Painel lateral profissional desligado na consulta de requisicoes.";
    };
    const syncAttachmentPreviewLabel = () => {
      const enabled = isAttachmentImagePreviewEnabled();
      attachPreviewBtn.value = enabled ? "Preview PNG/JPG ON" : "Preview PNG/JPG OFF";
      attachPreviewBtn.title = enabled
        ? "Preview de anexos PNG/JPG (locais e recebidos) ativo."
        : "Preview de anexos desativado. Clique abre em nova guia.";
    };
    const syncTextAttachmentPreviewLabel = () => {
      const enabled = isAttachmentTextPreviewEnabled();
      attachTextPreviewBtn.value = enabled ? "Preview TXT/SQL ON" : "Preview TXT/SQL OFF";
      attachTextPreviewBtn.title = enabled
        ? "Preview de anexos TXT/SQL ativo."
        : "Preview TXT/SQL desativado. Arquivos abrem no fluxo original.";
    };
    const syncSuggestionFilterLabel = () => {
      const enabled = isHideSuggestionFilterEnabled();
      suggestionFilterBtn.value = enabled ? "Ocultar sugestao ON" : "Ocultar sugestao OFF";
      suggestionFilterBtn.title = enabled
        ? "A linha 'Sugestao de melhoria' esta oculta nos filtros."
        : "A linha 'Sugestao de melhoria' fica visivel nos filtros.";
    };
    const refreshSettingsNotification = (result = null) => {
      const state = result || hsScriptUpdateLastResult || readCachedUpdateCheckResult();
      const hasUpdate = !!state?.hasUpdate && compareVersionTexts(String(state?.remoteVersion || ""), SCRIPT_VERSION) > 0;
      const mandatoryUpdate = isMandatoryUpdateResult(state);
      settingsBtn.classList.toggle("has-notification", hasUpdate);
      if (hasUpdate) {
        const remoteVersion = String(state?.remoteVersion || "").trim();
        settingsBtn.title = mandatoryUpdate
          ? `Configuracoes: correcao obrigatoria ${remoteVersion} pendente.`
          : `Configuracoes: nova versao ${remoteVersion} disponivel.`;
        return;
      }
      settingsBtn.title = "Abrir configuracoes do script";
    };

    const applyUpdateState = (result) => {
      const hasUpdate = !!result?.hasUpdate && !!String(result?.remoteVersion || "").trim();
      if (!hasUpdate) {
        alertBtn.style.setProperty("display", "none", "important");
        delete alertBtn.dataset.hsRemoteUrl;
        delete alertBtn.dataset.hsRemoteVersion;
        delete alertBtn.dataset.hsMandatory;
        delete alertBtn.dataset.hsMandatoryVersion;
        delete alertBtn.dataset.hsMandatoryReason;
        refreshSettingsNotification(result);
        return;
      }
      const remoteVersion = String(result.remoteVersion || "").trim();
      const mandatoryUpdate = isMandatoryUpdateResult(result);
      const mandatoryVersion = String(result?.mandatoryVersion || remoteVersion).trim() || remoteVersion;
      const mandatoryReason = String(result?.mandatoryReason || "").trim();
      alertBtn.value = mandatoryUpdate ? `Correcao obrigatoria ${remoteVersion}` : `Nova versao ${remoteVersion}`;
      alertBtn.title = mandatoryUpdate
        ? `Correcao obrigatoria detectada (${remoteVersion}). Atualizacao necessaria.`
        : `Existe atualizacao disponivel (${remoteVersion}). Clique para ver detalhes e atualizar.`;
      alertBtn.dataset.hsRemoteUrl = String(result?.remoteUrl || "").trim();
      alertBtn.dataset.hsRemoteVersion = remoteVersion;
      alertBtn.dataset.hsMandatory = mandatoryUpdate ? "1" : "0";
      alertBtn.dataset.hsMandatoryVersion = mandatoryVersion;
      alertBtn.dataset.hsMandatoryReason = mandatoryReason;
      alertBtn.style.setProperty("display", "block", "important");
      showUpdatePopupOnce(result);
      refreshSettingsNotification(result);
    };

    gridPreviewBtn.onclick = (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      const next = !isPreviewOnlyModeEnabled();
      setPreviewOnlyModeEnabled(next);
      syncGridPreviewLabel();
      toast(next ? "Modo preview ativado." : "Modo preview desativado.", "ok", 2200);
      setMenuOpen(false);
    };
    consultaLayoutBtn.onclick = (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      const next = !isConsultaProLayoutEnabled();
      setConsultaProLayoutEnabled(next);
      syncConsultaLayoutLabel();
      ensureConsultaProLayout();
      normalizeDashboardTableWidths();
      toast(
        next
          ? "Painel lateral da consulta ativado."
          : "Painel lateral da consulta desativado.",
        "ok",
        2600
      );
      setMenuOpen(false);
    };
    attachPreviewBtn.onclick = (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      const next = !isAttachmentImagePreviewEnabled();
      setAttachmentImagePreviewEnabled(next);
      syncAttachmentPreviewLabel();
      toast(
        next
          ? "Preview de anexos PNG/JPG ativado."
          : "Preview de anexos desativado. Arquivos abrem em nova guia.",
        "ok",
        2600
      );
      setMenuOpen(false);
    };
    attachTextPreviewBtn.onclick = (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      const next = !isAttachmentTextPreviewEnabled();
      setAttachmentTextPreviewEnabled(next);
      syncTextAttachmentPreviewLabel();
      toast(
        next
          ? "Preview TXT/SQL ativado."
          : "Preview TXT/SQL desativado. Arquivos voltam ao comportamento original.",
        "ok",
        2600
      );
      setMenuOpen(false);
    };
    appearanceBtn.value = "Aparencia visual";
    appearanceBtn.title = "Escolher fonte, cores, bordas e largura da grade (salvo por tema)";
    appearanceBtn.onclick = (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      openAppearanceModal();
      setMenuOpen(false);
    };
    suggestionFilterBtn.onclick = (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      const next = !isHideSuggestionFilterEnabled();
      setHideSuggestionFilterEnabled(next);
      syncSuggestionFilterLabel();
      hideSomeFilters();
      toast(
        next
          ? "Filtro 'Sugestao de melhoria' ocultado."
          : "Filtro 'Sugestao de melhoria' visivel.",
        "ok",
        2600
      );
      setMenuOpen(false);
    };
    updatesBtn.value = "Atualizacoes";
    updatesBtn.title = "Ver ultimas atualizacoes do script";
    updatesBtn.onclick = async (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      try {
        await showRecentUpdatesDialog();
        refreshSettingsNotification();
      } catch {
        toast("Nao foi possivel abrir o historico de atualizacoes agora.", "err", 3000);
      }
      setMenuOpen(false);
    };
    checkBtn.value = "Verificar update";
    checkBtn.title = "Verifica no GitHub se existe nova versao do script";
    checkBtn.onclick = async (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      if (checkBtn.dataset.hsBusy === "1") return;
      checkBtn.dataset.hsBusy = "1";
      const oldLabel = checkBtn.value;
      checkBtn.value = "Verificando...";
      checkBtn.disabled = true;
      try {
        const result = await checkScriptUpdateAvailability(true);
        applyUpdateState(result);
        if (result?.hasUpdate) {
          if (isMandatoryUpdateResult(result)) {
            toast(`Correcao obrigatoria ${result.remoteVersion} detectada.`, "err", 3600);
          } else {
            toast(`Nova versao ${result.remoteVersion} disponivel.`, "info", 3000);
          }
        } else if (result?.ok) {
          toast("Voce ja esta na versao mais recente.", "ok", 2500);
        } else {
          toast("Nao foi possivel verificar atualizacao agora.", "err", 3200);
        }
      } finally {
        checkBtn.disabled = false;
        checkBtn.value = oldLabel;
        delete checkBtn.dataset.hsBusy;
      }
      setMenuOpen(false);
    };
    manualBtn.value = "Codigo update";
    manualBtn.title = "Abrir e copiar codigo para colar manualmente no Tampermonkey";
    manualBtn.onclick = async (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      if (manualBtn.dataset.hsBusy === "1") return;
      manualBtn.dataset.hsBusy = "1";
      const oldLabel = manualBtn.value;
      manualBtn.value = "Preparando...";
      manualBtn.disabled = true;
      try {
        const state = hsScriptUpdateLastResult || readCachedUpdateCheckResult() || {};
        const mandatory = isMandatoryUpdateResult(state);
        await openManualUpdateGuide(
          mandatory
            ? {
                mandatory: true,
                mandatoryVersion: String(state?.mandatoryVersion || state?.remoteVersion || "").trim(),
                mandatoryReason: String(state?.mandatoryReason || "").trim(),
              }
            : {}
        );
      } catch (err) {
        toast("Nao foi possivel abrir o codigo remoto agora.", "err", 3200);
      } finally {
        manualBtn.disabled = false;
        manualBtn.value = oldLabel;
        delete manualBtn.dataset.hsBusy;
      }
      setMenuOpen(false);
    };
    alertBtn.onclick = (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      const remoteVersion = String(alertBtn.dataset.hsRemoteVersion || "").trim();
      const mandatoryUpdate = parseBooleanLike(alertBtn.dataset.hsMandatory);
      const mandatoryVersion = String(alertBtn.dataset.hsMandatoryVersion || remoteVersion).trim();
      const mandatoryReason = String(alertBtn.dataset.hsMandatoryReason || "").trim();
      showRecentUpdatesDialog({
        forceRefresh: true,
        remoteVersion,
        remoteUrl: String(alertBtn.dataset.hsRemoteUrl || ""),
        highlightVersion: mandatoryVersion || remoteVersion,
        checkedAt: Date.now(),
        mandatoryUpdate,
        mandatoryVersion,
        mandatoryReason,
      }).catch(() => {
        openScriptUpdatePage(alertBtn.dataset.hsRemoteUrl || "");
      });
      setMenuOpen(false);
    };
    const cached = hsScriptUpdateLastResult || readCachedUpdateCheckResult();
    applyUpdateState(cached);

    const root = document.documentElement;
    if (root?.dataset?.hsUpdateAutoCheckStarted !== "1") {
      if (root?.dataset) root.dataset.hsUpdateAutoCheckStarted = "1";
      checkScriptUpdateAvailability(false)
        .then((result) => applyUpdateState(result))
        .catch(() => {});
    }

    syncGridPreviewLabel();
    syncConsultaLayoutLabel();
    syncAttachmentPreviewLabel();
    syncTextAttachmentPreviewLabel();
    syncSuggestionFilterLabel();
    refreshSettingsNotification(cached);
  }
  /**
   * Objetivo: Persiste credenciais da tela de login para reduzir relogins.
   *
   * Contexto: Tela de login (antes de entrar no dashboard).
   * Parametros: nenhum.
   * Retorno: void.
   * Efeitos colaterais: leitura/escrita de localStorage e preenchimento de campos.
   */
  function ensureLoginPersistence() {
    const hasPassword = document.querySelector('input[type="password"]');
    const hasMainContent = document.querySelector("#conteudo table.sortable");
    if (!(hasPassword instanceof HTMLInputElement) || hasMainContent) return;

    const form =
      hasPassword.form ||
      hasPassword.closest("form") ||
      document.querySelector("form");
    if (!(form instanceof HTMLFormElement)) return;
    if (form.dataset.hsLoginPersist === "1") return;
    form.dataset.hsLoginPersist = "1";

    const userInput = Array.from(form.querySelectorAll("input")).find((el) => {
      if (!(el instanceof HTMLInputElement)) return false;
      if (el === hasPassword) return false;
      if (el.disabled || el.readOnly) return false;
      if (el.type === "hidden") return false;
      const t = (el.type || "text").toLowerCase();
      return t === "text" || t === "email";
    });
    if (!(userInput instanceof HTMLInputElement)) return;

    let saved = null;
    try {
      saved = JSON.parse(localStorage.getItem(LOGIN_REMEMBER_KEY) || "null");
    } catch {
      saved = null;
    }
    if (saved && typeof saved.user === "string" && typeof saved.pass === "string") {
      if (!userInput.value) userInput.value = saved.user;
      if (!hasPassword.value) hasPassword.value = saved.pass;
    }

    const persist = () => {
      const user = String(userInput.value || "").trim();
      const pass = String(hasPassword.value || "");
      if (!user || !pass) return;
      try {
        localStorage.setItem(
          LOGIN_REMEMBER_KEY,
          JSON.stringify({
            user,
            pass,
            updatedAt: Date.now(),
          })
        );
      } catch {}
    };

    form.addEventListener("submit", persist, true);
    const submitBtn = form.querySelector("input[type='submit'], button[type='submit'], input[type='button']");
    if (submitBtn instanceof HTMLElement) submitBtn.addEventListener("click", persist, true);
  }
  /**
   * Objetivo: Aplica layout moderno Ã  pÃ¡gina inicial do suporte.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: void.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function styleHomePage() {
    const hasPassword = document.querySelector('input[type="password"]');
    if (hasPassword) return;

    const welcomeNode = Array.from(document.querySelectorAll("td,div,strong,b")).find((el) =>
      /bem-vindo ao headsoft service desk/i.test((el.textContent || "").trim())
    );
    if (!welcomeNode) return;

    document.body.classList.add("hs-home-page");

    const homeTable =
      welcomeNode.closest("table") ||
      document.querySelector("#conteudo table");
    if (homeTable) homeTable.classList.add("hs-home-card");
  }
  /**
   * Objetivo: Classifica a tela como dashboard para ativar estilos e regras especÃ­ficas.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: void.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function styleDashboardPage() {
    const hasPassword = document.querySelector('input[type="password"]');
    if (hasPassword) return;
    const path = String(location.pathname || "").toLowerCase();
    const isDashboardLikePath = /(?:^|\/)(dashboard|consulta_requisicao)\.php$/.test(path);
    const isConsultaPage = /(?:^|\/)consulta_requisicao\.php$/.test(path);
    const hasGrid = document.querySelector("table.sortable");
    const hasFiltros = document.querySelector('form[name="filtros"]');
    if (!isDashboardLikePath && !hasFiltros) return;
    if (!hasGrid && !hasFiltros) {
      const conteudoTxt = norm(document.getElementById("conteudo")?.textContent || "");
      if (!/nenhuma\s+requisic/.test(conteudoTxt)) return;
    }
    document.body.classList.add("hs-dashboard-page");
    document.body.classList.toggle("hs-consulta-page", isConsultaPage);
  }
  /**
   * Objetivo: Padroniza mensagem de estado vazio no dashboard/consulta.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: void.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function ensureDashboardEmptyState() {
    if (!document.body.classList.contains("hs-dashboard-page")) return;
    const conteudo = document.getElementById("conteudo");
    if (!(conteudo instanceof HTMLElement)) return;

    const hasGrid = !!conteudo.querySelector("table.sortable");
    const hasRows = !!conteudo.querySelector("table.sortable tbody tr td");
    const isEmpty = !hasGrid || !hasRows;

    const isEmptyMsg = (txt) => /^nenhuma\s+requisic/.test(norm(txt).replace(/\s+/g, " ").trim());
    const addClassIfEmpty = (el) => {
      if (!(el instanceof HTMLElement)) return;
      if (!isEmpty) {
        el.classList.remove("hs-dashboard-empty");
        return;
      }
      if (!isEmptyMsg(el.textContent || "")) return;
      if (el.querySelector("table, form")) return;
      el.classList.add("hs-dashboard-empty");
    };

    Array.from(conteudo.querySelectorAll("b,strong,div,p,span,font,h1,h2,h3,td")).forEach(addClassIfEmpty);

    if (!isEmpty) return;
    const directTextNode = Array.from(conteudo.childNodes).find(
      (node) => node.nodeType === Node.TEXT_NODE && isEmptyMsg(node.textContent || "")
    );
    if (directTextNode) {
      const holder = document.createElement("div");
      holder.className = "hs-dashboard-empty";
      holder.textContent = String(directTextNode.textContent || "").replace(/\s+/g, " ").trim();
      conteudo.replaceChild(holder, directTextNode);
    }
  }
  /**
   * Objetivo: Remove estrutura legada do quadro "Novas requisiÃ§Ãµes" quando presente.
   *
   * Contexto: Feature desativada por solicitaÃ§Ã£o do usuÃ¡rio.
   * Parametros: nenhum.
   * Retorno: void.
   * Efeitos colaterais: remove elementos antigos do DOM e restaura linhas ocultas.
   */
  function ensureDashboardNovasSection() {
    document
      .querySelectorAll(
        "#hs2025-dashboard-show-novas-wrap,#hs2025-dashboard-show-novas-toggle,#hs2025-dashboard-novas-section"
      )
      .forEach((el) => el.remove());
    document.querySelectorAll("table.sortable tbody tr[data-hs-nova-hidden='1']").forEach((tr) => {
      tr.style.removeProperty("display");
      tr.removeAttribute("data-hs-nova-hidden");
    });
  }
  /**
   * Objetivo: Resolve secao "Em servico" (cabecalho + grade) no dashboard.
   *
   * Contexto: usado pelo novo checkbox para exibir/ocultar o bloco no grid principal.
   * Parametros: nenhum.
   * Retorno: Array<{header:HTMLElement, table:HTMLTableElement, between:HTMLElement[]}>.
   */
  function getDashboardEmServicoSectionTargets() {
    if (!document.body.classList.contains("hs-dashboard-page")) return [];
    const targets = [];
    const seenTables = new Set();
    const headers = Array.from(
      document.querySelectorAll("#conteudo h1, #conteudo h2, #conteudo h3, #conteudo div, #conteudo span, #conteudo strong, #conteudo b")
    ).filter((el) => {
      if (!(el instanceof HTMLElement)) return false;
      const txt = norm(el.textContent || "")
        .replace(/\s+/g, " ")
        .trim();
      if (!/^em\s+servic/.test(txt)) return false;
      if (/servic.*aprovad/.test(txt)) return false;
      return true;
    });
    headers.forEach((header) => {
      let sib = header.nextElementSibling;
      const between = [];
      let table = null;
      while (sib) {
        if (sib.matches && sib.matches("table.sortable")) {
          table = sib;
          break;
        }
        if (/^h[1-3]$/i.test(String(sib.tagName || ""))) break;
        if (sib instanceof HTMLElement) between.push(sib);
        sib = sib.nextElementSibling;
      }
      if (!(table instanceof HTMLTableElement)) return;
      if (seenTables.has(table)) return;
      seenTables.add(table);
      targets.push({ header, table, between });
    });
    return targets;
  }
  /**
   * Objetivo: Aplica visibilidade da secao "Em servico" no dashboard.
   *
   * Contexto: refletido pelo checkbox customizado no formulario de filtros.
   * Parametros:
   * - forceEnabled: boolean opcional para sobrescrever preferencia salva.
   * Retorno: void.
   */
  function applyDashboardEmServicoSectionVisibility(forceEnabled = null) {
    if (!document.body.classList.contains("hs-dashboard-page")) return;
    const enabled = typeof forceEnabled === "boolean" ? forceEnabled : isDashboardEmServicoSectionEnabled();
    const markNode = (node, visible) => {
      if (!(node instanceof HTMLElement)) return;
      if (visible) {
        if (node.dataset.hsEmServicoHidden !== "1") return;
        const prev = String(node.dataset.hsEmServicoPrevDisplay || "");
        if (prev) node.style.setProperty("display", prev, "important");
        else node.style.removeProperty("display");
        delete node.dataset.hsEmServicoHidden;
        delete node.dataset.hsEmServicoPrevDisplay;
        return;
      }
      if (node.dataset.hsEmServicoHidden !== "1") {
        node.dataset.hsEmServicoPrevDisplay = node.style.display || "";
      }
      node.dataset.hsEmServicoHidden = "1";
      node.style.setProperty("display", "none", "important");
    };

    getDashboardEmServicoSectionTargets().forEach((target) => {
      markNode(target.header, enabled);
      target.between.forEach((node) => markNode(node, enabled));
      markNode(target.table, enabled);
    });
  }
  /**
   * Objetivo: Injeta checkbox "Exibir Em servico" junto aos filtros principais.
   *
   * Contexto: permite ligar/desligar a secao de atendimento em servico no dashboard.
   * Parametros: nenhum.
   * Retorno: void.
   */
  function ensureDashboardEmServicoSectionToggle() {
    if (!document.body.classList.contains("hs-dashboard-page")) return;
    const form = document.querySelector("#conteudo .filtros form[name='filtros'], form[name='filtros']");
    if (!(form instanceof HTMLFormElement)) {
      applyDashboardEmServicoSectionVisibility();
      return;
    }

    const resolvePlacement = () => {
      const labels = Array.from(form.querySelectorAll("label")).filter((el) => {
        const labelTxt = norm(el.textContent || "");
        return /sem\s+responsavel|retorno\s+externo|exibir\s+historic/.test(labelTxt);
      });
      const anchor =
        labels.find((el) => /exibir\s+historic/.test(norm(el.textContent || ""))) ||
        labels.find((el) => /retorno\s+externo/.test(norm(el.textContent || ""))) ||
        labels.find((el) => /sem\s+responsavel/.test(norm(el.textContent || ""))) ||
        labels[labels.length - 1] ||
        null;
      if (anchor instanceof HTMLElement && anchor.parentElement instanceof HTMLElement) {
        return { host: anchor.parentElement, anchor };
      }

      const tdWithChecks = Array.from(form.querySelectorAll("td")).find(
        (td) => td.querySelectorAll('input[type="checkbox"]').length >= 2
      );
      if (tdWithChecks instanceof HTMLElement) return { host: tdWithChecks, anchor: null };

      const firstTd = form.querySelector("td");
      return { host: firstTd instanceof HTMLElement ? firstTd : form, anchor: null };
    };

    const { host, anchor } = resolvePlacement();
    let wrap = form.querySelector("#hs2025-dashboard-em-servico-wrap");
    if (!(wrap instanceof HTMLElement)) {
      wrap = document.createElement("div");
      wrap.id = "hs2025-dashboard-em-servico-wrap";
      wrap.className = "hs-dashboard-extra-toggle-wrap";
      wrap.innerHTML =
        '<input type="checkbox" id="hs2025-dashboard-em-servico-toggle" /><label class="hs-dashboard-extra-toggle" for="hs2025-dashboard-em-servico-toggle">Exibir Em servico</label>';
    }
    if (anchor instanceof HTMLElement && anchor.parentElement === host) {
      let insertRef = anchor.nextSibling;
      while (insertRef && insertRef.nodeType === Node.TEXT_NODE && !String(insertRef.textContent || "").trim()) {
        insertRef = insertRef.nextSibling;
      }
      if (insertRef instanceof HTMLElement && insertRef.tagName === "BR") insertRef = insertRef.nextSibling;
      const needsMove = wrap.parentElement !== host || (insertRef ? wrap.nextSibling !== insertRef : host.lastElementChild !== wrap);
      if (needsMove) {
        host.insertBefore(wrap, insertRef || null);
      }
    } else if (wrap.parentElement !== host) {
      host.appendChild(wrap);
    }

    const checkbox = wrap.querySelector("#hs2025-dashboard-em-servico-toggle");
    if (!(checkbox instanceof HTMLInputElement)) {
      applyDashboardEmServicoSectionVisibility();
      return;
    }
    checkbox.checked = isDashboardEmServicoSectionEnabled();
    if (checkbox.dataset.hsBound !== "1") {
      checkbox.dataset.hsBound = "1";
      checkbox.addEventListener("change", () => {
        const enabled = !!checkbox.checked;
        setDashboardEmServicoSectionEnabled(enabled);
        applyDashboardEmServicoSectionVisibility(enabled);
        toast(enabled ? "Secao 'Em servico' exibida." : "Secao 'Em servico' ocultada.", "ok", 2200);
      });
    }

    applyDashboardEmServicoSectionVisibility(!!checkbox.checked);
  }
  /**
   * Objetivo: Classifica a tela como visualizar requisiÃ§Ã£o para regras especÃ­ficas.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: void.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function styleRequestPage() {
    const hasPassword = document.querySelector('input[type="password"]');
    if (hasPassword) return;
    if (!/visualizar_requisicao\.php/i.test(location.pathname)) return;
    document.body.classList.add("hs-request-page");
    if (isRequestPopupPreviewMode()) document.body.classList.add("hs-request-popup-preview");
    else document.body.classList.remove("hs-request-popup-preview");
  }
  /**
   * Objetivo: Reestrutura visual e aÃ§Ãµes do formulÃ¡rio de usuÃ¡rio.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: void.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function styleUserFormPage() {
    if (!/visualizar_usuario\.php/i.test(location.pathname)) return;
    document.body.classList.add("hs-user-form-page");

    const conteudo = document.getElementById("conteudo") || document.body;
    const form = conteudo.querySelector("form");
    if (!form) return;

    let shell = document.getElementById("hs-user-form-shell");
    if (!(shell instanceof HTMLElement)) {
      shell = document.createElement("div");
      shell.id = "hs-user-form-shell";
      shell.className = "hs-user-form-shell";
    }
    if (!shell.contains(form)) {
      form.parentElement?.insertBefore(shell, form);
      shell.appendChild(form);
    }

    const tables = Array.from(form.querySelectorAll("table"));
    if (!tables.length) return;

    const hasTextField = (tb) => !!tb.querySelector('input[type="text"], input[type="email"], select');
    const hasPassField = (tb) => !!tb.querySelector('input[type="password"]');

    const infoTable = tables.find((tb) => hasTextField(tb) && !hasPassField(tb)) || null;
    const passTable = tables.find((tb) => hasPassField(tb)) || null;
    if (infoTable) infoTable.classList.add("hs-user-info-table");
    if (passTable) passTable.classList.add("hs-user-pass-table");
    if (passTable) {
      passTable
        .querySelectorAll("table,thead,tbody,tfoot,tr,td,th,[bgcolor]")
        .forEach((el) => el.removeAttribute("bgcolor"));
      passTable.querySelectorAll("table,thead,tbody,tfoot,tr,td,th").forEach((el) => {
        el.style.removeProperty("background");
        el.style.removeProperty("background-color");
        el.style.removeProperty("background-image");
        el.style.removeProperty("color");
        el.style.removeProperty("border");
        el.style.removeProperty("border-color");
        el.style.removeProperty("border-top");
        el.style.removeProperty("border-right");
        el.style.removeProperty("border-bottom");
        el.style.removeProperty("border-left");
        el.style.removeProperty("box-shadow");
      });
    }

    const getDirectTableRows = (tb) =>
      Array.from(tb?.rows || []).filter((tr) => tr instanceof HTMLTableRowElement && tr.closest("table") === tb);

    const prepareMainTable = (tb) => {
      if (!(tb instanceof HTMLTableElement)) return;
      tb.classList.add("hs-user-main-table");
      tb.removeAttribute("width");
      tb.style.removeProperty("width");
      tb.style.removeProperty("max-width");

      getDirectTableRows(tb).forEach((tr) => {
        tr.classList.add("hs-user-form-row");
        const cells = Array.from(tr.cells || []);
        cells.forEach((cell, idx) => {
          cell.removeAttribute("width");
          cell.style.removeProperty("width");
          cell.classList.add(idx === 0 ? "hs-user-form-label-cell" : "hs-user-form-value-cell");
        });
        if (cells.length <= 1) tr.classList.add("hs-user-row-full");
        if (tr.querySelector('input[type="checkbox"]')) tr.classList.add("hs-user-row-checkbox");
        if (tr.querySelector('input[type="password"]')) tr.classList.add("hs-user-row-password");
      });
    };

    const hideHeaderSearchRef = () => {
      const header = document.getElementById("cabecalho") || document.getElementById("cabecalho_menu");
      if (!header) return;

      const isTarget = (txt) => /pesquisa|referenc/.test(norm(txt || ""));

      const hideNode = (node) => {
        if (!(node instanceof HTMLElement)) return;
        node.classList.add("hs-hide-on-user-form");
      };

      const hideFieldGroup = (el) => {
        if (!(el instanceof HTMLElement)) return;

        const cell = el.closest("td,th");
        if (cell && header.contains(cell)) {
          hideNode(cell);

          const isIconOnlyCell = (node) => {
            if (!(node instanceof HTMLElement)) return false;
            if (!/^(td|th)$/i.test(node.tagName)) return false;
            if (node.querySelector("input,select,textarea,button,a")) return false;
            const txt = norm(node.textContent || "").trim();
            return !txt || isTarget(txt) || !!node.querySelector("img,svg,i");
          };

          if (isIconOnlyCell(cell.previousElementSibling)) hideNode(cell.previousElementSibling);
          if (isIconOnlyCell(cell.nextElementSibling)) hideNode(cell.nextElementSibling);
          return;
        }

        const block = el.closest("div,span,label,form,table,tr") || el;
        if (header.contains(block)) hideNode(block);
      };

      const controls = Array.from(header.querySelectorAll("input,select,textarea"));
      controls.forEach((el) => {
        const probe = norm(
          [
            el.getAttribute("placeholder") || "",
            el.getAttribute("title") || "",
            el.getAttribute("aria-label") || "",
            el.getAttribute("name") || "",
            el.getAttribute("id") || "",
            el.getAttribute("value") || "",
            el.textContent || "",
          ].join(" ")
        );
        if (!isTarget(probe)) return;
        hideFieldGroup(el);
      });

      Array.from(header.querySelectorAll("div,td,th,span,label,a")).forEach((el) => {
        if (!(el instanceof HTMLElement)) return;
        if (el.querySelector("input,textarea,select")) return;
        if (!isTarget(el.textContent || "")) return;
        hideFieldGroup(el);
      });

      Array.from(header.querySelectorAll("tr")).forEach((tr) => {
        const hasVisibleCell = Array.from(tr.children).some(
          (cell) => cell instanceof HTMLElement && !cell.classList.contains("hs-hide-on-user-form")
        );
        if (!hasVisibleCell) hideNode(tr);
      });
    };
    hideHeaderSearchRef();

    if (infoTable) {
      Array.from(infoTable.rows || []).forEach((tr) => {
        const label = norm((tr.cells?.[0]?.textContent || "").trim());
        if (!/^empresa\b|^tipo\b/.test(label)) return;
        tr.classList.add("hs-user-row-select");
        const cells = Array.from(tr.cells || []);
        const selectCell = cells.find((c) => c.querySelector("select"));
        if (selectCell) {
          selectCell.classList.add("hs-user-select-cell");
          selectCell.removeAttribute("width");
          selectCell.style.removeProperty("width");
          selectCell.style.setProperty("box-sizing", "border-box", "important");
          selectCell.style.setProperty("overflow", "hidden", "important");
          const idx = cells.indexOf(selectCell);
          if (idx >= 0 && idx < cells.length - 1) {
            const colspan = Math.max(1, cells.length - idx);
            selectCell.colSpan = colspan;
            for (let i = idx + 1; i < cells.length; i++) {
              cells[i].style.setProperty("display", "none", "important");
            }
          }
          selectCell.querySelectorAll("[width]").forEach((node) => node.removeAttribute("width"));
          selectCell.querySelectorAll("table").forEach((tb) => {
            tb.removeAttribute("width");
            tb.style.setProperty("width", "100%", "important");
            tb.style.setProperty("max-width", "none", "important");
            tb.style.setProperty("table-layout", "fixed", "important");
          });
        }
        tr.querySelectorAll("select").forEach((sel) => {
          sel.removeAttribute("size");
          sel.removeAttribute("width");
          sel.style.setProperty("width", "100%", "important");
          sel.style.setProperty("min-width", "100%", "important");
          sel.style.setProperty("max-width", "none", "important");
          sel.style.setProperty("height", "36px", "important");
          sel.style.setProperty("min-height", "36px", "important");
          sel.style.setProperty("margin", "0", "important");
          sel.style.setProperty("box-sizing", "border-box", "important");
          sel.style.setProperty("display", "block", "important");
        });
      });
    }
    prepareMainTable(infoTable);
    prepareMainTable(passTable);

    const titleNodes = Array.from(form.querySelectorAll("h1,h2,h3,strong,b,div,td,span")).filter((el) => {
      if (!(el instanceof HTMLElement)) return false;
      if (el.id === "hs-user-info-heading" || el.id === "hs-user-pass-heading") return false;
      if (el.closest(".hs-user-section-card")) return false;
      return true;
    });
    const sectionMain = titleNodes.find((el) =>
      /novo usu|editar usu|detalh.*usu|cadastro.*usu|dados.*usu|usu[aÃ¡]rio\s*:/.test(
        norm(el.textContent || "")
      )
    );
    const sectionPass = titleNodes.find((el) => /definir senha|senha de acesso/.test(norm(el.textContent || "")));
    if (sectionMain) sectionMain.classList.add("hs-user-section-title");
    if (sectionPass) sectionPass.classList.add("hs-user-section-title");
    const getSectionTitleText = (node, fallback) => {
      const raw = String(node?.textContent || "")
        .replace(/\s+/g, " ")
        .trim();
      return raw || fallback;
    };
    const ensureSectionHeading = (id, text) => {
      let heading = form.querySelector(`#${id}`);
      if (!(heading instanceof HTMLHeadingElement)) {
        heading = document.createElement("h2");
        heading.id = id;
      }
      heading.className = "hs-user-section-title";
      heading.textContent = text;
      return heading;
    };
    const markLegacyTitleSource = (node, tableRef) => {
      if (!(node instanceof HTMLElement)) return;
      if (node.id === "hs-user-info-heading" || node.id === "hs-user-pass-heading") return;
      if (node.closest(".hs-user-section-card")) return;
      if (tableRef instanceof HTMLTableElement && tableRef.contains(node)) return;
      node.classList.add("hs-user-legacy-title-source");
    };
    const ensureSectionCard = (id, extraClass, heading, tableRef) => {
      if (!(tableRef instanceof HTMLTableElement)) return null;
      let card = form.querySelector(`#${id}`);
      if (!(card instanceof HTMLElement)) {
        card = document.createElement("section");
        card.id = id;
        card.className = `hs-user-section-card ${extraClass}`.trim();
        const body = document.createElement("div");
        body.className = "hs-user-section-card-body";
        card.appendChild(body);
      }
      card.className = `hs-user-section-card ${extraClass}`.trim();

      let body = card.querySelector(".hs-user-section-card-body");
      if (!(body instanceof HTMLElement)) {
        body = document.createElement("div");
        body.className = "hs-user-section-card-body";
        card.appendChild(body);
      }
      if (heading instanceof HTMLElement && card.firstElementChild !== heading) {
        card.insertBefore(heading, body);
      }
      if (tableRef.parentElement !== body) body.appendChild(tableRef);
      return card;
    };

    if (sectionMain) markLegacyTitleSource(sectionMain, infoTable);
    if (sectionPass) markLegacyTitleSource(sectionPass, passTable);

    const infoHeading = infoTable
      ? ensureSectionHeading("hs-user-info-heading", getSectionTitleText(sectionMain, "Detalhes do usuario"))
      : null;
    const passHeading = passTable
      ? ensureSectionHeading("hs-user-pass-heading", getSectionTitleText(sectionPass, "Alterar senha de acesso"))
      : null;

    let actionsWrap = form.querySelector(".hs-user-actions");
    if (!actionsWrap) {
      actionsWrap = document.createElement("div");
      actionsWrap.className = "hs-user-actions";
    }
    let secondaryWrap = form.querySelector(".hs-user-actions-secondary");
    if (!secondaryWrap) {
      secondaryWrap = document.createElement("div");
      secondaryWrap.className = "hs-user-actions-secondary";
    }

    const actionButtons = Array.from(
      form.querySelectorAll("input[type='submit'],input[type='button'],button,a")
    ).filter((el) => {
      if (actionsWrap.contains(el)) return false;
      const txt = norm((el.getAttribute("value") || el.textContent || "").trim());
      return /gravar|salvar|voltar|cancelar/.test(txt);
    });
    const legacyActionButtons = Array.from(
      form.querySelectorAll("input[type='submit'],input[type='button'],button,a")
    ).filter((el) => {
      if (actionsWrap.contains(el)) return false;
      if (actionButtons.includes(el)) return false;
      const txt = norm((el.getAttribute("value") || el.textContent || "").trim());
      return /excluir|liberar.*acesso|desbloque|bloquead/.test(txt);
    });

    const actionTables = new Set();
    actionButtons.forEach((btn) => {
      btn.classList.add("hs-user-action-btn");
      btn.style.removeProperty("width");
      btn.style.removeProperty("max-width");
      actionsWrap.appendChild(btn);
      const tb = btn.closest("table");
      if (tb) actionTables.add(tb);
    });
    legacyActionButtons.forEach((btn) => {
      btn.classList.add("hs-user-legacy-action-btn");
      btn.style.removeProperty("width");
      btn.style.removeProperty("max-width");
      secondaryWrap.appendChild(btn);
      const tb = btn.closest("table");
      if (tb) actionTables.add(tb);
    });

    if (actionsWrap.children.length) {
      const anchor = passTable || infoTable || form.lastElementChild;
      if (anchor && anchor.parentElement === form) {
        if (actionsWrap.previousElementSibling !== anchor) {
          anchor.insertAdjacentElement("afterend", actionsWrap);
        }
      } else if (!actionsWrap.isConnected) {
        form.appendChild(actionsWrap);
      }
    }
    if (secondaryWrap.children.length) {
      if (actionsWrap.isConnected) {
        if (secondaryWrap.previousElementSibling !== actionsWrap) {
          actionsWrap.insertAdjacentElement("afterend", secondaryWrap);
        }
      } else if (!secondaryWrap.isConnected) {
        form.appendChild(secondaryWrap);
      }
    } else {
      secondaryWrap.remove();
    }

    const infoCard = ensureSectionCard("hs-user-info-card", "hs-user-info-card", infoHeading, infoTable);
    const passCard = ensureSectionCard("hs-user-pass-card", "hs-user-pass-card", passHeading, passTable);
    const cardsAnchor = actionsWrap.isConnected ? actionsWrap : secondaryWrap.isConnected ? secondaryWrap : null;
    if (infoCard) form.insertBefore(infoCard, cardsAnchor);
    if (passCard) form.insertBefore(passCard, cardsAnchor);

    actionTables.forEach((tb) => {
      tb.style.display = "none";
    });
  }
  function rebuildUserFormPageLayout() {
    if (!/visualizar_usuario\.php/i.test(location.pathname)) return;
    const form = document.querySelector("#conteudo form");
    if (!(form instanceof HTMLFormElement)) return;
    if (form.dataset.hsUserLayoutV2Built === "1" && form.querySelector("#hs-user-layout-v2")) return;

    const infoTable = form.querySelector("table.hs-user-info-table");
    const passTable = form.querySelector("table.hs-user-pass-table");
    if (!(infoTable instanceof HTMLTableElement) && !(passTable instanceof HTMLTableElement)) return;

    const getDirectRows = (tb) =>
      Array.from(tb?.rows || []).filter((tr) => tr instanceof HTMLTableRowElement && tr.closest("table") === tb);
    const getLabelText = (row) =>
      String(row?.cells?.[0]?.textContent || "")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\s*:\s*$/, "");
    const getTitleText = (fallback) => {
      const candidates = Array.from(form.querySelectorAll("h1,h2,h3,strong,b,div,td,span")).filter(
        (el) => el instanceof HTMLElement && !el.closest("#hs-user-layout-v2")
      );
      const found = candidates.find((el) =>
        /detalh.*usu|novo usu|editar usu|usu[aÃƒÂ¡]rio\s*:/.test(norm(el.textContent || ""))
      );
      return (
        String(found?.textContent || "")
          .replace(/\s+/g, " ")
          .trim() || fallback
      );
    };
    const fieldSelector =
      'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="image"]),select,textarea';
    const sanitizeControl = (control) => {
      if (!(control instanceof HTMLElement)) return;
      control.removeAttribute("width");
      if (control instanceof HTMLSelectElement) control.removeAttribute("size");
      [
        "width",
        "min-width",
        "max-width",
        "height",
        "min-height",
        "margin",
        "background",
        "background-color",
        "background-image",
        "border",
        "border-color",
        "box-shadow",
      ].forEach((prop) => control.style.removeProperty(prop));
    };
    const buildCheckboxState = (checkbox) => {
      const state = document.createElement("span");
      state.className = "hs-user-checkbox-state";
      const sync = () => {
        state.textContent = checkbox.checked ? "Ativado" : "Desativado";
        state.classList.toggle("is-on", !!checkbox.checked);
      };
      sync();
      if (checkbox.dataset.hsUserV2Bound !== "1") {
        checkbox.dataset.hsUserV2Bound = "1";
        checkbox.addEventListener("change", sync);
      }
      return state;
    };
    const buildFieldRow = (row) => {
      if (!(row instanceof HTMLTableRowElement)) return null;
      const labelText = getLabelText(row);
      const controls = Array.from(row.querySelectorAll(fieldSelector)).filter((el) => !el.closest("#hs-user-layout-v2"));
      const textValue = controls.length
        ? ""
        : Array.from(row.cells || [])
            .slice(1)
            .map((cell) =>
              String(cell.textContent || "")
                .replace(/\s+/g, " ")
                .trim()
            )
            .filter(Boolean)
            .join(" ");
      if (!labelText && !controls.length && !textValue) return null;

      const rowEl = document.createElement("div");
      rowEl.className = "hs-user-v2-row";
      if (controls.length === 1 && controls[0] instanceof HTMLInputElement && controls[0].type === "checkbox") {
        rowEl.classList.add("is-checkbox");
      }

      const labelEl = document.createElement("div");
      labelEl.className = "hs-user-v2-label";
      labelEl.textContent = labelText || "Campo";

      const valueEl = document.createElement("div");
      valueEl.className = "hs-user-v2-value";
      if (controls.length) {
        controls.forEach((control) => {
          sanitizeControl(control);
          valueEl.appendChild(control);
          if (control instanceof HTMLInputElement && control.type === "checkbox") {
            valueEl.appendChild(buildCheckboxState(control));
          }
        });
      } else {
        const textEl = document.createElement("span");
        textEl.className = "hs-user-v2-text";
        textEl.textContent = textValue;
        valueEl.appendChild(textEl);
      }

      rowEl.appendChild(labelEl);
      rowEl.appendChild(valueEl);
      row.classList.add("hs-user-v2-hidden");
      return rowEl;
    };
    const buildCard = (title, tableRef) => {
      if (!(tableRef instanceof HTMLTableElement)) return null;
      const rows = getDirectRows(tableRef).map(buildFieldRow).filter(Boolean);
      if (!rows.length) return null;

      const card = document.createElement("section");
      card.className = "hs-user-v2-card";
      card.innerHTML = `<div class="hs-user-v2-card-head"></div><div class="hs-user-v2-card-body"><div class="hs-user-v2-grid"></div></div>`;
      const head = card.querySelector(".hs-user-v2-card-head");
      const grid = card.querySelector(".hs-user-v2-grid");
      if (head) head.textContent = title;
      if (grid) rows.forEach((row) => grid.appendChild(row));
      tableRef.classList.add("hs-user-v2-hidden");
      tableRef.closest(".hs-user-section-card")?.classList.add("hs-user-v2-hidden");
      return card;
    };

    let layout = form.querySelector("#hs-user-layout-v2");
    if (!(layout instanceof HTMLElement)) {
      layout = document.createElement("div");
      layout.id = "hs-user-layout-v2";
    }
    layout.replaceChildren();

    const pageTitle = document.createElement("h1");
    pageTitle.className = "hs-user-page-title";
    pageTitle.textContent = getTitleText("Detalhes do usuario");
    layout.appendChild(pageTitle);

    const infoCard = buildCard("Detalhes do usuario", infoTable);
    if (infoCard) layout.appendChild(infoCard);

    const passTitleSource = Array.from(form.querySelectorAll(".hs-user-section-title, h1, h2, h3, strong, b")).find((el) =>
      /senha de acesso|definir senha/.test(norm(el.textContent || ""))
    );
    const passCard = buildCard(
      String(passTitleSource?.textContent || "").replace(/\s+/g, " ").trim() || "Alterar senha de acesso",
      passTable
    );
    if (passCard) layout.appendChild(passCard);

    const actionsCard = document.createElement("section");
    actionsCard.className = "hs-user-v2-actions";
    const actionsWrap = form.querySelector(".hs-user-actions");
    const secondaryWrap = form.querySelector(".hs-user-actions-secondary");
    if (actionsWrap instanceof HTMLElement && actionsWrap.children.length) actionsCard.appendChild(actionsWrap);
    if (secondaryWrap instanceof HTMLElement && secondaryWrap.children.length) actionsCard.appendChild(secondaryWrap);
    if (actionsCard.childElementCount) layout.appendChild(actionsCard);

    Array.from(
      form.querySelectorAll(
        "#hs-user-info-card, #hs-user-pass-card, .hs-user-legacy-title-source, table.hs-user-info-table, table.hs-user-pass-table"
      )
    ).forEach((el) => {
      if (el instanceof HTMLElement) el.classList.add("hs-user-v2-hidden");
    });

    if (layout.parentElement !== form) form.insertBefore(layout, form.firstChild);
    else if (form.firstElementChild !== layout) form.insertBefore(layout, form.firstChild);

    form.dataset.hsUserLayoutV2Built = "1";
  }
  /**
   * Objetivo: Adiciona barra de filtros e organizaÃ§Ã£o da consulta de usuÃ¡rios.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: valor utilitario.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function enhanceUsersPage() {
    if (!/consulta_usuario\.php/i.test(location.pathname)) return;
    document.body.classList.add("hs-users-page");

    const findUserTable = () => {
      const tables = Array.from(document.querySelectorAll("table"));
      for (const table of tables) {
        const rows = Array.from(table.rows || []);
        if (!rows.length) continue;

        const possibleRows = [];
        if (table.tHead?.rows?.[0]) possibleRows.push(table.tHead.rows[0]);
        rows.forEach((tr) => {
          if (!possibleRows.includes(tr)) possibleRows.push(tr);
        });

        for (const headerRow of possibleRows) {
          const headers = Array.from(headerRow.cells || []).map((c) => norm((c.textContent || "").trim()));
          const idxNome = headers.findIndex((h) => h === "nome" || h.startsWith("nome "));
          const idxEmpresa = headers.findIndex((h) => h.startsWith("empresa"));
          if (idxNome >= 0 && idxEmpresa >= 0) return { table, headerRow, idxNome, idxEmpresa };
        }
      }
      return null;
    };

    const info = findUserTable();
    if (!info) return;
    const { table, headerRow, idxNome, idxEmpresa } = info;
    table.classList.add("hs-users-table");

    let gridWrap = document.getElementById("hs-users-grid-wrap");
    if (!(gridWrap instanceof HTMLElement)) {
      gridWrap = document.createElement("div");
      gridWrap.id = "hs-users-grid-wrap";
      gridWrap.className = "hs-users-grid-wrap";
    }
    if (table.parentElement !== gridWrap) {
      table.parentElement?.insertBefore(gridWrap, table);
      gridWrap.appendChild(table);
    }

    const getDataRows = () =>
      Array.from(table.rows || []).filter((tr) => {
        if (tr === headerRow) return false;
        if (tr.closest("thead")) return false;
        const cells = Array.from(tr.cells || []);
        if (!cells.length) return false;
        const hasTh = cells.some((c) => /^th$/i.test(c.tagName));
        return !hasTh;
      });

    let bar = document.getElementById("hs-users-toolbar");
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "hs-users-toolbar";
      bar.className = "hs-users-toolbar";
      bar.innerHTML = `
        <div class="hs-users-filters">
          <label class="hs-users-field">
            <span>Empresa</span>
            <select id="hs-users-company-filter">
              <option value="">Todas</option>
            </select>
          </label>
          <label class="hs-users-field hs-users-search">
            <span>Buscar usuario/empresa</span>
            <input id="hs-users-text-filter" type="text" autocomplete="off" placeholder="Digite para filtrar" />
          </label>
        </div>
        <div class="hs-users-actions"></div>
      `;
    }

    if (!bar.isConnected) {
      gridWrap.parentElement?.insertBefore(bar, gridWrap);
    } else if (bar.nextElementSibling !== gridWrap && gridWrap.parentElement === bar.parentElement) {
      bar.parentElement.insertBefore(bar, gridWrap);
    }

    const select = bar.querySelector("#hs-users-company-filter");
    const search = bar.querySelector("#hs-users-text-filter");
    const actions = bar.querySelector(".hs-users-actions");
    if (!select || !search || !actions) return;
    const cachedFilters = readUsersPageFilterCache();

    const headersNorm = Array.from(headerRow.cells || []).map((c) => norm((c.textContent || "").trim()));
    const idxSobrenome = headersNorm.findIndex((h) => h.startsWith("sobrenome"));
    const idxEmail = headersNorm.findIndex((h) => /e-?mail/.test(h));
    const idxNotif = headersNorm.findIndex((h) => h.startsWith("not"));
    const idxTipo = headersNorm.findIndex((h) => h.startsWith("tipo"));
    const idxAtivo = headersNorm.findIndex((h) => h.startsWith("ativo"));

    const colMap = [
      ["hs-users-col-nome", idxNome],
      ["hs-users-col-sobrenome", idxSobrenome],
      ["hs-users-col-email", idxEmail],
      ["hs-users-col-notif", idxNotif],
      ["hs-users-col-tipo", idxTipo],
      ["hs-users-col-empresa", idxEmpresa],
      ["hs-users-col-ativo", idxAtivo],
    ].filter(([, idx]) => idx >= 0);

    Array.from(table.rows || []).forEach((tr) => {
      Array.from(tr.cells || []).forEach((cell) => {
        cell.classList.remove(
          "hs-users-col-nome",
          "hs-users-col-sobrenome",
          "hs-users-col-email",
          "hs-users-col-notif",
          "hs-users-col-tipo",
          "hs-users-col-empresa",
          "hs-users-col-ativo"
        );
      });
      colMap.forEach(([cls, idx]) => {
        const cell = tr.cells?.[idx];
        if (cell) cell.classList.add(cls);
      });
    });

    const rows = getDataRows();
    const companies = [];
    rows.forEach((tr) => {
      const nome = (tr.cells[idxNome]?.textContent || "").trim();
      const empresa = (tr.cells[idxEmpresa]?.textContent || "").trim();
      tr.dataset.hsUserName = norm(nome);
      tr.dataset.hsUserCompany = norm(empresa);
      tr.dataset.hsUserSearch = norm(`${nome} ${empresa} ${tr.textContent || ""}`);
      if (empresa) companies.push(empresa);
    });

    const currentCompany = String(select.value || "").trim();
    const companyNormSet = new Map();
    companies.forEach((empresa) => {
      const key = norm(empresa);
      if (key && !companyNormSet.has(key)) companyNormSet.set(key, empresa);
    });
    const sortedCompanies = Array.from(companyNormSet.entries()).sort((a, b) => a[1].localeCompare(b[1], "pt-BR"));

    select.innerHTML = `<option value="">Todas</option>`;
    sortedCompanies.forEach(([key, label]) => {
      const opt = document.createElement("option");
      opt.value = key;
      opt.textContent = label;
      select.appendChild(opt);
    });
    const desiredCompany = currentCompany || cachedFilters.company;
    if (desiredCompany && Array.from(select.options).some((o) => o.value === desiredCompany)) {
      select.value = desiredCompany;
    }
    if (search.dataset.hsUsersCacheApplied !== "1") {
      search.value = cachedFilters.query || "";
      search.dataset.hsUsersCacheApplied = "1";
    }

    const persistFilters = () =>
      writeUsersPageFilterCache({
        company: select.value || "",
        query: search.value || "",
      });

    const applyFilters = (persist = false) => {
      const q = norm(search.value || "").trim();
      const company = select.value;
      rows.forEach((tr) => {
        const rowCompany = tr.dataset.hsUserCompany || "";
        const rowText = tr.dataset.hsUserSearch || "";
        const okCompany = !company || rowCompany === company;
        const okText = !q || rowText.includes(q);
        tr.style.display = okCompany && okText ? "" : "none";
      });
      if (persist) persistFilters();
    };

    if (bar.dataset.hsUsersBound !== "1") {
      bar.dataset.hsUsersBound = "1";
      select.addEventListener("change", () => applyFilters(true));
      search.addEventListener("input", () => applyFilters(true));
      search.addEventListener("change", () => applyFilters(true));
    }
    if (bar.dataset.hsUsersPersistBound !== "1") {
      bar.dataset.hsUsersPersistBound = "1";
      const persistOnLeave = () => {
        if (!document.body.classList.contains("hs-users-page")) return;
        persistFilters();
      };
      window.addEventListener("pagehide", persistOnLeave);
      window.addEventListener("beforeunload", persistOnLeave);
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) persistOnLeave();
      });
    }

    const isNovo = (el) => {
      if (!(el instanceof HTMLElement)) return false;
      const txt = norm((el.getAttribute("value") || el.textContent || "").trim());
      return txt === "novo";
    };

    const novo =
      Array.from(document.querySelectorAll("a,button,input[type='button'],input[type='submit']")).find(
        (el) => isNovo(el) && !bar.contains(el)
      ) || null;
    if (novo && actions.firstElementChild !== novo) {
      novo.classList.add("hs-users-novo-btn");
      actions.appendChild(novo);
    }

    applyFilters();
    persistFilters();
  }

  /* --------------- SECTION: AJUSTES DINAMICOS DE LAYOUT/GRID ---------------- */
  /**
   * Objetivo: Calcula espaÃ§amento superior dinÃ¢mico da home.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: valor utilitario.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function adjustHomeTopOffset() {
    if (!document.body.classList.contains("hs-home-page")) return;

    const candidates = Array.from(
      document.querySelectorAll("#cabecalho, #cabecalho_logo, #cabecalho_menu, header, .navbar, .topbar")
    );

    let maxBottom = 0;
    for (const el of candidates) {
      const rect = el.getBoundingClientRect();
      if (rect.height > 0) maxBottom = Math.max(maxBottom, rect.bottom);
    }

    const fixedAtTop = Array.from(document.body.querySelectorAll("*")).filter((el) => {
      const st = window.getComputedStyle(el);
      if (st.position !== "fixed" && st.position !== "sticky") return false;
      const rect = el.getBoundingClientRect();
      return rect.top <= 2 && rect.height > 20 && rect.width > 200;
    });
    for (const el of fixedAtTop) {
      const rect = el.getBoundingClientRect();
      maxBottom = Math.max(maxBottom, rect.bottom);
    }

    const offset = Math.max(20, Math.round(maxBottom) + 8);
    document.body.style.setProperty("--hs-home-top-offset", `${offset}px`);
  }
  /**
   * Objetivo: Calcula espaÃ§amento superior dinÃ¢mico do dashboard.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: valor utilitario.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function adjustDashboardTopOffset() {
    if (!document.body.classList.contains("hs-dashboard-page")) return;

    const candidates = Array.from(
      document.querySelectorAll("#cabecalho, #cabecalho_logo, #cabecalho_menu, header, .navbar, .topbar")
    );

    let maxBottom = 0;
    for (const el of candidates) {
      const rect = el.getBoundingClientRect();
      if (rect.height > 0) maxBottom = Math.max(maxBottom, rect.bottom);
    }

    const fixedAtTop = Array.from(document.body.querySelectorAll("*")).filter((el) => {
      if (!(el instanceof HTMLElement)) return false;
      if (el.closest("#conteudo")) return false;
      if (el.closest(".hs-req-pop")) return false;
      if (el.closest(".hs-toast-wrap")) return false;
      if (el.id === BADGE_ID) return false;

      const st = window.getComputedStyle(el);
      if (st.display === "none" || st.visibility === "hidden") return false;
      if (st.position !== "fixed" && st.position !== "sticky") return false;
      const rect = el.getBoundingClientRect();
      return rect.top <= 2 && rect.height > 20 && rect.width > 200;
    });
    for (const el of fixedAtTop) {
      const rect = el.getBoundingClientRect();
      maxBottom = Math.max(maxBottom, rect.bottom);
    }

    const rawOffset = Math.round(maxBottom) + 8;
    const offset = Math.max(72, Math.min(180, Number.isFinite(rawOffset) ? rawOffset : 72));
    document.body.style.setProperty("--hs-dashboard-top-offset", `${offset}px`);
  }
  /**
   * Objetivo: Calcula espaÃ§amento superior dinÃ¢mico da tela de requisiÃ§Ã£o.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: valor utilitario.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function adjustRequestTopOffset() {
    if (!document.body.classList.contains("hs-request-page")) return;
    if (document.body.classList.contains("hs-request-popup-preview")) {
      document.body.style.setProperty("--hs-request-top-offset", "0px");
      return;
    }

    const candidates = Array.from(
      document.querySelectorAll("#cabecalho, #cabecalho_logo, #cabecalho_menu, header, .navbar, .topbar")
    );

    let maxBottom = 0;
    for (const el of candidates) {
      const rect = el.getBoundingClientRect();
      if (rect.height > 0) maxBottom = Math.max(maxBottom, rect.bottom);
    }

    const fixedAtTop = Array.from(document.body.querySelectorAll("*")).filter((el) => {
      const st = window.getComputedStyle(el);
      if (st.position !== "fixed" && st.position !== "sticky") return false;
      const rect = el.getBoundingClientRect();
      return rect.top <= 2 && rect.height > 20 && rect.width > 200;
    });
    for (const el of fixedAtTop) {
      const rect = el.getBoundingClientRect();
      maxBottom = Math.max(maxBottom, rect.bottom);
    }

    const offset = Math.max(72, Math.round(maxBottom) + 8);
    document.body.style.setProperty("--hs-request-top-offset", `${offset}px`);
  }
  /**
   * Objetivo: Calcula espaÃ§amento superior dinÃ¢mico da consulta de usuÃ¡rios.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: valor utilitario.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function adjustUsersTopOffset() {
    if (!document.body.classList.contains("hs-users-page")) return;

    const candidates = Array.from(
      document.querySelectorAll("#cabecalho, #cabecalho_logo, #cabecalho_menu, header, .navbar, .topbar")
    );

    let maxBottom = 0;
    for (const el of candidates) {
      const rect = el.getBoundingClientRect();
      if (rect.height > 0) maxBottom = Math.max(maxBottom, rect.bottom);
    }

    const fixedAtTop = Array.from(document.body.querySelectorAll("*")).filter((el) => {
      const st = window.getComputedStyle(el);
      if (st.position !== "fixed" && st.position !== "sticky") return false;
      const rect = el.getBoundingClientRect();
      return rect.top <= 2 && rect.height > 20 && rect.width > 200;
    });
    for (const el of fixedAtTop) {
      const rect = el.getBoundingClientRect();
      maxBottom = Math.max(maxBottom, rect.bottom);
    }

    const offset = Math.max(72, Math.round(maxBottom) + 8);
    document.body.style.setProperty("--hs-users-top-offset", `${offset}px`);
  }
  /**
   * Objetivo: Calcula espaÃ§amento superior dinÃ¢mico da tela de visualizar usuÃ¡rio.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: valor utilitario.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function adjustUserFormTopOffset() {
    if (!document.body.classList.contains("hs-user-form-page")) return;

    const candidates = Array.from(
      document.querySelectorAll("#cabecalho, #cabecalho_logo, #cabecalho_menu, header, .navbar, .topbar")
    );

    let maxBottom = 0;
    for (const el of candidates) {
      const rect = el.getBoundingClientRect();
      if (rect.height > 0) maxBottom = Math.max(maxBottom, rect.bottom);
    }

    const fixedAtTop = Array.from(document.body.querySelectorAll("*")).filter((el) => {
      const st = window.getComputedStyle(el);
      if (st.position !== "fixed" && st.position !== "sticky") return false;
      const rect = el.getBoundingClientRect();
      return rect.top <= 2 && rect.height > 20 && rect.width > 200;
    });
    for (const el of fixedAtTop) {
      const rect = el.getBoundingClientRect();
      maxBottom = Math.max(maxBottom, rect.bottom);
    }

    const offset = Math.max(72, Math.round(maxBottom) + 8);
    document.body.style.setProperty("--hs-user-form-top-offset", `${offset}px`);
  }
  /**
   * Objetivo: Padroniza comportamento visual/seleÃ§Ã£o de calendÃ¡rios legados.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: void.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function wireCalendars() {
    const cals = document.querySelectorAll(".calendar, .calendario, #calendar, [id*='calend'], [class*='calend']");
    cals.forEach((cal) => {
      if (cal.dataset.hsCalBound === "1") return;
      cal.dataset.hsCalBound = "1";

      // Marca o dia que o sistema jÃ¡ trouxe selecionado
      cal.querySelectorAll("td[selected]").forEach((td) => td.classList.add("hs-cal-selected"));

      const dayCells = cal.querySelectorAll("td");
      dayCells.forEach((td) => {
        const txt = (td.textContent || "").trim();
        if (!/^\\d{1,2}$/.test(txt)) return;

        // Alguns calendarios marcam o selecionado com <b>20</b> sem classe
        if (td.querySelector("b,strong")) td.classList.add("hs-cal-selected");

        td.addEventListener("click", () => {
          cal.querySelectorAll(".hs-cal-selected").forEach((x) => x.classList.remove("hs-cal-selected"));
          cal.querySelectorAll("td[selected]").forEach((x) => x.removeAttribute("selected"));
          td.setAttribute("selected", "selected");
          td.classList.add("hs-cal-selected");
        }, true);
      });
    });
  }
  /**
   * Objetivo: Reorganiza calendÃ¡rio e controles de consumo interno.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: void.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function layoutRequestCalendarAndConsumption() {
    if (!isRequestVisualizarPage()) return;

    const roots = Array.from(
      document.querySelectorAll("#interno #Novo_Acompanhamento, #interno #acompanhamento_form, #interno")
    );

    const isLabelRow = (tr, rx) => {
      if (!(tr instanceof HTMLTableRowElement) || !tr.cells?.length) return false;
      const label = norm(tr.cells[0]?.textContent || "");
      return rx.test(label);
    };

    const moveNodes = (from, to) => {
      if (!(from instanceof HTMLElement) || !(to instanceof HTMLElement) || from === to) return;
      Array.from(from.childNodes).forEach((node) => {
        if (node === to) return;
        if (node.nodeType === Node.TEXT_NODE && !String(node.textContent || "").trim()) return;
        to.appendChild(node);
      });
    };

    const ensureCalWrap = (tdPrev) => {
      let wrap = tdPrev.querySelector(".hs-cal-consumo-wrap");
      if (!(wrap instanceof HTMLElement)) {
        wrap = document.createElement("div");
        wrap.className = "hs-cal-consumo-wrap";

        const calSlot = document.createElement("div");
        calSlot.className = "hs-cal-slot";

        const side = document.createElement("div");
        side.className = "hs-cal-consumo-side";
        side.innerHTML = `<span class="hs-cal-consumo-title">Minutos consumo</span><div class="hs-cal-consumo-controls"></div>`;

        wrap.appendChild(calSlot);
        wrap.appendChild(side);
        tdPrev.appendChild(wrap);
      }

      let calSlot = wrap.querySelector(".hs-cal-slot");
      if (!(calSlot instanceof HTMLElement)) {
        calSlot = document.createElement("div");
        calSlot.className = "hs-cal-slot";
        wrap.insertBefore(calSlot, wrap.firstChild || null);
      }

      return { wrap, calSlot };
    };

    const getCalendarHost = (tdPrev) => {
      const legacyContainer =
        tdPrev.querySelector("div[id='Calendario_Previsao_Conclusao']") ||
        tdPrev.querySelector("div[id^='Calendario_']") ||
        tdPrev.querySelector("div[id*='Calendario_']");
      if (legacyContainer instanceof HTMLElement) return legacyContainer;

      const fallback =
        tdPrev.querySelector(".calendar, .calendario, #calendar, [id*='calend'], [class*='calend']") || null;
      return fallback instanceof HTMLElement ? fallback : null;
    };

    const removeCalendarDuplicates = (tdPrev, calSlot, calendarHost) => {
      const duplicatedSelectors = [
        ":scope > table.calendar",
        ":scope > table.calendario",
        ":scope > .calendar",
        ":scope > .calendario",
      ].join(", ");

      calSlot.querySelectorAll(duplicatedSelectors).forEach((node) => {
        if (!(node instanceof HTMLElement)) return;
        if (node === calendarHost) return;
        if (calendarHost.contains(node)) return;
        node.remove();
      });

      tdPrev.querySelectorAll(duplicatedSelectors).forEach((node) => {
        if (!(node instanceof HTMLElement)) return;
        if (node === calendarHost) return;
        if (calendarHost.contains(node)) return;
        if (calSlot.contains(node)) return;
        node.remove();
      });
    };

    for (const root of roots) {
      const rows = Array.from(root.querySelectorAll("tr"));
      const rowMin = rows.find((tr) => isLabelRow(tr, /^minutos?\s*consumo/)) || null;
      const rowPrev = rows.find((tr) => isLabelRow(tr, /^previsao\s*conclusao/)) || null;
      if (!rowMin || !rowPrev) continue;
      if (!rowMin.cells?.length || !rowPrev.cells?.length) continue;

      const tdMin = rowMin.cells[rowMin.cells.length - 1];
      const tdPrev = rowPrev.cells[rowPrev.cells.length - 1];
      if (!(tdMin instanceof HTMLTableCellElement) || !(tdPrev instanceof HTMLTableCellElement)) continue;

      const calendarHost = getCalendarHost(tdPrev);
      if (!(calendarHost instanceof HTMLElement)) continue;

      const { wrap, calSlot } = ensureCalWrap(tdPrev);
      if (!calSlot.contains(calendarHost)) {
        calSlot.insertBefore(calendarHost, calSlot.firstChild || null);
      }
      removeCalendarDuplicates(tdPrev, calSlot, calendarHost);

      const controls = wrap.querySelector(".hs-cal-consumo-controls");
      if (controls instanceof HTMLElement) moveNodes(tdMin, controls);

      rowMin.style.setProperty("display", "none", "important");
    }
  }
  /**
   * Objetivo: Detecta situacao "Servico aprovado" sem confundir com "Aprovado para servico".
   *
   * Contexto: usado para coloracao de destaque e contagem do painel da consulta.
   * Parametros:
   * - situacaoValue: texto de situacao bruto/normalizado.
   * Retorno: boolean.
   */
  function isServicoAprovadoStatus(situacaoValue) {
    const sit = norm(situacaoValue || "")
      .replace(/\s+/g, " ")
      .trim();
    if (!sit) return false;
    if (!/^(?:situac(?:ao|a)?\s*[:\-]?\s*)?servic\w*\s+aprovad\w*\b/.test(sit)) return false;
    if (/\baprovad\w*\s+para\s+servic\w*\b/.test(sit)) return false;
    return true;
  }
  /**
   * Objetivo: Recupera referencias atuais do layout profissional da consulta.
   *
   * Contexto: evita consultas repetidas e valida se o shell esta montado.
   * Parametros: nenhum.
   * Retorno: {side,main}|null.
   */
  function getConsultaProLayoutRoots() {
    const side = document.getElementById("hs-consulta-side");
    const main = document.getElementById("hs-consulta-main");
    if (!(side instanceof HTMLElement) || !(main instanceof HTMLElement)) return null;
    return { side, main };
  }
  /**
   * Objetivo: Re-renderiza painel da consulta quando ele estiver ativo na tela.
   *
   * Contexto: usado nos eventos de carregamento/refresh para status em tempo real.
   * Parametros: nenhum.
   * Retorno: void.
   */
  function refreshConsultaProLayoutPanelMounted() {
    if (!document.body.classList.contains("hs-consulta-pro-enabled")) return;
    const roots = getConsultaProLayoutRoots();
    if (!roots) return;
    renderConsultaProLayoutPanel(roots.side, roots.main);
  }
  /**
   * Objetivo: Abre chamado a partir de elementos interativos do painel lateral.
   *
   * Contexto: respeita modo preview (popup) e atalhos de abertura em nova guia.
   * Parametros:
   * - numero: numero da requisicao.
   * - options: {forceNewTab}.
   * Retorno: void.
   */
  function openConsultaTicketFromPanel(numero, options = {}) {
    const reqNum = String(numero || "").trim();
    if (!reqNum) return;
    const forceNewTab = !!options?.forceNewTab;
    if (forceNewTab || !isPreviewOnlyModeEnabled()) {
      openNewTab(reqNum);
      return;
    }
    openReqPopup(reqNum);
  }
  /**
   * Objetivo: Liga eventos de clique/teclado para abrir chamado direto do painel.
   *
   * Contexto: usado por listas de foco/fila para tornar toda linha clicavel.
   * Parametros:
   * - target: elemento clicavel.
   * - numero: numero da requisicao alvo.
   * Retorno: void.
   */
  function bindConsultaPanelTicketActivator(target, numero) {
    if (!(target instanceof HTMLElement)) return;
    const reqNum = String(numero || "").trim();
    if (!reqNum) return;
    const openFromEvent = (ev, forceNewTab = false) => {
      ev?.preventDefault?.();
      ev?.stopPropagation?.();
      const shouldOpenInNewTab =
        forceNewTab ||
        !!ev?.ctrlKey ||
        !!ev?.metaKey ||
        !!ev?.shiftKey ||
        Number(ev?.button) === 1;
      openConsultaTicketFromPanel(reqNum, { forceNewTab: shouldOpenInNewTab });
    };
    target.addEventListener("click", (ev) => {
      if (ev.defaultPrevented) return;
      if (Number(ev.button || 0) !== 0) return;
      openFromEvent(ev, false);
    });
    target.addEventListener("auxclick", (ev) => {
      if (ev.defaultPrevented) return;
      if (Number(ev.button) !== 1) return;
      openFromEvent(ev, true);
    });
    target.addEventListener("keydown", (ev) => {
      if (ev.defaultPrevented) return;
      const key = String(ev.key || "");
      if (key !== "Enter" && key !== " ") return;
      openFromEvent(ev, false);
    });
  }
  /**
   * Objetivo: Aplica filtro rapido por situacao direto na grade da consulta.
   *
   * Contexto: acionado por cliques no painel lateral.
   * Parametros:
   * - statusLabel: situacao alvo.
   * - options: {preserve,silent}.
   * Retorno: string (filtro efetivo).
   */
  function applyConsultaStatusQuickFilter(statusLabel = "", options = {}) {
    const preserve = !!options?.preserve;
    const silent = !!options?.silent;

    const previousNorm = String(hsConsultaStatusFilterNorm || "").trim();
    const previousLabel = String(hsConsultaStatusFilterLabel || "").trim();
    const requestedLabel = preserve
      ? String(statusLabel || previousLabel || "").trim()
      : String(statusLabel || "").trim();
    const requestedNorm = norm(requestedLabel);

    let nextNorm = requestedNorm;
    let nextLabel = requestedLabel;
    if (!preserve && requestedNorm && requestedNorm === previousNorm) {
      nextNorm = "";
      nextLabel = "";
    }
    hsConsultaStatusFilterNorm = nextNorm;
    hsConsultaStatusFilterLabel = nextLabel;

    const roots = getConsultaProLayoutRoots();
    const scopeRoot = roots?.main || document.getElementById("conteudo") || document.body;
    const tables = Array.from(scopeRoot.querySelectorAll("table.sortable")).filter(
      (tb) => tb instanceof HTMLTableElement
    );

    tables.forEach((tb) => {
      const headerRow = tb.tHead?.rows?.[0] || Array.from(tb.rows || []).find((tr) => tr.querySelector("th"));
      if (!headerRow) return;
      const headers = Array.from(headerRow.cells || []).map((cell) => norm(cell.textContent || ""));
      const idxSituacao = headers.findIndex((h) => SITUACAO_RX.test(h));
      if (idxSituacao < 0) return;

      const rows = Array.from(tb.tBodies?.[0]?.rows || tb.rows || []);
      rows.forEach((tr) => {
        if (!(tr instanceof HTMLTableRowElement)) return;
        if (tr.querySelector("th")) return;
        const tdSit = tr.cells[idxSituacao];
        if (!(tdSit instanceof HTMLTableCellElement)) return;

        const sitNorm = norm(getSituacaoCellText(tdSit));
        const matches = !nextNorm || sitNorm.includes(nextNorm);
        const hiddenByFilter = tr.dataset.hsConsultaStatusFilterHidden === "1";

        if (matches) {
          if (hiddenByFilter) {
            const prevDisplay = String(tr.dataset.hsConsultaStatusPrevDisplay || "");
            if (prevDisplay) tr.style.setProperty("display", prevDisplay, "important");
            else tr.style.removeProperty("display");
            delete tr.dataset.hsConsultaStatusFilterHidden;
            delete tr.dataset.hsConsultaStatusPrevDisplay;
          }
          return;
        }

        if (!hiddenByFilter) tr.dataset.hsConsultaStatusPrevDisplay = tr.style.display || "";
        tr.dataset.hsConsultaStatusFilterHidden = "1";
        tr.style.setProperty("display", "none", "important");
      });
    });

    if (!silent) {
      if (nextNorm) toast(`Filtro rapido: ${nextLabel}.`, "info", 2200);
      else if (previousNorm) toast("Filtro rapido removido.", "ok", 1800);
    }
    if (roots) renderConsultaProLayoutPanel(roots.side, roots.main);
    return nextLabel;
  }
  /**
   * Objetivo: Renderiza painel lateral profissional da consulta de requisicoes.
   *
   * Contexto: dashboard-like da rota consulta_requisicao.php.
   * Parametros:
   * - sideRoot: container do painel.
   * - scopeRoot: area principal que contem as tabelas.
   * Retorno: void.
   */
  function renderConsultaProLayoutPanel(sideRoot, scopeRoot) {
    if (!(sideRoot instanceof HTMLElement) || !(scopeRoot instanceof HTMLElement)) return;

    const cleanCellText = (cell) => {
      if (!(cell instanceof HTMLTableCellElement)) return "";
      const clone = cell.cloneNode(true);
      if (clone instanceof HTMLElement) {
        clone.querySelectorAll(".hs-first-att-wrap, .hs-situacao-sinal").forEach((el) => el.remove());
      }
      return String(clone.textContent || "").replace(/\s+/g, " ").trim();
    };
    const clip = (text, max = 86) => {
      const raw = String(text || "").replace(/\s+/g, " ").trim();
      if (raw.length <= max) return raw;
      return `${raw.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
    };
    const formatAgo = (timestamp) => {
      const at = Number(timestamp || 0);
      if (!Number.isFinite(at) || at <= 0) return "--";
      const diffSec = Math.max(0, Math.floor((Date.now() - at) / 1000));
      if (diffSec < 60) return `${diffSec}s`;
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}min`;
      const diffHour = Math.floor(diffMin / 60);
      if (diffHour < 24) return `${diffHour}h`;
      return `${Math.floor(diffHour / 24)}d`;
    };

    const statusCounter = new Map();
    const oldestRows = [];
    const focusRows = [];
    const seenNumeros = new Set();
    let total = 0;
    let novas = 0;
    let emServico = 0;
    let servicoAprovado = 0;
    let aguardandoRetorno = 0;
    let aguardandoInformacoes = 0;
    let semResponsavel = 0;
    let parados5dias = 0;

    const tables = Array.from(scopeRoot.querySelectorAll("table.sortable")).filter(
      (tb) => tb instanceof HTMLTableElement
    );
    tables.forEach((tb) => {
      const headerRow = tb.tHead?.rows?.[0] || Array.from(tb.rows || []).find((tr) => tr.querySelector("th"));
      if (!headerRow) return;

      const headers = Array.from(headerRow.cells || []).map((cell) => norm(cell.textContent || ""));
      const idxSituacao = headers.findIndex((h) => SITUACAO_RX.test(h));
      const idxResponsavel = headers.findIndex((h) => /responsavel|tecnico|atendente/.test(h));
      const idxUltAcomp = headers.findIndex((h) => /ultimo.*acompanh|ultima.*atualiz|data.*acompanh/.test(h));
      const idxTitulo = headers.findIndex((h) => /titulo|assunto|descricao/.test(h));

      const rows = Array.from(tb.tBodies?.[0]?.rows || tb.rows || []);
      rows.forEach((tr) => {
        if (!(tr instanceof HTMLTableRowElement)) return;
        if (tr.querySelector("th")) return;
        if (tr.offsetParent === null) return;

        const numero = String(extractNumero(tr) || "").trim();
        if (!numero) return;
        if (seenNumeros.has(numero)) return;
        seenNumeros.add(numero);

        const tdSituacao = idxSituacao >= 0 ? tr.cells[idxSituacao] : null;
        const situacaoRaw = tdSituacao ? cleanCellText(tdSituacao) : "";
        const situacaoNorm = norm(situacaoRaw);
        const isNova = NOVA_RX.test(situacaoNorm);
        const isEmServico = /em\s*serv/.test(situacaoNorm);
        const isAguardandoRetorno = /aguardando.*retorno/.test(situacaoNorm);
        const isAguardandoInformacoes = /aguardando.*informac/.test(situacaoNorm);
        const isServicoAprovado = isServicoAprovadoStatus(situacaoNorm);

        const responsavelRaw = idxResponsavel >= 0 ? cleanCellText(tr.cells[idxResponsavel]) : "";
        const responsavelNorm = norm(responsavelRaw);
        const isSemResponsavel =
          !responsavelNorm ||
          responsavelNorm === "-" ||
          responsavelNorm === "--" ||
          responsavelNorm === "na" ||
          responsavelNorm === "n/a" ||
          /^sem\b/.test(responsavelNorm);

        const dataUltTxt = idxUltAcomp >= 0 ? cleanCellText(tr.cells[idxUltAcomp]) : "";
        const dataUlt = parsePtBrDateTime(dataUltTxt);
        const ageDays =
          dataUlt instanceof Date
            ? Math.max(0, Math.floor((Date.now() - dataUlt.getTime()) / (24 * 60 * 60 * 1000)))
            : -1;
        const isParado5Dias = ageDays >= 5;
        const statusLabel = situacaoRaw || "Sem situacao";
        const titulo = idxTitulo >= 0 ? cleanCellText(tr.cells[idxTitulo]) : "";

        total += 1;
        if (isNova) novas += 1;
        if (isEmServico) emServico += 1;
        if (isServicoAprovado) servicoAprovado += 1;
        if (isAguardandoRetorno) aguardandoRetorno += 1;
        if (isAguardandoInformacoes) aguardandoInformacoes += 1;
        if (isSemResponsavel) semResponsavel += 1;
        if (isParado5Dias) parados5dias += 1;

        statusCounter.set(statusLabel, (statusCounter.get(statusLabel) || 0) + 1);

        if (dataUlt instanceof Date) {
          oldestRows.push({
            numero,
            situacao: statusLabel,
            titulo,
            ageDays,
          });
        }

        let focusScore = 0;
        if (isSemResponsavel) focusScore += 3;
        if (isParado5Dias) focusScore += 2;
        if (isServicoAprovado) focusScore += 1;
        if (isAguardandoRetorno || isAguardandoInformacoes) focusScore += 1;
        if (isNova) focusScore += 1;
        if (focusScore <= 0) return;
        focusRows.push({
          numero,
          situacao: statusLabel,
          titulo,
          responsavel: responsavelRaw,
          ageDays,
          score: focusScore,
          isNova,
          isAguardandoRetorno,
          isAguardandoInformacoes,
          isServicoAprovado,
          isSemResponsavel,
          isParado5Dias,
        });
      });
    });

    const oldestTop = oldestRows
      .sort((a, b) => b.ageDays - a.ageDays)
      .slice(0, 5);
    const focusTop = focusRows
      .sort((a, b) => b.score - a.score || b.ageDays - a.ageDays || String(a.numero).localeCompare(String(b.numero)))
      .slice(0, 6);
    const statusTop = Array.from(statusCounter.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const nextInSec =
      Number.isFinite(hsAjaxRefreshNextAt) && hsAjaxRefreshNextAt > 0
        ? Math.max(0, Math.ceil((hsAjaxRefreshNextAt - Date.now()) / 1000))
        : null;
    const digest = JSON.stringify({
      total,
      novas,
      emServico,
      servicoAprovado,
      aguardandoRetorno,
      aguardandoInformacoes,
      semResponsavel,
      parados5dias,
      oldestTop: oldestTop.map((x) => `${x.numero}:${x.ageDays}`),
      focusTop: focusTop.map((x) => `${x.numero}:${x.score}:${x.ageDays}`),
      statusTop,
      ajaxBusy: hsAjaxRefreshBusy,
      ajaxLastAt: hsAjaxRefreshLastAt,
      ajaxNextAt: hsAjaxRefreshNextAt,
      ajaxNew: hsAjaxRefreshLastNewCount,
      ajaxChanged: hsAjaxRefreshLastChangedCount,
      ajaxError: hsAjaxRefreshLastError,
      filtroAtual: hsConsultaStatusFilterNorm,
      filtroAtualLabel: hsConsultaStatusFilterLabel,
      nextInSec,
    });
    if (sideRoot.dataset.hsConsultaDigest === digest) return;
    sideRoot.dataset.hsConsultaDigest = digest;

    sideRoot.textContent = "";

    const createCard = (title, meta = "") => {
      const card = document.createElement("section");
      card.className = "hs-consulta-side-card";
      const h3 = document.createElement("h3");
      h3.textContent = title;
      card.appendChild(h3);
      if (meta) {
        const p = document.createElement("p");
        p.className = "hs-consulta-side-meta";
        p.textContent = meta;
        card.appendChild(p);
      }
      return card;
    };
    const appendKpi = (parent, label, value, tone = "", onClick = null, allowWhenZero = false) => {
      const item = document.createElement("article");
      item.className = `hs-consulta-kpi${tone ? ` is-${tone}` : ""}`;
      const labelEl = document.createElement("span");
      labelEl.className = "kpi-label";
      labelEl.textContent = label;
      const valueEl = document.createElement("strong");
      valueEl.className = "kpi-value";
      valueEl.textContent = String(value);
      item.appendChild(labelEl);
      item.appendChild(valueEl);
      if (typeof onClick === "function" && (allowWhenZero || Number(value) > 0)) {
        item.classList.add("is-clickable");
        item.setAttribute("role", "button");
        item.tabIndex = 0;
        item.addEventListener("click", (ev) => {
          ev.preventDefault();
          onClick();
        });
        item.addEventListener("keydown", (ev) => {
          const key = String(ev.key || "");
          if (key !== "Enter" && key !== " ") return;
          ev.preventDefault();
          onClick();
        });
      }
      parent.appendChild(item);
    };
    const now = formatShortDateTime(new Date().toISOString()) || "agora";
    const openPriorityTicket = (matcher, emptyMessage) => {
      const target = focusRows
        .filter((item) => typeof matcher === "function" && matcher(item))
        .sort((a, b) => b.score - a.score || b.ageDays - a.ageDays)[0];
      if (!target?.numero) {
        toast(emptyMessage || "Nenhum chamado correspondente encontrado.", "info", 2200);
        return;
      }
      openConsultaTicketFromPanel(target.numero);
    };
    const createTicketOpenButton = (numero) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "hs-ticket-open";
      btn.textContent = "Abrir";
      btn.addEventListener("click", (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        const forceNewTab = !!ev.ctrlKey || !!ev.metaKey || !!ev.shiftKey;
        openConsultaTicketFromPanel(numero, { forceNewTab });
      });
      btn.addEventListener("auxclick", (ev) => {
        if (Number(ev.button) !== 1) return;
        ev.preventDefault();
        ev.stopPropagation();
        openConsultaTicketFromPanel(numero, { forceNewTab: true });
      });
      return btn;
    };
    const summaryMeta = hsConsultaStatusFilterLabel
      ? `Atualizado em ${now} | Filtro: ${hsConsultaStatusFilterLabel}`
      : `Atualizado em ${now}`;

    const summaryCard = createCard("Painel de operacao", summaryMeta);
    const kpiGrid = document.createElement("div");
    kpiGrid.className = "hs-consulta-kpi-grid";
    appendKpi(kpiGrid, "Total visiveis", total, "", () => applyConsultaStatusQuickFilter("", { preserve: false }), true);
    appendKpi(kpiGrid, "Novas", novas, "new", () => applyConsultaStatusQuickFilter("Nova", { preserve: false }));
    appendKpi(
      kpiGrid,
      "Em servico",
      emServico,
      "",
      () => applyConsultaStatusQuickFilter("Em servico", { preserve: false })
    );
    appendKpi(
      kpiGrid,
      "Servico aprovado",
      servicoAprovado,
      "approved",
      () => applyConsultaStatusQuickFilter("Servico aprovado", { preserve: false })
    );
    appendKpi(
      kpiGrid,
      "Aguard. retorno",
      aguardandoRetorno,
      "warning",
      () => applyConsultaStatusQuickFilter("Aguardando retorno", { preserve: false })
    );
    appendKpi(
      kpiGrid,
      "Aguard. info",
      aguardandoInformacoes,
      "warning",
      () => applyConsultaStatusQuickFilter("Aguardando informacoes", { preserve: false })
    );
    appendKpi(
      kpiGrid,
      "Parados 5+ dias",
      parados5dias,
      "danger",
      () => openPriorityTicket((item) => item.isParado5Dias, "Nenhum chamado parado 5+ dias na grade atual.")
    );
    appendKpi(
      kpiGrid,
      "Sem responsavel",
      semResponsavel,
      "danger",
      () => openPriorityTicket((item) => item.isSemResponsavel, "Nenhum chamado sem responsavel na grade atual.")
    );
    summaryCard.appendChild(kpiGrid);
    sideRoot.appendChild(summaryCard);

    const syncMeta = hsAjaxRefreshBusy
      ? "Acompanhando carregamento da grade em tempo real."
      : "Sincronismo conectado ao refresh automatico dos chamados.";
    const syncCard = createCard("Sincronismo", syncMeta);
    const statusLine = document.createElement("div");
    statusLine.className = `hs-consulta-sync-status${
      hsAjaxRefreshBusy ? " is-loading" : hsAjaxRefreshLastError ? " is-error" : ""
    }`;
    statusLine.innerHTML = `<span class="dot"></span><span>${
      hsAjaxRefreshBusy ? "Atualizando agora" : hsAjaxRefreshLastError ? "Ultimo ciclo com erro" : "Monitorando grade"
    }</span>`;
    syncCard.appendChild(statusLine);

    const syncList = document.createElement("ul");
    syncList.className = "hs-consulta-sync-list";
    const addSyncItem = (label, value) => {
      const li = document.createElement("li");
      li.className = "hs-consulta-sync-item";
      li.innerHTML = `<span class="lbl">${label}</span><span class="val">${value}</span>`;
      syncList.appendChild(li);
    };
    addSyncItem("Ultimo sync", formatAgo(hsAjaxRefreshLastAt));
    addSyncItem(
      "Proximo ciclo",
      hsAjaxRefreshBusy ? "em andamento" : Number.isFinite(nextInSec) ? `${nextInSec}s` : "--"
    );
    addSyncItem(
      "Ultimo ciclo",
      `${hsAjaxRefreshLastNewCount || 0} novo(s) / ${hsAjaxRefreshLastChangedCount || 0} alterado(s)`
    );
    if (hsAjaxRefreshLastError) addSyncItem("Erro", clip(hsAjaxRefreshLastError, 38));
    syncCard.appendChild(syncList);

    const syncActions = document.createElement("div");
    syncActions.className = "hs-consulta-actions";
    const refreshBtn = document.createElement("button");
    refreshBtn.type = "button";
    refreshBtn.className = "hs-consulta-action-btn";
    refreshBtn.textContent = hsAjaxRefreshBusy ? "Atualizando..." : "Atualizar agora";
    refreshBtn.disabled = !!hsAjaxRefreshBusy;
    refreshBtn.onclick = (ev) => {
      ev.preventDefault();
      if (hsAjaxRefreshBusy) return;
      runAjaxGridRefresh();
    };
    syncActions.appendChild(refreshBtn);
    if (hsConsultaStatusFilterNorm) {
      const clearBtn = document.createElement("button");
      clearBtn.type = "button";
      clearBtn.className = "hs-consulta-action-btn";
      clearBtn.textContent = "Limpar filtro";
      clearBtn.onclick = (ev) => {
        ev.preventDefault();
        applyConsultaStatusQuickFilter("", { preserve: false });
      };
      syncActions.appendChild(clearBtn);
    }
    syncCard.appendChild(syncActions);
    sideRoot.appendChild(syncCard);

    const focusCard = createCard("Chamados em foco", "Prioridades operacionais com abertura em 1 clique.");
    if (focusTop.length) {
      const ul = document.createElement("ul");
      ul.className = "hs-consulta-list";
      focusTop.forEach((item) => {
        const li = document.createElement("li");
        li.className = "hs-consulta-ticket-item";
        li.tabIndex = 0;
        li.setAttribute("role", "button");
        bindConsultaPanelTicketActivator(li, item.numero);

        const main = document.createElement("div");
        main.className = "hs-main";

        const numEl = document.createElement("span");
        numEl.className = "hs-ticket-num";
        numEl.textContent = `#${item.numero}`;

        const right = document.createElement("span");
        right.className = "hs-ticket-main-right";
        if (item.ageDays >= 0) {
          const age = document.createElement("span");
          age.textContent = `${item.ageDays}d`;
          right.appendChild(age);
        }
        right.appendChild(createTicketOpenButton(item.numero));

        main.appendChild(numEl);
        main.appendChild(right);

        const tagRow = document.createElement("div");
        tagRow.className = "hs-tag-row";
        const addTag = (label, tone = "") => {
          const tag = document.createElement("span");
          tag.className = `hs-tag${tone ? ` is-${tone}` : ""}`;
          tag.textContent = label;
          tagRow.appendChild(tag);
        };
        if (item.isSemResponsavel) addTag("Sem responsavel", "danger");
        if (item.isParado5Dias) addTag(`${item.ageDays}d sem update`, "warning");
        if (item.isAguardandoRetorno) addTag("Aguard. retorno", "warning");
        if (item.isAguardandoInformacoes) addTag("Aguard. info", "warning");
        if (item.isNova) addTag("Nova", "new");
        if (item.isServicoAprovado) addTag("Servico aprovado", "approved");
        if (!tagRow.childElementCount && item.ageDays >= 0) addTag(`${item.ageDays}d`);

        const sub = document.createElement("div");
        sub.className = "hs-sub";
        sub.textContent = clip(
          `${item.situacao || "Sem situacao"}${item.responsavel ? ` | ${item.responsavel}` : ""}${
            item.titulo ? ` | ${item.titulo}` : ""
          }`,
          98
        );

        li.appendChild(main);
        if (tagRow.childElementCount) li.appendChild(tagRow);
        li.appendChild(sub);
        ul.appendChild(li);
      });
      focusCard.appendChild(ul);
    } else {
      const empty = document.createElement("p");
      empty.className = "hs-consulta-empty";
      empty.textContent = "Sem chamados criticos no momento.";
      focusCard.appendChild(empty);
    }
    sideRoot.appendChild(focusCard);

    const oldestCard = createCard("Fila mais antiga", "Chamados com maior tempo sem atualizacao.");
    if (oldestTop.length) {
      const ul = document.createElement("ul");
      ul.className = "hs-consulta-list";
      oldestTop.forEach((item) => {
        const li = document.createElement("li");
        li.className = "hs-consulta-ticket-item";
        li.tabIndex = 0;
        li.setAttribute("role", "button");
        bindConsultaPanelTicketActivator(li, item.numero);

        const main = document.createElement("div");
        main.className = "hs-main";

        const numEl = document.createElement("span");
        numEl.className = "hs-ticket-num";
        numEl.textContent = `#${item.numero}`;

        const right = document.createElement("span");
        right.className = "hs-ticket-main-right";
        const age = document.createElement("span");
        age.textContent = `${item.ageDays}d`;
        right.appendChild(age);
        right.appendChild(createTicketOpenButton(item.numero));

        main.appendChild(numEl);
        main.appendChild(right);

        const sub = document.createElement("div");
        sub.className = "hs-sub";
        sub.textContent = clip(
          `${item.situacao || "Sem situacao"}${item.titulo ? ` | ${item.titulo}` : ""}`,
          96
        );

        li.appendChild(main);
        li.appendChild(sub);
        ul.appendChild(li);
      });
      oldestCard.appendChild(ul);
    } else {
      const empty = document.createElement("p");
      empty.className = "hs-consulta-empty";
      empty.textContent = "Sem dados suficientes para ranking de antiguidade.";
      oldestCard.appendChild(empty);
    }
    sideRoot.appendChild(oldestCard);

    const statusCard = createCard(
      "Situacoes em destaque",
      "Top 5 situacoes da grade atual. Clique para filtrar."
    );
    if (statusTop.length) {
      const ul = document.createElement("ul");
      ul.className = "hs-consulta-list";
      statusTop.forEach(([label, count]) => {
        const li = document.createElement("li");
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "hs-consulta-status-filter-btn";
        if (hsConsultaStatusFilterNorm && norm(label) === hsConsultaStatusFilterNorm) {
          btn.classList.add("is-active");
        }
        btn.innerHTML = `<span class="hs-label">${clip(label, 58)}</span><span class="hs-count">${count}</span>`;
        btn.onclick = (ev) => {
          ev.preventDefault();
          applyConsultaStatusQuickFilter(label, { preserve: false });
        };
        li.appendChild(btn);
        ul.appendChild(li);
      });
      statusCard.appendChild(ul);
    } else {
      const empty = document.createElement("p");
      empty.className = "hs-consulta-empty";
      empty.textContent = "Sem linhas visiveis no momento.";
      statusCard.appendChild(empty);
    }
    sideRoot.appendChild(statusCard);
  }
  /**
   * Objetivo: Ativa layout profissional opcional na consulta de requisicoes.
   *
   * Contexto: organiza conteudo em duas colunas (grade + painel lateral).
   * Parametros: nenhum.
   * Retorno: void.
   */
  function ensureConsultaProLayout() {
    const isConsultaPage = /consulta_requisicao\.php/i.test(location.pathname);
    const shouldEnable =
      isConsultaPage && document.body.classList.contains("hs-dashboard-page") && isConsultaProLayoutEnabled();
    const conteudo = document.getElementById("conteudo");
    if (!(conteudo instanceof HTMLElement)) return;

    const shellExisting = document.getElementById("hs-consulta-shell");
    const mainExisting = document.getElementById("hs-consulta-main");

    if (!shouldEnable) {
      if (hsConsultaStatusFilterNorm) {
        applyConsultaStatusQuickFilter("", { preserve: false, silent: true });
      }
      document.body.classList.remove("hs-consulta-pro-enabled");
      if (shellExisting instanceof HTMLElement) {
        if (mainExisting instanceof HTMLElement) {
          const restoreTarget =
            shellExisting.parentElement instanceof HTMLElement ? shellExisting.parentElement : conteudo;
          while (mainExisting.firstChild) restoreTarget.insertBefore(mainExisting.firstChild, shellExisting);
        }
        shellExisting.remove();
      }
      return;
    }

    let shell = shellExisting;
    if (!(shell instanceof HTMLElement)) {
      shell = document.createElement("div");
      shell.id = "hs-consulta-shell";
    }
    let main = shell.querySelector("#hs-consulta-main");
    if (!(main instanceof HTMLElement)) {
      main = document.createElement("div");
      main.id = "hs-consulta-main";
    }
    let side = shell.querySelector("#hs-consulta-side");
    if (!(side instanceof HTMLElement)) {
      side = document.createElement("aside");
      side.id = "hs-consulta-side";
    }

    if (shell.parentElement !== conteudo) conteudo.appendChild(shell);
    const movableNodes = Array.from(conteudo.childNodes).filter((node) => node !== shell);
    movableNodes.forEach((node) => main.appendChild(node));

    if (shell.firstChild !== main) shell.insertBefore(main, shell.firstChild || null);
    if (side.parentElement !== shell || side === shell.firstChild) shell.appendChild(side);

    document.body.classList.add("hs-consulta-pro-enabled");
    applyConsultaStatusQuickFilter("", { preserve: true, silent: true });
    renderConsultaProLayoutPanel(side, main);
  }
  /**
   * Objetivo: Classifica linhas por situaÃ§Ã£o de atendimento em serviÃ§o.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: void.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function markServiceRows() {
    document.querySelectorAll("table.sortable").forEach((tb) => {
      const ths = Array.from(tb.querySelectorAll("thead th")).map((x) => norm(x.textContent));
      const sitIdx = ths.findIndex((t) => /situac|situacao/.test(t));
      const pctIdx = ths.findIndex((t) => /%|proxima/.test(t));
      if (sitIdx < 0) return;

      tb.querySelectorAll("tbody tr").forEach((tr) => {
        tr.classList.remove("hs-em", "hs-em100", "hs-servico-aprovado");
        const tds = tr.children;
        const sit = norm((tds[sitIdx]?.textContent) || "");
        if (isServicoAprovadoStatus(sit)) {
          tr.classList.add("hs-servico-aprovado");
          return;
        }
        const pct = (tds[pctIdx]?.textContent) || "";
        const emServ = /em serv/.test(sit);
        if (emServ) {
          const m = String(pct).match(/(\d{1,3})%/);
          const p = m ? parseInt(m[1], 10) : NaN;
          if (p === 100) tr.classList.add("hs-em100");
          else tr.classList.add("hs-em");
        }
      });
    });
  }
  /**
   * Objetivo: Uniformiza largura de tabelas e filtros do dashboard.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: valor calculado.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function normalizeDashboardTableWidths(overrideWidth = 0) {
    if (!document.body.classList.contains("hs-dashboard-page")) return;

    const conteudo = document.getElementById("conteudo") || document.body;
    const consultaMain =
      document.body.classList.contains("hs-consulta-pro-enabled")
        ? document.getElementById("hs-consulta-main")
        : null;
    const widthBase =
      consultaMain instanceof HTMLElement && consultaMain.getBoundingClientRect().width > 0
        ? consultaMain
        : conteudo;
    const conteudoWidth = Math.round(widthBase.getBoundingClientRect().width || 0);
    const fallbackWidth = conteudoWidth > 0 ? Math.min(1320, conteudoWidth) : 1320;
    const overrideRaw = Number(overrideWidth);
    const preferredStored = getStoredDashboardGridWidth(resolveAppearanceThemeMode());
    const preferredWidth =
      Number.isFinite(overrideRaw) && overrideRaw >= APPEARANCE_DASHBOARD_GRID_WIDTH_MIN
        ? Math.round(
            clampNumber(
              overrideRaw,
              APPEARANCE_DASHBOARD_GRID_WIDTH_MIN,
              APPEARANCE_DASHBOARD_GRID_WIDTH_MAX
            )
          )
        : preferredStored;

    const applyFiltrosWidth = (targetWidth) => {
      if (!Number.isFinite(targetWidth) || targetWidth <= 0) return;
      const filtrosForm = document.querySelector("#conteudo .filtros form[name='filtros']");
      if (!(filtrosForm instanceof HTMLFormElement)) return;

      filtrosForm.style.setProperty("box-sizing", "border-box", "important");
      filtrosForm.style.setProperty("width", `${targetWidth}px`, "important");
      filtrosForm.style.setProperty("min-width", `${targetWidth}px`, "important");
      filtrosForm.style.setProperty("max-width", `${targetWidth}px`, "important");
      filtrosForm.style.setProperty("margin-left", "auto", "important");
      filtrosForm.style.setProperty("margin-right", "auto", "important");

      const filtrosWrap = filtrosForm.parentElement;
      if (filtrosWrap instanceof HTMLElement) {
        filtrosWrap.style.setProperty("box-sizing", "border-box", "important");
        filtrosWrap.style.setProperty("width", `${targetWidth}px`, "important");
        filtrosWrap.style.setProperty("min-width", `${targetWidth}px`, "important");
        filtrosWrap.style.setProperty("max-width", `${targetWidth}px`, "important");
        filtrosWrap.style.setProperty("margin-left", "auto", "important");
        filtrosWrap.style.setProperty("margin-right", "auto", "important");
      }
    };

    const tables = Array.from(document.querySelectorAll("#conteudo table.sortable")).filter(
      (tb) => tb instanceof HTMLTableElement
    );
    if (!tables.length) {
      const widthWhenNoTable = preferredWidth > 0 ? preferredWidth : fallbackWidth;
      applyFiltrosWidth(widthWhenNoTable);
      return widthWhenNoTable;
    }

    // Limpa medidas antigas para recalcular pela largura real do layout atual.
    tables.forEach((tb) => {
      tb.style.removeProperty("width");
      tb.style.removeProperty("min-width");
      tb.style.removeProperty("max-width");
      tb.style.removeProperty("margin-left");
      tb.style.removeProperty("margin-right");
    });

    const visibleTables = tables.filter((tb) => tb.offsetParent !== null);
    const sampleTables = visibleTables.length ? visibleTables : tables;
    const renderedWidths = sampleTables
      .map((tb) => Math.round(tb.getBoundingClientRect().width || 0))
      .filter((w) => w > 0);
    if (!renderedWidths.length) return 0;

    // Usa a maior largura visivel como referencia e replica para todas.
    const maxRenderedWidth = renderedWidths.reduce((acc, w) => Math.max(acc, w), renderedWidths[0]);
    if (maxRenderedWidth <= 0) return 0;

    let targetWidth = conteudoWidth > 0 ? Math.min(maxRenderedWidth, conteudoWidth) : maxRenderedWidth;
    if (preferredWidth > 0) {
      const maxAllowed =
        conteudoWidth > 0
          ? Math.min(conteudoWidth, APPEARANCE_DASHBOARD_GRID_WIDTH_MAX)
          : APPEARANCE_DASHBOARD_GRID_WIDTH_MAX;
      const minAllowed = Math.max(320, Math.min(APPEARANCE_DASHBOARD_GRID_WIDTH_MIN, maxAllowed));
      targetWidth = Math.round(clampNumber(preferredWidth, minAllowed, Math.max(minAllowed, maxAllowed)));
    }
    if (targetWidth <= 0) return 0;

    tables.forEach((tb) => {
      tb.style.setProperty("width", `${targetWidth}px`, "important");
      tb.style.setProperty("min-width", `${targetWidth}px`, "important");
      tb.style.setProperty("max-width", `${targetWidth}px`, "important");
      tb.style.setProperty("margin-left", "auto", "important");
      tb.style.setProperty("margin-right", "auto", "important");

      // Alguns layouts legados usam wrapper shrink-to-fit; ajusta junto.
      const parent = tb.parentElement;
      if (
        parent &&
        parent !== conteudo &&
        /^(div|center)$/i.test(parent.tagName) &&
        parent.children.length === 1
      ) {
        parent.style.setProperty("width", `${targetWidth}px`, "important");
        parent.style.setProperty("min-width", `${targetWidth}px`, "important");
        parent.style.setProperty("max-width", `${targetWidth}px`, "important");
        parent.style.setProperty("margin-left", "auto", "important");
        parent.style.setProperty("margin-right", "auto", "important");
      }
    });

    // Mantem a faixa de filtros com a mesma largura das tabelas.
    applyFiltrosWidth(targetWidth);
    return targetWidth;
  }
  /**
   * Objetivo: Permite redimensionar a grade do dashboard pelas bordas laterais.
   *
   * Contexto: comportamento "estilo janela" com persistencia por tema no navegador.
   * Parametros: nenhum.
   * Retorno: void.
   */
  function ensureDashboardGridEdgeResize() {
    if (!document.body.classList.contains("hs-dashboard-page")) return;
    const root = document.documentElement;
    if (!(root instanceof HTMLElement)) return;
    if (root.dataset.hsDashboardGridResizeBound === "1") return;
    root.dataset.hsDashboardGridResizeBound = "1";

    const EDGE_GAP_PX = 12;
    let drag = null;
    let hoverEdge = "";

    const clearCursor = () => {
      document.body?.style?.removeProperty("cursor");
      document.body?.style?.removeProperty("user-select");
      document.body?.style?.removeProperty("-webkit-user-select");
    };
    const setResizeCursor = () => {
      document.body?.style?.setProperty("cursor", "ew-resize", "important");
    };
    const getMainTableRect = () => {
      const table = Array.from(document.querySelectorAll("#conteudo table.sortable")).find(
        (tb) => tb instanceof HTMLTableElement && tb.offsetParent !== null
      );
      if (!(table instanceof HTMLTableElement)) return null;
      const rect = table.getBoundingClientRect();
      if (!rect || rect.width <= 0 || rect.height <= 0) return null;
      return rect;
    };
    const detectEdge = (clientX, clientY) => {
      const rect = getMainTableRect();
      if (!rect) return "";
      if (clientY < rect.top || clientY > rect.bottom) return "";
      if (Math.abs(clientX - rect.left) <= EDGE_GAP_PX) return "left";
      if (Math.abs(clientX - rect.right) <= EDGE_GAP_PX) return "right";
      return "";
    };

    document.addEventListener(
      "mousedown",
      (ev) => {
        if (!document.body.classList.contains("hs-dashboard-page")) return;
        if (ev.button !== 0) return;
        if (ev.defaultPrevented) return;
        const edge = detectEdge(ev.clientX, ev.clientY);
        if (!edge) return;
        const rect = getMainTableRect();
        if (!rect) return;
        const currentStored = getStoredDashboardGridWidth(resolveAppearanceThemeMode());
        drag = {
          edge,
          startX: ev.clientX,
          startWidth: Math.round(rect.width),
          currentWidth: Math.round(rect.width),
          storedBefore: currentStored,
        };
        setResizeCursor();
        document.body?.style?.setProperty("user-select", "none", "important");
        document.body?.style?.setProperty("-webkit-user-select", "none", "important");
        ev.preventDefault();
        ev.stopPropagation();
      },
      true
    );
    document.addEventListener(
      "mousemove",
      (ev) => {
        if (!document.body.classList.contains("hs-dashboard-page")) return;
        if (drag) {
          const delta = Number(ev.clientX) - Number(drag.startX || 0);
          const next = Math.round(drag.startWidth + (drag.edge === "right" ? delta : -delta));
          const applied = normalizeDashboardTableWidths(next);
          if (Number.isFinite(applied) && applied > 0) drag.currentWidth = applied;
          setResizeCursor();
          ev.preventDefault();
          return;
        }
        const edge = detectEdge(ev.clientX, ev.clientY);
        if (edge && hoverEdge !== edge) {
          hoverEdge = edge;
          setResizeCursor();
        } else if (!edge && hoverEdge) {
          hoverEdge = "";
          clearCursor();
        }
      },
      true
    );
    document.addEventListener(
      "mouseup",
      () => {
        if (!drag) return;
        const finalWidth = Number(drag.currentWidth || 0);
        const beforeWidth = Number(drag.storedBefore || 0);
        drag = null;
        hoverEdge = "";
        clearCursor();
        if (!Number.isFinite(finalWidth) || finalWidth <= 0) return;
        const saved = setStoredDashboardGridWidth(finalWidth, resolveAppearanceThemeMode());
        applyAppearanceSettings();
        normalizeDashboardTableWidths(saved);
        if (Math.abs((saved || 0) - (beforeWidth || 0)) >= 4) {
          toast(
            saved > 0
              ? `Largura da grade salva: ${saved}px.`
              : "Largura da grade voltou para automatico.",
            "ok",
            1800
          );
        }
      },
      true
    );
    window.addEventListener("blur", () => {
      if (!drag) return;
      drag = null;
      hoverEdge = "";
      clearCursor();
      normalizeDashboardTableWidths();
    });
  }
  /**
   * Objetivo: Sinaliza SLA de retorno externo com chips de aÃ§Ã£o.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: valor utilitario.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function signalExternalReturnSlaRules() {
    if (!document.body.classList.contains("hs-dashboard-page")) return;

    const getSectionTargets = () => {
      const targets = [];
      const headers = Array.from(document.querySelectorAll("h1,h2,h3,div,span,strong,b")).filter((el) =>
        norm(el.textContent || "").startsWith("aguardando retorno externo")
      );

      headers.forEach((h) => {
        h.querySelectorAll(".hs-ext-sla-summary").forEach((el) => el.remove());
        let sib = h.nextElementSibling;
        while (sib && !(sib.matches && sib.matches("table.sortable"))) sib = sib.nextElementSibling;
        if (sib && !targets.some((x) => x.table === sib)) targets.push({ header: h, table: sib });
      });

      return targets;
    };

    const targets = getSectionTargets();
    targets.forEach(({ header, table: tb }) => {
      const headerRow = tb.tHead?.rows?.[0] || Array.from(tb.rows || []).find((tr) => tr.querySelector("th"));
      if (!headerRow) return;

      const headers = Array.from(headerRow.cells || []).map((c) => norm((c.textContent || "").replace(/\s+/g, " ")));
      const idxSituacao = headers.findIndex((h) => SITUACAO_RX.test(h));
      const idxUltAcomp = headers.findIndex((h) => /ultimo.*acompanh/.test(h));
      if (idxSituacao < 0 || idxUltAcomp < 0) return;

      let aprovaveis = 0;
      let cancelaveis = 0;

      const rows = Array.from(tb.tBodies?.[0]?.rows || tb.rows || []);
      rows.forEach((tr) => {
        if (!(tr instanceof HTMLTableRowElement)) return;
        if (tr.querySelector("th")) return;
        if (tr.offsetParent === null) return;

        const tdSit = tr.cells[idxSituacao];
        const tdUlt = tr.cells[idxUltAcomp];
        if (!tdSit || !tdUlt) return;

        tdSit.querySelectorAll(".hs-situacao-sinal").forEach((el) => el.remove());

        const sitClone = tdSit.cloneNode(true);
        sitClone.querySelectorAll(".hs-situacao-sinal").forEach((el) => el.remove());
        const situacaoNorm = norm(sitClone.textContent || "");

        const dataTxt = String(tdUlt.textContent || "").replace(/\s+/g, " ").trim();
        const dataUlt = parsePtBrDateTime(dataTxt);
        if (!hasElapsedDays(dataUlt, 5)) return;

        let kind = "";
        let label = "";

        if (/em.*aprovac.*servic/.test(situacaoNorm)) {
          kind = "aprov-int";
          label = "Aprovacao interna";
          aprovaveis += 1;
        } else if (/aguardando.*informac/.test(situacaoNorm)) {
          kind = "ch-exp";
          label = "Chamado expirado";
          cancelaveis += 1;
        }

        if (!kind) return;

        const badge = document.createElement("span");
        badge.className = `hs-situacao-sinal ${kind}`;
        badge.textContent = label;
        badge.dataset.hsSituacaoLabel = label;
        badge.dataset.hsSituacaoKey = normalizeSituacaoColorKey(label);
        tdSit.appendChild(badge);
      });

      if (!(header instanceof HTMLElement)) return;
      if (aprovaveis <= 0 && cancelaveis <= 0) return;

      const summary = document.createElement("span");
      summary.className = "hs-ext-sla-summary";
      if (aprovaveis > 0) {
        const chipAprov = document.createElement("span");
        chipAprov.className = "hs-ext-sla-chip aprov-int";
        chipAprov.textContent = `Aprovaveis: ${aprovaveis}`;
        chipAprov.dataset.hsSituacaoLabel = "Aprovacao interna";
        chipAprov.dataset.hsSituacaoKey = normalizeSituacaoColorKey("Aprovacao interna");
        summary.appendChild(chipAprov);
      }
      if (cancelaveis > 0) {
        const chipCanc = document.createElement("span");
        chipCanc.className = "hs-ext-sla-chip ch-exp";
        chipCanc.textContent = `Cancelaveis: ${cancelaveis}`;
        chipCanc.dataset.hsSituacaoLabel = "Chamado expirado";
        chipCanc.dataset.hsSituacaoKey = normalizeSituacaoColorKey("Chamado expirado");
        summary.appendChild(chipCanc);
      }
      header.appendChild(summary);
    });
  }
  /**
   * Objetivo: Marca colunas-chave do dashboard com classes auxiliares.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: void.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function tagDashboardGridColumns() {
    if (!document.body.classList.contains("hs-dashboard-page")) return;

    document.querySelectorAll("table.sortable").forEach((tb) => {
      const headerRow = tb.tHead?.rows?.[0] || Array.from(tb.rows || []).find((tr) => tr.querySelector("th"));
      if (!headerRow) return;

      const headers = Array.from(headerRow.cells || []).map((c) => norm((c.textContent || "").trim()));
      const idxTitulo = headers.findIndex((h) => /(^| )titulo( |$)/.test(h));
      const idxSituacao = headers.findIndex((h) => SITUACAO_RX.test(h));
      if (idxTitulo < 0 && idxSituacao < 0) return;

      Array.from(tb.rows || []).forEach((row) => {
        Array.from(row.cells || []).forEach((cell) => {
          cell.classList.remove("hs-col-titulo", "hs-col-situacao");
        });

        if (idxTitulo >= 0 && row.cells[idxTitulo]) row.cells[idxTitulo].classList.add("hs-col-titulo");
        if (idxSituacao >= 0 && row.cells[idxSituacao]) row.cells[idxSituacao].classList.add("hs-col-situacao");
      });
    });
  }
  /**
   * Objetivo: Extrai texto limpo da cÃ©lula de situaÃ§Ã£o.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros:
   * - td: entrada usada por esta rotina.
   * Retorno: valor calculado.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function getSituacaoCellText(td) {
    if (!(td instanceof HTMLTableCellElement)) return "";
    const user2Api = getUser2SettingsApi();
    if (user2Api && typeof user2Api.extractSituacaoTextFromCell === "function") {
      const fromApi = sanitizeSituacaoColorLabel(user2Api.extractSituacaoTextFromCell(td));
      if (fromApi) return fromApi;
    }
    const sitNode =
      td.querySelector(".Situacao") ||
      td.querySelector(".situacao") ||
      td.querySelector("[class*='Situacao']") ||
      td.querySelector("[class*='situacao']");
    if (sitNode) return sanitizeSituacaoColorLabel(sitNode.textContent || "");

    const clone = td.cloneNode(true);
    clone
      .querySelectorAll(".hs-first-att-wrap, .hs-situacao-sinal, .hs-ext-sla-chip, .hs-row-state-dot")
      .forEach((el) => el.remove());
    return sanitizeSituacaoColorLabel(clone.textContent || "");
  }
  /**
   * Objetivo: Garante botÃ£o de 1Âº atendimento na consulta de requisiÃ§Ãµes.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: void.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function ensureConsultaPrimeiroAtendimentoButtons() {
    if (!/consulta_requisicao\.php/i.test(location.pathname)) return;

    document.querySelectorAll("table.sortable").forEach((table) => {
      const ths = Array.from(table.tHead?.rows?.[0]?.cells || []);
      if (!ths.length) return;

      const idxSituacao = ths.findIndex((th) => SITUACAO_RX.test(th.textContent || ""));
      if (idxSituacao < 0) return;

      const rows = Array.from(table.tBodies?.[0]?.rows || []);
      rows.forEach((tr) => {
        if (!(tr instanceof HTMLTableRowElement)) return;
        if (tr.querySelector("th")) return;

        const tdSit = tr.cells[idxSituacao];
        if (!tdSit) return;

        const numero = extractNumero(tr);
        const sitNow = norm(getSituacaoCellText(tdSit));
        const isNova = NOVA_RX.test(sitNow);

        let wrap = tdSit.querySelector(".hs-first-att-wrap");
        let btn = tdSit.querySelector(".hs-first-att-btn");

        if (!isNova || !numero) {
          if (wrap) wrap.remove();
          return;
        }

        if (!wrap) {
          wrap = document.createElement("div");
          wrap.className = "hs-first-att-wrap";
          tdSit.appendChild(wrap);
        }

        if (!btn) {
          btn = document.createElement("input");
          btn.type = "button";
          btn.className = "hs-first-att-btn";
          btn.value = "1\u00b0 atendimento";
          wrap.appendChild(btn);
        }

        btn.disabled = tr.dataset.hsSending === "1";

        if (btn.dataset.hsBound === "1") return;
        btn.dataset.hsBound = "1";

        btn.addEventListener("click", (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          ev.stopImmediatePropagation();

          const row = btn.closest("tr");
          if (!(row instanceof HTMLTableRowElement)) return;
          if (row.dataset.hsSending === "1") return;

          const td = row.cells[idxSituacao];
          const situacao = norm(getSituacaoCellText(td));
          if (!NOVA_RX.test(situacao)) return;

          const reqNumero = extractNumero(row);
          if (!reqNumero) return;

          enviarPrimeiroAtendimento(reqNumero, row, idxSituacao);
        });
      });
    });
  }
  /**
   * Objetivo: Atualiza chips de contagem (total/vermelho/verde) por seÃ§Ã£o.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: void.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function ensureCountBadges() {
    const wanted = ["aguardando seu retorno", "em servico", "em serviÃ§o"];
    const headers = Array.from(document.querySelectorAll("h1,h2,h3,div,span,strong,b")).filter((el) =>
      wanted.some((w) => norm(el.textContent || "").startsWith(w))
    );

    const mkChip = (kind, label, value) => {
      const chip = document.createElement("span");
      chip.className = `hs-chip hs-chip-${kind}`;
      chip.innerHTML = `<span class="dot"></span><span class="lbl">${label}</span><span class="num">${value}</span>`;
      return chip;
    };

    headers.forEach((h) => {
      let sib = h.nextElementSibling;
      while (sib && !(sib.matches && sib.matches("table.sortable"))) sib = sib.nextElementSibling;
      if (!sib) return;

      let total = 0;
      let red = 0;
      let green = 0;
      sib.querySelectorAll("tbody tr").forEach((tr) => {
        if (tr.offsetParent === null) return;
        total++;

        const isRed = tr.classList.contains("req_at") || tr.classList.contains("hs-em100");
        const isGreen =
          !isRed &&
          (tr.classList.contains("req_nv") || tr.classList.contains("req_sr"));

        if (isRed) red++;
        else if (isGreen) green++;
      });

      h.querySelectorAll(":scope > .hs-chip").forEach((c) => c.remove());

      h.appendChild(mkChip("total", "Total:", total));
      if (red > 0) h.appendChild(mkChip("red", "Vermelho:", red));
      if (green > 0) h.appendChild(mkChip("green", "Verde:", green));
    });
  }

  /* ------------- SECTION: UTILITARIOS DE REQUISICAO E TEXTO IA -------------- */
  /**
   * Objetivo: Valida se a rota atual Ã© visualizar_requisicao.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: boolean.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function isRequestVisualizarPage() {
    return /visualizar_requisicao\.php/i.test(location.pathname);
  }
  /**
   * Objetivo: Identifica quando visualizar requisicao esta aberto no popup interno.
   *
   * Contexto: fluxo de preview da grade usa querystring dedicada para ocultar cabecalho duplicado.
   * Parametros: nenhum.
   * Retorno: boolean.
   */
  function isRequestPopupPreviewMode() {
    if (!isRequestVisualizarPage()) return false;
    const html = document.documentElement;
    if (html instanceof HTMLElement && html.getAttribute("data-hs-popup-preview") === "1") return true;
    try {
      const raw = String(new URLSearchParams(location.search).get(REQ_POPUP_PREVIEW_QUERY_KEY) || "")
        .trim()
        .toLowerCase();
      return raw === "1" || raw === "true" || raw === "yes";
    } catch {
      return false;
    }
  }
  /**
   * Objetivo: Converte numeros de chamados referenciados em links clicaveis.
   *
   * Contexto: tela de visualizar requisicao; facilita abrir chamado citado no
   * titulo/descricao sem usar busca manual.
   * Parametros: nenhum.
   * Retorno: void.
   */
  function linkifyReferencedRequestNumbers() {
    if (!isRequestVisualizarPage()) return;
    const root = document.querySelector("#interno");
    if (!(root instanceof HTMLElement)) return;

    const numberRx = /\b\d{4,}\b/g;
    const candidateRx = /\d{4,}/;
    const skipTags = new Set([
      "A",
      "SCRIPT",
      "STYLE",
      "TEXTAREA",
      "INPUT",
      "SELECT",
      "BUTTON",
      "OPTION",
      "NOSCRIPT",
      "CODE",
      "PRE",
    ]);

    const isValidTicketNumber = (text, rawNumber, start, end) => {
      if (!rawNumber) return false;
      if (rawNumber.length === 4) {
        const year = Number(rawNumber);
        if (Number.isFinite(year) && year >= 1900 && year <= 2100) return false;
      }

      const before = start > 0 ? text[start - 1] : "";
      const after = end < text.length ? text[end] : "";
      if (before === "/" || before === "-" || before === ":" || after === "/" || after === "-" || after === ":") {
        return false;
      }
      return true;
    };

    const shouldSkipNode = (textNode) => {
      const parent = textNode.parentElement;
      if (!(parent instanceof HTMLElement)) return true;
      if (parent.closest("a,script,style,textarea,input,select,button,code,pre,noscript")) return true;
      if (parent.closest("[contenteditable='true']")) return true;

      let el = parent;
      while (el) {
        if (skipTags.has(el.tagName)) return true;
        if (el === root) break;
        el = el.parentElement;
      }
      return false;
    };

    const nodes = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const txt = String(node?.nodeValue || "");
        if (!txt || !candidateRx.test(txt)) return NodeFilter.FILTER_REJECT;
        if (shouldSkipNode(node)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    let current = walker.nextNode();
    while (current) {
      nodes.push(current);
      current = walker.nextNode();
    }

    nodes.forEach((textNode) => {
      const originalText = String(textNode.nodeValue || "");
      if (!originalText) return;
      numberRx.lastIndex = 0;

      let match = null;
      let lastIndex = 0;
      let changed = false;
      const frag = document.createDocumentFragment();
      while ((match = numberRx.exec(originalText)) !== null) {
        const num = String(match[0] || "").trim();
        const start = match.index;
        const end = start + num.length;
        if (!isValidTicketNumber(originalText, num, start, end)) continue;

        if (start > lastIndex) {
          frag.appendChild(document.createTextNode(originalText.slice(lastIndex, start)));
        }

        const a = document.createElement("a");
        a.href = `${location.origin}/visualizar_requisicao.php?numero=${encodeURIComponent(num)}`;
        a.textContent = num;
        a.title = `Abrir chamado ${num}`;
        a.setAttribute("data-hs-req-ref-link", "1");
        frag.appendChild(a);

        lastIndex = end;
        changed = true;
      }

      if (!changed) return;
      if (lastIndex < originalText.length) {
        frag.appendChild(document.createTextNode(originalText.slice(lastIndex)));
      }
      textNode.parentNode?.replaceChild(frag, textNode);
    });
  }
  /**
   * Objetivo: Libera URL temporaria (blob) usada no preview de imagem.
   *
   * Contexto: evita vazamento de memoria ao trocar/fechar previews.
   * Parametros: nenhum.
   * Retorno: void.
   */
  function releaseImagePreviewObjectUrl() {
    if (typeof hsImagePreviewObjectUrlRevoke === "function") {
      try {
        hsImagePreviewObjectUrlRevoke();
      } catch {}
    }
    hsImagePreviewObjectUrlRevoke = null;
  }
  /**
   * Objetivo: Detecta se URL parece endpoint de anexo protegido do sistema.
   *
   * Contexto: usado para decidir quando buscar imagem via fetch autenticado.
   * Parametros:
   * - value: entrada usada por esta rotina.
   * Retorno: boolean.
   */
  function isProtectedAttachmentUrl(value) {
    const raw = String(value || "").trim();
    if (!raw) return false;
    try {
      const u = new URL(raw, location.href);
      if (!/\/anexo(?:\.php)?$/i.test(u.pathname)) {
        const hasStrongHint =
          u.searchParams.has("guid") || u.searchParams.has("anexo") || u.searchParams.has("id_anexo");
        if (!hasStrongHint) return false;
      }
      return u.origin === location.origin;
    } catch {
      return false;
    }
  }
  /**
   * Objetivo: Normaliza URL de anexo para o mesmo protocolo/origem atual quando possivel.
   *
   * Contexto: evita falhas de leitura por origem mista (http x https) no preview TXT/SQL.
   * Parametros:
   * - value: URL original do anexo.
   * Retorno: string.
   */
  function normalizeAttachmentPreviewUrl(value) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    try {
      const u = new URL(raw, location.href);
      const hostMatches = String(u.hostname || "").toLowerCase() === String(location.hostname || "").toLowerCase();
      const attachmentHint =
        /\/anexo(?:\.php)?$/i.test(String(u.pathname || "")) ||
        u.searchParams.has("guid") ||
        u.searchParams.has("anexo") ||
        u.searchParams.has("id_anexo");
      if (hostMatches && attachmentHint && u.protocol !== location.protocol) {
        const sameOrigin = new URL(location.origin);
        sameOrigin.pathname = u.pathname;
        sameOrigin.search = u.search;
        sameOrigin.hash = u.hash;
        return sameOrigin.toString();
      }
      return u.toString();
    } catch {
      return raw;
    }
  }
  /**
   * Objetivo: Extrai URL real de download quando endpoint retorna HTML com iframe.
   *
   * Contexto: corrige preview de anexos que chegam encapsulados por pagina intermediaria.
   * Parametros:
   * - html: conteudo HTML bruto.
   * - baseUrl: URL de base para resolver caminhos relativos.
   * Retorno: string.
   */
  function extractEmbeddedAttachmentUrl(html, baseUrl = "") {
    const raw = String(html || "");
    if (!raw) return "";
    const toAbs = (value) => {
      const txt = String(value || "").trim();
      if (!txt || /^javascript:/i.test(txt)) return "";
      try {
        return new URL(txt, baseUrl || location.href).toString();
      } catch {
        return txt;
      }
    };
    try {
      const doc = new DOMParser().parseFromString(raw, "text/html");
      const iframe = doc.querySelector("iframe[src], frame[src], embed[src]");
      if (iframe instanceof HTMLElement) {
        const src =
          iframe.getAttribute("src") ||
          iframe.getAttribute("data-src") ||
          iframe.getAttribute("data-url") ||
          "";
        const abs = toAbs(src);
        if (abs) return abs;
      }
      const objectEl = doc.querySelector("object[data]");
      if (objectEl instanceof HTMLElement) {
        const abs = toAbs(objectEl.getAttribute("data") || "");
        if (abs) return abs;
      }
      const metaRefresh = doc.querySelector('meta[http-equiv="refresh"][content]');
      if (metaRefresh instanceof HTMLElement) {
        const content = String(metaRefresh.getAttribute("content") || "");
        const m = content.match(/url\s*=\s*(['"]?)([^'";]+)\1/i);
        const abs = toAbs(m?.[2] || "");
        if (abs) return abs;
      }
      const anchor = doc.querySelector("a[href][download], a[href*='blob.core.windows.net'], a[href]");
      if (anchor instanceof HTMLAnchorElement) {
        const abs = toAbs(anchor.getAttribute("href") || "");
        if (abs) return abs;
      }
    } catch {}
    const rx = /\b(?:src|href)\s*=\s*["']([^"']+)["']/gi;
    let match = null;
    while ((match = rx.exec(raw))) {
      const abs = toAbs(match[1] || "");
      if (abs) return abs;
    }
    return "";
  }
  /**
   * Objetivo: Deduz MIME de imagem com base em metadados de anexo.
   *
   * Contexto: corrige casos em que endpoint retorna blob sem tipo.
   * Parametros:
   * - fileName: entrada usada por esta rotina.
   * - fileType: entrada usada por esta rotina.
   * - sourceUrl: entrada usada por esta rotina.
   * Retorno: string.
   */
  function inferImageMime(fileName = "", fileType = "", sourceUrl = "") {
    const mime = String(fileType || "").trim().toLowerCase();
    if (/^image\/(?:png|jpeg|jpg)$/.test(mime)) return mime.replace("jpg", "jpeg");

    const sourceNameCandidates = [fileName];
    try {
      const u = new URL(String(sourceUrl || ""), location.href);
      sourceNameCandidates.push(u.searchParams.get("name") || "");
      sourceNameCandidates.push(u.searchParams.get("filename") || "");
      sourceNameCandidates.push(u.searchParams.get("file") || "");
      sourceNameCandidates.push(u.searchParams.get("arquivo") || "");
      sourceNameCandidates.push(u.pathname.split("/").pop() || "");
    } catch {}

    const fullName = sourceNameCandidates.join(" ").toLowerCase();
    if (/\.(png)(?:$|\s|\?|&)/.test(fullName)) return "image/png";
    if (/\.(jpe?g)(?:$|\s|\?|&)/.test(fullName)) return "image/jpeg";
    return "";
  }
  /**
   * Objetivo: Resolve melhor fonte de imagem para preview no modal.
   *
   * Contexto: para anexos protegidos, busca bytes com credenciais da sessao.
   * Parametros:
   * - imageUrl: entrada usada por esta rotina.
   * - label: entrada usada por esta rotina.
   * - fileType: entrada usada por esta rotina.
   * Retorno: Promise<object>.
   */
  async function resolvePreviewImageSource(imageUrl, label = "", fileType = "", depth = 0) {
    const raw = String(imageUrl || "").trim();
    if (!raw) return { previewSrc: "", fallbackSrc: "", revoke: null };
    if (depth > 4) return { previewSrc: "", fallbackSrc: "", revoke: null };
    let absolute = raw;
    try {
      absolute = new URL(raw, location.href).toString();
    } catch {}

    if (!/^https?:/i.test(absolute)) {
      return { previewSrc: absolute, fallbackSrc: absolute, revoke: null };
    }
    if (!isProtectedAttachmentUrl(absolute)) {
      return { previewSrc: absolute, fallbackSrc: absolute, revoke: null };
    }

    try {
      const response = await fetch(absolute, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      const headerType = String(response.headers?.get("content-type") || "").trim().toLowerCase();
      const mimeHint = inferImageMime(label, fileType, absolute);
      const blobMime = String(blob.type || "").trim().toLowerCase();
      const likelyHtmlPayload =
        /(?:text\/html|application\/xhtml\+xml)/i.test(headerType) ||
        /(?:text\/html|application\/xhtml\+xml|text\/plain|application\/json|application\/xml)/i.test(blobMime);
      if (likelyHtmlPayload) {
        const asText = await blob.text();
        const embeddedUrl = extractEmbeddedAttachmentUrl(asText, absolute);
        if (embeddedUrl && embeddedUrl !== absolute) {
          return resolvePreviewImageSource(embeddedUrl, label, fileType, depth + 1);
        }
      }
      const normalizedBlob =
        /^image\/(?:png|jpeg|jpg|webp|gif|bmp|svg\+xml|avif)$/i.test(blobMime) || !mimeHint
          ? blob
          : blob.slice(0, blob.size, mimeHint);
      const objectUrl = URL.createObjectURL(normalizedBlob);
      return {
        previewSrc: objectUrl,
        fallbackSrc: absolute,
        revoke: () => {
          try {
            URL.revokeObjectURL(objectUrl);
          } catch {}
        },
      };
    } catch {
      return { previewSrc: absolute, fallbackSrc: absolute, revoke: null };
    }
  }
  /**
   * Objetivo: Normaliza conteudo textual para preview seguro e legivel.
   *
   * Contexto: usado no modal tipo editor para anexos TXT/SQL.
   * Parametros:
   * - value: entrada textual bruta.
   * Retorno: string.
   */
  function normalizeTextPreviewContent(value) {
    const raw = String(value || "");
    const noBom = raw.replace(/^\uFEFF/, "");
    const normalized = noBom.replace(/\r\n?/g, "\n");
    const withoutNull = normalized.replace(/\u0000/g, "");
    const LIMIT = 2_500_000;
    if (withoutNull.length <= LIMIT) return withoutNull;
    return `${withoutNull.slice(0, LIMIT)}\n\n[preview truncado: arquivo muito grande]`;
  }
  /**
   * Objetivo: Atualiza URL de origem exibida no modal textual.
   *
   * Contexto: usado para oferecer acao de copiar link do anexo remoto.
   * Parametros:
   * - modal: elemento do modal textual.
   * - sourceUrl: URL absoluta ou vazia.
   * Retorno: void.
   */
  function setTextPreviewModalSourceUrl(modal, sourceUrl = "") {
    if (!(modal instanceof HTMLElement)) return;
    const clean = String(sourceUrl || "").trim();
    const linkWrap = modal.querySelector(".hs-text-viewer-link-wrap");
    const linkInput = modal.querySelector(".hs-text-viewer-link");
    modal.dataset.hsTextSourceUrl = clean;
    if (linkInput instanceof HTMLInputElement) {
      linkInput.value = clean;
      linkInput.title = clean || "Link indisponivel para este preview";
    }
    if (linkWrap instanceof HTMLElement) {
      linkWrap.style.display = clean ? "flex" : "none";
    }
  }
  /**
   * Objetivo: Ativa guard temporario contra abertura concorrente de nova guia do mesmo anexo.
   *
   * Contexto: evita corrida entre handlers legados e o preview TXT/SQL em modal.
   * Parametros:
   * - sourceUrl: URL absoluta do anexo em preview.
   * Retorno: void.
   */
  function armTextPreviewWindowOpenGuard(sourceUrl = "") {
    const root = document.documentElement;
    if (!(root instanceof HTMLElement) || !root.dataset) return;
    const clean = String(sourceUrl || "").trim();
    if (!clean) return;
    root.dataset.hsTextPreviewGuardUntil = String(Date.now() + 9000);
    root.dataset.hsTextPreviewGuardUrl = clean;
    let guid = "";
    try {
      const u = new URL(clean, location.href);
      guid = String(u.searchParams.get("guid") || u.searchParams.get("anexo") || u.searchParams.get("id_anexo") || "")
        .trim()
        .toLowerCase();
    } catch {}
    root.dataset.hsTextPreviewGuardGuid = guid;
  }
  /**
   * Objetivo: Gera id curto para sincronizar requisicao de preview textual via bridge.
   *
   * Contexto: usado na comunicacao entre aba principal e aba do anexo (postMessage).
   * Parametros: nenhum.
   * Retorno: string.
   */
  function buildTextPreviewBridgeRequestId() {
    return `hs-txt-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
  /**
   * Objetivo: Monta chave de persistencia temporaria do bridge textual.
   *
   * Contexto: fallback entre abas quando postMessage/opener nao estiver disponivel.
   * Parametros:
   * - reqId: id curto do request.
   * Retorno: string.
   */
  function buildTextPreviewBridgeStorageKey(reqId = "") {
    const clean = String(reqId || "").trim();
    if (!clean) return "";
    return `${TEXT_PREVIEW_BRIDGE_STORAGE_KEY_PREFIX}${clean}`;
  }
  /**
   * Objetivo: Grava payload de bridge textual em storage local temporario.
   *
   * Contexto: fallback de comunicacao entre aba do anexo e modal principal.
   * Parametros:
   * - reqId: id do request bridge.
   * - payload: objeto com resultado ok/error e metadados.
   * Retorno: void.
   */
  function writeTextPreviewBridgeStoragePayload(reqId, payload = {}) {
    const key = buildTextPreviewBridgeStorageKey(reqId);
    if (!key) return;
    try {
      const safe = payload && typeof payload === "object" ? payload : {};
      localStorage.setItem(
        key,
        JSON.stringify({
          requestId: String(reqId || "").trim(),
          ok: !!safe.ok,
          sourceUrl: String(safe.sourceUrl || ""),
          label: String(safe.label || ""),
          content: String(safe.content || ""),
          error: String(safe.error || ""),
          at: Date.now(),
        })
      );
    } catch {}
  }
  /**
   * Objetivo: Le payload temporario do bridge textual do storage local.
   *
   * Contexto: utilizado como fallback quando nao houver retorno por postMessage.
   * Parametros:
   * - reqId: id do request bridge.
   * Retorno: objeto|null.
   */
  function readTextPreviewBridgeStoragePayload(reqId) {
    const key = buildTextPreviewBridgeStorageKey(reqId);
    if (!key) return null;
    try {
      const raw = String(localStorage.getItem(key) || "");
      if (!raw.trim()) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return null;
      const at = Number(parsed.at || 0);
      if (Number.isFinite(at) && at > 0 && Date.now() - at > TEXT_PREVIEW_BRIDGE_STORAGE_TTL_MS) {
        localStorage.removeItem(key);
        return null;
      }
      return {
        ok: !!parsed.ok,
        sourceUrl: String(parsed.sourceUrl || ""),
        label: String(parsed.label || ""),
        content: String(parsed.content || ""),
        error: String(parsed.error || ""),
      };
    } catch {
      return null;
    }
  }
  /**
   * Objetivo: Remove payload temporario do bridge textual.
   *
   * Contexto: cleanup apos concluir request ou em timeout.
   * Parametros:
   * - reqId: id do request bridge.
   * Retorno: void.
   */
  function clearTextPreviewBridgeStoragePayload(reqId) {
    const key = buildTextPreviewBridgeStorageKey(reqId);
    if (!key) return;
    try {
      localStorage.removeItem(key);
    } catch {}
  }
  /**
   * Objetivo: Registra listener unico de mensagens do bridge de preview textual.
   *
   * Contexto: recebe payload da aba do anexo e resolve promessa pendente no modal.
   * Parametros: nenhum.
   * Retorno: void.
   */
  function ensureTextPreviewBridgeReceiver() {
    if (hsTextPreviewBridgeBound) return;
    hsTextPreviewBridgeBound = true;
    window.addEventListener("message", (ev) => {
      const data = ev?.data;
      if (!data || typeof data !== "object") return;
      if (String(data.type || "") !== "hs-text-preview-bridge") return;
      const reqId = String(data.requestId || "").trim();
      if (!reqId) return;
      const pending = hsTextPreviewBridgePending.get(reqId);
      if (!pending) return;

      const expectedHost = String(location.hostname || "").trim().toLowerCase();
      let originHost = "";
      try {
        originHost = String(new URL(String(ev.origin || "")).hostname || "")
          .trim()
          .toLowerCase();
      } catch {}
      if (originHost && expectedHost && originHost !== expectedHost) return;

      if (typeof pending.settle !== "function") return;
      const ok = !!data.ok;
      if (ok) {
        pending.settle(true, String(data.content || ""));
        return;
      }
      pending.settle(false, String(data.error || "Falha no bridge textual."));
    });
  }
  /**
   * Objetivo: Solicita leitura do texto via nova guia do anexo e retorna payload ao modal.
   *
   * Contexto: usado quando preview precisa executar no contexto real do arquivo.
   * Parametros:
   * - fileUrl: URL alvo do anexo.
   * Retorno: Promise<string>.
   */
  function requestTextPreviewViaBridgeTab(fileUrl) {
    const raw = String(fileUrl || "").trim();
    if (!raw) return Promise.reject(new Error("URL vazia."));
    ensureTextPreviewBridgeReceiver();
    const reqId = buildTextPreviewBridgeRequestId();
    let bridgeUrl = normalizeAttachmentPreviewUrl(raw) || raw;
    try {
      const u = new URL(bridgeUrl, location.href);
      u.searchParams.set(TEXT_PREVIEW_BRIDGE_QUERY_KEY, "1");
      u.searchParams.set(TEXT_PREVIEW_BRIDGE_ID_QUERY_KEY, reqId);
      bridgeUrl = u.toString();
    } catch {}

    return new Promise((resolve, reject) => {
      const REQUEST_TIMEOUT_MS = 32000;
      const STORAGE_POLL_INTERVAL_MS = 240;
      let done = false;
      let timer = null;
      let poll = null;
      const cleanup = () => {
        try {
          if (timer) window.clearTimeout(timer);
        } catch {}
        try {
          if (poll) window.clearInterval(poll);
        } catch {}
        hsTextPreviewBridgePending.delete(reqId);
        clearTextPreviewBridgeStoragePayload(reqId);
      };
      const settle = (ok, payload) => {
        if (done) return;
        done = true;
        cleanup();
        if (ok) {
          resolve(String(payload || ""));
          return;
        }
        reject(new Error(String(payload || "Falha no bridge textual.")));
      };
      hsTextPreviewBridgePending.set(reqId, { settle });
      clearTextPreviewBridgeStoragePayload(reqId);
      timer = window.setTimeout(() => {
        settle(false, "Timeout aguardando retorno da nova guia.");
      }, REQUEST_TIMEOUT_MS);
      poll = window.setInterval(() => {
        const payload = readTextPreviewBridgeStoragePayload(reqId);
        if (!payload) return;
        if (payload.ok) {
          settle(true, payload.content || "");
          return;
        }
        settle(false, payload.error || "Falha no bridge textual (storage).");
      }, STORAGE_POLL_INTERVAL_MS);

      // Bridge tenta postMessage (opener) e fallback por localStorage.
      const opened = window.open(bridgeUrl, "_blank");
      if (!opened) settle(false, "Nova guia bloqueada pelo navegador.");
    });
  }
  /**
   * Objetivo: Se a aba atual for de bridge textual, envia o conteudo para a aba principal.
   *
   * Contexto: executado no proprio anexo.php aberto com query hs_text_preview=1.
   * Parametros: nenhum.
   * Retorno: void.
   */
  function runTextPreviewBridgeSenderIfNeeded() {
    let reqId = "";
    try {
      const qs = new URLSearchParams(location.search);
      const enabled = String(qs.get(TEXT_PREVIEW_BRIDGE_QUERY_KEY) || "")
        .trim()
        .toLowerCase();
      if (!(enabled === "1" || enabled === "true" || enabled === "yes")) return;
      reqId = String(qs.get(TEXT_PREVIEW_BRIDGE_ID_QUERY_KEY) || "").trim();
    } catch {
      return;
    }
    if (!reqId) return;

    const root = document.documentElement;
    if (root instanceof HTMLElement && root.dataset.hsTextBridgeSent === reqId) return;

    const sourceUrl = (() => {
      try {
        const u = new URL(location.href);
        u.searchParams.delete(TEXT_PREVIEW_BRIDGE_QUERY_KEY);
        u.searchParams.delete(TEXT_PREVIEW_BRIDGE_ID_QUERY_KEY);
        return u.toString();
      } catch {
        return location.href;
      }
    })();
    const label = (() => {
      try {
        const u = new URL(sourceUrl, location.href);
        const name =
          u.searchParams.get("name") ||
          u.searchParams.get("filename") ||
          u.searchParams.get("file") ||
          u.searchParams.get("arquivo") ||
          "";
        if (name) return String(name);
      } catch {}
      return String(document.title || "anexo.txt");
    })();

    const postPayload = (ok, payload) => {
      const normalizedPayload = ok
        ? { content: String(payload || "") }
        : { error: String(payload || "Falha no bridge.") };
      writeTextPreviewBridgeStoragePayload(reqId, {
        ok: !!ok,
        sourceUrl,
        label,
        ...normalizedPayload,
      });

      if (!window.opener || window.opener.closed) return;
      try {
        window.opener.postMessage(
          {
            type: "hs-text-preview-bridge",
            requestId: reqId,
            ok: !!ok,
            sourceUrl,
            label,
            ...normalizedPayload,
          },
          "*"
        );
      } catch {}
    };

    const BRIDGE_READ_TIMEOUT_MS = 30000;
    const BRIDGE_READ_INTERVAL_MS = 240;
    const readStartedAt = Date.now();
    let finished = false;
    const finish = (ok, payload) => {
      if (finished) return;
      finished = true;
      if (ok && root instanceof HTMLElement) root.dataset.hsTextBridgeSent = reqId;
      postPayload(ok, payload);
    };
    const readCurrentText = () => {
      const pre = document.querySelector("pre");
      let text = String(pre?.textContent || "");
      if (!text.trim()) {
        const body = document.body;
        text = String(body?.innerText || body?.textContent || "");
      }
      if (!text.trim()) {
        text = String(document.documentElement?.innerText || document.documentElement?.textContent || "");
      }
      return normalizeTextPreviewContent(text);
    };
    const tryReadAndSend = () => {
      if (finished) return;
      try {
        const clean = readCurrentText();
        if (clean.trim()) {
          finish(true, clean);
          return;
        }
        if (Date.now() - readStartedAt >= BRIDGE_READ_TIMEOUT_MS) {
          finish(false, "Conteudo textual indisponivel na aba do anexo.");
          return;
        }
      } catch (err) {
        if (Date.now() - readStartedAt >= BRIDGE_READ_TIMEOUT_MS) {
          finish(false, String(err?.message || err || "Erro ao ler texto do anexo."));
          return;
        }
      }
      window.setTimeout(tryReadAndSend, BRIDGE_READ_INTERVAL_MS);
    };

    window.setTimeout(tryReadAndSend, 90);
    window.addEventListener("load", tryReadAndSend, { once: true });
  }
  /**
   * Objetivo: Fecha modal de preview textual.
   *
   * Contexto: compartilhado por anexos locais e recebidos (TXT/SQL).
   * Parametros: nenhum.
   * Retorno: void.
   */
  function closeTextPreviewModal() {
    if (!hsTextPreviewModal) hsTextPreviewModal = document.getElementById("hs-text-viewer");
    if (!(hsTextPreviewModal instanceof HTMLElement)) return;
    const codeEl = hsTextPreviewModal.querySelector(".hs-text-viewer-code");
    const stateEl = hsTextPreviewModal.querySelector(".hs-text-viewer-state");
    const titleEl = hsTextPreviewModal.querySelector(".hs-text-viewer-title");
    if (codeEl instanceof HTMLElement) codeEl.textContent = "";
    if (stateEl instanceof HTMLElement) {
      stateEl.style.display = "none";
      stateEl.textContent = "";
    }
    if (titleEl instanceof HTMLElement) titleEl.textContent = "Preview de texto";
    setTextPreviewModalSourceUrl(hsTextPreviewModal, "");
    hsTextPreviewModal.classList.remove("open");
  }
  /**
   * Objetivo: Garante modal de preview textual estilo editor.
   *
   * Contexto: usado para abrir anexos TXT/SQL no proprio chamado.
   * Parametros: nenhum.
   * Retorno: HTMLElement|null.
   */
  function ensureTextPreviewModal() {
    if (hsTextPreviewModal && hsTextPreviewModal.isConnected) return hsTextPreviewModal;
    let modal = document.getElementById("hs-text-viewer");
    if (!(modal instanceof HTMLElement)) {
      modal = document.createElement("div");
      modal.id = "hs-text-viewer";
      modal.className = "hs-text-viewer";
      modal.innerHTML = `
        <div class="hs-text-viewer-backdrop"></div>
        <section class="hs-text-viewer-card" role="dialog" aria-modal="true" aria-label="Preview do anexo de texto">
          <header class="hs-text-viewer-head">
            <span class="hs-text-viewer-title">Preview de texto</span>
            <div class="hs-text-viewer-actions">
              <button type="button" data-action="copy-link">Copiar link</button>
              <button type="button" data-action="copy">Copiar texto</button>
              <button type="button" data-action="close">Fechar</button>
            </div>
          </header>
          <div class="hs-text-viewer-body">
            <div class="hs-text-viewer-link-wrap" style="display:none">
              <input type="text" class="hs-text-viewer-link" readonly spellcheck="false" />
            </div>
            <p class="hs-text-viewer-state" aria-live="polite"></p>
            <pre class="hs-text-viewer-code"></pre>
          </div>
        </section>
      `;
      document.body.appendChild(modal);
    }
    hsTextPreviewModal = modal;
    if (modal.dataset.hsBound === "1") return modal;
    modal.dataset.hsBound = "1";

    modal.querySelector(".hs-text-viewer-backdrop")?.addEventListener("click", closeTextPreviewModal);
    modal.querySelector('[data-action="close"]')?.addEventListener("click", closeTextPreviewModal);
    modal.querySelector('[data-action="copy-link"]')?.addEventListener("click", async () => {
      const source = String(modal.dataset.hsTextSourceUrl || "").trim();
      if (!source) {
        toast("Link indisponivel nesse preview.", "err", 1900);
        return;
      }
      const ok = await copyTextToClipboard(source);
      toast(ok ? "Link do anexo copiado." : "Nao foi possivel copiar o link.", ok ? "ok" : "err", 2200);
    });
    modal.querySelector('[data-action="copy"]')?.addEventListener("click", async () => {
      const codeEl = modal.querySelector(".hs-text-viewer-code");
      const text = String(codeEl?.textContent || "");
      if (!text.trim()) {
        toast("Nada para copiar no preview.", "err", 1800);
        return;
      }
      const ok = await copyTextToClipboard(text);
      toast(ok ? "Conteudo copiado para a area de transferencia." : "Nao foi possivel copiar automaticamente.", ok ? "ok" : "err", 2200);
    });
    document.addEventListener("keydown", (ev) => {
      if (String(ev.key || "").toLowerCase() !== "escape") return;
      if (modal.classList.contains("open")) closeTextPreviewModal();
    });
    return modal;
  }
  /**
   * Objetivo: Abre modal textual com conteudo ja disponivel.
   *
   * Contexto: usado por anexos locais e payloads remotos carregados por fetch.
   * Parametros:
   * - title: titulo exibido no modal.
   * - content: texto bruto do arquivo.
   * Retorno: void.
   */
  /**
   * Objetivo: Baixa conteudo textual real de anexo, seguindo wrappers HTML quando existir.
   *
   * Contexto: corrige retorno intermediario do endpoint de anexo que encapsula arquivo em iframe.
   * Parametros:
   * - fileUrl: URL inicial do anexo.
   * - depth: nivel interno de recursao.
   * Retorno: Promise<string>.
   */
  async function fetchAttachmentTextPreviewContent(fileUrl, depth = 0) {
    const raw = String(fileUrl || "").trim();
    if (!raw) return "";
    if (depth > 4) throw new Error("Limite de redirecionamento atingido.");
    let absolute = raw;
    try {
      absolute = new URL(raw, location.href).toString();
    } catch {}
    absolute = normalizeAttachmentPreviewUrl(absolute) || absolute;
    const response = await fetch(absolute, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    const headerType = String(response.headers?.get("content-type") || "").toLowerCase();
    const looksLikeHtml = /<(?:!doctype|html|head|body|iframe|frame|meta|script)\b/i.test(text);
    if (/(?:text\/html|application\/xhtml\+xml)/i.test(headerType) || looksLikeHtml) {
      const embeddedUrl = extractEmbeddedAttachmentUrl(text, absolute);
      if (embeddedUrl && embeddedUrl !== absolute) {
        return fetchAttachmentTextPreviewContent(embeddedUrl, depth + 1);
      }
    }
    // Alguns anexos TXT/SQL chegam com bytes nulos (ex.: UTF-16); remove os nulos e preserva o texto.
    if (/\u0000/.test(text)) {
      const compact = text.replace(/\u0000/g, "");
      if (compact.trim()) return compact;
    }
    return text;
  }
  /**
   * Objetivo: Tenta ler conteudo textual de anexo via iframe oculto como fallback.
   *
   * Contexto: cobre cenarios em que fetch direto falha, mas a sessao ainda permite renderizacao do arquivo.
   * Parametros:
   * - fileUrl: URL do anexo.
   * Retorno: Promise<string>.
   */
  function fetchAttachmentTextPreviewContentViaIframe(fileUrl) {
    const raw = String(fileUrl || "").trim();
    if (!raw) return Promise.reject(new Error("URL vazia."));
    return new Promise((resolve, reject) => {
      let absolute = raw;
      try {
        absolute = new URL(raw, location.href).toString();
      } catch {}
      absolute = normalizeAttachmentPreviewUrl(absolute) || absolute;

      const iframe = document.createElement("iframe");
      iframe.setAttribute("aria-hidden", "true");
      iframe.setAttribute("tabindex", "-1");
      iframe.style.position = "fixed";
      iframe.style.left = "-99999px";
      iframe.style.top = "-99999px";
      iframe.style.width = "1px";
      iframe.style.height = "1px";
      iframe.style.opacity = "0";
      iframe.style.pointerEvents = "none";

      let settled = false;
      const finish = (ok, value) => {
        if (settled) return;
        settled = true;
        try {
          iframe.remove();
        } catch {}
        if (ok) resolve(value);
        else reject(value instanceof Error ? value : new Error(String(value || "Falha no iframe.")));
      };

      const timer = window.setTimeout(() => {
        finish(false, new Error("Timeout ao carregar anexo em iframe."));
      }, 12000);
      const safeFinish = (ok, value) => {
        window.clearTimeout(timer);
        finish(ok, value);
      };

      iframe.onerror = () => safeFinish(false, new Error("Falha ao carregar iframe do anexo."));
      iframe.onload = () => {
        (async () => {
          try {
            const doc = iframe.contentDocument || iframe.contentWindow?.document;
            if (!doc) throw new Error("Documento do iframe indisponivel.");
            const htmlPayload = String(doc.documentElement?.outerHTML || "");
            const embeddedUrl = extractEmbeddedAttachmentUrl(htmlPayload, absolute);
            if (embeddedUrl && embeddedUrl !== absolute) {
              const nested = await fetchAttachmentTextPreviewContent(embeddedUrl, 0);
              safeFinish(true, nested);
              return;
            }
            const pre = doc.querySelector("pre");
            const text = String(pre?.textContent || doc.body?.textContent || "");
            if (!text.trim()) throw new Error("Iframe sem texto legivel.");
            safeFinish(true, text);
          } catch (err) {
            safeFinish(false, err);
          }
        })().catch((err) => safeFinish(false, err));
      };

      document.body.appendChild(iframe);
      iframe.src = absolute;
    });
  }
  /**
   * Objetivo: Abre preview textual de anexo remoto (TXT/SQL) com sessao autenticada.
   *
   * Contexto: anexos recebidos no chamado.
   * Parametros:
   * - fileUrl: URL do anexo.
   * - label: nome/titulo opcional.
   * - options.force: quando true, tenta preview interno mesmo sem extensao detectada no href.
   * Retorno: Promise<void>.
   */
  async function openTextAttachmentPreviewFromUrl(fileUrl, label = "", options = {}) {
    const raw = String(fileUrl || "").trim();
    if (!raw) return;
    const forcePreview = !!(options && options.force);
    const textCandidate = isTextOrSqlPreviewCandidate(raw, label, "");
    if (!textCandidate && !forcePreview) {
      window.open(raw, "_blank", "noopener,noreferrer");
      return;
    }
    let absolute = raw;
    try {
      absolute = new URL(raw, location.href).toString();
    } catch {}
    absolute = normalizeAttachmentPreviewUrl(absolute) || absolute;
    armTextPreviewWindowOpenGuard(absolute);
    const modal = ensureTextPreviewModal();
    if (!(modal instanceof HTMLElement)) return;
    const titleEl = modal.querySelector(".hs-text-viewer-title");
    const stateEl = modal.querySelector(".hs-text-viewer-state");
    const codeEl = modal.querySelector(".hs-text-viewer-code");
    if (!(codeEl instanceof HTMLElement)) return;

    if (titleEl instanceof HTMLElement) {
      const txt = String(label || "").trim();
      titleEl.textContent = txt ? `Preview de texto - ${txt}` : "Preview de texto";
    }
    setTextPreviewModalSourceUrl(modal, absolute);
    codeEl.textContent = "";
    if (stateEl instanceof HTMLElement) {
      stateEl.style.display = "block";
      stateEl.textContent = "Abrindo anexo em nova guia para capturar o texto...";
    }
    modal.classList.add("open");

    try {
      const bridgeText = await requestTextPreviewViaBridgeTab(absolute);
      codeEl.textContent = normalizeTextPreviewContent(bridgeText) || "// arquivo vazio";
      if (stateEl instanceof HTMLElement) {
        stateEl.style.display = "none";
        stateEl.textContent = "";
      }
      toast("Preview TXT/SQL carregado via nova guia.", "ok", 2200);
      return;
    } catch {
      try {
        const text = await fetchAttachmentTextPreviewContent(absolute, 0);
        codeEl.textContent = normalizeTextPreviewContent(text) || "// arquivo vazio";
        if (stateEl instanceof HTMLElement) {
          stateEl.style.display = "none";
          stateEl.textContent = "";
        }
        toast("Preview TXT/SQL carregado com fallback interno (fetch).", "ok", 2200);
      } catch {
        if (stateEl instanceof HTMLElement) {
          stateEl.style.display = "block";
          stateEl.textContent = "Tentando fallback final via iframe interno...";
        }
        try {
          const textIframe = await fetchAttachmentTextPreviewContentViaIframe(absolute);
          codeEl.textContent = normalizeTextPreviewContent(textIframe) || "// arquivo vazio";
          if (stateEl instanceof HTMLElement) {
            stateEl.style.display = "none";
            stateEl.textContent = "";
          }
          toast("Preview TXT/SQL carregado com fallback iframe.", "ok", 2200);
        } catch {
          if (stateEl instanceof HTMLElement) {
            stateEl.style.display = "block";
            stateEl.textContent =
              "Nao foi possivel carregar o texto no preview. A nova guia foi aberta para consulta manual e o link esta disponivel para copia.";
          }
          codeEl.textContent = "// Falha ao carregar o conteudo deste anexo no preview interno.";
          toast("Falha no preview TXT/SQL interno.", "err", 3000);
        }
      }
    }
  }
  /**
   * Objetivo: Limita fator de zoom do preview de imagem para uma faixa segura.
   *
   * Contexto: usado pelos atalhos/roda do mouse e pelos botoes do modal.
   * Parametros:
   * - value: zoom solicitado.
   * Retorno: number.
   */
  function clampImagePreviewZoom(value) {
    const num = Number(value);
    if (!Number.isFinite(num)) return 1;
    if (num < 0.25) return 0.25;
    if (num > 8) return 8;
    return num;
  }
  /**
   * Objetivo: Salva ancora de zoom/pan no ponto atual do cursor dentro do corpo do modal.
   *
   * Contexto: reutilizado por wheel, drag e interacoes de zoom por botao/atalho.
   * Parametros:
   * - modal: container do modal.
   * - clientX/clientY: coordenadas em viewport.
   * Retorno: {x:number,y:number}|null.
   */
  function saveImagePreviewAnchor(modal, clientX, clientY) {
    if (!(modal instanceof HTMLElement)) return null;
    const body = modal.querySelector(".hs-image-viewer-body");
    if (!(body instanceof HTMLElement)) return null;
    const rect = body.getBoundingClientRect();
    if (!(rect.width > 0) || !(rect.height > 0)) return null;
    const centerX = rect.left + body.clientWidth / 2;
    const centerY = rect.top + body.clientHeight / 2;
    const rawX = Number(clientX);
    const rawY = Number(clientY);
    const x = Number.isFinite(rawX) ? rawX : centerX;
    const y = Number.isFinite(rawY) ? rawY : centerY;
    const marginX = Math.min(1, Math.max(0, rect.width / 2));
    const marginY = Math.min(1, Math.max(0, rect.height / 2));
    const clampedX = Math.max(rect.left + marginX, Math.min(rect.right - marginX, x));
    const clampedY = Math.max(rect.top + marginY, Math.min(rect.bottom - marginY, y));
    modal.dataset.hsImageAnchorX = String(clampedX);
    modal.dataset.hsImageAnchorY = String(clampedY);
    return { x: clampedX, y: clampedY };
  }
  /**
   * Objetivo: Recupera ancora preferencial para zoom quando nao ha evento de ponteiro.
   *
   * Contexto: utilizado por botoes e atalhos de teclado do modal.
   * Parametros:
   * - modal: container do modal.
   * Retorno: {x:number,y:number}|null.
   */
  function getImagePreviewAnchor(modal) {
    if (!(modal instanceof HTMLElement)) return null;
    const body = modal.querySelector(".hs-image-viewer-body");
    if (!(body instanceof HTMLElement)) return null;
    const rect = body.getBoundingClientRect();
    if (!(rect.width > 0) || !(rect.height > 0)) return null;
    const rawX = Number(modal.dataset.hsImageAnchorX);
    const rawY = Number(modal.dataset.hsImageAnchorY);
    const hasStored =
      Number.isFinite(rawX) &&
      Number.isFinite(rawY) &&
      rawX >= rect.left &&
      rawX <= rect.right &&
      rawY >= rect.top &&
      rawY <= rect.bottom;
    if (hasStored) return { x: rawX, y: rawY };
    return saveImagePreviewAnchor(modal, rect.left + body.clientWidth / 2, rect.top + body.clientHeight / 2);
  }
  /**
   * Objetivo: Atualiza o indicador visual de zoom no cabecalho do modal de imagem.
   *
   * Contexto: chamado apos alterar zoom ou resetar estado do preview.
   * Parametros:
   * - modal: container do modal.
   * - zoomValue: zoom atual (opcional).
   * Retorno: void.
   */
  function refreshImagePreviewZoomLabel(modal, zoomValue = null) {
    if (!(modal instanceof HTMLElement)) return;
    const img = modal.querySelector(".hs-image-viewer-body img");
    const out = modal.querySelector(".hs-image-viewer-zoom");
    const zoomOutBtn = modal.querySelector('[data-action="zoom-out"]');
    const zoomInBtn = modal.querySelector('[data-action="zoom-in"]');
    const zoom =
      zoomValue == null
        ? clampImagePreviewZoom(parseFloat(String(img instanceof HTMLImageElement ? img.dataset.hsZoom || "1" : "1")))
        : clampImagePreviewZoom(zoomValue);
    if (out instanceof HTMLElement) out.textContent = `${Math.round(zoom * 100)}%`;
    if (zoomOutBtn instanceof HTMLButtonElement) zoomOutBtn.disabled = zoom <= 0.251;
    if (zoomInBtn instanceof HTMLButtonElement) zoomInBtn.disabled = zoom >= 7.999;
  }
  /**
   * Objetivo: Aplica zoom ao preview da imagem mantendo ancora visual quando possivel.
   *
   * Contexto: reutilizado por botoes, atalhos de teclado, roda do mouse e duplo clique.
   * Parametros:
   * - modal: container do modal.
   * - zoomValue: zoom final solicitado.
   * - options: ancora de cursor/centralizacao apos ajuste.
   * Retorno: void.
   */
  function applyImagePreviewZoom(modal, zoomValue, options = {}) {
    if (!(modal instanceof HTMLElement)) return;
    const body = modal.querySelector(".hs-image-viewer-body");
    const img = modal.querySelector(".hs-image-viewer-body img");
    if (!(body instanceof HTMLElement) || !(img instanceof HTMLImageElement)) return;
    const baseWidth = parseFloat(String(img.dataset.hsBaseWidth || ""));
    const baseHeight = parseFloat(String(img.dataset.hsBaseHeight || ""));
    if (!Number.isFinite(baseWidth) || baseWidth <= 0 || !Number.isFinite(baseHeight) || baseHeight <= 0) return;
    const nextZoom = clampImagePreviewZoom(zoomValue);
    const prevRect = img.getBoundingClientRect();
    const anchorX = Number(options?.clientX);
    const anchorY = Number(options?.clientY);
    const hasAnchor = Number.isFinite(anchorX) && Number.isFinite(anchorY);
    let ratioX = 0.5;
    let ratioY = 0.5;
    if (hasAnchor && prevRect.width > 0 && prevRect.height > 0) {
      ratioX = Math.max(0, Math.min(1, (anchorX - prevRect.left) / prevRect.width));
      ratioY = Math.max(0, Math.min(1, (anchorY - prevRect.top) / prevRect.height));
    }
    const nextWidth = Math.max(1, Math.round(baseWidth * nextZoom));
    const nextHeight = Math.max(1, Math.round(baseHeight * nextZoom));
    img.style.width = `${nextWidth}px`;
    img.style.height = `${nextHeight}px`;
    img.style.maxWidth = "none";
    img.style.maxHeight = "none";
    img.dataset.hsZoom = String(nextZoom);
    body.classList.toggle("zoomed", nextZoom > 1.001);
    refreshImagePreviewZoomLabel(modal, nextZoom);
    if (options?.skipAdjust === true) return;
    requestAnimationFrame(() => {
      if (!modal.classList.contains("open")) return;
      if (hasAnchor) {
        const nextRect = img.getBoundingClientRect();
        const targetX = nextRect.left + nextRect.width * ratioX;
        const targetY = nextRect.top + nextRect.height * ratioY;
        body.scrollLeft += targetX - anchorX;
        body.scrollTop += targetY - anchorY;
        return;
      }
      if (options?.center === true || nextZoom <= 1.001) {
        body.scrollLeft = Math.max(0, Math.floor((body.scrollWidth - body.clientWidth) / 2));
        body.scrollTop = Math.max(0, Math.floor((body.scrollHeight - body.clientHeight) / 2));
      }
    });
  }
  /**
   * Objetivo: Faz ajuste incremental de zoom no preview de imagem.
   *
   * Contexto: utilitario para eventos de UI (botoes/atalhos/wheel).
   * Parametros:
   * - modal: container do modal.
   * - factor: multiplicador (>1 amplia, <1 reduz).
   * - options: ancora opcional para preservar foco.
   * Retorno: void.
   */
  function zoomImagePreviewByFactor(modal, factor, options = {}) {
    if (!(modal instanceof HTMLElement)) return;
    const img = modal.querySelector(".hs-image-viewer-body img");
    if (!(img instanceof HTMLImageElement)) return;
    const current = clampImagePreviewZoom(parseFloat(String(img.dataset.hsZoom || "1")));
    const safeFactor = Number(factor);
    if (!Number.isFinite(safeFactor) || safeFactor <= 0) return;
    applyImagePreviewZoom(modal, current * safeFactor, options);
  }
  /**
   * Objetivo: Fecha modal de preview de imagem.
   *
   * Contexto: usado nos previews de anexos locais/remotos.
   * Parametros: nenhum.
   * Retorno: void.
   */
  function closeImagePreviewModal() {
    if (!hsImagePreviewModal) hsImagePreviewModal = document.getElementById("hs-image-viewer");
    if (!(hsImagePreviewModal instanceof HTMLElement)) return;
    const img = hsImagePreviewModal.querySelector(".hs-image-viewer-body img");
    const state = hsImagePreviewModal.querySelector(".hs-image-viewer-state");
    const card = hsImagePreviewModal.querySelector(".hs-image-viewer-card");
    const body = hsImagePreviewModal.querySelector(".hs-image-viewer-body");
    if (img instanceof HTMLImageElement) {
      delete img.dataset.hsPreviewRequest;
      delete img.dataset.hsFallbackSrc;
      delete img.dataset.hsTriedFallback;
      delete img.dataset.hsBaseWidth;
      delete img.dataset.hsBaseHeight;
      delete img.dataset.hsZoom;
      img.removeAttribute("src");
      img.onerror = null;
      img.onload = null;
      img.style.display = "none";
      img.style.removeProperty("max-width");
      img.style.removeProperty("max-height");
      img.style.removeProperty("width");
      img.style.removeProperty("height");
    }
    if (state instanceof HTMLElement) {
      state.style.display = "none";
      state.textContent = "";
    }
    if (card instanceof HTMLElement) card.style.removeProperty("--hs-image-viewer-card-width");
    if (body instanceof HTMLElement) {
      body.style.removeProperty("--hs-image-viewer-body-max-height");
      body.classList.remove("zoomed", "dragging");
      body.scrollLeft = 0;
      body.scrollTop = 0;
    }
    delete hsImagePreviewModal.dataset.hsImageAnchorX;
    delete hsImagePreviewModal.dataset.hsImageAnchorY;
    if (hsImagePreviewDragState && hsImagePreviewDragState.modal === hsImagePreviewModal) hsImagePreviewDragState = null;
    refreshImagePreviewZoomLabel(hsImagePreviewModal, 1);
    releaseImagePreviewObjectUrl();
    hsImagePreviewModal.classList.remove("open");
  }
  /**
   * Objetivo: Ajusta dimensoes do modal de imagem para refletir o tamanho real da imagem.
   *
   * Contexto: executado apos carregar imagem no preview.
   * Parametros:
   * - modal: container do modal.
   * - img: elemento de imagem carregado.
   * - preserveZoom: indica se deve tentar preservar o zoom atual.
   * Retorno: void.
   */
  function fitImagePreviewModalToImage(modal, img, preserveZoom = false) {
    if (!(modal instanceof HTMLElement) || !(img instanceof HTMLImageElement)) return;
    if (!img.naturalWidth || !img.naturalHeight) return;
    const card = modal.querySelector(".hs-image-viewer-card");
    const body = modal.querySelector(".hs-image-viewer-body");
    const head = modal.querySelector(".hs-image-viewer-head");
    if (!(card instanceof HTMLElement) || !(body instanceof HTMLElement)) return;
    const bodyStyle = window.getComputedStyle(body);
    const padX = (parseFloat(bodyStyle.paddingLeft) || 0) + (parseFloat(bodyStyle.paddingRight) || 0);
    const padY = (parseFloat(bodyStyle.paddingTop) || 0) + (parseFloat(bodyStyle.paddingBottom) || 0);
    const headHeight = head instanceof HTMLElement ? head.offsetHeight : 42;
    const maxCardWidth = Math.max(240, Math.floor(window.innerWidth * 0.96));
    const maxBodyHeight = Math.max(120, Math.floor(window.innerHeight * 0.92) - headHeight - 2);
    const maxImageWidth = Math.max(120, maxCardWidth - padX - 2);
    const maxImageHeight = Math.max(80, maxBodyHeight - padY);
    const scale = Math.min(1, maxImageWidth / img.naturalWidth, maxImageHeight / img.naturalHeight);
    const renderedWidth = Math.max(1, Math.floor(img.naturalWidth * scale));
    const renderedHeight = Math.max(1, Math.floor(img.naturalHeight * scale));
    const nextCardWidth = Math.max(240, Math.min(maxCardWidth, renderedWidth + padX + 2));
    const nextBodyHeight = Math.max(120, Math.min(maxBodyHeight, renderedHeight + padY));
    card.style.setProperty("--hs-image-viewer-card-width", `${Math.round(nextCardWidth)}px`);
    body.style.setProperty("--hs-image-viewer-body-max-height", `${Math.round(nextBodyHeight)}px`);
    img.dataset.hsBaseWidth = String(renderedWidth);
    img.dataset.hsBaseHeight = String(renderedHeight);
    if (!preserveZoom) img.dataset.hsZoom = "1";
    const currentZoom = clampImagePreviewZoom(parseFloat(String(img.dataset.hsZoom || "1")));
    if (preserveZoom) {
      const bodyRect = body.getBoundingClientRect();
      const centerX = bodyRect.left + body.clientWidth / 2;
      const centerY = bodyRect.top + body.clientHeight / 2;
      applyImagePreviewZoom(modal, currentZoom, { clientX: centerX, clientY: centerY });
      return;
    }
    applyImagePreviewZoom(modal, currentZoom, { center: true });
  }
  /**
   * Objetivo: Garante modal para visualizar imagem ampliada.
   *
   * Contexto: compartilhado por anexos selecionados e anexos ja carregados.
   * Parametros: nenhum.
   * Retorno: HTMLElement|null.
   */
  function ensureImagePreviewModal() {
    if (hsImagePreviewModal && hsImagePreviewModal.isConnected) return hsImagePreviewModal;
    let modal = document.getElementById("hs-image-viewer");
    if (!(modal instanceof HTMLElement)) {
      modal = document.createElement("div");
      modal.id = "hs-image-viewer";
      modal.className = "hs-image-viewer";
      modal.innerHTML = `
        <div class="hs-image-viewer-backdrop"></div>
        <section class="hs-image-viewer-card" role="dialog" aria-modal="true" aria-label="Preview da imagem do anexo">
          <header class="hs-image-viewer-head">
            <span class="hs-image-viewer-title">Preview da imagem</span>
            <div class="hs-image-viewer-actions">
              <span class="hs-image-viewer-zoom" aria-live="polite">100%</span>
              <button type="button" data-action="zoom-out" title="Reduzir zoom (-)">-</button>
              <button type="button" data-action="zoom-reset" title="Ajustar para 100% (0)">100%</button>
              <button type="button" data-action="zoom-in" title="Aumentar zoom (+)">+</button>
              <button type="button" data-action="close">Fechar</button>
            </div>
          </header>
          <div class="hs-image-viewer-body">
            <p class="hs-image-viewer-state" aria-live="polite"></p>
            <img alt="Preview do anexo" draggable="false" />
          </div>
        </section>
      `;
      document.body.appendChild(modal);
    }
    hsImagePreviewModal = modal;
    if (modal.dataset.hsBound === "1") return modal;
    modal.dataset.hsBound = "1";
    const getBodyAnchor = () => getImagePreviewAnchor(modal);
    const endImagePreviewDrag = () => {
      if (!hsImagePreviewDragState || hsImagePreviewDragState.modal !== modal) return;
      const body = modal.querySelector(".hs-image-viewer-body");
      if (body instanceof HTMLElement) body.classList.remove("dragging");
      hsImagePreviewDragState = null;
    };
    modal.querySelector(".hs-image-viewer-backdrop")?.addEventListener("click", closeImagePreviewModal);
    modal.querySelector('[data-action="close"]')?.addEventListener("click", closeImagePreviewModal);
    modal.querySelector('[data-action="zoom-in"]')?.addEventListener("click", () => {
      if (!modal.classList.contains("open")) return;
      const anchor = getBodyAnchor();
      if (!anchor) return;
      zoomImagePreviewByFactor(modal, 1.2, { clientX: anchor.x, clientY: anchor.y });
    });
    modal.querySelector('[data-action="zoom-out"]')?.addEventListener("click", () => {
      if (!modal.classList.contains("open")) return;
      const anchor = getBodyAnchor();
      if (!anchor) return;
      zoomImagePreviewByFactor(modal, 1 / 1.2, { clientX: anchor.x, clientY: anchor.y });
    });
    modal.querySelector('[data-action="zoom-reset"]')?.addEventListener("click", () => {
      if (!modal.classList.contains("open")) return;
      applyImagePreviewZoom(modal, 1, { center: true });
    });
    const bodyEl = modal.querySelector(".hs-image-viewer-body");
    if (bodyEl instanceof HTMLElement) {
      bodyEl.addEventListener(
        "wheel",
        (ev) => {
          if (!modal.classList.contains("open")) return;
          const img = modal.querySelector(".hs-image-viewer-body img");
          if (!(img instanceof HTMLImageElement) || img.style.display === "none") return;
          if (ev.shiftKey) return;
          const anchor = saveImagePreviewAnchor(modal, ev.clientX, ev.clientY);
          if (!anchor) return;
          ev.preventDefault();
          const factor = ev.deltaY < 0 ? 1.16 : 1 / 1.16;
          zoomImagePreviewByFactor(modal, factor, { clientX: anchor.x, clientY: anchor.y });
        },
        { passive: false }
      );
      bodyEl.addEventListener("mouseenter", (ev) => {
        if (!modal.classList.contains("open")) return;
        saveImagePreviewAnchor(modal, ev.clientX, ev.clientY);
      });
      bodyEl.addEventListener("mousemove", (ev) => {
        if (!modal.classList.contains("open")) return;
        saveImagePreviewAnchor(modal, ev.clientX, ev.clientY);
      });
      bodyEl.addEventListener("dblclick", (ev) => {
        if (!modal.classList.contains("open")) return;
        const img = modal.querySelector(".hs-image-viewer-body img");
        if (!(img instanceof HTMLImageElement) || img.style.display === "none") return;
        const zoom = clampImagePreviewZoom(parseFloat(String(img.dataset.hsZoom || "1")));
        const anchor = saveImagePreviewAnchor(modal, ev.clientX, ev.clientY);
        if (zoom > 1.01) {
          applyImagePreviewZoom(modal, 1, { center: true });
          return;
        }
        if (!anchor) return;
        zoomImagePreviewByFactor(modal, 2, { clientX: anchor.x, clientY: anchor.y });
      });
      bodyEl.addEventListener("mousedown", (ev) => {
        if (!modal.classList.contains("open")) return;
        if (ev.button !== 0) return;
        const img = modal.querySelector(".hs-image-viewer-body img");
        if (!(img instanceof HTMLImageElement) || img.style.display === "none") return;
        if (!(ev.target instanceof Element)) return;
        const zoom = clampImagePreviewZoom(parseFloat(String(img.dataset.hsZoom || "1")));
        if (zoom <= 1.01) return;
        ev.preventDefault();
        saveImagePreviewAnchor(modal, ev.clientX, ev.clientY);
        bodyEl.classList.add("dragging");
        hsImagePreviewDragState = {
          modal,
          startX: ev.clientX,
          startY: ev.clientY,
          scrollLeft: bodyEl.scrollLeft,
          scrollTop: bodyEl.scrollTop,
        };
      });
      document.addEventListener(
        "mousemove",
        (ev) => {
          if (!hsImagePreviewDragState || hsImagePreviewDragState.modal !== modal) return;
          if (!modal.classList.contains("open")) {
            endImagePreviewDrag();
            return;
          }
          const dragBody = modal.querySelector(".hs-image-viewer-body");
          if (!(dragBody instanceof HTMLElement)) {
            endImagePreviewDrag();
            return;
          }
          ev.preventDefault();
          dragBody.scrollLeft = hsImagePreviewDragState.scrollLeft - (ev.clientX - hsImagePreviewDragState.startX);
          dragBody.scrollTop = hsImagePreviewDragState.scrollTop - (ev.clientY - hsImagePreviewDragState.startY);
        },
        true
      );
      document.addEventListener("mouseup", endImagePreviewDrag, true);
      window.addEventListener("blur", endImagePreviewDrag);
    }
    if (document.documentElement.dataset.hsImagePreviewKeysBound !== "1") {
      document.documentElement.dataset.hsImagePreviewKeysBound = "1";
      document.addEventListener(
        "keydown",
        (ev) => {
          if (!modal.classList.contains("open")) return;
          const active = document.activeElement;
          if (
            active instanceof HTMLInputElement ||
            active instanceof HTMLTextAreaElement ||
            active instanceof HTMLSelectElement
          ) {
            return;
          }
          const key = String(ev.key || "").toLowerCase();
          if (key === "+" || key === "=" || key === "add") {
            const anchor = getBodyAnchor();
            if (!anchor) return;
            ev.preventDefault();
            zoomImagePreviewByFactor(modal, 1.2, { clientX: anchor.x, clientY: anchor.y });
            return;
          }
          if (key === "-" || key === "_" || key === "subtract") {
            const anchor = getBodyAnchor();
            if (!anchor) return;
            ev.preventDefault();
            zoomImagePreviewByFactor(modal, 1 / 1.2, { clientX: anchor.x, clientY: anchor.y });
            return;
          }
          if (key === "0") {
            ev.preventDefault();
            applyImagePreviewZoom(modal, 1, { center: true });
          }
        },
        true
      );
    }
    window.addEventListener("resize", () => {
      if (!modal.classList.contains("open")) return;
      const img = modal.querySelector(".hs-image-viewer-body img");
      if (img instanceof HTMLImageElement && img.naturalWidth > 0 && img.style.display !== "none") {
        fitImagePreviewModalToImage(modal, img, true);
      }
    });
    refreshImagePreviewZoomLabel(modal, 1);
    return modal;
  }
  /**
   * Objetivo: Abre modal de preview para URL de imagem.
   *
   * Contexto: acionado por clique nas miniaturas locais dos anexos.
   * Parametros:
   * - imageUrl: URL da imagem.
   * - label: titulo opcional.
   * Retorno: void.
   */
  function openImagePreviewModal(imageUrl, label = "", fileType = "") {
    const src = String(imageUrl || "").trim();
    if (!src) return;
    if (!isAttachmentModalPreviewAllowed(src, label, fileType)) {
      window.open(src, "_blank", "noopener,noreferrer");
      return;
    }
    const modal = ensureImagePreviewModal();
    if (!(modal instanceof HTMLElement)) return;
    const titleEl = modal.querySelector(".hs-image-viewer-title");
    const stateEl = modal.querySelector(".hs-image-viewer-state");
    const img = modal.querySelector(".hs-image-viewer-body img");
    const card = modal.querySelector(".hs-image-viewer-card");
    const body = modal.querySelector(".hs-image-viewer-body");
    if (!(img instanceof HTMLImageElement)) return;
    delete modal.dataset.hsImageAnchorX;
    delete modal.dataset.hsImageAnchorY;
    if (titleEl instanceof HTMLElement) {
      const title = String(label || "").trim();
      titleEl.textContent = title ? `Preview da imagem - ${title}` : "Preview da imagem";
    }
    img.alt = String(label || "Preview do anexo");
    img.draggable = false;

    releaseImagePreviewObjectUrl();
    delete img.dataset.hsPreviewRequest;
    delete img.dataset.hsFallbackSrc;
    delete img.dataset.hsTriedFallback;
    delete img.dataset.hsBaseWidth;
    delete img.dataset.hsBaseHeight;
    delete img.dataset.hsZoom;
    img.removeAttribute("src");
    img.style.display = "none";
    img.style.removeProperty("max-width");
    img.style.removeProperty("max-height");
    img.style.removeProperty("width");
    img.style.removeProperty("height");
    if (card instanceof HTMLElement) card.style.removeProperty("--hs-image-viewer-card-width");
    if (body instanceof HTMLElement) {
      body.style.removeProperty("--hs-image-viewer-body-max-height");
      body.classList.remove("zoomed", "dragging");
      body.scrollLeft = 0;
      body.scrollTop = 0;
    }
    refreshImagePreviewZoomLabel(modal, 1);
    if (stateEl instanceof HTMLElement) {
      stateEl.style.display = "block";
      stateEl.textContent = "Carregando imagem...";
    }
    modal.classList.add("open");
    saveImagePreviewAnchor(modal);
    const previewRequestId = String(Date.now()) + String(Math.random()).slice(2);
    img.dataset.hsPreviewRequest = previewRequestId;
    (async () => {
      const resolved = await resolvePreviewImageSource(src, String(label || ""), String(fileType || ""), 0);
      if (img.dataset.hsPreviewRequest !== previewRequestId) return;
      const previewSrc = String(resolved?.previewSrc || "").trim();
      const fallbackSrc = String(resolved?.fallbackSrc || "").trim() || src;
      if (typeof resolved?.revoke === "function") hsImagePreviewObjectUrlRevoke = resolved.revoke;
      img.dataset.hsFallbackSrc = fallbackSrc;
      img.dataset.hsTriedFallback = "0";
      img.style.display = "";
      img.onload = () => {
        if (img.dataset.hsPreviewRequest !== previewRequestId) return;
        fitImagePreviewModalToImage(modal, img, false);
        if (stateEl instanceof HTMLElement) {
          stateEl.style.display = "none";
          stateEl.textContent = "";
        }
      };
      img.onerror = () => {
        if (img.dataset.hsPreviewRequest !== previewRequestId) return;
        const hasTriedFallback = img.dataset.hsTriedFallback === "1";
        const fallback = String(img.dataset.hsFallbackSrc || "").trim();
        if (!hasTriedFallback && fallback && img.src !== fallback) {
          img.dataset.hsTriedFallback = "1";
          img.src = fallback;
          return;
        }
        if (stateEl instanceof HTMLElement) {
          stateEl.style.display = "block";
          stateEl.textContent = "Nao foi possivel carregar esta imagem no modal.";
        }
        toast("Imagem indisponivel para preview no momento.", "err", 2800);
      };
      img.src = previewSrc || fallbackSrc;
    })().catch(() => {
      if (img.dataset.hsPreviewRequest !== previewRequestId) return;
      if (stateEl instanceof HTMLElement) {
        stateEl.style.display = "block";
        stateEl.textContent = "Nao foi possivel carregar esta imagem no modal.";
      }
      toast("Falha no preview interno. Abrindo em nova guia.", "err", 2600);
      window.open(src, "_blank", "noopener,noreferrer");
    });
  }
  /**
   * Objetivo: Mantem o bloco "Anexo: Novo" original e adiciona apenas preview de imagem selecionada.
   *
   * Contexto: Tela "Visualizar requisicao" no bloco de novo acompanhamento.
   * Parametros: nenhum.
   * Retorno: void.
   * Efeitos colaterais: cria miniaturas clicaveis somente para arquivos de imagem.
   */
  function ensureSingleImageAttachments() {
    if (!isRequestVisualizarPage()) return;
    const root = document.getElementById("interno") || document.body;
    if (!(root instanceof HTMLElement)) return;
    const toAbsoluteUrl = (value) => {
      const raw = String(value || "").trim();
      if (!raw) return "";
      try {
        return new URL(raw, location.href).toString();
      } catch {
        return raw;
      }
    };
    const imageNameRx = /\.(avif|bmp|gif|heic|heif|jpe?g|png|svg|tiff?|webp)$/i;
    const isImageLike = (file) => {
      if (!(file instanceof File)) return false;
      const mime = String(file.type || "").trim();
      if (/^image\//i.test(mime)) return true;
      return imageNameRx.test(String(file.name || ""));
    };
    const readFileAsDataUrl = (file) =>
      new Promise((resolve) => {
        if (!(file instanceof Blob)) {
          resolve("");
          return;
        }
        let done = false;
        const finish = (value) => {
          if (done) return;
          done = true;
          resolve(typeof value === "string" ? value : "");
        };
        try {
          const reader = new FileReader();
          reader.onload = () => finish(reader.result);
          reader.onerror = () => finish("");
          reader.onabort = () => finish("");
          reader.readAsDataURL(file);
        } catch {
          finish("");
        }
      });
    const openAttachmentThumb = (file, imageUrl) => {
      const resolvedUrl = toAbsoluteUrl(imageUrl);
      if (!resolvedUrl || /^javascript:/i.test(resolvedUrl)) return;
      const fileName = String(file?.name || "").trim();
      const fileType = String(file?.type || "").trim();
      if (isAttachmentModalPreviewAllowed(resolvedUrl, fileName, fileType)) {
        openImagePreviewModal(resolvedUrl, fileName, fileType);
        return;
      }
      window.open(resolvedUrl, "_blank", "noopener,noreferrer");
    };
    const isAttachmentInput = (input) => {
      if (!(input instanceof HTMLInputElement)) return false;
      if ((input.type || "").toLowerCase() !== "file") return false;
      if (input.closest("#Novo_Acompanhamento, #acompanhamento_form")) return true;
      const row = input.closest("tr,td,div,label");
      const rowText = norm(row?.textContent || "");
      return /anex/.test(rowText);
    };
    const ensureInputPreviewContainer = (input) => {
      if (!(input instanceof HTMLInputElement)) return null;
      if (!input.dataset.hsAttachPreviewId) {
        input.dataset.hsAttachPreviewId = `hs-prev-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      }
      const previewId = String(input.dataset.hsAttachPreviewId || "").trim();
      if (!previewId) return null;
      let preview =
        input.parentElement?.querySelector(`.hs-attach-preview[data-hs-attach-for="${previewId}"]`) || null;
      if (!(preview instanceof HTMLElement)) {
        preview = document.createElement("div");
        preview.className = "hs-attach-preview";
        preview.setAttribute("data-hs-attach-for", previewId);
        input.insertAdjacentElement("afterend", preview);
      }
      return preview;
    };
    const bindInputImagePreview = (input) => {
      if (!(input instanceof HTMLInputElement)) return;
      if ((input.type || "").toLowerCase() !== "file") return;
      if (input.dataset.hsAttachImageBound === "1") return;
      const preview = ensureInputPreviewContainer(input);
      if (!(preview instanceof HTMLElement)) return;
      input.dataset.hsAttachImageBound = "1";
      let renderSeq = 0;
      const renderPreview = async () => {
        const seq = ++renderSeq;
        preview.innerHTML = "";
        const files = Array.from(input.files || []).filter((file) => isImageLike(file));
        if (!files.length) return;
        for (const file of files) {
          const src = await readFileAsDataUrl(file);
          if (seq !== renderSeq) return;
          if (!src) continue;
          const fig = document.createElement("figure");
          fig.className = "hs-attach-thumb";
          fig.tabIndex = 0;
          fig.setAttribute("role", "button");
          fig.setAttribute("aria-label", `Abrir preview de ${String(file.name || "imagem")}`);
          fig.title = "Clique para ampliar imagem";
          const img = document.createElement("img");
          img.alt = String(file.name || "imagem");
          img.loading = "lazy";
          img.decoding = "async";
          img.src = src;
          fig.appendChild(img);
          const caption = document.createElement("figcaption");
          caption.textContent = String(file.name || "imagem");
          fig.appendChild(caption);
          const openThumb = (ev) => {
            if (ev) {
              ev.preventDefault();
              ev.stopPropagation();
            }
            openAttachmentThumb(file, src);
          };
          fig.addEventListener("click", (ev) => {
            if ("button" in ev && ev.button !== 0) return;
            if (ev.ctrlKey || ev.metaKey || ev.shiftKey || ev.altKey) return;
            openThumb(ev);
          });
          fig.addEventListener("keydown", (ev) => {
            const key = String(ev.key || "").toLowerCase();
            if (key !== "enter" && key !== " ") return;
            openThumb(ev);
          });
          preview.appendChild(fig);
        }
      };
      input.addEventListener("change", renderPreview);
      renderPreview();
    };
    const bindAttachmentInputs = () => {
      const fileInputs = Array.from(
        root.querySelectorAll(
          "#Novo_Acompanhamento input[type='file'], #acompanhamento_form input[type='file'], input[type='file']"
        )
      );
      fileInputs.forEach((input) => {
        if (!isAttachmentInput(input)) return;
        bindInputImagePreview(input);
      });
    };

    bindAttachmentInputs();

    if (root.dataset.hsAttachPreviewClickBind !== "1") {
      root.dataset.hsAttachPreviewClickBind = "1";
      root.addEventListener(
        "click",
        (ev) => {
          const target = ev.target instanceof Element ? ev.target : null;
          if (!target) return;
          const trigger = target.closest("a,button,input[type='button'],input[type='submit'],img");
          if (!trigger) return;
          const txt = norm(
            [
              trigger.textContent || "",
              trigger.getAttribute("value") || "",
              trigger.getAttribute("title") || "",
              trigger.getAttribute("alt") || "",
            ].join(" ")
          );
          if (!/(^|\s)(novo|adicionar)(\s|$)/i.test(txt)) return;
          const ctx = trigger.closest("tr,td,div,table,form");
          const ctxText = norm(ctx?.textContent || "");
          if (!/anex/.test(ctxText) && !trigger.closest("#Novo_Acompanhamento, #acompanhamento_form")) return;
          setTimeout(bindAttachmentInputs, 80);
          setTimeout(bindAttachmentInputs, 260);
        },
        true
      );
    }

    const textAttachExtRx = /\.(?:txt|sql|log|csv|json|xml|md|ini)\b/i;
    const extractTextAttachmentName = (value) => {
      const raw = String(value || "").replace(/\u00a0/g, " ").trim();
      if (!raw) return "";
      const directMatch = raw.match(/(^|[\\/])([^\\/:*?"<>|\r\n]+?\.(?:txt|sql|log|csv|json|xml|md|ini))$/i);
      if (directMatch && directMatch[2]) return String(directMatch[2]).trim();
      const genericMatch = raw.match(
        /(?:^|[\s"'([{;,])([^\\/:*?"<>|\r\n]+?\.(?:txt|sql|log|csv|json|xml|md|ini))(?=$|[\s"')\]}.,;:!?])/i
      );
      if (genericMatch && genericMatch[1]) return String(genericMatch[1]).trim();
      return "";
    };
    const resolveAttachmentLabelFromAnchor = (anchor, hrefAbs) => {
      if (!(anchor instanceof HTMLAnchorElement)) return "";
      const rawCandidates = [
        anchor.getAttribute("download") || "",
        anchor.getAttribute("title") || "",
        anchor.getAttribute("aria-label") || "",
        anchor.textContent || "",
        anchor.parentElement?.textContent || "",
        anchor.closest("td,th,tr,li,div,p,span")?.textContent || "",
      ];
      try {
        const url = new URL(String(hrefAbs || ""), location.href);
        const queryNames = ["name", "filename", "file", "arquivo", "anexo", "nome", "titulo"];
        for (const key of queryNames) {
          rawCandidates.push(String(url.searchParams.get(key) || ""));
        }
        const pathName = decodeURIComponent(String(url.pathname || "").split("/").pop() || "");
        rawCandidates.push(pathName);
      } catch {}
      let fallback = "";
      for (const candidate of rawCandidates) {
        const clean = String(candidate || "").replace(/\s+/g, " ").trim();
        if (!clean) continue;
        if (!fallback) fallback = clean;
        const fileName = extractTextAttachmentName(clean);
        if (fileName) return fileName;
      }
      return fallback;
    };
    const seemsTextAttachmentByContext = (anchor) => {
      if (!(anchor instanceof HTMLAnchorElement)) return false;
      const contextText = String(anchor.closest("tr,td,li,div,p")?.textContent || "");
      return textAttachExtRx.test(contextText);
    };

    if (root.dataset.hsAttachLinkPreviewBind === "1") return;
    root.dataset.hsAttachLinkPreviewBind = "1";
    root.addEventListener(
      "click",
      (ev) => {
        const target = ev.target instanceof Element ? ev.target : null;
        if (!target) return;
        const anchor = target.closest("a[href]");
        if (!(anchor instanceof HTMLAnchorElement)) return;
        const hrefRaw = String(anchor.href || anchor.getAttribute("href") || "").trim();
        const hrefLooksLikeAnexo =
          /(?:^|\/)anexo(?:\.php)?(?:[?#]|$)/i.test(hrefRaw) || /[?&](?:anexo|arquivo|file|id_anexo)=/i.test(hrefRaw);
        const inAttachmentContext = (() => {
          if (anchor.closest("#Novo_Acompanhamento, #acompanhamento_form")) return true;
          if (anchor.closest("[id*='anex'], [class*='anex'], [name*='anex']")) return true;
          const tr = anchor.closest("tr");
          if (tr && /anex/.test(norm(tr.textContent || ""))) return true;
          if (hrefLooksLikeAnexo) return true;
          return false;
        })();
        if (!inAttachmentContext) return;
        const isPlainLeftClick =
          !ev.defaultPrevented &&
          (("button" in ev && ev.button === 0) || !("button" in ev)) &&
          !ev.ctrlKey &&
          !ev.metaKey &&
          !ev.shiftKey &&
          !ev.altKey;
        if (!isPlainLeftClick) return;
        const hrefAbs = toAbsoluteUrl(hrefRaw);
        if (!hrefAbs || /^javascript:/i.test(hrefAbs)) return;
        const label = resolveAttachmentLabelFromAnchor(anchor, hrefAbs);
        const allowImageModal = isAttachmentModalPreviewAllowed(hrefAbs, label, "");
        const forceTextPreview =
          hrefLooksLikeAnexo &&
          !allowImageModal &&
          (isTextOrSqlPreviewCandidate(hrefAbs, label, "") || seemsTextAttachmentByContext(anchor));
        const allowTextModal = isAttachmentTextModalPreviewAllowed(hrefAbs, label, "") || forceTextPreview;
        if (allowImageModal) {
          ev.preventDefault();
          ev.stopPropagation();
          openImagePreviewModal(hrefAbs, label, "");
          return;
        }
        if (allowTextModal) {
          ev.preventDefault();
          ev.stopPropagation();
          openTextAttachmentPreviewFromUrl(hrefAbs, label || "anexo.txt", { force: true });
        }
      },
      true
    );
  }
  /**
   * Objetivo: Converte data/hora pt-BR em Date com validaÃ§Ã£o.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros:
   * - value: entrada usada por esta rotina.
   * Retorno: valor calculado.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function parsePtBrDateTime(value) {
    const txt = String(value || "").trim().replace(/\s+/g, " ");
    if (!txt) return null;
    const m = txt.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
    if (!m) return null;

    const day = parseInt(m[1], 10);
    const month = parseInt(m[2], 10);
    let year = parseInt(m[3], 10);
    const hour = parseInt(m[4] || "0", 10);
    const minute = parseInt(m[5] || "0", 10);
    const second = parseInt(m[6] || "0", 10);

    if (year < 100) year += 2000;
    if (month < 1 || month > 12) return null;
    if (day < 1 || day > 31) return null;
    if (hour < 0 || hour > 23) return null;
    if (minute < 0 || minute > 59) return null;
    if (second < 0 || second > 59) return null;

    const d = new Date(year, month - 1, day, hour, minute, second, 0);
    if (
      d.getFullYear() !== year ||
      d.getMonth() !== month - 1 ||
      d.getDate() !== day ||
      d.getHours() !== hour ||
      d.getMinutes() !== minute ||
      d.getSeconds() !== second
    ) {
      return null;
    }
    return d;
  }
  /**
   * Objetivo: Valida se jÃ¡ transcorreram N dias desde uma data.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros:
   * - date: entrada usada por esta rotina.
   * - days: entrada usada por esta rotina.
   * Retorno: boolean.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function hasElapsedDays(date, days) {
    if (!(date instanceof Date)) return false;
    const ms = date.getTime();
    if (!Number.isFinite(ms)) return false;
    return Date.now() - ms >= days * 24 * 60 * 60 * 1000;
  }
  /**
   * Objetivo: ObtÃ©m situaÃ§Ã£o atual da requisiÃ§Ã£o em formato normalizado.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: valor calculado.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function getRequestSituacaoAtualNorm() {
    if (!isRequestVisualizarPage()) return "";
    const rows = Array.from(document.querySelectorAll("#interno table:not(.sortable) tr"));
    for (const tr of rows) {
      const cells = Array.from(tr.cells || []);
      if (cells.length < 2) continue;
      const label = norm(cells[0].textContent || "");
      if (!/^situac/.test(label)) continue;
      return norm(cells[1].textContent || "");
    }
    return "";
  }
  /**
   * Objetivo: LÃª valor de campo na tabela de detalhes por rÃ³tulo.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros:
   * - labelRegex: entrada usada por esta rotina.
   * Retorno: valor calculado.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function getRequestFieldValueByLabel(labelRegex) {
    if (!isRequestVisualizarPage()) return "";
    const rows = Array.from(document.querySelectorAll("#interno table:not(.sortable) tr"));
    for (const tr of rows) {
      const cells = Array.from(tr.querySelectorAll("th,td"));
      if (cells.length < 2) continue;
      const labelNorm = norm(cells[0].textContent || "");
      if (!labelRegex.test(labelNorm)) continue;
      const value = cells
        .slice(1)
        .map((c) => String(c.textContent || "").replace(/\s+/g, " ").trim())
        .filter(Boolean)
        .join(" ")
        .trim();
      if (value) return value;
    }
    return "";
  }
  /**
   * Objetivo: Normaliza nomes removendo ruÃ­dos e delimitadores.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros:
   * - value: entrada usada por esta rotina.
   * - splitOnSlash: entrada usada por esta rotina.
   * Retorno: valor calculado.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function normalizePersonName(value, splitOnSlash = false) {
    let out = String(value || "").replace(/\s+/g, " ").trim();
    if (!out) return "";
    if (splitOnSlash) out = out.split("/")[0].trim();
    out = out.replace(/^[\s,;:.-]+|[\s,;:.-]+$/g, "").trim();
    return out;
  }
  /**
   * Objetivo: Formata nome para apresentaÃ§Ã£o amigÃ¡vel.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros:
   * - value: entrada usada por esta rotina.
   * - splitOnSlash: entrada usada por esta rotina.
   * Retorno: valor calculado.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function formatPersonDisplayName(value, splitOnSlash = false) {
    const normalized = normalizePersonName(value, splitOnSlash);
    if (!normalized) return "";

    return normalized
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)
      .map((part, idx) => {
        if (idx > 0 && /^(da|de|do|das|dos|e)$/.test(part)) return part;
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join(" ");
  }
  /**
   * Objetivo: Gera saudaÃ§Ã£o por horÃ¡rio comercial.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: valor calculado.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function getGreetingByHour() {
    const hour = new Date().getHours();
    return hour < 12 ? "Bom dia" : "Boa tarde";
  }
  /**
   * Objetivo: Extrai primeiro nome Ãºtil do solicitante para saudaÃ§Ã£o.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros:
   * - value: entrada usada por esta rotina.
   * Retorno: valor calculado.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function getSolicitanteFirstNameForGreeting(value) {
    const raw = normalizePersonName(value, true);
    if (!raw) return "";
    if (/@/.test(raw)) return "";

    const formatted = formatPersonDisplayName(raw, false);
    const tokens = formatted.split(/\s+/).filter(Boolean);
    if (!tokens.length) return "";

    const generic = new Set([
      "ti",
      "suporte",
      "nsl",
      "helpdesk",
      "time",
      "equipe",
      "financeiro",
      "fiscal",
      "comercial",
      "compras",
      "rh",
      "sac",
      "cliente",
    ]);

    for (const token of tokens) {
      const n = norm(token);
      if (!n || n.length < 2) continue;
      if (generic.has(n)) continue;
      if (/\d/.test(n)) continue;
      if (token === token.toUpperCase() && token.length <= 3) continue;
      return token;
    }

    return "";
  }
  /**
   * Objetivo: Sanitiza texto da IA removendo saudaÃ§Ã£o/assinatura redundantes.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros:
   * - value: entrada usada por esta rotina.
   * Retorno: valor utilitario.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function sanitizeGptBodyText(value) {
    let out = String(value || "").replace(/\r\n?/g, "\n").trim();
    if (!out) return "";

    out = out.replace(/^(?:\s*(?:bom dia|boa tarde|boa noite|prezado(?:\(a\))?|prezada(?:\(o\))?)[^\n]*\n+)+/i, "");
    out = out.replace(/\n*(?:atenciosamente|cordialmente)\s*,?[\s\S]*$/i, "");
    out = out.replace(/\n{3,}/g, "\n\n").trim();

    return out;
  }
  /**
   * Objetivo: ObtÃ©m responsÃ¡vel a partir do bloco de consumo interno.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: valor calculado.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function getInternalConsumptionResponsavelRaw() {
    if (!isRequestVisualizarPage()) return "";

    const isUsableControl = (el) => {
      if (!(el instanceof HTMLInputElement || el instanceof HTMLSelectElement)) return false;
      if (el instanceof HTMLInputElement) {
        const t = String(el.type || "").toLowerCase();
        if (["hidden", "button", "submit", "checkbox", "radio"].includes(t)) return false;
      }
      return true;
    };

    const readControlValue = (el) => {
      if (el instanceof HTMLSelectElement) {
        const opt = el.options?.[el.selectedIndex] || null;
        return String(opt?.textContent || opt?.label || el.value || "").trim();
      }
      return String(el?.value || "").trim();
    };

    const isLikelyPersonName = (value) => {
      const txt = normalizePersonName(value, false);
      if (!txt) return false;
      const n = norm(txt);
      if (!n || /^\d+$/.test(n)) return false;
      if (/^(?:novo|add|adicionar|minutos?|fat|faturado|descricao)$/.test(n)) return false;
      return true;
    };

    const root =
      document.querySelector("#interno .novo_consumo_interno") ||
      document.querySelector("#interno #novo_consumo_interno") ||
      null;
    if (!root) return "";

    const controls = Array.from(root.querySelectorAll("input, select")).filter(isUsableControl);
    if (!controls.length) return "";

    const byResponsavelAttr = controls.find((el) => {
      const probe = norm(
        [
          el.getAttribute("name") || "",
          el.getAttribute("id") || "",
          el.getAttribute("class") || "",
          el.getAttribute("placeholder") || "",
          el.getAttribute("aria-label") || "",
        ].join(" ")
      );
      return /responsavel/.test(probe) && isLikelyPersonName(readControlValue(el));
    });
    if (byResponsavelAttr) return normalizePersonName(readControlValue(byResponsavelAttr), false);

    const firstColControl = controls.find((el) => {
      const td = el.closest("td");
      if (!td) return false;
      const tr = td.parentElement;
      if (!(tr instanceof HTMLTableRowElement)) return false;
      return td === tr.cells?.[0] && isLikelyPersonName(readControlValue(el));
    });
    if (firstColControl) return normalizePersonName(readControlValue(firstColControl), false);

    const firstNamed = controls.find((el) => isLikelyPersonName(readControlValue(el)));
    if (firstNamed) return normalizePersonName(readControlValue(firstNamed), false);

    return "";
  }
  /**
   * Objetivo: Recupera nome do usuario logado exibido no cabecalho.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: valor calculado.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function getLoggedUserDisplayName() {
    const toCandidateName = (value) => {
      let raw = String(value || "").replace(/\s+/g, " ").trim();
      if (!raw) return "";
      raw = raw
        .replace(
          /\b(?:modo\s+claro|modo\s+escuro|pesquisa|referenc(?:ia)?|logout|sair|home|atualiza(?:r|c(?:ao|oes))?|vers(?:ao|oes)|preview)\b[\s\S]*$/i,
          ""
        )
        .replace(/^[^A-Za-zÀ-ÿ]+|[^A-Za-zÀ-ÿ]+$/g, "")
        .replace(/\s+/g, " ")
        .trim();
      if (!raw) return "";
      if (/\d/.test(raw)) return "";

      const tokens = raw.split(/\s+/).filter(Boolean);
      if (!tokens.length || tokens.length > 5) return "";
      if (tokens.length === 1 && tokens[0].length < 4) return "";
      if (tokens.some((part) => !/^[A-Za-zÀ-ÿ'`.-]+$/.test(part))) return "";

      const n = norm(raw);
      if (!n) return "";
      if (
        /(?:modo|claro|escuro|pesquisa|referenc|logout|sair|home|atualiz|versao|versoes|preview|requisic|cliente|responsavel)/.test(
          n
        )
      ) {
        return "";
      }
      return formatPersonDisplayName(raw, false);
    };

    const roots = Array.from(
      new Set(
        [
          document.getElementById("cabecalho_menu"),
          document.querySelector("#cabecalho #cabecalho_menu"),
          document.getElementById("cabecalho"),
          document.querySelector("#cabecalho"),
          document.querySelector("header"),
        ].filter((el) => el instanceof HTMLElement)
      )
    );
    const extractFromRoot = (menu) => {
      const directTexts = Array.from(menu.childNodes)
        .filter((node) => node.nodeType === Node.TEXT_NODE)
        .map((node) => String(node.textContent || "").replace(/\s+/g, " ").trim())
        .filter(Boolean);
      for (const txt of directTexts) {
        const candidate = toCandidateName(txt);
        if (candidate) return candidate;
      }

      const leaves = Array.from(menu.querySelectorAll("span,strong,b,font,a,td,div,label")).filter((el) => {
        if (!(el instanceof HTMLElement)) return false;
        if (el.querySelector("input,button,select,textarea,img,svg,i")) return false;
        return true;
      });
      for (const el of leaves) {
        const candidate = toCandidateName(el.textContent || "");
        if (candidate) return candidate;
      }

      const controls = Array.from(menu.querySelectorAll("input,select")).filter(
        (el) => el instanceof HTMLInputElement || el instanceof HTMLSelectElement
      );
      for (const control of controls) {
        const meta = norm(
          [
            control.getAttribute("name") || "",
            control.getAttribute("id") || "",
            control.getAttribute("class") || "",
            control.getAttribute("aria-label") || "",
          ].join(" ")
        );
        if (!/(usuario|user|login|tecnico|responsavel)/.test(meta)) continue;
        const value =
          control instanceof HTMLSelectElement
            ? String(control.options?.[control.selectedIndex]?.textContent || control.value || "").trim()
            : String(control.value || "").trim();
        const candidate = toCandidateName(value);
        if (candidate) return candidate;
      }

      return "";
    };
    for (const root of roots) {
      const fromRoot = extractFromRoot(root);
      if (fromRoot) return fromRoot;
    }

    const logoutLinks = Array.from(
      document.querySelectorAll(
        "#cabecalho a[href*='logout'], #cabecalho_menu a[href*='logout'], #cabecalho a[href*='sair'], #cabecalho_menu a[href*='sair']"
      )
    ).filter((el) => el instanceof HTMLAnchorElement);
    for (const link of logoutLinks) {
      const holders = [link.parentElement, link.closest("td,div,span,li,p"), link.previousElementSibling].filter(
        (el) => el instanceof HTMLElement
      );
      for (const holder of holders) {
        const candidate = toCandidateName(holder.textContent || "");
        if (candidate) return candidate;
      }
    }

    return "";
  }
  /**
   * Objetivo: Monta texto padrao para acao de envio de orcamento.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: valor calculado.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function buildOrcamentoReplyText() {
    const greeting = getGreetingByHour();
    const loggedUser = getLoggedUserDisplayName();
    const responsavelConsumoRaw = getInternalConsumptionResponsavelRaw();
    const responsavelRaw = responsavelConsumoRaw || getRequestFieldValueByLabel(/^responsavel\b/);
    const fallbackResponsavel = formatPersonDisplayName(responsavelRaw, false);
    const assinatura = loggedUser || fallbackResponsavel || "Equipe de Suporte";
    return `${greeting}\nSegue or\u00e7amento para servi\u00e7o solicitado\n\nAtenciosamente,\n${assinatura}`;
  }
  /**
   * Objetivo: Monta resposta final com saudaÃ§Ã£o, corpo e assinatura.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros:
   * - improvedBody: entrada usada por esta rotina.
   * Retorno: valor calculado.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function buildGptReplyText(improvedBody) {
    const solicitanteRaw = getRequestFieldValueByLabel(/^solicitante\b/);
    const responsavelConsumoRaw = getInternalConsumptionResponsavelRaw();
    const responsavelRaw = responsavelConsumoRaw || getRequestFieldValueByLabel(/^responsavel\b/);

    const solicitanteFirstName = getSolicitanteFirstNameForGreeting(solicitanteRaw);
    const responsavel = formatPersonDisplayName(responsavelRaw, false) || "Equipe de Suporte";
    const greeting = solicitanteFirstName ? `${getGreetingByHour()}, ${solicitanteFirstName}!` : `${getGreetingByHour()}!`;
    const body = sanitizeGptBodyText(improvedBody);

    if (!body) return `${greeting}\n\nAtenciosamente,\n${responsavel}`;
    return `${greeting}\n\n${body}\n\nAtenciosamente,\n${responsavel}`;
  }
  /**
   * Objetivo: Recupera Ãºltimo acompanhamento com filtro opcional.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros:
   * - filterFn: entrada usada por esta rotina.
   * Retorno: valor calculado.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function getRequestLastAcompanhamento(filterFn = null) {
    if (!isRequestVisualizarPage()) return null;

    const tables = Array.from(document.querySelectorAll("#interno .acompanhamentos table, #interno table"));
    for (const table of tables) {
      const headerRow =
        table.tHead?.rows?.[0] ||
        Array.from(table.rows || []).find((tr) => Array.from(tr.cells || []).some((c) => /^th$/i.test(c.tagName)));
      if (!headerRow) continue;

      const headers = Array.from(headerRow.cells || []).map((c) => norm(c.textContent || ""));
      const idxData = headers.findIndex((h) => h.startsWith("data"));
      const idxAcao = headers.findIndex((h) => h.startsWith("acao"));
      const idxDescricao = headers.findIndex((h) => h.startsWith("descricao"));
      if (idxData < 0 || idxAcao < 0 || idxDescricao < 0) continue;

      const rows = Array.from(table.rows || []).filter((tr) => {
        if (tr === headerRow) return false;
        if (tr.closest("thead")) return false;
        return Array.from(tr.cells || []).some((c) => /^td$/i.test(c.tagName));
      });
      if (!rows.length) continue;

      let best = null;
      rows.forEach((tr, idx) => {
        const cells = Array.from(tr.cells || []);
        const acaoNorm = norm(cells[idxAcao]?.textContent || "");
        if (!acaoNorm) return;
        const dataText = String(cells[idxData]?.textContent || "").trim();
        const data = parsePtBrDateTime(dataText);
        const candidate = { idx, acaoNorm, data, dataText };
        if (typeof filterFn === "function" && !filterFn(candidate)) return;

        if (!best) {
          best = candidate;
          return;
        }

        const ts = data ? data.getTime() : NaN;
        const bestTs = best.data ? best.data.getTime() : NaN;
        if (!Number.isNaN(ts) && (Number.isNaN(bestTs) || ts > bestTs)) {
          best = candidate;
        }
      });

      if (!best) {
        if (typeof filterFn !== "function") {
          const firstCells = Array.from(rows[0].cells || []);
          return {
            acaoNorm: norm(firstCells[idxAcao]?.textContent || ""),
            data: parsePtBrDateTime(String(firstCells[idxData]?.textContent || "").trim()),
            dataText: String(firstCells[idxData]?.textContent || "").trim(),
          };
        }
        continue;
      }

      return best;
    }

    return null;
  }

  /* ----------- SECTION: RESOLUCAO DE FORMULARIO DE ACOMPANHAMENTO ----------- */
  /**
   * Objetivo: Resolve opÃ§Ã£o de aÃ§Ã£o por valor e fallback textual.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros:
   * - select: entrada usada por esta rotina.
   * - actionValue: entrada usada por esta rotina.
   * - fallbackTextMatchers: entrada usada por esta rotina.
   * Retorno: valor calculado.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function findRequestActionOption(select, actionValue, fallbackTextMatchers = []) {
    if (!(select instanceof HTMLSelectElement)) return null;

    const wanted = String(actionValue ?? "").trim();
    const opts = Array.from(select.options || []);
    let opt = opts.find((o) => String(o.value).trim() === wanted);
    if (opt) return opt;

    if (wanted) {
      const wantedNum = Number(wanted);
      if (!Number.isNaN(wantedNum)) {
        opt = opts.find((o) => {
          const v = String(o.value ?? "").trim();
          if (!v) return false;
          const n = Number(v);
          return !Number.isNaN(n) && n === wantedNum;
        });
        if (opt) return opt;
      }
    }

    if (!fallbackTextMatchers.length) return null;
    const matchers = fallbackTextMatchers
      .map((rx) => (rx instanceof RegExp ? rx : null))
      .filter(Boolean);
    if (!matchers.length) return null;

    opt = opts.find((o) => {
      const txt = norm((o.textContent || o.label || "").trim());
      return matchers.some((rx) => rx.test(txt));
    });
    return opt || null;
  }
  /**
   * Objetivo: Valida existÃªncia de uma aÃ§Ã£o no select de acompanhamento.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros:
   * - select: entrada usada por esta rotina.
   * - actionValue: entrada usada por esta rotina.
   * - fallbackTextMatchers: entrada usada por esta rotina.
   * Retorno: valor utilitario.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function requestActionExists(select, actionValue, fallbackTextMatchers = []) {
    return !!findRequestActionOption(select, actionValue, fallbackTextMatchers);
  }
  /**
   * Objetivo: Seleciona aÃ§Ã£o no formulÃ¡rio de acompanhamento.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros:
   * - select: entrada usada por esta rotina.
   * - actionValue: entrada usada por esta rotina.
   * - fallbackTextMatchers: entrada usada por esta rotina.
   * Retorno: boolean (true quando encontrou e selecionou a acao).
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function setRequestAction(select, actionValue, fallbackTextMatchers = []) {
    const opt = findRequestActionOption(select, actionValue, fallbackTextMatchers);
    if (!opt) return false;
    opt.selected = true;
    select.value = opt.value;
    return true;
  }
  /**
   * Objetivo: Resolve elementos do formulÃ¡rio em estrutura legada.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros:
   * - requiredActionValue: entrada usada por esta rotina.
   * - requiredFallbackTextMatchers: entrada usada por esta rotina.
   * Retorno: valor calculado.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function findLegacyRequestActionElements(requiredActionValue = null, requiredFallbackTextMatchers = []) {
    const selectCandidates = Array.from(
      document.querySelectorAll("select[name='IdAcao_Requisicao'], select#IdAcao_Requisicao")
    ).filter((el) => el instanceof HTMLSelectElement);

    let actionSelect = null;
    if (requiredActionValue !== null) {
      actionSelect =
        selectCandidates.find((sel) =>
          requestActionExists(sel, requiredActionValue, requiredFallbackTextMatchers)
        ) || null;
    } else {
      actionSelect = selectCandidates[0] || null;
    }
    if (!actionSelect) return null;

    const formFromSelect = actionSelect.closest("form");
    const textArea =
      formFromSelect?.querySelector("textarea[name='Acompanhamento'], textarea.acomp_descricao, textarea") ||
      Array.from(document.querySelectorAll("textarea")).find((el) => el instanceof HTMLTextAreaElement) ||
      null;
    const sendBtn =
      Array.from(
        (formFromSelect || document).querySelectorAll("input[type='submit'], input[type='button'], button")
      ).find((el) => {
        const txt = String(el?.defaultValue || el?.value || el?.textContent || "").trim();
        return /enviar acompanhamento/i.test(txt);
      }) ||
      Array.from(document.querySelectorAll("input[type='submit'], input[type='button'], button")).find((el) => {
        const txt = String(el?.defaultValue || el?.value || el?.textContent || "").trim();
        return /enviar acompanhamento/i.test(txt);
      }) ||
      null;

    if (!textArea || !sendBtn) return null;

    const form = formFromSelect || textArea.closest("form") || sendBtn.closest("form") || null;
    const actionHost =
      sendBtn.closest("td,div,p") ||
      actionSelect.closest("td,div,p") ||
      textArea.closest("td,div,p") ||
      form ||
      sendBtn.parentElement;

    return { actionSelect, textArea, sendBtn, minutosInput: null, actionHost, form };
  }
  /**
   * Objetivo: Resolve elementos do formulÃ¡rio em estrutura atual com fallback.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros:
   * - requiredActionValue: entrada usada por esta rotina.
   * - requiredFallbackTextMatchers: entrada usada por esta rotina.
   * Retorno: valor calculado.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function findRequestActionElements(requiredActionValue = null, requiredFallbackTextMatchers = []) {
    if (!isRequestVisualizarPage()) return null;

    const isVisible = (el) => {
      if (!(el instanceof HTMLElement)) return false;
      if (el.offsetParent !== null) return true;
      const st = getComputedStyle(el);
      return st.position === "fixed";
    };

    const roots = [
      document.getElementById("Novo_Acompanhamento"),
      document.getElementById("acompanhamento_form"),
      document.getElementById("interno"),
      document.body,
    ].filter(Boolean);

    const isSendBtn = (el) => {
      const txt = String(el?.value || el?.textContent || "").trim();
      return /enviar acompanhamento/i.test(txt);
    };

    const allSendCandidates = Array.from(
      document.querySelectorAll("input[type='submit'], input[type='button'], button")
    ).filter((el) => isSendBtn(el));
    const sendCandidates = allSendCandidates
      .filter((el) => isVisible(el))
      .concat(allSendCandidates.filter((el) => !isVisible(el)));

    for (const sendBtn of sendCandidates) {
      const form = sendBtn.closest("form");
      const scopedRoot =
        sendBtn.closest("#Novo_Acompanhamento, #acompanhamento_form") ||
        form ||
        document.getElementById("interno") ||
        document.body;

      const actionSelect =
        form?.querySelector("select[name='IdAcao_Requisicao'], select#IdAcao_Requisicao") ||
        scopedRoot.querySelector("select[name='IdAcao_Requisicao'], select#IdAcao_Requisicao");

      const textArea =
        form?.querySelector("textarea[name='Acompanhamento'], textarea.acomp_descricao, textarea") ||
        scopedRoot.querySelector(
          "#Novo_Acompanhamento textarea.acomp_descricao, #acompanhamento_form textarea, textarea[name='Acompanhamento'], textarea"
        );

      if (!actionSelect || !textArea) continue;
      if (
        requiredActionValue !== null &&
        !requestActionExists(actionSelect, requiredActionValue, requiredFallbackTextMatchers)
      ) {
        continue;
      }

      const minutosInput =
        form?.querySelector("input[name='Minutos_Consumo']") ||
        scopedRoot.querySelector("input[name='Minutos_Consumo']");

      const actionHost =
        sendBtn.closest("td,div,p") ||
        actionSelect.closest("td,div,p") ||
        textArea.closest("td,div,p") ||
        form ||
        sendBtn.parentElement;

      return { actionSelect, textArea, sendBtn, minutosInput, actionHost, form };
    }

    let actionSelect = null;
    let textArea = null;
    let sendBtn = null;
    let minutosInput = null;
    let form = null;

    for (const root of roots) {
      if (!actionSelect) {
        actionSelect = root.querySelector("select[name='IdAcao_Requisicao'], select#IdAcao_Requisicao");
      }

      if (!textArea) {
        textArea =
          root.querySelector("#Novo_Acompanhamento textarea.acomp_descricao") ||
          root.querySelector("#acompanhamento_form textarea") ||
          root.querySelector("textarea[name='Acompanhamento']") ||
          root.querySelector("textarea");
      }

      if (!sendBtn) {
        sendBtn =
          Array.from(root.querySelectorAll("input[type='submit'], input[type='button'], button")).find((el) =>
            isSendBtn(el)
          ) || null;
      }

      if (!minutosInput) {
        minutosInput = root.querySelector("input[name='Minutos_Consumo']");
      }

      if (!form) {
        form = actionSelect?.closest("form") || textArea?.closest("form") || sendBtn?.closest("form") || null;
      }

      if (actionSelect && textArea && sendBtn) break;
    }

    if (!actionSelect || !textArea || !sendBtn) return null;
    if (
      requiredActionValue !== null &&
      !requestActionExists(actionSelect, requiredActionValue, requiredFallbackTextMatchers)
    ) {
      return null;
    }

    const actionHost =
      sendBtn.closest("td,div,p") ||
      actionSelect.closest("td,div,p") ||
      textArea.closest("td,div,p") ||
      form ||
      sendBtn.parentElement;

    return { actionSelect, textArea, sendBtn, minutosInput, actionHost, form };
  }
  /**
   * Objetivo: Persistir tamanho do textarea de acompanhamento entre chamados.
   *
   * Contexto: tela visualizar_requisicao.php, bloco Novo_Acompanhamento/acompanhamento_form.
   * Parametros: nenhum.
   * Retorno: void.
   */
  function bindAcompanhamentoTextareaSizePersistence() {
    if (!isRequestVisualizarPage()) return;
    const selector = [
      "#Novo_Acompanhamento textarea[name='Acompanhamento']",
      "#Novo_Acompanhamento textarea.acomp_descricao",
      "#acompanhamento_form textarea[name='Acompanhamento']",
      "#acompanhamento_form textarea.acomp_descricao",
      "textarea[name='Acompanhamento'].acomp_descricao",
      "textarea.acomp_descricao[name='Acompanhamento']",
    ].join(", ");
    const targets = Array.from(document.querySelectorAll(selector)).filter((el) => el instanceof HTMLTextAreaElement);
    if (!targets.length) return;

    const persisted = readAcompanhamentoTextareaSize();
    const persistNow = (textarea) => {
      if (!(textarea instanceof HTMLTextAreaElement) || !textarea.isConnected) return;
      const cssHeight = parseFloat(String(window.getComputedStyle(textarea).height || ""));
      const inlineHeight = parseFloat(String(textarea.style.height || ""));
      const measuredHeight = Math.max(textarea.offsetHeight || 0, cssHeight || 0, inlineHeight || 0);
      const nextHeight = normalizeAcompanhamentoTextareaHeight(measuredHeight, textarea);
      if (!Number.isFinite(nextHeight) || nextHeight <= 0) return;
      textarea.style.height = `${nextHeight}px`;
      textarea.dataset.hsAcompSizeHeight = String(nextHeight);
      setAcompanhamentoTextareaSize({ height: nextHeight });
    };
    const schedulePersist = (textarea) => {
      if (!(textarea instanceof HTMLTextAreaElement)) return;
      if (hsAcompanhamentoTextareaPersistTimer) window.clearTimeout(hsAcompanhamentoTextareaPersistTimer);
      hsAcompanhamentoTextareaPending = textarea;
      hsAcompanhamentoTextareaPersistTimer = window.setTimeout(() => {
        const pending = hsAcompanhamentoTextareaPending;
        hsAcompanhamentoTextareaPending = null;
        hsAcompanhamentoTextareaPersistTimer = null;
        persistNow(pending);
      }, 160);
    };

    if (typeof ResizeObserver === "function" && !hsAcompanhamentoTextareaResizeObserver) {
      hsAcompanhamentoTextareaResizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries || []) {
          const textarea = entry?.target;
          if (!(textarea instanceof HTMLTextAreaElement)) continue;
          if (textarea.dataset.hsAcompSizeBound !== "1") continue;
          schedulePersist(textarea);
        }
      });
    }

    targets.forEach((textarea) => {
      if (!(textarea instanceof HTMLTextAreaElement)) return;
      if (persisted?.height && textarea.dataset.hsAcompSizeApplied !== "1") {
        const applied = normalizeAcompanhamentoTextareaHeight(persisted.height, textarea);
        textarea.style.height = `${applied}px`;
        textarea.dataset.hsAcompSizeHeight = String(applied);
        textarea.dataset.hsAcompSizeApplied = "1";
      }
      if (textarea.dataset.hsAcompSizeBound !== "1") {
        textarea.dataset.hsAcompSizeBound = "1";
        textarea.addEventListener("pointerup", () => schedulePersist(textarea));
        textarea.addEventListener("mouseup", () => schedulePersist(textarea));
        textarea.addEventListener("touchend", () => schedulePersist(textarea), { passive: true });
        textarea.addEventListener("blur", () => schedulePersist(textarea));
      }
      if (
        hsAcompanhamentoTextareaResizeObserver &&
        textarea.dataset.hsAcompSizeObserved !== "1"
      ) {
        hsAcompanhamentoTextareaResizeObserver.observe(textarea);
        textarea.dataset.hsAcompSizeObserved = "1";
      }
    });
  }
  /**
   * Objetivo: Converte entrada de hora para minutos totais.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros:
   * - value: entrada usada por esta rotina.
   * Retorno: valor calculado.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function parseHorasToMinutos(value) {
    const txt = String(value || "").trim();
    if (!txt) return "";

    let h = 0;
    let m = 0;

    if (txt.includes(":")) {
      const parts = txt.split(":");
      h = parseInt(parts[0], 10) || 0;
      m = parseInt(parts[1], 10) || 0;
    } else {
      h = parseInt(txt, 10) || 0;
      m = 0;
    }

    if (m > 59) m = 59;
    return String(Math.max(0, h * 60 + m));
  }
  /**
   * Objetivo: Normaliza input de hora para padrÃ£o esperado.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros:
   * - value: entrada usada por esta rotina.
   * Retorno: valor calculado.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function normalizeHorasInput(value) {
    const digits = String(value || "").replace(/\D/g, "");
    if (!digits) return "";
    if (digits.length <= 2) return digits;

    const h = digits.slice(0, -2);
    let m = parseInt(digits.slice(-2), 10);
    if (Number.isNaN(m)) m = 0;
    if (m > 59) m = 59;
    return `${parseInt(h, 10) || 0}:${String(m).padStart(2, "0")}`;
  }
  /**
   * Objetivo: Garante campo auxiliar de hora e sincronizaÃ§Ã£o com minutos.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros:
   * - elements: entrada usada por esta rotina.
   * Retorno: void.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function ensureHorasToMinutosInput(elements) {
    const minutosInput = elements?.minutosInput;
    if (!(minutosInput instanceof HTMLInputElement)) return;

    const host = minutosInput.closest("td,div,p") || minutosInput.parentElement;
    if (!(host instanceof HTMLElement)) return;

    let horasInput = host.querySelector("input.hs-horas-consumo");
    if (!horasInput) {
      horasInput = document.createElement("input");
      horasInput.type = "text";
      horasInput.className = "hs-horas-consumo";
      horasInput.placeholder = "Hora (HH:MM)";
      horasInput.autocomplete = "off";
      host.appendChild(horasInput);
    }

    if (horasInput.dataset.hsHorasBound === "1") return;
    horasInput.dataset.hsHorasBound = "1";

    horasInput.addEventListener("input", () => {
      const normalized = normalizeHorasInput(horasInput.value);
      horasInput.value = normalized;
      const minutos = parseHorasToMinutos(normalized);
      minutosInput.value = minutos;
    });
  }
  /**
   * Objetivo: Valida se os campos de minutos de consumo estao preenchidos.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros:
   * - root: entrada usada por esta rotina.
   * Retorno: boolean.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function areMinutosConsumoFieldsFilled(root = document) {
    const scope = root instanceof Element || root instanceof Document ? root : document;
    const isVisible = (el) => {
      if (!(el instanceof HTMLElement)) return false;
      if (el.offsetParent !== null) return true;
      const st = getComputedStyle(el);
      return st.position === "fixed";
    };

    const inputs = Array.from(scope.querySelectorAll("#interno input[name='Minutos_Consumo'], input[name='Minutos_Consumo']"))
      .filter((el) => el instanceof HTMLInputElement && isVisible(el));
    if (!inputs.length) return false;

    return inputs.every((input) => {
      const raw = String(input.value || "").replace(",", ".").trim();
      if (!raw) return false;
      const n = Number(raw);
      return Number.isFinite(n) && n > 0;
    });
  }

  /* ----------------------- SECTION: IA E CREDENCIAIS ------------------------- */
  /**
   * Objetivo: LÃª chave OpenAI persistida no navegador.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: valor calculado.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function getStoredOpenAIKey() {
    try {
      return (localStorage.getItem(OPENAI_API_KEY_LS) || "").trim();
    } catch {
      return "";
    }
  }
  /**
   * Objetivo: Persiste chave OpenAI no navegador.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros:
   * - key: entrada usada por esta rotina.
   * Retorno: void.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function setStoredOpenAIKey(key) {
    try {
      localStorage.setItem(OPENAI_API_KEY_LS, String(key || "").trim());
    } catch {}
  }
  /**
   * Objetivo: LÃª chave Gemini persistida no navegador.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: valor calculado.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  /**
   * Objetivo: Persiste chave Gemini no navegador.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros:
   * - key: entrada usada por esta rotina.
   * Retorno: void.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  /**
   * Objetivo: ObtÃ©m modo de IA atual (grÃ¡tis/pago).
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: valor calculado.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function getStoredAiMode() {
    try {
      const mode = String(localStorage.getItem(AI_MODE_LS) || "").trim();
      if (mode === AI_MODE_PAID_OPENAI || mode === AI_MODE_FREE_GEMINI) return mode;
    } catch {}
    return AI_MODE_FREE_GEMINI;
  }
  /**
   * Objetivo: Define e persiste modo de IA atual.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros:
   * - mode: entrada usada por esta rotina.
   * Retorno: void.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function setStoredAiMode(mode) {
    const value = mode === AI_MODE_PAID_OPENAI ? AI_MODE_PAID_OPENAI : AI_MODE_FREE_GEMINI;
    try {
      localStorage.setItem(AI_MODE_LS, value);
    } catch {}
  }
  /**
   * Objetivo: Reescreve texto via API OpenAI (modo pago).
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros:
   * - text: entrada usada por esta rotina.
   * Retorno: Promise<boolean> (true quando envio confirmado pelo backend).
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  async function improveWithOpenAI(text) {
    let key = getStoredOpenAIKey();
    if (!key) {
      const typed = window.prompt("Informe sua chave da OpenAI (sera salva apenas no navegador):", "");
      key = String(typed || "").trim();
      if (!key) throw new Error("Chave da OpenAI nao informada.");
      setStoredOpenAIKey(key);
    }

    const content = String(text || "").trim();
    if (!content) throw new Error("Sem texto para melhorar.");

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "Voce e redator profissional de suporte tecnico em portugues do Brasil. Reescreva com ortografia e gramatica corretas, tom formal, claro e objetivo, sem inventar informacoes. Responda somente com o corpo do texto final, sem saudacao inicial e sem assinatura final.",
          },
          {
            role: "user",
            content: `Corrija e profissionalize o texto abaixo em portugues do Brasil, mantendo o contexto tecnico e a objetividade. Responda somente com o corpo final, sem saudacao e sem assinatura:\n\n${content}`,
          },
        ],
        max_tokens: 1000,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const msg = data?.error?.message || `HTTP ${response.status}`;
      throw new Error(msg);
    }

    const out = data?.choices?.[0]?.message?.content;
    if (!out) throw new Error("Resposta vazia da OpenAI.");
    return String(out).trim();
  }
  /**
   * Objetivo: Reescreve texto via endpoint gratuito configurado.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros:
   * - text: entrada usada por esta rotina.
   * Retorno: Promise<boolean>.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  async function improveWithGeminiFree(text) {
    const content = String(text || "").trim();
    if (!content) throw new Error("Sem texto para melhorar.");

    const response = await fetch(FREE_AI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai",
        messages: [
          {
            role: "system",
            content:
              "Voce e redator profissional de suporte tecnico em portugues do Brasil. Reescreva com ortografia e gramatica corretas, tom formal, claro e objetivo, sem inventar informacoes. Responda somente com o corpo do texto final, sem saudacao inicial e sem assinatura final.",
          },
          {
            role: "user",
            content:
              "Corrija e profissionalize o texto abaixo em portugues do Brasil, mantendo o contexto tecnico e a objetividade. Responda somente com o corpo final, sem saudacao e sem assinatura:\n\n" +
              content,
          },
        ],
        temperature: 0.2,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const msg = data?.error?.message || data?.message || `HTTP ${response.status}`;
      throw new Error(msg);
    }

    const out = String(data?.choices?.[0]?.message?.content || "").trim();
    if (!out) throw new Error("Resposta vazia da IA gratuita.");
    return out;
  }

  /* ---------------- SECTION: QUICK ACTIONS E AUTOMACOES ---------------------- */
  /**
   * Objetivo: Garante botÃ£o de atalho e seu handler.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros:
   * - toolbar: entrada usada por esta rotina.
   * - id: entrada usada por esta rotina.
   * - label: entrada usada por esta rotina.
   * - onClick: entrada usada por esta rotina.
   * Retorno: HTMLInputElement (botao pronto para uso).
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function ensureQuickActionButton(toolbar, id, label, onClick) {
    let btn = toolbar.querySelector(`#${id}`);
    if (!btn) {
      btn = document.createElement("input");
      btn.id = id;
      btn.type = "button";
      btn.className = "hs-qa-btn";
      toolbar.appendChild(btn);
    }
    btn.value = label;
    btn.onclick = (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      onClick();
    };
    return btn;
  }
  /**
   * Objetivo: Garante seletor de modo IA integrado ao split-button.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros:
   * - toolbar: entrada usada por esta rotina.
   * - aiBtn: entrada usada por esta rotina.
   * Retorno: HTMLSelectElement (seletor de modo IA).
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function ensureQuickActionModeSelect(toolbar, aiBtn) {
    let wrap = toolbar.querySelector("#hs-qa-ai-wrap");
    if (!(wrap instanceof HTMLElement)) {
      wrap = document.createElement("span");
      wrap.id = "hs-qa-ai-wrap";
      wrap.className = "hs-qa-ai-wrap";
    }

    if (wrap.parentElement !== toolbar) {
      if (aiBtn?.parentElement === toolbar) toolbar.insertBefore(wrap, aiBtn);
      else toolbar.appendChild(wrap);
    }
    if (aiBtn) {
      aiBtn.classList.add("hs-qa-ai-main");
      if (aiBtn.parentElement !== wrap) wrap.appendChild(aiBtn);
    }

    let select = wrap.querySelector("#hs-qa-ai-mode");
    if (!(select instanceof HTMLSelectElement)) {
      select = document.createElement("select");
      select.id = "hs-qa-ai-mode";
      select.className = "hs-qa-mode";
      select.innerHTML = `
        <option value="${AI_MODE_FREE_GEMINI}">IA gratis (sem token)</option>
        <option value="${AI_MODE_PAID_OPENAI}">API paga (OpenAI)</option>
      `;
      wrap.appendChild(select);
    }
    select.title = "Selecionar modo de IA";

    const storedMode = getStoredAiMode();
    if (select.value !== storedMode) select.value = storedMode;

    if (select.dataset.hsBound !== "1") {
      select.dataset.hsBound = "1";
      select.addEventListener("change", () => setStoredAiMode(select.value));
    }

    return select;
  }
  /**
   * Objetivo: Marca pendÃªncia de auto-conclusÃ£o apÃ³s envio.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: void.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function setAutoConcluirPending() {
    if (!FEATURE_FLAGS.ENABLE_AUTO_CONCLUIR) return;
    try {
      sessionStorage.setItem(AUTO_CONCLUIR_KEY, "1");
      sessionStorage.setItem(AUTO_CONCLUIR_TRIES_KEY, "0");
    } catch {}
  }
  /**
   * Objetivo: Limpa pendÃªncia de auto-conclusÃ£o.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: valor utilitario.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function clearAutoConcluirPending() {
    try {
      sessionStorage.removeItem(AUTO_CONCLUIR_KEY);
      sessionStorage.removeItem(AUTO_CONCLUIR_TRIES_KEY);
    } catch {}
  }
  /**
   * Objetivo: LÃª estado atual da pendÃªncia de auto-conclusÃ£o.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: valor calculado.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function getAutoConcluirPending() {
    try {
      return sessionStorage.getItem(AUTO_CONCLUIR_KEY) === "1";
    } catch {
      return false;
    }
  }
  /**
   * Objetivo: LÃª contador de tentativas de auto-concluir.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: valor calculado.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function getAutoConcluirTries() {
    try {
      const n = parseInt(sessionStorage.getItem(AUTO_CONCLUIR_TRIES_KEY) || "0", 10);
      return Number.isFinite(n) ? n : 0;
    } catch {
      return 0;
    }
  }
  /**
   * Objetivo: Atualiza contador de tentativas de auto-concluir.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros:
   * - value: entrada usada por esta rotina.
   * Retorno: void.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function setAutoConcluirTries(value) {
    try {
      sessionStorage.setItem(AUTO_CONCLUIR_TRIES_KEY, String(Math.max(0, value | 0)));
    } catch {}
  }
  /**
   * Objetivo: Tenta acionar botÃ£o de concluir automaticamente.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: boolean (true quando encontrou e clicou no botao de concluir).
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function clickMarcarConcluidoButton() {
    if (!isRequestVisualizarPage()) return false;

    const candidates = Array.from(
      document.querySelectorAll(
        "#interno .requisicao_top .marcacao_concluido input[type='button'], #interno .requisicao_top .marcacao_concluido button, #interno .requisicao_top .marcacao_concluido a, .marcacao_concluido input[type='button'], .marcacao_concluido button, .marcacao_concluido a"
      )
    ).filter((el) => {
      if (!(el instanceof HTMLElement)) return false;
      const txt = norm((el.getAttribute("value") || el.textContent || "").trim());
      if (/marcar.*nao[^a-z0-9]*conclu/.test(txt) || /nao[^a-z0-9]*conclu/.test(txt)) return false;
      return /marcar.*conclu/.test(txt) || /^concluir\b/.test(txt);
    });

    const btn = candidates[0];
    if (!btn) return false;

    const originalConfirm = window.confirm;
    try {
      window.confirm = () => true;
      btn.click();
      return true;
    } catch {
      return false;
    } finally {
      window.confirm = originalConfirm;
    }
  }
  /**
   * Objetivo: Executa rotina de auto-concluir quando pendente.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: void.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function runAutoConcluirIfPending() {
    if (!FEATURE_FLAGS.ENABLE_AUTO_CONCLUIR) {
      clearAutoConcluirPending();
      return;
    }
    if (!getAutoConcluirPending()) return;
    if (!isRequestVisualizarPage()) return;

    if (clickMarcarConcluidoButton()) {
      clearAutoConcluirPending();
      toast("Requisicao marcada como concluida automaticamente.", "ok", 2200);
      return;
    }

    const tries = getAutoConcluirTries() + 1;
    setAutoConcluirTries(tries);
    if (tries >= 25) {
      clearAutoConcluirPending();
      toast("Nao foi possivel clicar em 'Marcar concluido' automaticamente.", "err", 3200);
    }
  }
  /**
   * Objetivo: Remove consumos do histÃ³rico antes de cancelar chamado expirado.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: Promise<boolean>.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  async function removeHistoricoConsumoForChamadoExpirado() {
    if (!isRequestVisualizarPage()) return 0;

    const isVisible = (el) => {
      if (!(el instanceof HTMLElement)) return false;
      if (el.offsetParent !== null) return true;
      const st = getComputedStyle(el);
      return st.position === "fixed";
    };

    const getExcluirButtons = () =>
      Array.from(
        document.querySelectorAll(
          "#consumos_internos .acao_consumo_excluir, #consulta_consumos .acao_consumo_excluir, .frame_consumos .acao_consumo_excluir, .lista_consumos .acao_consumo_excluir"
        )
      ).filter((el) => {
        if (!(el instanceof HTMLElement)) return false;
        const tr = el.closest("tr");
        if (!tr || tr.classList.contains("total_consumo")) return false;
        return isVisible(el);
      });

    let removed = 0;
    let guard = 0;
    while (guard < 30) {
      guard += 1;
      const btn = getExcluirButtons()[0];
      if (!btn) break;

      const originalConfirm = window.confirm;
      try {
        window.confirm = () => true;
        btn.click();
        removed += 1;
      } catch {}
      finally {
        window.confirm = originalConfirm;
      }

      await new Promise((resolve) => setTimeout(resolve, 220));
    }

    return removed;
  }
  /**
   * Objetivo: Define aÃ§Ã£o/texto e dispara envio do acompanhamento.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros:
   * - elements: entrada usada por esta rotina.
   * - text: entrada usada por esta rotina.
   * - actionValue: entrada usada por esta rotina.
   * - fallbackTextMatchers: entrada usada por esta rotina.
   * Retorno: void.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function setTextAndSend(elements, text, actionValue, fallbackTextMatchers = []) {
    let current = elements;
    if (
      !current ||
      !current.actionSelect ||
      !current.textArea ||
      !current.sendBtn ||
      !current.actionSelect.isConnected ||
      !current.textArea.isConnected ||
      !current.sendBtn.isConnected
    ) {
      current =
        findRequestActionElements(actionValue, fallbackTextMatchers) ||
        findRequestActionElements() ||
        current;
    }
    if (!current?.actionSelect || !current?.textArea || !current?.sendBtn) {
      current = findLegacyRequestActionElements(actionValue, fallbackTextMatchers) || findLegacyRequestActionElements();
      if (!current?.actionSelect || !current?.textArea || !current?.sendBtn) {
        toast("Formulario de acompanhamento nao encontrado.", "err", 4200);
        return;
      }
    }

    const { textArea, actionSelect, sendBtn } = current;
    if (actionValue !== undefined && actionValue !== null) {
      const ok = setRequestAction(actionSelect, actionValue, fallbackTextMatchers);
      if (!ok) {
        const refreshed = findRequestActionElements(actionValue, fallbackTextMatchers);
        const legacy =
          findLegacyRequestActionElements(actionValue, fallbackTextMatchers) || findLegacyRequestActionElements();
        const target = refreshed || legacy;
        if (!target || !setRequestAction(target.actionSelect, actionValue, fallbackTextMatchers)) {
          toast(`Acao ${actionValue} nao esta disponivel neste formulario.`, "err", 4200);
          return;
        }
        target.textArea.value = String(text || "");
        target.sendBtn.click();
        return;
      }
    }
    textArea.value = String(text || "");
    sendBtn.click();
  }
  /**
   * Objetivo: Detecta se label/opcao representa acao de conclusao.
   *
   * Contexto: evita alerta em opcoes que apenas mencionam "nao concluir".
   * Parametros:
   * - value: texto da opcao/acao.
   * Retorno: boolean.
   */
  function isConcluirActionLabel(value) {
    const txt = norm(String(value || ""))
      .replace(/\s+/g, " ")
      .trim();
    if (!txt) return false;
    if (/nao[^a-z0-9]*conclu/.test(txt)) return false;
    return /\bconclu\w*\b/.test(txt) || /\bfinaliz\w*\b/.test(txt);
  }
  /**
   * Objetivo: Informa se acao selecionada no formulario e "Concluir".
   *
   * Contexto: utilizado para exibir alerta de conferencia de consumo.
   * Parametros:
   * - select: campo de acao do acompanhamento.
   * Retorno: boolean.
   */
  function isConcluirActionSelected(select) {
    if (!(select instanceof HTMLSelectElement)) return false;
    const selected = select.selectedOptions?.[0] || select.options?.[select.selectedIndex] || null;
    const valueRaw = String(selected?.value ?? "").trim();
    if (valueRaw === "5") return true;
    return isConcluirActionLabel(selected?.textContent || selected?.label || "");
  }
  /**
   * Objetivo: Mostra alerta visual para revisar consumo antes de concluir chamado.
   *
   * Contexto: tela visualizar_requisicao, abaixo da barra de acao do acompanhamento.
   * Parametros: nenhum.
   * Retorno: void.
   */
  function ensureConcluirConsumoAlert() {
    if (!isRequestVisualizarPage()) return;
    const elements = findRequestActionElements() || findLegacyRequestActionElements();
    if (!elements?.actionSelect || !elements?.sendBtn) return;
    const actionSelect = elements.actionSelect;
    const sendBtn = elements.sendBtn;
    const host =
      (elements.actionHost instanceof HTMLElement && elements.actionHost) ||
      sendBtn.closest("td,div,p") ||
      sendBtn.parentElement;
    if (!(host instanceof HTMLElement)) return;

    let warn = host.querySelector("#hs-concluir-consumo-alert");
    if (!(warn instanceof HTMLElement)) {
      warn = document.createElement("div");
      warn.id = "hs-concluir-consumo-alert";
      warn.className = "hs-concluir-consumo-alert";
      warn.innerHTML =
        "<strong>Concluir chamado:</strong> confirme se o consumo/minutos foi preenchido corretamente antes de enviar.";
      host.appendChild(warn);
    } else if (warn.parentElement !== host) {
      host.appendChild(warn);
    }

    const sync = (pulse = false) => {
      const shouldShow = isConcluirActionSelected(actionSelect);
      warn.classList.toggle("is-visible", shouldShow);
      if (!shouldShow || !pulse) return;
      warn.classList.remove("is-pulse");
      void warn.offsetWidth;
      warn.classList.add("is-pulse");
    };

    if (actionSelect.dataset.hsConcluirAlertBound !== "1") {
      actionSelect.dataset.hsConcluirAlertBound = "1";
      actionSelect.addEventListener("change", () => sync(true));
      actionSelect.addEventListener("input", () => sync(false));
    }
    if (sendBtn instanceof HTMLElement && sendBtn.dataset.hsConcluirAlertBound !== "1") {
      sendBtn.dataset.hsConcluirAlertBound = "1";
      sendBtn.addEventListener("click", () => sync(true), true);
    }

    sync(false);
  }
  /**
   * Objetivo: Monta barra de atalhos e regras de automaÃ§Ã£o da requisiÃ§Ã£o.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: void.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function ensureRequestQuickActions() {
    if (!isRequestVisualizarPage()) return;

    const elements = findRequestActionElements();
    if (!elements) return;

    ensureHorasToMinutosInput(elements);

    const host = elements.sendBtn?.closest("td") || elements.actionHost;
    if (!(host instanceof HTMLElement)) return;

    let toolbar = document.getElementById("hs-quick-actions-main");
    if (!toolbar) {
      toolbar = document.createElement("div");
      toolbar.id = "hs-quick-actions-main";
      toolbar.className = "hs-quick-actions";
    }
    if (toolbar.parentElement !== host) host.appendChild(toolbar);

    document.querySelectorAll(".hs-quick-actions").forEach((el) => {
      if (el !== toolbar) el.remove();
    });

    host.classList.add("hs-qa-host");

    const situacaoAtualNorm = getRequestSituacaoAtualNorm();
    const lastAcomp = getRequestLastAcompanhamento();
    const lastAcompForSla =
      getRequestLastAcompanhamento((item) => !/\binstrucao\s+interna\b/.test(item?.acaoNorm || "")) ||
      lastAcomp;
    const lastAcaoNorm = lastAcompForSla?.acaoNorm || "";
    const lastAcaoFlat = lastAcaoNorm.replace(/\s+/g, " ").trim();
    const lastAcaoPassou5Dias = hasElapsedDays(lastAcompForSla?.data, 5);

    const showPrimeiroAtendimento = NOVA_RX.test(situacaoAtualNorm);
    const showAprovacaoInterna =
      lastAcaoPassou5Dias &&
      /solicitac.*aprovac.*servic/.test(lastAcaoFlat);
    const showChamadoExpirado =
      lastAcaoPassou5Dias &&
      (
        /novas?\s+informac.*solicitad/.test(lastAcaoFlat) ||
        /solicitar?\s+mais\s+informac/.test(lastAcaoFlat) ||
        /orcament.*enviad/.test(lastAcaoFlat) ||
        /enviad.*orcament/.test(lastAcaoFlat) ||
        /enviar.*orcament/.test(lastAcaoFlat)
      );

    const getElementsForAction = (action, fallbackTextMatchers = []) =>
      findRequestActionElements(action, fallbackTextMatchers) || findRequestActionElements();

    const withAction = (action, id, label, text, fallbackTextMatchers = [], visibleWhen = true) => {
      const btn = ensureQuickActionButton(toolbar, id, label, () =>
        setTextAndSend(getElementsForAction(action, fallbackTextMatchers), text, action, fallbackTextMatchers)
      );
      const elementsForAction = getElementsForAction(action, fallbackTextMatchers);
      const canShow =
        elementsForAction &&
        visibleWhen &&
        requestActionExists(elementsForAction.actionSelect, action, fallbackTextMatchers);
      if (canShow) btn.style.setProperty("display", "inline-flex", "important");
      else btn.style.setProperty("display", "none", "important");
      return btn;
    };

    const withActionAndAutoConcluir = (action, id, label, text, fallbackTextMatchers = [], visibleWhen = true) => {
      const btn = ensureQuickActionButton(toolbar, id, label, () => {
        const target = getElementsForAction(action, fallbackTextMatchers);
        if (!target || !requestActionExists(target.actionSelect, action, fallbackTextMatchers)) {
          toast(`Acao ${action} nao esta disponivel neste formulario.`, "err", 3600);
          return;
        }
        if (FEATURE_FLAGS.ENABLE_AUTO_CONCLUIR) setAutoConcluirPending();
        setTextAndSend(target, text, action, fallbackTextMatchers);
      });
      const elementsForAction = getElementsForAction(action, fallbackTextMatchers);
      const canShow =
        elementsForAction &&
        visibleWhen &&
        requestActionExists(elementsForAction.actionSelect, action, fallbackTextMatchers);
      if (canShow) btn.style.setProperty("display", "inline-flex", "important");
      else btn.style.setProperty("display", "none", "important");
      return btn;
    };

    withAction("1", "hs-qa-primeiro", "Primeiro atendimento", T_PRIMEIRO_ATENDIMENTO, [
      /primeiro.*atendimento/,
      /efetuar.*1.*atendimento/,
      /^1.*atendimento/,
    ], showPrimeiroAtendimento);
    withAction("13", "hs-qa-servico", "Enviar para servico", T_ENVIAR_SERVICO, [
      /enviar.*servic/,
    ]);
    const orcamentoFallback = [
      /enviar.*orcament/,
      /orcament.*enviad/,
      /orcamento/,
    ];
    const orcamentoBtn = ensureQuickActionButton(toolbar, "hs-qa-orcamento", "Enviar para orcamento", () => {
      const target = getElementsForAction("", orcamentoFallback);
      if (!target || !requestActionExists(target.actionSelect, "", orcamentoFallback)) {
        toast("Acao de orcamento nao esta disponivel neste formulario.", "err", 3600);
        return;
      }
      if (!areMinutosConsumoFieldsFilled(target.form || document)) {
        toast("Preencha os campos de minutos consumo antes de enviar para orcamento.", "err", 3600);
        return;
      }
      setTextAndSend(target, buildOrcamentoReplyText(), "", orcamentoFallback);
    });
    const elementsForOrcamento = getElementsForAction("", orcamentoFallback);
    const canShowOrcamento =
      elementsForOrcamento &&
      requestActionExists(elementsForOrcamento.actionSelect, "", orcamentoFallback);
    if (canShowOrcamento) orcamentoBtn.style.setProperty("display", "inline-flex", "important");
    else orcamentoBtn.style.setProperty("display", "none", "important");
    const refreshOrcamentoButtonState = () => {
      const canUseOrcamento = canShowOrcamento && areMinutosConsumoFieldsFilled(elementsForOrcamento?.form || document);
      orcamentoBtn.disabled = !canUseOrcamento;
      orcamentoBtn.title = canUseOrcamento
        ? "Enviar para orcamento"
        : "Preencha os campos de minutos consumo para habilitar.";
    };
    refreshOrcamentoButtonState();
    const orcamentoBindRoot =
      elementsForOrcamento?.form ||
      document.querySelector("#interno .novo_consumo_interno, #interno #novo_consumo_interno, #interno") ||
      document.body;
    if (orcamentoBindRoot instanceof HTMLElement && orcamentoBindRoot.dataset.hsOrcamentoWatchBound !== "1") {
      orcamentoBindRoot.dataset.hsOrcamentoWatchBound = "1";
      const syncState = () => refreshOrcamentoButtonState();
      orcamentoBindRoot.addEventListener("input", syncState, true);
      orcamentoBindRoot.addEventListener("change", syncState, true);
      orcamentoBindRoot.addEventListener("keyup", syncState, true);
    }
    const expiradoFallback = [
      /cancelar.*requisic/,
      /^cancelar$/,
    ];
    const expiradoBtn = ensureQuickActionButton(toolbar, "hs-qa-expirado", "Chamado expirado", async () => {
      if (expiradoBtn.dataset.hsBusy === "1") return;
      expiradoBtn.dataset.hsBusy = "1";
      expiradoBtn.disabled = true;

      try {
        const target = getElementsForAction("6", expiradoFallback);
        if (!target || !requestActionExists(target.actionSelect, "6", expiradoFallback)) {
          toast("Acao 6 nao esta disponivel neste formulario.", "err", 3600);
          return;
        }

        const removidos = await removeHistoricoConsumoForChamadoExpirado();
        if (removidos > 0) {
          toast(`${removidos} consumo(s) removido(s) do historico.`, "ok", 2600);
        }

        if (FEATURE_FLAGS.ENABLE_AUTO_CONCLUIR) setAutoConcluirPending();
        setTextAndSend(target, T_CHAMADO_EXPIRADO, "6", expiradoFallback);
      } finally {
        expiradoBtn.disabled = false;
        delete expiradoBtn.dataset.hsBusy;
      }
    });
    const elementsForExpirado = getElementsForAction("6", expiradoFallback);
    const canShowExpirado =
      elementsForExpirado &&
      showChamadoExpirado &&
      requestActionExists(elementsForExpirado.actionSelect, "6", expiradoFallback);
    if (canShowExpirado) expiradoBtn.style.setProperty("display", "inline-flex", "important");
    else expiradoBtn.style.setProperty("display", "none", "important");
    withActionAndAutoConcluir("24", "hs-qa-aprov-int", "Aprovacao interna", T_APROVACAO_INTERNA, [
      /aprovac.*interna/,
    ], showAprovacaoInterna);
    withActionAndAutoConcluir("5", "hs-qa-concluir", "Concluir chamado", T_CONCLUIR_CHAMADO, [
      /concluir/,
      /finaliz/,
    ]);

    toolbar.querySelectorAll("#hs-qa-free, #hs-qa-gpt").forEach((el) => el.remove());
    if (!FEATURE_FLAGS.ENABLE_AI_ASSIST) {
      toolbar.querySelectorAll("#hs-qa-ai-wrap, #hs-qa-ai, #hs-qa-ai-mode").forEach((el) => el.remove());
      return;
    }

    const aiBtn = ensureQuickActionButton(toolbar, "hs-qa-ai", "Melhorar texto", async () => {
      const current = findRequestActionElements() || elements;
      if (!current?.textArea) {
        toast("Formulario de acompanhamento nao encontrado.", "err", 3200);
        return;
      }

      const src = String(current.textArea.value || "").trim();
      if (!src) {
        toast("Digite um texto para melhorar.", "err", 2800);
        return;
      }

      const mode = getStoredAiMode();
      const isPaid = mode === AI_MODE_PAID_OPENAI;
      const t = toast(
        isPaid ? "Melhorando texto com API paga..." : "Melhorando texto com IA gratis (sem token)...",
        "info",
        60000
      );
      aiBtn.disabled = true;
      try {
        const improved = isPaid ? await improveWithOpenAI(src) : await improveWithGeminiFree(src);
        current.textArea.value = buildGptReplyText(improved);
        t.classList.remove("info");
        t.classList.add("ok");
        t.querySelector("span:last-child").textContent = isPaid
          ? "Texto melhorado com API paga."
          : "Texto melhorado com IA gratis (sem token).";
        setTimeout(() => t.remove(), 2200);
      } catch (err) {
        t.classList.remove("info");
        t.classList.add("err");
        t.querySelector("span:last-child").textContent = isPaid
          ? `Falha no modo pago: ${String(err?.message || err)}`
          : `Falha no modo gratis: ${String(err?.message || err)}`;
        setTimeout(() => t.remove(), 5000);
      } finally {
        aiBtn.disabled = false;
      }
    });
    const modeSelect = ensureQuickActionModeSelect(toolbar, aiBtn);
    modeSelect.style.display = "";
    aiBtn.style.display = "";
  }

  /* ------------------ SECTION: TOAST, POPUP E REDE LEGADA ------------------- */
  let toastWrap = null;
  let reqPopup = null;
  let hsManualUpdateModal = null;
  let hsManualUpdatePayload = null;
  let hsUpdatesLogModal = null;
  let hsUpdatesLogPayload = null;
  let hsAppearanceModal = null;
  let hsImagePreviewModal = null;
  let hsTextPreviewModal = null;
  const hsTextPreviewBridgePending = new Map();
  let hsTextPreviewBridgeBound = false;
  let hsImagePreviewObjectUrlRevoke = null;
  let hsImagePreviewDragState = null;
  let hsAcompanhamentoTextareaResizeObserver = null;
  let hsAcompanhamentoTextareaPersistTimer = null;
  let hsAcompanhamentoTextareaPending = null;
  let reqPopupEscBound = false;
  let hsReqClicksBound = false;
  let hsAjaxRefreshBusy = false;
  let hsAjaxRefreshTimer = null;
  let hsAjaxLastSignature = "";
  let hsAjaxLastToastAt = 0;
  let hsAjaxRefreshLastAt = 0;
  let hsAjaxRefreshNextAt = 0;
  let hsAjaxRefreshLastNewCount = 0;
  let hsAjaxRefreshLastChangedCount = 0;
  let hsAjaxRefreshLastError = "";
  let hsConsultaStatusFilterNorm = "";
  let hsConsultaStatusFilterLabel = "";
  const hsRowAlertState = new Map();
  let hsRowAlertPersist = new Map();
  let hsRowAlertPersistLoaded = false;
  let hsRowAlertPersistSaveTimer = null;
  const HS_REQ_CLICK_MARK = "__hsReqClickHandled";
  /**
   * Objetivo: Fecha popup modal de requisiÃ§Ã£o.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: void.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function closeReqPopup() {
    if (!reqPopup) reqPopup = document.getElementById("hs-req-pop");
    if (!reqPopup) return;
    reqPopup.classList.remove("open");
  }
  /**
   * Objetivo: Cria/garante estrutura do popup modal.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: HTMLElement|null (container do popup, quando habilitado).
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function ensureReqPopup() {
    if (!FEATURE_FLAGS.ENABLE_POPUP_VIEWER) return null;
    if (reqPopup && reqPopup.isConnected) return reqPopup;
    reqPopup = document.getElementById("hs-req-pop");
    if (!reqPopup) {
      reqPopup = document.createElement("div");
      reqPopup.id = "hs-req-pop";
      reqPopup.className = "hs-req-pop";
      reqPopup.innerHTML = `
        <div class="hs-req-pop-backdrop"></div>
        <section class="hs-req-pop-card" role="dialog" aria-modal="true" aria-label="Visualizar requisicao">
          <header class="hs-req-pop-head">
            <span>Visualizar requisicao</span>
            <button type="button" class="hs-req-pop-close">Fechar</button>
          </header>
          <iframe class="hs-req-pop-frame" loading="lazy"></iframe>
        </section>
      `;
      document.body.appendChild(reqPopup);

      reqPopup.querySelector(".hs-req-pop-backdrop")?.addEventListener("click", closeReqPopup);
      reqPopup.querySelector(".hs-req-pop-close")?.addEventListener("click", closeReqPopup);
    }

    if (!reqPopupEscBound) {
      document.addEventListener(
        "keydown",
        (ev) => {
          if (ev.key === "Escape") closeReqPopup();
        },
        true
      );
      reqPopupEscBound = true;
    }

    return reqPopup;
  }
  /**
   * Objetivo: Abre popup modal para nÃºmero de requisiÃ§Ã£o.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros:
   * - numero: entrada usada por esta rotina.
   * Retorno: void.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function openReqPopup(numero) {
    if (!numero) return;
    if (!FEATURE_FLAGS.ENABLE_POPUP_VIEWER) {
      openNewTab(numero);
      return;
    }
    const pop = ensureReqPopup();
    if (!pop) return;
    const frame = pop.querySelector(".hs-req-pop-frame");
    if (!frame) return;
    const popupUrl = new URL(`${location.origin}/visualizar_requisicao.php`);
    popupUrl.searchParams.set("numero", String(numero));
    popupUrl.searchParams.set(REQ_POPUP_PREVIEW_QUERY_KEY, "1");
    frame.src = popupUrl.toString();
    pop.classList.add("open");
  }
  /**
   * Objetivo: Exibe notificaÃ§Ã£o temporÃ¡ria de status.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros:
   * - msg: entrada usada por esta rotina.
   * - type: entrada usada por esta rotina.
   * - ms: entrada usada por esta rotina.
   * Retorno: valor utilitario.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function toast(msg, type = "info", ms = 2000) {
    if (!toastWrap) {
      toastWrap = document.createElement("div");
      toastWrap.className = "hs-toast-wrap";
      document.body.appendChild(toastWrap);
    }
    const t = document.createElement("div");
    t.className = `hs-toast ${type}`;
    t.innerHTML = `<span class="dot"></span><span>${msg}</span>`;
    toastWrap.appendChild(t);
    const timer = setTimeout(() => t.remove(), ms);
    t.addEventListener("click", () => {
      clearTimeout(timer);
      t.remove();
    });
    return t;
  }
  /**
   * Objetivo: Verifica se a pagina atual suporta refresh discreto de chamados.
   *
   * Contexto: Evita polling desnecessario em telas sem grade principal.
   * Parametros: nenhum.
   * Retorno: boolean.
   */
  function isAjaxRefreshEligiblePage() {
    if (!FEATURE_FLAGS.ENABLE_AJAX_REFRESH) return false;
    if (!document.body.classList.contains("hs-dashboard-page")) return false;
    const path = String(location.pathname || "").toLowerCase();
    if (!/(dashboard|consulta_requisicao)\.php$/.test(path)) return false;
    return !!document.querySelector("#conteudo table.sortable");
  }
  /**
   * Objetivo: Gera snapshot leve da grade para detectar alteracoes sem recarregar a pagina.
   *
   * Contexto: Base para comparacao entre estado local e resposta remota.
   * Parametros:
   * - rootDoc: documento alvo da leitura.
   * Retorno: objeto com assinatura global e mapa de linhas.
   */
  function buildGridSnapshot(rootDoc = document) {
    const bodies = Array.from(rootDoc.querySelectorAll("#conteudo table.sortable tbody"));
    const lineMap = new Map();
    const numMap = new Map();
    const parts = [];

    bodies.forEach((tbody, tbIdx) => {
      const rowParts = [];
      const rows = Array.from(tbody.querySelectorAll("tr")).filter((tr) => !tr.querySelector("th"));
      rows.forEach((tr, rowIdx) => {
        const numero = String(extractNumero(tr) || `r${tbIdx}_${rowIdx}`);
        const text = String(tr.textContent || "").replace(/\s+/g, " ").trim();
        const sig = `${numero}|${text}`;
        rowParts.push(sig);
        lineMap.set(`${tbIdx}:${numero}`, sig);
        if (/^\d{3,}$/.test(numero) && !numMap.has(numero)) numMap.set(numero, text);
      });
      parts.push(rowParts.join("||"));
    });

    return {
      signature: parts.join("###"),
      lineMap,
      numMap,
    };
  }
  /**
   * Objetivo: Classifica chamados novos e alterados entre dois snapshots.
   *
   * Contexto: Usado para notificar atualizacao e diferenciar tipo de alerta.
   * Parametros:
   * - oldSnap: estado anterior.
   * - newSnap: estado atualizado.
   * Retorno: objeto com listas { newNums, changedNums }.
   */
  function diffGridChanges(oldSnap, newSnap) {
    const newNums = new Set();
    const changed = new Set();

    newSnap.numMap.forEach((newSig, numero) => {
      if (!oldSnap.numMap.has(numero)) {
        newNums.add(numero);
        return;
      }
      const oldSig = oldSnap.numMap.get(numero);
      if (oldSig !== newSig) changed.add(numero);
    });

    return {
      newNums: Array.from(newNums),
      changedNums: Array.from(changed),
    };
  }
  /**
   * Objetivo: Carrega estado persistido dos alertas de chamados (blink/ack).
   *
   * Contexto: Evita piscar repetido entre reloads e mantém ack no navegador.
   * Parametros: nenhum.
   * Retorno: void.
   */
  function ensureRowAlertPersistLoaded() {
    if (hsRowAlertPersistLoaded) return;
    hsRowAlertPersistLoaded = true;
    hsRowAlertPersist = new Map();
    try {
      const raw = String(localStorage.getItem(ROW_ALERT_PERSIST_LS_KEY) || "").trim();
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return;
      const now = Date.now();
      Object.entries(parsed).forEach(([numero, meta]) => {
        if (!/^\d{3,}$/.test(String(numero || "").trim())) return;
        if (!meta || typeof meta !== "object") return;
        const blinkedAt = Number(meta.blinkedAt || 0);
        const ackedAt = Number(meta.ackedAt || 0);
        const updatedAt = Number(meta.updatedAt || Math.max(blinkedAt, ackedAt, 0));
        if (!Number.isFinite(updatedAt) || updatedAt <= 0) return;
        if (now - updatedAt > ROW_ALERT_PERSIST_TTL_MS) return;
        hsRowAlertPersist.set(String(numero), {
          blinkedAt: Number.isFinite(blinkedAt) ? blinkedAt : 0,
          ackedAt: Number.isFinite(ackedAt) ? ackedAt : 0,
          updatedAt,
        });
      });
    } catch {}
  }
  /**
   * Objetivo: Limpa e limita estado persistido dos alertas para evitar crescimento infinito.
   *
   * Contexto: Protege performance e tamanho de localStorage.
   * Parametros: nenhum.
   * Retorno: void.
   */
  function pruneRowAlertPersist() {
    ensureRowAlertPersistLoaded();
    const now = Date.now();
    hsRowAlertPersist.forEach((meta, numero) => {
      const updatedAt = Number(meta?.updatedAt || 0);
      if (!Number.isFinite(updatedAt) || updatedAt <= 0 || now - updatedAt > ROW_ALERT_PERSIST_TTL_MS) {
        hsRowAlertPersist.delete(numero);
      }
    });
    if (hsRowAlertPersist.size <= ROW_ALERT_PERSIST_MAX_ITEMS) return;
    const entries = Array.from(hsRowAlertPersist.entries()).sort(
      (a, b) => Number(b?.[1]?.updatedAt || 0) - Number(a?.[1]?.updatedAt || 0)
    );
    hsRowAlertPersist = new Map(entries.slice(0, ROW_ALERT_PERSIST_MAX_ITEMS));
  }
  /**
   * Objetivo: Agenda persistencia de estado de alertas em lote curto.
   *
   * Contexto: Reduz escrita excessiva em localStorage.
   * Parametros: nenhum.
   * Retorno: void.
   */
  function scheduleRowAlertPersistSave() {
    if (hsRowAlertPersistSaveTimer) clearTimeout(hsRowAlertPersistSaveTimer);
    hsRowAlertPersistSaveTimer = setTimeout(() => {
      hsRowAlertPersistSaveTimer = null;
      try {
        pruneRowAlertPersist();
        const payload = {};
        hsRowAlertPersist.forEach((meta, numero) => {
          payload[numero] = {
            blinkedAt: Number(meta?.blinkedAt || 0) || 0,
            ackedAt: Number(meta?.ackedAt || 0) || 0,
            updatedAt: Number(meta?.updatedAt || 0) || 0,
          };
        });
        localStorage.setItem(ROW_ALERT_PERSIST_LS_KEY, JSON.stringify(payload));
      } catch {}
    }, 140);
  }
  /**
   * Objetivo: Recupera metadados persistidos de um chamado.
   *
   * Contexto: Utilizado para decidir se pode piscar novamente.
   * Parametros:
   * - numero: identificador do chamado.
   * Retorno: object|null.
   */
  function getPersistedRowAlertMeta(numero) {
    const reqNum = String(numero || "").trim();
    if (!/^\d{3,}$/.test(reqNum)) return null;
    ensureRowAlertPersistLoaded();
    return hsRowAlertPersist.get(reqNum) || null;
  }
  /**
   * Objetivo: Marca que o chamado ja recebeu animacao de blink.
   *
   * Contexto: Evita piscar repetido entre refresh e recarga da pagina.
   * Parametros:
   * - numero: identificador do chamado.
   * Retorno: void.
   */
  function markRowAlertBlinked(numero) {
    const reqNum = String(numero || "").trim();
    if (!/^\d{3,}$/.test(reqNum)) return;
    const now = Date.now();
    const prev = getPersistedRowAlertMeta(reqNum) || {};
    hsRowAlertPersist.set(reqNum, {
      blinkedAt: now,
      ackedAt: Number(prev.ackedAt || 0) || 0,
      updatedAt: now,
    });
    scheduleRowAlertPersistSave();
  }
  /**
   * Objetivo: Marca chamado como reconhecido (nao reaplicar alerta "new" automaticamente).
   *
   * Contexto: Chamado quando usuario abre/interage com o ticket.
   * Parametros:
   * - numero: identificador do chamado.
   * Retorno: void.
   */
  function markRowAlertAcknowledged(numero) {
    const reqNum = String(numero || "").trim();
    if (!/^\d{3,}$/.test(reqNum)) return;
    const now = Date.now();
    const prev = getPersistedRowAlertMeta(reqNum) || {};
    hsRowAlertPersist.set(reqNum, {
      blinkedAt: Number(prev.blinkedAt || 0) || now,
      ackedAt: now,
      updatedAt: now,
    });
    scheduleRowAlertPersistSave();
  }
  /**
   * Objetivo: Informa se chamado ja foi reconhecido pelo usuario nesta janela persistida.
   *
   * Contexto: Usado para evitar re-alertar "Nova" continuamente.
   * Parametros:
   * - numero: identificador do chamado.
   * Retorno: boolean.
   */
  function isRowAlertAcknowledged(numero) {
    const meta = getPersistedRowAlertMeta(numero);
    return !!(meta && Number(meta.ackedAt || 0) > 0);
  }
  /**
   * Objetivo: Informa se chamado ja executou blink alguma vez no navegador.
   *
   * Contexto: Controle do "piscar uma vez".
   * Parametros:
   * - numero: identificador do chamado.
   * Retorno: boolean.
   */
  function hasRowAlertBlinked(numero) {
    const meta = getPersistedRowAlertMeta(numero);
    return !!(meta && Number(meta.blinkedAt || 0) > 0);
  }
  /**
   * Objetivo: Limpa alertas expirados e retorna timestamp atual.
   *
   * Contexto: Evita crescimento de estado em sessao longa.
   * Parametros: nenhum.
   * Retorno: number (timestamp atual em ms).
   */
  function cleanupRowAlertState() {
    const now = Date.now();
    hsRowAlertState.forEach((meta, numero) => {
      if (!meta || !Number.isFinite(meta.expiresAt) || meta.expiresAt > now) return;
      hsRowAlertState.delete(numero);
    });
    return now;
  }
  /**
   * Objetivo: Registra alertas de linha para novos/alterados.
   *
   * Contexto: Mantem bolinha e janela de piscar por tempo controlado.
   * Parametros:
   * - nums: lista de numeros.
   * - kind: "new" ou "changed".
   * - blink: habilita/desabilita animacao inicial.
   * Retorno: void.
   */
  function registerRowAlerts(nums, kind, blink = true) {
    if (!Array.isArray(nums) || !nums.length) return;
    if (kind !== "new" && kind !== "changed") return;
    ensureRowAlertPersistLoaded();
    const now = cleanupRowAlertState();
    nums.forEach((nRaw) => {
      const numero = String(nRaw || "").trim();
      if (!/^\d{3,}$/.test(numero)) return;
      if (kind === "new" && isRowAlertAcknowledged(numero)) return;

      const prev = hsRowAlertState.get(numero) || null;
      const type = kind === "new" || !prev ? kind : prev.type;
      const shouldBlinkNow = !!blink && !hasRowAlertBlinked(numero);
      if (shouldBlinkNow) markRowAlertBlinked(numero);
      hsRowAlertState.set(numero, {
        type,
        blinkUntil: shouldBlinkNow ? now + ROW_ALERT_BLINK_MS : Math.max(prev?.blinkUntil || 0, now),
        expiresAt: now + ROW_ALERT_TTL_MS,
      });
    });
  }
  /**
   * Objetivo: Renderiza bolinhas e animacoes de alerta na grade.
   *
   * Contexto: Chamado apos refresh e reaplicacoes de layout.
   * Parametros: nenhum.
   * Retorno: void.
   */
  function renderRowAlerts() {
    const now = cleanupRowAlertState();
    document.querySelectorAll("#conteudo table.sortable tbody tr").forEach((tr) => {
      const numero = String(extractNumero(tr) || "").trim();
      const meta = hsRowAlertState.get(numero) || null;
      const firstCell = tr.cells?.[0];
      const dot = firstCell?.querySelector(".hs-row-state-dot");

      if (!meta || !(firstCell instanceof HTMLTableCellElement)) {
        tr.classList.remove("hs-row-alert", "hs-row-flag-new", "hs-row-flag-changed", "hs-row-blink-new", "hs-row-blink-changed");
        if (dot) dot.remove();
        return;
      }

      const isNew = meta.type === "new";
      const shouldBlink = meta.blinkUntil > now;
      tr.classList.add("hs-row-alert");
      tr.classList.toggle("hs-row-flag-new", isNew);
      tr.classList.toggle("hs-row-flag-changed", !isNew);
      tr.classList.toggle("hs-row-blink-new", isNew && shouldBlink);
      tr.classList.toggle("hs-row-blink-changed", !isNew && shouldBlink);

      let stateDot = dot;
      if (!(stateDot instanceof HTMLElement)) {
        stateDot = document.createElement("span");
        stateDot.className = "hs-row-state-dot";
        firstCell.appendChild(stateDot);
      }
      stateDot.classList.toggle("is-new", isNew);
      stateDot.classList.toggle("is-changed", !isNew);
      stateDot.title = isNew ? "Chamado novo" : "Chamado com alteracao";
    });
  }
  /**
   * Objetivo: Marca como novos os chamados em situacao "Nova" ainda sem alerta.
   *
   * Contexto: Permite sinalizacao mesmo antes do primeiro ciclo de refresh AJAX.
   * Parametros: nenhum.
   * Retorno: void.
   */
  function registerCurrentNovaRows() {
    if (!isAjaxRefreshEligiblePage()) return;
    const novas = [];
    document.querySelectorAll("#conteudo table.sortable").forEach((table) => {
      const ths = Array.from(table.tHead?.rows?.[0]?.cells || []);
      const idxSituacao = ths.findIndex((th) => SITUACAO_RX.test(th.textContent || ""));
      if (idxSituacao < 0) return;

      Array.from(table.tBodies?.[0]?.rows || []).forEach((tr) => {
        if (!(tr instanceof HTMLTableRowElement)) return;
        const tdSit = tr.cells[idxSituacao];
        if (!(tdSit instanceof HTMLTableCellElement)) return;
        const situacao = norm(getSituacaoCellText(tdSit));
        if (!NOVA_RX.test(situacao)) return;
        const numero = String(extractNumero(tr) || "").trim();
        if (!/^\d{3,}$/.test(numero)) return;
        if (hsRowAlertState.has(numero)) return;
        if (isRowAlertAcknowledged(numero)) return;
        novas.push(numero);
      });
    });
    registerRowAlerts(novas, "new", true);
  }
  /**
   * Objetivo: Remove alerta de um chamado quando ele ja foi visualizado/acionado.
   *
   * Contexto: Mantem a grade organizada com foco apenas no que ainda precisa atencao.
   * Parametros:
   * - numero: numero do chamado.
   * Retorno: void.
   */
  function acknowledgeRowAlert(numero) {
    const reqNum = String(numero || "").trim();
    if (!/^\d{3,}$/.test(reqNum)) return;
    markRowAlertAcknowledged(reqNum);
    if (!hsRowAlertState.has(reqNum)) return;
    hsRowAlertState.delete(reqNum);
    renderRowAlerts();
  }
  /**
   * Objetivo: Reaplica apenas os ajustes essenciais da grade apos refresh AJAX.
   *
   * Contexto: Substitui safeRun completo para reduzir custo e evitar lentidao.
   * Parametros: nenhum.
   * Retorno: void.
   */
  function runPostAjaxGridRefreshLightPass() {
    markServiceRows();
    tagDashboardGridColumns();
    signalExternalReturnSlaRules();
    applyDashboardEmServicoSectionVisibility();
    registerCurrentNovaRows();
    renderRowAlerts();
    ensureCountBadges();
    ensureConsultaPrimeiroAtendimentoButtons();
    bindRowAndLogoClicks();
    normalizeDashboardTableWidths();
    ensureConsultaProLayout();
  }
  /**
   * Objetivo: Atualiza a grade de chamados via fetch remoto sem F5.
   *
   * Contexto: Polling leve e idempotente para dashboard/consulta.
   * Parametros: nenhum.
   * Retorno: Promise<void>.
   */
  async function runAjaxGridRefresh() {
    if (hsAjaxRefreshBusy) return;
    if (!isAjaxRefreshEligiblePage()) return;
    if (document.hidden) return;

    const active = document.activeElement;
    if (active && /^(input|textarea|select)$/i.test(active.tagName)) return;

    const markSuccess = (newCount = 0, changedCount = 0) => {
      const now = Date.now();
      hsAjaxRefreshLastAt = now;
      hsAjaxRefreshLastNewCount = Math.max(0, Number(newCount) || 0);
      hsAjaxRefreshLastChangedCount = Math.max(0, Number(changedCount) || 0);
      hsAjaxRefreshLastError = "";
      hsAjaxRefreshNextAt = now + AJAX_REFRESH_INTERVAL_MS;
    };
    const markFailure = (errorMessage = "") => {
      const now = Date.now();
      hsAjaxRefreshLastError = String(errorMessage || "Falha no refresh da grade.").trim();
      hsAjaxRefreshNextAt = now + AJAX_REFRESH_INTERVAL_MS;
    };

    hsAjaxRefreshBusy = true;
    hsAjaxRefreshNextAt = 0;
    refreshConsultaProLayoutPanelMounted();
    try {
      const beforeSnap = buildGridSnapshot(document);
      if (!hsAjaxLastSignature) hsAjaxLastSignature = beforeSnap.signature;

      const url = new URL(location.href);
      url.searchParams.set("_hs_ajax", String(Date.now()));

      const resp = await fetch(url.toString(), { credentials: "include", cache: "no-store" });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      const html = await resp.text();
      const parsed = new DOMParser().parseFromString(html, "text/html");
      const remoteSnap = buildGridSnapshot(parsed);
      if (!remoteSnap.signature) {
        markSuccess(0, 0);
        return;
      }
      if (remoteSnap.signature === hsAjaxLastSignature) {
        markSuccess(0, 0);
        return;
      }

      const localBodies = Array.from(document.querySelectorAll("#conteudo table.sortable tbody"));
      const remoteBodies = Array.from(parsed.querySelectorAll("#conteudo table.sortable tbody"));
      if (!localBodies.length || !remoteBodies.length) {
        hsAjaxLastSignature = remoteSnap.signature;
        markSuccess(0, 0);
        return;
      }

      const total = Math.min(localBodies.length, remoteBodies.length);
      for (let i = 0; i < total; i++) {
        if (localBodies[i].innerHTML === remoteBodies[i].innerHTML) continue;
        localBodies[i].innerHTML = remoteBodies[i].innerHTML;
      }

      hsAjaxLastSignature = remoteSnap.signature;
      const { newNums, changedNums } = diffGridChanges(beforeSnap, remoteSnap);
      registerRowAlerts(newNums, "new", true);
      registerRowAlerts(changedNums, "changed", true);
      renderRowAlerts();

      const totalAlterados = newNums.length + changedNums.length;
      if (totalAlterados) {
        const now = Date.now();
        if (now - hsAjaxLastToastAt >= AJAX_REFRESH_TOAST_COOLDOWN_MS) {
          hsAjaxLastToastAt = now;
          const partes = [];
          if (newNums.length) partes.push(`${newNums.length} novo${newNums.length > 1 ? "s" : ""}`);
          if (changedNums.length) partes.push(`${changedNums.length} alterado${changedNums.length > 1 ? "s" : ""}`);
          toast(`Atualizacao: ${partes.join(" e ")}.`, "soft", 3000);
        }
      }

      markSuccess(newNums.length, changedNums.length);
      runPostAjaxGridRefreshLightPass();
    } catch (err) {
      console.warn("[HeadsoftHelper] Falha no refresh AJAX discreto:", err);
      markFailure(err?.message || err);
    } finally {
      hsAjaxRefreshBusy = false;
      refreshConsultaProLayoutPanelMounted();
    }
  }
  /**
   * Objetivo: Inicializa polling da grade para atualizacao automatica discreta.
   *
   * Contexto: Iniciado apenas uma vez por pagina.
   * Parametros: nenhum.
   * Retorno: void.
   */
  function ensureAjaxGridRefresh() {
    if (!isAjaxRefreshEligiblePage()) return;
    if (document.documentElement.dataset.hsAjaxRefreshBound === "1") return;
    document.documentElement.dataset.hsAjaxRefreshBound = "1";
    hsAjaxLastSignature = buildGridSnapshot(document).signature;
    const now = Date.now();
    hsAjaxRefreshLastAt = now;
    hsAjaxRefreshLastNewCount = 0;
    hsAjaxRefreshLastChangedCount = 0;
    hsAjaxRefreshLastError = "";
    hsAjaxRefreshNextAt = now + AJAX_REFRESH_INTERVAL_MS;
    refreshConsultaProLayoutPanelMounted();

    hsAjaxRefreshTimer = window.setInterval(() => {
      if (!hsAjaxRefreshBusy) hsAjaxRefreshNextAt = Date.now() + AJAX_REFRESH_INTERVAL_MS;
      runAjaxGridRefresh();
    }, AJAX_REFRESH_INTERVAL_MS);

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) runAjaxGridRefresh();
    });
    window.addEventListener("focus", () => runAjaxGridRefresh());
  }
  /**
   * Objetivo: Formata data para YYYY-MM-DD.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros:
   * - d: entrada usada por esta rotina.
   * Retorno: valor utilitario.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function yyyymmdd(d = new Date()) {
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  }
  /**
   * Objetivo: Serializa objeto para application/x-www-form-urlencoded.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros:
   * - obj: entrada usada por esta rotina.
   * Retorno: valor utilitario.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function formBody(obj) {
    return Object.entries(obj)
      .map(([k, v]) => encodeURIComponent(k) + "=" + encodeURIComponent(v ?? ""))
      .join("&");
  }
  /**
   * Objetivo: Envia 1Âº atendimento para o backend legado.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros:
   * - numero: entrada usada por esta rotina.
   * - tr: entrada usada por esta rotina.
   * - idxSituacao: entrada usada por esta rotina.
   * Retorno: Promise<boolean>.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  async function enviarPrimeiroAtendimento(numero, tr, idxSituacao) {
    if (!(tr instanceof HTMLTableRowElement)) return false;

    const TEXTO = `Prezado(a),\nInformamos que sua solicitacao foi recebida por nossa equipe de suporte e esta sendo analisada com atencao. Caso surjam duvidas ou necessitemos de informacoes adicionais, entraremos em contato antes de prosseguir com o atendimento.\nAgradecemos seu contato e em breve retornaremos com uma resposta.\nAtenciosamente,\nEquipe de Suporte.`;

    const url = new URL("db_update_requisicao.php", location.href).toString();
    const body = {
      IdRequisicao: String(numero),
      Previsao_Conclusao: yyyymmdd(),
      IdAcao_Requisicao: "1",
      Minutos_Consumo: "",
      Acompanhamento: TEXTO,
    };

    const t = toast(`Enviando 1o atendimento (#${numero})...`, "info", 60000);
    tr.dataset.hsSending = "1";
    try {
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
        credentials: "include",
        body: formBody(body),
      });
      const txt = await r.text();
      if (!r.ok || txt.trim() !== "#UPDATED") throw new Error(txt || `HTTP ${r.status}`);

      const td = tr.cells[idxSituacao];
      const div = td?.querySelector(".Situacao");
      if (div) div.textContent = "1o atendimento";
      else if (td) td.textContent = "1o atendimento";
      td?.querySelector(".hs-first-att-wrap")?.remove();
      hsDashboardNovasRemoteState.fetched = false;
      hsDashboardNovasRemoteState.loading = false;
      hsDashboardNovasRemoteState.rowsHtml = [];

      t.classList.remove("info");
      t.classList.add("ok");
      t.querySelector("span:last-child").textContent = `1o atendimento enviado (#${numero})`;
      setTimeout(() => t.remove(), 2200);
      return true;
    } catch (e) {
      console.error("[HeadsoftHelper] Falha ao enviar 1o atendimento:", e);
      t.classList.remove("info");
      t.classList.add("err");
      t.querySelector("span:last-child").textContent = `Falha ao enviar (#${numero})`;
      setTimeout(() => t.remove(), 4200);
      return false;
    } finally {
      delete tr.dataset.hsSending;
    }
  }

  /* -------------------- SECTION: NAVEGACAO E INTERACOES ---------------------- */
  /**
   * Objetivo: Extrai nÃºmero da requisiÃ§Ã£o a partir da linha da grade.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros:
   * - tr: entrada usada por esta rotina.
   * Retorno: valor calculado.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function extractNumero(tr) {
    if (!tr) return null;

    // 1) Mais confiavel: link com parametro numero=12345
    for (const a of Array.from(tr.querySelectorAll("a[href], area[href]"))) {
      const href = a.getAttribute("href") || "";
      const mHref = href.match(/(?:\?|&)numero=(\d{3,})/i);
      if (mHref) return mHref[1];
    }

    // 2) Alguns legados usam onclick com a URL
    const onClick = tr.getAttribute("onclick") || "";
    const mOnClick = onClick.match(/numero=(\d{3,})/i);
    if (mOnClick) return mOnClick[1];

    const tds = Array.from(tr.cells || []);

    // 3) Prioriza colunas iniciais (# geralmente fica no indice 1)
    const preferIdx = [1, 0, 2];
    for (const idx of preferIdx) {
      const txt = (tds[idx]?.textContent || "").trim();
      if (!txt) continue;
      const m = txt.match(/\b\d{3,}\b/);
      if (!m) continue;
      const n = m[0];
      if (n.length === 4) {
        const y = parseInt(n, 10);
        if (y >= 1900 && y <= 2100) continue; // evita pegar ano
      }
      return n;
    }

    // 4) Fallback em qualquer celula sem padrao de data/hora
    for (const td of tds) {
      const txt = (td.textContent || "").trim();
      if (!txt) continue;
      if (/[/:]/.test(txt)) continue;
      const m = txt.match(/\b\d{3,}\b/);
      if (!m) continue;
      const n = m[0];
      if (n.length === 4) {
        const y = parseInt(n, 10);
        if (y >= 1900 && y <= 2100) continue;
      }
      return n;
    }

    // 5) Ultimo recurso: texto da linha (somente 5+ digitos)
    const all = ((tr.textContent || "").replace(/\s+/g, " ").match(/\b\d{5,}\b/g) || [])[0];
    return all || null;
  }
  /**
   * Objetivo: Abre requisiÃ§Ã£o em nova guia com fallback seguro.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros:
   * - numero: entrada usada por esta rotina.
   * Retorno: void.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function openNewTab(numero) {
    const reqNum = String(numero || "").trim();
    if (!reqNum) {
      traceReqOpen("openNewTab.skip.empty", { numero: String(numero || "") });
      return;
    }
    traceReqOpen("openNewTab.request", { numero: reqNum });
    if (shouldSkipDuplicateReqOpen(reqNum)) {
      traceReqOpen("openNewTab.skip.dedup", { numero: reqNum });
      return;
    }
    const href = `${location.origin}/visualizar_requisicao.php?numero=${encodeURIComponent(reqNum)}`;
    try {
      const w = window.open(href, "_blank", "noopener");
      traceReqOpen("openNewTab.window.open", {
        numero: reqNum,
        href,
        opened: !!w,
      });
      if (w) return;
      // Em alguns ambientes de userscript, window.open pode abrir a guia e
      // ainda assim retornar null; fallback por <a>.click() duplicaria a abertura.
      traceReqOpen("openNewTab.window.noHandle", { numero: reqNum, href });
      return;
    } catch (err) {
      traceReqOpen("openNewTab.window.error", {
        numero: reqNum,
        href,
        error: String(err?.message || err || "erro-desconhecido"),
      });
    }
  }
  /**
   * Objetivo: Bloqueia aberturas duplicadas da mesma requisiÃ§Ã£o em curto intervalo.
   *
   * Contexto: Evita duas guias quando houver mais de um listener ativo para o mesmo clique.
   * Parametros:
   * - numero: entrada usada por esta rotina.
   * Retorno: boolean (true quando deve ignorar tentativa duplicada).
   * Efeitos colaterais: grava estado leve em window para deduplicacao temporal.
   */
  function shouldSkipDuplicateReqOpen(numero) {
    const reqNum = String(numero || "").trim();
    if (!reqNum) {
      traceReqOpen("dedup.skip.empty", { numero: String(numero || "") });
      return true;
    }

    const DEDUP_KEY = "__hsReqOpenDedup";
    const now = Date.now();
    const WINDOW_MS = 1400;
    const root = document.documentElement;

    // Camada 1 (compartilhada): dataset no <html> cobre multiplas instancias/contextos.
    const dsNum = String(root?.dataset?.hsReqOpenNum || "").trim();
    const dsAt = Number(root?.dataset?.hsReqOpenAt || 0);
    const dsDelta = Number.isFinite(dsAt) ? now - dsAt : -1;
    const isDatasetDuplicate = dsNum === reqNum && Number.isFinite(dsAt) && dsDelta < WINDOW_MS;
    if (root?.dataset) {
      root.dataset.hsReqOpenNum = reqNum;
      root.dataset.hsReqOpenAt = String(now);
    }
    if (isDatasetDuplicate) {
      traceReqOpen("dedup.block.dataset", {
        numero: reqNum,
        lastNumero: dsNum,
        deltaMs: dsDelta,
        windowMs: WINDOW_MS,
      });
      return true;
    }

    // Camada 2 (local): protege dentro da mesma instancia.
    let last = null;
    try {
      last = window[DEDUP_KEY] || null;
    } catch {}

    const lastNumero = String(last?.numero || "").trim();
    const lastAt = Number(last?.at || 0);
    const localDelta = Number.isFinite(lastAt) ? now - lastAt : -1;
    const isDuplicate = lastNumero === reqNum && Number.isFinite(lastAt) && localDelta < WINDOW_MS;

    try {
      window[DEDUP_KEY] = { numero: reqNum, at: now };
    } catch {}

    traceReqOpen(isDuplicate ? "dedup.block.local" : "dedup.allow", {
      numero: reqNum,
      lastNumero,
      deltaMs: localDelta,
      windowMs: WINDOW_MS,
    });
    return isDuplicate;
  }
  /**
   * Objetivo: Configura cliques de produtividade em linha/logo.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: void.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function bindRowAndLogoClicks() {
    if (hsReqClicksBound) return;
    if (/visualizar_requisicao\.php/i.test(location.pathname)) return;
    if (document.documentElement.dataset.hsReqClicksBound === "1") {
      hsReqClicksBound = true;
      return;
    }
    hsReqClicksBound = true;
    document.documentElement.dataset.hsReqClicksBound = "1";
    traceReqOpen("bindRowAndLogoClicks.bound", { force: true, path: String(location.pathname || "") });

    const getTargetElement = (target) => {
      if (target instanceof Element) return target;
      return target && target.parentElement ? target.parentElement : null;
    };

    const getRowFromTarget = (target) => {
      const el = getTargetElement(target);
      if (!el) return null;
      const tr = el.closest("table.sortable tr");
      if (!tr) return null;
      if (tr.closest("thead")) return null;
      if (tr.querySelector("th")) return null;
      return tr;
    };

    const isInteractiveTarget = (el) => {
      if (!(el instanceof Element)) return false;
      return !!el.closest(
        "a[href], area[href], button, input, select, textarea, label, summary, [contenteditable='true'], [role='button'], [role='link']"
      );
    };
    const getNumeroFromHref = (href) => {
      try {
        const abs = new URL(String(href || ""), location.href);
        return String(abs.searchParams.get("numero") || "").trim();
      } catch {
        return "";
      }
    };
    const traceClickFlow = (eventName, ev, targetEl, numero, extra = {}) => {
      traceReqOpen(eventName, {
        numero: String(numero || "").trim(),
        button: Number(ev?.button ?? -1),
        ctrlKey: !!ev?.ctrlKey,
        metaKey: !!ev?.metaKey,
        defaultPrevented: !!ev?.defaultPrevented,
        marked: !!ev?.[HS_REQ_CLICK_MARK],
        isTrusted: !!ev?.isTrusted,
        targetTag: String(targetEl?.tagName || ""),
        ...extra,
      });
    };

    const getSituacaoIdx = (table) => {
      if (!(table instanceof HTMLTableElement)) return -1;
      const cached = table.dataset.hsSitIdx;
      if (cached && /^-?\d+$/.test(cached)) return parseInt(cached, 10);
      const ths = Array.from(table.tHead?.rows?.[0]?.cells || []);
      const idx = ths.findIndex((th) => SITUACAO_RX.test(th.textContent || ""));
      table.dataset.hsSitIdx = String(idx);
      return idx;
    };

    if (document.documentElement.dataset.hsReqClickSnifferBound !== "1") {
      const captureTrace = (ev) => {
        if (!isReqOpenDebugEnabled()) return;
        const targetEl = getTargetElement(ev.target);
        if (!targetEl) return;
        const tr = targetEl.closest("table.sortable tr");
        const logo = targetEl.closest('img[src*="headsoft16"]');
        const link = targetEl.closest('a[href*="visualizar_requisicao.php"]');
        if (!tr && !logo && !link) return;
        const numero = tr ? extractNumero(tr) : getNumeroFromHref(link?.getAttribute("href") || "");
        traceClickFlow(`capture.${ev.type}`, ev, targetEl, numero, {
          hasRow: !!tr,
          hasLogo: !!logo,
          hasReqLink: !!link,
        });
      };
      document.addEventListener("click", captureTrace, true);
      document.addEventListener("auxclick", captureTrace, true);
      document.documentElement.dataset.hsReqClickSnifferBound = "1";
    }

    document.addEventListener(
      "click",
      (ev) => {
        if (ev.button !== 0) return;
        if (ev.defaultPrevented) {
          traceClickFlow("click.skip.defaultPrevented", ev, getTargetElement(ev.target), "");
          return;
        }
        if (ev[HS_REQ_CLICK_MARK]) {
          traceClickFlow("click.skip.alreadyMarked", ev, getTargetElement(ev.target), "");
          return;
        }
        const targetEl = getTargetElement(ev.target);
        if (!targetEl) return;
        if (targetEl.closest(".hs-first-att-btn")) {
          traceClickFlow("click.skip.firstAttButton", ev, targetEl, "");
          return;
        }

        const logo = targetEl.closest('img[src*="headsoft16"]');
        if (logo) {
          const tr = logo.closest("tr");
          const num = tr ? extractNumero(tr) : null;
          if (!tr || !num) {
            traceClickFlow("click.logo.skip.noNumero", ev, targetEl, String(num || ""));
            return;
          }

          ev.preventDefault();
          ev.stopPropagation();
          ev.stopImmediatePropagation();
          ev[HS_REQ_CLICK_MARK] = true;
          traceClickFlow("click.logo.handle", ev, targetEl, num);
          acknowledgeRowAlert(num);

          const previewOnly = isPreviewOnlyModeEnabled();
          if (previewOnly || ev.ctrlKey || ev.metaKey) {
            traceClickFlow("click.logo.popup", ev, targetEl, num, { previewOnly });
            openReqPopup(num);
            return;
          }

          const table = tr.closest("table.sortable");
          const idxSituacao = getSituacaoIdx(table);
          const sitNow = idxSituacao >= 0 ? getSituacaoCellText(tr.cells[idxSituacao]) : "";
          if (idxSituacao >= 0 && NOVA_RX.test(sitNow) && tr.dataset.hsSending !== "1") {
            traceClickFlow("click.logo.primeiroAtendimento", ev, targetEl, num, { situacao: sitNow });
            enviarPrimeiroAtendimento(num, tr, idxSituacao);
            return;
          }

          if (shouldSkipDuplicateReqOpen(num)) {
            traceClickFlow("click.logo.skip.dedup", ev, targetEl, num);
            return;
          }
          const href = `${location.origin}/visualizar_requisicao.php?numero=${encodeURIComponent(num)}`;
          traceClickFlow("click.logo.openSelf", ev, targetEl, num, { href });
          window.open(href, "_self");
          return;
        }

        if (isInteractiveTarget(targetEl)) {
          const hrefNum = getNumeroFromHref(targetEl.closest("a[href]")?.getAttribute("href") || "");
          traceClickFlow("click.skip.interactiveTarget", ev, targetEl, hrefNum);
          return;
        }

        const tr = getRowFromTarget(targetEl);
        if (!tr) {
          traceClickFlow("click.skip.noRow", ev, targetEl, "");
          return;
        }
        const num = extractNumero(tr);
        if (!num) {
          traceClickFlow("click.row.skip.noNumero", ev, targetEl, "");
          return;
        }

        ev.preventDefault();
        ev.stopPropagation();
        ev.stopImmediatePropagation();
        ev[HS_REQ_CLICK_MARK] = true;
        traceClickFlow("click.row.handle", ev, targetEl, num);
        acknowledgeRowAlert(num);

        const previewOnly = isPreviewOnlyModeEnabled();
        if (previewOnly || ev.ctrlKey || ev.metaKey) {
          traceClickFlow("click.row.popup", ev, targetEl, num, { previewOnly });
          openReqPopup(num);
          return;
        }

        traceClickFlow("click.row.openNewTab", ev, targetEl, num);
        openNewTab(num);
      },
      true
    );

    document.addEventListener(
      "auxclick",
      (ev) => {
        if (ev.button !== 1) return;
        if (ev.defaultPrevented) {
          traceClickFlow("auxclick.skip.defaultPrevented", ev, getTargetElement(ev.target), "");
          return;
        }
        if (ev[HS_REQ_CLICK_MARK]) {
          traceClickFlow("auxclick.skip.alreadyMarked", ev, getTargetElement(ev.target), "");
          return;
        }
        const targetEl = getTargetElement(ev.target);
        if (!targetEl) return;
        if (targetEl.closest(".hs-first-att-btn")) {
          traceClickFlow("auxclick.skip.firstAttButton", ev, targetEl, "");
          return;
        }

        const logo = targetEl.closest('img[src*="headsoft16"]');
        if (logo) {
          const tr = logo.closest("tr");
          const num = tr ? extractNumero(tr) : "";
          if (!tr || !num) {
            traceClickFlow("auxclick.logo.skip.noNumero", ev, targetEl, num);
            return;
          }
          ev.preventDefault();
          ev.stopPropagation();
          ev.stopImmediatePropagation();
          ev[HS_REQ_CLICK_MARK] = true;
          acknowledgeRowAlert(num);
          const previewOnly = isPreviewOnlyModeEnabled();
          if (previewOnly) {
            traceClickFlow("auxclick.logo.popup", ev, targetEl, num, { previewOnly });
            openReqPopup(num);
            return;
          }
          traceClickFlow("auxclick.logo.openNewTab", ev, targetEl, num);
          openNewTab(num);
          return;
        }

        if (isInteractiveTarget(targetEl)) {
          const hrefNum = getNumeroFromHref(targetEl.closest("a[href]")?.getAttribute("href") || "");
          traceClickFlow("auxclick.skip.interactiveTarget", ev, targetEl, hrefNum);
          return;
        }

        const tr = getRowFromTarget(targetEl);
        if (!tr) {
          traceClickFlow("auxclick.skip.noRow", ev, targetEl, "");
          return;
        }
        const num = extractNumero(tr);
        if (!num) {
          traceClickFlow("auxclick.row.skip.noNumero", ev, targetEl, "");
          return;
        }

        ev.preventDefault();
        ev.stopPropagation();
        ev.stopImmediatePropagation();
        ev[HS_REQ_CLICK_MARK] = true;
        acknowledgeRowAlert(num);
        const previewOnly = isPreviewOnlyModeEnabled();
        if (previewOnly) {
          traceClickFlow("auxclick.row.popup", ev, targetEl, num, { previewOnly });
          openReqPopup(num);
          return;
        }
        traceClickFlow("auxclick.row.openNewTab", ev, targetEl, num);
        openNewTab(num);
      },
      true
    );
  }

  /* ------------------- SECTION: DIAGNOSTICO E SELF-CHECK -------------------- */
  /**
   * Objetivo: Valida seletores crÃ­ticos para detectar mudanÃ§as do HTML legado.
   *
   * Contexto: Executa apenas quando FEATURE_FLAGS.ENABLE_DEBUG_SELF_CHECK=true.
   * Parametros: nenhum.
   * Retorno: void.
   * Efeitos colaterais: emite avisos no console; nao altera comportamento funcional.
   */
  function runSelfCheck() {
    if (!FEATURE_FLAGS.ENABLE_DEBUG_SELF_CHECK) return;

    const warn = (msg) => console.warn(`[HeadsoftHelper][self-check] ${msg}`);
    const has = (selector) => !!document.querySelector(selector);
    const path = String(location.pathname || "").toLowerCase();

    if (/dashboard\.php/.test(path)) {
      if (!has("table.sortable")) warn("Dashboard sem table.sortable.");
      if (!has('form[name=\"filtros\"]')) warn("Dashboard sem formulario de filtros.");
    }

    if (/consulta_requisicao\.php/.test(path)) {
      if (!has("table.sortable")) warn("Consulta de requisicoes sem grade principal.");
    }

    if (/visualizar_requisicao\.php/.test(path)) {
      if (!has("#interno")) warn("Visualizar requisicao sem #interno.");
      if (!has("select[name='IdAcao_Requisicao'], select#IdAcao_Requisicao")) {
        warn("Formulario sem select de acao (IdAcao_Requisicao).");
      }
      if (!has("textarea[name='Acompanhamento'], textarea.acomp_descricao, textarea")) {
        warn("Formulario sem textarea de acompanhamento.");
      }
      if (!has(".requisicao_top")) warn("Topo da requisicao (.requisicao_top) ausente.");
    }

    if (/consulta_usuario\.php/.test(path)) {
      if (!has("table")) warn("Consulta de usuarios sem tabela.");
    }

    if (/visualizar_usuario\.php/.test(path)) {
      if (!has("#conteudo form")) warn("Visualizar usuario sem formulario principal.");
    }
  }
  /**
   * Objetivo: Health-check enxuto para alertar quebras de seletores criticos.
   *
   * Contexto: Executa uma vez por pagina e nao depende de feature flag.
   * Parametros: nenhum.
   * Retorno: void.
   * Efeitos colaterais: emite warnings pontuais no console quando faltam alvos essenciais.
   */
  function runHealthCheckOnce() {
    const root = document.documentElement;
    if (!(root instanceof HTMLElement)) return;
    if (root.dataset.hsHealthChecked === "1") return;
    root.dataset.hsHealthChecked = "1";

    const path = String(location.pathname || "").toLowerCase();
    const warn = (msg) => console.warn(`[HeadsoftHelper][health] ${msg}`);
    const has = (selector) => !!document.querySelector(selector);

    if (/(dashboard|consulta_requisicao)\.php/.test(path)) {
      if (!has("table.sortable")) warn("Grade principal nao encontrada.");
      if (!has("#conteudo")) warn("Container #conteudo nao encontrado.");
    }
    if (/visualizar_requisicao\.php/.test(path)) {
      if (!has("#interno")) warn("Container #interno nao encontrado.");
      if (!has("textarea")) warn("Campo de acompanhamento nao encontrado.");
      if (!has("input[type='file']")) warn("Campo de anexo nao encontrado.");
    }
    if (/consulta_usuario\.php/.test(path) && !has("table")) {
      warn("Tabela da consulta de usuarios nao encontrada.");
    }
  }

  /* -------------------- SECTION: BOOTSTRAP E ORQUESTRACAO -------------------- */
  /**
   * Objetivo: Executa etapa com proteÃ§Ã£o de erro isolada.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros:
   * - fn: entrada usada por esta rotina.
   * - label: entrada usada por esta rotina.
   * Retorno: void.
   * Efeitos colaterais: registra erro no console sem interromper as proximas etapas.
   */
  function runStep(fn, label) {
    try {
      fn();
    } catch (e) {
      console.error(`[HeadsoftHelper] ${label} erro:`, e);
    }
  }
  /**
   * Objetivo: Orquestra pipeline completo de inicializaÃ§Ã£o/reaplicaÃ§Ã£o.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Ordem de execucao:
   * - Infra base (CSS, tema, logo, navegacao).
   * - Adaptacao de telas (login/home/dashboard/request/users/user-form).
   * - Regras de negocio (quick actions, SLA, chips, 1o atendimento).
   * - Ajustes finais de layout e binds globais.
   * Parametros: nenhum.
   * Retorno: void.
   * Efeitos colaterais: aplica alteracoes idempotentes no DOM e binds necessarios da sessao.
   */
  function safeRun() {
    runStep(runTextPreviewBridgeSenderIfNeeded, "runTextPreviewBridgeSenderIfNeeded");
    runStep(ensureReqOpenDebugTools, "ensureReqOpenDebugTools");
    runStep(ensureWindowOpenDedupGuard, "ensureWindowOpenDedupGuard");
    runStep(injectStyle, "injectStyle");
    runStep(enforceUpdateHistoryRules, "enforceUpdateHistoryRules");
    runStep(ensureGlobalUpdateNotification, "ensureGlobalUpdateNotification");
    runStep(ensureThemeBtn, "ensureThemeBtn");
    runStep(() => applyTheme(getTheme()), "applyTheme");
    runStep(ensureBadge, "ensureBadge");
    runStep(fixLogo, "fixLogo");
    runStep(bindHeaderLogoNavigation, "bindHeaderLogoNavigation");
    runStep(styleLoginPage, "styleLoginPage");
    runStep(ensureLoginPersistence, "ensureLoginPersistence");
    runStep(styleHomePage, "styleHomePage");
    runStep(styleDashboardPage, "styleDashboardPage");
    runStep(ensureDashboardEmptyState, "ensureDashboardEmptyState");
    runStep(styleRequestPage, "styleRequestPage");
    runStep(linkifyReferencedRequestNumbers, "linkifyReferencedRequestNumbers");
    runStep(styleUserFormPage, "styleUserFormPage");
    runStep(rebuildUserFormPageLayout, "rebuildUserFormPageLayout");
    runStep(hideSomeFilters, "hideSomeFilters");
    runStep(ensureDashboardPreviewModeToggle, "ensureDashboardPreviewModeToggle");
    runStep(hideVisualizarActions, "hideVisualizarActions");
    runStep(alignRequestHeaderActions, "alignRequestHeaderActions");
    runStep(hideRequestedGridColumns, "hideRequestedGridColumns");
    runStep(markServiceRows, "markServiceRows");
    runStep(tagDashboardGridColumns, "tagDashboardGridColumns");
    runStep(signalExternalReturnSlaRules, "signalExternalReturnSlaRules");
    runStep(applySituacaoColorCustomization, "applySituacaoColorCustomization");
    runStep(ensureDashboardNovasSection, "ensureDashboardNovasSection");
    runStep(ensureDashboardEmServicoSectionToggle, "ensureDashboardEmServicoSectionToggle");
    runStep(ensureAjaxGridRefresh, "ensureAjaxGridRefresh");
    runStep(registerCurrentNovaRows, "registerCurrentNovaRows");
    runStep(renderRowAlerts, "renderRowAlerts");
    runStep(ensureConsultaProLayout, "ensureConsultaProLayout");
    runStep(ensureCountBadges, "ensureCountBadges");
    runStep(ensureConsultaPrimeiroAtendimentoButtons, "ensureConsultaPrimeiroAtendimentoButtons");
    runStep(bindRowAndLogoClicks, "bindRowAndLogoClicks");
    runStep(runAutoConcluirIfPending, "runAutoConcluirIfPending");
    runStep(ensureSingleImageAttachments, "ensureSingleImageAttachments");
    runStep(bindAcompanhamentoTextareaSizePersistence, "bindAcompanhamentoTextareaSizePersistence");
    runStep(ensureRequestQuickActions, "ensureRequestQuickActions");
    runStep(ensureConcluirConsumoAlert, "ensureConcluirConsumoAlert");
    runStep(layoutRequestCalendarAndConsumption, "layoutRequestCalendarAndConsumption");
    runStep(highlightAcompanhamentosResponsavelEspecial, "highlightAcompanhamentosResponsavelEspecial");
    runStep(disableAcompanhamentosHoverEffects, "disableAcompanhamentosHoverEffects");
    runStep(bindNoHoverAcompanhamentosEvents, "bindNoHoverAcompanhamentosEvents");
    runStep(wireCalendars, "wireCalendars");
    runStep(enhanceUsersPage, "enhanceUsersPage");
    runStep(normalizeDashboardTableWidths, "normalizeDashboardTableWidths");
    runStep(ensureDashboardGridEdgeResize, "ensureDashboardGridEdgeResize");
    runStep(adjustHomeTopOffset, "adjustHomeTopOffset");
    runStep(adjustDashboardTopOffset, "adjustDashboardTopOffset");
    runStep(adjustRequestTopOffset, "adjustRequestTopOffset");
    runStep(adjustUsersTopOffset, "adjustUsersTopOffset");
    runStep(adjustUserFormTopOffset, "adjustUserFormTopOffset");
    runStep(runHealthCheckOnce, "runHealthCheckOnce");
    runStep(runSelfCheck, "runSelfCheck");
  }

  // Ajustes de layout dependentes de viewport.
  window.addEventListener("resize", () => {
    adjustHomeTopOffset();
    adjustDashboardTopOffset();
    normalizeDashboardTableWidths();
    adjustRequestTopOffset();
    adjustUsersTopOffset();
    adjustUserFormTopOffset();
    alignRequestHeaderActions();
  });

  // Reexecuta quando DOM muda (legacy pages costumam renderizar em partes).
  let timer = null;
  let running = false;
  let mo = null;
  const isIgnoredMutationNode = (node) => {
    if (!(node instanceof HTMLElement)) return false;
    if (node.closest("#hs-req-pop, .hs-toast-wrap")) return true;
    const id = String(node.id || "").trim();
    if (id.startsWith("hs-")) return true;
    const className = typeof node.className === "string" ? node.className : "";
    return /\bhs-[\w-]+/.test(className);
  };
  const shouldProcessMutations = (mutations) => {
    for (const m of mutations || []) {
      if (m.type !== "childList") return true;
      const nodes = [...Array.from(m.addedNodes || []), ...Array.from(m.removedNodes || [])];
      if (!nodes.length) {
        if (m.target instanceof HTMLElement && !isIgnoredMutationNode(m.target)) return true;
        continue;
      }
      for (const node of nodes) {
        if (node instanceof HTMLElement) {
          if (isIgnoredMutationNode(node)) continue;
          return true;
        }
        if (node instanceof Text) {
          const p = node.parentElement;
          if (p && isIgnoredMutationNode(p)) continue;
          return true;
        }
        return true;
      }
    }
    return false;
  };
  const schedule = () => {
    if (running) return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (document.hidden) return;
      running = true;
      try {
        safeRun();
      } finally {
        running = false;
      }
    }, SAFE_RUN_MUTATION_DEBOUNCE_MS);
  };
  const ensureMutationObserver = () => {
    if (mo) return;
    const target = document.getElementById("conteudo") || document.body || document.documentElement;
    if (!(target instanceof Node)) return;
    mo = new MutationObserver((mutations) => {
      if (!shouldProcessMutations(mutations)) return;
      schedule();
    });
    mo.observe(target, { childList: true, subtree: true });
  };

  const bootstrapRuntime = () => {
    safeRun();
    ensureMutationObserver();
  };

  // Bootstrap inicial do userscript com suporte a pagina ja carregada.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrapRuntime, { once: true });
  } else {
    bootstrapRuntime();
  }
})();

// HS_SETTINGS_EMBEDDED_START
(() => {
  const API_NAME = "HSHeadsoftUser2";
  const STYLE_ID = "hs-user2-settings-style";
  const ROOT_ID = "hs-user2-settings-modal";
  const NOTIFY_HOST_ID = "hs2-notify-host";
  const NOTIFY_DEFAULT_MS = 6800;

  let root = null;
  let activeHubId = "";
  let buildModelFn = null;
  let modelState = null;
  let refreshTimer = null;
  let notifyTestCounter = 0;
  const activeTabByHub = new Map();
  const activeSubtabByHub = new Map();

  const txt = (value) => String(value || "").replace(/\s+/g, " ").trim();
  const by = (id) => document.getElementById(id);
  const SITUACAO_TEXT_SELECTORS = [
    ".Situacao",
    ".situacao",
    "[class*='Situacao']",
    "[class*='situacao']",
  ];

  function normalizeHexColor(value) {
    const raw = txt(value || "").replace(/^#/, "");
    if (!/^[0-9a-f]{3}([0-9a-f]{3})?$/i.test(raw)) return "";
    const normalized = raw.length === 3 ? raw.replace(/./g, (ch) => ch + ch) : raw;
    return `#${normalized.toUpperCase()}`;
  }

  function findSituacaoNode(td) {
    if (!(td instanceof HTMLTableCellElement)) return null;
    for (const selector of SITUACAO_TEXT_SELECTORS) {
      const node = td.querySelector(selector);
      if (node instanceof HTMLElement) return node;
    }
    return null;
  }

  function extractSituacaoTextFromCell(td) {
    if (!(td instanceof HTMLTableCellElement)) return "";
    const sitNode = findSituacaoNode(td);
    if (sitNode) return txt(sitNode.textContent || "");
    const clone = td.cloneNode(true);
    clone
      .querySelectorAll(".hs-first-att-wrap, .hs-situacao-sinal, .hs-ext-sla-chip, .hs-row-state-dot")
      .forEach((el) => el.remove());
    return txt(clone.textContent || "");
  }

  function applySituacaoTextPaint(td, textColorRaw = "") {
    if (!(td instanceof HTMLTableCellElement)) return;
    const textColor = normalizeHexColor(textColorRaw || "");
    td.style.removeProperty("color");
    const sitNode = findSituacaoNode(td);
    if (sitNode) sitNode.style.removeProperty("color");
    const target = sitNode || td;
    if (!(target instanceof HTMLElement)) return;
    if (textColor) target.style.setProperty("color", textColor, "important");
  }

  function clearSituacaoRowPaint(tr) {
    if (!(tr instanceof HTMLTableRowElement)) return;
    delete tr.dataset.hsSitRowBg;
    tr.style.removeProperty("--hs-sit-row-bg");
    Array.from(tr.cells || []).forEach((cell) => {
      if (!(cell instanceof HTMLTableCellElement)) return;
      if (cell.dataset.hsSitRowPainted !== "1") return;
      cell.style.removeProperty("background");
      cell.style.removeProperty("background-color");
      delete cell.dataset.hsSitRowPainted;
    });
  }

  function applySituacaoRowPaint(tr, bgColorRaw = "") {
    if (!(tr instanceof HTMLTableRowElement)) return;
    clearSituacaoRowPaint(tr);
    const bgColor = normalizeHexColor(bgColorRaw || "");
    if (!bgColor) return;
    tr.dataset.hsSitRowBg = bgColor;
    tr.style.setProperty("--hs-sit-row-bg", bgColor);
    Array.from(tr.cells || []).forEach((cell) => {
      if (!(cell instanceof HTMLTableCellElement)) return;
      cell.style.setProperty("background", bgColor, "important");
      cell.style.setProperty("background-color", bgColor, "important");
      cell.dataset.hsSitRowPainted = "1";
    });
  }

  function applySituacaoBadgePaint(el, options = {}) {
    if (!(el instanceof HTMLElement)) return;
    const source = options && typeof options === "object" ? options : {};
    const badgeBgColor = normalizeHexColor(source.badgeBgColor || source.backgroundColor || "");
    const badgeBorderColor = normalizeHexColor(source.badgeBorderColor || source.borderColor || "");
    const badgeTextColor = normalizeHexColor(
      source.badgeTextColor || source.textColor || source.color || ""
    );
    el.style.removeProperty("background");
    el.style.removeProperty("background-color");
    el.style.removeProperty("color");
    el.style.removeProperty("border-color");
    if (badgeBgColor) {
      el.style.setProperty("background", badgeBgColor, "important");
      el.style.setProperty("background-color", badgeBgColor, "important");
    }
    if (badgeBorderColor) el.style.setProperty("border-color", badgeBorderColor, "important");
    if (badgeTextColor) el.style.setProperty("color", badgeTextColor, "important");
  }

  function scheduleRender(delay = 90) {
    if (refreshTimer) window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(() => {
      refreshTimer = null;
      renderActiveModel();
    }, Math.max(20, Number(delay) || 90));
  }

  function formatDateTimePtBr(value = null) {
    const date = value instanceof Date ? value : new Date(value || Date.now());
    if (Number.isNaN(date.getTime())) return txt(value || "");
    try {
      return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      const p2 = (n) => String(n || 0).padStart(2, "0");
      return `${p2(date.getDate())}/${p2(date.getMonth() + 1)}/${date.getFullYear()} ${p2(date.getHours())}:${p2(
        date.getMinutes()
      )}`;
    }
  }

  function ensureNotificationHost() {
    let host = by(NOTIFY_HOST_ID);
    if (!(host instanceof HTMLElement)) {
      host = document.createElement("div");
      host.id = NOTIFY_HOST_ID;
      document.body.appendChild(host);
    } else if (!host.isConnected) {
      document.body.appendChild(host);
    }
    return host;
  }

  function dismissNotificationCard(card) {
    if (!(card instanceof HTMLElement)) return;
    if (card.dataset.hs2Closing === "1") return;
    card.dataset.hs2Closing = "1";
    card.classList.remove("hs2-notify-show");
    card.classList.add("hs2-notify-hide");
    window.setTimeout(() => {
      if (card.isConnected) card.remove();
    }, 320);
  }

  function showPlainNotificationFallback(message = "") {
    if (!document?.body) return null;
    const box = document.createElement("div");
    box.textContent = txt(message || "Notificacao de teste acionada.");
    box.style.position = "fixed";
    box.style.right = "12px";
    box.style.bottom = "12px";
    box.style.zIndex = "1000044";
    box.style.maxWidth = "min(360px, calc(100vw - 24px))";
    box.style.padding = "10px 12px";
    box.style.borderRadius = "10px";
    box.style.border = "1px solid rgba(109,181,243,.82)";
    box.style.background = "rgba(12,28,46,.98)";
    box.style.color = "#EAF4FF";
    box.style.boxShadow = "0 14px 28px rgba(0,0,0,.45)";
    box.style.fontSize = "12px";
    box.style.fontWeight = "700";
    box.style.lineHeight = "1.35";
    document.body.appendChild(box);
    window.setTimeout(() => {
      if (box.isConnected) box.remove();
    }, 2600);
    return box;
  }

  function showChamadoUpdateNotification(payload = {}) {
    if (!document?.body) return null;
    injectStyle();
    const host = ensureNotificationHost();
    const source = payload && typeof payload === "object" ? payload : {};
    const numero = txt(source.numero || source.chamado || "00000");
    const situacao = txt(source.situacao || "Atualizado");
    const resumo =
      txt(source.resumo || source.mensagem || source.descricao) ||
      "Foi detectada uma nova atualizacao no chamado. Confira os detalhes na grade.";
    const responsavel = txt(source.responsavel || source.usuario || "Equipe");
    const origem = txt(source.origem || source.source || "Teste de notificacao (Configuracoes)");
    const updatedAt = txt(source.updatedAt || source.data || "") || formatDateTimePtBr();
    const accent = normalizeHexColor(source.highlightColor || source.accentColor || "#22D3EE") || "#22D3EE";
    const autoCloseMs = Math.min(30000, Math.max(1600, Number(source.autoCloseMs) || NOTIFY_DEFAULT_MS));

    const card = document.createElement("article");
    card.className = "hs2-notify-card";
    card.style.setProperty("--hs2-notify-accent", accent);
    card.innerHTML = `
      <div class="hs2-notify-accent"></div>
      <div class="hs2-notify-body">
        <div class="hs2-notify-head">
          <p class="hs2-notify-title">
            <span class="hs2-notify-title-dot"></span>
            <span>Atualizacao do chamado #${numero}</span>
          </p>
          <button type="button" class="hs2-notify-close" aria-label="Fechar notificacao">Ã—</button>
        </div>
        <span class="hs2-notify-source">${origem}</span>
        <p class="hs2-notify-text">${resumo}</p>
        <div class="hs2-notify-meta">
          <div class="hs2-notify-chip"><b>Situacao:</b> ${situacao}</div>
          <div class="hs2-notify-chip"><b>Responsavel:</b> ${responsavel}</div>
        </div>
        <div class="hs2-notify-foot">Atualizado em ${updatedAt}</div>
      </div>
    `;

    const closeBtn = card.querySelector(".hs2-notify-close");
    let timer = window.setTimeout(() => dismissNotificationCard(card), autoCloseMs);
    const clearAutoClose = () => {
      if (!timer) return;
      window.clearTimeout(timer);
      timer = 0;
    };
    const restartAutoClose = () => {
      clearAutoClose();
      timer = window.setTimeout(() => dismissNotificationCard(card), autoCloseMs);
    };

    if (closeBtn instanceof HTMLButtonElement) {
      closeBtn.addEventListener("click", (ev) => {
        ev.preventDefault();
        clearAutoClose();
        dismissNotificationCard(card);
      });
    }
    card.addEventListener("mouseenter", clearAutoClose);
    card.addEventListener("mouseleave", restartAutoClose);
    card.addEventListener("click", () => restartAutoClose());
    card.addEventListener("animationend", () => {
      if (card.classList.contains("hs2-notify-hide") && card.isConnected) card.remove();
    });

    host.appendChild(card);
    const showNow = () => {
      card.classList.add("hs2-notify-show");
      card.style.opacity = "1";
      card.style.transform = "translateY(0) scale(1)";
    };
    const raf =
      typeof window.requestAnimationFrame === "function"
        ? window.requestAnimationFrame.bind(window)
        : (cb) => window.setTimeout(cb, 16);
    try {
      raf(showNow);
      window.setTimeout(() => {
        if (!card.classList.contains("hs2-notify-show")) showNow();
      }, 90);
    } catch {
      showNow();
    }
    return card;
  }

  function runSettingsNotificationTest() {
    try {
      notifyTestCounter += 1;
      const seq = notifyTestCounter;
      const sampleId = String(46000 + ((seq * 13) % 999));
      const sampleStatus = seq % 2 === 0 ? "Aprovado para servico" : "Novas informacoes";
      const sampleOwner = seq % 2 === 0 ? "Kauan" : "Vinicius";
      const sampleSummary =
        seq % 2 === 0
          ? "Nova interacao registrada no chamado. Validar aprovacao e proximo passo."
          : "Cliente enviou resposta no chamado. Necessario revisar e retornar.";
      const sampleAccent = seq % 2 === 0 ? "#22D3EE" : "#34D399";
      const rendered = showChamadoUpdateNotification({
        numero: sampleId,
        situacao: sampleStatus,
        responsavel: sampleOwner,
        resumo: sampleSummary,
        highlightColor: sampleAccent,
        origem: "Teste de notificacao em Configuracoes",
        updatedAt: formatDateTimePtBr(),
      });
      if (!(rendered instanceof HTMLElement)) {
        showPlainNotificationFallback("Teste de notificacao acionado, mas o card principal nao renderizou.");
      }
      return true;
    } catch (err) {
      console.warn("[HSUser2] Falha no teste de notificacao:", err);
      showPlainNotificationFallback("Teste de notificacao acionado com fallback visual.");
      return false;
    }
  }

  function injectStyle() {
    if (by(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #${ROOT_ID}{
        position:fixed!important;
        inset:0!important;
        z-index:1000031!important;
        display:none!important;
      }
      #${ROOT_ID}.open{
        display:block!important;
      }
      #${ROOT_ID} .hs2-backdrop{
        position:absolute!important;
        inset:0!important;
        background:radial-gradient(circle at 14% 10%, rgba(64,112,178,.24), rgba(8,14,24,.78) 58%, rgba(4,8,14,.84))!important;
        backdrop-filter:blur(4px)!important;
      }
      #${ROOT_ID} .hs2-card{
        position:absolute!important;
        inset:4vh 4vw!important;
        max-width:1180px!important;
        margin:auto!important;
        min-height:560px!important;
        border-radius:16px!important;
        border:1px solid rgba(94,137,190,.52)!important;
        background:
          linear-gradient(120deg, rgba(27,47,75,.86), rgba(15,29,48,.92)),
          linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.01))!important;
        box-shadow:0 38px 74px rgba(0,0,0,.45)!important;
        color:#eaf2ff!important;
        display:flex!important;
        flex-direction:column!important;
        overflow:hidden!important;
      }
      #${ROOT_ID} .hs2-head{
        display:flex!important;
        align-items:flex-start!important;
        justify-content:space-between!important;
        gap:16px!important;
        padding:18px 20px 14px!important;
        border-bottom:1px solid rgba(112,154,208,.34)!important;
      }
      #${ROOT_ID} .hs2-head h2{
        margin:0!important;
        font-size:18px!important;
        letter-spacing:.03em!important;
        text-transform:uppercase!important;
        font-weight:900!important;
      }
      #${ROOT_ID} .hs2-head p{
        margin:6px 0 0!important;
        opacity:.86!important;
        font-size:12px!important;
      }
      #${ROOT_ID} .hs2-head-actions{
        display:flex!important;
        align-items:center!important;
        gap:8px!important;
      }
      #${ROOT_ID} .hs2-head-test-notify{
        min-height:34px!important;
        border-radius:10px!important;
        border:1px solid rgba(108,164,228,.64)!important;
        background:linear-gradient(180deg, rgba(40,76,118,.92), rgba(27,57,92,.95))!important;
        color:#eaf4ff!important;
        padding:0 12px!important;
        font-weight:800!important;
        font-size:11px!important;
        cursor:pointer!important;
      }
      #${ROOT_ID} .hs2-head-test-notify:hover{
        border-color:rgba(134,188,245,.82)!important;
        box-shadow:0 0 0 1px rgba(108,164,228,.34)!important;
      }
      #${ROOT_ID} .hs2-close{
        min-height:34px!important;
        border-radius:10px!important;
        border:1px solid rgba(126,167,220,.6)!important;
        background:linear-gradient(180deg, rgba(43,73,110,.92), rgba(29,53,84,.94))!important;
        color:#eaf2ff!important;
        padding:0 14px!important;
        font-weight:800!important;
        cursor:pointer!important;
      }
      #${ROOT_ID} .hs2-body{
        flex:1!important;
        min-height:0!important;
        display:grid!important;
        grid-template-columns:250px minmax(0, 1fr)!important;
      }
      #${ROOT_ID} .hs2-tabs{
        border-right:1px solid rgba(112,154,208,.24)!important;
        padding:14px 10px 16px!important;
        overflow:auto!important;
        background:linear-gradient(180deg, rgba(11,20,34,.44), rgba(8,16,28,.3))!important;
      }
      #${ROOT_ID} .hs2-tab{
        width:100%!important;
        text-align:left!important;
        border:1px solid transparent!important;
        background:transparent!important;
        color:#d9e8ff!important;
        border-radius:10px!important;
        padding:9px 10px!important;
        font-weight:800!important;
        font-size:12px!important;
        letter-spacing:.02em!important;
        cursor:pointer!important;
        margin-bottom:6px!important;
      }
      #${ROOT_ID} .hs2-tab:hover{
        border-color:rgba(127,169,221,.36)!important;
        background:rgba(38,66,102,.35)!important;
      }
      #${ROOT_ID} .hs2-tab.active{
        border-color:rgba(126,173,234,.66)!important;
        background:linear-gradient(180deg, rgba(51,83,124,.8), rgba(34,63,98,.86))!important;
        box-shadow:0 0 0 1px rgba(111,160,224,.28)!important;
      }
      #${ROOT_ID} .hs2-main{
        min-width:0!important;
        display:flex!important;
        flex-direction:column!important;
      }
      #${ROOT_ID} .hs2-subtabs{
        display:flex!important;
        flex-wrap:wrap!important;
        gap:8px!important;
        padding:12px 16px 10px!important;
        border-bottom:1px solid rgba(112,154,208,.24)!important;
        background:linear-gradient(180deg, rgba(14,27,45,.3), rgba(10,21,35,.1))!important;
      }
      #${ROOT_ID} .hs2-subtab{
        border:1px solid rgba(93,131,183,.44)!important;
        background:rgba(24,44,71,.62)!important;
        color:#deebff!important;
        border-radius:999px!important;
        padding:6px 12px!important;
        font-size:11px!important;
        font-weight:800!important;
        cursor:pointer!important;
      }
      #${ROOT_ID} .hs2-subtab.active{
        background:linear-gradient(180deg, rgba(76,124,188,.88), rgba(58,99,153,.9))!important;
        border-color:rgba(145,186,238,.86)!important;
      }
      #${ROOT_ID} .hs2-panel{
        flex:1!important;
        min-height:0!important;
        overflow:auto!important;
        padding:16px!important;
      }
      #${ROOT_ID} .hs2-subtitle{
        margin:0 0 12px!important;
        font-size:12px!important;
        opacity:.88!important;
      }
      #${ROOT_ID} .hs2-grid{
        display:grid!important;
        grid-template-columns:repeat(auto-fit, minmax(280px, 1fr))!important;
        gap:10px!important;
      }
      #${ROOT_ID} .hs2-control{
        border:1px solid rgba(90,131,184,.52)!important;
        border-radius:12px!important;
        background:linear-gradient(180deg, rgba(24,44,69,.9), rgba(17,34,53,.92))!important;
        color:#e5f0ff!important;
        min-height:58px!important;
        padding:10px 12px!important;
        cursor:pointer!important;
        text-align:left!important;
      }
      #${ROOT_ID} .hs2-control:hover{
        border-color:rgba(123,170,230,.7)!important;
        box-shadow:0 0 0 1px rgba(123,170,230,.26)!important;
      }
      #${ROOT_ID} .hs2-control.warn{
        border-color:rgba(227,184,84,.72)!important;
        background:linear-gradient(180deg, rgba(92,73,26,.88), rgba(73,58,20,.92))!important;
        color:#fff4cf!important;
      }
      #${ROOT_ID} .hs2-control.card{
        background:linear-gradient(180deg, rgba(20,40,64,.95), rgba(15,31,50,.95))!important;
      }
      #${ROOT_ID} .hs2-control .main{
        display:block!important;
        font-size:13px!important;
        font-weight:900!important;
        letter-spacing:.01em!important;
      }
      #${ROOT_ID} .hs2-control .meta{
        display:block!important;
        margin-top:4px!important;
        font-size:11px!important;
        opacity:.8!important;
      }
      #${ROOT_ID} .hs2-empty{
        border:1px dashed rgba(112,154,208,.44)!important;
        border-radius:12px!important;
        padding:14px!important;
        font-size:12px!important;
        opacity:.84!important;
      }
      #${ROOT_ID} .hs2-status-head{
        display:flex!important;
        flex-wrap:wrap!important;
        gap:8px!important;
        margin-bottom:12px!important;
      }
      #${ROOT_ID} .hs2-status-head input[type="search"],
      #${ROOT_ID} .hs2-status-head .hs2-status-create{
        flex:1 1 220px!important;
        min-height:34px!important;
        border-radius:10px!important;
        border:1px solid rgba(96,136,188,.55)!important;
        background:rgba(11,23,38,.78)!important;
        color:#e8f2ff!important;
        padding:0 10px!important;
      }
      #${ROOT_ID} .hs2-mini-btn{
        min-height:34px!important;
        border-radius:10px!important;
        border:1px solid rgba(98,139,192,.55)!important;
        background:linear-gradient(180deg, rgba(35,60,91,.92), rgba(24,45,72,.94))!important;
        color:#eaf2ff!important;
        padding:0 10px!important;
        font-size:11px!important;
        font-weight:800!important;
        cursor:pointer!important;
      }
      #${ROOT_ID} .hs2-status-list{
        display:grid!important;
        grid-template-columns:repeat(auto-fit, minmax(330px, 1fr))!important;
        gap:10px!important;
      }
      #${ROOT_ID} .hs2-status-card{
        border:1px solid rgba(98,139,192,.5)!important;
        border-radius:12px!important;
        background:linear-gradient(180deg, rgba(20,38,60,.9), rgba(15,30,48,.92))!important;
        padding:10px!important;
      }
      #${ROOT_ID} .hs2-status-label{
        margin:0 0 10px!important;
        font-size:12px!important;
        font-weight:900!important;
        letter-spacing:.01em!important;
      }
      #${ROOT_ID} .hs2-status-grid{
        display:grid!important;
        grid-template-columns:repeat(3, minmax(0,1fr))!important;
        gap:8px!important;
      }
      #${ROOT_ID} .hs2-status-field{
        display:flex!important;
        flex-direction:column!important;
        gap:4px!important;
      }
      #${ROOT_ID} .hs2-status-field span{
        font-size:10px!important;
        opacity:.82!important;
        font-weight:700!important;
        text-transform:uppercase!important;
        letter-spacing:.03em!important;
      }
      #${ROOT_ID} .hs2-status-field input[type="color"]{
        width:100%!important;
        min-height:34px!important;
        border-radius:8px!important;
        border:1px solid rgba(105,145,196,.58)!important;
        background:transparent!important;
        cursor:pointer!important;
      }
      #${ROOT_ID} .hs2-status-actions{
        margin-top:10px!important;
        display:flex!important;
        align-items:center!important;
        justify-content:space-between!important;
        gap:8px!important;
      }
      #${ROOT_ID} .hs2-status-preview{
        display:inline-flex!important;
        align-items:center!important;
        padding:2px 8px!important;
        border-radius:999px!important;
        border:1px solid rgba(108,149,200,.58)!important;
        background:rgba(28,50,79,.72)!important;
        font-size:10px!important;
        font-weight:800!important;
      }
      #${ROOT_ID} .hs2-status-clear{
        min-height:28px!important;
        border-radius:8px!important;
        border:1px solid rgba(200,130,130,.55)!important;
        background:linear-gradient(180deg, rgba(102,49,49,.86), rgba(80,38,38,.9))!important;
        color:#ffe2e2!important;
        padding:0 9px!important;
        font-size:10px!important;
        font-weight:800!important;
        cursor:pointer!important;
      }
      #${NOTIFY_HOST_ID}{
        position:fixed!important;
        right:18px!important;
        bottom:18px!important;
        z-index:1000043!important;
        display:flex!important;
        flex-direction:column!important;
        align-items:flex-end!important;
        gap:10px!important;
        pointer-events:none!important;
      }
      #${NOTIFY_HOST_ID} .hs2-notify-card{
        width:min(390px, calc(100vw - 28px))!important;
        border-radius:14px!important;
        border:1px solid rgba(98,146,206,.56)!important;
        background:
          linear-gradient(145deg, rgba(16,33,56,.96), rgba(10,23,40,.98)),
          linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.01))!important;
        color:#eaf4ff!important;
        box-shadow:0 20px 42px rgba(0,0,0,.46)!important;
        pointer-events:auto!important;
        overflow:hidden!important;
        transform:translateY(115px) scale(.96)!important;
        opacity:0!important;
      }
      #${NOTIFY_HOST_ID} .hs2-notify-card.hs2-notify-show{
        animation:hs2NotifyIn .34s cubic-bezier(.2,.88,.2,1) forwards!important;
      }
      #${NOTIFY_HOST_ID} .hs2-notify-card.hs2-notify-hide{
        animation:hs2NotifyOut .3s ease forwards!important;
      }
      #${NOTIFY_HOST_ID} .hs2-notify-accent{
        height:3px!important;
        background:linear-gradient(90deg, var(--hs2-notify-accent, #38bdf8), rgba(255,255,255,.2))!important;
      }
      #${NOTIFY_HOST_ID} .hs2-notify-body{
        padding:11px 12px 12px!important;
      }
      #${NOTIFY_HOST_ID} .hs2-notify-head{
        display:flex!important;
        align-items:flex-start!important;
        justify-content:space-between!important;
        gap:10px!important;
      }
      #${NOTIFY_HOST_ID} .hs2-notify-title{
        margin:0!important;
        font-size:13px!important;
        font-weight:900!important;
        letter-spacing:.01em!important;
        display:flex!important;
        align-items:center!important;
        gap:7px!important;
      }
      #${NOTIFY_HOST_ID} .hs2-notify-title-dot{
        width:8px!important;
        height:8px!important;
        border-radius:50%!important;
        background:var(--hs2-notify-accent, #38bdf8)!important;
        box-shadow:0 0 0 4px rgba(56,189,248,.14)!important;
        flex:none!important;
      }
      #${NOTIFY_HOST_ID} .hs2-notify-close{
        min-height:24px!important;
        min-width:24px!important;
        border-radius:7px!important;
        border:1px solid rgba(118,157,208,.5)!important;
        background:rgba(22,44,71,.78)!important;
        color:#dbeafe!important;
        font-size:13px!important;
        line-height:1!important;
        cursor:pointer!important;
      }
      #${NOTIFY_HOST_ID} .hs2-notify-source{
        margin:7px 0 0!important;
        display:inline-flex!important;
        align-items:center!important;
        padding:2px 8px!important;
        border-radius:999px!important;
        border:1px solid rgba(116,163,221,.52)!important;
        background:rgba(20,45,74,.6)!important;
        color:#d7eaff!important;
        font-size:10px!important;
        font-weight:800!important;
      }
      #${NOTIFY_HOST_ID} .hs2-notify-text{
        margin:8px 0 0!important;
        font-size:12px!important;
        line-height:1.42!important;
        color:#dbeafe!important;
      }
      #${NOTIFY_HOST_ID} .hs2-notify-meta{
        margin-top:9px!important;
        display:grid!important;
        grid-template-columns:repeat(2, minmax(0,1fr))!important;
        gap:6px!important;
      }
      #${NOTIFY_HOST_ID} .hs2-notify-chip{
        border:1px solid rgba(103,149,206,.48)!important;
        background:rgba(17,38,62,.7)!important;
        border-radius:8px!important;
        padding:4px 6px!important;
        font-size:10px!important;
        color:#cfe4ff!important;
      }
      #${NOTIFY_HOST_ID} .hs2-notify-chip b{
        color:#f8fbff!important;
      }
      #${NOTIFY_HOST_ID} .hs2-notify-foot{
        margin-top:8px!important;
        font-size:10px!important;
        color:#9fbfdf!important;
      }
      @keyframes hs2NotifyIn{
        from{ opacity:0; transform:translateY(115px) scale(.96); }
        to{ opacity:1; transform:translateY(0) scale(1); }
      }
      @keyframes hs2NotifyOut{
        from{ opacity:1; transform:translateY(0) scale(1); }
        to{ opacity:0; transform:translateY(70px) scale(.97); }
      }
      @media (max-width: 980px){
        #${ROOT_ID} .hs2-card{
          inset:2vh 2vw!important;
        }
        #${ROOT_ID} .hs2-body{
          grid-template-columns:1fr!important;
        }
        #${ROOT_ID} .hs2-tabs{
          border-right:none!important;
          border-bottom:1px solid rgba(112,154,208,.24)!important;
          display:flex!important;
          gap:6px!important;
          overflow:auto hidden!important;
          white-space:nowrap!important;
        }
        #${ROOT_ID} .hs2-tab{
          min-width:max-content!important;
          margin-bottom:0!important;
        }
        #${NOTIFY_HOST_ID}{
          right:8px!important;
          left:8px!important;
          bottom:8px!important;
          align-items:stretch!important;
        }
        #${NOTIFY_HOST_ID} .hs2-notify-card{
          width:100%!important;
        }
      }
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  function ensureRoot() {
    if (root && root.isConnected) return root;
    root = by(ROOT_ID);
    if (!(root instanceof HTMLElement)) {
      root = document.createElement("div");
      root.id = ROOT_ID;
      root.innerHTML = `
        <div class="hs2-backdrop" data-action="close"></div>
        <section class="hs2-card" role="dialog" aria-modal="true" aria-label="Configuracoes">
          <header class="hs2-head">
            <div>
              <h2 data-slot="title">Configuracoes</h2>
              <p data-slot="subtitle"></p>
            </div>
            <div class="hs2-head-actions">
              <button type="button" class="hs2-head-test-notify" data-action="notify-test">Teste notificacao</button>
              <button type="button" class="hs2-close" data-action="close">Fechar</button>
            </div>
          </header>
          <div class="hs2-body">
            <aside class="hs2-tabs" data-slot="tabs"></aside>
            <main class="hs2-main">
              <nav class="hs2-subtabs" data-slot="subtabs"></nav>
              <section class="hs2-panel" data-slot="panel"></section>
            </main>
          </div>
        </section>
      `;
      document.body.appendChild(root);
    } else if (!root.isConnected) {
      document.body.appendChild(root);
    }
    if (root.dataset.hs2Bound !== "1") {
      root.dataset.hs2Bound = "1";
      root.addEventListener("click", (ev) => {
        const notifyTestTarget = ev.target instanceof HTMLElement ? ev.target.closest("[data-action='notify-test']") : null;
        if (notifyTestTarget) {
          ev.preventDefault();
          runSettingsNotificationTest();
          return;
        }
        const closeTarget = ev.target instanceof HTMLElement ? ev.target.closest("[data-action='close']") : null;
        if (closeTarget) {
          ev.preventDefault();
          closeSettingsHub();
          return;
        }
      });
      document.addEventListener("keydown", (ev) => {
        if (String(ev.key || "").toLowerCase() !== "escape") return;
        if (!root || !root.classList.contains("open")) return;
        closeSettingsHub();
      });
    }
    return root;
  }

  function resolveControlLabel(control) {
    if (!control || typeof control !== "object") return "Executar";
    if (txt(control.label)) return txt(control.label);
    const source = control.source;
    if (source instanceof HTMLInputElement) {
      return txt(source.value || source.getAttribute("value") || source.title || "Executar");
    }
    if (source instanceof HTMLButtonElement) {
      const dataMain = source.querySelector(".hs-main");
      if (dataMain) return txt(dataMain.textContent || source.textContent || "Executar");
      return txt(source.textContent || source.title || "Executar");
    }
    if (source instanceof HTMLElement) return txt(source.textContent || source.title || "Executar");
    return "Executar";
  }

  function resolveControlMeta(control) {
    if (!control || typeof control !== "object") return "";
    if (txt(control.description)) return txt(control.description);
    const source = control.source;
    if (source instanceof HTMLElement) return txt(source.title || "");
    return "";
  }

  function runControlAction(control) {
    if (!control || typeof control !== "object") return;
    if (typeof control.action === "function") {
      control.action();
      return;
    }
    const source = control.source;
    if (source instanceof HTMLElement) {
      source.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          composed: true,
        })
      );
    }
  }

  function renderControls(panel, subtab) {
    const controls = (Array.isArray(subtab?.controls) ? subtab.controls : []).filter(
      (item) => item && typeof item === "object" && item.hidden !== true
    );
    if (controls.length <= 0) {
      const empty = document.createElement("div");
      empty.className = "hs2-empty";
      empty.textContent = "Nenhuma acao disponivel nesta subguia no contexto atual.";
      panel.appendChild(empty);
      return;
    }
    const grid = document.createElement("div");
    grid.className = "hs2-grid";
    controls.forEach((control) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `hs2-control ${txt(control.tone || "")}`.trim();
      const main = document.createElement("span");
      main.className = "main";
      main.textContent = resolveControlLabel(control);
      btn.appendChild(main);

      const metaText = resolveControlMeta(control);
      if (metaText) {
        const meta = document.createElement("span");
        meta.className = "meta";
        meta.textContent = metaText;
        btn.appendChild(meta);
      }
      btn.addEventListener("click", (ev) => {
        ev.preventDefault();
        runControlAction(control);
        scheduleRender(130);
      });
      grid.appendChild(btn);
    });
    panel.appendChild(grid);
  }

  function normalizeStatusEntry(entry) {
    const source = entry && typeof entry === "object" ? entry : {};
    const key = txt(source.key || source.id || source.label || "");
    if (!key) return null;
    return {
      key,
      label: txt(source.label || source.name || key),
      textColor: txt(source.textColor || ""),
      badgeBgColor: txt(source.badgeBgColor || ""),
      badgeTextColor: txt(source.badgeTextColor || ""),
    };
  }

  function renderStatusColors(panel, model, subtab) {
    const statusCfg = model?.statusColors || {};
    const onCreate = typeof statusCfg.onCreate === "function" ? statusCfg.onCreate : null;
    const onChange = typeof statusCfg.onChange === "function" ? statusCfg.onChange : null;
    const onResetEntry = typeof statusCfg.onResetEntry === "function" ? statusCfg.onResetEntry : null;
    const onResetAll = typeof statusCfg.onResetAll === "function" ? statusCfg.onResetAll : null;
    const onRefresh = typeof statusCfg.onRefresh === "function" ? statusCfg.onRefresh : null;
    const theme = txt(statusCfg.theme || "dark") === "light" ? "light" : "dark";
    const fallbackColors =
      theme === "light"
        ? {
            textColor: "#1F3D62",
            badgeBgColor: "#EAF2FF",
            badgeTextColor: "#17395F",
          }
        : {
            textColor: "#DCE6F2",
            badgeBgColor: "#2A3D57",
            badgeTextColor: "#EAF2FF",
          };

    const sourceEntries = Array.isArray(statusCfg.entries) ? statusCfg.entries : [];
    const entries = sourceEntries.map((item) => normalizeStatusEntry(item)).filter(Boolean);

    const info = document.createElement("p");
    info.className = "hs2-subtitle";
    info.textContent =
      txt(subtab?.description) ||
      "Defina as cores da linha inteira, texto e badges para cada situacao visivel no sistema.";
    panel.appendChild(info);

    const head = document.createElement("div");
    head.className = "hs2-status-head";
    panel.appendChild(head);

    const search = document.createElement("input");
    search.type = "search";
    search.placeholder = "Filtrar situacao...";
    head.appendChild(search);

    if (onCreate) {
      const createInput = document.createElement("input");
      createInput.type = "text";
      createInput.className = "hs2-status-create";
      createInput.placeholder = "Adicionar situacao manual...";
      head.appendChild(createInput);

      const addBtn = document.createElement("button");
      addBtn.type = "button";
      addBtn.className = "hs2-mini-btn";
      addBtn.textContent = "Adicionar";
      const submitCreate = () => {
        const label = txt(createInput.value || "");
        if (!label) return;
        onCreate({ label });
        createInput.value = "";
        scheduleRender(110);
      };
      addBtn.addEventListener("click", submitCreate);
      createInput.addEventListener("keydown", (ev) => {
        if (String(ev.key || "").toLowerCase() !== "enter") return;
        ev.preventDefault();
        submitCreate();
      });
      head.appendChild(addBtn);
    }

    const refreshBtn = document.createElement("button");
    refreshBtn.type = "button";
    refreshBtn.className = "hs2-mini-btn";
    refreshBtn.textContent = "Atualizar lista";
    refreshBtn.addEventListener("click", () => {
      if (onRefresh) onRefresh();
      scheduleRender(110);
    });
    head.appendChild(refreshBtn);

    const resetAllBtn = document.createElement("button");
    resetAllBtn.type = "button";
    resetAllBtn.className = "hs2-mini-btn";
    resetAllBtn.textContent = "Restaurar tudo";
    resetAllBtn.addEventListener("click", () => {
      if (onResetAll) onResetAll();
      scheduleRender(120);
    });
    head.appendChild(resetAllBtn);

    const list = document.createElement("div");
    list.className = "hs2-status-list";
    panel.appendChild(list);

    const renderList = () => {
      const filter = txt(search.value || "").toLowerCase();
      list.innerHTML = "";
      const filtered = entries.filter((entry) =>
        !filter ? true : txt(entry.label).toLowerCase().includes(filter)
      );
      if (!filtered.length) {
        const empty = document.createElement("div");
        empty.className = "hs2-empty";
        empty.textContent = "Nenhuma situacao encontrada para este filtro.";
        list.appendChild(empty);
        return;
      }

      filtered.forEach((entry) => {
        const card = document.createElement("article");
        card.className = "hs2-status-card";

        const label = document.createElement("p");
        label.className = "hs2-status-label";
        label.textContent = entry.label;
        card.appendChild(label);

        const grid = document.createElement("div");
        grid.className = "hs2-status-grid";

        const mkField = (field, caption) => {
          const wrap = document.createElement("label");
          wrap.className = "hs2-status-field";
          const span = document.createElement("span");
          span.textContent = caption;
          const input = document.createElement("input");
          input.type = "color";
          input.value = txt(entry[field] || fallbackColors[field] || "#FFFFFF");
          input.addEventListener("change", () => {
            if (onChange) onChange({ key: entry.key, label: entry.label, field, value: input.value });
            scheduleRender(90);
          });
          wrap.appendChild(span);
          wrap.appendChild(input);
          return wrap;
        };

        grid.appendChild(mkField("textColor", "Texto"));
        grid.appendChild(mkField("badgeBgColor", "Linha + badge fundo"));
        grid.appendChild(mkField("badgeTextColor", "Badge texto"));
        card.appendChild(grid);

        const actions = document.createElement("div");
        actions.className = "hs2-status-actions";
        const preview = document.createElement("span");
        preview.className = "hs2-status-preview";
        preview.textContent = "Amostra";
        const previewBg = txt(entry.badgeBgColor || fallbackColors.badgeBgColor);
        const previewText = txt(entry.badgeTextColor || entry.textColor || fallbackColors.badgeTextColor);
        preview.style.background = previewBg;
        preview.style.color = previewText;
        actions.appendChild(preview);

        const clearBtn = document.createElement("button");
        clearBtn.type = "button";
        clearBtn.className = "hs2-status-clear";
        clearBtn.textContent = "Limpar linha";
        clearBtn.addEventListener("click", () => {
          if (onResetEntry) onResetEntry({ key: entry.key, label: entry.label });
          scheduleRender(110);
        });
        actions.appendChild(clearBtn);
        card.appendChild(actions);
        list.appendChild(card);
      });
    };

    search.addEventListener("input", () => renderList());
    renderList();
  }

  function renderActiveModel() {
    if (typeof buildModelFn !== "function") return;
    const baseModel = buildModelFn() || {};
    modelState = baseModel;
    const modal = ensureRoot();
    if (!(modal instanceof HTMLElement)) return;

    const titleEl = modal.querySelector('[data-slot="title"]');
    const subtitleEl = modal.querySelector('[data-slot="subtitle"]');
    const tabsWrap = modal.querySelector('[data-slot="tabs"]');
    const subtabsWrap = modal.querySelector('[data-slot="subtabs"]');
    const panel = modal.querySelector('[data-slot="panel"]');
    if (!(titleEl instanceof HTMLElement)) return;
    if (!(subtitleEl instanceof HTMLElement)) return;
    if (!(tabsWrap instanceof HTMLElement)) return;
    if (!(subtabsWrap instanceof HTMLElement)) return;
    if (!(panel instanceof HTMLElement)) return;

    titleEl.textContent = txt(baseModel.title || "Configuracoes");
    subtitleEl.textContent = txt(baseModel.subtitle || "");

    const tabs = (Array.isArray(baseModel.tabs) ? baseModel.tabs : []).filter((tab) => tab && tab.id);
    if (!tabs.length) {
      tabsWrap.innerHTML = "";
      subtabsWrap.innerHTML = "";
      panel.innerHTML = '<div class="hs2-empty">Nenhuma guia disponivel no momento.</div>';
      return;
    }

    const storedTab = activeTabByHub.get(activeHubId) || "";
    const activeTab =
      tabs.find((tab) => tab.id === storedTab) ||
      tabs[0];
    activeTabByHub.set(activeHubId, activeTab.id);

    tabsWrap.innerHTML = "";
    tabs.forEach((tab) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `hs2-tab ${tab.id === activeTab.id ? "active" : ""}`.trim();
      btn.textContent = txt(tab.label || tab.id);
      btn.addEventListener("click", () => {
        activeTabByHub.set(activeHubId, tab.id);
        const firstSub = Array.isArray(tab.subtabs) && tab.subtabs.length ? tab.subtabs[0].id : "";
        if (firstSub) activeSubtabByHub.set(`${activeHubId}:${tab.id}`, firstSub);
        renderActiveModel();
      });
      tabsWrap.appendChild(btn);
    });

    const subtabs = (Array.isArray(activeTab.subtabs) ? activeTab.subtabs : []).filter((sub) => sub && sub.id);
    const subtabKey = `${activeHubId}:${activeTab.id}`;
    const storedSubtab = activeSubtabByHub.get(subtabKey) || "";
    const activeSubtab =
      subtabs.find((sub) => sub.id === storedSubtab) ||
      subtabs[0] ||
      null;
    if (activeSubtab) activeSubtabByHub.set(subtabKey, activeSubtab.id);

    subtabsWrap.innerHTML = "";
    if (subtabs.length > 1) {
      subtabs.forEach((subtab) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `hs2-subtab ${activeSubtab && subtab.id === activeSubtab.id ? "active" : ""}`.trim();
        btn.textContent = txt(subtab.label || subtab.id);
        btn.addEventListener("click", () => {
          activeSubtabByHub.set(subtabKey, subtab.id);
          renderActiveModel();
        });
        subtabsWrap.appendChild(btn);
      });
    }

    panel.innerHTML = "";
    if (!activeSubtab) {
      panel.innerHTML = '<div class="hs2-empty">Nenhuma subguia disponivel.</div>';
      return;
    }

    if (activeSubtab.statusColors) renderStatusColors(panel, baseModel, activeSubtab);
    else {
      const subtitle = document.createElement("p");
      subtitle.className = "hs2-subtitle";
      subtitle.textContent = txt(activeSubtab.description || "Ajustes disponiveis nesta subguia.");
      panel.appendChild(subtitle);
      renderControls(panel, activeSubtab);
    }
  }

  function closeSettingsHub() {
    const modal = ensureRoot();
    if (!(modal instanceof HTMLElement)) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  }

  function openSettingsHub(options = {}) {
    if (!document?.body) return false;
    injectStyle();
    const modal = ensureRoot();
    if (!(modal instanceof HTMLElement)) return false;
    const hubId = txt(options.id || "default");
    const buildModel =
      typeof options.buildModel === "function"
        ? options.buildModel
        : typeof options.model === "function"
          ? options.model
          : null;
    if (!buildModel) return false;

    activeHubId = hubId;
    buildModelFn = buildModel;
    renderActiveModel();
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    return true;
  }

  const api = window[API_NAME] || {};
  api.openSettingsHub = openSettingsHub;
  api.closeSettingsHub = closeSettingsHub;
  api.refreshSettingsHub = () => renderActiveModel();
  api.extractSituacaoTextFromCell = extractSituacaoTextFromCell;
  api.applySituacaoTextPaint = applySituacaoTextPaint;
  api.clearSituacaoRowPaint = clearSituacaoRowPaint;
  api.applySituacaoRowPaint = applySituacaoRowPaint;
  api.applySituacaoBadgePaint = applySituacaoBadgePaint;
  api.showChamadoUpdateNotification = showChamadoUpdateNotification;
  api.runSettingsNotificationTest = runSettingsNotificationTest;
  api.showPlainNotificationFallback = showPlainNotificationFallback;
  window[API_NAME] = api;
})();

// HS_SETTINGS_EMBEDDED_END
