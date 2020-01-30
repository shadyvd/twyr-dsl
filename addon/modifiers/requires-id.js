import debugLogger from 'ember-debug-logger';

import { modifier } from 'ember-modifier';
import { uuid } from 'ember-cli-uuid';

export default modifier(function requiresId(element/*, params, hash*/) {
	const debug = debugLogger('twyr-requires-id-modifier');
	const id = uuid();

	if(element.getAttribute('id'))
		return;

	debug(`element: `, element, `, id: ${id}`);
	element.setAttribute('id', id);
});
