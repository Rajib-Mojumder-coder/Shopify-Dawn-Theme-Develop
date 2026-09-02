if (!customElements.get('product-final-gallery-controller')) {
  customElements.define(
    'product-final-gallery-controller',
    class ProductFinalGalleryController extends HTMLElement {
      constructor() {
        super();

        this.gallery = this.closest('media-gallery');

        if (!this.gallery) return;

        this.viewer = this.gallery.querySelector(
          '[id^="GalleryViewer-"]'
        );

        this.viewerList = this.gallery.querySelector(
          '[id^="Slider-Gallery-"]'
        );

        this.thumbnails = this.gallery.querySelector(
          '[id^="Slider-Thumbnails-"]'
        );

        this.counterCurrent = this.gallery.querySelector(
          '.product-final-gallery__counter-current'
        );

        this.slides = [];

        this.init();
      }

      init() {
        if (!this.viewerList) return;

        this.slides = Array.from(
          this.viewerList.querySelectorAll(
            '[data-media-id]'
          )
        );

        this.setupMainNavigation();

        this.setupThumbnailNavigation();

        this.setupThumbnailClicks();

        this.setupSlideObserver();

        this.updateCounter();
      }

      setupMainNavigation() {
        const previous = this.gallery.querySelector(
          '.product-final-gallery__nav--prev'
        );

        const next = this.gallery.querySelector(
          '.product-final-gallery__nav--next'
        );

        previous?.addEventListener(
          'click',
          () => this.goToPrevious()
        );

        next?.addEventListener(
          'click',
          () => this.goToNext()
        );
      }

      setupThumbnailNavigation() {
        const thumbnailList = this.gallery.querySelector(
          '[id^="Slider-Thumbnails-"]'
        );

        if (!thumbnailList) return;

        const previous = this.gallery.querySelector(
          '.product-final-gallery__thumbnail-nav--prev'
        );

        const next = this.gallery.querySelector(
          '.product-final-gallery__thumbnail-nav--next'
        );

        previous?.addEventListener(
          'click',
          () => {
            thumbnailList.scrollBy({
              left: -300,
              behavior: 'smooth',
            });
          }
        );

        next?.addEventListener(
          'click',
          () => {
            thumbnailList.scrollBy({
              left: 300,
              behavior: 'smooth',
            });
          }
        );
      }

      setupThumbnailClicks() {
        this.gallery
          .querySelectorAll(
            '[data-target] > button'
          )
          .forEach((button) => {

            button.addEventListener(
              'click',
              () => {

                const thumbnail =
                  button.closest('[data-target]');

                if (!thumbnail) return;

                const mediaId =
                  thumbnail.dataset.target;

                this.gallery.setActiveMedia?.(
                  mediaId,
                  false
                );

              }
            );

          });
      }

      setupSlideObserver() {
        const observer =
          new IntersectionObserver(
            (entries) => {

              const visibleEntry =
                entries
                  .filter(
                    (entry) =>
                      entry.isIntersecting
                  )
                  .sort(
                    (a, b) =>
                      b.intersectionRatio -
                      a.intersectionRatio
                  )[0];

              if (!visibleEntry) return;

              const mediaId =
                visibleEntry.target.dataset.mediaId;

              this.setActiveThumbnail(
                mediaId
              );

              this.updateCounter();
            },
            {
              root: this.viewerList,
              threshold: 0.6,
            }
          );

        this.slides.forEach(
          (slide) =>
            observer.observe(slide)
        );
      }

      goToPrevious() {
        const current =
          this.getCurrentSlide();

        if (!current) return;

        const index =
          this.slides.indexOf(current);

        const previousIndex =
          index <= 0
            ? this.slides.length - 1
            : index - 1;

        this.goToSlide(
          this.slides[previousIndex]
        );
      }

      goToNext() {
        const current =
          this.getCurrentSlide();

        if (!current) return;

        const index =
          this.slides.indexOf(current);

        const nextIndex =
          index >= this.slides.length - 1
            ? 0
            : index + 1;

        this.goToSlide(
          this.slides[nextIndex]
        );
      }

      goToSlide(slide) {
        if (!slide) return;

        slide.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'start',
        });

        this.gallery.setActiveMedia?.(
          slide.dataset.mediaId,
          false
        );

        this.setActiveThumbnail(
          slide.dataset.mediaId
        );
      }

      getCurrentSlide() {
        return (
          this.slides.find(
            (slide) =>
              slide.classList.contains(
                'is-active'
              )
          ) ||
          this.slides[0]
        );
      }

      setActiveThumbnail(mediaId) {
        const thumbnails =
          this.gallery.querySelectorAll(
            '[data-target]'
          );

        thumbnails.forEach(
          (thumbnail) => {

            const button =
              thumbnail.querySelector(
                'button'
              );

            const isActive =
              thumbnail.dataset.target ===
              mediaId;

            button?.toggleAttribute(
              'aria-current',
              isActive
            );

            button?.classList.toggle(
              'is-active',
              isActive
            );

          }
        );
      }

      updateCounter() {
        if (!this.counterCurrent) return;

        const current =
          this.getCurrentSlide();

        if (!current) return;

        const index =
          this.slides.indexOf(current);

        this.counterCurrent.textContent =
          index + 1;
      }
    }
  );
}