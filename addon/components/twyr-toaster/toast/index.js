import Component from '@glimmer/component';
import config from 'ember-get-config';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isPresent } from '@ember/utils';
import { nextTick, sleep } from 'ember-css-transitions/utils/transition-utils';

export default class TwyrToasterToastComponent extends Component {
	// #region Services
	@service constants;
	// #endregion

	// #region Private Attributes
	debug = debugLogger('twyr-toaster-toast');
	_element = null;
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion

	// #region Lifecycle Hooks
	@action
	async didInsert(element) {
		this.debug(`didInsert`);
		this._element = element;

		await nextTick();
		if(this.isDestroying || this.isDestroyed)
			return;

		document.querySelector(this.destinationId).classList.add('md-toast-animating');

		if(this.escapeToClose) {
			this._escapeToClose = (function _escapeToClose(event) {
				if((event.keyCode === this.constants.KEYCODE.ESCAPE) && isPresent(this.args.onClose))
					this._destroyMessage();
			}).bind(this);

			document.body.addEventListener('keydown', this._escapeToClose);
		}

		const y = this.top ? 'top' : 'bottom';
		document.querySelector(this.destinationId).classList.add(`md-toast-open-${y}`);

		if(this.duration !== false) {
			await sleep(this.duration);
		}

		if(this.isDestroying || this.isDestroyed)
			return;

		if(this.duration !== false)
			this._destroyMessage();
	}

	willDestroy() {
		this.debug(`willDestroy`);

		if(this.escapeToClose) {
			document.body.removeEventListener('keydown', this._escapeToClose);
			this._escapeToClose = null;
		}

		const y = this.top ? 'top' : 'bottom';
		document.querySelector(this.destinationId).classList.remove(`md-toast-open-${y}`, 'md-toast-animating');

		super.willDestroy(...arguments);
	}
	// //#endregion

	// #region Computed Properties
	get capsule() {
		if(isPresent(this.args.capsule))
			return this.args.capsule;

		return true;
	}

	get defaultedParent() {
		if(isPresent(this.args.parent))
			return this.args.parent;

		return '#twyr-wormhole';
	}

	get destinationElement() {
		return document.querySelector(this.destinationId);
	}

	get destinationId() {
		if(config.environment === 'test' && !this.args.parent)
			return '#ember-testing';

		const parent = this.defaultedParent;

		const parentElem = typeof parent === 'string' ? document.querySelector(parent) : parent;

		// If the parent isn't found, assume that it is an id, but that the DOM doesn't
		// exist yet. This only happens during integration tests or if entire application
		// route is a dialog.
		if(typeof parentElem === 'string' && parentElem.charAt(0) === '#')
			return `#${parentElem.substring(1)}`;

		let { id } = parentElem;
		if(!id) {
			id = this._element ? this._element.getAttribute('id') : `${this.uniqueId}-parent`;
			parentElem.id = id;
		}

		return `#${id}`;
	}

	get duration() {
		if(isPresent(this.args.duration))
			return this.args.duration;

		return 3000;
	}

	get escapeToClose() {
		if(isPresent(this.args.escapeToClose))
			return this.args.escapeToClose;

		return false;
	}

	get left() {
		const [, x] = this.position.split(' ');
		return x === 'left';
	}

	get position() {
		if(isPresent(this.args.position))
			return this.args.position;

		return 'bottom right';
	}

	get swipeToClose() {
		if(isPresent(this.args.swipeToClose))
			return this.args.swipeToClose;

		return true;
	}

	get top() {
		const [y] = this.position.split(' ');
		return y === 'top';
	}
	// #endregion

	// #region Private Methods
	_destroyMessage() {
		if(this.isDestroying || this.isDestroyed)
			return;

		if(isPresent(this.args.onClose) && (typeof this.args.onClose === 'function'))
			this.args.onClose();
	}
	// #endregion

	// #region Actions
	@action
	onClose() {
		if(isPresent(this.args.onClose) && (typeof this.args.onClose === 'function'))
			this.args.onClose();
	}

	@action
	swipeAction()  {
		if(!this.swipeToClose)
			return;

		if(isPresent(this.args.onClose) && (typeof this.args.onClose === 'function'))
			this.args.onClose();
	}
	// //#endregion
}
