/*
Globals
*/
var YuiLoader, NavTabs, MyMap, OverviewMap, MapTypeControl, MapActionPanel; 
var YuiOverridePath, GeoJsonPath, MarkerLabelField;
var StyleMgmr, InitialStyleId, MarkerLoadComplete = false; 
var MarkerMgmr,MarkerExploder,ExploderOpts;
var AutoSwitchTypes = false, DynamicMarkerMap = false;
var IntialMapView={}, NavToCenters={}, AttribKeys={};
var mapId = 'map';

/**basic style manager which holds only the default style class with the
 * G_Default_Marker marker 
 */
StyleMgmr = new Gnocdc.StyleManager();

/*
Intialization Functions
*/
/**
 * YUILoader dynamically loads YUI library components into the page in the most
 * compact way possible.
 * Loads via the YuiLoader.insert method
 * Executes InitLayout upon successfully loading components
 */
YuiLoader = new YAHOO.util.YUILoader({
    require: ["reset-fonts-grids","utilities", "container", "button", "menu", "tabview"],
    loadOptional: true,
    allowRollup: true,
    timeout: 10000,
    combine: true,
    onSuccess: function(){
        YAHOO.util.Event.onDOMReady(PageLoad);
    }
});


/**
 * @method InitLayout This function gets the YUI reset-fonts-grids style overrides,
 * 		builds the Nav Tabs if any are indicated, fires the resizeLayout function, and
 * 		finally fires the LoadMap function
 * @param {string} cssOverridePath The path to the CSS file which we will load after the
 * 		YUI library CSS foundation has loaded. Must to it this way to change any of the
 * 		styles specified in the reset-fonts-grids foundation. 
 */
function InitLayout(cssOverridePath){
	Dom = YAHOO.util.Dom, Event = YAHOO.util.Event;
	//add our styles. we have to this here because they override
	//several styles included in YUI's CSS foundation
	YAHOO.util.Get.css('../common/styles/yui-overrides.css');
	Event.on(window, 'resize', ResizeLayout);
	NavTabs = new YAHOO.widget.TabView("navTabs");
	NavTabs.on('activeTabChange',HandleNavTabChange);
	MapActionPanel = new YAHOO.widget.Overlay("mapActions");
	MapActionPanel.render();
	ResizeLayout();
	
}
/**
 * Creates the map with specified options & zooms it to the intialView
 * @param {Object} intialView the intial view that the map will start at
 * @param {Object} options
 * 	valid options are:
 *  skipControls {Boolean} skip loading the normal control sets
 *  markerMgmrOpts {Object} options to instantiate the marker manager with.
 *  	if not defined then the marker manager will not be created
 *  exploderOpts {Object} options to instantiate the marker exploder with.
 *  	if not defined then the marker exploder will not be created
 */
function LoadMap(intialView,options){
	MyMap = new GMap2(document.getElementById(mapId), {
        mapTypes: [G_PHYSICAL_MAP, G_NORMAL_MAP, G_SATELLITE_MAP, G_HYBRID_MAP]
    });
	SetIntialMap(MyMap,intialView);
	MyMap.enableScrollWheelZoom();
	OverviewMap = new GOverviewMapControl(new GSize(150, 150));
	options = options || {}
	var skipControls = options.skipControls
	var useMgmr = (options.markerMgmrOpts) ? true : false;
	var useExploder = (options.exploderOpts) ? true : false;
	//attach marker manager and/or marker exploder
	if(useMgmr) MarkerMgmr = new MarkerManager(MyMap,options.markerMgmrOpts)
	if(useExploder) MarkerExploder = new Gnocdc.MarkerExplode(MyMap,options.exploderOpts)
	//add several event listners and such if we have a marker map
	if(DynamicMarkerMap){
		AddDynMapEventListeners(MyMap);
		StyleMgmr.setMap(MyMap);
		GMarkerHelper.attach(MyMap);
	}
	//add controls
	if (skipControls) {
		MyMap.addControl(OverviewMap);
	}
	else {
		MapTypeControl = new GHierarchicalMapTypeControl();
		AddCommonControls(MyMap, [OverviewMap, MapTypeControl]);
	}
	//hack to get all things resized correctly
	//MyMap.setMapType(G_SATELLITE_MAP);
	OverviewMap.hide(true);
	//restore intial map type, do resize, show overview map again after a 1/3 sec wait.
	setTimeout(ContinueMapLayout2,300);
	
}

function ContinueMapLayout1(){
	var startType = FindMapType(MyMap,IntialMapView.type)
	if (startType) {
		MyMap.setMapType(startType);
	}
	setTimeout(ContinueMapLayout2,400);
}
function ContinueMapLayout2(){
	ResizeLayout();
	OverviewMap.show();
}

function ResizeLayout(){
	var windowHeight = Dom.getViewportHeight();
	Dom.setStyle('doc3','height',windowHeight+'px');
	var sidebarHeight = windowHeight - Dom.get('hd').offsetHeight - Dom.get('ft').offsetHeight;
	Dom.setStyle('sidebar','height',sidebarHeight+'px');
	var mapHeight = sidebarHeight - Dom.get('map-hdr').offsetHeight - Dom.get('map-ftr').offsetHeight;
	Dom.setStyle(mapId,'height',mapHeight+'px');
	Dom.setStyle('mapActions','top',Dom.get('hd').offsetHeight + 'px');
	Dom.setStyle('mapActions','right','0px');
}

function AddCommonControls(map,existingControls){
    if (existingControls) {
		if (!(existingControls instanceof Array)) {
			existingControls = [existingControls];
		}
		for (var i = 0; i < existingControls.length; i++) {
			map.addControl(existingControls[i]);
		}
	} 
	map.addControl(new GLargeMapControl());
    map.addControl(new GScaleControl());
}
/**
 * Loads GeoJSON formated markers from a url and processes them through the specified callback. 
 * Uses the dynamic script tag technique. Uses YUI Get utility for JSON loading. 
 * Purges script nodes upon successful loading.
 * @param {String} url
 * @param {Function} callback
 */
function LoadJsonMarkers(url, callback){
    var request;
    (callback) ? request = url+"&callback="+callback : request = url;
    YAHOO.util.Get.script(request,{onSuccess:function(o){o.purge()}});
}
/**
 * Function creates a GIcon object. Anchor for both icon & info window is at center of icon
 * @param {String} iconPath Relative or absolute path to the image for the icon
 * @param {Int} iconWidth Width of the icon in pixels
 * @param {Int} iconHeight Height of the icon in pixels
 * @param {String} printIconPath Relative or absolute path to the printable image for the icon. Must be a *.gif
 * @return (GIcon) a GIcon object
 */
function BuildGIcon(iconPath, iconWidth, iconHeight, printIconPath){
    var icon = new GIcon(null, iconPath);
    icon.iconSize = new GSize(iconWidth, iconHeight);
    icon.iconAnchor = new GPoint(iconWidth / 2, iconHeight / 2);
    icon.infoWindowAnchor = new GPoint(iconWidth / 2, iconHeight / 2);
    icon.printImage = printIconPath;
    icon.mozPrintImage = printIconPath;
    return icon;
}

/*switches to the GMap Street Map from the Topo Map
 * when you get to a higher zoom level than the topo map
 * supports
 */
function ZoomLayerSwitch(old,cur)
{	
	//auto switch map type
	//switch to satellite map on zoom in
	if(cur>=18 && (MyMap.getCurrentMapType()!= G_HYBRID_MAP || MyMap.getCurrentMapType() != G_SATELLITE_MAP)){
		MyMap.setMapType(G_HYBRID_MAP);
		AutoSwitchTypes = true;		
	}
	//switch back to street map on zoom out
	else if(AutoSwitchTypes && cur<18 && cur>=15 && MyMap.getCurrentMapType() != G_NORMAL_MAP){
		MyMap.setMapType(G_NORMAL_MAP);
		AutoSwitchTypes = true;
	}
	//switch to street map on zoom in
	else if (cur >= 15 && MyMap.getCurrentMapType() == G_PHYSICAL_MAP) 
	{
		MyMap.setMapType(G_NORMAL_MAP);
		AutoSwitchTypes = true;
	}
	//switch back to terrain map on zoom out
	else if (AutoSwitchTypes && cur < 15 && MyMap.getCurrentMapType() != G_PHYSICAL_MAP) 
	{
		MyMap.setMapType(G_PHYSICAL_MAP);
		AutoSwitchTypes = true;
	}
}


function GetDateString(date){
	if(!date || !YAHOO.lang.isDate(date)){
		date = new Date();
	}
	return YAHOO.util.Date.format(date,{format:'%D'},'en-US');
}

function GetChooserStyleId(chooserNameAttrib){
	var chooserName = chooserNameAttrib || 'chooser';
	//get an array of radio buttons whose name attribute is set to "chooser"
	var selectedInput = Dom.getElementsBy(
		function(el){return(el.name==chooserName && el.checked)},'input');
	return selectedInput[0].value;
}

function AddStyledMarkers(json){
	styleId = InitialStyleId || 'default';
	var intialStyle = StyleMgmr.styleMap[styleId];
    //loop through GeoJSON object and create markers
    for (var i in json.features) {
        var coord;
		if (json.features[i].geometry) {
			if(coord = json.features[i].geometry.coordinates.length==1){
				//multi point array of points, take 1st point
				coord = json.features[i].geometry.coordinates[0];
			}
			else{
				coord = json.features[i].geometry.coordinates;
			}
			
		}
		else if(json.features[i].properties.Latitude && json.features[i].properties.Longitude){
			var props = json.features[i].properties;
			coord = [props.Longitude,props.Latitude];
		}
		else{
			continue;
		}
        //test for reasonable coordinates
		if(Math.abs(coord[0])>180 || Math.abs(coord[1])>90){
			//just skip this one if the coordinates are out of line
			continue;
		}
		var attrib = json.features[i].properties;     
        var mtitle = (MarkerLabelField)? attrib[MarkerLabelField] : '';
		var m = new GMarker(new GLatLng(coord[1],coord[0]),
								{title:mtitle,
								icon:intialStyle.getIconFromAttributes(attrib, AttribKeys[styleId])
								});
        m.attributes = attrib;
        m.style = intialStyle.name;
		m.trueLocation=new GLatLng(coord[1],coord[0]);
		MyMap.addOverlay(m);
		}
	MarkerLoadComplete=true;
	if(MarkerExploder)MarkerExploder.explodeMarkers();
	}

function SetIntialMap(map,intialView){
	intialView = intialView || {};
	var qstring;
	qstring = window.location.search;
	if(qstring && qstring.length>0){
		intialView = UsePermalink(map,intialView);
	}
	var startMapType = FindMapType(map,intialView.type) || G_PHYSICAL_MAP;
	map.setCenter(new GLatLng(intialView.lat, intialView.lon), intialView.zoom, startMapType);
}

function FindMapType(map,type){
	var mapType;
	if (YAHOO.lang.isObject(type)) {
		mapType = type;
	}
	else if (YAHOO.lang.isString(type)) {
			//find the actual map type with the name
			mapTypes = map.getMapTypes();
			for (var i in mapTypes) {
				if (mapTypes[i].getName(true) == type || mapTypes[i].getName(true) == type.split('_')[0]) {
					mapType = mapTypes[i];
				}
			}
	}
	return mapType;
}
//TODO:Formalize the settings hash into an object with a type name to map type helper function
/**
 * Parse & use the settings in the permalink to control the map
 * @param {GMap2} map
 * @param {Object} defaults - Settings for the map
 */
function UsePermalink(map, defaults){
    //permalink present, parse & use
    var maptype;
    var settings = ParsePermalink();
    if (settings.lat == 0) {
        settings.lat = defaults.lat;
    }
    if (settings.lon == 0) {
        settings.lon = defaults.lon;
    }
    if (settings.type == '') {
        settings.type = defaults.type;
    }
    if (settings.zoom == 0) {
        settings.zoom = defaults.zoom;
    }
    settings.type = FindMapType(map,settings.type);
	return settings;
}

//create a link that gives zoom level, center, and active map type
function CreateLinkParams(map){
    var center, zoom, type, heading, subheading, pstring='';
    center = map.getCenter();
    zoom = map.getZoom();
    type = map.getCurrentMapType();
    headingEl = Dom.getElementsByClassName('heading', null , 'hd');
	heading = (headingEl && headingEl.length>0)? headingEl[0].innerHTML : '';
    subheadingEl = Dom.getElementsByClassName('subheading', null , 'hd');
	subheading = (subheadingEl && subheadingEl[0].length>0)? subheadingEl[0].innerHTML : '';
    /*create permalink parameters in the form of:
     ?ll=<lat>,<lon>&t=<type>&z=<zoom>&tl=<title>&st=<subtitle>
     */
    pstring =["?ll=",center.toUrlValue(4),
			"&t=",type.getName(true),
			"&z=",zoom,
			"&tl=",encodeURIComponent(heading),
			"&st=",encodeURIComponent(subheading)].join('');
    return pstring;
}

//parse permalink string and return paramValues
function ParsePermalink(){
    var params, paramValues, parray;
    paramValues = {
        lat: 0,
        lon: 0,
        type: '',
        zoom: 0,
        title: '',
        subtitle: ''
    };
    params = window.location.search;
    if (params.length > 0) {
        parray = params.replace(/\?/, '').split('&');
        for (var i in parray) {
            var key = parray[i].split('=');
            if (key.length > 1) {
                var value = key[1];
                key = key[0];
                
                switch (key) {
                    case "ll":
                        var ll = value.split(',');
                        paramValues.lat = parseFloat(ll[0]);
                        paramValues.lon = parseFloat(ll[1]);
                        break;
                    case "t":
                        paramValues.type = value;
                        break;
                    case "z":
                        paramValues.zoom = parseInt(value);
                        break;
                    case "tl":
                        paramValues.title = decodeURIComponent(value);
                        break;
                    case "st":
                        paramValues.subtitle = decodeURIComponent(value);
                        break;
                }
            }
        }
    }
    return paramValues;
}


//create actual permalink url string
function CreatePermalink(map){
    var url, params, port;
    (window.location.port != "") ? port = ":" + window.location.port : port = '';
    url =[window.location.protocol,"//",window.location.hostname,port,window.location.pathname] .join('');
    params = CreateLinkParams(map);
    url = url + params;
    return url;
}

//display a text box with the permalink and some instructions
function CreateMapLink(map){
    document.getElementById("linkWindow").style.display = "block";
    var box = document.getElementById("linkContent");
    box.style.display = "block";
    var tb = box.getElementsByTagName("input")[0];
    tb.value = CreatePermalink(map).split('&tl')[0];
}


//create new email message with permalink
function SendMapLink(map){
    var uri = CreatePermalink(map).split('&tl')[0];
    var str = uri.replace(/\&/g, '%26');
    var newwin = window.open("mailto:?body=" + str);
    if (newwin && newwin.open && !newwin.closed) 
        newwin.close();
}

//open print window with map, attribuitions, & dates
function PrintMap(map){
    var printPage = "print.html";
    var qs = CreatePermalink(map).split('?')[1];
    var uri = printPage + '?' + qs;
    MM_openBrWindow(uri, '', 'toolbar=yes,menubar=yes,scrollbars=yes,resizable=yes,width=700,height=700');
}

//close the permalink window & empty out the text box
function CloseWindow(){
    document.getElementById("linkWindow").style.display = "none";
    var box = document.getElementById("linkContent");
    box.style.display = "none";
    var tb = box.getElementsByTagName("input")[0];
    tb.value = '';
}

/**
 * Test if a cookie with name of cookieName is present.
 * Optionally,can also create a cookie with an expiration of specified days if no such cookie exisits.
 * @param {String} cookieName
 * @param {Bool} createCookie Specifies if you want to create a cookie if one is not found
 * @param {Int} cookieDays number of days before cookie expires.
 * @return {Bool} Returns true if cookie was found or created, false otherwise
 */
function CookieTest(cookieName, createCookie, cookieDays){
	var result=false;
	//test for cookie, set one if one is not present
    if (document.cookie.length > 0) //true if we have any cookies
    {
        var cStart = document.cookie.indexOf(cookieName);
        if (cStart > -1) //we have the cookie
        {
            result=true;
        }
        else //we have cookies but not the specified cookie
        {
            if (createCookie) {
				SetCookie(cookieName,"true",cookieDays);
				result=true;
			}
        }
    }
    else //there are no cookies at all
    {
            if (createCookie) {
				SetCookie(cookieName,"true",cookieDays);
				result=true;
			}
    }
	return result;
}

function SetCookie(name,value,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

function PageUnload(){
    SetCookie('warned', 0);
    GUnload();
}

function MM_openBrWindow(theURL, winName, features){ //v2.0
    window.open(theURL, winName, features);
}

 /** Takes the innerHTML of 'infoWindowWrapper' as a template string.
 * Use the YUI substitute function to replace data identifier keys
 * in the template string with actual data values.
 * in-line function takes key (k), value (v), and metadata (m) as
 * parameters. It converts values of 1 & 0 to Yes & No. It also converts
 * null or undefined values to a blank string. It applies these conversions
 * to all keys and values. But you could add a key test in it to only
 * apply it to specific attributes. The undefined/null portion
 * should remain as a global convertor, otherwise you will get the
 * ugly data identifier key as a string (ex. {FACIL_NAM} ) rather than 
 * a blank string.
 */ 
function CreateInfoHtml(attrib){
	var infoWin = Dom.get('infoWindowWrapper');
	var infoWinHtml = YAHOO.lang.substitute(infoWin.innerHTML,attrib,function(k, v, m){
		var newV=v;
		if (v===1) {
			newV = 'Yes'
		}
		else if (v===0) {
			newV = 'No'
		}
		else if (typeof(v)=='undefined' || v == null||v==' '){
			newV=' '
		}
		return newV
	})
	return infoWinHtml;
}
//called with map scope
function HandleNavTabChange(e){
	var activeTab = e.newValue;
	var tabId = activeTab.get('id');
	var newView = NavToCenters[tabId];
	//change map view
	MyMap.setCenter(new GLatLng(newView.lat,newView.lon),newView.zoom);
	//change title
	var dispName = activeTab.getAttributeConfig('label').value;
	dispName = dispName.replace(' Parish','');
	document.getElementById('parishTitle').innerHTML=dispName;
}
