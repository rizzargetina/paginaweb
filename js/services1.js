document.addEventListener('DOMContentLoaded', () => {
  // ===== Índice: smooth scroll + scrollspy =====
  (function setupServiceIndex() {
    const indexLinks = Array.from(document.querySelectorAll('#indice-servicios .index-grid .index-item'));
    if (!indexLinks.length) return;

    // Build mapping from link to target section
    const entries = indexLinks.map((a) => {
      const sel = a.getAttribute('data-target') || a.getAttribute('href');
      try {
        const id = (sel || '').replace(/^.*#/, '#');
        const el = document.querySelector(id);
        return { link: a, id, target: el };
      } catch (e) {
        return { link: a, id: null, target: null };
      }
    }).filter(e => e.target);

    // Click -> smooth scroll
    indexLinks.forEach((a) => {
      a.addEventListener('click', (ev) => {
        const href = a.getAttribute('href') || '';
        if (!href.startsWith('#')) return; // let normal nav for external
        ev.preventDefault();
        const targetId = href.replace(/^.*#/, '#');
        const target = document.querySelector(targetId);
        if (target && 'scrollIntoView' in target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (target) {
          window.location.hash = targetId;
        }
      });
    });

    // Scrollspy via IntersectionObserver
    const byId = new Map(entries.map(e => [e.id, e.link]));
    const opts = { root: null, rootMargin: '0px 0px -40% 0px', threshold: [0, 0.3, 0.5, 0.7, 1] };
    let activeId = null;

    const io = new IntersectionObserver((changes) => {
      // Pick the most visible section
      let best = { id: null, ratio: 0 };
      changes.forEach((c) => {
        const id = '#' + (c.target.getAttribute('id') || '');
        const ratio = c.intersectionRatio || 0;
        if (ratio > best.ratio) best = { id, ratio };
      });
      if (best.id && best.id !== activeId) {
        activeId = best.id;
        // Update classes
        indexLinks.forEach(a => a.classList.remove('active'));
        const link = byId.get(activeId);
        if (link) link.classList.add('active');
      }
    }, opts);

    entries.forEach(({ target }) => io.observe(target));
  })();

  // ===== Video: controls + viewport-aware play/pause =====
  (function setupHeroVideo() {
    const video = document.getElementById('tras');
    const btnPlay = document.getElementById('btn-toggle-play');
    const btnMute = document.getElementById('btn-toggle-mute');
    if (!video) return;

    // Helpers to update buttons state
    function syncPlayButton() {
      const isPaused = video.paused;
      if (btnPlay) {
        btnPlay.textContent = isPaused ? '▶' : '❚❚';
        btnPlay.setAttribute('aria-pressed', String(!isPaused));
        btnPlay.setAttribute('aria-label', isPaused ? 'Reproducir video' : 'Pausar video');
      }
    }
    function syncMuteButton() {
      if (btnMute) {
        btnMute.textContent = video.muted ? '🔇' : '🔊';
        btnMute.setAttribute('aria-pressed', String(!video.muted));
        btnMute.setAttribute('aria-label', video.muted ? 'Activar sonido' : 'Silenciar sonido');
      }
    }

    // Try autoplay
    const tryAutoplay = () => {
      const p = video.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          // Autoplay blocked; leave paused until user interacts
          syncPlayButton();
        });
      }
    };

    // Init states
    video.muted = true;
    syncPlayButton();
    syncMuteButton();
    tryAutoplay();

    // Button handlers
    if (btnPlay) {
      btnPlay.addEventListener('click', () => {
        if (video.paused) {
          video.play();
        } else {
          video.pause();
        }
        syncPlayButton();
      });
    }
    if (btnMute) {
      btnMute.addEventListener('click', () => {
        video.muted = !video.muted;
        syncMuteButton();
      });
    }

    // Pause video when not sufficiently visible
    let autoPausedByIO = false;
    const vio = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target !== video) return;
        const visible = entry.intersectionRatio >= 0.2;
        if (!visible && !video.paused) {
          video.pause();
          autoPausedByIO = true;
          syncPlayButton();
        } else if (visible && autoPausedByIO && video.paused) {
          // Resume only if it was auto-paused by IO
          tryAutoplay();
          autoPausedByIO = false;
          syncPlayButton();
        }
      });
    }, { threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] });

    vio.observe(video);

    // Pause when tab not visible (saves CPU/bandwidth)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (!video.paused) {
          video.pause();
          autoPausedByIO = true;
          syncPlayButton();
        }
      } else if (autoPausedByIO && video.paused) {
        tryAutoplay();
        autoPausedByIO = false;
        syncPlayButton();
      }
    });
  })();
});
