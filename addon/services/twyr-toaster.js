import Service from '@ember/service';
import config from 'ember-get-config';
import debugLogger from 'ember-debug-logger';

import { A } from '@ember/array';
import { run } from '@ember/runloop';
import { set } from '@ember/object';
import { tracked } from "@glimmer/tracking";

export default class TwyrToasterService extends Service {
	// #region Private Attributes
	debug = debugLogger('twyr-toaster-service');

	@tracked _queue = A([]);
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion

	// #region Service Interface
	show(text, options) {
		const toast = Object.assign({
			'text': text,
			'show': true
		}, this._buildOptions(options));

		this._queue.pushObject(toast);

		this.debug(`Show: `, toast);
		return toast;
	}

	showComponent(componentName, options) {
		const toast = Object.assign({
			'componentName': componentName,
			'show': true
		}, this._buildOptions(options));

		this._queue.pushObject(toast);

		this.debug(`ShowComponent: `, toast);
		return toast;
	}

	cancel(toast) {
		this.debug(`Cancel: `, toast);

		if(this.activeToast === toast) {
			run.later(() => {
				this.debug(`Cancel Active Toast: `, toast);

				this._queue.removeObject(toast);
				set(toast, 'show', false);

				if(toast.onClose && (typeof toast.onClose === 'function')) {
					toast.onClose();
				}
			}, 400);

			return;
		}

		this.debug(`Cancel Non-active Toast: `, toast);

		this._queue.removeObject(toast);
		set(toast, 'show', false);

		if(toast.onClose && (typeof toast.onClose === 'function'))
			toast.onClose();
	}
	// #endregion

	// #region Computed Properties
	get activeToast() {
		this.debug(`activeToast: `, this._queue.firstObject);
		return this._queue.firstObject;
	}
	// #endregion

	// #region Private Methods
	_buildOptions(options) {
		const defaultProps = {
			'duration': 3000,
			'position': 'bottom right'
		};

		let toasterOptions = {};
		if (config['twyr-dsl'] && config['twyr-dsl']['twyr-toaster']) {
			toasterOptions = config['twyr-dsl']['twyr-toaster'];
		}

		return Object.assign({}, defaultProps, toasterOptions, options);
	}
	// #endregion
}
