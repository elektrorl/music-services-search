// popup.js - Gestion des options dans le popup

document.addEventListener('DOMContentLoaded', () => {
  const serviceToggles = document.querySelectorAll(
    '.toggle:not(.preference-toggle) input[type="checkbox"]'
  );
  const preferenceToggles = document.querySelectorAll(
    '.preference-toggle input[type="checkbox"]'
  );

  // Fonction pour appliquer les règles typographiques françaises
  function applyFrenchTypography(text) {
    // Vérifier si l'interface est en français
    if (chrome.i18n.getUILanguage().startsWith('fr')) {
      // Ajouter des espaces insécables avant la ponctuation double
      return text
        .replace(/\s*([!?:;])/g, '\u202F$1') // Pour : ; ! ?
        .replace(/«\s*/g, '« ') // Guillemet ouvrant
        .replace(/\s*»/g, '\u202F»'); // Guillemet fermant
    }
    return text;
  }

  // Fonction pour afficher un feedback visuel lors de la sauvegarde
  function showSaveFeedback(targetEl) {
    // Identifier l'élément cible (toggle ou radio qui a changé)
    const target = targetEl || document.activeElement || document.body;

    // Créer une notification de sauvegarde élégante
    const saveNotification = document.createElement('div');
    saveNotification.className = 'save-notification';

    // Récupérer et traiter le message i18n avec règles typographiques
    const savedMessage = applyFrenchTypography(
      chrome.i18n.getMessage('optionsSaved') || 'Preferences saved'
    );

    saveNotification.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="currentColor"/>
      </svg>
      <span>${savedMessage}</span>
    `;

    // Ajouter au document avec une position fixe
    document.body.appendChild(saveNotification);

    // Créer un effet de pulsation sur l'élément parent
    const panel = target.closest('.panel');
    if (panel) {
      panel.style.transition = 'box-shadow 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
      panel.style.boxShadow = '0 0 0 1px var(--accent-color)';

      // Réinitialiser après l'animation
      setTimeout(() => {
        panel.style.boxShadow = '';
      }, 800);
    }

    // Créer aussi un flash d'accent sur le conteneur principal
    const flashOverlay = document.createElement('div');
    flashOverlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: var(--accent-color);
      opacity: 0.08;
      pointer-events: none;
      z-index: 10;
      border-radius: var(--border-radius);
    `;
    document.querySelector('.container').appendChild(flashOverlay);

    // Afficher avec animation
    setTimeout(() => {
      saveNotification.classList.add('show');

      // Animation pour le flash - effet de pulse au lieu de fade simple
      flashOverlay.animate(
        [
          { opacity: 0.08, transform: 'scale(0.998)' },
          { opacity: 0.05, transform: 'scale(1.001)' },
          { opacity: 0 },
        ],
        {
          duration: 700,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        }
      );
    }, 10);

    // Masquer et supprimer après un délai
    setTimeout(() => {
      saveNotification.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(saveNotification);
        if (document.querySelector('.container').contains(flashOverlay)) {
          document.querySelector('.container').removeChild(flashOverlay);
        }
      }, 300);
    }, 1800);
  }

  // Charger les préférences enregistrées
  chrome.storage.sync.get(['searchPreference', 'enabledServices'], (data) => {
    const preference = data.searchPreference || 'web';
    const enabledServices = data.enabledServices || [
      'spotifySearch',
      'youtubeSearch',
      'youtubeMusicSearch',
      'bandcampSearch',
    ];

    // Définir l'état initial des toggles de préférence
    preferenceToggles.forEach((toggle) => {
      toggle.checked = toggle.value === preference;
    });

    // Définir l'état initial des toggles de services
    serviceToggles.forEach((toggle) => {
      toggle.checked = enabledServices.includes(toggle.value);
    });
  });

  // Gérer les changements de préférence Spotify (en mode exclusif)
  preferenceToggles.forEach((toggle) => {
    toggle.addEventListener('change', (event) => {
      // Assurer qu'un seul toggle est activé à la fois
      if (event.target.checked) {
        // Désactiver tous les autres toggles de préférence
        preferenceToggles.forEach((otherToggle) => {
          if (otherToggle !== event.target) {
            otherToggle.checked = false;
          }
        });

        // Validation des valeurs acceptables
        if (event.target.value === 'web' || event.target.value === 'desktop') {
          chrome.storage.sync.set(
            { searchPreference: event.target.value },
            () => showSaveFeedback(event.target)
          );
        } else {
          console.error(
            'Invalid preference value detected:',
            event.target.value
          );
        }
      } else {
        // Éviter que tous les toggles soient désactivés
        let anyChecked = Array.from(preferenceToggles).some((t) => t.checked);
        if (!anyChecked) {
          event.target.checked = true;
          return;
        }
      }
    });
  });

  // Gérer les changements de services activés
  serviceToggles.forEach((toggle) => {
    toggle.addEventListener('change', (event) => {
      // Validation des valeurs de services acceptables
      const validServiceIds = [
        'spotifySearch',
        'youtubeSearch',
        'youtubeMusicSearch',
        'bandcampSearch',
      ];

      // Récupérer tous les services activés
      const enabledServices = Array.from(serviceToggles)
        .filter((input) => input.checked)
        .map((input) => input.value)
        .filter((value) => validServiceIds.includes(value));

      // Sauvegarder les préférences avec référence à l'élément modifié
      chrome.storage.sync.set({ enabledServices }, () =>
        showSaveFeedback(event.target)
      );
    });
  });

  // Ajouter des styles CSS dynamiques pour l'animation de sauvegarde
  const style = document.createElement('style');
  style.textContent = `
    .save-notification {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      background-color: var(--accent-color);
      background-image: linear-gradient(45deg, var(--accent-color), var(--accent-dark));
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: none;
      z-index: 100;
      box-shadow: 0 4px 12px rgba(16, 163, 127, 0.3);
      display: flex;
      align-items: center;
      gap: 8px;
      backdrop-filter: blur(8px);
    }
    
    .save-notification svg {
      flex-shrink: 0;
    }
    
    .save-notification span {
      letter-spacing: 0.02em;
    }
    
    .save-notification.show {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  `;
  document.head.appendChild(style);
});
