// Prime Mobile Hub (PMH) | Developed by Imran Af
// Core Site Logic

// ── DATA LAYER ─────────────────────────────────────────
window.PMH = window.PMH || {};

// ── MOBILE NAVIGATION ──────────────────────────────────
function toggleMobileNav() {
  const mobileNav = document.querySelector('.mobile-nav');
  const hamburger = document.querySelector('.hamburger');
  if (mobileNav) {
    mobileNav.classList.toggle('open');
    if (hamburger) hamburger.classList.toggle('active');
    document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
  }
}

function closeMobileNav() {
  const mobileNav = document.querySelector('.mobile-nav');
  const hamburger = document.querySelector('.hamburger');
  if (mobileNav) {
    mobileNav.classList.remove('open');
    if (hamburger) hamburger.classList.remove('active');
    document.body.style.overflow = '';
  }
}

async function loadJSON(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Failed to load ${path}`);
  return response.json();
}

async function loadAllData() {
  const [products, brands, categories, reviews, settings, newReleases] = await Promise.all([
    loadJSON('data/products.json'),
    loadJSON('data/brands.json'),
    loadJSON('data/categories.json'),
    loadJSON('data/reviews.json'),
    loadJSON('data/settings.json'),
    loadJSON('data/new-releases.json')
  ]);

  window.PMH.products = products;
  window.PMH.brands = brands;
  window.PMH.categories = categories;
  window.PMH.reviews = reviews;
  window.PMH.settings = settings;
  window.PMH.newReleases = newReleases;
}

// ── SETTINGS ───────────────────────────────────────────
function applySettings(settings) {
  document.title = settings.siteName;
  
  document.querySelectorAll('[data-site-name]').forEach(el => {
    el.textContent = settings.siteName;
  });

  document.querySelectorAll('[data-site-short]').forEach(el => {
    el.textContent = settings.siteShort;
  });

  document.querySelectorAll('[data-tagline]').forEach(el => {
    el.textContent = settings.tagline;
  });
}

// ── THEME ──────────────────────────────────────────────
function initTheme() {
  const savedTheme = localStorage.getItem('pmh_theme');
  const defaultTheme = window.PMH?.settings?.theme?.default || 'light';
  const theme = savedTheme || defaultTheme;
  
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeIcon(theme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('pmh_theme', newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  const themeBtn = document.getElementById('theme-toggle');
  if (!themeBtn) return;

  themeBtn.innerHTML = theme === 'light' 
    ? `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`
    : `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
}

// ── NAVBAR ─────────────────────────────────────────────
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');

  // Scroll behavior
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  });

  // Hamburger toggle
  hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileNav?.classList.toggle('open');
  });

  // Close mobile nav on link click
  mobileNav?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger?.classList.remove('active');
      mobileNav.classList.remove('open');
    });
  });
}

// ── TYPEWRITER ─────────────────────────────────────────
function startTypewriter(element, phrases) {
  if (!element || !phrases || phrases.length === 0) return;

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 50;

  function type() {
    const currentPhrase = phrases[phraseIndex];
    
    if (isDeleting) {
      element.textContent = currentPhrase.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 30;
    } else {
      element.textContent = currentPhrase.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 50;
    }

    if (!isDeleting && charIndex === currentPhrase.length) {
      isDeleting = true;
      typingSpeed = 2000;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      typingSpeed = 500;
    }

    setTimeout(type, typingSpeed);
  }

  type();
}

// ── HERO CAROUSEL ──────────────────────────────────────
let carouselInterval;
let currentSlide = 0;

function initCarousel(releases, products) {
  const track = document.getElementById('carousel-track');
  const dotsContainer = document.getElementById('carousel-dots');
  if (!track || !releases || !products) return;

  const currency = window.PMH?.settings?.currencySymbol || 'Rs.';

  // Build slides
  track.innerHTML = releases.map((release, index) => {
    const product = products.find(p => p.id === release.productId);
    if (!product) return '';

    const discountedPrice = product.price * (1 - (product.discount || 0) / 100);

    return `
      <div class="carousel-slide ${index === 0 ? 'active' : ''}" data-index="${index}">
        <img src="${release.heroImage}" alt="${release.heroTitle}">
        <div class="carousel-overlay">
          <div class="carousel-content">
            <h1>${release.heroTitle}</h1>
            <p>${release.heroSubtitle}</p>
            <div class="carousel-price">
              ${product.discount > 0 ? `<span class="original">${currency} ${product.price.toLocaleString('en-PK')}</span>` : ''}
              <span>${currency} ${discountedPrice.toLocaleString('en-PK')}</span>
            </div>
            <div class="carousel-buttons">
              <a href="product.html?id=${product.id}" class="btn btn-primary">Shop Now</a>
              <a href="#products" class="btn btn-secondary">View All</a>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Build dots
  if (dotsContainer) {
    dotsContainer.innerHTML = releases.map((_, index) => `
      <button class="carousel-dot ${index === 0 ? 'active' : ''}" data-index="${index}"></button>
    `).join('');

    dotsContainer.querySelectorAll('.carousel-dot').forEach(dot => {
      dot.addEventListener('click', () => goToSlide(parseInt(dot.dataset.index)));
    });
  }

  // Navigation buttons
  document.getElementById('carousel-prev')?.addEventListener('click', prevSlide);
  document.getElementById('carousel-next')?.addEventListener('click', nextSlide);

  // Touch/swipe support
  let touchStartX = 0;
  let touchEndX = 0;

  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
  }

  // Pause on hover
  track.addEventListener('mouseenter', stopCarousel);
  track.addEventListener('mouseleave', startCarousel);

  startCarousel();
}

function goToSlide(index) {
  const slides = document.querySelectorAll('.carousel-slide');
  const dots = document.querySelectorAll('.carousel-dot');
  
  if (slides.length === 0) return;

  slides.forEach((slide, i) => {
    slide.classList.remove('active', 'prev');
    if (i === index) slide.classList.add('active');
    else if (i === currentSlide) slide.classList.add('prev');
  });

  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });

  currentSlide = index;
}

function nextSlide() {
  const slides = document.querySelectorAll('.carousel-slide');
  const nextIndex = (currentSlide + 1) % slides.length;
  goToSlide(nextIndex);
}

function prevSlide() {
  const slides = document.querySelectorAll('.carousel-slide');
  const prevIndex = (currentSlide - 1 + slides.length) % slides.length;
  goToSlide(prevIndex);
}

function startCarousel() {
  stopCarousel();
  carouselInterval = setInterval(nextSlide, 5500);
}

function stopCarousel() {
  clearInterval(carouselInterval);
}

// ── PRODUCT RENDERING ──────────────────────────────────
function formatPrice(price, discount, currencySymbol) {
  const discounted = discount > 0 ? price * (1 - discount / 100) : price;
  const saved = discount > 0 ? price - discounted : 0;

  return {
    original: `${currencySymbol} ${price.toLocaleString('en-PK')}`,
    discounted: `${currencySymbol} ${discounted.toLocaleString('en-PK')}`,
    saved: `${currencySymbol} ${saved.toLocaleString('en-PK')}`
  };
}

function renderProductCard(product, brands, settings) {
  const brand = brands.find(b => b.name === product.brand);
  const price = formatPrice(product.price, product.discount, settings.currencySymbol);

  return `
    <article class="product-card" onclick="window.location.href='product.html?id=${product.id}'">
      <div class="product-card-image">
        <img src="${product.images[0]}" alt="${product.name}" loading="lazy">
        ${product.badge ? `<span class="product-card-badge ${product.badge.toLowerCase()}">${product.badge}</span>` : ''}
        <div class="product-card-actions" onclick="event.stopPropagation()">
          <button class="card-action-btn ${Wishlist.isInList(product.id) ? 'active' : ''}" 
                  data-wishlist-btn data-id="${product.id}"
                  onclick="Wishlist.toggle('${product.id}')"
                  title="Add to Wishlist">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="${Wishlist.isInList(product.id) ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
          <button class="card-action-btn ${Compare.isInList(product.id) ? 'active' : ''}" 
                  data-compare-btn data-id="${product.id}"
                  onclick="Compare.toggle('${product.id}')"
                  title="Compare">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
          </button>
        </div>
      </div>
      <div class="product-card-info">
        <div class="product-card-brand">${product.brand}</div>
        <h3 class="product-card-name">${product.name}</h3>
        <div class="product-card-price">
          <span class="current">${price.discounted}</span>
          ${product.discount > 0 ? `<span class="original">${price.original}</span>` : ''}
          ${product.discount > 0 ? `<span class="saved">Save ${product.discount}%</span>` : ''}
        </div>
      </div>
    </article>
  `;
}

function renderGrid(containerId, products, brands, settings) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = products.map(product => 
    renderProductCard(product, brands, settings)
  ).join('');
}

// ── FILTERS & SEARCH ───────────────────────────────────
let activeBrand = 'All';
let activeCategory = 'All';
let searchQuery = '';

function initFilters(products, brands, categories, settings) {
  const brandFilters = document.getElementById('brand-filters');
  const categoryFilters = document.getElementById('category-filters');

  // Brand filters
  if (brandFilters) {
    brandFilters.innerHTML = `
      <button class="filter-btn active" data-brand="All">All Brands</button>
      ${brands.map(brand => `
        <button class="filter-btn" data-brand="${brand.name}">
          ${brand.name}
        </button>
      `).join('')}
    `;

    brandFilters.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        brandFilters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeBrand = btn.dataset.brand;
        applyFilters();
      });
    });
  }

  // Category filters
  if (categoryFilters) {
    categoryFilters.innerHTML = categories.map(cat => `
      <button class="filter-btn ${cat.name === 'All' ? 'active' : ''}" data-category="${cat.name}">
        ${cat.name}
      </button>
    `).join('');

    categoryFilters.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        categoryFilters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCategory = btn.dataset.category;
        applyFilters();
      });
    });
  }
}

function applyFilters() {
  const products = window.PMH?.products || [];
  const brands = window.PMH?.brands || [];
  const settings = window.PMH?.settings || {};

  const filtered = products.filter(product => {
    const matchesBrand = activeBrand === 'All' || product.brand === activeBrand;
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesBrand && matchesCategory && matchesSearch;
  });

  renderGrid('product-grid', filtered, brands, settings);
}

function initSearch() {
  const navSearch = document.getElementById('nav-search-input');
  const sectionSearch = document.getElementById('section-search-input');

  navSearch?.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    if (sectionSearch) sectionSearch.value = searchQuery;
    applyFilters();
  });

  sectionSearch?.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    if (navSearch) navSearch.value = searchQuery;
    applyFilters();
  });
}

// ── NEW RELEASES ───────────────────────────────────────
function renderNewReleases(releases, products, brands, settings) {
  const container = document.getElementById('new-releases-grid');
  if (!container) return;

  const newProducts = products.filter(p => p.isNew);
  renderGrid('new-releases-grid', newProducts, brands, settings);
}

// ── REVIEWS ────────────────────────────────────────────
function renderReviews(reviews) {
  const container = document.getElementById('reviews-grid');
  if (!container) return;

  container.innerHTML = reviews.map(review => `
    <div class="review-card">
      <div class="review-header">
        <div class="review-avatar">${review.initials}</div>
        <div class="review-meta">
          <h4>${review.name}</h4>
          <span>${review.location}</span>
        </div>
      </div>
      <div class="review-stars">
        ${Array(5).fill(0).map((_, i) => `
          <svg class="${i < review.rating ? '' : 'empty'}" viewBox="0 0 24 24" fill="${i < review.rating ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        `).join('')}
      </div>
      <div class="review-product">${review.product}</div>
      <p class="review-text">${review.comment}</p>
    </div>
  `).join('');

  // IntersectionObserver for fade-in animation
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  container.querySelectorAll('.review-card').forEach(card => {
    observer.observe(card);
  });
}

// ── INIT ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  
  try {
    await loadAllData();
    applySettings(window.PMH.settings);
    initNavbar();
    initCarousel(window.PMH.newReleases, window.PMH.products);
    
    const typewriter = document.getElementById('typewriter');
    startTypewriter(typewriter, window.PMH.settings.heroTaglines);
    
    renderNewReleases(window.PMH.newReleases, window.PMH.products, window.PMH.brands, window.PMH.settings);
    renderGrid('product-grid', window.PMH.products, window.PMH.brands, window.PMH.settings);
    initFilters(window.PMH.products, window.PMH.brands, window.PMH.categories, window.PMH.settings);
    initSearch();
    renderReviews(window.PMH.reviews);
    updateAllBadges();
  } catch (error) {
    console.error('Failed to initialize:', error);
    showToast('Failed to load data. Please refresh.', 'error');
  }
});
