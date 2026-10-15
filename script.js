const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const sectionLinks = [...siteNav.querySelectorAll('a[href^="#"]')]
  .map((link) => ({ link, section: document.querySelector(link.getAttribute("href")) }))
  .filter(({ section }) => section);

function updateActiveNavigation() {
  const activationLine = window.innerHeight * 0.45;
  const activeLink = sectionLinks.find(({ section }) => {
    const bounds = section.getBoundingClientRect();
    return bounds.top <= activationLine && bounds.bottom > activationLine;
  })?.link;

  for (const { link } of sectionLinks) {
    if (link === activeLink) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  }
}

updateActiveNavigation();
window.addEventListener("scroll", updateActiveNavigation, { passive: true });
window.addEventListener("resize", updateActiveNavigation, { passive: true });

const serviceItems = [...document.querySelectorAll(".service-item")];

function openServiceFromHash() {
  if (!window.location.hash) return;
  const service = document.querySelector(window.location.hash);
  if (!service?.matches(".service-item")) return;
  service.open = true;
  for (const otherService of serviceItems) {
    if (otherService !== service) otherService.open = false;
  }
}

window.addEventListener("hashchange", openServiceFromHash);
openServiceFromHash();

for (const service of serviceItems) {
  service.addEventListener("toggle", () => {
    if (service.open) {
      for (const otherService of serviceItems) {
        if (otherService !== service) otherService.open = false;
      }
    }
  });
}

const heroImage = document.querySelector(".hero-image");
const proofValue = document.querySelector(".proof-value");
const proofTarget = Number(proofValue.dataset.countTo);
const proofFormatter = new Intl.NumberFormat("de-CH");

const proofStart = 10000;
const proofDuration = 2200;
let proofStartedAt;

function animateProof(timestamp) {
  proofStartedAt ??= timestamp;
  const progress = Math.min((timestamp - proofStartedAt) / proofDuration, 1);
  const easedProgress = 1 - (1 - progress) ** 3;
  const currentValue = Math.round(proofStart + (proofTarget - proofStart) * easedProgress);
  proofValue.textContent = proofFormatter.format(currentValue);

  if (progress < 1) requestAnimationFrame(animateProof);
}

requestAnimationFrame(animateProof);

const heroSlides = [
  { src: heroImage.src, alt: heroImage.alt },
  { src: "Sanit%C3%A4r/c75319_d6a2df92f42f40ebbb66d882234954cc~mv2.jpg", alt: "Isolierarbeiten an einer technischen Anlage" },
  { src: "Sanit%C3%A4r/c75319_a5012906c9234a25b3e7295f6f91effa~mv2.avif", alt: "Sauber ausgeführte Rohrisolierung" },
  { src: "Sanit%C3%A4r/c75319_6c9800ac92d146ff891e76fe92ef7042~mv2.jpg", alt: "Isolierte Leitungen und Armaturen" },
  { src: "Sanit%C3%A4r/c75319_7720968736a143b39aa88ffbd366b284~mv2.jpg", alt: "Dämmarbeiten an einer Anlage" },
  { src: "Sanit%C3%A4r/c75319_b3e08d470eb7471e8ba86a7a28168b44~mv2.jpg", alt: "Isolierte technische Gebäudeinstallation" },
];
const heroImages = [heroImage];
for (const slide of heroSlides.slice(1)) {
  const image = document.createElement("img");
  image.className = "hero-image";
  image.src = slide.src;
  image.alt = slide.alt;
  image.decoding = "async";
  heroImages.at(-1).after(image);
  heroImages.push(image);
}

let activeSlide = 0;
let slideTimer;

function showSlide(index) {
  activeSlide = (index + heroImages.length) % heroImages.length;
  heroImages.forEach((image, imageIndex) => {
    const isActive = imageIndex === activeSlide;
    image.classList.toggle("is-active", isActive);
    image.setAttribute("aria-hidden", String(!isActive));
  });
}

function restartSlideTimer() {
  window.clearInterval(slideTimer);
  slideTimer = window.setInterval(() => showSlide(activeSlide + 1), 4000);
}

document.querySelector("#hero-previous").addEventListener("click", () => {
  showSlide(activeSlide - 1);
  restartSlideTimer();
});
document.querySelector("#hero-next").addEventListener("click", () => {
  showSlide(activeSlide + 1);
  restartSlideTimer();
});

showSlide(0);
restartSlideTimer();

const referenceViewport = document.querySelector("#reference-viewport");
const referenceTrack = document.querySelector(".reference-track");
const referenceSlides = [...document.querySelectorAll(".reference-slide")];

function moveReferences(direction) {
  const slideWidth = referenceSlides[0].getBoundingClientRect().width;
  const gap = Number.parseFloat(getComputedStyle(referenceTrack).columnGap) || 0;
  const step = slideWidth + gap;
  const lastIndex = Math.round((referenceViewport.scrollWidth - referenceViewport.clientWidth) / step);
  const nextIndex = Math.min(Math.max(Math.round(referenceViewport.scrollLeft / step) + direction, 0), lastIndex);
  referenceViewport.scrollTo({ left: nextIndex * step, behavior: "smooth" });
}

document.querySelector("#references-previous").addEventListener("click", () => moveReferences(-1));
document.querySelector("#references-next").addEventListener("click", () => moveReferences(1));

const mapFrame = document.querySelector("#contact-map-frame");
for (const locationButton of document.querySelectorAll(".map-location")) {
  locationButton.addEventListener("click", () => {
    const address = encodeURIComponent(locationButton.dataset.address);
    mapFrame.src = `https://maps.google.com/maps?output=embed&q=${address}&z=13`;
    mapFrame.title = `${locationButton.textContent} auf Google Maps`;
    for (const otherButton of document.querySelectorAll(".map-location")) {
      const isActive = otherButton === locationButton;
      otherButton.classList.toggle("is-active", isActive);
      otherButton.setAttribute("aria-pressed", String(isActive));
    }
  });
}

function closeMenu() {
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Menü öffnen");
  siteNav.classList.remove("is-open");
}

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Menü öffnen" : "Menü schliessen");
  siteNav.classList.toggle("is-open", !isOpen);
});

siteNav.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

document.querySelector("#contact-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const subject = encodeURIComponent(`Projektanfrage von ${form.get("name")}`);
  const body = encodeURIComponent(`${form.get("message")}\n\nKontakt: ${form.get("name")}\nE-Mail: ${form.get("email")}`);
  window.location.href = `mailto:info@petergroup.ch?subject=${subject}&body=${body}`;
});