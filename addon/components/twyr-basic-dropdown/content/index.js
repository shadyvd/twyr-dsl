import Component from '@glimmer/component';
import config from 'ember-get-config';
import debugLogger from 'ember-debug-logger';

import { A } from '@ember/array';
import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import { isPresent } from '@ember/utils';
import { join } from '@ember/runloop';
import { distributeScroll, getAvailableScroll, getScrollDeltas, getScrollParent } from 'twyr-dsl/utils/scroll-helpers';
import { tracked } from '@glimmer/tracking';

// #region File Global Functions
const closestContent = function closestContent(el) {
	while (el && (!el.classList || !el.classList.contains('twyr-basic-dropdown-content')))
		el = el.parentElement;

	return el;
}

const dropdownIsValidParent = function dropdownIsValidParent(el, dropdownId) {
	const closestDropdown = closestContent(el);
	if(closestDropdown) {
		const trigger = document.getElementById(`twyr-basic-dropdown-trigger-${closestDropdown.getAttribute('id').replace('twyr-basic-dropdown-', '')}]`);
		const parentDropdown = closestContent(trigger);

		return (parentDropdown && parentDropdown.getAttribute('id') === dropdownId) || dropdownIsValidParent(parentDropdown, dropdownId);
	}

	return false;
}

const waitForAnimations = function waitForAnimations(element, callback) {
	window.requestAnimationFrame(function() {
		let computedStyle = window.getComputedStyle(element);

		if(computedStyle.animationName !== 'none' && computedStyle.animationPlayState === 'running') {
			const eventCallback = function() {
				element.removeEventListener('animationend', eventCallback);
				callback();
			};

			element.addEventListener('animationend', eventCallback);
		}
		else {
			callback();
		}
	});
}
// #endregion

export default class TwyrBasicDropdownContentComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('twyr-basic-dropdown-content');

	_element = null;
	_hasAnimatedIn = false;
	_hasMoved = false;
	// #endregion

	// #region Tracked Attributes
	@tracked _scrollableAncestors = A([]);
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

		this._hasAnimatedIn = false;
		this._hasMoved = false;

		if(this.args.dropdownId) {
			this._element.setAttribute('id', `twyr-basic-dropdown-content-${this.args.dropdownId.replace('twyr-basic-dropdown-', '')}`);
		}

		if(isPresent(this.args.registerWithDropdown) && (typeof this.args.registerWithDropdown === 'function')) {
			this.debug(`didInsert::registerWithDropdown`);
			this.args.registerWithDropdown(this._element);
		}

		if(this.args.dropdownControls && isPresent(this.args.dropdownControls.reposition) && (typeof this.args.dropdownControls.reposition === 'function')) {
			this.debug(`didInsert::dropdown::reposition`);
			join(this.args.dropdownControls.reposition);
		}

		this.debug(`didInsert::addEventListeners`);
		document.addEventListener(this.args.rootEventType, this.handleRootMousedown, true);
		window.addEventListener('orientationchange', this.runloopAwareReposition);
		window.addEventListener('resize', this.runloopAwareReposition);

		if(this.isTouchDevice) {
			this.debug(`didInsert::addTouchEventListeners`);
			document.addEventListener('touchstart', this.handleTouchstart, true);
			document.addEventListener('touchend', this.handleRootMousedown, true);
		}

		this.debug(`didInsert::_scrollbarAncestors`);
		this._setScrollableAncestors();

		this.debug(`didInsert::_addScrollHandling`);
		this._addScrollHandling();

		this.debug(`didInsert::_animateIn`);
		this._animateIn();
	}

	@action
	didReceiveArgs(element) {
		this.debug(`didReceiveArgs::arguments: `, arguments);

		if(!element) return;
		if(!this.args.dropdownId) return;

		element.setAttribute('id', `twyr-basic-dropdown-content-${this.args.dropdownId.replace('twyr-basic-dropdown-', '')}`);
	}

	@action
	didMutate(mutations) {
		this.debug(`didMutate`);
		if(!this._hasAnimatedIn) {
			this._hasAnimatedIn = true;

			this.debug(`didMutate::_scrollbarAncestors`);
			this._setScrollableAncestors();

			this.debug(`didMutate::_addScrollHandling`);
			this._addScrollHandling();

			this.debug(`didMutate::_animateIn`);
			this._animateIn();
		}

		let shouldReposition = false;
		shouldReposition = Array.prototype.slice.call(mutations[0].addedNodes).some((node) => {
			return node.nodeName !== '#comment' && !(node.nodeName === '#text' && node.nodeValue === '');
		});

		shouldReposition = shouldReposition || Array.prototype.slice.call(mutations[0].removedNodes).some((node) => {
			return node.nodeName !== '#comment' && !(node.nodeName === '#text' && node.nodeValue === '');
		});

		if(shouldReposition && this.args.shouldReposition && (typeof this.args.shouldReposition === 'function')) {
			shouldReposition = this.args.shouldReposition(mutations);
		}

		if(shouldReposition) {
			this.debug(`didMutate::runloopAwareReposition`);
			this.runloopAwareReposition();
		}
	}

	@action
	willTeardown() {
		this.debug(`willTeardown`);

		this.debug(`willTeardown::_animateOut`);
		this._animateOut();

		this.debug(`willTeardown::_removeScrollHandling`);
		this._removeScrollHandling();

		this.debug(`willTeardown::_scrollableAncestors::clear`);
		this._scrollableAncestors.clear();

		if(this.isTouchDevice) {
			this.debug(`willTeardown::removeTouchEventListeners`);
			document.removeEventListener('touchend', this.handleRootMousedown, true);
			document.removeEventListener('touchstart', this.handleTouchstart, true);
		}

		this.debug(`willTeardown::removeEventListeners`);
		window.removeEventListener('resize', this.runloopAwareReposition);
		window.removeEventListener('orientationchange', this.runloopAwareReposition);
		document.removeEventListener(this.args.rootEventType, this.handleRootMousedown, true);
	}
	// #endregion

	// #region Computed Properties
	get animationClass() {
		this.debug(`animationClass: ${(this.animationEnabled && this._hasAnimatedIn) ? 'twyr-basic-dropdown--transitioning-in' : ''}`);
		return (this.animationEnabled && this._hasAnimatedIn) ? 'twyr-basic-dropdown--transitioning-in' : '';
	}

	get animationEnabled() {
		if(isPresent(this.args.animationEnabled)) {
			this.debug(`animationEnabled::args: ${this.args.animationEnabled}`);
			return this.args.animationEnabled;
		}

		this.debug(`animationEnabled: ${config.environment !== 'test'}`);
		return (config.environment !== 'test');
	}

	get computedStyle() {
		this.debug(`computedStyle`);
		let style = '';

		if(isPresent(this.args.otherStyles)) {
			Object.keys(this.args.otherStyles).forEach((attr) => {
				style += `${attr}: ${this.args.otherStyles[attr]}; `;
			});
		}

		if(!isPresent(this.args.position))
			return htmlSafe(style);

		if(isPresent(this.args.position.top)) {
			style += `top:${this.args.position.top}px;`;
		}

		if(isPresent(this.args.position.left)) {
			style += `left:${this.args.position.left}px;`;
		}

		if(isPresent(this.args.position.bottom)) {
			style += `bottom:${this.args.position.bottom}px;`;
		}

		if(isPresent(this.args.position.right)) {
			style += `right:${this.args.position.right}px;`;
		}

		if(isPresent(this.args.position.width)) {
			style += `width:${this.args.position.width}px;`;
		}

		if(isPresent(this.args.position.height)) {
			style += `height:${this.args.position.height}px`;
		}

		this.debug(`computedStyle: "${htmlSafe(style)}"`);
		return htmlSafe(style);
	}

	get destinationElement() {
		this.debug(`destinationElement: `, document.getElementById(this.args.destinationId));
		return document.getElementById(this.args.destinationId);
	}

	get isTouchDevice() {
		this.debug(`isTouchDevice: ${Boolean(!!window && 'ontouchstart' in window)}`);
		return Boolean(!!window && 'ontouchstart' in window);
	}
	// #endregion

	// #region Private Methods
	_addScrollEvents() {
		this.debug(`_addScrollEvents::window`);
		window.addEventListener('scroll', this.runloopAwareReposition);

		this._scrollableAncestors.forEach((el) => {
			this.debug(`_addScrollEvents: `, el);
			el.addEventListener('scroll', this.runloopAwareReposition);
		});
	}

	_addScrollHandling() {
		this.debug(`_addScrollHandling`);
		if(this.args.preventScroll === true) {
			this.debug(`_addScrollHandling::preventScroll::true`);

			let wheelHandler = (event) => {
				if(this._element.contains(event.target) || this._element === event.target) {
					// Discover the amount of scrollable canvas that is within the dropdown.
					const availableScroll = getAvailableScroll(event.target, this._element);

					// Calculate what the event's desired change to that scrollable canvas is.
					let { deltaX, deltaY } = getScrollDeltas(event);

					// If the consequence of the wheel action would result in scrolling beyond
					// the scrollable canvas of the dropdown, call preventDefault() and clamp
					// the value of the delta to the available scroll size.
					if(deltaX < availableScroll.deltaXNegative) {
						deltaX = availableScroll.deltaXNegative;
						event.preventDefault();
					}
					else if(deltaX > availableScroll.deltaXPositive) {
						deltaX = availableScroll.deltaXPositive;
						event.preventDefault();
					}
					else if(deltaY < availableScroll.deltaYNegative) {
						deltaY = availableScroll.deltaYNegative;
						event.preventDefault();
					}
					else if(deltaY > availableScroll.deltaYPositive) {
						deltaY = availableScroll.deltaYPositive;
						event.preventDefault();
					}

					// Add back in the default behavior for the two good states that the above
					// `preventDefault()` code will break.
					// - Two-axis scrolling on a one-axis scroll container
					// - The last relevant wheel event if the scroll is overshooting

					// Also, don't attempt to do this if both of `deltaX` or `deltaY` are 0.
					if(event.defaultPrevented && (deltaX || deltaY)) {
						distributeScroll(deltaX, deltaY, event.target, this._element);
					}
				}
				else {
					// Scrolling outside of the dropdown is prohibited.
					event.preventDefault();
				}
			}

			this.debug(`_addScrollHandling::document`);
			document.addEventListener('wheel', wheelHandler, { 'capture': true, 'passive': false });

			this.debug(`_addScrollHandling::_removeScrollHandling`);
			this._removeScrollHandling = () => {
				this.debug(`_removeScrollHandling`);
				document.removeEventListener('wheel', wheelHandler, { 'capture': true, 'passive': false });
			}
		}
		else {
			this.debug(`_addScrollHandling::preventScroll::false`);

			this._addScrollEvents();
			this._removeScrollHandling = this._removeScrollEvents;
		}
	}

	_animateIn() {
		if(!this.animationEnabled) {
			this.debug(`_animateIn::animationEnabled::false`);
			return;
		}
		this.debug(`_animateIn::waitForAnimations`);
		waitForAnimations(this._element, () => {
			this.debug(`_animateIn::waitForAnimations done!`);
			this._hasAnimatedIn = true;
		});
	}

	_animateOut() {
		if(!this.animationEnabled) {
			this.debug(`_animateOut::animationEnabled::false`);
			return;
		}

		const parentElement = this.args.renderInPlace ? this._element.parentElement.parentElement : this._element.parentElement;
		this.debug(`_animateOut::parentElement: `, parentElement);

		let clone = this._element.cloneNode(true);
		clone.id = `${clone.id}--clone`;

		if(this.animationClass.trim() !== '') clone.classList.remove(...this.animationClass.split(' '));
		clone.classList.add(...`twyr-basic-dropdown--transitioning-out`.split(' '));

		parentElement.appendChild(clone);

		this.debug(`_animateOut::waitForAnimations`);
		waitForAnimations(clone, () => {
			this.debug(`_animateOut::waitForAnimations done!`);
			parentElement.removeChild(clone);
		});
	}

	_setScrollableAncestors() {
		const triggerElement = document.getElementById(`twyr-basic-dropdown-trigger-${this.args.dropdownId.replace('twyr-basic-dropdown-', '')}`);
		this.debug(`_setScrollableAncestors::triggerElement: `, triggerElement);

		const scrollableElements = [];
		if(triggerElement) {
			let nextScrollable = getScrollParent(triggerElement.parentNode);

			while (nextScrollable && nextScrollable.tagName.toUpperCase() !== 'BODY' && nextScrollable.tagName.toUpperCase() !== 'HTML') {
				scrollableElements.push(nextScrollable);
				nextScrollable = getScrollParent(nextScrollable.parentNode);
			}
		}

		this.debug(`_setScrollableAncestors::_scrollableAncestors: `, scrollableElements);
		this._scrollableAncestors.addObjects(scrollableElements);
	}

	_removeScrollEvents() {
		this.debug(`_removeScrollEvents::window`);
		window.removeEventListener('scroll', this.runloopAwareReposition);

		this._scrollableAncestors.forEach((el) => {
			this.debug(`_removeScrollEvents: `, el);
			el.removeEventListener('scroll', this.runloopAwareReposition);
		});
	}
	// #endregion

	// #region Actions
	@action
	handleRootMousedown(event) {
		const triggerElement = document.getElementById(`twyr-basic-dropdown-trigger-${this.args.dropdownId.replace('twyr-basic-dropdown-', '')}`);
		this.debug(`handleRootMousedown::trigger: `, triggerElement);

		if(this._hasMoved || this._element.contains(event.target) || (triggerElement && triggerElement.contains(event.target))) {
			this.debug(`handleRootMousedown::_hasMoved #1: false`);
			this._hasMoved = false;

			return;
		}

		if(dropdownIsValidParent(event.target, this.args.dropdownId)) {
			this.debug(`handleRootMousedown::_hasMoved #2: false`);
			this._hasMoved = false;

			return;
		}

		if(this.args.dropdownControls && isPresent(this.args.dropdownControls.close) && (typeof this.args.dropdownControls.close === 'function')) {
			this.debug(`handleRootMousedown::dropdown::close`);
			this.args.dropdownControls.close(event, true);
		}
	}

	@action
	runloopAwareReposition() {
		if(this.args.dropdownControls && isPresent(this.args.dropdownControls.reposition) && (typeof this.args.dropdownControls.reposition === 'function')) {
			this.debug(`runloopAwareReposition::dropdown::reposition`);
			join(this.args.dropdownControls.reposition);
		}
	}

	@action
	handleTouchmove() {
		this.debug(`handleTouchmove`);

		this._hasMoved = true;
		document.removeEventListener('touchmove', this.handleTouchmove, true);
	}

	@action
	handleTouchstart() {
		this.debug(`handleTouchstart`);
		document.addEventListener('touchmove', this.handleTouchmove, true);
	}
	// #endregion
}
