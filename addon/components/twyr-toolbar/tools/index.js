import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

export default class TwyrToolbarToolsComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('twyr-toolbar-tools');
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion
}
