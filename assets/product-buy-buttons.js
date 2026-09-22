(() => {
  'use strict';


  class ProductBuyButtons {

    constructor(container) {

      this.container = container;

      this.productInfo =
        container.closest('product-info');


      this.formId =
        container.dataset.productFormId;


      this.form =
        this.formId
          ? document.getElementById(
              this.formId
            )
          : null;


      this.variantInput =
        this.form
          ? this.form.querySelector(
              '.product-variant-id'
            )
          : null;


      this.addButton =
        container.querySelector(
          '[data-add-to-cart]'
        );


      this.addButtonText =
        container.querySelector(
          '[data-add-to-cart-text]'
        );


      this.loading =
        container.querySelector(
          '[data-add-to-cart-loading]'
        );


      this.dynamicCheckout =
        container.querySelector(
          '[data-dynamic-checkout]'
        );


      this.status =
        container.querySelector(
          '[data-buy-button-status]'
        );


      this.variants = [];


      this.lastVariantId =
        this.variantInput
          ? this.variantInput.value
          : '';


      this.loadVariants();

      this.bindEvents();

      this.updateVariantState();

    }


    /* =========================================
       LOAD VARIANTS
       ========================================= */

    loadVariants() {

      const json =
        this.container.querySelector(
          '.product-buy-buttons__variants'
        );


      if (!json) {
        return;
      }


      try {

        this.variants =
          JSON.parse(
            json.textContent
          );

      } catch (error) {

        console.warn(
          'Product buy button variant data could not be parsed.',
          error
        );

      }

    }


    /* =========================================
       EVENTS
       ========================================= */

    bindEvents() {


      /*
       * Native product form changes.
       */

      if (this.productInfo) {

        this.productInfo.addEventListener(
          'change',
          () => {

            window.setTimeout(
              () => {
                this.updateVariantState();
              },
              30
            );

          }
        );


        /*
         * Custom variant dropdown items.
         */

        this.productInfo.addEventListener(
          'click',
          event => {

            const variantControl =
              event.target.closest(
                '.custom-product-variant-picker'
              );


            if (!variantControl) {
              return;
            }


            window.setTimeout(
              () => {
                this.updateVariantState();
              },
              60
            );

          }
        );

      }


      /*
       * Keep the button synchronized when
       * the hidden variant input is changed
       * directly.
       */

      if (this.variantInput) {

        this.variantInput.addEventListener(
          'change',
          () => {

            this.updateVariantState();

          }
        );

      }


      /*
       * Product form submission.
       */

      if (this.form) {

        this.form.addEventListener(
          'submit',
          event => {

            this.handleSubmitState(
              event
            );

          }
        );

      }

    }


    /* =========================================
       GET SELECTED VARIANT
       ========================================= */

    getSelectedVariant() {

      if (!this.variantInput) {
        return null;
      }


      const variantId =
        String(
          this.variantInput.value
        );


      if (!variantId) {
        return null;
      }


      return this.variants.find(
        variant =>
          String(variant.id) ===
          variantId
      ) || null;

    }


    /* =========================================
       UPDATE VARIANT STATE
       ========================================= */

    updateVariantState() {

      const variant =
        this.getSelectedVariant();


      if (!variant) {
        return;
      }


      const variantId =
        String(variant.id);


      /*
       * Avoid unnecessary UI work.
       */

      if (
        variantId ===
        this.lastVariantId
      ) {
        return;
      }


      this.lastVariantId =
        variantId;


      const available =
        Boolean(
          variant.available
        );


      /*
       * Add to cart.
       */

      if (this.addButton) {

        this.addButton.disabled =
          !available;

      }


      /*
       * Button text.
       */

      if (this.addButtonText) {

        const availableText =
          this.container.dataset
            .availableText;


        const soldOutText =
          this.container.dataset
            .soldOutText;


        /*
         * We use the current Liquid-rendered
         * text when possible. Only update to
         * a sold-out state here.
         */

        if (!available) {

          this.addButtonText.textContent =
            soldOutText ||
            'Sold out';

        }

      }


      /*
       * Accelerated checkout.
       */

      if (this.dynamicCheckout) {

        this.dynamicCheckout.classList.toggle(
          'product-buy-buttons__dynamic--disabled',
          !available
        );

      }


      this.container.dataset.selectedVariantId =
        variantId;


      this.container.dataset.selectedVariantAvailable =
        available
          ? 'true'
          : 'false';

    }


    /* =========================================
       SUBMIT STATE
       ========================================= */

    handleSubmitState() {

      if (
        !this.addButton ||
        this.addButton.disabled
      ) {
        return;
      }


      /*
       * Let the existing Shopify/custom
       * product-form JavaScript handle the
       * actual submission.
       *
       * We only provide loading UI here.
       */

      this.setLoading(true);


      /*
       * Safety fallback.
       *
       * If a custom AJAX form does not finish
       * immediately, restore the button after
       * a short period.
       */

      window.setTimeout(
        () => {

          this.setLoading(false);

        },
        2500
      );

    }


    /* =========================================
       LOADING
       ========================================= */

    setLoading(
      loading
    ) {

      if (!this.addButton) {
        return;
      }


      this.addButton.classList.toggle(
        'is-loading',
        loading
      );


      this.addButton.setAttribute(
        'aria-busy',
        loading
          ? 'true'
          : 'false'
      );


      if (this.addButtonText) {

        this.addButtonText.hidden =
          loading;

      }


      if (this.loading) {

        this.loading.hidden =
          !loading;

      }


      if (loading) {

        this.addButton.disabled =
          true;

      } else {

        this.updateVariantState();

      }

    }

  }


  /* =========================================
     INITIALIZE
     ========================================= */

  function initializeBuyButtons(
    root = document
  ) {

    let containers = [];


    if (
      root.matches &&
      root.matches(
        '[data-product-buy-buttons]'
      )
    ) {

      containers = [
        root
      ];

    } else {

      containers =
        Array.from(
          root.querySelectorAll(
            '[data-product-buy-buttons]'
          )
        );

    }


    containers.forEach(
      container => {

        if (
          container.dataset
            .buyButtonsInitialized ===
          'true'
        ) {
          return;
        }


        container.dataset
          .buyButtonsInitialized =
          'true';


        /*
         * Store instance for debugging
         * and future integrations.
         */

        container.productBuyButtons =
          new ProductBuyButtons(
            container
          );

      }
    );

  }


  /* =========================================
     INITIAL PAGE LOAD
     ========================================= */

  if (
    document.readyState ===
    'loading'
  ) {

    document.addEventListener(
      'DOMContentLoaded',
      () => {

        initializeBuyButtons();

      }
    );

  } else {

    initializeBuyButtons();

  }


  /* =========================================
     SHOPIFY THEME EDITOR
     ========================================= */

  document.addEventListener(
    'shopify:section:load',
    event => {

      initializeBuyButtons(
        event.target
      );

    }
  );


  document.addEventListener(
    'shopify:block:select',
    event => {

      initializeBuyButtons(
        event.target
      );

    }
  );

})();