# Dr. Thao Minh Le - Academic Portfolio Website

Professional academic portfolio website showcasing research, publications, teaching, and outreach activities.

**Live Site:** [thaolmk54.github.io](https://thaolmk54.github.io)

## Technology Stack

### Frontend Framework
- **Bootstrap 5.3.x** (upgraded from Bootstrap 4.3.1)
- Modern CSS with CSS custom properties for theming
- Vanilla JavaScript (jQuery dependency removed)

### CSS Architecture
The site uses a modular CSS architecture with the following structure:
- `css/variables.css` - CSS custom properties for colors, typography, and spacing
- `css/base.css` - Reset and base styles
- `css/components.css` - Reusable component styles
- `css/utilities.css` - Utility classes
- `css/portfolio-item.css` - Legacy styles (maintained for compatibility)

### Typography & Icons
- **Google Fonts:** Inter (body text) and Crimson Pro (headings)
- **Bootstrap Icons 1.11.x** - Modern, consistent icon set
- **Font Awesome 6.x** - Social media icons (upgraded from 4.7.0)

### Build System
- **Gulp 4.x** - Build automation
- **Browser-sync** - Live reload development server
- **Jekyll** - Static site generation (via GitHub Pages)

### Testing
- **Jest** - JavaScript testing framework
- **fast-check** - Property-based testing library
- **jsdom** - DOM testing environment
- **@testing-library/dom** - DOM testing utilities

### Hosting
- **GitHub Pages** with Jekyll support

## Development

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Ruby and Bundler (for Jekyll)

### Installation

Install Node.js dependencies:
```bash
npm install
```

Install Jekyll dependencies:
```bash
bundle install
```

### Development Server

Start the development server with live reload:
```bash
gulp dev
```

This starts browser-sync on port 3000 (default) and watches for changes to HTML and CSS files.

### Build Commands

Build the project (vendor files + CSS minification):
```bash
npm run build
```

Copy vendor files from node_modules:
```bash
npm run vendor
# or
gulp vendor
```

Minify CSS:
```bash
npm run css
# or
gulp css
```

Clean old vendor files (removes jQuery):
```bash
gulp clean
```

### Testing Commands

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Generate test coverage report:
```bash
npm run test:coverage
```

## Project Structure

```
├── index.html              # Homepage with bio and latest news
├── publications.html       # Research publications
├── awards.html            # Grants and awards
├── teaching.html          # Teaching experience
├── outreach.html          # Outreach activities
├── news.html              # News archive
├── resume.html            # Resume/CV page
├── css/                   # Stylesheets
│   ├── variables.css      # CSS custom properties
│   ├── base.css          # Base styles
│   ├── components.css    # Component styles
│   └── utilities.css     # Utility classes
├── js/                    # JavaScript files
│   └── navigation.js     # Navigation behavior
├── img/                   # Images and photos
├── resources/            # Downloadable resources
│   ├── cv/              # CV/resume PDFs
│   └── slides/          # Presentation slides
├── tests/               # Test files
└── vendor/              # Third-party libraries
```

## Key Features

### Modern Design
- Contemporary academic website design following current best practices
- Professional color scheme and typography
- Responsive layout optimized for all devices
- Smooth transitions and subtle animations

### Accessibility
- WCAG AA compliant color contrast
- Keyboard navigation support
- Screen reader friendly with semantic HTML and ARIA labels
- Alt text for all images
- Visible focus indicators

### Performance
- Optimized image loading with lazy loading
- Minimized external requests
- Font loading optimization with font-display: swap
- Layout shift prevention with explicit image dimensions

### Responsive Design
- Mobile-first approach
- Collapsible navigation on mobile devices
- Fluid layouts that adapt to any screen size
- Touch-friendly interactive elements (44x44px minimum)

## Browser Support

- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Mobile Safari (iOS 13+)
- Chrome Mobile (Android 8+)

## Migration from Bootstrap 4 to Bootstrap 5

Key changes implemented:
- Removed jQuery dependency (now using vanilla JavaScript)
- Updated class names (e.g., `ml-auto` → `ms-auto`, `mr-*` → `me-*`)
- Updated data attributes (e.g., `data-toggle` → `data-bs-toggle`)
- Updated JavaScript initialization for Bootstrap components
- Modernized navigation component with Bootstrap 5 syntax

## Testing

The project includes comprehensive test coverage:
- **Unit tests** - Verify specific functionality and edge cases
- **Property-based tests** - Verify universal properties across all inputs
- **Accessibility tests** - Ensure WCAG compliance
- **Performance tests** - Verify loading and rendering performance
- **Layout tests** - Verify responsive behavior
- **Validation tests** - Verify HTML5 validity

Run the test suite to verify all functionality:
```bash
npm test
```

## Deployment

The site is automatically deployed via GitHub Pages when changes are pushed to the main branch. GitHub Pages handles Jekyll compilation automatically.

No explicit build step is needed for deployment.

## License

Original template: Copyright 2013-2018 Blackrock Digital LLC. Code released under the [MIT](https://github.com/BlackrockDigital/startbootstrap-portfolio-item/blob/gh-pages/LICENSE) license.

Site content and modifications: © Dr. Thao Minh Le
