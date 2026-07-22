/* Desktop Inside megamenu slider js */
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

/* Mobile cart drawer js */
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