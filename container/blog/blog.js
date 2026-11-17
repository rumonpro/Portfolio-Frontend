// Blog Slider & Interactive Modal Logic
var IS_LOCAL_ENV = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
var BACKEND_BASE_URL = IS_LOCAL_ENV ? "http://localhost:5000" : "https://portfolio-backend-h88g.vercel.app";

const DEFAULT_BLOGS = [
    {
        _id: "blog_201",
        title: "Securing Modern Web Applications: Defending Against the OWASP Top 10",
        content: "Web application security is no longer an afterthought—it is a critical pillar of software engineering. Every day, thousands of web applications fall victim to common vulnerabilities because basic defensive coding practices are overlooked.\n\nIn this article, we dive deep into the most prevalent risks outlined in the OWASP Top 10, including Broken Access Control, Cryptographic Failures, and Injection Flaws. We will explore how modern attack vectors exploit unchecked input parameters and how developers can build resilient defense-in-depth architectures.\n\nKey countermeasures include implementing parameterized queries to neutralize SQL injection, enforcing strict Role-Based Access Control (RBAC) at the route level, and sanitizing all incoming payloads. Furthermore, integrating Automated Dynamic Application Security Testing (DAST) into continuous deployment pipelines ensures vulnerabilities are flagged before production releases.",
        author: "Admin",
        image: "Assets/1.jpg",
        tags: ["Cyber Security", "OWASP", "Web Protection", "Penetration Testing"],
        createdAt: "2026-11-14T09:00:00.000Z"
    },
    {
        _id: "blog_202",
        title: "WordPress Hardening Checklist 2026: Fortifying Against Advanced Attacks",
        content: "Powering over 40% of the web, WordPress is undeniably the most popular CMS on the planet—and consequently the biggest target for automated exploit scanners and credential stuffers.\n\nTo keep WordPress installations rock solid, administrators must look beyond simple security plugins. Essential hardening steps begin with locking down file permissions: ensuring wp-config.php is non-writable and moving it above the public root directory.\n\nDisabling XML-RPC is crucial unless explicitly required by remote publishing apps, as attackers routinely abuse it for brute-force attacks and pingback DDoS reflection. Additionally, always hide the WordPress version number, enforce Two-Factor Authentication (2FA) for all administrator accounts, and implement automated weekly database integrity backups.",
        author: "Admin",
        image: "Assets/2.jpg",
        tags: ["WordPress", "Security", "CMS", "Web Development"],
        createdAt: "2026-11-13T09:00:00.000Z"
    },
    {
        _id: "blog_203",
        title: "Zero-Trust Architecture: Why Traditional Network Perimeters Fail",
        content: "For decades, enterprise security relied on castle-and-moat models: perimeter firewalls kept the bad actors out, while everything inside the private network was trusted implicitly. However, the rise of cloud infrastructure and distributed remote workforces has rendered this paradigm completely obsolete.\n\nZero-Trust Architecture (ZTA) operates on one fundamental core tenet: 'Never trust, always verify'. Regardless of whether a request originates inside or outside the network perimeter, every transaction must be explicitly authenticated, authorized, and cryptographically verified.\n\nBy leveraging micro-segmentation, identity-aware proxies, and continuous posture evaluation, organizations can dramatically minimize lateral movement in the event of a breach, ensuring single compromised credentials do not jeopardize the entire infrastructure.",
        author: "Admin",
        image: "Assets/3.jpg",
        tags: ["Zero Trust", "Cloud Security", "Enterprise", "Network"],
        createdAt: "2026-11-12T09:00:00.000Z"
    },
    {
        _id: "blog_204",
        title: "100/100 Google Lighthouse: Achieving Peak Front-End Performance",
        content: "Website speed is directly tied to conversions, bounce rates, and organic search ranking. Achieving a perfect 100/100 score on Google Lighthouse requires meticulous attention to the critical rendering path.\n\nStart by eliminating render-blocking resources: defer non-critical JavaScript and preload crucial web fonts using preconnect links. Modern CSS techniques like content-visibility: auto allow browsers to skip rendering offscreen elements until the user scrolls near them, dramatically cutting down initial DOM computation.\n\nFor animations, avoid animating layout properties like top, left, width, or height. Instead, stick strictly to transform and opacity, which run directly on the GPU compositor thread without triggering costly browser repaints.",
        author: "Admin",
        image: "Assets/4.jpg",
        tags: ["Frontend", "Performance", "Optimization", "JavaScript"],
        createdAt: "2026-11-11T09:00:00.000Z"
    },
    {
        _id: "blog_205",
        title: "RESTful API Security: Token Management, Rate Limiting & CSRF",
        content: "Building APIs that scale reliably requires more than just clean REST design; robust security controls must be embedded into every route handler.\n\nOne common architectural mistake is storing JWT access tokens in browser localStorage, making them easily extractable via Cross-Site Scripting (XSS). A significantly more secure approach is utilizing HttpOnly, Secure, SameSite=Strict cookies coupled with short token expiration windows and rotating refresh tokens.\n\nMoreover, enforcing IP-based and user-based rate limiting via in-memory Redis stores protects sensitive endpoints (such as login and password reset) against distributed brute force attacks, while input schema validation prevents unexpected parameter pollution.",
        author: "Admin",
        image: "Assets/5.jpg",
        tags: ["API Security", "Node.js", "Express", "JWT"],
        createdAt: "2026-11-10T09:00:00.000Z"
    },
    {
        _id: "blog_206",
        title: "The Evolution of Threat Hunting: AI in Modern SOC Operations",
        content: "As cyber threats become increasingly automated and sophisticated, security operations centers (SOCs) can no longer rely solely on static signatures and manual log inspection.\n\nArtificial Intelligence and Machine Learning models have revolutionized threat detection by baselining normal network behavior and detecting subtle telemetry deviations in real time. From spotting anomalous outbound DNS tunnels to identifying lateral credential abuse, AI-driven SIEM solutions provide analysts with actionable risk scores.\n\nBy automating repetitive triage tasks, security teams can concentrate on complex incident response and proactive adversary emulation, staying one step ahead of advanced persistent threat (APT) actors.",
        author: "Admin",
        image: "Assets/6.jpg",
        tags: ["AI", "Threat Hunting", "Cyber Security", "Automation"],
        createdAt: "2026-11-09T09:00:00.000Z"
    }
];

let currentSlide = 0;
let totalBlogs = 0;
let blogsData = [];

async function fetchBlogsWithFallback() {
    const urls = [];
    if (IS_LOCAL_ENV) {
        urls.push('http://localhost:5000/api/blogs');
    }
    urls.push('https://portfolio-backend-h88g.vercel.app/api/blogs');

    for (const url of urls) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3500);
            const res = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    return data;
                }
            }
        } catch (e) {
            console.warn(`Failed fetching blogs from ${url}:`, e.message);
        }
    }
    return DEFAULT_BLOGS;
}

function resolveBlogImageUrl(rawUrl) {
    if (!rawUrl || typeof rawUrl !== 'string') return './Assets/1.jpg';
    const trimmed = rawUrl.trim();
    if (!trimmed) return './Assets/1.jpg';
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
        return trimmed;
    }
    if (trimmed.startsWith('Assets/') || trimmed.startsWith('./Assets/')) {
        return trimmed;
    }
    if (trimmed.startsWith('/uploads/')) return `${BACKEND_BASE_URL}${trimmed}`;
    if (trimmed.startsWith('uploads/')) return `${BACKEND_BASE_URL}/${trimmed}`;
    return trimmed;
}

async function loadBlogs() {
    const blogGrid = document.getElementById('blogGrid');
    if (!blogGrid) return;

    try {
        blogsData = await fetchBlogsWithFallback();
        totalBlogs = blogsData.length;

        if (totalBlogs === 0) {
            blogGrid.innerHTML = '<div class="blog-error">No blogs published yet</div>';
            return;
        }

        blogGrid.innerHTML = '';

        blogsData.forEach((blog) => {
            const blogCard = createBlogCard(blog);
            blogGrid.appendChild(blogCard);
        });

        initSlider();
        initBlogModalListeners();

    } catch (error) {
        console.error('Error loading blogs:', error);
        blogGrid.innerHTML = `<div class="blog-error">Error loading blogs. Please try again later.</div>`;
    }
}

function createBlogCard(blog) {
    const card = document.createElement('div');
    card.className = 'blog-card';
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Read ${blog.title}`);

    const date = new Date(blog.createdAt);
    const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    const preview = blog.content.length > 150
        ? blog.content.substring(0, 150) + '...'
        : blog.content;

    const imageUrl = resolveBlogImageUrl(blog.image);

    card.innerHTML = `
        <div class="blog-card-image">
            <img src="${imageUrl}" alt="${blog.title}" onerror="this.src='./Assets/1.jpg'">
            <span class="blog-card-date">${formattedDate}</span>
        </div>
        <div class="blog-card-content">
            <h3>${blog.title}</h3>
            <p>${preview}</p>
            <a href="javascript:void(0)" class="blog-read-more" data-blog-id="${blog._id}">Read More →</a>
        </div>
    `;

    // Click on "Read More →" opens the modal
    const readMoreBtn = card.querySelector('.blog-read-more');
    if (readMoreBtn) {
        readMoreBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openBlogModal(blog);
        });
    }

    // Single click on card opens modal immediately
    card.addEventListener('click', (e) => {
        openBlogModal(blog);
    });

    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openBlogModal(blog);
        }
    });

    return card;
}

// Blog Detail Modal Logic
function openBlogModal(blog) {
    const modal = document.getElementById('blogModal');
    if (!modal) return;

    const modalImg = document.getElementById('blogModalImg');
    const modalDate = document.getElementById('blogModalDate');
    const modalCategory = document.getElementById('blogModalCategory');
    const modalAuthor = document.getElementById('blogModalAuthor');
    const modalTitle = document.getElementById('blogModalTitle');
    const modalTags = document.getElementById('blogModalTags');
    const modalBody = document.getElementById('blogModalBody');
    const fullPageBtn = document.getElementById('blogModalFullPageBtn');

    if (modalImg) modalImg.src = resolveBlogImageUrl(blog.image);
    if (modalDate) {
        modalDate.innerText = new Date(blog.createdAt || Date.now()).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).toUpperCase();
    }

    const tags = Array.isArray(blog.tags) ? blog.tags : [];
    const primaryTag = tags[0] || 'CYBER SECURITY';
    if (modalCategory) modalCategory.innerHTML = `<i class="fas fa-folder"></i> ${primaryTag.toUpperCase()}`;
    if (modalAuthor) modalAuthor.innerText = (blog.author || 'ADMIN').toUpperCase();
    if (modalTitle) modalTitle.innerText = blog.title || 'Untitled Blog';

    if (modalTags) {
        if (tags.length > 0) {
            modalTags.innerHTML = tags.map(t => `<span>#${t}</span>`).join('');
            modalTags.style.display = 'flex';
        } else {
            modalTags.style.display = 'none';
        }
    }

    if (modalBody) {
        const paragraphs = String(blog.content || '')
            .split(/\n+/)
            .map(p => p.trim())
            .filter(Boolean);
        modalBody.innerHTML = paragraphs.length > 0
            ? paragraphs.map(p => `<p>${p}</p>`).join('')
            : '<p>No content available.</p>';
    }

    if (fullPageBtn) {
        fullPageBtn.href = `blog-details.html?id=${encodeURIComponent(blog._id)}`;
        fullPageBtn.onclick = () => {
            try {
                sessionStorage.setItem('selectedBlogId', blog._id);
            } catch (e) {}
        };
    }

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeBlogModal() {
    const modal = document.getElementById('blogModal');
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = 'auto';
}

function initBlogModalListeners() {
    const closeBtn = document.getElementById('blogModalCloseBtn');
    const dismissBtn = document.getElementById('blogModalDismissBtn');
    const modal = document.getElementById('blogModal');

    if (closeBtn) closeBtn.onclick = closeBlogModal;
    if (dismissBtn) dismissBtn.onclick = closeBlogModal;

    if (modal) {
        modal.onclick = (e) => {
            if (e.target === modal) closeBlogModal();
        };
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('is-open')) {
            closeBlogModal();
        }
    });
}

function initSlider() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const blogDots = document.getElementById('blogDots');
    const blogGrid = document.getElementById('blogGrid');

    if (!prevBtn || !nextBtn || !blogDots || !blogGrid) return;

    const getVisibleCards = () => {
        if (window.innerWidth <= 768) return 1;
        if (window.innerWidth <= 1024) return 2;
        return 4;
    };

    const updateSlider = () => {
        const firstCard = blogGrid.querySelector('.blog-card');
        if (!firstCard) return;

        const cardWidth = firstCard.offsetWidth;
        const gap = 30;
        const moveDistance = cardWidth + gap;

        blogGrid.style.transform = `translateX(-${currentSlide * moveDistance}px)`;

        const dots = blogDots.querySelectorAll('.blog-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });

        const cardsVisible = getVisibleCards();
        prevBtn.disabled = currentSlide === 0;
        nextBtn.disabled = currentSlide >= Math.max(0, totalBlogs - cardsVisible);

        prevBtn.style.opacity = prevBtn.disabled ? '0.4' : '1';
        nextBtn.style.opacity = nextBtn.disabled ? '0.4' : '1';
    };

    const buildDots = () => {
        blogDots.innerHTML = '';
        const cardsVisible = getVisibleCards();
        const dotsCount = Math.max(1, totalBlogs - cardsVisible + 1);

        for (let i = 0; i < dotsCount; i++) {
            const dot = document.createElement('div');
            dot.className = 'blog-dot';
            if (i === currentSlide) dot.classList.add('active');
            dot.addEventListener('click', () => {
                currentSlide = i;
                updateSlider();
            });
            blogDots.appendChild(dot);
        }
    };

    buildDots();
    updateSlider();

    prevBtn.onclick = () => {
        if (currentSlide > 0) {
            currentSlide--;
            updateSlider();
        }
    };

    nextBtn.onclick = () => {
        const cardsVisible = getVisibleCards();
        if (currentSlide < totalBlogs - cardsVisible) {
            currentSlide++;
            updateSlider();
        }
    };

    window.addEventListener('resize', () => {
        const cardsVisible = getVisibleCards();
        const maxSlide = Math.max(0, totalBlogs - cardsVisible);
        if (currentSlide > maxSlide) {
            currentSlide = maxSlide;
        }
        buildDots();
        updateSlider();
    }, { passive: true });
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadBlogs);
} else {
    loadBlogs();
}
