import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';

export default class TwyrButtonComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('twyr-button');

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

		if(this.args.registerWithParent && (typeof this.args.registerWithParent === 'function'))
			this.args.registerWithParent(this, true);
	}

	willDestroy() {
		this.debug(`willDestroy`);

		if(this.args.registerWithParent && (typeof this.args.registerWithParent === 'function'))
			this.args.registerWithParent(this, false);

		super.willDestroy(...arguments);
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

		if(!this._element || this._element.hasAttribute('disabled')) {
			this.debug(`handleClick::disabled`);
			return;
		}

		if(this.args.onClick && (typeof this.args.onClick === 'function')) {
			this.debug(`handleClick::onClick::event: `, event);
			this.args.onClick(event);
		}
	}
	// #region
}
