import Component from '@glimmer/component';
import debugLogger from 'ember-debug-logger';


export default class TwyrAutocompleteHighlightComponent extends Component {
	// #region Private Attributes
	debug = debugLogger('twyr-autocomplete-highlight');
	_element = null;
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);
	}
	// #endregion

	// #region Computed Properties
	get regExp() {
		const flags = this.args.flags || '';
		const text = this.args.searchText || '';

		return this._getRegExp(text, flags);
	}

	get tokens() {
		const labelString = `${this.args.label}`;
		const regExp = this.regExp;

		const tokens = [];
		let lastIndex = 0;

		// Use replace here, because it supports global and single regular expressions at same time.
		labelString.replace(regExp, (match, index) => {
			const prev = labelString.slice(lastIndex, index);
			if(prev) {
				tokens.push({
					'text': prev,
					'isMatch': false
				});
			}

			tokens.push({
				'text': match,
				'isMatch': true
			});

			lastIndex = index + match.length;
		});

		// Append the missing text as a token.
		const last = labelString.slice(lastIndex);
		if (last) {
			tokens.push({
				'text': last,
				'isMatch': false
			});
		}

		return tokens;
	}
	// #endregion

	// #region Private Methods
	_getRegExp(term, flags) {
		let startFlag = '';
		let endFlag = '';
		let regexTerm = this._sanitizeRegExp(term);

		if (flags.indexOf('^') >= 0)
			startFlag = '^';

		if (flags.indexOf('$') >= 0)
			endFlag = '$';

		return new RegExp(startFlag + regexTerm + endFlag, flags.replace(/[$^]/g, ''));
	}

	_sanitizeRegExp(term) {
		return term && term.toString().replace(/[\\^$*+?.()|{}[\]]/g, '\\$&');
	}
	// #endregion
}
