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
		this.markers.sort(orderMarkersSnWe);
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
