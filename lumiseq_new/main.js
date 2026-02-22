document.addEventListener('DOMContentLoaded', () => {

    // ─── 1. MODULAR HERO CANVAS ENGINE ──────────────────────────────────────
    const heroTarget = document.querySelector('.hero, .hero-blueprint, .hero-pulse, .hero-flux, .hero-nexus');
    if (heroTarget) {
        const canvas = document.createElement('canvas');
        canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;opacity:0.12;';
        heroTarget.style.position = 'relative';
        heroTarget.prepend(canvas);

        const ctx = canvas.getContext('2d');
        let W, H, entities = [];
        const type = heroTarget.classList.contains('hero-blueprint') ? 'blueprint' :
            heroTarget.classList.contains('hero-pulse') ? 'pulse' :
                heroTarget.classList.contains('hero-flux') ? 'flux' :
                    heroTarget.classList.contains('hero-nexus') ? 'nexus' : 'particles';

        const ACCENT = '112,224,0';
        const MUTED = '148,163,184';

        function resize() {
            W = canvas.width = heroTarget.offsetWidth;
            H = canvas.height = heroTarget.offsetHeight;
        }

        function init() {
            resize();
            entities = [];
            if (type === 'particles') {
                for (let i = 0; i < 60; i++) {
                    entities.push({
                        x: Math.random() * W, y: Math.random() * H,
                        vx: (Math.random() - 0.5) * 40, vy: (Math.random() - 0.5) * 40, // Scaled for scroll delta
                        r: Math.random() * 2 + 1, accent: Math.random() > 0.75
                    });
                }
            } else if (type === 'blueprint') {
                for (let i = 0; i < 15; i++) {
                    entities.push({
                        x: Math.random() * W, y: Math.random() * H,
                        w: Math.random() * 200 + 50, h: Math.random() * 200 + 50,
                        opacity: Math.random() * 0.5
                    });
                }
            } else if (type === 'pulse') {
                // Now "Network Nodes" - Remove circles
                for (let i = 0; i < 40; i++) {
                    entities.push({
                        x: Math.random() * W, y: Math.random() * H,
                        r: Math.random() * 3 + 1,
                        connections: []
                    });
                }
            } else if (type === 'flux') {
                // Now "Data Blocks"
                for (let i = 0; i < 30; i++) {
                    entities.push({
                        x: Math.random() * W, y: Math.random() * H,
                        w: Math.random() * 60 + 20, h: Math.random() * 10 + 5,
                        speed: Math.random() * 2 + 1,
                        opacity: Math.random() * 0.4
                    });
                }
            } else if (type === 'nexus') {
                // Elegant floating constellation for Insights
                for (let i = 0; i < 55; i++) {
                    entities.push({
                        x: Math.random() * W, y: Math.random() * H,
                        vx: (Math.random() - 0.5) * 0.3,
                        vy: (Math.random() - 0.5) * 0.3,
                        r: Math.random() * 1.5 + 0.5,
                        accent: Math.random() > 0.6
                    });
                }
            }
        }

        let lastScroll = window.scrollY;
        function draw() {
            const currentScroll = window.scrollY;
            const delta = currentScroll - lastScroll;
            lastScroll = currentScroll;

            ctx.clearRect(0, 0, W, H);

            if (type === 'particles') {
                entities.forEach((p, i) => {
                    // Only move on scroll delta
                    p.x += (p.vx * delta * 0.001);
                    p.y += (p.vy * delta * 0.001);

                    if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
                    if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                    ctx.fillStyle = p.accent ? `rgba(${ACCENT},0.9)` : `rgba(${MUTED},0.5)`;
                    ctx.fill();

                    for (let j = i + 1; j < entities.length; j++) {
                        const q = entities[j];
                        const dx = p.x - q.x, dy = p.y - q.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < 160) {
                            const alpha = (1 - dist / 160) * 0.4;
                            ctx.beginPath();
                            ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
                            ctx.strokeStyle = (p.accent || q.accent) ? `rgba(${ACCENT},${alpha})` : `rgba(${MUTED},${alpha * 0.6})`;
                            ctx.lineWidth = 0.8; ctx.stroke();
                        }
                    }
                });
            } else if (type === 'blueprint') {
                const scrollEffect = currentScroll * 0.05;
                ctx.strokeStyle = `rgba(${ACCENT}, 0.03)`;
                ctx.lineWidth = 1;
                for (let i = 0; i < W; i += 50) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke(); }
                for (let i = 0; i < H; i += 50) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(W, i); ctx.stroke(); }

                entities.forEach((b, i) => {
                    const offset = Math.sin(scrollEffect + i) * 10;
                    ctx.strokeStyle = `rgba(${ACCENT}, ${0.1 + Math.abs(Math.sin(scrollEffect * 0.5 + i)) * 0.4})`;
                    ctx.strokeRect(b.x + offset, b.y + offset, b.w, b.h);
                });
            } else if (type === 'pulse') {
                // "Network Nodes" - Move with scroll
                entities.forEach((n, i) => {
                    n.y += (delta * 0.1 * (i % 3 + 1));
                    if (n.y > H) n.y = 0;
                    if (n.y < 0) n.y = H;

                    ctx.beginPath();
                    ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${ACCENT}, 0.25)`;
                    ctx.fill();

                    // Connect nearby nodes
                    for (let j = i + 1; j < entities.length; j++) {
                        const m = entities[j];
                        const dist = Math.sqrt((n.x - m.x) ** 2 + (n.y - m.y) ** 2);
                        if (dist < 120) {
                            ctx.beginPath();
                            ctx.moveTo(n.x, n.y); ctx.lineTo(m.x, m.y);
                            ctx.strokeStyle = `rgba(${ACCENT}, ${(1 - dist / 120) * 0.08})`;
                            ctx.stroke();
                        }
                    }
                });
            } else if (type === 'flux') {
                // "Data Blocks"
                entities.forEach((f, i) => {
                    f.y += (delta * 0.2 * f.speed);
                    if (f.y > H) f.y = -20;
                    if (f.y < -20) f.y = H;

                    ctx.fillStyle = `rgba(${ACCENT}, ${f.opacity})`;
                    ctx.fillRect(f.x, f.y, f.w, f.h);

                    // Binary decorative bits
                    if (i % 5 === 0) {
                        ctx.font = '10px monospace';
                        ctx.fillText(Math.random() > 0.5 ? '1' : '0', f.x + f.w + 5, f.y + 10);
                    }
                });
            } else if (type === 'nexus') {
                // Cinematic floating constellation — self-animating (not scroll-driven)
                entities.forEach((p, i) => {
                    p.x += p.vx;
                    p.y += p.vy;
                    if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
                    if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                    ctx.fillStyle = p.accent ? `rgba(${ACCENT},0.4)` : `rgba(${MUTED},0.15)`;
                    ctx.fill();

                    // Connect nearby nodes with fading lines
                    for (let j = i + 1; j < entities.length; j++) {
                        const q = entities[j];
                        const dx = p.x - q.x, dy = p.y - q.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < 180) {
                            const alpha = (1 - dist / 180) * 0.12;
                            ctx.beginPath();
                            ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
                            ctx.strokeStyle = (p.accent || q.accent) ? `rgba(${ACCENT},${alpha})` : `rgba(${MUTED},${alpha * 0.4})`;
                            ctx.lineWidth = 0.5; ctx.stroke();
                        }
                    }
                });
            }
            requestAnimationFrame(draw);
        }

        init();
        draw();
        window.addEventListener('resize', init);
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

    // ─── 9. SERVICES PAGE: THREE PILLARS CANVAS ───────────────────────────
    const servicesCanvas = document.getElementById('services-canvas');
    if (servicesCanvas) {
        const ctx = servicesCanvas.getContext('2d');
        let W, H;
        const pillars = [];
        const PILLAR_COUNT = 3;
        const ACCENT_GREEN = '112, 224, 0';

        function resize() {
            W = servicesCanvas.width = window.innerWidth;
            H = servicesCanvas.height = window.innerHeight;
        }

        class EnergyPillar {
            constructor(x) {
                this.baseX = x;
                this.particles = [];
                this.init();
            }
            init() {
                for (let i = 0; i < 40; i++) {
                    this.particles.push({
                        y: Math.random() * H,
                        speed: 0.5 + Math.random() * 2,
                        size: Math.random() * 2 + 1,
                        opacity: Math.random() * 0.5 + 0.1,
                        drift: (Math.random() - 0.5) * 30
                    });
                }
            }
            draw() {
                // Main subtle beam
                const grad = ctx.createLinearGradient(this.baseX - 40, 0, this.baseX + 40, 0);
                grad.addColorStop(0, 'transparent');
                grad.addColorStop(0.5, `rgba(${ACCENT_GREEN}, 0.03)`);
                grad.addColorStop(1, 'transparent');
                ctx.fillStyle = grad;
                ctx.fillRect(this.baseX - 80, 0, 160, H);

                // Animated particles
                this.particles.forEach(p => {
                    p.y -= p.speed;
                    if (p.y < -10) p.y = H + 10;

                    const xPos = this.baseX + p.drift;
                    ctx.beginPath();
                    ctx.arc(xPos, p.y, p.size, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${ACCENT_GREEN}, ${p.opacity})`;
                    ctx.fill();
                });

                // Pulsing core line
                ctx.beginPath();
                ctx.moveTo(this.baseX, 0);
                ctx.lineTo(this.baseX, H);
                const pulse = (Math.sin(Date.now() / 1000) + 1) / 2;
                ctx.strokeStyle = `rgba(${ACCENT_GREEN}, ${0.05 + pulse * 0.05})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }

        function init() {
            resize();
            pillars.length = 0;
            const spacing = W / (PILLAR_COUNT + 1);
            for (let i = 1; i <= PILLAR_COUNT; i++) {
                pillars.push(new EnergyPillar(spacing * i));
            }
            servicesCanvas.style.opacity = '0.35';
        }

        function animate() {
            ctx.clearRect(0, 0, W, H);
            pillars.forEach(p => p.draw());
            requestAnimationFrame(animate);
        }

        init();
        animate();
        window.addEventListener('resize', init);
    }
    // ─── 10. CONTACT PAGE: CONNECTION CANVAS ─────────────────────────────
    const contactCanvas = document.getElementById('contact-canvas');
    if (contactCanvas) {
        const ctx = contactCanvas.getContext('2d');
        let W, H;
        const nodes = [];
        const NODE_COUNT = 60;
        const MAX_DIST = 150;
        const ACCENT_GREEN = '112, 224, 0';
        let mouse = { x: -1000, y: -1000 };

        function resize() {
            W = contactCanvas.width = window.innerWidth;
            H = contactCanvas.height = window.innerHeight;
        }

        class Node {
            constructor() {
                this.x = Math.random() * W;
                this.y = Math.random() * H;
                this.vx = (Math.random() - 0.5) * 0.8;
                this.vy = (Math.random() - 0.5) * 0.8;
                this.radius = Math.random() * 2 + 1;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > W) this.vx *= -1;
                if (this.y < 0 || this.y > H) this.vy *= -1;

                // React to mouse
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    this.x -= dx * 0.01;
                    this.y -= dy * 0.01;
                }
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${ACCENT_GREEN}, 0.4)`;
                ctx.fill();
            }
        }

        function init() {
            resize();
            nodes.length = 0;
            for (let i = 0; i < NODE_COUNT; i++) {
                nodes.push(new Node());
            }
            contactCanvas.style.opacity = '0.4';
        }

        function animate() {
            ctx.clearRect(0, 0, W, H);

            for (let i = 0; i < nodes.length; i++) {
                nodes[i].update();
                nodes[i].draw();

                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[i].x - nodes[j].x;
                    const dy = nodes[i].y - nodes[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < MAX_DIST) {
                        ctx.beginPath();
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        const opacity = 1 - (dist / MAX_DIST);
                        ctx.strokeStyle = `rgba(${ACCENT_GREEN}, ${opacity * 0.15})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(animate);
        }

        init();
        animate();
        window.addEventListener('resize', init);
        window.addEventListener('mousemove', e => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });
    }

    // ─── 11. FORM ENHANCEMENTS ───────────────────────────────────────────
    const formInputs = document.querySelectorAll('.form-input');
    formInputs.forEach(input => {
        input.addEventListener('focus', () => {
            const group = input.closest('.form-group');
            if (group) {
                const label = group.querySelector('.form-label');
                if (label) {
                    label.style.color = 'var(--accent-lumi)';
                    label.style.transform = 'translateX(5px)';
                    label.style.transition = '0.3s ease';
                }
            }
        });
        input.addEventListener('blur', () => {
            const group = input.closest('.form-group');
            if (group) {
                const label = group.querySelector('.form-label');
                if (label) {
                    label.style.color = '';
                    label.style.transform = '';
                }
            }
        });
    });
});
