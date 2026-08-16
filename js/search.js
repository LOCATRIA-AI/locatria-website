/**
 * LOCATRIA GLOBAL DESIGN SYSTEM - SEARCH JS
 * Global Search Modal (Cmd/Ctrl + K), Real-time Filter, Recent Searches, Focus Trap & Accessibility
 */

(function () {
  'use strict';

  // Sample Knowledge Hub Dataset
  const KNOWLEDGE_ITEMS = [
    {
      title: "AI Lead Capture Setup for Real Estate Agents",
      snippet: "Step-by-step guide to setting up automated 24/7 AI response agents for listing inquiries.",
      type: "Guides",
      industry: "Real Estate",
      url: "category.html?type=guides#article-1"
    },
    {
      title: "How Dental Clinics Use AI for Patient Intake Forms",
      snippet: "Reduce no-shows and streamline patient registration using custom GPT assistants.",
      type: "Tutorials",
      industry: "Dental Clinics",
      url: "category.html?type=tutorials#article-3"
    },
    {
      title: "Law Firm Intake Automation Prompt Pack",
      snippet: "Tested ChatGPT & Claude prompts specifically tailored for legal intake triage.",
      type: "Resources",
      industry: "Law Firms",
      url: "category.html?type=prompts"
    },
    {
      title: "Local SEO & AI Voice Search Optimization 2026",
      snippet: "How small business owners can optimize Google Business Profile for AI answers.",
      type: "Guides",
      industry: "Local Business",
      url: "category.html?type=guides#article-6"
    },
    {
      title: "Dental Practice AI Marketing ROI Calculator",
      snippet: "Spreadsheet & checklist to estimate cost savings from AI patient scheduling.",
      type: "Resources",
      industry: "Dental Clinics",
      url: "category.html?type=resources"
    },
    {
      title: "AI Contract Review Workflow for Small Law Offices",
      snippet: "Practical guardrails and tools for safe, HIPAA/State Bar compliant document summary.",
      type: "Workflows",
      industry: "Law Firms",
      url: "category.html?type=workflows#article-2"
    }
  ];

  // Default Recent Searches
  let recentSearches = [
    "AI for Real Estate",
    "ChatGPT Prompts",
    "Lead Generation Workflow"
  ];

  let currentCategoryFilter = 'All';
  let lastFocusedElement = null;

  document.addEventListener('DOMContentLoaded', function () {
    initSearchModal();
  });

  function initSearchModal() {
    const triggerBtns = document.querySelectorAll('.js-search-trigger');
    const backdrop = document.querySelector('.search-modal-backdrop');
    const closeBtn = document.querySelector('.search-modal-close-btn');
    const searchInput = document.querySelector('.search-modal-input');
    const filterTabs = document.querySelectorAll('.search-filter-tab');
    const resultsContainer = document.querySelector('.search-results-list');

    if (!backdrop || !searchInput || !resultsContainer) return;

    function openModal() {
      lastFocusedElement = document.activeElement;
      backdrop.classList.add('is-active');
      document.body.style.overflow = 'hidden';
      searchInput.value = '';
      renderResults('', currentCategoryFilter);
      setTimeout(() => searchInput.focus(), 50);
    }

    function closeModal() {
      backdrop.classList.remove('is-active');
      document.body.style.overflow = '';
      if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
        lastFocusedElement.focus();
      }
    }

    // Trigger Event Listeners
    triggerBtns.forEach(btn => {
      btn.addEventListener('click', openModal);
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    // Backdrop Click Close
    backdrop.addEventListener('click', function (e) {
      if (e.target === backdrop) closeModal();
    });

    // Keyboard Shortcuts (Cmd/Ctrl + K & Esc & Focus Trap)
    document.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (backdrop.classList.contains('is-active')) {
          closeModal();
        } else {
          openModal();
        }
      } else if (e.key === 'Escape' && backdrop.classList.contains('is-active')) {
        closeModal();
      } else if (e.key === 'Tab' && backdrop.classList.contains('is-active')) {
        const focusableElements = backdrop.querySelectorAll('input, button, a[href], [tabindex]:not([tabindex="-1"])');
        if (focusableElements.length === 0) return;
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    });

    // Input Typing Handler
    searchInput.addEventListener('input', function (e) {
      const query = e.target.value.trim().toLowerCase();
      renderResults(query, currentCategoryFilter);
    });

    // Category Tabs Filtering
    filterTabs.forEach(tab => {
      tab.addEventListener('click', function () {
        filterTabs.forEach(t => t.classList.remove('is-active'));
        this.classList.add('is-active');
        currentCategoryFilter = this.getAttribute('data-category') || 'All';
        renderResults(searchInput.value.trim().toLowerCase(), currentCategoryFilter);
      });
    });

    function renderResults(query, category) {
      // If query is empty, display Recent Searches & Default Hub Highlights
      if (query === '') {
        let recentHtml = '';
        if (recentSearches.length > 0) {
          recentHtml = `
            <div style="padding: 12px 16px 8px 16px; display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted);">Recent Searches</span>
              <button type="button" class="js-clear-recent" style="background: none; border: none; font-size: 0.6875rem; color: var(--color-primary-600); cursor: pointer; padding: 0;">Clear all</button>
            </div>
            <div style="display: flex; flex-direction: column; gap: 2px; margin-bottom: 12px;">
              ${recentSearches.map(term => `
                <button type="button" class="js-recent-item" data-term="${escapeHtml(term)}" style="display: flex; align-items: center; gap: 10px; padding: 8px 16px; background: none; border: none; text-align: left; font-size: 13px; color: var(--color-text-main); cursor: pointer; border-radius: 6px;" onmouseover="this.style.backgroundColor='var(--color-primary-50)'" onmouseout="this.style.backgroundColor='transparent'">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-text-muted);"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <span>${escapeHtml(term)}</span>
                </button>
              `).join('')}
            </div>
          `;
        }

        let defaultList = KNOWLEDGE_ITEMS.filter(item => category === 'All' || item.type === category || item.industry === category);
        
        resultsContainer.innerHTML = `
          ${recentHtml}
          <div style="padding: 4px 16px 8px 16px; font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted);">Featured Knowledge Guides</div>
          ${defaultList.map((item, index) => `
            <a href="${item.url}" class="search-result-item ${index === 0 ? 'is-selected' : ''}" onclick="window.closeSearchModal && window.closeSearchModal()">
              <div>
                <div class="search-result-title">${escapeHtml(item.title)}</div>
                <div class="search-result-snippet">${escapeHtml(item.snippet)}</div>
              </div>
              <span class="badge badge-blue" style="margin-left: 12px; flex-shrink: 0;">${item.type}</span>
            </a>
          `).join('')}
        `;

        // Attach listeners for recent search items
        const recentBtns = resultsContainer.querySelectorAll('.js-recent-item');
        recentBtns.forEach(btn => {
          btn.addEventListener('click', function () {
            const term = this.getAttribute('data-term');
            searchInput.value = term;
            renderResults(term.toLowerCase(), currentCategoryFilter);
          });
        });

        const clearBtn = resultsContainer.querySelector('.js-clear-recent');
        if (clearBtn) {
          clearBtn.addEventListener('click', function () {
            recentSearches = [];
            renderResults('', currentCategoryFilter);
          });
        }
        return;
      }

      // Filtered Results
      let filtered = KNOWLEDGE_ITEMS.filter(item => {
        const matchesQuery = item.title.toLowerCase().includes(query) ||
          item.snippet.toLowerCase().includes(query) ||
          item.industry.toLowerCase().includes(query);

        const matchesCat = category === 'All' || item.type === category || item.industry === category;
        return matchesQuery && matchesCat;
      });

      if (filtered.length === 0) {
        resultsContainer.innerHTML = `
          <div style="padding: 32px 16px; text-align: center; color: var(--color-text-muted); font-size: 13px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 8px auto; color: var(--color-text-muted); display: block;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            No articles or resources found matching "<strong>${escapeHtml(query)}</strong>".
          </div>
        `;
        return;
      }

      resultsContainer.innerHTML = filtered.map((item, index) => `
        <a href="${item.url}" class="search-result-item ${index === 0 ? 'is-selected' : ''}" onclick="window.closeSearchModal && window.closeSearchModal()">
          <div>
            <div class="search-result-title">${escapeHtml(item.title)}</div>
            <div class="search-result-snippet">${escapeHtml(item.snippet)}</div>
          </div>
          <span class="badge badge-blue" style="margin-left: 12px; flex-shrink: 0;">${item.type}</span>
        </a>
      `).join('');
    }

    function escapeHtml(str) {
      return str.replace(/[&<>"']/g, function (m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
      });
    }

    window.closeSearchModal = closeModal;
  }
})();
