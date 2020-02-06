import PowerBeforeBeforeOptions from 'ember-power-select/components/power-select/before-options';
import debugLogger from 'ember-debug-logger';

export default class TwyrSelectSearchComponent extends PowerBeforeBeforeOptions {
	// #region Private Attributes
	debug = debugLogger('twyr-select-search');
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion
}
