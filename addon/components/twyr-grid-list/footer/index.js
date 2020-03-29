import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

export default class TwyrGridListFooterComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('twyr-grid-list-footer');
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion
}
