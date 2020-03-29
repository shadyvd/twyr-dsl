import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

export default class TwyrPowerSelectAfterOptionsComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('twyr-power-select-after-options');
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion
}
