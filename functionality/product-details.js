// Product details functionality
document.addEventListener("DOMContentLoaded", function () {
  // Store all scent products
  let womenScents = [];
  let menScents = [];
  let unisexScents = [];
  let currentPage = window.location.pathname;
  
  // Determine which data to load based on the current page
  if (currentPage.includes('women.html')) {
    // Fetch women scents data from JSON file
    console.log('Fetching product data for women');
    
    fetch('/api/women-scents')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        womenScents = data;
        console.log('Women products loaded successfully:', womenScents.length);
        setupProductButtons(womenScents);
      })
      .catch(error => {
        console.error('Error loading women product data:', error);
        setupProductButtons([]); // Setup buttons anyway so UI works
      });
  } else if (currentPage.includes('men.html')) {
    // Fetch men scents data from JSON file
    console.log('Fetching product data for men');
    
    fetch('/api/men-scents')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        menScents = data;
        console.log('Men products loaded successfully:', menScents.length);
        setupProductButtons(menScents);
      })
      .catch(error => {
        console.error('Error loading men product data:', error);
        setupProductButtons([]); // Setup buttons anyway so UI works
      });
  } else if (currentPage.includes('unisex.html')) {
    // Fetch unisex scents data from JSON file
    console.log('Fetching product data for unisex');
    
    fetch('/api/unisex-scents')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        unisexScents = data;
        console.log('Unisex products loaded successfully:', unisexScents.length);
        setupProductButtons(unisexScents);
      })
      .catch(error => {
        console.error('Error loading unisex product data:', error);
        setupProductButtons([]); // Setup buttons anyway so UI works
      });
  } else {
    // Default case - just setup the buttons without data
    console.log('Page not recognized for specific product data');
    setupProductButtons([]);
  }

  function setupProductButtons(productsData) {
    // Add event listeners to all "Full Description" buttons
    const productButtons = document.querySelectorAll('.add-to-cart-btn');
    console.log('Found', productButtons.length, 'product buttons');
    
    productButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Get product ID from data attribute
        const productId = this.getAttribute('data-product-id');
        
        if (productId) {
          // Find the product in our data
          const product = productsData.find(item => item.id === productId);
          
          if (product) {
            // Display the product modal with data from JSON
            displayProductModal(product);
          } else {
            // Product not found in JSON data
            alert(`Product details for ID ${productId} not found in the database.`);
          }
        } else {
          alert('This product does not have an ID assigned.');
        }
      });
    });
  }

  function displayProductModal(product) {
    // Get modal elements
    const modal = document.getElementById('productModal');
    if (!modal) {
      console.error('Product modal element not found!');
      return;
    }
    
    // Make sure the login modal is hidden
    const loginModal = document.querySelector('.login-modal');
    if (loginModal) {
      loginModal.style.display = 'none';
    }
    
    // Get image path from the product data
    let imagePath = product.ImagePath || `/${product.Brand} - ${product.Title}.png`;
    
    // Add console logging for debugging
    console.log('Attempting to load image:', imagePath);
    
    // Update modal content with product data
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close" onclick="document.getElementById('productModal').style.display='none'">&times;</span>
        <div class="modal-body">
          <div class="modal-image">
            <img src="${imagePath}" alt="${product.Title}" 
                 onerror="if(this.src === '${imagePath}') { 
                           console.log('First image failed, trying alternate format');
                           this.src='/${product.Title} – ${product.Brand}.png'; 
                         } else if(this.src === '/${product.Title} – ${product.Brand}.png') { 
                           console.log('Second image failed, trying another format');
                           this.src='/${product.Title} - ${product.Brand}.png'; 
                         } else { 
                           console.log('All image formats failed, using logo');
                           this.src='/logo.png'; 
                         }">
          </div>
          <div class="product-details">
            <h2>${product.Title}</h2>
            <div class="detail-item">
              <strong>Brand:</strong> ${product.Brand}
            </div>
            <div class="detail-item">
              <strong>Size:</strong> ${product.Size}
            </div>
            <div class="detail-item">
              <strong>Price:</strong> ${product.Currency} ${product.Price}
            </div>
            <div class="detail-item">
              <strong>Category:</strong> ${product.Category}
            </div>
            <div class="detail-item">
              <strong>Type:</strong> ${product.Type}
            </div>
            <div class="detail-item">
              <strong>Status:</strong> ${product.Status}
            </div>
            <div class="product-description">
              <strong>Description:</strong>
              <p>${product.Description}</p>
            </div>
            <div class="button-group">
              <button class="order-btn" 
                data-product-name="${product.Brand} - ${product.Title}"
                data-product-price="${parseFloat(product.Price.replace(/[^\d.]/g, ''))}"
                data-product-url="${product.URL}">Order Now</button>
              <button class="save-scent-btn" data-product-id="${product.id}">Save Scent</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Display the modal
    modal.style.display = 'block';
    
    // Set up close button event listener
    const closeButton = modal.querySelector('.close');
    if (closeButton) {
      closeButton.addEventListener('click', function() {
        modal.style.display = 'none';
      });
    }
    
    // Set up order button event listener
    const orderButton = modal.querySelector('.order-btn');
    if (orderButton) {
      orderButton.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent event bubbling
        const token = localStorage.getItem('token'); 
        if (!token) {
          // Close the product modal first
          closeModal();
          // Then show the login modal with a slight delay
          setTimeout(function() {
            alert("Please log in to order.");
            showLoginModal();
          }, 300);
          return;
        }
        
        // Get product data for tracking
        const productName = this.getAttribute('data-product-name');
        const priceStr = this.getAttribute('data-product-price');
        const price = parseFloat(priceStr);
        const url = this.getAttribute('data-product-url');
        
        // Validate price
        if (isNaN(price) || price <= 0) {
          console.error('Invalid price:', priceStr);
          alert('Sorry, there was an error with the product price. Please try again later.');
          return;
        }
        
        // Save order to tracking system
        try {
          // Get existing stats or initialize new ones
          const stats = JSON.parse(localStorage.getItem('orderStats') || '{}');
          
          // Initialize if first time
          if (!stats.totalOrders) stats.totalOrders = 0;
          if (!stats.totalRevenue) stats.totalRevenue = 0;
          if (!stats.activeUsers) stats.activeUsers = 1;
          if (!stats.productStats) stats.productStats = {};

          // Update total stats
          stats.totalOrders++;
          stats.totalRevenue += price;

          // Update or create product stats
          if (!stats.productStats[productName]) {
              stats.productStats[productName] = {
                  name: productName,
                  orderCount: 0,
                  revenue: 0,
                  lastOrderDate: null
              };
          }

          // Update product specific stats
          stats.productStats[productName].orderCount++;
          stats.productStats[productName].revenue += price;
          stats.productStats[productName].lastOrderDate = new Date().toISOString();

          // Save back to localStorage
          localStorage.setItem('orderStats', JSON.stringify(stats));
          
          console.log('Order saved successfully:', { productName, price });
        } catch (error) {
          console.error('Error saving order:', error);
        }

        // Open product URL in new tab
        if (url) {
          window.open(url, '_blank');
        } else {
          alert("Sorry, this product is currently unavailable for ordering.");
        }
      });
    }

    // Set up save scent button event listener
    const saveButton = modal.querySelector('.save-scent-btn');
    if (saveButton) {
      saveButton.addEventListener('click', async function(e) {
        e.stopPropagation(); // Prevent event bubbling
        const token = localStorage.getItem('token'); 
        if (!token) {
          // Close the product modal first
          closeModal();
          // Then show the login modal with a slight delay
          setTimeout(function() {
            if (typeof showLoginModal === 'function') {
              showLoginModal();
            }
          }, 300);
          return;
        }

        const productCard = this.closest(".modal-body");
        if (!productCard) {
          console.error("Could not find product container element.");
          alert("Error saving scent. Could not find product details.");
          return;
        }

        const productId = this.dataset.productId;
        let productName = product.Title || "Unknown Product";
        let productBrand = product.Brand || "Unknown Brand";
        let productImageUrl = imagePath;
        let productOrderUrl = product.URL || "#";
        let productPrice = parseFloat(product.Price.replace(/[^\d.]/g, '')) || 0;

        const scentData = {
          productId: productId,
          name: productName,
          brand: productBrand,
          image: productImageUrl,
          orderUrl: productOrderUrl,
          Price: productPrice.toString()  // Save as clean number string without currency symbol
        };

        const originalText = this.textContent;
        this.textContent = "Saving...";
        this.disabled = true;

        try {
          const response = await fetch('/api/saved-scents', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(scentData)
          });

          if (response.ok) { 
            this.textContent = "Saved";
            this.classList.add("saved");
            setTimeout(() => {
              this.textContent = originalText; 
              this.disabled = false; 
            }, 2000); 
          } else if (response.status === 401) {
            alert("Your session may have expired. Please log in again.");
            this.textContent = originalText;
            this.disabled = false;
          } else if (response.status === 409) { 
            alert("This scent is already saved!");
            this.textContent = originalText;
            this.disabled = false;
          } else {
            console.error('Error saving scent:', response.status);
            alert(`Error saving scent (${response.status}). Please try again later.`);
            this.textContent = originalText;
            this.disabled = false;
          }
        } catch (error) {
          console.error('Network error saving scent:', error);
          alert("Network error saving scent. Please check your connection.");
          this.textContent = originalText;
          this.disabled = false;
        }
      });
    }
  }

  // Close modal when clicking outside of it
  window.addEventListener('click', function(event) {
    const modal = document.getElementById('productModal');
    if (modal && event.target === modal) {
      modal.style.display = 'none';
    }
  });
  
  // Add a global function to close the modal that can be called from HTML
  window.closeModal = function() {
    const modal = document.getElementById('productModal');
    if (modal) {
      modal.style.display = 'none';
    }
  };
});