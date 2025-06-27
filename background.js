// Fonction de journalisation des erreurs
function logError(error, context = '') {
  console.error(
    `Music Services Search Error ${context ? `[${context}]` : ''}:`,
    error
  );
}

// Fonction principale pour mettre à jour les menus contextuels
function updateContextMenus() {
  chrome.contextMenus.removeAll(() => {
    if (chrome.runtime.lastError) {
      logError(chrome.runtime.lastError, 'removeAll');
      return;
    }

    chrome.storage.sync.get(['enabledServices', 'searchPreference'], (data) => {
      if (chrome.runtime.lastError) {
        logError(chrome.runtime.lastError, 'storage.sync.get');
        return;
      }

      const enabledServices = data.enabledServices || [
        'spotifySearch',
        'youtubeSearch',
        'youtubeMusicSearch',
        'bandcampSearch',
      ];
      const spotifyPreference = data.searchPreference || 'web';
      const contexts = ['selection'];
      const searchEngines = [
        {
          id: 'spotifySearch',
          title: chrome.i18n.getMessage('searchOnSpotify'),
          url:
            spotifyPreference === 'web'
              ? 'https://open.spotify.com/search/'
              : 'spotify:search:',
        },
        {
          id: 'youtubeSearch',
          title: chrome.i18n.getMessage('searchOnYoutube'),
          url: 'https://www.youtube.com/results?search_query=',
        },
        {
          id: 'youtubeMusicSearch',
          title: chrome.i18n.getMessage('searchOnYoutubeMusic'),
          url: 'https://music.youtube.com/search?q=',
        },
        {
          id: 'bandcampSearch',
          title: chrome.i18n.getMessage('searchOnBandcamp'),
          url: 'https://bandcamp.com/search?q=',
        },
      ];
      searchEngines.forEach((engine) => {
        if (enabledServices.includes(engine.id)) {
          try {
            chrome.contextMenus.create(
              {
                id: engine.id,
                title: `${engine.title}: '%s'`,
                contexts: contexts,
              },
              () => {
                if (chrome.runtime.lastError) {
                  logError(
                    chrome.runtime.lastError,
                    `create menu ${engine.id}`
                  );
                }
              }
            );
          } catch (err) {
            logError(err, `create menu error ${engine.id}`);
          }
        }
      });
    });
  });
}
// Gestion des erreurs pour les événements d'installation et de changement de stockage
chrome.runtime.onInstalled.addListener(() => {
  try {
    updateContextMenus();
  } catch (err) {
    logError(err, 'onInstalled');
  }
});

chrome.storage.onChanged.addListener(() => {
  try {
    updateContextMenus();
  } catch (err) {
    logError(err, 'onChanged');
  }
});
chrome.contextMenus.onClicked.addListener((info, tab) => {
  // Get the search preference first
  try {
    chrome.storage.sync.get(['searchPreference'], (data) => {
      if (chrome.runtime.lastError) {
        logError(chrome.runtime.lastError, 'onClicked storage.get');
        return;
      }

      const spotifyPreference = data.searchPreference || 'web';

      // Define search engines with dynamic Spotify URL based on preference
      const searchEngines = {
        spotifySearch:
          spotifyPreference === 'web'
            ? 'https://open.spotify.com/search/'
            : 'spotify:search:',
        youtubeSearch: 'https://www.youtube.com/results?search_query=',
        youtubeMusicSearch: 'https://music.youtube.com/search?q=',
        bandcampSearch: 'https://bandcamp.com/search?q=',
      };

      // Validation supplémentaire du menuItemId
      const validMenuIds = [
        'spotifySearch',
        'youtubeSearch',
        'youtubeMusicSearch',
        'bandcampSearch',
      ];
      if (!validMenuIds.includes(info.menuItemId)) {
        logError(
          new Error(`Menu item ID invalide: ${info.menuItemId}`),
          'security'
        );
        return;
      }

      const baseUrl = searchEngines[info.menuItemId];
      if (baseUrl) {
        let query = info.selectionText;

        // Amélioration du nettoyage des requêtes
        // Conserve les caractères accentués et les symboles courants dans les noms d'artistes/titres
        // Enlève uniquement les caractères vraiment problématiques pour les URLs
        query = query.replace(/[<>"\[\]\\{}|^`]/g, ''); // Enlève les caractères problématiques pour les URLs
        query = query.replace(/\s+/g, ' ').trim(); // Uniformise les espaces

        // Pour le protocole Spotify desktop, utiliser une méthode de nettoyage plus stricte
        if (
          info.menuItemId === 'spotifySearch' &&
          spotifyPreference === 'desktop'
        ) {
          // Le protocole Spotify est plus sensible aux caractères spéciaux
          query = query.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // Remplace les accents
        }

        const searchUrl = `${baseUrl}${encodeURIComponent(query)}`;

        // Création d'un nouvel onglet avec gestion d'erreurs
        try {
          chrome.tabs.create({ url: searchUrl }, (tab) => {
            if (chrome.runtime.lastError) {
              logError(chrome.runtime.lastError, 'tabs.create');
            }
          });
        } catch (err) {
          logError(err, 'tabs.create exception');
        }
      }
    });
  } catch (err) {
    logError(err, 'onClicked exception');
  }
});
