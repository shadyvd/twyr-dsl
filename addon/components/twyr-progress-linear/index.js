import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { htmlSafe } from '@ember/template';
import { inject as service } from '@ember/service';
import { isPresent } from '@ember/utils';

// #region File Global Variables
const MODE_DETERMINATE = 'determinate';
const MODE_INDETERMINATE = 'indeterminate';
const MODE_BUFFER = 'buffer';
const MODE_QUERY = 'query';
// #endregion

// #region File Global Functions
const clampValue = function clampValue(value) {
	return Math.max(0, Math.min(value || 0, 100));
}

const makeTransform = function makeTransform(value) {
	let scale = value / 100;
	let translateX = (value - 100) / 2;

	return `translateX(${translateX.toString()}%) scale(${scale.toString()}, 1)`;
}
// #endregion

export default class TwyrProgressLinearComponent extends Component {
	// #region Services
	@service constants;
	// #endregion

	// #region Private Attributes
	debug = debugLogger('twyr-progress-linear');
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion

	// Computed Properties
	get bar1Style() {
		const bufferValue = this.args.bufferValue;

		this.debug(`bar1Style: ${this.constants.CSS.TRANSFORM}: ${makeTransform(clampValue(bufferValue))}`);
		return htmlSafe(`${this.constants.CSS.TRANSFORM}: ${makeTransform(clampValue(bufferValue))}`);
	}

	get bar2Style() {
		if(this.mode === MODE_QUERY) {
			this.debug(`bar2Style::undefined`);
			return undefined;
		}

		const value = this.args.value;

		this.debug(`bar2Style: ${this.constants.CSS.TRANSFORM}: ${makeTransform(clampValue(value))}`);
		return htmlSafe(`${this.constants.CSS.TRANSFORM}: ${makeTransform(clampValue(value))}`);
	}

	get mode() {
		const value = this.args.value;
		const bufferValue = this.args.bufferValue;

		this.debug(`mode: ${isPresent(value) ? (isPresent(bufferValue) ? MODE_BUFFER : MODE_DETERMINATE) : MODE_INDETERMINATE}`);
		return (isPresent(value) ? (isPresent(bufferValue) ? MODE_BUFFER : MODE_DETERMINATE) : MODE_INDETERMINATE);
	}

	get modeClass() {
		this.debug(`modeClass: ${([MODE_QUERY, MODE_BUFFER, MODE_DETERMINATE, MODE_INDETERMINATE].includes(this.mode)) ? `md-mode-${this.mode}` : ''}`);
		return ([MODE_QUERY, MODE_BUFFER, MODE_DETERMINATE, MODE_INDETERMINATE].includes(this.mode)) ? `md-mode-${this.mode}` : '';
	}
	// #endregion
}
