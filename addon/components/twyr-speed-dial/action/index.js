import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import { run } from '@ember/runloop';
import { tracked } from '@glimmer/tracking';

// #region File Global Functions
const getElementIndex = function getElementIndex(node) {
	let index = 0;

	while ((node = node.previousElementSibling)) {
		index++;
	}

	return index;
}
// #endregion

export default class TwyrSpeedDialActionComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('twyr-speed-dial-action');

	_element = null;
	// #endregion

	// #region Tracked Attributes
	@tracked _elementDidRender = false;
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion

	// #region Lifecycle Hooks
	@action
	didInsert(element) {
		this.debug(`didInsert`);
		this._element = element;

		run.next(() => {
			if (this.isDestroying || this.isDestroyed)
				return;

			this._elementDidRender = true;
		});
	}
	// #endregion

	// #region Private Methods
	get computedStyle() {
		if(!this._element || !this._elementDidRender) {
			this.debug(`_computedStyle::_elementDidRender: ${!this._elementDidRender}`);
			return undefined;
		}

		const animation = this.args.speedDial.animationClass;
		const open = this.args.speedDial.isOpen;

		if(animation === 'md-fling') {
			if(open) {
				this.debug(`_computedStyle::animation::md-fling::open: true`);
				return undefined;
			}

			const compStyle = this._flingClosed();
			this.debug(`_computedStyle::animation::md-fling::style: ${compStyle}`);

			return compStyle;
		}

		if (animation === 'md-scale') {
			const compStyle = this._scaleClosed();
			this.debug(`_computedStyle::animation::md-scale::style: ${compStyle}`);

			return compStyle;
		}

		this.debug(`_computedStyle: undefined`);
		return undefined;
	}

	_flingClosed() {
		const triggerElement = this.args.speedDial._element.querySelector('md-fab-trigger');
		const direction = this.args.speedDial.directionClass.replace('md-', '').trim();
		const index = getElementIndex(this._element);

		// Make sure to account for differences in the dimensions of the trigger verses the items
		// so that we can properly center everything; this helps hide the el's shadows behind
		// the trigger.
		const triggerItemHeightOffset = (triggerElement.clientHeight - this._element.clientHeight) / 2;
		const triggerItemWidthOffset = (triggerElement.clientWidth - this._element.clientWidth) / 2;

		let newPosition =null;
		let axis = null;

		switch (direction) {
			case 'up':
				newPosition = (this._element.scrollHeight * (index + 1) + triggerItemHeightOffset);
				axis = 'Y';
			break;

			case 'down':
				newPosition = -(this._element.scrollHeight * (index + 1) + triggerItemHeightOffset);
				axis = 'Y';
			break;

			case 'left':
				newPosition = (this._element.scrollWidth * (index + 1) + triggerItemWidthOffset);
				axis = 'X';
			break;

			case 'right':
				newPosition = -(this._element.scrollWidth * (index + 1) + triggerItemWidthOffset);
				axis = 'X';
			break;
		}

		return htmlSafe(`transform:translate${axis}(${newPosition}px);`);
	}

	_scaleClosed() {
		const items = this.args.speedDial._element.querySelectorAll('.md-fab-action-item');
		const open = this.args.speedDial.isOpen;

		const index = getElementIndex(this._element);
		const delay = 65;
		const offsetDelay = index * delay;

		const opacity = open ? 1 : 0;
		const transform = open ? 'scale(1)' : 'scale(0)';
		const transitionDelay = `${open ? offsetDelay : (items.length * delay) - offsetDelay}ms`;

		// Make the items closest to the trigger have the highest z-index
		const zIndex = (items.length - index);

		return htmlSafe(`opacity:${opacity}; transform:${transform}; transition-delay:${transitionDelay}; z-index:${zIndex};`);
	}
	// #endregion
}
