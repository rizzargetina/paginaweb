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


    // Menú móvil (simplificado): usar el checkbox existente como fuente de verdad
    (function setupMobileMenuToggleSimple() {
        const mobileToggle = document.getElementById('mobile-menu-toggle');
        const mobileBtn = document.querySelector('.mobile-menu-button');
        const nav = document.querySelector('#main-navigation.rulenav, .rulenav');

        if (!mobileToggle || !mobileBtn || !nav) return;

        function applyState(checked) {
            mobileBtn.classList.toggle('open', checked);
            nav.classList.toggle('mobile-menu-open', checked);
            mobileBtn.setAttribute('aria-expanded', String(checked));
            nav.setAttribute('aria-hidden', String(!checked));
            document.body.classList.toggle('mobile-menu-open', checked);
        }

        // inicializar
        applyState(Boolean(mobileToggle.checked));

        // sincronizar cuando cambie el checkbox (label ya lo activa automáticamente)
        mobileToggle.addEventListener('change', () => applyState(mobileToggle.checked));

        // cerrar con Escape -> simplemente desmarcar el checkbox
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileToggle.checked) {
                mobileToggle.checked = false;
                applyState(false);
            }
        });

        // si se hace click en un enlace del nav en móvil, cerrar
        nav.querySelectorAll('a').forEach((a) => {
            a.addEventListener('click', () => {
                if (window.innerWidth <= 900 && mobileToggle.checked) {
                    mobileToggle.checked = false;
                    applyState(false);
                }
            });
        });
    })();
});
