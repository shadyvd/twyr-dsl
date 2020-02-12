import debugLogger from 'ember-debug-logger';
import { helper } from '@ember/component/helper';

export default helper(function assign(params, { merge }) {
	const debug = debugLogger('twyr-assign-helper');

	if(merge) {
		debug(`merge:true, returning: `, Object.assign(...params));
		return Object.assign(...params);
	}

	debug(`merge:false, returning: `, Object.assign({}, ...params));
	return Object.assign({}, ...params);
});
