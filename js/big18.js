const { randomKeySignature, randomBig18Chord, applyInversion, adjust } = require('./utils');
const {
    Container,
    Shape,
    Text,
} = require( 'easeljs' ), {
    Big18COL,
    Big18ROW,
    Big18Width,
    Big18Gap,
    Big18TextOffsetX,
    Big18TextOffsetY,
    Big18BaseTriadDictMajor,
    Big18BaseTriadDictMinor,
    ScaleDegrees,
    keySigGap,
    keySigOffsetX,
    keySigOffsetY,
    keySigColorTrue,
    keySigColorFalse,
    majorKeys,
    minorKeys,
} = require( './constants' ),
MIDI = require( 'midi' );



function Big18Visualizer(stage, keyClickCallback) {
	this.stage = stage;
    this.gridHeight = 0;
    this.gridWidth = 0;
    this.grids = new Container;
    this.grids.name = "Grids";
    this.gridCells = {
        "major": [],
        "minor": [],
    };  
    this.cellWidth = Big18Width;
    this.cellHeight = Big18Width;
	this.keyClickCallback = keyClickCallback;
    this.visibleGrid = "major"; // default to major
    this.drawGrid(stage, Big18ROW, Big18COL, Big18Width, Big18Width, 'black');
    this.keyOffset = {major:0, minor:0};
	this.drawKeyColumn(stage)
    this.drawOtherButtons(stage);
    // Update the key grid once the key signature changes
    this.updateMajorMinor();
    this.updateKeyColumn(this.stage.getChildByName("majorkeys"), "major");
    this.updateKeyColumn(this.stage.getChildByName("minorkeys"), "minor");
    this.stage.update();
}

Big18Visualizer.prototype.updateMajorMinor= function() {
    let btn = this.stage.getChildByName("switchBtn");
    let btnshape = btn.getChildAt(0);
    let btntext = btn.getChildAt(1);
    let afterSwitch = "";
    afterSwitch += this.visibleGrid === "minor" ? "major" : "minor";
    btntext.text =  afterSwitch;
    if (this.visibleGrid === "major") {
        this.grids.getChildByName("major").visible = true;
        this.stage.getChildByName("majorkeys").visible = true;
        this.grids.getChildByName("minor").visible = false;
        this.stage.getChildByName("minorkeys").visible = false;
        btnshape.graphics.beginFill("grey").drawRect(-40, -10, 80, 20);
        btntext.color = "white";
    }
    else{
        this.grids.getChildByName("major").visible = false;
        this.stage.getChildByName("majorkeys").visible = false;
        this.grids.getChildByName("minor").visible = true;  
        this.stage.getChildByName("minorkeys").visible = true;
        btnshape.graphics.beginFill("white").drawRect(-40, -10, 80, 20);
        btntext.color = "black";
    }
    this.stage.update();
}

Big18Visualizer.prototype.getCanvasWidth = function() {
	return this.stage.canvas.width / this.stage.scaleX;
}

Big18Visualizer.prototype.updateKeyColumn = function(keys, ind) {
    // Update the key grid once the key signature changes
    for (let i=0; i<keys.children.length; i++) {
        var key = keys.getChildAt(i);
        var cell = key.getChildByName("rect");
        cell.graphics.beginFill(keySigColorFalse).drawRect(-keySigGap/2, -keySigGap/2, keySigGap, keySigGap);
        var text = key.getChildByName("text");
        text.color = "white";
    }
    var i = this.keyOffset[ind];
    key = keys.getChildAt(i);
    cell = key.getChildByName("rect");
    cell.graphics.beginFill(keySigColorTrue).drawRect(-keySigGap/2, -keySigGap/2, keySigGap, keySigGap);
    text = key.getChildByName("text");
    text.color = "black";

}

Big18Visualizer.prototype.drawOtherButtons = function(stage) {
    const self = this;
    const controlBtn = new Container();
    const controlBtnShape = new Shape();
    controlBtnShape.graphics.beginFill("white").drawRect(-40, -10, 80, 20);
    controlBtnShape.graphics.beginStroke("black").drawRect(-40, -10, 80, 20);
    controlBtn.name = "switchBtn";
    controlBtn.x = this.getCanvasWidth() / 2 - Big18Width * Big18COL / 2 - Big18Gap * 2.8;
    controlBtn.y = this.grids.y + Big18Gap;
    var afterSwitch = "";
    afterSwitch += self.visibleGrid === "minor" ? "major" : "minor";
    var text = new Text(afterSwitch, "20px Times New Roman", "black");
    text.textAlign = "center";
    text.textBaseline = "middle";
    controlBtn.addChild(controlBtnShape);
    controlBtn.addChild(text);
    controlBtn.addEventListener("mousedown", function(event) {
        self.visibleGrid = self.visibleGrid === "minor" ? "major" : "minor";
        self.updateMajorMinor();
        self.stage.update();
    });
    // controlBtn.addEventListener("click", function(event) {
    //     self.visibleGrid = self.visibleGrid === "minor" ? "major" : "minor";
    //     self.updateMajorMinor();
    //     self.stage.update();
    // });
    this.stage.addChild(controlBtn);

    // Add exercise button
    const exerciseBtn = new Container();
    const exerciseBtnShape = new Shape();
    exerciseBtnShape.graphics.beginFill("white").drawRect(-40, -10, 80, 20);
    exerciseBtnShape.graphics.beginStroke("black").drawRect(-40, -10, 80, 20);
    exerciseBtn.name = "exerciseBtn";
    exerciseBtn.x = controlBtn.x
    exerciseBtn.y = controlBtn.y + 0.5 * Big18Gap;
    var exerciseBtntext = new Text("Exercise", "20px Times New Roman", "black");
    exerciseBtntext.textAlign = "center";
    exerciseBtntext.textBaseline = "middle";
    exerciseBtn.addChild(exerciseBtnShape);
    exerciseBtn.addChild(exerciseBtntext);

    // Add event listener to trigger exercise mode
    exerciseBtn.addEventListener("mousedown", () => {
        this.startExerciseMode();
    });

    this.stage.addChild(exerciseBtn);
    this.stage.update();


    var notionText = "This is a webpage designed for learners of harmony and music theory. \n\
It helps users experiment with chords and develop the ability to distinguish them. \n\
The grid positioning of chords follows the music theory lesson developed by Seth Monahan.\n\
(https://www.youtube.com/c/SethMonahan).";

    
    var notion = new Text(notionText, "16px Times New Roman", "white");
    notion.textAlign = "center";
    notion.textBaseline = "middle";
    notion.x = this.getCanvasWidth()/2;
    notion.y = this.grids.y+Big18Width*Big18ROW+Big18Gap*2.3;
    // this.stage.addChild(notion);
}



Big18Visualizer.prototype.startExerciseMode = function () {
    const self = this;
    const exercisePopup = new Container();
    exercisePopup.name = "exercisePopup";

    // Background for popup
    const background = new Shape();
    background.graphics.beginFill("rgba(255, 255, 255, 1)").drawRect(0, 10, this.getCanvasWidth(), this.stage.canvas.height / 3.6);
    exercisePopup.addChild(background);

    // Positioning base (center of screen)
    const baseX = self.getCanvasWidth() / 2;
    const baseY = self.stage.canvas.height / 6;

    // Key signature text
    const keySignatureText = new Text("", "24px Times New Roman", "black");
    keySignatureText.textAlign = "center";
    keySignatureText.textBaseline = "middle";
    keySignatureText.x = this.getCanvasWidth() / 2;
    keySignatureText.y = baseY - 30;
    exercisePopup.addChild(keySignatureText);

    // Countdown text
    const countdownText = new Text("", "18px Times New Roman", "black");
    countdownText.textAlign = "center";
    countdownText.textBaseline = "middle";
    countdownText.x = this.getCanvasWidth() / 2;
    countdownText.y = baseY - 50;
    exercisePopup.addChild(countdownText);
     
    // Add the "Close" button
    const closeBtn = new Container();
    const closeBtnShape = new Shape();
    closeBtnShape.graphics.beginFill("white").drawRect(-40, -10, 80, 20);
    closeBtnShape.graphics.beginStroke("black").drawRect(-40, -10, 80, 20);
    closeBtn.name = "closeBtn";
    closeBtn.x = this.getCanvasWidth() - 100;
    closeBtn.y = 30;

    const closeText = new Text("Close", "20px Times New Roman", "black");
    closeText.textAlign = "center";
    closeText.textBaseline = "middle";
    closeBtn.addChild(closeBtnShape);
    closeBtn.addChild(closeText);

    let exerciseTimeouts = []; // Array to store timeout IDs
    let exerciseIntervals = []; // Array to store interval IDs

    // Add event listener to close the popup and stop timeouts
    closeBtn.addEventListener("mousedown", () => {
        // Clear all timeouts
        exerciseTimeouts.forEach(clearTimeout);
        exerciseIntervals.forEach(clearInterval);
        exerciseTimeouts = []; // Reset the array
        exerciseIntervals = []; // Reset the array

        // Remove the popup
        self.stage.removeChild(exercisePopup);
        self.stage.update();
    });

    exercisePopup.addChild(closeBtn);

    this.stage.addChild(exercisePopup);
    var exerciseTextElements = [];

    // Exercise logic
    function showNextExercise() {
        let keySignature = randomKeySignature();
        console.log(keySignature);
        // Show key signature and start countdown
        keySignature = {key: 'D', mode: 'major'};
        keySignatureText.text = `Key Signature: ${keySignature.key}`;
        console.log(keySignature.key);

        randomBig18Chord(keySignature.key, keySignature.mode).then((chord) => {
            // use chord here
            console.log(chord);
            const { main, sup, sub, offsetx, offsety } = chord.text;
             // Create separate Text elements for chord display
            const ox = offsetx !== null ? offsetx : Big18TextOffsetX;
            const oy = offsety !== null ? offsety : Big18TextOffsetY;
            
            
            // Remove previous text elements
            if (exerciseTextElements.length > 0) {
                exerciseTextElements.forEach((textObj) => {
                    exercisePopup.removeChild(textObj);
                });
            exerciseTextElements = [];
            }

            // Create main text
            const mainText = new Text(main || "", "20px Times New Roman", "black");
            mainText.textAlign = "center";
            mainText.textBaseline = "middle";
            mainText.x = baseX;
            mainText.y = baseY;
            exercisePopup.addChild(mainText);
            exerciseTextElements.push(mainText);

            // Create sup text (above)
            if (sup !== null) {
                const supText = new Text(sup, "16px Times New Roman", "black");
                supText.textAlign = "center";
                supText.textBaseline = "middle";
                supText.x = baseX + ox;
                supText.y = baseY - oy;
                exercisePopup.addChild(supText);
                exerciseTextElements.push(supText);
            }

            // Create sub text (below)
            if (sub !== null) {
                const subText = new Text(sub, "16px Times New Roman", "black");
                subText.textAlign = "center";
                subText.textBaseline = "middle";
                subText.x = baseX + ox;
                subText.y = baseY + oy;
                exercisePopup.addChild(subText);
                exerciseTextElements.push(subText);
            }

            

        self.stage.update();
    
    let countdown = 15;
    countdownText.text = `${countdown}s`;
    self.stage.update();
    
    const countdownInterval = setInterval(() => {
        countdown--;
        countdownText.text = `${countdown}s`;
        self.stage.update();
    
        if (countdown <= 0) {
            clearInterval(countdownInterval);
    
            // Play chord
            chord.notes.forEach((note) => {
                MIDI.noteOn(0, note, 90, 0);
                setTimeout(() => MIDI.noteOff(0, note, 0.5), 500);
            });
            // Then play each note one by one (after 1s)
            const sortedNotes = [...chord.notes].sort((a, b) => a - b);
            sortedNotes.forEach((note, i) => {
                const delay = 1500 + i * 600;
                const noteTimeout = setTimeout(() => {
                    MIDI.noteOn(0, note, 90, 0);
                    setTimeout(() => MIDI.noteOff(0, note, 0.5), 500);
                }, delay);
                exerciseTimeouts.push(noteTimeout);
            });
    
        // Clear previous chord text after 3s
        const clearTextTimeout = setTimeout(() => {
            exerciseTextElements.forEach((textObj) => {
                exercisePopup.removeChild(textObj);
            });
            exerciseTextElements = [];
            self.stage.update();
        }, 4000);
        exerciseTimeouts.push(clearTextTimeout);

        // Play the chord again after 4s
        const replayTimeout = setTimeout(() => {
            chord.notes.forEach((note) => {
                MIDI.noteOn(0, note, 90, 0);
                setTimeout(() => MIDI.noteOff(0, note, 0.5), 500);
            });
        }, 4000);
        exerciseTimeouts.push(replayTimeout);

        // Show next exercise after 6s
        const nextTimeout = setTimeout(() => {
            showNextExercise();
        }, 6000);
        exerciseTimeouts.push(nextTimeout);
    }
    }, 1000);
    exerciseIntervals.push(countdownInterval);
    
    });}

    showNextExercise();
};


Big18Visualizer.prototype.drawGrid = function(stage, numRows, numCols, cellWidth, cellHeight, lineColor, ) {
    for (let i = 0; i < 2; i++) {
        const grid = new Container;
        const gridLines = new Container;
        const gridLine = new Shape;
        const cells = new Container;
        cells.name = "Cells";
        
        gridLine.graphics.setStrokeStyle(3).beginStroke(lineColor || "#000");
        for (let col = 0; col <= numCols; col++) {
            gridLine.graphics.moveTo(col * cellWidth, 0).lineTo(col * cellWidth, numRows * cellHeight);
            
        }
        for (let row = 0; row <= numRows; row++) {
            gridLine.graphics.moveTo(0, row * cellHeight).lineTo(numCols * cellWidth, row * cellHeight);
        }
        gridLine.graphics.endStroke();
        gridLines.addChild(gridLine);
        
        fetch('./data/big18.json')
        .then(response => response.json())
        .then(data => {
            var grid_data = data[i];
            // add text labels
            var text = new Text("BASE TRIAD", "20px Times New Roman", "white");
            text.textAlign = "center";
            text.textBaseline = "middle";
            text.x = Big18Width * Big18COL / 2;
            text.y = grid.y - 2.7 * Big18Width;
            grid.addChild(text);
            text = new Text("SCALE DEGREE IN BASS", "20px Times New Roman", "white");
            text.textAlign = "center";
            text.textBaseline = "middle";
            text.x = grid.x - 7.8 * Big18Width;
            text.y = Big18Width * Big18ROW / 2;
            text.rotation = -90;
            grid.addChild(text);
            var ind = i === 0 ? "major" : "minor";
            var suptext;
            for (let k=0; k < numRows; k++){
                for (let j=0; j<numCols; j++){
                    this.addcell(cells, k, j, grid_data[k][j], ind, this.keyClickCallback);
                    if (k === 0) {
                        // add x and y labels
                        var dict;
                        if (i === 0) {
                            dict = Big18BaseTriadDictMajor;
                        }
                        else {
                            dict = Big18BaseTriadDictMinor;
                        }
                        text = new Text(dict[j][0], "20px Times New Roman", "white");
                        text.textAlign = "center";
                        text.textBaseline = "middle";
                        text.x = j * cellWidth + Big18Width / 2;
                        text.y = Big18TextOffsetY - Big18Width / 2;
                        grid.addChild(text);
                        if (dict[j].length > 1) {
                            suptext = new Text(dict[j][1], "12px Times New Roman", "white");
                            suptext.textAlign = "center";
                            suptext.textBaseline = "middle";
                            suptext.x = text.x + Big18TextOffsetX;
                            suptext.y = text.y - Big18TextOffsetY;
                            grid.addChild(suptext);
                        }
                        text = new Text(ScaleDegrees[j], "20px Times New Roman", "white");
                        text.textAlign = "center";
                        text.textBaseline = "middle";
                        text.x = grid.x - 7.2 * Big18Width;
                        text.y = j * cellWidth + Big18Width / 2;
                        grid.addChild(text);
                        suptext = new Text("^", "16px Times New Roman", "white");
                        suptext.textAlign = "center";
                        suptext.textBaseline = "middle";
                        suptext.x = text.x;
                        suptext.y = text.y - 1.5*Big18TextOffsetY;
                        grid.addChild(suptext);
                    }
                }
            }
            
        })
        .catch(error => console.error('Error loading grid properties:', error));
        if (i === 0) {
            grid.name = "major";
        }
        else{
            grid.name = "minor";
        }
        grid.addChild(cells);
        grid.addChild(gridLines);
        this.grids.addChildAt(grid, i);
        
        }
    
    this.gridHeight = numRows * cellHeight;
    this.gridWidth = numCols * cellWidth;

    this.arrange(this.grids);
    
	this.stage.addChild(this.grids);
    // stage.addChild(grid);
    // Don't forget to update the stage
    stage.update();
}

Big18Visualizer.prototype.drawKeyColumn = function(stage) {
    const majorKeysContainer = new Container;
    majorKeysContainer.name = "majorkeys";
    const minorKeysContainer = new Container;
    minorKeysContainer.name = "minorkeys";
    const self = this;
    majorKeys.forEach((key, index) => {
        var keyCtn = new Container;
        var cell = new Shape;
        cell.graphics.beginFill(keySigColorFalse).drawRect(-keySigGap/2, -keySigGap/2, keySigGap, keySigGap);
        var border = new Shape;
        border.graphics.beginStroke("#000");
        border.graphics.setStrokeStyle(2);
        border.snapToPixel = true;
        border.graphics.drawRect(-keySigGap/2, -keySigGap/2, keySigGap, keySigGap);
        var text = new Text(key, "20px Times New Roman", "white");
        text.textAlign = "center";
        text.textBaseline = "middle";
        const canvasWidth = this.getCanvasWidth();
        const canvasCenter = canvasWidth / 2;
        // let offset = canvasCenter - Big18Width * Big18COL - Big18Gap / 2 - keySigGap / 2;
        // cell.x = offset - keySigOffsetX;
        cell.y = keySigGap*index+keySigOffsetY;
        // text.x = offset - keySigOffsetX;
        text.y = keySigGap*index+keySigOffsetY;
        // border.x = offset - keySigOffsetX;
        border.y = keySigGap*index+keySigOffsetY;
        border.name = "border";
        cell.name = "rect";
        text.name = "text";
        keyCtn.name = `keyCon${index}`;
        keyCtn.addChild(cell);
        keyCtn.addChild(border);
        keyCtn.addChild(text);
        majorKeysContainer.addChild(keyCtn);
        cell.addEventListener("mousedown", function(event) {
            console.log("key chosen:", key);
            self.keyOffset["major"] = index;
            for (let child of self.gridCells["major"]) {
                child.keyOffset = self.keyOffset["major"]*7;
            }
            self.updateKeyColumn(self.stage.getChildByName("majorkeys"), "major");
        });
        // cell.addEventListener("click", function(event) {
        //     console.log("key chosen:", key);
        //     self.keyOffset["major"] = index;
        //     for (let child of self.gridCells["major"]) {
        //         child.keyOffset = self.keyOffset["major"]*7;
        //     }
        //     self.updateKeyColumn(self.stage.getChildByName("majorkeys"), "major");
        // });
    });
    minorKeys.forEach((key, index) => {
        var keyCtn = new Container;
        var cell = new Shape;
        cell.graphics.beginFill(keySigColorFalse).drawRect(-keySigGap/2, -keySigGap/2, keySigGap, keySigGap);
        var border = new Shape;
        border.graphics.beginStroke("#000");
        border.graphics.setStrokeStyle(2);
        border.snapToPixel = true;
        border.graphics.drawRect(-keySigGap/2, -keySigGap/2, keySigGap, keySigGap);
        var text = new Text(key, "20px Times New Roman", "white");
        text.textAlign = "center";
        text.textBaseline = "middle";
        const canvasWidth = this.getCanvasWidth();
        const canvasCenter = canvasWidth / 2;
        // let offset = canvasCenter + Big18Width * Big18COL + Big18Gap / 2 + keySigGap / 2;
        // cell.x = keySigOffsetX + offset;
        cell.y = keySigGap*index+keySigOffsetY;
        // text.x = keySigOffsetX + offset;
        text.y = keySigGap*index+keySigOffsetY;
        // border.x = keySigOffsetX + offset;
        border.y = keySigGap*index+keySigOffsetY;
        border.name = "border";
        cell.name = "rect";
        text.name = "text";
        keyCtn.name = `keyCon${index}`;
        keyCtn.addChild(cell);
        keyCtn.addChild(border);
        keyCtn.addChild(text);
        minorKeysContainer.addChild(keyCtn);
        cell.addEventListener("mousedown", function(event) {
            console.log("key chosen:", key);
            self.keyOffset["minor"] = index;
            for (let child of self.gridCells["minor"]) {
                child.keyOffset = (self.keyOffset["minor"])*7+9;
            }
            self.updateKeyColumn(self.stage.getChildByName("minorkeys"), "minor");
        });
        // cell.addEventListener("click", function(event) {
        //     console.log("key chosen:", key);
        //     self.keyOffset["minor"] = index;
        //     for (let child of self.gridCells["minor"]) {
        //         child.keyOffset = (self.keyOffset["minor"])*7+9;
        //     }
        //     self.updateKeyColumn(self.stage.getChildByName("minorkeys"), "minor");
        // });
    });
    majorKeysContainer.x = this.grids.getChildByName("major").x - this.gridWidth / 2.5;
    minorKeysContainer.x = this.grids.getChildByName("minor").x - this.gridWidth / 2.5;
    stage.addChild(majorKeysContainer);
    stage.addChild(minorKeysContainer);
    stage.update();
    
}

function GridCell(grid, row, col, keyOffset, cellWidth, cellHeight, additionalProperties, cellClickCallback) {
    this.row = row;
    this.col = col;
    this.keyOffset = keyOffset;
    this.cellWidth = cellWidth;
    this.cellHeight = cellHeight;
    this.isBig18 = additionalProperties['big18'];
    this.notes = additionalProperties['notes'];
    this.additionalProperties = additionalProperties;
    this.cell = this.initcell(grid, row, col, this.notes, additionalProperties, cellClickCallback);
    let k = this;
    
}

GridCell.prototype.initcell = function(grid, row, col, notes, additionalProperties, cellClickCallback){
    // Assuming cell creation within a loop
    let container = new Container;
    let cell = new Shape;
    let hastext = false;
    if (this.isBig18) {
        cell.graphics.beginFill("rgba(256,256,256,1.0)").drawRect(0, 0, this.cellWidth, this.cellHeight);
    }
    else {
        cell.graphics.beginFill("rgba(150,150,150,1.0)").drawRect(0, 0, this.cellWidth, this.cellHeight);
    }
    cell.x = col * this.cellWidth;
    cell.y = row * this.cellHeight;
    let text_dict = additionalProperties['text'];
    if (text_dict['main'] !== null) {
        var text_container = new Container;
        var text = new Text(text_dict['main'], "28px Times New Roman", "#000000");
        text.textAlign = "center";
        text.textBaseline = "middle";
        text.x = col * this.cellWidth + this.cellHeight / 2;
        text.y = row * this.cellHeight + this.cellWidth / 2;
        text_container.addChild(text);
        hastext = true;
        var offsetx;
        var offsety;
        if (text_dict['offsetx'] !== null) {
            offsetx = text_dict['offsetx'];
        }
        else{
            offsetx = Big18TextOffsetX;
        }
        if (text_dict['offsety'] !== null) {
            offsety = text_dict['offsety'];
        }
        else{
            offsety = Big18TextOffsetY;
        }
        if (text_dict['sup'] !== null) {
            var suptext = new Text(text_dict['sup'], "16px Times New Roman", "#000000");
            suptext.textAlign = "center";
            suptext.textBaseline = "middle";
            
            suptext.x = col * this.cellWidth + this.cellHeight / 2 + offsetx;
            suptext.y = row * this.cellHeight + this.cellWidth / 2 - offsety;
            text_container.addChild(suptext);
        }
        if (text_dict['sub'] !== null) {
            var subtext = new Text(text_dict['sub'], "16px Times New Roman", "#000000");
            subtext.textAlign = "center";
            subtext.textBaseline = "middle";
            subtext.x = col * this.cellWidth + this.cellHeight / 2 + offsetx;
            subtext.y = row * this.cellHeight + this.cellWidth / 2 + offsety;
            text_container.addChild(subtext);
        }
    }
    
    var triadnotes = [];
    var seventhnotes = notes;
    triadnotes = notes.slice(0, 3);
    if (this.additionalProperties['inversions'].length > 0) {
        console.log("inversion", this.additionalProperties['inversions']);
        let chordType = this.additionalProperties['legitchords']['seventh'] === false ? "triad" : "seventh";
        let notesforInversion = this.additionalProperties['legitchords']['seventh'] === false ? triadnotes : seventhnotes;
        let notesafterInversion = applyInversion(notesforInversion, this.additionalProperties['inversions'], chordType);
        triadnotes = notesafterInversion.slice(0, 3);
        seventhnotes = notesafterInversion;
    }
    var toplaynotes;
    if (this.additionalProperties['legitchords']['seventh'] === false) {
        toplaynotes = triadnotes;
    }
    else{
        toplaynotes = seventhnotes;
    }
    const self = this;
    
    // Adding an event listener to the cell
    if (this.isBig18) {
        cell.addEventListener("mousedown", function(event) {
            // console.log("Cell clicked:", row, col);
            // console.log("self offset", self.keyOffset);
            // console.log(additionalProperties['inversions']);
            var adj = adjust(toplaynotes, self.keyOffset);
            cellClickCallback(adj, true);
    
        });
        cell.addEventListener("pressup", function(event) {
            var adj = adjust(toplaynotes, self.keyOffset);
            cellClickCallback(adj, false);
        });
    }
    container.addChild(cell);
    if (hastext) {
        container.addChild(text_container);
    }
    grid.addChild(container);

    return container;
}

Big18Visualizer.prototype.addcell = function(grid, row, col, additionalProperties, ind, clkcallback){
    var keyOffset = ind === "major"? this.keyOffset["major"] : this.keyOffset["minor"] + 9;
    var cell = new GridCell(grid, row, col, keyOffset, this.cellWidth, this.cellHeight, additionalProperties, clkcallback);
    this.gridCells[ind].push(cell);

}

Big18Visualizer.prototype.arrange = function (gridContainers) {
    const canvasWidth = this.getCanvasWidth();
    const canvasCenter = canvasWidth / 2;

    let n = gridContainers.numChildren;
    let gap = Big18Gap;
    let W = this.gridWidth;
    for (let i = 0; i < n; i++){
        const gridContainerX = canvasCenter - (W / 2);
        let gridContainer =  gridContainers.getChildAt(i)
        gridContainer.x = gridContainerX;
        gridContainer.y = gap * 2;
    }
    this.stage.update();
}

module.exports = {
	Big18Visualizer,
};