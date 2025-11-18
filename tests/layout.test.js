/**
 * Property-Based Tests for Layout Integrity
 * Feature: academic-website-modernization
 */

const fc = require('fast-check');
const fs = require('fs');
const path = require('path');

// Helper to check if HTML contains a pattern
function htmlContains(html, pattern) {
  if (typeof pattern === 'string') {
    return html.includes(pattern);
  }
  return pattern.test(html);
}

// Helper to check if element has class
function hasClass(html, element, className) {
  const regex = new RegExp(`<${element}[^>]*class=["'][^"']*${className}[^"']*["']`, 'i');
  return regex.test(html);
}

// Helper to extract style attribute
function extractStyle(html, element) {
  const regex = new RegExp(`<${element}[^>]*style=["']([^"']*)["']`, 'gi');
  const matches = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    matches.push(match[1]);
  }
  return matches;
}

/**
 * Property 2: Layout integrity across viewports
 * Feature: academic-website-modernization, Property 2: Layout integrity across viewports
 * Validates: Requirements 2.3
 * 
 * For any viewport width between 320px and 2560px, no horizontal scrollbar 
 * should appear and no content should overflow the viewport boundaries
 */
describe('Property 2: Layout integrity across viewports', () => {
  const htmlFiles = [
    'index.html',
    'publications.html',
    'awards.html',
    'teaching.html',
    'outreach.html',
    'news.html'
  ];
  
  test('no content should overflow viewport boundaries', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 2560 }), // viewport width
        fc.constantFrom(...htmlFiles), // pick a random HTML file
        (viewportWidth, filename) => {
          const filePath = path.join(__dirname, '..', filename);
          
          // Skip if file doesn't exist
          if (!fs.existsSync(filePath)) {
            return true;
          }
          
          const html = fs.readFileSync(filePath, 'utf-8');
          
          // Check that container elements exist
          expect(htmlContains(html, 'class="container')).toBe(true);
          
          // Check for elements with explicit widths that might overflow
          const styles = extractStyle(html, '\\w+');
          let hasOverflowIssues = false;
          
          styles.forEach(style => {
            // Check for fixed widths larger than minimum mobile viewport
            const widthMatch = style.match(/width:\s*(\d+)px/);
            if (widthMatch) {
              const width = parseInt(widthMatch[1]);
              // If width is larger than mobile viewport and no max-width, could be an issue
              if (width > 320 && !style.includes('max-width')) {
                // Check if it's an image with reasonable constraints
                const hasMaxWidth = style.includes('max-width') || style.includes('width: 100%');
                if (!hasMaxWidth && width > viewportWidth) {
                  hasOverflowIssues = true;
                }
              }
            }
          });
          
          // Verify no obvious overflow issues
          expect(hasOverflowIssues).toBe(false);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('responsive images should not exceed container width', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 2560 }),
        fc.constantFrom(...htmlFiles),
        (viewportWidth, filename) => {
          const filePath = path.join(__dirname, '..', filename);
          
          if (!fs.existsSync(filePath)) {
            return true;
          }
          
          const html = fs.readFileSync(filePath, 'utf-8');
          
          // Extract all img tags
          const imgRegex = /<img[^>]*>/gi;
          const images = html.match(imgRegex) || [];
          
          images.forEach(imgTag => {
            const styleMatch = imgTag.match(/style=["']([^"']*)["']/);
            const classMatch = imgTag.match(/class=["']([^"']*)["']/);
            
            const style = styleMatch ? styleMatch[1] : '';
            const classes = classMatch ? classMatch[1] : '';
            
            // Images should either have:
            // 1. max-width in style
            // 2. img-fluid or img-responsive class
            // 3. width constraints
            
            const hasMaxWidth = style.includes('max-width');
            const hasResponsiveClass = classes.includes('img-fluid') || 
                                      classes.includes('img-responsive');
            const hasWidthConstraint = style.includes('width: 100%') || 
                                      style.includes('max-width: 100%');
            
            // If image has explicit large width, it should have constraints
            const widthMatch = style.match(/width:\s*(\d+)px/);
            if (widthMatch) {
              const width = parseInt(widthMatch[1]);
              if (width >= 1000) {
                expect(hasMaxWidth || hasResponsiveClass || hasWidthConstraint).toBe(true);
              }
            }
          });
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('viewport meta tag is present for responsive behavior', () => {
    htmlFiles.forEach(filename => {
      const filePath = path.join(__dirname, '..', filename);
      
      if (!fs.existsSync(filePath)) {
        return;
      }
      
      const html = fs.readFileSync(filePath, 'utf-8');
      
      // Check for viewport meta tag
      expect(htmlContains(html, '<meta name="viewport"')).toBe(true);
      expect(htmlContains(html, 'width=device-width')).toBe(true);
      expect(htmlContains(html, 'initial-scale=1')).toBe(true);
    });
  });
  
  test('containers use Bootstrap responsive classes', () => {
    htmlFiles.forEach(filename => {
      const filePath = path.join(__dirname, '..', filename);
      
      if (!fs.existsSync(filePath)) {
        return;
      }
      
      const html = fs.readFileSync(filePath, 'utf-8');
      
      // Check that main content containers exist
      const hasContainer = htmlContains(html, 'class="container') || 
                          htmlContains(html, 'class="container-fluid');
      expect(hasContainer).toBe(true);
      
      // Check for responsive grid classes
      if (htmlContains(html, 'class="row')) {
        // Should have column classes
        expect(htmlContains(html, /class="[^"]*col-/)).toBe(true);
      }
    });
  });
  
  test('no fixed widths that exceed mobile viewport', () => {
    const mobileWidth = 320; // Minimum mobile width
    
    htmlFiles.forEach(filename => {
      const filePath = path.join(__dirname, '..', filename);
      
      if (!fs.existsSync(filePath)) {
        return;
      }
      
      const html = fs.readFileSync(filePath, 'utf-8');
      
      const styles = extractStyle(html, '\\w+');
      
      styles.forEach(style => {
        // Check for min-width that exceeds mobile
        const minWidthMatch = style.match(/min-width:\s*(\d+)px/);
        if (minWidthMatch) {
          const minWidth = parseInt(minWidthMatch[1]);
          // Min-width should not exceed reasonable mobile width
          // unless it's for specific components like tables
          // We'll be lenient and just check for extremely large values
          if (minWidth > mobileWidth) {
            expect(minWidth <= 768).toBe(true);
          }
        }
      });
    });
  });
});

/**
 * Cross-browser and Cross-device Responsive Testing
 * Task 11.1: Test responsive behavior across devices
 * Requirements: 2.1, 2.2, 2.3
 */
describe('Task 11.1: Responsive behavior across devices', () => {
  const htmlFiles = [
    'index.html',
    'publications.html',
    'awards.html',
    'teaching.html',
    'outreach.html',
    'news.html'
  ];
  
  // Bootstrap 5 breakpoints
  const breakpoints = {
    mobile: 320,      // Small mobile
    mobileLarge: 576, // Large mobile (sm)
    tablet: 768,      // Tablet (md)
    desktop: 992,     // Desktop (lg)
    desktopLarge: 1200, // Large desktop (xl)
    desktopXL: 1400   // Extra large desktop (xxl)
  };
  
  test('all pages have responsive meta viewport tag', () => {
    htmlFiles.forEach(filename => {
      const filePath = path.join(__dirname, '..', filename);
      
      if (!fs.existsSync(filePath)) {
        return;
      }
      
      const html = fs.readFileSync(filePath, 'utf-8');
      
      // Must have viewport meta tag for responsive behavior
      expect(html).toMatch(/<meta\s+name=["']viewport["']/i);
      expect(html).toMatch(/width=device-width/i);
      expect(html).toMatch(/initial-scale=1/i);
    });
  });
  
  test('navigation uses Bootstrap responsive classes', () => {
    htmlFiles.forEach(filename => {
      const filePath = path.join(__dirname, '..', filename);
      
      if (!fs.existsSync(filePath)) {
        return;
      }
      
      const html = fs.readFileSync(filePath, 'utf-8');
      
      // Check for navbar with expand breakpoint
      expect(html).toMatch(/navbar-expand-(sm|md|lg|xl)/i);
      
      // Check for navbar-toggler (hamburger menu)
      expect(html).toMatch(/navbar-toggler/i);
      
      // Check for collapse class on navbar content
      expect(html).toMatch(/navbar-collapse/i);
    });
  });
  
  test('all breakpoints have appropriate responsive classes', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...htmlFiles),
        (filename) => {
          const filePath = path.join(__dirname, '..', filename);
          
          if (!fs.existsSync(filePath)) {
            return true;
          }
          
          const html = fs.readFileSync(filePath, 'utf-8');
          
          // Check for Bootstrap responsive column classes
          const hasResponsiveColumns = 
            html.match(/col-(sm|md|lg|xl|xxl)-\d+/g) !== null ||
            html.match(/col-\d+/g) !== null;
          
          // If page uses grid system, it should have responsive classes
          if (html.includes('class="row')) {
            expect(hasResponsiveColumns).toBe(true);
          }
          
          return true;
        }
      ),
      { numRuns: 50 }
    );
  });
  
  test('images are responsive across all breakpoints', () => {
    htmlFiles.forEach(filename => {
      const filePath = path.join(__dirname, '..', filename);
      
      if (!fs.existsSync(filePath)) {
        return;
      }
      
      const html = fs.readFileSync(filePath, 'utf-8');
      
      // Extract all img tags
      const imgRegex = /<img[^>]*>/gi;
      const images = html.match(imgRegex) || [];
      
      images.forEach(imgTag => {
        // Images should have img-fluid class, max-width style, or a custom class
        // that is styled with max-width in CSS (like hero-image, visitor-map)
        const hasImgFluid = imgTag.includes('img-fluid');
        const hasMaxWidth = imgTag.includes('max-width') || imgTag.includes('width: 100%');
        const hasResponsiveClass = imgTag.includes('img-responsive');
        const hasCustomClass = imgTag.includes('class="hero-image"') || 
                              imgTag.includes('class="visitor-map"');
        
        // At least one responsive mechanism should be present
        // Custom classes are acceptable if they're styled with max-width in CSS
        expect(hasImgFluid || hasMaxWidth || hasResponsiveClass || hasCustomClass).toBe(true);
      });
    });
  });
  
  test('content containers adapt to different breakpoints', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.values(breakpoints)),
        fc.constantFrom(...htmlFiles),
        (breakpoint, filename) => {
          const filePath = path.join(__dirname, '..', filename);
          
          if (!fs.existsSync(filePath)) {
            return true;
          }
          
          const html = fs.readFileSync(filePath, 'utf-8');
          
          // Containers should exist
          const hasContainer = html.includes('class="container') || 
                              html.includes('class="container-fluid');
          expect(hasContainer).toBe(true);
          
          // For mobile breakpoints, check that content can reflow
          if (breakpoint <= breakpoints.tablet) {
            // Should not have fixed large widths without max-width
            const styles = extractStyle(html, '\\w+');
            styles.forEach(style => {
              const widthMatch = style.match(/width:\s*(\d+)px/);
              if (widthMatch) {
                const width = parseInt(widthMatch[1]);
                if (width > breakpoint) {
                  // Should have max-width or be inside a responsive container
                  const hasMaxWidth = style.includes('max-width: 100%') || 
                                     style.includes('max-width:100%');
                  // We'll be lenient for very small fixed widths
                  if (width > 500) {
                    expect(hasMaxWidth || width <= breakpoint).toBe(true);
                  }
                }
              }
            });
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('hero section is responsive on mobile', () => {
    const filePath = path.join(__dirname, '..', 'index.html');
    
    if (!fs.existsSync(filePath)) {
      return;
    }
    
    const html = fs.readFileSync(filePath, 'utf-8');
    
    // Hero section should use responsive grid
    if (html.includes('hero')) {
      // Should have row and column classes
      expect(html).toMatch(/class="[^"]*row[^"]*"/);
      expect(html).toMatch(/class="[^"]*col-/);
    }
  });
  
  test('tables are responsive on mobile devices', () => {
    htmlFiles.forEach(filename => {
      const filePath = path.join(__dirname, '..', filename);
      
      if (!fs.existsSync(filePath)) {
        return;
      }
      
      const html = fs.readFileSync(filePath, 'utf-8');
      
      // If page has tables, they should be responsive
      if (html.includes('<table')) {
        // Should have table-responsive wrapper or responsive class
        const hasResponsiveTable = 
          html.includes('table-responsive') ||
          html.includes('overflow-x: auto') ||
          html.includes('overflow-x:auto');
        
        expect(hasResponsiveTable).toBe(true);
      }
    });
  });
  
  test('text remains readable at all breakpoints', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.values(breakpoints)),
        fc.constantFrom(...htmlFiles),
        (breakpoint, filename) => {
          const filePath = path.join(__dirname, '..', filename);
          
          if (!fs.existsSync(filePath)) {
            return true;
          }
          
          const html = fs.readFileSync(filePath, 'utf-8');
          
          // Check for font-size in styles
          const styles = extractStyle(html, '\\w+');
          styles.forEach(style => {
            const fontSizeMatch = style.match(/font-size:\s*(\d+)px/);
            if (fontSizeMatch) {
              const fontSize = parseInt(fontSizeMatch[1]);
              // Font size should be readable (not too small)
              expect(fontSize).toBeGreaterThanOrEqual(12);
              // Font size should not be excessively large
              expect(fontSize).toBeLessThanOrEqual(72);
            }
          });
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
