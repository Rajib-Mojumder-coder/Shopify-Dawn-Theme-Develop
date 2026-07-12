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