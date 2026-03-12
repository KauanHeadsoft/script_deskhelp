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
    const origem = txt(source.origem || source.source || "Teste do user2.js (Configuracoes)");
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
          <button type="button" class="hs2-notify-close" aria-label="Fechar notificacao">×</button>
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
        origem: "Teste do user2.js em Configuracoes",
        updatedAt: formatDateTimePtBr(),
      });
      if (!(rendered instanceof HTMLElement)) {
        showPlainNotificationFallback("Teste user2 acionado, mas card principal nao renderizou.");
      }
      return true;
    } catch (err) {
      console.warn("[HSUser2] Falha no teste de notificacao:", err);
      showPlainNotificationFallback("Teste user2 acionado com fallback visual.");
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
