import Component from '@glimmer/component';
import config from 'ember-get-config';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';
import { calculateDropdownPosition } from 'twyr-dsl/utils/calculate-dropdown-position';
import { isPresent } from '@ember/utils';
import { set } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class TwyrBasicDropdownComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('twyr-basic-dropdown');
	_element = null;
	// #endregion

	// #region Tracked Attributes
	@tracked _currentPosition = {
		'top': null,
		'left': null,
		'bottom': null,
		'right': null,
		'height': null,
		'width': null
	};

	@tracked _dropdownControls = {
		'close': null,
		'open': null,
		'reposition': null,
		'toggle': null
	};

	@tracked _dropdownStatus = {
		'isDisabled': false,
		'isOpen': false
	};

	@tracked _elementId = null;
	@tracked _otherStyles = {};
	// #endregion

	// #region Yielded Sub-components
	subComponents = {
		'content': 'twyr-basic-dropdown/content',
		'trigger': 'twyr-basic-dropdown/trigger'
	};
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);

		this._dropdownControls.close = this.close.bind(this);
		this._dropdownControls.open = this.open.bind(this);
		this._dropdownControls.reposition = this.reposition.bind(this);
		this._dropdownControls.toggle = this.toggle.bind(this);
	}
	// #endregion

	// #region Lifecycle Hooks
	@action
	didInsert(element) {
		this.debug(`didInsert`);
		this._element = element;

		if(this._element.hasAttribute('disabled')) {
			this.debug(`didInsert::isDisabled: true`);
			set(this._dropdownStatus, 'isDisabled', true);
		}

		if((this._element.hasAttribute('id')) && (this._elementId !== this._element.getAttribute('id'))) {
			this.debug(`didInsert::_elementId: ${this._element.getAttribute('id')}`);
			this._elementId = this._element.getAttribute('id');
		}

		if(isPresent(this.args.setControls) && (typeof this.args.setControls === 'function')) {
			this.debug(`didInsert::setControls`);
			this.args.setControls(Object.assign({}, this._dropdownControls));
		}

		if(isPresent(this.args.setStatus) && (typeof this.args.setStatus === 'function')) {
			this.debug(`didInsert::setStatus`);
			this.args.setStatus(Object.assign({}, this._dropdownStatus));
		}
	}

	@action
	didMutate() {
		this.debug(`didMutate`);

		if(this._element && this._element.hasAttribute('disabled')) {
			if(!this._dropdownStatus.isDisabled) {
				this.debug(`didMutate::isDisabled: true`);
				set(this._dropdownStatus, 'isDisabled', true);
			}
		}
		else {
			if(this._dropdownStatus.isDisabled) {
				this.debug(`didMutate::isDisabled: false`);
				set(this._dropdownStatus, 'isDisabled', false);
			}
		}

		if((this._element.hasAttribute('id')) && (this._elementId !== this._element.getAttribute('id'))) {
			this.debug(`didMutate::_elementId: ${this._element.getAttribute('id')}`);
			this._elementId = this._element.getAttribute('id');
		}

		// If open when disabled, close
		if(this._dropdownStatus.isOpen && this._dropdownStatus.isDisabled) {
			this.debug(`didMutate::close`);
			this.close();

			return;
		}
	}

	willDestroy() {
		this.debug(`willDestroy`);

		// Release references to DOM Objects
		this.debug(`willDestroy: Release DOM Element references`);
		this._contentComponentElement = null;
		this._triggerComponentElement = null;

		// Trigger @tracked behaviour...
		this.debug(`willDestroy: Trigger tracked behaviour`);
		this._dropdownControls = {};
		this._dropdownStatus = {};
		this._otherStyles = {};

		if(isPresent(this.args.setControls) && (typeof this.args.setControls === 'function')) {
			this.debug(`willDestroy: setControls`);
			this.args.setControls(Object.assign({}, this._dropdownControls));
		}

		if(isPresent(this.args.setStatus) && (typeof this.args.setStatus === 'function')) {
			this.debug(`willDestroy: setStatus`);
			this.args.setStatus(Object.assign({}, this._dropdownStatus));
		}

		this.debug(`willDestroy: super`);
		super.willDestroy(...arguments);
	}
	// #endregion

	// #region Computed Properties
	get destinationId() {
		this.debug(`destinationId: ${(config['twyr-basic-dropdown'] && config['twyr-basic-dropdown'].destinationId) || 'twyr-wormhole'}`);
		return ((config['twyr-basic-dropdown'] && config['twyr-basic-dropdown'].destinationId) || 'twyr-wormhole');
	}

	get matchTriggerWidth() {
		if(isPresent(this.args.matchTriggerWidth)) {
			this.debug(`matchTriggerWidth::args: ${this.args.matchTriggerWidth}`);
			return this.args.matchTriggerWidth;
		}

		this.debug(`matchTriggerWidth: false`);
		return false;
	}

	get renderInPlace() {
		if(isPresent(this.args.renderInPlace)) {
			this.debug(`renderInPlace::args: ${this.args.renderInPlace}`);
			return this.args.renderInPlace;
		}

		this.debug(`renderInPlace: false`);
		return false;
	}

	get xAlign() {  // auto | auto-left | auto-right | left | center | right
		if(isPresent(this.args.xAlign)) {
			this.debug(`xAlign::args: ${this.args.xAlign}`);
			return this.args.xAlign;
		}

		this.debug(`xAlign: auto`);
		return 'auto';
	}

	get yAlign() { // auto | above | below
		if(isPresent(this.args.yAlign)) {
			this.debug(`yAlign::args: ${this.args.yAlign}`);
			return this.args.yAlign;
		}

		this.debug(`yAlign: auto`);
		return 'auto';
	}
	// #endregion

	// #region Private Methods
	_applyReposition(triggerElement, contentElement, positionData) {
		this.debug(`_applyReposition`);
		const newPosition = {
			'top': positionData.top,
			'left': positionData.left,
			'bottom': positionData.bottom,
			'right': positionData.right,
			'height': positionData.height,
			'width': positionData.width
		};

		this.debug(`_applyReposition::newPosition: `, newPosition);

		const newOtherStyles = Object.assign({}, this._otherStyles);
		Object.keys(positionData).forEach((key) => {
			if(Object.keys(newPosition).includes(key))
				return;

			newOtherStyles[key] = positionData[key];
		});

		this.debug(`_applyReposition::newOtherStyles: `, newOtherStyles);

		// First time around, set this here to prevent flickering
		if(this._currentPosition.top === null) {
			this.debug(`_applyReposition::_currentPosition::top: null`);

			const cssRules = [];
			Object.keys(newPosition).forEach((key) => {
				cssRules.push(`${key}:${newPosition[key]}px`);
			});

			Object.keys(newOtherStyles).forEach((key) => {
				cssRules.push(`${key}:${newOtherStyles[key]}`);
			});

			if(contentElement) {
				this.debug(`_applyReposition::contentElement::style: ${cssRules.join('; ')}`);
				contentElement.setAttribute('style', cssRules.join('; '));
			}
		}

		// Trigger @tracked behaviour...
		this.debug(`_applyReposition: Trigger tracked behaviour`);
		this._currentPosition = newPosition;
		this._otherStyles = newOtherStyles;
	}
	// #endregion

	// #region Actions
	@action
	close(event, skipFocus) {
		this.debug(`close`);

		if(this.isDestroying || this.isDestroyed) {
			this.debug(`close::isDestroying #1`);
			return;
		}

		let parentCloseRetValue = true;
		if(isPresent(this.args.onClose) && (typeof this.args.onClose === 'function'))
			parentCloseRetValue = this.args.onClose(event, skipFocus);

		this.debug(`close::parentCloseRetValue: ${parentCloseRetValue}`);
		if(!parentCloseRetValue)
			return;

		if(this.isDestroying || this.isDestroyed) {
			this.debug(`close::isDestroying #2`);
			return;
		}

		this.debug(`close::trigger tracked behaviour #1`);
		set(this._dropdownStatus, 'isOpen', false);

		if(isPresent(this.args.setStatus) && (typeof this.args.setStatus === 'function')) {
			this.debug(`close::setStatus`);
			this.args.setStatus(Object.assign({}, this._dropdownStatus));
		}

		if(this.isDestroying || this.isDestroyed) {
			this.debug(`close::isDestroying #3`);
			return;
		}

		if(skipFocus) {
			this.debug(`close::skipFocus`);
			return;
		}

		if(!this._triggerComponentElement) {
			this.debug(`close::_triggerComponentElement: null`);
			return;
		}

		if(this._triggerComponentElement.hasAttribute('tabindex') && (Number(this._triggerComponentElement.getAttribute('tabindex')) >= 0)) {
			this.debug(`close::_triggerComponentElement::focus`);
			this._triggerComponentElement.focus();
		}
	}

	@action
	open(event) {
		this.debug(`open`);

		if(this.isDestroying || this.isDestroyed) {
			this.debug(`open::isDestroying #1`);
			return;
		}

		let parentOpenRetValue = true;
		if(isPresent(this.args.onOpen) && (typeof this.args.onOpen === 'function'))
			parentOpenRetValue = this.args.onOpen(event);

		this.debug(`open::parentOpenRetValue: ${parentOpenRetValue}`);
		if(!parentOpenRetValue)
			return;

		if(this.isDestroying || this.isDestroyed) {
			this.debug(`open::isDestroying #2`);
			return;
		}

		this.debug(`open::trigger tracked behaviour`);
		set(this._dropdownStatus, 'isOpen', true);

		if(isPresent(this.args.setStatus) && (typeof this.args.setStatus === 'function')) {
			this.debug(`open::setStatus`);
			this.args.setStatus(Object.assign({}, this._dropdownStatus));
		}
	}

	@action
	reposition() {
		this.debug(`reposition`);

		if(this.isDestroying || this.isDestroyed) {
			this.debug(`reposition::isDestroying #1`);
			return;
		}

		if(!this._dropdownStatus.isOpen) {
			this.debug(`reposition::_dropdownStatus::isOpen: false`);
			return;
		}

		if(!this._element || !this._contentComponentElement || !this._triggerComponentElement) {
			this.debug(`reposition::elements not present`);
			return;
		}

		const destinationElement = document.getElementById(this.destinationId);
		const triggerElement =this._triggerComponentElement;
		const contentElement =this._contentComponentElement;
		const options = {
			'otherStyles': Object.assign({}, this._otherStyles),
			'position': Object.assign({}, this._currentPosition),

			'xAlign': this.xAlign,
			'yAlign': this.yAlign,

			'matchTriggerWidth': this.matchTriggerWidth,
			'renderInPlace': this.renderInPlace
		};

		const calcFunc = (this.args.calculatePosition || calculateDropdownPosition);
		const positionData = calcFunc(destinationElement, triggerElement, contentElement, options);
		this.debug(`reposition::positionData: `, positionData);

		if(isPresent(this.args.setAlign) && (typeof this.args.setAlign === 'function')) {
			this.args.setAlign({
				'xAlign': positionData.xAlign,
				'yAlign': positionData.yAlign
			});
		}

		delete positionData.xAlign;
		delete positionData.yAlign;

		this.debug(`reposition::_applyReposition`);
		return this._applyReposition(triggerElement, contentElement, positionData);
	}

	@action
	toggle(event) {
		this.debug(`toggle`);
		if(this._dropdownStatus.isOpen)
			this.close(event, false);
		else
			this.open(event);
	}

	@action
	registerContentElement(contentElement) {
		this.debug(`registerContentElement: `, contentElement);
		this._contentComponentElement = contentElement;
	}

	@action
	registerTriggerElement(triggerElement) {
		this.debug(`registerTriggerElement: `, triggerElement);
		this._triggerComponentElement = triggerElement;
	}
	// #endregion
}
