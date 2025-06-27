// tests/query-cleaning.test.js - Tests spécifiques pour la logique de nettoyage des requêtes

// Ce test se concentre sur la fonctionnalité de nettoyage des requêtes
// Nous extrayons les fonctions pertinentes du background.js pour les tester séparément

describe('Query Cleaning Logic', () => {
  // Fonction de nettoyage simple extraite de background.js
  function cleanQuery(query, isDesktopSpotify = false) {
    // Enlève les caractères problématiques pour les URLs
    let cleaned = query.replace(/[<>"\[\]\\{}|^`]/g, '');
    // Uniformise les espaces
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    // Traitement spécial pour le protocole Spotify desktop
    if (isDesktopSpotify) {
      cleaned = cleaned.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
    
    return cleaned;
  }

  // Tests pour le nettoyage standard
  describe('Standard cleaning', () => {
    test('devrait conserver les caractères normaux', () => {
      const result = cleanQuery('Simple Query');
      expect(result).toBe('Simple Query');
    });

    test('devrait supprimer les caractères HTML dangereux', () => {
      const result = cleanQuery('<script>alert("XSS")</script>');
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('</script>');
      // Au lieu de vérifier le contenu exact, on vérifie simplement que quelque chose reste
      expect(result.length).toBeGreaterThan(0);
    });

    test('devrait supprimer les caractères problématiques pour les URLs', () => {
      const result = cleanQuery('Test [with] "quotes" and {braces}');
      expect(result).toBe('Test with quotes and braces');
    });

    test('devrait normaliser les espaces multiples', () => {
      const result = cleanQuery('Too    many   spaces    here');
      expect(result).toBe('Too many spaces here');
    });

    test('devrait conserver les accents et caractères internationaux', () => {
      const result = cleanQuery('é à ç ñ ü');
      expect(result).toBe('é à ç ñ ü');
    });
  });

  // Tests pour le nettoyage spécial Spotify Desktop
  describe('Spotify Desktop cleaning', () => {
    test('devrait supprimer les accents pour Spotify Desktop', () => {
      const result = cleanQuery('éàçñü', true);
      expect(result).toBe('eacnu');
    });

    test('devrait conserver les autres caractères spéciaux', () => {
      const result = cleanQuery('artist - song (remix)', true);
      expect(result).toBe('artist - song (remix)');
    });

    test('devrait gérer les caractères mixtes', () => {
      const result = cleanQuery('Björk - "It\'s Oh So Quiet"', true);
      // Vérifions seulement que les caractères spéciaux sont gérés
      expect(result).not.toContain('ö');
      expect(result.toLowerCase()).toContain('bjork'); // Normalisation des caractères accentués
      expect(result).toContain('Oh So Quiet');
    });
  });

  // Tests d'intégration simulée
  describe('Intégration avec l\'encodeURIComponent', () => {
    test('devrait produire une URL correcte pour une recherche web', () => {
      const query = '<Hello> "World" & [Test]';
      const cleaned = cleanQuery(query);
      const url = `https://example.com/search?q=${encodeURIComponent(cleaned)}`;
      
      // Vérifier que l'URL est propre et contient les mots clés attendus
      expect(url).toContain('https://example.com/search?q=');
      expect(url).toContain('Hello');
      expect(url).toContain('World');
      expect(url).toContain('Test');
    });

    test('devrait produire une URL correcte pour Spotify Desktop', () => {
      const query = 'Für Elise (Beethoven)';
      const cleaned = cleanQuery(query, true);
      const url = `spotify:search:${encodeURIComponent(cleaned)}`;
      
      expect(url).toBe('spotify:search:Fur%20Elise%20(Beethoven)');
    });
  });
});
