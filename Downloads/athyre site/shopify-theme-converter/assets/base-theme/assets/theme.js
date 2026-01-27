// Theme JavaScript
document.addEventListener('DOMContentLoaded', () => {
  // Initialize components
  initMobileMenu();
  initAccordions();
});

// Mobile Menu Toggle
function initMobileMenu() {
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-mobile-menu]');
  
  if (!toggle || !menu) return;
  
  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', isOpen);
  });
}

// Accordion/Collapsible
function initAccordions() {
  const triggers = document.querySelectorAll('[data-accordion-trigger]');
  
  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const content = trigger.nextElementSibling;
      const isOpen = trigger.classList.toggle('is-open');
      
      trigger.setAttribute('aria-expanded', isOpen);
      content.style.maxHeight = isOpen ? content.scrollHeight + 'px' : '0';
    });
  });
}

// Cart AJAX (optional utility)
async function addToCart(variantId, quantity = 1) {
  const response = await fetch('/cart/add.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: variantId, quantity })
  });
  
  return response.json();
}

// Update cart count
async function updateCartCount() {
  const response = await fetch('/cart.js');
  const cart = await response.json();
  
  document.querySelectorAll('[data-cart-count]').forEach(el => {
    el.textContent = cart.item_count;
  });
}
