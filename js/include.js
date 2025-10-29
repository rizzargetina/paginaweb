// js/include.js
// Carga HTML desde una ruta externa y lo inserta en elementos con el atributo data-include
// Uso: <div data-include="templates/header.html"></div>
// Incluir este script antes de </body>: <script src="js/include.js"></script>

(function () {
  'use strict';

  function loadHTML(path, container) {
    // marcar contenedor como loading para evitar FOUC mientras se hace fetch
    try { container.classList.add('include-loading'); } catch (e) { }
    try { container.setAttribute('aria-hidden', 'true'); } catch (e) { }

    return fetch(path, { cache: 'no-store' })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP error ' + res.status);
        return res.text();
      })
      .then(function (html) {
        container.innerHTML = html;
        // marcar como listo y restaurar accesibilidad
        try { container.classList.remove('include-loading'); } catch (e) { }
        try { container.classList.add('include-ready'); } catch (e) { }
        try { container.removeAttribute('aria-hidden'); } catch (e) { }
        // Ejecutar scripts internos del HTML incluido (para que funcionen eventos inline o módulos externos)
        Array.from(container.querySelectorAll('script')).forEach(function (oldScript) {
          var script = document.createElement('script');
          if (oldScript.src) {
            // copia el src y permite que el navegador lo cargue
            script.src = oldScript.src;
            script.async = false; // preservar orden
          } else {
            script.textContent = oldScript.textContent;
          }
          // Copiar atributos tipo, nomodule, etc.
          Array.from(oldScript.attributes).forEach(function (attr) {
            try { script.setAttribute(attr.name, attr.value); } catch (e) { }
          });
          document.head.appendChild(script);
          // Remover el script original para evitar re-ejecuciones si se vuelve a cargar
          oldScript.parentNode && oldScript.parentNode.removeChild(oldScript);
        });
      });
  }

  function includeAll() {
    // indicar al CSS que estamos cargando includes para evitar FOUC
    try { document.documentElement.classList.add('includes-loading'); } catch (e) { }

    var els = document.querySelectorAll('[data-include]');
    var promises = Array.from(els).map(function (el) {
      var path = el.getAttribute('data-include');
      if (!path) return Promise.resolve();
      return loadHTML(path, el).catch(function (err) {
        console.error('[include.js] Error cargando', path, err);
        // Mostrar un fallback mínimo para evitar huecos en la UI
        el.innerHTML = '';
      });
    });
    // Cuando todos los includes se hayan cargado, emitir un evento para que otros
    // scripts puedan inicializarse (por ejemplo inyección de JSON-LD o menús).
    return Promise.all(promises).then(function (res) {
      try {
        document.dispatchEvent(new CustomEvent('includes:loaded'));
      } catch (e) {
        /* fallthrough si CustomEvent no está disponible */
      }
      // marcar que los includes terminaron (CSS puede mostrarlos)
      try {
        document.documentElement.classList.remove('includes-loading');
        document.documentElement.classList.add('includes-loaded');
      } catch (e) { }
      return res;
    });
  }

  // API pública: permite cargar manualmente si se necesita
  window.includeHTML = includeAll;

  // Autoejecución al cargar el DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { includeAll(); });
  } else {
    includeAll();
  }
})();
