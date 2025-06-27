// tests/integration.test.js - Tests d'intégration pour l'extension

// Ce test simule le fonctionnement global de l'extension
// en testant l'interaction entre les différents composants

const fs = require('fs');
const path = require('path');

// Fonction pour simuler le chargement de l'extension complète
function mockFullExtension() {
  // Création d'un DOM minimal pour le test
  document.body.innerHTML = `
    <div id="options-page">
      <input type="radio" name="searchPreference" id="spotifyWeb" value="web">
      <input type="radio" name="searchPreference" id="spotifyDesktop" value="desktop">
      <div id="services">
        <input type="checkbox" name="service" id="spotifySearch" value="spotifySearch">
        <input type="checkbox" name="service" id="youtubeSearch" value="youtubeSearch">
        <input type="checkbox" name="service" id="youtubeMusicSearch" value="youtubeMusicSearch">
        <input type="checkbox" name="service" id="bandcampSearch" value="bandcampSearch">
      </div>
      <div id="email"></div>
    </div>
  `;

  // Simuler le stockage
  const storage = {
    searchPreference: 'web',
    enabledServices: ['spotifySearch', 'youtubeSearch', 'youtubeMusicSearch']
  };

  // Mock de chrome.storage.sync.get pour renvoyer notre stockage
  chrome.storage.sync.get.mockImplementation((keys, callback) => {
    const result = {};
    if (Array.isArray(keys)) {
      keys.forEach(key => {
        if (storage[key] !== undefined) {
          result[key] = storage[key];
        }
      });
    } else if (typeof keys === 'string') {
      if (storage[keys] !== undefined) {
        result[keys] = storage[keys];
      }
    } else if (typeof keys === 'object') {
      Object.keys(keys).forEach(key => {
        result[key] = storage[key] !== undefined ? storage[key] : keys[key];
      });
    }
    callback(result);
  });

  // Mock de chrome.storage.sync.set pour mettre à jour notre stockage
  chrome.storage.sync.set.mockImplementation((items, callback) => {
    Object.assign(storage, items);
    if (callback) callback();
  });
}

describe('Extension Integration', () => {
  // Configuration avant chaque test
  beforeEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
    mockFullExtension();
  });

  describe('Workflow de l\'extension', () => {
    // Test simulant le chargement initial et la modification des options
    test('devrait charger les préférences et mettre à jour les menus contextuel', () => {
      // Charger options.js
      const optionsPath = path.join(__dirname, '..', 'options.js');
      const optionsCode = fs.readFileSync(optionsPath, 'utf8');
      eval(optionsCode);

      // Simuler DOMContentLoaded
      document.dispatchEvent(new Event('DOMContentLoaded'));

      // Vérifier que les bonnes options sont sélectionnées
      expect(document.getElementById('spotifyWeb').checked).toBe(true);
      expect(document.getElementById('spotifySearch').checked).toBe(true);
      expect(document.getElementById('youtubeSearch').checked).toBe(true);
      expect(document.getElementById('youtubeMusicSearch').checked).toBe(true);
      expect(document.getElementById('bandcampSearch').checked).toBe(false);

      // Charger background.js
      const backgroundPath = path.join(__dirname, '..', 'background.js');
      const backgroundCode = fs.readFileSync(backgroundPath, 'utf8');
      eval(backgroundCode);

      // Vérifier que les menus contextuels sont créés avec les services activés
      const removeAllCallback = chrome.contextMenus.removeAll.mock.calls[0][0];
      removeAllCallback();

      // Nombre de menus créés devrait être égal au nombre de services activés
      expect(chrome.contextMenus.create).toHaveBeenCalledTimes(3);
      
      // Changer une préférence
      document.getElementById('spotifyDesktop').checked = true;
      document.getElementById('spotifyDesktop').dispatchEvent(new Event('change'));

      // Vérifier que chrome.storage.sync.set a été appelé avec la nouvelle préférence
      expect(chrome.storage.sync.set).toHaveBeenCalledWith({
        searchPreference: 'desktop'
      });

      // Simuler le déclenchement de storage.onChanged
      const storageChangeHandler = chrome.storage.onChanged.addListener.mock.calls[0][0];
      storageChangeHandler();
      
      // Vérifier que les menus contextuels sont recréés
      expect(chrome.contextMenus.removeAll).toHaveBeenCalledTimes(2);
    });

    // Test simulant un clic sur un menu contextuel
    test('devrait ouvrir un onglet avec la bonne URL lors d\'un clic sur un menu', () => {
      // Charger background.js
      const backgroundPath = path.join(__dirname, '..', 'background.js');
      const backgroundCode = fs.readFileSync(backgroundPath, 'utf8');
      eval(backgroundCode);

      // Simuler un clic sur le menu contextuel
      const clickHandler = chrome.contextMenus.onClicked.addListener.mock.calls[0][0];
      clickHandler({ 
        menuItemId: 'youtubeSearch', 
        selectionText: 'Test integration'
      }, {});

      // Vérifier qu'un nouvel onglet est créé avec la bonne URL
      expect(chrome.tabs.create).toHaveBeenCalledWith(
        { url: 'https://www.youtube.com/results?search_query=Test%20integration' },
        expect.any(Function)
      );
    });

    // Test simulant un changement de service activé
    test('devrait mettre à jour les services activés et recréer les menus', () => {
      // Charger options.js et background.js
      const optionsPath = path.join(__dirname, '..', 'options.js');
      const optionsCode = fs.readFileSync(optionsPath, 'utf8');
      eval(optionsCode);
      
      const backgroundPath = path.join(__dirname, '..', 'background.js');
      const backgroundCode = fs.readFileSync(backgroundPath, 'utf8');
      eval(backgroundCode);

      // Simuler DOMContentLoaded
      document.dispatchEvent(new Event('DOMContentLoaded'));

      // Changer les services activés
      document.getElementById('spotifySearch').checked = false;
      document.getElementById('bandcampSearch').checked = true;
      
      // Déclencher le changement
      document.getElementById('spotifySearch').dispatchEvent(new Event('change'));

      // Vérifier que chrome.storage.sync.set a été appelé avec les nouveaux services
      expect(chrome.storage.sync.set).toHaveBeenCalledWith({
        enabledServices: ['youtubeSearch', 'youtubeMusicSearch', 'bandcampSearch']
      });

      // Simuler le déclenchement de storage.onChanged
      const storageChangeHandler = chrome.storage.onChanged.addListener.mock.calls[0][0];
      storageChangeHandler();
      
      // Vérifier que les menus contextuels sont recréés
      expect(chrome.contextMenus.removeAll).toHaveBeenCalledTimes(2);
    });
  });
});
