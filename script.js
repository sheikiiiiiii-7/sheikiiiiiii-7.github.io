document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element Selection ---
    const menuToggle = document.querySelector('.menu-toggle');
    const navList = document.querySelector('.nav-list'); // Ensure this selector is correct
    const mainNav = document.getElementById('mainNav'); // For sticky check and height calc
    const navLinks = document.querySelectorAll('#mainNav .nav-list a[href^="#"]'); // Target links within nav list
    const goTopBtn = document.getElementById('goTopBtn');
    const footerYearSpan = document.getElementById('footer-year');
    const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');
    // Select sections to track for active link highlighting
    const sections = document.querySelectorAll('main section[id]'); // Target sections within main with an ID

    // --- Mobile Menu Toggle ---
    if (menuToggle && navList) {
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isExpanded);
            navList.classList.toggle('active');

            // Toggle hamburger/close icon
            const icon = menuToggle.querySelector('i');
            if (navList.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
                // Optional: Prevent body scroll when menu is open
                // document.body.style.overflow = 'hidden';
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
                // Optional: Allow body scroll when menu is closed
                // document.body.style.overflow = '';
            }
        });
    } else {
        // console.error("Menu toggle or nav list not found."); // Debugging
    }

    // --- Smooth Scroll & Close Mobile Menu on Link Click ---
    if (navLinks.length > 0 && mainNav) {
        navLinks.forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    const navHeight = mainNav.offsetHeight;
                    // Adjust offset slightly more to prevent content hiding behind sticky nav
                    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight - 15;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                } else {
                    console.warn(`Target element "${targetId}" not found for smooth scroll.`);
                }

                // Close mobile menu if it's open after clicking a link
                if (navList && navList.classList.contains('active')) {
                    menuToggle.setAttribute('aria-expanded', 'false');
                    navList.classList.remove('active');
                    // Reset icon
                    const icon = menuToggle.querySelector('i');
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                    // document.body.style.overflow = '';
                }
            });
        });
    } else {
        // console.error("Navigation links or main nav element not found for smooth scroll setup."); // Debugging
    }

    // --- Close Mobile Menu on Click Outside ---
    if (menuToggle && navList && mainNav) {
        document.addEventListener('click', (e) => {
            // Check if the click is outside the nav element AND the menu is active
            // Also check if the click was not on the toggle button itself
            if (!mainNav.contains(e.target) && navList.classList.contains('active')) {
                menuToggle.setAttribute('aria-expanded', 'false');
                navList.classList.remove('active');
                // Reset icon
                const icon = menuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
                // document.body.style.overflow = '';
            }
        });
    }

    // --- Active Navigation Link Highlighting on Scroll ---
    const activateNavLink = () => {
        if (!mainNav || sections.length === 0 || navLinks.length === 0) return;

        let currentSectionId = '';
        const scrollPosition = window.pageYOffset;
        const navHeight = mainNav.offsetHeight;
        // Increased offset slightly for better accuracy when section is near top
        const offsetThreshold = navHeight + 80;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - offsetThreshold;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            // Check if the scroll position is within the current section bounds
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSectionId = sectionId;
            }
        });

         // Handle edge case: if scrolled past the last section, highlight the last link
         if (currentSectionId === '' && scrollPosition >= sections[sections.length - 1].offsetTop - offsetThreshold) {
             currentSectionId = sections[sections.length - 1].getAttribute('id');
         }

         // Handle edge case: If very close to the top, no section might be active
         if (scrollPosition < sections[0].offsetTop - offsetThreshold) {
             currentSectionId = ''; // Ensure no link is active at the very top
         }


        navLinks.forEach(link => {
            link.classList.remove('active-link');
            const linkHref = link.getAttribute('href');
            // Ensure linkHref is not null and matches `#${currentSectionId}`
            if (linkHref && linkHref === `#${currentSectionId}`) {
                link.classList.add('active-link');
            }
        });
    };

    // Attach scroll listener if sections exist
    if (sections.length > 0) {
        window.addEventListener('scroll', activateNavLink, { passive: true }); // Use passive listener for performance
        activateNavLink(); // Initial check on load
    }


    // --- Go Top Button Logic ---
    if (goTopBtn) {
        const showGoTopButton = () => {
            const triggerHeight = window.innerHeight * 0.5; // Show when scrolled 50% down
            if (window.pageYOffset > triggerHeight) {
                goTopBtn.classList.add('show');
            } else {
                goTopBtn.classList.remove('show');
            }
        };

        window.addEventListener('scroll', showGoTopButton, { passive: true }); // Use passive listener
        goTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        showGoTopButton(); // Initial check
    } else {
        // console.error("Go Top Button not found."); // Debugging
    }


    // --- Scroll Animations using Intersection Observer ---
    if ('IntersectionObserver' in window && elementsToAnimate.length > 0) {
        const observerOptions = {
            root: null, // relative to viewport
            rootMargin: '0px',
            threshold: 0.1 // Trigger animation when 10% of the element is visible
        };

        const observerCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    observer.unobserve(entry.target); // Stop observing once animated
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);
        elementsToAnimate.forEach(el => observer.observe(el));

    } else {
        // Fallback for browsers that don't support IntersectionObserver
        console.warn("IntersectionObserver not supported. Animating all elements immediately.");
        elementsToAnimate.forEach(el => el.classList.add('animated'));
    }


    // --- Update Footer Year ---
    if (footerYearSpan) {
        footerYearSpan.textContent = new Date().getFullYear();
    } else {
        // console.error("Footer year span not found."); // Debugging
    }

    // --- Schema Injection Confirmation ---
    // The actual injection happens via the inline script in HTML
    console.log("Shahnawaz Alam Portfolio Script Loaded Successfully.");

}); // End of DOMContentLoaded