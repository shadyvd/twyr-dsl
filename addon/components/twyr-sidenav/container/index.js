import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

export default class TwyrSidenavContainerComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('sidenav-container');
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion
}
