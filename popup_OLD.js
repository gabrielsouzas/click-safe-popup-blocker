document.addEventListener('DOMContentLoaded', () => {
  const toggleBlockAllBtn = document.getElementById('toggle-block-all');
  const blockThisSiteBtn = document.getElementById('block-this-site');
  const viewBlockedSitesBtn = document.getElementById('view-blocked-sites');
  const blockedSitesList = document.getElementById('blocked-sites-list');
  const clearBlockedSitesList = document.getElementById('clear-blocked-sites');

  // Carrega o estado atual do bloqueio global
  chrome.storage.sync.get('blockAllSites', (data) => {
    const blockAllSites = data.blockAllSites || false;
    toggleBlockAllBtn.innerHTML = blockAllSites
      ? createIcon('shield_unlock', 'Desativar Bloqueio Global')
      : createIcon('shield_lock', 'Ativar Bloqueio Global');
  });

  function createIcon(icon, msg) {
    return `<img src="icons/${icon}.svg" alt="Ícone ${icon}" width="32" height="32" /> ${msg}`;
  }

  // Carrega o estado atual da aba aberta e verifica se ela está na lista de bloqueio
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = new URL(tabs[0].url);
    const domain = url.hostname;

    chrome.storage.sync.get('blockedSites', (data) => {
      let blockedSites = data.blockedSites || [];

      blockThisSiteBtn.innerHTML = blockedSites.includes(domain)
        ? createIcon('shield_remove', 'Remover Site da Lista de Bloqueio')
        : createIcon('shield_add', 'Adicionar Site na Lista de Bloqueio');
    });
  });

  // Toggle do bloqueio global
  toggleBlockAllBtn.addEventListener('click', () => {
    chrome.storage.sync.get('blockAllSites', (data) => {
      const newStatus = !data.blockAllSites;
      chrome.storage.sync.set({ blockAllSites: newStatus });
      toggleBlockAllBtn.innerHTML = newStatus
        ? createIcon('shield_unlock', 'Desativar Bloqueio Global')
        : createIcon('shield_lock', 'Ativar Bloqueio Global');
    });
  });

  // Adiciona o site atual à lista de bloqueio
  blockThisSiteBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = new URL(tabs[0].url);
      const domain = url.hostname;

      chrome.storage.sync.get('blockedSites', (data) => {
        let blockedSites = data.blockedSites || [];

        if (!blockedSites.includes(domain)) {
          blockedSites.push(domain);
          chrome.storage.sync.set({ blockedSites });
          blockThisSiteBtn.innerHTML = createIcon('shield_remove', 'Remover Site da Lista de Bloqueio');
          alert(`O site ${domain} foi adicionado na lista de bloqueio.`);
        } else {
          const newblockedSites = blockedSites.filter((item) => item !== domain);
          chrome.storage.sync.set({ blockedSites: newblockedSites });
          resetBtnBlockThisSite();
          alert(`O site ${domain} foi removido da lista de bloqueio.`);
        }

        showBlockedSites();
      });
    });
  });

  // Exibe a lista de sites bloqueados
  viewBlockedSitesBtn.addEventListener('click', () => {
    showBlockedSites();
  });

  // Limpa a lista de sites bloqueados
  clearBlockedSitesList.addEventListener('click', () => {
    const confirmResponse = confirm(`Confirma a limpeza da lista de bloqueio?`);
    if (confirmResponse) {
      chrome.storage.sync.set({ blockedSites: [] });
      // alert('Lista de sites bloqueados limpa');
      resetBtnBlockThisSite();
      showBlockedSites();
    }
  });

  // Método para mostrar a lista de sites bloqueados
  function showBlockedSites() {
    chrome.storage.sync.get('blockedSites', (data) => {
      blockedSitesList.classList.remove('inactive');
      const blockedSites = data.blockedSites || [];
      blockedSitesList.innerHTML = '';

      if (blockedSites.length > 0) {
        blockedSites.forEach((site) => {
          const listItem = document.createElement('div');
          listItem.classList.add('list-item');
          const text = document.createElement('span');
          text.textContent = site;
          const btnDelete = document.createElement('button');
          btnDelete.classList.add('delete');
          btnDelete.id = site;
          btnDelete.addEventListener('click', deleteBlockedSite);

          listItem.appendChild(text);
          listItem.appendChild(btnDelete);

          blockedSitesList.appendChild(listItem);
        });
      } else {
        blockedSitesList.textContent = 'Nenhum site bloqueado.';
      }
    });
  }

  // Método do botão para deletar um site bloqueado da lista
  function deleteBlockedSite({ target }) {
    const confirmResponse = confirm(`Confirma a exclusão do site [${target.id}] da lista de bloqueio?`);
    if (confirmResponse) {
      deleteFromBlockedSitesList(target.id);
    }
  }

  // Método para deletar um site da lista
  function deleteFromBlockedSitesList(domain) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = new URL(tabs[0].url);
      const actualDomain = url.hostname;

      chrome.storage.sync.get('blockedSites', (data) => {
        let blockedSites = data.blockedSites || [];

        const newblockedSites = blockedSites.filter((item) => item !== domain);
        chrome.storage.sync.set({ blockedSites: newblockedSites });
        if (actualDomain === domain) {
          resetBtnBlockThisSite();
        }
        // alert(`O site ${domain} foi removido da lista de bloqueio.`);

        showBlockedSites();
      });
    });
  }

  function resetBtnBlockThisSite() {
    blockThisSiteBtn.innerHTML = createIcon('shield_add', 'Adicionar Site na Lista de Bloqueio');
  }

  function removeMenuItem() {
    const menuItemId = 'openInNewTab';

    // Remova o item de menu existente com esse ID (se houver)
    chrome.contextMenus.remove(menuItemId, () => {
      if (chrome.runtime.lastError) {
        console.log('Item não existe.');
        return;
      }
    });
  }
});
