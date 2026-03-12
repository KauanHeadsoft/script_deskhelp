# AGENTS.md

## Regras de versionamento do userscript

- Qualquer mudanca em `.user2.js` exige incremento de versao em `.user.js`.
- A extensao usa `.user.js` como arquivo principal; o `.user2.js` e carregado via `@require` do GitHub.
- Ao subir nova versao, atualizar tambem:
  - `@version` e `SCRIPT_VERSION_FALLBACK` em `.user.js`;
  - entrada correspondente em `RECENT_UPDATES` no `.user.js`;
  - entrada correspondente em `updates-log.json`.
- Quando nao for correcao critica, registrar como update `routine` e `mandatory: false`.
