// JS extracted from services1.html to support strict CSP (no inline scripts)
document.addEventListener('DOMContentLoaded', function() {
  // remove preload class
  document.body.classList.remove('preload');

  // intersection observer for fade-in sections
  const faders = document.querySelectorAll('.fade-in-section');
  const appearOptions = { threshold: 0.15 };
  const appearOnScroll = new IntersectionObserver(function(entries, observer) {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, appearOptions);
  faders.forEach(fader => appearOnScroll.observe(fader));

  // Video fallback handling
  const video = document.getElementById('tras');
  const container = document.getElementById('tras-container');
  if (video && container) {
    const showFallback = () => {
      const poster = video.getAttribute('poster') || 'img/chat.webp';
      const fallback = document.createElement('div');
      fallback.className = 'video-fallback';
      fallback.innerHTML = `\n        <img src="${poster}" alt="Imagen representativa del servicio" class="section-image small-section-image">\n        <p><a href="img/video1.webm">Ver o descargar el video</a></p>\n      `;
      container.replaceChild(fallback, video);
    };

    video.addEventListener('error', function(e) {
      console.warn('Video load error', e);
      showFallback();
    });

    const metaTimeout = setTimeout(() => {
      if (video.readyState < 1) {
        console.warn('Video metadata did not load, showing fallback');
        showFallback();
      }
    }, 3000);

    video.addEventListener('loadedmetadata', function() { clearTimeout(metaTimeout); });
  }
});
