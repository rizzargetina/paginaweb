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


    // Menú móvil (hamburguesa) - JS toggle: abrir/cerrar y accesibilidad
    (function setupMobileMenuToggle() {
        const mobileBtn = document.querySelector('.mobile-menu-button');
        const nav = document.querySelector('#main-navigation.rulenav, .rulenav');
        const mobileToggle = document.getElementById('mobile-menu-toggle');

        if (!mobileBtn || !nav) return;

        // Inicializar atributos accesibles
        if (!mobileBtn.hasAttribute('aria-expanded')) mobileBtn.setAttribute('aria-expanded', 'false');
        if (nav.id && !mobileBtn.hasAttribute('aria-controls')) {
            mobileBtn.setAttribute('aria-controls', nav.id);
        }
        if (!nav.hasAttribute('aria-hidden')) nav.setAttribute('aria-hidden', 'true');

        function closeMenu() {
            mobileBtn.classList.remove('open');
            nav.classList.remove('mobile-menu-open');
            mobileBtn.setAttribute('aria-expanded', 'false');
            nav.setAttribute('aria-hidden', 'true');
            if (mobileToggle) mobileToggle.checked = false;
            document.body.classList.remove('mobile-menu-open');
        }

        function openMenu() {
            mobileBtn.classList.add('open');
            nav.classList.add('mobile-menu-open');
            mobileBtn.setAttribute('aria-expanded', 'true');
            nav.setAttribute('aria-hidden', 'false');
            if (mobileToggle) mobileToggle.checked = true;
            // prevent background scroll when menu is open
            document.body.classList.add('mobile-menu-open');
        }

        // If there's a checkbox toggle in the markup, prefer it as the source of truth.
        if (mobileToggle) {
            // Initialize state from checkbox
            if (mobileToggle.checked) openMenu();

            mobileToggle.addEventListener('change', () => {
                if (mobileToggle.checked) openMenu();
                else closeMenu();
            });

            // Clicking the label (which is `.mobile-menu-button`) will toggle the checkbox automatically.
            // Keep visual sync in case JS needs to set ARIA.
            mobileBtn.addEventListener('click', () => {
                // small guard: delay to let the checkbox checked state update
                setTimeout(() => {
                    if (mobileToggle.checked) openMenu();
                    else closeMenu();
                }, 10);
            });
        } else {
            // No checkbox: fall back to toggling on the button
            mobileBtn.addEventListener('click', () => {
                const isOpen = mobileBtn.classList.toggle('open');
                nav.classList.toggle('mobile-menu-open', isOpen);
                mobileBtn.setAttribute('aria-expanded', String(isOpen));
                nav.setAttribute('aria-hidden', String(!isOpen));
            });
        }

        // Close on Escape key
        document.addEventListener('keydown', (ev) => {
            if (ev.key === 'Escape' && (mobileBtn.classList.contains('open') || (mobileToggle && mobileToggle.checked))) {
                closeMenu();
            }
        });

        // Close when clicking outside the nav / button
        document.addEventListener('click', (ev) => {
            const target = ev.target;
            const menuIsOpen = mobileBtn.classList.contains('open') || (mobileToggle && mobileToggle.checked);
            if (!menuIsOpen) return;
            if (nav.contains(target) || mobileBtn.contains(target) || (mobileToggle && mobileToggle.contains && mobileToggle.contains(target))) {
                return; // click inside menu or on the toggle -> ignore
            }
            // otherwise close
            closeMenu();
        }, { passive: true });

        // When a nav link is clicked on small screens, close menu
        nav.querySelectorAll('a').forEach((a) => {
            a.addEventListener('click', () => {
                if (window.innerWidth <= 900 && (mobileBtn.classList.contains('open') || (mobileToggle && mobileToggle.checked))) {
                    closeMenu();
                }
            });
        });
    })();
});
