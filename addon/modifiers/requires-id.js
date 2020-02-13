import debugLogger from 'ember-debug-logger';

import { modifier } from 'ember-modifier';
import { uuid } from 'ember-cli-uuid';

export default modifier(function requiresId(element/*, params, hash*/) {
	const debug = debugLogger('twyr-requires-id-modifier');
	const id = uuid();

	if(!element.hasAttribute('id')) {
		debug(`element: `, element, `, id: ${id}`);
		element.setAttribute('id', id);

		return;
	}

	if(!this.args.named.concat) {
		debug(`element: `, element, `, id: ${id}`);
		element.setAttribute('id', id);

		return;
	}

	let elementId = id;
	const append = this.args.named.append !== false && this.args.named.prepend !== true;

	if(append)
		elementId = `${element.getAttribute('id')}-${id}`;
	else
		elementId = `${id}-${element.getAttribute('id')}`;

	debug(`element: `, element, `, id: ${elementId}`);
	element.setAttribute('id', elementId);
});
