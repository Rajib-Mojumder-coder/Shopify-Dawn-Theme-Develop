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
              '[name="id"]'
            )
          : null;


      this.addButton =
        container.querySelector(
          '[data-add-to-cart]'
        );


      if (!this.addButton) {
        return;
      }


      this.bindEvents();

      this.syncVariantState();

    }


    /* =========================================
       EVENTS
       ========================================= */

    bindEvents() {

      /*
       * Variant picker changes
       */

      if (this.productInfo) {

        this.productInfo.addEventListener(
          'change',
          () => {

            window.setTimeout(
              () => {
                this.syncVariantState();
              },
              30
            );

          }
        );


        /*
         * Custom dropdown / custom controls
         */

        this.productInfo.addEventListener(
          'click',
          event => {

            const variantPicker =
              event.target.closest(
                '.custom-product-variant-picker'
              );


            if (!variantPicker) {
              return;
            }


            window.setTimeout(
              () => {
                this.syncVariantState();
              },
              60
            );

          }
        );

      }


      /*
       * Direct variant input changes
       */

      if (this.variantInput) {

        this.variantInput.addEventListener(
          'change',
          () => {
            this.syncVariantState();
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
          this.variantInput.value || ''
        );


      if (!variantId) {
        return null;
      }


      /*
       * The current variant information is
       * read from the product page rather than
       * maintaining a second discount or cart
       * system here.
       */

      const variantData =
        this.getVariantData();


      if (!variantData) {
        return null;
      }


      return variantData.find(
        variant =>
          String(variant.id) ===
          variantId
      ) || null;

    }


    /* =========================================
       VARIANT DATA
       ========================================= */

    getVariantData() {

      if (!this._variantData) {

        this._variantData =
          Array.from(
            this.container
              .querySelectorAll(
                'script[type="application/json"]'
              )
          )
          .map(script => {

            try {
              return JSON.parse(
                script.textContent
              );
            } catch (error) {
              return null;
            }

          })
          .find(data =>
            Array.isArray(data)
          );

      }


      return this._variantData || [];

    }


    /* =========================================
       SYNC BUTTON
       ========================================= */

    syncVariantState() {

      const variant =
        this.getSelectedVariant();


      if (!variant) {
        return;
      }


      const available =
        Boolean(
          variant.available
        );


      /*
       * Only control availability.
       *
       * Do NOT control:
       * - loading
       * - aria-disabled during submit
       * - form submission
       *
       * Dawn/custom product-form owns those.
       */

      this.addButton.disabled =
        !available;


      this.container.dataset.selectedVariantId =
        String(variant.id);


      this.container.dataset.selectedVariantAvailable =
        available
          ? 'true'
          : 'false';


      const text =
        this.addButton.querySelector(
          '.product-buy-buttons__text'
        );


      if (text) {

        text.textContent =
          available
            ? this.container.dataset.availableText
            : this.container.dataset.soldOutText;

      }

    }

  }


  /* =========================================
     INITIALIZATION
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


        container.productBuyButtons =
          new ProductBuyButtons(
            container
          );

      }
    );

  }


  /* =========================================
     PAGE LOAD
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
     THEME EDITOR
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