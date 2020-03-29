import PowerSelectBeforeOptions from './../../twyr-power-select/before-options';
import debugLogger from 'ember-debug-logger';

export default class TwyrSelectSearchComponent extends PowerSelectBeforeOptions {
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
