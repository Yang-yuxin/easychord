const { majorKeys, minorKeys } = require('./constants');

function adjust(notes, offset) {
    let adjustedNotes = [...notes];
    for (let i = 0; i < adjustedNotes.length; i++){
        adjustedNotes[i] += offset;
    }
    while(Math.min(...adjustedNotes) > 71) {
        for (let i = 0; i < adjustedNotes.length; i++){
            adjustedNotes[i] -= 12;
        }
    }
    while(Math.min(...adjustedNotes) <= 55) {
        for (let i = 0; i < adjustedNotes.length; i++){
            adjustedNotes[i] += 12;
        }
    }
    return adjustedNotes;
}

function cleanSubSup(type, sup, sub) {
    let cleanedSup = null;
    let cleanedSub = null;
    if (type === 'triad') {
        cleanedSup = sup && !sup.includes('(') ? sup : null;
        cleanedSub = sub && !sub.includes('(') ? sub : null;
    } else {
        cleanedSup = sup ? sup.replace(/[()]/g, '') : null;
        cleanedSub = sub ? sub.replace(/[()]/g, '') : null;
    }
    return { cleanedSup, cleanedSub };
}

function applyInversion(notes, inversions, type) {
    const copy = [...notes];
    if (!inversions || inversions.length === 0) return copy;

    if (type === 'triad') {
        switch (inversions[0]) {
            case 64:
                copy[0] += 12;
                copy[1] += 12;
                break;
            case 6:
                copy[0] += 12;
                break;
        }
    } else {
        switch (inversions[0]) {
            case 42: copy[3] -= 12; break;
            case 43: copy[2] -= 12; copy[3] -= 12; break;
            case 65: copy[1] -= 12; copy[2] -= 12; copy[3] -= 12; break;
            case 7:  copy[0] -= 12; copy[1] -= 12; copy[2] -= 12; copy[3] -= 12; break;
        }

        if (inversions.length > 1) {
            switch (inversions[1]) {
                case 42: copy[3] -= 12; break;
                case 43: copy[2] -= 12; copy[3] -= 12; break;
                case 65: copy[1] -= 12; copy[2] -= 12; copy[3] -= 12; break;
                case 7:  copy[0] -= 12; copy[1] -= 12; copy[2] -= 12; copy[3] -= 12; break;
            }
        }
    }

    return copy;
}

function randomKeySignature() {
  const mode = Math.random() < 0.5 ? 'major' : 'minor';
  const keyList = mode === 'major' ? majorKeys : minorKeys;
  const key = keyList[Math.floor(Math.random() * keyList.length)];
  return { key, mode };
}

async function randomBig18Chord(key, mode) {
  const response = await fetch('./data/big18.json');
  const rawData = await response.json();

  const chordsToSelect = [];
  const keyKey = mode === 'major' ? 0 : 1;
  const keyData = rawData[keyKey];
  for (const rowKey in keyData) {
    for (const colKey in keyData[rowKey]) {
        const cell = keyData[rowKey][colKey];
        if (cell.big18) {
          chordsToSelect.push(cell);
      }
    }
  }

  const selectedChord = chordsToSelect[Math.floor(Math.random() * chordsToSelect.length)];

  const legitTypes = Object.entries(selectedChord.legitchords)
    .filter(([type, isValid]) => isValid)
    .map(([type]) => type);

  const selectedType = legitTypes[Math.floor(Math.random() * legitTypes.length)];

  const { main, sup, sub, offsetx, offsety } = selectedChord.text;
  
  const { cleanedSup, cleanedSub } = cleanSubSup(selectedType, sup, sub);
  
  const formattedText = {
    main,
    sup: cleanedSup,
    sub: cleanedSub,
    offsetx,
    offsety
  };
  

  const notes = selectedType === 'triad'
    ? selectedChord.notes.slice(0, 3)
    : selectedChord.notes; 

  let invertedNotes = applyInversion(notes, selectedChord.inversions, selectedType);
  const offset = (mode === 'major') ? majorKeys.indexOf(key)*7 : minorKeys.indexOf(key)*7+9;
  invertedNotes = adjust(invertedNotes, offset);
  console.log("inverted notes", invertedNotes);
  return {
    type: selectedType,
    text: formattedText,
    notes: invertedNotes
  };
}

module.exports = {
    applyInversion,
    randomKeySignature,
    randomBig18Chord,
    adjust
};

