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
    updateBrowserUrl(variant);

});

/*=========================================================
  Update Add To Cart Button
=========================================================*/

function updateAddToCartButton(button, variant) {

  // Button Text
  const buttonText =
    button.querySelector("span");

  if (!buttonText) return;

/*=========================================================
  Update Browser URL
=========================================================*/

function updateBrowserUrl(variant) {

  // If no variant exists, do nothing
  if (!variant) return;

  // Current page URL
  const url = new URL(window.location.href);

  // Update variant parameter
  url.searchParams.set("variant", variant.id);

  // Replace URL without page reload
  window.history.replaceState({}, "", url);

}

  /*---------------------------------------
      Variant doesn't exist
  ---------------------------------------*/

  if (!variant) {

    button.disabled = true;

    buttonText.textContent = "Unavailable";

    return;

  }

  /*---------------------------------------
      Sold Out
  ---------------------------------------*/

  if (!variant.available) {

    button.disabled = true;

    buttonText.textContent = "Sold Out";

    return;

  }

  /*---------------------------------------
      Available
  ---------------------------------------*/

  button.disabled = false;

  buttonText.textContent = "Add to cart";

}