# AGENTS.md

## Regras de versionamento do userscript

- Qualquer mudanca em `.user2.js` exige incremento de versao em `.user.js`.
- A extensao usa `.user.js` como arquivo principal; o `.user2.js` e carregado via `@require` do GitHub.
- Ao subir nova versao, atualizar tambem:
  - `@version` e `SCRIPT_VERSION_FALLBACK` em `.user.js`;
  - entrada correspondente em `RECENT_UPDATES` no `.user.js`;
  - entrada correspondente em `updates-log.json`.
- Quando nao for correcao critica, registrar como update `routine` e `mandatory: false`.

## Regra de trabalho para a V2 (`.user2.js`)

- A V2 deve ser tratada como um produto separado da versao antiga, nao apenas como um "tema" em cima do grid legado.
- O foco de evolucao da nova experiencia fica em `.user2.js`; evitar mexer no `.user.js` sem necessidade real de ponte/carregamento/versionamento.
- Ao alterar `.user2.js`, manter compatibilidade com a API global `window.HSHeadsoftUser2` usada pelo `.user.js`.
- A troca entre versao antiga e V2 precisa mudar a experiencia inteira sempre que possivel: dashboard/consulta, preview e tela da requisicao.
- As configuracoes da V2 devem continuar separadas das preferencias da versao antiga no `localStorage`.
- A V2 precisa ser resiliente a DOM legado dinamico: manter montagem idempotente, observer e refresh de seguranca quando necessario.

## Guia rapido do user2

- Arquivo de referencia: `USER2_GUIDE.md`
- Antes de editar a V2, ler esse guia para entender:
  - arquitetura atual;
  - chaves de storage;
  - API exposta para o `.user.js`;
  - checklist de release e testes.
