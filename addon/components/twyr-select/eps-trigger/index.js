import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';

export default class TwyrSelectEpsTriggerComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('twyr-select-eps-trigger');
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion

	// #region Computed Properties
	get isPlaceholder() {
		this.debug(`isPlaceholder: ${(this.args.placeholder || this.args.extra.label) && !this.args.select.selected}`);
		return ((this.args.placeholder || this.args.extra.label) && !this.args.select.selected);
	}
	// #endregion

	// #region Actions
	@action
	clear(event) {
		this.debug(`clear`);

		event.stopPropagation();
		this.args.select.actions.select(null);

		if(event.type === 'touchstart')
			return false;
	}
	// #endregion
}
