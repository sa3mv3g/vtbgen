var DigitalWaveFormManager = {
    DigitalWaveforms: {},
    AddNewWaveForm: function (signal_name, length) {
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
        cn.setAttribute('id', signal_name);
        td3.appendChild(cn);
        td1.appendChild(document.createTextNode(signal_name));
        tr.appendChild(td1);
        tr.appendChild(td3);
        document.getElementById('DigitalWaves').children[0].appendChild(tr);

        let w = new DigitalWave(signal_name, length);
        w.SetUp();
        DigitalWaveFormManager.DigitalWaveforms[signal_name] = w;
        return 1;
    },
    GenerateCodeForAllWaveforms: function () {
        let str = "";
        k = Object.keys(this.DigitalWaveforms);
        for (let i = 0; i < k.length; i++){
            str += this.DigitalWaveforms[k[i]].generateThisWaveCode()
        }
        return str;
    }
}