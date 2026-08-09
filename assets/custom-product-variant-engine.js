class CustomVariantEngine {

  constructor(wrapper) {

    // Current Variant Picker Wrapper
    this.wrapper = wrapper;

    // Current Product Form
    this.form = wrapper.closest("form");

    // Variant JSON
    const productData = JSON.parse(
      wrapper.querySelector(".custom-product-variant__json").textContent
    );

this.variantData = productData.variants;
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

  // console.log("Selected Options:", selectedOptions);

  const variant = this.findVariant(selectedOptions);

  // console.log("Matched Variant:", variant);

  if (!variant) return;

  this.updateVariantId(variant);
  this.updateOptionAvailability();

}


/*================ Get Available Variants =============*/

getAvailableVariants(selectedOptions) {

    return this.variantData.filter((variant) => {

        return variant.available;

    });

}


/*============= Find Matching Variants =================*/

findMatchingVariants(selectedOptions, optionIndex) {

    return this.variantData.filter((variant) => {

        if (!variant.available) return false;

        return selectedOptions.every((selectedValue, index) => {

            if (index === optionIndex)
                return true;

            if (!selectedValue)
                return true;

            return variant.options[index] === selectedValue;

        });

    });

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

  return this.variantData.find((variant) => {

    return variant.options.every((option, index) => {

      return option === selectedOptions[index];

    });

  });

}



  updateVariantId(variant) {
//  console.log("Updating Variant ID:", variant.id);
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


/*================ Update Option Availability ===========*/
updateOptionAvailability() {

    this.updateButtonAvailability();
    this.updateDropdownAvailability();

}


/*=========== Update Button Availability ===============*/

updateButtonAvailability() {

    const fieldsets =
        this.wrapper.querySelectorAll(
            ".custom-product-variant__option"
        );

    fieldsets.forEach((fieldset, optionIndex) => {

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

            const testOptions = [...selectedOptions];

            testOptions[optionIndex] = radio.value;

            const available =
                this.isOptionAvailable(
                    testOptions,
                    optionIndex
                );

            label.classList.toggle(
                "is-unavailable",
                !available
            );

            radio.disabled = !available;

        });

    });

}

/*===============  Update Dropdown Availability===================*/

updateDropdownAvailability() {

    const fieldsets =
        this.wrapper.querySelectorAll(
            ".custom-product-variant__option"
        );

    fieldsets.forEach((fieldset, optionIndex) => {

        const selectedOptions =
            this.getSelectedOptions();

        const items =
            fieldset.querySelectorAll(
                ".custom-product-variant__dropdown-item"
            );

        items.forEach((item) => {

            const testOptions = [...selectedOptions];

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
                !available
            );

        });

    });

}


/*=================Is Option Available=================*/

isOptionAvailable(testOptions, optionIndex) {

    return this.variantData.some((variant) => {

        if (!variant.available)
            return false;

        return variant.options.every(
            (option, index) => {

                if (index === optionIndex)
                    return option === testOptions[index];

                if (!testOptions[index])
                    return true;

                return option === testOptions[index];

            }
        );

    });

}




} // ← Class ends here



document.addEventListener("DOMContentLoaded", () => {

  document
    .querySelectorAll(".custom-product-variant-picker")
    .forEach((picker) => {

      new CustomVariantEngine(picker);

    });

});