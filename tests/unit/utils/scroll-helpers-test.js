import { distributeScroll, getAvailableScroll, getScrollDeltas, getScrollParent } from 'dummy/utils/scroll-helpers';
import { module, test } from 'qunit';

module('Unit | Utility | distribute-scroll', function() {
	// Replace this with your real tests.
	test('it works', function(assert) {
		let result = distributeScroll();
		assert.ok(result);
	});
});

module('Unit | Utility | get-available-scroll', function() {
	// Replace this with your real tests.
	test('it works', function(assert) {
		let result = getAvailableScroll();
		assert.ok(result);
	});
});

module('Unit | Utility | get-scroll-deltas', function() {
	// Replace this with your real tests.
	test('it works', function(assert) {
		let result = getScrollDeltas();
		assert.ok(result);
	});
});

module('Unit | Utility | get-scroll-parent', function() {
	// Replace this with your real tests.
	test('it works', function(assert) {
		let result = getScrollParent();
		assert.ok(result);
	});
});
