/**
 * LOCATRIA PRODUCTION CONTENT COUNTS ENGINE v1.2
 * Calculates real-time published content & industry counts from single source of truth.
 */
(function (window) {
  'use strict';

  const LocatriaContentCounts = {
    version: '1.2.0',
    publishedTotal: 30,
    countsByType: {
  "guide": 9,
  "workflow": 18,
  "checklist": 3,
  "tutorial": 0,
  "faq": 0,
  "glossary": 0,
  "prompt": 0,
  "resource": 0
},
    countsByIndustry: {
  "dental": 6,
  "law": 5,
  "realEstate": 5,
  "general": 14
},

    init: function () {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.applyCounts());
      } else {
        this.applyCounts();
      }
    },

    applyCounts: function () {
      // Update Knowledge Hub Category Card Footers if present
      const cardFooterGuides = document.querySelector('[href="category.html?type=guides"] .card-category-footer span:first-child');
      if (cardFooterGuides) cardFooterGuides.textContent = this.countsByType.guide + ' Guides';

      const cardFooterTutorials = document.querySelector('[href="category.html?type=tutorials"] .card-category-footer span:first-child');
      if (cardFooterTutorials) cardFooterTutorials.textContent = this.countsByType.tutorial + ' Tutorials';

      const cardFooterWorkflows = document.querySelector('[href="category.html?type=workflows"] .card-category-footer span:first-child');
      if (cardFooterWorkflows) cardFooterWorkflows.textContent = this.countsByType.workflow + ' Workflows';

      const cardFooterChecklists = document.querySelector('[href="category.html?type=checklists"] .card-category-footer span:first-child');
      if (cardFooterChecklists) cardFooterChecklists.textContent = this.countsByType.checklist + ' Checklists';

      const cardFooterFaq = document.querySelector('[href="category.html?type=faq"] .card-category-footer span:first-child');
      if (cardFooterFaq) cardFooterFaq.textContent = this.countsByType.faq + ' QA Topics';

      const cardFooterGlossary = document.querySelector('[href="category.html?type=glossary"] .card-category-footer span:first-child');
      if (cardFooterGlossary) cardFooterGlossary.textContent = this.countsByType.glossary + ' Terms';

      const cardFooterPrompts = document.querySelector('[href="category.html?type=prompts"] .card-category-footer span:first-child');
      if (cardFooterPrompts) cardFooterPrompts.textContent = this.countsByType.prompt + ' Prompts';

      const cardFooterResources = document.querySelector('[href="category.html?type=resources"] .card-category-footer span:first-child');
      if (cardFooterResources) cardFooterResources.textContent = this.countsByType.resource + ' Resources';

      // Update Industry Hub Card Badges
      const indBadgeRealEstate = document.querySelector('[href="category.html?industry=real-estate"]')?.previousElementSibling;
      if (indBadgeRealEstate) indBadgeRealEstate.textContent = this.countsByIndustry.realEstate + ' Articles';

      const indBadgeLaw = document.querySelector('[href="category.html?industry=law-firms"]')?.previousElementSibling;
      if (indBadgeLaw) indBadgeLaw.textContent = this.countsByIndustry.law + ' Articles';

      const indBadgeDental = document.querySelector('[href="category.html?industry=dental-clinics"]')?.previousElementSibling;
      if (indBadgeDental) indBadgeDental.textContent = this.countsByIndustry.dental + ' Articles';

      // Update Sidebar Filter Counts if present
      const sidebarGuides = document.querySelector('.sidebar-filter-link[href*="type=guides"] .sidebar-filter-count');
      if (sidebarGuides) sidebarGuides.textContent = this.countsByType.guide;

      const sidebarTutorials = document.querySelector('.sidebar-filter-link[href*="type=tutorials"] .sidebar-filter-count');
      if (sidebarTutorials) sidebarTutorials.textContent = this.countsByType.tutorial;

      const sidebarWorkflows = document.querySelector('.sidebar-filter-link[href*="type=workflows"] .sidebar-filter-count');
      if (sidebarWorkflows) sidebarWorkflows.textContent = this.countsByType.workflow;

      const sidebarResources = document.querySelector('.sidebar-filter-link[href*="type=resources"] .sidebar-filter-count');
      if (sidebarResources) sidebarResources.textContent = this.countsByType.resource;

      const sidebarChecklists = document.querySelector('.sidebar-filter-link[href*="type=checklists"] .sidebar-filter-count');
      if (sidebarChecklists) sidebarChecklists.textContent = this.countsByType.checklist;

      const sidebarPrompts = document.querySelector('.sidebar-filter-link[href*="type=prompts"] .sidebar-filter-count');
      if (sidebarPrompts) sidebarPrompts.textContent = this.countsByType.prompt;

      // Update Category Page Hero Badge if present
      const categoryBadge = document.querySelector('.hero-knowledge-section .badge.badge-blue');
      if (categoryBadge && window.location.search) {
        const params = new URLSearchParams(window.location.search);
        const type = params.get('type');
        if (type && this.countsByType[type] !== undefined) {
          const typeName = type.charAt(0).toUpperCase() + type.slice(1);
          categoryBadge.textContent = this.countsByType[type] + ' ' + typeName;
        }
      }
    }
  };

  LocatriaContentCounts.init();
  window.LocatriaContentCounts = LocatriaContentCounts;
})(window);
