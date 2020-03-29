import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { tracked } from '@glimmer/tracking';

export default class TwyrContactChipComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('twyr-contact-chip');
	// #endregion

	// #region Tracked Attributes
	@tracked _emailField = 'email';
	@tracked _imageField = 'image';
	@tracked _nameField = 'name';
	@tracked _requireMatch = true;
	@tracked _searchField = 'email';
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion
}
