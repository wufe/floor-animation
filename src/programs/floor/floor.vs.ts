export const floorVSText = `
{defines}
precision mediump float;

{properties}

{functions}

void main() {
	{body}

	f_col *= .30;

	gl_Position = m_projection * m_view * m_world * vec4(pos.x, pos.y, z, 1.0);
}
`;