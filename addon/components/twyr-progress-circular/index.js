import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import { inject as service } from '@ember/service';
import { isPresent } from '@ember/utils';
import { nextTick } from 'ember-css-transitions/utils/transition-utils';

// #region File Global Variables
const MODE_DETERMINATE = 'determinate';
const MODE_INDETERMINATE = 'indeterminate';
/**
 * T (period) = 1 / f (frequency)
 * TICK = 1 / 60hz = 0,01667s = 17ms
 */
const TICK = 17;
// #endregion

// #region File Global Functions
const cAF = window. cancelAnimationFrame || (function cAF(fn) {
	return clearTimeout(fn, TICK);
});

const linearEase = function linearEase(t, b, c, d) {
	return c * t / d + b;
}

const materialEase = function materialEase(t, b, c, d) {
	// via http://www.timotheegroleau.com/Flash/experiments/easing_function_generator.htm
	// with settings of [0, 0, 1, 1]
	let ts = (t /= d) * t;
	let tc = ts * t;
	return b + c * (6 * tc * ts + -15 * ts * ts + 10 * tc);
}

const now = function now() {
	return new Date().getTime();
}

const rAF = window.requestAnimationFrame || (function rAF(fn) {
	return setTimeout(fn, TICK);
});
// #endregion

export default class TwyrProgressCircularComponent extends Component {
	// #region Services
	@service constants;
	// #endregion

	// #region Private Attributes
	debug = debugLogger('twyr-progress-circular');

	_element = null;
	_iterationCount = 0;
	_lastAnimationId = 0;
	_lastDrawFrame = null;
	_oldDiameter = 50;
	_oldDisabled = false;
	_oldStrokeRatio = 0.1;
	_oldValue = 0;
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion

	// #region Lifecycle Hooks
	@action
	async didInsert(element) {
		this.debug(`didInsert`);
		this._element = element;

		if (this.mode === MODE_INDETERMINATE) {
			this._startIndeterminateAnimation();
		}
		else {
			const newValue = this._clamp(this.args.value, 0, 100);
			this._startDeterminateAnimation(this._oldValue || 0, newValue);
		}

		await nextTick();
		this._redoAnimation.bind(this);
	}

	@action
	didReceiveArgs() {
		this.debug(`didReceiveArgs`);
		this._redoAnimation();
	}

	@action
	didMutate() {
		this.debug(`didMutate`);
		this._redoAnimation();
	}

	willDestroy() {
		if (this._lastDrawFrame) {
			cAF(this._lastDrawFrame);
		}

		super.willDestroy(...arguments);
	}
	// #endregion

	// #region Computed Properties
	get arc() {
		return this._getSvgArc(this.diameter, this.strokeWidth, (this.mode === MODE_INDETERMINATE));
	}

	get containerStyle() {
		return htmlSafe(`width: ${this.diameter}px; height: ${this.diameter}px;`);
	}

	get diameter() {
		if(isPresent(this.args.diameter))
			return this.args.diameter;

		return 50;
	}

	get durationIndeterminate() {
		if(isPresent(this.args.durationIndeterminate))
			return this.args.durationIndeterminate;

		return 1333;
	}

	get easeFnIndeterminate() {
		if(isPresent(this.args.easeFnIndeterminate))
			return this.args.easeFnIndeterminate;

		return materialEase;
	}

	get endIndeterminate() {
		if(isPresent(this.args.endIndeterminate))
			return this.args.endIndeterminate;

		return 149;
	}

	get mode() {
		return isPresent(this.args.value) ? MODE_DETERMINATE : MODE_INDETERMINATE;
	}

	get pathStyle() {
		return htmlSafe(`stroke-width: ${this.strokeWidth}px;`);
	}

	get spinnerClass() {
		return ((this.mode === MODE_DETERMINATE) || (this.mode === MODE_INDETERMINATE)) ? `md-mode-${this.mode}` : 'ng-hide';
	}

	get startIndeterminate() {
		if(isPresent(this.args.startIndeterminate))
			return this.args.startIndeterminate;

		return 1;
	}

	get strokeDasharray() {
		if (this.mode === MODE_INDETERMINATE) {
			return ((this.diameter - this.strokeWidth) * Math.PI * 0.75);
		}

		return ((this.diameter - this.strokeWidth) * Math.PI);
	}

	get strokeRatio() {
		if(isPresent(this.args.strokeRatio))
			return this.args.strokeRatio;

		return 0.1;
	}

	get strokeWidth() {
		return this.strokeRatio * this.diameter;
	}

	get svgStyle() {
		const width = `width: ${this.diameter}px`;
		const height = `height: ${this.diameter}px`;
		const transformOrigin = `transform-origin: ${this.diameter / 2}px ${this.diameter / 2}px ${this.diameter / 2}px`;

		return htmlSafe([width, height, transformOrigin].join('; '));
	}
	// #endregion

	// #region Private Methods
	_clamp(num, min, max) {
		return Math.min(Math.max(num, min), max);
	}

	_getDashLength(diameter, strokeWidth, value, limit) {
		return (diameter - strokeWidth) * Math.PI * ((3 * (limit || 100) / 100) - (value / 100));
	}

	_getSvgArc(diameter, strokeWidth, indeterminate) {
		const radius = diameter / 2;
		const offset = strokeWidth / 2;

		const arcRadius = radius - offset;
		const start = `${radius},${offset}`; // ie: (25, 2.5) or 12 o'clock
		const end = `${offset},${radius}`;   // ie: (2.5, 25) or  9 o'clock

		/* eslint-disable */
		return 'M' + start
				+ 'A' + arcRadius + ',' + arcRadius + ' 0 1 1 ' + end // 75% circle
				+ (indeterminate ? '' : 'A' + arcRadius + ',' + arcRadius + ' 0 0 1 ' + start); // loop to start
		/* eslint-enable */
	}

	_redoAnimation() {
		const newValue = this._clamp(this.args.value, 0, 100);
		const newDisabled = this.args.disabled || (this._element && this._element.hasAttribute('disabled'));

		if(this._element) {
			if(newDisabled && !this._element.classList.contains('_md-progress-circular-disabled'))
				this._element.classList.add('_md-progress-circular-disabled');

			if(!newDisabled && this._element.classList.contains('_md-progress-circular-disabled'))
				this._element.classList.remove('_md-progress-circular-disabled');
		}

		const hasDiameterChanged = (this._oldDiameter !== this.diameter);
		const hasStrokeRatioChanged = (this._oldStrokeRatio !== this.strokeRatio);

		if (this._oldValue !== newValue || hasDiameterChanged || hasStrokeRatioChanged) {
			this._startDeterminateAnimation(this._oldValue || 0, newValue);
			this._oldValue = newValue;
		}

		if (this._oldDisabled !== newDisabled) {
			if (newDisabled && this._lastDrawFrame) {
				cAF(this._lastDrawFrame);
			}
			else if (this.mode === MODE_INDETERMINATE) {
				this._startIndeterminateAnimation();
			}

			this._oldValue = newValue;
			this._oldDisabled = newDisabled;
		}

		this._oldDiameter = this.diameter;
		this._oldStrokeRatio = this.strokeRatio;
	}

	_renderCircle(animateFrom, animateTo, ease = linearEase, animationDuration = 100, iterationCount = 0, dashLimit = 100) {
		if(this.isDestroyed || this.isDestroying)
			return;

		const id = ++this._lastAnimationId;
		const startTime = now();

		const diameter = this.diameter;
		const strokeWidth = this.strokeWidth;

		const changeInValue = animateTo - animateFrom;
		const rotation = -90 * iterationCount;

		const renderFrame = (value, diameter, strokeWidth, dashLimit) => {
			if (this.isDestroyed || this.isDestroying || !this._element)
				return;

			const path = this._element.querySelector('path');
			if (!path) return;

			path.setAttribute('stroke-dashoffset', this._getDashLength(diameter, strokeWidth, value, dashLimit));
			path.setAttribute('transform', `rotate(${rotation} ${diameter / 2} ${diameter / 2})`);
		};

		// No need to animate it if the values are the same
		if (animateTo === animateFrom) {
			renderFrame(animateTo, diameter, strokeWidth, dashLimit);
			return;
		}

		const animation = () => {
			const currentTime = this._clamp(now() - startTime, 0, animationDuration);
			renderFrame(ease(currentTime, animateFrom, changeInValue, animationDuration), diameter, strokeWidth, dashLimit);

			// Do not allow overlapping animations
			if (id === this._lastAnimationId && currentTime < animationDuration) {
				this._lastDrawFrame = rAF(animation);
			}

			if (currentTime >= animationDuration && this.mode === MODE_INDETERMINATE) {
				this._startIndeterminateAnimation();
			}
		};

		this._lastDrawFrame = rAF(animation);
	}

	_startDeterminateAnimation(oldValue, newValue) {
		this._renderCircle(oldValue, newValue);
	}

	_startIndeterminateAnimation() {
		this._renderCircle(this.startIndeterminate, this.endIndeterminate, this.easeFnIndeterminate, this.durationIndeterminate, this._iterationCount, 75);

		// The % 4 technically isn't necessary, but it keeps the rotation
		// under 360, instead of becoming a crazy large number.
		this._iterationCount = ++this._iterationCount % 4;
	}
	// #endregion
}
