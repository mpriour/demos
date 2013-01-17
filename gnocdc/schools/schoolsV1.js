//attribute keys tell what attribute to base getIconFromAttributes function on for each radio button
var AttribKeys = {'location':'FACILITY_N','district':'SCHOOL_DIS','management':'MANAGEMENT','charterauthority':'CHARTER_AU','enrollment':'ENROLLMENT','gradelevel':'GRADE_LEVE','freereduced':'FREE_REDUC','englishprof':'LIMITED_EN'};
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
}), new Gnocdc.Style({
    name: 'district',
    rules: [
		new Gnocdc.StyleRule({
        rule: 'RSD', //Simple string matching since nothing else will contain all of it
		iconSet:[{
        icon: BuildGIcon('Markers/District/RSD16x16.png', 16, 16),
        minZoom: 14},{icon: BuildGIcon('Markers/District/RSD16x16.png', 8, 8),
        maxZoom: 13}]
    }),
	new Gnocdc.StyleRule({
        rule: 'OPSB', //Simple string matching since nothing else will contain all of it
		iconSet:[{
        icon: BuildGIcon('Markers/District/OPSB16x16.png', 16, 16),
        minZoom: 14},{icon: BuildGIcon('Markers/District/OPSB16x16.png', 8, 8),
        maxZoom: 13}]
    }),
	new Gnocdc.StyleRule({
        rule: 'BESE', //Simple string matching since nothing else will contain all of it
		iconSet:[{
        icon: BuildGIcon('Markers/District/BESE16x16.png', 16, 16),
        minZoom: 14},{icon: BuildGIcon('Markers/District/BESE16x16.png', 8, 8),
        maxZoom: 13}]
    })
	]
}),
	new Gnocdc.Style({
    name: 'management',
    rules: [
		new Gnocdc.StyleRule({
        rule: 'RSD-normal',
		iconSet:[{icon: BuildGIcon('Markers/Management/RSD16x16.png', 16, 16),
        minZoom: 14},{icon: BuildGIcon('Markers/Management/RSD16x16.png', 8, 8),
        maxZoom: 13}]}),
		new Gnocdc.StyleRule({
        rule: 'BESE-Charter',
		iconSet:[{icon: BuildGIcon('Markers/Management/BESE16x16.png', 16, 16),
        minZoom: 14},{icon: BuildGIcon('Markers/Management/BESE16x16.png', 8, 8),
        maxZoom: 13}]}),
		new Gnocdc.StyleRule({
        rule: 'OPSB-normal',
		iconSet:[{icon: BuildGIcon('Markers/Management/OPSB16x16.png', 16, 16),
        minZoom: 14},{icon: BuildGIcon('Markers/Management/OPSB16x16.png', 8, 8),
        maxZoom: 13}]}), 
		new Gnocdc.StyleRule({
        rule: 'OPSB-Charter',
		iconSet:[{icon: BuildGIcon('Markers/Management/OPSBCharter16x16.png', 16, 16),
        minZoom: 14},{icon: BuildGIcon('Markers/Management/OPSBCharter16x16.png', 8, 8),
        maxZoom: 13}]}),
		new Gnocdc.StyleRule({
        rule: 'RSD-Charter',
		iconSet:[{icon: BuildGIcon('Markers/Management/RSDCharter16x16.png', 16, 16),
        minZoom: 14},{icon: BuildGIcon('Markers/Management/RSDCharter16x16.png', 8, 8),
        maxZoom: 13}]})
		]
}),
	new Gnocdc.Style({
    name: 'enrollment',
    rules: [new Gnocdc.StyleRule({
        rule: 1,
		iconSet:[{icon: BuildGIcon('Markers/Enrollment/1_16x16.png', 16, 16),
        minZoom: 14
    },{icon: BuildGIcon('Markers/Enrollment/1_16x16.png', 8, 8),
        maxZoom: 13}]}), new Gnocdc.StyleRule({
        rule: 2,
		iconSet:[{icon: BuildGIcon('Markers/Enrollment/2_16x16.png', 16, 16),
        minZoom: 14},{icon: BuildGIcon('Markers/Enrollment/2_16x16.png', 8, 8),
        maxZoom: 13}]
    }), new Gnocdc.StyleRule({
        rule: 3,
		iconSet:[{icon: BuildGIcon('Markers/Enrollment/3_16x16.png', 16, 16),
        minZoom: 14},{icon: BuildGIcon('Markers/Enrollment/3_16x16.png', 8, 8),
        maxZoom: 13}]
    }),	new Gnocdc.StyleRule({
        rule: 4,
		iconSet:[{icon: BuildGIcon('Markers/Enrollment/4_16x16.png', 16, 16),
        minZoom: 14},{icon: BuildGIcon('Markers/Enrollment/4_16x16.png', 8, 8),
        maxZoom: 13}]
    })]
}),
	new Gnocdc.Style({
    name: 'gradelevel',
    rules: [new Gnocdc.StyleRule({
        rule: 1,
		iconSet:[{icon: BuildGIcon('Markers/GradeLevel/1_16x16.png', 16, 16),
        minZoom: 14
    },{icon: BuildGIcon('Markers/GradeLevel/1_16x16.png', 8, 8),
        maxZoom: 13}]}), new Gnocdc.StyleRule({
        rule: 2,
		iconSet:[{icon: BuildGIcon('Markers/GradeLevel/2_16x16.png', 16, 16),
        minZoom: 14},{icon: BuildGIcon('Markers/GradeLevel/2_16x16.png', 8, 8),
        maxZoom: 13}]
    }), new Gnocdc.StyleRule({
        rule: 3,
		iconSet:[{icon: BuildGIcon('Markers/GradeLevel/3_16x16.png', 16, 16),
        minZoom: 14},{icon: BuildGIcon('Markers/GradeLevel/3_16x16.png', 8, 8),
        maxZoom: 13}]
    }),	new Gnocdc.StyleRule({
        rule: 4,
		iconSet:[{icon: BuildGIcon('Markers/GradeLevel/4_16x16.png', 16, 16),
        minZoom: 14},{icon: BuildGIcon('Markers/GradeLevel/4_16x16.png', 8, 8),
        maxZoom: 13}]
    })]
}),
	new Gnocdc.Style({
    name: 'freereduced',
    rules: [new Gnocdc.StyleRule({
        rule: 1,
		iconSet:[{icon: BuildGIcon('Markers/Lunch/1_16x16.png', 16, 16),
        minZoom: 14
    },{icon: BuildGIcon('Markers/Lunch/1_16x16.png', 8, 8),
        maxZoom: 13}]}), new Gnocdc.StyleRule({
        rule: 2,
		iconSet:[{icon: BuildGIcon('Markers/Lunch/2_16x16.png', 16, 16),
        minZoom: 14},{icon: BuildGIcon('Markers/Lunch/2_16x16.png', 8, 8),
        maxZoom: 13}]
    }), new Gnocdc.StyleRule({
        rule: 3,
		iconSet:[{icon: BuildGIcon('Markers/Lunch/3_16x16.png', 16, 16),
        minZoom: 14},{icon: BuildGIcon('Markers/Lunch/3_16x16.png', 8, 8),
        maxZoom: 13}]
    })]
}),
	new Gnocdc.Style({
    name: 'englishprof',
    rules: [new Gnocdc.StyleRule({
        rule: 1,
		iconSet:[{icon: BuildGIcon('Markers/EnglishProf/1_16x16.png', 16, 16),
        minZoom: 14
    },{icon: BuildGIcon('Markers/EnglishProf/1_16x16.png', 8, 8),
        maxZoom: 13}]}), new Gnocdc.StyleRule({
        rule: 2,
		iconSet:[{icon: BuildGIcon('Markers/EnglishProf/2_16x16.png', 16, 16),
        minZoom: 14},{icon: BuildGIcon('Markers/EnglishProf/2_16x16.png', 8, 8),
        maxZoom: 13}]
    }), new Gnocdc.StyleRule({
        rule: 3,
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