let blockAllSites = false;
let blockedSites = [];

// Carrega as configurações ao iniciar
initializeSettings();

// Listeners principais
chrome.webNavigation.onCreatedNavigationTarget.addListener(handleNavigation);
// chrome.windows.onCreated.addListener(handlePopupWindow);
chrome.storage.onChanged.addListener(updateSettings);
initializeContextMenu();
// listenForContextUpdates();

/** Função para inicializar as configurações da extensão */
function initializeSettings() {
  chrome.storage.sync.get(['blockAllSites', 'blockedSites'], (data) => {
    blockAllSites = data.blockAllSites || false;
    blockedSites = data.blockedSites || [];
  });
}

/** Manipula a criação de nova aba e bloqueia se necessário */
function handleNavigation(details) {
  // chrome.tabs.get(details.sourceTabId, (tab) => {
  //   const domain = extractDomain(tab);

  //   if (shouldBlockSite(domain)) {
  //     chrome.tabs.remove(details.tabId);
  //     console.log(`Aba/janela bloqueada: ${details.url}`);
  //   }
  // });

  chrome.tabs.get(details.sourceTabId, (tab) => {
    const domain = extractDomain(tab);
    const urlToCheck = details.url || details.pendingUrl || '';
    if (shouldBlockSite(domain) || shouldBlockSite(urlToCheck)) {
      chrome.tabs.remove(details.tabId);
      console.log(`Bloqueado: ${details.url || details.pendingUrl}`);
    }
  });
}

/** Manipula a criação de janelas popup indesejadas */
async function handlePopupWindow(window) {
  const isCrrntWBloqdLst = await isCurrentWindowInBloquedList();
  if (isCrrntWBloqdLst) {
    if (window.type === 'popup') {
      chrome.windows.remove(window.id);
      console.log(`Nova janela popup bloqueada: ${window.id}`);
    }
  }
}

/** Verifica se o site deve ser bloqueado */
function shouldBlockSite(domain) {
  return blockAllSites || blockedSites.includes(domain);
}

/** Extrai o domínio de uma URL */
// function extractDomain(url) {
//   try {
//     return new URL(url).hostname;
//   } catch (error) {
//     console.error('URL inválida:', error);
//     return null;
//   }
// }

// function extractDomain(url) {
//   try {
//     if (url.url !== '') {
//       return new URL(url.url).hostname;
//     }
//     if (url.pendingUrl !== '') {
//       return new URL(url.pendingUrl).hostname;
//     }
//     return '';
//   } catch (error) {
//     console.error('URL inválida:', error);
//     return '';
//   }
// }

function extractDomain(tab) {
  try {
    const url = tab.url || tab.pendingUrl || '';
    return new URL(url).hostname;
  } catch (error) {
    console.error('Erro ao extrair domínio:', error);
    return '';
  }
}

/** Atualiza as configurações quando alteradas no storage */
function updateSettings(changes) {
  if (changes.blockAllSites) blockAllSites = changes.blockAllSites.newValue;
  if (changes.blockedSites) blockedSites = changes.blockedSites.newValue;
}

/** Configura o menu de contexto para abrir links em nova aba */
function initializeContextMenu() {
  // if (!isCurrentWindowInBloquedList()) {
  //   chrome.contextMenus.removeAll();
  //   return;
  // }

  const menuItemIdNewTab = 'openInNewTab';
  const menuItemIdNewWindow = 'openInNewWindow';
  const menuItemIdIncognitoWindow = 'openInIncognitoWindow';

  // Remove os itens de menu existentes
  // [menuItemIdNewTab /*, menuItemIdNewWindow, menuItemIdIncognitoWindow*/].forEach((id) => {
  //   chrome.contextMenus.remove(id, () => {
  //     if (chrome.runtime.lastError) {
  //       console.log(`Item de menu ${id} não existe, criando um novo.`);
  //     }
  //   });
  // });

  cleanContextMenu(menuItemIdNewTab, menuItemIdNewWindow, menuItemIdIncognitoWindow);

  createContextMenu(menuItemIdNewTab, 'Abrir link em nova guia');
  createContextMenu(menuItemIdNewWindow, 'Abrir link em nova janela');
  createContextMenu(menuItemIdIncognitoWindow, 'Abrir link em janela privada');

  createLinksListeners({
    newTab: menuItemIdNewTab,
    newWindow: menuItemIdNewWindow,
    incognitoWindow: menuItemIdIncognitoWindow,
  });
}

// Remove os itens de menu existentes
function cleanContextMenu(...menuItens) {
  menuItens.forEach((id) => {
    chrome.contextMenus.remove(id, () => {
      if (chrome.runtime.lastError) {
        console.log(`Item de menu ${id} não existe, criando um novo.`);
      }
    });
  });
}

// Abre um link em uma nova aba
function openLinkInNewTab(url) {
  chrome.tabs.create({ url });
}

function createContextMenu(id, title) {
  chrome.contextMenus.create({
    id: id,
    title: `[CLICK SAFE] ${title}`,
    contexts: ['link'],
  });
}

function openLinkWindow(url, incognito = false, type = 'normal') {
  chrome.windows.create({ url, type, incognito });
}

function createLinksListeners(menuItems) {
  const actions = {
    [menuItems.newTab]: (url) => openLinkInNewTab(url),
    [menuItems.newWindow]: (url) => openLinkWindow(url),
    [menuItems.incognitoWindow]: (url) => openLinkWindow(url, true),
  };

  chrome.contextMenus.onClicked.addListener((info) => {
    const action = actions[info.menuItemId];
    if (action && info.linkUrl) {
      action(info.linkUrl);
    }
  });
}

// async function isCurrentWindowInBloquedList() {
//   let response = false;
//   await chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
//     try {
//       const domain = extractDomain(tab);
//       chrome.storage.sync.get('blockedSites', ({ blockedSites = [] }) => {
//         response = blockedSites.includes(domain);
//       });
//     } catch (error) {
//       console.log(error);
//     }
//   });

//   return response;
// }

// function listenForContextUpdates() {
//   chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
//     if (changeInfo.status === 'complete') {
//       isCurrentWindowInBloquedList() ? initializeContextMenu() : chrome.contextMenus.removeAll();
//     }
//   });
// }
