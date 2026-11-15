// Portfolio Data Loading
var IS_LOCAL_ENV = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
var BACKEND_BASE_URL = IS_LOCAL_ENV ? "http://localhost:5000" : "https://portfolio-backend-h88g.vercel.app";

async function loadProjects() {
    const portfolioGrid = document.getElementById('portfolioGrid');
    if (!portfolioGrid) return;

    try {
        const response = await fetch(`${BACKEND_BASE_URL}/api/projects`);
        if (!response.ok) throw new Error('Failed to fetch projects');

        const projects = (await response.json()).slice(0, 8);

        if (projects.length === 0) {
            portfolioGrid.innerHTML = '<div class="portfolio-error">No projects uploaded yet</div>';
            return;
        }

        portfolioGrid.innerHTML = '';

        projects.forEach(project => {
            const card = createPortfolioCard(project);
            portfolioGrid.appendChild(card);
        });

        // Re-initialize particles for new cards
        initPortfolioCardParticles();

    } catch (error) {
        console.error('Error loading projects:', error);
        portfolioGrid.innerHTML = '<div class="portfolio-error">Error loading projects. Please try again later.</div>';
    }
}

function createPortfolioCard(project) {
    const card = document.createElement('div');
    card.className = 'portfolio-card';

    let imageUrl = './Assets/1.jpg';
    if (project.image) {
        imageUrl = (project.image.startsWith('http') || project.image.startsWith('data:'))
            ? project.image
            : `${BACKEND_BASE_URL}/${project.image}`;
    }

    const maxChars = 160;
    const truncatedDesc = project.description && project.description.length > maxChars
        ? project.description.substring(0, maxChars) + '...'
        : (project.description || '');

    const techTags = Array.isArray(project.techStack)
        ? project.techStack.map(tag => `<span>${tag}</span>`).join('')
        : '';

    card.innerHTML = `
        <div class="card-image-box">
            <img src="${imageUrl}" alt="${project.name}" onerror="this.src='./Assets/1.jpg'">
        </div>
        <div class="card-content-box">
            <canvas class="portfolio-card-canvas" aria-hidden="true"></canvas>
            <h3>${project.name}</h3>
            <p>${truncatedDesc}</p>
            ${techTags ? `<div class="project-tags">${techTags}</div>` : ''}
            <div class="project-links">
                ${project.liveLink ? `<a href="${project.liveLink}" target="_blank" class="project-link"><i class="fas fa-external-link-alt"></i> Live Preview</a>` : ''}
                ${project.githubLink ? `<a href="${project.githubLink}" target="_blank" class="project-link github-link"><i class="fab fa-github"></i> GitHub</a>` : ''}
            </div>
        </div>
    `;

    return card;
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

    // Pause entire portfolio animation loop when scrolled out of viewport
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
