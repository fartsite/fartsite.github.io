(function() {
  'use strict';
  const body = document.body;
  const html = document.documentElement;

  // === THEME ===
  const themeToggle = document.querySelector('.theme-toggle');
  const themes = ['system', 'light', 'dark'];
  let currentTheme = localStorage.getItem('theme') || 'system';

  function setTheme(theme) {
    html.className = html.className.replace(/system|light|dark/g, '');
    html.classList.add(theme);
    localStorage.setItem('theme', theme);
    themeToggle.title = `Theme: ${theme}`;
  }
  setTheme(currentTheme);

  themeToggle.addEventListener('click', () => {
    const idx = themes.indexOf(currentTheme);
    currentTheme = themes[(idx + 1) % themes.length];
    setTheme(currentTheme);
  });

  // === VIEW TOGGLE (mobile/desktop) ===
  const viewToggle = document.querySelector('.view-toggle');
  let viewMode = localStorage.getItem('viewMode') || 'auto';
  function applyView(mode) {
    body.classList.remove('force-mobile', 'force-desktop');
    if (mode === 'mobile') body.classList.add('force-mobile');
    else if (mode === 'desktop') body.classList.add('force-desktop');
    viewToggle.setAttribute('aria-label', `View: ${mode}`);
  }
  applyView(viewMode);
  viewToggle.addEventListener('click', () => {
    if (viewMode === 'auto') viewMode = 'mobile';
    else if (viewMode === 'mobile') viewMode = 'desktop';
    else viewMode = 'auto';
    localStorage.setItem('viewMode', viewMode);
    applyView(viewMode);
  });

  // === BVI PANEL ===
  const bviPanel = document.getElementById('bvi-panel');
  const bviTrigger = document.getElementById('bvi-trigger');
  const bviClose = document.getElementById('bvi-close');

  bviTrigger.addEventListener('click', () => bviPanel.classList.add('open'));
  bviClose.addEventListener('click', () => bviPanel.classList.remove('open'));

  // Font size
  const fontUp = document.getElementById('bvi-font-up');
  const fontDown = document.getElementById('bvi-font-down');
  const fontReset = document.getElementById('bvi-font-reset');
  const highContrast = document.getElementById('bvi-high-contrast');
  const monochrome = document.getElementById('bvi-monochrome');
  const lineSpacing = document.getElementById('bvi-line-spacing');

  let fontSize = parseFloat(localStorage.getItem('bvi-fontsize')) || 100;
  function updateFontSize() {
    html.style.fontSize = fontSize + '%';
    localStorage.setItem('bvi-fontsize', fontSize);
  }
  updateFontSize();
  fontUp.addEventListener('click', () => { fontSize = Math.min(fontSize + 10, 200); updateFontSize(); });
  fontDown.addEventListener('click', () => { fontSize = Math.max(fontSize - 10, 60); updateFontSize(); });
  fontReset.addEventListener('click', () => { fontSize = 100; updateFontSize(); });

  if (highContrast) highContrast.addEventListener('change', e => body.classList.toggle('bvi-high-contrast', e.target.checked));
  if (monochrome) monochrome.addEventListener('change', e => body.classList.toggle('bvi-monochrome', e.target.checked));
  if (lineSpacing) lineSpacing.addEventListener('click', () => body.classList.toggle('bvi-wide-lines'));

  // === Language dropdown toggle (for keyboard/focus) ===
  const langBtn = document.querySelector('.lang-btn');
  if (langBtn) {
    langBtn.addEventListener('click', (e) => {
      const menu = langBtn.nextElementSibling;
      if (menu.style.display === 'block') menu.style.display = 'none';
      else menu.style.display = 'block';
    });
    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.lang-dropdown')) {
        const menu = document.querySelector('.lang-menu');
        if (menu) menu.style.display = 'none';
      }
    });
  }

  // === Сброс BVI при закрытии (опционально) ===
})();