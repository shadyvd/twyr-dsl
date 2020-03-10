import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';
import { isPresent } from '@ember/utils';

export default class TwyrMenuItemComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('twyr-menu-item');
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
	}
	// #endregion

	// #region DOM Event Handlers
	@action
	handleClick() {
		if(this.args.isDisabled)
			return;

		if(this._element && this._element.hasAttribute('disabled'))
			return;

		if(isPresent(this.args.dropdownControls) && isPresent(this.args.dropdownControls.close) && (typeof this.args.dropdownControls.close === 'function'))
			this.args.dropdownControls.close();

		if(isPresent(this.args.onClick) && (typeof this.args.onClick === 'function'))
			this.args.onClick(...arguments);
	}

	@action
	handleMouseEnter() {
		if(this.args.isDisabled)
			return;

		if(this._element && this._element.hasAttribute('disabled'))
			return;

		let button = this._element.querySelector('button');
		if(button) button.focus();
	}
	// #endregion

	// #region Computed Properties
	get shouldRenderButton() {
		return this.args.onClick || this.args.href;
	}
	// #endregion
}
