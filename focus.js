(Focus => {

  const zones = new Set();
  let activeZone = null;
  let lastActiveElement = null;

  const focusQuery =
    ['button', 'a[href]', 'area[href]', 'input', 'select', 'textarea', '[tabindex]']
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

  const focusZone = element => {
    lastActiveElement = document.activeElement;
    activeZone = element;
    if (element.matches(focusQuery)) {
      element.focus();
    }
    else {
      elementTabbableChildren = tabbableChildren(element);
      if (elementTabbableChildren.length) elementTabbableChildren[0].focus();
    }
  };

  const blurZone = element => {
    if (activeZone === element) {
      activeZone = null;
      (lastActiveElement || tabbableChildren(document.body)[0]).focus();
    }
  };

  const ensureZoneFocused = event => {
    if (!activeZone.contains(event.target)) {
      focusZone(activeZone);
      return false;
    }
    return true;
  }

  const activeZonePrevious = event => {
    if (!ensureZoneFocused(event)) return;
    const tabbableZoneElements = tabbableChildren(activeZone);
    const index = tabbableZoneElements.indexOf(event.target);
    let previousIndex = index - 1;
    if (previousIndex === -1) previousIndex = tabbableZoneElements.length - 1;
    tabbableZoneElements[previousIndex].focus();
  };

  const activeZoneNext = event => {
    if (!ensureZoneFocused(event)) return;
    const tabbableZoneElements = tabbableChildren(activeZone);
    const index = tabbableZoneElements.indexOf(event.target);
    let nextIndex = index + 1;
    if (nextIndex === tabbableZoneElements.length) nextIndex = 0;
    tabbableZoneElements[nextIndex].focus();
  };

  const allTabbableZoneElements = () => {
    let tabbableZoneElements = [];
    for (let zone of zones) {
      tabbableZoneElements = [...tabbableZoneElements, ...tabbableChildren(zone)];
    }
    return tabbableZoneElements;
  };

  const allTabbableOuterElements = () => {
    let tabbableZoneElements = allTabbableZoneElements();
    let tabbableElements = tabbableChildren(document.body);
    tabbableOuterElements = tabbableElements.filter(element => {
      return !tabbableZoneElements.includes(element);
    });
    return tabbableOuterElements;
  }

  const outerFocusPrevious = event => {
    const tabbableOuterElements = allTabbableOuterElements();
    if (!tabbableOuterElements.includes(event.target)) {
      return tabbableOuterElements[0].focus();
    }
    const index = tabbableOuterElements.indexOf(event.target);
    let previousIndex = index - 1;
    if (previousIndex === -1) previousIndex = tabbableOuterElements.length - 1;
    tabbableOuterElements[previousIndex].focus();
  };

  const outerFocusNext = event => {
    const tabbableOuterElements = allTabbableOuterElements();
    if (!tabbableOuterElements.includes(event.target)) {
      return tabbableOuterElements[0].focus();
    }
    const index = tabbableOuterElements.indexOf(event.target);
    let nextIndex = index + 1;
    if (nextIndex === tabbableOuterElements.length) nextIndex = 0;
    tabbableOuterElements[nextIndex].focus();
  };

  const shiftTabHandler = event => {
    if (activeZone) activeZonePrevious(event);
    else outerFocusPrevious(event);
  };

  const tabHandler = event => {
    if (activeZone) activeZoneNext(event);
    else outerFocusNext(event);
  };

  const escapeHandler = () => {
    if (activeZone) blurZone(activeZone);
  };

  const keydownListener = event => {
    if (event.keyCode === 9) {
      event.preventDefault();
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
  
  Focus.createZone = element => {
    zones.add(element);
    return {
      focus: () => focusZone(element),
      blur: () => blurZone(element),
    };
  };

  Focus.destroyZone = element => {
    return zones.delete(element);
  };

})(window.Focus = {});
