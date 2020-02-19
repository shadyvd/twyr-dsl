import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';

export default class TwyrPowerSelectTriggerComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('twyr-power-select-trigger');
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion

	// #region Actions
	@action
	clear(event) {
		event.stopPropagation();

		if(this.args.powerSelect && this.args.powerSelect.Controls && this.args.powerSelect.Controls.select && (typeof this.args.powerSelect.Controls.select === 'function'))
			this.args.powerSelect.Controls.select(null);

		if(event.type === 'touchstart')
			return false;
	}
	// #endregion
}
