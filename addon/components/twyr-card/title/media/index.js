import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

export default class TwyrCardTitleMediaComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('card-title-media');
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion

	// #region Computed Properties
	get size() {
		return this.args.size || 'md';
	}
	// #endregion
}
