export interface IProgram {
	init  (): void;
	update(deltaT: number, T: number): void;
	draw  (): void;
}