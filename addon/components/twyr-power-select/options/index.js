import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';

// #region File Global Functions
(function(ElementProto) {
	if(typeof ElementProto.matches !== 'function') {
		ElementProto.matches = ElementProto.msMatchesSelector || ElementProto.mozMatchesSelector || ElementProto.webkitMatchesSelector;
	}

	if (typeof ElementProto.closest !== 'function') {
		ElementProto.closest = function closest(selector) {
			let element = this;
			while (element !== null && element.nodeType === 1) {
				if (element.matches(selector))
					return element;

				element = element.parentNode;
			}

			return null;
		};
	}
})(window.Element.prototype);
// #endregion

export default class TwyrPowerSelectOptionsComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('twyr-power-select-options');

	_element = null;
	_hasMoved = false;
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

		const findOptionAndPerform = (action, event) => {
			this.debug(`findOptionAndPerform::arguments: `, arguments);
			if (event.target === null) return;

			const optionItem = event.target.closest('[data-option-index]');
			if (!optionItem) return;

			if (optionItem.closest('[aria-disabled=true]'))
				return;

			const optionIndex = optionItem.getAttribute('data-option-index');
			if (optionIndex === null) return;

			action(this._optionFromIndex(optionIndex), event);
		};

		const role = this._element.getAttribute('role');
		if(role === 'group') return;

		this._element.addEventListener('mouseup', (event) => {
			findOptionAndPerform(this.args.powerSelect.Controls.choose, event);
		});

		if(this.args.powerSelect.Controls.highlight) {
			this._element.addEventListener('mouseover', (event) => {
				findOptionAndPerform(this.args.powerSelect.Controls.highlight, event);
			});
		}

		if (this.isTouchDevice) {
			const touchMoveHandler = () => {
				this._hasMoved = true;
				if (!this._element) return;

				this._element.removeEventListener('touchmove', touchMoveHandler);
			};

			// Add touch event handlers to detect taps
			this._element.addEventListener('touchstart', () => {
				this._element.addEventListener('touchmove', touchMoveHandler);
			});

			this._element.addEventListener('touchend', (event) => {
				if (event.target === null) return;

				const optionItem = (event.target).closest('[data-option-index]');
				if (optionItem === null) return;

				event.preventDefault();
				if (this._hasMoved) {
					this._hasMoved = false;
					return;
				}

				if (optionItem.closest('[aria-disabled=true]')) {
					return; // Abort if the item or an ancestor is disabled
				}

				const optionIndex = optionItem.getAttribute('data-option-index');
				if (optionIndex === null) return;

				this.args.powerSelect.Controls.choose(this._optionFromIndex(optionIndex), event);
			});
		}

		this.args.powerSelect.Controls.scrollTo(this.args.powerSelect.Options.highlightedOption);
	}
	// #endregion

	// #region Computed Properties
	get isTouchDevice() {
		this.debug(`isTouchDevice: ${Boolean(!!window && 'ontouchstart' in window)}`);
		return Boolean(!!window && 'ontouchstart' in window);
	}

	get options() {
		let options = this.args.options;
		if(!options) options = this.args.powerSelect.Options.options;

		this.debug(`options: `, options);
		return options;
	}
	// #endregion

	// #region Private Methods
	_optionFromIndex(index) {
		this.debug(`_optionFromIndex::index: ${index}`);
		const parts = index.split('.');

		let option = this.options[parseInt(parts[0], 10)];
		for (let idx = 1; idx < parts.length; idx++) {
			option = option.options[parseInt(parts[idx], 10)];
		}

		return option;
	}
	// #endregion
}
