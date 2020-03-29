import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

export default class TwyrSpeedDialActionsComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('twyr-speed-dial-actions');
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion
}
