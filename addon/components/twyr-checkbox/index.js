import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class TwyrCheckboxComponent extends Component {
	// #region Services
	@service constants;
	// #endregion

	// #region Private Attributes
	debug = debugLogger('checkbox');

	@tracked _element = null;
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

		this.handleClick(event);
	}
	// #region

	// #region Computed Properties
	get ariaChecked() {
		if(this.args.indeterminate)
			return 'mixed';

		return this.isChecked ? 'true' : 'false';
	}

	get isChecked() {
		return (!this.args.indeterminate && this.args.value);
	}

	get labelId() {
		if(!this._element)
			return 'label';

		const elementId = this._element.getAttribute('id');
		return `${elementId}-label`;
	}

	get role() {
		return this.args.role || 'checkbox';
	}
	// #endregion
}
