/*=========================================================
  Variant State
=========================================================*/

/*
|--------------------------------------------------------------------------
| Stores the currently selected variant.
|--------------------------------------------------------------------------
|
| Every synchronization module (Price, Media, SKU, Inventory, etc.)
| reads this object instead of passing the variant around repeatedly.
|
*/

window.currentVariant = null;

/*=========================================================
  Custom Product Form
  ---------------------------------------------------------
  Listens for the custom "variant:change" event dispatched
  by the Variant Engine.
=========================================================*/

document.addEventListener("variant:change", function (event) {

  // Current selected variant
  const variant = event.detail.variant;

  /*---------------------------------------------------------
  Save Current Variant
---------------------------------------------------------*/

window.currentVariant = variant;

console.log("Current Variant:", window.currentVariant);

  // Current product form
  const productForm = event.detail.productForm;

  // Current product wrapper
  const product = productForm.closest(".product");


updateFeaturedMedia(product, variant);

  if (!product) return;

  // Add To Cart button
  const addButton = product.querySelector('[name="add"]');



  /*----------------    1. Update Hidden Variant ID  -------------------------*/

  updateVariantId(productForm, variant);



  /*------------------ 2. Update Browser URL------------------------*/

  updateBrowserUrl(variant);



  /*-----------------------  3. Update Add To Cart Button------------------------*/

  if (addButton) {

    updateAddToCartButton(addButton, variant);

  }

});



/*====================pdate Hidden Variant ID==================*/

function updateVariantId(form, variant) {

  // Find hidden variant input
  const input = form.querySelector(".product-variant-id");

  // Safety check
  if (!input || !variant) return;

  // Update variant id
  input.value = variant.id;

}


/*==================  Update Browser URL====================*/

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



/*==================  Update Add To Cart Button================*/

function updateAddToCartButton(button, variant) {

  // Button text
  const buttonText = button.querySelector("span");

  if (!buttonText) return;



  /*-------------------    Variant Not Found  -----------------*/

  if (!variant) {

    button.disabled = true;

    buttonText.textContent = "Unavailable";

    return;

  }

  /*--------------  Sold Out---------------------*/

  if (!variant.available) {

    button.disabled = true;

    buttonText.textContent = "Sold Out";

    return;

  }



  /*----------------- Available---------------------------*/

  button.disabled = false;

  buttonText.textContent = "Add to cart";

}

/*=========================================================
  Get Current Variant
=========================================================*/

/*
|--------------------------------------------------------------------------
| Returns the currently selected variant.
|--------------------------------------------------------------------------
*/

function getCurrentVariant() {

    return window.currentVariant;

}

/*=========================================================
  Has Current Variant
=========================================================*/

function hasCurrentVariant() {

    return window.currentVariant !== null;

}

/*=========================================================
  Current Variant ID
=========================================================*/

function getCurrentVariantId() {

    if (!window.currentVariant) return null;

    return window.currentVariant.id;

}

/*=========================================================
  Current Variant Availability
=========================================================*/

function isCurrentVariantAvailable() {

    if (!window.currentVariant) return false;

    return window.currentVariant.available;

}

/*=========================================================
  Current Variant Media
=========================================================*/

function getCurrentVariantMedia() {

    if (!window.currentVariant) return null;

    return window.currentVariant.featured_media;

}

/*=========================================================
  Current Variant Price
=========================================================*/

function getCurrentVariantPrice() {

    if (!window.currentVariant) return 0;

    return window.currentVariant.price;

}

/*=========================================================
  Current Variant Compare Price
=========================================================*/

function getCurrentVariantComparePrice() {

    if (!window.currentVariant) return 0;

    return window.currentVariant.compare_at_price;

}

/*=========================================================
  Current Variant SKU
=========================================================*/

function getCurrentVariantSku() {

    if (!window.currentVariant) return "";

    return window.currentVariant.sku;

}

/*=========================================================
  Current Variant Inventory
=========================================================*/

function getCurrentVariantInventory() {

    if (!window.currentVariant) return 0;

    return window.currentVariant.inventory_quantity;

}
/*=========================================================
  4. Update Featured Media
=========================================================*/

function updateFeaturedMedia(product, variant) {

    // Safety checks
    if (!product || !variant || !variant.featured_media) return;

    // Swiper must exist
    if (!window.productMainSwiper) {
        console.warn("Main Swiper not found");
        return;
    }

    const mediaId = String(variant.featured_media.id);

    // Find slide index
    const slides = product.querySelectorAll(
        ".productMediaSlider .swiper-slide"
    );

    let slideIndex = -1;

    slides.forEach((slide, index) => {

        const currentId =
            slide.dataset.mediaId.split("-").pop();

        if (currentId === mediaId) {
            slideIndex = index;
        }

    });

    // console.log("Target Media ID:", mediaId);
    // console.log("Slide Index:", slideIndex);

    if (slideIndex >= 0) {

        window.productMainSwiper.slideToLoop(
            slideIndex,
            500
        );

    }

}