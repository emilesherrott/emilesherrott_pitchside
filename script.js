(async function () {
  const mainContent = document.querySelector('.main-content');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');
  const sideMenu = document.getElementById('side-menu');
  const heroOverlay = document.getElementById('hero-overlay');

  // --- CREATE IMAGE WRAPPER ---
  function createImageWrapper(src, alt) {
    const imgWrapper = document.createElement('div');
    Object.assign(imgWrapper.style, { position: 'relative', display: 'inline-block' });

    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    img.loading = 'lazy';
    img.tabIndex = 0;
    img.style.display = 'block';
    img.style.opacity = 0;
    img.style.transition = 'opacity 0.6s ease';
    img.addEventListener('load', () => img.style.opacity = 1);

    const overlay = document.createElement('div');
    Object.assign(overlay.style, { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer', background: 'transparent' });
    overlay.addEventListener('click', () => openLightbox(img.src, img.alt));

    imgWrapper.appendChild(img);
    imgWrapper.appendChild(overlay);
    return imgWrapper;
  }

  // --- LOAD STATIC MATCHES ---
  function loadStaticMatches() {
    document.querySelectorAll('.match-section').forEach((section, index) => {
      if (index > 2) return;
      const gallery = section.querySelector('.match-gallery');
      gallery.innerHTML = '';
      for (let i = 1; i <= 4; i++) {
        gallery.appendChild(createImageWrapper(`./photographs/match${index + 1}/${i}.jpg`, `Match ${index + 1} image ${i}`));
      }
    });
  }

  // --- LIGHTBOX ---
  function openLightbox(src, alt) {
    lightboxImg.src = src;
    lightboxImg.alt = alt || 'Expanded photo';
    lightbox.style.display = 'flex';
  }
  function closeLightbox() {
    lightbox.style.display = 'none';
    lightboxImg.src = '';
  }
  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

  loadStaticMatches();

  // --- DYNAMIC MATCHES ---
  let dynamicMatches = [];
  let nextMatchIndex = 0;
  let currentMatchImagesLoaded = 0;
  let loadingImages = false;
  const imagesPerPage = 4;

  async function initDynamicMatches() {
    try {
      const res = await fetch('https://api.emilesherrottpitchside.com/api/events');
      const events = await res.json();
      dynamicMatches = events.filter(ev => !['match1','match2','match3'].includes(ev.id));
    } catch (err) {
      console.error('Failed to load dynamic matches:', err);
    }
  }

  async function fetchNextImageBatch() {
    if (loadingImages || nextMatchIndex >= dynamicMatches.length) return;

    const match = dynamicMatches[nextMatchIndex];
    if (!match) return;
    loadingImages = true;

    // Create section if not exists
    let section = document.getElementById(match.id);
    if (!section) {
      section = document.createElement('section');
      section.classList.add('match-section');
      section.id = match.id;
      const h2 = document.createElement('h2');
      h2.textContent = match.title;
      const p = document.createElement('p');
      p.textContent = match.date;
      const gallery = document.createElement('div');
      gallery.classList.add('match-gallery');
      section.append(h2, p, gallery);
      mainContent.appendChild(section);
      currentMatchImagesLoaded = 0;
    }

    const gallery = section.querySelector('.match-gallery');

    try {
      const res = await fetch(`https://api.emilesherrottpitchside.com/api/events/${match.id}/images?offset=${currentMatchImagesLoaded}&limit=${imagesPerPage}`);
      const data = await res.json();
      data.images.forEach((imgPath, i) => {
        gallery.appendChild(createImageWrapper(`https://api.emilesherrottpitchside.com${imgPath}`, `${match.title} image ${currentMatchImagesLoaded + i + 1}`));
      });

      currentMatchImagesLoaded += data.images.length;

      if (!data.hasMore) {
        nextMatchIndex++;
        currentMatchImagesLoaded = 0;
      }
    } catch (err) {
      console.error('Failed to fetch images for match', match.id, err);
    } finally {
      loadingImages = false;
    }
  }

  // --- SCROLL HANDLER ---
  function handleScroll() {
    // Hide side menu earlier
    const heroRect = heroOverlay.getBoundingClientRect();
    if (heroRect.bottom - 450 < 0) sideMenu.classList.add('hidden');
    else sideMenu.classList.remove('hidden');

    // Only trigger lazy load when last loaded match's gallery bottom is visible
    const lastSection = mainContent.querySelector('section.match-section:last-child');
    if (!lastSection) return;

    const lastGallery = lastSection.querySelector('.match-gallery');
    const galleryBottom = lastGallery.getBoundingClientRect().bottom;
    if (galleryBottom - window.innerHeight < 300) {
      fetchNextImageBatch();
    }
  }

  window.addEventListener('scroll', handleScroll);
  initDynamicMatches();
})();
