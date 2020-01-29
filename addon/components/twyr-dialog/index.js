import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';

export default class TwyrDialogComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('dialog');
	_element = null;
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);

		if(this.escapeToClose) {
			this._onKeyDown = (event) => {
				if(event.keyCode !== 27)
					return;

				if(!this.args.onClose)
					return;

				if(typeof this.args.onClose !== 'function')
					return;

				this.args.onClose(event);
			};

			this._destinationElem = document.querySelector(this.destinationId);
			this._destinationElem.addEventListener('keydown', this._onKeyDown);
		}
	}
	// #endregion

	// #region Lifecycle Hooks
	@action
	didInsert(element) {
		this.debug(`didInsert: `, element);
		this._element = element;
	}

	willDestroy() {
		super.willDestroy(...arguments);

		if(!this.escapeToClose)
			return;

		if(!this._destinationElem)
			return;

		this._destinationElem.removeEventListener('keydown', this._onKeyDown);
		this._onKeyDown = null;
	}
	// #endregion

	// #region Computed Properties
	get defaultedParent() {
		return this.args.parent || '#twyr-wormhole'
	}

	get defaultedOpenFrom() {
		return this.args.openFrom || this.args.origin || this.defaultedParent;
	}

	get defaultedCloseTo() {
		return this.args.closeTo || this.args.origin || this.defaultedParent;
	}

	get destinationId() {
		const destination = this.defaultedParent;
		const destinationElem = (typeof destination === 'string') ? document.querySelector(destination) : destination;

		if((typeof destinationElem === 'string') && (destinationElem.charAt(0) === '#'))
			return `#${destinationElem.substring(1)}`;

		let id = destinationElem.getAttribute('id');
		if(id) return `#${id}`;

		id = (this._element) ? `${this._element.getAttribute('id')}-parent` : 'parent';
		destinationElem.setAttribute('id', id);

		return id;
	}

	get destinationElem() {
		return document.querySelector(this.destinationId);
	}

	get isOpaque() {
		if((this.args.opaque !== null) && (this.args.opaque !== undefined))
			return !!this.args.opaque;

		return true;
	}

	get focusOnOpen() {
		if((this.args.focusOnOpen !== null) && (this.args.focusOnOpen !== undefined))
			return !!this.args.focusOnOpen;

		return true;
	}

	get clickOutsideToClose() {
		if((this.args.clickOutsideToClose !== null) && (this.args.clickOutsideToClose !== undefined))
			return !!this.args.clickOutsideToClose;

		return true;
	}

	get escapeToClose() {
		if((this.args.escapeToClose !== null) && (this.args.escapeToClose !== undefined))
			return !!this.args.escapeToClose;

		return true;
	}
	// #endregion

	// #region Actions
	@action
	handleClick(event) {
		if(!this.clickOutsideToClose)
			return;

		if(!this.args.onClose)
			return;

		if(typeof this.args.onClose !== 'function')
			return;

		this.args.onClose(event);
	}
	// #endregion
}
