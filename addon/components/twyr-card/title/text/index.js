import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

export default class TwyrCardTitleTextComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('card-title-text');
	// #endregion

	// #region Yielded Sub-components
	subComponents = {
		'headline': 'twyr-card/header/headline',
		'subhead': 'twyr-card/header/subhead'
	};
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion
}
