import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

export default class TwyrPowerSelectSearchMessageComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('twyr-power-select-search-message');
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion
}
