import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';
import { isPresent } from '@ember/utils';
import { run } from '@ember/runloop';
import { tracked } from '@glimmer/tracking';

export default class TwyrSpeedDialComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('twyr-speed-dial');

	_element = null;
	// #endregion

	// #region Tracked Attributes
	@tracked _elementDidRender = false;
	// #endregion

	// #region Yielded Sub-components
	subComponents = {
		'actions': 'twyr-speed-dial/actions',
		'trigger': 'twyr-speed-dial/trigger'
	};
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

		run.next(() => {
			if (this.isDestroying || this.isDestroyed)
				return;

			this._elementDidRender = true;
		});
	}
	// #endregion

	// #region DOM Event Handlers
	@action
	handleMouseEnter(event) {
		this.debug(`handleMouseEnter`);
		if(isPresent(this.args.handleMouseEnter) && (typeof this.args.handleMouseEnter === 'function')) {
			this.args.handleMouseEnter(event);
			return;
		}

		this.open();
	}

	@action
	handleMouseLeave(event) {
		this.debug(`handleMouseLeave`);
		if(isPresent(this.args.handleMouseLeave) && (typeof this.args.handleMouseLeave === 'function')) {
			this.args.handleMouseLeave(event);
			return;
		}

		this.close();
	}
	// #endregion

	// #region Public Methods
	close() {
		this.debug(`close`);
		if(isPresent(this.args.onToggle) && (typeof this.args.onToggle === 'function')) {
			this.debug(`close::onToggle: false`);
			this.args.onToggle(false);
		}
	}

	open() {
		this.debug(`open`);
		if(isPresent(this.args.onToggle) && (typeof this.args.onToggle === 'function')) {
			this.debug(`open::onToggle: true`);
			this.args.onToggle(true);
		}
	}

	toggle() {
		this.debug(`toggle`);
		if(isPresent(this.args.onToggle) && (typeof this.args.onToggle === 'function')) {
			this.debug(`toggle::onToggle: ${!this.isOpen}`);
			this.args.onToggle(!this.isOpen);
		}
	}
	// #endregion

	// #region Computed Properties
	get animationClass() {
		if(isPresent(this.args.animation)) {
			this.debug(`animationClass: md-${this.args.animation}`);
			return `md-${this.args.animation}`;
		}

		this.debug(`animationClass: md-fling`);
		return `md-fling`;
	}

	get directionClass() {
		if(isPresent(this.args.direction)) {
			this.debug(`directionClass: ${this.args.direction}`);
			return `md-${this.args.direction}`;
		}

		this.debug(`directionClass: md-right`);
		return `md-right`;
	}

	get isOpen() {
		if(isPresent(this.args.open)) {
			this.debug(`isOpen::args: ${this.args.open}`);
			return this.args.open;
		}

		this.debug(`isOpen::no-args: false`);
		return false;
	}

	get shouldHideActions() {
		this.debug(`shouldHideActions::animation: ${(this.args.animation === 'fling')}, _elementDidRender: ${!this._elementDidRender}, result: ${((this.args.animation === 'fling') && !this._elementDidRender)}`);
		return ((this.args.animation === 'fling') && !this._elementDidRender);
	}
	// #endregion
}
