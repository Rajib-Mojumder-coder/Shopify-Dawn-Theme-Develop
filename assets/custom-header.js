// Desktop Inside megamenu slider js
document.querySelectorAll('.mega-slider').forEach((slider) => {

    new Swiper(slider,{
        slidesPerView:1,
        loop:true,
        speed:700,
        spaceBetween:20,
        autoplay:{
        delay:4000
        },

        pagination:{
            el:slider.querySelector('.swiper-pagination'),
            clickable:true
        },

        navigation:{
            nextEl:slider.querySelector('.swiper-button-next'),
            prevEl:slider.querySelector('.swiper-button-prev')
        }

    });

});

//Mobile cart drawer js 

document.addEventListener("DOMContentLoaded", () => {

    /* ==========================================================
       Elements
    ========================================================== */

    const drawer = document.getElementById("mobile-drawer");

    if (!drawer) return;

    const openButton = document.querySelector("[data-drawer-toggle]");
    const closeButtons = drawer.querySelectorAll("[data-drawer-close]");

    const submenuList = drawer.querySelector("#mobile-submenu-list");
    const submenuTitle = drawer.querySelector(".custom-mobile-submenu-panel__title");
    const backButton = drawer.querySelector("[data-mobile-back]");

    const triggers = drawer.querySelectorAll("[data-mobile-trigger]");

    let activeTrigger = null;


    /* ==========================================================
       Helper Functions
    ========================================================== */

    function resetSubmenu() {

        drawer.classList.remove("show-submenu");

        submenuList.innerHTML = "";
        submenuTitle.textContent = "";

        if (activeTrigger) {
            activeTrigger.setAttribute("aria-expanded", "false");
            activeTrigger = null;
        }

    }


    function openDrawer() {

        drawer.classList.add("is-open");

        document.body.classList.add("overflow-hidden");

        drawer.setAttribute("aria-hidden", "false");

        if (openButton) {
            openButton.setAttribute("aria-expanded", "true");
        }

        resetSubmenu();

    }


    function closeDrawer() {

        drawer.classList.remove("is-open");

        document.body.classList.remove("overflow-hidden");

        drawer.setAttribute("aria-hidden", "true");

        if (openButton) {
            openButton.setAttribute("aria-expanded", "false");
            openButton.focus();
        }

        resetSubmenu();

    }


    function openSubmenu(trigger) {

        const menuItem = trigger.closest("[data-menu-item]");

        if (!menuItem) return;

        const template = menuItem.querySelector(".custom-mobile-menu-template");

        if (!template) return;

        if (activeTrigger) {
            activeTrigger.setAttribute("aria-expanded", "false");
        }

        activeTrigger = trigger;

        submenuList.innerHTML = template.innerHTML;

        submenuTitle.textContent = trigger.dataset.menuTitle;

        drawer.classList.add("show-submenu");

        activeTrigger.setAttribute("aria-expanded", "true");

        if (backButton) {
            backButton.focus();
        }

    }


    function closeSubmenu() {

        drawer.classList.remove("show-submenu");

        submenuList.innerHTML = "";

        submenuTitle.textContent = "";

        if (activeTrigger) {

            activeTrigger.setAttribute("aria-expanded", "false");

            activeTrigger.focus();

            activeTrigger = null;

        }

    }


    /* ===================       Drawer Open====================== */

    if (openButton) {

        openButton.addEventListener("click", openDrawer);

    }


    /* ===================== Drawer Close==================== */

    closeButtons.forEach(button => {
        button.addEventListener("click", closeDrawer);

    });


    /* ==================       ESC Key   =================== */

    document.addEventListener("keydown", event => {

        if (event.key === "Escape" && drawer.classList.contains("is-open")) {

            closeDrawer();

        }

    });


    /* ==============       Open Submenu =============== */

    triggers.forEach(trigger => {

        trigger.addEventListener("click", () => {

            openSubmenu(trigger);

        });

    });


    /* ===============  Back Button =========================== */

    if (backButton) {

        backButton.addEventListener("click", closeSubmenu);

    }

});



//old code
// const drawer = document.getElementById('mobile-drawer');
// const openButton = document.querySelector('[data-drawer-toggle]');
// const closeButtons = document.querySelectorAll('[data-drawer-close]');

// if(drawer && openButton){

//     openButton.addEventListener('click',()=>{
//         drawer.classList.add('is-open');
//         document.body.classList.add('overflow-hidden');
//         openButton.setAttribute('aria-expanded','true');
//         drawer.setAttribute('aria-hidden','false');
//     });

// }

// closeButtons.forEach(button=>{

//     button.addEventListener("click", () => {

//     drawer.classList.remove("is-open");
//     drawer.classList.remove("show-submenu");

//     document.body.classList.remove("overflow-hidden");

//     openButton.setAttribute("aria-expanded", "false");
//     drawer.setAttribute("aria-hidden", "true");

//     submenuList.innerHTML = "";
//     submenuTitle.textContent = "";

//     if (activeTrigger) {
//         activeTrigger.setAttribute("aria-expanded", "false");
//         activeTrigger = null;
//     }

//     });
// });

// // Drawer Submenu Controller
// document.addEventListener("DOMContentLoaded", () => {

//   const drawer = document.getElementById("mobile-drawer");
//   if (!drawer) return;

//   const triggers = drawer.querySelectorAll("[data-mobile-trigger]");
//   const submenuPanel = drawer.querySelector("[data-panel='submenu']");
//   const submenuList = drawer.querySelector("#mobile-submenu-list");
//   const submenuTitle = drawer.querySelector(".custom-mobile-submenu-panel__title");
//   const backButton = drawer.querySelector("[data-mobile-back]");

//   let activeTrigger = null;
//   triggers.forEach(trigger => {

//   trigger.addEventListener("click", () => {

//     const menuItem = trigger.closest("[data-menu-item]");
//     const template = menuItem.querySelector(".custom-mobile-menu-template");

//     if (!template) return;

//     activeTrigger = trigger;

//     submenuList.innerHTML = template.innerHTML;
//     submenuTitle.textContent = trigger.dataset.menuTitle;

//     drawer.classList.add("show-submenu");

//     activeTrigger.setAttribute("aria-expanded", "true");

//   });

// });

//     backButton.addEventListener("click", () => {

//   drawer.classList.remove("show-submenu");

//   submenuList.innerHTML = "";
//   submenuTitle.textContent = "";

//   if (activeTrigger) {

//     activeTrigger.setAttribute("aria-expanded", "false");

//     activeTrigger.focus();

//     activeTrigger = null;

//   }

// });