// i18n.js - Handles internationalization of HTML elements

document.addEventListener('DOMContentLoaded', () => {
  // Localize by replacing all elements with data-i18n attribute
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach((element) => {
    const key = element.getAttribute('data-i18n');
    const message = chrome.i18n.getMessage(key);

    // Only replace if we have a translation
    if (message) {
      if (element.tagName === 'INPUT' && element.type === 'placeholder') {
        element.placeholder = message;
      } else if (element.tagName === 'IMG') {
        element.alt = message;
      } else if (
        element.tagName === 'TITLE' ||
        element.tagName.startsWith('H') ||
        element.tagName === 'SPAN' ||
        element.tagName === 'P' ||
        element.tagName === 'A' ||
        element.tagName === 'BUTTON' ||
        element.tagName === 'LABEL'
      ) {
        element.textContent = message;
      } else {
        // For other elements, try to set the text content
        try {
          element.textContent = message;
        } catch (e) {
          console.error(
            `Error setting text for element with data-i18n="${key}":`,
            e
          );
        }
      }
    }
  });

  // Also localize document title if needed
  const titleElement = document.querySelector('title');
  if (titleElement && titleElement.hasAttribute('data-i18n')) {
    const key = titleElement.getAttribute('data-i18n');
    const message = chrome.i18n.getMessage(key);
    if (message) {
      document.title = message;
    }
  }
});
