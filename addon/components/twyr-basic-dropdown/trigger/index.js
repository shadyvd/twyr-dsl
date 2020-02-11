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

		if(isPresent(this.args.registerWithDropdown) && (typeof this.args.registerWithDropdown === 'function')) {
			this.debug(`didInsert::registerWithDropdown`);
			this.args.registerWithDropdown(this._element);
		}
	}

	willDestroy() {
		this.debug(`willDestroy`);

		if(typeof document !== undefined) {
			this.debug(`willDestroy::document::removeEventListener`);
			document.removeEventListener('mouseup', this._handleMouseup, true);
			document.removeEventListener('touchmove', this._handleTouchmove);
		}

		super.willDestroy(...arguments);
	}
	// #endregion

	// #region Computed Properties
	get eventType() {
		if(isPresent(this.args.rootEventType)) {
			this.debug(`eventType::args: ${this.args.rootEventType}`);
			return this.args.rootEventType;
		}

		this.debug(`eventType: click`);
		return 'click';
	}

	get stopPropagation() {
		if(isPresent(this.args.stopPropagation)) {
			this.debug(`stopPropagation::args: ${this.args.stopPropagation}`);
			return this.args.stopPropagation;
		}

		this.debug(`stopPropagation: false`);
		return false;
	}
	// #endregion

	// #region Private Methods
	_stopTextSelectionUntilMouseup() {
		this.debug(`_stopTextSelectionUntilMouseup`);
		document.addEventListener('mouseup', this._handleMouseup, true);
		document.body.classList.add('twyr-basic-dropdown-text-select-disabled');
	}
	// #endregion

	// #region Actions
	@action
	handleClick(event) {
		this.debug(`handleClick: `, event);

		if (this.isDestroying || this.isDestroyed || this.args.dropdownStatus.isDisabled) {
			this.debug(`handleClick::isDestroying`);
			return;
		}

		if (this.eventType !== 'click' || event.button !== 0) {
			this.debug(`handleClick::eventType: ${this.eventType}, event.button? ${event.button}`);
			return;
		}

		if (this.stopPropagation) {
			this.debug(`handleClick::stopPropagation: ${this.stopPropagation}`);
			event.stopPropagation();
		}

		if (this._toggleIsBeingHandledByTouchEvents) {
			this.debug(`handleClick::_toggleIsBeingHandledByTouchEvents: ${this._toggleIsBeingHandledByTouchEvents}`);

			// Some devises have both touchscreen & mouse, and they are not mutually exclusive
			// In those cases the touchdown handler is fired first, and it sets a flag to
			// short-circuit the mouseup so the component is not opened and immediately closed.
			this._toggleIsBeingHandledByTouchEvents = false;
			return;
		}

		if(this.args.dropdownControls && isPresent(this.args.dropdownControls.toggle) && (typeof this.args.dropdownControls.toggle === 'function')) {
			this.debug(`handleClick::dropdownControls::toggle`);
			this.args.dropdownControls.toggle(event);
		}
	}

	@action
	handleKeydown(event) {
		this.debug(`handleKeydown: `, event);

		if(this.args.dropdownStatus.isDisabled) {
			this.debug(`handleKeydown::isDisabled: true`);
			return;
		}

		if(!this.args.dropdownControls || !isPresent(this.args.dropdownControls.toggle) || (typeof this.args.dropdownControls.toggle !== 'function')) {
			this.debug(`handleKeydown::dropdownControls::toggle: not available`);
			return;
		}

		if((event.keyCode !== this.constants.KEYCODE.ENTER) && (event.keyCode !== this.constants.KEYCODE.SPACE) && (event.keyCode !== this.constants.KEYCODE.ESCAPE)) {
			this.debug(`handleKeydown::keyCode: useless`);
			return;
		}

		if(event.keyCode === this.constants.KEYCODE.SPACE) {
			this.debug(`handleKeydown::keyCode: SPACE`);
			event.preventDefault();
		}

		this.debug(`handleKeydown::dropdownControls::toggle`);
		this.args.dropdownControls.toggle(event);
	}

	@action
	handleMousedown(event) {
		this.debug(`handleMousedown: `, event);

		if (this.isDestroying || this.isDestroyed || this.args.dropdownStatus.isDisabled) {
			this.debug(`handleMousedown::isDestroying: true`);
			return;
		}

		if (this.eventType !== 'click' || event.button !== 0) {
			this.debug(`handleMousedown::eventType: ${this.eventType}, event.button? ${event.button}`);
			return;
		}

		if (this.stopPropagation) {
			this.debug(`handleMousedown::stopPropagation: ${this.stopPropagation}`);
			event.stopPropagation();
		}

		this.debug(`handleMousedown::_stopTextSelectionUntilMouseup`);
		this._stopTextSelectionUntilMouseup();

		if (this._toggleIsBeingHandledByTouchEvents) {
			this.debug(`handleMousedown::_toggleIsBeingHandledByTouchEvents: ${this._toggleIsBeingHandledByTouchEvents}`);

			// Some devises have both touchscreen & mouse, and they are not mutually exclusive
			// In those cases the touchdown handler is fired first, and it sets a flag to
			// short-circuit the mouseup so the component is not opened and immediately closed.
			this._toggleIsBeingHandledByTouchEvents = false;
			return;
		}

		if(this.args.dropdownControls && isPresent(this.args.dropdownControls.toggle) && (typeof this.args.dropdownControls.toggle === 'function')) {
			this.debug(`handleMousedown::dropdownControls::toggle`);
			this.args.dropdownControls.toggle(event);
		}
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

		if((event && event.defaultPrevented) || this.args.dropdownStatus.isDisabled) {
			this.debug(`handleTouchend::event::defaultPrevented`);
			return;
		}

		this.debug(`handleTouchend::event: preventDefault`);
		event.preventDefault();

		if (!this._hasMoved) {
			this.debug(`handleTouchend::_hasMoved::toggle`);
			this.args.dropdownControls.toggle(event);
		}

		this.debug(`handleTouchend::_hasMoved: false`);
		this._hasMoved = false;

		this.debug(`handleTouchend::document::removeListener: touchmove`);
		document.removeEventListener('touchmove', this._handleTouchmove);

		// This next three lines are stolen from hammertime. This prevents the default
		// behaviour of the touchend, but synthetically trigger a focus and a (delayed) click
		// to simulate natural behaviour.
		this.debug(`handleTouchend::event::target: focus`);
		event.target.focus();

		setTimeout(function() {
			this.debug(`handleTouchend::setTimeout`);
			if (!event.target) {
				this.debug(`handleTouchend::setTimeout::event::target: null`);
				return;
			}

			let evt;
			try {
				evt = document.createEvent('MouseEvents');
				evt.initMouseEvent('click', true, true, window);
			}
			catch (e) {
				evt = new Event('click');
			}
			finally {
				this.debug(`handleTouchend::event::target::dispatchEvent: `, evt);
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
