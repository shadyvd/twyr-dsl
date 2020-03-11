import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';
import { isPresent } from '@ember/utils';
import { tracked } from '@glimmer/tracking';

// #region File Global Variables
const SELECT_EDGE_MARGIN = 8;
// #endregion

// #region File Global Functions
const getOffsetRect = function getOffsetRect(node) {
	return node ? {
		'left': node.offsetLeft,
		'top': node.offsetTop,
		'width': node.offsetWidth,
		'height': node.offsetHeight
	} : {
		'left': 0,
		'top': 0,
		'width': 0,
		'height': 0
	};
}
// #endregion

export default class TwyrSelectComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('twyr-select');
	_element = null;
	// #endregion

	// #region Tracked Attributes
	@tracked _TwyrSelect = null;

	@tracked _selectStatus = {
		'isFocused': false,
		'isInvalid': false,
		'isTouched': false
	};
	// #endregion

	// #region Yielded Sub-components
	subComponents = {
		'ebdContentComponent': 'twyr-select/ebd-content',
		'ebdTriggerComponent': 'twyr-select/ebd-trigger',
		'epsTriggerComponent': 'twyr-select/eps-trigger',

		'beforeOptionsComponent': 'twyr-select/search',
		'optionsComponent': 'twyr-select/options',
		'noMatchesMessageComponent': 'twyr-select/no-matches-message',
		'searchMessageComponent': 'twyr-select/search-message'
	};
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
		this._element = element;
	}

	@action
	didReceiveArgs() {
		this._notifyValidityChange();
		this.isDisabled = (this.args.disabled || (this._element && this._element.hasAttribute('disabled')));
	}

	@action
	didMutate() {
		this.debug(`didMutate`);
		this.isDisabled = (this.args.disabled || (this._element && this._element.hasAttribute('disabled')));
	}
	// #endregion

	// #region Computed Properties
	get isFocusedAndSelected() {
		this.debug(`isFocusedAndSelected: ${this.args.selected && this._selectStatus.isFocused}`);
		return (this.args.selected && this._selectStatus.isFocused);
	}

	get isInvalidAndTouched() {
		this.debug(`isInvalidAndTouched: ${this._selectStatus.isInvalid && this._selectStatus.isTouched}`);
		return (this._selectStatus.isInvalid && this._selectStatus.isTouched);
	}
	// #endregion

	// #region Private Methods
	_clamp(num, min, max) {
		this.debug(`_clamp: ${Math.min(Math.max(num, min), max)}`);
		return Math.min(Math.max(num, min), max);
	}

	_notifyValidityChange() {
		this.debug(`_notifyValidityChange`);
		return;
	}

	@action
	calculatePosition(destination, trigger, content, options) {
		const containerNode = content;
		const contentNode = content.querySelector('md-content');

		const parentNode = document.body;

		const selectNode = content.querySelector('md-select-menu');
		const targetNode = trigger.firstElementChild; // target the label

		const parentRect = parentNode.getBoundingClientRect();
		const targetRect = targetNode.getBoundingClientRect();

		const bounds = {
			'top': SELECT_EDGE_MARGIN,
			'left': parentRect.left + SELECT_EDGE_MARGIN,
			'bottom': parentRect.height - SELECT_EDGE_MARGIN,
			'right': parentRect.width - SELECT_EDGE_MARGIN
		};

		const spaceAvailable = {
			'top': targetRect.top - bounds.top,
			'left': targetRect.left - bounds.left,
			'bottom': bounds.bottom - (targetRect.top + targetRect.height),
			'right': bounds.right - (targetRect.left + targetRect.width)
		};

		const maxWidth = parentRect.width - SELECT_EDGE_MARGIN * 2;
		const selectedNode = selectNode.querySelector('md-option[selected]');
		const optionNodes = selectNode.getElementsByTagName('md-option');
		const optgroupNodes = selectNode.getElementsByTagName('md-optgroup');

		let centeredNode = undefined;
		let left = undefined;
		let top = undefined;
		let transformOrigin = undefined;

		// If a selected node, center around that
		if(selectedNode) {
			centeredNode = selectedNode;
		}
		// If there are option groups, center around the first option group
		else if(optgroupNodes.length) {
			centeredNode = optgroupNodes[0];
		}
		// Otherwise, center around the first optionNode
		else if(optionNodes.length) {
			centeredNode = optionNodes[0];
		}
		// In case there are no options, center on whatever's in there... (eg progress indicator)
		else {
			centeredNode = contentNode.firstElementChild || contentNode;
		}

		if(contentNode.offsetWidth > maxWidth) {
			contentNode.style['max-width'] = `${maxWidth}px`;
		}

		// Remove padding before we compute the position of the menu
		let focusedNode = centeredNode;
		if((focusedNode.tagName || '').toUpperCase() === 'MD-OPTGROUP') {
			focusedNode = optionNodes[0] || contentNode.firstElementChild || contentNode;
			centeredNode = focusedNode;
		}

		// Get the selectMenuRect *after* max-width is possibly set above
		containerNode.style.display = 'block';

		const selectMenuRect = selectNode.getBoundingClientRect();
		const centeredRect = getOffsetRect(centeredNode);

		if(centeredNode) {
			const centeredStyle = window.getComputedStyle(centeredNode);
			centeredRect.paddingLeft = parseInt(centeredStyle.paddingLeft, 10) || 0;
			centeredRect.paddingRight = parseInt(centeredStyle.paddingRight, 10) || 0;
		}

		// Get scrollHeight/offsetHeight *after* container is set with display:block
		const isScrollable = contentNode.scrollHeight > contentNode.offsetHeight;
		if(isScrollable) {
			const scrollBuffer = contentNode.offsetHeight / 2;
			contentNode.scrollTop = centeredRect.top + centeredRect.height / 2 - scrollBuffer;

			if(spaceAvailable.top < scrollBuffer) {
				contentNode.scrollTop = Math.min(centeredRect.top, contentNode.scrollTop + scrollBuffer - spaceAvailable.top);
			}
			else if(spaceAvailable.bottom < scrollBuffer) {
				contentNode.scrollTop = Math.max(centeredRect.top + centeredRect.height - selectMenuRect.height, contentNode.scrollTop - scrollBuffer + spaceAvailable.bottom);
			}
		}

		left = (targetRect.left + centeredRect.left - centeredRect.paddingLeft) + 2;
		top = Math.floor(targetRect.top + targetRect.height / 2 - centeredRect.height / 2 - centeredRect.top + contentNode.scrollTop) + 2;

		transformOrigin = `${centeredRect.left + targetRect.width / 2}px
		${centeredRect.top + centeredRect.height / 2 - contentNode.scrollTop}px 0px`;

		containerNode.style.minWidth = `${targetRect.width + centeredRect.paddingLeft + centeredRect.paddingRight}px`;

		const containerRect = containerNode.getBoundingClientRect();

		const dropdownTop = this._clamp(bounds.top, top, bounds.bottom - containerRect.height);
		const dropdownLeft = this._clamp(bounds.left, left, bounds.right - containerRect.width);

		const scaleX = Math.min(targetRect.width / selectMenuRect.width, 1.0);
		const scaleY = Math.min(targetRect.height / selectMenuRect.height, 1.0);

		const style = {
			'otherStyles': options.otherStyles,
			'matchTriggerWidth': options.matchTriggerWidth,
			'renderInPlace': options.renderInPlace,

			'top': dropdownTop,
			'left': dropdownLeft,

			'xAlign': options.xAlign,
			'yAlign': options.yAlign,

			// Animate a scale out if we aren't just repositioning
			'transform': !this.didAnimateScale ? `scale(${scaleX}, ${scaleY})` : undefined,
			'transform-origin': transformOrigin
		};

		this._didAnimateScale = true;
		this.debug(`_calculatePosition: `, style);

		return style;
	}
	// #endregion

	// #region Actions
	@action
	didInsertPowerSelect(twyrSelect) {
		this.debug(`didInsertPowerSelect`);
		this._TwyrSelect = twyrSelect;
	}

	@action
	onBlur() {
		this.debug(`onBlur`);
		this._selectStatus.isFocused = false;
	}

	@action
	onChange() {
		this.debug(`onChange`);
		if(isPresent(this.args.onChange) && (typeof this.args.onChange === 'function')) {
			this.debug(`onChange: @onChange`);
			this.args.onChange(...arguments);
		}
	}

	@action
	onClose() {
		this.debug(`onClose`);

		this._didAnimateScale = false;
		this._selectStatus.isTouched = true;

		this._notifyValidityChange();
		return true;
	}

	@action
	onFocus() {
		this.debug(`onFocus`);
		this._selectStatus.isFocused = true;

		return true;
	}

	@action
	onOpen() {
		this.debug(`onOpen`);

		this._didAnimateScale = false;
		this._notifyValidityChange();

		return true;
	}
	// #endregion
}
