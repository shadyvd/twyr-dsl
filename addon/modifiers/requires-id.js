import { modifier } from 'ember-modifier';
import {uuid} from 'ember-cli-uuid';

export default modifier(function requiresId(element/*, params, hash*/) {
	if(element.getAttribute('id')) return;
	element.setAttribute('id', uuid());
});
