import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';
import { htmlSafe } from '@ember/string';
import { nextTick } from 'ember-css-transitions/utils/transition-utils';
import { scheduleOnce } from '@ember/runloop';
import { tracked } from '@glimmer/tracking';

export default class TwyrTooltipInnerComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('tooltip-inner');
	// #endregion

	// #region Tracked Attributes
	@tracked hide = true;
	@tracked computedStyle = null;
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
		// eslint-disable-next-line ember/no-incorrect-calls-with-inline-anonymous-functions
		scheduleOnce('afterRender', () => {
			this.debug(`didInsert::afterRender`);
			if(this.isDestroying || this.isDestroyed)
				return;

			const anchorElem = this.args.anchorElement;
			const position = this.args.position;

			const tooltipPosition = this._calculateTooltipPosition(element, anchorElem, position);
			this.computedStyle = htmlSafe(`top:${tooltipPosition.top}px; left:${tooltipPosition.left}px;`);
			this.debug(`didInsert::afterRender::computedStyle: ${this.computedStyle}`);

			if(this.args.updateHide && (typeof this.args.updateHide === 'function'))
				this.args.updateHide(true);

			nextTick()
			.then(() => {
				if(this.isDestroying || this.isDestroyed)
					return;

				this.debug(`didInsert::afterRender::nextTick`);
				if(this.args.updateHide && (typeof this.args.updateHide === 'function')) {
					this.args.updateHide(false);
				}
			});
		});
	}
	// #endregion

	// #region Computed Properties
	get show() {
		this.debug(`show: ${!!this.computedStyle}`);
		return !!this.computedStyle;
	}
	// #endregion

	// #region Private Methods
	_calculateTooltipPosition(tooltipElem, anchorElem, position) {
		const tooltipBounds = tooltipElem.getBoundingClientRect();
		const anchorBounds = anchorElem.getBoundingClientRect();

		const positionStyle = {};

		switch (position) {
			case 'top':
				positionStyle.top = anchorBounds.top - tooltipBounds.height;
				positionStyle.left = anchorBounds.left + (0.5 * anchorBounds.width) - (0.5 * tooltipBounds.width);
			break;

			case 'bottom':
				positionStyle.top = anchorBounds.bottom;
				positionStyle.left = anchorBounds.left + (0.5 * anchorBounds.width) - (0.5 * tooltipBounds.width);
			break;

			case 'right':
				positionStyle.top = anchorBounds.top + (0.5 * anchorBounds.height) - (0.5 * tooltipBounds.height);
				positionStyle.left = anchorBounds.right;
			break;

			case 'left':
				positionStyle.top = anchorBounds.top + (0.5 * anchorBounds.height) - (0.5 * tooltipBounds.height);
				positionStyle.left = anchorBounds.left - tooltipBounds.width;
			break;
		}

		// Account for negative margins
		const tooltipStyle = window.getComputedStyle(tooltipElem);
		const tooltipMarginTop = parseInt(tooltipStyle.marginTop);
		const tooltipMarginLeft = parseInt(tooltipStyle.marginLeft);

		positionStyle.top = this._clamp(positionStyle.top, 0 - tooltipMarginTop, window.innerHeight - tooltipBounds.height - tooltipMarginTop);
		positionStyle.left = this._clamp(positionStyle.left, 0 - tooltipMarginLeft, window.innerWidth - tooltipBounds.width - tooltipMarginLeft);

		return positionStyle;
	}

	_clamp(num, min, max) {
		return Math.min(Math.max(num, min), max);
	}
	// #endregion
}
