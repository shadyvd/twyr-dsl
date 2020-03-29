import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

export default class TwyrToolbarComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('twyr-toolbar');
	// #endregion

	// #region Yielded Sub-components
	subComponents = {
		'tools': 'twyr-toolbar/tools'
	};
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion
}
