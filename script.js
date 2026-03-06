/* ═══════════════════════════════════════════════════════
   PORTFOLIO — script.js
   Handles: scroll behaviour, nav, animations, form,
            validation, EmailJS, loading state, mobile
═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── EMAILJS CONFIG ───────────────────────────────────
     To activate email sending:
     1. Create a free account at https://www.emailjs.com
     2. Add an Email Service (Gmail) → copy Service ID
     3. Create an Email Template    → copy Template ID
     4. Go to Account > API Keys   → copy Public Key
     Replace the three values below with your own.
  ─────────────────────────────────────────────────────── */
  const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';
  const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
  const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';

  /* ── DOM REFS ─────────────────────────────────────── */
  const navbar      = document.getElementById('navbar');
  const hamburger   = document.getElementById('hamburger');
  const navLinks    = document.querySelector('.nav-links');
  const contactForm = document.getElementById('contact-form');
  const formStatus  = document.getElementById('form-status');
  const submitBtn   = document.getElementById('submit-btn');

  /* ── INITIALISE EMAILJS ───────────────────────────── */
  if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }

  /* ═══════════════════════════════════════════════════
     FORM VALIDATION
  ═══════════════════════════════════════════════════ */
  const rules = {
    name: {
      test: v => v.trim().length >= 2,
      msg:  'Please enter your full name (at least 2 characters).'
    },
    email: {
      test: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
      msg:  'Please enter a valid email address.'
    },
    subject: {
      test: v => v.trim().length >= 3,
      msg:  'Please enter a subject (at least 3 characters).'
    },
    message: {
      test: v => v.trim().length >= 10,
      msg:  'Your message must be at least 10 characters.'
    }
  };

  function getField(id) {
    return document.getElementById(id);
  }

  function showError(id, msg) {
    const field = getField(id);
    const err   = document.getElementById('error-' + id);
    if (!field || !err) return;
    field.closest('.form-group').classList.add('has-error');
    field.closest('.form-group').classList.remove('is-valid');
    err.textContent = msg;
  }

  function clearError(id) {
    const field = getField(id);
    const err   = document.getElementById('error-' + id);
    if (!field || !err) return;
    field.closest('.form-group').classList.remove('has-error');
    field.closest('.form-group').classList.add('is-valid');
    err.textContent = '';
  }

  function validateField(id) {
    const field = getField(id);
    if (!field) return true;
    const value = field.value;
    if (rules[id].test(value)) {
      clearError(id);
      return true;
    } else {
      showError(id, rules[id].msg);
      return false;
    }
  }

  function validateAll() {
    const results = ['name', 'email', 'subject', 'message'].map(validateField);
    return results.every(Boolean);
  }

  /* Live validation — clears error as soon as user fixes field */
  ['name', 'email', 'subject', 'message'].forEach(id => {
    const field = getField(id);
    if (!field) return;
    field.addEventListener('input', () => {
      const group = field.closest('.form-group');
      if (group.classList.contains('has-error')) validateField(id);
    });
    field.addEventListener('blur', () => validateField(id));
  });

  /* ═══════════════════════════════════════════════════
     LOADING STATE HELPERS
  ═══════════════════════════════════════════════════ */
  function setLoading(on) {
    if (!submitBtn) return;
    const label    = submitBtn.querySelector('.btn-label');
    const sendIcon = submitBtn.querySelector('.btn-send-icon');
    const spinner  = submitBtn.querySelector('.btn-spinner');
    if (on) {
      submitBtn.classList.add('loading');
      if (label)    label.textContent     = 'Sending...';
      if (sendIcon) sendIcon.style.display = 'none';
      if (spinner)  spinner.style.display  = 'block';
    } else {
      submitBtn.classList.remove('loading');
      if (label)    label.textContent     = 'Send Message';
      if (sendIcon) sendIcon.style.display = 'block';
      if (spinner)  spinner.style.display  = 'none';
    }
  }

  function showStatus(msg, isError) {
    if (!formStatus) return;
    formStatus.textContent = msg;
    formStatus.className   = 'form-note' + (isError ? ' error' : '');
    if (!isError) {
      setTimeout(() => { formStatus.textContent = ''; formStatus.className = 'form-note'; }, 6000);
    }
  }

  /* ═══════════════════════════════════════════════════
     CONTACT FORM SUBMIT
  ═══════════════════════════════════════════════════ */
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateAll()) {
        showStatus('Please fix the errors above before sending.', true);
        /* Scroll to first error */
        const firstError = contactForm.querySelector('.form-group.has-error input, .form-group.has-error textarea');
        if (firstError) firstError.focus();
        return;
      }

      setLoading(true);
      showStatus('', false);

      /* ── EmailJS send ── */
      const useEmailJS = (
        typeof emailjs !== 'undefined' &&
        EMAILJS_SERVICE_ID  !== 'YOUR_SERVICE_ID' &&
        EMAILJS_TEMPLATE_ID !== 'YOUR_TEMPLATE_ID'
      );

      if (useEmailJS) {
        emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, contactForm)
          .then(() => {
            setLoading(false);
            showStatus('✓ Message sent! I\'ll get back to you soon.', false);
            contactForm.reset();
            /* Remove is-valid styling after reset */
            contactForm.querySelectorAll('.form-group').forEach(g => g.classList.remove('is-valid'));
          })
          .catch((err) => {
            setLoading(false);
            console.error('EmailJS error:', err);
            showStatus('Something went wrong. Please email me directly at nyangwesoprudence2@gmail.com', true);
          });
      } else {
        /* Fallback — mailto (works without EmailJS setup) */
        const name    = getField('name').value.trim();
        const email   = getField('email').value.trim();
        const subject = getField('subject').value.trim();
        const message = getField('message').value.trim();
        const body    = encodeURIComponent(`Name: ${name}\nFrom: ${email}\n\n${message}`);
        const subj    = encodeURIComponent(subject || 'Portfolio Contact');
        window.location.href = `mailto:nyangwesoprudence2@gmail.com?subject=${subj}&body=${body}`;
        setLoading(false);
        showStatus('✓ Opening your email client...', false);
        contactForm.reset();
        contactForm.querySelectorAll('.form-group').forEach(g => g.classList.remove('is-valid'));
      }
    });
  }

  /* ═══════════════════════════════════════════════════
     NAVBAR SCROLL EFFECT
  ═══════════════════════════════════════════════════ */
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
    updateActiveNavLink();
  }, { passive: true });

  /* ═══════════════════════════════════════════════════
     ACTIVE NAV LINK
  ═══════════════════════════════════════════════════ */
  const sections = document.querySelectorAll('section[id]');

  function updateActiveNavLink() {
    const scrollY = window.scrollY + 140;
    sections.forEach(section => {
      const top  = section.offsetTop;
      const h    = section.offsetHeight;
      const id   = section.getAttribute('id');
      const link = document.querySelector(`.nav-links a[href="#${id}"]`);
      if (!link) return;
      if (scrollY >= top && scrollY < top + h) {
        link.style.color = 'var(--teal)';
        link.setAttribute('aria-current', 'true');
      } else {
        link.style.color = '';
        link.removeAttribute('aria-current');
      }
    });
  }

  /* ═══════════════════════════════════════════════════
     MOBILE HAMBURGER
  ═══════════════════════════════════════════════════ */
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', isOpen);
      const spans = hamburger.querySelectorAll('span');
      if (isOpen) {
        spans[0].style.cssText = 'transform: rotate(45deg) translate(5px, 5px);';
        spans[1].style.cssText = 'opacity: 0; transform: scaleX(0);';
        spans[2].style.cssText = 'transform: rotate(-45deg) translate(5px, -5px);';
        document.body.style.overflow = 'hidden';
      } else {
        spans.forEach(s => s.style.cssText = '');
        document.body.style.overflow = '';
      }
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.querySelectorAll('span').forEach(s => s.style.cssText = '');
        document.body.style.overflow = '';
        hamburger.setAttribute('aria-expanded', false);
      });
    });

    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target) && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        hamburger.querySelectorAll('span').forEach(s => s.style.cssText = '');
        document.body.style.overflow = '';
      }
    });
  }

  /* ═══════════════════════════════════════════════════
     SMOOTH SCROLL (account for fixed nav height)
  ═══════════════════════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const offset = target.getBoundingClientRect().top + window.scrollY - navbar.offsetHeight;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    });
  });

  /* ═══════════════════════════════════════════════════
     INTERSECTION OBSERVER — animate on scroll
  ═══════════════════════════════════════════════════ */
  const animateObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const delay = parseInt(entry.target.dataset.delay || 0, 10);
        setTimeout(() => entry.target.classList.add('visible'), delay);
        animateObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
  );

  /* ── SKILL BAR OBSERVER ─────────────────────────── */
  const skillObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.querySelectorAll('.skill-fill').forEach((fill, i) => {
          setTimeout(() => { fill.style.transform = 'scaleX(1)'; }, i * 150);
        });
        skillObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.3 }
  );

  /* ── COUNTER ANIMATION ──────────────────────────── */
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el  = entry.target;
      const num = parseInt(el.textContent, 10);
      if (isNaN(num)) { counterObserver.unobserve(el); return; }
      const suffix = el.textContent.replace(String(num), '');
      let current = 0;
      const step  = num / (1200 / 16);
      const timer = setInterval(() => {
        current += step;
        if (current >= num) { el.textContent = num + suffix; clearInterval(timer); }
        else                  el.textContent = Math.floor(current) + suffix;
      }, 16);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  /* ── CURSOR GLOW (desktop only) ─────────────────── */
  function initCursorGlow() {
    if (window.matchMedia('(hover: none)').matches) return;
    const glow = document.createElement('div');
    glow.style.cssText = [
      'position:fixed', 'width:400px', 'height:400px', 'pointer-events:none',
      'z-index:0', 'border-radius:50%',
      'background:radial-gradient(circle,rgba(100,255,218,0.04) 0%,transparent 70%)',
      'transform:translate(-50%,-50%)',
      'transition:left 0.6s ease,top 0.6s ease'
    ].join(';');
    document.body.appendChild(glow);
    document.addEventListener('mousemove', e => {
      glow.style.left = e.clientX + 'px';
      glow.style.top  = e.clientY + 'px';
    }, { passive: true });
  }

  /* ═══════════════════════════════════════════════════
     INIT
  ═══════════════════════════════════════════════════ */
  function init() {
    /* Stagger children of grid parents */
    document.querySelectorAll(
      '.about-cards, .skills-grid, .certs-grid, .case-study-grid, .contact-grid'
    ).forEach(parent => {
      Array.from(parent.children).forEach((child, i) => {
        if (!child.hasAttribute('data-animate')) {
          child.setAttribute('data-animate', '');
          child.dataset.delay = String(i * 100);
        }
      });
    });

    document.querySelectorAll('[data-animate]').forEach((el, i) => {
      if (!el.dataset.delay) el.dataset.delay = String((i % 3) * 120);
      animateObserver.observe(el);
    });

    document.querySelectorAll('.skill-category').forEach(c => skillObserver.observe(c));
    document.querySelectorAll('.stat-number').forEach(el => counterObserver.observe(el));

    initCursorGlow();
    updateActiveNavLink();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
