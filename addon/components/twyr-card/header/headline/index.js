import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

export default class TwyrCardHeaderHeadlineComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('twyr-card-header-headline');
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion
}
