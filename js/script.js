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

    // --- Menú Móvil (Hamburguesa) ---
    const menuButton = document.getElementById('mobile-menu-button');
    const navigation = document.getElementById('main-navigation');

    if (menuButton && navigation) {
        // Helper to close menu and reset button state
        const closeMenu = () => {
            menuButton.setAttribute('aria-expanded', 'false');
            menuButton.classList.remove('menu-active');
            menuButton.classList.remove('open');
            navigation.classList.remove('mobile-menu-open');
        };

        // Toggle open/closed on click — keep aria attribute correct
        menuButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Previene que el clic se propague y cierre el menú inmediatamente
            const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
            const nextOpen = !isOpen;
            menuButton.setAttribute('aria-expanded', String(nextOpen));
            menuButton.classList.toggle('menu-active');
            menuButton.classList.toggle('open');
            navigation.classList.toggle('mobile-menu-open');
        });

        // Close when clicking outside the navigation
        document.addEventListener('click', (event) => {
            const isClickInsideNav = navigation.contains(event.target) || menuButton.contains(event.target);
            const isMenuOpen = navigation.classList.contains('mobile-menu-open');

            if (isMenuOpen && !isClickInsideNav) {
                closeMenu();
            }
        });

        // Close on Escape key for accessibility
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' || event.key === 'Esc') {
                const isMenuOpen = navigation.classList.contains('mobile-menu-open');
                if (isMenuOpen) closeMenu();
            }
        });

        // Close when a navigation link is activated (use capture to catch SPA-like behavior)
        navigation.addEventListener('click', (event) => {
            const target = event.target;
            if (target && (target.tagName === 'A' || target.closest('a'))) {
                // Small delay to allow link focus/active styles if needed, then close
                setTimeout(closeMenu, 50);
            }
        });
    }


});
