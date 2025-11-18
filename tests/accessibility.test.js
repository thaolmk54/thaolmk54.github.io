/**
 * Property-Based Tests for Link Accessibility
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

// Helper to extract all external links from HTML
function extractExternalLinks(html) {
  const links = [];
  
  // Match anchor tags with href
  const linkRegex = /<a[^>]*href=["']([^"']*)["'][^>]*>/gi;
  let match;
  
  while ((match = linkRegex.exec(html)) !== null) {
    const fullTag = match[0];
    const href = match[1];
    
    // Check if it's an external link (starts with http:// or https://)
    if (href.startsWith('http://') || href.startsWith('https://')) {
      links.push({
        tag: fullTag,
        href: href
      });
    }
  }
  
  return links;
}

// Helper to check if link has attribute
function linkHasAttribute(linkTag, attribute, value = null) {
  if (value) {
    const regex = new RegExp(`${attribute}=["']${value}["']`, 'i');
    return regex.test(linkTag);
  } else {
    const regex = new RegExp(`${attribute}=["'][^"']*["']`, 'i');
    return regex.test(linkTag);
  }
}

/**
 * Property 4: Link accessibility attributes
 * Feature: academic-website-modernization, Property 4: Link accessibility attributes
 * Validates: Requirements 4.3
 * 
 * For any external link (social links, publication links), the anchor element 
 * should have target="_blank" and rel="noopener noreferrer" attributes
 */
describe('Property 4: Link accessibility attributes', () => {
  const htmlFiles = [
    'index.html',
    'publications.html',
    'awards.html',
    'teaching.html',
    'outreach.html',
    'news.html',
    'resume.html'
  ];
  
  test('all external links have target="_blank"', () => {
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
          const externalLinks = extractExternalLinks(html);
          
          // All external links should have target="_blank"
          externalLinks.forEach(link => {
            expect(linkHasAttribute(link.tag, 'target', '_blank')).toBe(true);
          });
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('all external links have rel="noopener noreferrer"', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...htmlFiles),
        (filename) => {
          const filePath = path.join(__dirname, '..', filename);
          
          if (!fs.existsSync(filePath)) {
            return true;
          }
          
          const html = fs.readFileSync(filePath, 'utf-8');
          const externalLinks = extractExternalLinks(html);
          
          // All external links should have rel="noopener noreferrer"
          externalLinks.forEach(link => {
            const hasRel = linkHasAttribute(link.tag, 'rel');
            expect(hasRel).toBe(true);
            
            if (hasRel) {
              const relMatch = link.tag.match(/rel=["']([^"']*)["']/i);
              const relValue = relMatch ? relMatch[1] : '';
              
              // Should contain both noopener and noreferrer
              expect(relValue).toMatch(/noopener/);
              expect(relValue).toMatch(/noreferrer/);
            }
          });
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('social links are keyboard accessible', () => {
    const filePath = path.join(__dirname, '..', 'index.html');
    
    if (!fs.existsSync(filePath)) {
      return;
    }
    
    const html = fs.readFileSync(filePath, 'utf-8');
    
    // Extract social links section
    const socialLinksMatch = html.match(/<nav[^>]*class=["'][^"']*social-links[^"']*["'][^>]*>[\s\S]*?<\/nav>/i);
    
    if (!socialLinksMatch) {
      return;
    }
    
    const socialLinksHtml = socialLinksMatch[0];
    
    // Extract all anchor tags in social links
    const linkRegex = /<a[^>]*>/gi;
    let match;
    
    while ((match = linkRegex.exec(socialLinksHtml)) !== null) {
      const linkTag = match[0];
      
      // Links should be keyboard accessible (have href)
      expect(linkTag).toMatch(/href=["'][^"']+["']/);
      
      // Links should not have tabindex="-1" (which would make them not keyboard accessible)
      expect(linkTag).not.toMatch(/tabindex=["']-1["']/);
    }
  });
  
  test('external links have security attributes', () => {
    htmlFiles.forEach(filename => {
      const filePath = path.join(__dirname, '..', filename);
      
      if (!fs.existsSync(filePath)) {
        return;
      }
      
      const html = fs.readFileSync(filePath, 'utf-8');
      const externalLinks = extractExternalLinks(html);
      
      externalLinks.forEach(link => {
        // External links should have both target and rel attributes for security
        expect(linkHasAttribute(link.tag, 'target')).toBe(true);
        expect(linkHasAttribute(link.tag, 'rel')).toBe(true);
        
        // rel should include noopener to prevent window.opener access
        const relMatch = link.tag.match(/rel=["']([^"']*)["']/i);
        if (relMatch) {
          expect(relMatch[1]).toMatch(/noopener/);
        }
      });
    });
  });
  
  test('internal links do not have target="_blank"', () => {
    htmlFiles.forEach(filename => {
      const filePath = path.join(__dirname, '..', filename);
      
      if (!fs.existsSync(filePath)) {
        return;
      }
      
      const html = fs.readFileSync(filePath, 'utf-8');
      
      // Extract internal links (relative paths)
      const internalLinkRegex = /<a[^>]*href=["']([^"']*\.html)["'][^>]*>/gi;
      let match;
      
      while ((match = internalLinkRegex.exec(html)) !== null) {
        const linkTag = match[0];
        const href = match[1];
        
        // Internal links should not have target="_blank"
        // (unless they're explicitly external)
        if (!href.startsWith('http')) {
          expect(linkTag).not.toMatch(/target=["']_blank["']/);
        }
      }
    });
  });
  
  test('links have descriptive text or aria-label', () => {
    htmlFiles.forEach(filename => {
      const filePath = path.join(__dirname, '..', filename);
      
      if (!fs.existsSync(filePath)) {
        return;
      }
      
      const html = fs.readFileSync(filePath, 'utf-8');
      
      // Extract all links
      const linkRegex = /<a[^>]*>[\s\S]*?<\/a>/gi;
      let match;
      
      while ((match = linkRegex.exec(html)) !== null) {
        const linkHtml = match[0];
        
        // Link should have either:
        // 1. Text content
        // 2. aria-label attribute
        // 3. title attribute
        
        const hasTextContent = /<a[^>]*>[\s\S]*[a-zA-Z]+[\s\S]*<\/a>/.test(linkHtml);
        const hasAriaLabel = /aria-label=["'][^"']+["']/.test(linkHtml);
        const hasTitle = /title=["'][^"']+["']/.test(linkHtml);
        
        expect(hasTextContent || hasAriaLabel || hasTitle).toBe(true);
      }
    });
  });
});

/**
 * Property 10: Accessibility compliance
 * Feature: academic-website-modernization, Property 10: Accessibility compliance
 * Validates: Requirements 9.1, 9.2, 9.5
 * 
 * For any interactive element, the element should be keyboard accessible (focusable via tab),
 * have visible focus styles, and include appropriate ARIA attributes when needed
 */
describe('Property 10: Accessibility compliance', () => {
  const htmlFiles = [
    'index.html',
    'publications.html',
    'awards.html',
    'teaching.html',
    'outreach.html',
    'news.html',
    'resume.html'
  ];
  
  test('all pages have skip navigation link', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...htmlFiles),
        (filename) => {
          const filePath = path.join(__dirname, '..', filename);
          
          if (!fs.existsSync(filePath)) {
            return true;
          }
          
          const html = fs.readFileSync(filePath, 'utf-8');
          
          // Should have skip navigation link
          expect(html).toMatch(/skip-link|skip to main content/i);
          expect(html).toMatch(/href=["']#main-content["']/);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('all pages have main content landmark', () => {
    htmlFiles.forEach(filename => {
      const filePath = path.join(__dirname, '..', filename);
      
      if (!fs.existsSync(filePath)) {
        return;
      }
      
      const html = fs.readFileSync(filePath, 'utf-8');
      
      // Should have main element or role="main"
      const hasMainElement = /<main[^>]*>/i.test(html);
      const hasMainRole = /role=["']main["']/i.test(html);
      
      expect(hasMainElement || hasMainRole).toBe(true);
      
      // Main element should have id="main-content" for skip link
      if (hasMainElement) {
        expect(html).toMatch(/<main[^>]*id=["']main-content["'][^>]*>/i);
      }
    });
  });
  
  test('navigation has proper ARIA labels', () => {
    htmlFiles.forEach(filename => {
      const filePath = path.join(__dirname, '..', filename);
      
      if (!fs.existsSync(filePath)) {
        return;
      }
      
      const html = fs.readFileSync(filePath, 'utf-8');
      
      // Navigation should have aria-label
      const navRegex = /<nav[^>]*>/gi;
      let match;
      
      while ((match = navRegex.exec(html)) !== null) {
        const navTag = match[0];
        
        // Should have either aria-label or aria-labelledby
        const hasAriaLabel = /aria-label=["'][^"']+["']/.test(navTag);
        const hasAriaLabelledby = /aria-labelledby=["'][^"']+["']/.test(navTag);
        
        expect(hasAriaLabel || hasAriaLabelledby).toBe(true);
      }
    });
  });
  
  test('sections have proper heading structure', () => {
    htmlFiles.forEach(filename => {
      const filePath = path.join(__dirname, '..', filename);
      
      if (!fs.existsSync(filePath)) {
        return;
      }
      
      const html = fs.readFileSync(filePath, 'utf-8');
      
      // Extract all headings
      const headings = [];
      const headingRegex = /<h([1-6])[^>]*>/gi;
      let match;
      
      while ((match = headingRegex.exec(html)) !== null) {
        const level = parseInt(match[1]);
        headings.push(level);
      }
      
      // Should have at least one h1
      expect(headings.filter(h => h === 1).length).toBeGreaterThanOrEqual(1);
      
      // Heading levels should not skip (e.g., h1 -> h3 without h2)
      for (let i = 1; i < headings.length; i++) {
        const diff = headings[i] - headings[i - 1];
        // Can go down any number of levels, but can only go up by 1
        if (diff > 0) {
          expect(diff).toBeLessThanOrEqual(1);
        }
      }
    });
  });
  
  test('interactive elements are keyboard accessible', () => {
    htmlFiles.forEach(filename => {
      const filePath = path.join(__dirname, '..', filename);
      
      if (!fs.existsSync(filePath)) {
        return;
      }
      
      const html = fs.readFileSync(filePath, 'utf-8');
      
      // Check links - use word boundary to avoid matching <article>
      const linkRegex = /<a\s[^>]*>/gi;
      let match;
      
      while ((match = linkRegex.exec(html)) !== null) {
        const linkTag = match[0];
        
        // Links should have href (makes them keyboard accessible)
        expect(linkTag).toMatch(/href=["'][^"']*["']/);
        
        // Should not have tabindex="-1" unless it's intentional
        if (/tabindex=["']-1["']/.test(linkTag)) {
          // If it has tabindex="-1", it should have a good reason
          // (e.g., it's in a hidden menu or modal)
          const context = html.substring(Math.max(0, match.index - 200), match.index + 200);
          const isInCollapse = /collapse/.test(context);
          const isInModal = /modal/.test(context);
          
          expect(isInCollapse || isInModal).toBe(true);
        }
      }
      
      // Check buttons
      const buttonRegex = /<button[^>]*>/gi;
      while ((match = buttonRegex.exec(html)) !== null) {
        const buttonTag = match[0];
        
        // Buttons should not have tabindex="-1"
        expect(buttonTag).not.toMatch(/tabindex=["']-1["']/);
        
        // Buttons should have type attribute
        const hasType = /type=["'][^"']+["']/.test(buttonTag);
        expect(hasType).toBe(true);
      }
    });
  });
  
  test('focus styles are defined in CSS', () => {
    const cssFiles = ['css/base.css', 'css/components.css'];
    
    cssFiles.forEach(cssFile => {
      const cssPath = path.join(__dirname, '..', cssFile);
      
      if (!fs.existsSync(cssPath)) {
        return;
      }
      
      const css = fs.readFileSync(cssPath, 'utf-8');
      
      // Should have focus-visible styles
      expect(css).toMatch(/:focus-visible/);
      
      // Should have outline styles for focus
      const focusVisibleMatch = css.match(/:focus-visible\s*{[^}]*}/gs);
      
      if (focusVisibleMatch) {
        focusVisibleMatch.forEach(rule => {
          // Should define outline
          expect(rule).toMatch(/outline/);
        });
      }
    });
  });
  
  test('sections have proper ARIA labels', () => {
    htmlFiles.forEach(filename => {
      const filePath = path.join(__dirname, '..', filename);
      
      if (!fs.existsSync(filePath)) {
        return;
      }
      
      const html = fs.readFileSync(filePath, 'utf-8');
      
      // Sections should have aria-labelledby pointing to their heading
      const sectionRegex = /<section[^>]*>/gi;
      let match;
      
      while ((match = sectionRegex.exec(html)) !== null) {
        const sectionTag = match[0];
        
        // Should have aria-labelledby
        const hasAriaLabelledby = /aria-labelledby=["'][^"']+["']/.test(sectionTag);
        
        if (hasAriaLabelledby) {
          // Extract the id
          const idMatch = sectionTag.match(/aria-labelledby=["']([^"']+)["']/);
          if (idMatch) {
            const labelId = idMatch[1];
            
            // Should have a corresponding heading with that id
            const headingRegex = new RegExp(`<h[1-6][^>]*id=["']${labelId}["'][^>]*>`, 'i');
            expect(html).toMatch(headingRegex);
          }
        }
      }
    });
  });
  
  test('form elements have labels', () => {
    htmlFiles.forEach(filename => {
      const filePath = path.join(__dirname, '..', filename);
      
      if (!fs.existsSync(filePath)) {
        return;
      }
      
      const html = fs.readFileSync(filePath, 'utf-8');
      
      // Check input elements
      const inputRegex = /<input[^>]*>/gi;
      let match;
      
      while ((match = inputRegex.exec(html)) !== null) {
        const inputTag = match[0];
        
        // Input should have either:
        // 1. aria-label
        // 2. aria-labelledby
        // 3. Associated label element (via id)
        // 4. title attribute
        // Exception: hidden inputs and submit buttons
        
        const isHidden = /type=["']hidden["']/.test(inputTag);
        const isSubmit = /type=["']submit["']/.test(inputTag);
        const isButton = /type=["']button["']/.test(inputTag);
        
        if (!isHidden && !isSubmit && !isButton) {
          const hasAriaLabel = /aria-label=["'][^"']+["']/.test(inputTag);
          const hasAriaLabelledby = /aria-labelledby=["'][^"']+["']/.test(inputTag);
          const hasTitle = /title=["'][^"']+["']/.test(inputTag);
          const hasId = /id=["']([^"']+)["']/.test(inputTag);
          
          // If it has an id, check if there's a label for it
          let hasLabel = false;
          if (hasId) {
            const idMatch = inputTag.match(/id=["']([^"']+)["']/);
            if (idMatch) {
              const inputId = idMatch[1];
              const labelRegex = new RegExp(`<label[^>]*for=["']${inputId}["'][^>]*>`, 'i');
              hasLabel = labelRegex.test(html);
            }
          }
          
          expect(hasAriaLabel || hasAriaLabelledby || hasTitle || hasLabel).toBe(true);
        }
      }
    });
  });
});

/**
 * Property 11: Color contrast compliance
 * Feature: academic-website-modernization, Property 11: Color contrast compliance
 * Validates: Requirements 9.3
 * 
 * For any text element, the color contrast ratio between the text color and its background
 * should meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
 */
describe('Property 11: Color contrast compliance', () => {
  // Helper function to convert hex to RGB
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
  
  // Helper function to calculate relative luminance
  function getLuminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }
  
  // Helper function to calculate contrast ratio
  function getContrastRatio(color1, color2) {
    const lum1 = getLuminance(color1.r, color1.g, color1.b);
    const lum2 = getLuminance(color2.r, color2.g, color2.b);
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
  }
  
  test('primary text color has sufficient contrast with background', () => {
    const cssPath = path.join(__dirname, '..', 'css/variables.css');
    
    if (!fs.existsSync(cssPath)) {
      return;
    }
    
    const css = fs.readFileSync(cssPath, 'utf-8');
    
    // Extract color variables
    const textColorMatch = css.match(/--color-text:\s*#([a-f\d]{6})/i);
    const bgColorMatch = css.match(/--color-background:\s*#([a-f\d]{6})/i);
    
    if (textColorMatch && bgColorMatch) {
      const textColor = hexToRgb('#' + textColorMatch[1]);
      const bgColor = hexToRgb('#' + bgColorMatch[1]);
      
      if (textColor && bgColor) {
        const ratio = getContrastRatio(textColor, bgColor);
        
        // WCAG AA requires 4.5:1 for normal text
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
  
  test('primary color has sufficient contrast with white background', () => {
    const cssPath = path.join(__dirname, '..', 'css/variables.css');
    
    if (!fs.existsSync(cssPath)) {
      return;
    }
    
    const css = fs.readFileSync(cssPath, 'utf-8');
    
    // Extract primary color
    const primaryColorMatch = css.match(/--color-primary:\s*#([a-f\d]{6})/i);
    
    if (primaryColorMatch) {
      const primaryColor = hexToRgb('#' + primaryColorMatch[1]);
      const white = { r: 255, g: 255, b: 255 };
      
      if (primaryColor) {
        const ratio = getContrastRatio(primaryColor, white);
        
        // Should have at least 3:1 for large text
        expect(ratio).toBeGreaterThanOrEqual(3);
      }
    }
  });
  
  test('link color has sufficient contrast with background', () => {
    const cssPath = path.join(__dirname, '..', 'css/variables.css');
    
    if (!fs.existsSync(cssPath)) {
      return;
    }
    
    const css = fs.readFileSync(cssPath, 'utf-8');
    
    // Extract link color and background
    const linkColorMatch = css.match(/--color-link:\s*#([a-f\d]{6})/i);
    const bgColorMatch = css.match(/--color-background:\s*#([a-f\d]{6})/i);
    
    if (linkColorMatch && bgColorMatch) {
      const linkColor = hexToRgb('#' + linkColorMatch[1]);
      const bgColor = hexToRgb('#' + bgColorMatch[1]);
      
      if (linkColor && bgColor) {
        const ratio = getContrastRatio(linkColor, bgColor);
        
        // WCAG AA requires 4.5:1 for normal text
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
  
  test('accent color has sufficient contrast with white', () => {
    const cssPath = path.join(__dirname, '..', 'css/variables.css');
    
    if (!fs.existsSync(cssPath)) {
      return;
    }
    
    const css = fs.readFileSync(cssPath, 'utf-8');
    
    // Extract accent color
    const accentColorMatch = css.match(/--color-accent:\s*#([a-f\d]{6})/i);
    
    if (accentColorMatch) {
      const accentColor = hexToRgb('#' + accentColorMatch[1]);
      const white = { r: 255, g: 255, b: 255 };
      
      if (accentColor) {
        const ratio = getContrastRatio(accentColor, white);
        
        // Should have at least 3:1 for UI components
        expect(ratio).toBeGreaterThanOrEqual(3);
      }
    }
  });
  
  test('secondary text color has sufficient contrast', () => {
    const cssPath = path.join(__dirname, '..', 'css/variables.css');
    
    if (!fs.existsSync(cssPath)) {
      return;
    }
    
    const css = fs.readFileSync(cssPath, 'utf-8');
    
    // Extract secondary text color and background
    const secondaryColorMatch = css.match(/--color-secondary:\s*#([a-f\d]{6})/i);
    const bgColorMatch = css.match(/--color-background:\s*#([a-f\d]{6})/i);
    
    if (secondaryColorMatch && bgColorMatch) {
      const secondaryColor = hexToRgb('#' + secondaryColorMatch[1]);
      const bgColor = hexToRgb('#' + bgColorMatch[1]);
      
      if (secondaryColor && bgColor) {
        const ratio = getContrastRatio(secondaryColor, bgColor);
        
        // Should have at least 3:1 for large text (headings)
        expect(ratio).toBeGreaterThanOrEqual(3);
      }
    }
  });
  
  test('all defined color combinations meet minimum contrast', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          { text: '--color-text', bg: '--color-background', minRatio: 4.5 },
          { text: '--color-link', bg: '--color-background', minRatio: 4.5 },
          { text: '--color-primary', bg: '--color-white', minRatio: 3 },
          { text: '--color-accent', bg: '--color-white', minRatio: 3 }
        ),
        (colorPair) => {
          const cssPath = path.join(__dirname, '..', 'css/variables.css');
          
          if (!fs.existsSync(cssPath)) {
            return true;
          }
          
          const css = fs.readFileSync(cssPath, 'utf-8');
          
          // Extract colors
          const textColorRegex = new RegExp(`${colorPair.text}:\\s*#([a-f\\d]{6})`, 'i');
          const bgColorRegex = new RegExp(`${colorPair.bg}:\\s*#([a-f\\d]{6})`, 'i');
          
          const textColorMatch = css.match(textColorRegex);
          const bgColorMatch = css.match(bgColorRegex);
          
          if (textColorMatch && bgColorMatch) {
            const textColor = hexToRgb('#' + textColorMatch[1]);
            const bgColor = hexToRgb('#' + bgColorMatch[1]);
            
            if (textColor && bgColor) {
              const ratio = getContrastRatio(textColor, bgColor);
              expect(ratio).toBeGreaterThanOrEqual(colorPair.minRatio);
            }
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 12: Image alt text presence
 * Feature: academic-website-modernization, Property 12: Image alt text presence
 * Validates: Requirements 9.4
 * 
 * For any img element, the element should have a non-empty alt attribute
 * that describes the image content
 */
describe('Property 12: Image alt text presence', () => {
  const htmlFiles = [
    'index.html',
    'publications.html',
    'awards.html',
    'teaching.html',
    'outreach.html',
    'news.html',
    'resume.html'
  ];
  
  test('all images have alt attributes', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...htmlFiles),
        (filename) => {
          const filePath = path.join(__dirname, '..', filename);
          
          if (!fs.existsSync(filePath)) {
            return true;
          }
          
          const html = fs.readFileSync(filePath, 'utf-8');
          
          // Extract all img tags
          const imgRegex = /<img[^>]*>/gi;
          let match;
          
          while ((match = imgRegex.exec(html)) !== null) {
            const imgTag = match[0];
            
            // Should have alt attribute
            expect(imgTag).toMatch(/alt=["'][^"']*["']/);
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('all images have non-empty alt text', () => {
    htmlFiles.forEach(filename => {
      const filePath = path.join(__dirname, '..', filename);
      
      if (!fs.existsSync(filePath)) {
        return;
      }
      
      const html = fs.readFileSync(filePath, 'utf-8');
      
      // Extract all img tags
      const imgRegex = /<img[^>]*>/gi;
      let match;
      
      while ((match = imgRegex.exec(html)) !== null) {
        const imgTag = match[0];
        
        // Extract alt attribute value
        const altMatch = imgTag.match(/alt=["']([^"']*)["']/);
        
        if (altMatch) {
          const altText = altMatch[1];
          
          // Alt text should not be empty
          expect(altText.trim().length).toBeGreaterThan(0);
        } else {
          // Should have alt attribute
          fail(`Image missing alt attribute: ${imgTag}`);
        }
      }
    });
  });
  
  test('alt text is descriptive', () => {
    htmlFiles.forEach(filename => {
      const filePath = path.join(__dirname, '..', filename);
      
      if (!fs.existsSync(filePath)) {
        return;
      }
      
      const html = fs.readFileSync(filePath, 'utf-8');
      
      // Extract all img tags
      const imgRegex = /<img[^>]*>/gi;
      let match;
      
      while ((match = imgRegex.exec(html)) !== null) {
        const imgTag = match[0];
        
        // Extract alt attribute value
        const altMatch = imgTag.match(/alt=["']([^"']*)["']/);
        
        if (altMatch) {
          const altText = altMatch[1].trim();
          
          // Alt text should be descriptive (more than just "image" or "photo")
          // and should have at least 3 characters
          expect(altText.length).toBeGreaterThanOrEqual(3);
          
          // Should not be generic placeholders
          const genericTerms = ['image', 'photo', 'picture', 'img'];
          const isGeneric = genericTerms.some(term => 
            altText.toLowerCase() === term
          );
          
          expect(isGeneric).toBe(false);
        }
      }
    });
  });
  
  test('profile images have descriptive alt text', () => {
    const filePath = path.join(__dirname, '..', 'index.html');
    
    if (!fs.existsSync(filePath)) {
      return;
    }
    
    const html = fs.readFileSync(filePath, 'utf-8');
    
    // Find profile/hero image
    const heroImageMatch = html.match(/<img[^>]*class=["'][^"']*hero-image[^"']*["'][^>]*>/i);
    
    if (heroImageMatch) {
      const imgTag = heroImageMatch[0];
      
      // Should have alt attribute
      expect(imgTag).toMatch(/alt=["'][^"']+["']/);
      
      // Extract alt text
      const altMatch = imgTag.match(/alt=["']([^"']*)["']/);
      
      if (altMatch) {
        const altText = altMatch[1];
        
        // Should be descriptive and include name or role
        expect(altText.length).toBeGreaterThan(10);
        
        // Should contain meaningful information
        const hasMeaningfulContent = /Dr\.|Professor|Assistant|Thao|Le/i.test(altText);
        expect(hasMeaningfulContent).toBe(true);
      }
    }
  });
  
  test('decorative images can have empty alt', () => {
    htmlFiles.forEach(filename => {
      const filePath = path.join(__dirname, '..', filename);
      
      if (!fs.existsSync(filePath)) {
        return;
      }
      
      const html = fs.readFileSync(filePath, 'utf-8');
      
      // Extract all img tags
      const imgRegex = /<img[^>]*>/gi;
      let match;
      
      while ((match = imgRegex.exec(html)) !== null) {
        const imgTag = match[0];
        
        // Check if image has role="presentation" or aria-hidden="true"
        const isDecorative = /role=["']presentation["']/.test(imgTag) ||
                           /aria-hidden=["']true["']/.test(imgTag);
        
        if (isDecorative) {
          // Decorative images can have empty alt
          const altMatch = imgTag.match(/alt=["']([^"']*)["']/);
          
          if (altMatch) {
            // Empty alt is acceptable for decorative images
            expect(altMatch[1]).toBeDefined();
          }
        }
      }
    });
  });
});

/**
 * Property 7: Touch target sizing
 * Feature: academic-website-modernization, Property 7: Touch target sizing
 * Validates: Requirements 4.5
 * 
 * For any interactive element on mobile viewports (width < 768px), 
 * the element should have a minimum touch target size of 44x44 pixels
 */
describe('Property 7: Touch target sizing', () => {
  const htmlFiles = [
    'index.html',
    'publications.html',
    'awards.html',
    'teaching.html',
    'outreach.html',
    'news.html',
    'resume.html'
  ];
  
  test('social links have minimum touch target size', () => {
    const filePath = path.join(__dirname, '..', 'index.html');
    
    if (!fs.existsSync(filePath)) {
      return;
    }
    
    const html = fs.readFileSync(filePath, 'utf-8');
    
    // Check CSS for social-link class
    const cssFiles = ['css/components.css'];
    
    cssFiles.forEach(cssFile => {
      const cssPath = path.join(__dirname, '..', cssFile);
      
      if (!fs.existsSync(cssPath)) {
        return;
      }
      
      const css = fs.readFileSync(cssPath, 'utf-8');
      
      // Check if social-link has min-height defined
      const socialLinkMatch = css.match(/\.social-link\s*{[^}]*}/s);
      
      if (socialLinkMatch) {
        const socialLinkCss = socialLinkMatch[0];
        
        // Should have min-height of at least 44px
        const minHeightMatch = socialLinkCss.match(/min-height:\s*(\d+)px/);
        
        if (minHeightMatch) {
          const minHeight = parseInt(minHeightMatch[1]);
          expect(minHeight).toBeGreaterThanOrEqual(44);
        }
      }
    });
  });
  
  test('navigation links have adequate touch targets', () => {
    htmlFiles.forEach(filename => {
      const filePath = path.join(__dirname, '..', filename);
      
      if (!fs.existsSync(filePath)) {
        return;
      }
      
      const html = fs.readFileSync(filePath, 'utf-8');
      
      // Navigation links should have adequate padding
      // Check CSS for nav-link class
      const cssPath = path.join(__dirname, '..', 'css/components.css');
      
      if (!fs.existsSync(cssPath)) {
        return;
      }
      
      const css = fs.readFileSync(cssPath, 'utf-8');
      
      // Check if nav-link has padding defined
      const navLinkMatch = css.match(/\.nav-link\s*{[^}]*}/s);
      
      if (navLinkMatch) {
        const navLinkCss = navLinkMatch[0];
        
        // Should have padding to ensure adequate touch target
        expect(navLinkCss).toMatch(/padding/);
      }
    });
  });
  
  test('buttons have minimum touch target size', () => {
    htmlFiles.forEach(filename => {
      const filePath = path.join(__dirname, '..', filename);
      
      if (!fs.existsSync(filePath)) {
        return;
      }
      
      const html = fs.readFileSync(filePath, 'utf-8');
      
      // Extract button elements
      const buttonRegex = /<button[^>]*>/gi;
      let match;
      
      while ((match = buttonRegex.exec(html)) !== null) {
        const buttonTag = match[0];
        
        // Buttons should have appropriate classes for sizing
        // Bootstrap buttons have adequate sizing by default
        const hasButtonClass = /class=["'][^"']*btn[^"']*["']/.test(buttonTag);
        const hasNavbarToggler = /class=["'][^"']*navbar-toggler[^"']*["']/.test(buttonTag);
        
        // Should have either btn or navbar-toggler class
        expect(hasButtonClass || hasNavbarToggler).toBe(true);
      }
    });
  });
  
  test('interactive elements are not too small', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...htmlFiles),
        (filename) => {
          const filePath = path.join(__dirname, '..', filename);
          
          if (!fs.existsSync(filePath)) {
            return true;
          }
          
          const html = fs.readFileSync(filePath, 'utf-8');
          
          // Check for inline styles that might make elements too small
          const styleRegex = /style=["']([^"']*)["']/gi;
          let match;
          
          while ((match = styleRegex.exec(html)) !== null) {
            const style = match[1];
            
            // Check for very small widths or heights
            const widthMatch = style.match(/width:\s*(\d+)px/);
            const heightMatch = style.match(/height:\s*(\d+)px/);
            
            if (widthMatch) {
              const width = parseInt(widthMatch[1]);
              // If it's an interactive element, width should be reasonable
              // We'll check if it's less than 20px (too small for touch)
              if (width < 20 && width > 0) {
                // This might be too small, but we'll allow it for decorative elements
                // Just ensure it's not a link or button
                const context = html.substring(Math.max(0, match.index - 100), match.index + 100);
                const isInteractive = /<a[^>]*style=["'][^"']*width:\s*\d+px/.test(context) ||
                                     /<button[^>]*style=["'][^"']*width:\s*\d+px/.test(context);
                
                if (isInteractive) {
                  expect(width).toBeGreaterThanOrEqual(20);
                }
              }
            }
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
