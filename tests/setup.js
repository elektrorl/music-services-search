// tests/setup.js - Configuration pour les tests Jest

// Importation des mocks pour l'API Chrome
const chrome = require('jest-chrome');

// Configuration globale pour les tests
global.chrome = chrome;

// Mock des fonctions internationales
chrome.i18n = {
  getMessage: jest.fn((key) => {
    const messages = {
      extensionName: 'Music Services Search',
      searchOnSpotify: 'Rechercher sur Spotify',
      searchOnYoutube: 'Rechercher sur YouTube',
      searchOnYoutubeMusic: 'Rechercher sur YouTube Music',
      searchOnBandcamp: 'Rechercher sur Bandcamp',
      optionsTitle: 'Options - Music Services Search',
      spotifyPreference: 'Préférence Spotify',
      spotifyWeb: 'Web (navigateur)',
      spotifyDesktop: 'Application',
      enabledServices: 'Services activés',
      saveOptions: 'Sauvegarder',
      optionsSaved: 'Options sauvegardées',
      privacyPolicy: 'Politique de confidentialité'
    };
    return messages[key] || `[${key}]`;
  })
};

// Mock des fonctions de stockage Chrome
chrome.storage = {
  sync: {
    get: jest.fn(),
    set: jest.fn()
  },
  onChanged: {
    addListener: jest.fn()
  }
};

// Mock des menus contextuels Chrome
chrome.contextMenus = {
  create: jest.fn(),
  removeAll: jest.fn(),
  onClicked: {
    addListener: jest.fn()
  }
};

// Mock des onglets Chrome
chrome.tabs = {
  create: jest.fn()
};

// Mock de runtime Chrome
chrome.runtime = {
  onInstalled: {
    addListener: jest.fn()
  },
  lastError: null
};

// Mock de console.error pour capturer les erreurs
global.console.error = jest.fn();

// Nettoyer les mocks entre les tests
beforeEach(() => {
  jest.clearAllMocks();
});
