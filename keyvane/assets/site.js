/* Keyvane website — the only script. No tracking, no cookies, no network calls.
   1. Marks the document as JS-enabled so the mobile menu can collapse.
   2. Toggles the mobile navigation.
   3. Turns "Coming soon" store buttons into real links once a data-url is set. */
(function () {
  'use strict';

  document.documentElement.className =
    document.documentElement.className.replace(/\bno-js\b/, 'js');

  function ready() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('site-nav');

    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        var open = nav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      nav.addEventListener('click', function (event) {
        if (event.target.tagName === 'A') {
          nav.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
    }

    var stores = document.querySelectorAll('a.store[data-url]');
    for (var i = 0; i < stores.length; i++) {
      var link = stores[i];
      var url = link.getAttribute('data-url');
      if (url) {
        link.setAttribute('href', url);
        link.setAttribute('rel', 'noopener');
        var soon = link.querySelector('.store-soon');
        if (soon) { soon.parentNode.removeChild(soon); }
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready);
  } else {
    ready();
  }
})();
