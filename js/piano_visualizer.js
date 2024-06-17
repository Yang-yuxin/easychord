const {
		Container,
		Shape,
		Text
	} = require( 'easeljs' ), {
		blackKeyCornerRadius,
		blackKeyHeight,
		blackKeyWidth,
		blackNotes,
		keyCornerRadius,
		keyGap,
		keyHeight,
		keyWidth,
		TRIGGERED_KEY_BLACK,
		TRIGGERED_KEY_WHITE,
		xOffset,
		yOffset
	} = require( './constants' );

function PianoVisualizer(stage, keyClickCallback) {
	this.stage = stage;
	this.keyClickCallback = keyClickCallback;

	this.keyMap = {};
	this.generateKeys(41, 100);

	this.stage.update();
}

// this should go into some kind of helper class
PianoVisualizer.prototype.getCanvasWidth = function() {
	return this.stage.canvas.width / this.stage.scaleX;
}

PianoVisualizer.prototype.topCenterForKey = function(note) {
	let k = this.keyMap[note];
	let p = 0;
	if (k) {
		let w = k.isBlack ? blackKeyWidth * .5 : keyWidth * .5;
		p = k.shape.x + w;
	} else {
		console.log("key not found for " + note);
	}
	return p;
}

PianoVisualizer.prototype.topCenterForAllKeys = function(note) {
	let keyInfos = [];
    for (let key in this.keyMap) {
		let k = this.keyMap[key];
		let w = k.isBlack ? blackKeyWidth * .5 : keyWidth * .5;
		let p = k.shape.x + w;

		let ki = new keyInfo();
		ki.topCenterX = p
		ki.note = key;
		keyInfos.push(ki);
	}
	return keyInfos;
}

PianoVisualizer.prototype.showLabels = function(left, right) {
	let container = new Container;
	const width = 200;
	const y = 120;
	const fontSize = "130px"

	let text = new Text(left.toString(), "100 " + fontSize + " Roboto", "#D2CFCE");
	text.textBaseline = "alphabetic";
	container.addChild(text);

	text = new Text(":", "100 " + fontSize + " Roboto", "#D2CFCE");
	text.textBaseline = "alphabetic";
	text.x = 90; 
	text.y = -6;
	container.addChild(text);

	text = new Text(right.toString(), "100 " + fontSize + " Roboto", "#D2CFCE");
	text.textBaseline = "alphabetic";
	text.x = 130;
	container.addChild(text);

	container.x = this.getCanvasWidth() * .1 - width *.5;
	container.y = y;
	this.stage.addChild(container);
}

PianoVisualizer.prototype.toggleKey = function(note, on) {
	let k = this.keyMap[note];
	if (k) {
		k.toggle(on);
		//this.stage.update();
	} else {
		console.log("key not found for " + note);
	}
}

PianoVisualizer.prototype.generateKeys = function(start, end) {
	let p = 0;
	let blackKeys = [];
	for (let i = start; i <= end; i++) {

		let isBlack = blackNotes.indexOf(i) > -1;

		if (isBlack) p--;

		let k = new key(p, i, isBlack, this.keyClickCallback);
		this.stage.addChild(k.shape);

		if (isBlack) {
			blackKeys.push(k);
		}

		this.keyMap[i] = k;

		this.toggleKey(i, false);
		p++;
	}

	//console.log(this.keyMap);

    for (let i = 0, k; k = blackKeys[i]; i++) {
		this.stage.setChildIndex(k.shape, this.stage.getNumChildren()-1);
	}
}

function key(position, note, isBlack, clickCallback) {
	this.isBlack = isBlack;
	this.durationInBeats = 3;
	this.currentBeat = 0;

	this.shape = new Shape;
	
	let k = this;
	// this.shape.addEventListener("mousedown", function(event) {
	// 	k.toggle(true);
	// 	clickCallback(note, true);
	// });

	// this.shape.addEventListener("pressup", function(event) {
	// 	k.toggle(false);
	// 	clickCallback(note, false);
	// });
	this.shape.addEventListener("click", function(event) {
		k.toggle(true);
		clickCallback(note, true);
		setTimeout(function() {
			k.toggle(false);
			clickCallback(note, false);
		}, 300); // Adjust the delay time in milliseconds (e.g., 500 ms)

	});

	if (isBlack) {
		let extraOffset = (keyWidth + keyGap * .5) - blackKeyWidth * .5;
		this.shape.x = xOffset + (position * (keyWidth + keyGap)) + extraOffset;
		this.shape.y = yOffset - keyGap * .5;
	} else {
		this.shape.x = xOffset + (position * (keyWidth + keyGap));
		this.shape.y = yOffset;
	}
}

key.prototype.toggle = function(on) {
	const r = keyCornerRadius;
	const br = blackKeyCornerRadius;

	if (this.isBlack) {
		if (on) {
			this.shape.graphics.clear().setStrokeStyle(keyGap).beginStroke("#222").beginFill(TRIGGERED_KEY_BLACK).drawRoundRectComplex(0, 0, blackKeyWidth, blackKeyHeight, 0,0,br,br).endFill().endStroke();
		} else {
			this.shape.graphics.clear().setStrokeStyle(keyGap).beginStroke("#222").beginFill("#4B4D49").drawRoundRectComplex(0, 0, blackKeyWidth, blackKeyHeight, 0,0,br,br).endFill().endStroke();
		}
	} else {
		if (on) {
			this.shape.graphics.clear().beginFill(TRIGGERED_KEY_WHITE).drawRoundRectComplex(0, 0, keyWidth, keyHeight, 0,0,r,r).endFill();
		} else {
			this.shape.graphics.clear().beginFill("#FFF").drawRoundRectComplex(0, 0, keyWidth, keyHeight, 0,0,r,r).endFill();
		}
	}
}

function keyInfo() {
	this.note;
	this.topCenterX;
	this.topCenterY;
}

module.exports = {
	PianoVisualizer
};