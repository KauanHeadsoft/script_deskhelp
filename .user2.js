(() => {
  const API_NAME = "HSHeadsoftUser2";
  const USER2_VERSION = "3.01.00";
  const USER2_UPDATES = Object.freeze([
    {
      version: "3.01.00",
      date: "2026-03-13",
      notes: [
        "A V2 virou uma central operacional de chamados, com command center proprio, filtros rapidos, busca local e ordenacao por prioridade.",
        "A lista de tickets foi refeita como cards profissionais com leitura de risco, responsavel, cliente, idade e sinais de atendimento.",
        "Preview lateral e tela da requisicao receberam uma linguagem nova, mais fluida e mais proxima de um service desk moderno.",
      ],
    },
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
    showLegacyFilters: true,
    showLiveFrame: true,
  });

  const FILTER_OPTIONS = Object.freeze([
    { key: "all", label: "Toda a fila", short: "Todos" },
    { key: "critical", label: "Escalados", short: "Escalados" },
    { key: "new", label: "Novos", short: "Novos" },
    { key: "waiting", label: "Aguardando", short: "Aguardando" },
    { key: "unassigned", label: "Sem dono", short: "Sem dono" },
    { key: "old", label: "24h+", short: "24h+" },
  ]);

  const SORT_OPTIONS = Object.freeze([
    { key: "priority", label: "Prioridade" },
    { key: "age", label: "Mais antigos" },
    { key: "recent", label: "Mais recentes" },
    { key: "owner", label: "Responsavel" },
    { key: "client", label: "Cliente" },
    { key: "title", label: "Titulo" },
  ]);

  let observer = null;
  let timer = 0;
  let heartbeat = 0;
  let lastPayload = {};
  let lastStats = null;
  let lastRows = [];
  let lastSignature = "";
  let selectedKey = "";
  let activeBoardFilter = "all";
  let activeSearchTerm = "";
  let activeSortMode = "priority";

  const SEARCH_PARAMS = new URLSearchParams(location.search || "");
  const IS_PREVIEW_FRAME = SEARCH_PARAMS.get(PREVIEW_PARAM) === "1";

  const txt = (value) => String(value || "").replace(/\s+/g, " ").trim();
  const by = (id) => document.getElementById(id);
  const escHtml = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  const escAttr = escHtml;
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

  function getPageLabel() {
    if (isDashboardPage()) return "Triagem de chamados";
    if (isRequestPage()) return "Tela da requisicao";
    return txt(location.pathname || "Pagina interna");
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
        showLegacyFilters: parsed?.showLegacyFilters !== false,
        showLiveFrame: parsed?.showLiveFrame !== false,
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
    const date = new Date(
      year,
      Number(match[2]) - 1,
      Number(match[1]),
      Number(match[4] || 0),
      Number(match[5] || 0)
    );
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

  function formatHours(value) {
    if (!Number.isFinite(value) || value <= 0) return "n/d";
    if (value < 1) return "agora";
    if (value < 24) return `${Math.round(value)} h`;
    return `${Math.round(value / 24)} d`;
  }

  async function copyText(value) {
    const clean = txt(value);
    if (!clean) return false;
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        await navigator.clipboard.writeText(clean);
        return true;
      }
    } catch {}
    try {
      const area = document.createElement("textarea");
      area.value = clean;
      area.setAttribute("readonly", "readonly");
      area.style.position = "fixed";
      area.style.left = "-99999px";
      area.style.top = "-99999px";
      document.body.appendChild(area);
      area.focus();
      area.select();
      const ok = !!document.execCommand("copy");
      area.remove();
      return ok;
    } catch {
      return false;
    }
  }

  function getIndices(table) {
    const headers = Array.from(table.tHead?.rows?.[0]?.cells || []).map((cell) => norm(cell.textContent || ""));
    const findIndex = (...patterns) => headers.findIndex((header) => patterns.some((rx) => rx.test(header)));
    return {
      number: findIndex(/\bnum/, /\bcod/, /\bid\b/, /\brequisicao\b/),
      title: findIndex(/titulo/, /assunto/, /descricao/, /requisicao/, /solicitacao/, /problema/),
      status: findIndex(/situac/, /status/),
      owner: findIndex(/responsavel/, /tecnico/, /atendente/),
      client: findIndex(/cliente/, /empresa/, /usuario/, /solicitante/),
      date: findIndex(/abertura/, /cadastro/, /atualiza/, /ultima/, /^data$/),
    };
  }

  function getCellText(cell) {
    if (!(cell instanceof HTMLTableCellElement)) return "";
    const clone = cell.cloneNode(true);
    clone.querySelectorAll(".hsu2-chip,.hsu2-status,.hsu2-action,.hsu2-preview-btn,.hsu2-signal").forEach((el) =>
      el.remove()
    );
    return txt(clone.textContent || "");
  }

  function classifyStatus(label) {
    const key = norm(label);
    if (/^nova\b|novas? inform|novo retorno|retorno novo/.test(key)) return "new";
    if (/aguard|penden|analise|aprova|servico|retorno|andamento|fila/.test(key)) return "waiting";
    if (/cancel|expir|erro|parado|bloque|falha|urg/.test(key)) return "alert";
    if (/conclu|fech|final/.test(key)) return "done";
    return "neutral";
  }

  function buildPriorityMeta(score) {
    if (score >= 7) return { tone: "critical", label: "Escalada imediata", short: "Critica", meter: 96 };
    if (score >= 5) return { tone: "high", label: "Alta prioridade", short: "Alta", meter: 76 };
    if (score >= 3) return { tone: "medium", label: "Atencao na fila", short: "Atencao", meter: 56 };
    return { tone: "normal", label: "Fluxo estavel", short: "Normal", meter: 34 };
  }

  function buildAttentionReasons(data) {
    const reasons = [];
    if (data.priorityMeta.tone === "critical") reasons.push("Entrou na faixa critica da fila.");
    if (data.isUnassigned) reasons.push("Ainda sem responsavel definido.");
    if (data.isVeryOld) reasons.push("Ja passou de 72 horas e pede retorno rapido.");
    else if (data.isOld) reasons.push("Ja passou de 24 horas em aberto.");
    if (data.statusClass === "new") reasons.push("Chegou como novo ou retorno sem triagem final.");
    if (data.statusClass === "waiting") reasons.push("Esta em aguardando e merece follow-up.");
    if (!data.client) reasons.push("Cliente nao identificado no grid.");
    if (!reasons.length) reasons.push("Chamado dentro de uma faixa estavel da fila.");
    return reasons;
  }

  function buildActionHint(data) {
    if (data.isUnassigned && data.statusClass === "new") return "Distribuir um responsavel e registrar o primeiro retorno.";
    if (data.isUnassigned) return "Puxar responsavel e alinhar ownership antes de seguir com a fila.";
    if (data.priorityMeta.tone === "critical") return "Tratar como prioridade operacional e revisar o SLA agora.";
    if (data.statusClass === "waiting") return "Validar dependencia externa e atualizar o cliente sobre o proximo passo.";
    if (data.statusClass === "new") return "Fazer leitura inicial, classificar e responder com contexto.";
    if (data.isOld) return "Revisar pendencias abertas e publicar um andamento visivel.";
    return "Manter fluxo, revisar contexto e seguir com a proxima acao.";
  }

  function buildFocusNote(data) {
    if (data.priorityMeta.tone === "critical") return "Chamado quente para puxar agora.";
    if (data.isUnassigned) return "Ticket sem dono, com risco de ficar parado.";
    if (data.statusClass === "new") return "Bom candidato para primeiro atendimento rapido.";
    if (data.statusClass === "waiting") return "Pede leitura de dependencia e retorno ao cliente.";
    if (data.isOld) return "Backlog acima da media da fila.";
    return "Fluxo normal, mas pronto para acompanhamento.";
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

  function buildLiveFrameHref(href, bust = false) {
    const base = buildPreviewHref(href);
    if (!base || !bust) return base;
    try {
      const url = new URL(base);
      url.searchParams.set("_hsu2r", String(Date.now()));
      return url.toString();
    } catch {
      return base;
    }
  }

  function getPrimaryLink(row) {
    const link = row.querySelector('a[href*="visualizar_requisicao.php"]');
    return link instanceof HTMLAnchorElement ? txt(link.href || "") : "";
  }

  function resolveTitle(row, idx) {
    const preferred = idx.title >= 0 ? getCellText(row.cells[idx.title]) : "";
    if (preferred) return preferred;
    const ignored = new Set([idx.number, idx.status, idx.owner, idx.client, idx.date]);
    const fallback = Array.from(row.cells || [])
      .map((cell, cellIndex) => ({ value: getCellText(cell), cellIndex }))
      .find((entry) => entry.value && !ignored.has(entry.cellIndex));
    return fallback?.value || getCellText(row.cells[0]) || "Chamado sem titulo";
  }

  function buildRowData(row, idx) {
    const href = getPrimaryLink(row);
    const dateRaw = idx.date >= 0 ? getCellText(row.cells[idx.date]) : "";
    const openedAt = parseDate(dateRaw);
    const ageHours = openedAt ? Math.max(0, (Date.now() - openedAt.getTime()) / 36e5) : NaN;
    const status = idx.status >= 0 ? getCellText(row.cells[idx.status]) : "";
    const statusClass = classifyStatus(status);
    const owner = idx.owner >= 0 ? getCellText(row.cells[idx.owner]) : "";
    const client = idx.client >= 0 ? getCellText(row.cells[idx.client]) : "";
    const number = idx.number >= 0 ? getCellText(row.cells[idx.number]) : "";
    const title = resolveTitle(row, idx);
    const isOld = Number.isFinite(ageHours) && ageHours >= 24;
    const isVeryOld = Number.isFinite(ageHours) && ageHours >= 72;
    const isUnassigned = !owner;
    const priorityScore =
      (statusClass === "new" ? 3.2 : 0) +
      (statusClass === "waiting" ? 1.4 : 0) +
      (statusClass === "alert" ? 2.6 : 0) +
      (isUnassigned ? 2.9 : 0) +
      (isOld ? 2.2 : 0) +
      (isVeryOld ? 1.5 : 0) +
      (!client ? 0.4 : 0);
    const priorityMeta = buildPriorityMeta(priorityScore);
    const data = {
      key: number || href || `${row.rowIndex}-${txt(row.textContent || "")}`,
      href,
      previewHref: buildLiveFrameHref(href),
      number,
      title,
      status,
      statusClass,
      owner,
      client,
      dateRaw,
      openedAt,
      openedAtMs: openedAt ? openedAt.getTime() : 0,
      ageLabel: openedAt ? formatAge(openedAt) : "",
      ageHours,
      isOld,
      isVeryOld,
      isUnassigned,
      priorityScore,
      priorityMeta,
      row,
    };
    data.attentionReasons = buildAttentionReasons(data);
    data.actionHint = buildActionHint(data);
    data.focusNote = buildFocusNote(data);
    data.searchBlob = norm(
      [
        data.number,
        data.title,
        data.status,
        data.owner,
        data.client,
        data.dateRaw,
        data.attentionReasons.join(" "),
        data.actionHint,
      ].join(" ")
    );
    return data;
  }

  function matchesNamedFilter(data, filterKey = activeBoardFilter) {
    switch (filterKey) {
      case "critical":
        return data.priorityMeta.tone === "critical" || data.priorityMeta.tone === "high";
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

  function matchesSearch(data, rawQuery = activeSearchTerm) {
    const query = norm(rawQuery);
    if (!query) return true;
    return data.searchBlob.includes(query);
  }

  function compareText(a, b) {
    return txt(a || "").localeCompare(txt(b || ""), "pt-BR", {
      numeric: true,
      sensitivity: "base",
    });
  }

  function compareRows(a, b) {
    switch (activeSortMode) {
      case "age":
        return (Number(b.ageHours) || -1) - (Number(a.ageHours) || -1) || b.priorityScore - a.priorityScore;
      case "recent":
        return b.openedAtMs - a.openedAtMs || b.priorityScore - a.priorityScore;
      case "owner":
        return compareText(a.owner || "Sem responsavel", b.owner || "Sem responsavel") || b.priorityScore - a.priorityScore;
      case "client":
        return compareText(a.client || "Nao informado", b.client || "Nao informado") || b.priorityScore - a.priorityScore;
      case "title":
        return compareText(a.title, b.title) || b.priorityScore - a.priorityScore;
      default:
        return (
          b.priorityScore - a.priorityScore ||
          (Number(b.ageHours) || -1) - (Number(a.ageHours) || -1) ||
          b.openedAtMs - a.openedAtMs
        );
    }
  }

  function getVisibleRows(rows = lastRows) {
    return rows
      .filter((data) => matchesNamedFilter(data) && matchesSearch(data))
      .slice()
      .sort(compareRows);
  }

  function getFilterMeta(key = activeBoardFilter) {
    return FILTER_OPTIONS.find((item) => item.key === key) || FILTER_OPTIONS[0];
  }

  function getSortMeta(key = activeSortMode) {
    return SORT_OPTIONS.find((item) => item.key === key) || SORT_OPTIONS[0];
  }

  function buildFilterCountMap(rows) {
    const counts = {};
    FILTER_OPTIONS.forEach((item) => {
      counts[item.key] = rows.filter((data) => matchesNamedFilter(data, item.key) && matchesSearch(data)).length;
    });
    return counts;
  }

  function buildStats(rows, visibleRows) {
    const ages = rows.map((row) => row.ageHours).filter((value) => Number.isFinite(value));
    const ownerCounts = new Map();
    const clientKeys = new Set();
    rows.forEach((row) => {
      if (row.owner) ownerCounts.set(row.owner, (ownerCounts.get(row.owner) || 0) + 1);
      if (row.client) clientKeys.add(norm(row.client));
    });
    const topOwner = Array.from(ownerCounts.entries()).sort((a, b) => b[1] - a[1] || compareText(a[0], b[0]))[0] || null;
    const critical = rows.filter((row) => row.priorityMeta.tone === "critical" || row.priorityMeta.tone === "high").length;
    const semResponsavel = rows.filter((row) => row.isUnassigned).length;
    const antigas = rows.filter((row) => row.isOld).length;
    let summary = "Fila estabilizada e pronta para tocar com ritmo.";
    if (!rows.length) summary = "Nao ha chamados visiveis no grid legado agora.";
    else if (critical > 0 && semResponsavel > 0) summary = "Ha chamados escalados e sem dono. Vale puxar ownership antes de qualquer outra coisa.";
    else if (critical > 0) summary = "A fila pede ataque nos itens mais quentes primeiro.";
    else if (semResponsavel > 0) summary = "Existem tickets sem responsavel, com risco de parada silenciosa.";
    else if (antigas > 0) summary = "A entrada esta mais limpa, mas o backlog acima de 24h ainda precisa de foco.";
    return {
      total: rows.length,
      visible: visibleRows.length,
      critical,
      novas: rows.filter((row) => row.statusClass === "new").length,
      aguardando: rows.filter((row) => row.statusClass === "waiting").length,
      semResponsavel,
      antigas,
      mediaHoras: ages.length ? ages.reduce((sum, value) => sum + value, 0) / ages.length : 0,
      maisAntigo: ages.length ? Math.max(...ages) : 0,
      coverageRate: rows.length ? Math.round(((rows.length - semResponsavel) / rows.length) * 100) : 0,
      uniqueClients: clientKeys.size,
      topOwnerLabel: topOwner ? `${topOwner[0]} (${topOwner[1]})` : "Distribuicao aberta",
      topOwnerName: topOwner?.[0] || "",
      filterLabel: getFilterMeta().label,
      sortLabel: getSortMeta().label,
      searchLabel: txt(activeSearchTerm),
      filterCounts: buildFilterCountMap(rows),
      summary,
    };
  }

  function buildFactHtml(label, value, extraClass = "") {
    return `
      <div class="hsu2-fact ${extraClass}">
        <span class="hsu2-fact-label">${escHtml(label)}</span>
        <strong class="hsu2-fact-value">${escHtml(value || "-")}</strong>
      </div>
    `;
  }

  function buildSignalHtml(label, tone = "neutral") {
    return `<span class="hsu2-signal tone-${escAttr(tone)}">${escHtml(label)}</span>`;
  }

  function ensureStyle() {
    let style = by(STYLE_ID);
    if (!(style instanceof HTMLStyleElement)) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent = `
      body.${ROOT_CLASS}{--bg:#07111b;--surface:rgba(10,19,31,.94);--surface-2:rgba(12,24,39,.86);--line:rgba(106,180,230,.18);--line-strong:rgba(94,219,255,.38);--text:#edf7ff;--muted:#8aa5bf;--accent:#5de2ff;--accent2:#62ffc3;--danger:#ff7d94;--warn:#ffc976;--radius:28px;--shadow:0 30px 80px rgba(1,8,18,.45);--ticket-pad:18px;--display:"Bahnschrift","Segoe UI Variable Text","Segoe UI",Tahoma,sans-serif;--body:"Segoe UI Variable Text","Segoe UI",Tahoma,sans-serif;}
      body.${ROOT_CLASS}[data-hsu2-density="compact"]{--ticket-pad:14px;}
      body.${ROOT_CLASS}[data-hsu2-density="airy"]{--ticket-pad:22px;}
      body.${ROOT_CLASS}:not(.hs-login-page){background:radial-gradient(circle at 10% 0%, rgba(93,226,255,.1), transparent 28%),radial-gradient(circle at 92% 12%, rgba(98,255,195,.08), transparent 25%),linear-gradient(180deg, rgba(6,12,20,.92), rgba(7,17,27,.98)),linear-gradient(90deg, rgba(255,255,255,.02) 1px, transparent 1px),linear-gradient(rgba(255,255,255,.02) 1px, transparent 1px),var(--bg)!important;background-size:auto,auto,auto,34px 34px,34px 34px,auto!important;background-position:center center,center center,center center,-1px -1px,-1px -1px,center center!important;color:var(--text)!important;}
      body.${ROOT_CLASS},body.${ROOT_CLASS} :is(input,button,select,textarea){font-family:var(--body)!important;}
      body.${ROOT_CLASS} a{color:var(--accent)!important;}
      body.${ROOT_CLASS} #cabecalho{position:relative!important;overflow:hidden!important;background:radial-gradient(circle at top left, rgba(93,226,255,.18), transparent 32%),linear-gradient(135deg, rgba(8,18,30,.96), rgba(10,24,39,.88))!important;border-bottom:1px solid var(--line)!important;box-shadow:0 20px 40px rgba(2,10,20,.35)!important;}
      body.${ROOT_CLASS} #cabecalho::before{content:"";position:absolute;inset:0;background:linear-gradient(90deg, rgba(93,226,255,.06), transparent 35%, rgba(98,255,195,.05));pointer-events:none;}
      body.${ROOT_CLASS} #cabecalho :is(td,th,span,a,b,strong){color:var(--text)!important;}
      body.${ROOT_CLASS} #cabecalho :is(input[type="text"],select,button){border-radius:14px!important;border:1px solid var(--line)!important;background:rgba(12,22,37,.8)!important;color:var(--text)!important;}
      body.${ROOT_CLASS} #conteudo{position:relative!important;padding-top:18px!important;}
      body.${ROOT_CLASS} #conteudo::before{content:"Headsoft Service Desk // user2 v${USER2_VERSION}"!important;display:inline-flex!important;align-items:center!important;padding:10px 16px!important;margin:6px 0 16px!important;border-radius:999px!important;border:1px solid var(--line)!important;background:linear-gradient(135deg, rgba(10,19,31,.96), rgba(13,31,48,.92))!important;box-shadow:0 16px 28px rgba(1,7,16,.28)!important;color:var(--text)!important;font:800 12px/1 var(--display)!important;letter-spacing:.14em!important;text-transform:uppercase!important;}
      body.${ROOT_CLASS} ${FILTER_SELECTOR}{position:relative!important;margin:0!important;padding:20px 22px 18px!important;border-radius:var(--radius)!important;border:1px solid var(--line)!important;background:radial-gradient(circle at top right, rgba(93,226,255,.08), transparent 24%),linear-gradient(180deg, rgba(8,18,30,.95), rgba(8,15,25,.96))!important;box-shadow:var(--shadow)!important;overflow:hidden!important;}
      body.${ROOT_CLASS}[data-hsu2-show-legacy-filters="0"] ${FILTER_SELECTOR}{display:none!important;}
      body.${ROOT_CLASS} ${FILTER_SELECTOR}::before{content:"Filtros originais"!important;display:block!important;margin:0 0 14px!important;color:var(--muted)!important;font:800 11px/1 var(--display)!important;letter-spacing:.16em!important;text-transform:uppercase!important;}
      body.${ROOT_CLASS} ${FILTER_SELECTOR} table{width:100%!important;border-collapse:separate!important;border-spacing:8px 10px!important;}
      body.${ROOT_CLASS} ${FILTER_SELECTOR} :is(th,td,label){color:var(--text)!important;}
      body.${ROOT_CLASS} ${FILTER_SELECTOR} th{font-size:11px!important;text-transform:uppercase!important;letter-spacing:.12em!important;color:var(--muted)!important;}
      body.${ROOT_CLASS} ${FILTER_SELECTOR} :is(input[type="text"],select,textarea){min-height:40px!important;border-radius:14px!important;border:1px solid var(--line)!important;background:rgba(13,25,39,.9)!important;color:var(--text)!important;padding:0 12px!important;}
      body.${ROOT_CLASS} ${FILTER_SELECTOR} textarea{min-height:110px!important;padding:12px!important;}
      body.${ROOT_CLASS} ${FILTER_SELECTOR} :is(input[type="button"],input[type="submit"],button){min-height:40px!important;padding:0 16px!important;border-radius:14px!important;border:1px solid var(--line)!important;background:linear-gradient(180deg, rgba(18,35,55,.98), rgba(10,20,33,.98))!important;color:var(--text)!important;cursor:pointer!important;}
      body.${ROOT_CLASS} ${FILTER_SELECTOR} input[type="checkbox"]{accent-color:var(--accent)!important;}
      body.${ROOT_CLASS} #${SHELL_ID}{display:grid!important;grid-template-columns:minmax(0,1fr) 420px!important;gap:22px!important;align-items:start!important;}
      body.${ROOT_CLASS} #${MAIN_ID}{min-width:0!important;display:grid!important;gap:18px!important;}
      body.${ROOT_CLASS} #${PREVIEW_ID}{min-width:0!important;position:sticky!important;top:86px!important;display:grid!important;gap:16px!important;}
      body.${ROOT_CLASS} table.sortable.hsu2-source-table{display:none!important;}
      body.${ROOT_CLASS} .hsu2-card{position:relative!important;overflow:hidden!important;border-radius:var(--radius)!important;border:1px solid var(--line)!important;background:linear-gradient(180deg, rgba(9,18,31,.95), rgba(7,14,24,.97))!important;box-shadow:var(--shadow)!important;}
      body.${ROOT_CLASS} .hsu2-card::before{content:"";position:absolute;inset:0 auto auto 0;width:100%;height:1px;background:linear-gradient(90deg, transparent, rgba(93,226,255,.3), transparent);pointer-events:none;}
      body.${ROOT_CLASS} .hsu2-head,body.${ROOT_CLASS} .hsu2-section-head{display:flex!important;align-items:flex-start!important;justify-content:space-between!important;gap:14px!important;padding:18px 20px 0!important;}
      body.${ROOT_CLASS} .hsu2-head h2,body.${ROOT_CLASS} .hsu2-head h3,body.${ROOT_CLASS} .hsu2-section-head h3{margin:0!important;color:var(--text)!important;font:900 24px/1.1 var(--display)!important;letter-spacing:-.03em!important;}
      body.${ROOT_CLASS} .hsu2-section-head h3{font-size:20px!important;}
      body.${ROOT_CLASS} .hsu2-head p,body.${ROOT_CLASS} .hsu2-section-head p{margin:8px 0 0!important;color:var(--muted)!important;font:600 13px/1.55 var(--body)!important;}
      body.${ROOT_CLASS} .hsu2-card-body{padding:18px 20px 20px!important;}
      body.${ROOT_CLASS} .hsu2-eyebrow{display:inline-flex!important;align-items:center!important;gap:8px!important;margin:0 0 10px!important;color:var(--muted)!important;font:800 11px/1 var(--display)!important;letter-spacing:.18em!important;text-transform:uppercase!important;}
      body.${ROOT_CLASS} .hsu2-eyebrow::before{content:"";width:9px;height:9px;border-radius:50%;background:linear-gradient(180deg, var(--accent), var(--accent2));box-shadow:0 0 0 5px rgba(93,226,255,.12);}
      body.${ROOT_CLASS} .hsu2-inline-row,body.${ROOT_CLASS} .hsu2-tags,body.${ROOT_CLASS} .hsu2-signal-row{display:flex!important;flex-wrap:wrap!important;gap:8px!important;}
      body.${ROOT_CLASS} .hsu2-action,body.${ROOT_CLASS} .hsu2-preview-btn,body.${ROOT_CLASS} .hsu2-segment,body.${ROOT_CLASS} .hsu2-signal,body.${ROOT_CLASS} .hsu2-chip,body.${ROOT_CLASS} .hsu2-status{display:inline-flex!important;align-items:center!important;gap:8px!important;min-height:34px!important;padding:0 14px!important;border-radius:999px!important;border:1px solid var(--line)!important;background:rgba(15,28,43,.8)!important;color:var(--text)!important;font:800 11px/1 var(--display)!important;letter-spacing:.08em!important;text-transform:uppercase!important;text-decoration:none!important;}
      body.${ROOT_CLASS} .hsu2-action,body.${ROOT_CLASS} .hsu2-preview-btn,body.${ROOT_CLASS} .hsu2-segment{cursor:pointer!important;}
      body.${ROOT_CLASS} .hsu2-action.primary,body.${ROOT_CLASS} .hsu2-preview-btn{border-color:rgba(93,226,255,.44)!important;background:linear-gradient(180deg, rgba(15,42,60,.98), rgba(10,23,35,.98))!important;}
      body.${ROOT_CLASS} .hsu2-action.subtle{color:var(--muted)!important;}
      body.${ROOT_CLASS} .hsu2-chip.empty,body.${ROOT_CLASS} .hsu2-status.tone-alert,body.${ROOT_CLASS} .hsu2-chip.priority-critical,body.${ROOT_CLASS} .hsu2-signal.tone-danger{border-color:rgba(255,125,148,.34)!important;color:#ffd5dd!important;}
      body.${ROOT_CLASS} .hsu2-status.tone-new{border-color:rgba(98,255,195,.34)!important;color:#dffff2!important;}
      body.${ROOT_CLASS} .hsu2-status.tone-waiting,body.${ROOT_CLASS} .hsu2-chip.strong,body.${ROOT_CLASS} .hsu2-chip.priority-medium,body.${ROOT_CLASS} .hsu2-signal.tone-medium{border-color:rgba(93,226,255,.42)!important;color:#d9fbff!important;}
      body.${ROOT_CLASS} .hsu2-chip.priority-high,body.${ROOT_CLASS} .hsu2-signal.tone-warn{border-color:rgba(255,201,118,.42)!important;color:#ffe6bd!important;}
      body.${ROOT_CLASS} .hsu2-kpi-grid{display:grid!important;grid-template-columns:repeat(5, minmax(0,1fr))!important;gap:12px!important;padding:20px 24px 0!important;}
      body.${ROOT_CLASS} .hsu2-kpi,body.${ROOT_CLASS} .hsu2-insight,body.${ROOT_CLASS} .hsu2-fact,body.${ROOT_CLASS} #${PANEL_ID} .hsu2-panel-card,body.${ROOT_CLASS} #${PANEL_ID} .hsu2-panel-stat,body.${ROOT_CLASS} #${PANEL_ID} .hsu2-toggle,body.${ROOT_CLASS} #${PANEL_ID} .hsu2-update-entry{border:1px solid var(--line)!important;background:var(--surface-2)!important;}
      body.${ROOT_CLASS} .hsu2-kpi{padding:18px!important;border-radius:22px!important;}
      body.${ROOT_CLASS} .hsu2-kpi strong{display:block!important;color:var(--text)!important;font:900 28px/1 var(--display)!important;letter-spacing:-.04em!important;}
      body.${ROOT_CLASS} .hsu2-kpi span,body.${ROOT_CLASS} .hsu2-fact-label,body.${ROOT_CLASS} .hsu2-insight .label,body.${ROOT_CLASS} #${PANEL_ID} .hsu2-panel-stat span,body.${ROOT_CLASS} #${PANEL_ID} .hsu2-field span{display:block!important;color:var(--muted)!important;font:800 11px/1 var(--display)!important;letter-spacing:.14em!important;text-transform:uppercase!important;}
      body.${ROOT_CLASS} .hsu2-command-top{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;gap:18px!important;padding:24px 24px 0!important;}
      body.${ROOT_CLASS} .hsu2-command-copy h2{margin:0!important;color:var(--text)!important;font:900 32px/1.02 var(--display)!important;letter-spacing:-.04em!important;}
      body.${ROOT_CLASS} .hsu2-command-copy p{margin:12px 0 0!important;max-width:720px!important;color:var(--muted)!important;font:600 14px/1.7 var(--body)!important;}
      body.${ROOT_CLASS} .hsu2-command-actions,body.${ROOT_CLASS} .hsu2-ticket-actions,body.${ROOT_CLASS} .hsu2-ticket-badges,body.${ROOT_CLASS} #${PANEL_ID} .hsu2-panel-actions{display:flex!important;flex-wrap:wrap!important;gap:10px!important;}
      body.${ROOT_CLASS} .hsu2-commandbar{display:grid!important;grid-template-columns:minmax(0,1.6fr) minmax(220px,.6fr) auto!important;gap:12px!important;padding:18px 24px 0!important;align-items:end!important;}
      body.${ROOT_CLASS} .hsu2-field{display:grid!important;gap:8px!important;}
      body.${ROOT_CLASS} .hsu2-field :is(input,select),body.${ROOT_CLASS} #${PANEL_ID} .hsu2-field select{min-height:48px!important;border-radius:18px!important;border:1px solid var(--line)!important;background:rgba(12,24,39,.92)!important;color:var(--text)!important;padding:0 16px!important;}
      body.${ROOT_CLASS} .hsu2-command-pill{display:flex!important;align-items:center!important;justify-content:center!important;min-height:48px!important;padding:0 18px!important;border-radius:18px!important;border:1px solid var(--line)!important;background:linear-gradient(180deg, rgba(13,25,39,.98), rgba(8,17,27,.98))!important;color:var(--text)!important;font:800 11px/1.25 var(--display)!important;text-transform:uppercase!important;letter-spacing:.12em!important;}
      body.${ROOT_CLASS} .hsu2-segment-row{display:flex!important;flex-wrap:wrap!important;gap:10px!important;padding:16px 24px 0!important;}
      body.${ROOT_CLASS} .hsu2-segment.active{border-color:var(--line-strong)!important;background:linear-gradient(180deg, rgba(17,42,60,.98), rgba(10,24,35,.98))!important;}
      body.${ROOT_CLASS} .hsu2-insights-grid{display:grid!important;grid-template-columns:repeat(4, minmax(0,1fr))!important;gap:12px!important;padding:18px 24px 24px!important;}
      body.${ROOT_CLASS} #${LIST_ID}{display:grid!important;gap:16px!important;}
      body.${ROOT_CLASS} .hsu2-list-head{display:flex!important;flex-wrap:wrap!important;align-items:flex-end!important;justify-content:space-between!important;gap:14px!important;}
      body.${ROOT_CLASS} .hsu2-list-head h3{margin:4px 0 0!important;color:var(--text)!important;font:900 24px/1.08 var(--display)!important;letter-spacing:-.03em!important;}
      body.${ROOT_CLASS} .hsu2-list-head p{margin:8px 0 0!important;color:var(--muted)!important;font:600 13px/1.6 var(--body)!important;}
      body.${ROOT_CLASS} .hsu2-ticket-stack{display:grid!important;gap:16px!important;}
      body.${ROOT_CLASS} .hsu2-ticket{position:relative!important;overflow:hidden!important;padding:var(--ticket-pad)!important;border-radius:26px!important;border:1px solid var(--line)!important;background:linear-gradient(180deg, rgba(10,19,31,.96), rgba(7,15,25,.98))!important;box-shadow:0 22px 48px rgba(1,7,16,.26)!important;display:grid!important;gap:14px!important;}
      body.${ROOT_CLASS} .hsu2-ticket::before{content:"";position:absolute;left:0;top:18px;bottom:18px;width:4px;border-radius:999px;background:var(--accent);}
      body.${ROOT_CLASS} .hsu2-ticket.tone-critical::before{background:var(--danger);}
      body.${ROOT_CLASS} .hsu2-ticket.tone-high::before{background:var(--warn);}
      body.${ROOT_CLASS} .hsu2-ticket.tone-normal::before{background:var(--accent2);}
      body.${ROOT_CLASS} .hsu2-ticket.is-selected{border-color:var(--line-strong)!important;box-shadow:0 0 0 1px rgba(93,226,255,.16), 0 24px 52px rgba(1,7,16,.32)!important;}
      body.${ROOT_CLASS} .hsu2-ticket-top,body.${ROOT_CLASS} .hsu2-ticket-main{display:flex!important;align-items:flex-start!important;justify-content:space-between!important;gap:16px!important;}
      body.${ROOT_CLASS} .hsu2-ticket-title{margin:0!important;color:var(--text)!important;font:900 22px/1.12 var(--display)!important;letter-spacing:-.03em!important;}
      body.${ROOT_CLASS} .hsu2-ticket-summary,body.${ROOT_CLASS} .hsu2-ticket-note,body.${ROOT_CLASS} .hsu2-preview-note,body.${ROOT_CLASS} .hsu2-head p,body.${ROOT_CLASS} .hsu2-section-head p{color:var(--muted)!important;font:700 13px/1.6 var(--body)!important;}
      body.${ROOT_CLASS} .hsu2-priority-chip{min-width:116px!important;padding:14px 16px!important;border-radius:22px!important;border:1px solid var(--line)!important;background:rgba(14,26,40,.88)!important;text-align:right!important;}
      body.${ROOT_CLASS} .hsu2-priority-chip span{display:block!important;color:var(--muted)!important;font:800 10px/1 var(--display)!important;letter-spacing:.16em!important;text-transform:uppercase!important;}
      body.${ROOT_CLASS} .hsu2-priority-chip strong{display:block!important;margin-top:8px!important;color:var(--text)!important;font:900 26px/1 var(--display)!important;}
      body.${ROOT_CLASS} .hsu2-priority-chip em{display:block!important;margin-top:6px!important;color:var(--text)!important;font:800 12px/1.2 var(--body)!important;font-style:normal!important;}
      body.${ROOT_CLASS} .hsu2-ticket-grid,body.${ROOT_CLASS} .hsu2-preview-grid,body.${ROOT_CLASS} #${PANEL_ID} .hsu2-panel-grid{display:grid!important;grid-template-columns:repeat(auto-fit, minmax(160px,1fr))!important;gap:10px!important;}
      body.${ROOT_CLASS} .hsu2-fact-value,body.${ROOT_CLASS} .hsu2-insight .value,body.${ROOT_CLASS} #${PANEL_ID} .hsu2-panel-stat strong{display:block!important;margin-top:8px!important;color:var(--text)!important;font:800 14px/1.45 var(--body)!important;word-break:break-word!important;}
      body.${ROOT_CLASS} .hsu2-ticket-footer,body.${ROOT_CLASS} .hsu2-preview-insights{display:grid!important;gap:12px!important;}
      body.${ROOT_CLASS} .hsu2-meter{height:8px!important;border-radius:999px!important;background:rgba(255,255,255,.06)!important;overflow:hidden!important;}
      body.${ROOT_CLASS} .hsu2-meter span{display:block!important;height:100%!important;border-radius:inherit!important;background:linear-gradient(90deg, var(--accent), var(--accent2))!important;}
      body.${ROOT_CLASS} .hsu2-ticket.tone-critical .hsu2-meter span{background:linear-gradient(90deg, #ff5a78, #ff9e9c)!important;}
      body.${ROOT_CLASS} .hsu2-ticket.tone-high .hsu2-meter span{background:linear-gradient(90deg, #ffb65a, #ffd789)!important;}
      body.${ROOT_CLASS} .hsu2-empty{display:grid!important;place-items:center!important;gap:10px!important;min-height:130px!important;padding:18px!important;border-radius:22px!important;border:1px dashed rgba(106,180,230,.24)!important;background:rgba(10,20,33,.5)!important;color:var(--muted)!important;text-align:center!important;font:700 13px/1.7 var(--body)!important;}
      body.${ROOT_CLASS} .hsu2-empty h4{margin:0!important;color:var(--text)!important;font:900 20px/1.1 var(--display)!important;}
      body.${ROOT_CLASS} .hsu2-preview-frame{width:100%!important;min-height:700px!important;border:1px solid var(--line)!important;border-radius:22px!important;background:#091423!important;}
      body.${ROOT_CLASS}[data-hsu2-show-live-frame="0"] .hsu2-live-card{display:none!important;}
      body.${ROOT_CLASS}.hs-request-page #${REQUEST_BADGE_ID}{margin:0 0 16px!important;padding:18px 20px!important;display:flex!important;align-items:flex-start!important;justify-content:space-between!important;gap:14px!important;}
      body.${ROOT_CLASS}.hs-request-page #${REQUEST_BADGE_ID} strong{display:block!important;margin:0!important;color:var(--text)!important;font:900 26px/1.05 var(--display)!important;}
      body.${ROOT_CLASS}.hs-request-page #${REQUEST_BADGE_ID} span{display:block!important;margin-top:10px!important;color:var(--muted)!important;font:700 13px/1.65 var(--body)!important;}
      body.${ROOT_CLASS}.hs-request-page #interno{display:grid!important;gap:16px!important;}
      body.${ROOT_CLASS}.hs-request-page #interno :is(.requisicao_top,.categorias,.detalhes,.acompanhamentos,#Novo_Acompanhamento,.novo_consumo_interno){padding:18px!important;border-radius:var(--radius)!important;border:1px solid var(--line)!important;background:linear-gradient(180deg, rgba(9,18,31,.96), rgba(7,14,24,.98))!important;box-shadow:var(--shadow)!important;}
      body.${ROOT_CLASS}.hs-request-page #interno table:not(.sortable){width:100%!important;border-collapse:separate!important;border-spacing:0 10px!important;}
      body.${ROOT_CLASS}.hs-request-page #interno table:not(.sortable) :is(th,td){padding:12px 14px!important;border:1px solid var(--line)!important;background:var(--surface-2)!important;color:var(--text)!important;}
      body.${ROOT_CLASS}.hs-request-page #interno table:not(.sortable) th{color:var(--muted)!important;font:800 11px/1.2 var(--display)!important;letter-spacing:.14em!important;text-transform:uppercase!important;}
      body.${ROOT_CLASS}.hs-request-page #interno :is(input[type="text"],input[type="password"],select,textarea){min-height:40px!important;border-radius:14px!important;border:1px solid var(--line)!important;background:rgba(12,24,39,.92)!important;color:var(--text)!important;padding:0 12px!important;}
      body.${ROOT_CLASS}.hs-request-page #interno textarea{min-height:140px!important;padding:12px!important;}
      body.${ROOT_CLASS}.hs-request-page #interno :is(input[type="button"],input[type="submit"],button,a.button){min-height:40px!important;padding:0 16px!important;border-radius:14px!important;border:1px solid var(--line)!important;background:linear-gradient(180deg, rgba(18,35,55,.98), rgba(10,20,33,.98))!important;color:var(--text)!important;text-decoration:none!important;}
      body.${ROOT_CLASS}[data-hsu2-preview-frame="1"] #${REQUEST_BADGE_ID}{display:none!important;}
      body.${ROOT_CLASS} ::-webkit-scrollbar{width:10px;height:10px;}
      body.${ROOT_CLASS} ::-webkit-scrollbar-track{background:rgba(255,255,255,.03);}
      body.${ROOT_CLASS} ::-webkit-scrollbar-thumb{border-radius:999px;background:rgba(93,226,255,.22);}
      @media (max-width: 1380px){body.${ROOT_CLASS} #${SHELL_ID}{grid-template-columns:1fr!important;}body.${ROOT_CLASS} #${PREVIEW_ID}{position:static!important;}body.${ROOT_CLASS} .hsu2-kpi-grid,body.${ROOT_CLASS} .hsu2-insights-grid{grid-template-columns:repeat(2, minmax(0,1fr))!important;}}
      @media (max-width: 960px){body.${ROOT_CLASS} .hsu2-command-top,body.${ROOT_CLASS} .hsu2-commandbar,body.${ROOT_CLASS} .hsu2-ticket-top,body.${ROOT_CLASS} .hsu2-ticket-main,body.${ROOT_CLASS} .hsu2-list-head,body.${ROOT_CLASS}.hs-request-page #${REQUEST_BADGE_ID}{display:grid!important;grid-template-columns:1fr!important;}body.${ROOT_CLASS} .hsu2-ticket-actions,body.${ROOT_CLASS} .hsu2-command-actions{justify-content:flex-start!important;}}
      @media (max-width: 760px){body.${ROOT_CLASS} .hsu2-kpi-grid,body.${ROOT_CLASS} .hsu2-insights-grid,body.${ROOT_CLASS} .hsu2-preview-grid{grid-template-columns:1fr!important;}body.${ROOT_CLASS} .hsu2-commandbar{grid-template-columns:1fr!important;}body.${ROOT_CLASS} #${BADGE_ID}{left:12px!important;right:12px!important;justify-content:center!important;}body.${ROOT_CLASS} #${PANEL_ID}{left:12px!important;right:12px!important;width:auto!important;top:auto!important;bottom:72px!important;max-height:calc(100vh - 92px)!important;}}
    `;
  }

  function cleanupDashboardDecorations() {
    by(BOARD_ID)?.remove();
    by(LIST_ID)?.remove();
    document.querySelectorAll(`${TABLE_SELECTOR}.hsu2-source-table`).forEach((table) => {
      table.classList.remove("hsu2-source-table");
      table.style.removeProperty("display");
      table.querySelectorAll("tr").forEach((row) => {
        row.classList.remove("hsu2-row-selected");
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
    if (!(main instanceof HTMLElement) || !(preview instanceof HTMLElement)) return null;
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

  function computeSignature() {
    const tables = Array.from(document.querySelectorAll(TABLE_SELECTOR)).filter((table) => table instanceof HTMLTableElement);
    return [
      location.pathname,
      tables
        .map((table) => {
          const rows = Array.from(table.tBodies?.[0]?.rows || []);
          const first = txt(rows[0]?.textContent || "").slice(0, 80);
          const last = txt(rows[rows.length - 1]?.textContent || "").slice(0, 80);
          return `${rows.length}:${first}:${last}`;
        })
        .join("|"),
    ].join("::");
  }

  function decorateTables() {
    const tables = Array.from(document.querySelectorAll(TABLE_SELECTOR)).filter((table) => table instanceof HTMLTableElement);
    const rows = [];
    tables.forEach((table) => {
      table.classList.add("hsu2-source-table");
      table.style.setProperty("display", "none", "important");
      const idx = getIndices(table);
      Array.from(table.tBodies?.[0]?.rows || []).forEach((row) => {
        if (!(row instanceof HTMLTableRowElement)) return;
        const data = buildRowData(row, idx);
        row.__hsu2Data = data;
        row.dataset.hsu2Key = txt(data.key);
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

  function clearSelection() {
    selectedKey = "";
    document.querySelectorAll(`${TABLE_SELECTOR} tbody tr.hsu2-row-selected`).forEach((row) =>
      row.classList.remove("hsu2-row-selected")
    );
    document.querySelectorAll(`#${LIST_ID} .hsu2-ticket.is-selected`).forEach((card) =>
      card.classList.remove("is-selected")
    );
    renderPreview(null);
  }

  function findTicketCard(key) {
    return (
      Array.from(document.querySelectorAll(`#${LIST_ID} .hsu2-ticket`)).find(
        (card) => txt(card.getAttribute("data-key")) === txt(key)
      ) || null
    );
  }

  function selectRow(row) {
    if (!(row instanceof HTMLTableRowElement) || !row.__hsu2Data) {
      clearSelection();
      return;
    }
    selectedKey = txt(row.dataset.hsu2Key || row.__hsu2Data.key || "");
    document.querySelectorAll(`${TABLE_SELECTOR} tbody tr`).forEach((item) => {
      item.classList.toggle("hsu2-row-selected", txt(item.dataset.hsu2Key) === selectedKey);
    });
    document.querySelectorAll(`#${LIST_ID} .hsu2-ticket`).forEach((card) => {
      card.classList.toggle("is-selected", txt(card.getAttribute("data-key")) === selectedKey);
    });
    const card = findTicketCard(selectedKey);
    if (card instanceof HTMLElement) card.classList.add("is-selected");
    renderPreview(row.__hsu2Data);
  }

  function findSelectedData() {
    const row = Array.from(document.querySelectorAll(`${TABLE_SELECTOR} tbody tr`)).find(
      (item) => item instanceof HTMLTableRowElement && item.dataset.hsu2Key === selectedKey
    );
    return row?.__hsu2Data || null;
  }

  function renderBoard(stats) {
    const main = by(MAIN_ID);
    if (!(main instanceof HTMLElement)) return;
    let board = by(BOARD_ID);
    if (!(board instanceof HTMLElement)) {
      board = document.createElement("section");
      board.id = BOARD_ID;
      board.className = "hsu2-card";
      main.prepend(board);
    }
    const settings = readSettings();
    const filterButtons = FILTER_OPTIONS.map((item) => {
      const count = stats.filterCounts[item.key] || 0;
      return `<button type="button" class="hsu2-segment ${activeBoardFilter === item.key ? "active" : ""}" data-filter="${escAttr(item.key)}"><span>${escHtml(item.short)}</span><strong>${count}</strong></button>`;
    }).join("");
    const sortOptions = SORT_OPTIONS.map(
      (item) =>
        `<option value="${escAttr(item.key)}"${activeSortMode === item.key ? " selected" : ""}>${escHtml(item.label)}</option>`
    ).join("");
    board.innerHTML = `
      <div class="hsu2-command-top">
        <div class="hsu2-command-copy">
          <span class="hsu2-eyebrow">Headsoft support command</span>
          <h2>Central Operacional de Chamados</h2>
          <p>${escHtml(stats.summary)}</p>
          <div class="hsu2-inline-row">
            ${buildSignalHtml(`${stats.visible} em foco`, "accent")}
            ${buildSignalHtml(stats.filterLabel, "neutral")}
            ${buildSignalHtml(stats.searchLabel ? `Busca: ${stats.searchLabel}` : "Sem busca local", stats.searchLabel ? "medium" : "neutral")}
            ${buildSignalHtml(`Ordenacao ${stats.sortLabel}`, "neutral")}
          </div>
        </div>
        <div class="hsu2-command-actions">
          <button type="button" class="hsu2-action" data-action="refresh">Reaplicar</button>
          <button type="button" class="hsu2-action primary" data-action="panel">Painel da v2</button>
        </div>
      </div>
      ${
        settings.showMetrics
          ? `
          <div class="hsu2-kpi-grid">
            <article class="hsu2-kpi"><strong>${stats.total}</strong><span>Total visivel</span></article>
            <article class="hsu2-kpi"><strong>${stats.critical}</strong><span>Escalados</span></article>
            <article class="hsu2-kpi"><strong>${stats.aguardando}</strong><span>Aguardando</span></article>
            <article class="hsu2-kpi"><strong>${stats.coverageRate}%</strong><span>Fila com dono</span></article>
            <article class="hsu2-kpi"><strong>${formatHours(stats.maisAntigo)}</strong><span>Mais antigo</span></article>
          </div>
        `
          : ""
      }
      <div class="hsu2-commandbar">
        <label class="hsu2-field"><span>Busca local</span><input type="search" data-role="search" value="${escAttr(activeSearchTerm)}" placeholder="Numero, cliente, responsavel ou assunto" /></label>
        <label class="hsu2-field"><span>Ordenar por</span><select data-role="sort">${sortOptions}</select></label>
        ${activeSearchTerm ? `<button type="button" class="hsu2-action" data-action="clear-search">Limpar busca</button>` : `<div class="hsu2-command-pill">Workspace em ritmo</div>`}
      </div>
      <div class="hsu2-segment-row">${filterButtons}</div>
      ${
        settings.showMetrics
          ? `
          <div class="hsu2-insights-grid">
            <article class="hsu2-insight"><span class="label">Sem responsavel</span><span class="value">${stats.semResponsavel} tickets sem dono</span></article>
            <article class="hsu2-insight"><span class="label">Tempo medio</span><span class="value">${formatHours(stats.mediaHoras)} de vida media</span></article>
            <article class="hsu2-insight"><span class="label">Maior concentracao</span><span class="value">${escHtml(stats.topOwnerLabel)}</span></article>
            <article class="hsu2-insight"><span class="label">Clientes</span><span class="value">${stats.uniqueClients || 0} clientes distintos no recorte</span></article>
          </div>
        `
          : ""
      }
    `;
    board.querySelector('[data-action="panel"]')?.addEventListener("click", () => openPanel(lastPayload));
    board.querySelector('[data-action="refresh"]')?.addEventListener("click", () => refreshExperience(true));
    board.querySelector('[data-action="clear-search"]')?.addEventListener("click", () => {
      activeSearchTerm = "";
      renderWorkspace(lastRows);
    });
    const searchInput = board.querySelector('[data-role="search"]');
    if (searchInput instanceof HTMLInputElement) {
      searchInput.addEventListener("input", () => {
        activeSearchTerm = txt(searchInput.value);
        renderWorkspace(lastRows);
      });
      searchInput.addEventListener("keydown", (ev) => {
        if (ev.key === "Escape") {
          activeSearchTerm = "";
          searchInput.value = "";
          renderWorkspace(lastRows);
        }
      });
    }
    const sortSelect = board.querySelector('[data-role="sort"]');
    if (sortSelect instanceof HTMLSelectElement) {
      sortSelect.addEventListener("change", () => {
        activeSortMode = txt(sortSelect.value || "priority");
        renderWorkspace(lastRows);
      });
    }
    board.querySelectorAll("[data-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        activeBoardFilter = txt(button.getAttribute("data-filter")) || "all";
        renderWorkspace(lastRows);
      });
    });
  }

  function buildTicketCard(data, settings) {
    const metrics = [
      buildFactHtml("Cliente", data.client || "Nao informado"),
      buildFactHtml("Responsavel", data.owner || "Distribuir"),
      buildFactHtml("Abertura", data.dateRaw || "Nao informada"),
    ];
    if (settings.showAge) metrics.push(buildFactHtml("Idade", data.ageLabel || "n/d"));
    metrics.push(buildFactHtml("Risco", data.priorityMeta.label));
    const signals = data.attentionReasons.slice(0, 3).map((reason) => {
      const tone = /critica|72 horas|24 horas/i.test(reason)
        ? "danger"
        : /sem responsavel|novo|aguardando/i.test(reason)
          ? "medium"
          : "neutral";
      return buildSignalHtml(reason, tone);
    });
    return `
      <article class="hsu2-ticket tone-${escAttr(data.priorityMeta.tone)}${selectedKey === data.key ? " is-selected" : ""}" data-key="${escAttr(data.key)}">
        <div class="hsu2-ticket-top">
          <div class="hsu2-ticket-badges">
            ${data.number ? `<span class="hsu2-chip strong">#${escHtml(data.number)}</span>` : ""}
            ${data.status ? `<span class="hsu2-status tone-${escAttr(data.statusClass)}">${escHtml(data.status)}</span>` : ""}
            ${data.owner ? `<span class="hsu2-chip">${escHtml(data.owner)}</span>` : `<span class="hsu2-chip empty">Sem responsavel</span>`}
          </div>
          <div class="hsu2-ticket-actions">
            <button type="button" class="hsu2-preview-btn" data-action="preview">Focar</button>
            ${data.href ? `<a class="hsu2-action subtle" data-action="open" href="${escAttr(data.href)}" target="_blank" rel="noopener">Abrir</a>` : ""}
          </div>
        </div>
        <div class="hsu2-ticket-main">
          <div>
            <h3 class="hsu2-ticket-title">${escHtml(data.title || "Chamado sem titulo")}</h3>
            <p class="hsu2-ticket-summary">${escHtml(data.client || "Cliente nao informado")}${data.dateRaw ? ` | aberto em ${escHtml(data.dateRaw)}` : ""}</p>
          </div>
          <div class="hsu2-priority-chip tone-${escAttr(data.priorityMeta.tone)}">
            <span>Score</span>
            <strong>${Math.round(data.priorityScore)}</strong>
            <em>${escHtml(data.priorityMeta.short)}</em>
          </div>
        </div>
        <div class="hsu2-ticket-grid">${metrics.join("")}</div>
        <div class="hsu2-ticket-footer">
          <div class="hsu2-signal-row">${signals.join("")}</div>
          <div class="hsu2-meter"><span style="width:${Math.max(18, Math.min(100, data.priorityMeta.meter))}%"></span></div>
          <p class="hsu2-ticket-note">${escHtml(data.actionHint)}</p>
        </div>
      </article>
    `;
  }

  function focusPreviewForSmallScreens() {
    if (window.innerWidth > 1380) return;
    const preview = by(PREVIEW_ID);
    if (preview instanceof HTMLElement) preview.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderTicketList(visibleRows) {
    const host = ensureListHost();
    if (!(host instanceof HTMLElement)) return;
    const settings = readSettings();
    const filterMeta = getFilterMeta();
    host.innerHTML = `
      <div class="hsu2-list-head">
        <div>
          <span class="hsu2-eyebrow">Fila em foco</span>
          <h3>${visibleRows.length} chamados prontos para triagem</h3>
          <p>${escHtml(activeSearchTerm ? `Recorte ${filterMeta.label.toLowerCase()} com busca por "${activeSearchTerm}".` : `Recorte atual: ${filterMeta.label.toLowerCase()}.`)}</p>
        </div>
        <div class="hsu2-tags">
          ${buildSignalHtml(`Ordenacao ${getSortMeta().label}`, "neutral")}
          ${buildSignalHtml(activeSearchTerm ? "Busca ativa" : "Busca livre", activeSearchTerm ? "medium" : "neutral")}
        </div>
      </div>
      ${
        visibleRows.length
          ? `<div class="hsu2-ticket-stack">${visibleRows.map((data) => buildTicketCard(data, settings)).join("")}</div>`
          : `<div class="hsu2-empty"><h4>Nenhum chamado encaixou nesse recorte</h4><div>Tente outro filtro local, limpe a busca ou volte para toda a fila.</div>${activeSearchTerm ? `<button type="button" class="hsu2-action" data-action="clear-search">Limpar busca</button>` : ""}</div>`
      }
    `;
    host.querySelector('[data-action="clear-search"]')?.addEventListener("click", () => {
      activeSearchTerm = "";
      renderWorkspace(lastRows);
    });
    host.querySelectorAll(".hsu2-ticket").forEach((card) => {
      const key = txt(card.getAttribute("data-key"));
      const data = lastRows.find((item) => item.key === key) || null;
      if (!data?.row) return;
      card.addEventListener("mouseenter", () => {
        if (readSettings().livePreview) selectRow(data.row);
      });
      card.addEventListener("click", (ev) => {
        const target = ev.target instanceof HTMLElement ? ev.target : null;
        const action = txt(target?.closest("[data-action]")?.getAttribute("data-action"));
        if (action === "open") return;
        selectRow(data.row);
        if (action === "preview") focusPreviewForSmallScreens();
      });
    });
  }

  function renderPreview(data = null) {
    const host = by(PREVIEW_ID);
    if (!(host instanceof HTMLElement)) return;
    if (!host.dataset.hsu2Built) {
      host.dataset.hsu2Built = "1";
      host.innerHTML = `
        <section class="hsu2-card hsu2-preview-card">
          <div class="hsu2-section-head">
            <div>
              <span class="hsu2-eyebrow">Contexto imediato</span>
              <h3>Chamado em foco</h3>
              <p>Resumo rapido para decidir a proxima acao sem sair da fila.</p>
            </div>
            <button type="button" class="hsu2-action" data-action="panel">Painel</button>
          </div>
          <div class="hsu2-card-body">
            <div class="hsu2-empty" data-slot="empty">Selecione um chamado para abrir o resumo operacional da lateral.</div>
            <div data-slot="content" hidden>
              <div class="hsu2-preview-hero">
                <div class="hsu2-tags" data-slot="chips"></div>
                <h3 class="hsu2-preview-title" data-slot="title">-</h3>
                <p class="hsu2-preview-note" data-slot="note">-</p>
              </div>
              <div class="hsu2-preview-grid" data-slot="meta"></div>
              <div class="hsu2-preview-insights">
                <div class="hsu2-fact"><span class="hsu2-fact-label">Sinal operacional</span><strong class="hsu2-fact-value" data-slot="focus">-</strong></div>
                <div class="hsu2-fact"><span class="hsu2-fact-label">Proxima acao</span><strong class="hsu2-fact-value" data-slot="action">-</strong></div>
              </div>
              <div class="hsu2-signal-row" data-slot="signals"></div>
              <div class="hsu2-preview-actions">
                <a class="hsu2-action primary" data-slot="open" href="#" target="_blank" rel="noopener">Abrir chamado</a>
                <button type="button" class="hsu2-action" data-action="copy">Copiar numero</button>
                <button type="button" class="hsu2-action subtle" data-action="reload">Recarregar contexto</button>
              </div>
            </div>
          </div>
        </section>
        <section class="hsu2-card hsu2-live-card">
          <div class="hsu2-section-head">
            <div>
              <span class="hsu2-eyebrow">Leitura embutida</span>
              <h3>Preview vivo</h3>
              <p>Iframe da propria requisicao para consulta rapida.</p>
            </div>
          </div>
          <div class="hsu2-card-body">
            <div class="hsu2-empty" data-slot="frame-empty">Nenhum chamado selecionado para abrir o iframe lateral.</div>
            <iframe class="hsu2-preview-frame" data-slot="frame" hidden loading="lazy"></iframe>
          </div>
        </section>
      `;
      host.querySelector('[data-action="panel"]')?.addEventListener("click", () => openPanel(lastPayload));
      host.querySelector('[data-action="copy"]')?.addEventListener("click", async () => {
        const current = findSelectedData();
        const ok = current?.number ? await copyText(current.number) : false;
        triggerNotification({ message: ok ? "Numero do chamado copiado pela V2." : "Nao foi possivel copiar o numero agora." });
      });
      host.querySelector('[data-action="reload"]')?.addEventListener("click", () => {
        const current = findSelectedData();
        const frame = host.querySelector('[data-slot="frame"]');
        if (current?.href && frame instanceof HTMLIFrameElement) frame.src = buildLiveFrameHref(current.href, true);
      });
    }
    const settings = readSettings();
    const empty = host.querySelector('[data-slot="empty"]');
    const content = host.querySelector('[data-slot="content"]');
    const chips = host.querySelector('[data-slot="chips"]');
    const title = host.querySelector('[data-slot="title"]');
    const note = host.querySelector('[data-slot="note"]');
    const meta = host.querySelector('[data-slot="meta"]');
    const focus = host.querySelector('[data-slot="focus"]');
    const action = host.querySelector('[data-slot="action"]');
    const signals = host.querySelector('[data-slot="signals"]');
    const open = host.querySelector('[data-slot="open"]');
    const frame = host.querySelector('[data-slot="frame"]');
    const frameEmpty = host.querySelector('[data-slot="frame-empty"]');
    const liveCard = host.querySelector(".hsu2-live-card");
    if (
      !(empty instanceof HTMLElement) ||
      !(content instanceof HTMLElement) ||
      !(chips instanceof HTMLElement) ||
      !(title instanceof HTMLElement) ||
      !(note instanceof HTMLElement) ||
      !(meta instanceof HTMLElement) ||
      !(focus instanceof HTMLElement) ||
      !(action instanceof HTMLElement) ||
      !(signals instanceof HTMLElement) ||
      !(open instanceof HTMLAnchorElement) ||
      !(frameEmpty instanceof HTMLElement) ||
      !(liveCard instanceof HTMLElement)
    ) {
      return;
    }
    liveCard.hidden = !settings.showLiveFrame;
    if (!data) {
      empty.hidden = false;
      content.hidden = true;
      chips.innerHTML = "";
      title.textContent = "-";
      note.textContent = "-";
      meta.innerHTML = "";
      focus.textContent = "-";
      action.textContent = "-";
      signals.innerHTML = "";
      open.href = "#";
      open.hidden = true;
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
      data.number ? `<span class="hsu2-chip strong">#${escHtml(data.number)}</span>` : "",
      data.status ? `<span class="hsu2-status tone-${escAttr(data.statusClass)}">${escHtml(data.status)}</span>` : "",
      `<span class="hsu2-chip priority-${escAttr(data.priorityMeta.tone)}">${escHtml(data.priorityMeta.label)}</span>`,
      settings.showAge && data.ageLabel ? `<span class="hsu2-chip">${escHtml(data.ageLabel)}</span>` : "",
    ].join("");
    title.textContent = txt(data.title || "Chamado sem titulo");
    note.textContent = txt(data.focusNote || "Chamado pronto para leitura.");
    meta.innerHTML = [
      buildFactHtml("Cliente", data.client || "Nao informado"),
      buildFactHtml("Responsavel", data.owner || "Sem responsavel"),
      buildFactHtml("Abertura", data.dateRaw || "Nao informada"),
      buildFactHtml("Status", data.status || "Sem status"),
      buildFactHtml("Idade", settings.showAge ? data.ageLabel || "n/d" : "Oculta"),
      buildFactHtml("Recorte", data.priorityMeta.short),
    ].join("");
    focus.textContent = txt(data.focusNote || "Fluxo normal");
    action.textContent = txt(data.actionHint || "Seguir com a proxima acao");
    signals.innerHTML = data.attentionReasons
      .slice(0, 4)
      .map((reason) => {
        const tone =
          /critica|72 horas|24 horas/i.test(reason)
            ? "danger"
            : /sem responsavel|novo|aguardando/i.test(reason)
              ? "medium"
              : "neutral";
        return buildSignalHtml(reason, tone);
      })
      .join("");
    open.href = data.href || "#";
    open.hidden = !data.href;
    if (settings.showLiveFrame && frame instanceof HTMLIFrameElement && data.previewHref) {
      if (frame.src !== data.previewHref) frame.src = data.previewHref;
      frame.hidden = false;
      frameEmpty.hidden = true;
    } else if (frame instanceof HTMLIFrameElement) {
      frame.hidden = true;
      frame.removeAttribute("src");
      frameEmpty.hidden = false;
    }
  }

  function renderWorkspace(rows = lastRows) {
    lastRows = Array.isArray(rows) ? rows.slice() : [];
    const visibleRows = getVisibleRows(lastRows);
    lastStats = buildStats(lastRows, visibleRows);
    renderBoard(lastStats);
    renderTicketList(visibleRows);
    const chosen = visibleRows.find((row) => row.key === selectedKey)?.row || visibleRows[0]?.row || null;
    if (chosen instanceof HTMLTableRowElement) selectRow(chosen);
    else clearSelection();
    syncPanel();
  }

  function refreshDashboard(force = false) {
    const shell = ensureShell();
    if (!shell) return;
    const signature = computeSignature();
    if (!force && signature === lastSignature && by(BOARD_ID) && by(PREVIEW_ID)) {
      renderWorkspace(lastRows);
      return;
    }
    cleanupDashboardDecorations();
    const rows = decorateTables();
    renderWorkspace(rows);
    lastSignature = signature;
  }

  function getRequestScreenLabel() {
    const params = new URLSearchParams(location.search || "");
    const guessed = txt(params.get("numero")) || txt(params.get("cod")) || txt(params.get("requisicao")) || txt(params.get("id"));
    return guessed ? `Chamado ${guessed}` : "Central da requisicao";
  }

  function ensureRequestBadge() {
    if (!isRequestPage() || IS_PREVIEW_FRAME) {
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
    badge.innerHTML = `
      <div>
        <span class="hsu2-eyebrow">Workspace user2</span>
        <strong>${escHtml(getRequestScreenLabel())}</strong>
        <span>Leitura unificada da requisicao, acompanhamentos e respostas com a mesma linguagem da fila operacional.</span>
      </div>
      <div class="hsu2-command-actions">
        <span class="hsu2-chip strong">v${escHtml(USER2_VERSION)}</span>
        <button type="button" class="hsu2-action primary" data-action="panel">Painel da v2</button>
      </div>
    `;
    badge.querySelector('[data-action="panel"]')?.addEventListener("click", () => openPanel(lastPayload));
  }

  function ensureBadge(payload = {}) {
    if (IS_PREVIEW_FRAME) return;
    let badge = by(BADGE_ID);
    if (!(badge instanceof HTMLButtonElement)) {
      badge = document.createElement("button");
      badge.type = "button";
      badge.id = BADGE_ID;
      document.body.appendChild(badge);
    }
    badge.textContent = `Workspace user2 v${USER2_VERSION}`;
    badge.onclick = () => openPanel(payload);
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
        <div class="hsu2-section-head">
          <div>
            <span class="hsu2-eyebrow">Workspace control</span>
            <h3>Headsoft Service Desk v2</h3>
            <p>Configuracoes e leitura operacional da nova experiencia, separadas da versao antiga.</p>
          </div>
          <button type="button" class="hsu2-action" data-action="close">Fechar</button>
        </div>
        <div class="panel-grid">
          <section class="hsu2-panel-card"><div class="hsu2-panel-grid"><div class="hsu2-panel-stat"><span>Versao user2</span><strong data-slot="user2-version">${USER2_VERSION}</strong></div><div class="hsu2-panel-stat"><span>Versao user.js</span><strong data-slot="user-version">-</strong></div><div class="hsu2-panel-stat"><span>Pagina</span><strong data-slot="page">-</strong></div><div class="hsu2-panel-stat"><span>Status</span><strong data-slot="status">Ativo</strong></div></div></section>
          <section class="hsu2-panel-card"><div class="hsu2-control-grid"><label class="hsu2-field"><span>Densidade</span><select data-setting="density"><option value="compact">Compacta</option><option value="comfortable">Confortavel</option><option value="airy">Aerea</option></select></label><label class="hsu2-toggle"><span>Mostrar indicadores</span><input type="checkbox" data-setting="showMetrics" /></label><label class="hsu2-toggle"><span>Mostrar idade</span><input type="checkbox" data-setting="showAge" /></label><label class="hsu2-toggle"><span>Preview no hover</span><input type="checkbox" data-setting="livePreview" /></label><label class="hsu2-toggle"><span>Mostrar filtros originais</span><input type="checkbox" data-setting="showLegacyFilters" /></label><label class="hsu2-toggle"><span>Iframe lateral</span><input type="checkbox" data-setting="showLiveFrame" /></label></div></section>
          <section class="hsu2-panel-card"><div class="hsu2-panel-grid"><div class="hsu2-panel-stat"><span>Total</span><strong data-stat="total">-</strong></div><div class="hsu2-panel-stat"><span>Em foco</span><strong data-stat="visible">-</strong></div><div class="hsu2-panel-stat"><span>Escalados</span><strong data-stat="critical">-</strong></div><div class="hsu2-panel-stat"><span>Sem responsavel</span><strong data-stat="semResponsavel">-</strong></div><div class="hsu2-panel-stat"><span>Tempo medio</span><strong data-stat="mediaHoras">-</strong></div><div class="hsu2-panel-stat"><span>Mais antigo</span><strong data-stat="maisAntigo">-</strong></div><div class="hsu2-panel-stat"><span>Filtro ativo</span><strong data-stat="filter">-</strong></div><div class="hsu2-panel-stat"><span>Maior concentracao</span><strong data-stat="topOwner">-</strong></div></div></section>
          <section class="hsu2-panel-card"><div class="hsu2-panel-stat"><span>Resumo operacional</span><strong data-slot="summary">-</strong></div></section>
          <section class="hsu2-panel-card"><div class="hsu2-update-list" data-slot="updates"></div></section>
          <section class="hsu2-panel-card"><div class="hsu2-panel-actions"><button type="button" class="hsu2-action" data-action="refresh">Reaplicar workspace</button><button type="button" class="hsu2-action" data-action="notify">Testar aviso</button><button type="button" class="hsu2-action subtle" data-action="disable">Voltar para antiga</button></div></section>
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
    const setText = (selector, value) => {
      const el = panel.querySelector(selector);
      if (el instanceof HTMLElement) el.textContent = txt(value || "-");
    };
    setText('[data-slot="user-version"]', lastPayload.scriptVersion || "-");
    setText('[data-slot="page"]', lastPayload.page || getPageLabel());
    setText('[data-slot="status"]', isDashboardPage() ? (lastStats ? "Workspace aplicado" : "Aguardando grade") : isRequestPage() ? "Tela repaginada" : "Workspace ativo");
    setText('[data-slot="summary"]', lastStats?.summary || "Sem leitura da fila no momento.");
    setText('[data-stat="total"]', lastStats ? String(lastStats.total) : "-");
    setText('[data-stat="visible"]', lastStats ? String(lastStats.visible) : "-");
    setText('[data-stat="critical"]', lastStats ? String(lastStats.critical) : "-");
    setText('[data-stat="semResponsavel"]', lastStats ? String(lastStats.semResponsavel) : "-");
    setText('[data-stat="mediaHoras"]', lastStats ? formatHours(lastStats.mediaHoras) : "-");
    setText('[data-stat="maisAntigo"]', lastStats ? formatHours(lastStats.maisAntigo) : "-");
    setText('[data-stat="filter"]', lastStats?.filterLabel || getFilterMeta().label);
    setText('[data-stat="topOwner"]', lastStats?.topOwnerLabel || "Distribuicao aberta");
    const updatesEl = panel.querySelector('[data-slot="updates"]');
    if (updatesEl instanceof HTMLElement) {
      updatesEl.innerHTML = USER2_UPDATES.map((item) => {
        const notes = item.notes.map((note) => `<p>${escHtml(note)}</p>`).join("");
        return `<article class="hsu2-update-entry"><strong>v${escHtml(item.version)} - ${escHtml(item.date)}</strong>${notes}</article>`;
      }).join("");
    }
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
    document.body?.setAttribute("data-hsu2-show-legacy-filters", settings.showLegacyFilters ? "1" : "0");
    document.body?.setAttribute("data-hsu2-show-live-frame", settings.showLiveFrame ? "1" : "0");
    if (IS_PREVIEW_FRAME) document.body?.setAttribute("data-hsu2-preview-frame", "1");
  }

  function refreshExperience(force = false) {
    applyPreferences();
    if (isDashboardPage()) refreshDashboard(force);
    else {
      cleanupDashboardDecorations();
      renderPreview(null);
      destroyShell();
      lastRows = [];
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
      timer = window.setTimeout(() => refreshExperience(true), 160);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function ensureHeartbeat() {
    if (heartbeat || IS_PREVIEW_FRAME) return;
    heartbeat = window.setInterval(() => {
      if (isEnabled()) refreshExperience(false);
    }, 3600);
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
      `Modulo user2 v${USER2_VERSION} ativou a nova central operacional de chamados com preview lateral e visual moderno.`;
    if (typeof api.showChamadoUpdateNotification === "function") {
      api.showChamadoUpdateNotification({
        numero: "USER2-30100",
        situacao: "Workspace v2 ativo",
        responsavel: "user2.js",
        resumo: summary,
        origem: "User2 independente",
        highlightColor: "#5DE2FF",
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
    renderPreview(null);
    destroyShell();
    by(REQUEST_BADGE_ID)?.remove();
    by(BADGE_ID)?.remove();
    by(PANEL_ID)?.remove();
    document.body?.classList?.remove(ROOT_CLASS);
    document.body?.removeAttribute("data-hsu2-density");
    document.body?.removeAttribute("data-hsu2-show-legacy-filters");
    document.body?.removeAttribute("data-hsu2-show-live-frame");
    document.body?.removeAttribute("data-hsu2-preview-frame");
    selectedKey = "";
    activeBoardFilter = "all";
    activeSearchTerm = "";
    activeSortMode = "priority";
    lastRows = [];
    lastStats = null;
    lastSignature = "";
    return true;
  }

  function getVersionInfo() {
    return {
      version: USER2_VERSION,
      updates: USER2_UPDATES.map((item) => ({
        ...item,
        notes: Array.isArray(item.notes) ? item.notes.slice() : [],
      })),
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
