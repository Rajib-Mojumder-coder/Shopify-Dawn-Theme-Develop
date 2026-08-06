window.CustomProductUtils = {

  formatMoney(cents) {

    return new Intl.NumberFormat(document.documentElement.lang || "en", {
      style: "currency",
      currency: window.Shopify.currency.active
    }).format(cents / 100);

  }

};