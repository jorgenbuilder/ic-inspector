console.info('Initializing devtools tab.');
chrome.devtools.panels.create(
    '∞ Decoder',
    'icon.png',
    'devtools/index.html',
    function () {},
);
