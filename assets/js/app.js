/*

  _Project! 
     __   _              ___ 
    / /  (_)__ ___ _    / _ \
   / /__/ / _ `/  ' \  / , _/
  /____/_/\_,_/_/_/_/ /_/|_|
  
*/

// --------------------------------------------------------------------------------------------------------------

//CONFIGURE REQUIRE js

require.config({
    paths : {
        'jquery': 'vendor/jquery',
        "imagesLoaded": "libs/jquery.imagesloaded",
        "nprogress": "libs/nprogress.min",
        "enquire": "libs/enquire.min",
        "svgeezy": "libs/svgeezy.min",
        "foundation": "vendor/foundation.min",
        "fastclick": "vendor/fastclick",

        //'scrollto': 'libs/scrollto'
        //"waypoints": "libs/jquery.waypoints"
    },
    "shim": {
      "imagesLoaded": ["jquery"]
    },
    priority : [
    'jquery'  //execute jquery before any other dependency
    ]
})

//APP

APP = {
  initial_run : true,
  //root : window.data.template_url,
  isotope_is_setup: false,

  all_blocks: null,

  progress: {
    start: function(){

    },
    done: function(){

    }
  },

  common: {
    init: function() {

      log("APP.js Loaded");

      jQuery.extend(jQuery.easing,
      {
        def: 'easeInOutQuint',

        easeInOutQuint: function (x, t, b, c, d) {

          if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;

          return c/2*((t-=2)*t*t*t*t + 2) + b;

        }
        
      });

      //VARS

      var win = $(window);

      APP.window = $(window);
      APP.document = $(document);
      APP.html = $('html');
      APP.body = $('body');
      APP.grid = $('.grid');
      APP.Modernizr = window.Modernizr;
      APP.history = window.history;

      //BREAKPOINTS

      /*$(window).resetBreakpoints();
      $(window).setBreakpoints({
      // use only largest available vs use all available
          distinct: true, 
      // array of widths in pixels where breakpoints
      // should be triggered
          breakpoints: [
              640,
              960,
              1440
          ] 
      });
      //Small
      $(window).bind('enterBreakpoint640',function() {
      });
      $(window).bind('exitBreakpoint640',function() {
      });*/

      //ENQUIRE/
      var small = "screen and (max-width:40em)";
      var medium = "screen and (min-width: 40em) and (max-width:64em)";
      var large = "screen and (min-width: 64em) and (max-width:90em)";
      var xlarge = "screen and (min-width: 90em) and (max-width:120em)";
      var xxlarge = "screen and (min-width: 120em)";

      enquire.register(small, {

          // OPTIONAL
          // If supplied, triggered when a media query matches.
          match : function() {
            log(' * BP: Small * ');
          },      
                                      
          // OPTIONAL
          // If supplied, triggered when the media query transitions 
          // *from a matched state to an unmatched state*.
          unmatch : function() {
          },    
          
          // OPTIONAL
          // If supplied, triggered once, when the handler is registered.
          setup : function() {
          },    
                                      
          // OPTIONAL, defaults to false
          // If set to true, defers execution of the setup function 
          // until the first time the media query is matched
          deferSetup : true,
                                      
          // OPTIONAL
          // If supplied, triggered when handler is unregistered. 
          // Place cleanup code here
          destroy : function() {}
            
      });

      enquire.register(medium, function() { log(" * BP: Medium * "); });
      enquire.register(large, function() { log(" * BP: Large * "); });
      enquire.register(xlarge, function() { log(" * BP: XLarge * "); });
      enquire.register(xxlarge, function() { log(" * BP: XXLarge * "); });



      //BEHAVIOURS
      APP.LoadBehavior();

      //Run AJAXIFY once
      if(APP.initial_run){
        require(['ajaxify'], function(module){

          //module.init();

        });

      }

      //RESIZE

      APP.window.on('resize', function(){

      });

      $(window).trigger('resize');

      APP.initial_run = false;

      

    },
  },

};

//BEHAVIOURS

/* look through the document (or ajax'd in content if "context" is defined) to look for "data-behavior" attributes.
Initialize a new instance of the method if found, passing through the element that had the attribute
So in this example it will find 'data-behavior="show_articles"' and run the show_articles method. 
*/
APP.LoadBehavior = function(context){
  if(context === undefined){
    context = $(document);
  }

  context.find("*[data-behavior]").each(function(){
    var that = $(this);
    var behaviors = that.attr('data-behavior');

    $.each(behaviors.split(" "), function(index,behaviorName){
       
      require(['behaviors/' + behaviorName], function(module){

          //Init Module

          try {
            module.init(that);
          }
          catch(e){
            // No Operation
            log('error init: ' + e);
          }

          

      });


    });
  });
};

AJAX = {
  // Ajaxify Helper
  ajaxify: function(_this){

      // Prepare
      var $this = _this;

      // Ajaxify
      $this.find('a:not(.no-ajaxy)').click(function(event){
          // Prepare
          var
              $this = $(this),
              url = $this.attr('href'),
              title = $this.attr('title')||null;
          
          // Continue as normal for cmd clicks etc
          if ( event.which == 2 || event.metaKey ) { return true; }
          
          // Ajaxify this link
          History.pushState(null,title,url);
          event.preventDefault();
          return false;
      });
      
      // Chain
      return $this;
  }
}

UTIL = {
  exec: function( controller, action ) {
    var ns = APP,
        action = ( action === undefined ) ? "init" : action;

    if ( controller !== "" && ns[controller] && typeof ns[controller][action] == "function" ) {
      ns[controller][action]();
    }
  },

  init: function() {
    var body = document.body,
        controller = body.getAttribute( "data-controller" ),
        action = body.getAttribute( "data-action" );

    UTIL.exec( "common" );
    UTIL.exec( controller );
    UTIL.exec( controller, action );
  }
};

//INIT

require(['jquery', 'svgeezy', 'enquire', 'fastclick'], function($){

    svgeezy.init(false, 'png');

    (function($) {

      $.fn.visible = function(partial) {
        
          var $t            = $(this),
              $w            = $(window),
              viewTop       = $w.scrollTop(),
              viewBottom    = viewTop + $w.height(),
              _top          = $t.offset().top,
              _bottom       = _top + $t.height(),
              compareTop    = partial === true ? _bottom : _top,
              compareBottom = partial === true ? _top : _bottom;
        
        return ((compareBottom <= (viewBottom)) && (compareTop >= viewTop));

      };
        
    })(jQuery);

    (function($,sr){

      // debouncing function from John Hann
      // http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
      var debounce = function (func, threshold, execAsap) {
          var timeout;

          return function debounced () {
              var obj = this, args = arguments;
              function delayed () {
                  if (!execAsap)
                      func.apply(obj, args);
                  timeout = null;
              };

              if (timeout)
                  clearTimeout(timeout);
              else if (execAsap)
                  func.apply(obj, args);

              timeout = setTimeout(delayed, threshold || 100);
          };
      }
      // smartresize 
      jQuery.fn[sr] = function(fn){  return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr); };

    })(jQuery,'smartresize');

    require(['foundation', 'libs/jquery.imagesloaded.min', 'libs/breakpoints'], function(Foundation, imagesLoaded, breakpoints){
      $(document).ready(function(){
        $(document).foundation();
        UTIL.init();
      });
    });

});



// UTILS

APP.ua = navigator.userAgent;
APP.click_event = (is_touch_device()) ? "touchstart" : "click";

// usage: log('inside coolFunc',this,arguments);
// http://paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log = function(){
  log.history = log.history || [];   // store logs to an array for reference
  log.history.push(arguments);
  if(this.console){
    console.log( Array.prototype.slice.call(arguments) );
  }
};

function isIpad() {
  return !!navigator.userAgent.match(/iPad/i);
};

function isIphone () {
  return !!navigator.userAgent.match(/iPhone/i);
};

function isIpod() {
  return !!navigator.userAgent.match(/iPod/i);
};

function isAppleIos() {
  return (isIpad() || isIphone() || isIpod());
};

function is_touch_device() {
    return !!('ontouchstart' in window) // works on most browsers 
        || !!('onmsgesturechange' in window); // works on ie10
  };

