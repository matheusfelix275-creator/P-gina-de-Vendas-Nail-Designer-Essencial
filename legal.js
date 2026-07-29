import "./config.js";

(function () {
  "use strict";
  var config = window.SITE_CONFIG || {};
  var year = String(new Date().getFullYear());

  document.querySelectorAll("[data-legal-year]").forEach(function (node) {
    node.textContent = year;
  });

  var producer = String(config.producerName || config.brandName || "").trim();
  document.querySelectorAll("[data-legal-producer]").forEach(function (node) {
    node.textContent = producer;
  });

  var email = String(config.supportEmail || "").trim();
  document.querySelectorAll("[data-legal-email]").forEach(function (node) {
    node.textContent = email;
  });
  document.querySelectorAll("[data-legal-email-link]").forEach(function (link) {
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      link.href = "mailto:" + email;
    } else {
      link.removeAttribute("href");
    }
  });
})();
