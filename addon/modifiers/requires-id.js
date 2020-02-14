import debugLogger from 'ember-debug-logger';

import { modifier } from 'ember-modifier';
import { uuid } from 'ember-cli-uuid';

export default modifier(function requiresId(element, positionalParams, namedParams) {
	const debug = debugLogger('twyr-requires-id-modifier');
	const id = uuid();

	if(!element.hasAttribute('id')) {
		debug(`element: `, element, `, id: ${id}`);
		element.setAttribute('id', id);

		return;
	}

	if(!namedParams.concat) {
		debug(`element: `, element, `, id: ${id}`);
		element.setAttribute('id', id);

		return;
	}

	let elementId = id;
	const append = namedParams.append !== false && namedParams.prepend !== true;

	if(append)
		elementId = `${element.getAttribute('id')}-${id}`;
	else
		elementId = `${id}-${element.getAttribute('id')}`;

	debug(`element: `, element, `, id: ${elementId}`);
	element.setAttribute('id', elementId);
});
