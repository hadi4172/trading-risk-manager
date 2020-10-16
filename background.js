chrome.browserAction.onClicked.addListener((tab) => {
    chrome.windows.create({ 'url': 'popup.html', 'type': 'popup', 'width': 420, 'height': 275 }, function (window) {
    });
});

chrome.browserAction.setTitle({
    title: 'Open a manager window'
});