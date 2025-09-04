document.addEventListener('DOMContentLoaded', () => {
     document.body.classList.remove('preload');
    // --- Ocultar Automáticamente la Barra Superior (Top Bar) al Hacer Scroll ---
    const header = document.getElementById('main-header');
    const topBar = document.querySelector('.top-bar');
    const htmlElement = document.documentElement;


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
        window.addEventListener('resize', onResizeForTopBar);

        updateCurrentTopBarHeight();
        updateHeaderTransitionClass();
        handleScrollForTopBar();
    }

    // --- Menú Móvil (Hamburguesa) ---
    const menuButton = document.getElementById('mobile-menu-button');
    const navigation = document.getElementById('main-navigation');

    if (menuButton && navigation) {
        menuButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Previene que el clic se propague y cierre el menú inmediatamente
            const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
            menuButton.setAttribute('aria-expanded', !isOpen);
            menuButton.classList.toggle('menu-active');
            navigation.classList.toggle('mobile-menu-open');
        });

        document.addEventListener('click', (event) => {
            const isClickInsideNav = navigation.contains(event.target);
            const isMenuOpen = navigation.classList.contains('mobile-menu-open');

            if (isMenuOpen && !isClickInsideNav) {
                menuButton.setAttribute('aria-expanded', 'false');
                menuButton.classList.remove('menu-active');
                navigation.classList.remove('mobile-menu-open');
            }
        });
    }

    const elementsToFadeIn = document.querySelectorAll('.fade-in-section, .fade-in-element');
    if (elementsToFadeIn.length > 0) {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.15
        };

        const observerCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Lógica simplificada y más robusta
                    entry.target.classList.add('is-visible');
                    
                    // Asegura que el contenedor padre .fade-in-section también sea visible si un hijo se activa
                    const parentSection = entry.target.closest('.fade-in-section');
                    if (parentSection) {
                        parentSection.classList.add('is-visible');
                    }
                    
                    observer.unobserve(entry.target);
                }
            });
        };

        const intersectionObserver = new IntersectionObserver(observerCallback, observerOptions);
        elementsToFadeIn.forEach(el => {
            intersectionObserver.observe(el);
        });
    }

});
