# Relatório de testes do frontend CozinhAI

## Escopo e estratégia

Suíte de testes de componentes/fluxo com Vitest, React Testing Library e
jsdom. As respostas de `fetch` e Axios, autenticação e navegação são
substituídas por mocks. Os dados são sintéticos; nenhuma chamada foi feita à
API NestJS, ao MongoDB Atlas ou à Spoonacular.

Esta execução não é um teste integrado do ambiente publicado nem um teste em
navegador real. Não foram medidos cobertura, desempenho, carga, disponibilidade
ou escalabilidade.

## Ambiente registrado

- Sistema: Linux
- Node.js: `v24.14.0`
- npm: `11.9.0`
- Vitest: `3.2.4`
- React Testing Library: `16.3.3`
- jsdom: `29.1.1`
- Data da execução final: `06/11/2026`

## Casos executados

| ID | Fluxo | Dados sintéticos | Resultado esperado | Resultado observado | Status |
|---|---|---|---|---|---|
| FE-SEARCH-01 | Busca por nome | `bolo de cenoura` | Navegar para `/receitas` com a consulta codificada. | `router.push` recebeu `/receitas?query=bolo%20de%20cenoura`. | Aprovado |
| FE-SEARCH-02 | Busca vazia | Consulta vazia | Não iniciar navegação. | `router.push` não foi chamado. | Aprovado |
| FE-SEARCH-03 | Resultados | Resposta simulada com receita ID `501`. | Exibir o título e fazer uma solicitação de busca. | “Bolo de cenoura sintético” foi exibido; uma chamada mockada foi observada. | Aprovado |
| FE-SEARCH-04 | Estado vazio | Resposta simulada `results: []`. | Informar que nenhuma receita foi encontrada. | “Nenhuma receita encontrada.” foi exibido. | Aprovado |
| FE-SEARCH-05 | Erro da busca | Resposta HTTP simulada `503`. | Informar o erro e não apresentar estado vazio como sucesso. | A mensagem HTTP 503 foi exibida; estado vazio não apareceu. | Aprovado |
| FE-SEARCH-06 | Submissão por teclado | `salada` | Enviar busca usando Enter. | `router.push` recebeu `/receitas?query=salada`. | Aprovado |
| FE-INGREDIENT-01 | Busca por ingredientes | Ingrediente `tomate`; receita sintética ID `502`. | Adicionar o ingrediente, buscar e mostrar o resultado. | O ingrediente e “Sopa sintética de tomate” foram exibidos; a URL mockada incluiu `ingredients=tomate`. | Aprovado |
| FE-AUTH-01 | Login inválido | `ana@example.com`, senha vazia. | Mostrar validação sem chamar o login. | A validação da senha apareceu; a função `login` não foi chamada. | Aprovado |
| FE-AUTH-02 | Login bem-sucedido | Conta fictícia `ana@example.com` e senha de teste. | Autenticar pelo mock e navegar para `/home`. | O mock de login foi chamado e a navegação para `/home` ocorreu. | Aprovado |
| FE-AUTH-03 | Cadastro inválido | Nome `Al`, e-mail fictício válido e senha `curta`. | Exibir validações sem enviar requisição. | Erros de nome e senha apareceram; `fetch` não foi chamado. | Aprovado |
| FE-AUTH-04 | Cadastro bem-sucedido | `Ana Teste`, `ana@example.com` e senha de teste. | Enviar dados ao mock e navegar para `/login?success=true`. | Uma chamada mockada ocorreu e o redirecionamento esperado foi solicitado. | Aprovado |
| FE-DETAIL-01 | Detalhes da receita | ID `synthetic-recipe-42`, tomate e instrução fictícia. | Exibir título, ingrediente, instrução e estado sem avaliações. | Conteúdo e estado de resumo sem avaliações foram exibidos; autenticação externa não foi usada. | Aprovado |
| FE-DETAIL-02 | Favorito e avaliação | Usuário, receita, token e comentário fictícios. | Atualizar favorito e enviar avaliação via mocks. | Axios `PATCH` e `POST` foram chamados; a interface mostrou “Favoritada” e o estado de avaliação enviada. | Aprovado |
| FE-DETAIL-03 | Erro e nova tentativa | Primeira resposta de detalhes rejeitada; segunda resposta sintética válida. | Mostrar erro acessível e permitir nova tentativa de carregamento. | Alerta de erro exibido; botão repetiu a solicitação e carregou a receita fictícia. | Aprovado |
| FE-FAV-01 | Caderno de receitas | Favorito fictício `synthetic-recipe-42`. | Exibir e remover o favorito. | Receita exibida; Axios `DELETE` mockado; item removido da lista. | Aprovado |
| FE-FAV-02 | Caderno vazio | Resposta simulada `[]`. | Informar que não há favoritos. | “Você ainda não favoritou nenhuma receita.” foi exibido. | Aprovado |
| FE-SAFE-01 | Instruções HTML externas | Texto com tags, entidade HTML e bloco `<script>` sintéticos. | Exibir texto legível sem markup executável. | Tags e conteúdo de script removidos; texto renderizado como conteúdo textual. | Aprovado |

## Execução e resultados

Comando final:

```text
npm test
```

Resultado observado: **6 arquivos aprovados, 17 testes aprovados, 0 reprovados**.

Validações adicionais:

| Comando | Resultado observado |
|---|---|
| `npm run lint` | Código de saída 0; “No ESLint warnings or errors”. O Next.js ainda emitiu avisos de carregamento do SWC do ambiente Linux. |
| `npx eslint src/components/SearchBar.tsx src/components/Header.tsx src/components/Footer.tsx src/app/home/page.tsx src/app/map/page.tsx 'src/app/receitas/detalhes/[id]/ClientPageContent.tsx' src/components/ReceitaPage.tsx src/utils/html-to-text.ts tests vitest.config.ts` | Código de saída 0, sem diagnósticos. |
| `npx tsc --noEmit` | Código de saída 0, sem diagnósticos. |
| `git diff --check` | Código de saída 0, sem problemas de whitespace. |

Os resultados acima foram observados no terminal desta sessão; as saídas não foram exportadas como arquivos nem foram feitas capturas de tela. Os comandos listados permitem reproduzir a execução.

Durante a preparação, uma primeira execução de busca falhou no harness porque a página exige `NEXT_PUBLIC_SPOONACULAR_API_KEY`; foi configurado um valor sintético apenas no teste, sem chave real e sem chamada externa. Um teste inicial da recuperação após falha também precisou de ajuste na fixture para a segunda chamada retornar sucesso. As execuções finais listadas acima passaram; nenhuma falha final ficou pendente.

O `npm install` informou **19 vulnerabilidades no conjunto de dependências instalado** (1 baixa, 4 moderadas, 9 altas e 5 críticas). Não foi feita análise de atribuição nem executado `npm audit fix`; o resultado não permite concluir que as novas dependências sejam a causa ou que o projeto tenha sido corrigido.

## Não executados e limitações

- Navegador real e testes E2E: não executados; não havia Playwright/Cypress nem binário de navegador no ambiente.
- Busca e autenticação integradas com a API publicada: não executadas; backend substituído por mocks.
- MongoDB Atlas e Spoonacular reais: não acessados.
- Avaliações na listagem `/avaliacoes`, redefinição de senha, perfil e outros percursos: não cobertos.
- Testes não funcionais (carga, desempenho, disponibilidade, recuperação e escalabilidade): não executados.
- Acessibilidade automatizada abrangente, cobertura de código e build de produção: não executados.

## Correções realizadas no código de produção

- Busca no cabeçalho convertida em formulário com papel `search`, rótulo acessível, botão identificado e submissão por Enter; busca de ingredientes e ações de remoção também têm nomes acessíveis.
- Imagens locais passaram a usar `next/image`; imagens decorativas têm `alt` vazio, as informativas têm texto alternativo e os links sociais do rodapé têm nomes acessíveis.
- Falhas ao obter detalhes agora mostram alerta acessível e opção de nova tentativa, em vez de permanecerem no estado de carregamento.
- Logs de depuração que incluíam identificador do usuário ou conteúdo das avaliações foram removidos das telas de detalhes.
- Instruções HTML do provedor externo são convertidas para texto antes da renderização; tags e blocos de script/style são removidos e o React renderiza o resultado como texto.

## Síntese para registro no PI

Síntese reproduzida na seção de qualidade do documento do PI:

> Em 06/11/2026 foi executada uma suíte de testes de componentes do frontend web com Vitest, React Testing Library e jsdom. Foram aprovados 17 casos em seis arquivos, cobrindo busca por nome e por ingredientes, submissão por teclado, estados de resultado/vazio/erro, validações de login/cadastro, detalhes com nova tentativa, favoritos, avaliação e renderização de instruções HTML como texto. As respostas de rede e a autenticação foram simuladas com dados sintéticos; não foram acessados a API publicada, o MongoDB Atlas ou a Spoonacular. Lint e verificação TypeScript terminaram com código 0; o lint não encontrou avisos ou erros, embora o Next.js tenha emitido avisos de carregamento do SWC no ambiente. A execução não incluiu navegador real, integração com serviços, cobertura, carga ou outros testes não funcionais.

Evidências reproduzíveis: saída do comando `npm test`, `npm run lint`, o
comando direcionado de ESLint da tabela acima e `npx tsc --noEmit`. Ao anexar
capturas ou logs ao PI, verificar que contenham apenas dados sintéticos e
nenhuma chave, token, credencial ou conteúdo de `.env`.
