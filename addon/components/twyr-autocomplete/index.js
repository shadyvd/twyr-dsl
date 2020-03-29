import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';
import { indexOfOption } from 'twyr-dsl/utils/power-select-utilities'
import { isPresent } from '@ember/utils';
import { set } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class TwyrAutocompleteComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('twyr-autocomplete');
	_element = null;
	// #endregion

	// #region Tracked Attributes
	@tracked _TwyrAutocomplete = null;
	@tracked isTouched = false;
	// #endregion

	// #region Yielded Sub-components
	subComponents = {
		'ebdContentComponent': 'twyr-autocomplete/ebd-content',
		'ebdTriggerComponent': 'twyr-autocomplete/ebd-trigger',
		'epsTriggerComponent': 'twyr-autocomplete/eps-trigger',

		'optionsComponent': 'twyr-autocomplete/options',
		'noMatchesMessageComponent': 'twyr-autocomplete/no-matches-message',
	};
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion

	// #region Lifecycle Hooks
	@action
	didInsertPowerSelect(twyrAutocomplete) {
		this.debug(`didInsertPowerSelect`);
		this._TwyrAutocomplete = twyrAutocomplete;
	}
	// #endregion

	// #region Private Methods
	_notifyValidityChange() {
		this.debug(`_notifyValidityChange`);
		return;
	}

	@action
	scrollTo(option) {
		this.debug(`scrollTo`);

		let optionsList = document.querySelector(`[aria-controls="twyr-power-select-trigger-${this._TwyrAutocomplete.id}"]`);
		if(!optionsList) return;

		const resolvedResults = this._TwyrAutocomplete.Options.results;
		if(!resolvedResults) return;

		const index = indexOfOption(resolvedResults, option);
		if(index < 0) return;

		const contentElement = document.querySelector(`[aria-controls="twyr-power-select-trigger-${this._TwyrAutocomplete.id}"`);
		if(!contentElement) return;

		const optionElement = contentElement.querySelectorAll(`.twyr-power-select-option`).item(index);
		if(!optionElement) return;

		optionsList = optionsList.parentNode;

		const optionTopScroll = optionElement.offsetTop;
		const optionBottomScroll = optionTopScroll + optionElement.offsetHeight;

		if (optionBottomScroll > (optionsList.offsetHeight + optionsList.scrollTop)) {
			optionsList.scrollTop = optionBottomScroll - optionsList.offsetHeight;
		}
		else if (optionTopScroll < optionsList.scrollTop) {
			optionsList.scrollTop = optionTopScroll;
		}
	}
	// #endregion

	// #region Actions
	@action
	onBlur() {
		this.debug(`onBlur`);

		this._notifyValidityChange();
		if(isPresent(this.args.onBlur) && (typeof this.args.onBlur === 'function'))
			this.args.onBlur(...arguments);
	}

	@action
	onChange() {
		this.debug(`onChange`);

		if(isPresent(this.args.onSelectionChange) && (typeof this.args.onSelectionChange === 'function'))
			this.args.onSelectionChange(...arguments);
	}

	@action
	onClose() {
		this.debug(`onClose`);

		this._didAnimateScale = false;
		set(this, 'isTouched', true);

		this._notifyValidityChange();
		if(isPresent(this.args.onClose) && (typeof this.args.onClose === 'function'))
			return this.args.onClose(...arguments);
	}

	@action
	onCreate() {
		this.debug(`onCreate`);
		if(isPresent(this.args.onCreate) && (typeof this.args.onCreate === 'function'))
			this.args.onCreate(this._TwyrAutocomplete);

		this._TwyrAutocomplete.Controls.close();
	}

	@action
	onFocus(event) {
		this.debug(`onFocus`);
		if ((event.target.classList.contains('twyr-autocomplete-search-input') || event.target.classList.contains('md-input')) && !this._TwyrAutocomplete.Status.isSelected)
			this._TwyrAutocomplete.Controls.open(event);

		if(isPresent(this.args.onFocus) && (typeof this.args.onFocus === 'function'))
			return this.args.onFocus(...arguments);
	}

	@action
	onInput(value, event) {
		this.debug(`onInput`);

		if (this._TwyrAutocomplete.Status.isSelected) {
			this._TwyrAutocomplete.Controls.select(null);
		}

		if(isPresent(this.args.onSearchTextChange) && (typeof this.args.onSearchTextChange === 'function'))
			this.args.onSearchTextChange(value, event);
		else
			this._TwyrAutocomplete.Controls.search(value, event);

		if (!this._TwyrAutocomplete.Status.isOpen && event.type !== 'change')
			this._TwyrAutocomplete.Controls.open(event);

		this._notifyValidityChange();
		if(isPresent(this.args.onInput) && (typeof this.args.onInput === 'function'))
			this.args.onInput(...arguments);

		return value;
	}

	@action
	onOpen(event) {
		this.debug(`onOpen`);

		if (event && event.type === 'mousedown')
			return false;

		this._didAnimateScale = false;

		this._notifyValidityChange();
		if(isPresent(this.args.onOpen) && (typeof this.args.onOpen === 'function'))
			return this.args.onOpen(...arguments);
	}
	// #endregion
}
