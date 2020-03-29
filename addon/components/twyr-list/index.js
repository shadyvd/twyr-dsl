import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

export default class TwyrListComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('twyr-list');
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion
}
