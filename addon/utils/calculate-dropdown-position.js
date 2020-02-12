const calculateInPlacePosition = function calculateInPlacePosition(destinationElement, triggerElement, contentElement, options) {
	const positionData = {};

	const contentRect = contentElement.getBoundingClientRect();
	const triggerRect = triggerElement.getBoundingClientRect();

	// Horizontal Positioning...
	if((options.xAlign === 'auto') || options.xAlign === 'auto-left') {
		const viewportRight = window.pageXOffset + window.innerWidth;
		positionData.xAlign = ((triggerRect.left + contentRect.width) > viewportRight) ? 'right' : 'left';
	}

	if (options.xAlign === 'auto-right') {
		positionData.xAlign = (triggerRect.right > contentRect.width) ? 'right' : 'left';
	}

	if(options.xAlign === 'left') {
		positionData.xAlign = 'left';
	}

	if(options.xAlign === 'right') {
		positionData.xAlign = 'right';
	}

	if(options.xAlign === 'center') {
		positionData.xAlign = 'center';
		positionData.style = { 'left': (triggerRect.width - contentRect.width) / 2 };
	}

	// Vertical Positioning...
	if(options.yAlign === 'above') {
		positionData.yAlign = options.yAlign;
		positionData.style = { 'top': -contentRect.height };
	}
	else {
		positionData.yAlign = 'below';
	}

	return positionData;
};

const calculateWormholedPosition = function calculateWormholedPosition(destinationElement, triggerElement, contentElement, options) {
	const positionData = {};

	// Input Elements
	const contentRect = contentElement.getBoundingClientRect();
	const triggerRect = triggerElement.getBoundingClientRect();

	// Collect information about all the involved DOM elements
	const currentWindowScroll = { 'left': window.pageXOffset, 'top': window.pageYOffset };
	const currentViewportWidth = document.body.clientWidth || window.innerWidth;

	// Trigger Positioning
	let triggerLeft = triggerRect.left;
	let triggerTop = triggerRect.top;
	const triggerHeight = triggerRect.height;
	const triggerWidth = triggerRect.width;

	// Content Positioning
	const contentHeight = contentRect.height;
	let contentWidth = contentRect.width;

	// Apply containers' offset
	let anchorElement = destinationElement.parentNode;
	let anchorPosition = window.getComputedStyle(anchorElement).position;
	while (anchorPosition !== 'relative' && anchorPosition !== 'absolute' && anchorElement.tagName.toUpperCase() !== 'BODY') {
		anchorElement = anchorElement.parentNode;
		anchorPosition = window.getComputedStyle(anchorElement).position;
	}

	if (anchorPosition === 'relative' || anchorPosition === 'absolute') {
		const anchorRect = anchorElement.getBoundingClientRect();

		triggerLeft = triggerLeft - anchorRect.left;
		triggerTop = triggerTop - anchorRect.top;

		const anchorOffsetParent  = anchorElement.offsetParent;
		if (anchorOffsetParent) {
			triggerLeft -= anchorOffsetParent.scrollLeft;
			triggerTop -= anchorOffsetParent.scrollTop;
		}
	}

	// Calculate drop down width
	contentWidth = options.matchTriggerWidth ? triggerWidth : contentWidth;
	positionData.width = contentWidth;

	// Calculate horizontal position
	const triggerLeftWithScroll = triggerLeft + currentWindowScroll.left;
	if(!options.xAlign || (options.xAlign === 'auto') || (options.xAlign === 'auto-left')) {
		// Calculate the number of visible horizontal pixels if we were to place the
		// dropdown on the left and right
		let leftVisible = Math.min(currentViewportWidth, triggerLeft + contentWidth) - Math.max(0, triggerLeft);
		let rightVisible = Math.min(currentViewportWidth, triggerLeft + triggerWidth) - Math.max(0, triggerLeft + triggerWidth - contentWidth);

		if ((contentWidth > leftVisible) && (rightVisible > leftVisible)) {
			// If the drop down won't fit left-aligned, and there is more space on the
			// right than on the left, then force right-aligned
			positionData.xAlign = 'right';
		}
		else if ((contentWidth > rightVisible) && (leftVisible > rightVisible)) {
			// If the drop down won't fit right-aligned, and there is more space on
			// the left than on the right, then force left-aligned
			positionData.xAlign = 'left';
		}
		else {
			// Keep same position as previous
			positionData.xAlign = options.xAlign || 'left';
		}
	}

	if(options.xAlign === 'auto-right') {
		// Calculate the number of visible horizontal pixels if we were to place the
		// dropdown on the left and right
		const leftVisible = Math.min(currentViewportWidth, triggerLeft + contentWidth) - Math.max(0, triggerLeft);
		const rightVisible = Math.min(currentViewportWidth, triggerLeft + triggerWidth) - Math.max(0, triggerLeft + triggerWidth - contentWidth);

		if ((contentWidth > rightVisible) && (leftVisible > rightVisible)) {
			// If the drop down won't fit right-aligned, and there is more space on the
			// left than on the right, then force left-aligned
			positionData.xAlign = 'left';
		}
		else if ((contentWidth > leftVisible) && (rightVisible > leftVisible)) {
			// If the drop down won't fit left-aligned, and there is more space on
			// the right than on the left, then force right-aligned
			positionData.xAlign = 'right';
		}
		else {
			// Keep same position as previous
			positionData.xAlign = options.xAlign || 'right';
		}
	}

	if (positionData.xAlign === 'center') {
		positionData.left = triggerLeftWithScroll + (triggerWidth - contentWidth) / 2;
	}
	else if(positionData.xAlign === 'right') {
		positionData.right = currentViewportWidth - (triggerLeftWithScroll + triggerWidth);
	}
	else {
		positionData.left = triggerLeftWithScroll;
	}

	// Calculate vertical position

	/**
	 * Fixes bug where the content always stays on the same position on the screen when
	 * the <body> is relatively positioned
	 */
	const isBodyPositionRelative = (window.getComputedStyle(document.body).position === 'relative');
	const triggerTopWithScroll = isBodyPositionRelative ? triggerTop : (triggerTop + currentWindowScroll.top);

	const viewportBottom = currentWindowScroll.top + window.innerHeight;
	const enoughRoomBelow = (triggerTopWithScroll + triggerHeight + contentHeight) < viewportBottom;
	const enoughRoomAbove = (triggerTop > contentHeight);

	if (options.yAlign === 'below' && !enoughRoomBelow && enoughRoomAbove) {
		positionData.yAlign = 'above';
	}
	else if (options.yAlign === 'above' && !enoughRoomAbove && enoughRoomBelow) {
		positionData.yAlign = 'below';
	}
	else if (options.yAlign === 'auto') {
		positionData.yAlign = enoughRoomBelow ? 'below' : 'above';
	}
	else {
		positionData.yAlign = options.yAlign;
	}

	positionData.top = triggerTopWithScroll + (positionData.yAlign === 'below' ? triggerHeight : -contentHeight);

	if (positionData.yAlign === 'above') {
		positionData.top = triggerTopWithScroll - contentHeight;
	}
	else if (positionData.yAlign === 'below') {
		positionData.top = triggerTopWithScroll + triggerHeight;
	}

	return positionData;
};

export function calculateDropdownPosition(destinationElement, triggerElement, contentElement, options) {
	const func = options.renderInPlace ? calculateInPlacePosition : calculateWormholedPosition;
	return func(destinationElement, triggerElement, contentElement, options);
}
