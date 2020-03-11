import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

export default class TwyrAutocompleteComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('twyr-autocomplete');
	_element = null;
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion
}
