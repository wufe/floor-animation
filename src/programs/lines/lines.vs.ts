export const linesVSText = `
{defines}
precision highp float;

{properties}

{functions}

void main() {
	{body}

	z += .002;
	f_col *= .20;

	gl_Position = m_projection * m_view * m_world * vec4(pos.x, pos.y, z, 1.0);
}
`;