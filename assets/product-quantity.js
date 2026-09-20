(() => {
  'use strict';


  class ProductQuantity {

    constructor(container) {

      this.container = container;

      this.type =
        container.dataset.quantityType || 'stepper';

      this.min =
        Number(container.dataset.min) || 1;

      this.max =
        Number(container.dataset.max) || this.min;

      this.step =
        Number(container.dataset.step) || 1;


      if (this.max < this.min) {
        this.max = this.min;
      }


      this.input =
        container.querySelector(
          '[data-quantity-input]'
        );


      this.decreaseButton =
        container.querySelector(
          '[data-quantity-decrease]'
        );


      this.increaseButton =
        container.querySelector(
          '[data-quantity-increase]'
        );


      this.presetButtons =
        Array.from(
          container.querySelectorAll(
            '[data-quantity-preset]'
          )
        );


      if (!this.input) {
        return;
      }


      this.bindEvents();

      this.initialize();

    }


    /* =========================================
       INITIALIZE
       ========================================= */

    initialize() {

      const currentValue =
        Number(this.input.value) || this.min;


      this.setQuantity(
        currentValue,
        false
      );


      this.updateButtonState();

      this.updatePresetState();

    }


    /* =========================================
       EVENTS
       ========================================= */

    bindEvents() {


      /* -----------------------------------------
         Minus
         ----------------------------------------- */

      if (this.decreaseButton) {

        this.decreaseButton.addEventListener(
          'click',
          () => {

            const current =
              this.getQuantity();

            this.setQuantity(
              current - this.step
            );

          }
        );

      }


      /* -----------------------------------------
         Plus
         ----------------------------------------- */

      if (this.increaseButton) {

        this.increaseButton.addEventListener(
          'click',
          () => {

            const current =
              this.getQuantity();

            this.setQuantity(
              current + this.step
            );

          }
        );

      }


      /* -----------------------------------------
         Manual input / dropdown
         ----------------------------------------- */

      this.input.addEventListener(
        'change',
        () => {

          const value =
            Number(this.input.value);


          this.setQuantity(
            value,
            false
          );

        }
      );


      /* -----------------------------------------
         Presets
         ----------------------------------------- */

      this.presetButtons.forEach(
        button => {

          button.addEventListener(
            'click',
            event => {

              event.preventDefault();


              const value =
                Number(
                  button.dataset.quantityPreset
                );


              this.setQuantity(
                value
              );


              this.updatePresetState();

            }
          );

        }
      );

    }


    /* =========================================
       GET QUANTITY
       ========================================= */

    getQuantity() {

      const value =
        Number(this.input.value);


      return Number.isFinite(value)
        ? value
        : this.min;

    }


    /* =========================================
       NORMALIZE QUANTITY
       ========================================= */

    normalizeQuantity(value) {

      let quantity =
        Number(value);


      if (!Number.isFinite(quantity)) {
        quantity = this.min;
      }


      quantity =
        Math.max(
          this.min,
          Math.min(
            this.max,
            quantity
          )
        );


      /*
       * Keep quantity aligned with
       * the configured step.
       */

      const stepPosition =
        (quantity - this.min) /
        this.step;


      const alignedPosition =
        Math.round(stepPosition);


      quantity =
        this.min +
        alignedPosition * this.step;


      quantity =
        Math.max(
          this.min,
          Math.min(
            this.max,
            quantity
          )
        );


      return quantity;

    }


    /* =========================================
       SET QUANTITY
       ========================================= */

    setQuantity(
      value,
      dispatchChange = true
    ) {

      const quantity =
        this.normalizeQuantity(
          value
        );


      this.input.value =
        quantity;


      this.updateButtonState();

      this.updatePresetState();


      if (dispatchChange) {

        this.input.dispatchEvent(
          new Event(
            'change',
            {
              bubbles: true
            }
          )
        );

      }

    }


    /* =========================================
       STEPPER BUTTON STATE
       ========================================= */

    updateButtonState() {

      if (!this.decreaseButton &&
          !this.increaseButton) {
        return;
      }


      const quantity =
        this.getQuantity();


      if (this.decreaseButton) {

        this.decreaseButton.disabled =
          quantity <= this.min;

      }


      if (this.increaseButton) {

        this.increaseButton.disabled =
          quantity >= this.max;

      }

    }


    /* =========================================
       PRESET ACTIVE STATE
       ========================================= */

    updatePresetState() {

      if (!this.presetButtons.length) {
        return;
      }


      const quantity =
        this.getQuantity();


      this.presetButtons.forEach(
        button => {

          const presetQuantity =
            Number(
              button.dataset.quantityPreset
            );


          const active =
            presetQuantity === quantity;


          button.classList.toggle(
            'is-active',
            active
          );


          button.setAttribute(
            'aria-pressed',
            active
              ? 'true'
              : 'false'
          );

        }
      );

    }

  }


  /* =========================================
     INITIALIZATION
     ========================================= */

  function initializeQuantityBlocks(
    root = document
  ) {

    let containers = [];


    if (
      root.matches &&
      root.matches(
        '[data-product-quantity]'
      )
    ) {

      containers = [root];

    } else {

      containers =
        Array.from(
          root.querySelectorAll(
            '[data-product-quantity]'
          )
        );

    }


    containers.forEach(
      container => {

        if (
          container.dataset.quantityInitialized ===
          'true'
        ) {
          return;
        }


        container.dataset.quantityInitialized =
          'true';


        container.productQuantity =
          new ProductQuantity(
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
        initializeQuantityBlocks();
      }
    );

  } else {

    initializeQuantityBlocks();

  }


  /* =========================================
     SHOPIFY THEME EDITOR
     ========================================= */

  document.addEventListener(
    'shopify:section:load',
    event => {

      initializeQuantityBlocks(
        event.target
      );

    }
  );


  document.addEventListener(
    'shopify:block:select',
    event => {

      initializeQuantityBlocks(
        event.target
      );

    }
  );

})();