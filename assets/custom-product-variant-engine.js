/*=========================================================*
 * CUSTOM VARIANT ENGINE
 *=========================================================*
 *
 * Supports:
 *
 * - Dropdown
 * - Buttons / Radio
 * - Future Swatches
 *
 * All controls use the same variant engine.
 *
 * Control
 *   ↓
 * Option Change
 *   ↓
 * Selected Options
 *   ↓
 * Matching Variant
 *   ↓
 * Hidden Variant ID
 *   ↓
 * variant:change
 *   ↓
 * Price / Media / SKU / Inventory / Compare Price
 *
 *=========================================================*/

class CustomVariantEngine {

  /*=========================================================*
   * 1. INITIALIZATION
   *=========================================================*/

  constructor(wrapper) {

    // Current product variant-picker wrapper
    this.wrapper = wrapper;

    // Current product form
    this.form = wrapper.closest("form");

    // Safety check
    if (!this.form) {
      console.warn(
        "CustomVariantEngine: Product form not found."
      );
      return;
    }

    // Product variant JSON
    const jsonElement =
      wrapper.querySelector(
        ".custom-product-variant__json"
      );

    if (!jsonElement) {
      console.warn(
        "CustomVariantEngine: Variant JSON not found."
      );
      return;
    }

    const productData =
      JSON.parse(
        jsonElement.textContent
      );

    // Store all product variants
    this.variantData =
      productData.variants || [];

    // Product ID
    this.productId =
      productData.productId;

    // Hidden Shopify variant ID input
    this.variantIdInput =
      this.form.querySelector(
        ".custom-product-variant__variant-id"
      );

    // Start engine
    this.init();
  }


  /*=========================================================*
   * 2. INITIALIZE ENGINE
   *=========================================================*/

  init() {

    this.bindEvents();

    /*
     * Synchronize availability on initial page load.
     *
     * This does NOT change the selected variant.
     */
    this.updateOptionAvailability();
  }


  /*=========================================================*
   * 3. BIND ALL VARIANT CONTROL EVENTS
   *=========================================================*
   *
   * Dropdown:
   *   hidden input → change event
   *
   * Buttons:
   *   radio input → change event
   *
   * Future swatches:
   *   should also update an input and dispatch
   *   a change event.
   *
   * Therefore the engine does not care whether the
   * visual control is dropdown, button or swatch.
   *=========================================================*/

  bindEvents() {

    const optionInputs =
      this.form.querySelectorAll(
        '[name^="options["]'
      );

    optionInputs.forEach((input) => {

      input.addEventListener(
        "change",
        () => {

          this.onOptionChange();

        }
      );

    });
  }


  /*=========================================================*
   * 4. OPTION CHANGE
   *=========================================================*/

  onOptionChange() {

    /*
     * Get the current selected option values.
     *
     * Example:
     *
     * [
     *   "Black",
     *   "Large"
     * ]
     */
    const selectedOptions =
      this.getSelectedOptions();

    // Find matching Shopify variant
    const variant =
      this.findVariant(
        selectedOptions
      );

    /*
     * No matching variant.
     *
     * Do not dispatch variant:change.
     */
    if (!variant) {

      console.warn(
        "CustomVariantEngine: Matching variant not found.",
        selectedOptions
      );

      return;
    }


    /*
     * Update Shopify hidden variant ID
     * and dispatch the central event.
     */
    this.updateVariantId(
      variant
    );


    /*
     * Update availability of all
     * variant controls.
     */
    this.updateOptionAvailability();
  }


  /*=========================================================*
   * 5. GET SELECTED OPTIONS
   *=========================================================*
   *
   * IMPORTANT:
   *
   * We read only the currently selected value
   * for each option position.
   *
   * This makes the engine work correctly with:
   *
   * - Radio buttons
   * - Dropdown hidden inputs
   * - Future swatches
   *
   * Example:
   *
   * Option 1 = Black
   * Option 2 = Large
   *
   * Result:
   *
   * ["Black", "Large"]
   *
   *=========================================================*/
getSelectedOptions() {

  const values = [];

  const fieldsets =
    this.wrapper.querySelectorAll(
      ".custom-product-variant__option"
    );

  fieldsets.forEach((fieldset, index) => {

    /*
     * RADIO BASED PICKERS
     * Buttons + Swatches
     */
    const checked =
      fieldset.querySelector(
        'input[type="radio"][name^="options["]:checked'
      );

    if (checked) {

      values[index] = checked.value;

      return;

    }


    /*
     * DROPDOWN
     * Hidden input stores the selected value.
     */
    const hiddenInput =
      fieldset.querySelector(
        'input[type="hidden"][name^="options["]'
      );

    if (hiddenInput) {

      values[index] = hiddenInput.value;

      return;

    }


    /*
     * FINAL FALLBACK
     */
    const selectedItem =
      fieldset.querySelector(
        ".custom-product-variant__dropdown-item.selected"
      );

    if (selectedItem) {

      values[index] =
        selectedItem.dataset.value;

    }

  });

  return values;

}


  /*=========================================================*
   * 6. FIND MATCHING VARIANT
   *=========================================================*/

  findVariant(selectedOptions) {

    return this.variantData.find(
      (variant) => {

        return variant.options.every(
          (optionValue, index) => {

            return (
              optionValue ===
              selectedOptions[index]
            );

          }
        );

      }
    );
  }


  /*=========================================================*
   * 7. UPDATE HIDDEN VARIANT ID
   *=========================================================*/

  updateVariantId(variant) {

    if (!this.variantIdInput) {
      console.warn(
        "CustomVariantEngine: Hidden variant ID input not found."
      );
      return;
    }

    /*
     * Update:
     *
     * <input name="id">
     *
     * Shopify will therefore know which
     * variant should be added to cart.
     */
    this.variantIdInput.value =
      variant.id;


    /*
     * Notify all other product modules.
     *
     * Price
     * Media
     * SKU
     * Inventory
     * Compare Price
     *
     * all listen to this event.
     */
    this.dispatchVariantChange(
      variant
    );
  }


  /*=========================================================*
   * 8. CENTRAL VARIANT CHANGE EVENT
   *=========================================================*/

  dispatchVariantChange(variant) {

    document.dispatchEvent(
      new CustomEvent(
        "variant:change",
        {
          detail: {

            variant: variant,

            productForm: this.form,

            picker: this.wrapper,

            productId: this.productId

          }
        }
      )
    );
  }


  /*=========================================================*
   * 9. UPDATE OPTION AVAILABILITY
   *=========================================================*/

 updateOptionAvailability() {

  this.updateButtonAvailability();

  this.updateDropdownAvailability();

  this.updateSwatchAvailability();

}


  /*=========================================================*
   * 10. BUTTON AVAILABILITY
   *=========================================================*/

  updateButtonAvailability() {

    const fieldsets =
      this.wrapper.querySelectorAll(
        ".custom-product-variant__option"
      );

    fieldsets.forEach(
      (fieldset, optionIndex) => {

        const selectedOptions =
          this.getSelectedOptions();

        const labels =
          fieldset.querySelectorAll(
            ".custom-product-variant__button"
          );

        labels.forEach((label) => {

          const radio =
            document.getElementById(
              label.getAttribute("for")
            );

          if (!radio) return;

          const testOptions =
            [...selectedOptions];

          /*
           * Test this button's value
           * against the other selected options.
           */
          testOptions[optionIndex] =
            radio.value;

          const available =
            this.isOptionAvailable(
              testOptions,
              optionIndex
            );

          label.classList.toggle(
            "is-unavailable",
            !available
          );

          radio.disabled =
            !available;

        });

      }
    );
  }


  /*=========================================================*
   * 11. DROPDOWN AVAILABILITY
   *=========================================================*/

  updateDropdownAvailability() {

    const fieldsets =
      this.wrapper.querySelectorAll(
        ".custom-product-variant__option"
      );

    fieldsets.forEach(
      (fieldset, optionIndex) => {

        const selectedOptions =
          this.getSelectedOptions();

        const items =
          fieldset.querySelectorAll(
            ".custom-product-variant__dropdown-item"
          );

        items.forEach((item) => {

          const testOptions =
            [...selectedOptions];

          testOptions[optionIndex] =
            item.dataset.value;

          const available =
            this.isOptionAvailable(
              testOptions,
              optionIndex
            );

          item.classList.toggle(
            "is-unavailable",
            !available
          );

          item.setAttribute(
            "aria-disabled",
            String(!available)
          );

        });

      }
    );
  }

  /*=========================================================
 * 12. SWATCH AVAILABILITY
 *=========================================================*/

updateSwatchAvailability() {

  const fieldsets =
    this.wrapper.querySelectorAll(
      ".custom-product-variant__option"
    );

  fieldsets.forEach(
    (fieldset, optionIndex) => {

      const selectedOptions =
        this.getSelectedOptions();

      const swatches =
        fieldset.querySelectorAll(
          ".custom-product-variant__swatch"
        );

      swatches.forEach((swatch) => {

        const input =
          document.getElementById(
            swatch.getAttribute("for")
          );

        if (!input) return;

        const testOptions =
          [...selectedOptions];

        testOptions[optionIndex] =
          input.value;

        const available =
          this.isOptionAvailable(
            testOptions,
            optionIndex
          );

        swatch.classList.toggle(
          "is-unavailable",
          !available
        );

        input.disabled =
          !available;

      });

    }
  );
}

  /*=========================================================*
   * 13. CHECK OPTION AVAILABILITY
   *=========================================================*/

  isOptionAvailable(
    testOptions,
    optionIndex
  ) {

    return this.variantData.some(
      (variant) => {

        /*
         * Ignore unavailable variants.
         */
        if (!variant.available) {
          return false;
        }

        return variant.options.every(
          (optionValue, index) => {

            /*
             * Test the option currently
             * being checked.
             */
            if (
              index === optionIndex
            ) {

              return (
                optionValue ===
                testOptions[index]
              );
            }


            /*
             * Ignore an unselected option.
             */
            if (
              !testOptions[index]
            ) {

              return true;
            }


            /*
             * Other selected options
             * must match.
             */
            return (
              optionValue ===
              testOptions[index]
            );

          }
        );

      }
    );
  }

}


/*=========================================================*
 * INITIALIZE ALL PRODUCT VARIANT PICKERS
 *=========================================================*/

document.addEventListener(
  "DOMContentLoaded",
  () => {

    document
      .querySelectorAll(
        ".custom-product-variant-picker"
      )
      .forEach((picker) => {

        new CustomVariantEngine(
          picker
        );

      });

  }
);