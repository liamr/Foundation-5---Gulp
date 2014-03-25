/**
 * FUNCTION: AJAXIFY
 * Liam R <hello@liamr.com>
 */

define(['jquery', 'libs/jquery.history.min'], function($) {



    init = function(){

        log('FUNCTION: Ajaxify');
        
        // Prepare Variables
        var
            /* Application Specific Variables */
            contentSelector = '.ajaxify',
            $content = $(contentSelector).filter(':first'),
            contentNode = $content.get(0),
            $menu = $('nav.main ul').filter(':first'),
            activeClass = 'active selected current youarehere',
            activeSelector = '.active,.selected,.current,.youarehere',
            menuChildrenSelector = '> li,> ul > li',
            completedEventName = 'statechangecomplete',
            /* Application Generic Variables */
            $window = $(window),
            $body = $(document.body),
            rootUrl = History.getRootUrl(),
            scrollOptions = {
                duration: 800,
                easing:'swing'
            };
        
        // Ensure Content
        if ( $content.length === 0 ) {
            $content = $body;
        }
        
        // Internal Helper
        $.expr[':'].internal = function(obj, index, meta, stack){
            // Prepare
            var
                $this = $(obj),
                url = $this.attr('href')||'',
                isInternalLink;
            
            // Check link
            isInternalLink = url.substring(0,rootUrl.length) === rootUrl || url.indexOf(':') === -1;
            
            // Ignore or Keep
            return isInternalLink;
        };
        
        // HTML Helper
        var documentHtml = function(html){
            // Prepare
            var result = String(html)
                .replace(/<\!DOCTYPE[^>]*>/i, '')
                .replace(/<(html|head|body|title|meta|script)([\s\>])/gi,'<div class="document-$1"$2')
                .replace(/<\/(html|head|body|title|meta|script)\>/gi,'</div>')
            ;
            
            // Return
            return result;
        };
        
        // Ajaxify Helper
        $.fn.ajaxify = function(){
            // Prepare
            var $this = $(this);

            // Ajaxify
            $this.find('a:internal:not(.no-ajaxy)').click(function(event){
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
        };
        
        // Ajaxify our Internal Links
        $content.ajaxify();
        
        // Hook into State Changes
        $window.bind('statechange',function(){

            //Figure out what changes we need to make

            var
                State = History.getState(),
                url = State.url,
                relativeUrl = url.replace(rootUrl,''),
                urlArray = relativeUrl.split('/');

            /*switch(urlArray[0]){
                case "interact" :

                urlArray.splice(0, 1);

                CENTRAL.goto(urlArray);

                break;

                default:

                transition_out();

            }*/

            transition_out();

        });

        transition_out = function(){

            $body.addClass('transition out');

            // Start Fade Out
            // Animating to opacity to 0 still keeps the element's height intact
            // Which prevents that annoying pop bang issue when loading in new content

            $content.animate({opacity:0},500, function(){
                $body.removeClass('out');
                loadit();
            });
        }

        transition_in = function(){

            UTIL.init();

            $body.addClass('in');

            //APP.progress.done();

            $content.animate({opacity:1},500, function(){
                $body.removeClass('transition in');
            });



        }

        loadit = function(){

            var
                State = History.getState(),
                url = State.url,
                relativeUrl = url.replace(rootUrl,'');
 
            // Set Loading
            $body.addClass('loading');

            //APP.progress.start();
            
            // Ajax Request the Traditional Page
            $.ajax({
                url: url,
                success: function(data, textStatus, jqXHR){
                    // Prepare
                    var
                        $data = $(documentHtml(data)),
                        $dataBody = $data.find('.document-body:first'),
                        $dataContent = $dataBody.find(contentSelector).filter(':first'),
                        $menuChildren, contentHtml, $scripts;
                    
                    // Fetch the scripts
                    $scripts = $dataContent.find('.document-script');
                    if ( $scripts.length ) {
                        $scripts.detach();
                    }
 
                    // Fetch the content
                    contentHtml = $dataContent.html()||$data.html();
                    if ( !contentHtml ) {
                        document.location.href = url;
                        return false;
                    }
                    
                    //$('nav.main').html($data.find('nav.main').html()).ajaxify();

 
                    // Update the content
                    $content.stop(true,true);
                    $content.html(contentHtml).ajaxify();

                    transition_in();
 
                    // Update the title
                    document.title = $data.find('.document-title:first').text();
                    try {
                        document.getElementsByTagName('title')[0].innerHTML = document.title.replace('<','&lt;').replace('>','&gt;').replace(' & ',' &amp; ');
                    }
                    catch ( Exception ) { }
                    
                    // Add the scripts
                    $scripts.each(function(){
                        var $script = $(this), scriptText = $script.text(), scriptNode = document.createElement('script');
                        scriptNode.appendChild(document.createTextNode(scriptText));
                        contentNode.appendChild(scriptNode);
                    });

                    //Update body tags
                    var attributes = $data.find('.document-body:first').prop("attributes");

                    var body_c = $data.find('.document-body:first').attr('class');
                    

                    $.each(attributes, function() {
                        if(this.name != 'class'){
                            $body.attr(this.name, this.value);

                        }
                    });

                    

                    $body.attr('class', body_c);
 
                    // Complete the change
                    $('html, body').animate({scrollTop: 0}, 400); 
                    $body.removeClass('loading');
                    $window.trigger(completedEventName);
    
                    // Inform Google Analytics of the change
                    if ( typeof window._gaq !== 'undefined' ) {
                        window._gaq.push(['_trackPageview', relativeUrl]);
                    }
 
                    // Inform ReInvigorate of a state change
                    if ( typeof window.reinvigorate !== 'undefined' && typeof window.reinvigorate.ajax_track !== 'undefined' ) {
                        reinvigorate.ajax_track(url);
                        // ^ we use the full url here as that is what reinvigorate supports
                    }
                },
                error: function(jqXHR, textStatus, errorThrown){
                    document.location.href = url;
                    return false;
                }
            }); // end ajax
 
        };

    }

    return {
        init: init
    };

});