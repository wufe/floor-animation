import { IProgram } from "../../utils/program-interface";
import { ProgramContainer } from "../../utils/program-container";
import { floorVSText } from "./floor.vs";
import { floorFSText } from "./floor.fs";
import { ViewBox } from "../../utils/view-box";
import chroma from "chroma-js";
import { getColor, stringFormat } from "../../utils/utils";
import { Vector3DModel } from "../../models/vector3d";
import { piDefineVSText } from "../../shaders/pi.vs";
import { simplexNoiseVSText } from "../../shaders/simplex-noise.vs";
import { mapVSText } from "../../shaders/map.vs";
import { bodyVSText } from "../../shaders/body.vs";
import { propertiesVSText } from "../../shaders/properties.vs";
import { Mode } from "../../library";

enum Attr {
	POSITION = 'v_pos',
	COLOR    = 'v_col',
	VELOX    = 'v_vel',
}

enum Uni {
	RESOLUTION = 'v_res',
	WORLD      = 'm_world',
	VIEW       = 'm_view',
	PROJECTION = 'm_projection',
	T          = 'f_t',
	MODE 	   = 'i_mode',
	PRECISION  = 'f_prec',
}

export class FloorProgram implements IProgram {
	private _programContainer: ProgramContainer;
	private _vectorsBuffer: WebGLBuffer;
	private _indicesBuffer: WebGLBuffer;

	constructor(
		private _gl: WebGLRenderingContext,
		private _viewBox: ViewBox,
		private _scale: number,
		private _mode: Mode,
		private _precision: number,
	) {}

	get mode() {
		return this._mode;
	}

	set mode(value: Mode) {
		this._mode = value;
	}

	get precision() {
		return this._precision;
	}

	set precision(value: number) {
		this._precision = value;
	}

	get vertexShader() {
		return stringFormat(floorVSText, {
			defines: piDefineVSText,
			functions: `${simplexNoiseVSText}\n${mapVSText}`,
			body: bodyVSText,
			properties: propertiesVSText
		});
	}

	init(): void {
		this.calcGrid();

		this._programContainer = new ProgramContainer<Attr, Uni>(
			this._gl,
			this.vertexShader,
			floorFSText,
			Object.values(Attr),
			Object.values(Uni)
		);
		this._gl.useProgram(this._programContainer.program);

		this._vectorsBuffer = this._gl.createBuffer();
		this._indicesBuffer = this._gl.createBuffer();
		this._gl.enableVertexAttribArray(this._programContainer.attr(Attr.POSITION));
		this._gl.enableVertexAttribArray(this._programContainer.attr(Attr.COLOR));
		this._gl.enableVertexAttribArray(this._programContainer.attr(Attr.VELOX));

		this.updateCamera = true;
		this.updateResolution = true;
		this.updateMode = true;
		this.updatePrecision = true;
	}

	public updateCamera = false;
	public updateResolution = false;
	public updateMode = false;
	public updatePrecision = false;

	update(deltaT: number, T: number): void {
		this._gl.useProgram(this._programContainer.program);

		this._gl.uniform1f(this._programContainer.uni(Uni.T), T);

		if (this.updateResolution) {
			this._gl.uniform3fv(this._programContainer.uni(Uni.RESOLUTION), new Float32Array(this._viewBox.resolutionVec));
			this.updateResolution = false;
		}

		if (this.updateCamera) {
			this._gl.uniformMatrix4fv(this._programContainer.uni(Uni.WORLD), false, this._viewBox.wMat);
			this._gl.uniformMatrix4fv(this._programContainer.uni(Uni.VIEW), false, this._viewBox.vMat);
			this._gl.uniformMatrix4fv(this._programContainer.uni(Uni.PROJECTION), false, this._viewBox.pMat);
			this.updateCamera = false;
		}

		if (this.updateMode) {
			this._gl.uniform1i(this._programContainer.uni(Uni.MODE), this._mode);
			this.updateMode = false;
		}

		if (this.updatePrecision) {
			this._gl.uniform1f(this._programContainer.uni(Uni.PRECISION), this._precision);
			this.updatePrecision = false;
		}

		this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._vectorsBuffer);
		this._gl.bufferData(this._gl.ARRAY_BUFFER, this.vertices, this._gl.STATIC_DRAW);		

		this._gl.vertexAttribPointer(
			this._programContainer.attr(Attr.POSITION),
			3,
			this._gl.FLOAT,
			false,
			9 * Float32Array.BYTES_PER_ELEMENT,
			0,
		);

		this._gl.vertexAttribPointer(
			this._programContainer.attr(Attr.COLOR),
			3,
			this._gl.FLOAT,
			false,
			9 * Float32Array.BYTES_PER_ELEMENT,
			3 * Float32Array.BYTES_PER_ELEMENT,
		);

		this._gl.vertexAttribPointer(
			this._programContainer.attr(Attr.VELOX),
			3,
			this._gl.FLOAT,
			false,
			9 * Float32Array.BYTES_PER_ELEMENT,
			6 * Float32Array.BYTES_PER_ELEMENT,
		);

		this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this._indicesBuffer);
		this._gl.bufferData(this._gl.ELEMENT_ARRAY_BUFFER, this._indices, this._gl.STATIC_DRAW);
	}

	recalculate() {
		this.calcGrid();
	}

	draw(): void {
		this._gl.useProgram(this._programContainer.program);
		this._gl.drawElements(this._gl.TRIANGLES, this.indices.length, this._gl.UNSIGNED_SHORT, 0);
	}

	get scale() {
		return this._scale;
	}

	set scale(value: number) {
		this._scale = value;
		this.calcGrid();
	}

	public cols = 0;
	public rows = 0;

	private calcGrid() {
		this.cols = Math.floor((this._viewBox.width * 2) / this._scale);
		this.rows = Math.floor((this._viewBox.height * 2) / this._scale);

		this.calculateVertices();
		this.calculateVertexIndices();
	}


	private calculateVertices() {
		const color = chroma('#FFF');
		const vertices = new Array(this.cols * this.rows)
			.fill(null)
			.map((_, i) => {
				const row = Math.floor(i / this.cols);
				const col = i % this.cols;
				const shade = getColor(...color.luminance(.01).rgb());
				const x = (col * this._scale) - this._viewBox.width;
				const y = (row * this._scale) - this._viewBox.height;
				const z = Math.random() * (this._viewBox.height / 10) - (this._viewBox.height / 20);
				const velocity = [0, 0, (Math.random() * 0.001) + 0.0005];
				const components = [
					...[x, y, z],
					...shade,
					...velocity,
				];
				return components;
			})
			.reduce((acc, points) => {
				acc.push(...points);
				return acc;
			}, []);
		this._vertices = new Float32Array(vertices);
	}

	private calculateVertexIndices() {
		const indices = new Array(this.cols * this.rows)
			.fill(null)
			.map((_, i) => {
				const row = Math.floor(i / this.cols);
				const col = i % this.cols;
				const nextRow = i + this.cols;
				const nextCol = i +1;
				const nextRowNextCol = nextRow +1;
				const localIndices: number[] = [];
				if (row < this.rows -1 && col < this.cols -1) {
					localIndices.push(...[
						nextRow,
						i,
						nextCol,
						nextRow,
						nextCol,
						nextRowNextCol
					]);
				}
				
				return localIndices;
			})
			.reduce((acc, points) => {
				acc.push(...points);
				return acc;
			}, []);
		this._indices = new Uint16Array(indices);
	}

	private _vertices: Float32Array = new Float32Array([]);
	get vertices() {
		return this._vertices;
	}

	private _indices: Uint16Array = new Uint16Array([]);
	get indices() {
		return this._indices;
	}
}