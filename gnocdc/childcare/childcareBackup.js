//attribute keys tell what attribute to base getIconFromAttributes function on for each radio button
var AttribKeys = {'location':'facility','capacity':'Size','class':'Class','headstart':'HS','evenings':'NightCare','infants':'Infants'};
/* above keys should map to:
 * 1. a style key in the StyleManager's styleMap object AND
 * 2. a value attribute of a radio button AND
 * 3. an id attribute of a DIV element
 * -----
 * above values of keys should map to the field name in the attributes of the datasource
 */

//create & add styles
 /*
  * The StyleManager for the Child Care application.
  * Most styles are defined in the styles array of the constructor.
  * HeadStart is defined above. Infants is defined and added below
  * to demonstrate another option for adding styles than directly in the 
  * constructor
  */
 StyleMgmr = new Gnocdc.StyleManager([new Gnocdc.Style({
    name: 'location',
    rules: [new Gnocdc.StyleRule({
        rule: true,
		iconSet:[{
        icon: BuildGIcon('Markers/Black16x16.png', 16, 16),
        minZoom: 14
    },{
        icon: BuildGIcon('Markers/Black8x8.png', 8, 8),
        maxZoom: 13
    }]
})]
}), new Gnocdc.Style({
    name: 'capacity',
    rules: [new Gnocdc.StyleRule({
        rule: 'Small',
		iconSet:[{icon: BuildGIcon('Markers/Capacity/Small16x16.png', 16, 16),
        minZoom: 14
    },{icon: BuildGIcon('Markers/Capacity/Small16x16.png', 8, 8),
        maxZoom: 13}]}), new Gnocdc.StyleRule({
        rule: 'Medium',
		iconSet:[{icon: BuildGIcon('Markers/Capacity/Medium16x16.png', 16, 16),
        minZoom: 14},{icon: BuildGIcon('Markers/Capacity/Medium16x16.png', 8, 8),
        maxZoom: 13}]
    }), new Gnocdc.StyleRule({
        rule: 'Large',
		iconSet:[{icon: BuildGIcon('Markers/Capacity/Large16x16.png', 16, 16),
        minZoom: 14},{icon: BuildGIcon('Markers/Capacity/Large16x16.png', 8, 8),
        maxZoom: 13}]
    }), new Gnocdc.StyleRule({
        rule: 'Extra large',
		iconSet:[{icon: BuildGIcon('Markers/Capacity/XLarge16x16.png', 16, 16),
        minZoom: 14},{icon: BuildGIcon('Markers/Capacity/XLarge16x16.png', 8, 8),
        maxZoom: 13}]
    })]
}),  new Gnocdc.Style({
    name: 'class',
    rules: [new Gnocdc.StyleRule({
        rule: 'A',
		iconSet:[{icon: BuildGIcon('Markers/Class/A.png', 16, 16),
        minZoom: 14
    },{icon: BuildGIcon('Markers/Class/A.png', 8, 8),
        maxZoom: 13}]}), new Gnocdc.StyleRule({
        rule: 'B',
		iconSet:[{icon: BuildGIcon('Markers/Class/B.png', 16, 16),
        minZoom: 14},{icon: BuildGIcon('Markers/Class/B.png', 8, 8),
        maxZoom: 13}]
    })]
}),  new Gnocdc.Style({
    name: 'headstart',
    rules: [new Gnocdc.StyleRule({
        rule: 'HeadStart',
		iconSet:[{icon: BuildGIcon('Markers/HeadStart/HeadStart16x16.png', 16, 16),
        minZoom: 14},{icon: BuildGIcon('Markers/HeadStart/HeadStart8x8.png', 8, 8),
        maxZoom: 13}]}), new Gnocdc.StyleRule({
        rule: 'EHS',
		iconSet:[{icon: BuildGIcon('Markers/HeadStart/EarlyHeadStart16x16.png', 16, 16),
        minZoom: 14},{icon: BuildGIcon('Markers/HeadStart/EarlyHeadStart8x8.png', 8, 8),
        maxZoom: 13}]
    }), new Gnocdc.StyleRule({
        rule: 'Combo',
		iconSet:[{icon: BuildGIcon('Markers/HeadStart/CombinedHeadStart16x16.png', 16, 16),
        minZoom: 14},{icon: BuildGIcon('Markers/HeadStart/CombinedHeadStart8x8.png', 8, 8),
        maxZoom: 13}]
    })],
  defaultIconSet:[{icon:BuildGIcon('Markers/Black8x8.png', 8, 8),
		maxZoom:13},{icon:BuildGIcon('Markers/Black16x16.png', 16, 16),
		minZoom:14}]	
}), new Gnocdc.Style({
    name: 'infants',
    rules: [new Gnocdc.StyleRule({
        rule: 'Yes',
		iconSet:[{icon: BuildGIcon('Markers/Infants/Infants16x16.png', 16, 16),
        minZoom: 14
    },{icon: BuildGIcon('Markers/Infants/Infant8x8.png', 8, 8),
        maxZoom: 13}]}), new Gnocdc.StyleRule({
        rule: 'No',
		iconSet:[{icon: BuildGIcon('Markers/Black16x16.png', 16, 16),
        minZoom: 14},{icon: BuildGIcon('Markers/Black8x8.png', 8, 8),
        maxZoom: 13}]
    })]
}), new Gnocdc.Style({
    name: 'evenings',
    rules: [new Gnocdc.StyleRule({
        rule: 'Yes',
		iconSet:[{icon: BuildGIcon('Markers/Evening/Evening16x16.png', 16, 16),
        minZoom: 14
    },{icon: BuildGIcon('Markers/Evening/Evening16x16.png', 8, 8),
        maxZoom: 13}]}), new Gnocdc.StyleRule({
        rule: 'No',
		iconSet:[{icon: BuildGIcon('Markers/Black16x16.png', 16, 16),
        minZoom: 14},{icon: BuildGIcon('Markers/Black8x8.png', 8, 8),
        maxZoom: 13}]
    })]
})], {
    /*default style for the markers in the application. The defaultIconSet is what is
	 *used and not any rule based icon sets, since it uses the defaults without looking at
	 *any rules in the defaultStyle
	 */
	defaultStyle: new Gnocdc.Style({
        name: 'default',
        defaultIconSet:[{icon: BuildGIcon('Markers/Black8x8.png', 8, 8),
            maxZoom: 13},{icon: BuildGIcon('Markers/Black16x16.png', 16, 16),
            minZoom: 14}] 
    })
});
