document.addEventListener('DOMContentLoaded', () => {
     document.body.classList.remove('preload');
    // --- Ocultar Automáticamente la Barra Superior (Top Bar) al Hacer Scroll ---
    const header = document.getElementById('main-header');
    const topBar = document.querySelector('.top-bar');
    const htmlElement = document.documentElement;

    // Solo activar funciones de la top bar si el ancho de pantalla es mayor a 600px
    function isDesktop() {
        return window.innerWidth > 600;
    }

    function activateTopBarFunctions() {
        if (topBar && header && htmlElement) {
            let lastScrollTop = 0;
            let currentTopBarHeight = 0;
            const hideOffsetThreshold = 0.5;

            const isTopBarEffectivelyVisible = () => getComputedStyle(topBar).display !== 'none';

            const updateCurrentTopBarHeight = () => {
                currentTopBarHeight = isTopBarEffectivelyVisible() ? topBar.offsetHeight : 0;
            };

            const updateHeaderTransitionClass = () => {
                if (isTopBarEffectivelyVisible()) {
                    header.classList.add('top-bar-effects-active');
                } else {
                    header.classList.remove('top-bar-effects-active');
                }
            };

            const handleScrollForTopBar = () => {
                if (!isTopBarEffectivelyVisible()) {
                    topBar.classList.remove('is-hidden');
                    header.classList.remove('top-bar-is-hidden');
                    htmlElement.classList.remove('top-bar-is-hidden');
                    return;
                }

                let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

                // Solo mostrar la top bar si el scroll está en la parte más arriba
                if (scrollTop === 0) {
                    topBar.classList.remove('is-hidden');
                    header.classList.remove('top-bar-is-hidden');
                    htmlElement.classList.remove('top-bar-is-hidden');
                } else {
                    topBar.classList.add('is-hidden');
                    header.classList.add('top-bar-is-hidden');
                    htmlElement.classList.add('top-bar-is-hidden');
                }
            };

            const onResizeForTopBar = () => {
                updateCurrentTopBarHeight();
                updateHeaderTransitionClass();
                lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;
                handleScrollForTopBar();
            };

            window.addEventListener('scroll', handleScrollForTopBar, { passive: true });
            window.addEventListener('resize', () => {
                if (isDesktop()) {
                    onResizeForTopBar();
                } else {
                    // Si pasa a móvil, quitar clases y listeners
                    topBar.classList.remove('is-hidden');
                    header.classList.remove('top-bar-is-hidden');
                    htmlElement.classList.remove('top-bar-is-hidden');
                }
            });

            updateCurrentTopBarHeight();
            updateHeaderTransitionClass();
            handleScrollForTopBar();
        }
    }

    if (isDesktop()) {
        activateTopBarFunctions();
    }


    // Menú móvil: controlar apertura/cierre con botón (sin checkbox)
    (function setupMobileMenuToggle() {
        const mobileBtn = document.getElementById('mobile-menu-button');
        const nav = document.querySelector('#main-navigation.rulenav, .rulenav');

        if (!mobileBtn || !nav) return;

        function applyState(open) {
            mobileBtn.classList.toggle('open', open);
            nav.classList.toggle('mobile-menu-open', open);
            mobileBtn.setAttribute('aria-expanded', String(open));
            document.body.classList.toggle('mobile-menu-open', open);

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
    })();
});
