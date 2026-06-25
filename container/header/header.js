function initHeader() {
    // --- Resolve logo path from pages with different folder depth ---
    const logoImg = document.querySelector('.logo-img');
    if (logoImg) {
        const logoPaths = [
            'Assets/Rumon.webp',
            '../Assets/Rumon.webp',
            '../../Assets/Rumon.webp',
            '../../../Assets/Rumon.webp'
        ];
        let currentLogoPath = 0;

        logoImg.src = logoPaths[currentLogoPath];
        logoImg.onerror = () => {
            currentLogoPath += 1;
            if (currentLogoPath < logoPaths.length) {
                logoImg.src = logoPaths[currentLogoPath];
            }
        };
    }

    // --- Sticky Header on Scroll ---
    const header = document.getElementById('main-header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('is-sticky');
            } else {
                header.classList.remove('is-sticky');
            }
        });
    }

    // --- Mobile Menu Logic ---
    const mobileToggle = document.querySelector('.mobile-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item');

    if (mobileToggle && mobileMenu) {
        mobileToggle.addEventListener('click', () => {
            mobileToggle.classList.toggle('is-active');
            mobileMenu.classList.toggle('is-active');
            document.body.style.overflow = mobileMenu.classList.contains('is-active') ? 'hidden' : 'auto';
        });

        mobileNavItems.forEach(item => {
            item.addEventListener('click', () => {
                mobileToggle.classList.remove('is-active');
                mobileMenu.classList.remove('is-active');
                document.body.style.overflow = 'auto';
            });
        });
    }

    // --- Active Link Highlighting ---
    const currentPath = window.location.pathname;
    const navItems = document.querySelectorAll('.nav-item');
    const mobileItems = document.querySelectorAll('.mobile-nav-item');

    function setActiveLink(items) {
        items.forEach(item => {
            const href = item.getAttribute('href');
            // Remove active class first
            item.classList.remove('active');
            
            // Check if href matches current path
            if (currentPath.includes(href) && href !== 'Index.html' && href !== '/') {
                item.classList.add('active');
            } else if ((currentPath === '/' || currentPath.includes('Index.html')) && (href === 'Index.html#home' || href === '#home')) {
                item.classList.add('active');
            }
        });
    }

    setActiveLink(navItems);
    setActiveLink(mobileItems);

    // --- Smooth Scrolling for internal hash links ---
    document.querySelectorAll('a[href^="#"], a[href^="Index.html#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            const isHomePath = window.location.pathname.endsWith('Index.html') || window.location.pathname.endsWith('/');
            
            if (isHomePath) {
                const targetId = href.split('#')[1];
                if (targetId) {
                    const targetElement = document.getElementById(targetId);
                    if (targetElement) {
                        e.preventDefault();
                        window.history.pushState(null, null, '#' + targetId);
                        
                        const headerOffset = document.getElementById('main-header')?.offsetHeight || 80;
                        const elementPosition = targetElement.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.scrollY - headerOffset;
                        
                        window.scrollTo({
                            top: offsetPosition,
                            behavior: "smooth"
                        });
                        
                        // Close mobile menu if open
                        if (mobileToggle && mobileMenu) {
                            mobileToggle.classList.remove('is-active');
                            mobileMenu.classList.remove('is-active');
                            document.body.style.overflow = 'auto';
                        }
                    }
                }
            }
        });
    });
}

// Run init on DOMContentLoaded or immediately if already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeader);
} else {
    initHeader();
}
