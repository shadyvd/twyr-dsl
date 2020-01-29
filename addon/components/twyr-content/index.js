import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

export default class TwyrContentComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('content');
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion
}
