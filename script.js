(function () {
  const mainContent = document.querySelector('.main-content');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');
  const sideMenu = document.getElementById('side-menu');
  const heroOverlay = document.getElementById('hero-overlay');

  // --- STATIC MATCHES ---
  function createImageWrapper(src, alt) {
    const imgWrapper = document.createElement('div');
    Object.assign(imgWrapper.style, { position: 'relative', display: 'inline-block' });

    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    img.loading = 'lazy';
    img.tabIndex = 0;
    img.style.display = 'block';
    img.style.pointerEvents = 'none';
    img.style.userSelect = 'none';

    const overlay = document.createElement('div');
    Object.assign(overlay.style, {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      cursor: 'pointer',
      background: 'transparent'
    });
    overlay.addEventListener('click', () => openLightbox(img.src, img.alt));

    imgWrapper.appendChild(img);
    imgWrapper.appendChild(overlay);
    return imgWrapper;
  }

  function loadStaticMatches() {
    document.querySelectorAll('.match-section').forEach((section, index) => {
      if (index > 2) return; // only static match1–3
      const gallery = section.querySelector('.match-gallery');
      gallery.innerHTML = '';
      for (let i = 1; i <= 4; i++) {
        const imgWrapper = createImageWrapper(`./photographs/match${index + 1}/${i}.jpg`, `Match ${index + 1} image ${i}`);
        gallery.appendChild(imgWrapper);
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

  // --- DYNAMIC MATCHES WITH PAGINATION ---
  let dynamicMatches = [];
  let nextMatchIndex = 0;
  const imagesPerPage = 4;

  // Track how many images have been loaded for the current match
  let currentMatchImagesLoaded = 0;
  let loadingImages = false;

  async function initDynamicMatches() {
    try {
      const res = await fetch('http://localhost:3000/api/events');
      const events = await res.json();
      dynamicMatches = events.filter(ev => !['match1', 'match2', 'match3'].includes(ev.id));
    } catch (err) {
      console.error('Failed to load dynamic matches list:', err);
    }
  }

  async function fetchNextImageBatch() {
    if (loadingImages) return;
    if (nextMatchIndex >= dynamicMatches.length) return;

    const match = dynamicMatches[nextMatchIndex];
    loadingImages = true;

    // Create section if first batch for this match
    let section = document.getElementById(match.id);
    if (!section) {
      section = document.createElement('section');
      section.classList.add('match-section');
      section.id = match.id;

      const h2 = document.createElement('h2');
      h2.textContent = match.title;
      section.appendChild(h2);

      const p = document.createElement('p');
      p.textContent = match.date;
      section.appendChild(p);

      const gallery = document.createElement('div');
      gallery.classList.add('match-gallery');
      section.appendChild(gallery);

      mainContent.appendChild(section);
      currentMatchImagesLoaded = 0;
    }

    const gallery = section.querySelector('.match-gallery');

    try {
      const res = await fetch(`http://localhost:3000/api/events/${match.id}/images?offset=${currentMatchImagesLoaded}&limit=${imagesPerPage}`);
      const data = await res.json();

      data.images.forEach((imgPath, i) => {
        const imgWrapper = createImageWrapper(`http://localhost:3000${imgPath}`, `${match.title} image ${currentMatchImagesLoaded + i + 1}`);
        gallery.appendChild(imgWrapper);
      });

      currentMatchImagesLoaded += data.images.length;

      // If all images for this match are loaded, move to next match
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
  // --- HIDE SIDE MENU EARLIER ---
  const heroRect = heroOverlay.getBoundingClientRect();
  const buffer = 450; // pixels before we actually hide
  if (heroRect.bottom - buffer < 0) {
    sideMenu.classList.add('hidden');
  } else {
    sideMenu.classList.remove('hidden');
  }

  // --- LAZY LOAD NEXT BATCH ---
  const scrollBottom = window.innerHeight + window.scrollY;
  if (scrollBottom >= document.body.offsetHeight - 300) {
    fetchNextImageBatch();
  }
}


  window.addEventListener('scroll', handleScroll);
  initDynamicMatches();
})();
