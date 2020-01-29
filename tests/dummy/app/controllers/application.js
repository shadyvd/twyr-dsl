import Controller from '@ember/controller';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';
import { tracked } from "@glimmer/tracking";

export default class ApplicationController extends Controller {
	@tracked isOpaque = true;
	@tracked isSidenavOpen = true;
	@tracked showDialogWithParent = false;
	@tracked checkBoxValue = true;

	debug = debugLogger('application');
	changeOpaqueInterval = -1;

	@tracked selectedTabValue = "three";
	@tracked selectedFruit = "Apple"

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

	@action
	changeCheckboxValue(newVal) {
		this.checkBoxValue = newVal;
	}

	@action
	changeSelectedFruit(newFruit) {
		this.debug('changeSelectedFruit: ', newFruit);
		this.selectedFruit = newFruit;
	}
}
