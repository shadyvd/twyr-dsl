import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

export default class TwyrCardComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('twyr-card');
	// #endregion

	// #region Yielded Sub-components
	subComponents = {
		'actions': 'twyr-card/actions',
		'content': 'twyr-card/content',
		'header': 'twyr-card/header',
		'image': 'twyr-card/image',
		'media': 'twyr-card/media',
		'title': 'twyr-card/title'
	};
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion
}
