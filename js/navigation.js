(function() {
  function initNavigation() {
    // 1. Mobile Responsive Navigation Toggle
    const menuToggle = document.getElementById("menu-toggle");
    const navLinks = document.getElementById("nav-links");
    if (!menuToggle || !navLinks) return;

    const navLinksList = navLinks.querySelectorAll("a");

    menuToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = navLinks.classList.toggle("mobile-open");
      menuToggle.setAttribute("aria-expanded", isOpen);
      menuToggle.textContent = isOpen ? "CLOSE" : "MENU";
      if (window.playClickSound) window.playClickSound();
    });

    // Close mobile nav when clicking a link
    navLinksList.forEach(link => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("mobile-open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.textContent = "MENU";
        if (window.playClickSound) window.playClickSound();
      });
    });

    // Close mobile nav when clicking outside
    document.addEventListener("click", (e) => {
      if (!navLinks.contains(e.target) && e.target !== menuToggle) {
        navLinks.classList.remove("mobile-open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.textContent = "MENU";
      }
    });

    // 2. Scroll Spy Navigation Highlight
    const sections = document.querySelectorAll("section[id]");
    
    window.addEventListener("scroll", () => {
      let current = "";
      const scrollPosition = window.scrollY + 160; // offset for nav-wrapper height

      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          current = section.getAttribute("id");
        }
      });

      navLinksList.forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${current}`) {
          link.classList.add("active");
        }
      });
    }, { passive: true });
  }

  window.initNavigation = initNavigation;
})();
