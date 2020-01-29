import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { htmlSafe } from '@ember/string';

export default class TwyrInkBarComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('inkbar');
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion

	// #region Computed Styles
	get inkbarClass() {
		const inkClass = this.args.movingRight ? 'md-right' : 'md-left';
		this.debug(`inkbarClass: ${inkClass}`);

		return inkClass;
	}

	get inkbarPosition() {
		const left = this.args.left || '0';
		const right = this.args.right || '0';
		const position = htmlSafe(`left:${left}px;right:${right}px;`);

		this.debug(`inkbarPosition: ${position}`);
		return position;
	}
	// #endregion
}
