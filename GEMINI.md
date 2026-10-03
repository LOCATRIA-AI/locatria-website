# LOCATRIA Project Guidelines & Operating Rules

## Content Publication & Timestamp Invariant
Whenever creating, publishing, or modifying content (articles, guides, workflows, checklists, or resources) on LOCATRIA:

1. **Accurate Real-Time Timestamps**:
   - Always use the actual current system timestamp at the moment of execution.
   - Never use placeholder dates, arbitrary future dates, or bulk identical dates from previous templates.

2. **Full Five-Layer Synchronization**:
   Every content update must synchronize all five layers consistently:
   - **Layer 1 (UI Presentation)**: The `<div class="meta-item"><span>Updated [Month Day, Year]</span></div>` badge in the article header.
   - **Layer 2 (SEO & Structured Data)**: The Schema.org JSON-LD graph (`TechArticle` / `Article`) containing `"datePublished"` and `"dateModified"` in ISO 8601 UTC (`YYYY-MM-DDTHH:mm:ssZ`).
   - **Layer 3 (Content Source of Truth)**: The corresponding `content/<slug>.json` metadata fields (`publishedAt`, `updatedAt`, `lastUpdated`).
   - **Layer 4 (Hubs & Index Cards)**: Static featured cards and article listings in `index.html`, `knowledge.html`, and `category.html` (e.g. `<div>Updated [Month Year]</div>`).
   - **Layer 5 (Client Datasets & Dynamic Renderers)**: The `pubDate` field in `js/published-articles-db.js`, dynamically rendered on category and listing cards via `js/category-renderer.js` (`formatShortDate`, `formatMonthYear`) with zero hardcoded months.
