import { mat4 } from "gl-matrix";
import { EulerAngle } from "./euler-angle";

export class ViewBox {

	private _wMat = mat4.create();
	private _vMat = mat4.create();
	private _pMat = mat4.create();

	private _eulerAngle: EulerAngle;

	private _zoom = .5;

	constructor(
		public width: number,
		public height: number,
		private _pitch: number,
		private _yaw: number,
	) {
		this.calculate();	
	}

	calculate() {
		this._eulerAngle = new EulerAngle({
			pitch: this._pitch,
			roll: 0,
			yaw: this._yaw
		})
		//mat4.identity(this._wMat)
		mat4.lookAt(this._vMat, this.eulerVec, [0, 0, 0], [0, 0, 1]);
		mat4.perspective(this._pMat, Math.PI / 4, this.width / this.height, .00001, 10);
	}

	recalculate() {
		this.calculate();
	}

	set pitch(value: number) {
		this._pitch = value;
		this.recalculate();
		// this._eulerAngle = new EulerAngle({
		// 	pitch: value,
		// 	roll: this._eulerAngle.z,
		// 	yaw: this._eulerAngle.y
		// });
		// mat4.lookAt(this._vMat, this.eulerVec, [0, 0, 0], [0, 0, 1]);
	}

	set yaw(value: number) {
		this._yaw = value;
		this.recalculate();
		// this._eulerAngle = new EulerAngle({
		// 	pitch: this._eulerAngle.x,
		// 	roll: this._eulerAngle.z,
		// 	yaw: value
		// });
		// mat4.lookAt(this._vMat, this.eulerVec, [0, 0, 0], [0, 0, 1]);
	}

	get wMat() {
		return this._wMat;
	}

	get vMat() {
		return this._vMat;
	}

	get pMat() {
		return this._pMat;
	}

	get eulerVec() {
		return this._eulerAngle.toVector().mul(this._zoom).components;
	}

	get resolutionVec() {
		return [
			this.width,
			this.height,
			Math.max(this.width, this.height),
		]
	}
}