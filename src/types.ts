export type Vector2D = {
	x: number;
	y: number;
};

export type Vector3D = Vector2D & {
	z: number;
};

export type Vector4D = Vector3D & {
	w: number;
};

export type Point2D = Vector2D;

export type Point3D = Vector3D;