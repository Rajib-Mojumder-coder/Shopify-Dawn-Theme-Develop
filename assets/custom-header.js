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
const drawer = document.getElementById('mobile-drawer');
const openButton = document.querySelector('[data-drawer-toggle]');
const closeButtons = document.querySelectorAll('[data-drawer-close]');

if(drawer && openButton){

    openButton.addEventListener('click',()=>{
        drawer.classList.add('is-open');
        document.body.classList.add('overflow-hidden');
        openButton.setAttribute('aria-expanded','true');
        drawer.setAttribute('aria-hidden','false');
    });

}

closeButtons.forEach(button=>{

    button.addEventListener('click',()=>{
        drawer.classList.remove('is-open');
        document.body.classList.remove('overflow-hidden');
        openButton.setAttribute('aria-expanded','false');
        drawer.setAttribute('aria-hidden','true');
    });

});

// Drawer Submenu Controller
document.addEventListener("DOMContentLoaded", () => {

  const drawer = document.getElementById("mobile-drawer");
  if (!drawer) return;

  const triggers = drawer.querySelectorAll("[data-mobile-trigger]");
  const submenuPanel = drawer.querySelector("[data-panel='submenu']");
  const submenuList = drawer.querySelector("#mobile-submenu-list");
  const submenuTitle = drawer.querySelector(".custom-mobile-submenu-panel__title");
  const backButton = drawer.querySelector("[data-mobile-back]");

  let activeTrigger = null;
  triggers.forEach(trigger => {

  trigger.addEventListener("click", () => {

    const menuItem = trigger.closest("[data-menu-item]");
    const template = menuItem.querySelector(".custom-mobile-menu-template");

    if (!template) return;

    activeTrigger = trigger;

    submenuList.innerHTML = template.innerHTML;
    submenuTitle.textContent = trigger.dataset.menuTitle;

    drawer.classList.add("show-submenu");

    activeTrigger.setAttribute("aria-expanded", "true");

  });

});

    backButton.addEventListener("click", () => {

    drawer.classList.remove("show-submenu");

    submenuList.innerHTML = "";
    submenuTitle.textContent = "";

    if (activeTrigger) {
        activeTrigger.setAttribute("aria-expanded", "false");
        activeTrigger.focus();
        activeTrigger = null;
  }

})
;