/* ==========================================================================
   Shuvam Overseas Employment PVT.LTD - Form Validation (About & Contact)
   --------------------------------------------------------------------------
   Client-side validation with inline errors. No backend yet:
   - Validate on blur (feedback as the user finishes each field).
   - Re-validate the whole form on submit.
   - Honeypot field: hidden from humans, filled by bots. If it has content,
     the submission is silently ignored (the bot never learns it failed).
   - Time check: a real human takes more than ~2 seconds to fill a message;
     instant submissions are treated as automated traffic.
   - On a valid submit, show a loading spinner briefly, then a success state.
     Ready to be plugged into Formspree (or similar) by uncommenting the action.
   ========================================================================== */

(function () {
  "use strict";

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var MIN_FILL_TIME = 2000;

  function validateField(field) {
    var name = field.name;
    var value = field.value.trim();
    var errorEl = document.querySelector('[data-error-for="' + field.id + '"]');
    var message = "";

    if (!value) {
      message = "Please fill in this field.";
    } else if (name === "email" && !EMAIL_RE.test(value)) {
      message = "Please enter a valid email address.";
    } else if (name === "message" && value.length < 10) {
      message = "Please write a message of at least 10 characters.";
    }

    if (errorEl) {
      errorEl.textContent = message;
      field.setAttribute("aria-invalid", message ? "true" : "false");
    }
    return !message;
  }

  function looksLikeBot(form) {
    var honeypot = form.querySelector(".form__hp input");
    if (honeypot && honeypot.value && honeypot.value.trim() !== "") return true;

    var started = form.getAttribute("data-start-ts");
    if (started && Date.now() - Number(started) < MIN_FILL_TIME) return true;

    return false;
  }

  function initForm(form) {
    var fields = form.querySelectorAll("[required]");
    var status = form.querySelector(".form__status");
    var submitBtn = form.querySelector("button[type='submit']");
    var started = false;

    // Mark when a human first starts interacting with the form.
    ["focusin", "input"].forEach(function (type) {
      form.addEventListener(type, function () {
        if (!started) {
          started = true;
          form.setAttribute("data-start-ts", String(Date.now()));
        }
      });
    });

    // Validate on blur for instant feedback
    fields.forEach(function (field) {
      field.addEventListener("blur", function () {
        validateField(field);
      });
      field.addEventListener("input", function () {
        // Clear the error while the user fixes it
        var errorEl = document.querySelector('[data-error-for="' + field.id + '"]');
        if (errorEl) {
          errorEl.textContent = "";
          field.removeAttribute("aria-invalid");
        }
      });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      // Silently drop automated submissions.
      if (looksLikeBot(form)) return;

      var allValid = true;
      fields.forEach(function (field) {
        if (!validateField(field)) allValid = false;
      });

      if (!allValid) {
        // Focus the first invalid field
        var firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
        showStatus(status, "Please correct the highlighted fields.", true);
        return;
      }

      // Loading state: show the spinner for a beat, then confirm.
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add("is-loading");
      }

      window.setTimeout(function () {
        if (submitBtn) {
          submitBtn.classList.remove("is-loading");
          submitBtn.textContent = "Message sent";
        }
        form.reset();
        form.removeAttribute("data-start-ts");
        started = false;
        showStatus(status, "Thank you - your message has been received. We will be in touch shortly.", false);
      }, 900);

      /*
       * Go live later - plug in a form service (Formspree / EmailJS):
       *   1. Add  action="https://formspree.io/f/YOUR_FORM_ID"  method="POST"
       *      to the <form> tag in the HTML.
       *   2. Replace the simulated delay/success above with the real request.
       *   3. Keep the honeypot + time checks: they cost nothing and stop bots.
       */
    });
  }

  function showStatus(el, text, isError) {
    if (!el) return;
    el.textContent = text;
    el.classList.toggle("is-visible", true);
    el.classList.toggle("form__status--error", !!isError);
    el.classList.toggle("form__status--success", !isError);
  }

  document.querySelectorAll("[data-form]").forEach(initForm);
})();
