export const mapVSText = `
float constrain(float n, float low, float high) {
	return max(min(n, high), low);
  }

float map(float n, float start1, float stop1, float start2, float stop2) {
	float newval = (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;
	if (start2 < stop2) {
	  return constrain(newval, start2, stop2);
	} else {
	  return constrain(newval, stop2, start2);
	}
  }
`;