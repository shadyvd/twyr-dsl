import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';

export default class TwyrButtonComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('button');
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
	}
	// #region
}
