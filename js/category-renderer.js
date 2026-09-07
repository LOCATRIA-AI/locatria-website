/**
 * LOCATRIA PRODUCTION CATEGORY RENDERER v1.1
 * Dynamically renders and filters published production articles from single source of truth.
 */
(function (window) {
  'use strict';

  const LocatriaCategoryRenderer = {
    version: '1.1.0',
    currentDifficulty: 'all',
    currentSort: 'recent',
    baseArticles: [],
    categoryTypeKey: 'guide',
    categoryTitle: 'Guides & Blueprints',
    filterIndustry: null,

    init: function () {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.renderPage());
      } else {
        this.renderPage();
      }
    },

    renderPage: function () {
      const articles = window.LocatriaPublishedArticles || [];
      if (!articles.length) return;

      const params = new URLSearchParams(window.location.search);
      let filterType = params.get('type');
      let filterIndustry = params.get('industry');

      if (!filterType && !filterIndustry) {
        filterType = 'guides';
      }

      this.filterIndustry = filterIndustry;
      let categoryTitle = 'Guides & Blueprints';
      let categoryDesc = 'Evergreen operational strategies, implementation blueprints, and compliance frameworks for US local service businesses.';
      let categoryTypeKey = 'guide';

      if (filterType) {
        switch (filterType.toLowerCase()) {
          case 'guides':
          case 'guide':
            categoryTitle = 'Guides & Blueprints';
            categoryDesc = 'Evergreen operational strategies, implementation blueprints, and compliance frameworks for US local service businesses.';
            categoryTypeKey = 'guide';
            break;
          case 'workflows':
          case 'workflow':
            categoryTitle = 'Automated Workflows';
            categoryDesc = 'Step-by-step operational diagrams and AI workflows for local business processes.';
            categoryTypeKey = 'workflow';
            break;
          case 'checklists':
          case 'checklist':
            categoryTitle = 'Audit Checklists';
            categoryDesc = 'Step-by-step readiness, compliance, and entity verification checklists.';
            categoryTypeKey = 'checklist';
            break;
          case 'tutorials':
          case 'tutorial':
            categoryTitle = 'Step-by-Step Tutorials';
            categoryDesc = 'Actionable zero-code setups with step-by-step instructions.';
            categoryTypeKey = 'tutorial';
            break;
          case 'faq':
            categoryTitle = 'FAQ Knowledge Base';
            categoryDesc = 'Clear answers to legal, HIPAA, and software pricing questions.';
            categoryTypeKey = 'faq';
            break;
          case 'glossary':
            categoryTitle = 'AI Terms Glossary';
            categoryDesc = 'Plain English definitions for LLMs, RAG, Tokens, and Fine-tuning.';
            categoryTypeKey = 'glossary';
            break;
          case 'prompts':
            categoryTitle = 'Prompt Library';
            categoryDesc = 'Tested prompts for ChatGPT, Claude, and Gemini.';
            categoryTypeKey = 'prompt';
            break;
          case 'resources':
          case 'resource':
            categoryTitle = 'Resource Library';
            categoryDesc = 'Calculators, frameworks, and reference sheets.';
            categoryTypeKey = 'resource';
            break;
          default:
            categoryTitle = filterType.charAt(0).toUpperCase() + filterType.slice(1);
            categoryTypeKey = filterType;
        }

        this.baseArticles = articles.filter(a => a.type === categoryTypeKey);
      } else if (filterIndustry) {
        let indName = filterIndustry;
        if (filterIndustry === 'real-estate') indName = 'Real Estate';
        else if (filterIndustry === 'law-firms') indName = 'Law Firms';
        else if (filterIndustry === 'dental-clinics') indName = 'Dental Clinics';

        categoryTitle = indName + ' Knowledge Hub';
        categoryDesc = 'Tailored AI visibility, content workflows, and compliance blueprints for ' + indName + '.';

        this.baseArticles = articles.filter(a => {
          const ind = (a.industry || '').toLowerCase();
          if (filterIndustry === 'real-estate') return ind.includes('real-estate');
          if (filterIndustry === 'law-firms') return ind.includes('law');
          if (filterIndustry === 'dental-clinics') return ind.includes('dental');
          return ind.includes(filterIndustry.toLowerCase());
        });
      }

      this.categoryTypeKey = categoryTypeKey;
      this.categoryTitle = categoryTitle;

      // Update Page Head Title & Breadcrumb
      document.title = categoryTitle + ' — Locatria';
      const breadcrumbCurrent = document.querySelector('.breadcrumb-list .breadcrumb-item[aria-current="page"]');
      if (breadcrumbCurrent) breadcrumbCurrent.textContent = categoryTitle;

      // Update Category Hero H1, Count Badge, Description
      const heroH1 = document.querySelector('.hero-knowledge-section h1');
      if (heroH1) heroH1.textContent = categoryTitle;

      const heroBadge = document.querySelector('.hero-knowledge-section .badge.badge-blue');
      if (heroBadge) {
        const countText = this.baseArticles.length + ' ' + (filterIndustry ? 'Articles' : (categoryTypeKey.charAt(0).toUpperCase() + categoryTypeKey.slice(1) + 's'));
        heroBadge.textContent = countText;
      }

      const heroDesc = document.querySelector('.hero-knowledge-section p');
      if (heroDesc) heroDesc.textContent = categoryDesc;

      // Update Sidebar Active Filter Highlight Dynamically
      const sidebarLinks = document.querySelectorAll('.sidebar-filter-link');
      const activeType = filterType ? filterType.toLowerCase() : (!filterIndustry ? 'guides' : null);
      sidebarLinks.forEach(link => {
        const href = (link.getAttribute('href') || '').toLowerCase();
        link.style.color = '';
        link.style.fontWeight = '';
        link.classList.remove('is-active');

        if (activeType && (href.includes('type=' + activeType) || (activeType === 'guides' && href.includes('type=guide')))) {
          link.style.color = 'var(--color-primary-600)';
          link.style.fontWeight = '600';
          link.classList.add('is-active');
        } else if (filterIndustry && href.includes('industry=' + filterIndustry.toLowerCase())) {
          link.style.color = 'var(--color-primary-600)';
          link.style.fontWeight = '600';
          link.classList.add('is-active');
        }
      });

      // Update Sidebar Popular / Recommended Guides with real published articles
      const popularGuidesList = document.querySelector('.related-guides-list');
      if (popularGuidesList) {
        const topGuides = articles.slice(0, 3);
        let popHtml = '';
        topGuides.forEach(g => {
          const indName = g.industry ? (g.industry.charAt(0).toUpperCase() + g.industry.slice(1)) : 'General';
          popHtml += `
            <li class="related-guide-item">
              <a href="${g.slugUrl}" class="related-guide-link">${g.title}</a>
              <span class="related-guide-meta">${indName} • ${g.readTime || '10 min read'}</span>
            </li>`;
        });
        popularGuidesList.innerHTML = popHtml;
      }

      // Initial filter and render execution
      this.applyFiltersAndRender();
    },

    applyFiltersAndRender: function () {
      const mainCol = document.querySelector('.layout-with-sidebar main');
      if (!mainCol) return;

      // Filter articles by Difficulty
      let displayArticles = [...this.baseArticles];

      if (this.currentDifficulty !== 'all') {
        displayArticles = displayArticles.filter(a => (a.difficulty || 'beginner').toLowerCase() === this.currentDifficulty);
      }

      // Sort articles
      if (this.currentSort === 'recent') {
        displayArticles.sort((a, b) => new Date(b.pubDate || '2026-08-10') - new Date(a.pubDate || '2026-08-10'));
      } else if (this.currentSort === 'readtime') {
        displayArticles.sort((a, b) => (parseInt(a.readTime, 10) || 10) - (parseInt(b.readTime, 10) || 10));
      } else if (this.currentSort === 'popular') {
        displayArticles.sort((a, b) => a.title.localeCompare(b.title));
      }

      // Build Interactive Filter Bar HTML
      const activeBtnStyle = 'background-color: var(--color-primary-500); color: white; border-color: var(--color-primary-500);';
      const inactiveBtnStyle = 'background-color: var(--color-bg-body); color: var(--color-text-main); border-color: var(--color-border-strong);';

      let contentHtml = `
        <div class="category-filter-bar" style="background-color: var(--color-bg-subtle); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-lg); padding: var(--space-4); margin-bottom: var(--space-8); display: flex; flex-direction: column; gap: var(--space-3);">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-3);">
            <div style="display: flex; align-items: center; gap: var(--space-2); flex-wrap: wrap;" class="difficulty-filter-group">
              <span style="font-size: var(--text-xs); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted);">Difficulty Level:</span>
              <button type="button" class="btn btn-secondary btn-sm js-difficulty-btn ${this.currentDifficulty === 'all' ? 'is-active' : ''}" data-difficulty="all" style="${this.currentDifficulty === 'all' ? activeBtnStyle : inactiveBtnStyle}">All</button>
              <button type="button" class="btn btn-secondary btn-sm js-difficulty-btn ${this.currentDifficulty === 'beginner' ? 'is-active' : ''}" data-difficulty="beginner" style="${this.currentDifficulty === 'beginner' ? activeBtnStyle : inactiveBtnStyle}">Beginner</button>
              <button type="button" class="btn btn-secondary btn-sm js-difficulty-btn ${this.currentDifficulty === 'intermediate' ? 'is-active' : ''}" data-difficulty="intermediate" style="${this.currentDifficulty === 'intermediate' ? activeBtnStyle : inactiveBtnStyle}">Intermediate</button>
              <button type="button" class="btn btn-secondary btn-sm js-difficulty-btn ${this.currentDifficulty === 'advanced' ? 'is-active' : ''}" data-difficulty="advanced" style="${this.currentDifficulty === 'advanced' ? activeBtnStyle : inactiveBtnStyle}">Advanced</button>
            </div>

            <div style="display: flex; align-items: center; gap: var(--space-2);">
              <span style="font-size: var(--text-xs); color: var(--color-text-muted);">Sort By:</span>
              <select class="js-sort-select" style="background-color: var(--color-bg-body); border: 1px solid var(--color-border-strong); border-radius: var(--radius-sm); padding: 4px 8px; font-size: var(--text-xs); color: var(--color-text-main); cursor: pointer;">
                <option value="recent" ${this.currentSort === 'recent' ? 'selected' : ''}>Recently Updated</option>
                <option value="popular" ${this.currentSort === 'popular' ? 'selected' : ''}>Most Popular</option>
                <option value="readtime" ${this.currentSort === 'readtime' ? 'selected' : ''}>Reading Time (Shortest)</option>
              </select>
            </div>
          </div>
        </div>`;

      if (!displayArticles.length) {
        contentHtml += `
          <div class="card card-article" style="padding: var(--space-8); text-align: center; background-color: var(--color-bg-subtle);">
            <h3 style="font-size: var(--text-xl); margin-bottom: var(--space-2);">No articles found matching this filter</h3>
            <p style="color: var(--color-text-muted); max-width: 540px; margin: 0 auto var(--space-4) auto;">
              There are currently no published ${this.categoryTitle.toLowerCase()} at the "${this.currentDifficulty}" difficulty level.
            </p>
            <button type="button" class="btn btn-primary btn-sm js-reset-difficulty">Show All Difficulty Levels →</button>
          </div>`;
      } else {
        // Featured 1st Article
        const feat = displayArticles[0];
        contentHtml += `
          <article class="card card-article" style="margin-bottom: var(--space-8); background-color: var(--color-bg-subtle);">
            <div style="display: grid; grid-template-columns: 1fr; gap: var(--space-6);">
              <div>
                <div class="card-article-meta">
                  <span class="badge badge-blue">Featured ${feat.type.toUpperCase()}</span>
                  <span class="badge badge-slate">${feat.difficulty ? feat.difficulty.charAt(0).toUpperCase() + feat.difficulty.slice(1) : 'Beginner'}</span>
                  <span style="font-size: var(--text-xs); color: var(--color-text-muted); margin-left: auto;">${feat.readTime || '10 min read'}</span>
                </div>
                <h2 class="card-article-title" style="font-size: var(--text-2xl); margin-top: var(--space-2);">
                  <a href="${feat.slugUrl}">${feat.title}</a>
                </h2>
                <p class="card-article-excerpt" style="font-size: var(--text-base); max-width: 100%;">
                  ${feat.description}
                </p>
                <div class="card-article-author">
                  <div class="author-avatar-sm">LET</div>
                  <div class="author-info-sm">
                    <div class="author-name-sm">${feat.authorName || 'Locatria Editorial Team'}</div>
                    <div>Senior AI Architects • Updated August 2026</div>
                  </div>
                  <a href="${feat.slugUrl}" class="btn btn-primary btn-sm" style="margin-left: auto;">Read Article →</a>
                </div>
              </div>
            </div>
          </article>`;

        // Remaining Articles Grid
        if (displayArticles.length > 1) {
          contentHtml += `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-6); margin-bottom: var(--space-10);">`;
          for (let i = 1; i < displayArticles.length; i++) {
            const art = displayArticles[i];
            const indBadge = art.industry ? (art.industry.charAt(0).toUpperCase() + art.industry.slice(1)) : 'General';
            contentHtml += `
              <article class="card card-article">
                <div class="card-article-meta">
                  <span class="badge badge-teal">${indBadge}</span>
                  <span class="badge badge-slate">${art.difficulty ? art.difficulty.charAt(0).toUpperCase() + art.difficulty.slice(1) : 'Beginner'}</span>
                </div>
                <h3 class="card-article-title">
                  <a href="${art.slugUrl}">${art.title}</a>
                </h3>
                <p class="card-article-excerpt">
                  ${art.description}
                </p>
                <div class="card-article-author">
                  <div class="author-avatar-sm">LET</div>
                  <div class="author-info-sm">
                    <div class="author-name-sm">${art.authorName || 'Locatria Editorial Team'}</div>
                    <div>${art.readTime || '10 min read'} • Aug 2026</div>
                  </div>
                </div>
              </article>`;
          }
          contentHtml += `</div>`;
        }
      }

      mainCol.innerHTML = contentHtml;

      // Attach Event Listeners to Difficulty Buttons & Sort Selector
      const self = this;
      const difficultyBtns = mainCol.querySelectorAll('.js-difficulty-btn');
      difficultyBtns.forEach(btn => {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          const targetDiff = this.getAttribute('data-difficulty');
          if (self.currentDifficulty === targetDiff) return;
          self.currentDifficulty = targetDiff;
          self.applyFiltersAndRender();
        });
      });

      const sortSelect = mainCol.querySelector('.js-sort-select');
      if (sortSelect) {
        sortSelect.addEventListener('change', function () {
          self.currentSort = this.value;
          self.applyFiltersAndRender();
        });
      }

      const resetBtn = mainCol.querySelector('.js-reset-difficulty');
      if (resetBtn) {
        resetBtn.addEventListener('click', function (e) {
          e.preventDefault();
          self.currentDifficulty = 'all';
          self.applyFiltersAndRender();
        });
      }
    }
  };

  LocatriaCategoryRenderer.init();
  window.LocatriaCategoryRenderer = LocatriaCategoryRenderer;
})(window);
