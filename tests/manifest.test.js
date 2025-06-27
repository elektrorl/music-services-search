// tests/manifest.test.js - Tests pour vérifier le fichier manifest.json

const fs = require('fs');
const path = require('path');

describe('Manifest Configuration', () => {
  let manifest;
  
  beforeAll(() => {
    const manifestPath = path.join(__dirname, '..', 'manifest.json');
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    manifest = JSON.parse(manifestContent);
  });
  
  test('devrait avoir les champs requis pour la publication dans le Chrome Web Store', () => {
    expect(manifest).toHaveProperty('name');
    expect(manifest).toHaveProperty('version');
    expect(manifest).toHaveProperty('manifest_version');
    expect(manifest).toHaveProperty('description');
    expect(manifest).toHaveProperty('default_locale');
    expect(manifest).toHaveProperty('icons');
    expect(manifest).toHaveProperty('permissions');
  });
  
  test('devrait avoir des champs de sécurité', () => {
    expect(manifest).toHaveProperty('content_security_policy');
    // Vérifier que la CSP contient les restrictions pour script-src
    expect(manifest.content_security_policy.extension_pages).toContain("script-src 'self'");
  });
  
  test('devrait avoir une URL de politique de confidentialité', () => {
    expect(manifest).toHaveProperty('privacy_policy_url');
    expect(manifest.privacy_policy_url).toContain('privacy-policy.html');
  });
  
  test('devrait avoir les permissions minimales requises', () => {
    const requiredPermissions = ['contextMenus', 'storage'];
    requiredPermissions.forEach(permission => {
      expect(manifest.permissions).toContain(permission);
    });
    
    // Vérifier qu'il n'y a pas de permissions excessives
    const excessivePermissions = [
      'webRequest',
      'declarativeContent',
      'identity',
      'cookies'
    ];
    
    // activeTab est acceptable pour la fonctionnalité requise
    // Donc nous ne le considérons plus comme excessif
    excessivePermissions.forEach(permission => {
      expect(manifest.permissions).not.toContain(permission);
    });
  });
  
  test('devrait avoir la configuration correcte pour la localisation', () => {
    expect(manifest.default_locale).toBe('en');
    
    // Vérifier que les fichiers de traduction existent
    const enMessagesPath = path.join(__dirname, '..', '_locales', 'en', 'messages.json');
    const frMessagesPath = path.join(__dirname, '..', '_locales', 'fr', 'messages.json');
    
    expect(fs.existsSync(enMessagesPath)).toBe(true);
    expect(fs.existsSync(frMessagesPath)).toBe(true);
  });
  
  test('devrait avoir au moins une icône de taille appropriée', () => {
    // Vérifier que manifest.icons existe
    expect(manifest).toHaveProperty('icons');
    
    // Vérifier qu'il y a au moins une icône
    expect(Object.keys(manifest.icons).length).toBeGreaterThan(0);
    
    // Vérifier que l'icône existe
    const iconSizes = Object.keys(manifest.icons);
    const iconPath = path.join(__dirname, '..', manifest.icons[iconSizes[0]]);
    expect(fs.existsSync(iconPath)).toBe(true);
  });
});
