function initHero() {
    // --- 1. Entry Animations ---
    const heroContent = document.getElementById('hero-content');
    const heroVisual = document.getElementById('hero-visual');

    if (heroContent) {
        setTimeout(() => {
            heroContent.style.transition = 'opacity 1s cubic-bezier(0.2, 0.8, 0.2, 1), transform 1s cubic-bezier(0.2, 0.8, 0.2, 1)';
            heroContent.style.opacity = '1';
            heroContent.style.transform = 'translateY(0)';
        }, 100);
    }

    if (heroVisual) {
        setTimeout(() => {
            heroVisual.style.transition = 'opacity 1s cubic-bezier(0.2, 0.8, 0.2, 1), transform 1s cubic-bezier(0.2, 0.8, 0.2, 1)';
            heroVisual.style.opacity = '1';
            heroVisual.style.transform = window.innerWidth > 900 ? 'translateX(0)' : 'translateY(0)';
        }, 300);
    }

    // --- 2. Interactive Mouse Movement Effect on Shield (Throttled via RAF) ---
    const shieldImage = document.querySelector('.shield-image');
    if (shieldImage && window.innerWidth > 900) {
        let mouseX = 0, mouseY = 0;
        let ticking = false;

        document.addEventListener('mousemove', (e) => {
            mouseX = (window.innerWidth / 2 - e.clientX) * 0.015;
            mouseY = (window.innerHeight / 2 - e.clientY) * 0.015;

            if (!ticking) {
                requestAnimationFrame(() => {
                    shieldImage.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    // --- 3. High-Performance Background Canvas Animation ---
    const canvas = document.getElementById('hero-canvas');
    const heroSection = document.getElementById('home') || document.querySelector('.hero-section');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let isHeroVisible = true;
        let animationFrameId = null;

        function resizeCanvas() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }

        window.addEventListener('resize', resizeCanvas, { passive: true });
        resizeCanvas();

        const particles = [];
        const particleCount = 45;
        const colors = ['#b057d5', '#d45b98', '#ff8453', '#4a4869', '#3e285c'];

        class Particle {
            constructor() { this.reset(); }
            reset() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vy = -(Math.random() * 0.35 + 0.1);
                this.vx = (Math.random() - 0.5) * 0.25;
                this.size = Math.random() * 2.2 + 0.6;
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.alpha = Math.random() * 0.5 + 0.15;
                this.life = Math.random() * 100;
            }
            update() {
                this.y += this.vy;
                this.x += this.vx;
                this.life += 1;
                this.x += Math.sin(this.life / 60) * 0.25;
                if (this.y < -10) {
                    this.y = height + 10;
                    this.x = Math.random() * width;
                }
                if (this.x < -10) this.x = width + 10;
                if (this.x > width + 10) this.x = -10;
            }
            draw() {
                ctx.globalAlpha = this.alpha;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
        }

        for (let i = 0; i < particleCount; i++) particles.push(new Particle());

        function animateParticles() {
            if (!isHeroVisible) {
                animationFrameId = null;
                return;
            }
            ctx.clearRect(0, 0, width, height);
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
            }
            animationFrameId = requestAnimationFrame(animateParticles);
        }

        // Pause animation when hero is scrolled out of view to save CPU/battery
        if (heroSection && 'IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                isHeroVisible = entries[0].isIntersecting;
                if (isHeroVisible && !animationFrameId) {
                    animateParticles();
                }
            }, { threshold: 0.05 });
            observer.observe(heroSection);
        } else {
            animateParticles();
        }
    }
}

// Run init on DOMContentLoaded or immediately if already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHero);
} else {
    initHero();
}
