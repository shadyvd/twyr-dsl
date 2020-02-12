import Modifier from 'ember-modifier';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';
import { nextTick } from 'ember-css-transitions/utils/transition-utils';
import { run } from '@ember/runloop';
import { supportsPassiveEventListeners } from 'twyr-dsl/utils/browser-features';

export default class DoesRippleModifier extends Modifier {
	// #region Private Attributes
	debug = debugLogger('twyr-will-ripple-modifier');
	_rippleElement = null;
	_rippleContainer = null;

	_ripples = [];

	_lastRipple = null;
	_timeout = null;
	_mouseDown = null;
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion

	// #region Lifecycle Hooks
	didInstall() {
		super.didInstall(...arguments);
		this.debug(`didInstall: `, this.args);

		// Get the Ripple Element and initialize it
		this._rippleElement = this.element.querySelector(this.rippleContainerSelector) || this.element;
		this._rippleElement.classList.add('md-ink-ripple');

		// Create the Ripple container
		this._rippleContainer = document.createElement('div');
		this._rippleContainer.classList.add('md-ripple-container');

		// Attach the Ripple container to the element
		this._rippleElement.appendChild(this._rippleContainer);

		// Bind events
		this._rippleElement.addEventListener('mousedown', this.onMouseDown, true);
		this._rippleElement.addEventListener('mouseup', this.onMouseUp, true);
		this._rippleElement.addEventListener('mouseleave', this.onMouseUp, true);

		const options = supportsPassiveEventListeners ? { 'passive': true } : false;
		this._rippleElement.addEventListener('touchend', this.onMouseUp, options);
		this._rippleElement.addEventListener('touchmove', this.onTouchMove, options);
	}

	willRemove() {
		const options = supportsPassiveEventListeners ? { 'passive': true } : false;
		this._rippleElement.removeEventListener('touchmove', this.onTouchMove, options);
		this._rippleElement.removeEventListener('touchend', this.onMouseUp, options);

		this._rippleElement.removeEventListener('mouseleave', this.onMouseUp, true);
		this._rippleElement.removeEventListener('mouseup', this.onMouseUp, true);
		this._rippleElement.removeEventListener('mousedown', this.onMouseDown, true);

		this.debug(`willRemove`);
		super.willRemove(...arguments);
	}
	// #endregion

	// #region DOM Event Handlers
	@action
	onMouseDown(event) {
		this.debug('onMouseDown: ', event);
		if(this._mouseDown) return;

		this._mouseDown = true;
		if(event.hasOwnProperty('originalEvent'))
			event = event.originalEvent;

		if(this.args.named.center === true) {
			this.createRipple(this._rippleContainer.clientWidth / 2, this._rippleContainer.clientWidth / 2);
			return;
		}

		if(event.srcElement === this._rippleElement) {
			this.createRipple(event.offsetX, event.offsetY);
			return;
		}

		let layerRect = this._rippleElement.getBoundingClientRect();
		let layerX = event.clientX - layerRect.left;
		let layerY = event.clientY - layerRect.top;

		this.createRipple(layerX, layerY);
	}

	@action
	async onMouseUp(event) {
		this.debug('onMouseUp: ', event);
		if(!(this._mouseDown || this._lastRipple))
			return;

		this._mouseDown = false;

		await nextTick();
		this.clearRipples();
	}

	@action
	async onTouchMove(event) {
		this.debug('onTouchMove: ', event);
		if(!(this._mouseDown || this._lastRipple))
			return;

		this._mouseDown = false;

		await nextTick();
		this.deleteRipples();
	}
	// #endregion

	// #region Computed Properties
	get fitRipple() {
		if((this.args.named.fitRipple !== null) && (this.args.named.fitRipple !== undefined)) {
			this.debug(`fitRipple: `, this.args.named.fitRipple);
			return this.args.named.fitRipple;
		}

		this.debug(`fitRipple: false`);
		return false;
	}

	get isRippleAllowed() {
		if(this.rippleInk === false) {
			this.debug(`isRippleAllowed::rippleInk: false`);
			return false;
		}

		let element = this._rippleElement;
		do {
			if(!element.tagName || (element.tagName.toUpperCase() === 'BODY'))
				break;

			if(element.hasAttribute('disabled')) {
				this.debug(`isRippleAllowed::element::disabled: false`);
				return false;
			}

			element = element.parentNode;
		} while(element);

		this.debug(`isRippleAllowed: true`);
		return true;
	}

	get rippleInk() {
		if(this.args.named.noInk === true) {
			this.debug(`rippleInk: false`);
			return false;
		}

		this.debug(`rippleInk: ${this.args.named.inkColor || ''}`);
		return (this.args.named.inkColor || '');
	}

	get elementColor() {
		this.debug(`elementColor: ${window.getComputedStyle(this._rippleElement).color || 'rgb(0,0,0)'}`);
		return (window.getComputedStyle(this._rippleElement).color || 'rgb(0,0,0)');
	}

	get rippleColor() {
		this.debug(`rippleColor: ${this.parseColor(this.rippleInk) || this.parseColor(this.elementColor)}`);
		return (this.parseColor(this.rippleInk) || this.parseColor(this.elementColor));
	}

	get rippleContainerSelector() {
		this.debug(`rippleContainerSelector: ${this.args.named.rippleContainerSelector || '.md-container'}`);
		return (this.args.named.rippleContainerSelector || '.md-container');
	}
	// #endregion

	// #region Ripple Management Private Methods
	clearRipples() {
		for(let idx = 0; idx < this._ripples.length; idx++) {
			this.fadeInComplete(this._ripples[idx]);
		}
	}

	deleteRipples() {
		for(let idx = 0; idx < this._ripples.length; idx++) {
			this._ripples[idx].remove();
		}
	}

	async createRipple(left, top) {
		if(!this.isRippleAllowed)
			return;

		// Basic Ripple element
		const ripple = document.createElement('div');
		ripple.classList.add('md-ripple');

		// Calculate Ripple dimensions
		const width = this._rippleElement.clientWidth;
		const height = this._rippleElement.clientHeight;
		const x = Math.max(Math.abs(width - left), left) * 2;
		const y = Math.max(Math.abs(height - top), top) * 2;

		const size = this.fitRipple ? Math.max(x, y) : Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
		const color = this.rippleColor;

		const rippleCss = `
			left: ${left}px;
			top: ${top}px;
			background: 'black';
			width: ${size}px;
			height: ${size}px;
			background-color: ${color ? color.replace('rgba', 'rgb').replace(/,[^),]+\)/, ')') : 'rgb(0,0,0)'};
			border-color: ${color ? color.replace('rgba', 'rgb').replace(/,[^),]+\)/, ')') : 'rgb(0,0,0)'}
		`;

		// Setup the Ripple
		ripple.style.cssText = rippleCss;
		this._lastRipple = ripple;

		// Add it to the DOM, Collections, etc.
		if(this.args.named.dimBackground === true) {
			this._rippleContainer.style.cssText = `background-color: ${color}`;
		}

		this._rippleContainer.appendChild(ripple);
		this._ripples.push(ripple);

		// Ripple polish
		ripple.classList.add('md-ripple-placed');

		// Run the Ripple
		this.clearTimeout();
		this._timeout = run.later(this, () => {
			this.clearTimeout();

			if(this._mouseDown)
				return;

			this.fadeInComplete(ripple);
		}, {}, 100);

		// Finish it off
		await nextTick();
		ripple.classList.add('md-ripple-scaled', 'md-ripple-active');
		run.later(this, () => {
			this.clearRipples();
		}, {}, 400);
	}

	removeRipple(ripple) {
		if(!this._ripples.includes(ripple))
			return;

		ripple.classList.remove('md-ripple-active');
		ripple.classList.add('md-ripple-remove');

		this._ripples.splice(this._ripples.indexOf(ripple), 1);
		if(!this._ripples.length) this._rippleContainer.style.backgroundColor = '';

		run.later(this, () => {
			ripple.parentNode.removeChild(ripple);
			ripple.remove();

			this._lastRipple = null;
		}, {}, 100);
	}
	// #endregion

	// #region Private Methods
	clearTimeout() {
		if(!this._timeout)
			return;

		run.cancel(this._timeout);
		this._timeout = null;
	}

	fadeInComplete(ripple) {
		if(this._lastRipple !== ripple) {
			this.removeRipple(ripple);
			return;
		}

		if(!this._timeout && !this._mouseDown) {
			this.removeRipple(ripple);
			return;
		}
	}

	parseColor(color) {
		this.debug(`parseColor: ${color}`);
		if(!color) return;

		function hexToRGBA(color) {
			let hex = color[0] === '#' ? color.substr(1) : color;
			let dig = hex.length / 3;
			let red = hex.substr(0, dig);
			let green = hex.substr(dig, dig);
			let blue = hex.substr(dig * 2);
			if(dig === 1) {
				red += red;
				green += green;
				blue += blue;
			}

			return `rgba(${parseInt(red, 16)}, ${parseInt(green, 16)}, ${parseInt(blue, 16)}, 0.1)`;
		}

		if(color.indexOf('rgba') === 0) {
			this.debug(`parseColor::rgba: ${color.replace(/\d?\.?\d*\s*\)\s*$/, `0.1)`)}`);
			return color.replace(/\d?\.?\d*\s*\)\s*$/, `0.1)`);
		}

		if(color.indexOf('rgb') === 0) {
			this.debug(`parseColor::rgb: ${color.replace(')', ', 0.1)').replace('(', 'a(')}`);
			return color.replace(')', ', 0.1)').replace('(', 'a(');
		}

		if(color.indexOf('#') === 0) {
			const rgbaColor = hexToRGBA(color);

			this.debug(`parseColor::#: ${rgbaColor}`);
			return rgbaColor;
		}

		return color;
	}
	// #endregion
}
