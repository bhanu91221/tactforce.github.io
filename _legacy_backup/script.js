/**
 * script.js
 * Handles smooth scrolling and mobile menu toggle.
 * Form submission is now handled by standard HTML behavior.
 */

document.addEventListener('DOMContentLoaded', () => {
  const headerHeight = document.getElementById('main-header')?.offsetHeight || 80; // Use header height or default

  // --- Smooth Scrolling ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href && href.length > 1 && href.startsWith('#')) {
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          e.preventDefault(); // Prevent default jump for internal links only
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = window.pageYOffset + elementPosition - headerHeight;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
          closeMobileMenu(); // Close menu on link click
        }
      }
      // Allow default behavior for external links or links without a valid target ID
    });
  });

  // --- Mobile Menu Toggle ---
  const menuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
      const isExpanded = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', !isExpanded);
    });
  }

  function closeMobileMenu() {
    if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
      mobileMenu.classList.add('hidden');
      if (menuButton) {
        menuButton.setAttribute('aria-expanded', 'false');
      }
    }
  }

  // --- Contact Form Submission Handling ---
  // Removed: The JavaScript fetch logic has been deleted.
  // The form will now submit using standard HTML behavior,
  // redirecting to the URL specified in the 'retURL' hidden input field.

});
