import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import { supportsPassiveEventListeners } from 'twyr-dsl/utils/browser-features';
import { tracked } from '@glimmer/tracking';

export default class TwyrTooltipComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('twyr-tooltip');
	_element = null;
	// #endregion

	// #region Tracked Attributes
	@tracked _renderTooltip = false;
	@tracked _hideTooltip = true;
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);

		this.enterEventHandler = this._enterEventHandler.bind(this);
		this.leaveEventHandler = this._leaveEventHandler.bind(this);

		window.addEventListener('blur', this.leaveEventHandler);
		window.addEventListener('orientationchange', this.leaveEventHandler);
		window.addEventListener('scroll', this.leaveEventHandler);
		window.addEventListener('resize', this.leaveEventHandler);
	}
	// #endregion

	// #region Lifecycle Hooks
	@action
	didInsert(element) {
		this._renderTooltip = false;
		this._element = element.parentNode;
		this.debug(`didInsert: `, this._element);

		const anchorElem = this.anchorElement;
		if(!anchorElem) return;

		anchorElem.addEventListener('focus', this.enterEventHandler);
		anchorElem.addEventListener('mouseenter', this.enterEventHandler);
		anchorElem.addEventListener('touchstart', this.enterEventHandler, supportsPassiveEventListeners ? { passive: true } : false);
	}

	willDestroy() {
		this.debug(`willDestroy`);
		super.willDestroy(...arguments);

		const anchorElem = this.anchorElement;
		if(!anchorElem) return;

		anchorElem.removeEventListener('touchstart', this.enterEventHandler, supportsPassiveEventListeners ? { passive: true } : false);
		anchorElem.removeEventListener('mouseenter', this.enterEventHandler);
		anchorElem.removeEventListener('focus', this.enterEventHandler);

		window.removeEventListener('scroll', this.leaveEventHandler);
		window.removeEventListener('resize', this.leaveEventHandler);
		window.removeEventListener('orientationchange', this.leaveEventHandler);
		window.removeEventListener('blur', this.leaveEventHandler);
	}
	// #endregion

	// #region DOM Event Handlers
	_enterEventHandler() {
		this.debug(`_enterEvent`);
		if(this.isDestroying || this.isDestroyed)
			return;

		const anchorElem = this.anchorElement;
		if(!anchorElem) return;

		anchorElem.addEventListener('blur', this.leaveEventHandler);
		anchorElem.addEventListener('mouseleave', this.leaveEventHandler);
		anchorElem.addEventListener('touchcancel', this.leaveEventHandler);

		this._renderTooltip = true;
		this._hideTooltip = false;
	}

	_leaveEventHandler() {
		this.debug(`_leaveEvent`);
		if(this.isDestroying || this.isDestroyed)
			return;

		const anchorElem = this.anchorElement;
		if(!anchorElem) return;

		anchorElem.removeEventListener('blur', this.leaveEventHandler);
		anchorElem.removeEventListener('mouseleave', this.leaveEventHandler);
		anchorElem.removeEventListener('touchcancel', this.leaveEventHandler);

		this._renderTooltip = false;
		this._hideTooltip = true;
	}
	// #endregion

	// #region Computed Properties
	get anchorElement() {
		this.debug(`anchorElement`);

		let anchorElem = null;
		if(this.args.attachTo && (typeof this.args.attachTo === 'string')) {
			anchorElem = document.querySelector(this.args.attachTo);
		}

		anchorElem = anchorElem || this._element;
		this.debug(`anchorElement: `, anchorElem);

		return anchorElem;
	}

	get defaultedParent() {
		this.debug(`defaultedParent: `, (this.args.parent || '#twyr-wormhole'));
		return this.args.parent || '#twyr-wormhole';
	}

	get destinationId() {
		const destination = this.defaultedParent;
		const destinationElement = (typeof destination === 'string') ? document.querySelector(destination) : destination;

		if((typeof destinationElement === 'string') && (destinationElement.charAt(0) === '#')) {
			this.debug(`destinationId: `, `#${destinationElement.substring(1)}`);
			return `#${destinationElement.substring(1)}`;
		}

		let id = destinationElement.getAttribute('id');
		if(id) {
			this.debug(`destinationId: `, `#${id}`);
			return `#${id}`;
		}

		id = (this._element) ? `${this._element.getAttribute('id')}-parent` : 'parent';
		destinationElement.setAttribute('id', id);

		this.debug(`destinationId: `, id);
		return id;
	}

	get destinationElement() {
		const destElem = document.querySelector(this.destinationId);
		this.debug(`destinationElement: `, destElem);

		return destElem;
	}

	get position() {
		this.debug(`position: `, (this.args.position || 'bottom'));
		return this.args.position || 'bottom';
	}

	get zIndex() {
		this.debug(`z-index: `, (this.args.zIndex || 100));
		return this.args.zIndex || 100;
	}

	get containerStyle() {
		const contStyle = htmlSafe(`pointer-events:none; z-index:${this.zIndex};`);
		this.debug(`containerStyle: `, contStyle);

		return contStyle;
	}
	// #endregion

	// #region Actions
	@action
	updateHideTooltip(hideTooltip) {
		this._hideTooltip = hideTooltip;
	}
	// #endregion
}
