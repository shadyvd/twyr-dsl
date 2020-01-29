import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isPresent } from '@ember/utils';

export default class TwyrRadioGroupComponent extends Component {
	// #region Services
	@service constants;
	// #endregion

	// #region Private Attributes
	debug = debugLogger('radio-group');

	_element = null;

	_childElements = [];
	// #endregion

	// #region Yielded Sub-components
	subComponents = {
		'label': 'twyr-radio-group/label',
		'button': 'twyr-radio-group/radio-button'
	};
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion

	// #region DOM Event Handlers
	handleKeydown(event) {
		switch (event.which) {
			case this.constants.KEYCODE.LEFT_ARROW:
			case this.constants.KEYCODE.UP_ARROW:
				event.preventDefault();
				this.debug(`handleKeydown: Left / Up`);
				this._select(-1);
			break;

			case this.constants.KEYCODE.RIGHT_ARROW:
			case this.constants.KEYCODE.DOWN_ARROW:
				event.preventDefault();
				this.debug(`handleKeydown: Right / Down`);
				this._select(1);
			break;

			default:
				this.debug(`handleKeydown: Unwanted Keycode`);
			break;
		}
	}
	// #endregion

	// #region Computed Properties
	get childValues() {
		const childValues = this.enabledChildRadios.map((childRadio) => {
			return childRadio.radioValue;
		});

		this.debug(`childValues: `, childValues);
		return childValues;
	}
	get enabledChildRadios() {
		const enabledRadios = this._childElements.filter((childRadio) => {
			return !childRadio._element.hasAttribute('disabled');
		});

		this.debug(`enabledChildRadios: `, enabledRadios);
		return enabledRadios;
	}

	get focusOnlyOnKey() {
		if((this.args.focusOnlyOnKey !== null) && (this.args.focusOnlyOnKey !== undefined))
			return this.args.focusOnlyOnKey;

		return true;
	}

	get role() {
		return this.args.role || 'radiogroup';
	}
	// #endregion

	// #region Private Methods
	_select(increment) {
		this.debug(`_select::increment: `, increment);
		const groupValue = this.args.groupValue;

		let index = 0;
		if (isPresent(groupValue)) {
			index = this.childValues.indexOf(groupValue);
			index += increment;

			const length = this.childValues.length;
			index = ((index % length) + length) % length;
		}

		const childRadio = this.enabledChildRadios[index];

		this.debug(`_select::childRadio::value: `, childRadio.radioValue);
		this.onChange(childRadio.radioValue);
	}
	// #endregion


	// #region Actions
	@action
	registerChild(child, register) {
		this.debug(`registerChild::child: `, child, `, register: ${register}`);

		if(register) {
			if(!this._childElements.includes(child))
				this._childElements.push(child);
		}
		else {
			if(this._childElements.includes(child))
				this._childElements.splice(this._childElements.indexOf(child), 1);
		}
	}

	@action
	onChange(value) {
		if(!this.args.onChange)
			return;

		if(typeof this.args.onChange !== 'function')
			return;

		this.debug(`onChange: `, value);
		this.args.onChange(value);
	}
	// #endregion
}
