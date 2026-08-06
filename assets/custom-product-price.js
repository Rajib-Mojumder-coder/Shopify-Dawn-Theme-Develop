document.addEventListener("variant:change", function (event) {

  // Current selected variant
  const variant = event.detail.variant;

  // Current product form
  const productForm = event.detail.productForm;

  // Product wrapper
  const product = productForm.closest(".product");

  if (!product) return;

  // Selling price element
  const priceElement =
    product.querySelector("[data-product-price]");

  // Compare price element
  const comparePriceElement =
    product.querySelector("[data-compare-price]");



  /*------------------------------------
      Update Selling Price
  -------------------------------------*/

  if (priceElement) {

    priceElement.textContent = Shopify.formatMoney(
      variant.price,
      window.Shopify.money_format
    );

  }



  /*------------------------------------
      Update Compare Price
  -------------------------------------*/

  if (comparePriceElement) {

    if (variant.compare_at_price > variant.price) {

      comparePriceElement.textContent =
        Shopify.formatMoney(
          variant.compare_at_price,
          window.Shopify.money_format
        );

      comparePriceElement.hidden = false;

    } else {

      comparePriceElement.hidden = true;

    }

  }

});