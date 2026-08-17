/*=========================================================*
 * CUSTOM PRODUCT FORM
 * Variant Synchronization Engine
 *=========================================================*
 *
 * Central event:
 *     variant:change
 *
 * Modules:
 *     1. Variant ID
 *     2. Browser URL
 *     3. Add to Cart
 *     4. Product Media
 *     5. Product Price
 *     6. SKU
 *     7. Inventory
 *
 * Architecture:
 *     Variant Engine
 *          ↓
 *     variant:change
 *          ↓
 *     Current Product Scope
 *          ↓
 *     Synchronization Modules
 *
 *=========================================================*/


/*=========================================================*
 * VARIANT STATE
 *=========================================================*/

window.currentVariant = null;


/*=========================================================*
 * VARIANT CHANGE EVENT
 *=========================================================*/

document.addEventListener("variant:change", function (event) {

    /*-----------------------------------------------------*
     * 1. Get selected variant
     *-----------------------------------------------------*/

    const variant = event.detail.variant;

    /*-----------------------------------------------------*
     * 2. Save current variant
     *-----------------------------------------------------*/

    window.currentVariant = variant;

    /*-----------------------------------------------------*
     * 3. Get current product form
     *-----------------------------------------------------*/

    const productForm = event.detail.productForm;

    if (!productForm) return;

    /*-----------------------------------------------------*
     * 4. Get current product scope
     *-----------------------------------------------------*/

    const product = productForm.closest(".product");

    if (!product) return;


    /*=====================================================*
     * MODULE 1 — VARIANT ID
     *=====================================================*/

    updateVariantId(
        productForm,
        variant
    );


    /*=====================================================*
     * MODULE 2 — BROWSER URL
     *=====================================================*/

    updateBrowserUrl(
        variant
    );


    /*=====================================================*
     * MODULE 3 — ADD TO CART
     *=====================================================*/

    const addButton = product.querySelector(
        '[name="add"]'
    );

    if (addButton) {

        updateAddToCartButton(
            addButton,
            variant
        );

    }


    /*=====================================================*
     * MODULE 2.2.6 — MEDIA
     *=====================================================*/

    updateFeaturedMedia(
        product,
        variant
    );


    /*=====================================================*
     * MODULE 2.2.7 — SKU
     *=====================================================*/

    updateProductSku(
        product
    );


    /*=====================================================*
     * MODULE 2.2.8 — INVENTORY
     *=====================================================*/

    updateProductInventory(
        product
    );


    /*=====================================================*
     * MODULE 2.2.9 — PRICE
     *=====================================================*/

    updateProductPrice(product);

});


/*=========================================================*
 * MODULE 1
 * UPDATE HIDDEN VARIANT ID
 *=========================================================*/

function updateVariantId(form, variant) {

    if (!form || !variant) return;

    const input = form.querySelector(
        ".product-variant-id"
    );

    if (!input) return;

    input.value = variant.id;

}


/*=========================================================*
 * MODULE 2
 * UPDATE BROWSER URL
 *=========================================================*/

function updateBrowserUrl(variant) {

    if (!variant) return;

    const url = new URL(
        window.location.href
    );

    url.searchParams.set(
        "variant",
        variant.id
    );

    window.history.replaceState(
        {},
        "",
        url
    );

}


/*=========================================================*
 * MODULE 3
 * UPDATE ADD TO CART
 *=========================================================*/

function updateAddToCartButton(
    button,
    variant
) {

    if (!button) return;

    const buttonText =
        button.querySelector("span");

    if (!buttonText) return;


    /*-----------------------------------------------------*
     * Variant unavailable
     *-----------------------------------------------------*/

    if (!variant) {

        button.disabled = true;

        buttonText.textContent =
            "Unavailable";

        return;

    }


    /*-----------------------------------------------------*
     * Variant sold out
     *-----------------------------------------------------*/

    if (!variant.available) {

        button.disabled = true;

        buttonText.textContent =
            "Sold Out";

        return;

    }


    /*-----------------------------------------------------*
     * Variant available
     *-----------------------------------------------------*/

    button.disabled = false;

    buttonText.textContent =
        "Add to cart";

}


/*=========================================================*
 * VARIANT HELPERS
 *=========================================================*/


/*---------------------------------------------------------*
 * Get current variant
 *---------------------------------------------------------*/

function getCurrentVariant() {

    return window.currentVariant;

}


/*---------------------------------------------------------*
 * Check current variant
 *---------------------------------------------------------*/

function hasCurrentVariant() {

    return window.currentVariant !== null;

}


/*---------------------------------------------------------*
 * Current variant ID
 *---------------------------------------------------------*/

function getCurrentVariantId() {

    const variant =
        getCurrentVariant();

    if (!variant) return null;

    return variant.id;

}


/*---------------------------------------------------------*
 * Current variant availability
 *---------------------------------------------------------*/

function isCurrentVariantAvailable() {

    const variant =
        getCurrentVariant();

    if (!variant) return false;

    return variant.available;

}


/*---------------------------------------------------------*
 * Current variant media
 *---------------------------------------------------------*/

function getCurrentVariantMedia() {

    const variant =
        getCurrentVariant();

    if (!variant) return null;

    return variant.featured_media;

}


/*---------------------------------------------------------*
 * Current variant price
 *---------------------------------------------------------*/

function getCurrentVariantPrice() {

    const variant =
        getCurrentVariant();

    if (!variant) return 0;

    return variant.price;

}


/*---------------------------------------------------------*
 * Current variant compare-at price
 *---------------------------------------------------------*/

function getCurrentVariantComparePrice() {

    const variant =
        getCurrentVariant();

    if (!variant) return 0;

    return variant.compare_at_price;

}


/*---------------------------------------------------------*
 * Current variant SKU
 *---------------------------------------------------------*/

function getCurrentVariantSku() {

    const variant =
        getCurrentVariant();

    if (!variant) return "";

    return variant.sku || "";

}


/*---------------------------------------------------------*
 * Current variant inventory
 *---------------------------------------------------------*/

function getCurrentVariantInventory() {

    const variant =
        getCurrentVariant();

    if (!variant) return null;

    return variant.inventory_quantity;

}


/*=========================================================*
 * MODULE 2.2.6
 * UPDATE FEATURED MEDIA
 *=========================================================*/

function updateFeaturedMedia(
    product,
    variant
) {

    /*-----------------------------------------------------*
     * Safety check
     *-----------------------------------------------------*/

    if (
        !product ||
        !variant ||
        !variant.featured_media
    ) {
        return;
    }


    /*-----------------------------------------------------*
     * Check Swiper
     *-----------------------------------------------------*/

    if (!window.productMainSwiper) {

        console.warn(
            "Main Swiper not found"
        );

        return;

    }


    /*-----------------------------------------------------*
     * Variant media ID
     *-----------------------------------------------------*/

    const mediaId =
        String(
            variant.featured_media.id
        );


    /*-----------------------------------------------------*
     * Find slides
     *-----------------------------------------------------*/

    const slides =
        product.querySelectorAll(
            ".productMediaSlider .swiper-slide"
        );


    let slideIndex = -1;


    /*-----------------------------------------------------*
     * Find matching slide
     *-----------------------------------------------------*/

    slides.forEach(
        (slide, index) => {

            const mediaData =
                slide.dataset.mediaId;

            if (!mediaData) return;

            const currentId =
                mediaData
                    .split("-")
                    .pop();

            if (
                currentId === mediaId
            ) {

                slideIndex = index;

            }

        }
    );


    /*-----------------------------------------------------*
     * Navigate slider
     *-----------------------------------------------------*/

    if (slideIndex >= 0) {

        window.productMainSwiper.slideToLoop(
            slideIndex,
            500
        );

    }

}


/*=========================================================*
 * MODULE 2.2.7
 * UPDATE PRODUCT SKU
 *=========================================================*/

function updateProductSku(product) {

    if (!product) return;


    const skuWrapper =
        product.querySelector(
            "[data-product-sku]"
        );

    const skuValue =
        product.querySelector(
            "[data-product-sku-value]"
        );

    if (
        !skuWrapper ||
        !skuValue
    ) {
        return;
    }


    const sku =
        getCurrentVariantSku();


    /*-----------------------------------------------------*
     * Hide empty SKU
     *-----------------------------------------------------*/

    if (!sku) {

        skuWrapper.hidden = true;

        skuValue.textContent = "";

        return;

    }


    /*-----------------------------------------------------*
     * Display SKU
     *-----------------------------------------------------*/

    skuValue.textContent =
        sku;

    skuWrapper.hidden = false;

}


/*=========================================================*
 * MODULE 2.2.8
 * UPDATE PRODUCT INVENTORY
 *=========================================================*/

function updateProductInventory(product) {

    if (!product) return;


    /*-----------------------------------------------------*
     * Find inventory elements
     *-----------------------------------------------------*/

    const inventoryWrapper =
        product.querySelector(
            "[data-product-inventory]"
        );

    const inventoryBadge =
        product.querySelector(
            "[data-inventory-badge]"
        );

    const inventoryText =
        product.querySelector(
            "[data-inventory-text]"
        );


    if (
        !inventoryWrapper ||
        !inventoryBadge ||
        !inventoryText
    ) {
        return;
    }


    /*-----------------------------------------------------*
     * Get current variant
     *-----------------------------------------------------*/

    const variant =
        getCurrentVariant();


    /*-----------------------------------------------------*
     * Reset state
     *-----------------------------------------------------*/

    inventoryWrapper.hidden = true;

    inventoryWrapper.classList.remove(
        "is-in-stock",
        "is-low-stock",
        "is-out-of-stock",
        "is-unavailable"
    );

    inventoryText.textContent = "";


    /*-----------------------------------------------------*
     * No variant
     *-----------------------------------------------------*/

    if (!variant) return;


    /*-----------------------------------------------------*
     * Variant unavailable
     *-----------------------------------------------------*/

    if (!variant.available) {

        inventoryWrapper.classList.add(
            "is-out-of-stock"
        );

        inventoryText.textContent =
            "Out of stock";

        inventoryWrapper.hidden = false;

        return;

    }


    /*-----------------------------------------------------*
     * Get inventory quantity
     *-----------------------------------------------------*/

    const quantity =
        getCurrentVariantInventory();


    /*-----------------------------------------------------*
     * Inventory quantity unavailable
     *-----------------------------------------------------*/

    if (
        quantity === null ||
        quantity === undefined ||
        quantity < 0
    ) {

        inventoryWrapper.classList.add(
            "is-in-stock"
        );

        inventoryText.textContent =
            "In stock";

        inventoryWrapper.hidden = false;

        return;

    }


    /*-----------------------------------------------------*
     * Out of stock
     *-----------------------------------------------------*/

    if (quantity <= 0) {

        inventoryWrapper.classList.add(
            "is-out-of-stock"
        );

        inventoryText.textContent =
            "Out of stock";

        inventoryWrapper.hidden = false;

        return;

    }


    /*-----------------------------------------------------*
     * Low stock threshold
     *-----------------------------------------------------*/

    const lowStockThreshold = 5;


    /*-----------------------------------------------------*
     * Low stock
     *-----------------------------------------------------*/

    if (
        quantity <= lowStockThreshold
    ) {

        inventoryWrapper.classList.add(
            "is-low-stock"
        );

        inventoryText.textContent =
            `Only ${quantity} left in stock`;

        inventoryWrapper.hidden = false;

        return;

    }


    /*-----------------------------------------------------*
     * Normal stock
     *-----------------------------------------------------*/

    inventoryWrapper.classList.add(
        "is-in-stock"
    );

    inventoryText.textContent =
        "In stock";

    inventoryWrapper.hidden = false;

}


/*=========================================================*
 * MODULE 2.2.9 — PRICE SYNCHRONIZATION
 *=========================================================*/

/*=========================================================*
 * MODULE 2.2.9 — PRICE SYNCHRONIZATION
 *=========================================================*/

function updateProductPrice(product) {

    /*========== Safety ==========*/

    if (!product) return;


    /*========== Price Scope ==========*/

    const priceScope = product.querySelector(
        "[data-product-price-scope]"
    );

    if (!priceScope) return;


    /*========== Current Variant ==========*/

    const variant = getCurrentVariant();

    if (!variant) return;


    /*========== Product Scope Check ==========*/

    const scopeProductId =
        String(priceScope.dataset.productId || "");

    const productId =
        String(product.dataset.productId || "");

    if (
        productId &&
        scopeProductId &&
        productId !== scopeProductId
    ) {
        return;
    }


    /*========== Elements ==========*/

    const currentPriceElement =
        priceScope.querySelector(
            "[data-product-price]"
        );

    const comparePriceElement =
        priceScope.querySelector(
            "[data-compare-price]"
        );

    const savingsAmountElement =
        priceScope.querySelector(
            "[data-savings-amount]"
        );

    const savingsPercentageElement =
        priceScope.querySelector(
            "[data-savings-percentage]"
        );


    /*========== Variant ID ==========*/

    priceScope.dataset.variantId =
        String(variant.id);


    /*========== Prices ==========*/

    let currentPrice =
        Number(variant.price || 0);

    let comparePrice =
        Number(variant.compare_at_price || 0);


    /*========== Round Price ==========*/

    if (
        priceScope.dataset.roundPrice === "true"
    ) {

        currentPrice =
            Math.round(
                currentPrice / 100
            ) * 100;

        if (comparePrice > 0) {

            comparePrice =
                Math.round(
                    comparePrice / 100
                ) * 100;

        }

    }


    /*========== Sale Detection ==========*/

    const onSale =
        comparePrice > currentPrice;


    /*========== Savings ==========*/

    let savingsAmount = 0;
    let savingsPercentage = 0;

    if (onSale) {

        savingsAmount =
            comparePrice - currentPrice;

        savingsPercentage =
            Math.round(
                (savingsAmount / comparePrice) * 100
            );

    }


    /*=========================================================*
     * MONEY FORMATTER
     *=========================================================*/

    function formatMoney(amount) {

        if (
            window.Shopify &&
            typeof Shopify.formatMoney === "function"
        ) {

            const priceFormat =
                priceScope.dataset.priceFormat || "money";


            let moneyFormat =
                priceScope.dataset.moneyFormat;


            if (
                priceFormat ===
                "money_with_currency"
            ) {

                moneyFormat =
                    priceScope.dataset
                        .moneyWithCurrencyFormat;

            }


            let formatted =
                Shopify.formatMoney(
                    amount,
                    moneyFormat
                );


            /*========== Remove trailing zeros ==========*/

            if (
                priceFormat ===
                "money_without_trailing_zeros"
            ) {

                formatted =
                    formatted.replace(
                        /([.,]00)(?!\d)/,
                        ""
                    );

            }


            /*========== Remove currency ==========*/

            if (
                priceFormat ===
                "money_without_currency"
            ) {

                formatted =
                    formatted
                        .replace(
                            /[^\d\s.,-]+/g,
                            ""
                        )
                        .trim();

            }


            return formatted;

        }


        /*========== Fallback ==========*/

        return (
            amount / 100
        ).toFixed(2);

    }


    /*=========================================================*
     * CURRENT PRICE
     *=========================================================*/

    if (currentPriceElement) {

        currentPriceElement.innerHTML =
            formatMoney(currentPrice);

    }


    /*=========================================================*
     * COMPARE-AT PRICE
     *=========================================================*/

    if (comparePriceElement) {

        const hideWithoutDiscount =
            priceScope.dataset
                .hideCompareWithoutDiscount === "true";


        if (
            comparePrice <= 0 ||
            (
                hideWithoutDiscount &&
                !onSale
            )
        ) {

            comparePriceElement.hidden = true;
            comparePriceElement.textContent = "";

        } else {

            comparePriceElement.textContent =
                formatMoney(comparePrice);

            comparePriceElement.hidden = false;

        }

    }


    /*=========================================================*
     * SAVINGS AMOUNT
     *=========================================================*/

    if (savingsAmountElement) {

        if (onSale) {

            savingsAmountElement.textContent =
                "Save " +
                formatMoney(savingsAmount);

            savingsAmountElement.hidden = false;

        } else {

            savingsAmountElement.textContent = "";
            savingsAmountElement.hidden = true;

        }

    }


    /*=========================================================*
     * SAVINGS PERCENTAGE
     *=========================================================*/

    if (savingsPercentageElement) {

        if (onSale) {

            savingsPercentageElement.textContent =
                `${savingsPercentage}% OFF`;

            savingsPercentageElement.hidden = false;

        } else {

            savingsPercentageElement.textContent = "";
            savingsPercentageElement.hidden = true;

        }

    }


    /*========== State ==========*/

    priceScope.dataset.onSale =
        String(onSale);

    priceScope.dataset.savingsAmount =
        String(savingsAmount);

    priceScope.dataset.savingsPercentage =
        String(savingsPercentage);

}


/*=========================================================*
 * PRICE FORMATTER
 *=========================================================*
 *
 * Shopify's global formatMoney() is used.
 *
 * Liquid provides the shop money format
 * through data attributes.
 *
 *=========================================================*/

function formatProductMoney(
    amount,
    priceScope
) {

    if (
        window.Shopify &&
        typeof Shopify.formatMoney ===
        "function"
    ) {

        const moneyFormat =
            priceScope.dataset.moneyFormat ||
            "{{ shop.money_format }}";


        return Shopify.formatMoney(
            amount,
            moneyFormat
        );

    }


    /*-----------------------------------------------------*
     * Fallback
     *-----------------------------------------------------*/

    return (
        amount / 100
    ).toFixed(2);

}


// // Main code of custom product form:
// /*=========================================================*
//  * CUSTOM PRODUCT FORM
//  *
//  * Responsibilities:
//  *
//  * 1. Store current variant
//  * 2. Synchronize variant ID
//  * 3. Synchronize browser URL
//  * 4. Synchronize Add to Cart button
//  * 5. Synchronize product media
//  * 6. Synchronize SKU
//  *
//  * Future modules:
//  *
//  * 7. Inventory
//  * 8. Compare-at price / savings
//  * 9. Other variant-dependent information
//  *
//  * All synchronization modules use the shared
//  * window.currentVariant state.
//  *=========================================================*/


// /*=========================================================*
//  * VARIANT STATE
//  *=========================================================*
//  *
//  * Stores the currently selected variant.
//  *
//  * Every synchronization module:
//  *
//  * - Price
//  * - Media
//  * - SKU
//  * - Inventory
//  * - Compare-at price
//  * - Availability
//  *
//  * can access the current variant through:
//  *
//  *     getCurrentVariant()
//  *
//  * instead of repeatedly passing variant data around.
//  *
//  *=========================================================*/

// window.currentVariant = null;


// /*================ * VARIANT CHANGE EVENT ============*
//  *
//  * The Custom Variant Engine dispatches:
//  *   "variant:change"
//  ** whenever the selected variant changes.
//  ** This is the central synchronization point for the
//  * custom product system.=*/

// document.addEventListener("variant:change", function (event) {
//     /*------------- 1. Get Selected Variant---------------*/

//     const variant = event.detail.variant;
//     /*------------ 2. Save Current Variant-----------------*
//      * Store the variant globally so all synchronization
//      * modules can access it through the helper functions.
//      *
//      *---------------------------------------------------------*/

//     window.currentVariant = variant;
//     console.log(
//         "Current Variant:",
//         window.currentVariant
//     );
//     /*-----------  3. Get Product Form--------------------*/

//     const productForm = event.detail.productForm;
//     if (!productForm) return;

//     /*------------- 4. Get Product Wrapper------------------*/

//     const product = productForm.closest(".product");
//     if (!product) return;

//     /*=========== MODULE: MEDIA SYNCHRONIZATION============*
//      * Change the main product media according to the
//      * selected variant's featured_media.
//      */

//     updateFeaturedMedia(product, variant);

//     /*--------- * Get Add To Cart Button---------*/

//     const addButton = product.querySelector(
//         '[name="add"]'
//     );


//     /*=========== MODULE 1 — HIDDEN VARIANT ID===========*
//      * Updates:  <input name="id">
//      * so Shopify receives the currently selected variant.=*/

//     updateVariantId(
//         productForm,
//         variant
//     );
//     /*====== MODULE 2 — BROWSER URL=============*
//      * Updates: ?variant=VARIANT_ID
//      * without reloading the page.============*/

//     updateBrowserUrl(
//         variant
//     );


//     /*============* MODULE 3 — ADD TO CART=============*
//        * Updates:
//      * - Add to cart
//      * - Sold out
//      * - Unavailable========*/

//     if (addButton) {
//         updateAddToCartButton( addButton, variant );
//     }
//     /*======   * MODULE 2.2.7 — SKU SYNCHRONIZATION========*
//      * Updates the product SKU whenever the selected
//      * variant changes.===========*/

//     updateProductSku(product);

//     /*====== MODULE 2.2.8 — INVENTORY SYNCHRONIZATION ======*
//     * Updates: * - Stock status * - Inventory quantity * - Low stock message =========*/

//     updateProductInventory(product);

//     /*====== MODULE 2.2.9 — COMPARE PRICE & SAVINGS ======*
//     * Updates:  - Compare-at price - Savings amount - Savings percentage ====*/

//     updateProductComparePrice(product);

// });


// /*============ UPDATE HIDDEN VARIANT ID========*/

// function updateVariantId(form, variant) {

//     /*-------- Find hidden variant input---------*/

//     const input = form.querySelector(
//         ".product-variant-id"
//     );

//    /*------------ Safety Check---------------*/
//     if (!input || !variant) return;

//     /*-------------- Update Variant ID--------------*/
//     input.value = variant.id;

// }
// /*================* UPDATE BROWSER URL==============*/

// function updateBrowserUrl(variant) {
//     /*---------- * No Variant--------------*/
//     if (!variant) return;
//     /*------------------------- Get Current URL----------*/

//     const url = new URL(
//         window.location.href
//     );
//     /*--------------* Update Variant Parameter---------------*/
//     url.searchParams.set(
//         "variant",
//         variant.id
//     );
//     /*---------------- Update URL Without Page Reload-------*/
//     window.history.replaceState(
//         {},
//         "",
//         url
//     );
// }


// /*=============UPDATE ADD TO CART BUTTON============*/

// function updateAddToCartButton(button, variant) {

//    /*-------------* Button Text Element-------------*/
//     const buttonText = button.querySelector(
//         "span"
//     );

//     if (!buttonText) return;
//     /*------------- VARIANT NOT FOUND-------------*/

//     if (!variant) {
//         button.disabled = true;
//         buttonText.textContent =
//             "Unavailable";
//         return;
//     }
//     /*-----------------* SOLD OUT--------------*/

//     if (!variant.available) {
//         button.disabled = true;
//         buttonText.textContent =
//             "Sold Out";
//         return;
//     }
//    /*----------------- AVAILABLE------------------*/
//     button.disabled = false;
//     buttonText.textContent =
//         "Add to cart";
// }


// /*=====* MODULE 2.2.7 — UPDATE PRODUCT SKU===========*
//  * Finds the SKU elements inside the current product
//  * wrapper and synchronizes them with the selected variant.
//  * HTML expected from:
//  * snippets/custom-product-info.liquid
//  * Example:
//  *     <div data-product-sku>
//  *         <span data-product-sku-value></span>
//  *     </div>============*/

// function updateProductSku(product) {
//     /*------------* Safety Check--------------------------*/
//     if (!product) return;
//     /*-------------- * Find SKU Wrapper------------------*/
//     const skuWrapper = product.querySelector(
//         "[data-product-sku]"
//     );
//     /*----------------- Find SKU Value-------------------*/
//     const skuValue = product.querySelector(
//         "[data-product-sku-value]"
//     );
//     /*-------------* Required Elements Not Found-----------*/
//     if (!skuWrapper || !skuValue) return;
//     /*------------ Get Current Variant SKU---------------*
//      * IMPORTANT:
//      * We do NOT use:
//      *  variant.sku
//      * here.
//      * Instead we use the centralized helper:
//      * getCurrentVariantSku()
//      * This keeps the synchronization architecture
//      * reusable for future modules.------------------*/

//     const sku = getCurrentVariantSku();
//    /*------------------ * SKU EMPTY-------------*
//      * If the selected variant does not have a SKU:
//      * - Clear the old SKU
//      * - Hide the SKU wrapper--------------------------*/

//     if (!sku) {
//         skuValue.textContent = "";
//         skuWrapper.hidden = true;
//         return;
//     }
//     /*----------- * SKU AVAILABLE-------------------*
//      * Display the new SKU.-----------------*/
//     skuValue.textContent = sku;
//     skuWrapper.hidden = false;
// }

// /*=========================================================*
//  * 5. UPDATE PRODUCT INVENTORY
//  * Module 2.2.8
//  *
//  * Updates:
//  * - In stock
//  * - Low stock
//  * - Out of stock
//  * - Unavailable
//  * - Inventory quantity
//  *=========================================================*/

// function updateProductInventory(product) {

//     if (!product) return;


//     /*---------------------------------------------------------*
//      * Find Inventory Elements
//      *---------------------------------------------------------*/

//     const inventoryWrapper = product.querySelector(
//         "[data-product-inventory]"
//     );

//     const inventoryBadge = product.querySelector(
//         "[data-inventory-badge]"
//     );

//     const inventoryText = product.querySelector(
//         "[data-inventory-text]"
//     );


//     /*---------------------------------------------------------*
//      * Safety Check
//      *---------------------------------------------------------*/

//     if (
//         !inventoryWrapper ||
//         !inventoryBadge ||
//         !inventoryText
//     ) {
//         return;
//     }


//     /*---------------------------------------------------------*
//      * Get Current Variant
//      *
//      * IMPORTANT:
//      * We use the central Variant State.
//      *=========================================================*/

//     const variant = getCurrentVariant();


//     /*---------------------------------------------------------*
//      * Reset Inventory State
//      *=========================================================*/

//     inventoryWrapper.hidden = true;

//     inventoryWrapper.classList.remove(
//         "is-in-stock",
//         "is-low-stock",
//         "is-out-of-stock",
//         "is-unavailable"
//     );

//     inventoryText.textContent = "";


//     /*---------------------------------------------------------*
//      * No Variant
//      *=========================================================*/

//     if (!variant) {
//         return;
//     }


//     /*---------------------------------------------------------*
//      * Variant Unavailable
//      *=========================================================*/

//     if (!variant.available) {

//         inventoryWrapper.classList.add(
//             "is-unavailable"
//         );
//         inventoryText.textContent = "Unavailable";
//         inventoryWrapper.hidden = false;
//         return;
//     }


//     /*---------------------------------------------------------*
//      * Get Inventory Quantity
//      *
//      * IMPORTANT:
//      * Use the helper instead of directly accessing
//      * variant.inventory_quantity.
//      *=========================================================*/

//     const quantity = getCurrentVariantInventory();

//     /*---------------------------------------------------------*
//      * Inventory Quantity Not Available
//      * Example:
//      * inventory_quantity = null
//      * In this situation we know the variant is available,
//      * but we do not have a usable quantity.
//      *=========================================================*/

//     if (
//         quantity === null ||
//         quantity === undefined
//     ) {

//         inventoryWrapper.classList.add(
//             "is-in-stock"
//         );

//         inventoryText.textContent = "In stock";
//         inventoryWrapper.hidden = false;
//         return;
//     }


//     /*---------------------------------------------------------*
//      * Out Of Stock
//      *=========================================================*/

//     if (quantity <= 0) {

//         inventoryWrapper.classList.add(
//             "is-out-of-stock"
//         );

//         inventoryText.textContent = "Out of stock";

//         inventoryWrapper.hidden = false;

//         return;
//     }


//     /*---------------------------------------------------------*
//      * Low Stock Threshold
//      *
//      * Example:
//      * 5 = show low-stock message when quantity <= 5
//      *=========================================================*/

//     const lowStockThreshold = 5;


//     /*---------------------------------------------------------*
//      * Low Stock
//      *=========================================================*/

//     if (quantity <= lowStockThreshold) {

//         inventoryWrapper.classList.add(
//             "is-low-stock"
//         );

//         inventoryText.textContent =
//             `Only ${quantity} left in stock`;

//         inventoryWrapper.hidden = false;

//         return;
//     }


//     /*---------------------------------------------------------*
//      * Normal Stock
//      *=========================================================*/

//     inventoryWrapper.classList.add(
//         "is-in-stock"
//     );

//     inventoryText.textContent = "In stock";

//     inventoryWrapper.hidden = false;
// }

// /*================* VARIANT HELPERS===============*
//  * These helpers provide a single reusable API for all
//  * future synchronization modules.================*/
// /*================* GET CURRENT VARIANT===========*
//  * Returns the currently selected variant.============*/

// function getCurrentVariant() {
//     return window.currentVariant;
// }
// /*============ HAS CURRENT VARIANT=====
//  * Returns true when a variant is currently selected.======*/

// function hasCurrentVariant() {
//     return window.currentVariant !== null;
// }

// /*================= * CURRENT VARIANT ID===========*/

// function getCurrentVariantId() {
//     const variant =
//         getCurrentVariant();
//     if (!variant) return null;
//     return variant.id;
// }
// /*========== * CURRENT VARIANT AVAILABILITY==============*/

// function isCurrentVariantAvailable() {
//     const variant =
//         getCurrentVariant();

//     if (!variant) return false;
//     return variant.available;
// }
// /*=============== * CURRENT VARIANT MEDIA============*/

// function getCurrentVariantMedia() {
//     const variant =
//         getCurrentVariant();

//     if (!variant) return null;
//     return variant.featured_media;
// }
// /*==============* CURRENT VARIANT PRICE===============*/

// function getCurrentVariantPrice() {
//     const variant =
//         getCurrentVariant();
//     if (!variant) return 0;
//     return variant.price;
// }
// /*============= CURRENT VARIANT COMPARE-AT PRICE=========*/

// function getCurrentVariantComparePrice() {
//     const variant =
//         getCurrentVariant();

//     if (!variant) return 0;
//     return variant.compare_at_price;
// }
// /*=============== * CURRENT VARIANT SKU===========*/

// function getCurrentVariantSku() {
//     const variant =
//         getCurrentVariant();
//     if (!variant) return "";
//     return variant.sku || "";
// }
// /*============= * CURRENT VARIANT INVENTORY============*/

// function getCurrentVariantInventory() {
//     const variant = getCurrentVariant();
//     if (!variant) return null;
//     return variant.inventory_quantity;
// }
// /*============= * MODULE — UPDATE FEATURED MEDIA======*
//  * Changes the main Swiper media according to:
//  *     variant.featured_media.id==================*/

// function updateFeaturedMedia(product, variant) {
//     /*-----------------* Safety Checks----------------*/
//     if (
//         !product ||
//         !variant ||
//         !variant.featured_media
//     ) {
//         return;
//     }
//     /*----------  * Check Main Swiper---------------------*/

//     if (!window.productMainSwiper) {
//         console.warn(
//             "Main Swiper not found"
//         );
//         return;
//     }
//     /*------------  * Get Variant Media ID---------------*/
//     const mediaId =
//         String(
//             variant.featured_media.id
//         );
//     /*---------------- Find Main Slider Slides--------------*/
//     const slides =
//         product.querySelectorAll(
//             ".productMediaSlider .swiper-slide"
//         );
//     let slideIndex = -1;
//     /*-------------------- Find Matching Media Slide-------*/

//     slides.forEach(
//         (slide, index) => {
//             const mediaData =
//                 slide.dataset.mediaId;
//             if (!mediaData) return;
//             const currentId =
//                 mediaData
//                     .split("-")
//                     .pop();
//             if (
//                 currentId === mediaId
//             ) {
//                 slideIndex = index;
//             }
//         }
//     );
//     /*-------------------- * Navigate Main Swiper------------*/

//     if (slideIndex >= 0) {
//         window.productMainSwiper.slideToLoop(
//             slideIndex,
//             500
//         );
//     }
// } 

