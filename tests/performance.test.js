/**
 * Property-Based Tests for Performance Optimization
 * Feature: academic-website-modernization
 */

const fc = require('fast-check');
const fs = require('fs');
const path = require('path');

// Helper to extract external resource URLs from HTML
function extractExternalResources(html) {
  const resources = [];
  
  // Match link tags with external URLs
  const linkRegex = /<link[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>/gi;
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    resources.push(match[1]);
  }
  
  // Match script tags with external URLs
  const scriptRegex = /<script[^>]*src=["'](https?:\/\/[^"']+)["'][^>]*>/gi;
  while ((match = scriptRegex.exec(html)) !== null) {
    resources.push(match[1]);
  }
  
  // Match img tags with external URLs (http/https)
  const imgRegex = /<img[^>]*src=["'](https?:\/\/[^"']+)["'][^>]*>/gi;
  while ((match = imgRegex.exec(html)) !== null) {
    resources.push(match[1]);
  }
  
  // Match img tags with protocol-relative URLs (//)
  const protocolRelativeRegex = /<img[^>]*src=["'](\/\/[^"']+)["'][^>]*>/gi;
  while ((match = protocolRelativeRegex.exec(html)) !== null) {
    resources.push('https:' + match[1]);
  }
  
  return resources;
}

// Helper to check if image has explicit dimensions
function imageHasDimensions(imgTag) {
  const widthAttr = /width=["']?\d+["']?/i.test(imgTag);
  const heightAttr = /height=["']?\d+["']?/i.test(imgTag);
  const styleWidth = /style=["'][^"']*width:\s*\d+px/i.test(imgTag);
  const styleHeight = /style=["'][^"']*height:\s*\d+px/i.test(imgTag);
  
  return (widthAttr || styleWidth) && (heightAttr || styleHeight);
}

/**
 * Property 8: Resource optimization
 * Feature: academic-website-modernization, Property 8: Resource optimization
 * Validates: Requirements 6.1
 * 
 * For any page, the total number of external HTTP requests should not exceed 15 requests
 */
describe('Property 8: Resource optimization', () => {
  const htmlFiles = [
    'index.html',
    'publications.html',
    'awards.html',
    'teaching.html',
    'outreach.html',
    'news.html',
    'resume.html'
  ];
  
  test('external HTTP requests should not exceed 15 per page', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...htmlFiles),
        (filename) => {
          const filePath = path.join(__dirname, '..', filename);
          
          // Skip if file doesn't exist
          if (!fs.existsSync(filePath)) {
            return true;
          }
          
          const html = fs.readFileSync(filePath, 'utf-8');
          const externalResources = extractExternalResources(html);
          
          // Count unique external resources
          const uniqueResources = [...new Set(externalResources)];
          
          // Log for debugging
          if (uniqueResources.length > 15) {
            console.log(`\n${filename} has ${uniqueResources.length} external requests:`);
            uniqueResources.forEach(url => console.log(`  - ${url}`));
          }
          
          // Verify count is within limit
          expect(uniqueResources.length).toBeLessThanOrEqual(15);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('pages should minimize duplicate external resources', () => {
    htmlFiles.forEach(filename => {
      const filePath = path.join(__dirname, '..', filename);
      
      if (!fs.existsSync(filePath)) {
        return;
      }
      
      const html = fs.readFileSync(filePath, 'utf-8');
      const externalResources = extractExternalResources(html);
      
      // Check for duplicates
      const resourceCounts = {};
      externalResources.forEach(url => {
        resourceCounts[url] = (resourceCounts[url] || 0) + 1;
      });
      
      // Find duplicates
      const duplicates = Object.entries(resourceCounts)
        .filter(([url, count]) => count > 1);
      
      if (duplicates.length > 0) {
        console.log(`\n${filename} has duplicate resources:`);
        duplicates.forEach(([url, count]) => {
          console.log(`  - ${url} (${count} times)`);
        });
      }
      
      // No resource should be loaded more than once
      expect(duplicates.length).toBe(0);
    });
  });
  
  test('font resources should use preconnect hints', () => {
    htmlFiles.forEach(filename => {
      const filePath = path.join(__dirname, '..', filename);
      
      if (!fs.existsSync(filePath)) {
        return;
      }
      
      const html = fs.readFileSync(filePath, 'utf-8');
      
      // If Google Fonts are used, preconnect should be present
      if (html.includes('fonts.googleapis.com/css')) {
        expect(html).toContain('rel="preconnect" href="https://fonts.googleapis.com"');
        expect(html).toContain('rel="preconnect" href="https://fonts.gstatic.com"');
      }
    });
  });
  
  test('font URLs should include display=swap parameter', () => {
    htmlFiles.forEach(filename => {
      const filePath = path.join(__dirname, '..', filename);
      
      if (!fs.existsSync(filePath)) {
        return;
      }
      
      const html = fs.readFileSync(filePath, 'utf-8');
      
      // Extract Google Fonts URLs
      const fontUrlRegex = /fonts\.googleapis\.com\/css2\?[^"']+/g;
      const fontUrls = html.match(fontUrlRegex) || [];
      
      fontUrls.forEach(url => {
        // Each font URL should include display=swap
        expect(url).toContain('display=swap');
      });
    });
  });
});

/**
 * Property 9: Layout shift prevention
 * Feature: academic-website-modernization, Property 9: Layout shift prevention
 * Validates: Requirements 6.5
 * 
 * For any image element, the element should have explicit width and height 
 * attributes or CSS dimensions to prevent cumulative layout shift
 */
describe('Property 9: Layout shift prevention', () => {
  const htmlFiles = [
    'index.html',
    'publications.html',
    'awards.html',
    'teaching.html',
    'outreach.html',
    'news.html',
    'resume.html'
  ];
  
  test('all images should have explicit dimensions', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...htmlFiles),
        (filename) => {
          const filePath = path.join(__dirname, '..', filename);
          
          // Skip if file doesn't exist
          if (!fs.existsSync(filePath)) {
            return true;
          }
          
          const html = fs.readFileSync(filePath, 'utf-8');
          
          // Extract all img tags
          const imgRegex = /<img[^>]*>/gi;
          const images = html.match(imgRegex) || [];
          
          images.forEach((imgTag, index) => {
            const hasDimensions = imageHasDimensions(imgTag);
            
            if (!hasDimensions) {
              console.log(`\n${filename} - Image ${index + 1} missing dimensions:`);
              console.log(imgTag);
            }
            
            // Each image should have explicit dimensions
            expect(hasDimensions).toBe(true);
          });
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('images should have width and height attributes', () => {
    htmlFiles.forEach(filename => {
      const filePath = path.join(__dirname, '..', filename);
      
      if (!fs.existsSync(filePath)) {
        return;
      }
      
      const html = fs.readFileSync(filePath, 'utf-8');
      
      // Extract all img tags
      const imgRegex = /<img[^>]*>/gi;
      const images = html.match(imgRegex) || [];
      
      images.forEach((imgTag, index) => {
        // Check for width and height attributes
        const hasWidthAttr = /width=["']?\d+["']?/i.test(imgTag);
        const hasHeightAttr = /height=["']?\d+["']?/i.test(imgTag);
        
        // At minimum, should have width and height attributes
        // (CSS dimensions are also acceptable but attributes are preferred)
        if (!hasWidthAttr || !hasHeightAttr) {
          // Check if it has CSS dimensions as fallback
          const hasCssDimensions = 
            /style=["'][^"']*width:\s*\d+px/i.test(imgTag) &&
            /style=["'][^"']*height:\s*\d+px/i.test(imgTag);
          
          expect(hasCssDimensions).toBe(true);
        }
      });
    });
  });
  
  test('below-fold images should use lazy loading', () => {
    htmlFiles.forEach(filename => {
      const filePath = path.join(__dirname, '..', filename);
      
      if (!fs.existsSync(filePath)) {
        return;
      }
      
      const html = fs.readFileSync(filePath, 'utf-8');
      
      // Extract all img tags
      const imgRegex = /<img[^>]*>/gi;
      const images = html.match(imgRegex) || [];
      
      // For images that are likely below the fold (not in hero section),
      // check if they have loading="lazy"
      images.forEach((imgTag, index) => {
        // Skip hero images (first image is typically above fold)
        if (index === 0) {
          return;
        }
        
        // Check if image is in a section that's likely below fold
        const imgIndex = html.indexOf(imgTag);
        const beforeImg = html.substring(0, imgIndex);
        
        // If image appears after substantial content, it should be lazy loaded
        const isLikelyBelowFold = beforeImg.split('<section').length > 1 ||
                                  beforeImg.split('<div class="container').length > 2;
        
        if (isLikelyBelowFold) {
          const hasLazyLoading = /loading=["']lazy["']/i.test(imgTag);
          
          if (!hasLazyLoading) {
            console.log(`\n${filename} - Below-fold image ${index + 1} missing lazy loading:`);
            console.log(imgTag.substring(0, 100) + '...');
          }
          
          // Below-fold images should have lazy loading
          expect(hasLazyLoading).toBe(true);
        }
      });
    });
  });
});
