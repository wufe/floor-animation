import * as React from 'react';
import { FloorAnimationLibrary, FloorStatus, Mode } from './library';

type Props = {
	canvasClassName?: string;
	canvasStyle?: React.CSSProperties;
	listenWindowResize?: boolean;
	resizeDebounceTimeout?: number;
	width?: string;
	height?: string;
	scale?: number;
	pitch?: number;
	yaw?: number;
	color?: string;
	mode?: Mode;
	precision?: number;
}

export class Floor extends React.Component<Props> {

	private _floorAnimationLibrary: FloorAnimationLibrary | null = null;

	initCanvas(canvas: HTMLCanvasElement | null) {
		if (!canvas || this._floorAnimationLibrary)
			return;
		this._floorAnimationLibrary = new FloorAnimationLibrary(canvas);

		const backgroundColor = this.props.color || '#000';
		const pitch = this.props.pitch || 0;
		const yaw = this.props.yaw || 3.05;
		const scale = this.props.scale || 60;
		const mode = this.props.mode === undefined ? Mode.NOISE : this.props.mode;
		const precision = this.props.precision === undefined ? 1 : this.props.precision;
		this._floorAnimationLibrary.initialize(
			backgroundColor,
			pitch,
			yaw,
			scale,
			mode,
			precision,
		);
	}

	private _debounceTimer: number | null = null;
	onWindowResize = () => {
		if (this._debounceTimer !== null) {
			clearTimeout(this._debounceTimer);
		}
		this._debounceTimer = setTimeout(() => {
			this._debounceTimer = null;
			if (this._floorAnimationLibrary)
				this._floorAnimationLibrary.recalculate();
		}, this.props.resizeDebounceTimeout || 200);
	}

	componentDidMount() {
		const listenResize = this.props.listenWindowResize !== undefined ?
			this.props.listenWindowResize : true;
		if (listenResize) {
			window.addEventListener('resize', this.onWindowResize)
		}
	}

	componentWillUnmount() {
		if (this._debounceTimer !== null) {
			clearTimeout(this._debounceTimer);
		}
		window.removeEventListener('resize', this.onWindowResize);
	}

	componentDidUpdate(prevProps: Readonly<Props>) {
		if (this._floorAnimationLibrary &&
			this._floorAnimationLibrary.status >= FloorStatus.INITIALIZED) {
			if (prevProps.scale !== this.props.scale)
				this._floorAnimationLibrary.scale = this.props.scale;
			if (prevProps.yaw !== this.props.yaw)
				this._floorAnimationLibrary.yaw = this.props.yaw;
			if (prevProps.pitch !== this.props.pitch)
				this._floorAnimationLibrary.pitch = this.props.pitch;
			if (prevProps.color !== this.props.color)
				this._floorAnimationLibrary.backgroundColor = this.props.color;
			if (prevProps.mode !== this.props.mode)
				this._floorAnimationLibrary.mode = this.props.mode;
			if (prevProps.precision !== this.props.precision)
				this._floorAnimationLibrary.precision = this.props.precision;
		}
		
	}

	get className() {
		return `${this.props.canvasClassName || ''}`;
	}

	get style(): React.CSSProperties {
		return {
			width: this.props.width || '100%',
			height: this.props.height || '100%',
			...(this.props.canvasStyle || {})
		};
	}

	render = () => {
		return <canvas
			className={this.className}
			style={this.style}
			ref={canvas => this.initCanvas(canvas)}></canvas>
	}
}

export default Floor;