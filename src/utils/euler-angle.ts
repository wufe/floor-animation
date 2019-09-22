import { Vector3DModel } from "../models/vector3d";

export class EulerAngle extends Vector3DModel {
	constructor(private _angles: {
		pitch: number;
		yaw  : number;
		roll : number;
	}) {
		super({
			x: _angles.pitch,
			y: _angles.yaw,
			z: _angles.roll
		});
	}

	toVector(): Vector3DModel {
		const { x, y, z } = this;
		return new Vector3DModel({
			x: Math.cos(y) * Math.cos(x),
			y: Math.sin(x),
			z: Math.sin(y) * Math.cos(x),
		});
	}
}