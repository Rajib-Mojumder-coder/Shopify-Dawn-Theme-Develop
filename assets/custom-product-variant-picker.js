document.addEventListener("click", function (e) {

  // Website-e joto dropdown ache, sobgulo select koro
  const dropdowns = document.querySelectorAll(".custom-product-variant__dropdown");

  // Prottek dropdown-er upor alada kore kaj korbo
  dropdowns.forEach(function (dropdown) {

    // Current dropdown-er button
    const button = dropdown.querySelector(".custom-product-variant__dropdown-toggle");

    // Current dropdown-er selected text
    const value = dropdown.querySelector(".custom-product-variant__dropdown-value");

    // Current option-er legend er selected value
    const labelSelectedValue = dropdown
    .closest(".custom-product-variant__option")
    .querySelector("[data-selected-value]");
    // Current dropdown-er hidden input
    // Form submit hole ei value Shopify receive korbe
    const input = dropdown.querySelector(".custom-product-variant__hidden-input");


    /*===========  1. OPEN / CLOSE DROPDOWN=======*/

    // User ki current dropdown-er button-e click korse?
    if (button.contains(e.target)) {

      // Jodi close thake open hobe
      // Jodi open thake close hobe
      dropdown.classList.toggle("is-open");

      // Nicher code ar execute hobe na
      return;
    }

    /*===========. OPTION SELECT=======*/

    // User kono option item-e click korse kina dekho
    const item = e.target.closest(".custom-product-variant__dropdown-item");

    // Item paoa gelo?
    // Ebong oi item current dropdown-er vitorei ache?
    if (item && dropdown.contains(item)) {
      // Button-er text update koro
      value.textContent = item.dataset.value;
      // Label-er pasher selected value update koro
    labelSelectedValue.textContent = item.dataset.value;
      // Hidden input-er value update koro
      // Shopify Form submit hole eta pathabe
      input.value = item.dataset.value;
      // Sob option theke selected class remove koro
      dropdown
        .querySelectorAll(".custom-product-variant__dropdown-item")
        .forEach(function (i) {
          i.classList.remove("selected");
        });
      // Current clicked option-ke selected koro
      item.classList.add("selected");

      // Option select hole dropdown close hoye jabe
      dropdown.classList.remove("is-open");
      // Browser nije theke hidden input-er change event fire kore na
      // Tai manually Shopify-ke boli value change hoyeche
      input.dispatchEvent(

        new Event("change", {
          bubbles: true
        })

      );

    }
    /*============== 3. CLICK OUTSIDE========*/

    // User jodi dropdown-er baire click kore
    if (!dropdown.contains(e.target)) {

      // Dropdown close kore dao
      dropdown.classList.remove("is-open");

    }
  });
});


{% comment %} Tumi jodi JavaScript bhalo vabe shikhte chao, tahole short code likhar cheshta ekhon korba na. Borong ei order-e practice koro:

DOM Selectors (querySelector, querySelectorAll)
Events (click, change)
Loop (forEach)
Class Manipulation (add, remove, toggle)
Dataset (data-value)
contains() & closest()
Custom Events (dispatchEvent)


class CustomVariantDropdown {

    constructor(dropdown){

        ...

    }

    open(){

    }

    close(){

    }

    select(){

    }

}
 {% endcomment %}


