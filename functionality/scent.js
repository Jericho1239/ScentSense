// functionality/scent.js

document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    const grid = document.getElementById('scents-container'); // Target the container in index/saved-scents.html

    if (!token) {
        // Redirect to login if no token is found
        alert("Please log in to view saved scents.");
        // Adjust the redirect path as needed (assuming login happens via modal or separate page)
        // window.location.href = '/login.html'; // Or trigger login modal
        if (grid) {
            grid.innerHTML = '<p class="no-scents">Please <a href="#" onclick="showLoginModal()">log in</a> to view your saved scents.</p>';
        }
        return;
    }

    if (grid) {
        loadSavedScents(token, grid);

        // Add event listener for remove buttons (using event delegation)
        grid.addEventListener('click', function(event) {
            if (event.target.classList.contains('remove-scent-btn')) {
                const productId = event.target.dataset.productId;
                removeScent(productId, token, event.target);
            }
        });
    } else {
        console.error('Saved scents container #scents-container not found.');
    }
});

async function loadSavedScents(token, grid) {
    grid.innerHTML = '<p>Loading saved scents...</p>'; // Loading indicator

    try {
        const response = await fetch('/api/saved-scents', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const savedScents = await response.json();
            grid.innerHTML = ''; // Clear loading message

            if (Array.isArray(savedScents) && savedScents.length > 0) {
                savedScents.forEach(scent => {
                    const scentElement = document.createElement('div');
                    scentElement.classList.add('saved-item'); // Use a suitable class
                    scentElement.dataset.productId = scent.productId; // Store productId for removal

                    // Ensure properties exist before accessing
                    const image = scent.image || '/placeholder.jpg'; // Default image if missing
                    const name = scent.name || 'Unknown Scent';
                    const brand = scent.brand || 'Unknown Brand';
                    const orderUrl = scent.orderUrl && scent.orderUrl !== '#' ? scent.orderUrl : null;

                    // Format price with commas for thousands
                    const formatPrice = (price) => {
                        return parseFloat(price).toLocaleString('en-PH', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        });
                    };

                    // Create a more structured card layout
                    scentElement.innerHTML = `
                        <div class="saved-item-image">
                            <img src="${image}" alt="${name}">
                        </div>
                        <div class="saved-item-details">
                            <h3>${name}</h3>
                            <p>${brand}</p>
                            <p class="price">${scent.Price ? `₱${formatPrice(scent.Price)}` : ''}</p>
                        </div>
                        <div class="saved-item-actions">
                            ${orderUrl ? `<button class="order-btn btn btn-secondary"
                                data-product-name="${brand} - ${name}"
                                data-product-price="${scent.Price}"
                                data-product-url="${orderUrl}">Order Now</button>` : ''}
                            <button class="remove-scent-btn btn btn-danger" data-product-id="${scent.productId}">Remove</button>
                        </div>
                    `;
                    grid.appendChild(scentElement);

                    // Add click handler for the order button
                    const orderBtn = scentElement.querySelector('.order-btn');
                    if (orderBtn) {
                        orderBtn.addEventListener('click', function() {
                            const productName = this.getAttribute('data-product-name');
                            const price = parseFloat(this.getAttribute('data-product-price'));
                            const url = this.getAttribute('data-product-url');
                            
                            // Save order data
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
                            if (url && url !== '#') {
                                window.open(url, '_blank');
                            }
                        });
                    }
                });
            } else {
                grid.innerHTML = '<p class="no-scents">You haven\'t saved any scents yet.</p>';
            }
        } else if (response.status === 401) {
             alert("Authentication error. Please log in again.");
            // Optionally redirect to login or show login modal
            // window.location.href = '/login.html'; 
             grid.innerHTML = '<p class="no-scents">Please <a href="#" onclick="showLoginModal()">log in</a> again to view saved scents.</p>';
        } else {
             console.error('Error loading saved scents:', response.status, await response.text());
             grid.innerHTML = `<p class="error-scents">Error loading saved scents (${response.status}). Please try refreshing.</p>`;
        }
    } catch (error) {
        console.error('Network error loading saved scents:', error);
        grid.innerHTML = '<p class="error-scents">Network error loading saved scents. Please check your connection and refresh.</p>';
    }
}

async function removeScent(productId, token, removeButton) {
    const originalButtonText = removeButton.textContent;
    removeButton.textContent = 'Removing...';
    removeButton.disabled = true;
    const scentElement = removeButton.closest('.saved-item'); 

    try {
        const response = await fetch(`/api/saved-scents/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok || response.status === 204) { // 204 No Content is success for DELETE
            if (scentElement) scentElement.remove();
            // Check if grid is empty after removal
            const grid = document.getElementById('scents-container');
            if (grid && !grid.querySelector('.saved-item')) {
                grid.innerHTML = '<p class="no-scents">You haven\'t saved any scents yet.</p>';
            }
            // No need to alert on success
        } else if (response.status === 401) {
             alert("Authentication error. Please log in again.");
            // Optionally redirect or show login modal
            // window.location.href = '/login.html'; 
             removeButton.textContent = originalButtonText;
             removeButton.disabled = false;
        } else if (response.status === 404) {
             alert("Scent not found. It might have already been removed.");
             // Remove visually anyway if server says not found
             if (scentElement) scentElement.remove(); 
             const grid = document.getElementById('scents-container');
             if (grid && !grid.querySelector('.saved-item')) { 
                 grid.innerHTML = '<p class="no-scents">You haven\'t saved any scents yet.</p>';
             }
             // No need to reset button if item is gone
        } else {
            console.error('Error removing scent:', response.status, await response.text());
            alert(`Error removing scent (${response.status}). Please try again.`);
            if (removeButton) {
                removeButton.textContent = originalButtonText;
                removeButton.disabled = false;
            }
        }
    } catch (error) {
        console.error('Network error removing scent:', error);
        alert("Network error removing scent. Please check your connection.");
         if (removeButton) {
            removeButton.textContent = originalButtonText;
            removeButton.disabled = false;
        }
    }
}

// Helper function (if not already globally available) to show login modal
// function showLoginModal() {
//     console.log('Triggering login modal');
//     // Add your logic to display the login modal here
// }
