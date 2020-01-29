import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

export default class TwyrCardIconActionsComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('card-icon-actions');
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion
}
