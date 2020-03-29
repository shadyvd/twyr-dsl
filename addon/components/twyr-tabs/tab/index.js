import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import { tracked } from '@glimmer/tracking';

export default class TwyrTabsTabComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('twyr-tabs-tab');
	_element = null;
	// #endregion

	// #region Tracked Attributes
	@tracked left = 0;
	@tracked width = 0;
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

		if(this.args.registerWithParent && (typeof this.args.registerWithParent === 'function'))
			this.args.registerWithParent(this, true);
	}

	willDestroy() {
		this.debug(`willDestroy`);

		if(this.args.registerWithParent && (typeof this.args.registerWithParent === 'function'))
			this.args.registerWithParent(this, false);

		super.willDestroy(...arguments);
	}
	// #endregion

	// #region DOM Event Handlers
	@action
	handleClick(event) {
		if(!this._element || this._element.hasAttribute('disabled')) {
			this.debug(`handleClick::disabled`);
			return;
		}

		if(this.args.onClick && (typeof this.args.onClick === 'function')) {
			this.debug(`handleClick::onClick::event: `, event);
			this.args.onClick(event);
		}

		if(this.isSelected)
			return;

		if(this.args.onSelect && (typeof this.args.onSelect === 'function')) {
			this.debug(`handleClick::onSelect: `, this);
			this.args.onSelect(this);
		}
	}
	// #endregion

	// #region Public Methods called only by the parent
	_updateDimensions() {
		// this is the true current width
		// it is used to calculate the ink bar position & pagination offset
		this.left = this._element.offsetLeft;
		this.width = this._element.offsetWidth;
	}
	// #endregion

	// #region Computed Properties
	get computedStyle() {
		if(!this.args.href) return undefined;
		return htmlSafe('text-decoration:none; border:none;');
	}

	get isHref() {
		if(this.args.href && this._element && !this._element.hasAttribute('disabled'))
			return this.args.href;

		return undefined;
	}

	get isSelected() {
		this.debug(`isSelected? ${(this.args.value === this.args.selected)}`);
		return (this.args.value === this.args.selected);
	}
	// #endregion
}
