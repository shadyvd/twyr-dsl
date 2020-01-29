import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isBlank } from '@ember/utils';

export default class TwyrSidenavInnerComponent extends Component {
	// #region Services
	@service constants;
	@service twyrSidenav;
	// #endregion

	// #region Private Attributes
	debug = debugLogger('sidenav-inner');
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);

		this.twyrSidenav.register(this.args.name, this);
	}
	// #endregion

	// #region Lifecycle Hooks
	willDestroy() {
		this.debug(`willDestroy`);

		this.twyrSidenav.unregister(this.args.name, this);
		super.willDestroy(...arguments);
	}
	// #endregion

	// #region DOM Event Handlers
	@action
	handleClick(event) {
		if(!this.args.closeOnClick || this.isLockedOpen) {
			this.debug(`handleClick: closeOnClick OR isLockedOpen`);
			return;
		}

		if(!this.args.onToggle) {
			this.debug(`handleClick: no onToggle`);
			return;
		}

		if(typeof this.args.onToggle !== 'function') {
			this.debug(`handleClick: onToggle not func`);
			return;
		}

		this.debug(`propagating click on sidenav-inner with event: `, event);
		this.toggle(false);
	}
	// #endregion

	// #region Public Methods
	open() {
		this.debug(`open`);
		if(this.args.closed && this.isLockedOpen) {
			this.toggle(true);
		}
	}

	close() {
		this.debug(`close`);
		if(!this.args.closed && !this.isLockedOpen) {
			this.toggle(false);
		}
	}

	toggle(toggleValue) {
		this.debug(`toggle::value: ${toggleValue}`);
		if(this.isLockedOpen)
			return;

		if(!this.args.onToggle) {
			this.debug(`toggle: no onToggle`);
			return;
		}

		if(typeof this.args.onToggle !== 'function') {
			this.debug(`toggle: onToggle not func`);
			return;
		}

		if(isBlank(toggleValue)) toggleValue = this.args.closed;

		this.debug(`propagating toggle on sidenav-inner with arguments: `, toggleValue);
		this.args.onToggle(toggleValue);
	}
	// #endregion

	// #region Computed Properties
	get isLockedOpen() {
		let isLockedOpen = this.args.lockedOpen;

		if(typeof isLockedOpen !== 'boolean') {
			const mediaQuery = this.constants.MEDIA[isLockedOpen] || isLockedOpen;
			isLockedOpen = window.matchMedia(mediaQuery).matches;
		}

		this.debug(`isLockedOpen? `, isLockedOpen);
		return isLockedOpen;
	}
	// #endregion
}
