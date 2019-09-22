import { IProgram } from "../../utils/program-interface";
import { ProgramContainer } from "../../utils/program-container";
import { ViewBox } from "../../utils/view-box";
import { linesVSText } from "./lines.vs";
import { linesFSText } from "./lines.fs";
import { stringFormat } from "../../utils/utils";
import { piDefineVSText } from "../../shaders/pi.vs";
import { simplexNoiseVSText } from "../../shaders/simplex-noise.vs";
import { mapVSText } from "../../shaders/map.vs";
import { FloorProgram } from "../floor/floor-program";
import { bodyVSText } from "../../shaders/body.vs";
import { propertiesVSText } from "../../shaders/properties.vs";

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

export class LinesProgram implements IProgram {
	private _programContainer: ProgramContainer;
	private _vectorsBuffer: WebGLBuffer;
	private _indicesBuffer: WebGLBuffer;

	constructor(
		private _gl: WebGLRenderingContext,
		private _viewBox: ViewBox,
	) {}

	private _vertices: Float32Array = new Float32Array([]);
	private _indices: Uint16Array = new Uint16Array([]);
	private _floorProgram: FloorProgram;
	setFloorProgram(floorProgram: FloorProgram) {
		this._floorProgram = floorProgram;
		this.recalculate();
	}

	recalculate() {
		const vertices = this._floorProgram.vertices
			.map((v, i) => {
				switch (i % 9) {
					case 0:
					case 1:
					case 2:
					case 6:
					case 7:
					case 8:
						return v;
					case 3:
					case 4:
					case 5:
						return 1;
				}
			});
		this._vertices = new Float32Array(vertices);

		const {cols, rows} = this._floorProgram;
		const indices = new Array(cols * rows)
			.fill(null)
			.map((_, i) => {
				const row = Math.floor(i / cols);
				const col = i % cols;
				const nextRow = i + cols;
				const nextCol = i +1;
				const nextRowNextCol = nextRow +1;
				const ii: number[] = [];
				if (row < rows -1){
					ii.push(nextRow, i);
				}
				if (col < cols -1) {
					ii.push(i, nextCol);
				}
				if (row < rows -1 && col < cols-1) {
					ii.push(nextCol, nextRow);
					ii.push(nextRow, nextCol);
					ii.push(nextCol, nextRowNextCol);
					ii.push(nextRowNextCol, nextRow);
				}
				return ii;
			})
			.reduce((acc, points) => {
				acc.push(...points);
				return acc;
			}, []);
		this._indices = new Uint16Array(indices);
	}

	get vertexShader() {
		return stringFormat(linesVSText, {
			defines: piDefineVSText,
			functions: `${simplexNoiseVSText}\n${mapVSText}`,
			body: bodyVSText,
			properties: propertiesVSText
		});
	}

	init(): void {
		this._programContainer = new ProgramContainer<Attr, Uni>(
			this._gl,
			this.vertexShader,
			linesFSText,
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
			this._gl.uniform1i(this._programContainer.uni(Uni.MODE), this._floorProgram.mode);
			this.updateMode = false;
		}

		if (this.updatePrecision) {
			this._gl.uniform1f(this._programContainer.uni(Uni.PRECISION), this._floorProgram.precision);
			this.updatePrecision = false;
		}

		this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._vectorsBuffer);
		this._gl.bufferData(this._gl.ARRAY_BUFFER, this._vertices, this._gl.STATIC_DRAW);		

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

	draw(): void {
		this._gl.drawElements(this._gl.LINES, this._indices.length, this._gl.UNSIGNED_SHORT, 0);
	}

}