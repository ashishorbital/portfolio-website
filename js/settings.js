(function() {
  function initSettings() {
    // 1. Mobile Settings Panel Toggle
    const settingsTrigger = document.getElementById("settings-trigger");
    const settingsPanel   = document.getElementById("settings-panel");

    if (settingsTrigger && settingsPanel) {
      settingsTrigger.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = settingsPanel.classList.toggle("open");
        settingsTrigger.querySelector("span").textContent = isOpen ? "\u2715 CLOSE" : "\u2699 SYS";
      });

      document.addEventListener("click", (e) => {
        if (!settingsTrigger.contains(e.target) && !settingsPanel.contains(e.target)) {
          settingsPanel.classList.remove("open");
          settingsTrigger.querySelector("span").textContent = "\u2699 SYS";
        }
      });
    }

    // 2. CRT Retrowave Scanlines Toggler
    const crtToggle = document.getElementById("crt-toggle");
    const isCrtActive = localStorage.getItem("crt-active") === "true";
    if (isCrtActive) {
      document.body.classList.add("crt-active");
    }
    if (crtToggle) {
      crtToggle.addEventListener("click", () => {
        const isActive = document.body.classList.toggle("crt-active");
        localStorage.setItem("crt-active", isActive);
      });
    }

    // 3. Retro Dark Mode Toggler
    const darkToggle = document.getElementById("dark-toggle");
    const isDarkMode = localStorage.getItem("dark-mode") === "true";
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
    }
    if (darkToggle) {
      darkToggle.addEventListener("click", () => {
        const isActive = document.body.classList.toggle("dark-mode");
        localStorage.setItem("dark-mode", isActive);
      });
    }

    // 4. Retro Sound Effects Synthesizer Toggler
    const soundToggle = document.getElementById("sound-toggle");
    const soundEnabledOnBoot = window.isSoundEnabled();

    if (soundEnabledOnBoot) {
      document.body.classList.add("sound-on");
      if (soundToggle) {
        soundToggle.querySelector("span").textContent = "SOUND ON";
      }
    }

    if (soundToggle) {
      soundToggle.addEventListener("click", () => {
        const soundEnabled = window.toggleSound();
        document.body.classList.toggle("sound-on", soundEnabled);
        soundToggle.querySelector("span").textContent = soundEnabled ? "SOUND ON" : "SOUND OFF";
        if (soundEnabled) {
          window.initAudio();
          window.playChimeSound();
        }
      });
    }
  }

  window.initSettings = initSettings;
})();
