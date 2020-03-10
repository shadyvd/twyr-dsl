import PowerSelectOptions from './../../twyr-power-select/options';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';

export default class TwyrSelectOptionsComponent extends PowerSelectOptions {
	// #region Private Attributes
	debug = debugLogger('twyr-select-options');
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

		const superInsert = super.actions.didInsert.bind(this);
		superInsert(element);
	}
	// #endregion

	// #region Computed Properties
	get role() {
		return this.args.role || 'listbox';
	}
	// #endregion
}
