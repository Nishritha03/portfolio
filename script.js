// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ============ Nav scrolled state + progress bar ============
const navEl = document.getElementById('nav');
const progressBar = document.getElementById('progressBar');
function updateScrollUI() {
  const doc = document.documentElement;
  const scrollTop = doc.scrollTop || document.body.scrollTop;
  const scrollHeight = (doc.scrollHeight || document.body.scrollHeight) - doc.clientHeight;
  if (navEl) navEl.classList.toggle('scrolled', scrollTop > 8);
  if (progressBar) {
    const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
  }
}
document.addEventListener('scroll', updateScrollUI, { passive: true });
updateScrollUI();

// ============ Theme toggle (in-memory only; no browser storage) ============
const themeToggle = document.getElementById('themeToggle');
function applyTheme(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  themeToggle.setAttribute('aria-pressed', theme === 'dark');
}
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
let currentTheme = systemPrefersDark ? 'dark' : 'light';
applyTheme(currentTheme);
themeToggle.addEventListener('click', () => {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(currentTheme);
});

// ============ Reveal on scroll ============
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

if (prefersReducedMotion) {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('in-view'));
} else {
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}

// ============ Mobile nav toggle ============
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', isOpen);
});
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// ============ Active nav link on scroll ============
const sections = Array.from(document.querySelectorAll('main section[id]'));
const links = Array.from(navLinks.querySelectorAll('a'));

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      links.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
}, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });

sections.forEach(section => sectionObserver.observe(section));

// ============ Test-run status: spec rows + rail dots + counter ============
const railDots = document.getElementById('railDots');
const railCount = document.getElementById('railCount');
const railItems = railDots ? Array.from(railDots.querySelectorAll('li')) : [];
let passedCount = 0;

function markPassed(id) {
  // Flip the section's spec-row status
  const section = document.getElementById(id);
  if (section) {
    const specRow = section.querySelector('.spec-row[data-spec]') || section.querySelector('.spec-row');
    if (specRow && !specRow.classList.contains('passed')) {
      specRow.classList.add('passed');
      const statusEl = specRow.querySelector('.spec-status');
      if (statusEl) statusEl.textContent = '✓ PASSED';
    }
  }
  // Fill the matching rail dot
  const dot = railItems.find(li => li.dataset.target === id);
  if (dot && !dot.classList.contains('passed')) {
    dot.classList.add('passed');
    passedCount++;
    if (railCount) railCount.textContent = passedCount;
  }
}

const testRunObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      markPassed(entry.target.id);
      testRunObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.35 });

sections.forEach(section => testRunObserver.observe(section));
