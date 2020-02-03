import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';
import { isPresent } from '@ember/utils';
import { nextTick } from 'ember-css-transitions/utils/transition-utils';
import { run } from '@ember/runloop';
import { tracked } from '@glimmer/tracking';

// #region File Global Functions
const positionCSS = function positionCSS(positions) {
	return `calc((${positions.unit} + ${positions.gutter}) * ${positions.offset})`;
};

const dimensionCSS = function dimensionCSS(dimensions) {
	return `calc((${dimensions.unit}) * ${dimensions.span} + (${dimensions.span} - 1) * ${dimensions.gutter})`;
};

const unitCSS = function unitCSS(units) {
	return `${units.share}% - (${units.gutter} * ${units.gutterShare})`;
};
// #endregion

export default class TwyrGridListTileComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('twyr-grid-list-tile');

	_element = null;
	// #endregion

	// #region Tracked Attributes
	@tracked _position = null;
	// #endregion

	// #region Yielded Sub-components
	subComponents = {
		'footer': 'twyr-grid-list/footer'
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

		if(!isPresent(this.args.gridList))
			return;

		this.args.gridList.registerChild(this, true);
		run.debounce(this.args.gridList, this.args.gridList.updateGrid, 0);
	}

	@action
	didReceiveArgs() {
		this.debug(`didReceiveArgs`);
		if(!isPresent(this.args.gridList))
			return;

		run.debounce(this.args.gridList, this.args.gridList.updateGrid, 0);

		nextTick()
		.then(() => {
			if(this.isDestroying || this.isDestroyed)
				return;

			if(!isPresent(this.args.gridList))
				return;

			run.debounce(this.args.gridList, this.args.gridList.updateGrid, 0);
		});
	}

	willDestroy() {
		this.debug(`willDestroy`);

		if(isPresent(this.args.gridList)) {
			this.args.gridList.registerChild(this, false);
		}

		super.willDestroy(...arguments);
	}
	// #endregion

	// #region Public Methods
	setPosition(position) {
		this._position = position;
	}

	updateTile() {
		if(!this._element) return;
		const tileStyles = this._tileStyle();

		for(let key in tileStyles) {
			this._element.style[key] = tileStyles[key];
		}

		if(!isPresent(this.args.onUpdate))
			return;

		if(typeof this.args.onUpdate !== 'function')
			return;

		this.args.onUpdate();
	}
	// #endregion

	// #region Computed Properties
	get colspanMedia() {
		return this.args.gridList._extractResponsiveSizes(this.args.colspan);
	}

	get currentColspan() {
		const colspan = this.args.gridList._getAttributeForMedia(this.colspanMedia, this.args.gridList._currentMedia);
		return parseInt(colspan, 10) || 1;
	}

	get rowspanMedia() {
		return this.args.gridList._extractResponsiveSizes(this.args.rowspan);
	}

	get currentRowspan() {
		const rowspan = this.args.gridList._getAttributeForMedia(this.rowspanMedia, this.args.gridList._currentMedia);
		return parseInt(rowspan, 10) || 1;
	}
	// #endregion

	// #region Private Methods
	_tileStyle() {
		const currentColspan = this.currentColspan;
		const currentRowspan = this.currentRowspan;

		const rowCount = this.args.gridList._rowCount;
		const colCount = this.args.gridList.currentCols;

		const gutter = this.args.gridList.currentGutter;
		const rowMode = this.args.gridList.currentRowMode;
		const rowHeight = this.args.gridList.currentRowHeight;

		// Percent of the available horizontal space that one column takes up.
		const hShare = (1 / colCount) * 100;

		// Fraction of the gutter size that each column takes up.
		const hGutterShare = (colCount - 1) / colCount;

		// Base horizontal size of a column.
		const hUnit = unitCSS({
			'share': hShare,
			'gutterShare': hGutterShare,
			'gutter': gutter
		});

		// The width and horizontal position of each tile is always calculated the same way, but the
		// height and vertical position depends on the rowMode.
		const style = {
			'left': positionCSS({
				'unit': hUnit,
				'offset': this._position.col,
				'gutter': gutter
			}),
			'width': dimensionCSS({
				'unit': hUnit,
				'span': currentColspan,
				'gutter': gutter
			}),
			// resets
			'paddingTop': '',
			'marginTop': '',
			'top': '',
			'height': ''
		};

		let vGutterShare = undefined;
		let vShare = undefined;
		let vUnit = undefined;

		switch (rowMode) {
			case 'fixed':
				// In fixed mode, simply use the given rowHeight.
				style.top = positionCSS({ 'unit': rowHeight, 'offset': this._position.row, 'gutter': gutter });
				style.height = dimensionCSS({ 'unit': rowHeight, 'span': currentRowspan, 'gutter': gutter });
			break;

			case 'ratio':
				// Percent of the available vertical space that one row takes up. Here, rowHeight holds
				// the ratio value. For example, if the width:height ratio is 4:3, rowHeight = 1.333.
				vShare = hShare / rowHeight;

				// Base veritcal size of a row.
				vUnit = unitCSS({ 'share': vShare, 'gutterShare': hGutterShare, 'gutter': gutter });

				// paddingTop and marginTop are used to maintain the given aspect ratio, as
				// a percentage-based value for these properties is applied to the *width* of the
				// containing block. See http://www.w3.org/TR/CSS2/box.html#margin-properties
				style.paddingTop = dimensionCSS({ 'unit': vUnit, 'span': currentRowspan, 'gutter': gutter });
				style.marginTop = positionCSS({ 'unit': vUnit, 'offset': this._position.row, 'gutter': gutter });
			break;

			case 'fit':
				// Fraction of the gutter size that each column takes up.
				vGutterShare = (rowCount - 1) / rowCount;

				// Percent of the available vertical space that one row takes up.
				vShare = (1 / rowCount) * 100;

				// Base vertical size of a row.
				vUnit = unitCSS({ 'share': vShare, 'gutterShare': vGutterShare, 'gutter': gutter });

				style.top = positionCSS({ 'unit': vUnit, 'offset': this._position.row, 'gutter': gutter });
				style.height = dimensionCSS({ 'unit': vUnit, 'span': currentRowspan, 'gutter': gutter });
			break;
		}

		return style;
	}
	// #endregion
}
