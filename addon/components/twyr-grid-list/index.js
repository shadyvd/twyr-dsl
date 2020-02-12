import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';
import gridLayout from '../../utils/grid-layout';

import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isPresent } from '@ember/utils';
import { nextTick } from 'ember-css-transitions/utils/transition-utils';
import { run } from '@ember/runloop';
import { tracked } from '@glimmer/tracking';

// #region File Global Variables
const mediaRegex = /(^|\s)((?:print-)|(?:[a-z]{2}-){1,2})?(\d+)(?!\S)/g;
const rowHeightRegex = /(^|\s)((?:print-)|(?:[a-z]{2}-){1,2})?(\d+(?:[a-z]{2,3}|%)?|\d+:\d+|fit)(?!\S)/g;
// #endregion

// #region File Global Functions
const dimensionCSS = function dimensionCSS(dimensions) {
	return `calc((${dimensions.unit}) * ${dimensions.span} + (${dimensions.span} - 1) * ${dimensions.gutter})`;
};

const media = function media(mediaName) {
	return ((mediaName.charAt(0) !== '(') ? (`(${mediaName})`) : mediaName);
};

const mediaListenerName = function mediaListenerName(name) {
	return `${name.replace('-', '')}Listener`;
};

const unitCSS = function unitCSS(units) {
  return `${units.share}% - (${units.gutter} * ${units.gutterShare})`;
};
// #endregion

export default class TwyrGridListComponent extends Component {
	// #region Services
	@service constants;
	// #endregion

	// #region Private Attributes
	debug = debugLogger('twyr-grid-list');

	_element = null;
	_childElements = [];
	// #endregion

	// #region Tracked Attributes
	@tracked _currentMedia = 'sm';
	@tracked _rowCount = 0;
	// #endregion

	// #region Yielded Sub-components
	subComponents = {
		'tile': 'twyr-grid-list/tile'
	};
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);

		this.updateGrid = this._updateGrid.bind(this);
	}
	// #endregion

	// #region Lifecycle Hooks
	@action
	async didInsert(element) {
		this.debug(`didInsert`);
		this._element = element;

		this._installMediaListener();
		run.debounce(this, this.updateGrid, 0);

		await nextTick();
		if(this.isDestroying || this.isDestroyed)
			return;

		run.debounce(this, this.updateGrid, 0);
	}

	@action
	async didReceiveArgs() {
		this.debug(`didReceiveArgs`);
		run.debounce(this, this.updateGrid, 0);

		await nextTick();
		if(this.isDestroying || this.isDestroyed)
			return;

		run.debounce(this, this.updateGrid, 0);
	}

	willDestroy() {
		this.debug(`willDestroy`);
		this.updateGrid = null;

		this._uninstallMediaListener();
		super.willDestroy(...arguments);
	}
	// #endregion

	// #region Computed Properties
	get colsMedia() {
		const sizes = this._extractResponsiveSizes(this.args.cols);
		if (Object.keys(sizes).length === 0) {
			throw new Error('md-grid-list: No valid cols found');
		}

		return sizes;
	}

	get currentCols() {
		return this._getAttributeForMedia(this.colsMedia, this._currentMedia) || 1;
	}

	get currentGutter() {
		return this._applyDefaultUnit(this._getAttributeForMedia(this.gutterMedia, this._currentMedia) || 1);
	}

	get currentRowHeight() {
		const rowHeight = this._getAttributeForMedia(this.rowHeightMedia, this._currentMedia);
		const whRatio = rowHeight.split(':');

		let currentRowHeight = undefined;
		switch (this._getRowMode(rowHeight)) {
			case 'fixed':
				currentRowHeight = this._applyDefaultUnit(rowHeight);
			break;

			case 'ratio':
				currentRowHeight = (parseFloat(whRatio[0]) / parseFloat(whRatio[1]));
			break;

			case 'fit':
				currentRowHeight = 0;
			break;
		}

		return currentRowHeight;
	}

	get currentRowMode() {
		const rowHeight = this._getAttributeForMedia(this.rowHeightMedia, this._currentMedia);
		return this._getRowMode(rowHeight);
	}

	get gutterMedia() {
		return this._extractResponsiveSizes(this.args.gutter, rowHeightRegex);
	}

	get rowHeightMedia() {
		const rowHeights = this._extractResponsiveSizes(this.args.rowHeight, rowHeightRegex);
		if (Object.keys(rowHeights).length === 0) {
			throw new Error('md-grid-list: No valid rowHeight found');
		}

		return rowHeights;
	}

	get tiles() {
		return this._childElements;
	}
	// #endregion

	// #region Private Methods
	_applyDefaultUnit(val) {
		return /\D$/.test(val) ? val : `${val}px`;
	}

	_extractResponsiveSizes(string, regex = mediaRegex) {
		let matches = {};
		let match = undefined;

		while ((match = regex.exec(string))) {
			if (match[2]) {
				matches[match[2].slice(0, -1)] = match[3];
			}
			else {
				matches.base = match[3];
			}
		}

		return matches;
	}

	_getAttributeForMedia(sizes, currentMedia) {
		let retVal = undefined;

		for (let idx = 0; idx < currentMedia.length; idx++) {
			if (!sizes[currentMedia[idx]])
				continue;

			retVal= sizes[currentMedia[idx]];
			break;
		}

		return retVal || sizes.base;
	}

	_getRowMode(rowHeight) {
		if (rowHeight === 'fit')
			return 'fit';

		if (rowHeight.indexOf(':') !== -1)
			return 'ratio';

		return 'fixed';
	}

	_gridStyle() {
		this._setTileLayout();

		const style = {};
		const colCount = this.currentCols;
		const gutter = this.currentGutter;
		const rowHeight = this.currentRowHeight;
		const rowMode = this.currentRowMode;
		const rowCount = this._rowCount;

		switch (rowMode) {
			case 'fixed':
				style.height = dimensionCSS({ 'unit': rowHeight, 'span': rowCount, 'gutter': gutter });
				style.paddingBottom = '';
			break;

			case 'ratio': {
				// rowHeight is width / height
				const hGutterShare = (colCount === 1) ? 0 : ((colCount - 1) / colCount);
				const hShare = (1 / colCount) * 100;
				const vShare = hShare * (1 / rowHeight);
				const vUnit = unitCSS({ 'share': vShare, 'gutterShare': hGutterShare, 'gutter': gutter });

				style.height = '';
				style.paddingBottom = dimensionCSS({ 'unit': vUnit, 'span': rowCount, 'gutter': gutter });
			}
			break;

			case 'fit':
				style.height = '100%';
			break;
		}

		return style;
	}

	_installMediaListener() {
		for (let mediaName in this.constants.MEDIA) {
			const query = this.constants.MEDIA[mediaName] || media(mediaName);
			const mediaList = window.matchMedia(query);
			const listenerName = mediaListenerName(mediaName);

			// Sets mediaList to a property so removeListener can access it
			this[`${listenerName}List`] = mediaList;

			// Creates a function based on mediaName so that removeListener can remove it.
			this[listenerName] = (function(result) {
				this._mediaDidChange(mediaName, result.matches);
			}).bind(this);

			// Trigger initial grid calculations
			this._mediaDidChange(mediaName, mediaList.matches);
			mediaList.addListener(this[listenerName]);
		}
	}

	_mediaDidChange(mediaName, matches) {
		this[mediaName] = matches;
		run.debounce(this, this._updateCurrentMedia, 0);
	}

	_orderedTiles() {
		if(!this._element) return;

		// Convert NodeList to native javascript array, to be able to use indexOf.
		const domTiles = Array.prototype.slice.call(this._element.querySelectorAll('md-grid-tile'));

		return this.tiles.sort((a, b) => {
			return domTiles.indexOf(a._element) > domTiles.indexOf(b._element) ? 1 : -1;
		});
	}

	_setTileLayout() {
		const tiles = this._orderedTiles();
		const layoutInfo = gridLayout(this.currentCols, tiles);

		tiles.forEach((tile, i) => {
			tile.setPosition(layoutInfo.positions[i]);
		});

		this._rowCount = layoutInfo.rowCount;
	}

	_uninstallMediaListener() {
		for (let mediaName in this.constants.MEDIA) {
			const listenerName = mediaListenerName(mediaName);
			const mediaList = this[`${listenerName}List`];

			mediaList.removeListener(this[listenerName]);
		}
	}

	_updateCurrentMedia() {
		const mediaPriorities = this.constants.MEDIA_PRIORITY;
		const currentMedia = mediaPriorities.filter((mediaName) => this[mediaName]);

		// if(isPresent(this.args.onCurrentMediaChange) && (typeof this.args.onCurrentMediaChange === 'function'))
		// 	this.args.onCurrentMediaChange(currentMedia);
		this._currentMedia = currentMedia;
	}

	_updateGrid() {
		if(!this._element)
			return;

		const gridListStyles = this._gridStyle();
		for(let key in gridListStyles) {
			this._element.style[key] = gridListStyles[key];
		}

		this.tiles.forEach((tile) => tile.updateTile());
		if(isPresent(this.args.onUpdate) && (typeof this.args.onUpdate === 'function'))
			this.args.onUpdate();
	}
	// #endregion

	// #region Actions
	@action
	registerChild(child, register) {
		this.debug(`registerChild::child: `, child, `, register: ${register}`);

		if(register) {
			if(!this._childElements.includes(child))
				this._childElements.push(child);
		}
		else {
			if(this._childElements.includes(child))
				this._childElements.splice(this._childElements.indexOf(child), 1);
		}
	}
	// #endregion
}
