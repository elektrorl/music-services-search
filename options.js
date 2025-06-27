document.addEventListener('DOMContentLoaded', () => {
  const radios = document.querySelectorAll('input[name="searchPreference"]');
  const checkboxes = document.querySelectorAll('input[name="service"]');

  // Load saved preferences
  chrome.storage.sync.get(['searchPreference', 'enabledServices'], (data) => {
    const preference = data.searchPreference || 'web';
    const enabledServices = data.enabledServices || [
      'spotifySearch',
      'youtubeSearch',
      'youtubeMusicSearch',
      'bandcampSearch',
    ];

    // Set initial state of radio buttons
    radios.forEach((radio) => {
      if (radio.value === preference) {
        radio.checked = true;
      }
    });

    // Set initial state of checkboxes
    checkboxes.forEach((checkbox) => {
      if (enabledServices.includes(checkbox.value)) {
        checkbox.checked = true;
      }
    });
  });

  // Handle radio button changes
  radios.forEach((radio) => {
    radio.addEventListener('change', () => {
      // Validation des valeurs acceptables
      if (radio.value === 'web' || radio.value === 'desktop') {
        chrome.storage.sync.set({ searchPreference: radio.value });
      } else {
        console.error('Valeur de préférence invalide détectée:', radio.value);
      }
    });
  });

  // Handle checkbox changes
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      // Validation des valeurs de services acceptables
      const validServiceIds = [
        'spotifySearch',
        'youtubeSearch',
        'youtubeMusicSearch',
        'bandcampSearch',
      ];

      const enabledServices = Array.from(checkboxes)
        .filter((checkbox) => checkbox.checked)
        .map((checkbox) => checkbox.value)
        .filter((value) => validServiceIds.includes(value));

      chrome.storage.sync.set({ enabledServices });
    });
  });

  // Email obfuscation logic
  const emailElement = document.getElementById('email');
  const emailUser = 'elektrorl';
  const emailDomain = 'gmail.com';
  const email = `${emailUser}@${emailDomain}`;
  emailElement.innerHTML = `<a href="mailto:${email}">${email}</a>`;
});
