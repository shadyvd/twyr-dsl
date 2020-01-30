import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

export default class TwyrCardHeaderComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('twyr-card-header');
	// #endregion

	// #region Yielded Sub-components
	subComponents = {
		'avatar': 'twyr-card/avatar',
		'text': 'twyr-card/header/text'
	};
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion
}
