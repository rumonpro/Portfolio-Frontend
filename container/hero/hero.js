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

    // --- 2. Shield Continuous Hover/Float Animation ---
    const shieldContainer = document.querySelector('.shield-container');
    if (shieldContainer) {
        let startTimestamp = null;
        function animateShield(timestamp) {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = timestamp - startTimestamp;
            const yOffset = Math.sin(progress / 600) * 15;
            shieldContainer.style.transform = `translateY(${yOffset}px)`;
            requestAnimationFrame(animateShield);
        }
        requestAnimationFrame(animateShield);
    }

    // --- 3. Interactive Mouse Movement Effect on Shield ---
    const shieldImage = document.querySelector('.shield-image');
    if (shieldImage) {
        document.addEventListener('mousemove', (e) => {
            if (window.innerWidth <= 900) return;
            const x = (window.innerWidth / 2 - e.clientX) * 0.02;
            const y = (window.innerHeight / 2 - e.clientY) * 0.02;
            shieldImage.style.transform = `translate(${x}px, ${y}px)`;
        });
    }

    // --- 4. Interactive Background Canvas Animation ---
    const canvas = document.getElementById('hero-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;

        function resizeCanvas() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const particles = [];
        const particleCount = 60;
        const colors = ['#b057d5', '#d45b98', '#ff8453', '#4a4869', '#3e285c'];

        class Particle {
            constructor() { this.reset(); }
            reset() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vy = -(Math.random() * 0.4 + 0.1);
                this.vx = (Math.random() - 0.5) * 0.3;
                this.size = Math.random() * 2.5 + 0.5;
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.alpha = Math.random() * 0.6 + 0.1;
                this.life = Math.random() * 100;
            }
            update() {
                this.y += this.vy;
                this.x += this.vx;
                this.life += 1;
                this.x += Math.sin(this.life / 60) * 0.3;
                if (this.y < -10) {
                    this.y = height + 10;
                    this.x = Math.random() * width;
                }
                if (this.x < -10) this.x = width + 10;
                if (this.x > width + 10) this.x = -10;
            }
            draw() {
                ctx.save();
                ctx.globalAlpha = this.alpha;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
                ctx.shadowBlur = 12;
                ctx.shadowColor = this.color;
                ctx.fill();
                ctx.restore();
            }
        }

        for (let i = 0; i < particleCount; i++) particles.push(new Particle());

        function animateParticles() {
            ctx.clearRect(0, 0, width, height);
            particles.forEach(p => { p.update(); p.draw(); });
            requestAnimationFrame(animateParticles);
        }
        animateParticles();
    }
}

// Run init on DOMContentLoaded or immediately if already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHero);
} else {
    initHero();
}
