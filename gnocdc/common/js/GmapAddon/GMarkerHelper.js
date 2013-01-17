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
    * @method getOverlays - GMap extension function. Returns an array of GOverlays in the map
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