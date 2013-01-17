
/* TAKEN DIRECTLY FROM THE OPENLAYERS PROJECT, which is:
 * Copyright (c) 2006-2008 MetaCarta, Inc., published under the Clear BSD
 * license.  See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */

/**
 * Namespace: Gnocdc
 * The Gnocdc object provides a namespace for all things Gnocdc
 */
window.Gnocdc = {}

/**
 * Function: extend
 * Copy all properties of a source object to a destination object.  Modifies
 *     the passed in destination object.  Any properties on the source object
 *     that are set to undefined will not be (re)set on the destination object.
 *
 * Parameters:
 * destination - {Object} The object that will be modified
 * source - {Object} The object with properties to be set on the destination
 *
 * Returns:
 * {Object} The destination object.
 */
Gnocdc.extend = function(destination, source) {
    destination = destination || {};
    if(source) {
        for(var property in source) {
            var value = source[property];
            if(value !== undefined) {
                destination[property] = value;
            }
        }

        /**
         * IE doesn't include the toString property when iterating over an object's
         * properties with the for(property in object) syntax.  Explicitly check if
         * the source has its own toString property.
         */

        /*
         * FF/Windows < 2.0.0.13 reports "Illegal operation on WrappedNative
         * prototype object" when calling hawOwnProperty if the source object
         * is an instance of window.Event.
         */

        var sourceIsEvt = typeof window.Event == "function"
                          && source instanceof window.Event;

        if(!sourceIsEvt
           && source.hasOwnProperty && source.hasOwnProperty('toString')) {
            destination.toString = source.toString;
        }
    }
    return destination;
};

/**
 * Constructor: Gnocdc.Class
 * Base class used to construct all other classes. Includes support for 
 *     multiple inheritance. 
 *     
 */
Gnocdc.Class = function() {
    var Class = function() {this.initialize.apply(this, arguments)};
    var extended = {};
    var parent, initialize;
    for(var i=0, len=arguments.length; i<len; ++i) {
        if(typeof arguments[i] == "function") {
            // make the class passed as the first argument the superclass
            if(i == 0 && len > 1) {
                // replace the initialize method with an empty function,
                // because we do not want to create a real instance here
                initialize = arguments[i].prototype.initialize;
                arguments[i].prototype.initialize = function() {};
                // the line below makes sure that the new class has a
                // superclass
                extended = new arguments[i];
                // restore the original initialize method
                arguments[i].prototype.initialize = initialize;
            }
            // get the prototype of the superclass
            parent = arguments[i].prototype;
        } else {
            // in this case we're extending with the prototype
            parent = arguments[i];
        }
        Gnocdc.extend(extended, parent);
    }
    Class.prototype = extended;
    return Class;
};
