import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

export default class TwyrSelectSearchMessageComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('twyr-select-search-message');
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion
}
