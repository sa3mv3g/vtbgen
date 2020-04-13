var objTracker = {
    pointer_index: 0,
    save: function (obj) {
        let str = JSON.stringify(obj);
        sessionStorage.setItem(this.pointer_index, str);
        this.pointer_index++;
    },
    undo: function () {
        if (this.pointer_index - 1 > 0)
            this.pointer_index -= 1;
        return JSON.parse(sessionStorage.getItem(this.pointer_index - 1));
    },
    redo: function () {
        if (this.pointer_index < sessionStorage.length)
            this.pointer_index += 1;
        return JSON.parse(sessionStorage.getItem(this.pointer_index - 1));
    }
}


var DigitalWaveFormManager = {
    DigitalWaveforms: {},
    length: 1,
    global_TimeScale: 1,
    AddNewWaveForm: function (signal_name, vals = null) {
        k = Object.keys(this.DigitalWaveforms);
        // return if signal with same name already exists
        for (let i = 0; i < k.length; i++) if (k[i] === signal_name) return 0;

        // the following code was tried atleast on firefox on 6 mar 2020 and didn't worked.. there was some bug. hence the longer approach was used
        // document.getElementById('DigitalWaves').children[0].innerHTML +=
        //     `<tr> 
        //     <td>`+ signal_name + `</td>
        //     <td> <button onclick = "DigitalWaveFormManager.DigitalWaveforms['`+ signal_name + `'].generateThisWaveCode()">Generate Code</button> </td>
        //     <td> <canvas id="`+ signal_name + `"> </canvas> </td>
        // </tr>`;
        let tr = document.createElement('tr');
        let td1 = document.createElement('td');
        let td2 = document.createElement('td');
        let td3 = document.createElement('td');
        let cn = document.createElement('canvas');

        let chk_inp = document.createElement("input");
        chk_inp.setAttribute("type", "checkbox");
        chk_inp.setAttribute("class", "forSelection");
        chk_inp.addEventListener("click", e => {
            if (e.target.checked) {
                e.target.parentNode.parentNode.classList.add("waveSelected");
            } else {
                e.target.parentNode.parentNode.classList.remove("waveSelected");
            }
        });

        td2.appendChild(chk_inp);
        cn.setAttribute('id', signal_name);
        td3.appendChild(cn);
        td3.style.padding = '5px';
        td1.appendChild(document.createTextNode(signal_name));
        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        document.getElementById('DigitalWaves').children[0].appendChild(tr);
        let w = new DigitalWave(signal_name, this.length);
        if (vals && is_array(vals)) w.copyWaveform(vals);
        w.SetUp();
        w.TimeScale = this.global_TimeScale;
        DigitalWaveFormManager.DigitalWaveforms[signal_name] = w;
        return 1;
    },
    // depereciated DO NOT use this function
    GenerateCodeForAllWaveforms: function () {
        let str = "";
        k = Object.keys(this.DigitalWaveforms);
        for (let i = 0; i < k.length; i++) {
            str += this.DigitalWaveforms[k[i]].generateThisWaveCode()
        }
        return str;
    },
    // depereciated DO NOT use this function
    GenerateCodeForAllWaveforms2: function () {
        let str = "initial begin\n";
        k = Object.keys(this.DigitalWaveforms);
        for (let i = 0; i < this.length; i++) {
            str += "\t#" + this.global_TimeScale + " ";
            for (let j = 0; j < k.length; j++) {
                let dw = this.DigitalWaveforms[k[j]];
                str += " " + dw.signal_name + " = " + GetSignalLevel_string_repr(dw.waveState[i]) + ";";
            }
            str += "\n";
        }
        str += 'end'
        return str;
    },
    GenerateCodeForAllWaveforms3: function () {

    },
    deleteSignal: function (id) {
        delete this.DigitalWaveforms[id];
        let a = document.getElementById(id).parentNode.parentNode;
        //console.log(a);
        a.parentNode.removeChild(a);
    },
    refreshDocument: function () {
        let kys = Object.keys(this.DigitalWaveforms);
        let waveforms = this.DigitalWaveforms;
        for (let i = 0; i < kys.length; i++) {
            let id = waveforms[kys[i]].signal_name;
            let vals = waveforms[kys[i]].waveState;
            this.deleteSignal(id);
            this.AddNewWaveForm(id, vals);
        }
    },
    quickRefresh: function(){
        let kys = Object.keys(this.DigitalWaveforms);
        let waveforms = this.DigitalWaveforms;
        for(let i=0;i<kys.length;i++){
            waveforms[kys[i]].drawOnCanvas();
        }
    },
    changeRatio:function(r){
        let kys = Object.keys(this.DigitalWaveforms);
        let waveforms = this.DigitalWaveforms;
        for(let i=0;i<kys.length;i++){
            waveforms[kys[i]].pixel_ratio = r;
            waveforms[kys[i]].drawOnCanvas();
        }
    },
    changeSimulationTime: function (newLen) {
        let kys = Object.keys(this.DigitalWaveforms);
        this.length = newLen;
        for (let i = 0; i < kys.length; i++) {
            this.DigitalWaveforms[kys[i]].sim_length = newLen;
            let wf = this.DigitalWaveforms[kys[i]].waveState;
            for (let j = 0; j < newLen; j++) {
                this.DigitalWaveforms[kys[i]].waveState[j] = LOW;
            }
            this.DigitalWaveforms[kys[i]].copyWaveform(wf);
            this.DigitalWaveforms[kys[i]].SetUp();
        }
    },
    Save: function () {
        objTracker.save(this.DigitalWaveforms);
    },
    undo: function () {
        this.DigitalWaveforms = objTracker.undo();
        this.refreshDocument();
    },
    redo: function () {
        this.DigitalWaveforms = objTracker.redo();
        this.refreshDocument();
    }
}

function ChangeAllCheckBox(e) {
    let value = e.checked;
    let inps = document.getElementsByClassName('forSelection');
    for (let i = 0; i < inps.length; i++) {
        inps[i].checked = value;
        if (value)
            inps[i].parentNode.parentNode.classList.add("waveSelected");
        else
            inps[i].parentNode.parentNode.classList.remove("waveSelected");
    }
}

function getSelectedCanvas() {
    let waves = document.getElementsByClassName("waveSelected");
    var cans = [];
    for (let i = 0; i < waves.length; i++) {
        cans.push(waves[i].getElementsByTagName('canvas')[0]);
    }
    return cans;
}

function newSignal(name = null) {
    let sn = '';
    if (!name) {
        do { sn = prompt("Signal Name (Unique)"); }
        while (DigitalWaveFormManager.AddNewWaveForm(sn) === 0)
    } else {
        DigitalWaveFormManager.AddNewWaveForm(name);
    }
}

function _deleteSignal(id) {
    delete DigitalWaveFormManager.DigitalWaveforms[id];
    let a = document.getElementById(id).parentNode.parentNode;
    console.log(a);
    a.parentNode.removeChild(a);
}

function deleteSignal() {
    var s = getSelectedCanvas();
    for (let i = 0; i < s.length; i++) {
        console.log(s[i]);
        DigitalWaveFormManager.deleteSignal(s[i].id);
    }
}

function renameSignal() {
    let canvas = getSelectedCanvas();
    for (let i = 0; i < canvas.length; i++) {
        can = canvas[i];
        let name = prompt("New Name for " + can.id);
        if (name === null) continue;
        let prev_wave_form = DigitalWaveFormManager.DigitalWaveforms[can.id].waveState;
        DigitalWaveFormManager.deleteSignal(can.id);
        DigitalWaveFormManager.AddNewWaveForm(name, prev_wave_form);
    }
}

function ChangeSimulationTime() {
    let nl = prompt("Simulation Time: ", DigitalWaveFormManager.length);
    if (nl)
        DigitalWaveFormManager.changeSimulationTime(nl);
}

function ToogleTimeMarkings() {
    let cans = getSelectedCanvas();
    for (let i = 0; i < cans.length; i++) {
        let obj = DigitalWaveFormManager.DigitalWaveforms[cans[i].id];
        obj.doMarkTime = !obj.doMarkTime;
        obj.drawOnCanvas();
    }
}

function ToggleSignalLevelMarkings() {
    let cans = getSelectedCanvas();
    for (let i = 0; i < cans.length; i++) {
        let obj = DigitalWaveFormManager.DigitalWaveforms[cans[i].id];
        obj.doMarkSignalLevels = !obj.doMarkSignalLevels;
        obj.drawOnCanvas();
    }
}

function changeMarkingIntervals() {
    let int = parseInt(prompt("New Marking Interval: (number)"));
    let cans = getSelectedCanvas();
    for (let i = 0; i < cans.length; i++) {
        let obj = DigitalWaveFormManager.DigitalWaveforms[cans[i].id];
        obj.time_marking_interval = int;
        obj.drawOnCanvas();
    }
}


function ConvertToClockSignal() {
    let tp = parseInt(prompt("Half Time Period: "));
    if (!tp) {
        alert("Got invalid Input");
        return;
    }
    a = [];
    let vv = HIGH;
    for (let i = 0; i < DigitalWaveFormManager.length; i++) {
        let ss = i % tp;
        if (!ss) vv = vv == LOW ? HIGH : LOW;
        a.push(vv);
    }
    getSelectedCanvas().forEach((item, id) => {
        DigitalWaveFormManager.DigitalWaveforms[item.id].copyWaveform(a);
        DigitalWaveFormManager.DigitalWaveforms[item.id].drawOnCanvas();
    });
}

function InvertWaveForm() {
    getSelectedCanvas().forEach((item, id) => {
        let ww = DigitalWaveFormManager.DigitalWaveforms[item.id];
        let wf = ww.waveState;
        wf.forEach((element, index) => {
            if (element === HIGH) wf[index] = LOW;
            if (element === LOW) wf[index] = HIGH;
        });
        ww.copyWaveform(wf);
        ww.drawOnCanvas();
    });
}

function ShiftWaveLeft() {
    getSelectedCanvas().forEach(item => {
        let ww = DigitalWaveFormManager.DigitalWaveforms[item.id];
        let wf = ww.waveState;
        for (let i = 1; i < wf.length; i++) {
            wf[i - 1] = wf[i];
        }
        wf[wf.length - 1] = LOW;
        ww.copyWaveform(wf);
        ww.drawOnCanvas();
    });
}

function ArthematicShiftWaveRight() {
    getSelectedCanvas().forEach(item => {
        let ww = DigitalWaveFormManager.DigitalWaveforms[item.id];
        let wf = ww.waveState;
        let vv = wf[0];
        for (let i = 0; i < wf.length - 1; i++) {
            let gg = wf[i + 1];
            wf[i + 1] = vv;
            vv = gg;
        }
        ww.copyWaveform(wf);
        ww.drawOnCanvas();
    });
}

function generateCode() {
    var s = DigitalWaveFormManager.GenerateCodeForAllWaveforms2();
    let win = window.open("", "Verilog Code", "_blank");
    win.document.body.innerText = (s);
}

function changeMultiselectrange() {
    var cans = getSelectedCanvas();
    for (let i = 0; i < cans.length; i++) {
        let a = parseInt(prompt("Enter new range", DigitalWaveFormManager.DigitalWaveforms[cans[i].id].multi_select_range));
        if(a == 0 || a > DigitalWaveFormManager.length) continue;
        DigitalWaveFormManager.DigitalWaveforms[cans[i].id].multi_select_range = a;
    }   
}

function refresh() {
    DigitalWaveFormManager.refreshDocument();
}

function Save() {
    DigitalWaveFormManager.Save();
}

function Redo() {
    DigitalWaveFormManager.redo();
}

function Undo() {
    DigitalWaveFormManager.undo();
}

function keyboardShortcut(e) {
    if (e.ctrlKey) {
        switch (e.which) {
            //b
            case 66: generateCode(); break;
            //y
            case 89: Redo(); break;
            //z
            case 90: Undo(); break;
        }
    }
    //console.log(e.which);
    //r = 82
    //s * 83
    //z = 90
    //y = 89
    //a = 65
    //b = 66
}