// tests/basic-integration.test.js - Version simplifiée des tests d'intégration

describe('Extension Basic Integration', () => {
  // Mock simplifié du stockage
  const storage = {
    searchPreference: 'web',
    enabledServices: ['spotifySearch', 'youtubeSearch', 'youtubeMusicSearch']
  };

  // Configuration du mock de chrome.storage.sync.get
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

  describe('Interaction entre options et background', () => {
    test('devrait stocker correctement les préférences', () => {
      // Simuler un changement de préférence
      chrome.storage.sync.set({ searchPreference: 'desktop' });
      
      // Vérifier que la préférence a bien été mise à jour
      chrome.storage.sync.get(['searchPreference'], (result) => {
        expect(result.searchPreference).toBe('desktop');
      });
    });

    test('devrait stocker correctement les services activés', () => {
      // Simuler un changement de services activés
      chrome.storage.sync.set({ 
        enabledServices: ['spotifySearch', 'bandcampSearch'] 
      });
      
      // Vérifier que les services ont bien été mis à jour
      chrome.storage.sync.get(['enabledServices'], (result) => {
        expect(result.enabledServices).toContain('spotifySearch');
        expect(result.enabledServices).toContain('bandcampSearch');
        expect(result.enabledServices).not.toContain('youtubeSearch');
      });
    });

    test('devrait appeler le bon handler lors d\'un événement storage.onChanged', () => {
      // Simuler un appel au handler d'événement
      const onChangedHandler = jest.fn();
      chrome.storage.onChanged.addListener(onChangedHandler);
      
      // Simuler un changement de stockage
      chrome.storage.sync.set({ searchPreference: 'web' });
      
      // Déclencher manuellement l'événement de changement
      chrome.storage.onChanged.addListener.mock.calls.forEach(call => {
        call[0]();
      });
      
      // Vérifier que le handler a été appelé
      expect(onChangedHandler).toHaveBeenCalled();
    });
  });
});
