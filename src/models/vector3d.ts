import { Vector3D } from "../types";
import { VectorNorm } from "./vector-norm";

export const ZeroVector = { x: 0, y: 0, z: 0 };

export class Vector3DModel {

	public norm: VectorNorm;

	constructor(private _vec: Vector3D = { ...ZeroVector }) {
		(window as any).Vector3DModel = this.constructor;
		this.norm = new VectorNorm(_vec);
	}

	//#region Components
	get x() {
		return this._vec.x;
	}

	set x(value: number) {
		this._vec.x = value;
	}

	get y() {
		return this._vec.y;
	}

	set y(value: number) {
		this._vec.y = value;
	}

	get z() {
		return this._vec.z;
	}

	set z(value: number) {
		this._vec.z = value;
	}

	get components() {
		return [ this.x, this.y, this.z ];
	}
	//#endregion

	clone() {
		return new Vector3DModel({ ...this._vec });
	}

	add(vector: Vector3D): Vector3DModel;
	add(scalar: number): Vector3DModel
	add(vectorOrScalar: number | Vector3D): Vector3DModel {
		if (typeof vectorOrScalar === 'number') {
			this.x += vectorOrScalar;
			this.y += vectorOrScalar;
			this.z += vectorOrScalar;
		} else {
			this.x += vectorOrScalar.x;
			this.y += vectorOrScalar.y;
			this.z += vectorOrScalar.z;
		}
		return this;
	}
	
	sub(vector: Vector3D) {
		this.x -= vector.x;
		this.y -= vector.y;
		this.z -= vector.z;
		return this;
	}

	div(scalar: number) {
		this.x /= scalar;
		this.y /= scalar;
		this.z /= scalar;
		checkVector(this);
		return this;
	}

	mul(scalar: number) {
		this.x *= scalar;
		this.y *= scalar;
		this.z *= scalar;
		checkVector(this);
		return this;
	}

	biggest() {
		let vec = new Vector3DModel({ ...ZeroVector });
		if (this.x > this.y && this.x > this.z) {
			vec.x = this.x;
		} else if (this.y > this.x && this.y > this.z) {
			vec.y = this.y;
		} else if (this.z > this.x && this.z > this.y) {
			vec.z = this.z;
		}
		return vec;
	}

	dot(vector: Vector3D) {
		return this.x * vector.x + this.y * vector.y + this.z * vector.z;
	}

	// TODO: Verify
	angle(vector: Vector3DModel) {
		return Math.acos(this.dot(vector) / (this.length * vector.length));
	}

	get length() {
		return this.norm.euclidean;
	}

	unit() {
		return this.div(this.length);
	}

	cross(vector: Vector3DModel) {
		const { x, y, z } = this.clone();
		this.x = y * vector.z - z * vector.y;
		this.y = z * vector.x - x * vector.z;
		this.z = x * vector.y - y * vector.x;
		return this;
	}
}

function checkVector(vector: Vector3D) {
	if (isNaN(vector.x) || isNaN(vector.y) || isNaN(vector.z))
		debugger;
}