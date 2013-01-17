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
