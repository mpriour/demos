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