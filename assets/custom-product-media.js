/*==============  Custom Product Media ======================*/

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