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

/** Criação do menu para clique para abrir uma nova guia  */

// Defina o ID do item de menu
const menuItemId = 'openInNewTab';

// Remova o item de menu existente com esse ID (se houver)
chrome.contextMenus.remove(menuItemId, () => {
  if (chrome.runtime.lastError) {
    console.log('Item não existe, criando um novo.');
  }

  // Agora crie o item de menu de contexto sem o onclick
  chrome.contextMenus.create({
    id: menuItemId,
    title: '[ABAS BLOQUEADAS] Abrir em nova aba',
    contexts: ['link'], // O menu aparecerá apenas para links
  });
});

// Use o evento onClicked para tratar cliques no menu
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === menuItemId) {
    // O menuItemId é "openInNewTab", ou seja, trata do item que criamos
    chrome.tabs.create({ url: info.linkUrl });
  }
});
