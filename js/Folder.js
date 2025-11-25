// Folder - Vanilla JavaScript adaptation
// Based on https://reactbits.dev/components/folder

const darkenColor = (hex, percent) => {
  let color = hex.startsWith('#') ? hex.slice(1) : hex;
  if (color.length === 3) {
    color = color
      .split('')
      .map(c => c + c)
      .join('');
  }
  const num = parseInt(color, 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  r = Math.max(0, Math.min(255, Math.floor(r * (1 - percent))));
  g = Math.max(0, Math.min(255, Math.floor(g * (1 - percent))));
  b = Math.max(0, Math.min(255, Math.floor(b * (1 - percent))));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
};

class Folder {
  constructor(container, options = {}) {
    this.container = container;
    this.color = options.color || '#5227FF';
    this.size = options.size || 1;
    this.items = options.items || [];
    this.className = options.className || '';
    this.maxItems = 3;
    
    this.open = false;
    this.paperOffsets = Array.from({ length: this.maxItems }, () => ({ x: 0, y: 0 }));
    
    this.folderBackColor = darkenColor(this.color, 0.08);
    this.paper1 = darkenColor('#ffffff', 0.1);
    this.paper2 = darkenColor('#ffffff', 0.05);
    this.paper3 = '#ffffff';
    
    this.init();
  }
  
  init() {
    const papers = this.items.slice(0, this.maxItems);
    while (papers.length < this.maxItems) {
      papers.push(null);
    }
    
    // Create folder container
    const folderWrapper = document.createElement('div');
    folderWrapper.style.transform = `scale(${this.size})`;
    if (this.className) {
      folderWrapper.className = this.className;
    }
    
    // Create folder element
    const folder = document.createElement('div');
    folder.className = 'folder';
    folder.style.setProperty('--folder-color', this.color);
    folder.style.setProperty('--folder-back-color', this.folderBackColor);
    folder.style.setProperty('--paper-1', this.paper1);
    folder.style.setProperty('--paper-2', this.paper2);
    folder.style.setProperty('--paper-3', this.paper3);
    
    // Create folder back
    const folderBack = document.createElement('div');
    folderBack.className = 'folder__back';
    
    // Create papers
    papers.forEach((item, i) => {
      const paper = document.createElement('div');
      paper.className = `paper paper-${i + 1}`;
      
      if (item) {
        if (typeof item === 'string') {
          paper.innerHTML = item;
        } else if (item instanceof HTMLElement) {
          paper.appendChild(item);
        } else if (item && item.innerHTML) {
          paper.innerHTML = item.innerHTML;
        }
      }
      
      paper.addEventListener('mousemove', (e) => this.handlePaperMouseMove(e, i));
      paper.addEventListener('mouseleave', (e) => this.handlePaperMouseLeave(e, i));
      
      folderBack.appendChild(paper);
    });
    
    // Create folder front
    const folderFront = document.createElement('div');
    folderFront.className = 'folder__front';
    
    const folderFrontRight = document.createElement('div');
    folderFrontRight.className = 'folder__front right';
    
    folderBack.appendChild(folderFront);
    folderBack.appendChild(folderFrontRight);
    
    folder.appendChild(folderBack);
    folderWrapper.appendChild(folder);
    
    // Handle click
    folder.addEventListener('click', (e) => {
      e.stopPropagation();
      this.handleClick();
    });
    
    this.container.appendChild(folderWrapper);
    this.folderElement = folder;
    this.paperElements = folderBack.querySelectorAll('.paper');
    this.handleClick = this.handleClick.bind(this);
  }
  
  handleClick() {
    this.open = !this.open;
    
    if (this.open) {
      this.folderElement.classList.add('open');
    } else {
      this.folderElement.classList.remove('open');
      this.paperOffsets = Array.from({ length: this.maxItems }, () => ({ x: 0, y: 0 }));
      this.updatePaperOffsets();
    }
    
    // Trigger custom event
    this.folderElement.dispatchEvent(new CustomEvent('folderToggle', { 
      detail: { open: this.open } 
    }));
  }
  
  handlePaperMouseMove(e, index) {
    if (!this.open) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const offsetX = (e.clientX - centerX) * 0.15;
    const offsetY = (e.clientY - centerY) * 0.15;
    
    this.paperOffsets[index] = { x: offsetX, y: offsetY };
    this.updatePaperOffsets();
  }
  
  handlePaperMouseLeave(e, index) {
    this.paperOffsets[index] = { x: 0, y: 0 };
    this.updatePaperOffsets();
  }
  
  updatePaperOffsets() {
    this.paperElements.forEach((paper, index) => {
      if (this.open) {
        paper.style.setProperty('--magnet-x', `${this.paperOffsets[index]?.x || 0}px`);
        paper.style.setProperty('--magnet-y', `${this.paperOffsets[index]?.y || 0}px`);
      } else {
        paper.style.removeProperty('--magnet-x');
        paper.style.removeProperty('--magnet-y');
      }
    });
  }
  
  destroy() {
    if (this.container && this.container.firstChild) {
      this.container.removeChild(this.container.firstChild);
    }
  }
}

// Initialize folders for projects
function initProjectFolders() {
  // Get both sections
  const govProjectsSection = document.querySelector('.projects-category:first-of-type');
  const privateProjectsSection = document.querySelector('.projects-category:last-of-type');
  
  // Create wrapper for both folders
  const foldersWrapper = document.createElement('div');
  foldersWrapper.className = 'folders-wrapper';
  
  // Set gap based on screen size
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const gapValue = isMobile ? '40px' : '250px';
  
  foldersWrapper.style.cssText = `
    display: flex;
    gap: ${gapValue};
    justify-content: center;
    align-items: center;
    margin: 60px auto;
    flex-wrap: wrap;
    transition: all 0.5s ease;
    width: 100%;
    max-width: 1400px;
    padding: 0 20px;
    box-sizing: border-box;
  `;
  
  // Update gap on resize
  const updateGap = () => {
    const isMobileNow = window.matchMedia('(max-width: 768px)').matches;
    foldersWrapper.style.gap = isMobileNow ? '40px' : '250px';
  };
  
  window.addEventListener('resize', updateGap);
  
  // Insert wrapper before first section
  if (govProjectsSection && govProjectsSection.parentElement) {
    govProjectsSection.parentElement.insertBefore(foldersWrapper, govProjectsSection);
  }
  
  // Create wrapper for each folder with title
  const govFolderWrapper = document.createElement('div');
  govFolderWrapper.className = 'folder-item-wrapper';
  govFolderWrapper.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 20px;
    flex: 0 0 auto;
    width: 300px;
    min-height: 500px;
  `;
  
  const privateFolderWrapper = document.createElement('div');
  privateFolderWrapper.className = 'folder-item-wrapper';
  privateFolderWrapper.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 20px;
    flex: 0 0 auto;
    width: 300px;
    min-height: 500px;
  `;
  
  let govFolderContainer = null;
  let privateFolderContainer = null;
  let govFolder = null;
  let privateFolder = null;
  
  // Folder for Painéis Gerenciais
  if (govProjectsSection) {
    const govProjectsGrid = govProjectsSection.querySelector('.gov-projects');
    if (govProjectsGrid) {
      // Get title
      const govTitle = govProjectsSection.querySelector('.category-title');
      const govTitleClone = govTitle ? govTitle.cloneNode(true) : null;
      if (govTitle) {
        govTitle.style.display = 'none';
      }
      
      // Create folder container
      const folderContainer = document.createElement('div');
      folderContainer.className = 'folder-container-gov';
      folderContainer.style.cssText = `
        height: 400px;
        width: 300px;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.5s ease;
        flex-shrink: 0;
        margin: 0 auto;
      `;
      govFolderContainer = folderContainer;
      
      // Add folder to wrapper first
      govFolderWrapper.appendChild(folderContainer);
      
      // Add title to wrapper below folder
      if (govTitleClone) {
        govTitleClone.style.cssText = `
          font-size: 24px;
          font-weight: 600;
          color: var(--ice-white, #fff);
          text-align: center;
          margin: 0;
        `;
        govFolderWrapper.appendChild(govTitleClone);
      }
      
      // Get project cards as items (empty papers)
      const projectCards = Array.from(govProjectsGrid.querySelectorAll('.project-card')).slice(0, 3);
      const items = projectCards.map(() => {
        const preview = document.createElement('div');
        preview.style.cssText = `
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        `;
        // Empty - no text
        return preview;
      });
      
      // Create folder
      govFolder = new Folder(folderContainer, {
        color: '#5227FF',
        size: 2.5,
        items: items,
        className: 'custom-folder-gov'
      });
      
      // Add folder wrapper to main wrapper
      foldersWrapper.appendChild(govFolderWrapper);
      
      // Hide original grid initially, show on folder open with animation
      govProjectsGrid.style.display = 'none';
      let gridShown = false;
      
      // Create close button
      const closeButton = document.createElement('button');
      closeButton.innerHTML = 'Fechar';
      closeButton.className = 'folder-close-btn';
      closeButton.style.cssText = `
        position: relative;
        margin-bottom: 20px;
        margin-left: auto;
        width: fit-content;
        display: block;
        background: rgba(82, 39, 255, 0.15);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        color: white;
        border: 1px solid rgba(132, 0, 255, 0.5);
        padding: 12px 24px;
        border-radius: 12px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        z-index: 1000;
        opacity: 0;
        transform: translateY(-10px);
        transition: all 0.3s ease;
        box-shadow: 
          0 4px 20px rgba(82, 39, 255, 0.4),
          0 0 30px rgba(132, 0, 255, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.2);
        text-shadow: 0 0 10px rgba(132, 0, 255, 0.8);
      `;
      
      // Add hover effect
      closeButton.addEventListener('mouseenter', () => {
        closeButton.style.background = 'rgba(82, 39, 255, 0.25)';
        closeButton.style.borderColor = 'rgba(132, 0, 255, 0.8)';
        closeButton.style.boxShadow = `
          0 6px 30px rgba(82, 39, 255, 0.6),
          0 0 40px rgba(132, 0, 255, 0.5),
          inset 0 1px 0 rgba(255, 255, 255, 0.3)
        `;
        closeButton.style.textShadow = '0 0 15px rgba(132, 0, 255, 1)';
        closeButton.style.transform = 'translateY(-2px)';
      });
      
      closeButton.addEventListener('mouseleave', () => {
        closeButton.style.background = 'rgba(82, 39, 255, 0.15)';
        closeButton.style.borderColor = 'rgba(132, 0, 255, 0.5)';
        closeButton.style.boxShadow = `
          0 4px 20px rgba(82, 39, 255, 0.4),
          0 0 30px rgba(132, 0, 255, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.2)
        `;
        closeButton.style.textShadow = '0 0 10px rgba(132, 0, 255, 0.8)';
        if (closeButton.style.opacity === '1') {
          closeButton.style.transform = 'translateY(0)';
        }
      });
      
      closeButton.addEventListener('click', () => {
        if (gridShown) {
          govFolder.handleClick();
        }
      });
      
      // Insert close button before the grid
      govProjectsGrid.parentNode.insertBefore(closeButton, govProjectsGrid);
      
      govFolder.folderElement.addEventListener('folderToggle', (e) => {
        if (e.detail.open && !gridShown) {
          // Hide folders immediately (no delay)
          // Hide other folder completely
          if (privateFolderWrapper) {
            privateFolderWrapper.style.display = 'none';
          }
          
          // Hide folder wrapper completely
          govFolderWrapper.style.display = 'none';
          
          // Hide the folders wrapper completely
          foldersWrapper.style.display = 'none';
          
          // Opening animation
          setTimeout(() => {
            
            // Show grid with minimal spacing
            govProjectsGrid.style.display = 'grid';
            govProjectsGrid.style.opacity = '0';
            govProjectsGrid.style.transform = 'translateY(50px) scale(0.9)';
            govProjectsGrid.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            govProjectsGrid.style.marginTop = '10px';
            
            // Reduce title spacing
            const titleElement = govProjectsSection.querySelector('.category-title');
            if (titleElement) {
              titleElement.style.marginBottom = '10px';
            }
            
            // Animate cards in with stagger
            const cards = govProjectsGrid.querySelectorAll('.project-card');
            cards.forEach((card, index) => {
              card.style.opacity = '0';
              card.style.transform = 'translateY(30px) scale(0.95)';
              card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
            });
            
            // Trigger animations
            setTimeout(() => {
              govProjectsGrid.style.opacity = '1';
              govProjectsGrid.style.transform = 'translateY(0) scale(1)';
              
              cards.forEach((card) => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0) scale(1)';
                // Ensure cards are clickable
                card.style.pointerEvents = 'auto';
                card.style.cursor = 'pointer';
                
                // Add click listener directly to each card
                card.addEventListener('click', function(e) {
                  e.stopPropagation();
                  const projectId = this.getAttribute('data-project');
                  if (projectId) {
                    // Call the openProjectModal function if it exists
                    if (typeof openProjectModal === 'function') {
                      openProjectModal(projectId);
                    } else {
                      // Fallback: dispatch custom event
                      document.dispatchEvent(new CustomEvent('openProjectModal', {
                        detail: { projectId: projectId }
                      }));
                    }
                  }
                });
              });
              
              // Show close button
              closeButton.style.opacity = '1';
              closeButton.style.transform = 'translateY(0)';
              closeButton.style.display = 'block';
              
              // Dispatch custom event to notify that cards are ready
              document.dispatchEvent(new CustomEvent('projectCardsShown', { 
                detail: { cards: cards } 
              }));
            }, 50);
            
            gridShown = true;
          }, 400);
        } else if (!e.detail.open && gridShown) {
          // Closing animation - reverse
          const cards = govProjectsGrid.querySelectorAll('.project-card');
          
          // Animate cards out with reverse stagger
          cards.forEach((card, index) => {
            const reverseIndex = cards.length - 1 - index;
            card.style.transition = `opacity 0.5s ease ${reverseIndex * 0.08}s, transform 0.5s ease ${reverseIndex * 0.08}s`;
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px) scale(0.95)';
          });
          
          // Animate grid out
          govProjectsGrid.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
          govProjectsGrid.style.opacity = '0';
          govProjectsGrid.style.transform = 'translateY(50px) scale(0.9)';
          
          // Hide close button
          closeButton.style.opacity = '0';
          closeButton.style.transform = 'translateY(-10px)';
          closeButton.style.display = 'none';
          
          // Show folder wrapper and container with animation
          setTimeout(() => {
            // Show folder wrapper
            govFolderWrapper.style.display = 'flex';
            govFolderWrapper.style.opacity = '0';
            
            // Show folders wrapper again
            foldersWrapper.style.display = 'flex';
            
            // Show other folder back
            if (privateFolderWrapper) {
              privateFolderWrapper.style.display = 'flex';
              privateFolderWrapper.style.transform = 'translateY(0)';
              privateFolderWrapper.style.opacity = '1';
              privateFolderWrapper.style.pointerEvents = 'auto';
            }
            
            // Restore original gap based on screen size
            const isMobileNow = window.matchMedia('(max-width: 768px)').matches;
            foldersWrapper.style.gap = isMobileNow ? '40px' : '250px';
            
            folderContainer.style.display = 'flex';
            folderContainer.style.opacity = '0';
            folderContainer.style.transform = 'scale(0.8) translateY(-20px)';
            folderContainer.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            govFolderWrapper.style.transition = 'opacity 0.6s ease';
            
            setTimeout(() => {
              folderContainer.style.opacity = '1';
              folderContainer.style.transform = 'scale(1) translateY(0)';
              govFolderWrapper.style.opacity = '1';
            }, 50);
            
            // Remove margin from grid
            govProjectsGrid.style.marginTop = '0';
            
            // Restore title spacing
            const titleElement = govProjectsSection.querySelector('.category-title');
            if (titleElement) {
              titleElement.style.marginBottom = '';
            }
            
            // Hide grid after animation
            setTimeout(() => {
              govProjectsGrid.style.display = 'none';
            }, 600);
          }, 300);
          
          gridShown = false;
        }
      });
    }
  }
  
  // Folder for Projetos Privados
  if (privateProjectsSection) {
    const privateProjectsGrid = privateProjectsSection.querySelector('.projects-grid:not(.gov-projects)');
    if (privateProjectsGrid) {
      // Get title
      const privateTitle = privateProjectsSection.querySelector('.category-title');
      const privateTitleClone = privateTitle ? privateTitle.cloneNode(true) : null;
      if (privateTitle) {
        privateTitle.style.display = 'none';
      }
      
      // Create folder container
      const folderContainer = document.createElement('div');
      folderContainer.className = 'folder-container-private';
      folderContainer.style.cssText = `
        height: 400px;
        width: 300px;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.5s ease;
        flex-shrink: 0;
        margin: 0 auto;
      `;
      privateFolderContainer = folderContainer;
      
      // Add folder to wrapper first
      privateFolderWrapper.appendChild(folderContainer);
      
      // Add title to wrapper below folder
      if (privateTitleClone) {
        privateTitleClone.style.cssText = `
          font-size: 24px;
          font-weight: 600;
          color: var(--ice-white, #fff);
          text-align: center;
          margin: 0;
        `;
        privateFolderWrapper.appendChild(privateTitleClone);
      }
      
      // Get project cards as items (empty papers)
      const projectCards = Array.from(privateProjectsGrid.querySelectorAll('.project-card')).slice(0, 3);
      const items = projectCards.map(() => {
        const preview = document.createElement('div');
        preview.style.cssText = `
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        `;
        // Empty - no text
        return preview;
      });
      
      // Add folder wrapper to main wrapper
      foldersWrapper.appendChild(privateFolderWrapper);
      
      // Create folder
      privateFolder = new Folder(folderContainer, {
        color: '#5227FF',
        size: 2.5,
        items: items,
        className: 'custom-folder-private'
      });
      
      // Hide original grid initially, show on folder open with animation
      privateProjectsGrid.style.display = 'none';
      let gridShown = false;
      
      // Create close button for private projects
      const closeButton = document.createElement('button');
      closeButton.innerHTML = 'Fechar';
      closeButton.className = 'folder-close-btn';
      closeButton.style.cssText = `
        position: relative;
        margin-bottom: 20px;
        margin-left: auto;
        width: fit-content;
        display: block;
        background: rgba(82, 39, 255, 0.15);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        color: white;
        border: 1px solid rgba(132, 0, 255, 0.5);
        padding: 12px 24px;
        border-radius: 12px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        z-index: 1000;
        opacity: 0;
        transform: translateY(-10px);
        transition: all 0.3s ease;
        box-shadow: 
          0 4px 20px rgba(82, 39, 255, 0.4),
          0 0 30px rgba(132, 0, 255, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.2);
        text-shadow: 0 0 10px rgba(132, 0, 255, 0.8);
      `;
      
      // Add hover effect
      closeButton.addEventListener('mouseenter', () => {
        closeButton.style.background = 'rgba(82, 39, 255, 0.25)';
        closeButton.style.borderColor = 'rgba(132, 0, 255, 0.8)';
        closeButton.style.boxShadow = `
          0 6px 30px rgba(82, 39, 255, 0.6),
          0 0 40px rgba(132, 0, 255, 0.5),
          inset 0 1px 0 rgba(255, 255, 255, 0.3)
        `;
        closeButton.style.textShadow = '0 0 15px rgba(132, 0, 255, 1)';
        closeButton.style.transform = 'translateY(-2px)';
      });
      
      closeButton.addEventListener('mouseleave', () => {
        closeButton.style.background = 'rgba(82, 39, 255, 0.15)';
        closeButton.style.borderColor = 'rgba(132, 0, 255, 0.5)';
        closeButton.style.boxShadow = `
          0 4px 20px rgba(82, 39, 255, 0.4),
          0 0 30px rgba(132, 0, 255, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.2)
        `;
        closeButton.style.textShadow = '0 0 10px rgba(132, 0, 255, 0.8)';
        if (closeButton.style.opacity === '1') {
          closeButton.style.transform = 'translateY(0)';
        }
      });
      closeButton.addEventListener('click', () => {
        if (gridShown) {
          privateFolder.handleClick();
        }
      });
      
      // Insert close button before the grid
      privateProjectsGrid.parentNode.insertBefore(closeButton, privateProjectsGrid);
      
      privateFolder.folderElement.addEventListener('folderToggle', (e) => {
        if (e.detail.open && !gridShown) {
          // Hide folders immediately (no delay)
          // Hide other folder completely
          if (govFolderWrapper) {
            govFolderWrapper.style.display = 'none';
          }
          
          // Hide folder wrapper completely
          privateFolderWrapper.style.display = 'none';
          
          // Hide the folders wrapper completely
          foldersWrapper.style.display = 'none';
          
          // Opening animation
          setTimeout(() => {
            
            // Show grid with minimal spacing
            privateProjectsGrid.style.display = 'grid';
            privateProjectsGrid.style.opacity = '0';
            privateProjectsGrid.style.transform = 'translateY(50px) scale(0.9)';
            privateProjectsGrid.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            privateProjectsGrid.style.marginTop = '10px';
            
            // Reduce title spacing
            const titleElement = privateProjectsSection.querySelector('.category-title');
            if (titleElement) {
              titleElement.style.marginBottom = '10px';
            }
            
            // Animate cards in with stagger
            const cards = privateProjectsGrid.querySelectorAll('.project-card');
            cards.forEach((card, index) => {
              card.style.opacity = '0';
              card.style.transform = 'translateY(30px) scale(0.95)';
              card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
            });
            
            // Trigger animations
            setTimeout(() => {
              privateProjectsGrid.style.opacity = '1';
              privateProjectsGrid.style.transform = 'translateY(0) scale(1)';
              
              cards.forEach((card) => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0) scale(1)';
                // Ensure cards are clickable
                card.style.pointerEvents = 'auto';
                card.style.cursor = 'pointer';
                
                // Add click listener directly to each card
                card.addEventListener('click', function(e) {
                  e.stopPropagation();
                  const projectId = this.getAttribute('data-project');
                  if (projectId) {
                    // Call the openProjectModal function if it exists
                    if (typeof openProjectModal === 'function') {
                      openProjectModal(projectId);
                    } else {
                      // Fallback: dispatch custom event
                      document.dispatchEvent(new CustomEvent('openProjectModal', {
                        detail: { projectId: projectId }
                      }));
                    }
                  }
                });
              });
              
              // Show close button
              closeButton.style.opacity = '1';
              closeButton.style.transform = 'translateY(0)';
              closeButton.style.display = 'block';
              
              // Dispatch custom event to notify that cards are ready
              document.dispatchEvent(new CustomEvent('projectCardsShown', { 
                detail: { cards: cards } 
              }));
            }, 50);
            
            gridShown = true;
          }, 400);
        } else if (!e.detail.open && gridShown) {
          // Closing animation - reverse
          const cards = privateProjectsGrid.querySelectorAll('.project-card');
          
          // Animate cards out with reverse stagger
          cards.forEach((card, index) => {
            const reverseIndex = cards.length - 1 - index;
            card.style.transition = `opacity 0.5s ease ${reverseIndex * 0.08}s, transform 0.5s ease ${reverseIndex * 0.08}s`;
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px) scale(0.95)';
          });
          
          // Animate grid out
          privateProjectsGrid.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
          privateProjectsGrid.style.opacity = '0';
          privateProjectsGrid.style.transform = 'translateY(50px) scale(0.9)';
          
          // Hide close button
          closeButton.style.opacity = '0';
          closeButton.style.transform = 'translateY(-10px)';
          closeButton.style.display = 'none';
          
          // Show folder wrapper and container with animation
          setTimeout(() => {
            // Show folder wrapper
            privateFolderWrapper.style.display = 'flex';
            privateFolderWrapper.style.opacity = '0';
            
            // Show folders wrapper again
            foldersWrapper.style.display = 'flex';
            
            // Show other folder back
            if (govFolderWrapper) {
              govFolderWrapper.style.display = 'flex';
              govFolderWrapper.style.transform = 'translateY(0)';
              govFolderWrapper.style.opacity = '1';
              govFolderWrapper.style.pointerEvents = 'auto';
            }
            
            // Restore original gap based on screen size
            const isMobileNow = window.matchMedia('(max-width: 768px)').matches;
            foldersWrapper.style.gap = isMobileNow ? '40px' : '250px';
            
            folderContainer.style.display = 'flex';
            folderContainer.style.opacity = '0';
            folderContainer.style.transform = 'scale(0.8) translateY(-20px)';
            folderContainer.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            privateFolderWrapper.style.transition = 'opacity 0.6s ease';
            
            setTimeout(() => {
              folderContainer.style.opacity = '1';
              folderContainer.style.transform = 'scale(1) translateY(0)';
              privateFolderWrapper.style.opacity = '1';
            }, 50);
            
            // Remove margin from grid
            privateProjectsGrid.style.marginTop = '0';
            
            // Restore title spacing
            const titleElement = privateProjectsSection.querySelector('.category-title');
            if (titleElement) {
              titleElement.style.marginBottom = '';
            }
            
            // Hide grid after animation
            setTimeout(() => {
              privateProjectsGrid.style.display = 'none';
            }, 600);
          }, 300);
          
          gridShown = false;
        }
      });
    }
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProjectFolders);
} else {
  initProjectFolders();
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Folder, initProjectFolders };
}

