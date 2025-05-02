// Filter functionality for ScentSense
document.addEventListener('DOMContentLoaded', function() {
  // Get filter elements
  const priceFilters = document.querySelectorAll('.price-filter');
  const typeFilters = document.querySelectorAll('.type-filter');
  const applyButton = document.getElementById('apply-filters');
  const clearButton = document.getElementById('clear-filters');
  const productCards = document.querySelectorAll('.product-card');

  // Apply filters when the button is clicked
  applyButton.addEventListener('click', function() {
    // Get selected price filters
    const selectedPrices = Array.from(priceFilters)
      .filter(checkbox => checkbox.checked)
      .map(checkbox => checkbox.value);

    // Get selected type filters
    const selectedTypes = Array.from(typeFilters)
      .filter(checkbox => checkbox.checked)
      .map(checkbox => checkbox.value);

    // Apply filters to product cards
    filterProducts(selectedPrices, selectedTypes);
  });

  // Clear all filters
  clearButton.addEventListener('click', function() {
    // Uncheck all checkboxes
    priceFilters.forEach(checkbox => checkbox.checked = false);
    typeFilters.forEach(checkbox => checkbox.checked = false);
    
    // Show all products and headings
    productCards.forEach(card => card.classList.remove('hidden'));
    document.querySelectorAll('h2').forEach(heading => heading.classList.remove('hidden'));
    document.querySelectorAll('h1').forEach(heading => heading.classList.remove('hidden'));
  });

  // Filter products based on selected criteria
  function filterProducts(prices, types) {
    // If no filters are selected, show all products and headings
    if (prices.length === 0 && types.length === 0) {
      productCards.forEach(card => card.classList.remove('hidden'));
      document.querySelectorAll('h2').forEach(heading => heading.classList.remove('hidden'));
      document.querySelectorAll('h1').forEach(heading => heading.classList.remove('hidden'));
      return;
    }

    // First, hide all products
    productCards.forEach(card => card.classList.add('hidden'));
    
    // Create a map to track which product types have visible products
    const visibleProductTypes = new Map();
    
    // Then show only the products that match the filters
    productCards.forEach(card => {
      const productPrice = card.querySelector('img').getAttribute('alt'); // Price range is in the alt attribute
      
      // Find the product type for this card
      let productType = '';
      let productContainer = card.closest('.products');
      
      if (productContainer) {
        // Get the h2 heading that precedes this products container
        let prevElement = productContainer.previousElementSibling;
        while (prevElement) {
          if (prevElement.tagName === 'H2') {
            productType = prevElement.textContent.trim();
            break;
          }
          prevElement = prevElement.previousElementSibling;
        }
      }
      
      // Determine if the product matches the selected filters
      const matchesPrice = prices.length === 0 || prices.includes(productPrice);
      const matchesType = types.length === 0 || types.some(type => {
        // Handle special cases for the type matching
        if (type === 'Oil-based' && productType.includes('Oil-based')) return true;
        if (type === 'Eau de Parfum' && (productType.includes('Parfum') || productType.includes('EDP'))) return true;
        if (type === 'Eau de Toilette' && (productType.includes('Toilette') || productType.includes('EDT'))) return true;
        if (type === 'Body Spray' && productType.includes('Body Spray')) return true;
        return false;
      });
      
      // Show the product if it matches both filters
      if (matchesPrice && matchesType) {
        card.classList.remove('hidden');
        
        // Mark this product type as having visible products
        if (productType) {
          visibleProductTypes.set(productType, true);
        }
      }
    });
    
    // Hide all h2 headings
    const allH2Headings = document.querySelectorAll('h2');
    allH2Headings.forEach(heading => {
      const headingText = heading.textContent.trim();
      
      // Check if this heading's product type has any visible products
      if (visibleProductTypes.has(headingText)) {
        heading.classList.remove('hidden');
      } else {
        heading.classList.add('hidden');
      }
    });
    
    // Hide empty product containers
    document.querySelectorAll('.products').forEach(container => {
      const visibleProducts = container.querySelectorAll('.product-card:not(.hidden)');
      if (visibleProducts.length === 0) {
        container.classList.add('hidden');
      } else {
        container.classList.remove('hidden');
      }
    });
    
    // Handle category headings (h1)
    document.querySelectorAll('section').forEach(section => {
      const h1 = section.querySelector('h1');
      const visibleProducts = section.querySelectorAll('.product-card:not(.hidden)');
      
      if (h1 && visibleProducts.length === 0) {
        h1.classList.add('hidden');
      } else if (h1) {
        h1.classList.remove('hidden');
      }
    });
  }
});
