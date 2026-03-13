# USER2_GUIDE.md

## Objetivo

Este arquivo registra como a V2 funciona hoje para que futuras IAs continuem a evolucao sem voltar ao modelo antigo por acidente.

## Regra principal

- `.user.js` continua sendo o bootstrap/loader principal.
- `.user2.js` e a nova experiencia.
- Se a mudanca for de layout, fluxo visual, preview, leitura da grade ou UX da V2, o lugar preferencial e `.user2.js`.
- Evitar crescer o `.user.js` com UI nova da V2.

## Visao geral da arquitetura

### `.user.js`

- Mantem a instalacao principal do userscript.
- Faz versionamento geral da extensao.
- Exibe o toggle para ligar/desligar a nova versao.
- Tenta conversar com a API global `window.HSHeadsoftUser2`.
- Tem fallback para injetar o `.user2.js` remoto quando necessario.

### `.user2.js`

- Define `USER2_VERSION` e `USER2_UPDATES`.
- Expande `window.HSHeadsoftUser2`.
- Liga/desliga a V2 usando o storage de modo experimental.
- Monta a shell visual da V2 no dashboard/consulta.
- Mantem preview lateral proprio.
- Aplica a linguagem visual da V2 na tela da requisicao.
- Reaplica a experiencia usando `MutationObserver` + heartbeat.

## API que o user2 deve continuar expondo

Mesmo que internamente a implementacao mude, a V2 deve continuar expondo no minimo:

- `openSettingsHub`
- `getUser2VersionInfo`
- `isExperimentalVersionEnabled`
- `setExperimentalVersionEnabled`
- `mountExperimentalVersion`
- `unmountExperimentalVersion`
- `openExperimentalVersionPanel`
- `closeExperimentalVersionPanel`
- `triggerExperimentalVersionNotification`
- `refreshExperimentalGrid`

Observacao:
- `openSettingsHub` hoje pode continuar como stub (`() => false`) se a V2 nao usar o hub antigo.
- O `.user.js` depende de algumas dessas assinaturas para detectar se o `user2` esta carregado.

## Chaves de storage da V2

Hoje a V2 usa principalmente:

- `hs2025-experimental-user2-mode`
  - guarda se a V2 esta ativa ou nao.
- `hs2025-user2-settings-v2`
  - guarda preferencias exclusivas da V2.

Regra:
- nao misturar configuracoes da V2 com chaves da versao antiga;
- se precisar quebrar compatibilidade de estrutura, criar uma nova chave versionada em vez de reaproveitar de forma ambigua.

## Direcao de produto da V2

Quando evoluir o `.user2.js`, seguir esta intencao:

- tratar a V2 como outro sistema de chamados;
- preferir leitura moderna, limpa, forte e profissional;
- nao depender visualmente da tabela antiga como experiencia final;
- usar a tabela/DOM legado como fonte de dados quando necessario;
- manter preview lateral e contexto rapido;
- deixar a tela de requisicao coerente com a mesma linguagem visual.

Em resumo:
- a V2 nao deve parecer "a versao 1 com outra cor";
- ela deve parecer um workspace novo construido em cima do sistema legado.

## Estrategia visual recomendada

- Priorizar hierarquia clara: destaque de titulo, status, prioridade, idade e responsavel.
- Evitar excesso de linhas, contornos e microchips quando isso piorar a leitura.
- Preferir cards/listas bem espaçados para triagem.
- O preview lateral deve complementar a lista, nao competir com ela.
- Ao mudar visual, pensar primeiro em:
  - legibilidade;
  - densidade;
  - rapidez para bater o olho;
  - diferenciar urgencia, responsavel e idade.

## Fluxo atual da V2

### Dashboard / consulta

- A V2 monta uma shell propria no `#conteudo`.
- O DOM legado e reorganizado dentro de `#hsu2-shell`.
- A tabela original continua como fonte, mas a V2 pode esconder essa tabela e renderizar componentes proprios.
- O preview lateral e atualizado ao selecionar/passar o mouse em um chamado.

### Visualizar requisicao

- A V2 aplica um badge/shell visual para manter continuidade.
- A ideia e que a tela tambem pareca parte do workspace novo.

## Como editar com seguranca

Quando mexer na V2:

1. Ler este arquivo e o inicio de `.user2.js`.
2. Identificar se a mudanca e:
   - visual;
   - estrutura do workspace;
   - preview;
   - dados/metricas;
   - bootstrap/confiabilidade.
3. Fazer a alteracao em `.user2.js`.
4. Se houve mudanca em `.user2.js`, obrigatoriamente:
   - incrementar `USER2_VERSION`;
   - adicionar entrada em `USER2_UPDATES`;
   - incrementar versao do `.user.js`;
   - atualizar `SCRIPT_VERSION_FALLBACK` no `.user.js`;
   - adicionar entrada em `RECENT_UPDATES` no `.user.js`;
   - adicionar entrada em `updates-log.json`.

## Checklist de release quando mudar o user2

- Atualizou `USER2_VERSION`?
- Atualizou `USER2_UPDATES`?
- Atualizou `@version` do `.user.js`?
- Atualizou `SCRIPT_VERSION_FALLBACK` do `.user.js`?
- Atualizou `RECENT_UPDATES` no `.user.js`?
- Atualizou `updates-log.json`?
- Validou sintaxe dos dois arquivos?

## Checklist funcional minimo

Depois de mudar a V2, testar:

1. Ativar a V2 nas configuracoes.
2. Recarregar `dashboard.php`.
3. Recarregar `consulta_requisicao.php`.
4. Validar se a shell da V2 sobe.
5. Validar se o preview lateral funciona.
6. Validar se a troca para a versao antiga limpa a V2.
7. Validar se `visualizar_requisicao.php` recebe a linguagem visual da V2 quando aplicavel.

## Regras de confiabilidade

- A montagem da V2 deve ser idempotente.
- Se o DOM legado mexe muito, reaplicar com debounce.
- Manter fallback de bootstrap para cenarios em que o `@require` nao basta sozinho.
- Ao desmontar, limpar:
  - classes globais;
  - shell da V2;
  - preview;
  - badges;
  - timers;
  - observer.

## O que evitar

- Nao mover funcionalidade nova da V2 para dentro do `.user.js` sem motivo forte.
- Nao tratar a V2 como ajuste cosmetico minimo.
- Nao quebrar a API global esperada pelo `.user.js`.
- Nao reaproveitar storage da versao antiga para preferencia nova da V2.
- Nao deixar a V2 sem desmontagem limpa ao voltar para a antiga.

## Resumo curto para a proxima IA

- A V2 vive em `.user2.js`.
- O `.user.js` e ponte/bootstrap/versionamento.
- Mudou `.user2.js` -> versiona os dois lados e atualiza logs.
- A V2 precisa parecer outro sistema, nao um tema.
- Priorizar workspace proprio, preview forte, leitura moderna e confiabilidade de montagem.
