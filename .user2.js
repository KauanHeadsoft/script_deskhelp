(() => {
  const API_NAME = "HSHeadsoftUser2";
  const USER2_VERSION = "3.00.04";
  const USER2_UPDATES = Object.freeze([
    {
      version: "3.00.04",
      date: "2026-03-13",
      notes: [
        "A v2 deixou de depender visualmente da tabela antiga e passou a montar uma lista moderna de chamados em cards.",
        "Preview lateral ficou mais dominante e coerente com a proposta de um workspace novo, sem competir com a grade legada.",
        "Dashboard ganhou filtros locais da v2 e leitura mais limpa para triagem diaria.",
      ],
    },
    {
      version: "3.00.03",
      date: "2026-03-13",
      notes: [
        "Dashboard e consulta ganharam shell propria da v2 com visual mais limpo e inspirado no Dracula.",
        "Nova lateral de preview mostra a requisicao sem sair da grade, reforcando a sensacao de outro sistema.",
        "Tela da requisicao tambem recebe a linguagem visual da v2 quando essa versao estiver ativa.",
      ],
    },
    {
      version: "3.00.02",
      date: "2026-03-13",
      notes: [
        "Bootstrap do user2 foi reforcado para subir junto do fallback remoto do user.js.",
        "Painel experimental volta a abrir com mais confianca e a repaginacao do grid passa a ser montada logo apos a ativacao.",
      ],
    },
  ]);

  const ROOT_CLASS = "hsu2-active";
  const STYLE_ID = "hsu2-style";
  const BADGE_ID = "hsu2-badge";
  const PANEL_ID = "hsu2-panel";
  const SHELL_ID = "hsu2-shell";
  const MAIN_ID = "hsu2-main";
  const PREVIEW_ID = "hsu2-preview";
  const LIST_ID = "hsu2-list";
  const BOARD_ID = "hsu2-board";
  const REQUEST_BADGE_ID = "hsu2-request-badge";
  const TABLE_SELECTOR = "#conteudo table.sortable";
  const FILTER_SELECTOR = "#conteudo form[name='filtros']";
  const MODE_KEY = "hs2025-experimental-user2-mode";
  const SETTINGS_KEY = "hs2025-user2-settings-v2";
  const PREVIEW_PARAM = "hsu2_preview";
  const POPUP_PREVIEW_PARAM = "hs_preview_popup";

  const DEFAULT_SETTINGS = Object.freeze({
    density: "comfortable",
    showMetrics: true,
    showAge: true,
    livePreview: true,
  });

  let observer = null;
  let timer = 0;
  let heartbeat = 0;
  let lastPayload = {};
  let lastStats = null;
  let lastSignature = "";
  let selectedKey = "";
  let activeBoardFilter = "all";

  const SEARCH_PARAMS = new URLSearchParams(location.search || "");
  const IS_PREVIEW_FRAME = SEARCH_PARAMS.get(PREVIEW_PARAM) === "1";

  const txt = (value) => String(value || "").replace(/\s+/g, " ").trim();
  const by = (id) => document.getElementById(id);
  const escAttr = (value) => String(value || "").replace(/["\\]/g, "\\$&");
  const norm = (value) =>
    txt(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  function isEnabled() {
    try {
      return String(localStorage.getItem(MODE_KEY) || "").trim() === "1";
    } catch {
      return false;
    }
  }

  function setEnabled(next) {
    try {
      localStorage.setItem(MODE_KEY, next ? "1" : "0");
    } catch {}
    return !!next;
  }

  function isDashboardPage() {
    return /dashboard\.php|consulta_requisicao\.php/i.test(location.pathname);
  }

  function isRequestPage() {
    return /visualizar_requisicao\.php/i.test(location.pathname);
  }

  function readSettings() {
    try {
      const parsed = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
      return {
        density: ["compact", "comfortable", "airy"].includes(parsed?.density)
          ? parsed.density
          : DEFAULT_SETTINGS.density,
        showMetrics: parsed?.showMetrics !== false,
        showAge: parsed?.showAge !== false,
        livePreview: parsed?.livePreview !== false,
      };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  }

  function writeSettings(next) {
    const merged = { ...readSettings(), ...(next || {}) };
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
    } catch {}
    return merged;
  }

  function parseDate(raw) {
    const match = txt(raw).match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?:\s+(\d{1,2}):(\d{2}))?/);
    if (!match) return null;
    const year = Number(match[3].length === 2 ? `20${match[3]}` : match[3]);
    const date = new Date(year, Number(match[2]) - 1, Number(match[1]), Number(match[4] || 0), Number(match[5] || 0));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function formatAge(date) {
    if (!(date instanceof Date)) return "";
    const diff = Math.max(0, Date.now() - date.getTime());
    const hours = Math.floor(diff / 36e5);
    if (hours < 1) return "agora";
    if (hours < 24) return `${hours} h`;
    return `${Math.floor(hours / 24)} d`;
  }

  function ensureStyle() {
    if (by(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      body.${ROOT_CLASS}{--bg:#282a36;--card:#21222c;--card2:#2f3341;--line:#44475a;--text:#f8f8f2;--muted:#98a3c7;--cyan:#72d8ff;--blue:#5aa9ff;--green:#6ee7b7;--amber:#ffca80;--red:#ff7b88;--py:10px;--px:12px;}
      body.${ROOT_CLASS}[data-hsu2-density="compact"]{--py:7px;--px:10px;}
      body.${ROOT_CLASS}[data-hsu2-density="airy"]{--py:13px;--px:14px;}
      body.${ROOT_CLASS}:not(.hs-login-page){background:radial-gradient(circle at top right, rgba(90,169,255,.08), transparent 26%),var(--bg)!important;color:var(--text)!important;}
      body.${ROOT_CLASS} a{color:var(--cyan)!important;}
      body.${ROOT_CLASS} #cabecalho{background:linear-gradient(135deg, rgba(33,34,44,.98), rgba(47,51,65,.94))!important;border-bottom:1px solid rgba(68,71,90,.8)!important;}
      body.${ROOT_CLASS} #conteudo::before{content:"User2 v${USER2_VERSION}"!important;display:block!important;width:max-content!important;margin:8px 0 12px!important;padding:8px 14px!important;border-radius:999px!important;border:1px solid rgba(68,71,90,.8)!important;background:linear-gradient(90deg, rgba(33,34,44,.98), rgba(47,51,65,.92))!important;color:var(--text)!important;font:800 12px/1 'Segoe UI',Tahoma,sans-serif!important;letter-spacing:.08em!important;text-transform:uppercase!important;}
      body.${ROOT_CLASS} ${FILTER_SELECTOR}{background:linear-gradient(180deg, rgba(33,34,44,.98), rgba(30,32,42,.96))!important;border:1px solid rgba(68,71,90,.8)!important;border-radius:22px!important;padding:14px 16px!important;box-shadow:0 22px 54px rgba(10,12,20,.34)!important;margin:0!important;}
      body.${ROOT_CLASS} ${FILTER_SELECTOR} table{width:100%!important;border-collapse:separate!important;border-spacing:6px 10px!important;}
      body.${ROOT_CLASS} ${FILTER_SELECTOR} :is(th,td,label){color:var(--text)!important;}
      body.${ROOT_CLASS} ${FILTER_SELECTOR} th{font-size:11px!important;text-transform:uppercase!important;letter-spacing:.08em!important;color:var(--muted)!important;}
      body.${ROOT_CLASS} ${FILTER_SELECTOR} :is(input[type="text"],select,textarea){background:rgba(47,51,65,.94)!important;color:var(--text)!important;border:1px solid rgba(68,71,90,.88)!important;border-radius:12px!important;}
      body.${ROOT_CLASS} ${FILTER_SELECTOR} :is(input[type="button"],input[type="submit"],button){background:linear-gradient(180deg, rgba(47,51,65,.98), rgba(36,38,49,.98))!important;color:var(--text)!important;border:1px solid rgba(68,71,90,.88)!important;border-radius:12px!important;}
      body.${ROOT_CLASS} #${SHELL_ID}{display:grid!important;grid-template-columns:minmax(0,1fr) 360px!important;gap:16px!important;align-items:start!important;}
      body.${ROOT_CLASS} #${MAIN_ID}{min-width:0!important;display:grid!important;gap:14px!important;}
      body.${ROOT_CLASS} #${PREVIEW_ID}{position:sticky!important;top:78px!important;display:grid!important;gap:12px!important;}
      body.${ROOT_CLASS} .hsu2-card{border:1px solid rgba(68,71,90,.88)!important;border-radius:22px!important;background:linear-gradient(180deg, rgba(33,34,44,.98), rgba(30,32,42,.96))!important;box-shadow:0 22px 54px rgba(10,12,20,.34)!important;overflow:hidden!important;}
      body.${ROOT_CLASS} .hsu2-head{display:flex!important;align-items:flex-start!important;justify-content:space-between!important;gap:12px!important;padding:16px 16px 12px!important;border-bottom:1px solid rgba(68,71,90,.6)!important;}
      body.${ROOT_CLASS} .hsu2-head h3{margin:0!important;color:var(--text)!important;font:900 18px/1.15 'Segoe UI',Tahoma,sans-serif!important;}
      body.${ROOT_CLASS} .hsu2-head p{margin:6px 0 0!important;color:var(--muted)!important;font:600 12px/1.4 'Segoe UI',Tahoma,sans-serif!important;}
      body.${ROOT_CLASS} .hsu2-body{padding:14px 16px 16px!important;}
      body.${ROOT_CLASS} .hsu2-board-grid{display:grid!important;grid-template-columns:repeat(5, minmax(0,1fr))!important;gap:10px!important;}
      body.${ROOT_CLASS} .hsu2-kpi{border-radius:18px!important;padding:12px!important;border:1px solid rgba(68,71,90,.78)!important;background:linear-gradient(180deg, rgba(47,51,65,.96), rgba(36,38,49,.98))!important;}
      body.${ROOT_CLASS} .hsu2-kpi strong{display:block!important;color:var(--text)!important;font:900 25px/1 'Segoe UI',Tahoma,sans-serif!important;}
      body.${ROOT_CLASS} .hsu2-kpi span{display:block!important;margin-top:6px!important;color:var(--muted)!important;font:800 10px/1.25 'Segoe UI',Tahoma,sans-serif!important;text-transform:uppercase!important;letter-spacing:.08em!important;}
      body.${ROOT_CLASS} .hsu2-tags,.hsu2-meta{display:flex!important;flex-wrap:wrap!important;gap:6px!important;}
      body.${ROOT_CLASS} .hsu2-tags{margin-top:12px!important;}
      body.${ROOT_CLASS} .hsu2-chip,.hsu2-status,.hsu2-action,.hsu2-preview-btn{display:inline-flex!important;align-items:center!important;min-height:26px!important;padding:0 10px!important;border-radius:999px!important;border:1px solid rgba(68,71,90,.84)!important;background:rgba(47,51,65,.9)!important;color:var(--text)!important;font:800 10px/1 'Segoe UI',Tahoma,sans-serif!important;letter-spacing:.05em!important;text-transform:uppercase!important;}
      body.${ROOT_CLASS} .hsu2-action,.hsu2-preview-btn{cursor:pointer!important;text-decoration:none!important;}
      body.${ROOT_CLASS} .hsu2-chip.empty{color:#ffd7de!important;border-color:rgba(255,123,136,.5)!important;}
      body.${ROOT_CLASS} .hsu2-chip.old{color:#ffe6b6!important;border-color:rgba(255,202,128,.5)!important;}
      body.${ROOT_CLASS} .hsu2-status.new{color:#dafceb!important;border-color:rgba(110,231,183,.56)!important;}
      body.${ROOT_CLASS} .hsu2-status.waiting{color:#def9ff!important;border-color:rgba(114,216,255,.5)!important;}
      body.${ROOT_CLASS} .hsu2-status.alert{color:#ffe2e8!important;border-color:rgba(255,123,136,.5)!important;}
      body.${ROOT_CLASS} table.sortable.hsu2-table{width:100%!important;border-collapse:separate!important;border-spacing:0 10px!important;background:transparent!important;}
      body.${ROOT_CLASS} table.sortable.hsu2-table thead th{position:sticky!important;top:0!important;z-index:2!important;background:linear-gradient(180deg, rgba(47,51,65,.98), rgba(36,38,49,.98))!important;color:var(--text)!important;border-top:1px solid rgba(68,71,90,.88)!important;border-bottom:1px solid rgba(68,71,90,.88)!important;padding:11px 12px!important;text-transform:uppercase!important;letter-spacing:.08em!important;font-size:10px!important;}
      body.${ROOT_CLASS} table.sortable.hsu2-table tbody td{padding:var(--py) var(--px)!important;background:rgba(36,38,49,.98)!important;color:var(--text)!important;border-top:1px solid rgba(68,71,90,.88)!important;border-bottom:1px solid rgba(68,71,90,.88)!important;vertical-align:middle!important;}
      body.${ROOT_CLASS} table.sortable.hsu2-table tbody tr:hover td{background:rgba(47,51,65,.98)!important;}
      body.${ROOT_CLASS} table.sortable.hsu2-table tbody td:first-child,body.${ROOT_CLASS} table.sortable.hsu2-table thead th:first-child{border-left:1px solid rgba(68,71,90,.88)!important;border-top-left-radius:18px!important;border-bottom-left-radius:18px!important;}
      body.${ROOT_CLASS} table.sortable.hsu2-table tbody td:last-child,body.${ROOT_CLASS} table.sortable.hsu2-table thead th:last-child{border-right:1px solid rgba(68,71,90,.88)!important;border-top-right-radius:18px!important;border-bottom-right-radius:18px!important;}
      body.${ROOT_CLASS} table.sortable.hsu2-table tbody tr.hsu2-row-new td{box-shadow:inset 3px 0 0 rgba(110,231,183,.82)!important;}
      body.${ROOT_CLASS} table.sortable.hsu2-table tbody tr.hsu2-row-old td{box-shadow:inset 3px 0 0 rgba(255,202,128,.84)!important;}
      body.${ROOT_CLASS} table.sortable.hsu2-table tbody tr.hsu2-row-unassigned td{box-shadow:inset 3px 0 0 rgba(255,123,136,.84)!important;}
      body.${ROOT_CLASS} table.sortable.hsu2-table tbody tr.hsu2-row-selected td{outline:1px solid rgba(114,216,255,.44)!important;}
      body.${ROOT_CLASS} .hsu2-title-main{display:block!important;color:var(--text)!important;font:800 13px/1.35 'Segoe UI',Tahoma,sans-serif!important;}
      body.${ROOT_CLASS} .hsu2-title-main a{color:var(--text)!important;text-decoration:none!important;}
      body.${ROOT_CLASS} .hsu2-title-main a:hover{color:#fff!important;}
      body.${ROOT_CLASS} .hsu2-preview-grid{display:grid!important;grid-template-columns:repeat(2, minmax(0,1fr))!important;gap:10px!important;}
      body.${ROOT_CLASS} .hsu2-box{border:1px solid rgba(68,71,90,.78)!important;border-radius:14px!important;padding:10px!important;background:rgba(47,51,65,.5)!important;}
      body.${ROOT_CLASS} .hsu2-box .k{margin:0!important;color:var(--muted)!important;font:800 10px/1.2 'Segoe UI',Tahoma,sans-serif!important;text-transform:uppercase!important;letter-spacing:.08em!important;}
      body.${ROOT_CLASS} .hsu2-box .v{margin:6px 0 0!important;color:var(--text)!important;font:700 13px/1.4 'Segoe UI',Tahoma,sans-serif!important;}
      body.${ROOT_CLASS} .hsu2-preview-frame{width:100%!important;min-height:520px!important;border:0!important;background:#1f2230!important;}
      body.${ROOT_CLASS} .hsu2-empty{border:1px dashed rgba(68,71,90,.88)!important;border-radius:16px!important;padding:14px!important;color:var(--muted)!important;font:700 12px/1.45 'Segoe UI',Tahoma,sans-serif!important;}
      #${BADGE_ID}{position:fixed!important;top:88px!important;right:16px!important;z-index:1000048!important;display:flex!important;align-items:center!important;gap:8px!important;padding:10px 14px!important;border-radius:999px!important;border:1px solid rgba(68,71,90,.88)!important;background:linear-gradient(135deg, rgba(33,34,44,.98), rgba(47,51,65,.94))!important;color:var(--text)!important;font:800 12px/1 'Segoe UI',Tahoma,sans-serif!important;cursor:pointer!important;}
      #${BADGE_ID}::before{content:"";width:10px;height:10px;border-radius:50%;background:linear-gradient(180deg, var(--cyan), var(--blue));box-shadow:0 0 0 4px rgba(114,216,255,.14);}
      #${PANEL_ID}{position:fixed!important;right:16px!important;top:136px!important;width:min(460px, calc(100vw - 32px))!important;max-height:min(84vh, 860px)!important;overflow:auto!important;z-index:1000049!important;}
      #${PANEL_ID}[hidden]{display:none!important;}
      #${PANEL_ID} .panel-grid{display:grid!important;gap:12px!important;padding:14px 16px 16px!important;}
      #${PANEL_ID} .grid2{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important;}
      #${PANEL_ID} .label{margin:0 0 6px!important;color:var(--muted)!important;font:800 10px/1.2 'Segoe UI',Tahoma,sans-serif!important;text-transform:uppercase!important;letter-spacing:.08em!important;}
      #${PANEL_ID} .value{margin:0!important;color:var(--text)!important;font:700 13px/1.4 'Segoe UI',Tahoma,sans-serif!important;}
      #${PANEL_ID} select,#${PANEL_ID} .btn{min-height:36px!important;border-radius:12px!important;border:1px solid rgba(68,71,90,.88)!important;background:linear-gradient(180deg, rgba(47,51,65,.98), rgba(36,38,49,.98))!important;color:var(--text)!important;font:800 12px/1 'Segoe UI',Tahoma,sans-serif!important;}
      #${PANEL_ID} select{padding:0 10px!important;}
      #${PANEL_ID} .btn{padding:0 12px!important;cursor:pointer!important;}
      #${PANEL_ID} .controls{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important;}
      #${PANEL_ID} .toggle{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:8px!important;}
      #${PANEL_ID} .actions{display:flex!important;flex-wrap:wrap!important;gap:8px!important;}
      body.${ROOT_CLASS}.hs-request-page #${REQUEST_BADGE_ID}{margin:0 0 12px!important;padding:12px 14px!important;display:flex!important;justify-content:space-between!important;gap:12px!important;}
      body.${ROOT_CLASS}.hs-request-page #${REQUEST_BADGE_ID} strong{font:900 15px/1.1 'Segoe UI',Tahoma,sans-serif!important;}
      body.${ROOT_CLASS}.hs-request-page #${REQUEST_BADGE_ID} span{color:var(--muted)!important;font:700 12px/1.35 'Segoe UI',Tahoma,sans-serif!important;}
      body.${ROOT_CLASS}.hs-request-page #interno .requisicao_top,body.${ROOT_CLASS}.hs-request-page #interno .categorias,body.${ROOT_CLASS}.hs-request-page #interno .detalhes,body.${ROOT_CLASS}.hs-request-page #interno .acompanhamentos,body.${ROOT_CLASS}.hs-request-page #interno #Novo_Acompanhamento,body.${ROOT_CLASS}.hs-request-page #interno .novo_consumo_interno{background:linear-gradient(180deg, rgba(33,34,44,.98), rgba(30,32,42,.96))!important;border:1px solid rgba(68,71,90,.88)!important;border-radius:22px!important;box-shadow:0 22px 54px rgba(10,12,20,.34)!important;}
      body.${ROOT_CLASS}.hs-request-page #interno table:not(.sortable) td,body.${ROOT_CLASS}.hs-request-page #interno table:not(.sortable) th{background:rgba(47,51,65,.7)!important;border-color:rgba(68,71,90,.88)!important;color:var(--text)!important;}
      @media (max-width: 1180px){body.${ROOT_CLASS} #${SHELL_ID}{grid-template-columns:1fr!important;}body.${ROOT_CLASS} #${PREVIEW_ID}{position:static!important;}body.${ROOT_CLASS} .hsu2-board-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;}}
      @media (max-width: 760px){body.${ROOT_CLASS} .hsu2-board-grid,body.${ROOT_CLASS} .hsu2-preview-grid,#${PANEL_ID} .grid2,#${PANEL_ID} .controls{grid-template-columns:1fr!important;}#${BADGE_ID}{top:auto!important;bottom:14px!important;}#${PANEL_ID}{left:10px!important;right:10px!important;width:auto!important;top:auto!important;bottom:70px!important;max-height:calc(100vh - 90px)!important;}}
    `;
    document.head.appendChild(style);
  }

  function ensureModernOverrides() {
    if (by(`${STYLE_ID}-modern`)) return;
    const style = document.createElement("style");
    style.id = `${STYLE_ID}-modern`;
    style.textContent = `
      body.${ROOT_CLASS} #${SHELL_ID}{
        grid-template-columns:minmax(0, 1fr) 400px!important;
        gap:20px!important;
      }
      body.${ROOT_CLASS} table.sortable.hsu2-source-table{
        display:none!important;
      }
      body.${ROOT_CLASS} #${LIST_ID}{
        display:grid!important;
        gap:14px!important;
      }
      body.${ROOT_CLASS} .hsu2-ticket{
        border:1px solid rgba(90,95,122,.92)!important;
        border-radius:24px!important;
        background:
          radial-gradient(circle at top right, rgba(114,216,255,.06), transparent 24%),
          linear-gradient(180deg, rgba(33,34,44,.99), rgba(28,30,40,.98))!important;
        box-shadow:0 18px 40px rgba(8,10,18,.28)!important;
        padding:16px!important;
        display:grid!important;
        gap:14px!important;
        transition:transform .18s ease, border-color .18s ease, box-shadow .18s ease!important;
      }
      body.${ROOT_CLASS} .hsu2-ticket:hover{
        transform:translateY(-1px)!important;
        border-color:rgba(114,216,255,.42)!important;
        box-shadow:0 22px 48px rgba(8,10,18,.34)!important;
      }
      body.${ROOT_CLASS} .hsu2-ticket.selected{
        border-color:rgba(114,216,255,.52)!important;
        box-shadow:0 0 0 1px rgba(114,216,255,.22), 0 24px 48px rgba(8,10,18,.38)!important;
      }
      body.${ROOT_CLASS} .hsu2-ticket-head{
        display:flex!important;
        align-items:flex-start!important;
        justify-content:space-between!important;
        gap:14px!important;
      }
      body.${ROOT_CLASS} .hsu2-ticket-main{
        min-width:0!important;
        display:grid!important;
        gap:8px!important;
      }
      body.${ROOT_CLASS} .hsu2-ticket-kicker{
        display:flex!important;
        flex-wrap:wrap!important;
        gap:8px!important;
      }
      body.${ROOT_CLASS} .hsu2-ticket-title{
        margin:0!important;
        color:var(--text)!important;
        font:900 17px/1.22 'Segoe UI',Tahoma,sans-serif!important;
        letter-spacing:-.01em!important;
      }
      body.${ROOT_CLASS} .hsu2-ticket-summary{
        margin:0!important;
        color:var(--muted)!important;
        font:600 12px/1.5 'Segoe UI',Tahoma,sans-serif!important;
      }
      body.${ROOT_CLASS} .hsu2-ticket-side{
        display:grid!important;
        justify-items:end!important;
        gap:8px!important;
        min-width:150px!important;
      }
      body.${ROOT_CLASS} .hsu2-priority{
        display:inline-flex!important;
        align-items:center!important;
        gap:6px!important;
        min-height:28px!important;
        padding:0 12px!important;
        border-radius:999px!important;
        background:rgba(47,51,65,.92)!important;
        border:1px solid rgba(68,71,90,.9)!important;
        color:var(--text)!important;
        font:900 10px/1 'Segoe UI',Tahoma,sans-serif!important;
        letter-spacing:.08em!important;
        text-transform:uppercase!important;
      }
      body.${ROOT_CLASS} .hsu2-priority.high{
        border-color:rgba(255,123,136,.58)!important;
        color:#ffe2e8!important;
      }
      body.${ROOT_CLASS} .hsu2-priority.medium{
        border-color:rgba(255,202,128,.58)!important;
        color:#ffe8bd!important;
      }
      body.${ROOT_CLASS} .hsu2-ticket-grid{
        display:grid!important;
        grid-template-columns:repeat(4, minmax(0,1fr))!important;
        gap:10px!important;
      }
      body.${ROOT_CLASS} .hsu2-metric{
        border:1px solid rgba(68,71,90,.72)!important;
        border-radius:16px!important;
        background:rgba(47,51,65,.48)!important;
        padding:10px 12px!important;
      }
      body.${ROOT_CLASS} .hsu2-metric .k{
        margin:0!important;
        color:var(--muted)!important;
        font:800 10px/1.2 'Segoe UI',Tahoma,sans-serif!important;
        text-transform:uppercase!important;
        letter-spacing:.08em!important;
      }
      body.${ROOT_CLASS} .hsu2-metric .v{
        margin:6px 0 0!important;
        color:var(--text)!important;
        font:800 13px/1.35 'Segoe UI',Tahoma,sans-serif!important;
        word-break:break-word!important;
      }
      body.${ROOT_CLASS} .hsu2-ticket-actions{
        display:flex!important;
        flex-wrap:wrap!important;
        gap:8px!important;
      }
      body.${ROOT_CLASS} .hsu2-action.subtle{
        color:var(--muted)!important;
      }
      body.${ROOT_CLASS} #${PREVIEW_ID}{
        gap:14px!important;
      }
      body.${ROOT_CLASS} #${PREVIEW_ID} .hsu2-card{
        border-radius:24px!important;
      }
      body.${ROOT_CLASS} .hsu2-preview-frame{
        min-height:640px!important;
        border-radius:18px!important;
      }
      body.${ROOT_CLASS} .hsu2-empty{
        min-height:96px!important;
        display:flex!important;
        align-items:center!important;
      }
      body.${ROOT_CLASS} .hsu2-board-grid{
        grid-template-columns:repeat(4, minmax(0,1fr))!important;
      }
      body.${ROOT_CLASS} .hsu2-board-filters{
        display:flex!important;
        flex-wrap:wrap!important;
        gap:8px!important;
        margin-top:12px!important;
      }
      body.${ROOT_CLASS} .hsu2-board-filter{
        display:inline-flex!important;
        align-items:center!important;
        gap:8px!important;
        min-height:30px!important;
        padding:0 12px!important;
        border-radius:999px!important;
        border:1px solid rgba(68,71,90,.88)!important;
        background:rgba(47,51,65,.86)!important;
        color:var(--muted)!important;
        font:900 10px/1 'Segoe UI',Tahoma,sans-serif!important;
        text-transform:uppercase!important;
        letter-spacing:.08em!important;
        cursor:pointer!important;
      }
      body.${ROOT_CLASS} .hsu2-board-filter.active{
        color:var(--text)!important;
        border-color:rgba(114,216,255,.42)!important;
        background:linear-gradient(180deg, rgba(63,71,95,.94), rgba(44,48,62,.96))!important;
      }
      @media (max-width: 1280px){
        body.${ROOT_CLASS} .hsu2-ticket-grid{
          grid-template-columns:repeat(2, minmax(0,1fr))!important;
        }
      }
      @media (max-width: 1180px){
        body.${ROOT_CLASS} #${SHELL_ID}{
          grid-template-columns:1fr!important;
        }
        body.${ROOT_CLASS} .hsu2-board-grid{
          grid-template-columns:repeat(2, minmax(0,1fr))!important;
        }
      }
      @media (max-width: 760px){
        body.${ROOT_CLASS} .hsu2-ticket-head,
        body.${ROOT_CLASS} .hsu2-ticket-side{
          display:grid!important;
          justify-items:start!important;
        }
        body.${ROOT_CLASS} .hsu2-ticket-grid,
        body.${ROOT_CLASS} .hsu2-board-grid{
          grid-template-columns:1fr!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function matchesBoardFilter(data) {
    switch (activeBoardFilter) {
      case "new":
        return data.statusClass === "new";
      case "waiting":
        return data.statusClass === "waiting";
      case "unassigned":
        return data.isUnassigned;
      case "old":
        return data.isOld;
      default:
        return true;
    }
  }

  function getCellText(cell) {
    if (!(cell instanceof HTMLTableCellElement)) return "";
    const clone = cell.cloneNode(true);
    clone.querySelectorAll(".hsu2-meta,.hsu2-status,.hsu2-preview-btn").forEach((el) => el.remove());
    return txt(clone.textContent || "");
  }

  function getIndices(table) {
    const headers = Array.from(table.tHead?.rows?.[0]?.cells || []).map((cell) => norm(cell.textContent || ""));
    const findIndex = (...patterns) => headers.findIndex((header) => patterns.some((rx) => rx.test(header)));
    return {
      number: findIndex(/\bnum/, /\bcod/, /\bid\b/),
      title: findIndex(/titulo/, /assunto/, /descricao/, /requisicao/, /solicitacao/),
      status: findIndex(/situac/),
      owner: findIndex(/responsavel/, /tecnico/, /atendente/),
      client: findIndex(/cliente/, /empresa/, /usuario/),
      date: findIndex(/abertura/, /cadastro/, /atualiza/, /ultima/, /^data$/),
    };
  }

  function classifyStatus(label) {
    const key = norm(label);
    if (/^nova|novas? inform/.test(key)) return "new";
    if (/aguard|penden|analise|aprova|servico|retorno/.test(key)) return "waiting";
    if (/cancel|expir|erro|parado/.test(key)) return "alert";
    return "";
  }

  function buildPreviewHref(href) {
    if (!href) return "";
    try {
      const url = new URL(href, location.origin);
      url.searchParams.set(POPUP_PREVIEW_PARAM, "1");
      url.searchParams.set(PREVIEW_PARAM, "1");
      return url.toString();
    } catch {
      return href;
    }
  }

  function getPrimaryLink(row) {
    const link = row.querySelector('a[href*="visualizar_requisicao.php"]');
    return link instanceof HTMLAnchorElement ? txt(link.href || "") : "";
  }

  function buildRowData(row, idx) {
    const href = getPrimaryLink(row);
    const dateRaw = idx.date >= 0 ? getCellText(row.cells[idx.date]) : "";
    const date = parseDate(dateRaw);
    const ageHours = date ? Math.max(0, (Date.now() - date.getTime()) / 36e5) : NaN;
    const status = idx.status >= 0 ? getCellText(row.cells[idx.status]) : "";
    const statusClass = classifyStatus(status);
    const owner = idx.owner >= 0 ? getCellText(row.cells[idx.owner]) : "";
    const number = idx.number >= 0 ? getCellText(row.cells[idx.number]) : "";
    const priorityScore =
      (statusClass === "new" ? 3 : 0) +
      (statusClass === "alert" ? 2 : 0) +
      (!owner ? 3 : 0) +
      (Number.isFinite(ageHours) && ageHours >= 24 ? 2 : 0);
    return {
      key: number || href || `${row.rowIndex}-${txt(row.textContent || "")}`,
      href,
      previewHref: buildPreviewHref(href),
      number,
      title: idx.title >= 0 ? getCellText(row.cells[idx.title]) : getCellText(row.cells[0]),
      status,
      statusClass,
      owner,
      client: idx.client >= 0 ? getCellText(row.cells[idx.client]) : "",
      dateRaw,
      ageLabel: date ? formatAge(date) : "",
      ageHours,
      isOld: Number.isFinite(ageHours) && ageHours >= 24,
      isUnassigned: !owner,
      priorityScore,
      row,
    };
  }

  function cleanupDashboardDecorations() {
    by(BOARD_ID)?.remove();
    by(LIST_ID)?.remove();
    document.querySelectorAll(`${TABLE_SELECTOR}.hsu2-table`).forEach((table) => {
      table.classList.remove("hsu2-table", "hsu2-source-table");
      table.style.removeProperty("display");
      table.querySelectorAll("td").forEach((cell) => {
        if (cell.dataset.hsu2OriginalHtml) {
          cell.innerHTML = cell.dataset.hsu2OriginalHtml;
          delete cell.dataset.hsu2OriginalHtml;
        }
      });
      table.querySelectorAll("tr").forEach((row) => {
        row.classList.remove("hsu2-row-new", "hsu2-row-old", "hsu2-row-unassigned", "hsu2-row-selected");
        delete row.dataset.hsu2Key;
        row.__hsu2Data = null;
      });
    });
  }

  function ensureShell() {
    if (!isDashboardPage()) return null;
    const content = by("conteudo");
    if (!(content instanceof HTMLElement)) return null;
    let shell = by(SHELL_ID);
    if (!(shell instanceof HTMLElement)) {
      shell = document.createElement("div");
      shell.id = SHELL_ID;
      shell.innerHTML = `<div id="${MAIN_ID}"></div><aside id="${PREVIEW_ID}"></aside>`;
      content.appendChild(shell);
    }
    const main = by(MAIN_ID);
    const preview = by(PREVIEW_ID);
    Array.from(content.children)
      .filter((child) => child instanceof HTMLElement && child !== shell)
      .forEach((child) => main.appendChild(child));
    if (preview.parentElement !== shell) shell.appendChild(preview);
    return { content, shell, main, preview };
  }

  function destroyShell() {
    const shell = by(SHELL_ID);
    const main = by(MAIN_ID);
    const content = by("conteudo");
    if (!(shell instanceof HTMLElement) || !(main instanceof HTMLElement) || !(content instanceof HTMLElement)) return;
    while (main.firstChild) content.insertBefore(main.firstChild, shell);
    shell.remove();
  }

  function selectRow(row) {
    if (!(row instanceof HTMLTableRowElement) || !row.__hsu2Data) return;
    selectedKey = txt(row.dataset.hsu2Key || row.__hsu2Data.key || "");
    document.querySelectorAll(`${TABLE_SELECTOR} tbody tr.hsu2-row-selected`).forEach((item) => item.classList.remove("hsu2-row-selected"));
    document.querySelectorAll(`#${LIST_ID} .hsu2-ticket.selected`).forEach((item) => item.classList.remove("selected"));
    row.classList.add("hsu2-row-selected");
    const card = document.querySelector(`#${LIST_ID} .hsu2-ticket[data-key="${escAttr(selectedKey)}"]`);
    if (card instanceof HTMLElement) card.classList.add("selected");
    renderPreview(row.__hsu2Data);
  }

  function findSelectedData() {
    const row = Array.from(document.querySelectorAll(`${TABLE_SELECTOR} tbody tr`)).find((item) => item instanceof HTMLTableRowElement && item.dataset.hsu2Key === selectedKey);
    return row?.__hsu2Data || null;
  }

  function renderPreview(data = null) {
    const host = by(PREVIEW_ID);
    if (!(host instanceof HTMLElement)) return;
    if (!host.dataset.hsu2Built) {
      host.dataset.hsu2Built = "1";
      host.innerHTML = `
        <section class="hsu2-card">
          <div class="hsu2-head">
            <div><h3>Preview da v2</h3><p>Leitura lateral da requisicao sem sair da grade.</p></div>
            <button type="button" class="hsu2-action" data-action="panel">Painel</button>
          </div>
          <div class="hsu2-body">
            <div class="hsu2-empty" data-slot="empty">Selecione um chamado para ativar o preview lateral.</div>
            <div data-slot="content" hidden>
              <div class="hsu2-tags" data-slot="chips"></div>
              <p class="hsu2-title-main" style="margin-top:10px!important" data-slot="title">-</p>
              <div class="hsu2-preview-grid" data-slot="meta"></div>
              <div class="hsu2-tags" style="margin-top:10px!important">
                <a class="hsu2-action" data-slot="open" href="#" target="_blank" rel="noopener">Abrir chamado</a>
                <button type="button" class="hsu2-action" data-action="copy">Copiar numero</button>
                <button type="button" class="hsu2-action" data-action="reload">Atualizar preview</button>
              </div>
            </div>
          </div>
        </section>
        <section class="hsu2-card">
          <div class="hsu2-head">
            <div><h3>Preview vivo</h3><p>Iframe da propria tela da requisicao.</p></div>
          </div>
          <div class="hsu2-body">
            <div class="hsu2-empty" data-slot="frame-empty">Nenhum chamado selecionado.</div>
            <iframe class="hsu2-preview-frame" data-slot="frame" hidden loading="lazy"></iframe>
          </div>
        </section>
      `;
      host.querySelector('[data-action="panel"]')?.addEventListener("click", () => openPanel(lastPayload));
      host.querySelector('[data-action="copy"]')?.addEventListener("click", async () => {
        const current = findSelectedData();
        if (!current?.number) return;
        let ok = false;
        try {
          if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
            await navigator.clipboard.writeText(current.number);
            ok = true;
          }
        } catch {}
        triggerNotification({ message: ok ? "Numero copiado pela v2." : "Nao foi possivel copiar o numero agora." });
      });
      host.querySelector('[data-action="reload"]')?.addEventListener("click", () => {
        const current = findSelectedData();
        const frame = host.querySelector('[data-slot="frame"]');
        if (current?.previewHref && frame instanceof HTMLIFrameElement) frame.src = current.previewHref;
      });
    }
    const empty = host.querySelector('[data-slot="empty"]');
    const content = host.querySelector('[data-slot="content"]');
    const chips = host.querySelector('[data-slot="chips"]');
    const title = host.querySelector('[data-slot="title"]');
    const meta = host.querySelector('[data-slot="meta"]');
    const open = host.querySelector('[data-slot="open"]');
    const frame = host.querySelector('[data-slot="frame"]');
    const frameEmpty = host.querySelector('[data-slot="frame-empty"]');
    if (!(empty instanceof HTMLElement) || !(content instanceof HTMLElement) || !(chips instanceof HTMLElement) || !(title instanceof HTMLElement) || !(meta instanceof HTMLElement) || !(open instanceof HTMLAnchorElement) || !(frameEmpty instanceof HTMLElement)) return;
    if (!data) {
      empty.hidden = false;
      content.hidden = true;
      chips.innerHTML = "";
      title.textContent = "-";
      meta.innerHTML = "";
      open.href = "#";
      if (frame instanceof HTMLIFrameElement) {
        frame.hidden = true;
        frame.removeAttribute("src");
      }
      frameEmpty.hidden = false;
      return;
    }
    empty.hidden = true;
    content.hidden = false;
    chips.innerHTML = [
      data.number ? `<span class="hsu2-chip">#${data.number}</span>` : "",
      data.status ? `<span class="hsu2-status ${data.statusClass}">${data.status}</span>` : "",
      `<span class="hsu2-chip">${data.priorityScore >= 5 ? "Prioridade alta" : `Prioridade ${data.priorityScore}`}</span>`,
    ].join("");
    title.textContent = txt(data.title || "Chamado sem titulo");
    meta.innerHTML = `
      <div class="hsu2-box"><p class="k">Cliente</p><p class="v">${data.client || "Nao informado"}</p></div>
      <div class="hsu2-box"><p class="k">Responsavel</p><p class="v">${data.owner || "Sem responsavel"}</p></div>
      <div class="hsu2-box"><p class="k">Data</p><p class="v">${data.dateRaw || "Nao informada"}</p></div>
      <div class="hsu2-box"><p class="k">Idade</p><p class="v">${data.ageLabel || "n/d"}</p></div>
    `;
    open.href = data.href || "#";
    if (frame instanceof HTMLIFrameElement && data.previewHref) {
      if (frame.src !== data.previewHref) frame.src = data.previewHref;
      frame.hidden = false;
      frameEmpty.hidden = true;
    } else if (frame instanceof HTMLIFrameElement) {
      frame.hidden = true;
      frame.removeAttribute("src");
      frameEmpty.hidden = false;
    }
  }

  function decorateTables() {
    const tables = Array.from(document.querySelectorAll(TABLE_SELECTOR)).filter((table) => table instanceof HTMLTableElement);
    const rows = [];
    tables.forEach((table) => {
      table.classList.add("hsu2-table", "hsu2-source-table");
      table.style.setProperty("display", "none", "important");
      const idx = getIndices(table);
      Array.from(table.tBodies?.[0]?.rows || []).forEach((row) => {
        if (!(row instanceof HTMLTableRowElement)) return;
        const data = buildRowData(row, idx);
        row.__hsu2Data = data;
        row.dataset.hsu2Key = txt(data.key);
        row.classList.toggle("hsu2-row-new", data.statusClass === "new");
        row.classList.toggle("hsu2-row-old", data.isOld);
        row.classList.toggle("hsu2-row-unassigned", data.isUnassigned);
        rows.push(data);
      });
    });
    return rows;
  }

  function ensureListHost() {
    const main = by(MAIN_ID);
    if (!(main instanceof HTMLElement)) return null;
    let host = by(LIST_ID);
    if (!(host instanceof HTMLElement)) {
      host = document.createElement("section");
      host.id = LIST_ID;
      main.appendChild(host);
    }
    return host;
  }

  function renderTicketList(rows) {
    const host = ensureListHost();
    if (!(host instanceof HTMLElement)) return;
    const settings = readSettings();
    const filtered = rows.filter(matchesBoardFilter);
    if (!filtered.length) {
      host.innerHTML = `<div class="hsu2-empty">Nenhum chamado corresponde ao filtro local da v2.</div>`;
      return;
    }
    host.innerHTML = filtered
      .map((data) => {
        const priority =
          data.priorityScore >= 5 ? "high" : data.priorityScore >= 3 ? "medium" : "normal";
        const priorityLabel =
          priority === "high" ? "Prioridade alta" : priority === "medium" ? "Prioridade media" : "Prioridade normal";
        return `
          <article class="hsu2-ticket${selectedKey === data.key ? " selected" : ""}" data-key="${escAttr(data.key)}">
            <div class="hsu2-ticket-head">
              <div class="hsu2-ticket-main">
                <div class="hsu2-ticket-kicker">
                  ${data.number ? `<span class="hsu2-chip">#${data.number}</span>` : ""}
                  ${data.status ? `<span class="hsu2-status ${data.statusClass}">${data.status}</span>` : ""}
                  ${data.owner ? `<span class="hsu2-chip">${data.owner}</span>` : `<span class="hsu2-chip empty">Sem responsavel</span>`}
                </div>
                <h3 class="hsu2-ticket-title">${data.title || "Chamado sem titulo"}</h3>
                <p class="hsu2-ticket-summary">${data.client || "Cliente nao informado"}${data.dateRaw ? ` • aberto em ${data.dateRaw}` : ""}</p>
              </div>
              <div class="hsu2-ticket-side">
                <span class="hsu2-priority ${priority}">${priorityLabel}</span>
                <div class="hsu2-tags">
                  <button type="button" class="hsu2-preview-btn" data-action="preview">Preview</button>
                  ${
                    data.href
                      ? `<a class="hsu2-action subtle" href="${data.href}" target="_blank" rel="noopener">Abrir</a>`
                      : ""
                  }
                </div>
              </div>
            </div>
            <div class="hsu2-ticket-grid">
              <div class="hsu2-metric"><p class="k">Cliente</p><p class="v">${data.client || "Nao informado"}</p></div>
              <div class="hsu2-metric"><p class="k">Responsavel</p><p class="v">${data.owner || "Sem responsavel"}</p></div>
              <div class="hsu2-metric"><p class="k">Data</p><p class="v">${data.dateRaw || "Nao informada"}</p></div>
              <div class="hsu2-metric"><p class="k">Idade</p><p class="v">${
                settings.showAge ? data.ageLabel || "n/d" : "Oculta"
              }</p></div>
            </div>
          </article>
        `;
      })
      .join("");
    host.querySelectorAll(".hsu2-ticket").forEach((card) => {
      card.addEventListener("mouseenter", () => {
        const key = txt(card.getAttribute("data-key"));
        const row = rows.find((item) => item.key === key)?.row || null;
        if (row instanceof HTMLTableRowElement && readSettings().livePreview) selectRow(row);
      });
      card.addEventListener("click", (ev) => {
        const key = txt(card.getAttribute("data-key"));
        const row = rows.find((item) => item.key === key)?.row || null;
        if (!(row instanceof HTMLTableRowElement)) return;
        const target = ev.target instanceof HTMLElement ? ev.target : null;
        if (target?.closest('a[href]')) return;
        selectRow(row);
      });
    });
  }

  function buildStats(rows) {
    const ages = rows.map((row) => row.ageHours).filter((value) => Number.isFinite(value));
    return {
      total: rows.length,
      novas: rows.filter((row) => row.statusClass === "new").length,
      aguardando: rows.filter((row) => row.statusClass === "waiting").length,
      semResponsavel: rows.filter((row) => row.isUnassigned).length,
      antigas: rows.filter((row) => row.isOld).length,
      mediaHoras: ages.length ? ages.reduce((sum, value) => sum + value, 0) / ages.length : 0,
      maisAntigo: ages.length ? Math.max(...ages) : 0,
    };
  }

  function ensureBoard(stats) {
    if (!readSettings().showMetrics) {
      by(BOARD_ID)?.remove();
      return;
    }
    const main = by(MAIN_ID);
    if (!(main instanceof HTMLElement)) return;
    let board = by(BOARD_ID);
    if (!(board instanceof HTMLElement)) {
      board = document.createElement("section");
      board.id = BOARD_ID;
      board.className = "hsu2-card";
      main.prepend(board);
    }
    board.innerHTML = `
      <div class="hsu2-head">
        <div><h3>Fila inteligente de chamados</h3><p>Mesmo grid legado, mas melhor distribuido, mais leve e com cara de outro sistema.</p></div>
        <button type="button" class="hsu2-action" data-action="panel">Painel da v2</button>
      </div>
      <div class="hsu2-body">
        <div class="hsu2-board-grid">
          <article class="hsu2-kpi"><strong>${stats.total}</strong><span>Total visivel</span></article>
          <article class="hsu2-kpi"><strong>${stats.novas}</strong><span>Novos / retorno</span></article>
          <article class="hsu2-kpi"><strong>${stats.aguardando}</strong><span>Aguardando</span></article>
          <article class="hsu2-kpi"><strong>${stats.semResponsavel}</strong><span>Sem responsavel</span></article>
          <article class="hsu2-kpi"><strong>${stats.maisAntigo ? `${Math.round(stats.maisAntigo)}h` : "n/d"}</strong><span>Mais antigo</span></article>
        </div>
        <div class="hsu2-tags">
          <span class="hsu2-chip">${stats.antigas} acima de 24h</span>
          <span class="hsu2-chip">${stats.mediaHoras ? `${stats.mediaHoras.toFixed(1)}h` : "n/d"} de tempo medio</span>
        </div>
        <div class="hsu2-board-filters">
          <button type="button" class="hsu2-board-filter ${activeBoardFilter === "all" ? "active" : ""}" data-filter="all">Todos</button>
          <button type="button" class="hsu2-board-filter ${activeBoardFilter === "new" ? "active" : ""}" data-filter="new">Novos</button>
          <button type="button" class="hsu2-board-filter ${activeBoardFilter === "waiting" ? "active" : ""}" data-filter="waiting">Aguardando</button>
          <button type="button" class="hsu2-board-filter ${activeBoardFilter === "unassigned" ? "active" : ""}" data-filter="unassigned">Sem responsavel</button>
          <button type="button" class="hsu2-board-filter ${activeBoardFilter === "old" ? "active" : ""}" data-filter="old">Antigos</button>
        </div>
      </div>
    `;
    board.querySelector('[data-action="panel"]')?.addEventListener("click", () => openPanel(lastPayload));
    board.querySelectorAll(".hsu2-board-filter").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeBoardFilter = txt(btn.getAttribute("data-filter") || "all");
        refreshDashboard(true);
      });
    });
  }

  function ensureRequestBadge() {
    if (!isRequestPage()) {
      by(REQUEST_BADGE_ID)?.remove();
      return;
    }
    const root = by("interno") || by("conteudo");
    if (!(root instanceof HTMLElement)) return;
    let badge = by(REQUEST_BADGE_ID);
    if (!(badge instanceof HTMLElement)) {
      badge = document.createElement("section");
      badge.id = REQUEST_BADGE_ID;
      badge.className = "hsu2-card";
      root.insertBefore(badge, root.firstChild);
    }
    badge.innerHTML = `<div><strong>Workspace v2 da requisicao</strong><span>Visual reorganizado no estilo Dracula para leitura mais confortavel da tela completa.</span></div><button type="button" class="hsu2-action" data-action="panel">Painel da v2</button>`;
    badge.querySelector('[data-action="panel"]')?.addEventListener("click", () => openPanel(lastPayload));
  }

  function computeSignature() {
    const tables = Array.from(document.querySelectorAll(TABLE_SELECTOR));
    return `${location.pathname}|${tables.map((table) => table.tBodies?.[0]?.rows?.length || 0).join(",")}`;
  }

  function refreshDashboard(force = false) {
    ensureShell();
    const signature = computeSignature();
    if (!force && signature === lastSignature && by(BOARD_ID) && by(PREVIEW_ID)) return;
    cleanupDashboardDecorations();
    const rows = decorateTables();
    lastStats = buildStats(rows);
    ensureBoard(lastStats);
    renderTicketList(rows);
    const chosen =
      rows.find((row) => row.key === selectedKey)?.row ||
      rows.sort((a, b) => b.priorityScore - a.priorityScore)[0]?.row ||
      null;
    renderPreview(null);
    if (chosen) selectRow(chosen);
    lastSignature = signature;
  }

  function refreshExperience(force = false) {
    applyPreferences();
    if (isDashboardPage()) refreshDashboard(force);
    else {
      cleanupDashboardDecorations();
      destroyShell();
      renderPreview(null);
      lastStats = null;
      lastSignature = computeSignature();
    }
    ensureRequestBadge();
    syncPanel();
  }

  function ensureObserver() {
    if (observer || !document.body || IS_PREVIEW_FRAME) return;
    observer = new MutationObserver(() => {
      clearTimeout(timer);
      timer = window.setTimeout(() => refreshExperience(true), 140);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function ensureHeartbeat() {
    if (heartbeat || IS_PREVIEW_FRAME) return;
    heartbeat = window.setInterval(() => {
      if (isEnabled()) refreshExperience(false);
    }, 3500);
  }

  function ensureBadge(payload = {}) {
    if (IS_PREVIEW_FRAME) return;
    let badge = by(BADGE_ID);
    if (!(badge instanceof HTMLButtonElement)) {
      badge = document.createElement("button");
      badge.type = "button";
      badge.id = BADGE_ID;
      badge.textContent = `Workspace user2 v${USER2_VERSION}`;
      badge.addEventListener("click", () => openPanel(payload));
      document.body.appendChild(badge);
    }
  }

  function ensurePanel() {
    if (IS_PREVIEW_FRAME) return null;
    let panel = by(PANEL_ID);
    if (!(panel instanceof HTMLElement)) {
      panel = document.createElement("aside");
      panel.id = PANEL_ID;
      panel.className = "hsu2-card";
      panel.hidden = true;
      panel.innerHTML = `
        <div class="hsu2-head"><div><h3>Workspace user2</h3><p>Configuracoes e historico da v2, separados da versao antiga.</p></div><button type="button" class="btn" data-action="close">Fechar</button></div>
        <div class="panel-grid">
          <section class="hsu2-card" style="padding:12px!important"><div class="grid2"><div><p class="label">Versao user2</p><p class="value" data-slot="user2-version">${USER2_VERSION}</p></div><div><p class="label">Versao user.js</p><p class="value" data-slot="user-version">-</p></div><div><p class="label">Pagina</p><p class="value" data-slot="page">-</p></div><div><p class="label">Status</p><p class="value" data-slot="status">Ativo</p></div></div></section>
          <section class="hsu2-card" style="padding:12px!important"><div class="controls"><label><p class="label">Densidade</p><select data-setting="density"><option value="compact">Compacta</option><option value="comfortable">Confortavel</option><option value="airy">Aerea</option></select></label><label class="toggle"><span class="value">Mostrar indicadores</span><input type="checkbox" data-setting="showMetrics" /></label><label class="toggle"><span class="value">Mostrar idade</span><input type="checkbox" data-setting="showAge" /></label><label class="toggle"><span class="value">Preview ao passar o mouse</span><input type="checkbox" data-setting="livePreview" /></label></div></section>
          <section class="hsu2-card" style="padding:12px!important"><div class="grid2"><div><p class="label">Total</p><p class="value" data-stat="total">-</p></div><div><p class="label">Sem responsavel</p><p class="value" data-stat="semResponsavel">-</p></div><div><p class="label">Tempo medio</p><p class="value" data-stat="mediaHoras">-</p></div><div><p class="label">Mais antigo</p><p class="value" data-stat="maisAntigo">-</p></div></div></section>
          <section class="hsu2-card" style="padding:12px!important"><p class="label">Atualizacoes do user2</p><div class="value" data-slot="updates"></div></section>
          <section class="hsu2-card" style="padding:12px!important"><div class="actions"><button type="button" class="btn" data-action="refresh">Reaplicar workspace</button><button type="button" class="btn" data-action="notify">Testar aviso</button><button type="button" class="btn" data-action="disable">Voltar para antiga</button></div></section>
        </div>
      `;
      panel.querySelector('[data-action="close"]')?.addEventListener("click", () => closePanel());
      panel.querySelector('[data-action="refresh"]')?.addEventListener("click", () => refreshExperience(true));
      panel.querySelector('[data-action="notify"]')?.addEventListener("click", () => triggerNotification());
      panel.querySelector('[data-action="disable"]')?.addEventListener("click", () => {
        setEnabled(false);
        unmount();
      });
      panel.querySelectorAll("[data-setting]").forEach((control) => {
        control.addEventListener("change", () => {
          const next = {};
          panel.querySelectorAll("[data-setting]").forEach((item) => {
            const key = txt(item.getAttribute("data-setting"));
            if (item instanceof HTMLInputElement) next[key] = !!item.checked;
            else next[key] = txt(item.value);
          });
          writeSettings(next);
          refreshExperience(true);
        });
      });
      document.body.appendChild(panel);
    }
    return panel;
  }

  function syncPanel() {
    const panel = by(PANEL_ID);
    if (!(panel instanceof HTMLElement)) return;
    const settings = readSettings();
    const updates = USER2_UPDATES.map((item) => `<strong>v${item.version}</strong> (${item.date})<br>${item.notes.join("<br>")}`).join("<br><br>");
    const setText = (selector, value) => {
      const el = panel.querySelector(selector);
      if (el instanceof HTMLElement) el.textContent = txt(value || "-");
    };
    setText('[data-slot="user-version"]', lastPayload.scriptVersion || "-");
    setText('[data-slot="page"]', lastPayload.page || location.pathname || "-");
    setText('[data-slot="status"]', isDashboardPage() ? (lastStats ? "Workspace v2 aplicado" : "Aguardando grade") : "Workspace v2 ativo");
    setText('[data-stat="total"]', lastStats ? String(lastStats.total) : "-");
    setText('[data-stat="semResponsavel"]', lastStats ? String(lastStats.semResponsavel) : "-");
    setText('[data-stat="mediaHoras"]', lastStats?.mediaHoras ? `${lastStats.mediaHoras.toFixed(1)} h` : "n/d");
    setText('[data-stat="maisAntigo"]', lastStats?.maisAntigo ? `${Math.round(lastStats.maisAntigo)} h` : "n/d");
    const updatesEl = panel.querySelector('[data-slot="updates"]');
    if (updatesEl instanceof HTMLElement) updatesEl.innerHTML = updates;
    panel.querySelectorAll("[data-setting]").forEach((control) => {
      const key = txt(control.getAttribute("data-setting"));
      if (control instanceof HTMLInputElement) control.checked = !!settings[key];
      else control.value = txt(settings[key]);
    });
  }

  function applyPreferences() {
    const settings = readSettings();
    document.body?.classList?.add(ROOT_CLASS);
    document.body?.setAttribute("data-hsu2-density", settings.density);
    if (IS_PREVIEW_FRAME) document.body?.setAttribute("data-hsu2-preview-frame", "1");
  }

  function openPanel(payload = {}) {
    if (IS_PREVIEW_FRAME) return null;
    lastPayload = { ...lastPayload, ...(payload || {}) };
    ensureStyle();
    const panel = ensurePanel();
    syncPanel();
    if (panel instanceof HTMLElement) panel.hidden = false;
    return panel;
  }

  function closePanel() {
    const panel = by(PANEL_ID);
    if (panel instanceof HTMLElement) panel.hidden = true;
  }

  function triggerNotification(options = {}) {
    const api = window[API_NAME] || {};
    const summary =
      txt(options.message) ||
      `Modulo user2 v${USER2_VERSION} aplicou shell propria, preview lateral e visual completo da v2.`;
    if (typeof api.showChamadoUpdateNotification === "function") {
      api.showChamadoUpdateNotification({
        numero: "USER2-30003",
        situacao: "Workspace v2 ativo",
        responsavel: "user2.js",
        resumo: summary,
        origem: "User2 independente",
        highlightColor: "#72D8FF",
      });
      return true;
    }
    if (typeof api.showPlainNotificationFallback === "function") {
      api.showPlainNotificationFallback(summary);
      return true;
    }
    return false;
  }

  function mount(payload = {}) {
    if (!document.body || !document.head) return false;
    lastPayload = { ...lastPayload, ...(payload || {}) };
    ensureStyle();
    ensureModernOverrides();
    applyPreferences();
    ensureObserver();
    ensureHeartbeat();
    ensureBadge(payload);
    refreshExperience(true);
    return true;
  }

  function unmount() {
    observer?.disconnect();
    observer = null;
    clearTimeout(timer);
    if (heartbeat) window.clearInterval(heartbeat);
    heartbeat = 0;
    cleanupDashboardDecorations();
    destroyShell();
    by(REQUEST_BADGE_ID)?.remove();
    document.body?.classList?.remove(ROOT_CLASS);
    document.body?.removeAttribute("data-hsu2-density");
    document.body?.removeAttribute("data-hsu2-preview-frame");
    by(BADGE_ID)?.remove();
    by(PANEL_ID)?.remove();
    selectedKey = "";
    activeBoardFilter = "all";
    lastStats = null;
    lastSignature = "";
    return true;
  }

  function getVersionInfo() {
    return {
      version: USER2_VERSION,
      updates: USER2_UPDATES.map((item) => ({ ...item })),
    };
  }

  function boot() {
    if (!isEnabled()) return;
    const run = () =>
      mount({
        scriptVersion: (typeof GM_info !== "undefined" && GM_info?.script?.version) || "",
        page: location.pathname,
      });
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run, { once: true });
    else run();
  }

  const api = window[API_NAME] || {};
  api.openSettingsHub = api.openSettingsHub || (() => false);
  api.getUser2VersionInfo = getVersionInfo;
  api.isExperimentalVersionEnabled = isEnabled;
  api.setExperimentalVersionEnabled = setEnabled;
  api.mountExperimentalVersion = mount;
  api.unmountExperimentalVersion = unmount;
  api.openExperimentalVersionPanel = openPanel;
  api.closeExperimentalVersionPanel = closePanel;
  api.triggerExperimentalVersionNotification = triggerNotification;
  api.refreshExperimentalGrid = () => refreshExperience(true);
  window[API_NAME] = api;

  boot();
})();
