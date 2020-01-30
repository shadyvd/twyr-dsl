import Modifier from 'ember-modifier';
import debugLogger from 'ember-debug-logger';

import { isPresent } from '@ember/utils';

export default class DidMutateModifier extends Modifier {
	// #region Private Attributes
	debug = debugLogger('twyr-did-mutate-modifier');

	_observer = null;
	// #endregion

	// #region Constructor
	constructor() {
		super(...arguments);
		this.debug(`constructor`);

		this._observer = new MutationObserver(this.args.named.onMutate);
	}
	// #endregion

	// #region Lifecycle Hooks
	didReceiveArguments() {
		super.didReceiveArguments(...arguments);
		this.debug(`didReceiveArguments: `, this.args);

		const options = {
			'attributeFilter': this.attributeFilter,
			'attributeOldValue': this.attributeOldValue,
			'attributes': this.attributes,
			'characterData': this.characterData,
			'characterDataOldValue': this.characterDataOldValue,
			'childList': this.childList,
			'subtree': this.subtree
		};

		this._observer.observe(this.element, options);
	}

	willRemove() {
		this.debug(`willRemove`);
		super.willRemove(...arguments);

		if(!this._observer)
			return;

		this._observer.disconnect();
		this._observer = null;
	}
	// #endregion

	// #region Computed Properties
	get attributeFilter() {
		if(isPresent(this.args.named.attributeFilter))
			return this.args.named.attributeFilter;

		return ['disabled'];
	}

	get attributeOldValue() {
		if(isPresent(this.args.named.attributeOldValue))
			return !!this.args.named.attributeOldValue;

		return false;
	}

	get attributes() {
		if(isPresent(this.args.named.attributes))
			return !!this.args.named.attributes;

		return true;
	}

	get characterData() {
		if(isPresent(this.args.named.characterData))
			return !!this.args.named.characterData;

		return false;
	}

	get characterDataOldValue() {
		if(isPresent(this.args.named.characterDataOldValue))
			return !!this.args.named.characterDataOldValue;

		return false;
	}

	get childList() {
		if(isPresent(this.args.named.childList))
			return !!this.args.named.childList;

		return false;
	}

	get subtree() {
		if(isPresent(this.args.named.subtree))
			return !!this.args.named.subtree;

		return false;
	}
	// #endregion
}
