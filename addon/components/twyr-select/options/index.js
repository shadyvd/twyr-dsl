import PowerSelectOptions from 'ember-power-select/components/power-select/options';
import debugLogger from 'ember-debug-logger';

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
}
