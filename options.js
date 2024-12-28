document.addEventListener('DOMContentLoaded', () => {
      const radios = document.querySelectorAll('input[name="searchPreference"]');
      const checkboxes = document.querySelectorAll('input[name="service"]');

      chrome.storage.sync.get(['searchPreference', 'enabledServices'], (data) => {
        const preference = data.searchPreference || 'web';
        const enabledServices = data.enabledServices || ['spotifySearch', 'youtubeSearch', 'youtubeMusicSearch', 'bandcampSearch'];

        radios.forEach(radio => {
          if (radio.value === preference) {
            radio.checked = true;
          }
        });

        checkboxes.forEach(checkbox => {
          if (enabledServices.includes(checkbox.value)) {
            checkbox.checked = true;
          }
        });
      });

      radios.forEach(radio => {
        radio.addEventListener('change', () => {
          chrome.storage.sync.set({ searchPreference: radio.value });
        });
      });

      checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
          const enabledServices = Array.from(checkboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);
          chrome.storage.sync.set({ enabledServices });
        });
      });
    });
