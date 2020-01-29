import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

export default class TwyrCardContentComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('card-content');
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion
}
