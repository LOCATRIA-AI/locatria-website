/**
 * LOCATRIA CONTENT COMPONENT SYSTEM v1.0 - COMPONENT RENDERER ENGINE
 * Data-driven JSON -> HTML Resolver for all 36 Approved Components (C01 - C36)
 */

(function (window) {
  'use strict';

  const LocatriaRenderer = {
    version: '1.0.0',

    /**
     * Render an array of component JSON blocks into a container element
     */
    renderArticle: function (blocks, container) {
      if (!container || !Array.isArray(blocks)) return;
      container.innerHTML = blocks.map(block => this.renderBlock(block)).join('\n');
    },

    /**
     * Render a single JSON component block to HTML string
     */
    renderBlock: function (block) {
      if (!block || typeof block !== 'object' || !block.type) {
        return this.renderFallback({ error: 'Missing block object or type' });
      }

      switch (block.type) {
        // --- GROUP 01: FOUNDATION (C01 - C07) ---
        case 'paragraph':
          return `<p class="component-paragraph">${this.formatInline(block.content || '')}</p>`;

        case 'heading': {
          const level = block.level || 'h2';
          const validLevel = ['h2', 'h3', 'h4'].includes(level) ? level : 'h2';
          const id = block.id || this.slugify(block.title || '');
          return `<${validLevel} id="${id}" class="component-heading ${validLevel}">${this.formatInline(block.title || '')}</${validLevel}>`;
        }

        case 'orderedList':
          return `<ol class="component-ordered-list">${(block.items || []).map(i => `<li>${this.formatInline(i)}</li>`).join('')}</ol>`;

        case 'unorderedList':
          return `<ul class="component-unordered-list">${(block.items || []).map(i => `<li>${this.formatInline(i)}</li>`).join('')}</ul>`;

        case 'link':
          return `<a href="${this.escapeHTML(block.url || '#')}" class="component-link" ${block.external ? 'target="_blank" rel="noopener noreferrer"' : ''}>${this.formatInline(block.label || block.url || '')}</a>`;

        case 'quote':
          return `<blockquote class="component-quote">
            <p>"${this.formatInline(block.quote || '')}"</p>
            ${block.author ? `<cite class="component-quote-author">— ${this.formatInline(block.author)}${block.role ? `, ${this.formatInline(block.role)}` : ''}</cite>` : ''}
          </blockquote>`;

        case 'divider':
          return `<hr class="component-divider" role="separator" />`;

        // --- GROUP 02: SEMANTIC (C08 - C14) ---
        case 'keyTakeaways':
          return `<div id="${block.id || 'key-takeaways'}" class="component-key-takeaways">
            <div class="takeaways-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
              <span>${this.formatInline(block.title || 'Key Takeaways')}</span>
            </div>
            <ul class="takeaways-list">
              ${(block.items || []).map(item => `
                <li class="takeaways-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>${this.formatInline(item)}</span>
                </li>
              `).join('')}
            </ul>
          </div>`;

        case 'callout':
        case 'tip':
        case 'warning':
        case 'importantNote': {
          let variant = block.variant || 'info';
          if (block.type === 'tip') variant = 'tip';
          if (block.type === 'warning') variant = 'warning';
          if (block.type === 'importantNote') variant = 'important';

          const icons = {
            info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
            tip: '<polyline points="20 6 9 17 4 12"/>',
            warning: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
            important: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'
          };
          const formattedTitle = block.title ? this.formatInline(block.title) : '';
          const titleWithColon = formattedTitle ? (formattedTitle.endsWith(':') ? formattedTitle : `${formattedTitle}:`) : '';

          return `<div class="component-callout variant-${variant} callout callout-${variant}">
            <svg class="callout-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">${icons[variant] || icons.info}</svg>
            <div class="callout-content">
              ${titleWithColon ? `<strong class="callout-title">${titleWithColon}</strong>` : ''}
              <div class="callout-body">${this.formatInline(block.content || '')}</div>
            </div>
          </div>`;
        }

        case 'definition':
          return `<div class="component-definition">
            <div class="definition-term">${this.formatInline(block.term || '')}</div>
            <div class="definition-text">${this.formatInline(block.definition || '')}</div>
            ${block.example ? `<div class="definition-example"><strong>Example:</strong> ${this.formatInline(block.example)}</div>` : ''}
          </div>`;

        case 'example':
          return `<div class="component-example">
            <div class="example-header">${this.formatInline(block.title || 'Example')}</div>
            ${block.context ? `<p style="font-size: var(--text-xs); color: var(--color-text-muted); margin-bottom: 8px;">${this.formatInline(block.context)}</p>` : ''}
            <p style="font-size: var(--text-sm); margin: 0; white-space: pre-wrap;">${this.formatInline(block.content || '')}</p>
          </div>`;

        // --- GROUP 03: PROCESS (C15 - C17) ---
        case 'stepByStep':
          return `<div class="component-step-by-step">
            ${block.title ? `<h3 class="component-heading h3">${this.formatInline(block.title)}</h3>` : ''}
            ${(block.steps || []).map((s, idx) => `
              <div class="step-item-card">
                <span class="step-badge">Step ${String(idx + 1).padStart(2, '0')}</span>
                <h4 style="font-size: var(--text-base); font-weight: 700; margin: 4px 0 6px 0;">${this.formatInline(s.title || '')}</h4>
                <p style="font-size: var(--text-sm); margin: 0; color: var(--color-text-body); white-space: pre-wrap;">${this.formatInline(s.content || '')}</p>
              </div>
            `).join('')}
          </div>`;

        case 'workflow':
          return `<div class="component-workflow">
            ${block.title ? `<h4 style="font-size: var(--text-sm); font-weight: 800; margin-bottom: 8px;">${this.formatInline(block.title)}</h4>` : ''}
            <div class="workflow-nodes-container">
              ${(block.nodes || []).map((node, i) => `
                <div class="workflow-node type-${node.type || 'process'}">
                  <div style="font-weight: 700; uppercase; font-size: 10px; color: var(--color-text-muted);">${this.formatInline(node.type || 'process')}</div>
                  <div style="font-weight: 600;">${this.formatInline(node.label || '')}</div>
                </div>
                ${i < (block.nodes.length - 1) ? '<div class="workflow-arrow">→</div>' : ''}
              `).join('')}
            </div>
          </div>`;

        case 'checklist':
          return `<div class="component-checklist">
            ${block.title ? `<div style="font-weight: 800; font-size: var(--text-base); margin-bottom: 12px;">${this.formatInline(block.title)}</div>` : ''}
            <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px;">
              ${(block.items || []).map((item, idx) => `
                <li style="display: flex; align-items: center; gap: 10px; font-size: var(--text-sm);">
                  <input type="checkbox" class="checklist-checkbox" id="chk-${idx}" ${item.checked ? 'checked' : ''} />
                  <label for="chk-${idx}">${this.formatInline(item.label || item)}</label>
                </li>
              `).join('')}
            </ul>
          </div>`;

        // --- GROUP 04: DATA + AI (C18 - C24) ---
        case 'table':
          return `<div class="component-table-wrapper">
            <table class="component-comparison-table">
              ${block.caption ? `<caption>${this.formatInline(block.caption)}</caption>` : ''}
              <thead>
                <tr>${(block.headers || []).map(h => `<th>${this.formatInline(h)}</th>`).join('')}</tr>
              </thead>
              <tbody>
                ${(block.rows || []).map(row => `<tr>${row.map(cell => `<td>${this.formatInline(cell)}</td>`).join('')}</tr>`).join('')}
              </tbody>
            </table>
          </div>`;

        case 'comparisonTable':
          const headers = block.columns || block.headers || [];
          return `<div id="${block.id || 'comparison-table'}" class="component-table-wrapper">
            <table class="component-comparison-table">
              <thead>
                <tr>
                  ${headers.map((c, idx) => `<th>${this.formatInline(c)}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${(block.rows || []).map(r => {
                  if (Array.isArray(r)) {
                    return `<tr>${r.map(v => `<td>${this.formatInline(v)}</td>`).join('')}</tr>`;
                  } else {
                    return `<tr>
                      <td><strong>${this.formatInline(r.criteria || '')}</strong></td>
                      ${(r.values || []).map(v => `<td>${this.formatInline(v)}</td>`).join('')}
                    </tr>`;
                  }
                }).join('')}
              </tbody>
            </table>
          </div>`;

        case 'faq':
          return `<div id="${block.id || 'faq'}" class="component-faq-list">
            ${block.title ? `<h3 class="component-heading h3" style="margin-bottom: var(--space-4);">${this.formatInline(block.title)}</h3>` : ''}
            ${(block.items || []).map(faq => `
              <div class="faq-item" style="margin-bottom: var(--space-4); padding: var(--space-4); background-color: var(--color-bg-subtle); border-radius: var(--radius-md); border: 1px solid var(--color-border-subtle);">
                <h4 style="font-size: var(--text-base); font-weight: 700; margin: 0 0 8px 0; color: var(--color-text-main);">${this.formatInline(faq.question || '')}</h4>
                <p style="font-size: var(--text-sm); margin: 0; color: var(--color-text-body); line-height: 1.6; white-space: pre-wrap;">${this.formatInline(faq.answer || '')}</p>
              </div>
            `).join('')}
          </div>`;

        case 'definitions':
          return `<div id="${block.id || 'key-definitions'}" class="component-definitions-list" style="margin-bottom: var(--space-6);">
            ${block.title ? `<h3 class="component-heading h3" style="margin-bottom: var(--space-4);">${this.formatInline(block.title)}</h3>` : ''}
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-4);">
              ${(block.items || []).map(item => `
                <div class="component-definition" style="padding: var(--space-4); background-color: var(--color-bg-subtle); border-radius: var(--radius-md); border: 1px solid var(--color-border-subtle);">
                  <div class="definition-term" style="font-weight: 700; font-size: var(--text-base); color: var(--color-primary-700); margin-bottom: 4px;">${this.formatInline(item.term || '')}</div>
                  <div class="definition-text" style="font-size: var(--text-sm); color: var(--color-text-body); line-height: 1.5; white-space: pre-wrap;">${this.formatInline(item.definition || '')}</div>
                </div>
              `).join('')}
            </div>
          </div>`;

        case 'sources':
          return `<div id="${block.id || 'sources'}" class="component-sources-list" style="margin-top: var(--space-8); padding: var(--space-5); background-color: var(--color-bg-subtle); border-radius: var(--radius-md); border: 1px solid var(--color-border-subtle);">
            ${block.title ? `<h4 style="font-size: var(--text-sm); font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted); margin: 0 0 12px 0;">${this.formatInline(block.title)}</h4>` : ''}
            <ul style="padding-left: 20px; margin: 0; font-size: var(--text-xs); color: var(--color-text-muted); display: flex; flex-direction: column; gap: 6px;">
              ${(block.items || []).map(src => `<li>${this.formatInline(src)}</li>`).join('')}
            </ul>
          </div>`;

        case 'prosCons':
          return `<div class="component-pros-cons">
            <div class="pros-box">
              <div class="pros-title">✓ Pros & Advantages</div>
              <ul style="padding-left: 18px; margin: 0; font-size: var(--text-xs); color: #14532d;">
                ${(block.pros || []).map(p => `<li>${this.formatInline(p)}</li>`).join('')}
              </ul>
            </div>
            <div class="cons-box">
              <div class="cons-title">✕ Cons & Limitations</div>
              <ul style="padding-left: 18px; margin: 0; font-size: var(--text-xs); color: #7f1d1d;">
                ${(block.cons || []).map(c => `<li>${this.formatInline(c)}</li>`).join('')}
              </ul>
            </div>
          </div>`;

        case 'promptBlock':
          return `<div id="${block.id || 'required-ai-prompt'}" class="component-prompt-block">
            <div class="prompt-header">
              <span>${this.formatInline(block.title || 'Required AI Prompt')}</span>
              <button type="button" class="copy-btn" onclick="navigator.clipboard.writeText('${this.escapeJS(block.prompt || '')}'); alert('Prompt copied to clipboard!');">Copy Prompt</button>
            </div>
            <code>${this.escapeHTML(block.prompt || '')}</code>
          </div>`;

        case 'codeBlock':
          return `<div class="component-code-block">
            <div class="prompt-header">
              <span>${this.formatInline(block.filename || block.language || 'code')}</span>
              <button type="button" class="copy-btn" onclick="navigator.clipboard.writeText('${this.escapeJS(block.code || '')}'); alert('Code copied!');">Copy Code</button>
            </div>
            <pre style="margin: 0;"><code>${this.escapeHTML(block.code || '')}</code></pre>
          </div>`;

        case 'inputOutput':
          return `<div class="component-input-output">
            <div class="io-box">
              <div class="io-label">${this.formatInline(block.input?.label || 'Input')}</div>
              <div style="font-size: var(--text-xs); white-space: pre-wrap;">${this.formatInline(block.input?.content || '')}</div>
            </div>
            ${block.process ? `
              <div class="io-box" style="background-color: var(--color-primary-50);">
                <div class="io-label" style="color: var(--color-primary-700);">${this.formatInline(block.process.label || 'Process')}</div>
                <div style="font-size: var(--text-xs); white-space: pre-wrap;">${this.formatInline(block.process.content || '')}</div>
              </div>
            ` : ''}
            <div class="io-box">
              <div class="io-label" style="color: #16a34a;">${this.formatInline(block.output?.label || 'Output')}</div>
              <div style="font-size: var(--text-xs); white-space: pre-wrap;">${this.formatInline(block.output?.content || '')}</div>
            </div>
          </div>`;

        case 'workflowDiagram':
          return `<div class="component-workflow-diagram">
            <div style="font-weight: 800; font-size: var(--text-sm); margin-bottom: 8px;">${this.formatInline(block.title || 'Workflow Diagram')}</div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              ${(block.nodes || []).map(n => `<span class="badge badge-blue">${this.formatInline(n.name || n)}</span>`).join(' → ')}
            </div>
          </div>`;

        // --- GROUP 05: MEDIA + NAVIGATION (C25 - C31) ---
        case 'image':
          return `<figure class="component-media-figure">
            <img src="${this.escapeHTML(block.src || '')}" alt="${this.escapeHTML(block.alt || '')}" loading="lazy" />
            ${block.caption ? `<figcaption class="component-figcaption">${this.formatInline(block.caption)}</figcaption>` : ''}
          </figure>`;

        case 'screenshot':
          return `<figure class="component-media-figure">
            ${block.step ? `<span class="step-badge">Step ${block.step} Screenshot</span>` : ''}
            <img src="${this.escapeHTML(block.src || '')}" alt="${this.escapeHTML(block.alt || '')}" loading="lazy" style="border: 1px solid var(--color-border-strong);" />
            ${block.caption ? `<figcaption class="component-figcaption">${this.formatInline(block.caption)}</figcaption>` : ''}
          </figure>`;

        case 'diagram':
          return `<div class="component-workflow-diagram">
            <div style="font-weight: 800; font-size: var(--text-sm);">${this.formatInline(block.title || 'Conceptual Diagram')}</div>
            <p style="font-size: var(--text-xs); color: var(--color-text-muted);">${this.formatInline(block.description || '')}</p>
          </div>`;

        case 'video':
          return `<div class="component-video-container">
            <div class="video-responsive-wrapper">
              <iframe src="https://www.youtube.com/embed/${this.escapeHTML(block.videoId || '')}" title="${this.formatInline(block.title || 'Video')}" allowfullscreen></iframe>
            </div>
            ${block.caption ? `<div class="component-figcaption">${this.formatInline(block.caption)}</div>` : ''}
          </div>`;

        case 'relatedArticle':
          return `<div class="component-related-article-card">
            <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: var(--color-primary-600); margin-bottom: 4px;">Related Knowledge</div>
            <h4 style="font-size: var(--text-sm); margin: 0;"><a href="${this.escapeHTML(block.url || 'article.html')}" class="component-link">${this.formatInline(block.title || '')}</a></h4>
          </div>`;

        case 'relatedGuide':
          return `<div class="component-related-guide-card">
            <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: var(--color-primary-600); margin-bottom: 4px;">Learning Path Continuation</div>
            <h4 style="font-size: var(--text-base); margin-bottom: 4px;"><a href="${this.escapeHTML(block.url || 'article.html')}" class="component-link">${this.formatInline(block.title || '')}</a></h4>
            <p style="font-size: var(--text-xs); color: var(--color-text-muted); margin: 0;">${this.formatInline(block.description || '')}</p>
          </div>`;

        case 'nextPrevious':
          return `<nav class="component-next-previous" aria-label="Article navigation">
            ${block.previous ? `<a href="${this.escapeHTML(block.previous.url || '#')}" class="nav-prev-link">← ${this.formatInline(block.previous.title)}</a>` : '<div></div>'}
            ${block.next ? `<a href="${this.escapeHTML(block.next.url || '#')}" class="nav-next-link">${this.formatInline(block.next.title)} →</a>` : '<div></div>'}
          </nav>`;

        // --- GROUP 06: CONVERSION (C32 - C36) ---
        case 'resourceBox':
          return `<div class="component-resource-box">
            <span class="badge badge-blue">${this.formatInline(block.label || 'Free Resource')}</span>
            <h4 style="font-size: var(--text-base); font-weight: 800; margin: 6px 0 4px 0;">${this.formatInline(block.title || '')}</h4>
            <p style="font-size: var(--text-xs); color: var(--color-text-muted); margin-bottom: 12px;">${this.formatInline(block.description || '')}</p>
            <a href="${this.escapeHTML(block.url || '#')}" class="btn btn-primary btn-sm">${this.formatInline(block.cta || 'Download Resource')}</a>
          </div>`;

        case 'recommendedTool':
        case 'affiliateRecommendation':
          return `<div class="component-recommended-tool">
            <span class="badge badge-blue">RECOMMENDED TOOL</span>
            <h4 style="font-size: var(--text-lg); font-weight: 800; margin: 6px 0 2px 0;">${this.formatInline(block.tool?.name || '')}</h4>
            <p style="font-size: var(--text-xs); color: var(--color-text-muted); margin-bottom: 8px;">Best for: <strong>${this.formatInline(block.bestFor || 'Small Local Businesses')}</strong></p>
            <p style="font-size: var(--text-sm); line-height: 1.5; margin-bottom: 12px;">${this.formatInline(block.whyRecommended || '')}</p>
            <a href="${this.escapeHTML(block.tool?.url || '#')}" class="btn btn-secondary btn-sm" target="_blank" rel="noopener noreferrer">${this.formatInline(block.cta || 'Learn More →')}</a>
          </div>`;

        case 'affiliateDisclosure':
          return `<div class="component-affiliate-disclosure">
            <strong>Editorial Transparency:</strong> Locatria may receive affiliate compensation from software tools mentioned on this page. We only recommend tools that pass our strict local business operational standards.
          </div>`;

        case 'newsletterCTA':
          return `<div class="component-newsletter-cta">
            <span class="badge badge-blue" style="margin-bottom: 8px;">Weekly Knowledge Briefing</span>
            <h3 style="font-size: var(--text-xl); font-weight: 800; margin-bottom: 4px;">${this.formatInline(block.title || 'Practical AI for Local Businesses')}</h3>
            <p style="font-size: var(--text-xs); color: var(--color-text-muted); margin-bottom: 12px;">${this.formatInline(block.description || 'Get 1 actionable workflow every Tuesday.')}</p>
            <form class="js-newsletter-form" style="max-width: 400px; display: flex; gap: 8px;">
              <input type="email" class="newsletter-input" placeholder="${this.escapeHTML(block.placeholder || 'Enter your email')}" required style="flex: 1; font-size: var(--text-xs);" />
              <button type="submit" class="btn btn-primary btn-sm">${this.formatInline(block.buttonText || 'Subscribe')}</button>
            </form>
          </div>`;

        default:
          return this.renderFallback(block);
      }
    },

    /**
     * Safe Fallback Error Handling for Invalid Component Types
     */
    renderFallback: function (block) {
      console.warn('[Locatria Component System] Unknown or invalid component block:', block);
      return `<div style="padding: 12px; border: 1px dashed var(--color-border-strong); background-color: var(--color-bg-subtle); font-size: 12px; color: var(--color-text-muted); margin-bottom: 16px;">
        [Unsupported Block Type: <code>${this.escapeHTML(block.type || 'unknown')}</code>]
      </div>`;
    },

    slugify: function (str) {
      return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    },

    formatInline: function (str) {
      if (typeof str !== 'string') return str || '';
      
      // If string already contains trusted inline HTML tags like <strong>, <b>, <em>, <i>, <a>, <code>, <br>
      let formatted = str;

      // 1. Convert Markdown bold **text** to <strong>text</strong> if present
      formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

      // 2. Convert Markdown links [label](url) to <a href="url" class="component-link">label</a> if present
      formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="component-link">$1</a>');

      // 3. Sanitize unsafe tags (script, iframe, on* attributes)
      formatted = formatted
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');

      return formatted;
    },

    escapeHTML: function (str) {
      if (typeof str !== 'string') return str;
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    },

    escapeJS: function (str) {
      if (typeof str !== 'string') return str;
      return str
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r');
    }
  };

  window.LocatriaRenderer = LocatriaRenderer;
})(window);
