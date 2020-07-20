(Focus => {

  const focusHiddenElements = new Set();
  const zones = new Set();
  let activeZone = null;
  let lastActiveElement = null;

  // all elements that can receive focus
  // iframe is included so it can be specially handled,
  // as iframes provide unique challenges to manually controlling focus
  const focusQuery =
    ['button', 'a[href]', 'area[href]', 'input', 'select', 'textarea', '[tabindex]', 'iframe']
    .map(target => target + ':not([tabindex="-1"]):not([disabled])')
    .join(', ');

  const focusableChildren = element =>
    Array.from(element.querySelectorAll(focusQuery));
  
  const isTabbable = element => {
    do {
      let style = window.getComputedStyle(element);
      if (style.display === 'none') return false;
      if (style.visibility === 'hidden') return false;
      element = element.parentElement;
    } while (element !== document.body);
    return true;
  };

  const tabbableChildren = element =>
    focusableChildren(element).filter(isTabbable);
  
  const hideElementFromFocus = element => {
    const originalTabIndex = element.getAttribute('tabindex');
    if (originalTabIndex) {
      element.dataset.originalTabIndex = originalTabIndex;
    }
    element.setAttribute('tabindex', -1);
    focusHiddenElements.add(element);
  };

  const restoreFocusHiddenElements = () => {
    for (const element of focusHiddenElements) {
      const { originalTabIndex } = element.dataset;
      if (originalTabIndex) {
        element.setAttribute('tabindex', element.dataset.originalTabIndex);
      }
      else {
        element.removeAttribute('tabindex');
      }
      delete element.dataset.originalTabIndex;
    }
    focusHiddenElements.clear();
  };

  const hideExternalElementsFromFocus = zoneElement => {
    const tabbableElements = tabbableChildren(document.body);
    for (const element of tabbableElements) {
      if (zoneElement !== element && !zoneElement.contains(element)) {
        hideElementFromFocus(element);
      }
    }
  };

  const hideAllZonesFromFocus = () => {
    for (const zoneElement of zones) {
      const tabbableZoneChildren = tabbableChildren(zoneElement);
      for (const element of tabbableZoneChildren) {
        hideElementFromFocus(element);
      }
    }
  };

  const getZoneEdges = (element) => {
    const bumperStart = activeZone.querySelector('[data-zone-role="bumper-start"]');
    const bumperEnd = activeZone.querySelector('[data-zone-role="bumper-end"]');
    const elementTabbableChildren = tabbableChildren(activeZone).filter(element => !element.dataset.zoneRole);
    const firstFocusChild = elementTabbableChildren[0];
    const lastFocusChild = elementTabbableChildren[elementTabbableChildren.length - 1];
    return { bumperStart, bumperEnd, firstFocusChild, lastFocusChild };
  }

  const focusZone = element => {
    lastActiveElement = document.activeElement;
    restoreFocusHiddenElements();
    hideExternalElementsFromFocus(element);
    activeZone = element;
    if (element.matches(focusQuery)) {
      element.focus();
    }
    else {
      const { firstFocusChild } = getZoneEdges(activeZone);
      firstFocusChild.focus();
    }
  };

  const blurZone = element => {
    if (activeZone === element) {
      restoreFocusHiddenElements();
      hideAllZonesFromFocus();
      activeZone = null;
      (lastActiveElement || tabbableChildren(document.body)[0]).focus();
    }
  };

  const shiftTabHandler = event => {
    if (activeZone) {
      const { bumperStart, firstFocusChild, lastFocusChild } = getZoneEdges(activeZone);
      if (event.target === bumperStart || event.target === firstFocusChild) {
        event.preventDefault();
        lastFocusChild.focus();
      }
    }
  };

  const tabHandler = event => {
    if (activeZone) {
      const { bumperEnd, firstFocusChild, lastFocusChild } = getZoneEdges(activeZone);
      if (event.target === bumperEnd || event.target === lastFocusChild) {
        event.preventDefault();
        firstFocusChild.focus();
      }
    }
  };

  const escapeHandler = () => {
    if (activeZone) blurZone(activeZone);
  };

  const keydownListener = event => {
    if (event.keyCode === 9) {
      if (event.shiftKey) {
        shiftTabHandler(event);
      }
      else {
        tabHandler(event);
      }
    }
    else if (event.keyCode === 27) {
      escapeHandler();
    }
  };

  document.addEventListener('keydown', keydownListener);

  const addBumpers = element => {
    const bumperStart = document.createElement('input');
    bumperStart.style.opacity = '0';
    bumperStart.style.position = 'absolute';
    bumperStart.dataset.zoneRole = 'bumper-start';
    element.prepend(bumperStart);
    bumperStart.addEventListener('focus', function() {
      const { lastFocusChild } = getZoneEdges(activeZone);
      lastFocusChild.focus();
    });

    const bumperEnd = document.createElement('input');
    bumperEnd.style.opacity = '0';
    bumperEnd.style.position = 'absolute';
    bumperEnd.dataset.zoneRole = 'bumper-end';
    element.append(bumperEnd);
    bumperEnd.addEventListener('focus', function() {
      const { firstFocusChild } = getZoneEdges(activeZone);
      firstFocusChild.focus();
    });
  };

  const removeBumpers = element => {
    const bumperStart = element.querySelector('[zone-role="bumper-start"]');
    bumperStart.remove();
    const bumperEnd = element.querySelector('[zone-role="bumper-end"]');
    bumperEnd.remove();
  };
  
  Focus.createZone = element => {
    restoreFocusHiddenElements();
    addBumpers(element);
    zones.add(element);
    hideAllZonesFromFocus();
    return {
      focus: () => focusZone(element),
      blur: () => blurZone(element),
    };
  };

  Focus.destroyZone = element => {
    restoreFocusHiddenElements();
    removeBumpers(element);
    zones.delete(element);
    hideAllZonesFromFocus();
  };

})(window.Focus = {});
