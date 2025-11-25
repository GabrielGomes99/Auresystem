/**
 * SpotlightCard - Vanilla JavaScript implementation
 * Based on @react-bits/SpotlightCard-JS-CSS
 */

class SpotlightCard {
  constructor(element, options = {}) {
    this.element = element;
    this.spotlightColor = options.spotlightColor || 'rgba(0, 229, 255, 0.2)';
    this.className = options.className || '';
    
    this.init();
  }
  
  init() {
    if (!this.element) return;
    
    // Add class
    this.element.classList.add('card-spotlight');
    if (this.className) {
      this.element.classList.add(this.className);
    }
    
    // Set initial CSS variables
    this.element.style.setProperty('--mouse-x', '50%');
    this.element.style.setProperty('--mouse-y', '50%');
    this.element.style.setProperty('--spotlight-color', this.spotlightColor);
    
    // Add event listeners
    this.handleMouseMove = (e) => {
      const rect = this.element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.element.style.setProperty('--mouse-x', `${x}px`);
      this.element.style.setProperty('--mouse-y', `${y}px`);
      this.element.style.setProperty('--spotlight-color', this.spotlightColor);
    };
    
    this.element.addEventListener('mousemove', this.handleMouseMove);
  }
  
  destroy() {
    if (this.element) {
      this.element.removeEventListener('mousemove', this.handleMouseMove);
      this.element.classList.remove('card-spotlight', this.className);
    }
  }
}

// Initialize SpotlightCard on all cards
function initSpotlightCards() {
  // Project cards
  const projectCards = document.querySelectorAll('.project-card');
  projectCards.forEach(card => {
    new SpotlightCard(card, {
      spotlightColor: 'rgba(0, 229, 255, 0.2)',
      className: 'custom-spotlight-card'
    });
  });
  
  // Service cards
  const serviceCards = document.querySelectorAll('.service-card-modern');
  serviceCards.forEach(card => {
    new SpotlightCard(card, {
      spotlightColor: 'rgba(0, 229, 255, 0.2)',
      className: 'custom-spotlight-card'
    });
  });
  
  // Category cards
  const categoryCards = document.querySelectorAll('.category-card');
  categoryCards.forEach(card => {
    new SpotlightCard(card, {
      spotlightColor: 'rgba(0, 229, 255, 0.2)',
      className: 'custom-spotlight-card'
    });
  });
  
  // Pricing cards
  const pricingCards = document.querySelectorAll('.pricing-card');
  pricingCards.forEach(card => {
    new SpotlightCard(card, {
      spotlightColor: 'rgba(0, 229, 255, 0.2)',
      className: 'custom-spotlight-card'
    });
  });
  
  // Testimonial cards
  const testimonialCards = document.querySelectorAll('.testimonial-card');
  testimonialCards.forEach(card => {
    new SpotlightCard(card, {
      spotlightColor: 'rgba(0, 229, 255, 0.2)',
      className: 'custom-spotlight-card'
    });
  });
  
  // Guarantee cards
  const guaranteeCards = document.querySelectorAll('.guarantee-card');
  guaranteeCards.forEach(card => {
    new SpotlightCard(card, {
      spotlightColor: 'rgba(0, 229, 255, 0.2)',
      className: 'custom-spotlight-card'
    });
  });
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSpotlightCards);
} else {
  initSpotlightCards();
}

// Re-initialize when new content is loaded (for dynamic content)
let observerTimeout;
const observer = new MutationObserver(() => {
  // Debounce to avoid excessive checks
  clearTimeout(observerTimeout);
  observerTimeout = setTimeout(() => {
    // Check if new cards were added
    const allCards = document.querySelectorAll('.project-card, .service-card-modern, .category-card, .pricing-card, .testimonial-card, .guarantee-card');
    allCards.forEach(card => {
      if (!card.classList.contains('card-spotlight')) {
        new SpotlightCard(card, {
          spotlightColor: 'rgba(0, 229, 255, 0.2)',
          className: 'custom-spotlight-card'
        });
      }
    });
  }, 100);
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SpotlightCard;
}

