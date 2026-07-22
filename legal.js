import "./config.js";

(function () {
  "use strict";
  const config = window.SITE_CONFIG || {};
  const year = String(new Date().getFullYear());

  document.querySelectorAll("[data-legal-year]").forEach((node) => {
    node.textContent = year;
  });

  const producer = String(config.producerName || "").trim();
  document.querySelectorAll("[data-legal-producer]").forEach((node) => {
    node.textContent = producer;
  });

  const email = String(config.supportEmail || "").trim();
  document.querySelectorAll("[data-legal-email]").forEach((node) => {
    node.textContent = email;
  });
  document.querySelectorAll("[data-legal-email-link]").forEach((link) => {
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      link.href = "mailto:" + email;
    } else {
      link.removeAttribute("href");
    }
  });
})();
