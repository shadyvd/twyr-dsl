import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';

export default class TwyrRadioGroupLabelComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('radio-group-label');
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

		if(this.args.setAriaLabelledby && (typeof this.args.setAriaLabelledby === 'function'))
			this.args.setAriaLabelledby(element.getAttribute('id'));
	}

	willDestroy() {
		this.debug(`willDestroy`);

		if(this.args.registerWithParent && (typeof this.args.registerWithParent === 'function'))
			this.args.registerWithParent(this, false);

		super.willDestroy(...arguments);
	}
	// #endregion
}
