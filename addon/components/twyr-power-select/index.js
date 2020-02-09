import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

export default class TwyrPowerSelectComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('twyr-power-select');
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion
}
