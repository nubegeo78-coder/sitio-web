// ============================================================
// Germán Osorio — sitio personal / press kit
// JS mínimo, sin dependencias: nav móvil, idioma ES/EN,
// scroll-reveal (IntersectionObserver) y año dinámico.
// ============================================================
(function () {
  "use strict";

  var root = document.documentElement;

  /* ---------- Menú fullscreen (estilo Martin Garrix) ---------- */
  var menuToggle = document.querySelector(".menu-toggle");
  var siteMenu = document.getElementById("site-menu");
  var menuClose = document.querySelector(".menu-close");
  var lastFocused = null;

  function openMenu() {
    if (!siteMenu) return;
    lastFocused = document.activeElement;
    siteMenu.classList.add("is-open");
    siteMenu.setAttribute("aria-hidden", "false");
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    if (menuClose) menuClose.focus();
  }
  function closeMenu() {
    if (!siteMenu) return;
    siteMenu.classList.remove("is-open");
    siteMenu.setAttribute("aria-hidden", "true");
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  if (menuToggle && siteMenu) {
    menuToggle.addEventListener("click", function () {
      var isOpen = siteMenu.classList.contains("is-open");
      isOpen ? closeMenu() : openMenu();
    });
    if (menuClose) menuClose.addEventListener("click", closeMenu);
    siteMenu.querySelectorAll(".menu-list a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && siteMenu.classList.contains("is-open")) closeMenu();
    });
  }

  /* ---------- Ticker: animación CSS continua + arrastre con resume suave ---------- */
  var ticker = document.getElementById("ticker");
  var tickerTrack = document.getElementById("tickerTrack");
  if (ticker && tickerTrack) {
    var TICKER_DURATION = 32; // segundos, debe coincidir con @keyframes tickerScroll en style.css
    var isDown = false, startX = 0, baseX = 0;

    function getTranslateX(el) {
      var st = window.getComputedStyle(el);
      var tr = st.transform || st.webkitTransform;
      if (!tr || tr === "none") return 0;
      var m = tr.match(/matrix\(([^)]+)\)/);
      if (m) {
        var parts = m[1].split(",").map(function (v) { return parseFloat(v); });
        return parts[4] || 0;
      }
      return 0;
    }

    var down = function (x) {
      isDown = true;
      ticker.classList.add("is-dragging");
      baseX = getTranslateX(tickerTrack);
      tickerTrack.style.animation = "none";
      tickerTrack.style.transform = "translateX(" + baseX + "px)";
      startX = x;
    };
    var move = function (x) {
      if (!isDown) return;
      var delta = x - startX;
      tickerTrack.style.transform = "translateX(" + (baseX + delta) + "px)";
    };
    var up = function () {
      if (!isDown) return;
      isDown = false;
      ticker.classList.remove("is-dragging");
      var half = tickerTrack.scrollWidth / 2;
      var currentX = getTranslateX(tickerTrack);
      var norm = half ? (currentX % half) : 0;
      if (norm > 0) norm -= half;
      var progress = half ? Math.abs(norm) / half : 0;
      tickerTrack.style.transform = "";
      tickerTrack.style.animation = "tickerScroll " + TICKER_DURATION + "s linear infinite";
      tickerTrack.style.animationDelay = "-" + (progress * TICKER_DURATION) + "s";
    };
    ticker.addEventListener("mousedown", function (e) { down(e.pageX); });
    window.addEventListener("mousemove", function (e) { move(e.pageX); });
    window.addEventListener("mouseup", up);
    ticker.addEventListener("touchstart", function (e) { down(e.touches[0].pageX); }, { passive: true });
    ticker.addEventListener("touchmove", function (e) { move(e.touches[0].pageX); }, { passive: true });
    ticker.addEventListener("touchend", up);
  }

  /* ---------- Idioma ES/EN ---------- */
  var langButtons = document.querySelectorAll("[data-lang-btn]");
  function setLang(lang) {
    root.setAttribute("data-lang", lang);
    root.setAttribute("lang", lang);
    langButtons.forEach(function (btn) {
      btn.setAttribute("aria-pressed", btn.getAttribute("data-lang-btn") === lang ? "true" : "false");
    });
    try { localStorage.setItem("go-lang", lang); } catch (e) {}
  }
  var savedLang = "es";
  try { savedLang = localStorage.getItem("go-lang") || "es"; } catch (e) {}
  setLang(savedLang);
  langButtons.forEach(function (btn) {
    btn.addEventListener("click", function () { setLang(btn.getAttribute("data-lang-btn")); });
  });

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Header: sombra al hacer scroll ---------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.style.boxShadow = window.scrollY > 8 ? "0 8px 24px rgba(0,0,0,.35)" : "none";
    };
    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Año dinámico ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Formulario de contacto (envío directo vía FormSubmit) ---------- */
  var form = document.querySelector(".contact-form");
  if (form) {
    var statusEl = document.getElementById("formStatus");
    var statusMsg = {
      sending: { es: "Enviando…", en: "Sending…" },
      ok: { es: "¡Gracias! Tu mensaje fue enviado.", en: "Thanks! Your message was sent." },
      err: { es: "No se pudo enviar. Probá de nuevo o escribí a info@germanosorio.com.", en: "Couldn't send it. Try again or email info@germanosorio.com." }
    };
    function showStatus(key) {
      if (!statusEl) return;
      var lang = root.getAttribute("data-lang") === "en" ? "en" : "es";
      statusEl.textContent = statusMsg[key][lang];
      statusEl.classList.remove("is-ok", "is-err");
      if (key === "ok") statusEl.classList.add("is-ok");
      if (key === "err") statusEl.classList.add("is-err");
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      // Honeypot anti-spam: si el campo oculto viene relleno, es un bot, no enviamos.
      var honey = form.querySelector('[name="_honey"]');
      if (honey && honey.value) return;

      var submitBtns = form.querySelectorAll('button[type="submit"]');
      submitBtns.forEach(function (b) { b.disabled = true; });
      showStatus("sending");

      var data = {
        name: form.querySelector("#name").value,
        email: form.querySelector("#email").value,
        message: form.querySelector("#message").value,
        _subject: "Contacto desde la web — germanosorio.com"
      };

      fetch("https://formsubmit.co/ajax/info@germanosorio.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(data)
      })
        .then(function (res) {
          if (!res.ok) throw new Error("bad response");
          showStatus("ok");
          form.reset();
        })
        .catch(function () {
          showStatus("err");
        })
        .then(function () {
          submitBtns.forEach(function (b) { b.disabled = false; });
        });
    });
  }
})();
