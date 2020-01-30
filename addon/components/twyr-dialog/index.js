import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';
import { isPresent } from '@ember/utils';

export default class TwyrDialogComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('twyr-dialog');
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
		this.debug(`willDestroy`);
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
		this.debug(`defaultedParent: ${this.args.parent || '#twyr-wormhole'}`);
		return this.args.parent || '#twyr-wormhole';
	}

	get defaultedOpenFrom() {
		this.debug(`defaultedOpenFrom: ${this.args.openFrom || this.args.origin || this.defaultedParent}`);
		return this.args.openFrom || this.args.origin || this.defaultedParent;
	}

	get defaultedCloseTo() {
		this.debug(`defaultedCloseTo: ${this.args.closeTo || this.args.origin || this.defaultedParent}`);
		return this.args.closeTo || this.args.origin || this.defaultedParent;
	}

	get destinationId() {
		const destination = this.defaultedParent;
		const destinationElem = (typeof destination === 'string') ? document.querySelector(destination) : destination;

		if((typeof destinationElem === 'string') && (destinationElem.charAt(0) === '#')) {
			this.debug(`destinationId: #${destinationElem.substring(1)}`);
			return `#${destinationElem.substring(1)}`;
		}

		let id = destinationElem.getAttribute('id');
		if(id) {
			this.debug(`destinationId: #${id}`);
			return `#${id}`;
		}

		id = (this._element) ? `${this._element.getAttribute('id')}-parent` : 'parent';
		destinationElem.setAttribute('id', id);

		this.debug(`destinationId: #${id}`);
		return id;
	}

	get destinationElem() {
		const destElem = document.querySelector(this.destinationId);

		this.debug(`destinationElem: `, destElem);
		return destElem;
	}

	get isOpaque() {
		this.debug(`isOpaque: ${isPresent(this.args.opaque) ? this.args.opaque : true}`);
		return isPresent(this.args.opaque) ? this.args.opaque : true;
	}

	get focusOnOpen() {
		this.debug(`focusOnOpen: ${isPresent(this.args.focusOnOpen) ? this.args.focusOnOpen : true}`);
		return isPresent(this.args.focusOnOpen) ? this.args.focusOnOpen : true;
	}

	get clickOutsideToClose() {
		this.debug(`clickOutsideToClose: ${isPresent(this.args.clickOutsideToClose) ? this.args.clickOutsideToClose : true}`);
		return isPresent(this.args.clickOutsideToClose) ? this.args.clickOutsideToClose : true;
	}

	get escapeToClose() {
		this.debug(`escapeToClose: ${isPresent(this.args.escapeToClose) ? this.args.escapeToClose : true}`);
		return isPresent(this.args.escapeToClose) ? this.args.escapeToClose : true;
	}
	// #endregion

	// #region Actions
	@action
	handleClick(event) {
		if(!this.clickOutsideToClose) {
			this.debug(`handleClick::clickOutsideToClose::false`);
			return;
		}

		if(!this.args.onClose) {
			this.debug(`handleClick: no onClose`);
			return;
		}

		if(typeof this.args.onClose !== 'function') {
			this.debug(`handleClick: onClose not func`);
			return;
		}

		this.debug(`handleClick::onClose: `, event);
		this.args.onClose(event);
	}
	// #endregion
}
