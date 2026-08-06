class CustomVariantEngine {

  constructor(wrapper) {

    // Current Variant Picker Wrapper
    this.wrapper = wrapper;

    // Current Product Form
    this.form = wrapper.closest("form");

    // Variant JSON
    this.variantData = JSON.parse(
      wrapper.querySelector(".custom-product-variant__json").textContent
    );
   
    // Hidden Variant ID Input
    this.variantIdInput = this.form.querySelector(
      ".custom-product-variant__variant-id"
    );

    // Initialize
    this.init();

  }


  init() {

    this.bindEvents();

  }


  bindEvents() {

    this.form
      .querySelectorAll('[name^="options["]')
      .forEach((input) => {

        input.addEventListener("change", () => {

          this.onOptionChange();

        });

      });

  }


  onOptionChange() {

    const selectedOptions = this.getSelectedOptions();

    const variant = this.findVariant(selectedOptions);

    if (!variant) return;

    this.updateVariantId(variant);

  }


  getSelectedOptions() {

    const values = [];

    this.form
      .querySelectorAll('[name^="options["]')
      .forEach((input) => {

        values.push(input.value);

      });

    return values;

  }


  findVariant(selectedOptions) {

  return this.variantData.variants.find((variant) => {

    return variant.options.every((option, index) => {

      return option === selectedOptions[index];

    });

  });

}


  updateVariantId(variant) {

    // Update hidden variant id
    this.variantIdInput.value = variant.id;

    // Notify rest of product page
    this.dispatchVariantChange(variant);

  }


  dispatchVariantChange(variant) {
   
    document.dispatchEvent(

      new CustomEvent("variant:change", {

        detail: {
          variant: variant,
          productForm: this.form,
          picker: this.wrapper
        }

      })

    );

  }

} // ← Class ends here



document.addEventListener("DOMContentLoaded", () => {

  document
    .querySelectorAll(".custom-product-variant-picker")
    .forEach((picker) => {

      new CustomVariantEngine(picker);

    });

});