export const propertiesVSText = `
attribute vec3 v_pos;
attribute vec3 v_col;
attribute vec3 v_vel;

uniform vec3 v_res;
uniform mat4 m_world;
uniform mat4 m_view;
uniform mat4 m_projection;
uniform float f_t;
uniform int i_mode;
uniform float f_prec;

varying vec3 f_col;
`;