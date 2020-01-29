import Controller from '@ember/controller';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';
import { tracked } from "@glimmer/tracking";

export default class ApplicationController extends Controller {
	@tracked isOpaque = true;
	@tracked isSidenavOpen = true;
	@tracked showDialogWithParent = false;

	debug = debugLogger('application');
	changeOpaqueInterval = -1;

	@tracked selectedTabValue = "three";

	constructor() {
		super(...arguments);
		// this.changeOpaqueInterval = setInterval(() => {
		// 	this.isOpaque = !this.isOpaque;
		// }, 10000);
	}

	@action
	onReset(event) {
		this.debug('onReset with event: ', event);
	}

	@action
	onShowDialogWithParent(open) {
		this.showDialogWithParent = (open === 'open');
	}

	@action
	onToggleSidenav(toggleStatus) {
		this.isSidenavOpen = toggleStatus;

		if(toggleStatus === false) {
			setTimeout(() => {
				this.isSidenavOpen = true;
			}, 3000)
		}
	}

	@action
	changeSelectedTab(newTabValue) {
		this.debug('changeSelectedTab with tab value: ', newTabValue);
		this.selectedTabValue = newTabValue;
	}
}
