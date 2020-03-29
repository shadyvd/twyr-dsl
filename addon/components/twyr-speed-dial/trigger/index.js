import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';
import { isPresent } from '@ember/utils';

export default class TwyrSpeedDialTriggerComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('twyr-speed-dial-trigger');
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion

	// #region DOM event Handlers
	@action
	handleClick(event) {
		this.debug(`handleClick::event: `, event);
		if(!isPresent(this.args.speedDial)) {
			this.debug(`handleClick::speedDial: unknown`);
			return;
		}

		if(!isPresent(this.args.speedDial.toggle) || (typeof this.args.speedDial.toggle !== 'function')) {
			this.debug(`handleClick::speedDial::toggle: unknown`);
			return;
		}

		this.debug(`handleClick::final`);
		this.args.speedDial.toggle();
	}

	@action
	handleFocusOut(event) {
		this.debug(`handleFocusOut::event: `, event);
		if(!isPresent(this.args.speedDial)) {
			this.debug(`handleFocusOut::speedDial: unknown`);
			return;
		}

		if(!isPresent(this.args.speedDial.close) || (typeof this.args.speedDial.close !== 'function')) {
			this.debug(`handleFocusOut::speedDial::close: unknown`);
			return;
		}

		this.debug(`handleFocusOut::final`);
		this.args.speedDial.close();
	}
	// #endregion
}
