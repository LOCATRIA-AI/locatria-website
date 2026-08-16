/**
 * LOCATRIA LEARNING PATHS ENGINE v1.0
 * Renders data-driven Learning Path cards and details from single source of truth.
 */
(function (root) {
  'use strict';

  const LocatriaLearningPathsEngine = {
    version: '1.0.0',

    init: function () {
      if (typeof document === 'undefined') return;
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.applyPaths());
      } else {
        this.applyPaths();
      }
    },

    applyPaths: function () {
      const paths = root.LocatriaLearningPaths || [];
      if (!paths.length) return;

      // Render Learning Path Cards in <section id="learning-paths"> on homepage/knowledge
      const sectionContainers = document.querySelectorAll('#learning-paths .container');
      sectionContainers.forEach(container => {
        const grid = container.querySelector('div[style*="grid-template-columns"]');
        if (!grid) return;

        let cardsHtml = '';
        paths.forEach(p => {
          const badgeClass = p.id === 'lp01' ? 'badge-blue' : (p.id.includes('dental') ? 'badge-teal' : (p.id.includes('law') ? 'badge-slate' : (p.id.includes('real-estate') ? 'badge-amber' : 'badge-blue')));
          
          let previewItems = '';
          p.steps.slice(0, 3).forEach(s => {
            previewItems += `<div class="path-curriculum-item">✓ Step ${s.stepNumber}: ${s.title}</div>`;
          });

          cardsHtml += `
            <div class="card-learning-path">
              <div class="path-header">
                <div class="path-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                </div>
                <span class="badge ${badgeClass}">${p.id.toUpperCase()} • ${p.level}</span>
              </div>
              <h3 class="path-title">${p.title}</h3>
              <p class="path-desc">${p.shortDescription}</p>
              <div class="path-curriculum-preview">
                ${previewItems}
              </div>
              <div class="path-footer">
                <span>${p.stepCount} Steps • ${p.estimatedTime}</span>
                <a href="${p.url}" class="btn btn-text btn-sm">Start Path →</a>
              </div>
            </div>`;
        });

        grid.innerHTML = cardsHtml;
      });
    }
  };

  LocatriaLearningPathsEngine.init();
  root.LocatriaLearningPathsEngine = LocatriaLearningPathsEngine;
})(typeof window !== 'undefined' ? window : global);
