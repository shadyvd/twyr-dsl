import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import { inject as service } from '@ember/service';
import { isPresent } from '@ember/utils';
import { tracked } from '@glimmer/tracking';

export default class TwyrSliderComponent extends Component {
	// #region Services
	@service constants;
	// #endregion

	// #region Private Attributes
	debug = debugLogger('twyr-slider');

	_element = null;
	_hammer = null;
	// #endregion

	// #region Tracked Attributes
	@tracked _isActive = false;
	@tracked _isDragging = false;
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

		if(element.hasAttribute('disabled'))
			return;

		this.debug(`didInsert::_setupHammer`);
		this._setupHammer();
	}

	@action
	didReceiveArgs() {
		this.debug(`didReceiveArgs`);
		this._onArgsOrAttrsChanged();
	}

	@action
	didMutate() {
		this.debug(`didMutate`);
		this._onArgsOrAttrsChanged();
	}

	willDestroy() {
		this.debug(`willDestroy`);

		if(this._hammer) {
			this._teardownHammer();
		}

		super.willDestroy(...arguments);
	}
	// #endregion

	// #region DOM Event Handlers
	@action
	handleDragStart(event) {
		this.debug(`handleDragStart: `, event);

		if(!this._element) {
			this.debug(`handleDragStart::_element: null`);
			return;
		}

		if(this.isDestroying || this.isDestroyed || this._element.hasAttribute('disabled')) {
			this.debug(`handleDragStart::_element: destroyed / disabled`);
			return;
		}

		if(!isPresent(this.args.onChange) || (typeof this.args.onChange !== 'function')) {
			this.debug(`handleDragStart::onChange: null`);
			return;
		}

		this.debug(`handleDragStart::final`);
		this._isActive = true;
		this._isDragging = true;

		this._element.focus();
		this._setValueFromEvent(event.center.x);
	}

	@action
	handleDrag(event) {
		this.debug(`handleDrag: `, event);

		if(!this._isDragging) {
			this.debug(`handleDrag::isDragging: false`);
			return;
		}

		if(!this._element) {
			this.debug(`handleDrag::_element: null`);
			return;
		}

		if(this.isDestroying || this.isDestroyed || this._element.hasAttribute('disabled')) {
			this.debug(`handleDrag::_element: destroyed / disabled`);
			return;
		}

		if(!isPresent(this.args.onChange) || (typeof this.args.onChange !== 'function')) {
			this.debug(`handleDrag::onChange: null`);
			return;
		}

		this.debug(`handleDrag::final`);
		this._setValueFromEvent(event.center.x);
	}

	@action
	handleDragEnd(event) {
		this.debug(`handleDragEnd: `, event);

		if(!this._isDragging) {
			this.debug(`handleDragEnd::isDragging: false`);
			return;
		}

		if(!this._element) {
			this.debug(`handleDragEnd::_element: null`);
			return;
		}

		if(this.isDestroying || this.isDestroyed || this._element.hasAttribute('disabled')) {
			this.debug(`handleDragEnd::_element: destroyed / disabled`);
			return;
		}

		this.debug(`handleDragEnd::final`);
		this._isActive = false;
		this._isDragging = false;
	}

	@action
	handleKeydown(event) {
		this.debug(`handleKeydown: `, event);

		if(!this._element) {
			this.debug(`handleKeydown::_element: null`);
			return;
		}

		if(this.isDestroying || this.isDestroyed || this._element.hasAttribute('disabled')) {
			this.debug(`handleKeydown::_element: destroyed / disabled`);
			return;
		}

		if(!isPresent(this.args.onChange) || (typeof this.args.onChange !== 'function')) {
			this.debug(`handleKeydown::onChange: null`);
			return;
		}

		let changeAmount = 0;
		if (event.keyCode === this.constants.KEYCODE.LEFT_ARROW) {
			changeAmount = parseFloat(this.step) * -1;
		}

		if (event.keyCode === this.constants.KEYCODE.RIGHT_ARROW) {
			changeAmount = parseFloat(this.step);
		}

		if (!changeAmount) {
			this.debug(`handleKeydown::changeAmount: ${changeAmount}`);
			return;
		}

		event.preventDefault();
		event.stopPropagation();

		if (event.metaKey || event.ctrlKey || event.altKey)
			changeAmount *= 4;

		const newValue = this.args.value + changeAmount;

		this.debug(`handleKeydown::final: ${newValue}`);
		this.args.onChange(this._minMaxValidator(newValue));
	}

	@action
	handleTap(event) {
		this.debug(`handleTap: `, event);

		if(!this._element) {
			this.debug(`handleTap::_element: null`);
			return;
		}

		if(this.isDestroying || this.isDestroyed || this._element.hasAttribute('disabled')) {
			this.debug(`handleTap::_element: destroyed / disabled`);
			return;
		}

		if(!isPresent(this.args.onChange) || (typeof this.args.onChange !== 'function')) {
			this.debug(`handleTap::onChange: null`);
			return;
		}

		this.debug(`handleTap: final`);
		this._setValueFromEvent(event.center.x);
	}
	// #endregion

	// #region Computed Properties
	get activeTrackStyle() {
		this.debug(`activeTrackStyle: ${htmlSafe(`width:${(this.percent || 0) * 100}%;`)}`);
		return htmlSafe(`width:${(this.percent || 0) * 100}%;`);
	}

	get isDiscrete() {
		this.debug(`isDiscrete: ${isPresent(this.args.discrete) ? this.args.discrete : false}`);
		return (isPresent(this.args.discrete) ? this.args.discrete : false);
	}

	get isMinimum() {
		this.debug(`isMinimum: ${this.min === this.percent}`);
		return (this.min === this.percent);
	}

	get max() {
		this.debug(`max: ${isPresent(this.args.max) ? this.args.max : 100}`);
		return (isPresent(this.args.max) ? this.args.max : 100);
	}

	get min() {
		this.debug(`min: ${isPresent(this.args.min) ? this.args.min : 0}`);
		return (isPresent(this.args.min) ? this.args.min : 0);
	}

	get percent() {
		const min = parseFloat(this.min, 10);
		const max = parseFloat(this.max, 10);
		const percent = this._clamp((this.args.value - min) / (max - min), 0, 1);

		this.debug(`percent: ${percent}`);
		return percent;
	}

	get step() {
		this.debug(`step: ${isPresent(this.args.step) ? this.args.step : 1}`);
		return (isPresent(this.args.step) ? this.args.step : 1);
	}

	get thumbContainerStyle() {
		this.debug(`thumbContainerStyle: ${htmlSafe(`left:${(this.percent || 0) * 100}%;`)}`);
		return htmlSafe(`left:${(this.percent || 0) * 100}%;`);
	}
	// #endregion

	// #region Private Methods
	_clamp(num, min, max) {
		this.debug(`_clamp: ${Math.min(Math.max(num, min), max)}`);
		return Math.min(Math.max(num, min), max);
	}

	_minMaxValidator(value) {
		const min = parseFloat(this.min, 10);
		const max = parseFloat(this.max, 10);

		this.debug(`_minMaxValidator: ${Math.max(min, Math.min(max, value))}`);
		return Math.max(min, Math.min(max, value));
	}

	_onArgsOrAttrsChanged() {
		if(this._element.hasAttribute('disabled')) {
			if(this._hammer) {
				this.debug(`_onArgsOrAttrsChanged::_hammer::teardown`);
				this._teardownHammer();
			}

			return;
		}

		if(!this._hammer) {
			this.debug(`_onArgsOrAttrsChanged::_hammer::setup`);
			this._setupHammer();
			return;
		}
	}

	_percentToValue(value) {
		const min = parseFloat(this.min, 10);
		const max = parseFloat(this.max, 10);

		this.debug(`_percentToValue: ${(min + value * (max - min))}`);
		return (min + value * (max - min));
	}

	_positionToPercent(value) {
		const { left, width } = this._sliderDimensions();

		this.debug(`_positionToPercent: ${Math.max(0, Math.min(1, (value - left) / width))}`);
		return Math.max(0, Math.min(1, (value - left) / width));
	}

	_setValueFromEvent(value) {
		this.debug(`_setValueFromEvent::value: ${value}`);

		const exactVal = this._percentToValue(this._positionToPercent(value));
		this.debug(`_setValueFromEvent::exactVal: ${exactVal}`);

		const closestVal = this._minMaxValidator(this._stepValidator(exactVal));
		this.debug(`_setValueFromEvent::closestVal: ${closestVal}`);

		this.debug(`_setValueFromEvent::final`);
		this.args.onChange(closestVal);
	}

	_setupHammer() {
		if(!this._element) {
			this.debug(`_setupHammer::_element: null`);
			return;
		}

		const tap = new window.Hammer.Tap();
		const pan = new window.Hammer.Pan({
			'direction': window.Hammer.DIRECTION_HORIZONTAL,
			'threshold': 10
		});

		const containerManager = new window.Hammer.Manager(this._element);

		containerManager.add(pan);
		containerManager.add(tap);

		containerManager.on('panstart', this.handleDragStart.bind(this));
		containerManager.on('panmove', this.handleDrag.bind(this));
		containerManager.on('panend', this.handleDragEnd.bind(this));
		containerManager.on('tap', this.handleTap.bind(this));

		this.debug(`_setupHammer::final`);
		this._hammer = containerManager;
	}

	_sliderDimensions() {
		if(!this._element) {
			this.debug(`_sliderDimensions::_element: null`);
			return null;
		}

		const dimensions = this._element.querySelector('.md-track-container').getBoundingClientRect();
		this.debug(`_sliderDimensions::dimensions: `, dimensions);

		return dimensions;
	}

	_stepValidator(value) {
		const step = parseFloat(this.step, 10);

		this.debug(`_stepValidator: ${Math.round(value / step) * step}`);
		return Math.round(value / step) * step;
	}

	_teardownHammer() {
		if(!this._hammer) {
			this.debug(`_teardownHammer::_hammer: null`);
			return;
		}

		this.debug(`_teardownHammer::final`);
		this._hammer.destroy();
		this._hammer = null;
	}
	// #endregion
}
