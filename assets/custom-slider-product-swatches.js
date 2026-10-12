
(() => {
  if (window.customSliderProductSwatchesLoaded) return;
  window.customSliderProductSwatchesLoaded = true;

  document.addEventListener("click", (event) => {
    const swatch = event.target.closest("[data-card-swatch]");

    if (!swatch || swatch.disabled) return;

    const card = swatch.closest(".custom-slider-product-card");
    if (!card) return;

    const variantId = swatch.dataset.variantId;
    const price = Number(swatch.dataset.price);
    const comparePrice = Number(swatch.dataset.comparePrice || 0);
    const imageUrl = swatch.dataset.image;
    const available = swatch.dataset.available === "true";

    if (!variantId || !Number.isFinite(price)) return;

    // Store the selected variant for future quick-add functionality.
    card.dataset.selectedVariantId = variantId;
    card.dataset.selectedVariantAvailable = String(available);

    // Update the selected swatch.
    card.querySelectorAll("[data-card-swatch]").forEach((button) => {
      const isSelected = button === swatch;

      button.classList.toggle("is-active", isSelected);
      button.setAttribute("aria-pressed", String(isSelected));
    });

    // Update the main product image if this variant has an image.
    if (imageUrl) {
      const image = card.querySelector(
        ".custom-slider-product-card__image"
      );

      if (image) {
        image.src = imageUrl;
        image.removeAttribute("srcset");
        image.alt = swatch.getAttribute("aria-label") || image.alt;
      }
    }

    // Format prices using Shopify's theme money format when available.
    const formatPrice = (cents) => {
      if (
        window.Shopify &&
        typeof window.Shopify.formatMoney === "function"
      ) {
        return window.Shopify.formatMoney(
          cents,
          window.Shopify.money_format
        );
      }

      const currency = window.Shopify?.currency?.active || "USD";

      return new Intl.NumberFormat(
        document.documentElement.lang || "en",
        {
          style: "currency",
          currency
        }
      ).format(cents / 100);
    };

    // Update the current price.
    const priceElement = card.querySelector("[data-card-price]");

    if (priceElement) {
      priceElement.textContent = formatPrice(price);
    }

    // Update or hide the compare-at price.
    const compareElement = card.querySelector(
      "[data-card-compare-price]"
    );

    if (compareElement) {
      if (comparePrice > price) {
        compareElement.textContent = formatPrice(comparePrice);
        compareElement.hidden = false;
      } else {
        compareElement.textContent = "";
        compareElement.hidden = true;
      }
    }
  });
})();
