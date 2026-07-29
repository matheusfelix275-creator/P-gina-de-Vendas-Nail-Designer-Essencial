window.SITE_CONFIG = Object.freeze({
  checkoutUrl: "https://pay.kiwify.com.br/hOdRDAD",
  producerName: "Kit Nail Designer Essencial",
  supportEmail: "naildesigner@suportt.com",
  pinterestTagId: "2612472718349",
  productId: "kit-nail-designer-essencial",
  productName: "Kit Nail Designer Essencial",
  price: 49.9,
  currency: "BRL",
  sellerName: "",
  brandName: "Kit Nail Designer Essencial",
  creatorName: "",
  creatorRole: "",
  creatorBio: "",
  creatorPhoto: "",
  supportWhatsApp: "",
  supportHours: "",
  privacyEmail: "",
  testimonials: []
});

window.SITE_CONTENT_HELPERS = Object.freeze({
  isFilled: function (value) {
    return typeof value === "string" && value.trim().length > 0;
  },
  creatorReady: function () {
    var c = window.SITE_CONFIG;
    return this.isFilled(c.creatorName) && this.isFilled(c.creatorBio) && this.isFilled(c.creatorPhoto);
  },
  hasAuthorizedTestimonials: function () {
    var t = window.SITE_CONFIG.testimonials;
    if (!Array.isArray(t) || t.length === 0) return false;
    return t.some(function (item) {
      return this.isFilled(item.name) && this.isFilled(item.text) && item.authorized === true;
    }.bind(this));
  }
});

