import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';
import { inject as service } from '@ember/service';

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
		this.twyrSidenav.unregister(this.args.name, this);
		super.willDestroy(...arguments);
	}
	// #endregion

	// #region DOM Event Handlers
	@action
	handleClick(event) {
		if(!this.args.closeOnClick || this.isLockedOpen)
			return;

		if(!this.args.onToggle)
			return;

		if(typeof this.args.onToggle !== 'function')
			return;

		this.debug(`propagating click on sidenav-inner with event: `, event);
		this.toggle(false);
	}
	// #endregion

	// #region Public Methods
	open() {
		if(this.args.closed && this.isLockedOpen) {
			this.toggle(true);
		}
	}

	close() {
		if(!this.args.closed && !this.isLockedOpen) {
			this.toggle(false);
		}
	}

	toggle(toggleValue) {
		if(this.isLockedOpen)
			return;

		if(!this.args.onToggle)
			return;

		if(typeof this.args.onToggle !== 'function')
			return;

		if((toggleValue === null) || (toggleValue === undefined))
			toggleValue = this.args.closed;

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
