function initExperience() {
    const items = document.querySelectorAll('.exp-scroll');
    
    // Intersection Observer for scroll reveal
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Once visible, no need to observe anymore
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    items.forEach(item => {
        observer.observe(item);
    });
}

// Support both direct load and component injection
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initExperience);
} else {
    // If injected, wait a tiny bit to ensure DOM elements are ready
    setTimeout(initExperience, 50);
}
