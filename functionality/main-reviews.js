document.addEventListener('DOMContentLoaded', function() {
    const reviewContainer = document.getElementById('reviewContainer');
    const carousel = document.querySelector('.carousel .review-container');
    const prevButton = document.querySelector('.prev-review');
    const nextButton = document.querySelector('.next-review');
    let currentIndex = 0;
    let autoRotateInterval;
    const ROTATION_INTERVAL = 4500; // Half second between slides

    function animateScrollTo(element, target, duration) {
        const start = element.scrollLeft;
        const change = target - start;
        const startTime = performance.now();

        function animate(time) {
            const elapsed = time - startTime;
            const progress = Math.min(elapsed / duration, 1);
            element.scrollLeft = start + change * easeInOutQuad(progress);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }

        function easeInOutQuad(t) {
            // More aggressive easing for faster perceived motion
            return t < 0.5
                ? 4 * t * t * t
                : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }

        requestAnimationFrame(animate);
    }

    // Function to create a review slide
    function createReviewSlide(review) {
        const slide = document.createElement('div');
        slide.className = 'review-slide';
        
        const starsHtml = Array(5).fill(0)
            .map((_, i) => `<i class="${i < review.rating ? 'fas' : 'far'} fa-star"></i>`)
            .join('');

        slide.innerHTML = ` 
            <p class="product-name">${review.product}</p>
            <div class="star-rating">
                ${starsHtml}
            </div>
            <p class="review-text">${review.text}</p>
            <p class="reviewer-name">${review.username}</p>
        `;
        
        return slide;
    }

    // Function to update carousel
    function updateCarousel() {
        const slides = carousel.querySelectorAll('.review-slide');
        const itemWidth = slides[0]?.offsetWidth || 300;
        const scrollAmount = currentIndex * (itemWidth + 24); // 24px is the gap
        animateScrollTo(carousel, scrollAmount, 150); // 150ms for very fast scroll

        // Reset auto-rotation timer
        if (autoRotateInterval) {
            clearInterval(autoRotateInterval);
        }
        startAutoRotate();

        // Update active states
        slides.forEach((slide, index) => {
            if (index === currentIndex) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });
    }

    // Event listeners for navigation
    prevButton?.addEventListener('click', () => {
        const slides = carousel.querySelectorAll('.review-slide');
        currentIndex = Math.max(currentIndex - 1, 0);
        updateCarousel();
    });

    nextButton?.addEventListener('click', () => {
        const slides = carousel.querySelectorAll('.review-slide');
        currentIndex = Math.min(currentIndex + 1, slides.length - 1);
        updateCarousel();
    });

    // Load and display reviews
    async function loadReviews() {
        try {
            const response = await fetch('/api/reviews');
            if (!response.ok) {
                throw new Error('Failed to load reviews');
            }
            const reviews = await response.json();
            
            // Remove loading state
            carousel.innerHTML = '';
            
            // Add new reviews
            reviews.forEach((review, index) => {
                const slide = createReviewSlide(review);
                if (index === 0) {
                    slide.classList.add('active');
                }
                carousel.appendChild(slide);
            });

            // Initialize carousel
            updateCarousel();
        } catch (error) {
            console.error('Error loading reviews:', error);
            carousel.innerHTML = `
                <div class="review-slide loading-review">
                    <p class="review-text">Failed to load reviews. Please try again later.</p>
                </div>
            `;
        }
    }

    // Function to start auto-rotation
    function startAutoRotate() {
        autoRotateInterval = setInterval(() => {
            const slides = carousel.querySelectorAll('.review-slide');
            currentIndex++;
            if (currentIndex >= slides.length) {
                currentIndex = 0;
                // Instantly move back to start without animation
                carousel.scrollLeft = 0;
            } else {
                updateCarousel();
            }
        }, ROTATION_INTERVAL);
    }

    // Pause auto-rotation on hover
    carousel.addEventListener('mouseenter', () => {
        if (autoRotateInterval) {
            clearInterval(autoRotateInterval);
        }
    });

    carousel.addEventListener('mouseleave', startAutoRotate);

    // Initial load
    loadReviews();
});
