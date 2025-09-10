document.addEventListener('DOMContentLoaded', function() {

  document.body.classList.remove('preload');

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
});
