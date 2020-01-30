import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { htmlSafe } from '@ember/string';

export default class TwyrIconComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('twyr-icon');
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion

	// #region Computed Properties
	get iconClass() {
		this.debug(`iconClass: ${this.args.positionalIcon || this.args.icon}`);
		return this.args.positionalIcon || this.args.icon;
	}

	get spinClass() {
		this.debug(`spinClass: ${this.args.spin ? 'md-spin' : (this.args.reverseSpin ? 'md-spin-reverse' : null)}`);
		return (this.args.spin ? 'md-spin' : (this.args.reverseSpin ? 'md-spin-reverse' : null));
	}

	get sizeStyle() {
		if(!this.args.size) {
			this.debug(`sizeStyle: null`);
			return null;
		}

		this.debug(`sizeStyle: ${htmlSafe(`height: ${this.args.size}px; min-height: ${this.args.size}px; min-width: ${this.args.size}px; font-size: ${this.args.size}px; line-height: ${this.args.size}px;`)}`);
		return htmlSafe(`height: ${this.args.size}px; min-height: ${this.args.size}px; min-width: ${this.args.size}px; font-size: ${this.args.size}px; line-height: ${this.args.size}px;`);
	}
	// #endregion
}
