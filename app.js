import "./config.js";

(function () {
  "use strict";

  var config = window.SITE_CONFIG || {};
  if (!config.checkoutUrl || config.checkoutUrl === "#") {
    console.error("ERRO: A URL de checkout em config.js precisa ser preenchida antes do build de produ\u00e7\u00e3o.");
  }

  /* ==================== SAFE STORAGE ==================== */
  function safeLocalStorageGet(key) {
    try { return localStorage.getItem(key); }
    catch (_) { return null; }
  }
  function safeLocalStorageSet(key, value) {
    try { localStorage.setItem(key, value); return true; }
    catch (_) { return false; }
  }
  function safeSessionStorageGet(key) {
    try { return sessionStorage.getItem(key); }
    catch (_) { return null; }
  }
  function safeSessionStorageSet(key, value) {
    try { sessionStorage.setItem(key, value); return true; }
    catch (_) { return false; }
  }

  /* ==================== HELPERS ==================== */
  function escapeHtml(str) {
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function getPagePath() {
    return window.location.pathname || "/";
  }

  function getDeviceGroup() {
    return window.innerWidth < 768 ? "mobile" : "desktop";
  }

  /* ==================== CONSENT ==================== */
  var STORAGE_KEY = "kn_measurement_consent_v1";
  var memoryConsent = null;

  function getConsent() {
    if (memoryConsent !== null) return memoryConsent;
    var stored = safeLocalStorageGet(STORAGE_KEY);
    if (stored === "granted" || stored === "denied") {
      memoryConsent = stored;
      return stored;
    }
    return null;
  }

  function setConsent(value) {
    memoryConsent = value;
    safeLocalStorageSet(STORAGE_KEY, value);
  }

  /* ==================== PINTEREST ==================== */
  var pinterestInitialized = false;

  function loadPinterestTag() {
    if (window.pintrk) return;
    !function(e){if(!window.pintrk){window.pintrk=function(){window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var n=window.pintrk;n.queue=[],n.version="3.0";var t=document.createElement("script");t.async=!0,t.src=e;var r=document.getElementsByTagName("script")[0];r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");
  }

  function initPinterest() {
    if (pinterestInitialized) return;
    var tagId = config.pinterestTagId;
    if (!tagId) return;
    loadPinterestTag();
    pintrk("load", tagId);
    pintrk("page");
    if (!window._kn_pv) {
      pintrk("track", "pagevisit");
      window._kn_pv = true;
    }
    pinterestInitialized = true;
  }

  /* ==================== DEBUG ==================== */
  var ANALYTICS_DEBUG = new URLSearchParams(window.location.search).get("analytics_debug") === "1";

  function logAnalytics(action, eventName, data) {
    if (!ANALYTICS_DEBUG) return;
    var time = new Date().toISOString();
    console.log("[ANALYTICS] " + action + ": " + eventName, JSON.stringify(data || {}), time);
  }

  /* ==================== UTM ==================== */
  var UTM_CACHE_KEY = "kn_campaign_utms_v1";
  var trackingKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  var pageUtms = null;

  function sanitizeUtmValue(value) {
    if (typeof value !== "string") return "";
    value = value.replace(/[\u0000-\u001F\u007F]/g, "").trim();
    if (value.length > 200) value = value.substring(0, 200);
    return value;
  }

  function captureUtms() {
    if (pageUtms) return pageUtms;
    pageUtms = {};
    var qs = new URLSearchParams(window.location.search);
    var hasValidUtmInUrl = false;

    trackingKeys.forEach(function (key) {
      var raw = qs.get(key);
      if (raw === null) {
        qs.forEach(function (v, k) {
          if (k.toLowerCase() === key && raw === null) {
            raw = v;
          }
        });
      }
      if (raw !== null) {
        var sanitized = sanitizeUtmValue(raw);
        if (sanitized) {
          pageUtms[key] = sanitized;
          hasValidUtmInUrl = true;
        }
      }
    });

    if (hasValidUtmInUrl) {
      safeSessionStorageSet(UTM_CACHE_KEY, JSON.stringify(pageUtms));
    } else {
      var cached = safeSessionStorageGet(UTM_CACHE_KEY);
      if (cached) {
        try {
          var parsed = JSON.parse(cached);
          if (typeof parsed === "object" && parsed !== null) {
            pageUtms = {};
            trackingKeys.forEach(function (key) {
              if (typeof parsed[key] === "string") {
                var sanitized = sanitizeUtmValue(parsed[key]);
                if (sanitized) pageUtms[key] = sanitized;
              }
            });
          }
        } catch (_) {}
      }
    }

    return pageUtms;
  }

  /* ==================== NOTICE ==================== */
  var notice = document.querySelector("[data-site-notice]");
  var noticeTimer;

  function showNotice(message) {
    if (!notice) return;
    notice.textContent = message;
    notice.removeAttribute("hidden");
    window.clearTimeout(noticeTimer);
    noticeTimer = window.setTimeout(function () { notice.setAttribute("hidden", ""); }, 4200);
  }

  /* ==================== CHECKOUT ==================== */
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
    var utms = captureUtms();
    trackingKeys.forEach(function (key) {
      if (utms[key] && !target.searchParams.has(key)) {
        target.searchParams.set(key, utms[key]);
      }
    });
    return target.toString();
  }

  var ctaEventMap = {
    header: "click_primary_cta",
    hero: "click_primary_cta",
    mid_page: "click_mid_page_cta",
    final_offer: "begin_checkout",
    sticky_mobile: "click_sticky_cta"
  };

  /* ==================== ANALYTICS ==================== */
  var ALLOWED_EVENTS = [
    "pagevisit", "view_pricing", "view_product_contents", "view_collections",
    "view_spreadsheets", "view_guarantee", "view_final_offer", "open_faq",
    "click_primary_cta", "click_mid_page_cta", "begin_checkout", "click_sticky_cta",
    "click_support_email", "click_support_whatsapp", "click_terms", "click_privacy"
  ];

  var ALLOWED_PAYLOAD_KEYS = [
    "product_id", "product_name", "value", "currency", "page_path", "page_title",
    "cta_location", "section_name", "faq_id", "faq_position", "device_group",
    "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "source"
  ];

  function sanitizeEventPayload(data) {
    if (!data || typeof data !== "object") return {};
    var out = {};
    ALLOWED_PAYLOAD_KEYS.forEach(function (key) {
      if (data.hasOwnProperty(key) && data[key] !== null && data[key] !== undefined) {
        var val = data[key];
        if (typeof val === "string") {
          val = val.replace(/[\u0000-\u001F\u007F]/g, "").trim();
          if (val.length > 200) val = val.substring(0, 200);
          if (val) out[key] = val;
        } else if (typeof val === "number") {
          out[key] = val;
        }
      }
    });
    return out;
  }

  var pendingViewEvents = {};

  function trackEvent(eventName, data) {
    if (ALLOWED_EVENTS.indexOf(eventName) === -1) {
      logAnalytics("IGNORADO (evento inv\u00e1lido)", eventName, data);
      return "invalid_event";
    }
    if (getConsent() !== "granted") {
      logAnalytics("BLOQUEADO (consentimento)", eventName, data);
      return "blocked_consent";
    }
    if (typeof pintrk !== "function") {
      logAnalytics("BLOQUEADO (pintrk ausente)", eventName, data);
      return "blocked_provider";
    }
    var payload = sanitizeEventPayload(data);
    pintrk("track", eventName, payload);
    logAnalytics("ENVIADO", eventName, payload);
    return "sent";
  }

  function flushPendingViews() {
    var keys = Object.keys(pendingViewEvents);
    if (!keys.length) return;
    keys.forEach(function (event) {
      trackEvent(event, pendingViewEvents[event]);
    });
    pendingViewEvents = {};
  }

  /* ==================== CTA SETUP ==================== */
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

      var location = link.getAttribute("data-cta-location") || "";
      var eventName = ctaEventMap[location];
      if (!eventName) return;

      var utms = captureUtms();
      var data = {
        cta_location: location,
        section_name: location === "header" || location === "hero" ? "hero" : location,
        page_path: getPagePath(),
        device_group: getDeviceGroup()
      };
      trackingKeys.forEach(function (key) {
        if (utms[key]) data[key] = utms[key];
      });
      if (location === "final_offer") {
        data.value = config.price;
        data.currency = config.currency;
        data.product_id = config.productId;
        data.product_name = config.productName;
        data.source = "landing_page";
      }
      trackEvent(eventName, data);
    });
  });

  /* ==================== CONSENT BANNER ==================== */
  var banner = document.querySelector("[data-consent-banner]");
  var acceptBtn = document.querySelector("[data-consent-accept]");
  var denyBtn = document.querySelector("[data-consent-deny]");
  var preferencesLink = document.querySelector("[data-consent-preferences]");

  function showBanner() {
    if (banner) banner.removeAttribute("hidden");
  }
  function hideBanner() {
    if (banner) banner.setAttribute("hidden", "");
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
      flushPendingViews();
    });
  }

  if (denyBtn) {
    denyBtn.addEventListener("click", function () {
      setConsent("denied");
      pendingViewEvents = {};
      hideBanner();
      if (pinterestInitialized) {
        window.location.reload();
      }
    });
  }

  if (preferencesLink) {
    preferencesLink.addEventListener("click", function (e) {
      e.preventDefault();
      currentConsent = getConsent();
      showBanner();
    });
  }

  /* ==================== VIEW EVENTS OBSERVERS ==================== */
  if (typeof IntersectionObserver !== "undefined") {
    var viewConfigs = [
      { selector: ".checkout__price", event: "view_pricing", threshold: 0.5, section: "final_offer" },
      { selector: ".section--content", event: "view_product_contents", threshold: 0.4, section: "content" },
      { selector: ".section--collections", event: "view_collections", threshold: 0.4, section: "collections" },
      { selector: ".section--spreadsheets", event: "view_spreadsheets", threshold: 0.4, section: "spreadsheets" },
      { selector: ".section--guarantee", event: "view_guarantee", threshold: 0.4, section: "guarantee" },
      { selector: ".section--checkout", event: "view_final_offer", threshold: 0.4, section: "final_offer" }
    ];

    viewConfigs.forEach(function (cfg) {
      var el = document.querySelector(cfg.selector);
      if (!el) return;
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            observer.unobserve(entry.target);
            var eventData = {
              section_name: cfg.section,
              page_path: getPagePath(),
              device_group: getDeviceGroup()
            };
            var result = trackEvent(cfg.event, eventData);
            if (result === "blocked_consent") {
              pendingViewEvents[cfg.event] = eventData;
            }
          }
        });
      }, { threshold: cfg.threshold });
      observer.observe(el);
    });
  }

  /* ==================== SUPPORT DELEGATION ==================== */
  document.addEventListener("click", function (e) {
    var link = e.target.closest('[data-analytics="click_support_email"]');
    if (link) {
      trackEvent("click_support_email");
      return;
    }
    link = e.target.closest('[data-analytics="click_support_whatsapp"]');
    if (link) {
      trackEvent("click_support_whatsapp");
      return;
    }
  });

  /* ==================== SUPPORT & SECURITY LINKS ==================== */
  var supportEmail = String(config.supportEmail || "").trim();
  var supportWhatsApp = String(config.supportWhatsApp || "").trim();
  var supportHours = String(config.supportHours || "").trim();
  var supportListEl = document.getElementById("footer-support-list");
  if (supportListEl) {
    if (supportEmail) {
      var emailLi = document.createElement("li");
      emailLi.innerHTML = '<a href="mailto:' + escapeHtml(supportEmail) + '" data-analytics="click_support_email">' + escapeHtml(supportEmail) + '</a>';
      supportListEl.appendChild(emailLi);
    }
    if (supportWhatsApp) {
      var waLi = document.createElement("li");
      waLi.innerHTML = '<a href="' + escapeHtml(supportWhatsApp) + '" data-analytics="click_support_whatsapp" rel="noopener noreferrer">WhatsApp</a>';
      supportListEl.appendChild(waLi);
    }
    if (supportHours) {
      var hoursLi = document.createElement("li");
      hoursLi.textContent = supportHours;
      supportListEl.appendChild(hoursLi);
    }
    if (!supportListEl.children.length) {
      var supportGroup = document.getElementById("footer-support-group");
      if (supportGroup) supportGroup.setAttribute("hidden", "");
    }
  }

  /* Footer: identity group */
  var sellerName = String(config.sellerName || "").trim();
  var brandName = String(config.brandName || "").trim();
  var identityListEl = document.getElementById("footer-identity-list");
  if (identityListEl) {
    if (brandName) {
      var brandLi = document.createElement("li");
      brandLi.textContent = brandName;
      identityListEl.appendChild(brandLi);
    }
    if (sellerName) {
      var sellerLi = document.createElement("li");
      sellerLi.textContent = sellerName;
      identityListEl.appendChild(sellerLi);
    }
    if (!identityListEl.children.length) {
      var identityGroup = document.getElementById("footer-identity-group");
      if (identityGroup) identityGroup.setAttribute("hidden", "");
    }
  }

  /* Security section: support link */
  var securitySupport = document.getElementById("security-support");
  if (securitySupport && supportEmail) {
    securitySupport.innerHTML = ' Em caso de d\u00favidas, escreva para <a href="mailto:' + escapeHtml(supportEmail) + '" data-analytics="click_support_email">' + escapeHtml(supportEmail) + '</a>.';
  }

  /* ==================== FAQ ==================== */
  var faqButtons = document.querySelectorAll(".faq__question");
  faqButtons.forEach(function (btn, index) {
    btn.addEventListener("click", function () {
      var wasExpanded = btn.getAttribute("aria-expanded") === "true";

      faqButtons.forEach(function (otherBtn) {
        var panelId = otherBtn.getAttribute("aria-controls");
        var panel = panelId ? document.getElementById(panelId) : null;
        otherBtn.setAttribute("aria-expanded", "false");
        if (panel) panel.setAttribute("hidden", "");
      });

      if (!wasExpanded) {
        var currentPanelId = btn.getAttribute("aria-controls");
        var currentPanel = currentPanelId ? document.getElementById(currentPanelId) : null;
        btn.setAttribute("aria-expanded", "true");
        if (currentPanel) currentPanel.removeAttribute("hidden");
        var position = index + 1;
        var faqId = "faq_" + (position < 10 ? "0" : "") + position;
        trackEvent("open_faq", {
          faq_id: faqId,
          faq_position: position,
          page_path: getPagePath(),
          device_group: getDeviceGroup()
        });
      }
    });
  });

  /* ==================== TERMS / PRIVACY ==================== */
  Array.from(document.querySelectorAll("a[href*='termos-de-uso']")).forEach(function (link) {
    link.addEventListener("click", function () {
      trackEvent("click_terms");
    });
  });
  Array.from(document.querySelectorAll("a[href*='politica-de-privacidade']")).forEach(function (link) {
    link.addEventListener("click", function () {
      trackEvent("click_privacy");
    });
  });

  /* ==================== MOBILE STICKY CTA ==================== */
  var mobileBar = document.getElementById("mobile-sticky-cta");
  var closeBtn = document.querySelector(".mobile-bar__close");
  var checkoutSection = document.getElementById("checkout");
  var heroSection = document.querySelector(".hero");
  var dismissed = safeSessionStorageGet("kn_mobile_cta_dismissed");

  if (mobileBar && !dismissed) {
    function updateMobileBarVisibility() {
      if (checkoutSection && heroSection && typeof IntersectionObserver !== "undefined") {
        var heroObserver = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) {
              mobileBar.classList.add("mobile-bar--visible");
            } else {
              mobileBar.classList.remove("mobile-bar--visible");
            }
          });
        }, { threshold: 0 });
        heroObserver.observe(heroSection);

        var checkoutObserver = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              mobileBar.classList.remove("mobile-bar--visible");
            }
          });
        }, { threshold: 0 });
        checkoutObserver.observe(checkoutSection);
      }
    }

    if (closeBtn) {
      closeBtn.removeAttribute("hidden");
      closeBtn.addEventListener("click", function () {
        safeSessionStorageSet("kn_mobile_cta_dismissed", "1");
        mobileBar.classList.remove("mobile-bar--visible");
        setTimeout(function () { mobileBar.setAttribute("hidden", ""); }, 300);
      });
    }

    updateMobileBarVisibility();
  }

  /* ==================== LIGHTBOX ==================== */
  var lightboxEl = document.getElementById("collection-lightbox");
  var lightboxTitle = document.getElementById("lightbox-title");
  var lightboxImage = document.getElementById("lightbox-image");
  var lightboxCaption = document.getElementById("lightbox-caption");
  var lightboxCounter = document.querySelector(".lightbox__counter");
  var lightboxCloseBtn = document.querySelector(".lightbox__close");
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
      if (lightboxCloseBtn) lightboxCloseBtn.focus();
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

    if (lightboxCloseBtn) lightboxCloseBtn.addEventListener("click", closeLightbox);
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
