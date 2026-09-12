(() => {
  class CustomProductMediaGallery {
    constructor(root) {
      this.root = root;

      this.track = root.querySelector("[data-media-track]");
      this.slides = [...root.querySelectorAll("[data-media-slide]")];

      this.prevButton = root.querySelector("[data-gallery-prev]");
      this.nextButton = root.querySelector("[data-gallery-next]");

      this.thumbnails = [
        ...root.querySelectorAll("[data-thumbnail]")
      ];

      this.thumbnailTracks = [
        ...root.querySelectorAll("[data-thumbnail-track]")
      ];

      this.lightbox = root.querySelector("[data-lightbox]");
      this.lightboxContent = root.querySelector("[data-lightbox-content]");
      this.lightboxClose = root.querySelector("[data-lightbox-close]");

      this.variantMapElement = root.querySelector(
        "[data-variant-media-map]"
      );

      this.activeIndex = 0;

      this.variantMap = this.readVariantMap();

      this.init();
    }


    /* =====================================================
       INITIALIZE
       ===================================================== */

    init() {
      if (!this.track || !this.slides.length) {
        return;
      }

      this.bindNavigation();

      this.bindThumbnails();

      this.bindMediaOpening();

      this.bindLightbox();

      this.observeSlides();

      this.bindVariantChanges();

      this.updateState(0);

      this.updateNavigation();

      this.setInitialVariantMedia();
    }


    /* =====================================================
       VARIANT MAP
       ===================================================== */

    readVariantMap() {
      if (!this.variantMapElement) {
        return [];
      }

      try {
        return JSON.parse(
          this.variantMapElement.textContent
        );
      } catch (error) {
        console.warn(
          "Product media gallery: unable to read variant map.",
          error
        );

        return [];
      }
    }


    /* =====================================================
       NAVIGATION
       ===================================================== */

    bindNavigation() {
      this.prevButton?.addEventListener("click", () => {
        this.goPrevious();
      });

      this.nextButton?.addEventListener("click", () => {
        this.goNext();
      });
    }


    goNext() {
      if (!this.slides.length) {
        return;
      }

      const nextIndex = Math.min(
        this.activeIndex + 1,
        this.slides.length - 1
      );

      this.goTo(nextIndex);
    }


    goPrevious() {
      if (!this.slides.length) {
        return;
      }

      const previousIndex = Math.max(
        this.activeIndex - 1,
        0
      );

      this.goTo(previousIndex);
    }


    goTo(index, behavior = "smooth") {
      const slide = this.slides[index];

      if (!slide || !this.track) {
        return;
      }

      this.track.scrollTo({
        left: slide.offsetLeft,
        behavior
      });

      this.updateState(index);
    }


    /* =====================================================
       THUMBNAILS
       ===================================================== */

    bindThumbnails() {
      this.thumbnails.forEach((thumbnail) => {
        thumbnail.addEventListener("click", () => {
          const index = Number(
            thumbnail.dataset.mediaIndex
          );

          this.goTo(index);
        });
      });
    }


    updateThumbnails(index) {
      const activeSlide = this.slides[index];

      if (!activeSlide) {
        return;
      }

      const mediaId = activeSlide.dataset.mediaId;

      this.thumbnails.forEach((thumbnail) => {
        const active =
          thumbnail.dataset.mediaId === mediaId;

        thumbnail.classList.toggle(
          "is-active",
          active
        );

        thumbnail.setAttribute(
          "aria-current",
          active ? "true" : "false"
        );
      });

      const activeThumbnail = this.thumbnails.find(
        (thumbnail) =>
          thumbnail.dataset.mediaId === mediaId
      );

      activeThumbnail?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest"
      });
    }


    /* =====================================================
       INTERSECTION OBSERVER
       ===================================================== */

    observeSlides() {
      if (!("IntersectionObserver" in window)) {
        return;
      }

      this.observer = new IntersectionObserver(
        (entries) => {
          let bestEntry = null;

          entries.forEach((entry) => {
            if (
              entry.isIntersecting &&
              (!bestEntry ||
                entry.intersectionRatio >
                  bestEntry.intersectionRatio)
            ) {
              bestEntry = entry;
            }
          });

          if (!bestEntry) {
            return;
          }

          const index = Number(
            bestEntry.target.dataset.mediaIndex
          );

          this.updateState(index);
        },
        {
          root: this.track,
          threshold: [0.5, 0.75, 0.9]
        }
      );

      this.slides.forEach((slide) => {
        this.observer.observe(slide);
      });
    }


    /* =====================================================
       STATE
       ===================================================== */

    updateState(index) {
      if (!this.slides[index]) {
        return;
      }

      this.activeIndex = index;

      this.slides.forEach((slide, slideIndex) => {
        slide.classList.toggle(
          "is-active",
          slideIndex === index
        );
      });

      this.updateThumbnails(index);

      this.updatePagination(index);

      this.updateNavigation();

      this.dispatchMediaChange();
    }


    /* =====================================================
       NAVIGATION STATE
       ===================================================== */

    updateNavigation() {
      if (!this.slides.length) {
        return;
      }

      if (this.prevButton) {
        this.prevButton.disabled =
          this.activeIndex <= 0;
      }

      if (this.nextButton) {
        this.nextButton.disabled =
          this.activeIndex >=
          this.slides.length - 1;
      }
    }


    /* =====================================================
       PAGINATION
       ===================================================== */

    updatePagination(index) {
      const dots = this.root.querySelectorAll(
        "[data-pagination-dots] button"
      );

      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle(
          "is-active",
          dotIndex === index
        );
      });

      const mobileDots =
        this.root.querySelectorAll(
          "[data-mobile-pagination-dots] button"
        );

      mobileDots.forEach((dot, dotIndex) => {
        dot.classList.toggle(
          "is-active",
          dotIndex === index
        );
      });

      const counter = this.root.querySelector(
        "[data-pagination-counter]"
      );

      if (counter) {
        counter.textContent =
          `${index + 1} / ${this.slides.length}`;
      }

      const mobileCounter =
        this.root.querySelector(
          "[data-mobile-pagination-counter]"
        );

      if (mobileCounter) {
        mobileCounter.textContent =
          `${index + 1} / ${this.slides.length}`;
      }
    }


    /* =====================================================
       MEDIA OPEN
       ===================================================== */

    bindMediaOpening() {
      const buttons = this.root.querySelectorAll(
        "[data-media-open]"
      );

      buttons.forEach((button) => {
        button.addEventListener("click", () => {
          const slide = button.closest(
            "[data-media-slide]"
          );

          if (!slide) {
            return;
          }

          this.openLightbox(slide);
        });
      });
    }


    /* =====================================================
       LIGHTBOX
       ===================================================== */

    bindLightbox() {
      this.lightboxClose?.addEventListener(
        "click",
        () => {
          this.closeLightbox();
        }
      );

      this.lightbox?.addEventListener(
        "click",
        (event) => {
          if (
            event.target === this.lightbox
          ) {
            this.closeLightbox();
          }
        }
      );
    }


    openLightbox(slide) {
      if (!this.lightbox || !this.lightboxContent) {
        return;
      }

      const mediaContent =
        slide.querySelector(
          "[data-media-content]"
        );

      if (!mediaContent) {
        return;
      }

      this.lightboxContent.innerHTML = "";

      const clone =
        mediaContent.cloneNode(true);

      const button =
        clone.querySelector(
          "[data-media-open]"
        );

      button?.removeAttribute("data-media-open");

      this.lightboxContent.appendChild(clone);

      if (
        typeof this.lightbox.showModal ===
        "function"
      ) {
        this.lightbox.showModal();
      } else {
        this.lightbox.setAttribute(
          "open",
          ""
        );
      }

      document.documentElement.classList.add(
        "custom-media-lightbox-open"
      );
    }


    closeLightbox() {
      if (!this.lightbox) {
        return;
      }

      if (
        typeof this.lightbox.close ===
        "function"
      ) {
        this.lightbox.close();
      } else {
        this.lightbox.removeAttribute(
          "open"
        );
      }

      this.lightboxContent.innerHTML = "";

      document.documentElement.classList.remove(
        "custom-media-lightbox-open"
      );
    }


    /* =====================================================
       VARIANT SUPPORT
       ===================================================== */

    bindVariantChanges() {

      /*
       * Integration method #1:
       * Listen for common custom variant events.
       */

      this.root.closest(
        "product-info"
      )?.addEventListener(
        "variant:change",
        (event) => {
          const variant =
            event.detail?.variant;

          if (variant?.id) {
            this.setVariantMedia(
              variant.id
            );
          }
        }
      );


      this.root.closest(
        "product-info"
      )?.addEventListener(
        "variant-change",
        (event) => {
          const variant =
            event.detail?.variant;

          if (variant?.id) {
            this.setVariantMedia(
              variant.id
            );
          }
        }
      );


      /*
       * Integration method #2:
       * Observe the product form's hidden
       * variant ID.
       */

      const productInfo =
        this.root.closest(
          "product-info"
        );

      if (!productInfo) {
        return;
      }

      const variantInput =
        productInfo.querySelector(
          'input[name="id"]'
        );

      if (!variantInput) {
        return;
      }

      this.lastVariantId =
        variantInput.value;

      this.variantMutationObserver =
        new MutationObserver(() => {
          this.checkVariantInput(
            variantInput
          );
        });

      this.variantMutationObserver.observe(
        variantInput,
        {
          attributes: true,
          attributeFilter: [
            "value"
          ]
        }
      );


      variantInput.addEventListener(
        "change",
        () => {
          this.checkVariantInput(
            variantInput
          );
        }
      );
    }


    checkVariantInput(input) {
      const variantId =
        input.value;

      if (
        !variantId ||
        variantId ===
          this.lastVariantId
      ) {
        return;
      }

      this.lastVariantId =
        variantId;

      this.setVariantMedia(
        variantId
      );
    }


    setInitialVariantMedia() {
      const productInfo =
        this.root.closest(
          "product-info"
        );

      const variantInput =
        productInfo?.querySelector(
          'input[name="id"]'
        );

      if (variantInput?.value) {
        this.setVariantMedia(
          variantInput.value,
          false
        );
      }
    }


    setVariantMedia(
      variantId,
      smooth = true
    ) {
      const mapping =
        this.variantMap.find(
          (item) =>
            String(item.id) ===
            String(variantId)
        );

      if (
        !mapping ||
        !mapping.mediaId
      ) {
        return;
      }

      const index =
        this.slides.findIndex(
          (slide) =>
            String(
              slide.dataset.mediaId
            ) ===
            String(mapping.mediaId)
        );

      if (index === -1) {
        return;
      }

      this.goTo(
        index,
        smooth ? "smooth" : "auto"
      );
    }


    /* =====================================================
       PUBLIC EVENT
       ===================================================== */

    dispatchMediaChange() {
      const slide =
        this.slides[
          this.activeIndex
        ];

      if (!slide) {
        return;
      }

      this.root.dispatchEvent(
        new CustomEvent(
          "product-media:change",
          {
            bubbles: true,
            detail: {
              mediaId:
                slide.dataset.mediaId,
              index:
                this.activeIndex
            }
          }
        )
      );
    }
  }


  /* =======================================================
     CREATE GALLERIES
     ======================================================= */

  function initProductMediaGalleries(
    container = document
  ) {

    const galleries =
      container.querySelectorAll(
        "[data-media-gallery]"
      );

    galleries.forEach((gallery) => {

      if (
        gallery.dataset.galleryInitialized ===
        "true"
      ) {
        return;
      }

      gallery.dataset.galleryInitialized =
        "true";

      new CustomProductMediaGallery(
        gallery
      );
    });
  }


  /* =======================================================
     DOM READY
     ======================================================= */

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      () => {
        initProductMediaGalleries();
      }
    );

  } else {

    initProductMediaGalleries();

  }


  /* =======================================================
     SHOPIFY THEME EDITOR
     ======================================================= */

  document.addEventListener(
    "shopify:section:load",
    (event) => {
      initProductMediaGalleries(
        event.target
      );
    }
  );

})();