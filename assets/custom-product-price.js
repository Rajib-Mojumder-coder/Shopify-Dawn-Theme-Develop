document.addEventListener("variant:change", function (event) {

  const variant = event.detail.variant;

  const productForm = event.detail.productForm;

  const priceElement =
    productForm.closest(".product")
      ?.querySelector("[data-product-price]");

});