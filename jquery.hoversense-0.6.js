/**
 * jQuery Plugin - HoverSense - Version 0.6 (8/31/2011)
 * 
 * jQuery.hover() replacement plugin
 * http://spencercreasey.com/projects/hoversense
 * 
 * Copyright 2011 Spencer Creasey
 * Dual licensed under the MIT and GPL Licenses.
 */
(function($) {
   
   /**
    * // Basic Usage (no arguments -- uses defaults)
    * $('ul > li').hoverSense(); 
    * 
    * // Basic Usage (specify both MouseIn / MouseOut functions)
    * $('ul > li').hoverSense(
    *   function(node){ node.slideDown(300); },
    *   function(node){ node.fadeOut(200); }
    * });
    * 
    * // Advanced Usage (single argument as configuration -- nothing is required)
    * $('ul > li').hoverSense({
    *   openWait: 350, // Time in milliseconds to wait for a tab to open
    *   openSiblingWait: 150, // Time in milliseconds to wait for a tab to open, if another tab is already open
    *   closeWait: 300, // Time in milliseconds to wait for a tab to close
    *   baseZIndex: // Starting value for CSS 'z-index'
    *   fnOver: function(node){ node.show(); } // Show functions
    *   fnOut: function(node){ node.hide(); } // Hide function
    * });
    *
    * // None of the above arguments are required. To change only the time to open a tab:
    * $('ul > li').hoverSense({ openWait: 250 });
    *
    * @param {function(!Node)|{
    *   openWait: number,
    *   openSiblingWait: number,
    *   closeWait: number,
    *   baseZIndex: number,
    *   fnOver: function(!Node),
    *   fnOut: function(!Node)
    * }} fnOver Open function or configuration.
    * @param {function(!Node)=} fnOut Close function or none, if config given as first arg.
    * @author Spencer Creasey
    */
   $.fn.hoverSense = function( fnOver, fnOut ) {

      // Merge config
      var options = $.extend({
         
         // Time in milliseconds to wait for a tab to open
         openWait : 350, 

         // Time in milliseconds to wait for a tab to open, if another tab is already open
         // - (We know the user already wants to navigate tabs, lets make the transition 
         //    to other tabs quicker.)
         openSiblingWait : 150, 

         // Time in milliseconds to wait for a tab to close
         closeWait : 300, 

         // Starting value for CSS 'z-index'
         // - specify if menu items display below existing content
         baseZIndex : 1000,

         // Hide/Show functions (CSS 'display:none|block')
         fnOver : function( node ) { node.show(); },
         fnOut : function( node ) { node.hide(); }
         
      }, fnOut ? { fnOver : fnOver, fnOut : fnOut } : fnOver),
      
      // Hash of opening/closing requests (timers),
      openTimers = {}, closeTimers = {}, 
       
      // Reference to any currently open item
      openItem = null, 
          
      // Incrementing identifier assigned to menu items
      // - used to quickly lookup open/close request
      idCounter = 1;
      
      // Maintain cascading jQuery calls
      return this.hover(
         
         // -- MouseEnter Event --
         function (event) { 

            // Store reference to current menu item
            var item = this; // event.currentTarget || event.srcElement;

            // Check for close-request against the current item
            if (closeTimers[item.__refId]) {
            
               // -- Item is already open --

               // Clear close-request
               clearTimeout(closeTimers[item.__refId]);

               // Remove reference to close-request
               closeTimers[item.__refId] = 0;
               
            } else { 
            
               // -- Opening a new item --

               // How long should the user wait to see a new item?
               // - if there is already an open tab
               // - vs. nothing open
               var wait = (openItem ? options.openSiblingWait : options.openWait);
               
               // Generate unique id for element
               // - used to cancel the request to open, if needed
               if (!item.__refId) {
                  item.__refId = idCounter++;
               }
               
               // Issue open-request to show current item
               openTimers[item.__refId] = setTimeout(function () {
                  
                  // store reference to child dropdown
                  var itemDropdown = $('ul', item);

                  // Check for already open item
                  if (openItem) {

                     // Check to see if a close-request has been issued for it
                     if (closeTimers[openItem.__refId]) {

                        // Cancel request
                        clearTimeout(closeTimers[openItem.__refId]);

                        // Remove reference to request
                        closeTimers[openItem.__refId] = 0;
                     }

                     // Close item's dropdown
                     options.fnOut($('ul', openItem)); 
                  }
                  
                  // Clear open-request reference
                  if (openTimers[item.__refId]) {
                     openTimers[item.__refId] = 0; 
                  }
                  
                  // Store reference to current item 
                  openItem = item; 

                  // set z-index
                  itemDropdown.css({ zIndex : options.baseZIndex + 1 });

                  // Open item's dropdown
                  options.fnOver(itemDropdown);
                  
               }, wait);
            }
         }, 

         // -- MouseOut Event --
         function (event) { 
         
            // Store reference to current menu item
            var item = this; // event.currentTarget || event.srcElement;

            // Store reference to dropdown
            var itemDropdown = $('ul', item)

            // Reset CSS z-index
            itemDropdown.css({ zIndex : options.baseZIndex });

            // Generate unique id for element
            if (!item.__refId) {
               item.__refId = idCounter++;
            }
            
            // Is there a request to open the current item?
            if (openTimers[item.__refId]) {
               
               // Clear open-request
               clearTimeout(openTimers[item.__refId]);

               // Clear reference to open-request
               openTimers[item.__refId] = 0;
            }
            
            // If another tab was opened, the current tab is already queued to close. Otherwise, close.
            if (openItem == item) {

               // Issue request (timer) to close dropdown
               closeTimers[openItem.__refId] = setTimeout(function () {
                  
                  // Clear reference to close-request
                  if (closeTimers[item.__refId]) {
                     closeTimers[item.__refId] = 0;
                  }

                  // Clear reference to the open item, since there are none
                  if (openItem == item) {
                     openItem = 0;  
                  }

                  // Close item's dropdown
                  options.fnOut(itemDropdown); // close item

               }, options.closeWait);
               
            }
         }
      );
   };
   
})(jQuery);