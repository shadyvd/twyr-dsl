import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';
import { advanceSelectableOption, countOptions, defaultHighlighted, defaultMatcher, filterOptions, indexOfOption } from 'twyr-dsl/utils/power-select-utilities'
import { get, set, setProperties } from '@ember/object';
import { inject as service } from '@ember/service';
import { isEqual, isPresent } from '@ember/utils';
import { restartableTask } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';

// #region File Global Functions
const getOptionMatcher = function getOptionMatcher(matcher, searchField) {
	if(searchField)
		return (option, text) => { return matcher(get(option, searchField), text); };
	else
		return (option, text) => { return matcher(option, text); };
}
// #endregion

export default class TwyrPowerSelectComponent extends Component {
	// #region Services
	@service constants;
	// #endregion

	// #region Private Attributes
	debug = debugLogger('twyr-power-select');
	_element = null;
	// #endregion

	// #region Tracked Attributes
	@tracked _selectControls = {
		choose: null,
		highlight: null,
		search: null,
		select: null,
		scrollTo: null
	};

	@tracked _selectOptions = {
		'lastSearchedText': '',
		'searchText': '',

		'options': null,
		'resolvedOptions': null,

		'results': null,
		'resultsCount': 0,

		'highlightedOption': null,
		'selected': null
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

		this._selectControls.choose = this._choose.bind(this);
		this._selectControls.highlight = this._highlight.bind(this);
		this._selectControls.search = this._search.bind(this);
		this._selectControls.select = this._select.bind(this);
		this._selectControls.scrollTo = this._scrollTo.bind(this);
	}
	// #endregion

	// #region Lifecycle Hooks
	@action
	didInsert(element) {
		this.debug(`didInsert::arguments: `, arguments);
		this._element = element;

		if(isPresent(this.args.setControls) && (typeof this.args.setControls === 'function')) {
			this.debug(`didInsert::setControls`);
			this.args.setControls(Object.assign({}, this._selectControls));
		}

		if(isPresent(this.args.setOptions) && (typeof this.args.setOptions === 'function')) {
			this.debug(`didInsert::setOptions`);
			this.args.setOptions(Object.assign({}, this._selectOptions));
		}

		if(isPresent(this.args.setStatus) && (typeof this.args.setStatus === 'function')) {
			this.debug(`didInsert::setStatus`);
			this.args.setStatus(Object.assign({}, this._selectStatus));
		}
	}

	@action
	didInsertTrigger() {
		// TODO: Set _PowerSelect from the arguments here...
		this.debug(`didInsertTrigger::arguments: `, arguments);

		this._updateOptions.perform()
		.then(() => {
			return this._performSearch.perform();
		})
		.then(() => {
			return this._updateSelected.perform();
		});
	}

	@action
	didReceiveArgsTrigger() {
		this.debug(`didReceiveArgsTrigger::arguments: `, arguments);

		this._updateOptions.perform()
		.then(() => {
			return this._performSearch.perform();
		})
		.then(() => {
			return this._updateSelected.perform();
		});
	}
	// #endregion

	// #region DOM Event Handlers
	@action
	handleBlur() {
		this.debug(`handleBlur::arguments: `, arguments);
		if(this.isDestroying || this.isDestroyed) {
			this.debug(`handleBlur::isDestroying`);
			return;
		}

		set(this._selectStatus.isActive, false);

		if(isPresent(this.args.setStatus) && (typeof this.args.setStatus === 'function')) {
			this.debug(`handleBlur::setStatus`);
			this.args.setStatus(Object.assign({}, this._selectStatus));
		}

		if(isPresent(this.args.onBlur) && (typeof this.args.onBlur === 'function')) {
			this.debug(`handleBlur::onBlur`);
			this.args.onBlur(...arguments);
		}
	}

	@action
	handleKeyEnter(event) {
		this.debug(`handleKeyEnter::arguments: `, arguments);

		if(!(this._PowerSelect.Status.isOpen && this._selectStatus.isHighlighted !== undefined))
			return true;

		this._choose(event);
		event.stopImmediatePropagation();

		return false;
	}

	@action
	handleKeyEscape(event) {
		this.debug(`handleKeyEscape::arguments: `, arguments);
		this._PowerSelect.Controls.close(event);
	}

	@action
	handleFocus() {
		this.debug(`handleFocus::arguments: `, arguments);
		if(this.isDestroying || this.isDestroyed) {
			this.debug(`handleFocus::isDestroying`);
			return;
		}

		set(this._selectStatus.isActive, true);

		if(isPresent(this.args.setStatus) && (typeof this.args.setStatus === 'function')) {
			this.debug(`handleFocus::setStatus`);
			this.args.setStatus(Object.assign({}, this._selectStatus));
		}

		if(isPresent(this.args.onFocus) && (typeof this.args.onFocus === 'function')) {
			this.debug(`handleFocus::onFocus`);
			this.args.onFocus(...arguments);
		}
	}

	@action
	handleInput(event) {
		this.debug(`handleInput::arguments: `, arguments);
		if(this.isDestroying || this.isDestroyed) {
			this.debug(`handleInput::isDestroying`);
			return;
		}

		if(!event.target) {
			this.debug(`handleInput::event::target: null`);
			return;
		}

		let correctedTerm = undefined;
		if(isPresent(this.args.onInput) && (typeof this.args.onInput === 'function')) {
			this.debug(`handleInput::onInput`);
			correctedTerm = this.args.onInput(event.target.value);
		}

		if(correctedTerm === false) {
			this.debug(`handleInput::correctedTerm: false`);
			return;
		}

		this.debug(`handleInput::_search`);
		this._search((typeof correctedTerm === 'string') ? correctedTerm : event.target.value, event);
	}

	@action
	handleKeydownBeforeOptions() {
		this.debug(`handleKeydownBeforeOptions::arguments: `, arguments);

		let parentKeydownRetValue = true;
		if(isPresent(this.args.onKeydown) && (typeof this.args.onKeydown === 'function')) {
			this.debug(`handleKeydownBeforeOptions::onKeydown`);
			parentKeydownRetValue = this.args.onKeydown(event);
		}

		if(!parentKeydownRetValue) {
			this.debug(`handleKeydownBeforeOptions::parentKeydownRetValue: false`);
			return;
		}

		return this._routeKeydown(event);
	}

	@action
	handleKeydownTrigger(event) {
		this.debug(`handleKeydownTrigger::arguments: `, arguments);

		let parentKeydownRetValue = true;
		if(isPresent(this.args.onKeydown) && (typeof this.args.onKeydown === 'function')) {
			this.debug(`handleKeydownTrigger::onKeydown`);
			parentKeydownRetValue = this.args.onKeydown(event);
		}

		if(!parentKeydownRetValue) {
			this.debug(`handleKeydownTrigger::parentKeydownRetValue: false`);

			event.stopImmediatePropagation();
			return;
		}

		if(event.ctrlKey || event.metaKey) {
			this.debug(`handleKeydownTrigger::metaKey: true`);

			event.stopImmediatePropagation();
			return;
		}

		if ((event.keyCode >= 48 && event.keyCode <= 90) || (event.keyCode >= 96 && event.keyCode <= 105)) {
			// Keys 0-9, a-z or numpad keys
			this._triggerTypingTask.perform(event);
		}
		else if (event.keyCode === 32) {
			this.handleKeySpace(event);
		}
		else {
			return this._routeKeydown(event);
		}
	}

	@action
	handleKeydownTriggerComponent() {
		this.debug(`handleKeydownTriggerComponent::arguments: `, arguments);

		let parentKeydownRetValue = true;
		if(isPresent(this.args.onKeydown) && (typeof this.args.onKeydown === 'function')) {
			this.debug(`handleKeydownTriggerComponent::onKeydown`);
			parentKeydownRetValue = this.args.onKeydown(event);
		}

		if(!parentKeydownRetValue) {
			this.debug(`handleKeydownTriggerComponent::parentKeydownRetValue: false`);
			return;
		}

		return this._routeKeydown(event);
	}

	@action
	handleKeySpace(event) {
		this.debug(`handleKeySpace::arguments: `, arguments);

		if (event.target !== null && ['TEXTAREA', 'INPUT'].includes(event.target.nodeName)) {
			event.stopImmediatePropagation();
			return;
		}

		if (this._PowerSelect.Status.isOpen && this._PowerSelect.Status.isHighlighted !== undefined) {
			event.stopImmediatePropagation();
			event.preventDefault(); // Prevents scrolling of the page.

			this._choose(event);
		}
	}

	@action
	handleKeyTab(event) {
		this.debug(`handleKeyTab::arguments: `, arguments);
		this._PowerSelect.Controls.close(event);
	}

	@action
	handleKeyUpDown(event) {
		this.debug(`handleKeyUpDown::arguments: `, arguments);

		if(this._PowerSelect.Status.isOpen) {
			this._PowerSelect.Controls.open(event);
			return;
		}

		event.preventDefault();
		event.stopPropagation();

		const step = event.keyCode === 40 ? 1 : -1;
		const newHighlighted = advanceSelectableOption(this._selectOptions.results, this._selectOption.highlightedOption, step);

		this._highlight(newHighlighted);
		this._scrollTo(newHighlighted);
	}
	// #endregion

	// #region Computed Properties
	get loadingMessage() {
		this.debug(`loadingMessage::TODO: Internationalize the message`);
		return 'Loading...';
	}

	get mustShowNoMatchesMessage() {
		const show = !this._selectStatus.isLoading && (this._selectOptions.resultsCount === 0) && (!this.args.search || this._selectOptions.lastSearchedText.length > 0);
		this.debug(`mustShowNoMatchesMessage: ${show}`);

		return show;
	}

	get mustShowSearchMessage() {
		const show = !this._selectStatus.isLoading && (this.args.searchText && this.args.searchText.length === 0) && !!this.args.search && !!this.searchMessage && (this._selectOptions.resultsCount === 0);
		this.debug(`mustShowSearchMessage: ${show}`);

		return show;
	}

	get noMatchesMessage() {
		if(isPresent(this.args.noMatchesMessage))
			return this.args.noMatchesMessage;

		this.debug(`noMatchesMessage::TODO: Internationalize the message`);
		return 'No matches available';
	}

	get searchMessage() {
		if(isPresent(this.args.searchMessage))
			return this.args.searchMessage;

		this.debug(`searchMessage::TODO: Internationalize the message`);
		return 'Type to search';
	}
	// #endregion

	// #region Private Methods
	_choose(event) {
		this.debug(`_choose::arguments: `, arguments);

		let selected = undefined;
		if(isPresent(this.args.buildSelection) && (typeof this.args.buildSelection === 'function'))
			selected = this.args.buildSelection(this._selectOptions);
		else
			selected = this._selectOptions.selected;

		this._select(selected, event);

		if(isPresent(this.args.closeOnSelect) && (this.args.closeOnSelect !== false))
			this._PowerSelect.Controls.close(event);
	}

	_filter(options, filterText, skipDisabled = false) {
		this.debug(`_filter::arguments: `, arguments);

		const matcher = this.args.matcher || defaultMatcher;
		const optionMatcher = getOptionMatcher(matcher, this.args.searchField);

		return filterOptions(options, filterText, optionMatcher, skipDisabled);
	}

	_highlight(option) {
		this.debug(`_highlight::arguments: `, arguments);
		if(option && (option.args.disabled || (option._element && option._element.hasAttribute('disabled'))))
			return;

		this._selectOptions.highlightedOption = option;
	}

	_resetHighlighted() {
		this.debug(`_resetHighlighted::arguments: `, arguments);

		const defHighlighted = this.args.defaultHighlighted || defaultHighlighted;
		let highlighted = undefined;

		if(typeof defHighlighted === 'function')
			highlighted = defHighlighted(this._selectOptions);
		else
			highlighted = defHighlighted;

		this._highlight(highlighted);
	}

	_routeKeydown(event) {
		this.debug(`_routeKeydown::arguments: `, arguments);

		// Up & Down
		if (event.keyCode === this.constants.KEYCODE.UP_ARROW || event.keyCode === this.constants.KEYCODE.DOWN_ARROW) {
			return this._handleKeyUpDown(event);
		}

		// ENTER
		if (event.keyCode === this.constants.KEYCODE.ENTER) {
			return this._handleKeyEnter(event);
		}

		// Tab
		if (event.keyCode === this.constants.KEYCODE.TAB) {
			return this._handleKeyTab(event);
		}

		// ESCAPE
		if (event.keyCode === this.constants.KEYCODE.ESCAPE) {
			return this._handleKeyEscape(event);
		}
	}

	_scrollTo(option) {
		this.debug(`_scrollTo::arguments: `, arguments);
		if(!option) return;

		if(isPresent(this.args.scrollTo) && (typeof this.args.scrollTo === 'function'))
			return this.args.scrollTo(option);

		const optionsList = this._selectOptions.resolvedOptions;
		if(!optionsList) return;

		const resolvedResults = this._selectOptions.results;
		if(!resolvedResults) return;

		const index = indexOfOption(resolvedResults, option);
		if(index < 0) return;

		const contentElement = document.getElementById(`${this._PowerSelect.id}-content`);
		if(!contentElement) return;

		const optionElement = contentElement.querySelectorAll(`[class="twyr-power-select-options"]`).item(index);
		if(!optionElement) return;

		const optionTopScroll = optionElement.offsetTop - contentElement.offsetTop;
		const optionBottomScroll = optionTopScroll + optionElement.offsetHeight;

		if (optionBottomScroll > (contentElement.offsetHeight + contentElement.scrollTop)) {
			contentElement.scrollTop = optionBottomScroll - contentElement.offsetHeight;
		}
		else if (optionTopScroll < contentElement.scrollTop) {
			contentElement.scrollTop = optionTopScroll;
		}
	}

	_search(term, event) {
		this.debug(`_search::arguments: `, arguments);
		if(isPresent(this.args.search) && (typeof this.args.search === 'function'))
			this.args.search(term, event);
		else
			this._performSearch.perform(term);
	}

	_select(selected, event) {
		this.debug(`_select::arguments: `, arguments);
		if(isEqual(selected, this._selectOptions.selected))
			return;

		if(!isPresent(this.args.onChange) || (typeof this.args.onChange !== 'function'))
			return;

		this.args.onChange(selected, event);
	}

	@restartableTask
	*_performSearch(term) {
		this.debug(`_performSearch::arguments: `, arguments);
		if((!term || term.trim() === '') && (!this.args.searchText || (this.args.searchText.trim() === ''))) {
			this.debug(`_performSearch::no search text`);
			setProperties(this._selectOptions, {
				'lastSearchedText': this._selectOptions.searchText,
				'searchText': term || this.args.searchText,
				'results': this._selectOptions.resolvedOptions,
				'resultsCount': countOptions(this._selectOptions.resolvedOptions)
			});

			if(isPresent(this.args.setOptions) && (typeof this.args.setOptions === 'function')) {
				this.debug(`_performSearch::setOptions`);
				this.args.setOptions(Object.assign({}, this._selectOptions));
			}

			return;
		}

		term = term || this.args.searchText;
		if((this.args.options === this._selectOptions.options) && (term === this._selectOptions.searchText))
			return;

		try {
			this.debug(`_performSearch: search start`);
			set(this._selectStatus.isLoading, true);

			if(isPresent(this.args.setStatus) && (typeof this.args.setStatus === 'function')) {
				this.debug(`_performSearch::setStatus`);
				this.args.setStatus(Object.assign({}, this._selectStatus));
			}

			let searchResults = null;
			if(isPresent(this.args.search) && (typeof this.args.search === 'function')) {
				searchResults = yield this.args.search(this._selectOptions.resolvedOptions, term);
			}
			else {
				searchResults = yield this._filter(this._selectOptions.resolvedOptions, term);
			}

			setProperties(this._selectOptions, {
				'lastSearchedText': this._selectOptions.searchText,
				'searchText': term,
				'results': searchResults,
				'resultsCount': countOptions(searchResults)
			});

			if(isPresent(this.args.setOptions) && (typeof this.args.setOptions === 'function')) {
				this.debug(`_performSearch::setOptions`);
				this.args.setOptions(Object.assign({}, this._selectOptions));
			}

			this.debug(`_performSearch: search end`);
		}
		catch(err) {
			this.debug(`_performSearch::error: `, err);
			setProperties(this._selectOptions, {
				'lastSearchedText': this._selectOptions.searchText,
				'searchText': term,
				'results': null,
				'resultsCount': 0
			});


			if(isPresent(this.args.setOptions) && (typeof this.args.setOptions === 'function')) {
				this.debug(`_performSearch::setOptions`);
				this.args.setOptions(Object.assign({}, this._selectOptions));
			}
		}
		finally {
			set(this._selectStatus.isLoading, false);

			if(isPresent(this.args.setStatus) && (typeof this.args.setStatus === 'function')) {
				this.debug(`_performSearch::setStatus`);
				this.args.setStatus(Object.assign({}, this._selectStatus));
			}
		}
	}

	@restartableTask
	*_triggerTypingTask(event) {
		this.debug(`_triggerTypingTask::arguments: `, arguments);
		// TODO: Actual implementation
		yield;
	}

	@restartableTask
	*_updateOptions() {
		this.debug(`_updateOptions::arguments: `, arguments);
		if(!isPresent(this.args.options)) {
			this.debug(`_updateOptions::no options given`);
			setProperties(this._selectOptions, {
				'options': null,
				'resolvedOptions': null,

				'results': null,
				'resultsCount': 0
			});

			if(isPresent(this.args.setOptions) && (typeof this.args.setOptions === 'function')) {
				this.debug(`_updateOptions::setOptions`);
				this.args.setOptions(Object.assign({}, this._selectOptions));
			}
			return;
		}

		if(this.args.options === this._selectOptions.options)
			return;

		try {
			this.debug(`_updateOptions::start`);
			set(this._selectStatus.isLoading, true);

			if(isPresent(this.args.setStatus) && (typeof this.args.setStatus === 'function')) {
				this.debug(`_updateOptions::setStatus`);
				this.args.setStatus(Object.assign({}, this._selectStatus));
			}

			const resolvedOptions = yield this.args.options;
			setProperties(this._selectOptions, {
				'options': this.args.options,
				'resolvedOptions': resolvedOptions,
				'results': null,
				'resultsCount': 0
			});

			if(isPresent(this.args.setOptions) && (typeof this.args.setOptions === 'function')) {
				this.debug(`_updateOptions::setOptions`);
				this.args.setOptions(Object.assign({}, this._selectOptions));
			}

			this.debug(`_updateOptions::end`);
		}
		catch(err) {
			this.debug(`_updateOptions::error: `, err);
			setProperties(this._selectOptions, {
				'options': this.args.options,
				'resolvedOptions': this.args.options,
				'results': null,
				'resultsCount': 0
			});

			if(isPresent(this.args.setOptions) && (typeof this.args.setOptions === 'function')) {
				this.debug(`_updateOptions::setOptions`);
				this.args.setOptions(Object.assign({}, this._selectOptions));
			}
		}
		finally {
			set(this._selectStatus.isLoading, false);

			if(isPresent(this.args.setStatus) && (typeof this.args.setStatus === 'function')) {
				this.debug(`_updateOptions::setStatus`);
				this.args.setStatus(Object.assign({}, this._selectStatus));
			}

			this._resetHighlighted();
		}
	}

	@restartableTask
	*_updateSelected() {
		this.debug(`_updateSelected::arguments: `, arguments);
		if(!isPresent(this.args.selected)) {
			this.debug(`_updateSelected::nothing selected`);
			set(this._selectOptions.selected, null);

			if(isPresent(this.args.setOptions) && (typeof this.args.setOptions === 'function')) {
				this.debug(`_updateSelected::setOptions`);
				this.args.setOptions(Object.assign({}, this._selectOptions));
			}

			return;
		}

		if(this.args.selected === this._selectOptions.selected)
			return;

		try {
			this.debug(`_updateSelected::start`);
			set(this._selectStatus.isLoading, true);

			if(isPresent(this.args.setStatus) && (typeof this.args.setStatus === 'function')) {
				this.debug(`_updateSelected::setStatus`);
				this.args.setStatus(Object.assign({}, this._selectStatus));
			}

			const resolvedSelected = yield this.args.selected;
			set(this._selectOptions.selected, resolvedSelected);

			if(isPresent(this.args.setOptions) && (typeof this.args.setOptions === 'function')) {
				this.debug(`_updateSelected::setOptions`);
				this.args.setOptions(Object.assign({}, this._selectOptions));
			}

			this.debug(`_updateSelected::end`);
		}
		catch(err) {
			this.debug(`_updateOptions::error: `, err);
			set(this._selectOptions.selected, null);

			if(isPresent(this.args.setOptions) && (typeof this.args.setOptions === 'function')) {
				this.debug(`_updateSelected::setOptions`);
				this.args.setOptions(Object.assign({}, this._selectOptions));
			}
		}
		finally {
			set(this._selectStatus.isLoading, false);

			if(isPresent(this.args.setStatus) && (typeof this.args.setStatus === 'function')) {
				this.debug(`_updateSelected::setStatus`);
				this.args.setStatus(Object.assign({}, this._selectStatus));
			}

			this._highlight();
		}
	}
	// #endregion

	// #region Actions
	@action
	dropdownAlignChanged(newDropdownAlignment) {
		this.debug(`dropdownAlignChanged::newDropdownAlignment: `, newDropdownAlignment);

		if(isPresent(this.args.setAlign) && (typeof this.args.setAlign === 'function')) {
			const maskedAlign = Object.assign({}, newDropdownAlignment);
			this.args.setAlign(maskedAlign);
		}
	}

	@action
	dropdownControlsChanged(newDropdownControls) {
		this.debug(`dropdownControlsChanged::newDropdownControls: `, newDropdownControls);

		if(isPresent(this.args.setControls) && (typeof this.args.setControls === 'function'))
			this.args.setControls(this._PowerSelect.Controls);
	}

	@action
	dropdownStatusChanged(newDropdownStatus) {
		this.debug(`dropdownStatusChanged::newDropdownStatus: `, newDropdownStatus);

		if(isPresent(this.args.setStatus) && (typeof this.args.setStatus === 'function'))
			this.args.setStatus(this._PowerSelect.Status);
	}

	@action
	handleDropdownClose(event, skipFocus) {
		this.debug(`handleDropdownClose::skipFocus: ${skipFocus}, event: `, event);

		let parentCloseRetValue = null;
		if(isPresent(this.args.onClose) && (typeof this.args.onClose === 'function'))
			parentCloseRetValue = this.args.onClose(event);

		if(!parentCloseRetValue)
			return false;

		this._highlight();
	}

	@action
	handleDropdownOpen(event) {
		this.debug(`handleDropdownOpen::event: `, event);

		let parentOpenRetValue = null;
		if(isPresent(this.args.onOpen) && (typeof this.args.onOpen === 'function'))
			parentOpenRetValue = this.args.onOpen(event);

		if(!parentOpenRetValue)
			return false;

		if((event.type === 'keydown') && ((event.keyCode === this.constants.KEYCODE.UP_ARROW) || (event.keyCode === this.constants.KEYCODE.DOWN_ARROW)))
			event.preventDefault();

		this._resetHighlighted();
	}
	// #endregion
}
