import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';

export default class TwyrResetButtonComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('reset-button');
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion

	// #region DOM Event Handlers
	@action
	handleClick(event) {
		if(this.args.bubbles === false) {
			this.debug(`handleClick::stopping click event propagation`, event);
			event.preventDefault();
			event.stopPropagation();
		}

		if(this.args.onClick && (typeof this.args.onClick === 'function')) {
			this.debug(`handleClick::onClick::event: `, event);
			this.args.onClick(event);
		}

		if(this.args.onReset && (typeof this.args.onReset === 'function')) {
			this.debug(`propagating click with event:`, event);
			this.args.onReset(event);
		}
	}
	// #region

	// #region Actions
	@action
	didTransitionOut() {
		if(!this.args.onTransitionOut) return;
		if(typeof this.args.onTransitionOut !== 'function') return;

		this.debug(`propagating didTransitionOut`);
		this.args.onTransitionOut();
	}
	// #endregion
}
