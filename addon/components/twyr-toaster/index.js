import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class TwyrToasterComponent extends Component {
	// #region Services
	@service twyrToaster;
	// #endregion

	// #region Private Attributes
	debug = debugLogger('twyr-toaster');
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion

	// #region Computed Properties
	get activeToast() {
		this.debug(`activeToast: `, this.twyrToaster.activeToast);
		return this.twyrToaster.activeToast;
	}
	// #endregion

	// #region Actions
	@action
	onClose(toast) {
		this.debug(`onClose`);
		this.twyrToaster.cancel(toast);
	}
	// #endregion
}
