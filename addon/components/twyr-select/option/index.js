import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

export default class TwyrSelectOptionComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('twyr-select-option');
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion
}
