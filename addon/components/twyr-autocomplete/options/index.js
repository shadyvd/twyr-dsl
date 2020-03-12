import PowerSelectOptions from './../../twyr-power-select/options';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';

export default class TwyrAutocompleteOptionsComponent extends PowerSelectOptions {
	// #region Private Attributes
	debug = debugLogger('twyr-autocomplete-options');
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

		this._attachHandlers();
	}
	// #endregion
}
