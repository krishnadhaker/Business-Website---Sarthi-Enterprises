/* Sarthi Enterprises — main.js
   Handles: language switching (EN/HI), mobile nav, floating WhatsApp link,
   contact form (client-side demo handling), gallery filter + lightbox,
   scroll-reveal animations, sticky header state. */

(function () {
  "use strict";

  var STORAGE_KEY = "sarthi-lang";
  var WHATSAPP_NUMBER = "919636158680";

  /* ---------------- Language ---------------- */
  function getLang() {
    return localStorage.getItem(STORAGE_KEY) || "en";
  }

  function applyLang(lang) {
    document.documentElement.setAttribute("lang", lang === "hi" ? "hi" : "en");
    document.body.setAttribute("data-lang", lang);

    var dict = window.SARTHI_I18N || {};
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      var entry = dict[key];
      if (entry && entry[lang]) {
        el.textContent = entry[lang];
      }
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-ph");
      var entry = dict[key];
      if (entry && entry[lang]) {
        el.setAttribute("placeholder", entry[lang]);
      }
    });
    document.querySelectorAll(".lang-switch button").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-lang") === lang);
    });
    updateWhatsappLink();
  }

  function setLang(lang) {
    localStorage.setItem(STORAGE_KEY, lang);
    applyLang(lang);
  }

  /* ---------------- Mobile nav ---------------- */
  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".main-nav");
    var scrim = document.querySelector(".nav-scrim");
    if (!toggle || !nav) return;

    function close() {
      nav.classList.remove("open");
      scrim && scrim.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
    function open() {
      nav.classList.add("open");
      scrim && scrim.classList.add("open");
      toggle.setAttribute("aria-expanded", "true");
    }
    toggle.addEventListener("click", function () {
      nav.classList.contains("open") ? close() : open();
    });
    scrim && scrim.addEventListener("click", close);
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", close);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
  }

  /* ---------------- WhatsApp floating link ---------------- */
  function updateWhatsappLink() {
    var lang = getLang();
    var msg =
      lang === "hi"
        ? "नमस्ते सारथी एंटरप्राइजेज, मुझे आपके उत्पादों/सेवाओं के बारे में जानकारी चाहिए।"
        : "Hello Sarthi Enterprises, I would like to enquire about your products/services.";
    var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(msg);
    document.querySelectorAll(".js-whatsapp-link").forEach(function (el) {
      el.setAttribute("href", url);
    });
  }

  /* ---------------- Contact form ----------------
     Sends every enquiry straight to the owner's inbox via Web3Forms
     (free, no backend/server needed). Setup: get a free access key at
     https://web3forms.com by entering an email — no account required —
     and paste it into the hidden "access_key" input in contact.html.
     Until a real key is added, submissions fall back to a mailto link
     so nothing is silently lost. */
  function initForm() {
    var form = document.querySelector("#quote-form");
    if (!form) return;
    var success = document.querySelector("#form-success");
    var submitBtn = form.querySelector("button[type=submit]");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var accessKeyInput = form.querySelector("input[name=access_key]");
      var accessKey = accessKeyInput ? accessKeyInput.value.trim() : "";
      var placeholderKey = "55fad6a2-9c43-4927-87c5-23b420f41631";

      if (!accessKey || accessKey === placeholderKey) {
        // No key configured yet — open a pre-filled email as a working fallback.
        var d = Object.fromEntries(new FormData(form).entries());
        var body =
          "Name: " + (d.name || "") + "%0D%0A" +
          "Company: " + (d.company || "") + "%0D%0A" +
          "Phone: " + (d.phone || "") + "%0D%0A" +
          "Email: " + (d.email || "") + "%0D%0A" +
          "Requirement Type: " + (d.reqtype || "") + "%0D%0A" +
          "Material/Product: " + (d.material || "") + "%0D%0A" +
          "Quantity: " + (d.qty || "") + "%0D%0A" +
          "Message: " + (d.message || "");
        window.location.href = "mailto:mukesh.dhaker25@gmail.com?subject=Website%20Enquiry&body=" + body;
        return;
      }

      var originalLabel = submitBtn ? submitBtn.textContent : "";
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Sending…"; }

      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form).entries()))
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data.success) {
            if (success) {
              success.classList.add("is-visible");
              success.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            form.reset();
          } else {
            alert("Something went wrong sending your enquiry. Please call or WhatsApp us directly.");
          }
        })
        .catch(function () {
          alert("Could not send right now. Please call or WhatsApp us directly.");
        })
        .finally(function () {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalLabel; }
        });
    });
  }

  /* ---------------- Gallery filter + lightbox ---------------- */
  function initGallery() {
    var filterBtns = document.querySelectorAll(".gallery-filters button");
    var items = document.querySelectorAll(".gallery-item");
    filterBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterBtns.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        var cat = btn.getAttribute("data-filter");
        items.forEach(function (item) {
          var show = cat === "all" || item.getAttribute("data-cat") === cat;
          item.style.display = show ? "" : "none";
        });
      });
    });

    var lightbox = document.querySelector("#lightbox");
    if (!lightbox) return;
    var lbImg = lightbox.querySelector("img");
    var closeBtn = lightbox.querySelector(".lightbox-close");
    items.forEach(function (item) {
      item.addEventListener("click", function () {
        var img = item.querySelector("img");
        if (!img) return;
        lbImg.setAttribute("src", img.getAttribute("src"));
        lbImg.setAttribute("alt", img.getAttribute("alt") || "");
        lightbox.classList.add("open");
      });
    });
    function closeLb() { lightbox.classList.remove("open"); }
    closeBtn && closeBtn.addEventListener("click", closeLb);
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLb();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeLb();
    });
  }

  /* ---------------- Scroll reveal ---------------- */
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || els.length === 0) {
      els.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------------- Header scrolled state ---------------- */
  function initHeaderState() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    function update() {
      header.classList.toggle("scrolled", window.scrollY > 8);
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  /* ---------------- Year in footer ---------------- */
  function initYear() {
    document.querySelectorAll(".js-year").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  /* ---------------- Init ---------------- */
  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initForm();
    initGallery();
    initReveal();
    initHeaderState();
    initYear();
    applyLang(getLang());

    document.querySelectorAll(".lang-switch button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setLang(btn.getAttribute("data-lang"));
      });
    });
  });
})();
