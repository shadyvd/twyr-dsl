import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';

export default class TwyrRadioGroupRadioButtonComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('radio-group-button');

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
			const radioValue = this.args.toggle ? (this.isChecked ? null : this.args.value) : this.args.value;

			this.debug(`handleClick::onChange::value: `, radioValue);
			this.args.onChange(radioValue);
		}
	}
	// #endregion

	// #region Computed Properties
	get ariaChecked() {
		return this.isChecked ? 'true' : 'false';
	}

	get focusOnlyOnKey() {
		if((this.args.focusOnlyOnKey !== null) && (this.args.focusOnlyOnKey !== undefined))
			return this.args.focusOnlyOnKey;

		return true;
	}

	get isChecked() {
		return (this.args.groupValue === this.args.value);
	}

	get labelId() {
		if(!this._element)
			return 'label';

		const elementId = this._element.getAttribute('id');
		return `${elementId}-label`;
	}

	get role() {
		return this.args.role || 'radio';
	}
	// #endregion
}
