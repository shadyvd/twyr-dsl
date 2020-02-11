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
		'height': null,
		'width': null
	};

	@tracked _dropdownControls = {};
	@tracked _dropdownStatus = {};
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

		set(this._dropdownStatus, 'isOpen', false);
		set(this._dropdownStatus, 'isDisabled', false);
	}
	// #endregion

	// #region Lifecycle Hooks
	@action
	didInsert(element) {
		this.debug(`didInsert`);
		this._element = element;

		if(element.hasAttribute('id')) {
			this._elementId = element.getAttribute('id');
		}
		else {
			this._elementId = null;
		}

		// Trigger @tracked behaviour
		this._dropdownControls = this._dropdownControls;
		this._dropdownStatus = this._dropdownStatus;

		if(isPresent(this.args.setControls) && (typeof this.args.setControls === 'function'))
			this.args.setControls(Object.assign({}, this._dropdownControls));

		if(isPresent(this.args.setStatus) && (typeof this.args.setStatus === 'function'))
			this.args.setStatus(Object.assign({}, this._dropdownStatus));
	}

	@action
	didMutate() {
		this.debug(`didMutate`);
		set(this._dropdownStatus, 'isDisabled', false);

		if(this._element && this._element.hasAttribute('disabled'))
			set(this._dropdownStatus, 'isDisabled', true);

		if(this._element.hasAttribute('id')) {
			this._elementId = this._element.getAttribute('id');
		}
		else {
			this._elementId = null;
		}

		// If open when disabled, close
		if(this._dropdownStatus.isOpen && this._dropdownStatus.isDisabled) {
			this.close();
			return;
		}

		// Trigger @tracked behaviour...
		this._dropdownStatus = this._dropdownStatus;

		if(isPresent(this.args.setStatus) && (typeof this.args.setStatus === 'function'))
			this.args.setStatus(Object.assign({}, this._dropdownStatus));
	}

	willDestroy() {
		this.debug(`willDestroy`);

		// Release references to DOM Objects
		this._contentComponentElement = null;
		this._triggerComponentElement = null;

		// Trigger @tracked behaviour...
		this._dropdownControls = {};
		this._dropdownStatus = {};
		this._otherStyles = {};

		if(isPresent(this.args.setControls) && (typeof this.args.setControls === 'function'))
			this.args.setControls(Object.assign({}, this._dropdownControls));

		if(isPresent(this.args.setStatus) && (typeof this.args.setStatus === 'function'))
			this.args.setStatus(Object.assign({}, this._dropdownStatus));

		super.willDestroy(...arguments);
	}
	// #endregion

	// #region Computed Properties
	get destinationId() {
		return (config['twyr-basic-dropdown'] && config['twyr-basic-dropdown'].destinationId) || 'twyr-wormhole';
	}

	get matchTriggerWidth() {
		if(isPresent(this.args.matchTriggerWidth))
			return this.args.matchTriggerWidth;

		return false;
	}

	get renderInPlace() {
		if(isPresent(this.args.renderInPlace))
			return this.args.renderInPlace;

		return false;
	}

	get xAlign() {  // auto | auto-left | auto-right | left | center | right
		if(isPresent(this.args.xAlign))
			return this.args.xAlign;

		return 'auto';
	}

	get yAlign() { // auto | above | below
		if(isPresent(this.args.yAlign))
			return this.args.yAlign;

		return 'auto';
	}
	// #endregion

	// #region Private Methods
	_applyReposition(triggerElement, contentElement, positionData) {
		const newPosition = {
			'top': positionData.top,
			'left': positionData.left,
			'height': positionData.height,
			'width': positionData.width
		};

		const newOtherStyles = Object.assign({}, this._otherStyles);
		Object.keys(positionData).forEach((key) => {
			if(Object.keys(newPosition).includes(key))
				return;

			newOtherStyles[key] = positionData[key];
		});

		// First time around, set this here to prevent flickering
		if(this._currentPosition.top === null) {
			const cssRules = [];
			Object.keys(newPosition).forEach((key) => {
				cssRules.push(`${key}:${newPosition[key]}px`);
			});

			Object.keys(newOtherStyles).forEach((key) => {
				cssRules.push(`${key}:${newOtherStyles[key]}`);
			});

			if(contentElement) {
				contentElement.setAttribute('style', cssRules.join('; '));
			}
		}

		// Trigger @tracked behaviour...
		this._currentPosition = newPosition;
		this._otherStyles = newOtherStyles;
	}
	// #endregion

	// #region Actions
	@action
	close(event, skipFocus) {
		this.debug(`close`);

		if(this.isDestroying || this.isDestroyed)
			return;

		let parentCloseRetValue = true;
		if(isPresent(this.args.onClose) && (typeof this.args.onClose === 'function'))
			parentCloseRetValue = this.args.onClose(event);

		if(!parentCloseRetValue)
			return;

		if(this.isDestroying || this.isDestroyed)
			return;

		set(this._dropdownStatus, 'isOpen', false);
		this._dropdownStatus = this._dropdownStatus;

		if(isPresent(this.args.setStatus) && (typeof this.args.setStatus === 'function'))
			this.args.setStatus(Object.assign({}, this._dropdownStatus));

		if(this.isDestroying || this.isDestroyed)
			return;

		if(skipFocus)
			return;

		if(!this._triggerComponentElement)
			return;

		if(this._triggerComponentElement.hasAttribute('tabindex') && (Number(this._triggerComponentElement.getAttribute('tabindex')) >= 0))
			this._triggerComponentElement.focus();
	}

	@action
	open(event) {
		this.debug(`open`);

		if(this.isDestroying || this.isDestroyed)
			return;

		let parentOpenRetValue = true;
		if(isPresent(this.args.onOpen) && (typeof this.args.onOpen === 'function'))
			parentOpenRetValue = this.args.onOpen(event);

		if(!parentOpenRetValue)
			return;

		if(this.isDestroying || this.isDestroyed)
			return;

		set(this._dropdownStatus, 'isOpen', true);
		this._dropdownStatus = this._dropdownStatus;

		if(isPresent(this.args.setStatus) && (typeof this.args.setStatus === 'function'))
			this.args.setStatus(Object.assign({}, this._dropdownStatus));
	}

	@action
	reposition() {
		this.debug(`reposition`);

		if(this.isDestroying || this.isDestroyed)
			return;

		if(!this._dropdownStatus.isOpen)
			return;

		if(!this._element || !this._contentComponentElement || !this._triggerComponentElement)
			return;

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
		if(isPresent(this.args.setAlign) && (typeof this.args.setAlign === 'function'))
			this.args.setAlign({ 'xAlign': positionData.xAlign, 'yAlign': positionData.yAlign });

		delete positionData.xAlign;
		delete positionData.yAlign;

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
		this._contentComponentElement = contentElement;
	}

	@action
	registerTriggerElement(triggerElement) {
		this._triggerComponentElement = triggerElement;
	}
	// #endregion
}
