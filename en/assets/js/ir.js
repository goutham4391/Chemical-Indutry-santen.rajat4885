(function ($, window, document, undefined) {
    // on load
    // ==========================================================
    $(function () {
        $(window).on('load', function () {
            $('#ir-slide').slick({
                autoplay: false,
                arrows: true,
                dots: true,
                variableWidth: true,
                slidesToShow: 2,
                slidesToScroll: 2,
                prevArrow: '<button type="button" class="slick-prev ir-slide__arrow ir-slide__arrow--prev"></button>',
                nextArrow: '<button type="button" class="slick-next ir-slide__arrow ir-slide__arrow--next"></button>',
                responsive: [
                    {
                        breakpoint: 1080,
                        settings: {
                            slidesToShow: 1,
                            slidesToScroll: 1,
                            variableWidth: false
                        }
                    }
                ]
            });
        })
    })

})(jQuery, this, this.document);
