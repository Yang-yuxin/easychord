const { all } = require('core-js/fn/promise');
const fs = require('fs');

function detectInversion(row, col, triad, seventh, base_triad, data){
    var inversions = [];
    var text = {
        main: null,
        sup: null,
        sub: null,
        offsetx: null,
        offsety: null,
    }
    var tmp = row - col;
    while (tmp < 0){
        tmp += 7;
    }
    text['main'] = base_triad[col];
    switch (tmp) {
        case 0:
            if (triad) {
                inversions.push(0);
                
            }
            if (seventh) {
                inversions.push(7);
                if (triad) {
                    text['sup'] = '(7)';
                    text['offsetx'] = 16;
                }
                else{
                    text['sup'] = '7';
                }
            }
            break;
        case 2:
            if (triad) {
                inversions.push(6);
                text['sup'] = '6';
            }
            if (seventh) {
                inversions.push(65);
                text['sup'] = '6';
                if (triad) {
                    text['sub'] = '(5)';
                }
                else{
                    text['sub'] = '5';
                }
            }
            break;
        case 4:
            if (triad) {
                inversions.push(64);
                text['sup'] = '6';
                text['sub'] = '4';
            }
            if (seventh) {
                inversions.push(43);
                text['sup'] = '4';
                text['sub'] = '3';
            }
            break;
        case 6:
            if (seventh) {
                inversions.push(42);
                text['sup'] = '4';
                text['sub'] = '2';
            }
            break;

    }
    data['inversions'] = inversions;
    data['text'] = text;
}

all_data = {
    0: {},
    1: {},
};
const middlec = 60;
major_triad_type = ['maj', 'min', 'min', 'maj', 'dom', 'min', 'hdim'];
minor_triad_type = ['min', 'hdim', 'maj', 'min', 'dom', 'maj', 'dim'];
major_base_triad = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii'];
minor_base_triad = ['i', 'ii', 'III', 'iv', 'V', 'VI', 'vii'];
offset = {
    maj: [0, 4, 7, 11],
    min: [0, 3, 7, 10],
    dim: [0, 3, 6, 9],
    hdim: [0, 3, 6, 10],
    dom: [0, 4, 7, 10]
}
major_note_offset = [0, 2, 4, 5, 7, 9, 11, 12];
minor_note_offset = [0, 2, 3, 5, 7, 8, 10, 12];
var data = {};
var base_triad  = major_base_triad;
for (let i=0; i < 7; i++){
    data[i] = {};
    for (let j=0; j < 7; j++){
        triadis = major_triad_type[j];
        data[i][j] = {
            row: i,
            col: j,
            scaledegree: i,
            basetriad: j,
            big18: false,
            notes: [middlec+major_note_offset[j],
            middlec+offset[triadis][1]+major_note_offset[j],
            middlec+offset[triadis][2]+major_note_offset[j],
            middlec+offset[triadis][3]+major_note_offset[j],
            ],
            legitchords: {
                triad: false,
                seventh: false,
            },
            inversions: [],
            text: {
                main: null,
                sup: null,
                sub: null,
                offsetx: null,
                offsety: null,
            }
        }
        // Define big 18
        switch (i * 10 + j) {
            case 0:
            case 1:
            case 11:
            case 14:
            case 16:
            case 20:
            case 31:
            case 33:
            case 34:
            case 40:
            case 44:
            case 53:
            case 55:
            case 64:
                data[i][j]['big18'] = true;
                break;
            default:
                break;
        }
        // Define inversions
        switch (i * 10 + j) {
            case 0:
                data[i][j]['inversions'].push(0);
                data[i][j]['text']['main'] = base_triad[j];
                break;
            case 1:
                data[i][j]['inversions'].push(42)
                data[i][j]['text']['main'] = base_triad[j];
                data[i][j]['text']['sup'] = '4';
                data[i][j]['text']['sub'] = '2';
                break;
            case 11:
                data[i][j]['inversions'].push(0)
                data[i][j]['inversions'].push(7)
                data[i][j]['text']['main'] = base_triad[j];
                data[i][j]['text']['sup'] = '(7)';
                data[i][j]['text']['offsetx'] = 16;
                break;
            case 14:
                data[i][j]['inversions'].push(43)
                data[i][j]['text']['main'] = base_triad[j];
                data[i][j]['text']['sup'] = '4';
                data[i][j]['text']['sub'] = '3';
                data[i][j]['text']['offsetx'] = 14;
                break;
            case 16:
                data[i][j]['inversions'].push(6)
                data[i][j]['text']['main'] = base_triad[j];
                data[i][j]['text']['sup'] = 'o6';
                data[i][j]['text']['offsetx'] = 21;
                break;
            case 20:
                data[i][j]['inversions'].push(6)
                data[i][j]['text']['main'] = base_triad[j];
                data[i][j]['text']['sup'] = '6';
                data[i][j]['text']['offsetx'] = 10;
                break;
            case 31:
                data[i][j]['inversions'].push(6)
                data[i][j]['inversions'].push(65)
                data[i][j]['text']['main'] = base_triad[j];
                data[i][j]['text']['sup'] = '6';
                data[i][j]['text']['sub'] = '(5)';
                data[i][j]['text']['offsetx'] = 16;
                break;
            case 33:
                data[i][j]['inversions'].push(0)
                data[i][j]['text']['main'] = base_triad[j];
                break;
            case 34:
                data[i][j]['inversions'].push(42)
                data[i][j]['text']['main'] = base_triad[j];
                data[i][j]['text']['sup'] = '4';
                data[i][j]['text']['sub'] = '2';
                data[i][j]['text']['offsetx'] = 14;
                break;
            case 40:
                data[i][j]['inversions'].push(64)
                data[i][j]['text']['main'] = base_triad[j];
                data[i][j]['text']['sup'] = '6';
                data[i][j]['text']['sub'] = '4';
                data[i][j]['text']['offsetx'] = 10;
                break;
            case 44:
                data[i][j]['inversions'].push(0)
                data[i][j]['inversions'].push(7)
                data[i][j]['text']['main'] = base_triad[j];
                data[i][j]['text']['sup'] = '(7)';
                data[i][j]['text']['offsetx'] = 17;
                break;
            case 53:
                data[i][j]['inversions'].push(6)
                data[i][j]['text']['main'] = base_triad[j];
                data[i][j]['text']['sup'] = '6';
                data[i][j]['text']['offsetx'] = 18;
                break;
            case 55:
                data[i][j]['inversions'].push(0)
                data[i][j]['text']['main'] = base_triad[j];
                break;
            case 64:
                data[i][j]['inversions'].push(6)
                data[i][j]['inversions'].push(65)
                data[i][j]['text']['main'] = base_triad[j];
                data[i][j]['text']['sup'] = '6';
                data[i][j]['text']['sub'] = '(5)';
                data[i][j]['text']['offsetx'] = 14;
                break;
            default:
                break;
        }
        // Define chords
        switch (i * 10 + j) {
            case 0:
            case 1:
            case 11:
            case 14:
            case 16:
            case 20:
            case 31:
            case 33:
            case 34:
            case 40:
            case 44:
            case 53:
            case 55:
            case 64:
                data[i][j]['legitchords']['triad'] = true;
                break;
            default:
                break;
        }
        switch (i * 10 + j) {
            case 1:
            case 11:
            case 14:
            case 31:
            case 34:
            case 44:
            case 64:
                data[i][j]['legitchords']['seventh'] = true;
                break;
            default:
                break;
        }
        
    }
   
}
all_data[0] = data;
var base_triad  = minor_base_triad;
var data = {};
for (let i=0; i < 7; i++){
    data[i] = {};
    for (let j=0; j < 7; j++){
        triadis = minor_triad_type[j];
        data[i][j] = {
            row: i,
            col: j,
            scaledegree: i,
            basetriad: j,
            big18: false,
            notes: [middlec+minor_note_offset[j],
            middlec+offset[triadis][1]+minor_note_offset[j],
            middlec+offset[triadis][2]+minor_note_offset[j],
            middlec+offset[triadis][3]+minor_note_offset[j],
            ],
            legitchords: {
                triad: false,
                seventh: false,
            },
            inversions: [],
            text: {
                main: null,
                sup: null,
                sub: null,
                offsetx: null,
                offsety: null,
            }
        }
        // Define big 18
        switch (i * 10 + j) {
            case 0:
            case 1:
            case 11:
            case 14:
            case 16:
            case 20:
            case 31:
            case 33:
            case 34:
            case 40:
            case 44:
            case 53:
            case 55:
            case 64:
                data[i][j]['big18'] = true;
                break;
            default:
                break;
        }
                // Define chords
                switch (i * 10 + j) {
                    case 0:
                    case 1:
                    case 11:
                    case 14:
                    case 16:
                    case 20:
                    case 31:
                    case 33:
                    case 34:
                    case 40:
                    case 44:
                    case 53:
                    case 55:
                    case 64:
                        data[i][j]['legitchords']['triad'] = true;
                        break;
                    default:
                        break;
                }
                switch (i * 10 + j) {
                    case 1:
                    case 11:
                    case 14:
                    case 31:
                    case 34:
                    case 44:
                    case 64:
                        data[i][j]['legitchords']['seventh'] = true;
                        break;
                    default:
                        break;
                }
        // Define inversions
        if (data[i][j]['big18'] === true) {
            detectInversion(i, j, 
                data[i][j]['legitchords']['triad'], 
                data[i][j]['legitchords']['seventh'], 
                base_triad,
                data[i][j]);
        }
        // Specify offsets and special texts
        switch (i * 10 + j) {
            case 20:
                data[i][j]['text']['offsetx'] = 9;
                break;
            case 40:
                data[i][j]['text']['offsetx'] = 9;
                break;
            case 14:
                data[i][j]['text']['offsetx'] = 14;
                break;
            case 34:
                data[i][j]['text']['offsetx'] = 14;
                break;
            case 44:
                data[i][j]['text']['offsetx'] = 17;
                break;
            case 64:
                data[i][j]['text']['offsetx'] = 14;
                break;
            case 1:
                data[i][j]['text']['sup'] = 'ø4';
                data[i][j]['text']['offsetx'] = 16;
                break;
            case 11:
                data[i][j]['text']['sup'] = 'ø7';
                data[i][j]['text']['offsetx'] = 16;
                break;
            case 16:
                data[i][j]['text']['sup'] = 'o6';
                data[i][j]['text']['offsetx'] = 21;
                break;
            case 31:
                data[i][j]['text']['sup'] = 'ø6';
                data[i][j]['text']['offsetx'] = 16;
                break;
            case 53:
                data[i][j]['text']['offsetx'] = 14;
                break;
            default:
                break;
        }

        
    }
   
}
all_data[1] = data;

const dataString = JSON.stringify(all_data, null, 4);

fs.writeFile('big18.json', dataString, (error) => {
  if (error) {
    console.error(error);
  } else {
    console.log('Data written to file');
  }
});
