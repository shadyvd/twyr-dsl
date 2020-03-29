import Modifier from 'ember-modifier';
import debugLogger from 'ember-debug-logger';

export default class ThemeColorModifier extends Modifier {
	// #region Private Attributes
	debug = debugLogger('twyr-color-themeable-modifier');
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
		this.debug(`didReceiveArguments: `, this.args);

		this.element.classList.remove('md-warn', 'md-secondary', 'md-primary', 'md-accent');

		if(this.args.named.accent === true) this.element.classList.add('md-accent');
		if(this.args.named.primary === true) this.element.classList.add('md-primary');
		if(this.args.named.secondary === true) this.element.classList.add('md-secondary');
		if(this.args.named.warn === true) this.element.classList.add('md-warn');
	}

	willRemove() {
		this.debug(`willRemove`);

		this.element.classList.remove('md-warn', 'md-secondary', 'md-primary', 'md-accent');
		super.willRemove(...arguments);
	}
	// #endregion
}
