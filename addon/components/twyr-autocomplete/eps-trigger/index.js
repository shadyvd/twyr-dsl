import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';
import { get } from '@ember/object';
import { isPresent } from '@ember/utils';
import { tracked } from '@glimmer/tracking';

export default class TwyrAutocompleteEpsTriggerComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('twyr-autocomplete-eps-trigger');
	_element = null;
	// #endregion

	// #region Tracked Attributes
	@tracked _resetButtonDestroyed = false;
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
		this._element = element;
	}
	// #endregion

	// #region DOM Event Handlers
	@action
	handleInputChange(value) {
		if(isPresent(this.args.onInput) && (typeof this.args.onInput === 'function')) {
			this.args.onInput({
				'target': {
					'value': value
				}
			});
		}
	}
	// #endregion

	// #region Computed Properties
	get showClearButton() {
		return this.args.allowClear && this.args.powerSelect && this.args.powerSelect.Status && (!this.args.powerSelect.Status.isDisabled || (this.args.powerSelect.Status.isDisabled && !this._resetButtonDestroyed));
	}

	get text() {
		if(this.args.powerSelect && this.args.powerSelect.Options && this.args.powerSelect.Options.selected)
			return this._getSelectedAsText();

		if(this.args.powerSelect && this.args.powerSelect.Options && this.args.powerSelect.Options.searchText)
			return this.args.powerSelect.Options.searchText;

		return '';
	}
	// #endregion

	// #region Private Methods
	_getSelectedAsText() {
		const labelPath = this.args.extra ? this.args.extra.labelPath : null;

		if (labelPath)
			return get(this.args.powerSelect.Options.selected, labelPath);
		else
			return this.args.powerSelect.Options.selected;
	}
	// #endregion

	// #region Actions
	@action
	clear(event) {
		event.stopPropagation();

		if(isPresent(this.args.onClear) && (typeof this.args.onClear === 'function')) {
			this.args.onClear(event);
		}
		else {
			if(this.args.powerSelect && this.args.powerSelect.Controls && isPresent(this.args.powerSelect.Controls.select) && (typeof this.args.powerSelect.Controls.select === 'function'))
				this.args.powerSelect.Controls.select(null);

			if(isPresent(this.args.onInput) && (typeof this.args.onInput === 'function')) {
				this.args.onInput({
					'target': {
						'value': ''
					}
				});
			}
		}

		if(isPresent(this.args.onFocus) && (typeof this.args.onFocus === 'function'))
			this.args.onFocus(event);

		this._element.querySelector('input').focus();
	}

	@action
	resetButtonDestroyed() {
		this._resetButtonDestroyed = this.args.powerSelect && this.args.powerSelect.Status && this.args.powerSelect.Status.isDisabled;
	}
	// #endregion
}
