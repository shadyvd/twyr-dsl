import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

export default class TwyrSelectNoMatchesMessageComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('twyr-select-no-matches-message');
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion
}
