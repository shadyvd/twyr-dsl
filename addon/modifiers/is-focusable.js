import Modifier from 'ember-modifier';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';

export default class FocusableModifier extends Modifier {
	// #region Private Attributes
	debug = debugLogger('twyr-is-focusable-modifier');
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
		this.debug(`arguments:`, arguments);
	}
	// #endregion

	// #region Lifecycle Hooks
	didInstall() {
		super.didInstall(...arguments);
		this.debug(`didInstall: `, this.args);

		this.element.addEventListener('focusin', this.onFocusIn, true);
		this.element.addEventListener('focusout', this.onFocusOut, true);

		this.element.addEventListener('mouseenter', this.onMouseEnter, true);
		this.element.addEventListener('mouseleave', this.onMouseLeave, true);

		this.element.addEventListener('mousedown', this.onMouseDown, true);
		this.element.addEventListener('mouseup', this.onMouseUp, true);

		this.element.addEventListener('touchstart', this.onMouseDown, true);
		this.element.addEventListener('touchend', this.onMouseUp, true);
		this.element.addEventListener('touchcancel', this.onMouseUp, true);

		if(this.element.hasAttribute('tabindex'))
			return;

		const tabIndex = this.element.hasAttribute('disabled') ? '-1' : '0';
		this.element.setAttribute('tabindex', tabIndex);
	}

	didReceiveArguments() {
		super.didReceiveArguments(...arguments);
		this.debug(`didReceiveArguments: `, this.args);

		if(this.element.hasAttribute('tabindex'))
			return;

		const tabIndex = this.element.hasAttribute('disabled') ? '-1' : '0';
		this.element.setAttribute('tabindex', tabIndex);
	}

	willRemove() {
		this.debug(`willRemove`);

		this.element.removeEventListener('touchcancel', this.onMouseUp, true);
		this.element.removeEventListener('touchend', this.onMouseUp, true);
		this.element.removeEventListener('touchstart', this.onMouseDown, true);

		this.element.removeEventListener('mouseup', this.onMouseUp, true);
		this.element.removeEventListener('mousedown', this.onMouseDown, true);

		this.element.removeEventListener('mouseleave', this.onMouseLeave, true);
		this.element.removeEventListener('mouseenter', this.onMouseEnter, true);

		this.element.removeEventListener('focusout', this.onFocusOut, true);
		this.element.removeEventListener('focusin', this.onFocusIn, true);

		super.willRemove(...arguments);
	}
	// #endregion

	// #region DOM Event Handlers
	@action
	onFocusIn(event) {
		if(this.element.hasAttribute('disabled') || (this.args.named.focusOnlyOnKey === true))
			return;

		this.debug('onFocusIn: ', event);
		this.element.classList.add(this.focusClass);

		if(this.args.named.onFocusIn && (typeof this.args.named.onFocusIn === 'function'))
			this.args.named.onFocusIn(event);
	}

	@action
	onFocusOut(event) {
		this.debug('onFocusOut: ', event);
		this.element.classList.remove(this.focusClass);

		if(this.args.named.onFocusOut && (typeof this.args.named.onFocusOut === 'function'))
			this.args.named.onFocusOut(event);
	}

	@action
	onMouseEnter(event) {
		this.debug('onMouseEnter: ', event);
		this.element.setAttribute(this.mouseOverAttribute, "");

		if(this.args.named.onMouseEnter && (typeof this.args.named.onMouseEnter === 'function'))
			this.args.named.onMouseEnter(event);
	}

	@action
	onMouseLeave(event) {
		this.debug('onMouseLeave: ', event);
		this.element.removeAttribute(this.mouseOverAttribute);

		if(this.args.named.onMouseLeave && (typeof this.args.named.onMouseLeave === 'function'))
			this.args.named.onMouseLeave(event);
	}

	@action
	onMouseDown(event) {
		this.debug('onMouseDown: ', event);
		this.element.setAttribute(this.mouseDownAttribute, "");

		if(this.args.named.onMouseDown && (typeof this.args.named.onMouseDown === 'function'))
			this.args.named.onMouseDown(event);
	}

	@action
	onMouseUp(event) {
		this.debug('onMouseUp: ', event);
		this.element.removeAttribute(this.mouseDownAttribute);

		if(this.args.named.onMouseUp && (typeof this.args.named.onMouseUp === 'function'))
			this.args.named.onMouseUp(event);
	}
	// #endregion

	// #region Computed Properties
	get focusClass() {
		this.debug('focusClass: ', (this.args.named.focusClass || 'md-focused'));
		return this.args.named.focusClass || 'md-focused';
	}

	get mouseOverAttribute() {
		this.debug('mouseOverAttribute: ', (this.args.named.mouseOverAttribute || 'hover'));
		return this.args.named.mouseOverAttribute || 'hover';
	}

	get mouseDownAttribute() {
		this.debug('mouseDownAttribute: ', (this.args.named.mouseDownAttribute || 'active'));
		return this.args.named.mouseDownAttribute || 'active';
	}
	// #endregion
}
