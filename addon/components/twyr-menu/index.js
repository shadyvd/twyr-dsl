import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

// #region File Global Variables
const MENU_EDGE_MARGIN = 8;
// #endregion

// #region File Global Functions
function firstVisibleChild(node) {
	for (let i = 0; i < node.children.length; ++i) {
		if(window.getComputedStyle(node.children[i]).display === 'none')
			continue;

		return node.children[i];
	}
}
// #endregion

export default class TwyrMenuComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('twyr-menu');
	// #endregion

	// #region Tracked Attribues
	@tracked _didAnimateScale = false;
	// #endregion

	// #region Yielded Sub-components
	subComponents = {
		'content': 'twyr-menu/content',
		'trigger': 'twyr-menu/trigger'
	};
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion

	// #region Computed Properties
	get offsets() {
		let offset = this.args.offset || '0 0';

		let [left, top] = offset.split(' ').map((s) => s.trim()).map(parseFloat);
		top = top || left;

		return { left, top };
	}

	get positionMode() {
		const position = this.args.position || 'target';

		let [left, top] = position.split(' ').map((s) => s.trim());
		top = top || left;

		return { left, top };
	}
	// #endregion

	// #region Private Methods
	@action
	_calculatePosition(trigger, content) {
		const containerNode = content;
		const openMenuNode = content.firstElementChild;
		const openMenuNodeRect = openMenuNode.getBoundingClientRect();
		const boundaryNode = document.body;
		const boundaryNodeRect = boundaryNode.getBoundingClientRect();

		const bounds = {
			'left': boundaryNodeRect.left + MENU_EDGE_MARGIN,
			'top': Math.max(boundaryNodeRect.top, 0) + MENU_EDGE_MARGIN,
			'bottom': Math.max(boundaryNodeRect.bottom, Math.max(boundaryNodeRect.top, 0) + boundaryNodeRect.height) - MENU_EDGE_MARGIN,
			'right': boundaryNodeRect.right - MENU_EDGE_MARGIN
		};

		let alignTarget;
		let alignTargetRect = { 'top': 0, 'left': 0, 'right': 0, 'bottom': 0 };

		let positionMode = this.positionMode;
		if((positionMode.top === 'target') || (positionMode.left === 'target') || (positionMode.left === 'target-right')) {
			alignTarget = firstVisibleChild(openMenuNode);

			if(alignTarget) {
				// TODO: Allow centering on an arbitrary node, for now center on first menu-item's child
				alignTarget = alignTarget.firstElementChild || alignTarget;
				alignTarget = alignTarget.querySelector('md-icon') || alignTarget.querySelector('.md-menu-align-target') || alignTarget;
				alignTargetRect = alignTarget.getBoundingClientRect();
			}
		}

		const menuStyle = window.getComputedStyle(openMenuNode);
		const originNode = trigger.querySelector('.md-menu-origin') || trigger.querySelector('md-icon') || trigger;
		const originNodeRect = originNode.getBoundingClientRect();
		const position = {};

		switch (positionMode.top) {
			case 'target':
				position.top = originNodeRect.top - alignTarget.offsetTop;
			break;

			case 'cascade':
				position.top = originNodeRect.top - parseFloat(menuStyle.paddingTop) - originNode.style.top;
			break;

			case 'bottom':
				position.top = originNodeRect.top + originNodeRect.height;
			break;

			default:
				alert(`Invalid target mode '${positionMode.top}' specified for twyr-menu on Y axis.`);
			break;
		}

		let transformOrigin = 'top ';
		switch (positionMode.left) {
			case 'target':
				position.left = originNodeRect.left - alignTarget.offsetLeft;
				transformOrigin += 'left';
			break;

			case 'target-left':
				position.left = originNodeRect.left;
				transformOrigin += 'left';
			break;

			case 'target-right':
				position.left = originNodeRect.right - openMenuNodeRect.width + (openMenuNodeRect.right - alignTargetRect.right);
				transformOrigin += 'right';
			break;

			case 'cascade': {
				let willFitRight = (originNodeRect.right + openMenuNodeRect.width) < bounds.right;
				position.left = willFitRight ? originNodeRect.right - originNode.style.left : originNodeRect.left - originNode.style.left - openMenuNodeRect.width;
				transformOrigin += willFitRight ? 'left' : 'right';
			}
			break;

			case 'right':
				position.left = originNodeRect.right - openMenuNodeRect.width;
				transformOrigin += 'right';
			break;

			case 'left':
				position.left = originNodeRect.left;
				transformOrigin += 'left';
			break;

			default:
				alert(`Invalid target mode '${positionMode.left}' specified for twyr-menu on X axis.`);
			break;
		}

		// sum offsets
		const offsets = this.offsets;
		position.top += offsets.top;
		position.left += offsets.left;

		this._clamp(position, bounds, containerNode);

		const dropdownTop = Math.round(position.top);
		const dropdownLeft = Math.round(position.left);

		const scaleX = Math.round(100 * Math.min(originNodeRect.width / containerNode.offsetWidth, 1.0)) / 100;
		const scaleY = Math.round(100 * Math.min(originNodeRect.height / containerNode.offsetHeight, 1.0)) / 100;

		const style = {
			'top': dropdownTop,
			'left': dropdownLeft,
			// Animate a scale out if we aren't just repositioning
			'transform': !this._didAnimateScale ? `scale(${scaleX}, ${scaleY})` : undefined,
			'transform-origin': transformOrigin
		};

		this._didAnimateScale = true;

		return {
			'style': style,
			'horizontalPosition': '',
			'verticalPosition': ''
		};
	}

	_clamp(num, min, max) {
		return Math.min(Math.max(num, min), max);
	}
	// #endregion

	// #region Actions
	@action
	close() {
		this._didAnimateScale = false;
	}

	@action
	open() {
		this._didAnimateScale = true;
	}
	// #endregion
}
