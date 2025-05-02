document.addEventListener("DOMContentLoaded", function () {
  // Featured Products Slider
  const slides = document.querySelectorAll(".featured-slide");
  const dots = document.querySelectorAll(".dot");
  let currentSlide = 0;
  const slideInterval = 5000; // Change slide every 5 seconds

  function showSlide(index) {
    slides.forEach((slide) => slide.classList.remove("active"));
    dots.forEach((dot) => dot.classList.remove("active"));

    slides[index].classList.add("active");
    dots[index].classList.add("active");
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }

  // Initialize automatic slideshow
  let slideTimer = setInterval(nextSlide, slideInterval);

  // Add click handlers for dots
  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      clearInterval(slideTimer);
      currentSlide = index;
      showSlide(currentSlide);
      slideTimer = setInterval(nextSlide, slideInterval);
    });
  });

  // Modal Elements
  const loginModal = document.querySelector(".login-modal");
  const signupModal = document.querySelector(".signup-modal");
  const modal = document.getElementById("termsModal");
  const closeBtn = document.querySelector(".close-btn");
  const nextBtn = document.querySelector(".next-btn");
  const radioButtons = document.querySelectorAll('input[name="agreement"]');
  const cancelBtn = document.querySelector(".cancel-btn");

  // Hide the login and signup modals initially
  if (loginModal) loginModal.style.display = "none";
  if (signupModal) signupModal.style.display = "none";

  // Header Navigation Submenu Toggle
  document.querySelectorAll(".menu-item-with-submenu").forEach((item) => {
    const menuLink = item.querySelector(".menu-link");

    menuLink.addEventListener("click", function (e) {
      e.preventDefault();
      if (window.innerWidth <= 768) {
        document
          .querySelectorAll(".menu-item-with-submenu")
          .forEach((otherItem) => {
            if (otherItem !== item) otherItem.classList.remove("active");
          });
        item.classList.toggle("active");
      }
    });

    document.addEventListener("click", function (e) {
      if (!item.contains(e.target)) {
        item.classList.remove("active");
      }
    });
  });

  // Header Navigation Active State
  document
    .querySelectorAll(".header-nav a:not(.has-submenu)")
    .forEach((link) => {
      link.addEventListener("click", function () {
        document
          .querySelectorAll(".header-nav a")
          .forEach((l) => l.classList.remove("active"));
        this.classList.add("active");
      });
    });

  // Terms Modal Functions
  window.showTerms = function () {
    modal.style.display = "block";
    document.getElementById("modalTitle").innerHTML =
      "<strong>Terms & Conditions</strong>";
    resetModal();
    showPage(1);
  };

  function closeModal() {
    if (modal) {
      modal.style.display = "none";
      resetModal();
    }
  }

  window.acceptTerms = function () {
    modal.style.display = "none";
    resetModal();
    window.location.href = "Main.html";
  };

  window.showPage = function (pageNumber) {
    document.getElementById("page1").style.display =
      pageNumber === 1 ? "block" : "none";
    document.getElementById("page2").style.display =
      pageNumber === 2 ? "block" : "none";

    document.getElementById("modalTitle").innerHTML =
      pageNumber === 1
        ? "Terms & Conditions"
        : '<i class="fas fa-triangle-exclamation"></i> Disclaimer';
  };

  function resetModal() {
    document.getElementById("page1").style.display = "block";
    document.getElementById("page2").style.display = "none";
    document.getElementById("modalTitle").innerHTML =
      "<strong>Terms & Conditions</strong>";
    if (radioButtons.length > 1) radioButtons[1].checked = true;
    if (nextBtn) nextBtn.disabled = true;
  }

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);
  if (modal) {
    window.addEventListener("click", function (event) {
      if (event.target === modal) closeModal();
    });
  }

  radioButtons.forEach((radio) => {
    radio.addEventListener("change", function () {
      if (nextBtn) nextBtn.disabled = this.value === "decline";
    });
  });

  // Handle Add to Cart buttons and show product modal if logged in
  const addToCartButtons = document.querySelectorAll(".add-to-cart-btn");
  addToCartButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      if (!isLoggedIn()) {
        if (loginModal) loginModal.style.display = "flex";
      } else {
        openModal();
      }
    });
  });

  const signInButton = document.querySelector(".sign-in-btn");
  if (signInButton) {
    signInButton.addEventListener("click", function (e) {
      e.preventDefault();
      if (!isLoggedIn()) {
        if (loginModal) loginModal.style.display = "flex";
      }
    });
  }

  window.handleSavedScents = function () {
    if (isLoggedIn()) {
      window.location.href = "/saved-scents.html";
    } else {
      if (loginModal) loginModal.style.display = "flex";
    }
  };

  function isLoggedIn() {
    return localStorage.getItem("token") !== null;
  }

  function updateUIForLoginState() {
    const logoutBtn = document.querySelector(".dropdown-btn:not(.sign-in-btn)");
    const signInBtn = document.querySelector(".sign-in-btn");

    if (isLoggedIn()) {
      if (logoutBtn) logoutBtn.style.display = "block";
      if (signInBtn) signInBtn.style.display = "none";
    } else {
      if (logoutBtn) logoutBtn.style.display = "none";
      if (signInBtn) signInBtn.style.display = "block";
    }
  }

  updateUIForLoginState();

  // --- Account Dropdown Profile Button Logic ---
  function updateProfileDropdown() {
    const isLoggedIn = localStorage.getItem("token") !== null;
    const signInBtn = document.querySelector(".sign-in-btn");
    const profileBtn = document.querySelector(".profile-btn");
    if (isLoggedIn) {
      if (signInBtn) signInBtn.style.display = "none";
      if (profileBtn) profileBtn.style.display = "block";
    } else {
      if (signInBtn) signInBtn.style.display = "block";
      if (profileBtn) profileBtn.style.display = "none";
    }
  }
  document.addEventListener("DOMContentLoaded", updateProfileDropdown);
  // Also update after login/signup
  function patchProfileDropdownAfterAuth() {
    updateProfileDropdown();
  }
  window.patchProfileDropdownAfterAuth = patchProfileDropdownAfterAuth;

  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      if (!email || !password) {
        alert("Please fill in all fields");
        return;
      }

      try {
        const response = await fetch("/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("username", data.user.username);
          localStorage.setItem("email", data.user.email); // <--- Ensure email is saved
          patchProfileDropdownAfterAuth();
          alert("Login successful!");
          if (loginModal) loginModal.style.display = "none";
          updateUIForLoginState();
          window.location.reload(); // Refresh to update UI
        } else {
          alert(data.message || "Invalid email or password");
        }
      } catch (err) {
        console.error("Error during login:", err);
        alert("Network error. Please check your connection and try again.");
      }
    });
  }

  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const signupName = document.getElementById("signupName").value;
      const signupEmail = document.getElementById("signupEmail").value;
      const signupPassword = document.getElementById("signupPassword").value;

      if (!signupName || !signupEmail || !signupPassword) {
        alert("Please fill in all fields");
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(signupEmail)) {
        alert("Please enter a valid email address");
        return;
      }

      // Password validation (at least 8 characters)
      if (signupPassword.length < 8) {
        alert("Password must be at least 8 characters long");
        return;
      }

      try {
        const response = await fetch("/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: signupName,
            email: signupEmail,
            password: signupPassword,
          }),
        });
        const data = await response.json();

        if (response.ok) {
          localStorage.setItem("email", signupEmail); // <--- Ensure email is saved
          patchProfileDropdownAfterAuth();
          alert("Sign up successful!");
          if (signupModal) {
            signupModal.style.display = "none";
            loginModal.style.display = "flex";
          }
        } else {
          if (data.message) {
            alert(data.message);
          } else if (
            response.status === 400 &&
            data.message === "User already exists"
          ) {
            alert(
              "Email already exists. Please use a different email address."
            );
          } else {
            alert("Sign up failed. Please try again later.");
          }
        }
      } catch (err) {
        console.error("Error during sign up:", err);
        alert("Network error. Please check your connection and try again.");
      }
    });
  }

  updateProfileDropdown();

  // Password visibility toggles for both login and signup forms
  const toggleLoginPassword = document.querySelector(".login-toggle-password");
  const toggleSignupPassword = document.querySelector(
    ".signup-toggle-password"
  );
  const loginPasswordInput = document.getElementById("password");
  const signupPasswordInput = document.getElementById("signupPassword");

  // Contact form handling
  const contactForm = document.getElementById("contactForm");

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const sendBtn = document.getElementById("sendBtn");
      const formStatus = document.getElementById("formStatus");

      // Show loading state
      sendBtn.disabled = true;
      sendBtn.textContent = "Sending...";

      // Send email using EmailJS's sendForm
      emailjs
        .sendForm("service_taak621", "template_jbyd8pe", contactForm)
        .then(
          function (response) {
            console.log("SUCCESS!", response.status, response.text);
            formStatus.textContent = "Message sent successfully!";
            formStatus.className = "success";
            contactForm.reset();
          },
          function (error) {
            console.error("FAILED...", error);
            formStatus.textContent = "Failed to send message. Please try again.";
            formStatus.className = "error";
          }
        )
        .finally(() => {
          // Reset button state
          sendBtn.disabled = false;
          sendBtn.textContent = "Send";

          // Show status
          formStatus.style.display = "block";

          // Remove status after 5 seconds
          setTimeout(() => {
            formStatus.style.display = "none";
            formStatus.className = "";
          }, 5000);
        });
    });
  }

  // Password toggle functionality
  if (toggleLoginPassword && loginPasswordInput) {
    toggleLoginPassword.addEventListener("click", function () {
      const type = loginPasswordInput.getAttribute("type") === "password" ? "text" : "password";
      loginPasswordInput.setAttribute("type", type);
      this.classList.toggle("fa-eye");
      this.classList.toggle("fa-eye-slash");
    });
  }

  if (toggleSignupPassword && signupPasswordInput) {
    toggleSignupPassword.addEventListener("click", function () {
      const type = signupPasswordInput.getAttribute("type") === "password" ? "text" : "password";
      signupPasswordInput.setAttribute("type", type);
      this.classList.toggle("fa-eye");
      this.classList.toggle("fa-eye-slash");
    });
  }

  // Write review button functionality
  const writeReviewBtn = document.querySelector(".write-review-btn");
  if (writeReviewBtn) {
    writeReviewBtn.addEventListener("click", function (e) {
      e.preventDefault();
      if (!isLoggedIn()) {
        showLoginModal();
      } else {
        alert("You can now write a review!");
      }
    });
  }

  // ---------- MODAL CLOSE WHEN CLICKING OUTSIDE ----------
  if (loginModal) {
    loginModal.addEventListener("click", function (e) {
      if (e.target === this) {
        this.style.display = "none";
      }
    });
  }

  if (signupModal) {
    signupModal.addEventListener("click", function (e) {
      if (e.target === this) {
        this.style.display = "none";
      }
    });
  }

  // ---------- SWITCH BETWEEN SIGN UP AND LOGIN MODALS ----------
  const signupLink = document.querySelector(".signup-link");
  const loginLink = document.querySelector(".login-link");

  if (signupLink) {
    signupLink.addEventListener("click", function (e) {
      e.preventDefault();
      if (loginModal) loginModal.style.display = "none";
      if (signupModal) signupModal.style.display = "flex";
    });
  }

  if (loginLink) {
    loginLink.addEventListener("click", function (e) {
      e.preventDefault();
      if (signupModal) signupModal.style.display = "none";
      if (loginModal) loginModal.style.display = "flex";
    });
  }

  const profileButton = document.querySelector(".profile-btn");
  if (profileButton) {
    profileButton.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = "/customize_account.html";
    });
  }

  // --- Save Scent Button Logic ---
  document.querySelectorAll(".save-scent-btn").forEach((button) => {
    button.addEventListener("click", async function () { 
      const token = localStorage.getItem('token'); 
      if (!token) {
        alert("Please log in to save scents.");
        return;
      }

      const productCard = button.closest(".product-info") || button.closest(".modal-body");
      if (!productCard) {
        console.error("Could not find product container element.");
        alert("Error saving scent. Could not find product details.");
        return;
      }

      const productId = button.dataset.productId;
      let productName = "Unknown Product";
      let productBrand = "Unknown Brand";
      let productImageUrl = "";
      let productOrderUrl = "#";

      // Use h2 selector based on the provided HTML modal structure
      const nameElement = productCard.querySelector("h2"); 
      if (nameElement) productName = nameElement.textContent.trim();

      const brandElement = Array.from(productCard.querySelectorAll(".detail-item strong")).find(el => el.textContent.includes("Brand:"));
      if (brandElement && brandElement.nextSibling) {
          productBrand = brandElement.nextSibling.textContent.trim();
      } else {
          const brandDiv = Array.from(productCard.querySelectorAll(".detail-item")).find(div => div.textContent.includes("Brand:"));
          if (brandDiv) productBrand = brandDiv.textContent.replace("Brand:", "").trim();
      }

      const imageElement = productCard.querySelector("img");
      if (imageElement) productImageUrl = imageElement.src;

      const orderButton = productCard.querySelector(".order-btn");
      if (orderButton) {
          const onclickAttr = orderButton.getAttribute('onclick');
          if (onclickAttr && onclickAttr.includes('window.location.href=')) {
              const urlMatch = onclickAttr.match(/window\.location\.href='([^']+)'/);
              if (urlMatch && urlMatch[1]) {
                  productOrderUrl = urlMatch[1];
              }
          } else if (orderButton.href) {
              productOrderUrl = orderButton.href;
          }
      }

      const scentData = {
        productId: productId,
        name: productName,
        brand: productBrand,
        image: productImageUrl,
        orderUrl: productOrderUrl,
      };

      const originalText = button.textContent;
      button.textContent = "Saving...";
      button.disabled = true;

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
              button.textContent = "Saved!";
              setTimeout(() => {
                  button.textContent = originalText; 
                  button.disabled = false; 
              }, 2000); 
          } else if (response.status === 401) {
              alert("Your session may have expired. Please log in again.");
              button.textContent = originalText;
              button.disabled = false;
          } else if (response.status === 409) { 
              alert("This scent is already saved!");
              button.textContent = originalText;
              button.disabled = false;
          } else {
              console.error('Error saving scent:', response.status, await response.text());
              alert(`Error saving scent (${response.status}). Please try again later.`);
              button.textContent = originalText;
              button.disabled = false;
          }
      } catch (error) {
          console.error('Network error saving scent:', error);
          alert("Network error saving scent. Please check your connection.");
          button.textContent = originalText;
          button.disabled = false;
      }
    });
  });
  // --- End Save Scent Button Logic ---

  function openModal() {
    document.getElementById('productModal').style.display = 'block';
  }

  function closeModal() {
    document.getElementById('productModal').style.display = 'none';
  }

  // Close modal when clicking outside of it
  window.onclick = function(event) {
    const modal = document.getElementById('productModal');
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  }
});

const togglePassword = document.querySelector(".toggle-password");
const passwordInput = document.getElementById("password");

if (togglePassword) {
  togglePassword.addEventListener("click", function () {
    const type =
      passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);
    this.classList.toggle("fa-eye");
    this.classList.toggle("fa-eye-slash");
  });
}

document.addEventListener("DOMContentLoaded", function () {
  // Existing modal elements
  const loginModal = document.querySelector(".login-modal");

  // Function to check login status
  function isLoggedIn() {
    return localStorage.getItem("token") !== null;
  }

  // Function to show login modal - make it globally available
  window.showLoginModal = function() {
    if (loginModal) {
      loginModal.style.display = "flex";
    }
  }

  // Event listener for "Write a Review" button
  const writeReviewBtn = document.querySelector(".write-review-btn");
  if (writeReviewBtn) {
    writeReviewBtn.addEventListener("click", function (e) {
      e.preventDefault();
      if (!isLoggedIn()) {
        showLoginModal();
      } else {
        alert("You can now write a review!"); // Replace with actual review functionality
      }
    });
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const sliderWrapper = document.querySelector(".slider-wrapper");
  const nextBtn = document.querySelector(".next-btn");
  const prevBtn = document.querySelector(".prev-btn");
  let index = 0;

  nextBtn.addEventListener("click", () => {
    index = (index + 1) % 3;
    sliderWrapper.style.transform = `translateX(-${index * 100}%)`;
  });

  prevBtn.addEventListener("click", () => {
    index = (index - 1 + 3) % 3;
    sliderWrapper.style.transform = `translateX(-${index * 100}%)`;
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const scrollContainers = document.querySelectorAll(".scent-description");

  scrollContainers.forEach((container) => {
    const leftArrow = container.parentElement.querySelector(".left-arrow");
    const rightArrow = container.parentElement.querySelector(".right-arrow");

    leftArrow.classList.add("hidden");

    if (container.scrollWidth <= container.clientWidth) {
      rightArrow.classList.add("hidden");
    }

    container.addEventListener("scroll", () => {
      leftArrow.classList.toggle("hidden", container.scrollLeft === 0);
      rightArrow.classList.toggle(
        "hidden",
        Math.ceil(container.scrollLeft + container.clientWidth) >=
          container.scrollWidth
      );
    });

    leftArrow.addEventListener("click", () => {
      container.scrollBy({
        left: -container.clientWidth / 2,
        behavior: "smooth",
      });
    });

    rightArrow.addEventListener("click", () => {
      container.scrollBy({
        left: container.clientWidth / 2,
        behavior: "smooth",
      });
    });
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const contactForm = document.getElementById("contactForm");

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const sendBtn = document.getElementById("sendBtn");
      const formStatus = document.getElementById("formStatus");

      sendBtn.disabled = true;
      sendBtn.textContent = "Sending...";

      emailjs
        .sendForm("service_taak621", "template_jbyd8pe", contactForm)
        .then(
          function (response) {
            console.log("SUCCESS!", response.status, response.text);
            formStatus.textContent = "Message sent successfully!";
            formStatus.className = "success";
            contactForm.reset();
          },
          function (error) {
            console.error("FAILED...", error);
            formStatus.textContent =
              "Failed to send message. Please try again.";
            formStatus.className = "error";
          }
        )
        .finally(() => {
          sendBtn.disabled = false;
          sendBtn.textContent = "Send";

          formStatus.style.display = "block";

          setTimeout(() => {
            formStatus.style.display = "none";
            formStatus.className = "";
          }, 5000);
        });
    });
  }
});
