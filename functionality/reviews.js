document.addEventListener('DOMContentLoaded', async function() {
    const writeBtn = document.getElementById('writeReviewBtn');
    const modal = document.getElementById('reviewModal');
    const closeModal = document.getElementById('closeReviewModal');
    const reviewContainer = document.getElementById('reviewsContainer');
    const starRating = document.querySelector('.star-rating');
    const reviewForm = document.getElementById('reviewForm');
    let currentRating = 0;

    // Make sure modal is hidden on page load
    if (modal) {
        modal.style.display = 'none';
    }

    // Initialize star rating functionality
    if (starRating) {
        const stars = starRating.querySelectorAll('.fa-star');
        stars.forEach((star) => {
            star.addEventListener('mouseover', () => {
                const rating = parseInt(star.getAttribute('data-rating'));
                highlightStars(rating);
            });

            star.addEventListener('mouseout', () => {
                highlightStars(currentRating);
            });

            star.addEventListener('click', () => {
                currentRating = parseInt(star.getAttribute('data-rating'));
                highlightStars(currentRating);
            });
        });
    }

    // Function to highlight stars
    function highlightStars(rating) {
        const stars = starRating.querySelectorAll('.fa-star');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.remove('far');
                star.classList.add('fas');
            } else {
                star.classList.remove('fas');
                star.classList.add('far');
            }
        });
    }

    // Event Listeners
    if (writeBtn) {
        writeBtn.addEventListener('click', function() {
            if (!localStorage.getItem('username') || !localStorage.getItem('email')) {
                alert('Please log in to write a review.');
                return;
            }
            modal.style.display = 'flex';
            currentRating = 0;
            highlightStars(0);
            reviewForm.reset();
        });
    }

    // Close modal when clicking outside
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeReviewModal();
            }
        });
    }

    // Close modal when clicking close button
    if (closeModal) {
        closeModal.addEventListener('click', closeReviewModal);
    }

    // Function to close modal
    function closeReviewModal() {
        modal.style.display = 'none';
        currentRating = 0;
        highlightStars(0);
        if (reviewForm) {
            reviewForm.reset();
        }
    }

    if (reviewForm) {
        reviewForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            try {
                if (!currentRating || !document.getElementById('reviewProduct').value || !document.getElementById('reviewText').value) {
                    alert('Please fill in all fields and provide a rating.');
                    return;
                }

                const review = {
                    username: localStorage.getItem('username') || 'Anonymous',
                    email: localStorage.getItem('email') || 'anonymous@example.com',
                    product: document.getElementById('reviewProduct').value,
                    text: document.getElementById('reviewText').value,
                    rating: currentRating,
                    date: new Date().toISOString()
                };

                // Save review using the API
                const response = await fetch('/api/reviews', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(review)
                });

                if (!response.ok) {
                    throw new Error('Failed to save review');
                }

                // Close modal and reset form
                closeReviewModal();
                
                // Show success message
                showSuccessModal();

                // Reload reviews on both pages
                loadReviews();
                window.SharedReviews.updateMainPageReviews();
            } catch (error) {
                console.error('Error submitting review:', error);
                alert('Failed to submit review. Please try again.');
            }
        });
    }

    // Success Modal
    function showSuccessModal() {
        let successModal = document.getElementById('successModal');
        if (!successModal) {
            successModal = document.createElement('div');
            successModal.id = 'successModal';
            successModal.style.position = 'fixed';
            successModal.style.top = '50%';
            successModal.style.left = '50%';
            successModal.style.transform = 'translate(-50%, -50%)';
            successModal.style.background = '#131722';
            successModal.style.color = 'var(--gold)';
            successModal.style.padding = '30px 40px';
            successModal.style.borderRadius = '12px';
            successModal.style.border = '1.5px solid var(--gold)';
            successModal.style.boxShadow = '0 4px 20px rgba(212, 175, 55, 0.15)';
            successModal.style.zIndex = '100001';
            successModal.style.fontWeight = 'bold';
            successModal.style.fontSize = '1.2em';
            successModal.innerText = 'Review submitted successfully!';
            document.body.appendChild(successModal);
        } else {
            successModal.style.display = 'block';
        }
        setTimeout(() => {
            successModal.style.display = 'none';
        }, 1800);
    }

    // Display reviews from JSON
    async function loadReviews() {
        if (!reviewContainer) return;
        
        try {
            const reviews = await window.SharedReviews.loadReviewsFromDatabase();
            
            reviewContainer.innerHTML = '';
            
            if (reviews.length === 0) {
                const noReviewsMsg = document.createElement('div');
                noReviewsMsg.className = 'no-reviews-message';
                noReviewsMsg.textContent = 'No reviews yet. Be the first to share your experience!';
                reviewContainer.appendChild(noReviewsMsg);
                return;
            }
            
            // Display each review
            reviews.forEach(review => {
                const reviewCard = window.SharedReviews.createReviewCardElement(review);
                reviewContainer.appendChild(reviewCard);
            });
        } catch (err) {
            console.error('Error loading reviews:', err);
            reviewContainer.innerHTML = '<div class="error-message">Failed to load reviews. Please try again later.</div>';
        }
    }

    // Load reviews on page load
    loadReviews();
});