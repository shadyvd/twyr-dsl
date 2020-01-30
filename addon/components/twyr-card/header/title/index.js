import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

export default class TwyrCardHeaderTitleComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('twyr-card-header-title');
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion
}
