import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

export default class TwyrCardHeaderTextComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('card-header-text');
	// #endregion

	// #region Yielded Sub-components
	subComponents = {
		'subhead': 'twyr-card/header/subhead',
		'title': 'twyr-card/header/title'
	};

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion
}
