/**
 * Filter Search Functionality for ScentSense
 * Allows users to search for scents directly from the filter section
 */
document.addEventListener('DOMContentLoaded', function() {
  // Get search elements
  const searchInput = document.getElementById('filterSearchInput');
  const searchBtn = searchInput ? searchInput.nextElementSibling : null;
  const productCards = document.querySelectorAll('.product-card');
  
  // If search elements exist, set up the search functionality
  if (searchInput && searchBtn) {
    // Add event listener to the search button
    searchBtn.addEventListener('click', function(e) {
      e.preventDefault();
      performSearch();
    });
    
    // Add event listener for Enter key in the search input
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        performSearch();
      }
    });
    
    // Add event listener for input to search as user types
    searchInput.addEventListener('input', function() {
      // Debounce the search to avoid too many searches while typing
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        performSearch();
      }, 300); // Wait 300ms after user stops typing
    });
    
    // Function to perform the search
    function performSearch() {
      const searchTerm = searchInput.value.trim().toLowerCase();
      
      // If search term is empty, show all products
      if (searchTerm === '') {
        resetSearch();
        return;
      }
      
      // Hide all products initially
      productCards.forEach(card => {
        card.classList.add('hidden');
      });
      
      // Track visible sections and product types
      const visibleSections = new Set();
      const visibleProductTypes = new Set();
      
      // Show products that match the search term
      let hasResults = false;
      
      productCards.forEach(card => {
        // Get all text content from the product card to ensure we catch all relevant information
        const allText = card.textContent.toLowerCase();
        // Also try to get specific elements if they exist
        const brand = card.querySelector('.product-info p')?.textContent.toLowerCase() || '';
        const name = card.querySelector('.product-info h4')?.textContent.toLowerCase() || '';
        const imgAlt = card.querySelector('img')?.alt?.toLowerCase() || '';
        const productText = allText + ' ' + brand + ' ' + name + ' ' + imgAlt;
        
        // If the product matches the search term
        if (productText.includes(searchTerm)) {
          card.classList.remove('hidden');
          hasResults = true;
          
          // Mark the section as visible
          const section = card.closest('section');
          if (section) {
            visibleSections.add(section.id);
          }
          
          // Mark the product type as visible
          const productContainer = card.closest('.products');
          if (productContainer) {
            let prevElement = productContainer.previousElementSibling;
            while (prevElement) {
              if (prevElement.tagName === 'H2') {
                visibleProductTypes.add(prevElement);
                break;
              }
              prevElement = prevElement.previousElementSibling;
            }
          }
        }
      });
      
      // Show or hide sections based on search results
      document.querySelectorAll('section').forEach(section => {
        if (visibleSections.has(section.id)) {
          section.classList.remove('hidden');
          
          // Show the section heading
          const sectionHeading = section.querySelector('h1');
          if (sectionHeading) {
            sectionHeading.classList.remove('hidden');
          }
        } else {
          section.classList.add('hidden');
        }
      });
      
      // Show or hide product type headings based on search results
      document.querySelectorAll('h2').forEach(heading => {
        if (visibleProductTypes.has(heading)) {
          heading.classList.remove('hidden');
        } else {
          heading.classList.add('hidden');
        }
      });
      
      // Show a message if no results were found
      const noResultsMessage = document.getElementById('noResultsMessage');
      if (!hasResults) {
        if (!noResultsMessage) {
          const message = document.createElement('div');
          message.id = 'noResultsMessage';
          message.className = 'no-results-message';
          message.textContent = `No scents found matching "${searchTerm}". Try a different search term.`;
          
          // Insert after the filter container
          const filterContainer = document.querySelector('.filter-container');
          if (filterContainer) {
            filterContainer.parentNode.insertBefore(message, filterContainer.nextSibling);
          }
        }
      } else if (noResultsMessage) {
        noResultsMessage.remove();
      }
    }
    
    // Function to reset the search and show all products
    function resetSearch() {
      // Remove any "no results" message
      const noResultsMessage = document.getElementById('noResultsMessage');
      if (noResultsMessage) {
        noResultsMessage.remove();
      }
      
      // Show all products
      productCards.forEach(card => {
        card.classList.remove('hidden');
      });
      
      // Show all sections and headings
      document.querySelectorAll('section, h1, h2').forEach(element => {
        element.classList.remove('hidden');
      });
    }
    
    // No clear button - users can use backspace
  }
  
  // Integrate with existing filter functionality
  const applyFiltersBtn = document.getElementById('apply-filters');
  const clearFiltersBtn = document.getElementById('clear-filters');
  
  if (applyFiltersBtn && searchInput) {
    // Store the original filter function if it exists
    const originalApplyFiltersHandler = applyFiltersBtn.onclick;
    
    // Override the apply filters button to also consider search term
    applyFiltersBtn.addEventListener('click', function() {
      // If there's a search term, perform search after filters are applied
      if (searchInput.value.trim() !== '') {
        setTimeout(function() {
          const event = new Event('click');
          searchBtn.dispatchEvent(event);
        }, 100);
      }
    });
  }
  
  if (clearFiltersBtn && searchInput) {
    // Add clearing the search to the clear filters button
    clearFiltersBtn.addEventListener('click', function() {
      searchInput.value = '';
      const clearButton = document.querySelector('.search-clear-btn');
      if (clearButton) {
        clearButton.style.display = 'none';
      }
    });
  }
});
