/**
 * Navigation JavaScript for Academic Website
 * Implements scroll behavior and navbar transitions
 */

(function() {
    'use strict';

    // Navbar background transition on scroll
    function initNavbarScrollBehavior() {
        const navbar = document.querySelector('.navbar');
        
        if (!navbar) return;

        function updateNavbarOnScroll() {
            if (window.scrollY > 50) {
                navbar.classList.add('navbar-scrolled');
            } else {
                navbar.classList.remove('navbar-scrolled');
            }
        }

        // Initial check
        updateNavbarOnScroll();

        // Listen for scroll events
        window.addEventListener('scroll', updateNavbarOnScroll, { passive: true });
    }

    // Smooth scroll behavior for anchor links
    function initSmoothScroll() {
        // Get all anchor links that start with #
        const anchorLinks = document.querySelectorAll('a[href^="#"]');

        anchorLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                // Skip if it's just "#" or empty
                if (!href || href === '#') return;

                const targetElement = document.querySelector(href);
                
                if (targetElement) {
                    e.preventDefault();
                    
                    // Calculate offset for fixed navbar
                    const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 0;
                    const targetPosition = targetElement.offsetTop - navbarHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // Auto-close mobile menu when clicking a link
    function initMobileMenuAutoClose() {
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
        const navbarCollapse = document.querySelector('.navbar-collapse');
        
        if (!navbarCollapse) return;

        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                // Check if we're in mobile view (collapse is shown)
                if (navbarCollapse.classList.contains('show')) {
                    const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
                    if (bsCollapse) {
                        bsCollapse.hide();
                    }
                }
            });
        });
    }

    // Initialize all navigation features when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initNavbarScrollBehavior();
            initSmoothScroll();
            initMobileMenuAutoClose();
        });
    } else {
        // DOM is already ready
        initNavbarScrollBehavior();
        initSmoothScroll();
        initMobileMenuAutoClose();
    }
})();
