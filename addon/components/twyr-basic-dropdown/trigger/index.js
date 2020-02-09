import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isPresent } from '@ember/utils';

export default class TwyrBasicDropdownTriggerComponent extends Component {
	// #region Services
	@service constants;
	// #endregion

	// #region Private Attributes
	debug = debugLogger('twyr-basic-dropdown-trigger');

	_element = null;
	_hasMoved = false;
	_toggleIsBeingHandledByTouchEvents = false;
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);

		this._handleTouchmove = this.handleTouchmove.bind(this);
		this._handleMouseup = this.handleMouseup.bind(this);
	}
	// #endregion

	// #region Lifecycle Hooks
	@action
	didInsert(element) {
		this.debug(`didInsert`);
		this._element = element;

		if(isPresent(this.args.registerWithDropdown) && (typeof this.args.registerWithDropdown === 'function'))
			this.args.registerWithDropdown(this._element);
	}

	willDestroy() {
		this.debug(`willDestroy`);

		if(typeof document !== undefined) {
			document.removeEventListener('mouseup', this._handleMouseup, true);
			document.removeEventListener('touchmove', this._handleTouchmove);
		}

		super.willDestroy(...arguments);
	}
	// #endregion

	// #region Computed Properties
	get eventType() {
		if(isPresent(this.args.rootEventType)) {
			this.debug(`eventType: ${this.args.rootEventType}`);
			return this.args.rootEventType;
		}

		this.debug(`eventType: click`);
		return 'click';
	}

	get stopPropagation() {
		if(isPresent(this.args.stopPropagation)) {
			this.debug(`stopPropagation: ${this.args.stopPropagation}`);
			return this.args.stopPropagation;
		}

		this.debug(`stopPropagation: false`);
		return false;
	}
	// #endregion

	// #region Private Methods
	_stopTextSelectionUntilMouseup() {
		document.addEventListener('mouseup', this._handleMouseup, true);
		document.body.classList.add('twyr-basic-dropdown-text-select-disabled');
	}
	// #endregion

	// #region Actions
	@action
	handleClick(event) {
		this.debug(`handleClick: `, event);

		if (this.isDestroying || this.isDestroyed || this.args.dropdownStatus.isDisabled)
			return;

		if (this.eventType !== 'click' || event.button !== 0)
			return;

		if (this.stopPropagation)
			event.stopPropagation();

		if (this._toggleIsBeingHandledByTouchEvents) {
			// Some devises have both touchscreen & mouse, and they are not mutually exclusive
			// In those cases the touchdown handler is fired first, and it sets a flag to
			// short-circuit the mouseup so the component is not opened and immediately closed.
			this._toggleIsBeingHandledByTouchEvents = false;
			return;
		}

		if(this.args.dropdownControls && isPresent(this.args.dropdownControls.toggle) && (typeof this.args.dropdownControls.toggle === 'function'))
			this.args.dropdownControls.toggle(event);
	}

	@action
	handleKeydown(event) {
		this.debug(`handleKeydown: `, event);

		if(this.args.dropdownStatus.isDisabled)
			return;

		if(!this.args.dropdownControls || !isPresent(this.args.dropdownControls.toggle) || (typeof this.args.dropdownControls.toggle !== 'function'))
			return;

		if((event.keyCode !== this.constants.KEYCODE.ENTER) && (event.keyCode !== this.constants.KEYCODE.SPACE) && (event.keyCode !== this.constants.KEYCODE.ESCAPE))
			return;

		if(event.keyCode === this.constants.KEYCODE.SPACE)
			event.preventDefault();

		this.args.dropdownControls.toggle(event);
	}

	@action
	handleMousedown(event) {
		this.debug(`handleMousedown: `, event);

		if (this.isDestroying || this.isDestroyed || this.args.dropdownStatus.isDisabled)
			return;

		if (this.eventType !== 'click' || event.button !== 0)
			return;

		if (this.stopPropagation)
			event.stopPropagation();

		this._stopTextSelectionUntilMouseup();
		if (this._toggleIsBeingHandledByTouchEvents) {
			// Some devises have both touchscreen & mouse, and they are not mutually exclusive
			// In those cases the touchdown handler is fired first, and it sets a flag to
			// short-circuit the mouseup so the component is not opened and immediately closed.
			this._toggleIsBeingHandledByTouchEvents = false;
			return;
		}

		if(this.args.dropdownControls && isPresent(this.args.dropdownControls.toggle) && (typeof this.args.dropdownControls.toggle === 'function'))
			this.args.dropdownControls.toggle(event);
	}

	@action
	handleMouseup(event) {
		this.debug(`handleMouseup: `, event);

		document.removeEventListener('mouseup', this._handleMouseup, true);
		document.removeEventListener('touchmove', this._handleTouchmove);
	}

	@action
	handleTouchend(event) {
		this.debug(`handleTouchend: `, event);

		this._toggleIsBeingHandledByTouchEvents = true;
		if((event && event.defaultPrevented) || this.args.dropdownStatus.isDisabled)
			return;

		event.preventDefault();

		if (!this._hasMoved) {
			this.args.dropdownControls.toggle(event);
		}

		this._hasMoved = false;
		document.removeEventListener('touchmove', this._handleTouchmove);

		// This next three lines are stolen from hammertime. This prevents the default
		// behaviour of the touchend, but synthetically trigger a focus and a (delayed) click
		// to simulate natural behaviour.
		event.target.focus();
		setTimeout(function() {
			if (!event.target)
				return;

			let evt;
			try {
				evt = document.createEvent('MouseEvents');
				evt.initMouseEvent('click', true, true, window);
			}
			catch (e) {
				evt = new Event('click');
			}
			finally {
				event.target.dispatchEvent(evt);
			}
		}, 0);
	}

	@action
	handleTouchmove(event) {
		this.debug(`handleTouchmove: `, event);

		this._hasMoved = true;
		document.removeEventListener('touchmove', this._handleTouchmove);
	}

	@action
	handleTouchstart(event) {
		this.debug(`handleTouchstart: `, event);
		document.addEventListener('touchmove', this._handleTouchmove);
	}
	// #endregion
}
