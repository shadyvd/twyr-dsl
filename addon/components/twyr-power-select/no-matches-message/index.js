import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

export default class TwyrPowerSelectNoMatchesMessageComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('twyr-power-select-no-matches-message');
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion
}
