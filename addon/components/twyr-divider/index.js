import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

export default class TwyrDividerComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('divider');
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion

	// #region Computed Properties
	get insetAttr() {
		return this.args.inset;
	}
	// #endregion
}
