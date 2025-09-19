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
    // HTML uses an input#mobile-menu-toggle (checkbox) and a label.mobile-menu-button.
    const menuToggleCheckbox = document.getElementById('mobile-menu-toggle');
    const menuButtonLabel = document.querySelector('.mobile-menu-button');
    const navigation = document.getElementById('main-navigation');

    if (navigation && (menuToggleCheckbox || menuButtonLabel)) {
        // Ensure navigation has ARIA and initial state
        navigation.setAttribute('aria-hidden', 'true');

        const openMenu = () => {
            navigation.classList.add('mobile-menu-open');
            navigation.setAttribute('aria-hidden', 'false');
            if (menuButtonLabel) {
                menuButtonLabel.classList.add('open');
                menuButtonLabel.setAttribute('aria-expanded', 'true');
            }
            if (menuToggleCheckbox) menuToggleCheckbox.checked = true;
        };

        const closeMenu = () => {
            navigation.classList.remove('mobile-menu-open');
            navigation.setAttribute('aria-hidden', 'true');
            if (menuButtonLabel) {
                menuButtonLabel.classList.remove('open');
                menuButtonLabel.setAttribute('aria-expanded', 'false');
            }
            if (menuToggleCheckbox) menuToggleCheckbox.checked = false;
        };

        const toggleMenu = () => {
            const isOpen = navigation.classList.contains('mobile-menu-open');
            if (isOpen) closeMenu(); else openMenu();
        };

        // If there's a true checkbox in the DOM, bind its change to open/close
        if (menuToggleCheckbox) {
            // Keep label click behavior but rely on checkbox state as source-of-truth
            menuToggleCheckbox.addEventListener('change', (e) => {
                if (e.target.checked) openMenu(); else closeMenu();
            });
        }

        // Label fallback: if user clicks the visible label element, toggle
        if (menuButtonLabel) {
            menuButtonLabel.addEventListener('click', (e) => {
                e.preventDefault();
                toggleMenu();
            });
        }

        // Close when a navigation link is activated
        navigation.addEventListener('click', (event) => {
            const target = event.target;
            if (target && (target.tagName === 'A' || target.closest('a'))) {
                // small delay to allow navigation to proceed
                setTimeout(closeMenu, 50);
            }
        });

        // Close when clicking outside the nav (on document) or pressing Escape
        document.addEventListener('click', (e) => {
            if (!navigation.classList.contains('mobile-menu-open')) return;
            if (e.target.closest && (e.target.closest('#main-navigation') || e.target.closest('.mobile-menu-button') || e.target.closest('label[for="mobile-menu-toggle"]'))) return;
            closeMenu();
        });

        // Also close when the user taps/clicks inside the nav on mobile
        // but avoid closing when interacting with form controls or the menu toggle itself.
        navigation.addEventListener('pointerup', (e) => {
            if (!navigation.classList.contains('mobile-menu-open')) return;

            const el = e.target;

            // If it's a link, let the navigation click handler handle delayed close.
            if (el.closest && el.closest('a')) return;

            // Do not close when interacting with inputs, buttons, selects, textareas, or the checkbox toggle
            if (el.closest && (el.closest('input') || el.closest('button') || el.closest('select') || el.closest('textarea') || el.closest('label[for="mobile-menu-toggle"]') || el.id === 'mobile-menu-toggle')) return;

            // For any other tap inside the open nav (e.g. blank area), close the menu
            closeMenu();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navigation.classList.contains('mobile-menu-open')) {
                closeMenu();
            }
        });
    }



});
