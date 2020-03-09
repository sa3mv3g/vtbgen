
var DigitalWaveFormManager = {
    DigitalWaveforms: {},
    length: 1,
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
        //chk_inp.appendChild(document.createTextNode("Config"));

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
        DigitalWaveFormManager.DigitalWaveforms[signal_name] = w;
        return 1;
    },
    GenerateCodeForAllWaveforms: function () {
        let str = "";
        k = Object.keys(this.DigitalWaveforms);
        for (let i = 0; i < k.length; i++) {
            str += this.DigitalWaveforms[k[i]].generateThisWaveCode()
        }
        return str;
    },
    GenerateCodeForAllWaveforms2: function () {
        let str = "initial begin\n";
        k = Object.keys(this.DigitalWaveforms);
        for (let i = 0; i < this.length; i++) {
            str += "\t#" + i + " ";
            for (let j = 0; j < k.length; j++) {
                let dw = this.DigitalWaveforms[k[j]];
                str += " " + dw.signal_name + " = " + GetSignalLevel_string_repr(dw.waveState[i]) + ";";
            }
            str += "\n";
        }
        str += 'end'
        return str;
    },
    deleteSignal(id) {
        delete this.DigitalWaveforms[id];
        let a = document.getElementById(id).parentNode.parentNode;
        console.log(a);
        a.parentNode.removeChild(a);
    },
    changeSimulationTime(newLen) {
        let kys = Object.keys(this.DigitalWaveforms);
        this.length = newLen;
        for (let i = 0; i < kys.length; i++) {
            this.DigitalWaveforms[kys[i]].sim_length = newLen;
            this.DigitalWaveforms[kys[i]].SetUp();
        }
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