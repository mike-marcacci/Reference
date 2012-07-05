/*! Reference - v0.1alpha - 2012-07-05
* https://github.com/mike-marcacci/Reference
* Copyright (c) 2012 Mike Marcacci; Licensed MIT, GPL */

(function( $ ) {
	
  "use strict";
  
  $.extend({referenceCollections: []});
  
  $.extend({addReferenceCollection: function(collection){
    collection = $.extend({
      title: '',            // the display title of the collection
      caseSensitive: false, // are search terms case sensitive?
      data: null,           // all data and ajax cache
      type: null,           // ('data','ajax','custom', null) auto-detected
      ajax: null,           // jQuery.ajax() object
      cache: true,          // cache ajax results in this.data ?
      keys: null,           // list of search terms if this.type === 'ajax' || 'custom'
      custom: null          // function(linkEl, linkTerm, callback)
    }, collection);

    
    /*******************************************
    Autodetect collection type
    ********************************************/
    
    if(collection.type === null) {
      if(collection.data) {
        collection.type = 'data';
      } else if(collection.ajax) {
        collection.type = 'ajax';
      } else if(collection.custom) {
        collection.type = 'custom';
      } else {
        return false; // cannot autodetect type!!
      }
    }
	

    
    /*******************************************
    Make all keys case insensitive, if requested
    ********************************************/
    
		
    if(collection.type === 'data' && !collection.caseSensitive) {
			
      $.each(collection.data, function(key, value){
        collection.data[key.toUpperCase()] = value;
        delete collection.data[key];
      });
			
    }
	
	
    
    /*******************************************
    Generate keys from data if necessary
    ********************************************/
    
    if(collection.type === 'data' && (!collection.keys || collection.keys.length === 0)) {
      collection.keys = [];
      $.each(collection.data, function(key, value){
        collection.keys.push(key);
      });
    }
	
	
	
    
    /*******************************************
    TODO: insert callback into the collection.ajax settings
    ********************************************/
    
    if(collection.type === 'ajax') {
      // do something for ajax
      var asdf = 0;
    }
    

    
    /*******************************************
    Add collection to global references list and set ID
    ********************************************/
    
    collection.id = $.referenceCollections.push(collection) - 1;
    
    return collection;
    
  }});
  
  
}( jQuery ));
(function( $ ) {
  
  "use strict";
  
  $.extend({
    addReferences: function (node, re, trigger, triggerData) {
      
      var match;
      var highlight;
      
      if (node.nodeType === 3) { // new text nodes
        match = node.data.match(re);
        if (match) {
          highlight = document.createElement('span');
          var wordNode = node.splitText(match.index);
          wordNode.splitText(match[0].length);
          var wordClone = wordNode.cloneNode(true);
          highlight.appendChild(wordClone);
          wordNode.parentNode.replaceChild(highlight, wordNode);
          
          highlight = $(highlight);


          highlight.addClass('reference-link ' + triggerData.theme).addClass('on-' + trigger);
          var tagData = {}; tagData[trigger] = triggerData;
          highlight.data('referenceTriggers', $.extend(true, {}, tagData));

          
      
          return 1; //skip added node in parent
        }
      } else if ($(node).hasClass('reference-link') && $(node).data('referenceTriggers')) { // already highlighted text nodes 

        match = $(node).text().match(re);
        
        if (match) {
          highlight = $(node);
          if(highlight.data('referenceTriggers')[trigger]) {
            highlight.data('referenceTriggers')[trigger].collections.push(triggerData.collections[0]);
            // add to collections
            highlight.data('referenceTriggers')[trigger].theme = triggerData.theme;
            // replace theme
          } else {
            highlight.data('referenceTriggers')[trigger] = $.extend(true, {}, triggerData);
          }
        }
        
        
      } else if ((node.nodeType === 1 && node.childNodes) && !/(script|style)/i.test(node.tagName)) {
        for (var i = 0; i < node.childNodes.length; i++) {
          i += $.addReferences(node.childNodes[i], re, trigger, triggerData);
        }
      }
      return 0;
    }
  });
  
  
  
  $.fn.addReferences = function(o){
    
    var searchEl = $(this);
    
    var options = {
      collections: [],
      trigger: 'click',
      theme: 'apple'
    };
    
    $.extend(options, o);
    
    $.each(options.collections, function(index, value){
    
      var collection;
      if($.inArray(value, $.referenceCollections) === -1) {
        collection = $.addReferenceCollection(value);
      } else {
        collection = value;
      }
      
      /*******************************************
      Build the search expression
      ********************************************/
      
      var terms = collection.keys;
      
      // escape special characters in search terms
      terms = jQuery.map(terms, function(word, i) {
        
        // is it a regular expression?
        if(word.charAt(0) === '/' && word.charAt(word.length-1) === '/'){
          return word.substr(1,word.length-2);
        }
        return word.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
      });

      var pattern = "\\b(" + terms.join("|") + ")\\b";
      
      var re = new RegExp(pattern, collection.caseSensitive ? "" : "i");
      
      var triggerData = {
        theme: options.theme,
        collections: [collection.id]
      };
      
      /*******************************************
      Add the reference links
      ********************************************/
      
      searchEl.each(function () {
        jQuery.addReferences(this, re, options.trigger, triggerData);
      });
  
    });
    

      
      

      
    /*******************************************
    Bind reference to links
    ********************************************/
    
    
    var triggerBound = false;
    if(searchEl.data('events') && searchEl.data('events')[options.trigger]){
      $.each(searchEl.data('events')[options.trigger], function(i){
        if(this.selector === ".reference-link.on-" + options.trigger) {
          triggerBound = true;
        }
      });
    }
    
    if(!triggerBound) {
      searchEl.on(options.trigger, ".reference-link.on-" + options.trigger, $.fn.reference);
    
      $(document).on(options.trigger, $.fn.closeReferences);
    }
    
    
    
    
    return $(this);
  };
  
  $.fn.removeReferences = function(o){
    
    return $(this);
  };
  
}( jQuery ));


(function( $ ) {

  "use strict";

  $.extend({
    reference: function (linkEl, event) {
      
      linkEl = $(linkEl);
      var linkData = linkEl.data('referenceTriggers')[event.type];
      var linkTerm = linkEl.text();
      
      linkEl.addClass('reference-link-active');
      
      var bubble = $('<div id="reference-bubble" class="apple"><div class="reference-bubble-arrow"></div></div>').appendTo(linkEl);
      
      // take care of positioning on page
      if(bubble.offset().top + parseInt(bubble.css('max-height'),10) + (bubble.outerHeight() - bubble.height()) > ($(window).height() + $(window).scrollTop())) {
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
        var result = [];
        
        var asdf;
        if(collection.type === 'data') {
          $.each(collection.data, function(key, value){
            var pattern;
            
            // is the key a Regex?
            if(key.charAt(0) === '/' && key.charAt(key.length-1) === '/'){
              pattern = key.substr(1,key.length-2);
            } else {
              pattern = key.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
            }
            
            
            pattern = "\\b(" + pattern + ")\\b";
            var re = new RegExp(pattern, collection.caseSensitive ? "" : "i");
            
            if(linkTerm.match(re)){
              result.push(value);
            }
            
          });
        } else if(collection.type === 'ajax') {
          asdf = 0; 
        } else if(collection.type === 'custom') {
          asdf = 0;
        }
        
        bubble.append('<div class="reference-collection-name"><div style="display:none;" class="reference-loading-spinner"><span class="reference-loading-top"></span><span class="reference-loading-left"></span><span class="reference-loading-bottom"></span><span class="reference-loading-right"></span></div>' + collection.title + '</div>');
        bubble.append('<div class="reference-collection-result">' + result.join('</div><div class="reference-collection-result">') + '</div>');
        
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
    $('#reference-bubble').remove();
    return $(this);
  };
  
  $(window).on('resize', function(){
    $(document).closeReferences();
  });
  
  
}( jQuery ));