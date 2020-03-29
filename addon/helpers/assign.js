import debugLogger from 'ember-debug-logger';
import { helper } from '@ember/component/helper';

export default helper(function assign(params, { merge }) {
	const debug = debugLogger('twyr-assign-helper');
	const paramsArray = [...params].filter((param) => {
		return !!param;
	});

	if(merge) {
		debug(`merge:true, returning: `, Object.assign(...paramsArray));
		return Object.assign(...paramsArray);
	}

	debug(`merge:false, returning: `, Object.assign({}, ...paramsArray));
	return Object.assign({}, ...paramsArray);
});
