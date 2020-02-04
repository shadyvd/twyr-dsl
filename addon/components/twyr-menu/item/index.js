import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';
import { isPresent } from '@ember/utils';

export default class TwyrMenuItemComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('twyr-menu-item');
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion

	// #region DOM Event Handlers
	@action
	handleClick() {
		this.args.dropdown.close();

		if(isPresent(this.args.onClick) && (typeof this.args.onClick === 'function'))
			this.args.onClick(...arguments);
	}

	@action
	handleMouseEnter(event) {
		if (this.args.disabled) return;

		let button = event.target.querySelector('button');
		if (button) button.focus();
	}
	// #endregion

	// #region Computed Properties
	get shouldRenderButton() {
		return this.args.onClick || this.args.href;
	}
	// #endregion
}
