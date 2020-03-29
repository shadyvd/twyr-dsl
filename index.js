'use strict';

const BroccoliMergeTrees = require('broccoli-merge-trees');

const fastbootTransform = require('fastboot-transform');
const Funnel = require('broccoli-funnel');
const path = require('path');
const resolve = require('resolve');
const writeFile = require('broccoli-file-creator');

const AngularScssFilter = require('./lib/angular-scss-filter');

/**
 * Component dependencies, extracted from ember-bootstrap
 * https://github.com/kaliber5/ember-bootstrap/blob/master/index.js
 */
const componentDependencies = {
	'twyr-autocomplete': {
		'styles': [
			'components/autocomplete/autocomplete.scss',
			'components/autocomplete/autocomplete-theme.scss'
		]
	},

	'twyr-backdrop': {
		'styles': [
			'components/backdrop/backdrop.scss',
			'components/backdrop/backdrop-theme.scss'
		]
	},

	'twyr-button': {
		'styles': [
			'components/button/button.scss',
			'components/button/button-theme.scss'
		]
	},

	'twyr-card': {
		'styles': [
			'components/card/card.scss',
			'components/card/card-theme.scss'
		]
	},

	'twyr-checkbox': {
		'styles': [
			'components/checkbox/checkbox.scss',
			'components/checkbox/checkbox-theme.scss'
		]
	},

	'twyr-chips': {
		'styles': [
			'components/chips/chips.scss',
			'components/chips/chips-theme.scss'
		]
	},

	'twyr-content': {
		'styles': [
			'components/content/content.scss',
			'components/content/content-theme.scss'
		]
	},

	'twyr-dialog': {
		'styles': [
			'components/dialog/dialog.scss',
			'components/dialog/dialog-theme.scss'
		]
	},

	'twyr-divider': {
		'styles': [
			'components/divider/divider.scss',
			'components/divider/divider-theme.scss'
		]
	},

	'twyr-grid-list': {
		'styles': [
			'components/gridList/grid-list.scss'
		]
	},

	'twyr-icon': {
		'styles': [
			'components/icon/icon.scss',
			'components/icon/icon-theme.scss'
		]
	},

	'twyr-input': {
		'styles': [
			'components/input/input.scss',
			'components/input/input-theme.scss'
		]
	},

	'twyr-list': {
		'styles': [
			'components/list/list.scss',
			'components/list/list-theme.scss'
		]
	},

	'twyr-menu': {
		'styles': [
			'components/menu/menu.scss',
			'components/menu/menu-theme.scss'
		]
	},

	'twyr-progress-circular': {
		'styles': [
			'components/progressCircular/progress-circular.scss',
			'components/progressCircular/progress-circular-theme.scss'
		]
	},

	'twyr-progress-linear': {
		'styles': [
			'components/progressLinear/progress-linear.scss',
			'components/progressLinear/progress-linear-theme.scss'
		]
	},

	'twyr-radio-base': {
		'styles': [
			'components/radioButton/radio-button.scss',
			'components/radioButton/radio-button-theme.scss'
		]
	},

	'twyr-select': {
		'styles': [
			'components/select/select.scss',
			'components/select/select-theme.scss'
		]
	},

	'twyr-sidenav': {
		'styles': [
			'components/sidenav/sidenav.scss',
			'components/sidenav/sidenav-theme.scss'
		]
	},

	'twyr-slider': {
		'styles': [
			'components/slider/slider.scss',
			'components/slider/slider-theme.scss'
		]
	},

	'twyr-speed-dial': {
		'styles': [
			'components/fabSpeedDial/fabSpeedDial.scss'
		]
	},

	'twyr-subheader': {
		'styles': [
			'components/subheader/subheader.scss',
			'components/subheader/subheader-theme.scss'
		]
	},

	'twyr-switch': {
		'styles': [
			'components/switch/switch.scss',
			'components/switch/switch-theme.scss'
		]
	},

	'twyr-tabs': {
		'styles': [
			'components/tabs/tabs.scss',
			'components/tabs/tabs-theme.scss'
		]
	},

	'twyr-toast': {
		'styles': [
			'components/toast/toast.scss',
			'components/toast/toast-theme.scss'
		]
	},

	'twyr-toolbar': {
		'styles': [
			'components/toolbar/toolbar.scss',
			'components/toolbar/toolbar-theme.scss'
		]
	},

	'twyr-tooltip': {
		'styles': [
			'components/tooltip/tooltip.scss',
			'components/tooltip/tooltip-theme.scss'
		]
	}
};

module.exports = {
	'name': require('./package').name,

	'options': {
		'polyfills': {
			'classlist-polyfill': {
				'files': ['src/index.js'],
				'caniuse': 'classlist'
			},
			'element-closest': {
				'files': ['browser.js'],
				'caniuse': 'element-closest'
			},
			'matchmedia-polyfill': {
				'files': ['matchMedia.js'],
				'caniuse': 'matchmedia'
			},
			'polyfill-nodelist-foreach': {
				'files': ['index.js'],
				// compatibility from https://developer.mozilla.org/en-US/docs/Web/API/NodeList/forEach
				'browsers': ['ie > 0', 'chrome < 52', 'ff < 50', 'opera < 38', 'safari < 10', 'edge < 16', 'android < 51', 'and_chr < 51', 'and_ff < 50', 'ios_saf < 10', 'Samsung < 5']
			}
		}
	},

	included() {
		this._super.included.apply(this, arguments);
		let app;

		// If the addon has the _findHost() method (in ember-cli >= 2.7.0), we'll just
		// use that.
		if(typeof this._findHost === 'function') {
			app = this._findHost();
		} else {
			// Otherwise, we'll use this implementation borrowed from the _findHost()
			// method in ember-cli.
			let current = this;
			do {
				app = current.app || app;
			} while (current.parent.parent && (current = current.parent));
		}

		this.twyrDslOptions = Object.assign({}, app.options['twyr-dsl']);

		app.import('vendor/twyr-dsl/register-version.js');
		app.import('vendor/hammerjs/hammer.js');
		app.import('vendor/propagating-hammerjs/propagating.js');
	},

	config() {
		return {
			'twyr-dsl': {
				'insertFontLinks': true
			}
		};
	},

	contentFor(type, config) {
		if(type === 'head') {
			if(!config['twyr-dsl'].insertFontLinks)
				return;

			return `
		<link href="https://fonts.googleapis.com/css?family=Noto+Sans:400,400i,700,700i|Noto+Serif:400,400i,700,700i&subset=devanagari" rel="stylesheet" type="text/css" media="all">
		<link href="https://fonts.googleapis.com/css?family=Keania+One" rel="stylesheet" type="text/css" media="all">
		<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" type="text/css" media="all">
				`;
		}

		if(type === 'body-footer') {
			if(config.environment !== 'test' && !config._twyrDslContentForInvoked)
				config._twyrDslContentForInvoked = true;

				let response = `
		<div id="twyr-wormhole"></div>
				`;

			return response;
		}
	},

	treeForVendor(tree) {
		const version = require('./package.json').version;

		let versionTree = writeFile(
			'twyr-dsl/register-version.js',
			`Ember.libraries.register('Twyr DSL', '${version}');`
		);

		let hammerJs = fastbootTransform(new Funnel(this._pathBase('hammerjs'), {
			'files': ['hammer.js'],
			'destDir': 'hammerjs',
			'annotation': 'HammerJSFunnel'
		}));

		let propagatingHammerJs = fastbootTransform(new Funnel(this._pathBase('propagating-hammerjs'), {
			'files': ['propagating.js'],
			'destDir': 'propagating-hammerjs',
			'annotation': 'PropagatingHammerJSFunnel'
		}));

		let trees = [hammerJs, propagatingHammerJs, versionTree];
		if(tree) trees.push(tree);

		return new BroccoliMergeTrees(trees);
	},

	treeForStyles(tree) {
		let coreScssFiles = [
			'core/style/mixins.scss',
			'core/style/variables.scss',
			'core/style/structure.scss',
			'core/style/typography.scss',
			'core/style/layout.scss',
			'core/services/layout/layout.scss',

			'components/whiteframe/whiteframe.scss',
			'components/panel/panel.scss',
			'components/panel/panel-theme.scss'
		];

		let filteredScssFiles = this._addStyles(coreScssFiles) || coreScssFiles;
		let angularScssFiles = new Funnel(this._pathBase('angular-material-styles'), {
			'files': filteredScssFiles,
			'srcDir': '/src',
			'destDir': 'angular-material',
			'annotation': 'AngularScssFunnel'
		});

		angularScssFiles = new AngularScssFilter(angularScssFiles);

		let importer = writeFile(
			'twyr-components.scss',
			filteredScssFiles.map((path) => `@import './angular-material/${path}';`).join('\n')
		);

		const trees = [];
		if(angularScssFiles) trees.push(angularScssFiles);
		if(importer) trees.push(importer);
		if(tree) trees.push(tree);

		let mergedTrees = new BroccoliMergeTrees(trees, {
			'overwrite': true
		});

		return this._super.treeForStyles(mergedTrees);
	},

	treeForApp(tree) {
		tree = this._filterComponents(tree);
		return this._super.treeForApp.call(this, tree);
	},

	treeForAddon(tree) {
		tree = this._filterComponents(tree);
		return this._super.treeForAddon.call(this, tree);
	},

	treeForAddonTemplates(tree) {
		tree = this._filterComponents(tree);
		return this._super.treeForAddonTemplates.call(this, tree);
	},

	_addStyles(core = []) {
		let styles = core.slice();

		Object.keys(componentDependencies).forEach((key) => {
			this._addComponentStyle(styles, componentDependencies[key]);
		});

		return styles;
	},

	_addComponentStyle(arr, component) {
		if(component && component.styles) {
			component.styles.forEach((scss) => {
				if(!arr.includes(scss)) arr.push(scss);
			});
		}
	},

	_filterComponents(tree) {
		return tree;
	},

	/*
	  Rely on the `resolve` package to mimic node's resolve algorithm.
	  It finds the angular-material-source module in a manner that works for npm 2.x,
	  3.x, and yarn in both the addon itself and projects that depend on this addon.

	  This is an edge case b/c angular-material-source does not have a main
	  module we can require.resolve through node itself and similarily ember-cli
	  does not have such a hack for the same reason.

	  tl;dr - We want the non built scss files, and b/c this dep is only provided via
	  git, we use this hack. Please change it if you read this and know a better way.
	*/
	_pathBase(packageName) {
		return path.dirname(resolve.sync(`${packageName}/package.json`, {
			'basedir': __dirname
		}));
	}
};
