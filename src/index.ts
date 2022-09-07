console.info('Initializing devtools tab.');
chrome.devtools.panels.create(
    '∞ IC Inspector',
    'icon.png',
    'entries/devtools/index.html',
    function () {},
);
