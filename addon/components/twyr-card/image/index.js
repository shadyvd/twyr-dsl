import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

export default class TwyrCardImageComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('card-image');
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion
}
