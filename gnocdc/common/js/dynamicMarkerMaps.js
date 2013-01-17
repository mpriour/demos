DynamicMarkerMap = true;

function AddDynMapEventListeners(map){
	Event.on(Dom.getElementsBy(function(e){
			return (e.name == 'chooser')
		},'input'),'click',handleChooserChange);
	GEvent.addListener(map, 'zoomend', ZoomLayerSwitch);
	GEvent.addListener(map, 'zoomend', handleZoomChange);
	if (MarkerExploder) {
		GEvent.addListener(map, 'zoomend', shiftMarkers);
	}
    //listen for click events and dispay the Info Window if you click on a marker
    GEvent.addListener(map, 'click', function(over, latlng){
        if (over != null && over instanceof GMarker) {
            map.openInfoWindowHtml(over.getLatLng(), CreateInfoHtml(over.attributes));
        }
    });
	GEvent.addListener(map, 'maptypechanged',function(){AutoSwitchTypes=false;});
}
function handleChooserChange(e){
	//locate the element on which the click was made
	var elem = e.srcElement || e.target;
	/* find the value of the radio button
	 * this should map to a style key, an attribute key, and DIV id
	 */
	var styleId = elem.value;
	//call the changeMarkers function using the styleId string
	changeMarkersByAttributes(styleId);
	//get an array of radio buttons whose name attribute is set to "chooser"
	var radios = Dom.getElementsBy(function(el){return(el.name=='chooser')},'input');
	//loop through radios and keep any unselected radio button's associated
	//div hidden. Make the selected radio button's associated div visible.
	for(var i=0;i<radios.length;i++){
		if(radios[i].value == elem.value){
			Dom.removeClass(radios[i].value,'hidden');
		}
		else{
			Dom.addClass(radios[i].value,'hidden');
		}
	}
}

function handleZoomChange(oldLevel,newLevel){
	//find the value of the selected styleId to make sure that we use the correct style
	var styleId = Dom.getElementsBy(function(elem){return(elem.name=='chooser' && elem.checked)},'input')[0].value;
	//call the changeMarkers function with the styleId string
	changeMarkersByAttributes(styleId);	
}

function shiftMarkers(oldLevel,newLevel){
	MarkerExploder.restorePositions();
	MarkerExploder.explodeMarkers();
}

/* Use the styleKey string to identify the style in the styleMap to use,
 * and to get the field name of the attribute which are evaluating for this
 * style.
 */
function changeMarkersByAttributes(styleKey){
    //get an array of markers from the map. Requires the GMarkerHelper.
	var mrkrs = MyMap.getMarkers();
	var oldMrkrs = [];
    for (var i = 0; i < mrkrs.length; i++) {
        /*find the new icon given the style, the marker's attributes, and the key to reference in the
         * attribute object.
         */
		var newIcon = StyleMgmr.styleMap[styleKey].getIconFromAttributes(mrkrs[i].attributes, AttribKeys[styleKey]);
        //get the current icon of the marker.
		var curIcon = mrkrs[i].getIcon();
        //if the current icon & new icon are different, then switch out the entire marker object
		if (newIcon.image != curIcon.image || !newIcon.iconSize.equals(curIcon.iconSize)) {
            var m = mrkrs[i].createCopy(newIcon);
			MyMap.addOverlay(m);
			//add the marker to replace into the oldMrkrs array.
			oldMrkrs.push(mrkrs[i]);
        }
    }
	//loop through the oldMrkrs array and remove all of them from the map
	for(var i=0;i<oldMrkrs.length;i++){
		MyMap.removeOverlay(oldMrkrs[i]);
	}
}