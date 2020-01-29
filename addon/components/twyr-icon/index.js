import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { htmlSafe } from '@ember/string';

export default class TwyrIconComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('icon');
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion

	// #region Computed Properties
	get iconClass() {
		return this.args.positionalIcon || this.args.icon;
	}

	get spinClass() {
		return (this.args.spin ? 'md-spin' : (this.args.reverseSpin ? 'md-spin-reverse' : null));
	}

	get sizeStyle() {
		if(!this.args.size)
			return null;

		return htmlSafe(`height: ${this.args.size}px; min-height: ${this.args.size}px; min-width: ${this.args.size}px; font-size: ${this.args.size}px; line-height: ${this.args.size}px;`);
	}
	// #endregion
}
