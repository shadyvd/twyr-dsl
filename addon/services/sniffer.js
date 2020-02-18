import Service from '@ember/service';
import debugLogger from 'ember-debug-logger';

export default class SnifferService extends Service {
	// #region Private Attributes
	debug = debugLogger('twyr-sniffer-service');

	_document = null;
	_window = null;

	_animations = false;
	_transitions = false;
	_vendorPrefix = null;
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);

		if(typeof FastBoot !== 'undefined')
			return;

		this._document = document;
		this._window = window;
	}
	// #endregion

	// #region Lifecycle Hooks
	init() {
		super.init(...arguments);

		if(!this._document || !this._window)
			return;

		const bodyStyle = this._document.body && this._document.body.style;
		if(!bodyStyle) return;

		const vendorRegex = /^(Moz|webkit|ms)(?=[A-Z])/;
		for(let prop in bodyStyle) {
			const match = vendorRegex.exec(prop);
			if(match) {
				this._vendorPrefix = match[0];
				this._vendorPrefix = this._vendorPrefix.substr(0, 1).toUpperCase() + this._vendorPrefix.substr(1);
				break;
			}
		}

		if(!this._vendorPrefix) {
			this._vendorPrefix = ('WebkitOpacity' in bodyStyle) && 'webkit';
		}

		this._transitions = !!(('transition' in bodyStyle) || (`${this._vendorPrefix}Transition` in bodyStyle));
		this._animations = !!(('animation' in bodyStyle) || (`${this._vendorPrefix}Animation` in bodyStyle));

		if(this.isAndroid && (!this._transitions || !this._animations)) {
			this._transitions = (typeof bodyStyle.webkitTransition === 'string');
			this._animations = (typeof bodyStyle.webkitAnimation === 'string');
		}
	}
	// #endregion

	// #region Computed Properties
	get isAndroid() {
		return parseInt((/android (\d+)/.exec((((this._window && this._window.navigator) || {}).userAgent).toLowerCase()) || [])[1], 10);
	}
	// #endregion
}
