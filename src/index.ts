console.info('Initializing devtools tab.');
chrome.devtools.panels.create(
    '∞ Decoder',
    'icon.png',
    'entries/devtools/index.html',
    function () {},
);
