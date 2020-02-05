import Modifier from 'ember-modifier';
import debugLogger from 'ember-debug-logger';

export default class HasClassIfModifier extends Modifier {
	// #region Private Attributes
	debug = debugLogger('twyr-has-class-if-modifier');
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion

	// #region Lifecycle Hooks
	didReceiveArguments() {
		super.didReceiveArguments(...arguments);
		this.debug(`didReceiveArguments::element: `, this.element, `\nargs: `, this.args);

		const condition = this.args.positional[0];
		const classList = this.args.positional.slice(1);

		if(condition)
			this.element.classList.add(...classList);
		else
			this.element.classList.remove(...classList);
	}
	// #endregion
}
