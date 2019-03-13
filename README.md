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

## Contributing

Want to contribute? Create a pull request!

Here's the to-do list:
1. When the user clicks/touches into a zone, make that zone the active zone.
1. When the user clicks/touches out of a zone, cancel its active status.
1. When a zone is blurred, attempt to return focus in this priority:
    1. The previous active element (tracked if zone was focused programmatically).
    1. The previous tabbable element in the DOM, before this zone.
    1. The first tabbable element in the body.
