document.addEventListener('DOMContentLoaded', () => {

    // --- MÓDULO 1: OCULTAR AUTOMÁTICAMENTE LA BARRA SUPERIOR (TOP BAR) ---
    const topBar = document.querySelector('.top-bar');
    const mainHeader = document.getElementById('main-header');
    
    if (topBar && mainHeader) {
        let lastScrollTop = 0;
        const topBarHeight = topBar.offsetHeight;

        const handleScrollForTopBar = () => {
            // No hacer nada si la top-bar está oculta por CSS (ej. en móviles)
            if (getComputedStyle(topBar).display === 'none') {
                topBar.classList.remove('is-hidden');
                mainHeader.classList.remove('top-bar-is-hidden');
                return;
            }
            
            let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            // Lógica simplificada:
            // Si bajas y ya pasaste la altura de la top-bar, ocúltala.
            // Si subes, muéstrala.
            if (scrollTop > lastScrollTop && scrollTop > topBarHeight) {
                // Scroll hacia ABAJO
                topBar.classList.add('is-hidden');
                mainHeader.classList.add('top-bar-is-hidden');
            } else if (scrollTop < lastScrollTop) {
                // Scroll hacia ARRIBA
                topBar.classList.remove('is-hidden');
                mainHeader.classList.remove('top-bar-is-hidden');
            }

            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        };

        window.addEventListener('scroll', handleScrollForTopBar, { passive: true });
        // Ejecutar al inicio por si la página carga con scroll
        handleScrollForTopBar(); 
    }

    // --- MÓDULO 2: MENÚ MÓVIL (HAMBURGUESA) ---
    const menuButton = document.getElementById('mobile-menu-button');
    const navigation = document.getElementById('main-navigation');

    if (menuButton && navigation) {
        menuButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Previene que el clic se propague al listener del documento
            const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
            menuButton.setAttribute('aria-expanded', !isOpen);
            menuButton.classList.toggle('menu-active');
            navigation.classList.toggle('mobile-menu-open');
        });

        // Cierra el menú si se hace clic fuera
        document.addEventListener('click', (event) => {
            const isMenuOpen = navigation.classList.contains('mobile-menu-open');
            if (isMenuOpen && !navigation.contains(event.target)) {
                menuButton.setAttribute('aria-expanded', 'false');
                menuButton.classList.remove('menu-active');
                navigation.classList.remove('mobile-menu-open');
            }
        });
    }

    // --- MÓDULO 3: SLIDER (CARRUSEL) DE LA SECCIÓN HERO ---
    // (Este código se ejecutará solo si encuentra los elementos en la página, ideal para el home)
    const sliderTrack = document.querySelector('.hero-slider-track');
    if (sliderTrack) {
        const slides = sliderTrack.querySelectorAll('.hero-slide');
        const slideCount = slides.length;
        if (slideCount > 1) {
            let currentSlide = 0;
            let slideInterval;

            const goToSlide = (slideIndex) => {
                currentSlide = (slideIndex + slideCount) % slideCount; // Fórmula robusta para bucle
                sliderTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
            };

            const startSlider = () => {
                clearInterval(slideInterval);
                slideInterval = setInterval(() => goToSlide(currentSlide + 1), 6000);
            };

            const stopSlider = () => clearInterval(slideInterval);

            const sliderContainer = document.querySelector('.hero-slider-container');
            if (sliderContainer) {
                sliderContainer.addEventListener('mouseenter', stopSlider);
                sliderContainer.addEventListener('mouseleave', startSlider);
                sliderContainer.addEventListener('focusin', stopSlider);
                sliderContainer.addEventListener('focusout', startSlider);
            }
            startSlider();
        }
    }

    // --- MÓDULO 4: ELEMENTOS CON EFECTO FADE-IN AL HACER SCROLL ---
    // (Simplificado para ser más genérico y reutilizable)
    const elementsToFadeIn = document.querySelectorAll('.fade-in-section, .fade-in-element');
    if (elementsToFadeIn.length > 0) {
        const observerCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Añade 'is-visible' al elemento que entró en la vista
                    entry.target.classList.add('is-visible');

                    // Además, si el elemento está dentro de una .fade-in-section,
                    // asegúrate que la sección padre también reciba la clase.
                    // Esto es útil para animaciones en títulos (h2::after) que dependen del contenedor.
                    const parentSection = entry.target.closest('.fade-in-section');
                    if (parentSection) {
                        parentSection.classList.add('is-visible');
                    }
                    
                    observer.unobserve(entry.target); // Dejar de observar para mejorar rendimiento
                }
            });
        };
        const intersectionObserver = new IntersectionObserver(observerCallback, { threshold: 0.15 });
        elementsToFadeIn.forEach(el => intersectionObserver.observe(el));
    }

    // --- MÓDULO 5: CARRUSEL DE LOGOS DE CLIENTES ---
    // (Este código se ejecutará solo si encuentra el carrusel en la página, ideal para about.html)
    const logoTrack = document.querySelector('.client-logo-track');
    if (logoTrack) {
        // Clonar los logos para el efecto de scroll infinito
        const logos = logoTrack.querySelectorAll('img');
        logos.forEach(logo => {
            const clone = logo.cloneNode(true);
            // Añadir atributo para que los lectores de pantalla ignoren los clones
            clone.setAttribute('aria-hidden', 'true'); 
            logoTrack.appendChild(clone);
        });
    }

    // --- MÓDULO 6: ACTUALIZACIÓN DE FECHA DEL FOOTER ---
    // (Asegúrate de tener <span id="footer-year"></span> en tu HTML para que funcione)
    const yearSpan = document.getElementById('footer-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
    
    // --- MÓDULO 7: ANIMACIÓN DE NÚMEROS (CONTADOR) ---
    // (Se ejecutará si encuentra elementos .metric-item en la página)
    const metricsItems = document.querySelectorAll('.metric-item .number');
    if (metricsItems.length > 0) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const finalValue = element.textContent.trim();

                    if (!isNaN(parseInt(finalValue))) {
                        animateCountUp(element);
                    }
                    observer.unobserve(element);
                }
            });
        }, { threshold: 0.5 });

        metricsItems.forEach(item => observer.observe(item));

        function animateCountUp(el) {
            const target = parseInt(el.textContent, 10);
            const duration = 1500; // Duración de la animación en milisegundos
            const startTime = performance.now();
            
            const step = (currentTime) => {
                const elapsedTime = currentTime - startTime;
                const progress = Math.min(elapsedTime / duration, 1);
                el.textContent = Math.floor(progress * target);
                
                if (progress < 1) {
                    requestAnimationFrame(step);
                } else {
                    el.textContent = target + '+'; // Añadir el '+' al final
                }
            };
            requestAnimationFrame(step);
        }
    }
});
