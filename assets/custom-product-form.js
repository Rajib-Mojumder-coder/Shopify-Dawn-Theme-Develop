/*=========================================================
  Custom Product Form
=========================================================*/

document.addEventListener("variant:change", function (event) {

  // Selected Variant
  const variant = event.detail.variant;

  // Current Product Form
  const productForm = event.detail.productForm;

  // Current Product Wrapper
  const product = productForm.closest(".product");

  if (!product) return;

  // Add to Cart Button
  const addButton =
    product.querySelector('[name="add"]');

  if (!addButton) return;

  updateAddToCartButton(addButton, variant);

});