// Inserta JSON-LD en el <head> usando `window.siteInfoSchema` si está presente.
// `utilities/info.js` define `window.siteInfoSchema` como la fuente única de verdad.
(function () {
  try {
    function injectSchema() {
      try {
        var schema = (typeof window !== 'undefined' && window.siteInfoSchema) ? window.siteInfoSchema : null;
        if (!schema) return false;
        var script = document.createElement('script');
        script.type = 'application/ld+json';
        // usar textContent/text para compatibilidad
        script.text = JSON.stringify(schema);
        (document.head || document.getElementsByTagName('head')[0] || document.documentElement).appendChild(script);
        return true;
      } catch (e) {
        if (typeof console !== 'undefined' && console.warn) console.warn('No se pudo inyectar JSON-LD (inner):', e);
        return false;
      }
    }

    // Intento inmediato (si utilities/info.js se cargó antes)
    if (injectSchema()) return;

    // Si aún no está disponible, esperar al evento 'includes:loaded' o DOMContentLoaded
    var onLoaded = function () {
      if (injectSchema()) {
        removeListeners();
      }
    };

    function removeListeners() {
      try { document.removeEventListener('includes:loaded', onLoaded); } catch (e) {}
      try { document.removeEventListener('DOMContentLoaded', onLoaded); } catch (e) {}
    }

    document.addEventListener('includes:loaded', onLoaded);
    document.addEventListener('DOMContentLoaded', onLoaded);

    // Fallback: reintentar una vez tras un pequeño retardo por si el include se carga tarde
    setTimeout(onLoaded, 2000);

  } catch (err) {
    if (typeof console !== 'undefined' && console.warn) console.warn('No se pudo inyectar JSON-LD:', err);
  }
})();
