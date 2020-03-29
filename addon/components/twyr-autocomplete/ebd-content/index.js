import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class TwyrAutocompleteEbdContentComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('twyr-autocomplete-ebd-content');
	// #endregion

	// #region Tracked Attributes
	@tracked _customStyles = {
		'overflow-y': 'auto',
		'overflow-x': 'hidden',
		'height': 'auto!important'
	};
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion

	// #region Private Methods
	@action
	shouldReposition(mutations) {
		let shouldReposition = false;

		shouldReposition = Array.prototype.slice.call(mutations[0].addedNodes).some((node) => {
			if (node.classList) {
				return !node.classList.contains('md-ripple') && (node.nodeName !== '#comment') && !(node.nodeName === '#text' && node.nodeValue === '');
			}

			return false;
		});

		shouldReposition = shouldReposition || Array.prototype.slice.call(mutations[0].removedNodes).some((node) => {
			if (node.classList) {
				return !node.classList.contains('md-ripple') && (node.nodeName !== '#comment') && !(node.nodeName === '#text' && node.nodeValue === '');
			}

			return false;
		});

		return shouldReposition;
	}
	// #endregion
}
