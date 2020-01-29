import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

export default class TwyrCheckboxComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('checkbox');
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion
}
