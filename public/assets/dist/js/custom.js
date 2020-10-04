$(document).ready(function () {

   

    // init wow js for animation in viewport 

    new WOW().init();


    // init primary nav js 

    jQuery('.stellarnav').stellarNav({
        theme: 'light',
        sticky: false,
        position: 'left',
        closeBtn: false,
        showArrows: true,
    });


    // init sticky js for nav in layout three

    $(".fixed-nav").sticky({ topSpacing: 0 });


    // Init swiper for layout one banner

    var swiper = new Swiper('.swiper-container', {
        slidesPerView: 3,
        spaceBetween: 0,
        freeMode: false,
        nav: true,
        loop: true,

        autoplay: {
            delay: 3000,
        },

        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },

        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },

        breakpoints: {
            1024: {
                slidesPerView: 2,
                spaceBetween: 0,
            },
            768: {
                slidesPerView: 2,
                spaceBetween: 0,
            },
            640: {
                slidesPerView: 2,
                spaceBetween: 0,
            },
            450: {
                slidesPerView: 1,
                spaceBetween: 0,
            }
        },
    });


    //  init swiper for layout two

    var swiper = new Swiper('.banner-style-two-container', {
        slidesPerView: 1,
        spaceBetween: 0,
        freeMode: true,
        nav: true,
        loop: true,

        autoplay: {
            delay: 5000,
        },

        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },

        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
    });


    // init swiper for inpost gallery 

    var swiper = new Swiper('.inpostgallery-container', {
        slidesPerView: 'auto',
        centeredSlides: false,
        spaceBetween: 0,
        nav: true,
        slidesPerView: 1,
        effect: 'slide',
        autoplay: {
            delay: 2000,
        },
        pagination: false,

        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },

    });


    // init swiper for sidebar recent post gallery

    var swiper = new Swiper('.widget-rpag-gallery-container', {
        slidesPerView: 1,
        centeredSlides: false,
        spaceBetween: 0,
        nav: false,
        slidesPerView: 1,
        effect: 'slide',
        pagination: false,

        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },

    });


    // init social sharing network 

    $(".share").jsSocials({
        shares: ["facebook", "twitter", "email", "pinterest", "pocket", "googleplus", "linkedin"],
        showLabel: false,
        showCount: false,
        shareIn: "popup",
    });


    // Init masonary for home layout four


    $('.masonry-grid').masonry({
        itemSelector: '.grid-item',
    });
    setTimeout(function () {
        $('.masonry-grid').masonry({
            itemSelector: '.grid-item',
        });
    }, 5000);


    // init slider ( owl 2 ) for home layout four 

    var owl2 = $('.banner-style-four-container');
    owl2.owlCarousel({
        items: 3,
        loop: true,
        margin: 10,
        nav: true,
        rtl: false,
        dots: false,
        autoplay: true,
        autoplayTimeout: 3000,
        autoplayHoverPause: true,
        navText: ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i>"],
        responsive: {
            0: {
                items: 1
            },
            768: {
                items: 2
            },
            992: {
                items: 2
            },
            1024: {

                items: 2
            },
            1200: {
                items: 3
            }
        }
    });


    // init owl for related post layout one

    var owl3 = $('.related-post-carousel');
    owl3.owlCarousel({
        items: 2,
        loop: true,
        margin: 40,
        nav: true,
        dots: false,
        autoplay: true,
        autoplayTimeout: 4000,
        autoplayHoverPause: true,
        navText: ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i>"],
        responsive: {
            0: {
                items: 1
            },
            768: {
                items: 2
            },
            992: {
                items: 2
            },
            1200: {
                items: 2
            }
        }
    });



    // Owl for related post with 3 items for full layout

    var owl4 = $('.related-post-carousel-three-cards');
    owl4.owlCarousel({
        items: 3,
        loop: true,
        margin: 40,
        nav: true,
        dots: false,
        autoplay: true,
        autoplayTimeout: 4000,
        autoplayHoverPause: true,
        navText: ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i>"],
        responsive: {
            0: {
                items: 1
            },
            768: {
                items: 2
            },
            992: {
                items: 3
            },
            1200: {
                items: 3
            }
        }
    });


    $.get("/post",(data)=>{
        
    }).then((data)=>{
        //console.log(data)
        for(let i=0;i<data.length;i++){
            let newArticle=$("<article>");
            newArticle.attr("class","post-details-holder layout-two-post-details-holder");
            let div1=$("<div>");
            div1.attr("class","row");
            let div2=$("<div>");
            div2.attr("class","col-lg-5 col-md-5 col-sm-5 col-xs-12");
            let div3=$("<div>");
            div3.attr("class","post-image");
            let postImg=$("<img>");
            postImg.attr("src",data[i].imagen);
            let div4=$("<div>");
            div4.attr("class","col-lg-7 col-md-7 col-sm-7 col-xs-12");
            let divTitulo=$("<div>");
            divTitulo.attr("class","post-title")
            let titulo=$("<h2>");
            let link=$("<a>");
            link.attr("href",data[i].url);
            link.text(data[i].titulo);
            let divFecha=$("<div>");
            divFecha.attr("class","post-meta-posted-date");
            let pFecha=$("<p>");
            pFecha.text(data[i].createdAt);
            let div5=$("<div>");
            div5.attr("class","post-share");
            let divShare=$("<div>");
            divShare.attr("class","share")

            // Creacion de los Post


        }
    })
   

});

/*
************************************
*
* End of document ready functions
*
************************************
*/