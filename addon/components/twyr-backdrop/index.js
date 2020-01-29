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
			this.debug(`handleClick::stopping event propagation`);
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
	// #endregion

	// #region Computed Styles
	get backdropPosition() {
		this.debug(`backdropPosition: ${this.args.isFixed ? htmlSafe(`position:fixed;`) : null}`);
		return (this.args.isFixed ? htmlSafe(`position:fixed;`) : null);
	}
	// #endregion
}
