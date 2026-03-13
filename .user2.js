(() => {
  const API_NAME = "HSHeadsoftUser2";
  const STYLE_ID = "hs-user2-experimental-style";
  const BADGE_ID = "hs-user2-experimental-badge";
  const PANEL_ID = "hs-user2-experimental-panel";
  const STORAGE_KEY = "hs2025-experimental-user2-mode";

  const txt = (value) => String(value || "").replace(/\s+/g, " ").trim();
  const by = (id) => document.getElementById(id);

  function ensureStyle() {
    if (by(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #${BADGE_ID}{
        position:fixed!important;
        top:88px!important;
        right:16px!important;
        z-index:1000048!important;
        display:flex!important;
        align-items:center!important;
        gap:8px!important;
        padding:10px 14px!important;
        border-radius:999px!important;
        border:1px solid rgba(52,211,153,.42)!important;
        background:linear-gradient(135deg, rgba(8,27,35,.96), rgba(9,53,48,.94))!important;
        color:#e9fff7!important;
        font:800 12px/1.2 'Segoe UI', Tahoma, sans-serif!important;
        box-shadow:0 18px 36px rgba(0,0,0,.32)!important;
        cursor:pointer!important;
      }
      #${BADGE_ID} .hs-user2-dot{
        width:10px!important;
        height:10px!important;
        border-radius:50%!important;
        background:#34d399!important;
        box-shadow:0 0 0 5px rgba(52,211,153,.18)!important;
        flex:none!important;
      }
      #${PANEL_ID}{
        position:fixed!important;
        right:16px!important;
        top:136px!important;
        width:min(420px, calc(100vw - 32px))!important;
        z-index:1000049!important;
        border:1px solid rgba(64,191,160,.38)!important;
        border-radius:18px!important;
        background:
          linear-gradient(160deg, rgba(8,26,40,.97), rgba(8,40,37,.95)),
          linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.01))!important;
        color:#e8fff8!important;
        box-shadow:0 24px 54px rgba(0,0,0,.4)!important;
        overflow:hidden!important;
      }
      #${PANEL_ID}[hidden]{
        display:none!important;
      }
      #${PANEL_ID} .hs-user2-head{
        display:flex!important;
        align-items:flex-start!important;
        justify-content:space-between!important;
        gap:12px!important;
        padding:16px 16px 12px!important;
        border-bottom:1px solid rgba(97,214,176,.16)!important;
      }
      #${PANEL_ID} .hs-user2-title{
        margin:0!important;
        font:900 16px/1.2 'Segoe UI', Tahoma, sans-serif!important;
        letter-spacing:.02em!important;
      }
      #${PANEL_ID} .hs-user2-subtitle{
        margin:6px 0 0!important;
        font:600 12px/1.4 'Segoe UI', Tahoma, sans-serif!important;
        color:#bdf6e4!important;
      }
      #${PANEL_ID} .hs-user2-close{
        min-width:34px!important;
        min-height:34px!important;
        border-radius:10px!important;
        border:1px solid rgba(116,221,190,.34)!important;
        background:rgba(15,55,56,.84)!important;
        color:#e8fff8!important;
        cursor:pointer!important;
        font:800 14px/1 'Segoe UI', Tahoma, sans-serif!important;
      }
      #${PANEL_ID} .hs-user2-body{
        padding:14px 16px 16px!important;
        display:grid!important;
        gap:12px!important;
      }
      #${PANEL_ID} .hs-user2-card{
        border:1px solid rgba(104,217,184,.2)!important;
        border-radius:14px!important;
        background:rgba(8,31,35,.58)!important;
        padding:12px!important;
      }
      #${PANEL_ID} .hs-user2-label{
        margin:0 0 6px!important;
        font:800 11px/1.2 'Segoe UI', Tahoma, sans-serif!important;
        text-transform:uppercase!important;
        letter-spacing:.06em!important;
        color:#9fe9d4!important;
      }
      #${PANEL_ID} .hs-user2-value{
        margin:0!important;
        font:700 13px/1.45 'Segoe UI', Tahoma, sans-serif!important;
        color:#effff9!important;
        word-break:break-word!important;
      }
      #${PANEL_ID} .hs-user2-actions{
        display:flex!important;
        flex-wrap:wrap!important;
        gap:8px!important;
      }
      #${PANEL_ID} .hs-user2-btn{
        min-height:36px!important;
        padding:0 12px!important;
        border-radius:10px!important;
        border:1px solid rgba(120,229,198,.34)!important;
        background:linear-gradient(180deg, rgba(14,69,67,.94), rgba(10,50,52,.96))!important;
        color:#ecfff9!important;
        cursor:pointer!important;
        font:800 12px/1 'Segoe UI', Tahoma, sans-serif!important;
      }
      body.hs-user2-experimental-active #cabecalho{
        box-shadow:0 8px 24px rgba(29,185,129,.16)!important;
      }
      body.hs-user2-experimental-active #conteudo{
        position:relative!important;
      }
      body.hs-user2-experimental-active #conteudo::before{
        content:"Nova versao user2 em teste"!important;
        display:block!important;
        margin:10px 0 14px!important;
        padding:10px 14px!important;
        border-radius:14px!important;
        border:1px solid rgba(52,211,153,.28)!important;
        background:linear-gradient(90deg, rgba(10,51,46,.9), rgba(8,32,50,.9))!important;
        color:#eafff7!important;
        font:800 13px/1.35 'Segoe UI', Tahoma, sans-serif!important;
      }
    `;
    document.head.appendChild(style);
  }

  function isEnabled() {
    try {
      return String(localStorage.getItem(STORAGE_KEY) || "").trim() === "1";
    } catch {
      return false;
    }
  }

  function setEnabled(next) {
    try {
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    } catch {}
    return !!next;
  }

  function ensureBadge(payload = {}) {
    let badge = by(BADGE_ID);
    if (!(badge instanceof HTMLButtonElement)) {
      badge = document.createElement("button");
      badge.type = "button";
      badge.id = BADGE_ID;
      badge.innerHTML = `<span class="hs-user2-dot" aria-hidden="true"></span><span>Nova versao user2 ativa</span>`;
      badge.addEventListener("click", () => openPanel(payload));
      document.body.appendChild(badge);
    }
    return badge;
  }

  function ensurePanel() {
    let panel = by(PANEL_ID);
    if (!(panel instanceof HTMLElement)) {
      panel = document.createElement("aside");
      panel.id = PANEL_ID;
      panel.hidden = true;
      panel.innerHTML = `
        <div class="hs-user2-head">
          <div>
            <p class="hs-user2-title">Painel teste user2</p>
            <p class="hs-user2-subtitle">Bridge ativo entre .user.js e .user2.js</p>
          </div>
          <button type="button" class="hs-user2-close" aria-label="Fechar painel">X</button>
        </div>
        <div class="hs-user2-body">
          <section class="hs-user2-card">
            <p class="hs-user2-label">Status</p>
            <p class="hs-user2-value" data-slot="status">Carregado</p>
          </section>
          <section class="hs-user2-card">
            <p class="hs-user2-label">Versao recebida do user.js</p>
            <p class="hs-user2-value" data-slot="script-version">-</p>
          </section>
          <section class="hs-user2-card">
            <p class="hs-user2-label">Pagina atual</p>
            <p class="hs-user2-value" data-slot="page">-</p>
          </section>
          <section class="hs-user2-card">
            <p class="hs-user2-label">Tema informado</p>
            <p class="hs-user2-value" data-slot="theme">-</p>
          </section>
          <section class="hs-user2-card">
            <p class="hs-user2-label">Teste rapido</p>
            <div class="hs-user2-actions">
              <button type="button" class="hs-user2-btn" data-action="notify">Disparar aviso</button>
              <button type="button" class="hs-user2-btn" data-action="disable">Desligar teste</button>
            </div>
          </section>
        </div>
      `;
      panel.querySelector(".hs-user2-close")?.addEventListener("click", () => closePanel());
      panel.querySelector('[data-action="notify"]')?.addEventListener("click", () => triggerNotification());
      panel.querySelector('[data-action="disable"]')?.addEventListener("click", () => {
        setEnabled(false);
        unmount();
      });
      document.body.appendChild(panel);
    }
    return panel;
  }

  function fillPanel(payload = {}) {
    const panel = ensurePanel();
    panel.querySelector('[data-slot="status"]').textContent = "Comunicacao OK";
    panel.querySelector('[data-slot="script-version"]').textContent = txt(payload.scriptVersion || "-");
    panel.querySelector('[data-slot="page"]').textContent = txt(payload.page || location.pathname || "-");
    panel.querySelector('[data-slot="theme"]').textContent = txt(payload.theme || document.documentElement.dataset.hsTheme || "-");
    return panel;
  }

  function triggerNotification() {
    const api = window[API_NAME] || {};
    if (typeof api.showChamadoUpdateNotification === "function") {
      api.showChamadoUpdateNotification({
        numero: "TESTE-USER2",
        situacao: "Nova versao experimental",
        responsavel: "user2.js",
        resumo: "O user2 conseguiu chamar uma funcao exposta no user.js embutido.",
        origem: "Bridge user.js -> user2.js",
        highlightColor: "#34D399",
      });
      return true;
    }
    if (typeof api.showPlainNotificationFallback === "function") {
      api.showPlainNotificationFallback("Bridge user2 ativo, mas a notificacao rica ainda nao foi anexada.");
      return true;
    }
    return false;
  }

  function openPanel(payload = {}) {
    ensureStyle();
    const panel = fillPanel(payload);
    panel.hidden = false;
    return panel;
  }

  function closePanel() {
    const panel = by(PANEL_ID);
    if (panel instanceof HTMLElement) panel.hidden = true;
  }

  function mount(payload = {}) {
    if (!document.body || !document.head) return false;
    ensureStyle();
    ensureBadge(payload);
    fillPanel(payload);
    document.body.classList.add("hs-user2-experimental-active");
    return true;
  }

  function unmount() {
    document.body?.classList?.remove("hs-user2-experimental-active");
    by(BADGE_ID)?.remove();
    by(PANEL_ID)?.remove();
    return true;
  }

  function bootFromStorage() {
    if (!isEnabled()) return;
    const run = () =>
      mount({
        scriptVersion:
          (typeof GM_info !== "undefined" && GM_info?.script?.version) || "user2-only",
        page: location.pathname,
        theme: document.documentElement.dataset.hsTheme || "",
      });
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", run, { once: true });
    } else {
      run();
    }
  }

  const api = window[API_NAME] || {};
  api.isExperimentalVersionEnabled = isEnabled;
  api.setExperimentalVersionEnabled = setEnabled;
  api.mountExperimentalVersion = mount;
  api.unmountExperimentalVersion = unmount;
  api.openExperimentalVersionPanel = openPanel;
  api.closeExperimentalVersionPanel = closePanel;
  api.triggerExperimentalVersionNotification = triggerNotification;
  window[API_NAME] = api;

  bootFromStorage();
})();
