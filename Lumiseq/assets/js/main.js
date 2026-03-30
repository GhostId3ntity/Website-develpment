/**
 * Lumiseq — Advanced 3D Animation Engine
 * Navbar · Hero sequence · 3D card tilts · Scroll reveals · Smooth anchors
 */

document.addEventListener('DOMContentLoaded', () => {

  gsap.registerPlugin(ScrollTrigger);

  // ── 1. NAVBAR & MOBILE TOGGLE ────────────────────────────────
  const navbar = document.getElementById('navbar');
  const navToggle = document.querySelector('.nav-toggle');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      const isClosing = document.body.classList.contains('mobile-nav-visible');
      document.body.classList.toggle('mobile-nav-visible');
      
      // Reset dropdown accordion when closing
      if (isClosing) {
        setTimeout(() => {
          document.querySelectorAll('.nav-dropdown-active').forEach(dd => dd.classList.remove('nav-dropdown-active'));
        }, 400); // Wait for nav to finish sliding out
      }
    });
  }

  // Close mobile nav when a link is clicked (unless it's the dropdown toggle)
  const navLinksList = document.querySelectorAll('nav ul li a');
  navLinksList.forEach(link => {
    link.addEventListener('click', (e) => {
      if (link.classList.contains('nav-dropdown-toggle') && window.innerWidth <= 1100) {
        e.preventDefault();
        link.closest('.nav-dropdown').classList.toggle('nav-dropdown-active');
        return;
      }
      document.body.classList.remove('mobile-nav-visible');
    });
  });

  // ── 2. HERO ENTRANCE ──────────────────────────────────────
  gsap.set('#hero-text', { autoAlpha: 1 });
  const heroTl = gsap.timeline({ delay: .1 });
  heroTl
    .fromTo('#hero-text .hero-eyebrow', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: .7, ease: 'power3.out' })
    .fromTo('#hero-text h1',            { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1,  ease: 'power4.out' }, '-=.4')
    .fromTo('#hero-text p',             { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: .8, ease: 'power3.out' }, '-=.5')
    .fromTo('#hero-text .hero-ctas',    { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: .7, ease: 'power3.out' }, '-=.45')
    .fromTo('#hero-text .hero-pills .hero-pill',
      { y: 16, opacity: 0 },
      { y: 0, opacity: 1, duration: .55, stagger: .1, ease: 'power2.out' }, '-=.4');

  // Hero visual entrance
  gsap.set('#hero-visual', { autoAlpha: 1 });
  gsap.fromTo('#hero-visual',
    { x: 60, opacity: 0 },
    { x: 0, opacity: 1, duration: 1.2, delay: .35, ease: 'power3.out' }
  );

  // ── 3. HERO IMAGE — Ambient idle float ────────────────────
  const heroImg = document.getElementById('hero-img');
  if (heroImg) {
    gsap.set(heroImg, { autoAlpha: 1, visibility: 'visible', opacity: 1 });
    gsap.to(heroImg, {
      y: '-=20', rotation: .8,
      duration: 4.5, ease: 'sine.inOut',
      yoyo: true, repeat: -1
    });
    // Slow parallax fade on scroll into services/identity
    const nextSection = document.getElementById('services') || document.getElementById('identity');
    if (nextSection) {
      gsap.to('#hero-img', {
        scrollTrigger: {
          trigger: nextSection,
          start: 'top bottom',
          end: 'top 30%',
          scrub: 1.5
        },
        y: '-=40', opacity: 0, ease: 'none'
      });
    }
  }

  // ── 4. 3D MOUSE-TRACKING TILT (Global Card Support) ───────
  const tiltCards = document.querySelectorAll('.pillar, .svc-card:not(.blog-card), .iso-card, .bento-card, .glass-card:not(.blog-card)');
  const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  
  if (supportsHover) {
    tiltCards.forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const cx   = rect.left + rect.width  / 2;
        const cy   = rect.top  + rect.height / 2;
        const dx   = (e.clientX - cx) / (rect.width  / 2);
        const dy   = (e.clientY - cy) / (rect.height / 2);
        gsap.to(card, {
          rotateX: -dy * 8,
          rotateY:  dx * 8,
          transformPerspective: 1000,
          ease: 'power2.out',
          duration: .4
        });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, { rotateX: 0, rotateY: 0, duration: .8, ease: 'power3.out' });
      });
    });
  }

  // ── 5. SCROLL SECTION REVEALS ────────────────────────────
  gsap.utils.toArray('.reveal').forEach(el => {
    gsap.fromTo(el,
      { y: 40, opacity: 0, visibility: 'hidden' },
      {
        y: 0, opacity: 1, visibility: 'visible',
        duration: .9, ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  });

  // Sub-items staggered by row
  gsap.utils.toArray('.sub-item').forEach((item, i) => {
    gsap.fromTo(item,
      { y: 30, opacity: 0 },
      {
        y: 0, opacity: 1, duration: .7, delay: (i % 3) * .08,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 90%'
        }
      }
    );
  });

  // ── 6. PROCESS STEP ACTIVATIONS ───────────────────────────
  const steps = document.querySelectorAll('.process-step');
  steps.forEach((step, i) => {
    gsap.fromTo(step,
      { y: 30, opacity: 0 },
      {
        y: 0, opacity: 1, duration: .7, delay: i * .1,
        ease: 'power3.out',
        scrollTrigger: { trigger: step, start: 'top 88%' }
      }
    );
  });

  // ── 7. WHY CARDS — staggered grid ─────────────────────────
  gsap.fromTo('.why-card',
    { y: 40, opacity: 0 },
    {
      y: 0, opacity: 1, duration: .8, stagger: .1, ease: 'power3.out',
      scrollTrigger: { trigger: '#why', start: 'top 80%' }
    }
  );

  // ── 8. SMOOTH ANCHOR SCROLL ───────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });

  // ── 9. ACTIVE NAV HIGHLIGHT (Global & TOC) ───────────────────
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('header nav a');
  const tocLinks = document.querySelectorAll('.toc-nav a');
  
  // Set first TOC link to active by default
  if(tocLinks.length > 0) tocLinks[0].classList.add('active');

  ScrollTrigger.create({
    trigger: document.body,
    start: 'top top', end: 'bottom bottom',
    onUpdate: () => {
      sections.forEach(sec => {
        const t = sec.getBoundingClientRect().top;
        if (t <= 180 && t > -sec.offsetHeight + 180) {
          navLinks.forEach(a => {
            if (a.getAttribute('href')?.includes(`#${sec.id}`)) {
              a.classList.add('active');
            } else if (a.getAttribute('href')?.startsWith('#')) {
              a.classList.remove('active');
            }
          });
          tocLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${sec.id}`));
        }
      });
    }
  });

  // ── 10. RESOURCE HUB FILTERING ───────────────────────────
  const filterBtns = document.querySelectorAll('.filter-btn-elite');
  if (filterBtns.length > 0) {
    const blogCards = document.querySelectorAll('.blog-card');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filterVal = btn.getAttribute('data-filter');
        filterBtns.forEach(p => p.classList.toggle('active', p === btn));
        blogCards.forEach(card => {
          const cat = card.getAttribute('data-category');
          if (filterVal === 'all' || cat === filterVal) {
            card.style.display = 'flex';
            gsap.fromTo(card, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 });
          } else {
            card.style.display = 'none';
          }
        });
        ScrollTrigger.refresh();
      });
    });
  }
  // ── 11. SECURE FORM HANDLING ───────────────────────────
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      const originalText = btn.innerText;
      
      // Basic secure feedback UX
      btn.disabled = true;
      btn.innerHTML = '<span class="dot"></span> SECURING TRANSMISSION...';
      
      setTimeout(() => {
        btn.innerText = 'TRANSMISSION SECURE';
        btn.style.background = 'var(--accent)';
        btn.style.color = '#000';
        
        // Reset after delay
        setTimeout(() => {
          contactForm.reset();
          btn.disabled = false;
          btn.innerText = originalText;
          btn.style.background = '';
          btn.style.color = '';
        }, 3000);
      }, 1000);
    });
  }

});
