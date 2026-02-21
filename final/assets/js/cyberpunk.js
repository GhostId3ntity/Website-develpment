// Lumiseq Premium Minimal Engine

document.addEventListener('DOMContentLoaded', () => {
    const nav = document.getElementById('nav');
    const progress = document.getElementById('progress');
    const revealElements = document.querySelectorAll('.reveal');
    const gridBg = document.querySelector('.grid-bg');
    const sequencePath = document.getElementById('sequence-path');

    // 1. Scroll Handler
    window.addEventListener('scroll', () => {
        // Nav transition
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }

        // Progress bar
        const totalHeight = document.body.scrollHeight - window.innerHeight;
        const width = (window.scrollY / totalHeight) * 100;
        progress.style.width = `${width}%`;

        // Parallax Grid
        if (gridBg) {
            gridBg.style.transform = `translateY(${window.scrollY * 0.1}px)`;
        }

        // Sequence Line Drawing Logic
        if (sequencePath) {
            const rect = sequencePath.getBoundingClientRect();
            const viewHeight = window.innerHeight;

            if (rect.top < viewHeight && rect.bottom > 0) {
                const drawProgress = Math.max(0, Math.min(1, (viewHeight - rect.top) / (viewHeight + rect.height)));
                const offset = 1470 - (1470 * drawProgress * 1.5);
                sequencePath.style.strokeDashoffset = Math.max(0, offset);
            }
        }
    });

    // 2. HUD Projective Parallax
    const hudProjection = document.querySelector('.hud-projection');
    const hudFrames = document.querySelectorAll('.hud-frame');

    if (hudProjection) {
        window.addEventListener('mousemove', (e) => {
            const { clientX, clientY } = e;
            const xPos = (clientX / window.innerWidth - 0.5) * 20; // -10 to 10px
            const yPos = (clientY / window.innerHeight - 0.5) * 20; // -10 to 10px

            // Parallax the whole layer slightly
            hudProjection.style.transform = `translate(${xPos}px, ${yPos}px)`;

            // Subtle depth for individual frames
            hudFrames.forEach((frame, index) => {
                const depth = (index + 1) * 0.2;
                frame.style.transform = `translate(${xPos * depth}px, ${yPos * depth}px)`;
                frame.style.opacity = 0.2 + (Math.abs(xPos) / 100); // Pulse on movement
            });
        });
    }

    // 3. Simple Reveal Observer (No Gimmicks)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(el => observer.observe(el));

    console.log('LUMISEQ // COMMAND_LIGHT_LOGIC_INITIALIZED');
});
