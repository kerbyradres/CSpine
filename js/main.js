/*global document, $, console */
/*jshint globalstrict: true*/
/* enable strict mode */
"use strict";

var buttons = {
		l: ['c0','c1','c2','c3','c4','c5','c6','c7'],
		u: ['A','B','C'],
		s: ['A0','A1','A2','A3','A4','B1','B2','B3','C','F1','F2','F3','BL'],
	},
	cspine = {
		levels: buttons.l,
		types: ['u','s'],
        data:{c0:{},c1:{},c2:{},c3:{},c4:{},c5:{},c6:{},c7:{}}},
	text = {
		A: 'Occipital condyle and occipital cervical joint complex injury, Type A. Isolated bony injury of the occipital condyle, without significant ligamentous injury at ~~~',
		B: 'Occipital condyle and occipital cervical joint complex injury, Type B. Ligamentous injury without complete separation of anatomic integrity at ~~~',
		C: 'Occipital condyle and occipital cervical joint complex injury, Type C. Translation injury with separation of anatomic integrity at ~~~',
		A0: 'There is a distraction injury of ~~~',
		A1: 'There is a translation/rotation injury of ~~~',
		A2: 'The disco-ligamentous complex (DLC) at !!! is intact. ',
		A3: 'The disco-ligamentous complex (DLC) at !!! is indeterminate. ',
		A4: 'The disco-ligamentous complex (DLC) at !!! is disrupted. ',
		B1: 'Normal neurologic function. ',
		B2: 'Root injury. ',
		B3: 'Complete cord injury. ',
		C: 'Incomplete cord injury. ',
		F1: 'Continuous cord compression. ',
        F2: 'Continuous cord compression. ',
        F3: 'Continuous cord compression. ',
        BL: 'Continuous cord compression. ',
	},
	hints = {};


$(document).ready(function() {

// main report generation, occurs on every button click
cspine.update = function() {
	var i = 0, j;
	// regenerate report
  cspine.report = {c0: '',c1: '',c2: '',c3: '',c4: '',c5: '',c6: '',c7: ''};

	// quit if no level is selected
	if (!$('#divLevel button.active').attr('id')) return false;

	// save data for current level
	cspine.getData();

	// for each level
	for (i = 0; i < cspine.levels.length; i++) {
		var	Upper = cspine.data[cspine.levels[i]].u,
			Subaxial = cspine.data[cspine.levels[i]].s,;

		// add a sentence for each selection
		cspine.report[cspine.levels[i]] =
			(text[cspine.data[cspine.levels[i]].u] || '') +
			(text[cspine.data[cspine.levels[i]].s] || '');

		
		}
	}

	cspine.fixReport();
	$('#textareaReport').html(cspine.reportHTML);
};

// get clicked state of each pathology
cspine.getData = function() {
	var level = $('#divLevel button.active').attr('id');

	if (!level) return false;

	cspine.data[level].u = $('#divUpper button.active').attr('id') || '';
	cspine.data[level].s = $('#divSubaxial button.active').attr('id') || '';
};

// turn the report data into words
cspine.fixReport = function() {
	var i;
	cspine.reportHTML = '';

	for (i = 0; i < cspine.levels.length; i++) {
		// add spinal levels
		cspine.report[cspine.levels[i]] = cspine.report[cspine.levels[i]]
			.replace(/(.*? )~~~/, '$1the C' + (i+2) + ' vertebral body. ')
			.replace(/(.*? )!!!/, '$1C' + (i+2) + '-C' + (i+3))
			.replace(/C8/, 'T1')
			.replace(/\. Continuous/,' with continuous');
	}

	// join each level's text into a single HTML snippet
	for (i = 0; i < cspine.levels.length; i++) {
		cspine.reportHTML += cspine.report[cspine.levels[i]] + '<br>';
	}

	// trim excess newlines from unused levels
	cspine.reportHTML = cspine.reportHTML
		.replace(/(<br>)+/g, '<br>')
		.replace(/^<br>/, '');

	if (cspine.reportHTML === '<br>' || cspine.reportHTML === '') {
		cspine.reportHTML = 'No cervical spine injury.';
	}
};

// clear all buttons in the desired line
cspine.clearLine = function(line) {
	var i;
	for (i = 0; i < buttons[line].length; i++) {
		$('#' + buttons[line][i]).removeClass('active');
	}
};

// restore clicked buttons
cspine.loadLevel = function(level) {
	var i, cdl = cspine.data[level];

	for (i = 0; i < cspine.types.length; i++) {
		cspine.clearLine(cspine.types[i]);
		if (cdl[cspine.types[i]]) {
			$('#' + cdl[cspine.types[i]]).addClass('active').siblings().removeClass('active');
		}
	}
};

// [boolean] is there at least 1 finding at the queried level?
cspine.LevelPos = function(level) {
	var cdl = cspine.data[level];
	if (cdl.m || cdl.d || cdl.n) {
		return true;
	} else {
		return false;
	}
};

// manually replicating bootstrap functionality to avoid race condition
$('button').click(function() {
	// 'unclick' a button / toggle 'checked' status
	if (this.id[0] !== 'c' && $(this).hasClass('active')) {
		// remove CSS
		$(this).removeClass('active').blur();
		// remove from stored data
		cspine.data[$('#divLevel button.active').attr('id')][this.id[0]] = '';
		cspine.update();
		return;
	}

	// update CSS
	$(this).addClass('active').blur()
		.siblings().removeClass('active');

	// if level button is clicked
	if (this.id[0] === 'c') {
		// load saved data for the level
		cspine.loadLevel(this.id);

		// update CSS
		$(this).addClass('curLevel')
			.siblings().removeClass('curLevel');

		// custom CSS if data is stored at other levels
		$(this).siblings().each(function() {
			$(this).toggleClass('levelPos', cspine.LevelPos(this.id));
		});
	}

	cspine.update();
});

// show popovers on hover
$('button[type="radio"]').hover(function() {
	if ($('#cbHints').is(':checked')) {
		$(this).popover('show');
	} else {
		return;
	}
}, function() {
	$(this).popover('hide');
});

$('#btnSelectAll').click(function() {
	document.getElementById('textareaReport').focus();
	document.execCommand('SelectAll');
});

cspine.reset = function() {
	cspine.data = {c0:{},c1:{},c2:{},c3:{},c4:{},c5:{},c6:{},c7:{}};
	$('button').removeClass('active levelPos curLevel').blur();
	$('#c0').addClass('curLevel active');
	cspine.update();
};

$('#btnReset').click(cspine.reset);

// initialize hints popovers
cspine.initHints = function() {
	var i;
	hints = {
		m0: {
			title: '<b>No morphologic abnormality</b> [0 pts]',
			content: 'No spinal column disruption'
		},
		m1: {
			title: '<b>Compression fracture</b> [1 pt]',
			content:
				'Visible loss of height through part of or an entire vertebral body, or endplate disruption<br>' +
				'<i>e.g. flexion "tear-drop" fracture</i>'
		},
		m2: {
			title: '<b>Burst fracture</b> [2 pts]',
			content: 'A type of compression fracture which results in disruption of the posterior vertebral body cortex with retropulsion into the spinal canal'
		},
		m3: {
			title: '<b>Distraction injury</b> [3 pts]',
			content:
				'Anatomic dissociation in the vertical axis<br>' +
				'<u>Flexion</u>: disruption of the strong capsular and bony constraint of facet articulation<br>' +
				'<u>Extension</u>: disruption of the strong tensile properties of the anterior longitudinal ligament (ALL), intervertebral disc, vertebral body<br><br>' +
				'<i>e.g. perched facet, hyperextension injury</i>'
		},
		m4: {
			title: '<b>Translation/rotation injury</b> [4 pts]',
			content:
				'Horizontal displacement of one part of the subaxial cervical spine with respect to the other<br>' +
				'<li>Relative angulation > 11&deg;<br>' +
				'<i>e.g. unilateral/bilateral facet fracture-dislocations, fracture separation of the lateral mass, bilateral pedicle fractures</i>'
		},
		d0: {
			title: '<b>Intact disco-ligamentous complex (DLC)</b> [0 pts]',
			content: 'No disruption of the disco-ligamentous complex (DLC)'
		},
		d1: {
			title: '<b>Indeterminate disco-ligamentous complex (DLC)</b> [1 pt]',
			content:
				'Indeterminate competence of the disco-ligamentous complex (DLC)<br>' +
				'<i>e.g. isolated interspinous widening, MRI signal change only</i>'
		},
		d2: {
			title: '<b>Disrupted disco-ligamentous complex (DLC)</b> [2 pts]',
			content:
				'Abnormal bony relationships' +
				'<ul><li>disc space widening' +
				'<li>dislocation or separation of facet joints' +
				'<li>subluxation of vertebral bodies' +
				'<li>widened disc space</ul>'
		},
		n0: {
			title: '<b>Intact neurologic status</b> [0 pts]',
			content: 'No clinical neurologic injury'
		},
		n1: {
			title: '<b>Root injury</b> [1 pt]',
			content: 'Nerve root compression'
		},
		n2: {
			title: '<b>Complete spinal cord injury</b> [2 pts]',
			content: '<i>e.g. ASIA A</i>'
		},
		n3: {
			title: '<b>Incomplete spinal cord injury</b> [3 pts]',
			content: 'Incomplete spinal cord injury (SCI) generally requires more urgent treatment than complete SCI'
		},
		n1c: {
			title: '<b>Continuous cord compression</b> [+1 pt]',
			content: 'Ongoing cord compression in the setting of neurologic deficit'
		}
	};
	buttons.p = buttons.u.concat(buttons.s);

	$('button[type="radio"]').popover({
		container: 'body',
		placement: 'top',
		html: true,
		trigger: 'manual'
	});

	for (i = 0; i < buttons.p.length; i++) {
		var po = $('#'+buttons.p[i]).data('bs.popover');
		po.options.title = hints[buttons.p[i]].title;
		po.options.content = hints[buttons.p[i]].content;
	}
};

// initialization - preselect C0
cspine.reset();
cspine.initHints();
});

