import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

export default class TwyrMenuTriggerComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('twyr-menu-trigger');
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion
}
