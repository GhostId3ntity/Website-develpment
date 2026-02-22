document.addEventListener('DOMContentLoaded', () => {

    // ─── 1. HERO CANVAS PARTICLE NETWORK ───────────────────────────────────
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        const canvas = document.createElement('canvas');
        canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;opacity:0.35;';
        heroSection.style.position = 'relative';
        heroSection.prepend(canvas);

        const ctx = canvas.getContext('2d');
        let W, H, particles;

        const PARTICLE_COUNT = 60;
        const MAX_DIST = 160;
        const ACCENT = '112,224,0';
        const MUTED = '148,163,184';

        function resize() {
            W = canvas.width = heroSection.offsetWidth;
            H = canvas.height = heroSection.offsetHeight;
        }

        function mkParticle() {
            return {
                x: Math.random() * W,
                y: Math.random() * H,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                r: Math.random() * 2 + 1,
                accent: Math.random() > 0.75
            };
        }

        function initParticles() {
            resize();
            particles = Array.from({ length: PARTICLE_COUNT }, mkParticle);
        }

        function draw() {
            ctx.clearRect(0, 0, W, H);
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0 || p.x > W) p.vx *= -1;
                if (p.y < 0 || p.y > H) p.vy *= -1;

                // Draw node
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = p.accent ? `rgba(${ACCENT},0.9)` : `rgba(${MUTED},0.5)`;
                ctx.fill();

                // Draw edges
                for (let j = i + 1; j < particles.length; j++) {
                    const q = particles[j];
                    const dx = p.x - q.x, dy = p.y - q.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < MAX_DIST) {
                        const alpha = (1 - dist / MAX_DIST) * 0.4;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(q.x, q.y);
                        ctx.strokeStyle = (p.accent || q.accent)
                            ? `rgba(${ACCENT},${alpha})`
                            : `rgba(${MUTED},${alpha * 0.6})`;
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(draw);
        }

        initParticles();
        draw();
        window.addEventListener('resize', () => { initParticles(); });
    }

    // ─── 2. STAGGERED SCROLL REVEAL ────────────────────────────────────────
    const reveals = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, idx) => {
            if (entry.isIntersecting) {
                // Stagger children within the revealed element
                const children = entry.target.querySelectorAll('h1,h2,h3,p,.btn,.fragment-tag,.framework-step,.fragmented-card');
                children.forEach((child, i) => {
                    child.style.transitionDelay = `${i * 60}ms`;
                });
                setTimeout(() => {
                    entry.target.classList.add('active');
                }, 80);
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(el => revealObserver.observe(el));

    // ─── 3. FRAMEWORK STEP SEQUENCING ──────────────────────────────────────
    const frameworkProgression = document.querySelector('.framework-progression');
    if (frameworkProgression) {
        const steps = frameworkProgression.querySelectorAll('.framework-step');
        const lineProgress = frameworkProgression.querySelector('.framework-line-progress');

        const fwObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    steps.forEach((step, i) => {
                        setTimeout(() => {
                            step.classList.add('animate-step');
                            if (lineProgress) {
                                lineProgress.style.width = `${((i + 1) / steps.length) * 100}%`;
                            }
                        }, i * 200);
                    });
                    fwObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        fwObserver.observe(frameworkProgression);
    }



    // ─── 5. HERO HEADLINE LETTER SHIMMER ───────────────────────────────────
    const heroH1 = document.querySelector('.hero h1');
    if (heroH1) {
        heroH1.style.animation = 'none';
        setTimeout(() => {
            heroH1.style.opacity = '1';
        }, 200);
    }

    // ─── 6. SCROLL-DRIVEN NAVBAR OPACITY ───────────────────────────────────
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY > 60;
            navbar.style.background = scrolled
                ? 'rgba(13, 27, 42, 0.97)'
                : 'rgba(13, 27, 42, 0.8)';
            navbar.style.borderBottom = scrolled
                ? '1px solid rgba(112,224,0,0.15)'
                : '1px solid rgba(255,255,255,0.05)';
        });
    }

    // ─── 7. SCROLL LINE TRAVELER ───────────────────────────────────────────
    const lineTraveler = document.querySelector('.line-traveler');
    if (lineTraveler) {
        window.addEventListener('scroll', () => {
            const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
            lineTraveler.style.strokeDashoffset = 1000 - pct * 1000;
        });
    }

    // ─── 8. CURSOR GLOW TRAIL ──────────────────────────────────────────────
    const glow = document.createElement('div');
    glow.style.cssText = `
        position:fixed; width:300px; height:300px; border-radius:50%;
        background:radial-gradient(circle, rgba(112,224,0,0.04), transparent 70%);
        pointer-events:none; transform:translate(-50%,-50%);
        transition:left 0.15s ease,top 0.15s ease; z-index:9999;
    `;
    document.body.appendChild(glow);
    document.addEventListener('mousemove', e => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
    });

});
