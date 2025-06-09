document.addEventListener('DOMContentLoaded', () => {
    // --- Ocultar Automáticamente la Barra Superior (Top Bar) al Hacer Scroll ---
    const header = document.getElementById('main-header'); // Obtenemos la referencia al elemento del encabezado principal por su ID.
    // Esta sección maneja la lógica para ocultar/mostrar automáticamente una barra superior ('top-bar')
    // al hacer scroll, y ajusta la posición del encabezado principal ('header') y el padding de la página.
    const topBar = document.querySelector('.top-bar'); // Obtenemos la referencia a la barra superior usando su clase CSS.
    // La variable 'header' (mainHeader) ya fue definida arriba.
    const htmlElement = document.documentElement; // Referencia al elemento <html>, útil para ajustar el scroll-padding.

    if (topBar && header && htmlElement) { // Solo ejecutar si todos los elementos necesarios existen.
        let lastScrollTop = 0; // Almacena la última posición de scroll conocida para detectar la dirección (arriba/abajo).
        let currentTopBarHeight = 0; // Altura actual de la top-bar (puede ser 0 si está oculta por CSS, ej. en móviles).
        const hideOffsetThreshold = 0.5; // Umbral (relativo a la altura de la top-bar) para empezar a ocultar/mostrar.
                                        // Significa que se empieza a ocultar/mostrar cuando se ha hecho scroll
                                        // por esta fracción de la altura de la top-bar, o cuando se ha pasado esa altura.

        // Función auxiliar para verificar si la top-bar está visible (no tiene 'display: none' en CSS).
        const isTopBarEffectivelyVisible = () => getComputedStyle(topBar).display !== 'none';

        // Actualiza la variable 'currentTopBarHeight'.
        // Es útil si la altura de la top-bar cambia dinámicamente (ej. en responsive design cuando aparece/desaparece).
        const updateCurrentTopBarHeight = () => {
            currentTopBarHeight = isTopBarEffectivelyVisible() ? topBar.offsetHeight : 0;
        };

        // Añade/quita una clase al header principal para que las transiciones CSS
        // se apliquen solo cuando la top-bar está activa y puede afectar al header.
        const updateHeaderTransitionClass = () => {
            if (isTopBarEffectivelyVisible()) {
                header.classList.add('top-bar-effects-active');
            } else {
                header.classList.remove('top-bar-effects-active');
            }
        };

        // Función principal que maneja la lógica de ocultar/mostrar la top-bar al hacer scroll.
        const handleScrollForTopBar = () => {
            if (!isTopBarEffectivelyVisible()) {
                // Si la top-bar no está activa (ej. en vista móvil donde tiene 'display:none' por CSS Media Queries).
                // Nos aseguramos de que todas las clases relacionadas con "ocultar" se eliminen.
                // Las Media Queries de CSS se encargan del layout (padding del body, scroll-padding del html).
                topBar.classList.remove('is-hidden');       // Resetea la transformación si estaba aplicada.
                header.classList.remove('top-bar-is-hidden'); // Resetea el ajuste 'top' del header.
                htmlElement.classList.remove('top-bar-is-hidden'); // Resetea el ajuste 'scrollPaddingTop' del html.
                return; // No aplicar la lógica de ocultar/mostrar basada en scroll para la top-bar.
            }

            // Si la top-bar está activa, procedemos con la lógica de scroll.
            let scrollTop = window.pageYOffset || document.documentElement.scrollTop; // Posición actual del scroll.

            // Determinar si ocultar o mostrar basado en la dirección del scroll y la posición relativa a la altura de la top-bar.
            if (scrollTop > lastScrollTop) { // Haciendo scroll hacia ABAJO.
                // Ocultar solo si hemos bajado lo suficiente, más allá de la altura de la top-bar más el umbral.
                if (scrollTop > currentTopBarHeight + (currentTopBarHeight * hideOffsetThreshold)) {
                    topBar.classList.add('is-hidden');          // Oculta la top-bar (generalmente con un transform: translateY(-100%)).
                    header.classList.add('top-bar-is-hidden');   // Mueve el header principal hacia arriba para ocupar el espacio.
                    htmlElement.classList.add('top-bar-is-hidden'); // Ajusta el scroll-padding del HTML para que los anclajes funcionen bien.
                }
            } else if (scrollTop < lastScrollTop) { // Haciendo scroll hacia ARRIBA.
                // Mostrar si estamos subiendo y estamos cerca o por encima de la posición original de la top-bar.
                // La condición 'scrollTop <= currentTopBarHeight' asegura que se muestre al acercarse a la parte superior.
                 if (scrollTop <= currentTopBarHeight + (currentTopBarHeight * hideOffsetThreshold)) { // Mostrar un poco antes de llegar al tope.
                    topBar.classList.remove('is-hidden');
                    header.classList.remove('top-bar-is-hidden');
                    htmlElement.classList.remove('top-bar-is-hidden');
                }
            } else { // La posición de scroll es estática, o exactamente en la parte superior (scrollTop === 0).
                 if (scrollTop === 0) { // Asegurarse de que siempre esté visible en la parte superior de la página.
                    topBar.classList.remove('is-hidden');
                    header.classList.remove('top-bar-is-hidden');
                    htmlElement.classList.remove('top-bar-is-hidden');
                 }
            }
            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // Actualizar la última posición de scroll. Se asegura que no sea negativo (importante en algunos navegadores móviles).
        };

        // Manejador para el evento 'resize' de la ventana.
        // Se ejecuta cuando el tamaño de la ventana del navegador cambia.
        const onResizeForTopBar = () => {
            updateCurrentTopBarHeight();    // La altura de la top-bar podría cambiar si aparece/desaparece debido a Media Queries.
            updateHeaderTransitionClass();  // Gestionar la clase de transición en el header principal.
            // Recalcular lastScrollTop para handleScroll, ya que los cambios en el viewport pueden afectar la lógica de scroll.
            lastScrollTop = window.pageYOffset || document.documentElement.scrollTop; // Actualizar referencia de scroll.
            handleScrollForTopBar();        // Re-evaluar el estado del scroll basado en la nueva visibilidad/altura.
        };

        // Escuchar el evento de scroll en la ventana.
        // { passive: true } indica al navegador que este listener no llamará a preventDefault(), optimizando el rendimiento del scroll.
        window.addEventListener('scroll', handleScrollForTopBar, { passive: true });
        // Escuchar el evento de cambio de tamaño de la ventana.
        window.addEventListener('resize', onResizeForTopBar);

        // Configuración inicial cuando la página carga.
        updateCurrentTopBarHeight();
        updateHeaderTransitionClass();
        lastScrollTop = window.pageYOffset || document.documentElement.scrollTop; // Establecer el scroll inicial para la primera llamada a handleScroll.
        handleScrollForTopBar(); // Establecer el estado inicial basado en el scroll y visibilidad actual.
    }
    // --- Fin de Ocultar Automáticamente la Barra Superior ---


    // --- Menú Móvil (Hamburguesa) ---
    // Esta sección controla la funcionalidad del menú de navegación en dispositivos móviles.
    const menuButton = document.getElementById('mobile-menu-button'); // Botón para abrir/cerrar el menú móvil.
    const navigation = document.getElementById('main-navigation');   // Contenedor de la navegación principal.

    if (menuButton && navigation) { // Solo si ambos elementos existen.
        menuButton.addEventListener('click', () => { // Al hacer clic en el botón del menú...
            // Verifica si el menú está actualmente abierto (basado en el atributo 'aria-expanded').
            const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
            menuButton.setAttribute('aria-expanded', !isOpen); // Alterna el estado de 'aria-expanded' (importante para accesibilidad).
            menuButton.classList.toggle('menu-active');        // Alterna una clase en el botón (para cambiar su ícono, ej. hamburguesa a X).
            navigation.classList.toggle('mobile-menu-open');   // Alterna una clase en la navegación para mostrarla/ocultarla.

            // Opcional: Prevenir el scroll del cuerpo de la página cuando el menú está abierto.
            // document.body.style.overflow = !isOpen ? 'hidden' : '';
        });

        // Lógica opcional para cerrar el menú si se hace clic fuera de él (mejora la experiencia de usuario).
        document.addEventListener('click', (event) => {
            const isClickInsideNav = navigation.contains(event.target); // ¿Se hizo clic dentro del área de navegación?
            const isClickOnButton = menuButton.contains(event.target);  // ¿Se hizo clic en el botón del menú?
            const isMenuOpen = navigation.classList.contains('mobile-menu-open'); // ¿Está el menú abierto?

            // Si el menú está abierto Y el clic NO fue dentro de la navegación NI en el botón...
            if (isMenuOpen && !isClickInsideNav && !isClickOnButton) {
                menuButton.setAttribute('aria-expanded', 'false'); // Marcar como cerrado para accesibilidad.
                menuButton.classList.remove('menu-active');      // Quitar clase activa del botón.
                navigation.classList.remove('mobile-menu-open'); // Ocultar el menú.
                // document.body.style.overflow = ''; // Volver a habilitar el scroll del cuerpo si se había deshabilitado.
            }
        });
    }


    // --- Slider (Carrusel) de la Sección Hero ---
    // Gestiona un carrusel o slider simple en la sección principal o 'hero' de la página.
    const sliderTrack = document.getElementById('hero-slider-track'); // El elemento que contiene todos los slides y se mueve.
    if (sliderTrack) {
        const slides = sliderTrack.querySelectorAll('.hero-slide'); // Todos los elementos individuales del slider.
        const slideCount = slides.length; // Número total de slides.
        let currentSlide = 0; // Índice del slide actual (comienza en 0).
        let slideInterval; // Variable para guardar el temporizador del cambio automático.

        // Opcional: Establecer el ancho del track si los slides no son 100% del contenedor.
        // Útil si los slides tienen anchos diferentes o si se quiere mostrar parte del siguiente/anterior.
        // sliderTrack.style.width = `${slideCount * 100}%`;

        // Función para cambiar al slide especificado por su índice.
        function goToSlide(slideIndex) {
            if (slideIndex < 0) { // Si el índice es menor que 0 (antes del primer slide)...
                slideIndex = slideCount - 1; // ...ir al último slide.
            } else if (slideIndex >= slideCount) { // Si el índice es mayor o igual al número de slides (después del último)...
                slideIndex = 0; // ...ir al primer slide.
            }
            // Mueve el 'sliderTrack' horizontalmente. Cada slide ocupa el 100% del ancho del contenedor del track.
            sliderTrack.style.transform = `translateX(-${slideIndex * 100}%)`;
            currentSlide = slideIndex; // Actualiza el índice del slide actual.
        }

        // Función para pasar al siguiente slide.
        function nextSlide() {
            goToSlide(currentSlide + 1);
        }

        // Inicia el cambio automático de slides.
        function startSlider() {
            stopSlider(); // Limpia cualquier intervalo existente primero para evitar múltiples timers.
            slideInterval = setInterval(nextSlide, 6000); // Cambia de slide cada 6000 milisegundos (6 segundos).
        }

        // Detiene el cambio automático de slides.
        function stopSlider() {
             clearInterval(slideInterval); // Limpia el temporizador.
        }

        // Iniciar el slider automáticamente solo si hay más de un slide.
        if (slideCount > 1) {
            startSlider();

             // Opcional: Pausar el slider cuando el ratón está encima (hover) y reanudar cuando sale.
            const sliderContainer = document.querySelector('.hero-slider-container'); // Contenedor general del slider.
             if (sliderContainer) {
                 sliderContainer.addEventListener('mouseenter', stopSlider); // Al entrar el ratón, parar.
                 sliderContainer.addEventListener('mouseleave', startSlider); // Al salir el ratón, reanudar.
                 // Añadir pausa también con foco para accesibilidad (usuarios de teclado).
                 sliderContainer.addEventListener('focusin', stopSlider);  // Al recibir foco (ej. con Tab), parar.
                 sliderContainer.addEventListener('focusout', startSlider); // Al perder foco, reanudar.
             }
        }
    }

    // --- Año en el Pie de Página (Footer) ---
    // Actualiza dinámicamente el año en el pie de página para que siempre muestre el año actual.
    const yearSpan = document.getElementById('footer-year'); // Elemento span donde se mostrará el año.
    if (yearSpan) { // Si el elemento existe...
        yearSpan.textContent = new Date().getFullYear(); // Obtiene el año actual y lo asigna al contenido del span.
    }

    // --- Elementos con Efecto Fade-in al Hacer Scroll (Secciones y HRs) ---
    // Implementa un efecto de aparición (fade-in) para ciertos elementos
    // cuando entran en el viewport (la parte visible de la pantalla) al hacer scroll.
    const elementsToFadeIn = document.querySelectorAll('.fade-in-section, .fade-in-element'); // Selecciona todos los elementos con estas clases.
    if (elementsToFadeIn.length > 0) { // Solo si se encontraron elementos para animar.
        const observerOptions = {
            root: null, // Observa la intersección con el viewport del navegador.
            rootMargin: '0px', // Sin margen adicional alrededor del viewport.
            threshold: 0.15 // El callback se dispara cuando al menos el 15% del elemento es visible.
                            // Puede ser menor para elementos delgados como <hr>, ej. 0.05.
        };

        // Esta función (callback) se ejecuta cuando un elemento observado cambia su estado de intersección con el viewport.
        const observerCallback = (entries, observer) => {
            entries.forEach(entry => { // Itera sobre cada elemento que cambió su estado de intersección.
                if (entry.isIntersecting) { // Si el elemento está ahora (parcialmente) visible en el viewport...
                    entry.target.classList.add('is-visible'); // ...agrega la clase 'is-visible'. (CSS se encarga de la animación de fade-in).

                    // Lógica adicional para asegurar que si un 'fade-in-element' está dentro de un '.section-container',
                    // el contenedor también reciba 'is-visible'. Esto es útil si el contenedor padre tiene estilos
                    // (por ejemplo, una línea decorativa en `h2::after`) que dependen de esta clase para animarse.
                    if (entry.target.classList.contains('section-container') || entry.target.closest('.section-container')) {
                        const container = entry.target.classList.contains('section-container') ? entry.target : entry.target.closest('.section-container');
                        if (container) container.classList.add('is-visible');
                    }
                    // Caso especial para la sección 'como-postular': asegurar que esta sección obtenga la clase 'is-visible'
                    // si ella misma o un elemento hijo dentro de ella es el 'entry.target' que se vuelve visible.
                    if (entry.target.id === 'como-postular' || entry.target.closest('#como-postular')) {
                         const comoPostularSection = document.getElementById('como-postular');
                         if (comoPostularSection) comoPostularSection.classList.add('is-visible');
                    }

                    observer.unobserve(entry.target); // Una vez que el elemento es visible, deja de observarlo para mejorar el rendimiento.
                }
            });
        };

        // Crea una nueva instancia del IntersectionObserver con el callback y las opciones definidas.
        const intersectionObserver = new IntersectionObserver(observerCallback, observerOptions);

        // Comienza a observar cada uno de los elementos seleccionados.
        elementsToFadeIn.forEach(el => {
            intersectionObserver.observe(el);
        });
    }
    
document.addEventListener('DOMContentLoaded', function() {
    const track = document.querySelector('.client-logo-track');
    if (track) {
        const logos = track.querySelectorAll('img');
        // Duplicar los logos para crear el efecto infinito
        logos.forEach(logo => {
            const clone = logo.cloneNode(true);
            track.appendChild(clone);
        });
    }
});
