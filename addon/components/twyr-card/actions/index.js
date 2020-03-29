import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

export default class TwyrCardActionsComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('twyr-card-actions');
	// #endregion

	// #region Yielded Sub-components
	subComponents = {
		'icons': 'twyr-card/icon-actions'
	};
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion
}
