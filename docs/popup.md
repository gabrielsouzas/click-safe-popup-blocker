# Documentação do Código

Este código gerencia o bloqueio de sites em uma extensão de navegador, possibilitando ao usuário bloquear sites específicos, ver a lista de sites bloqueados, e ativar ou desativar o bloqueio global. Ele utiliza a API `chrome.storage.sync` para armazenar e recuperar dados de bloqueio, e a API `chrome.tabs` para manipular informações da aba atual.

## Escopo Geral

- **Evento DOMContentLoaded**: Aguarda a página carregar para inicializar a interface e vincular eventos a botões.
- **Elementos**: Seleciona os elementos de interface necessários para interação com o usuário (bloqueio global, bloqueio do site atual, visualização e limpeza da lista de bloqueio).

### Funções

#### `initUI()`

- Inicializa a interface do usuário, configurando o estado inicial dos botões de bloqueio e adicionando ouvintes de evento aos botões.
- **Chamadas**:
  - `loadGlobalBlockState`: Carrega o estado do bloqueio global.
  - `updateBlockButtonForCurrentTab`: Atualiza o estado do botão de bloqueio para o site atual.

#### `loadGlobalBlockState()`

- Carrega o estado do bloqueio global (ativado/desativado) do armazenamento do Chrome.
- Atualiza o botão `toggleBlockAllBtn` para refletir o estado atual do bloqueio global.

#### `updateButtonIcon(button, condition, trueIcon, trueText, falseIcon, falseText)`

- Atualiza a exibição de um botão com ícone e texto, dependendo de uma condição booleana.
- **Parâmetros**:
  - `button`: Botão a ser atualizado.
  - `condition`: Condição booleana para escolher entre o ícone e o texto verdadeiro ou falso.
  - `trueIcon`, `trueText`, `falseIcon`, `falseText`: Ícones e textos para cada estado do botão.

#### `createIcon(icon, msg)`

- Gera HTML para um ícone de botão com texto descritivo.
- **Parâmetros**:
  - `icon`: Nome do arquivo de ícone (sem extensão).
  - `msg`: Texto a ser exibido ao lado do ícone.

#### `updateBlockButtonForCurrentTab()`

- Atualiza o botão `blockThisSiteBtn` para refletir se o site da aba atual está na lista de bloqueio.
- Utiliza a URL da aba atual para identificar o domínio e verificar seu estado de bloqueio.

#### `toggleGlobalBlock()`

- Alterna o estado de bloqueio global e armazena a mudança no `chrome.storage.sync`.
- Atualiza o botão `toggleBlockAllBtn` para refletir o novo estado.

#### `toggleCurrentSiteBlock()`

- Alterna o estado de bloqueio do site atual.
- Armazena o domínio do site atual na lista de bloqueio ou o remove dela, e exibe uma mensagem de confirmação ao usuário.

#### `displayBlockedSites()`

- Exibe a lista de sites bloqueados, criando elementos para cada site na lista.
- Caso não haja sites bloqueados, exibe uma mensagem indicando que a lista está vazia.

#### `confirmSiteRemoval(domain)`

- Exibe uma caixa de diálogo de confirmação para a remoção de um site da lista de bloqueio.
- **Parâmetros**:
  - `domain`: Domínio do site a ser removido da lista.

#### `removeSiteFromBlockedList(domain)`

- Remove o site especificado da lista de bloqueio e atualiza a interface.
- **Parâmetros**:
  - `domain`: Domínio do site a ser removido.

#### `clearBlockedSites()`

- Limpa toda a lista de sites bloqueados após confirmação do usuário.
