// tests/background.test.js - Tests pour background.js

// Importation du fichier à tester
// Note: Nous utilisons eval pour charger le fichier car il contient des références à l'API Chrome
// qui sont maintenant mockées par jest-chrome
const fs = require('fs');
const path = require('path');

// Fonction pour charger le code de background.js dans le contexte de test
function loadBackgroundJS() {
  const filePath = path.join(__dirname, '..', 'background.js');
  const code = fs.readFileSync(filePath, 'utf8');
  eval(code);
}

describe('Background Script', () => {
  // Avant chaque test, réinitialiser les mocks
  beforeEach(() => {
    jest.clearAllMocks();
    // Réinitialiser le runtime.lastError à null
    chrome.runtime.lastError = null;
  });

  describe('updateContextMenus', () => {
    test('devrait créer les menus contextuels pour tous les services activés', () => {
      // Configuration du mock pour chrome.storage.sync.get
      chrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback({
          enabledServices: ['spotifySearch', 'youtubeSearch'],
          searchPreference: 'web'
        });
      });

      // Chargement du script pour appeler updateContextMenus
      loadBackgroundJS();
      
      // Vérification que removeAll est appelé
      expect(chrome.contextMenus.removeAll).toHaveBeenCalled();

      // L'appel à removeAll exécute la fonction de rappel que nous devons capturer
      const removeAllCallback = chrome.contextMenus.removeAll.mock.calls[0][0];
      removeAllCallback();

      // Vérification que les menus contextuels sont créés
      expect(chrome.contextMenus.create).toHaveBeenCalledTimes(2); // Car 2 services sont activés
      
      // Vérifions les paramètres pour chaque menu créé
      const firstCall = chrome.contextMenus.create.mock.calls[0][0];
      expect(firstCall.id).toBe('spotifySearch');
      expect(firstCall.contexts).toContain('selection');

      const secondCall = chrome.contextMenus.create.mock.calls[1][0];
      expect(secondCall.id).toBe('youtubeSearch');
      expect(secondCall.contexts).toContain('selection');
    });

    test('devrait gérer les erreurs lors de la suppression des menus', () => {
      // Simuler une erreur dans removeAll
      chrome.runtime.lastError = { message: 'Error removing menus' };
      
      // Charger et exécuter le script
      loadBackgroundJS();
      
      // Exécuter la callback de removeAll
      const removeAllCallback = chrome.contextMenus.removeAll.mock.calls[0][0];
      removeAllCallback();
      
      // Vérifier que l'erreur est journalisée
      expect(console.error).toHaveBeenCalled();
      expect(chrome.contextMenus.create).not.toHaveBeenCalled();
    });
    
    test('devrait utiliser des valeurs par défaut si aucun paramètre stocké', () => {
      // Mock retournant un objet vide
      chrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback({});
      });
      
      // Charger et exécuter le script
      loadBackgroundJS();
      
      // Exécuter la callback de removeAll
      const removeAllCallback = chrome.contextMenus.removeAll.mock.calls[0][0];
      removeAllCallback();
      
      // Vérifier que tous les services par défaut sont créés
      expect(chrome.contextMenus.create).toHaveBeenCalledTimes(4); // Les 4 services par défaut
    });
  });

  describe('onClicked Listener', () => {
    beforeEach(() => {
      // Charger le script
      loadBackgroundJS();
    });

    test('devrait ouvrir un nouvel onglet avec la recherche Spotify Web', () => {
      // Configuration du mock pour chrome.storage.sync.get
      chrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback({
          searchPreference: 'web'
        });
      });

      // Simuler un clic sur le menu contextuel
      const clickHandler = chrome.contextMenus.onClicked.addListener.mock.calls[0][0];
      clickHandler({ menuItemId: 'spotifySearch', selectionText: 'test query' }, {});

      // Vérifier que chrome.tabs.create a été appelé avec la bonne URL
      expect(chrome.tabs.create).toHaveBeenCalledWith(
        { url: 'https://open.spotify.com/search/test%20query' },
        expect.any(Function)
      );
    });

    test('devrait ouvrir Spotify Desktop avec la recherche', () => {
      // Configuration du mock pour chrome.storage.sync.get
      chrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback({
          searchPreference: 'desktop'
        });
      });

      // Simuler un clic sur le menu contextuel
      const clickHandler = chrome.contextMenus.onClicked.addListener.mock.calls[0][0];
      clickHandler({ menuItemId: 'spotifySearch', selectionText: 'test query' }, {});

      // Vérifier que chrome.tabs.create a été appelé avec le protocole spotify:
      expect(chrome.tabs.create).toHaveBeenCalledWith(
        { url: 'spotify:search:test%20query' },
        expect.any(Function)
      );
    });

    test('devrait nettoyer correctement les requêtes avec caractères spéciaux', () => {
      // Configuration du mock pour chrome.storage.sync.get
      chrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback({
          searchPreference: 'web'
        });
      });

      // Simuler un clic avec texte contenant des caractères spéciaux
      const clickHandler = chrome.contextMenus.onClicked.addListener.mock.calls[0][0];
      clickHandler({ 
        menuItemId: 'youtubeSearch', 
        selectionText: 'test <script> alert("XSS")  </script> & query' 
      }, {});

      // Vérifier que les caractères problématiques sont nettoyés
      expect(chrome.tabs.create).toHaveBeenCalledWith(
        { url: 'https://www.youtube.com/results?search_query=test%20alert(%22XSS%22)%20%20%20%26%20query' },
        expect.any(Function)
      );
    });

    test('devrait ignorer les menuItemId invalides', () => {
      chrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback({});
      });

      const clickHandler = chrome.contextMenus.onClicked.addListener.mock.calls[0][0];
      clickHandler({ menuItemId: 'invalidMenu', selectionText: 'test' }, {});

      // Vérifier que chrome.tabs.create n'a pas été appelé
      expect(chrome.tabs.create).not.toHaveBeenCalled();
      // Vérifier que l'erreur est journalisée
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Event handlers', () => {
    test('devrait appeler updateContextMenus lors de l\'installation', () => {
      // Réinitialiser les mocks
      chrome.contextMenus.removeAll.mockClear();
      
      // Charger le script
      loadBackgroundJS();
      
      // Simuler l'événement d'installation
      const installHandler = chrome.runtime.onInstalled.addListener.mock.calls[0][0];
      installHandler();
      
      // Vérifier que updateContextMenus a été appelé (en vérifiant que removeAll a été appelé)
      expect(chrome.contextMenus.removeAll).toHaveBeenCalled();
    });
    
    test('devrait appeler updateContextMenus lors du changement de stockage', () => {
      // Réinitialiser les mocks
      chrome.contextMenus.removeAll.mockClear();
      
      // Charger le script
      loadBackgroundJS();
      
      // Simuler l'événement de changement de stockage
      const storageHandler = chrome.storage.onChanged.addListener.mock.calls[0][0];
      storageHandler();
      
      // Vérifier que updateContextMenus a été appelé (en vérifiant que removeAll a été appelé)
      expect(chrome.contextMenus.removeAll).toHaveBeenCalled();
    });
  });
});
