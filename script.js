document.addEventListener('DOMContentLoaded', () => {
    
    window.scrollTo(0, 0);

    const header = document.querySelector('.main-header');
    const navToggle = document.getElementById('navToggle');
    const mainNav = document.querySelector('.main-nav');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    const allAnimatedSections = document.querySelectorAll('.content-section.animate');
    const aboutItems = document.querySelectorAll('.article');
    const contactForm = document.querySelector('.contact-form');
    const contactInfo = document.querySelector('.contact-info');


    navToggle.addEventListener('click', () => {
        mainNav.classList.toggle('active');
        navToggle.querySelector('i').classList.toggle('fa-bars');
        navToggle.querySelector('i').classList.toggle('fa-times');
    });
    
    // === START: FIXED NAVIGATION CLICK HANDLER ===
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            // 1. Check if the link is an internal hash link (e.g., '#about')
            const isInternalScrollLink = targetId.startsWith('#');
            const targetSection = isInternalScrollLink ? document.querySelector(targetId) : null;

            if (isInternalScrollLink && targetSection) {
                // If it's an internal link, prevent default action and perform smooth scroll
                e.preventDefault(); 
                
                const headerHeight = header.getBoundingClientRect().height;

                window.scrollTo({
                    top: targetSection.offsetTop - headerHeight - 10, 
                    behavior: 'smooth'
                });
            }
            
            // 2. Close Mobile Navigation Menu for ALL clicks (internal and external)
            if (mainNav.classList.contains('active')) {
                // Use a short timeout to allow external links to start navigating before closing the menu
                setTimeout(() => {
                    mainNav.classList.remove('active');
                    navToggle.querySelector('i').classList.add('fa-bars');
                    navToggle.querySelector('i').classList.remove('fa-times');
                }, 100);
            }
        });
    });
    // === END: FIXED NAVIGATION CLICK HANDLER ===


    const navOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    };

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(link => link.classList.remove('active'));
                
                // Note: This logic only handles links with simple #IDs.
                // For cross-page links (index.html#section), this will fail to set 'active' on the home page.
                const targetLink = document.querySelector(`.main-nav a[href="#${entry.target.id}"]`);
                if (targetLink) {
                    targetLink.classList.add('active');
                }
            }
        });
    }, navOptions);

    sections.forEach(section => {
        navObserver.observe(section);
    });
    
    // Note: The original file had the smooth scroll logic duplicated here, which is now removed.
    
    
    const revealOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;

                element.classList.add('in-view');
                
                let staggerElements = [];
                if (element.id === 'article') {
                    staggerElements = article;
                } else if (element.id === 'contact') {
                    if (contactForm && contactInfo) {
                        contactForm.classList.add('animate');
                        contactInfo.classList.add('animate');
                        staggerElements = [contactForm, contactInfo];
                    }
                }
                
                staggerElements.forEach((el, index) => {
                    el.style.transitionDelay = `${(index * 0.15)}s`;
                    el.classList.add('in-view');
                });
                
                observer.unobserve(element);
            }
        });
    };

    const revealObserver = new IntersectionObserver(revealCallback, revealOptions);
    
    allAnimatedSections.forEach(element => {
        revealObserver.observe(element);
    });
});