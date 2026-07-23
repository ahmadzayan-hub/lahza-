/* Beyond Style UAE — landing page behavior
   1. Arabic/English toggle (persisted, updates dir + lang + WhatsApp text)
   2. Prefilled WhatsApp message on every .js-wa link, sourced from
      config/site.config.json (single source of truth for links & copy)
   3. Soft scroll-reveal animation (skipped when reduced motion is set)

   The static hrefs in index.html carry a baked-in Arabic ?text= prefill, so
   the page keeps a working prefilled CTA even if this script or the config
   fails to load; this script swaps the prefill per language.               */

(function () {
  "use strict";

  var html = document.documentElement;

  // Filled from config/site.config.json; null until loaded.
  var waBase = null;
  var waMessages = null;

  function currentLang() {
    return html.getAttribute("lang") === "en" ? "en" : "ar";
  }

  function applyWhatsAppLinks(lang) {
    if (!waBase || !waMessages || !waMessages[lang]) return;
    var href = waBase + "?text=" + encodeURIComponent(waMessages[lang]);
    document.querySelectorAll(".js-wa").forEach(function (a) {
      a.setAttribute("href", href);
    });
  }

  var META = {
    ar: {
      title: "Beyond Style UAE — مجوهرات مخصصة وخط عربي | Personalized Jewelry UAE",
      description:
        "Beyond Style UAE — Personalized jewelry UAE: Arabic calligraphy jewelry Dubai, custom bracelets UAE, baby bracelets, MashaAllah bracelets, personalized necklaces and gift jewelry. اطلبي عبر واتساب مع توصيل داخل الإمارات.",
      ogLocale: "ar_AE"
    },
    en: {
      title: "Beyond Style UAE — Personalized Jewelry & Arabic Calligraphy Accessories",
      description:
        "Personalized name bracelets, Arabic calligraphy necklaces, baby bracelets and gift jewelry in the UAE. Easy WhatsApp ordering and delivery across the Emirates.",
      ogLocale: "en_AE"
    }
  };

  function setMeta(selector, value) {
    var el = document.querySelector(selector);
    if (el) el.setAttribute("content", value);
  }

  function setLang(lang) {
    html.setAttribute("lang", lang);
    html.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    document.title = META[lang].title;
    setMeta('meta[name="description"]', META[lang].description);
    setMeta('meta[property="og:locale"]', META[lang].ogLocale);
    var toggleBtn = document.getElementById("langToggle");
    if (toggleBtn) toggleBtn.setAttribute("aria-pressed", lang === "en" ? "true" : "false");
    applyWhatsAppLinks(lang);
    try {
      localStorage.setItem("bsu-lang", lang);
    } catch (e) {
      /* private mode — ignore */
    }
  }

  // Single source of truth for links and prefilled messages.
  fetch("config/site.config.json")
    .then(function (r) { return r.json(); })
    .then(function (cfg) {
      waBase = cfg.links.whatsapp;
      waMessages = cfg.whatsappMessages;
      applyWhatsAppLinks(currentLang());
    })
    .catch(function () {
      /* offline/file:// — static wa.me hrefs keep working */
    });

  // Restore saved language (Arabic is the default in the markup).
  var saved = null;
  try {
    saved = localStorage.getItem("bsu-lang");
  } catch (e) {
    /* ignore */
  }
  if (saved === "en" || saved === "ar") {
    setLang(saved);
  }

  var toggle = document.getElementById("langToggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      setLang(currentLang() === "ar" ? "en" : "ar");
    });
  }

  // Footer year
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  // Scroll reveal
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var items = document.querySelectorAll(".reveal");
  if (reduced || !("IntersectionObserver" in window)) {
    items.forEach(function (el) {
      el.classList.add("visible");
    });
    return;
  }
  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );
  items.forEach(function (el) {
    io.observe(el);
  });
})();
