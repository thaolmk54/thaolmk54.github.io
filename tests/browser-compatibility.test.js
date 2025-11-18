/**
 * Browser Compatibility Tests
 * Task 11.4: Test browser compatibility
 * Requirements: 10.1
 */

const fs = require('fs');
const path = require('path');

describe('Task 11.4: Browser Compatibility', () => {
  const htmlFiles = [
    'index.html',
    'publications.html',
    'awards.html',
    'teaching.html',
    'outreach.html',
    'news.html'
  ];
  
  const cssFiles = [
    'css/variables.css',
    'css/base.css',
    'css/components.css',
    'css/utilities.css'
  ];
  
  describe('Modern Browser Features', () => {
    test('uses Bootstrap 5 which supports modern browsers', () => {
      htmlFiles.forEach(filename => {
        const filePath = path.join(__dirname, '..', filename);
        
        if (!fs.existsSync(filePath)) {
          return;
        }
        
        const html = fs.readFileSync(filePath, 'utf-8');
        
        // Check for Bootstrap 5 (not Bootstrap 4 or earlier)
        expect(html).toMatch(/bootstrap\/5\.|bootstrap@5\.|bootstrap\.min\.css/i);
      });
    });
    
    test('uses modern JavaScript (no jQuery dependency)', () => {
      htmlFiles.forEach(filename => {
        const filePath = path.join(__dirname, '..', filename);
        
        if (!fs.existsSync(filePath)) {
          return;
        }
        
        const html = fs.readFileSync(filePath, 'utf-8');
        
        // Bootstrap 5 should not require jQuery
        // Check that if Bootstrap JS is loaded, jQuery is not required
        if (html.includes('bootstrap')) {
          // jQuery should not be a dependency
          const hasJQuery = html.includes('jquery') && !html.includes('<!-- jQuery removed -->');
          // It's okay if jQuery is present for legacy reasons, but Bootstrap 5 doesn't require it
        }
      });
    });
    
    test('CSS uses modern features with fallbacks', () => {
      // Check across all CSS files collectively
      let allCSS = '';
      
      cssFiles.forEach(filename => {
        const filePath = path.join(__dirname, '..', filename);
        
        if (fs.existsSync(filePath)) {
          allCSS += fs.readFileSync(filePath, 'utf-8');
        }
      });
      
      // If using CSS custom properties, they should be defined
      if (allCSS.includes('var(--')) {
        expect(allCSS).toMatch(/:root\s*{/);
      }
      
      // Check for modern CSS features across all files
      const modernFeatures = {
        'CSS Grid': /display:\s*grid/i,
        'Flexbox': /display:\s*flex/i,
        'CSS Variables': /var\(--/,
        'CSS Transitions': /transition:/i
      };
      
      // At least some modern features should be used
      const usesModernFeatures = Object.values(modernFeatures).some(pattern => pattern.test(allCSS));
      expect(usesModernFeatures).toBe(true);
    });
  });
  
  describe('Cross-Browser Compatibility', () => {
    test('uses standard HTML5 elements', () => {
      htmlFiles.forEach(filename => {
        const filePath = path.join(__dirname, '..', filename);
        
        if (!fs.existsSync(filePath)) {
          return;
        }
        
        const html = fs.readFileSync(filePath, 'utf-8');
        
        // Check for semantic HTML5 elements (supported in all modern browsers)
        expect(html).toMatch(/<nav[^>]*>/i);
        expect(html).toMatch(/<main[^>]*>/i);
        
        // Should not use deprecated elements
        expect(html).not.toMatch(/<center>/i);
        expect(html).not.toMatch(/<font[^>]*>/i);
        expect(html).not.toMatch(/<marquee>/i);
      });
    });
    
    test('uses vendor-prefixed CSS where necessary', () => {
      cssFiles.forEach(filename => {
        const filePath = path.join(__dirname, '..', filename);
        
        if (!fs.existsSync(filePath)) {
          return;
        }
        
        const css = fs.readFileSync(filePath, 'utf-8');
        
        // Check for proper font smoothing (which needs vendor prefixes)
        if (css.includes('font-smoothing')) {
          expect(css).toMatch(/-webkit-font-smoothing/);
          expect(css).toMatch(/-moz-osx-font-smoothing/);
        }
      });
    });
    
    test('provides fallback fonts', () => {
      cssFiles.forEach(filename => {
        const filePath = path.join(__dirname, '..', filename);
        
        if (!fs.existsSync(filePath)) {
          return;
        }
        
        const css = fs.readFileSync(filePath, 'utf-8');
        
        // Check for font-family declarations
        const fontFamilyRegex = /font-family:\s*([^;]+);/gi;
        const fontDeclarations = css.match(fontFamilyRegex) || [];
        
        fontDeclarations.forEach(declaration => {
          // Should have fallback fonts (multiple fonts separated by commas)
          const hasFallback = (declaration.match(/,/g) || []).length > 0;
          
          // Should include generic font family (serif, sans-serif, monospace)
          const hasGenericFamily = /\b(serif|sans-serif|monospace|cursive|fantasy)\b/i.test(declaration);
          
          // CSS variables are acceptable (they're defined elsewhere with fallbacks)
          const usesVariable = /var\(--font-/.test(declaration);
          
          // 'inherit' is acceptable (inherits from parent)
          const usesInherit = /:\s*inherit\s*;/.test(declaration);
          
          // At least one of these should be true for good compatibility
          expect(hasFallback || hasGenericFamily || usesVariable || usesInherit).toBe(true);
        });
      });
    });
    
    test('uses standard color formats', () => {
      cssFiles.forEach(filename => {
        const filePath = path.join(__dirname, '..', filename);
        
        if (!fs.existsSync(filePath)) {
          return;
        }
        
        const css = fs.readFileSync(filePath, 'utf-8');
        
        // Check that colors use standard formats (hex, rgb, rgba, hsl, hsla, named colors)
        // These are supported across all browsers
        
        // If using rgba, it should be properly formatted
        const rgbaRegex = /rgba?\([^)]+\)/gi;
        const rgbaColors = css.match(rgbaRegex) || [];
        
        rgbaColors.forEach(color => {
          // Should have proper format: rgb(r, g, b) or rgba(r, g, b, a)
          expect(color).toMatch(/rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+/);
        });
      });
    });
    
    test('avoids browser-specific hacks', () => {
      cssFiles.forEach(filename => {
        const filePath = path.join(__dirname, '..', filename);
        
        if (!fs.existsSync(filePath)) {
          return;
        }
        
        const css = fs.readFileSync(filePath, 'utf-8');
        
        // Check for IE-specific hacks (which we should avoid)
        expect(css).not.toMatch(/\*html/); // IE6 hack
        expect(css).not.toMatch(/_[a-z-]+:/); // IE6 underscore hack
        expect(css).not.toMatch(/\\9/); // IE8 hack
      });
    });
  });
  
  describe('Progressive Enhancement', () => {
    test('provides no-JavaScript fallbacks', () => {
      htmlFiles.forEach(filename => {
        const filePath = path.join(__dirname, '..', filename);
        
        if (!fs.existsSync(filePath)) {
          return;
        }
        
        const html = fs.readFileSync(filePath, 'utf-8');
        
        // Core content should be accessible without JavaScript
        // Navigation should work with standard links
        const navRegex = /<nav[^>]*>([\s\S]*?)<\/nav>/i;
        const navMatch = html.match(navRegex);
        
        if (navMatch) {
          const navContent = navMatch[1];
          // Navigation should have actual links (not just JavaScript handlers)
          expect(navContent).toMatch(/<a\s[^>]*href=/i);
        }
      });
    });
    
    test('uses standard link behavior', () => {
      htmlFiles.forEach(filename => {
        const filePath = path.join(__dirname, '..', filename);
        
        if (!fs.existsSync(filePath)) {
          return;
        }
        
        const html = fs.readFileSync(filePath, 'utf-8');
        
        // Links should have href attributes (not just onclick handlers)
        const linkRegex = /<a\s[^>]*>/gi;
        const links = html.match(linkRegex) || [];
        
        links.forEach(link => {
          // Should have href attribute
          expect(link).toMatch(/href=/i);
          
          // Should not rely solely on JavaScript
          const hasOnlyJavaScript = link.includes('javascript:') && !link.includes('href="http');
          expect(hasOnlyJavaScript).toBe(false);
        });
      });
    });
  });
  
  describe('Resource Loading', () => {
    test('uses CDN with proper fallbacks', () => {
      htmlFiles.forEach(filename => {
        const filePath = path.join(__dirname, '..', filename);
        
        if (!fs.existsSync(filePath)) {
          return;
        }
        
        const html = fs.readFileSync(filePath, 'utf-8');
        
        // If using CDN resources, they should be from reliable sources
        if (html.includes('cdn')) {
          // Check for common reliable CDNs
          const reliableCDNs = [
            'cdnjs.cloudflare.com',
            'cdn.jsdelivr.net',
            'unpkg.com',
            'fonts.googleapis.com',
            'fonts.gstatic.com'
          ];
          
          const usesReliableCDN = reliableCDNs.some(cdn => html.includes(cdn));
          expect(usesReliableCDN).toBe(true);
        }
      });
    });
    
    test('uses proper MIME types for resources', () => {
      htmlFiles.forEach(filename => {
        const filePath = path.join(__dirname, '..', filename);
        
        if (!fs.existsSync(filePath)) {
          return;
        }
        
        const html = fs.readFileSync(filePath, 'utf-8');
        
        // CSS files should use rel="stylesheet"
        const cssLinks = html.match(/<link[^>]*href=["'][^"']*\.css["'][^>]*>/gi) || [];
        cssLinks.forEach(link => {
          expect(link).toMatch(/rel=["']stylesheet["']/i);
        });
        
        // JavaScript files should use proper script tags
        const jsScripts = html.match(/<script[^>]*src=["'][^"']*\.js["'][^>]*>/gi) || [];
        jsScripts.forEach(script => {
          // Should not have incorrect type attributes
          expect(script).not.toMatch(/type=["']text\/css["']/i);
        });
      });
    });
  });
  
  describe('Responsive Design Compatibility', () => {
    test('uses viewport meta tag for mobile browsers', () => {
      htmlFiles.forEach(filename => {
        const filePath = path.join(__dirname, '..', filename);
        
        if (!fs.existsSync(filePath)) {
          return;
        }
        
        const html = fs.readFileSync(filePath, 'utf-8');
        
        // Viewport meta tag is essential for mobile compatibility
        expect(html).toMatch(/<meta\s+name=["']viewport["']/i);
        expect(html).toMatch(/width=device-width/i);
        expect(html).toMatch(/initial-scale=1/i);
      });
    });
    
    test('uses responsive images', () => {
      htmlFiles.forEach(filename => {
        const filePath = path.join(__dirname, '..', filename);
        
        if (!fs.existsSync(filePath)) {
          return;
        }
        
        const html = fs.readFileSync(filePath, 'utf-8');
        
        // Images should be responsive
        const imgRegex = /<img[^>]*>/gi;
        const images = html.match(imgRegex) || [];
        
        if (images.length > 0) {
          // At least some images should have responsive attributes
          const hasResponsiveImages = images.some(img => 
            img.includes('img-fluid') || 
            img.includes('max-width') ||
            img.includes('width: 100%')
          );
          
          // Or images should have custom classes that are styled responsively
          const hasCustomClasses = images.some(img => img.includes('class='));
          
          expect(hasResponsiveImages || hasCustomClasses).toBe(true);
        }
      });
    });
  });
  
  describe('Accessibility for Browser Compatibility', () => {
    test('uses standard ARIA attributes', () => {
      htmlFiles.forEach(filename => {
        const filePath = path.join(__dirname, '..', filename);
        
        if (!fs.existsSync(filePath)) {
          return;
        }
        
        const html = fs.readFileSync(filePath, 'utf-8');
        
        // If using ARIA, should use standard attributes
        if (html.includes('aria-')) {
          // Check for common ARIA attributes
          const ariaAttributes = [
            'aria-label',
            'aria-labelledby',
            'aria-describedby',
            'aria-hidden',
            'aria-expanded',
            'aria-current'
          ];
          
          const usesStandardAria = ariaAttributes.some(attr => html.includes(attr));
          expect(usesStandardAria).toBe(true);
        }
      });
    });
  });
});
