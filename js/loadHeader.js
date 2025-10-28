// Fetch and inject the header partial into pages, then notify the page that
// the header is loaded so any initialization can run.
(function () {
    const containerId = 'site-header';
    const partialPath = 'partials/header.html';

    function resolveUrl(path) {
        // Resolve relative path against the current document location
        try {
            return new URL(path, window.location.href).href;
        } catch (e) {
            return path;
        }
    }

    async function loadHeader() {
        const container = document.getElementById(containerId);
        if (!container) return;

        const url = resolveUrl(partialPath);

        try {
            const resp = await fetch(url, { cache: 'no-cache' });
            if (!resp.ok) throw new Error(`HTTP ${resp.status} ${resp.statusText}`);
            const html = await resp.text();

            // inject html
            container.innerHTML = html;
            container.setAttribute('aria-hidden', 'false');

            // execute any inline/linked scripts from the fetched partial
            const scripts = Array.from(container.querySelectorAll('script'));
            for (const s of scripts) {
                const newScript = document.createElement('script');
                if (s.src) {
                    // resolve src relative to the fetched document
                    newScript.src = new URL(s.getAttribute('src'), url).href;
                    newScript.async = false; // preserve execution order
                } else {
                    newScript.textContent = s.textContent;
                }
                document.head.appendChild(newScript);
                s.parentNode && s.parentNode.removeChild(s);
            }

            // Dispatch a custom event so other scripts can initialize
            const ev = new CustomEvent('headerLoaded', { bubbles: true, detail: { url } });
            document.dispatchEvent(ev);
        } catch (err) {
            // Provide visible feedback and detailed console info to help debugging.
            console.error('Failed to load header partial from', url, err);
            container.innerHTML = `<div class="header-load-error" style="padding:12px;border:2px dashed #c00;background:#fff6f6;color:#600;font-size:14px;">No se pudo cargar la cabecera desde <code>${url}</code>. Revisa la ruta o ejecuta un servidor local (no funciona en algunos navegadores al abrir archivos por file://). Consulta la consola para más detalles.</div>`;
            container.setAttribute('aria-hidden', 'false');
        }
    }

    // Run as soon as possible, but after DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadHeader);
    } else {
        loadHeader();
    }
})();
