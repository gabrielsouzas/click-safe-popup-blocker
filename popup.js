document.addEventListener('DOMContentLoaded', () => {
  const toggleBlockAllBtn = document.getElementById('toggle-block-all');
  const blockThisSiteBtn = document.getElementById('block-this-site');
  const viewBlockedSitesBtn = document.getElementById('view-blocked-sites');
  const blockedSitesList = document.getElementById('blocked-sites-list');
  const clearBlockedSitesList = document.getElementById('clear-blocked-sites');

  // Carrega o estado atual do bloqueio global
  chrome.storage.sync.get('blockAllSites', (data) => {
    const blockAllSites = data.blockAllSites || false;
    toggleBlockAllBtn.textContent = blockAllSites ? 'Desativar Bloqueio Global' : 'Ativar Bloqueio Global';
  });

  // Carrega o estado atual da aba aberta e verifica se ela está na lista de bloqueio
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = new URL(tabs[0].url);
    const domain = url.hostname;

    chrome.storage.sync.get('blockedSites', (data) => {
      let blockedSites = data.blockedSites || [];

      if (blockedSites.includes(domain)) {
        blockThisSiteBtn.innerText = `Remover Site da Lista de Bloqueio`;
      } else {
        blockThisSiteBtn.innerText = `Adicionar Site na Lista de Bloqueio`;
      }
    });
  });

  // Toggle do bloqueio global
  toggleBlockAllBtn.addEventListener('click', () => {
    chrome.storage.sync.get('blockAllSites', (data) => {
      const newStatus = !data.blockAllSites;
      chrome.storage.sync.set({ blockAllSites: newStatus });
      toggleBlockAllBtn.textContent = newStatus ? 'Desativar Bloqueio Global' : 'Ativar Bloqueio Global';
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
          blockThisSiteBtn.innerText = `Remover Site da Lista de Bloqueio`;
          alert(`O site ${domain} foi adicionado na lista de bloqueio.`);
        } else {
          const newblockedSites = blockedSites.filter((item) => item !== domain);
          chrome.storage.sync.set({ blockedSites: newblockedSites });
          blockThisSiteBtn.innerText = `Adicionar Site na Lista de Bloqueio`;
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
    chrome.storage.sync.set({ blockedSites: [] });
    alert(`Lista de sites bloqueados limpa`);
    blockThisSiteBtn.innerText = `Adicionar Site na Lista de Bloqueio`;
    showBlockedSites();
  });

  // Método para mostrar a lista de sites bloqueados
  function showBlockedSites() {
    chrome.storage.sync.get('blockedSites', (data) => {
      const blockedSites = data.blockedSites || [];
      blockedSitesList.innerHTML = '';

      if (blockedSites.length > 0) {
        blockedSites.forEach((site) => {
          const listItem = document.createElement('div');
          listItem.textContent = site;
          blockedSitesList.appendChild(listItem);
        });
      } else {
        blockedSitesList.textContent = 'Nenhum site bloqueado.';
      }
    });
  }
});
