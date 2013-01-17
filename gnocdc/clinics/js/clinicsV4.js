var _markers = [];
var _labels=[];
var _markerMgmr;
var _markerMover;
var _autoSwitch=true;
var _isRouteLayerOn=false;
var _lastZoomLevel=0;

function globalsSetup(){
	//create all the icons
	// ------ students
	_student1 = buildGIcon("../Markers/Restrictions/4Students8x8.png", 8, 8, "../Markers/Restrictions/4Students8x8.gif");
	_student3 = buildGIcon("../Markers/Restrictions/4Students16x16.png", 16, 16, "../Markers/Restrictions/4Students16x16.gif");
	_student5 = buildGIcon("../Markers/Restrictions/4Students24x24.png", 24, 24, "../Markers/Restrictions/4Students24x24.gif");
	// ------ none
	_none1 = buildGIcon("../Markers/Restrictions/1NoRestrictions8x8.png", 8, 8, "../Markers/Restrictions/1NoRestrictions8x8.gif");
	_none3 = buildGIcon("../Markers/Restrictions/1NoRestrictions16x16.png", 16, 16, "../Markers/Restrictions/1NoRestrictions16x16.gif");
	_none5 = buildGIcon("../Markers/Restrictions/1NoRestrictions24x24.png", 24, 24, "../Markers/Restrictions/1NoRestrictions24x24.gif");
	// ------ chidren
	_children1 = buildGIcon("../Markers/Restrictions/3Children8x8.png", 8, 8, "../Markers/Restrictions/3Children8x8.gif");
	_children3 = buildGIcon("../Markers/Restrictions/3Children16x16.png", 16, 16, "../Markers/Restrictions/3Children16x16.gif");
	_children5 = buildGIcon("../Markers/Restrictions/3Children24x24.png", 24, 24, "../Markers/Restrictions/3Children24x24.gif");
	// ------ Adults
	_adult1 = buildGIcon("../Markers/Restrictions/2Adults8x8.png", 8, 8, "../Markers/Restrictions/2Adults8x8.gif");
	_adult3 = buildGIcon("../Markers/Restrictions/2Adults16x16.png", 16, 16, "../Markers/Restrictions/2Adults16x16.gif");
	_adult5 = buildGIcon("../Markers/Restrictions/2Adults24x24.png", 24, 24, "../Markers/Restrictions/2Adults24x24.gif");
	// ------ Homeless Men
	_homeless1 = buildGIcon("../Markers/Restrictions/5Homeless8x8.png", 8, 8, "../Markers/Restrictions/5Homeless8x8.gif");
	_homeless3 = buildGIcon("../Markers/Restrictions/5Homeless16x16.png", 16, 16, "../Markers/Restrictions/5Homeless16x16.gif");
	_homeless5 = buildGIcon("../Markers/Restrictions/5Homeless24x24.png", 24, 24, "../Markers/Restrictions/5Homeless24x24.gif");
	
	//zoom level breaks
	_levelBreaks = [0, 14, 30];
	//the marker order functions
	    function orderMarkersNsEw (m1, m2){
        var coord1 = m1.getLatLng();
        var coord2 = m2.getLatLng();
        if (coord1.equals(coord2)) {
            //they are at exactly the same place, just put the 1st one first
            return 1;
        }
        else 
            if (coord1.lat() > coord2.lat()) {
                //m1 is north of m2, put m1 first
                return 1;
            }
            else 
                if (coord1.lat() < coord2.lat()) {
                    //m2 is north of m1, put m2 first
                    return -1;
                }
                else //all coordinates are not equal but the latitude must be, so use longitude
                {
                    var a = 0;
                    (coord1.lng() > coord2.lng()) ? a = 1 : a = -1;
                    return a;
                }
    }
   function orderMarkersSnWe(m1, m2){
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

	//initialize the map
	//create map as global object
	_map = new GMap2(document.getElementById("map"), {
		mapTypes: [G_PHYSICAL_MAP, G_NORMAL_MAP, G_SATELLITE_MAP, G_HYBRID_MAP],
		mapOrderMarkers: orderMarkersNsEw
	});
	
	//intialize & set options on marker explode object
	_markerMover = new Gnocdc.MarkerExplode(_map,{minZoom:11,minOverlap:0.1});
	
	//The style map object which configures how things are displayed
	_styleMap = {
		"students": {
			name: "students",
			search: "Students",
			icons: [{
				rule: (_map.getZoom() >= _levelBreaks[0] && _map.getZoom() < _levelBreaks[1]),
				icon: _student1
			}, {
				rule: (_map.getZoom() >= _levelBreaks[1] && _map.getZoom() < _levelBreaks[2]),
				icon: _student3
			}]
		},
		"none": {
			name: "none",
			search: "No restrictions",
			icons: [{
				rule: (_map.getZoom() >= _levelBreaks[0] && _map.getZoom() < _levelBreaks[1]),
				icon: _none1
			}, {
				rule: (_map.getZoom() >= _levelBreaks[1] && _map.getZoom() < _levelBreaks[2]),
				icon: _none3
			}]
		},
		"children": {
			name: "children",
			search: "Children",
			icons: [{
				rule: (_map.getZoom() >= _levelBreaks[0] && _map.getZoom() < _levelBreaks[1]),
				icon: _children1
			}, {
				rule: (_map.getZoom() >= _levelBreaks[1] && _map.getZoom() < _levelBreaks[2]),
				icon: _children3
			}]
		},
		"adults": {
			name: "adults",
			search: "Adults",
			icons: [{
				rule: (_map.getZoom() >= _levelBreaks[0] && _map.getZoom() < _levelBreaks[1]),
				icon: _adult1
			}, {
				rule: (_map.getZoom() >= _levelBreaks[1] && _map.getZoom() < _levelBreaks[2]),
				icon: _adult3
			}]
		},
		"homeless": {
			name: "homeless",
			search: "Homeless",
			icons: [{
				rule: (_map.getZoom() >= _levelBreaks[0] && _map.getZoom() < _levelBreaks[1]),
				icon: _homeless1
			}, {
				rule: (_map.getZoom() >= _levelBreaks[1] && _map.getZoom() < _levelBreaks[2]),
				icon: _homeless3
			}]
		}
	};
}
function ClinicMapLoad(){
	window.onresize = handleResize;
    handleResize();
	//show the directions
	displayDirections();
	//make sure the check box is unchecked
	document.getElementById("cboxRoutes").checked=false;
    var defaultSettings = {
        lat: 30.0114680972504,
        lon: -89.9194729858441,
        type: G_PHYSICAL_MAP.getName(true),
        zoom: 11
    };

	globalsSetup();
	//turn on wait indicator
	toggle("waitBox");
	
	//create tile layer
    _myCopyright = new GCopyrightCollection("(c) ");
    _myCopyright.addCopyright(new GCopyright('Demo', new GLatLngBounds(new GLatLng(-90, -180), new GLatLng(90, 180)),0,""));
    _tilelayer = new GTileLayer(_myCopyright, 8,18);
    _tilelayer.getTileUrl = function(tile,zoom){return "http://maps.gnocdc.org/maps/tiles/RTA/Layers/" + zoom + "/" + tile.x + "/" + tile.y + ".png";};
    _tilelayer.isPng = function() { return true;};
    _tilelayer.getOpacity = function(){
		return 1.0;
	}
	//create tile layer as tile overlay, but dont add it
	_rtaOverlay=new GTileLayerOverlay(_tilelayer);
    
    //test for permalink
    if (document.location.search.length == 0) //no permalink, use default
    {
        _map.setCenter(new GLatLng(defaultSettings.lat, defaultSettings.lon), defaultSettings.zoom, G_PHYSICAL_MAP);
    }
    else {
        usePermalink(_map, defaultSettings);
    }
    
	//intialize & set options on marker manager object
	_markerMgmr = new MarkerManager(_map,{maxZoom:30,borderPadding:50,trackMarkers:false});
	

	//load GeoJSON File
	loadJsonMarkers("clinics-geo.js", null);
	
	// ===== Set controls=====
    _overviewControl = addCommonControls(_map);
	_map.addControl(new GHierarchicalMapTypeControl());
    
    //attach the maptype event listners
	//listen for map type changes and turn off auto switching between Normal map & Physical Map
    GEvent.addListener(_map,'maptypechanged',function(){(_map.getCurrentMapType()!=G_PHYSICAL_MAP && _map.getZoom()!=15)?_autoSwitch=false:_autoSwitch=true;})
	//listen for zoom events, when you get to a certain place map type will automatically change
	GEvent.addListener(_map, 'zoomend', zoomLayerSwitch);
	//listen for click events and dispay the Info Window if you click on a marker
	GEvent.addListener(_map,'click',function(over,latlng){
		if(over!=null && over["markerClass"])
		{
			_map.openInfoWindowHtml(over.getLatLng(),createInfoHtml(over.attributes));
		}
	});
	//listen for map to stop moving or zooming
	GEvent.bind(_markerMgmr,'changed',_markerMover,_markerMover.explodeMarkers);	
	
	//check if Physical Map Type (terrian map) is still the current one
	(_map.getCurrentMapType()==G_PHYSICAL_MAP)?_autoSwitch=true:_autoSwitch=false;
    
	//add map logo
    addMapLogo(_map);
}

function ClinicPrintMapLoad(){
    document.getElementsByTagName('html')[0].style.overflow='auto';
	var defaultSettings = {
        lat: 30.0114680972504,
        lon: -89.9194729858441,
        type: G_PHYSICAL_MAP.getName(true),
        zoom: 11
    };
    //create map as global object
    _map = new GMap2(document.getElementById("printMap"));
	toggle('waitBox');
		//create tile layer
    _myCopyright = new GCopyrightCollection("(c) ");
    _myCopyright.addCopyright(new GCopyright('Demo', new GLatLngBounds(new GLatLng(-90, -180), new GLatLng(90, 180)),0,""));
    _tilelayer = new GTileLayer(_myCopyright, 8,18);
    _tilelayer.getTileUrl = function(tile,zoom){return "http://maps.gnocdc.org/maps/tiles/RTA/Layers/" + zoom + "/" + tile.x + "/" + tile.y + ".png";};
    _tilelayer.isPng = function() { return true;};
    _tilelayer.getOpacity = function(){
		return 1.0;
	}
	//create tile layer as tile overlay, but dont add it
	_rtaOverlay=new GTileLayerOverlay(_tilelayer);
    
    //test for permalink
    if (document.location.search.length == 0) //no permalink, use default
    {
        _map.setCenter(new GLatLng(defaultSettings.lat, defaultSettings.lon), defaultSettings.zoom, G_PHYSICAL_MAP);
    }
    else {
        usePermalink(_map, defaultSettings);
    }
    
	//create label manager
    _markerMgmr = new MarkerManager(_map,{maxZoom:30});

	//load GeoJSON File
	loadJsonMarkers("clinics-test.js", null);
	
	//load controls
	_map.addControl(new GSmallMapControl());
	
	//add map logo
    addMapLogo(_map);

    fillDate();		
}

/**
 * Loads GeoJSON formated markers from a url and processes them through the specified callback. Uses the dynamic
 * script tag technique. Uses the JSR javascript file. Assigns the request an object handle of jsRequest. Use
 * this in the callback or other functions as needed
 * //TODO Transition over to YUI's JSON data loader to minimize additionaly libraries needed.
 * @param {String} url
 * @param {Function} callback
 */
function loadJsonMarkers(url, callback){
    var request;
    (callback) ? request =[url,"&callback=",callback] .join('') : request = url;
    jsRequest = new JSONscriptRequest(request);
    jsRequest.buildScriptTag();
    jsRequest.addScriptTag();
}

/**
 * Function creates a GIcon object. Anchor for both icon & info window is at center of icon
 * @param {String} iconPath Relative or absolute path to the image for the icon
 * @param {Int} iconWidth Width of the icon in pixels
 * @param {Int} iconHeight Height of the icon in pixels
 * @param {String} printIconPath Relative or absolute path to the printable image for the icon. Must be a *.gif
 * @return (GIcon) a GIcon object
 */
function buildGIcon(iconPath,iconWidth,iconHeight,printIconPath)
{
	var icon = new GIcon(null,iconPath);
	icon.iconSize=new GSize(iconWidth,iconHeight);
	icon.iconAnchor = new GPoint(iconWidth/2,iconHeight/2);
	icon.infoWindowAnchor = new GPoint(iconWidth/2,iconHeight/2);
	icon.printImage = printIconPath;
	icon.mozPrintImage=printIconPath;
	return icon;
}

function toggle(id){
    var elem = document.getElementById(id);
    (elem!=null && elem.style.display == "block") ? elem.style.display = "none" : elem.style.display = "block";
}

-

function getStyleFromAttributes(attrib){
    //search attributes for a restriction classification match
    var style=null;
    for (var i in _styleMap) {
        if (attrib.RESTRICTIO.match(_styleMap[i].search)) {
            style = _styleMap[i]
			break;
        }
    }
	//if we can't find a style that matches, just use the first one
	if(style==null){stye=_styleMap[0];}
    return style;
}
function getIconFromRule(styleObj)
{
	var ico=null;
	for(var i=0;i<styleObj.icons.length;i++)
	{
		if(styleObj.icons[i].rule)
		{
			ico=styleObj.icons[i].icon;
			break;
		}
	}
	if(ico==null){ico=G_DEFAULT_ICON;}
	return ico;
}

function processMarkers(json){
    //remove the script tag
    jsRequest.removeScriptTag();
    //add an attributes property to GMarker
    GMarker.prototype.attributes = {}
    GMarker.prototype.markerClass = "";
	GMarker.prototype.trueLocation={};
	GMarker.prototype.isModified = false;
    //loop through GeoJSON object and create markers
    for (var i in json.features) {
        var coord = json.features[i].geometry.coordinates[0];
        //test for reasonable coordinates
		if(Math.abs(coord[0])>90 || Math.abs(coord[1])>180){
			//just skip this one if the coordinates are out of line
			continue;
		}
		var attrib = json.features[i].properties;     
        var mtitle = attrib.NAME;
		var style = getStyleFromAttributes(attrib);
		var m = new PdMarker(new GLatLng(coord[0],coord[1]),
								{title:mtitle,icon:style.icons[0].icon});
        m.attributes = attrib;
        m.markerClass = style.name;
		m.trueLocation=new GLatLng(coord[0],coord[1]);
		_map.addOverlay(m);
		}
	_markerMgmr.refresh();
	_markersComplete=true;
	toggle('waitBox');

}



function zoomLayerSwitch(old,cur)
{
	//test for zoom break threshold
	var oldBreakClass,newBreakClass;
	for(var i=0;i<_levelBreaks.length-1;i++)
	{
		if(old>=_levelBreaks[i] && old<_levelBreaks[i+1])oldBreakClass=i;
		if(cur>=_levelBreaks[i] && cur<_levelBreaks[i+1])newBreakClass=i;
	}
    
    if (oldBreakClass != newBreakClass) {
        //set correct icons
        var m = _map.getFirstMarker();
        while (m != null) {
            var ico = getIconFromRule(_styleMap[m.markerClass]);
            m.setIcon(ico);
            m.redraw();
            m = _map.getNextMarker();
        }
    }

	//restore the markers to thier original locations
	_markerMover.restorePositions();
	
	//auto switch map type
	if(cur>=15 && _map.getCurrentMapType()==G_PHYSICAL_MAP)
	{
		_map.setMapType(G_NORMAL_MAP);
	}
	else if (cur<15 && _autoSwitch && _map.getCurrentMapType()!=G_PHYSICAL_MAP)
	{
		_map.setMapType(G_PHYSICAL_MAP);
	}
}

function createInfoHtml(attrib){
    var idiv = document.getElementById("infoWindowWrapper");
	//find all the span elements
	var spans = idiv.getElementsByTagName("span");
	//loop through span elements and fill with correct info
	for(var i=0;i<spans.length;i++)
	{
		var elem=spans[i];
		switch(elem.className){
			case "infoTitle":
				elem.innerHTML=attrib.NAME;
				break;
			case "address":
				var addr = attrib.ADD1.replace(/^\s*|\s*$/,"");
				if (attrib.ADD2 != null) {
					var addr2 = attrib.ADD2.replace(/^\s*|\s*$/, "");
					addr=[addr,', ',addr2].join('');
				}
				var csz = [attrib.CITY,', ',attrib.STATE,' ',attrib.ZIP].join('');
				elem.innerHTML=[addr,csz].join('<br />');
				break;
			case "phone":
				elem.innerHTML=attrib.PHONE;
				break;
			case "fax":
				elem.innerHTML=attrib.FAX;
				break;
			case "hours":
				elem.innerHTML=attrib.HOURS;
				break;
			case "email":
				elem.innerHTML=['<a href="mailto:',attrib.EMAIL,'">',attrib.EMAIL,'</a>'].join('');
				break;
			case "website":
				elem.innerHTML=['<a href="http://',attrib.URL,'">',attrib.URL,'</a>'].join('');
				break;
			case "facility":
				elem.innerHTML=attrib.NOTES;
				break;
			case "eligibility":
				elem.innerHTML=attrib.ELIGIBILIT;
				break;
			case "intake":
				elem.innerHTML=attrib.INTAKE_PRO;
				break;
		}
	}
	return idiv.innerHTML;
}

function createTextLabel(coord,labelText)
{
//	var txt =  labelText.replace(/^\s*|\s*$/,"");
//	var label = new ELabel(new GLatLng(coord[0],coord[1]),labelText,"clinicLabel",new GSize(8,8),75,true);
//	_markerMgmr.addMarker(label,15);
}

function toggleRoutes()
{
if(_isRouteLayerOn)
{
	_map.removeOverlay(_rtaOverlay);
	_isRouteLayerOn=false;
}
else
{
	_map.addOverlay(_rtaOverlay);
	_isRouteLayerOn=true;
}
//force a refresh for IE
_rtaOverlay.redraw(true);
}

function displayDirections(){
	direct = "directions";
	if (
	!cookieTest("directions", true, 1)
	) {
		toggle(direct);
	}
}
