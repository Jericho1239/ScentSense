// Shared reviews functionality
window.SharedReviews = {
    async loadReviewsFromDatabase() {
        try {
            const response = await fetch('/api/reviews');
            if (!response.ok) {
                throw new Error('Failed to load reviews');
            }
            const reviews = await response.json();
            return reviews.filter(review => 
                review && review.username && review.text && review.product && typeof review.rating === 'number'
            );
        } catch (error) {
            console.error('Error loading reviews:', error);
            return [];
        }
    },

    async saveReview(review) {
        try {
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
            
            return true;
        } catch (error) {
            console.error('Error saving review:', error);
            return false;
        }
    },

    createReviewCardElement(review) {
        const card = document.createElement('div');
        card.className = 'review-card';
        
        // Ensure all required fields exist
        if (!review || !review.username || !review.text || !review.product || typeof review.rating !== 'number') {
            console.error('Invalid review data:', review);
            return null;
        }

        const starsHtml = Array(5).fill(0)
            .map((_, i) => `<i class="${i < review.rating ? 'fas' : 'far'} fa-star"></i>`)
            .join('');
        
        card.innerHTML = `
            <div class="review-header">
                <div class="review-user">
                    <i class="fas fa-user"></i>
                    ${review.username}
                </div>
                <div class="review-date">
                    ${new Date(review.date).toLocaleDateString()}
                </div>
            </div>
            <div class="review-product">${review.product}</div>
            <div class="review-rating">
                ${starsHtml}
            </div>
            <div class="review-text">${review.text}</div>
        `;
        
        return card;
    },

    async updateMainPageReviews() {
        const mainReviewsContainer = document.querySelector('.review-carousel .reviews-container');
        if (!mainReviewsContainer) return;

        try {
            const reviews = await this.loadReviewsFromDatabase();
            
            mainReviewsContainer.innerHTML = '';
            reviews.forEach(review => {
                const reviewCard = this.createReviewCardElement(review);
                if (reviewCard) {
                    reviewCard.classList.add('carousel-item');
                    mainReviewsContainer.appendChild(reviewCard);
                }
            });
        } catch (error) {
            console.error('Error updating main page reviews:', error);
        }
    }
};
