import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { nextTick } from 'ember-css-transitions/utils/transition-utils';
import { tracked } from '@glimmer/tracking';

// #region File Global Functions
function waitForAnimations(element, callback) {
	const computedStyle = window.getComputedStyle(element);

	if (computedStyle.transitionDuration && computedStyle.transitionDuration !== '0s') {
		const eventCallback = function eventCallback() {
			element.removeEventListener('transitionend', eventCallback);
			callback();
		};

		element.addEventListener('transitionend', eventCallback);
	}
	else if (computedStyle.animationName !== 'none' && computedStyle.animationPlayState === 'running') {
		const eventCallback = function eventCallback() {
			element.removeEventListener('animationend', eventCallback);
			callback();
		};

		element.addEventListener('animationend', eventCallback);
	}
	else {
		callback();
	}
}
// #endregion

export default class TwyrMenuContentComponent extends Component {
	// #region Services
	@service constants;
	// #endregion

	// #region Private Attributes
	debug = debugLogger('twyr-menu-content');

	_element = null;
	// #endregion

	// #region Tracked Attributes
	@tracked _isActive = false;
	// #endregion

	// #region Yielded Sub-components
	subComponents = {
		'menuItem': 'twyr-menu/item'
	};
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
		this.debug('didInsert');
		this._element = element;

		nextTick()
		.then(() => {
			if (this.isDestroying || this.isDestroyed)
				return;

			this._isActive = true;
		})
	}

	willDestroy() {
		this.debug('didInsert');

		const parentElement = this.args.renderInPlace ? this._element.parentElement.parentElement : this._element.parentElement;

		const clone = this._element.cloneNode(true);
		clone.id = `${clone.id}--clone`;
		parentElement.appendChild(clone);

		nextTick()
		.then(() => {
			if (this.isDestroyed) {
				parentElement.removeChild(clone);
				return;
			}

			this._isActive = false;
			clone.classList.add('md-leave');

			waitForAnimations(clone, function() {
				clone.classList.remove('md-active');
				parentElement.removeChild(clone);
			});
		});

		super.willDestroy(...arguments);
	}
	// #endregion

	// #region Inner Component Lifecycle Hooks
	@action
	handleContentFocus(contentElement) {
		let focusTarget = contentElement.querySelector('.md-menu-focus-target');

		// default to first non disabled item
		if (!focusTarget) {
			focusTarget = contentElement.querySelector('md-menu-item:not([disabled])').firstElementChild;
		}

		if (focusTarget) {
			focusTarget.focus();
		}
	}

	@action
	handleContentKeydown(event) {
		switch (event.which) {
			case this.constants.KEYCODE.ESCAPE:
				this.args.dropdown.actions.close();
			break;

			case this.constants.KEYCODE.LEFT_ARROW:
			case this.constants.KEYCODE.UP_ARROW:
				event.preventDefault();
				this._focusMenuItem(event, -1);
			break;

			case this.constants.KEYCODE.RIGHT_ARROW:
			case this.constants.KEYCODE.DOWN_ARROW:
				event.preventDefault();
				this._focusMenuItem(event, 1);
			break;
		}
	}
	// #endregion

	// #region Computed Properties
	get customStyles() {
		if (this._isActive)
			return {};

		return this.args.otherStyles;
	}

	get destinationElement() {
		return document.getElementById(this.args.destination);
	}
	// #endregion

	// #region Private Methods
	_focusMenuItem(event, direction) {
		let focusTarget = event.target.closest('md-menu-item');

		do {
			if (direction > 0) {
				focusTarget = focusTarget.nextElementSibling;
			} else {
				focusTarget = focusTarget.previousElementSibling;
			}
		} while (focusTarget && !this._isFocusable(focusTarget));

		focusTarget = focusTarget && focusTarget.firstElementChild;
		if (focusTarget) focusTarget.focus();
	}

	_isFocusable(element) {
		return element && (element.tagName.toUpperCase() === 'MD-MENU-ITEM') && (element.getAttribute('tabindex') !== -1) && (!element.hasAttribute('disabled'));
	}
	// #endregion
}
