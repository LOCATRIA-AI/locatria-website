# LOCATRIA Project Guidelines & Operating Rules

## Content Publication & Timestamp Invariant
Whenever creating, publishing, or modifying content (articles, guides, workflows, checklists, or resources) on LOCATRIA:

1. **Authentic First-Publication Timestamps**:
   - Always use the actual real date when the article was first published to the website (`Published [First Web Date]`).
   - Never assign artificial sequential dates (e.g. Day 1, Day 2, Day 3) across article batches.
   - Only add `Updated [Date]` when an article is genuinely edited or refreshed after its initial publication.

2. **Full Five-Layer Synchronization**:
   Every content update must synchronize all five layers consistently:
   - **Layer 1 (UI Article Presentation)**: The header badge must uniformly use `<div class="meta-item"><span>Published: <strong>[Month Day, Year]</strong></span></div>` (and only append `<div class="meta-item"><span>Updated: <strong>[Month Day, Year]</strong></span></div>` if genuinely edited post-publication).
   - **Layer 2 (SEO & Structured Data)**: The Schema.org JSON-LD graph (`TechArticle` / `Article`) containing `"datePublished"` in ISO 8601 UTC (`YYYY-MM-DDTHH:mm:ssZ`), with `"dateModified"` equal to `"datePublished"` unless genuinely revised.
   - **Layer 3 (Content Source of Truth)**: The corresponding `content/<slug>.json` metadata fields (`publishedAt`, `lastUpdated`, and `updatedAt: null` if unrevised).
   - **Layer 4 (Hubs & Index Cards)**: Featured cards and article listings in `index.html`, `knowledge.html`, and `category.html` (e.g. `<div>Published [Month Year]</div>`).
   - **Layer 5 (Client Datasets & Dynamic Renderers)**: The `pubDate` (and optional `updatedDate`) in `js/published-articles-db.js`, dynamically rendered on category and listing cards via `js/category-renderer.js` (`[readTime] • Published [MMM YYYY]`, and only `Updated [MMM YYYY]` if `updatedDate` exists).
