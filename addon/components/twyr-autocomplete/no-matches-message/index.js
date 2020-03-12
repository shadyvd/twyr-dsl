import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

export default class TwyrAutocompleteNoMatchesMessageComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('twyr-autocomplete-no-matches-message');
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion
}
