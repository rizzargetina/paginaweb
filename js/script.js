document.addEventListener('DOMContentLoaded', () => {
     document.body.classList.remove('preload');
    // Legacy header scroll logic removed.


    // Menú móvil: controlar apertura/cierre con botón (sin checkbox)
    function initMobileMenuToggle() {
        const mobileBtn = document.getElementById('mobile-menu-button');
        const nav = document.querySelector('#main-navigation.rulenav, .rulenav');
        const overlay = document.getElementById('mobile-nav-overlay');

        if (!mobileBtn || !nav) return;
        // Evitar inicializar múltiples veces si ya se hizo (por includes:loaded etc.)
        if (mobileBtn.dataset.menuInit) return;
        mobileBtn.dataset.menuInit = '1';

        function applyState(open) {
            mobileBtn.classList.toggle('open', open);
            nav.classList.toggle('mobile-menu-open', open);
            mobileBtn.setAttribute('aria-expanded', String(open));
            document.body.classList.toggle('mobile-menu-open', open);
            if (overlay) {
                overlay.classList.toggle('visible', open);
                overlay.setAttribute('aria-hidden', open ? 'false' : 'true');
            }

            // Manage aria-hidden and focusability for interactive descendants
            const isMobile = window.innerWidth <= 900;
            const focusableSelector = 'a[href], button, input, select, textarea, [tabindex]';

            if (isMobile) {
                if (!open) {
                    nav.setAttribute('aria-hidden', 'true');
                    try { nav.inert = true; } catch (e) {}

                    // Remove focusability from descendants so they are not tabbable
                    const focusables = nav.querySelectorAll(focusableSelector);
                    focusables.forEach((el) => {
                        if (el.hasAttribute('tabindex')) {
                            el.dataset.prevTabindex = el.getAttribute('tabindex');
                        } else {
                            el.dataset.prevTabindex = 'none';
                        }
                        el.setAttribute('tabindex', '-1');
                    });
                } else {
                    nav.removeAttribute('aria-hidden');
                    try { nav.inert = false; } catch (e) {}

                    // Restore previous tabindex state
                    const focusables = nav.querySelectorAll(focusableSelector);
                    focusables.forEach((el) => {
                        const prev = el.dataset.prevTabindex;
                        if (prev === 'none') {
                            el.removeAttribute('tabindex');
                        } else if (prev !== undefined) {
                            el.setAttribute('tabindex', prev);
                        }
                        delete el.dataset.prevTabindex;
                    });
                }
            } else {
                // On desktop ensure nav is visible and focusable
                nav.removeAttribute('aria-hidden');
                try { nav.inert = false; } catch (e) {}
                const focusables = nav.querySelectorAll(focusableSelector);
                focusables.forEach((el) => {
                    const prev = el.dataset.prevTabindex;
                    if (prev === 'none' || prev === undefined) {
                        el.removeAttribute('tabindex');
                    } else {
                        el.setAttribute('tabindex', prev);
                    }
                    delete el.dataset.prevTabindex;
                });
            }
        }

        // inicializar (cerrado)
        applyState(false);

        mobileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = mobileBtn.classList.contains('open');
            applyState(!isOpen);
        });

        // Si existe overlay, permitir cerrar el menú al clickearlo
        if (overlay) {
            overlay.addEventListener('click', function () { applyState(false); });
            // Inicializar atributo aria-hidden si no existe
            if (!overlay.hasAttribute('aria-hidden')) overlay.setAttribute('aria-hidden', 'true');
        }

        // cerrar con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileBtn.classList.contains('open')) {
                applyState(false);
            }
        });

        // cerrar al hacer click fuera del nav (cuando está abierto)
        document.addEventListener('click', (e) => {
            if (!mobileBtn.classList.contains('open')) return;
            const target = e.target;
            if (!nav.contains(target) && target !== mobileBtn && !mobileBtn.contains(target)) {
                applyState(false);
            }
        });

        // si se hace click en un enlace del nav en móvil, cerrar
        nav.querySelectorAll('a').forEach((a) => {
            a.addEventListener('click', () => {
                if (window.innerWidth <= 900 && mobileBtn.classList.contains('open')) {
                    applyState(false);
                }
            });
        });
    }
    // Exponer para poder inicializar después de cargar includes
        window.initMobileMenuToggle = initMobileMenuToggle;
        try { initMobileMenuToggle(); } catch (e) { /* ignore if header not present yet */ }
});

// Re-inicializar el menú móvil una vez que los includes hayan terminado de cargarse.
// include.js ahora dispara el evento 'includes:loaded' al finalizar.
document.addEventListener('includes:loaded', function () {
    if (typeof window.initMobileMenuToggle === 'function') {
        try { window.initMobileMenuToggle(); } catch (e) { console.warn('initMobileMenuToggle falló', e); }
    }
});
