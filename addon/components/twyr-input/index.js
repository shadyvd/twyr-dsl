import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';
import { isEmpty, isPresent } from '@ember/utils';
import { run } from '@ember/runloop';
import { tracked } from '@glimmer/tracking';

export default class TwyrInputComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('twyr-input');

	_element = null;
	// #endregion

	// #region Tracked Attributes
	@tracked isInputFocused = false;
	@tracked isNativeInvalid = false;
	@tracked isTouched = false;
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

		this._setValue();
		if(!this.args.textarea)
			return;

		this.growTextareaOnResize = this._growTextareaOnResize.bind(this);
		window.addEventListener('resize', this.growTextareaOnResize);

		this.growTextareaOnResize();
	}

	@action
	didReceiveArgs() {
		this.debug(`didReceiveArgs`);
		if((this._prevValue !== this.args.value) || (this._prevErrors !== this.args.errors))
			this._notifyValidityChange();

		this._prevValue = this.args.value;
		this._prevErrors = this.args.errors;

		if(!this.args.textarea)
			return;

		this.growTextareaOnResize();
	}

	@action
	didMutate() {
		this.debug(`didMutate`);
		if(this._element.classList.contains('md-focused') && !this._element.classList.contains('md-input-focused'))
			this._element.classList.add('md-input-focused');

		if(!this._element.classList.contains('md-focused') && this._element.classList.contains('md-input-focused'))
			this._element.classList.remove('md-input-focused');
	}

	willDestroy() {
		this.debug(`willDestroy`);
		super.willDestroy(...arguments);

		if(!this.args.textarea)
			return;

		window.removeEventListener('resize', this.growTextareaOnResize);
		this.growTextareaOnResize = null;
	}
	// #endregion

	// #region DOM Event Handlers
	@action
	handleBlur(event) {
		this.debug(`handleBlur: `, event);
		if(isPresent(this.args.onBlur) && (typeof this.args.onBlur === 'function'))
			this.args.onBlur(...arguments);

		this.isTouched = true;
		this._notifyValidityChange();
	}

	@action
	handleClick(event) {
		this.debug(`handleClick: `, event);
		if(isPresent(this.args.onClick) && (typeof this.args.onClick === 'function'))
			this.args.onClick(...arguments);
	}


	@action
	handleFocus(event) {
		this.debug(`handleFocus: `, event);
		if(isPresent(this.args.onFocus) && (typeof this.args.onFocus === 'function'))
			this.args.onFocus(...arguments);
	}

	@action
	handleInput(event) {
		this.debug(`handleInput: `, event);
		if(isPresent(this.args.onChange) && (typeof this.args.onChange === 'function'))
			this.args.onChange(event.target.value);

		run.next(() => {
			this.debug(`handleInput::run.next`);
			if(this.isDestroying || this.isDestroyed)
				return;

			this.debug(`handleInput::_setValue: ${this.args.value}`);
			this._setValue(this.args.value);
			this._growTextareaOnResize();

			const inputElement = this._element.querySelector('input');
			if(!inputElement) return;

			this.debug(`handleInput::isNativeInvalid?  ${inputElement.validity && inputElement.validity.badInput}`);
			this.isNativeInvalid = (inputElement.validity && inputElement.validity.badInput);

			this._notifyValidityChange();
		});
	}

	@action
	handleKeydown(event) {
		this.debug(`handleKeydown: `, event);
		if(isPresent(this.args.onKeydown) && (typeof this.args.onKeydown === 'function'))
			this.args.onKeydown(...arguments);
	}

	@action
	handleKeyup(event) {
		this.debug(`handleKeyup: `, event);
		if(isPresent(this.args.onKeyup) && (typeof this.args.onKeyup === 'function'))
			this.args.onKeyup(...arguments);
	}
	// #endregion

	// #region Computed Properties
	get characterCountDisplay() {
		this.debug(`characterCountDisplay: ${this.currentLength}/${this.maxLength}`);
		return `${this.currentLength}/${this.maxLength}`;
	}

	get currentLength() {
		this.debug(`currentLength: ${this.args.value ? this.args.value.length : 0}`);
		return this.args.value ? this.args.value.length : 0;
	}

	get elementId() {
		this.debug(`elementId: ${this._element ? this._element.getAttribute('id') : ''}`);
		return (this._element ? this._element.getAttribute('id') : '');
	}

	get hasValue() {
		this.debug(`hasValue: ${!isEmpty(this.args.value) || this.isNativeInvalid}`);
		return (!isEmpty(this.args.value) || this.isNativeInvalid);
	}

	get iconComponent() {
		this.debug(`iconComponent: ${this.args.iconComponent || 'twyr-icon'}`);
		return (this.args.iconComponent || 'twyr-icon');
	}

	get inputElementId() {
		this.debug(`inputElementId: input-${this._element ? this._element.getAttribute('id') : ''}`);
		return `input-${this._element ? this._element.getAttribute('id') : ''}`;
	}

	get isInvalid() {
		this.debug(`isInvalid: ${this.hasErrorMessages || this.isNativeInvalid}`);
		return (this.hasErrorMessages || this.isNativeInvalid);
	}

	get isInvalidAndTouched() {
		this.debug(`isInvalidAndTouched: ${this.isInvalid && this.isTouched}`);
		return (this.isInvalid && this.isTouched);
	}

	get isRequired() {
		this.debug(`isRequired: ${this.args.required || (this.args.passThru && this.args.passThru.required) || (this._element && this._element.hasAttribute('required'))}`);
		return (this.args.required || (this.args.passThru && this.args.passThru.required) || (this._element && this._element.hasAttribute('required')));
	}

	get maxLength() {
		this.debug(`maxLength: ${this.args.maxLength || (this.args.passThru && this.args.passThru.maxLength) || ((this._element && this._element.hasAttribute('max-length')) ? this._element.getAttribute('max-length') : undefined)}`);
		return (this.args.maxLength || (this.args.passThru && this.args.passThru.maxLength) || ((this._element && this._element.hasAttribute('max-length')) ? this._element.getAttribute('max-length') : undefined));
	}

	get shouldShowPlaceholder() {
		this.debug(`shouldShowPlaceholder: ${isEmpty(this.args.label) || (this._element && this._element.classList.contains('md-focused'))}`);
		return (isEmpty(this.args.label) || (this._element && this._element.classList.contains('md-focused')));
	}
	// #endregion

	// #region Private Methods
	_getHeight(inputElement) {
		const { offsetHeight } = inputElement;
		const line = inputElement.scrollHeight - offsetHeight;

		this.debug(`_getHeight: ${offsetHeight + (line > 0 ? line : 0)}`);
		return (offsetHeight + (line > 0 ? line : 0));
	}

	_growTextareaOnResize() {
		if(!this._element)
			return;

		if(!this.args.textarea)
			return;

		const inputElement = this._element.querySelector('input, textarea');
		inputElement.classList.add('md-no-flex');
		inputElement.setAttribute('rows', 1);

		const minRows = this.args.rows || (this.args.passThru && this.args.passThru.rows) || this._element.getAttribute('rows');

		let height = this._getHeight(inputElement);
		let lineHeight = 0;

		if (minRows) {
			if (!lineHeight) {
				inputElement.style.minHeight = 0;
				lineHeight = inputElement.clientHeight;
				inputElement.style.minHeight = null;
			}

			if (lineHeight) {
				height = Math.max(height, lineHeight * minRows);
			}

			const proposedHeight = Math.round(height / lineHeight);
			const maxRows = this.args.maxRows || (this.args.passThru && this.args.passThru.maxRows) || this._element.getAttribute('max-rows') || Number.MAX_VALUE;
			const rowsToSet = Math.min(proposedHeight, maxRows);

			inputElement.style.height = `${lineHeight * rowsToSet}px`;
			inputElement.setAttribute('rows', rowsToSet);

			if (proposedHeight >= maxRows) {
				inputElement.classList.add('md-textarea-scrollable');
			}
			else {
				inputElement.classList.remove('md-textarea-scrollable');
			}
		}
		else {
			inputElement.style.height = 'auto';
			inputElement.scrollTop = 0;

			if (height) {
				inputElement.style.height = `${height}px`;
			}
		}

		inputElement.classList.remove('md-no-flex');
	}

	_notifyValidityChange() {
		this.debug(`_notifyValidityChange`);
		// TODO: Input Validations
	}

	_setValue() {
		if(!this._element) {
			this.debug(`_setValue::_element: null`);
			return;
		}

		const value = isEmpty(this.args.value) ? '' : this.args.value;
		const element = this._element.querySelector('input, textarea');
		if (!element || (element.value === value)) {
			this.debug(`_setValue::element:null OR _setValue::element::value`);
			return;
		}

		this.debug(`_setValue::element::value: ${value}`);
		element.value = value;
	}
	// #endregion
}
