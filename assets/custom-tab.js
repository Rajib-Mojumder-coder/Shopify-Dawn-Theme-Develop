(function () {
  function equalizeCustomTabs() {
    document.querySelectorAll('.custom-tab').forEach(function (tab) {
      const contents = tab.querySelectorAll('.tab-content');

      if (!contents.length) return;

      // Reset previous height
      contents.forEach(function (content) {
        content.style.minHeight = '';
      });

      let maxHeight = 0;

      contents.forEach(function (content) {
        const originalDisplay = content.style.display;
        const originalPosition = content.style.position;
        const originalVisibility = content.style.visibility;

        content.style.display = 'block';
        content.style.position = 'absolute';
        content.style.visibility = 'hidden';

        maxHeight = Math.max(maxHeight, content.offsetHeight);

        content.style.display = originalDisplay;
        content.style.position = originalPosition;
        content.style.visibility = originalVisibility;
      });

      contents.forEach(function (content) {
        content.style.minHeight = maxHeight + 'px';
      });
    });
  }

  // Normal storefront load
  document.addEventListener('DOMContentLoaded', equalizeCustomTabs);

  // Browser resize
  window.addEventListener('resize', equalizeCustomTabs);

  // Shopify Theme Editor
  document.addEventListener('shopify:section:load', function () {
    equalizeCustomTabs();
  });
})();