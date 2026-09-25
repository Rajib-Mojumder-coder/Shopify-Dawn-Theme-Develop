/*=========================================================
 * CUSTOM PRODUCT PRICE
 *=========================================================
 *
 * Listens to:
 *
 *   variant:change
 *
 * Updates:
 *
 * - Current price
 * - Compare-at price
 * - Sale badge
 * - Sale percentage
 * - Savings amount
 *
 * Designed for:
 *
 * <product-info>
 *
 * and the custom variant engine.
 *
 *=========================================================*/

(function () {

  'use strict';


  /*=========================================================
   * 1. FORMAT MONEY
   *=========================================================*/

  function formatMoney(amount, format) {

    amount = Number(amount);

    if (!Number.isFinite(amount)) {
      return '';
    }


    /*
     * Shopify's native formatter.
     *
     * This preserves the store's currency
     * and money formatting.
     */
    if (
      typeof Shopify !== 'undefined' &&
      typeof Shopify.formatMoney === 'function'
    ) {

      return Shopify.formatMoney(
        amount,
        format
      );

    }


    /*
     * Fallback
     *
     * Used only if Shopify.formatMoney
     * is unavailable.
     */
    return (amount / 100).toFixed(2);

  }


  /*=========================================================
   * 2. ROUND PRICE
   *=========================================================*/

  function roundPrice(amount) {

    amount = Number(amount);

    if (!Number.isFinite(amount)) {
      return amount;
    }

    /*
     * Liquid equivalent:
     *
     * price
     * | divided_by: 100.0
     * | round
     * | times: 100
     *
     * Example:
     *
     * 1299 → 1300
     * 1249 → 1200
     */
    return Math.round(amount / 100) * 100;

  }


  /*=========================================================
   * 3. SALE PERCENTAGE
   *=========================================================*/

  function getSalePercentage(
    comparePrice,
    currentPrice
  ) {

    comparePrice = Number(comparePrice);
    currentPrice = Number(currentPrice);

    if (
      !comparePrice ||
      comparePrice <= currentPrice
    ) {

      return 0;

    }

    return Math.round(
      (
        (comparePrice - currentPrice)
        / comparePrice
      ) * 100
    );

  }


  /*=========================================================
   * 4. FIND PRODUCT INFO
   *=========================================================*/

  function getProductInfo(productForm) {

    if (!productForm) {
      return null;
    }


    /*
     * Your custom product architecture.
     */
    const productInfo =
      productForm.closest('product-info');


    if (productInfo) {
      return productInfo;
    }


    /*
     * Fallback for reusable environments.
     */
    return (
      productForm.closest('[data-product]')
      ||
      productForm.closest('.product')
      ||
      null
    );

  }


  /*=========================================================
   * 5. UPDATE ONE PRICE BLOCK
   *=========================================================*/

  function updatePriceBlock(
    priceBlock,
    variant
  ) {

    if (!priceBlock || !variant) {
      return;
    }


    /*-------------------------------------------------------
     * SETTINGS
     *-------------------------------------------------------*/

    const roundPriceEnabled =
      priceBlock.dataset.roundPrice === 'true';


    const priceFormat =
      priceBlock.dataset.priceFormat ||
      'money';


    const showCurrentPrice =
      priceBlock.dataset.showCurrentPrice === 'true';


    const showComparePrice =
      priceBlock.dataset.showComparePrice === 'true';


    const hideCompareWithoutDiscount =
      priceBlock.dataset.hideCompareWithoutDiscount === 'true';


    const showSaleBadge =
      priceBlock.dataset.showSaleBadge === 'true';


    const saleBadgeType =
      priceBlock.dataset.saleBadgeType ||
      'percentage';


    const saleBadgePosition =
      priceBlock.dataset.saleBadgePosition ||
      'inline';


    /*-------------------------------------------------------
     * VARIANT PRICES
     *-------------------------------------------------------*/

    let currentPrice =
      Number(variant.price);


    let comparePrice =
      variant.compare_at_price != null
        ? Number(variant.compare_at_price)
        : null;


    /*
     * Apply same rounding logic
     * as the Liquid block.
     */
    if (roundPriceEnabled) {

      currentPrice =
        roundPrice(currentPrice);


      if (comparePrice !== null) {

        comparePrice =
          roundPrice(comparePrice);

      }

    }


    /*-------------------------------------------------------
     * DISCOUNT
     *-------------------------------------------------------*/

    const hasDiscount =
      comparePrice !== null &&
      comparePrice > currentPrice;


    const savingsAmount =
      hasDiscount
        ? comparePrice - currentPrice
        : 0;


    const salePercentage =
      hasDiscount
        ? getSalePercentage(
            comparePrice,
            currentPrice
          )
        : 0;


    /*-------------------------------------------------------
     * CURRENT PRICE
     *-------------------------------------------------------*/

    const currentPriceElement =
      priceBlock.querySelector(
        '[data-product-price]'
      );


    if (
      currentPriceElement &&
      showCurrentPrice
    ) {

      currentPriceElement.innerHTML =
        formatMoney(
          currentPrice,
          priceBlock.dataset.moneyFormat
        );

    }


    /*-------------------------------------------------------
     * COMPARE PRICE
     *-------------------------------------------------------*/

    const comparePriceElement =
      priceBlock.querySelector(
        '[data-product-compare-price]'
      );


    if (comparePriceElement) {

      /*
       * If compare price exists and
       * discount exists.
       */
      if (
        showComparePrice &&
        comparePrice !== null &&
        (
          hasDiscount ||
          !hideCompareWithoutDiscount
        )
      ) {

        comparePriceElement.innerHTML =
          formatMoney(
            comparePrice,
            priceBlock.dataset.moneyFormat
          );


        comparePriceElement.hidden =
          false;

      }

      /*
       * Otherwise hide it.
       */
      else {

        comparePriceElement.hidden =
          true;

      }

    }


    /*-------------------------------------------------------
     * SALE BADGE
     *-------------------------------------------------------*/

    const saleBadge =
      priceBlock.querySelector(
        '[data-product-sale-badge]'
      );


    if (!saleBadge) {
      return;
    }


    /*
     * Hide badge when there is
     * no discount.
     */
    if (
      !showSaleBadge ||
      !hasDiscount
    ) {

      saleBadge.hidden = true;

      return;

    }


    /*-------------------------------------------------------
     * BADGE CONTENT
     *-------------------------------------------------------*/

    let badgeText = '';


    switch (saleBadgeType) {

      case 'text':

        badgeText = 'SALE';

        break;


      case 'percentage':

        badgeText =
          salePercentage + '% OFF';

        break;


      case 'amount':

        badgeText =
          'Save ' +
          formatMoney(
            savingsAmount,
            priceBlock.dataset.moneyFormat
          );

        break;

    }


    saleBadge.textContent =
      badgeText;


    saleBadge.hidden =
      false;


    /*
     * Position remains controlled
     * by the block class.
     */
    saleBadge.classList.remove(
      'product-price__badge--inline',
      'product-price__badge--top-right',
      'product-price__badge--top-left'
    );


    saleBadge.classList.add(
      'product-price__badge--' +
      saleBadgePosition
    );

  }


  /*=========================================================
   * 6. UPDATE ALL PRICE BLOCKS
   *=========================================================*/

  function updateProductPrices(
    productInfo,
    variant
  ) {

    if (
      !productInfo ||
      !variant
    ) {
      return;
    }


    /*
     * Important:
     *
     * We update only price blocks
     * belonging to this product.
     *
     * This prevents one product's
     * variant from changing another
     * product's price.
     */
    const priceBlocks =
      productInfo.querySelectorAll(
        '[data-product-price-block]'
      );


    priceBlocks.forEach(
      function (priceBlock) {

        updatePriceBlock(
          priceBlock,
          variant
        );

      }
    );

  }


  /*=========================================================
   * 7. VARIANT CHANGE EVENT
   *=========================================================*/

  document.addEventListener(
    'variant:change',
    function (event) {

      const detail =
        event.detail || {};


      const variant =
        detail.variant;


      const productForm =
        detail.productForm;


      if (
        !variant ||
        !productForm
      ) {

        return;

      }


      const productInfo =
        getProductInfo(
          productForm
        );


      if (!productInfo) {

        console.warn(
          'Custom Product Price: Product info not found.'
        );

        return;

      }


      updateProductPrices(
        productInfo,
        variant
      );

    }
  );


  console.log(
    'Custom Product Price initialized'
  );

})();