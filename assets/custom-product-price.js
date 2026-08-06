document.addEventListener("variant:change", function (event) {

  const variant = event.detail.variant;

  const productForm = event.detail.productForm;

  if (priceElement) {
        priceElement.textContent = Shopify.formatMoney(
            variant.price,
            window.Shopify.money_format
        );
    }

});