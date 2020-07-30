const HIGH = 3;
const HiZ = 2;
const X = 1;
const LOW = 0;
const SignalLevelArray = [LOW, X, HiZ, HIGH];

function GetSignalLevel_string_repr(sig) {
	switch (sig) {
		case LOW: return "1'b0";
		case HIGH: return "1'b1";
		case X: return "1'bx";
		case HiZ: return "1'bz";
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
	//Time scale is basically used fore scalling the time in simulation
	// i.e. if an instant of simulation time is written to be 18 then 
	// actual time is 18*TimeScale 
	TimeScale = 1;
	marginY = 15;
	paddingY = 5;
	multi_select_range = 1;
	selectRange = [];

	constructor(id, simlen) {
		this.signal_name = id;
		this.canvas = document.getElementById(id);
		this.sim_length = simlen;
		this.canvas.onselectstart = function () { return false; };
		this.canvas.addEventListener('mouseup', (e) => {
			if (e.ctrlKey) {
				this.onCanvasCtrlClick(e, this);
			} else {
				this.onCanvasClick(e, this);
			}
		});
		this.canvas.addEventListener('mousemove', e => {
			this.highlightFutureSelection(e, this);
		});
		this.canvas.addEventListener('mouseleave', e => {
			this.drawOnCanvas();
		})
		for (let i = 0; i < simlen; i++) this.waveState[i] = LOW;
	}

	copyWaveform(arr) {
		let d = this.sim_length > arr.length ? arr.length : this.sim_length;
		for (let i = 0; i < d; i++) {
			this.waveState[i] = arr[i];
		}
	}
	highlightFutureSelection(e, clss) {
		clss.drawOnCanvas();
		clss.highlightOneSelection(e, clss, e.ctrlKey);
	}
	highlightOneSelection(e, clss, ctrlKey = false) {
		//console.log("sss");
		const rect = clss.canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const tin = parseInt(x / clss.time_period_width_in_canvas);
		var ctx = clss.canvas.getContext('2d');
		ctx.strokeStyle = '#007fff';
		ctx.beginPath();
		if (ctrlKey)
			ctx.rect(clss.time_period_width_in_canvas * tin, 0, clss.time_period_width_in_canvas, clss.canvas_height - clss.marginY + clss.paddingY);
		else
			ctx.rect(clss.time_period_width_in_canvas * tin, 0, clss.time_period_width_in_canvas * clss.multi_select_range, clss.canvas_height - clss.marginY + clss.paddingY);
		ctx.closePath();
		ctx.stroke();
	}

	drawOnCanvas() {
		var ctx = this.canvas.getContext('2d');
		let marginY = this.marginY;
		let paddingY = this.paddingY;
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
			ctx.font = "11px serif";
			if (this.doMarkTime && i % this.time_marking_interval === 0) {
				ctx.strokeText('' + parseInt(i - 1), this.time_period_width_in_canvas * (i - 1), this.canvas_height - 5);
			}
			if (this.doMarkSignalLevels) {
				ctx.strokeText(GetSignalLevel_string_repr(this.waveState[i - 1]), this.time_period_width_in_canvas / 2 + this.time_period_width_in_canvas * (i - 1) - 2, 5);
			}
			ctx.textBaseline = "bottom";
		}
	}

	onCanvasCtrlClick(event, clss) {
		const rect = clss.canvas.getBoundingClientRect();
		const x = (event.clientX - rect.left) ;
		const y = (event.clientY - rect.top) ;
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
		clss.highlightOneSelection(event, clss);
	}

	onCanvasClick(event, clss) {
		if (this.selectRange.length !== 0) {
			this.selectRange = [];
		} else {
			const rect = clss.canvas.getBoundingClientRect();
			const x = (event.clientX - rect.left) ;
			const y = (event.clientY - rect.top) ;
			const tin = parseInt(x / clss.time_period_width_in_canvas);
			let lev = SignalLevelArray[(SignalLevelArray.indexOf(clss.waveState[tin]) + 1) % SignalLevelArray.length];
			for (let i = tin; i < tin + clss.multi_select_range && i < clss.waveState.length; i++)
				clss.waveState[i] = lev;
		}
		clss.drawOnCanvas();
		clss.highlightOneSelection(event, clss);
	}

	SetUp() {
		var width = this.time_period_width_in_canvas * this.sim_length;
		this.canvas.setAttribute('width', width);
		this.canvas.setAttribute('height', this.canvas_height + this.marginY + this.paddingY);
		this.drawOnCanvas();
	}

	generateThisWaveCode() {
		var res = "";
		res += "initial begin \n"
		for (let i = 0; i < this.sim_length; i++) {
			res += "\t#" + this.TimeScale + " " + this.signal_name + " = " + GetSignalLevel_string_repr(this.waveState[i]) + ";\n";
		}
		res += "end\n";
		return res;
	}

	BuildWaveform(f) {
		if (typeof (f) !== "function") return;
		a = f(this.sim_length);
		if (!is_array(a)) return;
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
