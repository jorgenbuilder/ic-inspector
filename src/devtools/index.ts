console.log('Initializing devtools tab.')
// It seems we aren't allowed to edit the network tab, so we'll make our own
/* eslint-disable @typescript-eslint/no-empty-function */
chrome.devtools.panels.create(
  '∞ Decoder',
  'icon.png',
  'devtools/panel/index.html',
  function () {},
)
