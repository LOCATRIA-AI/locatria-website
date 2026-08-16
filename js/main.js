/**
 * LOCATRIA GLOBAL DESIGN SYSTEM - MAIN APP JS
 * App Initializer, Newsletter, TOC Active Section Tracking & Component Interactivity
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    initNewsletterForms();
    initSmoothAnchors();
    initTOCActiveTracking();
    console.log('Locatria Article System & Sticky TOC Initialized.');
  });

  function initNewsletterForms() {
    const forms = document.querySelectorAll('.js-newsletter-form');
    forms.forEach(form => {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        const input = form.querySelector('input[type="email"]');
        if (input && input.value) {
          alert(`Thank you for subscribing to Locatria AI Hub with ${input.value}! Check your inbox for your first practical workflow.`);
          input.value = '';
        }
      });
    });
  }

  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#' || href === '') return;
        
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const headerHeight = 96; // 72px header + 24px spacing
          const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  function initTOCActiveTracking() {
    const tocLinks = document.querySelectorAll('.toc-link');
    if (!tocLinks.length) return;

    const sections = [];
    tocLinks.forEach(link => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        const rawId = targetId.substring(1);
        let targetEl = document.getElementById(rawId);
        if (!targetEl) {
          try {
            targetEl = document.querySelector(targetId);
          } catch (err) {
            // Ignore invalid selector syntax for IDs starting with numbers
          }
        }
        if (targetEl) {
          sections.push({ id: targetId, link: link, element: targetEl });
        }
      }
    });

    if (!sections.length) return;

    function updateActiveTOC() {
      const scrollPosition = window.pageYOffset + 140;
      let currentSection = sections[0];

      for (let i = 0; i < sections.length; i++) {
        const top = sections[i].element.getBoundingClientRect().top + window.pageYOffset;
        if (scrollPosition >= top) {
          currentSection = sections[i];
        }
      }

      sections.forEach(s => s.link.classList.remove('is-active'));
      if (currentSection) {
        const activeHref = currentSection.link.getAttribute('href');
        tocLinks.forEach(l => {
          if (l.getAttribute('href') === activeHref) {
            l.classList.add('is-active');
          }
        });
      }
    }

    window.addEventListener('scroll', updateActiveTOC, { passive: true });
    updateActiveTOC();

    // Mobile TOC Auto-Collapse when a link is clicked
    const mobileDetails = document.querySelector('.toc-mobile-details');
    tocLinks.forEach(link => {
      link.addEventListener('click', function () {
        if (mobileDetails && mobileDetails.open) {
          mobileDetails.open = false;
        }
      });
    });
  }

})();
