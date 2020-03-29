import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

export default class TwyrPowerSelectGroupComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('twyr-power-select-group');
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion
}
