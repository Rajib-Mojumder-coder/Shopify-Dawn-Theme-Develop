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


      this.addButton =
        container.querySelector(
          '[data-add-to-cart]'
        );


      this.buyNowButton =
        container.querySelector(
          '[data-buy-now]'
        );


      this.status =
        container.querySelector(
          '[data-buy-button-status]'
        );


      this.variants =
        this.loadVariants();


      this.cartRoute =
        (
          container.dataset.cartRoute ||
          '/cart'
        ).replace(
          /\/$/,
          ''
        );


      if (!this.form) {
        return;
      }


      this.bindEvents();

      this.syncVariantState();

    }


    /* =========================================
       VARIANTS
       ========================================= */

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


    /* =========================================
       EVENTS
       ========================================= */

    bindEvents() {


      /* Add to cart */

      if (this.addButton) {

        this.addButton.addEventListener(
          'click',
          event => {

            event.preventDefault();

            this.addToCart();

          }
        );

      }


      /* Buy now */

      if (this.buyNowButton) {

        this.buyNowButton.addEventListener(
          'click',
          event => {

            event.preventDefault();

            this.buyNow();

          }
        );

      }


      /*
       * Variant changes.
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
         * Custom dropdown variant controls.
         */

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
              60
            );

          }
        );

      }

    }


    /* =========================================
       SELECTED VARIANT
       ========================================= */

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


    getSelectedVariant() {

      const variantId =
        this.getVariantId();


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
       QUANTITY
       ========================================= */

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


    /* =========================================
       DISCOUNT CODE
       ========================================= */

    getBundleDiscountCode() {

      if (!this.form) {
        return '';
      }


      return (
        this.form.dataset.bundleDiscountCode ||
        ''
      ).trim();

    }


    /* =========================================
       VARIANT AVAILABILITY
       ========================================= */

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

          /*
           * Don't overwrite button text
           * while a request is running.
           */

          const button =
            element.closest('button');


          if (
            button &&
            button.getAttribute(
              'aria-busy'
            ) === 'true'
          ) {
            return;
          }


          element.textContent =
            available
              ? (
                  button?.hasAttribute(
                    'data-buy-now'
                  )
                    ? this.container.dataset.buyNowText
                    : this.container.dataset.availableText
                )
              : this.container.dataset.soldOutText;

        }
      );

    }


    /* =========================================
       BUTTON STATE
       ========================================= */

    setButtonsDisabled(
      disabled
    ) {

      if (this.addButton) {
        this.addButton.disabled =
          disabled;
      }


      if (this.buyNowButton) {
        this.buyNowButton.disabled =
          disabled;
      }

    }


    /* =========================================
       LOADING
       ========================================= */

    setLoading(
      button,
      loading
    ) {

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

        spinner.classList.toggle(
          'hidden',
          !loading
        );

      }


      if (loading) {
        button.disabled = true;
      }

    }


    /* =========================================
       STATUS
       ========================================= */

    showStatus(
      message,
      type = ''
    ) {

      if (!this.status) {
        return;
      }


      this.status.textContent =
        message;


      this.status.dataset.status =
        type;

    }


    clearStatus() {

      if (!this.status) {
        return;
      }


      this.status.textContent = '';

      delete this.status.dataset.status;

    }


    /* =========================================
       ADD TO CART
       ========================================= */

    async addToCart() {

      const variant =
        this.getSelectedVariant();


      if (!variant || !variant.available) {
        return;
      }


      if (!this.addButton) {
        return;
      }


      this.clearStatus();


      const quantity =
        this.getQuantity();


      const discountCode =
        this.getBundleDiscountCode();


      this.setLoading(
        this.addButton,
        true
      );


      try {

        /*
         * Build FormData from the existing
         * Shopify product form.
         *
         * This keeps variant, quantity and
         * future supported form values together.
         */

        const formData =
          new FormData(
            this.form
          );


        /*
         * Make sure the correct values are
         * explicitly present.
         */

        formData.set(
          'id',
          String(variant.id)
        );


        formData.set(
          'quantity',
          String(quantity)
        );


        /*
         * Add product to cart.
         */

        const addResponse =
          await fetch(
            window.Shopify.routes.root +
              'cart/add.js',
            {
              method: 'POST',
              headers: {
                'Accept':
                  'application/json'
              },
              body: formData
            }
          );


        const addData =
          await addResponse.json()
            .catch(
              () => null
            );


        if (!addResponse.ok) {

          throw new Error(
            addData?.description ||
            addData?.message ||
            'Unable to add this product to cart.'
          );

        }


        /*
         * Apply Bundle & Save discount.
         *
         * The discount is a real Shopify
         * discount code configured in Admin.
         */

        if (discountCode) {

          const discountResponse =
            await fetch(
              window.Shopify.routes.root +
                'cart/update.js',
              {
                method: 'POST',

                headers: {
                  'Content-Type':
                    'application/json',

                  'Accept':
                    'application/json'
                },

                body: JSON.stringify({
                  discount:
                    discountCode
                })
              }
            );


          const discountData =
            await discountResponse.json()
              .catch(
                () => null
              );


          if (!discountResponse.ok) {

            throw new Error(
              discountData?.description ||
              discountData?.message ||
              'The bundle discount could not be applied.'
            );

          }

        }


        /*
         * Successful Add to Cart.
         *
         * Your current requirement is to
         * redirect to the cart page.
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


    /* =========================================
       BUY NOW
       ========================================= */

    buyNow() {

      const variant =
        this.getSelectedVariant();


      if (!variant || !variant.available) {
        return;
      }


      if (!this.buyNowButton) {
        return;
      }


      this.clearStatus();


      const quantity =
        this.getQuantity();


      const discountCode =
        this.getBundleDiscountCode();


      this.setLoading(
        this.buyNowButton,
        true
      );


      /*
       * Shopify cart permalink.
       *
       * No "storefront=true" means Shopify
       * continues toward checkout.
       */

      let url =
        this.cartRoute +
        '/' +
        encodeURIComponent(
          String(variant.id)
        ) +
        ':' +
        encodeURIComponent(
          String(quantity)
        );


      const params =
        new URLSearchParams();


      if (discountCode) {

        params.set(
          'discount',
          discountCode
        );

      }


      const query =
        params.toString();


      if (query) {

        url += '?' + query;

      }


      window.location.href =
        url;

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