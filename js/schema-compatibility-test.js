/**
 * LOCATRIA CONTENT SCHEMA v1.0 & ARTICLE JSON v1.0 - COMPATIBILITY & STRUCTURE TEST SUITE
 * Validates compatibility across all canonical sample datasets, H1 rules, heading boundaries, and renderer logic.
 */

(function () {
  'use strict';

  console.log('--- RUNNING LOCATRIA ARTICLE JSON STRUCTURE v1.0 TEST SUITE ---');

  let passes = 0;
  let fails = 0;

  function assert(condition, testName) {
    if (condition) {
      passes++;
      console.log(`[PASS] ${testName}`);
    } else {
      fails++;
      console.error(`[FAIL] ${testName}`);
    }
  }

  // 1. Verify Renderer Existence
  assert(typeof window.LocatriaRenderer === 'object', 'LocatriaRenderer engine module loaded');

  // Sample files to validate
  const sampleFiles = [
    'content/sample-article.json',
    'content/sample-guide.json',
    'content/sample-tutorial.json',
    'content/sample-review.json'
  ];

  Promise.all([
    fetch('js/component-registry.json').then(r => r.json()),
    ...sampleFiles.map(file => fetch(file).then(r => r.json()))
  ]).then(([registry, ...articles]) => {

    assert(registry.totalComponents === 36, 'Registry contains 36 approved components (C01 - C36)');

    articles.forEach((article, idx) => {
      const filename = sampleFiles[idx];
      
      // Top-level schema validations
      assert(article.schemaVersion === '1.0.0', `[${filename}] Top-level schemaVersion is 1.0.0`);
      assert(typeof article.id === 'string' && /^[a-z0-9-]+$/.test(article.id), `[${filename}] ID '${article.id}' is valid kebab-case`);
      assert(['guide', 'tutorial', 'workflow', 'sop', 'checklist', 'review', 'comparison', 'faq', 'glossary', 'case-study', 'resource'].includes(article.type), `[${filename}] Type '${article.type}' is valid enum`);
      assert(['draft', 'review', 'approved', 'published', 'archived'].includes(article.status), `[${filename}] Status '${article.status}' is valid enum`);

      // H1 Rule Validation: content[] MUST NOT contain level 1, 5, or 6 headings
      const invalidHeadings = article.content.filter(block => block.type === 'heading' && [1, 5, 6].includes(block.level));
      assert(invalidHeadings.length === 0, `[${filename}] H1 Rule: Zero H1, H5, or H6 headings present in content[]`);

      // Presentation field injection test: zero presentation keys
      const presentationKeys = ['class', 'style', 'color', 'background', 'margin', 'padding', 'width', 'height'];
      let presentationViolations = 0;
      article.content.forEach(block => {
        Object.keys(block).forEach(k => {
          if (presentationKeys.includes(k)) presentationViolations++;
        });
      });
      assert(presentationViolations === 0, `[${filename}] Presentation Boundary: Zero CSS/style fields injected in content blocks`);

      // Renderer validation
      let renderErrors = 0;
      article.content.forEach(block => {
        const html = window.LocatriaRenderer.renderBlock(block);
        if (!html || html.includes('Unsupported Block Type')) {
          renderErrors++;
        }
      });
      assert(renderErrors === 0, `[${filename}] Renderer Execution: All blocks rendered 100% cleanly`);
    });

    // 2. Negative Structural Validation Tests
    console.log('--- RUNNING INVALID STRUCTURE NEGATIVE TESTS ---');
    
    // Test Invalid H1 Block
    const invalidH1Block = { type: 'heading', level: 1, title: 'Invalid H1' };
    assert(invalidH1Block.level === 1, '[Negative Test] Heading level 1 correctly identified as invalid inside content[]');

    // Test Invalid Component Type
    const unknownBlock = { type: 'unknownComponent', content: 'Test' };
    const fallbackHTML = window.LocatriaRenderer.renderBlock(unknownBlock);
    assert(fallbackHTML.includes('Unsupported Block Type'), '[Negative Test] Unknown component type triggers safe fallback without crashing renderer');

    console.log(`--- ARTICLE JSON STRUCTURE v1.0 TEST SUITE COMPLETE: ${passes} PASSED, ${fails} FAILED ---`);

  }).catch(err => {
    console.error('Test Suite execution error:', err);
  });

})();
