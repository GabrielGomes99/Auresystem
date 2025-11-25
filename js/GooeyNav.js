/**
 * GooeyNav - Vanilla JavaScript implementation
 * Based on @react-bits/GooeyNav-JS-CSS
 */

class GooeyNav {
  constructor(container, options = {}) {
    this.container = container;
    this.items = options.items || [];
    this.animationTime = options.animationTime || 600;
    this.particleCount = options.particleCount || 15;
    this.particleDistances = options.particleDistances || [90, 10];
    this.particleR = options.particleR || 100;
    this.timeVariance = options.timeVariance || 300;
    this.colors = options.colors || [1, 2, 3, 1, 2, 3, 1, 4];
    this.activeIndex = options.initialActiveIndex || 0;
    
    this.navRef = null;
    this.filterRef = null;
    this.textRef = null;
    this.resizeObserver = null;
    
    this.init();
  }
  
  noise(n = 1) {
    return n / 2 - Math.random() * n;
  }
  
  getXY(distance, pointIndex, totalPoints) {
    const angle = ((360 + this.noise(8)) / totalPoints) * pointIndex * (Math.PI / 180);
    return [distance * Math.cos(angle), distance * Math.sin(angle)];
  }
  
  createParticle(i, t, d, r) {
    let rotate = this.noise(r / 10);
    return {
      start: this.getXY(d[0], this.particleCount - i, this.particleCount),
      end: this.getXY(d[1] + this.noise(7), this.particleCount - i, this.particleCount),
      time: t,
      scale: 1 + this.noise(0.2),
      color: this.colors[Math.floor(Math.random() * this.colors.length)],
      rotate: rotate > 0 ? (rotate + r / 20) * 10 : (rotate - r / 20) * 10
    };
  }
  
  makeParticles(element) {
    const d = this.particleDistances;
    const r = this.particleR;
    const bubbleTime = this.animationTime * 2 + this.timeVariance;
    element.style.setProperty('--time', `${bubbleTime}ms`);
    
    for (let i = 0; i < this.particleCount; i++) {
      const t = this.animationTime * 2 + this.noise(this.timeVariance * 2);
      const p = this.createParticle(i, t, d, r);
      
      element.classList.remove('active');
      
      setTimeout(() => {
        const particle = document.createElement('span');
        const point = document.createElement('span');
        particle.classList.add('particle');
        particle.style.setProperty('--start-x', `${p.start[0]}px`);
        particle.style.setProperty('--start-y', `${p.start[1]}px`);
        particle.style.setProperty('--end-x', `${p.end[0]}px`);
        particle.style.setProperty('--end-y', `${p.end[1]}px`);
        particle.style.setProperty('--time', `${p.time}ms`);
        particle.style.setProperty('--scale', `${p.scale}`);
        particle.style.setProperty('--color', `var(--color-${p.color}, white)`);
        particle.style.setProperty('--rotate', `${p.rotate}deg`);
        
        point.classList.add('point');
        particle.appendChild(point);
        element.appendChild(particle);
        
        requestAnimationFrame(() => {
          element.classList.add('active');
        });
        
        setTimeout(() => {
          try {
            element.removeChild(particle);
          } catch {
            // Do nothing
          }
        }, t);
      }, 30);
    }
  }
  
  updateEffectPosition(element) {
    if (!this.container || !this.filterRef || !this.textRef) return;
    
    const containerRect = this.container.getBoundingClientRect();
    const navElement = this.container.querySelector('nav');
    const pos = element.getBoundingClientRect();
    
    // Check if element is visible within nav scroll container
    let isVisible = true;
    if (navElement) {
      const navRect = navElement.getBoundingClientRect();
      const navScrollLeft = navElement.scrollLeft;
      const navScrollWidth = navElement.scrollWidth;
      const navClientWidth = navElement.clientWidth;
      
      // Check if element is within visible scroll area
      const elementLeft = pos.left - navRect.left + navScrollLeft;
      const elementRight = elementLeft + pos.width;
      
      isVisible = elementRight > navScrollLeft && 
                  elementLeft < navScrollLeft + navClientWidth;
    }
    
    const styles = {
      left: `${pos.x - containerRect.x}px`,
      top: `${pos.y - containerRect.y}px`,
      width: `${pos.width}px`,
      height: `${pos.height}px`,
      opacity: isVisible ? '1' : '0',
      pointerEvents: isVisible ? 'auto' : 'none',
      visibility: isVisible ? 'visible' : 'hidden'
    };
    
    Object.assign(this.filterRef.style, styles);
    Object.assign(this.textRef.style, styles);
    this.textRef.innerText = element.innerText;
  }
  
  handleClick(e, index) {
    const liEl = e.currentTarget;
    if (this.activeIndex === index) return;
    
    this.activeIndex = index;
    this.updateEffectPosition(liEl);
    
    // Update active class
    const allLis = this.navRef.querySelectorAll('li');
    allLis.forEach((li, i) => {
      li.classList.toggle('active', i === index);
    });
    
    if (this.filterRef) {
      const particles = this.filterRef.querySelectorAll('.particle');
      particles.forEach(p => {
        try {
          this.filterRef.removeChild(p);
        } catch {}
      });
    }
    
    if (this.textRef) {
      this.textRef.classList.remove('active');
      void this.textRef.offsetWidth; // Force reflow
      this.textRef.classList.add('active');
    }
    
    if (this.filterRef) {
      this.makeParticles(this.filterRef);
    }
  }
  
  handleKeyDown(e, index) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const liEl = e.currentTarget.parentElement;
      if (liEl) {
        this.handleClick({ currentTarget: liEl }, index);
      }
    }
  }
  
  init() {
    // Create nav structure
    const nav = document.createElement('nav');
    const ul = document.createElement('ul');
    
    // Reduzir partículas no mobile
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      this.particleCount = Math.floor(this.particleCount / 2);
    }
    
    this.items.forEach((item, index) => {
      const li = document.createElement('li');
      if (index === this.activeIndex) {
        li.classList.add('active');
      }
      
      const a = document.createElement('a');
      a.href = item.href;
      a.textContent = item.label;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleClick({ currentTarget: li }, index);
        // Handle smooth scroll
        if (item.href.startsWith('#')) {
          const target = document.querySelector(item.href);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
      a.addEventListener('keydown', (e) => this.handleKeyDown(e, index));
      
      li.appendChild(a);
      ul.appendChild(li);
    });
    
    nav.appendChild(ul);
    this.navRef = ul;
    
    // Create effect elements
    const filterEffect = document.createElement('span');
    filterEffect.className = 'effect filter';
    this.filterRef = filterEffect;
    
    const textEffect = document.createElement('span');
    textEffect.className = 'effect text';
    this.textRef = textEffect;
    
    // Append to container
    this.container.appendChild(nav);
    this.container.appendChild(filterEffect);
    this.container.appendChild(textEffect);
    
    // Set initial position
    const activeLi = ul.querySelectorAll('li')[this.activeIndex];
    if (activeLi) {
      this.updateEffectPosition(activeLi);
      this.textRef.classList.add('active');
    }
    
    // Resize observer
    this.resizeObserver = new ResizeObserver(() => {
      const currentActiveLi = ul.querySelectorAll('li')[this.activeIndex];
      if (currentActiveLi) {
        this.updateEffectPosition(currentActiveLi);
      }
    });
    
    this.resizeObserver.observe(this.container);
    
    // Scroll observer to hide effect when scrolling
    const navElement = this.container.querySelector('nav');
    if (navElement) {
      const handleScroll = () => {
        const currentActiveLi = ul.querySelectorAll('li')[this.activeIndex];
        if (currentActiveLi) {
          this.updateEffectPosition(currentActiveLi);
        }
      };
      
      navElement.addEventListener('scroll', handleScroll);
      // Also listen to touchmove for mobile
      navElement.addEventListener('touchmove', handleScroll);
    }
    
    // Recalculate on window resize
    window.addEventListener('resize', () => {
      const currentActiveLi = ul.querySelectorAll('li')[this.activeIndex];
      if (currentActiveLi) {
        this.updateEffectPosition(currentActiveLi);
      }
    });
  }
  
  destroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }
}

// Initialize GooeyNav when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const navElement = document.querySelector('.nav');
  if (!navElement) return;
  
  // Get items from existing nav
  const items = Array.from(navElement.querySelectorAll('a')).map(a => ({
    label: a.textContent.trim(),
    href: a.getAttribute('href')
  }));
  
  // Find active index
  let initialActiveIndex = 0;
  const hash = window.location.hash;
  if (hash) {
    const activeLink = navElement.querySelector(`a[href="${hash}"]`);
    if (activeLink) {
      initialActiveIndex = Array.from(navElement.querySelectorAll('a')).indexOf(activeLink);
    }
  }
  
  // Create container
  const container = document.createElement('div');
  container.className = 'gooey-nav-container';
  
  // Replace nav with gooey nav
  const navWrapper = navElement.parentElement;
  navElement.remove();
  navWrapper.appendChild(container);
  
  // Initialize GooeyNav
  window.gooeyNav = new GooeyNav(container, {
    items: items,
    particleCount: 15,
    particleDistances: [90, 10],
    particleR: 100,
    initialActiveIndex: initialActiveIndex,
    animationTime: 600,
    timeVariance: 300,
    colors: [1, 2, 3, 1, 2, 3, 1, 4]
  });
  
  // Update on scroll
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const sections = document.querySelectorAll('section[id]');
      const scrollY = window.pageYOffset;
      
      let current = '';
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= sectionTop - 200 && scrollY < sectionTop + sectionHeight - 200) {
          current = section.getAttribute('id');
        }
      });
      
      if (current && window.gooeyNav) {
        const index = items.findIndex(item => item.href === `#${current}`);
        if (index !== -1 && index !== window.gooeyNav.activeIndex) {
          const li = window.gooeyNav.navRef.querySelectorAll('li')[index];
          if (li) {
            window.gooeyNav.handleClick({ currentTarget: li }, index);
          }
        }
      }
    }, 50);
  });
});

