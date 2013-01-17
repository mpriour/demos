//attribute keys tell what attribute to base getIconFromAttributes function on for each radio button
var AttribKeys = {'location':'School','management':'TMgmt','enrollment':'tEnroll','gradelevel':'tGrades','freereduced':'tLunch','englishprof':'tEnglish'};
/* above keys should map to:
 * 1. a style key in the StyleManager's styleMap object AND
 * 2. a value attribute of a radio button AND
 * 3. an id attribute of a DIV element
 * -----
 * above values of keys should map to the field name in the attributes of the datasource
 */

//create & add styles
 /*
  * The StyleManager for the Schools application.
  * Most styles are defined in the styles array of the constructor.
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
}), 
	new Gnocdc.Style({
    name: 'management',
    rules: [
		new Gnocdc.StyleRule({
        rule: 'OPSBregchart',
		iconSet:[{icon: BuildGIcon('Markers/Management/OPSBCharter16x16.png', 16, 16),
        minZoom: 14},{icon: BuildGIcon('Markers/Management/OPSBCharter16x16.png', 8, 8),
        maxZoom: 13}]}),
		new Gnocdc.StyleRule({
        rule: 'RSDregchart',
		iconSet:[{icon: BuildGIcon('Markers/Management/RSDCharter16x16.png', 16, 16),
        minZoom: 14},{icon: BuildGIcon('Markers/Management/RSDCharter16x16.png', 8, 8),
        maxZoom: 13}]}),
		new Gnocdc.StyleRule({
        rule: 'RSDreg',
		iconSet:[{icon: BuildGIcon('Markers/Management/RSD16x16.png', 16, 16),
        minZoom: 14},{icon: BuildGIcon('Markers/Management/RSD16x16.png', 8, 8),
        maxZoom: 13}]}),
		new Gnocdc.StyleRule({
        rule: 'BESEchart',
		iconSet:[{icon: BuildGIcon('Markers/Management/BESE16x16.png', 16, 16),
        minZoom: 14},{icon: BuildGIcon('Markers/Management/BESE16x16.png', 8, 8),
        maxZoom: 13}]}),
		new Gnocdc.StyleRule({
        rule: 'OPSBreg',
		iconSet:[{icon: BuildGIcon('Markers/Management/OPSB16x16.png', 16, 16),
        minZoom: 14},{icon: BuildGIcon('Markers/Management/OPSB16x16.png', 8, 8),
        maxZoom: 13}]})
		]
}),
	new Gnocdc.Style({
    name: 'enrollment',
    rules: [new Gnocdc.StyleRule({
        rule: 'Small',
		iconSet:[{icon: BuildGIcon('Markers/Enrollment/1_16x16.png', 16, 16),
        minZoom: 14
    },{icon: BuildGIcon('Markers/Enrollment/1_16x16.png', 8, 8),
        maxZoom: 13}]}), new Gnocdc.StyleRule({
        rule: 'Medium',
		iconSet:[{icon: BuildGIcon('Markers/Enrollment/2_16x16.png', 16, 16),
        minZoom: 14},{icon: BuildGIcon('Markers/Enrollment/2_16x16.png', 8, 8),
        maxZoom: 13}]
    }), new Gnocdc.StyleRule({
        rule: 'Large',
		iconSet:[{icon: BuildGIcon('Markers/Enrollment/3_16x16.png', 16, 16),
        minZoom: 14},{icon: BuildGIcon('Markers/Enrollment/3_16x16.png', 8, 8),
        maxZoom: 13}]
    }),	new Gnocdc.StyleRule({
        rule: 'X large',
		iconSet:[{icon: BuildGIcon('Markers/Enrollment/4_16x16.png', 16, 16),
        minZoom: 14},{icon: BuildGIcon('Markers/Enrollment/4_16x16.png', 8, 8),
        maxZoom: 13}]
    })]
}),
	new Gnocdc.Style({
    name: 'gradelevel',
    rules: [new Gnocdc.StyleRule({
        rule: 'Elementary',
		iconSet:[{icon: BuildGIcon('Markers/GradeLevel/1_16x16.png', 16, 16),
        minZoom: 14
    },{icon: BuildGIcon('Markers/GradeLevel/1_16x16.png', 8, 8),
        maxZoom: 13}]}), new Gnocdc.StyleRule({
        rule: 'Middle',
		iconSet:[{icon: BuildGIcon('Markers/GradeLevel/2_16x16.png', 16, 16),
        minZoom: 14},{icon: BuildGIcon('Markers/GradeLevel/2_16x16.png', 8, 8),
        maxZoom: 13}]
    }), new Gnocdc.StyleRule({
        rule: 'High',
		iconSet:[{icon: BuildGIcon('Markers/GradeLevel/3_16x16.png', 16, 16),
        minZoom: 14},{icon: BuildGIcon('Markers/GradeLevel/3_16x16.png', 8, 8),
        maxZoom: 13}]
    }),	new Gnocdc.StyleRule({
        rule: 'Combo',
		iconSet:[{icon: BuildGIcon('Markers/GradeLevel/4_16x16.png', 16, 16),
        minZoom: 14},{icon: BuildGIcon('Markers/GradeLevel/4_16x16.png', 8, 8),
        maxZoom: 13}]
    })]
}),
	new Gnocdc.Style({
    name: 'freereduced',
    rules: [new Gnocdc.StyleRule({
        rule: 'Low',
		iconSet:[{icon: BuildGIcon('Markers/Lunch/1_16x16.png', 16, 16),
        minZoom: 14
    },{icon: BuildGIcon('Markers/Lunch/1_16x16.png', 8, 8),
        maxZoom: 13}]}), new Gnocdc.StyleRule({
        rule: 'Medium',
		iconSet:[{icon: BuildGIcon('Markers/Lunch/2_16x16.png', 16, 16),
        minZoom: 14},{icon: BuildGIcon('Markers/Lunch/2_16x16.png', 8, 8),
        maxZoom: 13}]
    }), new Gnocdc.StyleRule({
        rule: 'High',
		iconSet:[{icon: BuildGIcon('Markers/Lunch/3_16x16.png', 16, 16),
        minZoom: 14},{icon: BuildGIcon('Markers/Lunch/3_16x16.png', 8, 8),
        maxZoom: 13}]
    })]
}),
	new Gnocdc.Style({
    name: 'englishprof',
    rules: [new Gnocdc.StyleRule({
        rule: 'Low',
		iconSet:[{icon: BuildGIcon('Markers/EnglishProf/1_16x16.png', 16, 16),
        minZoom: 14
    },{icon: BuildGIcon('Markers/EnglishProf/1_16x16.png', 8, 8),
        maxZoom: 13}]}), new Gnocdc.StyleRule({
        rule: 'Medium',
		iconSet:[{icon: BuildGIcon('Markers/EnglishProf/2_16x16.png', 16, 16),
        minZoom: 14},{icon: BuildGIcon('Markers/EnglishProf/2_16x16.png', 8, 8),
        maxZoom: 13}]
    }), new Gnocdc.StyleRule({
        rule: 'High',
		iconSet:[{icon: BuildGIcon('Markers/EnglishProf/3_16x16.png', 16, 16),
        minZoom: 14},{icon: BuildGIcon('Markers/EnglishProf/3_16x16.png', 8, 8),
        maxZoom: 13}]
    })]
})],
	 {
    /*default style for the markers in the application. The defaultIconSet is what is
	 *used and not any rule based icon sets, since it uses the defaults without looking at
	 *any rules in the defaultStyle
	 */
	defaultStyle: new Gnocdc.Style({
        name: 'default',
        defaultIconSet:[{icon: BuildGIcon('../Markers/Black8x8.png', 8, 8),
            maxZoom: 13},{icon: BuildGIcon('../Markers/Black16x16.png', 16, 16),
            minZoom: 14}] 
    })
});