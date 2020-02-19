import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isPresent } from '@ember/utils';
import { later } from '@ember/runloop';
import { set } from '@ember/object';

export default class TwyrPowerSelectBeforeOptionsComponent extends Component {
	// #region Services
	@service constants;
	// #endregion

	// #region Private Attributes
	debug = debugLogger('twyr-power-select-before-options');
	_element = null;
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion

	// #region Lifecycle Hooks
	@action
	didInsert(element) {
		this.debug(`didInsert`);
		this._element = element;

		later(() => {
			if(this.isDestroying || this.isDestroyed)
				return;

			if(this.args.autoFocus !== false)
				this._element.focus();
		}, 0);
	}

	willDestroy() {
		this.debug(`willDestroy`);

		set(this.args.powerSelect.Options.searchText, '');
		super.willDestroy(...arguments);
	}
	// #endregion

	// #region DOM Event Handlers
	@action
	handleKeyDown(event) {
		if(event.keyCode !== this.constants.KEYCODE.ENTER)
			return;

		if(this.args.powerSelect.Controls && isPresent(this.args.powerSelect.Controls.close) && (typeof this.args.powerSelect.Controls.close === 'function')) {
			this.args.powerSelect.Controls.close(event);
		}
	}
	// #endregion
}
