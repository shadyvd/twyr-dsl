import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

export default class TwyrDialogActionsComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('dialog-actions');
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion
}
