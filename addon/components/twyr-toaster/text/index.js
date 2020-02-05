import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

export default class TwyrToasterTextComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('twyr-toaster-text');
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion
}
