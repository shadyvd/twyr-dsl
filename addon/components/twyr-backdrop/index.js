import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';
import { htmlSafe } from '@ember/string';

export default class TwyrBackdropComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('backdrop');
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
		this._element = element;
	}
	// #endregion

	// #region DOM Event Handlers
	@action
	handleClick(event) {
		if(event.srcElement === this._element) {
			this.debug(`stopping click event propagation`, event);
			event.preventDefault();
			event.stopPropagation();
		}

		if(!this.args.onClick) return;
		if(typeof this.args.onClick !== 'function') return;

		this.debug(`propagating click with event:`, event);
		this.args.onClick(event);
	}
	// #endregion

	// #region Computed Styles
	get backdropPosition() {
		return (this.args.isFixed ? htmlSafe(`position:fixed;`) : null);
	}
	// #endregion
}
