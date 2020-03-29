import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class TwyrSwitchComponent extends Component {
	// #region Services
	@service constants;
	// #endregion

	// #region Private Attributes
	debug = debugLogger('twyr-switch');

	_dragAmount = null;
	_element = null;
	_switchContainerHammer = null;
	_switchHammer = null;
	_switchWidth = 0;
	// #endregion

	// #region Tracked Attributes
	@tracked _isDragging = false;
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);

		this.handleContainerClick = this._handleContainerClick.bind(this);
	}
	// #endregion

	// #region Lifecycle Hooks
	@action
	didInsert(element) {
		this.debug(`didInsert`);
		this._element = element;

		if(this.args.registerWithParent && (typeof this.args.registerWithParent === 'function'))
			this.args.registerWithParent(this, true);

		if(element.hasAttribute('disabled'))
			return;

		this._setupSwitch();
	}

	@action
	didMutate() {
		this.debug(`didMutate`);
		if(!this._element) return;

		if(this._element.hasAttribute('disabled')) {
			if(this._switchContainerHammer) {
				this.debug(`didReceiveArgs::_switchContainerHammer::enable: false`);
				this._switchContainerHammer.enable = false;
			}

			return;
		}

		if(!this._switchContainerHammer) {
			this.debug(`didReceiveArgs::_setupSwitch`);
			this._setupSwitch();
			return;
		}

		this.debug(`didReceiveArgs::_switchContainerHammer::enable: true`);
		this._switchContainerHammer.enable = true;
	}

	willDestroy() {
		this.debug(`willDestroy`);

		if(this.args.registerWithParent && (typeof this.args.registerWithParent === 'function'))
			this.args.registerWithParent(this, false);

		this._teardownSwitch();
		super.willDestroy(...arguments);
	}
	// #endregion

	// #region DOM Event Handlers
	@action
	handleKeypress(event) {
		this.debug(`handleKeypress`);

		if((event.which !== this.constants.KEYCODE.SPACE) && (event.which !== this.constants.KEYCODE.ENTER))
			return;

		event.preventDefault();
		this._dragEnd();
	}
	// #endregion

	// #region Computed Properties
	get ariaChecked() {
		this.debug(`ariaChecked: ${this.isChecked ? 'true' : 'false'}`);
		return this.isChecked ? 'true' : 'false';
	}

	get isChecked() {
		this.debug(`isChecked: ${!!this.args.value}`);
		return (!!this.args.value);
	}

	get role() {
		this.debug(`role: ${this.args.role || 'checkbox'}`);
		return this.args.role || 'checkbox';
	}

	get thumbContainerStyle() {
		if(!this._isDragging) {
			this.debug(`thumbContainerStyle: undefined`);
			return undefined;
		}

		const translate = Math.max(0, Math.min(100, this._dragAmount * 100));
		const transformProp = `translate3d(${translate}%, 0, 0)`;

		this.debug(`thumbContainerStyle::transform: ${transformProp};`);
		return htmlSafe(`transform: ${transformProp};`);
	}
	// #endregion

	// #region Private Methods
	_dragStart() {
		this.debug(`_dragStart`);
		this._dragAmount = Number(this.args.value);
		this._isDragging = true;
	}

	_drag(event) {
		if(!this._element)
			return;

		if(this._element.hasAttribute('disabled'))
			return;

		// Set the amount the switch has been dragged
		this._dragAmount = Number(this.args.value) + (event.deltaX / this._switchWidth);
		this.debug(`_drag::_dragAmount: ${this._dragAmount}`);
	}

	_dragEnd() {
		this.debug(`_dragEnd`);

		this._isDragging = false;
		this._dragAmount = null;

		if(!this._element)
			return;

		if(this._element.hasAttribute('disabled'))
			return;

		if(!this.args.onChange)
			return;

		if(typeof this.args.onChange !== 'function')
			return;

		if(!this._isDragging || (this.args.value && (this._dragAmount < 0.5)) || (!this.args.value && (this._dragAmount > 0.5))) {
			this.args.onChange(!this.args.value);
		}
	}

	_setupSwitch() {
		if(!this._element) {
			this.debug(`_setupSwitch::_element: null`);
			return;
		}

		this._switchWidth = this._element.querySelector('.md-thumb-container').offsetWidth;

		const switchContainer = this._element.querySelector('.md-container');
		this._switchContainerHammer = new window.Hammer(switchContainer);

		// Enable dragging the switch container
		this._switchContainerHammer.on('panstart', this._dragStart.bind(this));
		this._switchContainerHammer.on('panmove', this._drag.bind(this))
		this._switchContainerHammer.on('panend', this._dragEnd.bind(this));

		// Enable tapping gesture on the switch
		this._switchHammer = new window.Hammer(this._element);
		this._switchHammer.on('tap', this._dragEnd.bind(this));

		this.debug(`_setupSwitch::done`);
		this._element.querySelector('.md-container').addEventListener('click', this.handleContainerClick);
	}

	_teardownSwitch() {
		this.debug(`_teardownSwitch`);
		if(this._switchContainerHammer) {
			this._switchContainerHammer.destroy();
			this._switchHammer.destroy();
		}

		this._element.querySelector('.md-container').removeEventListener('click', this.handleContainerClick);
	}

	_handleContainerClick(event) {
		this.debug(`_handleContainerClick`);
		if(this.args.bubbles === false) {
			event.preventDefault();
			event.stopPropagation();
		}
	}
	// #endregion
}
