/**
 * Property-Based Tests for Icon Library Usage
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

// Helper to extract all icon elements from HTML
function extractIcons(html) {
  const icons = [];
  
  // Match Font Awesome icons (fa fa-*)
  const faRegex = /<i[^>]*class=["'][^"']*fa\s+fa-[^"']*["'][^>]*>/gi;
  let match;
  while ((match = faRegex.exec(html)) !== null) {
    icons.push({
      tag: match[0],
      library: 'font-awesome',
      classes: match[0].match(/class=["']([^"']*)["']/)[1]
    });
  }
  
  // Match Bootstrap Icons (bi bi-*)
  const biRegex = /<i[^>]*class=["'][^"']*bi\s+bi-[^"']*["'][^>]*>/gi;
  while ((match = biRegex.exec(html)) !== null) {
    icons.push({
      tag: match[0],
      library: 'bootstrap-icons',
      classes: match[0].match(/class=["']([^"']*)["']/)[1]
    });
  }
  
  return icons;
}

/**
 * Property 6: Icon library usage
 * Feature: academic-website-modernization, Property 6: Icon library usage
 * Validates: Requirements 4.2
 * 
 * For any icon element (social icons, UI icons), the element should use 
 * classes from either Bootstrap Icons or Font Awesome 6.x
 */
describe('Property 6: Icon library usage', () => {
  const htmlFiles = [
    'index.html',
    'publications.html',
    'awards.html',
    'teaching.html',
    'outreach.html',
    'news.html',
    'resume.html'
  ];
  
  test('all icon elements use approved icon libraries', () => {
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
          const icons = extractIcons(html);
          
          // All icons should use either Font Awesome or Bootstrap Icons
          icons.forEach(icon => {
            expect(['font-awesome', 'bootstrap-icons']).toContain(icon.library);
          });
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('Font Awesome icons use correct class pattern', () => {
    htmlFiles.forEach(filename => {
      const filePath = path.join(__dirname, '..', filename);
      
      if (!fs.existsSync(filePath)) {
        return;
      }
      
      const html = fs.readFileSync(filePath, 'utf-8');
      const icons = extractIcons(html);
      
      const faIcons = icons.filter(icon => icon.library === 'font-awesome');
      
      faIcons.forEach(icon => {
        // Font Awesome icons should have 'fa' base class
        expect(icon.classes).toMatch(/\bfa\b/);
        
        // Should have specific icon class (fa-*)
        expect(icon.classes).toMatch(/\bfa-[\w-]+\b/);
      });
    });
  });
  
  test('Bootstrap Icons use correct class pattern', () => {
    htmlFiles.forEach(filename => {
      const filePath = path.join(__dirname, '..', filename);
      
      if (!fs.existsSync(filePath)) {
        return;
      }
      
      const html = fs.readFileSync(filePath, 'utf-8');
      const icons = extractIcons(html);
      
      const biIcons = icons.filter(icon => icon.library === 'bootstrap-icons');
      
      biIcons.forEach(icon => {
        // Bootstrap Icons should have 'bi' base class
        expect(icon.classes).toMatch(/\bbi\b/);
        
        // Should have specific icon class (bi-*)
        expect(icon.classes).toMatch(/\bbi-[\w-]+\b/);
      });
    });
  });
  
  test('icon libraries are properly loaded', () => {
    htmlFiles.forEach(filename => {
      const filePath = path.join(__dirname, '..', filename);
      
      if (!fs.existsSync(filePath)) {
        return;
      }
      
      const html = fs.readFileSync(filePath, 'utf-8');
      const icons = extractIcons(html);
      
      if (icons.length === 0) {
        // No icons on this page, skip
        return;
      }
      
      const hasFontAwesome = icons.some(icon => icon.library === 'font-awesome');
      const hasBootstrapIcons = icons.some(icon => icon.library === 'bootstrap-icons');
      
      // If page uses Font Awesome, verify stylesheet is loaded
      if (hasFontAwesome) {
        expect(htmlContains(html, /font-awesome.*\.css/)).toBe(true);
      }
      
      // If page uses Bootstrap Icons, verify stylesheet is loaded
      if (hasBootstrapIcons) {
        expect(htmlContains(html, /bootstrap-icons.*\.css/)).toBe(true);
      }
    });
  });
  
  test('icons have aria-hidden attribute for accessibility', () => {
    htmlFiles.forEach(filename => {
      const filePath = path.join(__dirname, '..', filename);
      
      if (!fs.existsSync(filePath)) {
        return;
      }
      
      const html = fs.readFileSync(filePath, 'utf-8');
      
      // Extract all icon elements
      const iconRegex = /<i[^>]*class=["'][^"']*(fa|bi)\s+(fa|bi)-[^"']*["'][^>]*>/gi;
      let match;
      
      while ((match = iconRegex.exec(html)) !== null) {
        const iconTag = match[0];
        
        // Icons should have aria-hidden="true" for accessibility
        // (since they are decorative and text labels are provided)
        expect(iconTag).toMatch(/aria-hidden=["']true["']/);
      }
    });
  });
  
  test('social links have both icon and text label', () => {
    const filePath = path.join(__dirname, '..', 'index.html');
    
    if (!fs.existsSync(filePath)) {
      return;
    }
    
    const html = fs.readFileSync(filePath, 'utf-8');
    
    // Extract social links section
    const socialLinksMatch = html.match(/<nav[^>]*class=["'][^"']*social-links[^"']*["'][^>]*>[\s\S]*?<\/nav>/i);
    
    if (!socialLinksMatch) {
      // No social links section found
      return;
    }
    
    const socialLinksHtml = socialLinksMatch[0];
    
    // Extract all anchor tags in social links
    const linkRegex = /<a[^>]*class=["'][^"']*social-link[^"']*["'][^>]*>[\s\S]*?<\/a>/gi;
    let match;
    
    while ((match = linkRegex.exec(socialLinksHtml)) !== null) {
      const linkHtml = match[0];
      
      // Each social link should have an icon
      expect(linkHtml).toMatch(/<i[^>]*class=["'][^"']*(fa|bi)\s+(fa|bi)-[^"']*["']/);
      
      // Each social link should have a text label (in a span)
      expect(linkHtml).toMatch(/<span>[^<]+<\/span>/);
    }
  });
});
