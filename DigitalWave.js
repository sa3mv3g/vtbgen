const HIGH = 3;
const HiZ = 2;
const X = 1;
const LOW = 0;
const SignalLevelArray = [LOW, X, HiZ, HIGH];

function GetSignalLevel_string_repr(sig) {
	switch (sig) {
		case LOW: return '0';
		case HIGH: return '1';
		case X: return 'x';
		case HiZ: return 'z';
	}
}

var is_array = function (input) {
    if (toString.call(input) === "[object Array]")
        return true;
    return false;
};

class DigitalWave {
	canvas;
	signal_name;
	sim_length = 0;
	time_period_width_in_canvas = 20;
	canvas_height = 100;
	waveState = [];
	time_marking_interval = 10;
	doMarkSignalLevels = true;
	doMarkTime = true;

	selectRange = [];

	constructor(id, simlen) {
		this.signal_name = id;
		this.canvas = document.getElementById(id);
		this.sim_length = simlen;
		this.canvas.addEventListener('mouseup', (e) => {
			if (e.ctrlKey) {
				this.onCanvasCtrlClick(e, this);
			} else {
				this.onCanvasClick(e, this);
			}
		});
		for (let i = 0; i < simlen; i++) this.waveState[i] = LOW;
	}

	copyWaveform(arr){
		let d = this.sim_length > arr.length ? arr.length : this.sim_length;
		for(let i = 0; i < d; i++){
			this.waveState[i] = arr[i];
		}
	}

	highlightOneSelection(e, clss) {
		console.log("sss");
		const rect = clss.canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const tin = parseInt(x / clss.time_period_width_in_canvas);
		var ctx = clss.canvas.getContext('2d');
		ctx.strokeStyle = '#007fff';
		ctx.beginPath();
		ctx.rect(clss.time_period_width_in_canvas * tin, 0, clss.time_period_width_in_canvas, clss.canvas_height);
		ctx.closePath();
		ctx.stroke();
	}

	drawOnCanvas() {
		var ctx = this.canvas.getContext('2d');
		let marginY = 15;
		let paddingY = 5;
		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		for (let i = 1; i <= this.sim_length; i++) {
			//highlight the selected area
			if (this.selectRange.length !== 0) {
				let a = this.selectRange.sort(function (a, b) { return a - b });
				if ((i - 1) >= a[0] && (i - 1) <= a[1]) {
					ctx.fillStyle = '#007fff ';
					ctx.fillRect(this.time_period_width_in_canvas * (i - 1), 0, this.time_period_width_in_canvas, this.canvas_height + marginY + paddingY);
				}
			}

			//draw saperator
			ctx.strokeStyle = "#dddddd";
			ctx.beginPath();
			ctx.moveTo(this.time_period_width_in_canvas * i, marginY + paddingY);
			ctx.lineTo(this.time_period_width_in_canvas * i, this.canvas_height - marginY + paddingY);
			ctx.closePath();
			ctx.stroke();

			// draw signal level
			ctx.strokeStyle = "#ff0000";
			ctx.beginPath();
			switch (this.waveState[i - 1]) {
				case HIGH:
					ctx.moveTo(this.time_period_width_in_canvas * (i - 1), marginY + paddingY);
					ctx.lineTo(this.time_period_width_in_canvas * (i), marginY + paddingY);
					break;
				case LOW:
					ctx.moveTo(this.time_period_width_in_canvas * (i - 1), this.canvas_height - marginY + paddingY);
					ctx.lineTo(this.time_period_width_in_canvas * (i), this.canvas_height - marginY + paddingY);
					break;
				case HiZ:
					ctx.strokeStyle = '#ff8000';
					ctx.moveTo(this.time_period_width_in_canvas * (i - 1), this.canvas_height / 2);
					ctx.lineTo(this.time_period_width_in_canvas * (i), this.canvas_height / 2);
					break;
				case X:
					ctx.moveTo(this.time_period_width_in_canvas * (i - 1), this.canvas_height / 2 - marginY + paddingY);
					ctx.lineTo(this.time_period_width_in_canvas * i, this.canvas_height / 2 - marginY + paddingY);
					ctx.moveTo(this.time_period_width_in_canvas * (i - 1), this.canvas_height / 2 + marginY + paddingY);
					ctx.lineTo(this.time_period_width_in_canvas * i, this.canvas_height / 2 + marginY + paddingY);
					break;
			}
			ctx.closePath();
			ctx.stroke();

			//draw markings 
			ctx.strokeStyle = 'black';
			ctx.textBaseline = "top";
			if (this.doMarkTime && i % this.time_marking_interval === 0) {
				ctx.strokeText('' + parseInt(i - 1), this.time_period_width_in_canvas * (i - 1), this.canvas_height - 5);
			}
			if (this.doMarkSignalLevels) {
				ctx.strokeText(GetSignalLevel_string_repr(this.waveState[i - 1]), this.time_period_width_in_canvas / 2 + this.time_period_width_in_canvas * (i - 1), 5);
			}
			ctx.textBaseline = "bottom";
		}
	}

	onCanvasCtrlClick(event, clss) {
		const rect = clss.canvas.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;
		const tin = parseInt(x / clss.time_period_width_in_canvas);
		if (clss.selectRange.length < 2) {
			clss.selectRange[clss.selectRange.length] = tin;
			if (clss.selectRange.length === 2) clss.drawOnCanvas();
		} else {
			let a = clss.selectRange.sort(function (a, b) { return a - b });
			let sigl = (SignalLevelArray.indexOf(clss.waveState[clss.selectRange[0]]) + 1) % SignalLevelArray.length
			for (let i = clss.selectRange[0]; i <= clss.selectRange[1]; i++) {
				clss.waveState[i] = SignalLevelArray[sigl];
			}
		}
		clss.drawOnCanvas();
	}

	onCanvasClick(event, clss) {
		if (this.selectRange.length !== 0) {
			this.selectRange = [];
		} else {
			const rect = clss.canvas.getBoundingClientRect();
			const x = event.clientX - rect.left;
			const y = event.clientY - rect.top;
			const tin = parseInt(x / clss.time_period_width_in_canvas);
			clss.waveState[tin] = SignalLevelArray[(SignalLevelArray.indexOf(clss.waveState[tin]) + 1) % SignalLevelArray.length];
		}
		clss.drawOnCanvas();
	}

	SetUp() {
		this.canvas.setAttribute('width', "" + (this.sim_length * this.time_period_width_in_canvas));
		this.canvas.setAttribute('height', '' + parseInt(this.canvas_height + 10));
		this.canvas.setAttribute("style", "border: 2px solid black");
		var ctx = this.canvas.getContext('2d');
		this.drawOnCanvas();
	}

	generateThisWaveCode() {
		var res = "";
		res += "initial begin \n"
		for (let i = 0; i < this.sim_length; i++) {
			res += "\t#" + i + " " + this.signal_name + " = " + GetSignalLevel_string_repr(this.waveState[i]) + ";\n";
		}
		res += "end\n";
		return res;
	}

	BuildWaveform(f) {
		if(typeof(f) !== "function" ) return;
		a = f(this.sim_length);
		if(!is_array(a)) return;
		if (a.length === this.sim_length) this.waveState = a;
		else {
			let g = a.length > this.sim_length ? this.sim_length : a.length;
			for (let i = 0; i < g; i++) {
				this.waveState[i] = a[i];
			}
		}
		this.drawOnCanvas();
	}
}
