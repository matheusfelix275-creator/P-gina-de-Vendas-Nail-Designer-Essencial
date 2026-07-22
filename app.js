import "./config.js";

(function () {
  "use strict";

  const config = window.SITE_CONFIG || {};
  const trackingKeys = [
    "src",
    "sck",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "s1",
    "s2",
    "s3"
  ];
  const notice = document.querySelector("[data-site-notice]");
  let noticeTimer;

  function showNotice(message) {
    if (!notice) return;
    notice.textContent = message;
    notice.removeAttribute("hidden");
    window.clearTimeout(noticeTimer);
    noticeTimer = window.setTimeout(() => notice.setAttribute("hidden", ""), 4200);
  }

  function validCheckoutUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === "https:" && (
        url.hostname === "kiwify.com.br" || url.hostname.endsWith(".kiwify.com.br")
      );
    } catch (_) {
      return false;
    }
  }

  function buildCheckoutUrl() {
    if (!validCheckoutUrl(config.checkoutUrl)) return null;
    const target = new URL(config.checkoutUrl);
    const current = new URLSearchParams(window.location.search);
    trackingKeys.forEach((key) => {
      if (current.has(key)) target.searchParams.set(key, current.get(key));
    });
    return target.toString();
  }

  document.querySelectorAll("[data-checkout]").forEach((link) => {
    const checkoutUrl = buildCheckoutUrl();
    if (checkoutUrl) link.href = checkoutUrl;

    link.addEventListener("click", (event) => {
      const target = buildCheckoutUrl();
      if (!target) {
        event.preventDefault();
        showNotice("O checkout ainda não foi configurado. Preencha checkoutUrl no arquivo config.js.");
        return;
      }
      link.href = target;
    });
  });

  const producerName = String(config.producerName || "").trim() || "Identificação do produtor pendente";
  const supportEmail = String(config.supportEmail || "").trim() || "suporte a definir";

  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });
  document.querySelectorAll("[data-producer-name]").forEach((node) => {
    node.textContent = producerName;
  });
  document.querySelectorAll("[data-support-email]").forEach((node) => {
    node.textContent = supportEmail;
  });
  document.querySelectorAll("[data-support-link]").forEach((link) => {
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail)) {
      link.href = `mailto:${supportEmail}`;
    } else {
      link.removeAttribute("href");
    }
  });

  document.querySelectorAll(".faq__question").forEach((btn) => {
    btn.addEventListener("click", () => {
      const expanded = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!expanded));
      const answerId = btn.getAttribute("aria-controls");
      if (answerId) {
        const answer = document.getElementById(answerId);
        if (answer) {
          if (expanded) {
            answer.setAttribute("hidden", "");
          } else {
            answer.removeAttribute("hidden");
          }
        }
      }
    });
  });

  const lightboxEl = document.getElementById("collection-lightbox");
  const lightboxTitle = document.getElementById("lightbox-title");
  const lightboxImage = document.getElementById("lightbox-image");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const lightboxCounter = document.querySelector(".lightbox__counter");
  const closeBtn = document.querySelector(".lightbox__close");
  const prevBtn = document.querySelector(".lightbox__prev");
  const nextBtn = document.querySelector(".lightbox__next");

  if (lightboxEl && lightboxTitle && lightboxImage) {
    const collections = Array.from(document.querySelectorAll(".collection[data-title]"));
    let currentIndex = -1;
    let previousFocus = null;

    function openLightbox(index) {
      if (index < 0 || index >= collections.length) return;
      currentIndex = index;
      const col = collections[currentIndex];
      const title = col.getAttribute("data-title") || "";
      const imageSrc = col.getAttribute("data-image") || "";
      const imgEl = col.querySelector("img");
      const altText = imgEl ? imgEl.getAttribute("alt") || "" : "";

      lightboxTitle.textContent = title;
      lightboxImage.setAttribute("src", imageSrc);
      lightboxImage.setAttribute("alt", altText);
      if (lightboxCaption) {
        lightboxCaption.textContent = title + " \u2014 12 designs";
      }
      if (lightboxCounter && collections.length > 0) {
        lightboxCounter.textContent = (currentIndex + 1) + " de " + collections.length;
      }
      lightboxEl.removeAttribute("hidden");
      document.body.style.overflow = "hidden";
      if (closeBtn) closeBtn.focus();
    }

    function closeLightbox() {
      lightboxEl.setAttribute("hidden", "");
      document.body.style.overflow = "";
      if (previousFocus) {
        previousFocus.focus();
        previousFocus = null;
      }
      currentIndex = -1;
    }

    function prevCollection() {
      if (currentIndex > 0) openLightbox(currentIndex - 1);
      else openLightbox(collections.length - 1);
    }

    function nextCollection() {
      if (currentIndex >= 0 && currentIndex < collections.length - 1) openLightbox(currentIndex + 1);
      else openLightbox(0);
    }

    document.querySelectorAll(".collection__expand").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const article = e.currentTarget.closest(".collection");
        if (!article) return;
        const idx = collections.indexOf(article);
        if (idx >= 0) {
          previousFocus = e.currentTarget;
          openLightbox(idx);
        }
      });
    });

    if (closeBtn) closeBtn.addEventListener("click", closeLightbox);

    if (prevBtn) prevBtn.addEventListener("click", prevCollection);
    if (nextBtn) nextBtn.addEventListener("click", nextCollection);

    lightboxEl.addEventListener("click", (e) => {
      if (e.target === lightboxEl) closeLightbox();
    });

    document.addEventListener("keydown", (e) => {
      if (lightboxEl.hasAttribute("hidden")) return;
      if (e.key === "Escape") {
        e.preventDefault();
        closeLightbox();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevCollection();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        nextCollection();
      }
    });
  }

})();
