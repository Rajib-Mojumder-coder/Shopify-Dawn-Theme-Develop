(() => {
  'use strict';

  class ProductMediaGallery {
    constructor(gallery) {
      this.gallery = gallery;

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

      this.currentIndex = this.getInitialIndex();

      if (!this.track || !this.slides.length) {
        return;
      }

      this.bindEvents();

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
      const activeSlide = this.slides.findIndex(
        slide =>
          slide.classList.contains('is-active')
      );

      return activeSlide >= 0
        ? activeSlide
        : 0;
    }


    /* =========================================
       EVENTS
       ========================================= */

    bindEvents() {

      /* Main previous */
      /* Main previous */
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


      /* Main next */
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


      /* Thumbnails */
      this.thumbnails.forEach(
        thumbnail => {

          thumbnail.addEventListener(
            'click',
            event => {

              event.preventDefault();

              const index = Number(
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


      /* Dots */
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
                index = Number(
                  dot.dataset.dotIndex
                );
              } else {
                index = Number(
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


      /* Thumbnail previous */
      if (this.thumbnailPrev) {
        this.thumbnailPrev.addEventListener(
          'click',
          () => {
            this.scrollThumbnails(-1);
          }
        );
      }


      /* Thumbnail next */
      if (this.thumbnailNext) {
        this.thumbnailNext.addEventListener(
          'click',
          () => {
            this.scrollThumbnails(1);
          }
        );
      }


      /* Detect manual swipe / scroll */
      this.track.addEventListener(
        'scroll',
        this.handleScroll.bind(this),
        { passive: true }
      );


      /* Keyboard support */
      this.gallery.addEventListener(
        'keydown',
        event => {

          if (event.key === 'ArrowLeft') {
            event.preventDefault();
            this.previous();
          }

          if (event.key === 'ArrowRight') {
            event.preventDefault();
            this.next();
          }

        }
      );

    }


    /* =========================================
       NEXT / PREVIOUS
       ========================================= */

    next() {

      const nextIndex =
        this.currentIndex >= this.slides.length - 1
          ? 0
          : this.currentIndex + 1;

      this.goToSlide(nextIndex);

    }


    previous() {

      const previousIndex =
        this.currentIndex <= 0
          ? this.slides.length - 1
          : this.currentIndex - 1;

      this.goToSlide(previousIndex);

    }


    /* =========================================
       GO TO SLIDE
       ========================================= */

    goToSlide(index, smooth = true) {

      const slide = this.slides[index];

      if (!slide) {
        return;
      }

      this.currentIndex = index;


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
       UPDATE UI
       ========================================= */

    updateUI() {

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


      /* Thumbnails */

      this.thumbnails.forEach(
        thumbnail => {

          const index = Number(
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


      /* Dots */

      this.dots.forEach(
        dot => {

          let index;

          if (
            dot.dataset.dotIndex !== undefined
          ) {
            index = Number(
              dot.dataset.dotIndex
            );
          } else {
            index = Number(
              dot.dataset.mobileDotIndex
            );
          }

          dot.classList.toggle(
            'is-active',
            index === this.currentIndex
          );

        }
      );


      /* Counter */

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
            ) === this.currentIndex
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

    scrollThumbnails(direction) {

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
          top: direction * 150,
          behavior: 'smooth'
        });

      } else {

        track.scrollBy({
          left: direction * 150,
          behavior: 'smooth'
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

            let closestIndex = 0;

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
     INITIALIZE
     ========================================= */

  function initializeGalleries(root = document) {

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


  /* Initial page load */
  if (
    document.readyState === 'loading'
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


  /* Shopify Theme Editor */
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