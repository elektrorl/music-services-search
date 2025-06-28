// i18n.js - Handles internationalization of HTML elements with French typography rules

document.addEventListener('DOMContentLoaded', () => {
  // Detect if current locale is French
  const isFrench = chrome.i18n.getUILanguage().startsWith('fr');

  // Function to apply French typography rules (non-breaking spaces before double punctuation)
  function applyFrenchTypography(text) {
    if (isFrench) {
      // Add non-breaking spaces before double punctuation
      // The Unicode character \u202F is a narrow non-breaking space which is the proper character to use in French typography
      return text
        .replace(/\s*([!?:;])/g, '\u202F$1') // For : ; ! ?
        .replace(/«\s*/g, '« ') // Opening quotation mark
        .replace(/\s*»/g, '\u202F»'); // Closing quotation mark
    }
    return text;
  }

  // Localize by replacing all elements with data-i18n attribute
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach((element) => {
    const key = element.getAttribute('data-i18n');
    let message = chrome.i18n.getMessage(key);

    // Only replace if we have a translation
    if (message) {
      // Apply French typography rules if current locale is French
      message = applyFrenchTypography(message);

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
    let message = chrome.i18n.getMessage(key);
    if (message) {
      message = applyFrenchTypography(message);
      document.title = message;
    }
  }

  // Apply French typography to elements that might have been dynamically generated
  // or that don't have direct i18n translations (e.g. combined strings or status messages)
  function applyFrenchTypographyToDocument() {
    if (!isFrench) return; // Only apply to French locale

    // Walk through text nodes and replace them if necessary
    const textWalker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let node;
    while ((node = textWalker.nextNode())) {
      // Skip script and style elements
      if (
        node.parentElement.tagName === 'SCRIPT' ||
        node.parentElement.tagName === 'STYLE'
      ) {
        continue;
      }

      const originalText = node.nodeValue;
      const modifiedText = applyFrenchTypography(originalText);

      if (originalText !== modifiedText) {
        node.nodeValue = modifiedText;
      }
    }
  }

  // Apply French typography rules to the entire document
  applyFrenchTypographyToDocument();

  // Apply rules again after dynamic content changes
  // Use MutationObserver to detect DOM changes
  const observer = new MutationObserver((mutations) => {
    // For performance reasons, we debounce the function call
    clearTimeout(window.typographyTimeout);
    window.typographyTimeout = setTimeout(applyFrenchTypographyToDocument, 100);
  });

  // Start observing for dynamic content changes
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
});
