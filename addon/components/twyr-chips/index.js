import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';
import { isEmpty, isPresent } from '@ember/utils';
import { tracked } from '@glimmer/tracking';

export default class TwyrChipComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('twyr-chip');
	// #endregion

	// #region Tracked Attributes
	@tracked _activeChip = -1;
	@tracked _isFocused = false;
	@tracked _searchText = '';
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion

	// #region DOM Event Handlers
	@action
	handleFocusIn() {
		this._isFocused = true;
	}

	@action
	handleFocusOut() {
		this._isFocused = false;
		this._activeChip = -1;
	}

	@action
	handleClick(event) {
		event.currentTarget.querySelector('.md-chip-input-container input').focus();
	}

	@action
	handleKeydown(event) {
		let input = event.currentTarget.querySelector('.md-chip-input-container input');

		if(!this.args.readOnly && isEmpty(input.value) && this.args.content.length) {
				this._keyboardNavigation(event, input);
		}
	}
	// #endregion

	// #region Private Methods
	_keyboardNavigation(event, input) {
		// No text has been entered, but we have chips; cursor keys should select chips.
		const current = this._activeChip;
		const chips = this.args.content;
		const key = event.key;

		if(['ArrowLeft', 'Left'].includes(key) || (key === 'Backspace' && current === -1)) {
			if(current === -1) {
				input.blur();
				event.currentTarget.focus();

				this._activeChip = (chips.length - 1);
			}
			else if(current > 0) {
				this._activeChip = (this._activeChip - 1);
			}
		}

		if(['ArrowRight', 'Right'].includes(key)) {
			if(current >= 0) {
				this._activeChip = (this.activeChip + 1);
			}

			if(this._activeChip >= chips.length) {
				this._activeChip = -1;
				input.focus();
			}
		}

		if(['Backspace', 'Delete', 'Del'].includes(key) && (current >= 0)) {
			this._activeChip = (Math.min(chips.length - 1, this._activeChip));
			if(isPresent(this.args.removeItem) && (typeof this.args.removeItem === 'function'))
				this.argsremoveItem(chips[current]);
		}
	}
	// #endregion

	// #region Actions
	@action
	handleAutocompleteChange(item, select) {
		if(!item || !select.isOpen)
			return;

		// Trigger onChange for the new item.
		if(isPresent(this.args.addItem) && (typeof this.args.addItem === 'function')) {
			this.args.addItem(item);
		}

		select.search('');
		this._searchText = '';
	}

	@action
	handleSearchTextChange(value, select) {
		this._searchText = value;

		// Close dropdown if search text is cleared by the user.
		if(isPresent(value))
			return;

		select.close();
	}

	@action
	handleAutocompleteOpen(select, e) {
		return (e && e.type !== 'focus');
	}

	@action
	handleAddItem(newItem, select) {
		if(this.requireMatch)
			return;

		if(!isPresent(newItem))
			return;

		let item = newItem;

		if(isPresent(this.args.searchField)) {
			item = {};
			item[this.args.searchField] = newItem;
		}

		if(isPresent(this.args.addItem) && (typeof this.args.addItem === 'function'))
			this.args.addItem(item);

		if(select) select.search('');
		this._searchText = '';
	}

	@action
	handleRemoveItem(item) {
		if(isPresent(this.args.removeItem) && (typeof this.args.removeItem === 'function'))
			this.argsremoveItem(item);

		if((this._activeChip === -1) || (this._activeChip >= this.args.content.length))
			this.set('activeChip', -1);
	}

	@action
	handleInputKeydown(event) {
		if(event.key !== 'Enter')
			return;

		this.handleAddItem(event.target.value);
		event.target.value = '';
	}

	@action
	handleChipClick(index, event) {
		event.stopPropagation();

		if(this.args.readOnly)
			return;

		this._activeChip = index;
	}
	// #endregion
}
