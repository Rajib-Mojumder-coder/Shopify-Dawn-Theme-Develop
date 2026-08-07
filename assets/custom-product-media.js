/*==============Listen for Variant Change:  Custom Product Media ======================*/

document.addEventListener("variant:change", function (event) {

    // Current selected variant
    const variant = event.detail.variant;

    // Current product form
    const productForm = event.detail.productForm;

    // Current product wrapper
    const product = productForm.closest(".product");

    if (!product) return;

    // Update Featured Media
    updateFeaturedMedia(product, variant);

});

/*=============== Update Featured Media: Create updateFeaturedMedia()===============*/

/*=========================================================
  Update Featured Media
=========================================================*/

function updateFeaturedMedia(product, variant) {

    // Variant has no media
    if (!variant.featured_media) return;

    // Current media id
    const mediaId = variant.featured_media.id;
    console.log("Media ID:", mediaId);

}