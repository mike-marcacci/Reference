(function( $ ) {

  "use strict";

  $.extend({
    reference: function (linkEl, event) {
      
      linkEl = $(linkEl);
      var linkData = linkEl.data('referenceTriggers')[event.type];
      var linkTerm = linkEl.text();
      
      linkEl.addClass('reference-link-active');
      
      var bubble = $('<div class="reference-bubble apple"><div class="reference-bubble-arrow"></div></div>').appendTo(linkEl);
      
      // take care of positioning on page
      if(bubble.offset().top + parseInt(bubble.css('max-height'),10) + (bubble.outerHeight() - bubble.height()) > $(window).height()) {
        bubble.addClass('up');
      } else {
        bubble.addClass('down');
      }
      
      var windowpadding = 10;
      
      var diff;
      if(bubble.offset().left < 0) {
        diff = 0 - bubble.offset().left + windowpadding;
        bubble.css('margin-left', (parseInt(bubble.css('margin-left'),10) + diff) + "px");
        $('.reference-bubble-arrow', bubble).css('margin-left', (parseInt($('.reference-bubble-arrow', bubble).css('margin-left'),10) - diff + "px"));
      } else if((bubble.offset().left + bubble.outerWidth()) > $(window).width()){
        diff = 0 - ((bubble.offset().left + bubble.outerWidth()) - $(window).width()) - windowpadding;
        bubble.css('margin-left', (parseInt(bubble.css('margin-left'),10) + diff + "px"));
        $('.reference-bubble-arrow', bubble).css('margin-left', (parseInt($('.reference-bubble-arrow', bubble).css('margin-left'),10) - diff + "px"));
      }
      
      // find matching collections from data-referenceCollections
      $.each(linkData.collections, function(index, id){
        var collection = $.referenceCollections[id];
        var term = collection.caseSensitive ? linkTerm : linkTerm.toUpperCase();
        var result;
        
        var asdf;
        if(collection.type === 'data') {
          result = collection.data[term];
        } else if(collection.type === 'ajax') {
          asdf = 0; 
        } else if(collection.type === 'custom') {
          asdf = 0;
        }
        
        bubble.append('<div class="reference-collection-name"><div style="display:none;" class="reference-loading-spinner"><span class="reference-loading-top"></span><span class="reference-loading-left"></span><span class="reference-loading-bottom"></span><span class="reference-loading-right"></span></div>' + collection.title + '</div>');
        bubble.append('<div class="reference-collection-result">' + result + '</div>');
        
      });
      
      // display the reference bubble
      
    }
  });
  
  $.fn.reference = function(event){
    $(event.delegateTarget).closeReferences();
    $.reference(this, event);
    event.stopPropagation();
    return $(this);
  };
  
  
  $.fn.closeReferences = function(event){
    $('.reference-link-active').removeClass('reference-link-active');
    $('.reference-bubble').remove();
    return $(this);
  };
  
  $(window).on('resize', function(){
    $(document).closeReferences();
  });
  
  
}( jQuery ));