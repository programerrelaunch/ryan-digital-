/**
 * Consalt Theme - Ryan Barroga Portfolio JS
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeroSlider();
  initNavigation();
  initCounters();
  initPortfolio();
  initLightbox();
  initFAQ();
  initContactForm();
  setYear();
});

/* Hero Slider */
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const prevBtn = document.querySelector('.hero-prev');
  const nextBtn = document.querySelector('.hero-next');
  const progressBar = document.querySelector('.hero-progress-bar');
  let current = 0;
  let interval;
  const duration = 6000;

  function showSlide(index) {
    slides.forEach((s, i) => s.classList.toggle('active', i === index));
    current = index;
    resetProgress();
  }

  function nextSlide() {
    showSlide((current + 1) % slides.length);
  }

  function prevSlide() {
    showSlide((current - 1 + slides.length) % slides.length);
  }

  function resetProgress() {
    if (progressBar) progressBar.style.width = '0';
    clearInterval(interval);
    let start = Date.now();
    interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / duration) * 100, 100);
      if (progressBar) progressBar.style.width = pct + '%';
      if (elapsed >= duration) nextSlide();
    }, 50);
  }

  prevBtn?.addEventListener('click', prevSlide);
  nextBtn?.addEventListener('click', nextSlide);
  if (slides.length) resetProgress();
}

/* Navigation */
function initNavigation() {
  const navToggle = document.getElementById('nav-toggle');
  const mainNav = document.getElementById('main-nav');
  const navLinks = document.querySelectorAll('.main-nav a');

  navToggle?.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    mainNav.classList.toggle('active');
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navToggle?.classList.remove('active');
      mainNav?.classList.remove('active');
    });
  });

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY + 120;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) link.classList.add('active');
        });
      }
    });
  });
}

/* Counters */
function initCounters() {
  const counters = document.querySelectorAll('.counter');
  let done = false;

  function animate() {
    if (done) return;
    counters.forEach(counter => {
      const rect = counter.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        done = true;
        const target = parseInt(counter.dataset.count, 10);
        const duration = 2000;
        const start = performance.now();
        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          counter.textContent = Math.floor(target * (1 - Math.pow(1 - progress, 3)));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    });
  }

  window.addEventListener('scroll', animate);
  animate();
}

/* Portfolio - dynamic from shanewebguy.com showcase */
function initPortfolio() {
  const grid = document.getElementById('portfolio-grid');
  const loadBtn = document.getElementById('portfolio-load-more');
  if (!grid) return;

  let projects = [];
  let visible = 0;
  const batch = 12;

  function startPortfolio(data) {
    projects = Array.isArray(data) ? data : [];
    if (!projects.length) {
      grid.innerHTML = '<p class="portfolio-error">No portfolio projects found.</p>';
      if (loadBtn) loadBtn.style.display = 'none';
      return;
    }
    renderBatch();
    if (loadBtn && !loadBtn.dataset.bound) {
      loadBtn.dataset.bound = '1';
      loadBtn.addEventListener('click', renderBatch);
    }
  }

  if (Array.isArray(window.PORTFOLIO_DATA) && window.PORTFOLIO_DATA.length) {
    startPortfolio(window.PORTFOLIO_DATA);
    return;
  }

  fetch('portfolio-data.json')
    .then(res => res.json())
    .then(startPortfolio)
    .catch(err => {
      console.error('Portfolio load failed:', err);
      grid.innerHTML = '<p class="portfolio-error">Unable to load portfolio projects.</p>';
    });

  function renderBatch() {
    const next = projects.slice(visible, visible + batch);
    next.forEach(project => grid.appendChild(createPortfolioItem(project)));
    visible += next.length;

    if (loadBtn) {
      if (visible >= projects.length) {
        loadBtn.style.display = 'none';
      } else {
        loadBtn.textContent = `Load More (${projects.length - visible} remaining)`;
      }
    }
  }

  function createPortfolioItem(project) {
    const item = document.createElement('div');
    item.className = 'portfolio-item';

    const hasUrl = project.url && project.url.startsWith('http');
    const titleHtml = hasUrl
      ? `<a href="${project.url}" target="_blank" rel="noreferrer">${escapeHtml(project.title)}</a>`
      : escapeHtml(project.title);

    const caption = hasUrl
      ? `<a href="${project.url}" target="_blank" rel="noreferrer">Visit live site</a>`
      : 'Website design project';

    item.innerHTML = `
      <div class="portfolio-img">
        <img src="${project.image}" alt="${escapeHtml(project.title)} website preview" loading="lazy" referrerpolicy="no-referrer" />
        <div class="portfolio-overlay">
          <div class="portfolio-info">
            <span class="portfolio-cat">Web Design</span>
            <h3>${titleHtml}</h3>
          </div>
          <button class="portfolio-view" data-image="${project.image}" data-title="${escapeHtml(project.title)}" aria-label="View ${escapeHtml(project.title)}">
            <i class="fas fa-plus"></i>
          </button>
        </div>
      </div>
      <p class="portfolio-caption">${caption}</p>
    `;

    return item;
  }

  function escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');
  }
}

/* Lightbox */
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  const title = document.getElementById('lightbox-title');

  document.addEventListener('click', e => {
    const btn = e.target.closest('.portfolio-view');
    if (!btn) return;
    img.src = btn.dataset.image;
    img.alt = btn.dataset.title;
    title.textContent = btn.dataset.title;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  document.querySelectorAll('[data-close]').forEach(el => {
    el.addEventListener('click', close);
  });

  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  function close() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/* FAQ Accordion */
function initFAQ() {
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const wasActive = item.classList.contains('active');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
      if (!wasActive) item.classList.add('active');
    });
  });
}

/* Contact Form */
function initContactForm() {
  document.getElementById('contact-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const subject = encodeURIComponent('Portfolio Inquiry: ' + (fd.get('projectType') || 'General'));
    const body = encodeURIComponent(
      'Name: ' + fd.get('name') + '\nEmail: ' + fd.get('email') +
      '\nProject: ' + (fd.get('projectType') || 'N/A') + '\n\n' + fd.get('message')
    );
    window.location.href = 'mailto:skater.ryan11@gmail.com?subject=' + subject + '&body=' + body;
  });
}

function setYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}
