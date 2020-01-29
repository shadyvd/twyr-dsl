import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';

export default class TwyrSidenavComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('sidenav');
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion

	// #region Computed Properties
	get sidenavLockedOpen() {
		this.debug(`sidenavLockedOpen: ${(this.args.lockedOpen !== undefined) ? this.args.lockedOpen : 'gt-sm'}`)
		return (this.args.lockedOpen !== undefined) ? this.args.lockedOpen : 'gt-sm';
	}

	get sidenavName() {
		this.debug(`sidenavName: ${(this.args.name || 'default')}`)
		return this.args.name || 'default';
	}

	get sidenavPosition() {
		this.debug(`sidenavPosition: ${(this.args.position || 'left')}`)
		return this.args.position || 'left';
	}
	// #endregion

	// #region Actions
	@action
	onBackdropTap() {
		if(!this.args.onToggle) return;
		if(typeof this.args.onToggle !== 'function') return;

		this.debug(`propagating toggle on backdrop`);
		this.args.onToggle(false);
	}

	@action
	onToggle() {
		if(!this.args.onToggle) return;
		if(typeof this.args.onToggle !== 'function') return;

		this.debug(`propagating toggle on sidenav with arguments: `, arguments);
		this.args.onToggle(...arguments);
	}
	// #endregion
}
