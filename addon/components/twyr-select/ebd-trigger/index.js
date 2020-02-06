import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

export default class TwyrSelectEbdTriggerComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('twyr-select-ebd-trigger');
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion

	// #region Computed Properties
	get shouldShowLabel() {
		return this.args.label && this.args.selected;
	}
	// #endregion
}
