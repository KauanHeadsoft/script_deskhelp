// ==UserScript==
// @name         Headsoft Suporte Modern UI
// @namespace    headsoft.suporte.modern
// @version      2.15.42
// @description  Modernizacao visual + tema + filtros + contadores + atalhos de atendimento
// @author       Codex
// @match        https://suporte.headsoft.com.br/*
// @match        http://suporte.headsoft.com.br/*
// @homepageURL  https://github.com/KauanHeadsoft/script_deskhelp
// @updateURL    https://raw.githubusercontent.com/KauanHeadsoft/script_deskhelp/main/.user.js
// @downloadURL  https://raw.githubusercontent.com/KauanHeadsoft/script_deskhelp/main/.user.js
// @run-at       document-idle
// @grant        none
// ==/UserScript==

// HeadSoft UI â€” tema, logo, filtros, cores, zebrado, contadores,
// abrir em nova guia (clique do meio) e 1o atendimento no clique da logo

(() => {
  const BTN_ID = "hs2025-theme-btn";
  const LS_KEY = "hs2025-theme";
  const STYLE_ID = "hs2025-style";
  const BADGE_ID = "hsx-modern-badge";
  const NEW_LOGO =
    "https://headsoft.com.br/wp-content/uploads/2023/10/logo-PhotoRoom-1.png-PhotoRoom-1-1-768x768.png";

  const SITUACAO_RX = /situac|situa[cÃ§][aÃ£]o/i;
  const NOVA_RX = /^ *nova\b/i;
  const NAV_TOKENS = new Set(["<<", "<", ">", ">>", "&lt;&lt;", "&lt;", "&gt;", "&gt;&gt;"]);
  const NAV_ONLY_RX = /^(<<|>>|<|>|&lt;&lt;|&lt;|&gt;|&gt;&gt;)+$/;
  const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
  const FREE_AI_API_URL = "https://text.pollinations.ai/openai";
  const GEMINI_API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
  const OPENAI_API_KEY_LS = "hs2025-openai-api-key";
  const GEMINI_API_KEY_LS = "hs2025-gemini-api-key";
  const AI_MODE_LS = "hs2025-ai-mode";
  const AI_MODE_FREE_GEMINI = "free_gemini";
  const AI_MODE_PAID_OPENAI = "paid_openai";
  const AUTO_CONCLUIR_KEY = "hs2025-auto-concluir-pending";
  const AUTO_CONCLUIR_TRIES_KEY = "hs2025-auto-concluir-tries";
  const LOGIN_REMEMBER_KEY = "hs2025-login-remember";
  const REQ_OPEN_DEBUG_LS_KEY = "hs2025-req-open-debug";
  const REQ_OPEN_DEBUG_QUERY = "hsdebugopen";
  const REQ_OPEN_LOG_LIMIT = 320;
  const PREVIEW_ONLY_MODE_DEFAULT = true;
  const PREVIEW_ONLY_MODE_LS_KEY = "hs2025-preview-only-mode";
  const SCRIPT_VERSION_FALLBACK = "2.15.41";
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
  const UPDATE_POPUP_LAST_VERSION_LS_KEY = "hs2025-update-popup-last-version";
  const UPDATE_INSTALL_BRIDGE_BASE_URL = "https://www.tampermonkey.net/script_installation.php#url=";
  const MANUAL_UPDATE_SOURCE_URL = "https://raw.githubusercontent.com/KauanHeadsoft/script_deskhelp/main/.user.js";
  const MANUAL_UPDATE_GITHUB_RAW_URL = "https://github.com/KauanHeadsoft/script_deskhelp/raw/main/.user.js";
  const MANUAL_UPDATE_GITHUB_FILE_URL = "https://github.com/KauanHeadsoft/script_deskhelp/blob/main/.user.js";
  const VERSION_CATALOG_CACHE_LS_KEY = "hs2025-version-catalog-json";
  const VERSION_CATALOG_CACHE_AT_LS_KEY = "hs2025-version-catalog-at";
  const VERSION_CATALOG_CACHE_MS = 6 * 60 * 60 * 1000;
  const VERSION_CATALOG_MAX_ITEMS = 12;
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

  const T_PRIMEIRO_ATENDIMENTO = `Prezado(a),
Informamos que sua solicitacao foi recebida por nossa equipe de suporte e esta sendo analisada com atencao. Caso surjam duvidas ou necessitemos de informacoes adicionais, entraremos em contato antes de prosseguir com o atendimento.
Agradecemos seu contato e em breve retornaremos com uma resposta.
Atenciosamente,
Equipe de Suporte.`;
  const T_ENVIAR_SERVICO = "Em servico.";
  const RECENT_UPDATES = Object.freeze([
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
  let hsUpdateHistoryValidated = false;
  let hsUpdateHistoryValidatedList = [];

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
   *   - hs2025-openai-api-key
   *   - hs2025-gemini-api-key
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
  }
  html[data-hs-theme="light"]{
    --bg:#ffffff; --fg:#0f172a;
    --panel:#f8fafc; --panel2:#eef2f7; --border:#d0d7de;
    --ok:#16a34a; --bad:#dc2626; --neutral:#0f172a;
    --chip-bg:#f1f5f9; --chip-dot:#16a34a;
    --row1:#ffffff; --row2:#f6f8fa;
    --accent:#1f5fb4;
    --link:#0b57d0; --link-hover:#0842a0;
  }

  html,body{ background:var(--bg)!important; color:var(--fg)!important; }

  #${BADGE_ID}{
    position:fixed; right:14px; bottom:14px; z-index:999999;
    background:var(--accent); color:#fff; border-radius:999px;
    padding:6px 10px; font:700 11px/1 Manrope,Segoe UI,sans-serif;
    box-shadow:0 8px 22px rgba(0,0,0,.35); pointer-events:none;
  }

  form[name="filtros"], #conteudo>table[width="100%"]{
    background:var(--panel)!important; border-bottom:1px solid var(--border)!important;
  }
  select, input, textarea, button{
    background:var(--panel2)!important; border:1px solid var(--border)!important; color:var(--fg)!important;
    border-radius:6px!important; padding:3px 6px!important;
  }
  a, h1,h2,h3,strong,b{ color:var(--fg)!important; }

  table.sortable{ border-collapse:separate!important; border-spacing:0!important; width:100%!important; }
  table.sortable thead th{
    background:var(--panel2)!important; color:var(--fg)!important; border-bottom:1px solid var(--border)!important;
    padding:6px 10px!important;
  }
  table.sortable tbody td{
    border-bottom:1px solid var(--border)!important; padding:6px 10px!important; color:var(--neutral)!important;
    overflow-wrap:anywhere;
  }
  table.sortable tbody tr:nth-child(odd) td{ background:var(--row1)!important; }
  table.sortable tbody tr:nth-child(even) td{ background:var(--row2)!important; }

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
    z-index:1000003;
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
    border-radius:14px;
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
    border-radius:8px!important;
    cursor:pointer;
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
    border-radius:8px;
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
    border-radius:8px!important;
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
    border-radius:10px;
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
    border-radius:8px!important;
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
    border-radius:8px;
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
    border-radius:10px;
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
    z-index:1000004;
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
    width:min(980px, 96vw);
    max-height:92vh;
    display:flex;
    flex-direction:column;
    border-radius:12px;
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
  .hs-image-viewer-head button{
    min-height:25px!important;
    height:25px!important;
    border-radius:8px!important;
    padding:2px 10px!important;
    cursor:pointer;
  }
  .hs-image-viewer-body{
    display:flex;
    justify-content:center;
    align-items:center;
    padding:10px;
    overflow:auto;
    min-height:180px;
    max-height:calc(92vh - 42px);
  }
  .hs-image-viewer-body img{
    max-width:100%;
    max-height:100%;
    width:auto;
    height:auto;
    object-fit:contain;
    border-radius:8px;
    border:1px solid var(--border);
    background:rgba(2,8,18,.45);
  }
  @media (max-width:760px){
    .hs-image-viewer-card{
      top:2vh;
      max-height:96vh;
      width:min(98vw, 98vw);
    }
    .hs-image-viewer-body{
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
    border-width:1px!important;
    border-radius:8px!important;
    padding:2px 7px!important;
    font-size:10px!important;
    line-height:1!important;
    box-sizing:border-box!important;
  }
  body.hs-request-page #interno .novo_consumo_interno textarea{
    min-height:56px!important;
    height:56px!important;
    border-width:1px!important;
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
  body.hs-request-page #interno .hs-attach-picker{
    display:flex!important;
    flex-wrap:wrap!important;
    align-items:center!important;
    gap:8px!important;
    width:100%!important;
    position:relative!important;
    min-height:30px!important;
  }
  body.hs-request-page #interno .hs-attach-native{
    position:absolute!important;
    width:1px!important;
    height:1px!important;
    opacity:0!important;
    overflow:hidden!important;
    pointer-events:none!important;
  }
  body.hs-request-page #interno .hs-attach-btn,
  body.hs-request-page #interno .hs-attach-clear-btn{
    min-height:24px!important;
    border-radius:8px!important;
    padding:3px 10px!important;
    font-size:11px!important;
    line-height:1!important;
    font-weight:700!important;
    border:1px solid var(--border)!important;
    background:var(--panel2)!important;
    color:var(--fg)!important;
    cursor:pointer!important;
  }
  body.hs-request-page #interno .hs-attach-btn:hover,
  body.hs-request-page #interno .hs-attach-clear-btn:hover{
    filter:brightness(1.06)!important;
  }
  body.hs-request-page #interno .hs-attach-clear-btn{
    opacity:.9!important;
  }
  body.hs-request-page #interno .hs-attach-clear-btn[disabled]{
    opacity:.55!important;
    cursor:not-allowed!important;
  }
  body.hs-request-page #interno .hs-attach-status{
    font-size:11px!important;
    opacity:.9!important;
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
    border:1px solid var(--border)!important;
    border-radius:10px!important;
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
  body.hs-request-page #interno .hs-attach-thumb .hs-attach-thumb-remove{
    position:absolute!important;
    top:4px!important;
    right:4px!important;
    width:18px!important;
    min-width:18px!important;
    max-width:18px!important;
    min-height:18px!important;
    height:18px!important;
    padding:0!important;
    border-radius:999px!important;
    border:1px solid rgba(255,255,255,.65)!important;
    background:rgba(0,0,0,.52)!important;
    color:#fff!important;
    display:flex!important;
    align-items:center!important;
    justify-content:center!important;
    font-size:12px!important;
    font-weight:800!important;
    line-height:1!important;
    cursor:pointer!important;
    z-index:2!important;
  }
  body.hs-request-page #interno .hs-attach-thumb .hs-attach-thumb-remove:hover{
    background:rgba(0,0,0,.68)!important;
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

  /* Cabecalho unificado (todas as paginas internas) */
  body:not(.hs-login-page) #cabecalho{
    background:linear-gradient(180deg, #3f5f86 0%, #21365a 100%)!important;
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
  }
  body:not(.hs-login-page) #cabecalho_logo .hs-logo-version{
    display:inline-flex!important;
    align-items:center!important;
    justify-content:center!important;
    margin-left:8px!important;
    padding:2px 8px!important;
    border-radius:999px!important;
    font-size:10px!important;
    line-height:1!important;
    font-weight:800!important;
    border:1px solid rgba(184,211,243,.45)!important;
    background:rgba(10,28,51,.52)!important;
    color:#eaf2ff!important;
    vertical-align:middle!important;
    white-space:nowrap!important;
  }
  body:not(.hs-login-page) #cabecalho_menu{
    background:#1f2948!important;
    border-top:1px solid rgba(255,255,255,.08)!important;
  }
  body:not(.hs-login-page) #cabecalho_menu,
  body:not(.hs-login-page) #cabecalho_menu *{
    color:#eaf2ff!important;
  }
  body:not(.hs-login-page) #cabecalho_menu #${BTN_ID}{
    background:linear-gradient(180deg, #ffffff, #edf3fb)!important;
    color:#17395f!important;
    border:1px solid #bccce0!important;
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
  }
  body.hs-user-form-page #cabecalho_menu,
  body.hs-user-form-page #cabecalho_menu *{
    color:#eaf2ff!important;
  }
  body.hs-user-form-page #cabecalho_menu #${BTN_ID}{
    background:linear-gradient(180deg, #ffffff, #edf3fb)!important;
    color:#17395f!important;
    border:1px solid #bccce0!important;
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
  body.hs-dashboard-page form[name="filtros"] td :is(img, input[type="image"]){
    float:none!important;
    position:static!important;
    margin:0!important;
    vertical-align:middle!important;
    flex:0 0 auto!important;
  }
  body.hs-dashboard-page form[name="filtros"] .hs-preview-mode-wrap{
    margin-top:6px!important;
    display:flex!important;
    justify-content:flex-end!important;
    gap:6px!important;
  }
  body.hs-dashboard-page form[name="filtros"] .hs-preview-mode-btn{
    min-height:24px!important;
    height:24px!important;
    border-radius:8px!important;
    padding:2px 10px!important;
    font-size:10px!important;
    font-weight:700!important;
    line-height:1!important;
    cursor:pointer!important;
  }
  body.hs-dashboard-page form[name="filtros"] .hs-update-available-btn{
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
    border-radius:12px!important;
    font-size:18px!important;
    font-weight:700!important;
    line-height:1.2!important;
    box-sizing:border-box!important;
  }
  body.hs-dashboard-page table.sortable{
    border-radius:14px!important;
    overflow:hidden!important;
    box-shadow:0 8px 20px rgba(0,0,0,.15)!important;
    margin-bottom:12px!important;
  }
  body.hs-dashboard-page table.sortable thead th:first-child{ border-top-left-radius:14px!important; }
  body.hs-dashboard-page table.sortable thead th:last-child{ border-top-right-radius:14px!important; }
  body.hs-dashboard-page table.sortable tbody tr:last-child td:first-child{ border-bottom-left-radius:14px!important; }
  body.hs-dashboard-page table.sortable tbody tr:last-child td:last-child{ border-bottom-right-radius:14px!important; }
  body.hs-dashboard-page table.sortable thead th{
    font-size:13px!important;
    font-weight:800!important;
    padding:9px 10px!important;
    position:sticky!important;
    top:var(--hs-dashboard-top-offset, 72px)!important;
    z-index:3!important;
  }
  body.hs-dashboard-page table.sortable tbody td{
    font-size:13px!important;
    line-height:1.58!important;
    padding:8px 10px!important;
    vertical-align:top!important;
    white-space:normal!important;
    overflow-wrap:normal!important;
    word-break:normal!important;
  }
  body.hs-dashboard-page table.sortable tbody td.hs-col-titulo{
    overflow-wrap:anywhere!important;
    word-break:break-word!important;
  }
  body.hs-dashboard-page table.sortable thead th.hs-col-situacao,
  body.hs-dashboard-page table.sortable tbody td.hs-col-situacao{
    white-space:normal!important;
    overflow-wrap:normal!important;
    word-break:normal!important;
    hyphens:none!important;
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
  html[data-hs-theme="dark"] body.hs-dashboard-page table.sortable thead th{
    background:#1a2a3e!important;
    color:#dfeaf9!important;
    border-bottom:1px solid #3a5068!important;
  }
  html[data-hs-theme="dark"] body.hs-dashboard-page table.sortable tbody td{
    border-bottom:1px solid #33495f!important;
  }
  html[data-hs-theme="dark"] body.hs-dashboard-page table.sortable tbody tr:hover td{
    background:#1b2b40!important;
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
  html[data-hs-theme="light"] body.hs-dashboard-page table.sortable thead th{
    background:#eaf2fd!important;
    color:#17395f!important;
    border-bottom:1px solid #d0deef!important;
  }
  /* Dashboard (tema claro): remove contorno escuro residual da grade */
  html[data-hs-theme="light"] body.hs-dashboard-page table.sortable{
    border:1px solid #d8e3f2!important;
  }
  html[data-hs-theme="light"] body.hs-dashboard-page table.sortable thead th,
  html[data-hs-theme="light"] body.hs-dashboard-page table.sortable tbody td{
    border-color:#d8e3f2!important;
  }
  html[data-hs-theme="light"] body.hs-dashboard-page table.sortable tbody td{
    border-bottom:1px solid #dde7f4!important;
  }
  html[data-hs-theme="light"] body.hs-dashboard-page table.sortable tbody tr:hover td{
    background:#eef5ff!important;
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
  const norm = (s) =>
    (s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
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
    const notesRaw = Array.isArray(entry.notes) ? entry.notes : [];
    const notes = Array.from(
      new Set(
        notesRaw
          .map((n) => String(n || "").trim())
          .filter(Boolean)
      )
    );
    if (!version && !date && !notes.length) return null;
    return { version, date, notes };
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
      map.set(key, {
        version: current.version || normalized.version,
        date: current.date || normalized.date,
        notes: mergedNotes,
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
    const metaEl = modal.querySelector(".hs-updates-log-meta");
    const rulesEl = modal.querySelector(".hs-updates-log-rules");
    const listEl = modal.querySelector(".hs-updates-log-list");
    const footerEl = modal.querySelector(".hs-updates-log-footer");
    const installBtn = modal.querySelector('button[data-action="install"]');

    if (metaEl instanceof HTMLElement) {
      const headline = hasUpdate
        ? `Nova versao v${remoteVersion} disponivel (atual: v${SCRIPT_VERSION}).`
        : `Versao atual: v${SCRIPT_VERSION}.`;
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
          if (highlightVersion && version === highlightVersion) article.classList.add("is-highlight");

          const head = document.createElement("header");
          head.className = "hs-updates-log-item-head";
          const versionEl = document.createElement("span");
          versionEl.className = "version";
          versionEl.textContent = version ? `v${version}` : "v?";
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
      installBtn.textContent = canInstall ? `Atualizar para v${remoteVersion}` : "Atualizar agora";
      installBtn.disabled = !canInstall;
      installBtn.title = canInstall ? "Abrir instalacao da nova versao" : "";
    }

    hsUpdatesLogPayload = {
      list,
      source,
      remoteVersion,
      remoteUrl,
      hasUpdate,
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

    renderUpdatesLogModal({
      list: displayList,
      source: String(remotePayload?.source || (remoteUpdates.length ? "remote" : "local-fallback")),
      remoteVersion,
      remoteUrl,
      highlightVersion,
      checkedAt,
    });
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
      return { ok: true, checkedAt, remoteVersion, remoteUrl, hasUpdate };
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
    const next = {
      ok: !!result?.ok,
      checkedAt: Number(result?.checkedAt || Date.now()),
      remoteVersion,
      remoteUrl: String(result?.remoteUrl || "").trim(),
      hasUpdate: hasUpdateComputed,
      error: String(result?.error || "").trim(),
    };
    hsScriptUpdateLastResult = next;
    try {
      localStorage.setItem(UPDATE_CHECK_LAST_AT_LS_KEY, String(next.checkedAt));
      localStorage.setItem(UPDATE_CHECK_REMOTE_VERSION_LS_KEY, next.remoteVersion);
      localStorage.setItem(UPDATE_CHECK_REMOTE_URL_LS_KEY, next.remoteUrl);
      localStorage.setItem(UPDATE_CHECK_HAS_UPDATE_LS_KEY, next.hasUpdate ? "1" : "0");
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
            bestRemote = { remoteVersion, remoteUrl: MANUAL_UPDATE_SOURCE_URL };
          }
        } catch (err) {
          lastError = String(err?.message || err || "");
        }
      }

      if (bestRemote) {
        const hasUpdate = compareVersionTexts(bestRemote.remoteVersion, SCRIPT_VERSION) > 0;
        return persistUpdateCheckResult({
          ok: true,
          checkedAt: Date.now(),
          remoteVersion: bestRemote.remoteVersion,
          remoteUrl: bestRemote.remoteUrl,
          hasUpdate,
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
    const candidates = [MANUAL_UPDATE_SOURCE_URL];
    try {
      const check = await checkScriptUpdateAvailability(true);
      const checkedUrl = String(check?.remoteUrl || "").trim();
      if (checkedUrl) candidates.push(checkedUrl);
    } catch {}
    UPDATE_SCRIPT_CANDIDATE_URLS.forEach((u) => {
      const item = String(u || "").trim();
      if (item) candidates.push(item);
    });

    const tried = new Set();
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
        const version = extractScriptVersionFromText(content);
        return { url: clean, content, version };
      } catch {}
    }
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
   * Retorno: string.
   */
  function buildManualUpdateStatusText(version) {
    const v = String(version || "").trim().replace(/^v/i, "");
    const resolvedVersion = v ? `v${v}` : "v?";
    return `Versao remota detectada: ${resolvedVersion} Codigo ja foi copiado para a area de transferencia. Se instalar direto falhar, use: Baixar .user.js ou Mostrar codigo.`;
  }
  /**
   * Objetivo: Fecha modal de atualizacao manual.
   *
   * Contexto: reutilizado por backdrop, botao fechar e tecla ESC.
   * Parametros: nenhum.
   * Retorno: void.
   */
  function closeManualUpdateModal() {
    if (!hsManualUpdateModal) hsManualUpdateModal = document.getElementById("hs-update-modal");
    if (!(hsManualUpdateModal instanceof HTMLElement)) return;
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
              String(hsManualUpdatePayload.version || "")
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
                String(hsManualUpdatePayload.version || "")
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
   * Retorno: void.
   */
  function showManualUpdateModal(source, copied = false) {
    const modal = ensureManualUpdateModal();
    if (!(modal instanceof HTMLElement)) return;
    const normalized = normalizeManualUpdateSource(source);
    hsManualUpdatePayload = {
      ...normalized,
      copied: !!copied,
    };

    const statusEl = modal.querySelector(".hs-update-modal-status");
    const urlInput = modal.querySelector(".hs-update-modal-url");
    const details = modal.querySelector(".hs-update-modal-code-details");
    const ta = modal.querySelector(".hs-update-modal-code-text");
    if (statusEl instanceof HTMLElement) {
      statusEl.textContent = buildManualUpdateStatusText(
        String(hsManualUpdatePayload.version || "")
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
   * Parametros: nenhum.
   * Retorno: Promise<void>.
   * Efeitos colaterais: chamadas de rede, clipboard, download e abertura de nova aba.
   */
  async function openManualUpdateGuide() {
    const source = await fetchLatestUserscriptSource();
    const copied = await copyTextToClipboard(String(source.content || ""));
    showManualUpdateModal(source, copied);
  }
  /**
   * Objetivo: Le ultima versao remota ja notificada em popup.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: string.
   * Efeitos colaterais: leitura de localStorage.
   */
  function getLastUpdatePopupVersion() {
    try {
      return String(localStorage.getItem(UPDATE_POPUP_LAST_VERSION_LS_KEY) || "").trim();
    } catch {
      return "";
    }
  }
  /**
   * Objetivo: Persiste ultima versao remota notificada em popup.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros:
   * - version: entrada usada por esta rotina.
   * Retorno: void.
   * Efeitos colaterais: escrita em localStorage.
   */
  function setLastUpdatePopupVersion(version) {
    try {
      localStorage.setItem(UPDATE_POPUP_LAST_VERSION_LS_KEY, String(version || "").trim());
    } catch {}
  }
  /**
   * Objetivo: Exibe popup de update apenas uma vez por versao remota detectada.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros:
   * - result: entrada usada por esta rotina.
   * Retorno: void.
   * Efeitos colaterais: abre modal de atualizacao e persiste versao notificada.
   */
  function showUpdatePopupOnce(result) {
    const hasUpdate = !!result?.hasUpdate && !!String(result?.remoteVersion || "").trim();
    if (!hasUpdate) return;
    const remoteVersion = String(result.remoteVersion || "").trim();
    if (!remoteVersion) return;

    const lastPopup = getLastUpdatePopupVersion();
    if (lastPopup === remoteVersion) return;
    setLastUpdatePopupVersion(remoteVersion);

    setTimeout(() => {
      showRecentUpdatesDialog({
        forceRefresh: true,
        remoteVersion,
        remoteUrl: String(result?.remoteUrl || ""),
        highlightVersion: remoteVersion,
        checkedAt: Number(result?.checkedAt || Date.now()),
      }).catch(() => {
        toast(`Nova versao ${remoteVersion} disponivel.`, "info", 3000);
      });
    }, 120);
  }
  /**
   * Objetivo: Dispara verificacao/notificacao de update de forma global na pagina.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros: nenhum.
   * Retorno: void.
   * Efeitos colaterais: consulta remota e popup de update quando houver nova versao.
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
    if (document.body.classList.contains("hs-login-page")) {
      wrap.querySelector(".hs-logo-version")?.remove();
      return;
    }
    let badge = wrap.querySelector(".hs-logo-version");
    if (!(badge instanceof HTMLElement)) {
      badge = document.createElement("span");
      badge.className = "hs-logo-version";
    }
    badge.textContent = `v${SCRIPT_VERSION}`;
    if (!badge.isConnected || badge.parentElement !== wrap) wrap.appendChild(badge);
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
    const hideRows = ["ordenar por percentual", "sugestao de melhoria", "sugestÃ£o de melhoria", "paralisado/stand by"];

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
      if (hideRows.some((k) => t.includes(k))) {
        tr.style.display = "none";
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

    let host = filtrosForm.querySelector(".hs-preview-mode-wrap");
    if (!(host instanceof HTMLElement)) {
      host = document.createElement("div");
      host.className = "hs-preview-mode-wrap";
      filtrosForm.appendChild(host);
    }
    host.querySelector("#hs-versions-btn")?.remove();

    let btn = host.querySelector("#hs-preview-mode-toggle");
    if (!(btn instanceof HTMLInputElement)) {
      btn = document.createElement("input");
      btn.type = "button";
      btn.id = "hs-preview-mode-toggle";
      btn.className = "hs-preview-mode-btn";
      host.appendChild(btn);
    }
    let updatesBtn = host.querySelector("#hs-updates-log-btn");
    if (!(updatesBtn instanceof HTMLInputElement)) {
      updatesBtn = document.createElement("input");
      updatesBtn.type = "button";
      updatesBtn.id = "hs-updates-log-btn";
      updatesBtn.className = "hs-preview-mode-btn";
      host.appendChild(updatesBtn);
    }
    let checkBtn = host.querySelector("#hs-update-check-btn");
    if (!(checkBtn instanceof HTMLInputElement)) {
      checkBtn = document.createElement("input");
      checkBtn.type = "button";
      checkBtn.id = "hs-update-check-btn";
      checkBtn.className = "hs-preview-mode-btn";
      host.appendChild(checkBtn);
    }
    let manualBtn = host.querySelector("#hs-update-manual-btn");
    if (!(manualBtn instanceof HTMLInputElement)) {
      manualBtn = document.createElement("input");
      manualBtn.type = "button";
      manualBtn.id = "hs-update-manual-btn";
      manualBtn.className = "hs-preview-mode-btn";
      host.appendChild(manualBtn);
    }
    let alertBtn = host.querySelector("#hs-update-available-btn");
    if (!(alertBtn instanceof HTMLInputElement)) {
      alertBtn = document.createElement("input");
      alertBtn.type = "button";
      alertBtn.id = "hs-update-available-btn";
      alertBtn.className = "hs-preview-mode-btn hs-update-available-btn";
      host.appendChild(alertBtn);
    }

    const syncLabel = () => {
      const enabled = isPreviewOnlyModeEnabled();
      btn.value = enabled ? "Preview ON" : "Preview OFF";
      btn.title = enabled
        ? "Modo preview ativo: clique abre em popup."
        : "Modo preview desativado: clique abre em nova guia.";
    };
    const applyUpdateState = (result) => {
      const hasUpdate = !!result?.hasUpdate && !!String(result?.remoteVersion || "").trim();
      if (!hasUpdate) {
        alertBtn.style.setProperty("display", "none", "important");
        delete alertBtn.dataset.hsRemoteUrl;
        return;
      }
      const remoteVersion = String(result.remoteVersion || "").trim();
      alertBtn.value = `Nova versao ${remoteVersion}`;
      alertBtn.title = `Existe atualizacao disponivel (${remoteVersion}). Clique para ver detalhes e atualizar.`;
      alertBtn.dataset.hsRemoteUrl = String(result?.remoteUrl || "").trim();
      alertBtn.style.setProperty("display", "inline-flex", "important");
      showUpdatePopupOnce(result);
    };

    btn.onclick = (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      const next = !isPreviewOnlyModeEnabled();
      setPreviewOnlyModeEnabled(next);
      syncLabel();
      toast(next ? "Modo preview ativado." : "Modo preview desativado.", "ok", 2200);
    };
    updatesBtn.value = "Atualizacoes";
    updatesBtn.title = "Ver ultimas atualizacoes do script";
    updatesBtn.onclick = async (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      try {
        await showRecentUpdatesDialog();
      } catch {
        toast("Nao foi possivel abrir o historico de atualizacoes agora.", "err", 3000);
      }
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
          toast(`Nova versao ${result.remoteVersion} disponivel.`, "info", 3000);
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
        await openManualUpdateGuide();
      } catch (err) {
        toast("Nao foi possivel abrir o codigo remoto agora.", "err", 3200);
      } finally {
        manualBtn.disabled = false;
        manualBtn.value = oldLabel;
        delete manualBtn.dataset.hsBusy;
      }
    };
    alertBtn.onclick = (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      showRecentUpdatesDialog({
        forceRefresh: true,
        remoteVersion: String(alertBtn.value || "").replace(/^Nova versao\s*/i, "").trim(),
        remoteUrl: String(alertBtn.dataset.hsRemoteUrl || ""),
        highlightVersion: String(alertBtn.value || "").replace(/^Nova versao\s*/i, "").trim(),
        checkedAt: Date.now(),
      }).catch(() => {
        openScriptUpdatePage(alertBtn.dataset.hsRemoteUrl || "");
      });
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

    syncLabel();
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
    const hasGrid = document.querySelector("table.sortable");
    const hasFiltros = document.querySelector('form[name="filtros"]');
    if (!isDashboardLikePath && !hasFiltros) return;
    if (!hasGrid && !hasFiltros) {
      const conteudoTxt = norm(document.getElementById("conteudo")?.textContent || "");
      if (!/nenhuma\s+requisic/.test(conteudoTxt)) return;
    }
    document.body.classList.add("hs-dashboard-page");
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

    const titleNodes = Array.from(form.querySelectorAll("h1,h2,h3,strong,b,div,td,span"));
    const sectionMain = titleNodes.find((el) => /novo usu|editar usu|usu[aÃ¡]rio\s*:/.test(norm(el.textContent || "")));
    const sectionPass = titleNodes.find((el) => /definir senha|senha de acesso/.test(norm(el.textContent || "")));
    if (sectionMain) sectionMain.classList.add("hs-user-section-title");
    if (sectionPass) sectionPass.classList.add("hs-user-section-title");

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

    actionTables.forEach((tb) => {
      tb.style.display = "none";
    });
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

    const currentCompany = select.value;
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
    if (currentCompany && Array.from(select.options).some((o) => o.value === currentCompany)) {
      select.value = currentCompany;
    }

    const applyFilters = () => {
      const q = norm(search.value || "").trim();
      const company = select.value;
      rows.forEach((tr) => {
        const rowCompany = tr.dataset.hsUserCompany || "";
        const rowText = tr.dataset.hsUserSearch || "";
        const okCompany = !company || rowCompany === company;
        const okText = !q || rowText.includes(q);
        tr.style.display = okCompany && okText ? "" : "none";
      });
    };

    if (bar.dataset.hsUsersBound !== "1") {
      bar.dataset.hsUsersBound = "1";
      select.addEventListener("change", applyFilters);
      search.addEventListener("input", applyFilters);
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
        tr.classList.remove("hs-em", "hs-em100");
        const tds = tr.children;
        const sit = norm((tds[sitIdx]?.textContent) || "");
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
  function normalizeDashboardTableWidths() {
    if (!document.body.classList.contains("hs-dashboard-page")) return;

    const conteudo = document.getElementById("conteudo") || document.body;
    const conteudoWidth = Math.round(conteudo.getBoundingClientRect().width || 0);
    const fallbackWidth = conteudoWidth > 0 ? Math.min(1320, conteudoWidth) : 1320;

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
      applyFiltrosWidth(fallbackWidth);
      return;
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
    if (!renderedWidths.length) return;

    // Usa a maior largura visivel como referencia e replica para todas.
    const maxRenderedWidth = renderedWidths.reduce((acc, w) => Math.max(acc, w), renderedWidths[0]);
    if (maxRenderedWidth <= 0) return;

    const targetWidth = conteudoWidth > 0 ? Math.min(maxRenderedWidth, conteudoWidth) : maxRenderedWidth;
    if (targetWidth <= 0) return;

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
        summary.appendChild(chipAprov);
      }
      if (cancelaveis > 0) {
        const chipCanc = document.createElement("span");
        chipCanc.className = "hs-ext-sla-chip ch-exp";
        chipCanc.textContent = `Cancelaveis: ${cancelaveis}`;
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
    const sitNode = td.querySelector(".Situacao");
    if (sitNode) return String(sitNode.textContent || "").trim();

    const clone = td.cloneNode(true);
    clone.querySelectorAll(".hs-first-att-wrap").forEach((el) => el.remove());
    return String(clone.textContent || "").trim();
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
   * Objetivo: Fecha modal de preview de imagem.
   *
   * Contexto: usado nos previews de anexos locais/remotos.
   * Parametros: nenhum.
   * Retorno: void.
   */
  function closeImagePreviewModal() {
    if (!hsImagePreviewModal) hsImagePreviewModal = document.getElementById("hs-image-viewer");
    if (!(hsImagePreviewModal instanceof HTMLElement)) return;
    hsImagePreviewModal.classList.remove("open");
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
            <button type="button" data-action="close">Fechar</button>
          </header>
          <div class="hs-image-viewer-body">
            <img alt="Preview do anexo" />
          </div>
        </section>
      `;
      document.body.appendChild(modal);
    }
    hsImagePreviewModal = modal;
    if (modal.dataset.hsBound === "1") return modal;
    modal.dataset.hsBound = "1";
    modal.querySelector(".hs-image-viewer-backdrop")?.addEventListener("click", closeImagePreviewModal);
    modal.querySelector('[data-action="close"]')?.addEventListener("click", closeImagePreviewModal);
    return modal;
  }
  /**
   * Objetivo: Abre modal de preview para URL de imagem.
   *
   * Contexto: acionado por clique nas miniaturas e links de anexos.
   * Parametros:
   * - imageUrl: URL da imagem.
   * - label: titulo opcional.
   * Retorno: void.
   */
  function openImagePreviewModal(imageUrl, label = "") {
    const src = String(imageUrl || "").trim();
    if (!src) return;
    const modal = ensureImagePreviewModal();
    if (!(modal instanceof HTMLElement)) return;
    const titleEl = modal.querySelector(".hs-image-viewer-title");
    const img = modal.querySelector(".hs-image-viewer-body img");
    if (!(img instanceof HTMLImageElement)) return;
    if (titleEl instanceof HTMLElement) {
      const title = String(label || "").trim();
      titleEl.textContent = title ? `Preview da imagem - ${title}` : "Preview da imagem";
    }
    img.src = src;
    img.alt = String(label || "Preview do anexo");
    modal.classList.add("open");
  }
  /**
   * Objetivo: Habilita selecao multipla de imagens no campo de anexos.
   *
   * Contexto: Tela "Visualizar requisicao" no bloco de novo acompanhamento.
   * Parametros: nenhum.
   * Retorno: void.
   * Efeitos colaterais: ajusta atributos de inputs file e observa clique em "Novo".
   */
  function ensureMultipleImageAttachments() {
    if (!isRequestVisualizarPage()) return;
    const root = document.getElementById("interno") || document.body;
    if (!(root instanceof HTMLElement)) return;
    const imageUrlRx = /\.(avif|bmp|gif|heic|heif|jpe?g|png|svg|tiff?|webp)(?:[?#].*)?$/i;
    const hasImageExtension = (value) => imageUrlRx.test(String(value || "").trim());
    const toAbsoluteUrl = (value) => {
      const raw = String(value || "").trim();
      if (!raw) return "";
      try {
        return new URL(raw, location.href).toString();
      } catch {
        return raw;
      }
    };
    const bindClickableImagePreview = (target, imageUrl, label = "") => {
      if (!(target instanceof HTMLElement)) return;
      const resolvedUrl = toAbsoluteUrl(imageUrl);
      if (!resolvedUrl) return;
      if (/^javascript:/i.test(resolvedUrl)) return;
      if (target.dataset.hsImgPreviewUrl === resolvedUrl) return;
      target.dataset.hsImgPreviewUrl = resolvedUrl;
      target.style.setProperty("cursor", "zoom-in", "important");
      target.addEventListener(
        "click",
        (ev) => {
          if (ev.target instanceof Element && ev.target.closest(".hs-attach-thumb-remove")) return;
          if (ev.defaultPrevented) return;
          if ("button" in ev && ev.button !== 0) return;
          if (ev.ctrlKey || ev.metaKey || ev.shiftKey || ev.altKey) return;
          ev.preventDefault();
          ev.stopPropagation();
          openImagePreviewModal(resolvedUrl, label);
        },
        true
      );
    };

    const setInputMulti = (input) => {
      if (!(input instanceof HTMLInputElement)) return;
      if ((input.type || "").toLowerCase() !== "file") return;

      input.multiple = true;
      const acceptNow = String(input.getAttribute("accept") || "").trim();
      if (!acceptNow) {
        input.setAttribute("accept", "image/*");
      } else if (!/(^|,)\s*image\/\*/i.test(acceptNow)) {
        input.setAttribute("accept", `${acceptNow},image/*`);
      }
      input.dataset.hsMultiAnexo = "1";
    };
    const decorateInputPreview = (input) => {
      if (!(input instanceof HTMLInputElement)) return;
      if ((input.type || "").toLowerCase() !== "file") return;
      if (input.dataset.hsAttachUi === "1") return;

      input.dataset.hsAttachUi = "1";
      input.classList.add("hs-attach-native");

      const picker = document.createElement("div");
      picker.className = "hs-attach-picker";
      input.parentElement?.insertBefore(picker, input);
      picker.appendChild(input);

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "hs-attach-btn";
      btn.textContent = "Selecionar imagens";

      const clearBtn = document.createElement("button");
      clearBtn.type = "button";
      clearBtn.className = "hs-attach-clear-btn";
      clearBtn.textContent = "Limpar";
      clearBtn.disabled = true;

      const status = document.createElement("span");
      status.className = "hs-attach-status";
      status.textContent = "Nenhuma imagem selecionada";

      const preview = document.createElement("div");
      preview.className = "hs-attach-preview";

      picker.insertBefore(btn, input);
      picker.insertBefore(clearBtn, input);
      picker.appendChild(status);
      picker.appendChild(preview);

      let renderSeq = 0;
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
          } catch (_err) {
            finish("");
          }
        });

      const assignSelectedFiles = (nextFiles) => {
        const list = Array.from(nextFiles || []).filter((file) => file instanceof File);
        if (!list.length) {
          input.value = "";
          return true;
        }
        try {
          if (typeof DataTransfer === "function") {
            const dt = new DataTransfer();
            list.forEach((file) => dt.items.add(file));
            input.files = dt.files;
            return true;
          }
        } catch (_err) {}
        return false;
      };
      const clearSelectedImages = () => {
        input.value = "";
        renderPreview();
      };
      const removeSelectedImageByIndex = (index) => {
        const currentFiles = Array.from(input.files || []);
        if (!Number.isInteger(index) || index < 0 || index >= currentFiles.length) return;
        currentFiles.splice(index, 1);
        if (currentFiles.length) {
          if (!assignSelectedFiles(currentFiles)) {
            input.value = "";
            status.textContent = "Nao foi possivel remover somente uma imagem. Selecione novamente.";
          }
        } else {
          input.value = "";
        }
        renderPreview();
      };

      const renderPreview = async () => {
        const seq = ++renderSeq;
        preview.innerHTML = "";
        const files = Array.from(input.files || []);
        clearBtn.disabled = files.length === 0;
        const images = files
          .map((file, fileIndex) => ({ file, fileIndex }))
          .filter((item) => isImageLike(item.file));
        status.textContent = images.length
          ? `${images.length} ${images.length > 1 ? "imagens" : "imagem"} selecionada${images.length > 1 ? "s" : ""}`
          : "Nenhuma imagem selecionada";

        const thumbs = images.slice(0, 8);
        for (const item of thumbs) {
          const file = item.file;
          const fileIndex = item.fileIndex;
          if (seq !== renderSeq) return;
          const src = await readFileAsDataUrl(file);
          if (seq !== renderSeq) return;

          const fig = document.createElement("figure");
          fig.className = "hs-attach-thumb";
          fig.tabIndex = 0;
          fig.setAttribute("role", "button");
          fig.setAttribute("aria-label", `Abrir preview de ${String(file.name || "imagem")}`);
          fig.title = "Clique para ampliar";

          const img = document.createElement("img");
          img.alt = String(file.name || "imagem");
          img.loading = "lazy";
          img.decoding = "async";
          if (src) img.src = src;

          const caption = document.createElement("figcaption");
          caption.textContent = String(file.name || "imagem");

          const removeBtn = document.createElement("button");
          removeBtn.type = "button";
          removeBtn.className = "hs-attach-thumb-remove";
          removeBtn.textContent = "x";
          removeBtn.title = "Remover imagem";
          removeBtn.setAttribute("aria-label", `Remover ${String(file.name || "imagem")}`);

          fig.appendChild(img);
          fig.appendChild(removeBtn);
          fig.appendChild(caption);
          preview.appendChild(fig);
          if (src) bindClickableImagePreview(fig, src, String(file.name || "imagem"));
          removeBtn.addEventListener("click", (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            ev.stopImmediatePropagation();
            removeSelectedImageByIndex(fileIndex);
          });
          fig.addEventListener("keydown", (ev) => {
            const key = String(ev.key || "").toLowerCase();
            if (key !== "enter" && key !== " ") return;
            ev.preventDefault();
            if (src) openImagePreviewModal(src, String(file.name || "imagem"));
          });
        }
      };

      btn.addEventListener("click", () => input.click());
      clearBtn.addEventListener("click", (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        clearSelectedImages();
      });
      input.addEventListener("change", renderPreview);
      renderPreview();
    };

    const fileInputs = Array.from(
      root.querySelectorAll(
        "#Novo_Acompanhamento input[type='file'], #acompanhamento_form input[type='file'], input[type='file']"
      )
    );
    fileInputs.forEach((input) => {
      const nearForm = input.closest("#Novo_Acompanhamento, #acompanhamento_form");
      if (nearForm) {
        setInputMulti(input);
        decorateInputPreview(input);
        return;
      }

      const row = input.closest("tr,td,div,label");
      const rowText = norm(row?.textContent || "");
      if (/anex/.test(rowText)) {
        setInputMulti(input);
        decorateInputPreview(input);
      }
    });
    const attachmentBlocks = [];
    const detailRows = Array.from(root.querySelectorAll("table:not(.sortable) tr")).filter((tr) => {
      const cells = Array.from(tr.querySelectorAll("th,td"));
      if (!cells.length) return false;
      const firstLabel = norm(cells[0]?.textContent || "");
      return /^anex/.test(firstLabel) || /\banex/.test(norm(tr.textContent || ""));
    });
    detailRows.forEach((row) => attachmentBlocks.push(row));
    root
      .querySelectorAll(
        "[id*='anex'], [class*='anex'], [name*='anex']"
      )
      .forEach((el) => {
        if (el instanceof HTMLElement) attachmentBlocks.push(el);
      });
    const uniqueBlocks = Array.from(new Set(attachmentBlocks));
    uniqueBlocks.forEach((scope) => {
      scope.querySelectorAll("a[href], img[src]").forEach((el) => {
        let url = "";
        let label = "";
        if (el instanceof HTMLAnchorElement) {
          url = String(el.getAttribute("href") || "").trim();
          label = String(el.textContent || el.getAttribute("title") || "").trim();
        } else if (el instanceof HTMLImageElement) {
          url = String(el.currentSrc || el.src || "").trim();
          label = String(el.getAttribute("alt") || el.getAttribute("title") || "").trim();
        } else {
          return;
        }
        const probe = norm(`${url} ${label}`);
        const isLikelyImage = hasImageExtension(url) || /^data:image\//i.test(url) || /imagem|image|anex|upload/.test(probe);
        if (!isLikelyImage) return;
        bindClickableImagePreview(el, url, label);
      });
    });

    if (root.dataset.hsMultiAnexoBind === "1") return;
    root.dataset.hsMultiAnexoBind = "1";
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

        setTimeout(() => ensureMultipleImageAttachments(), 80);
        setTimeout(() => ensureMultipleImageAttachments(), 260);
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
  function getStoredGeminiKey() {
    try {
      return (localStorage.getItem(GEMINI_API_KEY_LS) || "").trim();
    } catch {
      return "";
    }
  }
  /**
   * Objetivo: Persiste chave Gemini no navegador.
   *
   * Contexto: Parte do fluxo de UI/automacao do suporte Headsoft.
   * Parametros:
   * - key: entrada usada por esta rotina.
   * Retorno: void.
   * Efeitos colaterais: pode ler/alterar DOM, storage e estado de execucao conforme o caso.
   */
  function setStoredGeminiKey(key) {
    try {
      localStorage.setItem(GEMINI_API_KEY_LS, String(key || "").trim());
    } catch {}
  }
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
  let hsImagePreviewModal = null;
  let reqPopupEscBound = false;
  let hsReqClicksBound = false;
  let hsAjaxRefreshBusy = false;
  let hsAjaxRefreshTimer = null;
  let hsAjaxLastSignature = "";
  let hsAjaxLastToastAt = 0;
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
    frame.src = `${location.origin}/visualizar_requisicao.php?numero=${encodeURIComponent(numero)}`;
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
    registerCurrentNovaRows();
    renderRowAlerts();
    ensureCountBadges();
    ensureConsultaPrimeiroAtendimentoButtons();
    bindRowAndLogoClicks();
    normalizeDashboardTableWidths();
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

    hsAjaxRefreshBusy = true;
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
      if (!remoteSnap.signature) return;
      if (remoteSnap.signature === hsAjaxLastSignature) return;

      const localBodies = Array.from(document.querySelectorAll("#conteudo table.sortable tbody"));
      const remoteBodies = Array.from(parsed.querySelectorAll("#conteudo table.sortable tbody"));
      if (!localBodies.length || !remoteBodies.length) return;

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

      runPostAjaxGridRefreshLightPass();
    } catch (err) {
      console.warn("[HeadsoftHelper] Falha no refresh AJAX discreto:", err);
    } finally {
      hsAjaxRefreshBusy = false;
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

    hsAjaxRefreshTimer = window.setInterval(() => {
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
    runStep(styleUserFormPage, "styleUserFormPage");
    runStep(hideSomeFilters, "hideSomeFilters");
    runStep(ensureDashboardPreviewModeToggle, "ensureDashboardPreviewModeToggle");
    runStep(hideVisualizarActions, "hideVisualizarActions");
    runStep(alignRequestHeaderActions, "alignRequestHeaderActions");
    runStep(hideRequestedGridColumns, "hideRequestedGridColumns");
    runStep(markServiceRows, "markServiceRows");
    runStep(tagDashboardGridColumns, "tagDashboardGridColumns");
    runStep(signalExternalReturnSlaRules, "signalExternalReturnSlaRules");
    runStep(ensureDashboardNovasSection, "ensureDashboardNovasSection");
    runStep(ensureAjaxGridRefresh, "ensureAjaxGridRefresh");
    runStep(registerCurrentNovaRows, "registerCurrentNovaRows");
    runStep(renderRowAlerts, "renderRowAlerts");
    runStep(ensureCountBadges, "ensureCountBadges");
    runStep(ensureConsultaPrimeiroAtendimentoButtons, "ensureConsultaPrimeiroAtendimentoButtons");
    runStep(bindRowAndLogoClicks, "bindRowAndLogoClicks");
    runStep(runAutoConcluirIfPending, "runAutoConcluirIfPending");
    runStep(ensureMultipleImageAttachments, "ensureMultipleImageAttachments");
    runStep(ensureRequestQuickActions, "ensureRequestQuickActions");
    runStep(layoutRequestCalendarAndConsumption, "layoutRequestCalendarAndConsumption");
    runStep(highlightAcompanhamentosResponsavelEspecial, "highlightAcompanhamentosResponsavelEspecial");
    runStep(disableAcompanhamentosHoverEffects, "disableAcompanhamentosHoverEffects");
    runStep(bindNoHoverAcompanhamentosEvents, "bindNoHoverAcompanhamentosEvents");
    runStep(wireCalendars, "wireCalendars");
    runStep(enhanceUsersPage, "enhanceUsersPage");
    runStep(normalizeDashboardTableWidths, "normalizeDashboardTableWidths");
    runStep(adjustHomeTopOffset, "adjustHomeTopOffset");
    runStep(adjustDashboardTopOffset, "adjustDashboardTopOffset");
    runStep(adjustRequestTopOffset, "adjustRequestTopOffset");
    runStep(adjustUsersTopOffset, "adjustUsersTopOffset");
    runStep(adjustUserFormTopOffset, "adjustUserFormTopOffset");
    runStep(runHealthCheckOnce, "runHealthCheckOnce");
    runStep(runSelfCheck, "runSelfCheck");
  }

  // Bootstrap inicial do userscript com suporte a pagina ja carregada.
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", safeRun);
  else safeRun();

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
  const target = document.getElementById("conteudo") || document.body;
  let timer = null;
  let running = false;
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
  const mo = new MutationObserver((mutations) => {
    if (!shouldProcessMutations(mutations)) return;
    schedule();
  });
  mo.observe(target, { childList: true, subtree: true });
})();
