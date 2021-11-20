// It seems we aren't allowed to edit the network tab, so we'll make our own
chrome.devtools.panels.create("Dfinity Decoder",
    "icon.png",
    "panel.html",
    function () {}
);