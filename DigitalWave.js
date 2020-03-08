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

class DigitalWave {
	canvas;
	signal_name;
	sim_length = 0;
	time_period_width_in_canvas = 20;
	canvas_height = 100;
	waveState = [];
	marking_interval = 10;
	doMarkSignalLevels = true;
	doMarkTime = true;

	constructor(id, simlen) {
		this.signal_name = id;
		this.canvas = document.getElementById(id);
		this.sim_length = simlen;
		this.canvas.addEventListener('click', (e) => { this.onCanvasClick(e, this) });
		for (let i = 0; i < simlen; i++) this.waveState[i] = X;
	}

	drawOnCanvas() {
		var ctx = this.canvas.getContext('2d');
		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		for (let i = 1; i <= this.sim_length; i++) {
			//draw saperator
			ctx.strokeStyle = "#dddddd";
			ctx.beginPath();
			ctx.moveTo(this.time_period_width_in_canvas * i, 10);
			ctx.lineTo(this.time_period_width_in_canvas * i, this.canvas_height - 10);
			ctx.closePath();
			ctx.stroke();

			// draw signal level
			ctx.strokeStyle = "#ff0000";
			ctx.beginPath();
			switch (this.waveState[i - 1]) {
				case HIGH:
					ctx.moveTo(this.time_period_width_in_canvas * (i - 1), 10);
					ctx.lineTo(this.time_period_width_in_canvas * (i), 10);
					break;
				case LOW:
					ctx.moveTo(this.time_period_width_in_canvas * (i - 1), this.canvas_height - 10);
					ctx.lineTo(this.time_period_width_in_canvas * (i), this.canvas_height - 10);
					break;
				case HiZ:
					ctx.strokeStyle = '#ff8000';
					ctx.moveTo(this.time_period_width_in_canvas * (i - 1), this.canvas_height / 2);
					ctx.lineTo(this.time_period_width_in_canvas * (i), this.canvas_height / 2);
					break;
				case X:
					ctx.moveTo(this.time_period_width_in_canvas * (i - 1), this.canvas_height / 2 - 10);
					ctx.lineTo(this.time_period_width_in_canvas * i, this.canvas_height / 2 - 10);
					ctx.moveTo(this.time_period_width_in_canvas * (i - 1), this.canvas_height / 2 + 10);
					ctx.lineTo(this.time_period_width_in_canvas * i, this.canvas_height / 2 + 10);
					break;
			}
			ctx.closePath();
			ctx.stroke();

			//draw markings 
			ctx.strokeStyle = 'black';
			if (this.doMarkTime && i % this.marking_interval === 0) {
				ctx.strokeText('' + parseInt(i - 1), this.time_period_width_in_canvas * (i - 1), this.canvas_height + 2);
			}
			if (this.doMarkSignalLevels) {
				ctx.textBaseline = "top";
				ctx.strokeText(GetSignalLevel_string_repr(this.waveState[i - 1]), this.time_period_width_in_canvas / 2 + this.time_period_width_in_canvas * (i - 1), 0);
				ctx.textBaseline = "bottom";
			}
		}
	}

	onCanvasClick(event, clss) {
		const rect = clss.canvas.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;
		console.log(x, y);
		const tin = parseInt(x / clss.time_period_width_in_canvas);
		clss.waveState[tin] = SignalLevelArray[(SignalLevelArray.indexOf(clss.waveState[tin]) + 1) % SignalLevelArray.length];
		console.log(clss.waveState);
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

	// BuildWaveform(f) {
	// 	a = f(this.sim_length);
	// 	if (a.length === this.sim_length) this.waveState = a;
	// 	else {
	// 		let g = a.length > this.sim_length ? this.sim_length : a.length;
	// 		for (let i = 0; i < g; i++) {
	// 			this.waveState[i] = a[i];
	// 		}
	// 	}
	// 	this.drawOnCanvas();
	// }
}
