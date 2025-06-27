// tests/locales.test.js - Tests pour vérifier les fichiers de localisation

const fs = require('fs');
const path = require('path');

describe('Localization Files', () => {
  let enMessages;
  let frMessages;
  
  beforeAll(() => {
    const enPath = path.join(__dirname, '..', '_locales', 'en', 'messages.json');
    const frPath = path.join(__dirname, '..', '_locales', 'fr', 'messages.json');
    
    enMessages = JSON.parse(fs.readFileSync(enPath, 'utf8'));
    frMessages = JSON.parse(fs.readFileSync(frPath, 'utf8'));
  });
  
  test('la locale anglaise devrait avoir toutes les chaînes nécessaires', () => {
    // Liste des clés de traduction essentielles
    const essentialKeys = [
      'extensionName',
      'extensionDescription',
      'searchOnSpotify',
      'searchOnYoutube',
      'searchOnYoutubeMusic',
      'searchOnBandcamp',
      'optionsTitle',
      'spotifyPreferences',  // Notez le pluriel ici, au lieu de spotifyPreference
      'webPlayer',           // Au lieu de spotifyWeb
      'desktopApp',          // Au lieu de spotifyDesktop
      'enableServices',      // Au lieu de enabledServices
      'privacyPolicy',
      'privacyPolicyTitle',
      'privacyPolicyHeader'
    ];
    
    essentialKeys.forEach(key => {
      expect(enMessages).toHaveProperty(key);
      expect(enMessages[key]).toHaveProperty('message');
      expect(enMessages[key].message).not.toBe('');
    });
  });
  
  test('la locale française devrait avoir toutes les chaînes nécessaires', () => {
    // Vérifier que toutes les clés en anglais ont une correspondance en français
    Object.keys(enMessages).forEach(key => {
      expect(frMessages).toHaveProperty(key);
      expect(frMessages[key]).toHaveProperty('message');
      expect(frMessages[key].message).not.toBe('');
    });
  });
  
  test('les deux fichiers de localisation devraient avoir le même nombre de chaînes', () => {
    expect(Object.keys(enMessages).length).toBe(Object.keys(frMessages).length);
  });
  
  test('les placeholders devraient être cohérents entre les locales', () => {
    Object.keys(enMessages).forEach(key => {
      // Si la chaîne anglaise contient un placeholder ($1, $2, etc.)
      const enMessage = enMessages[key].message;
      const frMessage = frMessages[key].message;
      
      // Extraire tous les placeholders comme $1, $2, etc.
      const enPlaceholders = enMessage.match(/\$\d+/g) || [];
      const frPlaceholders = frMessage.match(/\$\d+/g) || [];
      
      // Vérifier que les mêmes placeholders sont présents dans les deux versions
      expect(enPlaceholders.sort()).toEqual(frPlaceholders.sort());
    });
  });
  
  test('devrait avoir des descriptions pour les traducteurs', () => {
    // Vérifier qu'au moins certaines chaînes ont des descriptions pour aider les traducteurs
    const keysWithDescriptions = Object.keys(enMessages).filter(key => 
      enMessages[key].hasOwnProperty('description')
    );
    
    // S'attendre à ce qu'au moins quelques chaînes aient des descriptions
    expect(keysWithDescriptions.length).toBeGreaterThan(5);
  });
});
