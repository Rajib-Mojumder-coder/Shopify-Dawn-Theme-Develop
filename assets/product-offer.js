(() => {
  'use strict';


  /* =====================================================
     PRODUCT OFFER
     ===================================================== */

  class ProductOffer {


    /* ===================================================
       CONSTRUCTOR
       =================================================== */

    constructor(container) {

      this.container = container;

      this.productInfo =
        container.closest('product-info');

      this.button =
        container.querySelector(
          '[data-product-offer-button]'
        );

      this.spinner =
        container.querySelector(
          '[data-product-offer-spinner]'
        );

      this.status =
        container.querySelector(
          '[data-product-offer-status]'
        );

      this.dataElement =
        container.querySelector(
          '[data-product-offer-data]'
        );

      this.data =
        this.loadData();


      if (!this.button || !this.data) {
        return;
      }


      this.bindEvents();

      this.syncCurrentVariant();

    }


    /* ===================================================
       DATA
       =================================================== */

    loadData() {

      if (!this.dataElement) {
        return null;
      }


      try {

        const data =
          JSON.parse(
            this.dataElement.textContent
          );


        return data;

      } catch (error) {

        console.warn(
          'Product offer data could not be parsed.',
          error
        );


        return null;
      }

    }


    /* ===================================================
       EVENTS
       =================================================== */

    bindEvents() {

      this.button.addEventListener(
        'click',
        event => {

          event.preventDefault();

          this.addOffer();

        }
      );


      /*
       * The current product may have a custom
       * variant picker.
       *
       * When the customer changes variant,
       * we use that selected variant for the
       * current product.
       */

      if (this.productInfo) {

        this.productInfo.addEventListener(
          'change',
          () => {

            window.setTimeout(
              () => {

                this.syncCurrentVariant();

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

                this.syncCurrentVariant();

              },
              80
            );

          }
        );

      }

    }


    /* ===================================================
       CURRENT VARIANT
       =================================================== */

    getCurrentVariantId() {

      /*
       * First try the product form.
       */

      if (this.productInfo) {

        const variantInput =
          this.productInfo.querySelector(
            '[name="id"]'
          );


        if (
          variantInput &&
          variantInput.value
        ) {

          return String(
            variantInput.value
          );

        }

      }


      /*
       * Fallback to the Liquid-rendered
       * variant ID.
       */

      if (
        this.data &&
        this.data.currentProductVariantId
      ) {

        return String(
          this.data.currentProductVariantId
        );

      }


      return '';

    }


    syncCurrentVariant() {

      if (!this.data) {
        return;
      }


      const currentProductId =
        String(
          this.data.currentProductId
        );


      const currentVariantId =
        this.getCurrentVariantId();


      /*
       * Update the current product entry
       * when it is being used as the Buy product.
       */

      this.data.buyProducts =
        this.data.buyProducts.map(
          product => {

            if (
              String(product.productId) !==
              currentProductId
            ) {

              return product;

            }


            return {
              ...product,

              variantId:
                currentVariantId ||
                product.variantId,

              currentProduct: true

            };

          }
        );


      this.container.dataset.selectedVariantId =
        currentVariantId;

    }


    /* ===================================================
       BUILD CART ITEMS
       =================================================== */

    buildCartItems() {

      if (!this.data) {
        return [];
      }


      const items = [];


      /*
       * -----------------------------------------------
       * BUY PRODUCTS
       * -----------------------------------------------
       */

      this.data.buyProducts.forEach(
        product => {

          let variantId =
            String(
              product.variantId || ''
            );


          /*
           * If this is the current product,
           * always use the currently selected
           * variant.
           */

          if (
            product.currentProduct === true ||
            String(product.productId) ===
              String(this.data.currentProductId)
          ) {

            const currentVariantId =
              this.getCurrentVariantId();


            if (currentVariantId) {

              variantId =
                currentVariantId;

            }

          }


          if (!variantId) {
            return;
          }


          items.push({

            id:
              Number(variantId),

            quantity:
              Number(
                this.data.buyQuantity
              )

          });

        }
      );


      /*
       * -----------------------------------------------
       * GET PRODUCTS
       * -----------------------------------------------
       */

      this.data.getProducts.forEach(
        product => {

          const variantId =
            String(
              product.variantId || ''
            );


          if (!variantId) {
            return;
          }


          items.push({

            id:
              Number(variantId),

            quantity:
              Number(
                this.data.getQuantity
              )

          });

        }
      );


      return this.mergeDuplicateItems(
        items
      );

    }


    /* ===================================================
       MERGE DUPLICATE VARIANTS
       =================================================== */

    mergeDuplicateItems(items) {

      const merged =
        new Map();


      items.forEach(
        item => {

          const key =
            String(item.id);


          if (
            merged.has(key)
          ) {

            const existing =
              merged.get(key);


            existing.quantity +=
              item.quantity;

          } else {

            merged.set(
              key,
              {
                id:
                  item.id,

                quantity:
                  item.quantity
              }
            );

          }

        }
      );


      return Array.from(
        merged.values()
      );

    }


    /* ===================================================
       VALIDATE OFFER
       =================================================== */

    validateItems(items) {

      if (!items.length) {

        return {
          valid: false,
          message:
            'No products are configured for this offer.'
        };

      }


      /*
       * Check Buy products.
       */

      for (
        const product
        of this.data.buyProducts
      ) {

        /*
         * Current product availability
         * comes from the selected variant.
         */

        if (
          product.currentProduct === true
        ) {

          const variant =
            this.getCurrentVariantId();


          if (!variant) {

            return {
              valid: false,
              message:
                'Please select a product variant.'
            };

          }

        } else if (
          product.available === false
        ) {

          return {
            valid: false,
            message:
              `${product.title} is currently unavailable.`
          };

        }

      }


      /*
       * Check Get products.
       */

      for (
        const product
        of this.data.getProducts
      ) {

        if (
          product.available === false
        ) {

          return {
            valid: false,
            message:
              `${product.title} is currently unavailable.`
          };

        }

      }


      return {
        valid: true,
        message: ''
      };

    }


    /* ===================================================
       LOADING
       =================================================== */

    setLoading(
      loading
    ) {

      if (!this.button) {
        return;
      }


      this.button.disabled =
        loading;


      this.button.classList.toggle(
        'is-loading',
        loading
      );


      this.button.setAttribute(
        'aria-busy',
        loading
          ? 'true'
          : 'false'
      );

    }


    /* ===================================================
       STATUS
       =================================================== */

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


    /* ===================================================
       ADD OFFER
       =================================================== */

    async addOffer() {

      if (!this.data) {
        return;
      }


      this.clearStatus();


      /*
       * Make sure we have the newest
       * selected variant.
       */

      this.syncCurrentVariant();


      const items =
        this.buildCartItems();


      const validation =
        this.validateItems(
          items
        );


      if (!validation.valid) {

        this.showStatus(
          validation.message,
          'error'
        );

        return;

      }


      this.setLoading(true);


      try {

        const response =
          await fetch(
            window.Shopify.routes.root +
              'cart/add.js',
            {
              method: 'POST',

              headers: {
                'Content-Type':
                  'application/json',

                'Accept':
                  'application/json'
              },

              body:
                JSON.stringify({
                  items
                })
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
            'Unable to add the offer to cart.'
          );

        }


        /*
         * Important:
         *
         * We do NOT calculate the discount here.
         *
         * Shopify's automatic Buy X Get Y
         * discount evaluates the cart.
         */

        this.showStatus(
          this.container.dataset.successMessage ||
          'Offer added to cart.',
          'success'
        );


        /*
         * Give the cart a short moment to
         * receive the request before redirecting.
         */

        window.setTimeout(
          () => {

            window.location.href =
              this.container.dataset.cartRoute ||
              '/cart';

          },
          250
        );


      } catch (error) {

        console.error(
          'Product offer error:',
          error
        );


        this.showStatus(
          error.message ||
          this.container.dataset.errorMessage ||
          'Unable to add the offer.',
          'error'
        );


        this.setLoading(false);

      }

    }

  }


  /* =====================================================
     INITIALIZATION
     ===================================================== */

  function initializeProductOffers(
    root = document
  ) {

    let containers = [];


    if (
      root.matches &&
      root.matches(
        '[data-product-offer]'
      )
    ) {

      containers = [
        root
      ];

    } else {

      containers =
        Array.from(
          root.querySelectorAll(
            '[data-product-offer]'
          )
        );

    }


    containers.forEach(
      container => {

        if (
          container.dataset
            .productOfferInitialized ===
          'true'
        ) {

          return;

        }


        container.dataset
          .productOfferInitialized =
          'true';


        container.productOffer =
          new ProductOffer(
            container
          );

      }
    );

  }


  /* =====================================================
     PAGE LOAD
     ===================================================== */

  if (
    document.readyState ===
    'loading'
  ) {

    document.addEventListener(
      'DOMContentLoaded',
      () => {

        initializeProductOffers();

      }
    );

  } else {

    initializeProductOffers();

  }


  /* =====================================================
     SHOPIFY THEME EDITOR
     ===================================================== */

  document.addEventListener(
    'shopify:section:load',
    event => {

      initializeProductOffers(
        event.target
      );

    }
  );


  document.addEventListener(
    'shopify:block:select',
    event => {

      initializeProductOffers(
        event.target
      );

    }
  );


})();