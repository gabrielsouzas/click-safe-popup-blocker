let blockAllSites = false;
let blockedSites = [];

// Carrega as configurações ao iniciar
chrome.storage.sync.get(['blockAllSites', 'blockedSites'], (data) => {
  blockAllSites = data.blockAllSites || false;
  blockedSites = data.blockedSites || [];
});

chrome.webNavigation.onCreatedNavigationTarget.addListener((details) => {
  // Bloqueia a aba temporariamente
  // chrome.tabs.remove(details.tabId);

  chrome.tabs.get(details.sourceTabId, (tab) => {
    const url = new URL(tab.url);
    const domain = url.hostname;

    // Verifica se o bloqueio está ativado para todos os sites ou apenas para os específicos
    if (blockAllSites || blockedSites.includes(domain)) {
      chrome.tabs.remove(details.tabId); // Bloqueia a nova aba/janela
      console.log(`Aba/janela bloqueada: ${details.url}`);
    }
  });
});

chrome.windows.onCreated.addListener((window) => {
  if (window.type === 'popup') {
    chrome.windows.remove(window.id);
    console.log(`Nova janela popup bloqueada: ${window.id}`);
  }
});

// Listener para atualizar as configurações
chrome.storage.onChanged.addListener((changes) => {
  if (changes.blockAllSites) {
    blockAllSites = changes.blockAllSites.newValue;
  }
  if (changes.blockedSites) {
    blockedSites = changes.blockedSites.newValue;
  }
});

// chrome.webNavigation.onCreatedNavigationTarget.addListener((details) => {
//   // Bloqueia novas abas/janelas exceto quando o menu de contexto é usado
//   chrome.tabs.get(details.sourceTabId, (tab) => {
//     if (!tab.active) {
//       // Se o usuário não ativou a aba diretamente, a aba/janela é bloqueada
//       chrome.tabs.remove(details.tabId);
//       console.log(`Abertura automática bloqueada: ${details.url}`);
//     }
//   });
// });

// Cria um menu de contexto para abrir o link em uma nova guia
chrome.contextMenus.create({
  id: 'openInNewTab',
  title: '[BLOQUEADA] Abrir link em uma nova guia',
  contexts: ['link'],
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'openInNewTab') {
    // Abre o link em uma nova aba
    chrome.tabs.create({ url: info.linkUrl });
  }
});
