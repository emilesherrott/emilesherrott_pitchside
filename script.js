// AUTO LOAD IMAGES
document.querySelectorAll(".match-section").forEach((section, index) => {
  const gallery = section.querySelector(".match-gallery");
  gallery.innerHTML = "";

  for (let i = 1; i <= 4; i++) {
    const img = document.createElement("img");
    img.src = `./photographs/match${index + 1}/${i}.jpg`;
    img.alt = `Match ${index + 1} image ${i}`;
    gallery.appendChild(img);
  }
});

// SMOOTH SCROLL MENU LINKS
document.querySelectorAll(".side-menu a").forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute("href"));
    window.scrollTo({
      top: target.offsetTop - 20,
      behavior: "smooth"
    });
  });
});

// HIDE SIDE MENU WHEN SCROLLED PAST HERO
const sideMenu = document.querySelector(".side-menu");
const heroHeight = document.querySelector(".hero").offsetHeight;

window.addEventListener("scroll", () => {
  if (window.scrollY > heroHeight - 80) {
    sideMenu.classList.add("hidden");
  } else {
    sideMenu.classList.remove("hidden");
  }
});

// HERO OVERLAY SCROLL BEHAVIOR
const heroOverlay = document.querySelector(".hero-overlay");
window.addEventListener("scroll", () => {
  if (window.scrollY > heroHeight - 80) {
    heroOverlay.classList.add("scrolled");
  } else {
    heroOverlay.classList.remove("scrolled");
  }
});

// --- LIGHTBOX FUNCTIONALITY ---
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxClose = document.getElementById("lightbox-close");

document.querySelectorAll(".match-gallery img").forEach(img => {
  img.addEventListener("click", () => {
    lightboxImg.src = img.src;
    lightbox.style.display = "flex";
  });
});

// Close lightbox when clicking close button or background
lightboxClose.addEventListener("click", () => {
  lightbox.style.display = "none";
});

lightbox.addEventListener("click", e => {
  if (e.target === lightbox) {
    lightbox.style.display = "none";
  }
});
