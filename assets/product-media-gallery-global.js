(() => {
  'use strict';


  class ProductMediaGallery {

    constructor(gallery) {

      this.gallery = gallery;

      this.gallery.productMediaGallery = this;


      /* =========================================
         MAIN GALLERY ELEMENTS
         ========================================= */

      this.track = gallery.querySelector(
        '.custom-media-gallery__track'
      );


      this.slides = Array.from(
        gallery.querySelectorAll(
          '.custom-media-gallery__slide'
        )
      );


      this.thumbnails = Array.from(
        gallery.querySelectorAll(
          '[data-thumbnail-index]'
        )
      );


      this.dots = Array.from(
        gallery.querySelectorAll(
          '[data-dot-index], [data-mobile-dot-index]'
        )
      );


      this.prevButtons = Array.from(
        gallery.querySelectorAll(
          '[data-gallery-prev]'
        )
      );


      this.nextButtons = Array.from(
        gallery.querySelectorAll(
          '[data-gallery-next]'
        )
      );


      this.thumbnailPrev = gallery.querySelector(
        '[data-thumbnail-prev]'
      );


      this.thumbnailNext = gallery.querySelector(
        '[data-thumbnail-next]'
      );


      this.counterCurrent = gallery.querySelector(
        '[data-counter-current]'
      );


      this.mobileCounterCurrent = gallery.querySelector(
        '[data-mobile-counter-current]'
      );


      /* =========================================
         PRODUCT INFO / VARIANT PICKER
         ========================================= */

      this.productInfo =
        gallery.closest('product-info');


      this.variantPicker =
        this.productInfo
          ? this.productInfo.querySelector(
              '.custom-product-variant-picker'
            )
          : null;


      this.variantJson =
        this.variantPicker
          ? this.variantPicker.querySelector(
              '.custom-product-variant__json'
            )
          : null;


      this.variantMediaTimer = null;


      /* =========================================
         INITIAL INDEX
         ========================================= */

      this.currentIndex =
        this.getInitialIndex();


      if (
        !this.track ||
        !this.slides.length
      ) {
        return;
      }


      /* =========================================
         INITIALIZE EVENTS
         ========================================= */

      this.bindEvents();

      this.bindVariantMediaChange();


      /* =========================================
         INITIAL GALLERY STATE
         ========================================= */

      this.goToSlide(
        this.currentIndex,
        false
      );


      this.updateUI();

    }


    /* =========================================
       INITIAL INDEX
       ========================================= */

    getInitialIndex() {

      const activeSlide =
        this.slides.findIndex(
          slide =>
            slide.classList.contains('is-active')
        );


      return activeSlide >= 0
        ? activeSlide
        : 0;

    }


    /* =========================================
       NORMAL GALLERY EVENTS
       ========================================= */

    bindEvents() {


      /* -----------------------------------------
         Main previous
         ----------------------------------------- */

      this.prevButtons.forEach(
        button => {

          button.addEventListener(
            'click',
            event => {

              event.preventDefault();

              this.previous();

            }
          );

        }
      );


      /* -----------------------------------------
         Main next
         ----------------------------------------- */

      this.nextButtons.forEach(
        button => {

          button.addEventListener(
            'click',
            event => {

              event.preventDefault();

              this.next();

            }
          );

        }
      );


      /* -----------------------------------------
         Thumbnails
         ----------------------------------------- */

      this.thumbnails.forEach(
        thumbnail => {

          thumbnail.addEventListener(
            'click',
            event => {

              event.preventDefault();


              const index =
                Number(
                  thumbnail.dataset.thumbnailIndex
                );


              if (
                Number.isInteger(index) &&
                this.slides[index]
              ) {

                this.goToSlide(index);

              }

            }
          );

        }
      );


      /* -----------------------------------------
         Dots
         ----------------------------------------- */

      this.dots.forEach(
        dot => {

          dot.addEventListener(
            'click',
            event => {

              event.preventDefault();


              let index;


              if (
                dot.dataset.dotIndex !== undefined
              ) {

                index =
                  Number(
                    dot.dataset.dotIndex
                  );

              } else {

                index =
                  Number(
                    dot.dataset.mobileDotIndex
                  );

              }


              if (
                Number.isInteger(index) &&
                this.slides[index]
              ) {

                this.goToSlide(index);

              }

            }
          );

        }
      );


      /* -----------------------------------------
         Thumbnail previous
         ----------------------------------------- */

      if (this.thumbnailPrev) {

        this.thumbnailPrev.addEventListener(
          'click',
          () => {

            this.scrollThumbnails(-1);

          }
        );

      }


      /* -----------------------------------------
         Thumbnail next
         ----------------------------------------- */

      if (this.thumbnailNext) {

        this.thumbnailNext.addEventListener(
          'click',
          () => {

            this.scrollThumbnails(1);

          }
        );

      }


      /* -----------------------------------------
         Manual swipe / scroll
         ----------------------------------------- */

      this.track.addEventListener(
        'scroll',
        this.handleScroll.bind(this),
        {
          passive: true
        }
      );


      /* -----------------------------------------
         Keyboard support
         ----------------------------------------- */

      this.gallery.addEventListener(
        'keydown',
        event => {

          if (
            event.key === 'ArrowLeft'
          ) {

            event.preventDefault();

            this.previous();

          }


          if (
            event.key === 'ArrowRight'
          ) {

            event.preventDefault();

            this.next();

          }

        }
      );

    }


    /* =========================================
       VARIANT → MEDIA CONNECTION
       ========================================= */

    bindVariantMediaChange() {

      if (!this.productInfo) {
        return;
      }


      /*
       * Variant buttons / swatches normally
       * trigger a native change event.
       *
       * IMPORTANT:
       * Listen on product-info, not media-gallery,
       * because the picker is a sibling block.
       */

      this.productInfo.addEventListener(
        'change',
        () => {

          this.scheduleVariantMediaUpdate();

        }
      );


      /*
       * Your dropdown uses custom <li> items,
       * so clicking one may not create a native
       * change event on the gallery.
       */

      this.productInfo.addEventListener(
        'click',
        event => {

          const dropdownItem =
            event.target.closest(
              '.custom-product-variant__dropdown-item'
            );


          if (!dropdownItem) {
            return;
          }


          this.scheduleVariantMediaUpdate();

        }
      );

    }


    /* =========================================
       DELAY VARIANT MEDIA UPDATE
       ========================================= */

    scheduleVariantMediaUpdate() {

      if (this.variantMediaTimer) {

        clearTimeout(
          this.variantMediaTimer
        );

      }


      /*
       * Give the variant engine a moment to:
       *
       * 1. update selected option
       * 2. calculate variant
       * 3. update hidden variant ID
       */

      this.variantMediaTimer =
        window.setTimeout(
          () => {

            this.updateVariantMedia();

          },
          50
        );

    }


    /* =========================================
       FIND SELECTED VARIANT
       ========================================= */

    getSelectedVariant() {

      if (
        !this.variantPicker ||
        !this.variantJson
      ) {
        return null;
      }


      let data;


      try {

        data =
          JSON.parse(
            this.variantJson.textContent
          );

      } catch (error) {

        console.warn(
          'Product variant JSON could not be parsed.',
          error
        );

        return null;

      }


      if (
        !data ||
        !Array.isArray(data.variants)
      ) {
        return null;
      }


      /*
       * FIRST:
       * Try the hidden variant ID.
       *
       * Your existing variant engine should update
       * this input after selecting a variant.
       */

      const variantIdInput =
        this.variantPicker.querySelector(
          '.custom-product-variant__variant-id'
        );


      /*
       * Also support the hidden product-form
       * variant input used by your product form.
       */

      const formVariantInput =
        this.productInfo
          ? this.productInfo.querySelector(
              '.product-variant-id'
            )
          : null;


      const variantId =
        (
          variantIdInput?.value ||
          formVariantInput?.value ||
          ''
        ).trim();


      if (variantId) {

        const variantById =
          data.variants.find(
            variant =>
              String(variant.id) ===
              String(variantId)
          );


        if (variantById) {

          return {
            variant: variantById,
            data: data
          };

        }

      }


      /*
       * FALLBACK:
       *
       * If no hidden variant ID is available,
       * calculate the variant from the selected
       * option values.
       */

      const optionValues = [];


      const optionFields =
        this.variantPicker.querySelectorAll(
          '.custom-product-variant__option'
        );


      optionFields.forEach(
        fieldset => {

          /*
           * Buttons / swatches
           */

          const radio =
            fieldset.querySelector(
              'input[type="radio"]:checked'
            );


          if (radio) {

            optionValues.push(
              radio.value
            );

            return;

          }


          /*
           * Custom dropdown
           */

          const hiddenInput =
            fieldset.querySelector(
              '.custom-product-variant__hidden-input'
            );


          if (hiddenInput) {

            optionValues.push(
              hiddenInput.value
            );

          }

        }
      );


      if (!optionValues.length) {
        return null;
      }


      const variant =
        data.variants.find(
          variant => {

            const values = [
              variant.option1,
              variant.option2,
              variant.option3
            ].filter(
              value =>
                value != null
            );


            if (
              values.length !==
              optionValues.length
            ) {
              return false;
            }


            return values.every(
              (value, index) =>
                String(value) ===
                String(optionValues[index])
            );

          }
        );


      if (!variant) {
        return null;
      }


      return {
        variant: variant,
        data: data
      };

    }


    /* =========================================
       UPDATE MEDIA FROM SELECTED VARIANT
       ========================================= */

    updateVariantMedia() {

      const result =
        this.getSelectedVariant();


      if (!result) {
        return;
      }


      const variant =
        result.variant;


      const data =
        result.data;


      /*
       * Preferred source:
       *
       * variantMedia map generated by Liquid.
       */

      let mediaId =
        data.variantMedia
          ? data.variantMedia[
              String(variant.id)
            ]
          : null;


      /*
       * Fallback:
       * Some variant JSON structures may contain
       * featured_media directly.
       */

      if (
        !mediaId &&
        variant.featured_media
      ) {

        mediaId =
          variant.featured_media.id;

      }


      if (!mediaId) {
        return;
      }


      this.goToMediaId(
        mediaId
      );

    }


    /* =========================================
       NEXT / PREVIOUS
       ========================================= */

    next() {

      const nextIndex =
        this.currentIndex >=
        this.slides.length - 1
          ? 0
          : this.currentIndex + 1;


      this.goToSlide(
        nextIndex
      );

    }


    previous() {

      const previousIndex =
        this.currentIndex <= 0
          ? this.slides.length - 1
          : this.currentIndex - 1;


      this.goToSlide(
        previousIndex
      );

    }


    /* =========================================
       GO TO SLIDE
       ========================================= */

    goToSlide(
      index,
      smooth = true
    ) {

      const slide =
        this.slides[index];


      if (!slide) {
        return;
      }


      this.currentIndex =
        index;


      const slideLeft =
        slide.offsetLeft;


      this.track.scrollTo({
        left: slideLeft,
        behavior: smooth
          ? 'smooth'
          : 'auto'
      });


      this.updateUI();

    }


    /* =========================================
       GO TO MEDIA BY MEDIA ID
       ========================================= */

    goToMediaId(
      mediaId,
      smooth = true
    ) {

      if (!mediaId) {
        return;
      }


      const index =
        this.slides.findIndex(
          slide =>
            String(
              slide.dataset.mediaId
            ) ===
            String(mediaId)
        );


      if (index === -1) {

        console.warn(
          'Variant featured media was not found in gallery:',
          mediaId
        );

        return;

      }


      this.goToSlide(
        index,
        smooth
      );

    }


    /* =========================================
       UPDATE UI
       ========================================= */

    updateUI() {


      /* -----------------------------------------
         Slides
         ----------------------------------------- */

      this.slides.forEach(
        (slide, index) => {

          const active =
            index === this.currentIndex;


          slide.classList.toggle(
            'is-active',
            active
          );


          if (active) {

            slide.removeAttribute(
              'aria-hidden'
            );

          } else {

            slide.setAttribute(
              'aria-hidden',
              'true'
            );

          }

        }
      );


      /* -----------------------------------------
         Thumbnails
         ----------------------------------------- */

      this.thumbnails.forEach(
        thumbnail => {

          const index =
            Number(
              thumbnail.dataset.thumbnailIndex
            );


          const active =
            index === this.currentIndex;


          thumbnail.classList.toggle(
            'is-active',
            active
          );


          thumbnail.setAttribute(
            'aria-current',
            active
              ? 'true'
              : 'false'
          );

        }
      );


      /* -----------------------------------------
         Dots
         ----------------------------------------- */

      this.dots.forEach(
        dot => {

          let index;


          if (
            dot.dataset.dotIndex !== undefined
          ) {

            index =
              Number(
                dot.dataset.dotIndex
              );

          } else {

            index =
              Number(
                dot.dataset.mobileDotIndex
              );

          }


          dot.classList.toggle(
            'is-active',
            index === this.currentIndex
          );

        }
      );


      /* -----------------------------------------
         Counter
         ----------------------------------------- */

      const current =
        this.currentIndex + 1;


      if (this.counterCurrent) {

        this.counterCurrent.textContent =
          current;

      }


      if (this.mobileCounterCurrent) {

        this.mobileCounterCurrent.textContent =
          current;

      }


      /* -----------------------------------------
         Active thumbnail into view
         ----------------------------------------- */

      this.scrollActiveThumbnailIntoView();

    }


    /* =========================================
       ACTIVE THUMBNAIL AUTO SCROLL
       ========================================= */

    scrollActiveThumbnailIntoView() {

      const activeThumbnail =
        this.thumbnails.find(
          thumbnail =>
            Number(
              thumbnail.dataset.thumbnailIndex
            ) ===
            this.currentIndex
        );


      if (!activeThumbnail) {
        return;
      }


      activeThumbnail.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest'
      });

    }


    /* =========================================
       THUMBNAIL ARROWS
       ========================================= */

    scrollThumbnails(
      direction
    ) {

      const track =
        this.gallery.querySelector(
          '.custom-media-gallery__desktop-pagination .custom-media-gallery__thumbnail-track'
        );


      if (!track) {
        return;
      }


      const vertical =
        window.matchMedia(
          '(min-width: 990px)'
        ).matches &&
        (
          this.gallery.classList.contains(
            'custom-media-gallery--thumb-left'
          ) ||
          this.gallery.classList.contains(
            'custom-media-gallery--thumb-right'
          )
        );


      if (vertical) {

        track.scrollBy({
          top:
            direction * 150,
          behavior:
            'smooth'
        });

      } else {

        track.scrollBy({
          left:
            direction * 150,
          behavior:
            'smooth'
        });

      }

    }


    /* =========================================
       MANUAL SCROLL DETECTION
       ========================================= */

    handleScroll() {

      if (
        this._scrollTimer
      ) {

        clearTimeout(
          this._scrollTimer
        );

      }


      this._scrollTimer =
        setTimeout(
          () => {

            const scrollLeft =
              this.track.scrollLeft;


            let closestIndex =
              0;


            let closestDistance =
              Infinity;


            this.slides.forEach(
              (slide, index) => {

                const distance =
                  Math.abs(
                    slide.offsetLeft -
                    scrollLeft
                  );


                if (
                  distance <
                  closestDistance
                ) {

                  closestDistance =
                    distance;

                  closestIndex =
                    index;

                }

              }
            );


            if (
              closestIndex !==
              this.currentIndex
            ) {

              this.currentIndex =
                closestIndex;

              this.updateUI();

            }

          },
          80
        );

    }

  }


  /* =========================================
     INITIALIZE GALLERIES
     ========================================= */

  function initializeGalleries(
    root = document
  ) {

    const galleries =
      root.querySelectorAll(
        'media-gallery.custom-media-gallery'
      );


    galleries.forEach(
      gallery => {

        if (
          gallery.dataset.galleryInitialized ===
          'true'
        ) {

          return;

        }


        gallery.dataset.galleryInitialized =
          'true';


        new ProductMediaGallery(
          gallery
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

        initializeGalleries();

      }
    );

  } else {

    initializeGalleries();

  }


  /* =========================================
     SHOPIFY THEME EDITOR
     ========================================= */

  document.addEventListener(
    'shopify:section:load',
    event => {

      initializeGalleries(
        event.target
      );

    }
  );


  document.addEventListener(
    'shopify:block:select',
    event => {

      const gallery =
        event.target.closest(
          'media-gallery.custom-media-gallery'
        );


      if (gallery) {

        initializeGalleries(
          gallery.parentElement
        );

      }

    }
  );

})();