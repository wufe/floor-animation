export const bodyVSText = `
f_col = v_col;
vec3 pos = v_pos / v_res;

float z = 0.0;
float f_lum = 0.0;
float f_col_z = 0.0;

float speed = f_t * 3.0;

if (i_mode == 0) {
	float f_step = f_t / 1000.0;
	z = snoise(vec2(pos.x * f_prec + f_step, pos.y * f_prec));
	z = map(z, -1.0, 1.0, -.09, .06);
	f_col_z = map(z, -.09, .06, .0, 1.0);
} else {
	z = sin(v_vel.z * speed + pos.x * pos.y);
	z = map(z, -1.0, 1.0, -.03, .03);
	f_col_z = map(z, -.03, .03, .0, 1.0);
}

f_lum = map(f_col_z, .0, 1.0, 0.0, 1.0);

f_col = vec3(f_lum);
`;