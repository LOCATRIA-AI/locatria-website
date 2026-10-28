/**
 * LOCATRIA GLOBAL DESIGN SYSTEM - MAIN APP JS
 * App Initializer, Newsletter, TOC Active Section Tracking & Component Interactivity
 */

(function () {
  'use strict';

  // --- Safe Analytics & Parameter Allowlist ---
  const ALLOWED_MAIN_PARAMS = new Set([
    'form_name',
    'form_location',
    'intent_status',
    'milestone',
    'content_id',
    'content_type',
    'industry_vertical'
  ]);

  function safeGtag(eventName, eventParams) {
    const sanitized = {};
    if (eventParams && typeof eventParams === 'object') {
      for (const key of Object.keys(eventParams)) {
        if (ALLOWED_MAIN_PARAMS.has(key)) {
          sanitized[key] = eventParams[key];
        }
      }
    }

    const isLocal = typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    if (isLocal) {
      if (typeof console !== 'undefined' && console.info) {
        console.info('[Locatria Analytics Local Debug]', eventName, sanitized);
      }
      return;
    }

    if (typeof window.gtag === 'function') {
      try {
        window.gtag('event', eventName, sanitized);
      } catch (err) {
        console.warn('[GA4] Event dispatch failed:', err);
      }
    }
  }

  // --- Content Metadata Resolver ---
  function resolveContentMetadata() {
    const path = (typeof window !== 'undefined' && window.location.pathname) ? window.location.pathname : '';
    const cleanSlug = path.split('/').pop().replace(/\.html$/, '');

    // 1. Hub & Known System Routes
    if (!cleanSlug || cleanSlug === 'index') {
      return { content_id: 'home', content_type: 'hub', industry_vertical: 'general' };
    }
    if (cleanSlug === 'knowledge') {
      return { content_id: 'knowledge_hub', content_type: 'hub', industry_vertical: 'general' };
    }
    if (cleanSlug === 'category') {
      return { content_id: 'category_listing', content_type: 'hub', industry_vertical: 'general' };
    }
    if (cleanSlug === 'ai-visibility-check') {
      return { content_id: 'ai-visibility-check', content_type: 'landing_page', industry_vertical: 'general' };
    }

    // 2. Canonical Article Lookup
    if (typeof window !== 'undefined' && window.LocatriaPublishedArticles && Array.isArray(window.LocatriaPublishedArticles)) {
      const match = window.LocatriaPublishedArticles.find(a =>
        a.id === cleanSlug || a.slugUrl.replace(/\.html$/, '') === cleanSlug
      );
      if (match) {
        // Normalize industry
        let ind = match.industry || 'general';
        if (ind === 'dental-clinics' || ind === 'dental') ind = 'dental';
        else if (ind === 'law-firms' || ind === 'law') ind = 'legal';
        else if (ind === 'real-estate') ind = 'real_estate';
        else ind = 'general';

        // Normalize type
        let typ = match.type || 'guide';
        if (typ === 'workflow') typ = 'workflow';
        else if (typ === 'checklist') typ = 'checklist';
        else typ = 'guide';

        return {
          content_id: match.id,
          content_type: typ,
          industry_vertical: ind
        };
      }
    }

    // 3. Fallback for unlisted/unknown routes
    return {
      content_id: cleanSlug || 'unmatched_route',
      content_type: 'unknown',
      industry_vertical: 'general'
    };
  }

  // Expose resolver globally for cross-module coordination
  if (typeof window !== 'undefined') {
    window.LocatriaAnalytics = window.LocatriaAnalytics || {};
    window.LocatriaAnalytics.safeGtag = safeGtag;
    window.LocatriaAnalytics.resolveContentMetadata = resolveContentMetadata;
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNewsletterForms();
    initSmoothAnchors();
    initTOCActiveTracking();
    initContentProgressTracking();
    console.log('Locatria Article System & Sticky TOC Initialized.');
  });

  function initNewsletterForms() {
    const forms = document.querySelectorAll('.js-newsletter-form');
    forms.forEach(form => {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        const input = form.querySelector('input[type="email"]');
        if (input && input.value) {
          const formLocation = (form.closest('footer') || form.closest('.site-footer')) ? 'footer' : 'inline';
          // Emit generate_lead as client-side intent ONLY (Zero PII passed)
          safeGtag('generate_lead', {
            form_name: 'weekly_ai_briefing',
            form_location: formLocation,
            intent_status: 'client_submitted_unverified'
          });

          alert('Thank you for your interest in Locatria AI Briefing. Automated newsletter subscriptions are currently not yet active during this preview phase, so no email has been sent and no subscription has been confirmed.');
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

  function initContentProgressTracking() {
    // Only track scroll milestones on article/content pages
    const hasArticleContainer = document.querySelector('.article-container') ||
                                document.querySelector('.article-body') ||
                                document.querySelector('article') ||
                                document.querySelector('.guide-content') ||
                                document.querySelector('.article-prose') ||
                                document.querySelector('.article-layout-grid');
    if (!hasArticleContainer) return;

    const metadata = resolveContentMetadata();
    if (metadata.content_type === 'hub') return;
    // Milestone deduplication set scoped strictly to current pageview
    const recordedMilestones = new Set();
    const milestones = [25, 50, 75, 100];
    let ticking = false;

    function checkMilestones() {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 100) return; // Prevent firing on zero/short height pages

      const scrollPercent = Math.min(100, Math.max(0, Math.round((window.pageYOffset / docHeight) * 100)));

      for (let i = 0; i < milestones.length; i++) {
        const m = milestones[i];
        if (scrollPercent >= m && !recordedMilestones.has(m)) {
          recordedMilestones.add(m);
          safeGtag('content_progress', {
            milestone: m,
            content_id: metadata.content_id,
            content_type: metadata.content_type,
            industry_vertical: metadata.industry_vertical
          });
        }
      }
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          checkMilestones();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    // Initial check in case page loaded pre-scrolled
    checkMilestones();
  }

})();
