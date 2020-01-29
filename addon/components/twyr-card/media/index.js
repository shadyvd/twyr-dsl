import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

export default class TwyrCardMediaComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('card-media');
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion

	// #region Computed Properties
	get size() {
		this.debug(`size: ${this.args.size || 'md'}`);
		return this.args.size || 'md';
	}
	// #endregion
}