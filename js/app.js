
// Expose content to Alpine.js
document.addEventListener('alpine:init', () => {
    Alpine.data('site', () => ({
        content: window.siteContent,
        mobileMenuOpen: false,
        toggleMenu() {
            this.mobileMenuOpen = !this.mobileMenuOpen;
        }
    }));
});

// Smooth Scroll (Lenis) - Loaded via CDN in index.html, initialized here if window.Lenis exists
// Smooth Scroll (Lenis) - DISABLED for performance. Using native CSS scroll-behavior: smooth
const initSmoothScroll = () => {
    // Native smooth scrolling is handled by 'scroll-smooth' class on <html> tag
    console.log("Using native smooth scrolling");
};

// Scroll Reveal Animation
const initScrollReveal = () => {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Check only once
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => {
        observer.observe(el);
    });
};

window.initScrollReveal = initScrollReveal;

// Start
document.addEventListener('DOMContentLoaded', () => {
    // Wait for external scripts if necessary, but DOMContentLoaded usually fine.
    // Lenis is loaded via script tag, might need a slight delay or check.
    setTimeout(initSmoothScroll, 100); 
    initScrollReveal();
    console.log("TactForce App Initialized");
});
