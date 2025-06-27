// tests/html-i18n.test.js - Tests pour vérifier l'internationalisation dans les fichiers HTML

// Nécessaire pour JSDOM sur Node.js
if (typeof TextEncoder === 'undefined') {
  global.TextEncoder = require('util').TextEncoder;
  global.TextDecoder = require('util').TextDecoder;
}

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('Internationalization in HTML files', () => {
  // Fonction utilitaire pour charger un fichier HTML
  function loadHtml(filename) {
    const filePath = path.join(__dirname, '..', filename);
    const html = fs.readFileSync(filePath, 'utf8');
    return new JSDOM(html);
  }

  test('options.html devrait avoir au moins quelques attributs data-i18n', () => {
    const dom = loadHtml('options.html');
    const document = dom.window.document;
    
    // Vérifier que le document a des éléments avec data-i18n
    const i18nElements = document.querySelectorAll('[data-i18n]');
    expect(i18nElements.length).toBeGreaterThan(0);
    
    // Vérifier que le titre a l'attribut data-i18n
    const title = document.querySelector('title');
    expect(title).not.toBeNull();
    expect(title.hasAttribute('data-i18n')).toBe(true);
  });

  test('privacy-policy.html devrait avoir les attributs data-i18n de base', () => {
    const dom = loadHtml('privacy-policy.html');
    const document = dom.window.document;
    
    // Vérifier que le document a des éléments avec data-i18n
    const i18nElements = document.querySelectorAll('[data-i18n]');
    expect(i18nElements.length).toBeGreaterThan(0);
    
    // Vérifier que le titre a l'attribut data-i18n
    const title = document.querySelector('title');
    expect(title).not.toBeNull();
    expect(title.hasAttribute('data-i18n')).toBe(true);
    
    // Vérifier que le titre de la page a un attribut data-i18n
    const h1 = document.querySelector('h1');
    expect(h1).not.toBeNull();
    expect(h1.hasAttribute('data-i18n')).toBe(true);
  });

  test('Tous les fichiers HTML devraient charger le script i18n.js', () => {
    const optionsDom = loadHtml('options.html');
    const privacyDom = loadHtml('privacy-policy.html');
    
    // Vérifier que i18n.js est chargé
    const optionsScripts = optionsDom.window.document.querySelectorAll('script');
    const privacyScripts = privacyDom.window.document.querySelectorAll('script');
    
    const hasI18nScript = (scripts) => {
      return Array.from(scripts).some(script => {
        const src = script.getAttribute('src');
        return src && src.includes('i18n.js');
      });
    };
    
    expect(hasI18nScript(optionsScripts)).toBe(true);
    expect(hasI18nScript(privacyScripts)).toBe(true);
  });
});
