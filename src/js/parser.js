(function( $ ) {
  
  $.extend({
    addReferences: function (node, re, trigger, triggerData) {
      if (node.nodeType === 3) { // new text nodes
        var match = node.data.match(re);
        if (match) {
          var highlight = document.createElement('span');
          var wordNode = node.splitText(match.index);
          wordNode.splitText(match[0].length);
          var wordClone = wordNode.cloneNode(true);
          highlight.appendChild(wordClone);
          wordNode.parentNode.replaceChild(highlight, wordNode);
          
		  highlight = $(highlight);
		  
          highlight.addClass('reference-link ' + triggerData.theme)
		  var tagData = {}; tagData[trigger] = triggerData;
		  highlight.data('referenceTriggers', tagData)
		  
          return 1; //skip added node in parent
        }
      } else if ($(node).hasClass('reference-link') && $(node).data('referenceTriggers')) { // already highlighted text nodes 
		  
		  var highlight = $(node);
		  if(highlight.data('referenceTriggers')[trigger]) {
			  $.unique($.merge(highlight.data('referenceTriggers')[trigger]['collections'], triggerData['collections']))
			  // add to collections
			  highlight.data('referenceTriggers')[trigger]['theme'] = triggerData['theme'];
			  // replace theme
		  } else {
		  	highlight.data('referenceTriggers')[trigger] = triggerData;
		  }
		  
		  //$.unique($.merge($(node).data('referenceCollections'),tagData.referenceCollections));
      } else if ((node.nodeType === 1 && node.childNodes) && // only element nodes that have children
      !/(script|style)/i.test(node.tagName)) { // ignore script and style nodes
        for (var i = 0; i < node.childNodes.length; i++) {
          i += $.addReferences(node.childNodes[i], re, trigger, triggerData);
        }
      }
      return 0;
    }
  });
  
  
  
  $.fn.addReferences = function(o){
    
    var linkEl = $(this);
    
    var options = {
      collections: [],
      trigger: 'click',
      theme: 'apple',
      exactMatch: true
    };
	  
    $.extend(options, o);
	  
    $.each(options.collections, function(index, value){
  	
      if($.inArray(value, $.referenceCollections) == -1) {
        var collection = $.addReferenceCollection(value);
      } else {
        var collection = value;
      }
      
      /*******************************************
      Build the search expression
      ********************************************/
      
      var terms = collection.keys;
      
      // escape special characters in search terms
      terms = jQuery.map(terms, function(word, i) {
        return word.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
      });

      var pattern = "(" + terms.join("|") + ")";
      if (options.exactMatch) {
          pattern = "\\b" + pattern + "\\b";
      }
      
      var re = new RegExp(pattern, collection.caseSensitive ? "" : "i");
      
      var triggerData = {
        theme: options.theme,
        collections: [collection.id]
      }
    
      linkEl.each(function () {
          jQuery.addReferences(this, re, options.trigger, triggerData);
      });
      
      
      
      // bind options.trigger to linkEl
	  	
    })
    
    
    
    return $(this);
  }
  
  $.fn.removeReferences = function(o){
    
    return $(this);
  }
  
})( jQuery );

