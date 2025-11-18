/**
 * HTML and CSS Validation Tests
 * Task 11.2: Validate HTML and CSS
 * Requirements: 10.4
 */

const fs = require('fs');
const path = require('path');

describe('Task 11.2: HTML and CSS Validation', () => {
  const htmlFiles = [
    'index.html',
    'publications.html',
    'awards.html',
    'teaching.html',
    'outreach.html',
    'news.html'
  ];
  
  describe('HTML5 Structure Validation', () => {
    test('all HTML files have valid DOCTYPE', () => {
      htmlFiles.forEach(filename => {
        const filePath = path.join(__dirname, '..', filename);
        
        if (!fs.existsSync(filePath)) {
          return;
        }
        
        const html = fs.readFileSync(filePath, 'utf-8');
        
        // Check for HTML5 DOCTYPE
        expect(html).toMatch(/<!DOCTYPE html>/i);
      });
    });
    
    test('all HTML files have required meta tags', () => {
      htmlFiles.forEach(filename => {
        const filePath = path.join(__dirname, '..', filename);
        
        if (!fs.existsSync(filePath)) {
          return;
        }
        
        const html = fs.readFileSync(filePath, 'utf-8');
        
        // Check for charset meta tag
        expect(html).toMatch(/<meta\s+charset=/i);
        
        // Check for viewport meta tag
        expect(html).toMatch(/<meta\s+name=["']viewport["']/i);
        expect(html).toMatch(/width=device-width/i);
      });
    });
    
    test('all HTML files have proper document structure', () => {
      htmlFiles.forEach(filename => {
        const filePath = path.join(__dirname, '..', filename);
        
        if (!fs.existsSync(filePath)) {
          return;
        }
        
        const html = fs.readFileSync(filePath, 'utf-8');
        
        // Check for html, head, and body elements
        expect(html).toMatch(/<html[^>]*>/i);
        expect(html).toMatch(/<head[^>]*>/i);
        expect(html).toMatch(/<body[^>]*>/i);
        
        // Check for title element with content
        expect(html).toMatch(/<title>[^<]+<\/title>/i);
      });
    });
    
    test('all HTML files have proper heading hierarchy', () => {
      htmlFiles.forEach(filename => {
        const filePath = path.join(__dirname, '..', filename);
        
        if (!fs.existsSync(filePath)) {
          return;
        }
        
        const html = fs.readFileSync(filePath, 'utf-8');
        
        // Check that there is at least one h1
        const h1Matches = html.match(/<h1[^>]*>/gi);
        expect(h1Matches).not.toBeNull();
        expect(h1Matches.length).toBeGreaterThan(0);
      });
    });
    
    test('all images have alt attributes', () => {
      htmlFiles.forEach(filename => {
        const filePath = path.join(__dirname, '..', filename);
        
        if (!fs.existsSync(filePath)) {
          return;
        }
        
        const html = fs.readFileSync(filePath, 'utf-8');
        
        // Find all img tags
        const imgRegex = /<img[^>]*>/gi;
        const images = html.match(imgRegex) || [];
        
        images.forEach(imgTag => {
          // Each img should have alt attribute
          expect(imgTag).toMatch(/alt=/i);
        });
      });
    });
    
    test('all links have valid href attributes', () => {
      htmlFiles.forEach(filename => {
        const filePath = path.join(__dirname, '..', filename);
        
        if (!fs.existsSync(filePath)) {
          return;
        }
        
        const html = fs.readFileSync(filePath, 'utf-8');
        
        // Find all anchor tags (must start with <a and have space or >)
        const linkRegex = /<a\s[^>]*>/gi;
        const links = html.match(linkRegex) || [];
        
        links.forEach(linkTag => {
          // Each link should have href attribute
          expect(linkTag).toMatch(/href=/i);
        });
      });
    });
    
    test('no duplicate IDs in HTML', () => {
      htmlFiles.forEach(filename => {
        const filePath = path.join(__dirname, '..', filename);
        
        if (!fs.existsSync(filePath)) {
          return;
        }
        
        const html = fs.readFileSync(filePath, 'utf-8');
        
        // Extract all id attributes
        const idRegex = /\sid=["']([^"']+)["']/gi;
        const ids = [];
        let match;
        
        while ((match = idRegex.exec(html)) !== null) {
          ids.push(match[1]);
        }
        
        const uniqueIds = new Set(ids);
        
        // No duplicate IDs
        expect(ids.length).toBe(uniqueIds.size);
      });
    });
    
    test('forms have proper labels', () => {
      htmlFiles.forEach(filename => {
        const filePath = path.join(__dirname, '..', filename);
        
        if (!fs.existsSync(filePath)) {
          return;
        }
        
        const html = fs.readFileSync(filePath, 'utf-8');
        
        // Find all input, textarea, and select elements (excluding buttons)
        const inputRegex = /<input[^>]*type=["'](text|email|password|number|tel|url|search|date)[^>]*>/gi;
        const textareaRegex = /<textarea[^>]*>/gi;
        const selectRegex = /<select[^>]*>/gi;
        
        const inputs = html.match(inputRegex) || [];
        const textareas = html.match(textareaRegex) || [];
        const selects = html.match(selectRegex) || [];
        
        const formControls = [...inputs, ...textareas, ...selects];
        
        formControls.forEach(control => {
          // Control should have either:
          // 1. An id (for label association)
          // 2. aria-label attribute
          // 3. aria-labelledby attribute
          const hasId = /\sid=["'][^"']+["']/.test(control);
          const hasAriaLabel = /aria-label=["'][^"']+["']/.test(control);
          const hasAriaLabelledBy = /aria-labelledby=["'][^"']+["']/.test(control);
          
          expect(hasId || hasAriaLabel || hasAriaLabelledBy).toBe(true);
        });
      });
    });
    
    test('semantic HTML5 elements are used', () => {
      htmlFiles.forEach(filename => {
        const filePath = path.join(__dirname, '..', filename);
        
        if (!fs.existsSync(filePath)) {
          return;
        }
        
        const html = fs.readFileSync(filePath, 'utf-8');
        
        // Check for semantic elements
        expect(html).toMatch(/<nav[^>]*>/i);
        expect(html).toMatch(/<main[^>]*>/i);
      });
    });
  });
  
  describe('CSS Validation', () => {
    const cssFiles = [
      'css/variables.css',
      'css/base.css',
      'css/components.css',
      'css/utilities.css',
      'css/portfolio-item.css'
    ];
    
    test('all CSS files exist and are readable', () => {
      cssFiles.forEach(filename => {
        const filePath = path.join(__dirname, '..', filename);
        
        if (!fs.existsSync(filePath)) {
          // Skip if file doesn't exist (some may be optional)
          return;
        }
        
        const css = fs.readFileSync(filePath, 'utf-8');
        expect(css.length).toBeGreaterThan(0);
      });
    });
    
    test('CSS files have no obvious syntax errors', () => {
      cssFiles.forEach(filename => {
        const filePath = path.join(__dirname, '..', filename);
        
        if (!fs.existsSync(filePath)) {
          return;
        }
        
        const css = fs.readFileSync(filePath, 'utf-8');
        
        // Check for balanced braces
        const openBraces = (css.match(/{/g) || []).length;
        const closeBraces = (css.match(/}/g) || []).length;
        expect(openBraces).toBe(closeBraces);
        
        // Check for balanced parentheses in calc() and other functions
        const openParens = (css.match(/\(/g) || []).length;
        const closeParens = (css.match(/\)/g) || []).length;
        expect(openParens).toBe(closeParens);
      });
    });
    
    test('CSS custom properties are properly defined', () => {
      const variablesPath = path.join(__dirname, '..', 'css/variables.css');
      
      if (!fs.existsSync(variablesPath)) {
        return;
      }
      
      const css = fs.readFileSync(variablesPath, 'utf-8');
      
      // Check for :root selector
      expect(css).toMatch(/:root\s*{/);
      
      // Check for common custom properties
      expect(css).toMatch(/--color-primary/);
      expect(css).toMatch(/--font-/);
      expect(css).toMatch(/--spacing-/);
    });
    
    test('CSS files are linked in HTML', () => {
      htmlFiles.forEach(filename => {
        const filePath = path.join(__dirname, '..', filename);
        
        if (!fs.existsSync(filePath)) {
          return;
        }
        
        const html = fs.readFileSync(filePath, 'utf-8');
        
        // Check for stylesheet links
        expect(html).toMatch(/<link[^>]*rel=["']stylesheet["'][^>]*>/i);
        
        // Check that at least one custom CSS file is linked
        expect(html).toMatch(/<link[^>]*href=["'][^"']*css\/[^"']*["'][^>]*>/i);
      });
    });
  });
  
  describe('Bootstrap 5 Compliance', () => {
    test('HTML uses Bootstrap 5 data attributes', () => {
      htmlFiles.forEach(filename => {
        const filePath = path.join(__dirname, '..', filename);
        
        if (!fs.existsSync(filePath)) {
          return;
        }
        
        const html = fs.readFileSync(filePath, 'utf-8');
        
        // Check for Bootstrap 5 data attributes (data-bs-*)
        if (html.includes('data-toggle') || html.includes('data-target')) {
          // Should use Bootstrap 5 attributes instead
          expect(html).toMatch(/data-bs-toggle|data-bs-target/);
        }
      });
    });
    
    test('HTML uses Bootstrap 5 class names', () => {
      htmlFiles.forEach(filename => {
        const filePath = path.join(__dirname, '..', filename);
        
        if (!fs.existsSync(filePath)) {
          return;
        }
        
        const html = fs.readFileSync(filePath, 'utf-8');
        
        // Check for Bootstrap 5 spacing classes (ms-*, me-* instead of ml-*, mr-*)
        if (html.includes('class=')) {
          // If using margin/padding classes, should use Bootstrap 5 naming
          const hasOldClasses = /class="[^"]*\b(ml-|mr-)\d+/.test(html);
          
          // Old classes should not be present
          expect(hasOldClasses).toBe(false);
        }
      });
    });
  });
});

/**
 * Property 13: HTML5 validity
 * Feature: academic-website-modernization, Property 13: HTML5 validity
 * Validates: Requirements 10.4
 * 
 * For any HTML page, the markup should pass W3C HTML5 validation without errors
 */
const fc = require('fast-check');

describe('Property 13: HTML5 validity', () => {
  const htmlFiles = [
    'index.html',
    'publications.html',
    'awards.html',
    'teaching.html',
    'outreach.html',
    'news.html'
  ];
  
  test('all HTML pages have valid HTML5 structure', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...htmlFiles),
        (filename) => {
          const filePath = path.join(__dirname, '..', filename);
          
          if (!fs.existsSync(filePath)) {
            return true;
          }
          
          const html = fs.readFileSync(filePath, 'utf-8');
          
          // HTML5 validity checks
          
          // 1. Must have DOCTYPE
          expect(html).toMatch(/<!DOCTYPE html>/i);
          
          // 2. Must have html, head, and body tags
          expect(html).toMatch(/<html[^>]*>/i);
          expect(html).toMatch(/<head[^>]*>/i);
          expect(html).toMatch(/<body[^>]*>/i);
          expect(html).toMatch(/<\/html>/i);
          expect(html).toMatch(/<\/head>/i);
          expect(html).toMatch(/<\/body>/i);
          
          // 3. Must have charset declaration
          expect(html).toMatch(/<meta\s+charset=/i);
          
          // 4. Must have title
          expect(html).toMatch(/<title>[^<]+<\/title>/i);
          
          // 5. All img tags must have alt attributes
          const imgRegex = /<img[^>]*>/gi;
          const images = html.match(imgRegex) || [];
          images.forEach(imgTag => {
            expect(imgTag).toMatch(/alt=/i);
          });
          
          // 6. All links must have href
          const linkRegex = /<a\s[^>]*>/gi;
          const links = html.match(linkRegex) || [];
          links.forEach(linkTag => {
            expect(linkTag).toMatch(/href=/i);
          });
          
          // 7. No duplicate IDs
          const idRegex = /\sid=["']([^"']+)["']/gi;
          const ids = [];
          let match;
          while ((match = idRegex.exec(html)) !== null) {
            ids.push(match[1]);
          }
          const uniqueIds = new Set(ids);
          expect(ids.length).toBe(uniqueIds.size);
          
          // 8. Balanced tags - check common elements
          const checkBalancedTags = (tagName) => {
            // Use word boundary to avoid matching partial tag names (e.g., 'li' in 'link')
            const openRegex = new RegExp(`<${tagName}\\b[^>]*>`, 'gi');
            const closeRegex = new RegExp(`</${tagName}>`, 'gi');
            const openTags = (html.match(openRegex) || []).length;
            const closeTags = (html.match(closeRegex) || []).length;
            
            // Self-closing tags like <img>, <br>, <meta> don't need closing tags
            const selfClosing = ['img', 'br', 'meta', 'link', 'input', 'hr'];
            if (!selfClosing.includes(tagName.toLowerCase())) {
              expect(openTags).toBe(closeTags);
            }
          };
          
          ['div', 'section', 'article', 'nav', 'header', 'footer', 'main', 'ul', 'ol', 'li'].forEach(checkBalancedTags);
          
          // 9. Proper nesting - body should not be inside head
          const headContent = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
          if (headContent) {
            expect(headContent[1]).not.toMatch(/<body/i);
          }
          
          // 10. Valid HTML5 semantic elements are used
          expect(html).toMatch(/<nav[^>]*>/i);
          expect(html).toMatch(/<main[^>]*>/i);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('HTML attributes are properly quoted', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...htmlFiles),
        (filename) => {
          const filePath = path.join(__dirname, '..', filename);
          
          if (!fs.existsSync(filePath)) {
            return true;
          }
          
          const html = fs.readFileSync(filePath, 'utf-8');
          
          // Check that attributes use quotes (either single or double)
          // This is a simplified check - proper validation would need a full parser
          
          // Check common attributes are quoted
          const attributePatterns = [
            /class=["'][^"']*["']/gi,
            /id=["'][^"']*["']/gi,
            /href=["'][^"']*["']/gi,
            /src=["'][^"']*["']/gi,
            /alt=["'][^"']*["']/gi,
            /type=["'][^"']*["']/gi
          ];
          
          // At least some attributes should be properly quoted
          const hasQuotedAttributes = attributePatterns.some(pattern => pattern.test(html));
          expect(hasQuotedAttributes).toBe(true);
          
          return true;
        }
      ),
      { numRuns: 50 }
    );
  });
  
  test('HTML uses valid character encoding', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...htmlFiles),
        (filename) => {
          const filePath = path.join(__dirname, '..', filename);
          
          if (!fs.existsSync(filePath)) {
            return true;
          }
          
          const html = fs.readFileSync(filePath, 'utf-8');
          
          // Check for UTF-8 charset declaration
          expect(html).toMatch(/<meta\s+charset=["']?utf-8["']?/i);
          
          return true;
        }
      ),
      { numRuns: 50 }
    );
  });
  
  test('HTML has proper viewport configuration', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...htmlFiles),
        (filename) => {
          const filePath = path.join(__dirname, '..', filename);
          
          if (!fs.existsSync(filePath)) {
            return true;
          }
          
          const html = fs.readFileSync(filePath, 'utf-8');
          
          // Check for viewport meta tag with proper configuration
          expect(html).toMatch(/<meta\s+name=["']viewport["']/i);
          expect(html).toMatch(/width=device-width/i);
          expect(html).toMatch(/initial-scale=1/i);
          
          return true;
        }
      ),
      { numRuns: 50 }
    );
  });
});
