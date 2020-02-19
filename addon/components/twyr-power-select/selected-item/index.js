import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

export default class TwyrPowerSelectSelectedItemComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('twyr-power-select-selected-item');
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion
}
