(function () {
  let isInitialized = false;

  function initForm() {
    if (isInitialized) return;
    
    const contactForm = document.getElementById("contact-form");
    const formMsg = document.getElementById("form-msg");

    if (!contactForm || !formMsg) return;

    isInitialized = true;

    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("form-name").value.trim();
      const email = document.getElementById("form-email").value.trim();
      const message = document.getElementById("form-message").value.trim();

      formMsg.className = "form-message";
      formMsg.style.display = "block";

      if (!name || !email || !message) {
        formMsg.textContent =
          "SYSTEM_ERROR: ALL FIELD PACKETS MUST BE POPULATED.";
        formMsg.classList.add("error");
        return;
      }

      formMsg.textContent = "TRANSMITTING...";
      formMsg.classList.remove("error", "success");

      try {
        const formData = new FormData(contactForm);
        const object = Object.fromEntries(formData);
        const json = JSON.stringify(object);

        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: json,
        });

        const result = await response.json();

        if (result.success) {
          formMsg.textContent =
            `TRANSMISSION_SUCCESS: THANK YOU, ${name.toUpperCase()}. MESSAGE SECURELY ROUTED TO ASHISH PS.`;

          formMsg.classList.add("success");
          contactForm.reset();
        } else {
          formMsg.textContent =
            result.message || "TRANSMISSION_FAILED: PLEASE TRY AGAIN.";

          formMsg.classList.add("error");
        }
      } catch (error) {
        formMsg.textContent =
          "NETWORK_ERROR: UNABLE TO ESTABLISH SECURE LINK.";

        formMsg.classList.add("error");
      }
    });
  }

  window.initForm = initForm;
})();