import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

export default class TwyrSubheaderComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('subheader');
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion
}
