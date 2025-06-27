// tests/i18n.test.js - Tests pour i18n.js

// Comme pour les autres tests, nous utilisons eval
const fs = require('fs');
const path = require('path');

// Fonction pour charger le code de i18n.js dans le contexte de test
function loadI18nJS() {
  const filePath = path.join(__dirname, '..', 'i18n.js');
  const code = fs.readFileSync(filePath, 'utf8');
  
  // Exécuter le code
  eval(code);
}

describe('i18n Script', () => {
  // Configuration avant chaque test
  beforeEach(() => {
    // Nettoyer le DOM et les mocks
    document.body.innerHTML = '';
    jest.clearAllMocks();

    // Mock de getMessage pour renvoyer des clés préfixées pour les tests
    chrome.i18n.getMessage.mockImplementation((key) => `i18n_${key}`);
  });

  describe('Localisation des éléments', () => {
    test('devrait localiser les éléments texte avec attribut data-i18n', () => {
      // Créer des éléments de test
      document.body.innerHTML = `
        <h1 data-i18n="title">Default Title</h1>
        <p data-i18n="description">Default Description</p>
        <span data-i18n="greeting">Default Greeting</span>
      `;

      // Charger le script et déclencher DOMContentLoaded
      loadI18nJS();
      document.dispatchEvent(new Event('DOMContentLoaded'));

      // Vérifier que les textes ont été mis à jour
      expect(document.querySelector('h1').textContent).toBe('i18n_title');
      expect(document.querySelector('p').textContent).toBe('i18n_description');
      expect(document.querySelector('span').textContent).toBe('i18n_greeting');
    });

    test('devrait gérer différents types d\'éléments', () => {
      // Créer des éléments de différents types
      document.body.innerHTML = `
        <title data-i18n="pageTitle">Default Title</title>
        <img src="test.png" alt="Default Alt" data-i18n="imgAlt">
        <input type="text" placeholder="Default Placeholder" data-i18n="inputPlaceholder" type="placeholder">
        <button data-i18n="buttonText">Default Button</button>
        <label data-i18n="labelText">Default Label</label>
      `;

      // Charger le script et déclencher DOMContentLoaded
      loadI18nJS();
      document.dispatchEvent(new Event('DOMContentLoaded'));

      // Vérifier les éléments spéciaux
      expect(document.querySelector('title').textContent).toBe('i18n_pageTitle');
      expect(document.querySelector('img').alt).toBe('i18n_imgAlt');
      expect(document.querySelector('button').textContent).toBe('i18n_buttonText');
      expect(document.querySelector('label').textContent).toBe('i18n_labelText');
    });

    test('devrait localiser le titre du document', () => {
      // Créer un titre de document
      document.head.innerHTML = `<title data-i18n="pageTitle">Default Page Title</title>`;

      // Charger le script et déclencher DOMContentLoaded
      loadI18nJS();
      document.dispatchEvent(new Event('DOMContentLoaded'));

      // Vérifier que le titre du document a été mis à jour
      expect(document.title).toBe('i18n_pageTitle');
    });

    test('ne devrait pas planter si getMessage retourne null', () => {
      // Configurer le mock pour retourner null pour une clé spécifique
      chrome.i18n.getMessage.mockImplementation((key) => {
        if (key === 'missingKey') return null;
        return `i18n_${key}`;
      });

      document.body.innerHTML = `
        <p data-i18n="missingKey">Default Text</p>
        <p data-i18n="existingKey">Other Default</p>
      `;

      // Charger le script et déclencher DOMContentLoaded
      loadI18nJS();
      document.dispatchEvent(new Event('DOMContentLoaded'));

      // Vérifier que le texte par défaut est conservé pour la clé manquante
      expect(document.querySelectorAll('p')[0].textContent).toBe('Default Text');
      expect(document.querySelectorAll('p')[1].textContent).toBe('i18n_existingKey');
    });

    test('devrait gérer les erreurs sans planter', () => {
      // Créer un élément qui va provoquer une erreur
      const invalidElement = document.createElement('custom-element');
      invalidElement.setAttribute('data-i18n', 'customKey');
      
      // Simuler une erreur lors de la définition du textContent
      Object.defineProperty(invalidElement, 'textContent', {
        set: () => {
          throw new Error('Cannot set textContent');
        }
      });
      
      document.body.appendChild(invalidElement);

      // Espionner console.error
      const consoleErrorSpy = jest.spyOn(console, 'error');
      
      // Charger le script et déclencher DOMContentLoaded
      loadI18nJS();
      document.dispatchEvent(new Event('DOMContentLoaded'));

      // Vérifier que l'erreur a été journalisée
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });
});
