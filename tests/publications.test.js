/**
 * Property-Based Tests for Publications Page
 * Feature: academic-website-modernization
 */

const fc = require('fast-check');
const fs = require('fs');
const path = require('path');

// Helper to extract all publication entries from HTML
function extractPublicationEntries(html) {
  const entryRegex = /<article[^>]*class="[^"]*publication-entry[^"]*"[^>]*>([\s\S]*?)<\/article>/gi;
  const entries = [];
  let match;
  
  while ((match = entryRegex.exec(html)) !== null) {
    entries.push(match[1]);
  }
  
  return entries;
}

// Helper to check if HTML contains a pattern
function htmlContains(html, pattern) {
  if (typeof pattern === 'string') {
    return html.includes(pattern);
  }
  return pattern.test(html);
}

// Helper to extract text content from HTML
function extractTextContent(html, className) {
  const regex = new RegExp(`<[^>]*class="[^"]*${className}[^"]*"[^>]*>([\\s\\S]*?)<\\/[^>]+>`, 'i');
  const match = html.match(regex);
  return match ? match[1].trim() : null;
}

/**
 * Property 3: Publication structure completeness
 * Feature: academic-website-modernization, Property 3: Publication structure completeness
 * Validates: Requirements 3.2
 * 
 * For any publication entry on the publications page, the entry should contain 
 * all required fields: title, authors, venue, and year
 */
describe('Property 3: Publication structure completeness', () => {
  const publicationsFile = path.join(__dirname, '..', 'publications.html');
  
  test('all publication entries have required fields', () => {
    // Check if file exists
    if (!fs.existsSync(publicationsFile)) {
      throw new Error('publications.html not found');
    }
    
    const html = fs.readFileSync(publicationsFile, 'utf-8');
    const entries = extractPublicationEntries(html);
    
    // Should have at least some publications
    expect(entries.length).toBeGreaterThan(0);
    
    fc.assert(
      fc.property(
        fc.constantFrom(...entries), // Pick a random publication entry
        (entry) => {
          // Check for authors
          const hasAuthors = htmlContains(entry, 'class="publication-authors"');
          expect(hasAuthors).toBe(true);
          
          // Check for title
          const hasTitle = htmlContains(entry, 'class="publication-title"');
          expect(hasTitle).toBe(true);
          
          // Check for venue
          const hasVenue = htmlContains(entry, 'class="publication-venue"');
          expect(hasVenue).toBe(true);
          
          // Extract and verify content is not empty
          const authorsContent = extractTextContent(entry, 'publication-authors');
          const titleContent = extractTextContent(entry, 'publication-title');
          const venueContent = extractTextContent(entry, 'publication-venue');
          
          // Authors should not be empty
          expect(authorsContent).toBeTruthy();
          expect(authorsContent.length).toBeGreaterThan(0);
          
          // Title should not be empty
          expect(titleContent).toBeTruthy();
          expect(titleContent.length).toBeGreaterThan(0);
          
          // Venue should not be empty and contain year
          expect(venueContent).toBeTruthy();
          expect(venueContent.length).toBeGreaterThan(0);
          
          // Venue should contain a year (4 digits)
          const yearMatch = venueContent.match(/\b(19|20)\d{2}\b/);
          expect(yearMatch).toBeTruthy();
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('publication entries use semantic HTML article elements', () => {
    const html = fs.readFileSync(publicationsFile, 'utf-8');
    
    // Check that publications use article elements
    expect(htmlContains(html, '<article')).toBe(true);
    expect(htmlContains(html, 'class="publication-entry"')).toBe(true);
    
    // Check that sections use section elements
    expect(htmlContains(html, '<section')).toBe(true);
    expect(htmlContains(html, 'class="publication-section"')).toBe(true);
    
    // Check that main content uses main element
    expect(htmlContains(html, '<main')).toBe(true);
  });
  
  test('publication titles are properly structured as headings', () => {
    const html = fs.readFileSync(publicationsFile, 'utf-8');
    const entries = extractPublicationEntries(html);
    
    fc.assert(
      fc.property(
        fc.constantFrom(...entries),
        (entry) => {
          // Title should be in an h3 element
          const hasH3Title = htmlContains(entry, '<h3 class="publication-title"');
          expect(hasH3Title).toBe(true);
          
          // Title should contain a link
          const titleContent = extractTextContent(entry, 'publication-title');
          if (titleContent) {
            // Most publications should have links (some might not)
            // Just verify the structure is correct if link exists
            if (entry.includes('<a href=')) {
              expect(htmlContains(entry, 'target="_blank"')).toBe(true);
              expect(htmlContains(entry, 'rel="noopener noreferrer"')).toBe(true);
            }
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('publication sections are properly grouped by type', () => {
    const html = fs.readFileSync(publicationsFile, 'utf-8');
    
    // Check for expected publication type sections
    const expectedSections = [
      'Journal Papers',
      'Conference Proceedings',
      'Workshop Papers',
      'Tutorials'
    ];
    
    expectedSections.forEach(sectionName => {
      // Check that section heading exists
      const hasSectionHeading = htmlContains(html, new RegExp(`<h2[^>]*class="[^"]*section-heading[^"]*"[^>]*>[^<]*${sectionName}`, 'i'));
      expect(hasSectionHeading).toBe(true);
    });
  });
  
  test('current author is highlighted in author lists', () => {
    const html = fs.readFileSync(publicationsFile, 'utf-8');
    const entries = extractPublicationEntries(html);
    
    fc.assert(
      fc.property(
        fc.constantFrom(...entries),
        (entry) => {
          // Each entry should have current author highlighted
          const hasCurrentAuthor = htmlContains(entry, 'class="current-author"');
          expect(hasCurrentAuthor).toBe(true);
          
          // Current author should be within authors section
          const authorsSection = entry.match(/<p[^>]*class="[^"]*publication-authors[^"]*"[^>]*>([\s\S]*?)<\/p>/i);
          if (authorsSection) {
            expect(htmlContains(authorsSection[1], 'class="current-author"')).toBe(true);
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('publication entries have consistent data attributes', () => {
    const html = fs.readFileSync(publicationsFile, 'utf-8');
    
    // Extract all article elements
    const articleRegex = /<article[^>]*>/gi;
    const articles = html.match(articleRegex) || [];
    
    fc.assert(
      fc.property(
        fc.constantFrom(...articles),
        (article) => {
          // Each article should have data-pub-type attribute
          const hasDataType = htmlContains(article, 'data-pub-type=');
          expect(hasDataType).toBe(true);
          
          // Valid publication types
          const validTypes = ['journal', 'conference', 'workshop', 'tutorial'];
          const typeMatch = article.match(/data-pub-type="([^"]+)"/);
          
          if (typeMatch) {
            expect(validTypes).toContain(typeMatch[1]);
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  test('all external links have proper security attributes', () => {
    const html = fs.readFileSync(publicationsFile, 'utf-8');
    const entries = extractPublicationEntries(html);
    
    fc.assert(
      fc.property(
        fc.constantFrom(...entries),
        (entry) => {
          // Extract all links
          const linkRegex = /<a[^>]*href="http[^"]*"[^>]*>/gi;
          const links = entry.match(linkRegex) || [];
          
          links.forEach(link => {
            // External links should have target="_blank"
            expect(htmlContains(link, 'target="_blank"')).toBe(true);
            
            // External links should have rel="noopener noreferrer"
            expect(htmlContains(link, 'rel="noopener noreferrer"')).toBe(true);
          });
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
