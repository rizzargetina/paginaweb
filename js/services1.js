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
  // Video fallback handling removed — managed via markup/CSS or server-side fallbacks
});
