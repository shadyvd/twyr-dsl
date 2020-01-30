import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isPresent } from '@ember/utils';

export default class TwyrCheckboxComponent extends Component {
	// #region Services
	@service constants;
	// #endregion

	// #region Private Attributes
	debug = debugLogger('twyr-checkbox');

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
			this.debug(`handleClick::onChange::value: `, !this.args.value);
			this.args.onChange(!this.args.value);
		}
	}

	@action
	handleKeypress(event) {
		if((event.which === this.constants.KEYCODE.SPACE) || (event.which === this.constants.KEYCODE.ENTER)) {
			event.preventDefault();
		}

		this.debug(`handleKeypress: `, event);
		this.handleClick(event);
	}
	// #region

	// #region Computed Properties
	get ariaChecked() {
		if(this.args.indeterminate) {
			this.debug(`ariaChecked: mixed`);
			return 'mixed';
		}

		this.debug(`ariaChecked: ${this.isChecked ? 'true' : 'false'}`);
		return this.isChecked ? 'true' : 'false';
	}

	get focusOnlyOnKey() {
		this.debug(`focusOnlyOnKey: ${isPresent(this.args.focusOnlyOnKey) ? this.args.focusOnlyOnKey : true}`);
		return isPresent(this.args.focusOnlyOnKey) ? this.args.focusOnlyOnKey : true;
	}

	get isChecked() {
		this.debug(`isChecked: ${!this.args.indeterminate && this.args.value}`);
		return (!this.args.indeterminate && this.args.value);
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

	get role() {
		this.debug(`role: ${this.args.role || 'checkbox'}`);
		return this.args.role || 'checkbox';
	}
	// #endregion
}
