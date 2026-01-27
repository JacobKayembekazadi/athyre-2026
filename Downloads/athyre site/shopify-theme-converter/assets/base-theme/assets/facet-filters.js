/**
 * Facet Filters Form Component
 * Handles AJAX collection filtering
 */

class FacetFiltersForm extends HTMLElement {
  constructor() {
    super();
    this.form = this.querySelector('form');
    this.sectionId = this.dataset.section;
    this.debouncedSubmit = this.debounce(this.onSubmit.bind(this), 500);
  }

  connectedCallback() {
    this.form?.addEventListener('input', this.debouncedSubmit);

    // Handle price range inputs separately (submit on blur)
    this.form?.querySelectorAll('input[type="number"]').forEach(input => {
      input.addEventListener('change', this.debouncedSubmit);
    });
  }

  async onSubmit(event) {
    const formData = new FormData(this.form);
    const searchParams = new URLSearchParams(formData);

    // Preserve sort order
    const currentUrl = new URL(window.location.href);
    const sortBy = currentUrl.searchParams.get('sort_by');
    if (sortBy) searchParams.set('sort_by', sortBy);

    await this.renderPage(searchParams.toString());
  }

  async renderPage(searchParams) {
    const url = `${window.location.pathname}?section_id=${this.sectionId}&${searchParams}`;

    document.body.classList.add('is-filtering');
    this.setLoading(true);

    try {
      const response = await fetch(url);
      const html = await response.text();

      this.renderFilters(html);
      this.renderProductGrid(html);
      this.renderProductCount(html);
      this.renderActiveFilters(html);
      this.renderPagination(html);
      this.updateUrl(searchParams);

    } catch (error) {
      console.error('Error filtering:', error);
    } finally {
      document.body.classList.remove('is-filtering');
      this.setLoading(false);
    }
  }

  renderFilters(html) {
    const parsed = new DOMParser().parseFromString(html, 'text/html');
    const newFilters = parsed.querySelector('.collection-filters form');
    if (newFilters && this.form) {
      // Preserve scroll position of filter sidebar
      const scrollPos = this.scrollTop;
      this.form.innerHTML = newFilters.innerHTML;
      this.scrollTop = scrollPos;
    }
  }

  renderProductGrid(html) {
    const parsed = new DOMParser().parseFromString(html, 'text/html');
    const newGrid = parsed.querySelector('[data-collection-products]');
    const currentGrid = document.querySelector('[data-collection-products]');
    if (newGrid && currentGrid) {
      currentGrid.innerHTML = newGrid.innerHTML;

      // Scroll to top of grid on mobile
      if (window.innerWidth < 990) {
        currentGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  renderProductCount(html) {
    const parsed = new DOMParser().parseFromString(html, 'text/html');
    const newCount = parsed.querySelector('.collection-count');
    const currentCount = document.querySelector('.collection-count');
    if (newCount && currentCount) {
      currentCount.innerHTML = newCount.innerHTML;
    }
  }

  renderActiveFilters(html) {
    const parsed = new DOMParser().parseFromString(html, 'text/html');
    const newActiveFilters = parsed.querySelector('.active-filters');
    const currentActiveFilters = document.querySelector('.active-filters');

    if (newActiveFilters) {
      if (currentActiveFilters) {
        currentActiveFilters.innerHTML = newActiveFilters.innerHTML;
      } else {
        // Insert before product grid
        const grid = document.querySelector('[data-collection-products]');
        grid?.parentElement?.insertBefore(newActiveFilters.cloneNode(true), grid);
      }
    } else if (currentActiveFilters) {
      currentActiveFilters.remove();
    }
  }

  renderPagination(html) {
    const parsed = new DOMParser().parseFromString(html, 'text/html');
    const newPagination = parsed.querySelector('.pagination');
    const currentPagination = document.querySelector('.pagination');

    if (newPagination) {
      if (currentPagination) {
        currentPagination.innerHTML = newPagination.innerHTML;
      } else {
        const grid = document.querySelector('[data-collection-products]');
        grid?.parentElement?.appendChild(newPagination.cloneNode(true));
      }
    } else if (currentPagination) {
      currentPagination.remove();
    }
  }

  updateUrl(searchParams) {
    const url = `${window.location.pathname}${searchParams ? '?' + searchParams : ''}`;
    history.pushState({}, '', url);
  }

  setLoading(loading) {
    const grid = document.querySelector('[data-collection-products]');
    grid?.classList.toggle('is-loading', loading);

    // Show loading overlay
    let overlay = document.querySelector('.filter-loading-overlay');
    if (loading && !overlay) {
      overlay = document.createElement('div');
      overlay.className = 'filter-loading-overlay';
      overlay.innerHTML = '<div class="loading-spinner"></div>';
      grid?.appendChild(overlay);
    } else if (!loading && overlay) {
      overlay.remove();
    }
  }

  debounce(fn, delay) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
  }
}

customElements.define('facet-filters-form', FacetFiltersForm);

/**
 * Active Filter Tags
 * Handle removal of active filters
 */
document.addEventListener('click', async (e) => {
  const filterTag = e.target.closest('.active-filter-tag');
  if (!filterTag) return;

  e.preventDefault();
  const removeUrl = filterTag.getAttribute('href');

  if (removeUrl) {
    // Parse the URL to get search params
    const url = new URL(removeUrl, window.location.origin);
    const searchParams = url.searchParams.toString();

    // Find and trigger the facet form
    const facetForm = document.querySelector('facet-filters-form');
    if (facetForm) {
      await facetForm.renderPage(searchParams);
    } else {
      // Fallback to page navigation
      window.location.href = removeUrl;
    }
  }
});

/**
 * Clear All Filters
 */
document.addEventListener('click', async (e) => {
  const clearButton = e.target.closest('.active-filter-clear');
  if (!clearButton) return;

  e.preventDefault();
  const clearUrl = clearButton.getAttribute('href');

  if (clearUrl) {
    const url = new URL(clearUrl, window.location.origin);
    const searchParams = url.searchParams.toString();

    const facetForm = document.querySelector('facet-filters-form');
    if (facetForm) {
      await facetForm.renderPage(searchParams);
    } else {
      window.location.href = clearUrl;
    }
  }
});

/**
 * Handle browser back/forward
 */
window.addEventListener('popstate', () => {
  const searchParams = new URLSearchParams(window.location.search);
  const facetForm = document.querySelector('facet-filters-form');

  if (facetForm) {
    facetForm.renderPage(searchParams.toString());
  }
});
