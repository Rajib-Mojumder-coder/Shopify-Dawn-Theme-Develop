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



function updateFeaturedMedia(product, variant) {

    if (!variant.featured_media) return;

    const mediaId = String(variant.featured_media.id);

    const mediaItems =
        product.querySelectorAll("[data-media-id]");

    console.log(mediaItems);

}