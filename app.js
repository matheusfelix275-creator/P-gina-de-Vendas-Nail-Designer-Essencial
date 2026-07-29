import "./config.js";

(function () {
  "use strict";

  const config = window.SITE_CONFIG || {};

  if (!config.checkoutUrl || config.checkoutUrl === "#") {
    console.error("ERRO: A URL de checkout em config.js precisa ser preenchida antes do build de produ\u00e7\u00e3o.");
  }
  const STORAGE_KEY = "kn_measurement_consent_v1";

  function getConsent() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "granted") return "granted";
    if (stored === "denied") return "denied";
    return null;
  }

  function setConsent(value) {
    localStorage.setItem(STORAGE_KEY, value);
  }

  const banner = document.querySelector("[data-consent-banner]");
  const acceptBtn = document.querySelector("[data-consent-accept]");
  const denyBtn = document.querySelector("[data-consent-deny]");
  const preferencesLink = document.querySelector("[data-consent-preferences]");

  function showBanner() {
    if (banner) banner.removeAttribute("hidden");
  }

  function hideBanner() {
    if (banner) banner.setAttribute("hidden", "");
  }

  function loadPinterestTag() {
    if (window.pintrk) return;
    !function(e){if(!window.pintrk){window.pintrk=function(){window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var n=window.pintrk;n.queue=[],n.version="3.0";var t=document.createElement("script");t.async=!0,t.src=e;var r=document.getElementsByTagName("script")[0];r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");
  }

  function initPinterest() {
    var tagId = config.pinterestTagId;
    if (!tagId) return;
    loadPinterestTag();
    pintrk("load", tagId);
    pintrk("page");
    if (!window._kn_pv) {
      pintrk("track", "pagevisit");
      window._kn_pv = true;
    }
  }

  var currentConsent = getConsent();
  if (currentConsent === "granted") {
    initPinterest();
    hideBanner();
  } else if (currentConsent === "denied") {
    hideBanner();
  } else {
    showBanner();
  }

  if (acceptBtn) {
    acceptBtn.addEventListener("click", function () {
      setConsent("granted");
      hideBanner();
      initPinterest();
    });
  }

  if (denyBtn) {
    denyBtn.addEventListener("click", function () {
      setConsent("denied");
      hideBanner();
      if (typeof pintrk === "function") {
        window.location.reload();
      }
    });
  }

  if (preferencesLink) {
    preferencesLink.addEventListener("click", function (e) {
      e.preventDefault();
      currentConsent = getConsent();
      if (currentConsent === null) {
        showBanner();
      } else {
        showBanner();
      }
    });
  }

  var trackingKeys = [
    "src", "sck", "utm_source", "utm_medium", "utm_campaign",
    "utm_term", "utm_content", "s1", "s2", "s3"
  ];
  var notice = document.querySelector("[data-site-notice]");
  var noticeTimer;

  function showNotice(message) {
    if (!notice) return;
    notice.textContent = message;
    notice.removeAttribute("hidden");
    window.clearTimeout(noticeTimer);
    noticeTimer = window.setTimeout(function () { notice.setAttribute("hidden", ""); }, 4200);
  }

  function validCheckoutUrl(value) {
    try {
      var url = new URL(value);
      return url.protocol === "https:" && (
        url.hostname === "kiwify.com.br" || url.hostname.endsWith(".kiwify.com.br")
      );
    } catch (_) {
      return false;
    }
  }

  function buildCheckoutUrl() {
    if (!validCheckoutUrl(config.checkoutUrl)) return null;
    var target = new URL(config.checkoutUrl);
    var qs = new URLSearchParams(window.location.search);
    trackingKeys.forEach(function (key) {
      if (qs.has(key)) target.searchParams.set(key, qs.get(key));
    });
    return target.toString();
  }

  function fireInitiateCheckout() {
    if (typeof pintrk !== "function") return;
    pintrk("track", "initiatecheckout", {
      value: 49.90,
      order_quantity: 1,
      currency: "BRL",
      line_items: [{
        product_name: "Kit Nail Designer Essencial",
        product_id: "kit-nail-designer-essencial",
        product_price: 49.90,
        product_quantity: 1
      }]
    });
  }

  document.querySelectorAll("[data-checkout]").forEach(function (link) {
    link.setAttribute("rel", "noopener noreferrer");
    var checkoutUrl = buildCheckoutUrl();
    if (checkoutUrl) link.href = checkoutUrl;

    link.addEventListener("click", function (event) {
      var target = buildCheckoutUrl();
      if (!target) {
        event.preventDefault();
        showNotice("O checkout ainda n\u00e3o foi configurado.");
        return;
      }
      link.href = target;
      if (getConsent() === "granted" && typeof pintrk === "function") {
        fireInitiateCheckout();
      }
    });
  });

  function fireAnalyticsEvent(eventName, data) {
    if (getConsent() !== "granted" || typeof pintrk !== "function") return;
    pintrk("track", eventName, data || {});
  }

  document.querySelectorAll("[data-analytics]").forEach(function (el) {
    var eventName = el.getAttribute("data-analytics");
    if (!eventName) return;
    el.addEventListener("click", function () {
      fireAnalyticsEvent(eventName);
    });
  });

  if (typeof IntersectionObserver !== "undefined") {
    var pricingEls = document.querySelectorAll("[data-analytics=\"view_pricing\"]");
    if (pricingEls.length) {
      var pricingObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            fireAnalyticsEvent("view_pricing");
            pricingObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      pricingEls.forEach(function (el) { pricingObserver.observe(el); });
    }
  }

  var producerName = String(config.producerName || "").trim() || "Identifica\u00e7\u00e3o do produtor pendente";
  var supportEmail = String(config.supportEmail || "").trim() || "suporte a definir";

  document.querySelectorAll("[data-current-year]").forEach(function (node) {
    node.textContent = String(new Date().getFullYear());
  });
  document.querySelectorAll("[data-producer-name]").forEach(function (node) {
    node.textContent = producerName;
  });
  document.querySelectorAll("[data-support-email]").forEach(function (node) {
    node.textContent = supportEmail;
  });
  document.querySelectorAll("[data-support-link]").forEach(function (link) {
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail)) {
      link.href = "mailto:" + supportEmail;
    } else {
      link.removeAttribute("href");
    }
  });

  document.querySelectorAll(".faq__question").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var expanded = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!expanded));
      if (!expanded) {
        fireAnalyticsEvent("open_faq");
      }
      var answerId = btn.getAttribute("aria-controls");
      if (answerId) {
        var answer = document.getElementById(answerId);
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

  var lightboxEl = document.getElementById("collection-lightbox");
  var lightboxTitle = document.getElementById("lightbox-title");
  var lightboxImage = document.getElementById("lightbox-image");
  var lightboxCaption = document.getElementById("lightbox-caption");
  var lightboxCounter = document.querySelector(".lightbox__counter");
  var closeBtn = document.querySelector(".lightbox__close");
  var prevBtn = document.querySelector(".lightbox__prev");
  var nextBtn = document.querySelector(".lightbox__next");

  if (lightboxEl && lightboxTitle && lightboxImage) {
    var collections = Array.from(document.querySelectorAll(".collection[data-title]"));
    var currentIndex = -1;
    var previousFocus = null;

    function openLightbox(index) {
      if (index < 0 || index >= collections.length) return;
      currentIndex = index;
      var col = collections[currentIndex];
      var title = col.getAttribute("data-title") || "";
      var imgEl = col.querySelector("img");
      var imageSrc = imgEl ? imgEl.getAttribute("src") || "" : "";
      var altText = imgEl ? imgEl.getAttribute("alt") || "" : "";

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

    document.querySelectorAll(".collection__expand").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        var article = e.currentTarget.closest(".collection");
        if (!article) return;
        var idx = collections.indexOf(article);
        if (idx >= 0) {
          previousFocus = e.currentTarget;
          openLightbox(idx);
        }
      });
    });

    if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
    if (prevBtn) prevBtn.addEventListener("click", prevCollection);
    if (nextBtn) nextBtn.addEventListener("click", nextCollection);

    lightboxEl.addEventListener("click", function (e) {
      if (e.target === lightboxEl) closeLightbox();
    });

    document.addEventListener("keydown", function (e) {
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
