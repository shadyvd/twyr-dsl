import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

export default class TwyrCardAvatarComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('card-avatar');
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion
}
