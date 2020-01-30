import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';
import { isPresent } from '@ember/utils';
import { tracked } from '@glimmer/tracking';

export default class TwyrItemComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('twyr-item');

	@tracked _childElements = [];
	// #endregion

	// #region Tracked Attributes
	@tracked focused = false;
	// #endregion

	// #region Yielded Sub-components
	subComponents = {
		'button': 'twyr-button',
		'checkbox': 'twyr-checkbox',
		'radioGroup': 'twyr-radio-group',
		'switch': 'twyr-switch'
	};
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion

	// #region DOM Event Handlers
	@action
	handleClick() {
		this.debug(`handleClick`);
		this.childComponents.forEach((childComponent) => {
			if(!childComponent._element) {
				this.debug(`handleClick::childComponent::_element: null`);
				return;
			}

			if(childComponent._element.hasAttribute('disabled')) {
				this.debug(`handleClick::childComponent::_element: disabled`);
				return;
			}

			if(!(childComponent.args.bubbles | this.hasPrimaryAction)) {
				this.debug(`handleClick::childComponent::bubbles | hasPrimaryAction`);
				return;
			}

			if(!childComponent.args.onChange) {
				this.debug(`handleClick::childComponent::onChange: null`);
				return;
			}

			if(typeof childComponent.args.onChange !== 'function') {
				this.debug(`handleClick::childComponent::onChange: not a func`);
				return;
			}

			this.debug(`handleClick::childComponent::onChange: ${!childComponent.args.value}`);
			childComponent.args.onChange(!childComponent.args.value);
		});
	}

	@action
	handlePrimaryAction() {
		this.debug(`handlePrimaryAction`);
		if(isPresent(this.args.onClick) && (typeof this.args.onClick === 'function')) {
			this.debug(`handlePrimaryAction: `, arguments);
			this.args.onClick(...arguments);
		}
	}

	@action
	handleFocusIn() {
		this.debug(`handleFocusIn`);
		this.focused = true;
	}

	@action
	handleFocusOut() {
		this.debug(`handleFocusOut`);
		this.focused = false;
	}

	@action
	handleMouseEnter(event) {
		this.debug(`handleMouseEnter`);
		if(isPresent(this.args.onMouseEnter) && (typeof this.args.onMouseEnter === 'function'))
			this.args.onMouseEnter(event);
	}

	@action
	handleMouseLeave(event) {
		this.debug(`handleMouseLeave`);
		if(isPresent(this.args.onMouseLeave) && (typeof this.args.onMouseLeave === 'function'))
			this.args.onMouseLeave(event);
	}
	// #endregion

	// #region Computed Properties
	get childComponents() {
		const _children = this._childElements.filter((childComponent) => {
			return !childComponent.args.skipProxy;
		});

		this.debug(`childComponents: `, _children);
		return _children;
	}

	get hasChildComponents() {
		this.debug(`hasChildComponents: ${!!this.childComponents.length}`);
		return !!this.childComponents.length;
	}

	get hasPrimaryAction() {
		this.debug(`hasPrimaryAction: ${(isPresent(this.args.onClick) && (typeof this.args.onClick === 'function')) || isPresent(this.args.href)}`);
		return (isPresent(this.args.onClick) && (typeof this.args.onClick === 'function')) || isPresent(this.args.href);
	}

	get noRippleInk() {
		this.debug(`noRippleInk: ${this.hasPrimaryAction || !this.hasChildComponents}`);
		return (this.hasPrimaryAction || !this.hasChildComponents);
	}

	get role() {
		if(isPresent(this.args.role)) {
			this.debug(`role: ${this.args.role}`);
			return this.args.role;
		}

		this.debug(`role: listitem`);
		return 'listitem';
	}

	get shouldBeClickable() {
		this.debug(`shouldBeClickable: ${this.hasChildComponents || (isPresent(this.args.onClick) && (typeof this.args.onClick === 'function'))}`);
		return (this.hasChildComponents || (isPresent(this.args.onClick) && (typeof this.args.onClick === 'function')));
	}

	get tabindex() {
		if(isPresent(this.args.tabindex)) {
			this.debug(`tabindex: ${this.args.tabindex}`);
			return this.args.tabindex;
		}

		this.debug(`tabindex: -1`);
		return '-1';
	}
	// #endregion

	// #region Actions
	@action
	registerChild(child, register) {
		this.debug(`registerChild::child: `, child, `, register: ${register}`);

		if(register) {
			if(!this._childElements.includes(child))
				this._childElements.push(child);
		}
		else {
			if(this._childElements.includes(child))
				this._childElements.splice(this._childElements.indexOf(child), 1);
		}
	}
	// #endregion
}
