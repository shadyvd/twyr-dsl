import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';
import { isPresent } from '@ember/utils';

export default class TwyrRadioComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('twyr-radio-button');

	_element = null;
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

		if(this.args.registerWithParent && (typeof this.args.registerWithParent === 'function'))
			this.args.registerWithParent(this, true);
	}

	willDestroy() {
		this.debug(`willDestroy`);

		if(this.args.registerWithParent && (typeof this.args.registerWithParent === 'function'))
			this.args.registerWithParent(this, false);

		super.willDestroy(...arguments);
	}
	// #endregion

	// #region DOM Event Handlers
	@action
	handleClick(event) {
		if(this.args.bubbles === false) {
			this.debug(`handleClick::stopping click event propagation`, event);
			event.preventDefault();
			event.stopPropagation();
		}

		if(!this._element || this._element.hasAttribute('disabled')) {
			this.debug(`handleClick::disabled`);
			return;
		}

		if(this.args.onClick && (typeof this.args.onClick === 'function')) {
			this.debug(`handleClick::onClick::event: `, event);
			this.args.onClick(event);
		}

		if(this.args.onChange && (typeof this.args.onChange === 'function')) {
			this.debug(`handleClick::onChange::value: `, this.radioValue);
			this.args.onChange(this.radioValue);
		}
	}
	// #endregion

	// #region Computed Properties
	get ariaChecked() {
		this.debug(`ariaChecked: ${this.isChecked ? 'true' : 'false'}`);
		return this.isChecked ? 'true' : 'false';
	}

	get focusOnlyOnKey() {
		this.debug(`focusOnlyOnKey: ${isPresent(this.args.focusOnlyOnKey) ? this.args.focusOnlyOnKey : true}`);
		return isPresent(this.args.focusOnlyOnKey) ? this.args.focusOnlyOnKey : true;
	}

	get isChecked() {
		this.debug(`isChecked? `, (this.args.groupValue === this.radioValue));
		return (this.args.groupValue === this.radioValue);
	}

	get labelId() {
		if(!this._element) {
			this.debug(`labelId: label`);
			return 'label';
		}

		const elementId = this._element.getAttribute('id');

		this.debug(`labelId: ${elementId}-label`);
		return `${elementId}-label`;
	}

	get radioValue() {
		this.debug(`radioValue: ${(this.args.toggle ? (this.isChecked ? null : this.args.value) : this.args.value)}`);
		return (this.args.toggle ? (this.isChecked ? null : this.args.value) : this.args.value);
	}

	get role() {
		this.debug(`role: ${this.args.role || 'radio'}`);
		return this.args.role || 'radio';
	}
	// #endregion
}
