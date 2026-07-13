const header = document.querySelector("[data-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const daysNode = document.querySelector("[data-countdown-days]");
const captionNode = document.querySelector("[data-countdown-caption]");
const hero = document.querySelector(".hero");
const motionSections = document.querySelectorAll(
  ".route-section, .intro, .distance-section, .participants-section, .safety-section, .program-section, .map-section, .partners-section, .updates-section, .faq-section"
);

const eventDate = new Date("2026-08-02T00:00:00+05:00");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let scrollTicking = false;

function setupHeaderState() {
  if (!header) return;

  if (!("IntersectionObserver" in window)) {
    header.classList.add("is-scrolled");
    return;
  }

  const sentinel = document.createElement("span");
  sentinel.className = "scroll-sentinel";
  sentinel.setAttribute("aria-hidden", "true");
  document.body.prepend(sentinel);

  const observer = new IntersectionObserver(
    ([entry]) => {
      header.classList.toggle("is-scrolled", !entry.isIntersecting);
    },
    { rootMargin: "-16px 0px 0px 0px", threshold: 0 }
  );

  observer.observe(sentinel);
}

function closeNav() {
  if (!header || !navToggle) return;
  header.classList.remove("nav-open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Открыть меню");
}

function pluralDays(value) {
  const lastTwo = value % 100;
  const last = value % 10;

  if (lastTwo >= 11 && lastTwo <= 14) return "дней";
  if (last === 1) return "день";
  if (last >= 2 && last <= 4) return "дня";
  return "дней";
}

function updateCountdown() {
  if (!daysNode || !captionNode) return;

  const diff = eventDate.getTime() - Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const days = Math.max(0, Math.ceil(diff / dayMs));

  daysNode.textContent = String(days);
  captionNode.textContent = days === 0 ? "сегодня" : pluralDays(days);
}

function setupReveal() {
  const groups = [
    ".hero-tags span",
    ".intro-grid > *",
    ".route-section .section-heading > *",
    ".route-choice",
    ".distance-heading > *",
    ".distance-card",
    ".category-strip span",
    ".section-heading > *",
    ".audience-card",
    ".safety-inner > *",
    ".safety-item",
    ".program-card",
    ".map-copy > *",
    ".route-map",
    ".partner-tile",
    ".updates-section > *",
    ".registration-state",
    ".readiness-list li",
    ".updates-actions .button",
    ".faq-section > *",
    ".faq-list details"
  ];

  const revealNodes = document.querySelectorAll(groups.join(","));

  revealNodes.forEach((node, index) => {
    node.classList.add("reveal-target");
    node.style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 70}ms`);
  });

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealNodes.forEach((node) => node.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
  );

  revealNodes.forEach((node) => observer.observe(node));
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function updateScrollMotion() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  document.documentElement.style.setProperty("--progress", progress.toFixed(4));

  if (!prefersReducedMotion) {
    if (hero) {
      const heroShift = clamp(window.scrollY * 0.08, 0, 44);
      const ribbonShift = clamp(window.scrollY * 0.12, 0, 96);
      hero.style.setProperty("--hero-shift", `${heroShift}px`);
      hero.style.setProperty("--hero-ribbon", `${ribbonShift}px`);
    }

    motionSections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const shift = clamp((window.innerHeight / 2 - rect.top) * 0.018, -18, 18);
      section.style.setProperty("--section-shift", `${shift}px`);
    });
  }

  scrollTicking = false;
}

function requestScrollMotion() {
  if (scrollTicking) return;
  scrollTicking = true;
  window.requestAnimationFrame(updateScrollMotion);
}

window.addEventListener("resize", () => {
  if (window.innerWidth > 1080) closeNav();
});

navToggle?.addEventListener("click", () => {
  if (!header || !navToggle) return;

  const isOpen = header.classList.toggle("nav-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
});

nav?.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) closeNav();
});

window.addEventListener("scroll", requestScrollMotion, { passive: true });
window.addEventListener("resize", requestScrollMotion);

setupHeaderState();
updateCountdown();
setupReveal();
updateScrollMotion();
window.setTimeout(() => document.body.classList.add("motion-ready"), 60);
