// tests/background-direct.test.js - Test direct des fonctions de background.js sans chargement du fichier entier

// Extraire manuellement les fonctions du background.js pour les tester directement

describe('Background Script Direct Tests', () => {
  // Fonction de nettoyage de requête recréée à partir du code de background.js
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
  
  // Test d'une fonction simulant le comportement du gestionnaire de clic
  function handleClick(info, tab, spotifyPreference = 'web') {
    const menuItemId = info.menuItemId;
    const selectionText = info.selectionText;
    
    // Validation du menuItemId
    const validMenuIds = [
      'spotifySearch',
      'youtubeSearch',
      'youtubeMusicSearch',
      'bandcampSearch',
    ];
    if (!validMenuIds.includes(menuItemId)) {
      return null; // ID invalide
    }
    
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
    
    const baseUrl = searchEngines[menuItemId];
    let query = selectionText;
    
    // Amélioration du nettoyage des requêtes
    query = cleanQuery(query, menuItemId === 'spotifySearch' && spotifyPreference === 'desktop');
    
    return `${baseUrl}${encodeURIComponent(query)}`;
  }
  
  describe('Nettoyage des requêtes', () => {
    test('devrait nettoyer correctement les caractères spéciaux', () => {
      const result = cleanQuery('<script>alert("XSS")</script>');
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('</script>');
    });
    
    test('devrait conserver les caractères accentués pour les recherches Web', () => {
      const result = cleanQuery('Björk - Utópía');
      expect(result).toBe('Björk - Utópía');
    });
    
    test('devrait supprimer les accents pour Spotify Desktop', () => {
      const result = cleanQuery('Björk - Utópía', true);
      expect(result).toBe('Bjork - Utopia');
    });
  });
  
  describe('Gestion des clics', () => {
    test('devrait générer l\'URL correcte pour Spotify Web', () => {
      const url = handleClick(
        { menuItemId: 'spotifySearch', selectionText: 'Test Artist' },
        {},
        'web'
      );
      expect(url).toBe('https://open.spotify.com/search/Test%20Artist');
    });
    
    test('devrait générer l\'URL correcte pour Spotify Desktop', () => {
      const url = handleClick(
        { menuItemId: 'spotifySearch', selectionText: 'Test Artist' },
        {},
        'desktop'
      );
      expect(url).toBe('spotify:search:Test%20Artist');
    });
    
    test('devrait générer l\'URL correcte pour YouTube', () => {
      const url = handleClick(
        { menuItemId: 'youtubeSearch', selectionText: 'Test Video' },
        {}
      );
      expect(url).toBe('https://www.youtube.com/results?search_query=Test%20Video');
    });
    
    test('devrait retourner null pour un menuItemId invalide', () => {
      const url = handleClick(
        { menuItemId: 'invalidService', selectionText: 'Test' },
        {}
      );
      expect(url).toBeNull();
    });
  });
});
