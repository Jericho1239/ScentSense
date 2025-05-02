
document.addEventListener("DOMContentLoaded", function () {
    // Create loading overlay
    const overlay = document.createElement("div");
    overlay.className = "loading-overlay";
  
    const loader = document.createElement("div");
    loader.className = "perfume-loader";
  
    const bottle = document.createElement("div");
    bottle.className = "perfume-bottle";
  
    const spray = document.createElement("div");
    spray.className = "perfume-spray";
  
    const liquid = document.createElement("div");
    liquid.className = "liquid-animation";
  
    bottle.appendChild(liquid);
    loader.appendChild(spray);
    loader.appendChild(bottle);
    overlay.appendChild(loader);
    document.body.appendChild(overlay);
  
    // Show loading immediately when starting navigation
    document.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", function (e) {
        if (!this.getAttribute("href").startsWith("#")) {
          overlay.classList.add("active");
        }
      });
    });
  
    // Initially show loading
    overlay.classList.add("active");
  
    // Hide loading overlay when page is fully loaded
    window.addEventListener("load", function () {
      // Small delay to ensure smooth transition
      setTimeout(() => {
        overlay.classList.add("fade-out");
        setTimeout(() => {
          overlay.classList.remove("active");
          overlay.classList.remove("fade-out");
  
          // Initialize smooth reveal for cards and products
          initSmoothReveal();
        }, 500);
      }, 300);
    });
  });
  
  // Smooth reveal functionality
  function initSmoothReveal() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
  
            // Add staggered delay for cards in the same container
            if (
              entry.target.classList.contains("card") ||
              entry.target.classList.contains("product-card")
            ) {
              const siblings = Array.from(entry.target.parentElement.children);
              const index = siblings.indexOf(entry.target);
              entry.target.style.transitionDelay = `${index * 0.1}s`;
            }
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: "50px",
      }
    );
  
    // Observe all cards and product cards
    document.querySelectorAll(".card, .product-card").forEach((element) => {
      observer.observe(element);
    });
  }