import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';
import { nextTick } from 'ember-css-transitions/utils/transition-utils';
import { htmlSafe } from '@ember/template';
import { inject as service } from '@ember/service';
import { isPresent } from '@ember/utils';
import { join, scheduleOnce } from '@ember/runloop';
import { tracked } from '@glimmer/tracking';

export default class TwyrTabsComponent extends Component {
	// #region Services
	@service constants;
	// #endregion

	// #region Private Attributes
	debug = debugLogger('twyr-tabs');

	_childElements = [];
	_element = null;
	_initialTabSelectTimeout = null;
	// #endregion

	// #region Tracked Attributes
	@tracked _canvasWidth = 0;
	@tracked _currentOffset = 0;
	@tracked _currentStretch = false;
	@tracked _previousSelectedTab = null;
	@tracked _selectedTab = null;
	@tracked _wrapperWidth = 0;
	@tracked _movingRight = true;
	@tracked _shouldPaginate = true;
	// #endregion

	// #region Yielded Sub-components
	subComponents = {
		'tab': 'twyr-tabs/tab'
	};
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);

		this.fixOffsetIfNeeded = this._fixOffsetIfNeeded.bind(this);
		this.updateCanvasWidth = this._updateCanvasWidth.bind(this);
	}
	// #endregion

	// #region Lifecycle Hooks
	@action
	didInsert(element) {
		this.debug(`didInsert`);
		this._element = element;

		window.addEventListener('resize', this.updateCanvasWidth);
		window.addEventListener('orientationchange', this.updateCanvasWidth);

		scheduleOnce('afterRender', this, this.fixOffsetIfNeeded);
	}

	@action
	async didReceiveArgs() {
		this.debug(`didReceiveArgs`);

		this._updateSelectedTab();
		this._updateCanvasWidth();

		await nextTick();
		if(this.isDestroying || this.isDestroyed)
			return;

		this._updateSelectedTab();
		this._updateCanvasWidth();
	}

	willDestroy() {
		window.removeEventListener('orientationchange', this.updateCanvasWidth);
		window.removeEventListener('resize', this.updateCanvasWidth);

		this.debug(`willDestroy`);
		super.willDestroy(...arguments);
	}
	// #endregion

	// #region Computed Properties
	get canPageBack() {
		this.debug(`canPageBack? ${(this._currentOffset > 0)}`);
		return (this._currentOffset > 0);
	}

	get canPageForward() {
		this.debug(`canPageForward? ${((this._wrapperWidth - this._currentOffset) > this._canvasWidth)}`);
		return ((this._wrapperWidth - this._currentOffset) > this._canvasWidth);
	}

	get inkBar() {
		this.debug(`inkBar`);
		if(this.args.noInkBar)
			return null;

		if(!this._selectedTab || (this._selectedTab.left === undefined))
			return null;

		this.debug(`inkBar: `, {
			'tabLeft': this._selectedTab.left,
			'tabWidth': this._selectedTab.width,
			'wrapperWidth': this._wrapperWidth,

			'left': this._selectedTab.left,
			'right': this._wrapperWidth - (this._selectedTab.left + this._selectedTab.width)
		});

		return {
			'left': this._selectedTab.left,
			'right': this._wrapperWidth - (this._selectedTab.left + this._selectedTab.width)
		};
	}

	get paginationStyle() {
		this.debug(`paginationStyle`);
		return this._shouldPaginate ? htmlSafe(`transform: translate3d(-${this._currentOffset}px, 0px, 0px);`) : undefined;

	}

	get selectedValue() {
		if(isPresent(this.args.selected)) {
			this.debug(`selectedValue: ${this.args.selected}`);
			return this.args.selected;
		}

		if(!this._selectedTab) {
			this.debug(`selectedValue: null`);
			return null;
		}

		this.debug(`selectedValue: ${this._selectedTab.args.value}`);
		return this._selectedTab.args.value;
	}

	get shouldCenter() {
		this.debug(`shouldCenter? ${!this._shouldPaginate && !!this.args.center}`);
		return !this._shouldPaginate && !!this.args.center;
	}

	get shouldStretch() {
		this.debug(`shouldStretch? ${!this._shouldPaginate && this._currentStretch}`);
		return !this._shouldPaginate && this._currentStretch;
	}

	get stretch() {
		this.debug(`stretch? ${isPresent(this.args.stretch) ? this.args.stretch : 'sm'}`);
		return isPresent(this.args.stretch) ? this.args.stretch : 'sm';
	}
	// #endregion

	// #region Private Methods
	_fixOffsetIfNeeded() {
		if(this.isDestroying || this.isDestroyed)
			return;

		if(!this._selectedTab) return;

		const tabLeftOffset = this._selectedTab.left;
		const tabRightOffset = tabLeftOffset + this._selectedTab.width;

		let newOffset = this._currentOffset;

		if(this._canvasWidth < this._selectedTab.width) {
			// align with selectedTab if canvas smaller than selected tab
			newOffset = tabLeftOffset;
		}
		else if((tabRightOffset - this._currentOffset) > this._canvasWidth) {
			// ensure selectedTab is not partially hidden on the right side
			newOffset = tabRightOffset - this._canvasWidth;
		}
		else if(tabLeftOffset < this._currentOffset) {
			// ensure selectedTab is not partially hidden on the left side
			newOffset = tabLeftOffset;
		}
		else {
			newOffset = this._currentOffset;
		}

		if(newOffset === this._currentOffset)
			return;

		this._currentOffset = newOffset;
	}

	_updateCanvasWidth() {
		join(() => {
			this._updateDimensions();
			this._updateStretchTabs();
		});
	}

	_updateSelectedTab() {
		this._movingRight = !this._selectedTab || !this._previousSelectedTab || (this._previousSelectedTab.left < this._selectedTab.left);
		scheduleOnce('afterRender', this, this.fixOffsetIfNeeded);

		if(!this.args.onChange)
			return;

		if(typeof this.args.onChange !== 'function')
			return;

		this.debug(`_updateSelectedTab::value: ${this._selectedTab && this._selectedTab.args.value}`);
		this.args.onChange(this._selectedTab && this._selectedTab.args.value);
	}

	_updateDimensions() {
		const canvasWidth = this._element.querySelector('md-tabs-canvas').offsetWidth;
		const wrapperWidth = this._element.querySelector('md-pagination-wrapper').offsetWidth;

		this._childElements.forEach((tab) => {
			tab._updateDimensions();
		});

		this._canvasWidth = canvasWidth;
		this._wrapperWidth = wrapperWidth;
		this._shouldPaginate = (wrapperWidth > canvasWidth);
	}

	_updateStretchTabs() {
		let currentStretch = true;

		// if `true` or `false` is specified, always/never "stretch tabs"
		// otherwise proceed with normal matchMedia test
		if(typeof this.stretch === 'boolean') {
			currentStretch = this.stretch;
		}
		else {
			const mediaQuery = this.constants.MEDIA[this.stretch] || this.stretch;
			currentStretch = window.matchMedia(mediaQuery).matches;
		}

		this._currentStretch = currentStretch;
	}

	async _doInitialTabSelection() {
		if(this.isDestroying || this.isDestroyed)
			return;

		if(!this._element)
			return;

		const selectedValue = this.selectedValue;
		if(!selectedValue) {
			const firstTabId = this._element.getElementsByTagName('md-tab-item')[0].getAttribute('id');
			if(!firstTabId) return;

			const firstChild = this._childElements.filter((child) => {
				return (child._element.getAttribute('id') === firstTabId);
			})[0];

			this._selectedTab = firstChild;
		}
		else {
			const selectedChild = this._childElements.filter((child) => {
				return (child.args.value === selectedValue);
			})[0];

			this._selectedTab = selectedChild;
		}


		if(!this._selectedTab) return;
		this._updateSelectedTab();
		this._updateCanvasWidth();

		await nextTick();
		if(this.isDestroying || this.isDestroyed)
			return;

		this._updateSelectedTab();
		this._updateCanvasWidth();
	}
	// #endregion

	// #region Actions
	@action
	registerChild(child, register) {
		this.debug(`registerChild::child: `, child, `, register: ${register}`);
		if(this._initialTabSelectTimeout) clearTimeout(this._initialTabSelectTimeout);

		if(register) {
			if(!this._childElements.includes(child))
				this._childElements.push(child);
		}
		else {
			if(this._childElements.includes(child))
				this._childElements.splice(this._childElements.indexOf(child), 1);
		}

		this._initialTabSelectTimeout = setTimeout(this._doInitialTabSelection.bind(this), 250);
	}

	@action
	onSelectedTabChanged(selectedTab) {
		if(selectedTab === this._selectedTab)
			return;

		this.debug(`onSelectedTabChanged::selectedTab: `, selectedTab);
		this._previousSelectedTab = this._selectedTab;
		this._selectedTab = selectedTab;

		this._updateSelectedTab();
	}

	@action
	nextPage() {
		const tab = this._childElements.filter((child) => {
			return ((child.left > this._currentOffset) && ((child.left + child.width - this._currentOffset) > this._canvasWidth));
		})[0];

		if(!tab) return;
		this._currentOffset = tab.left;
	}

	@action
	previousPage() {
		const tab = this._childElements.filter((child) => {
			return (child.left + child.width) >= this._currentOffset;
		})[0];

		if(!tab) return;

		const left = Math.max(0, (tab.left - this._canvasWidth));
		this._currentOffset = left;
	}
	// #endregion
}
