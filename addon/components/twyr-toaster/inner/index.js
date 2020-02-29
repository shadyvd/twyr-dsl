import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import { isPresent } from '@ember/utils';
import { tracked } from '@glimmer/tracking';

export default class TwyrToasterInnerComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('twyr-toaster-inner');

	_element = null;
	_hammer = null;
	// #endregion

	// #region Tracked Attributes
	@tracked _isActive = false;
	@tracked _isDragging = false;
	@tracked _x = 0;
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
		this.debug('didInsert');
		this._element = element;

		if(this.args.swipeToClose)
			this._setupHammer();
	}

	@action
	didReceiveArgs() {
		if(this.args.swipeToClose && !this._hammer) {
			this._setupHammer();
			return;
		}

		if(!this.args.swipeToClose && this._hammer) {
			this._teardownHammer();
			return;
		}
	}

	willDestroy() {
		this.debug('willDestroy');
		if(!this._hammer)
			return;

		this._teardownHammer();
	}
	// #endregion

	// #region Computed Properties
	get computedStyle() {
		return htmlSafe(`transform:translate(${ this._x }px, 0)`);
	}
	// #endregion

	// #region Private Methods
	_dragStart(event) {
		if(!this.args.swipeToClose)
			return;

		this._isActive = true;
		this._isDragging = true;
		this._element.focus();

		this._x = event.center.x;
	}

	_drag(event) {
		if(!this.args.swipeToClose || this._isDragging)
			return;

		this._x = event.deltaX;
	}

	_dragEnd() {
		if(!this.args.swipeToClose)
			return;

		this._isActive = false;
		this._isDragging = false;

		if(isPresent(this.args.onClose) && (typeof this.args.onClose === 'function'))
			this.args.onClose();
	}

	_setupHammer() {
		if(!this._element)
			return;

		// Enable dragging the slider
		const containerManager = new window.Hammer.Manager(this._element, {
			'dragLockToAxis': true,
			'dragBlockHorizontal': true
		});

		const swipe = new window.Hammer.Swipe({
			'direction': window.Hammer.DIRECTION_ALL,
			'threshold': 10
		});

		const pan = new window.Hammer.Pan({
			'direction': window.Hammer.DIRECTION_ALL,
			'threshold': 10
		});

		containerManager.add(swipe);
		containerManager.add(pan);

		containerManager.on('panstart', this._dragStart.bind(this));
		containerManager.on('panmove', this._drag.bind(this));
		containerManager.on('panend', this._dragEnd.bind(this));
		containerManager.on('swiperight swipeleft', this._dragEnd.bind(this));

		this._hammer = containerManager;
	}

	_teardownHammer() {
		this._hammer.destroy();
		this._hammer = null;
	}
	// #endregion
}
