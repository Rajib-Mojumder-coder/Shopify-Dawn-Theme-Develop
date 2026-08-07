/*=========================================================
  Custom Product Form
  ---------------------------------------------------------
  Listens for the custom "variant:change" event dispatched
  by the Variant Engine.
=========================================================*/

document.addEventListener("variant:change", function (event) {

  // Current selected variant
  const variant = event.detail.variant;

  // Current product form
  const productForm = event.detail.productForm;

  // Current product wrapper
  const product = productForm.closest(".product");

  console.log("Product Wrapper:", product);
console.log("Variant:", variant);

updateFeaturedMedia(product, variant);

  if (!product) return;

  // Add To Cart button
  const addButton = product.querySelector('[name="add"]');



  /*-------------------------------------------------------
    1. Update Hidden Variant ID
  -------------------------------------------------------*/

  updateVariantId(productForm, variant);



  /*-------------------------------------------------------
    2. Update Browser URL
  -------------------------------------------------------*/

  updateBrowserUrl(variant);



  /*-------------------------------------------------------
    3. Update Add To Cart Button
  -------------------------------------------------------*/

  if (addButton) {

    updateAddToCartButton(addButton, variant);

  }

});



/*=========================================================
  Update Hidden Variant ID
=========================================================*/

function updateVariantId(form, variant) {

  // Find hidden variant input
  const input = form.querySelector(".product-variant-id");

  // Safety check
  if (!input || !variant) return;

  // Update variant id
  input.value = variant.id;

}



/*=========================================================
  Update Browser URL
=========================================================*/

function updateBrowserUrl(variant) {

  // No variant selected
  if (!variant) return;

  // Current page URL
  const url = new URL(window.location.href);

  // Replace variant parameter
  url.searchParams.set("variant", variant.id);

  // Update URL without page reload
  window.history.replaceState({}, "", url);

}



/*=========================================================
  Update Add To Cart Button
=========================================================*/

function updateAddToCartButton(button, variant) {

  // Button text
  const buttonText = button.querySelector("span");

  if (!buttonText) return;



  /*-------------------------------------------------------
    Variant Not Found
  -------------------------------------------------------*/

  if (!variant) {

    button.disabled = true;

    buttonText.textContent = "Unavailable";

    return;

  }



  /*-------------------------------------------------------
    Sold Out
  -------------------------------------------------------*/

  if (!variant.available) {

    button.disabled = true;

    buttonText.textContent = "Sold Out";

    return;

  }



  /*-------------------------------------------------------
    Available
  -------------------------------------------------------*/

  button.disabled = false;

  buttonText.textContent = "Add to cart";

}
