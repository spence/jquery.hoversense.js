/*
 *  jQuery Plugin - Hover Sense - Version 0.3 (8/7/2011)
 * 
 *  jQuery.hover() replacement plugin
 *  http://projects.spencercreasey.com/hoversense/
 * 
 *  Copyright 2011 Spencer Creasey (http://spencercreasey.com)
 *  Dual licensed under the MIT and GPL Licenses.
 *
 */
(function($) {

   $.fn.hoverSense = function( fnOver, fnOut ) {

      // Init configuration:
      // - allows 0 arguments (use defaults)
      // - 2 args (hide & show handlers)
      // - 1 arg (custom configuration to merge)
      var options = $.extend({
         
         openWait : 350, // how long (ms) to wait for first hover of any tab to open
         siblingWait : 150, // how long to wait for a tab to open, if another tab is already open
         closeWait : 300, // how long should a tab wait to close
         fnOver : function( elem ) { elem.show(); },
         fnOut : function( elem ) { elem.hide(); }
         
      }, fnOut ? { fnOver : fnOver, fnOut : fnOut } : fnOver);
      
      // Setup opening/closing timers
      var openTimers = [], closeTimers = [], openTab = null, idCounter = 1;
      
      // return jQuery object
      return this.hover(
         
         function () { 
            
            // -- On Hover --
            
            // If a timer was issued to close the current item, cancel it
            if (closeTimers[this.__refId]) {
            
               clearTimeout(closeTimers[this.__refId]);
               closeTimers[this.__refId] = 0;
               
               // no need to re-open the item
               
            } else { 
            
               // -- Opening a new item --
            
               // How long should the user wait to see a new item?
               // - if there is already an open tab
               // - vs. nothing open
               var openWait = (openTab ? options.siblingWait : options.openWait);
               
               // Generate unique id for element
               if (!this.__refId) this.__refId = idCounter++;
               
               // Issue timer to show current item
               var menu = this; // store ref to current hover menu item
               openTimers[this.__refId] = setTimeout(function () {
                  
                  // Close any item still open
                  if (openTab) {
                     // Cancel timer issued to close it
                     if (closeTimers[openTab.__refId]) {
                        clearTimeout(closeTimers[openTab.__refId]);
                        closeTimers[openTab.__refId] = 0;
                     }
                     options.fnOut($('ul', openTab)); // hide item
                  }
                  
                  // clear open timer ref
                  if (openTimers[menu.__refId]) openTimers[menu.__refId] = 0; 
                  
                  // store reference to new open tab
                  openTab = menu; 
                  options.fnOver($('ul', menu)); // show item
                  
               }, openWait);
            }
         }, 
         function () { 
         
            // -- On (Hover) Out --
            
            // Generate unique id for element
            if (!this.__refId) this.__refId = idCounter++;
            
            // Clear any timer on the current item to prevent it from being shown
            if (openTimers[this.__refId]) {
               clearTimeout(openTimers[this.__refId]);
               openTimers[this.__refId] = 0;
            }
            
            // If another tab was opened, the current tab is already queued to close. Otherwise, close.
            if (openTab == this) {
            
               var menu = this; // store ref to current hover menu item
               closeTimers[openTab.__refId] = setTimeout(function () {
                  if (closeTimers[menu.__refId]) closeTimers[menu.__refId] = 0; // clear close timer ref
                  if (openTab == menu) openTab = 0; // remove ref 
                  options.fnOut($('ul', menu)); // close item
               }, options.closeWait);
               
            }
         }
      );
   };
   
})(jQuery);