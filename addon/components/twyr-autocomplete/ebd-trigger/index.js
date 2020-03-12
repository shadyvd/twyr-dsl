import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';


export default class TwyrAutocompleteEbdTriggerComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('twyr-autocomplete-ebd-trigger');
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion

	// #region Computed Properties
	get shouldShowLabel() {
		this.debug(`shouldShowLabel: ${this.args.label && this.args.selected}`);
		return (this.args.label && this.args.selected);
	}
	// #endregion
}
