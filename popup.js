document.addEventListener('DOMContentLoaded', () => {
  const elements = {
    toggleBlockAllBtn: document.getElementById('toggle-block-all'),
    blockThisSiteBtn: document.getElementById('block-this-site'),
    viewBlockedSitesBtn: document.getElementById('view-blocked-sites'),
    blockedSitesList: document.getElementById('blocked-sites-list'),
    clearBlockedSitesList: document.getElementById('clear-blocked-sites'),
  };

  initUI();

  function initUI() {
    loadGlobalBlockState();
    updateBlockButtonForCurrentTab();
    elements.toggleBlockAllBtn.addEventListener('click', toggleGlobalBlock);
    elements.blockThisSiteBtn.addEventListener('click', toggleCurrentSiteBlock);
    elements.viewBlockedSitesBtn.addEventListener('click', displayBlockedSites);
    elements.clearBlockedSitesList.addEventListener('click', clearBlockedSites);
  }

  function loadGlobalBlockState() {
    chrome.storage.sync.get('blockAllSites', ({ blockAllSites = false }) => {
      updateButtonIcon(
        elements.toggleBlockAllBtn,
        blockAllSites,
        'shield_unlock',
        'Desativar Bloqueio Global',
        'shield_lock',
        'Ativar Bloqueio Global'
      );
    });
  }

  function updateButtonIcon(button, condition, trueIcon, trueText, falseIcon, falseText) {
    button.innerHTML = condition ? createIcon(trueIcon, trueText) : createIcon(falseIcon, falseText);
  }

  function createIcon(icon, msg) {
    return `<img src="icons/${icon}.svg" alt="Ícone ${icon}" width="32" height="32" /> ${msg}`;
  }

  function updateBlockButtonForCurrentTab() {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      const domain = new URL(tab.url).hostname;
      chrome.storage.sync.get('blockedSites', ({ blockedSites = [] }) => {
        updateButtonIcon(
          elements.blockThisSiteBtn,
          blockedSites.includes(domain),
          'shield_remove',
          'Remover Site da Lista de Bloqueio',
          'shield_add',
          'Adicionar Site na Lista de Bloqueio'
        );
      });
    });
  }

  function toggleGlobalBlock() {
    chrome.storage.sync.get('blockAllSites', ({ blockAllSites }) => {
      const newStatus = !blockAllSites;
      chrome.storage.sync.set({ blockAllSites: newStatus }, () => {
        updateButtonIcon(
          elements.toggleBlockAllBtn,
          newStatus,
          'shield_unlock',
          'Desativar Bloqueio Global',
          'shield_lock',
          'Ativar Bloqueio Global'
        );
      });
    });
  }

  function toggleCurrentSiteBlock() {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      const domain = new URL(tab.url).hostname;
      chrome.storage.sync.get('blockedSites', ({ blockedSites = [] }) => {
        const isBlocked = blockedSites.includes(domain);
        const updatedSites = isBlocked ? blockedSites.filter((site) => site !== domain) : [...blockedSites, domain];

        chrome.storage.sync.set({ blockedSites: updatedSites }, () => {
          updateBlockButtonForCurrentTab();
          alert(`O site ${domain} foi ${isBlocked ? 'removido' : 'adicionado'} na lista de bloqueio.`);
          displayBlockedSites();
        });
      });
    });
  }

  function displayBlockedSites() {
    chrome.storage.sync.get('blockedSites', ({ blockedSites = [] }) => {
      elements.blockedSitesList.classList.remove('inactive');
      elements.blockedSitesList.innerHTML = '';

      if (blockedSites.length === 0) {
        elements.blockedSitesList.textContent = 'Nenhum site bloqueado.';
        return;
      }

      blockedSites.forEach((site) => {
        const listItem = document.createElement('div');
        listItem.classList.add('list-item');

        const text = document.createElement('span');
        text.textContent = site;

        const btnDelete = document.createElement('button');
        btnDelete.classList.add('delete');
        btnDelete.id = site;
        btnDelete.addEventListener('click', () => confirmSiteRemoval(site));

        listItem.append(text, btnDelete);
        elements.blockedSitesList.appendChild(listItem);
      });
    });
  }

  function confirmSiteRemoval(domain) {
    if (confirm(`Confirma a exclusão do site [${domain}] da lista de bloqueio?`)) {
      removeSiteFromBlockedList(domain);
    }
  }

  function removeSiteFromBlockedList(domain) {
    chrome.storage.sync.get('blockedSites', ({ blockedSites = [] }) => {
      const updatedSites = blockedSites.filter((site) => site !== domain);
      chrome.storage.sync.set({ blockedSites: updatedSites }, () => {
        updateBlockButtonForCurrentTab();
        displayBlockedSites();
      });
    });
  }

  function clearBlockedSites() {
    if (confirm('Confirma a limpeza da lista de bloqueio?')) {
      chrome.storage.sync.set({ blockedSites: [] }, () => {
        updateBlockButtonForCurrentTab();
        displayBlockedSites();
      });
    }
  }
});
