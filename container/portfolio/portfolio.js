// Portfolio Data Loading
var IS_LOCAL_ENV = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
var BACKEND_BASE_URL = IS_LOCAL_ENV ? "http://localhost:5000" : "https://portfolio-backend-h88g.vercel.app";

const DEFAULT_PROJECTS = [
    {
        _id: "proj_101",
        name: "CyberGuard - Enterprise Vulnerability Scanner",
        description: "An automated web security auditing and penetration testing platform designed to scan web applications for OWASP Top 10 vulnerabilities, SSL misconfigurations, header leaks, and open ports.",
        techStack: ["Python", "OWASP ZAP", "Bash", "Docker", "Security"],
        liveLink: "https://github.com/rumonpro",
        githubLink: "https://github.com/rumonpro",
        image: "Assets/1.jpg",
        category: "Cyber Security"
    },
    {
        _id: "proj_102",
        name: "Qnifly Digital - Corporate Agency Platform",
        description: "Full-scale modern corporate website for a high-impact digital solutions agency, featuring custom dynamic service modules, responsive interactive UI, and 98+ PageSpeed optimization.",
        techStack: ["WordPress", "Elementor Pro", "PHP", "JavaScript", "CSS3"],
        liveLink: "https://github.com/rumonpro",
        githubLink: "https://github.com/rumonpro",
        image: "Assets/2.jpg",
        category: "Web Development"
    },
    {
        _id: "proj_103",
        name: "SecureVault - Zero-Knowledge Cloud Storage",
        description: "End-to-end encrypted personal cloud storage application featuring client-side AES-256-GCM encryption, granular file sharing permissions, and cryptographic integrity verification.",
        techStack: ["React", "Node.js", "Express", "MongoDB", "AES-256"],
        liveLink: "https://github.com/rumonpro",
        githubLink: "https://github.com/rumonpro",
        image: "Assets/3.jpg",
        category: "Full Stack"
    },
    {
        _id: "proj_104",
        name: "Luxora Store - High-Performance eCommerce",
        description: "Ultra-fast online shopping experience featuring custom product customizers, Stripe multi-currency checkout, automated cart recovery, and lightning 1.1s load time.",
        techStack: ["WooCommerce", "WordPress", "Stripe API", "Tailwind CSS"],
        liveLink: "https://github.com/rumonpro",
        githubLink: "https://github.com/rumonpro",
        image: "Assets/4.jpg",
        category: "CMS & E-Commerce"
    },
    {
        _id: "proj_105",
        name: "Sentinel Shield - Real-Time Web Application Firewall",
        description: "High-throughput reverse proxy inspection engine that detects SQL Injection, Cross-Site Scripting (XSS), and Layer 7 DDoS threats with sub-millisecond overhead and real-time blocking.",
        techStack: ["Node.js", "Express", "Redis", "Cloudflare API", "Security"],
        liveLink: "https://github.com/rumonpro",
        githubLink: "https://github.com/rumonpro",
        image: "Assets/5.jpg",
        category: "Cyber Security"
    },
    {
        _id: "proj_106",
        name: "DevFolio Pro - Interactive Portfolio & CMS",
        description: "State-of-the-art dark theme developer portfolio powered by GPU-accelerated canvas particles, dynamic REST API CMS, JWT authentication, and interactive visitor analytics.",
        techStack: ["HTML5", "CSS3", "JavaScript", "Node.js", "Express"],
        liveLink: "https://portfolio-frontend-one-theta-46.vercel.app/Index.html",
        githubLink: "https://github.com/rumonpro/Portfolio-Frontend",
        image: "Assets/6.jpg",
        category: "Full Stack"
    },
    {
        _id: "proj_107",
        name: "Apex Fitness - Subscription & Booking Portal",
        description: "Modern fitness club management web app featuring automated class scheduling, membership recurring billing via Stripe, SMS alerts, and personalized trainer dashboard.",
        techStack: ["React", "Node.js", "MongoDB", "Stripe", "Tailwind"],
        liveLink: "https://github.com/rumonpro",
        githubLink: "https://github.com/rumonpro",
        image: "Assets/7.jpg",
        category: "Web Development"
    },
    {
        _id: "proj_108",
        name: "PassKey Auth - Biometric & FIDO2 Identity Provider",
        description: "Passwordless authentication service implementing WebAuthn Passkeys, TOTP two-factor authentication, device fingerprinting, and automatic brute-force IP rate limiting.",
        techStack: ["TypeScript", "Express", "WebAuthn", "JWT", "MongoDB"],
        liveLink: "https://github.com/rumonpro",
        githubLink: "https://github.com/rumonpro",
        image: "Assets/8.jpg",
        category: "Cyber Security"
    }
];

async function fetchProjectsWithFallback() {
    const urls = [];
    if (IS_LOCAL_ENV) {
        urls.push('http://localhost:5000/api/projects');
    }
    urls.push('https://portfolio-backend-h88g.vercel.app/api/projects');

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
            console.warn(`Failed fetching projects from ${url}:`, e.message);
        }
    }
    return DEFAULT_PROJECTS;
}

async function loadProjects() {
    const portfolioGrid = document.getElementById('portfolioGrid');
    if (!portfolioGrid) return;

    try {
        const rawProjects = await fetchProjectsWithFallback();
        const projects = rawProjects.slice(0, 8);

        if (projects.length === 0) {
            portfolioGrid.innerHTML = '<div class="portfolio-error">No projects uploaded yet</div>';
            return;
        }

        portfolioGrid.innerHTML = '';

        projects.forEach(project => {
            const card = createPortfolioCard(project);
            portfolioGrid.appendChild(card);
        });

        // Initialize particles for new cards
        initPortfolioCardParticles();
        initProjectModalListeners();

    } catch (error) {
        console.error('Error loading projects:', error);
        portfolioGrid.innerHTML = '<div class="portfolio-error">Error loading projects. Please try again later.</div>';
    }
}

function resolveProjectImageUrl(rawUrl) {
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

function createPortfolioCard(project) {
    const card = document.createElement('div');
    card.className = 'portfolio-card';
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `View details for ${project.name}`);

    const imageUrl = resolveProjectImageUrl(project.image);
    const maxChars = 250;
    const truncatedDesc = project.description && project.description.length > maxChars
        ? project.description.substring(0, maxChars) + '...'
        : (project.description || '');

    const techTags = Array.isArray(project.techStack)
        ? project.techStack.slice(0, 4).map(tag => `<span>${tag}</span>`).join('')
        : '';

    card.innerHTML = `
        <div class="card-image-box">
            <img src="${imageUrl}" alt="${project.name}" onerror="this.src='./Assets/1.jpg'">
        </div>
        <div class="card-content-box">
            <canvas class="portfolio-card-canvas" aria-hidden="true"></canvas>
            <span class="card-category-tag">${project.category || 'General'}</span>
            <h3>${project.name}</h3>
            <p>${truncatedDesc}</p>
            ${techTags ? `<div class="project-tags">${techTags}</div>` : ''}
            <div class="project-links">
                ${project.liveLink ? `<a href="${project.liveLink}" target="_blank" rel="noopener noreferrer" class="project-link" onclick="event.stopPropagation()"><i class="fas fa-external-link-alt"></i> Live Preview</a>` : ''}
                ${project.githubLink ? `<a href="${project.githubLink}" target="_blank" rel="noopener noreferrer" class="project-link github-link" onclick="event.stopPropagation()"><i class="fab fa-github"></i> GitHub</a>` : ''}
            </div>
        </div>
    `;

    // Single click immediately opens modal
    card.addEventListener('click', (e) => {
        if (e.target.closest('a')) return;
        openProjectModal(project);
    });

    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openProjectModal(project);
        }
    });

    return card;
}

// Project Details Modal Handling
function openProjectModal(project) {
    const modal = document.getElementById('projectModal');
    if (!modal) return;

    const modalImg = document.getElementById('modalImg');
    const modalCategory = document.getElementById('modalCategory');
    const modalTitle = document.getElementById('modalTitle');
    const modalDesc = document.getElementById('modalDesc');
    const techContainer = document.getElementById('modalTechStack');
    const liveBtn = document.getElementById('modalLiveBtn');
    const githubBtn = document.getElementById('modalGithubBtn');

    if (modalImg) modalImg.src = resolveProjectImageUrl(project.image);
    if (modalCategory) modalCategory.innerText = project.category || 'General';
    if (modalTitle) modalTitle.innerText = project.name || 'Untitled';
    if (modalDesc) modalDesc.innerText = project.description || 'No description available.';

    if (techContainer) {
        if (Array.isArray(project.techStack) && project.techStack.length > 0) {
            techContainer.innerHTML = project.techStack.map(t => `<span>${t}</span>`).join('');
            techContainer.style.display = 'flex';
        } else {
            techContainer.style.display = 'none';
        }
    }

    if (liveBtn) {
        if (project.liveLink && project.liveLink !== '#') {
            liveBtn.href = project.liveLink;
            liveBtn.style.display = 'inline-flex';
        } else {
            liveBtn.style.display = 'none';
        }
    }

    if (githubBtn) {
        if (project.githubLink && project.githubLink !== '#') {
            githubBtn.href = project.githubLink;
            githubBtn.style.display = 'inline-flex';
        } else {
            githubBtn.style.display = 'none';
        }
    }

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeProjectModal() {
    const modal = document.getElementById('projectModal');
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = 'auto';
}

function initProjectModalListeners() {
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const projectModal = document.getElementById('projectModal');

    if (modalCloseBtn) {
        modalCloseBtn.onclick = closeProjectModal;
    }

    if (projectModal) {
        projectModal.onclick = (e) => {
            if (e.target === projectModal) {
                closeProjectModal();
            }
        };
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && projectModal && projectModal.classList.contains('is-open')) {
            closeProjectModal();
        }
    });
}

// High-Performance Particle System for Portfolio Cards
function initPortfolioCardParticles() {
    const canvases = Array.from(document.querySelectorAll('.portfolio-card-canvas'));
    if (canvases.length === 0) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const colors = ['#b057d5', '#d45b98', '#ff8453', '#4a4869', '#3e285c'];
    const portfolioSection = document.getElementById('portfolio') || document.querySelector('.portfolio-module');

    const systems = canvases
        .map((canvas) => {
            const ctx = canvas.getContext('2d');
            if (!ctx) return null;

            const parent = canvas.parentElement;
            if (!parent) return null;

            const particleCount = 7;
            const particles = [];

            const sys = {
                canvas,
                ctx,
                parent,
                width: 0,
                height: 0,
                particles,
                resize() {
                    const rect = parent.getBoundingClientRect();
                    const w = Math.max(1, Math.floor(rect.width));
                    const h = Math.max(1, Math.floor(rect.height));
                    this.width = w;
                    this.height = h;
                    canvas.width = w;
                    canvas.height = h;
                    canvas.style.width = `${w}px`;
                    canvas.style.height = `${h}px`;
                },
            };

            class Particle {
                constructor() {
                    this.reset(true);
                }
                reset(isInit = false) {
                    this.x = Math.random() * sys.width;
                    this.y = isInit ? Math.random() * sys.height : sys.height + 10;
                    this.vy = -(Math.random() * 0.3 + 0.08);
                    this.vx = (Math.random() - 0.5) * 0.2;
                    this.size = Math.random() * 2 + 0.5;
                    this.color = colors[Math.floor(Math.random() * colors.length)];
                    this.alpha = Math.random() * 0.4 + 0.1;
                    this.life = Math.random() * 100;
                }
                update() {
                    this.y += this.vy;
                    this.x += this.vx;
                    this.life += 1;
                    this.x += Math.sin(this.life / 60) * 0.2;

                    if (this.y < -10) this.reset(false);
                    if (this.x < -10) this.x = sys.width + 10;
                    if (this.x > sys.width + 10) this.x = -10;
                }
                draw() {
                    const { ctx } = sys;
                    ctx.globalAlpha = this.alpha;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.fillStyle = this.color;
                    ctx.fill();
                }
            }

            sys.resize();
            for (let i = 0; i < particleCount; i++) particles.push(new Particle());

            return sys;
        })
        .filter(Boolean);

    if (systems.length === 0) return;

    let isSectionVisible = true;
    let raf = 0;

    function animate() {
        if (!isSectionVisible) {
            raf = 0;
            return;
        }

        for (let i = 0; i < systems.length; i++) {
            const s = systems[i];
            s.ctx.clearRect(0, 0, s.width, s.height);
            for (let j = 0; j < s.particles.length; j++) {
                s.particles[j].update();
                s.particles[j].draw();
            }
        }
        raf = requestAnimationFrame(animate);
    }

    if (portfolioSection && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            isSectionVisible = entries[0].isIntersecting;
            if (isSectionVisible && !raf) {
                animate();
            }
        }, { threshold: 0.05 });
        observer.observe(portfolioSection);
    } else {
        animate();
    }

    window.addEventListener('resize', () => {
        systems.forEach((s) => s.resize());
    }, { passive: true });

    window.addEventListener('beforeunload', () => {
        if (raf) cancelAnimationFrame(raf);
    });
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadProjects);
} else {
    loadProjects();
}
