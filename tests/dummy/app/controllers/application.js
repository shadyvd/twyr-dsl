import Controller from '@ember/controller';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from "@glimmer/tracking";

export default class ApplicationController extends Controller {
	@service twyrToaster;
	_toast = null;

	sizes = [{
		'groupName': 'Smalls',
		'options': ['xxxs', 'xxs', 'xs']
	}, {
		'groupName': 'Regulars',
		'options': ['small', 'medium', 'large']
	}, {
		'groupName': 'Larges',
		'options': ['xl', 'xxl', 'xxxl']
	}];
	pizzaSize = 'medium';

	@tracked isOpaque = true;
	@tracked isSidenavOpen = true;
	@tracked showDialogWithParent = false;
	@tracked checkBoxValue = true;

	debug = debugLogger('application');
	changeOpaqueInterval = -1;

	@tracked selectedTabValue = "one";
	@tracked selectedFruit = "Apple"

	@tracked sliderValue = 25;

	@tracked isDialOpen = true;

	@tracked _dropdownXAlign = 'auto';
	@tracked _dropdownYAlign = 'auto';

	constructor() {
		super(...arguments);
		this.changeOpaqueInterval = setInterval(() => {
			this.isOpaque = !this.isOpaque;

			if(this.isOpaque && !this._toast) {
				this.debug(`Showing Toast....`)
				this._toast = this.twyrToaster.show('Hello, world - the toast', {
					'duration': 400000,
					'toastClass': 'md-warn',
					'action': {
						'label': 'Undo',
						'accent': true,
						'onClick': (function() {
							this.debug('Toast action pressed');
						}).bind(this)
					},

					'onClose': (function() {
						this.debug('Toast onClose');
					}).bind(this)
				});
			}

			if(!this.isOpaque && this._toast) {
				this.debug(`Canceling Toast....`)
				this.twyrToaster.cancel(this._toast);
				this._toast = null;
			}
		}, 10000);
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
		this.debug('changeCeckboxValue: ', newVal);
		this.checkBoxValue = newVal;
	}

	@action
	changeSelectedFruit(newFruit) {
		this.debug('changeSelectedFruit: ', newFruit);
		this.selectedFruit = newFruit;
	}

	@action
	changeSliderValue(newVal) {
		this.debug('changeSliderValue: ', newVal);
		this.sliderValue = newVal;
	}

	@action
	onItemClicked() {
		this.debug('onItemClicked: howdy?');
	}

	@action toggleDial(newValue) {
		newValue = (newValue !== undefined) ? !!newValue : !this.isDialOpen;

		this.debug('toggleDial: ', newValue);
		this.isDialOpen = newValue;
	}

	@action setPizzaSize(zise) {
		this.debug('setPizzaSize: ', zise);
		this.pizzaSize = zise;
	}

	@action setAlign(dropAlign) {
		this.debug('setAlign: ', dropAlign);
		this._dropdownXAlign = dropAlign.xAlign;
		this._dropdownYAlign = dropAlign.yAlign;
	}
}
