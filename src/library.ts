import { ViewBox } from "./utils/view-box";
import { IProgram } from "./utils/program-interface";
import { FloorProgram } from "./programs/floor/floor-program";
import { getColor } from "./utils/utils";
import { LinesProgram } from "./programs/lines/lines-program";
import chroma from "chroma-js";

export enum FloorStatus {
	NOT_READY = 0,
	INITIALIZED = 1,
	STARTED = 2,
}

export enum Mode {
	NOISE = 0,
	SIN   = 1,
}

export class FloorAnimationLibrary {

	private _gl: WebGLRenderingContext;
	private _viewBox: ViewBox;
	private _programs: IProgram[] = [];

	private _floorProgram: FloorProgram;
	private _linesProgram: LinesProgram;

	public status: FloorStatus = FloorStatus.NOT_READY;

	constructor(
		private _canvas: HTMLCanvasElement
	) {}

	//#region Properties setters
	private _backgroundColor: number[] = [];
	set backgroundColor(value: string) {
		this._backgroundColor = getColor(...chroma(value).rgb());
	}

	private _pitch: number = 0;
	set pitch(value: number) {
		this._pitch = value;
		if (this._viewBox)
			this._viewBox.pitch = value;
		if (this._floorProgram)
			this._floorProgram.updateCamera = true;
		if (this._linesProgram)
			this._linesProgram.updateCamera = true;
	}

	private _yaw: number = 0;
	set yaw(value: number) {
		this._yaw = value;
		if (this._viewBox)
			this._viewBox.yaw = value;
		if (this._floorProgram)
			this._floorProgram.updateCamera = true;
		if (this._linesProgram)
			this._linesProgram.updateCamera = true;
	}

	private _scale: number;
	set scale(value: number) {
		this._scale = value;
		if (this._floorProgram)
			this._floorProgram.scale = value;
		if (this._linesProgram)
			this._linesProgram.recalculate();
	}

	private _mode: Mode;
	set mode(value: Mode) {
		this._mode = value;
		if (this._floorProgram) {
			this._floorProgram.mode = value;
			this._floorProgram.updateMode = true;
		}
		if (this._linesProgram)
			this._linesProgram.updateMode = true;
	}

	private _precision: number;
	set precision(value: number) {
		this._precision = value;
		if (this._floorProgram) {
			this._floorProgram.precision = value;
			this._floorProgram.updatePrecision = true;
		}
		if (this._linesProgram)
			this._linesProgram.updatePrecision = true;
	}
	//#endregion

	initialize(
		backgroundColor: string,
		pitch          : number,
		yaw            : number,
		scale          : number,
		mode           : Mode,
		precision      : number,
	) {
		this.backgroundColor = backgroundColor;
		const {width, height} = this.initializeCanvas(this._canvas);
		const gl = this.initializeWebGL(this._canvas, width, height);
		this._gl = gl;
		this.pitch = pitch;
		this.yaw = yaw;
		const viewBox = this.initializeViewBox(width, height);
		this._viewBox = viewBox;
		this.scale = scale;
		this._mode = mode;
		this._precision = precision;
		const [floor, lines] = this.createPrograms(gl, viewBox);
		this._floorProgram = floor;
		this._linesProgram = lines;
		this._programs = [floor, lines];
		this.initializePrograms([floor, lines]);
		this.initializeSimulation();
	}

	recalculate() {
		if (!this._viewBox || !this._canvas)
			return;
		const {width, height} = this.initializeCanvas(this._canvas);
		if (width === this._viewBox.width && height === this._viewBox.height)
			return;
		this.updateWebGLDimensions(width, height);
		this._viewBox.width = width;
		this._viewBox.height = height;
		this._viewBox.recalculate();
		if (this._floorProgram)
			this._floorProgram.recalculate();
		if (this._linesProgram)
			this._linesProgram.recalculate();
	}

	private initializeCanvas(canvas: HTMLCanvasElement) {
		const { clientWidth: width, clientHeight: height } = canvas;
		canvas.width = width;
		canvas.height = height;
		return { width, height };
	}

	private initializeWebGL(canvas: HTMLCanvasElement, width: number, height: number) {
		const gl = canvas.getContext('webgl');
		if (!gl)
			throw new Error('webgl not supported');
		gl.viewport(0, 0, width, height);

		gl.enable(gl.DEPTH_TEST);
		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK);
		gl.frontFace(gl.CCW);

		return gl;
	}

	private updateWebGLDimensions(width: number, height: number) {
		if (this._gl)
			this._gl.viewport(0, 0, width, height);
	}

	private initializeViewBox(width: number, height: number) {
		return new ViewBox(width, height, this._pitch, this._yaw);
	}

	private createPrograms(gl: WebGLRenderingContext, viewBox: ViewBox): [FloorProgram, LinesProgram] {
		const floorProgram = new FloorProgram(gl, viewBox, this._scale, this._mode, this._precision);
		const linesProgram = new LinesProgram(gl, viewBox);
		return [floorProgram, linesProgram];
	}

	private initializePrograms(programs: IProgram[]) {
		programs
			.forEach(p => p.init());
		this._linesProgram.setFloorProgram(this._floorProgram);
		this.status = FloorStatus.INITIALIZED;
	}

	private updateAndDraw(deltaT: number, T: number) {
		this._programs
			.forEach(p => {
				p.update(deltaT, T);
				p.draw();
			})
	}

	private _running = true;
	private _lastPerformance = 0;
	private _currentPerformance = 0;
	private _deltaT = 0;

	private initializeSimulation() {
		this._running = true;
		this._lastPerformance = 0;
		this._currentPerformance = performance.now();
		this._deltaT = 1000 / 60 / 1000;

		this.status = FloorStatus.STARTED;
		this.animationLoop();
	}

	private animationLoop = () => {
		this._currentPerformance = performance.now();
		this._deltaT = (this._currentPerformance - this._lastPerformance) / 1000;
		if (this._deltaT > .15)
			this._deltaT = .15;
		this._lastPerformance = this._currentPerformance;

		this._gl.clearColor(this._backgroundColor[0], this._backgroundColor[1], this._backgroundColor[2], 1);
		this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);

		this.updateAndDraw(this._deltaT, this._currentPerformance);

		if (this._running)
			requestAnimationFrame(this.animationLoop);
	}

	
}