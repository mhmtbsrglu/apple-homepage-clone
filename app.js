(() => {
  const searchButton = document.querySelector('.search-trigger');
  const bagButton = document.querySelector('.bag-trigger');
  const menuButton = document.querySelector('.menu-trigger');
  const searchPanel = document.querySelector('#searchPanel');
  const bagPanel = document.querySelector('#bagPanel');
  const navLinks = document.querySelector('#navLinks');
  const toast = document.querySelector('#toast');
  const bagCount = document.querySelector('.bag-count');
  const bagSummary = document.querySelector('#bagSummary');
  const bagItems = document.querySelector('#bagItems');
  const storyTrack = document.querySelector('#storyTrack');
  const progressFill = document.querySelector('#carouselProgress');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let itemsInBag = 0;
  let toastTimer;
  const panelTimers = new WeakMap();

  const hidePanel = (panel) => {
    if (panel.hidden) return;
    window.clearTimeout(panelTimers.get(panel));
    panel.classList.remove('is-open');
    panelTimers.set(panel, window.setTimeout(() => { panel.hidden = true; }, 190));
  };
  const showPanel = (panel) => {
    window.clearTimeout(panelTimers.get(panel));
    panel.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => panel.classList.add('is-open')));
  };
  const closePanels = () => {
    hidePanel(searchPanel);
    hidePanel(bagPanel);
    searchButton.setAttribute('aria-expanded', 'false');
    bagButton.setAttribute('aria-expanded', 'false');
  };

  searchButton.addEventListener('click', () => {
    const opening = searchPanel.hidden;
    closePanels();
    if (opening) {
      showPanel(searchPanel);
      searchButton.setAttribute('aria-expanded', 'true');
      window.setTimeout(() => document.querySelector('#siteSearch').focus(), 20);
    }
  });
  bagButton.addEventListener('click', () => {
    const opening = bagPanel.hidden;
    closePanels();
    if (opening) {
      showPanel(bagPanel);
      bagButton.setAttribute('aria-expanded', 'true');
    }
  });
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    menuButton.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
    navLinks.classList.toggle('is-open', !open);
    if (!open) closePanels();
  });
  navLinks.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      navLinks.classList.remove('is-open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open menu');
    }
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.site-header')) closePanels();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closePanels();
      navLinks.classList.remove('is-open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open menu');
    }
  });

  document.querySelectorAll('[data-add]').forEach((button) => {
    button.addEventListener('click', () => {
      itemsInBag += 1;
      bagCount.textContent = String(itemsInBag);
      bagCount.setAttribute('aria-label', `${itemsInBag} ${itemsInBag === 1 ? 'item' : 'items'}`);
      bagSummary.textContent = `Your bag has ${itemsInBag} ${itemsInBag === 1 ? 'item' : 'items'}.`;
      const bagLine = document.createElement('li');
      bagLine.textContent = button.dataset.add;
      bagItems.append(bagLine);
      toast.textContent = `${button.dataset.add} added to your bag.`;
      toast.classList.add('is-visible');
      window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2400);
    });
  });

  const updateProgress = () => {
    const maxScroll = storyTrack.scrollWidth - storyTrack.clientWidth;
    const ratio = maxScroll > 0 ? storyTrack.scrollLeft / maxScroll : 0;
    const fill = Math.max(.25, storyTrack.clientWidth / storyTrack.scrollWidth);
    const width = `${fill * 100}%`;
    if (progressFill.style.width !== width) progressFill.style.width = width;
    progressFill.style.transform = `translateX(${ratio * (100 / fill)}%)`;
  };
  document.querySelectorAll('[data-scroll]').forEach((button) => {
    button.addEventListener('click', () => {
      const direction = Number(button.dataset.scroll);
      storyTrack.scrollBy({ left: direction * Math.max(260, storyTrack.clientWidth * .72), behavior: reduceMotion.matches ? 'instant' : 'smooth' });
    });
  });
  storyTrack.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();
})();
