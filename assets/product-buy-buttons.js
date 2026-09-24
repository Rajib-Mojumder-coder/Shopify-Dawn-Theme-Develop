
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
          ? document.getElementById(this.formId)
          : null;


      this.addButton =
        container.querySelector('[data-add-to-cart]');


      this.buyNowButton =
        container.querySelector('[data-buy-now]');


      this.status =
        container.querySelector('[data-buy-button-status]');


      this.variants =
        this.loadVariants();


      this.cartRoute =
        (
          container.dataset.cartRoute ||
          '/cart'
        ).replace(/\/$/, '');


      if (!this.form) {

        console.warn(
          'Product buy buttons: product form not found.'
        );

        return;
      }


      this.bindEvents();

      this.syncVariantState();

    }


    /* ==================================================
       VARIANT DATA
       ================================================== */

    loadVariants() {

      const element =
        this.container.querySelector(
          '.product-buy-buttons__variants'
        );


      if (!element) {
        return [];
      }


      try {

        const data =
          JSON.parse(
            element.textContent
          );


        return Array.isArray(data)
          ? data
          : [];


      } catch (error) {

        console.warn(
          'Product buy button variant data could not be parsed.',
          error
        );


        return [];

      }

    }


    /* ==================================================
       EVENTS
       ================================================== */

    bindEvents() {


      /* -----------------------------------------------
         Add to cart
         ----------------------------------------------- */

      if (this.addButton) {

        this.addButton.addEventListener(
          'click',
          event => {

            event.preventDefault();

            this.addToCart();

          }
        );

      }


      /* -----------------------------------------------
         Buy now
         ----------------------------------------------- */

      if (this.buyNowButton) {

        this.buyNowButton.addEventListener(
          'click',
          event => {

            event.preventDefault();

            this.buyNow();

          }
        );

      }


      /* -----------------------------------------------
         Variant changes
         ----------------------------------------------- */

      if (this.productInfo) {

        this.productInfo.addEventListener(
          'change',
          () => {

            window.setTimeout(
              () => {
                this.syncVariantState();
              },
              50
            );

          }
        );


        this.productInfo.addEventListener(
          'click',
          event => {

            const picker =
              event.target.closest(
                '.custom-product-variant-picker'
              );


            if (!picker) {
              return;
            }


            window.setTimeout(
              () => {
                this.syncVariantState();
              },
              80
            );

          }
        );

      }

    }


    /* ==================================================
       VARIANT ID
       ================================================== */

    getVariantId() {

      const input =
        this.form.querySelector(
          '[name="id"]'
        );


      if (!input) {
        return '';
      }


      return String(
        input.value || ''
      );

    }


    /* ==================================================
       SELECTED VARIANT
       ================================================== */

    getSelectedVariant() {

      const variantId =
        this.getVariantId();


      if (!variantId) {
        return null;
      }


      return (
        this.variants.find(
          variant =>
            String(variant.id) === variantId
        )
        || null
      );

    }


    /* ==================================================
       QUANTITY
       ================================================== */

    getQuantity() {

      const quantityInput =
        this.form.querySelector(
          '[name="quantity"]'
        );


      if (!quantityInput) {
        return 1;
      }


      const quantity =
        Number(
          quantityInput.value
        );


      if (
        !Number.isFinite(quantity) ||
        quantity < 1
      ) {

        return 1;

      }


      return Math.floor(quantity);

    }


    /* ==================================================
       VARIANT STATE
       ================================================== */

    syncVariantState() {

      const variant =
        this.getSelectedVariant();


      if (!variant) {

        this.setButtonsDisabled(true);

        return;

      }


      const available =
        Boolean(
          variant.available
        );


      this.setButtonsDisabled(
        !available
      );


      this.container.dataset.selectedVariantId =
        String(variant.id);


      this.container.dataset.selectedVariantAvailable =
        available
          ? 'true'
          : 'false';


      const textElements =
        this.container.querySelectorAll(
          '.product-buy-buttons__text'
        );


      textElements.forEach(
        element => {

          const button =
            element.closest('button');


          if (
            button &&
            button.getAttribute('aria-busy') === 'true'
          ) {

            return;

          }


          if (!available) {

            element.textContent =
              this.container.dataset.soldOutText;

            return;

          }


          if (
            button &&
            button.hasAttribute('data-buy-now')
          ) {

            element.textContent =
              this.container.dataset.buyNowText;

          } else {

            element.textContent =
              this.container.dataset.addToCartText;

          }

        }
      );

    }


    /* ==================================================
       BUTTON STATE
       ================================================== */

    setButtonsDisabled(disabled) {

      if (this.addButton) {

        this.addButton.disabled =
          disabled;

      }


      if (this.buyNowButton) {

        this.buyNowButton.disabled =
          disabled;

      }

    }


    /* ==================================================
       LOADING
       ================================================== */

    setLoading(button, loading) {

      if (!button) {
        return;
      }


      const text =
        button.querySelector(
          '.product-buy-buttons__text'
        );


      const spinner =
        button.querySelector(
          '[data-button-spinner]'
        );


      button.classList.toggle(
        'is-loading',
        loading
      );


      button.setAttribute(
        'aria-busy',
        loading
          ? 'true'
          : 'false'
      );


      if (text) {

        text.style.visibility =
          loading
            ? 'hidden'
            : 'visible';

      }


      if (spinner) {

        spinner.hidden =
          !loading;

      }


      button.disabled =
        loading;

    }


    /* ==================================================
       STATUS
       ================================================== */

    showStatus(
      message,
      type = ''
    ) {

      if (!this.status) {
        return;
      }


      this.status.textContent =
        message;


      if (type) {

        this.status.dataset.status =
          type;

      } else {

        delete this.status.dataset.status;

      }

    }


    clearStatus() {

      if (!this.status) {
        return;
      }


      this.status.textContent = '';

      delete this.status.dataset.status;

    }


    /* ==================================================
       ADD TO CART
       ================================================== */

    async addToCart() {

      const variant =
        this.getSelectedVariant();


      if (
        !variant ||
        !variant.available ||
        !this.addButton
      ) {

        return;

      }


      this.clearStatus();


      const quantity =
        this.getQuantity();


      this.setLoading(
        this.addButton,
        true
      );


      try {

        const formData =
          new FormData(
            this.form
          );


        /*
         * Explicitly use selected variant.
         */

        formData.set(
          'id',
          String(variant.id)
        );


        /*
         * Explicitly use selected quantity.
         *
         * This is where Bundle & Save
         * quantity is sent.
         */

        formData.set(
          'quantity',
          String(quantity)
        );


        const response =
          await fetch(
            window.Shopify.routes.root +
              'cart/add.js',
            {
              method: 'POST',

              headers: {
                Accept:
                  'application/json'
              },

              body:
                formData
            }
          );


        const data =
          await response.json()
            .catch(
              () => null
            );


        if (!response.ok) {

          throw new Error(
            data?.description ||
            data?.message ||
            'Unable to add this product to cart.'
          );

        }


        /*
         * Success.
         *
         * Shopify now owns the cart.
         *
         * Any automatic Shopify discount
         * can be calculated by Shopify's
         * discount system.
         */

        window.location.href =
          this.cartRoute;


      } catch (error) {

        console.error(
          'Add to cart error:',
          error
        );


        this.showStatus(
          error.message ||
          'Something went wrong. Please try again.',
          'error'
        );


        this.setLoading(
          this.addButton,
          false
        );


        this.syncVariantState();

      }

    }


    /* ==================================================
       BUY NOW
       ================================================== */

    buyNow() {

      const variant =
        this.getSelectedVariant();


      if (
        !variant ||
        !variant.available ||
        !this.buyNowButton
      ) {

        return;

      }


      this.clearStatus();


      const quantity =
        this.getQuantity();


      this.setLoading(
        this.buyNowButton,
        true
      );


      /*
       * Shopify cart permalink.
       *
       * Example:
       *
       * /cart/123456789:3
       *
       * This creates a cart containing
       * the selected variant and quantity
       * and sends the buyer toward checkout.
       */

      const variantId =
        String(
          variant.id
        );


      const checkoutUrl =
        this.cartRoute +
        '/' +
        encodeURIComponent(
          variantId
        ) +
        ':' +
        encodeURIComponent(
          String(quantity)
        );


      window.location.href =
        checkoutUrl;

    }

  }


  /* ====================================================
     INITIALIZATION
     ==================================================== */

  function initializeBuyButtons(root = document) {

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
            .buyButtonsInitialized === 'true'
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


  /* ====================================================
     INITIAL PAGE LOAD
     ==================================================== */

  if (
    document.readyState === 'loading'
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


  /* ====================================================
     SHOPIFY THEME EDITOR
     ==================================================== */

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
