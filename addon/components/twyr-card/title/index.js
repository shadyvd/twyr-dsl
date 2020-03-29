import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

export default class TwyrCardTitleComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('twyr-card-title');
	// #endregion

	// #region Yielded Sub-components
	subComponents = {
		'media': 'twyr-card/title/media',
		'text': 'twyr-card/title/text'
	};
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion
}
