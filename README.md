# Focus

This module allows better control of document focus for accessibility and general UX improvements.

Use it to trap focus in a modal or another active section of a webpage.

Use it to seal off portions of the DOM so users don't accidentally tab into them. Content hidden in sliders, tabs, accordions, modals, etc. will no longer hinder your keyboard users.

Use it like so:

```html
<!-- Drop it in your HTML -->
<script src="focus.js"></script>
```

```js
// Create focus zones separate from the regular DOM
const hiddenForm = document.getElementById('hidden-form');
Focus.createZone(hiddenForm);

// Store a reference to the zone to easily move focus in/out
const modal = document.querySelector('.js-modal');
const modalZone = Focus.createZone(modal);

const modalOpenButton = document.querySelector('.js-modal-open');
const modalCloseButton = document.querySelector('.js-modal-close');

modalOpenButton.addEventListener('click', () => {
  modal.classList.add('open');
  modalZone.focus();
});
modalCloseButton.addEventListener('click', () => {
  modal.classList.remove('open');
  modalZone.blur();
});
```

See `demo.html` for a working demo.

## Roadmap

1. Maintain a stack of zone contexts. For example, one modal can open another -- an edit modal might open an "are you sure?" modal if the user attempts to close it without saving changes. In this case, when the "are you sure?" modal closes, the edit modal should regain focus -- not just the active element, but the modal itself should again have focus trapped inside it.
1. When creating a zone, allow an additional `options` object:
    1. `options.trap: boolean (default: true)`: If true, focus will be trapped in the zone, and after tabbing to the last element in the zone, the next element in the tab order will be the first tabbable element in the zone, and vice versa.
    1. `options.onFocus: Function`: A function that executes when the zone is focused. Useful for animations and side effects. Helpful to consolidate this logic for a zone that might be opened from several locations in code.
    1. `options.onBlur: Function`: A function that executes when the zone is blurred. Especially useful if focus is not trapped in the zone. For example, tabbing out of a dropdown menu could close the menu.
1. When a zone is blurred, attempt to return focus in this priority (for smoother user experience, to avoid jarring context changes):
    1. The previous zone, if there is one.
    1. The previous active element (tracked if zone was focused programmatically).
    1. The previous tabbable element in the DOM, before this zone.
    1. The first tabbable element in the body.
