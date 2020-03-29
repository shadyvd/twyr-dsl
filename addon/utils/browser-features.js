// Taken from https://github.com/Modernizr/Modernizr/blob/master/feature-detects/dom/passiveeventlisteners.js
/* eslint-disable */
export const supportsPassiveEventListeners = (function () {
	let supportsPassiveOption = false;
	try {
		let opts = Object.defineProperty({}, 'passive', {
			get: function () {
				supportsPassiveOption = true;
				return supportsPassiveOption;
			}
		});

		const noop = function () {};

		window.addEventListener('testPassiveEventSupport', noop, opts);
		window.removeEventListener('testPassiveEventSupport', noop, opts);
	}
	catch(err) {
	}

	return supportsPassiveOption;
})();
