import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

export default class TwyrCardHeaderSubheadComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('card-header-subhead');
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion
}
