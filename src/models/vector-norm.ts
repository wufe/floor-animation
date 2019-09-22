import { Vector3D } from "../types";

export class VectorNorm {
	constructor(private _vec: Vector3D) {}

	get euclidean() {
		const { x, y, z } = this._vec;
		return Math.sqrt(x*x + y*y + z*z);
	}
}