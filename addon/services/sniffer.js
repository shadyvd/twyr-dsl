import Service from '@ember/service';
import debugLogger from 'ember-debug-logger';

export default class SnifferService extends Service {
	// #region Private Attributes
	debug = debugLogger('twyr-sniffer-service');

	animations = false;
	transitions = false;
	vendorPrefix = null;

	_document = null;
	_window = null;
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
				this.vendorPrefix = match[0];
				this.vendorPrefix = this.vendorPrefix.substr(0, 1).toUpperCase() + this.vendorPrefix.substr(1);
				break;
			}
		}

		if(!this.vendorPrefix) {
			this.vendorPrefix = ('WebkitOpacity' in bodyStyle) && 'webkit';
		}

		this.transitions = !!(('transition' in bodyStyle) || (`${this.vendorPrefix}Transition` in bodyStyle));
		this.animations = !!(('animation' in bodyStyle) || (`${this.vendorPrefix}Animation` in bodyStyle));

		if(this.isAndroid && (!this.transitions || !this.animations)) {
			this.transitions = (typeof bodyStyle.webkitTransition === 'string');
			this.animations = (typeof bodyStyle.webkitAnimation === 'string');
		}
	}
	// #endregion

	// #region Computed Properties
	get isAndroid() {
		return parseInt((/android (\d+)/.exec((((this._window && this._window.navigator) || {}).userAgent).toLowerCase()) || [])[1], 10);
	}
	// #endregion
}
