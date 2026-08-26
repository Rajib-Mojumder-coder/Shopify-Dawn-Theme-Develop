// ============================================
// SIMPLIFIED CUSTOM PRODUCT PRICE
// ============================================

(function() {
  'use strict';

  // Utility: Format money
  function formatMoney(amount) {
    amount = parseFloat(amount);
    if (isNaN(amount)) return '$0.00';
    return '$' + (amount / 100).toFixed(2);
  }

  // Utility: Calculate savings percentage
  function getSavingsPercentage(comparePrice, currentPrice) {
    if (!comparePrice || comparePrice <= currentPrice) return 0;
    return Math.round(((comparePrice - currentPrice) / comparePrice) * 100);
  }

  // Main variant update handler
  document.addEventListener('variant:change', function(event) {
    const variant = event.detail.variant;
    const productForm = event.detail.productForm;
    
    if (!variant || !productForm) return;
    
    const product = productForm.closest('.product') || productForm.closest('[data-product]');
    if (!product) return;

    // Update selling price
    const priceElement = product.querySelector('[data-product-price]');
    if (priceElement) {
      priceElement.textContent = formatMoney(variant.price);
    }

    // Update compare price
    const comparePriceElement = product.querySelector('[data-compare-price]');
    if (comparePriceElement) {
      const onSale = variant.compare_at_price && variant.compare_at_price > variant.price;
      if (onSale) {
        comparePriceElement.textContent = formatMoney(variant.compare_at_price);
        comparePriceElement.style.display = '';
      } else {
        comparePriceElement.style.display = 'none';
      }
    }

    // --- SALE BADGE UPDATE ---
    const priceContainer = product.querySelector('[data-product-price-scope]');
    if (priceContainer) {
      const displayElement = priceContainer.querySelector('[data-price-display]');
      const template = priceContainer.querySelector(`[data-variant-price-template="${variant.id}"]`);
      
      if (template && displayElement) {
        const content = template.content.cloneNode(true);
        const newBadge = content.querySelector('[data-sale-badge]');
        const oldBadge = displayElement.querySelector('[data-sale-badge]');
        
        // Update badge
        if (newBadge) {
          if (oldBadge) {
            oldBadge.replaceWith(newBadge);
          } else {
            displayElement.appendChild(newBadge);
          }
        } else if (oldBadge) {
          oldBadge.remove();
        }
        
        // Update savings amount and percentage
        const savingsAmount = displayElement.querySelector('[data-savings-amount]');
        const savingsPercentage = displayElement.querySelector('[data-savings-percentage]');
        const onSale = variant.compare_at_price && variant.compare_at_price > variant.price;
        
        if (savingsAmount) {
          if (onSale) {
            const savings = variant.compare_at_price - variant.price;
            savingsAmount.textContent = `Save ${formatMoney(savings)}`;
            savingsAmount.style.display = '';
          } else {
            savingsAmount.style.display = 'none';
          }
        }
        
        if (savingsPercentage) {
          if (onSale) {
            const percent = getSavingsPercentage(variant.compare_at_price, variant.price);
            savingsPercentage.textContent = `${percent}% OFF`;
            savingsPercentage.style.display = '';
          } else {
            savingsPercentage.style.display = 'none';
          }
        }
      }
    }
  });

  console.log('Custom Product Price initialized');
})();

// document.addEventListener("variant:change", function (event) {
// //   console.log("variant:change fired");
//   // Current selected variant
//   const variant = event.detail.variant;

//   // Current product form
//   const productForm = event.detail.productForm;

//   // Product wrapper
//   const product = productForm.closest(".product");

//   if (!product) return;

//   // Selling price element
//   const priceElement =
//     product.querySelector("[data-product-price]");

//   // Compare price element
//   const comparePriceElement =
//     product.querySelector("[data-compare-price]");



//   /*------------------------------------
//       Update Selling Price
//   -------------------------------------*/

//   if (priceElement) {

//     priceElement.textContent = CustomProductUtils.formatMoney(
//     variant.price
//         )

//   }



//  /*------------------------------------
//       Update Compare Price
// -------------------------------------*/

// if (comparePriceElement) {

//     if (variant.compare_at_price > variant.price) {

//         comparePriceElement.textContent =
//             CustomProductUtils.formatMoney(
//                     variant.compare_at_price
//                 )

//         comparePriceElement.style.display = "";

//     } else {

//         comparePriceElement.style.display = "none";

//     }

// }

// });