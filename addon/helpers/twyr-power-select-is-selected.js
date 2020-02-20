import { helper } from '@ember/component/helper';
import { isArray as isEmberArray } from '@ember/array';
import { isEqual } from '@ember/utils';

export default helper(function twyrPowerSelectIsSelected(option, selectedOption) {
	if (selectedOption === undefined || selectedOption === null)
		return false;

	if (isEmberArray(selectedOption)) {
		for (let idx = 0; idx < selectedOption.length; idx++) {
			if (isEqual(selectedOption[idx], option))
				return true;
		}

		return false;
	}
	else {
		return isEqual(option, selectedOption);
	}
});
