/* ============================================
   FARTSITE — Interactive Script
   fartsite.github.io
   ============================================ */

(function() {
  'use strict';

  // ── Utilities ──
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => ctx.querySelectorAll(sel);
  const on = (el, evt, fn) => el.addEventListener(evt, fn);
  const storage = {
    get: (k, d) => { try { return localStorage.getItem(k) || d; } catch(e) { return d; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch(e) {} }
  };

  // ── Theme System ──
  const ThemeManager = {
    init() {
      this.current = storage.get('theme', 'system');
      this.apply(this.current);
      this.setupUI();
    },

    apply(mode) {
      const root = document.documentElement;
      root.removeAttribute('data-theme');
      if (mode === 'dark') root.setAttribute('data-theme', 'dark');
      else if (mode === 'light') root.setAttribute('data-theme', 'light');
      else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) root.setAttribute('data-theme', 'dark');
      }
      this.current = mode;
      storage.set('theme', mode);
      this.updateUI();
    },

    setupUI() {
      const btn = $('#themeBtn');
      if (!btn) return;
      on(btn, 'click', (e) => {
        e.stopPropagation();
        $('.theme-switcher').classList.toggle('open');
      });

      on(document, 'click', (e) => {
        if (!e.target.closest('.theme-switcher')) $('.theme-switcher').classList.remove('open');
      });

      $$('.theme-option').forEach(opt => {
        on(opt, 'click', () => this.apply(opt.dataset.theme));
      });

      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (this.current === 'system') this.apply('system');
      });
    },

    updateUI() {
      $$('.theme-option').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.theme === this.current);
      });
    }
  };

  // ── Language System ──
  const LangManager = {
    init() {
      this.setupUI();
      this.detectCurrent();
    },

    detectCurrent() {
      const path = window.location.pathname;
      const isEn = path.startsWith('/en/') || path === '/en' || path.startsWith('/en');
      const current = isEn ? 'en' : 'ru';
      $$('.lang-item').forEach(item => {
        item.classList.toggle('active', item.dataset.lang === current);
      });
    },

    setupUI() {
      const dropdown = $('.lang-dropdown');
      if (!dropdown) return;

      on($('.lang-toggle'), 'click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('open');
      });

      on(document, 'click', (e) => {
        if (!e.target.closest('.lang-dropdown')) dropdown.classList.remove('open');
      });
    }
  };

  // ── BVI Panel (Visually Impaired) ──
  const BVIManager = {
    init() {
      this.active = false;
      this.settings = {
        font: storage.get('bvi-font', 'normal'),
        spacing: storage.get('bvi-spacing', 'normal'),
        line: storage.get('bvi-line', 'normal'),
        images: storage.get('bvi-images', 'on')
      };
      this.applyAll();
      this.setupUI();
    },

    toggle() {
      this.active = !this.active;
      document.body.classList.toggle('bvi-active', this.active);
      document.documentElement.toggleAttribute('data-bvi', this.active);
      $('.bvi-panel').classList.toggle('active', this.active);
      $('#bviBtn').classList.toggle('active', this.active);
      storage.set('bvi-active', this.active ? '1' : '0');
    },

    set(key, value) {
      this.settings[key] = value;
      storage.set(`bvi-${key}`, value);
      document.documentElement.setAttribute(`data-bvi-${key}`, value);
      this.updateButtons(key, value);
    },

    applyAll() {
      const wasActive = storage.get('bvi-active', '0') === '1';
      if (wasActive) this.toggle();
      Object.entries(this.settings).forEach(([k, v]) => {
        document.documentElement.setAttribute(`data-bvi-${k}`, v);
      });
      this.updateAllButtons();
    },

    updateButtons(key, value) {
      $(`.bvi-group[data-setting="${key}"]`)?.querySelectorAll('.bvi-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.value === value);
      });
    },

    updateAllButtons() {
      Object.entries(this.settings).forEach(([k, v]) => this.updateButtons(k, v));
    },

    setupUI() {
      const btn = $('#bviBtn');
      if (btn) on(btn, 'click', () => this.toggle());

      $$('.bvi-group').forEach(group => {
        const key = group.dataset.setting;
        group.querySelectorAll('.bvi-btn').forEach(btn => {
          on(btn, 'click', () => this.set(key, btn.dataset.value));
        });
      });
    }
  };

  // ── View Toggle (Mobile/Desktop) ──
  const ViewManager = {
    init() {
      this.mode = storage.get('view-mode', 'auto');
      this.apply();
      this.setupUI();
    },

    apply() {
      if (this.mode === 'mobile') document.body.setAttribute('data-view', 'mobile');
      else document.body.removeAttribute('data-view');
    },

    toggle() {
      this.mode = this.mode === 'mobile' ? 'auto' : 'mobile';
      storage.set('view-mode', this.mode);
      this.apply();
      this.updateUI();
    },

    setupUI() {
      const btn = $('#viewToggleBtn');
      if (btn) on(btn, 'click', () => this.toggle());
      this.updateUI();
    },

    updateUI() {
      const btn = $('#viewToggleBtn');
      if (!btn) return;
      const isMobile = this.mode === 'mobile';
      btn.setAttribute('aria-label', isMobile ? 'Desktop view' : 'Mobile view');
      btn.querySelector('svg').innerHTML = isMobile
        ? '<path d="M4 4h16v12H4z" opacity=".3"/><path d="M20 18H4v2h16v-2z"/><path d="M6 22h12v2H6z"/>'
        : '<path d="M6 18h8v2H6z"/><rect x="2" y="3" width="20" height="14" rx="2" opacity=".3"/><path d="M20 17H4V5h16v12z"/>';
    }
  };

  // ── Header Scroll Effect ──
  const HeaderManager = {
    init() {
      this.header = $('.site-header');
      if (!this.header) return;
      on(window, 'scroll', () => this.update(), { passive: true });
      this.update();
    },

    update() {
      const scrolled = window.scrollY > 20;
      this.header.classList.toggle('scrolled', scrolled);
    }
  };

  // ── Scroll Reveal ──
  const RevealManager = {
    init() {
      this.elements = $$('.reveal');
      if (!this.elements.length) return;
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            this.observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
      this.elements.forEach(el => this.observer.observe(el));
    }
  };

  // ── Liquid Glass Mouse Tracking ──
  const LiquidGlassManager = {
    init() {
      $$('.liquid-glass').forEach(el => {
        on(el, 'mousemove', (e) => {
          const rect = el.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          el.style.setProperty('--mouse-x', x + '%');
          el.style.setProperty('--mouse-y', y + '%');
        });
      });
    }
  };

  // ── FAQ Accordion ──
  const FAQManager = {
    init() {
      $$('.faq-question').forEach(btn => {
        on(btn, 'click', () => {
          const item = btn.closest('.faq-item');
          const wasActive = item.classList.contains('active');
          $$('.faq-item').forEach(i => i.classList.remove('active'));
          if (!wasActive) item.classList.add('active');
        });
      });
    }
  };

  // ── Fart Simulator ──
  const FartSimulator = {
    sounds: [
      'PFFFFT', 'BRAPPP', 'SPLORP', 'TOOT', 'WHOOOOSH',
      'BRRRRT', 'PFFT-PFFT', 'SQUELCH', 'RUMBLE', 'POP',
      'PHHHHHT', 'BRRAP', 'SQUEAK', 'THUNDER', 'BUBBLE'
    ],
    emojis: ['~', 'o', 'O', '°', '•', '∘'],

    init() {
      this.btn = $('#fartBtn');
      this.display = $('#fartDisplay');
      this.output = $('#fartOutput');
      if (!this.btn) return;
      on(this.btn, 'click', () => this.play());
    },

    play() {
      const sound = this.sounds[Math.floor(Math.random() * this.sounds.length)];
      const duration = 500 + Math.random() * 1500;

      this.output.textContent = sound;
      this.output.style.animation = 'none';
      this.output.offsetHeight;
      this.output.style.animation = 'fadeInUp 0.3s';

      this.display.style.animation = 'shake 0.5s';
      this.display.style.transform = `scale(${1 + Math.random() * 0.2})`;

      // Create floating particles
      for (let i = 0; i < 8; i++) {
        setTimeout(() => this.createParticle(), i * 80);
      }

      setTimeout(() => {
        this.display.style.transform = 'scale(1)';
        this.display.style.animation = 'none';
      }, duration);
    },

    createParticle() {
      const p = document.createElement('span');
      p.textContent = this.emojis[Math.floor(Math.random() * this.emojis.length)];
      p.style.cssText = `
        position: fixed;
        left: 50%;
        top: 50%;
        font-size: ${20 + Math.random() * 30}px;
        color: var(--accent);
        opacity: 0.8;
        pointer-events: none;
        z-index: 9999;
        transition: all 1.5s ease-out;
      `;
      document.body.appendChild(p);

      requestAnimationFrame(() => {
        const angle = Math.random() * Math.PI * 2;
        const dist = 100 + Math.random() * 150;
        p.style.transform = `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist - 100}px)`;
        p.style.opacity = '0';
      });

      setTimeout(() => p.remove(), 1500);
    }
  };

  // ── Smooth Scroll for Anchors ──
  const SmoothScroll = {
    init() {
      on(document, 'click', (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;
        const target = $(link.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }
  };

  // ── Initialize ──
  document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
    LangManager.init();
    BVIManager.init();
    ViewManager.init();
    HeaderManager.init();
    RevealManager.init();
    LiquidGlassManager.init();
    FAQManager.init();
    FartSimulator.init();
    SmoothScroll.init();
  });

})();
