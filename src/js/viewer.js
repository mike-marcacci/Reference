(function( $ ) {
  
  $.extend({
    reference: function (linkEl, o) {
      var options = $.extend($(linkEl).data(), o);
	  
	  // find matching collections from data-referenceCollections
	  
	  // display the reference panel
	  
	  
	  
    }
  });
  
  $.fn.reference = function(o){
    $.reference(this, o);
    return $(this);
  }
  
})( jQuery );


