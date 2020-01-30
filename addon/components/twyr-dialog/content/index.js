import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

export default class TwyrDialogContentComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('twyr-dialog-content');
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion
}
