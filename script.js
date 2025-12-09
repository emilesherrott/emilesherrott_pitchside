// DOM READY IIFE
(function() {
  const sideMenu = document.getElementById('side-menu');
  const menuToggle = document.getElementById('menu-toggle');
  const hero = document.getElementById('hero');
  const heroOverlay = document.getElementById('hero-overlay');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');

  // PROTECT HERO IMAGE
  if (hero) {
    const heroOverlayDiv = document.createElement('div');
    heroOverlayDiv.style.position = 'absolute';
    heroOverlayDiv.style.top = '0';
    heroOverlayDiv.style.left = '0';
    heroOverlayDiv.style.width = '100%';
    heroOverlayDiv.style.height = '100%';
    heroOverlayDiv.style.background = 'transparent';
    heroOverlayDiv.style.zIndex = '2';
    heroOverlayDiv.style.cursor = 'pointer';
    heroOverlayDiv.addEventListener('contextmenu', e => e.preventDefault());
    heroOverlayDiv.addEventListener('touchstart', e => e.preventDefault());
    hero.appendChild(heroOverlayDiv);
  }

  // AUTO LOAD MATCH IMAGES WITH OVERLAY TO BLOCK RIGHT-CLICK
  document.querySelectorAll('.match-section').forEach((section, index) => {
    const gallery = section.querySelector('.match-gallery');
    gallery.innerHTML = '';

    for (let i = 1; i <= 4; i++) {
      const imgWrapper = document.createElement('div');
      imgWrapper.style.position = 'relative';
      imgWrapper.style.display = 'inline-block';

      const img = document.createElement('img');
      img.src = `./photographs/match${index + 1}/${i}.jpg`;
      img.alt = `Match ${index + 1} image ${i}`;
      img.loading = 'lazy';
      img.tabIndex = 0;
      img.style.display = 'block';
      img.style.pointerEvents = 'none';
      img.style.userSelect = 'none';
      img.addEventListener('load', () => img.style.opacity = '1');

      const overlay = document.createElement('div');
      overlay.style.position = 'absolute';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.cursor = 'pointer';
      overlay.style.background = 'transparent';
      overlay.addEventListener('contextmenu', e => e.preventDefault());
      overlay.addEventListener('touchstart', e => e.preventDefault());
      overlay.addEventListener('click', () => openLightbox(img.src, img.alt));

      imgWrapper.appendChild(img);
      imgWrapper.appendChild(overlay);
      gallery.appendChild(imgWrapper);
    }
  });

  // OPEN LIGHTBOX FUNCTION
  function openLightbox(src, alt) {
    lightboxImg.src = src;
    lightboxImg.alt = alt || 'Expanded photo';
    lightbox.style.display = 'flex';
    lightbox.setAttribute('aria-hidden', 'false');
    lightboxClose.focus();
  }

  // LIGHTBOX OVERLAY TO BLOCK RIGHT-CLICK AND LONG PRESS
  let lightboxOverlay = document.getElementById('lightbox-overlay');
  if (!lightboxOverlay) {
    lightboxOverlay = document.createElement('div');
    lightboxOverlay.id = 'lightbox-overlay';
    lightboxOverlay.style.position = 'absolute';
    lightboxOverlay.style.top = '0';
    lightboxOverlay.style.left = '0';
    lightboxOverlay.style.width = '100%';
    lightboxOverlay.style.height = '100%';
    lightboxOverlay.style.background = 'transparent';
    lightboxOverlay.style.zIndex = '102';
    lightboxOverlay.style.cursor = 'pointer';
    lightboxOverlay.addEventListener('click', () => closeLightbox());
    lightboxOverlay.addEventListener('contextmenu', e => e.preventDefault());
    lightboxOverlay.addEventListener('touchstart', e => e.preventDefault());
    lightbox.appendChild(lightboxOverlay);
  }

  // SMOOTH SCROLL MENU LINKS
  document.addEventListener('click', e => {
    const anchor = e.target.closest('.side-menu a');
    if (!anchor) return;
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (sideMenu.classList.contains('open')) {
      sideMenu.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });

  // MENU TOGGLE
  menuToggle.addEventListener('click', () => {
    const open = sideMenu.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // SCROLL BEHAVIOR - HIDE MENU EARLY WHEN HERO H1 IS REACHED
// SCROLL BEHAVIOR - HIDE MENU EARLY WHEN HERO H1 IS REACHED
let heroH1 = heroOverlay.querySelector('h1');
const sideMenuHeight = sideMenu.offsetHeight || 0;
let triggerOffset = heroH1 ? heroH1.getBoundingClientRect().top + window.scrollY - sideMenuHeight - 40 : hero.offsetHeight - 80;

function onScroll() {
  const scrolled = window.scrollY > triggerOffset;
  if (scrolled) sideMenu.classList.add('hidden'); 
  else sideMenu.classList.remove('hidden');

  if (scrolled) heroOverlay.classList.add('scrolled'); 
  else heroOverlay.classList.remove('scrolled');
}

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', () => {
  heroH1 = heroOverlay.querySelector('h1');
  triggerOffset = heroH1 ? heroH1.getBoundingClientRect().top + window.scrollY - sideMenuHeight - 20 : hero.offsetHeight - 80;
});


  // KEYBOARD HANDLING
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && lightbox.style.display === 'flex') closeLightbox();
    if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && lightbox.style.display === 'flex')
      navigateLightbox(e.key === 'ArrowRight' ? 1 : -1);
    if (e.key === 'Enter' && document.activeElement && document.activeElement.matches('.match-gallery img')) {
      document.activeElement.parentElement.querySelector('div').click();
    }
  });

  // CLOSE LIGHTBOX
  function closeLightbox() {
    lightbox.style.display = 'none';
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImg.src = '';
  }
  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

  // LIGHTBOX NAVIGATION
  function navigateLightbox(direction) {
    const currentSrc = lightboxImg.src;
    const all = Array.from(document.querySelectorAll('.match-gallery img'));
    if (!all.length) return;
    const idx = all.findIndex(i => i.src === currentSrc);
    if (idx === -1) return;
    let next = idx + direction;
    if (next < 0) next = all.length - 1;
    if (next >= all.length) next = 0;
    lightboxImg.src = all[next].src;
    lightboxImg.alt = all[next].alt;
  }
})();
