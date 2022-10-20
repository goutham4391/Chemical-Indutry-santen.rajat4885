// name space
var santenWebsiteScripts = santenWebsiteScripts || {};

santenWebsiteScripts.ua = window.navigator.userAgent.toLowerCase();



// local scope
// ==========================================================
(function($, window, document, undefined){


  // on load
  // ==========================================================
  $(function(){

    if($('.js_rollover-image').length) {
      $('.js_rollover-image').each(function() {
        var img = $(this);
        var defImage = $(this).attr('src');
        var onImage = $(this).data('hover');        
        if(defImage !== undefined && onImage !== undefined) {
          img.parent('a').hover(function() {
            img.attr('src', onImage);
          }, function() {
            img.attr('src', defImage);
          });
        }
      });
    }

    window.onpageshow = function(event) {
      if (event.persisted) {
        if ($('.js_rollover-image').length) {
          $('.js_rollover-image').each(function() {
            $(this).hide();
          });
          window.location.reload();
        }
      }
    };

    if($('.js_popup').length) {
      $(".js_popup").click(function(){
        window.open($(this).attr('href'), 'window', 'width=720, height=580, menubar=0, toolbar=0, scrollbars=1, resizable=0');
        return false;
      });
    }
  }); // on load

  //wait image load
  $(window).on('load',function(){
    if($('#js_slide-airplane').length) {
      //slide
      $('#js_slide-airplane').slick({
        autoplay: false,
        autoplaySpeed: 3000,
        arrows:true,
        dots:false,
        accessibility:false,
        asNavFor: '#js_slide-airplane-thumb',
        prevArrow:'#js_slide-prevArrow',
        nextArrow:'#js_slide-nextArrow',
        responsive:[
          {
            breakpoint:1024,
            settings:{
              adaptiveHeight:false,
            }
          }
        ]
      });
      $('#js_slide-airplane-thumb').slick({
        fade:false,
        autoplay:false,
        arrows:false,
        dots:false,
        focusOnSelect:true,
        centerMode:true,
        centerPadding:'0px',
        accessibility:false,
        draggable:false,
        swipe:false,
        touchMove:false,
        slidesToShow: 9,
        slidesToScroll: 1,
        asNavFor:'#js_slide-airplane',
        responsive:[
          {
            breakpoint:1279,
            settings:{
              slidesToShow: 7
            }
          },
          {
            breakpoint:1024,
            settings:{
              slidesToShow: 5
            }
          },
          {
            breakpoint:639,
            settings:{
              slidesToShow: 3,
              draggable:true,
              swipe:false,
              touchMove:false,
            }
          }
        ]
      });

      //slide startBtn
      $(document).on('click', '#js_slide-startImg', function (e) {
        if($('#js_slide-airplane').hasClass('slick-initialized')){
          $(e.currentTarget).addClass('sliderStart');
          $('#js_sliderArea-main').addClass('sliderStart');
          $('#js_slide-airplane').slick('slickPlay');
        }
      });
    }
  })

})(jQuery, this, this.document);
