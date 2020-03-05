class DigitalWave {
	canvas;
	signal_name;
	sim_length = 0;
	time_period_width_in_canvas = 100;
	canvas_height = 100;
	waveState = [];
	constructor(id, simlen) {
		this.signal_name = id;
		this.canvas = document.getElementById(id);
		this.sim_length = simlen;
		this.canvas.addEventListener('click', (e) => { this.onCanvasClick(e, this) });
		for (let i = 0; i < simlen; i++) this.waveState[i] = 0;
	}
	drawOnCanvas() {
		var ctx = this.canvas.getContext('2d');
		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		for (let i = 1; i <= this.sim_length; i++) {
			ctx.strokeStyle = "#dddddd";
			ctx.beginPath();
			ctx.moveTo(this.time_period_width_in_canvas * i, 10);
			ctx.lineTo(this.time_period_width_in_canvas * i, this.canvas_height - 10);
			ctx.closePath();
			ctx.stroke();

			ctx.strokeStyle = "#ff0000";
			ctx.beginPath();
			ctx.moveTo(this.time_period_width_in_canvas * (i - 1), this.waveState[i - 1] == 1 ? 10 : this.canvas_height - 10);
			ctx.lineTo(this.time_period_width_in_canvas * (i), this.waveState[i - 1] == 1 ? 10 : this.canvas_height - 10);
			ctx.closePath();
			ctx.stroke();
		}
	}
	onCanvasClick(event, clss) {
		const rect = clss.canvas.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;
		console.log(x, y);
		const tin = parseInt(x / clss.time_period_width_in_canvas);
		clss.waveState[tin] = 1 - clss.waveState[tin];
		console.log(clss.waveState);
		clss.drawOnCanvas();
	}
	SetUp() {
		this.canvas.setAttribute('width', "" + (this.sim_length * this.time_period_width_in_canvas));
		this.canvas.setAttribute('height', '' + this.canvas_height);
		this.canvas.setAttribute("style", "border: 2px solid black");
		var ctx = this.canvas.getContext('2d');
		this.drawOnCanvas();
	}
	generateThisWaveCode() {
		var res = "";
		res += "initial begin \n"
		for (let i = 0; i < this.sim_length; i++) {
			res += "\t#" + (i + 1) + " " + this.signal_name + " = " + this.waveState[i] + "\n";
		}
		res += "end\n";
		return res;
	}
}
