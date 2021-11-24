$(document).ready (function (e) {

  // CSRF
  $.ajaxSetup({
      xhrFields: {
              withCredentials: true
          },
      data: {
          csrf_test_name: $("#csrf_hash").val()
      }
  });

});


// download buttons
$(window).on('load', function (e) {

  $("#switchstream").change(function() {
      var isChecked = $(this).prop('checked');
      if (isChecked == true) {
          $mode = 1;
      } else {
          $mode = 0;
      }
      $.ajax({
          url: "ajax/stream?stream=" + $mode
      });
      $.growl({
          title: "<i class='fa fa-check'></i> Saved",
          message: "",
          location: "tc"
      });
  });

});



// ajax register file
$(document).on('submit', '#signup-form', function(event) {

    event.preventDefault();

    console.log("submitted");

    // $('.email-modal .submit').html('<i class="fas fa-sync-alt fa-spin"></i>');
    var csrf_test_name = $("#signup-form [name='csrf_test_name']").val();
    var email = $("#signup-form [name='email']").val();
    var password = $("#signup-form [name='password']").val();
    var terms = $("#signup-form [name='register-terms']").val();

    $.ajax({
      type: "POST",
      url: '/ajax_register',
      data: {
          'csrf_test_name': csrf_test_name,
          'email': email,
          'password': password,
          'password_confirm': password,
          'register-terms': terms
      },
      success: function(response) {
        console.log("done");
        $( ".signup-step" ).toggleClass( "hide" );


        setTimeout(function(){
          window.location.href = '/dashboard?welcome=1';
        }, 1500);

        // // GA tracking
        // ga('send', {
        //   hitType: 'event',
        //   eventCategory: 'Acquisition',
        //   eventAction: 'Account created'
        // });

      },
      error: function(response) {
        $.growl({
          title: response.responseText,
          message: "",
          style: "error",
          location: "tc",
          size: "huge",
          duration: 5000
        });

        // $.growl({title: response.responseText, message: "", style: "error", location: "tc", size: "huge"});
      },
      complete: function(response) {
        // $("#signup-form .btn").toggleClass("btn--loading");
        $(".btn--loading").toggleClass("btn--loading");
        // $('.email-modal .submit').html('Send now');
      }
    });

});







// Mobile nav toggle
$(document).on('click', '.nav-mobile-toggle', function() {
    $(".navbar-nav").toggleClass("open");
    $("body").toggleClass("nav-open");
});



// Switch for monthly/annually updates
$(document).on('click', '.pricing-switch', function() {
    $(".pricing-switch").prop("checked", this.checked);
    $(".switch-data").toggleClass("hide");
});



// Alert a message when the user shares somewhere
$(document).on('click', '.share-download', function() {

    $.ajax({
        // Store flash data shared in session
        url: "download/shared"
    });

    setTimeout(function(){
        $("#shareModal").modal("hide");
        $.growl({
          title: "<i class='fa fa-check'></i> Thank you! Your turbo charged download will begin in a moment...",
          message: "",
          location: "tc",
          size: "huge",
          duration: 5000
        });
    }, 3000);


    setTimeout(function(){
        download_file();
    }, 3000);
});



$(document).on('click', '.email-file', function() {


    var recaptcha_script = document.createElement("script");
    recaptcha_script.src = "https://www.google.com/recaptcha/api.js?onload=prepCaptcha";
    document.body.appendChild(recaptcha_script);


    // prepare recaptcha explicitly to avoid requests on page load
    // prepCaptcha();

    mr.modals.closeActiveModal();

    // Show the modal
    mr.modals.showModal('.email-modal');

});





$(window).on('load', function (e) {



    // send file
  $(document).on('submit', '#email-form', function(event) {


      event.preventDefault();

      // check if sharing file or folder (not currently used?)
      var folder_slug = null;
      if(window.folder) {
        var folder_slug = window.folder["slug"];
      }

      var slug = null;
      if(window.slug) {
        var slug = window.slug;
      }

      var recipients = $(".email-modal #recipient-email").val();
      var sender = $(".email-modal #your-email").val();
      var message = $(".email-modal #email-message").val();
      var recaptcha = $(".email-modal .g-recaptcha-response").val();

      $.ajax({
        type: "POST",
        url: '/ajax/email_file',
        data: {
            'slug': slug,
            'folder_slug': folder_slug,
            'recipients': recipients,
            'sender': sender,
            'message': message,
            'recaptcha': recaptcha
        },
        success: function(response) {
          $.growl({title: response, message: "", style: "purple", location: "tc", size: "huge"});
          mr.modals.closeActiveModal();
          // Reset form
          $("#email-form")[0].reset();

        },
        error: function(response) {
          $.growl({title: response.responseText, message: "", style: "error", location: "tc", size: "huge"});
        },
        complete: function(response) {
          $(".btn--loading").toggleClass("btn--loading");
        }
      });

  });


});



// Global loading for form submits (not related to recaptcha)
$(window).on('load', function (e) {
  $(document).on('submit', 'form', function(event) {
    $(this).find("button[type=submit]").addClass("btn--loading");
  });
});




// reCAPTCHA loaded and ready to use
function recaptchaLoaded() {
  // console.log("recaptcha loaded");
  // execute required for invisible captcha
  // execute grecaptcha on login/register forms
  if (document.querySelector('.account') !== null) {
    grecaptcha.execute();
  }
  // $(document).find("button[type=submit]").removeClass("btn--loading");
}

// reCAPTCHA token returned, allow buttons to be clicked now
function recaptchaCallback(token) {
  $(document).find("button[type=submit]").removeClass("btn--loading");
 // console.log(token);
}



// prepare captcha for email-file only
var myCaptcha = null;
function prepCaptcha() {
    if (myCaptcha === null)
        myCaptcha = grecaptcha.render('g-recaptcha', {
          'sitekey' : '6LeGoQAcAAAAAFSOTDduw6JiL46jzZDEKqTuS6Wi'
        });
    else
        grecaptcha.reset(myCaptcha);
}


$(document).on('click', '.table-view', function() {
    $('#files').addClass("table");
    $('#files').removeClass("grid");
});

$(document).on('click', '.grid-view', function() {
    $('#files').addClass("grid");
    $('#files').removeClass("table");
});


//scrolls
$(window).on('load', function (e) {

  $(document).on('click', '#pricing-link', function(e) {
    // e.preventDefault();
      $('html, body').animate({
          scrollTop: $("#pricing").offset().top
      }, 500);
  });

  $(document).on('click', '#features-link', function(e) {
    // e.preventDefault();
      $('html, body').animate({
          scrollTop: $("#features").offset().top
      }, 500);
  });

  $(document).on('click', '#faq-link', function(e) {
    // e.preventDefault();
      $('html, body').animate({
          scrollTop: $("#faq").offset().top
      }, 500);
  });

});



// accidental navigate away prevention - set active as false until uploads start (via account.js & home.js)
var active = false;
window.onbeforeunload = function() {
  // console.log("exit intent");
  // console.log(active);
  return active ? "If you leave this page you will lose your unsaved changes." : null;
}










// scripts.js


window.mr = window.mr || {};

mr = (function (mr, $, window, document){
    "use strict";

    mr = mr || {};

    var components = {documentReady: [],documentReadyDeferred: [], windowLoad: [], windowLoadDeferred: []};

    mr.status = {documentReadyRan: false, windowLoadPending: false};

    $(document).ready(documentReady);
    $(window).on("load", windowLoad);

    function documentReady(context){

        context = typeof context === typeof undefined ? $ : context;
        components.documentReady.concat(components.documentReadyDeferred).forEach(function(component){
            component(context);
        });
        mr.status.documentReadyRan = true;
        if(mr.status.windowLoadPending){
            windowLoad(mr.setContext());
        }
    }

    function windowLoad(context){
        if(mr.status.documentReadyRan){
            mr.status.windowLoadPending = false;
            context = typeof context === "object" ? $ : context;
            components.windowLoad.concat(components.windowLoadDeferred).forEach(function(component){
               component(context);
            });
        }else{
            mr.status.windowLoadPending = true;
        }
    }

    mr.setContext = function (contextSelector){
        var context = $;
        if(typeof contextSelector !== typeof undefined){
            return function(selector){
                return $(contextSelector).find(selector);
            };
        }
        return context;
    };

    mr.components    = components;
    mr.documentReady = documentReady;
    mr.windowLoad    = windowLoad;

    return mr;
}(window.mr, jQuery, window, document));


//////////////// Utility Functions
mr = (function (mr, $, window, document){
    "use strict";
    mr.util = {};

    mr.util.requestAnimationFrame    = window.requestAnimationFrame ||
                                       window.mozRequestAnimationFrame ||
                                       window.webkitRequestAnimationFrame ||
                                       window.msRequestAnimationFrame;

    mr.util.documentReady = function($){
        var today = new Date();
        var year = today.getFullYear();
        $('.update-year').text(year);
    };

    mr.util.windowLoad = function($){
        $('[data-delay-src]').each(function(){
            var $el = $(this);
            $el.attr('src', $el.attr('data-delay-src'));
            $el.removeAttr('data-delay-src');
        });
    };


    // Set data-src attribute of element from src to be restored later
    mr.util.idleSrc = function(context, selector){

            selector  = (typeof selector !== typeof undefined) ? selector : '';
            var elems = context.is(selector+'[src]') ? context : context.find(selector+'[src]');

        elems.each(function(index, elem){
            elem           = $(elem);
            var currentSrc = elem.attr('src'),
                dataSrc    = elem.attr('data-src');

            // If there is no data-src, save current source to it
            if(typeof dataSrc === typeof undefined){
                elem.attr('data-src', currentSrc);
            }

            // Clear the src attribute
            elem.attr('src', '');

        });
    };

    // Set src attribute of element from its data-src where it was temporarily stored earlier
    mr.util.activateIdleSrc = function(context, selector){

        selector     = (typeof selector !== typeof undefined) ? selector : '';
        var elems    = context.is(selector+'[data-src]') ? context : context.find(selector+'[data-src]');

        elems.each(function(index, elem){
            elem = $(elem);
            var dataSrc    = elem.attr('data-src');

            // Write the 'src' attribute using the 'data-src' value
            elem.attr('src', dataSrc);
        });
    };


    mr.util.removeHash = function() {
        // Removes hash from URL bar without reloading and without losing search query
        history.pushState("", document.title, window.location.pathname + window.location.search);
    }

    mr.components.documentReady.push(mr.util.documentReady);
    mr.components.windowLoad.push(mr.util.windowLoad);
    return mr;

}(mr, jQuery, window, document));

//////////////// Window Functions
mr = (function (mr, $, window, document){
    "use strict";

    mr.window = {};
    mr.window.height = $(window).height();
    mr.window.width = $(window).width();

    $(window).on('resize',function(){
        mr.window.height = $(window).height();
        mr.window.width = $(window).width();
    });

    return mr;
}(mr, jQuery, window, document));



//////////////// Alerts
mr = (function (mr, $, window, document){
    "use strict";

    mr.alerts = mr.alerts || {};

    mr.alerts.documentReady = function($){
        $('.alert__close').on('click touchstart', function(e){
            console.log('clicked');
            e.preventDefault();
            jQuery(this).closest('.alert').addClass('alert--dismissed');
        });
    };

    mr.components.documentReady.push(mr.alerts.documentReady);
    return mr;

}(mr, jQuery, window, document));

//////////////// Dropdowns
mr = (function (mr, $, window, document){
    "use strict";

    mr.dropdowns = mr.dropdowns || {};

    mr.dropdowns.done = false;

    mr.dropdowns.documentReady = function($){

        var rtl = false;

        if($('html[dir="rtl"]').length){
            rtl = true;
        }

        if(!mr.dropdowns.done){
            jQuery(document).on('click','body:not(.dropdowns--hover) .dropdown, body.dropdowns--hover .dropdown.dropdown--click',function(event){
                var dropdown = jQuery(this);
                if(jQuery(event.target).is('.dropdown--active > .dropdown__trigger')){
                    dropdown.siblings().removeClass('dropdown--active').find('.dropdown').removeClass('dropdown--active');
                    dropdown.toggleClass('dropdown--active');
                }else{
                    $('.dropdown--active').removeClass('dropdown--active');
                    dropdown.addClass('dropdown--active');
                }
            });
            jQuery(document).on('click touchstart', 'body:not(.dropdowns--hover)', function(event){
                if(!jQuery(event.target).is('[class*="dropdown"], [class*="dropdown"] *')){
                    $('.dropdown--active').removeClass('dropdown--active');
                }
            });
            jQuery('body.dropdowns--hover .dropdown').on('click', function(event){
                event.stopPropagation();
                var hoverDropdown = jQuery(this);
                hoverDropdown.toggleClass('dropdown--active');
            });

            // Append a container to the body for measuring purposes
            jQuery('body').append('<div class="container containerMeasure" style="opacity:0;pointer-events:none;"></div>');



            mr.dropdowns.done = true;
        }
    };

    mr.components.documentReady.push(mr.dropdowns.documentReady);
    return mr;

}(mr, jQuery, window, document));


//////////////// Modals
mr = (function (mr, $, window, document){
    "use strict";

    mr.modals = mr.modals || {};

    mr.modals.documentReady = function($){
        var allPageModals = "<div class=\"all-page-modals\"></div>",
            mainContainer = $('div.main-container');

        if(mainContainer.length){
            jQuery(allPageModals).insertAfter(mainContainer);
            mr.modals.allModalsContainer = $('div.all-page-modals');
        }
        else{
            jQuery('body').append(allPageModals);
            mr.modals.allModalsContainer = jQuery('body div.all-page-modals');
        }

        $('.modal-container').each(function(){

            // Add modal close if none exists

            var modal        = $(this),
                $window      = $(window),
                modalContent = modal.find('.modal-content');


            if(!modal.find('.modal-close').length){
                modal.find('.modal-content').append('<div class="modal-close modal-close-cross"></div>');
            }

            // Set modal height

            if(modalContent.attr('data-width') !== undefined){
                var modalWidth = modalContent.attr('data-width').substr(0,modalContent.attr('data-width').indexOf('%')) * 1;
                modalContent.css('width',modalWidth + '%');
            }
            if(modalContent.attr('data-height') !== undefined){
                var modalHeight = modalContent.attr('data-height').substr(0,modalContent.attr('data-height').indexOf('%')) * 1;
                modalContent.css('height',modalHeight + '%');
            }

            // Set iframe's src to data-src to stop autoplaying iframes
            mr.util.idleSrc(modal, 'iframe');

        });


        $('.modal-instance').each(function(index){
            var modalInstance = $(this);
            var modal = modalInstance.find('.modal-container');
            var modalContent = modalInstance.find('.modal-content');
            var trigger = modalInstance.find('.modal-trigger');

            // Link modal with modal-id attribute

            trigger.attr('data-modal-index',index);
            modal.attr('data-modal-index',index);

            // Set unique id for multiple triggers

            if(typeof modal.attr('data-modal-id') !== typeof undefined){
                trigger.attr('data-modal-id', modal.attr('data-modal-id'));
            }


            // Attach the modal to the body
            modal = modal.detach();
            mr.modals.allModalsContainer.append(modal);
        });


        $('.modal-trigger').on('click', function(){

            var modalTrigger = $(this);
            var uniqueID, targetModal;
            // Determine if the modal id is set by user or is set programatically

            if(typeof modalTrigger.attr('data-modal-id') !== typeof undefined){
                uniqueID = modalTrigger.attr('data-modal-id');
                targetModal = mr.modals.allModalsContainer.find('.modal-container[data-modal-id="'+uniqueID+'"]');
            }else{
                uniqueID = $(this).attr('data-modal-index');
                targetModal = mr.modals.allModalsContainer.find('.modal-container[data-modal-index="'+uniqueID+'"]');
            }

            mr.util.activateIdleSrc(targetModal, 'iframe');

            mr.modals.showModal(targetModal);

            return false;
        });

        jQuery(document).on('click', '.modal-close', mr.modals.closeActiveModal);

        jQuery(document).keyup(function(e) {
            if (e.keyCode === 27) { // escape key maps to keycode `27`
                mr.modals.closeActiveModal();
            }
        });

        $('.modal-container:not(.modal--prevent-close)').on('click', function(e) {
            if( e.target !== this ) return;
            mr.modals.closeActiveModal();
        });

        // Trigger autoshow modals
        $('.modal-container[data-autoshow]').each(function(){
            var modal = $(this);
            var millisecondsDelay = modal.attr('data-autoshow')*1;

            mr.util.activateIdleSrc(modal);

            // If this modal has a cookie attribute, check to see if a cookie is set, and if so, don't show it.
            if(typeof modal.attr('data-cookie') !== typeof undefined){
                if(!mr.cookies.hasItem(modal.attr('data-cookie'))){
                    mr.modals.showModal(modal, millisecondsDelay);
                }
            }else{
                mr.modals.showModal(modal, millisecondsDelay);
            }
        });

        // Exit modals
        $('.modal-container[data-show-on-exit]').each(function(){
            var modal        = jQuery(this),
                exitSelector = modal.attr('data-show-on-exit'),
                delay = 0;

            if(modal.attr('data-delay')){
                delay = parseInt(modal.attr('data-delay'), 10) || 0;
            }

            // If a valid selector is found, attach leave event to show modal.
            if($(exitSelector).length){
                modal.prepend($('<i class="ti-close close-modal">'));
                jQuery(document).on('mouseleave', exitSelector, function(){
                    if(!$('.modal-active').length){
                        if(typeof modal.attr('data-cookie') !== typeof undefined){
                            if(!mr.cookies.hasItem(modal.attr('data-cookie'))){
                                mr.modals.showModal(modal, delay);
                            }
                        }else{
                            mr.modals.showModal(modal, delay);
                        }
                    }
                });
            }
        });


        // Autoshow modal by ID from location href
        if(window.location.href.split('#').length === 2){
            var modalID = window.location.href.split('#').pop();
            if($('[data-modal-id="'+modalID+'"]').length){
                mr.modals.closeActiveModal();
                mr.modals.showModal($('[data-modal-id="'+modalID+'"]'));
            }
        }

        jQuery(document).on('click','a[href^="#"]', function(){
            var modalID = $(this).attr('href').replace('#', '');
            if($('[data-modal-id="'+modalID+'"]').length){
                mr.modals.closeActiveModal();
                setTimeout(mr.modals.showModal, 500,'[data-modal-id="'+modalID+'"]', 0);
            }
        });


    };
    ////////////////
    //////////////// End documentReady
    ////////////////

    mr.modals.showModal = function(modal, millisecondsDelay){

        mr.modals.closeActiveModal();

        var delay = (typeof millisecondsDelay !== typeof undefined) ? (1*millisecondsDelay) : 0, $modal = $(modal);

        if($modal.length){
            setTimeout(function(){
                var openEvent = document.createEvent('Event');
                openEvent.initEvent('modalOpened.modals.mr', true, true);
                $(modal).addClass('modal-active').trigger('modalOpened.modals.mr').get(0).dispatchEvent(openEvent);
                jQuery('body').toggleClass("modal-open");


            },delay);
        }
    };

    mr.modals.closeActiveModal = function(){
        var modal      = jQuery('body div.modal-active'),
            closeEvent = document.createEvent('Event');

        mr.util.idleSrc(modal, 'iframe');

        // If this modal requires to be closed permanently using a cookie, set the cookie now.
        if(typeof modal.attr('data-cookie') !== typeof undefined){
            mr.cookies.setItem(modal.attr('data-cookie'), "true", Infinity, '/');
        }

        if(modal.length){
            // Remove hash from URL bar if this modal was opened via url bar ID
            if(modal.is('[data-modal-id]') && window.location.hash === '#'+modal.attr('data-modal-id')){
                mr.util.removeHash();
            }
            closeEvent.initEvent('modalClosed.modals.mr', true, true);
            modal.removeClass('modal-active').trigger('modalClosed.modals.mr').get(0).dispatchEvent(closeEvent);

            var $modalHandler = jQuery('#myModalLabel');
            if ($modalHandler.length) {
                var userPid =  $modalHandler.data('pid');
                if (userPid > 1) {
                    window.location.href = '/dashboard/settings/plans';
                }
            }

            jQuery('body').toggleClass("modal-open");
        }
    };


    mr.components.documentReady.push(mr.modals.documentReady);
    return mr;

}(mr, jQuery, window, document));


//////////////// Notifications
mr = (function (mr, $, window, document){
    "use strict";

    mr.notifications = mr.notifications || {};

    mr.notifications.documentReady = function($){

        $('.notification').each(function(){
            var notification = $(this);
            if(!notification.find('.notification-close').length){
                notification.append('<div class="notification-close-cross notification-close"></div>');
            }
        });


        $('.notification[data-autoshow]').each(function(){
            var notification = $(this);
            var millisecondsDelay = parseInt(notification.attr('data-autoshow'),10);

            // If this notification has a cookie attribute, check to see if a cookie is set, and if so, don't show it.
            if(typeof notification.attr('data-cookie') !== typeof undefined){
                if(!mr.cookies.hasItem(notification.attr('data-cookie'))){
                    mr.notifications.showNotification(notification, millisecondsDelay);
                }
            }else{
                mr.notifications.showNotification(notification, millisecondsDelay);
            }
        });

        $('[data-notification-link]:not(.notification)').on('click', function(){
            var notificationID = jQuery(this).attr('data-notification-link');
            var notification = $('.notification[data-notification-link="'+notificationID+'"]');
            jQuery('.notification--reveal').addClass('notification--dismissed');
            notification.removeClass('notification--dismissed');
            mr.notifications.showNotification(notification, 0);
            return false;
        });

        $('.notification-close').on('click', function(){
            var closeButton = jQuery(this);
            // Pass the closeNotification function a reference to the close button
            mr.notifications.closeNotification(closeButton);

            if(closeButton.attr('href') === '#'){
                return false;
            }
        });

        $('.notification .inner-link').on('click', function(){
            var notificationLink = jQuery(this).closest('.notification').attr('data-notification-link');
            mr.notifications.closeNotification(notificationLink);
        });

    };


    mr.notifications.showNotification = function(notification, millisecondsDelay){
        var $notification = jQuery(notification),
            delay         = (typeof millisecondsDelay !== typeof undefined) ? (1*millisecondsDelay) : 0,
            openEvent     = document.createEvent('Event');

        setTimeout(function(){
            openEvent.initEvent('notificationOpened.notifications.mr', true, true);
            $notification.addClass('notification--reveal').trigger('notificationOpened.notifications.mr').get(0).dispatchEvent(openEvent);
            $notification.closest('nav').addClass('notification--reveal');
            if($notification.find('input').length){
                $notification.find('input').focus();
            }



        },delay);
        // If notification has autohide attribute, set a timeout
        // for the autohide time plus the original delay time in case notification was called
        // on page load
        if(notification.is('[data-autohide]')){
            var hideDelay = parseInt(notification.attr('data-autohide'),10);
            setTimeout(function(){
                mr.notifications.closeNotification(notification);
            },hideDelay+delay);
        }
    };

    mr.notifications.closeNotification = function(notification){
        var $notification = jQuery(notification),
            closeEvent    = document.createEvent('Event');
        notification = $notification.is('.notification') ?
                       $notification :
                       $notification.is('.notification-close') ?
                       $notification.closest('.notification') :
                       $('.notification[data-notification-link="'+notification+'"]');

        closeEvent.initEvent('notificationClosed.notifications.mr', true, true);
        notification.addClass('notification--dismissed').trigger('notificationClosed.notifications.mr').get(0).dispatchEvent(closeEvent);
        notification.closest('nav').removeClass('notification--reveal');

        // If this notification requires to be closed permanently using a cookie, set the cookie now.
        if(typeof notification.attr('data-cookie') !== typeof undefined){
            mr.cookies.setItem(notification.attr('data-cookie'), "true", Infinity, '/');
        }
    };

    mr.components.documentReady.push(mr.notifications.documentReady);
    return mr;

}(mr, jQuery, window, document));


//////////////// Toggle Class
mr = (function (mr, $, window, document){
    "use strict";

    mr.toggleClass = mr.toggleClass || {};

    mr.toggleClass.documentReady = function($){
        $('[data-toggle-class]').each(function(){
          var element = $(this),
                data    = element.attr('data-toggle-class').split("|");


            $(data).each(function(){
                var candidate     = element,
                    dataArray     = [],
                  toggleClass   = '',
                  toggleElement = '',
                    dataArray = this.split(";");

              if(dataArray.length === 2){
                toggleElement = dataArray[0];
                toggleClass   = dataArray[1];
                $(candidate).on('click',function(){
                        if(!candidate.hasClass('toggled-class')){
                            candidate.toggleClass('toggled-class');
                        }else{
                            candidate.removeClass('toggled-class');
                        }
                  $(toggleElement).toggleClass(toggleClass);

                });
              }else{
                console.log('Error in [data-toggle-class] attribute. This attribute accepts an element, or comma separated elements terminated witha ";" followed by a class name to toggle');
              }
            });
        });
    };

    mr.components.documentReady.push(mr.toggleClass.documentReady);
    return mr;

}(mr, jQuery, window, document));


//////////////// Video
mr = (function (mr, $, window, document){
    "use strict";

    mr.video = mr.video || {};
    mr.video.options = mr.video.options || {};
    mr.video.options.ytplayer = mr.video.options.ytplayer || {};

    mr.video.documentReady = function($){

      //////////////// Youtube Background

      if($('.youtube-background').length){
        $('.youtube-background').each(function(){


          var player = $(this),

          themeDefaults = {
            containment: "self",
            autoPlay: true,
            mute: true,
            opacity: 1
          }, ao = {};

          // Attribute overrides - provides overrides to the global options on a per-video basis
          ao.videoURL = $(this).attr('data-video-url');
          ao.startAt = $(this).attr('data-start-at')? parseInt($(this).attr('data-start-at'), 10): undefined;


          player.closest('.videobg').append('<div class="loading-indicator"></div>');
          player.YTPlayer(jQuery.extend({}, themeDefaults, mr.video.options.ytplayer, ao));
          player.on("YTPStart",function(){
              player.closest('.videobg').addClass('video-active');
          });

        });
      }

      if($('.videobg').find('video').length){
        $('.videobg').find('video').closest('.videobg').addClass('video-active');
      }

      //////////////// Video Cover Play Icons

      $('.video-cover').each(function(){
          var videoCover = $(this);
          if(videoCover.find('iframe[src]').length){
              videoCover.find('iframe').attr('data-src', videoCover.find('iframe').attr('src'));
              videoCover.find('iframe').attr('src','');
          }
      });

      $('.video-cover .video-play-icon').on("click", function(){
          var playIcon = $(this);
          var videoCover = playIcon.closest('.video-cover');
          if(videoCover.find('video').length){
              var video = videoCover.find('video').get(0);
              videoCover.addClass('reveal-video');
              video.play();
              return false;
          }else if(videoCover.find('iframe').length){
              var iframe = videoCover.find('iframe');
              iframe.attr('src',iframe.attr('data-src'));
              videoCover.addClass('reveal-video');
              return false;
          }
      });
    };

    mr.components.documentReady.push(mr.video.documentReady);
    return mr;

}(mr, jQuery, window, document));

//////////////// Wizard
mr = (function (mr, $, window, document){
    "use strict";

    mr.wizard = mr.wizard || {};

    mr.wizard.documentReady = function($){

      $('.wizard').each(function(){
        var wizard = jQuery(this), themeDefaults = {};

        themeDefaults = {
          headerTag: "h5",
          bodyTag: "section",
          transitionEffect: "slideLeft",
          autoFocus: true
        }


        if(!wizard.is('[role="application"][id^="steps-uid"]')){
            wizard.steps(jQuery.extend({}, themeDefaults, mr.wizard.options));

            wizard.addClass('active');
        }

      });
    };

    mr.components.documentReady.push(mr.wizard.documentReady);
    return mr;

}(mr, jQuery, window, document));



//////////////// Countdown
mr = (function (mr, $, window, document){
    "use strict";

    mr.countdown = mr.countdown || {};
    mr.countdown.options = mr.countdown.options || {};

    mr.countdown.documentReady = function($){

        $('.countdown[data-date]').each(function(){
            var element      = $(this),
                date         = element.attr('data-date'),
                daysText     = typeof element.attr('data-days-text') !== typeof undefined ? '%D '+element.attr('data-days-text')+' %H:%M:%S': '%D days %H:%M:%S',
                daysText     = typeof mr.countdown.options.format !== typeof undefined ? mr.countdown.options.format : daysText,
                dateFormat   = typeof element.attr('data-date-format') !== typeof undefined ? element.attr('data-date-format'): daysText,

                fallback;

            if(typeof element.attr('data-date-fallback') !== typeof undefined){
                fallback = element.attr('data-date-fallback') || "Timer Done";
            }

            element.countdown(date, function(event) {
                if(event.elapsed){
                    element.text(fallback);
                }else{
                    element.text(
                      event.strftime(dateFormat)
                    );
                }
            });
        });

    };

    mr.components.documentReadyDeferred.push(mr.countdown.documentReady);
    return mr;

}(mr, jQuery, window, document));



//////////////// Progress Horizontal (bars)
mr = (function (mr, $, window, document){
    "use strict";

    mr.progressHorizontal = mr.progressHorizontal || {};

    mr.progressHorizontal.documentReady = function($){

        var progressBars = [];

        $('.progress-horizontal').each(function(){
            var bar       = jQuery(this).find('.progress-horizontal__bar'),
                barObject = {},
                progress  = jQuery('<div class="progress-horizontal__progress"></div>');

                bar.prepend(progress);

                barObject.element = bar;
                barObject.progress = progress;
                barObject.value = parseInt(bar.attr('data-value'),10)+"%";
                barObject.offsetTop = bar.offset().top;
                barObject.animate = false;

                if(jQuery(this).hasClass('progress-horizontal--animate')){
                    barObject.animate = true;
                }else{
                    progress.css('width',barObject.value);
                }
                progressBars.push(barObject);
        });
    };

    mr.components.documentReady.push(mr.progressHorizontal.documentReady);
    return mr;

}(mr, jQuery, window, document));



// account settings tab auto show
// $(document).ready(function() {
//     if($("ul.dropdown__content li").length)
//     {
//         segment = window.location.pathname.split("/").pop();
//         setTimeout(function() {
//             $('ul.dropdown__content li a#' + segment).trigger('click');
//         }, 1);
//     }
// });