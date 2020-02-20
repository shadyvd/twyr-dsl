import debugLogger from 'ember-debug-logger';

import { helper } from '@ember/component/helper';
import { isGroup } from 'twyr-dsl/utils/power-select-utilities';

export default helper(function twyrPowerSelectIsGroup(maybeGroup) {
	const debug = debugLogger('twyr-power-select-is-group-helper');

	debug(`maybeGroup: `, maybeGroup[0], `\nisGroup? `, isGroup(maybeGroup[0]));
	return isGroup(maybeGroup[0]);
});
