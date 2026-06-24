document.addEventListener('DOMContentLoaded', () => {
  // --- 1. Dynamic Hero Carousel / Slider Loader & Control Logic ---
  const sliderContainer = document.getElementById('dynamic-slider-container');
  const dotsContainer = document.getElementById('dynamic-slider-dots');

  if (sliderContainer && dotsContainer) {
    let slideIndex = 1;
    let loadedSlides = [];
    let currentSlide = 0;
    let autoplayInterval;

    function checkAndLoadNextSlide() {
      // Pad to 2 digits: e.g. 1 -> "01", 2 -> "02"
      const paddedIndex = String(slideIndex).padStart(2, '0');
      const imgUrl = `Images/slide${paddedIndex}.png`;
      const fallbackImgUrl = `Images/slider${paddedIndex}.png`; // Support slider01.png, slider02.png...

      const img = new Image();
      img.src = imgUrl;

      img.onload = function() {
        loadedSlides.push(imgUrl);
        slideIndex++;
        checkAndLoadNextSlide(); // Try next slide
      };

      img.onerror = function() {
        // Try fallback URL (sliderXX.png)
        const fallbackImg = new Image();
        fallbackImg.src = fallbackImgUrl;
        
        fallbackImg.onload = function() {
          loadedSlides.push(fallbackImgUrl);
          slideIndex++;
          checkAndLoadNextSlide();
        };

        fallbackImg.onerror = function() {
          // Both failed, so we stop searching and initialize
          if (loadedSlides.length > 0) {
            buildAndInitializeSlider(loadedSlides);
          } else {
            // Ultimate fallback (just in case)
            buildAndInitializeSlider(['Images/slide01.png']);
          }
        };
      };
    }

    function buildAndInitializeSlider(slides) {
      // Clear containers
      sliderContainer.innerHTML = '';
      dotsContainer.innerHTML = '';

      slides.forEach((src, idx) => {
        // Create slide element
        const slideDiv = document.createElement('div');
        slideDiv.classList.add('slide');
        
        const slideImg = document.createElement('img');
        slideImg.src = src;
        slideImg.alt = `KIKI HUB Slide ${idx + 1}`;
        
        slideDiv.appendChild(slideImg);
        sliderContainer.appendChild(slideDiv);

        // Create dot element
        const dotSpan = document.createElement('span');
        dotSpan.classList.add('dot');
        if (idx === 0) dotSpan.classList.add('active');
        dotsContainer.appendChild(dotSpan);
      });

      const dots = dotsContainer.querySelectorAll('.dot');
      const slideCount = slides.length;

      if (slideCount > 1) {
        const goToSlide = (index) => {
          currentSlide = index;
          sliderContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
          
          dots.forEach((dot, i) => {
            if (i === currentSlide) {
              dot.classList.add('active');
            } else {
              dot.classList.remove('active');
            }
          });
        };

        const nextSlide = () => {
          let next = (currentSlide + 1) % slideCount;
          goToSlide(next);
        };

        dots.forEach((dot, index) => {
          dot.addEventListener('click', () => {
            goToSlide(index);
            resetAutoplay();
          });
        });

        const startAutoplay = () => {
          autoplayInterval = setInterval(nextSlide, 5000);
        };

        const resetAutoplay = () => {
          clearInterval(autoplayInterval);
          startAutoplay();
        };

        startAutoplay();
      } else {
        // Only 1 slide: hide navigation dots
        dotsContainer.style.display = 'none';
      }
    }

    checkAndLoadNextSlide();
  }

  // --- 3. ScrollSpy for Home Page (Main vs Feature) ---
  const featureSection = document.getElementById('feature');
  const featureNavLink = document.querySelector('nav a[href="index.html#feature"]');
  const homeNavLink = document.querySelector('nav a[href="index.html"]');

  if (featureSection && featureNavLink) {
    window.addEventListener('scroll', () => {
      const rect = featureSection.getBoundingClientRect();
      // If feature section is visible on screen
      if (rect.top <= 120 && rect.bottom >= 120) {
        featureNavLink.classList.add('active');
        if (homeNavLink) homeNavLink.classList.remove('active');
      } else {
        featureNavLink.classList.remove('active');
        if (homeNavLink) homeNavLink.classList.add('active');
      }
    });
  }

  // --- 4. Buy Me A Coffee Widget Click Logger (For fun / interaction) ---
  const coffeeWidget = document.querySelector('.coffee-widget');
  if (coffeeWidget) {
    coffeeWidget.addEventListener('mouseenter', () => {
      const heart = coffeeWidget.querySelector('.coffee-heart');
      if (heart) {
        heart.style.transform = 'translateY(-2px) scale(1.1)';
        heart.style.transition = 'transform 0.2s ease';
      }
    });
    
    coffeeWidget.addEventListener('mouseleave', () => {
      const heart = coffeeWidget.querySelector('.coffee-heart');
      if (heart) {
        heart.style.transform = 'none';
      }
    });
  }
});
