document.addEventListener('DOMContentLoaded', () => {
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
            
            // Lógica simplificada para mayor claridad y robustez
            if (scrollTop > lastScrollTop && scrollTop > currentTopBarHeight) { // SCROLL HACIA ABAJO y pasado el umbral de la top bar
                topBar.classList.add('is-hidden');
                header.classList.add('top-bar-is-hidden');
                htmlElement.classList.add('top-bar-is-hidden');
            } else if (scrollTop < lastScrollTop || scrollTop === 0) { // SCROLL HACIA ARRIBA o en la cima
                topBar.classList.remove('is-hidden');
                header.classList.remove('top-bar-is-hidden');
                htmlElement.classList.remove('top-bar-is-hidden');
            }

            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
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

    // --- Slider (Carrusel) de la Sección Hero --- 
    const sliderTrack = document.querySelector('.hero-slider-track');
    if (sliderTrack) {
        const slides = sliderTrack.querySelectorAll('.hero-slide');
        const slideCount = slides.length;
        if (slideCount > 1) {
            // Clona el primer y último slide para efecto infinito
            const firstClone = slides[0].cloneNode(true);
            const lastClone = slides[slideCount - 1].cloneNode(true);
            firstClone.classList.add('clone');
            lastClone.classList.add('clone');
            sliderTrack.appendChild(firstClone);
            sliderTrack.insertBefore(lastClone, slides[0]);

            // Ajusta el ancho del track y posición inicial
            const allSlides = sliderTrack.querySelectorAll('.hero-slide');
            sliderTrack.style.width = `${allSlides.length * 100}%`;
            allSlides.forEach(slide => slide.style.width = `${100 / allSlides.length}%`);

            let currentSlide = 1; // Empieza en el primer slide real
            let slideInterval;
            let isTransitioning = false;

            function goToSlide(slideIndex, withTransition = true) {
                if (withTransition) {
                    sliderTrack.style.transition = 'transform 0.6s cubic-bezier(.4,0,.2,1)';
                } else {
                    sliderTrack.style.transition = 'none';
                }
                sliderTrack.style.transform = `translateX(-${currentSlide * (100 / allSlides.length)}%)`;
            }

            function nextSlide() {
                if (isTransitioning) return;
                isTransitioning = true;
                currentSlide++;
                goToSlide(currentSlide, true);
            }

            // Cuando termina la transición, revisa si hay que saltar al inicio real
            sliderTrack.addEventListener('transitionend', () => {
                if (currentSlide === allSlides.length - 1) {
                    // Si estamos en el clon del primero, saltamos al primero real
                    currentSlide = 1;
                    goToSlide(currentSlide, false);
                }
                if (currentSlide === 0) {
                    // Si estamos en el clon del último, saltamos al último real
                    currentSlide = allSlides.length - 2;
                    goToSlide(currentSlide, false);
                }
                isTransitioning = false;
            });

            function startSlider() {
                clearInterval(slideInterval);
                slideInterval = setInterval(nextSlide, 5000);
            }

            function stopSlider() {
                clearInterval(slideInterval);
            }

            // Inicializa posición
            goToSlide(currentSlide, false);
            startSlider();

            const sliderContainer = document.querySelector('.hero-slider-container');
            if (sliderContainer) {
                sliderContainer.addEventListener('mouseenter', stopSlider);
                sliderContainer.addEventListener('mouseleave', startSlider);
                sliderContainer.addEventListener('focusin', stopSlider);
                sliderContainer.addEventListener('focusout', startSlider);
            }
        }
    }

    // --- Año en el Pie de Página (Footer) ---
    const yearSpan = document.getElementById('footer-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --- Elementos con Efecto Fade-in al Hacer Scroll (Secciones y HRs) ---
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

    // --- Carrusel de logos de clientes ---
    const track = document.querySelector('.client-logo-track');
    if (track) {
        // Evita clonar logos si ya se ha hecho (útil para entornos de desarrollo con hot-reloading)
        if (!track.hasAttribute('data-cloned')) { 
            const logos = track.querySelectorAll('img');
            logos.forEach(logo => {
                const clone = logo.cloneNode(true);
                clone.setAttribute('aria-hidden', 'true'); // Mejora para accesibilidad
                track.appendChild(clone);
            });
            track.setAttribute('data-cloned', 'true');
        }
    }
});
