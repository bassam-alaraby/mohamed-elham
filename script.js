(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ============================================
     ANIMATED PARTICLES BACKGROUND
     ============================================ */
  var canvas = document.getElementById("particlesCanvas");
  if (canvas && !prefersReducedMotion) {
    var ctx = canvas.getContext("2d");
    var particles = [];
    var isMobile = window.innerWidth < 640;
    var particleCount = isMobile ? 30 : 50;

    function resizeCanvas() {
      var hero = document.querySelector(".hero");
      if (!hero) return;
      var rect = hero.getBoundingClientRect();
      var dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function createParticles() {
      var hero = document.querySelector(".hero");
      var rect = hero ? hero.getBoundingClientRect() : { width: canvas.clientWidth, height: canvas.clientHeight };
      particles = [];
      for (var i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          r: Math.random() * 2.2 + 0.6,
          speedY: Math.random() * 0.35 + 0.15,
          speedX: (Math.random() - 0.5) * 0.3,
          opacity: Math.random() * 0.45 + 0.15,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    function drawParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var hero = document.querySelector(".hero");
      if (!hero) return;
      var rect = hero.getBoundingClientRect();
      var h = rect.height;
      var w = rect.width;

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.y -= p.speedY;
        p.x += Math.sin(p.phase + performance.now() * 0.0004) * p.speedX;

        if (p.y < -10) {
          p.y = h + 10;
          p.x = Math.random() * w;
        }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;

        var twinkle = 0.7 + 0.3 * Math.sin(performance.now() * 0.002 + p.phase);
        var alpha = p.opacity * twinkle;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(212, 184, 120, " + alpha + ")";
        ctx.fill();

        if (p.r > 1.5 && twinkle > 0.85) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(212, 184, 120, " + alpha * 0.13 + ")";
          ctx.fill();
        }
      }

      if (!prefersReducedMotion) {
        requestAnimationFrame(drawParticles);
      }
    }

    resizeCanvas();
    createParticles();
    drawParticles();

    window.addEventListener("resize", function () {
      resizeCanvas();
      createParticles();
    });
  }

  /* ============================================
     SCROLL-REVEAL
     ============================================ */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && revealEls.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry, i) {
          if (entry.isIntersecting) {
            var idx = Array.prototype.indexOf.call(revealEls, entry.target);
            setTimeout(function () {
              entry.target.classList.add("is-visible");
            }, idx * 90);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ============================================
     ENVELOPE OPEN INTERACTION
     ============================================ */
  var envelope = document.getElementById("envelope");
  var envFlap = document.getElementById("envFlap");
  var sealEl = document.getElementById("sealEl");
  var tapHint = document.getElementById("tapHint");
  var autoOpenTimer;
  var isOpen = false;

  function spawnRipple(x, y) {
    if (!sealEl) return;
    var ripple = document.createElement("span");
    ripple.className = "seal-ripple";
    ripple.style.left = x + "px";
    ripple.style.top = y + "px";
    sealEl.appendChild(ripple);
    ripple.addEventListener("animationend", function () { ripple.remove(); });
  }

  function openEnvelope() {
    if (!envelope || isOpen) return;
    isOpen = true;
    envelope.classList.add("is-open");
    if (envFlap) envFlap.setAttribute("aria-expanded", "true");
    if (tapHint) tapHint.style.opacity = "0";
    clearTimeout(autoOpenTimer);

    if (sealEl && !prefersReducedMotion) {
      var rect = sealEl.getBoundingClientRect();
      var cx = rect.width / 2;
      var cy = rect.height / 2;
      spawnRipple(cx, cy);
      setTimeout(function () { spawnRipple(cx - 8, cy - 6); }, 120);
      setTimeout(function () { spawnRipple(cx + 8, cy - 4); }, 200);
    }
  }

  if (envFlap) {
    envFlap.addEventListener("click", function (e) {
      openEnvelope();
      if (sealEl && !prefersReducedMotion) {
        var sealRect = sealEl.getBoundingClientRect();
        var relX = e.clientX - sealRect.left;
        var relY = e.clientY - sealRect.top;
        spawnRipple(relX, relY);
      }
    });
  }

  if (sealEl) {
    sealEl.addEventListener("click", function (e) {
      e.stopPropagation();
      openEnvelope();
      var sealRect = sealEl.getBoundingClientRect();
      var relX = e.clientX - sealRect.left;
      var relY = e.clientY - sealRect.top;
      spawnRipple(relX, relY);
    });
  }

  if (envelope && !prefersReducedMotion) {
    autoOpenTimer = setTimeout(openEnvelope, 6000);
  } else if (envelope && prefersReducedMotion) {
    openEnvelope();
  }

  /* ============================================
     SCROLL CUE
     ============================================ */
  var scrollCue = document.getElementById("scrollCue");
  if (scrollCue) {
    scrollCue.addEventListener("click", function () {
      var detailsSection = document.getElementById("details");
      if (detailsSection) {
        detailsSection.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
      }
    });
  }

  /* ============================================
     ADD TO CALENDAR
     ============================================ */
  var calendarBtn = document.getElementById("calendarBtn");
  if (calendarBtn) {
    calendarBtn.addEventListener("click", function () {
      var params = new URLSearchParams({
        action: "TEMPLATE",
        text: "Mohamed & Elham's Wedding",
        dates: "20260722T190000Z/20260722T220000Z",
        details: "Join us as we celebrate the wedding of Mohamed & Elham.",
        location: "Paris Plaza, Shebin El-Kom, Monufia, Egypt",
      });
      window.open(
        "https://calendar.google.com/calendar/render?" + params.toString(),
        "_blank",
        "noopener,noreferrer"
      );
    });
  }

  /* ============================================
     COUNTDOWN
     ============================================ */
  var target = new Date("2026-07-22T19:00:00Z").getTime();

  var elDays = document.getElementById("cdDays");
  var elHours = document.getElementById("cdHours");
  var elMins = document.getElementById("cdMins");
  var elSecs = document.getElementById("cdSecs");

  function pad(n) { return String(n).padStart(2, "0"); }

  var timer;
  function tick() {
    var now = Date.now();
    var diff = target - now;

    if (diff <= 0) {
      if (elDays) elDays.textContent = "00";
      if (elHours) elHours.textContent = "00";
      if (elMins) elMins.textContent = "00";
      if (elSecs) elSecs.textContent = "00";
      clearInterval(timer);
      return;
    }

    var days = Math.floor(diff / 86400000);
    var hours = Math.floor((diff % 86400000) / 3600000);
    var mins = Math.floor((diff % 3600000) / 60000);
    var secs = Math.floor((diff % 60000) / 1000);

    if (elDays) elDays.textContent = pad(days);
    if (elHours) elHours.textContent = pad(hours);
    if (elMins) elMins.textContent = pad(mins);
    if (elSecs) elSecs.textContent = pad(secs);
  }

  if (elDays) {
    tick();
    timer = setInterval(tick, 1000);
  }
})();
