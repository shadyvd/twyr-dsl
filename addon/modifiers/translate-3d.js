import Modifier from 'ember-modifier';
import debugLogger from 'ember-debug-logger';

import { computeTimeout, nextTick, sleep } from 'ember-css-transitions/utils/transition-utils';
import { htmlSafe } from '@ember/string';
import { isPresent } from '@ember/utils';
import { scheduleOnce } from '@ember/runloop';

export default class Translate3dModifier extends Modifier {
	// #region Private Attributes
	debug = debugLogger('translate-3d-modifier');
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion

	// #region Lifecycle Hooks
	didInstall() {
		super.didInstall(...arguments);
		this.debug(`didInstall`);

		// eslint-disable-next-line ember/no-incorrect-calls-with-inline-anonymous-functions
		scheduleOnce('afterRender', () => {
			this.debug(`applying transform style "from"`);
			this._translateStyle('from');

			nextTick()
			.then(() => {
				if(this.isDestroying || this.isDestroyed)
					return;

				this.debug(`applying transform style "main"`);
				this.element.classList.add('md-transition-in');
				this._translateStyle('main');

				const transformTimeout = computeTimeout(this.element);
				return sleep(transformTimeout);
			})
			.then(() => {
				if(this.isDestroying || this.isDestroyed)
					return;

				if(!this.args.named.onTranslateFromEnd)
					return;

				if(typeof this.args.named.onTranslateFromEnd !== 'function')
					return;

				this.debug(`calling onTranslateFromEnd`);
				this.args.named.onTranslateFromEnd();
			});
		});
	}

	willRemove() {
		this.debug(`willRemove`);
		super.willRemove(...arguments);

		const containerClone = this.element.parentNode.cloneNode(true);

		const parentNode = document.querySelector(this.args.named.defaultedParent);
		if(isPresent(parentNode) && isPresent(parentNode.parentNode)) {
			parentNode.parentNode.appendChild(containerClone);
		}

		nextTick()
		.then(() => {
			const dialogClone = containerClone.querySelector('md-dialog');
			const toStyle = `transform:${this._calculateZoomToOrigin(dialogClone, this.args.named.defaultedCloseTo)}`;

			dialogClone.classList.remove('md-transition-in');
			dialogClone.classList.add('md-transition-out');
			dialogClone.style.cssText = toStyle;

			const transformTimeout = computeTimeout(dialogClone);
			return sleep(transformTimeout);
		})
		.then(() => {
			if(isPresent(containerClone.parentNode)) {
				containerClone.parentNode.removeChild(containerClone);
			}

			if(!this.args.named.onTranslateToEnd)
				return;

			if(typeof this.args.named.onTranslateToEnd !== 'function')
				return;

			const origin = ((typeof this.args.named.origin === 'string') ? document.querySelector(this.args.named.origin) : this.args.named.origin);
			this.args.named.onTranslateToEnd(origin);
		});
	}
	// #endregion

	// #region Computed Properties
	get fromStyle() {
		return `transform:${this._calculateZoomToOrigin(this.element, this.args.named.defaultedOpenFrom)}`;
	}

	get centerStyle() {
		return `transform:`;
	}
	// #endregion

	// #region Private Methods
	_translateStyle(transformStyle) {
		this.debug(`_translateStyle`);
		let elementCss = htmlSafe('');

		if(transformStyle === 'from')
			elementCss = htmlSafe(this.fromStyle);

		if(transformStyle === 'main')
			elementCss = htmlSafe(this.centerStyle);

		this.debug(`elementCss: `, elementCss);
		this.element.style.cssText = elementCss;
	}

	_calculateZoomToOrigin(element, originator) {
		this.debug(`_calculateZoomToOrigin`);
		let zoomStyle = { 'centerX': 0, 'centerY': 0, 'scaleX': 0.5, 'scaleY': 0.5 };

		const origin = (typeof originator === 'string') ? document.querySelector(originator) : originator;
		if(element && origin) {
			const dialogRect = this._copyRect(element.getBoundingClientRect());
			const dialogCenterPt = this._centerPointFor(dialogRect);

			const originBnds = this._copyRect(origin.getBoundingClientRect());
			const originCenterPt = this._centerPointFor(originBnds);

			zoomStyle['centerX'] = originCenterPt.x - dialogCenterPt.x;
			zoomStyle['centerY'] = originCenterPt.y - dialogCenterPt.y;
			zoomStyle['scaleX'] = Math.min(0.5, originBnds.width / dialogRect.width);
			zoomStyle['scaleY'] = Math.min(0.5, originBnds.height / dialogRect.height);
		}

		this.debug(`_calculateZoomToOrigin: translate3d(${zoomStyle.centerX}px, ${zoomStyle.centerY}px, 0 ) scale(${zoomStyle.scaleX}, ${zoomStyle.scaleY})`);
		return `translate3d(${zoomStyle.centerX}px, ${zoomStyle.centerY}px, 0 ) scale(${zoomStyle.scaleX}, ${zoomStyle.scaleY})`;
	}

	_copyRect(source, destination) {
		if(!source) return null;

		destination = destination || {};

		'left top right bottom width height'.split(' ').forEach((key) => {
			destination[key] = Math.round(source[key]);
		});

		destination.width = destination.width || (destination.right - destination.left);
		destination.height = destination.height || (destination.bottom - destination.top);

		return destination;
	}

	_centerPointFor(targetRect) {
		return {
			'x': Math.round(targetRect.left + (targetRect.width / 2)),
			'y': Math.round(targetRect.top + (targetRect.height / 2))
		};
	}
	// #endregion
}
