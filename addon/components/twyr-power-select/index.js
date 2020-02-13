import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';
import { isPresent } from '@ember/utils';
import { tracked } from '@glimmer/tracking';

export default class TwyrPowerSelectComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('twyr-power-select');
	// #endregion

	// #region Tracked Attributes
	@tracked _selectControls = {};
	@tracked _selectOptions = {
		'lastSearchedText': '',
		'searchText': '',

		'options': null,
		'results': null,
		'resultsCount': 0
	};
	@tracked _selectStatus = {
		'isActive': false,
		'isHighlighted': false,
		'isLoading': false,
		'isSelected': false
	};
	// #endregion

	// #region Yielded Sub-components
	subComponents = {
		'afterOptionsComponent': 'twyr-power-select/after-options',
		'beforeOptionsComponent': 'twyr-power-select/before-options',
		'groupComponent': 'twyr-power-select/group',
		'noMatchesMessageComponent': 'twyr-power-select/no-matches-message',
		'optionsComponent': 'twyr-power-select/options',
		'placeholderComponent': 'twyr-power-select/placeholder',
		'searchMessageComponent': 'twyr-power-select/search-message',
		'selectedItemComponent': 'twyr-power-select/selected-item',
		'triggerComponent': 'twyr-power-select/trigger'
	};
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);

		this._selectControls.search = this._search.bind(this);
		this._selectControls.highlight = this._highlight.bind(this);
		this._selectControls.select = this._select.bind(this);
		this._selectControls.choose = this._choose.bind(this);
		this._selectControls.scrollTo = this._scrollTo.bind(this);
	}
	// #endregion

	// #region Lifecycle Hooks
	@action
	didInsertTrigger() {
		this.debug(`didInsertTrigger::arguments: `, arguments);
	}

	@action
	didMutateTrigger() {
		this.debug(`didMutateTrigger::arguments: `, arguments);
	}

	@action
	didReceiveArgsTrigger() {
		this.debug(`didReceiveArgsTrigger::arguments: `, arguments);
	}
	// #endregion

	// #region DOM Event Handlers
	@action
	handleBlur() {
		this.debug(`handleBlur::arguments: `, arguments);
	}

	@action
	handleFocus() {
		this.debug(`handleFocus::arguments: `, arguments);
	}

	@action
	handleInput() {
		this.debug(`handleInput::arguments: `, arguments);
	}

	@action
	handleKeydownBeforeOptions() {
		this.debug(`handleKeydownBeforeOptions::arguments: `, arguments);
	}

	@action
	handleKeydownTrigger() {
		this.debug(`handleKeydownTrigger::arguments: `, arguments);
	}

	@action
	handleKeydownTriggerComponent() {
		this.debug(`handleKeydownTriggerComponent::arguments: `, arguments);
	}
	// #endregion

	// #region Computed Properties
	get contentClass() {
		this.debug(`contentClass`);
		return '';
	}

	get highlightOnHover() {
		this.debug(`highlightOnHover`);
		return true;
	}

	get loadingMessage() {
		this.debug(`loadingMessage::TODO: Internationalize the message`);
		return 'Loading...';
	}

	get mustShowNoMatchesMessage() {
		this.debug(`mustShowNoMatchesMessage`);
		return true;
	}

	get noMatchesMessage() {
		this.debug(`noMatchesMessage::TODO: Internationalize the message`);
		return 'No matches available';
	}

	get searchMessage() {
		this.debug(`searchMessage::TODO: Internationalize the message`);
		return 'Searching...';
	}

	get searchText() {
		if(isPresent(this.args.searchText))
			return this.args.searchText;

		return '';
	}

	get triggerClass() {
		this.debug(`triggerClass`);
		return '';
	}

	get triggerTabindex() {
		this.debug(`triggerTabindex`);
		return "1";
	}
	// #endregion

	// #region Private Methods
	_search() {
		this.debug(`_search::arguments: `, arguments);
	}

	_highlight() {
		this.debug(`_highlight::arguments: `, arguments);
	}

	_select() {
		this.debug(`_select::arguments: `, arguments);
	}

	_choose() {
		this.debug(`_choose::arguments: `, arguments);
	}

	_scrollTo() {
		this.debug(`_scrollTo::arguments: `, arguments);
	}

// #endregion

	// #region Actions
	@action
	handleDropdownClose(event, skipFocus) {
		this.debug(`handleDropdownClose::skipFocus: ${skipFocus}, event: `, event);
		if(isPresent(this.args.onClose) && (typeof this.args.onClose === 'function'))
			this.args.onClose();
	}

	@action
	handleDropdownOpen() {

	}
	// #endregion
}
