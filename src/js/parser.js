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
            highlight.addClass('on-' + trigger);
          }
        }
        
        
      } else if ((node.nodeType === 1 && node.childNodes) && !/(script|style)/i.test(node.tagName)) {
        for (var i = 0; i < node.childNodes.length; i++) {
          i += $.addReferences(node.childNodes[i], re, trigger, triggerData);
        }
      }
      return 0;
    },

    removeReferences: function (link, trigger, remIds) {
      
      // remove collection IDs from supplied trigger
      if($.isArray(remIds)){
        link.data('referenceTriggers')[trigger].collections = $.grep(link.data('referenceTriggers')[trigger].collections, function(v){
          return $.inArray(v,remIds) === -1;
        });
      }
      
      // remove the trigger if it's empty or if we're removing all collections
      if(!$.isArray(remIds) || link.data('referenceTriggers')[trigger].collections.length === 0) {
        link.removeClass('on-'+trigger);
        delete link.data('referenceTriggers')[trigger];
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
    var searchEl = $(this);
        
    var options = {
      collections: null,
      triggers: null
    };
    
    $.extend(options, o);
    
    $('.reference-link', searchEl).each(function(i){
      var link = $(this);
      
      // remove the link if no options specified
      if(!options.collections && !options.triggers){
        link.replaceWith(link.html());
      } else {
        // remove specified collection IDs from specified or all triggers
        $.each(link.data('referenceTriggers'),function(trigger,data){
          if(!$.isArray(options.triggers) || $.inArray(trigger, options.triggers) != -1) {
            $.removeReferences(link, trigger, options.collections);
          }
        })
        // if all triggers are removed, remove the link
        if(Object.keys(link.data('referenceTriggers')).length === 0){
          link.replaceWith(link.html());
        }
      }
      
      
      
    })
    
    
    
    return $(this);
  };
  
}( jQuery ));

