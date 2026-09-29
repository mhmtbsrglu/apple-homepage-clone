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
  const bagTotals = document.querySelector('#bagTotals');
  const bagSubtotal = document.querySelector('#bagSubtotal');
  const bagNote = document.querySelector('#bagNote');
  const storyTrack = document.querySelector('#storyTrack');
  const storyButtons = [...document.querySelectorAll('[data-scroll]')];
  const dotsContainer = document.querySelector('#carouselDots');
  const autoplayToggle = document.querySelector('#autoplayToggle');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const cart = new Map();
  const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
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

  const renderBag = () => {
    const products = [...cart.values()];
    const itemCount = products.reduce((total, product) => total + product.quantity, 0);
    const subtotal = products.reduce((total, product) => total + product.price * product.quantity, 0);

    bagCount.textContent = String(itemCount);
    bagCount.setAttribute('aria-label', `${itemCount} ${itemCount === 1 ? 'item' : 'items'}`);
    bagSummary.textContent = itemCount ? `Your bag has ${itemCount} ${itemCount === 1 ? 'item' : 'items'}.` : 'Your bag is empty.';
    bagTotals.hidden = itemCount === 0;
    bagSubtotal.textContent = money.format(subtotal);
    bagNote.textContent = itemCount ? 'Free delivery and easy returns.' : 'Sign in to see if you have any saved items.';

    bagItems.replaceChildren(...products.map((product) => {
      const row = document.createElement('li');
      row.className = 'bag-item';

      const image = document.createElement('img');
      image.className = 'bag-item-image';
      image.src = product.image;
      image.alt = '';

      const details = document.createElement('div');
      details.className = 'bag-item-copy';
      const name = document.createElement('strong');
      name.textContent = product.name;
      const unitPrice = document.createElement('span');
      unitPrice.className = 'bag-item-price';
      unitPrice.textContent = `Each ${money.format(product.price)}`;
      const quantity = document.createElement('span');
      quantity.className = 'bag-item-quantity';
      quantity.textContent = `Qty ${product.quantity}`;
      details.append(name, unitPrice, quantity);

      const lineTotal = document.createElement('strong');
      lineTotal.className = 'bag-line-total';
      lineTotal.textContent = money.format(product.price * product.quantity);

      const remove = document.createElement('button');
      remove.className = 'bag-remove';
      remove.type = 'button';
      remove.dataset.cartAction = 'remove';
      remove.dataset.product = product.name;
      remove.setAttribute('aria-label', `Remove ${product.name} from your bag`);
      remove.textContent = '×';
      row.append(image, details, lineTotal, remove);
      return row;
    }));
  };

  document.querySelectorAll('[data-add]').forEach((button) => {
    button.addEventListener('click', () => {
      const name = button.dataset.add;
      const product = cart.get(name) || {
        name,
        image: button.dataset.image,
        price: Number(button.dataset.price),
        quantity: 0,
      };
      product.quantity += 1;
      cart.set(name, product);
      renderBag();
      toast.textContent = `${name} added to your bag.`;
      toast.classList.add('is-visible');
      window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2400);
    });
  });

  bagItems.addEventListener('click', (event) => {
    const action = event.target.closest('[data-cart-action]');
    if (!action) return;

    const product = cart.get(action.dataset.product);
    if (!product) return;
    if (action.dataset.cartAction === 'remove' || product.quantity === 1) {
      cart.delete(product.name);
    } else {
      product.quantity -= 1;
    }
    renderBag();
  });

  const stories = [...storyTrack.querySelectorAll('.story')];
  const storyCount = stories.length;
  const cloneStory = (story, side) => {
    const clone = story.cloneNode(true);
    clone.dataset.carouselClone = side;
    clone.setAttribute('aria-hidden', 'true');
    clone.querySelectorAll('a, button, input, [tabindex]').forEach((item) => item.setAttribute('tabindex', '-1'));
    clone.querySelectorAll('img').forEach((image) => { image.loading = 'eager'; });
    return clone;
  };
  if (storyCount > 1) {
    storyTrack.prepend(cloneStory(stories[storyCount - 1], 'before'));
    storyTrack.append(cloneStory(stories[0], 'after'));
  }

  const dots = stories.map((story, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'carousel-dot';
    dot.setAttribute('aria-label', `Show story ${index + 1}: ${story.querySelector('h3')?.textContent.trim() || 'Apple TV'}`);
    const shape = document.createElement('div');
    shape.className = 'carousel-dot-shape';
    shape.setAttribute('aria-hidden', 'true');
    shape.style.width = '7px';
    shape.style.height = '7px';
    dot.append(shape);
    dot.addEventListener('click', () => {
      goToStory(index);
      resetAutoplay();
    });
    dotsContainer.append(dot);
    return dot;
  });

  let activeStory = 0;
  let autoplayTimer;
  let settleTimer;
  let interactionTimer;
  let userPaused = reduceMotion.matches;
  let inViewport = true;
  let hovered = false;
  let focused = false;
  let interacting = false;

  const geometry = () => {
    const card = storyTrack.querySelector('.story');
    const gap = Number.parseFloat(getComputedStyle(storyTrack).columnGap) || 0;
    return { step: card.getBoundingClientRect().width + gap };
  };
  const goToStory = (index, behavior = reduceMotion.matches ? 'auto' : 'smooth') => {
    const { step } = geometry();
    const wrappedIndex = (index + storyCount) % storyCount;
    activeStory = wrappedIndex;
    storyTrack.scrollTo({ left: (wrappedIndex + 1) * step, behavior });
    updateCarousel();
  };
  const updateCarousel = () => {
    if (!storyCount) return;
    const { step } = geometry();
    const slide = Math.round(storyTrack.scrollLeft / step);
    const index = ((slide - 1) % storyCount + storyCount) % storyCount;
    activeStory = index;
    dots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === index;
      const clockwiseDistance = (dotIndex - index + storyCount) % storyCount;
      const counterClockwiseDistance = (index - dotIndex + storyCount) % storyCount;
      const distance = Math.min(clockwiseDistance, counterClockwiseDistance);
      const dotSize = Math.max(4, 8 - distance);
      dot.classList.toggle('is-active', isActive);
      const shape = dot.querySelector('.carousel-dot-shape');
      shape.style.width = isActive ? '18px' : `${dotSize}px`;
      shape.style.height = isActive ? '7px' : `${dotSize}px`;
      shape.style.borderRadius = isActive ? '999px' : '50%';
      if (isActive) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  };
  const normalizeLoop = () => {
    const { step } = geometry();
    const slide = Math.round(storyTrack.scrollLeft / step);
    if (slide === 0) storyTrack.scrollTo({ left: storyCount * step, behavior: 'auto' });
    else if (slide === storyCount + 1) storyTrack.scrollTo({ left: step, behavior: 'auto' });
    updateCarousel();
  };
  const syncAutoplay = () => {
    window.clearInterval(autoplayTimer);
    if (userPaused || hovered || focused || interacting || !inViewport || document.hidden || storyCount < 2) return;
    autoplayTimer = window.setInterval(() => goToStory(activeStory + 1), 6500);
  };
  const resetAutoplay = () => {
    syncAutoplay();
  };

  storyButtons.forEach((button) => {
    button.addEventListener('click', () => {
      goToStory(activeStory + Number(button.dataset.scroll));
      resetAutoplay();
    });
  });
  storyTrack.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Home') goToStory(0);
    else if (event.key === 'End') goToStory(storyCount - 1);
    else goToStory(activeStory + (event.key === 'ArrowRight' ? 1 : -1));
    resetAutoplay();
  });
  storyTrack.addEventListener('scroll', () => {
    updateCarousel();
    window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(normalizeLoop, 140);
  }, { passive: true });
  window.addEventListener('resize', () => goToStory(activeStory, 'auto'));
  storyTrack.addEventListener('pointerdown', () => {
    interacting = true;
    window.clearTimeout(interactionTimer);
    syncAutoplay();
  }, { passive: true });
  window.addEventListener('pointerup', () => {
    window.clearTimeout(interactionTimer);
    interactionTimer = window.setTimeout(() => { interacting = false; resetAutoplay(); }, 800);
  }, { passive: true });
  window.addEventListener('pointercancel', () => { interacting = false; resetAutoplay(); }, { passive: true });
  const carousel = document.querySelector('.entertainment');
  carousel.addEventListener('pointerenter', () => { hovered = true; syncAutoplay(); });
  carousel.addEventListener('pointerleave', () => { hovered = false; syncAutoplay(); });
  carousel.addEventListener('focusin', () => { focused = true; syncAutoplay(); });
  carousel.addEventListener('focusout', (event) => {
    if (!carousel.contains(event.relatedTarget)) { focused = false; syncAutoplay(); }
  });
  document.addEventListener('visibilitychange', syncAutoplay);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      inViewport = entry.isIntersecting;
      syncAutoplay();
    }, { threshold: 0.1 }).observe(carousel);
  }
  autoplayToggle.addEventListener('click', () => {
    userPaused = !userPaused;
    autoplayToggle.setAttribute('aria-pressed', String(userPaused));
    autoplayToggle.setAttribute('aria-label', userPaused ? 'Play automatic playback' : 'Pause automatic playback');
    autoplayToggle.querySelector('span').textContent = userPaused ? '▶' : 'Ⅱ';
    syncAutoplay();
  });
  autoplayToggle.disabled = reduceMotion.matches;
  autoplayToggle.setAttribute('aria-pressed', String(userPaused));
  autoplayToggle.setAttribute('aria-label', reduceMotion.matches ? 'Automatic playback is disabled by reduced-motion settings' : 'Pause automatic playback');
  autoplayToggle.querySelector('span').textContent = userPaused ? '▶' : 'Ⅱ';
  reduceMotion.addEventListener('change', (event) => {
    userPaused = event.matches;
    autoplayToggle.disabled = event.matches;
    autoplayToggle.setAttribute('aria-pressed', String(userPaused));
    autoplayToggle.setAttribute('aria-label', event.matches ? 'Automatic playback is disabled by reduced-motion settings' : 'Pause automatic playback');
    autoplayToggle.querySelector('span').textContent = userPaused ? '▶' : 'Ⅱ';
    syncAutoplay();
  });
  if (storyCount > 1) storyTrack.scrollLeft = geometry().step;
  updateCarousel();
  syncAutoplay();
})();
