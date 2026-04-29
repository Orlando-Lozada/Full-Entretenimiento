/**
 * WhatsApp Link Handler
 * Optimized for SEO, accessibility, and lead capture
 * 
 * Features:
 * - Device detection (mobile/desktop)
 * - WhatsApp app installation detection on desktop
 * - Lead capture popup when user returns without using WhatsApp
 * - SEO and accessibility optimized links
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    phoneNumber: '573214047439',
    defaultText: 'Hola, quiero información sobre las pantallas de streaming',
    popupDelay: 1000,
    storageKey: 'wa_lead_capture_shown_test',
    sessionKey: 'wa_click_timestamp',
    leadFormEndpoint: null, // Can be configured for form submission
  };

  /**
   * Detect if the device is mobile
   * @returns {boolean}
   */
  function isMobileDevice() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    
    // Check for mobile devices including iPad with touch
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet/i;
    const isMobileUA = mobileRegex.test(userAgent.toLowerCase());
    
    // Check screen width as fallback
    const isSmallScreen = window.innerWidth <= 768;
    
    // Check touch capability
    const hasTouchScreen = (
      navigator.maxTouchPoints > 0 || 
      'ontouchstart' in window || 
      window.DocumentTouch && document instanceof window.DocumentTouch
    );
    
    return isMobileUA || (isSmallScreen && hasTouchScreen);
  }



  /**
   * Generate WhatsApp URL based on parameters
   * @param {string} phone - Phone number with country code
   * @param {string} text - Pre-filled message
   * @param {boolean} isApp - Whether to use app protocol
   * @returns {string}
   */
  function generateWhatsAppURL(phone, text, isApp = false) {
    const encodedText = encodeURIComponent(text || CONFIG.defaultText);
    
    if (isApp) {
      // For mobile app or desktop app
      return `whatsapp://send?phone=${phone}&text=${encodedText}`;
    }
    
    // For WhatsApp Web
    return `https://web.whatsapp.com/send?phone=${phone}&text=${encodedText}`;
  }

  /**
   * Generate wa.me URL (universal link)
   * @param {string} phone - Phone number with country code
   * @param {string} text - Pre-filled message
   * @returns {string}
   */
  function generateWaMeURL(phone, text) {
    const encodedText = encodeURIComponent(text || CONFIG.defaultText);
    return `https://wa.me/${phone}?text=${encodedText}`;
  }

  /**
   * Store click timestamp in session storage
   */
  function storeClickTimestamp() {
    sessionStorage.setItem(CONFIG.sessionKey, Date.now().toString());
  }

  /**
   * Check if user returned without using WhatsApp
   * @returns {boolean}
   */
  function hasUserReturned() {
    const timestamp = sessionStorage.getItem(CONFIG.sessionKey);
    if (!timestamp) return false;
    
    // If timestamp exists and page is visible again, user returned
    const timeDiff = Date.now() - parseInt(timestamp, 10);
    
    // Clear the timestamp
    sessionStorage.removeItem(CONFIG.sessionKey);
    
    // If less than 30 seconds passed, likely returned without using WhatsApp
    return timeDiff < 30000;
  }

  /**
   * Check if popup was already shown in this session
   * @returns {boolean}
   */
  function wasPopupShown() {
    return sessionStorage.getItem(CONFIG.storageKey) === 'true';
  }

  /**
   * Mark popup as shown
   */
  function markPopupShown() {
    sessionStorage.setItem(CONFIG.storageKey, 'true');
  }

  /**
   * Create and show lead capture popup (simplified version)
   */
  function showLeadCapturePopup() {
    console.log('Attempting to show popup');
    if (wasPopupShown()) {
      console.log('Popup already shown in this session');
      return;
    }

    console.log('Showing popup now');
    markPopupShown();
    
    // Create popup HTML
    const popup = document.createElement('div');
    popup.id = 'wa-lead-popup';
    popup.setAttribute('role', 'dialog');
    popup.setAttribute('aria-modal', 'true');
    popup.setAttribute('aria-labelledby', 'wa-popup-title');
    popup.innerHTML = `
      <div class="wa-popup-overlay" aria-hidden="true"></div>
      <div class="wa-popup-container">
        <button class="wa-popup-close" aria-label="Cerrar ventana" type="button">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <div class="wa-popup-content">
          <img src="/img/whatsapp-logo.webp" alt="" class="wa-popup-icon" width="64" height="64">
          <h3 id="wa-popup-title">¿No pudiste contactarnos?</h3>
          <p>Intenta de nuevo o comparte nuestro contacto con alguien que pueda ayudarte</p>
          <div class="wa-popup-buttons">
            <a href="${generateWaMeURL(CONFIG.phoneNumber, CONFIG.defaultText)}" 
               class="wa-popup-btn wa-popup-btn-primary"
               target="_blank" 
               rel="noopener noreferrer">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Intentar de nuevo
            </a>
            <button type="button" class="wa-popup-btn wa-popup-btn-secondary" id="wa-share-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
              Compartir contacto
            </button>
          </div>
           <p class="wa-popup-hint">O escríbenos directamente al <strong>+57 ${CONFIG.phoneNumber.slice(2,5)} ${CONFIG.phoneNumber.slice(5)}</strong></p>
        </div>
      </div>
    `;
    
    document.body.appendChild(popup);
    console.log('Popup appended to body');

    // Add event listeners
    const closeBtn = popup.querySelector('.wa-popup-close');
    const overlay = popup.querySelector('.wa-popup-overlay');
    const shareBtn = popup.querySelector('#wa-share-btn');
    
    const closePopup = () => {
      popup.classList.add('wa-popup-closing');
      setTimeout(() => {
        popup.remove();
      }, 300);
    };
    
    closeBtn.addEventListener('click', closePopup);
    overlay.addEventListener('click', closePopup);
    
    // Handle share button
    shareBtn.addEventListener('click', async () => {
      const shareData = {
        title: 'Full Entretenimiento',
        text: 'Contacta a Full Entretenimiento para pantallas de Netflix, Disney+, HBO y más',
        url: 'https://wa.me/573214047439?text=' + encodeURIComponent(CONFIG.defaultText)
      };
      
      // Try native share API first
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData);
          closePopup();
        } catch (err) {
          // User cancelled or error, fallback to copy
          copyToClipboard(shareData.url, shareBtn);
        }
      } else {
        // Fallback: copy to clipboard
        copyToClipboard(shareData.url, shareBtn);
      }
    });
    
    // Copy to clipboard helper
    function copyToClipboard(text, btn) {
      navigator.clipboard.writeText(text).then(() => {
        const originalHTML = btn.innerHTML;
        btn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          ¡Copiado!
        `;
        btn.classList.add('wa-btn-success');
        setTimeout(() => {
          btn.innerHTML = originalHTML;
          btn.classList.remove('wa-btn-success');
        }, 2000);
      }).catch(() => {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        btn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          ¡Copiado!
        `;
        setTimeout(() => {
          btn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
            Compartir contacto
          `;
        }, 2000);
      });
    }
    
    // Focus trap for accessibility
    const focusableElements = popup.querySelectorAll('button, a[href]');
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    
    popup.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closePopup();
      }
      
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        } else if (!e.shiftKey && document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    });
    
    // Focus first button
    setTimeout(() => {
      firstFocusable.focus();
    }, 100);
  }

  /**
   * Main handler for WhatsApp link clicks
   * @param {Event} e - Click event
   * @param {Object} options - Configuration options
   */
  async function handleWhatsAppClick(e, options = {}) {
    const phone = options.phone || CONFIG.phoneNumber;
    const text = options.text || CONFIG.defaultText;
    const source = options.source || 'generic';

    e.preventDefault();
    storeClickTimestamp();

    if (isMobileDevice()) {
      // Mobile: Use universal wa.me link which opens app directly
      window.location.href = generateWaMeURL(phone, text);
    } else {
      // Desktop: Open WhatsApp Web in new tab (wa.me handles app if available)
      window.open(generateWaMeURL(phone, text), '_blank', 'noopener,noreferrer');
    }

    // Set up listener for when user returns
    const checkReturn = () => {
      if (document.visibilityState === 'visible') {
        document.removeEventListener('visibilitychange', checkReturn);
        if (hasUserReturned()) {
          setTimeout(showLeadCapturePopup, CONFIG.popupDelay);
        }
      }
    };

    document.addEventListener('visibilitychange', checkReturn);

    // Fallback check after a delay
    setTimeout(() => {
      if (document.visibilityState === 'visible' && hasUserReturned()) {
        showLeadCapturePopup();
      }
    }, 1000);
  }

  /**
   * Create an SEO and accessibility optimized WhatsApp link
   * @param {Object} options - Link options
   * @returns {HTMLAnchorElement}
   */
  function createWhatsAppLink(options = {}) {
    const {
      phone = CONFIG.phoneNumber,
      text = CONFIG.defaultText,
      label = 'Contactar por WhatsApp',
      description = '',
      className = 'wa-link',
      icon = true,
      source = 'generic'
    } = options;
    
    const link = document.createElement('a');
    
    // Set base attributes
    link.href = generateWaMeURL(phone, text);
    link.className = className;
    
    // SEO attributes
    link.rel = 'noopener noreferrer';
    link.target = '_blank';
    
    // Accessibility attributes
    link.setAttribute('aria-label', label);
    if (description) {
      link.setAttribute('aria-describedby', description);
    }
    link.setAttribute('role', 'button');
    
    // Add icon if requested
    if (icon) {
      link.innerHTML = `
        <img src="/img/whatsapp-logo.webp" alt="" width="24" height="24" aria-hidden="true">
        <span>${label}</span>
      `;
    } else {
      link.textContent = label;
    }
    
    // Add click handler
    link.addEventListener('click', (e) => {
      handleWhatsAppClick(e, { phone, text, source });
    });
    
    return link;
  }

  /**
   * Initialize WhatsApp links on the page
   */
  function initWhatsAppLinks() {
    // Find all existing WhatsApp links
    const existingLinks = document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp.com"]');
    
    existingLinks.forEach((link, index) => {
      const href = link.getAttribute('href');
      const url = new URL(href);
      
      // Extract phone and text from URL
      const pathParts = url.pathname.split('/');
      const phone = pathParts[pathParts.length - 1] || CONFIG.phoneNumber;
      const text = url.searchParams.get('text') || CONFIG.defaultText;
      
      // Add accessibility attributes if missing
      if (!link.getAttribute('aria-label')) {
        const linkText = link.textContent.trim() || 'Contactar por WhatsApp';
        link.setAttribute('aria-label', linkText);
      }
      
      // Add SEO attributes if missing
      if (!link.getAttribute('rel')) {
        link.rel = 'noopener noreferrer';
      }
      
      // Add click handler
      link.addEventListener('click', (e) => {
        handleWhatsAppClick(e, { phone, text, source: `link_${index}` });
      });
    });
    
    // Check if user returned from WhatsApp on page load
    if (hasUserReturned()) {
      setTimeout(showLeadCapturePopup, CONFIG.popupDelay);
    }
  }

  /**
   * Configure the WhatsApp handler
   * @param {Object} config - Configuration object
   */
  function configure(config) {
    Object.assign(CONFIG, config);
  }

  // Expose public API
  window.WhatsAppHandler = {
    init: initWhatsAppLinks,
    createLink: createWhatsAppLink,
    handleClick: handleWhatsAppClick,
    showPopup: showLeadCapturePopup,
    configure: configure,
    isMobile: isMobileDevice,
    generateURL: generateWaMeURL
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWhatsAppLinks);
  } else {
    initWhatsAppLinks();
  }
})();