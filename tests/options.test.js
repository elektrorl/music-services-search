// tests/options.test.js - Tests pour options.js

// Comme pour background.js, nous chargeons le code avec eval pour utiliser les mocks
const fs = require('fs');
const path = require('path');

// Fonction pour charger le code de options.js dans le contexte de test
function loadOptionsJS() {
  const filePath = path.join(__dirname, '..', 'options.js');
  const code = fs.readFileSync(filePath, 'utf8');
  
  // Créer un environnement DOM minimal pour options.js
  document.body.innerHTML = `
    <div>
      <input type="radio" name="searchPreference" value="web" id="spotifyWeb">
      <input type="radio" name="searchPreference" value="desktop" id="spotifyDesktop">
      
      <input type="checkbox" name="service" value="spotifySearch" id="spotifySearch">
      <input type="checkbox" name="service" value="youtubeSearch" id="youtubeSearch">
      <input type="checkbox" name="service" value="youtubeMusicSearch" id="youtubeMusicSearch">
      <input type="checkbox" name="service" value="bandcampSearch" id="bandcampSearch">
      
      <div id="email"></div>
    </div>
  `;
  
  // Exécuter le code
  eval(code);
}

describe('Options Script', () => {
  beforeEach(() => {
    // Nettoyer le DOM et les mocks avant chaque test
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });
  
  describe('Chargement des préférences', () => {
    test('devrait définir les préférences par défaut si aucune n\'est stockée', () => {
      // Mock pour retourner un objet vide
      chrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback({});
      });
      
      loadOptionsJS();
      
      // Simuler l'événement DOMContentLoaded
      document.dispatchEvent(new Event('DOMContentLoaded'));
      
      // Vérifier que get a été appelé avec les bonnes clés
      expect(chrome.storage.sync.get).toHaveBeenCalledWith(
        ['searchPreference', 'enabledServices'],
        expect.any(Function)
      );
    });
    
    test('devrait définir les préférences stockées', () => {
      // Mock pour retourner des préférences spécifiques
      chrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback({
          searchPreference: 'desktop',
          enabledServices: ['spotifySearch', 'bandcampSearch']
        });
      });
      
      loadOptionsJS();
      
      // Simuler l'événement DOMContentLoaded
      document.dispatchEvent(new Event('DOMContentLoaded'));
      
      // Vérifier que les bonnes options sont sélectionnées
      setTimeout(() => {
        const spotifyDesktop = document.getElementById('spotifyDesktop');
        expect(spotifyDesktop.checked).toBe(true);
        
        const spotifySearch = document.getElementById('spotifySearch');
        expect(spotifySearch.checked).toBe(true);
        
        const youtubeSearch = document.getElementById('youtubeSearch');
        expect(youtubeSearch.checked).toBe(false);
        
        const bandcampSearch = document.getElementById('bandcampSearch');
        expect(bandcampSearch.checked).toBe(true);
      }, 0);
    });
  });
  
  describe('Mise à jour des préférences', () => {
    test('devrait enregistrer la préférence Spotify lorsqu\'elle change', () => {
      loadOptionsJS();
      
      // Simuler l'événement DOMContentLoaded
      document.dispatchEvent(new Event('DOMContentLoaded'));
      
      // Simuler un changement de préférence
      const spotifyDesktop = document.getElementById('spotifyDesktop');
      spotifyDesktop.checked = true;
      spotifyDesktop.dispatchEvent(new Event('change'));
      
      // Vérifier que set a été appelé avec la bonne valeur
      expect(chrome.storage.sync.set).toHaveBeenCalledWith({
        searchPreference: 'desktop'
      });
    });
    
    test('devrait enregistrer les services activés lorsqu\'ils changent', () => {
      loadOptionsJS();
      
      // Simuler l'événement DOMContentLoaded
      document.dispatchEvent(new Event('DOMContentLoaded'));
      
      // Simuler des changements de services activés
      const spotifySearch = document.getElementById('spotifySearch');
      const youtubeSearch = document.getElementById('youtubeSearch');
      
      spotifySearch.checked = true;
      youtubeSearch.checked = true;
      document.getElementById('youtubeMusicSearch').checked = false;
      document.getElementById('bandcampSearch').checked = false;
      
      // Déclencher un changement
      spotifySearch.dispatchEvent(new Event('change'));
      
      // Vérifier que set a été appelé avec les bonnes valeurs
      expect(chrome.storage.sync.set).toHaveBeenCalledWith({
        enabledServices: ['spotifySearch', 'youtubeSearch']
      });
    });
    
    test('devrait filtrer les valeurs de service non valides', () => {
      loadOptionsJS();
      
      // Simuler l'événement DOMContentLoaded
      document.dispatchEvent(new Event('DOMContentLoaded'));
      
      // Ajouter un service non valide au DOM
      const invalidService = document.createElement('input');
      invalidService.type = 'checkbox';
      invalidService.name = 'service';
      invalidService.value = 'invalidService';
      invalidService.checked = true;
      document.body.appendChild(invalidService);
      
      // Simuler un changement
      const spotifySearch = document.getElementById('spotifySearch');
      spotifySearch.checked = true;
      spotifySearch.dispatchEvent(new Event('change'));
      
      // Vérifier que le service non valide est filtré
      const setCall = chrome.storage.sync.set.mock.calls[0][0];
      expect(setCall.enabledServices).toContain('spotifySearch');
      expect(setCall.enabledServices).not.toContain('invalidService');
    });
  });
  
  describe('Protection de l\'email', () => {
    test('devrait obfusquer correctement l\'adresse email', () => {
      loadOptionsJS();
      
      // Simuler l'événement DOMContentLoaded
      document.dispatchEvent(new Event('DOMContentLoaded'));
      
      // Vérifier que l'élément email contient le lien protégé
      const emailElement = document.getElementById('email');
      expect(emailElement.innerHTML).toContain('elektrorl@gmail.com');
      expect(emailElement.innerHTML).toContain('mailto:');
    });
  });
});
