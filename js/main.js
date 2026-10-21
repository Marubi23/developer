/**
 * ============================================
 * MAIN INITIALIZATION FILE
 * Author: Felix Marubi
 *
 * Managers, in order:
 *   1. NavbarScrollManager   — navbar scroll/hide behavior
 *   2. BackToTopManager      — back-to-top button
 *   3. SiteLoaderManager     — 4-tile + wordmark loader hide + stale SW cleanup
 *   4. CyberSectionManager   — body dark mode + reveal-on-scroll
 *   5. HeroTypingEffect      — cycling hero subtitle (only if #typingReview exists)
 * ============================================
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 marubi-labs portfolio initializing...');

    window.navbarScrollManager = new NavbarScrollManager();
    window.backToTopManager = new BackToTopManager();
    window.siteLoaderManager = new SiteLoaderManager();
    window.cyberSectionManager = new CyberSectionManager();
    window.heroTypingEffect = new HeroTypingEffect();

    setActiveTab();
    setupContactForm();
    preloadImages();

    console.log('✅ marubi-labs portfolio ready!');
});

// ============================================
// NAVBAR
// ============================================
class NavbarScrollManager {
    constructor() {
        this.navbar = document.getElementById('mainNav');
        this.ticking = false;
        this.lastScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
        this.hideThreshold = 80;

        if (this.navbar) {
            this.handleScroll = this.handleScroll.bind(this);
            window.addEventListener('scroll', () => {
                if (!this.ticking) {
                    requestAnimationFrame(() => this.handleScroll());
                    this.ticking = true;
                }
            }, { passive: true });
            this.handleScroll();
        }
    }

    handleScroll() {
        const y = window.pageYOffset || document.documentElement.scrollTop;
        const goingDown = y > this.lastScrollY;
        const delta = Math.abs(y - this.lastScrollY);

        this.navbar.classList.toggle('scrolled', y > 40);

        if (goingDown && y > this.hideThreshold && delta > 4) {
            this.navbar.classList.add('hide');
        } else if (!goingDown || y <= this.hideThreshold) {
            this.navbar.classList.remove('hide');
        }

        this.lastScrollY = y;
        this.ticking = false;
    }
}

// ============================================
// BACK TO TOP
// ============================================
class BackToTopManager {
    constructor() {
        this.button = document.getElementById('backToTop');
        if (!this.button) return;

        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            this.button.classList.toggle('visible', scrollTop > 400);
        }, { passive: true });

        this.button.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

// ============================================
// SITE LOADER
// - 4 ember tiles + thick white MARUBI-LABS wordmark.
// - Inlined in HTML + inline CSS, so it paints on the very first frame.
// - We hide it on `load` (with a small minimum display time so the
//   animation is visible), then remove it from the DOM.
// ============================================
class SiteLoaderManager {
    constructor() {
        this.loader = document.getElementById('site-loader');
        this.minDisplayMs = 1100;
        this.start  = performance.now();
        this.done   = false;

        this.unregisterStaleServiceWorkers();

        if (!this.loader) {
            document.documentElement.classList.remove('is-loading');
            return;
        }

        this.hide = this.hide.bind(this);

        if (document.readyState === 'complete') this.hide();
        else window.addEventListener('load', this.hide, { once: true });

        // Hard safety — never trap the user behind the loader
        setTimeout(this.hide, 5000);
    }

    unregisterStaleServiceWorkers() {
        if (!('serviceWorker' in navigator)) return;
        navigator.serviceWorker.getRegistrations()
            .then(regs => regs.forEach(r => r.unregister().catch(() => {})))
            .catch(() => {});
    }

    hide() {
        if (this.done || !this.loader) return;
        this.done = true;

        const wait = Math.max(0, this.minDisplayMs - (performance.now() - this.start));

        setTimeout(() => {
            document.documentElement.classList.remove('is-loading');
            document.body.classList.add('is-ready');

            this.loader.classList.add('hidden');
            setTimeout(() => this.loader && this.loader.remove(), 700);
        }, wait);
    }
}

// ============================================
// CYBER SECTION
// ============================================
class CyberSectionManager {
    constructor() {
        this.cyberSection = document.querySelector('[data-cyber-section]');
        this.revealEls = document.querySelectorAll('.reveal');

        this.setupReveal();
        this.setupProjectCards();
        this.setupCyberMode();
    }

    setupReveal() {
        if (!this.revealEls.length) return;

        if (!('IntersectionObserver' in window)) {
            this.revealEls.forEach(el => el.classList.add('is-visible'));
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
        );

        this.revealEls.forEach(el => observer.observe(el));
    }

    // Soft staggered entrance for project cards (works even without .reveal in the markup)
    setupProjectCards() {
        const cards = document.querySelectorAll('.project-card');
        if (!cards.length || !('IntersectionObserver' in window)) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        cards.forEach((card, i) => {
            card.style.opacity = '0';
            card.style.translate = '0 28px';
            card.style.transitionProperty = 'opacity, translate, transform, box-shadow, background-color, border-color';
            card.style.transitionDuration = '.8s, .8s, .5s, .5s, .4s, .4s';
            card.style.transitionDelay = `${i * 0.12}s, ${i * 0.12}s, 0s, 0s, 0s, 0s`;
        });

        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.style.opacity = '1';
                entry.target.style.translate = '0 0';
                io.unobserve(entry.target);
            });
        }, { threshold: 0.15 });
        cards.forEach(c => io.observe(c));
    }

    setupCyberMode() {
        if (!this.cyberSection || !('IntersectionObserver' in window)) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    document.body.classList.toggle('cyber-mode', entry.isIntersecting);
                });
            },
            { threshold: 0.35 }
        );

        observer.observe(this.cyberSection);
    }
}

// ============================================
// HERO TYPING EFFECT
// Only activates if #typingReview exists in the DOM
// (currently it doesn't — the terminal column is commented out).
// ============================================
class HeroTypingEffect {
    constructor() {
        this.el = document.getElementById('typingReview');
        if (!this.el) return;

        this.phrases = [
            'Software Engineer',
            'Cybersecurity Specialist',
            'AI & ML Solutions',
            'Cloud & DevOps',
            'Building for Africa',
        ];
        this.index = 0;

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduceMotion) return;

        this.cycle = this.cycle.bind(this);
        this.intervalId = setInterval(this.cycle, 3000);
    }

    cycle() {
        if (!this.el) return;
        this.el.style.opacity = '0';
        setTimeout(() => {
            this.index = (this.index + 1) % this.phrases.length;
            this.el.textContent = this.phrases[this.index];
            this.el.style.opacity = '1';
        }, 400);
    }
}

// ============================================
// ACTIVE TAB
// ============================================
function setActiveTab() {
    const currentPage = (window.location.pathname.split('/').pop() || 'index.html');

    document.querySelectorAll('.nav-link, .bottom-nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#')) {
            link.classList.remove('active');
            return;
        }
        const isActive = href === currentPage || (currentPage === '' && href === 'index.html');
        link.classList.toggle('active', isActive);
    });
}

// ============================================
// CONTACT FORM
// ============================================
function setupContactForm() {
    const form = document.getElementById('quickContactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        showNotification("Message sent — I'll get back to you soon.", 'success');
        form.reset();
    });
}

// ============================================
// NOTIFICATIONS
// ============================================
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ============================================
// IMAGE PRELOAD
// ============================================
function preloadImages() {
    document.querySelectorAll('img[data-src]').forEach(img => {
        const src = img.getAttribute('data-src');
        if (src) {
            img.src = src;
            img.removeAttribute('data-src');
        }
    });
}

// ============================================
// ERROR HANDLING
// ============================================
window.addEventListener('error', (e) => console.error('Global error:', e.error));
window.addEventListener('unhandledrejection', (e) => console.error('Unhandled promise rejection:', e.reason));

// ============================================
// INJECTED STYLES (notification + cyber-mode overrides)
// ============================================
if (!document.getElementById('marubi-runtime-styles')) {
    const style = document.createElement('style');
    style.id = 'marubi-runtime-styles';
    style.textContent = `
        /* === Notifications === */
        .notification {
            position: fixed;
            bottom: calc(var(--bottom-nav-height, 0px) + 1.5rem);
            right: 20px;
            background: var(--marubi-onyx, #0a0e1a);
            color: var(--marubi-cream, #f8fafc);
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
            display: flex;
            align-items: center;
            gap: 1rem;
            transform: translateX(120%);
            transition: transform 0.3s ease;
            z-index: 2000;
            border-left: 4px solid var(--marubi-ember, #ef4444);
        }
        .notification.show { transform: translateX(0); }
        .notification-success { border-left-color: #27c93f; }
        .notification-warning { border-left-color: #ffbd2e; }
        .notification i { font-size: 1.2rem; }
        .notification-success i { color: #27c93f; }
        .notification-warning i { color: #ffbd2e; }
        .notification-info i { color: var(--marubi-ember, #ef4444); }
        @media (max-width: 480px) {
            .notification { left: 20px; right: 20px; transform: translateY(120%); }
            .notification.show { transform: translateY(0); }
        }

        /* === Cyber-mode body overrides === */
        body.cyber-mode #mainNav {
            background: rgba(5, 7, 13, 0.85) !important;
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
        }
        body.cyber-mode #mainNav .logo-text,
        body.cyber-mode #mainNav .nav-link {
            color: #e2e8f0;
        }
        body.cyber-mode #mainNav .nav-link.active {
            color: #6366f1;
        }
        body.cyber-mode #bottomNav {
            background: rgba(5, 7, 13, 0.9) !important;
        }
        body.cyber-mode #bottomNav .bottom-nav-link {
            color: rgba(226, 232, 240, 0.55);
        }
        body.cyber-mode #bottomNav .bottom-nav-link.active {
            color: #6366f1;
        }
    `;
    document.head.appendChild(style);
}