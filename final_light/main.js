document.addEventListener('DOMContentLoaded', () => {
    // Scroll Reveal Animation
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Stagger reveal for grid children
                if (entry.target.classList.contains('grid') || entry.target.classList.contains('process-list')) {
                    const reveals = entry.target.querySelectorAll('.reveal');
                    reveals.forEach((el, i) => {
                        setTimeout(() => el.classList.add('visible'), i * 150);
                    });
                }
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // Sticky Header Scroll Effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            navbar.style.padding = '14px 0';
            navbar.style.background = 'rgba(2, 6, 23, 0.85)';
            navbar.style.borderBottom = '1px solid rgba(56, 189, 248, 0.2)';
        } else {
            navbar.style.padding = '24px 0';
            navbar.style.background = 'rgba(2, 6, 23, 0.7)';
            navbar.style.borderBottom = '1px solid var(--border-low)';
        }
    });

    // Mobile Menu Toggle Logic
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close menu when link is clicked
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    // Contact Form Logic
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('contactName').value;
            const email = document.getElementById('contactEmail').value;
            const message = document.getElementById('contactMessage').value;

            const subject = encodeURIComponent(`Enquiry from ${name}`);
            const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);

            window.location.href = `mailto:reach@lumiseq.com?subject=${subject}&body=${body}`;
        });
    }
});
