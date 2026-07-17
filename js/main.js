document.addEventListener("DOMContentLoaded", () => {
  
  // Force browser to load the page at the top (override scroll restoration & hash jumps)
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  window.addEventListener("load", () => {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 0);
  });

  // Initialize all modular components
  if (window.initSettings) window.initSettings();
  if (window.initNavigation) window.initNavigation();
  if (window.initForm) window.initForm();
  if (window.initTerminal) window.initTerminal();
  if (window.initCursor) window.initCursor();
  if (window.initSnake) window.initSnake();

  // Hero Typewriter Animation
  (function initTypewriter() {
    const span = document.querySelector('.hero-text h1 span');
    if (!span) return;

    const fullText = span.textContent.trim(); // "ASHISH"
    span.textContent = '';                    // clear immediately

    let i = 0;
    const speed = 160; // ms per character

    function typeNext() {
      if (i < fullText.length) {
        span.textContent += fullText[i];
        i++;
        setTimeout(typeNext, speed);
      } else {
        // Typing done — swap to retroGlow, hide caret
        span.classList.add('typing-done');
      }
    }

    setTimeout(typeNext, 350); // short pause before typing starts
  })();

  // Play subtle 8-bit switch sound on button/link clicks
  document.querySelectorAll("a, button, input[type='submit'], .floppy-disk").forEach(el => {
    el.addEventListener("click", () => {
      if (el.id !== "sound-toggle" && el.id !== "terminal-input" && !el.classList.contains("floppy-disk")) {
        if (window.playClickSound) window.playClickSound();
      }
    });
  });

});
