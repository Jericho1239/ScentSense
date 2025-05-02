/**
 * Product Search Functionality for Review Form
 * Provides autocomplete suggestions when typing product names
 */

document.addEventListener('DOMContentLoaded', function() {
    const reviewProduct = document.getElementById('reviewProduct');
    const productList = document.createElement('ul');
    productList.className = 'product-suggestions';
    let allProducts = [];

    // Fetch all product data
    Promise.all([
        fetch('../backend/models/men-scent.json'),
        fetch('../backend/models/women-scent.json'),
        fetch('../backend/models/unisex-scent.json')
    ])
    .then(responses => Promise.all(responses.map(r => r.json())))
    .then(data => {
        // Combine all products into one array, only keep titles
        allProducts = data.flat().map(product => product.Title);
        
        // Setup the autocomplete functionality
        if (reviewProduct) {
            setupAutocomplete();
        }
    })
    .catch(error => console.error('Error loading product data:', error));

    function setupAutocomplete() {
        // Insert the suggestions list after the input
        reviewProduct.parentNode.insertBefore(productList, reviewProduct.nextSibling);

        // Handle input changes
        reviewProduct.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            if (query.length < 2) {
                productList.style.display = 'none';
                return;
            }

            // Filter products based on input
            const matches = allProducts.filter(title => 
                title.toLowerCase().includes(query)
            );

            // Display matches
            if (matches.length > 0) {
                productList.innerHTML = matches
                    .slice(0, 5) // Limit to 5 suggestions
                    .map(title => `<li>${title}</li>`)
                    .join('');
                productList.style.display = 'block';
            } else {
                productList.style.display = 'none';
            }
        });

        // Handle clicking on a suggestion
        productList.addEventListener('click', function(e) {
            const li = e.target.closest('li');
            if (li) {
                reviewProduct.value = li.textContent;
                productList.style.display = 'none';
            }
        });

        // Hide suggestions when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('#reviewProduct') && !e.target.closest('.product-suggestions')) {
                productList.style.display = 'none';
            }
        });

        // Handle keyboard navigation
        reviewProduct.addEventListener('keydown', function(e) {
            const items = productList.getElementsByTagName('li');
            const currentIndex = Array.from(items).findIndex(item => item.classList.contains('selected'));

            switch(e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    if (currentIndex < items.length - 1) {
                        if (currentIndex > -1) items[currentIndex].classList.remove('selected');
                        items[currentIndex + 1].classList.add('selected');
                    }
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    if (currentIndex > 0) {
                        items[currentIndex].classList.remove('selected');
                        items[currentIndex - 1].classList.add('selected');
                    }
                    break;
                case 'Enter':
                    if (currentIndex > -1) {
                        e.preventDefault();
                        reviewProduct.value = items[currentIndex].textContent;
                        productList.style.display = 'none';
                    }
                    break;
                case 'Escape':
                    productList.style.display = 'none';
                    break;
            }
        });
    }
});
