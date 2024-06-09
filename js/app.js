require( 'tweenjs' );
const {
		Container,
		Shape,
		Stage,
		Text,
	} = require( 'easeljs' ),
	{
		Ticker
	} = require( 'tweenjs' ),
	MIDI = require( 'midi' ),
	$ = require( 'jquery' ),
	{ PianoVisualizer } = require( './piano_visualizer' ),
	{ Big18Visualizer } = require( './big18' ),
	{
		COLOR_4,
		COLOR_6,
		yOffset,
	} = require( './constants' ),
	{
		tempo,
		beatDuration,
	} = require( './tempo.js' );

require( 'midi-plugin-audiotag' );
require( 'midi-plugin-webaudio' );
require( 'midi-plugin-webmidi' );

// TODO: globals are gross
var keyCodeMap;
var player;
var piano;
var big18;
var beatVisualizer;
var stage;
var keyboard;

let currentBeatSound = 1;

let percentAccumulator = 0;
var currentBeat = 0;
var currentNumericBeat = 0;
var lastBeat = 0;


$( document ).ready(function() {
	$.getJSON( "data/test.json", function( data ) {
		keyCodeMap = data["keymap"];

	});
	getMIDIInput();

	$('#tempo').keypress(function(e){
		console.log("key pressed in text field: " + e);
		if(e.which == 13){
			$(this).blur();
		}
	});
});

MIDI.loadPlugin({
	soundfontUrl: "./include/soundfont/",
    //instrument: "banjo", // or the instrument code 1 (aka the default)
	//instrument: "banjo",
    instruments: [ "acoustic_grand_piano", "banjo", "synth_drum"], // or multiple instruments
    onsuccess: function() {
  		// var delay = 0; // play one note every quarter second
		// var note = 50; // the MIDI note
		// var velocity = 127; // how hard the note hits
		MIDI.setVolume(0, 127);
		// MIDI.noteOn(0, note, velocity, delay);
		// MIDI.noteOff(0, note, delay + 0.75);
		player = MIDI.Player;
		// player.BPM = 300;
		// player.loadFile(song, player.start);

		//MIDIPlayerPercentage(player);
		MIDI.programChange(0, MIDI.GM.byName['acoustic_grand_piano'].number);
		MIDI.programChange(1, MIDI.GM.byName['synth_drum'].number);
		MIDI.programChange(2, MIDI.GM.byName['banjo'].number);
	}
});

function getMIDIInput() {
	if (navigator.requestMIDIAccess) {
		navigator.requestMIDIAccess({
			sysex: false // this defaults to 'false' and we won't be covering sysex in this article.
		}).then(onMIDISuccess, onMIDIFailure);
	} else {
		alert("No MIDI support in your browser.");
	}
}

function listInputs(inputs) {
	var input = inputs.value;
		console.log("Input port : [ type:'" + input.type + "' id: '" + input.id +
				"' manufacturer: '" + input.manufacturer + "' name: '" + input.name +
				"' version: '" + input.version + "']");
}

// midi functions
function onMIDISuccess(midiAccess) {
    const midi = midiAccess; // this is our raw MIDI data, inputs, outputs, and sysex status

    var inputs = midi.inputs.values();
    // loop over all available inputs and listen for any MIDI input

    for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
        // each time there is a midi message call the onMIDIMessage function
        input.value.onmidimessage = onMIDIMessage;
        listInputs(input);
    }

    console.log('MIDI Access Object', midiAccess);
}

function onMIDIFailure(e) {
    // when we get a failed response, run this code
    console.log("No access to MIDI devices or your browser doesn't support WebMIDI API. Please use WebMIDIAPIShim " + e);
}

function onMIDIMessage(message) {
    const data = event.data,
		cmd = data[0] >> 4,
		channel = data[0] & 0xf,
		type = data[0] & 0xf0, // channel agnostic message type. Thanks, Phil Burk.
		note = data[1],
		velocity = data[2];
	// with pressure and tilt off
	// note off: 128, cmd: 8
	// note on: 144, cmd: 9
	// pressure / tilt on
	// pressure: 176, cmd 11:
	// bend: 224, cmd: 14
	// log('MIDI data', data);
	switch(type){
		case 144: // noteOn message
			if (velocity > 0) {
				MIDI.noteOn(0, note, velocity, 0);
				piano.toggleKey(note, true);
				beatVisualizer.triggerNearestNodeOnChannel(note, currentNumericBeat + percentAccumulator);
			} else {
				MIDI.noteOff(0, note, 0);
				piano.toggleKey(note, false);
			}
			break;
		case 128: // noteOff message
			MIDI.noteOff(0, note, 0);
			piano.toggleKey(note, false);
			// noteOff(note, velocity);
			break;
	}
if (channel != 8 && channel != 14) {
		console.log('data', data, 'cmd', cmd, 'channel', channel);
	}
	// logger(keyData, 'key data', data);
}

function beatSoundToggle() {
	currentBeatSound += 1;
	if (currentBeatSound > 3) {
		currentBeatSound = 0;
	}

	let l = $("#beatSoundButton");
	l.css('color', COLOR_6);
	switch(currentBeatSound) {
		case 0: l.html("PIANO");
			break;
		case 1: l.html("TICK");
			break;
		case 2: l.html("BANJO");
			break;
		case 3:
			l.html("MUTE");
			//make the 'mute' beat sound be red to match the mute toggle
			l.css('color', COLOR_4);
			break;
	}
}

function muteToggle() {
	let b = $("#muteButton");

	let t = b.html();
	if (t == "ON") {
		b.html("OFF");
		b.css('color', COLOR_6);
		MIDI.setVolume(0, 127);
	} else {
		b.html("ON");
		b.css('color', COLOR_4);
		MIDI.setVolume(0, 0);

	}
}


function tempoFocusLost(e) {
	let t = $("#tempo");
	let v = t.val();

	if ($.isNumeric(v)) {
		tempo(v);
	}

	// this resets the tempo box in case any non-numeric value was entered
	t.val(tempo());
}

function keyCodeToNote(kc) {
	var translated = keyCodeMap[kc];
	if (translated == null) {
		translated = kc;
	}

	return translated;
}



var triggeredKeyCodes = [];
var keyCodeRecorder = [];

document.onkeydown = function (e) {
	//Blurs the element if anything other than tempo box is focused
	//this fixes the spacebar bug
	if (document.activeElement.id == "tempo") {return;}
	else {document.activeElement.blur();}


	e = e || window.event;

	var note = keyCodeToNote(e.keyCode);
	var alreadyTriggered = false;

    for (var i = 0, kc; kc = triggeredKeyCodes[i]; i++) {
		if (kc == note) {
			alreadyTriggered = true;
		}
	}

	if (!alreadyTriggered) {
		MIDI.noteOn(0, note, 90, 0);
		triggeredKeyCodes.push(note);

		piano.toggleKey(note, true);
		//beatVisualizer.addNodeToChannel(note, currentBeat);
		beatVisualizer.triggerNearestNodeOnChannel(note, currentNumericBeat + percentAccumulator);

		//keyCodeRecorder.push(e.keyCode);
		//console.log(keyCodeRecorder);
	}
};

document.onkeyup = function (e) {
	e = e || window.event;

	//console.log("keyup fired " + e.keyCode);
	var note = keyCodeToNote(e.keyCode);
	MIDI.noteOff(0, note, 0);

	piano.toggleKey(note, false);

	var temp = triggeredKeyCodes.slice();
	triggeredKeyCodes = [];
    for (var i = 0, kc; kc = temp[i]; i++) {
		if (note != kc) {
			triggeredKeyCodes.push(kc);
		}
	}
};


// Easel.JS
function init() {
	stage = new Stage("demoCanvas");
	//stage.enableMouseOver(3); // this is expensive, so it may be better to not use it

	//Ticker.timingMode = Ticker.RAF; // syncs to display, does not respect framerate value
	//Ticker.timingMode = Ticker.RAF_SYNCHED; // synce to display but tries to use framerate
	Ticker.timingMode = Ticker.TIMEOUT; // does not sync to display, just uses a simple timer
	Ticker.framerate = 60;
	Ticker.addEventListener("tick", tick);

	if (window.devicePixelRatio) {
		// grab the width and height from canvas
		var height = stage.canvas.getAttribute('height');
		var width = stage.canvas.getAttribute('width');
		// reset the canvas width and height with window.devicePixelRatio applied
		stage.canvas.setAttribute('width', Math.round(width * window.devicePixelRatio));
		stage.canvas.setAttribute('height', Math.round( height * window.devicePixelRatio));
		// force the canvas back to the original size using css
		stage.canvas.style.width = width+"px";
		stage.canvas.style.height = height+"px";
		// set CreateJS to render scaled
		stage.scaleX = stage.scaleY = window.devicePixelRatio;
	}

 	piano = new PianoVisualizer(stage, function(note, on) {
		if (on) {
			MIDI.noteOn(0, note, 50, 0);
		} else {
			MIDI.noteOff(0, note, 0);
		}
	});

	big18 = new Big18Visualizer(stage, 
		function(notes, on){
			if (on) {
				console.log('Notes', notes);
				for (let note of notes){
					MIDI.noteOn(0, note, 50, 0);
					piano.toggleKey(note, true);
				}
			} else {
				for (let note of notes){
					MIDI.noteOff(0, note, 0);
					piano.toggleKey(note, false);
				}
			}
		},

	);


}


function tick(event) {

	let d = beatDuration();

	currentBeat = event.time;

	let dt = currentBeat - lastBeat;

	let percent = dt / d;

	percentAccumulator += percent;

	if (percentAccumulator > 1) {
		percentAccumulator -= 1;
		currentNumericBeat += 1;
	}

	// beatVisualizer.tick(currentNumericBeat + percentAccumulator);

	stage.update(event);

	lastBeat = currentBeat;
}

// function clearHighestStreak(e)
// {
// 	beatVisualizer.clearMaxStreak();
// }


$( () => { // $( () => { ... } );: This is a shorthand for $(document).ready(...)
	init();

	$( document )
	// .on( 'click', '#tempoUp', e => {
	// 	e.preventDefault();
	// 	tempoUp();
	// } )
	// .on( 'click', '#tempoDown', e => {
	// 	e.preventDefault();
	// 	tempoDown();
	// } )
	.on( 'focusout', '#tempo', e => {
		tempoFocusLost();
	} )
	// .on( 'click', '#currentStreakLabel', e => {
	// 	clearHighestStreak();
	// })
	.on( 'click', '#muteButton', e => {
		e.preventDefault();
		muteToggle();
	} )
	.on( 'click', '#beatSoundButton', e => {
		e.preventDefault();
		beatSoundToggle();
	} );
} );
