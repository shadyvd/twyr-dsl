import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class TwyrSwitchComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('switch');

	_element = null;
	// #endregion

	// #region Tracked Attributes
	@tracked isDragging = false;
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

		if(element.hasAttribute('disabled'))
			return;

		this._setupSwitch();
	}

	willDestroy() {
		this.debug(`willDestroy`);

		if(this.args.registerWithParent && (typeof this.args.registerWithParent === 'function'))
			this.args.registerWithParent(this, false);

		this._teardownSwitch();
		super.willDestroy(...arguments);
	}
	// #endregion
}
