import Service from '@ember/service';
import debugLogger from 'ember-debug-logger';

export default class TwyrSidenavService extends Service {
	// #region Private Attributes
	debug = debugLogger('twyr-sidenav-service');

	_sidenavs = {};
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion

	// #region Service Interface
	register(name, sidenav) {
		if(!this._sidenavs[name]) this._sidenavs[name] = [];
		this._sidenavs[name].push({ name, sidenav });
	}

	unregister(name, sidenav) {
		let sidenavs = this._sidenavs[name] || [];
		this._sidenavs[name] = sidenavs.filter((s) => s.sidenav !== sidenav);
	}

	open(name = 'default') {
		let sidenavs = this._sidenavs[name] || [];
		sidenavs.forEach((s) => s.sidenav.open());
	}

	close(name = 'default') {
		let sidenavs = this._sidenavs[name] || [];
		sidenavs.forEach((s) => s.sidenav.close());
	}

	toggle(name = 'default') {
		let sidenavs = this._sidenavs[name] || [];
		sidenavs.forEach((s) => s.sidenav.toggle());
	}
	// #endregion
}
