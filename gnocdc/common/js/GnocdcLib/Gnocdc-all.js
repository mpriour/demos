
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
/**
 * Gnocdc.IconPlus class which contains both a GIcon and references to valid zoom levels
 * @classDescription Gnocdc.IconPlus This class contains both a GIcon and references to valid zoom levels.
 * 		This is ussually used as an object literal and not instantiated. However, one can
 * 		instantiate it if it is going to be referenced numerous times.
 */
Gnocdc.IconPlus = Gnocdc.Class({
    /**
     * @propety {GIcon} icon A GIcon to use in a style
     */
	icon: null,
    /**
     * @property {Integer} minZoom The minimum zoom level at which this icon will be used
     */
	minZoom: null,
    /**
	 * @property {Integer} maxZoom The maximum zoom level at which this icon will be used
     */
	maxZoom: null,
    /**
     * @property {[Integer]} levels An array of zoom levels at which this icon will be used.
     * 		This takes precedence over the min and max zoom levels. If this is populated, the
 	 *		min / max zoom levels will be ignored
     */
	levels: [],
    /**
     * @constructor 
     * @param {Object} options A standard options hash. Class is generally not instantiated. 
     */
	initialize: function(options){
        options = options || {};
        if ('levels' in options && !(options.levels instanceof Array)) {
            options.levels = [options.levels]
        }
        Gnocdc.extend(this, options);
    }
});
	
/**
 * Gnocdc.StyleRule
 * @classDescription Gnocdc.StyleRule This class defines a StyleRule which is used in a Style
 */
Gnocdc.StyleRule = Gnocdc.Class({
	/**
	 * @property {Boolean, Function, String, RegEx} rule A boolean value, function, string, or Regular Expression
	 *  which will be evaluated against a single input parameter. Strings will return true if the string
 	 *  occurs ANYWHERE in a string test parameter. Functions must accept a single arguement and return a
	 *  boolean value
	 */
	rule:true,
	/**
	 * @property {[IconPlus]} iconSet An array of IconPlus objects to use if rule evaluates to true.
	 * 	Use object literals (prefered) or instances of IconPlus objects.
	 *  ex: iconSet:[{icon:G_Marker_Default,minZoom:8,maxZoom:12},{icon:otherMarker,maxZoom:7}]
	 */
	iconSet: [],
	/**
	 * @constructor
	 * @param {Object} options A standard options hash
	 */
	initialize: function(options){
		options = options || {}; 
		if('iconSet' in options){
			if(!(options.iconSet instanceof Array)){options.iconSet=[options.iconSet]}
			var icoSetArray = [];
			for(var i=0;i<options.iconSet.length;i++){
				var iconItem = options.iconSet[i];
				//these could be instances of IconPlus or they could be object literals
				//if they are neither, then we are just going to skip it
				if(iconItem instanceof Gnocdc.IconPlus){
					icoSetArray.push(iconItem);
				}
				else if (typeof(iconItem)=='object'){
					icoSetArray.push(new Gnocdc.IconPlus(iconItem));
				}
			}
			options.iconSet = icoSetArray;
		}
		Gnocdc.extend(this, options);
	},
	/**
	 * @method getIcon
	 * @returns {GIcon} The GIcon associated with an IconPlus object
	 * @param {Integer,GMap2} [param] Takes an integer zoom level or an active GMap2
	 * 	object to get the zoom level of. Tests the iconSet for a valid GIcon for the given
	 * 	zoom level. If no parameter is passed, then the first icon in the iconSet is used.
	 *  If a parameter is passed, but nothing matches then the function will return null.
	 */
	getIcon: function(param){
		var zoomLevel;
		if(param && typeof(param)=='number'){
			zoomLevel=param;
		}
		else if (param && param instanceof GMap2 || param instanceof GMap){
			zoomLevel = param.getZoom();
		}
		if (zoomLevel) {
			for (var i = 0; i < this.iconSet.length; i++) {
				if (this.iconSet[i].levels.length > 0) {
					var levels = this.iconSet[i].levels;
					//loop through levels
					for (var j = 0; j < levels.length; j++) {
						if (levels[j] == zoomLevel) {
							return this.iconSet[i].icon;
						}
					}
				}
				else if (this.iconSet[i].minZoom || this.iconSet[i].maxZoom) {
					var minTest = true;
					var maxTest = true;
					//test for minZoom
					if (this.iconSet[i].minZoom) {
						minTest = (zoomLevel >= this.iconSet[i].minZoom) ? true : false;
					}
					//test for maxZoom
					if (this.iconSet[i].maxZoom) {
						maxTest = (zoomLevel <= this.iconSet[i].maxZoom) ? true : false;
					}
					//if both conditions are met then add the rule
					if (minTest && maxTest) {
						return this.iconSet[i].icon;
					}
				}
				//no zoom requirements were set for this IconPlus object, return the icon
				else {
					return this.iconSet[i].icon;
				}
			}
			//no valid icon in this icon set for given zoom
			return null;
		}
		//no valid zoom level was passed, just get first icon
		return this.iconSet[0].icon;
	}
});
	
/**
 * Gnocdc.Style
 * @classDescription The Style class primarily describes a set of rules to evaluate and return the
 * 	correct icon for.
 */
Gnocdc.Style = Gnocdc.Class({
	/**
	 * @property {String} name The name of this style. REQUIRED for proper inclusion into a Style Manager.
	 */
	name: '',
	/**
	 * @property {Object} [context] An optional context object to evaluate rules against. Will be superceded
	 * 	by any parameter passed to the GetIcon function.
	 */
	context: null,
	/**
	 * @property {GMap2} map A reference to an active GMap2 object. Required for proper zoom level dependant
	 * 	icon determination. If this class is used in a StyleManager, then it will inhert the map from the 
	 * 	StyleManager.
	 */
	map:null,
	/**
	 * @property {[IconPlus]} defaultIconSet An array of IconPlus objects to use if no rules evaluate to true.
	 * 	If this object is used in a StyleManager, then it will inherit the defaultIconSet of the StyleManager's
	 * 	defaultStyle property. If all defaults are used in the StyleManager then this will be a single reference
	 * 	to a G_MARKER_DEFAULT icon, valid at all zoom levels.
	 */
	defaultIconSet:[],
	/**
	 * @property {[StyleRule]} rules An array of StyleRule objects. This is THE primary property of a Style class.
	 * 	These rules are evaluated against a context object to determine the correct GIcon to use.
	 */
	rules: [],
	/**
	 * @constructor
	 * @param {Object} options A standard options hash
	 */
	initialize: function(options){
		options = options || {};
		if(options.rules && !(options.rules instanceof Array)){options.rules=[options.rules]}
		if ('defaultIconSet' in options) {
			if (!(options.defaultIconSet instanceof Array)) {
				options.defaultIconSet = [options.defaultIconSet]
			}
			var icoSetArray = [];
			for (var i = 0; i < options.defaultIconSet.length; i++) {
				var iconItem = options.defaultIconSet[i];
				//these could be instances of IconPlus or they could be object literals
				//if they are neither, then we are just going to skip it
				if (iconItem instanceof Gnocdc.IconPlus) {
					icoSetArray.push(iconItem);
				}
				else if (typeof(iconItem) == 'object') {
					icoSetArray.push(new Gnocdc.IconPlus(iconItem));
				}
			}
			options.defaultIconSet = icoSetArray;
		}
		Gnocdc.extend(this, options);
	},
	/**
	 * @method getIcon
	 * @returns {GIcon} Returns the correct GIcon from a StyleRule and it's iconSet.
	 * @param {Object} [otherContext] An optional, but frequently used, object which will be passed to / 
	 * 	or evaluated against the StyleRules in the rules array. If no rules return an icon, then the
	 * 	appropiate icon from the defaultIconSet is used. 
	 */
	getIcon:function(otherContext){
		var thisContext = otherContext || this.context;
		var rules = this.rules;
		for(var i=0;i<rules.length;i++){
			var rule = rules[i].rule;
			var icon = (this.map)?rules[i].getIcon(this.map):rules[i].iconSet[0].icon;
			if(rule instanceof Function){
				if (rule(thisContext)) { return icon; }
			}
			else if (typeof(rule) == 'string' || rule instanceof RegExp || typeof(rule) == 'number') {
				if (thisContext) {
					//if we have a function as context then we need to evaluate it
					if (typeof(thisContext) == 'function') {
						thisContext = thisContext()
					}
					//match will work on strings & string-likes
					if (typeof(thisContext) == 'string' || typeof(thisContext) == 'number') {
						if (thisContext.toString().match(rule)) { return icon; }
					}
				}
				//thisContext is null, then this rule evaluates to false
				else continue;
			}
			else {
				if (rule) { return icon; }
			}
		}
		//if you haven't returned yet, your not going to, so return the default icon
		var defaultIcon;
		var defaultRule = new Gnocdc.StyleRule({iconSet:this.defaultIconSet});
		defaultIcon = (this.map)?defaultRule.getIcon(this.map):defaultRule.iconSet[0].icon;
		return defaultIcon;
	},
	/**
	 * @method getIconFromAttributes Function takes an object and a key for an attribute in that
	 * 	object. It passes the value of attrib[key] to the getIcon function.
	 * @returns {GIcon} Returns the correct GIcon from a StyleRule and it's iconSet.
	 * @param {Object} attrib An object containing keyed attributes
	 * @param {String} key A string reference to an attribute or "key" in the object
	 */
	getIconFromAttributes: function(attrib,key){
		return this.getIcon(attrib[key]);
	}
});

Gnocdc.Style.DefaultStyle = new Gnocdc.Style({name:"default",rules:new Gnocdc.StyleRule({iconSet:{icon:G_DEFAULT_ICON}})});

/**
 * Gnocdc.StyleManager
 * @classDescription StyleManager class keeps a hash of Styles and provides methods for
 * 	determing the correct style to use, setting the map reference, and managing the defaultStyle
 */
Gnocdc.StyleManager = Gnocdc.Class({
    /**
     * @property {Gnocdc.Style} defaultStyle The default style to use as 'default' in the
     * 	style map and whose defaultIconSet is pushed down to each Style added to the styleMap.
     */
	defaultStyle: Gnocdc.Style.DefaultStyle,
    /**
     * @property {Object} styleMap A keyed object. Each key is the reference name of a style and
     * 	each key's property is a Gnocdc.Style object. To populate the styleMap, you can include
     * 	an array of styles in the StyleManager constructor or the function addStyles. You can
     * 	retrieve a style by referencing it's key directly or by using the getStyleByMatch function.
     */
	styleMap: {
        'default': null
    },
    /**
     * @property {Boolean} useStartsWith A boolean flag indicating if matches against style map keys
     * 	should match from start of key only (true) or anywhere in the key (false).
     * 	Default is true.
     */
	useStartsWith: true,
    /**
     * @property {Boolean} ignoreDefault A boolean flag. This property has a VERY signifcant effect on
     * 	the behavior of Styles and the getIcon functions. Do not change this to true, unless you known
     * 	what you are doing. Default is FALSE
     * 	If true, then the 'default' style is removed from the intial style map, the defaultStyle will
     * 	ignored and will not push any of it's properties down to the styles. Also, unless defaultIconSet
     * 	is directly set on a style, then it will be an empty array and getIcon functions will possibly
     * 	return null and NOT a default icon.
     */
	ignoreDefault: false,
    /**
     * @property {GMap2} map A reference to an active GMap2 object. If not included in the constructor,
     * 	then it should ONLY be set using the setMap function. Otherwise the map reference will not get
     * 	pushed down to the Styles in the styleMap and zoom level depedant getIcon functions will not
     * 	work correctly. 
     */
	map: null,
	/**
	 * @property {Integer} stylesLength an internal counter. Don't mess with this.
	 */
	stylesLength:1,
    /**
     * @constructor Gnocdc.StyleManager
     * @param {[Gnocdc.Style]} styles An array of Gnocdc.Style objects or object literals representing
     * 	some properties to overwrite on a new style object.
     * @param {Object} options A standard options hash. You should set a defaultStyle here if you
     * 	want something other than the default GMap icon. There is not a method for pushing this down
     * 	to the styles in the styleMap if you set it after intialization.
     */
	initialize: function(styles, options){
        options = options || {};
        if (this.ignoreDefault) {
            this.styleMap = {};
        }
		else{this.styleMap['default']=Gnocdc.Style.DefaultStyle}
        Gnocdc.extend(this, options);
        if (styles) this.addStyles(styles);
    },
    /**
     * @method getStyleByMatch This method a test object and an optional context object. It attempts to
     * 	match a style key from the styleMap with the test object. The matching occurs differently
     * 	depending on what type of object you pass as the test object.
     * @returns {Gnocdc.Style} A Style object from the styleMap that matches the test object in some way
     * @param {Function, String, RegEx, Boolean} test This can be a function which will recieve each style
     * 	(one at a time) from the style key and the optional context object as well. Strings and Regular
     * 	Expressions without a context object will match directly against the keys in the styleMap. Strings
     * 	with a context object will attempt to match the value of context[test] against the keys in the
     * 	styleMap. Regular Expressions with a context string will attempt to match against the value of
     * 	the context string property in the Style (ie someRegEx.test(styleMap[key][context]), where someRegEx
     * 	has been passed as the test parameter )  
     * 	 
     * @param {Object} [context] An optional parameter used differntly depending on what type of object
     * 	is passed as the test parameter
     */
	getStyleByMatch: function(test, context){
        for (var styleKey in this.styleMap) {
            var style = this.styleMap[styleKey];
            if (test instanceof Function) {
                if (test(style, context)) { return style; }
            }
            else if (test && context && typeof(test) == 'string' && test in context && (typeof(context[test]) == 'string' || typeof(context[test]) == 'number')) {
                var statement = (this.useStartsWith) ? '^' + context[test] : '' + context[test];
                var regex = new RegExp(statement);
                if (regex.test(styleKey)) { return style; }
            }
            else if (test && typeof(test) == 'string' || typeof(test) == 'number') {
                var statement = (this.useStartsWith) ? '^' + test : '' + test;
                var regex = new RegExp(statement);
                if (regex.test(styleKey)) { return style; }
            }
            else if (test instanceof RegExp && context.toString() in style) {
                if (test.test(style[context].toString())) { return style; }
            }
            else if (test instanceof RegExp) {
                if (test.test(styleKey)) { return style; }
            }
            else {
                if (styleKey === test) { return style; }
            }
        }
        //if you haven't returned yet, your not going to, so return
        //the default style, unless ignoreDefault is true
        return (!this.ignoreDefault) ? this.defaultStyle : null;
    },
	/**
	 * @method addStyles Adds a style to the styleMap. Use this function since it pushes several
	 * 	references down to the Style before adding it to the styleMap.
	 * @return null 
	 * @param {[Gnocdc.Style]} styles An array of Style objects, implied Style object literals or
	 * 	Strings used to add copies of the defaultStyle with a given string key to the styleMap. Note:
	 * 	if ignoreDefaults is true then, this last type will be ignored.  
	 */
    addStyles: function(styles){
        styles = (styles instanceof Array) ? styles : [styles];
        var defaultIconSet = (!this.ignoreDefault) ? this.defaultStyle.defaultIconSet : null;
        for (var i = 0; i < styles.length; i++) {
            if (styles[i] instanceof Gnocdc.Style) {
                //things are not going to work if a name has not been assigned to the style
                if (!styles[i].name) {
                    styles[i].name = 'style' + this.stylesLength
                }
                if (defaultIconSet && styles[i].defaultIconSet.length==0) {
                    styles[i].defaultIconSet = defaultIconSet
                }
                styles[i].map = this.map;
                this.styleMap[styles[i].name] = styles[i];
				this.stylesLength++;
            }
            //we might have an implied new style object, needs to have a name property
            else if (styles[i].hasOwnProperty('name') || styles[i].hasOwnProperty('context') || styles[i].hasOwnProperty('rules') || styles[i].hasOwnProperty('defaultIconSet')) {
                if (!styles[i].name) {
                    styles[i].name = 'style' + this.stylesLength
                }
                if (defaultIconSet && styles[i].defaultIconSet.length==0) {
                    styles[i].defaultIconSet = defaultIconSet
                }
                styles[i].map = this.map;
                var style = new Gnocdc.Style(styles[i]);
                this.styleMap[styles[i].name] = style;
				this.stylesLength++;
            }
            //we might have an implied new style object in the form of key:{styleOptions}
            else if (function(){
                for (var key in styles[i]) {
                    var obj = styles[i][key];
                    if (obj.hasOwnProperty('name') || obj.hasOwnProperty('context') || obj.hasOwnProperty('rules') || obj.hasOwnProperty('defaultIconSet')) { return true; }
                    else { return false; }
                }
            }) {
                for (var key in styles[i]) {
                    if (styles[i].defaultIconSet.length==0) {
                        styles[i][key].defaultIconSet = defaultIconSet
                    }
                    styles[i][key].map = this.map;
                    var style = new Gnocdc.Style(styles[i][key]);
                    this.styleMap[key] = style
					this.stylesLength++;
                    break; //we only want to do this once	
                }
            }
            //we just have a string it will be the key for a new default style clone added to the style map
            //!!caution!! : if ignoreDefault is true then this will just get ignored
            else if (typeof(styles[i]) == 'string') {
                if (!ignoreDefault) {
                    this.styleMap[styles[i]] = Gnocdc.extend({
                        'defaultIconSet': defaultIconSet,
                        'map': this.map
                    }, this.defaultStyle);
					this.stylesLength++;
                }
            }
        }
    },
	/**
	 * @method setMap Sets the map parameter for the style manager. Also pushes this reference down to 
	 * 	styles already in the styleMap. Use this function if you did not set a map option in the 
	 * 	constructor.
	 * @param {GMap2} map An active GMap2 object
	 */
	setMap:function(map){
		if(!map){return false}
		else{
			this.map = map;
			//push the map down to all styles
			for(key in this.styleMap){
				this.styleMap[key].map=map;
			}
		}
	}
});

pi = Math.PI;

Gnocdc.MarkerExplode = Gnocdc.Class({

    map: null,
    
    minZoom: 0,
    
    maxZoom: 30,
    
    maxOverlap: 1.0,
    
    minOverlap: 0.0,
    
    markers: [],
    
    markersToMove: [],
    

    /**
     * Constructor: OpenLayers.Format.Filter
     * Create a new parser for Filter.
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(gmap,options) {
        this.map = gmap
		options = options || {}; 
		Gnocdc.extend(this, options);
    },

     /** 
     * APIMethod: destroy
     * Remove reference to anything added.
     */
    destroy: function() {
		this.map = null;
    },
  
	getOverlapMarkers: function(){
        var map = this.map;
        //get the first marker
        var m = this.markers[0];
        //calculate tolerance in pixels
        var tolPixel = this.getPixelTolerance(m);
        //calculate tolerance in decimal degree units
        var tolDeg = this.getDegreeTolerence(tolPixel);
        //parent array that will hold the moveable marker arrays
        var parray = this._calcOverlapMarkers(tolDeg);
        return parray;
    },
	
    getDegreeTolerence: function(pixels){
        var tolLat, tolLon;
        var cLatLon = this.map.getCenter();
        var cPoint = this.map.fromLatLngToDivPixel(cLatLon);
        var ptX = cPoint.x + pixels;
        var ptY = cPoint.y + pixels;
        tolLon = Math.abs(this.map.fromDivPixelToLatLng(new GPoint(ptX, cPoint.y)).lng() - cLatLon.lng());
        tolLat = Math.abs(this.map.fromDivPixelToLatLng(new GPoint(cPoint.x, ptY)).lat() - cLatLon.lat());
        return (tolLon + tolLat) / 2;
    },
	
	getPixelTolerance:function(gmarker){
		var curZoom = this.map.getZoom();
		var pixels = 0;
		if(curZoom>=this.minZoom)
		{
			//get pixel width of icon
			var iwidth = gmarker.getIcon().iconSize.width;
			//modify width based on zoom level & overlap settings
			if(curZoom>=this.maxZoom)
			{
				pixels=iwidth*(1 - this.minOverlap);
			}
			else
			{
				var zoomDif = curZoom - this.minZoom;
				var overlap = this.maxOverlap;
				if(zoomDif>0){overlap = this.maxOverlap / Math.pow(2,zoomDif)}
				if(overlap<this.minOverlap){overlap=this.minOverlap}
				pixels = iwidth * (1-overlap);
			}
		}
		return pixels;
	},
    explodeMarkers: function(){
        //first order the markers geograhpically
		this.markers = this.map.getMarkers();
		this.markers.sort(this.orderMarkersSnWe);
		this.markersToMove = this.getOverlapMarkers();
        var n = this.markersToMove.length;
        for (var i = 0; i < n; i++) {
            this.moveMarkers(this.markersToMove[i]);
        }
    },
    moveMarkers: function(marray){
        var n = marray.length;
        if (n > 1) {
			var m = marray[0];
			var r = this.getPixelTolerance(m)/2;
			
			for (var j = 1; j <= n; j++) {
				m = marray[j-1];
				if (!m.isModified) {
					var theta = (j * 2 * pi / n);
					var dxPix = Math.round(Math.sin(theta) * r);
					var dyPix = Math.round(Math.cos(theta) * r);
					var curPix = this.map.fromLatLngToDivPixel(m.getLatLng());
					var newLatLng = this.map.fromDivPixelToLatLng(new GPoint(curPix.x + dxPix, curPix.y + dyPix));
					m.setLatLng(newLatLng);
					m.isModified = true;
				}
			}
		}
    },
    restorePositions: function(){
        this.markers = this.map.getMarkers();
		var mcount = this.markers.length;
		for(var i=0;i<mcount;i++){
			m = this.markers[i];
		    m.setLatLng(m.trueLocation);
            m.isModified = false;
        }
    },
    _calcOverlapMarkers: function(degreeTolerance){
        var tolDeg = degreeTolerance;
		var parray = [];
        if (tolDeg > 0) {
			//cache marker array length
			var n = this.markers.length;
			//loop through the marker array and create sub arrays of markers that should be moved
			for (var i = 0; i < n - 1; i++) {
				var coord1 = this.markers[i].getLatLng();
				var coord2 = this.markers[i + 1].getLatLng();
				if (Math.abs(coord1.lat() - coord2.lat()) <= tolDeg &&
				Math.abs(coord1.lng() - coord2.lng()) <= tolDeg) {
					var k = 1;
					//intialize child array with the 1st marker
					var carray = [this.markers[i]];
					do {
						//add additional markers to the child array
						carray.push(this.markers[i + k]);
						k++;
						//test if we have reached the end of the array, n=cached array length
						if (i + k < n) {
							coord2 = this.markers[i + k].getLatLng();
						}
						else {
							break;
						}
					}
					while (Math.abs(coord1.lat() - coord2.lat()) <= tolDeg &&
					Math.abs(coord1.lng() - coord2.lng()) <= tolDeg)
					parray.push(carray);
					i += k - 1;
				}
			}
		}
        return parray;
    },
	
	orderMarkersSnWe: function(m1, m2){
		var coord1 = m1.getLatLng();
		var coord2 = m2.getLatLng();
		if (coord1.equals(coord2)) {
			//they are at exactly the same place, just put the 1st one first
			return 1;
		}
		else 
			if (coord1.lat() > coord2.lat()) {
				//m1 is north of m2, put m2 first
				return -1;
			}
			else 
				if (coord1.lat() < coord2.lat()) {
					//m2 is north of m1, put m1 first
					return 1;
				}
				else //all coordinates are not equal but the latitude must be, so use longitude
				{
					var a = 0;
					(coord1.lng() > coord2.lng()) ? a = -1 : a = 1;
					return a;
				}
	}
});
/**
 * @classDescription GMarker add-on properties
 * @method null - automatically executes when script is included
 * 			Add several properties to GMarker 
 * @property GMarker.attributes {Object} - a place to store attributes associated with the marker
 * @property GMarker.markerClass {String} - a style or class identifier
 * @property GMarker.trueLocation {GLatLon} - the original location of the marker.
 * 		Can be helpful when doing marker clustering or marker exploding
 * @property GMarker.isModified {Boolean} - a flag indicating whether or not the marker has moved
 * 		from orignial location.
 * @property GMarker.map {GMap2} - a reference to the map on which the marker resides. Could be
 * 		useful, but is not currently used in any scripts
 */

GMarker.prototype.attributes = {}
GMarker.prototype.styleClass = null;
GMarker.prototype.trueLocation={};
GMarker.prototype.isModified = false;
GMarker.prototype.map = null;

/**
 * GMarkerHelper
 * @classDescription {Static Class} GMarkerHelper - Adds overlay & marker access methods 
 */
GMarkerHelper={};
/**
 * @method attach - static public method. Finds the overlay array key & the icon object key
 * for GMap2 & GMarker respectively and adds them as public properties of the parent objects.
 * Also internally calls the _addFunctions routine which actually adds the helper methods.
 * @param {Object} map
 * @return {null} null
 */
GMarkerHelper.attach = function(map){
    GMap2.prototype.overlayKey = GMarkerHelper._getOverlayKey(map)
	GMarker.prototype.iconKey = GMarkerHelper._getIconKey(map)
	GMarkerHelper._addFunctions();
}

/**
 * @method _addFunctions - static private method which adds the helper functions
 * to GMap2 & GMarker
 * @return {null} null 
 */
GMarkerHelper._addFunctions = function() {
    /**
    * @method getOverlays - static public function. Returns an array of GOverlays in the map
    * @returns {[GOverlay]} array of GOverlays added to the map
    */
    GMap2.prototype.getOverlays = function() {
       return this[this.overlayKey];
    }
    /**
    * @method getMarkers - GMap extension function. Returns an array of GMarkers in the map
    * @returns {[GMarkers]}
    */
    GMap2.prototype.getMarkers = function() {
        var overlays = this.getOverlays();
        if (overlays && overlays.length && overlays.length > 0) {
            var mrkrs = [];
            for (var i = 0; i < overlays.length; i++) {
                if ('getLatLng' in overlays[i]) { //test for marker
                    mrkrs.push(overlays[i]);
                }
            }
            return mrkrs;
        }
        else
            return [];
    }
    /**
    * @method removeMarkers - GMap extension function. Removes all the GMarkers from the map
    * @returns {null} null
    */
    GMap2.prototype.removeMarkers = function() {
        var markers = this.getMarkers();
        if (markers && markers.length && markers.length > 0) {
            for (var i = 0; i < markers.length; i++) {
                this.removeOverlay(markers[i]);
            }
        }
    }
    /**
    * @method createCopy - GMarker extension function. Returns a marker at the same position,
    * 		but with a possibly new icon. The marker should also have the same title and the
    * 		same values for the extension properties of 'attributes' and 'styleClass'
    * @param {GIcon} newIcon
    */
    GMarker.prototype.createCopy = function(newIcon) {
    	var ico = (newIcon) ? newIcon : this.getIcon() ;
		var newMarker = new GMarker(this.getLatLng(),{title:this.getTitle(),icon:ico});
        newMarker.attributes = this.attributes;
        newMarker.styleClass = this.styleClass;
		newMarker.trueLocation = this.trueLocation;
		newMarker.isModified = this.isModified;
		newMarker.map = this.map;
        return newMarker
    }
}

/*--Private methods that discover overlay & icon keys--*/
/**
 * @method _getOverlayKey - Discovers the overlay array key for the GMap2 object by looking for
 * an array of objects implementing GOverlay.
 * @returns {String} - The string representation of the object key containing the overlay array
 */
GMarkerHelper._getOverlayKey = function(map){
	//add a marker to the map to be sure that we have at least 1 valid GOverlay
	var testMarker = new GMarker(new GLatLng(1,1));
	map.addOverlay(testMarker);
	var goverlayKeys = ['initialize','remove','redraw'];
	var overlayTest = function(testObj){
		for(var n=0;n<goverlayKeys.length;n++){
			if(!(typeof(testObj)=='object' && goverlayKeys[n] in testObj)){return false}
		}
		//we haven't returned false so return true
		return true;
	}
	//now iterate over the GMap object keys and find array instances
	for(var key in map){
		if(map[key] instanceof Array && map[key].length>0){
			var possibleArray = map[key];
			var testResult = false;
			//test the 1st, last & middle objects for GOverlay inheritance
            switch (possibleArray.length) {
                case 1:
                    testResult = overlayTest(possibleArray[0]);
                    break;
                case 2:
                    var test1, test2;
                    test1 = overlayTest(possibleArray[0]);
                    test2 = overlayTest(possibleArray[1]);
                    testResult = (test1 && test2);
                    break;
                default:
                    var testIndex = [0, possibleArray.length - 1, Math.round(possibleArray.length / 2) - 1];
                    for (var i = 0; i < testIndex.length; i++) {
                        testResult = overlayTest(possibleArray[testIndex[i]]);
                        if (!testResult) {
                            break;
                        }
                    }
                    break;
            }
			//if you find a key that matches all the criteria, then return it
			if(testResult){
				map.removeOverlay(testMarker);
				return key;
			}
			//otherwise continue looping
		}
	}
	//return null if you can't find anything (should never happen)
	return null;
}
/**
 * @method _getIconKey - Discovers the GIcon key for the GMarker object by looking for
 * an object that is an instance of GIcon
 * @returns {String} - The string representation of the object key containing the icon object
 */
GMarkerHelper._getIconKey = function(map){
	//add a marker to the map
	var testMarker = new GMarker(new GLatLng(1,1));
	map.addOverlay(testMarker);
	for(var key in testMarker){
		if (testMarker[key] instanceof GIcon) {
			//remove test marker
			map.removeOverlay(testMarker);
			return key
		}
	}
}