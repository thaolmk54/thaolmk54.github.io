/**
 * Property-Based Tests for Navigation Component
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

// Helper to extract attribute value from HTML
function extractAttribute(html, element, attribute) {
  const regex = new RegExp(`<${element}[^>]*${attribute}=["']([^"']*)["']`, 'i');
  const match = html.match(regex);
  return match ? match[1] : null;
}

// Helper to check if element has class
function hasClass(html, element, className) {
  const regex = new RegExp(`<${element}[^>]*class=["'][^"']*${className}[^"']*["']`, 'i');
  return regex.test(html);
}

/**
 * Property 1: Responsive navigation behavior
 * Feature: academic-website-modernization, Property 1: Responsive navigation behavior
 * Validates: Requirements 2.1, 2.2
 * 
 * For any viewport width, the navigation system should display either 
 * the full horizontal menu (desktop) or the collapsible hamburger menu (mobile) 
 * based on Bootstrap's breakpoint thresholds
 */
describe('Property 1: Responsive navigation behavior', () => {
  const htmlFiles = [
    'index.html',
    'publications.html',
    'awards.html',
    'teaching.html',
    'outreach.html',
    'news.html',
    'resume.html'
  ];
  
  test('all pages have responsive navbar structure', () => {
    htmlFiles.forEach(filename => {
      const filePath = path.join(__dirname, '..', filename);
      
      if (!fs.existsSync(filePath)) {
        console.warn(`File ${filename} not found, skipping test`);
        return;
      }
      
      const html = fs.readFileSync(filePath, 'utf-8');
      
      // Verify navbar has responsive class
      expect(htmlContains(html, 'navbar-expand-lg')).toBe(true);
      
      // Verify navbar toggler exists
      expect(htmlContains(html, 'navbar-toggler')).toBe(true);
      
      // Verify collapse element exists
      expect(htmlContains(html, 'navbar-collapse')).toBe(true);
      expect(htmlContains(html, 'collapse')).toBe(true);
    });
  });
  
  test('hamburger menu has correct Bootstrap 5 attributes', () => {
    htmlFiles.forEach(filename => {
      const filePath = path.join(__dirname, '..', filename);
      
      if (!fs.existsSync(filePath)) {
        return;
      }
      
      const html = fs.readFileSync(filePath, 'utf-8');
      
      // Verify Bootstrap 5 data attributes (not Bootstrap 4)
      expect(htmlContains(html, 'data-bs-toggle="collapse"')).toBe(true);
      expect(htmlContains(html, 'data-bs-target="#navbarResponsive"')).toBe(true);
      
      // Should NOT have Bootstrap 4 attributes
      expect(htmlContains(html, 'data-toggle="collapse"')).toBe(false);
      expect(htmlContains(html, 'data-target="#navbarResponsive"')).toBe(false);
    });
  });
  
  test('navigation uses Bootstrap 5 spacing classes', () => {
    htmlFiles.forEach(filename => {
      const filePath = path.join(__dirname, '..', filename);
      
      if (!fs.existsSync(filePath)) {
        return;
      }
      
      const html = fs.readFileSync(filePath, 'utf-8');
      
      // Should use Bootstrap 5 ms-auto (margin-start-auto)
      expect(hasClass(html, 'ul', 'ms-auto')).toBe(true);
      
      // Should NOT use Bootstrap 4 ml-auto (margin-left-auto)
      expect(hasClass(html, 'ul', 'ml-auto')).toBe(false);
    });
  });
  
  test('navbar brand is present and visible', () => {
    htmlFiles.forEach(filename => {
      const filePath = path.join(__dirname, '..', filename);
      
      if (!fs.existsSync(filePath)) {
        return;
      }
      
      const html = fs.readFileSync(filePath, 'utf-8');
      
      // Verify navbar brand exists
      expect(htmlContains(html, 'navbar-brand')).toBe(true);
      expect(htmlContains(html, 'Dr. Thao Minh Le')).toBe(true);
    });
  });
});

/**
 * Verify all HTML pages have consistent navigation structure
 */
describe('Navigation consistency across pages', () => {
  const htmlFiles = [
    'index.html',
    'publications.html',
    'awards.html',
    'teaching.html',
    'outreach.html',
    'news.html',
    'resume.html'
  ];
  
  test.each(htmlFiles)('%s has correct navigation structure', (filename) => {
    const filePath = path.join(__dirname, '..', filename);
    
    // Skip if file doesn't exist
    if (!fs.existsSync(filePath)) {
      console.warn(`File ${filename} not found, skipping test`);
      return;
    }
    
    const html = fs.readFileSync(filePath, 'utf-8');
    
    // Check for navbar
    expect(htmlContains(html, '<nav class="navbar')).toBe(true);
    
    // Check for Bootstrap 5 attributes
    expect(htmlContains(html, 'data-bs-toggle="collapse"')).toBe(true);
    expect(htmlContains(html, 'data-toggle=')).toBe(false);
    
    // Check for Bootstrap 5 spacing classes
    expect(hasClass(html, 'ul', 'ms-auto')).toBe(true);
    expect(hasClass(html, 'ul', 'ml-auto')).toBe(false);
    
    // Check for navbar brand
    expect(htmlContains(html, 'navbar-brand')).toBe(true);
    expect(htmlContains(html, 'Dr. Thao Minh Le')).toBe(true);
    
    // Check for navigation.js script
    expect(htmlContains(html, 'src="js/navigation.js"')).toBe(true);
  });
});
