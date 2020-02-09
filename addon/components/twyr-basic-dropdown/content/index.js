import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';
import { isPresent } from '@ember/utils';

export default class TwyrBasicDropdownContentComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('twyr-basic-dropdown-content');

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

		if(isPresent(this.args.registerWithDropdown) && (typeof this.args.registerWithDropdown === 'function'))
			this.args.registerWithDropdown(this._element);
	}

	@action
	didMutate(mutations) {

	}
	// #endregion
}
