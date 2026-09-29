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
  const progressFill = document.querySelector('#carouselProgress');
  const storyButtons = [...document.querySelectorAll('[data-scroll]')];
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

  const updateProgress = () => {
    const maxScroll = Math.max(0, storyTrack.scrollWidth - storyTrack.clientWidth);
    const ratio = maxScroll > 0 ? storyTrack.scrollLeft / maxScroll : 0;
    const fill = Math.min(1, storyTrack.clientWidth / storyTrack.scrollWidth);
    const width = `${fill * 100}%`;
    if (progressFill.style.width !== width) progressFill.style.width = width;
    progressFill.style.transform = `translateX(${ratio * ((1 - fill) / fill) * 100}%)`;
    storyButtons.forEach((button) => {
      button.disabled = maxScroll < 1 || (Number(button.dataset.scroll) < 0 ? storyTrack.scrollLeft <= 1 : storyTrack.scrollLeft >= maxScroll - 1);
    });
  };
  storyButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const direction = Number(button.dataset.scroll);
      const firstCard = storyTrack.querySelector('.story');
      const gap = Number.parseFloat(getComputedStyle(storyTrack).columnGap) || 0;
      const step = firstCard.getBoundingClientRect().width + gap;
      const maxScroll = Math.max(0, storyTrack.scrollWidth - storyTrack.clientWidth);
      const nextPosition = Math.max(0, Math.min(maxScroll, storyTrack.scrollLeft + direction * step));
      storyTrack.scrollTo({ left: nextPosition, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    });
  });
  storyTrack.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Home') storyTrack.scrollTo({ left: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    else if (event.key === 'End') storyTrack.scrollTo({ left: storyTrack.scrollWidth, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    else storyButtons.find((button) => Number(button.dataset.scroll) === (event.key === 'ArrowRight' ? 1 : -1))?.click();
  });
  storyTrack.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  const firstStory = storyTrack.querySelector('.story');
  if (firstStory && storyTrack.scrollWidth > storyTrack.clientWidth) {
    const gap = Number.parseFloat(getComputedStyle(storyTrack).columnGap) || 0;
    storyTrack.scrollLeft = firstStory.getBoundingClientRect().width + gap;
  }
  updateProgress();

  const revealSelector = '.hero-copy, .product-tile, .entertainment-heading, .story, .carousel-progress, .service-promo, .footer-note, .footer-breadcrumb, .footer-columns > div, .footer-bottom';
  const revealItems = [...document.querySelectorAll(revealSelector)];
  const revealOrder = new Map();
  revealItems.forEach((item) => {
    const order = revealOrder.get(item.parentElement) || 0;
    revealOrder.set(item.parentElement, order + 1);
    item.classList.add('scroll-reveal');
    item.style.setProperty('--reveal-delay', `${Math.min(order, 4) * 45}ms`);
  });

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('is-visible', entry.isIntersecting);
        entry.target.classList.toggle('is-exiting', !entry.isIntersecting);
      });
    }, { threshold: 0.02, rootMargin: '64px 0px 64px 0px' });

    revealItems.forEach((item) => revealObserver.observe(item));
    document.addEventListener('focusin', (event) => {
      const item = event.target.closest('.scroll-reveal');
      if (item) {
        item.classList.add('is-visible');
        item.classList.remove('is-exiting');
      }
    });
    document.body.classList.add('has-scroll-reveals');
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }
})();
