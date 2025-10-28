// Fetch and inject the header partial into pages, then notify the page that
// the header is loaded so any initialization can run.
(function () {
    const containerId = 'site-header';
    // Try root-first then relative. Pages in subfolders need the root path ("/partials/header.html").
    const partialPathCandidates = ['/partials/header.html', 'partials/header.html'];

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

        let usedUrl = null;
        let html = null;

        // Try candidates in order (root-first then relative)
        for (const candidate of partialPathCandidates) {
            const url = resolveUrl(candidate);
            try {
                const resp = await fetch(url, { cache: 'no-cache' });
                if (!resp.ok) {
                    console.info('Header partial not found at', url, 'status', resp.status);
                    continue;
                }
                html = await resp.text();
                usedUrl = url;
                break;
            } catch (err) {
                // network error; try next candidate
                console.info('Fetch error for', url, err);
            }
        }

        // If fetch failed and we're on file://, try XHR as a last resort (some browsers allow it)
        if (!html && window.location.protocol === 'file:') {
            for (const candidate of partialPathCandidates) {
                const url = resolveUrl(candidate);
                try {
                    const xhr = new XMLHttpRequest();
                    xhr.open('GET', url, false); // sync on purpose as a last-resort fallback
                    xhr.send();
                    if (xhr.status === 200 || xhr.status === 0) {
                        html = xhr.responseText;
                        usedUrl = url;
                        break;
                    }
                } catch (err) {
                    console.info('XHR fallback failed for', url, err);
                }
            }
        }

        if (!html) {
            // Provide visible feedback and detailed console info to help debugging.
            console.error('Failed to load header partial. Attempts:', partialPathCandidates.map(resolveUrl));
            container.innerHTML = `<div class="header-load-error" style="padding:12px;border:2px dashed #c00;background:#fff6f6;color:#600;font-size:14px;">No se pudo cargar la cabecera. Intentados: ${partialPathCandidates.map(p=>resolveUrl(p)).join(', ')}. Ejecuta un servidor local (por ejemplo: <code>python -m http.server</code>) o revisa las rutas. Consulta la consola para más detalles.</div>`;
            container.setAttribute('aria-hidden', 'false');
            return;
        }

        // inject html
        container.innerHTML = html;
        container.setAttribute('aria-hidden', 'false');

        const baseForResolution = document.baseURI || window.location.href;

        // Resolve and execute any scripts from the fetched partial
        const scripts = Array.from(container.querySelectorAll('script'));
        for (const s of scripts) {
            const newScript = document.createElement('script');
            if (s.src) {
                // resolve src relative to the partial URL if available, otherwise to document
                const resolved = usedUrl ? new URL(s.getAttribute('src'), usedUrl).href : new URL(s.getAttribute('src'), baseForResolution).href;
                newScript.src = resolved;
                newScript.async = false; // preserve execution order
            } else {
                newScript.textContent = s.textContent;
            }
            document.head.appendChild(newScript);
            s.parentNode && s.parentNode.removeChild(s);
        }

        // Resolve common resource URLs inside the injected partial so they work from pages in subfolders.
        // We'll rewrite src/href attributes to absolute URLs resolved against the document base (site root context)
        const attrsToFix = [
            { selector: 'img', attr: 'src' },
            { selector: 'a', attr: 'href' },
            { selector: 'link', attr: 'href' }
        ];
        for (const { selector, attr } of attrsToFix) {
            const nodes = Array.from(container.querySelectorAll(selector));
            for (const node of nodes) {
                const v = node.getAttribute(attr);
                if (!v) continue;
                // skip absolute URLs and anchors
                if (/^([a-zA-Z][a-zA-Z0-9+.-]*:|\/)/.test(v)) {
                    // already absolute (protocol or starting with '/'), leave as-is
                    continue;
                }
                try {
                    // Resolve relative to document base so paths like "img/JGT1.webp" map to the site's root
                    const abs = new URL(v, baseForResolution).href;
                    node.setAttribute(attr, abs);
                } catch (e) {
                    // ignore resolution errors
                }
            }
        }

        // Dispatch a custom event so other scripts can initialize
        const ev = new CustomEvent('headerLoaded', { bubbles: true, detail: { url: usedUrl } });
        document.dispatchEvent(ev);
    }

    // Run as soon as possible, but after DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadHeader);
    } else {
        loadHeader();
    }
})();
