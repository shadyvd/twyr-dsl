import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class TwyrDialogInnerComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('dialog-inner');
	_element = null;
	// #endregion

	// #region Tracked Attributes
	@tracked contentOverflow = false;
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
		this._checkContentOverflow();

		// content overflow might change depending on load of images inside dialog.
		this._checkContentOverflowOnLoad = this._checkContentOverflow.bind(this);
		const imageElements = this._element.querySelectorAll('img');

		imageElements.forEach((image) => {
			image.addEventListener('load', this._checkContentOverflowOnLoad);
		});
	}

	willDestroy() {
		this.debug(`willDestroy`);

		super.willDestroy(...arguments);
		if(!this._element) return;

		const imageElements = this._element.querySelectorAll('img');
		imageElements.forEach((image) => {
			image.removeEventListener('load', this._checkContentOverflowOnLoad);
		});

		this._checkContentOverflowOnLoad = null;
		this._element = null;
	}
	// #endregion

	// #region Private Methods
	_checkContentOverflow() {
		if(!this._element) {
			this.debug(`checkContentOverflow::_element: null`);
			return;
		}

		let content = this._element.querySelector('md-dialog-content');
		if(!content) {
			this.debug(`checkContentOverflow::content: null`);
			return;
		}

		this.debug(`checkContentOverflow: ${content.scrollHeight > content.clientHeight}`);
		this.contentOverflow = content.scrollHeight > content.clientHeight;
	}
	// #endregion

	// #region Actions
	@action
	onTranslateFromEnd() {
		this.debug(`onTranslateFromEnd`);
		if(!this.args.focusOnOpen)
			return;

		if(!this._element)
			return;

		const focusableElements = this._element.querySelectorAll('[autofocus]');
		let toFocus = focusableElements[focusableElements.length - 1];

		if(!toFocus) {
			const focusableButtons = this._element.querySelectorAll('md-dialog-actions button');
			toFocus = focusableButtons[focusableButtons.length - 1];
		}

		if(!toFocus)
			return;

		toFocus.focus();
	}

	@action
	onTranslateToEnd(origin) {
		this.debug(`onTranslateToEnd`);
		if(!origin) return;
		origin.focus();
	}
	// #endregion
}
