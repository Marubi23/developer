/**
 * ============================================
 * MAIN INITIALIZATION FILE
 * Author: Felix Marubi
 * ============================================
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 marubi-labs portfolio initializing...');

    window.navbarScrollManager = new NavbarScrollManager();
    window.backToTopManager = new BackToTopManager();
    setActiveTab();
    setupContactForm();
    preloadImages();

    console.log('✅ marubi-labs portfolio ready!');
});

// ============================================
// NAVBAR
// - Fixed at the top on every page.
// - Transparent at top, stays transparent but tightens padding on scroll.
// - Hides when scrolling DOWN past a threshold, reveals when scrolling UP.
// - Same behavior on Home, Services and Resume.
// ============================================
class NavbarScrollManager {
    constructor() {
        this.navbar = document.getElementById('mainNav');
        this.ticking = false;
        this.lastScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
        this.hideThreshold = 80;  // px scrolled before hide kicks in

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

        // Tighten / deco state past 40px
        this.navbar.classList.toggle('scrolled', y > 40);

        // Only hide when the user is meaningfully scrolling down
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
// ACTIVE TAB (top navbar + mobile bottom bar)
// ============================================
function setActiveTab() {
    const currentPage = (window.location.pathname.split('/').pop() || 'index.html');

    document.querySelectorAll('.nav-link, .bottom-nav-link').forEach(link => {
        const href = link.getAttribute('href');
        const isActive = href === currentPage || (currentPage === '' && href === 'index.html');
        link.classList.toggle('active', isActive);
    });
}

// ============================================
// CONTACT FORM (front-end only stub)
// ============================================
function setupContactForm() {
    const form = document.getElementById('quickContactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        showNotification('Message sent — I\'ll get back to you soon.', 'success');
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

if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        .notification {
            position: fixed;
            bottom: calc(var(--bottom-nav-height, 0px) + 1.5rem);
            right: 20px;
            background: var(--marubi-onyx);
            color: var(--marubi-cream);
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: var(--shadow-onyx);
            display: flex;
            align-items: center;
            gap: 1rem;
            transform: translateX(120%);
            transition: transform 0.3s ease;
            z-index: 2000;
            border-left: 4px solid var(--marubi-ember);
        }
        .notification.show { transform: translateX(0); }
        .notification-success { border-left-color: #27c93f; }
        .notification-warning { border-left-color: #ffbd2e; }
        .notification i { font-size: 1.2rem; }
        .notification-success i { color: #27c93f; }
        .notification-warning i { color: #ffbd2e; }
        .notification-info i { color: var(--marubi-ember); }
        @media (max-width: 480px) {
            .notification { left: 20px; right: 20px; transform: translateY(120%); }
            .notification.show { transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);
}

// ============================================
// IMAGE PRELOAD (for [data-src] lazy images)
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