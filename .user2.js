(() => {
  const API_NAME = "HSHeadsoftUser2";
  const USER2_VERSION = "3.00.02";
  const USER2_UPDATES = Object.freeze([
    {
      version: "3.00.02",
      date: "2026-03-13",
      notes: [
        "Bootstrap do user2 foi reforcado para subir junto do fallback remoto do user.js quando o @require nao bastar sozinho.",
        "Painel experimental volta a abrir com mais confianca e a repaginacao do grid passa a ser montada logo apos a ativacao.",
        "Release mantem a grade repaginada, metricas e preferencias separadas da versao antiga.",
      ],
    },
    {
      version: "3.00.01",
      date: "2026-03-13",
      notes: [
        "Nova camada visual da grade de chamados com estilo mais organico, profissional e tech.",
        "Painel proprio do user2 com versao independente, metricas da fila e preferencias separadas da versao antiga.",
        "Preferencias desta nova experiencia ficam salvas no navegador sem misturar com as configuracoes do user.js legado.",
      ],
    },
  ]);

  const ROOT_CLASS = "hsu2-active";
  const STYLE_ID = "hsu2-style";
  const BADGE_ID = "hsu2-badge";
  const PANEL_ID = "hsu2-panel";
  const BOARD_ID = "hsu2-board";
  const TABLE_SELECTOR = "#conteudo table.sortable";
  const MODE_KEY = "hs2025-experimental-user2-mode";
  const SETTINGS_KEY = "hs2025-user2-settings-v1";

  let observer = null;
  let timer = 0;
  let lastPayload = {};
  let lastStats = null;

  const DEFAULT_SETTINGS = Object.freeze({
    density: "comfortable",
    accent: "balanced",
    showMetrics: true,
    showAge: true,
  });

  const txt = (value) => String(value || "").replace(/\s+/g, " ").trim();
  const by = (id) => document.getElementById(id);
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

  function readSettings() {
    try {
      const parsed = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
      return {
        density: ["compact", "comfortable", "airy"].includes(parsed?.density)
          ? parsed.density
          : DEFAULT_SETTINGS.density,
        accent: ["soft", "balanced", "bold"].includes(parsed?.accent)
          ? parsed.accent
          : DEFAULT_SETTINGS.accent,
        showMetrics: parsed?.showMetrics !== false,
        showAge: parsed?.showAge !== false,
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
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  }

  function ensureStyle() {
    if (by(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      body.${ROOT_CLASS}{
        --hsu2-navy:#0a1d31;
        --hsu2-blue:#2b6df6;
        --hsu2-cyan:#18b7c9;
        --hsu2-green:#31c77d;
        --hsu2-coral:#ef6d5c;
        --hsu2-amber:#f1bf63;
        --hsu2-text:#e8f2ff;
        --hsu2-soft:#9ec2f7;
        --hsu2-line:rgba(92,139,208,.22);
      }
      body.${ROOT_CLASS}[data-hsu2-density="compact"]{ --hsu2-py:7px; --hsu2-px:9px; }
      body.${ROOT_CLASS}[data-hsu2-density="comfortable"]{ --hsu2-py:10px; --hsu2-px:12px; }
      body.${ROOT_CLASS}[data-hsu2-density="airy"]{ --hsu2-py:13px; --hsu2-px:14px; }
      body.${ROOT_CLASS} #conteudo::before{
        content:"User2 v${USER2_VERSION}"!important;
        display:block!important;
        width:max-content!important;
        margin:8px 0 12px!important;
        padding:8px 14px!important;
        border-radius:999px!important;
        border:1px solid rgba(97,151,234,.28)!important;
        background:linear-gradient(90deg, rgba(10,29,49,.95), rgba(11,58,63,.9))!important;
        color:#eef6ff!important;
        font:800 12px/1 'Segoe UI', Tahoma, sans-serif!important;
        letter-spacing:.08em!important;
        text-transform:uppercase!important;
      }
      #${BADGE_ID}{
        position:fixed!important; top:88px!important; right:16px!important; z-index:1000048!important;
        display:flex!important; gap:8px!important; align-items:center!important; padding:10px 14px!important;
        border-radius:999px!important; border:1px solid rgba(92,139,208,.34)!important;
        background:linear-gradient(135deg, rgba(10,29,49,.97), rgba(8,48,60,.95))!important;
        color:#eef6ff!important; font:800 12px/1 'Segoe UI', Tahoma, sans-serif!important; cursor:pointer!important;
        box-shadow:0 18px 36px rgba(0,0,0,.3)!important;
      }
      #${BADGE_ID}::before{
        content:""; width:10px; height:10px; border-radius:50%;
        background:linear-gradient(180deg, var(--hsu2-cyan), var(--hsu2-green)); box-shadow:0 0 0 4px rgba(24,183,201,.14);
      }
      #${PANEL_ID}{
        position:fixed!important; right:16px!important; top:136px!important; width:min(460px, calc(100vw - 32px))!important;
        max-height:min(84vh, 860px)!important; overflow:auto!important; z-index:1000049!important; border-radius:20px!important;
        border:1px solid rgba(92,139,208,.32)!important; background:linear-gradient(160deg, rgba(10,28,47,.98), rgba(9,38,57,.96))!important;
        color:#eef6ff!important; box-shadow:0 28px 58px rgba(0,0,0,.42)!important;
      }
      #${PANEL_ID}[hidden]{ display:none!important; }
      #${PANEL_ID} .phead, #${PANEL_ID} .pcard, .hsu2-board, table.sortable.hsu2-table tbody td{ border:1px solid var(--hsu2-line)!important; }
      #${PANEL_ID} .phead{ display:flex!important; justify-content:space-between!important; gap:12px!important; padding:16px!important; border-radius:20px 20px 0 0!important; background:rgba(10,24,40,.44)!important; }
      #${PANEL_ID} .phead h3, .hsu2-board h3{ margin:0!important; font:900 18px/1.15 'Segoe UI', Tahoma, sans-serif!important; }
      #${PANEL_ID} .phead p{ margin:6px 0 0!important; color:#a8caf8!important; font:600 12px/1.4 'Segoe UI', Tahoma, sans-serif!important; }
      #${PANEL_ID} .pbody{ display:grid!important; gap:12px!important; padding:14px 16px 16px!important; }
      #${PANEL_ID} .pcard{ border-radius:16px!important; padding:12px!important; background:linear-gradient(180deg, rgba(13,35,58,.9), rgba(10,27,44,.94))!important; }
      #${PANEL_ID} .grid2{ display:grid!important; grid-template-columns:repeat(2, minmax(0,1fr))!important; gap:10px!important; }
      #${PANEL_ID} .label{ margin:0 0 6px!important; color:#89b6f5!important; font:800 10px/1.2 'Segoe UI', Tahoma, sans-serif!important; text-transform:uppercase!important; letter-spacing:.08em!important; }
      #${PANEL_ID} .value{ margin:0!important; color:#f5f9ff!important; font:700 13px/1.4 'Segoe UI', Tahoma, sans-serif!important; }
      #${PANEL_ID} .btn, #${PANEL_ID} select{
        min-height:36px!important; border-radius:10px!important; border:1px solid rgba(92,139,208,.3)!important;
        background:linear-gradient(180deg, rgba(20,48,78,.96), rgba(13,32,54,.96))!important; color:#eef6ff!important;
        font:800 12px/1 'Segoe UI', Tahoma, sans-serif!important;
      }
      #${PANEL_ID} .btn{ padding:0 12px!important; cursor:pointer!important; }
      #${PANEL_ID} .actions, #${PANEL_ID} .controls{ display:grid!important; gap:10px!important; }
      #${PANEL_ID} .controls{ grid-template-columns:repeat(2, minmax(0,1fr))!important; }
      #${PANEL_ID} .toggle{ display:flex!important; align-items:center!important; justify-content:space-between!important; gap:8px!important; }
      .hsu2-board{
        margin:0 0 14px!important; padding:14px!important; border-radius:22px!important;
        background:radial-gradient(circle at top right, rgba(24,183,201,.12), transparent 28%), linear-gradient(160deg, rgba(9,24,40,.98), rgba(8,35,55,.95))!important;
        box-shadow:0 24px 54px rgba(4,11,24,.36)!important;
      }
      .hsu2-board p{ margin:6px 0 0!important; color:#a8caf8!important; font:600 12px/1.4 'Segoe UI', Tahoma, sans-serif!important; }
      .hsu2-kpis{ display:grid!important; grid-template-columns:repeat(5, minmax(0,1fr))!important; gap:10px!important; margin-top:14px!important; }
      .hsu2-kpi{ border-radius:18px!important; padding:12px!important; background:linear-gradient(180deg, rgba(16,41,67,.92), rgba(10,27,45,.95))!important; border:1px solid rgba(92,139,208,.18)!important; }
      .hsu2-kpi strong{ display:block!important; color:#f9fbff!important; font:900 26px/1 'Segoe UI', Tahoma, sans-serif!important; }
      .hsu2-kpi span{ display:block!important; margin-top:6px!important; color:#98bff4!important; font:800 11px/1.25 'Segoe UI', Tahoma, sans-serif!important; text-transform:uppercase!important; letter-spacing:.08em!important; }
      table.sortable.hsu2-table{ width:100%!important; border-collapse:separate!important; border-spacing:0 9px!important; background:transparent!important; }
      table.sortable.hsu2-table thead th{
        position:sticky!important; top:0!important; z-index:2!important; padding:11px 12px!important;
        background:linear-gradient(180deg, rgba(19,48,79,.96), rgba(14,37,61,.96))!important; color:#eaf3ff!important;
        text-transform:uppercase!important; letter-spacing:.08em!important; font-size:10px!important; border-top:1px solid rgba(92,139,208,.18)!important; border-bottom:1px solid rgba(92,139,208,.18)!important;
      }
      table.sortable.hsu2-table tbody td{
        padding:var(--hsu2-py) var(--hsu2-px)!important; background:rgba(10,28,47,.84)!important; color:#e6f1ff!important; vertical-align:middle!important;
      }
      table.sortable.hsu2-table tbody tr:nth-child(even) td{ background:rgba(8,23,38,.78)!important; }
      table.sortable.hsu2-table tbody tr.hsu2-row-new td{ box-shadow:inset 3px 0 0 rgba(49,199,125,.78)!important; }
      table.sortable.hsu2-table tbody tr.hsu2-row-old td{ box-shadow:inset 3px 0 0 rgba(241,191,99,.84)!important; }
      table.sortable.hsu2-table tbody tr.hsu2-row-unassigned td{ box-shadow:inset 3px 0 0 rgba(239,109,92,.78)!important; }
      .hsu2-meta{ display:flex!important; flex-wrap:wrap!important; gap:6px!important; margin-top:7px!important; }
      .hsu2-chip{
        display:inline-flex!important; align-items:center!important; min-height:24px!important; padding:0 9px!important; border-radius:999px!important;
        border:1px solid rgba(92,139,208,.18)!important; background:rgba(14,38,63,.92)!important; color:#daebff!important;
        font:800 10px/1 'Segoe UI', Tahoma, sans-serif!important; letter-spacing:.05em!important; text-transform:uppercase!important;
      }
      .hsu2-chip.empty{ border-color:rgba(239,109,92,.24)!important; color:#ffd8d0!important; }
      .hsu2-chip.old{ border-color:rgba(241,191,99,.24)!important; color:#fff0ca!important; }
      .hsu2-status{ display:inline-flex!important; min-height:26px!important; align-items:center!important; padding:0 10px!important; border-radius:999px!important; border:1px solid rgba(92,139,208,.18)!important; background:rgba(14,38,63,.92)!important; color:#eaf3ff!important; font:800 10px/1 'Segoe UI', Tahoma, sans-serif!important; letter-spacing:.05em!important; text-transform:uppercase!important; }
      .hsu2-status.new{ border-color:rgba(49,199,125,.26)!important; color:#dbffec!important; }
      .hsu2-status.waiting{ border-color:rgba(24,183,201,.24)!important; color:#dffaff!important; }
      .hsu2-status.alert{ border-color:rgba(239,109,92,.24)!important; color:#ffe2dc!important; }
      @media (max-width: 1100px){ .hsu2-kpis{ grid-template-columns:repeat(2, minmax(0,1fr))!important; } #${PANEL_ID} .grid2, #${PANEL_ID} .controls{ grid-template-columns:1fr!important; } }
      @media (max-width: 760px){ #${BADGE_ID}{ top:auto!important; bottom:14px!important; } #${PANEL_ID}{ left:10px!important; right:10px!important; width:auto!important; top:auto!important; bottom:70px!important; max-height:calc(100vh - 90px)!important; } .hsu2-kpis{ grid-template-columns:1fr!important; } }
    `;
    document.head.appendChild(style);
  }

  function getCellText(cell) {
    if (!(cell instanceof HTMLTableCellElement)) return "";
    return txt(cell.textContent || "");
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

  function enhanceTable(table) {
    table.classList.add("hsu2-table");
    const idx = getIndices(table);
    const settings = readSettings();
    return Array.from(table.tBodies?.[0]?.rows || []).map((row) => {
      const titleCell = idx.title >= 0 ? row.cells[idx.title] : null;
      const statusCell = idx.status >= 0 ? row.cells[idx.status] : null;
      const owner = idx.owner >= 0 ? getCellText(row.cells[idx.owner]) : "";
      const client = idx.client >= 0 ? getCellText(row.cells[idx.client]) : "";
      const number = idx.number >= 0 ? getCellText(row.cells[idx.number]) : "";
      const status = statusCell ? getCellText(statusCell) : "";
      const date = idx.date >= 0 ? parseDate(getCellText(row.cells[idx.date])) : null;
      const ageLabel = date ? formatAge(date) : "";
      const ageHours = date ? Math.max(0, (Date.now() - date.getTime()) / 36e5) : NaN;
      const isOld = Number.isFinite(ageHours) && ageHours >= 24;
      const isUnassigned = !owner;
      row.classList.toggle("hsu2-row-new", classifyStatus(status) === "new");
      row.classList.toggle("hsu2-row-old", isOld);
      row.classList.toggle("hsu2-row-unassigned", isUnassigned);

      if (titleCell && titleCell.dataset.hsu2Decorated !== "1") {
        const meta = document.createElement("div");
        meta.className = "hsu2-meta";
        const chips = [
          number ? { text: `#${number}` } : null,
          client ? { text: client } : null,
          owner ? { text: owner } : { text: "Sem responsavel", empty: true },
          settings.showAge && ageLabel ? { text: ageLabel, old: isOld } : null,
        ].filter(Boolean);
        chips.forEach((item) => {
          const chip = document.createElement("span");
          chip.className = `hsu2-chip${item.empty ? " empty" : ""}${item.old ? " old" : ""}`;
          chip.textContent = item.text;
          meta.appendChild(chip);
        });
        titleCell.appendChild(meta);
        titleCell.dataset.hsu2Decorated = "1";
      }

      if (statusCell) {
        if (!statusCell.dataset.hsu2OriginalHtml) statusCell.dataset.hsu2OriginalHtml = statusCell.innerHTML;
        statusCell.innerHTML = `<span class="hsu2-status ${classifyStatus(status)}">${txt(status || "Nao informado")}</span>`;
      }

      return { status, isUnassigned, isOld, ageHours };
    });
  }

  function cleanupGrid() {
    by(BOARD_ID)?.remove();
    document.querySelectorAll(`${TABLE_SELECTOR}.hsu2-table`).forEach((table) => {
      table.classList.remove("hsu2-table");
      table.querySelectorAll(".hsu2-meta").forEach((el) => el.remove());
      table.querySelectorAll("td[data-hsu2-decorated='1']").forEach((cell) => delete cell.dataset.hsu2Decorated);
      table.querySelectorAll("td").forEach((cell) => {
        if (cell.dataset.hsu2OriginalHtml) {
          cell.innerHTML = cell.dataset.hsu2OriginalHtml;
          delete cell.dataset.hsu2OriginalHtml;
        }
      });
      table.querySelectorAll("tr").forEach((row) => row.classList.remove("hsu2-row-new", "hsu2-row-old", "hsu2-row-unassigned"));
    });
  }

  function buildStats(rows) {
    const ages = rows.map((row) => row.ageHours).filter((value) => Number.isFinite(value));
    return {
      total: rows.length,
      novas: rows.filter((row) => classifyStatus(row.status) === "new").length,
      semResponsavel: rows.filter((row) => row.isUnassigned).length,
      antigas: rows.filter((row) => row.isOld).length,
      mediaHoras: ages.length ? ages.reduce((sum, value) => sum + value, 0) / ages.length : 0,
      maisAntigo: ages.length ? Math.max(...ages) : 0,
    };
  }

  function ensureBoard(stats) {
    const settings = readSettings();
    if (!settings.showMetrics) {
      by(BOARD_ID)?.remove();
      return;
    }
    let board = by(BOARD_ID);
    const firstTable = document.querySelector(TABLE_SELECTOR);
    if (!(firstTable instanceof HTMLElement) || !firstTable.parentElement) return;
    if (!(board instanceof HTMLElement)) {
      board = document.createElement("section");
      board.id = BOARD_ID;
      board.className = "hsu2-board";
      firstTable.parentElement.insertBefore(board, firstTable);
    }
    board.innerHTML = `
      <h3>Fila inteligente de chamados</h3>
      <p>Resumo visual da grade atual com leitura mais limpa, foco operacional e clima de tecnologia.</p>
      <div class="hsu2-kpis">
        <article class="hsu2-kpi"><strong>${stats.total}</strong><span>Total visivel</span></article>
        <article class="hsu2-kpi"><strong>${stats.novas}</strong><span>Novos / retorno</span></article>
        <article class="hsu2-kpi"><strong>${stats.semResponsavel}</strong><span>Sem responsavel</span></article>
        <article class="hsu2-kpi"><strong>${stats.maisAntigo ? `${Math.round(stats.maisAntigo)}h` : "n/d"}</strong><span>Mais antigo</span></article>
        <article class="hsu2-kpi"><strong>${stats.mediaHoras ? `${stats.mediaHoras.toFixed(1)}h` : "n/d"}</strong><span>Tempo medio</span></article>
      </div>
    `;
  }

  function refreshGrid() {
    if (!isEnabled()) return;
    if (!/dashboard\.php|consulta_requisicao\.php/i.test(location.pathname)) {
      cleanupGrid();
      lastStats = null;
      syncPanel();
      return;
    }
    cleanupGrid();
    const tables = Array.from(document.querySelectorAll(TABLE_SELECTOR));
    if (!tables.length) return;
    const rows = tables.flatMap((table) => enhanceTable(table));
    lastStats = buildStats(rows);
    ensureBoard(lastStats);
    syncPanel();
  }

  function scheduleRefresh() {
    clearTimeout(timer);
    timer = window.setTimeout(refreshGrid, 120);
  }

  function ensureObserver() {
    if (observer || !document.body) return;
    observer = new MutationObserver(() => scheduleRefresh());
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function ensurePanel() {
    let panel = by(PANEL_ID);
    if (!(panel instanceof HTMLElement)) {
      panel = document.createElement("aside");
      panel.id = PANEL_ID;
      panel.hidden = true;
      panel.innerHTML = `
        <div class="phead">
          <div>
            <h3>Nova versao user2</h3>
            <p>Versao independente do modulo remoto. Preferencias desta experiencia ficam salvas separadas.</p>
          </div>
          <button type="button" class="btn" data-action="close">Fechar</button>
        </div>
        <div class="pbody">
          <section class="pcard grid2">
            <div><p class="label">Versao user2</p><p class="value" data-slot="user2-version">${USER2_VERSION}</p></div>
            <div><p class="label">Versao user.js</p><p class="value" data-slot="user-version">-</p></div>
            <div><p class="label">Pagina</p><p class="value" data-slot="page">-</p></div>
            <div><p class="label">Status</p><p class="value" data-slot="status">Ativo</p></div>
          </section>
          <section class="pcard controls">
            <label><p class="label">Densidade</p><select data-setting="density"><option value="compact">Compacta</option><option value="comfortable">Confortavel</option><option value="airy">Aerea</option></select></label>
            <label><p class="label">Acento visual</p><select data-setting="accent"><option value="soft">Suave</option><option value="balanced">Balanceado</option><option value="bold">Marcante</option></select></label>
            <label class="toggle"><span class="value">Mostrar indicadores</span><input type="checkbox" data-setting="showMetrics" /></label>
            <label class="toggle"><span class="value">Mostrar idade no grid</span><input type="checkbox" data-setting="showAge" /></label>
          </section>
          <section class="pcard grid2">
            <div><p class="label">Total</p><p class="value" data-stat="total">-</p></div>
            <div><p class="label">Sem responsavel</p><p class="value" data-stat="semResponsavel">-</p></div>
            <div><p class="label">Tempo medio</p><p class="value" data-stat="mediaHoras">-</p></div>
            <div><p class="label">Mais antigo</p><p class="value" data-stat="maisAntigo">-</p></div>
          </section>
          <section class="pcard">
            <p class="label">Atualizacoes do user2</p>
            <div class="value" data-slot="updates"></div>
          </section>
          <section class="pcard actions">
            <button type="button" class="btn" data-action="refresh">Reaplicar layout</button>
            <button type="button" class="btn" data-action="notify">Testar aviso</button>
            <button type="button" class="btn" data-action="disable">Desligar user2</button>
          </section>
        </div>
      `;
      panel.querySelector('[data-action="close"]')?.addEventListener("click", () => closePanel());
      panel.querySelector('[data-action="refresh"]')?.addEventListener("click", () => refreshGrid());
      panel.querySelector('[data-action="notify"]')?.addEventListener("click", () => triggerNotification());
      panel.querySelector('[data-action="disable"]')?.addEventListener("click", () => {
        setEnabled(false);
        unmount();
      });
      panel.querySelectorAll("[data-setting]").forEach((el) => {
        el.addEventListener("change", () => {
          const next = {};
          panel.querySelectorAll("[data-setting]").forEach((control) => {
            const key = txt(control.getAttribute("data-setting"));
            if (control instanceof HTMLInputElement) next[key] = !!control.checked;
            else next[key] = txt(control.value);
          });
          writeSettings(next);
          applyPreferences();
          refreshGrid();
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
    panel.querySelector('[data-slot="user-version"]').textContent = txt(lastPayload.scriptVersion || "-");
    panel.querySelector('[data-slot="page"]').textContent = txt(lastPayload.page || location.pathname || "-");
    panel.querySelector('[data-slot="status"]').textContent = lastStats ? "Layout novo aplicado" : "Aguardando grade";
    panel.querySelector('[data-slot="updates"]').innerHTML = updates;
    panel.querySelector('[data-stat="total"]').textContent = lastStats ? String(lastStats.total) : "-";
    panel.querySelector('[data-stat="semResponsavel"]').textContent = lastStats ? String(lastStats.semResponsavel) : "-";
    panel.querySelector('[data-stat="mediaHoras"]').textContent = lastStats?.mediaHoras ? `${lastStats.mediaHoras.toFixed(1)}h` : "n/d";
    panel.querySelector('[data-stat="maisAntigo"]').textContent = lastStats?.maisAntigo ? `${Math.round(lastStats.maisAntigo)}h` : "n/d";
    panel.querySelectorAll("[data-setting]").forEach((control) => {
      const key = txt(control.getAttribute("data-setting"));
      if (control instanceof HTMLInputElement) control.checked = !!settings[key];
      else control.value = txt(settings[key]);
    });
  }

  function ensureBadge(payload = {}) {
    let badge = by(BADGE_ID);
    if (!(badge instanceof HTMLButtonElement)) {
      badge = document.createElement("button");
      badge.type = "button";
      badge.id = BADGE_ID;
      badge.textContent = `Nova grade user2 v${USER2_VERSION}`;
      badge.addEventListener("click", () => openPanel(payload));
      document.body.appendChild(badge);
    }
  }

  function applyPreferences() {
    const settings = readSettings();
    document.body?.classList?.add(ROOT_CLASS);
    document.body?.setAttribute("data-hsu2-density", settings.density);
    document.body?.setAttribute("data-hsu2-accent", settings.accent);
  }

  function openPanel(payload = {}) {
    lastPayload = { ...lastPayload, ...(payload || {}) };
    ensureStyle();
    const panel = ensurePanel();
    syncPanel();
    panel.hidden = false;
    return panel;
  }

  function closePanel() {
    const panel = by(PANEL_ID);
    if (panel) panel.hidden = true;
  }

  function triggerNotification() {
    const api = window[API_NAME] || {};
    if (typeof api.showChamadoUpdateNotification === "function") {
      api.showChamadoUpdateNotification({
        numero: "USER2-30001",
        situacao: "Grid user2 ativo",
        responsavel: "user2.js",
        resumo: `Modulo user2 v${USER2_VERSION} aplicou layout novo e metricas separadas.`,
        origem: "User2 independente",
        highlightColor: "#18B7C9",
      });
      return true;
    }
    if (typeof api.showPlainNotificationFallback === "function") {
      api.showPlainNotificationFallback(`User2 v${USER2_VERSION} ativo com preferencias separadas.`);
      return true;
    }
    return false;
  }

  function mount(payload = {}) {
    if (!document.body || !document.head) return false;
    lastPayload = { ...lastPayload, ...(payload || {}) };
    ensureStyle();
    applyPreferences();
    ensureBadge(payload);
    ensureObserver();
    refreshGrid();
    return true;
  }

  function unmount() {
    observer?.disconnect();
    observer = null;
    clearTimeout(timer);
    cleanupGrid();
    document.body?.classList?.remove(ROOT_CLASS);
    document.body?.removeAttribute("data-hsu2-density");
    document.body?.removeAttribute("data-hsu2-accent");
    by(BADGE_ID)?.remove();
    by(PANEL_ID)?.remove();
    lastStats = null;
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
  api.refreshExperimentalGrid = refreshGrid;
  window[API_NAME] = api;

  boot();
})();
