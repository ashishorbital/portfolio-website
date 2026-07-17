(function() {
  // Global coordinates for snake game to read
  window.mouseGridX = -100;
  window.mouseGridY = -100;

  function initCursor() {
    const customCursor = document.getElementById("custom-cursor");
    if (!customCursor) return;

    let lastClientX = 0;

    document.addEventListener("mousemove", (e) => {
      lastClientX = e.clientX;
      window.mouseGridX = Math.floor(e.clientX / 10);
      window.mouseGridY = Math.floor(e.clientY / 10);

      // --- Hotspot Alignment ---
      // The hammer image (48×48, head at top-left after flip) has its tip at
      // approximately image-space (6, 6).  After CSS rotate(-15deg) around the
      // pivot (38, 38) the tip lands at:
      //   tipX = 38 + (6-38)*cos(-15°) - (6-38)*sin(-15°)  ≈  -1
      //   tipY = 38 + (6-38)*sin(-15°) + (6-38)*cos(-15°)  ≈ +15
      // To put that visual tip exactly at the real (invisible) cursor we shift
      // the element by the negative of those deltas:
      //   left = clientX - tipX  =  clientX + 1
      //   top  = clientY - tipY  =  clientY - 15
      const TIP_X = -1;   // tip column after rotation, relative to element origin
      const TIP_Y =  15;  // tip row   after rotation, relative to element origin

      // Hide hammer near the scrollbar to avoid sticking
      if (e.clientX >= window.innerWidth - 18) {
        customCursor.style.opacity = "0";
      } else {
        customCursor.style.left = `${e.clientX - TIP_X}px`;
        customCursor.style.top  = `${e.clientY - TIP_Y}px`;
        customCursor.style.opacity = "1";
      }
    });


    document.addEventListener("mouseleave", () => {
      customCursor.style.opacity = "0"; // Hide when leaving window
      window.mouseGridX = -100; // Reset so snake doesn't run from phantom cursor
      window.mouseGridY = -100;
    });

    document.addEventListener("mouseenter", () => {
      customCursor.style.opacity = "1"; // Show when entering window
    });

    window.addEventListener("scroll", () => {
      // Hide hammer during scroll if the last known mouse position was near the scrollbar
      if (lastClientX >= window.innerWidth - 30) {
        customCursor.style.opacity = "0";
      }
    }, { passive: true });

    document.addEventListener("mousedown", () => {
      if (window.playHammerSound) window.playHammerSound();
      customCursor.classList.remove("hitting");
      void customCursor.offsetWidth; // Trigger reflow to restart animation on fast clicks
      customCursor.classList.add("hitting");
    });

    document.addEventListener("animationend", () => {
      customCursor.classList.remove("hitting");
    });
  }

  window.initCursor = initCursor;
})();
